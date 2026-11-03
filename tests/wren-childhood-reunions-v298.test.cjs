/* Hearth & Harbor v2.9.8 — verified lived-in childhood reunions. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const context={window:{}};vm.runInNewContext(read('wren-neighbor-v295.js'),context,{filename:'wren-neighbor-v295.js'});
const M=context.window.HearthYoungNeighbors,plain=x=>JSON.parse(JSON.stringify(x));
const friends=[
 {day:1,kind:'story',first:0,last:0},
 {day:2,kind:'color',first:0,last:1},
 {day:3,kind:'nature',first:1,last:0},
 {day:4,kind:'story',first:1,last:1}
];
const club={
 foundation:friends.slice(0,3),
 chapters:[{kind:'story',day:4,first:1,last:0,source:friends[0]}],
 revisits:[]
};
function fixture({day=6,minute=810,pip={x:871,y:1005},player={x:866,y:994},
 hasPip=true,busy=false,blocked=()=>false,clubData=club,history=friends,scene='town'}={}){
 const state={day,minute,coins:1000,relations:{jun:25},
  youngResidents:{pip:{guardian:'player',needs:{joy:52},skills:{story:2,art:1,garden:1}},
   wren:{friendships:plain(history),club:plain(clubData)}}};
 let where=scene,pp={...player},cp=hasPip&&pip?{...pip}:null,occupied=busy,
  modal=null,paths=0,saves=0,updates=0,notices=[],moving=false,paused=false;
 const walk=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&
  p.x>90&&p.x<1400&&p.y>210&&p.y<1440&&!blocked(p.x,p.y);
 const api={getState:()=>state,getScene:()=>where,getPlayer:()=>({...pp}),
  getPip:()=>state.youngResidents.pip,getPipPosition:()=>cp?{...cp}:null,
  isPipPresent:()=>!!cp,isPipBusy:()=>occupied,isPlayerMoving:()=>moving,
  isPaused:()=>paused||!!modal,isDialogOpen:()=>!!modal,
  isWalkable:(x,y)=>walk({x,y}),nearestWalkable:p=>walk(p)?{...p}:null,
  findPath:(a,b)=>{paths++;return [{...b}]},
  showModal:(name,html)=>modal={name,html},closeModal:()=>modal=null,
  save:()=>saves++,updateUI:()=>updates++,notify:x=>notices.push(x)};
 const w=M.setup(api);
 return {w,state,api,notices,get saves(){return saves},get updates(){return updates},
  get modal(){return modal},get paths(){return paths},
  setMinute:n=>state.minute=n,setDay:n=>state.day=n,
  setScene:n=>where=n,setPip:(x,y)=>cp={x,y},setPlayer:(x,y)=>pp={x,y},
  setBusy:v=>occupied=v,setMoving:v=>moving=v,setPaused:v=>paused=v,
  step:(n=1,dt=.05)=>{for(let i=0;i<n;i++)w.advance(dt)},
  begin(){assert.equal(w.inspectClub(),true);assert.match(modal.html,/yn298-begin/);
   assert.equal(w.handle('yn298-begin'),true);assert.match(modal.html,/yn298-choose/)}
 };
}
test('three authored follow-up chapters are individually written and have different outcomes',()=>{
 assert.deepEqual(Object.keys(M.REUNIONS),['story','color','nature']);
 for(const r of Object.values(M.REUNIONS)){
  assert.equal(r.choices.length,2);assert.equal(r.replies.length,2);
  assert.notEqual(r.replies[0],r.replies[1]);assert.ok(r.question.length>35);
 }
});
test('old child saves have empty optional reunions without a new save key',()=>{
 const empty=plain(M.clean(null));
 assert.deepEqual(empty,{friendships:[],club:{foundation:[],chapters:[],revisits:[]}});
 assert.match(read('game.js'),/const SAVE='hearth-harbor-save-v1'/);
});
test('the sign is unavailable on new games and reflections require a built chapter',()=>{
 const f=fixture({history:[],clubData:{foundation:[],chapters:[],revisits:[]}});
 assert.equal(f.w.reunionReady(),false);assert.equal(f.w.reunionBegin(),false);
 assert.equal(f.saves,0);
});
test('Wren genuinely tends the existing sign during an independent afternoon slot',()=>{
 const f=fixture({minute:730});const start=f.w.pose();
 assert.match(start.label,/Paper pictures/);
 f.setMinute(820);f.step(1,.05);
 const r=f.w.pose();assert.match(r.label,/Friendship Corner/);
 assert.ok(Math.hypot(r.x-start.x,r.y-start.y)<=7,'actual movement, no timetable teleport');
 assert.ok(f.paths>=1);
 assert.equal(f.saves,0);
});
test('a child with no earned sign never gets the new schedule or fake tending art',()=>{
 const f=fixture({minute:820,history:[],clubData:{foundation:[],chapters:[],revisits:[]}});
 assert.match(f.w.pose().label,/Paper pictures/);
 const g={save(){},restore(){},fillRect(){}};
 assert.equal(f.w.drawTending(g,1),false);
});
test('hand-drawn tending art belongs to the real Wren actor by the actual sign',()=>{
 const f=fixture();f.step(1);
 const art=[],g={save(){},restore(){},fillStyle:'',
  fillRect(...v){art.push([this.fillStyle,...v])}};
 assert.equal(f.w.drawTending(g,2),true);
 assert.ok(art.length>=4);assert.ok(art.some(a=>a[0]==='#fff2d6'));
 f.setMinute(920);assert.equal(f.w.drawTending(g,3),false);
});
test('inspecting the sign with both children offers a physically grounded reunion',()=>{
 const f=fixture();const before=plain(f.state);
 assert.equal(f.w.reunionReady(),true);
 assert.equal(f.w.inspectClub(),true);
 assert.match(f.modal.html,/Reflect with Pip and Wren/);
 assert.deepEqual(plain(f.state),before);assert.equal(f.saves,0);
});
test('a nearby but absent, busy, or far-away Pip cannot start a reunion',()=>{
 const absent=fixture({hasPip:false});assert.equal(absent.w.reunionReady(),false);
 const busy=fixture({busy:true});assert.equal(busy.w.reunionReady(),false);
 const distant=fixture({pip:{x:1300,y:1330}});assert.equal(distant.w.reunionReady(),false);
 const noPoppy=fixture({player:{x:1200,y:1240}});assert.equal(noPoppy.w.reunionReady(),false);
});
test('same-day club creation cannot be immediately farmed for reunions',()=>{
 const f=fixture({day:4});assert.equal(f.w.reunionReady(),false);
 assert.equal(f.w.reunionBegin(),false);
});
test('opening the reunion prompt is free; only genuine confirmation saves',()=>{
 const f=fixture(),old=plain(f.state);
 f.begin();assert.equal(f.saves,0);assert.deepEqual(plain(f.state),old);
 assert.equal(f.w.reunionFinish(9),false);assert.equal(f.saves,0);
});
test('a real second-day reunion makes a choice-colored sign and records exactly once',()=>{
 const f=fixture(),orig=plain(f.state);
 f.begin();assert.equal(f.w.handle('yn298-choose','1'),true);
 const r=plain(f.w.reunionRows());
 assert.deepEqual(r,[{kind:'story',day:6,choice:1}]);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.equal(f.state.coins,orig.coins);assert.deepEqual(plain(f.state.relations),orig.relations);
 assert.deepEqual(plain(f.state.youngResidents.pip),orig.youngResidents.pip);
 assert.equal(f.w.reunionReady(),false);
 assert.equal(f.w.reunionFinish(0),false);
 const g={save(){},restore(){},fillStyle:'',calls:[],
  fillRect(...x){this.calls.push([this.fillStyle,...x])}};
 assert.equal(f.w.drawClub(g,1),true);
 assert.ok(g.calls.some(c=>c[0]==='#d8a0a6'));
});
test('interrupted or remote follow-ups cannot be saved',()=>{
 const f=fixture();f.begin();f.setPip(1200,1300);
 assert.equal(f.w.reunionFinish(0),false);assert.equal(f.saves,0);
 const g=fixture();g.begin();g.setDay(7);
 assert.equal(g.w.reunionFinish(0),false);assert.equal(g.saves,0);
 const h=fixture();h.begin();h.setScene('home');h.step(1);
 assert.equal(h.w.session,null);assert.equal(h.saves,0);
});
test('cancelled reunion is reversible and never spoofs a completed chapter',()=>{
 const f=fixture();f.begin();
 assert.equal(f.w.handle('yn295-cancel'),true);
 assert.equal(f.w.session,null);assert.equal(f.saves,0);
 assert.equal(f.w.reunionReady(),true);
});
test('invalid dates, forged chapter types, duplicate and out-of-order choices sanitize safely',()=>{
 const valid=plain(M.clean({friendships:friends,club:{...club,revisits:[{kind:'story',day:6,choice:0}]}}));
 assert.deepEqual(valid.club.revisits,[{kind:'story',day:6,choice:0}]);
 for(const entry of [{kind:'story',day:4,choice:0},{kind:'nature',day:6,choice:0},
  {kind:'story',day:6,choice:3},{kind:'story',day:99999,choice:0}]){
  const bad=plain(M.clean({friendships:friends,club:{...club,revisits:[entry]}}));
  assert.equal(bad.club.revisits.length,0);
 }
 const repeated=plain(M.clean({friendships:friends,club:{...club,revisits:[
  {kind:'story',day:6,choice:0},{kind:'story',day:6,choice:1}]}}));
 assert.equal(repeated.club.revisits.length,1);
});
test('authentic visits remain after the ordinary 48-entry peer friendship cap rolls over',()=>{
 const history=Array.from({length:100},(_,i)=>({day:i+1,kind:['story','color','nature'][i%3],first:0,last:1}));
 const saved=plain(M.clean({friendships:history,club:{...club,
  revisits:[{kind:'story',day:6,choice:0}]}}));
 assert.equal(saved.friendships.length,48);
 assert.equal(saved.club.chapters.length,1);
 assert.deepEqual(saved.club.revisits,[{kind:'story',day:6,choice:0}]);
});
test('Connections Atlas only records real normalized peer reunions, not invented adult family ties',()=>{
 const src=read('family-atlas-v271.js');
 assert.match(src,/kind:'child-peer-reunion'/);
 assert.match(src,/root\.HearthYoungNeighbors\.clean\(peerData\.wren\)\.club/);
 assert.match(src,/ids:\['pip','wren','player'\]/);
 assert.match(src,/id==='wren'\?null/);
});
test('actual in-game touch routes both v2.9.7 club buttons and new v2.9.8 reunion buttons',()=>{
 const core=read('game.js'),wren=read('wren-neighbor-v295.js');
 assert.match(core,/action\.startsWith\('yn297-'\)/);
 assert.match(core,/action\.startsWith\('yn298-'\)/);
 for(const a of ['yn297-begin','yn297-first','yn297-last','yn298-begin','yn298-choose'])
  assert.ok(wren.includes("action==='"+a+"'"),a);
 assert.match(core,/youngNeighbors\.drawTending\(ctx,tick\)/);
 assert.match(core,/o\.type==='friendship-corner'/);
 assert.match(core,/const childTap=/);
 assert.match(core,/Math\.hypot\(wx-wp\.x,wy-\(wp\.y-51\)\)/);
 assert.ok(core.indexOf("cornerPose?[{type:'friendship-corner'")<
  core.indexOf("wrenPose?[{type:'young-neighbor'"));
});
test('iPhone offline cache and live Canvas script use v2.9.8 without changing original storage',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js');
 assert.ok(html.includes('wren-neighbor-v295.js?v=2.9.8'));
 assert.ok(html.includes('game.js?v=2.9.8'));
 assert.match(sw,/hearth-harbor-v298-childhood-reunions/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 const src=read('wren-neighbor-v295.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout/);
});
