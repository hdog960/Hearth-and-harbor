# Hearth & Harbor v2.8.0 — Pip's Growing Seasons

## The first real optional developmental progression in Generations

Pip can now *visibly* grow through two additional **childhood development stages**: Child → Growing Child → Independent Child. These are **earned developmental chapters**, not an assertion that a year has passed or a birthday occurred. **No stage happens automatically.** The player must first have genuinely chosen guardianship, complete an extensive collection of actual long-term life experiences, stand physically beside Pip in the playable cottage, and explicitly celebrate the unlocked chapter. Pip remains a child at all stages: there are no adult jobs, adult romance, legal family/parent changes, neglect penalties, school enrollment, fictional new residents, or automatic inheritance.

### Chapter 1 — Finding My Own Feet
Requires all the following, supported by genuine saved play:
- 4 completed story, nature or art learning sessions in total
- Practice in at least 2 of those activities
- Real assistance with Poppy's home actions on 2 different days
- 2 completed actual villager encounters across genuine days (using Pip's durable village-bond record)
- At least 1 real, completed bedtime memory

### Chapter 2 — Ready for Bigger Adventures
Available **only after choosing Chapter 1**. Requires:
- 12 genuine learning-session completions
- At least 2 completed sessions in each of the 3 activity types
- Genuine Poppy household cooperation on 4 different days
- Meaningful real interaction with 2 different actual villagers
- 3 completed bedtime rituals
- 3 fully played, in-person independent project days
- Both actual stages of at least 1 selected childhood aspiration

The first chapter is intended to feel meaningfully achievable; the second is a longer-term life goal. Opening the milestone screen, letting the day pass, passive observation or leaving an interaction unfinished **does not** complete these requirements. Durable learning and villager counters survive rolling older scrapbook records, while home, evening and project requirements consider legitimate dates and completed records.

### Physical gameplay consequences
- Pip's existing 2.5D sprite grows from **0.76 → 0.84 → 0.92** of its original 96×132 character artwork (scaled, **not** repurposed adult art).
- The grown character wears new handcrafted satchel details, with additional accessories at the next milestone.
- A real illustrated **growth chart** appears on a cottage wall after the first chapter, with another height mark and decoration after the second.
- Pip's *existing dream-driven daytime routine* also advances: after Chapter 1 the morning project becomes more ambitious at a slightly different cottage station, and after Chapter 2 the afternoon project moves into an independent version. The original world position, live hitbox, activity touch prompts, movement interpolation and interactive mini-projects follow the new positions. No menu-only artificial indicator.
- The existing **Pip Daybook** now displays the current developmental phase, precise earned requirements, any ready-to-celebrate milestone and saved first/second-chapter days.
- The Connections Atlas records actual chosen growth chapters as dated child-life history, never an adult marriage or a fictitious biological relationship.

On completing a chapter, Pip gets a **one-time, small +8 Confidence and +6 Joy encouragement**, capped at 100; not coins, passive income, multiplier farming or a purchasable upgrade. Repeated claims are impossible. Growth remains permanently earned in the save unless the player explicitly deletes the original save.

### Save migration and architectural constraints
- Save key is still **\`hearth-harbor-save-v1\`**; there is no second database, account, server call, or background scheduling.
- One optional \`youngResidents.pip.growth\` record stores only: bounded stage (0–2), first actual chosen game day and second actual chosen game day. Import sanitation rejects malformed, incomplete, reversed or invalid dates. Future-dated stages do not render before their date, and a child without actual chosen guardianship cannot display grown status. Earlier saves migrate to stage 0 with **all** previous gameplay and data preserved.
- Real child growth is computed **lightweight** in the world-rendering loop (no repeated scanning of the whole childhood history at 60fps). Full accomplishment counts are recomputed from completed records only when the user opens the Daybook or explicitly celebrates a milestone.
- Adult routines, resident jobs, wages, weddings, art, individual rooms, player appearance, optional adult aging and the existing child learning/guide/household/bedtime/neighbor/dream systems remain unchanged.

### New and updated source files
- \`pip-growth-v280.js\`: fully optional, completion-based and date-validated developmental stages; whole-life evidence; two-stage chapter claims; accurate visible growth accessories and Canvas room chart; safe mobile renderer.
- \`pip-growth-v280.css\`: original illustrated family growth book with earned goal progress, accessible keyboard focus, 52px touch targets, reduced-motion and narrow-iPhone styling.
- \`little-sprouts-v272.js\`: initial growth defaults, existing-save sanitation, new child status, Daybook, real in-world art and safe touch actions.
- \`pip-projects-v278.js\`: actual new morning and afternoon project routes and physical props unlocked at the two developmental stages, without altering earlier routes for ungrown children.
- \`game.js\`: new child sprite scaling at both home and town and real cottage growth-chart art, keeping adult character rendering untouched.
- \`family-atlas-v271.js\`: grounded dated optional child milestones.
- \`index.html\`, \`sw.js\`: v2.8.0 asset order and offline cache.
- \`tests/pip-growth-v280.test.cjs\`: **37 new development tests** for actual play prerequisites, claim restrictions, migrations, world art, save, Atlas and iPhone PWA. All existing regressions required.

### Remaining QA / roadmap toward v3.0
The automated JS syntax and Node regression run must pass before the PR is merged. Physical iPhone Safari touch, animated world placement, 320/375/390px scrolling, VoiceOver, offline old-save restore, long sessions and live GitHub Pages deployment are **not** verified merely by passing automated Node tests.

The v2.8.0 milestone introduces true opt-in visible childhood progression, **not** a complete multigenerational system. Next: deeper stage-specific interactions and age-appropriate everyday behaviors, family routines and play spaces, then carefully expand toward additional children, optional chronological aging, household succession and inheritance. Never falsely invent residents or relationships just to populate a new feature.
