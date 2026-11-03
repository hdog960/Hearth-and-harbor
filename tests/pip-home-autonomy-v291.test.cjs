/* Hearth & Harbor v2.9.1 — Pip actually walks between real cottage routines */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
  fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
vm.runInNewContext(read('pip-home-autonomy-v291.js'),env,{filename:'pip-home-autonomy-v291.js'});
const M=env.window.HearthPipHomeAutonomy,plain=x=>JSON.parse(JSON.stringify(x));
function fixture({guardian=true,day=10,scene='home',start={x:700,y:850},
  target={x:450,y:850},wall=()=>false,pathFn=null}={}){
 const child={guardian:guardian?'player':null,guardianDay:4,
  needs:{confidence:55,joy:60,curiosity:57},homeHelps:[]};
 const state={day,minute:760,coins:350,relations:{mabel:12},youngResidents:{pip:child}};
 let where=scene,paused=false,schedule={scene:'home',slot:2,x:start.x,y:start.y,
  label:'Creative afternoon',prop:'crayon',icon:'🎨',moving:true},
   override=null,activity=false,obstacle=wall,pathCalls=0,nearestCalls=0,history=[];
 const walkable=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)&&x>=225&&x<=947&&y>=270&&y<=1055&&!obstacle(x,y);
 const nearest=(p)=>{
  nearestCalls++;
  if(walkable(p.x,p.y))return {...p};
  for(const r of [30,45,65,80,95,130])for(const dx of [-r,0,r])for(const dy of [-r,0,r]){
   const c={x:p.x+dx,y:p.y+dy};if(walkable(c.x,c.y))return c;
  }
  return null;
 };
 const api={getState:()=>state,getChild:()=>child,getScene:()=>where,
  getSchedule:()=>({...schedule}),getOverridePose:()=>override,
  isChildSessionActive:()=>activity,
  isPaused:()=>paused,
  isWalkable:(x,y)=>walkable(x,y),
  nearestWalkable:nearest,
  findPath:(a,b,w)=>{pathCalls++;history.push({a:{...a},b:{...b},w});
   return pathFn?pathFn(a,b):[{...b}];}
 };
 const m=M.setup(api);
 return {m,api,state,child,get schedule(){return schedule},
  get pathCalls(){return pathCalls},get nearestCalls(){return nearestCalls},get history(){return history},
  setScene:s=>where=s,setDay:d=>state.day=d,setMinute:n=>state.minute=n,
  setSchedule:p=>schedule={...schedule,...p},setPaused:b=>paused=b,
  setOverride:p=>override=p,setActivity:b=>activity=b,
  setWall:fn=>obstacle=fn,walkable,
  step:(dt=.05,count=1)=>{for(let i=0;i<count;i++)m.advance(dt)}};
}
test('the new module is available and never requires another save field',()=>{
 const f=fixture();
 assert.ok(M?.setup);assert.equal(f.child.guardian,'player');
 assert.equal(f.child.homeRhythms,undefined);assert.equal(f.child.homeAutonomy,undefined);
 assert.equal(f.pathCalls,0);
});
test('a non-guardian cannot conjure Pip inside the cottage',()=>{
 const f=fixture({guardian:false});f.step(.1,10);
 assert.equal(f.m.pose(),null);assert.equal(f.m.actor,null);
 assert.equal(f.pathCalls,0);
});
test('the existing daily schedule remains the authority for activity, words and prop',()=>{
 const f=fixture();
 const p=f.m.pose();assert.equal(p.label,'Creative afternoon');
 assert.equal(p.prop,'crayon');assert.equal(p.icon,'🎨');
 assert.equal(p.x,700);assert.equal(p.y,850);
 f.setSchedule({x:450,y:850,label:'Little Storykeeper · reading',prop:'book',icon:'📚'});
 f.step(.05,12);
 const q=f.m.pose();assert.equal(q.label,'Little Storykeeper · reading');
 assert.equal(q.prop,'book');assert.equal(q.icon,'📚');
 assert.equal(f.schedule.x,450,'original routine calculation is untouched');
});
test('Pip walks across a valid room at a real bounded speed instead of teleporting',()=>{
 const f=fixture();f.setSchedule({x:450,y:850,moving:true});f.step(.1);
 const p=f.m.pose();
 assert.ok(p.x<700&&p.x>650);
 assert.equal(p.moving,true);assert.equal(p.facing,'side');
 assert.ok(p.stride>0);assert.equal(p.y,850);
});
test('the child uses 2 walking sprite frames derived from actual steps',()=>{
 const f=fixture();f.setSchedule({x:450,y:850});
 f.step(.1,2);const p=f.m.pose();
 assert.ok([0,1].includes(Math.floor(p.stride)%2));
 assert.ok(p.stride>0);
 f.step(.1,2);assert.ok(f.m.pose().stride>p.stride);
});
test('small frame steps converge and settle with a true stationary prop',()=>{
 const f=fixture();f.setSchedule({x:450,y:850,moving:true});
 f.step(.05,70);
 const p=f.m.pose();
 assert.ok(Math.hypot(p.x-450,p.y-850)<9);
 assert.equal(p.moving,false);
 assert.equal(p.prop,'crayon');
 const before=p.stride;f.step(.1,4);assert.equal(f.m.pose().stride,before);
});
test('unreachable direct shortcut stops at the building rather than clipping through it',()=>{
 const wall=(x,y)=>x>540&&x<590&&y>735&&y<900;
 const f=fixture({wall});f.setSchedule({x:450,y:850});
 for(let i=0;i<100;i++){
  f.step(.05);const p=f.m.pose();
  assert.equal(wall(p.x,p.y),false,'solid scenery must not be crossed');
 }
 assert.ok(f.m.pose().x>=590,'no teleport through the room partition');
 assert.ok(f.pathCalls<16,'do not pathfind on every animation frame');
});
test('a genuine detour lets Pip walk around a wall and eventually reach the book',()=>{
 const wall=(x,y)=>x>540&&x<590&&y>735&&y<900;
 const detour=(a,b)=>{
  if(a.x>=590&&a.y>726)return [{x:a.x,y:715},{x:520,y:715},{...b}];
  if(a.x>520)return [{x:520,y:715},{...b}];
  return [{...b}];
 };
 const f=fixture({wall,pathFn:detour});f.setSchedule({x:450,y:850,prop:'book'});
 let arrived=false;
 for(let i=0;i<220;i++){
  f.step(.05);const p=f.m.pose();
  assert.equal(wall(p.x,p.y),false,'all interpolated steps respect walls');
  if(Math.hypot(p.x-450,p.y-850)<9){arrived=true;break}
 }
 assert.equal(arrived,true,'a real obstacle detour must reach the destination');
 assert.ok(f.m.pose().stride>12);
});
test('even a pathfinder returning an incorrect diagonal cannot cross solid scenery',()=>{
 const wall=(x,y)=>x>540&&x<590&&y>735&&y<900;
 const f=fixture({wall});
 f.setSchedule({x:450,y:850});
 for(let i=0;i<100;i++){f.step(.05);const p=f.m.pose();assert.equal(wall(p.x,p.y),false)}
});
test('a malicious route ending far from the target is not treated as arrival',()=>{
 const f=fixture({pathFn:(a,b)=>[{x:a.x-20,y:a.y-20}]});
 f.setSchedule({x:450,y:850});
 f.step(.1,40);
 assert.equal(f.m.pose().x,700);
 assert.equal(f.m.pose().y,850);
});
test('a huge slow-phone frame delta cannot skip through furniture',()=>{
 const f=fixture();f.setSchedule({x:450,y:850});f.step(4);
 const p=f.m.pose();assert.ok(Math.hypot(p.x-700,p.y-850)<=25);
});
test('real conversations and menus freeze Pip instead of walking while player is paused',()=>{
 const f=fixture();f.setSchedule({x:450,y:850});f.setPaused(true);
 f.step(.05,30);assert.equal(f.m.pose().x,700);
 assert.equal(f.m.pose().moving,false);assert.equal(f.pathCalls,0);
 f.setPaused(false);f.step(.1,4);assert.ok(f.m.pose().x<700);
});
test('other child-owned family activities take priority without battling for the sprite',()=>{
 const f=fixture();f.setSchedule({x:450,y:850,project:true});f.step(.1,8);
 assert.equal(f.m.pose(),null);
 f.setSchedule({project:false,x:380,y:850});f.step(.1);
 assert.ok(f.m.pose());assert.ok(f.m.pose().x>=350);
});
test('real child activity sessions interrupt independent schedule movement',()=>{
 const f=fixture();f.setActivity(true);f.step(.1,10);
 assert.equal(f.m.pose(),null);
 f.setActivity(false);f.step(.1);assert.ok(f.m.pose());
});
test('home-help, family ritual and visiting adult positions override the independent child',()=>{
 const f=fixture();f.setSchedule({x:450,y:850});
 f.step(.05,2);f.setOverride({x:550,y:720});
 f.step(.05);assert.equal(f.m.pose(),null);
 assert.equal(f.m.actor.x,550);assert.equal(f.m.actor.y,720);
 f.setOverride(null);f.step(.05);
 const p=f.m.pose();assert.ok(Math.hypot(p.x-550,p.y-720)<20,
  'continue from last genuine shared experience, not an earlier ghost location');
});
test('a destination moved by new furniture becomes a safe nearby walkable tile',()=>{
 const f=fixture({wall:(x,y)=>x>430&&x<460&&y>825&&y<875});
 f.setSchedule({x:450,y:850});
 f.step(.1,10);const p=f.m.pose();
 assert.equal(f.walkable(p.x,p.y),true);
 assert.ok(f.nearestCalls>0);
});
test('placing furniture on the current position moves Pip minimally to an actual open tile',()=>{
 const f=fixture();f.step(.05);
 f.setWall((x,y)=>x>680&&x<720&&y>830&&y<870);
 f.setSchedule({x:450,y:850});
 f.step(.05);
 const p=f.m.pose();assert.equal(f.walkable(p.x,p.y),true);
 assert.ok(Math.hypot(p.x-700,p.y-850)<=85);
});
test('a completely blocked house keeps Pip stopped instead of inventing a position',()=>{
 const f=fixture();f.setWall(()=>true);f.setSchedule({x:450,y:850});
 f.step(.1);
 assert.equal(f.m.pose().moving,false);
 assert.equal(f.pathCalls,0);
});
test('leaving the cottage removes the temporary actor immediately',()=>{
 const f=fixture();f.step(.1);f.setScene('town');f.step(.1);
 assert.equal(f.m.pose(),null);assert.equal(f.m.actor,null);
});
test('re-entering after a genuine scene change safely starts a new current-day appearance',()=>{
 const f=fixture();f.setSchedule({x:450,y:850});f.step(.1,4);
 assert.ok(f.m.pose().x<700);
 f.setScene('town');f.step(.1);
 f.setScene('home');f.setSchedule({x:430,y:750});f.step(.05);
 assert.ok(Math.hypot(f.m.pose().x-430,f.m.pose().y-750)<10);
});
test('a new in-game day uses the updated timetable rather than a stale previous-day route',()=>{
 const f=fixture();f.setSchedule({x:450,y:850});f.step(.1,6);
 f.setDay(11);f.setSchedule({x:765,y:756,slot:0,label:'Quiet rest'});
 f.step(.05);
 assert.equal(f.m.pose().label,'Quiet rest');
 assert.ok(Math.hypot(f.m.pose().x-765,f.m.pose().y-756)<9);
});
test('a changing schedule re-routes without pathfinding on every iPhone frame',()=>{
 const f=fixture();f.setSchedule({x:450,y:850});
 f.step(1/60,120);
 assert.ok(f.pathCalls>=2);
 assert.ok(f.pathCalls<=8,'routefinding should be capped to a few BFS calls in 2 seconds');
 f.setSchedule({x:430,y:740});f.step(.05);
 assert.ok(f.pathCalls<=9);
});
test('invalid schedule coordinates do not move or teleport the child',()=>{
 const f=fixture();f.setSchedule({x:NaN,y:NaN});
 f.step(.1,10);assert.equal(f.m.pose().x,700);
 assert.equal(f.m.pose().y,850);
});
test('read-only poses and panels cannot mutate saved needs, memories or coins',()=>{
 const f=fixture(),saved=plain(f.child),before=f.state.coins;
 f.setSchedule({x:450,y:850});
 for(let i=0;i<50;i++){f.step(.05);f.m.pose();f.m.status()}
 assert.deepEqual(plain(f.child),saved);assert.equal(f.state.coins,before);
});
test('a copy of the pose cannot corrupt the internal authoritative child',()=>{
 const f=fixture();const p=f.m.pose();p.x=12345;p.label='bad';
 assert.equal(f.m.pose().x,700);
 assert.notEqual(f.m.pose().label,'bad');
});
test('the original home schedule and character personality are truly integrated',()=>{
 const little=read('little-sprouts-v272.js'),html=read('index.html'),sw=read('sw.js'),
 game=read('game.js'),css=read('pip-home-autonomy-v291.css');
 assert.ok(html.includes('pip-home-autonomy-v291.js?v=2.9.1'));
 assert.ok(html.includes('pip-home-autonomy-v291.css?v=2.9.1'));
 assert.ok(html.indexOf('pip-home-autonomy-v291.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(sw,/hearth-harbor-v291-living-cottage-day/);
 for(const a of ['pip-home-autonomy-v291.js','pip-home-autonomy-v291.css'])
  assert.ok(sw.includes("'./"+a+"'"));
 assert.match(little,/const homeAutonomy=root\.HearthPipHomeAutonomy\?\.setup/);
 assert.match(little,/homeAutonomy\.advance\(dt\)/);
 assert.match(little,/const steps=homeAutonomy\.status\(\)/);
 assert.match(little,/homeAutonomy\.pose\(\)\|\|routines\.location\(\)/);
 assert.match(little,/!routine\.moving\)routines\.drawProp/);
 assert.match(game,/Number\.isFinite\(routine\.stride\)\?Math\.floor\(routine\.stride\)%2/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/@media\(max-width:380px\)/);
});
test('no new timers, localStorage keys, web calls, art downloads or passive rewards',()=>{
 const code=read('pip-home-autonomy-v291.js');
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
 assert.doesNotMatch(code,/coins\s*\+=|needs\.[a-z]+\s*\+=/);
});
