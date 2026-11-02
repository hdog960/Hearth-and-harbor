/* Hearth & Harbor v2.5.22 — Illustrated Worktops
 * Original Canvas-friendly SVG illustrations reflect the ACTUAL successful
 * cooking actions. No extra inventory, scoring, timers, rewards or save fields.
 * SVG is decorative: the existing semantic buttons remain the input surface.
 */
(function(root){'use strict';
const COLORS={
 carrot:['#f6b05b','#df7739','#9d5831'],
 potato:['#f3d9a1','#c8a475','#a0784c'],
 onion:['#eee0cc','#c6afbe','#a27b9a'],
 berry:['#fa9690','#d74d65','#ac395b'],
 leaf:['#9ccc85','#559b6c','#3f7954'],
 petal:['#f9bdd0','#e78faf','#bd6485'],
 honey:['#f8d980','#e7ab48','#ad752d'],
 garden:['#a6ca89','#7ba960','#4f8454'],
 herb:['#91c68b','#64a870','#39784d'],
 zest:['#f8da72','#e9ad4d','#ac853c'],
 salt:['#f9f9ee','#d6e3df','#9ba7a9'],
 flower:['#e5ae87','#d39662','#976b50'],
 star:['#e5ae87','#d39662','#976b50'],
 heart:['#e5ae87','#d39662','#976b50']
};
const xy=[73,180,287],cuts=[61,140,220,299];
const inRange=(n,a,b)=>Math.max(a,Math.min(b,n));
const ring=(x,y,rx,ry,color,stroke,sw=2)=>'<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+color+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const stroke=(d,color,w=3,other='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+w+'" stroke-linecap="round" stroke-linejoin="round" '+other+'/>';
const leaf=(x,y,rot=0)=>'<g transform="translate('+x+' '+y+') rotate('+rot+')"><path d="M0 0Q-19-25-24-10Q-25 5 0 0ZM0 0Q18-24 24-10Q23 4 0 0Z" fill="#75ae72" stroke="#4f8b60" stroke-width="1.5"/>'+stroke('M0 12V-12','#4d8655',2)+'</g>';
function defs(){return '<defs>'+
 '<linearGradient id="kc22-wood" x2=".9" y2="1"><stop stop-color="#fbe3b9"/><stop offset=".55" stop-color="#e5bd89"/><stop offset="1" stop-color="#cc9869"/></linearGradient>'+
 '<linearGradient id="kc22-crust" x2=".8" y2=".9"><stop stop-color="#fff0c7"/><stop offset=".58" stop-color="#edc48d"/><stop offset="1" stop-color="#ce9666"/></linearGradient>'+
 '<linearGradient id="kc22-cream" x2=".8" y2="1"><stop stop-color="#fffef5"/><stop offset="1" stop-color="#c6dfd4"/></linearGradient>'+
 '<radialGradient id="kc22-glaze"><stop stop-color="#fff2d5"/><stop offset="1" stop-color="#e2ae73"/></radialGradient>'+
 '</defs>'}
function worktop(){let s='<rect x="3" y="5" width="354" height="130" rx="22" fill="#ad7953" opacity=".25"/>'+
 '<rect x="3" y="1" width="354" height="126" rx="21" fill="url(#kc22-wood)" stroke="#ab7951" stroke-width="4"/>'+
 '<rect x="12" y="9" width="336" height="110" rx="17" fill="none" stroke="#fff1cf" stroke-width="2" opacity=".67"/>';
 for(let i=0;i<5;i++)s+=stroke('M'+(23+i*68)+' 16Q'+(31+i*68)+' 64 '+(20+i*68)+' 109','#ab815f',1.6,'opacity=".19"');
 return s}
function plate(){return ring(180,66,161,59,'#c1dfd1','#90bdb1',3)+ring(180,61,156,55,'url(#kc22-cream)','#fff9e8',6)+ring(180,62,130,43,'#fff4de','#f1d9be',2)}
function sparkle(x,y){return '<g class="kc-spark" transform="translate('+x+' '+y+')">'+stroke('M0-10V10M-10 0H10','#fffae2',2.5)+ring(0,0,2.5,2.5,'#fffbe6','none',0)+'</g>'}
function garnishItem(type,x,y,scale=1){
 const c=COLORS[type]||COLORS.leaf;
 let s='<g transform="translate('+x+' '+y+') scale('+scale+')">';
 if(type==='leaf'||type==='herb'||type==='garden')s+=leaf(0,0,18);
 else if(type==='petal')s+='<path d="M0 9Q-20-5-8-18Q-1-23 0-9Q4-25 13-15Q19-4 0 9Z" fill="'+c[0]+'" stroke="'+c[2]+'" stroke-width="1.5"/>';
 else if(type==='honey')s+=stroke('M-14-5Q0-17 14-4Q-2 2 4 14','#e4ac48',4)+ring(3,12,4,6,'#f3c65f','#dba03c',1);
 else if(type==='salt'){for(let i=0;i<6;i++)s+=ring(-12+(i*7)%29,-8+(i*9)%20,2,1.6,c[0],c[2],.5)}
 else if(type==='zest'){for(let i=0;i<4;i++)s+=stroke('M'+(-14+i*8)+' '+(-8+(i%2)*6)+'q4 -7 7 -5',c[1],2.3)}
 else if(type==='berry')s+='<path d="M0-15C-21-23-19 4 0 20C20 4 19-23 0-15Z" fill="'+c[1]+'" stroke="'+c[2]+'" stroke-width="2"/>'+leaf(0,-14,0)+ring(-6,-4,3,5,'#ffc6b0','none',0);
 else s+=ring(0,0,11,10,c[0],c[2],2);
 return s+'</g>';
}
function dishBase(recipe){
 let s='';
 if(recipe==='fishplate')s+='<path d="M83 63Q157 13 267 59L303 38L293 65L305 84L270 69Q156 107 83 63Z" fill="#a6d0bd" stroke="#5a9995" stroke-width="3"/>'+ring(121,56,4,4,'#426567','none',0)+stroke('M178 42Q197 58 180 83','#69a9a2',2.3);
 else if(recipe==='eggs')for(const x of [140,220])s+=ring(x,64,37,25,'#fffefa','#e1d7c4',2)+ring(x,61,16,15,'#f5b74f','#de9837',2)+ring(x-5,56,5,4,'#ffe6a0','none',0);
 else if(recipe==='noodles')for(let i=0;i<5;i++)s+=stroke('M'+(100+i*34)+' 44q-22 11 -2 23t-4 24','#f1c577',6);
 else if(recipe==='pancakes')for(const y of [74,64,54])s+=ring(180,y,85,24,'#f3ce86','#ce9758',3)+stroke('M114 '+(y-5)+'q46 -13 127 0','#ffe7a9',3);
 else if(recipe==='dumplings')for(const x of [117,180,243])s+='<path d="M'+(x-29)+' 75Q'+(x-25)+' 28 '+x+' 42Q'+(x+24)+' 30 '+(x+31)+' 75Q'+x+' 93 '+(x-29)+' 75Z" fill="#f5ddad" stroke="#d4b381" stroke-width="3"/>';
 else if(recipe==='tart')s+='<path d="M90 84L175 30L287 82Q200 108 90 84Z" fill="#e8ad83" stroke="#bb8059" stroke-width="4"/>'+ring(194,75,64,20,'#e66c83','#ac5471',3);
 else if(recipe==='salad')for(let i=0;i<6;i++)s+=ring(121+i*22,51+(i%2)*20,24,13,i%2?'#aad390':'#80b58b','#659867',2);
 else if(recipe==='skewers')s+=stroke('M76 75L287 49','#b98e5a',6)+ring(118,69,22,17,'#efae66','#b77a49',2)+ring(183,61,21,19,'#a7c482','#6f9668',2)+ring(245,54,20,18,'#f4d2a9','#ab856a',2);
 else s+=ring(180,66,83,32,'#eac889','#d2a168',3);
 return s;
}
function chop(recipe,completed){
 const apple=recipe==='salad'||recipe==='jam',n=completed.length;
 let s=worktop();
 for(let i=0;i<4;i++){
  let x=cuts[i];s+=ring(x,63,28,34,'#fce8c4','#d7ac7b',2);
  if(i<n){
   const color=apple?'#f3cc74':'#eea660';
   s+=ring(x,62,22,27,color,apple?'#b77d55':'#b86f43',3);
   s+=ring(x,60,13,17,apple?'#fff0ab':'#ffca87','none',0);
   if(apple)s+=ring(x+1,60,2,4,'#8a684f','none',0);
   else for(let k=0;k<3;k++)s+=stroke('M'+(x-8+k*7)+' 50q-4 13 -1 23','#e58f48',2);
   s+=sparkle(x+20,29);
  }else{
   s+=stroke('M'+(x-20)+' 39L'+(x+20)+' 87','#c19f7f',2.5,'stroke-dasharray="4 5"');
   s+=ring(x,62,6,7,'#f1d0a9','none',0);
  }
 }
 s+=leaf(33,27,-20);
 return s;
}
function skewer(completed,selected){
 let s=worktop()+stroke('M27 72L329 72','#9c6a42',8)+stroke('M27 68L329 68','#f7dbac',3);
 for(let i=0;i<3;i++){
  const x=xy[i],type=completed[i]|| (i===completed.length?selected:null);
  if(type){
   const c=COLORS[type]||COLORS.potato,ghost=!completed[i];
   s+='<g opacity="'+(ghost?.5:1)+'">'+ring(x,70,32,27,c[1],c[2],3)+ring(x-7,60,15,12,c[0],'none',0)+stroke('M'+(x-20)+' 76q18 8 39 2',c[0],2)+'</g>';
   if(!ghost)s+=sparkle(x+25,34);
  }else s+=ring(x,70,27,23,'#e4cc9b','#a88961',2)+ring(x,70,12,10,'#f7e0b8','none',0);
 }
 return s;
}
function pastry(completed,selected){
 let s=worktop();
 for(let i=0;i<3;i++){
  const x=xy[i],type=completed[i]|| (i===completed.length?selected:null);
  s+=ring(x,70,46,38,'#cd9362','#aa704c',2)+ring(x,65,42,33,'url(#kc22-crust)','#fce7b5',3)+ring(x,61,28,21,'#d4a47a','#bb895c',2);
  for(let k=0;k<5;k++)s+=stroke('M'+(x-30+k*15)+' 36q-3 7 0 10','#fbe2a9',2);
  if(type){const c=COLORS[type]||COLORS.berry;
   s+='<g opacity="'+(completed[i]?1:.45)+'">'+ring(x,62,24,17,c[1],c[2],2)+ring(x-8,56,9,5,c[0],'none',0)+'</g>';
   if(completed[i])s+=sparkle(x+35,26);
  }else s+=stroke('M'+(x-17)+' 64q18 7 33 0','#aa8262',2);
 }
 return s;
}
function cookie(completed,selected){
 let s=worktop();
 for(let i=0;i<3;i++){
  const x=xy[i],type=completed[i]|| (i===completed.length?selected:null);
  s+=ring(x,70,40,36,'#d3a16f','#a67751',3)+ring(x-2,65,34,30,'url(#kc22-crust)','#ffe4b8',2);
  if(type){
   const c=COLORS[type]||COLORS.flower;
   let d=type==='star'?'M0-21L6-7L23-6L10 5L15 20L0 11L-15 20L-10 5L-23-6L-6-7Z':
     type==='heart'?'M0 19C-7 11-24 2-20-11C-16-24-2-21 0-10C4-23 18-23 21-10C25 3 7 12 0 19Z':
      'M0-20C14-26 15-12 11-9C25-9 26 5 11 8C16 23 2 26 0 13C-9 27-21 17-12 7C-29 1-22-11-10-10C-13-21-2-26 0-20Z';
   s+='<g transform="translate('+x+' 65)" opacity="'+(completed[i]?1:.45)+'"><path d="'+d+'" fill="'+c[0]+'" stroke="#a46a4f" stroke-width="2.5"/>'+stroke('M-9 -2q7 10 18-1','#fff0bf',2)+'</g>';
   if(completed[i])s+=sparkle(x+33,28);
  }else s+=ring(x,65,11,9,'#e9c28e','none',0);
 }
 return s;
}
function finishPlate(kind,recipe,completed,selected){
 let s=plate()+dishBase(recipe);
 for(let i=0;i<3;i++){
  const x=xy[i],y=42+(i%2)*34,type=completed[i]|| (i===completed.length?selected:null);
  if(type){
   s+='<g opacity="'+(completed[i]?1:.45)+'">'+garnishItem(type,x,y,.85)+'</g>';
   if(completed[i])s+=sparkle(x+19,y-20);
  }else s+=ring(x,y,14,12,'none','#caad89',1.7);
 }
 return s;
}
function render(kind,recipe,completed,selected){
 if(!['chop','season','thread','fill','stamp','garnish'].includes(kind))return '';
 if(!Array.isArray(completed))return '';
 const completedSafe=completed.slice(0,kind==='chop'?4:3).filter(v=>typeof v==='string'&&/^[a-z0-9_-]{1,15}$/.test(v));
 const safeSelection=typeof selected==='string'&&Object.prototype.hasOwnProperty.call(COLORS,selected)?selected:null;
 let illustration='';
 switch(kind){
  case 'chop':illustration=chop(recipe,completedSafe);break;
  case 'thread':illustration=skewer(completedSafe,safeSelection);break;
  case 'fill':illustration=pastry(completedSafe,safeSelection);break;
  case 'stamp':illustration=cookie(completedSafe,safeSelection);break;
  default:illustration=finishPlate(kind,recipe,completedSafe,safeSelection);
 }
 return '<div class="kc-art-wrap" aria-hidden="true"><svg class="kc-illustration kc-art-'+kind+'" viewBox="0 0 360 140" preserveAspectRatio="xMidYMid meet" focusable="false" xmlns="http://www.w3.org/2000/svg">'+defs()+illustration+'</svg></div>';
}
root.HearthKitchenWorktopArt={render};
})(window);
