/* Hearth & Harbor v2.5.26 — Household Promises regression suite */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context={window:{}};vm.runInNewContext(read('household-roles-v2526.js'),context,{filename:'household-roles-v2526.js'});
vm.runInNewContext(read('household-rhythms-v2516.js'),context,{filename:'household-rhythms-v2516.js'});
const M=context.window.HearthHouseholdRoles,R=context.window.HearthHouseholdRhythms;
function harness(opts={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2',...(opts.homes||{})};
 const state={day:1,coins:250,needs:{fun:40,social:40,energy:45,hunger:40},residentLife:{},
  householdRoles:M.clean(null),householdRhythms:R.clean(null),...opts.state};
 for(const id of M.PEOPLE.filter(x=>x!=='player')){
  if(!state.residentLife[id])state.residentLife[id]={needs:{fun:40,social:40,energy:45,food:40}};
 }
 let saves=0,updates=0,notices=[],view={key:'',html:''},closed=0;
 const memberList=h=>h==='player'?['player']:Object.keys(homes).filter(id=>homes[id]===h);
 const callbacks={
  getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:s=>notices.push(s),
  showModal:(key,html)=>view={key,html},closeModal:()=>closed++,
  getHomeLabel:h=>'Apartment '+h,getPersonLabel:id=>id==='player'?'Poppy':id,
  getHomeMembers:memberList,getResidentHome:id=>homes[id],
  getNeeds:id=>id==='player'?state.needs:state.residentLife[id]?.needs
 };
 const roles=M.setup(callbacks);
 return {roles,state,homes,memberList,callbacks,get saves(){return saves},
  get updates(){return updates},get last(){return view},get notices(){return notices},get closed(){return closed}};
}
test('legacy state loads seven empty homes, five original roles and no implicit chores',()=>{
 const s=M.clean(null);
 assert.equal(Object.keys(s.homes).length,7);assert.equal(M.ROLES.length,5);
 assert.equal(Object.keys(s.daily).length,0);assert.equal(s.memories.length,0);
 for(const id of M.HOMES){assert.equal(s.homes[id].total,0);assert.equal(Object.keys(s.homes[id].roles).length,0)}
});
test('dirty imports reject unknown actors, forged homes, duplicate roles and inflated records',()=>{
 const s=M.clean({homes:{
  player:{roles:{player:'cook',mabel:'host'},total:-1},
  h0:{roles:{mabel:'host',rosie:'host',finn:'robot'},total:Infinity},
  unknown:{total:9999}
 },daily:{mabel:{day:1,home:'h0',role:'host'},rosie:{day:30000,home:'h0',role:'host'},
  player:{day:1,home:'h0',role:'cook'}},
 memories:[{day:1,home:'h0',actor:'mabel',role:'host'},{day:1,home:'h0',actor:'mabel',role:'host'},
 {day:2,home:'player',actor:'oliver',role:'cook'}]});
 assert.equal(s.homes.player.roles.player,'cook');
 assert.equal(s.homes.player.total,0);
 assert.equal(s.homes.h0.roles.mabel,'host');
 assert.equal(s.homes.h0.roles.rosie,undefined);
 assert.equal(s.homes.h0.total,0);assert.equal(s.homes.unknown,undefined);
 assert.equal(Object.keys(s.daily).length,1);
 assert.equal(s.memories.length,1);
});
test('assigning a real responsibility persists once without generating needs or money',()=>{
 const h=harness(),start=h.state.residentLife.mabel.needs.fun;
 assert.equal(h.roles.assign('h0','mabel','caretaker'),true);
 assert.equal(h.roles.assigned('h0','mabel'),'caretaker');
 assert.equal(h.saves,1);assert.equal(h.updates,1);
 assert.equal(h.roles.assign('h0','mabel','caretaker'),false);
 assert.equal(h.saves,1);
 assert.equal(h.state.coins,250);assert.equal(h.state.residentLife.mabel.needs.fun,start);
});
test('two roommates can have different jobs but cannot both claim the same assignment',()=>{
 const h=harness();
 h.roles.assign('h0','mabel','cook');
 assert.equal(h.roles.assign('h0','rosie','cook'),false);
 assert.equal(h.roles.assigned('h0','rosie'),null);
 assert.equal(h.roles.assign('h0','rosie','host'),true);
 assert.equal(h.roles.assigned('h0','rosie'),'host');
 assert.equal(h.roles.assigned('h0','mabel'),'cook');
 assert.equal(h.saves,2);
});
test('player cannot be assigned to a resident house and resident cannot work the player home',()=>{
 const h=harness();
 for(const [home,id] of [['h0','player'],['player','mabel'],['h9','mabel'],['h0','invalid']])
  assert.equal(h.roles.assign(home,id,'host'),false);
 assert.equal(h.roles.assign('h0','mabel','invalid'),false);
 assert.equal(h.saves,0);
});
test('one genuinely completed caretaker action helps the actor and the housemate',()=>{
 const h=harness();h.roles.assign('h0','mabel','caretaker');
 const before=h.saves;
 const a=h.roles.complete('h0','mabel','tidy',true);
 assert.equal(a.role,'caretaker');
 assert.equal(h.state.residentLife.mabel.needs.fun,43);
 assert.equal(h.state.residentLife.rosie.needs.energy,51);
 assert.equal(h.roles.data.homes.h0.total,1);
 assert.equal(h.roles.data.memories.length,1);
 assert.equal(h.saves,before,'original Daybook owns the completion save');
});
test('family cook feeds a housemate, never grants dishes or coins',()=>{
 const h=harness();h.roles.assign('h0','mabel','cook');
 assert.equal(h.roles.complete('h0','mabel','meal',true).role,'cook');
 assert.equal(h.state.residentLife.rosie.needs.food,48);
 assert.equal(h.state.coins,250);
 assert.equal('cooking' in h.state,false);
});
test('story keeper, host and maker grant differentiated small daily benefits',()=>{
 const scenarios=[
  ['storykeeper','read','fun',6],
  ['host','chat','social',7],
  ['maker','hobby','fun',6]
 ];
 for(const [role,action,key,bonus] of scenarios){
  const h=harness();h.roles.assign('h0','mabel',role);
  assert.equal(h.roles.complete('h0','mabel',action,true).role,role);
  assert.equal(h.state.residentLife.rosie.needs[key],40+bonus);
 }
});
test('Poppy may choose optional solo roles, recovering existing needs without fake roommates',()=>{
 const h=harness();h.roles.assign('player','player','cook');
 assert.equal(h.roles.complete('player','player','meal',true).role,'cook');
 assert.equal(h.state.needs.fun,43);
 assert.equal(h.state.needs.hunger,44);
 assert.equal(h.state.coins,250);
});
test('false starts, repeated controls, incorrect tasks and completed Daybook repeats never pay',()=>{
 const h=harness();h.roles.assign('h0','rosie','host');
 const old=h.state.residentLife.rosie.needs.fun;
 assert.equal(h.roles.complete('h0','rosie','chat',false),false);
 assert.equal(h.roles.complete('h0','rosie','tidy',true),false);
 assert.equal(h.roles.complete('h0','rosie','chat',true,2),false);
 assert.equal(h.roles.data.homes.h0.total,0);
 assert.equal(h.state.residentLife.rosie.needs.fun,old);
});
test('switching roles cannot farm more than one bonus per actor per day',()=>{
 const h=harness();h.roles.assign('h0','mabel','host');
 assert.equal(h.roles.complete('h0','mabel','chat',true).role,'host');
 h.roles.assign('h0','mabel','cook');
 assert.equal(h.roles.complete('h0','mabel','meal',true),false);
 assert.equal(h.roles.data.homes.h0.total,1);
 assert.equal(h.roles.data.memories.length,1);
 assert.equal(h.state.residentLife.rosie.needs.food,40);
});
test('moving a roommate between houses mid-day never grants a second promise',()=>{
 const h=harness();h.roles.assign('h0','mabel','host');
 h.roles.complete('h0','mabel','chat');
 h.homes.mabel='h1';
 h.roles.assign('h1','mabel','cook');
 assert.equal(h.roles.complete('h1','mabel','meal'),false);
 assert.equal(h.roles.data.homes.h0.total,1);assert.equal(h.roles.data.homes.h1.total,0);
 h.state.day=2;
 assert.equal(h.roles.complete('h1','mabel','meal').role,'cook');
 assert.equal(h.roles.data.homes.h1.total,1);
});
test('stale job assignment from a previous residence cannot affect a different home',()=>{
 const h=harness();h.roles.assign('h0','mabel','host');
 h.homes.mabel='h1';
 assert.equal(h.roles.complete('h0','mabel','chat'),false);
 assert.equal(h.roles.currentDuty('mabel'),null);
});
test('reloading stored daily credit blocks duplicate reward, but next day reopens it',()=>{
 const h=harness();h.roles.assign('h0','mabel','caretaker');
 h.roles.complete('h0','mabel','tidy');
 const saved=M.clean(JSON.parse(JSON.stringify(h.roles.data)));
 const restored=harness({state:{householdRoles:saved,day:1}});
 assert.equal(restored.roles.complete('h0','mabel','tidy'),false);
 restored.state.day=2;
 assert.equal(restored.roles.complete('h0','mabel','tidy').role,'caretaker');
 assert.equal(restored.roles.data.homes.h0.total,2);
});
test('three real completed duties across separate game days unlock a single painted rug',()=>{
 const h=harness();h.roles.assign('h0','mabel','caretaker');
 for(let day=1;day<=3;day++){h.state.day=day;h.roles.complete('h0','mabel','tidy')}
 assert.equal(h.roles.unlocked('h0'),true);
 assert.equal(h.roles.unlocked('h1'),false);
 assert.equal(h.roles.data.homes.h0.total,3);
 assert.match(h.notices.at(-1),/handwoven Household Promise rug/);
 const canvas={save(){},restore(){},translate(){},beginPath(){},ellipse(){this.ellipses++;},fill(){},stroke(){},moveTo(){},quadraticCurveTo(){},ellipses:0};
 h.roles.drawFloor(canvas,'h0');
 assert.ok(canvas.ellipses>8);
 const old=canvas.ellipses;h.roles.drawFloor(canvas,'h1');
 assert.equal(canvas.ellipses,old,'no rug for unearned home');
});
test('a legitimate home action never changes the save until its normal caller saves',()=>{
 const h=harness();h.roles.assign('player','player','host');
 const before=h.saves;
 h.roles.complete('player','player','chat');
 assert.equal(h.saves,before);
 assert.equal(h.state.coins,250);
 assert.equal(h.state.needs.social,44);
});
test('planner honors voluntary responsibilities after urgent needs and aspirations',()=>{
 const full={energy:83,food:83,social:83,fun:83};
 let a=R.intention({id:'mabel',needs:full,minute:720,roommate:true,duty:{action:'tidy',title:'Home Caretaker'}});
 assert.equal(a.action,'tidy');assert.equal(a.priority,'duty');
 a=R.intention({id:'mabel',needs:{...full,energy:5},minute:720,roommate:true,duty:{action:'tidy',title:'Home Caretaker'}});
 assert.equal(a.action,'rest');assert.equal(a.priority,'care');
 a=R.intention({id:'mabel',needs:full,minute:720,roommate:true,duty:{action:'tidy',title:'Home Caretaker'},aspiration:{action:'read',label:'Story dreams'}});
 assert.equal(a.action,'read');assert.equal(a.priority,'dream');
 assert.notEqual(R.intention({id:'mabel',needs:full,minute:720,roommate:true,done:['tidy'],duty:{action:'tidy',title:'Caretaker'}}).priority,'duty');
});
test('planner reads the real current-day assigned role, not invented assignments',()=>{
 const h=harness();
 assert.equal(h.roles.currentDuty('mabel'),null);
 h.roles.assign('h0','mabel','maker');
 assert.equal(h.roles.currentDuty('mabel').action,'hobby');
 h.roles.complete('h0','mabel','hobby',true);
 assert.equal(h.roles.currentDuty('mabel'),null);
 h.state.day=2;
 assert.equal(h.roles.currentDuty('mabel').action,'hobby');
});
test('UI offers five selectable duties for each real member, not absent neighbors',()=>{
 const h=harness();h.roles.board('h0');
 assert.equal(h.last.key,'household-roles');
 assert.equal((h.last.html.match(/data-act="hr26-assign"/g)||[]).length,12,'five roles and free control per two people');
 assert.match(h.last.html,/Our Household Promises/);
 assert.match(h.last.html,/mabel/);
 assert.match(h.last.html,/rosie/);
 assert.doesNotMatch(h.last.html,/finn.*Today.s promise/);
 assert.equal((h.last.html.match(/data-act="hr26-view"/g)||[]).length,7);
});
test('UI empty residence is descriptive; no phantom member can be assigned',()=>{
 const h=harness();h.roles.board('h6');
 assert.equal(h.last.key,'household-roles');
 h.roles.board('h5');
 assert.match(h.last.html,/currently empty/);
 assert.equal(h.roles.assign('h5','mabel','host'),false);
});
test('role board remains optional and uses keyboard focus and narrow iPhone styles',()=>{
 const css=read('household-roles-v2526.css');
 for(const token of ['@media(max-width:390px)','@media(min-width:640px)','button:focus-visible','touch-action:manipulation','min-height:48px','prefers-reduced-motion:reduce'])assert.ok(css.includes(token),token);
 const h=harness();h.roles.board('player');
 assert.match(h.last.html,/Roles are optional|Roles are optional and/);
 assert.match(h.last.html,/role="group"/);
 assert.equal(h.state.coins,250);assert.equal(h.saves,0);
});
test('main game routes actions and observes only completed guided, automated and studio tasks',()=>{
 const game=read('game.js');
 for(const token of [
  'window.HearthHouseholdRoles.clean(raw.householdRoles)',
  'window.HearthHouseholdRoles.setup({',
  "householdRoles.complete('player','player',kind,true,state.day)",
  'householdRoles.complete(activeResidence,n.id,kind,true,state.day)',
  'householdRoles.complete(activeResidence,id,kind,true,state.day)',
  "householdRoles.complete(activeResidence,id,'hobby',true,state.day)",
  'getDuty:id=>householdRoles.currentDuty(id)',
  "householdRoles.drawFloor(ctx,'player')",
  'householdRoles.drawFloor(ctx,activeResidence)',
  "if(action==='hr26-board')return householdRoles.board(id||(scene==='residence'?activeResidence:'player'))"
 ])assert.ok(game.includes(token),token);
});
test('only local saves and existing needs are used: no passive coins, timers or external requests',()=>{
 const src=read('household-roles-v2526.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|setTimeout|setInterval|localStorage|sessionStorage|\.coins\s*[+=]/);
 assert.match(read('game.js'),/const SAVE='hearth-harbor-save-v1'/);
 assert.match(read('game.js'),/homeTraditions:window.HearthHomeTraditions.clean/);
});
test('new module loads before the real game, is cached offline and the release is labeled accurately',()=>{
 const html=read('index.html'),sw=read('sw.js');
 for(const file of ['household-roles-v2526.js','household-roles-v2526.css'])
  assert.ok(html.includes(file)&&sw.includes("'./"+file+"'"),file);
 assert.ok(html.indexOf('household-roles-v2526.js')<html.indexOf('game.js'));
 assert.ok(html.indexOf('household-roles-v2526.js')<html.indexOf('household-rhythms-v2516.js'));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
 assert.match(html,/<title>Hearth & Harbor · [^<]+ v2\.(?:5\.\d+|6\.\d+)[0-9]+<\/title>/);
});
