/* Hearth & Harbor v2.5.23 — Village Trades
 * Three genuinely different hands-on commissions at the existing shops.
 * The game's real coins, pantry, prepared dishes, needs and relationships
 * remain authoritative. No timers, new currencies, invented NPCs or API.
 */
(function(root){'use strict';
const IDS=['rosie','oliver','bea'];
const NAMES={rosie:'Rosie',oliver:'Oliver',bea:'Bea'};
const STOCK=[
 {id:'berry',name:'Berries',icon:'🍓',cost:5,color:'#e88998'},
 {id:'apple',name:'Apples',icon:'🍎',cost:5,color:'#e9ba6d'},
 {id:'carrot',name:'Carrots',icon:'🥕',cost:4,color:'#efad6c'},
 {id:'herb',name:'Herbs',icon:'🌿',cost:4,color:'#8dbd88'}
];
const DISHES={toast:'Cinnamon Toast',salad:'Orchard Fruit Salad',soup:'Garden Vegetable Soup',pancakes:'Berry Pancakes',eggs:'Sunny Morning Eggs',noodles:'Herb Garden Noodles',fishplate:'Harbor Grilled Fish',tart:'Honeybun Berry Tart',biscuits:'Honey Cloud Biscuits',jam:'Orchard Apple Jam',skewers:'Picnic Garden Skewers',dumplings:'Little Garden Dumplings'};
const SYMBOLS={berry:'Berry',apple:'Apple',carrot:'Carrot',herb:'Herb',
 fold:'Fold paper',tie:'Tie ribbon',seal:'Stamp seal',
 rose:'Rosy pink',sage:'Sage green',honey:'Honey gold',sky:'Harbor blue'};
const INKS={rose:'#e7a1ae',sage:'#8abca0',honey:'#e5c075',sky:'#91bdd0'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dayOK=d=>Number.isInteger(d)&&d>=1&&d<=9999;
const safeObj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const safeDay=k=>/^[1-9]\d{0,3}$/.test(k)&&Number(k)<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw){
 const v=safeObj(raw),daily={},totals={},memories=[];
 for(const k of Object.keys(safeObj(v.daily)).slice(-90)){
  if(!safeDay(k)||!Array.isArray(v.daily[k]))continue;
  const safe=[...new Set(v.daily[k].filter(id=>IDS.includes(id)))];
  if(safe.length)daily[k]=safe.slice(0,3);
 }
 for(const id of IDS)totals[id]=Number.isInteger(v.totals?.[id])?clamp(v.totals[id],0,9999):0;
 if(Array.isArray(v.memories))for(const row of v.memories.slice(-100)){
  if(!row||!dayOK(row.day)||!IDS.includes(row.id)||!Number.isInteger(row.stars)||row.stars<1||row.stars>3)continue;
  if(memories.some(m=>m.day===row.day&&m.id===row.id))continue;
  const dish=row.id==='oliver'&&Object.hasOwn(DISHES,row.dish)?row.dish:'',
   item=row.id==='rosie'&&STOCK.some(x=>x.id===row.item)?row.item:'';
  memories.push({day:row.day,id:row.id,stars:row.stars,dish,item});
 }
 return {daily:Object.fromEntries(Object.entries(daily).slice(-40)),
  totals,memories:memories.slice(-32)};
}
function offer(day,id){
 if(!dayOK(day)||!IDS.includes(id))return null;
 const index=Math.floor((day-1)/7),season=index%4,d=(day-1)%7;
 if(id==='rosie'){
  const stock=STOCK[(season+d)%STOCK.length];
  const names=[stock.id,STOCK[(season+d+1)%4].id,STOCK[(season+d+2)%4].id];
  const order=[0,1,2].map(i=>names[(i+(day%3))%3]);
  return {id,kind:'produce',stock,quantity:2,sequence:order,reward:22,name:'Pack an orchard delivery',
   text:'Rosie is preparing small neighborhood baskets. Bring two '+stock.name.toLowerCase()+' and help arrange her crates.',
   place:'Rosie’s Little Market',coords:[589,809]};
 }
 if(id==='oliver'){
  const bases=[['fold','tie','seal'],['tie','fold','seal'],['fold','seal','tie']];
  return {id,kind:'parcel',sequence:bases[(day+season)%3],reward:25,name:'Wrap a homemade plate',
   text:'Oliver will deliver a dish you really cooked. Wrap one prepared plate with care; its quality improves the tip.',
   place:'Honeybun Café',coords:[1048,528]};
 }
 const palettes=[['rose','sage','honey'],['sky','honey','rose'],['sage','rose','sky'],['honey','sky','sage']];
 return {id,kind:'art',sequence:palettes[(season+d)%4],cost:6,reward:22,name:'Paint a village welcome card',
  text:'Bea needs hand-painted cards for new visitors. Mix the three seasonal colors in their order.',
  place:'Bea’s Art Corner',coords:[742,823]};
}
function intro(type){
 const paths={
  produce:'A wooden crate, ready for a colorful market delivery.',
  parcel:'A handmade paper parcel for a lovingly prepared dish.',
  art:'A little card painting, bordered by flowers and colored ribbons.'
 };
 return paths[type]||'A cozy village workbench';
}
function artwork(session){
 const o=session.offer,k=o.kind,n=session.done.length;
 const svg=(a)=>'<svg class="vt-illustration" viewBox="0 0 360 176" role="img" aria-label="'+esc(intro(k))+'" xmlns="http://www.w3.org/2000/svg">'+
 '<defs><linearGradient id="vt-paper" x2=".9" y2="1"><stop stop-color="#fff5d7"/><stop offset="1" stop-color="#e7c59b"/></linearGradient><linearGradient id="vt-wood" x2=".7" y2="1"><stop stop-color="#ecc896"/><stop offset="1" stop-color="#ac784f"/></linearGradient></defs>'+a+'</svg>';
 const flower=(x,y,c)=>'<g transform="translate('+x+' '+y+')"><path d="M0 4V23" stroke="#698f65" stroke-width="3"/>'+Array.from({length:5},(_,i)=>{const a=i*Math.PI*2/5;return '<ellipse cx="'+Math.round(Math.cos(a)*10)+'" cy="'+Math.round(Math.sin(a)*10)+'" rx="8" ry="6" fill="'+c+'" transform="rotate('+(i*72)+' '+Math.round(Math.cos(a)*10)+' '+Math.round(Math.sin(a)*10)+')"/>'}).join('')+'<circle r="5" fill="#fbe9ad"/></g>';
 let s='<rect x="8" y="12" width="344" height="155" rx="22" fill="#ac885c" opacity=".35"/><rect x="8" y="6" width="344" height="153" rx="21" fill="url(#vt-wood)" stroke="#9c7454" stroke-width="4"/><path d="M17 46H343M17 121H343" stroke="#f9e0b3" stroke-width="2" opacity=".55"/>';
 if(k==='produce'){
  s+='<path d="M38 59L180 29L320 59V130L180 151L38 130Z" fill="#bd8556" stroke="#80583b" stroke-width="6"/>'+
   '<path d="M38 59L180 82L320 59M180 82V151" stroke="#e9bb86" stroke-width="5" fill="none"/>';
  for(let i=0;i<3;i++){
   const x=98+i*80,y=100+(i%2)*8,type=o.sequence[i],col=STOCK.find(x=>x.id===type)?.color||'#8fb887';
   s+='<ellipse cx="'+x+'" cy="'+y+'" rx="29" ry="21" fill="#e6c397" stroke="#a57455" stroke-width="3"/>';
   if(i<n){
    s+='<g><ellipse cx="'+x+'" cy="'+y+'" rx="23" ry="16" fill="'+col+'" stroke="#916a52" stroke-width="2"/>'+
     '<path d="M'+(x-12)+' '+y+'q12 -11 23 0" fill="none" stroke="#ffe4b4" stroke-width="3"/>'+
     '<path d="M'+x+' '+(y-16)+'q-8-18-18-13q1 13 18 13" fill="#76a56d"/></g>';
   }else s+='<path d="M'+(x-12)+' '+y+'h24" stroke="#be956e" stroke-width="2" stroke-dasharray="3 4"/>';
  }
 }else if(k==='parcel'){
  s+='<ellipse cx="180" cy="134" rx="113" ry="17" fill="#845e4a" opacity=".2"/><path d="M85 52L213 28L289 66L167 93Z" fill="url(#vt-paper)" stroke="#b78b66" stroke-width="4"/>'+
  '<path d="M85 52L167 93V136L85 97ZM167 93L289 66V109L167 136Z" fill="#e2bb89" stroke="#b78b66" stroke-width="4"/>';
  if(n>=1)s+='<path d="M168 91L213 29M167 90L167 135" stroke="#a2b994" stroke-width="14" fill="none" opacity=".9"/>';
  if(n>=2)s+='<path d="M91 54L167 91L284 65M167 93V135" stroke="#d77d8d" stroke-width="9" fill="none" opacity=".92"/>';
  if(n>=3)s+='<ellipse cx="168" cy="89" rx="23" ry="17" fill="#f5d18a" stroke="#b98957" stroke-width="4"/><path d="M158 88q8-15 19-2q-7 14-19 2" fill="#cf8391"/>';
  s+=flower(60,39,'#eeb6c1');
 }else{
  s+='<rect x="91" y="26" width="181" height="120" rx="9" transform="rotate(-3 180 90)" fill="url(#vt-paper)" stroke="#ae8668" stroke-width="4"/>'+
   '<path d="M113 58q59-18 137 0M113 124q66 16 138 0" fill="none" stroke="#ddcaa4" stroke-width="3"/>'+
   flower(129,47,'#eab7c3')+flower(248,118,'#d9c887');
  for(let i=0;i<n;i++){
   const c=INKS[o.sequence[i]]||'#e3a7ac',x=130+i*49,y=94-(i%2)*16;
   s+='<path d="M'+x+' '+(y-18)+'q17 -3 20 15q-10 17-24 6q-11-12 4-21Z" fill="'+c+'" stroke="#aa816b" stroke-width="2"/>'+
    '<path d="M'+(x+2)+' '+(y-8)+'q7 -3 10 4" fill="none" stroke="#fff9df" stroke-width="2"/>';
  }
 }
 return svg(s);
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal}=api;
 const state=()=>getState();
 const data=()=>{const s=state();if(!s.villageTrades||typeof s.villageTrades!=='object'||Array.isArray(s.villageTrades))s.villageTrades=clean(null);return s.villageTrades};
 let session=null;
 const completed=(id,day=state().day)=>data().daily[String(day)]?.includes(id)||false;
 const stars=mistakes=>mistakes===0?3:mistakes===1?2:1;
 const produceReady=o=>(state().cooking?.pantry?.[o.stock.id]||0)>=o.quantity;
 const available=id=>{
  const o=offer(state().day,id);
  if(!o||completed(id))return false;
  if(id==='rosie')return produceReady(o);
  if(id==='bea')return state().coins>=o.cost;
  return Array.isArray(state().cooking?.dishes)&&state().cooking.dishes.some(d=>Object.hasOwn(DISHES,d?.id));
 };
 const total=()=>IDS.reduce((a,id)=>a+(data().totals[id]||0),0);
 const history=()=>data().memories.slice(-8).reverse().map(m=>'<li><span>'+({rosie:'🍎',oliver:'🥐',bea:'🎨'}[m.id])+'</span><b>Day '+m.day+' · '+NAMES[m.id]+'</b><small>'+('★'.repeat(m.stars))+('☆'.repeat(3-m.stars))+(m.dish?' · '+esc(DISHES[m.dish]):m.item?' · '+esc(STOCK.find(x=>x.id===m.item)?.name):' · Welcome card')+'</small></li>').join('');
 function board(){
  session=null;
  const rows=IDS.map(id=>{
   const o=offer(state().day,id),done=completed(id),ready=available(id),count=data().totals[id]||0;
   const line=id==='rosie'?'Bring 2 '+o.stock.name+' · Your pantry: '+(state().cooking?.pantry?.[o.stock.id]||0):
    id==='oliver'?'Bring one real cooked plate · '+(state().cooking?.dishes?.length||0)+' saved dishes':
    '6 coins for supplies · Your coins: '+Math.floor(state().coins);
   return '<article class="vt-contract '+(done?'is-done':'')+'"><div class="vt-contract-top"><span class="vt-host-icon">'+({rosie:'🍎',oliver:'🥐',bea:'🎨'}[id])+'</span><div><small>'+NAMES[id]+' · '+o.place+'</small><h3>'+o.name+'</h3></div></div><p>'+o.text+'</p><div class="vt-contract-meta"><small>'+esc(line)+'</small><span>🪙 '+o.reward+(id==='oliver'?' + plate bonus':id==='bea'?' (minus 6 supplies)':'')+'</span></div><button data-act="trade-travel" data-id="'+id+'" '+(done?'disabled':'')+'>'+(done?'✓ Completed today':ready?'Visit '+NAMES[id]+' to help':'Visit · gather supplies first')+'</button><small class="vt-count">Completed together '+count+' times</small></article>';
  }).join('');
  const memories=history();
  showModal('trade-board','<div class="vt-ui"><div class="vt-eyebrow">THE LIVING VILLAGE · REAL DAILY WORK</div><div class="vt-cover"><small>MAPLEWOOD MAKERS</small><h2>Little Trades & Kindness</h2><p>Three neighbors, three different activities. Give real pantry goods, deliver a dish you cooked or paint a card with Bea. Each commission pays once per in-game day.</p><div class="vt-total">✦ '+total()+' village commissions remembered</div></div><div class="vt-grid">'+rows+'</div><h3 class="vt-history-heading">Your village work journal</h3><ul class="vt-history">'+(memories||'<li>No deliveries yet. A little job is waiting for you!</li>')+'</ul><button class="vt-back" data-act="trade-close">Close journal</button></div>');
 }
 function travel(id){
  const o=offer(state().day,id);if(!o)return board();
  session=null;closeModal();
  api.travelTo(o.coords[0],o.coords[1],()=>station(id));
 }
 function station(id){
  if(!api.isTown()||!IDS.includes(id))return board();
  const o=offer(state().day,id);
  if(completed(id))return showModal('trade-station','<div class="vt-ui"><h2>✨ '+NAMES[id]+' thanks you!</h2><p>You already helped here today. Your work has been remembered in the village journal.</p><button data-act="trade-board">Return to the ledger</button></div>');
  const intro='<div class="vt-ui"><div class="vt-eyebrow">'+esc(o.place.toUpperCase())+'</div><h2>'+o.name+'</h2><p>'+o.text+'</p>';
  if(id==='oliver'){
   const choices=(state().cooking?.dishes||[]).map((d,i)=>Object.hasOwn(DISHES,d?.id)?'<button class="vt-plate" data-act="trade-start" data-id="oliver:'+i+'"><b>'+esc(DISHES[d.id])+'</b><span>'+('★'.repeat(clamp(d.quality|0,1,3)))+' · 🪙 '+(o.reward+clamp(d.quality|0,1,3)*4)+'</span></button>':'').join('');
   return showModal('trade-station',intro+'<h3>Select one dish from your real shelf</h3><div class="vt-plates">'+(choices||'<p>You haven’t prepared a dish yet. Visit Hearth Kitchen first!</p>')+'</div><button data-act="trade-kitchen">Open Hearth Kitchen</button><button class="vt-back" data-act="trade-board">All village commissions</button></div>');
  }
  const ready=available(id),short=id==='rosie'?'You need '+o.quantity+' '+o.stock.name.toLowerCase()+' to fulfill this commission.':'The 6-coin supply fee is charged only when the card is finished.';
  showModal('trade-station',intro+'<div class="vt-notice">'+(ready?'Ready! All your supplies are on hand.':short)+'</div><button data-act="trade-start" data-id="'+id+'" '+(!ready?'disabled':'')+'>Begin hands-on work</button>'+(id==='rosie'?'<button data-act="trade-kitchen">Visit the pantry</button>':'')+'<button class="vt-back" data-act="trade-board">All village commissions</button></div>');
 }
 function start(token){
  if(typeof token!=='string')return;
  const [id,index,...extra]=token.split(':');
  if(!IDS.includes(id)||extra.length||completed(id)||!dayOK(state().day))return board();
  const o=offer(state().day,id);
  if(!o)return board();
  let dish=null,slot=-1;
  if(id==='oliver'){
   if(index===undefined||!/^(?:0|[1-9]\d*)$/.test(index))return station(id);
   slot=Number(index);
   const row=state().cooking?.dishes?.[slot];
   if(!Number.isInteger(slot)||!row||!Object.hasOwn(DISHES,row.id)||!Number.isInteger(row.quality)||row.quality<1||row.quality>3)return station(id);
   dish={id:row.id,quality:row.quality};
  }else if(index!==undefined||!available(id))return station(id);
  session={offer:o,day:state().day,dish,slot,done:[],mistakes:0};
  render();
 }
 function render(message=''){
  if(!session)return board();
  const s=session,o=s.offer,n=s.done.length,allowed=o.kind==='produce'?STOCK.slice():o.kind==='parcel'?[{id:'fold',name:'Fold the corners'},{id:'tie',name:'Tie a ribbon'},{id:'seal',name:'Stamp a seal'}]:[
   {id:'rose',name:'Rosy pink'},{id:'sage',name:'Sage green'},{id:'honey',name:'Honey gold'},{id:'sky',name:'Harbor blue'}];
  const picture=artwork(s),list=allowed.map(item=>'<button data-act="trade-choice" data-id="'+item.id+'" class="vt-option '+(s.done.includes(item.id)&&o.kind==='parcel'?'vt-used':'')+'" '+(s.done.includes(item.id)&&o.kind==='parcel'?'disabled':'')+'>'+esc(item.name||item.name)+'</button>').join('');
  showModal('trade-game','<div class="vt-ui vt-play"><div class="vt-eyebrow">'+esc(o.place)+' · STEP '+(n+1)+' OF '+o.sequence.length+'</div><h2>'+o.name+'</h2><div class="vt-worktop">'+picture+'<p class="vt-next-piece">Next: <b>'+esc(SYMBOLS[o.sequence[n]]||'Choose the correct item')+'</b></p><div class="vt-taps" role="group" aria-label="Choose the next piece">'+list+'</div></div><div class="vt-progress" role="progressbar" aria-label="Commission progress" aria-valuemin="0" aria-valuemax="3" aria-valuenow="'+n+'"><span style="width:'+(n/3*100)+'%"></span></div><p role="status" aria-live="polite">'+(message||'Pick the next '+(o.kind==='produce'?'item for the crate':o.kind==='parcel'?'wrapping step':'paint color')+'. Every choice changes the work in front of you.')+'</p><small>'+n+' of 3 steps finished · '+s.mistakes+' gentle retries</small><button class="vt-back" data-act="trade-cancel">Leave without spending supplies</button></div>');
 }
 function choose(code){
  const s=session;if(!s||typeof code!=='string'||s.day!==state().day||completed(s.offer.id))return cancel();
  if(!/^[a-z]{3,8}$/.test(code))return;
  if(s.done.length>=3)return;
  if(s.offer.sequence[s.done.length]!==code){
   s.mistakes=clamp(s.mistakes+1,0,99);
   render('Try a different '+(s.offer.kind==='art'?'color':'piece')+'. Nothing was used or lost.');
   return;
  }
  s.done.push(code);
  if(s.done.length===3)return finish();
  render('Lovely! Your work is coming together. Choose the next step.');
 }
 function finish(){
  const s=session;if(!s||s.done.length!==3||s.day!==state().day)return cancel();
  const id=s.offer.id,d=data(),world=state();
  if(completed(id))return cancel();
  let reward=s.offer.reward,detail='',quality=stars(s.mistakes);
  if(id==='rosie'){
   const pantry=world.cooking?.pantry;
   const key=s.offer.stock.id;if(!pantry||!Number.isInteger(pantry[key])||pantry[key]<2)return cancel('Your pantry has changed. No delivery was charged.');
   pantry[key]-=2;detail=s.offer.stock.name;
  }else if(id==='oliver'){
   const dishes=world.cooking?.dishes;
   const row=dishes?.[s.slot];if(!row||row.id!==s.dish.id||row.quality!==s.dish.quality)return cancel('That cooked dish is no longer on the shelf. Nothing was delivered.');
   dishes.splice(s.slot,1);reward+=row.quality*4;detail=DISHES[row.id];
  }else{
   if(!Number.isFinite(world.coins)||world.coins<6)return cancel('Not enough coins for the art supplies. No card was delivered.');
   world.coins-=6;detail='Welcome card';
  }
  session=null; // guard all rewards against repeated taps
  const day=String(world.day);if(!Array.isArray(d.daily[day]))d.daily[day]=[];
  d.daily[day].push(id);
  d.daily=Object.fromEntries(Object.entries(d.daily).slice(-40));
  d.totals[id]=clamp((d.totals[id]||0)+1,0,9999);
  d.memories.push({day:world.day,id,stars:quality,dish:id==='oliver'?s.dish.id:'',item:id==='rosie'?s.offer.stock.id:''});
  d.memories=d.memories.slice(-32);
  world.coins=clamp(world.coins+reward,0,1000000);
  world.needs.fun=clamp((world.needs.fun||0)+7,0,100);
  world.needs.social=clamp((world.needs.social||0)+5,0,100);
  world.relations[id]=clamp((world.relations[id]||0)+4,0,100);
  api.onCompleted?.(id,world.day);
  save();updateUI();
  notify(NAMES[id]+' loved your help! +'+reward+' coins');
  const ribbon=d.totals[id]===3?'You’ve earned a permanent hand-painted ribbon at '+s.offer.place+'!':'';
  showModal('trade-result','<div class="vt-ui vt-result"><div class="vt-eyebrow">A LITTLE GOOD WORK · DAY '+world.day+'</div><div class="vt-result-flower" aria-hidden="true">✿</div><h2>Made with care!</h2><p>'+NAMES[id]+' received '+esc(detail)+'. Your kindness has become part of Maplewood’s story.</p><strong>'+('★'.repeat(quality))+' '+('☆'.repeat(3-quality))+'</strong><div class="vt-reward">🪙 +'+reward+' · ♥ +4 friendship · Fun +7 · Social +5</div>'+(ribbon?'<p class="vt-ribbon">'+esc(ribbon)+'</p>':'')+'<button data-act="trade-board">View village journal</button></div>');
 }
 function cancel(message){
  session=null;
  if(message)notify(message);
  board();
 }
 function handle(action,id){
  if(action==='trade-board')return board();
  if(action==='trade-travel')return travel(id);
  if(action==='trade-station')return station(id);
  if(action==='trade-start')return start(id);
  if(action==='trade-choice')return choose(id);
  if(action==='trade-cancel')return cancel();
  if(action==='trade-close'){session=null;return closeModal()}
  if(action==='trade-kitchen'){session=null;closeModal();return api.openKitchen()}
 }
 function drawBoard(g,x,y,day=1,tick=0){
  const counts=data().totals||{};
  g.save();g.translate(x,y);g.lineJoin='round';g.lineCap='round';
  g.fillStyle='#4b6b51';g.fillRect(-39,-3,76,8);
  g.fillStyle='#765b4a';g.fillRect(-34,-104,9,103);g.fillRect(25,-104,9,103);
  g.fillStyle='#d0a679';g.beginPath();g.moveTo(-51,-122);g.lineTo(51,-122);g.lineTo(51,-57);g.lineTo(-51,-57);g.closePath();g.fill();
  g.strokeStyle='#946849';g.lineWidth=5;g.strokeRect(-50,-122,101,65);
  g.fillStyle='#fff0d2';g.fillRect(-44,-116,89,54);
  g.fillStyle='#6a8f6b';g.fillRect(-43,-113,87,8);
  g.fillStyle='#496950';g.font='bold 12px system-ui';g.textAlign='center';g.fillText('VILLAGE',0,-89);g.fillText('TRADES',0,-73);
  const all=['rosie','oliver','bea'];
  all.forEach((id,i)=>{
   const c=(counts[id]||0)>=3?'#eec77a':completed(id,day)?'#8cbf9b':'#d2b38f';
   g.fillStyle=c;g.beginPath();g.arc(-28+i*28,-49,6,0,Math.PI*2);g.fill();
  });
  if(all.some(id=>(counts[id]||0)>=3)){
   const y=-128+Math.sin(tick*2)*1.5;
   g.strokeStyle='#a4784f';g.lineWidth=3;g.beginPath();g.moveTo(0,-120);g.lineTo(0,y-9);g.stroke();
   g.fillStyle='#e8ad77';g.beginPath();g.moveTo(-12,y-15);g.lineTo(12,y-15);g.lineTo(12,y+5);g.lineTo(0,y);g.lineTo(-12,y+5);g.closePath();g.fill();
  }
  g.restore();
 }
 return {board,station,travel,start,choose,handle,complete:completed,available,offer,drawBoard,
  cancel,get session(){return session},get data(){return data()},get total(){return total()}};
}
root.HearthVillageTrades={clean,setup,offer,IDS,DISHES,STOCK};
})(window);
