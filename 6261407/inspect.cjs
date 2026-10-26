const {chromium}=require('C:/Users/novav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const dir=path.resolve(__dirname,'../../6261407/Aesthetics_Functionality_Overall Website Preference - 219_files');
 for(const [name,file] of [['Website-A','saved_resource.html'],['Website-B','saved_resource(1).html']]){
   const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1,reducedMotion:'reduce',acceptDownloads:true});
   const errors=[];page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(pathToFileURL(path.join(dir,file)).href,{waitUntil:'load'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));});
   await page.screenshot({path:path.join(__dirname,name+'-home.png')});
   await page.screenshot({path:path.join(__dirname,name+'-full.png'),fullPage:true});
   console.log(JSON.stringify({name,errors,title:await page.title(),buttons:await page.getByRole('button').evaluateAll(els=>els.map(e=>({text:e.innerText,label:e.getAttribute('aria-label'),id:e.id}))),links:await page.getByRole('link').evaluateAll(els=>els.map(e=>({text:e.innerText,href:e.getAttribute('href')}))),inputs:await page.locator('input,select,textarea').evaluateAll(els=>els.map(e=>({id:e.id,type:e.type,value:e.value}))),text:(await page.locator('body').innerText()).slice(0,18000)}));
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:path.join(__dirname,name+'-mobile.png'),fullPage:true});
   console.log(JSON.stringify({name,mobile:await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}))}));
   await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
