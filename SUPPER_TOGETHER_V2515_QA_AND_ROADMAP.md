# Hearth & Harbor v2.5.15 — Supper Together

## Purpose
Continue toward **v3.0 Generations** by improving an existing household mechanic rather than starting a disconnected one. v2.5.14 connected actual cooked dishes, needs, friendships and family memories. v2.5.15 makes the **meal preparation and resident participation physically visible**, with original in-world character sprites, animated table details, and a playable, touch-friendly setting activity.

## What changed

### 1. A real, little table-setting activity
- Prepare a dish using any of the twelve existing hands-on Hearth Kitchen recipes, then choose **At Our Table** from the kitchen's saved-plate shelf, Menu, Journal, or a household Daybook.
- Choose one of the three existing dinner conversation themes. Poppy **walks to the actual dining area**.
- Instead of immediately consuming the food, the game opens the original **Set the supper table** activity.
- Select one of three linen palettes: **Clover Green**, **Rosewater**, or **Golden Honey**. Choose to light or extinguish an optional candle.
- **Tap each person’s empty place** to arrange a plate. There is a real number of places: one for quiet supper at Poppy’s cottage, two in a single-occupant neighbor home, or three for Poppy plus two real housemates.
- Players may tap seats in any order. The **Serve the supper** button remains disabled until every named place has been set.
- **No real-time countdown, punitive failures, extra food charges, or additional currency.** Players can leave the table before serving and preserve their cooked dish.
- Meal consumption and the original v2.5.14 relationship/needs/memory rewards occur **only after** arriving, completing the place setting and pressing Serve. These actions are guarded again against an unexpected day change, resident departure, missing/replaced cooked dish, wrong house, repeat meal or invalid inputs. The same chosen prepared plate is consumed **exactly once**.

### 2. Actual residents at supper in the game world
- Resident supper participation now uses the six existing original character sprites rather than extra stand-in NPC icons or invented visitors.
- When dinner starts in an occupied residence, the actual housemates **move smoothly from their real home positions to distinct places at the table**, with happy facial expressions and topic-dependent reaction emotes.
- Household autonomy **pauses during the shared supper scene**; it resumes afterward from the seated positions, avoiding instant teleportation back to where the NPCs began.
- The dinner scene lasts a restrained **26 seconds of active game time**. The animation does not run down behind the completion modal and respects the game pause control. If the player travels away or the household changes, it does not display duplicate NPCs in other places.
- New original Canvas2D animated touches: individual napkins, utensils, themed table linen, warm steam, and an optional candle. These appear **in the actual room** over the existing furniture and character art. Players retain the original framed family-table keepsake earned after three qualifying suppers.
- NPCs do not appear from nowhere: supper invitations use the **actual current household roster**, and there is no duplication of sprites or autonomous rewards during the event. This is a brief shared scene, not a claim that the game now simulates fully independent NPC mealtime schedules in unvisited homes.

## Compatibility and persistence
- Continues to use the same **\`hearth-harbor-save-v1\`** key. Existing stored prepared dishes, fridge/pantry, recipes, resident relationships, town bonds and tensions, home aspirations, family-table memories, festival memories, Town Hall construction and nature progress are left intact.
- **No new persistent data type** is required: table setting state and the animated supper gathering are temporary session state. Players cannot gain rewards by reloading a saved table-setting scene.
- The \`family-table-v2514.js\` module is extended for v2.5.15 rather than duplicating its recipe/household logic.
- Added **\`supper-together-v2515.css\`**, loaded in \`index.html\` and offline-precached in \`sw.js\` as \`hearth-harbor-v2515-supper-together\`.

## Automated QA
- Previous \`tests/family-table-v2514.test.cjs\` regression cases now accurately complete the new table-setting step before asserting the former prepared-meal results. The old v2.5.14 test still verifies all twelve existing recipes, favorite foods, genuine plate consumption, claims only once per home/day, safe persistence and real relationships.
- Added **11 permanent tests** in \`tests/supper-together-v2515.test.cjs\` checking:
  - walk-before-setting and zero changes prior to serving;
  - tap-to-place different numbers of real seats and no early service;
  - three linen palettes, optional candle, invalid identifiers and full prepared-meal inventory preservation on cancellation;
  - changed day, home, resident roster or prepared dish aborting without a reward;
  - animated unique real resident positions, smooth moves, paused autonomy, in-world art and a limited celebration lifetime;
  - browser JS wiring and offline asset/version integration.
- Whole suite target: **87 tests** (76 carried forward plus 11 new).
- Important limitation: automated code tests and Canvas2D command mocks do **not** replace a physical iPhone Safari test, rendered screenshots or an end-to-end interaction/playthrough. Those remain prerequisites before considering the full household experience production-quality.

## Our line of objectives toward v3.0
1. **Mobile visual and usability QA:** validate world-scale dinner art, physical pathfinding, tiny touch targets, furniture placement, modal scrolling and persistent saves on actual iPhone Safari. Repair failures before adding more household systems.
2. **Richer household life:** real cooperation, emotional responses, distinct hobbies and chores, improved household autonomy and richer furniture animations.
3. **Cooking Mama-style variety:** invest in differentiated minigame gestures and more sensory feedback, not simply additional recipe names.
4. **Living village integration:** shops, neighbor roles, household goals and affordable long-term progression that rewards exploration without repetitive chores or overpowered permanent benefits.
5. **v3.0 Generations:** once prereqs are polished, bring in life stages, family/parenting progression, family trees, inheritance and legacy memories with carefully tested save migrations.

**The user wants to weigh in on what comes next when we reach 3.0; leave the post-3.0 roadmap open for their direction.**
