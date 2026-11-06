# HEARTH & HARBOR — COMPLETE CLAUDE DEVELOPER HANDOFF
## Verified source package: v3.0 Generations / Chosen Growing Years

**Original GitHub repository:** https://github.com/hdog960/Hearth-and-harbor  
**Published URL:** https://hdog960.github.io/Hearth-and-harbor/  
**Last verified playable-code release:** v3.0, merge commit `f8d4b11b0d3da7c8c2a23ad5910b50a6fb9dc5a7`  
**Handoff date:** November 6, 2026  
**Current major-roadmap status:** **PAUSED at v3.0 for user creative review**. Do not continue into v3.1 without user direction.

## 1. The player's original vision and non-negotiable constraints

Hearth & Harbor is a warm, **65% Sims and 35% Animal Crossing**, single-player 2.5D pixel-art mobile life simulator designed to make meaningful everyday life fun. The primary target is **iPhone Safari / Add to Home Screen**, deployed **free on GitHub Pages**. Keep original, detailed, vivid, coherent 64-bit-inspired, 2.5D pixel character and environment artwork. Avoid replacing lovingly authored game art with blocky filler or crude temporary placeholders. The player especially values games their family would enjoy. Maintain the same working game across updates, with a deployable site they can close, reopen and test.

The existing central characters are **Poppy**, the player; **Pip**, a young child who can voluntarily enter Poppy's guardianship following genuine in-game care; and **Wren**, a separate young Maplewood village resident and Pip's friend. **Wren is not automatically part of Poppy's household**. Early-teen Pip is still not an adult, cannot participate in adult jobs or romance, and has no automatic biological relationship to Poppy.

Keep offline support, save and export/import backups, iPhone-touchable controls, navigation around solid furniture, continuity of saves, world-state-aware relationships, original interaction mini-games, cooking activities, decorations, seasons and daily rhythms.

## 2. What's actually included in this package

This is intended to be a **full repository snapshot**, not a flattened or approximate code sketch. Expect:
- `index.html`: entrypoint for browser and PWA, with ordered script/style references.
- `game.js`: main Canvas game loop, game state, save migration, rendering, input routing, real-world pathfinding, shop/cooking/navigation and module integration.
- `*.js` and `*.css`: the other systems; preserve exact linked filenames and load order.
- `assets/`, icon, manifest and any tracked PNG/SVG artwork.
- `sw.js`, `manifest.webmanifest`, `.nojekyll`: offline / GitHub Pages support.
- `tests/*.test.cjs`: all existing Node deterministic regression tests.
- `.github/workflows/cozy-qa.yml`: existing full CI regression check.
- `README.md`, `ROADMAP_V22_V30.md`, `DEVELOPMENT_NOTES.md`, all `*_QA_AND_*.md`, and **every other tracked project document**, including this handoff.

The packaging workflow additionally creates a manifest and a SHA-256 file for verification. It deliberately excludes `.git` internals and transient caches, not application source.

## 3. Major active systems (avoid duplicating or shadowing them)

**Village/core:** persistent adult villagers with needs, relationship systems, personalities, routines, homes, aspirations and time; seasons, festivals, community and village improvements, trading, collection/museum, decorations, fishing, cooking and Cooking Mama-like mini-games.

**Poppy/Pip:** `little-sprouts-v272.js` orchestrates the actual child; `pip-routines-v273.js` and `pip-home-autonomy-v291.js` govern physical movement; `pip-growth-v280.js` owns optional physical growth milestones; `pip-projects-v278.js` and dreams handle genuine interests, workstations and child projects. Additional modules support mentors, child-led home help, keepsakes, family rituals, family-bond chapters, cottage visits, independent ideas and real home activities.

**Wren/peer life:** `wren-neighbor-v295.js` handles a physically present second child, obstacle-aware real-town movement, meaningful Pip/Wren outings, independent peer greetings, handmade Friendship Corner chapters, revisits and true shared memories. `pip-home-echoes-v299.js` connects a completed Wren/Pip event on an earlier day to a separately completed, timed Poppy/Pip home activity, and draws authentic framed pictures on the cottage wall.

**Family history:** `family-atlas-v271.js` records dated genuine events without inventing kinship, adult romantic links or phantom people.

## 4. The completed roadmap through v3.0

The `README.md` contains a chronological sequence of every implemented release, with individually authored supporting QA/handoff documents. Most recent completed releases:

- **v2.9.0–2.9.4:** Real, interactive cottage guests and visits, Pip's independent home routines and ideas, developing family bond with Poppy.
- **v2.9.5:** Wren becomes a second, independently moving child in Maplewood. Meaningful multi-stage child-to-child activities, actual friendship receipts.
- **v2.9.6:** Spontaneous physically co-present child greetings with original artwork, no passive XP/fake history.
- **v2.9.7:** Friendship Corner; three handmade, genuine, multi-day real-world chapters that visibly change a sign.
- **v2.9.8:** Wren independently tends the sign; follow-up conversations, lasting artwork changes, honest Atlas memories. Fixes actual in-game input routing and depth/touch overlap.
- **v2.9.9:** A village friendship can inspire a later genuine shared household task and an authentic at-home story, with choice-dependent pixel-framed wall art.
- **v3.0 Generations — Chosen Growing Years:** Third *optional*, **never automatic** early-teen Pip stage after earlier explicitly celebrated childhood milestones; seven days since Independent Child; five completed Wren outing days; two real Friendship Corner chapters; two Stories Brought Home; and two family-bond chapters. Poppy must physically be with Pip at home and actively choose **Explore with Curiosity** or **Grow Through Kindness**. The choice changes sprite scale, visible accessories and coloring, home growth chart, actual navigable creative routine, and dream-project narration. No adult status, jobs or romance. The stage is recorded in the family's Atlas and in the original save key.

**v3.0 is a STOP/REVIEW checkpoint**: request the player's creative feedback before drafting or implementing v3.1+. Don't manufacture a new roadmap as if already approved.

## 5. Critical technical rules

1. **Preserve save compatibility.** The sole historical local storage key is `hearth-harbor-save-v1`. Do not rename it. Existing players must retain progress across releases. New fields must be optional, defensive, validated, capped and normalized. Do not invent completed actions from save import.
2. **Complete genuine gameplay, not passive counters.** Journals, map clicks, idle simulation and opening dialogs must not auto-grant friendships, rewards or memories. Physical co-presence, completed real activities, and earned dates matter. Interruptions must not pay out.
3. **Preserve original appearance.** Pixel sprites and 2.5D depth ordering are central to the game's identity; do not replace art with geometric placeholder clutter. Avoid characters rendering through furniture/walls or flickering near player zoom.
4. **Preserve module script order** in `index.html`. Check every new action handler is routed through both its module and `game.js`; there have been bugs when handlers existed only in modules. Do not add a UI tab simply to expose a feature if the existing Daybooks can do it.
5. **Keep navigation physical and safe.** Walking paths use `findPath`, nearest walkable cells and obstacle/segment checks; child actors cannot legitimately teleport to furniture-blocked waypoints. Check iPhone performance and touch hitbox overlaps.
6. **Keep GH Pages deployment working and cached assets fresh.** Update appropriate `?v=` query params in `index.html` and change `sw.js` cache name on a publishable release.
7. **Avoid unsupported deployment claims.** Green automated tests ≠ physical iPhone Safari visual/touch QA. GitHub commit merged ≠ fully propagated Pages deployment. Say what's verified and what's not.
8. **Preserve source of truth.** Game and existing docs are the facts. Do not overwrite them with an assumed implementation or inaccurate feature claims.

## 6. How to run and test this source

This is primarily static browser JavaScript, not an Unreal, npm or Vercel application; **no package installation/build step is required** for the normal GitHub Pages deployment.

From the folder containing `index.html`:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/` in a browser. On iPhone, use the deployed Pages URL, then Safari's **Add to Home Screen**. The game saves within the same web origin/storage; installing elsewhere does not automatically move local game saves. Preserve an exported backup when switching hostnames/devices.

Regression tests require Node.js 22 or compatible:

```bash
for js in *.js; do node --check "$js" || exit 1; done
node --test tests/*.test.cjs
```

At the v3.0 release checkpoint GitHub Cozy QA passed **1,433/1,433 tests**. Repeat the *complete* suite after every change, and only merge/deploy if passing. See `.github/workflows/cozy-qa.yml`.

## 7. QA still requiring real gameplay review

Inspect on the actual iPhone Safari or installed Home Screen app: sprite fidelity and movement directions, foreground occlusion, prop/furniture collisions, generated art readability, scroll traps in overlays and Daybooks, zoom, smoothness, touch disambiguation, PWA cache, offline behavior, save/export/import, older saves, and several game days of real play.

Reviewing v3.0 specifically: whether the teen choice should alter more than the visual/creative theme, whether the existing stage requirements are too demanding, whether Poppy/Pip/Wren look and feel distinct, and which family-life feature deserves the **next explicitly approved** development roadmap.

## 8. How to hand this to Claude

Upload the accompanying ZIP and tell Claude:

> This ZIP is the entire Hearth & Harbor v3.0 GitHub Pages repository, including all tracked game files, styles, artwork, 63 automated regression test modules, 71 original project Markdown docs, plus the new handoff instructions. Read `CLAUDE_DEVELOPER_HANDOFF.md`, `GENERATIONS_V300_REVIEW_AND_QA.md`, `ROADMAP_V22_V30.md`, `README.md`, `DEVELOPMENT_NOTES.md`, `index.html`, `game.js` and the active Pip/Wren modules. Preserve the `hearth-harbor-save-v1` key, player artwork and iPhone GitHub Pages target. **We're paused at v3.0 for my creative review.** First audit and explain the current feature set and recommend a truthful next roadmap; don't start changing files until I approve it. When development resumes, change real code, run `node --test tests/*.test.cjs`, and provide a fresh playable GitHub Pages update.

Do not assume Claude already has GitHub write access. The repository may be connected separately to Claude; otherwise the uploaded ZIP supplies an editable copy and the player can publish changes through their usual GitHub workflow.

## 9. GitHub version reference

The **last full-game v3.0 commit was `f8d4b11b0d3da7c8c2a23ad5910b50a6fb9dc5a7`**. Packaging-only commits after that may add this document or an archive workflow, but are **not** new gameplay releases. Check the package manifest's release reference and snapshot SHA. The package should contain the intact repo *at* the verified snapshot, plus this document and bundling metadata.

**End of handoff — keep the original aesthetic and ask for user review before v3.1.**
