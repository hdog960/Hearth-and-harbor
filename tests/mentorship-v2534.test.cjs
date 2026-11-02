/* Hearth & Harbor v2.5.34 — Passing It On genuine mentorship QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const w={window:{}};vm.runInNewContext(read('mentorship-v2534.js'),w,{filename:'mentorship-v2534.js'});
const M=w.window.HearthMentorship;
function fixture(extra={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const needs={};const done={};for(const id of M.IDS){needs[id]={fun:50,social:50,food:65,energy:67};done[id]=[]}
 const plans={},notices=[];let saves=0,updates=0,modal={key:'',html:''};
 const state={day:1,coins:250,townBonds:{'mabel|rosie':7},mentorship:M.clean(null),...extra};
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:s=>notices.push(s),
  getResidentHome:id=>homes[id],getHomeMembers:home=>Object.keys(homes).filter(id=>homes[id]===home),
  getPersonLabel:id=>({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id],
  getHomeLabel:home=>'Little '+home,getNeeds:id=>needs[id],getDone:id=>done[id],
  getSchedule:(_home,id)=>plans[id]||[],addSchedule:(_home,id,action)=>{
   if((plans[id]||[]).length>=3)return false;
   (plans[id]??=[]).push(action);saves++;return true;
  },
  showModal:(key,html)=>modal={key,html},back:()=>modal={key:'daybook',html:'Household Daybook'}};
 const m=M.setup(api);return {state,homes,needs,done,plans,api,m,notices,get saves(){return saves},get updates(){return updates},get modal(){return modal}};
}
function session(f,home='h0',mentor='mabel',lesson='read'){
 assert.equal(f.m.begin(home,mentor,lesson),true);
 assert.equal(f.m.completed(home,mentor,lesson,true,f.state.day).stage,'learner');
 return f.m.completed(home,mentor==='mabel'?'rosie':'mabel',lesson,true,f.state.day);
}
function canvas(){return {count:0,save(){this.count++},restore(){this.count++},translate(){this.count++},
 fillRect(){this.count++},beginPath(){this.count++},arc(){this.count++},ellipse(){this.count++},
 fill(){this.count++},stroke(){this.count++},moveTo(){this.count++},lineTo(){this.count++},
 fillText(){this.count++}}}
test('legacy saves create empty safe optional learning records and four unique subjects',()=>{
 const c=M.clean(null);assert.equal(JSON.stringify(c),JSON.stringify({sessions:{},skills:{},practiceDay:{},bonusDay:{},memories:[]}));
 assert.equal(M.IDS.length,6);assert.equal(Object.keys(M.LESSONS).length,4);
});
test('malformed imports reject fake houses, actors, subjects, dates and phantom sessions',()=>{
 const c=M.clean({sessions:{
  h0:{day:2,mentor:'mabel',learner:'rosie',lesson:'read',stage:'mentor'},
  h1:{day:2,mentor:'oliver',learner:'oliver',lesson:'meal',stage:'finished'},
  h2:{day:2,mentor:'intruder',learner:'finn',lesson:'hobby',stage:'learner'},
  h3:{day:3,mentor:'mabel',learner:'rosie',lesson:'unknown',stage:'mentor'},
  h4:{day:4,mentor:'mabel',learner:'rosie',lesson:'read',stage:'fake'}}});
 assert.equal(Object.keys(c.sessions).length,1);assert.equal(c.sessions.h0.stage,'mentor');
});
test('malformed learned skill import rejects forged acts and caps progress safely',()=>{
 const c=M.clean({skills:{
  mabel:{read:{count:999,lastDay:3},meal:{count:-1,lastDay:2},hacker:{count:20,lastDay:3}},
  hacker:{read:{count:20,lastDay:3}},rosie:{tidy:{count:2,lastDay:-1}}
 },practiceDay:{mabel:3,hacker:7},bonusDay:{mabel:{read:2,wrong:4},hacker:{read:3}}});
 assert.equal(c.skills.mabel.read.count,99);
 assert.equal(Object.keys(c.skills.mabel).length,1);
 assert.equal(Object.keys(c.skills).length,1);assert.equal(Object.keys(c.practiceDay).length,1);
 assert.equal(Object.keys(c.bonusDay.mabel).length,1);
});
test('invalid, duplicate and future-like history entries do not create new memories',()=>{
 const c=M.clean({memories:[
 {home:'h0',day:1,mentor:'mabel',learner:'rosie',lesson:'read'},
 {home:'h0',day:1,mentor:'mabel',learner:'rosie',lesson:'meal'},
 {home:'h8',day:1,mentor:'mabel',learner:'rosie',lesson:'read'},
 {home:'h0',day:1,mentor:'mabel',learner:'mabel',lesson:'read'},
 {home:'h0',day:0,mentor:'mabel',learner:'rosie',lesson:'read'}
 ]});
 assert.equal(c.memories.length,1);
});
test('one or zero resident homes cannot start a two-person lesson',()=>{
 const f=fixture();assert.equal(f.m.begin('h5','mabel','read'),false);
 f.homes.rosie='h4';assert.equal(f.m.begin('h0','mabel','read'),false);
 assert.equal(f.saves,0);
});
test('only current resident mentors, four real actions and valid in-game days are allowed',()=>{
 const f=fixture();for(const [home,mentor,kind] of [
 ['h0','oliver','read'],['h0','mabel','hacker'],['h9','mabel','read']
 ])assert.equal(f.m.begin(home,mentor,kind),false);
 f.state.day=0;assert.equal(f.m.begin('h0','mabel','read'),false);
});
test('a resident who already finished a real same-day task cannot be assigned impossible practice',()=>{
 const f=fixture();f.done.rosie=['meal'];assert.equal(f.m.begin('h0','mabel','meal'),false);
 f.done.rosie=[];f.done.mabel=['meal'];assert.equal(f.m.begin('h0','mabel','meal'),false);
});
test('choosing a mentor never grants a relationship, need, coin or completed lesson',()=>{
 const f=fixture();assert.equal(f.m.begin('h0','mabel','read'),true);
 assert.equal(f.m.current('h0').stage,'mentor');assert.equal(f.m.data.memories.length,0);
 assert.equal(f.needs.rosie.fun,50);assert.equal(f.state.townBonds['mabel|rosie'],7);
 assert.equal(f.state.coins,250);assert.equal(f.saves,1);
});
test('a learner cannot skip a genuine teacher demonstration',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');
 assert.equal(f.m.completed('h0','rosie','read'),false);
 assert.equal(f.m.current('h0').stage,'mentor');
 assert.equal(f.m.skill('rosie','read').count,0);
});
test('a wrong lesson, wrong home or forged actor cannot advance a class',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');
 for(const a of [['h0','mabel','hobby'],['h1','mabel','read'],['h0','intruder','read']])
 assert.equal(f.m.completed(...a),false);
 assert.equal(f.m.current('h0').stage,'mentor');
});
test('real teacher completion advances only the lesson stage without learner rewards',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');
 assert.equal(f.m.completed('h0','mabel','read').stage,'learner');
 assert.equal(f.needs.mabel.social,50);assert.equal(f.needs.rosie.fun,50);
 assert.equal(f.m.data.memories.length,0);
});
test('after teaching, the mentor cannot double-complete practice on behalf of learner',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');f.m.completed('h0','mabel','read');
 assert.equal(f.m.completed('h0','mabel','read'),false);
 assert.equal(f.m.current('h0').stage,'learner');
});
test('two distinct authentic completions earn one recorded lesson and modest social/fun/bond',()=>{
 const f=fixture(),r=session(f);
 assert.equal(r.stage,'finished');assert.equal(r.count,1);assert.equal(r.rank,0);
 assert.equal(f.needs.mabel.social,53);assert.equal(f.needs.rosie.fun,55);
 assert.equal(f.state.townBonds['mabel|rosie'],8);
 assert.equal(f.m.data.memories.length,1);assert.equal(f.state.coins,250);
 assert.equal(f.saves,1,'real household activity path saves true completion');
});
test('repeat task completions never yield an extra practice or relationship reward',()=>{
 const f=fixture();session(f);const before=JSON.stringify(f.m.data);
 for(let i=0;i<20;i++)assert.equal(f.m.completed('h0','rosie','read'),false);
 assert.equal(JSON.stringify(f.m.data),before);
 assert.equal(f.needs.rosie.fun,55);
});
test('one home can finish only one lesson per game day',()=>{
 const f=fixture();session(f);
 assert.equal(f.m.begin('h0','rosie','meal'),false);
 assert.equal(f.m.current('h0').stage,'finished');
});
test('the learner cannot complete a second lesson in another home that same day',()=>{
 const f=fixture();session(f);f.homes.rosie='h1';f.homes.jun='h0';
 assert.equal(f.m.begin('h1','oliver','read'),false);
});
test('changing days expires a partial lesson without granting forgotten practice',()=>{
 const f=fixture();f.m.begin('h0','mabel','meal');f.m.completed('h0','mabel','meal');
 f.state.day=2;assert.equal(f.m.current('h0'),null);
 assert.equal(f.m.completed('h0','rosie','meal'),false);
 assert.equal(f.m.data.memories.length,0);
});
test('moving either resident mid-lesson invalidates its real home context',()=>{
 const f=fixture();f.m.begin('h0','mabel','meal');f.m.completed('h0','mabel','meal');
 f.homes.rosie='h5';assert.equal(f.m.current('h0'),null);
 assert.equal(f.m.completed('h0','rosie','meal'),false);
 assert.equal(f.needs.rosie.fun,50);
});
test('a demonstrated lesson cannot be accidentally replaced without deliberate cancellation',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');f.m.completed('h0','mabel','read');
 assert.equal(f.m.begin('h0','rosie','hobby'),false);
 assert.equal(f.m.current('h0').lesson,'read');
 assert.equal(f.m.cancel('h0'),true);
 assert.equal(f.m.begin('h0','rosie','hobby'),true);
 assert.equal(f.m.data.memories.length,0);
});
test('cancelling the unfinished lesson does not take away earned skills or money',()=>{
 const f=fixture();session(f);f.state.day=2;
 f.m.begin('h0','mabel','meal');const old=JSON.stringify(f.m.data.skills);
 assert.equal(f.m.cancel('h0'),true);
 assert.equal(JSON.stringify(f.m.data.skills),old);
 assert.equal(f.state.coins,250);
});
test('one-tap schedule queues mentor first, then learner only after mentor has truly finished',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');
 assert.equal(f.m.queue('h0'),true);
 assert.equal(JSON.stringify(f.plans),JSON.stringify({mabel:['read']}));
 f.m.completed('h0','mabel','read');
 assert.equal(f.m.queue('h0'),true);
 assert.equal(JSON.stringify(f.plans),JSON.stringify({mabel:['read'],rosie:['read']}));
 assert.equal(f.m.data.memories.length,0);
});
test('existing independent Daybook steps are preserved; duplicate queue actions are not appended',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');f.plans.mabel=['meal','read'];
 assert.equal(f.m.queue('h0'),true);
 assert.equal(JSON.stringify(f.plans.mabel),JSON.stringify(['meal','read']));
});
test('full resident queue is not overwritten by a mentorship instruction',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');f.plans.mabel=['meal','tidy','hobby'];
 assert.equal(f.m.queue('h0'),false);
 assert.equal(JSON.stringify(f.plans.mabel),JSON.stringify(['meal','tidy','hobby']));
});
test('six complete lessons produce rank 3 only after real multiple-day practice',()=>{
 const f=fixture();
 for(let i=1;i<=6;i++){f.state.day=i;const result=session(f);assert.equal(result.count,i)}
 assert.equal(f.m.skill('rosie','read').count,6);
 assert.equal(f.m.levels(6),3);
 assert.equal(f.m.levels(1),0);assert.equal(f.m.levels(2),1);assert.equal(f.m.levels(4),2);
 assert.equal(f.m.data.memories.length,6);
});
test('earned confidence grants only a modest next-day need bonus from a real matching activity',()=>{
 const f=fixture();session(f);f.state.day=2;session(f);
 assert.equal(f.needs.rosie.fun,60);
 assert.equal(f.m.completed('h0','rosie','read',true,2),false,'rank was earned today and cannot be used immediately');
 f.state.day=3;const r=f.m.completed('h0','rosie','read',true,3);
 assert.equal(r.benefit,2);assert.equal(f.needs.rosie.fun,62);
 assert.equal(f.m.completed('h0','rosie','read',true,3),false,'future bonus once per day');
});
test('confidence applies to correct resident and subject, without a passive or offline tick',()=>{
 const f=fixture();session(f);f.state.day=2;session(f);f.state.day=3;
 assert.equal(f.m.completed('h0','mabel','read'),false);
 assert.equal(f.m.completed('h0','rosie','tidy'),false);
 assert.equal(f.needs.rosie.fun,60);
});
test('a trained learner retains permanent progress when moving to a different home',()=>{
 const f=fixture();session(f);f.state.day=2;session(f);f.state.day=3;
 f.homes.rosie='h5';
 assert.equal(f.m.skill('rosie','read').count,2);
 const r=f.m.completed('h5','rosie','read',true,3);
 assert.equal(r.benefit,2);
});
test('relationship and needs remain capped after repeated learned skills across game days',()=>{
 const f=fixture();for(let day=1;day<=6;day++){f.state.day=day;session(f)}
 f.needs.rosie.fun=99;f.needs.mabel.social=99;f.state.townBonds['mabel|rosie']=100;
 f.state.day=7;assert.equal(f.m.completed('h0','rosie','read').benefit,4);
 assert.equal(f.needs.rosie.fun,100);
 assert.equal(f.state.townBonds['mabel|rosie'],100);assert.equal(f.state.coins,250);
});
test('loaded lessons and skill counts survive JSON roundtrip with optional save migration',()=>{
 const f=fixture();session(f);f.state.day=2;session(f);
 const saved=JSON.parse(JSON.stringify(f.m.data));
 const reloaded=fixture({day:3,mentorship:M.clean(saved)});
 assert.equal(reloaded.m.skill('rosie','read').count,2);
 assert.equal(reloaded.m.data.memories.length,2);
 assert.equal(reloaded.m.completed('h0','rosie','read',true,3).benefit,2);
});
test('the journal labels genuine teacher and learner separately and shows skill development',()=>{
 const f=fixture();f.m.begin('h0','mabel','read');f.m.board('h0');
 assert.equal(f.modal.key,'mentorship');assert.match(f.modal.html,/Mabel demonstrates/);
 assert.match(f.modal.html,/2 · Rosie practices/);
 assert.equal((f.modal.html.match(/data-act="mt34-choose"/g)||[]).length,8);
 assert.match(f.modal.html,/data-act="mt34-queue"/);assert.match(f.modal.html,/data-act="mt34-cancel"/);
});
test('menu action routing and deliberate cancellation really change the active plan',()=>{
 const f=fixture();f.m.handle('mt34-choose','h0|mabel|meal','h0');
 assert.equal(f.m.current('h0').lesson,'meal');
 f.m.handle('mt34-cancel','h0','h0');assert.equal(f.m.current('h0'),null);
 f.m.handle('mt34-back',null,'h0');assert.equal(f.modal.key,'daybook');
});
test('distinct in-world lesson boards render only for a real active home session',()=>{
 const f=fixture(),c=canvas();f.m.draw(c,'h0');assert.equal(c.count,0);
 f.m.begin('h0','mabel','read');f.m.draw(c,'h0');assert.ok(c.count>15);
 const n=c.count;f.m.draw(c,'h1');assert.equal(c.count,n);
});
test('actual game uses real guided, autonomous and completed hobby studio paths only',()=>{
 const g=read('game.js');
 for(const key of ["window.HearthMentorship.clean(raw.mentorship)","window.HearthMentorship.setup({",
  "mentorship.completed(activeResidence,n.id,kind,true,state.day)",
  "mentorship.completed(activeResidence,id,kind,true,state.day)",
  "mentorship.completed(activeResidence,id,'hobby',true,state.day)",
  "mentorship.draw(ctx,activeResidence)",
  "btn('🎓 Passing It On · Mentorship','mt34-board')",
  "if(action.startsWith('mt34-'))"])assert.ok(g.includes(key),key);
});
test('original save and other genuine family gameplay remain available',()=>{
 const g=read('game.js');
 for(const key of ["const SAVE='hearth-harbor-save-v1'",
 "HearthFamilyRoots.setup({","HearthHouseholdChronicle.setup({","HearthRoommateProjects.setup({",
 "HearthHouseholdSchedules.setup({"])assert.ok(g.includes(key),key);
 assert.doesNotMatch(read('mentorship-v2534.js'),/fetch\(|XMLHttpRequest|WebSocket|new Image\(|setInterval|localStorage|\.coins\s*[+]=/);
});
test('iPhone loads current mentorship assets offline and presents accessible mobile touch targets',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('mentorship-v2534.css');
 for(const asset of ['mentorship-v2534.js','mentorship-v2534.css'])
  assert.ok(html.includes(asset)&&sw.includes("'./"+asset+"'"));
 assert.ok(html.indexOf('mentorship-v2534.js')<html.indexOf('game.js'));
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/);
 for(const key of ['@media(max-width:390px)','@media(min-width:700px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(key),key);
});
