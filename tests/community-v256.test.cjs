/* Hearth & Harbor — v2.5.6 festival community regressions.
   Run locally with: node --test tests/community-v256.test.cjs
   No external packages or browser services required. */
'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','community-v256.js'),'utf8');
const root={};
const elements={
 hcmCanvas:{addEventListener(){},getBoundingClientRect(){return {left:0,top:0,width:360,height:286};}},
 hcmDirections:{textContent:''},
 hcmButtons:{innerHTML:''},
 hcmCounter:{textContent:''}
};
vm.runInNewContext(source,{
 window:root,document:{getElementById:id=>elements[id]||null},
 performance:{now:()=>2400},
 requestAnimationFrame:()=>1,
 cancelAnimationFrame:()=>{}
},{filename:'community-v256.js'});
const engine=root.HearthCommunity;
const people=['mabel','bea','finn','jun','rosie','oliver'];
function fresh(){
 let saves=0,updates=0,dialogs=[];
 const state={day:3,season:0,community:{moments:{},portraits:[]},coins:25,hearts:0,
   needs:{fun:8,social:8},
   relations:Object.fromEntries(people.map(id=>[id,0]))};
 const world=engine.setup({
  getState:()=>state,save:()=>{saves++},
  updateUI:()=>{updates++},
  showModal:(kind,html)=>dialogs.push({kind,html}),
  notify:()=>{},closeModal:()=>{}
 });
 return {state,world,dialogs,get saves(){return saves},get updates(){return updates}};
}
function runTask(world,story,season){
 world.play(story.id);
 for(let round=0;round<4;round++){
  if(story.mode==='pattern')world.handle('comm-pattern',String((round+2*season+people.indexOf(story.id))%3));
  else if(story.mode==='timing')world.handle('comm-assist','');
  else world.handle('comm-gather','');
 }
}
test('existing v2.5.5 saves start with empty, safe community state',()=>{
 assert.deepEqual(Object.keys(engine.clean(undefined).moments),[]);
 assert.equal(engine.clean({moments:{
  '0:mabel':{stars:3},'1:mabel':{stars:3},'9999:bea':{stars:2},'0:bea':{stars:10}
 }}).moments['0:mabel'].stars,3);
 assert.equal(Object.keys(engine.clean({moments:{'x:mabel':{stars:3},'1:mabel':{stars:3}}}).moments).length,0);
 assert.deepEqual(Array.from(engine.clean({portraits:[1,1,-7,5000,'3']}).portraits),[1]);
});
test('four seasons, eight resident interactions, one portrait per pair',()=>{
 const x=fresh(),{state,world,dialogs}=x;
 let expectedHearts=0,expectedCoins=25;
 for(let season=0;season<4;season++){
  state.season=season;state.day=3+season*7;
  assert.equal(world.festivalOpen(),true);
  const stories=engine.MOMENTS.filter(x=>x.season===season);
  assert.equal(stories.length,2);
  for(const story of stories){
   world.open(story.id);
   assert.match(dialogs.at(-1).html,/shared|help|special/i);
   runTask(world,story,season);
   assert.equal(state.community.moments[season+':'+story.id].stars,3);
   expectedHearts+=3;
   const friendship=state.relations[story.id],heartNow=state.hearts,coinsNow=state.coins;
   runTask(world,story,season);
   assert.equal(state.relations[story.id],friendship,'replaying does not farm friends');
   assert.equal(state.hearts,heartNow,'replaying does not farm hearts');
   assert.equal(state.coins,coinsNow,'replaying does not farm coins');
  }
  expectedCoins+=12;
  assert.ok(state.community.portraits.includes(season));
  world.board();
  assert.match(dialogs.at(-1).html,/Your shared memories/);
  assert.match(dialogs.at(-1).html,/hcm-archive-item/);
 }
 assert.equal(state.coins,expectedCoins);
 assert.equal(state.hearts,expectedHearts);
 assert.equal(x.saves,8);
 assert.equal(x.updates,8);
});
test('calendar gating blocks projects outside festival dates',()=>{
 const x=fresh();x.state.day=1;
 assert.equal(x.world.festivalOpen(),false);
 x.world.open('mabel');
 assert.equal(x.dialogs.at(-1).kind,'community-board');
 x.world.play('mabel');
 assert.equal(x.dialogs.at(-1).kind,'community-board');
 assert.deepEqual(Object.keys(x.state.community.moments),[]);
});
test('one-star work is saved safely; no runaway rewards on rerun',()=>{
 const x=fresh(),world=x.world;
 world.play('mabel');
 for(let i=0;i<4;i++)world.handle('comm-pattern',String(((i+people.indexOf('mabel'))%3+1)%3));
 assert.equal(x.state.community.moments['0:mabel'].stars,1);
 const once={hearts:x.state.hearts,saves:x.saves,friend:x.state.relations.mabel};
 world.play('mabel');
 for(let i=0;i<4;i++)world.handle('comm-pattern','0');
 assert.equal(x.state.community.moments['0:mabel'].stars,1);
 assert.equal(x.state.hearts,once.hearts);
 assert.equal(x.saves,once.saves);
 assert.equal(x.state.relations.mabel,once.friend);
});
