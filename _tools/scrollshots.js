// node scrollshots.js <ROOT> <FILE> <TAG> <OUT>
// Scrolls the page with the real mouse wheel in the 1000x800 review frame, screenshots every ~700px,
// and records which images in view are broken. Used on the placeholder copy for a "layout view".
const { open, sleep } = require('./frame');
const fs = require('fs'); const path = require('path');
const [ROOT, FILE, TAG, OUT] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const s = await open(ROOT, FILE, { width: 1000, height: 800, sandbox: true }); await sleep(3500);
  const { frame: f, page, log } = s;
  const fb = await (await f.frameElement()).boundingBox();
  const H = await s.ev(() => document.documentElement.scrollHeight);
  log.push('doc height ' + H);
  let i = 0;
  for (let y = 0; y < H && i < 14; y += 700, i++) {
    await page.mouse.move(fb.x + 500, fb.y + 400);
    let tries = 0; while ((await s.ev(() => scrollY)) < y - 5 && tries < 20) { await page.mouse.wheel({ deltaY: 350 }); await sleep(120); tries++; }
    await sleep(1500);
    const sy = await s.ev(() => Math.round(scrollY));
    const imgs = await s.ev(() => [...document.querySelectorAll('img')].filter(im => { const r = im.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 20; }).map(im => `${(im.getAttribute('src') || '').split('/').pop().slice(0, 24)}:${im.complete && im.naturalWidth > 0 ? 'ok' : 'BROKEN'}`).join(', '));
    log.push(`s${String(i).padStart(2, '0')} y=${sy} imgs: ${imgs}`);
    await s.shot(path.join(OUT, `${TAG}_s${String(i).padStart(2, '0')}.png`));
  }
  fs.writeFileSync(path.join(OUT, `${TAG}_scroll.txt`), log.join('\n'));
  console.log(`[${TAG}] scroll shots: ${i}`);
  await s.close();
})();
