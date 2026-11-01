# Hearth & Harbor v2.5.6 — Together in Maplewood

## Scope and creative intent
This milestone expands v2.5.5 Festival Days into the **social life** of the village. It is a playable but deliberately *non-final* slice of v2.5 Living Village. It does not replace the complete v2.5 roadmap or v3.0 Generations roadmap.

## Gameplay in this release
- The Community Scrapbook is accessible from **Menu → Together in Maplewood**, **Journal → Community Scrapbook**, **Town Hall → Festival Friends**, and **Festival Calendar → Meet the festival hosts**.
- During festival days **3–5** of each seven-day season, select **Go meet** next to a host. The game brings the player back to Maplewood and uses the existing walking/pathfinding logic to approach that **actual resident**. Talk with the host and select **Help with the festival**.
- **Eight authored moments:** Spring — Mabel's Petal Garland and Bea's Dancing Petals; Summer — Finn's Harbor Bells and Jun's Wish Ribbon; Autumn — Rosie's Orchard Bounty and Oliver's Oven Chorus; Winter — Jun's Star Quilt and Oliver's Cocoa Kettle.
- **Three genuinely distinct activity inputs:** color/pattern matching (Mabel, Jun), floating treasure target catching (Bea, Rosie), and timing/rhythm activities (Finn, Oliver). Each uses 4 short interactions and supports accessible large-button alternatives to timed or precise gestures.
- Each completed collaboration produces resident-specific dialogue and a 1–3-star keepsake; +4 friendship with that resident, +3 hearts, +9 Fun and +11 Social occur **once per host per festival cycle**.
- When both hosts of a particular season have been helped, the player earns that cycle's Community Portrait and a **one-time 12-coin** recognition grant. Replaying the activity is allowed but never farms benefits.
- The Community Scrapbook now retains a **recent-history archive** of up to twelve displayed moments, with seasonal descriptions and portrait markers.
- The plaza grows slightly more personalized as successful resident projects add ribbons and a framed community image. These are initial art additions, not production-quality festival scene overhaul.

## Data model and compatibility
- New optional top-level saved field: \`community: { moments: { "cycle:residentId": {stars} }, portraits:[cycle] }\`.
- Core \`cleanSave\` validates through \`window.HearthCommunity.clean\`; earlier saves default to empty festival history. Bounds, allowed residents, cycle/season matching and star ratings are validated on import.
- Existing save key remains \`hearth-harbor-save-v1\`, with no wipes or schema replacement.
- \`community-v256.js\` loads **before** \`game.js\`. \`sw.js\` precaches new JS and CSS under cache version \`hearth-harbor-v256-together-in-maplewood\`.

## Automated verification
- The 11 browser JavaScript modules all passed syntax checks.
- A controlled JS harness completed all 8 collaboration scenarios over four seasons at 3-star quality and repeated every activity with **no duplicate rewards**. It verified all four seasonal portraits, a total 48-coin portrait payout, expected saves and archive content.
- The permanent Node test suite lives in \`tests/community-v256.test.cjs\`; run it with \`node --test tests/community-v256.test.cjs\`.
- GitHub Actions workflow \`.github/workflows/cozy-qa.yml\` runs \`node --check\` and the Node regression suite on pushes and pull requests. The first workflow run completed successfully: https://github.com/hdog960/Hearth-and-harbor/actions/runs/41338595853.

## Known limitations and QA honesty
- **No physical iPhone Safari test** completed here; touch reachability, safe areas, real-device performance and frame rate need confirmation.
- Tests for the mini activities use simulated interactions, not a full integrated screenshot-driven browser playthrough.
- Festival crowds, market stalls, ambient audio, bespoke choreography and interactive village decoration remain future work. All original artwork is still in development.
- The Community Portrait image is a small painted in-world motif and a scrapbook state entry, not a full character-portrait illustration.
- Although existing save fields are preserved, export a backup before extensive beta testing or clearing Safari data.

## Next development priorities
1. Fully animated festival crowds and bespoke resident interactions without overly taxing iPhone rendering.
2. Meaningful community projects and errands that change actual shops, gardens, plaza and streets rather than just unlocking journals.
3. Seasonal food specialities that connect the **existing** 12-recipe cooking system, with more distinct cooking mechanics—not a replacement minigame.
4. More comprehensive iPhone viewport/touch tests; safeguards for scene navigation when running activities.
5. Advance environmental art, pathways and distinct neighborhood destinations, while respecting the deliberate long-term v2.5/v3.0 roadmap.
