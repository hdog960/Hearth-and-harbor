# Hearth & Harbor v2.5.0 — Field Notes

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
