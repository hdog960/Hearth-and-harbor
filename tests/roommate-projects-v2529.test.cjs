/* Hearth & Harbor v2.5.29 — actual Together At Home cohabitation tests */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const base=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(base,n),'utf8');
const win={window:{}};vm.runInNewContext(read('roommate-projects-v2529.js'),win,{filename:'roommate-projects-v2529.js'});
const R=win.window.HearthRoommateProjects;
function fixture(opts={}){
 const at={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const state={day:1,coins:300,townBonds:{},residentLife:{},roommateProjects:R.clean(null),...opts};
 for(const id of R.PEOPLE)state.residentLife[id]??={needs:{food:60,fun:50,social:52,energy:55}};
 let saved=0,updated=0,modal={key:'',html:''};const news=[],schedules={};
 const callbacks={getState:()=>state,save:()=>saved++,updateUI:()=>updated++,notify:s=>news.push(s),
  showModal:(key,html)=>modal={key,html},getHomeMembers:home=>Object.keys(at).filter(id=>at[id]===home),
  getResidentHome:id=>at[id],getPersonLabel:id=>({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id]||id,
  getHomeLabel:home=>'Little Room '+home,getNeeds:id=>state.residentLife[id]?.needs,
  getSchedule:(_home,id)=>schedules[id]||[],addSchedule:(_home,id,action)=>{
   if((schedules[id]||[]).length>=3)return false;
   (schedules[id]??=[]).push(action);saved++;return true},
  openDaybook:()=>{modal={key:'daybook',html:'Household Daybook'}}
 };
 const work=R.setup(callbacks);
 return {work,state,at,schedules,callbacks,get saves(){return saved},get updates(){return updated},get latest(){return modal},get news(){return news}};
}
const project=(h,id='morning')=>{assert.equal(h.work.arm('h0',id),true);return h.work.pending('h0')};
const finish=(h,id='morning')=>{const r=project(h,id),acts=R.PROJECTS[id].actions;
 assert.equal(h.work.recordAction('h0',r.pair[0],acts[0],true).stage,1);
 return h.work.recordAction('h0',r.pair[1],acts[1],true);
};
test('old saves safely initialize six independent household records with three authored projects',()=>{
 const data=R.clean(null);assert.equal(Object.keys(data.homes).length,6);
 assert.equal(Object.keys(R.PROJECTS).length,3);
 for(const h of R.HOMES)assert.equal(data.homes[h].keepsakes.length,0);
 assert.equal(data.history.length,0);
});
test('imported malformed, unknown and prototype-like project IDs are rejected',()=>{
 const a=R.clean({homes:{h0:{day:1,project:'__proto__',pair:['mabel','rosie'],done:['mabel'],keepsakes:['story','story','bogus']},
 h1:{day:2,project:'morning',pair:['oliver','oliver'],finishedDay:-1},h2:{day:2,project:'evening',pair:['bea','finn'],done:['bea','fake','bea']}},
 history:[{day:1,home:'h0',project:'morning',pair:['mabel','rosie']},{day:1,home:'h0',project:'morning',pair:['mabel','rosie']},{day:2,home:'fake',project:'evening',pair:['bea','finn']}]});
 assert.equal(a.homes.h0.project,'');
 assert.equal(a.homes.h0.keepsakes.length,1);
 assert.equal(a.homes.h1.project,'');
 assert.equal(a.homes.h2.done.length,1);
 assert.equal(a.history.length,1);
});
test('project cannot begin in an empty home, with one resident, or with a fake actor',()=>{
 const h=fixture();assert.equal(h.work.arm('h5','morning'),false);
 h.at.rosie='h1';assert.equal(h.work.arm('h0','morning'),false);
 assert.equal(h.saves,0);
});
test('choosing a project only saves intention, never needs, relationship points or money',()=>{
 const h=fixture();const p=project(h);
 assert.equal(p.project,'morning');assert.equal(p.done.length,0);assert.equal(h.state.coins,300);
 assert.equal(h.state.residentLife.mabel.needs.social,52);assert.equal(h.state.townBonds['mabel|rosie'],undefined);
 assert.equal(h.saves,1);assert.equal(h.updates,1);
});
test('the first real correct home action provides visible partial progress but no immediate bonus',()=>{
 const h=fixture(),r=project(h);
 assert.equal(h.work.recordAction('h0',r.pair[0],'meal').stage,1);
 assert.equal(h.work.pending('h0').done.length,1);
 assert.equal(h.work.comfort('h0'),0);
 assert.equal(h.state.residentLife.mabel.needs.fun,50);
 assert.equal(h.state.coins,300);
});
test('wrong actor, wrong action, wrong room and repeat from same actor never count as the second half',()=>{
 const h=fixture(),r=project(h);h.work.recordAction('h0',r.pair[0],'meal');
 assert.equal(h.work.recordAction('h0',r.pair[0],'tidy'),false);
 assert.equal(h.work.recordAction('h0',r.pair[1],'meal'),false);
 assert.equal(h.work.recordAction('h1',r.pair[1],'tidy'),false);
 assert.equal(h.work.recordAction('h0',r.pair[1],'tidy',false),false);
 assert.equal(h.work.pending('h0').done.length,1);
});
test('two distinct real completed actions award a bounded cooperative home memory once',()=>{
 const h=fixture(),done=finish(h);
 assert.equal(done.stage,2);assert.equal(h.work.pending('h0'),null);
 assert.equal(h.work.data.history.length,1);assert.equal(h.work.keepsakes('h0')[0],'morning');
 assert.equal(h.work.comfort('h0'),2);
 for(const id of ['mabel','rosie']){
  assert.equal(h.state.residentLife[id].needs.social,58);
  assert.equal(h.state.residentLife[id].needs.fun,55);
 }
 assert.equal(h.state.townBonds['mabel|rosie'],2);
 assert.equal(h.state.coins,300);assert.equal(h.saves,1,'normal home action saves true completion');
});
test('repeat completion and extra button taps cannot farm social needs or keepsakes',()=>{
 const h=fixture();finish(h);const before=h.state.residentLife.rosie.needs.fun;
 for(let i=0;i<20;i++)assert.equal(h.work.recordAction('h0','mabel','meal',true),false);
 assert.equal(h.work.arm('h0','story'),false);
 assert.equal(h.state.residentLife.rosie.needs.fun,before);
 assert.equal(h.work.data.history.length,1);assert.equal(h.work.keepsakes('h0').length,1);
});
test('the same pair can share a different project on a later in-game day',()=>{
 const h=fixture();finish(h);
 h.state.day=2;
 const d=finish(h,'story');
 assert.equal(d.stage,2);
 assert.equal(h.work.keepsakes('h0').length,2);
 assert.equal(h.work.comfort('h0'),4);
 assert.equal(h.state.townBonds['mabel|rosie'],4);
 assert.equal(h.work.data.history.length,2);
});
test('all three different home projects earn a maximum of six extra comfort points',()=>{
 const h=fixture();for(const [i,id] of ['morning','story','evening'].entries()){h.state.day=i+1;finish(h,id)}
 assert.equal(h.work.comfort('h0'),6);
 assert.equal(h.work.comfort('h1'),0);
 assert.equal(h.work.keepsakes('h0').length,3);
 assert.equal(h.work.data.history.length,3);
});
test('a previously earned project can be replayed on a later day without duplicating its keepsake',()=>{
 const h=fixture();finish(h);
 h.state.day=2;finish(h);
 assert.equal(h.work.keepsakes('h0').length,1);
 assert.equal(h.work.comfort('h0'),2);
 assert.equal(h.work.data.history.length,2);
});
test('a new day discards the earlier incomplete collaboration without rewarding it',()=>{
 const h=fixture(),r=project(h);
 h.work.recordAction('h0',r.pair[0],'meal');
 h.state.day=2;
 assert.equal(h.work.pending('h0'),null);
 assert.equal(h.work.recordAction('h0',r.pair[1],'tidy'),false);
 assert.equal(h.work.keepsakes('h0').length,0);
 assert.equal(h.state.townBonds['mabel|rosie'],undefined);
});
test('moving a roommate mid-project invalidates contributions and cannot complete a ghost pair',()=>{
 const h=fixture(),r=project(h);
 h.work.recordAction('h0',r.pair[0],'meal');
 h.at.rosie='h1';
 assert.equal(h.work.pending('h0'),null);
 assert.equal(h.work.recordAction('h0',r.pair[1],'tidy'),false);
 assert.equal(h.work.comfort('h0'),0);
});
test('swapping responsibilities resets partial progress, but keeps earned keepsakes intact',()=>{
 const h=fixture(),r=project(h);h.work.recordAction('h0',r.pair[0],'meal');
 assert.equal(h.work.arm('h0','morning',true),true);
 const switched=h.work.pending('h0');
 assert.equal(switched.done.length,0);assert.equal(switched.pair[0],'rosie');
 assert.equal(h.work.recordAction('h0','mabel','meal'),false);
 assert.equal(h.work.recordAction('h0','rosie','meal').stage,1);
 assert.equal(h.work.recordAction('h0','mabel','tidy').stage,2);
});
test('choosing a different project resets the current day partial progress without changing previous history',()=>{
 const h=fixture(),p=project(h);h.work.recordAction('h0',p.pair[0],'meal');
 assert.equal(h.work.arm('h0','story'),true);
 assert.equal(h.work.pending('h0').done.length,0);
 assert.equal(h.work.recordAction('h0',p.pair[1],'tidy'),false);
 assert.equal(h.work.data.history.length,0);
});
test('two occupied homes have fully separate project progress and keepsakes',()=>{
 const h=fixture(),a=project(h);
 h.work.arm('h1','story');
 h.work.recordAction('h0',a.pair[0],'meal');
 assert.equal(h.work.pending('h0').done.length,1);
 assert.equal(h.work.pending('h1').done.length,0);
 assert.equal(h.work.recordAction('h1','oliver','read').stage,1);
 assert.equal(h.work.recordAction('h1','jun','hobby').stage,2);
 assert.equal(h.work.comfort('h1'),2);assert.equal(h.work.comfort('h0'),0);
});
test('atomic schedule preflight rejects full second resident queue without adding the first',()=>{
 const h=fixture(),p=project(h),second=p.pair[1],first=p.pair[0];
 h.schedules[second]=['rest','read','hobby'];
 assert.equal(h.work.arrange('h0'),false);
 assert.equal(h.schedules[first],undefined);
 assert.equal(h.saves,1);
});
test('the collaboration planner queues two different real Daybook actions, not fake minigame tokens',()=>{
 const h=fixture();project(h);
 assert.equal(h.work.arrange('h0'),true);
 assert.equal(JSON.stringify(h.schedules),JSON.stringify({mabel:['meal'],rosie:['tidy']}));
 assert.equal(h.work.data.history.length,0);
 assert.equal(h.work.comfort('h0'),0);
 assert.equal(h.state.coins,300);
});
test('existing independent schedule work is never overwritten or duplicated',()=>{
 const h=fixture();project(h);
 h.schedules.mabel=['read','meal'];
 assert.equal(h.work.arrange('h0'),true);
 assert.equal(JSON.stringify(h.schedules.mabel),JSON.stringify(['read','meal']));
 assert.equal(JSON.stringify(h.schedules.rosie),JSON.stringify(['tidy']));
});
test('already completed first half is not unnecessarily requeued into a schedule',()=>{
 const h=fixture(),p=project(h);
 h.work.recordAction('h0',p.pair[0],'meal');
 assert.equal(h.work.arrange('h0'),true);
 assert.equal(h.schedules.mabel,undefined);
 assert.equal(JSON.stringify(h.schedules.rosie),JSON.stringify(['tidy']));
});
test('full project completion survives clean JSON import/export and displays same home keepsakes',()=>{
 const h=fixture();finish(h);
 const saved=JSON.parse(JSON.stringify(h.work.data));
 const reloaded=fixture({roommateProjects:R.clean(saved),day:2});
 assert.equal(reloaded.work.comfort('h0'),2);
 assert.equal(reloaded.work.pending('h0'),null);
 assert.equal(reloaded.work.keepsakes('h0')[0],'morning');
});
test('mobile storybook contains three selectable projects and explicit real progress',()=>{
 const h=fixture();project(h);h.work.board('h0');
 assert.equal(h.latest.key,'roommate-projects');
 assert.equal((h.latest.html.match(/data-act="rm29-choose"/g)||[]).length,3);
 assert.match(h.latest.html,/0 of 2 genuine home routines finished/);
 assert.match(h.latest.html,/rm29-plan/);
 assert.match(h.latest.html,/A Breakfast Worth Sharing/);
 assert.match(h.latest.html,/The Storybook Corner/);
 assert.match(h.latest.html,/The Evening Lantern/);
});
test('completed project draws original Canvas2D shelf art, never external images',()=>{
 const h=fixture();finish(h);
 let count=0;const ctx={save(){},restore(){},translate(){},fillRect(){count++},beginPath(){},ellipse(){count++},
  fill(){},arc(){count++},stroke(){},moveTo(){},lineTo(){},closePath(){},globalAlpha:1};
 h.work.drawWall(ctx,'h0');assert.ok(count>=6);
 count=0;h.work.drawWall(ctx,'h1');assert.equal(count,0);
 assert.doesNotMatch(read('roommate-projects-v2529.js'),/fetch\(|XMLHttpRequest|WebSocket|new Image\(/);
});
test('actual game completion paths use real once-per-day guards, existing home comfort and art',()=>{
 const s=read('game.js');
 for(const t of ["window.HearthRoommateProjects.clean(raw.roommateProjects)","window.HearthRoommateProjects.setup({",
  "if(once)roommateProjects.recordAction(activeResidence,n.id,kind,true,state.day)",
  "if(once)roommateProjects.recordAction(activeResidence,id,kind,true,state.day)",
  "roommateProjects.comfort(home)","roommateProjects.drawWall(ctx,activeResidence)",
  "if(action.startsWith('rm29-'))","btn('💗 Together at Home · Roommate Projects','rm29-board')"])
 assert.ok(s.includes(t),t);
});
test('old save, actual independent schedules and household relationship systems remain intact',()=>{
 const s=read('game.js');
 for(const t of ["const SAVE='hearth-harbor-save-v1'","HearthHouseholdSchedules.setup","HearthHouseholdRhythms.setup",
  "HearthManualDaybooks.setup","HearthHouseholdRoles.setup","HearthHomeTraditions.setup"])
 assert.ok(s.includes(t),t);
});
test('offline assets are all precached and phone CSS supports touch, narrow layouts and reduced motion',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('roommate-projects-v2529.css');
 for(const asset of ['roommate-projects-v2529.js','roommate-projects-v2529.css'])
  assert.ok(html.includes(asset)&&sw.includes("'./"+asset+"'"));
 assert.ok(html.indexOf('roommate-projects-v2529.js')<html.indexOf('game.js'));
 assert.match(sw,/hearth-harbor-v2529-together-at-home/);
 for(const bit of ['@media(max-width:390px)','@media(min-width:730px)','button:focus-visible','touch-action:manipulation','prefers-reduced-motion:reduce'])assert.ok(css.includes(bit),bit);
});
