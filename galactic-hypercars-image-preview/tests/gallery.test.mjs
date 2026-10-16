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
assert.equal(manifest.cars.length,1000);
const completed=manifest.cars.filter(c=>c.image);
assert(completed.length>=16);
assert.equal(new Set(manifest.cars.map(c=>c.id)).size,1000);
const hashes=new Set();
for(const car of manifest.cars){const v=catalog.find(v=>v.id===car.id);assert(v);assert.equal(car.name,`${v.manufacturer} ${v.model}`);assert.equal(car.exterior,v.exterior);if(!car.image)continue;const bytes=fs.readFileSync(path.join(root,car.image));assert.equal(bytes.subarray(8,12).toString(),'WEBP');assert(bytes.length<500000);hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));}
assert.equal(hashes.size,completed.length,'No repeated image files');
assert.equal(fs.readdirSync(path.join(root,'images')).filter(f=>f.endsWith('.webp')).length,completed.length);
for (const c of completed.slice(0,8)) {const original=require('node:child_process').execFileSync('git',['show',`HEAD:galactic-hypercars-image-preview/${c.image}`]);assert.deepEqual(fs.readFileSync(path.join(root,c.image)),original,'Approved image unchanged');}
assert.equal(new Set(manifest.cars.map(c=>c.exterior)).size,8);
assert.equal(new Set(manifest.cars.map(c=>c.propulsion)).size,6);
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':file.endsWith('.json')?'application/json':'text/html');res.end(data);});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 for (const width of [375,768,1440]) {
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message)); page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  await page.waitForSelector('article');
  assert.equal(await page.locator('article').count(),12);
  assert.equal(await page.locator('#completed').textContent(),String(completed.length));
  for(const img of await page.locator('.art img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());assert.equal(await img.getAttribute('loading'),'lazy');}
  await page.locator('#next').click(); assert.equal(await page.locator('article').count(),Math.min(12,completed.length-12));
  await page.locator('#search').fill('WT-0016');assert.equal(await page.locator('article').count(),1);
  assert.equal(await page.locator('article h2').textContent(),'Phantom GT-3015');
  await page.locator('.art img').evaluate(i=>i.decode());
  await page.locator('.art').click();assert.equal(await page.locator('img').evaluate(i=>i.naturalWidth),1536);await page.goBack();
  await page.locator('#search').fill('purple'); assert.equal(await page.locator('article').count(),Math.min(12,completed.filter(c=>c.exterior==='Nebula lila').length));
  await page.locator('#search').fill('no such car');assert.equal(await page.locator('article').count(),0);assert.equal(await page.locator('#results').textContent(),'No matching cars.');
  await page.locator('#status').selectOption('all');await page.locator('#search').fill('WT-1000');assert.equal(await page.locator('article').count(),1);assert.equal(await page.locator('article img').count(),0);assert.match(await page.locator('article').textContent(),/Pending generation/);
  await page.locator('#status').selectOption('pending');await page.locator('#search').fill('');assert.match(await page.locator('#results').textContent(),new RegExp(String(1000-completed.length)));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  assert.deepEqual(errors,[]);await page.close();console.log(`PASS ${width}px: decode, search, pagination, pending status, full-image links, no overflow/errors`);
 }
} finally {await browser.close();server.close();}
console.log(`PASS: 1,000 exact catalog mappings; ${completed.length} unique optimized WebP files; approved images unchanged`);
