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
  '--headless=new', '--remote-debugging-port=9335',
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
    try { targets = await (await fetch('http://127.0.0.1:9335/json/list')).json(); break; }
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
  await dimensions(390, 844, true);
  for (const [file,name] of [['saved_resource.html','website-a-mobile-full.png'],['saved_resource(1).html','website-b-mobile-fresh.png']]) {
    await load(file);
    const metrics = await send('Page.getLayoutMetrics');
    const capture = await send('Page.captureScreenshot', {format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:metrics.cssContentSize.width,height:metrics.cssContentSize.height,scale:1}});
    await fs.writeFile(path.join(out,name),Buffer.from(capture.data,'base64'));
    console.log(JSON.stringify({file,size:metrics.cssContentSize}));
  }
  await send('Browser.close').catch(()=>{});
} finally { ws?.close(); chrome.kill(); }
