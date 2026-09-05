# Handoff — 5 September 2026, 17:35

Written to clear the desk before Hog Wild Mode. Everything in this file is also somewhere more
permanent; this is the map to it.

## Where it is

**The economy alpha is built end to end.** Tagged `v0.6`, 948 tests green, everything pushed.

| Stage | Tag | What landed |
|---|---|---|
| A0 | `v0.3` | Calendar, safe stepping, tuning that survives a load |
| A1 | `stage/a1` | Trade as a contract with a term; negotiation; the deals screen |
| A2 | `stage/a2` | Transit agreements, compounding tolls, revocation with notice |
| A2b | `stage/a2b` | The markets abroad on corridors; water < rail < road |
| A2c | `stage/a2c` | The rivers, twelve stretches, fifteen chokepoints |
| A3 | `stage/a3` | The trade network map |
| A4 | `stage/a4` | Sixty nations buy passage and use it |
| A2d | `stage/a2d` | Two seas, not one ocean; Panama shut |

Performance, measured in play: **83 ms a turn**, so a hundred turns is about eight seconds against
a sixty-second target.

## The two things that are actually wrong

**1. `DESIGN.md` is four stages behind, and that breaks this project's own rule.** The rule says
behaviour and `DESIGN.md` change in the same commit, and that if they disagree, `DESIGN.md` is right
and the other is a bug. Measured: it has no mention of the rivers as trade routes, chokepoints, sea
basins, Panama, or the network map. A1 and A2 were written up; A2b, A2c, A2d, A3 and A4 were not.
This is the highest-priority item in the project and it is a rule I broke, not a task I have not got
to yet.

**2. Using somebody's port costs the same as using their road.** Flagged as immediate on 5 September
and not built: `Moves.transitVerdict` prices every mode from the same `transit.rateMin`/`rateMax`.
Aaron's point stands — a port grant puts foreign cargo through your cranes and your people, and
should cost more than waving a lorry through.

## Everything that could be worked on without him

Ordered by what I would do first.

1. **`DESIGN.md` for the five undocumented stages.** See above. Rule violation.
2. **A port grant costs more than a road grant.** Small; the mode tiers are already separate grants.
3. **Fill in the five success metrics on the board**, which have read "not yet measured" since the
   day they were written. Three are now measurable: the hundred-turn run, same-seed determinism, and
   the five-hop chain. Publishing a number I have measured is the whole point of that panel.
4. **Close `docs/deferred.md` #3 and #5 with evidence.** #3 (tuning edits discarded on load) was
   fixed by A0's three-layer tuning and the entry never updated. #5 (hundred-turn timing unmeasured,
   possibly superlinear) is answerable now and the answer looks good.
5. **Distances between ports.** THREE separate things are waiting on this one piece: whether coastal
   shipping should be free, whether a ship beats a lorry over short hauls (F13), and why a
   transcontinental haul through Canada costs a flat 10%. Measurable from county centroids already in
   the map. The strongest candidate for the biggest single improvement.
6. **The industry re-bake.** Approved by Aaron (D169) and scheduled after the alpha: widen the six
   sectors so every dollar lands somewhere real. 84% comes straight from published government data;
   today the figure is nought per cent.
7. **Tidy the roadmap.** Three "after the economy alpha" phases — deals between neighbours, transit
   and the network map, and half of Canada/Mexico — were delivered by the alpha track and still sit
   on the board as not started.
8. **`docs/deferred.md` #6:** running the simulator over a live world replaces it. The adversarial
   plan found the trap already (per-Area attributes merge rather than replace on load).
9. **A politics-alpha strip-back**, using the complexity flags in the other direction (D173). This is
   a new phase rather than a task, and it should not start without him.

## What genuinely needs Aaron

- **His written predictions** before the autarky phase — the point is that they exist before the
  build, so writing them myself makes them worthless.
- **The game-alpha questions** (D173). A set of questions about the WHOLE, written before anybody
  plays it. Do not exist.
- **`gh` CLI installed**, so the repository's privacy can be verified rather than assumed.
- **When playtesters get a build.** Answered for now: after the economy alpha. The `live` permission
  is off and stays off.

## Read these first in a fresh session

- `docs/HOGWILD.md` — the mode, the protocol, the four exits, the overnight rules
- `docs/HOGWILD-LOG.md` — empty; the first run fills it
- `DECISIONS.md` — D161 to D174. D171 (Aaron's four rulings on deals), D172 (the external markets and
  the mode hierarchy), D173 (economy alpha vs game alpha), D174 (Hog Wild)
- `docs/FUTURE-IDEAS.md` — F1 to F13, all deferred, none of them instructions
- `docs/PROGRAMMER-RULES.md` — four rules, all learned expensively. Rules 3 and 4 were both broken
  again on 5 September after being written down.
- `docs/spec/a2-measurements.md` — every number this stage was designed against
