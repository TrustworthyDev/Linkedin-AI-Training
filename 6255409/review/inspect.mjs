import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = path.resolve('6255409');
const out = path.join(root, 'review');
const assets = path.join(root, 'Aesthetics_Functionality_Overall Website Preference - 051_files');
await fs.mkdir(out, { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9334',
  `--user-data-dir=${path.join(out, 'temporary-browser')}`,
  '--no-first-run', '--no-default-browser-check', '--disable-component-update',
  '--disable-background-networking', '--disable-sync', 'about:blank'
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = '';
chrome.stderr.on('data', chunk => { stderr += chunk; });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let ws;
try {
  let targets;
  for (let i = 0; i < 60; i++) {
    try { targets = await (await fetch('http://127.0.0.1:9334/json/list')).json(); break; }
    catch { await delay(250); }
  }
  if (!targets) throw new Error(`Browser did not start: ${stderr.slice(-1000)}`);
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const callbacks = pending.get(message.id);
      if (callbacks) { pending.delete(message.id); message.error ? callbacks.reject(new Error(JSON.stringify(message.error))) : callbacks.resolve(message.result); }
    } else if (/exception|loadingFailed|consoleAPICalled/i.test(message.method)) events.push(message);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const nextId = ++id;
    pending.set(nextId, { resolve, reject });
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, userGesture: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const screenshot = async name => {
    const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const data = Buffer.from(result.data, 'base64');
    await fs.writeFile(path.join(out, name), data);
    return createHash('sha256').update(data).digest('hex');
  };
  const load = async file => {
    await send('Page.navigate', { url: pathToFileURL(path.join(assets, file)).href });
    for (let i = 0; i < 40; i++) {
      if (await evaluate('document.readyState === "complete"')) break;
      await delay(200);
    }
    await delay(2500);
  };
  const snapshot = () => evaluate(`({title:document.title,text:document.body.innerText,buttons:[...document.querySelectorAll('button')].map(e=>({text:e.innerText,id:e.id,label:e.getAttribute('aria-label'),pressed:e.getAttribute('aria-pressed')})),width:innerWidth,scrollWidth:document.documentElement.scrollWidth,stage:document.querySelector('#scene,#stage')?.className,canvas:[...document.querySelectorAll('canvas')].map(e=>({width:e.width,height:e.height})),status:document.querySelector('#model-status')?.textContent,finish:document.querySelector('#finish-name')?.textContent,transform:document.querySelector('#phone,#fallback-phone')?.style.transform})`);
  const dimensions = (width, height, mobile = false) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  const drag = async (x, y) => {
    await send('Input.dispatchMouseEvent', {type:'mousePressed', x, y, button:'left', clickCount:1});
    for (let i = 1; i <= 5; i++) { await send('Input.dispatchMouseEvent', {type:'mouseMoved',x:x+i*20,y:y-i*6,button:'left',buttons:1}); await delay(30); }
    await send('Input.dispatchMouseEvent', {type:'mouseReleased',x:x+100,y:y-30,button:'left',clickCount:1});
    await delay(700);
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await dimensions(1440, 900);
  const report = {a:{}, b:{}};
  await load('saved_resource.html');
  report.a.initial = await snapshot();
  report.a.autoImage1 = await screenshot('website-a-desktop.png');
  await delay(750);
  report.a.autoImage2 = await screenshot('website-a-rotated.png');
  await click('#spin-button');
  report.a.pause = await snapshot();
  const firstPause = await evaluate(`document.querySelector('#phone').style.transform`);
  await delay(300);
  report.a.pauseStable = firstPause === await evaluate(`document.querySelector('#phone').style.transform`);
  await click('#front-button');
  await delay(1200);
  await screenshot('website-a-front.png');
  report.a.front = await snapshot();
  await click('[data-finish="gold"]');
  await delay(1200);
  report.a.gold = await snapshot();
  await screenshot('website-a-gold.png');
  await drag(1050, 450);
  report.a.drag = await snapshot();
  await click('[data-finish="green"]');
  await delay(900);
  await dimensions(390, 844, true);
  await delay(350);
  await screenshot('website-a-mobile.png');
  report.a.mobile = await snapshot();
  console.log('Website A screenshots and controls checked.');
  await dimensions(1440, 900);
  await load('saved_resource(1).html');
  report.b.initial = await snapshot();
  report.b.autoImage1 = await screenshot('website-b-desktop.png');
  await delay(750);
  report.b.autoImage2 = await screenshot('website-b-rotated.png');
  await click('#auto-toggle');
  report.b.pause = await snapshot();
  await delay(700);
  await screenshot('website-b-paused.png');
  await click('#front-view');
  await delay(1100);
  await screenshot('website-b-front.png');
  report.b.front = await snapshot();
  await click('[data-finish="gold"]');
  await click('#back-view');
  await delay(1100);
  await screenshot('website-b-gold.png');
  report.b.gold = await snapshot();
  await drag(1030, 450);
  report.b.drag = await snapshot();
  await screenshot('website-b-dragged.png');
  await send('Input.dispatchMouseEvent', {type:'mouseWheel',x:1030,y:450,deltaX:0,deltaY:-350});
  await delay(600);
  report.b.zoom = await snapshot();
  await screenshot('website-b-zoomed.png');
  await click('#open-details');
  report.b.details = await evaluate(`({open:document.querySelector('#details-dialog').open,text:document.querySelector('#details-dialog').innerText})`);
  await screenshot('website-b-details.png');
  await click('#return-to-view');
  report.b.detailsClosed = await evaluate(`!document.querySelector('#details-dialog').open`);
  await click('#fullscreen');
  await delay(350);
  report.b.fullscreen = await evaluate(`({pressed:document.querySelector('#fullscreen').getAttribute('aria-pressed'),element:document.fullscreenElement?.id,fallback:document.querySelector('#showroom').classList.contains('is-fullscreen')})`);
  await click('#fullscreen');
  await click('[data-finish="midnight"]');
  await click('#reset-view');
  await delay(650);
  report.b.reset = await snapshot();
  await dimensions(390, 844, true);
  await delay(650);
  await screenshot('website-b-mobile.png');
  report.b.mobile = await snapshot();
  report.events = events;
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report,null,2));
  console.log(JSON.stringify({a:report.a.initial,b:report.b.initial,bDetails:report.b.details,bFullscreen:report.b.fullscreen,errors:events.map(e=>({method:e.method,params:e.params}))},null,2));
  await send('Browser.close').catch(()=>{});
} finally { ws?.close(); chrome.kill(); }
