/* Hearth & Harbor v2.9.7 — genuine, save-safe Friendship Corner. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};vm.runInNewContext(read('wren-neighbor-v295.js'),env);
const M=env.window.HearthYoungNeighbors;
const plain=x=>JSON.parse(JSON.stringify(x));
const basic=[
 {day:1,kind:'story',first:0,last:1},
 {day:2,kind:'color',first:1,last:0},
 {day:3,kind:'nature',first:0,last:0},
 {day:4,kind:'story',first:1,last:1}
];
function make({day=4,friendships=basic,club=null,pip={x:818,y:940},
 player={x:810,y:938},scene='town',busy=false,blocked=()=>false}={}){
 const state={day,minute:780,coins:675,relations:{jun:20},youngResidents:{
  pip:{guardian:'player',skills:{story:3,art:2,garden:2},needs:{joy:61,confidence:60}},
  wren:{friendships:plain(friendships),...(club?{club:plain(club)}:{})}}};
 let where=scene,pp={...player},cp=pip?{...pip}:null,occupied=busy,modal=null,saves=0,ui=0,routes=0;
 const notices=[];
 const safe=p=>p&&[p.x,p.y].every(Number.isFinite)&&p.x>90&&p.x<1400&&
  p.y>210&&p.y<1440&&!blocked(p.x,p.y);
 const api={getState:()=>state,getScene:()=>where,getPlayer:()=>({...pp}),
  getPip:()=>state.youngResidents.pip,getPipPosition:()=>cp&&{...cp},
  isPipPresent:()=>!!cp,isPipBusy:()=>occupied,isPlayerMoving:()=>false,
  isPaused:()=>!!modal,isDialogOpen:()=>modal?.name==='young-neighbors',
  isWalkable:(x,y)=>safe({x,y}),nearestWalkable:p=>safe(p)?{...p}:null,
  findPath:(a,b)=>{routes++;return [{...b}]},
  showModal:(name,html)=>{modal={name,html}},closeModal:()=>{modal=null},
  notify:x=>notices.push(x),save:()=>saves++,updateUI:()=>ui++};
 const w=M.setup(api);
 const moveWren=()=>{const p=w.pose();pp={x:p.x,y:p.y};if(cp)cp={x:p.x+8,y:p.y+9}};
 return {w,state,api,notices,get modal(){return modal},get saves(){return saves},
  get ui(){return ui},get routes(){return routes},
  setPlayer:(x,y)=>{pp={x,y}},setPip:(x,y)=>{cp={x,y}},
  moveWren,setDay:d=>{state.day=d;moveWren()},
  setScene:x=>where=x,setBusy:x=>occupied=x,
  start(){moveWren();assert.equal(w.talk(),true);
   assert.match(modal.html,/FRIENDSHIP CORNER/);
   assert.equal(w.clubBegin(),true);
   assert.equal(w.clubFirst(0),true);
   assert.equal(w.session.phase,'club-walking');
   return w.clubSite()},
  getToMarker(){
   const p=w.clubSite();pp={...p};cp={x:p.x+3,y:p.y+5};
   assert.equal(w.arrive(),true);
   assert.equal(w.session.phase,'club-final');
  },
  finish(choice=1){this.getToMarker();assert.equal(w.clubFinish(choice),true)}
 };
}
test('three wholly different authored chapters with meaningful two-stage choices',()=>{
 assert.deepEqual(plain(M.CLUB.map(x=>x.kind)),['story','color','nature']);
 for(const chapter of M.CLUB){
  assert.equal(chapter.first.length,2);assert.equal(chapter.final.length,2);
  assert.equal(chapter.ending.length,2);assert.notEqual(chapter.ending[0],chapter.ending[1]);
 }
});
test('new and malformed saves migrate to the same key with an empty optional club',()=>{
 assert.deepEqual(plain(M.clean(null)),{friendships:[],club:{foundation:[],chapters:[],revisits:[]}});
 assert.deepEqual(plain(M.clean({friendships:basic})).club,{foundation:[],chapters:[],revisits:[]});
 const game=read('game.js');
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(game,/wren:window\.HearthYoungNeighbors\.clean\(raw\.youngResidents\?\.wren\)/);
});
test('club is not available before true third friendship day or without varied play',()=>{
 const two=make({friendships:basic.slice(0,2),day:2});two.moveWren();
 assert.equal(two.w.clubReady(),false);
 const same=make({friendships:[{day:1,kind:'story',first:0,last:0},
 {day:2,kind:'story',first:0,last:0},{day:3,kind:'story',first:0,last:0},
 {day:4,kind:'story',first:0,last:0}]});same.moveWren();
 assert.equal(same.w.clubReady(),false);
});
test('only a real, already completed same-day outing permits a club chapter',()=>{
 const f=make({friendships:basic.slice(0,3),day:4});f.moveWren();
 assert.equal(f.w.clubReady(),false);assert.equal(f.w.clubBegin(),false);
 f.w.talk();assert.doesNotMatch(f.modal.html,/FRIENDSHIP CORNER/);
 assert.equal(f.saves,0);
});
test('a physically present Pip and unoccupied Wren are required to begin',()=>{
 const absent=make({pip:null});absent.moveWren();
 assert.equal(absent.w.clubReady(),false);
 const busy=make({busy:true});busy.moveWren();assert.equal(busy.w.clubReady(),false);
 const far=make({player:{x:1300,y:1200},pip:{x:818,y:940}});
 assert.equal(far.w.clubReady(),false);
});
test('opening a menu and choosing the first idea never creates a reward or chapter',()=>{
 const f=make(),old=plain(f.state);f.start();
 assert.equal(f.saves,0);assert.deepEqual(plain(f.state),old);
 assert.ok(f.w.hitMarker(f.w.clubSite().x,f.w.clubSite().y));
});
test('distant Pip or remote Poppy cannot finish or forge a chapter',()=>{
 const f=make(),at=f.start();f.setPlayer(at.x,at.y);
 f.setPip(1240,1250);assert.equal(f.w.arrive(),false);
 assert.equal(f.saves,0);
 f.setPip(at.x,at.y);assert.equal(f.w.arrive(),true);
 f.setPlayer(1200,1300);assert.equal(f.w.clubFinish(0),false);
 assert.equal(f.w.clubFinish(3),false);assert.equal(f.saves,0);
});
test('three real calendar days yield three stages and a finished village banner',()=>{
 const f=make();f.start();f.finish(1);
 assert.equal(f.w.clubRows().length,1);assert.equal(f.saves,1);
 assert.equal(f.state.coins,675);assert.equal(f.state.youngResidents.pip.needs.joy,61);
 assert.equal(f.w.hitClub(f.w.clubSite().x,f.w.clubSite().y-35).x,f.w.clubSite().x);
 f.setDay(5);f.state.youngResidents.wren.friendships.push({day:5,kind:'color',first:1,last:0});
 f.start();f.finish(0);
 assert.equal(f.w.clubRows().length,2);
 f.setDay(6);f.state.youngResidents.wren.friendships.push({day:6,kind:'nature',first:0,last:1});
 f.start();f.finish(1);
 const rows=plain(f.w.clubRows());assert.deepEqual(rows.map(x=>x.kind),['story','color','nature']);
 assert.deepEqual(rows.map(x=>x.day),[4,5,6]);
 assert.equal(f.saves,3);assert.equal(f.ui,3);
 assert.equal(f.w.clubReady(),false);
});
test('world artwork grows with earned chapters and never appears on new game',()=>{
 const fresh=make({day:1,friendships:[]});
 const calls=[],g={save(){},restore(){},fillStyle:'',
  fillRect(...args){calls.push([this.fillStyle,...args])}};
 assert.equal(fresh.w.drawClub(g,1),false);
 const f=make();f.start();f.finish(1);
 assert.equal(f.w.drawClub(g,1),true);const one=calls.length;
 assert.ok(one>=10);
 f.setDay(5);f.state.youngResidents.wren.friendships.push({day:5,kind:'color',first:1,last:0});
 f.start();f.finish(0);calls.length=0;
 f.w.drawClub(g,2);assert.ok(calls.length>one);
 assert.ok(calls.some(c=>c[0]==='#c99cb1'));
});
test('touching built Friendship Corner only opens an honest read-only memory',()=>{
 const f=make();f.start();f.finish(1);
 const b=f.w.clubSite();f.setPlayer(b.x,b.y);
 const before=plain(f.state),saves=f.saves;
 assert.equal(f.w.inspectClub(),true);assert.match(f.modal.html,/Day 4/);
 assert.match(f.modal.html,/read-only/);
 assert.deepEqual(plain(f.state),before);assert.equal(f.saves,saves);
});
test('finished keepsakes survive peer scrapbook rollover of more than 48 days',()=>{
 const f=make();f.start();f.finish(1);
 f.setDay(5);f.state.youngResidents.wren.friendships.push({day:5,kind:'color',first:1,last:0});
 f.start();f.finish(0);
 f.setDay(6);f.state.youngResidents.wren.friendships.push({day:6,kind:'nature',first:0,last:1});
 f.start();f.finish(1);
 const saved=plain(f.state.youngResidents.wren);
 for(let i=7;i<=110;i++)saved.friendships.push({
  day:i,kind:['story','color','nature'][i%3],first:0,last:0});
 const cleaned=plain(M.clean(saved));
 assert.equal(cleaned.friendships.length,48);
 assert.equal(cleaned.club.foundation.length,3);
 assert.deepEqual(cleaned.club.chapters.map(r=>r.kind),['story','color','nature']);
});
test('forged chapters without their original provenance are rejected',()=>{
 const bogus={friendships:basic,club:{chapters:[{kind:'story',day:5,first:0,last:0}]}};
 assert.equal(M.clean(bogus).club.chapters.length,0);
 const f=make();f.start();f.finish(0);
 const saved=plain(f.state.youngResidents.wren);
 saved.club.chapters[0].source={day:19,kind:'story',first:1,last:0};
 saved.friendships=[];
 assert.equal(M.clean(saved).club.chapters.length,0);
});
test('chapter order, dates, choice ranges and no repeated same-day work',()=>{
 const f=make();f.start();f.finish(0);
 assert.equal(f.w.clubReady(),false);
 const saved=plain(f.state.youngResidents.wren);
 saved.club.chapters.push({kind:'nature',day:4,first:0,last:0,source:basic[2]});
 assert.equal(M.clean(saved).club.chapters.length,1);
 saved.club.chapters.push({kind:'color',day:7,first:4,last:0,source:basic[1]});
 assert.equal(M.clean(saved).club.chapters.length,1);
});
test('interrupted and cancelled work never writes a phantom record',()=>{
 const f=make();f.start();assert.equal(f.w.cancel(),true);
 assert.equal(f.w.session,null);assert.equal(f.saves,0);
 const g=make();g.start();g.setScene('home');g.w.advance(.1);
 assert.equal(g.w.session,null);assert.equal(g.saves,0);
});
test('Family Atlas reflects only source-validated physical peer club work',()=>{
 const atlas=read('family-atlas-v271.js');
 assert.match(atlas,/child-peer-club/);
 assert.match(atlas,/root\.HearthYoungNeighbors\.clean\(peerData\.wren\)\.club/);
 assert.match(atlas,/ids:\['pip','wren','player'\]/);
 assert.match(atlas,/id==='wren'\?null/);
});
test('real game world taps, responsive PWA and old saves use the new milestone',()=>{
 const game=read('game.js'),html=read('index.html'),sw=read('sw.js');
 assert.match(game,/youngNeighbors\.hitClub\(wx,wy\)/);
 assert.match(game,/youngNeighbors\.drawClub\(ctx,tick\)/);
 assert.match(game,/youngNeighbors\.inspectClub\(\)/);
 assert.ok(html.includes('wren-neighbor-v295.js?v=2.9.8'));
 assert.ok(html.includes('game.js?v=3.0'));
 assert.match(sw,/hearth-harbor-v300-chosen-generations/);
 const w=read('wren-neighbor-v295.js');
 assert.doesNotMatch(w,/fetch\(|WebSocket|XMLHttpRequest|localStorage|setInterval|setTimeout/);
 assert.doesNotMatch(w,/adultRomance|marriagePlans|coins\s*\+=/);
});
