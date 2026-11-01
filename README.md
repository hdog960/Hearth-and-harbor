# Hearth & Harbor v2.5.17 — Helping Hands

**Poppy can now work side-by-side with the residents of Maplewood.** Visit an occupied neighbor home and open **Daybook → Helping Hands**, or find it in Menu while visiting. Pick a real resident and choose one of three little cooperative activities: **Window Garden** 🪴, **Cozy Sorting** 🧺, or **Memory Craft** 🎨. Poppy walks to the activity station, then you complete three easy, tappable hands-on steps. Each activity requires different objects and answers; mistakes are gentle and never cost money or ingredients.

After completing the steps, the actual resident's sprite joins Poppy at the work area for a brief animated scene. Residents pause their regular autonomy during the event and resume afterward. Both characters gain a modest Fun/Social lift, existing friendship improves, and the household remembers the project in a dated **Helping Hands journal**. One completion per resident per game day prevents farming. Complete **three projects in one home** to unlock a permanent hand-painted keepsake on that home's wall. You can leave an unfinished project without losing anything.

All original cooking recipes, Supper Together meals, household aspirations, furniture, festivals, resident relationships, nature collections and prior saves are preserved in the existing local save. The new game modules are cached for iPhone offline use. **110 automated regression tests pass**, including fresh saves, wrong choices, daily caps, canceled activities, resident sprite scenes, and permanent wall artwork. Physical iPhone Safari and screenshot-based visual testing still remain outstanding.

See [v2.5.17 Helping Hands development and QA](HELPING_HANDS_V2517_QA_AND_ROADMAP.md).

## Previous milestone — Thoughtful Households v2.5.16

**Residents now make better choices about their everyday lives.** The six Maplewood neighbors consider urgent needs, their next real Roots & Keepsakes aspiration step, activities already completed that day, household companionship and their own personalities before choosing what to do at home. They still walk to the existing functional furniture, complete timed tasks, and respond to their surroundings; this is real household simulation logic, not a checklist of invented rewards.

**Living together now creates little memories.** When real housemates complete caring activities such as chatting, cooking a simple meal or tidying, they can strengthen their existing relationship bonds and remember the moment. These modest Social/Fun and relationship bonuses happen at most once per housemate pair per in-game day, with save/reload protection. Residents show responsive in-world reaction icons, and positive household connections can appear as a Connected mood without overriding urgent needs or interpersonal conflict.

Open a resident household's **Daybook → Household Rhythms** to see why each resident is likely to do something next and read the recent daily memories. The existing cooking, At Our Table suppers, furniture, aspirations, villager stories, festivals and local save all remain intact. There is no extra currency, premium feature or offscreen AI simulation.

**QA:** Eleven new permanent regression cases join the previous 87, for **98 automated tests**. As with earlier releases, a rendered full-browser and real iPhone Safari playtest is still needed before we declare the game's overall experience polished. See [v2.5.16 QA and Generations roadmap](HOUSEHOLD_RHYTHMS_V2516_QA_AND_ROADMAP.md).

## Previous milestone — Supper Together v2.5.15

**Supper is now a real little shared experience rather than just a button that adjusts needs.** In the existing **At Our Table** feature, you choose a dish you truly cooked in Hearth Kitchen, select a conversation theme, and walk to the dining area. Then the new **Set the supper table** activity lets you choose a linen color, optionally light a candle, and **tap a place for each actual dinner participant**. The Serve button is enabled only after every place is ready. You may leave without consuming the plate; no real-time timers, failure penalties, or additional currencies were added.

**Real resident character art now joins the supper in the room.** The actual neighbors living in the home move smoothly from their normal positions to separate dinner places, display warm expressions and topic-specific reactions, and enjoy an animated household gathering. Everyday autonomy pauses during this brief scene and resumes from their dinner positions afterward. New hand-painted tabletop napkins, utensils, linens, candlelight and steam give the existing world more personality. The original twelve recipes, favorite foods, family scrapbook, and framed keepsakes after three suppers remain fully functional. Poppy can also enjoy a quiet one-person cottage supper.

The original local save is preserved with **no new persistent data schema**, and existing relationships, festivals, decorating, aspirations, village projects and cooked-plate inventory remain intact. The regression suite now covers **87 automated tests** (11 new), although an actual iPhone Safari playtest and rendered screenshots remain outstanding. See [v2.5.15 Supper Together QA and roadmap](SUPPER_TOGETHER_V2515_QA_AND_ROADMAP.md).

## Previous milestone — At Our Table v2.5.14

**A meaningful new household-and-cooking connection on the road to v3.0 Generations.** The twelve recipes you prepare in **Hearth Kitchen** now have a second purpose beyond eating them or using the old quick Share action: host a real **family supper** in Poppy's cottage or an occupied neighbor home. Choose a prepared plate, select one of **three conversation themes**, and walk to the dining area. Only when you arrive does the supper consume **exactly one** real cooked dish from your plate shelf.

At a neighbor's home, the dinner includes the actual residents who live there. Their needs recover, favorite foods earn a little extra friendship, and conversation can strengthen their existing Town Bonds and reduce Tensions. **One featured supper per in-game day per home** creates a persistent, quality-rated memory; three completed suppers unlock a little framed **family-table keepsake** displayed in the real room. At home, Poppy can also enjoy a quiet supper and progress an existing meal-related aspiration. All supper benefits are free of real-money purchases and don't invent coins, extra ingredients, or new residents.

Find **At Our Table** in Menu, Journal, household Daybooks, or directly beside the prepared-meal shelf in Hearth Kitchen. Existing saves, full cooking minigames, relationships, aspirations, room decorating, festivals, fishing, museum, gardening and village progress remain intact under the same local save key. The automated suite covers **76 regression scenarios**. Physical iPhone Safari and screenshot-based end-to-end testing remain outstanding.

See [v2.5.14 QA and Generations roadmap](FAMILY_TABLE_V2514_QA_AND_ROADMAP.md).

## Previous milestone — Little Atelier v2.5.13

**Decorating is more flexible and forgiving.** Poppy's cottage and all six resident homes now have their own **furniture storage**. Store purchased furnishings instead of selling them, then put them back in the room later without paying again. Stored pieces preserve ownership and rotation, and the usual furniture placement rules still apply. Your stored items persist in the existing local save.

**Undo / Redo is now built into decorating** for the most recent ten furniture changes in each room. Moves, rotations, purchases, sales, storage, and retrieval can all be undone, including restoring the correct coin amount on a mistaken purchase or sale. Undo is session-only and refuses to reverse a change if other gameplay has changed the coin balance or room layout. Wallpaper, quests, relationships and other non-decorating systems are intentionally unaffected.

Open Poppy's **Decorate** menu or a resident's **Daybook → Decorate this home** to find Little Atelier. Both have large touch-friendly Store, Place, Undo and Redo controls. The previously introduced **Rooms With Purpose** functional furniture combinations, aspirations, saved memories, cooking, nature, festivals and household activities remain intact. No ads, premium currency or online services have been added.

Added **ten regression tests**; the full automated suite now covers **66 scenarios** including earlier development. Physical iPhone Safari playtesting and screenshot-based visual QA are still outstanding. [v2.5.13 development and QA notes](ATELIER_V2513_QA_AND_ROADMAP.md).

## Previous milestone — Rooms With Purpose v2.5.12

**Household decorating now changes how people live in their homes.** Arrange matching furnishings close together to create four functional areas: a **Storybook Nook** (bookshelf + lamp), **Restful Retreat** (bed + rug), **Gathering Corner** (sofa + flowers) and **Creative Corner** (chair + fern). The existing drawn-in dollhouse bed, sofa and bookshelves count as real furniture, so you don't have to buy duplicates. These spaces add modest extra need restoration **only after Poppy or a resident completes the matching real Daybook activity**. Choose one home focus for a small additional benefit; changing it costs nothing.

Each home also earns a permanent illustrated **House Charm** after three genuine daily furniture uses. Floor accents appear at the locations of functional corners. Purchased furniture is now inspectable by tapping it in the world, with a way to launch the appropriate household activity instead of granting unlimited free needs. Built-in beds, seating and shelves likewise use the real Daybook routine instead of giving repeated instant boosts. All of these mechanics work with the existing guided and autonomous household systems. This is a genuine quality and gameplay upgrade, not a separate menu-only currency.

Find the new **Rooms With Purpose** guide in **Menu, Journal, or a household Daybook**, including Poppy's cottage and six residences. Your existing \`hearth-harbor-save-v1\` data, aspirations, cooking, relationships, town upgrades, festivals, fishing, museum and household history are retained. The updated automated regression suite checks the 11 new behaviors along with 45 earlier tests. Physical iPhone Safari and screenshot-driven UX testing are still outstanding. See [v2.5.12 QA and roadmap](FUNCTIONAL_HOMES_V2512_QA_AND_ROADMAP.md).

## Previous milestone — Roots & Keepsakes v2.5.11

**A meaningful household-life milestone on the road to v3.0 Generations.** Poppy and all six Maplewood residents now have three selectable personal aspirations each: **Cozy Maker**, **Story Keeper**, and **Caring Heart**. Every aspiration is completed by using *real household activities* through the existing Daybook, including guided residents and resident autonomy in the currently visited home. Goals take **three separate in-game days** and must be completed in order. A household member earns each aspiration's reward only once, even across reloads, repeated routines or switching goals.

As characters finish their goals, **lasting framed memories** appear on the walls of their actual home or shared residence: original pixel-painted flowers, storybooks and hearts. The new **Roots & Keepsakes** journal shows each person's current journey, progress and completed memories. Open it from **Menu**, **Journal**, Poppy's own **Daybook**, or a resident's household **Daybook**. Earlier cooking, festivals, shops, fishing, museum, town upgrades, dating, weddings, and household progress are all retained in the same local save; no real money or service fees.

This is **not** v3.0 Generations yet: household autonomy, richer furniture and family care, physical iPhone Safari playtests, and long-term legacy data still need work. The new aspiration module was tested against all seven characters, three tracks per person, save migration and reward caps; the GitHub automated suite passed. See [v2.5.11 QA and Generations prerequisites](ASPIRATIONS_V2511_QA_AND_ROADMAP.md).

## Previous milestone — Little Moments Together v2.5.10

**Your village improvements now bring neighbors closer together.** Four recurring paired scenes appear at actual upgraded places in Maplewood: Mabel and Jun's **Poetry Garden**, Bea and Finn's **Lantern Workshop**, Rosie and Oliver's **Shared Orchard Table**, and Finn and Jun's **Stories by the Water**. The two residents navigate to their meeting positions in the existing game world and interact with unique animated props rather than teleporting into unrelated menus.

In **Menu / Journal / Town Hall → Neighbors Together**, discover when each story is available. The first two alternate on season day 1; the orchard and pond scenes happen on season days 6 and 7. These are **in-game recurring events**, not real-world deadlines. Once both residents are physically present, you can join their outing and choose one of two distinctive outcomes. Choices improve the NPCs' **existing relationship bonds**, help ease tension, grow friendships and create lasting memories, with rewards limited once per scene per seasonal cycle.

**The important routines remain intact:** the new meetups never override dates, weddings, promises, established personal visits, urgent care or resident home time. Earlier households, cooking, decorations, collecting, festivals and saved progress remain intact with no additional cost. Automated regression checks now cover the new scenes. Real-device iPhone Safari testing and screenshot-based route QA are still outstanding.

Read [v2.5.10 development and QA notes](NEIGHBOR_SCENES_V2510_QA_AND_ROADMAP.md).

## Previous milestone — A Village in Motion v2.5.9

**The six Maplewood residents now actively work, prepare and socialize around the seasonal village festivals**, rather than merely gathering in one spot. Each has an individual schedule, destination and visible animated activity props: Mabel's garlands, Rosie's fruit baskets, Oliver's pastry trays, Jun's handwritten invitations, Bea's painting, and Finn's lanterns. In-game **day 2** is now a genuine festival preparation day; on days **3–5** neighbors change duties throughout morning, afternoon and evening. During ordinary days, completed garden, lantern, orchard and pond improvements also become part of their routines.

**Help make the village feel like home.** Open the new Community Diary through Menu, Journal or Town Hall, pick a neighbor and walk over to help. Six neighbors each have three distinct activities and stories (18 options). One completed act per in-game day during days 2–5 gives a modest friendship, Hearts, Fun and Social reward. Choices persist in the diary and become little hand-made decorations during the festival. No real-time deadlines or new currencies.

The scheduler explicitly preserves **dates, weddings, partner promises, friend visits, important encounters and household care** over the new jobs. All prior features and existing saves remain intact; iPhone-first with no paid services. The automatic regression suite passed, while physical Safari rendering and full route playthroughs remain outstanding. Read [v2.5.9 QA and next steps](VILLAGE_LIFE_V259_QA_AND_ROADMAP.md).

## Previous milestone — Maplewood Festival Market v2.5.8

**The Crafts and Treats stalls are now playable village destinations.** On days 3–5 of each in-game season, visit Bea's Crafts table to create one of four seasonal twelve-patch keepsakes with a real color/quality minigame. Bring an actual dish you prepared in Hearth Kitchen to the Treats stall, where Oliver and Rosie share it with the village—one prepared plate is consumed, exactly once, and a quality-stamped supper memory is saved. Seasonal snack purchases restore needs with a once-per-day cap. Both activities integrate existing residents, relationships, kitchen ingredients, and town upgrade bonuses rather than inventing disconnected menus.

Open the **Festival Market** from Menu, Journal, Town Hall, the Festival Calendar or through festival-related residents, then **walk to either actual stall** in Maplewood. You can also tap the illustrated awnings in the village on festival days. Both permanent memories appear in the Market Scrapbook, and completed stalls receive visual embellishments. All previous game systems and saves remain compatible; no payments, ads, subscriptions or real-time deadlines.

The first full automated regression suite for this milestone passed, including previous town-improvement and resident festival checks. Physical iPhone Safari and screenshot-driven full playtesting are still pending. [v2.5.8 QA & roadmap](FESTIVAL_MARKET_V258_QA_AND_ROADMAP.md) documents the actual scope and remaining work.

## Previous milestone — The Village We Grow v2.5.7

**A playable village-improvement milestone.** Maplewood now has an interactive **Town Projects** board near Town Hall. Help four neighbors build permanent improvements in two stages each: Mabel's flowering promenade, Bea's lantern plaza, Finn's lily-pond deck and Rosie's orchard cart. Each upgraded location changes the walkable game's environmental artwork and offers a useful **once-per-in-game-day interaction**. The orchard cart supplies a small seasonal parcel to the existing Hearth Kitchen pantry. Total construction contributions are 375 in-game coins, with no timers, ads, or real-money purchases.

On festival days 3–5, the town also gains original, illustrated seasonal **Crafts** and **Treats** stalls and subtle ambient decorations. These stalls are visual foundations; they do **not** yet implement extra shopping interactions. All previous cooking, fishing, museum, Cloverbank, household, friendship and festival features remain.

Visit the improvement board through **Menu / Journal / Town Hall**, by asking a host neighbor about village improvements, or by tapping the newly painted sign. Once constructed, tap finished locations to enjoy their daily benefits. Existing saves are backward-compatible and remain on device. See [v2.5.7 QA & roadmap](STEWARDSHIP_V257_QA_AND_ROADMAP.md) for verified checks and remaining iPhone Safari testing.

## Previous milestone — Together in Maplewood v2.5.6

**Living Village community milestone.** Festivals now include resident-led activities and lasting local memories instead of just minigames. At every seasonal festival (in-game days **3–5**), find the Festival Friends board through **Menu**, **Journal**, **Town Hall** or **Festival Calendar**. Select a resident to walk toward them, talk to them and choose **Help with the festival**. Each host offers a distinct personal project; there are eight authored collaborations across the four seasons, featuring three different control styles and accessible alternatives.

Helping both hosts in a season unlocks a persistent **Community Portrait**. Repeat plays remain available without repeated money, hearts or friendship awards. Previous memories appear in the Community Scrapbook archive, and small decorations celebrate completed projects in the town plaza. All prior activities, NPC relationships, households, collectibles and existing saves are retained.

This remains an early milestone, not finished festival production art, broader village simulation or Generations. [Read the development and QA notes](COMMUNITY_V256_QA_AND_ROADMAP.md). Automated festival tests now run through [GitHub Actions](.github/workflows/cozy-qa.yml), but physical iPhone Safari testing is outstanding.

## Previous milestone — Festival Days v2.5.5

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
