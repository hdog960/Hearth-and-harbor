# Hearth & Harbor v2.5.20 — Kitchen Polish

## Purpose
This is a **usability, accessibility, visual composition and regression-quality milestone**, not a new cooking system. The six Kitchen Craft worktops introduced in v2.5.19 are functional, but the existing cooking-step layout rendered a full decorative gesture panel **above** each additional craft worktop, creating two competing boards and making interactive controls unnecessarily far down the screen on compact iPhones. The 12 original recipes, the other nine named kitchen techniques, ingredients, chef XP, dish quality, eating/sharing and At Our Table remain unchanged.

## Code changes
1. **One coherent illustrated cooking experience:** The real recipe-specific illustrated SVG stage remains visible in a **compact, noninteractive hero** (104px tall, 86px for screens 390px wide or narrower); the new tactile board is visually primary, with reduced padding, aligned step instructions and a smaller action footer. The original large gesture surface remains unchanged for other stirring, pouring, kneading, timing and egg actions.
2. **No redundant progress bar:** The Kitchen Craft board now gives a short accessible status (e.g. “2 of 3 placed”) and shares the **actual original kitchen-step progress bar**. There is no second decorative progress bar.
3. **Live accessible progress:** The single progress indicator exposes \`role=progressbar\`, current \`aria-valuenow\`, explicit min/max and status text. Craft feedback announces whether the player needs to select another ingredient, has placed a component, or made a gentle mistake.
4. **Stable keyboard/VoiceOver navigation:** When a player selects an ingredient, applies a component, makes a cut, or misses a pattern, the craft board no longer strands focus on an HTML element removed during re-render. Focus is returned to the next valid target or original safe control with \`preventScroll\`. Unsafe user-supplied selector strings are not interpolated into the focus selector.
5. **Step scrolling:** Upon advancing to a new cooking technique, the scrollable modal's content position returns to the beginning of that step, including the correct recipe title, step count and artwork.
6. **Safer cancel/close:** Closing the cooking modal while preparing a dish now clears the current worktop and pointer state as well as the original cooking session. A half-cooked recipe never becomes a saved dish by dismissing the modal. Previous ingredient reservation/consumption semantics are not altered or deceptively refunded.
7. **Small-screen and reduced-motion styling:** Visible keyboard focus rings, minimum practical 74px/high touch positions in the worktop, fewer stacked blocks and further spacing adjustments at 390px wide. Existing reduced-motion styling continues to suppress unneeded animation. The compact illustration uses \`role=img\`; it no longer masquerades as a second empty gesture control.

## Files changed
- \`kitchen.js\` — step composition, accessible progress and focus, scrolling, craft cleanup
- \`kitchen-craft-v2519.js\` — remove duplicate bar, show count and status
- \`kitchen-craft-v2519.css\` — compact illustrated cooking layout and touch/focus styles
- \`game.js\` — clear active kitchen craft and pointer when modal is closed; release string
- \`index.html\` and \`sw.js\` — update all static asset URLs to v2.5.20; offline cache \`hearth-harbor-v2520-kitchen-polish\`
- \`tests/kitchen-polish-v2520.test.cjs\` — 11 permanent regressions
- \`tests/kitchen-craft-v2519.test.cjs\` — previous version-specific cache assertion made release-independent

## QA
New tests cover the compact use of existing original food SVGs; absence of duplicate progress; real modal step scroll reset; live \`aria-valuenow\` and percentage; preserved focus on correct cuts, ingredient selection, placements and mistakes; safe invalid action tokens; small-screen CSS and visible focus; preservation of non-craft cooking steps; cancel safety; and offline precache.

**150 automated Node tests in the full suite** (139 existing + 11 new). The separate existing integration tests still simulate **all 12 full cooking recipes** through HearthKitchen and validate original pantry spending and rewards. The QA workflow also syntax-checks browser JavaScript. Run \`node --test tests/*.test.cjs\` with Node in the checkout.

### Unverified / outstanding
This work is grounded in source and automated DOM mocks, not in a real **iPhone Safari screenshot**, physical touch recording or performance profile. The new responsive CSS is tested for presence and intended sizing but not yet confirmed by an actual 320–390px rendered screenshot. These are important next quality gates before v3.0.

## Road to v3.0
1. **Actual browser/iPhone Safari visual and touch QA**, especially decorated homes, swipe/tap cooking, large modal scrolling, saved state and long-session stability.
2. Richer cooking feedback and satisfying animated food prep (without replacing the twelve good recipes or inventing repetitive new ones).
3. Household and village integration: residents' meaningful jobs, shops, shared daily life, long-term decor incentives and relationship balance.
4. Large, careful **v3.0 Generations** expansion: optional aging, children/parenting, family tree, heirloom inheritance, important life milestones and thoroughly migrated save states.

**Do not proceed past v3.0 without the owner's requested review and creative input.**

Previous milestone: [Kitchen Craft v2.5.19](KITCHEN_CRAFT_V2519_QA_AND_ROADMAP.md).
