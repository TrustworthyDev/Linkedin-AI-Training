// Review-frame harness: serves a wrapper page with the same sandboxed iframe the task page uses (W x 800),
// and exposes helpers that act ONLY through real mouse/keyboard input (no element.click()).
const puppeteer = require('puppeteer-core'); const http = require('http'); const fs = require('fs'); const path = require('path');
const SANDBOX = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.download': 'text/javascript', '.webp': 'image/webp' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open(ROOT, FILE, { width = 1000, height = 800, sandbox = true, dl } = {}) {
  ROOT = path.resolve(ROOT); // turns forward-slash paths into Windows form so the startsWith guard below works
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    if (u === '/__wrap') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(`<!doctype html><html><body style="margin:0;background:#fff"><iframe id="site" ${sandbox ? `sandbox="${SANDBOX}"` : ''} src="/${encodeURIComponent(FILE)}" style="border:0;display:block;width:${width}px;height:${height}px"></iframe></body></html>`);
    }
    const f = path.join(ROOT, u);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || (/css2/.test(f) ? 'text/css' : 'text/html') }); fs.createReadStream(f).pipe(res);
  }).listen(0);
  const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 30000, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage(); await page.setViewport({ width, height });
  const log = [];
  if (dl) { fs.mkdirSync(dl, { recursive: true }); const cdp = await page.createCDPSession(); await cdp.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl, eventsEnabled: true }); cdp.on('Browser.downloadWillBegin', e => log.push('[download begins] ' + e.suggestedFilename)); }
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' || /disallowed|sandbox/i.test(t)) log.push(`[console.${m.type()}] ${t.slice(0, 220)}`); });
  page.on('pageerror', e => log.push(`[pageerror] ${e.message}`));
  page.on('popup', pp => log.push('[popup] ' + pp.url().slice(0, 120)));
  await page.goto(`http://localhost:${server.address().port}/__wrap`, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(2000);
  const frame = page.frames().find(f => f !== page.mainFrame());
  const api = {
    page, frame, log, browser,
    // find an element in the frame by css, aria-label or visible text; returns handle
    async find(q) {
      if (q.css) return frame.$(q.css);
      const h = await frame.evaluateHandle(q => {
        const norm = s => (s || '').trim().replace(/\s+/g, ' ').toLowerCase();
        const els = [...document.querySelectorAll(q.sel || 'button,a,[role=button],[role=tab],[role=switch],[role=menuitem],[role=option],input,label,summary')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
        const t = norm(q.text || q.label);
        return els.find(e => norm(e.getAttribute('aria-label')) === t) || els.find(e => norm(e.innerText) === t) || els.find(e => norm(e.innerText).startsWith(t)) || els.find(e => norm(e.getAttribute('aria-label')).startsWith(t)) || null;
      }, q);
      return h.asElement();
    },
    // real click at the element centre after scrolling it into view; reports what is actually on top at that point
    async click(q, wait = 900) {
      const el = await api.find(q); if (!el) { log.push(`CLICK ${JSON.stringify(q)} NOT FOUND`); return null; }
      await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(250);
      const bb = await el.boundingBox(); if (!bb) { log.push(`CLICK ${JSON.stringify(q)} no box`); return null; }
      const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      const top = await frame.evaluate((x, y, ) => { const t = document.elementFromPoint(x, y); return t ? (t.closest('button,a,[role]') || t).outerHTML.slice(0, 90) : 'none'; }, cx - (await frame.evaluate(() => 0)), cy);
      const own = await el.evaluate((e, x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); }, cx, cy);
      const offscreen = cx < 0 || cy < 0 || cx > (await page.viewport()).width || cy > (await page.viewport()).height;
      await page.mouse.click(cx, cy); await sleep(wait);
      if (!own || offscreen) log.push(`  ! click on ${JSON.stringify(q)} hit ${own ? 'itself' : 'OTHER: ' + top}${offscreen ? ' (OFFSCREEN)' : ''}`);
      return el;
    },
    async hover(x, y, wait = 500) { await page.mouse.move(x, y, { steps: 4 }); await sleep(wait); },
    async text() { const t = await Promise.race([frame.evaluate(() => document.body.innerText), new Promise(r => setTimeout(() => r(''), 10000))]); return t || ''; },
    ev(fn, ...a) { return Promise.race([frame.evaluate(fn, ...a), new Promise(r => setTimeout(() => r('TIMEOUT'), 10000))]); },
    // text a reviewer can actually see: skips display:none, visibility:hidden, opacity 0 and sr-only clipped nodes (3992127)
    async vtext() {
      const t = await api.ev(() => {
        const out = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) {
          const n = w.currentNode; const s = n.textContent.trim(); if (!s) continue;
          const e = n.parentElement; if (!e) continue; const r = e.getBoundingClientRect(); if (r.width < 3 || r.height < 3) continue;
          let x = e, hid = false;
          while (x && x !== document.body) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') { hid = true; break; } x = x.parentElement; }
          if (!hid) out.push(s.replace(/\s+/g, ' '));
        }
        return out.join('\n');
      });
      return t === 'TIMEOUT' ? '' : t;
    },
    // viewport screenshot as base64 (also written to file when given)
    async snap(file) { const b = await page.screenshot({ encoding: 'base64' }); if (file) fs.writeFileSync(file, Buffer.from(b, 'base64')); return b; },
    // share of the screen that changed between two snaps, in percent (catches variant swaps, camera moves, background toggles)
    vdiff(a, b) {
      return Promise.race([page.evaluate(async (a, b) => {
        const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
        const [x, y] = await Promise.all([load(a), load(b)]); const W = 160, H = 128;
        const px = img => { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0, W, H); return g.getImageData(0, 0, W, H).data; };
        const p = px(x), q = px(y); let n = 0;
        for (let i = 0; i < p.length; i += 4) if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 60) n++;
        return Math.round(n / (W * H) * 1000) / 10;
      }, a, b), new Promise(r => setTimeout(() => r(-1), 10000))]);
    },
    async shot(file, full = false) { await page.screenshot({ path: file, fullPage: full }); },
    async close() { await browser.close(); server.close(); },
  };
  return api;
}
module.exports = { open, sleep };
