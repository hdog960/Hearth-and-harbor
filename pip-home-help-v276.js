/* Hearth & Harbor v2.7.6 — Little Helping Hands
 * Pip helps with ACTUAL completed Poppy household routines, not menu taps.
 * The optional plan is session-only; memories, a handmade house banner and
 * tiny restorative effects are earned only from a real first daily action.
 */
(function(root){'use strict';
const TASKS={
 read:{icon:'📖',name:'Read side by side',caption:'Pip turns the pages while Poppy finishes reading.',skill:'curiosity',boost:7,prop:'book',spot:[342,380]},
 tidy:{icon:'🧺',name:'Tidy a little corner',caption:'Pip sorts soft cushions while Poppy tidies the home.',skill:'confidence',boost:8,prop:'basket',spot:[720,600]},
 meal:{icon:'🥣',name:'Set the supper table',caption:'Pip lays out napkins as Poppy makes a real meal.',skill:'confidence',boost:7,prop:'napkin',spot:[824,390]},
 hobby:{icon:'🎨',name:'Create together',caption:'Pip sketches beside Poppy’s favorite hobby.',skill:'joy',boost:8,prop:'crayon',spot:[562,735]}
};
const KINDS=Object.keys(TASKS);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x),dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw){
 const seen=new Set(),out=[];
 if(Array.isArray(raw))for(const x of raw.slice(-120)){
  if(!obj(x)||!dayOK(x.day)||!KINDS.includes(x.kind))continue;
  const key=x.day;if(seen.has(key))continue;seen.add(key);
  out.push({day:x.day,kind:x.kind});
 }
 return out.sort((a,b)=>a.day-b.day||a.kind.localeCompare(b.kind)).slice(-36);
}
function keepsake(records,day){
 const available=clean(records).filter(r=>r.day<=day);
 return new Set(available.map(x=>x.kind)).size>=3&&new Set(available.map(x=>x.day)).size>=3;
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>dayOK(state().day)?state().day:1;
 const saved=()=>Array.isArray(child().homeHelps)?child().homeHelps:[];
 let pending=null;
 const hasGuardian=()=>child().guardian==='player'&&dayOK(child().guardianDay)&&child().guardianDay<=day();
 const inCottage=()=>api.getScene?.()==='home'&&hasGuardian();
 const completedToday=()=>saved().some(x=>x.day===day());
 const near=()=>inCottage()&&api.nearChild?.(145)===true;
 const project=()=>{
  if(pending&&(!inCottage()||pending.day!==day()))pending=null;
  return pending;
 };
 function canPlan(kind){
  if(!Object.hasOwn(TASKS,kind)||project()||!near()||completedToday())return false;
  if(api.ownDone?.(kind))return false;
  return true;
 }
 function plan(kind){
  if(!canPlan(kind))return false;
  pending={day:day(),kind};
  api.closeModal?.(); // Existing household movement is paused by a modal.
  if(api.queueAction?.(kind)!==true){pending=null;api.notify?.('There is no room in Poppy’s Daybook. Clear or finish a routine first.');return false}
  api.notify?.('🌷 Pip will join the real '+TASKS[kind].name.toLowerCase()+' activity. Follow Poppy to the furniture and finish it to earn a memory.');
  return true;
 }
 function cancel(){if(!pending)return false;pending=null;return true}
 function complete(kind,once,actionDay){
  const p=project();
  if(!p||!inCottage()||p.kind!==kind||p.day!==actionDay||once!==true||completedToday())return false;
  // This is invoked only by runOwnHomeAction after the real 3.8s household hold.
  const record={day:day(),kind};pending=null;
  const d=child();d.homeHelps=clean([...saved(),record]);
  const task=TASKS[kind];
  d.needs[task.skill]=Math.min(100,Math.max(0,d.needs[task.skill]||0)+task.boost);
  d.needs.joy=Math.min(100,Math.max(0,d.needs.joy||0)+3);
  api.save?.();api.updateUI?.();
  api.notify?.('💛 Pip really helped Poppy! '+task.skill+' +'+task.boost+' · a new home memory.');
  return true;
 }
 function profile(){
  const records=saved().filter(x=>x.day<=day()),earned=keepsake(records,day());
  return {records:records.slice(),keepsake:earned,ready:near(),pending:project(),
   today:records.some(x=>x.day===day()),
   types:new Set(records.map(x=>x.kind)).size,days:new Set(records.map(x=>x.day)).size};
 }
 function panel(){
  const s=profile();
  if(!hasGuardian())return '<section class="ph276-house"><h3>🏡 Little Helping Hands</h3><p>After choosing to become Pip’s guardian, you can share real cottage activities. No family relationship is assumed before that choice.</p></section>';
  const choices=KINDS.map(k=>{
   const t=TASKS[k],allowed=canPlan(k);
   const why=s.today?'A real home memory was already made today.':api.ownDone?.(k)?'Poppy has already completed this activity today.':!near()?'Stand beside Pip inside your cottage.':s.pending?'Finish or cancel the current plan first.':t.caption;
   return '<button data-act="ph276-plan" data-id="'+k+'" '+(allowed?'':'disabled')+'><strong>'+t.icon+' '+t.name+'</strong><small>'+esc(why)+'</small></button>';
  }).join('');
  const records=s.records.slice(-6).reverse().map(x=>'<li>Day '+x.day+' · '+TASKS[x.kind].icon+' '+TASKS[x.kind].name+'</li>').join('');
  return '<section class="ph276-house"><header class="ph276-cover"><small>GENERATIONS · LIFE TOGETHER</small><h3>🏡 Little Helping Hands</h3><p>Ask Pip to join Poppy’s genuine cottage routines. Poppy must actually walk to the furniture and complete the activity. Opening this book or scheduling alone earns nothing.</p></header>'+
   (s.pending?'<div class="ph276-pending"><strong>🌷 Planned together: '+TASKS[s.pending.kind].name+'</strong><p>Finish Poppy’s real Daybook activity. Pip joins the action at the furniture.</p><button data-act="ph276-cancel">Stop planning this activity</button></div>':
    '<h3>Invite Pip to help</h3><div class="ph276-choices">'+choices+'</div>')+
   '<div class="ph276-progress"><strong>🧵 Our Home Banner</strong><p>Complete three different kinds of help across three real days to make an illustrated keepsake inside the cottage. No new money or passive farming.</p><small>'+s.types+' of 3 kinds · '+s.days+' of 3 days'+(s.keepsake?' · ✓ Banner earned and displayed on the wall':'')+'</small></div>'+
   '<h3>Little home memories</h3><ul class="ph276-memories">'+(records||'<li>No completed shared chores yet.</li>')+'</ul></section>';
 }
 function pose(){
  const p=project(),hold=api.ownHold?.();
  if(!p||!hold||hold.kind!==p.kind||!inCottage())return null;
  const spot=TASKS[p.kind].spot,dx=spot[0]>620?-53:64;
  const t=Math.min(1,Math.max(0,1-hold.remaining/Math.max(.1,hold.duration)))*.5+.5;
  return {x:spot[0]+dx,y:spot[1]+62-Math.sin(t*Math.PI)*8,moving:t<.65,facing:dx<0?'side':'front',participating:true};
 }
 function drawBanner(g,tick=0){
  if(!g||api.getScene?.()!=='home'||!keepsake(saved(),day()))return;
  g.save();const x=557,y=264;
  g.fillStyle='#9a725b';g.fillRect(x-105,y-12,210,6);
  const shades=['#dba9b2','#ebc588','#9dc5ac','#99b6ce','#d2b5d6'];
  shades.forEach((color,i)=>{
   const xx=x-90+i*44;
   g.fillStyle=color;g.beginPath();g.moveTo(xx-13,y);g.lineTo(xx+13,y);g.lineTo(xx+13,y+31);
   g.lineTo(xx,y+42+Math.sin(tick*1.5+i)*1.5);g.lineTo(xx-13,y+31);g.closePath();g.fill();
   g.fillStyle='#fef2de';g.fillRect(xx-3,y+10,6,6);
  });
  g.font='bold 11px monospace';g.textAlign='center';g.fillStyle='#805e56';g.fillText('HOME TOGETHER',x,y-22);
  g.restore();
 }
 function handle(act,id){
  if(act==='ph276-plan')return plan(id);
  if(act==='ph276-cancel'){cancel();return api.openBook?.()}
  return false;
 }
 return {clean,keepsake,canPlan,plan,cancel,complete,profile,panel,pose,drawBanner,handle,get pending(){return project()}};
}
root.HearthPipHomeHelp={setup,clean,keepsake,TASKS};
})(window);
