const { chromium } = require('C:/Users/novav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async () => {
  const outputDir = __dirname;
  const siteDir = path.resolve(__dirname, '../../6264396/Aesthetics_Functionality_Overall Website Preference - 068_files');
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true, args:['--disable-background-networking']});
  for (const [name, filename] of [['Website A','saved_resource.html'],['Website B','saved_resource(1).html']]) {
    const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(pathToFileURL(path.join(siteDir, filename)).href,{waitUntil:'load'});
    await page.screenshot({path:path.join(outputDir,name.replace(' ','-')+'-desktop.png'),fullPage:true});
    console.log(JSON.stringify({name,errors,title:await page.title(),buttons:await page.getByRole('button').allTextContents(),links:await page.getByRole('link').allTextContents(),inputs:await page.locator('input').evaluateAll(els=>els.map(el=>({id:el.id,type:el.type,value:el.value}))),text:(await page.locator('body').innerText()).slice(0,18000)}));
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(outputDir,name.replace(' ','-')+'-mobile.png'),fullPage:true});
    console.log(JSON.stringify({name,mobileWidth:await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}))}));
    await page.close();
  }
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
