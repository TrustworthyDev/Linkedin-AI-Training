const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const out = path.resolve('6250482');
const root = path.join(out, 'Aesthetics_Functionality_Overall Website Preference - 189_files');
const pause = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9231', `--user-data-dir=${path.join(out, 'review-support', 'profile')}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
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
  const results={taskId:'6250482',downloadsTested:false};
  try {
    for(const [label,file] of [['A','saved_resource.html'],['B','saved_resource(1).html']]) {
      await cdp('Page.navigate',{url:pathToFileURL(path.join(root,file)).href});
      for(let i=0;i<60;i++){await pause(100); if(await evaluate('document.readyState')==='complete')break;}
      await evaluate('Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,2500))])');
      await pause(1300);
      await shot('Website-'+label);
      await evaluate('(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,160));}window.scrollTo(0,0)})()');
      await pause(800); await shot('Website-'+label+'-full',true);
      results[label]={title:await evaluate('document.title'),source:file,initialText:await evaluate('document.body.innerText'),images:await evaluate('Array.from(document.images).map(i=>({src:i.getAttribute("src"),complete:i.complete,width:i.naturalWidth}))')};
      const previewSelector = label==='A' ? '#logo-preview' : '#studioPreview';
      const studioSelector = label==='A' ? '#the-logo' : '#studio';
      await evaluate(`document.querySelector(${JSON.stringify(studioSelector)}).scrollIntoView()`); await pause(900);
      await shot('Website-'+label+'-logo-studio');
      results[label].layouts=[];
      for(const layout of ['horizontal','stacked','icon']) {
        await click(`[data-layout="${layout}"]`);
        await pause(100);
        results[label].layouts.push(await evaluate(`({layout:${JSON.stringify(layout)},viewBox:document.querySelector(${JSON.stringify(previewSelector+' svg')}).getAttribute('viewBox'),text:document.querySelector(${JSON.stringify(previewSelector)}).textContent.trim()})`));
      }
      results[label].backgrounds=[];
      for(const theme of label==='A' ? ['forest','leaf','carrot','cream'] : ['forest','white','cream']) {
        await click(`[${label==='A' ? 'data-theme' : 'data-bg'}="${theme}"]`);
        await pause(400);
        results[label].backgrounds.push(await evaluate(`({theme:${JSON.stringify(theme)},background:getComputedStyle(document.querySelector(${JSON.stringify(label==='A' ? '#logo-stage' : '#studioPreview')})).backgroundColor})`));
      }
      await click('[data-layout="horizontal"]');
      await click(label==='A' ? '[data-theme="forest"]' : '[data-bg="forest"]');
      await pause(650); await shot('Website-'+label+'-forest-preview');
      if(label==='A') {
        await evaluate('document.querySelector("#download-format").value="png";document.querySelector("#download-format").dispatchEvent(new Event("change",{bubbles:true}))');
        await click('#transparent-background');
        results.A.exportOptions=await evaluate('({format:document.querySelector("#download-format").value,transparent:document.querySelector("#transparent-background").checked,buttonDisabled:document.querySelector("#download-logo").disabled})');
      } else {
        await evaluate('document.querySelector("#system").scrollIntoView()'); await pause(500); await shot('Website-B-logo-system');
      }
      await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
      await evaluate('window.scrollTo(0,0)'); await pause(800); await shot('Website-'+label+'-mobile');
      results[label].mobileWidth=await evaluate('({viewport:innerWidth,scroll:document.documentElement.scrollWidth})');
      await click(label==='A' ? '.menu-toggle' : '.menu-button');
      results[label].menuOpen=await evaluate(`document.querySelector(${JSON.stringify(label==='A' ? '.menu-toggle' : '.menu-button')}).getAttribute('aria-expanded')`);
      await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
      results[label].menuAfterEscape=await evaluate(`document.querySelector(${JSON.stringify(label==='A' ? '.menu-toggle' : '.menu-button')}).getAttribute('aria-expanded')`);
      await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
    }
    results.exceptions=exceptions;
    fs.writeFileSync(path.join(out,'review-support','results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify(results,null,2));
  } finally { await cdp('Browser.close'); ws.close(); chrome.kill(); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
