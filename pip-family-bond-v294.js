/* Hearth & Harbor v2.9.4 — Poppy & Pip: A Bond Built by Living.
 * Family closeness grows ONLY from separately dated, real-world completed
 * childhood activities already saved by the original gameplay systems.
 * Optional personal reflections, not free clicks, carry lasting two-choice
 * family history and small handmade in-world art. No passive needs or money.
 */
(function(root){'use strict';
const CHAPTERS={
 1:{name:'A Place to Belong',icon:'🌷',days:4,kinds:3,post:1,
  intro:'Pip remembers the first small afternoons when you showed up together. Where does home begin?',
  choices:['In the quiet moments when we listen','In the little things we make together'],
  after:['Pip remembers that Poppy always makes time to listen.','Pip remembers the little things they learned to make with Poppy.'],
  ink:['#9fb8a0','#d5a6b8']},
 2:{name:'Learning Side by Side',icon:'📚',days:8,kinds:4,post:4,
  intro:'There have been many real days of trying, helping and sometimes making mistakes. What matters about learning together?',
  choices:['Pip may find a new way of doing things','Poppy and Pip can teach each other'],
  after:['Pip feels brave enough to share a different idea with Poppy.','Pip loves that both of them have something to teach the other.'],
  ink:['#d7a474','#8cabb7']},
 3:{name:'A Home We Keep Growing',icon:'🏡',days:14,kinds:5,post:8,
  intro:'The cottage holds stories, projects and friends from all those days together. What should carry forward?',
  choices:['Welcome more good people into our story','Keep making our own little traditions'],
  after:['Pip wants the warmth of this cottage to reach their friends, too.','Pip wants to keep a family tradition alive and make new ones.'],
  ink:['#89b4a0','#c69ab4']}
};
const GROUPS=['story','nature','creative','home','initiative','evening','community','seasons','outings','projects'];
const cleanDay=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const finite=Number.isFinite;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw,guardianDay=0){
 const g=cleanDay(guardianDay)?guardianDay:10000,seen=new Set(),chapters=[];
 if(Array.isArray(raw?.chapters))for(const r of raw.chapters.slice(-15)){
  if(!obj(r)||![1,2,3].includes(r.id)||!cleanDay(r.day)||r.day<g||
   ![0,1].includes(r.choice)||seen.has(r.id))continue;
  seen.add(r.id);chapters.push({id:r.id,day:r.day,choice:r.choice});
 }
 chapters.sort((a,b)=>a.id-b.id);
 return {chapters};
}
function evidence(state,child,asOf){
 const c=obj(child)?child:{},now=cleanDay(asOf)?asOf:0,g=cleanDay(c.guardianDay)?c.guardianDay:0;
 if(c.guardian!=='player'||!g||g>now)return {days:0,post:0,kinds:[],last:0,stage:0};
 const dates=new Set(),after=new Set(),types=new Set();
 const add=(day,group)=>{
  if(!cleanDay(day)||day>now||!GROUPS.includes(group))return;
  dates.add(day);types.add(group);if(day>=g)after.add(day);
 };
 // Before chosen guardianship, Poppy genuinely met Pip through completed
 // three-choice childhood story, garden and creative activities.
 if(Array.isArray(c.memories))for(const r of c.memories.slice(-120)){
  if(!obj(r)||!['story','garden','art'].includes(r.kind)||
   !Number.isInteger(r.choiceMask)||r.choiceMask<0||r.choiceMask>7)continue;
  add(r.day,r.kind==='story'?'story':r.kind==='garden'?'nature':'creative');
 }
 const verified=(rows,kindCheck,group,earliest=g)=>{
  if(!Array.isArray(rows))return;
  for(const r of rows.slice(-120)){
   if(!obj(r)||!cleanDay(r.day)||r.day<earliest||!kindCheck(r))continue;
   add(r.day,group);
  }
 };
 verified(root.HearthPipHomeHelp?.clean?.(c.homeHelps),r=>['read','tidy','meal','hobby'].includes(r.kind),'home');
 verified(root.HearthPipInitiatives?.clean?.(c.childInitiatives,g)?.records,
  r=>['read','tidy','meal','hobby'].includes(r.kind)&&[0,1].includes(r.choice),'initiative');
 verified(root.HearthPipRoutines?.cleanEvenings?.(c.evenings),r=>[0,1,2,3].includes(r.mask),'evening');
 // An adult guest is only counted if the original child met that actual adult
 // before the completed cottage visit.
 const visitors=root.HearthPipHomeVisits?.clean?.(c.homeVisits)?.memories||[];
 verified(visitors,r=>Array.isArray(c.meetings)&&c.meetings.some(m=>
   m?.id===r.id&&cleanDay(m.day)&&m.day<r.day),'community');
 const rituals=root.HearthPipRituals?.recordsFor?.(state,c,now)||[];
 verified(rituals,r=>['welcome','supper','orchard'].includes(r.key),'seasons');
 verified(root.HearthPipAdventures?.clean?.(c.adventures),r=>typeof r.id==='string','outings');
 verified(root.HearthPipProjects?.clean?.(c.projects),r=>['stories','kindness','discover'].includes(r.dream),'projects');
 const days=dates.size,post=after.size,kinds=GROUPS.filter(k=>types.has(k));
 let stage=0;
 for(let i=1;i<=3;i++){
  const rule=CHAPTERS[i];
  if(days>=rule.days&&kinds.length>=rule.kinds&&post>=rule.post)stage=i;
 }
 return {days,post,kinds,last:dates.size?Math.max(...dates):0,stage};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),
  today=()=>cleanDay(state()?.day)?state().day:1,scene=()=>api.getScene?.();
 const guarded=()=>child()?.guardian==='player'&&cleanDay(child()?.guardianDay)&&child().guardianDay<=today();
 const records=()=>clean(child()?.familyBond,child()?.guardianDay);
 const profile=()=>{
  const current=evidence(state(),child(),today());
  // A genuinely earned family chapter remains part of the relationship
  // even when the original bounded old scrapbook eventually rolls over.
  const last=records().chapters.slice(-1)[0]?.id||0;
  return {...current,stage:Math.max(current.stage,last)};
 };
 let prompt=null,display={chapters:[],stage:0},wait=0;
 function sync(){const p=profile();display={chapters:records().chapters,stage:p.stage};return p}
 function next(){
  const p=profile(),done=records().chapters.map(x=>x.id);
  for(let id=1;id<=p.stage;id++)if(!done.includes(id))return id;
  return null;
 }
 function near(){
  const a=api.getPlayer?.(),b=api.getChildPosition?.();
  return !!a&&!!b&&[a.x,a.y,b.x,b.y].every(finite)&&dist(a,b)<=140;
 }
 function ready(){
  if(!guarded()||scene()!=='home'||!next()||!near()||
   api.isBusy?.()||prompt)return false;
  return true;
 }
 function request(){
  if(!ready())return false;
  const id=next(),story=CHAPTERS[id];
  prompt={id,day:today()};
  api.showModal?.('little-sprouts','<section class="ls272-book pb294-book"><header class="ls272-cover"><small>✦ A REAL FAMILY CHAPTER · '+story.days+' SHARED DAYS</small><h2>'+story.icon+' '+esc(story.name)+'</h2><p>'+esc(story.intro)+'</p></header><p>Every chapter here grew from days you actually played together. Your choice is a memory, not a free reward or a new family relationship.</p><div class="ls272-activity">'+
   story.choices.map((t,i)=>'<button data-act="pb294-choose" data-id="'+i+'">'+esc(t)+'</button>').join('')+
   '</div><button class="ls272-secondary" data-act="pb294-cancel">Another time</button></section>');
  return true;
 }
 function choose(choice){
  const p=prompt;prompt=null;
  if(!p||![0,1].includes(choice)||p.day!==today()||scene()!=='home'||
   !guarded()||api.isBusy?.()||!near()||p.id!==next())return false;
  const c=child(),old=records();
  c.familyBond=clean({chapters:[...old.chapters,{id:p.id,day:today(),choice}]},c.guardianDay);
  sync();api.save?.();api.updateUI?.();
  const story=CHAPTERS[p.id];
  api.notify?.('🌷 A real memory of '+story.name.toLowerCase()+' now lives in your cottage.');
  api.showModal?.('little-sprouts','<section class="ls272-book pb294-book"><header class="ls272-cover"><small>✿ A MEMORY THE TWO OF YOU MADE</small><h2>'+story.icon+' '+esc(story.name)+'</h2><p>'+esc(story.after[choice])+'</p></header><p>Pip and Poppy will remember this in the ways they greet each other and share new ideas. No extra needs or money were granted.</p><button data-act="pb294-book">Back to Pip’s Daybook</button></section>');
  return true;
 }
 function cancel(){if(!prompt)return false;prompt=null;api.closeModal?.();return true}
 function latest(){return records().chapters.slice(-1)[0]||null}
 function line(){
  const r=latest();return r?CHAPTERS[r.id].after[r.choice]:'';
 }
 function ideaLine(){
  const r=latest();if(!r)return '';
  return CHAPTERS[r.id].after[r.choice]+' It makes this afternoon together feel special.';
 }
 function panel(){
  if(!guarded())return '';
  const p=profile(),old=records().chapters,nextId=next();
  const reached=p.stage>0?CHAPTERS[p.stage].name:'Getting to know each other';
  const nextRule=p.stage<3?CHAPTERS[p.stage+1]:null;
  const details=nextRule?'<small>Next: '+Math.max(0,nextRule.days-p.days)+' more unique shared days, '+Math.max(0,nextRule.kinds-p.kinds.length)+' more kinds of activity and '+Math.max(0,nextRule.post-p.post)+' more days after moving in.</small>':
   '<small>These three chapters have grown through the real days you shared.</small>';
  const rows=old.chapters.map(r=>'<li>Day '+r.day+' · '+CHAPTERS[r.id].icon+' '+esc(CHAPTERS[r.id].name)+' · '+esc(CHAPTERS[r.id].choices[r.choice])+'</li>').join('');
  return '<section class="pb294-panel"><details><summary>💛 Poppy & Pip · '+esc(reached)+'</summary><div class="pb294-body"><p>This bond grows from real childhood afternoons, care, household actions and family visits—not from a friendship button.</p><div class="pb294-count"><span>🌼 '+p.days+' shared days</span><span>🏡 '+p.post+' days since moving in</span><span>🎨 '+p.kinds.length+' ways of connecting</span></div>'+
   details+(nextId?'<p><strong>'+CHAPTERS[nextId].icon+' '+esc(CHAPTERS[nextId].name)+'</strong> is ready to talk about together.</p>':'')+
   (ready()?'<button data-act="pb294-reflect">Have a real family conversation</button>':nextId?'<small>Visit Pip in the cottage when both of you are free to share this moment.</small>':'')+
   '<ul class="pb294-history">'+(rows||'<li>Your later family conversations will be remembered here.</li>')+'</ul></div></details></section>';
 }
 function drawGesture(g,pos,tick=0){
  if(!g||!pos||scene()!=='home'||api.isBusy?.())return false;
  const r=display.chapters.slice(-1)[0],p=api.getPlayer?.();
  if(!r||!p||![p.x,p.y,pos.x,pos.y].every(finite)||dist(pos,p)>115||
   api.isPlayerMoving?.())return false;
  const x=Math.round(pos.x+23),y=Math.round(pos.y-68+Math.sin(tick*2.1)*1.8);
  g.save();g.fillStyle='#eabf9e';g.fillRect(x-6,y+3,8,9);
  g.fillStyle=CHAPTERS[r.id].ink[r.choice];g.fillRect(x,y-3,15,11);
  g.fillStyle='#fff3d8';g.fillRect(x+4,y,7,5);g.restore();return true;
 }
 // Three small original handmade paper pennants pinned beneath the central
 // cottage wall molding, distinct from existing six neighbor frames.
 const SITE=[{x:534,y:200},{x:586,y:200},{x:638,y:200}];
 function drawWall(g,tick=0){
  if(!g||scene()!=='home'||!display.chapters.length)return false;
  g.save();
  for(const r of display.chapters){
   const site=SITE[r.id-1],story=CHAPTERS[r.id],x=site.x,y=site.y;
   g.fillStyle='#765c56';g.fillRect(x-16,y-7,32,37);
   g.fillStyle='#f6e3c6';g.fillRect(x-13,y-5,26,30);
   g.fillStyle=story.ink[r.choice];g.fillRect(x-10,y,20,20);
   g.fillStyle='#fff2d6';g.fillRect(x-4,y+3,9,11);
   g.fillStyle='#d0a77c';g.fillRect(x-2,y-11,5,6);
   if(r.choice===0){
    g.fillStyle='#9abca0';g.fillRect(x-8,y+23,16,3);
    g.fillRect(x-7,y+7,4,5);
   }else{
    g.fillStyle='#bd91ac';g.fillRect(x-8,y+23,16,3);
    g.fillRect(x+5,y+7,4,5);
   }
   if(today()===r.day&&Math.sin(tick*1.7+r.id)>.8){
    g.fillStyle='#fff0b4';g.fillRect(x+15,y-12,4,4);
   }
  }
  g.restore();return true;
 }
 function advance(dt){
  if(prompt&&(prompt.day!==today()||scene()!=='home'||!guarded()))prompt=null;
  if(!finite(dt)||dt<=0||api.isPaused?.())return;
  wait-=Math.min(dt,.2);
  if(wait<=0){sync();wait=.9}
 }
 function handle(action,id){
  if(action==='pb294-reflect')return request();
  if(action==='pb294-choose')return choose(Number(id));
  if(action==='pb294-cancel')return cancel();
  if(action==='pb294-book'){api.closeModal?.();return api.openBook?.()}
  return false;
 }
 sync();
 return {clean,evidence,profile,next,records,ready,request,choose,cancel,
  panel,line,ideaLine,drawGesture,drawWall,advance,handle,
  get prompt(){return prompt}};
}
root.HearthPipFamilyBond={setup,clean,evidence,CHAPTERS,GROUPS};
})(window);
