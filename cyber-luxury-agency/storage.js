import {freshState,validateState} from './core.js';
export class DemoStore {
 constructor(factory=globalThis.indexedDB) {this.factory=factory;this.db=null;this.memory=freshState();this.warning='';this.channel=null;this.onChange=null;}
 async open() {
  if(!this.factory){this.warning='Az IndexedDB nem elérhető. Ideiglenes memóriamód: az adatok újratöltéskor elvesznek.';return this.read();}
  try {
   this.db=await new Promise((resolve,reject)=>{const req=this.factory.open('noir-prive-demo',2);const timer=setTimeout(()=>reject(new Error('Az adatbázis megnyitása időtúllépés miatt megszakadt.')),5000);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('state'))req.result.createObjectStore('state');};req.onsuccess=()=>{clearTimeout(timer);resolve(req.result);};req.onerror=()=>{clearTimeout(timer);reject(req.error);};req.onblocked=()=>{clearTimeout(timer);reject(new Error('Egy másik lap blokkolja az adatbázis frissítését. Zárd be a régi demólapot.'));};});
   this.db.onversionchange=()=>{this.db.close();this.db=null;this.warning='Az adatbázis frissült egy másik lapon. Töltsd újra az oldalt.';this.onChange?.();};
   if(typeof BroadcastChannel!=='undefined'){this.channel=new BroadcastChannel('noir-prive-sync');this.channel.onmessage=()=>this.onChange?.();}
   await this.mutate(()=>{});return this.read();
  }catch(e){this.warning=`${e.message} Ideiglenes memóriamód: a változások nem lesznek tartósak.`;this.db?.close();this.db=null;return this.memory;}
 }
 async read() {
  if(!this.db)return structuredClone(this.memory);
  return new Promise((resolve,reject)=>{const tx=this.db.transaction('state','readonly'),req=tx.objectStore('state').get('app');req.onsuccess=()=>{try{resolve(req.result?validateState(req.result):freshState());}catch(e){reject(e);}};req.onerror=()=>reject(req.error);});
 }
 async mutate(fn) {
  if(!this.db){const draft=structuredClone(this.memory);const result=fn(draft);this.memory=validateState(draft);return {state:structuredClone(this.memory),result};}
  const output=await new Promise((resolve,reject)=>{
   const tx=this.db.transaction('state','readwrite'),store=tx.objectStore('state'),req=store.get('app');let output,domainError;
   req.onsuccess=()=>{try{
    let draft;try{draft=req.result?validateState(req.result):freshState();}catch(e){store.put(req.result,'corrupt-backup');draft=freshState();this.warning='Sérült demóadatot találtunk. Biztonsági példány megőrizve, új adatokkal indultunk.';}
    const result=fn(draft);store.put(validateState(draft),'app');output={state:draft,result};
   }catch(e){domainError=e;tx.abort();}};
   tx.oncomplete=()=>resolve(output);tx.onabort=()=>reject(domainError??tx.error??new Error('A mentés megszakadt.'));tx.onerror=()=>{};
  });this.channel?.postMessage('changed');return output;
 }
 async replace(raw) {const validated=validateState(raw);return this.mutate(s=>{for(const key of Object.keys(s))delete s[key];Object.assign(s,validated);});}
 async reset() {return this.replace(freshState());}
 async recovery() {if(!this.db)return null;return new Promise((resolve,reject)=>{const r=this.db.transaction('state','readonly').objectStore('state').get('corrupt-backup');r.onsuccess=()=>resolve(r.result??null);r.onerror=()=>reject(r.error);});}
 close(){this.db?.close();this.channel?.close();}
}
