# Hearth & Harbor v2.5.7 — The Village We Grow

## Development focus
This release continues the **v2.5 Living Village** roadmap through town stewardship and environmental art. The village is not a new set of menus: improving a place creates tangible, permanent details on Maplewood's walkable map and gives it a distinct activity. The work remains original, single-player, free of paid services, and iPhone-first.

## Playable community projects
Find the **Town Projects** board near Maplewood Town Hall, or open **Menu / Journal / Town Hall → Town Improvement Projects**. Mabel, Bea, Finn and Rosie can also point you toward the town board in their conversation menus.

Each project has **two deliberately affordable stages**; they are optional coin contributions, not real-money purchases.

| Project | Stages / total cost | Visual effect | Completed daily interaction |
|---|---|---|---|
| Blossom Promenade — Mabel | 30 + 45 / 75 coins | Stone-edged planting beds, colorful flowering borders, finished floral arch | Garden walk restores 8 Fun, 3 Social |
| Lantern Plaza — Bea | 40 + 55 / 95 coins | Permanent lantern posts and gradually expanding animated canopy | Rest beneath lanterns restores 8 Fun, 8 Social |
| Lily Pond Deck — Finn | 50 + 70 / 120 coins | Waterside timber decking, railings and floral planters | Rest by water restores 7 Energy, 6 Fun |
| Rosie's Orchard Cart | 35 + 50 / 85 coins | Wooden wheeled pushcart, fabric canopy, seasonal fruit displays | Visit once per day for 2 seasonal kitchen ingredients (up to pantry cap 99) and 5 Hunger |

The **four projects cost 375 total coins** and do not generate repeatable money. On a project's final construction stage, the player earns a one-time 10 Fun celebration. This is deliberately not a money-back exploit.

Daily interactions are available by tapping the finished place **in the world** or using **Visit the finished place** on the project board. The latter routes the player through the existing walking system instead of instantly teleporting, then executes the activity. Each interaction is keyed by in-game day; repeating it does not duplicate rewards. The season-based cart parcels are berries in spring, apples in summer, carrots in autumn and herbs in winter.

## Seasonal scene improvements
During in-game festival days 3–5, Maplewood now has two hand-painted seasonal stalls with distinct **Crafts** and **Treats** signage, cloth awnings, colorful goods and subtle animated confetti. These are environmental artwork for now, **not independently implemented shops**. Existing festival minigames and eight resident collaborations remain accessible as before. No paid images or external textures were introduced.

## Data and architecture
- New independent \`stewardship-v257.js\` module with \`stewardship-v257.css\`, loaded **before** \`game.js\`.
- Uses the same \`hearth-harbor-save-v1\` save key via optional \`stewardship: {phases:{flowers,lanterns,deck,cart}, visits:{...}}\`.
- \`HearthStewardship.clean\` clamps construction stages to 0–2 and day stamps to 0–9999, dropping unexpected keys and malformed entries. Older saves receive defaults; all other existing fields remain intact.
- New \`projectboard\` world object has a reachable pathfinding approach, a large world tap region, and links in Menu/Journal/Town Hall/conversation. Completed upgrades also have direct scene hit zones.
- Service worker cache advanced to \`hearth-harbor-v257-village-we-grow\` and precaches both module assets.
- The existing automatic GitHub Actions QA workflow runs all \`*.js\` syntax checks and the new deterministic tests in \`tests/stewardship-v257.test.cjs\`.

## Verified in simulation
- Four projects, eight total construction contributions, exact 375-coin cost, and no duplicate charge for completed projects.
- Rejects insufficient funds; no negative balance.
- Each of the four completed interactions pays once per day; carts respect the kitchen pantry's 99-item limit and seasonal ingredient rotation.
- Four visually separated hit regions were checked; an initial collision between the orchard cart and flower promenade was identified and corrected by moving the cart closer to Rosie's market.
- Render routines for the town projects, festival stalls and board exercised with a simulated Canvas2D surface.
- Prior save migration, index script order, core runtime wiring and offline assets inspected.
- **Browser JS syntax passed**. CI regression suites provide repeatable coverage for future changes.

## Not yet verified
- Physical iPhone Safari taps, performance, screen safe areas and memory footprint.
- An end-to-end automated browser playthrough with rendered screenshots and actual NPC pathfinding at all new board/upgrade destinations.
- New festival stalls are aesthetic until future shopping interactions are built; this release does not pretend otherwise.
- Visual work is a new foundation, not the final production-quality pixel character or environmental art standard.

## Next milestones
1. Full-device inspection and pathing/audio feedback for each upgraded destination.
2. More active community stewardship: resident work routines, small errands and shops that respond to town improvements.
3. Connect orchard cart and festivals to more distinct cooking recipes and NPC taste preferences.
4. Further seasonal animated environmental art, genuinely active stalls, habitat discoveries and neighborhood expansion.
5. Move toward v3.0 Generations only after major v2.3 households and v2.5 Living Village work achieves genuine depth.

Reference the master [roadmap](ROADMAP_V22_V30.md) and preserve prior game systems and existing saves.
