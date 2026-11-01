# Hearth & Harbor v2.5.8 — Maplewood Festival Market

## Development direction
This release makes the two decorative v2.5.7 seasonal **Crafts** and **Treats** stalls interactive, with separate gameplay and actual links to the existing twelve-recipe Hearth Kitchen and the six-resident social system. It continues v2.5 Living Village rather than replacing its broader roadmap.

## How to access
On seasonal festival days **3–5** (every in-game season is 7 days), the village's two stalls appear in Maplewood:
- **Handmade Crafts** near the west side of the central plaza, hosted by Bea.
- **Festival Treats** on the lower eastern lane, hosted by Oliver and Rosie.

Tap their awnings/signs in the world; the player walks to a nearby destination and opens the relevant activity. You can also select **Festival Market** through Menu, Journal, Town Hall, Festival Calendar or through festival-related conversation with Bea, Rosie or Oliver. This board only allows travel when the seasonal event is actually open; no real-world deadlines.

## Handmade Crafts
- Make a seasonal **Blossom Banner**, **Sunshine Pennant**, **Harvest Patchwork** or **Snowlight Quilt**.
- Use a tactile **twelve-patch decorating board**: choose one of four themed colors, then tap at least six patches. The number of distinct colors yields a 1–3-star quality rating; the control buttons are large and usable on iPhone.
- First completion per seasonal cycle costs **8 in-game coins**, awarded only when the banner is finished; no money is taken if the player exits mid-craft.
- Saves the chosen colors, quality and season in the Market Scrapbook; awards +11 Fun, +7 Social and +4 friendship with Bea (+1 more if the Lantern Plaza upgrade is completed).
- Replays are allowed for enjoyment and experimentation without repeated costs or rewards.

## Festival Treats
- Oliver and Rosie offer four different seasonal treats (spring blossom tea, summer lemonade, autumn cider and winter cocoa). **8 in-game coins**, one purchase per in-game day, restore +22 Hunger, +10 Fun and +8 Social; neither tokens nor real-money purchases exist.
- **Bring something to the community supper:** select one of your already prepared dishes from **Hearth Kitchen** and share it. This removes **exactly one** instance of that actual dish from the prepared-meal shelf; it does not synthesize a meal, bypass cooking, or silently replace a recipe. All twelve kitchen recipe IDs are verified.
- Contributions may be of quality 1–3 stars, saved as a unique festival-cycle memory. Once per seasonal cycle: +14 Social, +7 Fun, +3 hearts, +4 plus dish quality friendship with Oliver, +2 friendship with Rosie (+1 if Rosie's Orchard Cart has been completed).
- A second contribution in the same season is blocked. Sharing a plate does not pay out unlimited money or hearts.

## Village artwork and persistence
- Seasonal pennant bunting, lightweight drawn decorations, warm steam above the Treats stall, and a little completed-project emblem above stalls whose activity has been finished.
- Stall tap regions correspond to the illustrated roof/sign area to avoid intercepting taps on nearby residents.
- New optional top-level save record \`festivalMarket: {crafts:{},supper:{},tastes:{}}\` stored under the **same existing** \`hearth-harbor-save-v1\` key. The import validator limits history, validates cycle/season keys, dish IDs and quality, and sanitizes color values.
- \`festival-market-v258.js\` and \`festival-market-v258.css\` are loaded before the runtime and included in service-worker cache \`hearth-harbor-v258-village-market\`.

## QA 2026-11-01
- A simulated DOM/game harness exercised **all four seasons**, eight unique craft/meal memories, the craft color-quality scoring, eight replay attempts, seasonal/treat daily caps and actual meal deletion. Confirmed menu navigation, correct recipe IDs, state sanitation and offline script order.
- Permanent test suite \`tests/festival-market-v258.test.cjs\` adds **seven deterministic tests** for craft outcomes, real kitchen recipes, market opening, dishes, daily prices, world hitboxes and cache/runtime integration.
- Existing v2.5.7 stewardship regression was repaired to validate an evolving cache version instead of requiring a stale fixed release ID. The full GitHub Actions Cozy QA suite subsequently passed.
- **Not verified:** Physical Safari iPhone tap feel, frame-rate/performance or an end-to-end browser screenshot playthrough. The simulated drawing and action tests are valuable but are not a device test.

## Follow-on roadmap
1. More personality-driven stall dialogue, resident visit routines and true cooperative festival preparations, with repeated visits changing the day's conversations.
2. More distinctive cooking festival specialties **inside** the existing Hearth Kitchen, maintaining at least twelve core recipes and adding distinct hands-on mechanics rather than duplicating games.
3. Animated streets, naturally moving crowds, interactive stalls outside festivals, deeper community stewardship and distinct town neighborhoods.
4. Keep improving large-screen and iPhone safe-area responsiveness and use real-device playtesting before declaring visual polish complete.
5. Preserve the major v2.5 Living Village and v3.0 Generations roadmap; do not rush the generations system until town and household depth are stable.

See [ROADMAP_V22_V30.md](ROADMAP_V22_V30.md) and the earlier [v2.5.7 QA](STEWARDSHIP_V257_QA_AND_ROADMAP.md).
