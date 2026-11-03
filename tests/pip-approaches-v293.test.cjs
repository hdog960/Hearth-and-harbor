/* Hearth & Harbor v2.9.3 — an actual child walks over, not a new reward */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
vm.runInNewContext(read('pip-approaches-v293.js'),env,{filename:'pip-approaches-v293.js'});
const A=env.window.HearthPipApproaches;
const plain=x=>JSON.parse(JSON.stringify(x));
function fixture({day=12,minute=780,scene='home',guardian=true,
 player={x:650,y:730},child={x:760,y:820},eligible=true,occupied=false,
 paused=false,moving=false,blocked=false,kind='read'}={}){
 const kid={guardian:guardian?'player':null,guardianDay:guardian?3:0,
  needs:{joy:63,confidence:52,curiosity:56},childInitiatives:{records:[],leadDays:0,learnDays:0}};
 const state={day,minute,youngResidents:{pip:kid},coins:400,relations:{mabel:17}};
 let where=scene,pp={...player},cc={...child},can=eligible,
  busy=occupied,pause=paused,travel=moving,blockedFloor=blocked,canChecks=0,
  nearestCalls=0,notices=[],interest=kind;
 const api={getState:()=>state,getChild:()=>kid,getScene:()=>where,
  getPlayer:()=>({...pp}),getChildPosition:()=>cc?{...cc}:null,
  getCanOffer:()=>{canChecks++;return can},
  getInterest:()=>({kind:interest}),
  isPaused:()=>pause,isPlayerMoving:()=>travel,isChildOccupied:()=>busy,
  nearestWalkable:p=>{nearestCalls++;return blockedFloor?null:{...p}},
  isWalkable:(x,y)=>!blockedFloor&&Number.isFinite(x)&&Number.isFinite(y),
  notify:s=>notices.push(s)};
 const m=A.setup(api);
 const base={scene:'home',x:cc?.x||750,y:cc?.y||800,label:'Pip’s normal scheduled activity',prop:'crayon'};
 return {m,api,state,kid,base,notices,
  get canChecks(){return canChecks},get nearestCalls(){return nearestCalls},
  get child(){return cc},get player(){return pp},
  setDay:d=>state.day=d,setMinute:t=>state.minute=t,setScene:s=>where=s,
  setChild:(x,y)=>cc={x,y},removeChild:()=>cc=null,
  setPlayer:(x,y)=>pp={x,y},setEligible:b=>can=b,setBusy:b=>busy=b,
  setPaused:b=>pause=b,setMoving:b=>travel=b,
  setBlocked:b=>blockedFloor=b,setInterest:x=>interest=x,
  step:(dt=.1,count=1)=>{for(let i=0;i<count;i++)m.advance(dt)},
  start(){for(let i=0;i<20&&m.phase==='idle';i++)m.advance(.1);return m.phase},
  arrive(){if(m.phase!=='approaching')throw Error('not walking');const t=m.status().target;
   cc={x:t.x,y:t.y};m.advance(.1);return m.phase}
 };
}
function picture(){const strokes=[],g={save(){},restore(){},fillStyle:null,fillRect(...x){strokes.push({color:this.fillStyle,x})}};return {g,strokes}}
test('no additional PWA currency, save property or network dependency',()=>{
 const f=fixture(),saved=plain(f.kid),money=f.state.coins;
 f.step(.1,20);
 assert.deepEqual(plain(f.kid),saved);assert.equal(f.state.coins,money);
 assert.doesNotMatch(read('pip-approaches-v293.js'),/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});
test('only a chosen guardian can receive a child-initiated approach',()=>{
 const f=fixture({guardian:false});f.step(.1,40);
 assert.equal(f.m.phase,'idle');assert.equal(f.m.status().target,null);
 assert.equal(f.notices.length,0);
});
test('the existing child proposal, not a fabricated new task, gates a walk',()=>{
 const f=fixture({eligible:false});f.step(.1,40);
 assert.equal(f.m.phase,'idle');assert.equal(f.m.attempts,0);
 f.setEligible(true);assert.equal(f.start(),'approaching');
});
test('approaches occur during a quiet real cottage afternoon, not overnight',()=>{
 for(const minute of [0,300,719,990,1340]){
  const f=fixture({minute});f.step(.1,40);assert.equal(f.m.phase,'idle',String(minute));
 }
 const f=fixture({minute:720});assert.equal(f.start(),'approaching');
});
test('Poppy must stop moving before Pip starts independently walking over',()=>{
 const f=fixture({moving:true});f.step(.1,25);
 assert.equal(f.m.phase,'idle');
 f.setMoving(false);f.step(.1,4);assert.equal(f.m.phase,'idle');
 assert.equal(f.start(),'approaching');
});
test('Pip does not begin a cross-house chase from an unreasonable distance',()=>{
 const f=fixture({child:{x:1600,y:1800}});f.step(.1,40);
 assert.equal(f.m.phase,'idle');assert.equal(f.m.attempts,0);
 f.setChild(760,820);assert.equal(f.start(),'approaching');
});
test('a real family activity, guest or Poppy Daybook action cancels the approach',()=>{
 const f=fixture();f.start();f.setBusy(true);f.step(.1);
 assert.equal(f.m.phase,'idle');
 f.setBusy(false);assert.equal(f.start(),'approaching');
});
test('a paused modal or conversation never forces the child to walk',()=>{
 const f=fixture({paused:true});f.step(.1,35);
 assert.equal(f.m.phase,'idle');
 f.setPaused(false);assert.equal(f.start(),'approaching');
 f.setPaused(true);f.step(.1,15);
 assert.equal(f.m.phase,'approaching','a paused game freezes movement state safely');
});
test('child actor must exist physically before an approach can start',()=>{
 const f=fixture();f.removeChild();f.step(.1,25);
 assert.equal(f.m.phase,'idle');assert.equal(f.notices.length,0);
 f.setChild(760,820);assert.equal(f.start(),'approaching');
});
test('the proposed position is a verified walkable tile adjacent to Poppy',()=>{
 const f=fixture();f.start();const t=f.m.status().target;
 assert.ok(t&&Number.isFinite(t.x)&&Number.isFinite(t.y));
 assert.ok(Math.hypot(t.x-f.player.x,t.y-f.player.y)<113);
 assert.ok(Math.hypot(t.x-f.player.x,t.y-f.player.y)>32);
});
test('the child reuses original schedule and physical cottage walker',()=>{
 const f=fixture();f.start();const at=f.m.status().target;
 const applied=f.m.schedule(f.base);
 assert.equal(applied.x,at.x);assert.equal(applied.y,at.y);
 assert.match(applied.label,/walking over to Poppy/);
 assert.equal(f.base.x,760,'no mutation of original schedule');
 assert.equal(applied.prop,null,'do not carry a floating activity prop while approaching');
});
test('a true in-world arrival is required; setting the schedule grants no conversation',()=>{
 const f=fixture();f.start();f.step(.1,8);
 assert.equal(f.m.phase,'approaching');
 assert.equal(f.m.isNear(),false);assert.equal(f.notices.length,0);
 assert.equal(f.m.interacted(),true,'players may still manually tap Pip during the walk');
 assert.equal(f.notices.length,0,'manual tap is not an automatic reward');
});
test('Pip actually reaching the target produces one optional toast and original world hint',()=>{
 const f=fixture();f.start();assert.equal(f.arrive(),'near');
 assert.equal(f.m.isNear(),true);
 assert.equal(f.notices.length,1);
 assert.match(f.notices[0],/Tap Pip/);
 const pic=picture();assert.equal(f.m.draw(pic.g,f.child,1.3),true);
 assert.ok(pic.strokes.length>=6);
});
test('a genuine arrival leaves the gameplay button to the player instead of opening a modal',()=>{
 const f=fixture();f.start();f.arrive();
 assert.equal(f.m.status().near,true);
 assert.equal(f.m.status().received,false);
 assert.equal(f.m.interacted(),true);
 assert.equal(f.m.status().phase,'idle');
 assert.equal(f.m.status().received,true);
});
test('the world cue disappears after the player responds',()=>{
 const f=fixture();f.start();f.arrive();
 f.m.interacted();
 assert.equal(f.m.draw(picture().g,f.child,2),false);
 assert.equal(f.m.schedule(f.base),f.base);
});
test('ignoring Pip is safe and they return to their original routine without penalty',()=>{
 const f=fixture();f.start();f.arrive();
 f.step(.1,100);
 assert.equal(f.m.phase,'idle');
 assert.equal(f.m.status().offered,true);
 assert.equal(f.m.schedule(f.base),f.base);
 assert.equal(f.state.coins,400);
});
test('one completed walk per day prevents repeated unsolicited approaches',()=>{
 const f=fixture();f.start();f.arrive();f.step(.1,100);
 f.step(.1,80);
 assert.equal(f.m.phase,'idle');assert.equal(f.m.attempts,1);
 assert.equal(f.notices.length,1);
});
test('a new in-game day permits a new voluntary approach',()=>{
 const f=fixture();f.start();f.arrive();f.step(.1,100);
 f.setDay(13);f.step(.1);
 assert.equal(f.m.status().offered,false);
 assert.equal(f.start(),'approaching');
});
test('changing scenes immediately clears an unfinished cottage approach',()=>{
 const f=fixture();f.start();f.setScene('town');f.step(.1);
 assert.equal(f.m.phase,'idle');assert.equal(f.m.schedule(f.base),f.base);
});
test('player movement interrupts an approach rather than pulling Pip through a room',()=>{
 const f=fixture();f.start();f.setMoving(true);f.step(.1);
 assert.equal(f.m.phase,'idle');assert.equal(f.m.status().target,null);
});
test('Poppy walking away without a new tap safely cancels the route',()=>{
 const f=fixture();f.start();f.setPlayer(900,920);f.step(.1);
 assert.equal(f.m.phase,'idle');
});
test('a route that never reaches the child goal times out and never teleports Pip',()=>{
 const f=fixture();f.start();const from={...f.child};
 f.step(.1,45);
 assert.equal(f.m.phase,'idle');
 assert.deepEqual(f.child,from);
 assert.equal(f.notices.length,0);
});
test('blocked floor suppresses all attempts and no virtual child is created',()=>{
 const f=fixture({blocked:true});f.step(.1,25);
 assert.equal(f.m.phase,'idle');assert.ok(f.m.attempts<=2);
 assert.equal(f.notices.length,0);
});
test('each real interest has its own hand-drawn color, without external images',()=>{
 const colors=[];
 for(const kind of ['read','tidy','meal','hobby']){
  const f=fixture({kind});f.start();f.arrive();
  const p=picture();f.m.draw(p.g,f.child,2);
  colors.push(p.strokes[3].color);
 }
 assert.equal(new Set(colors).size,4);
});
test('large slow phone frames cannot skip the gentle stationary check',()=>{
 const f=fixture();f.step(5);
 assert.equal(f.m.phase,'idle');
 f.step(5);
 assert.equal(f.m.phase,'idle');
});
test('expensive household and furniture checks are throttled rather than done each frame',()=>{
 const f=fixture();f.step(1/60,120);
 assert.ok(f.canChecks>=2);
 assert.ok(f.canChecks<=8,'no 60 fps furniture search loops');
});
test('the real world module does not implement a duplicate BFS movement engine',()=>{
 const code=read('pip-approaches-v293.js');
 assert.doesNotMatch(code,/findPath\(|routeTo\(|safeSegment\(/);
 assert.match(code,/schedule\(base\)/);
 const little=read('little-sprouts-v272.js');
 assert.match(little,/getSchedule:\(\)=>approaches\.schedule\(initiatives\.schedule\(routines\.location\(\)\)\)/);
 assert.match(little,/approaches\.advance\(dt\);homeAutonomy\.advance\(dt\)/);
});
test('iPhone Home Screen loads all updated scripts in correct order and cache',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),
  little=read('little-sprouts-v272.js'),idea=read('pip-initiatives-v292.js'),
  css=read('pip-approaches-v293.css');
 assert.ok(html.includes('pip-approaches-v293.js?v=2.9.3'));
 assert.ok(html.includes('pip-approaches-v293.css?v=2.9.3'));
 assert.ok(html.includes('pip-initiatives-v292.js?v=2.9.3'));
 assert.ok(html.indexOf('pip-initiatives-v292.js')<html.indexOf('pip-approaches-v293.js'));
 assert.ok(html.indexOf('pip-approaches-v293.js')<html.indexOf('little-sprouts-v272.js'));
 assert.ok(html.includes('little-sprouts-v272.js?v=2.9.3'));
 assert.ok(html.includes('game.js?v=2.9.3'));
 for(const a of ['pip-approaches-v293.js','pip-approaches-v293.css'])
  assert.ok(sw.includes("'./"+a+"'"));
 assert.match(sw,/hearth-harbor-v293-pip-comes-to-you/);
 assert.match(game,/isPlayerMoving:\(\)=>!!player\.target/);
 assert.match(game,/littleSprouts\.approaches\.interacted\(\)/);
 assert.match(little,/approaches\.draw\(g,pos,tick\)/);
 assert.match(little,/isChildOccupied:\(\)=>!!session/);
 assert.match(idea,/function canOffer\(\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/@media\(max-width:380px\)/);
});
