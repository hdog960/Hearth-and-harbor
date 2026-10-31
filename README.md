# Hearth & Harbor v2.1 — The Hearth Kitchen Atelier (Visual Overhaul)

A free original 2.5D life simulator, playable in iPhone Safari and hosted through GitHub Pages. No ads, accounts, or paid features.

## New: first playable cooking loop
- Tap the kitchen in your own cottage, or open **Menu → Hearth Kitchen**.
- Choose one of four recipes: Cinnamon Toast, Orchard Fruit Salad, Garden Vegetable Soup, or Berry Pancakes.
- Ingredients come from your starter pantry or Rosie's Market → Pantry ingredients.
- Complete swipe-to-slice, circle-to-stir, and time-to-flip touch steps. Each has a large tap alternative.
- Prepared meals earn cooking experience and can be eaten immediately or stored for later.
- Dishes, pantry ingredients, cooking skill and relaxed cooking preference save to your original local save.
- A recipe can be cancelled from the cooking board; its ingredients were consumed when you pressed Cook. Cancelling before Cook uses nothing.

## Compatibility and limitations
Original flower gardening, housing, friendships, fishing and village stories remain. Old saves receive a starter pantry. This is milestone C1, **not** the full proposed cooking system: collaborative meals, more recipes, vegetable gardening and food preferences are next.

See [COOKING_SYSTEM_DESIGN.md](COOKING_SYSTEM_DESIGN.md) for the full cooking feature roadmap. To publish, deploy the root directory through GitHub Pages on `main`.

## v2.1 cooking artwork overhaul
- All four recipe cards now use original illustrated food art, not a system emoji placeholder.
- Three interactive steps have distinct detailed kitchen illustrations (cutting board with ingredients and knife, mixing bowl and whisk, and stovetop skillet with a timing meter).
- Redesigned recipe book, stage navigation, preparation progress, plated-food result, colors and typography with touch-friendly buttons.
- Reduced-motion support preserved.
- Game-state schema and existing save key are unchanged.
- Cooking gestures and regression checks must pass before publishing; physical iPhone Safari testing remains a recommended final check.