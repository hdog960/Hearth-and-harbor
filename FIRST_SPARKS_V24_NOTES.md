# Hearth & Harbor v2.4.0 — First Sparks
A focused first installment of the Hearts & Personalities expansion.

## Implemented
- Six original personality profiles with distinct values, secrets and dreams.
- Three one-per-day discoveries through in-world conversation.
- Optional romance, separate from existing friendship and neighbor-to-neighbor bonds.
- A chemistry meter, repeated thoughtful interactions, first dates, and partnership milestones.
- Three dates at the garden, café and pond. Both residents must walk to the chosen location before any progress or rewards are granted.
- A Hearts & Personalities notebook accessible from People, Journal and Menu.
- Compact conversation choices with distinct everyday, additional, and feelings views.
- Memories saved in the existing Town Stories feed.
- Daily interaction limits; validated backwards-compatible save records.

## Progression
Get to know a neighbor over multiple days; friendship >=25 and two discoveries enable Sparks. Friendship >=35, chemistry >=20 and two discoveries enable a date. Three dates, chemistry >=60 and friendship >=65 permit optional partnership.

## Tested in local mobile-sized Chromium
30 core checks passed (load, old-save migration, malicious-data sanitization, discovery limits, romance gates, in-world date completion logic, memory persistence, 12 cooking recipes, housing and four viewport sizes), zero observed JS exceptions. Separate navigation simulation confirmed all three date destinations can complete through actual movement.

## Not yet implemented
Marriage, weddings, breakups, jealousy, autonomous NPC romance, relationship-driven moving arrangements and generations. Those belong to later stages and should not be represented as playable.

## Mobile QA note
A physical iPhone Safari pass has not yet been performed. Local tests were run with a different copy of the source and share the same features; the GitHub release is checked for the expected code and deployment separately.
