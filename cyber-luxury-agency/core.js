// Pure domain operations. Browser-local role checks are demonstration rules, not security.
export const VERSION = 2;
export const CATEGORIES = ['Gálakíséret', 'Kulturális program', 'Vacsoratársaság', 'Városi séta', 'Virtuális beszélgetés', 'Stílustanácsadás'];
export const MEMBERSHIPS = [{id:'silver',name:'Silver',price:2500,discount:.05},{id:'gold',name:'Gold',price:5000,discount:.1},{id:'black',name:'Black',price:9000,discount:.15}];
export const fold = s => String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const freshState = () => ({version:VERSION,users:[],session:null,favorites:[],compare:[],recent:[],savedSearches:[],bookings:[],transactions:[],messages:[],reports:[],ads:[],overrides:{},reviewModeration:{},categories:[...CATEGORIES],campaigns:[{code:'PRIVE10',discount:.1,active:true},{code:'WELCOME20',discount:.2,active:true}],notifications:[],audit:[],views:{}});
const fail = m => {throw new Error(m);};
export const currentUser = s => s.users.find(u=>u.id===s.session) ?? null;
export function requireRole(s,roles) { const u=currentUser(s); if(!u || !roles.includes(u.role)) fail('Ehhez a művelethez megfelelő demófiók szükséges.'); return u; }
export function audit(s,action) { s.audit.unshift({id:uid(),date:new Date().toISOString(),user:s.session ?? 'visitor',action}); s.audit=s.audit.slice(0,500); }
export function notify(s,text,userId=s.session) {s.notifications.unshift({id:uid(),userId,text,read:false,date:new Date().toISOString()});s.notifications=s.notifications.slice(0,200);}
export function register(s,{name,handle,password,role,adult}) {
  if(!adult) fail('A regisztrációhoz 18+ nyilatkozat szükséges.');
  if(!['customer','advertiser'].includes(role)) fail('Érvénytelen regisztrációs szerepkör.');
  name=String(name??'').trim();handle=fold(String(handle??'').trim());
  if(name.length<2 || name.length>60 || !/^[a-z0-9_-]{3,30}$/.test(handle)) fail('Adj meg nevet és 3–30 karakteres demóazonosítót (betű, szám, _, -).');
  if(typeof password!=='string'||password.length<8||password.length>100)fail('A demójelszó 8–100 karakter legyen. Valódi jelszavadat ne használd!');
  if(s.users.some(u=>u.handle===handle)) fail('Ez a demóazonosító már foglalt.');
  const u={id:uid(),name,handle,password,role,balance:25000,membership:null,points:0};s.users.push(u);s.session=u.id;
  transaction(s,u,25000,'Kezdő demóegyenleg','seed');audit(s,'Demóregisztráció');notify(s,'Üdvözlünk! 25 000 fiktív kredit került a pénztárcádba.');return u;
}
export function login(s,handle,password) {const u=s.users.find(u=>u.handle===fold(handle)&&u.password===password);if(!u) fail('Hibás demóazonosító vagy demójelszó.');s.session=u.id;audit(s,'Demóbelépés');return u;}
export function demoLogin(s,role) {
 if(!['customer','advertiser','admin'].includes(role)) fail('Érvénytelen szerepkör.');
 let u=s.users.find(u=>u.handle===`demo-${role}`);if(!u){u={id:uid(),name:({customer:'Privé Vendég',advertiser:'Atelier Hirdető',admin:'Demó Adminisztrátor'})[role],handle:`demo-${role}`,password:'demonstration-only',role,balance:25000,membership:null,points:0};s.users.push(u);transaction(s,u,25000,'Kezdő demóegyenleg','seed');}s.session=u.id;audit(s,`Demószerepkör: ${role}`);return u;
}
export function transaction(s,u,amount,label,type,bookingId=null) {
 if(!Number.isSafeInteger(amount)) fail('Érvénytelen kreditösszeg.');
 const t={id:uid(),userId:u.id,amount,label,type,bookingId,date:new Date().toISOString(),status:'Szimulált · sikeres',balance:u.balance};s.transactions.unshift(t);return t;
}
export function wallet(s,amount,label='Demófeltöltés',type='topup') {
 const u=requireRole(s,['customer','advertiser','admin']);if(!Number.isSafeInteger(amount)||amount<=0||amount>100000)fail('A feltöltés 1–100 000 egész kredit lehet.');u.balance+=amount;transaction(s,u,amount,label,type);audit(s,label);notify(s,`${label}: +${amount} demókredit.`);
}
export function calculate(profile,{packageId='signature',duration=1,code='',membership=null},campaigns=[]) {
 const pkg=profile.packages.find(p=>p.id===packageId);if(!pkg)fail('Ismeretlen csomag.');duration=Number(duration);if(![1,2,3,4].includes(duration)) fail('Az időtartam 1–4 óra lehet.');
 const campaign=code ? campaigns.find(c=>c.active&&c.code===String(code).trim().toUpperCase()):null;if(code&&!campaign)fail('Érvénytelen vagy inaktív promóciós kód.');
 const member=MEMBERSHIPS.find(m=>m.id===membership);const subtotal=profile.price*duration+pkg.extra;const discount=Math.min(.5,(campaign?.discount??0)+(member?.discount??0));return {subtotal,discount,saving:Math.round(subtotal*discount),total:Math.round(subtotal*(1-discount)),duration,package:pkg.name};
}
export function availableSlots(p,date,bookings=[],exclude=null) {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date)))return [];
 const day=new Date(date+'T12:00:00Z').getUTCDay();const today=new Date().toISOString().slice(0,10);const end=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
 if(date<today||date>end||!p.availability.days.includes(day))return [];
 return p.availability.hours.filter(hour=>!bookings.some(b=>b.id!==exclude&&b.profileId===p.id&&b.date===date&&!['cancelled','rejected'].includes(b.status)&& Number(hour.slice(0,2))<Number(b.time.slice(0,2))+b.duration&&Number(hour.slice(0,2))+1>Number(b.time.slice(0,2))));
}
export function isAvailable(p,date,time,duration,bookings=[]) {
 const slots=availableSlots(p,date,bookings);const start=Number(time?.slice(0,2));return [1,2,3,4].includes(duration)&&Array.from({length:duration},(_,i)=>`${String(start+i).padStart(2,'0')}:00`).every(t=>slots.includes(t));
}
export function book(s,p,options) {
 const u=requireRole(s,['customer']);if((s.overrides[p.id]?.status??p.status)!=='approved')fail('Ez a profil nem foglalható.');
 if(!p.categories.includes(options.category))fail('A kategória nem érhető el ennél a profilnál.');
 const quote=calculate(p,{...options,membership:u.membership},s.campaigns);
 if(!isAvailable(p,options.date,options.time,quote.duration,s.bookings))fail('Az időpont nem érhető el a teljes időtartamra.');if(u.balance<quote.total)fail('Nincs elegendő demókredit. Töltsd fel a pénztárcád.');
 const b={id:uid(),userId:u.id,profileId:p.id,profileName:p.name,advertiserId:p.ownerId??null,category:options.category,date:options.date,time:options.time,...quote,status:'confirmed',created:new Date().toISOString(),refunded:false,code:options.code??''};
 u.balance-=quote.total;u.points+=Math.floor(quote.total/100);s.bookings.unshift(b);transaction(s,u,-quote.total,`Demófoglalás: ${p.name}`,'booking',b.id);audit(s,`Szimulált foglalás: ${p.name}`);notify(s,`Szimulált foglalás visszaigazolva: ${p.name}.`);return b;
}
export function cancel(s,id,{reject=false}={}) {
 const actor=requireRole(s,['customer','advertiser','admin']);const b=s.bookings.find(b=>b.id===id);if(!b)fail('Nincs ilyen foglalás.');
 if(actor.role!=='admin'&&actor.id!==b.userId&&!(actor.role==='advertiser'&&actor.id===b.advertiserId))fail('Nincs jogosultság ehhez a foglaláshoz.');
 if(!['confirmed','requested'].includes(b.status)||b.refunded)fail('Ez a foglalás már nem mondható le.');
 const u=s.users.find(u=>u.id===b.userId);u.balance+=b.total;u.points=Math.max(0,u.points-Math.floor(b.total/100));b.refunded=true;b.status=reject?'rejected':'cancelled';transaction(s,u,b.total,'Szimulált teljes visszatérítés','refund',id);audit(s,`Visszatérítés: ${id}`);notify(s,'A lemondott demófoglalás teljes összege visszakerült.',u.id);return b;
}
export function updateBooking(s,id,status) {const u=requireRole(s,['advertiser','admin']);const b=s.bookings.find(x=>x.id===id);if(!b||u.role!=='admin'&&b.advertiserId!==u.id)fail('Nincs jogosultság.');if(status!=='completed'||b.status!=='confirmed')fail('Érvénytelen státuszátmenet.');b.status=status;audit(s,'Foglalás demóstátusza: teljesített');notify(s,'A demófoglalás teljesített státuszt kapott.',b.userId);}
export function buyMembership(s,id) {const u=requireRole(s,['customer','advertiser','admin']);const m=MEMBERSHIPS.find(m=>m.id===id);if(!m)fail('Ismeretlen tagság.');if(u.membership===id)fail('Ez a tagság már aktív.');if(u.balance<m.price)fail('Nincs elegendő kredit.');u.balance-=m.price;u.membership=id;transaction(s,u,-m.price,`Szimulált ${m.name} tagság`,'membership');audit(s,'Prémium demótagság');}
export function redeem(s) {const u=requireRole(s,['customer','advertiser','admin']);if(u.points<100)fail('Legalább 100 hűségpont szükséges.');u.points-=100;u.balance+=500;transaction(s,u,500,'100 hűségpont beváltása','loyalty');}
export function profilesWithState(profiles,s) {return [...profiles,...s.ads].map(p=>({...p,...s.overrides[p.id]}));}
export function filterProfiles(profiles,f={}) {
 let list=profiles.filter(p=>p.status==='approved'&&(!f.q||fold(p.name+' '+p.city+' '+p.bio+' '+p.style).includes(fold(f.q)))&&(!f.city||p.city===f.city)&&(!f.district||p.district===f.district)&&p.age>=Number(f.minAge||21)&&p.age<=Number(f.maxAge||70)&&p.price>=Number(f.minPrice||0)&&p.price<=Number(f.maxPrice||100000)&&(!f.category||p.categories.includes(f.category))&&p.rating>=Number(f.rating||0)&&(!f.premium||p.premium)&&(!f.verified||p.verified)&&(!f.date||availableSlots(p,f.date,f.bookings??[]).length));
 const sorts={recommended:(a,b)=>Number(b.premium)-Number(a.premium)||b.rating-a.rating,'price-asc':(a,b)=>a.price-b.price,'price-desc':(a,b)=>b.price-a.price,rating:(a,b)=>b.rating-a.rating,newest:(a,b)=>b.created.localeCompare(a.created),name:(a,b)=>a.name.localeCompare(b.name,'hu')};return list.sort(sorts[f.sort]??sorts.recommended);
}
export function saveAd(s,input,profiles) {
 const u=requireRole(s,['advertiser']);const old=input.id?s.ads.find(p=>p.id===input.id):null;if(input.id&&(!old||old.ownerId!==u.id))fail('Csak saját hirdetés szerkeszthető.');
 const name=String(input.name??'').trim(),bio=String(input.bio??'').trim(),age=Number(input.age),price=Number(input.price);
 if(name.length<3||name.length>60||bio.length<30||bio.length>2000||!Number.isInteger(age)||age<21||age>70||!Number.isSafeInteger(price)||price<100||price>50000)fail('Név: 3–60 karakter; bemutatkozás: 30–2000; életkor: 21–70; ár: 100–50 000 kr.');
 const categories=input.categories.filter(c=>s.categories.includes(c));const days=input.days.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=6);if(!categories.length||!days.length)fail('Válassz kategóriát és legalább egy elérhető napot.');
 if(!['Budapest','Debrecen','Szeged','Pécs','Győr','Sopron','Balatonfüred'].includes(input.city))fail('Érvénytelen város.');
 const template=profiles[0];const ad={...template,...old,id:old?.id??uid(),ownerId:u.id,name,bio,age,city:input.city,district:String(input.district??'Belváros').slice(0,30),price,categories,style:String(input.style??'Kortárs elegancia').slice(0,100),availability:{days,hours:['14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']},images:input.images?.length?input.images:old?.images??template.images,premium:old?.premium??false,verified:false,rating:0,reviews:[],status:'pending',created:old?.created??new Date().toISOString(),views:0};
 if(old)s.ads[s.ads.indexOf(old)]=ad;else s.ads.push(ad);delete s.overrides[ad.id];audit(s,'Fiktív hirdetés moderálásra beküldve');return ad;
}
export function moderate(s,id,status,profiles) {requireRole(s,['admin']);if(!['approved','rejected','suspended'].includes(status)||!profiles.some(p=>p.id===id))fail('Érvénytelen moderálás.');s.overrides[id]={...s.overrides[id],status};audit(s,`Profil moderálása: ${id} → ${status}`);const p=profiles.find(p=>p.id===id);if(p.ownerId)notify(s,`Hirdetésed demóstátusza: ${status}.`,p.ownerId);}
export function promote(s,id) {const u=requireRole(s,['advertiser']);const p=s.ads.find(x=>x.id===id&&x.ownerId===u.id);if(!p)fail('Saját hirdetés szükséges.');if(p.premium)fail('A kiemelés már aktív.');if(u.balance<1000)fail('Nincs elegendő demókredit.');u.balance-=1000;p.premium=true;transaction(s,u,-1000,'Szimulált kiemelés','promotion');audit(s,'Hirdetés kiemelve');}
export function sendMessage(s,profile,text) {const u=requireRole(s,['customer','advertiser','admin']);text=String(text??'').trim();if(!text||text.length>500||/@|https?:|\+?\d[\d\s-]{6,}/i.test(text))fail('1–500 karakteres demóüzenet küldhető. Ne adj meg valódi elérhetőséget.');s.messages.push({id:uid(),userId:u.id,profileId:profile.id,text,date:new Date().toISOString(),sender:'user'});s.messages.push({id:uid(),userId:u.id,profileId:profile.id,text:`Szimulált automatikus válasz: köszönöm az üzeneted! Ez a beszélgetés csak a demóböngésződben létezik.`,date:new Date().toISOString(),sender:'demo'});notify(s,'Új szimulált válasz érkezett.');}
export function receipt(t) {return `NOIR PRIVÉ — SZIMULÁLT BIZONYLAT\nNEM ADÓÜGYI BIZONYLAT · NINCS VALÓDI FIZETÉS\n\nAzonosító: ${t.id}\nDátum: ${t.date}\nTétel: ${t.label}\nÖsszeg: ${t.amount} fiktív kredit\nEgyenleg: ${t.balance} fiktív kredit\nStátusz: ${t.status}\n${t.bookingId?`Demófoglalás: ${t.bookingId}`:''}\n` ;}
export function validateState(raw) {
 if(!raw||![1,VERSION].includes(raw.version))fail('Nem támogatott vagy sérült demómentés.');
 const s={...freshState(),...raw,version:VERSION};
 const text=(v,max=2000)=>typeof v==='string'&&v.length<=max;
 const identifier=v=>text(v,100)&&/^[A-Za-z0-9-]+$/.test(v);
 const strings=a=>Array.isArray(a)&&a.every(x=>text(x,100));
 const ownId=id=>s.users.some(u=>u.id===id);
 for(const k of ['users','favorites','compare','recent','savedSearches','bookings','transactions','messages','reports','ads','categories','campaigns','notifications','audit'])if(!Array.isArray(s[k])||s[k].length>10000)fail('Sérült vagy túl nagy demóadat.');
 if(new Set(s.users.map(u=>u.id)).size!==s.users.length)fail('Duplikált fiókazonosító.');
 for(const u of s.users)if(!identifier(u.id)||typeof u.handle!=='string'||typeof u.name!=='string'||typeof u.password!=='string'||!['customer','advertiser','admin'].includes(u.role)||!Number.isSafeInteger(u.balance)||u.balance<0||!Number.isSafeInteger(u.points)||u.points<0)fail('Sérült fiókadat.');
 if(s.session!==null&&!s.users.some(u=>u.id===s.session))s.session=null;
 for(const k of ['overrides','views','reviewModeration'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))fail('Sérült beállítás.');
 for(const p of s.ads)if(!identifier(p.id)||typeof p.name!=='string'||p.age<21||!Number.isSafeInteger(p.price)||p.price<100||!Array.isArray(p.images)||p.images.some(src=>typeof src!=='string'||!(/^(\.\/assets\/[^\s<>]+\.svg(?:#\w+)?|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/.test(src)))||!Array.isArray(p.categories)||!Array.isArray(p.packages)||!p.availability||!Array.isArray(p.availability.days)||!Array.isArray(p.availability.hours)||!Array.isArray(p.reviews))fail('Sérült hirdetésadat.');
 for(const b of s.bookings)if(!s.users.some(u=>u.id===b.userId)||!identifier(b.id)||!text(b.profileId,100)||!text(b.profileName,60)||!text(b.category,100)||!text(b.package,100)||!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!/^([01]\d|2[0-3]):00$/.test(b.time)||!Number.isSafeInteger(b.total)||b.total<0||![1,2,3,4].includes(b.duration)||!['confirmed','requested','cancelled','rejected','completed'].includes(b.status))fail('Sérült foglalásadat.');
 for(const t of s.transactions)if(!Number.isSafeInteger(t.amount)||!Number.isSafeInteger(t.balance)||t.balance<0||!identifier(t.id)||!ownId(t.userId)||!text(t.label)||!text(t.type,30)||!text(t.status,100)||typeof t.date!=='string'||!Number.isFinite(Date.parse(t.date)))fail('Sérült tranzakcióadat.');
 for(const c of s.campaigns)if(typeof c.code!=='string'||typeof c.active!=='boolean'||!Number.isFinite(c.discount)||c.discount<0||c.discount>.5)fail('Sérült kampányadat.');
 for(const k of ['favorites','compare','recent','categories'])if(!strings(s[k]))fail('Sérült listamező.');
 if(s.compare.length>4||s.recent.length>20||s.savedSearches.length>10)fail('Túl nagy demólista.');
 for(const x of s.savedSearches)if(!text(x.name,200)||!x.filters||typeof x.filters!=='object'||Array.isArray(x.filters)||Object.values(x.filters).some(v=>!['string','boolean','number'].includes(typeof v)))fail('Sérült keresésadat.');
 for(const p of s.ads)if(!text(p.bio)||!text(p.city,60)||!text(p.district,60)||!text(p.style,100)||!text(p.appearance)||!strings(p.languages)||!strings(p.categories)||!Number.isFinite(p.rating)||p.rating<0||p.rating>5||!Number.isFinite(p.views)||!['approved','pending','rejected','suspended'].includes(p.status)||!ownId(p.ownerId)||p.packages.some(x=>!identifier(x.id)||!text(x.name,100)||!Number.isSafeInteger(x.extra)||x.extra<0)||p.availability.days.some(x=>!Number.isInteger(x)||x<0||x>6)||!strings(p.availability.hours)||p.availability.hours.some(x=>!/^([01]\d|2[0-3]):00$/.test(x))||p.reviews.some(r=>!identifier(r.id)||!text(r.text)||!text(r.name,100)||!Number.isInteger(r.rating)||r.rating<1||r.rating>5))fail('Sérült profilrészlet.');
 for(const n of s.notifications)if(!identifier(n.id)||!text(n.text)||!text(n.date,100)||!ownId(n.userId))fail('Sérült értesítés.');
 for(const m of s.messages)if(!identifier(m.id)||!ownId(m.userId)||!text(m.profileId,100)||!text(m.text,1000)||!text(m.date,100)||!['user','demo'].includes(m.sender))fail('Sérült üzenet.');
 for(const r of s.reports)if(!identifier(r.id)||!text(r.profileId,100)||!text(r.reason,100)||!text(r.text,500)||!text(r.date,100))fail('Sérült jelentés.');
 for(const a of s.audit)if(!identifier(a.id)||!text(a.action)||!text(a.date,100)||!text(a.user,100))fail('Sérült napló.');
 for(const [id,o] of Object.entries(s.overrides))if(!identifier(id)||!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>k!=='status')||!['approved','pending','rejected','suspended'].includes(o.status))fail('Sérült profilfelülírás.');
 for(const [id,n] of Object.entries(s.views))if(!identifier(id)||!Number.isSafeInteger(n)||n<0)fail('Sérült megtekintésadat.');
 for(const [id,n] of Object.entries(s.reviewModeration))if(!identifier(id)||typeof n!=='boolean')fail('Sérült véleménymoderálás.');
 return s;
}
