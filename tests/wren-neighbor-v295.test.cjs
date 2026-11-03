/* Hearth & Harbor v2.9.5 — Wren is a real child, not a new adult menu. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const context={window:{}};vm.runInNewContext(read('wren-neighbor-v295.js'),context,{filename:'wren-neighbor-v295.js'});
const M=context.window.HearthYoungNeighbors,plain=x=>JSON.parse(JSON.stringify(x));
function fixture({day=1,minute=780,scene='town',player={x:810,y:935},
 pip={x:817,y:939},present=true,busy=false,paused=false,blocked=()=>false,
 pathFn=null,friendships=[]}={}){
 const state={day,minute,coins:400,relations:{mabel:25},
  youngResidents:{pip:{guardian:null,guardianDay:0,needs:{joy:52,confidence:45,curiosity:60}},
   wren:{friendships:plain(friendships)}}};
 let where=scene,pp={...player},cp=pip?{...pip}:null,here=present,
  occupied=busy,freeze=paused,moving=false,wall=blocked,router=pathFn,
  menu=null,saveCalls=0,uiCalls=0,pathCalls=0,routeHistory=[];
 const notices=[];
 const safe=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=90&&p.x<=1400&&p.y>=210&&p.y<=1440&&!wall(p.x,p.y);
 const api={getState:()=>state,getScene:()=>where,getPlayer:()=>({...pp}),
  getPip:()=>state.youngResidents.pip,getPipPosition:()=>cp?{...cp}:null,
  isPipPresent:()=>here,isPipBusy:()=>occupied,
  isPlayerMoving:()=>moving,isPaused:()=>freeze,isDialogOpen:()=>!!menu,
  isWalkable:(x,y)=>safe({x,y}),nearestWalkable:p=>safe(p)?{...p}:null,
  findPath:(a,b)=>{pathCalls++;routeHistory.push({a:{...a},b:{...b}});
   return router?router(a,b):[{...b}];},
  showModal:(name,html)=>{menu={name,html}},closeModal:()=>{menu=null},
  notify:s=>notices.push(s),save:()=>saveCalls++,updateUI:()=>uiCalls++};
 const w=M.setup(api);
 return {w,state,api,notices,routeHistory,get menu(){return menu},
  get saves(){return saveCalls},get ui(){return uiCalls},get paths(){return pathCalls},
  get player(){return pp},get pip(){return cp},
  setMinute:t=>state.minute=t,setDay:d=>state.day=d,setScene:s=>where=s,
  setPlayer:(x,y)=>pp={x,y},setPip:(x,y)=>cp={x,y},
  setPresent:b=>here=b,setBusy:b=>occupied=b,setPaused:b=>freeze=b,
  setMoving:b=>moving=b,setWall:fn=>wall=fn,
  step:(dt=.05,n=1)=>{for(let i=0;i<n;i++)w.advance(dt)},
  playFirst(choice=0){assert.equal(w.talk(),true);return w.chooseFirst(choice)},
  reach(){const at=w.hitMarker(w.session.marker.x,w.session.marker.y);
   if(!at)throw Error('no marker');pp={x:at.x,y:at.y};cp={x:at.x-9,y:at.y+3};
   return w.arrive()},
  complete(first=0,last=0){assert.equal(w.talk(),true);assert.equal(w.chooseFirst(first),true);
   const at=w.session.marker;pp={x:at.x,y:at.y};cp={x:at.x+4,y:at.y+7};
   assert.equal(w.arrive(),true);return w.finish(last)}
 };
}
const art=()=>{const calls=[],g={save(){},restore(){},fillStyle:null,fillRect(...r){calls.push([this.fillStyle,...r])}};return{g,calls}};
test('Wren has a genuinely independent child identity and never enters adult NPCS',()=>{
 assert.equal(M.WREN.id,'wren');assert.equal(M.WREN.stage,'Child');
 assert.notEqual(M.WREN.skin,'#d69e7c');assert.notEqual(M.WREN.outfit,'#eab16e');
 assert.notEqual(M.WREN.hair,'#58424c');
 const game=read('game.js');
 assert.match(game,/const youngNeighbors=window\.HearthYoungNeighbors\.setup/);
 assert.doesNotMatch(game.slice(game.indexOf('const NPCS='),game.indexOf('const HEX=')),/id:'wren'/);
});
test('Wren has distinct town morning, creative noon, meadow and evening routines',()=>{
 assert.equal(M.ROUTINE.length,4);
 assert.equal(new Set(M.ROUTINE.map(x=>x.label)).size,4);
 const f=fixture({minute:550});assert.match(f.w.pose().label,/Morning books/);
 f.setMinute(780);assert.match(f.w.pose().label,/Paper pictures/);
 f.setMinute(920);assert.match(f.w.pose().label,/Meadow/);
 f.setMinute(1050);assert.match(f.w.pose().label,/village path/);
});
test('Wren remains off-stage outside safe community hours instead of appearing overnight',()=>{
 for(const m of [0,100,509,1110,1390]){
  const f=fixture({minute:m});assert.equal(f.w.pose(),null);assert.equal(f.w.hit(800,900),null);
 }
});
test('all three original child friendship activities have two original meaningful choices',()=>{
 assert.deepEqual(Object.keys(M.STORIES),['story','color','nature']);
 for(const t of Object.values(M.STORIES)){
  assert.equal(t.first.length,2);assert.equal(t.final.length,2);assert.equal(t.ending.length,2);
  assert.notEqual(t.ending[0],t.ending[1]);
  assert.ok(t.intro.length>55);
 }
});
test('talking to Wren alone is ordinary village conversation, not invented friendship',()=>{
 const f=fixture({present:false});
 assert.equal(f.w.talk(),true);
 assert.match(f.menu.html,/Pip is not here/);
 assert.equal(f.w.session,null);
 assert.equal(f.saves,0);
 assert.equal(f.state.youngResidents.pip.needs.joy,52);
});
test('a guardian in their cottage cannot forge Pip presence in the town',()=>{
 const f=fixture({present:false});f.state.youngResidents.pip.guardian='player';
 assert.equal(f.w.eligible(),false);
 f.w.talk();assert.match(f.menu.html,/Pip is not here/);
});
test('child and guardian must physically stand close to the actual same Wren sprite',()=>{
 const f=fixture();f.setPlayer(1200,1200);
 assert.equal(f.w.eligible(),false);
 f.setPlayer(810,935);f.setPip(1200,1200);
 assert.equal(f.w.eligible(),false);
 f.setPip(817,939);assert.equal(f.w.eligible(),true);
});
test('another active child outing takes priority over Wren peer play',()=>{
 const f=fixture({busy:true});assert.equal(f.w.eligible(),false);
 f.w.talk();assert.match(f.menu.html,/another childhood adventure/);
 assert.equal(f.w.session,null);
});
test('the standard iPhone close button cancels an unfinished child conversation',()=>{
 const first=fixture();first.w.talk();first.api.closeModal();first.step(.1);
 assert.equal(first.w.session,null);assert.equal(first.saves,0);
 assert.equal(first.w.eligible(),true);
 const last=fixture();last.playFirst();last.reach();
 last.api.closeModal();last.step(.1);
 assert.equal(last.w.session,null);assert.equal(last.saves,0);
});

test('a real first face-to-face encounter opens a unique two-step child dialogue',()=>{
 const f=fixture();assert.equal(f.w.talk(),true);
 assert.match(f.menu.html,/WREN & PIP/);
 assert.match(f.menu.html,/The Paper-Boat Tale/);
 assert.match(f.menu.html,/yn295-first/);
 assert.equal(f.w.session.phase,'first');
 assert.equal(f.saves,0);
});
test('looking at first choice does not write anything to the save',()=>{
 const f=fixture(),before=plain(f.state.youngResidents);
 f.w.talk();assert.deepEqual(plain(f.state.youngResidents),before);
 assert.equal(f.saves,0);assert.equal(f.notices.length,0);
});
test('first decision marks a walkable real-world waypoint but does not give a reward',()=>{
 const f=fixture();assert.equal(f.playFirst(1),true);
 assert.equal(f.w.session.phase,'walking');
 assert.equal(f.w.session.first,1);
 const at=f.w.session.marker,pose=f.w.pose();
 assert.ok(at&&Math.hypot(at.x-pose.x,at.y-pose.y)>50);
 assert.ok(Math.hypot(at.x-pose.x,at.y-pose.y)<135);
 assert.equal(f.menu,null);assert.equal(f.saves,0);
});
test('the paper world marker is both drawn as original pixel art and actually tappable',()=>{
 const f=fixture();f.playFirst(0);
 const p=art();assert.equal(f.w.drawMarker(p.g,1),true);
 assert.ok(p.calls.length>=6);
 const at=f.w.session.marker;
 assert.ok(f.w.hitMarker(at.x,at.y));
 assert.equal(f.w.hitMarker(180,200),null);
});
test('the second part is locked until Poppy really reaches the marked spot',()=>{
 const f=fixture();f.playFirst();
 assert.equal(f.w.arrive(),false);
 assert.equal(f.w.session.phase,'walking');
 assert.equal(f.w.finish(0),false);
 assert.equal(f.saves,0);
});
test('Pip really must reach the discovery spot; the game tells Poppy to let Pip catch up',()=>{
 const f=fixture();f.playFirst();
 const at=f.w.session.marker;
 f.setPlayer(at.x,at.y);f.setPip(1110,1350);
 assert.equal(f.w.arrive(),false);
 assert.match(f.notices.at(-1),/catching up/);
 assert.equal(f.w.session.phase,'walking');
 f.setPip(at.x+8,at.y);
 assert.equal(f.w.arrive(),true);
});
test('physically arriving together opens the second real choice, no earlier',()=>{
 const f=fixture();f.playFirst(0);
 assert.equal(f.reach(),true);
 assert.equal(f.w.session.phase,'last');
 assert.match(f.menu.html,/EVERYONE REACHED THE REAL SPOT/);
 assert.match(f.menu.html,/yn295-last/);
 assert.equal(f.saves,0);
});
test('all three physical stages completed produce one authentic saved peer memory',()=>{
 const f=fixture();assert.equal(f.complete(0,1),true);
 assert.deepEqual(plain(f.state.youngResidents.wren.friendships),
  [{day:1,kind:'story',first:0,last:1}]);
 assert.equal(f.state.youngResidents.pip.needs.joy,54);
 assert.equal(f.state.coins,400);
 assert.equal(f.saves,1);assert.equal(f.ui,1);
});
test('the recorded ending is the one genuinely chosen by the player',()=>{
 const a=fixture();a.complete(0,0);
 const b=fixture();b.complete(1,1);
 assert.notEqual(a.state.youngResidents.wren.friendships[0].last,b.state.youngResidents.wren.friendships[0].last);
 assert.match(a.menu.html,/next adventure/);
 assert.match(b.menu.html,/friends return/);
});
test('a single completed peer memory per day prevents repeated joy farming',()=>{
 const f=fixture();f.complete();
 assert.equal(f.w.eligible(),false);assert.equal(f.w.finish(0),false);
 assert.equal(f.w.talk(),true);assert.match(f.menu.html,/already shared/);
 assert.equal(f.state.youngResidents.pip.needs.joy,54);
 assert.equal(f.saves,1);
});
test('real activity variety rotates over subsequent village days',()=>{
 for(const [day,kind] of [[1,'story'],[2,'color'],[3,'nature'],[4,'story']]){
  const f=fixture({day});f.complete(0,1);
  assert.equal(f.w.history()[0].kind,kind);
 }
});
test('three different days with two kinds of play create a believable growing friendship',()=>{
 const f=fixture({day:4,friendships:[
  {day:1,kind:'story',first:0,last:0},
  {day:2,kind:'color',first:1,last:1},
  {day:3,kind:'nature',first:0,last:1}
 ]});
 assert.equal(f.w.level(),1);
 assert.equal(f.w.title(),'A growing friendship');
 const p=art();assert.equal(f.w.drawAccent(p.g,f.w.pose(),0),true);
 assert.ok(p.calls.length>4);
});
test('six actual days across all three kinds create the stronger child friendship',()=>{
 const f=fixture({day:8,friendships:Array.from({length:6},(_,i)=>
  ({day:i+1,kind:['story','color','nature'][i%3],first:i%2,last:(i+1)%2}))});
 assert.equal(f.w.level(),2);assert.equal(f.w.title(),'True village friends');
});
test('Wren meeting never adds adult romance, parentage, marriage, jobs or money',()=>{
 const f=fixture(),old=plain({coins:f.state.coins,relations:f.state.relations});
 f.complete();
 assert.deepEqual(plain({coins:f.state.coins,relations:f.state.relations}),old);
 assert.equal(f.state.youngResidents.wren.guardian,undefined);
});
test('invalid choice data or a future day can never forge a friendship record',()=>{
 for(const variant of ['badFirst','badLast','tomorrow','remote']){
  const f=fixture();f.w.talk();
  if(variant==='badFirst'){assert.equal(f.w.chooseFirst(2),false);continue}
  f.w.chooseFirst(0);const at=f.w.session.marker;
  f.setPlayer(at.x,at.y);f.setPip(at.x+5,at.y);
  f.w.arrive();
  if(variant==='tomorrow')f.setDay(2);
  if(variant==='remote')f.setPip(1250,1380);
  assert.equal(f.w.finish(variant==='badLast'?4:0),false,variant);
  assert.equal(f.saves,0);
 }
});
test('leaving town and day changes cancel the unfinished original meetup',()=>{
 const f=fixture();f.playFirst();
 f.setScene('home');f.step(.1);
 assert.equal(f.w.session,null);assert.equal(f.w.pose(),null);
 const g=fixture();g.playFirst();g.setDay(2);g.step(.1);
 assert.equal(g.w.session,null);assert.equal(g.saves,0);
});
test('Wren never teleports through a decorative obstacle if the path returns a diagonal',()=>{
 const wall=(x,y)=>x>=660&&x<=680&&y>=900&&y<=1060;
 const f=fixture({minute:550,blocked:wall});const from=f.w.pose();
 f.setMinute(780);
 for(let i=0;i<100;i++){
  f.step(.05);const p=f.w.pose();
  assert.equal(wall(p.x,p.y),false);
 }
 assert.equal(f.saves,0);assert.ok(f.paths<=10,'do not repeatedly route on every phone frame');
 assert.ok(f.w.pose().x<=660,'never cross a solid wall with a diagonal');
});
test('large delayed iPhone frames cap Wren travel and preserve collision',()=>{
 const f=fixture({minute:550});const first=f.w.pose();
 f.setMinute(780);f.step(4);
 assert.ok(Math.hypot(f.w.pose().x-first.x,f.w.pose().y-first.y)<=22);
});
test('Wren follows a real route through the original town pathfinder after schedule changes',()=>{
 const f=fixture({minute:550});const first=f.w.pose();
 f.setMinute(780);f.step(.05,9);
 assert.ok(f.paths>=1);
 assert.ok(Math.hypot(f.w.pose().x-first.x,f.w.pose().y-first.y)>1);
 assert.equal(f.routeHistory[0].b.x,810);
});
test('the child freezes safely while the modal is open, not wandering out of a scene',()=>{
 const f=fixture({minute:550});const first=f.w.pose();
 f.setMinute(780);f.setPaused(true);f.step(.05,30);
 assert.equal(f.w.pose().x,first.x);assert.equal(f.paths,0);
 f.setPaused(false);f.step(.05,5);assert.ok(f.paths>=1);
});
test('old, malformed and duplicate child friendship records are sanitized',()=>{
 const raw={friendships:[{day:2,kind:'story',first:0,last:1},
 {day:2,kind:'color',first:1,last:1},{day:0,kind:'story',first:0,last:0},
 {day:3,kind:'romance',first:0,last:0},{day:4,kind:'nature',first:1,last:2},
 {day:6,kind:'nature',first:1,last:0}]};
 assert.deepEqual(plain(M.clean(raw)),{friendships:[
  {day:2,kind:'story',first:0,last:1},{day:6,kind:'nature',first:1,last:0}],club:{foundation:[],chapters:[]}});
 assert.deepEqual(plain(M.clean(null)),{friendships:[],club:{foundation:[],chapters:[]}});
});
test('bounded older peer histories preserve newest genuine days without growing endlessly',()=>{
 const rows=Array.from({length:90},(_,i)=>({day:i+1,kind:['story','color','nature'][i%3],first:i%2,last:i%2}));
 const out=plain(M.clean({friendships:rows}));
 assert.equal(out.friendships.length,48);
 assert.equal(out.friendships[0].day,43);
 assert.equal(out.friendships.at(-1).day,90);
});
test('Wren’s real child history appears in Pip’s existing Daybook without an extra navigation tab',()=>{
 const f=fixture();assert.match(f.w.panel(),/Wren/);
 assert.match(f.w.panel(),/distinct younger Maplewood resident/);
 f.complete(0,1);
 assert.match(f.w.panel(),/1 completed shared childhood afternoon/);
});
test('real family Connections Atlas knows the independent child without allowing child marriages',()=>{
 const atlas=read('family-atlas-v271.js');
 assert.match(atlas,/child-peer-friendship/);
 assert.match(atlas,/const ADULTS=PEOPLE\.slice\(1,-2\)/);
 assert.match(atlas,/id==='wren'\?null/);
 assert.match(atlas,/ids:\['pip','wren','player'\]/);
});
test('iPhone build loads Wren before save sanitization, routes world touch and uses original art',()=>{
 const game=read('game.js'),html=read('index.html'),sw=read('sw.js'),little=read('little-sprouts-v272.js');
 assert.ok(html.includes('wren-neighbor-v295.js?v=2.9.7'));
 assert.ok(html.includes('wren-neighbor-v295.css?v=2.9.6'));
 assert.ok(html.indexOf('wren-neighbor-v295.js')<html.indexOf('game.js'));
 assert.ok(html.includes('game.js?v=2.9.7'));
 for(const p of ['wren-neighbor-v295.js','wren-neighbor-v295.css'])
  assert.ok(sw.includes("'./"+p+"'"));
 assert.match(sw,/hearth-harbor-v297-friendship-corner/);
 assert.match(game,/youngResidents:\{pip:window\.HearthLittleSprouts\.clean\(raw\.youngResidents\?\.pip\),wren:window\.HearthYoungNeighbors\.clean\(raw\.youngResidents\?\.wren\)\}/);
 assert.match(game,/youngNeighbors\.advance\(dt\)/);
 assert.match(game,/youngNeighbors\.hitMarker\(wx,wy\)/);
 assert.match(game,/youngNeighbors\.hit\(wx,wy\)/);
 assert.match(game,/yn295-/);
 assert.match(game,/isDialogOpen:\(\)=>modal==='young-neighbors'/);
 assert.match(game,/charArt\(window\.HearthYoungNeighbors\.WREN/);
 assert.match(game,/youngNeighbors\.drawAccent/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(little,/api\.getPeerPanel\?\.\(\)/);
 assert.match(read('wren-neighbor-v295.css'),/@media\(max-width:380px\)/);
});
test('repeated read-only child rendering and idle town steps do not rewrite save state',()=>{
 const f=fixture(),before=plain(f.state);const p=art();
 for(let i=0;i<100;i++){f.w.pose();f.w.panel();f.w.drawAccent(p.g,f.w.pose(),i);f.step(.016)}
 assert.deepEqual(plain(f.state),before);assert.equal(f.saves,0);
});
test('no extra services, invisible reward timers, free adult connections or fake family members',()=>{
 const src=read('wren-neighbor-v295.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
 assert.doesNotMatch(src,/marriagePlans|adultRomance|familyRoots|coins\s*\+=/);
});
