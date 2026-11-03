/* Hearth & Harbor v2.8.0 — Pip's Growing Seasons.
 * Two OPTIONAL, earned childhood developmental milestones that change the
 * actual 2.5D child sprite, world appearance and childhood home routines.
 * This is NOT biological aging, an unearned year, school, or adult status.
 * All evidence comes from genuinely completed existing play.
 */
(function(root){'use strict';
const STAGES=[
 {name:'Child',title:'A Little Sprout',icon:'🌱',scale:.76,color:'#b9cfa7'},
 {name:'Growing Child',title:'Finding My Own Feet',icon:'🌼',scale:.84,color:'#e6b6a1'},
 {name:'Independent Child',title:'Ready for Bigger Adventures',icon:'⭐',scale:.92,color:'#b6a1c6'}
];
const CHAPTERS=[
 {name:'Finding My Own Feet',icon:'🌼',description:'Pip grows more capable through shared care, learning and the people of Maplewood.',
  goals:[
   {key:'practice',min:4,label:'Four genuine childhood learning sessions'},
   {key:'kinds',min:2,label:'Learn through at least two kinds of activity'},
   {key:'home',min:2,label:'Help Poppy on two different days'},
   {key:'neighbors',min:2,label:'Share two real neighbor-visit days'},
   {key:'evenings',min:1,label:'Complete one cozy bedtime memory'}
  ]},
 {name:'Ready for Bigger Adventures',icon:'⭐',description:'A more independent chapter earned through deeper interests and many genuine relationships.',
  goals:[
   {key:'practice',min:12,label:'Twelve real learning sessions'},
   {key:'kindsAdvanced',min:3,label:'Practice all three activities at least twice'},
   {key:'home',min:4,label:'Help with four different days of household life'},
   {key:'neighborKinds',min:2,label:'Get to know two different actual villagers'},
   {key:'evenings',min:3,label:'Complete three bedtime rituals'},
   {key:'projects',min:3,label:'Join three real independent projects'},
   {key:'finishedDreams',min:1,label:'Earn both chapters of a chosen childhood dream'}
  ]}
];
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const capped=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
const uniqueDays=(arr,predicate,day)=>new Set((Array.isArray(arr)?arr:[]).filter(x=>obj(x)&&dayOK(x.day)&&x.day<=day&&predicate(x)).map(x=>x.day)).size;
function clean(raw){
 const r=obj(raw)?raw:{},first=dayOK(r.firstDay)?r.firstDay:0,
  second=dayOK(r.secondDay)&&r.secondDay>=first?r.secondDay:0;
 const requested=Number.isInteger(r.stage)?r.stage:0;
 const stage=requested>=2&&first&&second?2:requested>=1&&first?1:0;
 return {stage,firstDay:stage>=1?first:0,secondDay:stage>=2?second:0};
}
function evidence(child,day){
 const c=obj(child)?child:{},skills=obj(c.skills)?c.skills:{};
 const measured={};
 for(const kind of ['story','garden','art']){
  const persisted=Number.isInteger(skills[kind])&&skills[kind]>=0&&skills[kind]<=999?skills[kind]:0;
  const validMemories=uniqueDays(c.memories,x=>x.kind===kind&&Number.isInteger(x.choiceMask)&&x.choiceMask>=0&&x.choiceMask<=7,day);
  measured[kind]=Math.max(persisted,validMemories);
 }
 const aids=Array.isArray(c.homeHelps)?c.homeHelps:[],home=uniqueDays(aids,x=>['read','tidy','meal','hobby'].includes(x.kind),day);
 const evenings=uniqueDays(c.evenings,x=>Number.isInteger(x.mask)&&x.mask>=0&&x.mask<=3,day);
 const projects=uniqueDays(c.projects,x=>['stories','kindness','discover'].includes(x.dream)&&[1,2].includes(x.slot)&&Number.isInteger(x.mask)&&x.mask>=0&&x.mask<=3,day);
 const scores=obj(c.mentor?.counts)?c.mentor.counts:{};let neighbors=0,neighborKinds=0;
 for(const id of ['mabel','rosie','oliver','jun','bea','finn']){
  const count=Number.isInteger(scores[id])&&scores[id]>=0&&scores[id]<=999?scores[id]:0;
  const history=uniqueDays(c.meetings,x=>x.id===id&&Number.isInteger(x.mask)&&x.mask>=0&&x.mask<=3,day);
  const total=Math.max(count,history);
  if(total>0)neighborKinds++;
  neighbors+=total;
 }
 let finishedDreams=0;
 if(obj(c.dream?.achievements)){
  for(const key of ['stories','kindness','discover']){
   const list=c.dream.achievements[key];
   if(Array.isArray(list)&&[1,2].every(stage=>list.some(x=>obj(x)&&x.stage===stage&&dayOK(x.day)&&x.day<=day)))finishedDreams++;
  }
 }
 const practice=measured.story+measured.garden+measured.art;
 return {practice,kinds:Object.values(measured).filter(x=>x>0).length,
  kindsAdvanced:Object.values(measured).filter(x=>x>=2).length,
  home,neighbors,neighborKinds,evenings,projects,finishedDreams,skills:measured};
}
function lifeStage(child,now){
 const c=obj(child)?child:{},raw=clean(c.growth);
 if(c.guardian!=='player'||!dayOK(c.guardianDay)||c.guardianDay>now||raw.stage<1||raw.firstDay>now)return 0;
 return raw.stage>=2&&raw.secondDay<=now?2:1;
}
function progress(child,now){
 const c=obj(child)?child:{},raw=clean(c.growth);
 const guarded=c.guardian==='player'&&dayOK(c.guardianDay)&&c.guardianDay<=now;
 const stage=lifeStage(c,now);
 const counts=evidence(c,now);
 const chapters=CHAPTERS.map((cfg,i)=>{
  const level=i+1,claimed=stage>=level,prerequisite=i===0||stage>=i;
  const goals=cfg.goals.map(g=>({...g,current:Math.min(g.min,counts[g.key]),actual:counts[g.key],done:counts[g.key]>=g.min}));
  return {...cfg,level,claimed,ready:guarded&&!claimed&&prerequisite&&goals.every(g=>g.done),goals};
 });
 return {stage,label:STAGES[stage].name,scale:STAGES[stage].scale,title:STAGES[stage].title,
  firstDay:raw.firstDay,secondDay:raw.secondDay,chapters,counts,guarded};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild();
 const today=()=>dayOK(state().day)?state().day:1;
 const actual=()=>progress(child(),today());
 const phase=()=>lifeStage(child(),today());
 const isNear=()=>api.getScene?.()==='home'&&api.nearChild?.(130)===true;
 const canClaim=level=>[1,2].includes(level)&&isNear()&&actual().chapters[level-1]?.ready===true;
 function celebrate(level){
  if(!canClaim(level))return false;
  const c=child(),r=clean(c.growth),d=today(),next={...r};
  if(level===1){next.stage=1;next.firstDay=d}
  if(level===2&&r.stage===1){next.stage=2;next.secondDay=d}
  if(next.stage!==level)return false;
  c.growth=clean(next);
  c.needs.confidence=capped((Number.isFinite(c.needs.confidence)?c.needs.confidence:50)+8);
  c.needs.joy=capped((Number.isFinite(c.needs.joy)?c.needs.joy:60)+6);
  api.save?.();api.updateUI?.();
  api.notify?.('🌼 Pip reached a real new childhood milestone: '+STAGES[level].title+'! Confidence +8 · Joy +6.');
  api.openBook?.();
  return true;
 }
 function panel(){
  const p=actual(),near=isNear();
  const header='<div class="pg280-cover"><small>GENERATIONS · GROWING TOGETHER</small><h3>🌱 Pip’s Growing Seasons</h3><p>Childhood progresses through real shared life—not an automatic timer. Pip changes visibly only when you choose to celebrate a genuinely earned milestone.</p><strong>'+STAGES[p.stage].icon+' '+p.label+' · '+p.title+'</strong></div>';
  const content=CHAPTERS.map((ch,i)=>{
   const g=p.chapters[i],checks=g.goals.map(goal=>'<li class="'+(goal.done?'pg280-complete':'')+'"><span>'+(goal.done?'✓':'○')+'</span><div>'+goal.label+'<small>'+goal.current+' / '+goal.min+'</small></div></li>').join('');
   const button=g.claimed?'<small>✓ Earned on Day '+(i===0?p.firstDay:p.secondDay)+'</small>':
    g.ready?(near?'<button data-act="pg280-celebrate" data-id="'+g.level+'">🌟 Celebrate '+ch.name+'</button>':'<small>All goals earned! Stand beside Pip inside your cottage to celebrate.</small>'):
    '<small>'+(i&&p.stage<1?'First celebrate the earlier milestone.':'Complete the genuine life experiences above.')+'</small>';
   return '<article class="pg280-chapter"><header><span>'+ch.icon+'</span><div><strong>Chapter '+g.level+' · '+ch.name+'</strong><p>'+ch.description+'</p></div></header><ul>'+checks+'</ul>'+button+'</article>';
  }).join('');
  return '<section class="pg280-book">'+header+(p.guarded?content:'<p>Choose guardianship through real shared care before beginning these optional family milestones.</p>')+
   '<p class="pg280-fine">Milestones change Pip’s actual sprite size, accessories, cottage growth chart and interests. Pip remains a child. They do not invent a birthday, biological parent, school or adult rights, and never generate passive coins.</p></section>';
 }
 function drawAccessory(g,x,y,tick=0){
  const stage=phase();if(stage<1||!g)return false;
  g.save();const sway=Math.round(Math.sin(tick*1.9)*1.5),xx=Math.round(x+19),yy=Math.round(y-39+sway);
  g.fillStyle='#654c56';g.fillRect(xx-1,yy-17,4,20);
  g.fillStyle=stage===1?'#d5a880':'#9fa7c8';g.fillRect(xx-5,yy-7,18,19);
  g.fillStyle='#f4dfb8';g.fillRect(xx-2,yy-3,12,8);
  g.fillStyle='#8b655c';g.fillRect(xx+2,yy,4,4);
  if(stage>=2){
   g.fillStyle='#e3bd8d';g.fillRect(xx-11,yy-27,24,6);
   g.fillStyle='#fff1d5';g.fillRect(xx-6,yy-24,12,3);
  }
  g.restore();return true;
 }
 function drawWall(g,tick=0){
  const stage=phase();if(stage<1||api.getScene?.()!=='home'||!g)return false;
  g.save();const x=278,y=270;
  g.fillStyle='#94735e';g.fillRect(x-36,y-37,73,90);
  g.fillStyle='#f5e5c8';g.fillRect(x-32,y-33,65,80);
  g.fillStyle='#c7a596';g.fillRect(x-26,y-23,53,5);
  g.fillStyle='#9db8aa';g.fillRect(x-21,y-8,6,54);
  g.fillStyle='#d4ab93';g.fillRect(x-5,y-16,6,62);
  if(stage>=2){g.fillStyle='#ab98c1';g.fillRect(x+11,y-23,7,69)}
  g.fillStyle='#e4b67b';g.fillRect(x-24,y+31,42,3);
  g.fillStyle='#735d60';g.font='bold 9px monospace';g.textAlign='center';g.fillText('PIP GROWS',x,y-42);
  if(stage>=2){g.fillStyle='#f2cb86';g.fillRect(x+19,y-30+Math.round(Math.sin(tick*2)*2),8,8)}
  g.restore();return true;
 }
 function handle(action,id){if(action==='pg280-celebrate')return celebrate(Number(id));if(action==='pg280-book')return api.openBook?.();return false}
 return {celebrate,canClaim,panel,drawAccessory,drawWall,progress:actual,handle,visual:()=>STAGES[phase()],get stage(){return phase()}};
}
root.HearthPipGrowth={setup,clean,evidence,progress,lifeStage,STAGES,CHAPTERS};
})(window);
