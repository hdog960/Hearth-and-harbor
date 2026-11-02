# Hearth & Harbor v2.5.33 — Family Roots

## What we made

**Family Roots** is the first persistent relationship-structure foundation on the road to v3.0 Generations. The existing game has authentic weddings, roommate moves, friendship scores, tensions, personal life projects and a Household Chronicle. This milestone finally connects those real sources without declaring strangers blood relatives or inventing children.

The family book, accessible from the village Menu, Journal and household Daybooks, shows the occupants of all six homes and differentiates:

- **Married partners** from the game's actual completed wedding records, including the real wedding day, even when the pair keeps separate homes.
- **Housemates**, determined live from the real resident housing system, not from static character profiles.
- **Chosen family**, an explicitly **non-romantic, voluntary** connection two housemates may make after genuine cooperation, shown separately from marriage and ordinary house sharing.

Marriage is derived directly from the existing \`weddingPlans\` save data and never copied into a competing relationship authority. This milestone does not add parents, children, biological lineage, aging, forced romance or automatic household moves. That future Generations work requires actual age systems and child-appropriate gameplay, not labels or made-up records.

## Unlocking an earned chosen-family promise

Two **real current co-residents** must have finished **two actual roommate projects on different in-game days**. Their existing town bond must reach at least **4**, and unresolved relationship tension must remain below **8**. Only then is the optional **Promise to be chosen family** button enabled.

The promise is free, requires a deliberate user choice, and does **not** award coins, social stats, XP or an instant permanent buff. It creates a dated entry in the new persistent relationship history. An original **paired-leaf household ribbon** is drawn directly inside their playable residence while both current roommates maintain the promise. The relationship remains part of the family book when one person moves away.

The pair may **end their promise** without erasing its former memory. That control also appears in the global connection history when they now live in different homes, avoiding an irreversible choice after a move. Ending does not break marriage or reduce friendship; a later new vow is possible once they still meet the actual prerequisites.

## Tangible caring consequences, with hard caps

After a voluntary chosen-family promise, a **genuine first daily completed Chat activity** by either member, while they still share the home, gives:

- **+4 Social** to each of the two chosen-family roommates.
- **+1** existing household relationship bond.
- If existing tension is positive, **−1** tension.

All figures are capped to their existing 0–100 bounds and only pay **once per pair per in-game day** across manual and autonomous activity paths. Replaying a conversation or menu presses, canceling activities, living in separate homes, an ended promise, or completing an event with a nonmember never pays another bonus. An existing marriage takes precedence over the chosen-family care bonus and keeps its old rewards, avoiding double-dipping. The actual household activity remains authoritative and owns the regular save transaction.

This gives family identity a real but small role in household play; there is **no idle income, currency, recipe exploit or punishment for skipping the system**.

## Files and migration

- \`family-roots-v2533.js\`: valid resident/pair mapping, existing marriage information, shared-project milestone eligibility, voluntary chosen-family links with release and historical memory, real capped action-based care and original household banner art.
- \`family-roots-v2533.css\`: illustrated, narrow-phone-friendly and accessible family record layout.
- \`game.js\`: connected safe optional \`familyRoots\` save import, setup with true home/needs/wedding state, actual guided/autonomous completion hooks, real Canvas room art, and Menu/Journal/Daybook navigation.
- \`index.html\` and \`sw.js\`: correctly ordered module loading and refreshed offline precache.
- \`tests/family-roots-v2533.test.cjs\`: **27 new regression cases**, expected **417 total** (390 prior + 27), including relationship eligibility, both home behavior paths, imported old weddings, anti-duplication and draw methods.
- Previous Chronicle test adjusted to follow the rotating service-worker version.

The original save key **\`hearth-harbor-save-v1\`** does not change. The optional new record \`familyRoots:{chosen:{},careDay:{},history:[]}\` is sanitized to known existing adult resident IDs, canonical two-person keys, real home IDs, safe days and only the last 30 dated voluntary relationship milestones. Historic existing weddings stay authoritative without any migration of their original data.

## Shipping and known QA limitations

Merge only after the GitHub Actions full JS-syntax/Node regression suite passes. Confirm production **main** QA and successful GitHub Pages deployment on the merged revision before calling this live.

**Still outstanding:** physical iPhone Safari screenshot/gesture/VoiceOver review, touch testing at 320/375/390px and landscape, 30-minute natural household play and QA with heavily decorated legacy saves. Code and simulated Canvas operations do not validate the final visual layering or real device FPS.

## What's next toward v3.0 Generations

This is a genuinely useful **pre-Generations relationship graph**, not v3.0 itself. Later phases can establish child-safe parent/guardian edges using real new characters, consentful family/mentorship care, opt-in age stages, family trees and inheritance while keeping these real spouse/chosen-family/roommate distinctions. The player explicitly requested a halt at **v3.0** for creative review. Do not advance past that milestone without owner direction.

[Previous release — Household Chronicle v2.5.32](HOUSEHOLD_CHRONICLE_V2532_QA_AND_ROADMAP.md) · [Approved roadmap](ROADMAP_V22_V30.md).
