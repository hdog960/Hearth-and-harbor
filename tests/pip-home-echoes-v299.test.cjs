/* Hearth & Harbor v2.9.9 — evidence-backed friendship memories at home. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const sandbox={window:{}};
vm.runInNewContext(read('pip-home-echoes-v299.js'),sandbox,{filename:'pip-home-echoes-v299.js'});
const M=sandbox.window.HearthPipHomeEchoes;
const plain=v=>JSON.parse(JSON.stringify(v));
const peers=[
 {day:2,kind:'story',first:0,last:1},
 {day:3,kind:'color',first:1,last:0},
 {day:4,kind:'nature',first:0,last:0}
];
function fixture({day=8,guardian='player',guardianDay=1,homeKind='read',withHelp=true,
 peersData=peers,scene='home',childPos={x:550,y:710},player={x:554,y:717},
 busy=false,moving=false,raw=null}={}){
 const child={guardian,guardianDay,homeHelps:withHelp?[{day,kind:homeKind}]:[],
  homeEchoes:raw||{records:[]},needs:{joy:50,curiosity:60,confidence:45}};
 const state={day,coins:100,relations:{bea:31},youngResidents:{pip:child,wren:{friendships:peersData}}};
 let where=scene,p={...player},c={...childPos},occupied=busy,walking=moving,modal=null,saves=0,updates=0,notices=[];
 const api={getState:()=>state,getChild:()=>state.youngResidents.pip,
  getScene:()=>where,getPlayer:()=>({...p}),getChildPosition:()=>({...c}),
  getPeerRecords:()=>peersData,isOtherActivity:()=>occupied,
  isPlayerMoving:()=>walking,isDialogOpen:()=>!!modal,
  showModal:(name,html)=>modal={name,html},closeModal:()=>modal=null,
  save:()=>saves++,updateUI:()=>updates++,notify:v=>notices.push(v),
  openBook:()=>{modal={name:'little-sprouts',html:'Daybook'};return true}};
 const m=M.setup(api);
 return {m,state,child,api,notices,get saves(){return saves},get updates(){return updates},
  get modal(){return modal},setDay:n=>state.day=n,setScene:n=>where=n,
  setHomeKind:k=>child.homeHelps=[{day:state.day,kind:k}],
  setChild:(x,y)=>c={x,y},setPlayer:(x,y)=>p={x,y},
  setBusy:v=>occupied=v,setMoving:v=>walking=v,
  closeDialog:()=>modal=null,
  story(choice='0'){assert.equal(m.request(),true);assert.match(modal.html,/phe299-choose/);
   assert.equal(m.handle('phe299-choose',choice),true);}
 };
}
test('three distinct child-led home stories have meaningful two-choice responses',()=>{
 assert.deepEqual(Object.keys(M.STORIES),['story','color','nature']);
 for(const [k,t] of Object.entries(M.STORIES)){
  assert.equal(t.choices.length,2,k);assert.equal(t.after.length,2,k);
  assert.notEqual(t.after[0],t.after[1],k);assert.ok(t.intro.length>50);
 }
 assert.deepEqual(plain(M.STORIES.nature.tasks),['tidy','meal']);
});
test('old and malformed save data get optional empty records without resetting original save',()=>{
 assert.deepEqual(plain(M.clean(null,1)),{records:[]});
 assert.deepEqual(plain(M.clean({records:[{kind:'invalid',day:5}]},1)),{records:[]});
 assert.match(read('game.js'),/const SAVE='hearth-harbor-save-v1'/);
 const child=read('little-sprouts-v272.js');
 assert.match(child,/homeEchoes:root\.HearthPipHomeEchoes\?\.clean/);
 assert.match(child,/homeEchoes:\{records:\[\]\}/);
});
test('a real earlier Wren outing and genuinely completed matching cottage help are required',()=>{
 const f=fixture();assert.equal(f.m.ready(),true);
 const noPeer=fixture({peersData:[]});assert.equal(noPeer.m.ready(),false);
 const noHelp=fixture({withHelp:false});assert.equal(noHelp.m.ready(),false);
 const sameDay=fixture({peersData:[{day:8,kind:'story',first:0,last:0}]});
 assert.equal(sameDay.m.ready(),false);
 const mismatch=fixture({homeKind:'hobby',peersData:[peers[0]]});
 assert.equal(mismatch.m.ready(),false);
});
test('only chosen player guardianship permits the family feature',()=>{
 for(const opts of [{guardian:null},{guardian:'player',guardianDay:9}]){
  const f=fixture(opts);assert.equal(f.m.ready(),false);assert.equal(f.m.request(),false);
  assert.equal(f.m.drawWall({save(){},restore(){},fillRect(){}},0),false);
 }
});
test('the family must physically share the cottage, without competing actions',()=>{
 const far=fixture({childPos:{x:950,y:900}});assert.equal(far.m.ready(),false);
 const noCottage=fixture({scene:'town'});assert.equal(noCottage.m.ready(),false);
 const busy=fixture({busy:true});assert.equal(busy.m.ready(),false);
 const moving=fixture({moving:true});assert.equal(moving.m.ready(),false);
});
test('opening the real family conversation never grants a phantom memory or money',()=>{
 const f=fixture(),before=plain(f.state);
 assert.equal(f.m.request(),true);assert.match(f.modal.html,/earlier day physically spent with Wren/);
 assert.deepEqual(plain(f.state),before);assert.equal(f.saves,0);
 assert.equal(f.m.handle('phe299-choose',''),false);assert.equal(f.saves,0);
 assert.equal(f.m.handle('phe299-choose','2'),false);assert.equal(f.saves,0);
 assert.equal(f.m.handle('phe299-choose','0'),true);
});
test('a real response creates one saved memory and its original distinct wall portrait',()=>{
 const f=fixture();f.story('1');
 assert.equal(f.saves,1);assert.equal(f.updates,1);
 assert.deepEqual(plain(f.m.records()),[{day:8,kind:'story',choice:1,homeKind:'read',peer:peers[0]}]);
 assert.equal(f.state.coins,100);assert.equal(f.state.relations.bea,31);
 assert.equal(f.child.needs.joy,50);
 assert.match(f.m.latestLine(),/cottage lantern/);
 assert.equal(f.m.ready(),false);
 const pixels=[],g={save(){},restore(){},fillStyle:'',
  fillRect(...v){pixels.push([this.fillStyle,...v])}};
 assert.equal(f.m.drawWall(g,0),true);
 assert.ok(pixels.length>=9);
 assert.ok(pixels.some(v=>v[0]==='#ebc189'));
});
test('three separate completed cottage tasks bring three different lived stories home',()=>{
 const f=fixture();f.story('0');
 f.setDay(9);f.setHomeKind('hobby');f.story('1');
 f.setDay(10);f.setHomeKind('tidy');f.story('0');
 assert.deepEqual(plain(f.m.records()).map(x=>x.kind),['story','color','nature']);
 assert.equal(f.saves,3);assert.equal(f.updates,3);
 assert.match(f.m.panel(),/3 \/ 3/);
 const colors=[],g={save(){},restore(){},fillStyle:'',
  fillRect(...v){colors.push(this.fillStyle)}};
 assert.equal(f.m.drawWall(g,1),true);
 assert.ok(colors.includes('#91b5c9'));assert.ok(colors.includes('#d4a4b9'));
 assert.ok(colors.includes('#a5c68b'));
 f.setDay(11);f.setHomeKind('read');assert.equal(f.m.ready(),false);
});
test('a separate later day, not just another home button tap, is necessary',()=>{
 const f=fixture();f.story('0');
 assert.equal(f.m.request(),false);
 f.setDay(9);f.setHomeKind('read');
 assert.equal(f.m.ready(),false,'same story cannot be claimed twice');
});
test('canceled, interrupted or stale dialog gives no reward',()=>{
 const a=fixture();a.m.request();assert.equal(a.m.cancel(),true);assert.equal(a.saves,0);
 const b=fixture();b.m.request();b.setScene('town');
 assert.equal(b.m.choose(0),false);assert.equal(b.saves,0);
 const c=fixture();c.m.request();c.setDay(9);
 assert.equal(c.m.choose(1),false);assert.equal(c.saves,0);
 const d=fixture();d.m.request();d.setChild(1100,1120);
 assert.equal(d.m.choose(1),false);assert.equal(d.saves,0);
});
test('closing a modal invalidates an uncompleted family conversation',()=>{
 const f=fixture();f.m.request();f.closeDialog();f.m.advance();
 assert.equal(f.m.prompt,null);assert.equal(f.m.choose(0),false);assert.equal(f.saves,0);
});
test('save sanitizer rejects invalid ages, fake kinds, mismatched receipts and repeats',()=>{
 const good={day:8,kind:'story',choice:0,homeKind:'read',peer:peers[0]};
 const invalid=[
  {...good,day:0},{...good,day:9,peer:{...peers[0],day:9}},
  {...good,homeKind:'hobby'},{...good,kind:'romance'},
  {...good,choice:-1},{...good,peer:{...peers[0],kind:'nature'}}];
 for(const bad of invalid)assert.equal(M.clean({records:[bad]},1).records.length,0);
 assert.equal(M.clean({records:[good]},9).records.length,0);
 assert.equal(M.clean({records:[good,{...good,day:9},{...good,kind:'color',day:9,peer:peers[1],homeKind:'hobby'}]},1).records.length,2);
});
test('historic earned portraits survive peer and homeHelp journal rollover',()=>{
 const f=fixture();f.story('0');const saved=plain(f.child.homeEchoes);
 f.setDay(120);f.child.homeHelps=[];f.state.youngResidents.wren.friendships=[];
 const rows=plain(M.clean(saved,1).records);
 assert.equal(rows.length,1);assert.equal(rows[0].peer.day,2);
 assert.equal(f.m.drawWall({save(){},restore(){},fillRect(){}},3),true);
});
test('family daybook, real sprite and Canvas wall are actually wired into the iPhone game',()=>{
 const sprout=read('little-sprouts-v272.js'),game=read('game.js'),index=read('index.html'),sw=read('sw.js');
 assert.match(sprout,/familyBond\.panel\(\)\+homeEchoes\.panel\(\)\+initiatives\.panel\(\)/);
 assert.match(sprout,/homeEchoes\.drawHint\(g,pos,tick\)/);
 assert.match(game,/littleSprouts\.homeEchoes\.drawWall\(ctx,tick\)/);
 assert.match(game,/action\.startsWith\('phe299-'\)/);
 assert.ok(index.includes('pip-home-echoes-v299.js?v=2.9.9'));
 assert.ok(index.indexOf('pip-home-echoes-v299.js')<index.indexOf('little-sprouts-v272.js'));
 assert.ok(index.includes('little-sprouts-v272.js?v=3.0'));
 assert.ok(index.includes('game.js?v=3.0'));
 assert.match(sw,/hearth-harbor-v300-chosen-generations/);
 assert.ok(sw.includes("'./pip-home-echoes-v299.js'"));
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
});
test('Connections Atlas records real home family stories without inventing a new Wren household',()=>{
 const atlas=read('family-atlas-v271.js');
 assert.match(atlas,/child-home-friendship-echo/);
 assert.match(atlas,/root\.HearthPipHomeEchoes\.clean\(bondChild\.homeEchoes,bondChild\.guardianDay\)/);
 assert.match(atlas,/ids:\['player','pip'\]/);
 assert.match(atlas,/id==='wren'\?null/);
});
test('no new timers, network, secondary storage, currency or auto rewards',()=>{
 const src=read('pip-home-echoes-v299.js');
 assert.doesNotMatch(src,/fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|setInterval|setTimeout/);
 assert.doesNotMatch(src,/coins\s*\+|needs\.joy\s*\+|relations.*\+/);
});
