# Hearth & Harbor v2.8.7 — The Village Remembers

## Family lives don't stop when a project ends

Maplewood's six established adults now respond to an authentic childhood Neighborhood Helpers project on later in-game days. The finished craft remains a real world object. From 10 AM to 4 PM, its maker **walks via their existing NPC grid route** back to that actual display, unless a competing shared-neighbor event has priority. No character duplicates, teleport-only NPCs or forced NPC jobs are created.

A player who earned the original memory can bring **Poppy and Pip together**, stand by the actual adult and saved keepsake, and hear a distinct story that directly mentions **both choices actually made during the old activity**. This is not an abstract menu board: the conversation option requires the adult to genuinely arrive by the object and both family members to be nearby. Choosing one of two unique follow-through options yields a modest Pip need increase (+4), an adult friendship increase (+2), and a dated, authentic shared memory. The event happens at most **once ever per adult**.

The adult's future dialogue remembers the final response as well as the original handmade work. The original physical object receives a tiny original pixel-art ribbon in the color of the chosen ending, and the character visually reacts while visiting the craft. Pip responds with a small hand pose when physically near the adult and remembered keepsake. Their personal stories therefore leave visible and conversational consequences throughout ordinary later days.

## Individuality

Mabel: Garden Welcome; Rosie: Neighborly Market; Oliver: Recipe Exchange; Jun: Story Pennant; Bea: Community Colors; Finn: Pond-care Notice. Each of the six adults has a distinct opening, future dialogue, two meaningful responses, two different outcomes, and a child-development theme. Earlier project choices are read from `helperProjects`, not regenerated or guessed.

The Connections Atlas gains truthful `child-neighbor-response` history entries connected to Poppy, Pip and the adult; **no marriages, parentage, adoptions or legal kinship** are invented. A small, collapsed Neighborhood Remembrance section appears inside Pip's existing Daybook rather than introducing a new navigation tab.

## Save compatibility / safety

Existing `hearth-harbor-save-v1` is unchanged. One optional, sanitized `youngResidents.pip.neighborResponses` array stores a maximum of six records `{id,day,choice}`. An older save without the field loads as an empty list. Invalid adult IDs, impossible days, invalid choices, duplicate completions, responses preceding original work, pre-guardian projects and artificial ancestry are rejected. Old data is not wiped. No new currency, paywall, account, network service, energy charges or instant menu reward.

## Integration

- `pip-responses-v287.js`, `.css` — adult-specific authored social scenes, real follow-through schedule, dialogue and world art, true completion, compact Daybook.
- `little-sprouts-v272.js` — old-save migration, setup, compact section, conversation actions.
- `game.js` — existing NPC route scheduling, nearby adult/player/Pip checks, real world drawing and conversation dialogue.
- `family-atlas-v271.js` — genuine dated three-person response timeline.
- `index.html`, `sw.js` — new script and stylesheet loaded before Pip core, v2.8.7 cache refresh.
- `tests/pip-responses-v287.test.cjs` — six distinct adult scripts, real requirements, time windows, NPC route, interruption, once-only writes, choice persistence, world art, unchanged money and family ties, old-save and PWA QA.

## Release and next Generations milestones

Passing the full GitHub Actions syntax and regression suite plus a successful merged Pages build is the release gate. CI does not independently verify how the new faces, ribbons, sprite layering, touch selection, small viewports or screen readers appear on real iPhones.

Next toward **v3.0 Generations**: more genuine at-home social autonomy and shared multi-person activities, optional expanded younger residents and developmental stages, practical household ties and succession. The release does **not** claim v3.0 is complete.
