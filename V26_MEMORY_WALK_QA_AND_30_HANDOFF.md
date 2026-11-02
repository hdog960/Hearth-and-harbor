# Hearth & Harbor v2.6.0 — Village Memory Walk

## Milestone reached: v2.6 (pause here before v3.0)

The player requested **continue development until 2.6, then stop and reconsider the road to 3.0**. v2.6 is the planned release checkpoint; do not work past it without an explicit request.

**Maplewood can now visibly preserve genuine household life in the public village.** Unlike another instant crafting/upgrades menu, the Village Memory Walk marries three systems already earned through authentic earlier gameplay: the community's existing two-stage public improvements, the dated Household Chronicle, and actual travel inside the 2.5D town.

### Three real story installations

1. **Garden of Little Beginnings** beside **Blossom Promenade**: requires the already-completed, original two-stage Blossom Promenade project and a real completed household tradition or personal room-corner story. Artwork: carved stone and wooden memorial with five hand-drawn blossoming flowers and climbing vines.
2. **Stories Beneath the Lanterns** beside **Lantern Plaza**: requires completed Lantern Plaza and a genuinely completed two-person roommate collaboration. Artwork: original twin-lantern memorial with warm glow animation.
3. **The Village Welcome Table** near **Rosie's Orchard Cart**: requires completed Orchard Cart and a real family-table supper recorded in the Chronicle, either from a neighbor home or Poppy's Cottage. Artwork: carved keepsake podium with tart, ceramic plate and embroidered tablecloth.

The existing town rendering draws all three only once they actually exist; a distinctive original blossom-decorated **Village Story Tree** appears near the southern town walk after the third installation, with a special once-only +6 Fun completion moment. Seasonal snow changes the marker trims without erasing an installed story.

### True physical participation

- The existing Chronicle is consulted in real time. Selecting a source in the journal **does not immediately install anything or award rewards**. It closes the journal and uses the existing town walking/navigation system to take Poppy to the site, even if the journal was opened at home. Only an actual arrival creates the confirmation to preserve that source permanently.
- The final installation records the **original home, source ID, original real story day, and installation day**. It never changes or relocates the original Chronicle entry and never copies a physical heirloom. If the public works project or the real source is no longer valid before arrival, no installation can be claimed.
- Completed locations are original, tappable public places in the *actual world*. Tapping one walks Poppy to it and gives a modest **+4 Fun and +2 Social once per spot per in-game day**. No coins, XP, groceries, household income, fees or passive progression. All needs capped to 100; repeated tapping gives nothing. Visits and installations persist across browser reload and do not need permanent internet.
- The village Menu, Journal, Poppy's Daybook and neighboring household Daybooks can all open the Memory Walk, allowing players to inspect what they still need and begin their journeys. The album shows real saved proof and progress for each installation.

### Files and quality

- \`memory-walk-v26.js\` — strict optional save import, real source and stewardship requirements, coordinate-based travel/install, once-daily physical visit, durable three-story history and 2.5D Canvas illustrated world art.
- \`memory-walk-v26.css\` — warm illustrated mobile journal with large touch targets, visible keyboard focus, small phone layouts, reduced motion.
- \`game.js\` — live map draw and hit tests, existing path movement/travel callback, genuine Chronicle proof, menu routes, safe import/old save defaults.
- \`index.html\` — new game assets loaded before main game, version **2.6.0** across every asset to prevent stale caching.
- \`sw.js\` — offline cache rotated to **\`hearth-harbor-v260-memory-walk\`** including both new assets.
- \`tests/memory-walk-v26.test.cjs\` — **35** new release-gating checks, target **589** (554 previous + 35) for source validation, original town-project prerequisites, actual arrival, forged source prevention, unique public installations, daily visits, save/import, world taps, actual in-game draw calls and browser assets.

Existing saved data key remains **\`hearth-harbor-save-v1\`**. The new optional \`memoryWalk:{placed:{},visits:{},history:[]}\` record is strictly sanitized to the three known spots, the seven legitimate source households, valid original event kinds, safe day/source identifiers and a bounded recent activity history. An older save simply starts with no new exhibits; previous town improvements and earned historical stories remain available for installation.

### Release and limitations

Only merge after PR JS syntax and all regression tests pass. Then verify both main-branch Cozy QA and **Pages build/deployment success on the same merged SHA** before calling v2.6 live.

This is still a **shippable 2.6 milestone**, not certification of the entire full v2.5 roadmap or actual physical-device visual quality. Physical iPhone Safari screenshots, touch/VoiceOver, viewport/landscape and 30-minute play sessions have **not** been performed. Automated Canvas method tests validate shapes are drawn into the correct render path, not that all layering is visually polished. The user should review the actual result on iPhone before defining the next v3.0 phase.

### Handoff toward 3.0 — not started

The next stage should build from truthful saved Chronicle, real roommates, chosen family, optional adult ages, genuine care and mentorship, one-owned transferable heirlooms, and now the public Memory Walk. A completed **v3.0 Generations** requires actual supported younger residents and guardianship, age-appropriate day-to-day activities, a real family graph, property succession, multigeneration simulation and full mobile QA. Do not claim those features exist and do not continue automatically. The user has requested **a checkpoint at v2.6** and an eventual **final creative review at v3.0**.

[Approved master roadmap](ROADMAP_V22_V30.md) · [Previous: v2.5.37 Heirloom Cabinet](HEIRLOOM_CABINET_V2537_QA_AND_ROADMAP.md).
