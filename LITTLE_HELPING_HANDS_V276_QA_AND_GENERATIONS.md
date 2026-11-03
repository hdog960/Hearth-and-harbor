# Hearth & Harbor v2.7.6 — Little Helping Hands

## Real child participation in authentic household gameplay

This release makes Pip part of Poppy's actual cottage activities, rather than inventing another remote menu-only minigame. After Poppy explicitly becomes Pip's chosen guardian, the player can stand near Pip inside the real cottage and choose one of four safe ways to help: reading side by side, tidying a little corner, setting the supper table, or creating something together.

**The action is real:** selecting a card adds Poppy's existing Read, Tidy, Meal or Hobby household activity to Poppy's Daybook. The original engine walks Poppy to the correct furniture, holds the normal 3.8-second household action, calculates its normal adult needs/rewards, then emits a verified first-daily-completion event to the child subsystem. The child appears at the relevant actual furniture during this genuine household hold. Starting or queuing never grants a memory.

Each activity needs active guardianship, real proximity in the cottage and a Poppy action not yet completed today. Once per in-game day, only after actual first completion, Pip remembers the day and task and receives a modest bounded need gain. Canceling the session, scene change, full Daybook, duplicating/repeating the activity or losing the day yields no child payout. The optional pending plan is session-only, not a phantom saved task.

## A handmade reward that exists in the world
Complete **three different home-help task kinds on three distinct real game days** to earn Pip's handmade **Home Together Banner**. The banner is drawn by the existing Canvas painter on an actual cottage wall, with illustrated colored cloth pennants. It is a permanent (derived) decorative keepsake and adds a modest +2 home comfort under the existing 100 cap. No money, passive farming or duplicate items.

The journal provides earned progression and recent real events. Children's household care remains optional and non-punitive; it does not simulate neglect, illness, invented parents or compulsory aging.

## Save integrity
- The original storage key \`hearth-harbor-save-v1\` remains unchanged.
- The new optional \`youngResidents.pip.homeHelps\` field is a sanitized bounded list of genuine day/kind entries (max 36). Earlier saves safely start with an empty list.
- The banner and comfort are derived from three distinct valid task kinds and three different days, not a paid unlock or an unsafe imported flag.
- All adults' jobs, marriage/romance, household relationships, income, adult birthdays, original child minigames, saved guardian decision, neighbor walks and bedtime memories remain untouched.

## Code and release QA
- \`pip-home-help-v276.js\`: optional task planning, strict real player completion observer, bounded memory data, physically positioned child participation and original illustrated Canvas banner.
- \`pip-home-help-v276.css\`: warm illustrated journal, large 51px touch targets, keyboard focus and narrow iPhone layouts.
- \`little-sprouts-v272.js\`: optional save field, Daybook panel, real sprite participation, action dispatch.
- \`game.js\`: actual \`runOwnHomeAction\` completion hook, real Poppy Daybook queue, household hold information, world-art drawing and modest home comfort.
- \`index.html\` / \`sw.js\`: v2.7.6 asset order and new offline iPhone cache.
- \`tests/pip-home-help-v276.test.cjs\`: 27 focused new regression tests; full existing suite required.

Release only after syntax and complete Node regression suite. Physical Safari 320/375/390 widths, VoiceOver, small-screen scroll behavior, real finger taps, banner wall layering, old-save reload and long-session QA still need independent verification. Do not claim that the entire v3.0 Generations, schooling, multiple children or inheritance is complete.

## Next development objective
Deepen opt-in child household aspirations and authentic multi-day relationships that connect Pip's helping, village encounters, evening rituals and existing family memories into a coherent personal life history, then expand child growth/life stages carefully. Prioritize engaging, intuitive, original 2.5D visual art and seamless integration over a proliferation of menu options.
