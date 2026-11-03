/* Hearth & Harbor v2.7.9 — real Maplewood guide relationship & afternoon QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const p of ['pip-growth-v280.js','pip-legacy-v282.js','pip-rituals-v283.js','pip-adventures-v281.js','pip-projects-v278.js','pip-guides-v279.js','pip-routines-v273.js','pip-neighbors-v275.js','pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js','family-atlas-v271.js'])
 vm.runInNewContext(read(p),env,{filename:p});
const G=env.window.HearthPipGuides,L=env.window.HearthLittleSprouts,R=env.window.HearthPipRoutines,A=env.window.HearthFamilyAtlas;
const plain=x=>JSON.parse(JSON.stringify(x));
const realAdults=()=>[
 {id:'mabel',name:'Mabel',x:720,y:594},{id:'rosie',name:'Rosie',x:396,y:757},
 {id:'oliver',name:'Oliver',x:948,y:525},{id:'jun',name:'Jun',x:423,y:935},
 {id:'bea',name:'Bea',x:794,y:803},{id:'finn',name:'Finn',x:1035,y:1095}
];
function fixture({guardian=true,day=9,minute=850,bond=null,focus='stories'}={}){
 const c=L.defaults();
 if(guardian){c.guardian='player';c.guardianDay=3}
 if(focus){c.dream.focus=focus;c.dream.chosenDay=4}
 if(bond){c.meetings=[{day:4,id:bond,mask:0},{day:5,id:bond,mask:1}];c.mentor=G.clean(null,c.meetings)}
 const state={day,minute,coins:525,youngResidents:{pip:c},weddingPlans:{},familyRoots:{chosen:{}}};
 let scene=guardian?'home':'town',pos={x:0,y:0},saves=0,updates=0,modal={id:'',html:''},walkable=()=>true;
 const adults=realAdults(),notices=[];
 const api={getState:()=>state,getScene:()=>scene,getAdults:()=>adults,getPlayer:()=>({...pos}),
  isNearby:(p,d)=>Math.hypot(pos.x-p.x,pos.y-p.y)<=d,
  isWalkable:(x,y,s)=>walkable(x,y,s),nearestWalkable:p=>p,goTown:()=>{scene='town';pos={x:566,y:621}},
  isPaused:()=>false,ownDone:()=>false,ownHold:()=>null,queueOwnAction:()=>false,
  showModal:(id,html)=>{modal={id,html}},closeModal:()=>{},notify:x=>notices.push(x),
  save:()=>saves++,updateUI:()=>updates++};
 const pip=L.setup(api);pos={...pip.position()};
 return {pip,state,adults,api,notices,get modal(){return modal},get saves(){return saves},get updates(){return updates},
  child:()=>state.youngResidents.pip,
  setScene:s=>scene=s,setPlayer:(x,y)=>{pos={x,y}},get player(){return pos},
  setWalkable:fn=>{walkable=fn},setNearPip(){const p=pip.position();pos={x:p.x,y:p.y}}};
}
function outing({id='jun',minute=850,focus='stories'}={}){
 const f=fixture({bond:id,minute,focus});
 assert.equal(f.pip.guides.choose(id),true);
 assert.equal(f.pip.guides.toggle(),true);
 f.setScene('town');f.setNearPip();
 return f;
}
function reflect(f,mask=0){
 assert.equal(f.pip.guides.start(),true);
 assert.equal(f.pip.guides.answer(mask&1),true);
 assert.equal(f.pip.guides.page(),true);
 assert.equal(f.pip.guides.answer((mask>>1)&1),true);
}
test('six real village adults have distinct, age-appropriate guide interests',()=>{
 assert.deepEqual(plain(G.IDS),['mabel','rosie','oliver','jun','bea','finn']);
 assert.equal(new Set(G.IDS.map(x=>G.DESIGNS[x].title)).size,6);
 for(const id of G.IDS){
  const d=G.DESIGNS[id];assert.equal(d.questions.length,2);
  assert.ok(d.questions.every(q=>q.options.length===2&&q.options.every(a=>a.length===2)));
 }
});
test('a brand-new child has no invented bonds, guide or supervised afternoon plans',()=>{
 const c=L.clean(null);
 assert.equal(c.mentor.chosen,null);assert.equal(c.mentor.enabled,false);
 assert.deepEqual(plain(c.mentor.guided),[]);
 assert.ok(G.IDS.every(id=>c.mentor.counts[id]===0));
});
test('genuine past neighbor visits migrate into lifetime familiarity, no forced choice',()=>{
 const saved=[{day:3,id:'jun',mask:0},{day:4,id:'jun',mask:1},{day:5,id:'bea',mask:3}];
 const m=G.clean(null,saved);
 assert.equal(m.counts.jun,2);assert.equal(m.counts.bea,1);assert.equal(m.chosen,null);
});
test('duplicated meetings from a bad save do not inflate a neighbor bond',()=>{
 const m=G.clean(null,[{day:3,id:'jun',mask:0},{day:3,id:'jun',mask:0},{day:4,id:'fake',mask:1}]);
 assert.equal(m.counts.jun,1);assert.ok(m.counts.bea===0);
});
test('malformed imported enabled visits cannot appoint unknown or unearned guides',()=>{
 const a=G.clean({chosen:'unknown',chosenDay:5,enabled:true,counts:{jun:2}},[]);
 const b=G.clean({chosen:'jun',chosenDay:6,enabled:true,counts:{jun:1}},[]);
 assert.equal(a.chosen,null);assert.equal(b.chosen,null);
 assert.equal(a.enabled,false);assert.equal(b.enabled,false);
});
test('trusted prior bond and explicit selection survive save sanitation',()=>{
 const r=G.clean({chosen:'jun',chosenDay:6,enabled:true},[{day:2,id:'jun',mask:1},{day:4,id:'jun',mask:0}]);
 assert.equal(r.chosen,'jun');assert.equal(r.chosenDay,6);assert.equal(r.enabled,true);
});
test('genuine completed real-world neighbor activity increments durable affinity exactly once',()=>{
 const f=fixture({guardian:false,minute:120,focus:null});
 assert.equal(f.pip.neighbors.start('bea'),true);
 f.pip.neighbors.answer(0);f.pip.neighbors.step();f.pip.neighbors.answer(1);
 assert.equal(f.child().mentor.counts.bea,1);
 assert.equal(f.child().meetings.length,1);assert.equal(f.saves,1);
 assert.equal(f.pip.neighbors.start('bea'),false);
});
test('second real day of visiting the same adult unlocks that specific bond',()=>{
 const f=fixture({guardian:false,minute:120,focus:null});
 for(const day of [9,10]){
  f.state.day=day;
  f.pip.neighbors.start('bea');f.pip.neighbors.answer(0);f.pip.neighbors.step();f.pip.neighbors.answer(0);
 }
 assert.equal(f.child().mentor.counts.bea,2);
 assert.equal(f.pip.guides.affinity().find(x=>x.id==='bea').unlocked,true);
 assert.equal(f.pip.guides.affinity().find(x=>x.id==='jun').unlocked,false);
});
test('a rolling small scrapbook does not erase earlier genuine familiarity',()=>{
 const f=fixture({guardian:false,minute:120,focus:null});
 f.child().mentor.counts.bea=12;f.child().meetings=[{day:8,id:'bea',mask:1}];
 const restored=L.clean(plain(f.child()));
 assert.equal(restored.mentor.counts.bea,12);
});
test('before true guardianship, no adult may become a child’s selected guide',()=>{
 const f=fixture({guardian:false,bond:'jun'});
 assert.equal(f.pip.guides.choose('jun'),false);assert.equal(f.saves,0);
});
test('choosing a favorite guide requires actually being beside Pip at home',()=>{
 const f=fixture({bond:'jun'});
 f.setPlayer(50,50);assert.equal(f.pip.guides.choose('jun'),false);
 f.setNearPip();f.setScene('town');assert.equal(f.pip.guides.choose('jun'),false);
 f.setScene('home');assert.equal(f.pip.guides.choose('jun'),true);
 assert.equal(f.child().mentor.enabled,false);assert.equal(f.child().mentor.chosen,'jun');
});
test('a favorite village guide may be switched without inventing other friendships',()=>{
 const f=fixture({bond:'jun'});
 f.child().mentor.counts.bea=3;
 f.pip.guides.choose('jun');assert.equal(f.pip.guides.choose('bea'),true);
 assert.equal(f.child().mentor.chosen,'bea');assert.equal(f.child().mentor.enabled,false);
 assert.equal(f.child().mentor.counts.mabel,0);
});
test('the player must deliberately opt in before Pip visits a guide',()=>{
 const f=fixture({bond:'jun'});
 f.pip.guides.choose('jun');
 assert.equal(f.child().mentor.enabled,false);
 assert.equal(f.pip.routines.location().scene,'home');
 assert.equal(f.pip.guides.toggle(),true);
 assert.equal(f.child().mentor.enabled,true);
});
test('with consent, an afternoon visit puts Pip near a real NPC in the actual town',()=>{
 const f=outing();
 const pos=f.pip.position(),jun=f.adults.find(a=>a.id==='jun');
 assert.equal(f.pip.routines.location().scene,'town');
 assert.equal(f.pip.routines.location().mentorId,'jun');
 assert.ok(Math.hypot(pos.x-jun.x,pos.y-jun.y)<110);
 assert.equal(f.pip.hit(pos.x,pos.y-45,'town'),true);
});
test('Pip stays at home during morning, bedtime and late-night hours',()=>{
 for(const minute of [40,490,710,1020,1120,1390]){
  const f=fixture({bond:'jun',minute:490});f.pip.guides.choose('jun');f.pip.guides.toggle();f.state.minute=minute;
  assert.equal(f.pip.routines.location().scene,'home');
 }
});
test('if chosen guide is physically absent from town, no phantom visit occurs',()=>{
 const f=fixture({bond:'jun',minute:490});f.pip.guides.choose('jun');f.pip.guides.toggle();f.state.minute=850;
 const index=f.adults.findIndex(a=>a.id==='jun');f.adults.splice(index,1);
 assert.equal(f.pip.routines.location().scene,'home');assert.equal(f.pip.guides.eligible(),false);
});
test('the town collision map decides whether the child can safely attend',()=>{
 const f=fixture({bond:'jun',minute:490});f.pip.guides.choose('jun');f.pip.guides.toggle();f.state.minute=850;
 f.setWalkable(()=>false);
 assert.equal(f.pip.routines.location().scene,'home');
 f.setWalkable(()=>true);
 assert.equal(f.pip.routines.location().scene,'town');
});
test('a guide physically moving changes Pip’s visible neighborhood spot',()=>{
 const f=outing();const before=f.pip.position();
 const jun=f.adults.find(a=>a.id==='jun');jun.x+=70;jun.y+=20;
 const after=f.pip.position();assert.ok(Math.hypot(before.x-after.x,before.y-after.y)>50);
});
test('the daybook documents the real consent and each of six learned bonds',()=>{
 const f=fixture({bond:'jun'});
 const html=f.pip.guides.panel();
 for(const id of G.IDS)assert.ok(html.includes(f.adults.find(a=>a.id===id).name));
 assert.match(html,/two different days|2 different days/);
 assert.match(html,/Choose/);
 assert.equal(f.saves,0);
});
test('an unattended afternoon does not generate child memory, cash or bond points',()=>{
 const f=outing();const original=plain(f.child().mentor.counts);
 f.state.minute=970;f.pip.advance(0.5);
 assert.equal(f.child().mentor.guided.length,0);
 assert.deepEqual(plain(f.child().mentor.counts),original);
 assert.equal(f.state.coins,525);assert.equal(f.saves,2);
});
test('a guided reflection can start only if Poppy is physically nearby in the town',()=>{
 const f=outing();f.setPlayer(10,10);
 assert.equal(f.pip.guides.start(),false);
 f.setNearPip();assert.equal(f.pip.guides.eligible(),true);
});
test('the same physical adult must remain in town during both reflection choices',()=>{
 const f=outing();assert.equal(f.pip.guides.start(),true);
 f.pip.guides.answer(0);f.adults.splice(f.adults.findIndex(a=>a.id==='jun'),1);
 assert.equal(f.pip.guides.page(),false);
 assert.equal(f.child().mentor.guided.length,0);
});
test('a real two-choice guide reflection records exact day, adult, dream and decisions',()=>{
 const f=outing();reflect(f,3);
 assert.deepEqual(plain(f.child().mentor.guided),[{day:9,id:'jun',focus:'stories',mask:3}]);
 assert.equal(f.saves,3);assert.equal(f.updates,3);
});
test('a finished mentor reflection increases only bounded child needs, never income',()=>{
 const f=outing(),before={...f.child().needs};reflect(f,1);
 assert.equal(f.child().needs.curiosity,before.curiosity+7);
 assert.equal(f.child().needs.joy,before.joy+2);
 assert.equal(f.state.coins,525);
});
test('the same day cannot earn a second guide reflection, even after choosing a new guide',()=>{
 const f=outing();reflect(f);
 assert.equal(f.pip.guides.start(),false);assert.equal(f.child().mentor.guided.length,1);
});
test('a genuine later day can add another independent reflection',()=>{
 const f=outing();reflect(f);
 f.state.day=10;f.setNearPip();reflect(f,2);
 assert.deepEqual(plain(f.child().mentor.guided.map(x=>x.day)),[9,10]);
});
test('canceling an unfinished reflection never saves a false memory',()=>{
 const f=outing();f.pip.guides.start();f.pip.guides.answer(1);
 f.pip.guides.handle('pm279-cancel');
 assert.equal(f.child().mentor.guided.length,0);assert.equal(f.saves,2);
});
test('day rollover cancels an unfinished guided afternoon',()=>{
 const f=outing();f.pip.guides.start();f.pip.guides.answer(0);
 f.state.day=10;assert.equal(f.pip.guides.page(),false);
 assert.equal(f.child().mentor.guided.length,0);
});
test('ending guided afternoons returns Pip to the real cottage routine',()=>{
 const f=outing();assert.equal(f.pip.guides.toggle(),true);
 assert.equal(f.pip.routines.location().scene,'home');
 assert.equal(f.child().mentor.enabled,false);
});
test('the player cannot remotely turn off a guide afternoon from another world area',()=>{
 const f=outing();f.setPlayer(50,50);
 assert.equal(f.pip.guides.toggle(),false);
 assert.equal(f.child().mentor.enabled,true);
});
test('invalid answers cannot finish a reflection or write records',()=>{
 const f=outing();f.pip.guides.start();
 for(const x of [-1,2,NaN,undefined])assert.equal(f.pip.guides.answer(x),false);
 assert.equal(f.child().mentor.guided.length,0);
});
test('valid imported guide memories deduplicate and reject forged days, people and focus',()=>{
 const v=G.clean({guided:[{id:'jun',day:4,focus:'stories',mask:0},{id:'jun',day:4,focus:'discover',mask:0},
 {id:'pip',day:5,focus:'stories',mask:1},{id:'jun',day:-1,focus:'stories',mask:2},
 {id:'bea',day:6,focus:'discover',mask:3}]},[]);
 assert.deepEqual(plain(v.guided),[{id:'jun',day:4,focus:'stories',mask:0},{id:'bea',day:6,focus:'discover',mask:3}]);
});
test('childhood visit save round trip retains chosen guide, lifetime bonds and notes',()=>{
 const f=outing();reflect(f,2);
 const restored=L.clean(plain(f.child()));
 assert.equal(restored.mentor.chosen,'jun');assert.equal(restored.mentor.enabled,true);
 assert.equal(restored.mentor.counts.jun,2);assert.equal(restored.mentor.guided[0].mask,2);
});
test('real guided visits have distinct in-world Canvas props, not menus masquerading as art',()=>{
 const f=outing(),calls=[];
 const g={save(){},restore(){},fillRect(){calls.push(1)}};
 assert.equal(f.pip.guides.draw(g,f.pip.routines.location(),1),true);
 assert.ok(calls.length>=6);
});
test('earned guide reflections enter the family chronicle without creating kinship edges',()=>{
 const f=outing();reflect(f);
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:3}),getPortraits:()=>[]});
 const entries=atlas.events().filter(x=>x.kind==='child-guide');
 assert.equal(entries.length,1);assert.equal(entries[0].day,9);
 assert.equal(atlas.graph().edges.some(x=>x.kind==='marriage'&&x.ids.includes('pip')),false);
});
test('future or malformed guide reflections are excluded from dated family history',()=>{
 const f=fixture();f.child().mentor.guided=[{id:'jun',day:90,focus:'stories',mask:0},{id:'fake',day:5,focus:'stories',mask:0}];
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getYoungResident:()=>({guardian:'player',guardianDay:3})});
 assert.equal(atlas.events().filter(x=>x.kind==='child-guide').length,0);
});
test('iPhone resource order, world touch, villager dialogues and original save key remain wired',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),child=read('little-sprouts-v272.js'),css=read('pip-guides-v279.css');
 for(const file of ['pip-guides-v279.js','pip-guides-v279.css']){assert.ok(html.includes(file));assert.ok(sw.includes("'./"+file+"'"))}
 assert.ok(html.indexOf('pip-guides-v279.js')<html.indexOf('pip-routines-v273.js'));
 assert.ok(html.indexOf('pip-guides-v279.js')<html.indexOf('little-sprouts-v272.js'));
 assert.match(html,/v=2\.8\.3/);assert.match(sw,/hearth-harbor-v283-family-seasons/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
 assert.match(game,/Join Pip’s guide reflection/);assert.match(game,/const where=littleSprouts\.routines\.location\(\)\.scene/);
 assert.match(child,/guides\.draw\(g,routine,tick\)/);assert.match(child,/guides\.panel\(\)/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('guide relationship code uses no remote networking, passive timers or separate storage',()=>{
 const source=read('pip-guides-v279.js');
 assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});
