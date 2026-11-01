# Hearth & Harbor v2.5.14 — At Our Table

## Place on the road to v3.0 Generations
This release strengthens the connection between **Hearth Kitchen and household relationships**, rather than introducing a disconnected new menu or starting Generations before the existing life simulation has sufficient depth. The central goal is to turn dishes the player **really cooked** into small, recurring household stories. It complements the existing quick **Share** action in Hearth Kitchen rather than replacing it.

## What's playable
**At Our Table** is accessible from:
- **Menu → At Our Table**
- **Journal → Family Table Memories**
- **Poppy's Daybook → At Our Table**
- **A visited resident household's Daybook → Host a Family Supper**
- The **Hearth Kitchen prepared-meal shelf**, via its new **At Our Table** button.

The player must be in **Poppy's cottage** or one of the six real, visitable resident households. Empty neighbor homes cannot host a pretend resident meal. The in-game family-table interface recognizes the actual NPCs who currently live there; no guests, promises, or neighbors are fabricated.

### Family suppers and memories
1. Cook any one of the **twelve existing recipes** through the original hands-on kitchen activities (the prepared dish must appear on the real plate shelf).
2. Open At Our Table in the home, choose a prepared plate and select a conversation theme:
   - **Tell a favorite little story** — a social, memory-building moment.
   - **Celebrate a tiny achievement** — a particularly cheerful evening.
   - **Imagine tomorrow together** — a cooperative, future-focused conversation.
3. The world menu closes. **Poppy walks to the actual dining area** using existing world pathfinding. **The prepared dish is consumed only after arrival**, not when entering or abandoning the dialogue.
4. When arriving, the in-game dinner uses **exactly one** saved cooked dish, updates Poppy's real Hunger, Fun and Social needs and, where applicable, the currently present residents' Food, Fun and Social needs.
5. Residents react with extra friendship and social benefit if it was their established favorite dish. The same resident favorites already used in Hearth Kitchen are preserved; no duplicate recipe or preference catalog is invented. When two neighbors live together, dinner also increases their **existing Town Bonds** and gently reduces Town Tensions based on the chosen story.
6. The dinner leaves a dated, quality-rated household story in a permanent **Family Table scrapbook**. One featured supper is allowed **per in-game day per household**. It does not mint coins or hearts or charge a new currency.
7. When a home has had **three legitimate suppers**, a modest original, hand-painted **family-table framed keepsake** appears in its real game room. The current day's shared supper is also illustrated on an in-world table with plates and warm rising steam. This is original Canvas2D art; there are no external image assets or icons substituting for a functional game.
8. Poppy can also make a **quiet cottage supper** without NPC guests. Doing so can advance the existing *Caring Heart* meal aspiration step, which still enforces its own once-per-day and ordered progression rules. Visitors are not awarded false relationship bonuses.

The supper is a light shared-household experience, **not a claim that every NPC walks separately to a dining chair**. The player physically walks to the table; resident presence is checked against the actual occupied home. Detailed resident dinner seating, dining animation, and choreographies remain future polish targets.

## Save and economy safety
The original **\`hearth-harbor-save-v1\`** localStorage key is unchanged. New optional, validated record:

\`\`\`js
familyTable: {
  days: {player:0,h0:0,h1:0,h2:0,h3:0,h4:0,h5:0},
  counts: {player:0,h0:0,h1:0,h2:0,h3:0,h4:0,h5:0},
  memories: [{home:'h0',day:3,recipe:'jam',quality:3,topic:'remember',guests:['rosie','oliver']}]
}
\`\`\`

\`HearthFamilyTable.clean\` bounds completed days and lifetime counters and limits stored memory history to **40** validated entries. It rejects out-of-range days, unknown recipe IDs (including prototype property names), unsupported conversation topics, invalid plate quality, duplicate memories for the same home/day, unknown homes and imaginary guests. Older saves gain a safe empty record without resetting other systems.

Meal selection and a conversation topic do **not** remove food or grant rewards. Completion checks that the player is still in the same home on the same in-game day, with the same household occupants and exactly the selected dish at the selected plate index. Stale transactions are rejected. One dinner per house/day and the original kitchen's inventory limit prevent duplicate reward claims.

## QA and limitations
- Added \`family-table-v2514.js\`, \`family-table-v2514.css\`, and \`tests/family-table-v2514.test.cjs\`.
- New JS/CSS loads before \`game.js\` and is offline-precached under \`hearth-harbor-v2514-at-our-table\`.
- Added **10 deterministic regression tests** for all twelve real recipes and existing favorites; in-world arrival before dish consumption; exact single-plate removal; dish quality; favorite reactions and pair bonds; daily caps after save reload; changed household, missing plate, changed scene/day transaction aborts; three-dinner keepsakes; the quiet cottage case; empty households; save sanitation; kitchen, runtime and offline-asset integration.
- The complete GitHub Cozy QA suite has **76 tests**, including the 66 tests carried forward from v2.5.13.
- An old v2.5.13 Atelier regression was made version-independent so a legitimate update to the offline worker cache does not break previous tests.
- **Still needed:** a screenshot-driven, end-to-end browser/iPhone Safari playthrough of a dinner, all residence addresses and iPhone screen widths, reliable touch testing, and confirmation of navigation in real devices. Unit tests validate the module but do not replace real-device QA.

## Continuing toward Generations
1. **Household actions and immersion:** actual character seated dinner animations, expressive reactions, multiple household members sharing responsibilities, better default NPC motion during home visits.
2. **Cooking Mama-style variety:** richer minigame differences, genuinely distinct seasonal techniques and favorite-meal storytelling, preserving the depth of the original twelve recipes.
3. **Household autonomy and care:** stronger daily decision-making, furniture interactions, richer needs and hobbies, emotional consequences, and practical household decoration controls.
4. **QA first:** real iPhone/Safari rendering, home navigation, room decoration drag interactions, save integrity, NPC scene interactions, economy/reward audits.
5. **v3.0 Generations:** when those foundations are sound, carefully introduce selectable aging, family/parenting progression, family tree and heirloom systems with safe data migration. **The owner wishes to weigh in when we reach v3.0 before establishing what comes after.**

Previous release context: [v2.5.13 Little Atelier](ATELIER_V2513_QA_AND_ROADMAP.md) and the long-term [v2.2–v3.0 roadmap](ROADMAP_V22_V30.md).
