/* Hearth & Harbor v2.9.0 — Guests Who Remember
 * Original adult characters participate during REAL timed cottage work,
 * and authentic completed three-person visits leave choice-specific
 * miniature world art and natural subsequent town conversation/routines.
 * All moments derive from v2.8.9's real saved family visit receipts.
 * No new save key, extra timers, simulated completion or passive payout.
 */
(function(root){'use strict';
const IDS=['mabel','rosie','oliver','jun','bea','finn'];
const finite=Number.isFinite,dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// On the home wall, the cards sit BETWEEN the existing windows and entry.
// All art is authored Canvas pixel geometry, not a generic icon tile.
const FRAMES={
 mabel:{x:400,y:163,ink:'#a77382',paper:'#fce9d9',motif:'petals',label:'Petal sketch'},
 rosie:{x:440,y:163,ink:'#bd7f61',paper:'#fff0d1',motif:'berries',label:'Market ribbon'},
 oliver:{x:480,y:163,ink:'#b78b69',paper:'#f9e7d0',motif:'bread',label:'Recipe note'},
 jun:{x:675,y:163,ink:'#818caa',paper:'#fff0d6',motif:'storybook',label:'Story pages'},
 bea:{x:715,y:163,ink:'#a67ea2',paper:'#fce8d7',motif:'color',label:'Color postcard'},
 finn:{x:755,y:163,ink:'#6c9b9c',paper:'#f4f0db',motif:'pond',label:'Pond note'}
};
const STOPS={
 mabel:{x:738,y:561},rosie:{x:565,y:801},oliver:{x:970,y:625},
 jun:{x:500,y:1010},bea:{x:835,y:823},finn:{x:985,y:1205}
};
const THOUGHTS={
 mabel:['I still remember the flowers we imagined by your cottage window.','Pip gave our little garden a new way to welcome people.'],
 rosie:['I keep a little place ready for a new face at the market.','Pip reminded me to thank the people who make a day special.'],
 oliver:['That shared kitchen afternoon reminded me to teach gently.','I still think about how we made room for everyone at your table.'],
 jun:['Pip was brave enough to begin our story together.','I still hear Pip’s voice whenever I read that chapter.'],
 bea:['The sunlight in our cottage painting looks different every day.','That little work of art holds the people who painted it.'],
 finn:['Pip noticed more by waiting quietly beside the water.','Pip had a lovely idea about caring for our little pond.']
};
const THEME={
 read:{edge:'#8276a0',paper:'#f7ead5',mark:'#a48c79'},
 meal:{edge:'#c58c6f',paper:'#f8e3c7',mark:'#bd8b72'},
 hobby:{edge:'#ac849e',paper:'#f2e4cf',mark:'#8cb4a5'}
};
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild();
 const today=()=>dayOK(state().day)?state().day:1;
 const scene=()=>api.getScene?.();
 const works=()=>{
  const c=child();
  if(!c||c.guardian!=='player'||!dayOK(c.guardianDay)||c.guardianDay>today())return [];
  const all=root.HearthPipHomeVisits?.clean?.(c.homeVisits)?.memories||[];
  return all.filter(r=>{
   if(r.day<c.guardianDay||r.day>today()||!IDS.includes(r.id))return false;
   const met=Array.isArray(c.meetings)&&c.meetings.some(m=>m.id===r.id&&
    dayOK(m.day)&&m.day<r.day);
   const helped=Array.isArray(c.helperProjects)&&c.helperProjects.some(m=>m.id===r.id&&
    dayOK(m.day)&&m.day<r.day);
   return met||helped;
  });
 };
 const receipt=id=>works().find(r=>r.id===id)||null;
 const time=()=>finite(state().minute)?state().minute:-1;
 const todayEcho=id=>{
  const r=receipt(id);
  return r&&today()>r.day&&today()-r.day<=3&&
   time()>=720&&time()<1020?r:null;
 };
 function destination(id){
  const original=STOPS[id];
  if(!original)return null;
  const p=api.nearestWalkable?.(original,'town')||original;
  return finite(p.x)&&finite(p.y)&&dist(p,original)<=90&&
   api.isWalkable?.(p.x,p.y,'town')!==false?{x:p.x,y:p.y}:null;
 }
 function schedule(id,entry){
  if(!entry||scene()!=='town'||!todayEcho(id)||
    entry.childReply||entry.childHomeGuest||api.hasCompetingEvent?.(id))return entry;
  // Preserve original weddings, home-care recovery, dates and other priority routines.
  const h=String(entry.h??'');
  if(/^(?:home-|rest-care|eat-care|social-care|date-|wedding-|promise-|evening-|visit-|pip-home-visit-)/.test(h))return entry;
  const to=destination(id);if(!to)return entry;
  return {...entry,h:'guest-echo-'+today()+'-'+id,where:[to.x,to.y],
   doing:'remembering a family visit with Poppy and Pip',icon:'🌷',mood:'happy',guestEcho:true};
 }
 function townDialogue(id){
  const r=receipt(id),d=root.HearthPipHomeVisits.VISITS[id];
  if(!r||!d||scene()!=='town'||today()<=r.day)return null;
  const delta=today()-r.day;
  // For the first three days, share a specific memory. Later, show
  // occasional recollections among ordinary village conversation.
  if(delta>3&&delta%4!==0)return null;
  const intro=THOUGHTS[id][r.close];
  const choice=d.open[r.open];
  return intro+' I remember Pip chose "'+choice+'" when we were all at the cottage.';
 }
 function townGesture(g,id,pos,tick=0){
  const r=todayEcho(id),stop=destination(id);
  if(!g||!r||!stop||scene()!=='town'||!pos||!finite(pos.x)||!finite(pos.y)||
    dist(stop,pos)>85)return false;
  const x=Math.round(pos.x+26),y=Math.round(pos.y-83+Math.sin(tick*2.1)*2);
  g.save();
  g.fillStyle='#ebc39b';g.fillRect(x-5,y+6,8,10);
  g.fillStyle=FRAMES[id].ink;g.fillRect(x,y-12,15,20);
  g.fillStyle='#fff1d9';g.fillRect(x+3,y-9,9,12);
  g.fillStyle=r.close===0?'#a5c49d':'#d5a5bb';
  g.fillRect(x+5,y-5,5,5);
  g.restore();return true;
 }
 function roleWork(){
  const s=api.getVisitSession?.(),adult=api.getGuestPose?.(),pip=api.getChildPose?.(),
   hold=api.getHold?.();
  if(scene()!=='home'||!s||s.phase!=='working'||s.day!==today()||
   !adult||!pip||!hold||hold.kind!==s.kind||!THEME[hold.kind]||
   !finite(adult.x)||!finite(adult.y)||!finite(pip.x)||!finite(pip.y)||
   !finite(hold.remaining)||!finite(hold.duration)||hold.duration<=0||
   hold.remaining<=0||hold.remaining>hold.duration)return null;
  const point=api.getWorkPoint?.(s.kind);
  if(!point||!finite(point.x)||!finite(point.y)||
   dist(adult,point)>150||dist(pip,point)>180)return null;
  return {s,adult,pip,hold,point,style:THEME[s.kind]};
 }
 // These distinct original working objects follow the REAL adult's hands.
 function drawWorking(g,who,tick=0){
  const w=roleWork();
  if(!g||!w||!['adult','pip'].includes(who))return false;
  const person=who==='adult'?w.adult:w.pip;
  const x=Math.round(person.x+(who==='adult'?24:17)),
   y=Math.round(person.y-(who==='adult'?87:52)+Math.sin(tick*7+(who==='adult'?0:1.4))*2);
  g.save();
  g.fillStyle='#e8bf98';g.fillRect(x-6,y+6,10,9);
  g.fillStyle='#785c60';g.fillRect(x-2,y+4,18,4);
  g.fillStyle=w.style.edge;g.fillRect(x,y-17,22,23);
  g.fillStyle=w.style.paper;g.fillRect(x+3,y-13,16,15);
  if(w.s.kind==='read'){
   g.fillStyle='#b58f84';g.fillRect(x+10,y-13,2,15);
   g.fillRect(x+5,y-8,4,2);g.fillRect(x+14,y-8,4,2);
   g.fillRect(x+6,y-4,3,2);g.fillRect(x+14,y-4,5,2);
  }else if(w.s.kind==='meal'){
   g.fillStyle='#be8972';g.fillRect(x+7,y-9,12,4);
   g.fillStyle='#f4c27f';g.fillRect(x+10,y-11,7,5);
   g.fillStyle='#96ae87';g.fillRect(x+5,y-5,5,5);
  }else{
   g.fillStyle='#a2ba96';g.fillRect(x+5,y-9,7,7);
   g.fillStyle='#d28b9f';g.fillRect(x+13,y-11,5,10);
   g.fillStyle='#8a9ebc';g.fillRect(x+7,y-3,11,3);
  }
  if(w.hold.remaining<w.hold.duration*.6){
   g.fillStyle='#fff1b5';g.fillRect(x+23,y-21,4,4);
   g.fillRect(x+28,y-12,3,3);
  }
  g.restore();return true;
 }
 function cards(){
  if(scene()!=='home')return [];
  return works().map(r=>({...FRAMES[r.id],id:r.id,day:r.day,open:r.open,
   close:r.close,kind:r.kind})).filter(x=>finite(x.x)&&finite(x.y));
 }
 function drawGallery(g,tick=0){
  if(!g)return false;
  const all=cards();if(!all.length)return false;
  g.save();
  for(const r of all){
   const x=Math.round(r.x),y=Math.round(r.y),a=r.open===0?0:1;
   g.fillStyle='#675849';g.fillRect(x-17,y-22,36,51);
   g.fillStyle='#b38b6b';g.fillRect(x-14,y-20,30,46);
   g.fillStyle='#d9b995';g.fillRect(x-12,y-18,26,42);
   g.fillStyle=r.paper;g.fillRect(x-9,y-15,20,31);
   const c=r.ink;
   // Six small hand-authored illustrations with branching story marks.
   if(r.motif==='petals'){
    g.fillStyle='#84aa8a';g.fillRect(x+1,y+4,3,11);
    g.fillStyle=c;g.fillRect(x-3,y-9,11,5);g.fillRect(x-3,y-4,5,8);g.fillRect(x+4,y-4,5,8);
    g.fillStyle='#f5d28f';g.fillRect(x,y-3,5,5);
   }else if(r.motif==='berries'){
    g.fillStyle='#88ab80';g.fillRect(x-5,y-10,11,4);
    g.fillStyle='#bf6c74';g.fillRect(x-5,y-5,9,11);g.fillRect(x+3,y-3,5,7);
    g.fillStyle='#f3c693';g.fillRect(x-2,y-2,3,3);
   }else if(r.motif==='bread'){
    g.fillStyle=c;g.fillRect(x-5,y-7,12,15);
    g.fillStyle='#eab780';g.fillRect(x-3,y-9,9,13);
    g.fillStyle='#f7e0ac';g.fillRect(x+1,y-5,3,7);
    g.fillStyle='#a47b65';g.fillRect(x-5,y+7,14,3);
   }else if(r.motif==='storybook'){
    g.fillStyle=c;g.fillRect(x-8,y-10,18,17);
    g.fillStyle='#fff4d7';g.fillRect(x-6,y-8,7,13);g.fillRect(x+3,y-8,5,13);
    g.fillStyle='#9f8b8d';g.fillRect(x+1,y-8,2,13);
    g.fillRect(x-4,y-3,3,2);g.fillRect(x+4,y-3,3,2);
   }else if(r.motif==='color'){
    g.fillStyle='#b87a8b';g.fillRect(x-5,y-10,6,9);
    g.fillStyle='#80a5ba';g.fillRect(x+2,y-6,6,10);
    g.fillStyle='#adbc89';g.fillRect(x-5,y+3,10,5);
   }else{
    g.fillStyle='#8ebbbb';g.fillRect(x-7,y-6,16,9);
    g.fillStyle='#6e9294';g.fillRect(x-4,y-2,10,5);
    g.fillStyle='#e7c58f';g.fillRect(x,y-1,6,3);
    g.fillStyle='#8eb68c';g.fillRect(x+5,y+5,4,7);
   }
   // Both original choices affect the final artifact.
   g.fillStyle=a?'#9ab7c4':'#e0b18c';g.fillRect(x-12,y-18,6,6);
   g.fillStyle=r.close===0?'#9fba92':'#d5a6b8';g.fillRect(x-9,y+18,22,5);
   g.fillStyle='#f7eacc';g.fillRect(x-5,y+19,13,2);
   if(today()===r.day&&Math.sin(tick*2.3+x)>.8){
    g.fillStyle='#fff1b2';g.fillRect(x+17,y-16,4,4);
   }
  }
  g.restore();return true;
 }
 function hit(x,y){
  if(!finite(x)||!finite(y)||scene()!=='home')return null;
  return cards().map(c=>({c,d:Math.hypot(x-c.x,(y-c.y)*.7)}))
   .filter(v=>Math.abs(x-v.c.x)<=32&&Math.abs(y-v.c.y)<=43)
   .sort((a,b)=>a.d-b.d)[0]?.c||null;
 }
 function approach(id){
  const c=cards().find(x=>x.id===id);if(!c)return null;
  const desired={x:c.x,y:285},where=api.nearestWalkable?.(desired,'home');
  if(!where||!finite(where.x)||!finite(where.y)||dist(where,desired)>95||
   api.isWalkable?.(where.x,where.y,'home')!==true)return null;
  return where;
 }
 function inspect(id){
  const c=cards().find(x=>x.id===id);
  const p=api.getPlayer?.(),to=approach(id);
  if(!c||!to||!p||!finite(p.x)||!finite(p.y)||dist(p,to)>125)return false;
  const v=root.HearthPipHomeVisits.VISITS[id];if(!v)return false;
  const name=escaped(api.name?.(id)||id);
  api.showModal?.('little-sprouts','<section class="ls272-book pe290-album"><header class="ls272-cover"><small>✿ THE COTTAGE MEMORY WALL · Day '+c.day+'</small><h2>'+v.icon+' '+escaped(v.name)+'</h2><p>Poppy, Pip and '+name+' finished a real household activity together.</p></header>'+
   '<div class="pe290-story"><small>Pip first imagined</small><strong>'+escaped(v.open[c.open])+'</strong>'+
   '<small>What the family chose to remember</small><strong>'+escaped(v.close[c.close])+'</strong>'+
   '<p>'+escaped(v.lines[c.close])+'</p></div>'+
   '<p>The handmade picture stays on the cottage wall. '+name+' can sometimes recall the visit in Maplewood, too. Looking again grants no new rewards.</p>'+
   '<button data-act="pe290-back">Return to the cottage</button></section>');
  return true;
 }
 function panel(){
  const all=works();
  if(!all.length)return '';
  return '<div class="pe290-summary"><b>✿ A wall of real memories</b><small>'+
   all.length+' / 6 handmade family postcards. Tap the little frames between the cottage windows to revisit the exact choices you made. No replay rewards.</small></div>';
 }
 function handle(action){
  if(action!=='pe290-back')return false;
  api.closeModal?.();return true;
 }
 return {works,receipt,destination,schedule,todayEcho,townDialogue,townGesture,
  roleWork,drawWorking,cards,drawGallery,hit,approach,inspect,panel,handle};
}
root.HearthPipGuestEchoes={setup,FRAMES,STOPS,THOUGHTS};
})(window);
