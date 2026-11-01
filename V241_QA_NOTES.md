# Hearth & Harbor v2.4.1 — Shared Moments: QA and development notes

## Completed
- Date destinations remain physical in-world routes. Both characters must arrive before the next step appears.
- A new illustrated, responsive Shared Moments dialog allows the player to choose **Listen**, **Laugh**, or **Thoughtful Surprise**.
- All six neighbors have personally authored responses and favorite types of date moments; each also has a preferred location.
- The choice and favorite location affect chemistry, friendship, and needs; choosing a nonfavorite still grants progress.
- Date outcomes and their quality are validated and persisted in the existing save format without resetting earlier data.
- Outcomes appear in the Hearts notebook and can be recalled through the conversation menu (Feelings → Remember together).
- Exiting before choosing never consumes the daily date or awards rewards; closing the X safely cancels the outing.
- Existing home routines, cooking, and town navigation remain available.

## Validation
- 26/26 browser assertions passing in mobile-sized Chromium, no JavaScript exceptions.
- Browser tests cover: arrival gating, illustration rendering, outcome quality, partner state and romance save migration, cancellation, daily limits, memory recall, the 12 recipe cards, residence entry, and four screen sizes.
- JavaScript syntax passes `node --check`.
- GitHub commits verified on `main`. At time of initial verification GitHub Pages still displayed the previous release title; allow deployment to finish and test physical iPhone Safari separately.

## Known limitations
- Date scenes are framed pixel illustrations within a modal, not unique cutscene animations.
- Dating remains optional and player-directed; there are not yet autonomous romantic choices, marriage, or family mechanics.
- Physical iPhone Safari QA not yet performed.
