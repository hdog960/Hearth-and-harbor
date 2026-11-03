# Hearth & Harbor v2.9.2 — Pip's Own Little Ideas

## An actual child initiates a family moment

Previously the player always chose when Pip could help with an activity. v2.9.2 adds **distinct, child-authored requests** that arise from Pip's earned Homegrown Personality and the household's real daily routine, without inventing activities Pip never completed.

**In-game loop:** After Poppy has chosen to become Pip's guardian, visit Pip inside the cottage between 11 AM and 5:30 PM. If Pip is nearby, an activity is still available and the family is not currently occupied by a visit, genuine child project, community mentor, or another shared task, Pip gets a tiny illustrated thought next to their original child sprite. Tap Pip in the playable world to hear the suggestion. The corresponding collapsed section also appears in the existing Pip Daybook.

- Pip chooses whether to request a **reading**, **tidying**, **mealtime** or **creative** household activity, taking their earned strongest interest into account. Every few days Pip asks to explore something different.
- Poppy is presented with two real, non-random family styles: **Let Pip take the lead** or **Show Pip how**. Each activity has its own authored opening, distinctive explanation, and two remembered outcomes. Declining or opening the Daybook does nothing to the save.
- Choosing one queues the **same original Household Daybook action** already in Poppy's game, rather than generating a shortcut. The childhood navigation system makes Pip walk, around actual placed and fixed furniture, toward the genuine family activity spot.
- Only after the original **3.8-second in-world furniture hold** finishes successfully for the first time that day and both people are still physically near one another can the child-authored choice become a real family memory. Queueing, viewing and clicking the conversation have no economic effect.
- A completed child-led moment grants **+4 confidence**. A genuinely taught moment grants **+4 on the actual relevant childhood need** (curiosity for reading, confidence for home care/meal, joy for making art). One completed Pip idea per day. No coins, passive income or energy paywall.
- Over time, repeated genuinely completed leadership or learning moments affect how Pip approaches and discusses the next family idea. Separate cumulative leading and learning counts survive the short visual memory-history rollover without resetting a save. The Daybook preserves actual date, activity and outcome.
- A little original, task-colored hand and paper art appears in Pip's *actual world position* only during the real household hold, together with the already existing Poppy working animation. No separate giant activity screen is added.

## Save and play safety

The **original** localStorage key remains `hearth-harbor-save-v1`. The only new optional, sanitized child field is `youngResidents.pip.childInitiatives={records:[{day,kind,choice}],leadDays,learnDays}`. Older saves seamlessly default to empty. Records reject invalid kinds, choices, dates, pre-guardian days and repeated days. The list is bounded to 40 actual days, and larger cumulative totals are capped at 999.

A current request is deliberately **session-only** until its activity really finishes. Changing scenes, changing dates, declining, invalid family context, blocked furniture or an interrupted household task cannot silently create memories, benefits, adopted relatives or new relationships. Existing v2.9.0 home visitors, v2.9.1 real cottage navigation, real earned interests, bedtime rituals, neighborhood projects and permanent art remain authoritative.

## Release implementation

- `pip-initiatives-v292.js`, `pip-initiatives-v292.css`: four individually authored child-initiated scenes, real proximity and household context, no queue reward, true timed-task completion callback, save validation and compact Daybook panel.
- `little-sprouts-v272.js`: optional child data migration, actual movement destination chosen from Pip's request, legitimate activity-hold art, lightweight world hint, request actions and priorities.
- `game.js`: existing tap-on-Pip now opens the world encounter when eligible and falls back to the ordinary Daybook otherwise; genuine `runOwnHomeAction` completion drives the one-time memory after the first true household result.
- `index.html`, `sw.js`: correct script order, cache-busted current files, actual offline resources for iPhone Home Screen.
- `tests/pip-initiatives-v292.test.cjs`: 30+ regression cases for four stories, real guardianship, clock window, physical visit, earned interests, context priorities, no fabricated rewards, interrupted/incorrect household action, two lasting outcomes, anti-farming and offline iPhone integration.
- Prior release tests remain in the suite; their expected current PWA asset versions are updated without relaxing gameplay guards.

## Quality gates and next toward v3.0 Generations

Before release, run JS syntax checks and **the full deterministic Node regression suite on the branch**. Following merge, verify both main-branch Cozy QA and GitHub Pages published successfully on the merged SHA.

These tests cannot guarantee the final child speech bubble never overlaps a user-arranged lamp or that small-phone touch/scroll and real Safari PWA sessions are perfect; real physical iPhone play remains necessary.

The roadmap remains authentic family continuity, household relationships, optional expanded younger residents and meaningful later childhood stages. **v3.0 is the user's evaluation checkpoint**, not the end of work or an automatic version upgrade.
