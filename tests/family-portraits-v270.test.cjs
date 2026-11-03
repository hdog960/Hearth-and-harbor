/* Hearth & Harbor v2.7.0 — real two-person Family Portraits regression gates */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
const sandbox={window:{}};vm.runInNewContext(read('family-portraits-v270.js'),sandbox,{filename:'family-portraits-v270.js'});
const F=sandbox.window.HearthFamilyPortraits;
function fixture(opts={}){
 const homes={mabel:'h0',rosie:'h0',oliver:'h1',jun:'h1',bea:'h2',finn:'h2'};
 const done=Object.fromEntries(F.IDS.map(id=>[id,[]]));
 const state={day:6,coins:300,familyRoots:{chosen:{}},weddingPlans:{'mabel|rosie':{status:'married',marriedDay:3}},familyPortraits:F.clean(null),...opts};
 let saves=0,updates=0,modal={key:'',html:''};const alerts=[],queued=[];
 const api={getState:()=>state,save:()=>saves++,updateUI:()=>updates++,notify:x=>alerts.push(x),
  getHomeMembers:home=>Object.keys(homes).filter(id=>homes[id]===home),
  getPersonLabel:id=>id[0].toUpperCase()+id.slice(1),
  getHomeLabel:home=>'Cottage '+home,getDone:id=>done[id]||[],
  addSchedule:(home,id,kind)=>{queued.push({home,id,kind});return true},
  showModal:(key,html)=>{modal={key,html}}};
 const p=F.setup(api);
 return {state,homes,done,p,queued,alerts,api,get saves(){return saves},get updates(){return updates},get modal(){return modal}};
}
test('clean creates safe default without fictional portraits or fabricated relatives',()=>{
 const f=fixture();assert.equal(JSON.stringify(f.p.data),JSON.stringify({pending:{},portraits:[]}));
 assert.equal(f.p.items().length,0);assert.equal(f.p.comfort('h0'),0);
});
test('import rejects invalid people, homes, themes, dates, duplicate pairs, and unsafe labels',()=>{
 const c=F.clean({pending:{h0:{pair:'mabel|rosie',theme:'story',day:6,done:['mabel','bad','mabel']},h9:{pair:'mabel|rosie',theme:'story',day:6,done:[]}},
 portraits:[{home:'h0',pair:'bad|rosie',theme:'story',day:6,link:'marriage',linkDay:3},
 {home:'h0',pair:'mabel|rosie',theme:'<img>',day:6,link:'marriage',linkDay:3},
 {home:'h0',pair:'mabel|rosie',theme:'story',day:2,link:'marriage',linkDay:3},
 {home:'h0',pair:'mabel|rosie',theme:'story',day:6,link:'marriage',linkDay:3},
 {home:'h0',pair:'mabel|rosie',theme:'story',day:6,link:'marriage',linkDay:3}]});
 assert.equal(Object.keys(c.pending).length,1);assert.equal(c.pending.h0.done.length,1);assert.equal(c.portraits.length,1);
});
test('ordinary roommates are not automatically counted as family',()=>{
 const f=fixture({weddingPlans:{}});assert.equal(f.p.begin('h0','story'),false);
 assert.equal(f.p.items('h0').length,0);assert.equal(f.saves,0);
});
test('a real completed marriage authorizes a story portrait, not an engagement',()=>{
 const f=fixture({weddingPlans:{'mabel|rosie':{status:'engaged',marriedDay:3}}});
 assert.equal(f.p.begin('h0','story'),false);
 f.state.weddingPlans['mabel|rosie'].status='married';assert.equal(f.p.begin('h0','story'),true);
 assert.equal(f.p.items('h0').length,0);assert.equal(f.saves,1);
});
test('a real chosen-family promise permits portraits without converting to romance',()=>{
 const f=fixture({weddingPlans:{},familyRoots:{chosen:{'mabel|rosie':{day:2,status:'active',home:'h0'}}}});
 assert.equal(f.p.begin('h0','hearth'),true);
 f.p.completed('h0','rosie','chat',true,6);f.p.completed('h0','mabel','chat',true,6);
 assert.equal(f.p.items('h0')[0].link,'chosen');assert.equal(f.p.items('h0')[0].linkDay,2);
 assert.deepEqual(f.state.weddingPlans,{});
});
test('opening a book or selecting a theme does not grant any reward',()=>{
 const f=fixture();f.p.board('h0');assert.match(f.modal.html,/Choose a family memory/);
 f.p.begin('h0','maker');assert.equal(f.p.comfort('h0'),0);
 assert.equal(f.state.coins,300);assert.equal(f.p.items('h0').length,0);
});
test('wrong actions, outsiders, duplicated attempts and non-first daily actions never progress',()=>{
 const f=fixture();f.p.begin('h0','story');
 assert.equal(f.p.completed('h0','mabel','chat',true,6),false);
 assert.equal(f.p.completed('h0','oliver','read',true,6),false);
 assert.equal(f.p.completed('h0','mabel','read',false,6),false);
 assert.equal(f.p.completed('h0','mabel','read',true,7),false);
 assert.equal(f.p.completed('h0','mabel','read',true,6),true);
 assert.equal(f.p.completed('h0','mabel','read',true,6),false);
 assert.equal(f.p.items().length,0);
});
test('two genuine activities create exactly one persistent portrait and capped comfort',()=>{
 const f=fixture();assert.equal(f.p.begin('h0','story'),true);
 assert.equal(f.p.completed('h0','mabel','read',true,6),true);
 assert.equal(f.p.comfort('h0'),0);
 assert.equal(f.p.completed('h0','rosie','read',true,6),true);
 assert.equal(f.p.items('h0').length,1);assert.equal(f.p.comfort('h0'),2);
 assert.equal(f.p.completed('h0','rosie','read',true,6),false);
 assert.equal(f.p.begin('h0','story'),false);
 const copy=JSON.parse(JSON.stringify(f.p.data));assert.equal(F.clean(copy).portraits.length,1);
});
test('a second theme can fill a home but never exceed two physical frames',()=>{
 const f=fixture();for(const [theme,action] of [['story','read'],['maker','hobby']]){
  assert.equal(f.p.begin('h0',theme),true);
  f.p.completed('h0','mabel',action,true,6);f.p.completed('h0','rosie',action,true,6);
 }
 assert.equal(f.p.items('h0').length,2);assert.equal(f.p.comfort('h0'),4);
 assert.equal(f.p.begin('h0','hearth'),false);
});
test('an unfinished project may be canceled without portrait or income',()=>{
 const f=fixture();f.p.begin('h0','story');f.p.completed('h0','mabel','read',true,6);
 assert.equal(f.p.cancel('h0'),true);assert.equal(f.p.items().length,0);
 assert.equal(f.state.coins,300);assert.equal(f.p.comfort('h0'),0);
});
test('tasks already finished today cannot be retroactively claimed',()=>{
 const f=fixture();f.done.mabel.push('read');assert.equal(f.p.begin('h0','story'),false);
 assert.equal(f.saves,0);
});
test('Daybook scheduling never grants an instant reward or skips activities',()=>{
 const f=fixture();f.p.begin('h0','hearth');f.p.queue('h0','mabel');
 assert.deepEqual(f.queued,[{home:'h0',id:'mabel',kind:'chat'}]);
 assert.equal(f.p.session('h0').done.length,0);assert.equal(f.p.items().length,0);
});
test('a house move interrupts current work, but an earned portrait remains in its original home',()=>{
 const f=fixture();f.p.begin('h0','story');f.homes.rosie='h1';
 assert.equal(f.p.completed('h0','mabel','read',true,6),false);
 assert.equal(f.p.session('h0'),null);
 f.homes.rosie='h0';f.p.begin('h0','story');f.p.completed('h0','mabel','read',true,6);f.p.completed('h0','rosie','read',true,6);
 f.homes.rosie='h1';assert.equal(f.p.items('h0').length,1);
});
test('day rollover invalidates unfinished daily work without a retroactive reward',()=>{
 const f=fixture();f.p.begin('h0','hearth');f.p.completed('h0','mabel','chat',true,6);
 f.state.day=7;assert.equal(f.p.session('h0'),null);
 assert.equal(f.p.completed('h0','rosie','chat',true,7),false);assert.equal(f.p.items().length,0);
});
test('forged saved portraits are invisible without their real marriage or chosen-family evidence',()=>{
 const saved=F.clean({portraits:[{home:'h0',pair:'mabel|rosie',theme:'story',day:6,link:'marriage',linkDay:3}]});
 const f=fixture({familyPortraits:saved,weddingPlans:{}});
 assert.equal(f.p.items('h0').length,0);assert.equal(f.p.comfort('h0'),0);
});
test('past chosen family portrait stays valid if the voluntary tie is ended later',()=>{
 const f=fixture({weddingPlans:{},familyRoots:{chosen:{'mabel|rosie':{day:2,status:'active',home:'h0'}}}});
 f.p.begin('h0','hearth');f.p.completed('h0','mabel','chat',true,6);f.p.completed('h0','rosie','chat',true,6);
 f.state.day=8;f.state.familyRoots.chosen['mabel|rosie'].status='ended';f.state.familyRoots.chosen['mabel|rosie'].endedDay=8;
 assert.equal(f.p.items('h0').length,1);assert.equal(f.p.begin('h0','maker'),false);
});
test('genuine portraits render two distinct residents onto real residence Canvas',()=>{
 const f=fixture();f.p.begin('h0','story');f.p.completed('h0','mabel','read',true,6);f.p.completed('h0','rosie','read',true,6);
 const calls=[];const ctx={save(){calls.push('save')},restore(){calls.push('restore')},translate(){calls.push('translate')},
 fillRect(){calls.push('rect')},beginPath(){calls.push('begin')},arc(){calls.push('arc')},fill(){calls.push('fill')},fillText(){calls.push('text')}};
 f.p.draw(ctx,'h0');assert.ok(calls.filter(x=>x==='arc').length>=4);
 calls.length=0;f.p.draw(ctx,'h1');assert.equal(calls.length,0);
});
test('iPhone HTML loads portrait assets before the game and includes offline caching',()=>{
 const html=read('index.html'),sw=read('sw.js'),css=read('family-portraits-v270.css'),game=read('game.js');
 for(const asset of ['family-portraits-v270.js','family-portraits-v270.css']){
  assert.ok(html.includes(asset));assert.ok(sw.includes("'./"+asset+"'"));
 }
 assert.ok(html.indexOf('family-portraits-v270.js')<html.indexOf('game.js'));
 assert.match(html,/v=2\.7\.7/);assert.match(sw,/hearth-harbor-v277-childhood-dreams/);
 assert.match(css,/@media\(max-width:380px\)/);assert.match(css,/:focus-visible/);
 for(const hook of ['window.HearthFamilyPortraits.clean(raw.familyPortraits)','window.HearthFamilyPortraits.setup({','familyPortraits.completed(activeResidence,n.id','familyPortraits.completed(activeResidence,id','familyPortraits.draw(ctx,activeResidence)','familyPortraits.comfort(home)','familyPortraits.handle(action,id)'])
  assert.ok(game.includes(hook),'missing real integration '+hook);
 assert.ok(game.includes("const SAVE='hearth-harbor-save-v1'"));
});
test('portrait module uses no remote servers, timers, payments or browser storage of its own',()=>{
 const src=read('family-portraits-v270.js');
 assert.doesNotMatch(src,/fetch\(|WebSocket|XMLHttpRequest|setInterval|localStorage|new Image\(/);
});
