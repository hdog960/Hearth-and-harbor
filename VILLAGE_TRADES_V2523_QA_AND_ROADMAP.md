# Hearth & Harbor v2.5.23 — Little Trades & Kindness

## Why this is a major step beyond cosmetic cooking updates

The Living Village had seasonal stories, festivals, the museum, and relationships, but its ordinary shops lacked a durable, player-driven daily work loop connecting the household's real food and supplies with villagers' day-to-day lives. This milestone introduces three original, hands-on shop commissions with different requirements, controls and rewards, instead of another collection of passive menu checkboxes.

## New playable system

The **Village Trades board** is a real illustrated sign at world coordinates (479,957) near the market approach. Tap it to walk up and browse the work journal, or open Village Trades from Menu, Journal, and Town Hall. Choosing a job from the ledger walks Poppy to the real shop's walkable approach. Rosie's and Oliver's existing shop interfaces also link to their commissions. Talk directly to Rosie, Oliver or Bea while in town for a work invitation.

- **Rosie — Pack an orchard delivery.** Supply **two real ingredients** from the current Hearth Kitchen pantry, chosen from berries, apples, carrots or herbs according to the in-game day and season. Then sort three different crate positions according to Rosie's displayed packing sequence. The original SVG crates visibly fill with the actual chosen goods. Payment: 22 coins, +4 friendship, +7 Fun, +5 Social, once per in-game day. Ingredients are consumed only when the complete correct delivery is committed.
- **Oliver — Wrap a homemade plate.** Choose a **real cooked dish** from the existing saved-dish shelf, with its exact recorded one-to-three-star quality; decorate a paper parcel through three distinctive fold/ribbon/seal actions, rotating deterministic orders by day. Payment: 25 coins plus 4 coins per dish-quality star, modest needs and friendship. The chosen dish is consumed exactly once, and only at successful completion; incomplete wrapping cannot duplicate dishes or earn cooking XP.
- **Bea — Paint a village welcome card.** Follow a three-color seasonal composition drawn directly onto an illustrated original paper card, choosing among rosy pink, sage green, honey gold and harbor blue. Art supplies cost **six coins only at successful completion**; payment is 22 coins, so the maximum net is 16. Each choice visibly changes the card.
- Choices can be wrong without losing ingredients, plates or coins; each mistake modestly lowers the craft's visible star rating, but no one loses the ability to succeed.
- All three have unique interactable arrangements, not identical progress bars with new titles.

## Save, economy and earned keepsakes

The existing local save key remains \`hearth-harbor-save-v1\`. Only one optional \`villageTrades\` record is added, with strict sanitization of previous/imported data:

\`{daily:{},totals:{rosie:0,oliver:0,bea:0},memories:[]}\`.

The system validates known characters, safe in-game day keys, legitimate recipe IDs, star bounds and capped histories. Every reward is guarded by both the active session and a once-per-character/per-in-game-day completion record, validated again immediately before items or coins are changed. **No payment is available for replay on the same in-game day**, including after save/reload. Closing or leaving a worktop does not spend resources. The regular pantry, cooked-food shelf, coins, needs and existing relationships are the authoritative resources; there is no parallel currency or substitute ingredients. The art module is self-contained, no external downloads or libraries.

On the **third completed commission with any shopkeeper**, a permanent hand-painted ribbon becomes visible on the illustrated Village Trades sign, and an achievement message appears at completion. The daily ledger remembers work with a small readable log. Additional completions increase the shopkeeper's permanent count without infinite first-time ribbons or bonus coin farms.

## QA and files

- \`village-trades-v2523.js\`: canonical rules, seasonal offers, illustrated minigames, scoring, fulfillment, safe record migration, physical board drawing and UI routing.
- \`village-trades-v2523.css\`: responsive storybook commission and ledger interface, original illustrated SVG stages, large tap controls, reduced-motion and focus-visible styling.
- \`game.js\`: safe saved record; module setup; physical sign; NPC dialogue, real Café/Market, Menu/Journal/Town Hall routes.
- \`index.html\` / \`sw.js\`: v2.5.23 asset versions and complete offline precache.
- \`tests/village-trades-v2523.test.cjs\`: **21 new regressions**, in addition to the existing 168, targeting **189 tests**.

The new tests cover seasonal determinism; empty/dirty save imports; actual stock and dish consumption; money, quality and social rewards; non-paying incorrect choices; interrupted jobs; invalid plate indices and import handling; end-of-job inventory revalidation; daily save/reload anti-farming; permanent ribbons; physical sign Canvas2D; all linked menus and modules; offline loads and small-screen presentation.

**Automated quality is not an iPhone visual audit.** Physical iPhone Safari 320–390px viewing, VoiceOver interaction, pathfinding access to the market sign/shops, save export/import, frame time and screenshots remain unverified. Do not claim the entire art/style overhaul is complete.

## Next development in this longer session

**Quality/balance follow-up:** the older unlimited instant Café work shift remains in v2.5.23 and should be converted into a real playable shift with a safe daily payout cap, without breaking quests. Also audit garden harvesting (currently repeatable without an in-game time delay) and provide fair optional ways to earn coins. These need explicit balancing rules and tests, not silent nerfs.

**Longer-term bridge to v3.0:** occupation identity and rotating inventories, more household/village connections, real caregiving and multigenerational stories. Then phased v3.0 Generations: optional aging, family trees, kids/elders, memory and property continuity, and save migrations.

**Owner stopping rule:** finish the major v3.0 milestone, pause development and request owner feedback before choosing post-v3.0 direction.

[Previous: Living Worktops v2.5.22](LIVING_WORKTOPS_V2522_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
