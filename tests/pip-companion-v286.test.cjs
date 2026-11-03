/* Hearth & Harbor v2.8.6 — Pip's actual obstacle-aware companion locomotion */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
vm.runInNewContext(read('pip-neighbors-v275.js'),env,{filename:'pip-neighbors-v275.js'});
const P=env.window.HearthPipNeighbors;
const blocked=(x,y)=>x>580&&x<710&&y>600&&y<760;
function fixture(opts={}){
 const child={guardian:'player',guardianDay:3,meetings:[]},state={day:9,minute:830};
 let scene='home',player={x:765,y:756},pipHome={x:765,y:756},blockedModal=false;
 let pathCalls=0,notifications=[],saves=0,updates=0,book=0;
 let wall=opts.wall??(()=>false);
 const walkable=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)&&!wall(x,y);
 const rawPath=opts.path??((a,b)=>[{x:b.x,y:b.y}]);
 const api={getState:()=>state,getChild:()=>child,getScene:()=>scene,
  getPlayer:()=>({...player}),getAdults:()=>[],getChild:()=>child,
  isPlayerNearChild:d=>scene==='home'&&Math.hypot(player.x-pipHome.x,player.y-pipHome.y)<=d,
  goTown:()=>{scene='town';player={x:566,y:621}},
  nearestWalkable:p=>opts.nearest?.(p)??p,
  isWalkable:(x,y)=>walkable(x,y),
  findPath:(a,b)=>{pathCalls++;return rawPath(a,b)},
  isMovementBlocked:()=>blockedModal,notify:s=>notifications.push(s),
  updateUI:()=>updates++,openBook:()=>book++,save:()=>saves++};
 const n=P.setup(api);
 return {n,state,child,api,notices:notifications,get pathCalls(){return pathCalls},
 get updates(){return updates},get saves(){return saves},get book(){return book},
 get player(){return player},setPlayer:(x,y)=>player={x,y},
 setScene:s=>scene=s,setBlocked:v=>blockedModal=v,
 setWall:w=>wall=w,walkable};
}
test('real optional companion starts only after actual local guardian choice',()=>{
 const f=fixture();f.child.guardian=null;
 assert.equal(f.n.startWalk(),false);assert.equal(f.n.walkingNow(),false);
 assert.equal(f.saves,0);
});
test('an authentic cottage visit starts a real nonpersistent companion walk',()=>{
 const f=fixture();assert.equal(f.n.startWalk(),true);
 assert.equal(f.n.escortPose().x,528);assert.equal(f.n.escortPose().day,undefined);
 assert.equal(f.book,1);assert.equal(f.saves,0);
 assert.equal(f.n.escortPose().moving,false);assert.equal(f.n.escortPose().stride,0);
});
test('path updates only at bounded intervals while chasing a moving player',()=>{
 const f=fixture();f.n.startWalk();f.setPlayer(900,850);
 for(let i=0;i<120;i++)f.n.advance(1/60);
 assert.ok(f.pathCalls>1);
 assert.ok(f.pathCalls<15,'routefinding must stay throttled on iPhone');
 assert.ok(f.n.escortPose().stride>0);
 assert.ok(f.n.escortPose().x>600);
});
test('Pip can follow the true long detour around solid scenery',()=>{
 const route=(from,to)=>{
  if(from.x<585&&from.y<769)return [{x:540,y:785},{x:735,y:785},to];
  if(from.x<729)return [{x:735,y:785},to];
  return [to];
 };
 const f=fixture({wall:blocked,path:route});f.n.startWalk();f.setPlayer(805,700);
 let reached=false;
 for(let i=0;i<260;i++){
  f.n.advance(.05);
  const p=f.n.escortPose();
  assert.equal(blocked(p.x,p.y),false,'never clip through the house/fence');
  if(Math.hypot(p.x-770,p.y-726)<13){reached=true;break}
 }
 assert.equal(reached,true,'Pip should navigate around the barrier toward Poppy');
 assert.equal(f.saves,0);
});
test('invalid direct shortcut cannot cut diagonally through a building',()=>{
 const f=fixture({wall:blocked});f.n.startWalk();f.setPlayer(805,700);
 for(let i=0;i<100;i++){f.n.advance(.05);const p=f.n.escortPose();
  assert.equal(blocked(p.x,p.y),false)}
 assert.ok(f.n.escortPose().x<=585,'the wall blocks the direct path');
});
test('an unreachable player does not trigger invisible teleporting',()=>{
 const f=fixture({path:()=>[]});f.n.startWalk();
 const from={...f.n.escortPose()};f.setPlayer(1300,1280);
 f.n.advance(.3);assert.equal(f.n.escortPose().x,from.x);
 assert.equal(f.n.escortPose().y,from.y);assert.equal(f.n.escortPose().moving,false);
});
test('a huge frame delta is capped to protect navigation on slow phones',()=>{
 const f=fixture();f.n.startWalk();const p=f.n.escortPose();
 f.setPlayer(1160,1200);f.n.advance(4);
 const n=f.n.escortPose();assert.ok(Math.hypot(n.x-p.x,n.y-p.y)<=38);
});
test('walking turns smoothly using the actual direction and two sprite frames',()=>{
 const f=fixture();f.n.startWalk();f.setPlayer(900,770);
 f.n.advance(.1);let p=f.n.escortPose();
 assert.equal(p.moving,true);assert.equal(p.facing,'side');
 assert.ok(p.stride>0);
 const last=p.stride;f.n.advance(.1);p=f.n.escortPose();assert.ok(p.stride>last);
 assert.ok([0,1].includes(Math.floor(p.stride)%2));
});
test('if Poppy stops, Pip settles naturally and stops walking in place',()=>{
 const f=fixture();f.n.startWalk();
 for(let i=0;i<120;i++)f.n.advance(.05);
 assert.equal(f.n.escortPose().moving,false);
});
test('conversation or modal pauses companion travel without awarding or relocating',()=>{
 const f=fixture();f.n.startWalk();f.setPlayer(900,740);f.setBlocked(true);
 const p=f.n.escortPose();f.n.advance(.25);
 assert.equal(f.n.escortPose().x,p.x);assert.equal(f.n.escortPose().moving,false);
 f.setBlocked(false);f.n.advance(.1);
 assert.ok(f.n.escortPose().x>p.x);
 assert.equal(f.saves,0);
});
test('an explicit stop restores the original schedule and clears only the session',()=>{
 const f=fixture();f.n.startWalk();f.n.advance(.1);assert.equal(f.n.stopWalk(),true);
 assert.equal(f.n.walkingNow(),false);assert.equal(f.n.escortPose(),null);
 assert.equal(f.child.guardian,'player');assert.equal(f.saves,0);
});
test('changes of game day and scene invalidate any old follow session immediately',()=>{
 const f=fixture();f.n.startWalk();f.state.day=10;
 assert.equal(f.n.walkingNow(),false);f.n.advance(.1);assert.equal(f.n.walking,null);
 const g=fixture();g.n.startWalk();g.setScene('home');g.n.advance(.1);
 assert.equal(g.n.walkingNow(),false);assert.equal(g.n.walking,null);
});
test('unwalkable starting position rejects escort rather than placing Pip inside scenery',()=>{
 const f=fixture({wall:(x,y)=>x>520&&x<540&&y>640&&y<660});
 assert.equal(f.n.startWalk(),false);assert.equal(f.n.walking,null);
});
test('no save key, child relationship graph, or balance change is created by movement',()=>{
 const f=fixture();f.n.startWalk();f.setPlayer(800,740);
 for(let i=0;i<30;i++)f.n.advance(.05);
 assert.deepEqual(JSON.parse(JSON.stringify(f.child)),{guardian:'player',guardianDay:3,meetings:[]});
 assert.equal(f.saves,0);
});
test('iPhone game passes the real existing grid route to Pip and does not freeze during time pause',()=>{
 const game=read('game.js'),little=read('little-sprouts-v272.js'),p=read('pip-neighbors-v275.js');
 assert.match(game,/findPath:\(from,to,w\)=>findPath\(from,to,w\)/);
 assert.match(game,/isMovementBlocked:\(\)=>!!modal\|\|!!talk/);
 assert.match(little,/findPath:api\.findPath,isMovementBlocked:api\.isMovementBlocked/);
 assert.match(little,/routine\.stride/);
 assert.match(game,/Number\.isFinite\(routine\.stride\)\?Math\.floor\(routine\.stride\)%2/);
 assert.match(p,/clearSegment\(current,candidate\)/);
 assert.doesNotMatch(p,/dd>460/);
});
test('touch markers offer useful wait-for-Pip feedback rather than silently failing',()=>{
 const helper=read('pip-helpers-v284.js'),adventures=read('pip-adventures-v281.js');
 assert.match(helper,/Pip is still catching up/);
 assert.match(adventures,/Wait together at the glowing object/);
});
test('older phone PWA saves and resource order remain intact for v2.8.6',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js');
 for(const file of ['pip-neighbors-v275.js','pip-adventures-v281.js','pip-helpers-v284.js'])
  assert.ok(html.includes(file+'?v=2.8.6'));
 for(const file of ['little-sprouts-v272.js','game.js'])
  assert.ok(html.includes(file+'?v=2.9.0'));
 assert.match(sw,/hearth-harbor-v290-guests-who-remember/);
 assert.ok(sw.includes("'./pip-neighbors-v275.js'"));
 assert.ok(sw.includes("'./little-sprouts-v272.js'"));
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('follower needs no networking, paid services, timer polling or extra storage',()=>{
 const source=read('pip-neighbors-v275.js');
 assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout/);
});
