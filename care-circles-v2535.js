/* Hearth & Harbor v2.5.35 — Little Acts of Care
 * Needs-driven help between two actual housemates. Requests are not work:
 * only a completed, first genuine existing home action may fulfill them.
 */
(function(root){'use strict';
const HOMES=['h0','h1','h2','h3','h4','h5'],IDS=['mabel','rosie','oliver','jun','bea','finn'];
const CARE={
 food:{action:'meal',title:'A Warm Meal',icon:'🥣',desc:'Prepare something comforting when someone is hungry.',shade:'#d8b08a'},
 social:{action:'chat',title:'A Listening Ear',icon:'💗',desc:'Make time for a conversation with someone feeling lonely.',shade:'#d7a8af'},
 fun:{action:'read',title:'A Shared Chapter',icon:'📖',desc:'Read a story when someone needs a bright moment.',shade:'#a2bdad'},
 energy:{action:'tidy',title:'A Quiet Place to Rest',icon:'🧺',desc:'Tidy a calm corner to help a tired roommate unwind.',shade:'#a3b9d0'}
};
const NEEDS=Object.keys(CARE);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const validDay=n=>Number.isInteger(n)&&n>=1&&n<=9999;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pair=ids=>ids.slice().sort().join('|');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw){
 const src=obj(raw)?raw:{},out={requests:{},daily:{},personDaily:{},history:[],keepsakes:[]};
 for(const home of HOMES){
  const r=src.requests?.[home];
  if(obj(r)&&validDay(r.day)&&IDS.includes(r.carer)&&IDS.includes(r.recipient)&&r.carer!==r.recipient&&
   NEEDS.includes(r.need)&&r.status==='pending')out.requests[home]={
    day:r.day,carer:r.carer,recipient:r.recipient,need:r.need,status:'pending'};
  if(validDay(src.daily?.[home]))out.daily[home]=src.daily[home];
 }
 for(const id of IDS)if(validDay(src.personDaily?.[id]))out.personDaily[id]=src.personDaily[id];
 if(Array.isArray(src.history))for(const m of src.history.slice(-200)){
  if(!obj(m)||!HOMES.includes(m.home)||!validDay(m.day)||!IDS.includes(m.carer)||!IDS.includes(m.recipient)||
   m.carer===m.recipient||!NEEDS.includes(m.need))continue;
  if(out.history.some(e=>e.home===m.home&&e.day===m.day))continue;
  out.history.push({home:m.home,day:m.day,carer:m.carer,recipient:m.recipient,need:m.need});
 }
 out.history=out.history.slice(-48);
 if(Array.isArray(src.keepsakes))out.keepsakes=[...new Set(src.keepsakes.filter(x=>HOMES.includes(x)))].slice(0,6);
 return out;
}
function setup(api){
 const state=()=>api.getState();
 const db=()=>{
  const s=state();
  if(!obj(s.careCircles)||!obj(s.careCircles.requests)||!obj(s.careCircles.daily)||!obj(s.careCircles.personDaily)||
    !Array.isArray(s.careCircles.history)||!Array.isArray(s.careCircles.keepsakes))s.careCircles=clean(s.careCircles);
  return s.careCircles;
 };
 const members=home=>!HOMES.includes(home)?[]:[...new Set((api.getHomeMembers?.(home)||[]).filter(
  id=>IDS.includes(id)&&api.getResidentHome?.(id)===home))].slice(0,2);
 const name=id=>esc(api.getPersonLabel?.(id)||id);
 const homeName=home=>esc(api.getHomeLabel?.(home)||home);
 const needValue=(id,need)=>{const n=api.getNeeds?.(id)?.[need];return Number.isFinite(n)?clamp(n,0,100):null};
 const story=home=>db().history.filter(e=>e.home===home);
 const keepsake=home=>db().keepsakes.includes(home);
 const comfort=home=>keepsake(home)?2:0;
 function current(home){
  if(!HOMES.includes(home)||!validDay(state().day)||db().daily[home]===state().day)return null;
  const r=db().requests[home],people=members(home);
  return r?.day===state().day&&people.length===2&&people.includes(r.carer)&&people.includes(r.recipient)?r:null;
 }
 function eligible(home,recipient,need){
  const people=members(home);
  if(!HOMES.includes(home)||people.length!==2||!people.includes(recipient)||!NEEDS.includes(need)||!validDay(state().day))
   return {ok:false,reason:'Two current housemates are required.'};
  const carer=people.find(id=>id!==recipient);
  if(db().daily[home]===state().day)return {ok:false,reason:'This home already shared its daily act of care.'};
  if(db().personDaily[recipient]===state().day||db().personDaily[carer]===state().day)
   return {ok:false,reason:'One of these residents already helped or received care today.'};
  const amount=needValue(recipient,need);
  if(amount===null||amount>59)return {ok:false,reason:'This resident is comfortable here. Care requests appear when a need falls below 60.'};
  const action=CARE[need].action,done=api.getDone?.(carer);
  if(!Array.isArray(done)||done.includes(action))return {ok:false,reason:name(carer)+' already completed this activity today.'};
  return {ok:true,reason:'A real action can help.',carer,recipient,need,action,amount};
 }
 function choose(home,recipient,need){
  const c=eligible(home,recipient,need);if(!c.ok)return false;
  db().requests[home]={day:state().day,carer:c.carer,recipient,need,status:'pending'};
  api.save?.();api.updateUI?.();
  api.notify?.(name(c.carer)+' can help '+name(recipient)+' by doing '+CARE[need].title.toLowerCase()+'. Completing the real activity is what matters.');
  return true;
 }
 function cancel(home){
  if(!current(home))return false;
  delete db().requests[home];api.save?.();api.updateUI?.();
  api.notify?.('The unfinished request was set aside. No rewards or memories were granted.');
  return true;
 }
 function queue(home){
  const r=current(home);if(!r)return false;
  const act=CARE[r.need].action,plan=api.getSchedule?.(home,r.carer);
  if(!Array.isArray(plan)||(api.getDone?.(r.carer)||[]).includes(act))return false;
  if(plan.includes(act))return true;
  if(plan.length>=3)return false;
  const ok=api.addSchedule?.(home,r.carer,act);
  if(ok)api.notify?.('The real caring activity is in '+name(r.carer)+'’s independent Daybook.');
  return !!ok;
 }
 // Call only from the normal completed action observer, inside that action's
 // existing save transaction. A pending request or planner tap never earns care.
 function completed(home,id,action,first=true,day=state().day){
  if(!first||!validDay(day)||day!==state().day||!HOMES.includes(home)||!IDS.includes(id))return false;
  const r=current(home);
  if(!r||r.carer!==id||CARE[r.need].action!==action)return false;
  const target=api.getNeeds?.(r.recipient),carer=api.getNeeds?.(id);
  if(!obj(target)||!obj(carer)||!Number.isFinite(target[r.need]))return false;
  const gain=clamp(85-clamp(target[r.need],0,100),0,12);
  // The need may already be met by other real actions, notably chat/meal.
  // Count the completed caring gesture, but do not overrestore a filled need.
  target[r.need]=clamp(target[r.need]+gain,0,100);
  carer.social=clamp((Number.isFinite(carer.social)?carer.social:0)+2,0,100);
  const key=pair([id,r.recipient]);
  if(!obj(state().townBonds))state().townBonds={};
  state().townBonds[key]=clamp((Number.isFinite(state().townBonds[key])?state().townBonds[key]:0)+1,0,100);
  db().daily[home]=day;
  db().personDaily[id]=day;db().personDaily[r.recipient]=day;
  db().history.push({home,day,carer:id,recipient:r.recipient,need:r.need});
  db().history=db().history.slice(-48);
  delete db().requests[home];
  const count=story(home).length;
  const earned=count>=3&&!keepsake(home);
  if(earned)db().keepsakes.push(home);
  api.notify?.('💗 '+name(id)+' helped '+name(r.recipient)+' feel cared for.'+
    (earned?' A hand-stitched quilt is now displayed in their home!':''));
  return {home,day,need:r.need,gain,keepsake:earned};
 }
 function view(home){
  const target=HOMES.includes(home)?home:'h0',people=members(target),active=current(target),record=story(target).slice(-5).reverse();
  const tabs=HOMES.map(h=>'<button data-act="cc35-view" data-id="'+h+'" aria-pressed="'+(h===target)+'">'+homeName(h)+'</button>').join('');
  const candidates=people.length===2?people.map(id=>
   '<article class="cc35-person"><h4>'+name(id)+' could use</h4><div class="cc35-needs">'+NEEDS.map(need=>{
    const c=eligible(target,id,need),n=needValue(id,need),selected=active?.recipient===id&&active.need===need;
    return '<button data-act="cc35-choose" data-id="'+target+'|'+id+'|'+need+'" '+(!c.ok||selected?'disabled':'')+
      ' title="'+esc(c.reason)+'"><span>'+CARE[need].icon+'</span><strong>'+CARE[need].title+'</strong><small>'+
      need.toUpperCase()+' '+(n===null?'–':Math.round(n))+'/100'+(selected?' · Selected':'')+'</small></button>';
   }).join('')+'</div></article>').join(''):
   '<p class="cc35-empty">Two residents need to share a home before someone can offer hands-on care.</p>';
  const activeHtml=active?'<section class="cc35-active"><h4>'+CARE[active.need].icon+' '+CARE[active.need].title+'</h4><p>'+
   name(active.carer)+' is helping '+name(active.recipient)+'. Their existing <b>'+CARE[active.need].action+
   '</b> activity must genuinely finish inside this home.</p><div class="cc35-buttons"><button data-act="cc35-queue" data-id="'+target+'">🗓️ Queue the real caring activity</button>'+
   '<button data-act="cc35-cancel" data-id="'+target+'">Set aside this request</button></div></section>':'';
  const memories=record.map(m=>'<li>Day '+m.day+' · '+name(m.carer)+' helped '+name(m.recipient)+' with '+CARE[m.need].title.toLowerCase()+'</li>').join('');
  const result='<section class="cc35-book"><header class="cc35-cover"><small>ONE LITTLE HOME · MANY WAYS TO CARE</small><h2>💗 Little Acts of Care</h2>'+
    '<p>Sometimes a housemate needs extra kindness. Notice their real needs, choose a caring response and let the other resident complete their actual activity.</p>'+
    '<b>'+story(target).length+' caring days · '+(keepsake(target)?'Hand-stitched quilt earned':'Three genuine days earn a home quilt')+'</b></header>'+
    '<div class="cc35-tabs">'+tabs+'</div><h3>'+homeName(target)+'</h3>'+
    (db().daily[target]===state().day?'<p class="cc35-done">✓ This household completed a meaningful caring activity today.</p>':activeHtml)+
    '<div class="cc35-grid">'+candidates+'</div><div class="cc35-history"><h4>Our everyday kindness</h4><ul>'+
    (memories||'<li>Real acts of care will be remembered here.</li>')+'</ul></div>'+
    '<p class="cc35-note">Requests unlock for needs below 60. Genuine completion can restore up to 12 of the target need, +2 caregiver Social and +1 relationship bond, once per home and pair per day. Three completed caring days earn an illustrated quilt and +2 permanent home comfort. Nothing is earned by opening this book, choosing or scheduling a request; you can guide the activity yourself or let independent routines do it.</p>'+
    '<button class="cc35-back" data-act="cc35-back">Return to Household Daybook</button></section>';
  api.showModal?.('care-circles',result);
 }
 function handle(action,id,home){
  if(action==='cc35-board')return view(HOMES.includes(id)?id:home);
  if(action==='cc35-view')return view(id);
  if(action==='cc35-choose'){const arr=typeof id==='string'?id.split('|'):[];if(arr.length===3)choose(...arr);return view(arr[0]||home)}
  if(action==='cc35-cancel'){cancel(id);return view(id)}
  if(action==='cc35-queue'){if(!queue(id))api.notify?.('The caring activity is already completed or the independent plan is full. Try guiding the resident or freeing a slot.');return view(id)}
  if(action==='cc35-back')return api.back?.();
  return false;
 }
 function draw(g,home){
  if(!HOMES.includes(home))return;
  const active=current(home),quilt=keepsake(home);if(!active&&!quilt)return;
  g.save();g.translate(348,307);
  if(quilt){
   g.fillStyle='#a57463';g.fillRect(-71,-72,142,108);
   g.fillStyle='#efdcc4';g.fillRect(-65,-65,130,96);
   for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    g.fillStyle=(row+col)%3===0?'#b8d2b3':(row+col)%3===1?'#e7bbad':'#efd8a7';
    g.fillRect(-56+col*28,-58+row*27,26,25);
    g.strokeStyle='#fdf1d9';g.lineWidth=1;g.strokeRect?.(-56+col*28,-58+row*27,26,25);
   }
  }
  if(active){
   g.fillStyle='#745c55';g.fillRect(-48,46,96,21);g.fillStyle='#f7e8c6';g.fillRect(-44,49,88,15);
   g.fillStyle=CARE[active.need].shade;g.beginPath();g.arc(0,36,15,0,Math.PI*2);g.fill();
   g.fillStyle='#fff5dd';g.font='bold 11px system-ui';g.textAlign='center';g.fillText('♥',0,40);
   g.fillStyle='#68564b';g.font='bold 8px system-ui';g.fillText('CARING TODAY',0,61);
  }
  g.restore();
 }
 return {clean,choose,cancel,queue,current,eligible,completed,view,handle,draw,comfort,get data(){return db()}};
}
root.HearthCareCircles={setup,clean,CARE,HOMES,IDS};
})(window);
