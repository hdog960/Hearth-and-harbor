# v2.3.4 — Development and QA

- Preserve the original save key; add optional residentHabits counters (sessions + lastDay), validate all values and resident IDs on import.
- Hobby preferences are authored per NPC and are not arbitrary imported objects.
- Autonomy prioritizes hunger/rest and meaningful social needs ahead of hobbies.
- Hobby actions use existing daily limits; per-day bonus for placing favorite decor is capped.
- After three distinct hobby days a unique personal memory is saved to existing lifeMoments.
- No new purchases occur automatically; kitchen pantry remains unchanged.
- Local mobile-sized Chromium QA: 29/29 checks passed, no JavaScript exceptions, four screen sizes.
- Follow up: additional animated furniture interactions, prop-aware movement and hobby progression beyond first milestone.
