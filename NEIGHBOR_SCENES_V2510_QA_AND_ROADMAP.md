# Hearth & Harbor v2.5.10 — Little Moments Together

## Goal
This milestone connects **existing resident-to-resident bonds** with places the player has helped build. It complements (rather than replaces) the established Town Stories, scheduled visits, romance, marriage, household needs, and festival systems. Two **real** Maplewood neighbors now share an appointment at a completed town improvement, perform contextual animated activity and can invite the player into a brief jointly authored story.

## Four recurring scenes (requires the relevant permanent town upgrade)

| Story | Residents | Built location | In-game availability |
|---|---|---|---|
| **The Poetry Garden** | Mabel and Jun | Blossom Promenade | Day 1 of every **even-numbered cycle** (cycles start at 0), 11 AM–3 PM |
| **The Lantern Workshop** | Bea and Finn | Lantern Plaza | Day 1 of alternating **odd-numbered cycles**, 11 AM–3 PM |
| **A Shared Orchard Table** | Rosie and Oliver | Orchard Cart | Day 6 of every seven-day season, 2 PM–6 PM |
| **Stories by the Water** | Finn and Jun | Lily Pond Deck | Day 7 of every seven-day season, 10 AM–2 PM |

The diary explicitly explains that the first two stories alternate rather than appearing in the same week. There are **no real-world timers, missed-for-good events, or paywalls**. Events recur after the seasonal cycle.

Residents navigate on the same map using the **existing NPC pathing/routine engine**; no duplicated NPC entities. Each pair has two different destination points and animated props (flowers and poems, lanterns, communal fruit basket, fish journal). A simple painted table and later an in-world framed-heart emblem celebrate completed social moments.

The social event runs only if both partners are free. The current major event hierarchy is preserved: **weddings, dates, promises, planned friend visits, active story meetings, urgent care/home needs, and other priority routines take precedence**. If one partner is busy, **neither** is reassigned to the shared outing. The Community Stories diary reflects when neighbors are busy.

## Gameplay
- Open **Neighbors Together** from Menu, Journal or Town Hall.
- See four project-dependent scene listings and the one scheduled today.
- During the available in-game window, tap **Go see** to walk toward the scene. Both NPCs must physically reach their gathering positions before the optional activity can be completed.
- Once they have arrived, choose from **two distinct story responses**. These total **eight authored outcomes** across the four places.
- Completing the scene updates the **actual existing** \`townBonds\` and \`townTensions\` for that pair. It also awards a small one-time increase to friendship with both NPCs, +2 Hearts, and modest Fun/Social.
- Replaying the same scene within a seasonal cycle cannot farm the reward. It becomes available again in a later cycle.
- If you talk to one of the relevant NPCs while the scene is scheduled, they can mention the outing, and the conversation offers **Join our shared moment**.
- The persistent **Shared Memories** journal collects the choices and outcomes. Completed scenes add a small memento to the corresponding in-world site.

## Data and compatibility
- Added module \`neighbor-scenes-v2510.js\` and styling \`neighbor-scenes-v2510.css\`, loaded before \`game.js\`.
- New optional save field \`neighborScenes:{completed:{"cycle:sceneId":{choice}},history:[{cycle,id,choice}]}\`; only allowed location IDs and option indices, bounded last 60 completions and 36 unique history entries.
- Continues unchanged **\`hearth-harbor-save-v1\`** browser save. Other households, cooking, festival market, construction, nature, marriage and NPC relationships are preserved.
- Offline worker cache becomes \`hearth-harbor-v2510-little-moments\`.

## QA and known limits
- Added \`tests/neighbor-scenes-v2510.test.cjs\` with **nine regression scenarios** covering pair scheduling, alternating seasons, upgrade gates, higher-priority events for either partner, physical NPC arrival, persistent social bonds, repeated-claim guards, data sanitization, original in-scene art commands, and module asset ordering.
- All scenarios are tested without extra packages using Node's built-in test framework; GitHub Actions also runs checks for every browser JS file and all previous release regressions.
- **Not yet physically tested** on iPhone Safari. Screenshots, NPC navigational reachability at all four sites, exact iPhone touch target feel, and frame-rate under village activity remain manual QA requirements.
- Scene art is a new illustration pass, not a full bespoke frame-by-frame replacement for the six NPC sprite sheets.

## Next development priorities
1. Rendered, screenshot-based QA and player navigation testing; repair any unreachable scene points or awkward screen overlays.
2. Richer paired choreographies, ambient voice-free reaction animation, more natural resident-to-resident behavior without scripted teleports.
3. Town shops, community votes and truly transformative village-improvement outcomes, with appropriate long-term balance.
4. Deeper cooking mechanics and distinct seasonal recipes using the existing Hearth Kitchen system, not menu-only bonuses.
5. Continue v2.5 Living Village before the much larger, quality-sensitive v3.0 Generations.

See \`ROADMAP_V22_V30.md\` and previous \`VILLAGE_LIFE_V259_QA_AND_ROADMAP.md\`.
