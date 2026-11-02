# Hearth & Harbor v2.5.37 — The Heirloom Cabinet

## Real playable legacy possessions, earned and passed between homes

The previous milestones made household memories, relationships, mentorship, adult life stages and needs into persistent gameplay. But *individual physical possessions* had no lasting provenance and could not travel between homes. **The Heirloom Cabinet** adds that missing gameplay foundation for the future v3.0 Generations system.

It works for **Poppy's Cottage and all six neighbor residences**, using achievements genuinely recorded in each home's existing Household Chronicle. Completing prior real events, not reading a menu or having a fictional relationship, unlocks **five original handicraft keepsake designs**:

| Earned Chronicle event | Newly craftable legacy object | Original in-world miniature |
|---|---|---|
| Moving into a shared home | The First House Key | Carved key in a wood and felt display |
| Completing a roommate project | The Together Figurine | Two handmade figures |
| Sharing a real family supper | The Family Supper Plate | Hand-painted ceramic plate |
| Completing a three-chapter home/town tradition | The Village Memory Wreath | Braided seasonal wreath |
| Earning a personal room corner memory | The Favorite Nook Album | Tiny illustrated nature scrapbook |

A source event is checked against the home's **actual existing Chronicle events**, and can inspire **only one uniquely identified object ever**. Choosing an event does not grant an item. Instead it sets up a handmade project for the selected current resident (or Poppy at the Cottage), who must actually finish their **first genuine Hobby activity** on that game day. Directly guide the resident, or tap a button to add the required hobby to the existing independent resident Daybook / Poppy's authentic Cottage routine. The queue cannot overwrite full plans. Canceled work, repeats, changing days, or moving out never creates a keepsake. One completed craft per home and per individual per day, plus at most **two displayed objects per home**.

## Gifting creates real continuity

Each craft contains its **origin home, exact original memory source, historical event day, actual maker, craft day, kind, recipient home and count of gifts**. The physical item is stored **once**, under its current holder. Giving it to a named real resident in another occupied house **changes that one item's home**. The previous home loses the physical display and its comfort; the new home gains both. The original historical event remains in the source home's Chronicle. No duplicate item is minted or historical source "reclaimed" for another craft.

A home may give or receive one heirloom per game day, and the recipient cabinet must have room. Moving someone between households cannot copy objects. Gifts are free voluntary town-household decisions, not automatic property inheritance or invented family ties. The in-game Cabinet documents its maker, historic origin, original event day, later gifts, and whether it received a subtle brass accent from an actual opted-in elder maker.

Every physically displayed heirloom adds **+2 real home comfort** (max **+4 per home** and still under the game's existing overall 100 cap). It never produces coins, food, ingredients, player XP, household money, new family relationships or background income. Poppy's Cottage participates fully, including genuine Poppy crafting and receiving gifts.

## Actual art and accessibility

Each unique object is drawn into the playable Canvas2D residence or Cottage on its own shaded wall cabinet, with a carved wooden frame, colored felt backing and miniature handcrafted illustration. No external icons, images or screenshots are substituted for an actual game object. The currently owning home, not the originating home, draws the object.

A new illustrated **✦ The Heirloom Cabinet** book is accessible through the existing village menu, Cottage Daybook and resident household Daybooks. It shows available real memories to commemorate, eligible actual makers, unfinished project progress, each currently owned object, possible real receiving residents in other homes, and the last four creation/gift events. Buttons have large touch targets, visible keyboard focus and small-screen/reduced-motion support.

## Code, saves and QA gates

- \`heirlooms-v2537.js\`: safe source/actor/owner validation, genuine craft completion, optional real schedule queue, one-of-a-kind object ownership, day-limited gifts, persistent provenance, legacy comfort and five original Canvas illustrations.
- \`heirlooms-v2537.css\`: colorful, touch-first legacy cabinet with usable narrow layouts and focus support.
- \`game.js\`: safe optional save defaults/import, real **Poppy Cottage**, guided resident, autonomous resident and successful Hobby Studio completion hooks, actual wall art in each kind of home, comfort and game menus.
- \`index.html\` / \`sw.js\`: versioned browser assets and fully offline precache for the new code and CSS.
- \`tests/heirlooms-v2537.test.cjs\`: **36 new regression cases**, target **554 total** (518 previous + 36), testing all item kinds, forged history, same-day safeguards, no duplication, crafting and moving Poppy items, no retroactive hobby, transfer limits, JSON save round-trip, Canvas art and iPhone offline.
- Previous genuine-action test fixtures updated with the non-paying heirloom observer, and v2.5.36's historical cache assertion follows current versioned offline cache IDs.

The existing local save key remains **\`hearth-harbor-save-v1\`**. The optional \`heirlooms:{items:[],pending:{},daily:{},makerDay:{},giftDay:{},history:[]}\` field is sanitized against known home IDs, actual characters, valid historic source keys/days, at most two objects per home, bounded stored item counts and history. Older saves have no fake heirlooms on first load; craftable sources are recovered from the user's real earlier Chronicle achievements.

**Release condition:** PR must pass JavaScript syntax and all automated regressions, then main-branch production QA and GitHub Pages deployment must succeed before calling this version live.

## Still outstanding / next to v3.0 Generations

Actual physical iPhone Safari screenshot QA at 320/375/390px, real tap/VoiceOver and fully decorated house layering, and long natural played crafting/gifting performance QA are still outstanding. Canvas operation tests check integration and invariants; they do not certify physical render quality.

This is a *real movable keepsake foundation*, **not** a claim of full v3.0 inheritance, legal succession, bloodline trees, child care or guardianship. Those require real family entities, reversible opt-in household transitions and much more detailed play. The agreed roadmap stop remains **completed v3.0**, for the user to review and redirect.

[Previous — Seasons of Life v2.5.36](SEASONS_OF_LIFE_V2536_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
