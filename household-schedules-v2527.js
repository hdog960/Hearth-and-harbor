/* Hearth & Harbor v2.5.27 — Independent Household Schedules
 * Real queued NPC walks/actions, not passive gains or invented mini-games.
 * Existing Daybook, autonomy, needs, jobs and local saves remain authoritative.
 */
(function(root){'use strict';
const PEOPLE=['mabel','rosie','oliver','jun','bea','finn'];
const HOMES=['h0','h1','h2','h3','h4','h5'];
const ACTIONS={
 rest:{icon:'💤',name:'Rest'},
 meal:{icon:'🥣',name:'Make a meal'},
 read:{icon:'📚',name:'Read'},
 tidy:{icon:'🧽',name:'Tidy'},
 chat:{icon:'💗',name:'Spend time together'},
 hobby:{icon:'🎨',name:'Enjoy a hobby'}
};
const has=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cut=v=>Array.isArray(v)?v.filter(a=>has(ACTIONS,a)).slice(0,3):[];
function clean(input){
 const source=obj(input)?input:{},plans={},history=[];
 for(const id of PEOPLE){
  const row=source.plans?.[id];
  if(!obj(row)||!HOMES.includes(row.home)||!dayOK(row.day))continue;
  const tasks=cut(row.tasks);
  if(tasks.length)plans[id]={home:row.home,day:row.day,tasks};
 }
 if(Array.isArray(source.history))for(const item of source.history.slice(-90)){
  if(!obj(item)||!PEOPLE.includes(item.actor)||!HOMES.includes(item.home)||!has(ACTIONS,item.action)||!dayOK(item.day))continue;
  history.push({actor:item.actor,home:item.home,action:item.action,day:item.day});
 }
 return {plans,history:history.slice(-24)};
}
function setup(api){
 const state=()=>api.getState();
 const store=()=>{
  const s=state();
  if(!obj(s.householdSchedules)||!obj(s.householdSchedules.plans)||!Array.isArray(s.householdSchedules.history))
   s.householdSchedules=clean(s.householdSchedules);
  return s.householdSchedules;
 };
 const occupant=(home,id)=>HOMES.includes(home)&&PEOPLE.includes(id)&&api.getResidentHome?.(id)===home&&api.getHomeMembers?.(home)?.includes(id);
 const today=()=>state().day;
 const current=(home,id)=>{
  if(!dayOK(today())||!occupant(home,id))return [];
  const rec=store().plans[id];
  return rec?.home===home&&rec.day===today()?rec.tasks:[];
 };
 function add(home,id,action){
  if(!occupant(home,id)||!has(ACTIONS,action)||!dayOK(today()))return false;
  const tasks=current(home,id);
  if(tasks.length>=3){api.notify?.('Three activities fit in this resident’s plan.');return false}
  const data=store();
  data.plans[id]={day:today(),home,tasks:[...tasks,action]};
  api.save();api.updateUI?.();
  api.notify?.(ACTIONS[action].icon+' Scheduled '+api.getPersonLabel?.(id)+' to '+ACTIONS[action].name.toLowerCase()+'.');
  return true;
 }
 function clear(home,id){
  if(!occupant(home,id)||!current(home,id).length)return false;
  delete store().plans[id];
  api.save();api.updateUI?.();
  api.notify?.('That resident’s planned activities were cleared.');
  return true;
 }
 function removeLast(home,id){
  const tasks=current(home,id);
  if(!tasks.length)return false;
  const row=store().plans[id];
  row.tasks.pop();
  if(!row.tasks.length)delete store().plans[id];
  api.save();api.updateUI?.();
  return true;
 }
 const peek=(home,id)=>current(home,id)[0]||null;
 function completed(home,id,action){
  const tasks=current(home,id);
  if(!tasks.length||tasks[0]!==action)return false;
  const d=store(),row=d.plans[id];row.tasks.shift();
  if(!row.tasks.length)delete d.plans[id];
  d.history.push({home,actor:id,action,day:today()});
  d.history=d.history.slice(-24);
  // Caller finishes the actual action and owns its original save.
  return true;
 }
 function panel(home,controlled){
  if(!HOMES.includes(home))return '';
  const members=api.getHomeMembers?.(home)||[];
  const rows=members.filter(id=>occupant(home,id)).map(id=>{
   const tasks=current(home,id);
   const name=esc(api.getPersonLabel?.(id)||id);
   const indicators=tasks.map((k,i)=>'<span class="hp27-task" aria-label="Step '+(i+1)+': '+esc(ACTIONS[k].name)+'">'+ACTIONS[k].icon+' '+esc(ACTIONS[k].name)+'</span>').join('<span class="hp27-arrow" aria-hidden="true">›</span>');
   const buttons=Object.entries(ACTIONS).map(([kind,info])=>'<button type="button" data-act="hp27-add" data-id="'+id+'|'+kind+'" '+(tasks.length>=3?'disabled':'')+' aria-label="Add '+esc(info.name)+' to '+name+'’s plan">'+info.icon+'<small>'+esc(info.name)+'</small></button>').join('');
   return '<section class="hp27-person"><div class="hp27-heading"><strong>'+name+'</strong><small>'+
    (id===controlled?'Plans pause while you directly guide this resident.':'Independent plan · '+tasks.length+'/3 steps')+'</small></div>'+
    '<div class="hp27-timeline" role="list" aria-label="'+name+'’s scheduled activities">'+(indicators||'<span class="hp27-empty">No activities planned yet.</span>')+'</div>'+
    '<div class="hp27-choices" role="group" aria-label="Plan '+name+'’s next activity">'+buttons+'</div>'+
    '<div class="hp27-tools"><button data-act="hp27-undo" data-id="'+id+'" '+(!tasks.length?'disabled':'')+'>Undo last</button>'+
    '<button data-act="hp27-clear" data-id="'+id+'" '+(!tasks.length?'disabled':'')+'>Clear plan</button></div></section>';
  }).join('');
  const latest=store().history.slice().reverse().filter(r=>r.home===home).slice(0,4)
   .map(r=>'<li>Day '+r.day+' · '+esc(api.getPersonLabel?.(r.actor)||r.actor)+' finished '+esc(ACTIONS[r.action].name.toLowerCase())+'</li>').join('');
  return '<section class="hp27-board"><div class="hp27-intro"><small>INDEPENDENT HOUSEHOLD PLANNING</small><h3>Everybody Has a Little Day</h3><p>Plan up to three activities for each person. Everyone walks to real furnishings and completes their own routine, even while you guide somebody else. These plans override casual autonomy but never create coins, dishes or extra rewards.</p></div>'+
   '<div class="hp27-grid">'+(rows||'<p>This home is empty right now.</p>')+'</div>'+
   '<div class="hp27-history"><strong>Recently finished</strong><ul>'+(latest||'<li>New memories appear when a planned activity really finishes.</li>')+'</ul></div>'+
   '<p class="hp27-note">Planning is free and fully optional. Schedules pause when you leave the residence, pause time or directly guide that resident; they resume when you return. Unfinished plans from a previous in-game day expire without granting rewards. Clear a plan whenever you like.</p></section>';
 }
 function handle(action,id,home){
  const parts=typeof id==='string'?id.split('|'):[];
  if(!HOMES.includes(home)||!['hp27-add','hp27-clear','hp27-undo'].includes(action))return false;
  if(action==='hp27-add'&&parts.length===2)return add(home,parts[0],parts[1]);
  if(action==='hp27-clear'&&parts.length===1)return clear(home,parts[0]);
  if(action==='hp27-undo'&&parts.length===1)return removeLast(home,parts[0]);
  return false;
 }
 return {add,clear,removeLast,peek,completed,panel,handle,current,occupant,
  get data(){return store()}};
}
root.HearthHouseholdSchedules={setup,clean,PEOPLE,HOMES,ACTIONS};
})(window);
