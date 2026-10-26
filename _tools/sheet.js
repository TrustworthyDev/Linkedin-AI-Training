// usage: node sheet.js out.png cols cropX cropY cropW cropH img1 img2 ...
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const [out, cols, cx, cy, cw, ch, ...imgs] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage();
  const W = +cw, H = +ch, C = +cols, scale = Math.min(1, 1500 / (C * W));
  const cells = imgs.map(f => {
    const d = fs.readFileSync(f).toString('base64');
    const name = f.split(/[\\/]/).pop();
    return `<div style="width:${W * scale}px;height:${H * scale + 18}px;overflow:hidden;position:relative;border:1px solid #f0f">
      <div style="font:12px sans-serif;height:18px;background:#000;color:#fff">${name}</div>
      <div style="width:${W * scale}px;height:${H * scale}px;overflow:hidden;position:relative">
      <img src="data:image/png;base64,${d}" style="position:absolute;left:${-cx * scale}px;top:${-cy * scale}px;transform-origin:0 0;transform:scale(${scale})"></div></div>`;
  }).join('');
  await p.setContent(`<body style="margin:0;display:grid;grid-template-columns:repeat(${C},auto);gap:4px;width:max-content">${cells}</body>`);
  const dims = await p.evaluate(() => ({ w: document.body.scrollWidth, h: document.body.scrollHeight }));
  await p.setViewport({ width: dims.w, height: dims.h });
  await p.screenshot({ path: out, fullPage: true });
  await b.close();
})();
