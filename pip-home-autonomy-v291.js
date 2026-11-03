/* Hearth & Harbor v2.9.1 — Pip's Living Cottage Day.
 * The original clock-based itinerary remains the source of WHAT Pip does.
 * This actor provides WHERE and HOW: real, segment-checked home navigation
 * with animation derived from distance genuinely walked, not interpolation
 * through user-placed furniture. No new save fields or passive progression.
 */
(function(root){'use strict';
const finite=Number.isFinite;
const dayOK=d=>Number.isInteger(d)&&d>=1&&d<=9999;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),scene=()=>api.getScene?.();
 const owned=()=>child()?.guardian==='player'&&dayOK(child()?.guardianDay)&&
   child().guardianDay<=state().day;
 let actor=null,route=[],goal=null,repath=0,sceneEpoch='',planned=0;
 function walkable(p){
  return !!p&&finite(p.x)&&finite(p.y)&&api.isWalkable?.(p.x,p.y,'home')===true;
 }
 function reachable(p,limit=95){
  if(!p||!finite(p.x)||!finite(p.y))return null;
  const at=api.nearestWalkable?.(p,'home');
  if(!walkable(at)||dist(at,p)>limit)return null;
  return {x:at.x,y:at.y};
 }
 function valid(){
  return owned()&&scene()==='home'&&!!api.getSchedule?.();
 }
 function clear(){
  actor=null;route=[];goal=null;repath=0;sceneEpoch='';return false;
 }
 function interrupted(){
  const p=api.getOverridePose?.();
  return p&&finite(p.x)&&finite(p.y)?p:null;
 }
 function isSpecial(base){
  // Stage-three self-directed dream work is part of Pip's ordinary real
  // cottage route. Preserve existing child-led sessions and mentor visits.
  return !!(base?.mentorVisit||api.isChildSessionActive?.()||
   (base?.project&&base.growthStage!==3));
 }
 function sync(p){
  const at=reachable(p,110);
  if(!at)return false;
  actor={...at,day:state().day,scene:'home',moving:false,facing:'front',
   stride:actor?.stride||0,label:'Settling into the cottage'};
  route=[];goal=null;repath=0;return true;
 }
 function ensure(){
  if(!valid()){clear();return null}
  const base=api.getSchedule(),epoch='home:'+state().day;
  if(!actor||sceneEpoch!==epoch){
   sceneEpoch=epoch;planned=0;
   // First appearance / genuine change of scene uses today's established
   // default safe routine. Subsequent motion is entirely path-based.
   const pos=reachable(base,130);
   if(!pos){actor=null;return null}
   actor={...pos,day:state().day,scene:'home',moving:false,
    facing:base.facing||'front',stride:0};
   route=[];goal=null;repath=0;
  }
  return actor;
 }
 function routeTo(from,to){
  const raw=api.findPath?.({x:from.x,y:from.y},{x:to.x,y:to.y},'home');
  if(!Array.isArray(raw)||!raw.length||raw.length>180)return [];
  const points=[];
  for(const p of raw){
   if(!walkable(p))return [];
   if(!points.length||dist(p,points[points.length-1])>2)points.push({x:p.x,y:p.y});
  }
  // The base game's BFS may return the closest reachable grid node when
  // a target is obstructed. Never mislabel that as arrival.
  if(!points.length||dist(points[points.length-1],to)>35)return [];
  return points;
 }
 function safeSegment(a,b){
  if(!walkable(a)||!walkable(b))return false;
  const n=Math.max(1,Math.ceil(dist(a,b)/10));
  for(let i=1;i<=n;i++){
   const p={x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n};
   if(!walkable(p))return false;
  }
  return true;
 }
 function advance(dt){
  if(!valid()){clear();return}
  const a=ensure();if(!a)return;
  const actual=interrupted(),base=api.getSchedule();
  if(actual){
   // The established real household hold / guest / ritual owns the sprite.
   // Follow its physical endpoint so returning to the normal day does
   // not snap Pip back to an old schedule position.
   sync(actual);return;
  }
  if(isSpecial(base)){sync(base);return}
  if(!finite(dt)||dt<=0||api.isPaused?.()){a.moving=false;return}
  // Furniture may be placed exactly where Pip was standing. Reposition
  // minimally to a verified open tile, rather than staying inside the item.
  if(!walkable(a)){
   const open=reachable(a,85);
   if(!open){a.moving=false;route=[];goal=null;return}
   a.x=open.x;a.y=open.y;route=[];goal=null;repath=0;
  }
  const target=reachable(base,120);
  if(!target){a.moving=false;route=[];return}
  a.label=base.label;
  a.icon=base.icon;
  a.prop=base.prop;
  a.note=base.note;
  a.slot=base.slot;
  a.next=base.next;
  a.nextAt=base.nextAt;
  if(dist(a,target)<9){a.moving=false;route=[];goal=target;return}
  repath-=Math.min(dt,.3);
  if(!goal||dist(goal,target)>37||repath<=0){
   route=routeTo(a,target);
   goal=target;
   repath=.65;planned++;
  }
  let budget=Math.min(dt,.16)*155,travel=0;
  for(let i=0;i<4&&route.length&&budget>0;i++){
   const p=route[0],here={x:a.x,y:a.y},d=dist(here,p);
   if(d<2.5){route.shift();continue}
   const step=Math.min(budget,d);
   const next={x:here.x+(p.x-here.x)*step/d,y:here.y+(p.y-here.y)*step/d};
   if(!safeSegment(here,next)){route=[];repath=.65;break}
   a.x=next.x;a.y=next.y;a.stride+=step/18;
   a.facing=p.y-here.y< -11?'back':Math.abs(p.x-here.x)>=Math.abs(p.y-here.y)?'side':'front';
   travel+=step;budget-=step;
   if(step>=d-1)route.shift();
  }
  a.moving=travel>1;
 }
 function pose(){
  if(!valid()||isSpecial(api.getSchedule?.())||interrupted())return null;
  const a=ensure();
  if(!a)return null;
  const base=api.getSchedule();
  // Return a snapshot; consumers must not mutate our authoritative actor.
  return {...base,x:a.x,y:a.y,moving:a.moving,facing:a.facing,stride:a.stride,
   label:a.label||base.label,icon:a.icon||base.icon,prop:a.prop||base.prop,
   note:a.note||base.note};
 }
 function status(){
  const a=pose();
  if(!a)return null;
  return {walking:!!a.moving,label:a.label||'Enjoying the cottage',
   destination:goal?{...goal}:null,kind:a.prop||null,position:{x:a.x,y:a.y}};
 }
 return {advance,pose,status,clear,routeTo,safeSegment,reachable,
  get planned(){return planned},get actor(){return actor?{...actor}:null}};
}
root.HearthPipHomeAutonomy={setup};
})(window);
