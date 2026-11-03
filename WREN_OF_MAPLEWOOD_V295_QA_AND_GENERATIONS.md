# Hearth & Harbor v2.9.5 — Wren of Maplewood

## A second genuine child in the *playable world*

The first 2.9.x Generations milestones made Pip more independent in Poppy's cottage. **v2.9.5 introduces Wren**, a new, distinct younger Maplewood resident who can be seen, approached and engaged **in the actual town**, not merely as a Daybook button. Wren's own character is made with the game's original hand-authored layered character art, with a different teal sweater, dark hair, skin tone, bird-motif satchel, smaller child-sized scale and appropriately animated footstep frames. Wren is **not added to `NPCS`**: no adult jobs, adult romance, weddings, spouse system, property ownership, household assignment or fictional guardianship.

### Daily life is observable

Wren lives outside Poppy's household and follows a **distinct, in-world routine**: reading near Jun, drawing near Bea, searching for fallen leaves by the meadow and winding down on the path as evening approaches. Wren is visible in the real town during safe daytime hours (8:30 AM–6:30 PM), not standing in a menu 24 hours a day.

Real movement uses the game's own town `findPath` route and `isWalkable` map. The character follows an obstacle-checked route in small steps, checking each intermediate segment to avoid cutting through houses, stalls, fencing, garden or pond. Routes are planned only after an itinerary change or a modest throttle, and motion is capped for dropped iPhone frames. No teleporting across the map between visible schedule stages.

The world renderer places Wren in the same depth-sorted environment as the original adult residents, with the original `charArt` layered drawing and a unique small mint satchel. Tapping the actual child walks Poppy to an appropriate safe nearby spot and opens a real Wren conversation.

### Pip and Wren can form a legitimate peer friendship

The child-to-child friendship is **not bestowed just by meeting Wren**. Poppy must physically bring Pip into the village (the existing neighbor-walk escort is supported; before guardianship, Pip follows their genuine independent town routine), stand close enough to Wren and ensure no other child outing is being interrupted. Three fully authored activities are available on different days:

- **The Paper-Boat Tale** — create a story together; two real story choices and two meaningful endings.
- **A Sky of Colors** — sketch clouds and colors together; distinct responses and endings.
- **The Leaf-Finder Club** — explore fallen leaves gently without damaging the garden; original nature-based choices and endings.

Each friendship afternoon is **two stages in the actual world**: meet both real children and choose their first idea; then **physically walk with Pip to an original paper marker** a short distance from Wren. Only after Poppy, Pip and Wren are all actually present at that marked spot can the second choice open and a dated memory be saved. When Pip falls behind, the spot stays active and a contextual message tells you to let Pip catch up; nothing is awarded remotely.

A valid finished activity adds one legitimate child friendship record for that day and gives Pip a modest **+2 joy**, once per day maximum. Different genuine days and varied play types unlock naturally warmer Wren–Pip friendship greetings, a handmade child keepsake detail on Wren's original sprite, and actual dated **Connections Atlas** peer friendship stories. These never create family ties, adult romantic relationships, money or adopted children. Merely opening the conversation, accepting the first idea or walking near Wren does not increase friendship.

### Save compatibility and safety

**The original save key stays `hearth-harbor-save-v1`.** The new optional, normalized save shape is `youngResidents.wren={friendships:[{day,kind,first,last}]}` with bounded genuine dates, unique one-per-day entries and validated two-choice story values. `game.js` now restores **both Pip and Wren** independently from the existing save; the game's default save starts Wren with an empty history. Older player files that contain only Pip are migrated without resetting childhood milestones or replacing the spouse/family system.

Wren appears as a known child node in the Connections Atlas without a household, ancestry or marriage edge. Adult filtering is explicitly limited to the original six adult IDs. Only actual finished two-stop child peer outings generate a friendship event. Pip's existing Daybook also gets a **folded** Wren friendship summary, not another large bottom navigation tab.

Wren's navigation state, waypoint, gestures and session are in-memory only. Leaving the town, moving past the current day or interrupting an outing cannot silently create a friendship. No external network calls, new packages, timers, ads, payments, generated stock art or background jobs.

### Implementation files

- `wren-neighbor-v295.js` and `.css`: Wren's original child descriptor, four local town schedule stops, safe route movement, three separately authored stories, two-step physical town activities, guarded interaction and saved genuine friendship history.
- `game.js`: original Canvas art and depth-sorted Wren character, world hit-test and actual player path-to-interact, waypoint tap and arrival; independent child update; dual-child default and save restoration under the unchanged key.
- `little-sprouts-v272.js`: read-only Wren friendship summary within Pip's existing Daybook.
- `family-atlas-v271.js`: Wren as a child-only node, accurate day-dated peer story events, no false adult/romantic/household links.
- `index.html`, `sw.js`: versioned 2.9.5 scripts, offline resources and a new Home Screen PWA cache.
- `tests/wren-neighbor-v295.test.cjs`: a comprehensive deterministic test suite for Wren’s identity, routine, obstacle avoidance, physical co-presence, two required actual stops, save integrity, story branching, no farming, anti-forgery and iPhone loading checks. All prior regression suites remain mandatory.

### Release checks and next Generations milestone

Before merge, the branch must pass syntax and the entire deterministic Node regression suite. After merge, verify green main Cozy QA and the Pages workflow on the actual published SHA. Real iPhone Safari screen-scale, overlapping-characters, native touch and long-save playtesting remain outstanding, so passing automated tests is **not** a substitute for device QA.

Continue next with child-to-child reactions outside prompted activities, deeper optional family routines and careful growing-life-stage choices. **Stop at v3.0 for the requested creative review**, rather than declaring the entire multi-generational game complete with one new character.
