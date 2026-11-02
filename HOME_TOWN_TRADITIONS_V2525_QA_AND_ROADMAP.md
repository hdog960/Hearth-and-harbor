# Hearth & Harbor v2.5.25 — Home & Town Traditions

## Purpose

The player has several engaging standalone systems—household routines and aspirations, furniture with actual functions, resident autonomy, baking, and real shop work—but not enough **lasting, visible progression between a household's life and Maplewood's daily economy**. This release connects those events and makes practical routines and village work part of a shared long-term household history.

## Three distinct, genuine household stories

Every one of the seven home slots (your own cottage plus six resident residences) can independently complete the following three household traditions. Start a tradition from the Home & Town Memory Book in the main Menu, Journal or Daybook. Starting costs nothing.

1. **The Welcome House → A Wreath for Everyone.** Finish an actual in-home conversation/letter → complete Bea’s genuine interactive welcome-card shop commission → finish a tidy routine at the original home.
2. **Sunday at the Table → Our Favorite Sunday.** Complete an actual in-home meal routine → deliver one **real cooked dish** to Oliver through his shop commission → finish an in-home conversation.
3. **Roots by the Window → Little Orchard Days.** Complete an actual resident or player hobby routine → deliver two **real pantry ingredients** to Rosie through her shop commission → finish an in-home reading routine.

The three chapters of each tradition happen **in order and on separate in-game days**. The same real Daybook, autonomy or hobby activity that drives needs and aspirations must finish before the chapter counts. Merely opening a dialog, queuing a routine, choosing a costume or button tapping does not earn progress. A shop chapter only advances from the real **successful, item-consuming shop fulfillment callback**, never by visiting a shop, cancelling, or opening a menu.

Only one chapter per household advances per in-game day, across all three traditions, preserving their slow, cozy storytelling pace. **Shop focus** is explicitly selectable in the Memory Book: choose which household receives credit for your next real village commission. Town work credits only that one household; it never automatically completes every resident household at once.

## Meaningful decorating consequences

Each completed three-chapter tradition creates a tiny **original, illustrated, framed picture** on the wall of the relevant cottage or residence. The frames depict flowers/wreaths, a welcoming meal, and the orchard's seasonal harvest. Each completed picture provides **+3 permanent home comfort** to that home: maximum **+9 per home**, capped by the existing 100-comfort limit. This makes the earned decoration matter for the existing real household action system without requiring costly furniture and without stacking coins or infinite stat rewards.

The wall portraits are drawn as original Canvas2D art against the actual world wallpaper, not image placeholders, emoji icons or third-party asset downloads. Players can inspect the book for precise next-step instructions, upcoming conditions, previous participants and date-stamped memories.

## Existing features protected

- All 12 recipes, actual kitchen pantry and cooked-dish inventories, cooking quality/XP, room decoration, old household comfort bonuses, shop payouts, daily limits, and social progression remain authoritative.
- The existing save key stays **\`hearth-harbor-save-v1\`**, no separate accounts, currencies or paid infrastructure.
- A compact optional \`homeTraditions\` record tracks only well-bounded household/track phases, authenticated in-game completion dates, limited memories and a chosen town-work focus. Import sanitizer rejects unknown home IDs, tradition names, actors, out-of-bounds dates and unsupported stage data.
- Story tracking does not create its own coin payouts, resource transactions, XP, purchases, or saves on real completion: the originating Daybook or shop action owns the normal save.
- A genuine home completion is observed in four paths: **player Daybook**, **resident guided Daybook**, **resident autonomy**, and **Little Passions Studio hobby**. Repeats that already paid out as daily routines do not advance stories.
- A real trade completion calls \`api.onCompleted?.(id,day)\` after confirming actual inventory/coin costs and a once-per-day shop completion, before the shop's normal save.
- The worktop at Village Trades now **explicitly tells players the next requested ingredient, wrapping step or paint color**. Previously the exact order was hidden behind trial-and-error choices.

## Files and QA

- \`home-traditions-v2525.js\`: story design, unlock state, strict sanitization, tracking, rendering and Memory Book controls.
- \`home-traditions-v2525.css\`: phone-first painted-book pages, full-size touch targets, accessible focus, scrollable household tabs, reduced-motion behavior.
- \`game.js\`: real home action observers, the seven-home comfort calculation, physical wall frames, story navigation and safe save import.
- \`village-trades-v2523.js/css\`: authoritative shop-completion event hook and clearer next-step prompts.
- \`index.html\`, \`sw.js\`: version-bumped cache, correct module order and offline precache.
- \`tests/home-traditions-v2525.test.cjs\`: **24 new regression scenarios**, extending the previous 206 tests to **230 expected**.

Tests cover all story sequences, out-of-order and same-day protection, multiple households and shop focus, authenticated real finished trade callbacks, unused/forged events, save/reload across three in-game days, invalid imports, comfort cap, artwork drawing, mobile UI and offline compatibility. An earlier café test is updated to recognize future rotating offline cache IDs.

**Unverified physical device gates:** 320px/375px/390px portrait and landscape visual screenshots, touch and VoiceOver focus on real Safari, long-session player economy and 2.5D portraits, pathfinding in every occupied residence. An all-green unit suite is not a substitute for manual visual QA.

## Road ahead to the agreed v3.0 stop

The next phase should expand differentiated household responsibilities and care, effective décor personalization, and neighbor occupations. The major **v3.0 Generations** needs deliberate incremental development: optional aging, child-friendly parenting/mentoring, continuity of homes, meaningful life milestones, a generational family-tree UI, inherited memories/heirlooms, and rigorous old-save migration. Avoid publishing a hurried v3.0 that merely adds an aging counter.

**Owner stopping agreement:** stop development at v3.0 for the player's creative review. Do not invent the next roadmap beyond it.

[Previous: Café Service v2.5.24](CAFE_SERVICE_V2524_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
