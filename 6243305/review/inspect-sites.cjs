const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'Aesthetics_Functionality_Overall Website Preference - 223_files');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const files = {a: 'saved_resource.html', b: 'saved_resource(1).html'};
const server = http.createServer((req,res) => {
  const key = req.url.split(/[?#]/)[0].slice(1);
  if (!files[key]) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
  res.end(fs.readFileSync(path.join(source, files[key])));
});
class CDP {
  constructor(ws) {
    this.ws=ws; this.seq=0; this.pending=new Map(); this.events=[];
    ws.addEventListener('message', event => {
      const msg=JSON.parse(event.data);
      if (msg.id) { const request=this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? request.reject(msg.error) : request.resolve(msg.result); }
      else this.events.push(msg);
    });
  }
  send(method,params={}) { return new Promise((resolve,reject) => { const id=++this.seq; this.pending.set(id,{resolve,reject}); this.ws.send(JSON.stringify({id,method,params})); }); }
  async evaluate(expression) { const r=await this.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true}); if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; }
  async click(text) { return this.evaluate(`(() => { const e=[...document.querySelectorAll('button,a')].find(x => x.textContent.trim().toLowerCase() === ${JSON.stringify(text.toLowerCase())}); if(!e) return {missing:${JSON.stringify(text)}}; e.click(); return {clicked:e.textContent.trim()}; })()`); }
  async screenshot(name, full=false) {
    const metric=await this.send('Page.getLayoutMetrics');
    const params={format:'png',captureBeyondViewport:full};
    if(full) params.clip={x:0,y:0,width:1440,height:Math.ceil(metric.cssContentSize.height),scale:1};
    const r=await this.send('Page.captureScreenshot',params);
    fs.writeFileSync(path.join(__dirname,name+'.png'),Buffer.from(r.data,'base64'));
  }
}
let chrome;
async function main() {
  await new Promise(resolve => server.listen(8767,'127.0.0.1',resolve));
  chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',[
    '--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',
    '--remote-debugging-port=9227',`--user-data-dir=${path.join(__dirname,'test-profile')}`,'about:blank'
  ],{windowsHide:true,stdio:'ignore'});
  let targets;
  for(let n=0;n<40;n++) { try { targets=await (await fetch('http://127.0.0.1:9227/json/list')).json(); if(targets.some(x=>x.type==='page')) break; } catch{} await pause(250); }
  const ws=new WebSocket(targets.find(x=>x.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject) => { ws.addEventListener('open',resolve,{once:true}); ws.addEventListener('error',reject,{once:true}); });
  const cdp=new CDP(ws);
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  const downloads=path.join(__dirname,'downloads'); fs.mkdirSync(downloads,{recursive:true});
  await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:downloads,eventsEnabled:true});
  const report={};
  for(const key of ['a','b']) {
    await cdp.send('Page.navigate',{url:'http://127.0.0.1:8767/'+key}); await pause(2500);
    await cdp.screenshot('website-'+key+'-hero'); await cdp.screenshot('website-'+key+'-full',true);
    report[key]={initial:await cdp.evaluate(`({title:document.title,text:document.body.innerText,buttons:[...document.querySelectorAll('button')].map(x=>({text:x.textContent.trim(),label:x.getAttribute('aria-label')})),links:[...document.querySelectorAll('a')].map(x=>({text:x.textContent.trim(),href:x.getAttribute('href')})),stickerOpacity:document.querySelector('.sticker-wrap')?getComputedStyle(document.querySelector('.sticker-wrap')).opacity:null})`)};
    if(key==='a') {
      report.a.inkBefore=await cdp.evaluate(`document.querySelector('#sticker-master').getAttribute('style')`);
      report.a.cycle=await cdp.click('Cycle ink'); await pause(300);
      report.a.inkAfter=await cdp.evaluate(`document.querySelector('#sticker-master').getAttribute('style')`);
      report.a.drawerOpen=await cdp.click('Get the die-cut'); await pause(500);
      report.a.drawer=await cdp.evaluate(`({text:document.querySelector('[role=dialog]')?.innerText,buttons:[...document.querySelectorAll('[role=dialog] button')].map(x=>({text:x.textContent.trim(),label:x.getAttribute('aria-label')}))})`);
      await cdp.evaluate(`document.querySelector('[aria-label="Increase quantity"]').click(); document.querySelector('[aria-label="Increase quantity"]').click();`);
      report.a.quantity=await cdp.evaluate(`document.querySelector('.quantity-control').innerText`);
      report.a.add=await cdp.evaluate(`(() => {const b=document.querySelector('.add-button'); b.click(); return b.textContent;})()`); await pause(300);
      report.a.addResult=await cdp.evaluate(`({dialog:document.querySelector('[role=dialog]')?.innerText,kit:document.querySelector('.kit-button')?.textContent,header:document.querySelector('header').innerText})`);
      await cdp.screenshot('website-a-order');
      await cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      await cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      report.a.escapeClosed=await cdp.evaluate(`!document.querySelector('[role=dialog]')`);
      report.a.download=await cdp.click('Download SVG'); await pause(500);
      report.a.nav=await cdp.click('In the field'); await pause(800);
      report.a.navResult=await cdp.evaluate(`({hash:location.hash,y:scrollY})`);
    } else {
      report.b.nav=await cdp.click('CHOOSE YOUR INK'); await pause(800);
      report.b.navResult=await cdp.evaluate(`({hash:location.hash,y:scrollY})`);
      report.b.colorways=[];
      for(const ink of ['Bone on black','Rust on bone','Black on bone']) {
        report.b.colorways.push(await cdp.evaluate(`(() => {const b=[...document.querySelectorAll('.colorway-option')].find(x=>x.textContent.includes(${JSON.stringify(ink)})); b.click(); return {name:${JSON.stringify(ink)},pressed:b.getAttribute('aria-pressed'),label:document.querySelector('.preview-bottomline').textContent,fill:document.querySelector('.preview-sticker path').getAttribute('fill')};})()`)); await pause(100);
      }
      await cdp.screenshot('website-b-colors');
      report.b.svg=await cdp.click('DOWNLOAD SVG'); await pause(500);
      report.b.png=await cdp.click('DOWNLOAD PNG'); await pause(1500);
      report.b.status=await cdp.evaluate(`document.querySelector('[role=status]').textContent`);
      report.b.top=await cdp.evaluate(`(() => {document.querySelector('.back-to-top').click(); return location.hash;})()`); await pause(800);
      report.b.topY=await cdp.evaluate('scrollY');
    }
    await cdp.send('Page.navigate',{url:'http://127.0.0.1:8767/'+key});
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true}); await pause(2000);
    await cdp.screenshot('website-'+key+'-mobile');
    report[key].mobile=await cdp.evaluate(`({width:innerWidth,bodyWidth:document.body.scrollWidth})`);
    await cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  }
  report.downloads=fs.readdirSync(downloads).map(name=>({name,bytes:fs.statSync(path.join(downloads,name)).size}));
  report.downloadEvents=cdp.events.filter(x=>x.method.startsWith('Browser.download'));
  fs.writeFileSync(path.join(__dirname,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  await cdp.send('Browser.close'); ws.close(); server.close();
}
main().catch(error=>{console.error(error); server.close(); if(chrome) chrome.kill(); process.exitCode=1;});
