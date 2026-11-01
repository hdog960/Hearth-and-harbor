# v2.5.0 — Field Notes QA & architecture

The first Living Village vertical slice extends the existing 2.5D renderer and object interaction with six deterministic daily seasonal finds. First discovery is distinguished from repeats; collecting does not block movement and does not create coins. Donations are optional, grant only once per specimen, and make seasonal catalog completion a longer-term reason to explore.

Save schema adds `nature` including found counts, donations, collected sites/day and rewarded exhibition tiers. The existing save key remains unchanged. The cabinet reuses the existing village noticeboard rather than adding an empty new scene.

Remaining work: animated critters, exhibition display scene, larger town biomes, festivals, multi-season art, and iPhone physical-device performance checks.
## v2.5.1 — Little Museum release

Added original `museum-v251.js` renderer and `museum-v251.css`. A museum building now appears in the eastern village and enters a scrolling exhibit scene with sixteen displays. Empty cases fill permanently as corresponding donations arrive. The curator's desk supports donation and a once-per-day guided tour; the new `museumTourDay` is clamped on imported saves. The existing collection rewards are unchanged and duplication protection remains. Gallery scene includes accessible touch-target modals, existing pathfinding for entering and traversing, and navigation back to town. Local smoke test: 38 assertions on 320/375/390/430px phone layouts, including entrance, navigation, all exhibits, saving, same-day reward limits, collection milestones, and home regression. Additional real-device Safari testing remains outstanding.
