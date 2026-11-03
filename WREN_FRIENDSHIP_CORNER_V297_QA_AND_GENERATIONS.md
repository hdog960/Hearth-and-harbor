# Hearth & Harbor v2.9.7 — Friendship Corner

## A visible friendship built through real days

Pip and Wren now have an optional three-chapter **Friendship Corner** in the real Maplewood town—not a detached collection of menu counters. Each chapter results in a permanently visible, original pixel-art panel at a shared neighborhood corner near Bea's art lane. These are a paper map, a painted friendship stripe and a gentle meadow emblem. Each completed chapter changes the physical pennant; the finished sign gets a little handmade star.

The three stages are **A Place for Our Stories**, **Colors We Choose Together**, and **A Promise to the Meadow**. Each has its own two authored opening decisions and two different meaningful endings. The choices affect the colors and details of the real-world art. The player can later tap the physical sign, walk to it, and read the actual remembered choices and dates without gaining free rewards.

## How a player earns a chapter

- First build a genuine Wren–Pip friendship: at least **three distinct completed child outing days**, including **two different activities**.
- The chapter must be backed by an **earlier completed outing of that specific kind**; the current day's outing cannot substitute for the earlier inspiration.
- Bring Pip to the actual Wren sprite around the art lane or meadow, **complete the day's normal real two-stop outing first**, then tap Wren again. The new friendship-project invitation appears only when both children and Poppy are present, free to participate, and near the physical project site.
- Choose an actual opening idea. Then follow the visible, distinct project marker to the in-world Friendship Corner with Pip. Only when Poppy and both actual children are physically nearby can the final dialogue and handwritten keepsake be recorded.
- **One chapter per separate in-game day**, sequentially in the three original kinds. Replays, conversations, touch callbacks, opening a modal, leaving town, being too far away, or entering an invalid response never award a club chapter.

The resulting handmade pennant is a quiet long-play reward, not a paid collectible, autoplay reward or passive XP farm.

## Save design and independence

The original `hearth-harbor-save-v1` key stays intact. The optional normalized `youngResidents.wren.club` field contains at most three dated sequential chapter receipts and three bounded founding friendship receipts. Each chapter preserves a source receipt from a real earlier completed outing, so the sign will not disappear after the main peer friendship history exceeds its original 48-entry cap. Unsupported kinds, out-of-order chapters, duplicate or invalid dates, malformed choices and missing foundational evidence are rejected. Older saves begin with empty chapter and foundation lists. Finishing another standard Pip/Wren outing preserves existing club records.

Nothing creates a new adult resident, adoption, marriage, household, economy, school, paid service, player account, secondary save key or automatic family connection.

## Implementation

- `wren-neighbor-v295.js`: three authored chapters, normalized save provenance, grounded co-presence and arrival gates, world marker, staged original pennant artwork, read-only sign inspection and the existing Wren Daybook integration.
- `game.js`: includes the physical sign in the town Canvas, checks its touch hitbox before ordinary world actions, preserves the existing save key, and routes inspection through real player walking.
- `family-atlas-v271.js`: independently reads only validated completed club receipts to show dated peer project moments, without false family or adult links.
- `index.html`, `sw.js`: v2.9.7 assets and updated Home Screen offline cache.
- `tests/wren-friendship-corner-v297.test.cjs`: choices, physical completion, chapter prerequisites, origin preservation, rollover, sign art, old saves, anti-farming, interruption, Atlas and mobile integration. Run **all** existing tests and JavaScript syntax checks before merging.

## QA / Future Generations

GitHub Cozy QA must pass on the PR branch before release, followed by verification on the main branch and GitHub Pages publishing. Physical iPhone Safari gameplay, art depth, collision around the physical sign, touch selection, reduced-motion and VoiceOver remain user-device QA; automated source tests must not be represented as real iPhone QA.

Next priorities toward the user's **v3.0 creative review checkpoint**: further independent child peer-life expression and family routines; cautious optional stage changes that visibly affect households; preserve the warm 2.5D art direction and backwards-compatible saved lives. Stop at v3.0 for user creative review.