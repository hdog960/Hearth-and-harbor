# v2.4.2 — Neighbor Postcards / QA

- Adds a validated optional `socialPostcard` record to the existing save format.
- Daily invitations are generated between 10:00 and 20:00 in-game for residents with at least 18 friendship and sufficient energy. Preference is given to a different sender on successive days.
- Friend or romance invitation kind depends on the *existing* romance stage; platonic mail does not start dating.
- Can accept, decline without penalty, cancel, or resume on the same day. Neither walking nor merely arriving awards rewards; choosing a shared moment finishes the event.
- Friendly visit rewards are modest and only once per invitation/day; romantic dates follow existing one-date-per-day safeguards.
- A completed outing saves a personal memory. Old saves and the cooking system are unaffected.
- Mobile QA: 31 local Chromium checks passed including both invitation kinds, save migration, cancellation, notes, cooking and four viewport layouts.
- Known limitations: no offline progression, no genuine NPC-to-NPC romantic partnerships, physical iPhone Safari gesture testing remains required.
