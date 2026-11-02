# Hearth & Harbor v2.7.0 — Family Portraits
## Generations Prelude 1: authentic family memories

This is the first playable step beyond the v2.6 checkpoint, authorized by the player's instruction to resume development. The approved v3.0 end goal remains full multigenerational household life. Children, guardians, school, succession and a complete family tree are not yet implemented.

## Actual feature

The Family Portraits · Generations book is available from the village Menu, Journal, Poppy's Daybook and the resident household Daybook. Each of Maplewood's six neighbor homes has an album. A portrait can start only when exactly two real adult residents currently share the home, have an existing recorded marriage or active chosen-family promise, have not yet done the needed activity that day, and have room for a frame. Roommates and engagements alone do not count.

Choose Our Storybook Afternoon (Read), A Heart-to-Heart (Chat), or Made with Love (Hobby). Both linked residents must genuinely finish the selected household activity through existing manual or autonomous Daybooks; starting or queueing alone never creates a portrait. Real first-daily-action events are authoritative.

After both complete, a distinct illustrated Canvas dual-character portrait appears on the wall of their actual residence. The persistent record stores both resident IDs, original home, theme, actual creation day, real bond kind, and original bond day. Two frames per home maximum; each offers +2 home comfort (total +4 max), under the existing 100 cap. No extra currencies, fictitious bloodlines, passive payout or copying.

Unfinished work may be canceled and lapses at the next in-game day. A home move or changed family bond interrupts uncompleted work; earlier genuine portraits remain in the original home with the same provenance.

## Technical details
- family-portraits-v270.js: optional save sanitizer, authentic household and relationship checks, two-actor activity observers, independent Daybook queueing, original Canvas portrait art, and a real interactive journal.
- family-portraits-v270.css: accessible illustrated book, large taps, keyboard focus, small phones, reduced motion.
- game.js: new optional familyPortraits save field, manual/autonomous/Hobby Studio completion hooks, comfort, room painting, Menu/Journal/Daybook.
- index.html: v2.7.0 load order and cache-busting versions.
- sw.js: hearth-harbor-v270-family-portraits with both new offline assets.
- tests/family-portraits-v270.test.cjs: real relationship proof, two-step action validation, expired projects, moves, saves, rendering and offline iPhone regression tests.

Original local key hearth-harbor-save-v1 is unchanged. New data does not replace or invent established marriage, family or chronology.

## Release / QA gates
Require JavaScript syntax, the complete Node regression suite and both main-branch Cozy QA and GitHub Pages deployments before declaring release live. Physical iPhone Safari touch, VoiceOver, screenshots at 320/375/390 widths, landscape, visual layering and 30-minute gameplay still require human/device verification.

## After this slice toward full Generations
1. Real family graph that distinguishes spouse, chosen family, co-residence, and (later) parent/guardian/child roles, with no inferred bloodlines.
2. First truly playable younger resident and opt-in guardian relationship with age-appropriate care, schedules and art.
3. Child-to-adult stage progression tied into optional aging, mentoring, aspirations and real game time, without mandatory aging.
4. Inheritance, property succession, extended household limits, generational careers, growing village, and authentic history across life stages.
5. Accessibility, save migration, balance and physical device QA at each small milestone.

This is a foundation for v3.0, not v3.0 itself.
