/* Hearth & Harbor v2.9.6 — spontaneous, physically grounded child meetings. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const c={window:{}};vm.runInNewContext(read('wren-neighbor-v295.js'),c);
const M=c.window.HearthYoungNeighbors;
const flat=x=>JSON.parse(JSON.stringify(x));
function fixture({day=3,pip={x:925,y:954},player={x:911,y:943},
 blocked=()=>false,paused=false,busy=false,moving=false,history=[]}={}){
 const state={day,minute:780,coins:800,youngResidents:{
  pip:{guardian:'player',needs:{joy:50},skills:{story:1,art:1,garden:1}},
  wren:{friendships:flat(history)}}};
 let where='town',cp=pip&&{...pip},pp={...player},freeze=paused,occupied=busy,
  strolling=moving,wall=blocked,saves=0,updates=0,dialogs=0,routes=0;
 const safe=(x,y)=>Number.isFinite(x)&&Number.isFinite(y)&&x>=90&&x<=1400&&y>=210&&y<=1440&&!wall(x,y);
 const api={getState:()=>state,getScene:()=>where,getPlayer:()=>({...pp}),
  getPip:()=>state.youngResidents.pip,getPipPosition:()=>cp&&{...cp},
  isPipPresent:()=>!!cp,isPipBusy:()=>occupied,
  isPlayerMoving:()=>strolling,isPaused:()=>freeze,
  isDialogOpen:()=>false,isWalkable:(x,y)=>safe(x,y),
  nearestWalkable:p=>safe(p.x,p.y)?{...p}:null,
  findPath:(a,b)=>{routes++;return [{...b}]},
  save:()=>saves++,updateUI:()=>updates++,notify:()=>{},
  showModal:()=>dialogs++,closeModal:()=>{}};
 const w=M.setup(api);
 return {w,state,api,
  get saves(){return saves},get updates(){return updates},
  get dialogs(){return dialogs},get routes(){return routes},
  setBusy:x=>occupied=x,setPaused:x=>freeze=x,
  setMoving:x=>strolling=x,setScene:x=>where=x,
  setPip:(x,y)=>cp={x,y},setDay:x=>state.day=x,
  step:(n=1,dt=.05)=>{for(let i=0;i<n;i++)w.advance(dt)}};
}
test('Wren physically approaches the real nearby Pip without opening a dialog',()=>{
 const f=fixture(),start=f.w.pose();f.step(75);
 assert.ok(f.w.moment&&f.w.moment.phase==='greeting');
 assert.ok(Math.hypot(f.w.pose().x-start.x,f.w.pose().y-start.y)>25);
 assert.ok(Math.hypot(f.w.pose().x-925,f.w.pose().y-954)<80);
 assert.equal(f.dialogs,0);assert.equal(f.saves,0);assert.equal(f.updates,0);
 assert.deepEqual(flat(f.state.youngResidents.wren),{friendships:[]});
});
test('when children already stand together an original friendly cue still appears',()=>{
 const f=fixture({pip:{x:811,y:938},player:{x:820,y:955}});
 f.step(1);assert.equal(f.w.moment.phase,'greeting');
 assert.equal(f.w.moment.kind,'color'); // Wren is drawing near Bea at noon.
});
test('both actual children receive an original small pixel art greeting',()=>{
 const f=fixture();f.step(75);
 const calls=[],g={save(){},restore(){},fillStyle:'',
  fillRect(...v){calls.push([this.fillStyle,...v])}};
 assert.equal(f.w.drawSocial(g,1),true);assert.ok(calls.length>=12);
 assert.equal(calls.some(v=>v[0]==='#f8efd7'),true);
 assert.ok(calls.some(v=>v[0]==='#c996b0'));
 f.setPip(1350,1350);
 assert.equal(f.w.drawSocial(g,1),false);
});
test('spontaneous greetings never grant coins, social scores or a fake saved event',()=>{
 const f=fixture(),before=flat(f.state);f.step(240);
 assert.deepEqual(flat(f.state),before);
 assert.equal(f.saves,0);assert.equal(f.updates,0);
 assert.equal(f.w.moment,null);
 f.step(240);assert.equal(f.w.moment,null,'same day cannot spam greetings');
});
test('real completed friendship days evolve the topic of unprompted conversations',()=>{
 const history=Array.from({length:6},(_,i)=>({day:i+1,kind:i%3===0?'story':i%3===1?'color':'nature',first:0,last:1}));
 const f=fixture({day:8,history}),a=f.w.sharedInterest();
 assert.equal(f.w.level(),2);
 assert.ok(['story','color','nature'].includes(a.kind));
 assert.match(a.line,/friends|Pip and Wren|The two friends/i);
 assert.match(f.w.panel(),/Current interest/);
 assert.equal(f.saves,0);
 const g=fixture({day:10,history:[{day:1,kind:'nature',first:0,last:1},
  {day:2,kind:'nature',first:1,last:0},{day:3,kind:'color',first:0,last:0}]});
 assert.equal(g.w.sharedInterest().kind,'nature');
});
test('Pip must actually exist in town and be available, with no fake counterpart',()=>{
 const f=fixture({pip:null});f.step(100);
 assert.equal(f.w.moment,null);assert.equal(f.saves,0);
 const g=fixture({busy:true});g.step(90);assert.equal(g.w.moment,null);
 const h=fixture({paused:true});h.step(100);assert.equal(h.w.moment,null);
});
test('other child activities and player movement take priority',()=>{
 const f=fixture({moving:true});f.step(100);assert.equal(f.w.moment,null);
 f.setMoving(false);f.step(1);assert.equal(f.w.moment.phase,'approach');
 f.setMoving(true);f.step(1);assert.equal(f.w.moment,null);
 f.setMoving(false);f.step(180);assert.equal(f.w.moment,null);
});
test('blocked town paths never teleport Wren to Pip or record a false encounter',()=>{
 const wall=(x,y)=>x>=840&&x<=862&&y>=875&&y<=1010;
 const f=fixture({blocked:wall}),start=f.w.pose();
 f.step(280);
 assert.ok(f.w.pose().x<=840);assert.equal(f.w.saves,undefined);
 assert.equal(f.w.moment,null);assert.equal(f.saves,0);
 assert.ok(f.routes<30,'do not replan every mobile frame');
 assert.ok(Math.hypot(f.w.pose().x-start.x,f.w.pose().y-start.y)<80);
});
test('switching scenes abandons an incomplete moment without a saved memory',()=>{
 const f=fixture();f.step(2);assert.equal(f.w.moment.phase,'approach');
 f.setScene('home');f.step(1);assert.equal(f.w.moment,null);
 assert.equal(f.w.pose(),null);assert.equal(f.saves,0);
});
test('formal authored outings still take precedence over idle greetings',()=>{
 const f=fixture({pip:{x:820,y:938},player:{x:816,y:936}});
 f.step(1);assert.equal(f.w.moment.phase,'greeting');
 assert.equal(f.w.talk(),true);assert.equal(f.w.moment,null);
 assert.equal(f.w.session.phase,'first');assert.equal(f.saves,0);
});
test('existing old saves and peer records remain unchanged',()=>{
 const old=M.clean({friendships:[{day:2,kind:'story',first:0,last:1}]});
 assert.deepEqual(flat(old),{friendships:[{day:2,kind:'story',first:0,last:1}],club:{foundation:[],chapters:[],revisits:[]}});
 const f=fixture({day:12,history:old.friendships}),before=flat(f.state.youngResidents);
 f.step(180);assert.deepEqual(flat(f.state.youngResidents),before);
});
test('v2.9.6 is actually connected to the playable world and offline Home Screen app',()=>{
 const game=read('game.js'),html=read('index.html'),sw=read('sw.js');
 assert.match(game,/youngNeighbors\.drawSocial\(ctx,tick\)/);
 assert.match(game,/youngNeighbors\.advance\(dt\)/);
 assert.ok(html.includes('wren-neighbor-v295.js?v=2.9.8'));
 assert.ok(html.includes('game.js?v=3.0'));
 assert.match(sw,/hearth-harbor-v300-chosen-generations/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 const src=read('wren-neighbor-v295.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout/);
});
