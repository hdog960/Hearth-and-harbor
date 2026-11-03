/* Hearth & Harbor v2.8.3 — The Family Seasons Sampler.
 * Replayable ACTUAL coactivities: visit an earned wall heirloom, make a
 * meaningful first choice, finish a real 3.8s Poppy Daybook furniture action,
 * then choose what to remember. One truthful memory/day, across seasons.
 */
(function(root){'use strict';
const THEMES={
 welcome:{
  name:'A Welcome Worth Remembering',icon:'🌷',action:'chat',need:'confidence',
  frame:{x:708,y:239,walkX:708,walkY:365},
  opening:'Pip pauses at the Welcome Ribbon. Who might need a little kindness today?',
  first:[['The neighbor we haven’t spoken to lately','Pip imagines a friendly letter on their doorstep.'],
         ['Somebody who is new to Maplewood','Pip wants our home to feel welcoming to everyone.']],
  ending:'After Poppy writes a real friendly letter, Pip asks what we should remember.',
  last:[['There is always room at our table','Pip saves the thought in a little paper heart.'],
        ['Small greetings can mean a lot','Pip decides to say hello more often.']]},
 supper:{
  name:'The Story Behind Sunday Supper',icon:'🥧',action:'meal',need:'joy',
  frame:{x:800,y:239,walkX:805,walkY:388},
  opening:'Pip looks at the family recipe card. What makes a meal worth remembering?',
  first:[['Helping with something little','Pip remembers carefully folding napkins.'],
         ['Making room for happy stories','Pip thinks the best ingredient is company.']],
  ending:'After the real household meal, Pip wants to record a tiny family ritual.',
  last:[['Share one favorite flavor','Pip sketches a bright little berry on the card.'],
        ['Invite everyone to tell a story','The happiest part was sitting together.']]},
 orchard:{
  name:'Our Little Orchard Almanac',icon:'🍃',action:'hobby',need:'curiosity',
  frame:{x:892,y:239,walkX:820,walkY:365},
  opening:'Pip traces the Orchard Window Print. What did the garden teach us?',
  first:[['To notice even the smallest leaves','Pip counts carefully drawn leaves in the picture.'],
         ['To care for things that grow slowly','Pip wonders what the next season will bring.']],
  ending:'After Poppy finishes a real creative session, Pip chooses a memory for the scrapbook.',
  last:[['Draw the tree as it is today','Pip records the garden exactly as they found it.'],
        ['Imagine what may grow tomorrow','Pip draws a new branch full of possibilities.']]}
};
const KEYS=Object.keys(THEMES),SEASONS=['Spring','Summer','Autumn','Winter'];
const COLORS=['#a2c7a5','#e8c783','#c7997e','#9dbad0'];
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const validSeason=x=>Number.isInteger(x)&&x>=0&&x<=3;
function clean(raw){
 const rows=[],days=new Set();
 if(Array.isArray(raw))for(const r of raw.slice(-180)){
  if(!obj(r)||!KEYS.includes(r.key)||!dayOK(r.day)||!validSeason(r.season)||
   ![0,1].includes(r.first)||![0,1].includes(r.last)||days.has(r.day))continue;
  days.add(r.day);rows.push({day:r.day,key:r.key,season:r.season,first:r.first,last:r.last});
 }
 return rows.sort((a,b)=>a.day-b.day||a.key.localeCompare(b.key)).slice(-40);
}
function recordsFor(state,child,now,legacy){
 if(!obj(child)||child.guardian!=='player'||!dayOK(child.guardianDay)||child.guardianDay>now)return [];
 return clean(child.familyRituals).filter(r=>{
  if(r.day>now||r.day<child.guardianDay)return false;
  const source=(child.legacyKeepsakes||[]).find(k=>obj(k)&&k.key===r.key&&dayOK(k.day)&&k.day<=r.day&&
   k.action===root.HearthPipLegacy.TRACKS[r.key].action);
  if(!source)return false;
  const adult=state?.homeTraditions?.homes?.player?.[r.key]?.completedDay;
  if(!dayOK(adult)||adult>source.day)return false;
  return root.HearthPipGrowth.lifeStage(child,source.day)>=root.HearthPipLegacy.TRACKS[r.key].stage;
 });
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),now=()=>dayOK(state().day)?state().day:1;
 const season=()=>validSeason(state().season)?state().season:0;
 const source=key=>api.hasKeepsake?.(key)===true;
 const history=()=>recordsFor(state(),child(),now());
 const todayDone=()=>history().some(m=>m.day===now());
 const guardian=()=>child().guardian==='player'&&dayOK(child().guardianDay)&&child().guardianDay<=now();
 const home=()=>guardian()&&api.getScene?.()==='home';
 const near=()=>home()&&api.nearChild?.(145)===true;
 let session=null,following=null;
 function valid(){
  if(!session)return false;
  if(!home()||session.day!==now()||session.season!==season()||!source(session.key)){
   session=null;following=null;return false;
  }
  if((session.phase==='queued'||session.phase==='holding')&&api.isQueued?.(session.action)===false){
   session=null;following=null;return false;
  }
  if(todayDone()&&!session.complete){session=null;following=null;return false}
  return true;
 }
 function status(){if(!valid())return null;return {key:session.key,phase:session.phase,day:session.day}}
 const earnedSeasons=()=>[...new Set(history().map(r=>r.season))];
 const quilt=()=>earnedSeasons().length>=3;
 function canStart(key){
  return !!THEMES[key]&&home()&&near()&&source(key)&&!todayDone()&&!valid()&&!api.isBusy?.()&&
   !api.childBusy?.()&&!api.ownDone?.(THEMES[key].action);
 }
 function plan(key){
  if(!canStart(key))return false;
  const p=api.getChildPosition?.();
  if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return false;
  session={key,action:THEMES[key].action,day:now(),season:season(),phase:'walking',first:null,complete:false};
  following={x:p.x,y:p.y,moving:false,facing:'side'};
  api.closeModal?.();
  const frame=THEMES[key].frame;
  const ok=api.walkToFrame?.({x:frame.walkX,y:frame.walkY},at=>arrive(key,at));
  if(ok!==true){session=null;following=null;api.notify?.('That family keepsake is not reachable from here.');return false}
  api.notify?.('🖼️ Walk with Pip to the actual '+root.HearthPipLegacy.TRACKS[key].title+' on the wall.');
  return true;
 }
 function follow(dt){
  if(!valid()||!following||!Number.isFinite(dt)||dt<=0||api.isPaused?.())return;
  const p=api.getPlayer?.();if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
  const to={x:p.x+(session?.phase==='queued'&&p.x>650?-46:40),y:p.y+28};
  let dx=to.x-following.x,dy=to.y-following.y,d=Math.hypot(dx,dy);
  if(d<3){following.moving=false;return}
  if(d>500){following.x=to.x;following.y=to.y;following.moving=false;return}
  const step=Math.min(d,dt*250);
  following.x+=dx/d*step;following.y+=dy/d*step;
  following.moving=d>step+3;following.facing=Math.abs(dx)>Math.abs(dy)?'side':dy<0?'back':'front';
 }
 function pose(){
  if(!valid()||!following)return null;
  return {...following,participating:true,ritual:true};
 }
 function arrive(key,at){
  if(!valid()||session.key!==key||session.phase!=='walking'||!near())return false;
  const p=api.getPlayer?.();
  if(!p||!at||!Number.isFinite(at.x)||!Number.isFinite(at.y)||dist(p,at)>65)return false;
  session.phase='story';
  return firstPage();
 }
 function firstPage(){
  if(!valid()||session.phase!=='story'||!near())return false;
  const t=THEMES[session.key];
  api.showModal?.('little-sprouts','<section class="ls272-book pf283-story"><header class="ls272-cover"><small>'+t.icon+' A MEMORY BEGINS AT OUR REAL FAMILY WALL</small><h2>'+esc(t.name)+'</h2><p>'+esc(t.opening)+'</p></header><div class="ls272-activity">'+t.first.map(([label],i)=>'<button data-act="pf283-first" data-id="'+i+'">'+esc(label)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pf283-cancel">Leave it for another day</button></section>');
  return true;
 }
 function chooseFirst(n){
  if(![0,1].includes(n)||!valid()||session.phase!=='story'||!near())return false;
  session.first=n;session.phase='queued';
  const key=session.key,t=THEMES[key];
  api.closeModal?.();
  if(api.queueAction?.(t.action)!==true){session=null;following=null;api.notify?.('There is no room for another real household activity.');return false}
  api.notify?.('🌷 '+t.first[n][1]+' Finish Poppy’s real '+t.action+' activity with Pip by the furniture.');
  return true;
 }
 function complete(action,once,day){
  if(!valid()||session.phase!=='queued'||action!==session.action||once!==true||day!==now()||!near())return false;
  session.phase='final';
  return finalPage();
 }
 function finalPage(){
  if(!valid()||session.phase!=='final'||!near())return false;
  const t=THEMES[session.key];
  api.showModal?.('little-sprouts','<section class="ls272-book pf283-story"><header class="ls272-cover"><small>'+t.icon+' A REAL HOUSEHOLD MOMENT FINISHED</small><h2>'+esc(t.name)+'</h2><p>'+esc(t.ending)+'</p></header><div class="ls272-activity">'+t.last.map(([label],i)=>'<button data-act="pf283-last" data-id="'+i+'">'+esc(label)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pf283-cancel">Leave this memory unfinished</button></section>');
  return true;
 }
 function chooseLast(n){
  if(![0,1].includes(n)||!valid()||session.phase!=='final'||!near()||todayDone())return false;
  const r={day:session.day,key:session.key,season:session.season,first:session.first,last:n};
  const theme=THEMES[r.key],sentence=theme.last[n][1];
  session=null;following=null;
  const c=child();c.familyRituals=clean([...(c.familyRituals||[]),r]);
  c.needs[theme.need]=Math.min(100,Math.max(0,c.needs[theme.need]||0)+4);
  c.needs.joy=Math.min(100,Math.max(0,c.needs.joy||0)+2);
  api.save?.();api.updateUI?.();
  api.notify?.('🧵 '+SEASONS[r.season]+' family ritual remembered: '+theme.name+'. No currency earned.');
  api.showModal?.('little-sprouts','<section class="ls272-book pf283-story"><header class="ls272-cover"><small>A MEMORY WE ACTUALLY MADE</small><h2>'+theme.icon+' '+esc(theme.name)+'</h2><p>'+esc(sentence)+'</p></header><p>A little '+SEASONS[r.season].toLowerCase()+' patch is sewn into the family sampler. Visit in different seasons to complete it.</p><button data-act="pf283-board">Open our family sampler</button></section>');
  return true;
 }
 function cancel(){
  if(!session)return false;
  session=null;following=null;
  api.notify?.('Our family ritual can continue another day. No reward was saved.');
  return true;
 }
 function inspect(key){
  if(!home()||!source(key))return false;
  return board();
 }
 function frameHit(x,y){
  if(!home()||!Number.isFinite(x)||!Number.isFinite(y))return null;
  const key=KEYS.find(k=>source(k)&&Math.abs(x-THEMES[k].frame.x)<=29&&y>=205&&y<=281);
  return key||null;
 }
 function panel(){
  const opened=earnedSeasons(),recs=history();
  const heading='<div class="pf283-cover"><small>GENERATIONS · A HOME FULL OF STORIES</small><h3>🧵 Our Family Seasons Sampler</h3><p>Handmade keepsakes become real traditions. Stand with Pip, walk to a framed memory, then complete a genuine household routine and choose what to remember.</p><strong>'+opened.length+' / 3 seasons shared · '+(quilt()?'✨ Our seasonal quilt is finished':'A patch for every new season')+'</strong></div>';
  const cards=KEYS.map(k=>{
   const t=THEMES[k],owned=source(k),ready=canStart(k),selected=status()?.key===k;
   return '<div class="pf283-item"><span>'+t.icon+'</span><div><strong>'+esc(t.name)+'</strong><small>'+(owned?(ready?'Pip and Poppy are ready to begin together':todayDone()?'Today’s real shared ritual is complete':selected?'A real ritual is already underway':'Meet Pip in the actual cottage; finish any active household routine first'):'First earn the genuine '+esc(root.HearthPipLegacy.TRACKS[k].title)+' heirloom')+'</small></div>'+
    (ready?'<button data-act="pf283-start" data-id="'+k+'">Begin</button>':'')+'</div>';
  }).join('');
  const details=valid()?'<div class="pf283-active"><strong>🌷 A family ritual in progress</strong><p>'+esc(THEMES[session.key].name)+' · '+esc(session.phase==='walking'?'Walking to our real wall keepsake':session.phase==='story'?'Choosing the opening story':session.phase==='queued'?'Finishing Poppy’s real household routine':'Choosing what the finished activity meant')+'</p>'+
   (session.phase==='final'?'<button data-act="pf283-final">Finish our family memory</button>':session.phase==='story'?'<button data-act="pf283-story">Continue the story</button>':'')+
   '<button data-act="pf283-cancel">Stop without saving a memory</button></div>':'';
  const pages=recs.slice(-8).reverse().map(r=>'<li>Day '+r.day+' · '+SEASONS[r.season]+' · '+THEMES[r.key].icon+' '+esc(THEMES[r.key].name)+'</li>').join('');
  return '<section class="pf283-panel">'+heading+'<div class="pf283-patches">'+SEASONS.map((n,i)=>'<div class="'+(opened.includes(i)?'pf283-sewn':'')+'"><span>'+['🌱','☀️','🍂','❄️'][i]+'</span><small>'+n+'</small>'+(opened.includes(i)?'<b>✓</b>':'')+'</div>').join('')+'</div>'+details+'<h3>Our real cottage keepsakes</h3>'+cards+
   '<h3>Pages from our family seasons</h3><ul class="pf283-pages">'+(pages||'<li>Our first real family ritual is waiting.</li>')+'</ul><p class="pf283-note">Only a completed timed home activity and final choice creates a page. No automatic aging, fake family ties, currency rewards or compulsory daily care.</p></section>';
 }
 function board(){return api.showModal?.('little-sprouts','<section class="ls272-book">'+panel()+'<button class="ls272-secondary" data-act="pf283-child">Open Pip’s full Daybook</button></section>')}
 function draw(g,tick=0){
  if(!home()||!g)return false;
  const present=earnedSeasons();
  if(!present.length)return false;
  const x=612,y=166,complete=quilt();
  g.save();g.fillStyle='#785b4e';g.fillRect(x-54,y-48,108,96);
  g.fillStyle='#e4c99c';g.fillRect(x-50,y-44,100,88);
  g.fillStyle='#f8edcf';g.fillRect(x-46,y-40,92,80);
  for(let i=0;i<4;i++){
   const xx=x-40+(i%2)*40,yy=y-34+Math.floor(i/2)*34;
   g.fillStyle=present.includes(i)?COLORS[i]:'#e7dbcd';g.fillRect(xx,yy,36,30);
   if(present.includes(i)){
    g.fillStyle='#fff2cf';g.fillRect(xx+12,yy+8,12,5);
    g.fillStyle='#947e72';g.fillRect(xx+17,yy+3,3,19);
    g.fillStyle='#fff6dd';g.fillRect(xx+5,yy+22,5,3);
   }else{g.fillStyle='#cfc0b0';g.fillRect(xx+16,yy+11,5,5)}
  }
  if(complete){
   g.fillStyle='#daab79';g.fillRect(x-57,y+40,114,6);
   g.fillStyle='#fff4ce';g.fillRect(x-31,y+43,62,3);
   if(Math.sin(tick*1.4)>0.8){g.fillStyle='#fff5cf';g.fillRect(x+57,y-41,5,5)}
  }
  g.restore();return true;
 }
 function handle(action,id){
  if(action==='pf283-board')return board();
  if(action==='pf283-child')return api.openBook?.();
  if(action==='pf283-start')return plan(id);
  if(action==='pf283-story')return firstPage();
  if(action==='pf283-first')return chooseFirst(Number(id));
  if(action==='pf283-final')return finalPage();
  if(action==='pf283-last')return chooseLast(Number(id));
  if(action==='pf283-cancel'){if(!cancel())return false;return board()}
  return false;
 }
 return {clean,recordsFor,plan,canStart,arrive,chooseFirst,complete,chooseLast,finalPage,cancel,follow,pose,status,
  frameHit,inspect,board,panel,draw,history,handle,earnedSeasons,
  get session(){return session},get quilt(){return quilt()},get bonus(){return quilt()?1:0}};
}
root.HearthPipRituals={setup,clean,recordsFor,THEMES,SEASONS};
})(window);
