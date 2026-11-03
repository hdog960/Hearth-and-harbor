# Hearth & Harbor v2.9.4 — A Bond Built by Living

## A real guardian-child relationship, built across days you actually play

Previously Pip's childhood activities affected needs, practical interests and life-stage progress, but their bond with Poppy wasn't expressed through an ongoing independent family relationship. **v2.9.4 adds three earned, optional Poppy–Pip relationship chapters**, each resulting from verifiable already-completed activities across genuinely different in-game dates and forms of care. No invented family tree, automatic parenthood, aging, fake daily quests or button-farmed affection.

### Three meaningful family chapters

- **A Place to Belong** — unlocks after at least 4 distinct genuine shared days, 3 kinds of activity and 1 real day since choosing to become Pip's guardian. Pip and Poppy can reflect on finding a safe place through listening or making things together.
- **Learning Side by Side** — unlocks after at least 8 distinct shared days, 4 kinds of experience and 4 days since moving in. Pip and Poppy can affirm Pip's own ideas or learning together.
- **A Home We Keep Growing** — unlocks after at least 14 shared days, 5 kinds of experience and 8 post-guardian days. Pip and Poppy can decide whether their family story should extend toward neighbors or deepen their own traditions.

**Evidence is actual game history**, drawn from unique-dated, three-choice child outings (story, nature, drawing), genuine completed Helping Hands and Pip-led timed household actions, real childhood bedtime memories, correctly linked adult cottage visits, fully validated family rituals and genuine advanced child outings/projects. Duplicate sources on a single day count as **one shared day**. Future records, invalid choices, false IDs, pre-guardian home actions, and unverified community visits don't create credit. Earlier care while Poppy and Pip were becoming friends counts as real history, but doesn't unlock the guardian-only chapters by itself.

The existing child age, growth stage, favorite hobby, independently walking cottage schedule and optional family roles remain unaffected; this is a **different meaningful relationship arc**, not an automatic increase to the child's age.

### A real family conversation, not a passive claim

When a chapter's evidence is complete, the current **Pip Daybook** shows one folded **Poppy & Pip** section. Meet Pip physically in the home when the household is free, then choose an optional two-response reflection. The same conversation can be reached through the existing world tap on Pip whenever the regular child activity is unavailable. Neither merely opening the journal nor an available chapter provides any rewards.

A completed reflection saves **the exact dated, chosen family memory** under the existing save key. Every choice changes:

1. Later Pip-led household activity dialogue (Pip recalls the exact family principle rather than an abstract friendship number).
2. Pip's small original hand/heart gesture when physically beside Poppy (no duplicated sprite).
3. The behavior of Pip's **existing real independent approach** from v2.9.3. After an established bond Pip is more comfortable approaching from a slightly greater distance with less hesitation, but still walks the actual obstacle-checked house grid and still never forces an activity.
4. A corresponding **individual small original handmade pennant** on the cottage wall. Each of the three chapters adds one unique two-choice-colored keepsake beneath the central molding. This is persistent *because the saved true memory exists*, not because a new decorative counter increments.
5. A truthful chronological **Connections Atlas** family-life entry, without creating a fictitious biological or legal ancestry edge.

Choosing a chapter offers **no free coins, relationship score, needs boosts, currency or passive benefits**. The value is the lasting family behavior, conversation, history and original world art. Later prompts preserve the authored choice. Chapters are sequential even if all three were earned earlier, so no milestones are skipped on old progressed saves.

### Long-play and iPhone safety

The only new optional child saved field is `youngResidents.pip.familyBond={chapters:[{id,day,choice}]}`. At most three genuine unique chapters, all validated and required to date from actual player guardianship. Older saves automatically default to `{chapters:[]}` and retain every existing childhood milestone, original completed activity, neighbor tie and cottage decoration.

Once a completed chapter is remembered it remains part of Pip's relationship stage even if the older capped childhood scrapbook rolls out of view. The bond engine recomputes history when requested, but the real-time art and gesture cache refreshes **approximately once per second**, avoiding repeated per-frame scans of the child's saved records. Existing v2.9.1 pathfinding remains the only child home walker. The iPhone Home Screen app retains its original `hearth-harbor-save-v1` key and GitHub Pages deployment.

### Source changes

- **`pip-family-bond-v294.js` / `.css`**: historical evidence, three authored chapter rules, two real-life reflection choices each, guarded persistence and optional in-world pixel art / gestures / compact Daybook.
- **`little-sprouts-v272.js`**: backwards-compatible optional child field, setup/viewport status, world rendering and action delegation; explicitly protect resident visits, rituals and household tasks from a competing reflection.
- **`pip-initiatives-v292.js`**: future genuinely queued child ideas recall the actual prior family decision.
- **`pip-approaches-v293.js`**: parent-child familiarity slightly changes the original real child's confidence in independently walking to Poppy; all existing interruption / collision and day gating rules remain.
- **`game.js`**: draw truly earned family pennants in the existing home environment and make fallback world Pip conversations available when the routine ideas have all been used; no new navigation tab.
- **`family-atlas-v271.js`**: accurately dated and worded family bond entries.
- **`index.html`, `sw.js`**: actual new offline iPhone JS/CSS assets, script ordering and cache bust.
- **`tests/pip-family-bond-v294.test.cjs`**: unit and integration checks for thresholds, date/variety evidence, no fake rewards, two-choice branching, anti-farming, old saves, permanent physical art, real-character gestures, family Atlas and iPhone PWA compatibility.
- Preserve all previous full regression suites; update only old release-version expectations where necessary.

### Release criteria and future work

Full JavaScript syntax and deterministic regression suite on the branch; after merge, require green main Cozy QA and GitHub Pages deployment. This does not substitute for physical iPhone touch, visual occlusion with extensive custom furniture or long-save Safari PWA playtesting.

Next toward the user's **v3.0 Generations review checkpoint**: a richer network of actual younger residents and true family interactions, optional honest aging and life-stage transitions, and intergenerational home and activity consequences. Continue development deliberately; do not declare v3.0 complete based only on a version number.
