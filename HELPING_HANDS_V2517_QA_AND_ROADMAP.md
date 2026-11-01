# Hearth & Harbor v2.5.17 — Helping Hands

## Objective
Continue toward **v3.0 Generations** by making household life genuinely cooperative: Poppy and real Maplewood neighbors should physically arrive at an activity, complete a small interactive project, and build shared history. This complements, rather than replaces, existing guided Daybook actions, Thoughtful Households autonomy, Hearth Kitchen and Supper Together.

## What's actually playable
Open **Helping Hands** from an occupied resident home's **Daybook** or from Menu while visiting, or view the activity's memory diary from Journal. The game only offers partners who genuinely live in the occupied home; it never invents absent characters or guests.

Choose a resident and one of three short touch-based activities:

1. **Window Garden** 🪴: choose soft soil, a watering can, and a sunny place to nurture a little window planting.
2. **Cozy Sorting** 🧺: correctly return a book, scarf, and cushions to their respective room places.
3. **Memory Craft** 🎨: combine handmade paper, a pressed flower, and a ribbon into a little keepsake.

Each activity has **three unique, authored steps and three tappable options per step**. Incorrect choices are met with gentle guidance and no fine, timer, or penalty. There are no new purchases or ingredient costs.

### True interaction and animation
- **Poppy physically walks to the corresponding household activity station** using the existing world pathfinder before the activity opens.
- **No benefit is given for opening the menu, choosing a partner, starting the walk, a wrong choice, or aborting the activity**. Context is verified again on arrival and each answer, ensuring that resident membership, home and game day remain valid.
- After all three correct steps, an original small collaborative worktable appears in the room, the **actual resident sprite moves smoothly from its current in-home position to work beside Poppy**, and the resident's ordinary autonomous routine pauses during an **18-second** active-game-time celebration. Autonomy resumes afterward. The scene respects the game pause and does not count down behind modal UI.
- Poppy gains **+8 Social and +7 Fun**, and the participating resident gains **+10 Social and +8 Fun**. Their existing friendship improves by **+3**. These bonuses occur **only once per resident per in-game day**, irrespective of project selected. This activity does not award coins, hearts, town-bond changes, pantry items, or additional NPCs.
- Each successful project creates a dated, resident-and-home-specific memory in a bounded **Helping Hands journal**. After three completed projects in a single home, an original wooden-framed keepsake appears on that home's wall. The unlock persists even after older journal entries rotate out.

The player may guide residents through their original Daybook and interact with regular furniture as before. This addition does not silently make completed projects count as the existing manual tidy/hobby/meal actions or bypass earlier aspiration progress conditions. That keeps the progression and economy fair.

## Save data
The original browser save key is still **hearth-harbor-save-v1**; previous save fields are untouched. New optional field:

~~~js
helpingHands: {
  days: {mabel: 4, rosie: 0, oliver: 0, jun: 0, bea: 0, finn: 0},
  counts: {mabel: 1, rosie: 0, oliver: 0, jun: 0, bea: 0, finn: 0},
  walls: {h0: false, h1: false, h2: false, h3: false, h4: false, h5: false},
  memories: [{id:'mabel',home:'h0',plan:'garden',day:4}]
}
~~~

The sanitizer permits only the six known real resident IDs, six home IDs, three known project IDs, integer day values within 1–9999, bounded counters and up to **36 unique** memories per person/day. It prevents importing arbitrary fields, unknown prototype property names, and repeated credit for the same resident/day. Fresh and old saves initialize all zero-value counters and wall states. Temporary walking, activity, and animated-scene data are **not** stored.

Files added: **helping-hands-v2517.js**, **helping-hands-v2517.css**, **tests/helping-hands-v2517.test.cjs**. The JS loads before game.js; both assets are precached offline as **hearth-harbor-v2517-helping-hands**.

## Quality assurance
Twelve new Node regression tests cover:
- Six known residents and three different, correct-order, three-step projects.
- Only current genuine home occupants can be invited.
- In-world arrival before any gameplay reward or inventory modification.
- Wrong choice rejection, safe cancellation, stale-day/home/roster aborts.
- All three activities, exact need/friendship benefits, and one reward per participant/day.
- Save/reload persistence and correct initialization on a brand-new save.
- NPC sprite movement, active-session timer and game pause semantics.
- Original in-world artwork and permanent framed house keepsakes.
- Strict save sanitizer, script load order, game runtime wiring and offline assets.

Previous **98** tests remain, for a full **110-test** GitHub Actions regression suite. A fresh-save initialization issue exposed in CI was fixed before completion. The full suite has passed.

### Quality limitations
- Node-level behavior and Canvas2D mocks do not constitute a rendered browser screenshot, verified world navigation, touch testing on a physical iPhone, accessibility audit, or gameplay performance profiling.
- This is a short cooperative activity, not yet a fully simulated day-long household cooperation system.
- The world is not simulated in offscreen households; only currently visited residents take part.
- The cozy pixel art and character animation are original procedural canvas graphics using existing residents; further art coherence and motion refinements remain outstanding.

## Remaining line of objectives before v3.0
1. **Actual rendered and iPhone Safari QA**: particularly household object collision, NPC routes, touch/UI sizes, saved games and animation placement.
2. **Deeper character behavior**: cohabitation responses, unique hobby mechanics, emotional relationships, cooperative household chores and careers.
3. **Cooking Mama-inspired gameplay variety**: make the twelve existing recipes mechanically different, deepen hands-on cooking, and add meals that connect meaningfully to household routine.
4. **Village/household cohesion and balance**: town shops, changing projects, NPC goals, meaningful village discoveries and economy tuning.
5. **v3.0 Generations** only after quality and household depth are strong enough, including save-safe families, optional aging, parenting, school/life stages and heirloom history.

**The owner wants a chance to direct what happens after 3.0. Do not choose or implement a post-3.0 roadmap without their input.**
