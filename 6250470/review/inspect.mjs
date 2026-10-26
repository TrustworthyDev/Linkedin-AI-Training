import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.resolve('6250470');
const out = path.join(root, 'review');
await fs.mkdir(path.join(out, 'downloads'), { recursive: true });
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--remote-debugging-port=9333',
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
    try { targets = await (await fetch('http://127.0.0.1:9333/json/list')).json(); break; }
    catch { await delay(250); }
  }
  if (!targets) throw new Error(`Browser did not start: ${stderr.slice(-1500)}`);
  const target = targets.find(t => t.type === 'page');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const callbacks = pending.get(message.id);
      if (callbacks) { pending.delete(message.id); message.error ? callbacks.reject(new Error(JSON.stringify(message.error))) : callbacks.resolve(message.result); }
    } else if (/download|exception/i.test(message.method)) events.push(message);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const nextId = ++id;
    pending.set(nextId, { resolve, reject });
    ws.send(JSON.stringify({ id: nextId, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const screenshot = async name => {
    const metrics = await send('Page.getLayoutMetrics');
    const image = await send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: metrics.cssContentSize.width, height: metrics.cssContentSize.height, scale: 1 }
    });
    await fs.writeFile(path.join(out, name), Buffer.from(image.data, 'base64'));
  };
  const load = async file => {
    await send('Page.navigate', { url: pathToFileURL(path.join(root, 'Aesthetics_Functionality_Overall Website Preference - 090_files', file)).href });
    for (let i = 0; i < 30; i++) {
      if (await evaluate('document.readyState === "complete"')) break;
      await delay(200);
    }
    await delay(1700);
  };
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: path.join(out, 'downloads'), eventsEnabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  const snapshot = () => evaluate(`({ title: document.title, text: document.body.innerText, buttons: [...document.querySelectorAll('button')].map(e => ({ text: e.innerText, id: e.id, label: e.getAttribute('aria-label') })), width: innerWidth, scrollWidth: document.documentElement.scrollWidth })`);
  const report = { a: {}, b: {} };
  await load('saved_resource.html');
  report.a.initial = await snapshot();
  await screenshot('website-a-desktop.png');
  await click('#download-svg');
  await delay(500);
  await click('#download-png');
  await delay(1500);
  report.a.downloads = await fs.readdir(path.join(out, 'downloads'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(350);
  await screenshot('website-a-mobile.png');
  report.a.mobile = await snapshot();
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await load('saved_resource(1).html');
  report.b.initial = await snapshot();
  await screenshot('website-b-desktop.png');
  await click('#label-switch');
  report.b.labelsOff = await evaluate(`({checked: document.querySelector('#label-switch').getAttribute('aria-checked'), opacity: getComputedStyle(document.querySelector('.diagram-labels')).opacity})`);
  await delay(400);
  report.b.labelsOff.opacity = await evaluate(`getComputedStyle(document.querySelector('.diagram-labels')).opacity`);
  await click('#label-switch');
  await click('#flow-button');
  report.b.paused = await evaluate(`({ label: document.querySelector('#flow-button').getAttribute('aria-label'), pressed: document.querySelector('#flow-button').getAttribute('aria-pressed'), paused: document.querySelector('svg.infographic').animationsPaused() })`);
  await click('#flow-button');
  report.b.resumed = await evaluate(`({label: document.querySelector('#flow-button').getAttribute('aria-label'), paused: document.querySelector('svg.infographic').animationsPaused()})`);
  await click('[data-open-about]');
  report.b.dialogOpen = await evaluate(`({open: document.querySelector('#about-dialog').open, text: document.querySelector('#about-dialog').innerText})`);
  await screenshot('website-b-guide.png');
  await click('#dialog-done');
  report.b.dialogClosed = await evaluate(`!document.querySelector('#about-dialog').open`);
  report.b.menuSelectors = await evaluate(`({buttons: [...document.querySelectorAll('[data-format]')].map(e => ({format:e.dataset.format,text:e.innerText})),save:document.querySelector('.save-button').id})`);
  await click('.save-button');
  report.b.menuOpen = await evaluate(`({expanded:document.querySelector('.save-button').getAttribute('aria-expanded'),text:document.querySelector('.download-menu').innerText})`);
  await click('[data-format="svg"]');
  await delay(500);
  await click('.save-button');
  await click('[data-format="png"]');
  await delay(1500);
  report.b.exportStatus = await evaluate(`document.querySelector('#toast-message').textContent`);
  report.b.downloads = await fs.readdir(path.join(out, 'downloads'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await delay(400);
  await screenshot('website-b-mobile.png');
  report.b.mobile = await snapshot();
  report.b.mobileViewBox = await evaluate(`document.querySelector('svg.infographic').getAttribute('viewBox')`);
  report.events = events;
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await send('Browser.close').catch(() => {});
} finally {
  ws?.close();
  chrome.kill();
}
