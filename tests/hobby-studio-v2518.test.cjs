/* Hearth & Harbor v2.5.18 — Little Passions Studio regressions.
 * Run: node --test tests/hobby-studio-v2518.test.cjs */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('hobby-studio-v2518.js'),game=read('game.js'),html=read('index.html'),sw=read('sw.js');
const window={};vm.runInNewContext(source,{window},{filename:'hobby-studio-v2518.js'});
const H=window.HearthHobbyStudio;
function create(){
 const s={day:1,needs:{fun:20,social:30},relations:{mabel:25},
  residentLife:{},hobbyStudio:{days:{},counts:{},gallery:{}},
  homeAspirations:{people:{}},cooking:{dishes:[{id:'salad',quality:2}]},coins:89,hearts:5};
 let members=['mabel','rosie'],home='h0',scene='residence',done=new Set(),arrive,modal=false,paused=false;
 let saves=0,updates=0,prepared=0,callbacks=[],lastEnd=[],messages=[],views=[],rewardCalls=[];
 const api={
  getState:()=>s,getScene:()=>scene,getHome:()=>home,getMembers:()=>members,
  getResidentHome:id=>id==='mabel'||id==='rosie'?'h0':'h1',
  hasHobby:id=>done.has(id),preparePlayer:()=>prepared++,
  walkTo:(pos,cb)=>{arrive={pos,cb};return true},
  save:()=>saves++,updateUI:()=>updates++,notify:x=>messages.push(x),
  showModal:(kind,body)=>{modal=true;views.push({kind,body})},
  closeModal:()=>{modal=false},isPaused:()=>paused,isModalOpen:()=>modal,
  completeHobby:id=>{
   if(done.has(id)){rewardCalls.push({id,practice:true});return null;}
   done.add(id);rewardCalls.push({id,practice:false});
   return true;
  },
  onSceneStart:id=>{callbacks.push(id);return {x:380,y:610}},
  onSceneEnd:id=>lastEnd.push(id)
 };
 const engine=H.setup(api);
 return {s,engine,done,views,messages,rewardCalls,callbacks,lastEnd,
  travel:()=>arrive?.cb(),get station(){return arrive?.pos},
  setHome:x=>home=x,setMembers:x=>members=x,setScene:x=>scene=x,
  pause:x=>paused=x,close:()=>{modal=false},
  get saves(){return saves},get updates(){return updates},get prepared(){return prepared}};
}
function begin(x,id){
 x.engine.start(id);
 assert.ok(x.station,'must walk to a real hobby spot');
 assert.equal(x.travel(),true,'arrival opens playable activity');
 assert.equal(x.views.at(-1).kind,'hobby-studio-play');
}
function complete(x,id){
 const p=H.PROFILE[id];
 if(p.type==='story'){
  for(const question of p.questions)assert.equal(x.engine.tap(question.options[0][0]),true);
 }else if(p.type==='paint'){
  for(let i=0;i<4;i++){
   assert.equal(x.engine.color(p.pattern[i]),true);
   assert.equal(x.engine.cell(String(i)),true);
  }
 }else{
  const pattern=p.type==='sort'?p.pattern.map(s=>s[1]):p.pattern;
  for(const value of pattern)assert.equal(x.engine.tap(value),true);
 }
}
test('six distinct author-written resident hobbies have different goals and mechanics',()=>{
 assert.equal(H.PEOPLE.length,6);
 assert.equal(Object.keys(H.PROFILE).length,6);
 assert.equal(new Set(H.PEOPLE.map(id=>H.PROFILE[id].type)).size,6);
 for(const id of H.PEOPLE){
  assert.ok(H.PROFILE[id].title&&H.PROFILE[id].detail);
  assert.equal(H.PROFILE[id].station.length,2);
 }
});
test('an absent resident, wrong scene or unknown name cannot start an imaginary studio event',()=>{
 const x=create();
 x.setMembers(['rosie']);x.engine.start('mabel');assert.equal(x.station,undefined);
 x.setScene('town');x.engine.start('rosie');assert.equal(x.station,undefined);
 x.setScene('residence');x.engine.start('__proto__');assert.equal(x.station,undefined);
 assert.equal(x.saves,0);assert.equal(x.rewardCalls.length,0);
});
test('playing a real hobby requires walking to its existing home station before progress',()=>{
 const x=create();x.engine.start('mabel');
 assert.equal(x.station.x,470);assert.equal(x.station.y,510);
 assert.equal(x.prepared,1);assert.equal(x.saves,0);
 assert.equal(x.engine.tap('soil'),false,'cannot bypass arrival');
 assert.equal(x.travel(),true);
 assert.match(x.views.at(-1).body,/Bloom by Bloom/);
 assert.match(x.views.at(-1).body,/0 \/ 4 steps/);
});
test('Mabel tends flowers in an exact soil seed water sunlight sequence',()=>{
 const x=create();begin(x,'mabel');
 assert.equal(x.engine.tap('sun'),false,'wrong order does not count');
 assert.equal(x.engine.tap('__proto__'),false);
 assert.equal(x.engine.tap('soil'),true);
 assert.equal(x.engine.tap('seed'),true);
 assert.equal(x.engine.tap('water'),true);
 assert.equal(x.engine.tap('sun'),true);
 assert.equal(x.s.hobbyStudio.counts.mabel,1);
 assert.equal(x.rewardCalls.length,1);
});
test('Rosie sorts three real produce icons into the matching crates',()=>{
 const x=create();begin(x,'rosie');
 assert.match(x.views.at(-1).body,/Apple/);
 assert.equal(x.engine.tap('berries'),false);
 assert.equal(x.engine.tap('orchard'),true);
 assert.match(x.views.at(-1).body,/Strawberry/);
 assert.equal(x.engine.tap('berries'),true);
 assert.equal(x.engine.tap('citrus'),true);
 assert.equal(x.s.hobbyStudio.counts.rosie,1);
});
test('Oliver folds and presses a distinct five-step pastry sequence',()=>{
 const x=create();x.setMembers(['oliver']);begin(x,'oliver');
 assert.equal(x.engine.tap('press'),false);
 for(const action of H.PROFILE.oliver.pattern)assert.equal(x.engine.tap(action),true);
 assert.equal(x.views.at(-1).kind,'hobby-studio-result');
});
test('Jun writes a branching story with legitimate narrative choices instead of wrong-answer puzzles',()=>{
 const x=create();x.setMembers(['jun']);begin(x,'jun');
 assert.equal(x.engine.tap('not-a-choice'),false);
 assert.equal(x.engine.tap('harbor'),true);
 assert.equal(x.engine.tap('bird'),true);
 assert.equal(x.engine.tap('seed'),true);
 assert.match(x.views.at(-1).body,/sleepy harbor/);
 assert.match(x.views.at(-1).body,/hopeful seed/);
 assert.equal(x.s.hobbyStudio.counts.jun,1);
});
test('Bea selects pigments and applies them to matching separate canvas squares',()=>{
 const x=create();x.setMembers(['bea']);begin(x,'bea');
 assert.equal(x.engine.cell('0'),false,'need a pigment first');
 assert.equal(x.engine.color('pink'),true);
 assert.equal(x.engine.cell('0'),false,'wrong pigment cannot paint the sky');
 assert.equal(x.engine.color('blue'),true);
 assert.equal(x.engine.cell('1'),false,'cannot skip a canvas square');
 assert.equal(x.engine.cell('0'),true);
 for(const [i,color] of H.PROFILE.bea.pattern.entries()){
  if(i===0)continue;
  x.engine.color(color);assert.equal(x.engine.cell(String(i)),true);
 }
 assert.equal(x.s.hobbyStudio.counts.bea,1);
});
test('Finn weaves loops and a proper knot in the requested sequence',()=>{
 const x=create();x.setMembers(['finn']);begin(x,'finn');
 assert.equal(x.engine.tap('knot'),false);
 for(const action of H.PROFILE.finn.pattern)assert.equal(x.engine.tap(action),true);
 assert.equal(x.s.hobbyStudio.counts.finn,1);
});
test('rewards from the real household routine happen at most once per day, even after autonomy',()=>{
 const x=create();x.done.add('mabel');
 begin(x,'mabel');complete(x,'mabel');
 assert.equal(x.rewardCalls.length,1);
 assert.equal(x.rewardCalls[0].practice,true);
 assert.match(x.views.at(-1).body,/creative practice/);
 assert.equal(x.s.hobbyStudio.counts.mabel,1);
 x.engine.start('mabel');
 assert.equal(x.rewardCalls.length,1);
 x.s.hobbyStudio=H.clean(JSON.parse(JSON.stringify(x.s.hobbyStudio)));
 x.engine.start('mabel');
 assert.equal(x.rewardCalls.length,1,'cannot repeat after reload');
 x.s.day=2;begin(x,'mabel');complete(x,'mabel');
 assert.equal(x.s.hobbyStudio.counts.mabel,2);
 assert.equal(x.s.coins,89);assert.equal(x.s.hearts,5);
 assert.equal(x.s.cooking.dishes.length,1);
});
test('leaving the studio or changing home/day/housemates before completion preserves progression',()=>{
 const x=create();begin(x,'mabel');
 x.engine.tap('soil');x.engine.cancel();
 assert.equal(x.saves,0);assert.equal(x.rewardCalls.length,0);
 for(const disrupt of [
  v=>v.setHome('h1'),v=>v.setScene('town'),v=>v.setMembers(['rosie']),v=>v.s.day++
 ]){
  const t=create();begin(t,'mabel');t.engine.tap('soil');
  disrupt(t);assert.equal(t.engine.tap('seed'),false);
  assert.equal(t.rewardCalls.length,0);assert.equal(t.saves,0);
 }
});
test('three separate studio days produce a real framed keepsake without duplicating hobby rewards',()=>{
 const x=create();
 for(let day=1;day<=3;day++){x.s.day=day;begin(x,'mabel');complete(x,'mabel');}
 assert.equal(x.s.hobbyStudio.counts.mabel,3);
 assert.equal(x.s.hobbyStudio.gallery.mabel,true);
 let draws=0;const supported=new Set(['save','restore','fillRect','beginPath','ellipse','fill']);
 const canvas=new Proxy({},{get(obj,k){return supported.has(k)?()=>draws++:obj[k]}});
 x.engine.draw(canvas,{home:'h0',tick:1});assert.ok(draws>6);
 const first=draws;x.setScene('town');x.engine.draw(canvas,{home:'h0',tick:1});
 assert.ok(draws>first,'framed gallery persists even outside the studio scene');
});
test('studio NPC scene uses existing sprite positions, respects pause and returns to normal daily autonomy',()=>{
 const x=create();begin(x,'mabel');complete(x,'mabel');
 assert.deepEqual(x.callbacks,['mabel']);
 assert.equal(x.engine.active(),true);
 assert.equal(x.engine.pose('mabel').x,380);
 assert.equal(x.engine.pose('rosie'),null);
 x.engine.update(.1);assert.equal(x.engine.pose('mabel').x,380,'modal pauses animation');
 x.close();x.pause(true);x.engine.update(.1);
 assert.equal(x.engine.pose('mabel').x,380,'game speed pause');
 x.pause(false);
 for(let i=0;i<40;i++)x.engine.update(.1);
 assert.equal(x.engine.pose('mabel').moving,false);
 for(let i=0;i<140;i++)x.engine.update(.1);
 assert.equal(x.engine.active(),false);
 assert.deepEqual(x.lastEnd,['mabel']);
});
test('old saves, malformed gallery data and unrelated household histories migrate safely',()=>{
 const result=H.clean({days:{mabel:7,rosie:-3,other:90},counts:{mabel:999999,jun:2},gallery:{bea:true,other:true}});
 assert.equal(Object.keys(result.days).length,6);
 assert.equal(result.days.rosie,0);
 assert.equal(result.counts.mabel,9999);
 assert.equal(result.gallery.mabel,true);
 assert.equal(result.gallery.bea,true);
 assert.equal(result.gallery.jun,false);
 assert.equal(H.clean(null).counts.mabel,0);
});
test('game integrates real daily hobby and aspiration pathways and offline responsive assets',()=>{
 for(const part of [
  'window.HearthHobbyStudio.clean(raw.hobbyStudio)',
  'hobbyStudio.handle(action,id)',
  'hobbyStudio.draw(ctx',
  'hobbyStudio.pose(n.id)',
  'hobbyStudio.update(dt)',
  'hobbyStudio.active()',
  "homeAspirations.recordAction(id,'hobby'",
  'finishHobbySession(n)',
  "functionalHomes.reward(id,activeResidence,'hobby'",
  "btn('🎨 Little Passions Studio','hs-board')"
 ])assert.ok(game.includes(part),part);
 assert.ok(html.indexOf('hobby-studio-v2518.js')<html.indexOf('game.js'));
 for(const asset of ['hobby-studio-v2518.js','hobby-studio-v2518.css']){
  assert.ok(html.includes(asset));assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.match(sw,/hearth-harbor-v2518-little-passions/);
});
