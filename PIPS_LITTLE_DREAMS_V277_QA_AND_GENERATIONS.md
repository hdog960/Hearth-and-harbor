# Hearth & Harbor v2.7.7 — Pip's Little Dreams

## A real long-term childhood aspiration system

Instead of adding another unrelated activity or passive upgrade screen, v2.7.7 connects **existing completed gameplay** into Pip's longer-term personal goals. The three optional dreams are **Keeper of Stories**, **A Heart for Home**, and **The Wonder Collector**. The player first has to become Pip's actual chosen guardian, be standing beside Pip, and decide together which dream to pursue. This choice is never automatic. Dreams may be switched without erasing completed chapters or farming a reward again.

### Six earned chapters, two per dream

**Keeper of Stories:** Earn "A Little Tale to Tell" by completing real Story activities on two distinct in-game days. Earn "The Storyteller's Star" through three Story days plus a genuine bedtime ritual and a completed two-step neighbor encounter with Jun.

**A Heart for Home:** Earn "A Helping Hand" after Pip participates in Poppy's genuine household tasks on two different days. Earn "Home's Little Hero" through three distinct home-help days, three kinds of real chores and a completed bedtime ritual.

**The Wonder Collector:** Earn "First Clover Trail" with two days of completed Nature activity. Earn "A World of Wonders" through three Nature days, finished encounters with two distinct actual villagers and one completed Art activity.

The rules are checked against the actual saved, bounded Story/Nature/Art session history, permanent validated skill practice counts, valid saved bedtime answers, actual completed home-help records and authenticated neighbor-meeting records. A menu open, unfinished activity, distant villager, future day or repeated tap never completes a goal. Existing real progress from earlier v2.7 releases is recognized so long-time players are not forced to repeat old work.

### World art and rewards
Each chapter is **celebrated only by an explicit nearby interaction** after all goals and prerequisite chapters are achieved. It records the chosen dream, chapter number and game day under Pip's existing save. A one-time bounded +5 Joy and +3 Confidence is granted on genuinely earned celebration; never coins or passive income.

A completed chapter adds an original little aspiration marker beside Pip's actual sprite. Completing both chapters of the current dream also renders a small handmade framed keepsake inside the **real playable cottage**, not an image pasted over the menu. The three dream themes use different colors.

A completed milestone also becomes a genuine dated family-memory **event** in the Connections Atlas, not a bloodline, wedding or automatic family connection.

### Save compatibility
The original \`hearth-harbor-save-v1\` key is unchanged. The new optional \`youngResidents.pip.dream\` stores only current dream, chosen day, and at most six small per-dream chapter receipts. Invalid IDs, stages and days are discarded on older save import. Earlier Pip childhood activities, guardian status, learning, neighbor walks, bedtime memories, household helping, family graph, adult jobs, spouses and income remain intact. The system does not add a fabricated school, automatic aging, biological parent or fictional guardian.

### Release QA
- \`pip-dreams-v277.js\`: evidence-derived dream goals and chapter progression, real proximity requirements, optional choice, one-time earned rewards, original Canvas character and cottage artwork.
- \`pip-dreams-v277.css\`: illustrated phone-friendly aspiration book and progress panels, >=53px touch targets, keyboard focus, reduced-motion support.
- \`little-sprouts-v272.js\`: optional dream import and initial save state, character badge, Daybook and action dispatch.
- \`game.js\`: genuine cottage Canvas keepsake and new version.
- \`family-atlas-v271.js\`: truthful dated childhood aspiration milestones.
- \`index.html\`, \`sw.js\`: v2.7.7 iPhone offline pre-cache and dependency load order.
- \`tests/pip-dreams-v277.test.cjs\`: new play/evidence gates, exact claim rules, previous-save compatibility, forged inputs, art and offline checks; the full earlier suite remains mandatory.

GitHub Actions syntax and full Node regression must pass before merge. Physical iPhone Safari screenshot, live Pages deployment, touch accuracy, narrow-screen/VoiceOver and long-session QA remain separate and unverified by automated checks.

### Next real Generations development
The dream system is a **foundation**, not a completed child development, school, age progression or family succession game. Future work should add grounded, visible daily autonomy for the child, optional growth stages and actual neighborhood learning spaces before broadening to more young residents and multigeneration inheritance. Preserve adult/child separation, voluntary care, compatibility, original illustrated world art and balanced longevity.
