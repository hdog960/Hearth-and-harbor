# Hearth & Harbor v2.5.29 — Together at Home

## Why this is a substantial step toward a living household

The existing Daybook, v2.5.27 independent schedules and v2.5.28 manual baton make it possible to guide two residents in the same home. However, they still mostly work in parallel: Mabel can cook and Rosie can tidy, but their efforts rarely produce a **shared goal** with a lasting result. This update makes those complementary, completed routines collaborate meaningfully without turning home life into mandatory chores or infinite money.

## New actual gameplay

Enter a residence containing two actual residents, open its Household Daybook and select **💗 Together at Home · Roommate Projects**. Choose from three projects:

1. **A Breakfast Worth Sharing:** one roommate finishes a real meal and the other tidies; earn an illustrated **hand-thrown breakfast teapot** on the home's wall shelf.
2. **The Storybook Corner:** one roommate reads and the other actually completes a hobby; earn a **hand-bound storybook** on the shelf.
3. **The Evening Lantern:** one welcomes someone with a real conversation and the other makes a real meal; earn a **glowing amber lantern**.

Each project has assigned responsibilities, **two separate people**, and clear progress for each. Selecting a project does not grant rewards. The pair may complete its actions in either order, via real manually guided Daybook actions or real autonomous/independent schedules. The final activity must actually finish before the shared home scene receives the keepsake.

**Optional one-tap preparation:** Choose **Add these tasks to both residents' independent plans**. The game checks available slots for **both** residents before changing either queue; it never overwrites existing work or schedules the same step twice. The scheduled actions then run through the game's existing real walking, timed use and needs/aspiration rewards. A resident under direct manual control must return to independent mode before the new scheduled step can execute; the user can also guide the task manually.

If the roommates change homes or the in-game day changes before finishing both parts, the unfinished project is no longer eligible. The book never consumes ingredients, dishes or coins for this separate household mechanic.

## Progression, rewards and original scene art

- A genuinely completed project gives each roommate **+6 Social and +5 Fun**, and the pair **+2 relationship bond**. These are small, capped additions to existing real need and relationship state; no new currency, XP, inventory or passive payouts.
- **One finished project per household per in-game day.** Replay on future in-game days is optional but never produces the same permanent keepsake twice.
- The household builds a **three-object permanent wall shelf** as unique projects finish. The shelf, teapot, hand-bound book and lantern are drawn directly into the real Canvas2D home scene in original colors/geometry. Each unique keepsake adds **+2 permanent home comfort**, maximum **+6** beyond existing decoration and traditions, with total comfort capped at 100.
- The book includes dated genuine completion history and progress per roommate, plus a voluntary **swap responsibilities** control that explicitly resets any partial progress for that day's project.
- Empty/single-resident homes cannot start a collaboration or invent another participant. Other residences have fully independent projects and progress.

## Technical / safety design

The existing save key remains \`hearth-harbor-save-v1\`. A small optional \`roommateProjects:{homes:{},history:[]}\` record is strictly sanitized at import: six known residences, known residents and project types, valid game dates, bounded progress and at most 36 authentic-shaped memory entries.

- \`roommate-projects-v2529.js\`: project catalog, strict save import, real two-resident progress and anti-double-claim checks, existing-schedule preflight and queued activities, UI, resident-specific home benefits and original in-world shelf.
- \`roommate-projects-v2529.css\`: accessible, illustrated and narrow-phone-friendly household project planner.
- \`game.js\`: hooks project progress **only from genuine first daily completed** guided and autonomous residence actions; calls original shared-needs/bond rewards and player save; adds the Daybook link, home comfort and real wall shelf drawing.
- \`index.html\` and \`sw.js\`: new modules loaded before the main game, versioned offline iPhone cache.
- \`tests/roommate-projects-v2529.test.cjs\`: 26 new tests verifying all three project variations, separate residents and homes, imported saves, cancel/day-change/move/duplicate guards, atomic shared planning, original art and game integration.
- \`tests/manual-daybooks-v2528.test.cjs\`: previous title test generalized to current release title.

**Expected full suite: 328 tests** (302 existing + 26 new). Ship only once PR syntax and all regression checks pass and main GitHub Pages production deployment is successful.

## Important boundaries

This project relies on the real in-room Daybook and autonomy systems. It does not simulate unvisited houses, fake completed actions, grant monetary or XP rewards for scheduling, or claim that residents are physically co-animated in a new cutscene. The existing home animations and real timed action completion are authoritative. The wall shelf is a new visual reward, not a placeholder photo or stock asset.

**Physical iPhone Safari 320–390px gesture, screenshot, VoiceOver and runtime performance QA are still outstanding.** Automated source/simulation tests do not count as a real-world visual approval.

## Next steps toward v3.0 Generations

Continue polishing roommates' shared animations and meaningful personalization, then begin carefully phased **v3.0 Generations** with opt-in aging, family milestones, young residents and mentoring, family tree, heirlooms, multigenerational home continuity and safe migration. Per the owner's explicit request, **stop at the completed v3.0 milestone** for their creative review before deciding what follows.

[Previous release: Daybook Baton v2.5.28](DAYBOOK_BATON_V2528_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
