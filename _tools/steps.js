// node steps.js <TaskID> <A|B> '<json steps>' [--layout] [--w=1000]
// Runs targeted checks in the 1000x800 sandboxed review frame with REAL mouse/keyboard input.
// After every action it prints what changed in the VISIBLE text (screen-reader-only text is ignored),
// open dialogs, visible toasts, scroll and URL changes. Screenshots go to %TEMP%\uiberry\<id>\steps\.
//
// Steps (JSON array), e.g. '[{"click":"Mortality"},{"shot":"mort"},{"select":["Filter by market","Forex"]}]'
//   {"click":"text or aria-label"}   {"css":"selector"}            real click (scrolls into view first)
//      matches go in DOM order (header before footer); add "nth":2 to take the second match, e.g. {"click":"Apparel","nth":2}
//   {"hover":"text or aria-label"}    {"hovercss":"selector"}       real hover, prints tooltip/diff
//   {"select":["label|css","option text"]}   {"type":["css","text"]}   {"key":"Escape"}
//   {"clickxy":[x,y]} {"dragxy":[x1,y1,x2,y2]}  viewport coordinates inside the 1000x800 frame (read them off frame_N.png)
//   {"drag":["css",dx,dy]}  {"wheel":dy}  {"scrollto":"css"|y}  {"wait":ms}  {"shot":"name"}
//   {"find":"regex"}  -> visible lines matching regex      {"measure":"css"} -> sizes of matches
//   {"list":"css"}    -> labels of visible matches        {"eval":"js expression"} -> result
//   {"state":"css"}   -> transform / shadow / border / opacity of first match (hover effects)
const { open, sleep } = require('./frame');
const fs = require('fs'); const path = require('path'); const os = require('os');
const { setup } = require('./setup');
const [id, TAG, json, ...flags] = process.argv.slice(2);
const steps = JSON.parse(json && json.startsWith('@') ? fs.readFileSync(json.slice(1), 'utf8') : (json || '[]')); // '@file.json' avoids shell escaping of backslashes
const W = +((flags.find(f => f.startsWith('--w=')) || '--w=1000').slice(4));
(async () => {
  const OUT = path.join(os.tmpdir(), 'uiberry', id);
  const infoPath = path.join(OUT, 'info.json');
  const info = fs.existsSync(infoPath) ? JSON.parse(fs.readFileSync(infoPath, 'utf8')) : setup(id);
  const ROOT = flags.includes('--layout') && fs.existsSync(path.join(OUT, 'root')) ? path.join(OUT, 'root') : info.filesDir;
  const FILE = TAG === 'A' ? info.A : info.B;
  const SD = path.join(OUT, 'steps'); fs.mkdirSync(SD, { recursive: true });
  const s = await open(ROOT, FILE, { width: W, height: 800, sandbox: true }); await sleep(3000);
  const { frame: f, page } = s;
  const lines = [];
  const say = t => { lines.push(t); console.log(t); };
  const visText = () => s.ev(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode; const t = n.textContent.trim(); if (!t) continue;
      const e = n.parentElement; if (!e) continue;
      const r = e.getBoundingClientRect(); if (r.width < 3 || r.height < 3) continue;
      let x = e, hidden = false;
      while (x && x !== document.body) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0 || cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') { hidden = true; break; } x = x.parentElement; }
      if (!hidden) out.push(t.replace(/\s+/g, ' '));
    }
    return out.join('\n');
  });
  const ctx = () => s.ev(() => ({
    y: Math.round(scrollY), url: location.href,
    dlg: [...document.querySelectorAll('[role=dialog],dialog[open],[aria-modal=true]')].filter(d => d.getBoundingClientRect().width > 0 && getComputedStyle(d).visibility !== 'hidden').map(d => d.innerText.replace(/\s+/g, ' ').slice(0, 220)),
    toast: [...document.querySelectorAll('[role=status],[role=alert],[class*=toast i]')].filter(d => { const r = d.getBoundingClientRect(); return r.width > 40 && r.height > 10 && getComputedStyle(d).opacity !== '0'; }).map(d => d.innerText.replace(/\s+/g, ' ').slice(0, 160)).filter(Boolean),
  }));
  const findEl = async (q, css, nth = 1) => (await f.evaluateHandle((q, css, nth) => {
    if (css) return [...document.querySelectorAll(q)].filter(e => e.getBoundingClientRect().width > 0)[nth - 1] || null;
    const norm = t => (t || '').trim().replace(/\s+/g, ' ').toLowerCase(); const L = norm(q);
    const els = [...document.querySelectorAll('button,a,[role=button],[role=tab],[role=switch],[role=menuitem],[role=option],[role=radio],[role=checkbox],input,label,summary,select,[tabindex]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    const tiers = [e => norm(e.getAttribute('aria-label')) === L || norm(e.innerText) === L, e => norm(e.innerText).startsWith(L) || norm(e.getAttribute('aria-label')).startsWith(L), e => norm(e.innerText).includes(L)];
    for (const t of tiers) { const m = els.filter(t); if (m.length) return m[nth - 1] || null; }
    return null;
  }, q, css, nth)).asElement();
  const center = async (h) => { await h.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await sleep(350); const bb = await h.boundingBox(); return bb ? { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 } : null; };
  let n = 0;
  const z0 = await s.snap(); await sleep(800); const noise = Math.max(0, await s.vdiff(z0, await s.snap())); // screen motion with no input
  for (const st of steps) {
    const k = Object.keys(st)[0]; const v = st[k]; const label = `#${++n} ${k} ${JSON.stringify(v).slice(0, 70)}`;
    const before = await visText(); const c0 = await ctx(); const snap0 = await s.snap();
    try {
      if (k === 'click' || k === 'css') { const h = await findEl(v, k === 'css', st.nth); if (!h) { say(label + ' -> NOT FOUND'); continue; } const p = await center(h); const onTop = await h.evaluate((e, x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === e || e.contains(t)); }, p.x - (await (await f.frameElement()).boundingBox()).x, p.y - (await (await f.frameElement()).boundingBox()).y); await page.mouse.click(p.x, p.y); await sleep(1100); if (!onTop) say('   ! something else was on top of this control'); }
      else if (k === 'hover' || k === 'hovercss') { const h = await findEl(v, k === 'hovercss', st.nth); if (!h) { say(label + ' -> NOT FOUND'); continue; } const p = await center(h); await page.mouse.move(p.x, p.y, { steps: 5 }); await sleep(900); }
      else if (k === 'select') { let h = await findEl(v[0], true).catch(() => null); if (!h) h = (await f.evaluateHandle(l => [...document.querySelectorAll('select')].find(s => (s.getAttribute('aria-label') || '').toLowerCase().includes(l.toLowerCase()) || (s.labels && s.labels[0] && s.labels[0].innerText.toLowerCase().includes(l.toLowerCase()))) || null, v[0])).asElement(); if (!h) { say(label + ' -> NOT FOUND'); continue; } const val = await h.evaluate((e, t) => { const o = [...e.options].find(o => o.text.trim().toLowerCase().startsWith(t.toLowerCase())); return o ? o.value : null; }, v[1]); if (val === null) { say(label + ' -> option not found: ' + JSON.stringify(await h.evaluate(e => [...e.options].map(o => o.text)))); continue; } await h.select(val); await sleep(1100); }
      else if (k === 'type') { const h = await findEl(v[0], true); if (!h) { say(label + ' -> NOT FOUND'); continue; } const p = await center(h); await page.mouse.click(p.x, p.y, { clickCount: 3 }); await page.keyboard.type(String(v[1])); await sleep(900); }
      else if (k === 'clickxy') { const fb = await (await f.frameElement()).boundingBox(); await page.mouse.click(fb.x + v[0], fb.y + v[1]); await sleep(1100); }
      else if (k === 'dragxy') { const fb = await (await f.frameElement()).boundingBox(); await page.mouse.move(fb.x + v[0], fb.y + v[1]); await page.mouse.down(); await page.mouse.move(fb.x + v[2], fb.y + v[3], { steps: 12 }); await page.mouse.up(); await sleep(1100); }
      else if (k === 'key') { await page.keyboard.press(v); await sleep(700); }
      else if (k === 'drag') { const h = await findEl(v[0], true); if (!h) { say(label + ' -> NOT FOUND'); continue; } const p = await center(h); await page.mouse.move(p.x, p.y); await page.mouse.down(); await page.mouse.move(p.x + v[1], p.y + v[2], { steps: 14 }); await page.mouse.up(); await sleep(900); }
      else if (k === 'wheel') { const fb = await (await f.frameElement()).boundingBox(); await page.mouse.move(fb.x + 500, fb.y + 400); await page.mouse.wheel({ deltaY: v }); await sleep(900); }
      else if (k === 'scrollto') { if (typeof v === 'number') await s.ev(y => scrollTo(0, y), v); else await s.ev(c => document.querySelector(c)?.scrollIntoView({ block: 'start' }), v); await sleep(1200); }
      else if (k === 'wait') { await sleep(v); continue; }
      else if (k === 'shot') { const p = path.join(SD, `${TAG}_${v}.png`); await s.shot(p); say(`${label} -> ${p}`); continue; }
      else if (k === 'find') { const t = await visText(); say(`${label} -> ${t.split('\n').filter(l => new RegExp(v, 'i').test(l)).slice(0, 12).join(' | ')}`); continue; }
      else if (k === 'measure') { say(`${label} -> ${JSON.stringify(await s.ev(c => [...document.querySelectorAll(c)].filter(e => e.getBoundingClientRect().width > 0).slice(0, 8).map(e => { const r = e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}@${Math.round(r.x)},${Math.round(r.y + scrollY)}`; }), v))}`); continue; }
      else if (k === 'list') { say(`${label} -> ${JSON.stringify(await s.ev(c => [...document.querySelectorAll(c)].filter(e => e.getBoundingClientRect().width > 0).slice(0, 30).map(e => (e.getAttribute('aria-label') || e.innerText || e.value || '').trim().replace(/\s+/g, ' ').slice(0, 40)), v))}`); continue; }
      else if (k === 'state') { say(`${label} -> ${await s.ev(c => { const e = document.querySelector(c); if (!e) return 'not found'; const cs = getComputedStyle(e); return `transform=${cs.transform.slice(0, 50)} shadow=${cs.boxShadow.slice(0, 60)} border=${cs.borderColor} opacity=${cs.opacity} bg=${cs.backgroundColor}`; }, v)}`); continue; }
      else if (k === 'eval') { say(`${label} -> ${JSON.stringify(await s.ev(new Function('return (' + v + ')')))}`.slice(0, 600)); continue; }
      else { say(label + ' -> unknown step'); continue; }
    } catch (e) { say(`${label} -> ERROR ${e.message.slice(0, 120)}`); continue; }
    const after = await visText(); const c1 = await ctx(); const vis = await s.vdiff(snap0, await s.snap()); const visTxt = vis > noise + 1.5 ? `visual ${vis}% ` : '';
    const add = after.split('\n').filter(l => l && !before.includes(l)).slice(0, 10).join(' | ').slice(0, 380);
    const rem = before.split('\n').filter(l => l && !after.includes(l)).slice(0, 5).join(' | ').slice(0, 160);
    say(`${label} -> ${c1.url !== c0.url ? (c1.url.includes('://localhost') ? 'url=' + c1.url.split('/').pop() + ' ' : 'OUTSIDE LINK to ' + c1.url.split('/')[2] + ' (another host: never evidence) ') : ''}${c1.y !== c0.y ? `scroll ${c0.y}->${c1.y} ` : ''}${add ? '+[' + add + '] ' : ''}${rem ? '-[' + rem + '] ' : ''}${c1.dlg.length ? 'DIALOG=' + JSON.stringify(c1.dlg) + ' ' : ''}${c1.toast.length ? 'TOAST=' + JSON.stringify(c1.toast) : ''}${visTxt}${!add && !rem && !visTxt && c1.y === c0.y && c1.url === c0.url && !c1.dlg.length ? 'NO VISIBLE CHANGE' : ''}`);
  }
  fs.appendFileSync(path.join(OUT, `steps_${TAG}.log`), lines.join('\n') + '\n');
  await s.close();
})();
