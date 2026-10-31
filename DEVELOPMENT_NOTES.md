# v1.8 — Household Foundations: development notes

- Save state adds residentHomes, householdFunds, householdMoves, and housingDay. Imported data is validated and overfilled homes are repaired.
- Three residential sprites are clickable in town, each representing two addressable flats.
- When a new in-game day begins, residents receive wages and their households pay upkeep once. Older saves do not retroactively pay wages for past days.
- Eligible close neighbors can decide to share a home; the player may encourage an earlier move with the stated prerequisites.
- Each move updates addresses and finances, records a Town Story, and raises both residents' social needs.
- 14 initial Chromium checks passed on mobile and landscape viewports, including save compatibility, finances, interactions, movement, and move-in safeguards.
- Known limitation: no NPC interior scenes or player household switching.
