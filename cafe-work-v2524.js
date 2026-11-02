/* Hearth & Harbor v2.5.24 — Honeybun Café Service & Fair Harvests
 * One real paid shift per in-game day; voluntary non-paying practice any time.
 * Preserve original +45 shift, quest credit, needs trade-off and garden rewards.
 * No real-time wait, stamina purchase, networking, or additional currency.
 */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const SELECTIONS={
 pastry:[
  {id:'berry-bun',label:'Berry blossom bun',color:'#e9a0a7'},
  {id:'honey-biscuit',label:'Honey cloud biscuit',color:'#ebc782'},
  {id:'cinnamon-toast',label:'Cinnamon toast',color:'#e7b27e'},
  {id:'fruit-tart',label:'Orchard fruit tart',color:'#bdc998'}
 ],
 drink:[
  {id:'tea',label:'Meadow tea',color:'#b4ce95'},
  {id:'milk',label:'Warm milk',color:'#ecdfc7'},
  {id:'berry-juice',label:'Berry juice',color:'#de899f'},
  {id:'cocoa',label:'Cloud cocoa',color:'#ac8871'}
 ]
};
const GUESTS=[
 {name:'Mabel',mood:'A tiny pause between tending flowers'},
 {name:'Jun',mood:'Something warm while writing a new story'},
 {name:'Finn',mood:'A treat after the morning fishing'},
 {name:'Bea',mood:'A bright snack while the paint dries'},
 {name:'Rosie',mood:'A rest between market deliveries'},
 {name:'Oliver',mood:'The baker finally gets to taste his own work'}
];
const dayOK=d=>Number.isInteger(d)&&d>=1&&d<=9999;
const shape=raw=>raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
function clean(raw){
 const v=shape(raw),logs=[];
 if(Array.isArray(v.memories))for(const m of v.memories.slice(-100)){
  if(!m||!dayOK(m.day)||!Number.isInteger(m.stars)||m.stars<1||m.stars>3||logs.some(x=>x.day===m.day))continue;
  logs.push({day:m.day,stars:m.stars});
 }
 return {
  shiftDay:dayOK(v.shiftDay)?v.shiftDay:0,
  shifts:Number.isInteger(v.shifts)?clamp(v.shifts,0,9999):0,
  best:Number.isInteger(v.best)?clamp(v.best,0,3):0,
  memories:logs.slice(-24),
  harvestDay:dayOK(v.harvestDay)?v.harvestDay:0,
  plots:Array.isArray(v.plots)?[...new Set(v.plots.filter(p=>Number.isInteger(p)&&p>=0&&p<4))].slice(0,4):[]
 };
}
function orders(day){
 if(!dayOK(day))return [];
 return Array.from({length:3},(_,i)=>{
  const guest=GUESTS[(day+i*2)%GUESTS.length];
  const pastry=SELECTIONS.pastry[(day+i*3)%4];
  const drink=SELECTIONS.drink[(Math.floor((day-1)/7)+day+i*2)%4];
  return {guest,icon:'☼',pastry:pastry.id,drink:drink.id};
 });
}
function setup(api){
 const {getState,save,updateUI,notify,showModal}=api;
 let session=null;
 const state=()=>getState();
 const record=()=>{const s=state();if(!s.cafeWork||typeof s.cafeWork!=='object'||Array.isArray(s.cafeWork))s.cafeWork=clean(null);return s.cafeWork};
 const paidToday=()=>record().shiftDay===state().day;
 const canHarvest=i=>Number.isInteger(i)&&i>=0&&i<4&&(record().harvestDay!==state().day||!record().plots.includes(i));
 function recordHarvest(i){
  if(!canHarvest(i))return false;
  const d=record();
  if(d.harvestDay!==state().day){d.harvestDay=state().day;d.plots=[];}
  d.plots.push(i);
  return true; // game.js owns its established garden payout and save call
 }
 const moneyText=()=>paidToday()?'✓ Today’s paid shift is complete. Practice remains free.':'Earn 45 coins and complete real service for three customers.';
 function start(){
  if(session)return render();
  session={day:state().day,orders:orders(state().day),index:0,step:'pastry',prepared:[],mistakes:0};
  render();
 }
 const grade=errors=>errors===0?3:errors<=2?2:1;
 const flavor=s=>s.step==='pastry'?'Choose the correct pastry for':'Pour the drink requested by';
 const nameOf=(kind,id)=>SELECTIONS[kind].find(x=>x.id===id)?.label||'Unknown';
 function tray(s){
  const n=s.index,order=s.orders[n],done=s.prepared;
  const pastries=SELECTIONS.pastry,drinks=SELECTIONS.drink;
  const plate=(x,y,p)=>{
   const c=pastries.find(a=>a.id===p)?.color||'#dfbd8f';
   return '<ellipse cx="'+x+'" cy="'+(y+26)+'" rx="51" ry="13" fill="#c49d81" opacity=".24"/>'+
    '<ellipse cx="'+x+'" cy="'+(y+19)+'" rx="47" ry="21" fill="#eef5df" stroke="#9dbfae" stroke-width="4"/>'+
    '<ellipse cx="'+x+'" cy="'+(y+12)+'" rx="38" ry="23" fill="'+c+'" stroke="#c58d68" stroke-width="3"/>'+
    '<path d="M'+(x-22)+' '+y+'q26-15 43 0" fill="none" stroke="#ffeec9" stroke-width="4"/>'+
    '<path d="M'+(x-9)+' '+(y+7)+'q10 7 18 0" fill="none" stroke="#bc8769" stroke-width="2"/>';
  };
  const cup=(x,y,d)=>{
   const c=drinks.find(a=>a.id===d)?.color||'#dfd2b5';
   return '<path d="M'+(x-25)+' '+(y-17)+'h50l-6 51h-39Z" fill="#f9ead9" stroke="#967965" stroke-width="3"/>'+
    '<ellipse cx="'+x+'" cy="'+(y-15)+'" rx="25" ry="10" fill="'+c+'" stroke="#ac8c72" stroke-width="3"/>'+
    '<path d="M'+(x+23)+' '+(y-10)+'q34 0 19 25q-8 10-22 3" fill="none" stroke="#ecddc5" stroke-width="7"/>'+
    '<path d="M'+(x-9)+' '+(y-34)+'q-9-11 2-19M'+(x+9)+' '+(y-35)+'q-11-13 0-20" fill="none" stroke="#fff3e1" stroke-width="3" opacity=".65"/>';
  };
  let art='<rect x="9" y="10" width="350" height="160" rx="21" fill="#aa7855" opacity=".28"/>'+
  '<rect x="9" y="4" width="350" height="152" rx="22" fill="#ebc793" stroke="#b0805e" stroke-width="5"/>'+
  '<path d="M20 35h327M20 128h327" stroke="#f9e2b8" stroke-width="2" opacity=".65"/>'+
  '<ellipse cx="180" cy="139" rx="121" ry="15" fill="#8c694f" opacity=".18"/>'+
  '<rect x="60" y="48" width="244" height="93" rx="30" fill="#d0aa7f" stroke="#9e7357" stroke-width="6"/>';
  const p=s.step==='drink'?order.pastry:null;
  if(p)art+=plate(134,88,p);
  else art+='<ellipse cx="134" cy="108" rx="47" ry="21" fill="#f3e8d2" stroke="#bb9d7b" stroke-width="3"/>';
  if(s.step==='drink')art+='<ellipse cx="247" cy="103" rx="26" ry="15" fill="#f6eddb" stroke="#ac8f73" stroke-width="3"/>';
  art+='<path d="M59 65q-22-5-24 19M307 65q22-5 22 17" fill="none" stroke="#f7daae" stroke-width="5"/>';
  return '<svg class="hc24-art" role="img" aria-label="Illustrated café serving tray with '+(p?'a prepared pastry and an empty cup':'an empty pastry plate')+'" viewBox="0 0 368 177" xmlns="http://www.w3.org/2000/svg">'+art+'</svg>';
 }
 function render(message=''){
  if(!session)return;
  const s=session,o=s.orders[s.index],choices=SELECTIONS[s.step];
  const ordersRead=s.orders.map((r,i)=>'<span class="'+(i<s.index?'is-done':i===s.index?'is-current':'')+'">'+(i<s.index?'✓':'✦')+' '+r.guest.name+'</span>').join('');
  const buttons=choices.map(item=>'<button data-act="cafe24-select" data-id="'+item.id+'"><span class="hc24-chip" style="--chip:'+item.color+'"></span>'+item.label+'</button>').join('');
  showModal('cafe24-game','<div class="hc24"><div class="hc24-eyebrow">HONEYBUN CAFÉ · A REAL LITTLE SHIFT</div><h2>Serve with a smile</h2><div class="hc24-guests">'+ordersRead+'</div><div class="hc24-note"><b>'+o.guest.name+' is at the counter</b><p>'+o.guest.mood+'. '+flavor(s)+' '+o.guest.name+': <strong>'+nameOf(s.step,o[s.step])+'</strong>.</p></div><div class="hc24-board">'+tray(s)+'<div class="hc24-controls" role="group" aria-label="Serving choices">'+buttons+'</div></div><div class="hc24-progress" role="progressbar" aria-label="Orders served" aria-valuemin="0" aria-valuemax="6" aria-valuenow="'+(s.index*2+(s.step==='drink'?1:0))+'"><i style="width:'+(s.index*2+(s.step==='drink'?1:0))*100/6+'%"></i></div><p class="hc24-feedback" role="status" aria-live="polite">'+(message||'Choose carefully. Mistakes are gentle and never cost food.')+'</p><small>'+s.index+' of 3 guests fully served · '+s.mistakes+' gentle retries · '+(paidToday()?'Practice: no coin reward':'Paid shift: 45 coins')+'</small><button class="hc24-exit" data-act="cafe24-leave">Leave the counter</button></div>');
 }
 function choose(which){
  const s=session;if(!s||s.day!==state().day){session=null;return cafe(); }
  if(!SELECTIONS[s.step].some(x=>x.id===which))return;
  const o=s.orders[s.index];
  if(which!==o[s.step]){
   s.mistakes=clamp(s.mistakes+1,0,99);return render('A different '+(s.step==='pastry'?'pastry':'drink')+' was requested. Try again — nothing is wasted.');
  }
  if(s.step==='pastry'){s.step='drink';return render('Lovely pastry! Now complete the drink on the same tray.');}
  s.prepared.push({guest:o.guest.name,pastry:o.pastry,drink:o.drink});
  s.index++;s.step='pastry';
  if(s.index===s.orders.length)return finish();
  render('Perfectly served! The next neighbor is ready.');
 }
 function finish(){
  const s=session;if(!s||s.day!==state().day||s.prepared.length!==3)return cancel();
  session=null;
  const r=record(),rating=grade(s.mistakes),paid=!paidToday();
  if(paid){
   r.shiftDay=state().day;r.shifts=clamp(r.shifts+1,0,9999);
   r.memories.push({day:state().day,stars:rating});r.memories=r.memories.slice(-24);
   state().coins=clamp((state().coins||0)+45,0,1000000);
   state().needs.energy=clamp((state().needs.energy||0)-13,0,100);
   state().needs.fun=clamp((state().needs.fun||0)+9,0,100);
   api.onPaidShift?.(); // preserves the original café shift journal quest
  }
  r.best=Math.max(r.best,rating);
  save();updateUI();
  notify(paid?'Shift finished! +45 coins and a new café memory.':'Wonderful practice! Your paid shift is already complete today.');
  showModal('cafe24-result','<div class="hc24 hc24-result"><div class="hc24-eyebrow">HONEYBUN CAFÉ · SERVICE COMPLETE</div><span aria-hidden="true">✿</span><h2>Three happy customers!</h2><p>Mabel and friends will remember your warm welcome. Every tray you prepared helped the café feel a little more like home.</p><strong>'+('★'.repeat(rating))+('☆'.repeat(3-rating))+'</strong><div class="hc24-pay">'+(paid?'🪙 +45 · Fun +9 · Energy −13 · Work quest +1':'✦ Practice shift — no extra coins or need rewards')+'</div><button data-act="cafe24-menu">Back to Honeybun Café</button></div>');
 }
 function cafe(){
  session=null;
  showModal('cafe','<h2>🥐 Honeybun Café</h2><p>Oliver’s little bakery serves real neighbors. Complete a three-guest service shift, pairing the right pastries and drinks in a tactile serving minigame.</p><div class="hc24-status"><b>'+moneyText()+'</b><small>'+record().shifts+' paid shifts completed · best: '+('★'.repeat(record().best||0))+'</small></div><button class="btn" data-act="cafe24-start">'+(paidToday()?'Practice serving neighbors':'Begin today’s paid café shift · 🪙 45')+'</button><button class="btn" data-act="trade-oliver">Wrap a cooked plate for Oliver</button><button class="btn" data-act="eat">Have a treat (10 🪙)</button>');
 }
 function cancel(){session=null;cafe()}
 function handle(action,id){
  if(action==='cafe24-menu')return cafe();
  if(action==='cafe24-start')return start();
  if(action==='cafe24-select')return choose(id);
  if(action==='cafe24-leave')return cancel();
 }
 return {cafe,start,choose,finish,cancel,handle,paidToday,canHarvest,recordHarvest,orders,
  get session(){return session},get record(){return record()}};
}
root.HearthCafeWork={clean,setup,orders,SELECTIONS};
})(window);
