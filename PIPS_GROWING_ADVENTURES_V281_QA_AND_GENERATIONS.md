# Hearth & Harbor v2.8.1 — Pip's Growing Adventures

## Six genuine stage-specific town activities

**Growing Child, stage 1:** Mabel's Pollinator Path, Rosie's Friendly Market Trail and Bea's Three Colors of Maplewood.

**Independent Child, stage 2:** Jun's Little Story Trail, Oliver's Thoughtful Recipe Hunt and Finn's Pondwatch Field Notes.

Every challenge requires *real opted-in guardianship*, the actual earned developmental stage, and **Poppy, Pip and the existing real villager present together in Maplewood**. Poppy can bring Pip via the real v2.7.5 escort walk or meet them at an enabled real village guide afternoon. A remote Daybook cannot launch it. The challenge has a direct entry in the real NPC conversation menu and an eligible entry in Pip's Daybook.

## Physical three-stop gameplay

The game constructs three distinct nearby stations anchored at the actual NPC's live coordinates and checks them against the actual town collision map. Unwalkable, overlapping, missing or distant stations cannot launch. Three painted chunky-pixel world objects appear, with the next uncompleted object glowing. Each object requires an actual world tap and real Poppy movement through the existing pathfinder. A step cannot be completed without Poppy physically arriving, with Pip still nearby. After visiting **all three separate positions**, the player chooses between two meaningful original responses. This final choice is the only moment a memory/reward is saved.

Cancel, leave town, leave Pip behind, lose the villager, miss a step, change developmental eligibility, or cross the day boundary to abandon without saving a false adventure. The active session is never persisted. One complete adventure per real game day, with a modest capped +7 to the related child need and +2 Joy, **zero currency**. No compulsory aging, new parentage, marriage, adult jobs, fictional school or additional app.

## Save migration and art

Existing browser save key **hearth-harbor-save-v1** remains intact. A new optional youngResidents.pip.adventures record stores at most 42 real day, known NPC ID, stage and final choice entries, strictly validated and deduplicated. Previous child growth, dreams, neighbor bonds, real household help, bedtime, caregiver choice, other younger-child activities and all adult relationships remain untouched. Older saves safely load an empty adventure history.

New Canvas world marker props are actively rendered in town rather than a menu illustration; stage 1 uses small observation placards, stage 2 more detailed book/note artwork. Only the next marker is interactable; the visual positions and hitboxes use the same world-space coordinates as the player pathfinder. Pip's Daybook displays discovered moments; the Connections Atlas records only genuinely finished stage-specific adventure dates without creating new relationship edges.

## Implementation and QA

- pip-adventures-v281.js: six uniquely written and drawn NPC experiences, collision-checked marker spots, progress gating, real-world taps and saves
- pip-adventures-v281.css: original illustrated phone activity book, large touch targets and accessible focus
- little-sprouts-v272.js: optional save migration, child Daybook and action handling
- game.js: actual town drawing, physical marker tap priority, player navigation to markers and real NPC direct start
- family-atlas-v271.js: authentic dated finished-child-adventure history
- index.html, sw.js: v2.8.1 assets and offline iPhone precache
- tests/pip-adventures-v281.test.cjs: 42 targeted new tests; full pre-existing Node regression/syntax checks required

Passing CI does not prove physical iPhone Safari touch alignment, render depth under scenery, VoiceOver, old-save reload, extended playthroughs or GitHub Pages propagation. These still need independent device/browser testing.

## Next Generations milestone

This is genuine world participation for growing children, not full v3.0. Develop richer stage-based relationships and meaningful household/family community activities. The eventual v3.0 must preserve the cozy Sims/Animal Crossing feeling, progress longevity, adult/child separation, chosen rather than invented family ties and honest player choices.
