/* Hearth & Harbor v2.5.37 — The Heirloom Cabinet
 * Every handmade heirloom requires an authentic historical achievement AND
 * the real completion of a first daily hobby action. Gifting moves the one
 * physical object. The original historical story stays in the original home.
 * No counterfeit heirs, family trees, passive payouts or duplicated objects.
 */
(function(root){'use strict';
const HOMES=['player','h0','h1','h2','h3','h4','h5'];
const RESIDENTS=['player','mabel','rosie','oliver','jun','bea','finn'];
const KINDS={move:{title:'The First House Key',subtitle:'A new beginning',shade:'#d2b8a2'},
 project:{title:'The Together Figurine',subtitle:'A little shared adventure',shade:'#c5b4cd'},
 supper:{title:'The Family Supper Plate',subtitle:'Good food and warm stories',shade:'#dbb58e'},
 tradition:{title:'The Village Memory Wreath',subtitle:'Roots that last',shade:'#a6c6a2'},
 corner:{title:'The Favorite Nook Album',subtitle:'A place to belong',shade:'#b5c9c9'}};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const dayOK=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const sourceOK=s=>typeof s==='string'&&s.length>0&&s.length<=90&&/^[a-z0-9:|_-]+$/i.test(s);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\u0027':'&#39;'}[c]));
const idOf=(origin,source)=>origin+'|'+source;
const validEvent=e=>object(e)&&HOMES.includes(e.home)&&dayOK(e.day)&&sourceOK(e.source)&&Object.prototype.hasOwnProperty.call(KINDS,e.kind);
const knownOwner=(x)=>HOMES.includes(x);
function clean(raw){
 const src=object(raw)?raw:{},out={items:[],pending:{},daily:{},makerDay:{},giftDay:{},history:[]},holders={};
 if(Array.isArray(src.items))for(const item of src.items.slice(-100)){
  if(!object(item)||!knownOwner(item.origin)||!knownOwner(item.holder)||!sourceOK(item.source)||
   !Object.prototype.hasOwnProperty.call(KINDS,item.kind)||!RESIDENTS.includes(item.maker)||!dayOK(item.day)||
   !dayOK(item.eventDay)||item.eventDay>item.day||!Number.isInteger(item.gifts)||item.gifts<0||item.gifts>99||
   item.lastGiftDay!==0&&!dayOK(item.lastGiftDay))continue;
  const key=idOf(item.origin,item.source);
  if(out.items.some(x=>idOf(x.origin,x.source)===key)||out.items.length>=42||(holders[item.holder]||0)>=2)continue;
  out.items.push({origin:item.origin,holder:item.holder,source:item.source,kind:item.kind,maker:item.maker,day:item.day,
   eventDay:item.eventDay,gifts:item.gifts,lastGiftDay:item.lastGiftDay,elderMade:item.elderMade===true});
  holders[item.holder]=(holders[item.holder]||0)+1;
 }
 for(const home of HOMES){
  const p=src.pending?.[home];
  if(object(p)&&dayOK(p.day)&&RESIDENTS.includes(p.maker)&&sourceOK(p.source))out.pending[home]={day:p.day,maker:p.maker,source:p.source};
  if(dayOK(src.daily?.[home]))out.daily[home]=src.daily[home];
  if(dayOK(src.giftDay?.[home]))out.giftDay[home]=src.giftDay[home];
 }
 for(const id of RESIDENTS)if(dayOK(src.makerDay?.[id]))out.makerDay[id]=src.makerDay[id];
 if(Array.isArray(src.history))for(const h of src.history.slice(-180)){
  if(!object(h)||!dayOK(h.day)||!knownOwner(h.home)||!knownOwner(h.origin)||!sourceOK(h.source)||
   !['made','gift'].includes(h.kind)||!RESIDENTS.includes(h.person))continue;
  if(out.history.some(e=>e.kind===h.kind&&e.source===h.source&&e.origin===h.origin&&e.day===h.day&&e.home===h.home))continue;
  out.history.push({day:h.day,home:h.home,origin:h.origin,source:h.source,kind:h.kind,person:h.person});
 }
 out.history=out.history.slice(-48);
 return out;
}
function setup(api){
 const state=()=>api.getState();
 const data=()=>{
  const s=state();
  if(!object(s.heirlooms)||!Array.isArray(s.heirlooms.items)||!object(s.heirlooms.pending)||
   !object(s.heirlooms.daily)||!object(s.heirlooms.makerDay)||!object(s.heirlooms.giftDay)||!Array.isArray(s.heirlooms.history))
   s.heirlooms=clean(s.heirlooms);
  return s.heirlooms;
 };
 const occupants=home=>{
  if(home==='player')return ['player'];
  return HOMES.includes(home)?[...new Set((api.getHomeMembers?.(home)||[])
   .filter(id=>RESIDENTS.includes(id)&&id!=='player'&&api.getResidentHome?.(id)===home))].slice(0,2):[];
 };
 const label=id=>esc(api.getPersonLabel?.(id)||id);
 const houseLabel=home=>esc(api.getHomeLabel?.(home)||home);
 const proof=home=>HOMES.includes(home)?(api.getMemories?.(home)||[])
  .filter(e=>validEvent(e)&&e.home===home&&e.day<=state().day).slice(-70):[];
 const findProof=(home,source)=>proof(home).find(e=>e.source===source);
 const items=home=>data().items.filter(x=>x.holder===home);
 const sourceUsed=(home,source)=>data().items.some(x=>x.origin===home&&x.source===source);
 const craftHome=id=>id==='player'?'player':api.getResidentHome?.(id);
 const current=home=>{
  if(!HOMES.includes(home)||!dayOK(state().day))return null;
  const p=data().pending[home];
  return p&&p.day===state().day&&occupants(home).includes(p.maker)&&
   findProof(home,p.source)&&!sourceUsed(home,p.source)?p:null;
 };
 const elig=(home,maker,source)=>{
  if(!dayOK(state().day)||!HOMES.includes(home)||!occupants(home).includes(maker))return {ok:false,reason:'A resident must genuinely live in the home.'};
  const e=findProof(home,source);
  if(!e)return {ok:false,reason:'Only a genuine completed memory from this home can inspire an heirloom.'};
  if(sourceUsed(home,source))return {ok:false,reason:'A unique keepsake already commemorates this memory.'};
  if(items(home).length>=2)return {ok:false,reason:'The home has two displayed heirlooms. Gift one before making another.'};
  if(data().daily[home]===state().day||data().makerDay[maker]===state().day)return {ok:false,reason:'This home or maker has already finished their craft today.'};
  if(current(home))return {ok:false,reason:'Finish or cancel the current handmade project first.'};
  if((api.getDone?.(maker)||[]).includes('hobby'))return {ok:false,reason:'The maker has already completed their hobby today.'};
  return {ok:true,event:e};
 };
 function begin(home,maker,source){
  const e=elig(home,maker,source);if(!e.ok)return false;
  data().pending[home]={day:state().day,maker,source};
  api.save?.();api.updateUI?.();
  api.notify?.(label(maker)+' will make a one-of-a-kind '+KINDS[e.event.kind].title.toLowerCase()+'. They must finish a real hobby activity.');
  return true;
 }
 function cancel(home){
  if(!current(home))return false;
  delete data().pending[home];api.save?.();api.updateUI?.();return true;
 }
 function queue(home){
  const p=current(home);
  if(!p||(api.getDone?.(p.maker)||[]).includes('hobby'))return false;
  if(p.maker==='player')return api.queuePlayerHobby?.()===true;
  const planned=api.getSchedule?.(home,p.maker);
  if(!Array.isArray(planned))return false;
  if(planned.includes('hobby'))return true;
  if(planned.length>=3)return false;
  return api.addSchedule?.(home,p.maker,'hobby')===true;
 }
 function completed(home,maker,action,first=true,day=state().day){
  if(!first||action!=='hobby'||!dayOK(day)||day!==state().day)return false;
  const p=current(home);
  if(!p||p.maker!==maker||craftHome(maker)!==home)return false;
  const e=findProof(home,p.source);
  if(!e||sourceUsed(home,p.source)||items(home).length>=2||
   data().daily[home]===day||data().makerDay[maker]===day)return false;
  const elderMade=api.isElder?.(maker)===true;
  const keepsake={origin:home,holder:home,source:p.source,kind:e.kind,maker,day,eventDay:e.day,gifts:0,lastGiftDay:0,elderMade};
  data().items.push(keepsake);
  data().daily[home]=day;data().makerDay[maker]=day;
  data().history.push({day,home,origin:home,source:p.source,kind:'made',person:maker});
  data().history=data().history.slice(-48);
  delete data().pending[home];
  api.notify?.('✦ '+label(maker)+' finished an heirloom for '+houseLabel(home)+'! It is now displayed in the real home.');
  return {item:keepsake,finished:true};
 }
 function canGift(item,destination,recipient){
  if(!item||!HOMES.includes(destination)||destination===item.holder||!occupants(destination).includes(recipient))
   return {ok:false,reason:'Choose another occupied home and a real resident to receive the gift.'};
  const key=idOf(item.origin,item.source);
  if(!data().items.some(x=>idOf(x.origin,x.source)===key&&x.holder===item.holder))return {ok:false,reason:'This heirloom is no longer in that home.'};
  if(items(destination).length>=2)return {ok:false,reason:'The recipient’s home has no free heirloom space.'};
  if(data().giftDay[item.holder]===state().day||data().giftDay[destination]===state().day||item.lastGiftDay===state().day)
   return {ok:false,reason:'A home can give or receive only one heirloom per day.'};
  if(!occupants(item.holder).length)return {ok:false,reason:'Someone must live in the giving home to pass on a keepsake.'};
  return {ok:true};
 }
 function gift(origin,source,destination,recipient){
  const item=data().items.find(x=>x.origin===origin&&x.source===source);
  if(!canGift(item,destination,recipient).ok)return false;
  const old=item.holder;item.holder=destination;item.gifts++;item.lastGiftDay=state().day;
  data().giftDay[old]=state().day;data().giftDay[destination]=state().day;
  data().history.push({day:state().day,home:destination,origin:item.origin,source:item.source,kind:'gift',person:recipient});
  data().history=data().history.slice(-48);
  api.save?.();api.updateUI?.();
  api.notify?.('🎁 '+label(recipient)+' received the '+KINDS[item.kind].title+'. The original memory stays with its first home.');
  return true;
 }
 const comfort=home=>HOMES.includes(home)?Math.min(4,items(home).length*2):0;
 function board(home){
  const selected=HOMES.includes(home)?home:'player',people=occupants(selected),craft=current(selected),eligibleSources=proof(selected).filter(e=>!sourceUsed(selected,e.source));
  const choices=craft?'<section class="hl37-active"><h3>✦ A handmade heirloom is in progress</h3><p>'+label(craft.maker)+' needs to finish a real <b>Hobby</b> activity. Directly guide them or add that step to their normal daybook.</p><button data-act="hl37-queue" data-id="'+selected+'">🗓️ Queue the real crafting activity</button><button data-act="hl37-cancel" data-id="'+selected+'">Set this craft aside</button></section>':'<div class="hl37-catalog">'+
   (eligibleSources.length?eligibleSources.slice(-12).reverse().map(e=>'<article><b>'+KINDS[e.kind].title+'</b><small>Day '+e.day+' · '+KINDS[e.kind].subtitle+'</small><div class="hl37-choices">'+people.map(person=>{
    const ok=elig(selected,person,e.source).ok;
    return '<button data-act="hl37-make" data-id="'+selected+'|'+person+'|'+e.source+'" '+(ok?'':'disabled')+'>✂️ Let '+label(person)+' make it</button>';
   }).join('')+'</div></article>').join(''):'<p>Complete home milestones first—shared projects, traditions, suppertimes, house moves and personal corners can all inspire keepsakes.</p>')+'</div>';
  const display=items(selected).map(item=>{
   const key=item.origin+'|'+item.source;
   const recipients=HOMES.filter(home=>home!==selected).flatMap(home=>occupants(home).map(id=>({home,id})));
   return '<article class="hl37-item"><div class="hl37-stamp">✦</div><div class="hl37-item-body"><b>'+KINDS[item.kind].title+'</b><p>Made by '+label(item.maker)+' on Day '+item.day+' · Origin: '+houseLabel(item.origin)+
    ' · Passed on '+item.gifts+' times'+(item.elderMade?' · Elder-crafted':'')+'</p><div class="hl37-recips">'+recipients.map(({home,id})=>
    '<button data-act="hl37-gift" data-id="'+key+'|'+home+'|'+id+'" '+(canGift(item,home,id).ok?'':'disabled')+
    '>🎁 Gift to '+label(id)+' at '+houseLabel(home)+'</button>').join('')+'</div></div></article>';
  }).join('');
  const history=data().history.filter(h=>h.home===selected).slice(-4).reverse().map(h=>
   '<li>Day '+h.day+' · '+(h.kind==='made'?label(h.person)+' finished a handmade memory':label(h.person)+' received an heirloom')+'</li>').join('');
  api.showModal?.('heirloom-cabinet','<section class="hl37-book"><header class="hl37-cover"><small>A HANDMADE LEGACY · REAL HOUSEHOLD HISTORY</small><h2>✦ The Heirloom Cabinet</h2><p>Turn a memory you genuinely earned into an original handmade object. A resident must complete a real hobby. Then choose whether the keepsake stays home or travels as a gift.</p><b>'+data().items.length+' unique heirlooms · '+items(selected).length+'/2 here</b></header><div class="hl37-tabs">'+
   HOMES.map(h=>'<button data-act="hl37-view" data-id="'+h+'" aria-pressed="'+(h===selected)+'">'+houseLabel(h)+'</button>').join('')+'</div><h3>'+houseLabel(selected)+'</h3>'+
   '<h4>Our keepsakes</h4><div class="hl37-items">'+(display||'<p>No crafted heirlooms live here yet.</p>')+'</div><h4>Make something from our history</h4>'+choices+
   '<div class="hl37-history"><h4>Our little giving stories</h4><ul>'+(history||'<li>Earn, craft and share memories to begin this history.</li>')+'</ul></div>'+
   '<p class="hl37-note">Crafting requires a genuine prior Chronicle event and the first actually completed hobby of the day. Each source produces only one original heirloom across all homes. Moving the heirloom changes its home; it never duplicates. Up to two displayed per home add +2 comfort each (maximum +4 within the 100 cap). Gifting is a voluntary household choice, not a fictional blood relationship, legal inheritance or automatic income.</p>'+
   '<button data-act="hl37-back" class="hl37-back">Return to the Daybook</button></section>');
 }
 function handle(action,id,home){
  if(action==='hl37-view'||action==='hl37-board')return board(HOMES.includes(id)?id:home);
  if(action==='hl37-make'){
   const parts=typeof id==='string'?id.split('|'):[],h=parts.shift(),maker=parts.shift(),source=parts.join('|');
   begin(h,maker,source);return board(h);
  }
  if(action==='hl37-gift'){
   const a=typeof id==='string'?id.split('|'):[],origin=a.shift();
   // source may contain |, but its last two elements are home and recipient.
   const recipient=a.pop(),destination=a.pop(),source=a.join('|');
   const item=data().items.find(x=>x.origin===origin&&x.source===source);
   const currentHolder=item?.holder||origin;
   const gifted=gift(origin,source,destination,recipient);return board(gifted?destination:currentHolder);
  }
  if(action==='hl37-queue'){if(!queue(id))api.notify?.('The crafter already finished their hobby, or their Daybook is full. Guide them or free a schedule slot.');return board(id)}
  if(action==='hl37-cancel'){cancel(id);return board(id)}
  if(action==='hl37-back')return api.back?.();
  return false;
 }
 function draw(g,home){
  const list=items(home);if(!list.length)return;
  for(let i=0;i<list.length;i++){
   const item=list[i],x=i===0?331:850,y=390,ink=KINDS[item.kind].shade;
   g.save();g.translate(x,y);
   // Original built-in miniature, with carved wood, shadow and pale felt.
   g.fillStyle='#2b4b4538';g.beginPath();g.ellipse(0,11,57,16,0,0,6.283);g.fill();
   g.fillStyle='#986f53';g.fillRect(-51,-62,102,76);
   g.fillStyle='#e4b98d';g.fillRect(-46,-57,92,64);
   g.fillStyle='#f4e8cf';g.fillRect(-39,-50,78,50);
   g.fillStyle=ink;g.fillRect(-34,-45,68,39);
   g.fillStyle='#fcf3db';
   if(item.kind==='move'){
    g.beginPath();g.arc(-12,-25,8,0,6.283);g.fill();g.fillRect(-7,-29,28,7);g.fillRect(15,-22,5,8);
    g.fillStyle=ink;g.beginPath();g.arc(-12,-25,3,0,6.283);g.fill();
   }else if(item.kind==='project'){
    for(const xx of [-14,14]){g.beginPath();g.arc(xx,-32,7,0,6.283);g.fill();g.fillRect(xx-8,-25,16,15)}
   }else if(item.kind==='supper'){
    g.beginPath();g.ellipse(0,-25,23,16,0,0,6.283);g.fill();
    g.fillStyle=ink;g.beginPath();g.ellipse(0,-25,15,10,0,0,6.283);g.fill();
   }else if(item.kind==='tradition'){
    g.strokeStyle='#fcf3db';g.lineWidth=5;g.beginPath();g.arc(0,-26,16,0,6.283);g.stroke();
    for(const px of [-14,0,14]){g.fillStyle='#f7dbb3';g.beginPath();g.arc(px,-35,5,0,6.283);g.fill()}
   }else{
    g.fillStyle='#f6edd6';g.fillRect(-23,-37,46,25);
    g.fillStyle='#79a588';g.beginPath();g.ellipse(-9,-38,11,5,-.3,0,6.283);g.ellipse(11,-36,12,5,.4,0,6.283);g.fill();
   }
   if(item.elderMade){g.fillStyle='#f3d59d';g.beginPath();g.arc(35,-50,6,0,6.283);g.fill()}
   g.fillStyle='#6d523e';g.fillRect(-32,1,64,6);
   g.fillStyle='#fff0d7';g.font='bold 8px system-ui';g.textAlign='center';g.fillText('DAY '+item.eventDay,0,5);
   g.restore();
  }
 }
 return {clean,begin,cancel,queue,completed,gift,canGift,current,elig,items,occupants,proof,comfort,board,handle,draw,get data(){return data()}};
}
root.HearthHeirlooms={setup,clean,HOMES,RESIDENTS,KINDS};
})(window);
