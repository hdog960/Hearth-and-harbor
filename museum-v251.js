/* Hearth & Harbor · The Little Museum v2.5.1
   Original 2D illustrated walkable museum, no third-party assets. */
(function(){'use strict';
const xs=[431,729], ys=[360,485,610,735,860,985,1110,1235];
const stands=Array.from({length:16},(_,i)=>({index:i,x:xs[i%2],y:ys[Math.floor(i/2)],walkX:i%2?616:543}));
const themes=[{name:'THE WILD MEADOW',bg:'#edf4ce',border:'#96b980',accent:'#d47d9c'},
 {name:'THE TIDAL CORNER',bg:'#d0f3ea',border:'#79afaa',accent:'#579da5'},
 {name:'THE WOODLAND',bg:'#f7dfb6',border:'#bc986f',accent:'#be805f'},
 {name:'THE FROST GALLERY',bg:'#e4eafb',border:'#95a9d3',accent:'#8e9ac8'}];
function rr(c,x,y,w,h,r,fill,stroke=null,lw=1){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function ell(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill()}
function line(c,pts,color,width=2){c.beginPath();c.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)c.lineTo(...pts[i]);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function label(c,txt,x,y,size=17,color='#3d6f65',font='system-ui',weight=800){c.font=weight+' '+size+'px '+font;c.fillStyle=color;c.textAlign='center';c.fillText(txt,x,y);c.textAlign='left'}
function flower(c,x,y,col){for(let i=0;i<5;i++){const a=i*2*Math.PI/5;ell(c,x+Math.cos(a)*7,y+Math.sin(a)*7,5,5,col)}ell(c,x,y,4,4,'#ffe3a4')}
function bird(c,x,y){ell(c,x,y,15,8,'#8fbea9');ell(c,x+10,y-5,7,7,'#a8d6b5');ell(c,x+12,y-7,2,2,'#334f55');line(c,[[x-10,y+1],[x-23,y-4]],'#6b9c92',3)}
function glyph(c,kind,x,y,hue,phase=0,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);
 if(kind==='flower'){line(c,[[0,20],[0,-4]],'#4c9766',4);flower(c,0,-14,hue);ell(c,-7,8,7,3,'#7ebc75')}
 else if(kind==='butterfly'){ell(c,-12,-4,12+Math.sin(phase)*2,10,hue);ell(c,12,-4,12-Math.sin(phase)*2,10,hue);ell(c,-10,-4,5,5,'#ffeccc');ell(c,10,-4,5,5,'#ffeccc');ell(c,0,-2,4,14,'#554856');line(c,[[-2,-14],[-8,-21]],'#554856');line(c,[[2,-14],[8,-21]],'#554856')}
 else if(kind==='leaf'){line(c,[[0,22],[0,-20]],'#56815a',4);ell(c,-9,-8,13,6,hue);ell(c,12,-13,13,7,hue);ell(c,2,-20,10,5,'#d6eeb4')}
 else if(kind==='beetle'){for(const a of [-1,1]){line(c,[[a*7,2],[a*22,11]],'#6b6b65',3);line(c,[[a*7,-7],[a*21,-15]],'#6b6b65',3)}ell(c,0,0,17,22,'#514855');ell(c,-7,1,10,18,hue);ell(c,7,1,10,18,hue);line(c,[[0,-20],[0,20]],'#e5f9e6',2)}
 else if(kind==='stone'){c.beginPath();c.moveTo(-18,13);c.lineTo(-15,-7);c.lineTo(-2,-27);c.lineTo(16,-14);c.lineTo(21,13);c.closePath();c.fillStyle=hue;c.fill();c.beginPath();c.moveTo(-12,-8);c.lineTo(-2,-22);c.lineTo(5,-8);c.lineTo(0,12);c.lineTo(-15,9);c.closePath();c.fillStyle='#fffaf1';c.fill();line(c,[[6,9],[16,-8]],'#7d9fad',2)}
 else if(kind==='shell'){ell(c,0,0,24,19,hue);for(let i=-2;i<=2;i++)line(c,[[0,19],[i*9,-16+Math.abs(i)*3]],'#ac968f',2);ell(c,0,16,19,5,'#fff9e9')}
 else if(kind==='acorn'){ell(c,0,5,17,22,hue);ell(c,0,-11,19,10,'#80604f');line(c,[[0,-18],[6,-28]],'#685341',4);for(let i=-2;i<=2;i++)ell(c,i*7,-12,2,2,'#dfb28c')}
 else if(kind==='mushroom'){rr(c,-8,-1,16,27,3,'#ffebd8');ell(c,0,-3,27,15,hue);ell(c,-10,-9,5,4,'#ffe6de');ell(c,9,-12,4,4,'#ffe6de')}
 c.restore()}
function museumBuilding(c,x,y){c.save();c.translate(x,y);
 // Soft stone steps, flowers, copper green roof, arched gallery windows.
 ell(c,0,6,153,20,'#3f765c55');rr(c,-118,-116,236,125,5,'#f5dfc3','#a98379',4);
 rr(c,-130,-146,260,45,4,'#688f85','#4b746f',4);rr(c,-141,-157,282,17,4,'#89b3a2','#d6eacc',2);
 rr(c,-95,-128,190,17,3,'#e7edd6');label(c,'THE LITTLE MUSEUM',0,-114,15,'#406d66');
 for(const side of [-1,1]){const bx=side*82;rr(c,bx-22,-91,44,56,15,'#b5d6d1','#cfede2',4);rr(c,bx-13,-82,26,42,11,'#638f97');line(c,[[bx,-81],[bx,-41]],'#f8ecd0',3);line(c,[[bx-14,-61],[bx+14,-61]],'#f8ecd0',3)}
 rr(c,-30,-67,60,77,22,'#ae8e7b','#f7eed4',5);rr(c,-23,-59,46,68,17,'#618d79');ell(c,15,-24,3,3,'#fbe0a0');
 for(const side of [-1,1]){rr(c,side*119-9,-107,18,119,5,'#dfc9ac','#ae977e',2);flower(c,side*114,0,side>0?'#e9a6be':'#f4cc73')}
 rr(c,-46,4,92,16,5,'#e9d2a7','#a88968',2);rr(c,-58,17,116,12,4,'#f4e8c7');c.restore()}
function drawRoom(c,{species=[],donated=[],tick=0,season=0}={}){
 c.fillStyle='#74ac83';c.fillRect(-300,-300,1900,2400);
 rr(c,172,180,812,1365,24,'#507968');rr(c,190,199,776,1322,14,'#eacda1');
 // Walnut parquet and honeycomb inlays across the whole exhibition floor.
 for(let y=330;y<1480;y+=44)for(let x=202;x<955;x+=48){c.fillStyle=(Math.floor(y/44)+Math.floor(x/48))%2?'#efd3a1':'#f5dfb6';c.fillRect(x,y,46,42);line(c,[[x,y+41],[x+46,y+41]],'#dfc39b',1)}
 rr(c,202,195,750,137,9,'#87a99a');rr(c,210,204,734,112,7,'#f6efcf','#b7d2a9',3);
 label(c,'✦  T H E   L I T T L E   M U S E U M  ✦',580,257,25,'#46736c');label(c,'Maplewood Nature Society · Est. with love',580,293,13,'#75937c', 'system-ui',650);
 for(let i=0;i<4;i++){const theme=themes[i],y=333+i*259;
  rr(c,206,y,744,249,9,theme.bg,theme.border,3);
  rr(c,211,y+5,734,41,5,theme.border);label(c,theme.name,580,y+32,16,'#fff9e6');
  for(let j=0;j<5;j++){flower(c,240+j*150,y+64,theme.accent)}
 }
 // Light-flecked center walkway and golden guiding tiles.
 rr(c,538,340,84,1063,15,'#f4e5c6','#d8bb8b',3);
 for(let y=355;y<1390;y+=54){ell(c,580,y,3.5,5,'#dbb58b');ell(c,580,y+27,3,4,'#dfc7a4')}
 // Wooden center console and collection information plaque.
 rr(c,483,1350,197,80,13,'#a57d60','#7d604f',4);rr(c,489,1356,185,57,10,'#f9ebce');
 label(c,'CURATOR’S DESK',581,1380,13,'#547765');label(c,'Tap to donate · take a tour',581,1399,11,'#8e826a', 'system-ui',600);
 // 16 wall-mounted, individually lit exhibition cases.
 stands.forEach(({index,x,y})=>{
  const n=species[index];if(!n)return;const has=donated.includes(n.id),theme=themes[Math.floor(index/4)];
  rr(c,x-105,y-54,210,116,9,'#876b60','#6f574e',3);
  rr(c,x-98,y-47,196,91,6,has?'#fff9e5':'#d5dfd4','#d8c8a4',3);
  // Decorative niche lighting, pedestal shadow and protective glass streak.
  rr(c,x-81,y+14,161,18,4,has?'#e4d1ad':'#bac9bf');ell(c,x,y+13,58,9,has?'#dbb888':'#a6baaf');
  if(has){ell(c,x,y-21,68,36,n.hue+'44');glyph(c,n.kind,x,y-14+Math.sin(tick*1.35+index)*1.5,n.hue,tick,1.04);rr(c,x-88,y-43,177,4,2,'#ffffff91')}
  else{ell(c,x,y-16,21,21,'#a2b8a9');label(c,'?',x,y-8,30,'#e3eee4')}
  rr(c,x-92,y+44,184,22,5,has?'#faf0d3':'#e6e8d9','#b7a181',2);
  const title=has?n.name.toUpperCase():'EMPTY CASE · '+String(index+1).padStart(2,'0');
  label(c,title.length>19?title.slice(0,19):title,x,y+59,title.length>19?10:11,has?'#537568':'#91a59a');
 });
 // Glass-panel exit and warm morning skylight.
 rr(c,485,1447,192,73,12,'#9f7f6c','#f1dfbc',4);rr(c,496,1457,170,57,8,'#8ab7b5');rr(c,571,1461,19,51,3,'#f5ecd9');
 label(c,'EXIT TO VILLAGE',580,1440,14,'#6f7e66');
 for(const side of [-1,1]){ell(c,580+side*240,1475,29,10,'#b6d297');flower(c,580+side*240,1463,side>0?'#e7a8c0':'#f2ce77')}
 // Softly animated gallery highlights for donated cases.
 if(donated.length){c.globalAlpha=.45+.18*Math.sin(tick*2);ell(c,580,318,90,2,'#fff8cd');c.globalAlpha=1}
}
function hit(x,y){if(y>=1425&&y<=1550&&x>=470&&x<=696)return {type:'exit'};
 if(y>=1335&&y<=1445&&x>=457&&x<=700)return {type:'desk'};
 for(const s of stands)if(Math.abs(x-s.x)<108&&Math.abs(y-(s.y+8))<67)return {type:'exhibit',index:s.index,walkX:s.walkX,y:s.y+37};
 return null}
window.HearthMuseum={drawBuilding:museumBuilding,drawRoom,hit,stands};
})();