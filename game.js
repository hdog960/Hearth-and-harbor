import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

// Hearth & Harbor — playable vertical slice. All world art is original procedural geometry.
const $=id=>document.getElementById(id);
const rand=(a,b)=>a+Math.random()*(b-a), clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const COLORS={grass:0x76d461,ground:0x9de87b,sky:0x86dafa,path:0xffe6ae,cream:0xfffae8,wood:0xd99558,pink:0xff6f9b,blue:0x46cde8,green:0x35b872};
const NPCS=[
 {id:'oliver',name:'Oliver',job:'Baker',trait:'Warmhearted · Foodie',emoji:'👨🏻‍🍳',outfit:0x829cf9,hair:0x724e39,skin:0xf5c5a2,x:12,z:-1,lines:['The café smells like cinnamon today. That is my favorite kind of morning.','I want to create the perfect strawberry tart. Any ideas?','Sometimes all a town needs is a good pastry.']},
 {id:'mabel',name:'Mabel',job:'Florist',trait:'Creative · Loves nature',emoji:'👩🏽‍🌾',outfit:0xff76a4,hair:0x48392b,skin:0xb98261,x:-6,z:3,lines:['Have you noticed the wildflowers blooming by the pond?','I think each flower has its own personality.','My dream is to fill every garden in town with color.']},
 {id:'jun',name:'Jun',job:'Bookshop keeper',trait:'Shy · Bookworm',emoji:'🧑🏻‍🏫',outfit:0x46bddc,hair:0x34363b,skin:0xf3cda6,x:-13,z:8,lines:['I could spend an entire afternoon in a bookshop.','People are like stories. The best chapters take time.','The wind makes the trees sound like turning pages.']},
 {id:'bea',name:'Bea',job:'Artist',trait:'Outgoing · Dreamer',emoji:'👩🏾‍🎨',outfit:0xffc64c,hair:0x56372f,skin:0x986147,x:3,z:9,lines:['I am sketching the sunset. It changes every night.','A friend told me art should be practical. I disagree!','Your outfit has such lovely colors.']},
 {id:'finn',name:'Finn',job:'Fisher',trait:'Laid-back · Outdoorsy',emoji:'🧑🏼‍🦱',outfit:0x54cb9a,hair:0xa77943,skin:0xf4c8a4,x:13,z:13,lines:['The water is quiet today. That usually means the fish are hiding.','I caught an enormous fish once. Nobody believes me.','There is no rush. Not here.']},
 {id:'rosie',name:'Rosie',job:'Market owner',trait:'Cheerful · Ambitious',emoji:'👩🏻',outfit:0xc68fea,hair:0x8c4b39,skin:0xf4cfb9,x:-5,z:-4,lines:['The market is full of treats today!','Do you think this town needs a cake festival?','I have big plans for this little place.']},
];
const QUESTS=[
 {id:'welcome',name:'New beginnings',description:'Chat with 2 different neighbors',target:2,reward:70,icon:'💌'},
 {id:'flower',name:'Bloom where you are',description:'Plant a flower in the community garden',target:1,reward:45,icon:'🌷'},
 {id:'fish',name:'A little splash',description:'Catch your first fish',target:1,reward:75,icon:'🐟'},
 {id:'home',name:'Make yourself at home',description:'Place a new decoration in your home',target:1,reward:60,icon:'🛋️'},
 {id:'job',name:'An honest day’s work',description:'Help out at the bakery',target:1,reward:90,icon:'🥐'},
 {id:'friend',name:'A budding friendship',description:'Reach 30 friendship with a neighbor',target:1,reward:80,icon:'💕'}
];
const SHOP=[
 {id:'plant',name:'Potted plant',icon:'🪴',cost:35,desc:'A leafy little friend'},
 {id:'chair',name:'Cozy chair',icon:'🪑',cost:65,desc:'A place to unwind'},
 {id:'lamp',name:'Glowing lamp',icon:'💡',cost:50,desc:'Gentle evening light'},
 {id:'books',name:'Bookshelf',icon:'📚',cost:95,desc:'Stories to get lost in'},
 {id:'table',name:'Tea table',icon:'🫖',cost:75,desc:'A tiny place to gather'},
 {id:'flowers',name:'Flower vase',icon:'💐',cost:30,desc:'Fresh color for your rooms'}
];
const defaultState=()=>({name:'Poppy',hair:0x5d4037,outfit:0xe3a0a8,skin:0xf4c5aa,coins:250,hearts:0,day:1,minute:8*60,season:0,needs:{hunger:88,fun:89,social:83,energy:100},relations:{},met:[],quests:{},inventory:[],placed:[],garden:[0,0,0,0],fish:[],homeStyle:0,sound:false,seenWelcome:false});
let state=defaultState();
try{const saved=JSON.parse(localStorage.getItem('hearth-harbor-save-v1')||'null');if(saved&&typeof saved==='object')state={...state,...saved,needs:{...state.needs,...saved.needs},relations:{...saved.relations},quests:{...saved.quests}}}catch(e){console.warn('Save unavailable',e)}
let speed=1,modal='',placement=null,currentScene='town',pending=null,clockAccumulator=0,autoSaveT=0,toastTimer=0,fishValue=0,fishRaf=0, muted=false;
let scene,camera,renderer,light,player,playerBody,ground, raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),camTarget=new THREE.Vector3(),world=new THREE.Group(),npcs=[],clickable=[],decors=[],interactEntities=[],gardenMeshes=[],placedGroups=[],clouds=[];
// Shared materials & procedural textures keep the mobile renderer light.
const materialCache=new Map();
const mat=(c,roughness=1)=>{const key=`${c}:${roughness}`;if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color:c,roughness,metalness:0}));return materialCache.get(key)};
const decorMotion=[];let pathPebbles=[];let grassTexture=null,soilTexture=null,woodTexture=null;
const hash=n=>{const v=Math.sin(n*127.1+41.73)*43758.5453;return v-Math.floor(v)};
function texturePaint(kind){const c=document.createElement('canvas');c.width=c.height=1024;const q=c.getContext('2d');const grass=kind==='grass',wood=kind==='wood';
 if(grass){q.fillStyle='#72d860';q.fillRect(0,0,1024,1024);for(let i=0;i<18000;i++){const x=hash(i*2.13)*1024,y=hash(i*3.77)*1024,r=1+hash(i*5.1)*7;q.fillStyle=i%3===0?'#57c850':i%3===1?'#9cf17e':'#83e56c';q.globalAlpha=.12+hash(i*7.1)*.21;q.beginPath();q.ellipse(x,y,r*1.4,r*.65,hash(i)*6,0,Math.PI*2);q.fill()}q.globalAlpha=1;for(let i=0;i<1600;i++){const x=hash(i*1.7)*1024,y=hash(i*2.45)*1024;q.strokeStyle=i%3===0?'#39b947':'#c6f69a';q.globalAlpha=.22;q.lineWidth=1.7;q.beginPath();q.moveTo(x,y);q.lineTo(x+4,y-7);q.stroke()}q.globalAlpha=1;
 }else if(wood){q.fillStyle='#f3bb82';q.fillRect(0,0,1024,1024);for(let j=0;j<13;j++){const y=j*79;q.fillStyle=j%3===0?'#edac6b':j%3===1?'#ffc996':'#f6b378';q.fillRect(0,y,1024,77);q.fillStyle='rgba(105,66,41,.24)';q.fillRect(0,y+77,1024,2);for(let k=0;k<26;k++){let x=hash(j*44+k)*1024;q.fillStyle='rgba(119,80,50,.09)';q.fillRect(x,y+8+hash(k*7+j)*60,30+hash(k)*110,1)}q.fillStyle='rgba(103,69,44,.22)';q.fillRect(j%2?510:245,y,2,77)}
 }else{q.fillStyle='#ffe7b6';q.fillRect(0,0,1024,1024);for(let i=0;i<13000;i++){const x=hash(i*3.2)*1024,y=hash(i*4.7)*1024,r=1+hash(i*6.7)*5;q.fillStyle=i%3===0?'#f3c98a':i%3===1?'#fff8db':'#fad99c';q.globalAlpha=.08+hash(i*2.9)*.21;q.beginPath();q.arc(x,y,r,0,Math.PI*2);q.fill()}q.globalAlpha=1}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;return t;
}
function addSoftStone(g,x,y,z,scale=1,color=0xeee5ce){const o=sphere(.35,mat(color),x,y,z,10,7);o.scale.set(scale,.30*scale,.75*scale);g.add(o);return o}
function leafCluster(root,x,y,z,r,color){const o=sphere(r,mat(color),x,y,z,12,9);o.scale.set(1.15,.82,1.07);root.add(o);return o}

const MATERIAL={grass:mat(COLORS.grass),path:mat(COLORS.path),wood:mat(COLORS.wood),cream:mat(COLORS.cream),leaf:mat(0x42c96d),leaf2:mat(0x38b95c),shadow:new THREE.MeshBasicMaterial({color:0x438b45,transparent:true,opacity:.20,depthWrite:false})};
function mesh(geo,m,x=0,y=0,z=0,receive=false){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=!receive;o.receiveShadow=!!receive;return o}
function cube(w,h,d,m,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z)}
function sphere(r,m,x=0,y=0,z=0,ws=16,hs=12){return mesh(new THREE.SphereGeometry(r,ws,hs),m,x,y,z)}
function cyl(a,b,h,m,x=0,y=0,z=0,s=12){return mesh(new THREE.CylinderGeometry(a,b,h,s),m,x,y,z)}
function cone(r,h,m,x=0,y=0,z=0,s=4){return mesh(new THREE.ConeGeometry(r,h,s),m,x,y,z)}
function shapeRect(w,d,m,x,z){const o=mesh(new THREE.PlaneGeometry(w,d),m,x,.04,z,true);o.rotation.x=-Math.PI/2;return o}
function disk(r,m,x,y,z,segments=24){const o=mesh(new THREE.CircleGeometry(r,segments),m,x,y,z,true);o.rotation.x=-Math.PI/2;return o}
function groupAt(x=0,z=0){const g=new THREE.Group();g.position.set(x,0,z);return g}
function setTag(obj,tag,id){obj.userData.action={tag,id};clickable.push(obj);return obj}
function setTagGroup(gr,tag,id){gr.userData.action={tag,id};gr.traverse(o=>{if(o.isMesh)clickable.push(o)});return gr}
function shadow(g,r=1){const s=disk(r,MATERIAL.shadow,0,.021,0);s.scale.y=.6;g.add(s)}
function tinyFlower(root,x,z,palette=0){const g=groupAt(x,z);const petal=mat([0xff61a1,0xffa849,0xb578ed,0xffdd47][palette%4]);g.add(cyl(.024,.025,.36,mat(0x42aa43),0,.18,0,5));for(let k=0;k<5;k++){let a=k*Math.PI*2/5;g.add(sphere(.095,petal,Math.cos(a)*.12,.42,Math.sin(a)*.12,8,6))}g.add(sphere(.075,mat(0xffd437),0,.43,0,8,6));root.add(g);return g}
function bush(x,z,s=1){let g=groupAt(x,z);shadow(g,.6*s);const shades=[0x39bd54,0x69dd64,0x28ae62,0x92ed6e];for(let i=0;i<5;i++){let a=i*Math.PI*2/5;leafCluster(g,Math.cos(a)*.24*s,(.38+hash(i+x)*.1)*s,Math.sin(a)*.25*s,.34*s,shades[i%4])}leafCluster(g,0,.65*s,0,.36*s,0x5bd467);if(hash(x+z)>.45){for(let j=0;j<4;j++)g.add(sphere(.075,mat(0xffa4c1),Math.sin(j*1.9)*.42*s,.70*s,Math.cos(j*1.9)*.32*s,7,6))}world.add(g);return g}
function tree(x,z,scale=1,flower=false){
 const g=groupAt(x,z);g.scale.setScalar(scale);shadow(g,1.5);
 const bark=mat(0x9c7653),barkLit=mat(0xb68a60);g.add(cyl(.23,.35,2.7,bark,0,1.27,0,9));
 for(let t=0;t<3;t++){let a=t*Math.PI*2/3;const br=cyl(.085,.14,1.15,bark,Math.sin(a)*.40,2.41,Math.cos(a)*.35,7);br.rotation.z=Math.cos(a)*.7;br.rotation.x=Math.sin(a)*.62;g.add(br)}
 g.add(cyl(.26,.31,.11,barkLit,0,.24,0,10));
 const shades=flower?[0xff81ba,0xffa7d5,0xff69aa,0xffb4d4]:[0x31b951,0x61d35e,0x94e76e,0x37c36b];
 leafCluster(g,0,3.22,0,1.25,shades[0]);
 for(let i=0;i<9;i++){const a=i*2.39996,r=.65+(i%3)*.18;leafCluster(g,Math.cos(a)*r,3.2+Math.sin(i*2.4)*.42,Math.sin(a)*r*.85,.67+(i%3)*.08,shades[i%4])}
 for(let i=0;i<5;i++){let a=i*Math.PI*2/5;leafCluster(g,Math.cos(a)*.46,4.03+Math.sin(i)*.1,Math.sin(a)*.5,.60,shades[(i+2)%4])}
 for(let i=0;i<10;i++){let a=i*2.399,r=.76+(i%3)*.22;const m=mat(flower?0xfff4e3:(hash(x+i)>.55?0xff8a4d:0xffd04f));const fruit=sphere(flower?.093:.115,m,Math.sin(a)*r,3.10+Math.cos(i*1.6)*.58,Math.cos(a)*r,9,7);g.add(fruit)}
 world.add(g);return g;
}
function signLabel(text,w=2.1){const cv=document.createElement('canvas');cv.width=512;cv.height=140;let ct=cv.getContext('2d');ct.fillStyle='#fff8e5';ct.beginPath();ct.roundRect(8,6,496,128,36);ct.fill();ct.strokeStyle='#e7ceac';ct.lineWidth=9;ct.stroke();ct.fillStyle='#5b8671';ct.font='bold 57px Nunito, sans-serif';ct.textAlign='center';ct.textBaseline='middle';ct.fillText(text,256,74);let sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true}));sp.scale.set(w,.54,1);return sp}
function chibi(opts={}){
 const c=new THREE.Group();const skin=mat(opts.skin||0xf6c6aa),hair=mat(opts.hair||0x654332),outfit=mat(opts.outfit||0xe9a9aa),shoes=mat(0x745e56),eyes=mat(0x302e35),blush=mat(0xeb9e9d);shadow(c,.63);
 // Tiny, slightly pear-shaped body; the oversized face carries the expression.
 const torso=sphere(.53,outfit,0,1.0,0,20,15);torso.scale.set(1.02,1.08,.86);c.add(torso);
 const collar=mat(0xfff3dc),trouser=mat(0xf2e8d7);c.add(cyl(.32,.29,.10,collar,0,1.43,.05,14));
 const head=sphere(.80,skin,0,2.06,.035,28,21);head.scale.set(1,1.01,.94);c.add(head);
 // Smooth side-parted hair with shaped bangs, a fringe and two little locks.
 const cap=sphere(.807,hair,0,2.45,-.09,26,18);cap.scale.set(1.015,.62,.98);c.add(cap);
 for(let j=0;j<5;j++){let xp=-.61+j*.27;let b=sphere(.26,hair,xp,2.49+(j===0?-.09:Math.sin(j)*.055),.50-(Math.abs(xp)*.11),14,10);b.scale.set(1.04,.68,.86);c.add(b)}
 for(const side of [-1,1]){
  const lock=sphere(.21,hair,side*.69,2.14,-.045,12,9);lock.scale.set(.67,1.70,.75);c.add(lock);
  c.add(sphere(.14,skin,side*.79,1.99,0,12,9));
  // Flat glossy button eyes rather than round protruding balls.
  let e=sphere(.115,eyes,side*.314,2.07,.739,14,11);e.scale.set(.78,1.12,.28);c.add(e);
  c.add(sphere(.037,mat(0xffffff),side*.338-.02,2.122,.776,9,7));
  const cheek=sphere(.15,blush,side*.53,1.84,.66,11,8);cheek.scale.set(1.1,.36,.20);c.add(cheek);
  let brow=sphere(.09,hair,side*.315,2.285,.731,9,5);brow.scale.set(1.25,.20,.18);c.add(brow);
 }
 c.add(sphere(.052,mat(0xeab39c),0,1.94,.786,10,8));
 const mouth=new THREE.Mesh(new THREE.TorusGeometry(.104,.013,5,16,Math.PI),mat(0x9f625d));mouth.position.set(0,1.82,.752);mouth.rotation.z=Math.PI;c.add(mouth);
 // Rounded sleeves, hands, separate legs and proper forward-facing shoes.
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.50,1.30,0);arm.rotation.z=side*.26;
  const sleeve=sphere(.22,outfit,side*.06,-.17,0,14,9);sleeve.scale.set(.92,1.25,.90);arm.add(sleeve);
  arm.add(sphere(.145,skin,side*.09,-.45,.04,12,9));c.add(arm);arms.push(arm);
  const leg=new THREE.Group();leg.position.set(side*.235,.64,0);
  leg.add(cyl(.16,.15,.42,trouser,0,-.23,0,11));
  const sock=cyl(.147,.15,.10,mat(0xfff8e7),0,-.45,0,10);leg.add(sock);
  const shoe=sphere(.235,shoes,0,-.515,.15,16,11);shoe.scale.set(.96,.58,1.38);leg.add(shoe);
  leg.add(sphere(.09,mat(0xeedfc8),0,-.475,.414,9,6));c.add(leg);legs.push(leg);
 }
 // Embroidered buttons and a little pouch create detail at gameplay distance.
 for(let j=0;j<2;j++)c.add(sphere(.043,collar,0,1.13-j*.18,.49,9,7));
 c.userData={arms,legs,outfit,skin,hair,cap,head};return c;
}
function makeHouse(x,z,bodyColor,roofColor,label,tag,id){
 const g=groupAt(x,z);shadow(g,3.6);
 const wall=mat(bodyColor),roof=mat(roofColor),trim=mat(0xfff9ec),timber=mat(0xb57f5c),stone=mat(0xf4d8aa),windowMat=mat(0x6addf4);
 g.add(cube(6.6,.40,5.9,stone,0,.08,0));
 g.add(cube(6.5,3.9,5.5,wall,0,2.08,0));
 // Distinct horizontal siding strips create scale without repeated texture tiles.
 for(let j=0;j<11;j++)g.add(cube(6.55,.027,5.56,mat(j%3===0?0xfff1dd:bodyColor),0,.40+j*.32,0));
 // Gable roof, painted fascias and overlapping shingles.
 const tilt=.55;const roofAccent=new THREE.Color(roofColor).offsetHSL(0,0,.095).getHex(),roofDeep=new THREE.Color(roofColor).offsetHSL(0,0,-.065).getHex();
 for(const side of [-1,1]){
  const panel=cube(4.05,.34,6.55,roof,side*1.69,5.00,0);panel.rotation.z=-side*tilt;g.add(panel);
  for(let row=0;row<13;row++){
   const zz=-3.08+row*.52;const shingle=cube(3.95,.047,.075,mat(row%3===0?roofAccent:row%3===1?roofColor:roofDeep),side*1.70,5.193,zz);shingle.rotation.z=-side*tilt;g.add(shingle);
  }
  let edge=cube(4.30,.22,.20,timber,side*1.7,5.08,3.33);edge.rotation.z=-side*tilt;g.add(edge);
 }
 // Triangular front gable under the roofline.
 const triangle=new THREE.Shape();triangle.moveTo(-3.18,3.91);triangle.lineTo(0,6.04);triangle.lineTo(3.18,3.91);triangle.closePath();
 const gable=mesh(new THREE.ShapeGeometry(triangle),mat(0xfff6df),0,0,2.78);gable.castShadow=true;g.add(gable);
 g.add(cube(6.6,.22,.22,trim,0,3.93,2.91));
 // Accent front porch with stone steps, wooden support beams and curved doorway.
 g.add(cube(3.6,.20,2.25,mat(0xffd69e),0,.20,3.65));
 g.add(cube(2.7,.18,.80,stone,0,.085,4.90));
 for(const sx of [-1,1]){g.add(cyl(.12,.14,2.9,timber,sx*1.55,1.75,4.25,10));g.add(cyl(.19,.18,.17,trim,sx*1.55,3.18,4.25,10))}
 g.add(cube(3.65,.19,1.85,roof,0,3.34,3.91));
 const door=mat(0xf17a73);g.add(cube(1.44,2.26,.15,trim,0,1.20,2.86));g.add(cube(1.22,2.09,.18,door,0,1.17,2.97));
 g.add(sphere(.10,mat(0xf9d78d),.42,1.16,3.095,10,8));
 const wreath=groupAt(0,0);wreath.position.set(0,2.01,3.104);const circle=new THREE.Mesh(new THREE.TorusGeometry(.23,.070,8,18),mat(0x3fc665));wreath.add(circle);for(let k=0;k<4;k++){let a=k*Math.PI*.5;wreath.add(sphere(.078,mat(0xf5c6b5),Math.sin(a)*.23,Math.cos(a)*.23,.02,8,6))}g.add(wreath);
 // Shuttered windows, crossbars, sill and flower boxes.
 for(const sx of [-2.27,2.27]){
  g.add(cube(1.40,1.50,.19,trim,sx,2.40,2.85),cube(1.17,1.28,.19,windowMat,sx,2.40,2.96));
  g.add(cube(.085,1.30,.23,trim,sx,2.40,3.09),cube(1.20,.085,.24,trim,sx,2.41,3.09));
  for(let a of [-1,1]){g.add(cube(.26,1.43,.13,mat(0x61c9aa),sx+a*.87,2.4,2.90));for(let j=0;j<3;j++)g.add(cube(.28,.032,.15,trim,sx+a*.87,2.04+j*.33,3.01))}
  g.add(cube(1.50,.19,.49,timber,sx,1.66,3.08));for(let f=0;f<4;f++){
   g.add(sphere(.19,mat(f%2===0?0x7fb678:0x9ac987),sx-.51+f*.35,1.90,3.12,10,8));g.add(sphere(.085,mat(f%2===0?0xff7d9a:0xffe067),sx-.51+f*.35,2.03,3.17,8,6))
  }
 }
 g.add(cube(.88,1.43,.84,mat(0xc68e79),2.32,5.65,-1.20));g.add(cube(1.08,.13,.98,stone,2.32,6.43,-1.20));
 // Small dormer beneath the ridge and readable sign over the porch.
 g.add(cube(.88,.63,.12,mat(0xffedcc),0,4.67,3.02),cube(.55,.45,.14,windowMat,0,4.68,3.14));
 const sign=signLabel(label,Math.min(3.06,1.52+label.length*.095));sign.position.set(0,3.7,4.50);g.add(sign);
 for(const sx of [-1,1]){g.add(cyl(.36,.27,.47,mat(0xd49a74),sx*2.82,.29,3.04,10));leafCluster(g,sx*2.82,.77,3.04,.42,0x4fc864);for(let f=0;f<4;f++)g.add(sphere(.065,mat(0xff74aa),sx*2.82+Math.sin(f*1.57)*.27,.89,3.04+Math.cos(f*1.57)*.26,8,6))}
 world.add(g);if(tag)setTagGroup(g,tag,id);return g;
}
function path(x,z,w,d){
 // Soft, hand-worn winding paths with slightly irregular borders, never grid tiles.
 const horizontal=w>d,half=(horizontal?w:d)/2,breadth=(horizontal?d:w)/2;
 const pts=[];const steps=Math.max(8,Math.ceil(half*4));
 const edge=(t,sign)=>{const bend=Math.sin(t*.47+x*.9+z*.2)*.13+Math.sin(t*1.11+z*.36)*.052;const width=breadth+Math.sin(t*.78+x*.2)*.07;return sign*width+bend};
 for(let i=0;i<=steps;i++){const t=-half+2*half*i/steps,a=edge(t,1);pts.push(horizontal?[t,a]:[a,t])}
 for(let i=steps;i>=0;i--){const t=-half+2*half*i/steps,a=edge(t,-1);pts.push(horizontal?[t,a]:[a,t])}
 const sh=new THREE.Shape();pts.forEach(([xx,yy],i)=>i?sh.lineTo(xx,yy):sh.moveTo(xx,yy));sh.closePath();
 if(!soilTexture)soilTexture=texturePaint('path');const m=new THREE.MeshStandardMaterial({map:soilTexture,color:0xfff1cb,roughness:1});
 const surface=new THREE.Mesh(new THREE.ShapeGeometry(sh),m);surface.rotation.x=-Math.PI/2;surface.position.set(x,.046,z);surface.receiveShadow=true;world.add(surface);
 // Organic scatter of tiny stones in the soil, instanced in a single draw call later.
 const n=Math.floor(2*half*2.3);for(let i=0;i<n;i++){const t=-half+hash(i*3.23+w*8)*half*2,across=(hash(i*5.43+z)-.5)*breadth*1.65;
 pathPebbles.push({x:x+(horizontal?t:across),z:z+(horizontal?across:t),s:.038+hash(i*3.45)*.12,r:hash(i*.89)*6})}
}
function pond(x,z){const g=groupAt(x,z);
 const shore=disk(4.45,mat(0x84dd69),0,.055,0,48);shore.scale.y=.69;g.add(shore);
 const sand=disk(4.10,mat(0xffdc8e),0,.070,0,48);sand.scale.y=.69;g.add(sand);
 const water=disk(3.77,new THREE.MeshStandardMaterial({color:0x36cbf1,roughness:.23,metalness:.05}),0,.083,0,48);water.scale.y=.69;g.add(water);
 const deep=disk(3.42,new THREE.MeshBasicMaterial({color:0x7be7ff,transparent:true,opacity:.31,depthWrite:false}),0,.088,0,48);deep.scale.y=.69;g.add(deep);
 for(let k=0;k<36;k++){let a=k*Math.PI*2/36,dist=3.92+hash(k*2.4)*.15;let b=sphere(.20+hash(k)*.13,mat(k%3===0?0xd5cab0:0xb5b9a2),Math.cos(a)*dist,.11,Math.sin(a)*dist*.69,12,8);b.scale.set(1,.45,.65);g.add(b)}
 for(let k=0;k<7;k++){const a=k*2.43,px=Math.cos(a)*(1.0+hash(k)*1.1),pz=Math.sin(a)*1.3;const leaf=disk(.24,mat(k%2?0x41c573:0x28b46a),px,.111,pz,14);leaf.scale.y=.65;g.add(leaf);if(k%2===0){g.add(sphere(.12,mat(0xff82bd),px,.19,pz,10,7));g.add(sphere(.065,mat(0xffffff),px,.28,pz,8,6))}}
 for(let i=0;i<4;i++){const a=i*.75+.4;const ring=new THREE.Mesh(new THREE.RingGeometry(.25+i*.035,.274+i*.035,32),new THREE.MeshBasicMaterial({color:0xf5ffff,transparent:true,opacity:.30,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(Math.cos(a)*1.8,.115,Math.sin(a)*.85);g.add(ring);decorMotion.push({o:ring,base:ring.position.y,phase:i*.9,kind:'ripple'})}
 for(let i=0;i<9;i++){let a=i*2.8;const px=Math.cos(a)*4.34,pz=Math.sin(a)*2.74;if(i%3===0)tinyFlower(g,px,pz,i);else{for(let k=0;k<3;k++){const stalk=cyl(.045,.055,.70+hash(i+k)*.4,mat(0x44b96c),px+(k-1)*.10,.40,pz,6);g.add(stalk);g.add(cyl(.084,.068,.25,mat(0xa77b50),px+(k-1)*.10,.87,pz,7))}}}
 const sign=signLabel('Fishing Pond',2.25);sign.position.set(0,1.45,3.52);g.add(sign);world.add(g);setTagGroup(g,'fish','pond');
}
function garden(){const g=groupAt(-5.7,-10);g.add(shapeRect(5.4,3.8,mat(0xd99058),0,0));for(let i=0;i<4;i++){let x=-1.82+(i%2)*2.43,z=-.9+Math.floor(i/2)*1.75;let plot=groupAt(x,z);plot.add(cube(1.7,.16,1.25,mat(0xa66b48),0,.09,0));plot.add(cube(1.6,.06,1.13,mat(0x965d3b),0,.2,0));g.add(plot);gardenMeshes[i]=plot;setTagGroup(plot,'garden',i)}const tag=signLabel('Community Garden',2.9);tag.position.set(0,1.4,-2.5);g.add(tag);world.add(g);paintGarden()}
function paintGarden(){gardenMeshes.forEach((plot,i)=>{if(!plot)return;if(plot.userData.plantObj)plot.remove(plot.userData.plantObj);if(!state.garden[i])return;const flowers=new THREE.Group();let grow=state.garden[i]===1?.55:1;for(let k=0;k<5;k++){const xx=((k%3)-1)*.41,zz=(Math.floor(k/3)-.5)*.5;tinyFlower(flowers,xx,zz,i)}flowers.scale.setScalar(grow);flowers.position.y=.20;plot.add(flowers);plot.userData.plantObj=flowers})}
function bench(x,z){const g=groupAt(x,z),wood=mat(0xc18b67),metal=mat(0x617e6a);shadow(g,1.25);
 for(let k=0;k<3;k++)g.add(cube(2.15,.13,.20,wood,0,.91,-.20+k*.24));
 for(let k=0;k<3;k++)g.add(cube(2.15,.14,.13,wood,0,1.19+k*.28,-.42));
 for(let side of [-1,1]){g.add(cube(.14,.95,.14,metal,side*.92,.45,-.18),cube(.14,1.4,.14,metal,side*.92,.70,-.41));g.add(cube(.47,.14,.18,metal,side*.98,1.02,-.10))}
 world.add(g);setTagGroup(g,'bench','rest')}
function stall(x,z){const g=groupAt(x,z),wood=mat(0xba8a66),rose=mat(0xff6792),linen=mat(0xffefbb);shadow(g,1.8);
 g.add(cube(3.35,1.16,1.62,wood,0,.83,0),cube(3.49,.16,1.82,mat(0xf9debb),0,1.48,0));
 for(let a=-1;a<=1;a++){const piece=cube(1.17,.20,2.03,a===0?linen:rose,a*1.12,2.91,0);g.add(piece)}
 for(let a=-1;a<=1;a++){for(const z of [-.84,-.45,.02,.51,.92]){const frill=sphere(.18,a===0?linen:rose,a*1.12,2.82,z,10,7);frill.scale.set(3.0,.37,.73);g.add(frill)}}
 for(let side of [-1,1])g.add(cyl(.085,.085,1.46,wood,side*1.52,2.22,-.66));
 for(let j=0;j<5;j++){const x=-1.15+j*.57;g.add(sphere(.22,mat(j%2?0xff966f:0xffd350),x,1.72,.08,12,9));g.add(sphere(.095,mat(0x45bd69),x,1.95,.07,10,7))}
 const label=signLabel('Rosie’s Market',2.35);label.position.set(0,2.39,-1.08);g.add(label);
 world.add(g);setTagGroup(g,'market','market')}
function fence(x,z,w){for(let i=-w/2;i<=w/2;i+=.85){let post=cube(.15,.6,.15,mat(0xf1e3c5),x+i,.32,z);world.add(post)}world.add(cube(w,.12,.15,mat(0xf1e3c5),x,.48,z),cube(w,.10,.15,mat(0xf1e3c5),x,.18,z))}
function decorateTown(){
 if(!grassTexture)grassTexture=texturePaint('grass');
 const groundSurface=mesh(new THREE.PlaneGeometry(70,55),new THREE.MeshStandardMaterial({map:grassTexture,color:0xffffff,roughness:1}),0,-.021,0,true);groundSurface.rotation.x=-Math.PI/2;world.add(groundSurface);
 // Low-cost tufts: each is an instance, not hundreds of separate WebGL draw calls.
 const items=[];for(let i=0;i<980;i++){
  const x=-32+hash(i*1.73)*64,z=-26+hash(i*2.91)*52;
  if(Math.abs(x)<2.8||Math.abs(z-1.9)<2.6||Math.abs(x+12)<2.1&&z>-12&&z<-1||Math.abs(x-12)<2.1&&z>-12&&z<-1||Math.hypot(x+14,z+11)<5.7||Math.hypot(x-14,z+11)<5.7||Math.hypot(x+14,z-12)<5.6||Math.hypot(x-14,z-12)<5.6||Math.hypot(x-8,z-16)<5.5||x>-9&&x<-2&&z>-13&&z<-7)continue;
  items.push({x,z,s:.58+hash(i*.72)*.75,rot:hash(i*5.2)*6.28});
 }
 const bladeGeo=new THREE.ConeGeometry(.095,.36,3),bladeMat=new THREE.MeshStandardMaterial({color:0x74ad6b,roughness:1,side:THREE.DoubleSide});
 const blades=new THREE.InstancedMesh(bladeGeo,bladeMat,items.length);const dummy=new THREE.Object3D();
 items.forEach((it,i)=>{dummy.position.set(it.x,.16*it.s,it.z);dummy.scale.set(.85,it.s,.8);dummy.rotation.set(.16,0,it.rot);dummy.updateMatrix();blades.setMatrixAt(i,dummy.matrix)});blades.instanceMatrix.needsUpdate=true;blades.frustumCulled=false;world.add(blades);
 const stoneGeo=new THREE.DodecahedronGeometry(1,0),stoneMat=new THREE.MeshStandardMaterial({color:0xe2d0af,roughness:1});
 const pebbles=new THREE.InstancedMesh(stoneGeo,stoneMat,pathPebbles.length);
 pathPebbles.forEach((it,i)=>{dummy.position.set(it.x,.081,it.z);dummy.scale.set(it.s*1.35,it.s*.19,it.s*.89);dummy.rotation.set(0,it.r,0);dummy.updateMatrix();pebbles.setMatrixAt(i,dummy.matrix)});pebbles.instanceMatrix.needsUpdate=true;pebbles.frustumCulled=false;world.add(pebbles);
 // Curved garden borders, soft plantings and stepping stones around buildings.
 for(const [cx,cz,col] of [[-14,-11,0xf6c6a8],[14,-11,0xf8d48f],[-14,12,0xc4d6ea],[14,12,0xf2bccc]]){
  for(let side of [-1,1]){
   for(let i=0;i<5;i++){const px=cx+side*(3.9+i*.17),pz=cz-2.3+i*1.18;
    if(i%2===0)bush(px,pz,.40);else tinyFlower(world,px,pz,(i+Math.round(cx))&3)}
  }
  for(let k=0;k<4;k++){const s=addSoftStone(world,cx,0.09,cz+5.15+k*.63,.37+k*.015,0xeadcc1);s.scale.z*=1.8}
 }
 // Colorful mixed flower beds near the cottage porches. The larger groupings stay legible on a phone.
 for(const [bx,bz,phase] of [[-17.8,-6.65,0],[-10.15,-6.65,1],[10.2,-6.65,2],[17.8,-6.65,3],[-17.9,16.45,1],[-10.2,16.45,0],[10.2,16.45,3],[17.8,16.45,2]]){
  const patch=groupAt(bx,bz);const bed=disk(1.02,mat(0x42bc5e),0,.07,0,18);bed.scale.y=.52;patch.add(bed);
  for(let j=0;j<7;j++){const a=j*2.4,r=.26+(j%3)*.19;tinyFlower(patch,Math.cos(a)*r,Math.sin(a)*r,(j+phase)%4)}
  world.add(patch);
 }
 // Public square: sweet planters and small stone details.
 for(let i=0;i<8;i++){const a=i*Math.PI/4;
  if(i%2===0){bush(Math.cos(a)*4.35,1.9+Math.sin(a)*4.35,.60)}
  else{tinyFlower(world,Math.cos(a)*4.28,1.9+Math.sin(a)*4.28,i)}
 }
 // Scattered mushrooms tucked beneath trees, bees and drifting blossom motes.
 for(let k=0;k<20;k++){const x=-25+hash(k*3.9)*50,z=-20+hash(k*5.1)*42;if(Math.abs(x)<4||Math.abs(z-2)<4)continue;
  const gg=groupAt(x,z);gg.add(cyl(.065,.09,.24,mat(0xffe7c5),0,.13,0,7));gg.add(sphere(.24,mat(k%4===0?0xd89c89:0xf5cf9e),0,.29,0,10,8));gg.children[gg.children.length-1].scale.y=.48;world.add(gg);
 }
}
function decorateHome(){
 if(!woodTexture)woodTexture=texturePaint('wood');
 const floor=mesh(new THREE.PlaneGeometry(21.9,16.9),new THREE.MeshStandardMaterial({map:woodTexture,roughness:.94}),0,.056,0,true);floor.rotation.x=-Math.PI/2;world.add(floor);
 const trim=mat(0xfff2de);world.add(cube(22,.22,.21,trim,0,.24,-8.12));
 for(let x=-9;x<=9;x+=3.5){world.add(cube(.095,4.6,.14,trim,x,2.65,-8.10))}
 // Warm framed wall illustrations and curtains.
 for(const x of [-3.3,3.2]){
  world.add(cube(2.2,1.6,.14,mat(0xc69b74),x,3.22,-8.17));
  world.add(cube(1.95,1.35,.15,mat(0xf4eee0),x,3.22,-8.06));
  const art=sphere(.58,mat(x<0?0x8ebca4:0xdba9a6),x,3.23,-7.96,18,12);art.scale.set(1.1,.66,.08);world.add(art);
 }
 for(const x of [-7,7])for(const side of [-1,1]){
  world.add(cube(.52,2.8,.22,mat(0xff92b7),x+side*2.03,2.95,-7.83));
 }
 // A round center rug, cozy ceiling light, and a tidy reading corner.
 const rug=disk(2.85,mat(0xffd7ae),.9,.088,.45,40);rug.scale.y=.64;world.add(rug);
 const rugInside=disk(2.40,mat(0xffaac6),.9,.090,.45,40);rugInside.scale.y=.62;world.add(rugInside);
 const lightFixture=groupAt(-1,0);lightFixture.add(cyl(.09,.09,1.6,mat(0xbd9a75),0,4.18,0));lightFixture.add(sphere(.72,new THREE.MeshStandardMaterial({color:0xfff4c7,emissive:0xffd969,emissiveIntensity:.22,roughness:1}),0,3.48,0,18,12));world.add(lightFixture);
 const bookshelf=furniture('books',-9.25,-6);world.add(bookshelf);
 world.add(furniture('table',-1.7,1.4));
 for(const z of [-5,4]){world.add(furniture('plant',9,z))}
}

function init3d(){scene=new THREE.Scene();scene.background=new THREE.Color(0x79d4f9);scene.fog=new THREE.Fog(0xa6e8fc,78,160);renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.00;$('viewport').appendChild(renderer.domElement);camera=new THREE.OrthographicCamera(-14,14,9,-9,.1,300);camera.position.set(22,27,36);camera.lookAt(0,0,0);scene.add(new THREE.HemisphereLight(0xffffff,0x84bd79,1.3));light=new THREE.DirectionalLight(0xfff2d3,1.95);light.position.set(-12,26,15);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-32;light.shadow.camera.right=32;light.shadow.camera.top=32;light.shadow.camera.bottom=-32;light.shadow.camera.near=1;light.shadow.camera.far=75;light.shadow.bias=-.0002;scene.add(light);scene.add(world);window.addEventListener('resize',resize);resize();renderer.domElement.addEventListener('pointerup',tapGame);renderer.domElement.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY});window.addEventListener('contextmenu',e=>e.preventDefault());}
let startX=0,startY=0;
function resize(){if(!camera)return;const w=innerWidth,h=innerHeight,aspect=w/h;const halfHeight=aspect<1?14.3:10.7;camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=halfHeight;camera.bottom=-halfHeight;camera.updateProjectionMatrix();renderer.setSize(w,h)}
function buildTown(){world.clear();clickable=[];npcs=[];gardenMeshes=[];decorMotion.length=0;pathPebbles=[];const plane=cube(70,.55,55,MATERIAL.grass,0,-.33,0);plane.receiveShadow=true;plane.castShadow=false;world.add(plane);world.add(cube(76,.5,10,mat(0xffdf90),0,-.31,31));world.add(cube(76,.14,9,mat(0x3cc9f3),0,-.13,36));path(0,0,3.4,42);path(0,1.9,38,3.3);path(-12,-5,3,9);path(12,-5,3,9);path(-12,9,3,11);path(12,9,3,11);path(-6,-10,7,2.2);
 makeHouse(-14,-11,0xffb7a1,0xf16e78,'Your Home','enterHome','home');makeHouse(14,-11,0xffdc82,0x43bfcc,'Honeybun Café','cafe','work');makeHouse(-14,12,0x9ee5cc,0x788ee7,'Little Library','library','book');makeHouse(14,12,0xffdf92,0xc771c2,'Town Hall','hall','hall');stall(-9,1);pond(7.8,15.8);garden();bench(5.1,-4.8);bench(-4.8,9);fence(-19,-5,7);fence(14,-4,8);
 // Paths and clusters are intentionally hand-shaped, not obvious repeated tiles.
 for(const [x,z,s,f] of [[-23,-17,1.3,0],[-22,-6,1.1,1],[-21,6,1.4,0],[-21,21,1.3,0],[-8,18,1.2,1],[0,20,1.25,0],[22,19,1.4,1],[24,5,1.2,0],[24,-5,1.5,0],[22,-17,1.2,1],[4,-17,1.25,0],[-5,-18,1.15,0],[-1,13,.9,1]])tree(x,z,s,!!f);
 for(let i=0;i<120;i++){let x=rand(-27,27),z=rand(-23,26);if(Math.abs(x)<3.2||Math.abs(z-2)<3.5||Math.hypot(x+14,z+11)<5||Math.hypot(x-14,z+11)<5||Math.hypot(x-8,z-15)<5||Math.hypot(x+14,z-12)<5||Math.hypot(x-14,z-12)<5||x>-12&&x<-7&&z>-1&&z<4||x>-8&&x<-3&&z>-13&&z<-7)continue;if(i%3===0)tinyFlower(world,x,z,i);else{const leaf=sphere(.09,mat(i%2?0x48be5d:0x72d876),x,.07,z,6,4);leaf.scale.set(1.3,.65,.7);world.add(leaf)}}
 for(let i=0;i<20;i++){let x=rand(-25,25),z=rand(-24,25);if(Math.abs(x)<4||Math.abs(z-2)<4)continue;bush(x,z,rand(.55,.9))}
 decorateTown();
 // The little plaza fountain, with gently animated ripples and a sculpted blossom top.
 const center=groupAt(0,2);const rim=mat(0xffefce),interior=mat(0x59d6f4);
 center.add(cyl(1.78,1.86,.36,rim,0,.16,0,32));
 center.add(cyl(1.52,1.52,.075,interior,0,.36,0,32));
 center.add(cyl(.65,.78,.58,rim,0,.68,0,24));
 center.add(cyl(.22,.28,.82,rim,0,1.30,0,18));
 for(let j=0;j<8;j++){const a=j*Math.PI/4;const spray=sphere(.10,new THREE.MeshStandardMaterial({color:0x8defff,transparent:true,opacity:.84,roughness:.2}),Math.cos(a)*.79,1.04,Math.sin(a)*.79,9,8);center.add(spray);decorMotion.push({o:spray,base:spray.position.y,phase:j*.45,kind:'ripple'})}
 for(let j=0;j<6;j++){const a=j*Math.PI/3;const petal=sphere(.31,mat(0xff79ab),Math.cos(a)*.22,1.82,Math.sin(a)*.22,12,9);petal.scale.set(1,.42,.70);center.add(petal)}
 center.add(sphere(.15,mat(0xffd13b),0,1.94,0,12,9));world.add(center);
 NPCS.forEach((n,i)=>{const g=chibi(n);g.position.set(n.x,0,n.z);world.add(g);npcs.push({info:n,object:g,origin:new THREE.Vector3(n.x,0,n.z),wander:rand(0,7),phase:i*1.9});setTagGroup(g,'npc',n.id)});
 player=chibi(state);player.position.set(-9,0,-6.9);world.add(player);playerBody=player.userData;ground=plane;
}
function furniture(kind,x,z){const g=groupAt(x,z);shadow(g,.8);const brown=mat(0xb68666),cream=mat(0xf5e3c7),pink=mat(0xff87ab),green=mat(0x66ca87),blue=mat(0x59cdeb);switch(kind){
 case 'bed':g.add(cube(3.3,.45,2.3,mat(0xb6815f),0,.4,0),cube(3.05,.24,1.9,cream,0,.73,0),cube(2.9,.13,1.3,pink,0,.89,.4),cube(2.6,.3,.5,mat(0xfcf4df),0,.91,-.65));break;
 case 'sofa':g.add(cube(2.9,.9,1.1,green,0,.6,0),cube(2.9,1.2,.37,green,0,1.16,-.56),cube(.36,.7,1.2,green,-1.37,.80,0),cube(.36,.7,1.2,green,1.37,.80,0));break;
 case 'kitchen':g.add(cube(3.8,1.18,.85,cream,0,.66,0),cube(3.9,.16,.98,brown,0,1.3,0));for(let i=-1;i<=1;i++)g.add(cube(.85,.73,.07,mat(0xd8bba0),i*1.0,.74,.47));g.add(cyl(.21,.21,.015,mat(0x55514d),.8,1.41,-.05));break;
 case 'rug':g.add(cube(3,.04,2,mat(0xff90ae),0,.065,0),cube(2.65,.05,1.65,mat(0xffd3b6),0,.085,0));break;
 case 'plant':g.add(cyl(.4,.32,.75,mat(0xc98964),0,.37,0));for(let i=0;i<5;i++)g.add(sphere(.47,green,Math.sin(i*2)*.3,1.05+Math.cos(i)*.18,Math.cos(i*2)*.32));break;
 case 'chair':g.add(cube(.9,.17,.9,mat(0xc7926d),0,.65,0),cube(.9,.9,.14,mat(0xe0ada3),0,1.06,-.4));for(let s of [-1,1])for(let t of [-1,1])g.add(cube(.11,.7,.11,brown,s*.34,.34,t*.32));break;
 case 'lamp':g.add(cyl(.18,.22,1.5,brown,0,.8,0),cone(.68,.72,mat(0xf8e6b9),0,1.78,0,14));break;
 case 'books':g.add(cube(1.6,2.5,.51,brown,0,1.26,0));for(let i=0;i<3;i++){g.add(cube(1.47,.09,.59,cream,0,.65+i*.76,.09));for(let b=0;b<5;b++)g.add(cube(.16,.46,.36,mat([0x92afaf,0xdca7a4,0x91b88e,0xebc789,0xb5a3bf][b]),-.53+b*.25,.93+i*.76,.05))}break;
 case 'table':g.add(cyl(.94,.94,.13,brown,0,1.08,0,24),cyl(.17,.20,.98,brown,0,.55,0));g.add(cyl(.24,.22,.20,cream,0,1.27,0));break;
 case 'flowers':g.add(cyl(.27,.19,.45,blue,0,.31,0));for(let j=0;j<4;j++){g.add(cyl(.02,.02,.44,green,Math.sin(j*1.5)*.15,.68,Math.cos(j*1.5)*.14,5));g.add(sphere(.17,mat([0xf6afad,0xf5dc9d,0xe99dff,0xffffef][j]),Math.sin(j*1.5)*.24,.91,Math.cos(j*1.5)*.23,10,8))}break;
 }g.userData.furniture=kind;return g}
function buildHome(){world.clear();clickable=[];npcs=[];gardenMeshes=[];placedGroups=[];decorMotion.length=0;
 const base=cube(24,.6,19,mat(0xc9b092),0,-.35,0);base.receiveShadow=true;world.add(base);world.add(cube(22,.08,17,mat([0xffd29c,0xe3addb,0xa8e2b5,0xffd38e][state.homeStyle]),0,.01,0));const wall=mat([0xfff0d9,0xffe0f2,0xe1ffe0,0xffebbf][state.homeStyle]);world.add(cube(22,5,.35,wall,0,2.46,-8.42),cube(.35,5,17,wall,-11,2.46,0),cube(.35,5,17,wall,11,2.46,0));world.add(cube(22,.30,.6,mat(0xfff7e9),0,5,-8.4));for(let x of [-7,7]){world.add(cube(3.6,2.5,.1,mat(0xfff8dc),x,3,-8.13),cube(3.18,2.15,.13,mat(0x88e6ff),x,3,-8.04),cube(.14,2.22,.15,mat(0xfff8dc),x,3,-7.95),cube(3.2,.13,.14,mat(0xfff8dc),x,3,-7.95))}
 let g=furniture('bed',-7.4,-4.8);world.add(g);setTagGroup(g,'furniture','bed');g=furniture('sofa',1,-3.5);world.add(g);setTagGroup(g,'furniture','sofa');g=furniture('kitchen',6.8,-6);world.add(g);setTagGroup(g,'furniture','kitchen');g=furniture('rug',1,-2.1);world.add(g);g=furniture('plant',9,-4);world.add(g);for(const o of state.placed){const obj=furniture(o.kind,o.x,o.z);world.add(obj);placedGroups.push(obj);setTagGroup(obj,'furniture',o.kind)}
 decorateHome();
 player=chibi(state);player.position.set(0,0,4);world.add(player);playerBody=player.userData;ground=base;
 // windows cast warm decoration, open front for dollhouse-like view
}
function updateAvatar(){if(!player)return;let p=player.position.clone();let rot=player.rotation.y;let old=player;world.remove(old);player=chibi(state);player.position.copy(p);player.rotation.y=rot;world.add(player);playerBody=player.userData}
function updateHud(){const m=Math.floor(state.minute);const hh=Math.floor(m/60)%24,mm=m%60;const h=hh%12||12;$('clockText').textContent=`${h}:${String(mm).padStart(2,'0')} ${hh>=12?'PM':'AM'}`;$('dateText').textContent=`${['Spring','Summer','Autumn','Winter'][state.season]} · Day ${state.day}`;$('weather').textContent=['🌸','☀️','🍂','❄️'][state.season];$('coinText').textContent=state.coins;$('heartText').textContent=state.hearts;$('characterText').textContent=state.name;const avg=Object.values(state.needs).reduce((a,b)=>a+b,0)/4;$('moodText').textContent=avg>75?'Feeling lovely':avg>45?'Doing okay':'Needs a little care';for(const k of ['hunger','fun','social','energy'])$('need'+k[0].toUpperCase()+k.slice(1)).style.width=clamp(state.needs[k],0,100)+'%';$('locationText').textContent=currentScene==='town'?'🌷 Maplewood Village':'🏠 Your Cozy Cottage';$('homeBtn').classList.toggle('active',currentScene==='home');$('townBtn').classList.toggle('active',currentScene==='town');for(const [id,v] of [['pauseBtn',0],['playBtn',1],['fastBtn',4]])$(id).classList.toggle('selected',speed===v)}
function save(){try{localStorage.setItem('hearth-harbor-save-v1',JSON.stringify(state))}catch(e){toast('Could not save on this browser')} }
function chime(){if(!state.sound)return;try{const ctx=chime.ctx||(chime.ctx=new (window.AudioContext||window.webkitAudioContext)());if(ctx.state==='suspended')ctx.resume();[0,.09].forEach((offset,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=i?698:523;gain.gain.setValueAtTime(.0001,ctx.currentTime+offset);gain.gain.exponentialRampToValueAtTime(.035,ctx.currentTime+offset+.015);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+offset+.20);osc.connect(gain).connect(ctx.destination);osc.start(ctx.currentTime+offset);osc.stop(ctx.currentTime+offset+.22)})}catch{}}
function toast(t){chime();clearTimeout(toastTimer);$('toast').textContent=t;$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2700)}
function goal(id,amount=1){const q=QUESTS.find(q=>q.id===id);if(!q||state.quests[id]==='done')return;state.quests[id]=Math.min(q.target,(state.quests[id]||0)+amount);if(state.quests[id]>=q.target){state.quests[id]='done';state.coins+=q.reward;state.hearts+=1;toast(`✨ ${q.name} complete! +${q.reward} coins`)}updateHud();save()}
function changeScene(where){if(where===currentScene)return;placement=null;pending=null;currentScene=where;if(where==='town')buildTown();else buildHome();camTarget.copy(player.position);updateHud();save();toast(where==='home'?'🏡 Home sweet home!':'🌷 Fresh air, fresh possibilities!')}
function approach(object,target,cb){pending={x:target.x,z:target.z,cb,tag:object?.tag};}
function tapGame(e){if(modal||Math.hypot(e.clientX-startX,e.clientY-startY)>18)return;const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);let hits=raycaster.intersectObjects(clickable,true);const interact=hits.find(h=>findAction(h.object));if(interact&&!placement){const action=findAction(interact.object);let obj=interact.object;while(obj.parent&&!obj.userData.action)obj=obj.parent;const loc=new THREE.Vector3();obj.getWorldPosition(loc);approach(action,loc,()=>interactAction(action));return}
 const floorY=new THREE.Plane(new THREE.Vector3(0,1,0),0),pt=new THREE.Vector3();if(raycaster.ray.intersectPlane(floorY,pt)){
 if(placement){if(currentScene!=='home')return;placeItem(pt.x,pt.z);return}
 const maxX=currentScene==='home'?9.7:26,maxZ=currentScene==='home'?7.3:24;const dest={x:clamp(pt.x,-maxX,maxX),z:clamp(pt.z,-maxZ,maxZ)};pending={...dest,cb:null};$('hint').style.opacity=.2;
 }}
function findAction(o){while(o){if(o.userData?.action)return o.userData.action;o=o.parent}return null}
function interactAction({tag,id}){if(tag==='npc')talk(id);if(tag==='enterHome')changeScene('home');if(tag==='cafe')cafe();if(tag==='garden')gardenAction(id);if(tag==='fish')startFishing();if(tag==='bench'){state.needs.fun=clamp(state.needs.fun+18,0,100);state.needs.energy=clamp(state.needs.energy+12,0,100);toast('🌿 A lovely moment in the sunshine');save();updateHud()}if(tag==='market')market();if(tag==='library'){state.needs.fun=clamp(state.needs.fun+16,0,100);toast('📚 You borrowed a lovely novel');updateHud()}if(tag==='hall')townHall();if(tag==='furniture')furnitureAction(id)}
function animate(now){requestAnimationFrame(animate);let dt=Math.min((now-(animate.last||now))/1000,.07);animate.last=now;const t=now*.001;if(player&&scene){if(pending){const dx=pending.x-player.position.x,dz=pending.z-player.position.z,dist=Math.hypot(dx,dz);let buffer=pending.cb?.45:.1;if(dist>buffer){let step=Math.min(dist-buffer,dt*4.2);player.position.x+=dx/dist*step;player.position.z+=dz/dist*step;const dir=Math.atan2(dx,dz);let delta=((dir-player.rotation.y+3*Math.PI)%(2*Math.PI))-Math.PI;player.rotation.y+=delta*.20;for(let i=0;i<2;i++){playerBody.legs[i].rotation.x=Math.sin(t*12+i*Math.PI)*.42;playerBody.arms[i].rotation.x=-Math.sin(t*12+i*Math.PI)*.36}player.children[1].position.y=1.01+Math.abs(Math.sin(t*12))*.06}else{const done=pending;pending=null;for(let a of [...playerBody.legs,...playerBody.arms])a.rotation.x=0;player.children[1].position.y=1.01;if(done.cb)done.cb()}}else{playerBody.arms[0].rotation.x=Math.sin(t*1.8)*.045;playerBody.arms[1].rotation.x=-Math.sin(t*1.8)*.045}
 for(const n of npcs){n.wander+=dt;const obj=n.object;obj.position.x=n.origin.x+Math.sin(t*.35+n.phase)*.42;obj.position.z=n.origin.z+Math.cos(t*.28+n.phase)*.38;obj.rotation.y=Math.sin(t*.32+n.phase)*.65;for(let i=0;i<2;i++)n.object.userData.arms[i].rotation.x=Math.sin(t*2+n.phase+i)*.13}
 const aspect=innerWidth/innerHeight;const aim=new THREE.Vector3(player.position.x,0,player.position.z);camTarget.lerp(aim,dt*2.3);let off=currentScene==='town'?new THREE.Vector3(20,25,34):new THREE.Vector3(16,24,31);const desired=camTarget.clone().add(off);camera.position.lerp(desired,dt*2);camera.lookAt(camTarget.x,1.0,camTarget.z);light.position.set(camTarget.x-13,26,camTarget.z+15);light.target.position.set(camTarget.x,0,camTarget.z);light.target.updateMatrixWorld();
 for(const a of decorMotion){if(a.kind==='ripple'){a.o.scale.setScalar(1+Math.sin(t*.7+a.phase)*.08);a.o.position.y=a.base+Math.sin(t*1.7+a.phase)*.003}}
 renderer.render(scene,camera);
 }
 if(speed&&!modal){clockAccumulator+=dt*speed*2.4;while(clockAccumulator>=1){clockAccumulator--;state.minute+=1;state.needs.hunger=clamp(state.needs.hunger-.007,0,100);state.needs.energy=clamp(state.needs.energy-.005,0,100);state.needs.fun=clamp(state.needs.fun-.002,0,100);state.needs.social=clamp(state.needs.social-.003,0,100);if(state.minute>=1440){state.minute-=1440;state.day++;if(state.day%7===0)state.season=(state.season+1)%4;state.garden=state.garden.map(x=>x===1?2:x);if(currentScene==='town')paintGarden();toast('🌅 A new day begins!')} }updateHud()}
 autoSaveT+=dt;if(autoSaveT>25){save();autoSaveT=0}
}
function showModal(name,html){modal=name;placement=null;const shade=$('modalShade');shade.classList.remove('hidden');$('modalBody').innerHTML=html;cancelAnimationFrame(fishRaf)}
function closeModal(){modal='';$('modalShade').classList.add('hidden');$('modalBody').innerHTML='';cancelAnimationFrame(fishRaf)}
function intro(){showModal('welcome',`<div style="text-align:center;font-size:54px">🏡🌸</div><h2 style="text-align:center;margin-right:0">Welcome to Hearth & Harbor!</h2><p class="subtitle" style="text-align:center">A tiny town with a whole lot of heart. This is the first playable slice of your very own cozy life simulator.</p><div class="card-row"><span>👆</span><div><b>Tap to walk</b><br><small>Tap a path, person, house, or interesting place.</small></div></div><div class="card-row"><span>💌</span><div><b>Make connections</b><br><small>Talk, compliment, and give gifts to your neighbors.</small></div></div><div class="card-row"><span>🏡</span><div><b>Make a little life</b><br><small>Decorate your home, fish, garden, and earn coins.</small></div></div><button class="btn full" data-action="begin">Let's go explore! 🌷</button>`)}
function talk(id){const npc=NPCS.find(n=>n.id===id);if(!npc)return;const rel=state.relations[id]||0;let line=npc.lines[Math.floor(rand(0,npc.lines.length))];showModal('npc',`<div style="text-align:center;font-size:51px">${npc.emoji}</div><h2 style="text-align:center;margin-right:0">${npc.name} <span style="font-size:13px;color:#e0a098">♥ ${rel}</span></h2><p class="subtitle" style="text-align:center">${npc.job} · ${npc.trait}</p><p style="background:#f1f2e2;border-radius:18px;padding:15px;font-weight:800;text-align:center">“${line}”</p><div class="progress"><b style="width:${rel}%"></b></div><p class="subtitle" style="text-align:center">Friendship grows when you spend time together.</p><div class="choices"><button class="btn" data-action="chat" data-id="${id}">💬 Chat (+8)</button><button class="btn pink" data-action="compliment" data-id="${id}">💕 Compliment (+12)</button><button class="btn secondary" data-action="gift" data-id="${id}">🎁 Gift (15 🪙)</button><button class="btn secondary" data-action="bye">👋 See you!</button></div>`)}
function socialize(id,kind){const npc=NPCS.find(n=>n.id===id);if(!npc)return;let add=kind==='compliment'?12:kind==='gift'?20:8;if(kind==='gift'&&state.coins<15){toast('You need 15 coins for a gift');return}if(kind==='gift')state.coins-=15;state.relations[id]=clamp((state.relations[id]||0)+add,0,100);state.needs.social=clamp(state.needs.social+14,0,100);state.needs.fun=clamp(state.needs.fun+6,0,100);if(!state.met.includes(id)){state.met.push(id);goal('welcome',1)}if(state.relations[id]>=30)goal('friend',1);updateHud();save();closeModal();toast(`${npc.emoji} ${npc.name} feels closer to you! +${add} ♥`)}
function people(){showModal('people',`<h2>💌 Your Neighbors</h2><p class="subtitle">Everyone has a story. The more you talk, the more you become part of it.</p>${NPCS.map(n=>`<div class="card-row"><div class="person"><div class="face">${n.emoji}</div><div><b>${n.name} <span style="font-size:10px;color:#b89184">♥ ${state.relations[n.id]||0}</span></b><br><small>${n.job} · ${n.trait}</small><div class="relation"><span style="width:${state.relations[n.id]||0}%"></span></div></div></div><button class="btn secondary" data-action="findPerson" data-id="${n.id}">Find</button></div>`).join('')}`)}
function journal(){const qdone=QUESTS.filter(q=>state.quests[q.id]==='done').length;showModal('journal',`<h2>📖 Your Little Journal</h2><p class="subtitle">Small adventures are worth celebrating. ${qdone} of ${QUESTS.length} discoveries completed.</p><div class="progress"><b style="width:${qdone/QUESTS.length*100}%"></b></div>${QUESTS.map(q=>{const completed=state.quests[q.id]==='done',n=completed?q.target:(state.quests[q.id]||0);return `<div class="card-row ${completed?'quest-complete':''}"><div><b>${q.icon} ${q.name} ${completed?'✓':''}</b><br><small>${q.description}</small><div class="progress" style="width:160px;height:6px"><b style="width:${n/q.target*100}%"></b></div></div><span class="tag">${completed?'Done':`${n}/${q.target}`} · 🪙${q.reward}</span></div>`}).join('')}<h3>🧺 Collections</h3><div class="card-row"><div>🐟 Fish caught</div><b>${state.fish.length}</b></div><div class="card-row"><div>🪑 Furniture placed</div><b>${state.placed.length}</b></div><div class="card-row"><div>💗 Friends met</div><b>${state.met.length}/${NPCS.length}</b></div>`)}
function market(){showModal('market',`<h2>🛒 Rosie’s Market</h2><p class="subtitle">Fresh finds, friendly prices, and everything you need for a lovely day.</p><div class="tiles"><button class="tile" data-action="buySnack"><span class="emoji">🥐</span><b>Sweet bun</b><small>20 coins · +35 Food</small></button><button class="tile" data-action="buyFun"><span class="emoji">🧸</span><b>Little toy</b><small>25 coins · +25 Fun</small></button><button class="tile" data-action="buyBouquet"><span class="emoji">💐</span><b>Flower bouquet</b><small>30 coins · +20 Fun</small></button></div><p class="subtitle" style="margin-top:15px">Tip: plant flowers and catch fish to earn extra pocket money!</p>`)}
function cafe(){showModal('cafe',`<h2>🥐 Honeybun Café</h2><p class="subtitle">Oliver's kitchen is warm, busy, and smells of fresh bread.</p><div style="text-align:center;font-size:60px;padding:5px">🍰☕🍓</div><div class="choices"><button class="btn" data-action="work">👩‍🍳 Work a shift<br><small>Earn 75 coins · 2 hours</small></button><button class="btn secondary" data-action="eatCafe">🧁 Buy a treat<br><small>20 coins · +40 Food</small></button></div><p class="subtitle" style="margin-top:12px">More detailed active careers are planned for later versions.</p>`)}
function townHall(){showModal('hall',`<h2>🏛️ Town Hall</h2><p class="subtitle">Welcome to the heart of your little community.</p><div class="card-row"><div><b>🌷 Neighborhood spirit</b><br><small>${state.hearts} community milestones earned</small></div><span style="font-size:28px">💗</span></div><div class="card-row"><div><b>👫 Familiar faces</b><br><small>${state.met.length} of ${NPCS.length} neighbors met</small></div><span style="font-size:28px">💌</span></div><p>As the town grows, this will become the center of community projects, new districts, seasonal festivals, and resident events.</p>`)}
function gardenAction(id){const n=Number(id);if(!state.garden[n]){showModal('garden',`<h2>🌱 A patch of possibility</h2><p class="subtitle">Plant a flower for 12 coins. It blooms after you sleep until morning.</p><div style="text-align:center;font-size:64px;margin:12px">🌷</div><button class="btn full" data-action="plant" data-id="${n}" ${state.coins<12?'disabled':''}>Plant flower · 12 🪙</button>`)}else if(state.garden[n]===1){showModal('garden',`<h2>🌱 Growing beautifully!</h2><p class="subtitle">Your flowers are growing. Rest until tomorrow to see them bloom.</p><div style="text-align:center;font-size:60px">🌱🌼</div><button class="btn full" data-action="bye">Lovely!</button>`)}else{showModal('garden',`<h2>🌷 Ready to harvest!</h2><p class="subtitle">Your flowers bloomed! Harvest them for 35 coins.</p><div style="text-align:center;font-size:60px">💐</div><button class="btn full" data-action="harvest" data-id="${n}">Gather flowers · +35 🪙</button>`)}}
function furnitureAction(kind){if(kind==='bed'){showModal('bed',`<h2>🛏️ Sweet dreams</h2><p class="subtitle">A little sleep restores your energy, and your garden will have time to grow.</p><div class="choices"><button class="btn" data-action="sleep">🌙 Sleep until morning</button><button class="btn secondary" data-action="nap">😴 Take a nap · +30 Energy</button></div>`)}else if(kind==='kitchen'){showModal('kitchen',`<h2>🍲 What's cooking?</h2><p class="subtitle">Make something comforting in your own kitchen.</p><div class="choices"><button class="btn" data-action="cook">🍳 Cook a meal<br><small>10 coins · +55 Food</small></button><button class="btn secondary" data-action="snack">🍎 Have a snack<br><small>5 coins · +25 Food</small></button></div>`)}else if(kind==='sofa'||kind==='chair'){showModal('sofa',`<h2>🛋️ Cozy time</h2><p class="subtitle">Home is where you can truly unwind.</p><div class="choices"><button class="btn" data-action="relax">📺 Relax · +28 Fun</button><button class="btn secondary" data-action="nap">💤 Snooze · +30 Energy</button></div>`)}else{state.needs.fun=clamp(state.needs.fun+4,0,100);toast('💛 Your home is feeling extra cozy!');updateHud()}}
function shop(){if(currentScene!=='home'){showModal('build',`<h2>🛋️ Decorate your home</h2><p class="subtitle">You can purchase and place furniture inside your cottage.</p><button class="btn full" data-action="goHomeShop">🏠 Take me home</button>`);return}showModal('build',`<h2>🛋️ Decorate your cottage</h2><p class="subtitle">Select an item, then tap the floor to put it wherever you like. You only pay when you place it. You have 🪙 ${state.coins}.</p><div class="tiles">${SHOP.map(s=>`<button class="tile" data-action="chooseItem" data-id="${s.id}" ${state.coins<s.cost?'disabled':''}><span class="emoji">${s.icon}</span><b>${s.name}</b><small>${s.cost} 🪙</small></button>`).join('')}</div><h3>🎨 Walls and floors</h3><div class="swatches">${[0,1,2,3].map((s)=>`<button class="swatch ${state.homeStyle===s?'active':''}" data-action="homeStyle" data-id="${s}" aria-label="Room color ${s+1}" style="background:${['#e8ceaa','#d8b5d5','#b0cbbb','#eac1a1'][s]}"></button>`).join('')}</div><p class="subtitle">Move furniture by buying more pieces. More detailed editing tools are planned.</p>`)}
function placeItem(x,z){if(!placement||currentScene!=='home')return;const p=SHOP.find(i=>i.id===placement);if(!p)return;if(state.coins<p.cost){toast('Not enough coins');placement=null;return}x=clamp(Math.round(x*2)/2,-9.5,9.5);z=clamp(Math.round(z*2)/2,-6.9,6.9);state.coins-=p.cost;state.placed.push({kind:placement,x,z});let gr=furniture(placement,x,z);world.add(gr);placedGroups.push(gr);setTagGroup(gr,'furniture',placement);goal('home',1);placement=null;save();updateHud();toast(`✨ ${p.name} placed! Your cottage looks lovely.`);$('hint').textContent='Tap objects to interact • Tap a room to walk';$('hint').style.opacity=.85}
function style(){showModal('style',`<h2>👗 Your little self</h2><p class="subtitle">Make your own adorable chibi resident! Changes appear right away and are saved automatically.</p><label style="font-size:12px;font-weight:900">Your name</label><input class="form-input" type="text" id="nameInput" maxlength="18" value="${escapeText(state.name)}" aria-label="Character name"><h3>🎀 Outfit color</h3><div class="swatches">${[0xe3a0a8,0x89bca8,0x8daec8,0xe6bc7b,0xb2a0ce,0xf2c7ab].map(c=>`<button class="swatch ${state.outfit===c?'active':''}" data-action="outfit" data-id="${c}" aria-label="Choose outfit" style="background:#${c.toString(16)}"></button>`).join('')}</div><h3>💇 Hair color</h3><div class="swatches">${[0x5d4037,0x2f3034,0xa87a4d,0xe2b87c,0x98686d,0xc7a4ab].map(c=>`<button class="swatch ${state.hair===c?'active':''}" data-action="hair" data-id="${c}" aria-label="Choose hair" style="background:#${c.toString(16)}"></button>`).join('')}</div><h3>🌻 Skin tone</h3><div class="swatches">${[0xffdfc4,0xf4c5aa,0xd9a987,0xb98261,0x986147,0x633c30].map(c=>`<button class="swatch ${state.skin===c?'active':''}" data-action="skin" data-id="${c}" aria-label="Choose skin tone" style="background:#${c.toString(16)}"></button>`).join('')}</div><button class="btn full" data-action="saveStyle">Save my look 🌼</button>`)}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function gameMenu(){showModal('menu',`<h2>⚙️ Little Life Menu</h2><p class="subtitle">Your game auto-saves on this device. Export a backup if you want to protect your town between browsers.</p><div class="choices"><button class="btn" data-action="save">💾 Save now</button><button class="btn secondary" data-action="export">📤 Export save</button><button class="btn secondary" data-action="import">📥 Import save</button><button class="btn secondary" data-action="help">❔ How to play</button></div><hr class="mini-separator"><div class="card-row"><div><b>🧭 Simulated time</b><br><small>Pause, play, or fast-forward with the clock controls.</small></div></div><div class="card-row"><div><b>🔒 No account required</b><br><small>Your save is stored locally. Clearing Safari data may erase it.</small></div></div><p class="subtitle" style="margin-bottom:0">Prototype v0.2 · Storybook graphics pass · Free to play</p>`)}
function help(){showModal('help',`<h2>🌷 A little guide</h2><p class="subtitle">No quests are mandatory. Explore and make your own story!</p><div class="card-row"><b>👆 Walk</b><small>Tap an open spot on the ground</small></div><div class="card-row"><b>💬 Talk</b><small>Tap a neighbor's chibi character</small></div><div class="card-row"><b>🏡 Home</b><small>Tap Home at the bottom to enter your cottage</small></div><div class="card-row"><b>🌱 Garden</b><small>Tap the brown garden plots beside your house</small></div><div class="card-row"><b>🐟 Fish</b><small>Tap the water on the east side of town</small></div><div class="card-row"><b>🥐 Work</b><small>Tap Honeybun Café to earn money</small></div><div class="card-row"><b>🛋️ Decorate</b><small>Open the Decorate menu while inside</small></div><div class="card-row"><b>⏰ Time</b><small>Use the bottom-right needs panel for pause/play/fast-forward</small></div><button class="btn full" data-action="bye">Back to my little life</button>`)}
function startFishing(){fishValue=0;showModal('fishing',`<h2>🎣 A peaceful fishing spot</h2><p class="subtitle">Stop the moving red marker inside the green zone to reel in your fish!</p><div style="text-align:center;font-size:54px">🐟 🌊</div><div class="fish-game"><div class="fish-track"><div class="fish-zone"></div><div id="fishPointer" class="fish-pointer"></div></div><p class="subtitle" style="text-align:center;margin-top:12px">Aim for the middle!</p></div><button class="btn full" data-action="hook">🎣 REEL IT IN!</button>`);const start=performance.now();const tick=()=>{if(modal!=='fishing')return;fishValue=(Math.sin((performance.now()-start)*.004)+1)*50;const p=$('fishPointer');if(p)p.style.left=fishValue+'%';fishRaf=requestAnimationFrame(tick)};tick()}
function doneFishing(){const good=fishValue>=40&&fishValue<=58;closeModal();if(good){let fish=['Bluebell Minnow','Sunshine Perch','Silverfin','Rosy Carp','Pebble Guppy'][Math.floor(rand(0,5))];state.fish.push(fish);state.coins+=25;state.needs.fun=clamp(state.needs.fun+12,0,100);goal('fish',1);toast(`🐠 Caught a ${fish}! +25 coins`)}else toast('💦 It slipped away! Tap the pond to try again.');updateHud();save()}
function spend(cost,key,amount,message){if(state.coins<cost){toast('Not enough coins!');return false}state.coins-=cost;state.needs[key]=clamp(state.needs[key]+amount,0,100);closeModal();toast(message);updateHud();save();return true}
function advanceToMorning(){state.day++;state.minute=7*60;if(state.day%7===0)state.season=(state.season+1)%4;state.needs.energy=100;state.needs.hunger=clamp(state.needs.hunger-9,0,100);state.needs.fun=clamp(state.needs.fun+9,0,100);state.garden=state.garden.map(g=>g===1?2:g);if(currentScene==='town')paintGarden();updateHud();save();toast('🌅 Good morning! The world feels brand-new.');}
function exportSave(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='hearth-harbor-save.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('💾 Save file exported!')}
function importSave(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';inp.onchange=async()=>{try{const parsed=JSON.parse(await inp.files[0].text());if(!parsed||typeof parsed.coins!=='number'||!parsed.needs||!Array.isArray(parsed.placed))throw Error('wrong format');state={...defaultState(),...parsed,needs:{...defaultState().needs,...parsed.needs}};save();closeModal();if(currentScene==='home')buildHome();else buildTown();updateHud();toast('🌼 Your town has been restored!')}catch{toast('That does not look like a valid Hearth & Harbor save')}};inp.click()}
function doAction(act,id){switch(act){
 case 'begin':state.seenWelcome=true;save();closeModal();toast('🌷 Welcome to your new beginning!');break;
 case 'bye':closeModal();break;
 case 'chat':case 'compliment':case 'gift':socialize(id,act);break;
 case 'findPerson':{const npc=NPCS.find(x=>x.id===id);closeModal();if(currentScene==='home')changeScene('town');pending={x:npc.x-.7,z:npc.z+1,cb:()=>talk(id)};break}
 case 'work':state.coins+=75;state.minute+=120;if(state.minute>=1440){state.minute-=1440;state.day++;}state.needs.energy=clamp(state.needs.energy-25,0,100);state.needs.hunger=clamp(state.needs.hunger-12,0,100);goal('job',1);closeModal();toast('🥐 Great shift! +75 coins. Oliver says thanks!');updateHud();save();break;
 case 'eatCafe':spend(20,'hunger',40,'🧁 Delicious! You feel full and cozy.');break;
 case 'buySnack':spend(20,'hunger',35,'🥐 A warm sweet bun. Yum!');break;
 case 'buyFun':spend(25,'fun',25,'🧸 That was delightful!');break;
 case 'buyBouquet':spend(30,'fun',20,'💐 The flowers brighten your day!');break;
 case 'plant':if(state.coins>=12){state.coins-=12;state.garden[Number(id)]=1;paintGarden();goal('flower',1);closeModal();toast('🌱 A tiny seed, a lovely beginning!');updateHud();save()}break;
 case 'harvest':state.garden[Number(id)]=0;state.coins+=35;paintGarden();closeModal();toast('🌷 Fresh flowers! +35 coins');updateHud();save();break;
 case 'sleep':closeModal();advanceToMorning();break;
 case 'nap':state.needs.energy=clamp(state.needs.energy+30,0,100);closeModal();toast('💤 What a refreshing nap!');updateHud();save();break;
 case 'cook':spend(10,'hunger',55,'🍲 A homemade meal! So comforting.');break;
 case 'snack':spend(5,'hunger',25,'🍎 A quick and tasty snack!');break;
 case 'relax':state.needs.fun=clamp(state.needs.fun+28,0,100);state.needs.energy=clamp(state.needs.energy+6,0,100);closeModal();toast('🛋️ You feel relaxed and happy.');updateHud();save();break;
 case 'goHomeShop':closeModal();changeScene('home');shop();break;
 case 'chooseItem':placement=id;closeModal();$('hint').style.opacity=1;$('hint').textContent='👆 Tap an empty spot on the floor to place your item';toast('🛋️ Tap the floor to place your '+SHOP.find(x=>x.id===id).name);break;
 case 'homeStyle':state.homeStyle=Number(id);save();buildHome();shop();toast('🎨 Your cottage colors have changed!');break;
 case 'hair':case 'outfit':case 'skin':state[act]=Number(id);updateAvatar();save();style();break;
 case 'saveStyle':state.name=($('nameInput')?.value||'Poppy').trim().slice(0,18)||'Poppy';save();updateHud();closeModal();toast(`✨ Looking adorable, ${state.name}!`);break;
 case 'hook':doneFishing();break;
 case 'save':save();toast('💾 Little world saved!');break;
 case 'export':exportSave();break;
 case 'import':importSave();break;
 case 'help':help();break;
 }}
function button(id,fn){$(id).addEventListener('click',fn)}
function connectUI(){button('closeModal',closeModal);$('modalShade').addEventListener('click',e=>{if(e.target===$('modalShade'))closeModal()});$('modalBody').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)doAction(b.dataset.action,b.dataset.id)});button('homeBtn',()=>{closeModal();changeScene('home')});button('townBtn',()=>{closeModal();changeScene('town')});button('peopleBtn',people);button('journalBtn',journal);button('buildBtn',shop);button('styleBtn',style);button('menuBtn',gameMenu);button('helpBtn',help);button('pauseBtn',()=>{speed=0;updateHud()});button('playBtn',()=>{speed=1;updateHud()});button('fastBtn',()=>{speed=4;updateHud()});button('soundBtn',()=>{state.sound=!state.sound;save();$('soundBtn').textContent=state.sound?'♫':'♪';toast(state.sound?'Sound enabled':'Sound disabled')});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal)closeModal()});document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});}
try{init3d();buildTown();connectUI();updateHud();requestAnimationFrame(animate);setTimeout(()=>{$('loading').classList.add('hidden');setTimeout(()=>$('loading').remove(),700);if(!state.seenWelcome)intro();else toast('🌸 Welcome back to Hearth & Harbor!')},550);if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{})}catch(err){console.error(err);$('loading').innerHTML=`<div class="loading-card"><div class="loading-icon">🌦️</div><h1>Couldn't open the town</h1><p>Make sure you're online and open this game from GitHub Pages.</p><small style="display:block;max-width:360px">${escapeText(err.message)}</small></div>`}
