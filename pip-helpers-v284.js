/* Hearth & Harbor v2.8.4 — Pip's Neighborhood Helpers.
 * A small, physically played community craft with EACH of Maplewood's
 * six real adults. No click-to-claim projects, invented kinship, or income.
 * Day-scoped session: genuine adult + Pip + Poppy, an opening decision,
 * TWO walked-and-tapped world objects, and a final personal decision.
 */
(function(root){'use strict';
const PROJECTS={
 mabel:{icon:'🌸',name:'Petal Welcome Flags',need:'curiosity',colors:['#c17b97','#f6d7a1'],
  intro:'Mabel wants a little flower flag to welcome pollinators. What should Pip plan?',
  first:['A painted petal pattern','A gentle garden message'],
  tasks:['Gather the fallen petals','Tie the little garden flag'],
  final:'Where should the finished flag point visitors?',
  last:['Toward the butterflies','Toward the new seedlings'],
  closing:['Pip leaves a welcoming sign for tiny garden visitors.','Pip remembers how to give new things room to grow.']},
 rosie:{icon:'🍓',name:'A Neighborly Market Basket',need:'confidence',colors:['#bb6f77','#efd08a'],
  intro:'Rosie is preparing a shared market basket. How can Pip help?',
  first:['Sort by cheerful colors','Make a card for a neighbor'],
  tasks:['Choose a real market basket','Add a welcome ribbon'],
  final:'What should the card say?',
  last:['You belong here','Thank you for helping'],
  closing:['Pip helps make Maplewood feel like a place for everyone.','Rosie thanks Pip for noticing the people behind the market.']},
 oliver:{icon:'🥐',name:'The Little Recipe Exchange',need:'confidence',colors:['#c58b63','#fae4af'],
  intro:'Oliver is sharing a hand-drawn recipe idea. What belongs on Pip’s page?',
  first:['A tiny star bun','A cozy orchard tart'],
  tasks:['Pick up a recipe card','Attach the bakery twine'],
  final:'Who should read the recipe first?',
  last:['A curious new baker','The neighbors at supper'],
  closing:['Pip shares a small beginning with the next storyteller in the kitchen.','Oliver reminds Pip that the best recipes bring people together.']},
 jun:{icon:'📚',name:'The Village Story Pennant',need:'curiosity',colors:['#9883b8','#d2bcdd'],
  intro:'Jun is making a pennant for the outdoor story corner. What story fits?',
  first:['A little river journey','A welcoming woodland tale'],
  tasks:['Gather a story page','Hang the little pennant'],
  final:'How should the story be shared?',
  last:['Leave room for the next chapter','Read it aloud together'],
  closing:['Pip gives the next neighbor room to add a chapter.','Jun listens while Pip finds the courage to share their own voice.']},
 bea:{icon:'🎨',name:'The Kindness Color Swatches',need:'joy',colors:['#d99a6c','#f8d28a'],
  intro:'Bea is painting small color swatches for the community. Which feeling should Pip paint?',
  first:['The warmth of a sunrise','A calm patch of blue sky'],
  tasks:['Find the paint swatch board','Press the colorful print'],
  final:'What should be written beside the colors?',
  last:['Everyone brings a color','Small kindness grows'],
  closing:['Bea and Pip celebrate the many different people in Maplewood.','Pip wants the next painting to make someone smile.']},
 finn:{icon:'🐟',name:'A Gentle Pond Notice',need:'curiosity',colors:['#568f95','#a6d0bd'],
  intro:'Finn is preparing a little pond-care notice. What matters most?',
  first:['Quietly watching wildlife','Keeping a clean path'],
  tasks:['Find the nature field note','Set the little pond marker'],
  final:'What should a visitor remember?',
  last:['Let the wildlife rest','Leave the shore as you found it'],
  closing:['Pip learns to watch without disturbing pond creatures.','Finn and Pip make a promise to care for the shared shoreline.']}
};
const IDS=Object.keys(PROJECTS),obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999,finite=Number.isFinite;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw){
 const seen=new Set(),rows=[];
 if(Array.isArray(raw))for(const r of raw.slice(-160)){
  if(!obj(r)||!IDS.includes(r.id)||!dayOK(r.day)||![0,1].includes(r.plan)||
    ![0,1].includes(r.finish)||seen.has(r.day))continue;
  seen.add(r.day);rows.push({day:r.day,id:r.id,plan:r.plan,finish:r.finish});
 }
 rows.sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
 // First genuine craft with each adult is kept under the 42-page cap,
 // so the three-person ribbon never disappears in a long-running save.
 const first=new Map();
 for(const r of rows)if(!first.has(r.id))first.set(r.id,r);
 const anchorDays=new Set([...first.values()].map(r=>r.day));
 return [...first.values(),...rows.filter(r=>!anchorDays.has(r.day)).slice(-(42-first.size))]
  .sort((a,b)=>a.day-b.day);
}
function makeStops(adult,isWalkable,nearest){
 if(!adult||!finite(adult.x)||!finite(adult.y))return [];
 const offsets=[[-72,46],[63,52]],out=[];
 for(const [dx,dy] of offsets){
  const desired={x:adult.x+dx,y:adult.y+dy};
  const near=isWalkable?.(desired.x,desired.y,'town')===true?desired:nearest?.(desired,'town');
  if(!near||!finite(near.x)||!finite(near.y)||isWalkable?.(near.x,near.y,'town')!==true||
    dist(near,desired)>80||dist(near,adult)>160||out.some(p=>dist(p,near)<55))return [];
  out.push({x:Math.round(near.x),y:Math.round(near.y)});
 }
 return out;
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild();
 const day=()=>dayOK(state().day)?state().day:1;
 const records=()=>Array.isArray(child().helperProjects)?child().helperProjects:[];
 const guardian=()=>child().guardian==='player'&&dayOK(child().guardianDay)&&child().guardianDay<=day();
 const grown=()=>root.HearthPipGrowth.lifeStage(child(),day())>=1;
 const actual=id=>(api.getAdults?.()||[]).find(a=>a.id===id&&finite(a.x)&&finite(a.y))||null;
 const player=()=>api.getPlayer?.(),pip=()=>api.childPosition?.();
 const nearAdult=id=>{
  const a=actual(id),p=player(),c=pip();
  return !!a&&!!p&&!!c&&finite(p.x)&&finite(p.y)&&finite(c.x)&&finite(c.y)&&
   dist(a,p)<=180&&dist(a,c)<=180&&dist(p,c)<=185;
 };
 const seenToday=()=>records().some(r=>r.day===day());
 let session=null;
 const hasRibbon=()=>new Set(records().filter(r=>r.day<=day()).map(r=>r.id)).size>=3;
 const eligible=id=>!!PROJECTS[id]&&guardian()&&grown()&&api.getScene?.()==='town'&&
  (child().mentor?.counts?.[id]||0)>=1&&nearAdult(id)&&!seenToday()&&!session&&!api.otherAdventure?.();
 function valid(){
  if(!session)return false;
  const a=actual(session.id);
  if(!guardian()||!grown()||api.getScene?.()!=='town'||session.day!==day()||
    !a||dist(a,session.origin)>165||!nearAdult(session.id)||seenToday()||api.otherAdventure?.()){
   session=null;return false;
  }
  return true;
 }
 function panel(){
  const count=new Set(records().filter(r=>r.day<=day()).map(r=>r.id)).size;
  const rows=IDS.map(id=>{
   const a=PROJECTS[id],known=(child().mentor?.counts?.[id]||0)>=1;
   return '<div class="ph284-person"><span>'+a.icon+'</span><div><strong>'+esc(a.name)+'</strong><small>'+
    (known?'A friend Pip has genuinely met':'Meet this adult with Pip first')+
    (records().some(r=>r.id===id&&r.day<=day())?' · remembered':'')+'</small></div>'+
    (eligible(id)?'<button data-act="ph284-start" data-id="'+id+'">Help</button>':'')+'</div>';
  }).join('');
  return '<section class="ph284-panel"><details '+(session?'open':'')+'><summary>🧵 Neighborhood Helpers · '+count+'/6 neighbors '+(hasRibbon()?'· Ribbon earned':'')+'</summary>'+
   '<div class="ph284-content"><p>After meeting a villager, visit them again with Poppy and Pip in the actual town. Choose a project, walk to TWO glowing craft pieces and tap each, then decide what the kindness means. Only finished work becomes a memory.</p>'+
   '<div class="ph284-list">'+rows+'</div>'+
   (session?'<p class="ph284-active">Active: '+esc(PROJECTS[session.id].name)+' · '+(session.phase==='plan'?'Choose an idea':session.phase==='work'?'Find real craft piece '+(session.step+1)+' of 2':'Make the last choice')+'</p><button data-act="ph284-cancel">Leave this project unfinished</button>':'')+
   '<p class="ph284-note">'+(hasRibbon()?'Pip now wears a little handmade community ribbon after helping three different real neighbors.':'Help three different adults across genuine days to earn Pip’s original community ribbon.')+' No money or instant progress.</p></div></details></section>';
 }
 function opening(){
  if(!valid()||session.phase!=='plan')return false;
  const d=PROJECTS[session.id];
  api.showModal?.('little-sprouts','<section class="ls272-book ph284-modal"><header class="ls272-cover"><small>'+d.icon+' MAPLEWOOD · A REAL COMMUNITY PROJECT</small><h2>'+esc(d.name)+'</h2><p>'+esc(d.intro)+'</p></header><div class="ls272-activity">'+d.first.map((a,i)=>'<button data-act="ph284-plan" data-id="'+i+'">'+esc(a)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="ph284-cancel">Maybe another day</button></section>');
  return true;
 }
 function start(id){
  if(!eligible(id))return false;
  const a=actual(id),spots=makeStops(a,api.isWalkable,api.nearestWalkable);
  if(spots.length!==2){api.notify?.('There is no clear place to craft beside this neighbor right now.');return false}
  session={day:day(),id,origin:{x:a.x,y:a.y},phase:'plan',step:0,spots,plan:null};
  api.closeTalk?.();return opening();
 }
 function plan(choice){
  if(!valid()||session.phase!=='plan'||![0,1].includes(choice))return false;
  session.plan=choice;session.phase='work';
  api.closeModal?.();api.notify?.('🧵 '+PROJECTS[session.id].tasks[0]+'. Walk to the first glowing craft object and tap it.');
  return true;
 }
 function hit(x,y){
  if(!valid()||session.phase!=='work'||!finite(x)||!finite(y))return null;
  const p=session.spots[session.step];
  return dist({x,y:y+17},p)<=39?{x:p.x,y:p.y,step:session.step}:null;
 }
 function arrive(step){
  if(!valid()||session.phase!=='work'||step!==session.step)return false;
  const p=session.spots[step],who=player(),c=pip();
  if(!who||!c||dist(p,who)>48)return false;
  if(dist(p,c)>115){
   api.notify?.('🌼 Pip is still catching up. Stay beside this craft marker and tap it again when Pip arrives.');
   return false;
  }
  session.step++;
  if(session.step<2){api.notify?.('🌷 '+PROJECTS[session.id].tasks[step]+' complete. Now find the second illustrated craft piece.');return true}
  session.phase='finish';
  return finale();
 }
 function finale(){
  if(!valid()||session.phase!=='finish'||session.step!==2)return false;
  const d=PROJECTS[session.id];
  api.showModal?.('little-sprouts','<section class="ls272-book ph284-modal"><header class="ls272-cover"><small>🧵 BOTH REAL CRAFT PIECES COMPLETED</small><h2>'+esc(d.name)+'</h2><p>'+esc(d.final)+'</p></header><div class="ls272-activity">'+d.last.map((a,i)=>'<button data-act="ph284-finish" data-id="'+i+'">'+esc(a)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="ph284-cancel">Leave without a memory</button></section>');
  return true;
 }
 function finish(choice){
  if(!valid()||session.phase!=='finish'||session.step!==2||![0,1].includes(choice))return false;
  const done={day:session.day,id:session.id,plan:session.plan,finish:choice},d=PROJECTS[done.id];
  session=null;if(seenToday())return false;
  const c=child();c.helperProjects=clean([...records(),done]);
  c.needs[d.need]=Math.min(100,Math.max(0,c.needs[d.need]||0)+6);
  c.needs.joy=Math.min(100,Math.max(0,c.needs.joy||0)+1);
  api.bondAdult?.(done.id,2);
  api.save?.();api.updateUI?.();
  api.onProjectCompleted?.(done);
  api.notify?.('🌼 A real kindness project with '+(api.name?.(done.id)||done.id)+' is remembered. '+d.need+' +6.');
  api.showModal?.('little-sprouts','<section class="ls272-book ph284-modal"><div class="ls272-cover"><small>✦ A SHARED VILLAGE MEMORY</small><h2>'+d.icon+' '+esc(d.name)+'</h2><p>'+esc(d.closing[choice])+'</p></div><p>Day '+done.day+' · Poppy, Pip and '+esc(api.name?.(done.id)||done.id)+' finished a real world project. '+(hasRibbon()?'Pip’s handmade community ribbon is now visible in the village!':'Help more neighbors to earn a handmade ribbon.')+'</p><button data-act="ph284-book">Return to Pip’s Daybook</button></section>');
  return true;
 }
 function cancel(){if(!session)return false;session=null;api.notify?.('The community craft was left unfinished. Nothing was earned.');return api.openBook?.()}
 function handle(action,id){
  if(action==='ph284-start')return start(id);
  if(action==='ph284-plan')return plan(Number(id));
  if(action==='ph284-finish')return finish(Number(id));
  if(action==='ph284-cancel')return cancel();
  if(action==='ph284-book')return api.openBook?.();
  return false;
 }
 function draw(g,tick=0){
  if(!valid()||session.phase!=='work'||!g)return false;
  const def=PROJECTS[session.id];
  for(let i=0;i<2;i++){
   const p=session.spots[i],x=Math.round(p.x),y=Math.round(p.y-20),active=i===session.step,done=i<session.step;
   const bob=active?Math.round(Math.sin(tick*3.2)*3):0;
   g.save();g.globalAlpha=active?1:done?.55:.38;
   g.fillStyle='#3b5c5144';g.fillRect(x-22,y+20,44,7);
   g.fillStyle='#695d5d';g.fillRect(x-17,y+3+bob,34,19);
   g.fillStyle=def.colors[i];g.fillRect(x-14,y+5+bob,28,14);
   g.fillStyle='#ffefc7';g.fillRect(x-8,y+8+bob,16,7);
   g.fillStyle=def.colors[1-i];g.fillRect(x-2,y+7+bob,4,11);
   if(active){g.fillStyle='#fff6bf';g.fillRect(x-4,y-14+bob,8,8);g.fillRect(x-1,y-23+bob,3,8)}
   g.restore();
  }
  return true;
 }
 function drawRibbon(g,p,tick=0){
  if(!hasRibbon()||!p||!g)return false;
  const x=Math.round(p.x+41),y=Math.round(p.y-105+Math.sin(tick*2)*1.5);
  g.save();
  g.fillStyle='#7b536d';g.fillRect(x-8,y-2,17,20);
  g.fillStyle='#efc98d';g.fillRect(x-6,y,13,11);
  g.fillStyle='#fff3d3';g.fillRect(x-2,y+2,5,5);
  g.fillStyle='#d88d9e';g.fillRect(x-4,y+11,4,9);g.fillRect(x+2,y+11,4,9);
  g.restore();return true;
 }
 return {clean,makeStops,eligible,panel,start,opening,plan,hit,arrive,finale,finish,cancel,handle,draw,drawRibbon,
  hasRibbon,get session(){return session},get records(){return records()}};
}
root.HearthPipHelpers={setup,clean,makeStops,PROJECTS,IDS};
})(window);
