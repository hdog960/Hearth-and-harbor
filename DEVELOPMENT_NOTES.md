# Hearth & Harbor v1.4 — Development & QA Notes

## Completed

1. Two scheduled NPC meetups every in-game day: morning (10:00–12:45) and evening (16:00–18:45). Twelve authored events are selected deterministically by day and time slot.
2. Both participating NPCs pathfind toward separate accessible spots near a real village location. Their activity label and icon change while meeting.
3. Once both are at the location, one event journal entry is generated, their pair-specific town friendship rises by 5 (up to 100), and the user receives a short toast.
4. Added Town Stories in Journal, Town Hall, People, and Menu; best NPC friendship appears in People; a News topic is available in conversations.
5. Existing save key is unchanged. Missing new keys in legacy saves receive safe defaults. Imported story text is length-limited and escaped in markup.

## Tests performed

- `node --check` passes for the complete source.
- Playwright (Chromium, 390×844) offline harness: boot, journal, empty stories, People panel, Home + Decor, all without exceptions.
- Live simulated time/pathfinding through morning and afternoon meetup schedules, verifying both participants move to their destinations and story records are generated (not just injected).
- Tests for same-event idempotency, per-pair friendship +5, two separate daily event slots, Town Stories rendering and archive, best-friend display, and legacy save migration.
- A screenshot was rendered at mobile size; Safari-on-device performance not tested.

## Important limits

- Event simulation happens only while the game is open, in town, and clock running. No offline simulation or server.
- Events are scripted short encounters with persistent relationship consequences, **not** Sims-style general-purpose autonomous NPC decision-making.
- NPC houses remain inaccessible; meetings are held at communal locations.
- GitHub Pages deployment may lag behind commit; confirm index title is **Neighbors & Stories** before treating site as updated.