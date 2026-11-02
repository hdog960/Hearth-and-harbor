# Hearth & Harbor v2.5.19 — Kitchen Craft

## Intent
Improve the quality and variety of **Hearth Kitchen** rather than simply adding recipes. All **12 existing recipes, 14 pantry ingredients, original Cooking Mama-inspired activities, chef XP, food quality, mastered-recipe counts, favorite foods and At Our Table dinner integration** remain intact. The broader goal remains a polished Sims-inspired household life sim with a cozy Animal Crossing-inspired village, working toward **v3.0 Generations**. The owner wants to weigh in at the 3.0 milestone before deciding what follows.

## What is playable

Hearth Kitchen already supported fifteen distinct named cooking steps but some relied on repeating the generic "tap until prepared" control. This release replaces that generic shortcut **for six named techniques** with new, original, accessible, recipe-sensitive, tactile worktop interactions:

| Technique | Actual player input | Recipe variation |
|---|---|---|
| Chop | Tap four cutting marks from left to right; each mark becomes visibly completed | Orchard salad, veggie soup, jam, picnic skewers |
| Season | Select an actual seasoning from a spice palette, then tap a specific area of the plate | Eggs, noodles, fish and skewers use different spice patterns |
| Thread | Pick a vegetable, then add it to each next empty skewer notch | Picnic skewers: carrot, potato, onion |
| Fill | Choose filling, then spoon into each successive pastry pocket | Berry/honey combination for tart, garden filling for dumplings |
| Stamp | Choose a shaped cutter and press each dough space | Biscuit shapes: star, flower, heart |
| Garnish | Choose from a garnish palette and apply to successive named positions on the finished dish | Fruit salad, pancakes, fish, tart and dumplings use differing finishing details |

These are **not six copies of the same one-button action**: chopping requires sequential cut buttons; others use palette selection followed by an appropriate target on the board, with distinct images, expected ingredients, step sizes, work surfaces and authored dish-specific patterns. This release is a solid improvement to existing 15-step gameplay, but **not** a claim to be fully physical 3D/gesture Cooking Mama.

### Retained cooking behaviors
- Original **stirring, pouring, kneading, egg cracking and five timing-based steps** remain in the regular kitchen loop, including existing touch/gesture input and the Relaxed Timing option.
- The generic "Cook/Tap" fallback is intentionally **disabled for the six new craft technique steps**, so the player must complete the actual tactile interaction rather than bypass it with three button taps.
- All craft controls are HTML buttons with touch-sized targets, visible progress, distinct stage decoration, stateful selected-tool feedback, and accessible pressed/disabled states. No swipe is required to use the new boards.
- Wrong choices do not consume additional ingredients or impose a timer. They gently prompt retry and can modestly reduce the *step's quality score*, which already feeds the original real plate-quality system.
- Original ingredient payment happens only when starting the recipe; the new minigames do not change costs, award coins or create duplicate plated dishes. Existing abandoned-cooking behavior (ingredients already spent) is **unchanged and explicitly explained**; no free ingredient refunds have been fabricated.
- A recipe book callout advertises the six new worktops so players know where the upgrade is.
- All 12 recipes can be completed end-to-end using their existing ingredient and technique order. Completed dishes continue into the same prepared-plate shelf and can be eaten, shared or brought to the existing At Our Table system.

## Architecture
New \`kitchen-craft-v2519.js\` exports \`window.HearthKitchenCraft\`, a small state machine with \`make(kind,recipe)\` for the six technique types. State is transient inside a normal \`window.HearthKitchen\` cooking session. Every permitted craft action returns valid/done/progress/quality information; it cannot directly alter save data, money, needs, recipes or the pantry.

\`kitchen.js\` now creates the appropriate mini-board for these six steps, renders \`#kCraft\`, handles \`cook-craft\` delegated actions, and calls its **original \`complete(score)\`** only when the new stage is truly finished. It suppresses the former generic tapping bypass, leaves non-craft cooking methods intact, and clears craft state on completion or abandonment. \`kitchen-craft-v2519.css\` styles the responsive worktops, and the original index loads the new JS **before** \`kitchen.js\`. The offline service worker precaches both new files under \`hearth-harbor-v2519-kitchen-craft\`.

**No save migration is required.** The app still uses the same \`hearth-harbor-save-v1\` localStorage key; all prior household routines, resident hobbies, relationships, house designs, cooking pantry, plated food, story memories and town progress remain untouched. Existing cooking sessions were already transient and continue not to be serialized.

## Quality assurance
New \`tests/kitchen-craft-v2519.test.cjs\` contains **14 automated tests**, covering:
- All six valid craft types, unique input sequences and correct/incorrect actions;
- Recipe-specific seasoning, pastry filling, fruit-and-vegetable skewer order, biscuit cutters and dish garnishing;
- Validation against bogus and prototype-shaped input, double submissions and skipped targets;
- Correct score bounds on mistakes and mobile touch-button markup;
- **All 12 original recipes cooked end-to-end** through a mocked DOM and real original \`HearthKitchen\` class, not just isolated technique tests;
- Confirmation that the old one-button tap cannot bypass new worktops;
- Confirmed ingredient spending on start, preserving old abandonment semantics and no invented currency/food;
- Runtime load order, full offline precache and CSS presence.

All previous **125 tests** remain. GitHub Actions **139/139 tests passed** on the implementation release candidate, including syntax checks. Older version-specific tests were made cache-version independent.

### Honest limits and what to test physically
Automated Node and minimal DOM tests do **not** prove actual iPhone Safari touches, final appearance, animation, on-screen scrolling or performance. Full browser screenshots and physical iPhone testing are still needed. The existing cooking UI is HTML inside a modal and some longer recipes have four stages; check usability on smaller phones and Safari gesture capture before declaring cooking polished.

## Next work before v3.0
1. **Actual rendered/iPhone QA pass**: verify new cooking boards, mobile modal scrolling, navigation, responsiveness, furniture collisions, NPC animations, household family suppers and long-save stability; fix findings.
2. **More advanced Kitchen depth**: improve precision gestures, animated ingredient feedback, scoring readability and chef progression, without inflating recipes superficially.
3. **Household/village cohesion**: careers, functional shops and changing seasonal inventories, more proactive resident social life, varied hobbies and family routines.
4. **Balance and longevity**: meaningful long-term home goals, safe progression, subtle relationship rewards, no daily farming exploits.
5. **v3.0 Generations**: optional aging, households/parenting/children, family trees, inherited heirlooms and milestones, safe save migrations and meaningful life-stage gameplay.

Stop after v3.0 for the owner's review and next creative direction.

Previous milestone: [Little Passions Studio v2.5.18](HOBBY_STUDIO_V2518_QA_AND_ROADMAP.md).
