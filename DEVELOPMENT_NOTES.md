# v2.4.3 — Town Hearts: development notes

**Scope:** Resident-to-resident attraction and first autonomous decisions, not a marriage/family simulation.

Relationships progress *only* when existing neighbor visits complete after both characters arrive. After multiple meaningful days together, a pair with sufficient affinity and positive bonds can develop a spark, decide to court, or form a partnership. The progression is stateful and bounded to one advance per pair/day. Ineligible pairs and those already committed to other partners do not begin parallel courtships. A Poppy dating/partner bond blocks automatic NPC courtship for that villager.

**Persistence:** Sanitized `townHearts` state and `r:DAY:PAIR` memories; existing saves migrate to empty records and keep all previous data. A separate board appears in People, Journal and Menu.

**Known limitations:** Simple authored compatibility scores, no dating dialogue between NPCs, no ceremony, no automatic moving in, no gender preference customization. Visual appearance relies on existing 2.5D sprites. Progress depends on the town running in an open tab; no offline simulation.
