# Hearth & Harbor v2.5.3 — Lily Pond Stories

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
- Existing flower, insect, museum, household, wedding, and cooking save data is preserved. The broken Meadow Net menu callback was corrected (journal → overview).

### QA and current limitations

17 simulated gameplay and persistence/validation checks passed: successful three-step catch, cast timing, reel tension, pantry/quest/reward effects, museum catalogue, missed hook, seasonal restrictions and old save defaults. Browser script syntax and page/offline asset wiring checked. These are **scripted simulation checks**, not a physical iPhone Safari playthrough; final device touch and performance QA remains outstanding.

The Pond Life Gallery is currently a curator's illustrated record directory, **not** a second walkable museum room. Larger fishing locations, fish cooking variants and aquatic exhibitions remain future work.
