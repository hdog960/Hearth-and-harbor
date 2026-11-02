/* Hearth & Harbor v2.5.26 — The Household Promise
 * Voluntary resident responsibilities, grounded in completed activities.
 * No passive paydays, new currency, timers or mandatory chores.
 */
(function(root){'use strict';
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const PEOPLE=['player','mabel','rosie','oliver','jun','bea','finn'];
const ROLES=[
 {id:'caretaker',name:'Home Caretaker',icon:'🧺',action:'tidy',accent:'#c6ab89',
  detail:'Tidy a real room. A cared-for home brings breathing room to its residents.',
  effect:'A little extra fun for the caretaker and energy for a housemate.',
  need:'energy',amount:6},
 {id:'cook',name:'Family Cook',icon:'🥣',action:'meal',accent:'#e8b77f',
  detail:'Make a real Daybook meal. It feels good to have someone looking after dinner.',
  effect:'A restorative bite for the cook and a housemate.',
  need:'food',amount:8},
 {id:'storykeeper',name:'Story Keeper',icon:'📚',action:'read',accent:'#a7c6b6',
  detail:'Read a chapter. Share the quiet joy of stories with the household.',
  effect:'A little extra fun for a housemate.',
  need:'fun',amount:6},
 {id:'host',name:'Warm Host',icon:'💗',action:'chat',accent:'#dfadbc',
  detail:'Make time for a real conversation or friendly letter at home.',
  effect:'A warm boost to a housemate’s social needs.',
  need:'social',amount:7},
 {id:'maker',name:'Creative Maker',icon:'🎨',action:'hobby',accent:'#b4aad6',
  detail:'Spend real time on a favorite hobby. Make an ordinary afternoon feel special.',
  effect:'A little extra fun for a housemate.',
  need:'fun',amount:6}
];
const ROLE_IDS=ROLES.map(x=>x.id),isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDay=x=>Number.isInteger(x)&&x>=1&&x<=9999,owns=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const emptyHome=()=>({roles:{},total:0});
function clean(raw){
 const src=isObject(raw)?raw:{},homes={};
 for(const h of HOMES){
  const input=isObject(src.homes?.[h])?src.homes[h]:{},roles={};let used=new Set();
  for(const p of PEOPLE){
   if(h==='player'&&p!=='player'||h!=='player'&&p==='player')continue;
   const role=input.roles?.[p];
   if(ROLE_IDS.includes(role)&&!used.has(role)){roles[p]=role;used.add(role);}
  }
  homes[h]={roles,total:Number.isInteger(input.total)?clamp(input.total,0,9999):0};
 }
 const daily={};if(isObject(src.daily))for(const actor of PEOPLE){
  const entry=src.daily[actor];
  if(!isObject(entry)||!validDay(entry.day)||!HOMES.includes(entry.home)||!ROLE_IDS.includes(entry.role))continue;
  if(actor==='player'&&entry.home!=='player'||actor!=='player'&&entry.home==='player')continue;
  daily[actor]={day:entry.day,home:entry.home,role:entry.role};
 }
 const memories=[];if(Array.isArray(src.memories))for(const entry of src.memories.slice(-140)){
  if(!isObject(entry)||!validDay(entry.day)||!HOMES.includes(entry.home)||!PEOPLE.includes(entry.actor)||!ROLE_IDS.includes(entry.role))continue;
  if(entry.actor==='player'&&entry.home!=='player'||entry.actor!=='player'&&entry.home==='player')continue;
  if(memories.some(x=>x.actor===entry.actor&&x.day===entry.day))continue;
  memories.push({day:entry.day,home:entry.home,actor:entry.actor,role:entry.role});
 }
 return {homes,daily,memories:memories.slice(-36)};
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal}=api;
 const state=()=>getState();
 const data=()=>{
  const s=state();
  if(!isObject(s.householdRoles)||!isObject(s.householdRoles.homes)||!HOMES.every(h=>isObject(s.householdRoles.homes[h])))s.householdRoles=clean(s.householdRoles);
  return s.householdRoles;
 };
 const members=h=>{
  if(!HOMES.includes(h))return [];
  const list=api.getHomeMembers?.(h);
  return [...new Set((Array.isArray(list)?list:[]).filter(p=>PEOPLE.includes(p)&&(h==='player'?p==='player':p!=='player')))].slice(0,2);
 };
 const label=h=>h==='player'?'Your cottage':String(api.getHomeLabel?.(h)||'Residence '+h.slice(1)).slice(0,55);
 const personName=id=>id==='player'?String(api.getPersonLabel?.(id)||'Poppy').slice(0,32):String(api.getPersonLabel?.(id)||id).slice(0,32);
 const roleBy=id=>ROLES.find(r=>r.id===id);
 const assigned=(home,actor)=>data().homes[home]?.roles?.[actor]||null;
 const performed=actor=>data().daily[actor]?.day===state().day;
 const unlocked=home=>HOMES.includes(home)&&data().homes[home].total>=3;
 const currentDuty=actor=>{
  if(!PEOPLE.includes(actor)||actor==='player'||performed(actor))return null;
  const home=api.getResidentHome?.(actor);
  if(!HOMES.includes(home)||!members(home).includes(actor))return null;
  const role=roleBy(assigned(home,actor));
  return role?{action:role.action,title:role.name,reason:'Household promise: '+role.detail}:null;
 };
 function assign(home,actor,roleId){
  if(!HOMES.includes(home)||!members(home).includes(actor)||!(roleId==='none'||ROLE_IDS.includes(roleId)))return false;
  const rec=data(),roles=rec.homes[home].roles,current=roles[actor]||'none';
  if(current===roleId)return false;
  if(roleId!=='none'&&Object.entries(roles).some(([p,r])=>p!==actor&&members(home).includes(p)&&r===roleId)){
   notify?.('Someone in this household already has that responsibility.');
   return false;
  }
  if(roleId==='none')delete roles[actor];else roles[actor]=roleId;
  save();updateUI();
  notify?.(roleId==='none'?personName(actor)+' has a free afternoon.':personName(actor)+' is now the '+roleBy(roleId).name+'.');
  return true;
 }
 function complete(home,actor,action,first=true,day=state().day){
  if(!first||!HOMES.includes(home)||!PEOPLE.includes(actor)||!validDay(day)||day!==state().day||!members(home).includes(actor))return false;
  if(performed(actor))return false;
  const r=roleBy(assigned(home,actor));
  if(!r||r.action!==action)return false;
  const needs=api.getNeeds?.(actor);
  if(!isObject(needs))return false;
  const d=data(),companions=members(home).filter(x=>x!==actor);
  // A genuine action is already finished at this point. This is a small, capped
  // benefit layered on the existing action effects, not a second activity.
  const ownKey='fun';
  needs[ownKey]=clamp((Number.isFinite(needs[ownKey])?needs[ownKey]:0)+3,0,100);
  if(companions.length){
   const recipient=api.getNeeds?.(companions[0]);
   if(isObject(recipient)){
    const key=r.need==='food'?'food':r.need;
    recipient[key]=clamp((Number.isFinite(recipient[key])?recipient[key]:0)+r.amount,0,100);
   }
  }else{
   const key=r.need==='food'&&actor==='player'?'hunger':r.need;
   needs[key]=clamp((Number.isFinite(needs[key])?needs[key]:0)+Math.min(4,r.amount),0,100);
  }
  d.daily[actor]={day,home,role:r.id};
  d.homes[home].total=clamp(d.homes[home].total+1,0,9999);
  d.memories.push({day,home,actor,role:r.id});d.memories=d.memories.slice(-36);
  if(d.homes[home].total===3)notify?.('🏡 '+label(home)+' earned a handwoven Household Promise rug!');
  else notify?.(r.icon+' '+personName(actor)+' kept their '+r.name+' promise. A little care goes a long way.');
  // The original home activity caller owns the transaction's save and UI update.
  return {home,actor,role:r.id,day};
 }
 function board(home='player'){
  const here=HOMES.includes(home)?home:'player',d=data(),who=members(here);
  const tabs=HOMES.map(h=>'<button type="button" data-act="hr26-view" data-id="'+h+'" aria-pressed="'+(h===here)+'">'+esc(label(h))+'</button>').join('');
  const cards=who.map(actor=>{
   const role=assigned(here,actor),done=performed(actor)&&d.daily[actor].home===here;
   const options=ROLES.map(r=>{
    const taken=Object.entries(d.homes[here].roles).some(([p,id])=>p!==actor&&who.includes(p)&&id===r.id);
    return '<button type="button" data-act="hr26-assign" data-id="'+here+'|'+actor+'|'+r.id+'" aria-pressed="'+(role===r.id)+'" '+(taken?'disabled':'')+'><span>'+r.icon+'</span><strong>'+r.name+'</strong><small>'+r.action+' · '+r.effect+'</small></button>';
   }).join('');
   return '<article class="hr26-resident"><div class="hr26-person"><span class="hr26-avatar">'+(actor==='player'?'🌼':'💗')+'</span><div><h3>'+esc(personName(actor))+'</h3><p>'+(!role?'Choose an optional role. No chores are required.':done?'✓ Kept today’s promise · '+esc(roleBy(role).name):'Today’s promise: '+esc(roleBy(role).detail))+'</p></div></div>'+
    '<div class="hr26-options" role="group" aria-label="Responsibilities for '+esc(personName(actor))+'">'+options+'</div>'+
    '<button type="button" class="hr26-free" data-act="hr26-assign" data-id="'+here+'|'+actor+'|none" '+(!role?'disabled':'')+'>Leave this afternoon free</button></article>';
  }).join('');
  const history=d.memories.slice().reverse().filter(x=>x.home===here).slice(0,8).map(m=>
   '<li><b>'+esc(personName(m.actor))+'</b> kept a '+esc(roleBy(m.role).name)+' promise <small>Day '+m.day+'</small></li>').join('');
  const summary='<div class="hr26-summary"><b>'+d.homes[here].total+' acts of care</b><span>'+(unlocked(here)?'✦ The handwoven Household Promise rug is displayed in this home.':'Three completed responsibilities across real days earn a permanent handwoven rug.')+'</span></div>';
  showModal('household-roles','<div class="hr26-ui"><div class="hr26-cover"><small>HOUSEHOLD LIFE · LITTLE ACTS OF CARE</small><h2>Our Household Promises</h2><p>Give the people in your home responsibilities that fit their personalities. They will remember these roles as they plan their days; the benefits happen only when a genuine Daybook routine is completed.</p></div><div class="hr26-tabs" role="group" aria-label="Household selection">'+tabs+'</div><h3>'+esc(label(here))+'</h3>'+summary+'<div class="hr26-cards">'+(cards||'<p>This residence is currently empty. Choose another home to assign a role.</p>')+'</div><h3>Little kindnesses remembered</h3><ul class="hr26-history">'+(history||'<li>New memories appear as residents genuinely finish their assigned tasks.</li>')+'</ul><p class="hr26-note">Roles are optional and can be changed freely. Everyone’s urgent needs and personal aspirations take priority. Each resident can earn a responsibility benefit once per in-game day, even if they move or switch roles.</p><button class="hr26-close" data-act="hr26-close">Return to your day</button></div>');
 }
 function drawFloor(g,home){
  if(!unlocked(home))return;
  g.save();g.translate(575,1046);
  g.fillStyle='#344f4938';g.beginPath();g.ellipse(0,9,102,32,0,0,Math.PI*2);g.fill();
  g.fillStyle='#a7775a';g.beginPath();g.ellipse(0,0,96,28,0,0,Math.PI*2);g.fill();
  g.fillStyle='#f3dfb8';g.beginPath();g.ellipse(0,-3,88,21,0,0,Math.PI*2);g.fill();
  g.fillStyle='#95b9a2';g.beginPath();g.ellipse(0,-3,78,17,0,0,Math.PI*2);g.fill();
  for(let i=0;i<16;i++){
   const a=i*Math.PI/8;
   g.fillStyle=i%2?'#f5d9a3':'#fdf0d3';
   g.beginPath();g.ellipse(Math.cos(a)*71,Math.sin(a)*13-3,5,3,a,0,Math.PI*2);g.fill();
  }
  g.strokeStyle='#fff3d7';g.lineWidth=3;
  g.beginPath();g.moveTo(-13,-3);g.quadraticCurveTo(-6,-13,0,-3);g.quadraticCurveTo(7,7,14,-3);g.stroke();
  g.restore();
 }
 function handle(action,arg){
  if(action==='hr26-board'||action==='hr26-view')return board(arg);
  if(action==='hr26-assign'){
   const parts=String(arg||'').split('|');
   if(parts.length!==3)return false;
   const [home,actor,role]=parts;
   assign(home,actor,role);
   return board(HOMES.includes(home)?home:'player');
  }
  if(action==='hr26-close')return closeModal();
 }
 return {board,assign,complete,currentDuty,drawFloor,handle,performed,assigned,unlocked,
  get data(){return data()},ROLES,HOMES};
}
root.HearthHouseholdRoles={setup,clean,ROLES,HOMES,PEOPLE};
})(window);
