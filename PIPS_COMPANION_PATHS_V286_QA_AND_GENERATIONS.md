# Hearth & Harbor v2.8.6 — Pip's Companion Paths

## A genuine movement fix for Generations

The earlier village companion followed a direct line toward Poppy. On the real 2.5D map, walls, houses, fences and water could block that line, strand Pip, or cause a long-distance snap that crossed scenery. This patch replaces that simplistic movement with **real obstacle-aware escort navigation** using the same already-implemented grid routing as Poppy.

- Each optional escort is initiated only in person at Pip's cottage after real chosen guardianship. It remains an unsaved, cancellable, day-scoped play session.
- The companion now requests a **walkable route** around the actual town environment rather than moving straight through solid scenery. Route calculation is throttled to approximately every 0.45 seconds (or when Poppy changes direction significantly).
- Both each next waypoint and the entire *interpolated step segment* are checked against the world's existing walkability rules. A short diagonal path cannot cut through a house corner even if the high-level grid route contains a bad shortcut.
- When no safe route exists, Pip stops. There are **no distance-based teleport cheats**, invented positions, or new remote player control. Replanning resumes when Poppy approaches a reachable path.
- At any frame rate, travel distance is capped to avoid giant jumps after the app is backgrounded. Dialogue and menus pause character movement. Deliberately pausing in-game clock time no longer incorrectly strands the follower while Poppy is manually walking.
- Actual traveled distance determines Pip's two-frame sprite stepping and gentler walking bob. Idle Pip retains a quiet subtle breath motion. These changes use the game's existing original character art and grown-child scale rather than inserting unrelated icons.

## Better physical family gameplay

v2.8.4 Neighborhood Helper crafts and v2.8.1 Growing Adventures already require *both* Poppy and Pip at actual town objects. Previously the arrival callback might occur while Pip was still arriving, fail its proximity gate and provide no explanation. The game now tells the player to **wait beside the real glowing object, then tap again once Pip arrives**. No partial reward, automatic completion, duplicated travel, or invented activity event is generated.

## Files

- `pip-neighbors-v275.js`: robust obstacle-aware escort routing; segment sampling, safe target, stride advancement, no-teleport behavior and concise Daybook instruction.
- `little-sprouts-v272.js`: route and movement-block callback forwarding; walking cadence drawn only when actually moving.
- `game.js`: uses the existing real `findPath` grid navigation and samples the original `isWalkable`; proper movement pause separation; distance-driven child sprite steps.
- `pip-helpers-v284.js` and `pip-adventures-v281.js`: useful physical catch-up feedback when the player arrives before Pip.
- `index.html` and `sw.js`: updated v2.8.6 iPhone script cache-busting and offline release cache.
- `tests/pip-companion-v286.test.cjs`: isolated path, collision, throttling, frame-rate, no-teleport, guard, interruption, art cadence, storage and mobile integration tests. Entire earlier regression suite remains mandatory.

## Save and production safeguards

The original local storage key `hearth-harbor-save-v1` is unchanged. The escort path, frame cadence and temporary movement flags are runtime-only. No new child attributes, passive money, currency, server, account, time-based reward or fabricated family relationship were added. Adult routines, original choice consequences, earlier Pip experiences, v2.8.4 neighborhood crafts and v2.8.5 permanent keepsakes retain their save formats.

**Release gate**: syntax-check all browser JavaScript and run every deterministic test before merging. Confirm main-branch QA and GitHub Pages deployment on the merged commit. Even those passing do not prove final iPhone Canvas art depth, real Safari touch, VoiceOver, 320/375/390px viewport, offline old-save recovery or long play sessions; those require physical/device checks.

This is **v2.8.6**, not v3.0 Generations. Next: more authentic household roles and distinct shared scenes between Poppy, Pip and village adults, eventually optional additional children, life stages, family continuity, and household succession.
