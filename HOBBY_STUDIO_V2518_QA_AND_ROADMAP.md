# Hearth & Harbor v2.5.18 — Little Passions Studio

## Why this milestone matters
The long-term target is a coherent, cozy, **Sims-style household life game with an Animal Crossing-style village**; we are working toward the major v3.0 Generations milestone, after which the owner wishes to decide the next direction. The existing six resident hobbies previously shared one generic timed household hobby interaction, even though all six had authored identities and furniture favorites. **Little Passions Studio** makes those identities playable through different interactions while respecting the original household system.

## Six genuinely different resident hobby activities
Players visit an occupied real NPC home, open **Daybook → Little Passions Studio** (or Menu while visiting), choose someone currently residing there, and walk to their actual hobby station before the activity starts. All six activities work on iPhone touch controls:

| Resident | Hobby | Player interaction | Steps |
|---|---|---|---|
| Mabel | 🌷 Bloom by Bloom | Tend a flower through soil → seed → water → sunlight in the right sequence | 4 |
| Rosie | 🍓 Market Basket | Sort apples, strawberries and lemons into their matching produce crates | 3 |
| Oliver | 🥐 A Perfect Pastry | Perform a short, structured fold / press / turn kneading pattern | 5 |
| Jun | 📖 Choose the Chapter | Make three branching narrative choices that create a personalized little story | 3 |
| Bea | 🎨 Tiny Color Study | Choose a pigment, then paint the corresponding square on a four-part landscape | 4 |
| Finn | 🎣 Little Lure Workshop | Follow the left-loop / right-loop / secure-knot weaving sequence | 5 |

This is not six instances of one multiple-choice question. Each activity has its own interaction state machine; painting requires separate palette and canvas taps, storytelling offers valid authored narrative branches rather than a single correct answer, produce sorting requires matching the real fruit to a crate, and the hands-on sequences have distinct rhythms and steps.

Every minigame is self-contained, low-pressure, accessible via large touch controls and **does not consume coins, pantry ingredients, or real money**. Wrong choices offer a gentle retry without punishment. The user may leave without gaining an incomplete reward.

## Full integration into the real world and daily household progression
- **Poppy approaches the hobby station in the existing residence world through real navigation**. The activity does not progress without a completed arrival callback. If the studio station cannot be reached, the session is abandoned rather than granting a reward.
- The player is switched back to Poppy if currently manually guiding an NPC, avoiding duplicate controlled character artwork.
- A successful minigame calls the existing resident hobby completion pathway rather than minting a second type of need restoration. If the resident has **not** already completed their hobby that day, it performs the genuine Daybook hobby: bounded Fun/Energy effects, favorite-furniture benefit, the existing hobby-session history, the appropriate household aspiration step, and active functional room benefit. It uses the same once-per-day daily record as the original manual and autonomous routines.
- **Important accessibility/fun exception:** If the resident already enjoyed a hobby autonomously that day, the Studio remains playable as creative practice. Its new gallery memory may progress **once that day**, but daily routine needs, prior hobby session, aspiration and functional room benefits **are not paid twice**.
- Each resident may complete one Studio activity per game day, with fresh-game defaults and save/reload persistence. Three studio days unlock a modest **framed hobby artwork** displayed on the wall of the resident's actual current home.
- A real resident sprite makes a brief, eased transition to the hobby station during a 17-second celebration scene; normal home autonomy pauses, then resumes from the station after the scene. Animation timers respect both the pause control and result modal, and the scene is canceled if the home/resident changes.
- The gallery follows residents to their current saved residence. It never introduces substitute or duplicate NPCs, changes their identity, or requires the player to purchase furnishings just to see the new activity.

## Save migration and offline support
Existing save key: hearth-harbor-save-v1, unchanged. New validated field:

~~~js
hobbyStudio: {
  days: {mabel:0,rosie:0,oliver:0,jun:0,bea:0,finn:0},
  counts: {mabel:0,rosie:0,oliver:0,jun:0,bea:0,finn:0},
  gallery: {mabel:false,rosie:false,oliver:false,jun:false,bea:false,finn:false}
}
~~~

The sanitizer accepts only the six known resident IDs; days and counters are bounded; gallery unlocks cannot be lost once a resident has three recorded sessions. Older saves gain safe defaults, preserving cooking, friend bonds, Generations prerequisites, household aspirations, town celebrations, furniture layouts, and every other prior system. Partial activity state and transient animation are intentionally not saved, avoiding interrupted-device restore exploits.

New files: hobby-studio-v2518.js, hobby-studio-v2518.css, tests/hobby-studio-v2518.test.cjs. The new JS loads before the main game runtime, and both assets are precached under hearth-harbor-v2518-little-passions for iPhone offline use.

## Quality assurance
**15 new permanent automated tests** cover:
1. Distinct identities and all six activity mechanics.
2. Valid current home, neighbor, and physical station arrival.
3. Flower sequencing, fruit sorting, pastry shaping, branching stories, separate color palette/canvas input, and lure weaving.
4. Invalid/early taps, gentle retry, and cancellation without rewards.
5. No duplicate daily routine/aspiration rewards after NPC autonomy, plus same-day and save/reload limits.
6. Three-day per-resident wall keepsakes, old-save sanitation, and original game artwork.
7. Resident animation transitions, game pause, modal pause, autonomy resumption.
8. Main game JS integration and offline assets.

The previous **110 tests** are retained: **125 of 125 automated tests passed** in GitHub Actions. Any older cache-name assertion is release-independent.

### What this does not prove
Node regressions and mock Canvas2D calls do **not** constitute a complete screenshot-driven browser QA pass or real iPhone Safari playthrough. World navigation, UI scrolling, physical gesture performance, save-file backups, battery usage and animation visual quality still need direct device verification before v3.0 can be considered polished.

## Roadmap toward Generations
1. **Browser/iPhone visual QA** and fixing genuine usability bugs, particularly navigation, on-screen characters, small touch targets, modal scrolling and long-session saves.
2. **Hearth Kitchen depth:** refine the existing twelve Cooking Mama-inspired recipes with more meaningfully distinct gesture minigames, shared cooking and food preferences without superficial recipe inflation.
3. **Household growth:** individual careers/roles, functioning shops, varied neighborhood routines, deeper interpersonal conflicts and reconciliation, richer house customization and cooperative family activities.
4. **Economy/longevity balance:** keep household rewards modest and earned, with sensible money flow and diverse daily play.
5. **v3.0 Generations:** opt-in aging and life stages, parenting/care, school, lasting family tree/memories/heirlooms/inheritance and stringent save migrations. Then **stop and invite the owner's creative input before planning beyond 3.0**.

Previous milestone: HELPING_HANDS_V2517_QA_AND_ROADMAP.md.
