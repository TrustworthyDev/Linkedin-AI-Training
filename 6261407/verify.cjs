const {chromium}=require('C:/Users/novav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
async function download(page,button,filename){const pending=page.waitForEvent('download');await button.click();const file=await pending;await file.saveAs(path.join(__dirname,filename));return file.suggestedFilename();}
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const dir=path.resolve(__dirname,'../../6261407/Aesthetics_Functionality_Overall Website Preference - 219_files');
 const a=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 await a.goto(pathToFileURL(path.join(dir,'saved_resource.html')).href);
 console.log(JSON.stringify({case:'A original gradient',gradients:await a.locator('linearGradient').count()}));
 await a.getByRole('button',{name:'Flat',exact:true}).click();
 console.log(JSON.stringify({case:'A flat switch',gradients:await a.locator('linearGradient').count(),pressed:await a.getByRole('button',{name:'Flat',exact:true}).getAttribute('aria-pressed')}));
 console.log(JSON.stringify({case:'A SVG download',filename:await download(a,a.getByRole('button',{name:'Download Geometric Current SVG',exact:true}),'A-geometric-flat.svg')}));
 await a.getByRole('button',{name:'Copy Hidden Tide SVG',exact:true}).click();
 console.log(JSON.stringify({case:'A copy feedback',text:(await a.locator('body').innerText()).slice(-200)}));
 await a.getByRole('button',{name:'Flat',exact:true}).scrollIntoViewIfNeeded();
 await a.screenshot({path:path.join(__dirname,'A-flat-gallery.png')});
 const b=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
 await b.goto(pathToFileURL(path.join(dir,'saved_resource(1).html')).href);
 for(const filter of ['Minimal','Expressive','Brand marks']){
   await b.getByRole('button',{name:filter,exact:true}).click();
   console.log(JSON.stringify({case:'B filter '+filter,status:await b.locator('#collection-status').innerText(),cards:await b.locator('[data-mark-canvas]').count()}));
 }
 await b.locator('[data-filter="all"]').click();
 await b.getByRole('button',{name:'Gradient',exact:true}).click();
 console.log(JSON.stringify({case:'B gradient switch',status:await b.locator('#collection-status').innerText(),gradients:await b.locator('#mark-grid linearGradient').count()}));
 await b.locator('[data-filter="all"]').scrollIntoViewIfNeeded();
 await b.screenshot({path:path.join(__dirname,'B-gradient-gallery.png')});
 await b.getByRole('button',{name:'Explore Pureform, Minimal geometry fish logo',exact:true}).click();
 console.log(JSON.stringify({case:'B preview opened',text:await b.locator('#preview-dialog').innerText()}));
 await b.screenshot({path:path.join(__dirname,'B-preview.png')});
 await b.keyboard.press('ArrowRight');
 console.log(JSON.stringify({case:'B next logo keyboard',title:await b.locator('#preview-name').innerText()}));
 await b.locator('#preview-dialog').getByRole('button',{name:'Flat',exact:true}).click();
 console.log(JSON.stringify({case:'B SVG export',filename:await download(b,b.locator('#download-svg'),'B-negative-space-flat.svg')}));
 console.log(JSON.stringify({case:'B PNG export',filename:await download(b,b.locator('#download-png'),'B-negative-space-flat.png')}));
 const png=fs.readFileSync(path.join(__dirname,'B-negative-space-flat.png'));
 console.log(JSON.stringify({case:'B PNG dimensions',width:png.readUInt32BE(16),height:png.readUInt32BE(20)}));
 await b.setViewportSize({width:390,height:844});
 await b.screenshot({path:path.join(__dirname,'B-preview-mobile.png')});
 await b.getByRole('button',{name:'Close logo preview',exact:true}).click();
 await b.getByRole('button',{name:'Get the pack',exact:true}).click();
 console.log(JSON.stringify({case:'B complete collection ZIP',filename:await download(b,b.locator('#download-pack'),'B-logo-collection.zip')}));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
