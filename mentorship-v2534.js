/* Hearth & Harbor v2.5.34 — Passing It On
 * Two real resident actions in order: demonstration then practice.
 * Permanent learned confidence applies only to later genuinely completed
 * actions. No idle progression, passive payouts, invented family members.
 */
(function(root){'use strict';
const IDS=['mabel','rosie','oliver','jun','bea','finn'],HOMES=['h0','h1','h2','h3','h4','h5'];
const LESSONS={
 read:{title:'Share a Story',short:'Storycraft',verb:'read',color:'#9fb8bb',icon:'📖',intro:'Learn to read a favorite chapter and tell it back.'},
 meal:{title:'Cook Side by Side',short:'Kitchen Confidence',verb:'meal',color:'#ddb98a',icon:'🥣',intro:'Watch a meal being prepared, then make one yourself.'},
 tidy:{title:'Care for Our Home',short:'Homekeeping',verb:'tidy',color:'#acc3a1',icon:'🧺',intro:'Discover how a little daily care makes a room shine.'},
 hobby:{title:'Make Something Lovely',short:'Creative Practice',verb:'hobby',color:'#c9adbf',icon:'🎨',intro:'Share a creative trick, then practice a hobby of your own.'}
};
const ACTIONS=Object.keys(LESSONS),own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999,cap=(x,a,b)=>Math.max(a,Math.min(b,x));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pair=ids=>ids.slice().sort().join('|');
function blank(){return {sessions:{},skills:{},practiceDay:{},bonusDay:{},memories:[]}}
function clean(raw){
 const src=object(raw)?raw:{},out=blank();
 for(const home of HOMES){
  const v=src.sessions?.[home];
  if(!object(v)||!dayOK(v.day)||!IDS.includes(v.mentor)||!IDS.includes(v.learner)||
    v.mentor===v.learner||!own(LESSONS,v.lesson)||!['mentor','learner','finished'].includes(v.stage))continue;
  out.sessions[home]={day:v.day,mentor:v.mentor,learner:v.learner,lesson:v.lesson,stage:v.stage};
 }
 for(const id of IDS){
  const row=src.skills?.[id];if(!object(row))continue;
  const learned={};
  for(const key of ACTIONS){
   const v=row[key];
   if(!object(v)||!Number.isInteger(v.count)||v.count<1||!dayOK(v.lastDay))continue;
   learned[key]={count:cap(v.count,1,99),lastDay:v.lastDay};
  }
  if(Object.keys(learned).length)out.skills[id]=learned;
  const d=src.practiceDay?.[id];
  if(dayOK(d))out.practiceDay[id]=d;
  const bonus=src.bonusDay?.[id];
  if(object(bonus)){
   const cleaned={};for(const act of ACTIONS)if(dayOK(bonus[act]))cleaned[act]=bonus[act];
   if(Object.keys(cleaned).length)out.bonusDay[id]=cleaned;
  }
 }
 if(Array.isArray(src.memories))for(const m of src.memories.slice(-120)){
  if(!object(m)||!HOMES.includes(m.home)||!dayOK(m.day)||
    !IDS.includes(m.mentor)||!IDS.includes(m.learner)||m.mentor===m.learner||
    !own(LESSONS,m.lesson))continue;
  if(out.memories.some(x=>x.home===m.home&&x.day===m.day))continue;
  out.memories.push({home:m.home,day:m.day,mentor:m.mentor,learner:m.learner,lesson:m.lesson});
 }
 out.memories=out.memories.slice(-36);return out;
}
function setup(api){
 const state=()=>api.getState();
 const db=()=>{
  const s=state();
  if(!object(s.mentorship)||!object(s.mentorship.sessions)||!object(s.mentorship.skills)||
    !object(s.mentorship.practiceDay)||!object(s.mentorship.bonusDay)||!Array.isArray(s.mentorship.memories))
    s.mentorship=clean(s.mentorship);
  return s.mentorship;
 };
 const label=id=>esc(api.getPersonLabel?.(id)||id);
 const homeLabel=home=>esc(api.getHomeLabel?.(home)||home);
 const members=home=>!HOMES.includes(home)?[]:
  [...new Set((api.getHomeMembers?.(home)||[]).filter(id=>IDS.includes(id)&&api.getResidentHome?.(id)===home))].slice(0,2);
 const levels=n=>n>=6?3:n>=4?2:n>=2?1:0;
 const skill=(id,lesson)=>IDS.includes(id)&&own(LESSONS,lesson)?db().skills[id]?.[lesson]||{count:0,lastDay:0}:null;
 function current(home){
  if(!HOMES.includes(home))return null;
  const s=db().sessions[home];
  if(!s||s.day!==state().day||!dayOK(state().day)||members(home).length!==2||
   !members(home).includes(s.mentor)||!members(home).includes(s.learner))return null;
  return s;
 }
 function canStart(home,mentor,lesson){
  const people=members(home);
  if(!dayOK(state().day)||people.length!==2||!people.includes(mentor)||!own(LESSONS,lesson))return {ok:false,reason:'This lesson needs two current housemates.'};
  const learner=people.find(id=>id!==mentor);
  if(db().sessions[home]?.day===state().day&&db().sessions[home]?.stage==='finished')return {ok:false,reason:'This home already completed a lesson today.'};
  if(current(home)?.stage==='learner')return {ok:false,reason:'Finish the learner’s practice or cancel this unfinished lesson first.'};
  if(db().practiceDay[learner]===state().day)return {ok:false,reason:'This learner already completed their daily practice.'};
  const used=api.getDone?.(mentor)||[],practiced=api.getDone?.(learner)||[];
  if(used.includes(lesson)||practiced.includes(lesson))return {ok:false,reason:'One person already finished this activity today. Try another skill or a new day.'};
  return {ok:true,reason:'Ready for a real lesson.',learner};
 }
 function begin(home,mentor,lesson){
  const check=canStart(home,mentor,lesson);if(!check.ok)return false;
  db().sessions[home]={day:state().day,mentor,learner:check.learner,lesson,stage:'mentor'};
  api.save?.();api.updateUI?.();
  api.notify?.(label(mentor)+' will demonstrate '+LESSONS[lesson].title.toLowerCase()+'. Their housemate will practice after the lesson.');
  return true;
 }
 function cancel(home){
  const s=current(home);if(!s||s.stage==='finished')return false;
  delete db().sessions[home];api.save?.();api.updateUI?.();
  api.notify?.('The unfinished lesson was set aside. Earned skills and memories are unchanged.');
  return true;
 }
 function queue(home){
  const s=current(home);if(!s||s.stage==='finished')return false;
  const actor=s.stage==='mentor'?s.mentor:s.learner;
  if((api.getDone?.(actor)||[]).includes(s.lesson))return false;
  const old=api.getSchedule?.(home,actor);
  if(!Array.isArray(old))return false;
  if(old.includes(s.lesson)){api.notify?.('That activity is already in the resident’s independent Daybook.');return true}
  if(old.length>=3)return false;
  const added=api.addSchedule?.(home,actor,s.lesson);
  if(added)api.notify?.('Activity added to '+label(actor)+'’s independent schedule. You may also guide the task manually.');
  return !!added;
 }
 // Read only the genuine first home activity completion, with a genuine actor,
 // same-day stage and real household residency. All bonuses happen here.
 function completed(home,id,action,first=true,day=state().day){
  if(!first||!dayOK(day)||day!==state().day||!HOMES.includes(home)||
   !IDS.includes(id)||!own(LESSONS,action))return false;
  const data=db(),earned=skill(id,action);
  let benefit=0;
  // Learned confidence works on later days, never the day of its own lesson.
  if(earned.count>=2&&earned.lastDay<day&&data.bonusDay[id]?.[action]!==day){
   const level=levels(earned.count),ns=api.getNeeds?.(id);
   if(object(ns)){
    benefit=1+level; // rank 1/2/3: +2/+3/+4 Fun, never coins/XP
    ns.fun=cap((Number.isFinite(ns.fun)?ns.fun:0)+benefit,0,100);
    (data.bonusDay[id]??={})[action]=day;
   }
  }
  const s=current(home);
  if(!s||s.lesson!==action)return benefit?{benefit}:false;
  if(s.stage==='mentor'&&s.mentor===id){
   s.stage='learner';
   api.notify?.('📖 '+label(id)+' finished the demonstration. '+label(s.learner)+' can now practice '+LESSONS[s.lesson].title.toLowerCase()+'.');
   return {stage:'learner',benefit};
  }
  if(s.stage!=='learner'||s.learner!==id||data.practiceDay[id]===day)return benefit?{benefit}:false;
  s.stage='finished';data.practiceDay[id]=day;
  const previous=skill(id,action),count=cap(previous.count+1,1,99),before=levels(previous.count),after=levels(count);
  (data.skills[id]??={})[action]={count,lastDay:day};
  data.memories.push({home,day,mentor:s.mentor,learner:id,lesson:action});data.memories=data.memories.slice(-36);
  const tutor=api.getNeeds?.(s.mentor),learner=api.getNeeds?.(id);
  if(object(tutor))tutor.social=cap((Number.isFinite(tutor.social)?tutor.social:0)+3,0,100);
  if(object(learner))learner.fun=cap((Number.isFinite(learner.fun)?learner.fun:0)+5,0,100);
  const k=pair([id,s.mentor]);if(!object(state().townBonds))state().townBonds={};
  state().townBonds[k]=cap((Number.isFinite(state().townBonds[k])?state().townBonds[k]:0)+1,0,100);
  api.notify?.('🌿 '+label(s.mentor)+' taught '+label(id)+' '+LESSONS[action].short.toLowerCase()+
   '. '+(after>before?'New confidence rank unlocked for future real '+action+' activities!':'A genuine lesson is added to their family story.'));
  // The caller owns the original action save. No menu/plan/partial rewards.
  return {stage:'finished',benefit,count,rank:after,unlocked:after>before};
 }
 function book(home){
  if(!HOMES.includes(home))return '';
  const people=members(home),s=current(home),past=db().memories.filter(x=>x.home===home).slice(-4).reverse();
  const cards=people.length===2?people.map(mentor=>
   '<div class="mt34-mentor"><b>Let '+label(mentor)+' teach</b><div class="mt34-options">'+ACTIONS.map(id=>{
    const check=canStart(home,mentor,id);
    const active=s?.mentor===mentor&&s?.lesson===id;
    return '<button data-act="mt34-choose" data-id="'+home+'|'+mentor+'|'+id+'" '+(!check.ok||active?'disabled':'')+
      ' aria-label="'+esc(label(mentor))+' teaches '+LESSONS[id].title+'">'+LESSONS[id].icon+'<small>'+esc(LESSONS[id].title)+'</small></button>';
   }).join('')+'</div></div>').join(''):
   '<p class="mt34-empty">Two real residents must share this home before they can teach each other.</p>';
  const status=s?'<section class="mt34-live"><h4>'+LESSONS[s.lesson].icon+' '+LESSONS[s.lesson].title+'</h4><p>'+
   (s.stage==='mentor'?label(s.mentor)+' is preparing a real demonstration.':
    s.stage==='learner'?label(s.mentor)+' finished teaching. Now '+label(s.learner)+' needs to practice.':
     '✓ '+label(s.mentor)+' and '+label(s.learner)+' completed the lesson today.')+
   '</p><div class="mt34-steps"><span class="'+(s.stage!=='mentor'?'done':'')+'">1 · '+label(s.mentor)+' demonstrates</span><span class="'+(s.stage==='finished'?'done':'')+'">2 · '+label(s.learner)+' practices</span></div>'+
   (s.stage==='finished'?'':'<button data-act="mt34-queue" data-id="'+home+'">🗓️ Add the next real activity to its resident’s schedule</button><button data-act="mt34-cancel" data-id="'+home+'">Set aside this unfinished lesson</button>')+'</section>':'';
  const cardsFor=IDS.map(id=>{
   const learned=db().skills[id],detail=learned&&Object.entries(learned).filter(([key,v])=>own(LESSONS,key)&&v.count>0);
   if(!detail?.length)return '';
   return '<div class="mt34-learner"><b>'+label(id)+'</b><span>'+detail.map(([key,v])=>LESSONS[key].icon+' '+esc(LESSONS[key].short)+' · '+v.count+' lessons · rank '+levels(v.count)).join(' · ')+'</span></div>';
  }).filter(Boolean).join('');
  return '<section class="mt34-book"><header class="mt34-cover"><small>FAMILY CARE · SHARED KNOWLEDGE</small><h3>🌿 Passing It On</h3><p>One roommate shows how a real activity is done. The other tries it for themselves. Lessons are only completed when both finish the actual activities in the right order.</p></header>'+
   '<p class="mt34-place">Learning together at '+homeLabel(home)+'</p>'+status+'<div class="mt34-card-grid">'+cards+'</div>'+
   '<section class="mt34-history"><h4>Skills that stay with us</h4>'+(cardsFor||'<p>No skills learned yet. After two real lessons, a little confidence carries into future days.</p>')+
   '<h4>Recently shared lessons</h4><ul>'+(past.map(e=>'<li>Day '+e.day+' · '+label(e.mentor)+' helped '+label(e.learner)+' learn '+esc(LESSONS[e.lesson].short)+'</li>').join('')||'<li>New lessons will appear after both activities really finish.</li>')+'</ul></section>'+
   '<p class="mt34-note">Learning is optional, non-romantic and open to the existing adult residents. Completing real practice gives the learner +5 Fun and the teacher +3 Social, plus a small bond improvement. After two, four and six lessons in the same subject, the learner gets +2, +3 or +4 Fun on one genuine matching action per future day. Skills persist after moving homes. No coins or instant rewards for planning.</p></section>';
 }
 function board(home){
  const target=HOMES.includes(home)?home:'h0';
  api.showModal?.('mentorship','<div class="mt34-page"><div class="mt34-tabs">'+HOMES.map(h=>
   '<button data-act="mt34-view" data-id="'+h+'" aria-pressed="'+(h===target)+'">'+homeLabel(h)+'</button>').join('')+'</div>'+book(target)+
   '<button class="mt34-back" data-act="mt34-back">Return to the household Daybook</button></div>');
 }
 function handle(action,id,home){
  if(action==='mt34-view')return board(id);
  if(action==='mt34-choose'){
   const p=typeof id==='string'?id.split('|'):[];
   if(p.length===3&&HOMES.includes(p[0]))begin(p[0],p[1],p[2]);
   return board(p[0]||home);
  }
  if(action==='mt34-queue'){if(!queue(id))api.notify?.('That resident already finished the activity or has a full independent schedule. Try guiding them manually or clear a slot.');return board(id)}
  if(action==='mt34-cancel'){cancel(id);return board(id)}
  if(action==='mt34-back')return api.back?.();
  if(action==='mt34-board')return board(HOMES.includes(id)?id:home);
  return false;
 }
 function draw(g,home){
  const s=current(home);if(!s)return;
  const lesson=LESSONS[s.lesson];g.save();g.translate(843,305);
  g.fillStyle='#9b755b';g.fillRect(-88,-49,176,115);
  g.fillStyle='#f1d9b6';g.fillRect(-84,-45,168,107);
  g.fillStyle='#567b67';g.fillRect(-77,-40,154,91);
  g.fillStyle='#e7f1d5';g.font='bold 12px system-ui';g.textAlign='center';g.fillText('LEARNING TOGETHER',0,-24);
  // Lesson-specific original pictographs constructed from canvas lines,
  // not borrowed art or toolbar icons.
  g.strokeStyle=lesson.color;g.fillStyle=lesson.color;g.lineWidth=4;
  if(s.lesson==='read'){
   g.fillRect(-26,-12,23,28);g.fillRect(3,-12,23,28);
   g.strokeStyle='#f9eedb';g.beginPath();g.moveTo(0,-13);g.lineTo(0,19);g.stroke();
  }else if(s.lesson==='meal'){
   g.beginPath();g.arc(0,1,22,0,6.283);g.fill();g.fillStyle='#fcf1ce';g.beginPath();g.arc(0,1,15,0,6.283);g.fill();
  }else if(s.lesson==='tidy'){
   g.fillRect(-25,-10,50,25);g.strokeStyle='#fff0cf';g.beginPath();g.moveTo(-27,-15);g.lineTo(27,-15);g.stroke();
  }else{
   for(let i=0;i<3;i++){g.beginPath();g.arc(-17+i*17,-4+i*3,10,0,6.283);g.fill()}
  }
  for(const [i,done] of [s.stage!=='mentor',s.stage==='finished'].entries()){
   g.fillStyle=done?'#c2e2b9':'#c29c7f';g.beginPath();g.arc(-35+i*70,36,10,0,6.283);g.fill();
   g.fillStyle='#385745';g.font='bold 11px system-ui';g.fillText(done?'✓':String(i+1),-35+i*70,40);
  }
  g.restore();
 }
 return {clean,current,begin,cancel,queue,completed,board,handle,skill,levels,draw,canStart,get data(){return db()}};
}
root.HearthMentorship={setup,clean,LESSONS,IDS,HOMES};
})(window);
