const { chromium } = require('C:/Users/novav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
async function settle(page) {
  await page.evaluate(async()=>{await document.fonts.ready; await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));});
}
async function describe(page,name) {
  console.log(JSON.stringify({name,text:(await page.locator('body').innerText()).slice(0,13000),inputs:await page.locator('input,select,textarea').evaluateAll(els=>els.map(el=>({id:el.id,name:el.name,type:el.type,value:el.value}))),buttons:await page.getByRole('button').allTextContents()}));
}
(async()=>{
 const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const dir=path.resolve(__dirname,'../../6264396/Aesthetics_Functionality_Overall Website Preference - 068_files');
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.join(dir,'saved_resource.html')).href);
 await settle(page);
 await page.screenshot({path:path.join(__dirname,'Website-A-home.png')});
 for(const [label,file] of [['GDP contribution','GDP'],['Domestic & international','comparison'],['Seasonality & pricing','seasonality'],['Destination cost-benefit','CVP'],['Tourist spending survey','survey'],['Policy & economic impact','policy'],['Demand-supply model','model']]){
   await page.getByRole('link',{name:new RegExp(label.replace('&','&'))}).click();
   await settle(page);
   await describe(page,'Website A '+file);
   await page.screenshot({path:path.join(__dirname,'Website-A-'+file+'.png'),fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:path.join(__dirname,'Website-A-model-mobile.png'),fullPage:true});
 console.log(JSON.stringify({name:'Website A model mobile',width:await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}))}));
 await page.close();
 const b=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 await b.goto(pathToFileURL(path.join(dir,'saved_resource(1).html')).href);
 await settle(b);
 await b.screenshot({path:path.join(__dirname,'Website-B-home.png')});
 const reveals=b.locator('.reveal');
 for(let i=0;i<await reveals.count();i++){
   await reveals.nth(i).scrollIntoViewIfNeeded();
   await b.waitForFunction(i=>getComputedStyle(document.querySelectorAll('.reveal')[i]).opacity==='1',i);
 }
 await b.screenshot({path:path.join(__dirname,'Website-B-revealed-full.png'),fullPage:true});
 for(const [selector,file] of [['#national-title','GDP'],['#case-title','CVP'],['#survey-title','survey'],['#equilibrium-title','model']]){
   await b.locator(selector).scrollIntoViewIfNeeded();
   await b.screenshot({path:path.join(__dirname,'Website-B-'+file+'.png')});
 }
 await b.locator('#cvp-visits').focus();
 await b.locator('#cvp-visits').press('ArrowRight');
 console.log(JSON.stringify({name:'Website B CVP after increase',text:await b.locator('.case-workbench').innerText()}));
 await b.locator('#trip-price').focus();
 await b.locator('#trip-price').press('ArrowRight');
 console.log(JSON.stringify({name:'Website B model after price increase',text:await b.locator('.model-page').last().innerText()}));
 await b.setViewportSize({width:390,height:844});
 await b.locator('#equilibrium-title').scrollIntoViewIfNeeded();
 await b.screenshot({path:path.join(__dirname,'Website-B-model-mobile.png')});
 await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
