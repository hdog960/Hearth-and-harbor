/* Hearth & Harbor — Little Lives v1.2.0
   A complete 2.5D canvas rendering reset. Original pixel artwork, zero 3D dependencies. */
(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d',{alpha:false});
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rand=(a,b)=>a+Math.random()*(b-a);
const hash=(n)=>{const x=Math.sin(n*127.1+8.45)*43758.5453;return x-Math.floor(x)};
const SAVE='hearth-harbor-save-v1';
const DEF=()=>({neighborMilestones:[],socialDaily:{},name:'Poppy',hair:0x5d4037,hairStyle:1,outfit:0xe3a0a8,skin:0xf4c5aa,coins:250,hearts:0,day:1,minute:8*60,season:0,needs:{hunger:88,fun:89,social:83,energy:100},relations:{},met:[],quests:{},inventory:[],placed:[],garden:[0,0,0,0],gardenBoost:[false,false,false,false],fish:[],homeStyle:0,sound:false,seenWelcome:false});
function cleanSave(raw){
 const d=DEF();if(!raw||typeof raw!=='object'||Array.isArray(raw))return d;
 const number=(v,f,min,max)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,min,max):f;
 const safeColor=(v,f)=>typeof v==='number'&&Number.isInteger(v)&&v>=0&&v<=0xffffff?v:f;
 const obj=(v)=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 const npcIds=new Set(NPCS.map(n=>n.id));
 // No imported save may inject HTML, NaN or enormous collections into the UI.
 const needs=obj(raw.needs),relationships=obj(raw.relations),quests=obj(raw.quests);
 const res={...d,name:typeof raw.name==='string'?raw.name.trim().slice(0,18)||d.name:d.name,
   hair:safeColor(raw.hair,d.hair),outfit:safeColor(raw.outfit,d.outfit),skin:safeColor(raw.skin,d.skin),
   hairStyle:number(raw.hairStyle,d.hairStyle,0,4)|0,coins:number(raw.coins,d.coins,0,1000000),hearts:number(raw.hearts,0,0,1000000),
   day:number(raw.day,1,1,9999)|0,minute:number(raw.minute,d.minute,0,1439.999),season:number(raw.season,0,0,3)|0,
   homeStyle:number(raw.homeStyle,0,0,3)|0,seenWelcome:!!raw.seenWelcome,
   neighborMilestones:Array.isArray(raw.neighborMilestones)?[...new Set(raw.neighborMilestones.filter(x=>typeof x==='string'&&/^(mabel|rosie|oliver|jun|bea|finn):(25|60|90)$/.test(x)))].slice(0,18):[],
   socialDaily:Object.fromEntries(Object.entries(obj(raw.socialDaily)).filter(([id])=>npcIds.has(id)).map(([id,record])=>{const r=obj(record);return [id,{day:number(r.day,0,0,9999)|0,chat:number(r.chat,0,0,2)|0,compliment:number(r.compliment,0,0,1)|0,gift:number(r.gift,0,0,1)|0}]})),
   needs:Object.fromEntries(Object.entries(d.needs).map(([k,v])=>[k,number(needs[k],v,0,100)])),
   relations:Object.fromEntries(Object.entries(relationships).filter(([k])=>npcIds.has(k)).map(([k,v])=>[k,number(v,0,0,100)])),
   quests:Object.fromEntries(Object.entries(quests).filter(([k])=>/^(meet|chat|fish|garden|work)(_claimed)?$/.test(k)).map(([k,v])=>[k,k.endsWith('_claimed')?!!v:number(v,0,0,100000)])),
   met:Array.isArray(raw.met)?raw.met.filter(x=>npcIds.has(x)).slice(0,6):[],
   garden:Array.from({length:4},(_,i)=>number(Array.isArray(raw.garden)?raw.garden[i]:null,0,0,2)|0),
   gardenBoost:Array.from({length:4},(_,i)=>!!(Array.isArray(raw.gardenBoost)&&raw.gardenBoost[i])),
   inventory:Array.isArray(raw.inventory)?raw.inventory.filter(x=>x==='flower-seed').slice(0,100):[],
   fish:Array.isArray(raw.fish)?raw.fish.filter(x=>typeof x==='string').slice(0,1000):[],
   placed:Array.isArray(raw.placed)?raw.placed.filter(f=>f&&furnitureTypes.some(t=>t.id===f.kind)).slice(0,80).map(f=>({kind:f.kind,x:number(f.x,550,220,940),z:number(f.z,610,300,1030)})):[]};
 return res;
}
let state=DEF();

const NPCS=[
 {id:'mabel',name:'Mabel',job:'Florist',trait:'Creative · Loves flowers',skin:'#c48b67',hair:'#523b31',outfit:'#f08fbd',kind:'dress',style:0,emoji:'🌸',x:720,y:594,lines:['I was just admiring the daisies. They seem extra happy today!','Do you think flowers have favorite neighbors? I think they do.','A pink blossom is like a tiny hello from spring.']},
 {id:'rosie',name:'Rosie',job:'Market owner',trait:'Cheerful · Ambitious',skin:'#e7ae85',hair:'#9b5143',outfit:'#e786a1',kind:'overalls',style:3,emoji:'🍓',x:396,y:757,lines:['Fresh peaches, just for you! Well, if you have a few coins.','I want this market to be the heart of the whole village.','I heard someone is planning a picnic by the river!']},
 {id:'oliver',name:'Oliver',job:'Baker',trait:'Warmhearted · Foodie',skin:'#f8caa0',hair:'#674332',outfit:'#82a1d6',kind:'apron',style:2,emoji:'🥐',x:948,y:525,lines:['The cinnamon buns are rising beautifully today.','I think a warm pastry can fix almost any rainy afternoon.','Maybe I should open a little strawberry tart stand.']},
 {id:'jun',name:'Jun',job:'Bookshop keeper',trait:'Shy · Bookworm',skin:'#f3d2ae',hair:'#353441',outfit:'#8bb59c',kind:'sweater',style:1,emoji:'📚',x:423,y:935,lines:['This is the quietest little corner of town. I love it.','Would you like to borrow my favorite storybook?','Sometimes I write poems about the ocean.']},
 {id:'bea',name:'Bea',job:'Artist',trait:'Outgoing · Dreamer',skin:'#986448',hair:'#39313a',outfit:'#f2bc56',kind:'dress',style:4,emoji:'🎨',x:794,y:803,lines:['I am painting the sunset in every shade of peach.','I wish the clouds would pose for my paintings.','Your outfit is giving me so many ideas!']},
 {id:'finn',name:'Finn',job:'Fisher',trait:'Relaxed · Outdoorsy',skin:'#eac5a2',hair:'#ad7b50',outfit:'#70b6be',kind:'overalls',style:2,emoji:'🐟',x:1035,y:1095,lines:['Fish always bite when you least expect it.','Come down to the pond sometime. The water sparkles at noon.','No need to rush. The whole day is yours.']}
];
const HEX=n=>'#'+((n>>>0)&0xffffff).toString(16).padStart(6,'0');
const color=n=>typeof n==='number'?HEX(n):n;
const playerDef=()=>({id:'player',name:state.name,skin:color(state.skin),hair:color(state.hair),outfit:color(state.outfit),kind:'dress',style:state.hairStyle??1});
let scene='town',speed=1,modal=null,talk=null,placement=null,toastTimer=0,uiTimer=0;
let player={x:597,y:654,target:null,facing:'front',walk:0,bodyBob:0},cam={x:597,y:654},W=0,H=0,DPR=1,last=0,tick=0;
let displayScale=1;let worldScale=1;
const furnitureTypes=[{id:'bed',name:'Cloud-soft bed',emoji:'🛏️',cost:95},{id:'sofa',name:'Peach sofa',emoji:'🛋️',cost:75},{id:'plant',name:'Fern in pot',emoji:'🪴',cost:25},{id:'books',name:'Storybook shelf',emoji:'📚',cost:70},{id:'lamp',name:'Honey lamp',emoji:'💡',cost:40},{id:'rug',name:'Patchwork rug',emoji:'🧶',cost:35},{id:'chair',name:'Wooden chair',emoji:'🪑',cost:30},{id:'flowers',name:'Flower vase',emoji:'💐',cost:20}];
try{state=cleanSave(JSON.parse(localStorage.getItem(SAVE)||'null'))}catch(e){state=DEF()}

function save(){try{localStorage.setItem(SAVE,JSON.stringify(state))}catch(e){}};
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2900)}
function drawBar(id,v){$(id).style.width=clamp(v,0,100)+'%';$(id).style.background=v<25?'#ef7e79':v<50?'#e7ba65':'#67bd88'}
function updateUI(){const seasons=['SPRING','SUMMER','AUTUMN','WINTER'],h=Math.floor((state.minute%1440)/60),m=Math.floor(state.minute%60);$('dateText').textContent=`${seasons[state.season%4]} · DAY ${state.day} · ${((h+11)%12+1)}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;$('coinText').textContent=Math.floor(state.coins);$('heartText').textContent=state.hearts;$('playerName').textContent=state.name;drawBar('needFood',state.needs.hunger);drawBar('needFun',state.needs.fun);drawBar('needSocial',state.needs.social);drawBar('needEnergy',state.needs.energy);$('locationText').textContent=scene==='town'?'✦ MAPLEWOOD VILLAGE ✦':'✦ YOUR LITTLE COTTAGE ✦';$('prompt').textContent=scene==='town'?'TAP TO WALK · TAP A NEIGHBOR TO CHAT':'TAP TO WALK · TAP FURNITURE TO USE';$('townBtn').classList.toggle('active',scene==='town');$('homeBtn').classList.toggle('active',scene==='home');$('timeBtn').textContent=speed===0?'Ⅱ':speed===1?'▶':speed===2?'▶▶':'▶▶▶'}
function changeNeed(id,v){state.needs[id]=clamp(state.needs[id]+v,0,100);updateUI();save()}
function coins(v){state.coins=Math.max(0,state.coins+v);updateUI();save()}
function task(id){state.quests[id]=(state.quests[id]||0)+1;save()}
const personalityTalk={
 mabel:{compliments:['You noticed my flowers? That makes me so happy!','I pressed your compliment into my memory like a flower.'],gift:['I will put this somewhere sunny!','Oh! A new treasure for my greenhouse!']},
 rosie:{compliments:['Stop, you are making me grin like a peach!','Kind words are the best things in my market.'],gift:['For me? I should give you a loyalty card!','This deserves a special spot by my counter.']},
 oliver:{compliments:['I am blushing like a freshly baked bun!','You are sweeter than the icing!'],gift:['Thank you! You have made my entire morning.','I will save this for after the café rush.']},
 jun:{compliments:['Oh... I might write a poem about that.','You are very kind. I never know what to say.'],gift:['This is so thoughtful. I will cherish it.','I am going to keep this next to my favorite books.']},
 bea:{compliments:['You just brightened my whole color palette!','Can I paint that compliment? It was beautiful.'],gift:['This sparks so many ideas!','I love gifts with a little story behind them.']},
 finn:{compliments:['That is mighty nice of you.','Aw, you are good company.'],gift:['I will treasure it on my next fishing trip.','That is even better than a lucky catch!']}
};
// An inhabitant has a real daily destination and purpose, not a random little orbit.
// Routine destinations are public, walkable parts of the existing town.
const VILLAGER_ROUTINES={
 mabel:[{h:0,where:[790,505],doing:'resting at her cottage',icon:'🏡',mood:'sleepy'},
        {h:7,where:[806,488],doing:'tending the flower garden',icon:'🌷',mood:'inspired'},
        {h:12,where:[680,744],doing:'gathering flowers for the market',icon:'🌼',mood:'happy'},
        {h:17,where:[755,885],doing:'admiring the village blooms',icon:'🌸',mood:'peaceful'},
        {h:21,where:[790,505],doing:'heading home to rest',icon:'🏡',mood:'sleepy'}],
 rosie:[{h:0,where:[444,817],doing:'resting after market day',icon:'🌙',mood:'sleepy'},
        {h:7,where:[579,788],doing:'setting up her fruit stall',icon:'🍓',mood:'busy'},
        {h:11,where:[585,808],doing:'running her market stall',icon:'🍑',mood:'cheerful'},
        {h:17,where:[742,722],doing:'visiting her neighbors',icon:'💬',mood:'cheerful'},
        {h:21,where:[444,817],doing:'counting the day’s earnings',icon:'🌙',mood:'sleepy'}],
 oliver:[{h:0,where:[1070,541],doing:'sleeping after a long bake',icon:'🌙',mood:'sleepy'},
         {h:6,where:[1038,552],doing:'baking the morning bread',icon:'🥐',mood:'busy'},
         {h:12,where:[842,694],doing:'delivering fresh pastries',icon:'🥨',mood:'cheerful'},
         {h:16,where:[1067,548],doing:'preparing tomorrow’s dough',icon:'🍞',mood:'focused'},
         {h:21,where:[1070,541],doing:'closing the café',icon:'🌙',mood:'sleepy'}],
 jun:[{h:0,where:[485,1125],doing:'reading by lamplight',icon:'📚',mood:'sleepy'},
      {h:8,where:[515,1106],doing:'opening the bookshop',icon:'📖',mood:'focused'},
      {h:13,where:[741,826],doing:'reading outdoors',icon:'📘',mood:'peaceful'},
      {h:17,where:[509,1109],doing:'putting the books away',icon:'📚',mood:'focused'},
      {h:21,where:[485,1125],doing:'settling in with a novel',icon:'🌙',mood:'sleepy'}],
 bea:[{h:0,where:[1136,895],doing:'dreaming up new paintings',icon:'🌙',mood:'sleepy'},
      {h:8,where:[1135,870],doing:'sketching under the trees',icon:'🎨',mood:'inspired'},
      {h:12,where:[850,1054],doing:'painting the lily pond',icon:'🖌️',mood:'inspired'},
      {h:17,where:[740,775],doing:'showing off her new artwork',icon:'🖼️',mood:'cheerful'},
      {h:21,where:[1136,895],doing:'tidying her paints',icon:'🌙',mood:'sleepy'}],
 finn:[{h:0,where:[1106,1296],doing:'resting by the pond',icon:'🌙',mood:'sleepy'},
       {h:6,where:[1102,1317],doing:'watching the morning fish',icon:'🐟',mood:'peaceful'},
       {h:11,where:[898,1362],doing:'fishing at Lily Pond',icon:'🎣',mood:'focused'},
       {h:16,where:[1048,788],doing:'taking an afternoon stroll',icon:'☀️',mood:'happy'},
       {h:21,where:[1106,1296],doing:'watching the stars',icon:'⭐',mood:'peaceful'}]
};
const FRIENDSHIP_MOMENTS={
 mabel:['I saved you my favorite flower. It reminds me of you!','I made a little patch in the garden just for us.','Somehow this town feels brighter whenever you visit.'],
 rosie:['You are officially my most cheerful regular!','I set aside the best peaches for you, always.','One day we should run a stall together!'],
 oliver:['I know exactly how you like your breakfast now.','My newest pastry is named after our friendship!','The café is your home away from home.'],
 jun:['I found a book with a character just like you.','I wrote a story about the day we met.','You are my favorite chapter of Maplewood life.'],
 bea:['I made a tiny sketch of us together!','You inspired my best painting yet.','Our friendship belongs in a gallery!'],
 finn:['The fish are biting. Want to share my lucky spot?','There is no quieter place than fishing with a friend.','You make every morning by the pond worthwhile.']
};
function currentRoutine(n){
 const stages=VILLAGER_ROUTINES[n.id],hour=state.minute/60;
 let chosen=stages[0];for(const stage of stages){if(hour>=stage.h)chosen=stage;else break}
 return chosen;
}
function friendshipRank(score){return score>=90?'Kindred spirit':score>=60?'Close friend':score>=25?'Good friend':score>=1?'New friend':'Neighbor'}
function neighborMoment(n){
 const entry=currentRoutine(n),r=state.relations[n.id]||0;
 if(r>=60&&state.day%3===0)return `${n.name} smiles the moment you arrive. “I was hoping I’d see you today!”`;
 const time=state.minute/60;
 if(time<6||time>=21)return `${n.name} yawns. “Even a busy village needs a little quiet. I’m ${entry.doing}.”`;
 const lines={
 mabel:['The flower beds change every day. I notice every little bloom.','You can almost smell the fresh petals from here!'],
 rosie:['I keep a tally of which peaches everyone likes best.','I love it when the village feels like a bustling market.'],
 oliver:['Someone asked for a cinnamon bun bigger than their head!','Baking is my favorite way to make people feel welcome.'],
 jun:['Sometimes I read the same page twice because it is so lovely.','I keep a list of stories I think each neighbor would enjoy.'],
 bea:['This afternoon light makes everything look like a painting.','I collect colors the way other people collect shells.'],
 finn:['I can tell the weather by watching the pond.','The trick to fishing? Patience and a good friend.']
 }[n.id];
 const choice=(state.day+Math.floor(state.minute/180))%lines.length;
 return `${lines[choice]} I’m ${entry.doing}.`;
}
function checkFriendshipMoment(n,previous,next){
 for(let i=0;i<3;i++){const value=[25,60,90][i],key=`${n.id}:${value}`;
  if(previous<value&&next>=value&&!state.neighborMilestones.includes(key)){
   state.neighborMilestones.push(key);
   $('talkText').textContent=FRIENDSHIP_MOMENTS[n.id][i];
   $('emote').textContent='💖';notify(`${n.name} is now your ${friendshipRank(next).toLowerCase()}! 💖`);
   return true;
  }
 }
 return false;
}
const questDefs=[{id:'meet',text:'Meet 3 neighbors',max:3,reward:70},{id:'chat',text:'Have 5 friendly chats',max:5,reward:80},{id:'fish',text:'Catch 3 fish',max:3,reward:85},{id:'garden',text:'Harvest your first flowers',max:1,reward:55},{id:'work',text:'Work 2 café shifts',max:2,reward:120}];

// ===== ORIGINAL 64-ERA INSPIRED PIXEL SPRITE ARTWORK =====
const art={};function makeArt(key,w,h,fn){if(art[key])return art[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;fn(g,w,h);return art[key]=c}
function fill(g,c,x,y,w,h){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function poly(g,c,p){g.fillStyle=c;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.fill()}
function ellipse(g,c,x,y,w,h){g.fillStyle=c;g.beginPath();g.ellipse(x,y,w,h,0,0,TAU);g.fill()}
function line(g,c,pts,width=2){g.strokeStyle=c;g.lineWidth=width;g.lineCap='square';g.lineJoin='miter';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
function strokeRect(g,c,x,y,w,h,s=2){g.strokeStyle=c;g.lineWidth=s;g.strokeRect(x,y,w,h)}
function specks(g,seed,w,h,count,colors){for(let i=0;i<count;i++){const a=hash(seed*11+i*13.18),b=hash(seed*17+i*67.1);fill(g,colors[i%colors.length],a*w,b*h,1+Math.floor(hash(i+seed)*3),1+Math.floor(hash(i*7+seed)*2))}}

function round(g,c,x,y,w,h,r=8,stroke=null,sw=1){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=sw;g.stroke()}}
function curved(g,c,points,width=2){g.strokeStyle=c;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.stroke()}
function oval(g,c,x,y,rx,ry,outline=null,lw=2){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();if(outline){g.strokeStyle=outline;g.lineWidth=lw;g.stroke()}}
function lighter(hex,f=.14){const c=String(hex).replace('#','');const n=parseInt(c,16)||0;let a=[n>>16&255,n>>8&255,n&255].map(v=>clamp(Math.round(v+(255-v)*f),0,255));return '#'+a.map(v=>v.toString(16).padStart(2,'0')).join('')}
function darker(hex,f=.22){const c=String(hex).replace('#','');const n=parseInt(c,16)||0;let a=[n>>16&255,n>>8&255,n&255].map(v=>clamp(Math.round(v*(1-f)),0,255));return '#'+a.map(v=>v.toString(16).padStart(2,'0')).join('')}

function charArt(o,dir='front',frame=0,emote='neutral'){
 const key=`C9:${o.id||o.name}:${o.skin}:${o.hair}:${o.outfit}:${o.kind}:${o.style}:${dir}:${frame}:${emote}`;
 return makeArt(key,96,132,g=>{
  const skin=o.skin||'#f3c3a0',hair=o.hair||'#54382d',dress=o.outfit||'#ef96ae';
  const outline=darker(hair,.30), hairLight=lighter(hair,.23), hairDeep=darker(hair,.24);
  const skinLight=lighter(skin,.22),skinShadow=darker(skin,.12),dressDeep=darker(dress,.23),dressLight=lighter(dress,.24);
  const isBack=dir==='back',isSide=dir==='side',walking=frame%2!==0,dy=walking?3:0;
  // tiny contact shadows, natural shoes and legs: separate shapes, no floating skirt.
  for(const side of [-1,1]){
   const xx=48+side*12,yshift=side*dy;
   round(g,'#795e59',xx-8,116+yshift,16,7,3,'#543e4b',2);
   round(g,'#c8ab98',xx-5,101+yshift,10,17,3,skinShadow,1);
   round(g,skin,xx-5,99+yshift,10,13,3);
   fill(g,'#fff3df',xx-6,114+yshift,12,3);
   round(g,side===-1?'#7e5b73':'#7e5b73',xx-10,117+yshift,22,8,4,'#544253',2);
   fill(g,'#cdbbc4',xx-6,119+yshift,9,2);
  }
  // Dress, sweater, overalls and apron are truly different silhouettes.
  if(o.kind==='overalls'){
   round(g,dressDeep,30,77,36,37,9,'#6e515d',2);
   round(g,dress,33,75,30,33,7);
   round(g,'#5988af',34,85,28,25,4,'#466d94',2);
   round(g,'#6da7d0',38,88,20,16,3);
   for(const x of [36,58]){curved(g,'#ffdfaa',[[x,80],[x,90]],3);oval(g,'#f8dd9a',x,92,2,2)}
   round(g,'#4e7d9a',41,94,14,12,2);curved(g,'#8ec9e0',[[44,98],[52,98]],1);
  }else if(o.kind==='apron'){
   round(g,dressDeep,30,76,36,38,10,'#865b62',2);round(g,dress,33,76,30,35,8);
   poly(g,'#f5e4ca',[[39,86],[57,86],[62,110],[34,110]]);
   round(g,'#fff7e4',40,85,16,11,3);round(g,'#e2bb94',41,100,14,8,3);
   curved(g,'#bc936f',[[41,100],[55,100]],1);
  }else if(o.kind==='sweater'){
   round(g,dressDeep,30,76,36,35,10,'#5e5a64',2);round(g,dress,32,76,32,32,8);
   round(g,dressLight,35,80,26,8,3);
   for(let j=0;j<3;j++)curved(g,dressDeep,[[34,91+j*4],[61,91+j*4]],1);
   round(g,'#fff1d9',33,105,30,6,2);
  }else{
   // shaped A-line skirt with moving hem and layered seam.
   poly(g,'#5f5360',[[37,76],[59,76],[68,113],[28,113]]);
   poly(g,dressDeep,[[37,78],[59,78],[66,110],[30,110]]);
   poly(g,dress,[[37,78],[59,78],[63,108],[33,108]]);
   poly(g,dressLight,[[38,81],[44,81],[38,106],[34,106]]);
   curved(g,'#fff2d1',[[35,107],[61,107]],2);
  }
  // Petite articulated sleeves and independent hands.
  for(const side of [-1,1]){
   const ax=side===-1?25:71,drop=walking?side*2:0;
   round(g,dressDeep,ax-7,78+drop,14,21,6,'#695466',2);
   round(g,dress,ax-6,78+drop,12,17,6);
   round(g,skinShadow,ax-5,94+drop,10,9,4);
   round(g,skin,ax-4,95+drop,8,7,3);
   fill(g,dressLight,ax-6,92+drop,12,3);
  }
  // Neck and ribbon soften torso-to-head transition.
  round(g,skinShadow,43,68,10,15,4);round(g,skin,44,68,8,12,3);
  oval(g,'#fff5df',48,80,12,6);oval(g,dressLight,48,79,8,3);
  if(o.kind!=='overalls'){oval(g,'#fff7e8',47,91,4,5);oval(g,'#ffe2a0',47,91,2,3)}
  // v0.9 HAIRLINE RESET: hair covers the crown, NOT the jaw or lower face.
  // Back-facing hair can retain its full silhouette; forward-facing hair
  // gets a separate crown and temples so the entire chin stays skin-colored.
  if(isBack){
   oval(g,outline,48,48,37,39);
   oval(g,hairDeep,48,46,35,38);
   oval(g,hair,46,42,33,34);
   oval(g,hairLight,38,30,17,5);
   curved(g,hairDeep,[[26,45],[27,62],[34,75]],3);
   curved(g,hairLight,[[61,31],[67,43]],2);
  }else{
   // Hair sits ABOVE the cheeks, with small separate locks at the temples.
   oval(g,hairDeep,48,32,36,23);
   oval(g,hair,48,31,33,21);
   // Face has a clean skin-colored jawline and visible ears.
   oval(g,skinShadow,48,49,31,34,darker(skin,.19),1.4);
   oval(g,skin,48,47,30,33);
   oval(g,skinLight,42,41,24,23);
   for(const side of [-1,1]){oval(g,skinShadow,48+side*30,49,6,9);oval(g,skin,48+side*30,48,5,7)}
   // Large expressive eyes with visible sclera, irises and light reflections.
   const centers=isSide?[38,55]:[36,60];
   for(const ex of centers){
    oval(g,'#654c55',ex,52,7,9);
    oval(g,'#fff9f1',ex,51,6,8);
    oval(g,o.id==='jun'?'#508b88':o.id==='bea'?'#9670b0':'#594851',ex,53,4,6);
    oval(g,'#25283b',ex,54,3,5);
    oval(g,'#ffffff',ex-2,49,2,2);
    fill(g,'#ffffff',ex+2,56,1,2);
    if(emote==='happy'){oval(g,skin,ex,52,9,9);curved(g,'#66404b',[[ex-6,51],[ex,48],[ex+6,51]],2.4)}
    if(emote==='surprised'){oval(g,'#fff9f1',ex,51,7,10);oval(g,'#25283b',ex,52,3,5)}
    curved(g,hairDeep,[[ex-6,39],[ex+2,38],[ex+6,40]],2);
   }
   oval(g,'#eda7aa',25,64,8,4);oval(g,'#eda7aa',71,64,8,4);
   oval(g,skinLight,25,62,5,2);oval(g,skinLight,71,62,5,2);
   oval(g,skinShadow,48,62,3,2);
   if(emote==='surprised')oval(g,'#a64f65',48,70,4,6);
   else if(emote==='happy'){curved(g,'#ae5e6e',[[40,69],[46,74],[51,74],[57,69]],2.2);oval(g,'#e7898d',49,74,4,2)}
   else{curved(g,'#995765',[[43,70],[48,72],[54,70]],2);fill(g,'#fff0e2',46,72,4,1)}
   // Four intentional haircuts, with highlights and shaped tapered bangs.
   poly(g,hairDeep,[[15,37],[20,20],[34,13],[54,12],[72,19],[81,34],[79,42],[66,34],[61,36],[47,27],[33,38],[23,42]]);
   poly(g,hair,[[17,35],[21,23],[37,15],[55,14],[72,21],[78,33],[70,36],[61,31],[50,28],[37,35],[24,39]]);
   if(o.style===0){ // tidy bob with distinctive side swoop
    poly(g,hair,[[19,29],[29,22],[48,19],[68,24],[75,36],[69,37],[53,27],[39,32],[25,41]]);
    oval(g,hair,20,49,6,13);oval(g,hair,76,49,6,13);
    curved(g,hairLight,[[25,27],[35,20],[54,19]],2.7);
   }else if(o.style===1){ // side-part bob
    poly(g,hair,[[20,26],[40,16],[67,19],[78,30],[62,28],[47,35],[29,35],[23,43]]);
    curved(g,hairLight,[[25,26],[40,18],[56,20]],2.5);
    oval(g,hair,21,46,6,12);
   }else if(o.style===2){ // boyish tuft with uneven fringe
    poly(g,hair,[[17,34],[23,21],[35,16],[43,10],[51,18],[58,11],[73,21],[80,34],[69,34],[61,28],[54,32],[45,29],[34,39],[24,37]]);
    curved(g,hairLight,[[28,23],[39,17],[45,18]],2.5);
   }else if(o.style===3){ // ponytail silhouette
    oval(g,outline,86,48,11,18);oval(g,hair,85,47,8,15);
    oval(g,'#ffe2ad',74,36,6,4);
    poly(g,hair,[[17,36],[24,22],[38,17],[59,19],[76,30],[71,37],[61,32],[46,30],[33,39],[22,41]]);
    curved(g,hairLight,[[26,26],[44,21],[55,24]],2.5);
   }else { // double buns with shaped fringe
    oval(g,outline,20,18,14,14);oval(g,outline,76,18,14,14);
    oval(g,hair,20,17,12,12);oval(g,hair,76,17,12,12);
    oval(g,hairLight,17,12,5,3);oval(g,hairLight,72,12,5,3);
    poly(g,hair,[[22,35],[29,22],[50,20],[70,24],[76,34],[68,37],[52,31],[39,36],[27,40]]);
   }
   // individual accessories tie people to their roles.
   if(o.id==='mabel'||o.id==='rosie'||o.id==='bea'){
    const a=o.id==='bea'?'#fbd573':o.id==='rosie'?'#9ed8d9':'#f18eb5';
    oval(g,a,72,30,7,4);oval(g,a,83,28,7,4);oval(g,'#fff6df',78,29,4,4);
   }
   if(o.id==='oliver'){
    oval(g,'#fff7e7',47,16,30,8);round(g,'#fff9ef',26,8,44,13,7,'#d8bfab',2);
    for(const ex of [33,47,60])oval(g,'#fffdf2',ex,7,12,9);
   }
   if(o.id==='finn'){oval(g,'#ddbd76',48,15,35,7);round(g,'#edce83',28,0,40,18,7);fill(g,'#8db89b',30,14,36,4)}
  }
  if(isBack){curved(g,hairLight,[[31,27],[41,20],[58,23]],3)}
  // embroidery and stitching stay legible at phone scale.
  if(o.kind==='dress'){for(const [xx,yy] of [[46,94],[50,96],[54,94],[50,91]])oval(g,'#fff0bd',xx,yy,2,2);oval(g,'#f4b758',50,94,2,2)}
 });
}
function foliageArt(kind=0){return makeArt('tree8'+kind,130,185,g=>{
 const bloom=kind===2;
 const pal=bloom?['#c85f91','#e88bb3','#f3b9d4','#ffe5df']:kind===1?['#245e51','#368864','#6bbd74','#bce39a']:['#286b54','#388b5d','#65b96e','#afe08a'];
 oval(g,'#31554b44',64,177,49,8);
 // tapered trunk with visible grain and a low branch fork
 poly(g,'#685244',[[55,87],[73,87],[76,172],[53,172]]);
 poly(g,'#a77950',[[57,84],[69,83],[70,171],[57,171]]);
 curved(g,'#d3a774',[[61,104],[61,156]],3);
 poly(g,'#795f4a',[[63,128],[30,95],[32,85],[64,112],[99,86],[104,94],[67,131]]);
 // clustered foliage has convincing volume: shadow at bottom, sunlit tier on top.
 const lumps=[[39,92,25],[78,95,24],[23,70,23],[108,71,22],[47,62,32],[81,62,31],[60,37,31],[32,43,20],[99,42,19],[65,77,31]];
 lumps.forEach(([x,y,r],i)=>{oval(g,pal[0],x+2,y+5,r+3,r*.79);oval(g,pal[1],x,y,r,r*.78);oval(g,pal[2],x-4,y-6,r*.85,r*.63)});
 for(let i=0;i<51;i++){
  const a=i*2.399,r=18+hash(i*13+kind)*44,x=64+Math.cos(a)*r,y=65+Math.sin(a)*r*.58;
  if(x<9||x>119||y<17||y>112)continue;
  const sz=2+hash(i*7)*4;
  oval(g,i%4===0?pal[3]:i%3===0?pal[1]:pal[2],x,y,sz*1.8,sz*.7);
 }
 // fruit and blossoms help every tree tell a story
 for(let i=0;i<10;i++){
  const a=i*2.4,x=64+Math.cos(a)*(18+hash(i+7)*30),y=61+Math.sin(a)*29;
  if(bloom){oval(g,'#ffe5ed',x,y,4,3);oval(g,'#f8cf72',x+1,y,1.5,1.5)}
  else if(i%2===0){oval(g,kind===1?'#f1a762':'#ffd169',x,y,4,5);oval(g,'#fff4c8',x-1,y-2,1,2)}
 }
 });}
function houseArt(kind){return makeArt('house8'+kind,224,207,g=>{
 const pal=[['#f4c2a6','#d86e86','#a74f70','#fff0d8'],['#ffe2a6','#5da5bb','#377d94','#fff5db'],['#bddcd1','#a18bbd','#76699b','#fff3e3'],['#f5c4ae','#da98af','#ad6b8d','#ffeed8']][kind%4];
 const [wall,roof,roofShade,white]=pal;const edge='#735c58',wood='#a47558';
 oval(g,'#28534b44',114,187,95,12);
 // Raised stonework and distinct right-hand facade for proper 2.5D depth.
 poly(g,'#b99b84',[[18,85],[171,75],[207,66],[206,175],[170,192],[17,187]]);
 poly(g,'#bb917e',[[170,82],[204,67],[204,174],[169,188]]);
 for(let i=0;i<8;i++)curved(g,'#f0bd9d',[[172,89+i*11],[201,76+i*11]],1);
 poly(g,wall,[[20,84],[170,84],[170,185],[20,185]]);
 for(let i=0;i<11;i++){fill(g,white+'90',23,93+i*8,144,1);fill(g,roofShade+'40',25,96+i*8,140,1)}
 // Crown molding, chunky corner posts and stone skirting.
 fill(g,'#fff8e5',18,83,153,6);fill(g,'#fff8e5',19,181,153,8);
 fill(g,'#fff3d3',20,89,6,93);fill(g,'#fff3d3',164,89,6,94);
 for(let i=0;i<5;i++)fill(g,'#d5bda7',27+i*29,185,26,3);
 // Roof facets and curved eaves, colored slate shingles with warm specular accents.
 poly(g,'#5a4552',[[8,86],[47,29],[142,24],[181,77],[212,58],[162,7],[52,16]]);
 poly(g,roofShade,[[140,26],[168,5],[217,57],[184,82]]);
 poly(g,roof,[[13,80],[51,25],[142,24],[177,78],[169,84],[142,46],[54,45],[21,90]]);
 poly(g,'#edccaa',[[54,45],[140,45],[169,85],[22,85]]);
 poly(g,roof,[[13,80],[52,24],[140,24],[152,38],[56,38],[21,89]]);
 for(let i=0;i<10;i++){
  const x=26+i*12;
  curved(g,i%2?'#fff2e477':'#713e5c55',[[x,70],[x+23,37]],1);
 }
 curved(g,'#fff4d5',[[20,86],[53,43],[140,43],[168,85]],4);
 for(let i=0;i<12;i++){const x=22+i*12;fill(g,i%3===0?'#fff0c9':roofShade,x,84+(i%2),7,3)}
 // Chimney with cap
 round(g,'#b77f6c',159,14,17,30,2,edge,2);fill(g,'#e1b69a',164,16,5,22);round(g,'#f5cba7',155,12,25,5,2);
 // Gable attic window with a flower-shaped rosette.
 round(g,white,84,55,26,20,7,edge,2);round(g,'#87cde0',89,58,16,15,4);fill(g,'#fff4d8',96,58,3,14);fill(g,'#fff4d8',89,65,16,2);
 // Symmetrical shaded windows, curtains and actual flowerboxes.
 for(const x of [31,139]){
  round(g,edge,x-6,112,37,43,3);
  round(g,white,x-9,108,41,43,4);
  round(g,'#76bed1',x-4,113,31,32,3);
  poly(g,'#b5e7db',[[x-3,115],[x+8,114],[x-1,135]]);
  fill(g,white,x+10,114,3,30);fill(g,white,x-4,127,31,3);
  round(g,roofShade,x-13,109,6,40,2);round(g,roofShade,x+31,109,6,40,2);
  for(let i=0;i<3;i++){fill(g,white,x-12,115+i*11,5,2);fill(g,white,x+32,115+i*11,4,2)}
  round(g,wood,x-14,147,50,8,2);
  oval(g,'#368b5b',x+10,146,21,8);
  for(let i=0;i<7;i++)oval(g,['#f783a9','#fee5a3','#fcf5e6'][i%3],x-8+i*7,140+(i%2)*3,3,4);
 }
 // Recessed arched doorway with window, threshold, lantern and curved front steps.
 round(g,'#fff0d8',72,111,51,77,13,edge,2);
 round(g,roofShade,77,116,41,70,10);
 round(g,'#eaa47e',81,119,33,64,8);
 round(g,'#a3d9d2',88,127,19,18,5,white,2);
 fill(g,'#fff9e2',96,127,3,18);oval(g,'#ffe4a8',107,156,3,3);
 round(g,roofShade,68,109,59,7,2);
 for(let i=0;i<6;i++)round(g,i%2===0?roof: white,70+i*9,109,9,8,1);
 round(g,'#d3bba1',69,186,60,5,2);round(g,'#f1d6b5',60,191,78,6,3);
 for(const x of [63,131]){fill(g,edge,x,119,4,8);oval(g,'#fff1b1',x+2,121,6,9);oval(g,'#c99a66',x+2,116,7,3)}
 // Entry pot + doorstep tile
 round(g,'#b66e65',28,171,18,13,3);oval(g,'#36865d',37,170,13,8);oval(g,'#eaa9bd',31,164,5,5);oval(g,'#ffdb9c',43,162,4,5);
 // Mail slot and address sign give a lived-in feeling.
 fill(g,'#876454',181,158,4,26);round(g,white,174,153,20,12,3,edge,1);fill(g,'#d57f9c',191,154,3,5);
 });}
function stallArt(){return makeArt('stall',104,88,g=>{ellipse(g,'#285e4b66',51,80,43,6);fill(g,'#875a47',10,36,5,42);fill(g,'#875a47',90,36,5,42);fill(g,'#a57453',10,60,85,17);fill(g,'#eac58d',14,60,78,4);poly(g,'#5a5260',[[7,37],[21,12],[84,12],[97,37]]);for(let j=0;j<6;j++){const x=8+j*15;poly(g,j%2?'#fff2d4':'#f88ba3',[[21+j*11,13],[28+j*10,13],[x+16,37],[x,37]])}for(let j=0;j<6;j++){fill(g,['#ffbd5f','#ff796c','#a6d67b'][j%3],22+j*11,57-(j%2)*3,7,7);fill(g,'#4b945a',24+j*11,52-(j%2)*3,3,4)}fill(g,'#e6b47b',13,69,75,5)})}
function lampArt(){return makeArt('lamp',42,106,g=>{ellipse(g,'#315a4d77',21,101,18,4);fill(g,'#315a61',17,21,8,78);fill(g,'#44787b',19,26,3,72);fill(g,'#37565e',9,21,24,5);poly(g,'#31525b',[[10,24],[12,12],[20,7],[30,12],[33,24]]);poly(g,'#e9bd74',[[14,21],[17,13],[26,13],[29,21]]);fill(g,'#fff5bc',18,15,7,6);fill(g,'#31525b',17,6,9,3);fill(g,'#f9d28a',19,1,5,6)})}
function benchArt(){return makeArt('bench',100,64,g=>{ellipse(g,'#335b4b66',52,57,41,6);for(let x of [19,74])fill(g,'#546360',x,33,5,27);fill(g,'#4a5c57',17,18,64,7);fill(g,'#c78c59',14,16,70,7);fill(g,'#e4b876',14,16,70,3);fill(g,'#c78c59',16,26,68,6);fill(g,'#805742',18,36,66,7);fill(g,'#dba675',18,34,63,6);fill(g,'#ecbe8a',19,34,62,2)})}
function shrubArt(type=0){return makeArt('shrub'+type,56,43,g=>{ellipse(g,'#315b4944',27,38,24,4);for(let j=0;j<7;j++){const x=12+(j*11)%34,y=20+hash(j+type)*11;ellipse(g,'#2f6e4d',x,y,11,9);ellipse(g,(['#79ba65','#8ccc77','#63ac5f'][j%3]),x,y-3,10,7)}for(let j=0;j<5;j++){const x=9+j*9,y=14+(j%2)*12;fill(g,type===1?'#f3b0d1':j%2?'#ffcd75':'#f9a6ab',x,y,4,4)}})}
function flowerArt(n=0){return makeArt('flower'+n,32,36,g=>{fill(g,'#4a944d',15,14,3,18);fill(g,'#77be5b',10,23,5,4);fill(g,'#77be5b',18,27,5,4);const c=['#ff7fa5','#fee088','#a698ea','#f3f0dc','#ffae61'][n%5];for(const [x,y] of [[11,8],[18,8],[11,15],[18,15],[14,5]])fill(g,c,x,y,6,6);fill(g,'#f8b84a',14,11,7,7);fill(g,'#fff3d4',15,12,2,2)})}
function grassTile(){return makeArt('grass',96,96,g=>{fill(g,'#79b879',0,0,96,96);for(let i=0;i<34;i++){const x=hash(i*28)*95,y=hash(i*11+6)*95;fill(g,['#85c37c','#6eae70','#92cb88','#75b879'][i%4],x,y,4+(i%4)*2,2+(i%3))}for(let i=0;i<13;i++){const x=hash(i*48+4)*95,y=hash(i*8+34)*95;fill(g,'#4f9761',x,y,2,5);fill(g,'#b3d78e',x+2,y-1,2,3)}return g})}
function floorTile(){return makeArt('floor',64,64,g=>{fill(g,'#e6bc80',0,0,64,64);for(let j=0;j<4;j++)for(let i=0;i<3;i++){const y=j*16,x=i*24-(j%2)*12;fill(g,'#b78962',x,y,23,1);fill(g,'#f7d59c',x+1,y+2,20,2);fill(g,'#dbab72',x+18,y+7,2,6)}})}


function flowerbedArt(seed=0){return makeArt('flowerbed8'+seed,136,65,g=>{
 oval(g,'#315a4947',68,59,66,7);oval(g,'#3b915f',68,45,63,18);
 for(let j=0;j<17;j++){
  const x=12+(j%9)*14+(j%3)*2, y=29+Math.floor(j/9)*14+hash(j+seed)*5;
  curved(g,'#477c42',[[x,y+16],[x,y-7]],2.4);oval(g,'#5fa85b',x-3,y+8,6,3);
  const c=['#ffa7b9','#f9e2a1','#bcaff4','#f9f5df','#f9bc80'][(j+seed)%5];
  for(const [px,py] of [[-3,0],[3,0],[0,-4],[0,4]])oval(g,c,x+px,y+py,4,4);
  oval(g,'#f1c663',x,y,2.6,2.6);
 }
 });}
function picnicArt(){return makeArt('picnic8',160,103,g=>{
 oval(g,'#315a4944',79,96,72,8);
 for(const x of [23,126]){round(g,'#b98965',x,45,12,39,3,'#775b57',2);round(g,'#e7b484',x-5,34,24,11,3)}
 round(g,'#987258',22,31,117,20,8,'#65524e',2);round(g,'#fff1d8',19,24,123,16,7);
 for(let x=26;x<138;x+=19)fill(g,'#e6a0a3',x,25,9,14);
 round(g,'#e7ba83',29,48,103,8,2);round(g,'#b88663',70,56,17,32,2);
 for(let i=0;i<2;i++){const x=49+i*51;oval(g,'#fff9e9',x,29,15,5);oval(g,'#f2bd8d',x,28,5,4)}
 round(g,'#d4a487',71,12,23,16,3);oval(g,'#fff2d3',83,11,10,6);oval(g,'#f1d18d',83,10,4,3);
 });}
function fenceArt(){return makeArt('fence8',170,68,g=>{
 for(let x=6;x<168;x+=21){round(g,'#d6a875',x,13,11,50,3,'#8f6f58',2);poly(g,'#f4d7a1',[[x,13],[x+6,5],[x+11,13]]);fill(g,'#fff2cc',x+2,19,2,28)}
 for(let y of [29,49])round(g,'#e2b982',0,y,170,8,2,'#937358',1);
 });}
function flowerArchArt(){return makeArt('arch8',160,187,g=>{
 oval(g,'#295f4a55',80,174,69,10);
 for(const x of [25,133]){round(g,'#a47962',x-6,63,13,109,4,'#654f45',2);curved(g,'#d7a78a',[[x-2,80],[x-2,162]],2)}
 curved(g,'#785b58',[[22,84],[29,40],[48,22],[80,13],[113,22],[133,43],[139,85]],10);
 curved(g,'#56946b',[[22,84],[29,40],[48,22],[80,13],[113,22],[133,43],[139,85]],7);
 for(let i=0;i<28;i++){const a=Math.PI*1.05+i/(27)*Math.PI*.90;const x=80+Math.cos(a)*63,y=89+Math.sin(a)*70;
  oval(g,i%2?'#5ab675':'#8acc76',x,y,11,6);
  if(i%3===0){oval(g,i%2?'#ffe4a3':'#f29db9',x,y-2,6,6);oval(g,'#fff4d0',x,y-2,2,2)}
 }
 });}
function welcomeBoardArt(){return makeArt('board8',126,112,g=>{
 oval(g,'#315b4940',61,104,48,6);
 fill(g,'#846450',25,49,9,53);fill(g,'#846450',93,49,9,53);
 round(g,'#a5785c',5,13,117,70,7,'#694f4b',3);
 round(g,'#fff2d3',12,18,103,56,6);
 g.fillStyle='#3e725c';g.textAlign='center';g.font='bold 11px system-ui';g.fillText('MAPLEWOOD',63,39);g.font='bold 10px system-ui';g.fillText('VILLAGE',63,55);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5;oval(g,'#ed9eb6',101+Math.cos(a)*8,12+Math.sin(a)*7,5,5)}oval(g,'#f3ca75',101,12,4,4);
 });}

const objects=[];
function put(type,x,y,opts={}){const obj={type,x,y,...opts};objects.push(obj);return obj}
function buildTown(){objects.length=0;
 for(const [x,y,type] of [[385,470,0],[925,455,1],[385,1070,2],[1060,970,3]])put('house',x,y,{kind:type,label:['Your Cottage','Honeybun Café','Storybook Library','Town Hall'][type],action:['home','cafe','library','hall'][type]});
 put('stall',530,752,{action:'market'});put('pond',940,1250,{action:'fish'});put('garden',763,416,{action:'garden'});
 put('bench',730,780);put('bench',375,812);put('bench',1050,615);put('picnic',1125,830);put('board',1032,790);put('arch',820,1025);put('fence',475,525);put('fence',1120,1080);for(const [x,y,k] of [[445,560,0],[780,810,1],[900,900,2],[320,925,3],[700,1125,4],[1040,550,1],[1080,895,0],[550,1010,2]])put('flowerbed',x,y,{kind:k});
 for(const [x,y] of [[610,530],[890,775],[495,1095],[1080,1165],[350,675]])put('lamp',x,y);
 for(const [x,y,n] of [[270,430,0],[265,830,1],[230,1100,0],[920,240,2],[1100,335,0],[1190,650,1],[1210,1100,0],[660,290,0],[560,1120,2],[870,1160,1],[1300,1250,0],[580,980,1],[147,650,0]])put('tree',x,y,{kind:n});
 const shrubs=[[250,590],[486,544],[1080,525],[630,405],[905,600],[1032,790],[300,995],[805,920],[1160,850],[650,1025],[1054,1087],[765,1071],[1180,1300]];
 shrubs.forEach(([x,y],i)=>put('shrub',x,y,{kind:i%2}));
 for(let i=0;i<94;i++){let x=125+hash(i*31)*1130,y=300+hash(i*37+7)*1050;
  if((Math.abs(x-610)<120&&Math.abs(y-650)<120)||(Math.abs(x-790)<160&&Math.abs(y-750)<60)||(Math.abs(x-955)<130&&Math.abs(y-1280)<120))continue;
  put('flower',x,y,{kind:i%5,scale:.60+(i%3)*.21});}
 NPCS.forEach(n=>{n.cx=n.x;n.cy=n.y;n.direction=0;n.moving=0;n.emotion='neutral';n.emotionUntil=0;n.wanderAngle=0;n.wanderDelay=0;n.routineKey='';n.routineRoute=[];n.routineGoal=null;n.routePause=0;n.pose='idle';});
}
function screenX(x){return (x-cam.x)*worldScale+W/2}
function screenY(y){return (y-cam.y)*worldScale+H*.54}
function drawArt(g,img,x,y,s=1){const w=img.width*s,h=img.height*s;g.drawImage(img,Math.floor(x-w/2),Math.floor(y-h),Math.round(w),Math.round(h));}
function tileFill(g,img,x0,y0,x1,y1){let w=img.width,h=img.height;for(let y=Math.floor(y0/h)*h;y<y1;y+=h)for(let x=Math.floor(x0/w)*w;x<x1;x+=w)g.drawImage(img,x,y)}
function pathStroke(g,pts,width){g.save();g.lineJoin='round';g.lineCap='round';g.strokeStyle='#8dae76';g.lineWidth=width+9;g.beginPath();g.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)g.lineTo(...pts[i]);g.stroke();g.strokeStyle='#f4d6a4';g.lineWidth=width;g.stroke();g.strokeStyle='#f5dbad';g.lineWidth=width-12;g.stroke();g.restore()}
function drawTownGround(g){
 g.fillStyle='#77b971';g.fillRect(-100,-100,2000,1800);tileFill(g,grassTile(),0,0,1580,1520);
 // a very deliberate 2.5D town plan: winding honey-stone roads & little clearings.
 pathStroke(g,[[600,210],[600,340],[606,520],[610,660],[610,850],[660,1000],[745,1140],[840,1240]],100);
 pathStroke(g,[[200,677],[380,681],[595,685],[820,676],[1040,660],[1320,662]],92);
 pathStroke(g,[[406,440],[424,540],[470,640]],74);
 pathStroke(g,[[915,455],[902,535],[812,641]],74);
 pathStroke(g,[[381,1030],[460,914],[570,815]],71);
 pathStroke(g,[[1044,950],[953,867],[834,739]],72);
 // Town center paved cobble motif, richer than a flat square.
 ellipse(g,'#d6b690',604,650,131,99);ellipse(g,'#fae3b5',604,642,122,91);
 for(let i=0;i<43;i++){const a=i*2.4,r=28+hash(i*3)*90;const x=604+Math.cos(a)*r,y=642+Math.sin(a)*r*.65;fill(g,'#fff1c9',x,y,6,3);fill(g,'#d3b889',x+2,y+4,3,2)}
 // pond shape on the lower lane: animated gleam, lily pads, reeds, rocks.
 ellipse(g,'#527c68',940,1255,163,99);ellipse(g,'#d4bc87',939,1251,155,94);
 ellipse(g,'#4d94a5',940,1247,143,85);ellipse(g,'#74c7c3',940,1244,135,78);
 for(let i=0;i<18;i++){const a=i*2.4,r=115+hash(i)*28;ellipse(g,i%2?'#e7d6b2':'#b1c6a2',940+Math.cos(a)*r,1245+Math.sin(a)*r*.62,5+i%4,3)}
 for(let i=0;i<8;i++){let x=850+hash(i*3)*188,y=1207+hash(i*17)*88;ellipse(g,'#3e9283',x,y,12,6);ellipse(g,'#8dc971',x-2,y-2,10,5);if(i%3===0)fill(g,'#f7a2bb',x,y-9,5,6)}
 for(let i=0;i<5;i++){const x=900+i*27,y=1244+Math.sin(tick*2+i)*9;line(g,'#d3f9df',[[x-7,y],[x+5,y]],2)}
 // Garden is a recognisable place: 4 growing beds, stone border.
 fill(g,'#b48d6f',667,307,195,144);fill(g,'#f4e3bb',671,310,187,137);
 for(let i=0;i<4;i++){let x=683+(i%2)*83,y=326+Math.floor(i/2)*55;
  fill(g,'#806049',x,y,71,43);fill(g,'#a57854',x+4,y+4,63,35);
  if((state.garden[i]||0)>0){const grown=state.garden[i]===2;for(let j=0;j<5;j++){let px=x+12+(j%3)*21,py=y+12+Math.floor(j/3)*16;fill(g,'#3b8750',px,py,4,10);fill(g,grown?['#ff9cbc','#ffe6a2','#e8abed'][j%3]:'#89c96d',px-3,py-3,9,7)}}
 }
 // flourishes that make this a decorated settlement rather than a gray plane.
 for(let i=0;i<45;i++){const x=160+hash(i*12)*1100,y=250+hash(i*64)*1150;
  if(i%4===0){fill(g,'#fff5be',x,y,4,3)}else{fill(g,'#427f55',x,y,2,5);fill(g,'#9bd882',x+2,y-2,2,4)}
 }
}
function drawHomeGround(g){
 g.fillStyle='#6aa479';g.fillRect(-200,-200,2000,1800);
 // dollhouse-like 2.5D room with thick sidewalls and papered interior.
 fill(g,'#4d675a',160,195,860,956);fill(g,'#eed09b',170,207,841,926);
 for(let y=207;y<1130;y+=floorTile().height)for(let x=170;x<1011;x+=floorTile().width)g.drawImage(floorTile(),x,y);
 fill(g,'#5e6b73',158,180,864,25);const wallThemes=[['#c5daba','#89ad88'],['#f2ccdf','#ca99b1'],['#a5cedb','#75aabd'],['#f3dab2','#ceac79']];const theme=wallThemes[state.homeStyle%4];fill(g,theme[0],169,120,840,87);
 for(let x=175;x<1000;x+=34){fill(g,theme[1],x,128,2,75);fill(g,'#fff9e6',x+3,131,2,71)}
 fill(g,'#f3e2ac',165,195,850,14);fill(g,'#af9779',169,1133,845,13);
 for(const x of [300,820]){fill(g,'#b89d7a',x-55,125,111,90);fill(g,'#fff7d9',x-48,128,97,78);fill(g,'#8ac7d9',x-42,134,86,66);fill(g,'#fef6cd',x,134,6,66);fill(g,'#fef6cd',x-42,165,86,6);for(let k=0;k<3;k++)fill(g,'#fff5c6',x-36+k*30,142,15,2)}
 fill(g,'#bd735c',560,152,92,61);fill(g,'#e0a16f',568,153,76,55);fill(g,'#ffe3a1',634,180,4,5);
 ellipse(g,'#d99a78',579,524,209,120);ellipse(g,'#f3d6ad',579,516,194,112);ellipse(g,'#b8cfa5',582,524,158,85);
 // Room trim, framed keepsakes, windowsill plants and rug stitching establish depth.
 for(const x of [183,994]){fill(g,'#f9e7bc',x,201,9,930);fill(g,'#d1ab81',x+7,202,3,928)}
 for(const [xx,yy] of [[267,624],[908,700],[245,908],[903,946]]){
  ellipse(g,'#765c5844',xx,yy+18,29,7);round(g,'#b97763',xx-19,yy-1,39,23,5,'#885b50',2);
  for(let k=0;k<4;k++){oval(g,k%2?'#57985e':'#7fbf71',xx+(k-1.5)*12,yy-7-((k+1)%2)*16,17,12);}
 }
 for(let i=0;i<13;i++){const a=i*TAU/13;oval(g,'#f5d8a6',579+Math.cos(a)*176,524+Math.sin(a)*96,3,2)}
 round(g,'#ad8165',530,115,102,70,5,'#79594e',3);round(g,'#fff5dc',538,122,86,54,3);
 oval(g,'#eccb9e',581,150,24,18);oval(g,'#e88fb0',579,148,15,12);oval(g,'#fff8e2',588,142,5,4);

}
function drawStatic(obj,g){
 const {type,x,y}=obj;
 if(type==='house')drawArt(g,houseArt(obj.kind),x,y,1.38);
 if(type==='stall')drawArt(g,stallArt(),x,y,1.60);
 if(type==='tree')drawArt(g,foliageArt(obj.kind),x,y,1.14);
 if(type==='shrub')drawArt(g,shrubArt(obj.kind),x,y,.85);
 if(type==='flower')drawArt(g,flowerArt(obj.kind),x,y,obj.scale||.8);
 if(type==='bench')drawArt(g,benchArt(),x,y,1.24);if(type==='picnic')drawArt(g,picnicArt(),x,y,1.05);if(type==='board')drawArt(g,welcomeBoardArt(),x,y,1.0);if(type==='arch')drawArt(g,flowerArchArt(),x,y,1.15);if(type==='fence')drawArt(g,fenceArt(),x,y,1.0);if(type==='flowerbed')drawArt(g,flowerbedArt(obj.kind),x,y,1.0);
 if(type==='lamp')drawArt(g,lampArt(),x,y,1.1);
 if(type==='pond'){const s=Math.sin(tick*2)*2;ellipse(g,'#d8fcf3',x+30,y-40+s,26,2)}
 if(type==='garden'){
  for(let i=0;i<8;i++){const xx=x-99+i*24;fill(g,'#fff5de',xx,308,12,7)}
  fill(g,'#fff3d1',703,299,84,15);fill(g,'#5c745e',716,302,59,2);
 }
}
function drawHomeFurniture(g){
 // Keep original save positions compatible; draw all purchased items at their stored coordinates.
 drawFurniture(g,'bed',332,430);drawFurniture(g,'sofa',803,489);drawFurniture(g,'kitchen',840,309);drawFurniture(g,'books',342,314);
 for(let i=0;i<state.placed.length;i++){
  if(placement?.moveIndex===i)continue;
  const f=state.placed[i];drawFurniture(g,f.kind,Math.abs(f.x||0)<40?575+(f.x||0)*28:(f.x||540),Math.abs(f.z||0)<40?600+(f.z||0)*25:(f.z||500));
 }
 if(placement){const f=placement.moveIndex!==undefined?state.placed[placement.moveIndex]:placement;
  g.save();g.globalAlpha=.62;drawFurniture(g,f.kind,placement.x??575,placement.y??670);g.restore();}
}

function drawFurniture(g,kind,x,y){const a=kind;
 ellipse(g,'#355e4b44',x,y+3,50,11);
 if(a==='bed'){
  fill(g,'#846054',x-76,y-68,150,76);fill(g,'#f7efdf',x-68,y-70,137,65);fill(g,'#f2c4ca',x-68,y-28,136,21);fill(g,'#e29aa3',x-68,y-7,136,7);fill(g,'#fff8e8',x-62,y-65,57,30);fill(g,'#e9e7d0',x-2,y-65,57,30);fill(g,'#906b5a',x-76,y-78,150,10);
 } else if(a==='sofa'){
  fill(g,'#765d5a',x-66,y-89,132,86);fill(g,'#df91a6',x-67,y-88,130,70);fill(g,'#f1c0c4',x-60,y-78,119,33);fill(g,'#cf8495',x-66,y-45,132,27);fill(g,'#ffeac0',x-46,y-73,32,26);fill(g,'#ffeac0',x+14,y-73,32,26);
 }else if(a==='kitchen'){
  fill(g,'#907d6e',x-88,y-94,170,82);fill(g,'#fff0d0',x-82,y-90,164,75);fill(g,'#a77a5b',x-87,y-95,175,12);for(let i=0;i<3;i++){fill(g,'#d8b58b',x-72+i*55,y-67,47,52);fill(g,'#f4d6a6',x-65+i*55,y-62,34,43)}fill(g,'#474c57',x+34,y-91,13,8);
 }else if(a==='books'){
  fill(g,'#765545',x-45,y-144,90,143);fill(g,'#d3a56e',x-40,y-138,80,133);for(let i=0;i<4;i++){fill(g,'#895d48',x-35,y-128+i*30,70,5);for(let j=0;j<6;j++){const c=['#ba7779','#65a79c','#e4c471','#7793b3'][j%4];fill(g,c,x-30+j*11,y-121+i*30,8,20)}}
 }else if(a==='chair'){fill(g,'#806957',x-28,y-65,55,62);fill(g,'#dcaa77',x-27,y-62,52,30);fill(g,'#b17d5f',x-24,y-29,48,16)}
 else if(a==='plant'){fill(g,'#aa7864',x-17,y-28,34,30);for(let j=0;j<7;j++)ellipse(g,j%2?'#4b9c67':'#6cbe73',x+Math.sin(j*2.4)*19,y-44+Math.cos(j)*10,17,16)}
 else if(a==='lamp'){fill(g,'#9e7b55',x-5,y-80,10,83);poly(g,'#ffdeb0',[[x-32,y-82],[x-23,y-112],[x+23,y-112],[x+32,y-82]])}
 else if(a==='rug'){ellipse(g,'#d17d8f',x,y,67,36);ellipse(g,'#ffe1b3',x,y,55,26);ellipse(g,'#add5b6',x,y,45,20)}
 else if(a==='flowers'){fill(g,'#82a7bd',x-11,y-35,22,30);for(let j=0;j<5;j++){line(g,'#4c9c64',[[x,y-31],[x+(j-2)*12,y-53]],2);ellipse(g,['#f98ca8','#fff1a0','#c8a8ea'][j%3],x+(j-2)*12,y-56,7,6)}}
}

function drawCharacter(g,o,x,y,dir='front',moving=false,expression='neutral'){
 ellipse(g,'#21474444',x,y-2,28,7);
 const frame=moving?Math.floor(tick*8)%2:0;
 drawArt(g,charArt(o,dir,frame,expression),x,y-(moving?Math.abs(Math.sin(tick*13))*3:Math.sin(tick*2+(o.x||0)*.001)*1.2),1.08);
}
function drawScene(){if(!W||!H)return;
 ctx.setTransform(DPR,0,0,DPR,0,0);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle=scene==='town'?'#74b470':'#7cb58c';ctx.fillRect(0,0,W,H);
 ctx.save();ctx.translate(W/2,H*.54);ctx.scale(worldScale,worldScale);ctx.translate(-cam.x,-cam.y);
 if(scene==='town')drawTownGround(ctx);else drawHomeGround(ctx);
 if(scene==='town'){
  const ordered=objects.map(o=>({...o,draw:0})).concat(NPCS.map(o=>({...o,type:'npc',draw:1})),[{type:'player',x:player.x,y:player.y,draw:2}]).sort((a,b)=>a.y-b.y);
  for(const o of ordered){if(Math.abs(o.x-cam.x)>W/worldScale*.85+230||Math.abs(o.y-cam.y)>H/worldScale*.85+230)continue;
   if(o.type==='npc'){
    const original=NPCS.find(n=>n.id===o.id);
    drawCharacter(ctx,original,o.x,o.y,original.moving>0?original.facing||'front':'front',original.moving>0,original.emotionUntil>tick?original.emotion:'neutral');
    if(Math.hypot(player.x-o.x,player.y-o.y)<175){
     drawName(ctx,o.name,o.x,o.y-151);
     if(original.moving===0&&!talk){const activity=currentRoutine(original);
      ctx.font='18px system-ui';ctx.textAlign='center';ctx.fillText(activity.icon,o.x+48,o.y-169+Math.sin(tick*1.5+o.x)*2);ctx.textAlign='left'}
    }
   }else if(o.type==='player')drawCharacter(ctx,playerDef(),player.x,player.y,player.facing,!!player.target);
   else drawStatic(o,ctx);
  }
 }else{
  drawHomeFurniture(ctx);drawCharacter(ctx,playerDef(),player.x,player.y,player.facing,!!player.target);
 }
 ctx.restore();
 // soft late-afternoon/night vignette never obscures pixel art.
 const hour=state.minute/60;if(hour>=19||hour<6){const alpha=hour>=19?Math.min(.24,(hour-19)*.055):.19;ctx.fillStyle=`rgba(32,48,87,${alpha})`;ctx.fillRect(0,0,W,H)}
 if(talk){const n=NPCS.find(n=>n.id===talk);if(n){const sx=screenX(n.x),sy=screenY(n.y-156);$('emote').style.left=sx+'px';$('emote').style.top=sy+'px'}}
 if(modal==='fish'&&$('bobber'))$('bobber').style.left=(((Math.sin(tick*4)+1)/2)*98)+'%';
}
function drawName(g,name,x,y){g.font='900 13px monospace';let textW=g.measureText(name).width;fill(g,'#295955',x-textW/2-8,y-14,textW+16,22);fill(g,'#fff7d7',x-textW/2-4,y-11,textW+8,17);g.textAlign='center';g.fillStyle='#3a6551';g.fillText(name,x,y+1);g.textAlign='left'}
function resize(){W=Math.max(280,innerWidth);H=Math.max(350,innerHeight);DPR=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';worldScale=scene==='home'?clamp(W/770,.47,.86):clamp(W/530,.69,1.17);ctx.imageSmoothingEnabled=false}
// Characters navigate walkable corridors; scenery is no longer intangible.
const NAV_STEP=35;
function isWalkable(x,y,where=scene,ignoreNpc=false){
 if(where==='home'){
  if(x<215||x>958||y<260||y>1070)return false;
  for(const [fx,fy,rx,ry] of [[332,430,95,62],[803,489,85,67],[840,309,100,64],[342,314,72,70]])
   if(Math.abs(x-fx)<rx&&Math.abs(y-fy)<ry)return false;
  for(const f of state.placed){if(f.kind==='rug')continue;if(Math.abs(x-f.x)<47&&Math.abs(y-f.z)<34)return false}
  return true;
 }
 if(x<80||x>1440||y<190||y>1460)return false;
 // House foundations, market, garden plots, pond, and decorative props.
 for(const o of objects){
  if(o.type==='house'&&Math.abs(x-o.x)<113&&y>o.y-92&&y<o.y-8)return false;
  if(o.type==='stall'&&Math.abs(x-o.x)<64&&y>o.y-47&&y<o.y+5)return false;
  if(o.type==='garden'&&x>655&&x<874&&y>297&&y<459)return false;
  if(o.type==='pond'&&((x-940)/151)**2+((y-1249)/89)**2<1)return false;
  if(o.type==='tree'&&Math.hypot(x-o.x,y-(o.y-15))<23)return false;
  if(o.type==='lamp'&&Math.hypot(x-o.x,y-o.y)<13)return false;
  if(o.type==='fence'&&Math.abs(x-o.x)<71&&Math.abs(y-o.y)<17)return false;
  if(o.type==='picnic'&&Math.abs(x-o.x)<61&&Math.abs(y-o.y)<21)return false;
 }
 if(!ignoreNpc)for(const n of NPCS){if(Math.hypot(x-n.x,y-n.y)<25)return false}
 return true;
}
function nearestWalkable(dest,where=scene,ignoreNpc=false){
 const b=where==='home'?{minx:225,maxx:947,miny:270,maxy:1055}:{minx:90,maxx:1430,miny:200,maxy:1450};
 const point={x:clamp(dest.x,b.minx,b.maxx),y:clamp(dest.y,b.miny,b.maxy)};
 if(isWalkable(point.x,point.y,where,ignoreNpc))return point;
 for(let r=16;r<=250;r+=16)for(let i=0;i<24;i++){
  const a=i*Math.PI/12,p={x:clamp(point.x+Math.cos(a)*r,b.minx,b.maxx),y:clamp(point.y+Math.sin(a)*r,b.miny,b.maxy)};
  if(isWalkable(p.x,p.y,where,ignoreNpc))return p;
 }
 return null;
}
function findPath(start,dest,where=scene){
 const b=where==='home'?{minx:215,maxx:960,miny:260,maxy:1070}:{minx:80,maxx:1440,miny:190,maxy:1460};
 const width=Math.floor((b.maxx-b.minx)/NAV_STEP)+1,height=Math.floor((b.maxy-b.miny)/NAV_STEP)+1;
 const idx=(cx,cy)=>cy*width+cx;
 const coord=(x,y)=>({x:b.minx+x*NAV_STEP,y:b.miny+y*NAV_STEP});
 const nearest=(p)=>({x:clamp(Math.round((p.x-b.minx)/NAV_STEP),0,width-1),y:clamp(Math.round((p.y-b.miny)/NAV_STEP),0,height-1)});
 const a=nearest(start),z=nearest(dest),from=idx(a.x,a.y),to=idx(z.x,z.y);
 const pass=(x,y)=>{if(x<0||y<0||x>=width||y>=height)return false;const pt=coord(x,y);return isWalkable(pt.x,pt.y,where,true)};
 const q=[from],came=new Map([[from,-1]]),directions=[[1,0],[-1,0],[0,1],[0,-1]];
 let found=-1,closest=from,minDist=Infinity;
 for(let qi=0;qi<q.length;qi++){
  const cur=q[qi],cx=cur%width,cy=Math.floor(cur/width),d=Math.abs(cx-z.x)+Math.abs(cy-z.y);
  if(d<minDist){minDist=d;closest=cur}
  if(cur===to){found=cur;break}
  if(q.length>width*height)break;
  for(const [dx,dy] of directions){const nx=cx+dx,ny=cy+dy,n=idx(nx,ny);if(pass(nx,ny)&&!came.has(n)){came.set(n,cur);q.push(n)}}
 }
 // A nearest reachable node is better than walking through solid scenery.
 let cur=found>=0?found:closest,path=[];
 while(cur!==from&&came.has(cur)){path.push(coord(cur%width,Math.floor(cur/width)));cur=came.get(cur)}
 path.reverse();
 // Remove redundant collinear grid nodes for a smoother and more economical route.
 const simplified=[];
 for(let i=0;i<path.length;i++){
  const prev=simplified[simplified.length-1],next=path[i+1],p=path[i];
  if(prev&&next&&((prev.x===p.x&&p.x===next.x)||(prev.y===p.y&&p.y===next.y)))continue;
  simplified.push(p);
 }
 if(found>=0&&isWalkable(dest.x,dest.y,where,true))simplified.push(dest);
 return simplified;
}
function goTo(dest,after){
 const safe=nearestWalkable(dest);
 if(!safe){notify('That spot is out of reach.');return}
 const route=findPath(player,safe);
 if(!route.length&&Math.hypot(player.x-safe.x,player.y-safe.y)>32){notify('No clear path there.');return}
 player.target={x:safe.x,y:safe.y,route,after};
 if(Math.hypot(safe.x-player.x,safe.y-player.y)<24){const t=player.target;player.target=null;if(t.after)t.after()}
}
function approachObject(o){
 const access=o.type==='house'?{x:o.x+122,y:o.y+27}:
  o.type==='garden'?{x:764,y:478}:
  o.type==='pond'?{x:940,y:1360}:
  o.type==='stall'?{x:o.x+28,y:o.y+45}:{x:o.x,y:o.y+45};
 return nearestWalkable(access)||access;
}
function approachNeighbor(n){return nearestWalkable({x:n.x-51,y:n.y+35},scene,true)||{x:n.x-55,y:n.y+38}}

function goScene(next){if(talk)closeTalk();closeModal();stopPlacement();scene=next;player.target=null;
 if(next==='home'){player.x=575;player.y=670;cam.x=575;cam.y=650;}else{player.x=566;player.y=621;cam.x=566;cam.y=620;}
 resize();updateUI();save();notify(next==='home'?'Home sweet home! 🏡':'Out into the sunshine! 🌷')}
function beginPlacement(obj){placement={...obj,x:575,y:660};closeModal();$('placementHint').classList.remove('hidden');$('placementText').textContent=obj.moveIndex!==undefined?'Tap the floor to move this item':'Tap a clear spot to place your new furniture';notify('Choose a spot inside your cottage 🌷')}
function stopPlacement(){placement=null;$('placementHint').classList.add('hidden')}
function chooseFurniturePosition(wx,wy){return{x:Math.round(clamp(wx,275,905)/12)*12,y:Math.round(clamp(wy,365,965)/12)*12}}

function clickWorld(x,y){if(modal||talk)return;
 const wx=(x-W/2)/worldScale+cam.x,wy=(y-H*.54)/worldScale+cam.y;
 if(placement&&scene==='home'){
  const pos=chooseFurniturePosition(wx,wy),f=placement.moveIndex!==undefined?state.placed[placement.moveIndex]:placement;
  const blocked=[[332,430,95],[803,489,89],[840,309,95],[342,314,94]];
  const occupied=blocked.some(([x,y,r])=>Math.hypot(pos.x-x,(pos.y-20)-(y-35))<r)||state.placed.some((item,i)=>i!==placement.moveIndex&&Math.hypot(pos.x-item.x,pos.y-item.z)<72)||Math.hypot(pos.x-player.x,pos.y-player.y)<55;
  if(occupied)return notify('That spot is taken. Try a clear area!');
  if(placement.moveIndex!==undefined){state.placed[placement.moveIndex].x=pos.x;state.placed[placement.moveIndex].z=pos.y;}
  else{const item=furnitureTypes.find(t=>t.id===f.kind);if(state.coins<item.cost)return notify('Not enough coins!');state.coins-=item.cost;state.placed.push({kind:f.kind,x:pos.x,z:pos.y});}
  stopPlacement();save();updateUI();notify('Perfect! Your room is coming together! ✨');return;
 }
 if(scene==='home'){
  if(wy<220){notify('A lovely sunny view out of the window!');return}
  const bounds={x:clamp(wx,225,947),y:clamp(wy,275,738)};
  const fixed=[{kind:'bed',x:332,y:430,act:()=>{changeNeed('energy',70);notify('A wonderful nap! 💤')}},{kind:'sofa',x:803,y:489,act:()=>{changeNeed('fun',25);notify('Cozy sofa time! 💗')}},{kind:'kitchen',x:840,y:309,act:()=>{if(state.coins<10)return notify('A small meal costs 10 coins.');coins(-10);changeNeed('hunger',42);notify('Homemade comfort food! 🍞')}},{kind:'books',x:342,y:314,act:()=>{changeNeed('fun',15);notify('A lovely story! 📚')}}];
  const near=fixed.find(o=>Math.hypot(wx-o.x,wy-(o.y-35))<80);
  goTo(near?nearestWalkable({x:near.x+105,y:near.y+60}):bounds,near?.act);return;
 }
 const character=NPCS.map(n=>({n,dist:Math.hypot(wx-n.x,wy-(n.y-66))})).sort((a,b)=>a.dist-b.dist)[0];
 if(character&&character.dist<84){const n=character.n;goTo(approachNeighbor(n),()=>openTalk(n.id));if(player.target)player.target.npcId=n.id;return}
 const actions=objects.filter(o=>o.action).map(o=>({o,dist:Math.hypot(wx-o.x,(wy-(o.type==='house'?o.y-100:o.y-30)))})).sort((a,b)=>a.dist-b.dist);
 const hit=actions[0];if(hit&&hit.dist<(hit.o.type==='house'?150:hit.o.type==='pond'?135:90)){
  const o=hit.o;goTo(approachObject(o),()=>perform(o.action));return;
 }
 goTo({x:clamp(wx,65,1460),y:clamp(wy,200,1440)});
}
function perform(action){if(action==='home')return goScene('home');if(action==='cafe')return cafe();if(action==='library'){changeNeed('fun',16);notify('You found a beautiful new story! 📖');return}if(action==='hall')return townHall();if(action==='market')return market();if(action==='garden')return garden();if(action==='fish')return fishing();}
function update(dt){tick+=dt;
 if(!talk&&!modal){const next=player.target;if(next){
  const point=next.route?.[0]||{x:next.x,y:next.y};let dx=point.x-player.x,dy=point.y-player.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*178);
  if(d>Math.max(step,1)+2){
   const xx=player.x+dx/d*step,yy=player.y+dy/d*step;
   if(isWalkable(xx,yy,scene,true)){player.x=xx;player.y=yy;player.facing=dy < -25?'back':Math.abs(dx)>Math.abs(dy)*1.1?'side':'front';}
   else{player.target=null;notify('Something is in the way. Tap another spot!')}
  }else{
   if(isWalkable(point.x,point.y,scene,true)){player.x=point.x;player.y=point.y}
   if(next.route?.length){next.route.shift()}
   if(!next.route?.length){player.target=null;player.facing='front';if(next.after)next.after()}
  }
 }}
 if(scene==='town'&&!talk&&!modal&&speed>0){
  for(let i=0;i<NPCS.length;i++){
   const n=NPCS[i],entry=currentRoutine(n),key=`${state.day}:${entry.h}`;
   if(player.target?.npcId===n.id){n.moving=0;continue}
   if(n.routineKey!==key){
    n.routineKey=key;n.routineGoal=nearestWalkable({x:entry.where[0],y:entry.where[1]},'town',true);
    n.routineRoute=n.routineGoal?findPath(n,n.routineGoal,'town'):[];
    n.routePause=0;
   }
   n.routePause=Math.max(0,n.routePause-dt);
   const point=n.routineRoute?.[0];
   if(!point||n.routePause>0){n.moving=0;continue}
   const dx=point.x-n.x,dy=point.y-n.y,dist=Math.hypot(dx,dy),step=Math.min(dist,dt*(65+speed*7));
   if(dist<=Math.max(2,step+1)){
    if(isWalkable(point.x,point.y,'town',true)){n.x=point.x;n.y=point.y}
    n.routineRoute.shift();n.moving=n.routineRoute.length?1:0;
   }else{
    const xx=n.x+dx/dist*step,yy=n.y+dy/dist*step;
    const neighborBlocked=NPCS.some(other=>other!==n&&Math.hypot(xx-other.x,yy-other.y)<25);
    if(!neighborBlocked&&isWalkable(xx,yy,'town',true)){
     n.x=xx;n.y=yy;n.moving=1;n.facing=dy<-.15?'back':Math.abs(dx)>Math.abs(dy)?'side':'front';
    }else{
     n.routePause=.6+(i%4)*.13;n.moving=0;
     // Replan occasionally if another villager blocks the corridor.
     if(!neighborBlocked&&n.routineGoal)n.routineRoute=findPath(n,n.routineGoal,'town');
    }
   }
  }
 }
 if(speed>0&&!modal&&!talk&&!placement){state.minute+=dt*speed*2.0;while(state.minute>=1440){state.minute-=1440;state.day++;if(state.day%7===1)state.season=(state.season+1)%4;notify('A bright new day begins! 🌞');save()}
  const rate=dt*speed*.013;state.needs.hunger=clamp(state.needs.hunger-rate*1.9,0,100);state.needs.energy=clamp(state.needs.energy-rate*1.3,0,100);
  state.needs.social=clamp(state.needs.social-rate*.6,0,100);state.needs.fun=clamp(state.needs.fun-rate*.7,0,100);
 }
 const focus=talk?NPCS.find(n=>n.id===talk):null;const aimX=scene==='home'?575:focus?(focus.x+player.x)/2:player.x;
 const aimY=scene==='home'?650:focus?focus.y-26:player.y;
 cam.x+=(aimX-cam.x)*clamp(dt*4,0,1);cam.y+=(aimY-cam.y)*clamp(dt*4,0,1);
 uiTimer+=dt;if(uiTimer>.5){uiTimer=0;updateUI();}

}
function loop(now){if(!last)last=now;const dt=Math.min(.046,(now-last)/1000);last=now;try{update(dt);drawScene()}catch(e){console.error(e);notify('A scene error occurred: '+e.message)}requestAnimationFrame(loop)}
function closeModal(){modal=null;$('modal').classList.add('hidden')}
function showModal(kind,body){closeTalk();modal=kind;$('modalContent').innerHTML=body;$('modal').classList.remove('hidden')}
function btn(label,fn){return `<button class="btn" data-act="${fn}">${label}</button>`}
function buttonClick(e){const b=e.target.closest('[data-act]');if(!b)return;handleAction(b.dataset.act,b.dataset.id||'')}
function openTalk(id){const n=NPCS.find(a=>a.id===id);if(!n)return;closeModal();talk=id;n.emotion='happy';n.emotionUntil=tick+1.2;const r=state.relations[id]||0;
 $('talkName').textContent=n.name;$('talkRole').textContent=`${n.job} · ${friendshipRank(r)} · ♥ ${r}`;$('talkPortrait').textContent='';const portrait=document.createElement('canvas');portrait.width=54;portrait.height=54;portrait.className='portrait-canvas';const pg=portrait.getContext('2d');pg.imageSmoothingEnabled=false;pg.drawImage(charArt(n,'front',0,'happy'),4,0,88,79,0,0,54,54);$('talkPortrait').append(portrait);
 $('talkText').textContent=neighborMoment(n);$('conversation').classList.remove('hidden');$('game').classList.add('talking');
 $('talkActions').innerHTML='<button data-act="chat">💬 Chat</button><button data-act="ask">🌤 Their day</button><button data-act="compliment">💗 Compliment</button><button data-act="gift">🎁 Gift</button><button data-act="bye">See you!</button>';
 $('emote').textContent='💗';$('emote').hidden=false;state.met=state.met||[];if(!state.met.includes(id)){state.met.push(id);task('meet')}changeNeed('social',7);save()}
function closeTalk(){talk=null;$('conversation').classList.add('hidden');$('game').classList.remove('talking');$('emote').hidden=true}
function respond(kind){const n=NPCS.find(o=>o.id===talk);if(!n)return;
 if(!state.socialDaily[n.id]||state.socialDaily[n.id].day!==state.day)state.socialDaily[n.id]={day:state.day,chat:0,compliment:0,gift:0};
 const daily=state.socialDaily[n.id],r=state.relations[n.id]||0,cap=kind==='chat'?2:1;
 const voices=personalityTalk[n.id]||personalityTalk.mabel;
 if(kind==='ask'){const entry=currentRoutine(n);$('talkText').textContent=neighborMoment(n);$('emote').textContent=entry.icon;n.emotion=entry.mood==='sleepy'?'neutral':'happy';n.emotionUntil=tick+1.8;return}
 if(daily[kind]>=cap){$('talkText').textContent=kind==='chat'?`We've had a lovely chat already. Let's catch up tomorrow!`:kind==='compliment'?'I am still smiling from what you said earlier!':'That was so thoughtful. One gift a day is plenty!';$('emote').textContent='💛';return}
 if(kind==='gift'&&state.coins<20){$('talkText').textContent='Even a friendly hello is a gift, you know!';return}
 daily[kind]++;let gain=0;
 if(kind==='chat'){
  gain=7;task('chat');const lines=n.lines||[];const pick=(state.day+daily.chat+Math.floor(tick*.1))%lines.length;
  $('talkText').textContent=lines[pick];n.emotion='happy';$('emote').textContent='✨';changeNeed('social',13);
 }else if(kind==='compliment'){gain=12;n.emotion='happy';$('talkText').textContent=voices.compliments[(state.day+daily.compliment)%voices.compliments.length];$('emote').textContent='💕'}
 else if(kind==='gift'){coins(-20);gain=20;n.emotion='surprised';$('talkText').textContent=voices.gift[(state.day+daily.gift)%voices.gift.length];$('emote').textContent='🎁'}
 state.relations[n.id]=Math.min(100,r+gain);state.hearts+=gain;n.emotionUntil=tick+2.1;checkFriendshipMoment(n,r,state.relations[n.id]);$('talkRole').textContent=`${n.job} · ${friendshipRank(state.relations[n.id])} · ♥ ${state.relations[n.id]}`;$('heartText').textContent=state.hearts;save();
}
function people(){showModal('people',`<h2>💌 Meet the Neighbors</h2><p>Everyone has a life, a story, and a friendship to build. Find a neighbor to chat in the actual village.</p>${NPCS.map(n=>`<div class="card"><div><b>${n.emoji} ${n.name} · ♥ ${state.relations[n.id]||0}</b><small>${n.job} · ${n.trait}<br>${currentRoutine(n).icon} ${currentRoutine(n).doing} · ${friendshipRank(state.relations[n.id]||0)}</small></div><button data-act="find" data-id="${n.id}">Find</button></div>`).join('')}`)}
function journal(){const done=questDefs.filter(q=>(state.quests[q.id]||0)>=q.max).length;showModal('journal',`<h2>📜 Your Little Journal</h2><p>${done} of ${questDefs.length} village adventures completed. Claim your rewards to grow your little life!</p>${questDefs.map(q=>{const n=state.quests[q.id]||0,claimed=state.quests[q.id+'_claimed'];return `<div class="card"><div><b>${q.text}</b><small>${Math.min(q.max,n)} / ${q.max} · 🪙 ${q.reward}</small></div><button data-act="claim" data-id="${q.id}" ${n<q.max||claimed?'disabled':''}>${claimed?'✓ Done':'Claim'}</button></div>`}).join('')}`)}
function cafe(){showModal('cafe',`<h2>🥐 Honeybun Café</h2><p>Oliver needs help serving the lunchtime crowd. A short shift earns coins and lifts your spirits.</p><div class="card"><b>1 cozy café shift</b><b>🪙 +45</b></div>${btn('Work a shift 🥐','work')} ${btn('Have a treat (10 🪙)','eat')}`)}
function townHall(){showModal('hall',`<h2>🏛️ Maplewood Town Hall</h2><p>The village is growing around you. Meet six neighbors, spruce up your home, and complete the journal to become part of its story.</p>${btn('View your journal','journal')}`)}
function market(){showModal('market',`<h2>🍓 Rosie’s Little Market</h2><p>Fresh fruit and lovely things for a cozy home.</p><div class="grid"><div class="item"><span class="emoji">🍑</span><strong>Peach snack</strong><small>10 coins</small>${btn('Eat','eat')}</div><div class="item"><span class="emoji">🌻</span><strong>Flower seed</strong><small>8 coins</small>${btn('Buy','seed')}</div><div class="item"><span class="emoji">🪴</span><strong>Plant</strong><small>25 coins</small>${btn('Buy','buy-plant')}</div></div>`)}
function garden(){showModal('garden',`<h2>🌱 Community Garden</h2><p>Plant little flowers, care for them, and harvest blooms for your cottage.</p><div class="grid">${(state.garden||[0,0,0,0]).map((n,i)=>`<div class="item"><span class="emoji">${n===2?'🌸':n===1?'🌱':'🟫'}</span><strong>Plot ${i+1}</strong><small>${n===2?'Ready!':n===1?'Growing':'Empty'}</small><button class="btn" data-act="plot" data-id="${i}">${n===2?'Harvest':n===1?'Water':'Plant'}</button></div>`).join('')}</div><p>Planting is free. Premium seed packets from Rosie’s market give a better harvest. 🌻 ${state.inventory.filter(x=>x==='flower-seed').length} seed packets available.</p>`)}
function fishing(){showModal('fish',`<h2>🎣 Fishing at Lily Pond</h2><p>Watch the bobber and tap when it crosses the green zone!</p><div style="margin:24px 0 18px;height:30px;background:#b5d2bd;border:3px solid #91b1a6;position:relative"><div style="height:100%;width:26%;margin-left:38%;background:#7ddda4;border-left:3px solid white;border-right:3px solid white"></div><div id="bobber" style="position:absolute;top:-4px;bottom:-4px;width:6px;background:#ed7091;left:0"></div></div><button class="btn" data-act="catch" style="width:100%">🎣 Reel it in!</button>`);}
function decorate(){if(scene!=='home')goScene('home');
 showModal('decor',`<h2>🪑 Your Cozy Furniture</h2><p>Pick an item, then tap the floor to place it. Tap any purchased item below to move it again. Your room saves automatically.</p><h3>Wallpaper</h3><div class="swatches">${['#c5daba','#f2ccdf','#a5cedb','#f3dab2'].map((s,i)=>`<button data-act="wall" data-id="${i}" class="swatch" style="background:${s}" aria-label="Wallpaper ${i+1}" ${state.homeStyle===i?'aria-pressed="true"':''}></button>`).join('')}</div><h3>Furniture shop</h3><div class="grid">${furnitureTypes.map(f=>`<div class="item"><span class="emoji">${f.emoji}</span><strong>${f.name}</strong><small>🪙 ${f.cost}</small><button class="btn" data-act="buy" data-id="${f.id}">Choose</button></div>`).join('')}</div>${state.placed.length?`<h3>Your placed furniture</h3>${state.placed.map((f,i)=>`<div class="card"><div><b>${furnitureTypes.find(t=>t.id===f.kind)?.emoji||'🪑'} ${furnitureTypes.find(t=>t.id===f.kind)?.name||'Furniture'}</b><small>Arrange or sell an item</small></div><div class="furniture-actions"><button data-act="move" data-id="${i}">Move</button><button data-act="sell" data-id="${i}">Sell</button></div></div>`).join('')}`:''}`)}

function style(){const pendingName=$('nameInput')?.value;const outfit=['#f18bb0','#8cb2e5','#e8bc65','#83c5ad','#a29be2','#f2a577'],hair=['#453536','#895b47','#d3a76b','#393546','#b67360','#dba66a'],skin=['#f5dbb3','#eeb892','#c88d63','#8e5943','#5f4033'];
 showModal('style',`<h2>🎀 Make Your Own Villager</h2><p>A little pixel person with a style all their own.</p><label>Your name</label><input id="nameInput" class="input" maxlength="18" value="${escapeHtml(pendingName??state.name)}"/><h3>Outfit</h3><div class="swatches">${outfit.map(s=>`<button class="swatch" style="background:${s}" data-act="set-outfit" data-id="${s}"></button>`).join('')}</div><h3>Hair color</h3><div class="swatches">${hair.map(s=>`<button class="swatch" style="background:${s}" data-act="set-hair" data-id="${s}"></button>`).join('')}</div><h3>Haircut</h3><div class="haircuts">${['Bob','Side-part','Tousled','Ponytail','Buns'].map((n,i)=>`<button data-act="set-style" data-id="${i}" aria-pressed="${state.hairStyle===i}" class="haircut ${state.hairStyle===i?'selected':''}">${n}</button>`).join('')}</div><h3>Skin</h3><div class="swatches">${skin.map(s=>`<button class="swatch" style="background:${s}" data-act="set-skin" data-id="${s}"></button>`).join('')}</div>${btn('Save my look 🌷','save-look')}`)}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
function menu(){showModal('menu',`<h2>⚙️ Your Village</h2><p>Hearth & Harbor: Little Lives v1.2.0 — an original 2.5D retro life simulation. Your progress saves on this device.</p>${btn('💾 Save now','save')} ${btn('📤 Export backup','export')} ${btn('📥 Import backup','import')}<hr><p><strong>How to play</strong><br>Tap a destination to walk. Tap neighbors, homes, the café, fruit stall, garden and pond to interact. Use the bottom menu to explore life, style and decorating.</p><p>💚 No accounts, energy paywalls, ads or purchases.</p>`)}
function handleAction(action,id){
 if(action==='chat'||action==='compliment'||action==='gift'||action==='ask')return respond(action);
 if(action==='bye')return closeTalk();
 if(action==='find'){closeModal();if(scene==='home')goScene('town');const n=NPCS.find(n=>n.id===id);if(n){goTo(approachNeighbor(n),()=>openTalk(id));if(player.target)player.target.npcId=n.id;}return}
 if(action==='journal')return journal();
 if(action==='claim'){const q=questDefs.find(q=>q.id===id);if(!q||state.quests[q.id+'_claimed']||(state.quests[q.id]||0)<q.max)return;state.quests[q.id+'_claimed']=true;coins(q.reward);notify(`Quest complete! +${q.reward} coins ✨`);return journal()}
 if(action==='work'){task('work');coins(45);changeNeed('energy',-13);changeNeed('fun',9);notify('Delicious work! +45 coins 🥐');return cafe()}
 if(action==='eat'){if(state.coins<10)return notify('You need 10 coins!');coins(-10);changeNeed('hunger',35);notify('Sweet and delicious! 🍑');return}
 if(action==='seed'){if(state.coins<8)return notify('You need 8 coins!');coins(-8);state.inventory.push('flower-seed');save();notify('Seeds purchased! Use them in a garden plot for a richer harvest 🌻');return}
 if(action==='buy-plant')return handleAction('buy','plant');
 if(action==='wall'){state.homeStyle=Number(id)%4;save();notify('A fresh coat of cottage color! 🎨');return}
 if(action==='buy'){const f=furnitureTypes.find(f=>f.id===id);if(!f)return;if(state.coins<f.cost)return notify('Not enough coins yet!');beginPlacement({kind:f.id});return}
 if(action==='move'){const i=Number(id);if(!Number.isInteger(i)||i<0||i>=state.placed.length)return;beginPlacement({moveIndex:i});return}
 if(action==='sell'){const i=Number(id);if(!Number.isInteger(i)||i<0||i>=state.placed.length)return;const f=state.placed.splice(i,1)[0],item=furnitureTypes.find(t=>t.id===f.kind);coins(Math.floor((item?.cost||0)/2));save();notify('Sold for half the original price ✨');return decorate()}

 if(action==='plot'){const i=Number(id);if(!Number.isInteger(i)||i<0||i>=4)return;const v=state.garden[i]||0;
 if(v===0){state.garden[i]=1;if(state.inventory.includes('flower-seed')){state.inventory.splice(state.inventory.indexOf('flower-seed'),1);state.gardenBoost[i]=true;notify('Premium seeds planted! A richer harvest awaits 🌻')}else notify('Little sprouts planted! 🌱')}
 else if(v===1){state.garden[i]=2;notify('Your flowers are blooming! 🌸')}
 else{state.garden[i]=0;const reward=state.gardenBoost[i]?38:24;state.gardenBoost[i]=false;coins(reward);task('garden');changeNeed('fun',12);notify(`Beautiful harvest! +${reward} coins 🌼`)}save();return garden()}

 if(action==='catch'){const zone=(Math.sin(tick*4)+1)/2;if(zone>=.38&&zone<=.64){const names=['Sunfish','Rainbow guppy','Golden carp','Lilyfish'];const n=names[Math.floor(rand(0,names.length))];state.fish.push(n);task('fish');coins(15);changeNeed('fun',16);notify(`You caught a ${n}! 🐟 +15`);closeModal()}else notify('Almost! The fish got away — try again!');return}
 if(action==='set-style'){state.hairStyle=clamp(Number(id)||0,0,4)|0;save();return style()}
 if(action==='set-outfit'||action==='set-hair'||action==='set-skin'){const n=parseInt(id.slice(1),16);if(!Number.isFinite(n))return;if(action==='set-outfit')state.outfit=n;else if(action==='set-hair')state.hair=n;else state.skin=n;save();return}

 if(action==='save-look'){const n=$('nameInput')?.value?.trim();if(n)state.name=n.slice(0,18);save();updateUI();closeModal();notify('Your new look is lovely! 🎀');return}
 if(action==='save'){save();notify('Your little world is saved! 💾');closeModal();return}
 if(action==='export'){save();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hearth-and-harbor-save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return}
 if(action==='import'){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=async()=>{try{if(!input.files?.[0])return;if(input.files[0].size>1500000)throw Error('Too large');const v=JSON.parse(await input.files[0].text());if(!v||typeof v!=='object'||!Number.isFinite(v.coins)||!v.needs)throw Error('Invalid save');state=cleanSave(v);save();location.reload()}catch(e){notify('That backup was not valid.')}};input.click()}

}
function bind(){
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);canvas._start={x:e.clientX,y:e.clientY}});
 canvas.addEventListener('pointerup',e=>{const a=canvas._start||{x:e.clientX,y:e.clientY};if(Math.hypot(a.x-e.clientX,a.y-e.clientY)>25)return;clickWorld(e.clientX,e.clientY)});
 $('townBtn').onclick=()=>goScene('town');$('homeBtn').onclick=()=>goScene('home');$('peopleBtn').onclick=people;$('journalBtn').onclick=journal;$('decorateBtn').onclick=decorate;$('styleBtn').onclick=style;$('menuBtn').onclick=menu;
 $('timeBtn').onclick=()=>{speed=({0:1,1:2,2:3,3:0})[speed];updateUI()};$('cancelPlacement').onclick=()=>{stopPlacement();notify('Placement canceled — no coins spent')};$('talkClose').onclick=closeTalk;$('talkActions').addEventListener('click',buttonClick);
 $('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal();else buttonClick(e)});$('closeModal').onclick=closeModal;
 addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});setInterval(save,18000);
}
function start(){buildTown();resize();bind();updateUI();cam.x=player.x;cam.y=player.y;requestAnimationFrame(loop);setTimeout(()=>$('loading').classList.add('hidden'),150);if(!state.seenWelcome){state.seenWelcome=true;save();setTimeout(()=>notify('Welcome to your cozy little village! 🌷'),800)}}
start();
})();