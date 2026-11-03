# Hearth & Harbor v2.8.9 — Living Cottage Visits

## Real-world, three-person home life

This release builds on v2.8.8 rather than introducing another abstract household menu. **Six existing Maplewood adult villagers can now be personally invited to Poppy's cottage** for an individual, child-friendly visit with Poppy and Pip. The adult is the original resident; they do not become a duplicate member of the household, an invented guardian, a child's parent, a spouse, or an adult employee.

A genuine visit follows the playable world, rather than a calendar click:

1. After chosen guardianship and at least one real past acquaintance between Pip and an adult, talk face-to-face to that person in the town and invite them. The invitation schedules **the next in-game day**, no earlier. Only one outstanding invitation is held at a time.
2. Between **10 AM and 8 PM** the following day, the existing real adult NPC's ordinary town route is aimed toward **Poppy's cottage porch** (at the actual home destination), unless a more important wedding, date, active social event or family occasion conflicts. The invitation does not relocate them or award a bond just for scheduling.
3. Walk to the adult **after they physically arrive at the porch**, speak with them and select *Greet our cottage visitor*. Then enter the home through the original house door. The visitor's **actual original sprite** appears inside, travels from the cottage entry to a safe, real furniture spot using the existing home pathfinder, and Pip also physically travels from their true current indoor position to join them.
4. Tap the visiting adult in the actual home when the adult and Pip have reached the furniture. Choose between two personal narrative ideas, authored individually for all six residents. Poppy must then **really walk to and complete** the existing timed household Daybook task. Nothing is awarded for meeting, opening the modal, selecting the first choice or merely queueing.
5. A verified **once=true household action from that day** opens the final reflective choice. Only the final choice grants a dated three-person family history memory, +5 on Pip's relevant child-development need and +3 to Poppy's relationship with the **actual adult**. No coins or passive pay, and no secondary daily rewards.

Individual authored moments:
- Mabel: *Flowers for Our Windowsill* (real creative hobby, curiosity).
- Rosie: *A Neighbor at Our Table* (real meal, confidence).
- Oliver: *A Recipe Worth Sharing* (real meal, confidence).
- Jun: *Pages for Three* (real reading, curiosity).
- Bea: *Colors in a Family Home* (real creative hobby, joy).
- Finn: *A Quiet Pond Story* (real reading, curiosity).

The visit is a **true three-character scene** with Poppy, Pip, and the adult in the original 2.5D cottage; the same resident is never rendered as a second NPC in the town simultaneously. Gentle original furniture art and existing adult/child sprite animations connect the work. Gameplay retains its older iPhone first rendering, compact Daybook (one collapsed visit summary rather than a large new tab), and existing world-navigation controls.

## Old-save and gameplay safety

Keep the original `hearth-harbor-save-v1` key. Add only optional sanitized `youngResidents.pip.homeVisits` with `{pending: {id,day,kind}|null, memories:[{id,day,kind,open,close}]}`. There can be at most six distinct earned adult memories, one per adult. Old saves without this field migrate harmlessly to empty state. Forged IDs, invalid days, unrecognized activities, malformed options and repeated completion entries are rejected. No background timer, new account, special currency, web request or subscription mechanic.

The child and guest follow safe world paths. Unwalkable destinations or blocked objects do not generate completion or teleport them. Town visits yield to existing weddings, dates, couples, and village encounters. Missed dates can be invited again rather than permanently blocking the save. Scene changes and late days cancel unfinished runtime staging; player has full control. Returning to a missed visit never claims a reward. The linked Connections Atlas only records truly completed voluntary activities (not ancestry or marriages).

## Changed files

- `pip-home-visits-v289.js`, `.css`: invitations, six authored visits, actual porch scheduling, true world presence, safe indoor two-character companion locomotion, original Poppy chore completion hooks, small adult friendship and child need rewards.
- `little-sprouts-v272.js`: older save migration, visit daybook, child world pose, ongoing companion movement, action routing.
- `game.js`: original NPC route scheduling, talk options, in-world cottage guest hit-testing, reuse of original adult character art, real home timed action callback.
- `family-atlas-v271.js`: dated Poppy–Pip–adult community history with no fabricated family edges.
- `index.html`, `sw.js`: cache-busted scripts, CSS and offline iPhone assets.
- `tests/pip-home-visits-v289.test.cjs`: real invite/greet/entry route and scene, no teleport, six personalities, valid 3.8-second completion, save rollover and anti-farming, phone UI and older save compatibility.
- Existing tests updated only where the current published app version/cache key changed.

## Quality gate / next steps

Run Node syntax checks and the **whole existing deterministic regression suite** on the branch, then merge only after green CI and verify both main-branch Cozy QA and GitHub Pages deployment. These automated checks do not certify physical Safari taps, visual depth occlusion with every custom furniture layout, screen reader behavior, or a 30-minute session with an old long-play save; those need real-device playtesting.

Next toward v3.0 Generations: richer daily sibling and friend context, greater guest autonomy, genuine optional additional younger residents and real family continuity/optional aging. This release is **v2.8.9**, not finished v3.0.
