/* Hearth & Harbor v2.5.22 — Illustrated Worktops.
 * Run: node --test tests/kitchen-worktop-art-v2522.test.cjs
 */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const context={window:{}};
vm.runInNewContext(read('kitchen-worktop-art-v2522.js'),context,{filename:'kitchen-worktop-art-v2522.js'});
vm.runInNewContext(read('kitchen-craft-v2519.js'),context,{filename:'kitchen-craft-v2519.js'});
const A=context.window.HearthKitchenWorktopArt,C=context.window.HearthKitchenCraft;
const progress=(c)=>{
 if(c.state.kind==='chop')return c.act('cut:'+c.state.completed.length);
 const i=c.state.completed.length;
 c.act('pick:'+c.state.expected[i]);
 return c.act('place:'+i);
};
test('all six worktops now have distinct original SVG illustrations inside their real action boards',()=>{
 const scenes=new Set();
 for(const kind of C.KINDS){
  const c=C.make(kind,'salad'),html=c.render();
  assert.match(html,new RegExp('kc-art-'+kind));
  assert.match(html,/viewBox="0 0 360 140"/);
  assert.match(html,/aria-hidden="true"/);
  assert.match(html,/data-act="cook-craft"/);
  assert.doesNotMatch(html,/<img[^>]+src=/);
  scenes.add(A.render(kind,'salad',[],null));
 }
 assert.equal(scenes.size,6);
});
test('chopping renders more cut ingredient slices on every successful cut, not just button counters',()=>{
 const c=C.make('chop','salad');
 const initial=A.render('chop','salad',c.state.completed,null);
 progress(c);
 const afterOne=A.render('chop','salad',c.state.completed,null);
 assert.notEqual(initial,afterOne);
 assert.match(afterOne,/kc-spark/);
 progress(c);progress(c);progress(c);
 assert.equal(c.progress(),100);
 assert.equal(c.finish(),true);
 assert.match(c.render(),/4 of 4 placed/);
});
test('seasoning is visibly different for eggs and fish, and the right spice appears on the plate',()=>{
 const egg=A.render('season','eggs',[],null),fish=A.render('season','fishplate',[],null);
 assert.notEqual(egg,fish,'recipe-specific plate bases must be meaningful');
 const c=C.make('season','fishplate');
 const blank=A.render('season','fishplate',c.state.completed,c.state.selected);
 c.act('pick:zest');
 const ghost=A.render('season','fishplate',c.state.completed,c.state.selected);
 assert.notEqual(blank,ghost,'selected ingredient preview appears before placing');
 c.act('place:0');
 const ready=A.render('season','fishplate',c.state.completed,c.state.selected);
 assert.notEqual(ghost,ready,'successful seasoning is painted onto finished food');
 assert.equal(c.progress(),33);
});
test('all skewer placements depict the chosen vegetable in the same sequence as the recipe',()=>{
 const c=C.make('thread','skewers'),pictures=[];
 pictures.push(c.render());
 for(let i=0;i<3;i++){assert.equal(progress(c).valid,true);pictures.push(c.render())}
 assert.equal(new Set(pictures).size,4);
 assert.equal(c.state.completed.join(','),'carrot,potato,onion');
 assert.equal(c.finish(),true);
});
test('tart and dumpling pockets use different recipes, filling visuals and safe selection previews',()=>{
 const tart=C.make('fill','tart'),dumpling=C.make('fill','dumplings');
 assert.notEqual(tart.state.expected.join(','),dumpling.state.expected.join(','));
 const before=tart.render();tart.act('pick:berry');const selected=tart.render();
 assert.notEqual(before,selected);
 assert.equal(tart.act('place:0').valid,true);
 assert.notEqual(selected,tart.render());
 assert.notEqual(A.render('fill','tart',['berry'],null),A.render('fill','dumplings',['garden'],null));
});
test('biscuit stamps show individually authored shapes, and incorrect choices do not paint progress',()=>{
 const c=C.make('stamp','biscuits');
 const before=A.render('stamp','biscuits',c.state.completed,null);
 c.act('pick:heart');
 const wrong=c.act('place:0');
 assert.equal(wrong.valid,false);
 assert.equal(c.state.completed.length,0);
 assert.equal(A.render('stamp','biscuits',c.state.completed,null),before);
 c.act('pick:star');c.act('place:0');
 const star=A.render('stamp','biscuits',c.state.completed,null);
 assert.notEqual(before,star);
 assert.match(star,/M0-21L6-7L23-6/);
 c.act('pick:flower');c.act('place:1');
 c.act('pick:heart');c.act('place:2');
 assert.equal(c.finish(),true);
});
test('plate garnishes respect each real food identity and only completed toppings persist',()=>{
 const salad=C.make('garnish','salad'),fish=C.make('garnish','fishplate');
 assert.notEqual(A.render('garnish','salad',[],null),A.render('garnish','fishplate',[],null));
 salad.act('pick:berry');salad.act('place:0');
 assert.match(salad.render(),/kc-art-garnish/);
 assert.equal(salad.progress(),33);
 assert.equal(fish.progress(),0);
});
test('invalid art inputs do not inject strings into SVG or reward gameplay',()=>{
 assert.equal(A.render('unsafe','salad',[],null),'');
 assert.equal(A.render('garnish','salad',null,null),'');
 const html=A.render('garnish','salad',["<script>"],"<img onerror=1>");
 assert.doesNotMatch(html,/<script>|onerror|<img/i);
 assert.match(html,/kc-art-garnish/);
});
test('art only reacts to transient state and cannot directly modify saves or currency',()=>{
 const source=read('kitchen-worktop-art-v2522.js');
 assert.doesNotMatch(source,/localStorage|sessionStorage|coins\(|\.save\(|\.xp\b|\.dishes\b/);
 const c=C.make('season','eggs');const old=c.score();
 A.render('season','eggs',c.state.completed,c.state.selected);
 assert.equal(c.score(),old);
 assert.equal(c.progress(),0);
});
test('art loads before craft state machine and is included in every offline cache',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const art='kitchen-worktop-art-v2522.js',craft='kitchen-craft-v2519.js',core='kitchen.js';
 assert.ok(html.includes(art)&&sw.includes("'./"+art+"'"));
 assert.ok(html.indexOf(art)<html.indexOf(craft)&&html.indexOf(craft)<html.indexOf(core));
 assert.match(sw,/hearth-harbor-v2522-living-worktops/);
});
test('responsive illustration remains decorative; controls stay large and reduced motion works',()=>{
 const css=read('kitchen-craft-v2519.css');
 for(const token of ['.k-craft-step .kc-art-wrap{','height:110px','@media(max-width:390px)','height:87px','min-height:74px','@media(prefers-reduced-motion:reduce){.k-craft-step .kc-art-wrap .kc-spark']){
  assert.ok(css.includes(token),token);
 }
 assert.match(css,/\.k-craft-step \.kc-art-wrap svg\{touch-action:none\}/);
 assert.match(css,/\.k-craft-step \.kc-palette button\[aria-pressed=true\]/);
});
