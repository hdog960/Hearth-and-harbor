/* Hearth & Harbor v2.8.7 — The Village Remembers.
 * Distinct adult follow-through after REAL completed Neighborhood Helpers.
 * NPCs walk via their existing world route to their saved keepsakes.
 * Pip and Poppy must join them there, on a later day, for a small
 * personal memory; first choice and final choice from the original
 * project influence the actual words. A remembered reply decorates
 * the physical craft forever. Never an automatic menu or timer payout.
 */
(function(root){'use strict';
const ANSWERS={
 mabel:{note:'I still notice the little petals when I water the garden.',start:'Mabel brushes a leaf from the tiny welcome flag. Pip notices the garden has changed since their first day.',options:['Make room for something new','Help a quiet visitor feel welcome'],outcomes:['Mabel and Pip make room for the next seedling to grow.','Pip notices someone small and helps them feel welcome.'],need:'curiosity'},
 rosie:{note:'A neighbor stopped to read our market basket card today.',start:'Rosie tidies the little market basket and smiles as Pip spots its familiar ribbon.',options:['Invite someone new to contribute','Thank a familiar neighbor'],outcomes:['Pip learns that welcoming someone new keeps a village growing.','Rosie reminds Pip that thanks should be given while people are nearby.'],need:'confidence'},
 oliver:{note:'Someone tried our little recipe! I saved the card.',start:'Oliver sees Pip by their handwritten recipe and remembers the first idea.',options:['Teach a beginner how to begin','Share a favorite memory over supper'],outcomes:['Pip discovers how much a patient teacher can help.','Oliver and Pip give their recipe a warm place at the family table.'],need:'confidence'},
 jun:{note:'Our story pennant keeps drawing curious readers.',start:'Jun unfolds the little pennant with Pip. It has already inspired another story.',options:['Leave a blank page for others','Read the ending together'],outcomes:['Pip leaves a little room for another voice in the story.','Jun and Pip discover the comfort of reading the same ending together.'],need:'curiosity'},
 bea:{note:'I love how the colors we chose look in the afternoon.',start:'Bea points to the little color swatches. The light makes their shades look different today.',options:['Add a color that belongs to someone else','Tell a friend what their art means'],outcomes:['Bea and Pip see how everyone brings a different color.','Pip learns to say what another person’s creativity means to them.'],need:'joy'},
 finn:{note:'The pond has been quieter since we put up the notice.',start:'Finn stands by the little pond-care sign. Pip listens to the gentle water nearby.',options:['Watch quietly for new wildlife','Make the path kinder to visitors'],outcomes:['Finn and Pip learn that patience reveals little wonders.','Pip decides that sharing a place means caring for its visitors.'],need:'curiosity'}
};
const IDS=Object.keys(ANSWERS),finite=Number.isFinite,validDay=d=>Number.isInteger(d)&&d>=1&&d<=9999;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw){
 const byId=new Map();
 if(Array.isArray(raw))for(const r of raw.slice(-120)){
  if(!r||typeof r!=='object'||Array.isArray(r)||!IDS.includes(r.id)||
    !validDay(r.day)||![0,1].includes(r.choice)||byId.has(r.id))continue;
  byId.set(r.id,{id:r.id,day:r.day,choice:r.choice});
 }
 return [...byId.values()].sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild();
 const day=()=>validDay(state().day)?state().day:1,minute=()=>finite(state().minute)?state().minute:-1;
 const all=()=>root.HearthPipWorldKeepsakes.trusted(child(),day());
 const remembered=()=>clean(child().neighborResponses);
 const original=id=>all().find(r=>r.id===id)||null;
 const response=id=>remembered().find(r=>r.id===id&&r.day<=day()&&!!original(id)&&r.day>original(id).day)||null;
 const done=id=>!!response(id);
 const site=id=>api.getDisplays?.().find(p=>p.id===id)||null;
 const adults=()=>api.getAdults?.()||[];
 const adult=id=>adults().find(a=>a.id===id&&finite(a.x)&&finite(a.y))||null;
 const player=()=>api.getPlayer?.(),pip=()=>api.getChildPosition?.();
 const inTown=()=>api.getScene?.()==='town';
 const windowNow=()=>minute()>=600&&minute()<960; // 10 AM – 4 PM, never automatic rewards.
 const earned=id=>!!original(id)&&original(id).day<day()&&!done(id);
 const target=id=>{
  const p=site(id);if(!p||!finite(p.x)||!finite(p.y))return null;
  const desired={x:p.x+78,y:p.y+21};
  const at=api.nearestWalkable?.(desired,'town');
  if(!at||!finite(at.x)||!finite(at.y)||dist(at,p)>135||
    api.isWalkable?.(at.x,at.y,'town')!==true)return null;
  return {x:Math.round(at.x),y:Math.round(at.y)};
 };
 function schedule(id,entry){
  if(!IDS.includes(id)||!entry||!inTown()||!windowNow()||!earned(id))return entry;
  if(api.hasCompetingEvent?.(id))return entry;
  const at=target(id);if(!at)return entry;
  // The same NPC travels with the game's ordinary grid pathfinder.
  return {...entry,where:[at.x,at.y],h:'neighbor-response:'+day()+':'+id,childReply:true};
 }
 function inRange(id){
  if(!inTown()||!windowNow()||!earned(id)||api.hasCompetingEvent?.(id))return false;
  const a=adult(id),p=player(),c=pip(),s=site(id);
  if(!a||!p||!c||!s||!target(id)||![p.x,p.y,c.x,c.y].every(finite))return false;
  return dist(a,s)<=133&&dist(a,p)<=125&&dist(a,c)<=125&&
    dist(p,c)<=130&&dist(p,s)<=148&&dist(c,s)<=148;
 }
 function eligible(id){return IDS.includes(id)&&inRange(id)}
 function dialogue(id){
  const r=original(id),saved=response(id),d=ANSWERS[id];
  if(!d||!r)return null;
  if(saved)return d.note+' '+d.outcomes[saved.choice];
  if(day()<=r.day)return null;
  // Those earlier choices are real, saved words, not random flattery.
  const project=root.HearthPipHelpers.PROJECTS[id];
  return d.note+' I remember when Pip chose "'+project.first[r.plan]+'" and later "'+project.last[r.finish]+'".';
 }
 function panel(){
  const relevant=IDS.filter(id=>!!original(id));
  if(!relevant.length)return '';
  const visits=relevant.map(id=>{
   const r=original(id),resp=response(id),d=ANSWERS[id],where=site(id);
   const msg=resp?'✓ Reflected together on Day '+resp.day:
    day()<=r.day?'Come back after today':
    'Meet '+id[0].toUpperCase()+id.slice(1)+' by the keepsake in Maplewood · 10 AM–4 PM';
   return '<div class="pr287-row"><span>'+root.HearthPipHelpers.PROJECTS[id].icon+'</span><div><strong>'+esc(root.HearthPipHelpers.PROJECTS[id].name)+'</strong><small>'+esc(msg)+'</small></div></div>';
  }).join('');
  return '<section class="pr287-panel"><details><summary>🌷 The Village Remembers · '+relevant.filter(done).length+'/'+relevant.length+' reflections</summary><div class="pr287-inner"><p>Villagers remember what Pip really helped create. On a later day, visit their actual keepsake between 10 AM and 4 PM with Pip following Poppy. The adult walks there during those hours. Speak to them while all three are together to make a lasting memory.</p>'+visits+'<p class="pr287-hint">Each person’s reply changes their original display. This is a small family story, not an instant reward or a new tab.</p></div></details></section>';
 }
 let session=null;
 function begin(id){
  if(!eligible(id))return false;
  const receipt=original(id);session={id,day:day(),originalDay:receipt.day};
  const d=ANSWERS[id],p=root.HearthPipHelpers.PROJECTS[id];
  api.closeTalk?.();
  api.showModal?.('little-sprouts','<section class="ls272-book pr287-book"><header class="ls272-cover"><small>🌷 A REAL RETURN VISIT · '+esc(api.name?.(id)||id)+'</small><h2>'+esc(p.name)+'</h2><p>'+esc(d.start)+'</p></header><div class="pr287-remember"><small>Pip’s original choices</small><p>'+esc(p.first[receipt.plan])+' → '+esc(p.last[receipt.finish])+'</p></div><h3>What will we do with this memory?</h3><div class="ls272-activity">'+d.options.map((s,i)=>'<button data-act="pr287-choose" data-id="'+i+'">'+esc(s)+'</button>').join('')+'</div><button class="ls272-secondary" data-act="pr287-cancel">Leave the visit unfinished</button></section>');
  return true;
 }
 function choose(i){
  if(!session||![0,1].includes(i)||session.day!==day()||
    !eligible(session.id)||original(session.id)?.day!==session.originalDay){session=null;return false}
  const result={id:session.id,day:day(),choice:i};
  session=null;
  const prev=remembered().filter(r=>!!response(r.id));if(prev.some(r=>r.id===result.id))return false;
  const c=child(),d=ANSWERS[result.id];
  c.neighborResponses=clean([...prev,result]);
  c.needs[d.need]=Math.min(100,Math.max(0,c.needs[d.need]||0)+4);
  api.bondAdult?.(result.id,2);
  api.save?.();api.updateUI?.();
  api.notify?.('🌷 Pip and '+(api.name?.(result.id)||result.id)+' shared a remembered moment. '+d.need+' +4.');
  api.showModal?.('little-sprouts','<section class="ls272-book pr287-book"><header class="ls272-cover"><small>✦ AN ACTUAL VILLAGE MEMORY</small><h2>'+root.HearthPipHelpers.PROJECTS[result.id].icon+' A Neighbor Remembers</h2><p>'+esc(d.outcomes[i])+'</p></header><p>Day '+result.day+' · A real visit with Poppy, Pip and '+esc(api.name?.(result.id)||result.id)+'. Their shared keepsake now has a little new ribbon. It will still be here tomorrow.</p><button data-act="pr287-book">Return to Pip’s Daybook</button></section>');
  return true;
 }
 function handle(act,id){
  if(act==='pr287-direct'||act==='pr287-start')return begin(id);
  if(act==='pr287-choose')return choose(Number(id));
  if(act==='pr287-cancel'){session=null;return api.openBook?.()}
  if(act==='pr287-book')return api.openBook?.();
  return false;
 }
 function mark(g,p){
  const r=response(p?.id);
  if(!g||!p||!r)return false;
  const x=Math.round(p.x),y=Math.round(p.y);
  g.save();
  // Alternate original ribbons according to the chosen follow-through.
  g.fillStyle=r.choice===0?'#88b79b':'#bc8cbd';
  g.fillRect(x-25,y-65,6,22);
  g.fillRect(x-30,y-65,16,6);
  g.fillStyle='#f8e8bf';g.fillRect(x-29,y-56,10,4);
  g.fillStyle=r.choice===0?'#f2d8aa':'#e6d8eb';
  g.fillRect(x+21,y-28,10,7);g.fillRect(x+24,y-33,5,6);
  g.restore();return true;
 }
 function drawAdult(g,id,pos,tick=0){
  if(!g||!inTown()||!IDS.includes(id)||!original(id)||!pos)return false;
  const s=site(id);if(!s||dist(s,pos)>124)return false;
  // Subtle original pixel character gesture, in the real person's world pose.
  const active=!!response(id)||windowNow();
  if(!active)return false;
  const x=Math.round(pos.x-31),y=Math.round(pos.y-93+Math.sin(tick*2)*2);
  g.save();g.fillStyle='#eac29b';g.fillRect(x,y,6,12);
  g.fillStyle='#fff2c8';g.fillRect(x-5,y-7,6,5);
  g.fillStyle=root.HearthPipHelpers.PROJECTS[id].colors[0];g.fillRect(x+1,y-10,5,4);
  g.restore();return true;
 }
 function drawChild(g,pos,tick=0){
  if(!g||!pos||!inTown())return false;
  const here=IDS.find(id=>response(id)&&site(id)&&adult(id)&&dist(pos,site(id))<110&&dist(pos,adult(id))<120);
  if(!here)return false;
  const x=Math.round(pos.x+19),y=Math.round(pos.y-58+Math.sin(tick*2.5)*2);
  g.save();g.fillStyle='#efc9a2';g.fillRect(x,y,7,4);g.fillRect(x+5,y-5,4,9);
  g.fillStyle='#fff0c9';g.fillRect(x+8,y-13,6,6);
  g.restore();return true;
 }
 return {clean,schedule,eligible,dialogue,panel,begin,choose,handle,mark,drawAdult,drawChild,
  response,original,target,windowNow,get session(){return session}};
}
root.HearthPipResponses={setup,clean,ANSWERS,IDS};
})(window);
