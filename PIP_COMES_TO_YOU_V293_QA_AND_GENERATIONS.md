# Hearth & Harbor v2.9.3 — Pip Comes to You

## A living child takes the initiative in the actual cottage

v2.9.2 allowed Pip to **propose** one of four family activities, but Poppy had to find and tap Pip. This iteration lets Pip **notice Poppy, walk toward her and offer an optional in-world interaction**. The intention uses Pip's genuinely earned childhood interests; the player never has to accept it.

This is not a separate daily quest, free payout, a simulated reward or a menu button with an invisible action.

### Exactly what occurs in the game

- After Poppy explicitly becomes Pip's guardian, between **noon and 4:30 PM**, if an uncompleted genuine child initiative is available and Poppy is quietly standing nearby inside the cottage, Pip may decide to walk over.
- Pip waits until Poppy is still for about a second, and only attempts a nearby meeting if their real positions are within 375 world units. It evaluates five candidate spots beside Poppy and chooses a physically walkable position without occupying the same ground as Poppy.
- **No new pathfinding engine.** The new approach simply changes the destination of `HearthPipHomeAutonomy` from v2.9.1. That existing agent walks the actual cottage obstacle grid, segment-samples every movement, uses the original child sprite's distance-driven animation and handles custom furniture. There is no added 60 fps BFS run.
- On actual arrival, Pip displays a small original hand-drawn note over their sprite. The game briefly says Pip has an idea and lets you tap Pip to hear it. **No modal automatically steals focus.** Poppy can also ignore Pip and continue her own plans.
- Once responded to or after a short friendly hold, Pip returns to the earlier routine. No duplicate requests are imposed that day. On a new day, Pip may approach again. If Poppy moves, a wedding/visit/other child session starts, a modal opens, or the furniture path cannot be reached, the attempt gracefully ends without phantom arrival, teleporting or losing a reward.
- The original v2.9.2 **choice** still occurs only if you opt to tap Pip. **Lead** versus **Learn Together** remains player-selected and continues to queue the existing true timed 3.8-second household work. The previously implemented condition requiring an actual first daily furniture completion with Pip physically nearby still governs all permanent childhood memory records and modest need changes.
- When no approach opportunity exists, tapping Pip still opens the normal childhood Daybook, retaining all previous child projects, growing milestones, neighbor memories, gallery, rituals and optional chosen guardianship.
- A small one-line status appears only when Pip is approaching or already there; the older Daybook remains compact.

### Mobile performance, visual language and save safety

The new `pip-approaches-v293.js` contains **no network calls, recurring background timers, persistent data or new save fields**. Per-frame work involves only a handful of position checks. It caches the costlier cottage request and walkable-furniture eligibility check to about **1.5 checks per second** while in use, and it picks a meeting position once per attempt. The existing path walker has its own 0.65-second route throttle and 0.16-second frame cap.

An approach is runtime-only, at most two interrupted attempts per in-game day and one actual offered moment per day. An attempted but blocked visit does not affect relationship status, need values, coins, family lineage or the player's save.

The authoritative localStorage key stays `hearth-harbor-save-v1`. The new small note is pixel-style Canvas geometry that inherits Pip's real current favorite color; no art assets are downloaded, no generic flat menu tile replaces the sprite, and no additional scrolling/navigation tab is added.

### Source changes

- `pip-approaches-v293.js`, `.css`: one gentle freeform world approach, a restrained hand-drawn speech card, stationary player check, world-safe meeting spot, original schedule handoff, blocking priorities, once-per-day cooldown and bounded runtime.
- `pip-initiatives-v292.js`: expose `canOffer()` distinct from `ready()` so Pip can have an idea when the player is at a distance without enabling a remote conversation or bypassing the original activity rules.
- `little-sprouts-v272.js`: optional module setup, unchanged single Pip sprite, age/parent/family activity precedence, actual child schedule destination, draw integration and compact status.
- `game.js`: send real player walking state to the child approach; on the existing world tap, mark the optional approach addressed and keep the genuine original idea / Daybook fallback.
- `index.html`, `sw.js`: correct script order and iPhone offline-cache v2.9.3.
- `tests/pip-approaches-v293.test.cjs`: automated arrival, voluntary response, family interruptions, distance/time windows, no duplicate approaches, custom furniture, scene/clock changes, non-teleport behavior, native artwork and iPhone check-throttle test. All previous regressions remain mandatory.

### Release and remaining Generations work

Run the entire Node syntax and deterministic regression suite on the release branch. Merge only after green branch checks; then require green main Cozy QA and successful GitHub Pages deployment on the exact merged revision.

Real iPhone screen scaling, touch targeting, custom furniture, save-to-new-version migration and long-session performance **still require actual device QA**. Passing automated checks is not a claim that those have been physically tested.

The next v2.9 milestones should use actual lived family experiences to deepen caregiver/child reactions and optional genuine life-stage transitions. In the later v3.0 release, evaluate additional young residents, consent-based aging and lasting generation-to-generation continuity. **Stop at v3.0 for the user's requested creative review.**
