# Hearth & Harbor v2.5.26 — Our Household Promises

## Goal: deeper daily life instead of another disconnected minigame

Hearth & Harbor already has authentic Daybook activities, working furniture pairs, differentiated residents, autonomy, three-step home/village traditions, real cooking and shop-work. However, residents could not explicitly agree on **who does what** within a home. This milestone adds voluntary responsibilities that influence actual behavior and give an earned, small benefit when the **real activity** finishes.

### What players can do

From the Menu, Journal, Poppy's Daybook or any occupied residence's Daybook, open **Household Promises**. Switch between the cottage and all six residence slots, and assign one responsibility to each actual member of that home. Roommates cannot hold the same role simultaneously; everyone can be assigned a different one. Roles can be changed freely or turned off without a fee or a penalty. They are an option, not a mandatory chore tracker.

Five distinct responsibilities connect to existing in-world actions:

| Role | Actual Daybook action | Effect on a genuine first completion that day |
|---|---|---|
| **Home Caretaker** | Tidy | Actor +3 Fun, housemate +6 Energy |
| **Family Cook** | Meal | Actor +3 Fun, housemate +8 Food |
| **Story Keeper** | Read | Actor +3 Fun, housemate +6 Fun |
| **Warm Host** | Chat | Actor +3 Fun, housemate +7 Social |
| **Creative Maker** | Hobby | Actor +3 Fun, housemate +6 Fun |

A solo home receives the actor's regular +3 Fun plus a smaller, bounded +4 need of the appropriate type (Poppy's own meals affect **Hunger**, not the resident-only Food key). Everything is capped to the existing 100-point need range. This small benefit is **once per resident per in-game day**, even after changing jobs or homes. It adds no passive coins, new currency, cooking items or XP.

### Real autonomy and personalities

The existing **Household Rhythms** planner now considers the resident's chosen responsibility. The priority order remains grounded:

1. Critical needs (energy, food, social, fun) always come first.
2. Genuine unfinished personal aspiration actions come next.
3. If it is daytime and the responsibility action is not done, schedule that responsibility.
4. Existing roommate bond time, personal preferences and remaining household activities retain their established behavior.

This means a role affects where a resident actually goes and what they do, **without erasing their personality** or making them neglect needs. A manual resident Daybook completion, an autonomous completion, Poppy's actual Daybook completion, or a finished Little Passions Studio hobby can fulfill a matching responsibility. Merely queueing a task, reopening the modal, clicking a role or performing a discounted repeat never grants a completion.

### Permanent visible household history

Every legitimate responsibility completion adds one dated entry to a compact, bounded home-history journal. At **three genuine completed responsibilities in a particular home** (across days), it earns a visible original **handwoven Household Promise rug** near the room's floor entrance. This is a permanent decorative keepsake; the rug doesn't produce additional stat bonuses or rewards. Only the home that truly earned it receives the rug. This adds another earned visual detail to the household alongside v2.5.25's wall-framed traditions.

### Save, fairness and architecture

- Existing storage key: **\`hearth-harbor-save-v1\`** (unchanged).
- New optional record: \`householdRoles:{homes:{},daily:{},memories:[]}\`. Each of seven home slots tracks actual assignments and a bounded contribution count. Each actor's daily record applies **across moves and reassignments** to prevent stacking. Last 36 legitimate memories are kept.
- Imported data is sanitized for known homes/actors/roles, day ranges, duplicate role assignments, repeated actor/day memories and bad counters. Existing saved data without \`householdRoles\` loads with empty, optional defaults.
- Only current, genuine occupants of the selected residence can be assigned or rewarded. Empty homes cannot invent residents, and moving a resident does not grant an old household role or a second daily reward.
- No new web requests, external art packages, paid backend or mandatory timers.
- All changes are additive: the existing Daybook/aspiration/Household Rhythms/traditions/functional homes/cooking systems retain their core rewards.

### Files

- \`household-roles-v2526.js\`: roles, strict import sanitization, state and daily-benefit guards, genuine activity completion, responsibility planner lookup, mobile storybook, Canvas2D rug.
- \`household-roles-v2526.css\`: warm illustrated mobile planner with full-size buttons, horizontal household tab scroll, visible selection/focus, narrow iPhone layout and reduced-motion support.
- \`household-rhythms-v2516.js\`: opt-in duty planning between aspirations and social/autonomous preferences.
- \`game.js\`: safe new save record, module setup, four genuine finished-activity hooks, current residence navigation, actual painted rug, Menu/Journal/Daybook integration.
- \`index.html\`, \`sw.js\`: iPhone cache-busting and versioned offline asset precache.
- \`tests/household-roles-v2526.test.cjs\`: **24 new regression tests**, total full suite target **254**.

### Quality gates

Automated tests explicitly cover five differentiated roles, two-roommate exclusivity, Poppy solo home support, actual need effects, daily reassign/move/reload anti-farming, wrong and canceled actions, autonomous planner priorities, game wiring, rendered Canvas2D rug method, 7-home UI and save migrations. GitHub's syntax check and full suite must be green before merging; production deployment must be green before calling live.

**Outstanding manual work:** real physical iPhone Safari rendered screenshots and gestures; VoiceOver behavior; long, naturally simulated 30-minute home play; and checking the exact appearance of role panels/rug alongside all other furniture in the game's 2.5D world. Automated tests are not a substitute for a full visual or player experience test.

### Remaining roadmap before v3.0

1. **Household polish:** ability to direct more than one household member without wiping their schedule, more nuanced apartment and family management, richer scene variation and a true touch/visual quality pass.
2. **Deeper village careers:** tie the current work shifts and shop commissions into resident identity and household schedules without creating an endless money farm.
3. **Generations (major, phased v3.0):** opt-in aging, coherent life-stage routines, parenting/mentorship, family tree and lineage, persistent property/heirlooms, inherited household history and a strong migration/QA strategy.

**Stop at v3.0 for the owner's creative review**. Do not extrapolate a new post-v3.0 roadmap without owner input.

[Previous milestone: Home & Town Traditions v2.5.25](HOME_TOWN_TRADITIONS_V2525_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
