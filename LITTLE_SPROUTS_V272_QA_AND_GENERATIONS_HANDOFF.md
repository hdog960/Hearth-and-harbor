# Hearth & Harbor v2.7.2 — Little Sprouts: Pip Arrives

## First true younger resident — the next Generations pilot

Pip is the game's first actual younger resident, drawn into the real playable 2.5D village as a visibly smaller character using the original sprite renderer, with a distinct child palette. Pip has a name, fixed life stage (Child), independent needs (Joy, Curiosity, Confidence), real Maplewood location, touch hitbox, three interactive activities, saved memories and an optional future cottage home. Pip is NOT inserted into the existing adult NPC array; adult jobs, wages, romance, weddings, housing capacity, relationships and adult aging remain unchanged.

### Genuine gameplay
Find Pip by walking to them in the village, or open "Pip & Little Sprouts" from Menu, Journal or personal Daybook and use "Visit Pip" to walk to their actual position. Physical proximity is required. The three distinct activities each have three prompts with two choices rather than awarding progress from one button:
- The Cloud-Boat Story: co-create a story, real Curiosity increase.
- A Tiny Nature Trail: share small nature discoveries, real Confidence increase.
- The Friendship Sketch: create an original drawing with individual decisions, real Joy increase.

Every activity may be completed only once per in-game day. The actual completion stores the day, activity kind and choices. Canceling/leaving/restarting mid-activity creates NO memories or rewards. All three types and three **different** days of genuine shared care are required before an optional guardianship is offered. Needs gently fluctuate without punitive illness, eviction or neglect mechanics.

### Explicit guardian decision
Pip initially visits Maplewood from outside the existing playable home network. No parent, orphan, adoption, spouse, or biological background is asserted. Once earned, the player may explicitly choose to become Pip's guardian. This is never automatic. If chosen, the child record stores guardian=player with the actual chosen day and Pip moves to the playable cottage; they are visible and interactive there, with ongoing activities. The Connections Atlas then includes the new real child, guardian link and dated event, clearly distinguished from biological parentage. Original adult home rosters and income are unchanged.

### Files and integration
- little-sprouts-v272.js: real younger character, bounded optional save data, needs, three three-part interactive activities, completion tracking, opt-in guardian and 2.5D world hitbox/drawing contract.
- little-sprouts-v272.css: touch-friendly warm illustrated daybook, responsive 380px breakpoint, keyboard focus and reduced-motion rules.
- game.js: uses the existing hearth-harbor-save-v1 key with optional youngResidents.pip data, real town/cottage renderer, walking-to-Pip interactions, game-time needs tick and Menu/Journal/Daybook access.
- family-atlas-v271.js: real eighth resident in the connections graph, correctly distinguished guardian edges and dated history, no fake family records.
- index.html and sw.js: v2.7.2 asset URLs and offline pre-caching.
- tests/little-sprouts-v272.test.cjs: real first-child QA cases, cancel/day/proximity guards, explicit choice, save migration, sprite and Atlas integration.

### QA and next development
Require full Node suite, syntax and main-branch deploy before claiming production. Physical iPhone Safari screenshots, VoiceOver, narrow screens, touch layering and long-session gameplay remain unverified.

This is an intentional first pilot—not the full v3.0 system. Next: actual child play/school schedules and home autonomy, more interactions with adults, child development and optional life stages, then larger families, succession and inherited homes. Do not claim children, guardians or schooling are fully built merely because the first real child exists.
