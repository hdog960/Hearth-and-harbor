/* Hearth & Harbor v2.9.3 — Pip Comes to You.
 * A child's in-world approach to their chosen guardian, not a virtual
 * reward or another menu. Reuses the actual obstacle-safe v2.9.1 walker.
 * Exactly one gentle opportunity a day, no forced modal or daily penalty.
 */
(function(root){'use strict';
const finite=Number.isFinite,dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const OFFSETS=[[-67,49],[69,48],[-63,-41],[67,-41],[0,78]];
const INTERESTS={read:'#9483af',tidy:'#b99172',meal:'#d0a074',hobby:'#bd88a8'};
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild();
 const day=()=>dayOK(state()?.day)?state().day:1,scene=()=>api.getScene?.();
 const guarded=()=>child()?.guardian==='player'&&dayOK(child()?.guardianDay)&&
   child().guardianDay<=day();
 let epoch=0,phase='idle',target=null,origin=null,stable=0,elapsed=0,
  stall=0,lastChild=null,attempts=0,offered=false,received=false,noticed=false,
  eligibilityWait=0,eligibility=false,accent='#93b8a0';
 const snapshot=x=>x&&finite(x.x)&&finite(x.y)?{x:x.x,y:x.y}:null;
 function resetDay(){
  const d=day();
  if(d!==epoch){epoch=d;phase='idle';target=null;origin=null;stable=0;
   elapsed=0;stall=0;lastChild=null;attempts=0;offered=false;received=false;noticed=false;
   eligibilityWait=0;eligibility=false;accent='#93b8a0'}
 }
 function clear(keepOffered=false){
  phase='idle';target=null;origin=null;stable=0;elapsed=0;stall=0;lastChild=null;
  if(keepOffered)offered=true;
 }
 function suitable(){
  const minute=Number(state()?.minute);
  return guarded()&&scene()==='home'&&finite(minute)&&minute>=720&&minute<990&&
    eligibility&&!api.isPaused?.()&&!api.isPlayerMoving?.()&&
    !api.isChildOccupied?.();
 }
 function spot(player,from){
  let best=null,score=Infinity;
  for(const [dx,dy] of OFFSETS){
   const ideal={x:player.x+dx,y:player.y+dy};
   const p=api.nearestWalkable?.(ideal,'home');
   if(!snapshot(p)||dist(p,ideal)>38||dist(p,player)>112||dist(p,player)<33||
      api.isWalkable?.(p.x,p.y,'home')!==true)continue;
   const cost=dist(from,p)+dist(ideal,p)*3;
   if(cost<score){best={x:p.x,y:p.y};score=cost}
  }
  return best;
 }
 function advance(dt){
  resetDay();
  if(scene()!=='home'||!guarded()){clear();return}
  if(!finite(dt)||dt<=0||api.isPaused?.())return;
  const step=Math.min(dt,.16),p=snapshot(api.getPlayer?.()),c=snapshot(api.getChildPosition?.());
  // Check the slightly more expensive real household/furniture eligibility
  // only ~1.5 times/second, not on every iPhone animation frame.
  eligibilityWait-=step;
  if(eligibilityWait<=0){
   eligibility=api.getCanOffer?.()===true;
   eligibilityWait=.65;
  }
  if(!p||!c){clear();return}
  if(phase==='idle'){
   if(offered||attempts>=2||!suitable())return;
   if(!origin||dist(p,origin)>5){origin=p;stable=0;return}
   stable+=step;
   if(stable<.9||dist(p,c)>375)return;
   const to=spot(p,c);
   if(!to){attempts++;stable=0;return}
   // Start ONLY at a genuine reachable world position. The shared
   // child-home walker owns routefinding and segment collision checks.
   target=to;phase='approaching';elapsed=0;stall=0;lastChild=c;attempts++;
   accent=INTERESTS[api.getInterest?.()?.kind]||'#93b8a0';
   return;
  }
  if(!suitable()||!target||!origin||dist(p,origin)>30){
   clear();return;
  }
  elapsed+=step;
  if(phase==='approaching'){
   const moved=lastChild?dist(c,lastChild):0;
   if(moved>1.2)stall=0;
   else stall+=step;
   lastChild=c;
   if(dist(c,target)<36&&dist(c,p)<=113){
    phase='near';elapsed=0;offered=true;
    if(!noticed){
     noticed=true;
     api.notify?.('🌱 Pip came over with an idea! Tap Pip to hear it, or carry on with your day.');
    }
    return;
   }
   if(stall>3.5||elapsed>9.5){
    // On an unwalkable route do not pretend Pip arrived or move them
    // by teleport. The child can still be visited manually as before.
    clear(true);return;
   }
  }else if(phase==='near'){
   if(dist(c,p)>130||elapsed>9){clear(true)}
  }
 }
 function schedule(base){
  resetDay();
  if(!base||base.scene!=='home'||base.project||base.mentorVisit||
   !target||(phase!=='approaching'&&phase!=='near'))return base;
  return {...base,x:target.x,y:target.y,moving:false,
   label:phase==='near'?'Pip would like to talk to Poppy':'Pip is walking over to Poppy',
   note:'A personal idea, not a required task or automatic reward',
   prop:null,icon:'🌱'};
 }
 function isNear(){return phase==='near'&&!!target}
 function status(){
  resetDay();
  return {phase,near:isNear(),walking:phase==='approaching',
   target:target?{...target}:null,offered,received};
 }
 function interacted(){
  resetDay();
  if(phase!=='near'&&phase!=='approaching')return false;
  received=true;clear(true);return true;
 }
 function draw(g,pos,tick=0){
  if(!g||!pos||!finite(pos.x)||!finite(pos.y)||!isNear()||
    scene()!=='home'||!guarded())return false;
  const x=Math.round(pos.x+21),y=Math.round(pos.y-133+Math.sin(tick*2)*2);
  g.save();
  g.fillStyle='#75645a';g.fillRect(x-1,y-2,34,27);
  g.fillStyle='#fff2d9';g.fillRect(x+2,y,28,22);
  g.fillStyle='#75645a';g.fillRect(x+7,y+24,7,6);
  g.fillStyle=accent;
  g.fillRect(x+7,y+5,9,11);
  g.fillStyle='#edc18b';g.fillRect(x+19,y+5,7,7);
  g.fillStyle='#aa8f88';g.fillRect(x+19,y+16,7,2);
  g.restore();return true;
 }
 return {advance,schedule,draw,interacted,isNear,status,spot,
  get phase(){return phase},get attempts(){return attempts}};
}
root.HearthPipApproaches={setup,OFFSETS};
})(window);
