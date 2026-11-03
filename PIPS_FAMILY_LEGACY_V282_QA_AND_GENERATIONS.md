# Hearth & Harbor v2.8.2 — The Little Legacy Shelf

## True continuity between adult households and Pip's childhood

Three original handmade family heirlooms now connect **completed three-act Home & Town Traditions**, **Pip's real childhood memories**, and **Poppy's existing physical timed household Daybook routines**. This is not an instant menu minigame. To earn a keepsake, a player must have genuinely completed the original adult tradition, helped Pip complete appropriate earlier childhood experiences, and physically visit Pip in the playable cottage. Poppy must then walk to the actual furniture and finish the normal timed action with Pip participating. Only the original household-completion callback awards the heirloom.

### The three heirlooms
- **Welcome Ribbon** (🌷) — the original adult Welcome House tradition; two different genuinely met Maplewood neighbors for Pip; earned Growing Child milestone; finish a real Tidy home activity.
- **Sunday Recipe Card** (🥧) — the adult Sunday at the Table tradition; Pip helped Poppy with a previously completed genuine Meal action; earned Growing Child milestone; finish another real Meal activity.
- **Orchard Window Print** (🍃) — the adult Roots by the Window tradition; two completed Pip nature-learning sessions; earned Independent Child milestone; finish a real Hobby activity.

Each completed item appears as distinct original chunky-pixel artwork in a physical wall frame in Poppy's playable 2.5D cottage. Each adds only +1 home comfort (existing global 100 cap), +5 to the appropriate child need, and +2 Joy one time. No passive income, money, forced childhood aging, fabricated school, biological kinship or extra legal parentage.

### Actual interface and memory history

The illustrated Little Legacy Shelf is available from both Poppy's own Daybook and the main game menu, as well as Pip's Daybook. It shows precise status of the adult tradition, child experience and age stage. Starting requires the player genuinely beside Pip in the cottage. A planned child keepsake is session-only and the game checks the real Poppy Daybook queue. Clearing or interrupting the queue, leaving the cottage, changing game days, losing prerequisites, completing an unrelated action or repeating the task cannot generate a false reward. Pip visibly joins the actual furniture during the true timed activity.

The Connections Atlas records only the *genuinely completed* intergenerational memories, never a new legal guardian, biological parent, spouse or adult job. Earlier household gameplay, all adult villagers and relationship systems and all Pip activity, dream, guide, growth and adventure systems remain unchanged.

### Safe existing save migration

Save key remains **hearth-harbor-save-v1**. One optional **youngResidents.pip.legacyKeepsakes** list preserves at most three validated key, day and action receipts; prior saves start with an empty list. The actual completion day, legitimate prior adult tradition and Pip's original guardian and stage dates are checked before the reward is displayed or adds comfort. Older genuine childhood activity histories can naturally roll off without erasing already earned permanent decorations.

### Source and release QA

- pip-legacy-v282.js: three linked traditions, earned child prerequisites, genuine Daybook queue, physical child participation, real completion and cancel guards, safe persistence and separate world art.
- pip-legacy-v282.css: illustrated mobile shelf, large touch targets, keyboard focus and small-iPhone styles.
- little-sprouts-v272.js: safe old-save migration, live child pose, Daybook, action handling and queue observer.
- game.js: original physical household completion hook, direct menus, permanent room frames and small home-comfort integration.
- family-atlas-v271.js: truthful real shared tradition events without fictional family edges.
- index.html and sw.js: v2.8.2 iPhone script order and new offline precache.
- tests/pip-legacy-v282.test.cjs: original three-act tradition integration, true household completion, old saves, invalid/distant/canceled actions, bonus bounds, artwork and PWA checks; whole earlier Node suite remains mandatory.

**Limits:** Automated JavaScript syntax and Node tests must pass before merge. Live GitHub Pages propagation, Safari touch/Canvas rendering, 320/375/390px screens, VoiceOver, browser old-save reload and long physical play sessions still need independent verification. Passing CI alone does not prove those.

### Generations roadmap
Meaningful connections and real shared play between existing adults and Pip are a foundation, **not** complete v3.0. Next enhance actual household coactivities and town-based family life, bespoke original character animation, later opt-in life stages, additional genuinely implemented younger residents and, eventually, truthful optional succession/inheritance without inventing ancestry or neglect mechanics.
