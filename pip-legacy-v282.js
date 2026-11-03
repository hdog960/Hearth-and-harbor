/* Hearth & Harbor v2.8.2 — The Little Legacy Shelf
 * Three original family keepsakes, co-authored only after completing the
 * EXISTING 3-act Home & Town Traditions, actual child history, and the REAL
 * timed Poppy Daybook action at its physical cottage furniture.
 * No invented ancestor, currency, forced aging, or instant menu rewards.
 */
(function(root){'use strict';
const TRACKS={
 welcome:{title:'The Welcome Ribbon',icon:'🌷',tradition:'welcome',action:'tidy',stage:1,
  skill:'confidence',color:'#da9eaf',location:[720,600],
  requirement:'Get to know two real Maplewood neighbors with Pip',
  caption:'Your finished Welcome House tradition and Pip’s neighbor friendships inspire a little handmade ribbon.',
  memory:'Pip and Poppy finished the home’s welcoming corner together.'},
 supper:{title:'The Sunday Recipe Card',icon:'🥧',tradition:'supper',action:'meal',stage:1,
  skill:'joy',color:'#e1ba83',location:[824,390],
  requirement:'Complete a real meal-help day with Pip',
  caption:'Your finished Sunday at the Table tradition becomes a recipe card when Pip helps prepare another genuine supper.',
  memory:'Pip helped turn the family’s Sunday tradition into a recipe to remember.'},
 orchard:{title:'The Orchard Window Print',icon:'🍃',tradition:'orchard',action:'hobby',stage:2,
  skill:'curiosity',color:'#91bba2',location:[562,735],
  requirement:'Share two genuine nature-learning days with Pip',
  caption:'Your completed Roots by the Window tradition becomes a botanical print after Pip’s real nature lessons and a shared creative afternoon.',
  memory:'Pip drew a little orchard to remember the household’s growing roots.'}
};
const IDS=Object.keys(TRACKS),obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
const countDays=(arr,pred,now)=>new Set((Array.isArray(arr)?arr:[]).filter(x=>obj(x)&&dayOK(x.day)&&x.day<=now&&pred(x)).map(x=>x.day)).size;
function clean(raw){
 const seen=new Set(),out=[];
 if(Array.isArray(raw))for(const x of raw.slice(-30)){
  if(!obj(x)||!Object.hasOwn(TRACKS,x.key)||!dayOK(x.day)||
   x.action!==TRACKS[x.key].action||seen.has(x.key))continue;
  seen.add(x.key);out.push({key:x.key,day:x.day,action:x.action});
 }
 return out.sort((a,b)=>a.day-b.day||a.key.localeCompare(b.key)).slice(-3);
}
function prerequisites(state,child,key,now){
 const t=TRACKS[key];
 if(!t||!dayOK(now)||!obj(child)||child.guardian!=='player'||!dayOK(child.guardianDay)||child.guardianDay>now)return {ready:false,tradition:false,child:false,stage:false};
 const completed=state?.homeTraditions?.homes?.player?.[t.tradition]?.completedDay;
 const tradition=dayOK(completed)&&completed<=now;
 const stage=root.HearthPipGrowth.lifeStage(child,now)>=t.stage;
 let childReady=false;
 if(key==='welcome'){
  // Actual lifetime-neighbor counts survive the rolling 36-event scrapbook.
  const counts=obj(child.mentor?.counts)?child.mentor.counts:{};
  const known=['mabel','rosie','oliver','jun','bea','finn'].filter(id=>{
   const n=counts[id],saved=Number.isInteger(n)&&n>=0&&n<=999?n:0;
   return saved>0||countDays(child.meetings,x=>x.id===id&&Number.isInteger(x.mask)&&x.mask>=0&&x.mask<=3,now)>0;
  });
  childReady=known.length>=2;
 }else if(key==='supper'){
  childReady=countDays(child.homeHelps,x=>x.kind==='meal',now)>=1;
 }else{
  const n=child.skills?.garden,old=Number.isInteger(n)&&n>=0&&n<=999?n:0;
  childReady=Math.max(old,countDays(child.memories,x=>x.kind==='garden'&&Number.isInteger(x.choiceMask)&&x.choiceMask>=0&&x.choiceMask<=7,now))>=2;
 }
 return {ready:tradition&&childReady&&stage,tradition,child:childReady,stage};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),now=()=>dayOK(state().day)?state().day:1;
 const records=()=>Array.isArray(child().legacyKeepsakes)?child().legacyKeepsakes:[];
 const eligibleAt=key=>prerequisites(state(),child(),key,now());
 const earned=key=>records().some(r=>{
  const t=TRACKS[key],adultDay=state().homeTraditions?.homes?.player?.[key]?.completedDay,d=child();
  return !!t&&r.key===key&&r.action===t.action&&dayOK(r.day)&&r.day<=now()&&
   d.guardian==='player'&&dayOK(d.guardianDay)&&d.guardianDay<=r.day&&
   dayOK(adultDay)&&adultDay<=r.day&&root.HearthPipGrowth.lifeStage(d,r.day)>=t.stage;
 });
 const isHome=()=>api.getScene?.()==='home'&&child().guardian==='player';
 const near=()=>isHome()&&api.nearChild?.(145)===true;
 let pending=null;
 const active=()=>{
  if(pending&&(!isHome()||pending.day!==now()||!eligibleAt(pending.key).ready||earned(pending.key)||api.isQueued?.(pending.action)===false))pending=null;
  return pending;
 };
 const busy=()=>!!api.isChildBusy?.();
 function canPlan(key){
  const t=TRACKS[key];
  return !!t&&near()&&eligibleAt(key).ready&&!earned(key)&&!active()&&!busy()&&!api.ownDone?.(t.action);
 }
 function plan(key){
  if(!canPlan(key))return false;
  const t=TRACKS[key];
  pending={key,action:t.action,day:now()};
  api.closeModal?.();
  if(api.queueAction?.(t.action)!==true){
   pending=null;api.notify?.('Poppy’s Daybook has no space for another real household activity.');
   return false;
  }
  api.notify?.('🌷 Follow Poppy to the actual furniture and complete '+t.action+' with Pip to create '+t.title+'.');
  return true;
 }
 function complete(kind,once,day){
  const p=active();
  if(!p||!isHome()||once!==true||p.action!==kind||p.day!==day||day!==now()||!eligibleAt(p.key).ready||earned(p.key))return false;
  const t=TRACKS[p.key],r={key:p.key,day:now(),action:kind};
  pending=null;
  const d=child();d.legacyKeepsakes=clean([...records(),r]);
  d.needs[t.skill]=Math.min(100,Math.max(0,d.needs[t.skill]||0)+5);
  d.needs.joy=Math.min(100,Math.max(0,d.needs.joy||0)+2);
  api.save?.();api.updateUI?.();
  api.notify?.('🖼️ Pip and Poppy made '+t.title+'! It now appears in the actual cottage. '+t.skill+' +5.');
  return true;
 }
 function pose(){
  const p=active(),hold=api.ownHold?.();
  if(!p||!hold||hold.kind!==p.action||!isHome())return null;
  const [x,y]=TRACKS[p.key].location,dx=x>650?-60:64;
  const progress=Math.max(0,Math.min(1,1-hold.remaining/Math.max(.1,hold.duration)));
  return {x:x+dx,y:y+53-Math.sin(progress*Math.PI)*8,moving:progress<.48,
   facing:dx<0?'side':'front',participating:true,legacy:true};
 }
 function panel(){
  const d=child(),grown=root.HearthPipGrowth.lifeStage(d,now());
  if(d.guardian!=='player')return '<section class="pl282-panel"><div class="pl282-cover"><h3>🖼️ Our Little Legacy Shelf</h3><p>When Poppy and Pip choose to become family, real household traditions can become shared, handmade keepsakes. Nothing is assigned automatically.</p></div></section>';
  const cards=IDS.map(key=>{
   const t=TRACKS[key],p=eligibleAt(key),done=earned(key),can=canPlan(key),held=active()?.key===key;
   const needed=[
    p.tradition?'✓ The original three-chapter home tradition was genuinely completed':'○ Finish the original Home & Town tradition',
    p.child?'✓ '+t.requirement:'○ '+t.requirement,
    p.stage?'✓ Pip reached the required childhood developmental stage':'○ Reach '+(t.stage===1?'Growing Child':'Independent Child')
   ];
   return '<article class="pl282-card"><div class="pl282-head"><span>'+t.icon+'</span><div><strong>'+esc(t.title)+'</strong><small>'+esc(t.caption)+'</small></div></div><ul>'+
    needed.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul>'+
    (done?'<div class="pl282-earned">✓ Handmade and displayed on the cottage wall</div>':
     held?'<div class="pl282-active">🌷 Planned in Poppy’s real Daybook. Finish the action by the furniture to craft this keepsake.<button data-act="pl282-cancel">Cancel this plan</button></div>':
     can?'<button data-act="pl282-plan" data-id="'+key+'">🧵 Make this together via Poppy’s Daybook</button>':
     '<small>'+(p.ready?'Stand beside Pip in your cottage before Poppy finishes the '+t.action+' activity today.':'Continue the real family experiences above to unlock this craft.')+'</small>')+'</article>';
  }).join('');
  const recent=records().filter(r=>r.day<=now()).slice().reverse().map(r=>'<li>Day '+r.day+' · '+TRACKS[r.key].icon+' '+esc(TRACKS[r.key].title)+'</li>').join('');
  return '<section class="pl282-panel"><div class="pl282-cover"><small>GENERATIONS · HANDMADE WITH LOVE</small><h3>🖼️ Our Little Legacy Shelf</h3><p>The adult Home & Town Traditions book is the foundation. Pip’s real friendships, helping days, and learning unlock a final genuine household activity, creating a permanent physical keepsake.</p><strong>'+records().filter(r=>r.day<=now()).length+' / 3 shared traditions made · '+grown+' childhood stage</strong></div><h3>Three family traditions we can make together</h3>'+
   '<div class="pl282-grid">'+cards+'</div><button data-act="pf283-board">🧶 Gather around our family keepsakes</button><h3>Our handmade family memories</h3><ul class="pl282-history">'+(recent||'<li>Our first shared creation is waiting.</li>')+'</ul><p class="pl282-fine">Only an actual timed and completed Poppy Daybook activity creates these. Nothing is awarded for opening a book or putting an activity in the queue. No passive coins, compulsory aging, or fabricated relatives.</p></section>';
 }
 function draw(g,tick=0){
  if(!g||!isHome())return false;
  const list=IDS.filter(earned);
  if(!list.length)return false;
  const slots={welcome:708,supper:800,orchard:892},y=239;
  for(const key of list){
   const t=TRACKS[key],x=slots[key];
   g.save();
   // Physical wall-hung framed mini-pictures with distinct handmade art.
   g.fillStyle='#604f48';g.fillRect(x-26,y-30,53,68);
   g.fillStyle='#a67c62';g.fillRect(x-23,y-27,47,62);
   g.fillStyle='#f7e9d4';g.fillRect(x-19,y-23,39,52);
   g.fillStyle=t.color;g.fillRect(x-16,y-20,33,38);
   if(key==='welcome'){
    g.fillStyle='#fff5d7';g.fillRect(x-5,y-11,12,13);
    g.fillStyle='#9e6f90';g.fillRect(x-2,y-20,6,13);
    g.fillStyle='#f5dca7';g.fillRect(x-13,y+9,27,5);
    g.fillStyle='#89b99a';g.fillRect(x-10,y+1,9,8);g.fillRect(x+3,y+1,8,8);
   }else if(key==='supper'){
    g.fillStyle='#ffedda';g.fillRect(x-13,y+4,28,8);
    g.fillStyle='#b48267';g.fillRect(x-11,y-12,23,20);
    g.fillStyle='#eddaa3';g.fillRect(x-8,y-10,17,13);
    g.fillStyle='#d58982';g.fillRect(x-4,y-11,9,6);
   }else{
    g.fillStyle='#f7ebd2';g.fillRect(x-13,y-13,27,25);
    g.fillStyle='#8e6b55';g.fillRect(x-1,y-11,3,22);
    g.fillStyle='#5d9974';g.fillRect(x-12,y-8,10,7);g.fillRect(x+2,y-14,10,7);
    g.fillStyle='#d9b775';g.fillRect(x-10,y+7,22,3);
   }
   g.fillStyle='#fff7df';g.fillRect(x-12,y+24,25,3);
   if(Math.sin(tick*1.4+x)*1.5>1.2){g.fillStyle='#fff8dc';g.fillRect(x+29,y-29,4,4)}
   g.restore();
  }
  return true;
 }
 function board(){return api.showModal?.('little-sprouts','<section class="ls272-book">'+panel()+'<button data-act="pl282-pip">🌱 Open Pip’s full Daybook</button></section>')}
 function cancel(){if(!pending)return false;pending=null;return true}
 function handle(action,id){
  if(action==='pl282-board')return board();
  if(action==='pl282-pip')return api.openBook?.();
  if(action==='pl282-plan')return plan(id);
  if(action==='pl282-cancel'){if(!cancel())return false;return api.openBook?.()}
  if(action==='pl282-book')return api.openBook?.();
  return false;
 }
 return {clean,prerequisites,canPlan,plan,cancel,complete,pose,panel,board,draw,earned,handle,
   get pending(){return active()},get records(){return records().slice()},get bonus(){return IDS.filter(earned).length}};
}
root.HearthPipLegacy={setup,clean,prerequisites,TRACKS,IDS};
})(window);
