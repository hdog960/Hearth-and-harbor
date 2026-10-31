# v1.7 development notes — Friendship Visits

This version extends the neighbor encounters and tension systems with two daily friend visits. Pair choices depend on compatibility, existing bonds and tensions, plus a deterministic small variation. A selected plan is persisted immediately so reopening the game does not reroll partners. Completion identifiers prevent duplicate event rewards.

An optional player action, **Arrange visit**, allows one future afternoon visit each day for two compatible residents. Tense pairs will not accept an invitation until their disagreement is resolved. Visiting Hours lists active events, plans and visit history.

16 local Chromium automated checks passed at portrait and landscape phone sizes: saves/migration, pair selection, once-only visit rewards, invitations, tension gating, conversation UI, visiting panel and existing navigation.

Limitations: these are social visits to shared outdoor facilities, not yet actual indoor household visits. Full housing and cohabitation are a future milestone. No offline simulation while the browser is closed.
