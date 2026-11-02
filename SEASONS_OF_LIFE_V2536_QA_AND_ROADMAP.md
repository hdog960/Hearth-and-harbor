# Hearth & Harbor v2.5.36 — Seasons of Life

## First actual Generations life-stage foundation

**Seasons of Life** is the first opt-in adult life-stage system, integrated with the existing **28-day village seasonal year** (four 7-day seasons). It supports the game's six actual adult neighbors. It does not invent children, biological family data, or a fictional lineage, and it does not automatically age anyone who already has a save.

The game remains identical to the older one until **🍂 Seasons of Life · Birthdays → Enable life seasons** is deliberately selected. The toggle saves an opt-in setting for the six established adults. Their individual birthdays are staggered across the village year, starting four to twenty-four days after opt-in. No one receives an immediate age-stage upgrade, birthday reward or unwanted appearance change on the day of consent.

Adult life chapters evolve at actual annual milestones:
- **Young Adult — Finding Their Way**: the starting phase for existing adults.
- **Adult — Putting Down Roots**: after two completed simulated village years.
- **Elder — A Lifetime of Stories**: after five completed simulated village years. An original silver-haired variation is drawn in the actual playable resident sprite, and elders can share tiny additional benefits through genuine mentorship.

**Pause life seasons** can be selected at any time. Milestone dates, birthday windows, adult chapters and appearance are frozen; any completed life history, player homes, neighbor relationships, mastered skills, birthday records and other saves remain intact. Resuming shifts future dates by the paused game days instead of aging the residents retroactively. No one suffers stat penalties or dies just because they age, and there is no forced retirement or forced family expansion.

## Birthday celebrations must be genuinely played

Each milestone produces an optional birthday window, available for seven in-game days, with the honoree's **current real home** recognized dynamically. The player chooses a celebration at a home with two actual adult residents. Their housemate is the birthday host, who must genuinely complete **a meal or a chat** for that honoree, either by direct Daybook guidance or in an existing independent resident schedule. The scheduled step cannot overwrite a full queue, and an already completed same-day task cannot be claimed retroactively.

Opening a book, selecting a date or starting a party gives no rewards. Only the correctly completed first real action, in the correct residence and on the valid day, earns:
- **+4 Social to each** participant, under the existing 100 cap.
- **+1** existing relationship bond.
- A dated, identity-specific birthday memory that cannot be farmed by replay or canceled work.

After two genuine birthday celebrations in one residence, it earns a permanent hand-painted **birthday garland** in the actual Canvas2D home and **+2** home comfort under the existing cap. The display and memories persist across saves and moves. The elder-chapter effect gives **+3 Social to the mentor and +3 Fun to the learner** only when an elder genuinely finishes teaching through the existing two-stage mentorship system, at most once per elder each real game day. Standard and Little Passions Studio hobby completions are wired to the real mentorship result. This adds meaning to reaching elderhood without creating a new idle income or arbitrary punishment.

## Technical details

- \`life-seasons-v2536.js\`: safe optional data import, 28-day calendar and opt-in/pause/resume state, staggered resident milestones, chapter progression, genuine host celebration actions, bounded elder mentorship, event history and original real-room garland.
- \`life-seasons-v2536.css\`: cozy, responsive mobile life book with actual enabled toggle, resident birthdays, celebration controls, proper touch targets and reduced-motion UI.
- \`game.js\`: uses only the original real \`state.day\` day transition; hooks actual manual/autonomous resident action completion, genuine ordinary and Studio mentorship completion, real resident sprite elder hair, room art and comfort, and Daybook/Menu/Journal entry points.
- \`index.html\` / \`sw.js\`: preloads the new module before game.js and precaches assets for offline iPhone browser usage with release version rotation.
- \`tests/life-seasons-v2536.test.cjs\`: **33 additional tests** across opt-in/pause/save, 28-day birthdays, no fabricated rewards, real host actions and home moves, earned garlands, elder teaching, Canvas2D painting, load order/offline.
- Older manual-home and care tests receive non-rewarding observer stubs and rotating cache validation as needed.

The local-save key stays **\`hearth-harbor-save-v1\`**. New optional \`lifeSeasons\` data is cleaned on import with a known resident whitelist, valid bounded dates and years, known celebration activity kinds, bounded completed history and per-home keepstake archive. Saves from older versions simply have aging **disabled**.

**Expected total regression suite:** **518** (485 previously passing + 33 new), complete JavaScript syntax and Node tests required prior to merging; post-merge main-branch Cozy QA and Pages deployment must pass before declaring this release live.

### Intentional limits and next development phases

This is **not** the full v3.0 Generations release. Children, teens, school, pregnancy/adoption, explicit guardianship, a full family tree, inheritance/property succession and autonomous career changes are not yet added; the current six adults remain the source of the real household activity gameplay. Do not invent those features in marketing or pretend they are functional.

Physical iPhone Safari visual/touch/VoiceOver testing remains outstanding, including screenshot QA at 320, 375 and 390px widths, the full 28–140-day natural-life-stage loop, heavy interior decoration and long-session performance. Automated Canvas tests are necessary but do not constitute actual screenshot approval.

**Next toward v3.0:** build meaningful elder/younger household interactions, consentful guardian/child roles using actual new age-appropriate characters, real family connections and multigenerational inheritance, preserving old saves and optional aging. The agreed stop remains **completed v3.0**, at which point the owner reviews and directs further work.

[Previous release: Little Acts of Care v2.5.35](LITTLE_ACTS_OF_CARE_V2535_QA_AND_ROADMAP.md) · [Full roadmap](ROADMAP_V22_V30.md).
