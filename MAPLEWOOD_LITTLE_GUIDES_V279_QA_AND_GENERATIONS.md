# Hearth & Harbor v2.7.9 — Maplewood's Little Guides

## A real relationship and neighborhood-autonomy milestone on the way to Generations

Pip now develops persistent, differentiated familiarity with **the six actual adult residents already in the playable town**: Mabel, Rosie, Oliver, Jun, Bea and Finn. Unlike a decorative affinity bar, the score increases only when a genuine proximity-based **two-step Pip + villager encounter from v2.7.5 is fully completed on a distinct in-game day**. The six small lifetime counters remain when the old 36-entry scrapbook rolls forward. A new or upgraded save reconstructs available historical scores from legitimate prior visits. Fictitious NPCs and duplicate dates do not grant progress.

After two real meeting days with the same resident, that neighbor becomes eligible as a favorite **village guide**. Choosing a guide requires real guardianship and physical presence beside Pip inside Poppy's cottage. This is **not** a second legal guardian, parent, marriage or family member, and does not alter existing adult housing or relationships.

### True, explicitly opted-in village afternoons
The player must opt into guided afternoons. They are off by default. After opting in, Pip can independently spend noon to 5 PM near the **actual selected villager's current world coordinates**, only when that person is genuinely present and a nearby valid town location is walkable. The game continuously resolves this from the actual adult NPC positions; a missing actor or no safe space cancels that afternoon's visit and retains Pip's authentic cottage routine. No fictional guide, school or unsupervised institution is conjured.

The world scene, touch hitbox, actual child position, map navigation and Daybook now follow Pip to their real location. Pip displays a small original chunky-pixel learning stand that incorporates both their chosen guide and their active childhood dream palette. When the villager moves, Pip follows at a safe offset in that actual world; a successful bond does not generate rewards merely by being near each other. The previous independent dream-based morning projects, nighttime rest, child home helping, family portraits, all six adult NPCs and all family systems continue unchanged.

Opted-in afternoon outings may be ended by meeting Pip beside the actual guide, or by turning them off when Pip is back in their cottage. During an enabled outing, Pip's ordinary single-villager interaction and the existing village conversation system remain available.

### Optional guide reflection: meaningful player participation
Poppy may walk to Pip and their real chosen guide in Maplewood and join a distinctly written two-decision interaction for that adult. The active childhood dream influences Pip's interests and visual identity. Both steps must be completed during the **same actual afternoon**, in real proximity to **both** Pip and that villager, and with the same dream, guide and game day. Canceling, changing locations/time, removing the NPC or crossing the day boundary yields **no memory**.

One completed reflection each day saves the genuine game day, villager ID, dream theme and decisions in a small bounded history. It grants a modest +7 to Pip's appropriate childhood need and +2 Joy, capped at 100. It gives **no money, passive income, instant progression or adult-romance rewards**. The dialogue is also available directly in the *actual* guide's neighbor talk menu when the participants are physically close.

The Connections Atlas adds only **finished, real guided reflections** as dated village history, without creating a second guardian relationship or invented biological kinship.

### Save and code integration
The original save key remains \`hearth-harbor-save-v1\`. The new optional \`youngResidents.pip.mentor\` stores one selected real guide, explicit consent setting, original date, six bounded lifetime neighbor-visit counts and last dates, and a capped (36) list of genuine completed guide reflections. Old saves are migrated without erasing Pip's dreams, nature/story/art records, adulthood rules, household relationships, jobs or currencies. No backend, login, remote service or separate storage key.

- \`pip-guides-v279.js\` — true affinity from authentic two-part neighbor completions; safe opt-in guide choice and real actor-based town routine; distinct real-world guide props; proximity-validated two-part reflections.
- \`pip-guides-v279.css\` — original mobile illustrated daybook, large touch areas, focus treatment, narrow-phone breakpoint, reduced motion.
- \`pip-neighbors-v275.js\` — triggers affection progression only after an existing genuine encounter completion, and shows correct guidance during opted-in afternoons.
- \`pip-routines-v273.js\` — switches the in-world afternoon location only if the selected real NPC is physically present and near a walkable spot; otherwise uses the prior cottage schedule.
- \`little-sprouts-v272.js\` — backward-compatible optional data, real town/cottage rendering and hitbox, physical book, action dispatch, aspiration coloring.
- \`game.js\` — accurate “Visit Pip” routing to a guide's actual town location, plus a direct talk-menu path to a real guide reflection.
- \`family-atlas-v271.js\` — records true completed child-guide moments, never fabricating kinship.
- \`index.html\` and \`sw.js\` — v2.7.9 iPhone asset versions and updated offline pre-cache.
- \`tests/pip-guides-v279.test.cjs\` — focused genuine-connection tests; all older deterministic game tests remain mandatory.

### What this does not claim
This is a concrete step toward full v3.0 Generations, **not** completed schooling, a school campus, new younger residents, multi-stage aging, child neglect mechanics, legal adoption or inheritance. All care and afternoon visits remain voluntary. Physical iPhone Safari (touch location, 320/375/390px sizing, VoiceOver, long-play and offline reload) and GitHub Pages live deployment must be independently verified after the CI release gate.

### Next milestone
Develop a cohesive child-growth framework that uses lifelong authentic family, neighbor and dream achievements to unlock **optional, age-appropriate developmental chapters**, with richer original animation and broader community routines. Prioritize meaningful living-world behavior over another disconnected menu.
