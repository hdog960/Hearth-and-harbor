/* Hearth & Harbor v2.8.9 — Living Cottage Visits.
 * Poppy invites a genuine acquainted villager face-to-face, the SAME
 * villager walks to Poppy's porch the next day using original NPC routing,
 * Poppy greets them at the actual door, and a single home scene contains
 * a moving adult + Pip + Poppy. The three share a real, timed Daybook
 * furniture activity before any memory/bonus can be awarded.
 * No ghost characters, instant visit completion or free menu rewards.
 */
(function(root){'use strict';
const VISITS={
 mabel:{kind:'hobby',icon:'🌸',name:'Flowers for Our Windowsill',
  greet:'Mabel brings a hand-picked petal palette, and asks Pip what should bloom next.',
  open:['Sketch the flowers that are here','Imagine a flower no one has seen'],
  ending:'Mabel and Pip finish arranging the little picture. What deserves a place in this home?',
  close:['A memory of this season','A promise to welcome new growth'],
  lines:['Pip learns to notice quiet beauty with Mabel.','Mabel and Pip leave room for the next beginning.'],need:'curiosity'},
 rosie:{kind:'meal',icon:'🍓',name:'A Neighbor at Our Table',
  greet:'Rosie carries a little market ribbon and offers to help Pip make the table welcoming.',
  open:['Fold a place for someone new','Make each place feel familiar'],
  ending:'The meal is genuinely finished. What will our table mean tomorrow?',
  close:['An invitation to someone new','A thank-you to the people here'],
  lines:['Rosie helps Pip discover how a family table can grow.','Pip learns that gratitude is part of every shared meal.'],need:'confidence'},
 oliver:{kind:'meal',icon:'🥐',name:'A Recipe Worth Sharing',
  greet:'Oliver arrives with an old recipe note, wondering what Pip would cook for someone they love.',
  open:['A cozy berry tart','Something warm and simple'],
  ending:'The kitchen is warm and the household meal is finished. What mattered most?',
  close:['Learning from the cook','Making room for everyone'],
  lines:['Oliver shows Pip that patience can be delicious.','Pip remembers that sharing means more than a recipe.'],need:'confidence'},
 jun:{kind:'read',icon:'📚',name:'Pages for Three',
  greet:'Jun brings a favorite village story and asks Pip where the opening chapter should begin.',
  open:['Under the little orchard tree','Beside a peaceful window'],
  ending:'Poppy truly finished reading with everyone. Which chapter stays with Pip?',
  close:['The courage to begin','The comfort of being heard'],
  lines:['Jun helps Pip turn a quiet thought into a new beginning.','Pip learns that their own voice has a place in every story.'],need:'curiosity'},
 bea:{kind:'hobby',icon:'🎨',name:'Colors in a Family Home',
  greet:'Bea opens her watercolor notebook. What would Pip love to paint together?',
  open:['The late-afternoon sunshine','The colors of a close friendship'],
  ending:'Their real creative session is complete. What makes the picture special?',
  close:['The colors that changed','The people who made it'],
  lines:['Pip finds beauty in how the same place looks different to everyone.','Bea reminds Pip that art holds a little piece of the people we love.'],need:'joy'},
 finn:{kind:'read',icon:'🐟',name:'A Quiet Pond Story',
  greet:'Finn brings his small pond notebook and tells Pip about a wonderful thing he noticed.',
  open:['A fish that slipped away','The shapes of pond-side clouds'],
  ending:'The shared reading really happened. What should Pip remember?',
  close:['To watch patiently','To care for little places'],
  lines:['Finn shows Pip how patience can turn observation into wonder.','Pip remembers to care for places that cannot ask for help.'],need:'curiosity'}
};
const IDS=Object.keys(VISITS),kindOf=id=>VISITS[id]?.kind;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const finite=Number.isFinite,dayOK=x=>Number.isInteger(x)&&x>=1&&x<=9999;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PORCH={x:506,y:518},ENTRY={x:575,y:670};
const ROOMS={read:{x:405,y:398},meal:{x:786,y:414},hobby:{x:682,y:752}};
function clean(raw){
 const source=object(raw)?raw:{},old=Array.isArray(source.memories)?source.memories:[],seen=new Set(),memories=[];
 for(const r of old.slice(-72)){
  if(!object(r)||!IDS.includes(r.id)||!dayOK(r.day)||kindOf(r.id)!==r.kind||
    ![0,1].includes(r.open)||![0,1].includes(r.close)||seen.has(r.id))continue;
  seen.add(r.id);memories.push({id:r.id,day:r.day,kind:r.kind,open:r.open,close:r.close});
 }
 memories.sort((a,b)=>a.day-b.day||a.id.localeCompare(b.id));
 const p=source.pending;
 const pending=object(p)&&IDS.includes(p.id)&&dayOK(p.day)&&
    kindOf(p.id)===p.kind&&!seen.has(p.id)?
    {id:p.id,day:p.day,kind:p.kind}:null;
 return {pending,memories};
}
function setup(api){
 const state=()=>api.getState(),child=()=>api.getChild(),day=()=>dayOK(state().day)?state().day:1;
 const scene=()=>api.getScene?.(),now=()=>finite(state().minute)?state().minute:-1;
 const records=()=>clean(child().homeVisits);
 const current=()=>{const p=records().pending;return p&&p.day>=day()?p:null};
 const earlier=id=>child().guardian==='player'&&dayOK(child().guardianDay)&&
  child().guardianDay<=day()&&IDS.includes(id)&&
  (child().mentor?.counts?.[id]||0)>=1&&
  (Array.isArray(child().meetings)&&child().meetings.some(m=>m.id===id&&dayOK(m.day)&&m.day<=day())||
    Array.isArray(child().helperProjects)&&child().helperProjects.some(m=>m.id===id&&dayOK(m.day)&&m.day<=day()));
 const finished=id=>records().memories.some(r=>r.id===id&&r.day<=day());
 const person=id=>(api.getAdults?.()||[]).find(n=>n.id===id&&finite(n.x)&&finite(n.y))||null;
 let session=null,guest=null,pip=null;
 function invalid(){
  const p=current();
  if(!p||p.day!==day()||!earlier(p.id)||finished(p.id)||
    now()>=1220||now()<0){
   session=null;guest=null;pip=null;return true;
  }
  if(session&&(session.id!==p.id||session.day!==p.day)){
   session=null;guest=null;pip=null;return true;
  }
  return false;
 }
 function inviteEligible(id){
  const p=api.getPlayer?.(),adult=person(id);
  return !!p&&!!adult&&scene()==='town'&&earlier(id)&&!current()&&!finished(id)&&
   day()<9999&&finite(p.x)&&finite(p.y)&&distance(p,adult)<160&&
   !api.hasCompetingEvent?.(id);
 }
 function invitation(id){
  if(!inviteEligible(id))return false;
  const d=VISITS[id],name=esc(api.name?.(id)||id);
  api.closeTalk?.();
  api.showModal?.('little-sprouts','<section class="ls272-book pv289-modal"><header class="ls272-cover"><small>🏡 ONE REAL INVITATION · TOMORROW</small><h2>'+d.icon+' Invite '+name+'</h2><p>'+esc(d.greet)+'</p></header><p>On Day '+(day()+1)+', '+name+' will walk to Poppy’s cottage between 10 AM and early evening. Greet them at the real front door, then lead Pip and your guest to a household activity.</p><p>This is a proper in-world visit, not a free friendship reward.</p><button data-act="pv289-send" data-id="'+id+'">Write the invitation together</button><button class="ls272-secondary" data-act="pv289-cancel">Not today</button></section>');
  return true;
 }
 function send(id){
  if(!inviteEligible(id))return false;
  const c=child(),saved=records();
  c.homeVisits={...saved,pending:{id,day:day()+1,kind:kindOf(id)}};
  api.save?.();api.updateUI?.();api.closeModal?.();
  api.notify?.('💌 Invitation written! '+(api.name?.(id)||id)+' can arrive tomorrow at the real cottage door.');
  return true;
 }
 function windowNow(){return now()>=600&&now()<1200}
 const porch=()=>api.nearestWalkable?.(PORCH,'town')||PORCH;
 function schedule(id,entry){
  if(!entry||invalid()||scene()!=='town'||!windowNow()||current()?.id!==id||
    api.hasCompetingEvent?.(id)||entry.childReply)return entry;
  const p=porch();
  if(!p||!finite(p.x)||!finite(p.y)||api.isWalkable?.(p.x,p.y,'town')===false||
    distance(p,PORCH)>100)return entry;
  return {...entry,h:'pip-home-visit-'+day()+'-'+id,where:[p.x,p.y],
   doing:'walking to Poppy’s cottage for a promised family visit',icon:'💌',mood:'happy',childHomeGuest:true};
 }
 function greetEligible(id){
  if(invalid()||!windowNow()||scene()!=='town'||current()?.id!==id||
   api.hasCompetingEvent?.(id))return false;
  const a=person(id),p=api.getPlayer?.(),por=porch();
  return !!a&&!!p&&!!por&&[p.x,p.y].every(finite)&&
   distance(a,PORCH)<=115&&distance(p,a)<=155&&distance(p,PORCH)<=200;
 }
 function greet(id){
  if(!greetEligible(id))return false;
  session={id,day:day(),kind:kindOf(id),phase:'greeted',open:null};
  guest=null;pip=null;
  api.closeTalk?.();
  api.notify?.('🏡 Your guest really arrived at the cottage. Enter through the normal front door with Poppy to host them.');
  return true;
 }
 function home(){
  return !!session&&!invalid()&&scene()==='home'&&current()?.id===session.id;
 }
 function safe(p){
  const found=api.nearestWalkable?.(p,'home')||p;
  if(!found||!finite(found.x)||!finite(found.y)||distance(p,found)>95||
    api.isWalkable?.(found.x,found.y,'home')===false)return null;
  return {x:found.x,y:found.y};
 }
 function init(){
  if(!home())return false;
  const goal=safe(ROOMS[session.kind]);
  if(!goal)return false;
  if(!guest){guest={...ENTRY,goal,route:[],moving:false,facing:'front',stride:0,repath:0};}
  if(!pip){
   const original=api.getBaseChildPose?.();
   if(!original||![original.x,original.y].every(finite))return false;
   pip={x:original.x,y:original.y,route:[],goal:null,moving:false,facing:'front',stride:0,repath:0};
  }
  return true;
 }
 function clear(from,to){
  if(!from||!to||!finite(from.x)||!finite(from.y)||!finite(to.x)||!finite(to.y))return false;
  const n=Math.max(1,Math.ceil(distance(from,to)/10));
  for(let i=1;i<=n;i++){
   const x=from.x+(to.x-from.x)*i/n,y=from.y+(to.y-from.y)*i/n;
   if(api.isWalkable?.(x,y,'home')===false)return false;
  }
  return true;
 }
 function walk(actor,dest,dt,speed){
  if(!actor||!dest)return false;
  if(distance(actor,dest)<=8){actor.moving=false;actor.route=[];return true}
  actor.repath-=Math.min(.3,dt);
  if(!actor.route.length||!actor.goal||distance(actor.goal,dest)>25||actor.repath<=0){
   const raw=api.findPath?.({x:actor.x,y:actor.y},dest,'home');
   actor.route=Array.isArray(raw)?raw.filter(p=>p&&finite(p.x)&&finite(p.y)).slice(0,90)
    .map(p=>({x:p.x,y:p.y})):[];
   actor.goal={...dest};actor.repath=.55;
  }
  let budget=Math.min(dt,.16)*speed,moved=0;
  for(let i=0;i<4&&actor.route.length&&budget>0;i++){
   const next=actor.route[0],d=distance(actor,next);
   if(d<=2){actor.route.shift();continue}
   const step=Math.min(budget,d),point={x:actor.x+(next.x-actor.x)*step/d,
    y:actor.y+(next.y-actor.y)*step/d};
   if(!clear(actor,point)){actor.route=[];actor.repath=0;break}
   actor.facing=next.y-actor.y< -12?'back':
    Math.abs(next.x-actor.x)>=Math.abs(next.y-actor.y)?'side':'front';
   actor.x=point.x;actor.y=point.y;actor.stride+=step/17;
   moved+=step;budget-=step;if(step>=d-1)actor.route.shift();
  }
  actor.moving=moved>1;
  return distance(actor,dest)<=13;
 }
 function advance(dt){
  if(invalid())return;
  if(!home()){if(guest||pip){guest=null;pip=null}return}
  if(!finite(dt)||dt<=0||api.isPaused?.())return;
  if(!init())return;
  const goal=guest.goal,childGoal=safe({x:goal.x-50,y:goal.y+28});
  walk(guest,goal,dt,112);
  if(childGoal)walk(pip,childGoal,dt,148);
 }
 const guestPose=()=>home()&&guest?{...guest,id:session.id}:null;
 const childPose=()=>home()&&pip?{...pip}:null;
 function hit(x,y){
  const g=guestPose();return g&&finite(x)&&finite(y)&&Math.abs(x-g.x)<=48&&
   Math.abs(y-(g.y-69))<=89?{id:g.id,x:g.x,y:g.y}:null;
 }
 function safeToStart(){
  if(!home()||!init()||!guest||!pip)return false;
  const p=api.getPlayer?.(),g=guest.goal,pg=api.getPlayer?.();
  return !!p&&!!pg&&[p.x,p.y].every(finite)&&distance(p,guest)<=170&&
   distance(p,pip)<=160&&distance(p,g)<=210&&
   distance(guest,g)<=38&&distance(pip,g)<=105&&
   !api.isOwnRoutineBusy?.()&&!api.ownDone?.(session.kind);
 }
 function interact(){
  if(!home())return false;
  if(session.phase==='reflect')return finishPage();
  if(session.phase==='working'){api.notify?.('🧺 Poppy needs to finish the real Household Daybook activity at its furniture.');return false}
  if(!safeToStart()){
   api.notify?.('🌼 Stay near your guest and Pip once they reach the furniture. A free household routine is needed today.');
   return false;
  }
  session.phase='opening';const d=VISITS[session.id];
  api.showModal?.('little-sprouts','<section class="ls272-book pv289-modal"><header class="ls272-cover"><small>🌷 THREE PEOPLE · A LIVED HOME VISIT</small><h2>'+d.icon+' '+esc(d.name)+'</h2><p>'+esc(d.greet)+'</p></header><div class="ls272-activity">'+
   d.open.map((label,i)=>'<button data-act="pv289-open" data-id="'+i+'">'+esc(label)+'</button>').join('')+
   '</div><button class="ls272-secondary" data-act="pv289-cancel">Leave this for another time</button></section>');
  return true;
 }
 function chooseOpen(i){
  if(!session||session.phase!=='opening'||![0,1].includes(i)||!safeToStart())return false;
  const kind=session.kind;
  api.closeModal?.();
  if(api.queueOwnAction?.(kind)!==true){api.notify?.('The household Daybook has no free place for this activity.');return false}
  session.open=i;session.phase='working';
  api.notify?.('🌷 All three are here. Poppy must finish the REAL '+kind+' furniture activity in her Household Daybook.');
  return true;
 }
 function completed(kind,once,actionDay){
  if(!session||session.phase!=='working'||!home()||session.day!==actionDay||
    kind!==session.kind||once!==true||!guest||!pip)return false;
  const g=guest.goal,p=api.getPlayer?.();
  if(!p||!finite(p.x)||!finite(p.y)||distance(p,g)>190||
    distance(guest,g)>75||distance(pip,g)>145){
   api.notify?.('The family was too far apart when the household task finished. No shared visit memory was claimed.');
   return false;
  }
  session.phase='reflect';
  return finishPage();
 }
 function finishPage(){
  if(!home()||session?.phase!=='reflect')return false;
  const d=VISITS[session.id];
  api.showModal?.('little-sprouts','<section class="ls272-book pv289-modal"><header class="ls272-cover"><small>✦ AFTER THE REAL HOUSEHOLD ACTIVITY</small><h2>'+esc(d.name)+'</h2><p>'+esc(d.ending)+'</p></header><div class="ls272-activity">'+
   d.close.map((label,i)=>'<button data-act="pv289-close" data-id="'+i+'">'+esc(label)+'</button>').join('')+
   '</div><small>Only the completed visit will enter the family history.</small></section>');
  return true;
 }
 function chooseClose(i){
  if(!session||session.phase!=='reflect'||![0,1].includes(i)||!home()||
    !guest||!pip||finished(session.id)||!current()||
    session.open===null)return false;
  const r={id:session.id,day:day(),kind:session.kind,open:session.open,close:i};
  const c=child(),old=records();
  c.homeVisits=clean({pending:null,memories:[...old.memories,r]});
  const need=VISITS[r.id].need;
  c.needs[need]=Math.min(100,Math.max(0,c.needs[need]||0)+5);
  api.bondAdult?.(r.id,3);api.save?.();api.updateUI?.();
  session=null;guest=null;pip=null;
  api.notify?.('🌸 An authentic three-person family visit is remembered. '+need+' +5.');
  api.showModal?.('little-sprouts','<section class="ls272-book pv289-modal"><header class="ls272-cover"><small>✦ A GENUINE COTTAGE MEMORY</small><h2>'+VISITS[r.id].icon+' '+esc(VISITS[r.id].name)+'</h2><p>'+esc(VISITS[r.id].lines[i])+'</p></header><p>Day '+r.day+' · Poppy, Pip and '+esc(api.name?.(r.id)||r.id)+' really shared a household activity. Your choice is now part of their family history.</p><button data-act="pv289-book">Return to Pip’s Daybook</button></section>');
  return true;
 }
 function cancel(){if(session?.phase==='working'||session?.phase==='reflect')return false;
  if(session?.phase==='opening')session.phase='greeted';
  api.closeModal?.();return true}
 function panel(){
  if(child().guardian!=='player')return '';
  const record=records(),p=record.pending;
  const summary=p?(p.day<day()?'Visit date passed':p.day===day()?'Today: cottage visit':'Visit on Day '+p.day):'Invite a neighbor in town';
  return '<section class="pv289-panel"><details><summary>🏡 Real Cottage Visits · '+record.memories.length+'/6 remembered</summary>'+
   '<div class="pv289-inner"><p>Invite a villager Pip has already met, directly in a real town conversation. On the next day meet your guest at Poppy’s cottage door between 10 AM and 8 PM, then bring everyone inside. Tap your guest and finish a real Household Daybook activity with Pip before making a lasting choice.</p>'+
   '<strong>'+esc(summary)+'</strong><small>Nothing is earned just by inviting someone or opening this book. Visits never create new family relationships or adult jobs.</small>'+
   (record.memories.length?'<div class="pv289-records">'+record.memories.slice().reverse().map(r=>'<small>'+VISITS[r.id].icon+' Day '+r.day+' · '+esc(VISITS[r.id].name)+'</small>').join('')+'</div>':'')+'</div></details></section>';
 }
 function drawShared(g,tick=0){
  if(!g||!home()||!guest||!pip)return false;
  const x=guest.goal.x,y=guest.goal.y-34;
  g.save();
  g.fillStyle='#51463c44';g.fillRect(x-31,y+23,66,7);
  g.fillStyle='#a37966';g.fillRect(x-29,y+12,62,13);
  g.fillStyle='#e8c4a3';g.fillRect(x-27,y+3,58,10);
  g.fillStyle='#fff2d8';g.fillRect(x-18,y-7,35,10);
  const col=VISITS[session.id].kind==='meal'?'#c88c85':VISITS[session.id].kind==='read'?'#85a69c':'#b293b4';
  g.fillStyle=col;g.fillRect(x-10,y-13,18,16);
  g.fillStyle='#fff5dc';g.fillRect(x-6,y-10,10,10);
  if(session.phase==='working'){
   g.fillStyle='#f9df9a';g.fillRect(x+24,y-17+Math.sin(tick*4)*3,6,6);
  }
  g.restore();return true;
 }
 function handle(act,id){
  if(act==='pv289-invite')return invitation(id);
  if(act==='pv289-send')return send(id);
  if(act==='pv289-greet')return greet(id);
  if(act==='pv289-open')return chooseOpen(Number(id));
  if(act==='pv289-close')return chooseClose(Number(id));
  if(act==='pv289-cancel')return cancel();
  if(act==='pv289-book')return api.openBook?.();
  return false;
 }
 return {clean,panel,inviteEligible,invitation,send,schedule,greetEligible,greet,
  guestPose,childPose,hit,interact,completed,advance,drawShared,handle,earlier,
  get session(){return session},get pending(){return current()},get memories(){return records().memories}};
}
root.HearthPipHomeVisits={setup,clean,VISITS,IDS,PORCH,ENTRY,ROOMS};
})(window);
