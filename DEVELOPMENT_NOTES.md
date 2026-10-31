# Hearth Kitchen C1 — development notes

Implementation: a separate `kitchen.js` and `kitchen.css` plus small hooks in `game.js`. The renderer, world navigation and save key are preserved. Changes include food inventory validation in `cleanSave`, kitchen interaction, recipe menu entry, Rosie pantry purchases, cooking input, dish storage/eating and a new service-worker cache name.

### Test priorities
1. Existing save migration and starter ingredients.
2. Buy ingredients, cook each recipe, cancel without duplication, prepare/eat stored dish, export/import/reload.
3. Touch slicing and stirring on Safari; tap alternatives, relaxed flip timing; mobile portrait and landscape layout.
4. Confirm existing gardening, furniture, resident conversations, housing and friendship systems work.

Known scope: four authored recipes; cooking skill is XP-only. No NPC cooked meals, dinner parties or crop cooking yet.