/* Hearth & Harbor v2.9.4 — real family closeness, not click-farmed points */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const p of ['pip-home-help-v276.js','pip-initiatives-v292.js','pip-routines-v273.js',
 'pip-home-visits-v289.js','pip-adventures-v281.js','pip-projects-v278.js'])
 vm.runInNewContext(read(p),env,{filename:p});
env.window.HearthPipRituals={recordsFor:()=>[]};
vm.runInNewContext(read('pip-family-bond-v294.js'),env,{filename:'pip-family-bond-v294.js'});
const B=env.window.HearthPipFamilyBond,C=B.CHAPTERS,plain=x=>JSON.parse(JSON.stringify(x));
const care=[{day:1,kind:'story',choiceMask:1},{day:2,kind:'garden',choiceMask:3},
 {day:3,kind:'art',choiceMask:5}];
const help=[4,5,6,7,8].map((day,i)=>({day,kind:['read','tidy','meal','hobby','read'][i]}));
const ideas=[9,10,11,12,13,14].map((day,i)=>({day,kind:['read','tidy','meal','hobby'][i%4],choice:i%2}));
function fixture({day=14,scene='home',guardian=true,guardianDay=4,
 memories=care,homeHelps=help,initiatives=ideas,reflections=[],
 player={x:680,y:800},pip={x:700,y:818},busy=false,paused=false}={}){
 const child={guardian:guardian?'player':null,guardianDay:guardian?guardianDay:0,
  needs:{joy:52,confidence:57,curiosity:59},memories:plain(memories),
  homeHelps:plain(homeHelps),evenings:[],familyRituals:[],homeVisits:{pending:null,memories:[]},
  childInitiatives:{records:plain(initiatives),leadDays:3,learnDays:3},
  familyBond:{chapters:plain(reflections)},projects:[],adventures:[]};
 const state={day,minute:840,youngResidents:{pip:child},coins:470,relations:{mabel:32}};
 let where=scene,pp={...player},cp={...pip},isBusy=busy,isPaused=paused,
  moving=false,modal=null,saves=0,updates=0;
 const notices=[];
 const api={getState:()=>state,getChild:()=>child,getScene:()=>where,
  getPlayer:()=>({...pp}),getChildPosition:()=>({...cp}),
  isBusy:()=>isBusy,isPaused:()=>isPaused,isPlayerMoving:()=>moving,
  showModal:(name,html)=>{modal={name,html}},closeModal:()=>{modal=null},
  openBook:()=>{modal={name:'daybook',html:'Pip Daybook'};return true},
  save:()=>saves++,updateUI:()=>updates++,notify:s=>notices.push(s)};
 const b=B.setup(api);
 return {b,api,state,child,notices,get modal(){return modal},
  get saves(){return saves},get updates(){return updates},
  setDay:n=>state.day=n,setScene:s=>where=s,setBusy:x=>isBusy=x,setPaused:x=>isPaused=x,
  setMoving:x=>moving=x,setPlayer:(x,y)=>pp={x,y},
  setChild:(x,y)=>cp={x,y},advance:(dt=.1,n=1)=>{for(let i=0;i<n;i++)b.advance(dt)}
 };
}
const pen=()=>{const calls=[],g={save(){},restore(){},fillStyle:null,fillRect(...rect){calls.push([this.fillStyle,...rect])}};return {g,calls}};
test('three distinct authored relationship chapters, with two genuine choices each',()=>{
 assert.deepEqual(Object.keys(C),['1','2','3']);
 assert.equal(new Set(Object.values(C).map(x=>x.name)).size,3);
 assert.equal(new Set(Object.values(C).map(x=>x.intro)).size,3);
 for(const c of Object.values(C)){
  assert.equal(c.choices.length,2);assert.equal(c.after.length,2);
  assert.notEqual(c.choices[0],c.choices[1]);assert.notEqual(c.after[0],c.after[1]);
 }
});
test('old guardian-free saves never invent family closeness',()=>{
 const f=fixture({guardian:false});
 assert.equal(f.b.profile().stage,0);
 assert.equal(f.b.panel(),'');assert.equal(f.b.request(),false);
 assert.equal(f.saves,0);
});
test('initial real days before guardianship are respected but do not unlock by themselves',()=>{
 const f=fixture({memories:care,homeHelps:[],initiatives:[],day:4});
 const p=f.b.profile();
 assert.equal(p.days,3);assert.equal(p.post,0);
 assert.equal(p.kinds.length,3);assert.equal(p.stage,0);
});
test('exactly one more actual shared day unlocks a modest first chapter',()=>{
 const f=fixture({day:4,homeHelps:[help[0]],initiatives:[]});
 const p=f.b.profile();
 assert.equal(p.days,4);assert.equal(p.post,1);assert.equal(p.stage,1);
 assert.equal(f.b.next(),1);
});
test('the middle family chapter requires at least eight distinct completed days',()=>{
 const f=fixture({day:8,homeHelps:help.slice(0,3),initiatives:ideas.slice(0,2).map((r,i)=>({...r,day:i+7}))});
 assert.equal(f.b.profile().days,8);
 assert.equal(f.b.profile().stage,2);
});
test('third chapter requires many genuine separate days and activity diversity',()=>{
 const f=fixture();
 const p=f.b.profile();assert.equal(p.days,14);assert.equal(p.post,11);
 assert.ok(p.kinds.length>=5);assert.equal(p.stage,3);
});
test('repeating activities on the same date never inflates shared days',()=>{
 const f=fixture({day:4,homeHelps:[{day:4,kind:'read'},{day:4,kind:'meal'}],
  initiatives:[{day:4,kind:'read',choice:0}]});
 assert.equal(f.b.profile().days,4);assert.equal(f.b.profile().post,1);
});
test('a future-dated or pre-guardianship household record never counts',()=>{
 const f=fixture({day:5,homeHelps:[{day:2,kind:'meal'},{day:99,kind:'read'},{day:5,kind:'hobby'}],initiatives:[]});
 assert.equal(f.b.profile().days,4);
});
test('malformed childhood receipts cannot create imaginary family days',()=>{
 const f=fixture({day:14,memories:[{day:2,kind:'art',choiceMask:20}],
  homeHelps:[{day:7,kind:'wrong'}],initiatives:[{day:9,kind:'wrong',choice:6}]});
 assert.equal(f.b.profile().stage,0);
});
test('a cottage guest without earlier real child-adult history is not credible bond evidence',()=>{
 const f=fixture({homeHelps:[],initiatives:[],day:10});
 f.child.homeVisits={memories:[{id:'jun',day:6,kind:'read',open:0,close:1}],pending:null};
 assert.equal(f.b.profile().days,3);
});
test('real bedtime moments count once on their genuinely recorded day',()=>{
 const f=fixture({day:5,homeHelps:[{day:4,kind:'read'}],initiatives:[]});
 f.child.evenings=[{day:5,mask:2},{day:5,mask:3}];
 assert.equal(f.b.profile().days,5);
 assert.ok(f.b.profile().kinds.includes('evening'));
});
test('older saves with no familyBond field migrate to empty, not instant memories',()=>{
 const f=fixture();delete f.child.familyBond;
 assert.deepEqual(plain(f.b.records()),{chapters:[]});
 assert.equal(f.b.next(),1);assert.equal(f.saves,0);
});
test('only 3 chapter IDs and legitimate personal choices survive sanitization',()=>{
 const raw={chapters:[{id:1,day:2,choice:0},{id:1,day:5,choice:1},
  {id:2,day:9,choice:0},{id:2,day:10,choice:1},
  {id:3,day:20,choice:2},{id:7,day:19,choice:0}]};
 assert.deepEqual(plain(B.clean(raw,4)),{chapters:[
  {id:1,day:5,choice:1},{id:2,day:9,choice:0}]});
 assert.deepEqual(plain(B.clean(null,4)),{chapters:[]});
});
test('reflection requires real Pip/Poppy proximity in the actual cottage',()=>{
 const f=fixture();f.setPlayer(1200,1200);
 assert.equal(f.b.ready(),false);assert.equal(f.b.request(),false);
 f.setPlayer(690,810);assert.equal(f.b.ready(),true);
});
test('family routines and visitors take priority over optional reflection',()=>{
 const f=fixture({busy:true});assert.equal(f.b.ready(),false);
 f.setBusy(false);assert.equal(f.b.ready(),true);
});
test('reflection does not open by itself and no rewards come from just viewing a prompt',()=>{
 const f=fixture(),before=plain(f.child);assert.equal(f.b.ready(),true);
 assert.equal(f.b.request(),true);
 assert.match(f.modal.html,/A Place to Belong/);
 assert.match(f.modal.html,/pb294-choose/);
 assert.deepEqual(plain(f.child),before);assert.equal(f.saves,0);
});
test('Poppy may decline a chapter without changing Pip or blocking the original game',()=>{
 const f=fixture();f.b.request();
 assert.equal(f.b.cancel(),true);assert.equal(f.b.prompt,null);
 assert.equal(f.b.ready(),true);assert.equal(f.saves,0);
});
test('an earned reflection saves its real date and chosen wording exactly once',()=>{
 const f=fixture();f.b.request();
 assert.equal(f.b.choose(1),true);
 assert.deepEqual(plain(f.child.familyBond),{chapters:[{id:1,day:14,choice:1}]});
 assert.equal(f.b.records().chapters.length,1);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.ok(f.notices[0].includes('cottage'));
});
test('a completed reflection adds ZERO money, need boosts or adult ties',()=>{
 const f=fixture(),before=plain({needs:f.child.needs,coins:f.state.coins,relations:f.state.relations});
 f.b.request();f.b.choose(0);
 assert.deepEqual(plain({needs:f.child.needs,coins:f.state.coins,relations:f.state.relations}),before);
});
test('malformed choice, wrong day or remote button cannot fabricate completed relationship',()=>{
 for(const variant of ['invalid','day','far','busy']){
  const f=fixture();f.b.request();
  if(variant==='day')f.setDay(15);
  if(variant==='far')f.setPlayer(1200,1200);
  if(variant==='busy')f.setBusy(true);
  const value=variant==='invalid'?5:0;
  assert.equal(f.b.choose(value),false,variant);
  assert.equal(f.b.records().chapters.length,0);assert.equal(f.saves,0);
 }
});
test('tapping the same chapter repeatedly cannot farm progress',()=>{
 const f=fixture();f.b.request();f.b.choose(0);
 assert.equal(f.b.choose(1),false);assert.equal(f.saves,1);
 assert.equal(f.b.next(),2,'the next genuine chapter becomes available, not chapter one again');
});
test('chapters are remembered sequentially even when three thresholds were earned long ago',()=>{
 const f=fixture();assert.equal(f.b.next(),1);
 f.b.request();f.b.choose(0);assert.equal(f.b.next(),2);
 f.b.request();f.b.choose(1);assert.equal(f.b.next(),3);
 f.b.request();f.b.choose(1);assert.equal(f.b.next(),null);
 assert.equal(f.saves,3);
 assert.deepEqual(plain(f.child.familyBond.chapters).map(x=>x.id),[1,2,3]);
});
test('personal reflective choices alter Pip’s future family-dialogue text',()=>{
 const a=fixture({reflections:[{id:1,day:10,choice:0}]}),
 b=fixture({reflections:[{id:1,day:10,choice:1}]});
 assert.notEqual(a.b.line(),b.b.line());
 assert.ok(a.b.ideaLine().includes('Pip remembers'));
 assert.ok(b.b.ideaLine().includes('special'));
});
test('a choice remains a real family stage after earlier bounded scrapbook pages roll away',()=>{
 const old=fixture({day:40,memories:[],homeHelps:[],initiatives:[],
  reflections:[{id:1,day:12,choice:0},{id:2,day:20,choice:1}]});
 assert.equal(old.b.profile().days,0);
 assert.equal(old.b.profile().stage,2);
 assert.equal(old.b.next(),null,'no fake third stage from a lost old scrapbook');
});
test('three one-time reflections paint three different real original cottage pennants',()=>{
 const f=fixture({reflections:[{id:1,day:4,choice:0},{id:2,day:8,choice:1},{id:3,day:14,choice:0}]});
 const p=pen();assert.equal(f.b.drawWall(p.g,0),true);
 assert.ok(p.calls.length>=21);
 assert.equal(new Set(p.calls.filter(x=>x[4]===37).map(x=>x[1])).size,3);
});
test('branching family decisions visibly alter the wall art',()=>{
 const a=fixture({reflections:[{id:1,day:10,choice:0}]}),
 b=fixture({reflections:[{id:1,day:10,choice:1}]});
 const aa=pen(),bb=pen();
 a.b.drawWall(aa.g,0);b.b.drawWall(bb.g,0);
 assert.notDeepEqual(aa.calls,bb.calls);
});
test('no unearned family decoration appears in the home or outside the real cottage',()=>{
 const f=fixture();assert.equal(f.b.drawWall(pen().g,0),false);
 const e=fixture({reflections:[{id:1,day:10,choice:0}]});e.setScene('town');
 assert.equal(e.b.drawWall(pen().g,0),false);
});
test('family warmth uses the real character’s location and never invents a second sprite',()=>{
 const f=fixture({reflections:[{id:1,day:10,choice:0}]});
 const p=pen();assert.equal(f.b.drawGesture(p.g,{x:700,y:818},0),true);
 assert.ok(p.calls.length>=3);
 f.setPlayer(1400,1300);assert.equal(f.b.drawGesture(p.g,{x:700,y:818},0),false);
});
test('family gesture pauses for household work or Poppy moving',()=>{
 const f=fixture({reflections:[{id:1,day:10,choice:0}]});
 f.setBusy(true);assert.equal(f.b.drawGesture(pen().g,{x:700,y:818},0),false);
 f.setBusy(false);f.setMoving(true);
 assert.equal(f.b.drawGesture(pen().g,{x:700,y:818},0),false);
});
test('read-only panel, animation, and observations cannot modify saves',()=>{
 const f=fixture(),old=plain(f.child),p=pen();
 for(let i=0;i<60;i++){f.advance(.016);f.b.profile();f.b.panel();f.b.drawWall(p.g,i)}
 assert.deepEqual(plain(f.child),old);assert.equal(f.saves,0);
});
test('future-day and scene interruption dismiss old conversation without reward',()=>{
 const f=fixture();f.b.request();f.setScene('town');f.advance(.1);
 assert.equal(f.b.prompt,null);assert.equal(f.b.choose(0),false);
 assert.equal(f.saves,0);
});
test('phone build loads bond engine, saved family history, and actual in-world gestures',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),
  little=read('little-sprouts-v272.js'),ideas=read('pip-initiatives-v292.js'),
  approaches=read('pip-approaches-v293.js'),atlas=read('family-atlas-v271.js'),
  css=read('pip-family-bond-v294.css');
 for(const file of ['pip-family-bond-v294.js','pip-family-bond-v294.css'])
  assert.ok(sw.includes("'./"+file+"'"));
 assert.match(sw,/hearth-harbor-v299-stories-brought-home/);
 assert.ok(html.includes('pip-family-bond-v294.js?v=2.9.4'));
 assert.ok(html.includes('pip-family-bond-v294.css?v=2.9.4'));
 assert.ok(html.indexOf('pip-family-bond-v294.js')<html.indexOf('little-sprouts-v272.js'));
 assert.ok(html.includes('family-atlas-v271.js?v=2.9.9'));
 assert.ok(html.includes('game.js?v=2.9.9'));
 assert.match(game,/littleSprouts\.familyBond\.drawWall\(ctx,tick\)/);
 assert.match(game,/littleSprouts\.familyBond\.request\(\)/);
 assert.match(game,/if\(action\.startsWith\('pi292-'\)\|\|action\.startsWith\('pb294-'\)\)return littleSprouts\.handle\(action,id\)/);
 assert.match(little,/familyBond\.drawGesture\(g,pos,tick\)/);
 assert.match(little,/familyBond\.panel\(\)/);
 assert.match(little,/familyBond:root\.HearthPipFamilyBond\?\.clean/);
 assert.match(atlas,/child-family-bond/);
 assert.match(ideas,/getFamilyLine/);
 assert.match(approaches,/getBondStage/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:380px\)/);
});
test('no passive benefit, new service, secondary save, or recurring timer is introduced',()=>{
 const src=read('pip-family-bond-v294.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
 assert.doesNotMatch(src,/needs\.(?:joy|curiosity|confidence)\s*\+=|coins\s*\+=/);
});
