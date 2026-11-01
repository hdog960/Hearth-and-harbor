/* Hearth & Harbor v2.5.9 — A Village in Motion, deterministic regressions.
   Run: node --test tests/village-life-v259.test.cjs */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const source=read('village-life-v259.js'),core=read('game.js'),html=read('index.html'),sw=read('sw.js');
const browser={window:{}};
vm.runInNewContext(source,browser,{filename:'village-life-v259.js'});
const E=browser.window.HearthVillageLife;
const ids=Object.keys(E.ROLES);
function create(options={}){
 let saves=0,updates=0,modals=[],routes=[],messages=[];
 const st={
  day:2,minute:11*60,season:0,hearts:0,coins:150,
  needs:{fun:20,social:23},
  relations:Object.fromEntries(ids.map(id=>[id,0])),
  stewardship:{phases:{flowers:2,lanterns:2,deck:2,cart:2}},
  villageLife:E.clean(null),
  household:{family:'preserve'},
  ...options
 };
 const world=E.setup({getState:()=>st,save:()=>saves++,updateUI:()=>updates++,
   notify:text=>messages.push(text),showModal:(kind,body)=>modals.push({kind,body}),
   closeModal:()=>{},findNeighbor:id=>routes.push(id)});
 return {st,world,modals,routes,messages,get saves(){return saves},get updates(){return updates}};
}
const normal=()=>({h:'shop-ordinary',where:[800,770],doing:'visiting the shop',icon:'🍞'});
test('six real residents have distinctive festival activities, locales and text',()=>{
 assert.deepEqual(ids.sort(),['bea','finn','jun','mabel','oliver','rosie']);
 const x=create();
 for(const id of ids){
  const r=E.ROLES[id];
  assert.equal(r.choices.length,3);
  assert.ok(r.choices.every(c=>c[0]&&c[1]));
  const pre=x.world.schedule(id,normal());
  assert.match(pre.h,/village-prep-/);
  assert.equal(pre.villageRole,true);
  assert.equal(pre.where.length,2);
 }
 assert.ok(new Set(ids.map(id=>E.ROLES[id].job)).size===6);
});
test('personal dates, weddings, promises, friend visits and urgent care are never overridden',()=>{
 const x=create({day:3,minute:13*60});
 for(const h of ['date-plaza','wedding-abc','promise-abc','evening-ritual','visit-2','rest-care',
   'eat-care','social-care','home-h0']){
  for(const id of ids){
   const saved={...normal(),h},out=x.world.schedule(id,saved);
   assert.equal(out,saved,'Protected: '+id+' '+h);
  }
 }
 for(const other of [{eventId:'story1'},{coupleId:'date2'},{visitId:'visitor'}]){
  const p={...normal(),...other};
  assert.equal(x.world.schedule('bea',p),p);
 }
});
test('every festival day has morning work, afternoon visits and a relaxing evening',()=>{
 const x=create({day:3});
 for(const season of [0,1,2,3]){
  x.st.day=season*7+3;x.st.season=season;
  for(const [minute,slot] of [[10*60,'market-am'],[14*60,'market-pm'],[18*60,'market-evening']]){
   x.st.minute=minute;
   const schedules=ids.map(id=>x.world.schedule(id,normal()));
   assert.ok(schedules.every(p=>p.villageRole&&p.h.includes(slot)),slot);
   assert.equal(new Set(schedules.map(p=>p.where.join(','))).size,6,'villagers gather in different locations');
  }
 }
 x.st.day=6;x.st.minute=10*60;
 assert.equal(x.world.available(),false);
});
test('town improvements change ordinary resident routines but not their sleep',()=>{
 const x=create({day:7,minute:13*60});
 for(const id of ['mabel','rosie','bea','finn','jun']){
  const r=x.world.schedule(id,normal());
  assert.match(r.h,/favorite-place/);
 }
 assert.match(x.world.schedule('oliver',normal()).h,/orchard-trade/);
 x.st.stewardship.phases={flowers:0,deck:0,cart:0,lanterns:0};
 for(const id of ids){const p=normal();assert.equal(x.world.schedule(id,p),p);}
 x.st.stewardship.phases={flowers:2,deck:2,cart:2,lanterns:2};
 x.st.minute=22*60;
 for(const id of ids){const p=normal();assert.equal(x.world.schedule(id,p),p);}
});
test('community diary lets player walk to a real resident and choose a personal help task',()=>{
 const x=create();
 x.world.journal();
 assert.equal(x.modals.at(-1).kind,'village-helpers');
 assert.match(x.modals.at(-1).body,/preparations/i);
 x.world.visit('jun');
 assert.deepEqual(x.routes,['jun']);
 x.world.begin('jun');
 const prompt=x.modals.at(-1);
 assert.equal(prompt.kind,'village-volunteer');
 assert.match(prompt.body,/Fold paper birds/);
 x.world.select('jun|1');
 assert.equal(x.modals.at(-1).kind,'village-thankyou');
 assert.equal(x.st.relations.jun,4);
 assert.equal(x.st.hearts,2);
 assert.equal(x.st.needs.fun,25);
 assert.equal(x.st.needs.social,30);
 assert.equal(x.saves,1);
 assert.equal(x.updates,1);
 assert.equal(x.st.household.family,'preserve');
});
test('one volunteer activity is rewarded per day across all six villagers',()=>{
 const x=create();
 x.world.begin('mabel');x.world.select('mabel|2');
 const first={hearts:x.st.hearts,fun:x.st.needs.fun,friend:x.st.relations.rosie,writes:x.saves};
 x.world.begin('rosie');x.world.select('rosie|1');
 assert.equal(x.saves,first.writes);
 assert.equal(x.st.hearts,first.hearts);
 assert.equal(x.st.relations.rosie,first.friend);
 assert.equal(x.st.needs.fun,first.fun);
 x.st.day=3;x.world.begin('rosie');x.world.select('rosie|1');
 assert.equal(x.saves,2);
 assert.equal(x.st.relations.rosie,4);
 x.st.day=6;x.world.begin('oliver');
 assert.equal(x.saves,2);
});
test('imported volunteer history sanitizes bad names, invalid dates, malicious option values',()=>{
 const output=E.clean({
  days:{
   2:{id:'mabel',choice:2},3:{id:'rosie',choice:0},4:{id:'bea',choice:4},
   6:{id:'finn',choice:0},10:{id:'jun',choice:-1},14:{id:'mabel',choice:2},
   'x':{id:'mabel',choice:1}},
  records:[
   {day:2,id:'mabel',choice:2},{day:2,id:'rosie',choice:0},
   {day:6,id:'jun',choice:1},{day:10,id:'bea',choice:1},
   {day:4,id:'__proto__',choice:0}]
 });
 assert.equal(Object.keys(output.days).length,2);
 assert.equal(output.records.length,2);
 assert.equal(output.records[0].id,'mabel');
 assert.equal(output.records[1].id,'bea');
 assert.equal(Object.keys(E.clean(null).days).length,0);
});
test('canvas rendering is cheap, purely in-world, and uses supported Canvas2D calls',()=>{
 const x=create({day:3,minute:10*60});
 const names=new Set(['save','restore','translate','beginPath','ellipse','fill','fillRect',
   'stroke','moveTo','lineTo','quadraticCurveTo','arc']);
 let calls=0;
 const g=new Proxy({},{get(o,k){if(names.has(k))return()=>{calls++};return o[k]}});
 for(const id of ids){
  const n={id,x:E.ROLES[id].base[0],y:E.ROLES[id].base[1]};
  const entry=x.world.schedule(id,normal());
  assert.equal(x.world.drawActivity(g,n,entry,1.5),true);
  assert.equal(x.world.drawActivity(g,n,{h:'ordinary'},1.5),false);
 }
 x.world.select('mabel|0');
 x.world.drawDecor(g,{day:3,season:0,tick:1});
 assert.ok(calls>=60);
});
test('runtime references new module, save migration and offline assets before game starts',()=>{
 for(const token of ['window.HearthVillageLife.clean(raw.villageLife)','villageLife.schedule',
   'villageLife.drawActivity','villageLife.drawDecor','villageLife.moodText','villageLife.handle','vl-board']){
  assert.ok(core.includes(token),'missing '+token);
 }
 assert.ok(html.indexOf('village-life-v259.js')<html.indexOf('game.js'));
 for(const asset of ['village-life-v259.js','village-life-v259.css']){
  assert.ok(html.includes(asset));
  assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.match(sw,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/); // Cache ID advances with each release.
});
