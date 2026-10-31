# Hearth & Harbor v1.2 — Village Life

A free, original 2.5D storybook life-sim for GitHub Pages and iPhone Safari.

## Quality improvements

- Grid-based, obstacle-aware navigation around buildings, garden, trees, fences, and pond.
- Neighbors stop before colliding with scenery or each other.
- Character movement routes around obstacles rather than cutting through them.
- More individual dialogue reactions, original small character portraits, and daily friendship-gain limits.
- Furniture cannot be placed directly over the player.
- Existing v1.0 saves remain compatible; new daily conversation metadata is validated.

## Deployment

Publish this folder to the `main` branch of the public `hdog960/Hearth-and-harbor` repository. GitHub Pages serves from `main` / `(root)`. No server or build process. For a clean cache use `?v=1.1.0`.

The artwork is still a work in progress, and mobile Safari testing is required.

## Little Lives (v1.2)

Villagers now have game-clock daily routines, route around scenery to meaningful destinations, display an activity icon, and explain what they are doing in the new **Their day** conversation action. Friendship ranks and persistent milestone moments unlock at 25, 60 and 90 hearts per villager. A paused clock, menu or conversation pauses wandering. Current save key remains unchanged; older saves are normalized.