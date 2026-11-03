/* Hearth & Harbor v2.9.2 — Pip's Own Little Ideas.
 * At a real, nearby cottage meeting Pip may request an activity shaped by
 * earned interests. Poppy chooses whether Pip leads or learns alongside her.
 * Neither choice awards anything until an original timed Daybook hold REALLY
 * completes with both people physically at the correct furniture.
 */
(function(root){'use strict';
const KINDS=['read','tidy','meal','hobby'];
const STORIES={
 read:{icon:'📖',name:'A story to share',intro:'Pip has been thinking about a story and wants Poppy to hear the next page.',
  lead:'Pip chooses the next chapter and reads the favorite part aloud.',
  learn:'Poppy helps Pip notice the little details between the lines.',
  outcome:['Pip dared to tell a story in their own voice.','Pip learned how to listen and find a story together.'],
  prop:'#8d82b1',skill:'curiosity'},
 tidy:{icon:'🧺',name:'A cozy corner together',intro:'Pip noticed a corner that could feel a little more welcoming.',
  lead:'Pip makes a little plan for where everything belongs.',
  learn:'Poppy shows Pip how taking care of a room can feel like kindness.',
  outcome:['Pip learned that they can care for a shared space.','Pip learned a thoughtful habit by watching Poppy.'],
  prop:'#bc937a',skill:'confidence'},
 meal:{icon:'🥣',name:'A place at our table',intro:'Pip would like to make a special place for someone at the table.',
  lead:'Pip takes charge of the napkins and the table setting.',
  learn:'Poppy teaches Pip how to make every place feel inviting.',
  outcome:['Pip learned to welcome people by sharing the table.','Pip helped prepare a table with care and patience.'],
  prop:'#cd957b',skill:'confidence'},
 hobby:{icon:'🎨',name:'A little idea to make',intro:'Pip has an idea for something colorful they could make together.',
  lead:'Pip picks the first color and experiments with a new pattern.',
  learn:'Poppy demonstrates a way to draw something that feels familiar.',
  outcome:['Pip felt brave enough to try a surprising new idea.','Pip learned a creative trick to share another day.'],
  prop:'#bf88a7',skill:'joy'}
};
const validDay=n=>Number.isInteger(n)&&n>=1&&n<=9999,finite=Number.isFinite;
const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const empty=()=>({records:[],leadDays:0,learnDays:0});
function clean(raw,guardianDay=0){
 const out=empty(),min=validDay(guardianDay)?guardianDay:10000,seen=new Set();
 if(Array.isArray(raw?.records))for(const r of raw.records.slice(-100)){
  if(!obj(r)||!validDay(r.day)||r.day<min||!KINDS.includes(r.kind)||
    ![0,1].includes(r.choice)||seen.has(r.day))continue;
  seen.add(r.day);out.records.push({day:r.day,kind:r.kind,choice:r.choice});
 }
 out.records.sort((a,b)=>a.day-b.day||a.kind.localeCompare(b.kind));
 out.records=out.records.slice(-40);
 const counted=choice=>out.records.filter(r=>r.choice===choice).length;
 for(const [field,choice] of [['leadDays',0],['learnDays',1]]){
  const n=raw?.[field];
  out[field]=Math.max(counted(choice),Number.isInteger(n)&&n>=0&&n<=999?n:0);
 }
 return out;
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>validDay(state().day)?state().day:1;
 const scene=()=>api.getScene?.(),minute=()=>Number(state().minute);
 const owned=()=>child()?.guardian==='player'&&validDay(child()?.guardianDay)&&child().guardianDay<=day();
 const saved=()=>clean(child()?.childInitiatives,child()?.guardianDay);
 const already=()=>saved().records.some(r=>r.day===day());
 const activeHours=()=>finite(minute())&&minute()>=660&&minute()<1050;
 const blocked=()=>!!api.isOtherFamilyActivity?.();
 let prompt=null,pending=null;
 function category(){
  const favored=api.getInterest?.()?.kind;
  const possible=KINDS.filter(k=>!api.ownDone?.(k));
  if(!possible.length)return null;
  // Individual preferences dominate without preventing the child from
  // occasionally asking to try something genuinely different.
  const change=KINDS[(day()+1)%4];
  if(day()%3===0&&possible.includes(change))return change;
  if(favored&&possible.includes(favored))return favored;
  return possible[(day()+possible.length)%possible.length];
 }
 function spot(kind){
  const t=root.HearthPipHomeHelp?.TASKS?.[kind];
  if(!t)return null;
  const ideal={x:t.spot[0]+(t.spot[0]>620?-53:64),y:t.spot[1]+61};
  const found=api.nearestWalkable?.(ideal,'home');
  if(!found||!finite(found.x)||!finite(found.y)||dist(found,ideal)>85||
    api.isWalkable?.(found.x,found.y,'home')!==true)return null;
  return {x:found.x,y:found.y};
 }
 function near(){
  const c=api.getChildPosition?.(),p=api.getPlayer?.();
  return c&&p&&[c.x,c.y,p.x,p.y].every(finite)&&dist(c,p)<=135;
 }
 function canOffer(){
  return owned()&&scene()==='home'&&activeHours()&&!already()&&!pending&&
   !prompt&&!blocked()&&!api.isOwnRoutineBusy?.()&&!!category()&&!!spot(category());
 }
 function ready(){
  return canOffer()&&near();
 }
 function request(){
  if(!ready())return false;
  const kind=category(),t=STORIES[kind],mem=saved();
  prompt={day:day(),kind};
  const earned=api.getInterest?.()?.kind;
  const notice=mem.leadDays>=3?
   'Pip is a little more confident about making plans after the days you let them lead.':
   mem.learnDays>=3?
   'Pip remembers how patiently Poppy has taught them and feels ready to try again.':
   earned===kind?'Pip is excited because this has become one of their real favorite things.':
   'Pip is trying something new, in their own small way.';
  const family=api.getFamilyLine?.();
  api.showModal?.('little-sprouts','<section class="ls272-book pi292-book"><header class="ls272-cover"><small>🌱 PIP HAS AN IDEA · DAY '+day()+'</small><h2>'+t.icon+' '+esc(t.name)+'</h2><p>'+esc(t.intro)+'</p></header><p class="pi292-context">'+esc(notice)+(family?' '+esc(family):'')+'</p><div class="ls272-activity">'+
   '<button data-act="pi292-choose" data-id="0">🌼 Let Pip take the lead<small>'+esc(t.lead)+'</small></button>'+
   '<button data-act="pi292-choose" data-id="1">💛 Show Pip how<small>'+esc(t.learn)+'</small></button></div>'+
   '<p class="pi292-fine">The choice is remembered only after the actual timed household activity finishes with Pip nearby.</p>'+
   '<button class="ls272-secondary" data-act="pi292-decline">Maybe another time</button>'+
   '<button class="ls272-secondary" data-act="pi292-daybook">Open Pip’s Daybook</button></section>');
  return true;
 }
 function choose(choice){
  if(!prompt||![0,1].includes(choice)||prompt.day!==day()||
   scene()!=='home'||already()||blocked()||api.isOwnRoutineBusy?.()||
   api.ownDone?.(prompt.kind)||!spot(prompt.kind))return false;
  const previous=prompt;prompt=null;
  api.closeModal?.();
  if(api.queueOwnAction?.(previous.kind)!==true){
   api.notify?.('The household Daybook cannot fit this activity right now.');return false;
  }
  pending={day:day(),kind:previous.kind,choice};
  api.notify?.('🌱 Pip suggested '+STORIES[pending.kind].name.toLowerCase()+
   '! Finish Poppy’s real household routine at the furniture to share this moment.');
  return true;
 }
 function cancel(){
  if(!prompt)return false;
  prompt=null;api.closeModal?.();return true;
 }
 function schedule(base){
  if(!base||!pending||pending.day!==day()||scene()!=='home')return base;
  const at=spot(pending.kind);
  if(!at)return base;
  return {...base,scene:'home',x:at.x,y:at.y,moving:false,
   label:'Pip’s idea · '+STORIES[pending.kind].name,
   prop:pending.kind==='meal'?'napkin':pending.kind==='tidy'?'basket':pending.kind==='read'?'book':'crayon',
   icon:STORIES[pending.kind].icon};
 }
 function advance(){
  if(prompt&&(prompt.day!==day()||scene()!=='home'||!owned()))prompt=null;
  if(pending&&(pending.day!==day()||scene()!=='home'||!owned()))pending=null;
 }
 function completed(kind,once,actionDay){
  const p=pending;
  if(!p)return false;
  pending=null;
  if(!owned()||scene()!=='home'||p.day!==day()||p.day!==actionDay||p.kind!==kind||
    once!==true||already()||!api.ownDone?.(kind))return false;
  const at=spot(kind),c=api.getChildPosition?.(),adult=api.getPlayer?.();
  if(!at||!c||!adult||![c.x,c.y,adult.x,adult.y].every(finite)||
    dist(c,at)>100||dist(adult,c)>190){
   api.notify?.('Pip did not make it to the shared activity in time. No family choice was recorded.');
   return false;
  }
  const before=saved(),record={day:day(),kind,choice:p.choice},t=STORIES[kind];
  const data=child();data.childInitiatives=clean({
   records:[...before.records,record],
   leadDays:before.leadDays+(p.choice===0?1:0),
   learnDays:before.learnDays+(p.choice===1?1:0)
  },data.guardianDay);
  const need=p.choice===0?'confidence':t.skill;
  data.needs[need]=Math.min(100,Math.max(0,data.needs[need]||0)+4);
  api.save?.();api.updateUI?.();
  api.notify?.('🌼 Pip’s own real idea became a family memory. '+need+' +4.');
  return true;
 }
 function panel(){
  if(!owned())return '';
  const s=saved(),current=category(),text=s.records.some(r=>r.day===day())?
   '✓ Pip’s idea became a real memory today.':pending?
   'Pip is waiting to finish a genuine '+STORIES[pending.kind].name.toLowerCase()+' with Poppy.':
   current?STORIES[current].icon+' Pip might suggest '+STORIES[current].name.toLowerCase()+' today.':
   'Pip has no new household activity available today.';
  const old=s.records.slice(-3).reverse().map(r=>
   '<li>Day '+r.day+' · '+STORIES[r.kind].icon+' '+esc(STORIES[r.kind].name)+
   ' · '+(r.choice===0?'Pip led':'Poppy taught')+'</li>').join('');
  return '<section class="pi292-panel"><details><summary>🌱 Pip’s Own Little Ideas · '+
   (s.leadDays+s.learnDays)+' real shared days</summary><div class="pi292-body"><p>'+
   esc(text)+'</p><p>Pip develops initiative from the actual things you have done together. Visit Pip in person during the afternoon. Even if you choose to help, nothing is earned until Poppy finishes the real household action beside Pip.</p>'+
   '<div class="pi292-progress"><span>🌼 Pip leads · '+s.leadDays+'</span><span>💛 Learning together · '+s.learnDays+'</span></div>'+
   (ready()?'<button data-act="pi292-ask">Hear Pip’s idea</button>':'')+
   '<ul class="pi292-records">'+(old||'<li>No completed child-led activities yet.</li>')+'</ul></div></details></section>';
 }
 function drawHint(g,pos,tick=0){
  if(!g||!pos||!owned()||scene()!=='home'||!activeHours()||
   pending||prompt||already()||blocked()||api.isOwnRoutineBusy?.()||!category())return false;
  // Draw a tiny original hand/paper thought over Pip ONLY while a real
  // potential in-world suggestion exists. No work is auto-completed.
  const x=Math.round(pos.x+29),y=Math.round(pos.y-114+Math.sin(tick*1.7)*2);
  g.save();g.fillStyle='#6f665e';g.fillRect(x-1,y-2,22,20);
  g.fillStyle='#fff0d6';g.fillRect(x+1,y,18,16);
  g.fillStyle=STORIES[category()].prop;g.fillRect(x+5,y+4,9,6);
  g.fillStyle='#fff8ea';g.fillRect(x+14,y+11,3,3);
  g.restore();return true;
 }
 function drawDuringHold(g,pos,tick=0){
  if(!g||!pos||!pending||scene()!=='home'||!api.getHold?.()||
    api.getHold().kind!==pending.kind||!spot(pending.kind)||
    dist(pos,spot(pending.kind))>120)return false;
  const x=Math.round(pos.x+18),y=Math.round(pos.y-58+Math.sin(tick*5)*2);
  g.save();
  g.fillStyle='#e9c29b';g.fillRect(x-6,y+10,11,7);
  g.fillStyle=STORIES[pending.kind].prop;g.fillRect(x,y-9,21,21);
  g.fillStyle='#f8ead0';g.fillRect(x+3,y-6,15,14);
  g.fillStyle=pending.choice===0?'#b5c78e':'#c5a5bd';
  g.fillRect(x+7,y-2,7,7);g.restore();return true;
 }
 function handle(action,id){
  if(action==='pi292-ask')return request();
  if(action==='pi292-choose')return choose(Number(id));
  if(action==='pi292-decline')return cancel();
  if(action==='pi292-daybook'){prompt=null;return api.openBook?.()}
  return false;
 }
 return {clean,schedule,request,ready,canOffer,choose,cancel,completed,advance,panel,
  drawHint,drawDuringHold,handle,category,spot,saved,
  get pending(){return pending},get prompt(){return prompt}};
}
root.HearthPipInitiatives={setup,clean,STORIES,KINDS};
})(window);
