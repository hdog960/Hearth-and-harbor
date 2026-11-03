# Hearth & Harbor v2.7.4 — Permanent Child Learning

This is a small quality and longevity follow-up to the v2.7.3 Pip's Living Day release. No unrelated features have been added.

## Fixed: earned learning cannot disappear
Pip's Daybook has three practice paths: Storytelling, Nature and Creativity. Each real three-part activity completed on a new in-game day increases the matching permanent count by exactly one. An incomplete/canceled activity, a Daybook view, or an optional bedtime ritual never changes those counts.

The older version derived learning entirely from a 40-memory rolling scrapbook. After many days, old memories could fall out of that capped history, unintentionally lowering earned mastery. v2.7.4 retains the bounded scrapbook (so saves do not grow forever) while separately preserving only three numeric lifetime counts, each capped at 999. The visible chapter ranks still unlock after 2, 4 and 6 days of actual practice.

### Save migration
The existing original save storage key hearth-harbor-save-v1 remains unchanged. New optional youngResidents.pip.skills data consists only of validated nonnegative, bounded integer counters. For v2.7.3 and earlier saves, the game rebuilds initial counters from valid distinct historical scrapbook days; this safely preserves every still-represented accomplishment. Future gameplay increments counters on actual completion, retaining mastery even after old scrapbook entries roll off.

Original residents, childhood activities, interactive night ritual, Pip guardianship, dating, marriage, optional aging and room inventories remain the same.

### QA
The full syntax and Node regression suite should pass before merge. Four additional tests cover real completion-only progress, migration, scrapbook rollover and tampered counter data. Asset versions and the offline iPhone service worker are rotated to v2.7.4, so cached games receive new save protection when the update is deployed.

Physical iPhone Safari screens, touch, VoiceOver and offline long-session testing are not verified by these automated checks.

The roadmap remains full v3.0 Generations: autonomous child routines, real child learning and growth systems, age-appropriate relationships, optional aging, additional younger residents and eventually property succession/inheritance.
