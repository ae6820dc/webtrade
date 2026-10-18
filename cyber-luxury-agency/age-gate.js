// Keep the existing key and value; confirmation belongs to the browser profile.
const AGE_CONFIRMATION_KEY='noir-adult';
const gate=document.querySelector('#age-gate');
const check=document.querySelector('#adult-check');
const enter=document.querySelector('#enter');
const error=document.querySelector('#age-error');
function accepted(){
 try{return localStorage.getItem(AGE_CONFIRMATION_KEY)==='yes';}
 catch{return false;}
}
function syncGate(){
 // Always consult persistent storage before showing the confirmation UI.
 if(accepted()){if(gate.open)gate.close();return;}
 check.checked=false;enter.disabled=true;
 if(!gate.open)gate.showModal();
}
export function revokeAgeConfirmation(){
 try{localStorage.removeItem(AGE_CONFIRMATION_KEY);}catch{}
 syncGate();
}
gate.addEventListener('cancel',event=>event.preventDefault());
check.addEventListener('change',()=>{enter.disabled=!check.checked;});
enter.addEventListener('click',()=>{
 if(!check.checked)return;
 try{localStorage.setItem(AGE_CONFIRMATION_KEY,'yes');}
 catch{
  error.textContent='A böngésző nem engedélyezi a tartós mentést. A megerősítés csak ezen a lapon érvényes; új ablakban ismét szükséges lehet.';
 }
 gate.close();
});
document.querySelector('#decline').addEventListener('click',()=>{
 error.textContent='A belépés elutasítva. A demó csak 18 év feletti nyilatkozattal használható. Ezt a lapot biztonságosan bezárhatod.';
 check.checked=false;enter.disabled=true;
});
// Windows that were opened before acceptance must also recognize the saved choice.
window.addEventListener('storage',event=>{
 if(event.storageArea===localStorage&&(event.key===AGE_CONFIRMATION_KEY||event.key===null))syncGate();
});
window.addEventListener('pageshow',syncGate);
syncGate();
