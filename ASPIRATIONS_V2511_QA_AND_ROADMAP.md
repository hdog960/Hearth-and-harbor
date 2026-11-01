# Hearth & Harbor v2.5.11 — Roots & Keepsakes

## Why this milestone
Our longer-term design is approximately **65% Sims-like household life / 35% Animal Crossing-like village life**, with standalone but interconnected Cooking Mama-style recipes and festivals. Recent v2.5.5–v2.5.10 releases developed the living village extensively. The largest gap before v3.0 Generations is **household depth and persistence**.

Roots & Keepsakes adds *actual household activity goals*, personal choice and visual memories for Poppy and all six residents. It lays a clean family-history foundation without prematurely adding children, aging, generations or untested family data migrations.

## Playable features
- Seven people: Poppy, Mabel, Rosie, Oliver, Jun, Bea and Finn.
- **Three optional personal aspirations per person**:
  - 🪡 **Cozy Maker**: complete **Tidy → Hobby → Rest**.
  - 📚 **Story Keeper**: complete **Read → Quality Time → Hobby**.
  - 🍲 **Caring Heart**: complete **Meal → Quality Time → Tidy**.
- All three steps come from the **existing functional household Daybook and home autonomy**, not from buttons that grant imaginary activity. The player/resident physically follows the usual route to a home station and completes a timed action before the goal progresses.
- **Each step must occur on a separate in-game day**. Repeats, reloads or switching aspirations cannot bypass the daily progression cap. A resident can only progress inside their actual visited residence; Poppy only progresses inside the cottage. Resident home autonomy is also supported when that residence is currently visited, because completing real autonomous activities counts.
- Aspiration selections are **player-configurable for all seven**. Changing an unfinished aspiration resets its incomplete steps; completed paths remain permanently finished and cannot be farmed. A completed path does *not* silently choose the next one; the player chooses when to start another.
- Each completed three-day aspiration awards **+4 Hearts once**; Poppy additionally earns **10 in-game coins**, while an NPC gains **+5 friendship** with Poppy. All are limited to one reward per character/aspiration lifetime.
- Completed aspirations create **real pixel-drawn wall keepsakes** in Poppy's home or the associated residence: individual flower, book and heart designs, displayed as wooden-framed miniature memories. Shared residences show the framed achievements of the residents living there.
- A **Roots & Keepsakes** journal lists each person's ongoing track, next activity, daily progress and completed achievements, plus a bounded household memory archive.
- Access from **Menu, Journal, Poppy's Daybook, or a resident's household Daybook**. Mobile-first buttons and readable progress panels; zero subscriptions, ads, paid imagery or extra hosting.

## Data and compatibility
The existing \`hearth-harbor-save-v1\` local save remains the only save key. This release adds:

\`\`\`js
homeAspirations: {
  people: {
    player: {path: 'maker', stage: 0, lastDay: 0, finished: {}},
    mabel: {path: 'maker', stage: 0, lastDay: 0, finished: {}},
    // ... same structure for six residents
  },
  memories: [{id: 'player', path: 'maker', day: 18}]
}
\`\`\`

New module \`aspirations-v2511.js\` and stylesheet \`aspirations-v2511.css\` are loaded ahead of the game runtime and precached in \`sw.js\` as \`hearth-harbor-v2511-roots-and-keepsakes\`.

The serializer validates allowed people and path IDs; step range 0–2; integer day stamps 0–9999; completion dates; and a maximum of 21 unique achievement memories. Older saves gain safe defaults; no previous household, relationship, fishing, festival, cooking, museum or economic records are overwritten. Completed tracks retain their **explicit null active selection** on reload; old saves with a missing selection receive a personality-based default.

The module's state validator includes guards for missing entries even in fresh or incomplete default saves. The selection handler rejects unknown IDs (including prototype property names). No new mechanics rely on a network connection, API subscription or background process.

## Automated quality checks
- Added **nine regression tests** in \`tests/aspirations-v2511.test.cjs\`.
- Exercises **all 21 character/path combinations**, 63 activity-step completions across distinct game days and intervening save/reloads.
- Rejects invalid room context, unowned NPC activities, wrong action orders, repeat-day claims, repeat final rewards, invalid saves and malicious path IDs.
- Checks switching unfinished goals; completed state surviving a reload; already-completed paths being impossible to restart; and existing unrelated save data staying intact.
- Exercises Poppy and shared-household canvas keepsake drawing.
- Verifies integration hooks in player queued activity completion, guided resident completion, resident autonomy completion, script ordering, and iPhone offline asset caching.
- Existing regression suite for all v2.5.5–v2.5.10 features remains part of GitHub Actions. The complete automated QA workflow passed this milestone.

### Quality limitations
- These are **code-level simulated** tests and Canvas2D method checks. A **real iPhone Safari** test, rendered screenshots and full on-device navigation/pathfinding inspection are still outstanding.
- The family memory wall is a visual keepsake foundation, not a full family tree or multigeneration legacy system.
- Aspiration tracks intentionally use existing six actions; more expressive and mechanically distinct hobbies, chores, functional furniture, kitchen interactions and household role-play will be needed before v3.0.
- Current NPC autonomy operates in the **currently visited residence**, not as a full background world simulation when the player is elsewhere.

## What comes next on our path to Generations
1. **Playable household quality pass**: real-device tests, route-to-furniture and character-control accuracy, comfort/reward balance and visibility/accessibility checks.
2. **Deep decoration and house functions**: expanded meaningful furniture, storage, wall/floor choices, light effects, room interactions, touch-friendly placement undo and household specialization.
3. **Stronger household autonomy and care**: meaningful hobbies, needs including hygiene, realistic shared routines, household social cooperation or disagreement, memorable family meals and aspirations with richer steps.
4. **Town economy & cooking depth**: market orders tied to household needs, more distinct recipe games, evolving storefronts and town-wide improvements that matter outside festivals.
5. **v3.0 Generations**, only when household life is deep enough: opt-in aging, multiple life stages, parenting, schooling, family-tree and heirloom history, inheritance, household transfers, and long-term save migration / balance testing.

The user will provide creative input on what follows once the game progresses to the appropriate milestone. Do not assume Generations scope is finalized beyond the original roadmap.
