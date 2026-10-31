# Hearth & Harbor — The Hearth Kitchen
## Cooking system design and phased implementation plan
**Status:** Approved feature direction / design specification. Not yet implemented in the playable build.
**Design target:** A substantial cozy life-simulation mechanic, inspired by the tactile multi-step cooking fun of *Cooking Mama*, using wholly original artwork, recipes, characters, wording, and interface.
**Placement in roadmap:** Next household-activities milestone after v1.9 Open Doors; introduce as a polished playable slice, then expand across household life and the town.

## 1. Design promise
Cooking is part of *living* in Hearth & Harbor, not a separate arcade game. Players decide what to eat, where ingredients come from, how to prepare a meal, whom to invite or serve, and what to do with the food. Food affects hunger and energy, social routines, friendships, household budgets, aspirations, and town stories. Villagers cook and eat even when the player is not performing minigames (while the simulation runs); the player gets optional hands-on control.

Three pillars:
1. **Hands-on delight:** Short tactile kitchen steps with immediate animated visual and audio feedback.
2. **Meaningful life sim:** Meals restore needs, support households, and create social moments.
3. **Cozy discovery:** Seasonal produce, recipe collections, preferences, and shared family dishes.

## 2. Core gameplay loop
1. **Choose:** Interact with a usable kitchen counter/stove at home or during a bakery/cooking activity. Open a colorful **Recipe Book**, showing the dish, ingredients, servings, effects, difficulty, and prep steps.
2. **Gather:** Ingredients come from the market, household pantry, gardening (expand current flower garden to edible plots in a later milestone), fishing, neighbor gifts, and seasonal stalls. Do not require online services or real-money spending.
3. **Prepare:** Play 2–5 8–20-second skill steps in a dedicated touch-friendly cooking view. Allow pause, restart, accessibility variants, and reduced-time-pressure settings.
4. **Serve:** Plate the dish, then **Eat**, **Save leftovers**, **Serve household**, **Invite neighbor**, **Gift**, or **Sell** (when appropriate and balanced).
5. **Grow:** Gain cooking XP, learn variants, improve tools, and record the recipe in the Cookbook. A well-liked meal may create a relationship memory or Town Story.

### Example: Berry Pancakes
- Slice strawberries with short swipes along highlighted guides.
- Stir batter with circles or accessible tap controls; smooth batter texture changes.
- Flip a pancake at the right visual cue with a swipe or a large single-tap control.
- Drag fruit toppings onto the final plate.
- Serve Poppy and a visiting neighbor. Hunger rises; the neighbor's food preference affects friendship and conversation.

## 3. Touch mechanic library (original implementations)
- **Chop / slice:** Swipe across ingredient guides; accuracy and rhythm matter, with generous targets.
- **Stir / whisk:** Trace clockwise/counterclockwise circular motion; visible mixture texture progress.
- **Knead / fold:** Alternate two large touch zones or short drags; dough visibly changes shape.
- **Flip / sauté:** One-tap timing windows with readable heat and animation cues; no accelerometer dependency.
- **Pour / measure:** Drag an ingredient to a bowl and release near a fill marker; accessible +/- buttons.
- **Season / garnish:** Drag toppings into suggested positions, with creative free-placement at the end.
- **Bake / simmer:** Temperature and readiness choice with visual cues, not a long wait timer.
- **Wash / prep:** Short optional prep actions to keep accessibility and pace comfortable.

Use *Cooking Mama* as a reference for tactile, multi-stage satisfaction, not for copied artwork, branded wording, character designs, exact UI, or assets. All animations and sound effects must be original.

### Quality feedback
A simple 1–3-star result based on technique, without permanently destroying an expensive dish for minor errors. **Perfect plates** earn bonus cooking XP and visual flourishes; **imperfect plates** are still useful food. No punishing timers, energy gates, ad rewards, or premium currency. Reduce difficulty for beginners, children, and players with motor accessibility needs. Offer an optional untimed mode and tap alternatives to swipes/rotations; once a recipe is mastered allow quick-cook to trade technique XP for convenience.

## 4. Recipes and progression
**First playable slice: 8 carefully finished recipes** (2–4 actions each):
| Dish | Core techniques | Life-sim role |
| --- | --- | --- |
| Cinnamon Toast | Spread, garnish | Breakfast / comfort |
| Orchard Fruit Salad | Chop, mix | Garden/market produce |
| Sunny-Side Eggs | Crack, flip | Quick breakfast |
| Garden Vegetable Soup | Chop, stir, simmer | Family servings |
| Berry Pancakes | Mix, flip, garnish | Social breakfast |
| Herb Noodles | Stir, season | Budget meal |
| Harbor Grilled Fish | Season, flip | Fishing reward |
| Honeybun Berry Tart | Knead, fill, bake | Oliver bakery link |

**Expansion goal:** 40–60 original recipes across breakfast, lunch, dinner, baking, preserves, drinks, and seasonal specialties. Start with strong art for eight, not fifty barely functional variants.

**Cooking skill:** 20 levels, cosmetic plating options, recipe unlocks, and meaningful station upgrades. Later specialties: Baking, Comfort Cooking, Seafood, and Garden-to-Table. No required repetitive grinding. A household recipe book tracks mastery and discovery. Food variants can be discovered from ingredients, preferences, seasons, and neighbors.

## 5. Integration with systems already in the game
- **Player needs:** Meals restore `state.needs.hunger` and a limited amount of fun/energy. Portion sizes and quality affect values; avoid unlimited instant refills.
- **Residents:** Existing `state.residentLife[id].needs.food` makes NPC hunger meaningful. Residents can prepare simple meals automatically at home. Players may join them through optional kitchen steps.
- **Homes:** Player cottage and six visitable residential units get usable kitchens. Housemates share meals; visiting a home can lead to cooking together.
- **Relationships:** Food favorites and dislikes matter, tied to personalities. Gift, cook-with, and invite-to-dinner actions affect social bonds with once-per-day friendship reward guards.
- **Household finances:** Buying ingredients has a cost, but home cooking should generally be more economical than café meals. Avoid an infinite loop of buying/producing/selling cooked dishes.
- **Market:** Rosie sells staples; rotating seasonal produce adds a reason to visit. Oliver teaches baking techniques and can request recipe help.
- **Fishing:** Caught fish become optional ingredients, rather than collectibles with no use.
- **Gardening:** Extend current flower plots with editable vegetable/herb plots without invalidating saved flower data.
- **Town Stories:** First cooked dinner with a friend, recipe discovered, successful bake sale, or a shared household meal can generate memories.
- **Quests and aspirations:** Cookbook discoveries, cooking for a neighbor, market orders, and festivals can make use of the existing journal and resident dream systems.
- **Saving:** Preserve the existing localStorage save key. Add an optional, versioned `cooking` substate with defaults; sanitize imported data and cap quantities/experience.

## 6. UI / art direction (iPhone-first)
- **Kitchen view:** Preserve the 2.5D storybook-pixel art direction. A large illustrated food-prep board/bowl fills the main interaction area. Show an original dish preview and a small "Step 2 of 4" indicator.
- **Recipe book:** Categories and tasteful colorful illustrations; clear ingredient inventory, effects, and cook button. Only show unavailable ingredients when helpful; never dead-end the player.
- **Touch:** At least ~44px effective hit targets, clear portrait-layout safe areas, `touch-action: none` only inside the active minigame region, and no dependence on tilt or multi-touch. Fit iPhone portrait without overlay covering the food.
- **Visual detail:** Ingredient animations, kitchen steam, tiny sparkles, changing textures, a plate-reveal moment, and distinct plating art for each recipe. Art direction should be appealing without adding giant UI panels.
- **Audio / accessibility:** Sound optional; offer strong visual cues, reduced motion, untimed mode, and single-tap substitute controls.
- **Performance:** Canvas 2D spritesheets and a small fixed number of interactive sprites; avoid expensive per-frame allocations, heavy physics, and external paid services.

## 7. Implementation roadmap
### Milestone C1 — Cooking vertical slice (next household phase)
- Usable kitchen interaction in player's home; Cookbook with first 4 dishes; pantry model and basic market staples.
- At least three distinct fully playable preparation techniques (chop, stir, flip), proper scoring, plating, meal effects, local save.
- Portrait iPhone smoke tests (including Safari when user tests), state validation, no blockers while a minigame is open.
**Exit criterion:** Select, prepare, serve, save and reload a complete meal end to end.

### Milestone C2 — Make cooking part of daily life
- Expand to 8 fully authored recipes; add baking, garnish, measuring.
- Household serving, leftovers, NPC favorite foods, cooking together, social responses, kitchen visits and modest skill progression.
- NPC automatic self-feeding/meal routines must not require player minigame participation.
**Exit criterion:** Households can satisfy food needs and create social memories with or without player minigames.

### Milestone C3 — Townwide cooking
- Edible garden plots, fish ingredients, rotating market inventory, Oliver mentorship, recipe quests, festivals and bake sales, collection rewards.
- Expand curated recipes gradually toward 40–60, adding novel cooking steps and diverse food art.
**Exit criterion:** Cooking supports progression in multiple existing game loops and never feels mandatory in every session.

## 8. Economy / balance rules
- No real-time waiting, stamina purchases, or premium ingredients.
- Every basic recipe has accessible ingredients and a reasonable household benefit.
- Serving friends gives at most one relationship bonus per resident per in-game day.
- Selling prices do not exceed ingredient costs by an exploitable margin without a meaningful limited market order.
- Cooking XP does not award infinite progress by repeating one trivial action in rapid succession.
- Auto-cook should preserve enjoyment and agency without outperforming skilled hands-on cooking for mastery.

## 9. Regression checklist
- First-time users can cook without already owning rare materials.
- Kitchen entry, exit, pausing and resuming don't trap the user in an overlay.
- Swipes don't trigger Safari page gestures and the app remains usable with reduced-motion / tap controls.
- Hunger, energy, household inventory, coins and relationship rewards are clamped and saved correctly.
- Canceling before starting a dish doesn't consume ingredients; quitting during preparation uses a clearly explained ingredient policy.
- Meals don't duplicate on reload or menu dismissal.
- Old v1.9 saved games migrate safely and existing flower gardens/households remain unchanged.
- Small iPhone screens, orientation changes, Home Screen display, and offline reconnect are tested.
- At least one complete recipe is manually tested on physical iPhone Safari before calling the mechanic production-ready.

## Non-goals for initial release
No multiplayer cooking, restaurants operated by players, massive recipe catalog at launch, multiplayer trading, copied Cooking Mama characters/assets, or separate cooking app. This is one integrated life-sim system.

**Product decision:** Cooking becomes a major supporting pillar of Hearth & Harbor; it supplements life simulation rather than replacing the game's core Sims-like focus.
