import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import {createRequire} from 'node:module';
import catalog from '../../galactic-hypercars/catalog-data.js';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json')));
assert.equal(catalog.length,1000);assert.equal(manifest.catalogCount,catalog.length);
assert.equal(manifest.cars.length,8);
const hashes=new Set();
for(const car of manifest.cars){const v=catalog.find(v=>v.id===car.id);assert(v);assert.equal(car.name,`${v.manufacturer} ${v.model}`);assert.equal(car.exterior,v.exterior);const bytes=fs.readFileSync(path.join(root,car.image));assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert(bytes.length<500000);hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));}
assert.equal(hashes.size,8,'No repeated image files');
assert.equal(new Set(manifest.cars.map(c=>c.exterior)).size,8);
assert.equal(new Set(manifest.cars.map(c=>c.propulsion)).size,6);
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':file.endsWith('.json')?'application/json':'text/html');res.end(data);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{for(const width of [375,768,1440]){const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);for(const image of await page.locator('.art img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());}assert.equal(await page.locator('article').count(),8);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');await page.getByRole('navigation',{name:'Jump to a car'}).getByRole('link',{name:'WT-0008'}).click();assert.equal(new URL(page.url()).hash,'#WT-0008');const imageLink=page.locator('#WT-0008 .art');assert.equal(await imageLink.getAttribute('href'),'images/wt-0008.webp');await imageLink.click();assert.equal(await page.locator('img').evaluate(img=>img.naturalWidth),1536);await page.goBack();await page.getByRole('link',{name:'Back to the top'}).click();assert.equal(new URL(page.url()).hash,'#top');assert.deepEqual(errors,[]);if(process.env.EVIDENCE_DIR){for(const image of await page.locator('.art img').all()){await image.scrollIntoViewIfNeeded();await image.evaluate(img=>img.decode());}await page.locator('header').scrollIntoViewIfNeeded();await page.evaluate(()=>new Promise(requestAnimationFrame));fs.mkdirSync(process.env.EVIDENCE_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.EVIDENCE_DIR,`gallery-${width}.png`),fullPage:true});}await page.close();console.log(`PASS ${width}px: eight decoded images, no overflow/errors, anchor and full-image navigation`);}}finally{await browser.close();server.close();}
console.log('PASS: 1,000 source entries; eight exact mappings; eight unique optimized WebP files; eight colors and six propulsion types');
