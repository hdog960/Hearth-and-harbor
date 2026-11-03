# Hearth & Harbor v2.7.3 — Pip's Living Day
## Generations prelude: childhood routines, learning and a real bedtime ritual

### What's playable
Pip now follows a visible four-part daily routine in Maplewood. Once Poppy has explicitly accepted guardianship, Pip follows a different cottage routine. Pip doesn't teleport between locations every six hours: the existing 2.5D sprite moves smoothly between nearby positions in a deterministic, in-game-time-driven transition and uses walking frames and facing. The routine has distinct in-world book, crayon, clover, lantern or pillow props, all rendered with Canvas artwork.

Pip's Daybook shows the current routine and four daily stops. Three learning tracks are derived exclusively from real, completed Story, Nature and Art activity records; each unique valid day counts once per type. A rank advances after 2, 4 and 6 genuine days for that activity. Opening the Daybook or waiting never grants mastery. These are learning ranks, not aging or fictional schooling.

### Evening care: live player action
After Poppy has genuinely become Pip's guardian, at or after 6 PM the player can physically visit Pip inside the cottage to start a two-part bedtime ritual. Both decisions must finish. The answer pair becomes a bounded saved memory only on completion. Once per day, Pip receives +9 Joy and +5 Confidence, with no money or passive income. Leaving the cottage, stopping halfway, losing proximity or crossing into the next day cancels the unearned ritual.

### Compatibility
The original storage key hearth-harbor-save-v1 remains untouched, as do all six original adults, jobs, weddings, optional adult aging, residences and existing gameplay. Pip's prior memories and guardian choice survive the update. The added optional evenings array is sanitized for dates, valid answer masks, duplicate days, and capped to 35 latest entries. Old saves get an empty evening history. No server, new account, permanent timers or paid services.

This isn't yet a full school, teacher, biological parent, adoption, second child, inheritance or life-stage progression system. It's another playable step toward v3.0.

### Technical files
- pip-routines-v273.js: deterministic daily routes, eased motion metadata, original Canvas props, validated earned mastery and a separate two-step evening activity.
- pip-routines-v273.css: mobile storybook schedule, real practice progress, large touch targets, keyboard focus and reduced motion.
- little-sprouts-v272.js: integrates the new routine into Pip's existing avatar and Daybook, sanitizes optional evenings and dispatches ritual actions.
- game.js: uses actual moving animation and facing for Pip.
- index.html and sw.js: new versioned asset order and offline cache.
- tests/pip-routines-v273.test.cjs: tests of real world movement, timing, cancellations, anti-duplicate rewards, save data, integration and offline iPhone assets.

### Device QA still needed
The automated suite cannot substitute for physical iPhone Safari screenshots, tap-to-visit alignment while Pip moves, small-screen Daybook scrolling, VoiceOver, landscape, bedtime after 6 PM, offline reload or 30-minute playtesting.

### Next steps
Grounded childhood autonomy and more natural neighbor encounters with original animations, then richer voluntary caregiving and longer-term childhood development. Later: genuine schooling and social connections, additional children, optional aging and full generational inheritance.
