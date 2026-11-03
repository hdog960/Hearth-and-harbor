# Hearth & Harbor v2.8.4 — Pip's Neighborhood Helpers

## Genuine three-person village crafts, not menu claims

After guardianship, Pip's first earned growth chapter and at least one real earlier meeting with a particular adult, Poppy and Pip can return to that actual character in Maplewood and make a small community craft. Six different residents have distinctive written themes, illustrated color palettes, tasks, two opening choices and two closing outcomes.

1. Find Pip and a familiar villager in the playable **town**. Poppy must be nearby; neither a Daybook opened remotely nor a remembered name is enough.
2. Choose a real project idea while physically beside the adult. No reward is granted.
3. Walk to and **tap two different illustrated craft pieces in the world**. Each must be reachable on valid walkable tiles, with Poppy and Pip physically within reach. A tap without walking does not count.
4. Return to a final meaningful choice. Only now does the game save a truthful memory and a small child need benefit (+6 on the theme need, +1 Joy) and +2 actual Poppy friendship with that adult. No coins or passive payment.

Six crafts: Mabel's Petal Welcome Flags, Rosie's Neighborly Market Basket, Oliver's Little Recipe Exchange, Jun's Village Story Pennant, Bea's Kindness Color Swatches, and Finn's Gentle Pond Notice. Each project has custom world-prop colors, prompts and authored outcomes.

An earned memory appears in Pip's Daybook and Connections Atlas as Poppy + Pip + an actual adult activity, **not** a new parent, spouse, legal guardian or invented blood relative. After completed activities with **three distinct** adults, Pip wears a small original community ribbon visibly in the 2.5D town/cottage. The first legitimate memory for each adult remains in a bounded, sanitized 42-entry collection to preserve the ribbon through long play.

## Existing save and integration safety

No new localStorage key, server, account, paid currency or passive online action. The existing `hearth-harbor-save-v1` gains only optional `youngResidents.pip.helperProjects` records of `{day,id,plan,finish}`. Old saves default to `[]`; invalid entries, duplicate days, bogus adult IDs and unsafe values are discarded. Sessions are ephemeral and interrupted by day change, departure, a moving-away resident, child separation, incomplete physical work or a conflicting adventure. Only final completion calls save.

Touch targets are comfortable for phones. The panel is collapsed by default to avoid making the already-large Pip Daybook longer. The activity is also offered from the real adult's conversation after eligibility. Original low-resolution Canvas shapes and nonblocking motion-friendly glow convey the work without an unrelated icon art style.

## Files and release

- `pip-helpers-v284.js` / `.css`: standalone activity, world props, conditions, narrative choices, saved memory, visible ribbon and phone controls.
- `little-sprouts-v272.js`: child save, book, badge draw and action dispatch.
- `game.js`: real conversation, world tap-to-walk, physical completion and modest adult relationship consequences.
- `family-atlas-v271.js`: truthful date-scoped adult-child-community activity history.
- `index.html`, `sw.js`: ordered v2.8.4 assets and new offline cache.
- `tests/pip-helpers-v284.test.cjs`: isolated earned progression, interrupted/cancelled interactions, guards, save rollover, Atlas and mobile integration tests.

## QA limitations and next Generations direction

Node syntax/regressions and GitHub workflows must pass before merge. A passing automated suite does **not** prove real Safari touch accuracy, visual depth and overlap, VoiceOver, offline restoration with old long-play saves or 30-minute device testing. Verify those before declaring visual polish final.

Next improve genuinely coordinated three-character animations, expand meaningful Poppy/Pip/neighbor choices and scheduling, then work toward more authentic household stages, additional child residents and eventual optional succession. This is **v2.8.4**, not completed v3.0.
