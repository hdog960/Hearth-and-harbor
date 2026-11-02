# Hearth & Harbor v2.5.34 — Passing It On

## Meaningful mentorship before Generations

This release introduces actual **hands-on learning between existing adult household residents**, not a made-up child, an instant skill menu or a passive timer. The four lessons use real existing household actions, with distinct learning stories: **Share a Story** (read), **Cook Side by Side** (meal), **Care for Our Home** (tidy), and **Make Something Lovely** (hobby).

Inside a two-resident home, open Household Daybook → **🎓 Passing It On · Mentorship** (also reachable via the village menu/journal). Choose a real resident to be the mentor, then choose one of four subjects. The residents must genuinely **complete two separate activities in order, on the same game day**:

1. The mentor performs their *real* selected action, with genuine in-room movement and timing, either manually guided, through their independent Daybook schedule or by successful Hobby Studio completion.
2. Only after that real action finishes does the learner's action become eligible. The learner then completes that same actual activity to earn a lesson.

The new book shows each step and lets players place the **next** activity into the correct resident's existing independent schedule; it never overwrites a full schedule, queues both residents prematurely or claims success when a menu was clicked. Players can guide either resident instead. Pausing, canceling, moving out mid-lesson, changing day or repeating completed work cannot fabricate an achievement. A deliberate **Set aside this unfinished lesson** control preserves previous skills and memories, and a demonstrated lesson cannot be accidentally replaced by a different selection.

## Skills with an actual lasting gameplay effect

A genuinely finished two-person lesson gives the learner **+5 Fun**, the mentor **+3 Social** and the pair **+1 bond**, all capped and only once per household per game day. The learning record is unique to the resident, not tied to a house: the learner keeps every skill after moving.

A learner earns **confidence ranks at 2, 4, and 6 completed lessons in the same subject** (no reward by merely choosing the lesson). On a later day, their **first real completed matching activity** grants a modest additional **+2 / +3 / +4 Fun**, depending on rank. Bonuses are non-passive, strictly once per resident per action per day, and not available on the very day a rank is first earned. Resident needs never rise above 100; no coins, items, experience points, market income, cooked dishes or automatic resources are generated. One completed lesson per actual home per day and one finished practice per learner per day prevent bouncing between homes to farm rewards.

A distinct original **illustrated wall learning-board** shows the currently selected subject and whether each person has genuinely completed their step in the playable 2.5D residence, not a promotional mockup or floating achievement icon.

## Code, migration, and QA

- \`mentorship-v2534.js\`: four lessons, true teacher/learner stages, real first-completion observer, capped life skills, safe same-day activity scheduling, intentional cancellation, compact family learning journal and illustrated Canvas2D chart.
- \`mentorship-v2534.css\`: iPhone-friendly visual book with readable touch buttons, clear task status, small screens, accessibility/focus and reduced-motion handling.
- \`game.js\`: optional strictly cleaned save state, connection to actual guided resident actions, autonomous action completions and successful Studio hobby completion, and real scene art/navigation.
- \`index.html\` / \`sw.js\`: load new assets before \`game.js\`, rotate browser asset versions and precache offline.
- \`tests/mentorship-v2534.test.cjs\`: **35 new regression cases**, target **452** total (417 prior + 35). Covers real two-phase completion, forged/moved/old-day actors, independent queue operations, multi-day rank progression, future-day needs, no duplicate income, original Canvas art, offline iPhone load order and actual game hooks.
- Historical older tests keep working by using rotating cache assertions and a non-rewarding mentorship observer stub.

The original storage key remains \`hearth-harbor-save-v1\` with an optional, sanitized \`mentorship:{sessions:{},skills:{},practiceDay:{},bonusDay:{},memories:[]}\` record. Older progress is kept intact. New pending lessons, learnt skills and the last 36 authentic-shaped learning memories have bounded save sizes. There is no silent conversion of unrelated social relationships into parenthood and no ages, children or unearned bloodline links.

**Release gate:** GitHub Actions full JS syntax + complete tests on PR, then after merge, green main-branch QA and successful GitHub Pages deployment. Do not claim physical visual QA: actual iPhone Safari 320px/375px/390px screenshots, VoiceOver/touch, performance with deeply decorated homes, and a 30-minute naturally played loop are still outstanding.

## Remaining Generations roadmap

Continue meaningful intergenerational care only once suitable younger characters and age-appropriate interactions exist; carefully design reversible opt-in aging, education/care, household transitions and inheritance using true learned skills and existing legitimate family data. Ensure the multigeneration progression has real playable content, not only a static family graph. **Stop at the finished v3.0 Generations milestone for the user's creative review** before choosing further work.

[Previous: Family Roots v2.5.33](FAMILY_ROOTS_V2533_QA_AND_ROADMAP.md) · [Master roadmap](ROADMAP_V22_V30.md).
