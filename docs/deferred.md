# Deferred

Known defects and gaps that do not block the current work. Numbered so they can be referred to.
Move an item to `DECISIONS.md` when it is fixed or deliberately closed.

| # | What | Why it is deferred | Noticed |
|---|------|--------------------|---------|
| 1 | Economy mode hides the recognition panel and the recognise button, but leaves the recognition-based trade block active. Two mutually unrecognised states cannot trade, the refusal gives no visible cause, and the player has no route to fix it — in the exact mode meant for testing trade. | Introduced by the Complexity work (18fe982). Development is paused pending the consultant's revision of the brief, and the fix depends on how §5.4's grey market is settled — a hard block is what the brief forbids, so patching it now risks building the wrong thing twice. | 2026-09-04, by the Phase 0 audit |
| 2 | The single-step control behind the dev flag drives the engine out of sequence and permanently desynchronises the two on-screen turn counters. Running the headless simulator destroys the live game state. | Phase 0 work, not yet started. | 2026-09-04, by the Phase 0 audit |
| 3 | Tuning edits are silently discarded whenever a game is in progress, because loading a save replaces the whole tuning set first. The dashboard displays schema defaults rather than the values the game is running. | Phase 0 work, not yet started. It is the acceptance test for §2.2, so it will be fixed there. | 2026-09-04, by the Phase 0 audit |
| 4 | The dashboard fix for the `Complexity is not defined` regression is committed but has never been loaded in a browser — this session's preview server was pinned to the old project folder. | Verify first thing next session before trusting the dashboard. | 2026-09-04 |
