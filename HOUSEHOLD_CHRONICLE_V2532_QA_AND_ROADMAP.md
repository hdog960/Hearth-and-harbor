# Hearth & Harbor v2.5.32 — The Household Chronicle

## The purpose: continuity, not another disposable reward list

Hearth & Harbor already supports genuinely completed shared projects, home/town traditions, family suppers, residents moving in together and individual handmade keepsakes. Until now, many of those memories lived in separate short-lived menus; there was no single durable household history for the eventual **v3.0 Generations** project.

**Household Chronicle** provides a history book for **Poppy’s cottage and all six neighboring residences**. It recovers real dated events from compatible *existing saved data* and archives new ones as they happen:

- **Moving in together:** reads actual prior \`householdMoves\` records; no fabricated move events.
- **Working as a household:** reads completed two-person \`roommateProjects.history\`, including the actual completed project and participants.
- **Family suppers:** reads true \`familyTable.memories\`, for both Poppy and occupied residences.
- **Meaningful traditions:** reads the three multi-chapter \`homeTraditions\` stories that were genuinely finished.
- **Personal keepsakes:** reads residents’ genuine Personal Corners memories only when the relevant furnishing-based milestone was earned through at least three authentic daily contributions.

The journal differentiates categories and writes warm contextual descriptions based on actual named residents, days and completed achievements. These events persist when residents move away; a home retains a record of its history instead of losing it with the old occupants.

## Meaningful interaction with the physical house

From the Household Daybook, Menu or Journal, select **📖 Household Chronicle**. Switch among the cottage and six residences, browse the saved dated moments, and **choose up to two memories to display** per home. Their actual original illustrated frames appear on the **real Canvas2D room floor** as small standing scrapbook photographs, differentiated by event kind and stamped with the correct in-game day.

- One pinned memory = **+1** genuine home comfort, two = **+2** maximum, under the existing 100-point comfort cap.
- Display choices are free and completely optional. Removing one from display frees the slot without deleting the original history. You cannot display a memory belonging to another house or one that has never actually happened.
- Moving residents or changing routines does not erase historical stories or automatically grant rewards.
- No coins, cooking dishes, items, XP, relationship points, passive cash or background advancement come from opening/pinning/reading the book. It does **not** add aging, child characters or inheritance prematurely.

## Save migration and technical design

The storage key remains **\`hearth-harbor-save-v1\`**. The new optional \`householdChronicle:{events:[],pins:{}}\` is sanitized for seven real home IDs, five legitimate event categories, known actor IDs, bounded day, safe source keys, correctly shaped event types, and at most 60 dated events per home and two pins per home.

On first Chronicle viewing or residence entry, the game **reconciles previously earned data** from the prior module archives. This is non-destructive and idempotent: old saves immediately show earlier authentic milestones without asking the player to repeat them. Actual new first-time home completions, studio work and housing moves also reconcile the history while the real action owns its ordinary save transaction.

### Files

- \`household-chronicle-v2532.js\`: clean/sanitize, historical backfill, record/dedup/bounds, pinning controls, warm scrapbook UI and distinct original canvas photo display.
- \`household-chronicle-v2532.css\`: illustrated responsive journal with real action buttons, 320–390px friendly layout, keyboard focus and reduced-motion support.
- \`game.js\`: optional safe save, entries from Daybook/other navigation, backfill at genuine housing and room activity points, real world art in both cottage and residences, comfort.
- \`index.html\`, \`sw.js\`: version 2.5.32, early module load and offline precache.
- \`tests/household-chronicle-v2532.test.cjs\`: **24 new regression checks**, expected full suite **390/390** (366 prior + 24).
- Historical tests updated for the current service-worker cache and newly observed non-rewarding Chronicle hook.

### Quality gates and limitations

The full automated GitHub Actions suite and JavaScript syntax check must pass before merge, then production main QA and GitHub Pages deployment must succeed for this version to be live.

**Still outstanding:** actual physical iPhone Safari touch, landscape, full visual screenshots, VoiceOver, layout with many existing earned decorations, and a naturally played 30-minute household session. Automated Canvas2D method tests check the renderer path and correct types, not visual quality on a real phone. Full v3.0 readiness also requires deeper family relationship and life-stage foundations; the Chronicle is a **pre-Generations history layer**, not a claim that Generations is finished.

### Roadmap toward v3.0

Build future opt-in Generations phases on top of true saved memories and actual household membership: detailed family connections/lineage, child-appropriate care and mentorship, gentle optional aging and stage-appropriate routines, property/heirloom transitions, and village continuity. No forced family expansion or coercive romance, and retain original saves. **Stop at the completed v3.0 milestone for the owner's creative review** before setting a new roadmap.

[Previous: Personal Corners v2.5.31](PERSONAL_CORNERS_V2531_QA_AND_ROADMAP.md) · [Approved roadmap](ROADMAP_V22_V30.md).
