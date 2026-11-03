# Hearth & Harbor v2.9.1 — Pip's Living Cottage Day

## Fix the child's actual movement, not merely the menu

Before this update, Pip's existing childhood itinerary (`pip-routines-v273.js`) calculated an interpolated world position directly from the game clock. The resulting sprite could slide across room furniture or visually snap between positions. While v2.8.8 allowed Pip's legitimately earned reading, tidying, cooking and hobby interest to change where the child spent the afternoon, the visual movement to that place did not genuinely navigate the cottage.

The new **runtime-only home navigation** retains those exact established times, labels, personal interests and environmental choices but uses the home's **actual original walkable grid** to travel between them. Pip walks around the physical furniture, and the existing two-frame child sprite animates from actual distance traveled and direction, not from a guessed clock value.

Key behaviors:
- Pip remains a genuine optional child: home navigation activates only after the player's deliberate guardian choice.
- The adult and Pip still honor the same original in-game clock timetable and v2.8.8 earned Homegrown Personality preference. The schedules and reward rules are unchanged; the **child's physical position** is now resolved by a safe route.
- Destination coordinates pass through `nearestWalkable`; the full path uses existing `findPath` and `isWalkable` from `game.js`, including movable player furniture. Every 10px of *each actual movement segment* is sampled to avoid path corner-cutting. Incomplete BFS paths do not count as arrivals. A blocked route stops safely rather than teleporting.
- Nav plans are throttled to ~0.65 seconds or materially changed destinations, with movement capped to a 0.16-second frame when an iPhone is lagging or resuming.
- The saved visit modules, actual home-help/cooking activities, three-person cottage guest scenes, family rituals and Pip's longer child activity projects **always take priority**. During their real scene the child is drawn at one authoritative physical location; when the scene ends, autonomous travel resumes from that endpoint instead of snapping backward.
- A player-arranged furniture piece may appear under Pip. The actor cautiously moves to a nearby verified empty tile; in a fully blocked room, Pip remains stationary instead of clipping through furniture.
- Pip's Daybook gains **one tiny, non-scroll-heavy current-activity line**, not an extra navigation tab. Their usual handheld scheduled book, pillow or crayon is not drawn floating in space while walking.

## Backward compatibility and performance

No save data has been added, deleted or rewritten. This is entirely in-memory character animation and routing. All previous `youngResidents.pip` milestones, childhood project memories, v2.8.9 cottage visits, v2.9.0 illustrated postcards, existing original 64-bit-inspired 2.5D artwork, offline Home Screen support, and every user-arranged furniture choice are intended to remain intact.

Existing save key remains **`hearth-harbor-save-v1`**, without new paywalls, currencies, background timers, network requests or fabricated passive family rewards.

Changed assets:
- `pip-home-autonomy-v291.js`, `pip-home-autonomy-v291.css`: physical navigation and a calm inline Daybook status, zero persistent data.
- `little-sprouts-v272.js`: optional scene setup, authoritative position during idle and interrupts, physical stride-driven child draw, updated private runtime `advance`.
- `index.html`, `sw.js`: cache-busted v2.9.1 game, exact new offline resource list.
- `tests/pip-home-autonomy-v291.test.cjs`: stage/guardianship gating, authentic itinerary labels and inherited interests, detours and wall collisions, no-teleport, long frame safety, resynchronization after actual home activities, old-save invariants, phone performance, status UI, script order and PWA.
- All earlier regression suites remain in place; update only their release version assertions where appropriate.

## QA gates

Before merge: JavaScript syntax validation of all shipped game code, full deterministic GitHub Actions regression suite, verification of previous child and adult interactions. After merge: verify main-branch Cozy QA and GitHub Pages build/deploy **on the same published commit**. Note that automated tests alone do *not* establish that every unusual custom furniture arrangement is accessible on a physical iPhone, that every touch is comfortable, or that the scene looks perfect at every zoom level. Real Safari touch/visual QA remains outstanding.

## Remaining roadmap to v3.0 Generations

Continue with more authentic internal household choices, genuine real relationships across members, meaningful growing life-stage transitions, and eventual additional young residents (without duplicating NPCs or resetting family memories). User requested to **stop at the v3.0 checkpoint for evaluation**, not to rush to a nominal version number.
