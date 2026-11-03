/* Hearth & Harbor v2.9.6 — spontaneous childhood friendships (builds on v2.9.5).
 * One ORIGINAL, independent younger resident with their own world schedule,
 * obstacle-checked movement and three different truly shared peer outings.
 * Wren is not an adult NPC, worker, marriage candidate, orphan, automatic
 * adoptee, an extra player-owned household member, or a duplicate Pip.
 */
(function(root){'use strict';
const WREN={id:'wren',name:'Wren',stage:'Child',skin:'#c99378',hair:'#294957',
 outfit:'#88c1b7',kind:'sweater',style:2,emoji:'🪶'};
const STORIES={
 story:{icon:'📘',name:'The Paper-Boat Tale',
  intro:'Wren found a map in an old book. Pip and Wren can imagine a story together.',
  first:['Build a boat from the map','Draw a cloud on the map'],
  final:['Let the boat discover a new island','Invite the boat back to its friends'],
  ending:['Wren and Pip leave room for the next adventure.','Wren and Pip agree that stories are better when friends return.'],ink:'#8d9fbb'},
 color:{icon:'🎨',name:'A Sky of Colors',
  intro:'Wren carries a little pocket sketchbook. Pip can help decide what the afternoon sky needs.',
  first:['Mix a gentle teal','Try a bright berry pink'],
  final:['Draw two friends beneath the clouds','Make a picture to share in Maplewood'],
  ending:['Wren and Pip laugh at their tiny cloud portraits.','Wren and Pip want everyone to see their handmade colors.'],ink:'#c9a0b4'},
 nature:{icon:'🍀',name:'The Leaf-Finder Club',
  intro:'Wren spotted an unusual fallen leaf. Pip and Wren can learn about it without picking the living flowers.',
  first:['Study the tiny veins','Notice its unusual outline'],
  final:['Sketch the leaf where it lies','Leave a kind note for the next explorer'],
  ending:['Wren and Pip become gentle observers of the meadow.','Wren and Pip hope another child will enjoy the trail.'],ink:'#96af88'}
};
const KIND=['story','color','nature'];
const ROUTINE=[
 {start:510,x:528,y:1030,label:'Morning books near Jun',icon:'📘',kind:'story'},
 {start:720,x:810,y:935,label:'Paper pictures near Bea',icon:'🎨',kind:'color'},
 {start:900,x:830,y:1070,label:'Meadow leaf discoveries',icon:'🍀',kind:'nature'},
 {start:1030,x:620,y:1000,label:'Heading toward the village path',icon:'🪶',kind:'story'}
];
const OFFSETS=[[75,48],[-76,44],[68,-53],[-68,-53]];
const dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const finite=Number.isFinite,obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw){
 const seen=new Set(),out=[];
 if(Array.isArray(raw?.friendships))for(const x of raw.friendships.slice(-100)){
  if(!obj(x)||!dayOK(x.day)||!KIND.includes(x.kind)||
     ![0,1].includes(x.first)||![0,1].includes(x.last)||seen.has(x.day))continue;
  seen.add(x.day);out.push({day:x.day,kind:x.kind,first:x.first,last:x.last});
 }
 out.sort((a,b)=>a.day-b.day||a.kind.localeCompare(b.kind));
 return {friendships:out.slice(-48)};
}
function setup(api){
 const state=()=>api.getState(),day=()=>dayOK(state().day)?state().day:1;
 const scene=()=>api.getScene?.(),minute=()=>Number(state().minute);
 const present=()=>scene()==='town'&&finite(minute())&&minute()>=510&&minute()<1110;
 const history=()=>clean(state().youngResidents?.wren).friendships.filter(r=>r.day<=day());
 const metToday=()=>history().some(r=>r.day===day());
 const level=()=>{
  const a=history(),days=new Set(a.map(x=>x.day)).size,
   types=new Set(a.map(x=>x.kind)).size;
  return days>=6&&types>=3?2:days>=3&&types>=2?1:0;
 };
 const title=()=>['A new face','A growing friendship','True village friends'][level()];
 let actor=null,epoch='',route=[],goal=null,repath=0,slot=-1,session=null,toast=0;
 // Session-only unprompted encounters; no fake friendship or currency saved.
 let moment=null,lastMomentDay=0;
 function routine(){
  const m=minute();
  if(!finite(m))return null;
  for(let i=ROUTINE.length-1;i>=0;i--)if(m>=ROUTINE[i].start)return {...ROUTINE[i],slot:i};
  return null;
 }
 const walkable=p=>!!p&&finite(p.x)&&finite(p.y)&&api.isWalkable?.(p.x,p.y,'town')===true;
 function safeAt(p,limit=88){
  if(!p||!finite(p.x)||!finite(p.y))return null;
  const x=api.nearestWalkable?.(p,'town');
  if(!walkable(x)||dist(x,p)>limit)return null;
  return {x:x.x,y:x.y};
 }
 function clear(){actor=null;route=[];goal=null;slot=-1;repath=0;epoch='';session=null;moment=null}
 function ensure(){
  if(!present())return null;
  const mark='town:'+day(),r=routine();
  if(!r)return null;
  if(!actor||epoch!==mark){
   epoch=mark;const at=safeAt(r,115);
   if(!at){actor=null;return null}
   actor={...at,moving:false,facing:'front',stride:0,day:day()};
   route=[];goal=null;repath=0;slot=r.slot;
  }
  return actor;
 }
 function segment(a,b){
  if(!walkable(a)||!walkable(b))return false;
  for(let n=Math.max(1,Math.ceil(dist(a,b)/9)),i=1;i<=n;i++){
   const p={x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n};
   if(!walkable(p))return false;
  }
  return true;
 }
 function routeTo(from,to){
  const raw=api.findPath?.(from,to,'town');
  if(!Array.isArray(raw)||raw.length>200||!raw.length)return [];
  const list=[];
  for(const p of raw){if(!walkable(p))return [];if(!list.length||dist(list[list.length-1],p)>2)list.push({x:p.x,y:p.y})}
  if(!list.length||dist(list[list.length-1],to)>33)return [];
  return list;
 }
 // Observed shared interests use only genuinely completed child outings.
 // Pip's earned story/art/garden skills break ties, not fabricated points.
 function sharedInterest(){
  const rows=history(),counts={story:0,color:0,nature:0};
  for(const r of rows)counts[r.kind]++;
  const skills=api.getPip?.()?.skills||{};
  const learned={story:Math.min(3,Math.max(0,Number(skills.story)||0)),
   color:Math.min(3,Math.max(0,Number(skills.art)||0)),
   nature:Math.min(3,Math.max(0,Number(skills.garden)||0))};
  const daily=routine()?.kind||'story';
  const kind=rows.length?KIND.slice().sort((a,b)=>
   (counts[b]*5+learned[b])-(counts[a]*5+learned[a])||
   (a===daily?-1:b===daily?1:KIND.indexOf(a)-KIND.indexOf(b)))[0]:daily;
  const lines={
   story:['Wren is folding a paper story for another day.',
    'Wren and Pip exchange ideas for their next paper-boat chapter.',
    'The two friends keep adding chapters to their imaginary map.'],
   color:['Wren has been watching the colors of the Maplewood sky.',
    'Wren and Pip compare the colors they spotted together.',
    'Pip and Wren keep a whole rainbow of shared ideas.'],
   nature:['Wren is looking for beautiful fallen leaves on the path.',
    'Pip and Wren remember their gentle meadow discoveries.',
    'The friends recognize each other’s favorite little nature finds.']
  }[kind];
  return {kind,label:STORIES[kind].name,icon:STORIES[kind].icon,
   line:lines[level()],completed:counts[kind]};
 }
 function validCompanion(){
  const p=api.getPipPosition?.();
  return api.isPipPresent?.()===true&&!api.isPipBusy?.()&&
   p&&finite(p.x)&&finite(p.y)?p:null;
 }
 function beginSmallMoment(a){
  if(moment||lastMomentDay===day()||api.isPlayerMoving?.()||api.isPaused?.()||session)return;
  const pip=validCompanion(),p=api.getPlayer?.();
  if(!pip||!p||!finite(p.x)||!finite(p.y)||dist(a,pip)>235||dist(a,pip)<14||
   dist(p,pip)>390)return;
  const desired={x:pip.x+48,y:pip.y+26},stop=safeAt(desired,62);
  if(!stop||dist(stop,pip)>88||dist(a,stop)>265)return;
  moment={day:day(),phase:'approach',elapsed:0,target:stop,kind:sharedInterest().kind};
  route=[];goal=null;repath=0;
 }
 function settleSmallMoment(a){
  if(!moment||moment.phase!=='approach')return false;
  const pip=validCompanion();
  if(!pip||moment.day!==day()||dist(a,pip)>288||dist(pip,moment.target)>124||
   api.isPlayerMoving?.()||moment.elapsed>12){
   // Blocked child paths cannot loop all afternoon on an iPhone.
   moment=null;lastMomentDay=day();route=[];goal=null;return false;
  }
  if(dist(a,pip)<=79){
   moment.phase='greeting';moment.elapsed=0;lastMomentDay=day();
   route=[];goal=null;a.moving=false;return true;
  }
  return false;
 }
 function advance(dt){
  if(!present()){if(actor||session||moment)clear();return}
  const a=ensure();if(!a)return;
  if(session&&(session.day!==day()||session.slot!==slot)){session=null}
  // The game's shared X button may dismiss an activity modal directly.
  // Abandon unfinished questions rather than leaving Wren frozen in town.
  if(session&&(session.phase==='first'||session.phase==='last')&&
    api.isDialogOpen?.()===false)session=null;
  if(!finite(dt)||dt<=0){a.moving=false;return}
  if(api.isPaused?.()||session){a.moving=false;return}
  if(moment&&moment.day!==day())moment=null;
  beginSmallMoment(a);
  if(moment?.phase==='greeting'){
   const pip=validCompanion();
   moment.elapsed+=Math.min(dt,.16);a.moving=false;
   if(!pip||dist(a,pip)>138||moment.elapsed>5.5){moment=null;route=[];goal=null}
   return;
  }
  if(moment?.phase==='approach'){
   moment.elapsed+=Math.min(dt,.16);
   if(settleSmallMoment(a))return;
  }
  const r=routine(),target=moment?.phase==='approach'?safeAt(moment.target,65):safeAt(r,110);
  if(!target){a.moving=false;route=[];return}
  if(r.slot!==slot&&!moment){slot=r.slot;route=[];goal=null;repath=0}
  if(dist(a,target)<11){a.moving=false;route=[];return}
  repath-=Math.min(dt,.15);
  if(!goal||dist(goal,target)>37||repath<=0){
   route=routeTo(a,target);goal=target;repath=1.4;
  }
  let stepBudget=Math.min(dt,.16)*132,moved=0;
  for(let i=0;i<4&&route.length&&stepBudget>0;i++){
   const p=route[0],from={x:a.x,y:a.y},d=dist(from,p);
   if(d<2.5){route.shift();continue}
   const step=Math.min(d,stepBudget);
   const to={x:from.x+(p.x-from.x)*step/d,y:from.y+(p.y-from.y)*step/d};
   if(!segment(from,to)){route=[];repath=.9;break}
   a.x=to.x;a.y=to.y;a.stride+=step/18;moved+=step;stepBudget-=step;
   a.facing=p.y-from.y< -10?'back':Math.abs(p.x-from.x)>=Math.abs(p.y-from.y)?'side':'front';
   if(step>=d-1)route.shift();
  }
  a.moving=moved>1;
  settleSmallMoment(a);
 }
 function pose(){
  const a=ensure();
  if(!a)return null;
  const r=routine();
  return {...a,label:r?.label||'Enjoying Maplewood',icon:r?.icon||'🪶',
   friendLevel:level(),kind:r?.kind||'story'};
 }
 function pipHere(){
  if(api.isPipPresent?.()!==true)return false;
  const p=api.getPipPosition?.();
  return !!p&&finite(p.x)&&finite(p.y);
 }
 function nearby(max=145){
  const p=api.getPlayer?.(),w=pose();
  return p&&w&&finite(p.x)&&finite(p.y)&&dist(p,w)<=max;
 }
 function peerNear(max=162){
  const p=api.getPipPosition?.(),w=pose();
  return pipHere()&&p&&w&&dist(p,w)<=max;
 }
 function eligible(){
  return present()&&nearby(150)&&peerNear(163)&&!metToday()&&!session&&
    !api.isPipBusy?.()&&!api.isPlayerMoving?.();
 }
 function hit(x,y){
  const w=pose();
  return w&&finite(x)&&finite(y)&&Math.abs(x-w.x)<=43&&Math.abs(y-(w.y-51))<=77?w:null;
 }
 function approach(){
  const w=pose();if(!w)return null;
  const player=api.getPlayer?.();
  if(player&&dist(player,w)<42)return {x:player.x,y:player.y};
  for(const [dx,dy] of [[-68,48],[67,52],[0,93]]){
   const p=safeAt({x:w.x+dx,y:w.y+dy},76);
   if(p&&dist(p,w)<125)return p;
  }
  return null;
 }
 function kindToday(){return KIND[(day()-1)%KIND.length]}
 function talk(){
  const w=pose();
  if(!w||!nearby(156))return false;
  if(session?.phase==='walking'){
   api.notify?.('Find the little paper marker with Pip and tap it together.');return false;
  }
  const kind=kindToday(),t=STORIES[kind],last=history().slice(-1)[0],shared=sharedInterest();
  // An optional tap interrupts the idle social cue; player activities take priority.
  if(moment){moment=null;route=[];goal=null}
  if(!eligible()){
   const message=!pipHere()?'Pip is not here. Wren can tell you about the village, but only children who actually meet can make a shared memory.':
    !peerNear()?'Pip is still a little too far away to join Wren. Walk together in the village.':
    metToday()?'Pip and Wren already shared a genuine moment today.':
    api.isPipBusy?.()?'Pip is finishing another childhood adventure.':'Wren is enjoying a quiet afternoon.';
   api.showModal?.('young-neighbors','<section class="yn295-book"><header class="yn295-cover"><small>🪶 A YOUNGER MAPLEWOOD NEIGHBOR</small><h2>Wren · '+esc(title())+'</h2><p>'+esc(message)+'</p></header><p>Wren loves handmade stories, painting the sky and gentle nature exploring. Wren is a village child, not a member of Poppy’s household.</p>'+(last?'<p>Last shared memory: '+esc(STORIES[last.kind].ending[last.last])+'</p>':'')+
    '<p>What Wren is thinking about: '+esc(shared.line)+'</p><button data-act="yn295-close">Return to Maplewood</button></section>');return true;
  }
  session={day:day(),slot,kind,first:null,last:null,phase:'first',marker:null};
  api.showModal?.('young-neighbors','<section class="yn295-book"><header class="yn295-cover"><small>🪶 WREN & PIP · A REAL TOWN AFTERNOON</small><h2>'+t.icon+' '+esc(t.name)+'</h2><p>'+esc(t.intro)+'</p></header><p>Wren and Pip are both here. Choose how they begin, then walk to the little paper marker together before deciding how the story ends.</p><div class="yn295-choices">'+
   t.first.map((v,i)=>'<button data-act="yn295-first" data-id="'+i+'">'+esc(v)+'</button>').join('')+
   '</div><button class="yn295-subtle" data-act="yn295-cancel">Maybe another day</button></section>');
  return true;
 }
 function markerFor(from){
  for(const [dx,dy] of OFFSETS){
   const ideal={x:from.x+dx,y:from.y+dy};
   const p=safeAt(ideal,48);
   if(p&&dist(p,from)>51&&dist(p,from)<135)return p;
  }
  return null;
 }
 function chooseFirst(choice){
  const s=session;
  if(!s||s.phase!=='first'||s.day!==day()||![0,1].includes(choice)||
   !nearby(158)||!peerNear(165)||api.isPipBusy?.())return false;
  const at=markerFor(pose());
  if(!at){session=null;api.notify?.('This part of the village is too crowded for the children to explore.');return false}
  s.phase='walking';s.first=choice;s.marker=at;
  api.closeModal?.();
  api.notify?.('🪶 Wren marked a small nearby spot! Walk there with Pip, then tap the original paper marker.');
  return true;
 }
 function hitMarker(x,y){
  const s=session;
  if(!s||s.phase!=='walking'||!s.marker||!finite(x)||!finite(y))return null;
  return dist({x,y},s.marker)<52?{...s.marker}:null;
 }
 function arrive(){
  const s=session;
  if(!s||s.day!==day()||s.phase!=='walking'||!s.marker||scene()!=='town')return false;
  const w=pose(),p=api.getPlayer?.(),pip=api.getPipPosition?.();
  if(!w||!p||!pip||!pipHere()||[p.x,p.y,pip.x,pip.y].some(v=>!finite(v))||
   dist(p,s.marker)>62||dist(w,s.marker)>142||dist(pip,s.marker)>155||
   dist(pip,w)>180){
   api.notify?.('Pip or Wren is still catching up. Keep the children together and tap the paper again.');
   return false;
  }
  s.phase='last';
  const t=STORIES[s.kind];
  api.showModal?.('young-neighbors','<section class="yn295-book"><header class="yn295-cover"><small>🍃 EVERYONE REACHED THE REAL SPOT</small><h2>'+t.icon+' '+esc(t.name)+'</h2><p>'+esc(t.first[s.first])+'</p></header><p>Wren, Pip and Poppy arrived at the little discovery spot together. How will this afternoon end?</p><div class="yn295-choices">'+
    t.final.map((v,i)=>'<button data-act="yn295-last" data-id="'+i+'">'+esc(v)+'</button>').join('')+
    '</div><button class="yn295-subtle" data-act="yn295-cancel">End this outing</button></section>');
  return true;
 }
 function finish(last){
  const s=session;
  if(!s||s.phase!=='last'||![0,1].includes(last)||s.day!==day()||scene()!=='town'||
    metToday()||!s.marker)return false;
  const w=pose(),p=api.getPlayer?.(),pip=api.getPipPosition?.();
  if(!w||!p||!pip||!pipHere()||[p.x,p.y,pip.x,pip.y].some(v=>!finite(v))||
   dist(p,s.marker)>90||dist(w,s.marker)>150||dist(pip,s.marker)>172||
   dist(pip,w)>195)return false;
  // This complete history cannot be produced by a one-tap encounter.
  const row={day:day(),kind:s.kind,first:s.first,last};
  const current=history();
  if(!obj(state().youngResidents))state().youngResidents={};
  state().youngResidents.wren=clean({friendships:[...current,row]});
  const d=api.getPip?.();
  if(d?.needs&&finite(d.needs.joy))d.needs.joy=Math.min(100,Math.max(0,d.needs.joy)+2);
  session=null;api.save?.();api.updateUI?.();
  api.notify?.('🌼 Pip and Wren made a true shared childhood memory! Pip’s joy +2.');
  const t=STORIES[row.kind];
  api.showModal?.('young-neighbors','<section class="yn295-book"><header class="yn295-cover"><small>✿ A REAL YOUNG FRIENDSHIP · DAY '+row.day+'</small><h2>'+t.icon+' '+esc(t.name)+'</h2><p>'+esc(t.ending[last])+'</p></header><p>Both children were physically here and you walked the little discovery path together. This date now belongs to their growing friendship.</p><button data-act="yn295-close">Back to the village</button></section>');
  return true;
 }
 function cancel(){if(!session)return false;session=null;api.closeModal?.();return true}
 function panel(){
  const list=history(),tier=title();
  return '<section class="yn295-panel"><details><summary>🪶 Wren · '+esc(tier)+'</summary><div class="yn295-inner"><p>Wren is a distinct younger Maplewood resident with their own daytime route. Wren is not an adult and is not automatically part of Poppy’s household.</p><p>For a real friendship memory, bring Pip to Wren, talk face-to-face, and walk together to the nearby original paper marker. Pip can come on an escorted village walk.</p><strong>'+list.length+' completed shared childhood afternoons · '+new Set(list.map(x=>x.kind)).size+' kinds of play</strong><ul>'+
   (list.length?list.slice(-4).reverse().map(r=>'<li>Day '+r.day+' · '+STORIES[r.kind].icon+' '+esc(STORIES[r.kind].name)+' · '+esc(STORIES[r.kind].ending[r.last])+'</li>').join(''):
   '<li>Meet Wren in the playable village to begin a genuine childhood friendship.</li>')+
   '</ul><p>🍃 Wren sometimes walks over to Pip for a little unprompted greeting. These tiny moments never award automatic friendship points.</p><p>Current interest: '+esc(sharedInterest().line)+'</p></div></details></section>';
 }
 function drawMarker(g,tick=0){
  const marker=session?.phase==='walking'?session.marker:null;
  if(!g||!marker||scene()!=='town')return false;
  const x=Math.round(marker.x),y=Math.round(marker.y+Math.sin(tick*2)*2);
  g.save();
  g.fillStyle='#3d6c67';g.fillRect(x-18,y-5,37,11);
  g.fillStyle='#edd7b5';g.fillRect(x-15,y-12,30,15);
  g.fillStyle='#fcf0dc';g.fillRect(x-10,y-22,22,21);
  g.fillStyle='#91a6be';g.fillRect(x-4,y-16,12,7);
  g.fillStyle='#bb8c92';g.fillRect(x+11,y-7,5,6);
  g.fillStyle='#fff4c8';g.fillRect(x-4,y-27,5,5);
  g.restore();return true;
 }
 // Original paired pixel-paper speech bubbles, shown only when both child
 // actors are physically together. No modal or duplicate sprite.
 function drawSocial(g,tick=0){
  const m=moment,w=pose(),p=validCompanion();
  if(!g||m?.phase!=='greeting'||!w||!p||dist(w,p)>138||scene()!=='town')return false;
  const color={story:'#899fbd',color:'#c996b0',nature:'#98b895'}[m.kind];
  function badge(x,y,other){
   const lift=Math.round(Math.sin(tick*3+(other?1.1:0))*2);
   x=Math.round(x+(other?-12:17));y=Math.round(y-114+lift);
   g.fillStyle='#395f60';g.fillRect(x-14,y-10,30,24);
   g.fillStyle='#f8efd7';g.fillRect(x-12,y-12,26,21);
   g.fillStyle=color;g.fillRect(x-9,y-9,20,15);
   if(m.kind==='story'){
    g.fillStyle='#fff7dc';g.fillRect(x-6,y-6,6,11);g.fillRect(x+2,y-6,6,11);
    g.fillStyle='#4b7778';g.fillRect(x,y-5,2,10);
   }else if(m.kind==='color'){
    g.fillStyle='#f6e3ad';g.fillRect(x-6,y-5,7,7);
    g.fillStyle='#8cbeb0';g.fillRect(x+2,y-2,7,7);
    g.fillStyle='#fff4e0';g.fillRect(x+1,y-7,5,5);
   }else{
    g.fillStyle='#e9f1bd';g.fillRect(x-4,y-6,8,10);g.fillRect(x-8,y-2,16,4);
    g.fillStyle='#456f58';g.fillRect(x,y-6,2,11);
   }
   g.fillStyle='#f8efd7';g.fillRect(x-3,y+9,6,5);
  }
  g.save();badge(w.x,w.y,false);badge(p.x,p.y,true);g.restore();return true;
 }
 function drawAccent(g,p,tick=0){
  if(!g||!p||!finite(p.x)||!finite(p.y)||scene()!=='town')return false;
  const x=Math.round(p.x+23),y=Math.round(p.y-64+Math.sin(tick*1.4)*2);
  g.save();
  // Wren's unique mint satchel and stitched amber paper-bird emblem
  g.fillStyle='#325b5a';g.fillRect(x-8,y+3,15,16);
  g.fillStyle='#a7d6c3';g.fillRect(x-6,y+5,11,12);
  g.fillStyle='#e8bd84';g.fillRect(x-2,y+7,6,5);
  if(level()>=1){
   g.fillStyle='#f7e2ae';g.fillRect(x+6,y-9,10,8);
   g.fillStyle=level()>=2?'#be98b6':'#91b1bf';g.fillRect(x+9,y-7,5,5);
  }
  g.restore();return true;
 }
 function handle(action,id){
  if(action==='yn295-first')return chooseFirst(Number(id));
  if(action==='yn295-last')return finish(Number(id));
  if(action==='yn295-cancel')return cancel();
  if(action==='yn295-close'){session=null;api.closeModal?.();return true}
  return false;
 }
 return {pose,advance,hit,approach,talk,eligible,chooseFirst,hitMarker,arrive,
  finish,cancel,handle,panel,history,level,title,sharedInterest,drawSocial,drawAccent,drawMarker,
  segment,routeTo,clean,story:kind=>STORIES[kind],
  get session(){return session},get moment(){return moment?{...moment}:null},get actor(){return actor?{...actor}:null}};
}
root.HearthYoungNeighbors={setup,clean,WREN,STORIES,ROUTINE};
})(window);
