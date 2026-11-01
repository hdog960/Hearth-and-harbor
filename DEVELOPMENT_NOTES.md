# v2.4.3 — Town Hearts: development notes

**Scope:** Resident-to-resident attraction and first autonomous decisions, not a marriage/family simulation.

Relationships progress *only* when existing neighbor visits complete after both characters arrive. After multiple meaningful days together, a pair with sufficient affinity and positive bonds can develop a spark, decide to court, or form a partnership. The progression is stateful and bounded to one advance per pair/day. Ineligible pairs and those already committed to other partners do not begin parallel courtships. A Poppy dating/partner bond blocks automatic NPC courtship for that villager.

**Persistence:** Sanitized `townHearts` state and `r:DAY:PAIR` memories; existing saves migrate to empty records and keep all previous data. A separate board appears in People, Journal and Menu.

**Known limitations:** Simple authored compatibility scores, no dating dialogue between NPCs, no ceremony, no automatic moving in, no gender preference customization. Visual appearance relies on existing 2.5D sprites. Progress depends on the town running in an open tab; no offline simulation.

## v2.4.4 — Evening Traditions QA and implementation

- Resident NPCs with dating or committed status can have independent evening outings; no autonomous marriage or irreversible life decisions.
- The 8:45–10:42 PM time window avoids the existing scheduled afternoon community encounters and evening social visits.
- Both NPCs follow normal movement routes and must arrive before rewards or stories are recorded.
- The world now displays a shared activity icon and subtle animated affectionate particles.
- A once-per-outing bouquet costs 10 coins, adds a small optional social benefit, and is protected against repeated purchases.
- The Town Hearts board and a new partner-focused conversation topic reflect the relationship.
- Added bounded, validated saved state for couple moments and bouquet gifts, and Town Stories support for their IDs.
- Local Chromium 390×844 testing: bootstrap, couple card, bouquet purchase, full NPC routing, both arriving, one saved story, and no JavaScript exceptions. Existing 28 resident relationship tests plus 19 static integration checks passed. Full physical iPhone validation still required.

## v2.4.5 Shared Futures

Committed couples with two completed evening encounters can decide to cohabit or maintain their own homes from Town Hearts. Moves are blocked if either address already houses two residents; no one is displaced. Partners who live together can receive a homemade meal (one saved plate, once per day), yielding modest hunger/social benefits and a persistent Town Story. Evening rituals for housemates now occur near their shared residence. Save import validates these new relationship choices and daily meal records.

Local build validation: 27 browser interaction checks, 17 new source checks, 28 core relationship checks, JavaScript syntax. Live GitHub Pages title and latest source verified. Physical iPhone Safari rendering not yet confirmed.
