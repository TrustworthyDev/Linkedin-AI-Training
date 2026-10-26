// Review-frame harness shared by all UI Berry tools.
// Serves a saved site inside the same sandboxed iframe the task page uses, and acts only through
// real mouse/keyboard input. Missing images can be swapped for a labeled "MISSING" placeholder.
const puppeteer = require('puppeteer-core');
const http = require('http'); const fs = require('fs'); const path = require('path');

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';
const TYPES = {
  '.html': 'text/html', '.htm': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.download': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary',
};
const IMG_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const withTimeout = (p, ms, label = 'op') => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`TIMEOUT ${label}`)), ms))]);

function sniffType(file) {
  const ext = path.extname(file).toLowerCase();
  if (TYPES[ext]) return TYPES[ext];
  if (/css/i.test(path.basename(file))) return 'text/css';
  try { const head = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' }).slice(0, 200).trimStart(); return head.startsWith('<') ? 'text/html' : 'text/javascript'; } catch { return 'application/octet-stream'; }
}

function placeholderSvg(name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#3b3b3b"/><text x="600" y="410" fill="#c8c8c8" font-family="Arial" font-size="40" text-anchor="middle">MISSING ${name.replace(/[<&>]/g, '')}</text></svg>`;
}

// open(root, file, opts) -> api. opts: width, height, sandbox (default true), placeholders (default false)
async function open(ROOT, FILE, { width = 1000, height = 800, sandbox = true, placeholders = false, dl } = {}) {
  const missing = new Set();
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/__wrap') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(`<!doctype html><html><body style="margin:0;background:#fff"><iframe id="site" ${sandbox ? `sandbox="${SANDBOX}"` : ''} src="/${encodeURIComponent(FILE)}" style="border:0;display:block;width:${width}px;height:${height}px"></iframe></body></html>`);
    }
    let f = path.join(ROOT, u);
    if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      const alt = path.join(ROOT, path.basename(u)); // "/images/x.jpg" saved as "./x.jpg"
      if (fs.existsSync(alt) && !fs.statSync(alt).isDirectory()) f = alt;
      else {
        if (u !== '/favicon.ico') missing.add(u);
        if (placeholders && IMG_EXT.test(u)) { res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); return res.end(placeholderSvg(path.basename(u))); }
        res.writeHead(404); return res.end();
      }
    }
    res.writeHead(200, { 'Content-Type': sniffType(f) }); fs.createReadStream(f).pipe(res);
  }).listen(0);

  let browser;
  for (let attempt = 0; attempt < 3 && !browser; attempt++) {
    try {
      browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', protocolTimeout: 90000,
        args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio'] });
    } catch (e) { if (attempt === 2) throw e; await sleep(1500 + attempt * 1500); }
  }
  const page = await browser.newPage(); await page.setViewport({ width, height });
  const log = [];
  if (dl) { fs.mkdirSync(dl, { recursive: true }); const cdp = await page.createCDPSession(); await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl }); }
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/404|ERR_FAILED|CORS/.test(t)) log.push(`[console.error] ${t.slice(0, 200)}`); });
  page.on('pageerror', e => log.push(`[pageerror] ${e.message.slice(0, 200)}`));
  browser.on('targetcreated', async t => { if (t.type() === 'page') { const p = await t.page().catch(() => null); if (p && p !== page) { log.push('[popup] ' + p.url().slice(0, 120)); p.close().catch(() => {}); } } });
  await page.goto(`http://localhost:${server.address().port}/__wrap`, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => log.push('goto ' + e.message));
  await sleep(2500);
  const frame = page.frames().find(f => f !== page.mainFrame());

  const api = {
    page, frame, log, browser, missing,
    // evaluate in the site frame with a hard timeout (heavy WebGL pages can stall the protocol)
    async ev(fn, ...args) { try { return await withTimeout(frame.evaluate(fn, ...args), 10000, 'evaluate'); } catch (e) { return 'TIMEOUT'; } },
    async text() { const t = await api.ev(() => document.body.innerText); return t === 'TIMEOUT' ? '' : t; },
    diffText(before, after, n = 10) { return after.split('\n').map(l => l.trim()).filter(l => l && !before.includes(l)).slice(0, n).join(' | '); },
    // find by {css} or by {label|text} (aria-label first, then visible text), optional {sel} scope selector
    async find(q) {
      if (q.css) return frame.$(q.css);
      const h = await frame.evaluateHandle(q => {
        const norm = s => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
        const els = [...document.querySelectorAll(q.sel || 'button,a,[role=button],[role=tab],[role=switch],[role=menuitem],[role=option],[role=radio],input,label,summary')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        const t = norm(q.text || q.label);
        return els.find(e => norm(e.getAttribute('aria-label')) === t) || els.find(e => norm(e.innerText) === t) || els.find(e => norm(e.innerText).startsWith(t)) || els.find(e => norm(e.getAttribute('aria-label')).startsWith(t)) || null;
      }, q);
      return h.asElement();
    },
    // real mouse click at the element centre; logs when something else sits on top
    async clickEl(el, wait = 900) {
      await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })).catch(() => {}); await sleep(250);
      const bb = await el.boundingBox(); if (!bb) return false;
      const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      const own = await el.evaluate((e, x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); }, cx, cy).catch(() => true);
      await page.mouse.click(cx, cy); await sleep(wait);
      return own ? 'ok' : 'covered';
    },
    async click(q, wait = 900) { const el = await api.find(q); if (!el) { log.push(`CLICK ${JSON.stringify(q)} NOT FOUND`); return null; } await api.clickEl(el, wait); return el; },
    async hover(x, y, wait = 500) { await page.mouse.move(x, y, { steps: 4 }); await sleep(wait); },
    async dialogs() { const d = await api.ev(() => [...document.querySelectorAll('[role=dialog],[role=alertdialog],dialog[open],[aria-modal=true]')].filter(d => { const r = d.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(d).visibility !== 'hidden'; }).map(d => d.innerText.replace(/\s+/g, ' ').slice(0, 220))); return d === 'TIMEOUT' ? [] : d; },
    // only VISIBLE status text (sr-only regions are excluded: reviewers can't see them)
    async toasts() { const t = await api.ev(() => [...new Set([...document.querySelectorAll('[role=status],[role=alert],[aria-live]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).opacity !== '0'; }).map(e => e.innerText.trim().replace(/\s+/g, ' ')).filter(Boolean))].join(' || ').slice(0, 220)); return t === 'TIMEOUT' ? '' : t; },
    async closeOverlays() { await page.keyboard.press('Escape').catch(() => {}); await sleep(400); if ((await api.dialogs()).length) { const c = await frame.$('[role=dialog] [aria-label*=close i], dialog[open] [aria-label*=close i], [aria-modal=true] [aria-label*=close i]'); if (c) await api.clickEl(c, 400).catch(() => {}); } },
    async shot(file, clip) { await page.screenshot({ path: file, ...(clip ? { clip } : {}) }); },
    async close() { await browser.close().catch(() => {}); server.close(); },
  };
  return api;
}

module.exports = { open, sleep, withTimeout, CHROME, SANDBOX };
