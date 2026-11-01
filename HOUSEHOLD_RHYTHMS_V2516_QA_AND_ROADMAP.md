# Hearth & Harbor v2.5.16 — Thoughtful Households

## Development objective
This release expands the household half of the life-simulation game before v3.0 Generations. It improves residents' real at-home decisions, aspirations, everyday acts of care, and emotional reactions, building on v2.5.15 Supper Together.

## Implemented
### Smarter daily resident autonomy
The earlier rigid action sequence has been replaced by a deterministic, personality-aware planner. Residents now consider:
- **Urgent needs** first: rest when exhausted, eat when hungry, socialize when lonely and living with someone, or restore Fun.
- **Actual existing aspirations**: after urgent needs are handled, an incomplete next step from Roots & Keepsakes is prioritized unless it has already been done today.
- **Real household opportunities**: housemates make time to connect once per in-game day.
- **Distinct identities**: Mabel prefers gardening; Rosie enjoys hosting; Oliver likes cooking; Jun loves reading; Bea seeks creativity; Finn enjoys making fishing-related crafts.
- **Daily variety**: once important activities are completed, residents tidy, read, relax or wind down naturally.

The planner uses actual resident needs, daily completed action records, the current day/time, current occupants and the existing household aspiration system. It still drives the normal walking and timed household action engine. No imaginary work or remote offscreen simulation is claimed.

### Persistent roommate care
Upon completing a genuine chat, simple home meal, or tidy activity (guided or autonomous), a resident with an actual housemate can create one shared care memory per pair per game day. Both people receive modest Social/Fun recovery, their existing Town Bond gains +2, and their existing Town Tension decreases by 2. Values are capped, with no money, food or external rewards created. Previously separate chat bond rewards have been consolidated to avoid duplicate relationship payouts.

Memories are dated and describe a kind conversation, shared simple meal, or taking care of the house. Repeat activities, different initiators and reloading cannot claim another daily shared-care bonus.

### Daybook and reactions
- The existing household Daybook now includes a **Household Rhythms** section showing each current resident's personality, likely next action and the reason for it.
- The Daybook shows the household's recent dated care memories.
- Real household characters can display a relevant reaction icon after connecting that day, and mood text can become **Connected**.
- Urgent exhaustion, hunger, loneliness, low Fun and existing social conflict continue to take priority over Connected mood.

## Save compatibility
The existing save key hearth-harbor-save-v1 is unchanged. A new optional record stores a small map of pair-to-last-shared-day and up to 30 bounded memory entries. The sanitizer validates resident identities, pair ordering, in-game days, action names and duplicate pair/day memories. Existing cooking, family table, furniture storage, aspirations, festival, village and relationship records remain intact.

New assets: household-rhythms-v2516.js, household-rhythms-v2516.css, and tests/household-rhythms-v2516.test.cjs. JavaScript loads before game.js and both assets are included in the v2516 offline service-worker cache.

## Automated QA
Eleven new tests cover personality choices, critical needs, aspiration priorities, roommate absence, action variety, actual care rewards, daily/reload limits, save validation, current-day visible reactions, Daybook story presentation, integration hooks and offline assets. The previous 87 tests remain; complete suite target is **98**.

This is code-level coverage, **not a substitute for a rendered browser or physical iPhone Safari playtest**. That remains outstanding.

## Remaining before v3.0
1. End-to-end playtesting and art/UI quality review on real iPhone Safari, including pathfinding, room navigation, menus, camera and saving.
2. More distinctive animated hobbies, cooperative household behaviors, family conflict and care.
3. Cooking Mama-style recipe technique variety and richer co-cooking/family meal systems.
4. Deeper town shops, character jobs and village economy connected to households.
5. Carefully developed v3.0 Generations: optional aging, family stages, caregiving, family tree, inheritance and lasting history with safe migrations.

The user wants to help determine what follows v3.0. Do not choose or implement the post-3.0 roadmap before that discussion.

Previous milestone: SUPPER_TOGETHER_V2515_QA_AND_ROADMAP.md.
