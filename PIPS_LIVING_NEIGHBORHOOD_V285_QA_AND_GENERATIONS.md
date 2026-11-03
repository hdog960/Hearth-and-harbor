# Hearth & Harbor v2.8.5 — Living Neighborhood Keepsakes

## The village remembers what Pip actually helped make

This release deepens v2.8.4 rather than adding another menu system. Six completed Neighborhood Helper activities with Poppy, Pip and a *real* Maplewood adult now leave six **distinct, persistent, original pixel-art world decorations** near existing village landmarks. They are drawn alongside ordinary buildings, plants and residents in depth-sorted town world coordinates.

- Mabel: hand-painted petal welcome flag by the garden
- Rosie: ribbon-tied market basket near the market path
- Oliver: hand-drawn recipe placard beside the bakery route
- Jun: story pennant near the library walk
- Bea: colorful swatch easel near the creative corner
- Finn: gentle pond-care sign near the shoreline

Decorations appear only if a saved genuine helper receipt is valid for the actual guardian day, prior age-development chapter, real adult acquaintance and current game day. They use the original v2.8.4 optional child save array; **no new save field/key** is needed. Replaying projects does not multiply world objects. Each first authentic memory stays in the bounded old save scrapbook. A display attempts a grounded walkable map coordinate and is omitted if no safe close spot exists, rather than placing a prop in obstructed scenery.

## Physical return visits with authentic memories

A player can tap an earned artifact in the *actual town*, walk to a safe nearby spot through the existing pathfinder, and inspect an original illustrated keepsake postcard. It shows the genuine saved date, exact participating adult, the original first choice and original final reflection. Reopening an already earned artifact has **no coins, friendship increments, child need boosts, passive rewards or extra memory receipts**. This is a meaningful record of what happened, not a click farm.

## Three actors instead of floating menus

While an authentic v2.8.4 craft is in its world-object phase, lightweight hand/paper crafting animations appear anchored independently to the *current real* Poppy, Pip and the adult participant positions. The original character sprite artwork remains intact, with an appropriate happy face when close enough to the work. These accents require all three real people to be at the in-world work location. There is no teleport, extra character copy or globally imposed emote. They disappear when any actor moves too far, the day changes, the action ends or the scene changes.

A short colorful celebration plays after the genuinely completed and saved final choice, using a session-only draw state. It pauses during modals, expires automatically in active game time, and never alters saved progress. The permanent physical art remains.

## Source / saves / testing

- `pip-world-keepsakes-v285.js`: source-grounded memory validation, landmark placement, depth-sorted art, 3-person animated craft poses, actual inspection and celebration.
- `pip-world-keepsakes-v285.css`: illustrated and accessible small-iPhone keepsake postcard.
- `pip-helpers-v284.js`: completed-project-only callback to trigger celebration.
- `little-sprouts-v272.js`: graceful optional module setup, animation dispatch and advance.
- `game.js`: draw depth, actors, world touch-to-walk, physical inspect and modal dispatch.
- `index.html`, `sw.js`: changed assets cache-busted on iPhone and offline cache bumped.
- `tests/pip-world-keepsakes-v285.test.cjs`: real save proof, six unique art silhouettes, rejection of faked entries, world tapping, read-only memory, safe scene changes, animation/celebration and mobile integration checks.

The authoritative save key stays `hearth-harbor-save-v1`. The earlier v2.8.4 records remain compatible. Poppy's relationships, six existing adults, home cooking, optional child guardianship, dreams, milestones, family rituals and prior Connections Atlas remain unchanged.

## QA and future Generations direction

Require Node syntax, all deterministic regressions, a successful PR CI, successful main branch CI and Pages release before calling the code published. Automated tests cannot prove iPhone Safari Canvas depth ordering, touch accuracy, Viewport 320/375/390px, VoiceOver or 30-minute gameplay. The game still needs a physical phone playtest to certify polish.

Next: improve the underlying Pip *locomotion animation and follow behavior* (rather than adding unrelated floating decoration), give different household residents stronger everyday social agency, and continue toward optional true life stages / extended households / property and family succession. **Generations v3.0 is not complete**.
