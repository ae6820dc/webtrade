import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshState,generateUser,selectUser,wallet,validateState,PROGRAM_ID} from '../core.js';
import {PROGRAM_ID as other} from '../../galactic-hypercars/storage.js';
test('fixed distinct program IDs and atomic PIN protection',()=>{
 assert.ok(readFileSync(new URL('../index.html',import.meta.url),'utf8').includes(PROGRAM_ID));assert.ok(readFileSync(new URL('../../galactic-hypercars/index.html',import.meta.url),'utf8').includes(other));
 assert.match(PROGRAM_ID,/^[a-f0-9]{32}$/);assert.match(other,/^[a-f0-9]{32}$/);assert.notEqual(PROGRAM_ID,other);
 const s=freshState(),before=structuredClone(s);assert.throws(()=>generateUser(s,'0000'));assert.deepEqual(s,before);
 const a=generateUser(s,'1111');assert.match(a.name,/^[0-9A-F]{8}$/);assert.equal(s.session,a.id);s.favorites=['NP-0001'];wallet(s,100);
 const b=generateUser(s,'1111');assert.notEqual(a.name,b.name);assert.deepEqual(s.favorites,[]);assert.equal(b.balance,25000);
 selectUser(s,a.id);assert.deepEqual(s.favorites,['NP-0001']);assert.equal(a.balance,25100);assert.equal(validateState(JSON.parse(JSON.stringify(s))).session,a.id);
});
