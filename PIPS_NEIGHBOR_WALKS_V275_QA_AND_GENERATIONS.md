# Hearth & Harbor v2.7.5 — Pip's Neighbor Walks

## Generations: real guided childhood outings and actual resident interactions

### Gameplay
The first younger resident, Pip, can now **meet the existing six adult villagers**, each through a uniquely written two-choice/two-part cooperative learning moment. The exact moment is accessible only while Pip, Poppy and the corresponding adult are physically near each other in the playable town. Adult NPC positions come from the actual animated world and can change: if an adult walks away or Poppy leaves, the unfinished meeting cannot be fabricated, saved or rewarded. Simply opening the Daybook or pressing a start button never earns anything.

The six encounters are Flower Friends (Mabel), Market Kindness (Rosie), Baker's Little Helper (Oliver), Library Whisper (Jun), Colors Together (Bea), and Pond Discoveries (Finn). They are all age-appropriate, concrete and use existing characters; they do not change adult friendship, romance, marriages, household histories or NPC jobs.

Each completed two-part encounter records the **actual adult ID, game day, and choices** in the child's existing save. Only after completion is a small +6 Curiosity/+4 Confidence benefit applied. The same child/adult pair may meet once per day (other nearby villagers can also be met); saved history is capped at 36 genuine memories. No passive rewards, new money, faux parentage or remotely generated encounters.

### Guided town walk
After Poppy has already genuinely become Pip's chosen guardian, you may visit Pip in the **real cottage** and select "Take a village stroll". Pip accompanies Poppy through the cottage door and follows Poppy within the real 2.5D Maplewood scene, with moving animation, directional facing, a small original illustrated companion ribbon and world tap interactions. The follower uses real Poppy positions and validated walkable locations, rather than a ghost image painted into a menu. As you approach genuine moving adult villagers, Pip's Daybook offers the relevant resident encounter.

The escort is session-only (not saved and not a permanent new adult household slot). Ending the stroll, changing scenes or day rollover returns Pip to the original childhood routine. A saved game does **not** restart in a phantom escort state. Pip's former solo village/cottage schedules, three child minigames, opt-in guardianship, earned practice chapters, nighttime rituals and all six adult villagers remain functional.

### Wider village life
The Connections Atlas now includes **completed real child-neighbor memories** in its dated resident histories. They are historical experiences, not family graph edges. The Atlas never interprets a playtime conversation as adoption, guardianship, parentage, romance or marriage.

### Files
- pip-neighbors-v275.js: authentic live NPC proximity, following Poppy, safe in-world escort, six age-appropriate scenes, genuine completion, bounded saved memories and optional UI interactions.
- pip-neighbors-v275.css: illustrated mobile-friendly touch-first journaling, focus and reduced-motion.
- little-sprouts-v272.js: backwards-compatible optional meetings field, integration with Pip's real visible position, physical child hitbox, book, renderer and action dispatch.
- game.js: current player/NPC coordinates, world walkability, actual game frame update and scene transition callbacks.
- family-atlas-v271.js: true child-neighbor history without invented family edges.
- index.html / sw.js: new v2.7.5 asset order and offline iPhone pre-cache, original hearth-harbor-save-v1 storage key kept.
- tests/pip-neighbors-v275.test.cjs: new verified neighborhood interaction tests, alongside all previous unit regression gates.

### Release and remaining QA
Require complete JavaScript syntax plus deterministic Node test suite on the actual pull request, then merge and confirm main-branch files. GitHub Pages deployment, actual iPhone Safari touch positions while Pip and adults move, 320/375/390px layouts, VoiceOver, offline reload and long-session user testing still need independent verification.

### Next toward full v3.0 Generations
The guided outings form a real interaction foundation. Continue with richer Pip behavior and needs, child-appropriate aspirations and household participation, then verified play-school/daytime learning activities, more ages and younger residents, optional aging and genuine inheritance. Do not label this pilot as full childhood schooling or a complete multigenerational simulator.
