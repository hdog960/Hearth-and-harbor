# Hearth & Harbor v2.3 — Home Is a Feeling (first playable household slice)

A free iPhone-first 2.5D cozy life simulator, published to GitHub Pages.

## New in v2.3
- **Playable household members inside residential homes.** Visit People → Little Households → Visit, then Menu → Household Daybook. Select Poppy or a resident; the avatar, name and need meters follow the selected person.
- **Five household activities:** sleep, read, tidy, make a simple meal, and spend quality time. Residents walk to stations and perform queued activities. Needs recover, and quality time can strengthen roommate relationships.
- **Room personalization:** six free color palettes and three purchasable visible decoration slots per address. A capped home-comfort rating increases routine benefits. Resident needs and decoration progress persist.
- **Anti-grind rules:** repeated daily activities produce reduced need benefits, and tidying cannot repeatedly generate household money.
- **Save compatibility:** older games, friendships, households, cooking (12 recipes), and progression remain compatible.

### Scope
This is the **first release of the v2.3 milestone**, not the completed household simulator. Resident control currently works inside their own residences. Freeform wall construction, rotated furniture, sophisticated autonomous schedules, and full multi-resident action queues remain future steps. Physical iPhone Safari QA is still required.

## How to play
Open the game on GitHub Pages. Tap **People → Little Households → Visit** to enter an occupied residence. Use **Menu → Household Daybook** to change who you guide, choose home activities or customize the room. Poppy remains available through the Daybook roster, and returning to town safely resets control.


## Previously implemented


An original, free, iPhone-first 2.5D cozy life simulator with household and village systems.

## New in v2.2
- **12 interactive recipes** and a more varied 15-technique cooking library: slicing, stirring, flipping, cracking, kneading, pouring, seasoning, baking, garnishing, filling, stamping, simmering, threading, grilling and steaming.
- Eight new dishes with custom illustrations, ingredient requirements, distinctive preparation sequences, new pantry staples, and a 12-item recipe book.
- Accessible button alternatives for all actions and optional relaxed timing.
- **Resident favorite foods and meal sharing** when visiting a home: food and social needs improve; once-per-day friendship bonuses prevent unlimited farming.
- Backwards-compatible cooking data and pantry migration from v2.1 saves.

Existing 2.5D exploration, cottage decoration, households, neighbors, relationships, stories, and local saves are preserved.

## Start cooking
From your cottage, tap the kitchen; or choose **Menu → Hearth Kitchen**. Select a recipe. Buy missing ingredients from Rosie's ingredient market. After cooking, eat or save a dish; if visiting a neighbor's home, use **Share** to serve that household.

**Notes:** Kitchen techniques have distinct visual scenes and combinations, but a few are variations on the same accessible timing or tap interaction. Visuals and actions are still prototype-quality, and physical iPhone Safari testing remains necessary. This is not the whole game roadmap delivered at once.

See [ROADMAP_V22_V30.md](ROADMAP_V22_V30.md) for the approved deep, paced v2.3–v3.0 development plan and quality gates. See [COOKING_SYSTEM_DESIGN.md](COOKING_SYSTEM_DESIGN.md) for broader kitchen design.

## Publish
Deploy the repository root to GitHub Pages (main branch), then open in iPhone Safari. Saved progress stays in browser localStorage; export backups before major revisions.

## v2.3.1 — Cozy Routines (playable)
- Poppy's cottage now has a Daybook with five actions, accessible from Decor or Menu while at home.
- Queued activities display in a compact, cancellable routine strip. Poppy walks to furniture to complete actions, with diminishing repeated bonuses.
- Furnishing purchases raise Poppy's home comfort and improve restorative activities.
- In residential interiors, NPCs show context-dependent daily activity poses near their furniture, based on time and needs.
- Existing save data and the full 12-recipe cooking system remain supported. Core actions tested in a local mobile Chromium harness; physical iPhone Safari still needs validation.
