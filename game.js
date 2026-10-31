/* Hearth & Harbor — Storybook Village v0.8.0
   A complete 2.5D canvas rendering reset. Original pixel artwork, zero 3D dependencies. */
(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('scene'),ctx=canvas.getContext('2d',{alpha:false});
const TAU=Math.PI*2,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rand=(a,b)=>a+Math.random()*(b-a);
const hash=(n)=>{const x=Math.sin(n*127.1+8.45)*43758.5453;return x-Math.floor(x)};
const SAVE='hearth-harbor-save-v1';
const DEF=()=>({name:'Poppy',hair:0x5d4037,outfit:0xe3a0a8,skin:0xf4c5aa,coins:250,hearts:0,day:1,minute:8*60,season:0,needs:{hunger:88,fun:89,social:83,energy:100},relations:{},met:[],quests:{},inventory:[],placed:[],garden:[0,0,0,0],fish:[],homeStyle:0,sound:false,seenWelcome:false});
let state=DEF();try{const raw=JSON.parse(localStorage.getItem(SAVE)||'null');if(raw){state={...state,...raw,needs:{...state.needs,...raw.needs},relations:raw.relations||{},garden:raw.garden||[0,0,0,0],placed:raw.placed||[],quests:raw.quests||{}}}}catch(e){}
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
const playerDef=()=>({id:'player',name:state.name,skin:color(state.skin),hair:color(state.hair),outfit:color(state.outfit),kind:'dress',style:1});
let scene='town',speed=1,modal=null,talk=null,paused=false,placement=null,painted=[],toastTimer=0;
let player={x:597,y:654,target:null,facing:'front',walk:0,bodyBob:0},cam={x:597,y:654},W=0,H=0,DPR=1,last=0,tick=0;
let displayScale=1;let worldScale=1;
const furnitureTypes=[{id:'bed',name:'Cloud-soft bed',emoji:'🛏️',cost:95},{id:'sofa',name:'Peach sofa',emoji:'🛋️',cost:75},{id:'plant',name:'Fern in pot',emoji:'🪴',cost:25},{id:'books',name:'Storybook shelf',emoji:'📚',cost:70},{id:'lamp',name:'Honey lamp',emoji:'💡',cost:40},{id:'rug',name:'Patchwork rug',emoji:'🧶',cost:35},{id:'chair',name:'Wooden chair',emoji:'🪑',cost:30},{id:'flowers',name:'Flower vase',emoji:'💐',cost:20}];
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state))}catch(e){}};
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),2900)}
function drawBar(id,v){$(id).style.width=clamp(v,0,100)+'%';$(id).style.background=v<25?'#ef7e79':v<50?'#e7ba65':'#67bd88'}
function updateUI(){const seasons=['SPRING','SUMMER','AUTUMN','WINTER'],h=Math.floor((state.minute%1440)/60),m=Math.floor(state.minute%60);$('dateText').textContent=`${seasons[state.season%4]} · DAY ${state.day} · ${((h+11)%12+1)}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;$('coinText').textContent=Math.floor(state.coins);$('heartText').textContent=state.hearts;$('playerName').textContent=state.name;drawBar('needFood',state.needs.hunger);drawBar('needFun',state.needs.fun);drawBar('needSocial',state.needs.social);drawBar('needEnergy',state.needs.energy);$('locationText').textContent=scene==='town'?'✦ MAPLEWOOD VILLAGE ✦':'✦ YOUR LITTLE COTTAGE ✦';$('prompt').textContent=scene==='town'?'TAP TO WALK · TAP A NEIGHBOR TO CHAT':'TAP TO WALK · TAP FURNITURE TO USE';$('townBtn').classList.toggle('active',scene==='town');$('homeBtn').classList.toggle('active',scene==='home');$('timeBtn').textContent=speed===0?'Ⅱ':speed===1?'▶':speed===2?'▶▶':'▶▶▶'}
function changeNeed(id,v){state.needs[id]=clamp(state.needs[id]+v,0,100);updateUI();save()}
function coins(v){state.coins=Math.max(0,state.coins+v);updateUI();save()}
function task(id){state.quests[id]=(state.quests[id]||0)+1;save()}
const questDefs=[{id:'meet',text:'Meet 3 neighbors',max:3,reward:70},{id:'chat',text:'Have 5 friendly chats',max:5,reward:80},{id:'fish',text:'Catch 3 fish',max:3,reward:85},{id:'garden',text:'Harvest your first flowers',max:1,reward:55},{id:'work',text:'Work 2 café shifts',max:2,reward:120}];

// ===== ORIGINAL 64-ERA INSPIRED PIXEL SPRITE ARTWORK =====
const art={};function makeArt(key,w,h,fn){if(art[key])return art[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;fn(g,w,h);return art[key]=c}
function fill(g,c,x,y,w,h){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function poly(g,c,p){g.fillStyle=c;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();g.fill()}
function ellipse(g,c,x,y,w,h){g.fillStyle=c;g.beginPath();g.ellipse(x,y,w,h,0,0,TAU);g.fill()}
function line(g,c,pts,width=2){g.strokeStyle=c;g.lineWidth=width;g.lineCap='square';g.lineJoin='miter';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke()}
function strokeRect(g,c,x,y,w,h,s=2){g.strokeStyle=c;g.lineWidth=s;g.strokeRect(x,y,w,h)}
function specks(g,seed,w,h,count,colors){for(let i=0;i<count;i++){const a=hash(seed*11+i*13.18),b=hash(seed*17+i*67.1);fill(g,colors[i%colors.length],a*w,b*h,1+Math.floor(hash(i+seed)*3),1+Math.floor(hash(i*7+seed)*2))}}

function rr(g,c,x,y,w,h,r=5,edge=null){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=2;g.stroke()}}
function ov(g,c,x,y,rx,ry,edge=null){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=2;g.stroke()}}
function tone(hex,amount){const n=parseInt(String(hex).replace('#',''),16)||0;return '#'+[n>>16&255,n>>8&255,n&255].map(v=>Math.min(255,Math.max(0,Math.round(amount>0?v+(255-v)*amount:v*(1+amount)))).toString(16).padStart(2,'0')).join('')}
function smoothLine(g,c,a,w=2){g.strokeStyle=c;g.lineWidth=w;g.lineJoin='round';g.lineCap='round';g.beginPath();g.moveTo(...a[0]);for(let i=1;i<a.length;i++)g.lineTo(...a[i]);g.stroke()}

function charArt(o,dir='front',frame=0,emote='neutral'){
 const key=['C8',o.id,o.name,o.skin,o.hair,o.outfit,o.kind,o.style,dir,frame,emote].join(':');
 return makeArt(key,96,132,g=>{
 const skin=o.skin||'#edbb9c',hair=o.hair||'#594038',coat=o.outfit||'#ec96ad',deep=tone(hair,-.28),shine=tone(hair,.27),darkCoat=tone(coat,-.22),lightCoat=tone(coat,.23),step=frame%2?3:0;
 for(const sign of [-1,1]){let x=48+sign*12,y=sign*step;
  rr(g,skin,x-5,99+y,10,19,3,'#b88877');rr(g,'#fff3df',x-6,113+y,12,5,2);
  rr(g,'#68536a',x-10,117+y,21,8,4,'#433a50');fill(g,'#bea8b9',x-6,120+y,10,2);
 }
 if(o.kind==='overalls'){rr(g,darkCoat,29,76,38,36,9,'#654e60');rr(g,coat,32,77,32,32,7);
  rr(g,'#699cc3',35,87,26,24,5,'#467393');rr(g,'#8fc4dd',39,88,18,12,3);
  for(let x of [37,57]){smoothLine(g,'#ffe4a2',[[x,80],[x,89]],3);ov(g,'#ffdb8f',x,90,2,2)}
 }else if(o.kind==='apron'){rr(g,darkCoat,30,76,36,38,9);rr(g,coat,33,78,30,33,7);
  poly(g,'#f8ecd8',[[39,85],[57,85],[61,110],[35,110]]);rr(g,'#d7b48e',42,99,12,8,2);
 }else if(o.kind==='sweater'){rr(g,darkCoat,29,77,38,34,9);rr(g,coat,32,78,32,31,7);
  rr(g,lightCoat,35,79,26,8,3);for(let j=0;j<3;j++)smoothLine(g,darkCoat,[[36,92+j*5],[59,92+j*5]],1);
 }else{poly(g,'#705762',[[38,78],[58,78],[69,112],[27,112]]);
  poly(g,darkCoat,[[38,78],[58,78],[66,110],[30,110]]);poly(g,coat,[[39,79],[57,79],[63,108],[33,108]]);
  poly(g,lightCoat,[[39,82],[44,82],[39,105],[34,105]]);
  smoothLine(g,'#fff0d8',[[34,107],[62,107]],2);
 }
 for(const side of [-1,1]){let x=48+side*24,move=side*step;
  rr(g,darkCoat,x-8,77+move,16,22,6,'#795b65');rr(g,coat,x-6,79+move,12,17,5);
  rr(g,skin,x-5,95+move,10,9,4);fill(g,lightCoat,x-6,92+move,12,3);
 }
 rr(g,skin,43,66,10,15,4);ov(g,'#fff4e6',48,79,11,5);ov(g,'#ffe1a1',48,91,3,3);
 ov(g,deep,48,47,38,40);ov(g,hair,48,46,35,38);ov(g,shine,41,29,19,7);
 if(dir==='back'){ov(g,hair,48,50,32,34);smoothLine(g,shine,[[30,29],[45,23],[60,29]],3)}
 else{
  ov(g,'#a77970',48,49,32,35);ov(g,skin,48,47,30,33);
  ov(g,tone(skin,.17),40,39,23,22);
  for(const side of [-1,1])ov(g,skin,48+side*30,49,5,7);
  for(const x of dir==='side'?[39,56]:[36,60]){
   ov(g,'#71545e',x,52,8,10);ov(g,'#fff9f4',x,51,7,9);
   ov(g,o.id==='jun'?'#5b9289':o.id==='bea'?'#9472ab':'#68536c',x,53,4.5,7);
   ov(g,'#292a3a',x,54,3.4,5.5);ov(g,'#fff',x-2,49,2.2,2.2);fill(g,'#fff',x+2,56,2,2);
   if(emote==='happy'){ov(g,skin,x,51,9,11);smoothLine(g,'#78535f',[[x-7,51],[x,48],[x+7,51]],2.5)}
   smoothLine(g,deep,[[x-6,39],[x+1,38],[x+6,40]],2.2);
  }
  ov(g,'#edacaa',25,63,7,3);ov(g,'#edacaa',71,63,7,3);ov(g,'#ba8a7b',48,61,3,2);
  if(emote==='surprised')ov(g,'#a75c67',48,71,4,5);
  else smoothLine(g,'#a46270',emote==='happy'?[[40,69],[48,75],[56,69]]:[[43,70],[48,72],[53,70]],2.3);
  poly(g,deep,[[15,37],[21,21],[34,12],[57,12],[74,22],[81,36],[70,37],[59,32],[48,28],[36,36],[23,42]]);
  poly(g,hair,[[18,34],[23,22],[37,16],[57,15],[71,22],[78,34],[68,35],[59,30],[47,29],[35,35],[25,38]]);
  if(o.style===0){ov(g,hair,20,62,9,19);ov(g,hair,76,62,9,19);smoothLine(g,shine,[[26,27],[42,20],[57,21]],3)}
  else if(o.style===1){poly(g,hair,[[20,27],[40,15],[68,21],[78,32],[63,28],[47,35],[29,37]]);smoothLine(g,shine,[[26,25],[42,19],[58,23]],3)}
  else if(o.style===2){poly(g,hair,[[19,35],[25,21],[35,18],[42,11],[50,18],[59,12],[74,23],[80,36],[68,33],[57,28],[48,33],[35,38]]);smoothLine(g,shine,[[29,23],[42,17],[49,19]],2.5)}
  else if(o.style===3){ov(g,deep,83,51,14,21);ov(g,hair,83,51,11,18);ov(g,'#f9daa2',74,35,6,4);smoothLine(g,shine,[[27,26],[44,20],[57,22]],2.8)}
  else{for(let x of [21,75]){ov(g,deep,x,18,15,15);ov(g,hair,x,17,12,12);ov(g,shine,x-4,12,5,3)}}
  if(['mabel','rosie','bea'].includes(o.id)){const ribbon=o.id==='bea'?'#f2d47e':'#f6a0bc';ov(g,ribbon,72,29,7,4);ov(g,ribbon,84,27,7,4);ov(g,'#fff4db',78,28,4,4)}
  if(o.id==='oliver'){rr(g,'#fff6e7',26,8,44,15,7,'#d4bdab');for(let x of [34,48,62])ov(g,'#fffefa',x,8,12,9)}
  if(o.id==='finn'){ov(g,'#ecc980',48,16,34,7);rr(g,'#eace8e',29,0,38,18,7)}
 }
 if(o.kind==='dress'){for(const [x,y] of [[46,94],[51,91],[54,95],[50,98]])ov(g,'#fff4d7',x,y,2,2);ov(g,'#eeb85b',50,94,2,2)}
 });
}
function foliageArt(kind=0){return makeArt('tree8'+kind,130,185,g=>{
 const blossom=kind===2,colors=blossom?['#ae5a89','#e18cb5','#f4bcd6','#ffdfeb']:kind===1?['#28694c','#399a64','#76c680','#c3eaa0']:['#296751','#3c9761','#70c578','#b6e795'];
 ov(g,'#37625055',65,177,46,8);
 poly(g,'#6e5244',[[54,89],[73,89],[75,174],[53,174]]);poly(g,'#a77953',[[58,90],[68,88],[69,172],[58,172]]);
 smoothLine(g,'#d4ae7a',[[61,102],[61,163]],3);
 poly(g,'#795c4a',[[60,124],[29,92],[33,84],[65,111],[96,86],[103,92],[68,133]]);
 const clusters=[[33,90,25],[81,91,26],[26,65,22],[108,68,24],[48,62,32],[79,62,30],[63,37,31],[33,42,20],[100,40,20],[65,78,30]];
 clusters.forEach(([x,y,r])=>{ov(g,colors[0],x+2,y+5,r+3,r*.8);ov(g,colors[1],x,y,r,r*.79);ov(g,colors[2],x-4,y-6,r*.88,r*.64)});
 for(let i=0;i<48;i++){let a=i*2.399,r=18+hash(i*13+kind)*44,x=65+Math.cos(a)*r,y=64+Math.sin(a)*r*.58;if(x<8||x>122||y<16||y>112)continue;let z=2+hash(i*7)*4;ov(g,i%4===0?colors[3]:colors[2],x,y,z*1.8,z*.7)}
 for(let i=0;i<11;i++){let a=i*2.4,x=65+Math.cos(a)*(20+hash(i+7)*31),y=61+Math.sin(a)*29;if(blossom){ov(g,'#ffe6ea',x,y,5,4);ov(g,'#e7c46e',x+1,y,2,2)}else if(i%2===0){ov(g,kind===1?'#f9a65e':'#f6d267',x,y,4,5);ov(g,'#fff5cb',x-1,y-2,1,2)}}
 });}
function houseArt(kind){return makeArt('house'+kind,198,180,g=>{
 const schemes=[['#f5bca0','#d96c7a','#a95660'],['#ffe0a1','#679ac8','#3f75aa'],['#b2d9cb','#a992d1','#846aaf'],['#fad0c3','#da9eb3','#af7b9c']];const [wall,roof,deep]=schemes[kind%4];
 ellipse(g,'#294c4050',96,165,90,12);
 // deep side elevation, with clear isometric pitch
 poly(g,'#8f736c',[[150,62],[185,44],[184,135],[151,153]]);
 poly(g,'#d29c86',[[150,64],[182,46],[183,132],[151,151]]);
 poly(g,wall,[[23,70],[148,70],[148,150],[23,150]]);
 poly(g,'#fff2d2',[[19,147],[150,147],[153,155],[16,155]]);
 // vertical clapboards and shaded edges
 for(let y=78;y<148;y+=10){fill(g,'#e9b7a055',25,y,120,1);fill(g,'#fff6de88',27,y+2,118,1)}
 fill(g,'#e6f0d4',22,71,4,79);fill(g,'#e6f0d4',145,71,4,79);
 // unique 2.5D roof: distinct front and side facets
 poly(g,'#603d50',[[10,75],[52,25],[128,23],[170,73],[153,78],[126,43],[54,41],[28,79]]);
 poly(g,deep,[[126,26],[172,63],[184,51],[147,14]]);
 poly(g,roof,[[13,72],[53,24],[128,24],[161,71],[148,71],[124,41],[53,40],[27,77]]);
 poly(g,'#f6d6b6',[[53,40],[124,40],[147,72],[28,72]]);
 poly(g,roof,[[13,70],[53,23],[127,23],[147,31],[52,31],[26,79]]);
 for(let i=0;i<10;i++){line(g,i%3===0?'#fff2d777':'#a95e6955',[[22+i*12,66],[53+i*8,31]],1)}
 line(g,'#fff5df',[[22,72],[53,38],[128,38],[154,72]],3);
 // little gable window
 fill(g,'#fff2d7',75,49,21,16);fill(g,'#81c9cb',78,52,15,10);fill(g,'#fff9df',84,52,2,11);
 // two windows, curtains, shutters, planter boxes
 for(const x of [36,118]){
  fill(g,'#6c6b69',x-3,93,25,30);fill(g,'#fff9d7',x-4,90,26,31);fill(g,'#74b7c4',x,94,18,22);
  fill(g,'#b2e7db',x+2,95,6,15);fill(g,'#fff4de',x+8,94,2,23);fill(g,'#fff4de',x,104,18,2);
  fill(g,deep,x-9,92,5,29);fill(g,deep,x+22,92,5,29);
  fill(g,'#795e5c',x-5,117,31,6);fill(g,'#3e8d5c',x-4,115,30,5);
  for(let j=0;j<5;j++)fill(g,['#fa7fa6','#ffe18e','#fff7d5'][j%3],x-3+j*6,114-(j%2)*3,4,4);
 }
 // door has actual trim & window
 fill(g,'#ae755f',78,105,30,45);fill(g,'#fff6dd',75,102,35,49);fill(g,deep,80,108,25,41);fill(g,'#e8ad87',83,111,19,35);
 fill(g,'#85c6d1',87,113,11,12);fill(g,'#fff3dd',92,113,2,12);
 fill(g,'#ffe3a5',99,132,3,3);
 fill(g,'#c8b395',64,151,58,7);fill(g,'#f4dec0',58,156,70,7);
 // awning over door: scalloped canvas
 fill(g,roof,70,93,42,7);for(let i=0;i<5;i++)fill(g,i%2?'#fff2d0':roof,71+i*8,98,8,5);
 // chimneys and aerial details
 fill(g,'#735561',126,13,14,25);fill(g,'#cc9888',129,14,12,20);fill(g,'#edc5ab',124,13,17,5);
 fill(g,'#f8e5ba',18,75,10,4);fill(g,'#f8e5ba',146,75,10,4);
 // mailbox and flower pot
 fill(g,'#785b58',155,126,4,28);fill(g,'#fff5cc',151,123,14,10);fill(g,'#f0849e',162,124,3,6);
 fill(g,'#c97b6c',31,142,10,11);fill(g,'#378d62',28,135,16,9);fill(g,'#f6b68e',30,132,5,4);fill(g,'#ff93ad',36,130,4,4);
 });}
function stallArt(){return makeArt('stall',104,88,g=>{ellipse(g,'#285e4b66',51,80,43,6);fill(g,'#875a47',10,36,5,42);fill(g,'#875a47',90,36,5,42);fill(g,'#a57453',10,60,85,17);fill(g,'#eac58d',14,60,78,4);poly(g,'#5a5260',[[7,37],[21,12],[84,12],[97,37]]);for(let j=0;j<6;j++){const x=8+j*15;poly(g,j%2?'#fff2d4':'#f88ba3',[[21+j*11,13],[28+j*10,13],[x+16,37],[x,37]])}for(let j=0;j<6;j++){fill(g,['#ffbd5f','#ff796c','#a6d67b'][j%3],22+j*11,57-(j%2)*3,7,7);fill(g,'#4b945a',24+j*11,52-(j%2)*3,3,4)}fill(g,'#e6b47b',13,69,75,5)})}
function lampArt(){return makeArt('lamp',42,106,g=>{ellipse(g,'#315a4d77',21,101,18,4);fill(g,'#315a61',17,21,8,78);fill(g,'#44787b',19,26,3,72);fill(g,'#37565e',9,21,24,5);poly(g,'#31525b',[[10,24],[12,12],[20,7],[30,12],[33,24]]);poly(g,'#e9bd74',[[14,21],[17,13],[26,13],[29,21]]);fill(g,'#fff5bc',18,15,7,6);fill(g,'#31525b',17,6,9,3);fill(g,'#f9d28a',19,1,5,6)})}
function benchArt(){return makeArt('bench',100,64,g=>{ellipse(g,'#335b4b66',52,57,41,6);for(let x of [19,74])fill(g,'#546360',x,33,5,27);fill(g,'#4a5c57',17,18,64,7);fill(g,'#c78c59',14,16,70,7);fill(g,'#e4b876',14,16,70,3);fill(g,'#c78c59',16,26,68,6);fill(g,'#805742',18,36,66,7);fill(g,'#dba675',18,34,63,6);fill(g,'#ecbe8a',19,34,62,2)})}
function shrubArt(type=0){return makeArt('shrub'+type,56,43,g=>{ellipse(g,'#315b4944',27,38,24,4);for(let j=0;j<7;j++){const x=12+(j*11)%34,y=20+hash(j+type)*11;ellipse(g,'#2f6e4d',x,y,11,9);ellipse(g,(['#79ba65','#8ccc77','#63ac5f'][j%3]),x,y-3,10,7)}for(let j=0;j<5;j++){const x=9+j*9,y=14+(j%2)*12;fill(g,type===1?'#f3b0d1':j%2?'#ffcd75':'#f9a6ab',x,y,4,4)}})}
function flowerArt(n=0){return makeArt('flower'+n,32,36,g=>{fill(g,'#4a944d',15,14,3,18);fill(g,'#77be5b',10,23,5,4);fill(g,'#77be5b',18,27,5,4);const c=['#ff7fa5','#fee088','#a698ea','#f3f0dc','#ffae61'][n%5];for(const [x,y] of [[11,8],[18,8],[11,15],[18,15],[14,5]])fill(g,c,x,y,6,6);fill(g,'#f8b84a',14,11,7,7);fill(g,'#fff3d4',15,12,2,2)})}
function grassTile(){return makeArt('grass',96,96,g=>{fill(g,'#78ba70',0,0,96,96);for(let i=0;i<34;i++){const x=hash(i*28)*95,y=hash(i*11+6)*95;fill(g,['#86c579','#68ad68','#95ce7a','#71b369'][i%4],x,y,4+(i%4)*2,2+(i%3))}for(let i=0;i<13;i++){const x=hash(i*48+4)*95,y=hash(i*8+34)*95;fill(g,'#4f9761',x,y,2,5);fill(g,'#b3d78e',x+2,y-1,2,3)}return g})}
function floorTile(){return makeArt('floor',64,64,g=>{fill(g,'#e6bc80',0,0,64,64);for(let j=0;j<4;j++)for(let i=0;i<3;i++){const y=j*16,x=i*24-(j%2)*12;fill(g,'#b78962',x,y,23,1);fill(g,'#f7d59c',x+1,y+2,20,2);fill(g,'#dbab72',x+18,y+7,2,6)}})}

const objects=[];
function put(type,x,y,opts={}){const obj={type,x,y,...opts};objects.push(obj);return obj}
function buildTown(){objects.length=0;
 for(const [x,y,type] of [[385,470,0],[925,455,1],[385,1070,2],[1060,970,3]])put('house',x,y,{kind:type,label:['Your Cottage','Honeybun Café','Storybook Library','Town Hall'][type],action:['home','cafe','library','hall'][type]});
 put('stall',530,752,{action:'market'});put('pond',940,1250,{action:'fish'});put('garden',763,416,{action:'garden'});
 put('bench',730,780);put('bench',375,812);put('bench',1050,615);
 for(const [x,y] of [[610,530],[890,775],[495,1095],[1080,1165],[350,675]])put('lamp',x,y);
 for(const [x,y,n] of [[270,430,0],[265,830,1],[230,1100,0],[920,240,2],[1100,335,0],[1190,650,1],[1210,1100,0],[660,290,0],[560,1120,2],[870,1160,1],[1300,1250,0],[580,980,1],[147,650,0]])put('tree',x,y,{kind:n});
 const shrubs=[[250,590],[486,544],[1080,525],[630,405],[905,600],[1032,790],[300,995],[805,920],[1160,850],[650,1025],[1054,1087],[765,1071],[1180,1300]];
 shrubs.forEach(([x,y],i)=>put('shrub',x,y,{kind:i%2}));
 for(let i=0;i<94;i++){let x=125+hash(i*31)*1130,y=300+hash(i*37+7)*1050;
  if((Math.abs(x-610)<120&&Math.abs(y-650)<120)||(Math.abs(x-790)<160&&Math.abs(y-750)<60)||(Math.abs(x-955)<130&&Math.abs(y-1280)<120))continue;
  put('flower',x,y,{kind:i%5,scale:.60+(i%3)*.21});}
 NPCS.forEach(n=>{n.cx=n.x;n.cy=n.y;n.direction=0;n.moving=0;n.emotion='neutral';n.emotionUntil=0;n.wanderAngle=0;n.wanderDelay=0;});
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
 ellipse(g,'#caad82',604,650,131,99);ellipse(g,'#f5d89f',604,642,122,91);
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
 fill(g,'#5e6b73',158,180,864,25);fill(g,['#c5daba','#f2ccdf','#a5cedb','#f3dab2'][state.homeStyle%4],169,120,840,87);
 for(let x=175;x<1000;x+=34){fill(g,'#9bbb9a',x,128,2,75);fill(g,'#f5f7d7',x+3,131,2,71)}
 fill(g,'#f3e2ac',165,195,850,14);fill(g,'#af9779',169,1133,845,13);
 for(const x of [300,820]){fill(g,'#b89d7a',x-55,125,111,90);fill(g,'#fff7d9',x-48,128,97,78);fill(g,'#8ac7d9',x-42,134,86,66);fill(g,'#fef6cd',x,134,6,66);fill(g,'#fef6cd',x-42,165,86,6);for(let k=0;k<3;k++)fill(g,'#fff5c6',x-36+k*30,142,15,2)}
 fill(g,'#bd735c',560,152,92,61);fill(g,'#e0a16f',568,153,76,55);fill(g,'#ffe3a1',634,180,4,5);
 ellipse(g,'#d99a78',579,524,209,120);ellipse(g,'#f3d6ad',579,516,194,112);ellipse(g,'#b8cfa5',582,524,158,85);
}
function drawStatic(obj,g){
 const {type,x,y}=obj;
 if(type==='house')drawArt(g,houseArt(obj.kind),x,y,1.50);
 if(type==='stall')drawArt(g,stallArt(),x,y,1.60);
 if(type==='tree')drawArt(g,foliageArt(obj.kind),x,y,1.14);
 if(type==='shrub')drawArt(g,shrubArt(obj.kind),x,y,.85);
 if(type==='flower')drawArt(g,flowerArt(obj.kind),x,y,obj.scale||.8);
 if(type==='bench')drawArt(g,benchArt(),x,y,1.24);
 if(type==='lamp')drawArt(g,lampArt(),x,y,1.1);
 if(type==='pond'){const s=Math.sin(tick*2)*2;ellipse(g,'#d8fcf3',x+30,y-40+s,26,2)}
 if(type==='garden'){
  for(let i=0;i<8;i++){const xx=x-99+i*24;fill(g,'#fff5de',xx,308,12,7)}
  fill(g,'#fff3d1',703,299,84,15);fill(g,'#5c745e',716,302,59,2);
 }
}
function drawHomeFurniture(g){
 // All the pieces are painted sprites with thickness and drop shadows.
 drawFurniture(g,'bed',332,430);drawFurniture(g,'sofa',803,489);drawFurniture(g,'kitchen',840,309);drawFurniture(g,'books',342,314);
 for(let i=0;i<state.placed.length;i++){const f=state.placed[i];drawFurniture(g,f.kind,Math.abs(f.x||0)<40?575+(f.x||0)*28:(f.x||540),Math.abs(f.z||0)<40?600+(f.z||0)*25:(f.z||500))}
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
    if(Math.hypot(player.x-o.x,player.y-o.y)<145)drawName(ctx,o.name,o.x,o.y-151);
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
function resize(){W=Math.max(280,innerWidth);H=Math.max(350,innerHeight);DPR=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);canvas.style.width=W+'px';canvas.style.height=H+'px';worldScale=clamp(W/530,.69,1.17);ctx.imageSmoothingEnabled=false}
function goTo(dest,after){player.target={x:dest.x,y:dest.y,after};if(Math.hypot(dest.x-player.x,dest.y-player.y)<28){const t=player.target;player.target=null;if(t.after)t.after()}}
function goScene(next){if(talk)closeTalk();closeModal();scene=next;player.target=null;if(next==='home'){player.x=575;player.y=670;cam.x=575;cam.y=570;}else{player.x=566;player.y=621;cam.x=566;cam.y=620;}updateUI();save();notify(next==='home'?'Home sweet home! 🏡':'Out into the sunshine! 🌷')}
function clickWorld(x,y){if(modal||talk)return;
 const wx=(x-W/2)/worldScale+cam.x,wy=(y-H*.54)/worldScale+cam.y;
 if(scene==='home'){
  if(wy<220){notify('A lovely sunny view out of the window!');return}
  const bounds={x:clamp(wx,225,947),y:clamp(wy,275,738)};
  const fixed=[{kind:'bed',x:332,y:430,act:()=>{changeNeed('energy',70);notify('A wonderful nap! 💤')}},{kind:'sofa',x:803,y:489,act:()=>{changeNeed('fun',25);notify('Cozy sofa time! 💗')}},{kind:'kitchen',x:840,y:309,act:()=>{if(state.coins<10)return notify('A small meal costs 10 coins.');coins(-10);changeNeed('hunger',42);notify('Homemade comfort food! 🍞')}},{kind:'books',x:342,y:314,act:()=>{changeNeed('fun',15);notify('A lovely story! 📚')}}];
  const near=fixed.find(o=>Math.hypot(wx-o.x,wy-(o.y-35))<80);
  goTo(near?{x:near.x+54,y:near.y+28}:bounds,near?.act);return;
 }
 const character=NPCS.map(n=>({n,dist:Math.hypot(wx-n.x,wy-(n.y-60))})).sort((a,b)=>a.dist-b.dist)[0];
 if(character&&character.dist<84){const n=character.n;goTo({x:n.x-46,y:n.y+23},()=>openTalk(n.id));return}
 const actions=objects.filter(o=>o.action).map(o=>({o,dist:Math.hypot(wx-o.x,(wy-(o.type==='house'?o.y-100:o.y-30)))})).sort((a,b)=>a.dist-b.dist);
 const hit=actions[0];if(hit&&hit.dist<(hit.o.type==='house'?150:hit.o.type==='pond'?135:90)){
  const o=hit.o,approach={x:o.x-50,y:o.y+14};goTo(approach,()=>perform(o.action));return;
 }
 goTo({x:clamp(wx,65,1460),y:clamp(wy,200,1440)});
}
function perform(action){if(action==='home')return goScene('home');if(action==='cafe')return cafe();if(action==='library'){changeNeed('fun',16);notify('You found a beautiful new story! 📖');return}if(action==='hall')return townHall();if(action==='market')return market();if(action==='garden')return garden();if(action==='fish')return fishing();}
function update(dt){tick+=dt;
 if(!talk&&!modal){let next=player.target;if(next){const dx=next.x-player.x,dy=next.y-player.y,d=Math.hypot(dx,dy),step=Math.min(d,dt*178);if(d>step+3){player.x+=dx/d*step;player.y+=dy/d*step;player.facing=dy< -25?'back':Math.abs(dx)>Math.abs(dy)*1.1?'side':'front';}else{player.x=next.x;player.y=next.y;player.target=null;player.facing='front';if(next.after)next.after()}}}
 if(scene==='town'){
  for(let i=0;i<NPCS.length;i++){const n=NPCS[i];if(talk===n.id)continue;n.wanderDelay-=dt;
   if(n.wanderDelay<=0){n.wanderDelay=2+hash(Math.floor(tick*.5+i)*3.2)*4;n.wanderAngle=hash(tick*2.3+i*5)*TAU;n.moving=.8+hash(i+tick)*1.3}
   if(n.moving>0){n.moving-=dt;let dx=Math.cos(n.wanderAngle),dy=Math.sin(n.wanderAngle);n.x+=dx*dt*14;n.y+=dy*dt*14;
    if(Math.hypot(n.x-n.cx,n.y-n.cy)>60){n.wanderAngle+=Math.PI;n.x-=dx*dt*28;n.y-=dy*dt*28};n.facing=dy<-.15?'back':Math.abs(dx)>Math.abs(dy)?'side':'front';}
  }
 }
 if(speed>0){state.minute+=dt*speed*2.0;while(state.minute>=1440){state.minute-=1440;state.day++;if(state.day%7===1)state.season=(state.season+1)%4;notify('A bright new day begins! 🌞');save()}
  if(Math.floor(tick)%3===0){const rate=dt*speed*.015;state.needs.hunger=clamp(state.needs.hunger-rate*2.2,0,100);state.needs.energy=clamp(state.needs.energy-rate*1.4,0,100)}}
 const focus=talk?NPCS.find(n=>n.id===talk):null;const aimX=focus?(focus.x+player.x)/2:player.x,aimY=focus?focus.y-26:player.y;
 cam.x+=(aimX-cam.x)*clamp(dt*4,0,1);cam.y+=(aimY-cam.y)*clamp(dt*4,0,1);
}
function loop(now){if(!last)last=now;const dt=Math.min(.046,(now-last)/1000);last=now;try{update(dt);drawScene()}catch(e){console.error(e);notify('A scene error occurred: '+e.message)}requestAnimationFrame(loop)}
function closeModal(){modal=null;$('modal').classList.add('hidden')}
function showModal(kind,body){closeTalk();modal=kind;$('modalContent').innerHTML=body;$('modal').classList.remove('hidden')}
function btn(label,fn){return `<button class="btn" data-act="${fn}">${label}</button>`}
function buttonClick(e){const b=e.target.closest('[data-act]');if(!b)return;handleAction(b.dataset.act,b.dataset.id||'')}
function openTalk(id){const n=NPCS.find(a=>a.id===id);if(!n)return;closeModal();talk=id;n.emotion='happy';n.emotionUntil=tick+1.2;const r=state.relations[id]||0;
 $('talkName').textContent=n.name;$('talkRole').textContent=n.job+' • ♥ '+r;$('talkPortrait').textContent=n.emoji;
 $('talkText').textContent=n.lines[Math.floor(rand(0,n.lines.length))];$('conversation').classList.remove('hidden');$('game').classList.add('talking');
 $('talkActions').innerHTML='<button data-act="chat">💬 Chat</button><button data-act="compliment">💗 Compliment</button><button data-act="gift">🎁 Gift</button><button data-act="bye">See you!</button>';
 $('emote').textContent='💗';$('emote').hidden=false;state.met=state.met||[];if(!state.met.includes(id)){state.met.push(id);task('meet')}changeNeed('social',7);save()}
function closeTalk(){talk=null;$('conversation').classList.add('hidden');$('game').classList.remove('talking');$('emote').hidden=true}
function respond(kind){const n=NPCS.find(o=>o.id===talk);if(!n)return;
 const r=state.relations[n.id]||0;let gain=0;
 if(kind==='chat'){gain=7;task('chat');$('talkText').textContent=n.lines[Math.floor(rand(0,n.lines.length))];n.emotion='happy';$('emote').textContent='✨';changeNeed('social',13)}
 else if(kind==='compliment'){gain=12;n.emotion='happy';$('talkText').textContent=['Aw, you just made my whole day!','You are so sweet. I might blush!','That means the world to me!'][Math.floor(rand(0,3))];$('emote').textContent='💕'}
 else if(kind==='gift'){if(state.coins<20){$('talkText').textContent='Even a friendly hello is a gift, you know!';return}coins(-20);gain=20;n.emotion='surprised';$('talkText').textContent='For me?! Oh my goodness, I love it!';$('emote').textContent='🎁'}
 state.relations[n.id]=Math.min(100,r+gain);state.hearts+=gain;n.emotionUntil=tick+2.1;$('talkRole').textContent=n.job+' • ♥ '+state.relations[n.id];$('heartText').textContent=state.hearts;save();
}
function people(){showModal('people',`<h2>💌 Meet the Neighbors</h2><p>Everyone has a life, a story, and a friendship to build. Find a neighbor to chat in the actual village.</p>${NPCS.map(n=>`<div class="card"><div><b>${n.emoji} ${n.name} · ♥ ${state.relations[n.id]||0}</b><small>${n.job} · ${n.trait}</small></div><button data-act="find" data-id="${n.id}">Find</button></div>`).join('')}`)}
function journal(){const done=questDefs.filter(q=>(state.quests[q.id]||0)>=q.max).length;showModal('journal',`<h2>📜 Your Little Journal</h2><p>${done} of ${questDefs.length} village adventures completed. Claim your rewards to grow your little life!</p>${questDefs.map(q=>{const n=state.quests[q.id]||0,claimed=state.quests[q.id+'_claimed'];return `<div class="card"><div><b>${q.text}</b><small>${Math.min(q.max,n)} / ${q.max} · 🪙 ${q.reward}</small></div><button data-act="claim" data-id="${q.id}" ${n<q.max||claimed?'disabled':''}>${claimed?'✓ Done':'Claim'}</button></div>`}).join('')}`)}
function cafe(){showModal('cafe',`<h2>🥐 Honeybun Café</h2><p>Oliver needs help serving the lunchtime crowd. A short shift earns coins and lifts your spirits.</p><div class="card"><b>1 cozy café shift</b><b>🪙 +45</b></div>${btn('Work a shift 🥐','work')} ${btn('Have a treat (10 🪙)','eat')}`)}
function townHall(){showModal('hall',`<h2>🏛️ Maplewood Town Hall</h2><p>The village is growing around you. Meet six neighbors, spruce up your home, and complete the journal to become part of its story.</p>${btn('View your journal','journal')}`)}
function market(){showModal('market',`<h2>🍓 Rosie’s Little Market</h2><p>Fresh fruit and lovely things for a cozy home.</p><div class="grid"><div class="item"><span class="emoji">🍑</span><strong>Peach snack</strong><small>10 coins</small>${btn('Eat','eat')}</div><div class="item"><span class="emoji">🌻</span><strong>Flower seed</strong><small>8 coins</small>${btn('Buy','seed')}</div><div class="item"><span class="emoji">🪴</span><strong>Plant</strong><small>25 coins</small>${btn('Buy','buy-plant')}</div></div>`)}
function garden(){showModal('garden',`<h2>🌱 Community Garden</h2><p>Plant little flowers, care for them, and harvest blooms for your cottage.</p><div class="grid">${(state.garden||[0,0,0,0]).map((n,i)=>`<div class="item"><span class="emoji">${n===2?'🌸':n===1?'🌱':'🟫'}</span><strong>Plot ${i+1}</strong><small>${n===2?'Ready!':n===1?'Growing':'Empty'}</small><button class="btn" data-act="plot" data-id="${i}">${n===2?'Harvest':n===1?'Water':'Plant'}</button></div>`).join('')}</div><p>Planting is free in the community garden!</p>`)}
function fishing(){showModal('fish',`<h2>🎣 Fishing at Lily Pond</h2><p>Watch the bobber and tap when it crosses the green zone!</p><div style="margin:24px 0 18px;height:30px;background:#b5d2bd;border:3px solid #91b1a6;position:relative"><div style="height:100%;width:26%;margin-left:38%;background:#7ddda4;border-left:3px solid white;border-right:3px solid white"></div><div id="bobber" style="position:absolute;top:-4px;bottom:-4px;width:6px;background:#ed7091;left:0"></div></div><button class="btn" data-act="catch" style="width:100%">🎣 Reel it in!</button>`);}
function decorate(){if(scene!=='home'){notify('Head home to decorate! 🏡');goScene('home')}
 showModal('decor',`<h2>🪑 Your Cozy Furniture</h2><p>Buy furniture and it will appear inside your home. Your choices are saved!</p><h3>Wallpaper</h3><div class="swatches">${['#c5daba','#f2ccdf','#a5cedb','#f3dab2'].map((s,i)=>`<button data-act="wall" data-id="${i}" class="swatch" style="background:${s}" aria-label="Wallpaper ${i+1}"></button>`).join('')}</div><div class="grid">${furnitureTypes.map(f=>`<div class="item"><span class="emoji">${f.emoji}</span><strong>${f.name}</strong><small>🪙 ${f.cost}</small><button class="btn" data-act="buy" data-id="${f.id}">Buy</button></div>`).join('')}</div>`)}
function style(){const outfit=['#f18bb0','#8cb2e5','#e8bc65','#83c5ad','#a29be2','#f2a577'],hair=['#453536','#895b47','#d3a76b','#393546','#b67360','#dba66a'],skin=['#f5dbb3','#eeb892','#c88d63','#8e5943','#5f4033'];
 showModal('style',`<h2>🎀 Make Your Own Villager</h2><p>A little pixel person with a style all their own.</p><label>Your name</label><input id="nameInput" class="input" maxlength="18" value="${escapeHtml(state.name)}"/><h3>Outfit</h3><div class="swatches">${outfit.map(s=>`<button class="swatch" style="background:${s}" data-act="set-outfit" data-id="${s}"></button>`).join('')}</div><h3>Hair</h3><div class="swatches">${hair.map(s=>`<button class="swatch" style="background:${s}" data-act="set-hair" data-id="${s}"></button>`).join('')}</div><h3>Skin</h3><div class="swatches">${skin.map(s=>`<button class="swatch" style="background:${s}" data-act="set-skin" data-id="${s}"></button>`).join('')}</div>${btn('Save my look 🌷','save-look')}`)}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
function menu(){showModal('menu',`<h2>⚙️ Your Village</h2><p>Hearth & Harbor: Pixel Village v0.7.0 — an original 2.5D retro life simulation. Your progress saves on this device.</p>${btn('💾 Save now','save')} ${btn('📤 Export backup','export')} ${btn('📥 Import backup','import')}<hr><p><strong>How to play</strong><br>Tap a destination to walk. Tap neighbors, homes, the café, fruit stall, garden and pond to interact. Use the bottom menu to explore life, style and decorating.</p><p>💚 No accounts, energy paywalls, ads or purchases.</p>`)}
function handleAction(action,id){
 if(action==='chat'||action==='compliment'||action==='gift')return respond(action);
 if(action==='bye')return closeTalk();
 if(action==='find'){closeModal();if(scene==='home')goScene('town');const n=NPCS.find(n=>n.id===id);if(n)goTo({x:n.x-50,y:n.y+20},()=>openTalk(id));return}
 if(action==='journal')return journal();
 if(action==='claim'){const q=questDefs.find(q=>q.id===id);if(!q||state.quests[q.id+'_claimed']||(state.quests[q.id]||0)<q.max)return;state.quests[q.id+'_claimed']=true;coins(q.reward);notify(`Quest complete! +${q.reward} coins ✨`);return journal()}
 if(action==='work'){task('work');coins(45);changeNeed('energy',-13);changeNeed('fun',9);notify('Delicious work! +45 coins 🥐');return cafe()}
 if(action==='eat'){if(state.coins<10)return notify('You need 10 coins!');coins(-10);changeNeed('hunger',35);notify('Sweet and delicious! 🍑');return}
 if(action==='seed'){if(state.coins<8)return notify('You need 8 coins!');coins(-8);state.inventory.push('flower-seed');save();notify('A packet of seeds! 🌻');return}
 if(action==='buy-plant')return handleAction('buy','plant');
 if(action==='wall'){state.homeStyle=Number(id)%4;save();notify('A fresh coat of cottage color! 🎨');return}
 if(action==='buy'){const f=furnitureTypes.find(f=>f.id===id);if(!f)return;if(state.coins<f.cost)return notify('Not enough coins yet!');coins(-f.cost);state.placed.push({kind:f.id,x:450+(state.placed.length%4)*80,z:600+Math.floor(state.placed.length/4)*38});save();notify(`${f.name} is waiting at home! 🪑`);return}
 if(action==='plot'){const i=Number(id),v=state.garden[i]||0;if(v===0){state.garden[i]=1;notify('Little sprouts planted! 🌱')}else if(v===1){state.garden[i]=2;notify('Your flowers are blooming! 🌸')}else{state.garden[i]=0;coins(24);task('garden');changeNeed('fun',12);notify('Beautiful harvest! +24 coins 🌼')}save();return garden()}
 if(action==='catch'){const zone=(Math.sin(tick*4)+1)/2;if(zone>=.38&&zone<=.64){const names=['Sunfish','Rainbow guppy','Golden carp','Lilyfish'];const n=names[Math.floor(rand(0,names.length))];state.fish.push(n);task('fish');coins(15);changeNeed('fun',16);notify(`You caught a ${n}! 🐟 +15`);closeModal()}else notify('Almost! The fish got away — try again!');return}
 if(action==='set-outfit'||action==='set-hair'||action==='set-skin'){const n=parseInt(id.slice(1),16);if(action==='set-outfit')state.outfit=n;else if(action==='set-hair')state.hair=n;else state.skin=n;save();return}
 if(action==='save-look'){const n=$('nameInput')?.value?.trim();if(n)state.name=n.slice(0,18);save();updateUI();closeModal();notify('Your new look is lovely! 🎀');return}
 if(action==='save'){save();notify('Your little world is saved! 💾');closeModal();return}
 if(action==='export'){save();const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hearth-and-harbor-save.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return}
 if(action==='import'){const input=document.createElement('input');input.type='file';input.accept='application/json';input.onchange=async()=>{try{const v=JSON.parse(await input.files[0].text());if(typeof v.coins!=='number'||!v.needs)throw Error('Invalid save');state={...DEF(),...v};save();location.reload()}catch(e){notify('That backup was not valid.')}};input.click()}
}
function bind(){
 canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);canvas._start={x:e.clientX,y:e.clientY}});
 canvas.addEventListener('pointerup',e=>{const a=canvas._start||{x:e.clientX,y:e.clientY};if(Math.hypot(a.x-e.clientX,a.y-e.clientY)>25)return;clickWorld(e.clientX,e.clientY)});
 $('townBtn').onclick=()=>goScene('town');$('homeBtn').onclick=()=>goScene('home');$('peopleBtn').onclick=people;$('journalBtn').onclick=journal;$('decorateBtn').onclick=decorate;$('styleBtn').onclick=style;$('menuBtn').onclick=menu;
 $('timeBtn').onclick=()=>{speed=({0:1,1:2,2:3,3:0})[speed];updateUI()};$('talkClose').onclick=closeTalk;$('talkActions').addEventListener('click',buttonClick);
 $('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal();else buttonClick(e)});$('closeModal').onclick=closeModal;
 addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});setInterval(save,18000);
}
function start(){buildTown();resize();bind();updateUI();cam.x=player.x;cam.y=player.y;requestAnimationFrame(loop);setTimeout(()=>$('loading').classList.add('hidden'),150);if(!state.seenWelcome){state.seenWelcome=true;save();setTimeout(()=>notify('Welcome to your pixel-perfect little life! 🌷'),800)}}
start();
})();
