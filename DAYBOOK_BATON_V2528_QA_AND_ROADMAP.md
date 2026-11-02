# Hearth & Harbor v2.5.28 — Daybook Baton

## Why this release matters

v2.5.27 added independent real-activity plans for autonomous NPCs. But directly controlling Mabel, Rosie and the other residents still used **one global manual queue**: switching from Mabel to Rosie discarded Mabel's unfinished action and all waiting tasks. It made household-level control frustrating even though autonomous plans were deeper. v2.5.28 solves this specific long-standing usability problem without rewriting manual movement or inventing passive rewards.

## Actual in-game behavior

- **Switch guided residents freely** inside an occupied home. The resident you leave behind keeps their **current unfinished action at the front** of their Daybook, followed by up to three queued tasks. The next resident loads their own distinct saved manual routine, if one exists.
- **Resume by guiding that resident again** in the same residence on the same in-game day. Their avatar walks to the actual furniture spot and begins the interrupted activity anew. A timer interrupted at 70% restarts at 0% and cannot generate phantom stat rewards or daily achievements.
- **Stop guiding and return as Poppy** without losing the resident's pending plan. The same-day plan also survives leaving/re-entering the residence and a normal browser save/reload. An old in-game day's tasks expire cleanly.
- **Intentional cancellations stay intentional.** Clearing the Daybook routine or tapping the world to interrupt the current manual action discards that selected resident's plan instead of quietly resurrecting canceled work next time they are selected. Clearing one resident never touches another's queue.
- **Daybook now shows saved unfinished tasks for the household**, with separate per-resident badges and a compact visual timeline. The active task is included in the guided resident's visible routine, not hidden as if it were already completed.
- The v2.5.27 independent autonomous-NPC schedules and the v2.5.26 optional household responsibilities remain intact; this is an additional *manual* queue, not a parallel source of needs, XP or currency.

## Persistence and safety

The original local storage key remains **\`hearth-harbor-save-v1\`**. The optional record \`manualDaybooks:{plans:{}}\` stores at most six known resident IDs. Each plan includes its known home, current game day and up to four bounded, named tasks (one current + three waiting). Imported saves reject malformed records, unknown residents/activities, unsafe homes and unreasonable days. Plans cannot resume after a resident moves homes or after the in-game day changes.

The actual \`runHouseholdAction\` still owns all needs, aspiration, household-rhythm, hobby and friendship changes and the **single save** for an activity's completion. The manual record only advances from that real completion path; it never grants rewards on queue, save, switch or reload. Switching cancels the old timer and movement callback, so an action left behind cannot finish after a character change. Poppy's original solo-home manual queue remains untouched.

## Architecture / changed files

- \`manual-daybooks-v2528.js\` — clean/import, current per-resident record, same-day restore, completion guard, cancel and in-house storybook summary.
- \`manual-daybooks-v2528.css\` — small illustrated scrapbook strip, readable on compact phones, reduced-motion support.
- \`game.js\` — safe import, real manual queue snapshot on switch and room exit, restore/launch when guided again, stored pending tasks when queued, true post-action removal, explicit cancel handling, Daybook/roster visual cues.
- \`index.html\`, \`sw.js\` — new assets, proper load order and fresh offline cache with v2.5.28 version labels.
- \`tests/manual-daybooks-v2528.test.cjs\` — **24 new tests**, including sandbox evaluation of the *actual* selectHouseholdResident, stopGuidingResident, queueHouseholdAction, nextHouseholdAction, stopRoutine and runHouseholdAction methods from the real game.
- \`tests/household-schedules-v2527.test.cjs\` — prior cache test updated to validate a current versioned worker cache, rather than pinning the previous release.

**Expected total regression suite: 302** (278 prior + 24 new). The full PR and main workflow must pass JS syntax and all tests before the game is considered published; Pages deploy must also be confirmed.

## Known boundaries / QA

- The manual Daybook queues are explicitly **resident-specific and same-day**, not a full offscreen village scheduling simulator. They do not progress for residents in homes you are not currently visiting.
- Switching resets *partial* movement and hold duration instead of trying to serialize unsafe animation states.
- The UI remains connected to the existing in-room 2.5D gameplay; no replacement nonfunctional mock screens were introduced.
- **Physical iPhone Safari visual/touch test, VoiceOver focus, long-session home switching, app background/foreground resume and 320/375/390px screenshots remain outstanding.** Automated checks are source and simulated-logic QA, not a real visual audit.

## Future approved roadmap

Continue deeper cohabitation and autonomy and more visually differentiated homes. Then begin v3.0 Generations in deliberate phases: safe opt-in aging, children and parenting/mentorship, a meaningful family timeline, inheritance, resident life-stage routines and village continuity. **Pause at the completed v3.0 milestone for the owner's creative review**, without developing or deciding post-v3.0 features.

[Previous: Independent Household Schedules v2.5.27](HOUSEHOLD_SCHEDULES_V2527_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
