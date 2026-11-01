# Hearth & Harbor v2.5.13 — Little Atelier

## Role on the road to v3.0
**Little Atelier** is a household usability and continuity update. Our overall game remains a Sims-like life sim with an Animal Crossing-like town: the objective here is to make decorating flexible, low-pressure, and practically enjoyable on an iPhone, without interrupting cooking, residents, household aspirations, town stories, festivals or any other existing save history. The larger Generations systems have deliberately not begun yet.

## Implemented
### Persistent personal furniture storage
- Both Poppy's cottage and six visitable residences have a **Storage** panel in their existing decorating interface.
- An owned, placed piece of furniture can be **Stored**, not sold; this does not produce a coin refund and does not destroy the piece.
- It can later be **Placed** from that same home's storage with **no additional coin cost**. The normal 12-pixel placement grid, room collision checks and rotation controls still apply. A stored piece belongs to its original house and cannot be transferred to another household for free.
- Capacity: **40 stored items** for the cottage and **12** for each residence. A residence still permits at most **eight placed personal furnishings**; its storage is separate.
- A restored piece counts toward normal comfort, functional room pairings, favorite furnishings and resident aspirations just like the originally bought piece.
- When a piece is stored, its kind and orientation are preserved. Its world placement is selected fresh when taken from storage; it cannot teleport into an invalid/occupied spot.

### Furniture-only undo and redo
- A compact **Undo / Redo** toolbar appears in the existing cottage decorator and each resident household's Daybook.
- The last **ten actual changes per home** are undoable, including moving/rotating, buying, selling, storing, and retrieving furniture.
- Each transaction stores the exact before/after list of furniture positions, storage contents, and the corresponding **coin balance**. Undo restores its exact original purchase or sale balance; redo reapplies the same item and same charge/refund, avoiding unintended money duplication.
- **Safety check:** if another game mechanic changes the coin balance or furniture arrangement since the change was recorded, undo is refused and the session history is cleared. This protects other earned coins and progression.
- History is **session-only** in memory and does not bloat existing local saves. The stored furniture itself persists.
- These are furniture transaction controls. Wallpaper, relationship choices, other household rewards and quest decisions are intentionally not reversible with Atelier's Undo.

### Touch-friendly layout
- Large controls and horizontally/vertically scrollable storage areas with appropriately sized "Place", "Store", "Undo", and "Redo" buttons.
- Storage can be accessed through cottage **Decorate**, or **Daybook → Decorate this home** for residents.
- The game pauses furniture placement when the player cancels. No purchase or storage item is consumed until the user commits a valid position.
- The prior v2.5.12 functional-room combinations are preserved: moving furniture can naturally activate/deactivate room bonuses.

## Data migrations
The existing localStorage key remains **\`hearth-harbor-save-v1\`**. One top-level field is added:

\`\`\`js
atelierStorage: {
  player: [{kind:'lamp',rot:1}],
  h0: [],h1: [],h2: [],h3: [],h4: [],h5: []
}
\`\`\`

\`HearthAtelier.clean\` validates allowed furniture kinds, known home keys, rotation 0–3 and capacity limits. Resident storage accepts the six kinds that its existing decorating catalog actually sells. Cottage storage accepts all eight. Old saves get empty storage without resetting anything else. Undo/redo history is never saved.

Files added: \`atelier-v2513.js\`, \`atelier-v2513.css\`, \`tests/atelier-v2513.test.cjs\`. The new assets load before \`game.js\` and are precached by service worker \`hearth-harbor-v2513-little-atelier\`.

## QA
- Added **10 permanent regression scenarios** for save validation, personal storage, free retrieval, transaction snapshots, exact refund accounting, unrelated coin changes, per-residence isolation, redo invalidation, ten-step memory limits, UI wiring and offline precaching.
- Older v2.5.12 cache-name assertion changed to a release-independent validity check; existing functional-room tests remain.
- All **66 automated tests** should run in the repository's no-extra-dependency GitHub Actions workflow, along with syntax checking every browser JS file.
- **Limitations:** these are model-level and mocked UI checks; I have not physically touched the live game on an iPhone Safari device, tested long drag gestures, or captured end-to-end screenshot proof. Those remain quality gates.

## Next objectives prior to v3.0
1. **Full-device playtest and bugs**: inspect actual art and layout, 320px-wide mobile screens, map navigation, dragging/rotation, virtual keyboard overlap, save/load and NPC pathing.
2. **Further household depth**: varied meaningful chores and hobbies, refined animation, visible family interactions, cooperation and emotional needs.
3. **Cooking/home integration**: meal planning, favorites, household dinners and diverse kitchen minigames connected to existing twelve recipes.
4. **Town depth/long-term economy**: resident jobs, meaningful shops and events connected to family routines, without grind or unlimited reward farming.
5. **v3.0 Generations**: opt-in aging and family progression, life stages, family trees, parent/child caregiving, inheritance and long-term milestones—built with careful save migrations and enough polish to feel like a main expansion.

**The owner wants to weigh in when v3.0 is reached; do not assume their next post-3.0 roadmap.**
