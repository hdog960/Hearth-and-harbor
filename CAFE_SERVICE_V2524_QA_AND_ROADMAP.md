# Hearth & Harbor v2.5.24 — Honeybun Café Service & Fair Harvests

## A substantial quality and economy follow-up

The v2.5.23 Village Trades expansion connected real groceries, cooked dishes and art to neighbors, but the original Honeybun Café *Work a Shift* button was still unlimited instant money. The original garden could also be planted, watered, harvested and replanted indefinitely on one in-game day. Those shortcuts undermined household decorating, useful jobs and the village's sense of progression.

This release replaces the café instant payment with a **real playable service activity** and protects old garden harvest earnings with a clear **one paid harvest per plot per in-game day** policy, while retaining the original cozy/no-real-time-wait design.

## Playable Honeybun Café service

- Three real Maplewood residents visit in rotating deterministic day/season combinations, with different pastries and drinks; this is a distinct café-serving mechanic, not a reskin of the three Village Trades commissions.
- Each guest gives a **two-part order**. Choose the actual pastry from four options, then the requested drink from four. An illustrated serving tray visibly holds the chosen pastry during the drink stage. There are **six successful touch steps** across the three neighbors, with gentle corrections for wrong choices, progress accessibility and an unhurried interface.
- Successfully serving all three pays the **same original 45 in-game coins**, retains the original **−13 Energy / +9 Fun** tradeoff, and advances the original café-work journal quest once. It does **not** consume Hearth Kitchen inventory: the café has its own service supplies.
- After the first paid shift of an in-game day, players may **practice the complete activity for fun** but receive no additional coins, need bonuses or work-quest credit that day. This avoids exploiting the economy without locking away the activity.
- The Café remembers the total number of paid shifts, best skill rating and the last 24 daily shift memories. The ratings are descriptive and do not encourage farming a higher payment for repetitive taps.
- Cancelling mid-shift is always free; no hidden food cost, no additional currency and no timed penalties.

## Fair community-garden harvests

- Existing garden plot progression (empty → planted → watered/ready → harvest), standard **24 coin** flower harvest and **38 coin** premium seed harvest remain the same.
- Each of the existing four plots pays **once per in-game day**. All four can still be harvested on the same day; none is locked behind a real-time timer or microtransaction.
- After a plot has already paid that day, the UI displays **Resting until tomorrow** instead of a tempting repeat Harvest button. Attempts to bypass the disabled control are stopped by the exact same authoritative check before the flower is cleared or any currency granted.
- The garden rest list resets on the next in-game day. Plots and premium seed boost flags remain intact until valid harvest, and existing local saves still load without missing fields.
- No other earning activities, shop prices or recipe costs are changed.

## Technical design and data migration

- New \`cafe-work-v2524.js\` exports \`HearthCafeWork.clean\`, \`orders\`, and \`setup\` with a transient on-screen café serving session and a very small persistent record.
- Safe optional save field: \`cafeWork:{shiftDay:0,shifts:0,best:0,memories:[],harvestDay:0,plots:[]}\`.
- Strict sanitization rejects invalid/noninteger days, noninteger counters, ratings out of bounds and garden plot IDs outside 0–3; histories and plot lists are bounded and de-duplicated.
- The established \`hearth-harbor-save-v1\` storage key remains unchanged. No new currencies, inventory or subscriptions.
- \`game.js\` replaces legacy instant \`work\` action with the new real shift, routes the modal buttons, and gates garden harvest transactions through \`cafeWork.recordHarvest(i)\` before awarding coins and resetting state.
- \`cafe-work-v2524.css\` gives iPhone-first illustrated tray, readable order tracker, large tap controls, focus-visible support and reduced-motion behavior.
- \`index.html\` includes version-bumped CSS/JS in the right order; \`sw.js\` offline-caches them under the new \`hearth-harbor-v2524-cafe-service\` cache.

## QA requirements

- The new \`tests/cafe-work-v2524.test.cjs\` adds **17 regression scenarios** for old saves, import sanitation, deterministic seasonal orders, actual 6-step completion, wrong choices, grades, quest credit, exactly-once payment and need effects, repeat practice, interruption, reload, next-day service, four-per-day garden limits, tamper-resistant double-harvest guards, integration and offline/phone layout.
- Includes all 189 prior tests: new suite target **206**.
- CI must check all browser JS syntax and tests; release must show green GitHub Pages deployment.
- **Still outstanding:** real iPhone Safari 320–390px screenshots and physical tapping, VoiceOver focus during re-render, long-session UI stability, performance and exact economy feel from a player.

## Remaining path to v3.0 Generations

1. Use real iPhone Safari and rendered QA findings to improve visual coherence, touch interactions and world navigation.
2. Expand purposeful household and resident progression: differentiated domestic responsibilities, resident jobs and evolving shops, practical decor incentives and opt-in household control.
3. Build phased v3.0 family lineage, optional aging, children/parents/elders, care routines, heirloom inheritance, memories, household moves and village change over generations.
4. Validate continuity and legacy save migrations; **stop at v3.0** for the owner's evaluation before suggesting the next game roadmap.

[Previous: Village Trades v2.5.23](VILLAGE_TRADES_V2523_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
