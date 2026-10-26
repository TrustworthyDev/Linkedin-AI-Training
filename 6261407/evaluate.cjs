const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const root = path.resolve('6261407/Aesthetics_Functionality_Overall Website Preference - 219_files');
const out = path.resolve('.evaluation/6261407');
const pause = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9231', `--user-data-dir=${path.join(out, 'profile')}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let targets;
  for (let i=0; i<40; i++) { try { targets = await (await fetch('http://127.0.0.1:9231/json/list')).json(); break; } catch { await pause(250); } }
  if (!targets) throw new Error('Headless browser did not start');
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, {once: true}));
  let seq=0; const pending = new Map();
  ws.addEventListener('message', e => { const m=JSON.parse(e.data); if (m.id) { const q=pending.get(m.id); pending.delete(m.id); m.error ? q.reject(m.error) : q.resolve(m.result); } });
  const cdp=(method,params={}) => new Promise((resolve,reject) => { const id=++seq; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); });
  const evaluate=async expression => { const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const shot=async (name,full=false) => { const metrics=await cdp('Page.getLayoutMetrics'); const params={format:'png',captureBeyondViewport:full}; if(full) params.clip={x:0,y:0,width:1440,height:Math.ceil(metrics.cssContentSize.height),scale:1}; const r=await cdp('Page.captureScreenshot',params); fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64')); };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  const results={};
  for(const [label,file] of [['A','saved_resource.html'],['B','saved_resource(1).html']]) {
    await cdp('Page.navigate',{url:pathToFileURL(path.join(root,file)).href});
    for(let i=0;i<40;i++){await pause(100); if(await evaluate('document.readyState')==='complete')break;}
    await evaluate('Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])');
    await pause(1300);
    await shot(label+'-top');
    await evaluate('(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,160));}window.scrollTo(0,0)})()');
    await pause(700); await shot(label+'-full',true);
    await evaluate('document.getElementById("collection").scrollIntoView()'); await pause(900); await shot(label+'-collection');
    results[label]={title:await evaluate('document.title'),text:await evaluate('document.body.innerText')};
    if(label==='A') {
      results.A.logoCount=await evaluate('document.querySelectorAll(".logo-entry").length');
      results.A.initialPaint=await evaluate('document.querySelector("[data-gradient]").getAttribute(document.querySelector("[data-gradient]").dataset.paint || "fill")');
      await evaluate('document.querySelector("[data-mode=flat]").click()');
      results.A.flatPaint=await evaluate('document.querySelector("[data-gradient]").getAttribute(document.querySelector("[data-gradient]").dataset.paint || "fill")');
      await evaluate('document.querySelector("[data-mode=gradient]").click()');
      results.A.gradientPaint=await evaluate('document.querySelector("[data-gradient]").getAttribute(document.querySelector("[data-gradient]").dataset.paint || "fill")');
      results.A.pressed=await evaluate('Array.from(document.querySelectorAll(".mode-button")).map(e=>({text:e.innerText,pressed:e.getAttribute("aria-pressed")}))');
    } else {
      results.B.logoCount=await evaluate('document.querySelectorAll(".mark-card").length');
      await evaluate('document.querySelector("[data-filter=minimal]").click()');
      results.B.minimalCount=await evaluate('document.querySelectorAll(".mark-card").length');
      results.B.filteredNames=await evaluate('Array.from(document.querySelectorAll(".mark-name")).map(e=>e.innerText)');
      await evaluate('document.querySelector("[data-filter=all]").click()');
      await evaluate('document.querySelector(".collection [data-variant=gradient]").click()');
      results.B.gradientDefs=await evaluate('document.querySelectorAll(".mark-art linearGradient").length');
      await evaluate('document.querySelector(".mark-card").click()'); await pause(400);
      results.B.dialogOpen=await evaluate('document.querySelector("#preview-dialog").open');
      results.B.firstPreview=await evaluate('document.querySelector("#preview-name").innerText');
      await shot('B-preview');
      await evaluate('document.querySelector("#next-logo").click()');
      results.B.nextPreview=await evaluate('document.querySelector("#preview-name").innerText');
      await evaluate('document.querySelector("#preview-dialog [data-close-dialog]").click()');
      results.B.dialogClosed=await evaluate('!document.querySelector("#preview-dialog").open');
      await evaluate('document.querySelector("[data-open-pack]").click()');
      results.B.packOpen=await evaluate('document.querySelector("#pack-dialog").open');
      await evaluate('document.querySelector("#pack-dialog [data-close-dialog]").click()');
      await evaluate('document.querySelector("details summary").click()');
      results.B.accordionOpen=await evaluate('document.querySelector("details").open');
    }
    await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await evaluate('window.scrollTo(0,0)'); await pause(700); await shot(label+'-mobile');
    results[label].mobileWidth=await evaluate('({viewport:innerWidth,scroll:document.documentElement.scrollWidth})');
    if(label==='B') { await evaluate('document.querySelector(".menu-toggle").click()'); results.B.menuOpen=await evaluate('!document.querySelector("#mobile-menu").hidden'); }
    await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  }
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  await cdp('Browser.close'); ws.close(); chrome.kill();
}
main().catch(e=>{console.error(e);process.exitCode=1;});
