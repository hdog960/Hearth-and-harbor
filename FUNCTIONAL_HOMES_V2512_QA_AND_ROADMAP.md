# Hearth & Harbor v2.5.12 — Rooms With Purpose

## Goal and roadmap position
A real household-depth update, not a new collection of decorative menus. This release continues the original **65% household / 35% village** concept and makes furnishing choices relevant to the household activity engine, preparing for the much larger **v3.0 Generations** milestone. No Generations life stages or aging have been implemented yet.

## Four functional room corners
A home unlocks a functional corner when two suitable furnishings are **within 220 world units** of each other. Their effects are applied **only after** a character finishes the matching existing timed Daybook routine.

| Room corner | Needed furniture | Daybook action | Daily need gain |
|---|---|---|---|
| Storybook Nook | Storybook shelf + honey lamp | Read | +6 Fun |
| Restful Retreat | Bed + patchwork rug | Rest | +8 Energy |
| Gathering Corner | Sofa + flower vase | Chat / write a friendly letter | +7 Social |
| Creative Corner | Chair + fern | Favorite hobby | +7 Fun |

**Importantly, the bed, sofa and bookshelf already drawn into each dollhouse count as real built-in furniture.** Players do not need to purchase a second bed, sofa or bookshelf to activate a corner: they can arrange the matching lamp, rug or flowers close to the built-ins. Alternative purchases and layouts remain supported. The creative corner requires a purchased chair and fern.

The new **Rooms With Purpose** guide is available from Menu, Journal and household Daybooks. It shows the functional status, measured furniture distance, matching daily activity and an optional **room focus**. One chosen focus per home adds +3 to its matching daily activity when that corner is active. An unfinished focus has no benefit; it is not a recurring coin purchase or compulsion. The guide covers Poppy's cottage and six NPC residences.

## Functional actions and room artwork
- **Purchased furniture taps:** Poppy walks to the furniture and opens its **Furniture Inspector**. When Poppy or a resident is actively being guided in the right home, the inspector offers **Use through Daybook**. That action enqueues the existing walk-and-perform behavior. It does not grant needs instantly.
- **Built-in home furniture taps:** Bed, sofa and bookshelf now enqueue real Daybook rest, chat and reading activities; the built-in kitchen continues opening the full cooking book.
- **Built-in guest residence furniture taps:** When guiding a resident, the bed, sofa, bookshelf, kitchen and cozy corner initiate their corresponding household activity; when merely visiting, they are inspectable without awarding unlimited needs.
- The old unlimited **instant click-to-restore** behavior for placed home and resident furniture was removed. Care, rest, hobbies and reading remain rewarding but require actual household activity completion.
- The four room corners add softly drawn floor accents **anchored to the actual positions of the furnishings**. The optional **House Charm** is earned permanently once each home records three valid daily furniture uses; it then appears as a painted wooden-framed ornament in the actual room.
- The system does not replace existing home comfort, resident favorite furnishing effects, hobby/aspiration progression, cooking, or autonomy. Functional bonuses are modest and limited to a **single bonus for each corner per character per in-game day**, only when the original Daybook marks the action as first-completed for that day.
- Both guided residents and existing at-home resident autonomy can earn the same furniture-based bonuses. Autonomous care is still simulated only inside the currently visited residence, not remotely across an unseen village.

## New save data, backward compatibility
The **existing** \`hearth-harbor-save-v1\` browser key remains in use. A new optional field is sanitized through \`HearthFunctionalHomes.clean\`:

\`\`\`js
functionalHomes: {
  focus: {player:'reading',h0:'gather',h1:'gather', /* ... */ },
  uses: {player:0,h0:0},
  daily: {player:{day:0,kinds:[]},mabel:{day:0,kinds:[]}, /* ... */},
  unlocks: {player:false,h0:false}
}
\`\`\`

Save-import checks limit house IDs, resident IDs, focus names, per-day categories and cumulative usage. The House Charm can always be recovered from the usage count. Prior town stories, relationships, household memory wall, cooking pantry, collectibles, festivals, market, nature and construction progression stay intact. No extra network hosting, subscriptions, ads or purchased sprites are required.

## Quality assurance
- Added \`functional-homes-v2512.js\` and \`functional-homes-v2512.css\` before the main game runtime and precached them in \`sw.js\` under \`hearth-harbor-v2512-rooms-with-purpose\`.
- Expanded regression coverage in \`tests/functional-homes-v2512.test.cjs\` (11 cases) to cover furniture proximity, the built-in dollhouse items, room focus, actual Daybook-only bonuses, per-day/reload caps, resident/home ownership, furniture repositioning, earned art, in-world inspector routing and save migration.
- The existing \`tests/aspirations-v2511.test.cjs\` regression now tests the service worker's versioning contract instead of hard-coding the old cache name, while still retaining its original aspiration progress checks.
- The prior 45 automated tests remain; the complete suite now targets **56 tests**.
- **Honest limitation:** Automated Node tests and mock Canvas2D drawing do not constitute an actual iPhone Safari playthrough, rendered screenshots, or a full route/pathfinding and screen-layout audit. Those quality gates remain open before the broad v3.0 milestone.

## Remaining before Generations
1. **Quality-first playthrough**: functional room controls, furnishing placement, room focus, NPC routines, visual art, short/long-session balance, save backups, 320px phone widths and iPhone Safari performance.
2. **Decoration overhaul**: richer furniture sets and furnishing interactions, improved room planning, clearer placement, undo/redo and storage, stronger art direction with good in-world animation.
3. **Household autonomy and needs**: richer hygiene, care, hobbies, emotional consequences, household-level cooperative routine choices and understandable autonomous behavior.
4. **Cooking and economy integration**: home meal scenes involving real prepared dishes and different ways of cooking, meaningful household orders and goals, shops and food preferences tied to family routines.
5. **Only then v3.0 Generations**: opt-in aging, family relationships, children/mentorship, milestones, careers and household legacy/inheritance supported by robust save migration and genuine gameplay depth.

The owner plans to contribute further creative direction once we reach the appropriate point around v3.0. Do not preempt that discussion or declare Generations complete just because the prerequisite infrastructure is present.
