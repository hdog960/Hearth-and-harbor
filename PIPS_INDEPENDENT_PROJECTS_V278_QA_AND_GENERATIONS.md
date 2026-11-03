# Hearth & Harbor v2.7.8 — Pip’s Independent Little Projects

## Childhood interests now affect real everyday gameplay

This release turns the dreams introduced in v2.7.7 into **a daily visible routine** for Pip in the actual playable 2.5D cottage. Pip no longer merely wears an aspiration emblem while following an unrelated daily schedule. Their **chosen** dream influences the actual location, prop, routine title and animation at two daily time windows: morning (6 AM–noon) and afternoon (noon–6 PM). Pip begins their projects autonomously based on the existing in-game clock, without player menu commands or rewards.

Each aspiration has two separate physical projects, drawn as original illustrated chunky-pixel Canvas art:
- **Keeper of Stories:** a little storybook nook in the morning; an open illustrated page and tiny scroll at a story-writing station in the afternoon.
- **A Heart for Home:** care for soft cottage furnishings in the morning, then prepare a welcoming table in the afternoon.
- **The Wonder Collector:** watch a growing miniature seedling in the morning, then write plant observations in a field journal in the afternoon.

The original evening bedtime and quiet-rest stages remain in place. The existing *actual child sprite* animates as Pip works, and movement between stations uses deterministic eased interpolation rather than teleporting. Existing earned Chapter 1 and Chapter 2 aspiration receipts add additional original world-art details. Switching dreams changes Pip's route and props immediately. No dream selection (including before actual guardianship) leaves the previous schedule unchanged. The daily route is **derived from save state**, not duplicated in a new save field.

### Optional participation: share a genuine project

Pip does all this independently. Poppy can also walk to Pip’s current **real** work spot between 6 AM and 6 PM and join in a two-step, aspiration-specific activity. Each theme has two distinct dialogue choices with original playful writing. Both steps must be finished at the actual location on the same game day and during the same work period; walking away, changing the chosen dream, changing rooms, canceling, rolling into a new day or skipping a choice earns nothing.

A successful shared project produces a small bounded child-only benefit (+7 Curiosity or Confidence, +3 Joy) and **one saved authentic project memory per day**. This is optional, not automatic money or passive power. The earlier real Story, Nature, Art, bedtime, villager, household-help and guardian activities still have their own separate rewards and progression, unchanged. Joining a tiny project does not substitute for completing older aspiration prerequisites: real gameplay still matters.

### Genuine memory and compatibility
- New optional \`youngResidents.pip.projects\` is a small list of true day, dream, work period and two-bit decisions. The list sanitizes malformed/unknown values, deduplicates by day and retains up to 40 events for save size. It is entirely separate from current aspiration achievements.
- The original \`hearth-harbor-save-v1\` browser storage key remains unchanged. Old saves have an empty projects history, and previous saved dreams, household care, guardian, adult residents, relationships, marriage, jobs, income and housing are untouched.
- Completed shared projects can appear in the **Connections Atlas** as historical moments between Poppy and Pip. They never fabricate parentage, marriage, guardianship or other kinship.
- Features render and work offline after service worker refresh; no web APIs, backend, login or paid components were introduced.

### Source changes
- \`pip-projects-v278.js\`: dream-dependent physical child routes, morning/afternoon work areas, dynamic 2.5D Canvas project objects, genuine two-step player interaction and validated per-day save history.
- \`pip-projects-v278.css\`: original storybook UI with touch targets, keyboard focus and reduced-motion styles.
- \`pip-routines-v273.js\`: actual child location and schedule now derive from chosen childhood interests when genuinely guarded, preserving the baseline when none is chosen.
- \`little-sprouts-v272.js\`: child save migration, Daybook display, actual position/prop drawing, and safe action dispatch.
- \`game.js\`: real Pip sprite uses subtle idle project-working animation while retaining moving/facing logic.
- \`family-atlas-v271.js\`: authentic dated child project history.
- \`index.html\`, \`sw.js\`: v2.7.8 asset order and offline cache rotation.
- \`tests/pip-projects-v278.test.cjs\`: focused new tests for genuine world routes, finished sessions, cancel/future/forged inputs, original artwork, old saves and mobile asset order.

### Limitations and next objective
This is **real independent behavior within Pip’s current cottage**, not a claim that full school, child aging, more children, parenting, inheritance or v3.0 Generations are complete. Pip does not independently traverse dynamic obstacle navigation for these schedules; they follow authored walkable activity locations using the existing deterministic world route. Separate physical iPhone Safari screenshots, accessibility/VoiceOver, live deployment, touch-target alignment while moving and long playthrough QA remain outstanding after CI.

Next milestone: richer childhood autonomy and meaningful neighborhood environments, real family participation and age-appropriate development with explicit optional life stages, preserving this world-art and save-integrity standard.
