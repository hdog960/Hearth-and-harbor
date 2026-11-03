/* Hearth & Harbor v2.8.8 — earned family interests, living cottage QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const file of ['pip-home-rhythms-v288.js','pip-home-help-v276.js'])
 vm.runInNewContext(read(file),env,{filename:file});
const R=env.window.HearthPipHomeRhythms,H=env.window.HearthPipHomeHelp;
const plain=x=>JSON.parse(JSON.stringify(x));
const traits=R.TRAITS,ids=R.KINDS;
function fixture({day=12,guardian=true,help=[],raw=null,scene='home'}={}){
 const child={guardian:guardian?'player':null,guardianDay:guardian?3:0,
  homeHelps:plain(help),homeRhythms:raw,needs:{curiosity:55,joy:60,confidence:51}};
 const state={day,minute:810,youngResidents:{pip:child},coins:350,weddingPlans:{},householdMoves:[],relations:{}};
 let currScene=scene,hold=null,near=true,paused=false,modal=null,saves=0,updates=0,queueCalls=0;
 const notifications=[];
 const api={getState:()=>state,getChild:()=>child,getScene:()=>currScene,
  getHold:()=>hold,nearestWalkable:p=>p,isWalkable:()=>true,
  notify:s=>notifications.push(s)};
 const rhythms=R.setup(api);
 const home=H.setup({...api,nearChild:()=>near,
  ownDone:()=>false,ownHold:()=>hold,
  onSharedHomeCompleted:r=>rhythms.completed(r),
  getHomeRhythmsPanel:()=>rhythms.panel(),
  queueAction:()=>{queueCalls++;return true},closeModal:()=>{modal=null},
  save:()=>saves++,updateUI:()=>updates++,openBook:()=>{modal='daybook'}});
 return {state,child,rhythms,home,notifications,api,get saves(){return saves},
  get updates(){return updates},get queueCalls(){return queueCalls},
  setScene:s=>currScene=s,setHold:(kind,remaining=1)=>{hold={kind,remaining,duration:3.8}},
  setNear:b=>near=b,setMinute:n=>state.minute=n,setDay:d=>state.day=d};
}
const record=(day,kind)=>({day,kind});
function completed(f,kind){
 assert.equal(f.home.plan(kind),true,'an authentic in-person plan must be queued');
 f.setHold(kind,0);
 assert.equal(f.home.complete(kind,true,f.state.day),true);
 f.setHold(null);
}
test('four distinct home interests, art and child care themes exist',()=>{
 assert.deepEqual(plain(ids),['read','tidy','meal','hobby']);
 assert.equal(new Set(ids.map(k=>traits[k].name)).size,4);
 assert.equal(new Set(ids.map(k=>traits[k].verb)).size,4);
 assert.equal(new Set(ids.map(k=>traits[k].site.join(','))).size,4);
 for(const k of ids)assert.ok(['confidence','joy','curiosity'].includes(traits[k].need));
});
test('a completely new child has no invented prior interest or house keepsake',()=>{
 const f=fixture();
 assert.deepEqual(plain(f.rhythms.profile().counts),{read:0,tidy:0,meal:0,hobby:0});
 assert.equal(f.rhythms.profile().kind,null);
 assert.equal(f.rhythms.drawHome({save(){},restore(){},fillRect(){}},2),false);
 assert.equal(f.saves,0);
});
test('a parentless child cannot secretly gain household traits',()=>{
 const f=fixture({guardian:false});
 assert.equal(f.rhythms.panel(),'');
 assert.equal(f.rhythms.completed(record(12,'read')),false);
 assert.equal(f.rhythms.adjustPose({scene:'home',slot:2,x:700,y:700}).x,700);
});
test('old genuine home-help records migrate into interest counts safely',()=>{
 const old=[record(4,'read'),record(5,'read'),record(6,'meal'),record(7,'hobby')];
 const f=fixture({help:old});
 const p=f.rhythms.profile();
 assert.equal(p.counts.read,2);assert.equal(p.counts.meal,1);
 assert.equal(p.kind,'read');assert.deepEqual(plain(p.earned),['read']);
 assert.equal(f.child.homeRhythms,null,'old saves are not rewritten until a genuine new action');
});
test('duplicate same-day old records do not double count',()=>{
 const x=plain(R.clean(null,[record(4,'read'),record(4,'read'),record(5,'meal')],3));
 assert.equal(x.totals.read,1);assert.equal(x.totals.meal,1);
});
test('pre-guardian records are not treated as shared family care',()=>{
 const x=plain(R.clean(null,[record(2,'read'),record(3,'read'),record(4,'meal')],4));
 assert.equal(x.totals.read,0);assert.equal(x.totals.meal,1);
});
test('invalid IDs, dates and bad saved interest counts are sanitized',()=>{
 const x=plain(R.clean({totals:{read:50000,tidy:-1,meal:'yes',hobby:2},
  last:{kind:'unknown',day:7}},
  [{day:0,kind:'read'},record(5,'unknown'),record(6,'tidy')],3));
 assert.deepEqual(x.totals,{read:0,tidy:1,meal:0,hobby:2});assert.equal(x.last.kind,'tidy');
});
test('planning an activity or tapping the menu alone earns absolutely nothing',()=>{
 const f=fixture();
 assert.equal(f.home.plan('read'),true);
 assert.equal(f.rhythms.profile().counts.read,0);
 assert.equal(f.child.homeHelps.length,0);
 assert.equal(f.saves,0);
 assert.equal(f.state.coins,350);
});
test('only actual finished timed household actions increment interests and preserve one base save',()=>{
 const f=fixture();completed(f,'read');
 assert.equal(f.child.homeHelps.length,1);
 assert.equal(f.child.homeRhythms.totals.read,1);
 assert.equal(f.child.homeRhythms.last.day,12);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.equal(f.state.coins,350);
});
test('finishing the same action again cannot duplicate an earned day',()=>{
 const f=fixture();completed(f,'read');
 assert.equal(f.home.complete('read',true,12),false);
 assert.equal(f.rhythms.completed(record(12,'read')),false);
 assert.equal(f.child.homeRhythms.totals.read,1);assert.equal(f.saves,1);
});
test('once=false, wrong action, wrong day and cancellation earn no interest',()=>{
 const f=fixture();f.home.plan('read');
 assert.equal(f.home.complete('read',false,12),false);
 assert.equal(f.home.complete('meal',true,12),false);
 assert.equal(f.home.complete('read',true,11),false);
 assert.equal(f.home.cancel(),true);
 assert.equal(f.home.complete('read',true,12),false);
 assert.equal(f.rhythms.profile().counts.read,0);assert.equal(f.saves,0);
});
test('changing scenes invalidates unfinished cottage memories',()=>{
 const f=fixture();f.home.plan('tidy');f.setScene('town');
 assert.equal(f.home.complete('tidy',true,12),false);
 assert.equal(f.child.homeRhythms,null);
 assert.equal(f.saves,0);
});
test('genuinely earned second day unveils a distinctive handmade prop',()=>{
 const f=fixture({help:[record(9,'read')],day:12});
 completed(f,'read');
 assert.equal(f.child.homeRhythms.totals.read,2);
 assert.equal(f.rhythms.profile().kind,'read');
 assert.equal(f.rhythms.profile().earned.includes('read'),true);
 assert.ok(f.notifications.some(x=>x.includes('handmade home detail')));
 const draws=[],g={save(){},restore(){},fillRect(...args){draws.push(args)}};
 assert.equal(f.rhythms.drawHome(g,0.7),true);
 assert.ok(draws.length>=4);
});
test('four different genuine two-day activities have four unique little props',()=>{
 const helps=ids.flatMap((k,i)=>[record(3+i*2,k),record(4+i*2,k)]);
 const f=fixture({help:helps,day:20});
 const p=f.rhythms.profile();assert.deepEqual(plain(p.earned),plain(ids));
 const draws=[],g={save(){},restore(){},fillRect(...x){draws.push(x)}};
 assert.equal(f.rhythms.drawHome(g,0),true);assert.ok(draws.length>=18);
});
test('a preferred interest changes the actual afternoon routine but not the base schedule',()=>{
 const f=fixture({help:[record(4,'hobby'),record(5,'hobby')]});
 const base={x:735,y:830,scene:'home',slot:2,prop:'crayon',note:'default',moving:false};
 f.setMinute(840);
 const outcome=f.rhythms.adjustPose(base);
 assert.equal(outcome.label.includes('Curious Maker'),true);
 assert.equal(outcome.x,traits.hobby.afternoon[0]);
 assert.equal(outcome.y,traits.hobby.afternoon[1]);
 assert.equal(base.x,735,'do not mutate the original routine');
});
test('daily pose blends naturally rather than teleporting to the favorite corner at noon',()=>{
 const f=fixture({help:[record(4,'read'),record(5,'read')]});
 const base={scene:'home',slot:2,x:730,y:825,progress:.5};
 f.setMinute(720);assert.equal(f.rhythms.adjustPose(base).x,730);
 f.setMinute(752);const mid=f.rhythms.adjustPose(base);
 assert.ok(mid.x>traits.read.afternoon[0]&&mid.x<730);
 f.setMinute(900);assert.equal(f.rhythms.adjustPose(base).x,traits.read.afternoon[0]);
});
test('no routine override outside afternoon, during projects, or in another scene',()=>{
 const f=fixture({help:[record(4,'read'),record(5,'read')]});
 const base={scene:'home',slot:0,x:730,y:825};
 assert.equal(f.rhythms.adjustPose(base),base);
 assert.equal(f.rhythms.adjustPose({...base,slot:2,project:true}).x,730);
 f.setScene('town');assert.equal(f.rhythms.adjustPose({...base,slot:2}).x,730);
});
test('blocked destination leaves the child safely at the original location',()=>{
 const f=fixture({help:[record(4,'read'),record(5,'read')]});
 f.api.nearestWalkable=()=>({x:1000,y:1000});
 assert.equal(f.rhythms.adjustPose({scene:'home',slot:2,x:735,y:830}).x,735);
});
test('Pip can change what they enjoy through truly completed later days',()=>{
 const helps=[record(4,'read'),record(5,'read'),record(6,'tidy'),record(7,'tidy')];
 const f=fixture({help:helps,day:12});
 assert.equal(f.rhythms.profile().kind,'tidy','most recent interest breaks genuine ties');
 completed(f,'read');assert.equal(f.rhythms.profile().kind,'read');
 assert.equal(f.child.homeRhythms.totals.read,3);
});
test('sustained interests survive homeHelp historical 36-record rollover',()=>{
 const raw={totals:{read:25,tidy:1,meal:2,hobby:0},last:{kind:'read',day:49}};
 const help=[record(50,'meal'),record(51,'read')];
 const f=fixture({day:52,help,raw});
 assert.equal(f.rhythms.profile().counts.read,25);
 assert.equal(f.rhythms.profile().kind,'read');
});
test('not every child receives new care props: hands move only during the real hold',()=>{
 const f=fixture({help:[record(9,'read')]}),calls=[];
 const g={save(){},restore(){},fillRect(...x){calls.push(x)}},pos={x:720,y:800};
 assert.equal(f.rhythms.drawParticipation(g,pos,'read',0),false);
 f.setHold('read');assert.equal(f.rhythms.drawParticipation(g,pos,'read',0),true);
 assert.ok(calls.length>=4);
 assert.equal(f.rhythms.drawParticipation(g,pos,'hobby',0),false);
});
test('the character identity panel is small and requires real guardianship',()=>{
 const f=fixture({help:[record(4,'read'),record(5,'read')]});
 assert.match(f.home.panel(),/Little Storykeeper/);
 assert.match(f.home.panel(),/ph288-identity/);
 assert.match(f.rhythms.panel(),/2 ✓/);
 const g=fixture({guardian:false});assert.equal(g.rhythms.panel(),'');
});
test('iPhone PWA loads the new module before Pip and renders real pixel props',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),
  little=read('little-sprouts-v272.js'),routines=read('pip-routines-v273.js'),home=read('pip-home-help-v276.js'),css=read('pip-home-rhythms-v288.css');
 assert.ok(html.includes('pip-home-rhythms-v288.js?v=2.8.8'));
 assert.ok(html.includes('pip-home-rhythms-v288.css?v=2.8.8'));
 assert.ok(html.indexOf('pip-home-rhythms-v288.js')<html.indexOf('little-sprouts-v272.js'));
 for(const f of ['pip-home-rhythms-v288.js','pip-home-rhythms-v288.css'])assert.ok(sw.includes("'./"+f+"'"));
 assert.match(sw,/hearth-harbor-v298-childhood-reunions/);
 assert.ok(html.includes('pip-home-help-v276.js?v=2.8.8'));
 assert.ok(html.includes('pip-routines-v273.js?v=2.8.8'));
 assert.ok(html.includes('little-sprouts-v272.js?v=2.9.5'));
 assert.ok(html.includes('game.js?v=2.9.8'));
 assert.match(game,/littleSprouts\.homeRhythms\.drawHome/);
 assert.match(routines,/api\.adjustHomePose\?\.\(actual\)/);
 assert.match(home,/api\.onSharedHomeCompleted\?\.\(record\)/);
 assert.match(little,/homeRhythms\.drawParticipation/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/:focus-visible|ph288-identity/);
 assert.match(css,/@media\(max-width:380px\)/);
});
test('no external services, secondary browser data, timers or monetization',()=>{
 const code=read('pip-home-rhythms-v288.js');
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});
