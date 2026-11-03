# Hearth & Harbor v2.9.6 — Living Child Friendships

## The idea

Previously Pip and Wren could grow closer only by beginning the three authored two-stop outings. Those outings remain the **only** way to earn Wren's peer friendship, improved child joy, recorded memories and the corresponding Connections Atlas events. Now Wren can also take a small initiative during quiet town time, making Maplewood feel lived-in between the activities the player deliberately starts.

## What genuinely changed

- When Pip is **physically present in Maplewood**, not occupied by another child activity, Wren may notice them within a modest local distance and take a short, safe walk closer on their own. The player must actually have Pip in the world; neither the Daybook nor a stored record can summon an invisible child.
- Wren moves using the original `findPath`, per-point walkability checks, whole-segment obstacle samples and capped step budgets. Path interruptions, a moving Poppy, a busy Pip, paused games, scenes or changing dates must never create a teleport or fake moment.
- Once the two **actual** child actors have become close, two different original, hand-drawn pixel-paper idea bubbles briefly appear over their world positions. The colors and drawings reflect storybooks, color sketches or leaves. No forced modal, new character sprite, unrelated effects or notification spam.
- The topic of these small interactions derives from validated, genuinely completed peer activities and Pip's existing earned story, art and garden skills. Wren's scheduled observed interest is a fallback before they have any shared record. Warmer language is reserved for real earlier completed days and different experiences.
- The folded Wren section inside Pip's existing Daybook explains that spontaneous encounters exist and describes the current observed interest. Wren's existing face-to-face conversation can mention it; tapping during the moment gives the player the authored real activity instead.

## Balance and preservation

**No passive friendship, experience, coins or needs.** The idle reaction is read-only and session-only. It can happen at most once per in-game day and is not added to `youngResidents.wren.friendships` or the Connections Atlas. An unfinished walk never grants even a greeting. Returning to town within the same runtime day cannot be used to spam encounters.

The original `hearth-harbor-save-v1` key, its `youngResidents.wren.friendships` schema, three existing activity stories, adult relationships, guardianship and all prior child systems remain unchanged. This is not a school simulation, a new adoption, biological family link, adult romance, aging transition or v3.0. No third-party packages or services.

## Implementation

- `wren-neighbor-v295.js` extends its pre-existing Wren actor with `sharedInterest`, `beginSmallMoment`, `settleSmallMoment` and `drawSocial`. No new independent navigation engine or persisted field.
- `game.js` draws both small idea bubbles in the genuine town Canvas after Pip has been rendered.
- `index.html` updates asset query versions; `sw.js` increments the offline Home Screen cache name.
- `tests/wren-living-friendships-v296.test.cjs` covers real approach, illustrations, interest history, one-per-day limits, interruption, blocked routes, no passive farming, and PWA integration. All previous regression suites remain required.

## QA and next roadmap

Before release require JavaScript syntax and `node --test tests/*.test.cjs` through the existing Cozy QA workflow; inspect the GitHub Pages deployment on the release SHA. Passing source and deterministic tests **does not** constitute physical iPhone Safari touch, screenshot, overlapping-character or VoiceOver testing. These device checks remain outstanding.

Continue toward the user's **v3.0 Generations creative review checkpoint**, next addressing more nuanced self-directed child personality/interaction, authentic family routines, and only then optional life-stage consequences. Pause at v3.0 for user creative review.