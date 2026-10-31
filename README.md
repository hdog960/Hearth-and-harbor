# Hearth & Harbor — Pixel Village v0.7.0

A ground-up 2.5D retro-styled art reset of Hearth & Harbor, with original pixel-sprite characters and scenery. Runs directly on GitHub Pages and iPhone Safari. No Three.js, no API keys, no hosting fees, no paid content.

## What's different

The old 3D renderer, procedural sphere characters, floating bodies and boxy buildings have been replaced with a canvas 2.5D painter's-order engine and a consistent original 64-era-inspired pixel-art style. Characters have distinct outfits, hair, skin, eyes, expressions and animated walking. Scenery includes a town plaza, winding paths, cottages, garden beds, fruit stand, leafy trees, spring flowers, furniture and fishing pond.

## Gameplay

Walk by tapping the ground. Tap characters to approach and talk without a full-screen modal. Compliment or gift neighbors to gain friendship. Tap buildings and locations to enter the house, work at the café, browse the market, tend the garden or play a fishing minigame. Style your avatar, buy and place furniture, and claim journal rewards. Auto-save uses the same key as before: `hearth-harbor-save-v1`. Saves are still local to the browser, so use Menu → Export save for backup.

## Deployment

Static site only. Commit `index.html`, `game.js`, `style.css`, `manifest.webmanifest`, `sw.js` and `assets/` at the repository root. In GitHub Settings → Pages, choose main / root. No build step.

## Scope

This is a playable vertical slice and a replacement art direction, not a completed Sims-like life simulator or a recreation of Nintendo IP. All art is original. Character drawing is generated locally on offscreen canvases. There is no cloud sync, detailed pathfinding, generational simulation or house-wall editing yet. Fine-tuning mobile look and performance will continue after device playtests.
