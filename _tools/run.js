// node run.js <TaskID>
// One-command first pass for a UI Berry task (about 5-8 minutes of machine time, no supervision):
//  1. setup: unzip, map Website A/B, print the User request and missing images (lazy vs eager)
//  2. sitepass on both sites (full-size screens + 1000x800 review frame + real click on every control)
//  3. layout view: a copy with neutral placeholders for missing photos, scrolled with the mouse wheel
//  4. side-by-side contact sheets (Website A left, Website B right) and a digest of every click result
// Output folder: %TEMP%\uiberry\<TaskID>  (paths printed at the end)
const fs = require('fs'); const path = require('path'); const { spawn } = require('child_process');
const { setup, summary } = require('./setup');
const TOOLS = __dirname;
const id = process.argv[2];
if (!id) { console.log('usage: node run.js <TaskID>'); process.exit(1); }

function runNode(args, timeoutMs) {
  return new Promise(resolve => {
    const p = spawn(process.execPath, args, { cwd: TOOLS });
    let out = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
    const t = setTimeout(() => { p.kill(); out += '\n[TIMEOUT]'; }, timeoutMs);
    p.on('close', code => { clearTimeout(t); resolve({ code, out }); });
  });
}
async function withRetry(args, timeoutMs, label, good = () => false) {
  let r = await runNode(args, timeoutMs);
  if (good()) return r; // partial results were saved; a second run would only cost time
  if (r.code !== 0 || /\[TIMEOUT\]|Failed to launch|ProtocolError/.test(r.out)) { console.log(`  ${label}: retrying once`); r = await runNode(args, timeoutMs); }
  return r;
}

(async () => {
  const t0 = Date.now();
  const info = setup(id); const OUT = info.OUT;
  console.log(summary(info));
  fs.writeFileSync(path.join(OUT, 'request.txt'), info.request);
  let FW = '1000';
  if (info.editing) {
    // judge the After Edit pane of each wrapper; panes are about 480-680px wide in the review page
    const after = k => { const p = info.sites[k].inner.find(i => /after/i.test(i)); return p ? path.basename(p.split(' -> ')[1]) : null; };
    const a = after('A'), b = after('B');
    if (!a || !b || !fs.existsSync(path.join(info.filesDir, a)) || !fs.existsSync(path.join(info.filesDir, b))) { console.log('\nEDITING TASK: After panes not found automatically; run sitepass.js on them by hand (width 680).'); return; }
    console.log(`\nEDITING TASK: testing the After panes  Website A = ${a}   Website B = ${b}  (680px frame)`);
    info.A = a; info.B = b; FW = '680'; fs.writeFileSync(path.join(OUT, 'info.json'), JSON.stringify(info, null, 2));
  }

  // 2. sitepass (A and B in parallel; a failed one is retried alone)
  const clicks = k => { const p = path.join(OUT, k, `${k}_frame.txt`); return fs.existsSync(p) ? (fs.readFileSync(p, 'utf8').match(/→/g) || []).length : 0; };
  for (const k of ['A', 'B']) fs.rmSync(path.join(OUT, k), { recursive: true, force: true });
  console.log('\n[1/3] sitepass on both sites...');
  const passA = withRetry(['sitepass.js', info.filesDir, info.A, path.join(OUT, 'A'), 'A', FW], 480000, 'sitepass A', () => clicks('A') >= 5);
  await new Promise(r => setTimeout(r, 4000));
  const passB = withRetry(['sitepass.js', info.filesDir, info.B, path.join(OUT, 'B'), 'B', FW], 480000, 'sitepass B', () => clicks('B') >= 5);
  const [ra, rb] = await Promise.all([passA, passB]);

  // 3. layout view with placeholders for missing photos (both sites); skipped when nothing is missing, to save time
  const missing = ['A', 'B'].some(k => [...info.sites[k].imgs, ...info.sites[k].bg].some(i => !i.ok));
  const L = path.join(OUT, 'layout'); fs.rmSync(L, { recursive: true, force: true });
  if (missing) {
  console.log('[2/3] layout view with placeholder photos...');
  const ROOT2 = path.join(OUT, 'root');
  fs.rmSync(ROOT2, { recursive: true, force: true }); fs.mkdirSync(path.join(ROOT2, 'images'), { recursive: true });
  for (const n of fs.readdirSync(info.filesDir)) { const p = path.join(info.filesDir, n); if (fs.statSync(p).isFile()) fs.copyFileSync(p, path.join(ROOT2, n)); }
  const ph = path.join(TOOLS, 'ph.png');
  for (const k of ['A', 'B']) for (const im of [...info.sites[k].imgs, ...info.sites[k].bg].filter(i => !i.ok)) {
    const base = path.basename(im.src.split('?')[0]); if (!base) continue;
    for (const dst of [path.join(ROOT2, base), path.join(ROOT2, 'images', base)]) if (!fs.existsSync(dst)) fs.copyFileSync(ph, dst);
  }
  await Promise.all([
    withRetry(['scrollshots.js', ROOT2, info.A, 'A', L], 300000, 'layout A'),
    (async () => { await new Promise(r => setTimeout(r, 3000)); return withRetry(['scrollshots.js', ROOT2, info.B, 'B', L], 300000, 'layout B'); })(),
  ]);
  } else console.log('[2/3] no missing images: layout sheets come from the review-frame shots');

  // 4. contact sheets: A left, B right
  console.log('[3/3] contact sheets...');
  const sheets = [];
  const pair = async (name, a, b, w, h, cx = 0, cy = 0) => { const files = []; for (let i = 0; i < Math.max(a.length, b.length); i++) { if (a[i]) files.push(a[i]); else files.push(b[i]); if (b[i]) files.push(b[i]); else files.push(a[i]); } if (!files.length) return; const out = path.join(OUT, name); await runNode(['sheet.js', out, '2', String(cx), String(cy), String(w), String(h), ...files], 120000); sheets.push(out); };
  const ls = (dir, re) => fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => re.test(f)).sort().map(f => path.join(dir, f)) : [];
  await pair('sheet_frame.png', ls(path.join(OUT, 'A'), /^A_frame_\d+\.png$/).slice(0, 4), ls(path.join(OUT, 'B'), /^B_frame_\d+\.png$/).slice(0, 4), 1000, 800);
  const la2 = missing ? ls(L, /^A_s\d+\.png$/) : ls(path.join(OUT, 'A'), /^A_frame_\d+\.png$/), lb2 = missing ? ls(L, /^B_s\d+\.png$/) : ls(path.join(OUT, 'B'), /^B_frame_\d+\.png$/);
  for (let i = 0; i < Math.max(la2.length, lb2.length); i += 4) await pair(`sheet_layout_${i / 4 + 1}.png`, la2.slice(i, i + 4), lb2.slice(i, i + 4), 1000, 800);
  // close-up of the hero (the logo, island, cockpit or chart the request is about), full resolution, A left and B right
  await pair('sheet_hero.png', ls(path.join(OUT, 'A'), /^A_full_0.png$/), ls(path.join(OUT, 'B'), /^B_full_0.png$/), 1040, 760, 200, 40);
  await pair('sheet_full.png', ls(path.join(OUT, 'A'), /^A_full_\d+\.png$/).slice(0, 3), ls(path.join(OUT, 'B'), /^B_full_\d+\.png$/).slice(0, 3), 1440, 900);

  // digest
  const digest = [];
  for (const k of ['A', 'B']) {
    const ft = path.join(OUT, k, `${k}_frame.txt`); const it = path.join(OUT, k, `${k}_info.txt`);
    digest.push(`\n===== Website ${k} click results (review frame) =====`);
    if (fs.existsSync(ft)) digest.push(fs.readFileSync(ft, 'utf8').split('\n').filter(l => !/allow-scripts and allow-same-origin|status of 404|CORS|ERR_FAILED/.test(l)).map(l => l.slice(0, 260)).join('\n'));
    else digest.push('(sitepass failed) ' + (k === 'A' ? ra : rb).out.slice(-400));
    const st = path.join(L, `${k}_scroll.txt`); const br = fs.existsSync(st) ? fs.readFileSync(st, 'utf8').split('\n').filter(l => /BROKEN/.test(l)).slice(0, 3) : []; if (br.length) digest.push('layout view still broken: ' + br.join(' | '));
    if (fs.existsSync(it)) { const j = fs.readFileSync(it, 'utf8'); const m = j.match(/"height": (\d+)/); digest.push(`page height ${m ? m[1] : '?'}`); }
    // photos to open at full size (Read the file) when checking for artifacts such as rainbow patches
    const photos = [...new Set([...info.sites[k].imgs, ...info.sites[k].bg].filter(i => i.ok && !/^(data:|http)/.test(i.src)).map(i => path.join(info.filesDir, i.src.replace(/^\.\//, ''))))].filter(p => fs.existsSync(p) && fs.statSync(p).size > 25000);
    if (photos.length) digest.push('photos to zoom: ' + photos.join(' ; '));
  }
  fs.writeFileSync(path.join(OUT, 'digest.txt'), digest.join('\n'));
  console.log(digest.join('\n'));
  // draft skeleton with this task's style set (prompt.md 4.2 / 4.3)
  const { SETS, nextSet } = require('./style');
  const ns = nextSet(fs.readFileSync(path.join(TOOLS, '..', 'Prompt', 'Feedback.md'), 'utf8')); const S = SETS[ns.next];
  const fieldsFor = info.editing ? ['Satisfaction', 'Overall'] : ['Aesthetics', 'Functionality', 'Overall'];
  const draft = path.join(OUT, 'draft.md');
  fs.writeFileSync(draft, `STYLE: Set ${ns.next} (last task ${ns.prevId} used Set ${ns.prev || '?'}). Replace each pick and reason. Ties open "Website A and Website B are tied because". Lines above the first field are ignored.\n\n` +
    fieldsFor.map(f => { const col = f === 'Satisfaction' ? 'Functionality' : f; return `# ${f}: PICK\nWebsite X ${S[col]} because ... (rhythm ${S.rhythm[col]})`; }).join('\n\n') + '\n');
  console.log(`\nSTYLE: Set ${ns.next}  ${fieldsFor.map(f => { const col = f === 'Satisfaction' ? 'Functionality' : f; return `${f} "${S[col]}" + ${S.rhythm[col]}`; }).join(' | ')}\nDRAFT: ${draft}`);
  console.log(`\nSHEETS (A left, B right):\n${sheets.join('\n')}`);
  console.log(`\nAll output: ${OUT}   (${Math.round((Date.now() - t0) / 1000)}s)`);
})();
