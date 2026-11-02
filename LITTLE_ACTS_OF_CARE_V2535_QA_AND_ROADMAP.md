# Hearth & Harbor v2.5.35 — Little Acts of Care

## A real family-care loop, built on actual needs

Hearth & Harbor now has independent resident routines, saved Daybooks, living-room teamwork, household keepsakes, chosen-family connections, genuine mentorship and a durable Household Chronicle. The next missing piece before v3.0 Generations was **responding to a specific person's needs through actual care**, not generic relationship meters.

**Little Acts of Care** is a new optional household activity system for the six existing residents and all six occupied homes. It is neither a passive upgrade nor a fictional young-resident system. Visit an occupied home, open the Household Daybook, then **💗 Little Acts of Care** (also available through the village menu/journal). The book reads the actual current needs of each home member and offers four purposeful responses:

| Need genuinely below 60 | Caring response | Existing activity that must be completed |
|---|---|---|
| Food | A Warm Meal | The *other* housemate actually prepares a Meal |
| Social | A Listening Ear | The housemate completes a real Chat |
| Fun | A Shared Chapter | The housemate completes a real Read activity |
| Energy | A Quiet Place to Rest | The housemate completes a real Tidy activity to prepare a peaceful space |

Each need is displayed with its genuine 0–100 meter. Requests cannot start when there are fewer than two current residents, the need is already above threshold, the caregiver has already completed the relevant activity today, or either resident has already been involved in today's caring completion. There is **only one active request per home**, with an explicit cancel control that prevents accidental overwrites. A request becomes ineligible if the participants change homes or the day changes.

You may **guide the caregiver manually**, or tap the button that adds the necessary genuine activity to that resident's **existing independent Daybook schedule**. It never overwrites existing scheduled work; if the schedule is full, the user can free a slot or guide the resident directly. Only a genuinely finished **first activity of that type on that in-game day** counts, using the game's existing movement/hold/autonomy completion functions. Merely picking an option, opening a journal, or queuing a task grants nothing.

## Balanced rewards and legacy objects

When the correct real action finishes in the right home, the targeted need restores **up to 12** (but can never exceed 100), and the caring resident gains **+2 Social** and their existing pair bond gains **+1**. The targeted restoration recognizes the existing target's *current* need after normal activity effects; if another real action already fulfilled that need, it never overfills them.

The game records the actual home, game day, caregiver, recipient and kind of help. This happens **once per home and once per involved resident per in-game day**—moving between houses, repeated tasks, interrupted animation, or back-and-forth menu presses cannot farm it. **Three separate real days of care in the same home** earn an original hand-stitched patchwork quilt, which remains in that residence's real Canvas2D environment, adding **+2 permanent home comfort** under the original 100-point cap. Extra care never duplicates its quilt or grants a new currency.

The world scene also shows a small care plaque during genuine active requests. The quilt is made from actual original Canvas primitives, not an image placeholder or outside downloaded asset. It coexists with the household's earlier memory frames, personal corners, mentorship board and traditions.

## Files and safety

- \`care-circles-v2535.js\`: needs threshold and co-resident validation, authentic first-action completion, daily/home/identity reward guards, independent schedule integration, safe cancel, history/earned quilt, original in-world display and integrated caring journal.
- \`care-circles-v2535.css\`: responsive warm scrapbook UI; touch targets at least ~47px, focus-visible outlines, small-screen layout and reduced-motion support.
- \`game.js\`: optional \`careCircles\` default and sanitized import, hooks to the real resident guided and autonomous completion paths, Daybook/menu routing, comfort and original in-world quilt drawing.
- \`index.html\` / \`sw.js\`: preloads the actual care module and stylesheet before the core game; versioned offline cache rotation for iPhone.
- \`tests/care-circles-v2535.test.cjs\`: **33 new automated regressions**, including actual VM execution of the real game's \`runHouseholdAction\` method, all four needs, moved residents/expired requests, forged saves, daily reward limits, save round-trip, schedules, Canvas art and mobile offline assets.
- Historical tests updated to accept rotating cache IDs and the non-paying caring action observer.

The original save storage key remains **\`hearth-harbor-save-v1\`**, so existing households are untouched. The optional sanitized field is \`careCircles:{requests:{},daily:{},personDaily:{},history:[],keepsakes:[]}\`, bounded to known homes, adults, four real activities, game dates and 48 dated care memories. This is a foundation for later family-care and life-stage systems, **not yet an aging, parenthood, or child-care simulation**.

**Expected full regression total: 485** (452 previous + 33 new). Merge and publish only with green GitHub Actions complete JS syntax and automated tests. Verify production main-branch Cozy QA and the GitHub Pages deployment on the merged revision.

### QA still outstanding

Physical iPhone Safari rendered screenshots (320/375/390px and landscape), touch/VoiceOver focus, game performance with many previous art overlays, actual 30-minute natural household play, and multi-day immersion testing. Source-level Canvas tests cannot prove art stacking or touch comfort. Do not represent those as completed.

### Remaining Generations plan

Continue from actual learned skills, chosen family, historical memories and real-care activity to **opt-in life stages**, meaningful families and caregiving that respects consent and age appropriateness, eventual younger residents and genuine parenting/mentorship, heirlooms and legacy transitions. The agreed owner review/creative gate remains **at completed v3.0**. No later roadmap work should be undertaken without user input.

[Previous release: Passing It On v2.5.34](PASSING_IT_ON_V2534_QA_AND_ROADMAP.md) · [Approved milestone roadmap](ROADMAP_V22_V30.md).
