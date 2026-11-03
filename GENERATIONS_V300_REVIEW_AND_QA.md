# Hearth & Harbor v3.0 — Generations: Chosen Growing Years

## Release purpose and user review checkpoint

Hearth & Harbor's v3.0 Generations checkpoint is about long-lived, **voluntarily chosen life stages**, a continuity bridge between Pip's real childhood friendship with Wren, chosen family life with Poppy, and a more independent but still protected early-teen chapter. The game has previously introduced optional growing-child and independent-child milestones, genuine peer outings, the physical Friendship Corner and its follow-ups, two-way cottage friendship echoes, and family-bond chapters. v3.0 makes those existing earned systems matter in a third, explicitly consented-to growth stage.

**Development must stop here for the user's creative review.** Do not autonomously start v3.1 or invent adult careers, teen romance, school or multiplayer until the roadmap has been discussed.

## What's genuinely playable

### A third stage, but never automatic

Pip can remain an **Independent Child indefinitely**. The third chapter, *The Next Little Horizon*, appears in the existing Growing Seasons section of Pip's Daybook and requires all of:

1. The previous two child growth milestones must have been explicitly celebrated, with **seven in-game days elapsed since the second milestone**.
2. Five real, separately dated Pip–Wren village outings.
3. Two genuine, source-validated, completed chapters of the physical Friendship Corner.
4. Two genuinely earned childhood friendship stories brought home through separately completed, timed household tasks.
5. Two dated, authenticated Poppy–Pip family-bond chapters.

These are validated through the existing bounded save normalizers, not awarded by entering a tab. The new milestone can't be chosen when Poppy and Pip are apart, home activities are busy, or Poppy is moving. **No new chapter is acquired simply by playing for days.** The player has to stand beside Pip at home, deliberately open an option, then choose one of two actual future directions. Canceling or leaving the page makes no change.

### Two long-term visual and behavioral directions

- **Explore with Curiosity:** Pip's new art features a soft green explorer satchel and map motif; their self-directed cottage creative slot becomes *Planning a little adventure*, physically oriented toward a different work area. An existing, player-chosen dream project becomes a curiosity-centered planned creative task.
- **Grow Through Kindness:** A different pastel accessory and color scheme appear, the cottage creative slot becomes *Making a welcome journal*, and existing dream projects receive an empathetic, community-facing narration.

Both directions visibly increase Pip's original 2.5D character scale to 1.045, extend their real cottage growth chart and add a dated, grounded family timeline event. The existing furniture-aware autonomous pathfinding handles the ordinary activity position change; real child projects and mentorship maintain priority when active. The two earlier growth stages, activities and original art remain intact.

These young-teen stages **do not** make Pip an adult NPC. There are no adult jobs, wages, romance, marriage, fabricated biological ancestry, legal status, school building, forced guardian transition, money or passive rewards. Existing shared activities and friendships continue.

### Critical playability repair

Previous milestones `pg280-*` were handled inside Pip's child module but were **not being forwarded by the main game action router**. v3.0 now routes both `pg280-*` and `pg300-*` through the real playable input handler, restoring earlier growth buttons as well as enabling the new conversation.

## Preservation and defensive saving

The **existing `hearth-harbor-save-v1` key is unchanged**, and the original two-stage growth record schema remains identical when `stage` is 0, 1 or 2. Only the explicitly chosen third stage adds `thirdDay` and `thirdChoice` to the original `youngResidents.pip.growth` record. Imported malformed or future-dated third-stage data cannot take physical effect early. The chosen stage remains conditional on valid chosen guardianship.

Separate, pre-existing peer and home memory records are never copied into adult romantic relationships or made into fictional guardianships. No extra dependency, network call, subscription, new app wrapper or backend is introduced.

## Changed files and quality checks

- `pip-growth-v280.js`: four visual stages including a third *optional* early-teen stage, validated age-up prerequisites, two-step player decision, no-reward save, 2.5D accessory and growth chart changes.
- `pip-routines-v273.js`: real teen-era independent creative routine in the existing lived cottage, respecting independent home routines and existing special visits.
- `pip-projects-v278.js`: chosen teen direction modifies established child aspiration workstations and writing without auto-completing them.
- `little-sprouts-v272.js`: real Pip Daybook, sprite label, modal lifecycle and third-stage action handling.
- `game.js`: repairs the **previously missing growth action routing** in the actual game; retains established sprite-size and real drawing paths.
- `family-atlas-v271.js`: dated, chosen teen-stage memory in the Connections Atlas, without adult family edges.
- `index.html` and `sw.js`: v3.0 versioned assets and an independent iPhone Home Screen cache.
- `tests/pip-chosen-generations-v300.test.cjs`: meaningful prior-play validation, delayed consent, real in-home presence, cancellation, fake-import and future-date safety, 2D art differences, child routines, preserved dreams, Atlas and no adult jobs or rewards.
- All earlier deterministic JS and browser syntax tests must still pass.

**QA limitation:** A green GitHub workflow verifies deterministic source tests and syntax, not actual iPhone Safari artwork, touch targets, app installation, VoiceOver, long sessions, balance or lived-in fun. Those are the first topics for the user's v3.0 creative review.

## Recommended v3.0 playtest

Start with a save where Pip is already an Independent Child and a chosen guardian is established. Complete friendship outings, two Friendship Corner chapters and two Stories Brought Home with genuinely finished home tasks across separate days. Ensure at least seven days have passed since stage two. In Pip's cottage, inspect Growing Seasons and deliberately open *The Next Little Horizon*. First choose Curiosity, verify Pip's real visual, home routine, growth chart, save/restart and Atlas. Test Kindness on an independent copy of the save, verify distinct artwork and routine. Confirm returning to the childhood stage in an older save remains possible by simply not choosing an early-teen transition.

After review, the next roadmap should be chosen with the user; do not automatically continue developing beyond v3.0.
