/* Hearth & Harbor v2.8.1 — Pip's Growing Adventures
 * First stage-specific, three-stop WORLD activities, not a menu minigame.
 * Each adventure takes place at an existing, physically present villager.
 * Poppy must escort/visit Pip, walk to and tap three distinct town objects,
 * then finish a final choice. Only genuine completion saves a memory.
 */
(function(root){'use strict';
const LOCATIONS={
 mabel:{stage:1,icon:'🌸',title:'The Pollinator Path',tag:'Petal Detective',need:'curiosity',color:'#e6adbd',outline:'#8c6279',
  tasks:['Find the little blossom','Notice a waiting pollinator','Leave a thoughtful garden sign'],
  question:'What was the kindest thing about looking at the flowers?',
  answers:[['Giving tiny visitors a safe place','Pip remembers that gardens are homes for little creatures.'],['Learning to see small details','Pip sketches the petal shapes they almost missed.']]},
 rosie:{stage:1,icon:'🍓',title:'The Friendly Market Trail',tag:'Little Shop Helper',need:'confidence',color:'#d59ca0',outline:'#855d66',
  tasks:['Find the first market basket','Sort a colorful sample','Prepare a welcome card'],
  question:'What makes Rosie’s market feel like a friendly place?',
  answers:[['An inviting space for everyone','Pip makes sure nobody feels left out.'],['A cheerful note for visitors','Pip leaves a small message full of kindness.']]},
 bea:{stage:1,icon:'🎨',title:'Three Colors of Maplewood',tag:'Village Color Scout',need:'joy',color:'#e1c08b',outline:'#94754b',
  tasks:['Notice the warm colors','Find a cool shade','Make a tiny swatch painting'],
  question:'How would Pip finish their first village painting?',
  answers:[['A golden morning sky','Bea loves the cozy glow of Pip’s drawing.'],['A bright garden of neighbors','Every color becomes a little welcome.']]},
 jun:{stage:2,icon:'📚',title:'The Little Story Trail',tag:'Independent Story Keeper',need:'curiosity',color:'#aea0bf',outline:'#705b80',
  tasks:['Discover a clue in a page','Arrange the story in order','Write an ending for someone else'],
  question:'What should Pip do with the finished story?',
  answers:[['Read it aloud to a friend','Jun listens while Pip finds their own voice.'],['Leave it in a friendly book nook','Someone new will have a story to discover.']]},
 oliver:{stage:2,icon:'🥐',title:'The Thoughtful Recipe Hunt',tag:'Recipe Inventor',need:'confidence',color:'#dfb083',outline:'#977057',
  tasks:['Find a flavor idea','Sketch the tiny recipe card','Prepare a sharing plan'],
  question:'How would Pip share their recipe idea with Maplewood?',
  answers:[['Ask everybody for a favorite flavor','Oliver loves that Pip wants to include everyone.'],['Save the first drawing for the family','Pip knows some memories taste like home.']]},
 finn:{stage:2,icon:'🐟',title:'Pondwatch Field Notes',tag:'Young Nature Steward',need:'curiosity',color:'#95c2b7',outline:'#587f83',
  tasks:['Spot a ripple without disturbing it','Record a plant near the path','Leave the pond just as you found it'],
  question:'What did Pip learn from watching the pond carefully?',
  answers:[['Quiet observation teaches us more','Finn smiles at Pip’s patient field notes.'],['Every creature needs a peaceful home','Pip draws a promise to look after the water.']]}
};
const IDS=Object.keys(LOCATIONS),obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999,finite=n=>Number.isFinite(n);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function clean(raw){
 const seen=new Set(),out=[];
 if(Array.isArray(raw))for(const r of raw.slice(-120)){
  if(!obj(r)||!dayOK(r.day)||!Object.hasOwn(LOCATIONS,r.id)||
   r.stage!==LOCATIONS[r.id].stage||![0,1].includes(r.choice)||seen.has(r.day))continue;
  seen.add(r.day);out.push({day:r.day,id:r.id,stage:r.stage,choice:r.choice});
 }
 return out.sort((a,b)=>a.day-b.day).slice(-42);
}
function makeSpots(adult,walkable,nearest){
 if(!adult||!finite(adult.x)||!finite(adult.y))return [];
 const offsets=[[-67,45],[16,92],[75,42]];
 const list=[];
 for(const [dx,dy] of offsets){
  const expected={x:adult.x+dx,y:adult.y+dy};
  let at=walkable?.(expected.x,expected.y,'town')?expected:nearest?.(expected,'town');
  if(!at||!finite(at.x)||!finite(at.y)||!walkable?.(at.x,at.y,'town')||distance(at,expected)>115||
     distance(at,adult)>162||list.some(p=>distance(p,at)<27))return [];
  list.push({x:Math.round(at.x),y:Math.round(at.y)});
 }
 return list;
}
function setup(api){
 const state=()=>api.getState(),c=()=>api.getChild(),day=()=>dayOK(state().day)?state().day:1;
 const growth=()=>root.HearthPipGrowth.lifeStage(c(),day());
 const records=()=>Array.isArray(c().adventures)?c().adventures:[];
 const already=()=>records().some(r=>r.day===day());
 const guarded=()=>c().guardian==='player'&&dayOK(c().guardianDay)&&c().guardianDay<=day();
 const adults=()=>api.getAdults?.()||[];
 const adult=id=>adults().find(n=>n.id===id&&finite(n.x)&&finite(n.y))||null;
 const present=id=>{
  const a=adult(id),p=api.childPosition?.(),player=api.getPlayer?.();
  return !!a&&!!p&&!!player&&finite(p.x)&&finite(p.y)&&finite(player.x)&&finite(player.y)&&
   distance(a,p)<=180&&distance(a,player)<=185&&distance(player,p)<=185;
 };
 const eligible=id=>!!LOCATIONS[id]&&guarded()&&growth()>=LOCATIONS[id].stage&&
  api.getScene?.()==='town'&&present(id)&&!already()&&!session;
 let session=null;
 function panel(){
  const stage=growth(),current=records().filter(r=>r.day<=day()),ongoing=!!status();
  const title='<div class="pa281-cover"><small>GENERATIONS · LITTLE ADVENTURES THAT MATTER</small><h3>🌼 Pip’s Growing Adventures</h3><p>As Pip grows, new challenges appear beside six real Maplewood neighbors. Walk with Pip and interact with three different objects in the actual town—then choose what to remember.</p><strong>'+(stage?'🌷 '+root.HearthPipGrowth.STAGES[stage].name:'🌱 A little sprout, not yet ready')+'</strong></div>';
  const rows=IDS.map(id=>{
   const a=LOCATIONS[id],unlocked=stage>=a.stage,near=eligible(id),n=adult(id);
   return '<div class="pa281-row"><span>'+a.icon+'</span><div><strong>'+esc(a.title)+'</strong><small>'+esc(n?.name||id)+' · '+(unlocked?near?'Pip and this neighbor are nearby':ongoing?'Finish the current adventure first':already()?'A shared adventure already happened today':'Walk with Pip to the villager in Maplewood':'Available after the '+(a.stage===1?'Growing Child':'Independent Child')+' milestone')+'</small></div>'+
    (near?'<button data-act="pa281-start" data-id="'+id+'">Explore</button>':'')+'</div>';
  }).join('');
  const memories=current.slice(-7).reverse().map(r=>'<li>Day '+r.day+' · '+LOCATIONS[r.id].icon+' '+esc(LOCATIONS[r.id].title)+'</li>').join('');
  const progress=session?'<div class="pa281-active"><strong>✨ Active: '+esc(LOCATIONS[session.id].title)+'</strong><p>Step '+(session.step+1)+' of 3 · '+esc(LOCATIONS[session.id].tasks[Math.min(session.step,2)])+'</p><p>Walk to and tap the <strong>glowing illustrated object</strong> in the actual town. Only the next stop counts.</p><button data-act="pa281-stop">Finish this adventure another time</button></div>':'';
  return '<section class="pa281-panel">'+title+progress+'<h3>Real places to discover</h3><div class="pa281-list">'+rows+'</div><h3>Adventures we truly finished</h3><ul class="pa281-history">'+(memories||'<li>No completed adventure memories yet.</li>')+'</ul><p>Never automatic, never a paid task, and never a new school or legal family relationship.</p></section>';
 }
 function start(id){
  if(!eligible(id))return false;
  const n=adult(id),spots=makeSpots(n,api.isWalkable,api.nearestWalkable);
  if(spots.length!==3){api.notify?.('There is not enough safe room near this neighbor today. Try a different spot or villager.');return false}
  session={id,stage:LOCATIONS[id].stage,day:day(),origin:{x:n.x,y:n.y},step:0,spots,readyChoice:false};
  api.closeTalk?.();api.closeModal?.();
  api.notify?.('🌷 '+LOCATIONS[id].title+': walk to and tap the first glowing town object! Three real stops, then a final choice.');
  return true;
 }
 function valid(){
  if(!session)return false;
  if(session.day!==day()||!guarded()||api.getScene?.()!=='town'||growth()<session.stage||already()){session=null;return false}
  const a=adult(session.id);
  if(!a||distance(a,session.origin)>180){session=null;return false}
  return true;
 }
 function status(){return valid()?{id:session.id,step:session.step,readyChoice:session.readyChoice,spots:session.spots.map(p=>({...p}))}:null}
 function hit(x,y){
  if(!valid()||session.readyChoice||!finite(x)||!finite(y))return null;
  const p=session.spots[session.step];
  return Math.hypot(x-p.x,y-(p.y-18))<=40?{x:p.x,y:p.y,step:session.step}:null;
 }
 function arrive(step){
  if(!valid()||session.readyChoice||session.step!==step)return false;
  const p=session.spots[step],player=api.getPlayer?.();
  if(!player||!finite(player.x)||!finite(player.y)||distance(player,p)>48)return false;
  const pip=api.childPosition?.();
  if(!pip||!finite(pip.x)||!finite(pip.y)||distance(pip,p)>115){
   api.notify?.('🌼 Pip is still coming along. Wait together at the glowing object and tap it again when Pip arrives.');
   return false;
  }
  if(!present(session.id))return false;
  session.step++;
  if(session.step<3){
   api.notify?.('🌼 '+LOCATIONS[session.id].tasks[step]+' · '+session.step+'/3. Find the next glowing object!');
   return true;
  }
  session.readyChoice=true;
  return finale();
 }
 function finale(){
  if(!valid()||!session.readyChoice||session.step!==3||!present(session.id))return false;
  const d=LOCATIONS[session.id];
  api.showModal?.('little-sprouts','<section class="ls272-book pa281-final"><div class="ls272-cover"><small>'+d.icon+' ALL THREE REAL STOPS FOUND</small><h2>'+esc(d.title)+'</h2><p>'+esc(d.question)+'</p></div><div class="ls272-activity">'+d.answers.map(([label],i)=>'<button data-act="pa281-choice" data-id="'+i+'">'+esc(label)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pa281-stop">Leave without a memory</button></section>');
  return true;
 }
 function choose(choice){
  if(![0,1].includes(choice)||!valid()||!session.readyChoice||session.step!==3||!present(session.id))return false;
  const r={day:session.day,id:session.id,stage:session.stage,choice},def=LOCATIONS[r.id],message=def.answers[choice][1];
  session=null;if(already())return false;
  const child=c();child.adventures=clean([...records(),r]);
  const need=def.need;child.needs[need]=Math.min(100,Math.max(0,child.needs[need]||0)+7);
  child.needs.joy=Math.min(100,Math.max(0,child.needs.joy||0)+2);
  api.save?.();api.updateUI?.();api.notify?.('🌷 Pip completed '+def.title+' in the real village! '+need+' +7 · Joy +2.');
  api.showModal?.('little-sprouts','<section class="ls272-book pa281-final"><div class="ls272-cover"><small>A REAL THREE-STOP ADVENTURE</small><h2>'+def.icon+' '+esc(def.title)+'</h2><p>'+esc(message)+'</p></div><p>All three world objects were visited before this small memory was earned.</p><button data-act="pa281-book">Pip’s Daybook</button></section>');
  return true;
 }
 function stop(){if(!session)return false;session=null;api.notify?.('Your adventure is paused. No memory was earned.');return true}
 function handle(action,id){
  if(action==='pa281-start')return start(id);
  if(action==='pa281-stop'){stop();return api.openBook?.()}
  if(action==='pa281-choice')return choose(Number(id));
  if(action==='pa281-book')return api.openBook?.();
  return false;
 }
 function draw(g,tick=0){
  if(!valid()||!g||!session||session.readyChoice)return false;
  const def=LOCATIONS[session.id];
  session.spots.forEach((p,i)=>{
   const x=Math.round(p.x),y=Math.round(p.y-16),active=i===session.step,done=i<session.step;
   g.save();g.globalAlpha=active?1:done?.53:.38;
   const bob=active?Math.round(Math.sin(tick*3)*2):0;
   g.fillStyle='#36574944';g.fillRect(x-23,y+16,47,6);
   g.fillStyle=def.outline;g.fillRect(x-18,y-2+bob,35,22);
   g.fillStyle=def.color;g.fillRect(x-15,y+1+bob,29,16);
   if(session.stage===1){
    g.fillStyle='#fff1ca';g.fillRect(x-6,y+5+bob,12,7);
    g.fillStyle=def.outline;g.fillRect(x-1,y+1+bob,3,15);
   }else{
    g.fillStyle='#fff1d7';g.fillRect(x-10,y+3+bob,19,12);
    g.fillStyle=def.outline;g.fillRect(x-2,y+3+bob,3,12);
    g.fillRect(x-7,y+7+bob,3,2);g.fillRect(x+4,y+8+bob,3,2);
   }
   if(active){
    g.fillStyle='#fff4ca';g.fillRect(x-3,y-16+bob,7,7);
    g.fillStyle=def.outline;g.fillRect(x-1,y-24+bob,3,8);
   }
   g.restore();
  });
  return true;
 }
 return {clean,makeSpots,eligible,panel,start,hit,arrive,finale,choose,stop,handle,draw,status,get session(){return session}};
}
root.HearthPipAdventures={setup,clean,makeSpots,LOCATIONS};
})(window);
