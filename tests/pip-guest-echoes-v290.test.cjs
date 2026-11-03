/* Hearth & Harbor v2.9.0 — a real visitor leaves a real mark on family life */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),
 fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const env={window:{}};
for(const f of ['pip-home-visits-v289.js','pip-home-rhythms-v288.js','pip-guest-echoes-v290.js'])
 vm.runInNewContext(read(f),env,{filename:f});
const V=env.window.HearthPipHomeVisits,R=env.window.HearthPipHomeRhythms,E=env.window.HearthPipGuestEchoes;
const plain=x=>JSON.parse(JSON.stringify(x));
const ids=Object.keys(E.FRAMES);
const story=(id='jun',day=10,open=1,close=0)=>({id,day,kind:V.VISITS[id].kind,open,close});
function fixture({id='jun',day=12,minute=830,scene='home',
 guardian=true,known=true,memories=[story()],helper=[],homeRhythms=null}={}){
 const child={guardian:guardian?'player':null,guardianDay:3,
  meetings:known?ids.map(x=>({id:x,day:5})):[],
  helperProjects:[],mentor:{counts:Object.fromEntries(ids.map(i=>[i,1]))},
  homeVisits:{pending:null,memories:plain(memories)},
  homeHelps:plain(helper),homeRhythms};
 const state={day,minute,youngResidents:{pip:child},coins:500,relations:{jun:25}};
 let where=scene,player={x:450,y:280},session=null,
  adult={x:420,y:405},pip={x:390,y:425},
  hold=null,blocked=false,competing=false,dialogue=null,save=0,notifications=[];
 const api={getState:()=>state,getChild:()=>child,getScene:()=>where,
  getPlayer:()=>({...player}),getVisitSession:()=>session,
  getGuestPose:()=>({...adult}),getChildPose:()=>({...pip}),
  getHold:()=>hold,getWorkPoint:kind=>V.ROOMS[kind],
  isWalkable:()=>!blocked,nearestWalkable:p=>!blocked?{...p}:null,
  hasCompetingEvent:()=>competing,name:id=>id.toUpperCase(),
  showModal:(name,html)=>dialogue={name,html},closeModal:()=>dialogue=null};
 const e=E.setup(api);
 return {e,api,child,state,get dialogue(){return dialogue},get save(){return save},
  setScene:s=>where=s,setMinute:m=>state.minute=m,setDay:d=>state.day=d,
  setPlayer:(x,y)=>player={x,y},setHold:h=>hold=h,
  setSession:s=>session=s,setAdult:(x,y)=>adult={x,y},setPip:(x,y)=>pip={x,y},
  setBlocked:x=>blocked=x,setCompeting:x=>competing=x};
}
function drawer(){
 const calls=[],g={fillStyle:null,save(){},restore(){},fillRect(...a){calls.push({color:this.fillStyle,rect:a})}};
 return {g,calls};
}
test('six unique handwritten adult memory card sites are clear of one another',()=>{
 assert.equal(ids.length,6);
 assert.equal(new Set(ids.map(id=>E.FRAMES[id].x+':'+E.FRAMES[id].y)).size,6);
 assert.equal(new Set(ids.map(id=>E.FRAMES[id].motif)).size,6);
 for(const id of ids)assert.ok(V.VISITS[id].kind);
});
test('a new or old save with no genuine visit has no fake gallery, town story or rewards',()=>{
 const f=fixture({memories:[]});
 assert.equal(f.e.cards().length,0);assert.equal(f.e.drawGallery(drawer().g),false);
 assert.equal(f.e.townDialogue('jun'),null);assert.equal(f.e.hit(675,163),null);
 assert.equal(f.state.coins,500);
});
test('guest history without guardian or actual earlier meetings cannot forge real family art',()=>{
 for(const o of [{guardian:false},{known:false},{day:9}]){
  const f=fixture(o);assert.equal(f.e.works().length,0);assert.equal(f.e.cards().length,0);
 }
});
test('an authentic recorded visit produces precisely one saved-condition gallery piece',()=>{
 const f=fixture();const cards=f.e.cards();
 assert.equal(cards.length,1);assert.equal(cards[0].id,'jun');
 assert.equal(cards[0].day,10);assert.equal(cards[0].open,1);
 assert.equal(cards[0].close,0);
 assert.equal(f.e.panel().includes('1 / 6'),true);
 assert.equal(f.state.coins,500);
});
test('six distinct completed visits produce six actually different pixel illustrations',()=>{
 const all=ids.map((id,i)=>story(id,10,i%2,(i+1)%2));
 const f=fixture({memories:all});
 assert.equal(f.e.cards().length,6);
 const {g,calls}=drawer();assert.equal(f.e.drawGallery(g,2.3),true);
 assert.ok(calls.length>=65,'six original multi-layer world illustrations');
});
test('the two original opening and reflection choices change the painted frame in the world',()=>{
 const a=fixture({memories:[story('jun',10,0,0)]});
 const b=fixture({memories:[story('jun',10,1,1)]});
 const first=drawer(),second=drawer();a.e.drawGallery(first.g);b.e.drawGallery(second.g);
 assert.notDeepEqual(first.calls,second.calls);
});
test('gallery stays in the real cottage and is not a floating menu reward',()=>{
 const f=fixture();assert.ok(f.e.hit(E.FRAMES.jun.x,E.FRAMES.jun.y));
 f.setScene('town');
 assert.equal(f.e.cards().length,0);assert.equal(f.e.hit(E.FRAMES.jun.x,E.FRAMES.jun.y),null);
 assert.equal(f.e.drawGallery(drawer().g),false);
});
test('world hit-testing selects the correct individual postcard',()=>{
 const f=fixture({memories:ids.map(id=>story(id))});
 for(const id of ids){const p=E.FRAMES[id];assert.equal(f.e.hit(p.x,p.y).id,id)}
 assert.equal(f.e.hit(1200,1500),null);
});
test('look at a saved postcard only after walking near the actual wall',()=>{
 const f=fixture(),p=E.FRAMES.jun;
 f.setPlayer(1100,970);assert.equal(f.e.inspect('jun'),false);
 const target=f.e.approach('jun');assert.ok(target);
 f.setPlayer(target.x,target.y);
 assert.equal(f.e.inspect('jun'),true);
 assert.match(f.dialogue.html,/THE COTTAGE MEMORY WALL/);
 assert.match(f.dialogue.html,/Day 10/);
 assert.ok(f.dialogue.html.includes(V.VISITS.jun.open[1]));
 assert.ok(f.dialogue.html.includes(V.VISITS.jun.close[0]));
 assert.equal(f.state.coins,500);
});
test('reinspection is read-only: no new coins, friendships, needs or family entries',()=>{
 const f=fixture(),pos=f.e.approach('jun');f.setPlayer(pos.x,pos.y);
 const old=plain(f.child);
 for(let i=0;i<3;i++){assert.equal(f.e.inspect('jun'),true);assert.equal(f.e.handle('pe290-back'),true)}
 assert.deepEqual(plain(f.child),old);assert.equal(f.state.coins,500);
 assert.equal(f.e.handle('pe290-forge'),false);
});
test('blocked world access prevents tapping a wall frame remotely',()=>{
 const f=fixture();f.setBlocked(true);
 assert.equal(f.e.approach('jun'),null);assert.equal(f.e.inspect('jun'),false);
});
test('the first three afternoons after a REAL visit carry adult follow-through',()=>{
 const f=fixture({scene:'town',day:11,minute:810});
 const base={h:3,where:[1200,1400],icon:'✿'};
 const entry=f.e.schedule('jun',base);
 assert.equal(entry.guestEcho,true);
 assert.equal(entry.icon,'🌷');
 assert.equal(entry.where[0],E.STOPS.jun.x);
 assert.equal(entry.where[1],E.STOPS.jun.y);
 assert.equal(f.state.coins,500);
 f.setDay(14);assert.equal(f.e.schedule('jun',base),base);
});
test('existing weddings, romance, illness care, neighbors and pending invitations take priority',()=>{
 const f=fixture({scene:'town',day:11});
 for(const h of ['date-garden','wedding-1','promise-v','home-h0','rest-care','eat-care',
  'social-care','evening-pair','visit-1','pip-home-visit-10-jun']){
  const base={h,where:[1,2]};assert.equal(f.e.schedule('jun',base),base);
 }
 const prev={h:'other',where:[1,2],childReply:true};
 assert.equal(f.e.schedule('jun',prev),prev);
 const invitation={h:'guest',where:[1,2],childHomeGuest:true};
 assert.equal(f.e.schedule('jun',invitation),invitation);
 f.setCompeting(true);const skip={h:'regular',where:[1,2]};
 assert.equal(f.e.schedule('jun',skip),skip);
});
test('follow-through uses existing NPC movement, never directly changes a person position',()=>{
 const f=fixture({scene:'town',day:11}),resident={x:402,y:901};
 const copy=plain(resident);
 const entry=f.e.schedule('jun',{h:'regular',where:[1000,900]});
 assert.equal(entry.guestEcho,true);assert.deepEqual(resident,copy);
});
test('an inaccessible town destination suppresses the return visit instead of cheating',()=>{
 const f=fixture({scene:'town',day:11});
 f.setBlocked(true);const base={h:'regular',where:[1000,900]};
 assert.equal(f.e.schedule('jun',base),base);
});
test('later ordinary dialogue remembers BOTH genuine story decisions',()=>{
 const f=fixture({scene:'town',day:12});
 const msg=f.e.townDialogue('jun');
 assert.ok(msg.includes(E.THOUGHTS.jun[0]));
 assert.ok(msg.includes(V.VISITS.jun.open[1]));
});
test('endings actually change the resident response while keeping normal lines sometimes',()=>{
 const first=fixture({scene:'town',day:12,memories:[story('jun',10,0,0)]});
 const second=fixture({scene:'town',day:12,memories:[story('jun',10,0,1)]});
 assert.notEqual(first.e.townDialogue('jun'),second.e.townDialogue('jun'));
 second.setDay(15);assert.equal(second.e.townDialogue('jun'),null);
 second.setDay(14);assert.ok(second.e.townDialogue('jun'));
});
test('the real adult shows a small hand prop only while physically at their return location',()=>{
 const f=fixture({scene:'town',day:12});
 const d=drawer();
 assert.equal(f.e.townGesture(d.g,'jun',{x:E.STOPS.jun.x,y:E.STOPS.jun.y},1),true);
 assert.ok(d.calls.length>=4);
 assert.equal(f.e.townGesture(d.g,'jun',{x:1400,y:1300},1),false);
 f.setScene('home');assert.equal(f.e.townGesture(d.g,'jun',E.STOPS.jun,1),false);
});
test('no fake crafting poses before the original 3.8-second household hold begins',()=>{
 const f=fixture({scene:'home',day:12});
 f.setSession({id:'jun',kind:'read',day:12,phase:'working'});
 assert.equal(f.e.roleWork(),null);
 assert.equal(f.e.drawWorking(drawer().g,'adult',2),false);
 assert.equal(f.e.drawWorking(drawer().g,'pip',2),false);
});
test('real completed choice stage alone is not a working animation',()=>{
 const f=fixture();f.setSession({id:'jun',kind:'read',day:12,phase:'reflect'});
 f.setHold({kind:'read',duration:3.8,remaining:1.4});
 assert.equal(f.e.roleWork(),null);
});
test('guest and Pip both use their real positions during the SAME live household work',()=>{
 const f=fixture(),r=V.ROOMS.read;
 f.setAdult(r.x+12,r.y-3);f.setPip(r.x-20,r.y+15);
 f.setSession({id:'jun',kind:'read',day:12,phase:'working'});
 f.setHold({kind:'read',duration:3.8,remaining:2});
 const w=f.e.roleWork();
 assert.equal(w.s.kind,'read');
 const a=drawer(),b=drawer();
 assert.equal(f.e.drawWorking(a.g,'adult',1),true);
 assert.equal(f.e.drawWorking(b.g,'pip',1),true);
 assert.ok(a.calls.length>6);assert.ok(b.calls.length>6);
 assert.notDeepEqual(a.calls[0].rect,b.calls[0].rect);
 assert.equal(f.state.coins,500);
});
test('the animated object reflects the actual home action, not unrelated icon sparks',()=>{
 const f=fixture(),r=V.ROOMS.read;
 f.setAdult(r.x,r.y);f.setPip(r.x-30,r.y+16);
 f.setSession({id:'jun',kind:'read',day:12,phase:'working'});
 f.setHold({kind:'meal',duration:3.8,remaining:2});
 assert.equal(f.e.roleWork(),null);
 f.setHold({kind:'read',duration:3.8,remaining:0});
 assert.equal(f.e.roleWork(),null);
});
test('real earned childhood interests personalize the visitor speech and painted work',()=>{
 const base=fixture();
 assert.equal(base.e.personalityLine('jun'),'');
 const help=[{day:6,kind:'read'},{day:7,kind:'read'}];
 const grown=fixture({helper:help});
 assert.equal(grown.e.favorite(),'read');
 assert.ok(grown.e.personalityLine('jun').includes('genuinely grown fond'));
 const r=V.ROOMS.read;grown.setAdult(r.x,r.y);grown.setPip(r.x-30,r.y);
 grown.setSession({id:'jun',kind:'read',day:12,phase:'working'});
 grown.setHold({kind:'read',duration:3.8,remaining:2});
 assert.equal(grown.e.roleWork().matched,true);
 const mismatch=fixture({helper:help,id:'rosie'});
 assert.ok(mismatch.e.personalityLine('rosie').includes('been practicing'));
});
test('the module supports all three actual home furniture tasks and every existing adult',()=>{
 for(const id of ids){
  const r=V.VISITS[id],f=fixture({id,memories:[story(id)]});
  f.setAdult(V.ROOMS[r.kind].x+10,V.ROOMS[r.kind].y);
  f.setPip(V.ROOMS[r.kind].x-30,V.ROOMS[r.kind].y+20);
  f.setSession({id,kind:r.kind,day:12,phase:'working'});
  f.setHold({kind:r.kind,duration:3.8,remaining:1.7});
  assert.ok(f.e.roleWork(),id+' '+r.kind);
  assert.equal(f.e.drawWorking(drawer().g,'adult',1),true,id);
  assert.ok(f.e.cards().find(x=>x.id===id),id);
 }
});
test('every touched production module and mobile asset is wired to a real feature',()=>{
 const html=read('index.html'),sw=read('sw.js'),game=read('game.js'),
  little=read('little-sprouts-v272.js'),visits=read('pip-home-visits-v289.js'),
  css=read('pip-guest-echoes-v290.css');
 assert.ok(html.includes('pip-guest-echoes-v290.js?v=2.9.0'));
 assert.ok(html.includes('pip-guest-echoes-v290.css?v=2.9.0'));
 assert.ok(html.indexOf('pip-home-visits-v289.js')<html.indexOf('pip-guest-echoes-v290.js'));
 assert.ok(html.indexOf('pip-guest-echoes-v290.js')<html.indexOf('little-sprouts-v272.js'));
 for(const asset of ['pip-guest-echoes-v290.js','pip-guest-echoes-v290.css'])
  assert.ok(sw.includes("'./"+asset+"'"));
 assert.match(sw,/hearth-harbor-v293-pip-comes-to-you/);
 assert.match(game,/littleSprouts\.guestEcho\.schedule\(n\.id,visitEntry\)/);
 assert.match(game,/littleSprouts\.guestEcho\.townGesture/);
 assert.match(game,/littleSprouts\.guestEcho\.townDialogue/);
 assert.match(game,/littleSprouts\.guestEcho\.drawGallery/);
 assert.match(game,/littleSprouts\.guestEcho\.drawWorking\(ctx,'adult',tick\)/);
 assert.match(game,/littleSprouts\.guestEcho\.hit\(wx,wy\)/);
 assert.match(game,/littleSprouts\.guestEcho\.inspect/);
 assert.match(little,/guestEcho\.drawWorking\(g,'pip',tick\)/);
 assert.match(little,/getGallerySummary:\(\)=>guestEcho\.panel\(\)/);
 assert.match(visits,/getGuestPersonalityLine/);
 assert.match(game,/const SAVE='hearth-harbor-save-v1'/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/@media\(max-width:380px\)/);
});
test('the feature does not add storage, network, recurring timers or fake currency',()=>{
 const code=read('pip-guest-echoes-v290.js');
 assert.doesNotMatch(code,/fetch\(|XMLHttpRequest|WebSocket|localStorage|setInterval|setTimeout|new Image\(/);
 const f=fixture();const before=plain(f.child);
 for(let i=0;i<10;i++){f.e.cards();f.e.drawGallery(drawer().g,i)}
 assert.deepEqual(plain(f.child),before);
 assert.equal(f.state.coins,500);
});
