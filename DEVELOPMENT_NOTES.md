# Hearth & Harbor v1.5 — Little Households: development & QA

## Completed
- Resident state for all six neighbors (food, energy, social, fun), saved under the existing key.
- Needs change only as **in-game time** advances. They recover while neighbors participate in relevant activities and during self-care.
- Residents can temporarily deviate from scheduled routes to rest, visit the café, or seek company. Scheduled community meetings still take precedence.
- Mood appears in the People menu and relevant conversation and in-world icons.
- Distinct three-step aspirations for every villager. Helping costs player energy, advances once per in-game day, boosts friendship and resident needs, and completes with a 65-coin bonus plus a Town Stories entry.
- Community meeting interactions lift social/fun needs for participating neighbors.
- Existing saved progress and v1.4 friend relationships remain compatible. Imported values are clamped and sanitized.

## Testing (headless Chromium, 390×844 emulated mobile viewport)
- 13/13 isolated-browser integration checks passed, including menus, needs, older saves, mood, aspiration progress, finding a neighbor, dream completion, journal, and persistence.
- Zero JavaScript exceptions in the test harness.
- Syntax validated with `node --check`.

## Limits
- This is a lightweight life-simulation layer, **not** full autonomous households, marriage, children, careers, or elaborate NPC decision-making.
- No simulation when the game is closed.
- Mobile testing is Chromium emulation, not physical iPhone Safari.
- Further art, narrative variety, progression balancing, and device performance work are needed.
