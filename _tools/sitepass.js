// Generic single-site pass.
// usage: node sitepass.js <filesDir> <siteFile> <outDir> <tag> [frameWidth=1000]   (editing After panes: 680)
// 1) full-size 1440x900 render: screenshots, text, control list, console
// 2) review frame (sandboxed iframe 1000x800): screens, canvas drag/wheel, real click on every visible control with result diff
const { open, sleep } = require('./frame');
const fs = require('fs'); const path = require('path');
const [ROOT, FILE, OUT, TAG, FW] = process.argv.slice(2);
fs.mkdirSync(OUT, { recursive: true });
const P = n => path.join(OUT, `${TAG}_${n}`);

(async () => {
  // ---------- 1) full size, no sandbox ----------
  let s = await open(ROOT, FILE, { width: 1440, height: 900, sandbox: false });
  await sleep(2500);
  let f = s.frame;
  const info = await f.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none'; };
    return {
      title: document.title, height: document.documentElement.scrollHeight,
      canvases: [...document.querySelectorAll('canvas')].map(c => `${c.width}x${c.height}`),
      text: document.body.innerText.slice(0, 5000),
      controls: [...document.querySelectorAll('button,a,[role=button],[role=tab],[role=switch],[role=slider],input,select')].filter(vis).map(e => `${e.tagName.toLowerCase()}${e.getAttribute('role') ? '[' + e.getAttribute('role') + ']' : ''}${e.type ? '[' + e.type + ']' : ''} "${(e.getAttribute('aria-label') || e.innerText || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 60)}"${e.getAttribute('href') ? ' href=' + e.getAttribute('href').slice(0, 40) : ''}`),
    };
  });
  // full page screenshot via scrolling the frame
  for (let i = 0, y = 0; y < info.height && i < 6; i++, y += 880) { await f.evaluate(y => scrollTo(0, y), y); await sleep(500); await s.shot(P(`full_${i}.png`)); }
  fs.writeFileSync(P('info.txt'), JSON.stringify(info, null, 2) + '\n\nLOG:\n' + s.log.join('\n'));
  console.log(`[${TAG}] title="${info.title}" height=${info.height} canvases=${info.canvases} controls=${info.controls.length}`);
  await s.close();

  // ---------- 2) review frame ----------
  const dl = P('dl');
  s = await open(ROOT, FILE, { width: +(FW || 1000), height: 800, sandbox: true, dl });
  await sleep(2500);
  f = s.frame; const page = s.page; const log = s.log;
  const fh = await f.evaluate(() => document.documentElement.scrollHeight);
  for (let i = 0, y = 0; y < fh && i < 6; i++, y += 760) { await f.evaluate(y => scrollTo(0, y), y); await sleep(500); await s.shot(P(`frame_${i}.png`)); }
  await f.evaluate(() => scrollTo(0, 0)); await sleep(300);

  // canvas drag + wheel
  const cv = await f.$('canvas');
  if (cv) {
    await cv.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400);
    const bb = await cv.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    const y0 = await s.ev(() => scrollY);
    await page.mouse.move(cx, cy); await page.mouse.down();
    for (let i = 1; i <= 10; i++) { await page.mouse.move(cx + i * 15, cy + i * 2); await sleep(25); }
    await page.mouse.up(); await sleep(800); await s.shot(P('frame_drag.png'));
    for (let i = 0; i < 5; i++) { await page.mouse.wheel({ deltaY: -200 }); await sleep(80); }
    await sleep(800);
    log.push(`canvas wheel: page scrollY ${y0} -> ${await s.ev(() => scrollY)}`);
    await s.shot(P('frame_wheel.png'));
  }

  // enumerate controls, click each with the real mouse
  const base = await s.text();
  const ctrls = await f.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && st.display !== 'none'; };
    return [...document.querySelectorAll('button,a,summary,[role=button],[role=tab],[role=switch],[role=radio],[role=checkbox],[role=combobox],[role=menuitem]')].filter(vis).map((e, i) => { e.setAttribute('data-pass-idx', i); return { i, name: (e.getAttribute('aria-label') || e.innerText || e.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 50) }; });
  });
  log.push(`controls in frame: ${ctrls.length}`);
  // selects, sliders and checkboxes are controls too (3996194: an SVG / PNG 1K / 2K / 4K export menu was missed)
  const forms = await s.ev(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const lab = e => (e.getAttribute('aria-label') || (e.labels && e.labels[0] && e.labels[0].innerText) || e.id || e.name || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const out = [];
    document.querySelectorAll('select').forEach(e => { if (vis(e)) out.push(`SELECT "${lab(e)}" = "${e.options[e.selectedIndex] ? e.options[e.selectedIndex].text.trim() : ''}" options: ${[...e.options].map(o => o.text.trim()).join(' / ').slice(0, 200)}`); });
    document.querySelectorAll('input[type=range],[role=slider]').forEach(e => { if (vis(e)) out.push(`SLIDER "${lab(e)}" value ${e.value || e.getAttribute('aria-valuenow')} (${e.min || e.getAttribute('aria-valuemin')}-${e.max || e.getAttribute('aria-valuemax')})`); });
    document.querySelectorAll('input[type=checkbox],input[type=radio],[role=checkbox],[role=switch]').forEach(e => { if (vis(e)) out.push(`TOGGLE "${lab(e)}" ${e.checked !== undefined ? (e.checked ? 'on' : 'off') : e.getAttribute('aria-checked')}`); });
    document.querySelectorAll('input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=hidden]),textarea').forEach(e => { if (vis(e)) out.push(`INPUT "${lab(e) || e.placeholder}" (${e.type || 'text'})`); });
    return out;
  });
  if (Array.isArray(forms)) for (const l of forms) log.push('  ' + l);
  // try the last option of each select once and report what changed on screen
  for (const h of await f.$$('select')) { try {
    const v = await h.evaluate(e => { const r = e.getBoundingClientRect(); if (r.width === 0 || e.options.length < 2) return null; return { last: e.options[e.options.length - 1].value, text: e.options[e.options.length - 1].text.trim(), first: e.value }; });
    if (!v) continue;
    const t0 = await s.vtext(); const p0 = await s.snap(); await h.select(v.last); await sleep(900);
    const t1 = await s.vtext(); const vis = await s.vdiff(p0, await s.snap());
    const add = t1.split('\n').filter(l => l && !t0.includes(l)).slice(0, 5).join(' | ').slice(0, 200);
    log.push(`  select -> "${v.text}": ${add ? '+[' + add + '] ' : ''}${vis > 1.5 ? 'visual ' + vis + '%' : ''}${!add && vis <= 1.5 ? 'no visible change (may only affect an export)' : ''}`);
    await h.select(v.first); await sleep(400);
  } catch (e) { log.push('  select test error ' + String(e.message).slice(0, 80)); } }
  // how much the screen moves on its own (animations, live sims); visual changes are reported above this level
  const z0 = await s.snap(); await sleep(1000); const noise = Math.max(0, await s.vdiff(z0, await s.snap()));
  log.push(`screen motion with no input: ${noise}%`);
  let n = 0, fails = 0;
  for (const c of ctrls) { try {
    const el = await f.$(`[data-pass-idx="${c.i}"]`); if (!el) continue;
    const visible = await el.evaluate(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; });
    if (!visible) { log.push(`#${c.i} "${c.name}" not visible now (skipped)`); continue; }
    const before = { text: await s.vtext(), y: await s.ev(() => scrollY), url: await s.ev(() => location.href), files: fs.readdirSync(dl).length, logs: log.length };
    await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(200);
    const snap0 = await s.snap();
    const bb = await el.boundingBox(); if (!bb) continue;
    const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    const onTop = await el.evaluate((e, x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); }, cx, cy);
    await page.mouse.click(cx, cy); await sleep(1000);
    const shotFile = P(`click_${String(++n).padStart(2, '0')}.png`); const vis = await s.vdiff(snap0, await s.snap(shotFile)); const visTxt = vis > noise + 1.5 ? `visual ${vis}% ` : '';
    const after = { text: await s.vtext(), y: await s.ev(() => scrollY), url: await s.ev(() => location.href), files: fs.readdirSync(dl).length };
    const added = after.text.split('\n').filter(l => l.trim() && !before.text.includes(l)).slice(0, 6).join(' | ').slice(0, 200);
    const removed = before.text.split('\n').filter(l => l.trim() && !after.text.includes(l)).slice(0, 3).join(' | ').slice(0, 100);
    const dlg = await f.evaluate(() => [...document.querySelectorAll('[role=dialog],[aria-modal=true],dialog[open]')].filter(d => d.getBoundingClientRect().width > 0).map(d => d.innerText.trim().replace(/\s+/g, ' ').slice(0, 80)));
    const consoleNew = log.slice(before.logs).filter(l => /disallowed|error/i.test(l)).join(' ').slice(0, 120);
    const changed = added || removed || visTxt || after.y !== before.y || after.url !== before.url || after.files !== before.files || consoleNew;
    log.push(`#${c.i} "${c.name}" ${onTop ? '' : '[COVERED] '}→ ${changed ? '' : 'NO VISIBLE CHANGE '}${visTxt && !added && !removed ? 'VISUAL CHANGE ONLY ' : ''}${visTxt}${after.url !== before.url ? (after.url.includes('://localhost') ? 'url=' + after.url.split('/').pop() + ' ' : 'OUTSIDE LINK to ' + after.url.split('/')[2] + ' (another host: works or fails differently for the reviewer, never evidence) ') : ''}${after.y !== before.y ? `scroll ${before.y}->${after.y} ` : ''}${added ? '+[' + added + '] ' : ''}${removed ? '-[' + removed + '] ' : ''}${dlg.length ? 'dialog=' + JSON.stringify(dlg) + ' ' : ''}${after.files !== before.files ? 'DOWNLOADED ' : ''}${consoleNew}`);
    if (dlg.length) { await page.keyboard.press('Escape'); await sleep(500); }
    if (after.url !== before.url && !after.url.includes('#')) { await f.goto(before.url); await sleep(2000); }
    fails = 0; fs.writeFileSync(P('frame.txt'), log.join('\n'));
  } catch (e) { log.push(`#${c.i} "${c.name}" → ERROR ${String(e.message).slice(0, 100)}`); if (++fails >= 3) { log.push('stopped after 3 failed controls in a row (page hung); use steps.js for the rest'); break; } } }
  fs.writeFileSync(P('frame.txt'), log.join('\n'));
  console.log(log.join('\n'));
  await s.close();
})();
