/* Hearth & Harbor v2.5.13 — Little Atelier regression tests.
 * Run: node --test tests/atelier-v2513.test.cjs
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const js=read('atelier-v2513.js'),game=read('game.js'),html=read('index.html'),sw=read('sw.js');
const world={window:{}};vm.runInNewContext(js,world,{filename:'atelier-v2513.js'});
const A=world.window.HearthAtelier;
function create(){
 const state={
  coins:250,placed:[
   {kind:'lamp',x:432,z:395,rot:0},{kind:'plant',x:660,z:900,rot:1}
  ],residenceProps:{h0:[{kind:'books',x:480,y:550,rot:0}],h1:[]},
  atelierStorage:A.clean(null),
  unrelated:{householdId:'existing'}
 };
 let current='player',writes=0,ui=0,reopen=0,notices=[],storedIndex=null;
 const api={
  getState:()=>state,save:()=>writes++,updateUI:()=>ui++,
  notify:x=>notices.push(x),room:()=>current,
  isInRoom:id=>current===id,reopen:()=>reopen++,
  beginStored:index=>{storedIndex=index}
 };
 const engine=A.setup(api);
 return {state,engine,notices,setRoom:id=>current=id,
  get writes(){return writes},get ui(){return ui},
  get reopen(){return reopen},get storedIndex(){return storedIndex}};
}
test('empty and malformed historical storage migrates safely, keeping only permitted furniture',()=>{
 const migrated=A.clean({player:[
  {kind:'lamp',rot:2},{kind:'__proto__'},{kind:'bed',rot:100},{kind:'flowers',rot:-4},
  {kind:'plant',rot:0}
 ],h0:[{kind:'sofa',rot:2},{kind:'rug',rot:2},{kind:'plant',rot:1}],evil:[{kind:'lamp'}]});
 assert.equal(migrated.player.length,4);
 assert.equal(migrated.player[1].rot,3);
 assert.equal(migrated.player[2].rot,0);
 assert.equal(migrated.h0.length,2);
 assert.equal(Object.keys(migrated).length,7);
 assert.equal(A.clean(undefined).player.length,0);
});
test('storage removes only the chosen item and restores it without buying it again',()=>{
 const x=create(),before=x.engine.snapshot('player');
 assert.equal(x.engine.storeItem(0,'player'),true);
 assert.equal(x.state.placed.length,1);
 assert.equal(x.state.atelierStorage.player.length,1);
 assert.equal(x.state.atelierStorage.player[0].kind,'lamp');
 assert.equal(x.state.coins,250);
 assert.equal(x.writes,1);
 assert.equal(x.engine.beginStored(0,'player'),true);
 assert.equal(x.storedIndex,0);
 // Same operations the actual placement callback applies, with a transaction.
 const selected=x.engine.storedItem(0,'player');
 const snap=x.engine.snapshot('player');
 x.state.atelierStorage.player.splice(0,1);
 x.state.placed.push({kind:selected.kind,x:500,z:420,rot:0});
 assert.equal(x.engine.commit(snap,'player'),true);
 assert.equal(x.state.coins,250);
 assert.equal(x.state.atelierStorage.player.length,0);
 assert.equal(x.state.placed.length,2);
 assert.notDeepEqual(x.engine.snapshot('player'),before,'position changed but item not charged');
});
test('undo and redo preserve original coordinates, rotation and coin balance for a move',()=>{
 const x=create(),old=x.engine.snapshot('player');
 x.state.placed[0].x=800;x.state.placed[0].rot=3;
 assert.equal(x.engine.commit(old,'player'),true);
 assert.equal(x.engine.direction('undo','player'),true);
 assert.equal(x.state.placed[0].x,432);
 assert.equal(x.state.placed[0].rot,0);
 assert.equal(x.state.coins,250);
 assert.equal(x.engine.direction('redo','player'),true);
 assert.equal(x.state.placed[0].x,800);
 assert.equal(x.state.placed[0].rot,3);
 assert.equal(x.state.coins,250);
});
test('undoing a purchase refunds exactly that charge; redo restores item and deduction',()=>{
 const x=create(),before=x.engine.snapshot('player');
 x.state.coins-=40;x.state.placed.push({kind:'lamp',x:650,z:480,rot:0});
 x.engine.commit(before,'player');
 assert.equal(x.state.coins,210);
 assert.equal(x.engine.direction('undo','player'),true);
 assert.equal(x.state.coins,250);
 assert.equal(x.state.placed.length,2);
 assert.equal(x.engine.direction('redo','player'),true);
 assert.equal(x.state.coins,210);
 assert.equal(x.state.placed.length,3);
 assert.equal(x.state.unrelated.householdId,'existing');
});
test('undo protects unrelated economy changes and never rewinds outside earnings',()=>{
 const x=create(),before=x.engine.snapshot('player');
 x.state.coins-=35;x.state.placed.push({kind:'rug',x:650,z:480,rot:1});
 x.engine.commit(before,'player');
 x.state.coins+=12; // earned from another system after the decorating transaction
 assert.equal(x.engine.direction('undo','player'),false);
 assert.equal(x.state.coins,227);
 assert.equal(x.state.placed.length,3);
 assert.equal(x.engine.direction('redo','player'),false);
 assert.match(x.notices.at(-2),/changed/);
});
test('stored furniture is restricted to its own residence, undo respects each house',()=>{
 const x=create();x.setRoom('h0');
 assert.equal(x.engine.storeItem(0,'h0'),true);
 assert.equal(x.state.residenceProps.h0.length,0);
 assert.equal(x.state.atelierStorage.h0[0].kind,'books');
 assert.equal(x.engine.beginStored(0,'player'),false,'cannot use other home storage');
 assert.equal(x.engine.direction('undo','h0'),true);
 assert.equal(x.state.residenceProps.h0.length,1);
 assert.equal(x.state.residenceProps.h0[0].y,550);
 assert.equal(x.state.atelierStorage.h0.length,0);
 assert.equal(x.state.placed.length,2);
});
test('redo history is cleared when the player makes a fresh edit after undo',()=>{
 const x=create();
 const a=x.engine.snapshot('player');x.state.placed[0].rot=1;x.engine.commit(a,'player');
 x.engine.direction('undo','player');
 const b=x.engine.snapshot('player');x.state.placed[1].rot=2;x.engine.commit(b,'player');
 assert.equal(x.engine.direction('redo','player'),false);
 assert.equal(x.state.placed[0].rot,0);
 assert.equal(x.state.placed[1].rot,2);
});
test('history is bounded to ten transactions and is never saved alongside furniture',()=>{
 const x=create();
 for(let n=0;n<12;n++){
  const snap=x.engine.snapshot('player');
  x.state.placed[0].x=430+n*12;
  x.engine.commit(snap,'player');
 }
 const panel=x.engine.toolbar('player');
 assert.match(panel,/10 changes to undo/);
 assert.equal(Object.keys(x.state.atelierStorage).sort().join('|'),A.HOMES.slice().sort().join('|'));
 for(let n=0;n<10;n++)assert.equal(x.engine.direction('undo','player'),true);
 assert.equal(x.engine.direction('undo','player'),false);
 assert.equal(x.state.placed[0].x,442,'oldest two edits remain outside the undo window');
});
test('mobile UI offers storage, placement and undo/redo for both room types',()=>{
 const x=create();const homes=x.engine.toolbar('player');
 assert.match(homes,/Little Atelier/);
 assert.match(homes,/Furniture storage/);
 assert.match(homes,/disabled/);
 x.engine.storeItem(1,'player');
 const html=x.engine.toolbar('player');
 assert.match(html,/Fern in pot/);
 assert.match(html,/data-act="at-place"/);
 assert.match(html,/data-act="at-undo"/);
 x.setRoom('h0');x.engine.storeItem(0,'h0');
 assert.match(x.engine.toolbar('h0'),/Storybook shelf/);
});
test('runtime integrations and offline assets load before the main game',()=>{
 for(const part of [
  'window.HearthAtelier.clean(raw.atelierStorage)',
  'littleAtelier.snapshot(home)',"littleAtelier.commit(before,home)",
  'littleAtelier.storage(home).splice(placement.storageIndex,1)',
  'littleAtelier.toolbar(activeResidence)',
  "littleAtelier.toolbar('player')",
  'littleAtelier.handle(action,id)',
  'data-act="at-store"'
 ]) assert.ok(game.includes(part),'Missing core hook: '+part);
 assert.ok(html.indexOf('atelier-v2513.js')<html.indexOf('game.js'));
 for(const asset of ['atelier-v2513.js','atelier-v2513.css']){
  assert.ok(html.includes(asset));assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.match(sw,/hearth-harbor-v2513-little-atelier/);
});
