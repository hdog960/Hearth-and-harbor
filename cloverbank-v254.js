/* Hearth & Harbor v2.5.4 · Cloverbank Grove.
   Original layered storybook-pixel scenery and walkable exploration markers.
   Pure scene module; gameplay state and reward rules live in game.js. */
(function(){'use strict';
const W=1200,H=1550;
const SITES=[
 {id:'berries',name:'Berry Hollow',x:422,y:1042,walkX:540,walkY:1076,icon:'🍓',desc:'Forage at the berry patch'},
 {id:'brook',name:'Whispering Brook',x:799,y:795,walkX:719,walkY:838,icon:'💧',desc:'Listen and skip stones'},
 {id:'lookout',name:'Sunbeam Lookout',x:423,y:422,walkX:539,walkY:452,icon:'🌤',desc:'Create a seasonal postcard'},
 {id:'exit',name:'Back to Maplewood',x:615,y:1375,walkX:615,walkY:1275,icon:'🏡',desc:'Follow the path home'}
];
const PALETTES=[
 {grass:'#a6d982',light:'#c4e990',deep:'#6da974',path:'#f3d4a0',stone:'#e3c38f',leaf:'#66b77d',leafLight:'#b5dc77',flower:'#f69ac3',water:'#6ccac9'},
 {grass:'#8ece79',light:'#b6df77',deep:'#66a96e',path:'#f1cf95',stone:'#d4b582',leaf:'#47a66f',leafLight:'#9fd967',flower:'#f5cb70',water:'#63bdc8'},
 {grass:'#b9cc77',light:'#d5d88a',deep:'#a4a665',path:'#efcc97',stone:'#d2ad7f',leaf:'#bd875c',leafLight:'#f1b56e',flower:'#e99b72',water:'#72bec5'},
 {grass:'#d9e6df',light:'#eef1df',deep:'#a9c7c0',path:'#e7dfc5',stone:'#b7c9bd',leaf:'#92b8ad',leafLight:'#d9ebe4',flower:'#f2d3eb',water:'#83ccd8'}
];
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const hash=(a,b=0)=>{let x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x)};
function ellipse(g,x,y,rx,ry,c){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(x,y,w,h)}
function line(g,points,c,w){g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.strokeStyle=c;g.stroke()}
function bloom(g,x,y,c,seed){rect(g,x-1,y-9,3,12,'#528e63');for(let k=0;k<5;k++){let a=k*Math.PI*2/5;ellipse(g,x+Math.cos(a)*6,y-12+Math.sin(a)*6,5,5,c)}ellipse(g,x,y-12,4,4,'#ffefb5');if(seed%4===0)ellipse(g,x+5,y-5,3,2,'#f8efd1')}
function tree(g,x,y,s,season,seed){let pal=PALETTES[season];g.save();g.translate(x,y);g.scale(s,s);
 ellipse(g,2,11,51,18,'#60845d37');rect(g,-17,-140,34,137,'#95745d');rect(g,-9,-137,8,123,'#b99070');rect(g,12,-110,5,85,'#654d45');
 // Distinct silhouettes with leafy lobes, lighter facing top-left.
 for(let k=0;k<13;k++){const a=k*2.4+hash(seed,k),r=36+hash(k,seed)*39;const xx=Math.cos(a)*r,yy=-163+Math.sin(a)*r*.57;ellipse(g,xx,yy,50,37,pal.deep)}
 for(let k=0;k<14;k++){const a=k*2.12+hash(k,seed),r=26+hash(seed,k+10)*39;const xx=Math.cos(a)*r-9,yy=-188+Math.sin(a)*r*.48;ellipse(g,xx,yy,45,30,k%3===0?pal.light:pal.leaf)}
 for(let k=0;k<22;k++){const xx=-72+hash(seed+k,6)*142,yy=-230+hash(seed+k,9)*95;rect(g,xx,yy,7,4, k%3===0?'#f9e1a0':pal.leafLight)}
 if(season===2)for(let k=0;k<8;k++)ellipse(g,-58+hash(seed,k)*116,-80+hash(seed,k+2)*70,7,4,'#e8a567');
 g.restore();}
function grassClump(g,x,y,p,seed){line(g,[[x-7,y+2],[x-10,y-7]],p.deep,2);line(g,[[x,y+3],[x+2,y-11]],p.deep,3);line(g,[[x+5,y+1],[x+11,y-5]],p.deep,2);if(seed%2)rect(g,x-4,y-2,4,2,p.light)}
function drawBackground(g,season){
 const p=PALETTES[season],gradient=g.createLinearGradient(0,0,0,H);
 gradient.addColorStop(0,p.light);gradient.addColorStop(.45,p.grass);gradient.addColorStop(1,p.deep);
 rect(g,0,0,W,H,gradient);
 // Dappled grass and shadowed moss, carefully scattered along the woodland margins.
 for(let i=0;i<145;i++){const x=hash(i,12)*W,y=hash(i,18)*H,rad=17+hash(i,20)*54;ellipse(g,x,y,rad,rad*.42,i%3===0?'#fffbd31c':'#3d825c17')}
 // Curving accessible yellow-stone trail.
 const path=[[614,1455],[617,1280],[600,1135],[601,970],[627,845],[609,680],[592,530],[610,330],[607,187]];
 line(g,path,'#b9956688',143);line(g,path,p.path,126);line(g,path,'#faeac169',94);
 // Two branches into deliberately framed discovery glades.
 line(g,[[602,1102],[543,1077],[478,1046]],'#b9956688',106);line(g,[[602,1102],[543,1077],[478,1046]],p.path,93);
 line(g,[[619,844],[704,826],[793,795]],'#b9956688',96);line(g,[[619,844],[704,826],[793,795]],p.path,81);
 line(g,[[605,523],[539,474],[469,439]],'#b9956688',105);line(g,[[605,523],[539,474],[469,439]],p.path,88);
 // The babbling brook stays outside the walkable trail, with luminous ripples.
 line(g,[[992,0],[951,188],[963,405],[941,626],[989,830],[961,1050],[1003,1330],[990,1550]],'#e9efc2',174);
 line(g,[[992,0],[951,188],[963,405],[941,626],[989,830],[961,1050],[1003,1330],[990,1550]],p.water,156);
 line(g,[[992,0],[951,188],[963,405],[941,626],[989,830],[961,1050],[1003,1330],[990,1550]],'#d1f9ed99',15);
 for(let i=0;i<24;i++){const y=i*64+21,x=970+Math.sin(y*.005)*16;ellipse(g,x,y,22,3,'#dcfff1a6');ellipse(g,x+6,y-6,7,2,'#fff8d2')}
 // Stone stepping rocks and bridge-like planks at brook's bend.
 for(let i=0;i<5;i++){const xx=785+i*38,yy=789-i*7;ellipse(g,xx,yy+8,19,7,'#448e8a55');ellipse(g,xx,yy,18,11,i%2?'#c6d1b9':'#e4d5b2');ellipse(g,xx-4,yy-4,7,3,'#f2e7cf')}
 // Scattered moss and small track stones, intentionally avoiding large UI-relevant props.
 for(let i=0;i<95;i++){const x=140+hash(i,44)*900,y=120+hash(i,63)*1320;if(Math.abs(x-610)<85||Math.hypot(x-440,y-1030)<90||Math.hypot(x-430,y-435)<100)continue;
  if(i%3===0)ellipse(g,x,y,6+hash(i,71)*8,3+hash(i,7)*3,p.stone);
  else if(i%3===1)grassClump(g,x,y,p,i);
  else bloom(g,x,y,i%2?p.flower:'#fff2bc',i);
 }
 // Foreground grove trees are outside walking space, distinct and richly layered.
 for(let i=0;i<9;i++){tree(g,100+hash(i,2)*170,190+i*140,.75+hash(i,4)*.34,season,5+i)}
 for(let i=0;i<8;i++){tree(g,1055+hash(i,7)*115,210+i*163,.78+hash(i,3)*.25,season,18+i)}
 // Fern banks and ornamental hedges on both woodland edges.
 for(let i=0;i<32;i++){const y=80+i*46,side=i%2,x=side?844+hash(i,31)*56:270+hash(i,13)*65;
  ellipse(g,x,y,24,14,p.deep);ellipse(g,x-9,y-5,16,12,p.leaf);ellipse(g,x+12,y-9,18,12,p.leafLight)}
 // Berry hollow with a woven vegetable basket and plump fruit clusters.
 ellipse(g,415,1012,112,58,'#5f986c55');
 for(let i=0;i<7;i++){const x=356+i*19,y=1010+Math.sin(i*2)*24;ellipse(g,x,y,24,22,p.deep);ellipse(g,x-8,y-5,17,14,p.leaf);
  for(let j=0;j<3;j++){let xx=x-12+j*11,yy=y-7+Math.sin(j*3+i)*9;ellipse(g,xx,yy,5,5,season===3?'#d9cced':'#de6274');ellipse(g,xx-2,yy-3,2,2,'#f9c0bb')}}
 ellipse(g,472,1095,28,9,'#826b4b44');rect(g,447,1065,50,30,'#d6a978');rect(g,450,1065,44,7,'#f2d5a1');line(g,[[451,1070],[470,1047],[491,1070]],'#8c6854',4);
 // Scenic overlook rustic seat, railing, tiny flower garden.
 ellipse(g,416,441,102,61,'#f6e9b877');rect(g,386,400,73,9,'#bd846a');rect(g,383,409,78,8,'#e9ba87');
 rect(g,397,420,9,26,'#8c634b');rect(g,445,420,9,26,'#8c634b');for(let i=0;i<7;i++)bloom(g,335+i*16,468+(i%3)*10,p.flower,i);
 // Pebble skipping nook and a tiny carved dock.
 rect(g,766,727,85,20,'#987053');for(let i=0;i<5;i++)rect(g,774+i*15,730,11,15,'#deb087');
 rect(g,773,747,7,44,'#88634b');rect(g,845,747,7,44,'#88634b');
 // Lantern posts, stepping stones and seasonal markings.
 for(const [x,y] of [[550,1190],[666,925],[550,595],[654,310]]){rect(g,x-4,y-64,8,64,'#8f674e');rect(g,x-15,y-74,30,23,'#d5a875');rect(g,x-9,y-67,18,13,'#fff0ad');rect(g,x-18,y-77,36,5,'#855d4b')}
 for(let i=0;i<32;i++){const y=120+i*42,x=611+Math.sin(i*.71)*67;ellipse(g,x,y,5+hash(i,24)*6,2.5,p.stone)}
}
let canvas=null,canvasSeason=-1;
function background(season){if(!canvas||season!==canvasSeason){canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;drawBackground(canvas.getContext('2d'),season);canvasSeason=season}return canvas}
function sign(g,x,y,text,tint,lit,tick){
 g.save();g.translate(x,y);
 ellipse(g,0,12,67,15,'#3f715233');rect(g,-3,-104,6,112,'#805d49');
 rect(g,-87,-151,174,54,'#926c59');rect(g,-82,-146,164,45,'#eacb9c');rect(g,-79,-142,158,37,lit?'#ffefcb':tint);
 g.font='bold 14px system-ui';g.textAlign='center';g.fillStyle='#385851';g.fillText(text,0,-120);
 if(lit){const q=1+Math.sin(tick*2)*.15;ellipse(g,80,-147,9*q,9*q,'#fff3b1');ellipse(g,-81,-105,5,5,'#f6c7d6')}
 g.restore();
}
function draw(g,{season=0,record={},tick=0}={}){
 g.drawImage(background(clamp(season,0,3)),0,0);
 const done=record.done||[];
 // Interactive props with a modest beacon; collected locations visually change.
 sign(g,423,1035,'BERRY HOLLOW','#e4edb8',!done.includes('berries'),tick);
 sign(g,800,794,'WHISPERING BROOK','#d1e9ed',!done.includes('brook'),tick);
 sign(g,423,438,'SUNBEAM LOOKOUT','#f2d6cf',!done.includes('lookout'),tick);
 sign(g,615,1388,'MAPLEWOOD  ↓','#f7e2ac',false,tick);
 for(let i=0;i<18;i++){const x=300+hash(i,91)*580,y=160+hash(i,37)*1200;
  const fade=.3+.35*(.5+.5*Math.sin(tick*.8+i));g.globalAlpha=fade;
  ellipse(g,x,y,2+hash(i,12)*2,2.5,'#fff9ad');g.globalAlpha=1}
}
function drawFront(g,{tick=0}={}){ // Overlay small shadows and leaflets, never obscure the player.
 for(let i=0;i<10;i++){const x=360+hash(i,42)*495,y=120+hash(i,52)*1300;
  if(Math.abs(x-600)<80)continue;g.globalAlpha=.24;ellipse(g,x+Math.sin(tick*.5+i)*3,y,8,3,'#fff9cd');g.globalAlpha=1}
}
function hit(x,y){for(const p of SITES){if(Math.hypot(x-p.x,y-(p.y-70))<(p.id==='exit'?110:92))return p}return null}
function walkable(x,y){if(x<326||x>866||y<180||y>1390)return false;
 // Large permanent berry clusters and the sign posts remain solid.
 if(x>345&&x<475&&y>966&&y<1040)return false;
 if(Math.hypot(x-800,y-744)<22)return false;
 if(Math.hypot(x-423,y-368)<28)return false;
 return true;
}
function cleanRecord(raw){const r=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
 const valid=['berries','brook','lookout'];const day=n=>Number.isInteger(n)&&n>=0&&n<=9999?n:0;
 return {day:day(r.day),done:[...new Set(Array.isArray(r.done)?r.done:[])].filter(id=>valid.includes(id)),visits:day(r.visits),
  seasonal:[...new Set(Array.isArray(r.seasonal)?r.seasonal:[])].filter(n=>Number.isInteger(n)&&n>=0&&n<=3),
  completedDay:day(r.completedDay), memories:Array.isArray(r.memories)?r.memories.filter(x=>typeof x==='string'&&x.length<=95).slice(-16):[]};
}
function drawGate(g,x,y,season=0){const p=PALETTES[clamp(season,0,3)];g.save();g.translate(x,y);
 ellipse(g,0,15,74,21,'#4c7e5c55');
 rect(g,-60,-101,12,120,'#9c7654');rect(g,49,-101,12,120,'#9c7654');
 g.strokeStyle='#b38b68';g.lineWidth=12;g.beginPath();g.arc(0,-100,55,Math.PI,Math.PI*2);g.stroke();
 for(let i=0;i<17;i++){const a=Math.PI+i*Math.PI/16,xx=Math.cos(a)*57,yy=-100+Math.sin(a)*-49;
 ellipse(g,xx,yy,21,14,i%3===0?p.leafLight:p.leaf)}
 rect(g,-78,-92,156,36,'#7d594c');rect(g,-73,-88,146,27,'#f7e1a4');
 g.font='bold 14px system-ui';g.fillStyle='#456756';g.textAlign='center';g.fillText('CLOVERBANK',0,-70);
 g.fillStyle='#f8eac5';g.font='11px system-ui';g.fillText('WOODLAND TRAIL',0,-38);
 g.restore();}
window.HearthGrove={draw,drawFront,drawGate,walkable,hit,sites:SITES,cleanRecord};
})();