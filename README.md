# Hearth & Harbor · Playable Prototype v0.2

An original cozy chibi life simulator designed first for iPhone Safari and GitHub Pages. Free to play; no accounts, paid services, advertisements, subscriptions, or backend required.

## What's playable

- Original procedural 3D low-poly town and chibi avatar with visible shoes, limbs, and walking animation.
- Six named neighbors with personalities, conversations, and persistent friendship scores.
- Touch-to-walk navigation, interactive homes, market, café, library, hall, garden, benches, and fishing pond.
- Customizable character name, skin, hair, and clothes.
- Dollhouse-style home interior with interactive bed, sofa, and kitchen.
- Purchase and **place** six furniture types anywhere on the home floor; four interior paint palettes.
- Four needs (food, fun, social, energy), 3 simulation speeds, day/night progression, and 4 short seasons.
- Fishing timing minigame, plant/harvest gardening loop, café shift earning, shopping, and journal quests.
- Local auto-save, manual save, export/import backup, touch-friendly UI, Home Screen PWA manifest.

## How to run

Open `index.html` from a **local web server** or deploy to GitHub Pages. Because it uses JavaScript modules and imports Three.js from jsDelivr, direct `file://` opening is not supported.

### Publish with GitHub Pages (no command line)

1. Create a **new public repository** on GitHub named `hearth-and-harbor`. Leave your existing game repos alone.
2. Upload **the contents of this folder** at the root of the new repository: `index.html`, `style.css`, `game.js`, `sw.js`, `manifest.webmanifest`, `assets/`, and `README.md`.
3. In the repo, open **Settings → Pages → Build and deployment**, select **Deploy from a branch**, `main`, `/ (root)`, then **Save**.
4. The game URL will be `https://YOUR-USERNAME.github.io/hearth-and-harbor/` after deployment. Open in Safari and use **Share → Add to Home Screen**.

The game needs an internet connection to initially load the Three.js library and web font. Saved progress stays in the same browser/device, not in GitHub. Use **Menu → Export save** for backups.

### Local testing

From this folder: `python -m http.server 8000` then open `http://localhost:8000` in a browser with network access.

## Scope / known limitations

This is a **vertical slice**, not the full Sims-like game: no autonomous household simulation, multi-character households, weddings, careers beyond the café shift, building walls, true resident schedules, online multiplayer, or cloud saves yet. NPCs wander in a small range, and character movement is simple rather than full obstacle-aware pathfinding. Furniture placement is direct but doesn't yet include move/sell tools. The goal is validating the character style, navigation, life-sim loop, and mobile UI.

## Technical notes

- No build step; ES modules, Three.js 0.160.1 CDN, and procedural mesh artwork.
- Local state key: `hearth-harbor-save-v1`.
- iPhone optimization: capped device pixel ratio, simple geometry, orthographic camera, responsive touch UI.
- Site source is original, using no copyrighted Sims or Animal Crossing assets.

## Visual overhaul v0.2 (October 31, 2026)

Reworked original chibi bodies, hairstyles and expressive faces; organic painted grass and textured sandy paths; rebuilt cottages with gables, shutters, dormers, flowerboxes and porches; more detailed trees, shrubs and flowers; lily pond and ripples; upgraded market, benches, plaza fountain and cottage furnishings. Instanced grass and pebble meshes keep draw calls low. Existing local saves stay compatible. The next step toward a production-quality game is an art-directed 3D asset and hand-painted texture pipeline.
