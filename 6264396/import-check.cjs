const {chromium}=require('C:/Users/novav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const p=await browser.newPage({reducedMotion:'reduce'});
 p.on('dialog',d=>d.accept());
 await p.goto(pathToFileURL(path.resolve(__dirname,'../../6264396/Aesthetics_Functionality_Overall Website Preference - 068_files/saved_resource.html')).href);
 await p.getByRole('link',{name:/Tourist spending survey/}).click();
 await p.locator('#survey-file').setInputFiles({name:'review.csv',mimeType:'text/csv',buffer:Buffer.from('destination,food,transportation,shopping,entertainment,accommodation\nGoa,100,200,300,400,500\nJaipur,200,400,600,800,1000\n')});
 await p.waitForFunction(()=>document.querySelector('main').innerText.includes('2 / 20 responses'));
 console.log(JSON.stringify({case:'A confirmed import',text:(await p.locator('main').innerText()).slice(0,1800)}));
 await p.getByRole('link',{name:/GDP contribution/}).click();
 await p.locator('#gdp-file').setInputFiles({name:'review-gdp.csv',mimeType:'text/csv',buffer:Buffer.from('year,share\n2021-22,2\n2022-23,3\n2023-24,4\n2024-25,5\n2025-26,6\n')});
 await p.waitForFunction(()=>document.querySelector('main').innerText.includes('6.0%'));
 console.log(JSON.stringify({case:'A GDP import',text:(await p.locator('main').innerText()).slice(0,1600)}));
 await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1;});
