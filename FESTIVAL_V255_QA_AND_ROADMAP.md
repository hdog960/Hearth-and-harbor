# Hearth & Harbor v2.5.5 — Festival Days

## Playable vertical slice
This release is the **first** community-festival milestone inside the staged Living Village v2.5 expansion. It is not the final festivals, events or villagers system.

- **Spring · Petal Parade:** Arrange five flowers in a wreath, with variety affecting quality.
- **Summer · Lantern Tide:** Release three wish lanterns into a moving timing band; a Gentle Launch alternative removes accuracy pressure.
- **Autumn · Harvest Home:** Sort six colorful leaves into the matching market baskets.
- **Winter · Winter Wishlights:** Trace a six-star constellation in order, or use a large accessible Connect button.
- **Town integration:** A Festival Plaza board is placed on Maplewood's main route. The plaza is decorated with seasonal ribbons and illuminated bunting on festival days. The six residents physically walk toward dedicated gathering spots in the daytime and share seasonal dialogue.
- **Calendar:** New Journal, Menu and Town Hall links describe the current and next festival. Every season is seven game days long; events are available on days 3–5 of each season. The celebrations recur in later in-game seasons; there are no real-world deadlines.
- **Scrapbook and rewards:** One memory (up to three stars) per **festival cycle** is saved. The first completed activity in a cycle awards 30–40 coins, 3 hearts, +3 friendship for each of two hosts, and Fun/Social restoration. Replays remain available, but grant **no further payout** for that cycle.
- **Save compatibility:** A bounded, sanitized optional \`festivals\` record is added to the **existing** \`hearth-harbor-save-v1\` key. No resets of cooking, household, romance, town collection, fishing, bug-catching or grove saves are required.
- **Deployment:** \`index.html\` loads \`festival-v255.css\` and \`festival-v255.js\` before \`game.js\`; all earlier modules retained. \`sw.js\` uses \`hearth-harbor-v255-festival-days\` and precaches both festival assets.

## QA performed (2026-11-01)
- All **10** JavaScript files loaded by the game were parsed successfully in a JavaScript engine; no syntax errors.
- Standalone festival module executed in a simulated document/API harness. Checks included its public exports, save sanitization, festival day gating, all four game completion paths, 3-star outcomes and per-cycle memory persistence.
- Each activity was played **twice** in the harness; the first completion paid and the second gave no additional money. All four memories were retained.
- Verified index script/style wiring, offline worker paths, and existing game integration strings.
- Fixed a likely overlap with NPC tap targets by moving the festival board to the east edge of the central plaza.
- Corrected the CSS font declaration for mobile button rendering.

**Unverified:** A full browser rendering or automated pointer-playthrough of the integrated game; physical Safari testing on iPhone (touch, scrolling, tab navigation, memory/performance); Pages build completion after the final commit. These are **not** claims of shipping-ready device QA.

## Existing quality expectations and next tasks
1. Playtest festival sign, portrait screen scrolling, event game buttons and all four seasonal transitions on an iPhone. Export a save before beta testing.
2. Add animated, bespoke crowds/seasonal stalls and strengthen visual polish; current plaza visual decorations are a first pass.
3. Expand each festival into multiple substantially different activities, dialogue branches, seasonal foods and visitor interactions (without making them chores).
4. Continue public facilities, new ecology, deeper shops and town stewardship alongside festival work.
5. Integrate calendar invitations, family attendance, household social memories, and eventually generations without duplicating resident reward farms.

Source: \`festival-v255.js\`, \`festival-v255.css\`, \`game.js\`, \`index.html\`, \`sw.js\`.
