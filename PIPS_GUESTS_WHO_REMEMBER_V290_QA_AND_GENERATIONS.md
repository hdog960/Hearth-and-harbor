# Hearth & Harbor v2.9.0 — Guests Who Remember

## The three-person cottage visit is more than an appointment

The previous v2.8.9 release enabled **real, voluntary visits**: invite one of six existing adults face-to-face in town, meet the adult after they walk to the actual cottage porch on a following day, walk indoors with the real adult and Pip, complete Poppy's original 3.8-second household task, and make a lasting choice. This release makes those residents behave less like passive furniture beside Poppy.

### Three original characters, one real action

While the authentic cottage visit is in its `working` phase **and** the real Poppy Household Daybook hold is active at the correct furniture, the original adult character visibly carries the corresponding object and performs hand-and-paper gestures. Pip performs a complementary animation from their original in-world position, and Poppy retains the genuine time-based object work. Reading shows a hand-held storybook with two pages; meals show a small handmade serving tray; hobbies show original brushes, paper and colors. The effects start **only during the real hold**, not when an invitation is written, a conversation menu opens, or a fictional timer expires.

This also fixes a prior pose conflict: during a family visit, Pip now has **one authoritative companion position** rather than competing home-help and visit snapshots. Other home-help and legacy animations remain unchanged outside a visit.

### Personalities respond to what Pip has actually learned

The visit opening now checks Pip's legitimately earned Homegrown Personality interests. If Pip has completed enough real shared reading, mealtime or hobbies, a matching guest notices it naturally in dialogue, and the activity prop has a subtly different painted finish. If Pip's preference is different, the adult appreciates the new perspective. No interest is invented on unplayed saves and the result does not change the economic balance.

### The household has a small, original illustrated history

After an authentically completed visit, the **cottage wall gains one of six individually painted tiny world postcards**, between the original windows and away from the doorway. Each reflects the relevant adult *and the actual two choices* made in that original visit.

- Mabel: petal drawing
- Rosie: fruit-market note
- Oliver: baking recipe picture
- Jun: illustrated story pages
- Bea: watercolor swatches
- Finn: little fish-and-pond art

These are physical Canvas objects, not simply a journal icon or a duplicated NPC. Players can **tap the world art, walk to its safe adjacent floor tile and inspect** the actual original date, first choice, final choice and remembered ending. Inspection is completely read-only: no repeated currency, friendships, gifts or child needs. The existing collapsed Cottage Visits section gets one compact gallery note rather than another full-sized tab.

### The adults return to ordinary, reactive town life

For up to three afternoons after a finished visit, each participating adult can take a real, **existing grid-routed** walk to a character-appropriate outdoor location and carry a small original hand-made reminder, without teleporting or replacing their character sprite. This is deferred if a wedding, date, romance milestone, paired village event, care-related routine, family response project, or an active next-day visit has precedence. The resident's dialogue can also recall **both recorded choices** for the first few days and occasionally afterward, allowing regular everyday lines to return between memories.

### Storage, tests and art constraints

**No new save field or key.** The source of the town dialogue, six postcards, Pip's guest familiarity and optional follow-through is the previously verified `youngResidents.pip.homeVisits.memories`, backed by chosen guardianship and a dated earlier child/adult introduction. The authoritative localStorage key remains `hearth-harbor-save-v1`. The game is still fully free, iPhone-first GitHub Pages, with its consistent handcrafted 2.5D/pixel style.

The implementation is purposefully lightweight: at most six Canvas cards and transient, locally drawn hand props. It does not request generated imagery, create new network activity, introduce a background timer, duplicate adult actors or mutate save state during drawing.

Source:
- `pip-guest-echoes-v290.js` and `pip-guest-echoes-v290.css`: verified historical evidence, meaningful guest dialogue/visuals, small inspectable wall gallery, time-scoped returning NPC routines, actual task-bound hand animations and real interests.
- `pip-home-visits-v289.js`: optional in-person personality acknowledgement and original compact Daybook gallery context.
- `little-sprouts-v272.js`: safe optional setup, single child pose priority during visits and correct child animation hookup.
- `game.js`: priority-aware NPC scheduling, town dialogue and gesture, live adult work, original wall drawing, actual tap-to-walk gallery inspect.
- `index.html` and `sw.js`: versioned JS/CSS loading and fresh offline PWA cache.
- `tests/pip-guest-echoes-v290.test.cjs`: original six-way art, exact story memory, world touch collision, time windows, NPC event priorities, genuine timed activity poses, child interest proof, read-only inspection and iPhone build guards. Previous full regression suite remains mandatory.

## QA and remaining Generations roadmap

Merge only after all Node syntax checks, comprehensive deterministically run unit/regression tests, post-merge main Cozy QA and successful Pages build/deployment. Automated checks do not establish real iPhone Safari pixel depth, tappability at narrow world zoom, VoiceOver reading, user-customized furniture overlap, or a long-running old save; those require device playtesting.

**Generations v3.0 is not complete.** Next work should deepen actually autonomous household schedules and family roles, support additional non-duplicated younger residents, optional real aging transitions and tangible intergenerational continuity. Do not expand into v3.0 without the user's checkpoint review.
