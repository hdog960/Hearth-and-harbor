/* Hearth & Harbor — Hearth Kitchen C1: original iPhone-friendly cooking games.
   Isolated from the world renderer; receives safe life-sim callbacks. */
(()=>{'use strict';
const ING={bread:{label:'Bread',icon:'🍞',cost:5},butter:{label:'Butter',icon:'🧈',cost:4},berry:{label:'Berries',icon:'🍓',cost:5},apple:{label:'Apples',icon:'🍎',cost:5},carrot:{label:'Carrots',icon:'🥕',cost:4},herb:{label:'Fresh herbs',icon:'🌿',cost:4},flour:{label:'Flour',icon:'🌾',cost:6},milk:{label:'Milk',icon:'🥛',cost:5},egg:{label:'Eggs',icon:'🥚',cost:5},noodle:{label:'Noodles',icon:'🍜',cost:6},fish:{label:'Fresh fish',icon:'🐟',cost:9},honey:{label:'Honey',icon:'🍯',cost:6},onion:{label:'Onions',icon:'🧅',cost:4},potato:{label:'Potatoes',icon:'🥔',cost:5}};
const RECIPES={
 toast:{name:'Cinnamon Toast',icon:'🍞',note:'Golden and cozy',ingredients:{bread:1,butter:1},steps:['stir','flip'],food:22,fun:4,xp:10,color:'#dfb77c'},
 salad:{name:'Orchard Fruit Salad',icon:'🍎',note:'A bright bowl of sunshine',ingredients:{berry:2,apple:1},steps:['chop','garnish'],food:27,fun:5,xp:13,color:'#f6a7aa'},
 soup:{name:'Garden Vegetable Soup',icon:'🥕',note:'Something warm and comforting',ingredients:{carrot:1,onion:1,herb:1},steps:['chop','stir','simmer'],food:32,fun:3,xp:16,color:'#eac475'},
 pancakes:{name:'Berry Pancakes',icon:'🥞',note:'A special breakfast treat',ingredients:{flour:1,milk:1,berry:1},steps:['pour','stir','flip','garnish'],food:39,fun:9,xp:21,color:'#edb47b'},
 eggs:{name:'Sunny Morning Eggs',icon:'🍳',note:'Sunshine on a breakfast plate',ingredients:{egg:2,butter:1},steps:['crack','flip','season'],food:30,fun:4,xp:14,color:'#f9cc7b'},
 noodles:{name:'Herb Garden Noodles',icon:'🍜',note:'Twirl up something lovely',ingredients:{noodle:1,herb:1,butter:1},steps:['pour','stir','season'],food:35,fun:5,xp:17,color:'#a5cca7'},
 fishplate:{name:'Harbor Grilled Fish',icon:'🐟',note:'A fresh catch with a little zing',ingredients:{fish:1,herb:1},steps:['season','flip','garnish'],food:40,fun:6,xp:20,color:'#9bd4d1'},
 tart:{name:'Honeybun Berry Tart',icon:'🥧',note:'Oliver’s beloved bakery classic',ingredients:{flour:1,berry:2,butter:1},steps:['knead','fill','bake','garnish'],food:42,fun:12,xp:25,color:'#f6a5ab'},
 biscuits:{name:'Honey Cloud Biscuits',icon:'🍪',note:'Pillowy treats for a rainy day',ingredients:{flour:1,honey:1,milk:1},steps:['knead','stamp','bake'],food:31,fun:10,xp:19,color:'#e8bb82'},
 jam:{name:'Orchard Apple Jam',icon:'🍯',note:'Little jars of golden autumn',ingredients:{apple:2,honey:1},steps:['chop','simmer','pour'],food:17,fun:11,xp:18,color:'#f1b577'},
 skewers:{name:'Picnic Garden Skewers',icon:'🥗',note:'Bright bites for a sunny afternoon',ingredients:{potato:1,carrot:1,onion:1},steps:['chop','thread','season','grill'],food:36,fun:8,xp:23,color:'#d8ba8e'},
 dumplings:{name:'Little Garden Dumplings',icon:'🥟',note:'A warm shared bowl',ingredients:{flour:1,carrot:1,herb:1},steps:['knead','fill','steam','garnish'],food:41,fun:8,xp:24,color:'#b7d5b1'}
};
const STEP={
 chop:['Slice the ingredients','Swipe across the board to make neat slices.','SWIPE THROUGH THE CHOP LINES','PREP BOARD','Make a slice'],
 stir:['Whisk it together','Trace a circle around the bowl to mix.','DRAW CIRCLES AROUND THE BOWL','MIXING STATION','Give it a stir'],
 flip:['Catch the golden flip','Watch the sweet spot and flip at the right moment.','HIT THE GOLDEN SWEET SPOT','STOVETOP','Flip now!'],
 crack:['Crack the eggs','Tap alternating shells on either side to crack them.','TAP LEFT, THEN RIGHT','EGG COUNTER','Crack an egg'],
 knead:['Knead the dough','Press alternating sides of the dough to make it springy.','PRESS LEFT AND RIGHT','BAKING TABLE','Knead dough'],
 pour:['Pour with care','Drag down to pour steadily into the bowl.','SWIPE DOWN TO POUR','MEASURING CORNER','Pour a little'],
 season:['A little seasoning','Tap around the food to sprinkle fresh herbs.','TAP ALL THREE SEASONING SPOTS','SEASONING TRAY','Sprinkle herbs'],
 bake:['Bake until golden','Stop the oven dial inside the warm golden zone.','STOP AT THE GOLDEN MARK','COZY OVEN','Take it out!'],
 garnish:['Make it beautiful','Arrange toppings with taps or a gentle drag.','PLACE THREE LITTLE TOPPINGS','PLATING TABLE','Add topping'],
 fill:['Fill each pastry','Tap to add just the right amount of filling.','FILL THE PASTRY POCKETS','PASTRY TABLE','Add filling'],
 stamp:['Stamp little shapes','Tap the dough to stamp out charming biscuits.','STAMP THE COOKIE CUTTERS','COOKIE TABLE','Stamp cookie'],
 simmer:['Mind the bubbles','Stop the simmer when the bubble dial reaches the zone.','WATCH THE GENTLE BUBBLE DIAL','SIMMERING POT','Turn down heat'],
 thread:['Build the skewers','Swipe left to right to thread colorful vegetables.','SWIPE ACROSS THE SKEWER','PICNIC TABLE','Thread a piece'],
 grill:['Grill it just right','Flip the skewer when the heat dial is golden.','HIT THE GOLDEN HEAT','GARDEN GRILL','Turn skewer'],
 steam:['Steam until tender','Watch the steam and lift the lid at the right time.','OPEN AT THE GOLDEN MARK','STEAMER','Lift the lid']
};
const FAVORITES={mabel:'salad',rosie:'jam',oliver:'tart',jun:'dumplings',bea:'skewers',finn:'fishplate'};
const TIMED=new Set(['flip','bake','simmer','grill','steam']);
const TARGET_STEPS=new Set(['crack','knead','season','garnish','fill','stamp']);
// Explain existing technique scores without changing plate quality, cooking XP or saved dishes.
const techniqueGrade=score=>score>=90?{stars:3,label:'Beautifully done',note:'A lovely touch!'}:score>=73?{stars:2,label:'Nicely prepared',note:'Made with care!'}:{stars:1,label:'Keep practicing',note:'Still a delicious step!'};


window.HearthKitchen=class HearthKitchen{
 constructor(api){this.a=api;this.session=null;this.craft=null;this.pointer=null;this.flipStart=0;this.inAction=false;}
 get st(){return this.a.getState().cooking;}
 pantryText(id){return this.st.pantry[id]||0;}
 canMake(r){return Object.entries(r.ingredients).every(([i,q])=>(this.st.pantry[i]||0)>=q);}
 stepName(name){return STEP[name]?.[0]||name;}
 openBook(){this.session=null;const s=this.st,art=window.HearthKitchenArt;
 const cards=Object.entries(RECIPES).map(([id,r])=>{const missing=Object.entries(r.ingredients).filter(([k,q])=>this.pantryText(k)<q).map(([k,q])=>ING[k].label+' '+this.pantryText(k)+'/'+q);
 return `<article class="k-recipe k-${id}"><div class="k-recipe-art">${art.plated(id)}</div><div class="k-recipe-copy"><span class="k-recipe-eyebrow">${r.steps.length} HANDS-ON STEPS</span><strong>${r.name}</strong><small>${r.note}</small><div class="k-recipe-ingredients">${Object.entries(r.ingredients).map(([k,q])=>`<span title="${ING[k].label}">${ING[k].icon} ${q}</span>`).join('')}</div>${missing.length?`<small class="k-missing">Need: ${missing.join(', ')}</small>`:''}</div><button data-act="cook-start" data-id="${id}" ${missing.length||s.dishes.length>=30?'disabled':''} aria-label="Cook ${r.name}">Cook <span aria-hidden="true">›</span></button></article>`}).join('');
 const pantry=Object.entries(ING).map(([id,i])=>`<span><b>${i.icon}</b><small>${i.label}</small><strong>${this.pantryText(id)}</strong></span>`).join('');
 const hosts=this.a.getResidents();const plates=s.dishes.map((d,i)=>{const r=RECIPES[d.id];if(!r)return '';return `<div class="k-plate"><div class="k-saved-art">${art.plated(d.id)}</div><span><strong>${r.name}</strong><small>${'★'.repeat(d.quality)}${'☆'.repeat(3-d.quality)}</small></span><button data-act="cook-eat" data-id="${i}">Eat</button>${hosts.length?`<button data-act="cook-serve" data-id="${i}" title="Share with residents in this home">Share</button>`:``}</div>`}).join('');
 this.a.showModal('cookbook',`<div class="k-experience k-book"><div class="k-book-cover"><span class="k-book-sun">✳</span><span class="k-eyebrow">HEARTH & HARBOR • THE COZY COLLECTION</span><h2>Your little<br><em>recipe book.</em></h2><p>Something wonderful is always simmering.</p><div class="k-skill"><span>✦ LEVEL ${Math.floor(s.xp/90)+1} CHEF</span><span>${s.xp} XP · ${s.made} MEALS</span></div></div><div class="k-section-heading"><span>CHOOSE SOMETHING DELICIOUS</span><span>01 — 12</span></div><div class="kc-intro"><b>🌼 New little cooking worktops</b><p>Chop in sequence, season your plate, thread vegetables, fill pastries, stamp biscuits and choose garnishes with actual taps. Each recipe keeps its own ingredient needs and cooking progress.</p></div>${cards}<button class="btn k-shop" data-act="cook-market">🧺 Visit Rosie’s ingredient market <span>›</span></button>${hosts.length?`<div class="k-household-prompt">🍽️ Visiting ${hosts.map(h=>h.name).join(' & ')}. ${hosts.map(h=>`${h.name} loves ${RECIPES[FAVORITES[h.id]]?.name||'homemade meals'}`).join(' • ')}. Share a prepared dish here for a little friendship bonus.</div>`:''}<div class="k-section-heading"><span>YOUR LITTLE PANTRY</span></div><div class="k-pantry">${pantry}</div><div class="k-section-heading"><span>COOKED WITH LOVE</span><span>${s.dishes.length}/30 SAVED</span></div>${plates||'<p class="k-empty">Your plate shelf is empty. Time to make something!</p>'}<button class="btn k-shop" data-act="cook-table">🍽️ At Our Table — turn a cooked meal into a household memory <span>›</span></button><div class="k-options"><label><input type="checkbox" id="kRelax" ${s.relaxed?'checked':''}> 🌿 Relaxed timing</label><button data-act="cook-relax">Save preference</button></div><p class="k-hint">Gesture or tap controls are always available. Cooking happens entirely in your little world—no timers or real-money purchases.</p></div>`);
 }
 market(){const items=Object.entries(ING).map(([id,i])=>`<div class="k-market-item"><span>${i.icon} ${i.label}<small>Owned: ${this.pantryText(id)}</small></span><button data-act="cook-buy" data-id="${id}">🪙 ${i.cost}</button></div>`).join('');this.a.showModal('cook-market',`<h2>🧺 Rosie's Pantry Counter</h2><p>Fresh staples, delivered to your cottage pantry. One item per purchase. You have 🪙 ${Math.floor(this.a.getState().coins)}.</p><div class="k-market-grid">${items}</div><button class="btn" data-act="cook-book">← Recipe Book</button>`);}
 buy(id){const ing=ING[id];if(!ing)return;if(this.pantryText(id)>=99)return this.a.notify('Your pantry is full of that ingredient.');if(this.a.getState().coins<ing.cost)return this.a.notify('Not enough coins for that ingredient.');this.a.coins(-ing.cost);this.st.pantry[id]++;this.a.save();this.market();this.a.notify(`${ing.icon} Added ${ing.label} to your pantry!`);}
 begin(id){const r=RECIPES[id];if(!r)return;if(this.session)return;if(this.st.dishes.length>=30)return this.a.notify('Your prepared-food shelf is full. Eat a dish first.');if(!this.canMake(r))return this.a.notify('Some ingredients are missing. Visit Rosie’s pantry counter.');for(const [k,q] of Object.entries(r.ingredients))this.st.pantry[k]-=q;
 this.session={id,index:0,score:[],progress:0,gesture:false,lastSide:-1,targets:[],attempts:0};this.craft=null;this.a.save();this.renderStep();}
 renderStep(){const s=this.session;if(!s)return;this.pointer=null;s.progress=0;s.gesture=false;s.lastSide=-1;s.targets=[];s.attempts=0;
 const r=RECIPES[s.id],kind=r.steps[s.index],info=STEP[kind],title=info[0],desc=info[1],hint=info[2],art=window.HearthKitchenArt;
 const timing=TIMED.has(kind);
 this.craft=window.HearthKitchenCraft?.make(kind,s.id)||null;
 const craft=this.craft;
 const previous=s.index>0?(()=>{
  const lastKind=r.steps[s.index-1],score=s.score[s.index-1],grade=techniqueGrade(score);
  return `<div class="k-step-feedback" role="status" aria-live="polite"><span class="k-feedback-flourish" aria-hidden="true">✦</span><span><strong>${this.stepName(lastKind)} complete!</strong><small>${grade.note}</small></span><b aria-label="${grade.stars} out of 3 stars">${'★'.repeat(grade.stars)}${'☆'.repeat(3-grade.stars)}</b></div>`;
 })():'';
 this.a.showModal('cook-step',`<div class="k-experience k-step-view ${craft?'k-craft-step':''}"><div class="k-step-top"><div><div class="k-eyebrow">✳ THE HEARTH KITCHEN</div><span class="k-small-overline">${r.name}</span></div><span class="k-counter">${String(s.index+1).padStart(2,'0')} <small>/ ${String(r.steps.length).padStart(2,'0')}</small></span></div><div class="k-step-dots">${r.steps.map((step,j)=>`<span class="${j<s.index?'done':j===s.index?'current':''}"></span>`).join('')}</div>${previous}<h2 class="k-step-title">${title}</h2><p class="k-step-intro">${desc}</p><div id="kGesture" class="k-gesture k-${kind} ${craft?'k-craft-hero':''}" role="${craft?'img':'group'}" aria-label="${craft?'Illustration: '+title:title}"><div class="k-stage-top"><span>✦ LITTLE KITCHEN STUDIO</span><span>${info[3]}</span></div><div class="k-board-art">${art.stage(s.id,kind)}</div>${timing?`<div class="k-timing" aria-hidden="true"><div class="k-target"></div><div class="k-needle"></div></div>`:''}<div class="k-stage-tip">${hint}</div><div class="k-stage-sparkle">✦</div></div>${craft?craft.render():''}<div class="k-underboard"><span id="kPercent" role="status" aria-live="polite">0% PREPARED</span><span>${timing?'WATCH THE TIMING':'TAKE YOUR TIME'}</span></div><div class="k-progress" id="kStepProgress" role="progressbar" aria-label="Cooking step progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div id="kProgressFill"></div></div><div class="k-step-control ${craft?'k-craft-controls':''}">${craft?'<p class="k-craft-instructions">Tap the ingredients and worktop above to finish this technique. All controls work without swipes.</p>':`<button class="btn k-primary-action" data-act="cook-tap">✦ ${info[4]}</button>`}<button class="btn secondary k-secondary-action" data-act="cook-abandon">Leave</button></div><p class="k-hint">${craft?'Follow the hands-on worktop above.':timing?'Relaxed mode makes every timing step successful.':'Use the large button if you prefer not to swipe or tap the picture.'} Ingredients were used at the start.</p></div>`);
 const scrollArea=document.querySelector?.('#modal .modal-card');if(scrollArea)scrollArea.scrollTop=0;
 this.flipStart=Date.now();if(craft)return;const el=document.getElementById('kGesture');if(!el)return;
 el.addEventListener('pointerdown',e=>{e.preventDefault();if(!this.session)return;const rect=el.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;this.pointer={x:e.clientX,y:e.clientY,angle:Math.atan2(y-.5,x-.5),lastY:e.clientY};try{el.setPointerCapture?.(e.pointerId)}catch(err){};
 if(TARGET_STEPS.has(kind)){const side=x<.5?0:1;if(kind==='crack'||kind==='knead'){if(s.lastSide!==side){s.lastSide=side;this.advance(kind==='crack'?28:19,94);}else this.a.notify('Try the other side!');}else{let slot=Math.max(0,Math.min(2,Math.floor(x*3)));if(!s.targets.includes(slot)){s.targets.push(slot);this.advance(34,94)}else this.a.notify('Try an untouched spot!');}}},{passive:false});
 el.addEventListener('pointermove',e=>{if(!this.pointer||!this.session||this.session.index!==s.index)return;e.preventDefault();const p=this.pointer,rect=el.getBoundingClientRect();const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
 if(kind==='stir'){const ang=Math.atan2(y-.5,x-.5);let delta=Math.abs(ang-p.angle);if(delta>Math.PI)delta=2*Math.PI-delta;p.angle=ang;if(delta<1.1){s.progress=Math.min(100,s.progress+delta*16);this.setProgress();if(s.progress>=100)this.complete(94)}}
 else if(kind==='pour'&&e.clientY>p.lastY+7){this.advance(Math.min(24,(e.clientY-p.lastY)*.36),94);p.lastY=e.clientY}
 else if(kind==='garnish'||kind==='fill'||kind==='stamp'){const slot=Math.max(0,Math.min(2,Math.floor(x*3)));if(!s.targets.includes(slot)){s.targets.push(slot);this.advance(34,94)}}
 },{passive:false});
 el.addEventListener('pointerup',e=>{if(!this.pointer||!this.session)return;e.preventDefault();const p=this.pointer;this.pointer=null;const dx=e.clientX-p.x,dy=e.clientY-p.y;
 if(kind==='chop'&&Math.hypot(dx,dy)>=30)this.advance(34,94);
 else if(kind==='thread'&&dx>45)this.advance(34,94);
 else if(kind==='pour'&&dy>30)this.advance(36,94);
 else if(TIMED.has(kind))this.flip();
 },{passive:false});
 }
 setProgress(){const f=document.getElementById('kProgressFill'),p=document.getElementById('kPercent'),scene=document.getElementById('kGesture');if(!this.session)return;
 const progress=Math.floor(this.session.progress);if(f)f.style.width=progress+'%';if(p)p.textContent=progress+'% PREPARED';document.getElementById('kStepProgress')?.setAttribute?.('aria-valuenow',String(progress));if(scene){scene.style.setProperty('--k-progress',String(progress/100));scene.classList.toggle('k-active',progress>0)}}
 advance(amount,score){if(!this.session)return;this.session.progress=Math.min(100,this.session.progress+amount);this.setProgress();if(this.session.progress>=100)this.complete(score);}
 craftAction(id){
  if(!this.session||!this.craft||this.inAction)return;
  const kind=RECIPES[this.session.id].steps[this.session.index];
  if(kind!==this.craft.state.kind)return;
  const el=document.getElementById('kCraft');
  // The worktop is replaced after a tap. Remember keyboard focus so VoiceOver
  // and keyboard users stay within the live activity rather than losing position.
  const focused=!!(el&&document.activeElement&&el.contains?.(document.activeElement));
  const previousFocus=focused?document.activeElement?.dataset?.id:null;
  const result=this.craft.act(id);
  if(result.message)this.a.notify(result.message);
  if(result.valid){
   this.session.progress=result.progress;
   this.setProgress();
  }
  if(el&&!result.done){
   el.outerHTML=this.craft.render();
   if(focused&&document.querySelector){
    const step=this.craft.state.completed.length;
    const next=result.valid?(this.craft.state.kind==='chop'?'cut:'+step:
      id.startsWith('pick:')?'place:'+step:'pick:'+this.craft.state.expected[step]):previousFocus;
    if(typeof next==='string'&&/^(?:cut|pick|place):[a-z0-9_-]+$/.test(next)){
     const target=document.querySelector('[data-act="cook-craft"][data-id="'+next+'"]');
     if(target&&!target.disabled)target.focus({preventScroll:true});
    }
   }
  }
  if(result.done&&result.valid)this.complete(result.score);
 }
 tap(){if(!this.session||this.craft)return;const kind=RECIPES[this.session.id].steps[this.session.index];if(TIMED.has(kind))this.flip();else this.advance(['stir','knead'].includes(kind)?21:34,80);}
 flip(){if(!this.session||this.inAction)return;const elapsed=(Date.now()-this.flipStart)%1800;const phase=elapsed/900<=1?elapsed/900:2-elapsed/900;const good=this.st.relaxed||(phase>=.38&&phase<=.63);this.complete(good?96:64);}
 complete(score){if(!this.session||this.inAction)return;this.inAction=true;const s=this.session;s.score.push(score);s.index++;if(s.index>=RECIPES[s.id].steps.length){this.finish()}else{this.renderStep()}this.inAction=false;}
 finish(){const session=this.session;if(!session)return;this.session=null;this.craft=null;const r=RECIPES[session.id],avg=session.score.reduce((a,b)=>a+b,0)/session.score.length,quality=avg>=90?3:avg>=73?2:1;
 this.st.dishes.push({id:session.id,quality});this.st.xp=Math.min(100000,this.st.xp+Math.max(2,Math.round(r.xp*quality/2)));this.st.made=Math.min(9999,this.st.made+1);this.st.mastered[session.id]=Math.min(999,(this.st.mastered[session.id]||0)+1);this.a.save();
 const stepSummary=r.steps.map((kind,i)=>{
  const score=session.score[i],grade=techniqueGrade(score);
  return `<div class="k-technique-row" role="listitem"><span class="k-technique-name">${this.stepName(kind)}</span><span class="k-technique-grade">${grade.label}</span><b aria-label="${grade.stars} of 3 stars">${'★'.repeat(grade.stars)}${'☆'.repeat(3-grade.stars)}</b></div>`;
 }).join('');
 const hosts=this.a.getResidents();this.a.showModal('cook-result',`<div class="k-experience k-result"><div class="k-result-heading"><span class="k-eyebrow">✧ A LITTLE SOMETHING LOVELY ✧</span><h2>Made with love!</h2><p>Fresh from your cozy kitchen</p></div><div class="k-reveal-art">${window.HearthKitchenArt.plated(session.id)}<span class="k-float-star k-float-a">✦</span><span class="k-float-star k-float-b">✧</span></div><h3>${r.name}</h3><div class="k-stars">${'★'.repeat(quality)}<span>${'☆'.repeat(3-quality)}</span></div><p class="k-result-copy">${quality===3?'Gorgeous! Every little detail came together.':quality===2?'Beautifully done! That looks delicious.':'Made with care, and still delicious.'}</p><p class="k-recap-heading">Your little kitchen moments</p><div class="k-technique-recap" role="list" aria-label="Preparation techniques">${stepSummary}</div><div class="k-result-buttons"><button class="btn k-primary-action" data-act="cook-eat" data-id="${this.st.dishes.length-1}">Enjoy this meal</button><button class="btn secondary" data-act="cook-book">Save for later</button>${hosts.length?`<button class="btn secondary" data-act="cook-serve" data-id="${this.st.dishes.length-1}">Share in this home</button>`:``}</div></div>`);this.a.notify(`New recipe prepared! +${Math.max(2,Math.round(r.xp*quality/2))} cooking XP`);}
 eat(idx){const i=Number(idx);if(!Number.isInteger(i)||i<0||i>=this.st.dishes.length)return;const [dish]=this.st.dishes.splice(i,1),r=RECIPES[dish.id];if(!r)return;this.a.changeNeed('hunger',r.food+4*dish.quality);this.a.changeNeed('fun',r.fun);this.a.save();this.a.notify(`You enjoyed ${r.name}! 🍽️`);this.openBook();}
 serve(idx){const i=Number(idx),residents=this.a.getResidents();if(!Number.isInteger(i)||i<0||i>=this.st.dishes.length||!residents.length)return this.a.notify('Visit a neighbor’s home to share this meal.');
 const dish=this.st.dishes[i],r=RECIPES[dish.id];if(!r)return;
 this.st.dishes.splice(i,1);const day=this.a.getState().day;
 const favorites=[];for(const n of residents){if(!this.st.servedDaily)this.st.servedDaily={};const wasServed=this.st.servedDaily[n.id]===day;const favorite=FAVORITES[n.id]===dish.id;if(favorite)favorites.push(n.name);
  this.a.feedResident(n.id,Math.max(18,Math.round(r.food*.7)),wasServed?0:favorite?16:8);
  if(!wasServed){this.a.bondResident(n.id,favorite?6:3);this.st.servedDaily[n.id]=day;}
 }
 this.a.changeNeed('social',6);this.a.save();this.a.notify(favorites.length?`${favorites.join(' & ')} loved their favorite meal! 💗`:`A lovely meal shared with ${residents.map(n=>n.name).join(' & ')}! 💗`);this.openBook();}
 abandon(){this.session=null;this.craft=null;this.a.notify('Cooking stopped. The ingredients were already used.');this.openBook();}
 handle(action,id){switch(action){case 'cook-book':return this.openBook();case 'cook-market':return this.market();case 'cook-buy':return this.buy(id);case 'cook-start':return this.begin(id);case 'cook-tap':return this.tap();case 'cook-craft':return this.craftAction(id);case 'cook-eat':return this.eat(id);case 'cook-serve':return this.serve(id);case 'cook-table':return this.a.openFamilyTable();case 'cook-abandon':return this.abandon();case 'cook-relax':this.st.relaxed=!!document.getElementById('kRelax')?.checked;this.a.save();this.openBook();this.a.notify(this.st.relaxed?'Relaxed cooking is on.':'Timing challenge is on.');return;}}
};
})();
