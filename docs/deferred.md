# Deferred

Known defects and gaps that do not block the current work. Numbered so they can be referred to.
Move an item to `DECISIONS.md` when it is fixed or deliberately closed.

| # | What | Why it is deferred | Noticed |
|---|------|--------------------|---------|
| 1 | ~~Economy mode left the recognition trade block active while hiding the screen that explained it.~~ **FIXED 2026-09-05.** A switched-off system no longer charges for itself: recognition returns the permissive answer when the politics layer is off. See D166 — the fix is not the one spec v2 asked for, because its premise was a misreading of DESIGN.md. | — | Closed |
| 2 | The single-step control behind the dev flag drives the engine out of sequence and permanently desynchronises the two on-screen turn counters. Running the headless simulator destroys the live game state. | Phase 0 work, not yet started. | 2026-09-04, by the Phase 0 audit |
| 3 | Tuning edits are silently discarded whenever a game is in progress, because loading a save replaces the whole tuning set first. The dashboard displays schema defaults rather than the values the game is running. | Phase 0 work, not yet started. It is the acceptance test for §2.2, so it will be fixed there. | 2026-09-04, by the Phase 0 audit |
| 4 | ~~The dashboard fix was never loaded in a browser.~~ **VERIFIED 2026-09-05.** The dashboard opens and completed a 50-turn run in 22.0 seconds with no error. | — | Closed |
| 5 | 100-turn headless timing is unmeasured, and a first attempt suggests the per-turn cost may grow with run length -- two 100-turn runs had not finished in ten minutes against 22 seconds for fifty turns. Confounded by browser throttling of a hidden tab, so neither explanation is proven. | Needs a clean foreground measurement. If the cost really is superlinear it matters more than the timing task, because Phase 8 wants twenty headless runs. Does not block the rest of Phase 0. | 2026-09-05, D167 |
