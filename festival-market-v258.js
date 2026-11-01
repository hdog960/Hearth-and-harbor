/* Hearth & Harbor v2.5.8 — Maplewood Festival Market.
   The previously decorative stalls become two physical, seasonal destinations.
   Original craft play, cooked-dish sharing, and save-safe seasonal memories. */
(function(root){'use strict';
const STALLS=[
 {id:'crafts',name:'Handmade Crafts',host:'Bea',x:371,y:690,walkX:455,walkY:710},
 {id:'treats',name:'Festival Treats',host:'Oliver & Rosie',x:866,y:866,walkX:895,walkY:922}
];
const SEASONS=[
 {name:'Spring',craft:'Blossom Banner',treat:'Pink-berry blossom tea',flower:'🌸',colors:['#f3a5c8','#e9c66e','#80b5a1','#d9b0e9'],note:'Soft pink petals dance above the stalls.'},
 {name:'Summer',craft:'Sunshine Pennant',treat:'Golden honey lemonade',flower:'🌞',colors:['#efb75d','#8ebfd9','#e58d80','#9dbe78'],note:'The warm air smells of peaches and toasted sugar.'},
 {name:'Autumn',craft:'Harvest Patchwork',treat:'Spiced orchard cider',flower:'🍂',colors:['#c87550','#eab665','#8eaa72','#b88fa6'],note:'Bright leaves rustle against the awnings.'},
 {name:'Winter',craft:'Snowlight Quilt',treat:'Cinnamon cloud cocoa',flower:'❄️',colors:['#a8c7e8','#e2d5a2','#b7a9df','#e9b4ba'],note:'Warm steam curls into the frosty evening air.'}
];
const RECIPES={
 toast:'Cinnamon Toast',salad:'Orchard Fruit Salad',soup:'Garden Vegetable Soup',
 pancakes:'Berry Pancakes',eggs:'Sunny Morning Eggs',noodles:'Herb Garden Noodles',
 fishplate:'Harbor Grilled Fish',tart:'Honeybun Berry Tart',biscuits:'Honey Cloud Biscuits',
 jam:'Orchard Apple Jam',stew:'Cozy Cottage Stew',pie:'Homestyle Potato Pie'
};
const safeDay=d=>Number.isInteger(d)&&d>=1&&d<=9999?d:1;
const cycle=d=>Math.floor((safeDay(d)-1)/7);
const seasonDay=d=>(safeDay(d)-1)%7+1;
const isOpen=d=>seasonDay(d)>=3&&seasonDay(d)<=5;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const validKey=k=>{const m=/^([0-9]{1,4}):([0-3])$/.exec(k);return !!(m&&Number(m[1])<=1428&&Number(m[1])%4===Number(m[2]));};
function clean(raw){
 const src=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const crafts={},supper={},tastes={};
 if(src.crafts&&typeof src.crafts==='object'&&!Array.isArray(src.crafts)){
  for(const [key,v] of Object.entries(src.crafts).slice(-120)){
   if(!validKey(key)||!v||typeof v!=='object'||!Number.isInteger(v.stars)||v.stars<1||v.stars>3)continue;
   const colors=Array.isArray(v.colors)?v.colors.slice(0,12).map(n=>Number.isInteger(n)?clamp(n,-1,3):-1):[];
   crafts[key]={stars:v.stars,colors:colors.length===12?colors:Array(12).fill(-1)};
  }
 }
 if(src.supper&&typeof src.supper==='object'&&!Array.isArray(src.supper)){
  for(const [key,v] of Object.entries(src.supper).slice(-120)){
   if(!validKey(key)||!v||typeof v!=='object'||!Object.hasOwn(RECIPES,v.recipe)||!Number.isInteger(v.quality)||v.quality<1||v.quality>3)continue;
   supper[key]={recipe:v.recipe,quality:v.quality};
  }
 }
 if(src.tastes&&typeof src.tastes==='object'&&!Array.isArray(src.tastes))
  for(const [k,v] of Object.entries(src.tastes).slice(-100)){
   if(/^[1-9]\d{0,3}$/.test(k)&&v===1)tastes[k]=1;
  }
 return {crafts:Object.fromEntries(Object.entries(crafts).slice(-48)),supper:Object.fromEntries(Object.entries(supper).slice(-48)),tastes:Object.fromEntries(Object.entries(tastes).slice(-35))};
}
function setup(api){
 const {getState,save,notify,updateUI,showModal,closeModal}=api;
 let session=null;
 const state=()=>getState();
 const data=()=>{const s=state();if(!s.festivalMarket||typeof s.festivalMarket!=='object'||Array.isArray(s.festivalMarket))s.festivalMarket=clean(null);return s.festivalMarket;};
 const theme=()=>SEASONS[clamp(state().season|0,0,3)];
 const key=()=>cycle(state().day)+':'+clamp(state().season|0,0,3);
 const open=()=>isOpen(state().day);
 const completed=which=>Boolean(data()[which][key()]);
 const whereabouts=id=>STALLS.find(x=>x.id===id)||null;
 const hasStall=()=>open();
 const activeScene=()=>api.isTown?api.isTown():true;
 function overview(){
  session=null;
  const t=theme(),r=data(),ready=open(),done=[completed('crafts'),completed('supper')].filter(Boolean).length;
  showModal('market-overview','<div class="fm-ui"><div class="fm-eyebrow">MAPLEWOOD · SEASONAL STREET MARKET</div><h2>🎪 A little festival market</h2><p>'+t.note+' Two friendly stalls invite the village to share something handmade or homemade.</p><div class="fm-banner">'+t.flower+' '+t.name+' festival · '+(ready?'Open on this in-game day':'Opens on seasonal days 3–5')+'</div><div class="fm-marketcards"><article><span class="fm-emoji">🧵</span><b>Handmade Crafts</b><p>Decorate a '+t.craft.toLowerCase()+' with Bea and save it in your keepsake book.</p><button data-act="fmarket-travel" data-id="crafts" '+(!ready?'disabled':'')+'>Walk to Crafts</button>'+(completed('crafts')?'<small>✓ Your banner is in the scrapbook</small>':'<small>1 keepsake per season · 8 coins</small>')+'</article><article><span class="fm-emoji">🥧</span><b>Festival Treats</b><p>Share a dish cooked in your own Hearth Kitchen with Oliver and Rosie, or enjoy a seasonal treat.</p><button data-act="fmarket-travel" data-id="treats" '+(!ready?'disabled':'')+'>Walk to Treats</button>'+(completed('supper')?'<small>✓ Your shared supper is remembered</small>':'<small>Bring a prepared dish · no fee</small>')+'</article></div><div class="fm-progress">💌 Seasonal market memories · '+done+' / 2</div>'+scrapbookMarkup(r)+'<button class="fm-back" data-act="fmarket-close">Back to the village</button></div>');
 }
 function scrapbookMarkup(r){
  const rows=Object.keys({...r.crafts,...r.supper}).filter(validKey).sort((a,b)=>Number(b.split(':')[0])-Number(a.split(':')[0])).slice(0,12);
  return '<h3>Your market scrapbook</h3><div class="fm-archive">'+(rows.map(k=>{
   const [c,s]=k.split(':').map(Number),a=r.crafts[k],b=r.supper[k];
   return '<div><span>'+SEASONS[s].flower+'</span><section><b>'+SEASONS[s].name+' · Season '+(c+1)+'</b><small>'+(a?'🧵 '+SEASONS[s].craft+' '+('★'.repeat(a.stars)):'')+(a&&b?' · ':'')+(b?'🍽️ '+RECIPES[b.recipe]+' '+('★'.repeat(b.quality)):'')+'</small></section></div>';
  }).join('')||'<p>Your first festival keepsake is still waiting to be made.</p>')+'</div>';
 }
 function travel(id){
  const s=whereabouts(id);if(!s||!open()){notify('The stalls open on days 3–5 of each season.');return overview();}
  closeModal();
  api.travelTo(s.walkX,s.walkY,()=>visit(id));
 }
 function visit(id){
  const s=whereabouts(id);if(!s||!open()||!activeScene()){notify('The festival stalls are closed right now.');return overview();}
  if(id==='crafts')return crafts();
  return treats();
 }
 function crafts(){
  session=null;
  const t=theme(),done=completed('crafts');
  showModal('market-crafts','<div class="fm-ui"><div class="fm-eyebrow">BEA’S CRAFT TABLE · '+t.name.toUpperCase()+'</div><h2>🧵 '+t.craft+'</h2><p>“Each little color can tell a story. Which ones feel like yours today?” Bea spreads out her ribbons and cloth.</p><div class="fm-banner">'+(done?'💌 You already saved this seasonal keepsake.':'🪙 8 coins for fabric and thread · charged only when you finish.')+'</div><button class="fm-main" data-act="fmarket-start">🎨 Decorate together</button><button class="fm-back" data-act="fmarket-overview">Festival Market</button></div>');
 }
 function start(){
  if(!open())return overview();
  session={key:key(),kind:'craft',colors:Array(12).fill(-1),brush:0};
  renderCraft();
 }
 function renderCraft(){
  const s=session;if(!s||s.kind!=='craft')return;
  const t=theme(),painted=s.colors.filter(v=>v>=0),count=painted.length,unique=new Set(painted).size;
  const tiles=s.colors.map((v,i)=>'<button class="fm-tile" data-act="fmarket-tile" data-id="'+i+'" style="--tile:'+ (v<0?'#f9f2e3':t.colors[v])+'" aria-label="Patch '+(i+1)+(v>=0?', painted':' empty')+'">'+(v<0?'✧':t.flower)+'</button>').join('');
  showModal('market-craftgame','<div class="fm-ui"><div class="fm-eyebrow">HANDMADE WITH BEA</div><h2>'+t.craft+'</h2><p>Choose a ribbon color, then tap at least six patches in your banner. Three or four different colors make an especially lovely keepsake.</p><div class="fm-bannerart"><div class="fm-bannerloop">'+tiles+'</div><div class="fm-dangle">✦ · ✧ · ✦</div></div><div class="fm-palette">'+t.colors.map((color,i)=>'<button data-act="fmarket-brush" data-id="'+i+'" class="'+(s.brush===i?'selected':'')+'" style="--swatch:'+color+'" aria-label="Select ribbon color '+(i+1)+'"><span></span></button>').join('')+'</div><p class="fm-mini">Painted '+count+'/12 patches · '+unique+' colors used</p><div class="fm-buttons"><button data-act="fmarket-clear">Start over</button><button class="fm-main" data-act="fmarket-finish" '+(count<6||(!completed('crafts')&&state().coins<8)?'disabled':'')+'>'+(completed('crafts')?'Make an encore banner':'Finish keepsake · 8 coins')+'</button></div><button class="fm-back" data-act="fmarket-crafts">Back to Bea</button></div>');
 }
 function paint(i){if(!session||session.kind!=='craft'||session.key!==key())return;
  if(!Number.isInteger(i)||i<0||i>=12)return;
  session.colors[i]=session.brush;renderCraft();
 }
 function brush(i){if(!session||session.kind!=='craft'||!Number.isInteger(i)||i<0||i>3)return;
  session.brush=i;renderCraft();
 }
 function finish(){
  const s=session;if(!s||s.kind!=='craft'||s.key!==key()||!open())return;
  const p=s.colors.filter(x=>x>=0);if(p.length<6)return notify('Decorate at least six patches first!');
  const unique=new Set(p).size,stars=unique>=3?3:unique>=2?2:1;
  const st=state(),r=data(),first=!completed('crafts');
  if(first){
   if(st.coins<8)return notify('You need 8 coins for thread. Nothing was charged.');
   st.coins-=8;r.crafts[key()]={stars,colors:s.colors.slice()};
   st.needs.fun=clamp(st.needs.fun+11,0,100);
   st.needs.social=clamp(st.needs.social+7,0,100);
   const bonus=st.stewardship?.phases?.lanterns===2?1:0;
   st.relations.bea=clamp((st.relations.bea||0)+4+bonus,0,100);
   save();updateUI();
  }
  session=null;
  showModal('market-craftresult','<div class="fm-ui"><div class="fm-eyebrow">YOUR LITTLE MASTERPIECE</div><h2>'+tOr().flower+' '+tOr().craft+'</h2><p class="fm-stars">'+('★'.repeat(stars))+('☆'.repeat(3-stars))+'</p><p>Bea holds up your finished banner as the crowd admires your choice of colors.</p><div class="fm-banner">'+(first?'💌 A keepsake added to your scrapbook · +Fun, Social and friendship with Bea.':'A lovely encore! Your original rewards and keepsake were already saved.')+'</div><button class="fm-main" data-act="fmarket-overview">Open market scrapbook</button><button class="fm-back" data-act="fmarket-close">Back to Maplewood</button></div>');
 }
 const tOr=()=>theme();
 function treats(){
  session=null;
  const st=state(),t=theme(),daily=!!data().tastes[String(st.day)],donated=completed('supper');
  const shelf=(st.cooking?.dishes||[]).map((d,i)=>d&&Object.hasOwn(RECIPES,d.id)&&Number.isInteger(d.quality)&&d.quality>=1&&d.quality<=3?
   '<div class="fm-dish"><span>🍽️</span><section><b>'+RECIPES[d.id]+'</b><small>'+('★'.repeat(d.quality))+' · A homemade meal</small></section><button data-act="fmarket-donate" data-id="'+i+'" '+(donated?'disabled':'')+'>'+(donated?'Already shared':'Share')+'</button></div>':'').join('');
  showModal('market-treats','<div class="fm-ui"><div class="fm-eyebrow">OLIVER & ROSIE’S TREAT TABLE</div><h2>🥧 Good food, good company</h2><p>“A village tastes better when everyone brings something to the table.” Oliver smiles as Rosie sets out the little plates.</p><div class="fm-banner">'+t.flower+' '+t.treat+'</div><div class="fm-snack"><div><b>Enjoy a seasonal treat</b><small>8 coins · +22 Hunger, +10 Fun, +8 Social</small></div><button data-act="fmarket-taste" '+(daily||st.coins<8?'disabled':'')+'>'+(daily?'Enjoyed today':'Taste · 8 🪙')+'</button></div><h3>Bring something from Hearth Kitchen</h3><p>Share one home-cooked dish each festival season. It leaves your prepared-meal shelf and becomes a permanent supper memory.</p>'+(donated?'<div class="fm-banner">✓ You already contributed a dish to this season’s table. Thank you!</div>':shelf||'<p class="fm-empty">Your plate shelf is empty. Prepare one of the twelve recipes at home and return.</p>')+'<div class="fm-buttons"><button class="fm-main" data-act="fmarket-kitchen">🍳 Open Recipe Book</button><button data-act="fmarket-overview">Festival Market</button></div></div>');
 }
 function taste(){
  if(!open()||!activeScene())return overview();
  const st=state(),r=data(),day=String(st.day);
  if(r.tastes[day])return notify('You have already shared a festival treat today.');
  if(st.coins<8)return notify('Not enough coins for a festival treat.');
  st.coins-=8;r.tastes[day]=1;
  r.tastes=Object.fromEntries(Object.entries(r.tastes).slice(-35));
  st.needs.hunger=clamp(st.needs.hunger+22,0,100);
  st.needs.fun=clamp(st.needs.fun+10,0,100);
  st.needs.social=clamp(st.needs.social+8,0,100);
  save();updateUI();notify('A warm seasonal treat and a wonderful conversation! 🍯');treats();
 }
 function donate(index){
  if(!open()||!activeScene())return overview();
  const st=state(),r=data();if(completed('supper'))return treats();
  if(!Number.isInteger(index)||index<0||index>29)return notify('Choose a prepared dish to share.');
  const dishes=st.cooking?.dishes;
  const dish=Array.isArray(dishes)?dishes[index]:null;
  if(!dish||!Object.hasOwn(RECIPES,dish.id)||!Number.isInteger(dish.quality)||dish.quality<1||dish.quality>3)return notify('That prepared dish is no longer available.');
  dishes.splice(index,1);
  r.supper[key()]={recipe:dish.id,quality:dish.quality};
  st.needs.social=clamp(st.needs.social+14,0,100);
  st.needs.fun=clamp(st.needs.fun+7,0,100);
  st.relations.oliver=clamp((st.relations.oliver||0)+4+dish.quality,0,100);
  st.relations.rosie=clamp((st.relations.rosie||0)+2+(st.stewardship?.phases?.cart===2?1:0),0,100);
  st.hearts=clamp((st.hearts||0)+3,0,1000000);
  save();updateUI();
  showModal('market-supperresult','<div class="fm-ui"><div class="fm-eyebrow">A HEARTFELT CONTRIBUTION</div><h2>🍽️ Everyone shares a little</h2><p>You set '+RECIPES[dish.id]+' on the community table. Oliver makes room for your dish, and Rosie thanks you for bringing something made with love.</p><div class="fm-banner">'+('★'.repeat(dish.quality))+' · Supper memory saved · +Friendship, Hearts, Fun and Social</div><button class="fm-main" data-act="fmarket-overview">Open market scrapbook</button><button class="fm-back" data-act="fmarket-close">Return to the festival</button></div>');
 }
 function handle(action,id){
  if(action==='fmarket-overview')return overview();
  if(action==='fmarket-close'){session=null;closeModal();return;}
  if(action==='fmarket-travel')return travel(id);
  if(action==='fmarket-visit')return visit(id);
  if(action==='fmarket-crafts')return crafts();
  if(action==='fmarket-start')return start();
  if(action==='fmarket-brush')return brush(Number(id));
  if(action==='fmarket-tile')return paint(Number(id));
  if(action==='fmarket-clear'){if(session&&session.kind==='craft')session.colors.fill(-1);return renderCraft();}
  if(action==='fmarket-finish')return finish();
  if(action==='fmarket-treats')return treats();
  if(action==='fmarket-taste')return taste();
  if(action==='fmarket-donate')return donate(Number(id));
  if(action==='fmarket-kitchen'){session=null;return api.openKitchen();}
 }
 function hit(x,y){
  if(!open())return null;
  for(const s of STALLS){
   // Interact with the upper canvas sign/awning, leaving pedestrians accessible.
   if(Math.abs(x-s.x)<=60&&y>=s.y-119&&y<=s.y-37)return s;
  }
  return null;
 }
 function decorate(g,{day,season,tick=0}={}){
  if(!isOpen(day))return;
  const r=state().festivalMarket||{crafts:{},supper:{}},k=cycle(day)+':'+clamp(season|0,0,3);
  for(const s of STALLS){
   const x=s.x,y=s.y;
   g.save();g.translate(x,y);
   // Cloth bunting, animated lantern strings and a hand-painted hanging sign.
   g.strokeStyle='#876950';g.lineWidth=3;g.beginPath();g.moveTo(-62,-108);g.quadraticCurveTo(0,-97+Math.sin(tick)*2,62,-108);g.stroke();
   for(let i=0;i<7;i++){
    const xx=-54+i*18,yy=-109+Math.sin(i/6*Math.PI)*9;
    g.fillStyle=SEASONS[clamp(season|0,0,3)].colors[i%4];
    g.beginPath();g.moveTo(xx-7,yy);g.lineTo(xx+7,yy);g.lineTo(xx,yy+16);g.fill();
   }
   const done=s.id==='crafts'?r.crafts?.[k]:r.supper?.[k];
   if(done){
    g.fillStyle='#f9ecc8';g.fillRect(35,-48,28,31);g.strokeStyle='#936a4d';g.lineWidth=3;g.strokeRect(35,-48,28,31);
    g.fillStyle='#ca996a';g.font='bold 18px system-ui';g.fillText('★',40,-27);
   }
   if(s.id==='treats'){
    for(let i=0;i<3;i++){g.fillStyle='rgba(255,248,226,.57)';g.beginPath();g.ellipse(-33+i*30+Math.sin(tick+i)*3,-61-Math.sin(tick*1.1+i)*5,3,8,0,0,Math.PI*2);g.fill();}
   }
   g.restore();
  }
 }
 return {overview,travel,visit,crafts,treats,handle,hit,open,isOpen,decorate,STALLS,clean};
}
root.HearthFestivalMarket={setup,clean,isOpen,STALLS,RECIPES,SEASONS};
})(window);
