/* Hearth & Harbor v2.5.9 — A Village in Motion
   Deterministic resident festival roles, upgrade-aware errands and a daily volunteer story.
   No external assets, timers, networking, or new NPC entities. */
(function(root){'use strict';
const ROLES={
 mabel:{name:'Mabel',job:'Flower garlands',icon:'🌷',verb:'tying flower garlands',base:[476,614],prep:[688,585],everyday:[636,877],upgrade:'flowers',
   intro:'Mabel is weaving the last ribbons through a fragrant wreath.',
   choices:[['Weave a delicate garland','You arrange tiny blooms in careful spirals. Mabel beams at the finished wreath.'],
     ['Gather wild little flowers','You bring a colorful armful of blooms. Mabel chooses her favorites for the village arch.'],
     ['Make a welcoming bouquet','You tie a bright bouquet for the first visitor through the square.']]},
 rosie:{name:'Rosie',job:'Market baskets',icon:'🍎',verb:'arranging orchard baskets',base:[512,730],prep:[514,768],everyday:[510,837],upgrade:'cart',
   intro:'Rosie needs a hand arranging the little crates for the shared harvest table.',
   choices:[['Stack the fruit by color','You build neat rows of ruby, gold and green produce. Rosie laughs at how pretty the crates look.'],
     ['Write cheerful basket labels','Each crate gets a hand-lettered note. Rosie saves your favorite for next year.'],
     ['Make a tasting platter','You arrange small fruit samples so visitors can discover something lovely.']]},
 oliver:{name:'Oliver',job:'Fresh-from-the-oven treats',icon:'🥐',verb:'setting out warm pastries',base:[838,798],prep:[951,573],everyday:[884,594],upgrade:null,
   intro:'Oliver has more pastries than table space and a wonderfully fragrant problem.',
   choices:[['Decorate the pastry trays','You curl little ribbons beside the rolls. Oliver says they look straight out of a storybook.'],
     ['Prepare a sharing plate','You make room for treats from every kitchen in Maplewood.'],
     ['Wrap a surprise for a neighbor','You carefully wrap one sweet bun and leave a handwritten kindness note.']]},
 jun:{name:'Jun',job:'Poems and invitations',icon:'📜',verb:'writing tiny festival invitations',base:[689,733],prep:[441,956],everyday:[695,877],upgrade:'flowers',
   intro:'Jun is quietly writing invitations that sound like little poems.',
   choices:[['Write a warm welcome','You help Jun find just the right words to make everyone feel invited.'],
     ['Fold paper birds','Your tiny paper birds carry little poems along the lantern strings.'],
     ['Add a little story to each card','Jun smiles as you give every invitation its own whimsical ending.']]},
 bea:{name:'Bea',job:'Painted signs',icon:'🎨',verb:'painting the festival signs',base:[406,728],prep:[793,789],everyday:[658,711],upgrade:'lanterns',
   intro:'Bea is deciding which colors will make the festival feel like sunshine.',
   choices:[['Paint a soft watercolor sign','You layer pale colors until the little sign seems to glow.'],
     ['Paint playful flower borders','Your hand-painted petals dance around Bea’s lettering.'],
     ['Add a portrait of the village','You paint the rooftops and familiar faces, all in a tiny frame.']]},
 finn:{name:'Finn',job:'Lanterns and streamers',icon:'🏮',verb:'hanging harbor lanterns',base:[809,733],prep:[1065,1151],everyday:[1092,1287],upgrade:'deck',
   intro:'Finn is hanging the strings just high enough for the lanterns to catch the breeze.',
   choices:[['String the lanterns evenly','You and Finn make a gentle arc of glowing lanterns.'],
     ['Tie a ribbon for good luck','Your little ribbon flutters over the path like a cheerful promise.'],
     ['Hang a star over the walkway','The small golden star will welcome the festival’s first visitor.']]}
};
const IDS=Object.keys(ROLES);
const CHOICES=3;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const currentCycle=day=>Math.floor((day-1)/7);
const seasonDay=day=>(day-1)%7+1;
function volunteerOpen(day){return Number.isInteger(day)&&day>=1&&day<=9999&&[2,3,4,5].includes(seasonDay(day));}
function festivalOpen(day){return Number.isInteger(day)&&day>=1&&day<=9999&&seasonDay(day)>=3&&seasonDay(day)<=5;}
function clean(raw){
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},days={},records=[];
 if(v.days&&typeof v.days==='object'&&!Array.isArray(v.days)){
  for(const [k,value] of Object.entries(v.days).slice(-90)){
   const day=Number(k);
   if(!/^[1-9]\d{0,3}$/.test(k)||!Number.isInteger(day)||day>9999||!volunteerOpen(day))continue;
   if(!value||!IDS.includes(value.id)||!Number.isInteger(value.choice)||value.choice<0||value.choice>=CHOICES)continue;
   days[k]={id:value.id,choice:value.choice};
  }
 }
 if(Array.isArray(v.records))for(const item of v.records.slice(-120)){
  if(!item||!Number.isInteger(item.day)||!volunteerOpen(item.day)||!IDS.includes(item.id)||!Number.isInteger(item.choice)||item.choice<0||item.choice>=CHOICES)continue;
  if(!records.some(x=>x.day===item.day))records.push({day:item.day,id:item.id,choice:item.choice});
 }
 return {days:Object.fromEntries(Object.entries(days).slice(-45)),records:records.slice(-32)};
}
function protectedRoutine(normal){
 const h=String(normal?.h||'');
 // Never displace private social scenes, household emergencies or planned encounters.
 return /^(?:date-|wedding-|promise-|evening-|visit-|rest-care|eat-care|social-care)/.test(h)
   || /^(?:meet-|tension-|space-|event-|friend-)/.test(h)
   || !!(normal?.eventId||normal?.coupleId||normal?.visitId)
   || /^(?:home-)/.test(h);
}
function setup(api){
 const {getState,save,updateUI,notify,showModal,closeModal}=api;
 const state=()=>getState();
 const data=()=>{const s=state();if(!s.villageLife||typeof s.villageLife!=='object'||Array.isArray(s.villageLife))s.villageLife=clean(null);return s.villageLife};
 const upgrade=id=>(state().stewardship?.phases?.[id]||0)===2;
 const donated=day=>data().days[String(day)]||null;
 const doneToday=()=>donated(state().day);
 const available=()=>volunteerOpen(state().day);
 const phase=()=>{const d=seasonDay(state().day);return d===2?'preparations':festivalOpen(state().day)?'festival':'regular'};
 const role=(id)=>ROLES[id]||null;
 const moodText=(id)=>{
  const r=role(id),s=state();
  if(!r)return null;
  const full=doneToday();
  if(full&&full.id===id)return '“I keep thinking about the '+r.choices[full.choice][0].toLowerCase()+' we made together. It made today feel special!”';
  if(phase()==='preparations')return '“Tomorrow the village fills with visitors. I’m '+r.verb+' and can hardly wait!”';
  if(phase()==='festival')return '“It is such a beautiful day to be '+r.verb+'! Everyone brought something of themselves.”';
  if(r.upgrade&&upgrade(r.upgrade))return '“That lovely place you helped build is part of my daily routine now. I always stop there.”';
  if(id==='oliver'&&upgrade('cart'))return '“Rosie’s new cart has made sharing our baking even sweeter.”';
  return null;
 };
 function schedule(id,normal){
  const r=role(id),s=state();if(!r||!normal||protectedRoutine(normal))return normal;
  const hour=s.minute/60;
  if(hour<8||hour>=20)return normal;
  const d=seasonDay(s.day);
  const festival=festivalOpen(s.day),prep=d===2;
  let where=null,slot='',doing='',icon=r.icon;
  if(festival){
   if(hour>=9&&hour<13){
    where=r.base;slot='market-am';doing=r.verb+' for the festival';
   }else if(hour>=13&&hour<17){
    // Rotate to a second social scene; distinct locations for each resident.
    const second={mabel:[640,880],rosie:[555,805],oliver:[811,816],jun:[739,756],bea:[520,694],finn:[953,1185]};
    where=second[id];slot='market-pm';doing='visiting neighbors after '+r.verb;
   }else if(hour>=17&&hour<19){
    const closing={mabel:[655,747],rosie:[522,740],oliver:[816,777],jun:[746,735],bea:[478,733],finn:[833,729]};
    where=closing[id];slot='market-evening';doing='enjoying the last festival lanterns';
   }
  }else if(prep&&hour>=10&&hour<17){
   where=r.prep;slot='prep-'+(hour<13?'early':'late');doing=r.verb+' for tomorrow';
  }else if(r.upgrade&&upgrade(r.upgrade)&&hour>=11&&hour<15){
   where=r.everyday;slot='favorite-place';doing='enjoying a village improvement you helped build';
  }else if(id==='oliver'&&upgrade('cart')&&hour>=12&&hour<15){
   where=[503,812];slot='orchard-trade';doing='sharing baking ideas with Rosie';
  }
  if(!where)return normal;
  return {h:'village-'+slot+'-'+id,where,doing,icon,mood:'happy',villageRole:true};
 }
 function activity(id,entry){
  const r=role(id);
  if(!r||!entry?.villageRole)return null;
  if(entry.h.includes('prep'))return 'prepare';
  if(entry.h.includes('market-am'))return id==='oliver'||id==='rosie'?'serve':id==='bea'?'paint':id==='finn'?'hang':id==='jun'?'write':'flowers';
  if(entry.h.includes('market-pm')||entry.h.includes('market-evening'))return 'festival';
  if(entry.h.includes('favorite-place'))return 'enjoy';
  if(entry.h.includes('orchard-trade'))return 'serve';
  return null;
 }
 function drawActivity(g,n,entry,tick){
  const type=activity(n.id,entry);
  if(!type)return false;
  const x=n.x+29,y=n.y-57,sway=Math.sin(tick*3+n.x*.01)*2,role=ROLES[n.id];
  g.save();g.lineCap='round';g.lineWidth=3;
  const oval=(px,py,rx,ry,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(px,py,rx,ry,0,0,Math.PI*2);g.fill()};
  const block=(px,py,w,h,col)=>{g.fillStyle=col;g.fillRect(px,py,w,h)};
  if(type==='serve'){
   block(x-20,y+5,45,6,'#96734f');block(x-17,y-10,39,17,'#e1be84');
   for(let i=0;i<3;i++){oval(x-10+i*13,y-8+sway*.1,7,5,i%2?'#ed9c77':'#f7d29b');}
   oval(x+8,y-25+sway,4,8,'rgba(255,249,222,.7)');
  }else if(type==='paint'||type==='prepare'){
   block(x-18,y-3,43,31,'#b88e68');block(x-15,y-7,36,6,'#eee1bc');
   for(let i=0;i<3;i++)oval(x-7+i*13,y+3,5,5,['#e998b4','#eac86e','#84bda9'][i]);
   g.strokeStyle='#80634d';g.beginPath();g.moveTo(x+16,y-10);g.lineTo(x+28,y-24+sway);g.stroke();
  }else if(type==='flowers'||type==='enjoy'){
   block(x-16,y-2,37,13,'#b78a65');
   for(let i=0;i<3;i++){block(x-11+i*12,y-20+sway*.3,2,21,'#4c956b');oval(x-10+i*12,y-23+sway*.3,7,6,['#eea4c4','#f7cf82','#b3d0e3'][i]);}
  }else if(type==='hang'){
   g.strokeStyle='#9e745f';g.beginPath();g.moveTo(x-22,y+10);g.lineTo(x-1,y-21);g.lineTo(x+23,y-7);g.stroke();
   for(let i=0;i<3;i++){block(x-3+i*10,y-20+sway+i*3,9,13,['#f7ce82','#e8a4a6','#b3cde7'][i]);}
  }else if(type==='write'){
   block(x-20,y-1,40,23,'#b7906f');block(x-13,y-8,30,18,'#fff3d9');
   for(let j=0;j<3;j++)block(x-8,y-3+j*5,21,2,'#9db2a8');
   g.strokeStyle='#855f5a';g.beginPath();g.moveTo(x+15,y+6);g.lineTo(x+23,y-18+sway);g.stroke();
  }else{
   oval(x,y-3+sway,15,10,'#f4ddb0');oval(x+1,y-4+sway,7,5,'#e9aabb');
  }
  // The work motif animates with the same fixed update clock, no particle allocations.
  if(Math.sin(tick*2+n.y*.01)>.8){block(x+31,y-32+sway,4,4,'#fff0aa');block(x+27,y-27+sway,2,2,'#fff8dc')}
  g.restore();return true;
 }
 function dayLabel(){
  const d=seasonDay(state().day);
  return d===2?'Preparations today · festival begins tomorrow':festivalOpen(state().day)?'Festival day '+(d-2)+' of 3':'A quiet village day · preparations begin on seasonal day 2';
 }
 function journal(){
  const rec=data(),done=doneToday(),season=['Spring','Summer','Autumn','Winter'][state().season%4];
  const history=[...rec.records].reverse().slice(0,12).map(x=>
   '<div class="vl-history"><span>'+ROLES[x.id].icon+'</span><div><b>'+ROLES[x.id].name+' · '+ROLES[x.id].choices[x.choice][0]+'</b><small>Day '+x.day+' · '+['Spring','Summer','Autumn','Winter'][currentCycle(x.day)%4]+'</small></div></div>').join('');
  const hosts=IDS.map(id=>{
   const r=ROLES[id];const today=done?.id===id;
   return '<article class="vl-neighbor"><span>'+r.icon+'</span><div><b>'+r.name+'</b><small>'+r.job+'</small><p>'+(phase()==='regular'?moodText(id)||'Going about their village day.':r.intro)+'</p></div><button data-act="vl-visit" data-id="'+id+'" '+(!available()||!!done?'disabled':'')+'>'+(today?'✓ Helped':done?'Tomorrow':available()?'Find':'Later')+'</button></article>';
  }).join('');
  showModal('village-helpers','<div class="vl-ui"><div class="vl-kicker">A LIVING MAPLEWOOD · COMMUNITY DIARY</div><h2>🌿 Neighbors make the village</h2><p>Six familiar faces have their own errands, festival jobs and favorite places. The village’s improvements change where they spend their day.</p><div class="vl-day">'+season+' · '+dayLabel()+'</div><div class="vl-meter">'+(done?'💛 Today you helped '+ROLES[done.id].name+'. Come back another day.':'✨ Choose one neighbor to help each festival preparation day. No deadlines and no repeatable coin rewards.')+'</div><div class="vl-roster">'+hosts+'</div><h3>Little moments, lovingly remembered</h3><div class="vl-history-list">'+(history||'<p>Every cozy tradition begins somewhere.</p>')+'</div><button class="vl-back" data-act="vl-close">Back to Maplewood</button></div>');
 }
 function begin(id){
  const r=role(id),s=state();
  if(!r||!available()){notify('Help the village during seasonal days 2–5.');return journal();}
  if(doneToday()){notify('You already shared a little act of kindness today.');return journal();}
  showModal('village-volunteer','<div class="vl-ui"><div class="vl-kicker">A LITTLE HELP MAKES A HOME</div><h2>'+r.icon+' Lend '+r.name+' a hand</h2><p class="vl-quote">'+r.intro+'</p><p>Pick how you would like to help. Your choice changes the memory and the seasonal decorations.</p><div class="vl-choices">'+r.choices.map((choice,i)=>'<button data-act="vl-choose" data-id="'+id+'|'+i+'">'+['🌼','🌟','💌'][i]+' '+choice[0]+'</button>').join('')+'</div><button class="vl-back" data-act="vl-board">Community Diary</button></div>');
 }
 function select(raw){
  const [id,indexRaw]=String(raw).split('|'),choice=Number(indexRaw),r=role(id),s=state();
  if(!r||!Number.isInteger(choice)||choice<0||choice>=CHOICES||!available()||doneToday())return journal();
  const rec=data();
  rec.days[String(s.day)]={id,choice};
  rec.days=Object.fromEntries(Object.entries(rec.days).slice(-45));
  rec.records.push({day:s.day,id,choice});rec.records=rec.records.slice(-32);
  s.relations[id]=clamp((s.relations[id]||0)+4,0,100);
  s.needs.fun=clamp(s.needs.fun+5,0,100);
  s.needs.social=clamp(s.needs.social+7,0,100);
  s.hearts=clamp((s.hearts||0)+2,0,1000000);
  save();updateUI();
  showModal('village-thankyou','<div class="vl-ui"><div class="vl-kicker">A LITTLE ACT OF KINDNESS</div><h2>'+r.icon+' A lovely moment with '+r.name+'</h2><p class="vl-quote">'+r.choices[choice][1]+'</p><div class="vl-day">💗 +4 friendship · ♥ +2 Hearts · Fun and Social restored</div><p>Your help is remembered in the Community Diary and appears among the festival decorations.</p><button class="vl-main" data-act="vl-board">Open Community Diary</button><button class="vl-back" data-act="vl-close">Back to the village</button></div>');
  notify('A village memory was saved! 🌷');
 }
 function visit(id){
  const r=role(id);
  if(!r||!available()||doneToday())return journal();
  closeModal();api.findNeighbor(id);
 }
 function handle(action,id){
  if(action==='vl-board')return journal();
  if(action==='vl-begin')return begin(id);
  if(action==='vl-choose')return select(id);
  if(action==='vl-visit')return visit(id);
  if(action==='vl-close')return closeModal();
 }
 function drawDecor(g,{day,season,tick=0}){
  if(!festivalOpen(day))return;
  const rec=state().villageLife?.records||[],c=currentCycle(day);
  const entries=rec.filter(x=>currentCycle(x.day)===c).slice(-4);
  // Persistent, restrained hand-painted festival touches earned by helping neighbors.
  for(let i=0;i<entries.length;i++){
   const e=entries[i],p=ROLES[e.id],x=552+i*44,y=578;
   g.save();g.translate(x,y);
   g.strokeStyle='#896955';g.lineWidth=2;g.beginPath();g.moveTo(0,-18);g.lineTo(0,-1);g.stroke();
   g.fillStyle=['#e5a1b4','#f6d188','#8fc7aa'][e.choice];g.beginPath();g.moveTo(-13,0);g.lineTo(13,0);g.lineTo(0,18);g.fill();
   g.fillStyle='#fff4d4';g.beginPath();g.arc(0,4+Math.sin(tick*1.1+i)*2,3,0,Math.PI*2);g.fill();
   g.restore();
  }
 }
 return {role,schedule,activity,drawActivity,drawDecor,moodText,dayLabel,journal,begin,select,visit,handle,available,protectedRoutine,clean};
}
root.HearthVillageLife={clean,setup,ROLES,volunteerOpen,festivalOpen,protectedRoutine};
})(window);
