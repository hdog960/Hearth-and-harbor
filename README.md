# Hearth & Harbor v2.5.5 — Festival Days

The next **Living Village** slice builds on Cloverbank Grove without replacing it. Maplewood now has a Festival Plaza sign, seasonal decorations, resident gatherings, a community calendar, and four original touch-first games: Spring **Petal Parade** (flower-crown arranging), Summer **Lantern Tide** (lantern timing), Autumn **Harvest Home** (leaf color matching), and Winter **Winter Wishlights** (constellation tracing). The celebrations happen on in-game days **3–5** of every seven-day season and return in subsequent years. You can find the calendar in **Menu**, **Journal**, **Town Hall** or at the plaza sign.

Completing a seasonal activity for the first time awards a modest set of capped rewards, two host friendships, and an entry in the new Festival Scrapbook. Replaying for fun is allowed without additional currency farming. Progress is backwards-compatible with existing local saves; no paid services. This is a playable event foundation, **not** final crowd artwork, festival breadth, or iPhone QA. See [Festival Days QA & roadmap](FESTIVAL_V255_QA_AND_ROADMAP.md) for what was tested and remains unverified.

## Previous milestone — Cloverbank Grove v2.5.4

The first **Living Village** vertical slice. Original iPhone-first 2.5D life sim, deployed to GitHub Pages.

## This release
- 16 collectible nature discoveries (4 common + 3 per season).
- Six discoverable glowing field sites each in-game day.
- Seasonal nature guide, persistent satchel, and village Curiosity Cabinet displays.
- Donations consume one find, award a one-time 18-coin reward and exhibition grants on 4/8/12/16 displays.
- Village noticeboard is now an interactive collection hub.
- All earlier household, cooking, romance, weddings, and saves retained.

## Controls
Tap a glowing nature treasure while in town and Poppy walks to pick it up. Open **Journal → Field Guide**, or tap the village noticeboard for the Cabinet. The season changes every seven game days.

## Limitations
This is the start of v2.5, not the complete village expansion. Museum building, wildlife animations, bug-catching minigames, new areas, and festivals remain on the roadmap. Physical iPhone Safari should be tested.
## v2.5.1 — The Little Museum

Maplewood now has a **walkable museum building** on the eastern village path. Walk inside to explore a 2.5D gallery of sixteen specimen cases, which fill as discoveries are donated. Tap individual exhibits to read about specimens or contribute a find. The curator's desk accepts donations and offers a once-per-in-game-day guided tour (+8 Fun). The Field Guide and Cabinet link to the museum; tap the exit or Town to return outside. The existing cooking, household, and relationship systems remain in place. The museum doesn't add a new save key: the collection is read from the existing `nature.donated` array, with only a validated `museumTourDay` added to the nature state.

This is a museum vertical slice for the larger Living Village expansion, not its completion. Resident curators, themed museum quests, and additional collections remain future work.

## v2.5.2 — The Meadow Net

Eight seasonal insects now have an illustrated, touch-driven net-catching activity. Enter via the Meadow Net sign in the village or Journal / Menu → Meadow Net. Insects flutter, dart, scuttle, leap, perch, or float. Aim and release on the canvas or use a large Swing button. Optional Cozy mode removes the timer and gives a larger net. Your catches and best ratings are saved. Four museum-native species (Honeywing Butterfly, Dewdrop Beetle, Golden Cicada, Lagoon Dragonfly) also enter the existing nature satchel for donation. First discoveries grant a one-time bonus; repeated catches do not grant endless coins. Existing saves migrate to a validated `nature.bugHunt` record. This is an early bug-catching vertical slice; Safari performance and touch gestures still require testing on a physical iPhone.

## v2.5.3 — Lily Pond Stories: seasonal fishing milestone

- Replaces the original bobber timing bar with an illustrated 3-stage fishing activity: aim and cast, hook the fish when the bobber dips, then reel by managing line tension.
- 12 original fish species: 4 year-round, 2 per season; gliding, darting, zigzagging, surging and stubborn fish have different movement and pull behavior.
- Pond Almanac (Journal, Menu, or Lily Pond) tracks seasonal appearances, lifetime catch counts, and best 1–3-star catch quality.
- Cozy fishing option extends the bite window and removes line-break pressure; touch casting, hold/release, and large tap controls provided.
- Catches increase the existing fishing quest, record an entry in the save-compatible fishing log, and grant +1 fish ingredient to the Hearth Kitchen pantry (up to the 99-ingredient limit); first catches award 12 coins.
- The Little Museum curator now links to a Pond Life Gallery. Fish observations may be registered once, without removing cooking ingredients or affecting the original 16 Curiosity Cabinet exhibits.
- Existing flower, insect, museum, household, wedding, and cooking save data is preserved. The existing Meadow Net journal callback was retained to preserve bug catching.

### QA and current limitations

17 simulated gameplay and persistence/validation checks passed: successful three-step catch, cast timing, reel tension, pantry/quest/reward effects, museum catalogue, missed hook, seasonal restrictions and old save defaults. Browser script syntax and page/offline asset wiring checked. These are **scripted simulation checks**, not a physical iPhone Safari playthrough; final device touch and performance QA remains outstanding.

The Pond Life Gallery is currently a curator's illustrated record directory, **not** a second walkable museum room. Larger fishing locations, fish cooking variants and aquatic exhibitions remain future work.

## v2.5.4 — Cloverbank Grove: a new walkable exploration area

The Living Village's first woodland destination is a completely separate, scrolling **Cloverbank Grove** scene reached via a decorated trail gate on Maplewood's east side. Its original pixel-style landscape includes a winding stone path, seasonal trees, a brook, meadow flowers, lanterns, benches, and four seasonal palettes. Walkable collision boundaries and pathfinding prevent walking off-trail or through the largest scenery. Tap the gate to travel, tap landmarks to walk to them, and tap the sign near the bottom of the grove to return to town.

Three activities available once per in-game day:

1. **Berry Hollow:** Gather either berries or herbs (+2, capped at 99) and add them to the existing Hearth Kitchen pantry.
2. **Whispering Brook:** Choose a stone to skip across the brook. A flat pebble produces four skips and a modest one-time 7-coin reward; all choices restore Fun.
3. **Sunbeam Lookout:** Sketch a season-specific scene for your scrapbook or send a postcard to one of the six neighbors (+3 friendship and Social). Preserve one sketch for each season.

Completing all three activities grants a **20-coin daily trail reward**. The Grove Album tracks visits, completed moments, memories, and all four seasonal sketches. A new Journal link opens the album, and Menu offers a route to the woodland. The feature uses the existing save key, cleans imported Grove data, and preserves the full cooking, fishing, insect, museum, social, household and wedding systems.

### v2.5.4 quality notes

- 17 static, drawing-mock, asset-link and pathfinding checks passed (including all four seasonal palettes and the entrance-to-landmark routes).
- 13 simulated interaction checks passed (pantry gains, once-daily limits, postcards, relationship changes, season sketch persistence, completion reward, new-day reset and saves).
- GitHub Pages v2.5.4 homepage and the new scene JavaScript/CSS files were independently confirmed publicly reachable.
- **Remaining:** Real-device Safari tap feel, final visual QA in a full browser, and performance of woodland canvas rendering on lower-end iPhones.

This is the first woodland exploration slice, **not** the completion of the v2.5 Living Village expansion. Future work includes more fully interactive town facilities, seasonal community festivals, larger environmental art passes, and greater NPC participation in these destinations.
