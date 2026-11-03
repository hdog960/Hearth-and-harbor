# Hearth & Harbor v2.9.9 — Stories Brought Home

## Why this update exists

Until now, Pip's friendship with Wren mainly affected their activity in Maplewood. v2.9.9 makes **actual experiences outside the household influence what Pip and Poppy choose to create together at home**—without inventing family status, passive XP, new currency or an unrelated minigame menu.

## What is playable

Once Poppy has explicitly become Pip's guardian, Pip can bring an earlier real Wren outing home through a *different, completed, timed* cottage activity with Poppy:

- **The Tale That Came Home** — complete an earlier real Pip–Wren *story* outing and, on a later day, genuinely finish **Read side by side** with Pip in the cottage. Choose between including Wren in a new boat adventure or adding a safe cottage lantern.
- **Colors Across Two Homes** — after a real earlier *color* outing, genuinely finish **Create together** in the cottage. Choose between distinct colorful skies and welcoming ribbons.
- **A Little Promise Travels Home** — after a real earlier *nature* outing, genuinely finish **Tidy a little corner** or **Set the supper table** with Pip. Choose between carefully recording a leaf and making a welcoming garden path.

Pip's existing Daybook shows **Friendship Stories at Home**, with a contextual invitation only when real prior Wren history, a real already completed same-day shared cottage task, chosen guardianship, and physical co-presence with Pip are all true. This does not start or auto-complete the regular 3.8-second home task. The actual home task was already completed through the original Helping Hands flow.

Choosing between two written responses saves an authentic dated family memory and creates an original, choice-colored **framed pixel painting on the cottage wall**. Up to three distinct topics form a small three-picture gallery, which is immediately visible on entering the cottage and persists in save data. A small in-world Pip sketch cue can appear when a new reflection has genuinely become available; the player is free to ignore it. Connections Atlas records the same earned family memory, without incorrectly assigning Wren to Poppy's household.

## Balance and durable save migration

- Original `hearth-harbor-save-v1` remains the **only** save key. An optional bounded `youngResidents.pip.homeEchoes.records` list stores at most 3 distinct topics.
- The receipt stores the day, home help kind, the two-choice result, and a compact validated copy of the actual earlier peer outing (`day,kind,first,last`). It is written only after completed in-game help and player confirmation. The record is bounded, sorted, sanitized, and survives the old peer scrapbook's 48-entry cap and the older home's 36-entry history cap.
- A previous Wren outing cannot be same-day; the earliest genuine peer event must be on **an earlier day**. The home activity must be one of Pip's **real completed shared home help** kinds on the current day. One topic each, one new story on each distinct day.
- Invalid input, missing child, home departure, movement away, a busy household, closure of the story modal, stale date and invalid imported data do not create a memory.
- There is **no bonus money, hearts, affection, child needs, XP, adult relationships, real-time timer, school, invented new child, forced growth or biological lineage**.

## Code and testing

- `pip-home-echoes-v299.js` — authored content, prerequisites, bounded cleaner, physical co-presence, player response flow, hand-drawn world frame art, and later-day memory text.
- `little-sprouts-v272.js` — safe migration, Pip Daybook integration, sprite interaction cue, action routing, and pause-safe prompt invalidation.
- `game.js` — home Canvas gallery render, real action routing, consistent dialogue state.
- `family-atlas-v271.js` — authentic family-life events only.
- `index.html`, `sw.js` — correct dependency load order and refreshed iPhone Home Screen cache.
- `tests/pip-home-echoes-v299.test.cjs` — repeatability, genuine co-presence, prior Wren activity, real Helping Hands, ages, saves, separate dates, choice artwork, mobile integration, timeout-free logic and no fake rewards.
- Every previous Cozy QA suite must also pass along with browser JS syntax checks before merging.

**Remaining hands-on device QA:** actual Safari/installed iPhone touch, small-screen overlapping artwork, household movement/collision, VoiceOver, reduced motion, and multi-year saved games. GitHub tests do not prove a physical device test.

## Continuing toward v3.0

Next, deepen optional growing-life-stage consequences and genuine long-term family continuity. Changes should be small, reversible where appropriate, and clearly grounded in saved relationships and physical activities. **Stop at v3.0 for the user's promised creative review.**