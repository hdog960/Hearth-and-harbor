# Hearth & Harbor v2.5.9 — A Village in Motion

## Purpose
A focused continuation of the v2.5 Living Village plan. The town already had six distinctive neighbors, planned relationships and social events, festivals, eight collaborations, interactive Crafts and Treats stalls, and permanent improvement projects. This milestone makes those systems **coexist** in the shared world and gives each resident a visible daily role.

## Six jobs and living schedules
During in-game festival days 3–5, all six neighbors get distinct, reachable destinations and animated work props.

| Resident | Festival work | Morning | Afternoon | Evening |
|---|---|---|---|---|
| Mabel | Flower garlands | Flower preparations | Visit the Blossom Promenade | Evening festival crowd |
| Rosie | Orchard baskets | Arranging fresh market goods | Visit nearby market friends | Evening festival crowd |
| Oliver | Pastry sharing | Helping at Festival Treats | Walk around the festival lanes | Evening festival crowd |
| Jun | Letters and invitation poems | Writing notes | Checking on visitors and friends | Evening festival crowd |
| Bea | Hand-painted signs | Painting beside the Crafts stall | Visiting the central decorations | Evening festival crowd |
| Finn | Harbor lanterns | Preparing festival streamers | Walking toward the pond | Evening festival crowd |

On **day 2**, residents prepare supplies at their own stations during the daytime. On non-festival days, completed town improvements also become part of real schedules: Mabel and Jun visit the flower promenade, Bea the lantern plaza, Finn the pond deck, Rosie the orchard cart, and Oliver consults Rosie at the cart.

The new integration replaces the previous all-residents-to-one-spot scheduling override. **Events always win:** dates, weddings, promises, evening couple rituals, prearranged friend visits, active story encounters, household urgent rest/food/social modes, and night/home routines are never displaced by new festival jobs.

When idle at a destination, characters now display **original animated contextual props** (pastry tray, painting supplies, flower bouquet, lantern poles, written invitations and festival decorations) rendered on the game canvas. The game still uses the existing six actual NPC entities, paths and animations rather than fake crowd icons or spawned placeholders.

## A little help makes a home
During in-game **days 2–5**, the player can volunteer with **one neighbor per day**. Open **Community Diary** in Menu, Journal, or Town Hall, choose **Find** beside one of six neighbors, walk over using the existing NPC pathfinding, and select **Help prepare Maplewood** in the conversation.

Every neighbor has three original choices and distinct written outcomes — 18 combinations in all. The choice is remembered. For example, Jun can fold paper birds or write an invitation; Finn can string lanterns or hang a welcoming star; Mabel weaves flower garlands. Completing the choice grants once-per-day **+4 friendship with that resident, +2 Hearts, +5 Fun, and +7 Social**. It does not award coins or demand a real-time login.

The Community Diary records the previous 32 choices, with their original day/season. Festival banners show small visual embellishments for up to the four recent volunteer choices made during the current seasonal cycle, and neighbors can remember a successful activity when spoken to again.

## Persistence
New optional save record:
\`villageLife: {days:{"dayNumber":{id,choice}},records:[{day,id,choice}]}\`.
The project **continues** to use the same local-save key \`hearth-harbor-save-v1\`. All older saves gain an empty diary without a wipe. Imported data is bounded; bad dates, invalid residents, out-of-range choice indices and duplicate history are rejected by \`HearthVillageLife.clean\`.

Source integration: \`village-life-v259.js\` plus \`village-life-v259.css\` loaded before \`game.js\`, included in offline cache \`hearth-harbor-v259-village-in-motion\`.

## Quality assurance
- Added **nine** deterministic tests in \`tests/village-life-v259.test.cjs\`.
- They cover all six residents, 18 available choice outcomes, festival work slots, six distinct destinations, four seasonal cycles, protected story/social/home priorities, upgrade routines, diary state, day limits, reward uniqueness, save repair, canvas prop drawing, and offline asset wiring.
- The full GitHub Cozy QA suite passed after this module was integrated.
- Corrected the old v2.5.8 test so it doesn't fail just because the legitimate service-worker release name advances.

**Limits:** Simulated navigation and canvas command checks do not equal an actual Safari playthrough. A physical iPhone test, screenshots of every weather/season slot, performance checks, and complete NPC pathfinding rehearsals remain open. The new props are an animation foundation, not the final large-scale environmental/art overhaul.

## Next Living Village roadmap
1. Improve festival choreographs: expressive NPC idle/reaction frames, distinct arrivals/departures, townsfolk interacting with stalls and one another without crowd overlap.
2. Deepen town projects beyond basic once-per-day rewards: town-wide resident relationships, community votes, shops and facilities whose offerings change after improvements.
3. More Cooking Mama-like Hearth Kitchen techniques and seasonal specialties that use actual groceries and household meals.
4. Village ecology, additional walkable neighborhoods and polished screen navigation.
5. Only after these systems reach stable depth, take on v3.0 Generations and the much larger family progression.

See [ROADMAP_V22_V30.md](ROADMAP_V22_V30.md) for the original scope and the v2.5.5–v2.5.8 notes for earlier milestones.
