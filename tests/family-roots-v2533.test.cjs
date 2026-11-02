/* Hearth & Harbor v2.5.33 — real family and chosen-family ties */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const env={window:{}};vm.runInNewContext(read('family-roots-v2533.js'),env,{filename:'family-roots-v2533.js'});
const F=env.window.HearthFamilyRoots;
function harness(overrides={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const needs={};for(const id of F.IDS)needs[id]={food:75,fun:55,social:50,energy:70};
 const state={day:6,coins:300,familyRoots:F.clean(null),weddingPlans:{},roommateProjects:{history:[]},
  townBonds:{'mabel|rosie':4},townTensions:{},...overrides};
 let saves=0,updates=0,modal={key:'',html:''},messages=[];
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:x=>messages.push(x),
  getResidentHome:id=>homes[id],getHomeMembers:home=>Object.keys(homes).filter(id=>homes[id]===home),
  getPersonLabel:id=>({mabel:'Mabel',rosie:'Rosie',oliver:'Oliver',jun:'Jun',bea:'Bea',finn:'Finn'})[id],
  getHomeLabel:home=>'Cozy '+home,getNeeds:id=>needs[id],
  showModal:(key,html)=>modal={key,html},back:()=>{modal={key:'daybook',html:'Return to household'}}};
 const roots=F.setup(api);
 const setProjects=(a=1,b=3,pair=['mabel','rosie'])=>{
  state.roommateProjects.history.push({home:'h0',day:a,project:'morning',pair:pair.slice()},{home:'h0',day:b,project:'story',pair:pair.slice()});
 };
 return {state,homes,needs,roots,api,setProjects,get saves(){return saves},get updates(){return updates},get messages(){return messages},get modal(){return modal}};
}
function ctx(){
 return {n:0,save(){this.n++},restore(){this.n++},translate(){this.n++},
  fillRect(){this.n++},beginPath(){this.n++},ellipse(){this.n++},
  fill(){this.n++},arc(){this.n++},stroke(){this.n++},
  moveTo(){this.n++},lineTo(){this.n++},fillText(){this.n++}};
}
test('existing saves safely gain optional chosen-family data but never invented relatives',()=>{
 const h=harness();assert.equal(JSON.stringify(h.roots.data),JSON.stringify({chosen:{},careDay:{},history:[]}));
 assert.equal(F.IDS.length,6);assert.equal(F.HOMES.length,6);
 assert.equal(Object.keys(h.state.weddingPlans).length,0);
});
test('import rejects malicious, unsorted, duplicated actor and invalid home relationship keys',()=>{
 const c=F.clean({chosen:{
  'mabel|rosie':{day:2,home:'h0',status:'active'},
  'rosie|mabel':{day:2,home:'h0',status:'active'},
  'mabel|mabel':{day:2,home:'h0',status:'active'},
  'intruder|mabel':{day:2,home:'h0',status:'active'},
  'bea|finn':{day:2,home:'h9',status:'active'},
  'finn|jun':{day:2,home:'h2',status:'ended',endedDay:1}
 },careDay:{'mabel|rosie':4,'mabel|mabel':8}});
 assert.equal(Object.keys(c.chosen).length,1);
 assert.equal(c.chosen['mabel|rosie'].day,2);
 assert.equal(Object.keys(c.careDay).length,1);
});
test('import accepts a historical released promise with a valid later end date',()=>{
 const c=F.clean({chosen:{'mabel|rosie':{day:2,home:'h0',status:'ended',endedDay:6}}});
 assert.equal(c.chosen['mabel|rosie'].status,'ended');assert.equal(c.chosen['mabel|rosie'].endedDay,6);
});
test('a housemate is never automatically mislabeled a spouse or chosen family',()=>{
 const h=harness();h.roots.board();
 assert.match(h.modal.html,/Housemates · 0 shared project days/);
 assert.doesNotMatch(h.modal.html,/Married partners/);
 assert.equal(h.roots.eligibility('h0').ok,false);
});
test('two genuine shared projects on different dates are required',()=>{
 const h=harness();
 h.state.roommateProjects.history.push({home:'h0',day:2,project:'story',pair:['mabel','rosie']},
  {home:'h0',day:2,project:'morning',pair:['mabel','rosie']});
 assert.equal(h.roots.sharedDays('mabel|rosie'),1);
 assert.equal(h.roots.pledge('h0'),false);
 h.state.roommateProjects.history.push({home:'h0',day:3,project:'evening',pair:['mabel','rosie']});
 assert.equal(h.roots.eligibility('h0').ok,true);
});
test('forged project ids, future days and strangers cannot establish family ties',()=>{
 const h=harness();
 h.state.roommateProjects.history.push({home:'h0',day:2,project:'bogus',pair:['mabel','rosie']},
  {home:'h0',day:3,project:'morning',pair:['mabel','fake']},
  {home:'h0',day:20,project:'story',pair:['mabel','rosie']});
 assert.equal(h.roots.sharedDays('mabel|rosie'),0);
 assert.equal(h.roots.pledge('h0'),false);
});
test('genuine bond must reach four points and unresolved tension blocks a pledge',()=>{
 const h=harness();h.setProjects();
 h.state.townBonds['mabel|rosie']=3;
 assert.equal(h.roots.eligibility('h0').ok,false);
 h.state.townBonds['mabel|rosie']=4;h.state.townTensions['mabel|rosie']=8;
 assert.equal(h.roots.eligibility('h0').ok,false);
 h.state.townTensions['mabel|rosie']=7;
 assert.equal(h.roots.eligibility('h0').ok,true);
});
test('one real housemate cannot pledge alone and moves cannot be exploited to fake a roommate',()=>{
 const h=harness();h.setProjects();
 h.homes.rosie='h3';
 assert.equal(h.roots.pledge('h0'),false);
 assert.equal(h.roots.eligibility('h0').ok,false);
 assert.equal(h.saves,0);
});
test('optional chosen-family promise saves a named lasting link without giving immediate rewards',()=>{
 const h=harness();h.setProjects();
 assert.equal(h.roots.pledge('h0'),true);
 assert.equal(h.roots.data.chosen['mabel|rosie'].status,'active');
 assert.equal(h.roots.data.history[0].kind,'pledge');
 assert.equal(h.saves,1);assert.equal(h.updates,1);
 assert.equal(h.needs.mabel.social,50);assert.equal(h.state.townBonds['mabel|rosie'],4);assert.equal(h.state.coins,300);
});
test('same-day accidental repeat button taps do not award or duplicate another promise',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 for(let i=0;i<15;i++)assert.equal(h.roots.pledge('h0'),false);
 assert.equal(h.roots.data.history.length,1);assert.equal(h.saves,1);
});
test('imported real existing marriages appear as spouses without another wedding or forced home move',()=>{
 const h=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:4,venue:'garden'}}});
 h.setProjects();assert.equal(h.roots.pledge('h0'),false);
 assert.equal(h.roots.history().length,1);
 h.roots.board();assert.match(h.modal.html,/Married partners · since Day 4/);
 assert.match(h.modal.html,/Married in Maplewood/);
});
test('marriage remains recorded even when the spouses live in different houses',()=>{
 const h=harness({weddingPlans:{'mabel|rosie':{status:'married',marriedDay:4}}});
 h.homes.rosie='h3';
 h.roots.board();
 assert.match(h.modal.html,/Married in Maplewood/);
 assert.equal(h.roots.history()[0].kind,'wedding');
});
test('engagement or scheduled weddings are not mislabeled as completed marriages',()=>{
 for(const status of ['engaged','scheduled']){
  const h=harness({weddingPlans:{'mabel|rosie':{status,marriedDay:0}}});
  h.roots.board();assert.doesNotMatch(h.modal.html,/Married in Maplewood/);
  assert.doesNotMatch(h.modal.html,/Married partners/);
 }
});
test('real first completed roommate chat helps both chosen relatives once',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 h.state.townTensions['mabel|rosie']=5;
 const x=h.roots.completedChat('h0','mabel',true,6);
 assert.equal(x.key,'mabel|rosie');
 assert.equal(h.needs.mabel.social,54);assert.equal(h.needs.rosie.social,54);
 assert.equal(h.state.townBonds['mabel|rosie'],5);assert.equal(h.state.townTensions['mabel|rosie'],4);
 assert.equal(h.saves,1,'chat callback saves; hook does not add an extra save');
});
test('another real roommate chat on the same day cannot mint second shared-care bonus',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');h.roots.completedChat('h0','mabel');
 for(let i=0;i<10;i++)assert.equal(h.roots.completedChat('h0','rosie'),false);
 assert.equal(h.state.townBonds['mabel|rosie'],5);
 assert.equal(h.needs.rosie.social,54);
});
test('an interrupted, repeated or incorrectly dated interaction never gives the care bonus',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 for(const v of [
  ['h0','mabel',false,6],['h0','mabel',true,5],['h1','mabel',true,6],['h0','fake',true,6]
 ])assert.equal(h.roots.completedChat(...v),false);
 assert.equal(h.needs.mabel.social,50);assert.equal(h.state.townBonds['mabel|rosie'],4);
});
test('a new in-game day permits one new genuine caring interaction',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');h.roots.completedChat('h0','mabel');
 h.state.day=7;assert.ok(h.roots.completedChat('h0','rosie'));
 assert.equal(h.needs.mabel.social,58);assert.equal(h.state.townBonds['mabel|rosie'],6);
});
test('needs and friendship are always capped and never generate cash',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 h.needs.mabel.social=99;h.needs.rosie.social=100;h.state.townBonds['mabel|rosie']=100;
 h.roots.completedChat('h0','mabel');
 assert.equal(h.needs.mabel.social,100);assert.equal(h.needs.rosie.social,100);
 assert.equal(h.state.townBonds['mabel|rosie'],100);assert.equal(h.state.coins,300);
});
test('marriage supersedes chosen bond benefits without destroying original saved history',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 h.state.weddingPlans['mabel|rosie']={status:'married',marriedDay:6};
 assert.equal(h.roots.completedChat('h0','mabel'),false);
 assert.equal(h.roots.data.history.length,1);
});
test('after moving to separate homes, a chosen-family tie persists but cannot earn daily roommate rewards',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 h.homes.rosie='h3';
 assert.equal(h.roots.completedChat('h0','mabel'),false);
 assert.equal(h.roots.data.chosen['mabel|rosie'].status,'active');
 h.roots.board();assert.match(h.modal.html,/A family chosen together/);
});
test('a bond can be released after moving without falsifying the previous history',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 h.state.day=7;h.homes.rosie='h3';
 h.roots.handle('fr33-unbind','mabel|rosie');
 assert.equal(h.roots.data.chosen['mabel|rosie'].status,'ended');
 assert.equal(h.roots.data.history.at(-1).kind,'release');
 assert.equal(h.roots.data.history.length,2);
});
test('ending a chosen-family promise is reversible without deleting the historical record',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');h.state.day=7;
 assert.equal(h.roots.release('h0'),true);
 assert.equal(h.roots.completedChat('h0','mabel'),false);
 h.state.day=8;assert.equal(h.roots.pledge('h0'),true);
 assert.equal(h.roots.data.history.length,3);
});
test('same-day release is blocked and opening the album never advances calendar time',()=>{
 const h=harness();h.setProjects();h.roots.pledge('h0');
 assert.equal(h.roots.release('h0'),false);
 const before=h.state.day;h.roots.board();assert.equal(h.state.day,before);
 assert.equal(h.saves,1);
});
test('original in-room paired-leaf artwork is rendered only for actual chosen-family housemates',()=>{
 const h=harness();h.setProjects();const canvas=ctx();
 h.roots.draw(canvas,'h0');assert.equal(canvas.n,0);
 h.roots.pledge('h0');h.roots.draw(canvas,'h0');
 assert.ok(canvas.n>=12);
 const old=canvas.n;h.roots.draw(canvas,'h1');assert.equal(canvas.n,old);
});
test('modal has six household cards, a genuine voluntary action, history and accessible controls',()=>{
 const h=harness();h.setProjects();h.roots.board();
 assert.equal(h.modal.key,'family-roots');
 assert.equal((h.modal.html.match(/class="fr33-house"/g)||[]).length,6);
 assert.match(h.modal.html,/data-act="fr33-pledge"/);
 assert.match(h.modal.html,/OUR PEOPLE · OUR PROMISES/);
 assert.match(h.modal.html,/spouses|marriage promise/);
});
test('old saves keep original key while actual game routes real action completion and family drawing',()=>{
 const g=read('game.js');
 for(const x of ["const SAVE='hearth-harbor-save-v1'","window.HearthFamilyRoots.clean(raw.familyRoots)",
  "window.HearthFamilyRoots.setup({",
  "if(once&&kind==='chat')familyRoots.completedChat(activeResidence,n.id,true,state.day)",
  "if(once&&kind==='chat')familyRoots.completedChat(activeResidence,id,true,state.day)",
  "familyRoots.draw(ctx,activeResidence)","familyRoots.handle(action,id)",
  "btn('🌿 Family Roots & Connections','fr33-board')"])
 assert.ok(g.includes(x),x);
});
test('family book and original art load on iPhones offline and do not use new services',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('family-roots-v2533.css');
 for(const asset of ['family-roots-v2533.js','family-roots-v2533.css'])
  assert.ok(html.includes(asset)&&sw.includes("'./"+asset+"'"));
 assert.ok(html.indexOf('family-roots-v2533.js')<html.indexOf('game.js'));
 assert.match(sw,/hearth-harbor-v2533-family-roots/);
 for(const s of ['@media(max-width:390px)','@media(min-width:700px)','touch-action:manipulation','button:focus-visible','prefers-reduced-motion:reduce'])assert.ok(css.includes(s),s);
 assert.doesNotMatch(read('family-roots-v2533.js'),/fetch\(|WebSocket|XMLHttpRequest|setInterval|localStorage|new Image\(/);
});
