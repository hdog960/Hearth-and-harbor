/* Hearth & Harbor v2.7.7 — Pip's Little Dreams.
 * An optional child aspiration with actual completed-play prerequisites.
 * Never creates family links, aging, passive money, remote child activities,
 * or shortcuts around the real Pip minigames / home routines / village visits.
 */
(function(root){'use strict';
const DREAMS={
 stories:{name:'Keeper of Stories',icon:'📖',hue:'#bd85a4',caption:'Pip dreams of telling stories that make people smile.',chapters:[
  {name:'A Little Tale to Tell',goals:[{source:'story',count:2,label:'Share stories on 2 different days'}]},
  {name:'The Storyteller’s Star',goals:[{source:'story',count:3,label:'Share stories on 3 different days'},{source:'evening',count:1,label:'Complete a real bedtime ritual'},{source:'jun',count:1,label:'Meet Jun in Maplewood'}]}
 ]},
 kindness:{name:'A Heart for Home',icon:'💗',hue:'#d49e78',caption:'Pip wants to make everyday life warmer for everyone.',chapters:[
  {name:'A Helping Hand',goals:[{source:'help',count:2,label:'Help Poppy on 2 different days'}]},
  {name:'Home’s Little Hero',goals:[{source:'help',count:3,label:'Help Poppy on 3 different days'},{source:'helpKinds',count:3,label:'Help with 3 different cottage activities'},{source:'evening',count:1,label:'Complete a cozy bedtime ritual'}]}
 ]},
 discover:{name:'The Wonder Collector',icon:'🍀',hue:'#87b79b',caption:'Pip wants to learn from every little corner of Maplewood.',chapters:[
  {name:'First Clover Trail',goals:[{source:'garden',count:2,label:'Explore nature on 2 different days'}]},
  {name:'A World of Wonders',goals:[{source:'garden',count:3,label:'Explore nature on 3 different days'},{source:'neighborKinds',count:2,label:'Meet 2 different villagers'},{source:'art',count:1,label:'Create a real drawing together'}]}
 ]}
};
const IDS=Object.keys(DREAMS),obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999,esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uniqueDays=(arr,fn,day)=>new Set((Array.isArray(arr)?arr:[]).filter(x=>obj(x)&&dayOK(x.day)&&x.day<=day&&fn(x)).map(x=>x.day)).size;
function clean(raw){
 const x=obj(raw)?raw:{},focus=IDS.includes(x.focus)?x.focus:null;
 const chosenDay=focus&&dayOK(x.chosenDay)?x.chosenDay:0;
 const source=obj(x.achievements)?x.achievements:{},achievements={};
 for(const key of IDS){
  const seen=new Set(),list=[];
  if(Array.isArray(source[key]))for(const item of source[key]){
   if(!obj(item)||![1,2].includes(item.stage)||!dayOK(item.day)||seen.has(item.stage))continue;
   seen.add(item.stage);list.push({stage:item.stage,day:item.day});
  }
  achievements[key]=list.sort((a,b)=>a.stage-b.stage);
 }
 return {focus:chosenDay?focus:null,chosenDay,achievements};
}
function tally(child,now){
 const memories=Array.isArray(child.memories)?child.memories:[],helps=Array.isArray(child.homeHelps)?child.homeHelps:[],evenings=Array.isArray(child.evenings)?child.evenings:[],meetings=Array.isArray(child.meetings)?child.meetings:[];
 const validMemory=x=>Number.isInteger(x.choiceMask)&&x.choiceMask>=0&&x.choiceMask<=7;
 const counters={};
 for(const kind of ['story','garden','art']){
  const m=uniqueDays(memories,x=>x.kind===kind&&validMemory(x),now);
  const prior=obj(child.skills)&&Number.isInteger(child.skills[kind])&&child.skills[kind]>=0&&child.skills[kind]<=999?child.skills[kind]:0;
  counters[kind]=Math.max(m,prior);
 }
 const safeHelp=helps.filter(x=>obj(x)&&dayOK(x.day)&&x.day<=now&&['read','tidy','meal','hobby'].includes(x.kind));
 const helpPerDay=new Map();for(const h of safeHelp)if(!helpPerDay.has(h.day))helpPerDay.set(h.day,h.kind);
 counters.help=helpPerDay.size;
 counters.helpKinds=new Set(helpPerDay.values()).size;
 counters.evening=uniqueDays(evenings,x=>Number.isInteger(x.mask)&&x.mask>=0&&x.mask<=3,now);
 const validMeet=meetings.filter(x=>obj(x)&&dayOK(x.day)&&x.day<=now&&['mabel','rosie','oliver','jun','bea','finn'].includes(x.id)&&Number.isInteger(x.mask)&&x.mask>=0&&x.mask<=3);
 counters.jun=uniqueDays(validMeet,x=>x.id==='jun',now);
 counters.neighborKinds=new Set(validMeet.map(x=>x.id)).size;
 return counters;
}
function progress(child,now){
 const d=clean(child?.dream),counters=tally(child||{},now),focus=d.focus;
 return {focus,chosenDay:d.chosenDay,achievements:d.achievements,counters,chapters:focus?DREAMS[focus].chapters.map((c,i)=>{
  const stage=i+1,claimed=d.achievements[focus].some(x=>x.stage===stage),previous=i===0||d.achievements[focus].some(x=>x.stage===i);
  const goals=c.goals.map(g=>({...g,current:Math.min(g.count,counters[g.source]||0),done:(counters[g.source]||0)>=g.count}));
  return {stage,name:c.name,claimed,ready:!claimed&&previous&&goals.every(g=>g.done),goals};
 }):[]};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>Number.isInteger(state().day)&&state().day>0&&state().day<=9999?state().day:1;
 const data=()=>{const c=child();if(!obj(c.dream))c.dream=clean(null);return c.dream};
 const guarded=()=>child().guardian==='player'&&dayOK(child().guardianDay)&&child().guardianDay<=day();
 const close=()=>api.getScene?.()===(guarded()?'home':'town')&&api.nearChild?.(125)===true;
 function choose(id){
  if(!IDS.includes(id)||!guarded()||!close())return false;
  const d=data();
  if(d.focus===id)return false;
  // Switching focus keeps already-earned chapters; never double pays a chapter.
  d.focus=id;d.chosenDay=day();
  api.save?.();api.updateUI?.();api.notify?.('🌟 Pip chose a new little dream: '+DREAMS[id].name);
  api.openBook?.();return true;
 }
 function claim(stage){
  const c=child(),now=day(),p=progress(c,now);
  if(!guarded()||!close()||![1,2].includes(stage)||!p.focus)return false;
  const chapter=p.chapters[stage-1];
  if(!chapter||!chapter.ready)return false;
  const d=data(),list=d.achievements[p.focus];
  if(list.some(x=>x.stage===stage))return false;
  list.push({stage,day:now});list.sort((a,b)=>a.stage-b.stage);
  // A small real one-time encouragement, not passive income/cash.
  c.needs.joy=Math.min(100,Math.max(0,c.needs.joy||0)+5);
  c.needs.confidence=Math.min(100,Math.max(0,c.needs.confidence||0)+3);
  api.save?.();api.updateUI?.();
  api.notify?.('⭐ Pip earned '+chapter.name+' by living these moments! Joy +5 · Confidence +3.');
  api.openBook?.();return true;
 }
 function panel(){
  const p=progress(child(),day()),supported=guarded();
  if(!supported)return '<section class="pd277-book"><div class="pd277-cover"><h3>🌟 Pip’s Little Dreams</h3><p>After you and Pip choose to become family, you can support their own childhood hopes. They are never decided automatically.</p></div></section>';
  const dreams=IDS.map(k=>{
   const d=DREAMS[k],claimed=p.achievements[k]?.length||0;
   return '<button data-act="pd277-choose" data-id="'+k+'" '+(!close()?'disabled':'')+' aria-pressed="'+(p.focus===k)+'"><strong>'+d.icon+' '+d.name+(p.focus===k?' · Selected':'')+'</strong><small>'+d.caption+(claimed?' · '+claimed+' earned chapters':'')+'</small></button>';
  }).join('');
  const chapters=p.chapters.map(c=>'<div class="pd277-chapter"><strong>✦ Chapter '+c.stage+' · '+esc(c.name)+'</strong><ul>'+
   c.goals.map(g=>'<li class="'+(g.done?'pd277-goal-done':'')+'">'+(g.done?'✓ ':'○ ')+esc(g.label)+' · '+g.current+'/'+g.count+'</li>').join('')+
   '</ul>'+(c.claimed?'<small>✓ Earned through real play</small>':c.ready?(close()?'<button data-act="pd277-claim" data-id="'+c.stage+'">🌟 Celebrate this earned chapter</button>':'<small>Visit Pip in person to celebrate this chapter.</small>'):'<small>Complete the real activities above to unlock this chapter.</small>')+'</div>').join('');
  return '<section class="pd277-book"><div class="pd277-cover"><small>GENERATIONS · A LIFE MADE OF MOMENTS</small><h3>🌟 Pip’s Little Dreams</h3><p>Help Pip pursue their own aspiration. Your actual story, nature, household, neighbor and evening activities create every bit of progress.</p></div>'+
   '<h3>Choose Pip’s current dream</h3><div class="pd277-dreams">'+dreams+'</div>'+
   (p.focus?'<h3>'+DREAMS[p.focus].icon+' '+esc(DREAMS[p.focus].name)+'</h3>'+chapters:'<p>Pick a dream together while standing beside Pip. Progress already earned in your existing adventures is respected.</p>')+
   '<p class="pd277-note">Two chapters per dream · Changing dreams never erases earned chapters. Completed chapters add a small encouragement and an original in-world star. No automatic money, aging or fake family ties.</p></section>';
 }
 function drawBadge(g,x,y,tick=0){
  const p=progress(child(),day()),key=p.focus;if(!key||!p.achievements[key]?.length||!g)return;
  const hue=DREAMS[key].hue,complete=p.achievements[key].some(c=>c.stage===2);
  g.save();const yy=Math.round(y-91+Math.sin(tick*2.2)*2);
  g.fillStyle='#fff2cd';g.fillRect(Math.round(x+33),yy,21,21);
  g.fillStyle=hue;g.fillRect(Math.round(x+35),yy+2,17,17);
  g.fillStyle='#fff8dc';g.fillRect(Math.round(x+41),yy+6,5,5);
  if(complete){g.fillRect(Math.round(x+37),yy+12,3,3);g.fillRect(Math.round(x+47),yy+12,3,3)}
  g.restore();
 }
 function drawKeepsake(g,tick=0){
  if(!g||api.getScene?.()!=='home')return;
  const p=progress(child(),day()),d=p.focus;if(!d||!p.achievements[d]?.some(c=>c.stage===2))return;
  const hue=DREAMS[d].hue,x=408,y=267;
  g.save();
  g.fillStyle='#8c6b57';g.fillRect(x-37,y+40,74,8);g.fillRect(x-31,y+46,7,12);g.fillRect(x+24,y+46,7,12);
  g.fillStyle='#f6dba4';g.fillRect(x-24,y-20,48,63);g.fillStyle='#fff3d6';g.fillRect(x-18,y-14,36,48);
  g.fillStyle=hue;g.fillRect(x-12,y-8,24,30);
  g.fillStyle='#fff4d2';g.fillRect(x-4,y+1,8,8);
  g.fillStyle=hue;g.fillRect(x-4,y-27+Math.sin(tick*1.7)*1,8,8);
  g.restore();
 }
 function handle(action,id){
  if(action==='pd277-choose')return choose(id);
  if(action==='pd277-claim')return claim(Number(id));
  return false;
 }
 return {choose,claim,panel,progress:()=>progress(child(),day()),drawBadge,drawKeepsake,handle,get data(){return data()}};
}
root.HearthPipDreams={setup,clean,progress,tally,DREAMS};
})(window);
