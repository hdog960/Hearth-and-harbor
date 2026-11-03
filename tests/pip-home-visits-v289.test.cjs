/* Hearth & Harbor v2.8.9 — genuine three-person cottage visits */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
vm.runInNewContext(read('pip-home-visits-v289.js'),env,{filename:'pip-home-visits-v289.js'});
const V=env.window.HearthPipHomeVisits;
const plain=x=>JSON.parse(JSON.stringify(x));
const ids=Object.keys(V.VISITS);
function fixture({id='jun',day=10,guardian=true,known=true,scene='town',minute=720,
 homeVisits=null,admitted=true}={}){
 const record={guardian:guardian?'player':null,guardianDay:guardian?3:0,
  mentor:{counts:{},last:{}},
  meetings:known?[{id,day:5}]:[],helperProjects:[],
  homeVisits:homeVisits??{pending:null,memories:[]},
  needs:{joy:60,confidence:52,curiosity:55}};
 if(known)record.mentor.counts[id]=1;
 const state={day,minute,youngResidents:{pip:record},coins:415,relations:{[id]:16},weddingPlans:{}};
 const person={id,x:720,y:594,name:id[0].toUpperCase()+id.slice(1)};
 let where=scene,player={x:725,y:600},baseChild={x:735,y:830},
   busy=false,paused=false,done=false,competing=false,blocked=false,
   modal=null,saves=0,updates=0,queued=0,closeTalkCount=0;
 const notes=[];
 const api={getState:()=>state,getChild:()=>record,getScene:()=>where,getPlayer:()=>({...player}),
  getAdults:()=>[person],getBaseChildPose:()=>({...baseChild}),
  nearestWalkable:(p)=>blocked?null:{...p},isWalkable:()=>!blocked,
  findPath:(start,end)=>blocked?[]:[{...end}],
  isPaused:()=>paused,isOwnRoutineBusy:()=>busy,ownDone:()=>done,
  queueOwnAction:kind=>{if(busy)return false;queued++;busy=true;return true;},
  hasCompetingEvent:()=>competing,name:id=>id.toUpperCase(),
  bondAdult:(who,n)=>state.relations[who]=(state.relations[who]||0)+n,
  save:()=>saves++,updateUI:()=>updates++,notify:s=>notes.push(s),
  showModal:(name,html)=>{modal={name,html}},closeModal:()=>{modal=null},
  closeTalk:()=>{closeTalkCount++},openBook:()=>{modal={name:'book',html:'daybook'}}};
 const v=V.setup(api);
 return {v,api,record,state,person,notes,get saves(){return saves},get updates(){return updates},
  get modal(){return modal},get queued(){return queued},get closeTalkCount(){return closeTalkCount},
  setScene:s=>where=s,setMinute:n=>state.minute=n,setDay:d=>state.day=d,
  setPlayer:(x,y)=>player={x,y},setBaseChild:(x,y)=>baseChild={x,y},
  setBusy:b=>busy=b,setDone:b=>done=b,setPaused:b=>paused=b,
  setBlocked:b=>blocked=b,setCompeting:b=>competing=b};
}
function invited(f,id='jun'){
 assert.equal(f.v.inviteEligible(id),true);
 assert.equal(f.v.invitation(id),true);
 assert.equal(f.v.send(id),true);
 assert.equal(f.saves,1);
}
function metAtDoor(f,id='jun'){
 f.setDay(f.state.day+1);f.person.x=V.PORCH.x;f.person.y=V.PORCH.y;
 f.setPlayer(V.PORCH.x+36,V.PORCH.y+19);
 assert.equal(f.v.greetEligible(id),true);
 assert.equal(f.v.greet(id),true);
}
function indoors(f,kind='read'){
 f.setScene('home');f.setPlayer(575,670);
 for(let i=0;i<140;i++)f.v.advance(.05);
 const p=f.v.guestPose();assert.ok(p,'real adult must appear inside, after a true porch greeting');
 assert.ok(Math.hypot(p.x-V.ROOMS[kind].x,p.y-V.ROOMS[kind].y)<38,
  'real adult must have walked to the appropriate furniture');
 const pip=f.v.childPose();assert.ok(pip,'Pip is a third physically modeled participant');
 assert.ok(Math.hypot(pip.x-p.x,pip.y-p.y)<105,'Pip must walk alongside adult');
 f.setPlayer(p.x-75,p.y+20);
}
test('all six real villagers have unique authored family experiences',()=>{
 assert.equal(ids.length,6);
 assert.equal(new Set(ids.map(id=>V.VISITS[id].name)).size,6);
 assert.equal(new Set(ids.map(id=>V.VISITS[id].greet)).size,6);
 for(const id of ids){
  const story=V.VISITS[id];
  assert.ok(['read','meal','hobby'].includes(story.kind));
  assert.equal(story.open.length,2);assert.equal(story.close.length,2);
  assert.equal(story.lines.length,2);assert.ok(['joy','confidence','curiosity'].includes(story.need));
 }
});
test('there are no free invites without chosen guardianship or a real past Pip meeting',()=>{
 for(const o of [{guardian:false},{known:false}]){
  const f=fixture(o);assert.equal(f.v.inviteEligible('jun'),false);
  assert.equal(f.v.send('jun'),false);assert.equal(f.saves,0);
 }
});
test('inviting from an actual adult conversation requires world proximity and safe scheduling',()=>{
 const f=fixture();f.setPlayer(1800,1500);
 assert.equal(f.v.inviteEligible('jun'),false);
 f.setPlayer(725,600);f.setCompeting(true);
 assert.equal(f.v.inviteEligible('jun'),false);
 f.setCompeting(false);assert.equal(f.v.inviteEligible('jun'),true);
});
test('real invitation is saved for tomorrow, not an instantly spawned guest',()=>{
 const f=fixture();invited(f);
 assert.deepEqual(plain(f.record.homeVisits.pending),{id:'jun',day:11,kind:'read'});
 assert.equal(f.v.guestPose(),null);assert.equal(f.v.childPose(),null);
 assert.equal(f.v.greetEligible('jun'),false);
 assert.equal(f.state.coins,415);
});
test('on the next day adult is routed to the real cottage porch by existing NPC movement',()=>{
 const f=fixture();invited(f);f.setDay(11);
 const old={h:'normal',where:[800,800]};
 const next=f.v.schedule('jun',old);
 assert.equal(next.childHomeGuest,true);
 assert.deepEqual(plain(next.where),[V.PORCH.x,V.PORCH.y]);
 assert.notEqual(next.h,'normal');
 assert.equal(f.person.x,720,'a schedule does not teleport the actual NPC');
});
test('weddings and other committed resident activities keep their original schedule',()=>{
 const f=fixture();invited(f);f.setDay(11);f.setCompeting(true);
 const base={h:'wedding',where:[750,910]};
 assert.deepEqual(plain(f.v.schedule('jun',base)),base);
 assert.equal(f.v.greetEligible('jun'),false);
});
test('timed visits are restricted to an authentic 10 AM to 8 PM in-game window',()=>{
 const f=fixture();invited(f);f.setDay(11);
 for(const minute of [440,599,1200,1380]){f.setMinute(minute);assert.equal(f.v.schedule('jun',{h:'old'}).h,'old')}
 f.setMinute(600);assert.equal(f.v.schedule('jun',{h:'old'}).childHomeGuest,true);
});
test('you cannot greet a villager before they have physically reached Poppy’s porch',()=>{
 const f=fixture();invited(f);f.setDay(11);
 assert.equal(f.v.greetEligible('jun'),false);
 f.person.x=V.PORCH.x;f.person.y=V.PORCH.y;
 f.setPlayer(1200,1000);assert.equal(f.v.greetEligible('jun'),false);
 f.setPlayer(540,534);assert.equal(f.v.greetEligible('jun'),true);
});
test('town greeting keeps adult and child out of cottage until original door scene transition',()=>{
 const f=fixture();invited(f);metAtDoor(f);
 assert.equal(f.v.guestPose(),null);assert.equal(f.v.childPose(),null);
 f.v.advance(.15);assert.equal(f.v.guestPose(),null);
 assert.equal(f.state.coins,415);assert.equal(f.saves,1);
});
test('guest and Pip move along genuine world path and only appear in the home scene',()=>{
 const f=fixture();invited(f);metAtDoor(f);
 indoors(f);assert.equal(f.v.guestPose().id,'jun');
 assert.ok(f.v.guestPose().stride>0);
 assert.ok(f.v.childPose().stride>0);
});
test('blocked furniture makes no false guest arrival, memories or pay',()=>{
 const f=fixture();invited(f);metAtDoor(f);f.setScene('home');f.setBlocked(true);
 for(let i=0;i<80;i++)f.v.advance(.05);
 assert.equal(f.v.guestPose(),null);
 assert.equal(f.v.interact(),false);assert.equal(f.saves,1);
});
test('unfinished invitation cannot earn any child need or relationship boosts',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 assert.equal(f.v.interact(),true);assert.match(f.modal.html,/pv289-open/);
 assert.equal(f.state.relations.jun,16);assert.equal(f.record.needs.curiosity,55);
 assert.equal(f.record.homeVisits.memories.length,0);assert.equal(f.saves,1);
});
test('three participants must be physically together to begin the shared household scene',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 f.setPlayer(1200,1300);assert.equal(f.v.interact(),false);
 f.setPlayer(V.ROOMS.read.x,V.ROOMS.read.y);assert.equal(f.v.interact(),true);
});
test('already-used home chores or a busy Daybook cannot be farmed as extra family events',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 f.setBusy(true);assert.equal(f.v.interact(),false);f.setBusy(false);
 f.setDone(true);assert.equal(f.v.interact(),false);
});
test('first written choice queues the original Poppy timed activity, not an instant reward',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 assert.equal(f.v.interact(),true);
 assert.equal(f.v.handle('pv289-open','1'),true);
 assert.equal(f.queued,1);assert.equal(f.v.session.phase,'working');
 assert.equal(f.record.homeVisits.memories.length,0);
 assert.equal(f.saves,1);assert.equal(f.state.relations.jun,16);
});
test('only an authentic once=true household completion from the same day can advance',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 f.v.interact();f.v.handle('pv289-open','0');
 assert.equal(f.v.completed('read',false,11),false);
 assert.equal(f.v.completed('hobby',true,11),false);
 assert.equal(f.v.completed('read',true,10),false);
 assert.equal(f.v.session.phase,'working');
 assert.equal(f.record.homeVisits.memories.length,0);
});
test('the completed physical hold opens a meaningful final choice but grants nothing yet',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 f.v.interact();f.v.handle('pv289-open','1');
 assert.equal(f.v.completed('read',true,11),true);
 assert.equal(f.v.session.phase,'reflect');
 assert.match(f.modal.html,/pv289-close/);
 assert.equal(f.record.homeVisits.memories.length,0);assert.equal(f.saves,1);
});
test('real final choice records exactly one truthful family event, modest needs and adult bond',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 f.v.interact();f.v.handle('pv289-open','1');f.v.completed('read',true,11);
 assert.equal(f.v.handle('pv289-close','0'),true);
 assert.deepEqual(plain(f.record.homeVisits.memories),
  [{id:'jun',day:11,kind:'read',open:1,close:0}]);
 assert.equal(f.state.relations.jun,19);
 assert.equal(f.record.needs.curiosity,60);
 assert.equal(f.state.coins,415);assert.equal(f.saves,2);assert.equal(f.updates,2);
});
test('fake extra button presses cannot repeat a visit or award another friendship boost',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 f.v.interact();f.v.handle('pv289-open','0');f.v.completed('read',true,11);
 f.v.handle('pv289-close','1');
 assert.equal(f.v.handle('pv289-close','0'),false);
 assert.equal(f.v.send('jun'),false);
 assert.equal(f.v.inviteEligible('jun'),false);
 assert.equal(f.state.relations.jun,19);assert.equal(f.saves,2);
});
test('changing scene or game day interrupts a visit without claiming the family reward',()=>{
 const f=fixture();invited(f);metAtDoor(f);indoors(f);
 f.v.interact();f.v.handle('pv289-open','0');
 f.setScene('town');assert.equal(f.v.completed('read',true,11),false);
 assert.equal(f.record.homeVisits.memories.length,0);
 const g=fixture();invited(g);metAtDoor(g);indoors(g);
 g.v.interact();g.v.handle('pv289-open','0');g.setDay(12);
 assert.equal(g.v.completed('read',true,11),false);
});
test('missed invitations can be rescheduled on later days instead of blocking old saves',()=>{
 const f=fixture();invited(f);f.setDay(14);
 assert.equal(f.v.pending,null);
 assert.equal(f.v.inviteEligible('jun'),true);
 assert.equal(f.v.send('jun'),true);
 assert.equal(f.record.homeVisits.pending.day,15);
});
test('safely bounded history rejects invented adults, dates, kinds and duplicate rewards',()=>{
 const rows=plain(V.clean({pending:{id:'jun',day:99,kind:'hobby'},memories:[
  {id:'jun',day:12,kind:'read',open:1,close:0},
  {id:'jun',day:13,kind:'read',open:0,close:1},
  {id:'wrong',day:14,kind:'meal',open:0,close:1},
  {id:'rosie',day:20,kind:'read',open:1,close:1},
  {id:'bea',day:22,kind:'hobby',open:0,close:1},
  {id:'finn',day:0,kind:'read',open:0,close:1}
 ]}));
 assert.deepEqual(rows.memories,[{id:'jun',day:12,kind:'read',open:1,close:0},
  {id:'bea',day:22,kind:'hobby',open:0,close:1}]);
 assert.equal(rows.pending,null);
 assert.deepEqual(plain(V.clean(null)),{pending:null,memories:[]});
});
test('a real admitted visitor is the same original adult sprite, with grounded shared-home artwork',()=>{
 const game=read('game.js');
 assert.match(game,/const actualGuest=NPCS\.find\(n=>n\.id===cottageGuest\.id\)/);
 assert.match(game,/drawCharacter\(ctx,actualGuest,cottageGuest\.x,cottageGuest\.y/);
 assert.match(game,/homeVisits\.drawShared\(ctx,tick\)/);
 assert.match(game,/homeVisits\.hit\(wx,wy\)/);
 assert.match(game,/homeVisits\.interact\(\)/);
});
test('all six genuine adults support their own real furniture action and completed visit',()=>{
 for(const id of ids){
  const f=fixture({id});invited(f,id);metAtDoor(f,id);
  indoors(f,V.VISITS[id].kind);
  assert.equal(f.v.interact(),true,id);
  assert.equal(f.v.handle('pv289-open','0'),true,id);
  assert.equal(f.v.completed(V.VISITS[id].kind,true,11),true,id);
  assert.equal(f.v.handle('pv289-close','1'),true,id);
  assert.equal(f.record.homeVisits.memories[0].id,id);
 }
});
test('iPhone source and offline PWA include real visits before Pip without resetting save',()=>{
 const html=read('index.html'),sw=read('sw.js'),
  game=read('game.js'),little=read('little-sprouts-v272.js'),
  atlas=read('family-atlas-v271.js'),css=read('pip-home-visits-v289.css');
 assert.ok(html.includes('pip-home-visits-v289.js?v=2.9.0'));
 assert.ok(html.includes('pip-home-visits-v289.css?v=2.8.9'));
 assert.ok(html.indexOf('pip-home-visits-v289.js')<html.indexOf('little-sprouts-v272.js'));
 for(const a of ['pip-home-visits-v289.js','pip-home-visits-v289.css'])
  assert.ok(sw.includes("'./"+a+"'"));
 assert.match(sw,/hearth-harbor-v300-chosen-generations/);
 assert.match(game,/homeVisits\.schedule\(n\.id,littleSprouts\.responses\.schedule/);
 assert.match(game,/homeVisits\.completed\(kind,once,state\.day\)/);
 assert.match(game,/pv289-greet/);assert.match(game,/pv289-invite/);
 assert.match(little,/homeVisits\.panel\(\)/);
 assert.match(little,/homeVisits\.childPose\(\)/);
 assert.match(little,/homeVisits\.advance\(dt\)/);
 assert.match(atlas,/child-cottage-visit/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/min-height:48px/);assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:380px\)/);
});
test('the new resident-visit system cannot call an external service or create a new save key',()=>{
 const code=read('pip-home-visits-v289.js');
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});
