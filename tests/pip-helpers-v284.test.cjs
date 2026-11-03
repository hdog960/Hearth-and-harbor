/* Hearth & Harbor v2.8.4 — Neighborhood Helpers world-play QA */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const env={window:{}};
for(const file of ['pip-growth-v280.js','pip-legacy-v282.js','pip-rituals-v283.js',
 'pip-adventures-v281.js','pip-helpers-v284.js','pip-projects-v278.js',
 'pip-guides-v279.js','pip-routines-v273.js','pip-neighbors-v275.js',
 'pip-home-help-v276.js','pip-dreams-v277.js','little-sprouts-v272.js',
 'family-atlas-v271.js'])vm.runInNewContext(read(file),env,{filename:file});
const H=env.window.HearthPipHelpers,L=env.window.HearthLittleSprouts,A=env.window.HearthFamilyAtlas;
const plain=x=>JSON.parse(JSON.stringify(x));
const NPCS=[
 {id:'mabel',name:'Mabel',x:720,y:594},{id:'rosie',name:'Rosie',x:396,y:757},
 {id:'oliver',name:'Oliver',x:948,y:525},{id:'jun',name:'Jun',x:423,y:935},
 {id:'bea',name:'Bea',x:794,y:803},{id:'finn',name:'Finn',x:1035,y:1095}
];
function fixture({stage=1,guardian=true,met=true,day=25}={}){
 const child=L.defaults();
 if(guardian){child.guardian='player';child.guardianDay=2}
 if(stage){child.growth={stage,firstDay:3,secondDay:stage===2?15:0}}
 if(met)for(const n of NPCS){child.mentor.counts[n.id]=1;child.mentor.last[n.id]=4}
 const state={day,season:0,minute:830,coins:470,relations:{},youngResidents:{pip:child},familyRoots:{chosen:{}},weddingPlans:{}};
 let scene='town',player={x:720,y:594},pip={x:709,y:592},saves=0,updates=0,modal=null,other=false;
 let walkable=()=>true,nearest=p=>p;
 const adults=plain(NPCS),notes=[];
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,getScene:()=>scene,
  getAdults:()=>adults,getPlayer:()=>({...player}),childPosition:()=>({...pip}),
  isWalkable:(x,y,s)=>walkable(x,y,s),nearestWalkable:(p,s)=>nearest(p,s),
  otherAdventure:()=>other,closeModal:()=>{modal=null},closeTalk:()=>{},
  showModal:(id,html)=>{modal={id,html}},save:()=>saves++,updateUI:()=>updates++,
  notify:s=>notes.push(s),name:id=>adults.find(n=>n.id===id)?.name,
  bondAdult:(id,n)=>{state.relations[id]=Math.min(100,(state.relations[id]||0)+n)},openBook:()=>{}};
 const a=H.setup(api);
 return {a,state,adults,notes,get saves(){return saves},get updates(){return updates},
 get modal(){return modal},child:()=>state.youngResidents.pip,
 visit:id=>{const n=adults.find(x=>x.id===id);player={x:n.x,y:n.y};pip={x:n.x-11,y:n.y-2}},
 walkTo:p=>{player={x:p.x,y:p.y};pip={x:p.x-8,y:p.y}},
 setPip:(x,y)=>pip={x,y},setPlayer:(x,y)=>player={x,y},
 setScene:v=>scene=v,setOther:v=>other=v,setWalkable:v=>walkable=v,setNearest:v=>nearest=v};
}
function complete(f,id,plan=0,finish=0){
 f.visit(id);assert.equal(f.a.start(id),true);assert.equal(f.a.plan(plan),true);
 for(let i=0;i<2;i++){const p=f.a.session.spots[i];f.walkTo(p);assert.equal(f.a.arrive(i),true)}
 assert.equal(f.a.finish(finish),true);
}
test('six distinct real adult projects have genuine physical tasks and different outcomes',()=>{
 assert.equal(Object.keys(H.PROJECTS).length,6);
 assert.equal(new Set(Object.values(H.PROJECTS).map(x=>x.name)).size,6);
 for(const d of Object.values(H.PROJECTS)){
  assert.equal(d.tasks.length,2);assert.equal(d.first.length,2);
  assert.equal(d.last.length,2);assert.equal(d.closing.length,2);
  assert.ok(['joy','confidence','curiosity'].includes(d.need));
 }
});
test('prior real visit, chosen guardian and growth must all exist',()=>{
 for(const opts of [{stage:0},{guardian:false},{met:false}]){
  const f=fixture(opts);assert.equal(f.a.eligible('mabel'),false);assert.equal(f.a.start('mabel'),false);
 }
});
test('Poppy and Pip must both be physically close to the real town adult',()=>{
 const f=fixture();f.setPlayer(1200,1300);assert.equal(f.a.start('mabel'),false);
 f.visit('mabel');f.setPip(1200,1300);assert.equal(f.a.start('mabel'),false);
 f.visit('mabel');f.setScene('home');assert.equal(f.a.start('mabel'),false);
});
test('adult without any authored project is never selectable',()=>{
 const f=fixture();assert.equal(f.a.start('fictional-adult'),false);
});
test('project cannot begin when another world adventure is active',()=>{
 const f=fixture();f.setOther(true);assert.equal(f.a.start('mabel'),false);
});
test('planning selects authored content but does not pay out or save',()=>{
 const f=fixture(),before=plain(f.child().needs);
 assert.equal(f.a.start('mabel'),true);
 assert.match(f.modal.html,/Petal Welcome Flags/);
 assert.match(f.modal.html,/ph284-plan/);
 assert.equal(f.saves,0);assert.equal(f.a.plan(1),true);
 assert.equal(f.child().helperProjects.length,0);assert.deepEqual(plain(f.child().needs),before);
 assert.equal(f.state.coins,470);
});
test('two real world stops are separated and pass actual walkability checks',()=>{
 const f=fixture();f.a.start('mabel');assert.equal(f.a.session.spots.length,2);
 assert.ok(Math.hypot(f.a.session.spots[0].x-f.a.session.spots[1].x,f.a.session.spots[0].y-f.a.session.spots[1].y)>55);
 const g=fixture();g.setWalkable(()=>false);g.setNearest(()=>null);
 assert.equal(g.a.start('mabel'),false);
});
test('missing safe physical locations never creates a session',()=>{
 const f=fixture();
 f.setWalkable(()=>false);f.setNearest(()=>({x:1500,y:1400}));
 assert.equal(f.a.start('mabel'),false);assert.equal(f.a.session,null);
});
test('world marker hit is explicit, sequential, and needs actual travel',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);
 const a=f.a.session.spots[0],b=f.a.session.spots[1];
 assert.equal(f.a.hit(b.x,b.y-17),null);
 assert.deepEqual(plain(f.a.hit(a.x,a.y-17)),{x:a.x,y:a.y,step:0});
 assert.equal(f.a.hit(40,40),null);
 assert.equal(f.a.arrive(0),false);
 assert.equal(f.a.arrive(1),false);
});
test('Pip must physically reach the craft piece alongside Poppy',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);const p=f.a.session.spots[0];
 f.setPlayer(p.x,p.y);f.setPip(1200,1300);
 assert.equal(f.a.arrive(0),false);
});
test('the second physical stop is required before final choice',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);
 const p=f.a.session.spots[0];f.walkTo(p);assert.equal(f.a.arrive(0),true);
 assert.equal(f.a.finish(0),false);assert.equal(f.child().helperProjects.length,0);
});
test('complete real collaboration saves exactly once and improves earned bonds',()=>{
 const f=fixture();complete(f,'mabel',1,0);
 assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.equal(f.state.relations.mabel,2);assert.equal(f.state.coins,470);
 assert.deepEqual(plain(f.child().helperProjects[0]),{day:25,id:'mabel',plan:1,finish:0});
 assert.equal(f.child().needs.curiosity,61);assert.equal(f.child().needs.joy,63);
 assert.equal(f.a.eligible('mabel'),false);
});
test('invalid choice and remote replays never earn another reward',()=>{
 const f=fixture();f.a.start('mabel');assert.equal(f.a.plan(8),false);
 assert.equal(f.a.finish(0),false);
 f.a.plan(0);for(let i=0;i<2;i++)f.walkTo(f.a.session.spots[i]),f.a.arrive(i);
 assert.equal(f.a.finish(2),false);assert.equal(f.a.finish(1),true);
 assert.equal(f.a.finish(0),false);assert.equal(f.saves,1);
});
test('canceling before physical completion gives no reward or record',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);assert.equal(f.a.cancel(),undefined);
 assert.equal(f.saves,0);assert.equal(f.child().helperProjects.length,0);
});
test('changing day during a physical project cancels it',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);f.state.day++;
 assert.equal(f.a.arrive(0),false);assert.equal(f.a.session,null);
});
test('leaving town cancels unfinished work without money or needs',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);f.setScene('home');
 assert.equal(f.a.arrive(0),false);assert.equal(f.saves,0);
});
test('villager moves away before completion: no invented project',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(1);f.adults[0].x+=240;
 assert.equal(f.a.arrive(0),false);assert.equal(f.a.session,null);
});
test('losing child proximity during the final decision prevents reward',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);
 for(let i=0;i<2;i++)f.walkTo(f.a.session.spots[i]),f.a.arrive(i);
 f.setPip(1200,1300);assert.equal(f.a.finish(0),false);assert.equal(f.saves,0);
});
test('another adventure interrupts and voids unfinished helper activity',()=>{
 const f=fixture();f.a.start('mabel');f.a.plan(0);f.setOther(true);
 assert.equal(f.a.arrive(0),false);assert.equal(f.a.session,null);
});
test('three different real villagers across different days earn physical Pip ribbon',()=>{
 const f=fixture();
 for(const [i,id] of ['mabel','rosie','jun'].entries()){f.state.day=25+i;complete(f,id)}
 assert.equal(f.a.hasRibbon(),true);assert.equal(f.saves,3);
 const rects=[];const g={save(){},restore(){},fillRect(...x){rects.push(x)}};
 assert.equal(f.a.drawRibbon(g,{x:800,y:850},2),true);assert.ok(rects.length>4);
});
test('repeat visits to only one adult cannot grant the three-neighbor ribbon',()=>{
 const f=fixture();
 for(const d of [25,26,27]){f.state.day=d;complete(f,'mabel')}
 assert.equal(f.a.hasRibbon(),false);
});
test('old save sanitation rejects invalid ids, dates, options, duplicates and markup',()=>{
 const clean=plain(H.clean([
  {day:2,id:'mabel',plan:0,finish:1},{day:2,id:'mabel',plan:1,finish:1},
  {day:3,id:'fake',plan:0,finish:0},{day:4,id:'rosie',plan:2,finish:0},
  {day:5,id:'bea',plan:0,finish:'<script>'},{day:6,id:'jun',plan:1,finish:0}]));
 assert.equal(clean.length,2);assert.equal(clean[0].id,'mabel');assert.equal(clean[1].id,'jun');
 assert.equal(L.clean({}).helperProjects.length,0);
});
test('historical first memories with all six adults survive bounded 42-record rollover',()=>{
 const ids=Object.keys(H.PROJECTS),rows=[];
 for(let i=0;i<110;i++)rows.push({day:i+1,id:ids[i%6],plan:i%2,finish:(i+1)%2});
 let saved=[];
 for(const r of rows)saved=plain(H.clean([...saved,r]));
 assert.ok(saved.length<=42);
 assert.equal(new Set(saved.map(x=>x.id)).size,6);
 assert.ok(saved.some(x=>x.day===1));
});
test('helper story appears in real Connections Atlas without fabricated family edges',()=>{
 const f=fixture();complete(f,'mabel');
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getPortraits:()=>[]});
 const records=atlas.events().filter(e=>e.kind==='child-helper');
 assert.equal(records.length,1);
 assert.deepEqual(plain(records[0].ids),['player','pip','mabel']);
 assert.equal(atlas.graph().edges.some(e=>e.kind==='marriage'&&e.ids.includes('pip')),false);
});
test('future child helper records cannot appear as dated real history',()=>{
 const f=fixture();f.child().helperProjects=[{day:97,id:'mabel',plan:0,finish:0}];
 const atlas=A.setup({getState:()=>f.state,getResidentHome:()=>null,getPortraits:()=>[]});
 assert.equal(atlas.events().filter(e=>e.kind==='child-helper').length,0);
});
test('daybook and dialogue integration is small-screen first and backed by world travel',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),child=read('little-sprouts-v272.js'),css=read('pip-helpers-v284.css');
 assert.match(html,/pip-helpers-v284\.js\?v=2\.8\.6/);
 assert.match(html,/pip-helpers-v284\.css\?v=2\.8\.4/);
 assert.ok(html.indexOf('pip-helpers-v284.js')<html.indexOf('little-sprouts-v272.js'));
 for(const f of ['pip-helpers-v284.js','pip-helpers-v284.css'])assert.ok(sw.includes("'./"+f+"'"));
 assert.match(sw,/hearth-harbor-v300-chosen-generations/);
 assert.match(child,/helpers\.panel\(\)/);assert.match(child,/helpers\.drawRibbon/);
 assert.match(game,/ph284-direct/);assert.match(game,/littleSprouts\.helpers\.hit/);
 assert.match(game,/littleSprouts\.helpers\.arrive/);assert.match(game,/littleSprouts\.helpers\.draw/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/:focus-visible/);assert.match(css,/@media\(max-width:380px\)/);
});
test('no separate account, timers, browser storage, remote calls or paywall in helper system',()=>{
 const source=read('pip-helpers-v284.js');
 assert.doesNotMatch(source,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
});
