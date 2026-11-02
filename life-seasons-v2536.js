/* Hearth & Harbor v2.5.36 — Seasons of Life
 * Voluntary adult aging along the game's EXISTING 28-day seasonal year.
 * A celebration is earned through real resident activity, never a button,
 * automatic timer reward or a fictional child/kinship record.
 */
(function(root){'use strict';
const IDS=['mabel','rosie','oliver','jun','bea','finn'];
const HOMES=['h0','h1','h2','h3','h4','h5'];
const OFFSETS={mabel:4,rosie:8,oliver:12,jun:16,bea:20,finn:24};
const STAGES=[
 {name:'Young Adult',title:'Finding Their Way',color:'#c3d8ba'},
 {name:'Adult',title:'Putting Down Roots',color:'#e4bfa0'},
 {name:'Elder',title:'A Lifetime of Stories',color:'#c4b2cd'}
];
const ACTIONS={meal:'Prepare a birthday meal',chat:'Share birthday stories'};
const validDay=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const pair=arr=>arr.slice().sort().join('|');
const stage=n=>n>=5?2:n>=2?1:0;
function clean(raw){
 const src=obj(raw)?raw:{},profiles={},pending={},sessions={},history=[],keepsakes=[],wisdomDaily={},wisdom=[];
 for(const id of IDS){
  const r=src.profiles?.[id];
  if(obj(r)&&validDay(r.nextDay)&&Number.isInteger(r.years)&&r.years>=0&&r.years<=300)
   profiles[id]={nextDay:r.nextDay,years:r.years};
  const q=src.pending?.[id];
  if(obj(q)&&validDay(q.day)&&validDay(q.until)&&q.until>=q.day&&q.until-q.day<=6&&Number.isInteger(q.year)&&q.year>=1&&q.year<=300)
   pending[id]={day:q.day,until:q.until,year:q.year};
  if(validDay(src.wisdomDaily?.[id]))wisdomDaily[id]=src.wisdomDaily[id];
 }
 for(const home of HOMES){
  const q=src.sessions?.[home];
  if(obj(q)&&validDay(q.day)&&IDS.includes(q.celebrant)&&IDS.includes(q.host)&&q.celebrant!==q.host&&Object.hasOwn(ACTIONS,q.action))
   sessions[home]={day:q.day,celebrant:q.celebrant,host:q.host,action:q.action};
 }
 if(Array.isArray(src.history))for(const r of src.history.slice(-240)){
  if(!obj(r)||!HOMES.includes(r.home)||!validDay(r.day)||!IDS.includes(r.celebrant)||!IDS.includes(r.host)||
   r.celebrant===r.host||!Number.isInteger(r.year)||r.year<1||r.year>300||!Object.hasOwn(ACTIONS,r.action))continue;
  if(history.some(m=>m.celebrant===r.celebrant&&m.year===r.year))continue;
  history.push({home:r.home,day:r.day,celebrant:r.celebrant,host:r.host,year:r.year,action:r.action});
 }
 for(const home of Array.isArray(src.keepsakes)?src.keepsakes:[])if(HOMES.includes(home)&&!keepsakes.includes(home))keepsakes.push(home);
 if(Array.isArray(src.wisdom))for(const r of src.wisdom.slice(-100)){
  if(!obj(r)||!HOMES.includes(r.home)||!validDay(r.day)||!IDS.includes(r.mentor)||!IDS.includes(r.learner)||r.mentor===r.learner)continue;
  if(wisdom.some(m=>m.day===r.day&&m.mentor===r.mentor))continue;
  wisdom.push({home:r.home,day:r.day,mentor:r.mentor,learner:r.learner});
 }
 return {enabled:src.enabled===true,pausedAt:validDay(src.pausedAt)?src.pausedAt:0,
  profiles,pending,sessions,history:history.slice(-48),keepsakes:keepsakes.slice(0,6),
  wisdomDaily,wisdom:wisdom.slice(-24)};
}
function setup(api){
 const state=()=>api.getState();
 const db=()=>{
  const s=state();
  if(!obj(s.lifeSeasons)||!obj(s.lifeSeasons.profiles)||!obj(s.lifeSeasons.pending)||
   !obj(s.lifeSeasons.sessions)||!Array.isArray(s.lifeSeasons.history))s.lifeSeasons=clean(s.lifeSeasons);
  return s.lifeSeasons;
 };
 const residents=home=>HOMES.includes(home)?[...new Set((api.getHomeMembers?.(home)||[])
  .filter(id=>IDS.includes(id)&&api.getResidentHome?.(id)===home))].slice(0,2):[];
 const name=id=>esc(api.getPersonLabel?.(id)||id);
 const homeName=id=>esc(api.getHomeLabel?.(id)||id);
 const chapter=id=>{const p=db().profiles[id];return db().enabled&&p?stage(p.years):0};
 const stageFor=id=>STAGES[chapter(id)];
 function toggle(){
  const d=db(),day=state().day;
  if(!validDay(day))return false;
  if(!d.enabled){
   if(d.pausedAt){const elapsed=Math.max(0,day-d.pausedAt);
    for(const p of Object.values(d.profiles))p.nextDay=clamp(p.nextDay+elapsed,1,9999);
    for(const p of Object.values(d.pending)){p.day=clamp(p.day+elapsed,1,9999);p.until=clamp(p.until+elapsed,1,9999)}
    d.pausedAt=0;
   }
   for(const id of IDS)if(!d.profiles[id])d.profiles[id]={years:0,nextDay:clamp(day+OFFSETS[id],1,9999)};
   d.enabled=true;
   api.notify?.('Life seasons enabled. Every neighbor grows at their own pace; no one ages while this setting is paused.');
  }else{
   d.enabled=false;d.pausedAt=day;d.sessions={};
   api.notify?.('Life seasons paused. Everyone keeps their chapter, memories, and learned skills.');
  }
  api.save?.();api.updateUI?.();return true;
 }
 function nextDay(day){
  const d=db();if(!d.enabled||!validDay(day))return 0;
  let milestones=0;
  for(const id of IDS){
   const p=d.profiles[id];if(!p)continue;
   if(day>=p.nextDay){
    // Advance once for each elapsed village year; if a save advances more
    // than one year, do not counterfeit missed party opportunities.
    const years=Math.min(300-p.years,1+Math.floor((day-p.nextDay)/28));
    p.years+=years;p.nextDay=clamp(p.nextDay+28*years,1,9999);
    d.pending[id]={day,until:clamp(day+6,1,9999),year:p.years};
    milestones++;
    api.notify?.('🎂 '+name(id)+' reached a new life milestone. Their birthday gathering is available in the Seasons of Life album.');
   }
   const r=d.pending[id];if(r&&day>r.until)delete d.pending[id];
  }
  for(const [home,s] of Object.entries(d.sessions))if(s.day!==day)delete d.sessions[home];
  return milestones;
 }
 function available(id,home){
  if(!db().enabled||!IDS.includes(id)||!HOMES.includes(home)||!validDay(state().day))return null;
  const p=db().pending[id],people=residents(home);
  if(!p||state().day<p.day||state().day>p.until||people.length!==2||!people.includes(id))return null;
  if(db().history.some(x=>x.celebrant===id&&x.year===p.year))return null;
  return p;
 }
 function begin(home,celebrant,action){
  const r=available(celebrant,home);
  if(!r||!Object.hasOwn(ACTIONS,action))return false;
  if(Object.values(db().sessions).some(s=>s.celebrant===celebrant&&s.day===state().day))return false;
  const host=residents(home).find(id=>id!==celebrant);
  if((api.getDone?.(host)||[]).includes(action))return false;
  if(db().sessions[home]?.day===state().day)return false;
  db().sessions[home]={day:state().day,celebrant,host,action};
  api.save?.();api.updateUI?.();
  api.notify?.(name(host)+' can '+(action==='meal'?'prepare a meal':'share stories')+' for '+name(celebrant)+'. The real home activity must finish.');
  return true;
 }
 function session(home){
  const s=db().sessions[home];
  return s&&s.day===state().day&&available(s.celebrant,home)&&residents(home).includes(s.host)?s:null;
 }
 function cancel(home){
  if(!session(home))return false;
  delete db().sessions[home];api.save?.();api.updateUI?.();return true;
 }
 function queue(home){
  const s=session(home);if(!s)return false;
  if((api.getDone?.(s.host)||[]).includes(s.action))return false;
  const plan=api.getSchedule?.(home,s.host);
  if(!Array.isArray(plan)||plan.length>=3&&!plan.includes(s.action))return false;
  if(plan.includes(s.action))return true;
  return !!api.addSchedule?.(home,s.host,s.action);
 }
 function completed(home,actor,action,first=true,day=state().day){
  if(!first||!db().enabled||!validDay(day)||state().day!==day)return false;
  const s=session(home);
  if(!s||s.host!==actor||s.action!==action)return false;
  const r=available(s.celebrant,home);if(!r)return false;
  // Commit the claim before any UI notification to make reentrant callbacks
  // idempotent, and leave save ownership with the actual completed activity.
  delete db().sessions[home];delete db().pending[s.celebrant];
  db().history.push({home,day,celebrant:s.celebrant,host:actor,year:r.year,action});
  db().history=db().history.slice(-48);
  for(const id of [actor,s.celebrant]){
   const ns=api.getNeeds?.(id);
   if(obj(ns))ns.social=clamp((Number.isFinite(ns.social)?ns.social:0)+4,0,100);
  }
  const pairKey=pair([actor,s.celebrant]);
  if(!obj(state().townBonds))state().townBonds={};
  state().townBonds[pairKey]=clamp((Number.isFinite(state().townBonds[pairKey])?state().townBonds[pairKey]:0)+1,0,100);
  const total=db().history.filter(e=>e.home===home).length;
  const earned=total>=2&&!db().keepsakes.includes(home);
  if(earned)db().keepsakes.push(home);
  api.notify?.('🎂 '+name(actor)+' made '+name(s.celebrant)+' feel celebrated!'+(earned?' Their birthday garland is now displayed at home.':''));
  return {home,celebrant:s.celebrant,year:r.year,earned};
 }
 // An elder sharing a real, finished resident-to-resident mentorship adds a
 // tiny one-per-day personal connection; it does not create a new skill or XP.
 function wisdom(home,mentor,learner,lessonFinished,day=state().day){
  if(!lessonFinished||!db().enabled||!validDay(day)||day!==state().day||chapter(mentor)!==2||
   !residents(home).includes(mentor)||!residents(home).includes(learner)||mentor===learner||
   db().wisdomDaily[mentor]===day)return false;
  const mentorNeeds=api.getNeeds?.(mentor),learnerNeeds=api.getNeeds?.(learner);
  if(!obj(mentorNeeds)||!obj(learnerNeeds))return false;
  db().wisdomDaily[mentor]=day;
  mentorNeeds.social=clamp((Number.isFinite(mentorNeeds.social)?mentorNeeds.social:0)+3,0,100);
  learnerNeeds.fun=clamp((Number.isFinite(learnerNeeds.fun)?learnerNeeds.fun:0)+3,0,100);
  db().wisdom.push({home,day,mentor,learner});db().wisdom=db().wisdom.slice(-24);
  return {mentor,learner,day};
 }
 const comfort=home=>db().keepsakes.includes(home)?2:0;
 const history=()=>db().history.slice().sort((a,b)=>b.day-a.day).slice(0,18);
 function board(home){
  const activeHome=HOMES.includes(home)?home:'h0',d=db();
  const people=IDS.map(id=>{
   const p=d.profiles[id],ch=stageFor(id),day=p?.nextDay||0,place=api.getResidentHome?.(id),
    pending=available(id,place),isHere=place===activeHome;
   return '<article class="ls36-person"><div class="ls36-avatar" style="--life-ink:'+ch.color+'">✿</div><div><h4>'+name(id)+'</h4>'+
    '<small>'+esc(ch.name)+' · '+esc(ch.title)+'</small><p>'+(d.enabled?'Next birthday milestone: Day '+day+
     (pending?' · Celebration window open until Day '+pending.until:''):
     'Aging paused · progress held')+'</p>'+
    (pending&&isHere?'<div class="ls36-actions">'+Object.entries(ACTIONS).map(([act,txt])=>
     '<button data-act="ls36-start" data-id="'+place+'|'+id+'|'+act+'" '+(session(place)?'disabled':'')+'>'+esc(txt)+'</button>').join('')+'</div>':'')+
    '</div></article>';
  }).join('');
  const s=session(activeHome);
  const celebration=s?'<section class="ls36-active"><h3>🎂 A birthday gathering</h3><p>'+name(s.host)+' is preparing something special for '+name(s.celebrant)+'. They must finish a real '+(s.action==='meal'?'meal':'conversation')+' in the residence.</p><div class="ls36-actions"><button data-act="ls36-queue" data-id="'+activeHome+'">🗓️ Queue the real activity</button><button data-act="ls36-cancel" data-id="'+activeHome+'">Set aside the gathering</button></div></section>':'';
  const records=history().map(x=>'<li>Day '+x.day+' · '+name(x.host)+' celebrated '+name(x.celebrant)+' · village year '+x.year+'</li>').join('');
  api.showModal?.('life-seasons','<section class="ls36-book"><header class="ls36-cover"><small>GROWING OLDER · STAYING TOGETHER</small><h2>🍂 Seasons of Life</h2><p>An optional chapter of village life. Follow the six adult residents through birthdays, changing chapters and the wisdom they can share. No child or aging system is forced on existing saves.</p>'+
    '<button class="ls36-toggle" data-act="ls36-toggle" aria-pressed="'+d.enabled+'">'+(d.enabled?'⏸ Pause life seasons':'🌿 Enable life seasons')+'</button></header>'+
    '<div class="ls36-tabs">'+HOMES.map(h=>'<button data-act="ls36-view" data-id="'+h+'" aria-pressed="'+(h===activeHome)+'">'+homeName(h)+'</button>').join('')+'</div>'+
    '<p class="ls36-home">Gatherings in '+homeName(activeHome)+'</p>'+celebration+'<div class="ls36-grid">'+people+'</div>'+
    '<section class="ls36-history"><h3>Our village birthdays</h3><ul>'+(records||'<li>Real birthday gatherings will be remembered here.</li>')+'</ul></section>'+
    '<p class="ls36-note">Aging is OFF by default, may be paused/resumed, and follows the existing 28-day village year. Adult chapters progress after 2 and 5 birthdays. Nothing reduces ability or changes relationships automatically. A birthday celebration requires a second actual housemate and a real completed meal/chat; two celebrations in the same home earn an original garland and +2 home comfort. Elder mentors can offer one additional small care bonus on a genuinely finished mentorship lesson per day.</p>'+
    '<button data-act="ls36-back" class="ls36-back">Return to Household Daybook</button></section>');
 }
 function handle(action,id,home){
  if(action==='ls36-board'||action==='ls36-view')return board(HOMES.includes(id)?id:home);
  if(action==='ls36-toggle'){toggle();return board(home)}
  if(action==='ls36-start'){const a=typeof id==='string'?id.split('|'):[];if(a.length===3)begin(...a);return board(a[0]||home)}
  if(action==='ls36-cancel'){cancel(id);return board(id)}
  if(action==='ls36-queue'){if(!queue(id))api.notify?.('The birthday host needs a free schedule slot or direct guidance.');return board(id)}
  if(action==='ls36-back')return api.back?.();
  return false;
 }
 function draw(g,home){
  if(!HOMES.includes(home))return;
  const s=session(home),garland=db().keepsakes.includes(home);if(!s&&!garland)return;
  g.save();g.translate(567,153);
  if(garland){
   g.strokeStyle='#bb8669';g.lineWidth=4;g.beginPath();g.moveTo(-125,-9);g.quadraticCurveTo(0,30,125,-9);g.stroke();
   for(let i=0;i<7;i++){const x=-112+i*37,y=4+Math.sin(i/6*Math.PI)*13;
    g.fillStyle=['#b6d0b4','#e9bcaf','#f0d79d'][i%3];g.beginPath();g.moveTo(x-14,y);g.lineTo(x+14,y);g.lineTo(x,y+23);g.closePath();g.fill();
   }
  }
  if(s){
   g.fillStyle='#876650';g.fillRect(-64,44,128,31);g.fillStyle='#f3dfb9';g.fillRect(-59,48,118,23);
   g.fillStyle='#de9c8f';g.font='bold 12px system-ui';g.textAlign='center';g.fillText('HAPPY BIRTHDAY',0,64);
  }
  g.restore();
 }
 return {toggle,nextDay,begin,session,available,queue,cancel,completed,wisdom,comfort,board,handle,draw,stageFor,chapter,get data(){return db()}};
}
root.HearthLifeSeasons={setup,clean,HOMES,IDS,STAGES};
})(window);
