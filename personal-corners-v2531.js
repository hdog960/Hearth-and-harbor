/* Hearth & Harbor v2.5.31 — Personal Corners.
 * Residents make existing furniture feel lived-in. Individual decorations and
 * memories are earned from REAL favorite routines, not menu visits or timers.
 */
(function(root){'use strict';
const HOMES=['h0','h1','h2','h3','h4','h5'],IDS=['mabel','rosie','oliver','jun','bea','finn'];
const FAVORITES={
 mabel:{name:'Mabel',title:'Little Garden Nook',prop:'plant',action:'hobby',detail:'Fresh leaves make her feel at home.',color:'#89b68c'},
 rosie:{name:'Rosie',title:'Tea with Friends',prop:'chair',action:'chat',detail:'An inviting seat makes space for a story.',color:'#d49a8a'},
 oliver:{name:'Oliver',title:'A Baker’s Cozy Corner',prop:'rug',action:'meal',detail:'He loves a soft place to share breakfast.',color:'#d5ad76'},
 jun:{name:'Jun',title:'The Story Nook',prop:'books',action:'read',detail:'A real bookshelf makes every chapter warmer.',color:'#8dacb0'},
 bea:{name:'Bea',title:'A Painter’s Posies',prop:'flowers',action:'hobby',detail:'Little blossoms inspire her next creation.',color:'#bc9bc2'},
 finn:{name:'Finn',title:'A Maker’s Light',prop:'lamp',action:'tidy',detail:'A bright corner is perfect for tiny projects.',color:'#d0bb84'}
};
const propName={plant:'potted plant',chair:'cozy chair',rug:'soft rug',books:'bookshelf',flowers:'fresh flowers',lamp:'warm lamp'};
const has=(x,k)=>Object.prototype.hasOwnProperty.call(x,k),obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const validDay=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const key=(home,id)=>home+'|'+id;
function clean(raw){
 const src=obj(raw)?raw:{},daily={},counts={},memories=[];
 for(const id of IDS){
  const d=src.daily?.[id];
  if(obj(d)&&HOMES.includes(d.home)&&validDay(d.day))daily[id]={day:d.day,home:d.home};
 }
 for(const home of HOMES)for(const id of IDS){
  const count=src.counts?.[key(home,id)];
  if(Number.isInteger(count)&&count>0)counts[key(home,id)]=clamp(count,1,9999);
 }
 if(Array.isArray(src.memories))for(const entry of src.memories.slice(-120)){
  if(!obj(entry)||!HOMES.includes(entry.home)||!IDS.includes(entry.id)||!validDay(entry.day))continue;
  if(memories.some(x=>x.id===entry.id&&x.day===entry.day))continue;
  memories.push({home:entry.home,id:entry.id,day:entry.day});
 }
 return {daily,counts,memories:memories.slice(-36)};
}
function setup(api){
 const state=()=>api.getState();
 const data=()=>{
  const s=state();if(!obj(s.personalCorners)||!obj(s.personalCorners.daily)||!obj(s.personalCorners.counts)||!Array.isArray(s.personalCorners.memories))s.personalCorners=clean(s.personalCorners);
  return s.personalCorners;
 };
 const occupants=home=>!HOMES.includes(home)?[]:
  [...new Set((api.getHomeMembers?.(home)||[]).filter(id=>IDS.includes(id)&&api.getResidentHome?.(id)===home))].slice(0,2);
 const props=home=>{
  const p=api.getProps?.(home);
  return Array.isArray(p)?p.filter(x=>obj(x)&&['plant','chair','rug','books','flowers','lamp'].includes(x.kind)&&Number.isFinite(x.x)&&Number.isFinite(x.y)).slice(0,8):[];
 };
 function corner(home,id){
  if(!HOMES.includes(home)||!occupants(home).includes(id))return null;
  const favorite=FAVORITES[id];
  const furniture=props(home).find(x=>x.kind===favorite.prop);
  return {id,home,profile:favorite,ready:!!furniture,furniture:furniture||null,
   count:data().counts[key(home,id)]||0,completed:data().counts[key(home,id)]>=3};
 }
 const comfort=home=>occupants(home).filter(id=>corner(home,id)?.ready).length*2;
 function recordAction(home,id,action,first=true,day=state().day){
  if(!first||!validDay(day)||day!==state().day||!IDS.includes(id)||!HOMES.includes(home))return false;
  const c=corner(home,id);if(!c||!c.ready||action!==c.profile.action)return false;
  const d=data();if(d.daily[id]?.day===day)return false;
  const ownNeeds=api.getNeeds?.(id);
  if(!obj(ownNeeds))return false;
  d.daily[id]={day,home};const k=key(home,id),n=d.counts[k]||0;
  d.counts[k]=clamp(n+1,0,9999);d.memories.push({id,home,day});d.memories=d.memories.slice(-36);
  ownNeeds.fun=clamp((Number.isFinite(ownNeeds.fun)?ownNeeds.fun:0)+3,0,100);
  const roommate=occupants(home).find(x=>x!==id);
  if(roommate){
   const other=api.getNeeds?.(roommate);
   if(obj(other))other.social=clamp((Number.isFinite(other.social)?other.social:0)+3,0,100);
  }
  if(n<3&&n+1===3)api.notify?.('✦ '+c.profile.name+' earned a handmade memento for '+c.profile.title+'! Look beside the favorite furniture.');
  else api.notify?.(c.profile.name+' enjoyed a favorite little ritual at home. 🌷');
  // A real guided/autonomous/studio action already owns save and updateUI.
  return {id,home,count:d.counts[k],earned:d.counts[k]===3};
 }
 function panel(home){
  if(!HOMES.includes(home))return '';
  const members=occupants(home);
  const cards=members.map(id=>{
   const c=corner(home,id),f=c.profile;
   const status=c.ready?'✓ '+f.name+' has a '+propName[f.prop]+'.':'A '+propName[f.prop]+' would make this corner feel complete.';
   const item=c.completed?'✦ Handmade personal memento earned':'Little ritual memories: '+Math.min(3,c.count)+' / 3 days';
   return '<article class="pc31-person"><div class="pc31-mark" style="--pc-color:'+f.color+'"><span>✿</span></div><div class="pc31-info"><small>'+esc(f.name)+'’S FAVORITE PLACE</small><h4>'+esc(f.title)+'</h4><p>'+esc(f.detail)+'</p><p class="pc31-status '+(c.ready?'pc31-ready':'')+'">'+esc(status)+'</p><div class="pc31-progress" aria-label="'+Math.min(c.count,3)+' out of 3 ritual days">'+[0,1,2].map(i=>'<span class="'+(i<c.count?'full':'')+'"></span>').join('')+'</div><small class="pc31-memory">'+esc(item)+' · Real '+esc(f.action)+' activities only</small></div></article>';
  }).join('');
  const history=data().memories.filter(m=>m.home===home).slice(-3).reverse().map(m=>
   '<li>Day '+m.day+' · '+esc(FAVORITES[m.id].name)+' enjoyed their '+esc(FAVORITES[m.id].title.toLowerCase())+'</li>').join('');
  return '<section class="pc31-book"><div class="pc31-intro"><small>PERSONAL PLACES · DAILY LIFE</small><h3>✿ The Corners That Feel Like Us</h3><p>Furniture matters to the people who live here. Decorate around their interests, then let them finish genuine favorite routines on three different days to earn a handmade keepsake.</p><b>+'+comfort(home)+' / 4 personality comfort</b></div><div class="pc31-grid">'+(cards||'<p>No residents live here yet. There will be personal corners when someone moves in.</p>')+'</div><ul class="pc31-history">'+(history||'<li>Little memories will appear after a real favorite activity.</li>')+'</ul><p class="pc31-note">A favorite furnishing gives +2 actual home comfort for each resident, under the normal 100 cap. Completing a matched daily routine grants +3 Fun to that resident and +3 Social to their roommate. No coins, dishes or XP are generated by decorating or viewing the book.</p></section>';
 }
 function draw(g,home,{tick=0}={}){
  if(!HOMES.includes(home))return;
  for(const id of occupants(home)){
   const c=corner(home,id);
   if(!c?.ready)continue;
   const x=c.furniture.x+17,y=c.furniture.y-32,f=c.profile;
   g.save();g.translate(x,y);
   // All six are bespoke Canvas ornaments anchored to the *real placed
   // furniture*, never an image or fixed coordinate unrelated to the room.
   g.fillStyle='#344b4933';g.beginPath();g.ellipse(0,3,30,9,0,0,Math.PI*2);g.fill();
   g.fillStyle='#b38665';g.fillRect(-26,-23,52,25);
   g.fillStyle='#f3ddb7';g.fillRect(-23,-27,46,23);
   g.fillStyle=f.color;g.fillRect(-20,-25,40,4);
   if(id==='mabel'){
    g.fillStyle='#a98469';g.fillRect(-10,-14,20,17);g.fillStyle='#89b98d';g.beginPath();g.ellipse(-8,-19,10,5,-.3,0,6.283);g.ellipse(8,-21,10,5,.4,0,6.283);g.fill();
   }else if(id==='rosie'){
    g.fillStyle='#f1e0c3';g.beginPath();g.ellipse(0,-12,14,7,0,0,6.283);g.fill();g.fillStyle='#b77e67';g.fillRect(-7,-18,14,10);g.strokeStyle='#f0dcb8';g.lineWidth=3;g.beginPath();g.arc(9,-13,6,-1.8,1.2);g.stroke();
   }else if(id==='oliver'){
    for(let i=-1;i<=1;i++){g.fillStyle=i===0?'#dca676':'#f2c88f';g.beginPath();g.ellipse(i*11,-14,11,6,0,0,6.283);g.fill()}
   }else if(id==='jun'){
    g.fillStyle='#7e9da9';g.fillRect(-17,-21,34,16);g.fillStyle='#f5edd9';g.fillRect(-14,-19,29,11);g.strokeStyle='#866d58';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-21);g.lineTo(0,-5);g.stroke();
   }else if(id==='bea'){
    for(let i=-1;i<=1;i++){g.strokeStyle=['#a982b6','#8fb7a2','#d69c78'][i+1];g.lineWidth=3;g.beginPath();g.moveTo(i*9,-7);g.lineTo(i*9-2,-26);g.stroke()}
    g.fillStyle='#c19b7d';g.fillRect(-17,-8,34,6);
   }else{
    g.fillStyle='#7fa8a3';g.beginPath();g.moveTo(-18,-14);g.lineTo(17,-14);g.lineTo(5,-5);g.lineTo(-8,-5);g.closePath();g.fill();
    g.strokeStyle='#f7e9c8';g.lineWidth=2;g.beginPath();g.moveTo(0,-27);g.lineTo(0,-12);g.lineTo(11,-12);g.closePath();g.stroke();
   }
   if(c.completed){
    g.fillStyle='#eed5a0';g.beginPath();g.arc(24,-27+Math.sin(tick*2)*1.5,6,0,6.283);g.fill();
    g.fillStyle='#fff6dd';g.beginPath();g.arc(24,-27,3,0,6.283);g.fill();
   }
   g.restore();
  }
 }
 return {corner,comfort,recordAction,panel,draw,get data(){return data()}};
}
root.HearthPersonalCorners={setup,clean,FAVORITES,HOMES,IDS};
})(window);
