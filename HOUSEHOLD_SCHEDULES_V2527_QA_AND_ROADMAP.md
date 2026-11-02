# Hearth & Harbor v2.5.27 — Everybody Has a Little Day

## A meaningful household-control release

Until now, Hearth & Harbor allowed a guided resident to queue activities, but other household members had only automatic routines. Guiding one resident could not assign independent tasks to their roommate. The next step toward the deep, controllable household vision is a **separate, day-scoped schedule for each real resident**. This milestone adds it without rewriting all character controls, removing existing AI, or falsifying completion rewards.

### What's now playable

- Enter a real occupied residence and open its **Household Daybook**. Select **🗓️ Plan everyone's day** to open a new illustrated, compact planner.
- Each resident in that household has **six distinct real choices**: Rest, Make a Meal, Read, Tidy, Spend Time Together and Enjoy a Hobby. Queue up to **three** tasks per resident. Order matters.
- The plan is independent of the resident you're currently guiding, and of the roommate's plans. Each person walks to a real action destination, performs the existing timed animation/hold, and receives only the game's **existing** action effects once the activity actually finishes.
- Plans override casual autonomous priorities only while a planned task exists. The autonomous resident returns to their usual personality, actual needs, household responsibility and aspirations after the planned work finishes. Schedules even function with a resident's casual **Auto OFF**, because these are explicit instructions.
- The planner has separate undo-last and clear controls per resident, clear progress timelines and dated completion memories. It also explains that if you're directly guiding a resident, their separate planned activities wait until control is released.
- Active plans pause when you're in a menu, out of the residence or in paused game speed; they resume in that same room later **on the same in-game day**. An uncompleted plan from a prior game day expires without earning coins or any needs.
- Clearing a scheduled action while the NPC is walking or performing it prevents a ghost completion. Changes of residence also invalidate a former home's schedule.

### Saving and economy

The save key is unchanged: **\`hearth-harbor-save-v1\`**. A small optional \`householdSchedules\` section records six known resident IDs, their real home, the in-game day and at most three valid activities each, plus the last 24 genuine scheduled completions. Imported/older saves sanitize unknown actors, homes, actions, date ranges and malformed history. There is no new currency or payment, no passive needs gains, no external services.

This system uses the exact same real \`finishAutonomousAction\` action path already used by independent residents: existing Daybook daily diminishment, comfort, hobbies, Household Promises, family-care scenes and traditions continue to work. The planner's \`completed\` transaction happens immediately before the real finishing action, inside the same existing save; it cannot mint an extra reward or skip an animation. All action outcomes are bounded by the current needs and daily guards.

### Deliberate boundaries and next steps

The currently **directly guided** resident still uses the familiar existing manual Daybook queue. You can make plans for them too, but those plans wait while they're directly controlled. Switching away from a manual action can cancel that currently guided action, just as before. This release does **not yet** promise persistent, simultaneous direct-control queues across every resident or offscreen automated resident simulation. It provides truly independent planned NPC routines within the actual visited household, which is the foundation for that later deeper control.

The game still needs a real rendered iPhone Safari UI audit, including 320px/375px/390px portrait, landscape layout, scroll and touch targets, VoiceOver labels and frames-per-second under two concurrent resident schedules. Automated code and virtual timing tests are not substitutes for physical visual QA.

### Technical changes and regression coverage

- \`household-schedules-v2527.js\`: independent, sanitized three-step per-resident plans, safe transaction guards, UI, dated completions and actual occupant validation.
- \`household-schedules-v2527.css\`: compact storybook-style timeline and editor with iPhone breakpoints, accessible button focus and reduced-motion handling.
- \`game.js\`: safe save data import, module setup, separate planning Daybook button and modal actions, actual integration with in-room movement, correct in-world avatar rendering even if casual autonomy is OFF, guards against canceled and stale tasks.
- \`index.html\` and \`sw.js\`: new assets loaded before game script and included in fresh offline cache.
- \`tests/household-schedules-v2527.test.cjs\`: **24 new tests**, total expected **278**. Includes model validation and a virtual-room execution test that extracts the actual \`updateRoomAutonomy\` function from \`game.js\`, proving two residents finish different scheduled real actions, sequential queue processing, pause protection, and cancel/day-change safety.
- \`tests/household-roles-v2526.test.cjs\`: historical cache assert updated to follow the rotating release cache instead of requiring a prior version.

**Shipping gate:** GitHub Actions JS syntax and entire 278-test Node suite must be green on PR, then the production \`main\` QA and Pages deploy must succeed before the milestone is considered live.

### Remaining work before v3.0 Generations

Next: preserve directly guided action queues across switches, offer clearer control of multiple household members, tune roommate cooperation and add real rendered phone QA. Then develop **v3.0 Generations** in carefully reviewed phases: optional aging, family/child care and learning, careers/household continuity, heirlooms/family trees, village changes over generations, save migrations and accessible controls. Do **not** advance beyond v3.0 without the owner's review.

[Previous release: Household Promises v2.5.26](HOUSEHOLD_PROMISES_V2526_QA_AND_ROADMAP.md) · [Approved roadmap](ROADMAP_V22_V30.md).
