# Hearth & Harbor v2.5.22 — Living Worktops

## Goal
The six Cooking Mama-inspired touch worktops already require different real inputs, but their visual boards were nearly all plain buttons and static backgrounds. This release makes actual food *visually develop* as the player cooks. The work follows the approved art/feedback quality track between v2.5 and the major v3.0 Generations expansion.

## Implementation
- New `kitchen-worktop-art-v2522.js` illustrates each worktop with compact, original SVG artwork. The renderer receives the actual current recipe, completed ingredients/cuts and currently chosen ingredient. It is display-only, creating no saved state or economic effects.
- **Chop:** progress paints up to four actual cut produce slices, varying between apple/fruit and carrot/vegetable cooking.
- **Season:** eggs, noodles, fish and skewers have their own illustrated plates. Salt, herbs and zest appear in their completed positions only after correct placement.
- **Thread:** separate carrot, potato and onion pieces become visible around a wood skewer as each successful step completes.
- **Fill:** three illustrated pastry pockets progressively reveal the actual filling; berry, honey and garden have their own colors.
- **Stamp:** biscuit dough is physically marked with unique star, flower and heart impressions in the actual recipe order.
- **Garnish:** food-specific dish bases acquire berry, leaves, flower petals or honey based on each recipe's exact combination.
- A selected ingredient appears as a semi-transparent preview at the next target, but only a successful matching placement becomes solid.
- Decorative illustration lives within the existing worktop; tappable controls remain accessible HTML buttons with their original focus, VoiceOver progress and 74px minimum compact screen height.
- New asset is loaded before `kitchen-craft-v2519.js` and precached with the offline worker's new `hearth-harbor-v2522-living-worktops` cache.
- Pure original SVGs use no external image requests, paid libraries or new services.

## Compatibility and safety
- No new browser storage keys or saved fields. The current key stays `hearth-harbor-save-v1`.
- No changes to ingredient pricing, up-front reservation, mistakes, quality or XP.
- All twelve existing recipes and 15 named techniques remain reachable. The six interactive craft techniques cannot be skipped using the old generic tap.
- Mistakes never paint completed artwork, mint dishes, move money or grant rewards.
- Decorative SVGs are hidden from accessibility tree; actionable native controls and live progress remain readable.

## QA
- New `tests/kitchen-worktop-art-v2522.test.cjs` covers 11 scenarios: all six original artwork types, per-action visual changes, two distinct seasoning plates, staged vegetables, differentiated pastry fillings, biscuit shape order, authentic dish garnishing, defensive data handling, economic isolation, page load/offline wiring, and compact/reduced-motion controls.
- Existing cooking and long-range regression tests cover all 12 recipes, save preservation, focus after taps, cancellation and household-meal integration.
- **Full suite expected: 168 tests.** Confirm GitHub CI/Pages result before marking shipped.

### Unverified on a real device
Rendered 320px/375px/390px iPhone screenshots, physical Safari touch feel, VoiceOver interactions, long save/reload sessions, visual polish against final art expectations, and GPU performance remain outstanding. Source-level asserts are not a visual or human usability audit.

## Next phases toward v3.0
1. Validate rendered mobile layouts and physical touch, fixing any real scrolling, click priority, or performance issues. Make the actual worktops feel polished, not simply compliant with tests.
2. Refine cooking and kitchen sound/animation feedback, transition timing and gesture variety while preserving low-stress accessibility and authored recipes.
3. Deepen household/village daily life: meaningful jobs and shops, household controls, purposeful decorating and differentiated resident behavior.
4. Build a major phased v3.0 Generations expansion: opt-in aging, children and parenting, household lineage, inherited heirlooms, milestones, village life changing over generations, save migration and extensive QA.

**Do not develop past v3.0 before the owner's creative evaluation and direction.**

[Previous milestone — Kitchen Moments v2.5.21](KITCHEN_MOMENTS_V2521_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
