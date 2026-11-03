# Hearth & Harbor v2.9.8 — Childhood Reunions

## Purpose

v2.9.7 brought the *physical* Friendship Corner into Maplewood, but while reviewing the running application integration, we found a genuine user-facing issue: buttons named `yn297-*` were not handled by `game.js`, which only forwarded `yn295-*` actions. This release **connects those real buttons** instead of describing an unreachable feature as playable.

The next meaningful Generations development is the **days after making a shared keepsake**, not more passive meters. This update gives Wren a non-rewarding, autonomous stop near the actual handmade sign. On an appropriate later day, Poppy can physically bring Pip to Wren and revisit the sign together. No new screen or extra navigation tab.

## What the player can actually do

- **Wren tends the real sign** during a morning-to-afternoon activity window (1–3 PM village time, after a legitimate Friendship Corner chapter exists). Wren changes direction and follows the same town pathfinder, obstacle checks and capped iPhone movement as the earlier child actor. The character carries a small, original pixel-drawn idea card when genuinely present at the sign; no substitute Wren duplicate is spawned.
- **Return with Pip** to the actual sign on a *later* in-game day after a completed club chapter. Poppy, Pip and Wren must all actually stand nearby. Inspecting the sign is safe and read-only; when the reunion is available, an optional **Reflect with Pip and Wren** button offers a short original conversation. The friendship conversation has two different authored choices.
- **Three differentiated follow-ups**: The Map Still Has Room (stories), Our Changing Colors (painting), and The Meadow Keeps Growing (nature). All are grounded in the *actual previously selected* club chapter; each adds its own colored thread details to the real sign and one accurate dated Connections Atlas record, with changed later Wren dialogue.
- Revisit stories are earned only on valid later days in chapter order. A second visit on the same day, invalid answer, absent Pip, distant player, conflicting childhood project, canceled dialog or room change records nothing. **No passive friendship, coins, joy, adult romance or artificial family history.**

## Safe records and compatibility

Use the existing `hearth-harbor-save-v1` storage. An optional `youngResidents.wren.club.revisits` bounded list (maximum three) contains a validated `{kind,day,choice}` receipt for each completed chapter, with evidence drawn from the already validated club chapter sequence and date. This lives beside the v2.9.7 three verified foundation receipts and real club chapters; it does not replace the ordinary 48-entry child friendship scrapbook. Old saves migrate with `revisits:[]`. Original activity completion always preserves the club and reunions.

The project remains free, offline, iPhone-browser-first, using existing Poppy/Pip/Wren characters and 2.5D pixel artwork.

## Code and regression checks

- `wren-neighbor-v295.js`: normalized chapter-driven revisit records, eligibility based on real co-presence, authored two-choice follow-up conversations, independent short sign-care routine, original world gesture and chapter-specific stitched results
- `game.js`: **fixes v2.9.7 button forwarding**, also handles `yn298-*`, and draws the original Wren gesture in the actual town rendering path
- `family-atlas-v271.js`: adds honest, adult-safe peer reunion records derived only from normalized club data
- `index.html` and `sw.js`: refreshed v2.9.8 iPhone Home Screen assets and offline cache
- `tests/wren-childhood-reunions-v298.test.cjs`: genuine child physical co-presence, calendar checks, old and malformed save migration, rejected forgery and stale states, read-only inspection, painted-world details, v2.9.7 button regression, render integration and no passive reward or new service
- Preserve all existing Node regression suites; require JavaScript syntax checks and `node --test tests/*.test.cjs` on GitHub Cozy QA before merge

**QA limitation:** passing tests and GitHub Pages deployment do not prove real physical iPhone Safari touch, VoiceOver, screenshot scale/depth, large multi-year saves or mobile thermal performance. These remain hands-on checks.

## Next toward v3.0

Continue strengthening *natural family dynamics* and thoughtful optional stage changes, ensuring they have grounded effects on characters and homes rather than multiplying journals or fake progress. **v3.0 is the user's creative review checkpoint**, not automatic permission to continue into v3.1.
