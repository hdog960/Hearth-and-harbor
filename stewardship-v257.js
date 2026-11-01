/* Hearth & Harbor v2.5.7 — The Village We Grow
   Original town-stewardship gameplay and lightweight seasonal street art.
   Pure module; saves stay in the existing hearth-harbor-save-v1 record. */
(function(root){'use strict';
const PROJECTS=[
 {id:'flowers',name:'Blossom Promenade',icon:'🌼',host:'mabel',cost:[30,45],x:640,y:865,walkX:637,walkY:930,
  intro:'Mabel dreams of a flower-lined walkway where everyone can stop and smell the blossoms.',
  stage:['Stone-bordered planting beds','Flowering arch and blooming borders'],benefit:'A peaceful garden walk once each day: +8 Fun and +3 Social'},
 {id:'lanterns',name:'Lantern Plaza',icon:'🏮',host:'bea',cost:[40,55],x:602,y:660,walkX:612,walkY:766,
  intro:'Bea wants to string handmade lanterns across the town square, not just during festivals.',
  stage:['Wooden posts and the first lanterns','A complete warm-lit plaza canopy'],benefit:'Pause beneath the lights once a day: +8 Fun and +8 Social'},
 {id:'deck',name:'Lily Pond Deck',icon:'🐟',host:'finn',cost:[50,70],x:1054,y:1270,walkX:1125,walkY:1330,
  intro:'Finn has drawn plans for a little waterside deck where friends can watch the fish.',
  stage:['A sturdy boardwalk platform','Reed planters, railings and a cozy lookout'],benefit:'Take a waterside rest once a day: +7 Energy and +6 Fun'},
 {id:'cart',name:"Rosie's Orchard Cart",icon:'🍎',host:'rosie',cost:[35,50],x:443,y:824,walkX:510,walkY:893,
  intro:"Rosie and Oliver want a cheerful little market cart stocked with the village's seasonal produce.",
  stage:['A little wooden pushcart','Colorful striped awning and seasonal baskets'],benefit:'Collect one complimentary seasonal pantry parcel per day'}
];
const HOST={mabel:'Mabel',bea:'Bea',finn:'Finn',rosie:'Rosie'};
const COLORS=[
 {fabric:'#d681ab',light:'#ffd5c3',bunting:'#f1cf83',produce:'#f3a8bc'},
 {fabric:'#79a8b6',light:'#ffe4aa',bunting:'#e2b77a',produce:'#e7b96b'},
 {fabric:'#c78958',light:'#ffdf9e',bunting:'#dba26e',produce:'#e4a16b'},
 {fabric:'#a2b5d9',light:'#ebefff',bunting:'#b9b3e3',produce:'#d2d9e8'}
];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function clean(raw){
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},phases={},visits={};
 for(const project of PROJECTS){
  const x=o.phases?.[project.id],v=o.visits?.[project.id];
  phases[project.id]=Number.isInteger(x)?clamp(x,0,2):0;
  visits[project.id]=Number.isInteger(v)?clamp(v,0,9999):0;
 }
 return {phases,visits};
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal}=api;
 const state=()=>getState();
 const record=()=>{const s=state();if(!s.stewardship||typeof s.stewardship!=='object'||Array.isArray(s.stewardship))s.stewardship=clean(s.stewardship);return s.stewardship;};
 const projectById=id=>PROJECTS.find(p=>p.id===id);
 const level=id=>record().phases[id]||0;
 const finished=id=>level(id)===2;
 function board(){
  const s=state(),r=record(),done=PROJECTS.filter(p=>r.phases[p.id]===2).length;
  const html=PROJECTS.map(p=>{
   const n=r.phases[p.id],cost=p.cost[n];
   const status=n===2?'✓ Completed · Part of the village forever':n===1?'Building stage 2 / 2':'Building stage 1 / 2';
   return '<section class="hs-project"><div class="hs-project-head"><span class="hs-icon">'+p.icon+'</span><div><h3>'+p.name+'</h3><small>With '+HOST[p.host]+' · '+status+'</small></div></div><p>'+p.intro+'</p><div class="hs-steps">'+p.stage.map((v,i)=>'<span class="'+(i<n?'built':i===n?'current':'')+'">'+(i<n?'✓ ':'◇ ')+v+'</span>').join('')+'</div><p class="hs-effect">'+p.benefit+'</p><div class="hs-actions">'+(n<2?'<button class="hs-primary" data-act="stew-build" data-id="'+p.id+'" '+(s.coins<cost?'disabled':'')+'>Contribute '+cost+' coins</button>':'<button class="hs-primary" data-act="stew-travel" data-id="'+p.id+'">Visit the finished place</button>')+'<span>'+(n<2?'🪙 '+Math.floor(s.coins)+' available':(r.visits[p.id]===s.day?'✓ Enjoyed today':'A daily stop awaits'))+'</span></div></section>';
  }).join('');
  showModal('steward-board','<div class="hs-ui"><div class="hs-kicker">MAPLEWOOD TOWN HALL · COMMUNITY PROJECTS</div><h2>🌿 The Village We Grow</h2><p>This is our shared home. Help neighbors build places you can actually visit and use. Every project changes the map, and your handiwork stays through all seasons.</p><div class="hs-status"><b>'+done+' of 4 projects completed</b><div class="hs-track"><i style="width:'+(done/4*100)+'%"></i></div><small>Build at your pace. No timers, upkeep costs or daily obligations.</small></div>'+html+'<p class="hs-foot">Projects improve the town for everyone. These are optional purchases with coins earned in the village, never real money.</p><button class="hs-secondary" data-act="stew-close">Back to Maplewood</button></div>');
 }
 function contribute(id){
  const p=projectById(id),s=state(),r=record();
  if(!p){notify('That project is not available.');return;}
  const step=r.phases[id];
  if(step>=2){notify('This project is already complete!');return board()}
  const cost=p.cost[step];
  if(!Number.isFinite(s.coins)||s.coins<cost){notify('Not enough coins yet. Try a café shift or another village activity.');return board()}
  s.coins=clamp(s.coins-cost,0,1000000);
  r.phases[id]=step+1;
  if(step+1===2){
   s.needs.fun=clamp(s.needs.fun+10,0,100);
   notify('✨ '+HOST[p.host]+' helped finish '+p.name+'! You can now enjoy it in town.');
  }else notify('🛠️ The first stage of '+p.name+' has taken shape!');
  save();updateUI();board();
 }
 function use(id){
  const p=projectById(id);
  if(!p||!finished(id)){notify('Visit the project board to help finish this place first.');return board();}
  const s=state(),r=record();
  if(r.visits[id]===s.day){notify('You have already enjoyed this place today. Come again tomorrow!');return board();}
  let message='';
  if(id==='flowers'){
   s.needs.fun=clamp(s.needs.fun+8,0,100);
   s.needs.social=clamp(s.needs.social+3,0,100);
   message='A slow walk among the blossoms clears your thoughts. 🌼';
  }else if(id==='lanterns'){
   s.needs.fun=clamp(s.needs.fun+8,0,100);
   s.needs.social=clamp(s.needs.social+8,0,100);
   message='You rest under the lanterns and listen to the village chatter. 🏮';
  }else if(id==='deck'){
   s.needs.energy=clamp(s.needs.energy+7,0,100);
   s.needs.fun=clamp(s.needs.fun+6,0,100);
   message='The gentle pond breeze leaves you feeling refreshed. 🐟';
  }else if(id==='cart'){
   const pantry=s.cooking?.pantry||null;
   const seasonal=['berry','apple','carrot','herb'][clamp(s.season,0,3)];
   const before=pantry&&Number.isInteger(pantry[seasonal])?clamp(pantry[seasonal],0,99):0;
   const gained=pantry?Math.min(2,99-before):0;
   if(gained>0)pantry[seasonal]=before+gained;
   s.needs.hunger=clamp(s.needs.hunger+5,0,100);
   message=gained?('Rosie packs '+gained+' '+seasonal+' ingredient'+(gained===1?'':'s')+' for your kitchen. 🍎'):'Your pantry is full, so Rosie shares a delicious seasonal taste instead. 🍎';
  }
  r.visits[id]=s.day;save();updateUI();notify(message);board();
 }
 function travel(id){
  const p=projectById(id);
  if(!p||!finished(id))return board();
  closeModal();api.travelTo(p.walkX,p.walkY,()=>use(id));
 }
 function handle(action,id){
  if(action==='stew-board')return board();
  if(action==='stew-build')return contribute(id);
  if(action==='stew-use')return use(id);
  if(action==='stew-travel')return travel(id);
  if(action==='stew-close')return closeModal();
 }
 function hit(x,y){
  for(const p of PROJECTS){
   if(!finished(p.id))continue;
   // Hit boxes are centered on the completed display, not a fabricated invisible menu marker.
   if(Math.hypot((x-p.x)/1.1,(y-(p.y-51)))<58)return p;
  }
  return null;
 }
 function drawBoard(g,x,y){
  g.save();g.translate(x,y);
  const dark='#78604c',wood='#c99f72';
  g.fillStyle='#4b6655';g.fillRect(-45,1,90,8);
  g.fillStyle=dark;g.fillRect(-32,-86,9,91);g.fillRect(25,-86,9,91);
  g.fillStyle=wood;g.fillRect(-50,-122,100,68);g.fillStyle='#f9e6b8';g.fillRect(-45,-116,90,55);
  g.strokeStyle='#996e54';g.lineWidth=3;g.strokeRect(-44,-115,88,54);
  g.fillStyle='#7ebd8d';g.fillRect(-42,-112,84,7);
  g.fillStyle='#55765c';g.font='bold 12px system-ui';g.textAlign='center';g.fillText('VILLAGE',0,-87);
  g.font='bold 11px system-ui';g.fillText('PROJECTS',0,-71);
  for(const [xx,yy,col] of [[-40,-48,'#e1a1ba'],[-20,-51,'#edce78'],[35,-44,'#91c6a5']]){g.fillStyle=col;g.fillRect(xx,yy,6,6);}
  g.restore();
 }
 function bloom(g,x,y,color,s=1){
  g.save();g.translate(x,y);g.scale(s,s);
  g.fillStyle='#497d4f';g.fillRect(-2,-22,4,23);
  g.fillStyle='#7cb76e';g.fillRect(-7,-12,6,5);g.fillRect(1,-16,7,4);
  g.fillStyle=color;
  for(let k=0;k<5;k++){const a=k*Math.PI*2/5;g.beginPath();g.ellipse(Math.cos(a)*8,-25+Math.sin(a)*8,6,5,0,0,Math.PI*2);g.fill();}
  g.fillStyle='#ffe5a4';g.beginPath();g.arc(0,-25,5,0,Math.PI*2);g.fill();g.restore();
 }
 function drawProjects(g,{season=0,tick=0}={}){
  const stages=(state().stewardship||{}).phases||{};
  const p=COLORS[clamp(season,0,3)];
  const grade=id=>stages[id]||0;
  // Blossom path borders and a fully upgraded floral arch.
  if(grade('flowers')){
   g.fillStyle='#ddc3a0';g.fillRect(543,841,191,11);g.fillRect(543,920,191,10);
   for(let j=0;j<(grade('flowers')===2?9:5);j++){
    const xx=550+j*21.5,yy=(j%2===0?837:931),color=['#f4aac2','#f5d283','#a4cce6'][j%3];
    bloom(g,xx,yy,color,.72);
   }
   if(grade('flowers')===2){
    g.save();g.strokeStyle='#9d775c';g.lineWidth=12;g.beginPath();g.arc(638,859,67,Math.PI,Math.PI*2);g.stroke();
    g.strokeStyle='#47784f';g.lineWidth=7;g.beginPath();g.arc(638,859,67,Math.PI,Math.PI*2);g.stroke();g.restore();
    for(let i=0;i<6;i++){const a=Math.PI+(i+.35)*Math.PI/6;bloom(g,638+Math.cos(a)*67,859+Math.sin(a)*67,'#f1b0d3',.72);}
   }
  }
  // Permanent warm-lit town square, not an inaccessible building.
  if(grade('lanterns')){
   for(const [x,y] of [[480,625],[726,626]]){g.fillStyle='#856b55';g.fillRect(x-5,y-122,10,132);g.fillStyle='#d9ae77';g.fillRect(x-8,y-129,16,9);}
   g.strokeStyle='#d0b08c';g.lineWidth=4;g.beginPath();g.moveTo(480,506);g.quadraticCurveTo(603,533,726,506);g.stroke();
   const count=grade('lanterns')===2?9:4;
   for(let i=0;i<count;i++){
    const x=503+i*(200/(count-1)),y=507+Math.sin((x-503)/200*Math.PI)*13+Math.sin(tick*1.1+i)*2;
    g.fillStyle= i%2?p.light:p.fabric;
    g.fillRect(x-9,y-2,18,24);g.fillStyle='#fff0c8';g.fillRect(x-4,y+3,8,11);
    if(grade('lanterns')===2){g.fillStyle='rgba(255,223,163,.10)';g.beginPath();g.arc(x,y+11,22,0,Math.PI*2);g.fill();}
   }
  }
  // An eastern pond deck with posts, lookout planters, and water reflection.
  if(grade('deck')){
   g.save();g.translate(1054,1270);
   g.fillStyle='#6a715c';g.fillRect(-86,-4,160,48);
   g.fillStyle='#cba77a';g.fillRect(-89,-13,160,48);
   for(let i=0;i<8;i++){g.fillStyle=i%2?'#e0be8f':'#b88e66';g.fillRect(-88+i*20,-11,18,44);}
   if(grade('deck')===2){
    g.fillStyle='#8b6e51';for(const x of [-82,62]){g.fillRect(x,-50,8,47);g.fillRect(x,32,8,26);}
    g.strokeStyle='#937554';g.lineWidth=7;g.beginPath();g.moveTo(-78,-41);g.lineTo(65,-41);g.stroke();
    bloom(g,-63,31,p.produce,.72);bloom(g,51,31,p.light,.64);
   }
   g.restore();
  }
  // A real cart with visible season-specific produce, not another invisible button.
  if(grade('cart')){
   g.save();g.translate(443,824);
   g.fillStyle='#75543f';g.fillRect(-51,-40,103,42);g.fillStyle='#d09b65';g.fillRect(-46,-43,94,31);
   g.fillStyle='#674d40';for(const x of [-31,33]){g.beginPath();g.arc(x,10,12,0,Math.PI*2);g.fill();g.fillStyle='#d9c097';g.beginPath();g.arc(x,10,6,0,Math.PI*2);g.fill();}
   if(grade('cart')===2){
    g.fillStyle='#936f54';g.fillRect(-43,-100,6,66);g.fillRect(35,-100,6,66);
    for(let i=0;i<6;i++){g.fillStyle=i%2?p.fabric:'#fff2dc';g.fillRect(-56+i*19,-105,19,23);}
    g.fillStyle=p.fabric;g.fillRect(-56,-114,114,12);
   }
   for(let i=0;i<(grade('cart')===2?10:4);i++){g.fillStyle=i%2?p.produce:p.bunting;g.beginPath();g.arc(-34+i%5*17,-37-Math.floor(i/5)*12,8,0,Math.PI*2);g.fill();}
   g.restore();
  }
 }
 function festivalStalls(g,{season=0,day=1,tick=0}={}){
  const d=((day-1)%7)+1;if(d<3||d>5)return;
  const pal=COLORS[clamp(season,0,3)];
  const stalls=[{x:371,y:690,label:'CRAFTS',kind:0},{x:866,y:866,label:'TREATS',kind:1}];
  for(const a of stalls){
   g.save();g.translate(a.x,a.y);
   g.fillStyle='rgba(60,84,66,.2)';g.beginPath();g.ellipse(0,4,65,13,0,0,Math.PI*2);g.fill();
   g.fillStyle='#9e7555';g.fillRect(-54,-68,10,75);g.fillRect(45,-68,10,75);
   g.fillStyle='#76533f';g.fillRect(-62,-31,124,12);
   g.fillStyle='#d8ac7c';g.fillRect(-58,-46,116,25);
   g.fillStyle=pal.fabric;g.fillRect(-67,-91,134,20);
   for(let j=0;j<7;j++){g.fillStyle=j%2?pal.fabric:'#fff1db';g.beginPath();g.moveTo(-67+j*19,-71);g.lineTo(-67+(j+1)*19,-71);g.lineTo(-57+j*19,-52);g.fill();}
   g.fillStyle='#fff4d7';g.fillRect(-33,-106,66,24);g.fillStyle='#526d60';g.font='bold 12px system-ui';g.textAlign='center';g.fillText(a.label,0,-89);
   for(let j=0;j<6;j++){const x=-38+j*15;
    g.fillStyle=j%2?pal.bunting:pal.produce;
    if(a.kind===0) bloom(g,x,-38+Math.sin(tick+j)*2,pal.produce,.45);
    else {g.beginPath();g.arc(x,-37,7,0,Math.PI*2);g.fill();}
   }
   g.restore();
  }
  // Gentle ambient confetti drawn without allocating canvas textures or spawning NPCs.
  for(let i=0;i<12;i++){
   const x=450+((i*91+tick*8)%455),y=480+i%5*55+Math.sin(tick*.7+i)*6;
   g.fillStyle=(i%3===0?pal.fabric:i%3===1?pal.light:pal.bunting);
   g.fillRect(x,y,4,3);
  }
 }
 return {board,contribute,use,travel,handle,hit,drawBoard,drawProjects,festivalStalls,level,finished,PROJECTS};
}
root.HearthStewardship={clean,setup,PROJECTS};
})(window);
