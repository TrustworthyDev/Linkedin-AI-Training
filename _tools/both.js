// node both.js <TaskID> '<json steps>' | @steps.json [--layout] [--w=1000]
// Runs the same steps.js checks on Website A and Website B at the same time and prints them one after the other.
// Use it for symmetric checks: the same weak spot on both sites, a "has no..." claim, the same control on both.
const { spawn } = require('child_process'); const path = require('path');
const [id, json, ...flags] = process.argv.slice(2);
if (!id || !json) { console.log("usage: node both.js <TaskID> '<json steps>' | @steps.json"); process.exit(1); }
const run = tag => new Promise(res => {
  const p = spawn(process.execPath, [path.join(__dirname, 'steps.js'), id, tag, json, ...flags], { cwd: __dirname });
  let out = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
  const t = setTimeout(() => { p.kill(); out += '\n[TIMEOUT after 180s]'; }, 180000);
  p.on('close', () => { clearTimeout(t); res(out); });
});
(async () => {
  const [a, b] = await Promise.all([run('A'), new Promise(r => setTimeout(r, 1500)).then(() => run('B'))]);
  const clean = o => o.split('\n').filter(l => l.trim() && !/allow-scripts and allow-same-origin|status of 404|attribute d:/.test(l)).map(l => l.slice(0, 420)).join('\n');
  console.log('===== Website A =====\n' + clean(a) + '\n===== Website B =====\n' + clean(b));
})();
