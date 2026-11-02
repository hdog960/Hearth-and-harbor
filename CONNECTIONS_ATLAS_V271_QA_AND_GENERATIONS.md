# Hearth & Harbor v2.7.1 — Our Connections Atlas

## A truthful family graph on the road to v3.0 Generations

### Player-facing feature
An illustrated Connections Atlas is available in Menu, Journal, Poppy's cottage Daybook and occupied-neighbor household Daybooks. Its seven existing real residents (Poppy and the six Maplewood neighbors) and seven physical households are represented from the game's actual save. The Atlas explains three distinct connection types:

- A completed marriage comes only from the authoritative existing wedding record, not an engagement, roommates, player assumptions or romantic affinity.
- Chosen family comes only from a voluntarily earned active Family Roots promise. Ending it removes the active tie but retains the genuine historical promise.
- Living together describes current co-residence, and is explicitly not family, parentage or romance.

Each known person and household has a tappable, phone-readable page, current links and a dated timeline derived from completed wedding records, chosen family bonds, actual house moves and earned Family Portraits. The timeline links resident IDs, actual event days and original saved home ownership; it does not fabricate younger residents, parents, guardians or historical milestones. Partnerships persist if people live in separate houses. A couple's history filters to milestones involving both people; home history is tied to that home.

### In-world integration
Earned dual-resident Family Portraits (v2.7.0) are now physical tappable objects on the wall of the actual 2.5D residence. Tap the picture itself to read its date, theme, the two real makers and the underlying family relationship. From the picture you can navigate to the pair's actual Atlas entry or the existing portrait book. Unowned pictures have no hitbox, and clicking space cannot mint a reward.

### Integrity and compatibility
- No new saved fields, altered family or ages, new currency, automatic points or payments.
- The hearth-harbor-save-v1 key remains unchanged. No save migration is needed.
- Previous v2.7.0 and earlier saved data continue to work.
- Old v2.7.0 duplicated household menu entries and a stray brace artifact are removed.
- Family labels and player-provided character names are HTML-escaped.
- The family graph is derived, not independently persisted, so marriages, moves and ended promises reflect the current save.

### Code and QA
- family-atlas-v271.js: validated read-only relationship graph and historical event timeline; person, home, pair and picture pages.
- family-atlas-v271.css: original illustrated book, spacious touch targets, keyboard focus and reduced-motion support.
- family-portraits-v270.js: real Canvas picture geometry hit test, restricted to existing earned pictures.
- game.js: main navigation, actual world touch routing, UI cleanup and feature setup.
- index.html / sw.js: v2.7.1 versioned assets and offline cache hearth-harbor-v271-connections-atlas.
- tests/family-atlas-v271.test.cjs: new regression cases covering real marriage/chosen ties, split households, honest timelines, invalid/forged/future data, picture taps, mobile offline and no payout or save mutation.

Release gate: full deterministic Node suite, JavaScript syntax, then main-branch QA and Pages deployment success. Real Safari 320/375/390px, touch, VoiceOver, landscape and long-session QA still need actual physical-device review.

### What still comes before v3.0?
This is a real family graph foundation, not the generational simulation. Next phases must establish an actual younger-resident entity, explicit opt-in guardian/adoption/parental roles, appropriate child routines and playable character art before extending into multigeneration living, property inheritance and generational careers. Existing adult life-stage opt-in remains intact. Do not pretend that every relative already exists; build a real simulation and inspect on iPhone at each step.
