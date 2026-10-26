const { chromium } = require('C:/Users/novav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const dir = path.resolve(__dirname, '../../6264396/Aesthetics_Functionality_Overall Website Preference - 068_files');
const report = [];
function record(test, details) { report.push({test, ...details}); console.log(JSON.stringify(report.at(-1))); }
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter(a => a.effect.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => {})));
  });
}
async function saveDownload(page, click, name) {
  const [download] = await Promise.all([page.waitForEvent('download'), click()]);
  const target = path.join(__dirname, name);
  await download.saveAs(target);
  return {filename:download.suggestedFilename(), content:await fs.readFile(target,'utf8')};
}
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true});
  try {
    const errors = [];
    const a = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
    a.on('pageerror', e => { errors.push({site:'Website A', error:String(e)}); console.log('PAGE ERROR '+String(e)); });
    a.on('dialog', d => d.accept());
    await a.goto(pathToFileURL(path.join(dir,'saved_resource.html')).href,{waitUntil:'load'});
    await settle(a);
    record('Website A ready',{title:await a.title()});
    await a.getByRole('button',{name:'Export research report',exact:true}).click({timeout:5000});
    record('Website A export dialog',{text:await a.getByRole('dialog').innerText()});
    const html = await saveDownload(a,()=>a.getByRole('button',{name:'Download HTML',exact:true}).click({timeout:5000}),'current-research-export.html');
    assert(html.content.includes('Demand') && html.content.includes('Seasonality') && html.content.includes('Policy'));
    record('Website A complete research export',{filename:html.filename,bytes:html.content.length,sections:(html.content.match(/class="print-page"/g)||[]).length});
    await a.getByRole('link',{name:/GDP contribution/}).click();
    const gdp = await saveDownload(a,()=>a.getByRole('button',{name:'Download data',exact:true}).click(),'current-gdp.csv');
    assert.equal(gdp.content.trim().split(/\r?\n/).length,6);
    record('Website A GDP download',{filename:gdp.filename,rows:5});
    await a.locator('#gdp-file').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('year,share\n2021-22,2\n2022-23,3\n2023-24,4\n2024-25,5\n2025-26,6\n')});
    await a.waitForFunction(()=>document.querySelector('main').innerText.includes('6.0%'));
    record('Website A GDP import',{latestValue:'6.0%'});
    await a.getByRole('link',{name:/Seasonality & pricing/}).click();
    await a.locator('#season-destination').selectOption('Manali');
    assert((await a.locator('main').innerText()).includes('Manali: the annual rhythm'));
    record('Website A destination choice',{destination:'Manali'});
    await a.getByRole('link',{name:/Demand-supply model/}).click();
    const before = await a.locator('#model-outputs').innerText();
    await a.locator('#model-festival').focus();
    await a.locator('#model-festival').press('ArrowRight');
    const after = await a.locator('#model-outputs').innerText();
    assert.notEqual(before,after);
    await a.getByRole('button',{name:'Reset model',exact:true}).click();
    assert.equal(await a.locator('#model-outputs').innerText(),before);
    await a.getByRole('button',{name:'3-page brief',exact:true}).click();
    assert.equal(await a.locator('.slide-tabs button').count(),3);
    await a.locator('.slide-tabs button').nth(2).click();
    assert((await a.getByRole('dialog').innerText()).includes('Page 3 / 3'));
    await a.keyboard.press('Escape');
    record('Website A model',{updates:true,reset:true,briefPages:3});
    await a.getByRole('link',{name:/Tourist spending survey/}).click();
    await a.locator('#survey-file').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('destination,food,transportation,shopping,entertainment,accommodation\nGoa,100,200,300,400,500\nJaipur,200,400,600,800,1000\n')});
    await a.waitForFunction(()=>document.querySelector('main').innerText.includes('2 / 20 responses'));
    await a.locator('#survey-filter').selectOption('Jaipur');
    assert((await a.locator('main').innerText()).includes('1-1 of 1 responses'));
    record('Website A survey',{importedResponses:2,filteredResponses:1});
    await a.getByRole('link',{name:'Overview',exact:true}).click();
    await a.setViewportSize({width:390,height:844});
    await settle(a);
    await a.screenshot({path:path.join(__dirname,'current-Website-A-mobile.png'),fullPage:true});
    record('Website A mobile',{width:await a.evaluate(()=>document.documentElement.scrollWidth)});
    const b = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce',acceptDownloads:true});
    b.on('pageerror', e => errors.push({site:'Website B',error:String(e)}));
    await b.goto(pathToFileURL(path.join(dir,'saved_resource(1).html')).href,{waitUntil:'load'});
    await settle(b);
    const template = await saveDownload(b,()=>b.getByRole('button',{name:'Download CSV template',exact:true}).click(),'current-survey-template.csv');
    assert(template.content.includes('accommodation,food,transport,shopping,entertainment'));
    record('Website B survey template',{filename:template.filename,lines:template.content.trim().split(/\r?\n/).length});
    await b.locator('#csv-input').setInputFiles({name:'test.csv',mimeType:'text/csv',buffer:Buffer.from('Visitor type,Trip length,Accommodation,Food,Transportation,Shopping,Entertainment\nDomestic,2,500,100,200,300,400\nInternational,4,1000,200,400,600,800\n')});
    await b.waitForFunction(()=>document.getElementById('data-count').textContent.includes('2 / 20'));
    record('Website B survey',{count:await b.locator('#data-count').innerText()});
    const bModelBefore = await b.locator('#demand-result').innerText();
    await b.locator('#trip-price').focus();
    await b.locator('#trip-price').press('ArrowRight');
    assert.notEqual(await b.locator('#demand-result').innerText(),bModelBefore);
    await b.locator('#reset-model').click();
    assert.equal(await b.locator('#demand-result').innerText(),bModelBefore);
    record('Website B model',{updates:true,reset:true});
    await b.setViewportSize({width:390,height:844});
    for (const item of await b.locator('.reveal, #gdp-chart').all()) {
      await item.scrollIntoViewIfNeeded();
      await b.waitForFunction(el=>el.classList.contains('is-visible'),await item.elementHandle());
    }
    await settle(b);
    await b.evaluate(()=>window.scrollTo(0,0));
    await b.screenshot({path:path.join(__dirname,'current-Website-B-mobile.png')});
    await b.locator('#national-title').scrollIntoViewIfNeeded();
    await b.screenshot({path:path.join(__dirname,'current-Website-B-mobile-report.png')});
    record('Website B mobile',{width:await b.evaluate(()=>document.documentElement.scrollWidth),unrevealed:await b.locator('.reveal:not(.is-visible)').count()});
    assert.equal(errors.length,0);
    record('Runtime errors',{errors});
    await fs.writeFile(path.join(__dirname,'current-results.json'),JSON.stringify(report,null,2));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
