# Hearth & Harbor v2.5.30 — Shared Scenes

## Visual continuity, not an unrelated screenshot

v2.5.29 introduced genuine two-resident projects but did not express their active progress in the **playable world** beyond a project book and the finished shelf keepsakes. This release adds dynamically drawn, original illustrated project environments and activity badges inside the actual Canvas2D residence scene.

- The **breakfast project** now displays a wooden breakfast work area with pastries, tableware, tea and steam.
- The **storybook project** displays an illustrated open book and creative corner.
- The **evening project** displays a softly glowing lantern, warm lamp and surrounding decor.
- Each project displays two distinct contribution markers, changing as the actual residents complete their tasks.
- When a resident actually starts their **timed in-room activity**, a small progress badge follows their actual world coordinates. The indicator uses the genuine `roomAutonomy` state or directly guided `householdHold` state, with no fabricated completion percentages.
- If both residents are performing their matching tasks, both are represented; if an activity is paused, canceled or changed, its live progress indicator disappears. The previously earned permanent keepstakes remain on their true house wall shelf.

The drawn objects are original lightweight Canvas2D shapes, not external pictures, fake menu icons, loading assets or a replacement of the game. The director makes no changes to persistent state, needs, coins or XP, and does not complete tasks. The old save key `hearth-harbor-save-v1` and existing v2.5.29 reward safeguards remain untouched.

### Files

- `shared-scenes-v2530.js`: purely visual projected real-action status, three original scene compositions, floor work area and character-following overlays.
- `game.js`: derives the visual state directly from real resident poses, live autonomy/hold timers and the existing roommate-project model; draws the stage below furniture and overlay above characters.
- `index.html` / `sw.js`: load and offline precache v2.5.30 renderer.
- `tests/shared-scenes-v2530.test.cjs`: 16 regression cases for visual truthfulness, scene variety, two simultaneous active actors, state immutability, real game integration, offline cache and correct draw layer ordering.
- Previous v2.5.29 tests recognize rotating cache IDs.

**Expected total automated checks: 344 (328 previous + 16).** The new art must pass full PR QA, be merged, and complete main-branch production QA and Pages deployment.

### Manual quality gates still needed

Physical iPhone Safari screenshot comparisons (320/375/390px), real touch/VoiceOver, performance over long household play, canvas stacking with different furniture and older decorated homes, character animation smoothness and overlap. Automated tests do not prove these. This phase improves the real playable renderer without claiming finished end-to-end visual quality.

### Next within the longer development session

The next task is to strengthen the identities and ongoing shared living preferences of the households, building on roles and projects rather than adding another unrelated menu. Follow afterward with gradual **v3.0 Generations**. **Stop at v3.0 for the owner's creative review**, as agreed.

[Previous release: Together at Home v2.5.29](TOGETHER_AT_HOME_V2529_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
