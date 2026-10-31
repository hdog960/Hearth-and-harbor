# Hearth & Harbor v1.6 — Neighbor Bonds

## Implemented
- Resident meeting outcomes can now be warm, awkward, or reconciliatory. The outcome is deterministic for a given in-game day and event slot.
- Previous friendship progress is preserved. A new independent tension score retains unresolved disagreements instead of erasing friendships outright.
- Persistent stories describe disagreements and reconciliations, with custom beats for each scheduled pair.
- Unresolved tension changes resident moods, town gossip, their day response, and post-event destinations.
- Player can mediate disputes in conversation; energy cost, friendship prerequisite, and once-per-pair-per-day limit prevent spamming.
- Old saves migrate with zero tensions. No online services added.

## Boundaries
- Small authored social simulator: six residents, 12 event templates, not a generative relationship AI.
- Events progress only while the game is open. The renderer remains pixel-art canvas, preserving the current aesthetic.
- Physical iPhone Safari testing remains required.
