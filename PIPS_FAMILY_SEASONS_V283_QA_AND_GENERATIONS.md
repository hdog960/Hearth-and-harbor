# Hearth & Harbor v2.8.3 — The Family Seasons Sampler

## Actual playable memories across seasons

Three handmade heirlooms earned in v2.8.2 are now playable family traditions, not static menu rewards. Poppy must genuinely stand near Pip in the playable cottage, choose an earned framed keepsake, walk to the actual frame using existing pathfinding while Pip follows, make a meaningful first choice, finish a genuine timed Poppy household activity at its real furniture, then make the final choice to record the memory. Merely opening the journal, queuing a task, or watching the time pass earns nothing.

### Three different rituals

- Welcome Ribbon: discuss the meaning of hospitality and complete the original Chat / friendly-letter household action.
- Sunday Recipe Card: remember what makes a family supper meaningful and finish the real Meal household action.
- Orchard Window Print: reflect on the changing garden and finish the real Hobby household activity.

Each ritual has two authored options in its opening and two different final memories. A player can tap the actual frame in the world to inspect its story. Completing a real action does not award the record until a final thoughtful choice is made. Losing the heirloom, leaving the room, changing game day or season, clearing Poppy's task queue, doing an unrelated action, declining the final choice or repeating the ritual on the same day grants no additional memory or reward. Pip follows Poppy during the activity and participates beside the actual furniture.

### Physical seasonal sampler

A genuine completed record saves its day, actual season, earned heirloom and both decisions in a small bounded list. Across different seasons, the real cottage wall displays a progressively sewn original illustrated seasonal sampler. Three distinct in-game seasons add a finishing border and just +1 home comfort, subject to the existing 100 cap. This creates meaningful longevity without flooding the game's economy. Genuine dated memories appear in the Connections Atlas as lived experiences between Poppy and Pip, not biological ancestry, marriages or another legal guardian.

### Save and system compatibility

The original browser save key remains hearth-harbor-save-v1. One optional youngResidents.pip.familyRituals collection (at most 40 sanitized day/key/season/first/last records) is added; earlier saves migrate to an empty list. Genuine prior framed keepsakes are checked before old memories or quilt benefits appear. All previous adult household traditions, marriage, residences, jobs, incomes, cooking, original child learning, aspirations, neighborhood visits, family helping and physical adventures remain intact. No online service, extra local storage key, account or monetization dependency.

### Changed files

- pip-rituals-v283.js: lived frame-to-furniture experiences, actual following child, two decision phases, true timed-action completion, interruption guards, save history and original quilt Canvas renderer.
- pip-rituals-v283.css: four-season illustrated scrapbook, accessible focus, larger phone touch controls, narrow viewport and reduced-motion support.
- little-sprouts-v272.js: optional save field, child follower, updates, Daybook and new action dispatch.
- pip-legacy-v282.js: link from earned original handmade frames to interactive shared rituals.
- game.js: wall-frame hitbox, actual Poppy goTo movement, original household action observer, permanent quilt art and +1 balanced comfort.
- family-atlas-v271.js: dated genuine family ritual events without invented ancestry.
- index.html and sw.js: ordered v2.8.3 scripts and offline iPhone cache.
- tests/pip-rituals-v283.test.cjs: physical coactivity, stage and heirloom provenance, choices, old saves, interruptions, seasons, Canvas rendering and iPhone regression checks.

### Release gate and remaining QA

Full browser JavaScript syntax and Node deterministic regressions must pass before merging. Automated Node tests do not prove live GitHub Pages propagation, physical iPhone touch alignment, Canvas depth, VoiceOver, offline reload or long-play stability. Those still require direct Safari and deployment verification.

This is substantive v2.8.3 Generations progress, not completed v3.0, school, additional children, chronological aging or intergenerational succession. Next strengthen actual adult-child community roles, animations and truthful long-lived household choices.
