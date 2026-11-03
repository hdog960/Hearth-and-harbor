/* Hearth & Harbor v2.7.3 — Pip's Living Day.
 * A real, deterministic visual childhood routine and player-earned bedtime
 * ritual. No fabricated school building, forced aging, jobs or income.
 */
(function(root){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDay=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROUTES={
 town:[
  {start:0,x:790,y:898,title:'Quiet village hours',icon:'🌙',prop:'lantern',note:'Pip watches the sleepy streets'},
  {start:360,x:680,y:896,title:'Clover meadow play',icon:'🍀',prop:'clover',note:'Finding shapes in the leaves'},
  {start:720,x:733,y:821,title:'Story circle by the garden',icon:'📖',prop:'book',note:'An afternoon of little tales'},
  {start:1080,x:790,y:898,title:'Lantern walk',icon:'✨',prop:'lantern',note:'Winding down with the village lights'}
 ],
 home:[
  {start:0,x:765,y:756,title:'Quiet rest',icon:'🌙',prop:'pillow',note:'A soft place to feel at home'},
  {start:360,x:685,y:744,title:'Morning stories',icon:'📖',prop:'book',note:'Making up a new little adventure'},
  {start:720,x:735,y:830,title:'Creative afternoon',icon:'🎨',prop:'crayon',note:'Colors and paper scattered about'},
  {start:1080,x:765,y:756,title:'Bedtime wind-down',icon:'💛',prop:'pillow',note:'A calm evening after a busy day'}
 ]
};
const MASTERIES={
 story:{title:'Storytelling',icon:'📖',ranks:['Curious Listener','Little Storyteller','Dream Weaver','Keeper of Tales']},
 garden:{title:'Nature',icon:'🍃',ranks:['Clover Explorer','Little Naturalist','Meadow Guide','Gentle Gardener']},
 art:{title:'Creativity',icon:'🎨',ranks:['Color Explorer','Little Artist','Creative Maker','Sketchbook Star']}
};
const NIGHT=[
 {title:'Make the bedtime nook cozy',prompt:'Pip looks around the cottage. How should we settle in?',answers:[
  ['Fold a soft little blanket','Pip tucks the blanket into a warm nest.'],
  ['Choose a favorite storybook','A favorite book waits beside the pillow.']
 ]},
 {title:'Wish for tomorrow',prompt:'The stars are coming out. What should Pip remember?',answers:[
  ['A kind thing from today','Pip remembers the kindness of someone they care about.'],
  ['A new thing to discover','Pip dreams of a bright new adventure tomorrow.']
 ]}
];
function plan(minute,guardian){
 const m=Number.isFinite(minute)?((minute%1440)+1440)%1440:0;
 const place=guardian==='player'?'home':'town',route=ROUTES[place];
 const i=Math.min(3,Math.floor(m/360)),current=route[i],previous=route[(i+3)%4];
 const elapsed=m-current.start,transition=75,progress=clamp(elapsed/transition,0,1);
 const smooth=progress*progress*(3-2*progress);
 const x=previous.x+(current.x-previous.x)*smooth,y=previous.y+(current.y-previous.y)*smooth;
 return {scene:place,x,y,moving:progress<1&&Math.hypot(current.x-previous.x,current.y-previous.y)>2,
  facing:current.x>previous.x?'side':current.y<previous.y?'back':'front',
  label:current.title,icon:current.icon,prop:current.prop,note:current.note,
  next:route[(i+1)%4].title,nextAt:((i+1)%4)*360,slot:i,
  route:route.map(r=>({start:r.start,title:r.title,icon:r.icon,note:r.note})),progress};
}
function mastery(memories,day,earnedCounts=null){
 const valid=Array.isArray(memories)?memories:[],result={};
 for(const [kind,meta] of Object.entries(MASTERIES)){
  const dates=new Set();
  for(const m of valid){
   if(obj(m)&&m.kind===kind&&validDay(m.day)&&m.day<=day&&Number.isInteger(m.choiceMask)&&m.choiceMask>=0&&m.choiceMask<=7)dates.add(m.day);
  }
  const prior=obj(earnedCounts)&&Number.isInteger(earnedCounts[kind])&&earnedCounts[kind]>=0&&earnedCounts[kind]<=999?earnedCounts[kind]:0;
  const days=Math.max(dates.size,prior),rank=Math.min(3,Math.floor(days/2));
  result[kind]={kind,title:meta.title,icon:meta.icon,days,rank,label:meta.ranks[rank],next:rank===3?null:(rank+1)*2-days};
 }
 return result;
}
function cleanEvenings(raw){
 const seen=new Set(),out=[];
 if(Array.isArray(raw))for(const e of raw.slice(-90)){
  if(!obj(e)||!validDay(e.day)||!Number.isInteger(e.mask)||e.mask<0||e.mask>3||seen.has(e.day))continue;
  seen.add(e.day);out.push({day:e.day,mask:e.mask});
 }
 return out.sort((a,b)=>a.day-b.day).slice(-35);
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>validDay(state().day)?state().day:1;
 const guardian=()=>child().guardian==='player',location=()=>{
  const s=state(),c=child(),base=root.HearthPipProjects.schedule(s.minute,c,day(),plan);
  const actual=root.HearthPipGuides.attendancePose(base,c,s.minute,day(),api.getAdults?.()||[],api.isWalkable);
  return api.adjustHomePose?.(actual)||actual;
 };
 const records=()=>child().evenings||[];
 let session=null;
 const evening=()=>guardian()&&Number(state().minute)>=1080&&Number(state().minute)<1440;
 const nearby=()=>api.getScene?.()==='home'&&api.isNearby?.(location(),115);
 const eligible=()=>evening()&&nearby()&&!records().some(r=>r.day===day())&&!session;
 function card(){
  const p=location(),d=child(),skills=mastery(d.memories,day(),d.skills);
  const schedule=p.route.map((s,i)=>'<div class="pr273-schedule'+(i===p.slot?' pr273-current':'')+'"><span>'+s.icon+'</span><div><b>'+s.title+'</b><small>'+s.note+'</small></div><small>'+['12 AM','6 AM','12 PM','6 PM'][i]+'</small></div>').join('');
  const skillsHtml=Object.values(skills).map(x=>'<div class="pr273-skill"><span>'+x.icon+'</span><div><b>'+x.title+' · '+x.label+'</b><small>'+x.days+' different days spent learning'+(x.next?' · '+x.next+' more to next chapter':' · Every chapter earned')+'</small><i><em style="width:'+Math.min(100,(x.days/6)*100)+'%"></em></i></div></div>').join('');
  return '<div class="pr273-panel"><div class="pr273-header"><small>A CHILDHOOD WITH ITS OWN RHYTHM</small><h3>🌼 Pip’s Living Day</h3><p>Pip actually follows this daily route in the playable world. The little schedule adjusts once Pip lives in your cottage.</p><strong>'+p.icon+' Right now: '+p.label+'</strong><small>Coming next: '+p.next+'</small></div><div class="pr273-route">'+schedule+'</div><h3>Little things Pip is learning</h3><p>These chapters grow only when your real shared activities are completed on different in-game days.</p>'+skillsHtml+(guardian()?'<div class="pr273-night"><strong>🌙 Our evening ritual</strong><p>After 6 PM, spend two thoughtful moments together in your cottage. Once each night; never an automatic reward.</p>'+(eligible()?'<button data-act="pr273-start">Start a cozy bedtime ritual</button>':records().some(r=>r.day===day())?'<small>✓ Tonight’s memory is already in the scrapbook.</small>':'<small>Visit Pip in your cottage after 6 PM to share this moment.</small>')+'</div>':'')+(records().length?'<h3>Bedtime memories</h3><ul class="pr273-memories">'+records().slice(-6).reverse().map(e=>'<li>🌙 Day '+e.day+' · A cozy evening together</li>').join('')+'</ul>':'')+'</div>';
 }
 function start(){
  if(!eligible())return false;
  session={day:day(),step:0,mask:0};return page();
 }
 function page(){
  if(!session)return false;
  if(!evening()||session.day!==day()||!nearby()){session=null;return false}
  const q=NIGHT[session.step];
  if(!q)return false;
  api.showModal?.('little-sprouts','<section class="ls272-book pr273-book"><div class="ls272-cover"><small>BEDTIME · '+(session.step+1)+' OF 2</small><h2>🌙 '+q.title+'</h2><p>'+q.prompt+'</p></div><div class="ls272-activity">'+q.answers.map(([title],i)=>'<button data-act="pr273-answer" data-id="'+i+'">'+esc(title)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pr273-cancel">Leave the ritual for another evening</button></section>');
  return true;
 }
 function choose(index){
  if(!session||!Number.isInteger(index)||index<0||index>1)return false;
  if(!evening()||session.day!==day()||!nearby()){session=null;return false}
  const q=NIGHT[session.step];if(!q)return false;
  if(index===1)session.mask|=1<<session.step;
  const result=q.answers[index][1];session.step++;
  if(session.step<NIGHT.length){
   api.showModal?.('little-sprouts','<section class="ls272-book pr273-book"><div class="ls272-cover"><small>THE FIRST LITTLE MOMENT</small><h2>💛 A quiet pause</h2><p>'+esc(result)+'</p></div><button data-act="pr273-next">Continue our bedtime ritual</button><button class="ls272-secondary" data-act="pr273-cancel">Leave for another time</button></section>');
   return true;
  }
  const record={day:day(),mask:session.mask};session=null;
  if(!guardian()||records().some(r=>r.day===record.day))return false;
  const d=child();d.evenings=cleanEvenings([...records(),record]);
  d.needs.joy=clamp(d.needs.joy+9,0,100);d.needs.confidence=clamp(d.needs.confidence+5,0,100);
  api.save?.();api.updateUI?.();api.notify?.('🌙 A new real bedtime memory with Pip! Joy +9, Confidence +5.');
  api.showModal?.('little-sprouts','<section class="ls272-book pr273-book"><div class="ls272-cover"><small>AN EVENING TO REMEMBER</small><h2>🌟 Sleep well, Pip</h2><p>'+esc(result)+'</p></div><p>You earned a genuine bedtime memory. Pip’s story keeps growing, one real day at a time.</p><button data-act="pr273-book">Return to Pip’s Daybook</button></section>');
  return true;
 }
 function handle(action,id){
  if(action==='pr273-start')return start();
  if(action==='pr273-next')return page();
  if(action==='pr273-answer')return choose(Number(id));
  if(action==='pr273-cancel'){session=null;return api.openBook?.()}
  if(action==='pr273-book')return api.openBook?.();
  return false;
 }
 function drawProp(g,p,tick){
  if(!g||!p)return;
  const x=Math.round(p.x+39),y=Math.round(p.y-17+Math.sin(tick*2)*2);
  g.save();g.lineWidth=2;
  if(p.prop==='book'){
   g.fillStyle='#6a5164';g.fillRect(x-14,y-10,30,20);g.fillStyle='#f9e2ba';g.fillRect(x-12,y-8,12,16);g.fillRect(x+2,y-8,12,16);g.fillStyle='#bc8aa1';g.fillRect(x,y-8,2,16);
  }else if(p.prop==='clover'){
   g.fillStyle='#74a86d';for(const [dx,dy] of [[-6,-6],[5,-6],[-6,5],[5,5]]){g.beginPath();g.arc(x+dx,y+dy,5,0,Math.PI*2);g.fill()}g.fillStyle='#486c52';g.fillRect(x-1,y+8,2,9);
  }else if(p.prop==='crayon'){
   g.fillStyle='#e9d4b7';g.fillRect(x-13,y-7,28,19);g.fillStyle='#d3899b';g.fillRect(x-10,y-9,5,18);g.fillStyle='#84a5ba';g.fillRect(x+2,y-11,5,19);
  }else if(p.prop==='pillow'){
   g.fillStyle='#d8a8a7';g.fillRect(x-15,y-8,29,17);g.fillStyle='#f4ddce';g.fillRect(x-11,y-5,21,11);
  }else{
   g.fillStyle='#785b4e';g.fillRect(x-9,y-6,18,15);g.fillStyle='#f3d38b';g.fillRect(x-5,y-12,10,15);g.fillStyle='#fff4bc';g.fillRect(x-3,y-9,6,6);
  }
  g.restore();
 }
 return {card,handle,start,page,choose,eligible,location,drawProp,mastery:()=>mastery(child().memories,day(),child().skills),records, get session(){return session}};
}
root.HearthPipRoutines={setup,plan,mastery,cleanEvenings,ROUTES,MASTERIES};
})(window);
