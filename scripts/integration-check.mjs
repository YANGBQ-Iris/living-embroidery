import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'msedge'}),checks=[],errors=[];let activePage;
const root=path.resolve(import.meta.dirname,'..');
const base=process.env.SITE_URL||'http://127.0.0.1:5190',out=path.join(root,'output/playwright');await mkdir(out,{recursive:true});
async function gardenIsClean(page,label){
 await page.waitForFunction(()=>document.body.dataset.scene==='garden'&&scrollY<2&&getComputedStyle(document.querySelector('#experience')).opacity==='1'&&getComputedStyle(document.querySelector('#plant-studio')).opacity==='0'&&!document.querySelector('#experience').inert);
 assert.equal(await page.locator('.sensor-live-canvas').count(),0,label+' live sensor canvas cleaned up');checks.push(label);
}
async function enterPlant(page,id,type){
 await page.locator(`[data-plant=${id}]`).click();await page.waitForTimeout(350);if(await page.locator('body').getAttribute('data-scene')==='garden')await page.locator(`[data-plant=${id}]`).click();
 await page.waitForFunction(type=>document.body.dataset.scene===type,type);await page.locator('.sensor-live-canvas[data-frame-received=true]').waitFor({timeout:15000});
 assert.equal(await page.locator('#art-canvas').isVisible(),false,'old demo canvas hidden in hardware mode');
 const data=await(await page.request.get(base+'/api/sensors')).json();assert.ok(data.tdConnected);assert.equal(await page.locator('#demo-status').getAttribute('data-source'),data.connected?'serial':'disconnected');checks.push(type+' actual TD view and source state');
}
try{
 for(const viewport of [{width:1440,height:960},{width:390,height:844}]){
  const page=await browser.newPage({viewport});activePage=page;page.on('pageerror',error=>errors.push(error.message));await page.goto(base);await page.locator('#start-experience').click();await page.locator('#skip').click();await page.waitForTimeout(1300);if(await page.locator('#garden-guide').isVisible())await page.locator('#guide-close').click();
  for(let cycle=0;cycle<2;cycle++){
   await enterPlant(page,'orchid','pressure');await page.locator('[data-action=back]').click();await gardenIsClean(page,`pressure return ${viewport.width}/${cycle}`);
   await enterPlant(page,'round','moisture');await page.locator('[data-action=back]').click();await gardenIsClean(page,`moisture return ${viewport.width}/${cycle}`);
   await page.locator('#studio-enter').click();await page.waitForFunction(()=>document.querySelector('#plant-studio').classList.contains('interactive'));await page.locator('#studio-live').waitFor({state:'visible'});
   assert.equal(await page.locator('.sensor-live-canvas').count(),0,'black studio does not mount pressure/moisture frames');
   if(cycle===0&&viewport.width===1440){
    const before=await(await page.request.get(base+'/api/plant-current')).json();await page.locator('#studio-file').setInputFiles(path.join(root,'assets/td-original-plant.jpg'));await page.locator('#plant-preview-dialog').waitFor({state:'visible',timeout:60000});await page.locator('#plant-preview-close').click();const after=await(await page.request.get(base+'/api/plant-current')).json();assert.equal(after.id,before.id,'cancelled upload preserves the current TD plant');checks.push('upload preview cancellation preserves user plant');
   }
   await page.locator('#studio-back').click();await gardenIsClean(page,`black studio return ${viewport.width}/${cycle}`);
   assert.equal(await page.evaluate(()=>ScrollTrigger.getAll().filter(t=>t.vars.id==='plant-studio').length),1,'no duplicate studio scroll triggers');
  }
  await page.locator('#photo-toggle').click();await page.screenshot({path:out+`/complete-garden-${viewport.width}.png`});assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('photos-open')));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));checks.push('garden and garland restored '+viewport.width);await page.close();
 }
 assert.deepEqual(errors,[]);await writeFile(out+'/complete-flow-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
}catch(error){
 console.log('failure',JSON.stringify({checks,errors,dom:await activePage.evaluate(()=>({scene:document.body.dataset.scene,body:document.body.className,main:document.querySelector('#experience').style.cssText,status:document.querySelector('#demo-status')?.textContent,canvas:[...document.querySelectorAll('#prototype-frame canvas')].map(c=>({html:c.outerHTML,visibility:getComputedStyle(c).visibility,display:getComputedStyle(c).display,rect:c.getBoundingClientRect().toJSON()}))}))},null,2));await activePage.screenshot({path:out+'/complete-flow-failure.png'});throw error;
}finally{await browser.close();}
