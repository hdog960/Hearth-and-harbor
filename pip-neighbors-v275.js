/* Hearth & Harbor v2.7.5 — Pip's Neighbor Walks
 * Escort Pip through the real playable world to meet ACTUAL nearby residents.
 * Never fabricates an adult encounter, child parentage, jobs or passive income.
 * Escort is session-only. Authentic completed 2-part meetings persist.
 */
(function(root){'use strict';
const ADULTS=['mabel','rosie','oliver','jun','bea','finn'];
const STORIES={
 mabel:{icon:'🌸',title:'Flower Friends',question:['Mabel finds a fallen petal. What can we learn?','How should we leave the flowerbed?'],options:[
  [['Notice its color','Pip notices all the different shades of pink.'],['Look at its shape','Pip sees the little patterns around each petal.']],
  [['Water the nearby flowers','Mabel smiles as you care for the flowers together.'],['Leave the growing buds alone','Pip learns to give delicate plants space to bloom.']]
 ]},
 rosie:{icon:'🍓',title:'Market Kindness',question:['Rosie is arranging a tiny fruit basket. Where should Pip begin?','How can we help the next visitor?'],options:[
  [['Sort the ripe berries','Pip sorts bright berries by their lovely colors.'],['Choose a little ribbon','Rosie shows Pip how to tie a bow on a basket.']],
  [['Make a welcoming sign','Pip draws a little hello for the stall.'],['Offer a cheerful greeting','The market feels brighter with a kind hello.']]
 ]},
 oliver:{icon:'🥐',title:'Baker’s Little Helper',question:['Oliver is thinking about a new bakery treat. What should Pip imagine?','What belongs in a caring bakery?'],options:[
  [['A star-shaped cookie','Pip sketches a tiny star for Oliver’s idea book.'],['A berry tart','Pip imagines a colorful fruit-topped treat.']],
  [['A place to share','Oliver loves the idea of a friendly little table.'],['A note to say thanks','Pip writes a little thank-you card for the baker.']]
 ]},
 jun:{icon:'📚',title:'Library Whisper',question:['Jun opens an illustrated book. Where do you look first?','How shall Pip care for the book?'],options:[
  [['The curious map','Jun helps Pip imagine the places on the map.'],['The tiny drawing','Pip finds a creature hiding in the illustration.']],
  [['Turn the pages gently','Jun shows Pip how to treat stories with care.'],['Return it to the right shelf','Pip helps keep the library welcoming for everybody.']]
 ]},
 bea:{icon:'🎨',title:'Colors Together',question:['Bea asks Pip to imagine a beautiful color. What comes to mind?','What is the kindest way to share your art?'],options:[
  [['A warm sunflower yellow','Bea shows Pip how a cheerful yellow brightens the page.'],['A cool ocean blue','Pip discovers how calm a beautiful blue can feel.']],
  [['Invite everyone to look','A small crowd admires the drawing together.'],['Give it to someone who needs cheering up','Bea loves how a drawing can be an act of kindness.']]
 ]},
 finn:{icon:'🐟',title:'Pond Discoveries',question:['Finn points toward the water. What should Pip notice?','How can we keep the pond a happy place?'],options:[
  [['Little rings in the water','Pip watches tiny ripples spread and disappear.'],['A dragonfly resting nearby','Finn explains why it is best to watch quietly.']],
  [['Pick up a stray leaf from the path','Pip helps keep the walking path tidy.'],['Give the fish room to swim','Finn is glad Pip knows how to care for wildlife.']]
 ]}
};
const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const dayOK=n=>Number.isInteger(n)&&n>0&&n<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dist=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));
const nameOK=id=>ADULTS.includes(id);
function clean(raw){
 const seen=new Set(),meetings=[];
 if(Array.isArray(raw))for(const e of raw.slice(-100)){
  if(!obj(e)||!nameOK(e.id)||!dayOK(e.day)||!Number.isInteger(e.mask)||e.mask<0||e.mask>3)continue;
  const key=e.day+'|'+e.id;if(seen.has(key))continue;
  seen.add(key);meetings.push({day:e.day,id:e.id,mask:e.mask});
 }
 return meetings.sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id)).slice(-36);
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>dayOK(state().day)?state().day:1;
 const meetings=()=>Array.isArray(child().meetings)?child().meetings:[];
 let walking=null,session=null;
 const isGuardian=()=>child().guardian==='player';
 const town=()=>api.getScene?.()==='town';
 const nearbyPip=()=>town()&&api.isPlayerNearChild?.(135)===true;
 const adults=()=>(api.getAdults?.()||[]).filter(a=>nameOK(a.id)&&Number.isFinite(a.x)&&Number.isFinite(a.y));
 const adultNear=(id=null)=>{
  if(!nearbyPip())return null;
  const p=api.childPosition?.();if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return null;
  return adults().filter(a=>dist(a,p)<=150&&(!id||a.id===id)).sort((a,b)=>dist(a,p)-dist(b,p))[0]||null;
 };
 const walkingNow=()=>!!walking&&walking.day===day()&&town()&&isGuardian();
 const escortPose=()=>walkingNow()?{x:walking.x,y:walking.y,moving:walking.moving,facing:walking.facing,stride:walking.stride}:null;
 const finite=Number.isFinite;
 const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 // Sample the entire traveled segment, not just its final coordinate, to
 // prevent cut-through on diagonal joins between the original grid nodes.
 function clearSegment(a,b){
  if(!a||!b||![a.x,a.y,b.x,b.y].every(finite))return false;
  if(typeof api.isWalkable!=='function')return true;
  const n=Math.max(1,Math.ceil(gap(a,b)/11));
  for(let i=1;i<=n;i++){
   const p={x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n};
   if(api.isWalkable(p.x,p.y,'town')!==true)return false;
  }
  return true;
 }
 function safeGoal(player){
  const desired={x:player.x-35,y:player.y+26};
  const target=api.nearestWalkable?.(desired,'town')||desired;
  if(![target.x,target.y].every(finite)||gap(target,desired)>115||
   api.isWalkable?.(target.x,target.y,'town')===false)return null;
  return target;
 }
 function routeTo(from,dest){
  const supplied=api.findPath?.({x:from.x,y:from.y},{x:dest.x,y:dest.y},'town');
  const raw=Array.isArray(supplied)?supplied:[dest];
  const points=[];
  for(const p of raw.slice(0,80)){
   if(!p||![p.x,p.y].every(finite)||api.isWalkable?.(p.x,p.y,'town')===false)return [];
   if(!points.length||gap(p,points[points.length-1])>2)points.push({x:p.x,y:p.y});
  }
  return points;
 }
 function startWalk(){
  if(walkingNow()||session||!isGuardian()||api.getScene?.()!=='home'||!api.isPlayerNearChild?.(130))return false;
  api.goTown?.();
  if(!town())return false;
  const p=api.getPlayer?.();if(!p)return false;
  const origin=api.nearestWalkable?.({x:p.x-38,y:p.y+27},'town')||{x:p.x-38,y:p.y+27};
  if(!origin||![origin.x,origin.y].every(finite)||api.isWalkable?.(origin.x,origin.y,'town')===false)return false;
  walking={x:origin.x,y:origin.y,moving:false,facing:'front',day:day(),
   stride:0,route:[],goal:null,repath:0,blocked:0};
  api.notify?.('🌼 Pip joins your village stroll! Walk near a real neighbor to share a little moment.');
  api.updateUI?.();api.openBook?.();return true;
 }
 function stopWalk(){
  if(!walking&&!session)return false;
  walking=null;session=null;
  api.notify?.('🌷 Your walk is over. Pip returns to the usual daily routine.');
  api.updateUI?.();api.openBook?.();return true;
 }
 function advance(dt){
  if(!walking)return;
  if(!town()||!isGuardian()||walking.day!==day()){walking=null;session=null;return}
  if(!finite(dt)||dt<=0)return;
  if(session||(api.isMovementBlocked?api.isMovementBlocked():api.isPaused?.())){
   walking.moving=false;return;
  }
  const player=api.getPlayer?.();
  if(!player||![player.x,player.y].every(finite)){walking.moving=false;return}
  const target=safeGoal(player);
  if(!target){walking.moving=false;walking.route=[];return}
  const here={x:walking.x,y:walking.y};
  if(gap(here,target)<9){walking.moving=false;walking.route=[];walking.goal=target;return}
  walking.repath-=Math.min(dt,.3);
  // Track the player's *live* position; plan over the original solid map
  // rather than walking directly across fences, houses and water.
  if(!walking.goal||gap(walking.goal,target)>65||walking.repath<=0){
   walking.route=routeTo(here,target);walking.goal={x:target.x,y:target.y};
   walking.repath=.45;
  }
  const path=walking.route;
  if(!path?.length){walking.moving=false;return}
  let budget=Math.min(dt,.18)*205,travelled=0;
  for(let count=0;count<4&&path.length&&budget>0;count++){
   const next=path[0],current={x:walking.x,y:walking.y},d=gap(current,next);
   if(d<3){path.shift();continue}
   const step=Math.min(budget,d),candidate={x:current.x+(next.x-current.x)*step/d,
    y:current.y+(next.y-current.y)*step/d};
   if(!clearSegment(current,candidate)){
    walking.route=[];walking.repath=0;break;
   }
   walking.x=candidate.x;walking.y=candidate.y;
   walking.facing=next.y-current.y< -12?'back':
    Math.abs(next.x-current.x)>=Math.abs(next.y-current.y)?'side':'front';
   walking.stride+=step/18;travelled+=step;budget-=step;
   if(step>=d-1)path.shift();
  }
  walking.moving=travelled>1;
 }
 function page(){
  const saved=meetings().filter(m=>m.day<=day());
  const now=adultNear(),already=now&&saved.some(m=>m.day===day()&&m.id===now.id);
  const heading='<div class="pn275-heading"><small>CHILDHOOD · FRIENDLY VILLAGE MOMENTS</small><h3>🌼 Meet the Neighbors</h3><p>Pip meets real villagers only when you are walking together and they are nearby. No imagined conversations from a distant menu.</p></div>';
  const walkingPanel=isGuardian()?
   (api.isMentorVisit?.()?'<div class="pn275-walk"><strong>🌷 A village guide afternoon</strong><p>Pip is spending time near a real Maplewood guide. Meet the villager in town to share a genuine memory.</p></div>':
    walkingNow()?'<div class="pn275-walk"><strong>🚶 Walking together</strong><p>Pip follows your actual walking route around Maplewood’s buildings and garden paths. Stay close at activity markers so Pip can help, too.</p><button data-act="pn275-stop">Finish our stroll</button></div>':
    '<div class="pn275-walk"><strong>🏡 Take Pip for a walk</strong><p>Visit Pip in your cottage to begin an accompanied stroll through the real village.</p>'+ (api.getScene?.()==='home'&&api.isPlayerNearChild?.(130)?'<button data-act="pn275-walk">Take a village stroll</button>':'<small>Find Pip at home first to start a walk.</small>')+'</div>'):'';
  const encounter=now?'<div class="pn275-neighbor"><strong>'+STORIES[now.id].icon+' '+esc(now.name)+' is really here</strong><p>'+esc(STORIES[now.id].title)+' · '+(already?'You have already shared today’s moment.':'Choose a tiny two-part activity together.')+'</p>'+(already?'<small>✓ Today’s visit is remembered.</small>':'<button data-act="pn275-start" data-id="'+now.id+'">Share a real neighbor moment</button>')+'</div>':'<div class="pn275-no-neighbor">No villager is close to Pip right now. Look for one in the playable town—not everyone is available all the time.</div>';
  const memories=saved.slice(-8).reverse().map(m=>'<li>'+STORIES[m.id].icon+' Day '+m.day+' · '+esc(STORIES[m.id].title)+'</li>').join('');
  return '<section class="pn275-panel">'+heading+walkingPanel+encounter+'<h3>Our genuine neighbor memories</h3><ul class="pn275-memory">'+(memories||'<li>No neighbor moments earned yet.</li>')+'</ul></section>';
 }
 function start(id){
  if(session||!nameOK(id)||!adultNear(id)||meetings().some(m=>m.day===day()&&m.id===id))return false;
  session={id,day:day(),step:0,mask:0};return step();
 }
 function step(){
  if(!session)return false;
  if(session.day!==day()||!adultNear(session.id)){session=null;return false}
  const details=STORIES[session.id],q=details.question[session.step];
  if(!q)return false;
  api.showModal?.('little-sprouts','<section class="ls272-book pn275-activity"><div class="ls272-cover"><small>'+details.icon+' A GENUINE MEETING · '+(session.step+1)+' OF 2</small><h2>'+esc(details.title)+'</h2><p>'+esc(q)+'</p></div><div class="ls272-activity">'+details.options[session.step].map(([choice],i)=>'<button data-act="pn275-answer" data-id="'+i+'">'+esc(choice)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pn275-cancel">Leave this visit for another time</button></section>');
  return true;
 }
 function answer(i){
  if(!session||!Number.isInteger(i)||i<0||i>1||session.day!==day()||!adultNear(session.id)){session=null;return false}
  const details=STORIES[session.id],q=details.options[session.step];if(!q)return false;
  if(i===1)session.mask|=1<<session.step;
  const story=q[i][1];session.step++;
  if(session.step<2){
   api.showModal?.('little-sprouts','<section class="ls272-book pn275-activity"><div class="ls272-cover"><small>💛 AN ACTUAL SHARED MOMENT</small><h2>Learning together</h2><p>'+esc(story)+'</p></div><button data-act="pn275-next">Continue our neighbor visit</button><button class="ls272-secondary" data-act="pn275-cancel">End the visit</button></section>');
   return true;
  }
  const finished={id:session.id,day:day(),mask:session.mask};session=null;
  if(meetings().some(m=>m.day===finished.day&&m.id===finished.id))return false;
  const c=child(),prior=meetings().slice();c.meetings=clean([...prior,finished]);
  api.onMeetingCompleted?.(finished,prior);
  c.needs.curiosity=Math.min(100,c.needs.curiosity+6);
  c.needs.confidence=Math.min(100,c.needs.confidence+4);
  api.save?.();api.updateUI?.();
  api.notify?.('🌼 Pip shared a real moment with '+api.nameOfAdult?.(finished.id)+'! Curiosity +6 · Confidence +4.');
  api.showModal?.('little-sprouts','<section class="ls272-book pn275-activity"><div class="ls272-cover"><small>A NEIGHBOR MEMORY TO KEEP</small><h2>'+details.icon+' '+esc(details.title)+'</h2><p>'+esc(story)+'</p></div><p>Day '+finished.day+' · Pip actually met a nearby villager. Your existing adult relationships and household ties stay unchanged.</p><button data-act="pn275-book">Return to Pip’s Daybook</button></section>');
  return true;
 }
 function handle(action,id){
  if(action==='pn275-walk')return startWalk();
  if(action==='pn275-stop')return stopWalk();
  if(action==='pn275-start')return start(id);
  if(action==='pn275-next')return step();
  if(action==='pn275-answer')return answer(Number(id));
  if(action==='pn275-cancel'){session=null;return api.openBook?.()}
  if(action==='pn275-book')return api.openBook?.();
  return false;
 }
 function drawAura(g,tick,pos){
  if(!walkingNow()||!pos||!g)return;
  // Tiny animated drawn companion ribbon, never static overlay/screen clutter.
  const shift=Math.sin(tick*3)*2;
  g.save();g.fillStyle='#eed0a6';g.fillRect(Math.round(pos.x-8),Math.round(pos.y-74+shift),16,3);
  g.fillStyle='#bd86a3';g.fillRect(Math.round(pos.x+7),Math.round(pos.y-72+shift),6,6);
  g.restore();
 }
 return {clean,handle,page,start,step,answer,startWalk,stopWalk,advance,drawAura,escortPose,walkingNow,adultNear,get session(){return session},get walking(){return walking}};
}
root.HearthPipNeighbors={setup,clean,ADULTS,STORIES};
})(window);
