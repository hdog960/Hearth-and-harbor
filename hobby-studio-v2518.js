/* Hearth & Harbor v2.5.18 — Little Passions Studio
 * Six distinct no-timer, touch-first resident hobbies integrated with real
 * household routines, daily progress, aspiration and permanent room memories.
 */
(function(root){'use strict';
const PEOPLE=['mabel','rosie','oliver','jun','bea','finn'];
const HOMES=['h0','h1','h2','h3','h4','h5'];
const PROFILE={
 mabel:{name:'Mabel',icon:'🌷',title:'Bloom by Bloom',type:'sequence',station:[470,510],detail:'Tend a tiny windowsill garden in the right order.',pattern:['soil','seed','water','sun'],options:[['soil','🟤 Soil'],['seed','🌱 Seed'],['water','💧 Water'],['sun','☀️ Sunlight']]},
 rosie:{name:'Rosie',icon:'🍓',title:'Market Basket',type:'sort',station:[615,790],detail:'Sort fresh produce into three little market crates.',pattern:[['🍎 Apple','orchard'],['🍓 Strawberry','berries'],['🍋 Lemon','citrus']],options:[['orchard','🍏 Orchard crate'],['berries','🫐 Berry basket'],['citrus','🍊 Citrus box']]},
 oliver:{name:'Oliver',icon:'🥐',title:'A Perfect Pastry',type:'knead',station:[725,468],detail:'Practice the gentle folding and kneading pattern.',pattern:['fold','press','turn','fold','press'],options:[['fold','↶ Fold'],['press','✋ Press'],['turn','↻ Turn']]},
 jun:{name:'Jun',icon:'📖',title:'Choose the Chapter',type:'story',station:[407,570],detail:'Tell a tiny story with choices and a different ending each time.',questions:[
  {title:'Where does the story begin?',options:[['forest','🌲 A whispering forest'],['harbor','⚓ A sleepy harbor']]},
  {title:'Who helps our curious traveler?',options:[['friend','💗 A patient friend'],['bird','🐦 A brave little bird']]},
  {title:'What treasure do they bring home?',options:[['star','🌟 A paper star'],['seed','🌱 A hopeful seed']]}]},
 bea:{name:'Bea',icon:'🎨',title:'Tiny Color Study',type:'paint',station:[650,670],detail:'Pick pigments, then paint four squares to match the little landscape.',pattern:['blue','green','pink','gold'],options:[['blue','🔵 Sky'],['green','🟢 Meadow'],['pink','🩷 Blossom'],['gold','🟡 Sun']]},
 finn:{name:'Finn',icon:'🎣',title:'Little Lure Workshop',type:'weave',station:[734,733],detail:'Weave a soft fishing lure with alternating loops and one secure knot.',pattern:['left','right','left','knot','right'],options:[['left','↙ Left loop'],['right','↘ Right loop'],['knot','⚓ Tie knot']]}
};
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function clean(raw){
 const src=obj(raw)?raw:{},days={},counts={},gallery={};
 for(const id of PEOPLE){
  days[id]=Number.isInteger(src.days?.[id])&&src.days[id]>=1&&src.days[id]<=9999?src.days[id]:0;
  counts[id]=Number.isInteger(src.counts?.[id])?clamp(src.counts[id],0,9999):0;
  gallery[id]=src.gallery?.[id]===true||counts[id]>=3;
 }
 return {days,counts,gallery};
}
function setup(api){
 const {getState,getScene,getHome,getMembers,hasHobby,walkTo,preparePlayer,
  save,updateUI,notify,showModal,closeModal,completeHobby}=api;
 const state=()=>getState();
 const home=()=>getScene()==='residence'&&HOMES.includes(getHome())?getHome():null;
 const roster=()=>home()?[...new Set(getMembers().filter(id=>PEOPLE.includes(id)))].slice(0,2):[];
 const record=()=>{
  const s=state(),r=s.hobbyStudio;
  if(!obj(r)||!obj(r.days)||!obj(r.counts)||!obj(r.gallery)||
     !PEOPLE.every(id=>Number.isInteger(r.days[id])&&Number.isInteger(r.counts[id])&&typeof r.gallery[id]==='boolean'))s.hobbyStudio=clean(r);
  return s.hobbyStudio;
 };
 const eligible=id=>PEOPLE.includes(id)&&roster().includes(id)&&record().days[id]!==state().day;
 let session=null,celebration=null;
 function board(){
  session=null;
  const ids=roster();
  const cards=ids.map(id=>{
   const p=PROFILE[id],done=!eligible(id),routineDone=hasHobby(id),count=record().counts[id];
   return '<article class="hs-person"><span class="hs-face">'+p.icon+'</span><div><b>'+p.name+' · '+p.title+'</b><p>'+p.detail+'</p><small>'+count+' completed studio days'+(record().gallery[id]?' · ✨ framed hobby art':' · a framed hobby memory after 3 days')+(routineDone?' · Daily needs already restored; studio is for practice':'')+'</small><button data-act="hs-start" data-id="'+id+'" '+(done?'disabled':'')+'>'+(done?'✓ Enjoyed today':'Try '+p.title)+'</button></div></article>';
  }).join('');
  showModal('hobby-studio','<div class="hs-ui"><div class="hs-kicker">AN AFTERNOON FULL OF LITTLE PASSIONS</div><h2>🎨 Little Passions Studio</h2><p>Each neighbor has a different hands-on hobby. Visit their home, walk to their favorite spot, and play a short activity with no timers or purchases. Completing it counts as their real Daybook hobby for today.</p><div class="hs-banner">'+(!home()?'Visit a neighbor home to use the studio.':!ids.length?'No neighbors live in this home yet.':'Six unique hobbies · '+ids.length+' neighbor'+(ids.length===1?'':'s')+' here today')+'</div>'+cards+'<button class="hs-back" data-act="hs-close">Return to your day</button></div>');
 }
 function start(id){
  if(!eligible(id))return board();
  session={id,home:home(),day:state().day,stage:'walking',index:0,selected:null,colors:[],choices:[],mistakes:0};
  if(typeof preparePlayer==='function')preparePlayer();
  closeModal();
  const p=PROFILE[id];
  if(walkTo({x:p.station[0],y:p.station[1]},()=>arrive())===false){session=null;return board();}
 }
 function fresh(){
  return !!(session&&session.home===home()&&session.day===state().day&&eligible(session.id));
 }
 function arrive(){
  if(!session||session.stage!=='walking')return false;
  if(!fresh()){session=null;return false}
  session.stage='playing';return render();
 }
 function progress(){
  const s=session,p=PROFILE[s.id];
  return p.type==='paint'?s.colors.filter(Boolean).length:p.type==='story'?s.choices.length:s.index;
 }
 function total(){
  const p=PROFILE[session.id];
  return p.type==='paint'?4:p.type==='story'?p.questions.length:p.pattern.length;
 }
 function actionButton(act,id,title,selected=false){
  return '<button data-act="'+act+'" data-id="'+esc(id)+'" '+(selected?'aria-pressed="true"':'')+'>'+title+'</button>';
 }
 function render(){
  const s=session;
  if(!s||s.stage!=='playing'||!fresh())return false;
  const p=PROFILE[s.id],n=progress(),max=total();
  const row=p.type==='story'?p.questions[n]:null;
  let task='';
  if(p.type==='sequence'){
   task='<h3>Follow the growing steps</h3><p>Next: '+p.options.find(x=>x[0]===p.pattern[s.index])[1]+'</p><div class="hs-action-grid">'+p.options.map(x=>actionButton('hs-tap',x[0],x[1])).join('')+'</div>';
  }else if(p.type==='sort'){
   task='<h3>Sort '+p.pattern[s.index][0]+'</h3><p>Choose the correct market crate.</p><div class="hs-action-grid">'+p.options.map(x=>actionButton('hs-tap',x[0],x[1])).join('')+'</div>';
  }else if(p.type==='knead'||p.type==='weave'){
   task='<h3>'+(p.type==='knead'?'Shape the little pastry':'Make the perfect lure')+'</h3><p>Pattern: '+p.pattern.map((t,i)=>i<s.index?'✓':i===s.index?'◇ '+t:'· '+t).join(' · ')+'</p><div class="hs-action-grid">'+p.options.map(x=>actionButton('hs-tap',x[0],x[1])).join('')+'</div>';
  }else if(p.type==='story'){
   task='<h3>'+row.title+'</h3><p>The story is yours to shape. Each choice leads to a different little memory.</p><div class="hs-action-grid">'+row.options.map(x=>actionButton('hs-tap',x[0],x[1])).join('')+'</div>';
  }else{
   const labels=['Sky','Meadow','Blossom','Sun'],colors=p.options.map(x=>x[0]);
   task='<h3>Paint the '+labels[n]+'</h3><p>Choose the right pigment, then tap the next empty square on your canvas.</p><div class="hs-palette">'+p.options.map(x=>actionButton('hs-color',x[0],x[1],s.selected===x[0])).join('')+'</div><div class="hs-canvas">'+colors.map((c,i)=>actionButton('hs-cell',String(i),s.colors[i]?p.options.find(x=>x[0]===s.colors[i])[1]:i===n?'◇ '+labels[i]:'□ '+labels[i],!!s.colors[i])).join('')+'</div>';
  }
  const icon=p.icon,foot=s.mistakes?'That is not quite right. Try a different choice—no penalties!':'There is no rush. Enjoy the little details.';
  showModal('hobby-studio-play','<div class="hs-ui hs-play"><div class="hs-kicker">'+p.name.toUpperCase()+' · LITTLE PASSIONS</div><h2>'+icon+' '+p.title+'</h2><p>'+p.detail+'</p><div class="hs-progress"><b>'+n+' / '+max+' steps</b><div>'+Array.from({length:max},(_,i)=>'<i class="'+(i<n?'done':'')+'"></i>').join('')+'</div></div><div class="hs-worktop"><span>🌼</span><span>'+icon+'</span><span>✨</span></div>'+task+'<small class="hs-tip">'+foot+'</small><button class="hs-back" data-act="hs-cancel">Leave studio — no progress lost</button></div>');
  return true;
 }
 function tap(token){
  if(!session||session.stage!=='playing'||!fresh())return false;
  const s=session,p=PROFILE[s.id];
  if(p.type==='paint')return false; // pigment and square are separate tactile controls
  let expected;
  if(p.type==='sort')expected=p.pattern[s.index]?.[1];
  else if(p.type==='story'){
   const options=p.questions[s.index]?.options||[];
   if(!options.some(x=>x[0]===token))return false;
   s.choices.push(token);s.index++;
   if(s.index===p.questions.length)return finish();
   return render();
  }else expected=p.pattern[s.index];
  if(!p.options.some(x=>x[0]===token))return false;
  if(token!==expected){s.mistakes++;notify('A little mix-up. Give it another try!');render();return false}
  s.index++;s.mistakes=0;
  if(s.index===p.pattern.length)return finish();
  return render();
 }
 function color(token){
  if(!session||session.stage!=='playing'||!fresh()||PROFILE[session.id].type!=='paint'||!PROFILE.bea.options.some(x=>x[0]===token))return false;
  session.selected=token;return render();
 }
 function cell(rawIndex){
  if(!session||session.stage!=='playing'||!fresh()||PROFILE[session.id].type!=='paint')return false;
  const i=Number(rawIndex),s=session,p=PROFILE.bea;
  if(!Number.isInteger(i)||i!==progress()||i<0||i>=4||!s.selected)return false;
  if(p.pattern[i]!==s.selected){s.mistakes++;notify('Choose a pigment to match the canvas.');render();return false}
  s.colors[i]=s.selected;s.selected=null;s.mistakes=0;
  if(progress()===4)return finish();
  return render();
 }
 function finish(){
  if(!session||session.stage!=='playing'||!fresh()||progress()!==total())return false;
  const s=session,id=s.id,p=PROFILE[id],r=record();
  // The original household daily action is the authority for hobby/aspiration rewards.
  const reward=completeHobby(id);
  if(reward===false)return false;
  s.routineRewarded=reward===true;
  r.days[id]=s.day;r.counts[id]=clamp(r.counts[id]+1,0,9999);
  if(r.counts[id]>=3)r.gallery[id]=true;
  const story=p.type==='story'?' · '+s.choices.map((c,i)=>p.questions[i].options.find(x=>x[0]===c)?.[1]||'').join(' · '):'';
  celebration={id,home:s.home,day:s.day,elapsed:0,duration:17,origin:api.onSceneStart?.(id)||null};
  session=null;save();updateUI();
  showModal('hobby-studio-result','<div class="hs-ui"><div class="hs-kicker">A PASSION WORTH MAKING TIME FOR</div><h2>'+p.icon+' '+p.title+'</h2><div class="hs-worktop hs-finish"><span>🌼</span><span>'+p.icon+'</span><span>💗</span></div><p>'+p.name+' enjoyed the afternoon.'+(s.routineRewarded?' Their daily hobby needs and aspiration also progressed.':' Their daily hobby needs were already restored, so this was creative practice.')+esc(story)+'</p><div class="hs-banner">'+r.counts[id]+' studio day'+(r.counts[id]===1?'':'s')+' completed'+(r.gallery[id]?' · ✨ Their framed hobby keepsake is now displayed at home!':' · a keepsake after 3 days')+'</div><button class="hs-main" data-act="hs-board">See all hobbies</button><button class="hs-back" data-act="hs-close">Back to home</button></div>');
  notify(p.icon+' '+p.name+' finished a lovely hobby afternoon!');
  return true;
 }
 function cancel(){session=null;closeModal();notify('The supplies are safely put away for another time.');}
 function active(){return !!(celebration&&home()===celebration.home&&state().day===celebration.day&&roster().includes(celebration.id)&&celebration.elapsed<celebration.duration);}
 function update(dt){
  if(!celebration)return;
  if(!active()){celebration=null;return}
  if(api.isPaused?.()||api.isModalOpen?.()||!Number.isFinite(dt)||dt<=0)return;
  celebration.elapsed+=Math.min(dt,.1);
  if(celebration.elapsed>=celebration.duration){api.onSceneEnd?.(celebration.id);celebration=null}
 }
 function pose(id){
  if(!active()||celebration.id!==id)return null;
  const p=PROFILE[id].station,start=obj(celebration.origin)?celebration.origin:{x:p[0],y:p[1]};
  const t=Math.min(1,celebration.elapsed/3),ease=t*t*(3-2*t);
  return {x:start.x+(p[0]+65-start.x)*ease,y:start.y+(p[1]+12-start.y)*ease,moving:t<1,
   dir:'front',expression:'happy',act:PROFILE[id].icon,phase:'hobby'};
 }
 function draw(g,{home:house,tick=0}={}){
  if(!HOMES.includes(house))return;
  const installed=Object.keys(record().gallery).filter(id=>record().gallery[id]&&api.getResidentHome?.(id)===house);
  const isActive=active()&&celebration.home===house;
  if(!installed.length&&!isActive)return;
  g.save();
  installed.slice(0,2).forEach((id,i)=>{
   // Hang above the existing aspiration row in the two clear wall bays.
   // Avoid the door, windows, family-table frame and House Charm below.
   const x=i===0?472:705,y=174;
   g.fillStyle='#805945';g.fillRect(x-18,y-20,37,40);
   g.fillStyle='#d6ae78';g.fillRect(x-15,y-17,31,34);
   g.fillStyle='#fff2dd';g.fillRect(x-12,y-14,25,28);
   g.fillStyle=['#ef9eb9','#82b8a1'][i%2];g.beginPath();g.ellipse(x,y,8,9,0,0,Math.PI*2);g.fill();
   g.fillStyle='#f6e1a4';g.fillRect(x-2,y+3,4,7);
  });
  if(isActive){
   const p=PROFILE[celebration.id].station;
   g.fillStyle='#7f604f';g.fillRect(p[0]-43,p[1]-27,86,27);
   g.fillStyle='#dcb789';g.fillRect(p[0]-47,p[1]-34,94,11);
   for(let i=0;i<3;i++){
    g.fillStyle=i%2?'#e69db6':'#8fc99d';g.beginPath();
    g.ellipse(p[0]-23+i*23,p[1]-43+Math.sin(tick*3+i)*3,7,5,0,0,Math.PI*2);g.fill();
   }
  }
  g.restore();
 }
 function handle(action,id){
  if(action==='hs-board')return board();
  if(action==='hs-start')return start(id);
  if(action==='hs-tap')return tap(id);
  if(action==='hs-color')return color(id);
  if(action==='hs-cell')return cell(id);
  if(action==='hs-cancel')return cancel();
  if(action==='hs-close'){session=null;return closeModal()}
 }
 return {board,start,arrive,tap,color,cell,finish,cancel,handle,active,update,pose,draw,record,eligible};
}
root.HearthHobbyStudio={PROFILE,PEOPLE,HOMES,clean,setup};
})(window);