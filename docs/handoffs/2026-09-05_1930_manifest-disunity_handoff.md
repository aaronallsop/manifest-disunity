# Handoff — 5 September 2026, 19:30

Written during the first Hog Wild run. Everything here is also somewhere more permanent; this is
the map to it. **Read `docs/HOGWILD-LOG.md` first** — it has the four-part account of every decision
made without Aaron, each with the one command that undoes it.

## The two things he needs to know

**1. The closed canal was open, in something I had told him was finished.** A2d shipped on
5 September as "Panama shut". Mexico had ports on both coasts and Mexico is a node goods pass
through, so Washington → Mexico → Florida worked, by sea, for a flat ten per cent — cheaper than
crossing its own continent. Four tests guard that ruling and all four passed, because they read the
graph's edges and the hole was in the route search. Fixed narrowly (`stage/a5`, revert `37df85a`),
with a test that runs the search rather than reading edges.

**2. The 84% on the board was wrong; it is 75%.** Measured independently against the same government
file. The earlier count scored a place as measured when only a *combined* line covering two of the
six sectors was published — the sum, and neither part — and scored trade without requiring transport.
The two errors reconcile to 6.45 points exactly. Board corrected. D178.

## What landed

| | |
|---|---|
| Tests | **953 green, 0 failing**, full suite, 9.5 minutes |
| Tag | `stage/a5` — "what a right of way is worth, and the canal that was open" |
| Commits | 14, all pushed |

- **`DESIGN.md` has caught up.** §6.7 now covers transit end to end — grants, the compounding toll,
  friction, the three mode tiers, why the search is neither Dijkstra nor logarithmic, the markets
  abroad, the rivers and their fifteen chokepoints, the two seas, the network map, the deals screen,
  the two cards that stop the round, and what a negotiation can and cannot move. §12 gained three
  absences that were being implied rather than stated.
- **A port right costs a third more than a road right** (D176). Port is the baseline and the other
  modes are discounts, so the change can only lower an ask — nothing previously signable is now
  refused. **The direction is defensible; the magnitudes are invented.**
- **The AI stopped judging corridor requests with a blank.** It called the verdict with the value of
  the trade hardcoded to zero, killing one of the four things a grantor weighs on the only path an AI
  uses it. It now goes through the planner, like the trade branch beside it.
- **A corridor that runs out no longer accuses the neighbour of closing it** (deferred #7).
- **Three programmer rules** written from what tonight cost (5, 6, 7).

## Numbers measured this session

| | |
|---|---|
| 100 turns headless | **~65 s** against a 60 s target — misses narrowly |
| Cost per round | 650 ms (turns 1–25) → **753 ms peak** (26–50) → 515 ms (90–100) |
| Same seed twice | **identical to the byte**; a different seed differs |
| Five-hop chain | keeps **18.4% road / 34.3% rail / 42.6% water** against 90% selling direct |
| Closest two ports, same sea | **16 miles** (Delaware–New Jersey) |
| Farthest | **2,578 miles** (Hawaii–Washington) — *priced identically* |
| Median sea crossing | 707 miles, against a 253-mile median land border |
| Industry data really available | **75%**, not 84% |

**Deferred #5 is closed and its worry refuted:** per-turn cost *falls* as a game lengthens. It tracks
surviving nation count, not turn number. **Deferred #3 closed with evidence**, both halves.

## Open, and mine to answer

**Is the 565–753 ms per round a regression I caused on 5 September?** It is 4–8× the 83 ms/turn
recorded earlier in the project. An A/B against `stage/a4` was running when this was written. If it
says yes, the prime suspect is the AI corridor-answer path now going through the full planner.
Recorded in deferred #5.

## What genuinely needs Aaron

1. **The industry re-bake is stopped, not forgotten** (D178). He approved it; the approval was for a
   job described as clean and it is not clean. Farming is baked 10.2× above its real share and hunger
   was calibrated against that inflation, so a faithful swap starves the continent on turn one; the
   six sectors reach only half a real economy; and it reaches backwards into every existing save.
2. **Distance.** The single largest improvement available, measured but deliberately not built. Three
   open questions are all this one question. **The trap:** fix the sea without fixing the foreign
   corridors and every long haul reroutes through Canada, because it would become the only remaining
   way to cross the continent for free.
3. **Price haggling** (deferred #8) — the unmet Phase 3 checkpoint, "a buyer with no alternative pays
   visibly more". The lever exists in the model and reaches no screen. The missing piece is not the
   slider, it is a representation of *alternatives*, and it has a performance trap.
4. **His written predictions**, before the autarky phase — parked at his instruction (D175).
5. **The game-alpha questions** (D173).
6. **`gh` installed**, so the repository's privacy is verified rather than assumed.
7. **"Touch anything live" is ticked on the board** and I have left it alone. Nothing went to
   playtesters. If it was a mis-click it wants unticking.
8. **The published playtest is 132 commits stale.** `origin/main` is a single orphan commit,
   "Playtest build", and it predates deals-with-terms, all of transit, the rivers, the network map
   and the Panama fix. `dist/` is gitignored, so nothing about the alpha track has ever reached it.
   Harmless only because he has sent the link to nobody — anyone opening it today would play a much
   smaller game and report on that. **Deliberately not refreshed:** putting a build in front of other
   people is his in every mode and is the one thing Hog Wild explicitly does not unlock.
