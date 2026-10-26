// node setup.js <TaskID>
// Finds the task folder, unzips if needed, maps Website A / Website B files, extracts the User request,
// and lists every <img> with lazy/eager loading and whether its file exists locally.
// Writes OUT/info.json and prints a short summary. Also usable as require('./setup').setup(id).
const fs = require('fs'); const path = require('path'); const os = require('os'); const { execSync } = require('child_process');
const BASE = 'E:/Projects/@Linkedin/UI Berry';

function findFiles(dir, depth = 0, out = []) {
  if (depth > 4 || !fs.existsSync(dir)) return out;
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (!n.endsWith('_files') && n !== 'node_modules') findFiles(p, depth + 1, out); }
    else out.push(p);
  }
  return out;
}
const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function setup(id) {
  const dir = path.join(BASE, id);
  // tar reads 'E:...' as a remote host, so extract with cwd set and relative names
  const untar = (zip, into) => execSync(`"C:/Windows/System32/tar.exe" -xf"${path.basename(zip)}" -C "${path.relative(path.dirname(zip), into) || '.'}"`, { cwd: path.dirname(zip) });
  if ((!fs.existsSync(dir) || !fs.readdirSync(dir).length) && fs.existsSync(dir + '.zip')) { fs.mkdirSync(dir, { recursive: true }); untar(dir + '.zip', dir); }
  if (!fs.existsSync(dir)) throw new Error('No folder ' + dir);
  let files = findFiles(dir);
  if (!files.some(f => f.endsWith('.html'))) {
    for (const z of files.filter(f => f.endsWith('.zip'))) untar(z, dir);
    files = findFiles(dir);
  }
  const html = files.find(f => f.endsWith('.html') && /Preference/.test(path.basename(f)));
  if (!html) throw new Error('No task html under ' + dir);
  const s = fs.readFileSync(html, 'utf8');
  const title = (s.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const iframes = [...s.matchAll(/<iframe[^>]*src="([^"]+)"/g)].map(m => decodeURIComponent(m[1]).replace(/^\.\//, ''));
  const tabs = [...s.matchAll(/aria-controls="[^"]*layout_node_(\d)"[^>]*>(Website [AB])/g)].map(m => m[2] + '=node' + m[1]);
  const filesDir = path.join(path.dirname(html), path.dirname(iframes[0]));
  const A = path.basename(iframes[0]), B = path.basename(iframes[1]);
  let text = s.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, '\n');
  const L = decode(text).split('\n').map(l => l.trim()).filter(Boolean);
  const a = L.findIndex(l => /^User request/.test(l)), b = L.indexOf('How to review');
  const request = L.slice(a + 1, b > a ? b : a + 40).join('\n');
  const editing = /Editing/i.test(title);
  const site = (file) => {
    const p = path.join(filesDir, file); const h = fs.readFileSync(p, 'utf8');
    const t = decode((h.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
    const imgs = [...h.matchAll(/<img[^>]*>/g)].map(m => { const tag = m[0]; const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1] || ''; const lazy = /loading="lazy"/.test(tag); const alt = decode((tag.match(/alt="([^"]*)"/) || [])[1] || '').slice(0, 60); const local = src.startsWith('./') ? fs.existsSync(path.join(filesDir, src.slice(2))) : !src.startsWith('http') && !src.startsWith('data:') ? false : true; return { src, lazy, alt, ok: local || src.startsWith('data:') }; });
    const bg = [...new Set([...h.matchAll(/url\(\.?\/?([^)"']+\.(?:jpg|jpeg|png|webp|gif|avif))\)/g)].map(m => m[1]))].map(src => ({ src, ok: fs.existsSync(path.join(filesDir, src.replace(/^\.\//, ''))) }));
    const inner = editing ? [...h.matchAll(/<iframe[^>]*title="([^"]+)"[^>]*src="([^"]+)"/g)].map(m => m[1] + ' -> ' + decodeURIComponent(m[2]).replace(/^\.\//, '')) : [];
    return { file, title: t, imgs, bg, inner };
  };
  const info = { id, title, editing, html, filesDir, A, B, tabs, request, sites: { A: site(A), B: site(B) } };
  const OUT = path.join(os.tmpdir(), 'uiberry', id); fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'info.json'), JSON.stringify(info, null, 2));
  info.OUT = OUT;
  return info;
}

function summary(info) {
  const out = [];
  out.push(`TASK ${info.id}  ${info.editing ? '[EDITING TASK: Satisfaction + Overall]' : '[Aesthetics / Functionality / Overall]'}`);
  out.push(`tabs: ${info.tabs.join(', ')}   Website A = ${info.A}   Website B = ${info.B}`);
  out.push(`filesDir: ${info.filesDir}`);
  out.push(`OUT: ${info.OUT}`);
  out.push('--- USER REQUEST ---\n' + info.request + '\n--------------------');
  for (const k of ['A', 'B']) {
    const s = info.sites[k];
    out.push(`Website ${k}: "${s.title}"`);
    for (const i of s.imgs.filter(i => !i.ok)) out.push(`   MISSING img ${i.src} ${i.lazy ? '(lazy)' : '(EAGER: shows broken right away)'} alt="${i.alt}"`);
    for (const i of s.bg.filter(i => !i.ok)) out.push(`   MISSING css background ${i.src}`);
    for (const i of s.inner) out.push(`   pane: ${i}`);
  }
  return out.join('\n');
}

if (require.main === module) { const info = setup(process.argv[2]); console.log(summary(info)); }
module.exports = { setup, summary };
