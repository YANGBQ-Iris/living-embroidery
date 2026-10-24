import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'}),page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const check=(ok,msg)=>{if(!ok)throw Error(msg);checks.push(msg);};
try{
 await page.goto('http://127.0.0.1:5191');await page.locator('#start-experience').waitFor({state:'visible'});await page.waitForTimeout(1900);
 await page.mouse.move(250,420);await page.mouse.down();await page.mouse.move(1100,510,{steps:42});await page.mouse.up();await page.waitForTimeout(800);
 const pixels=()=>page.locator('.welcome-growth').evaluate(c=>[...c.getContext('2d').getImageData(0,0,c.width,c.height).data].filter((x,i)=>i%4===3&&x>5).length);
 check(await pixels()>500,'drag creates bounded visible grass, petals and particles');check(await page.locator('body').getAttribute('data-scene')==='welcome','drawing does not start opening');await page.screenshot({path:'artifacts/46-首页拖动生长.png'});
 await page.waitForTimeout(5800);check(await pixels()===0,'trail disappears after release');await page.locator('#start-experience').click();check(await page.locator('body').getAttribute('data-scene')==='intro','enter button still starts original video');await page.locator('#skip').click();await page.waitForTimeout(1600);if(await page.locator('#garden-guide').isVisible())await page.locator('#guide-close').click();
 await page.locator('[data-plant="round"]').click();await page.waitForTimeout(450);await page.locator('[data-plant="round"]').click();await page.waitForTimeout(600);await page.locator('[data-action="demo"]').click();await page.waitForTimeout(500);await page.screenshot({path:'artifacts/47-单滴清透浇灌.png'});
 check(await page.evaluate(async()=>{const {ArtStudy}=await import('/src/art.js');const c=document.createElement('canvas');document.body.append(c);const art=new ArtStudy(c,'moisture');art.respond();const one=art.pours.length===1;art.respond();const bounded=art.pours.length===1;art.time=.4;art.respond();const two=art.pours.length===2;art.time=5.5;art.draw();const gone=art.pours.length===0;art.destroy();c.remove();return one&&bounded&&two&&gone;}),'one drop per action, rate limited, finite lifetime');
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForTimeout(1900);await page.mouse.move(30,240);await page.mouse.down();await page.mouse.move(350,700,{steps:25});await page.mouse.up();await page.waitForTimeout(500);await page.screenshot({path:'artifacts/48-手机首页生长.png'});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile opening has no overflow');check(errors.length===0,'no runtime exceptions');await writeFile('artifacts/growth-water-results.json',JSON.stringify({checks,errors},null,2));console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}
