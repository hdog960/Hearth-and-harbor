# Hearth & Harbor v2.5.31 — Personal Corners

## Residents' taste becomes part of their home

The earlier household milestones added functional furnishings, autonomous habits, shared projects and permanent family mementos. This update gives each of the **six existing neighbors** a genuinely distinct relationship with their interior décor, favorite pastime and housemate.

| Resident | Favorite item (already purchasable) | Favorite genuine home activity | Original in-room detail |
|---|---|---|---|
| Mabel | Potted plant | Hobby | Living potted leaves / garden arrangement |
| Rosie | Cozy chair | Chat | Porcelain tea tray |
| Oliver | Soft rug | Meal | Handmade pastries |
| Jun | Bookshelf | Read | Open storybook |
| Bea | Fresh flowers | Hobby | Paintbrush and flower arrangement |
| Finn | Warm lamp | Tidy | Tiny handmade model boat |

Only a resident's **actual current home's purchased, placed furniture** counts. A random furniture purchase for an empty unit does not count as someone's personal taste. Homes with the corresponding resident and favorite item get **+2 actual home comfort for that resident**, maximum +4 per occupied two-resident home, under the existing 100 cap. Moving away or removing the furnishing instantly stops the display and the associated comfort; money/XP are never automatically generated.

### Genuine earned activity and permanence

Completing the matching resident's **first genuine daily in-home activity**, with the corresponding furnishing still actually placed there, grants +3 Fun to that resident and +3 Social to their housemate. This modest care reward is **one claim per resident per in-game day** even if that resident moves that day or repeats the activity through a different entry point.

Three valid days of matching activity in the same home earn that neighbor's **permanent handmade personal memento**. The memento is original Canvas2D artwork positioned right beside the *real favorite furniture placement*, not a fixed icon in a menu or detached illustration. The household Daybook now shows each resident's personal wishlist, furnishing match, genuine activity streak and recent personal memories. Changing the room arrangement naturally changes where the mementos appear.

A record may remain in the save when the furniture is removed or a resident moves, but the in-world accent and comfort require the resident/furniture pairing to remain eligible. This respects residential identity and encourages gradual customization without forcing daily chores.

### Hobby Studio integration fix

In the earlier v2.5.29 project, a hobby that was completed through the standalone **Little Passions Studio** minigame did not credit the “storybook” roommate collaboration. This release corrects that omission: successfully completed first daily studio hobby work now credits both the existing genuine roommate-project track and the new eligible personal-corner ritual. Repeat practice sessions and opening the minigame cannot duplicate any rewards.

### Compatibility and test coverage

- Storage key remains **`hearth-harbor-save-v1`**.
- New optional `personalCorners:{daily:{},counts:{},memories:[]}` field is safely sanitized on import (known residents/addresses, valid days, bounded counts and only the last 36 genuine-shaped memories).
- No new shops, currencies, ads, subscriptions, API costs or background timers.
- `personal-corners-v2531.js`: separate resident identity profiles, matching furniture eligibility, once-daily completion guards, original Canvas ornaments and integrated Daybook section.
- `personal-corners-v2531.css`: mobile-responsive illustrated resident cards, memory progress bars and readable narrow layouts.
- `game.js`: genuine guided, autonomous and studio completion observers; original placed-furniture Canvas art; dynamic home comfort; existing Daybook.
- `index.html` / `sw.js`: current iPhone offline scripts and stylesheet caching.
- `tests/personal-corners-v2531.test.cjs`: **22 new regressions**, total target **366** (344 + 22), covering identity uniqueness, all residence eligibility rules, migration, moving, daily anti-farming, multi-day keepsake progression, actual canvas drawing and complete connection to the game.
- Historical isolated manual-Daybook test now stubs the new observer.

**Release gate:** full PR test and syntax check green, then merged main-branch QA and successful GitHub Pages deployment. Automated tests cannot verify physical Safari painting, actual player gesture comfort, VoiceOver focus or visual layering. Those remain explicitly outstanding.

### Remaining road to v3.0

Move from individual and shared household life into the major **v3.0 Generations** experience in deliberate phases: family timelines and meaningful young resident care, optional aging/life stages, parent/child mentorship, branching memories and heirlooms, evolving villages and safe saved-home transitions. **Do not move past v3.0 before the user reviews and redirects the roadmap.**

[Shared Scenes v2.5.30](SHARED_SCENES_V2530_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
