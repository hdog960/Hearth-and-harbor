/* Hearth & Harbor v2.5.19 Kitchen Craft QA
 * Run: node --test tests/kitchen-craft-v2519.test.cjs */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(dir,n),'utf8');
const craftSrc=read('kitchen-craft-v2519.js'),kitchenSrc=read('kitchen.js');
const html=read('index.html'),worker=read('sw.js');
const sandbox={window:{}};vm.runInNewContext(craftSrc,sandbox,{filename:'kitchen-craft-v2519.js'});
const C=sandbox.window.HearthKitchenCraft;
function craft(kind,recipe){const m=C.make(kind,recipe);assert.ok(m);return m}
function doStep(m){
 const len=m.state.expected.length;
 for(let i=0;i<len;i++){
  if(m.state.kind==='chop')assert.equal(m.act('cut:'+i).valid,true);
  else{assert.equal(m.act('pick:'+m.state.expected[i]).valid,true);assert.equal(m.act('place:'+i).valid,true)}
 }
 assert.equal(m.progress(),100);assert.equal(m.finish(),true);
}
test('six craft techniques are independently authored and cannot be forged',()=>{
 assert.equal(C.KINDS.length,6);
 assert.equal(new Set(C.KINDS).size,6);
 assert.equal(C.make('unknown','toast'),null);
 for(const type of C.KINDS){const c=craft(type,'salad');assert.match(c.render(),/kCraft/);assert.match(c.render(),/cook-craft/);}
});
test('chop four visible marks in sequence, no arbitrary tapping to skip',()=>{
 const m=craft('chop','salad');
 assert.equal(m.state.expected.length,4);
 assert.equal(m.act('cut:2').valid,false);
 assert.equal(m.progress(),0);
 assert.equal(m.act('cut:0').valid,true);
 assert.equal(m.progress(),25);
 assert.equal(m.act('cut:0').valid,false);
 m.act('cut:1');m.act('cut:2');m.act('cut:3');
 assert.equal(m.finish(),true);assert.equal(m.progress(),100);
 assert.ok(m.score()>=75&&m.score()<96,'mistakes affect optional plate quality only');
 assert.equal(m.act('cut:3').valid,false,'cannot double finish');
});
test('seasoning requires picking the recipe-specific spice, then applying it to a distinct area',()=>{
 const m=craft('season','fishplate');
 assert.equal(m.state.expected.join('|'),'zest|herb|salt');
 assert.equal(m.act('place:0').valid,false,'must choose spice first');
 assert.equal(m.act('pick:herb').valid,true);
 assert.equal(m.act('place:0').valid,false,'wrong spice cannot count');
 assert.equal(m.progress(),0);
 m.act('pick:zest');m.act('place:0');
 m.act('pick:herb');m.act('place:1');
 m.act('pick:salt');m.act('place:2');
 assert.equal(m.finish(),true);
 assert.match(m.render(),/Beautifully prepared/);
});
test('vegetable skewer needs three real different ingredients and separate notches',()=>{
 const m=craft('thread','skewers');
 assert.equal(m.state.expected.join('|'),'carrot|potato|onion');
 assert.equal(m.act('pick:carrot').valid,true);
 assert.equal(m.act('place:2').valid,false,'no skipped notch');
 assert.equal(m.progress(),0);
 assert.equal(m.act('place:0').valid,true);
 m.act('pick:potato');m.act('place:1');
 m.act('pick:onion');m.act('place:2');
 assert.equal(m.finish(),true);
});
test('two pastry fillings use distinct authored palettes',()=>{
 const t=craft('fill','tart'),d=craft('fill','dumplings');
 assert.equal(t.state.expected.join('|'),'berry|honey|berry');
 assert.equal(d.state.expected.join('|'),'garden|garden|garden');
 assert.notEqual(t.state.expected.join('|'),d.state.expected.join('|'));
 doStep(t);doStep(d);
});
test('biscuits choose and stamp three different biscuit cutters',()=>{
 const m=craft('stamp','biscuits');
 assert.equal(m.act('pick:invalid').valid,false);
 assert.equal(m.act('pick:heart').valid,true);
 assert.equal(m.act('place:0').valid,false,'wrong cutter cannot stamp');
 doStep(m);
 assert.equal(m.finish(),true);
});
test('garnishes vary by dish, not just different labels on the same tap progress',()=>{
 const salad=craft('garnish','salad'),cake=craft('garnish','tart'),fish=craft('garnish','fishplate');
 assert.equal(salad.state.expected.join('|'),'berry|leaf|petal');
 assert.equal(cake.state.expected.join('|'),'berry|petal|honey');
 assert.equal(fish.state.expected.join('|'),'leaf|petal|leaf');
 doStep(salad);doStep(cake);doStep(fish);
});
test('invalid and prototype-shaped input never completes or alters the ingredients',()=>{
 const m=craft('garnish','pancakes');
 for(const token of ['__proto__','constructor','pick:__proto__','pick:berry:0','place:-1','place:NaN','place:1']){
  const response=m.act(token);
  assert.equal(response.valid,false);
 }
 assert.equal(m.progress(),0);
 assert.equal(m.state.completed.length,0);
});
test('clear mobile feedback, large touch targets and accessible finished/selected states exist',()=>{
 const m=craft('stamp','biscuits');let markup=m.render();
 assert.match(markup,/role="group"/);
 assert.match(markup,/aria-pressed/);
 assert.match(markup,/kc-stage/);
 assert.match(markup,/Press the cookie cutters/);
 assert.match(read('kitchen-craft-v2519.css'),/min-height:49px/);
 assert.match(read('kitchen-craft-v2519.css'),/touch-action:manipulation/);
 m.act('pick:star');markup=m.render();assert.match(markup,/aria-pressed="true"/);
});
test('all six craft scores clamp even with repeated failed attempts',()=>{
 const m=craft('chop','salad');
 for(let i=0;i<30;i++)m.act('cut:9');
 doStep(m);
 assert.equal(m.score(),75);
 assert.equal(m.finish(),true);
});
function kitchenHarness(){
 const context={window:{HearthKitchenCraft:C,HearthKitchenArt:{plated:id=>'plated-'+id,stage:(id,step)=>'stage-'+step}}};
 const pantry={};
 for(const name of ['bread','butter','berry','apple','carrot','herb','flour','milk','egg','noodle','fish','honey','onion','potato'])pantry[name]=80;
 const state={coins:500,day:1,needs:{hunger:30,fun:30,social:30},
  cooking:{pantry,dishes:[],xp:0,made:0,mastered:{},servedDaily:{},relaxed:true}};
 let saveCount=0,views=[],notices=[];
 context.document={getElementById:id=>null};
 context.window.HearthKitchenArt=context.window.HearthKitchenArt;
 vm.runInNewContext(kitchenSrc,context,{filename:'kitchen.js'});
 const kitchen=new context.window.HearthKitchen({
  getState:()=>state,getResidents:()=>[],
  showModal:(id,html)=>views.push({id,html}),
  save:()=>saveCount++,notify:x=>notices.push(x),coins:n=>state.coins+=n,
  changeNeed:()=>{},openFamilyTable:()=>{}
 });
 return {kitchen,state,views,notices,get saves(){return saveCount}};
}
const RECIPES={
 toast:['stir','flip'],salad:['chop','garnish'],soup:['chop','stir','simmer'],
 pancakes:['pour','stir','flip','garnish'],eggs:['crack','flip','season'],
 noodles:['pour','stir','season'],fishplate:['season','flip','garnish'],
 tart:['knead','fill','bake','garnish'],biscuits:['knead','stamp','bake'],
 jam:['chop','simmer','pour'],skewers:['chop','thread','season','grill'],
 dumplings:['knead','fill','steam','garnish']
};
function cookRecipe(h,id){
 const k=h.kitchen;
 k.begin(id);
 assert.equal(k.session.id,id);
 let limit=55;
 while(k.session&&limit-->0){
  const kind=RECIPES[id][k.session.index];
  if(C.KINDS.includes(kind)){
   assert.ok(k.craft,'distinct craft board exists for '+kind);
   const stage=k.craft;
   const n=stage.state.expected.length;
   const previous=k.session.index;
   for(let i=0;i<n;i++){
    if(stage.state.kind==='chop')k.handle('cook-craft','cut:'+i);
    else{k.handle('cook-craft','pick:'+stage.state.expected[i]);k.handle('cook-craft','place:'+i)}
   }
   if(k.session)assert.equal(k.session.index,previous+1);
  }else{
   assert.equal(k.craft,null,'ordinary gesture/timed step remains ordinary');
   for(let taps=0;k.session&&RECIPES[id][k.session.index]===kind&&taps<8;taps++)k.tap();
  }
 }
 assert.ok(limit>0,'recipe completed rather than stuck '+id);
 assert.equal(k.session,null);
}
test('twelve original full recipes remain cookable and save only real finished plates',()=>{
 const h=kitchenHarness(),before=h.state.coins;
 for(const id of Object.keys(RECIPES))cookRecipe(h,id);
 assert.equal(h.state.cooking.dishes.length,12);
 assert.equal(h.state.cooking.made,12);
 assert.equal(h.state.cooking.xp>0,true);
 assert.ok(h.state.cooking.dishes.every(x=>x.quality>=1&&x.quality<=3));
 assert.equal(h.state.coins,before,'cooking does not mint money');
 assert.equal(h.state.cooking.mastered.tart,1);
 assert.equal(h.state.cooking.mastered.dumplings,1);
});
test('generic one-button tap no longer bypasses the six interactive craft techniques',()=>{
 const h=kitchenHarness();h.kitchen.begin('salad');
 assert.equal(h.kitchen.craft.state.kind,'chop');
 for(let i=0;i<12;i++)h.kitchen.tap();
 assert.equal(h.kitchen.session.index,0);
 assert.equal(h.kitchen.session.progress,0);
 assert.match(h.views.at(-1).html,/data-act="cook-craft"/);
 assert.doesNotMatch(h.views.at(-1).html,/data-act="cook-tap"/);
 assert.equal(h.kitchen.handle('cook-craft','cut:0'),undefined);
 assert.equal(h.kitchen.session.progress,25);
});
test('abandon preserves existing dishes, consumes only original up-front ingredients, no unintended rewards',()=>{
 const h=kitchenHarness(),old=h.state.cooking.pantry.apple;
 h.kitchen.begin('salad');
 assert.equal(h.state.cooking.pantry.apple,old-1);
 h.kitchen.handle('cook-craft','cut:0');
 h.kitchen.abandon();
 assert.equal(h.state.cooking.dishes.length,0);
 assert.equal(h.state.cooking.made,0);
 assert.equal(h.kitchen.craft,null);
 assert.equal(h.state.cooking.pantry.apple,old-1);
});
test('all new files load before Hearth Kitchen and precache on iPhone',()=>{
 assert.ok(html.indexOf('kitchen-craft-v2519.js')<html.indexOf('kitchen.js'));
 for(const asset of ['kitchen-craft-v2519.js','kitchen-craft-v2519.css']){
  assert.ok(html.includes(asset));assert.ok(worker.includes("'./"+asset+"'"));
 }
 assert.match(worker,/const CACHE='hearth-harbor-v[0-9]+-[a-z-]+'/); // Offline cache rotates for each release.
 for(const token of ["this.craft=window.HearthKitchenCraft?.make(kind,s.id)","case 'cook-craft':return this.craftAction(id)","if(!this.session||this.craft)return"])assert.ok(kitchenSrc.includes(token),token);
});
