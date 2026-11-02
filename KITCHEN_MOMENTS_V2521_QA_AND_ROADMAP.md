# Hearth & Harbor v2.5.21 — Kitchen Moments

## Purpose
Follow the approved quality-first roadmap immediately after v2.5.20 Kitchen Polish. Players had to complete each cooking step with no visible assessment: the next minigame appeared instantly, and the final three-star plate gave no details about how individual techniques went. This release addresses feedback and clarity without expanding the economy, adding repetitive recipes or claiming to provide a complete visual art overhaul.

## What changed
1. **Clear acknowledgment between steps:** On steps two onward, a restrained warm ribbon shows the name of the technique the player just completed, a supportive note and a one-to-three-star grade. No modal, forced delay or extra tap interrupts cooking.
2. **Truthful plate recap:** Once the existing recipe finishes, the plated result includes every actual technique in its original order. Each row uses the genuine session score and displays the matching assessment, making strengths and missed timing understandable.
3. **Mobile-first design:** Feedback is compact enough for 320–390px layouts, with responsive typography, readable backgrounds and decorative motion that is disabled when reduced motion is requested.
4. **Existing results remain intact:** Technique grades are explanatory only. Three-star technique: score at least 90; two-star: at least 73; one-star: below 73. The previously existing *whole-plate* average and quality thresholds are unchanged: plate three stars for average at least 90, two stars for at least 73, otherwise one star. Prepared-food storage, hunger/Fun, recipe mastery, XP, favorites and family supper rewards use the unchanged logic.
5. **Accessibility:** The step feedback includes a readable status region and text grade; the final summary is labeled as a list with labeled star assessments. Neither depends on animation alone.

## Code and files
- `kitchen.js`: transient score explanation, previous-step acknowledgment, plated technique journal.
- `kitchen-craft-v2519.css`: compact feedback ribbon, result breakdown, small-screen and reduced-motion styling.
- `tests/kitchen-feedback-v2521.test.cjs`: seven regression tests.
- `index.html`: bump static cache-busting query parameters, current browser title.
- `sw.js`: new v2.5.21 offline cache name.
- `game.js`: release identifier.
- `README.md`: feature notes and previous milestone history.

## QA checklist
- [x] Implementation uses the *same* cooking session and scores already recorded.
- [x] All 12 existing recipes and six touch-first craft worktops remain available and required.
- [x] No new persistent save fields, save keys, currencies, ingredient quantities or automatic refunds.
- [x] New tests exercise accurate 1-, 2-, 3-star plates; all-score breakdown; start-of-recipe clarity; cancel safety; XP/currency invariants; responsiveness.
- [ ] GitHub Actions JavaScript syntax and entire Node regression suite: confirm successful PR and deployment checks before calling published.
- [ ] Real rendered browser visual audit and physical Safari touch testing.
- [ ] 320/375/390px screenshot capture and VoiceOver validation.
- [ ] Long-session stability and save/export-reimport test on a device.

## Next priorities before v3.0 Generations
1. **Rendered/physical device QA** of cooking, furniture, scroll areas, NPC pathfinding and touch controls. Fix what actually breaks on a real phone instead of merely passing static CSS assertions.
2. **Deeper cooking feel**: original per-technique sound and illustrated ingredient change, consistent haptics where supported, and deliberately staged success reactions. Keep relaxed/tap accessibility and ensure each recipe retains its own identity.
3. **Stronger life simulation**: resident jobs and shops, optional richer household control, household-to-village tasks, meaningful decoration rewards, coherent autonomy, and a stable economy.
4. **v3.0 Generations (major phased release)**: optional aging, life stages, child-friendly parenting and mentoring, family trees, heirlooms, lasting memories, village time changes and thoroughly validated save migration.

**Owner's stopping rule:** pause at v3.0 for the owner's creative review. Do not set a post-v3.0 direction without input.

[Previous: Kitchen Polish v2.5.20](KITCHEN_POLISH_V2520_QA_AND_ROADMAP.md) · [Approved master roadmap](ROADMAP_V22_V30.md).
