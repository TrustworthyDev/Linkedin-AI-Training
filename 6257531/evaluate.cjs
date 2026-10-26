const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const root = path.resolve('6257531/Aesthetics_Functionality_Overall Website Preference - 071_files');
const out = path.resolve('.evaluation/6257531');
const pause = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9231', `--user-data-dir=${path.join(out, 'profile')}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let targets;
  for (let i=0; i<40; i++) { try { targets = await (await fetch('http://127.0.0.1:9231/json/list')).json(); break; } catch { await pause(250); } }
  if (!targets) throw new Error('Headless browser did not start');
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, {once: true}));
  let seq=0; const pending = new Map(); const exceptions=[];
  ws.addEventListener('message', e => { const m=JSON.parse(e.data); if (m.id) { const q=pending.get(m.id); pending.delete(m.id); m.error ? q.reject(m.error) : q.resolve(m.result); } else if(m.method==='Runtime.exceptionThrown') exceptions.push(m.params.exceptionDetails.text); });
  const cdp=(method,params={}) => new Promise((resolve,reject) => { const id=++seq; pending.set(id,{resolve,reject}); ws.send(JSON.stringify({id,method,params})); });
  const evaluate=async expression => { const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const click = selector => evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const shot=async (name,full=false) => { const metrics=await cdp('Page.getLayoutMetrics'); const params={format:'png',captureBeyondViewport:full}; if(full) params.clip={x:0,y:0,width:1440,height:Math.ceil(metrics.cssContentSize.height),scale:1}; const r=await cdp('Page.captureScreenshot',params); fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64')); };
  await cdp('Page.enable'); await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  const results={};
  try {
    for(const [label,file] of [['A','saved_resource.html'],['B','saved_resource(1).html']]) {
      await cdp('Page.navigate',{url:pathToFileURL(path.join(root,file)).href});
      for(let i=0;i<40;i++){await pause(100); if(await evaluate('document.readyState')==='complete')break;}
      await evaluate('Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2000))])');
      await pause(1300);
      await shot(label+'-top');
      await evaluate('(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,100));}window.scrollTo(0,0)})()');
      await pause(300); await shot(label+'-full',true);
      results[label]={title:await evaluate('document.title'),initialText:await evaluate('document.body.innerText')};
      results[label].initialChart=await evaluate('document.querySelector(".range-button.active").textContent');
      await click('[data-range="1M"]');
      results[label].changedRange=await evaluate('document.querySelector(".range-button.active").textContent');
      if(label==='A') {
        results.A.quoteBefore=await evaluate('document.querySelector("[data-quote=price][data-symbol=AAPL]").textContent'); await pause(4200);
        results.A.quoteAfter=await evaluate('document.querySelector("[data-quote=price][data-symbol=AAPL]").textContent');
        await click('#chart-type-button'); results.A.chartType=await evaluate('document.querySelector("#chart-type-button").getAttribute("aria-label")');
        for(const view of ['watchlist','portfolio','markets','alerts','overview']) {
          await click(`.nav-item[data-view="${view}"]`);
          results.A[view]=await evaluate('({title:document.querySelector("#page-title").textContent,text:document.querySelector(".dashboard").innerText.slice(0,1300)})');
        }
        await click('.search-trigger');
        results.A.searchOpen=await evaluate('Array.from(document.querySelectorAll("dialog[open]")).map(d=>({id:d.id,inputs:Array.from(d.querySelectorAll("input")).map(i=>({id:i.id,type:i.type})),text:d.innerText.slice(0,500)}))');
        await evaluate('document.querySelector("dialog[open]").close()');
        await click('[data-open-settings]');
        results.A.settings=await evaluate('document.querySelector("dialog[open]").innerText'); await shot('A-settings');
        await evaluate('document.querySelector("dialog[open]").close()');
      } else {
        results.B.quoteBefore=await evaluate('document.querySelector("#selectedPrice")?.textContent'); await pause(2000);
        results.B.quoteAfter=await evaluate('document.querySelector("#selectedPrice")?.textContent');
        await click('.watch-item[data-symbol="AAPL"]');
        results.B.selectedText=await evaluate('document.querySelector("main").innerText.slice(0,1200)');
        await click('#feedToggle'); results.B.feedPaused=await evaluate('document.querySelector("#feedState").textContent');
        await click('#sortMovers'); results.B.sortText=await evaluate('document.querySelector("#sortMovers").textContent');
        results.B.beforeNavigation=await evaluate('document.querySelector("main").innerText');
        await click('.rail-button[aria-label="Portfolio"]');
        results.B.afterNavigation=await evaluate('document.querySelector("main").innerText');
        results.B.navigationChangesContent=results.B.beforeNavigation!==results.B.afterNavigation;
        await click('.rail-button[aria-label="Settings"]'); results.B.dialogs=await evaluate('document.querySelectorAll("dialog[open]").length');
        await click('#addWatch');
        results.B.addWatch=await evaluate('({text:document.querySelector("#searchResults")?.innerText,items:document.querySelectorAll(".watch-item").length})');
        await evaluate('document.querySelector("#symbolSearch").value="apple";document.querySelector("#symbolSearch").dispatchEvent(new Event("input",{bubbles:true}))');
        results.B.searchResults=await evaluate('Array.from(document.querySelectorAll(".search-result")).map(e=>e.innerText)');
        await click('.search-result');
      }
      await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
      await evaluate('window.scrollTo(0,0)'); await pause(700); await shot(label+'-mobile');
      results[label].mobileWidth=await evaluate('({viewport:innerWidth,scroll:document.documentElement.scrollWidth})');
      await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    }
    results.exceptions=exceptions;
    fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
  } finally { await cdp('Browser.close'); ws.close(); chrome.kill(); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
