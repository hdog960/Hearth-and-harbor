/* Hearth & Harbor v2.5.28 — Daybook Baton
 * Per-resident manual routines survive character switches and same-day return.
 * A paused action restarts from the beginning; no offline rewards or timers.
 */
(function(root){'use strict';
const PEOPLE=['mabel','rosie','oliver','jun','bea','finn'];
const HOMES=['h0','h1','h2','h3','h4','h5'];
const ACTIONS=['rest','read','tidy','meal','chat','hobby'];
const icon={rest:'💤',read:'📚',tidy:'🧽',meal:'🥣',chat:'💗',hobby:'🎨'};
const validDay=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const validObj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const validTasks=tasks=>Array.isArray(tasks)?tasks.filter(t=>ACTIONS.includes(t)).slice(0,4):[];
function clean(raw){
 const input=validObj(raw)?raw:{},plans={};
 for(const id of PEOPLE){
  const row=input.plans?.[id];
  if(!validObj(row)||!HOMES.includes(row.home)||!validDay(row.day))continue;
  const tasks=validTasks(row.tasks);
  if(tasks.length)plans[id]={home:row.home,day:row.day,tasks};
 }
 return {plans};
}
function setup(api){
 const store=()=>{
  const s=api.getState();
  if(!validObj(s.manualDaybooks)||!validObj(s.manualDaybooks.plans))s.manualDaybooks=clean(s.manualDaybooks);
  return s.manualDaybooks;
 };
 const eligible=(home,id)=>HOMES.includes(home)&&PEOPLE.includes(id)&&api.getResidentHome?.(id)===home&&api.getHomeMembers?.(home)?.includes(id);
 const get=(home,id)=>{
  if(!eligible(home,id))return [];
  const rec=store().plans[id],day=api.getState().day;
  return rec?.home===home&&rec.day===day&&validDay(day)?validTasks(rec.tasks):[];
 };
 const remember=(home,id,current,queue)=>{
  if(!eligible(home,id)||!validDay(api.getState().day))return false;
  const tasks=validTasks([...(ACTIONS.includes(current)?[current]:[]),...(Array.isArray(queue)?queue:[])]);
  const db=store(),before=db.plans[id],prev=before?.home===home&&before.day===api.getState().day?validTasks(before.tasks):[];
  if(prev.join('|')===tasks.join('|'))return false;
  if(tasks.length)db.plans[id]={home,day:api.getState().day,tasks};
  else delete db.plans[id];
  return true;
 };
 const clear=(home,id)=>{
  if(!eligible(home,id)||!get(home,id).length)return false;
  delete store().plans[id];return true;
 };
 const finish=(home,id,action)=>{
  const tasks=get(home,id);
  if(!tasks.length||tasks[0]!==action)return false;
  tasks.shift();
  const db=store();
  if(tasks.length)db.plans[id]={home,day:api.getState().day,tasks};
  else delete db.plans[id];
  return true;
 };
 const name=id=>String(api.getPersonLabel?.(id)||id).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function summary(home){
  if(!HOMES.includes(home))return '';
  const people=api.getHomeMembers?.(home)||[];
  const lines=people.filter(id=>eligible(home,id)&&get(home,id).length).map(id=>'<div class="db28-person"><strong>'+name(id)+'</strong><span>'+get(home,id).map(a=>icon[a]).join(' <i aria-hidden="true">›</i> ')+'</span><small>'+get(home,id).length+' unfinished · tap their name to resume</small></div>').join('');
  return '<section class="db28-book"><div class="db28-head"><span class="db28-symbol">✿</span><div><strong>Saved Daybook Routines</strong><p>Everyone keeps their own plans while you guide someone else.</p></div></div>'+
    (lines||'<p class="db28-none">No paused routines. Your household is free to enjoy the day.</p>')+
    '<p class="db28-help">An interrupted activity starts again from the beginning when you return. Nothing is earned for an unfinished activity, and yesterday’s routines expire tomorrow.</p></section>';
 }
 return {get,remember,clear,finish,summary,eligible,get data(){return store()}};
}
root.HearthManualDaybooks={clean,setup,PEOPLE,HOMES,ACTIONS};
})(window);
