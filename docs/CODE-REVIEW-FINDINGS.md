# Nation States — Full Findings Appendix

Generated from a 16-agent adversarial code review (7 independent reviewers, one verifier per
dimension, plus a completeness critic and a target-design gap analysis). Every finding below
survived an adversarial verification pass whose default was to refute. `verifier note` records
where the verifier corrected or narrowed the original claim — read those, they matter.

**152 verified findings** + **27 target-design gap entries**.

---


## World simulation engine (20 findings)

### 1. `counties-converge-to-identical-mix` — Drift + owner-mix growth make every county in a nation politically identical; by turn ~200 all 51 nations are monolithic

- **Severity:** high  ·  **Category:** simulation-integrity
- **Where:** `js/world.js, game_state.py` — lines world.js:44-61, 66-88; game_state.py:186-207, 258-283

**Evidence**

```
world.js:53-55  `let d = (c.demPop / pop) * 100; d += s * (tgt.d - d);` (s=0.02)
world.js:84   `c.demPop = Math.round(c.demPop + growth * (t.d / natPop));`
Both phases pull the county toward the SAME target (the owner nation's mix) and nothing ever pushes it away. Per-turn deviation multiplier = 0.98 (drift) x 1/1.01 (growth mixing) = 0.970297; half-life = ln2/0.030155 = 23.0 turns.
I ported world.js exactly to Python and ran it on data/game-data.json + areas.json (1676 Areas, 51 nations). Population-weighted within-nation stdev of county dem%:
  t0=12.52  t10=8.84  t25~6.4  t50=2.51  t75=1.16  t100=0.54  t150=0.12  t200=0.026
Nations in which EVERY county carries the same D/R lean letter: t0=10/51, t25=21, t50=35, t100=45, t200=51/51.
Same collapse in the Python mirror: medSD(dem%) 11.96 -> 5.25 by t30.
```

**Why it matters.** The entire target design is county-level secessionist sentiment driven by "county party majority", Quality of Life, Civil Liberties and neighbouring-power pull. Once every county in a nation has the same party mix, factor #1 is a constant across the nation and the county grid degenerates into a nation-level scalar. Two-tier secession (continuous county defection) has nothing left to differentiate. The map also goes visually flat in Political mode inside ~50 turns of play, which is well inside a single session.

**Fix.** Give the fixed point a counter-force instead of a single global attractor. Minimum: (a) make the drift target a LOCAL blend, e.g. 0.5*owner-nation lean + 0.5*population-weighted mean of `Game.countyNeighbors(f)` leans read from `snap`, so gradients survive; (b) add a per-county structural anchor (urban/rural, culture region from data/cultural.mapmode.json) that the county drifts toward and that the nation can only partially override; (c) add bounded per-county noise or migration so deviation has a nonzero stationary variance. Test the fix by asserting median within-nation stdev of dem% stays above a floor (e.g. >4 points) at turn 200.

> **Verifier note.** "Every county politically identical" overstates it: drift never touches `ext` (measured max abs change to ext across a drift phase = 0), so the emergent-party axis survives. On the UI denominator the within-nation SD of dem% bottoms out at ~5.8 (t50) and RISES back to 6.8 by t200 — it does not go to zero. What collapses is the D/R/Other sub-mix, and with it the D/R letter and the visible margin. Severity is high rather than critical because the engine only runs on the manual `tb-advance` button (app.js:503 is the sole caller of World.advanceTurn), so the ~23-turn half-life needs 50+ deliberate presses, and no county-sentiment system consumes this yet.


### 2. `popgrowth-ignores-ext` — phasePopulationGrowth never grows emergent-party populations — ext head counts are frozen forever and diluted every turn

- **Severity:** high  ·  **Category:** correctness
- **Where:** `js/world.js` — lines 66-88 (esp. 73, 83, 84-86)

**Evidence**

```
world.js:73  `t.d += snap[f].demPop; t.g += snap[f].gopPop; t.o += snap[f].othPop;`   <- natTotals omits `ext` entirely
world.js:83  `const growth = (c.demPop + c.gopPop + c.othPop) * r; // new people this turn`   <- growth base omits `ext`
world.js:84-86 write only demPop/gopPop/othPop.
Traced Area 01001 (Autauga, holding New Confederacy) through one turn of the ported engine:
  after partyGrowth: pop=108726.00, ext head count = 11226.88
  after popGrowth:   pop=109701.88, ext head count = 11226.88  (delta EXACTLY 0.0000)
  core 97499.12 -> 98475.00 (+975.88, +1.001%)
  ext share 0.10326 -> 0.10234 in the same phase
Whole-map effect: realised world growth is 0.9296%/turn at t0 (extShare 6.63%), falling to 0.855%/turn by t75 (extShare 14.4%) — never the documented 1%. The Python mirror grows exactly 1.0000%/turn because game_state.py:281 iterates `for p, n in cur.items()`, which includes emergent parties.
```

**Why it matters.** Members of a regional party literally do not reproduce. The claim at world.js:64-65 that "nation-level ratios stay put" is false: the nation's ext share is pushed down every single turn by dem/gop/oth growth. Combined with phasePartyGrowth pushing it back up, the emergent-party share settles at a dilution equilibrium of 0.2777 rather than the declared PARTY_CEILING of 0.35 — and every county with a party converges to the SAME 0.2777 (min/med/max across 1088 county-party pairs at t500 = 0.2776/0.2777/0.2920). Movements that are supposed to be playable factions with meaningful regional variation all end up numerically identical.

**Fix.** Include `ext` in both the nation totals and the county growth base, and distribute into ext:
```
for (const f in snap) { const c = snap[f]; ...; t.d += c.demPop; t.g += c.gopPop; t.o += c.othPop;
  for (const p in c.ext) t.ext[p] = (t.ext[p]||0) + c.ext[p]; }
...
const growth = (c.demPop + c.gopPop + c.othPop + extSum(c)) * r;
...
for (const p in c.ext) c.ext[p] += growth * ((t.ext[p]||0) / natPop);
```
Also stop rounding here (see the rounding finding) or round all buckets together with a drift-absorption step so the population invariant is exact.

> **Verifier note.** The trace framing is misleading. `phasePopulationGrowth` leaves ext head counts unchanged, but ext head counts DO grow across a full turn — `phasePartyGrowth` runs first and raises them via renormalisation (Area 01001: ext 9971.7 -> 10806.5 over one turn). So "members of a regional party literally do not reproduce" is true only of that one phase, not of the turn. Severity high rather than critical: the observable effects are a 1% growth rate that realises as 0.85-0.93% and an equilibrium at 0.28 instead of 0.35 — neither breaks play, and both are tuning-level.


### 3. `parties-setup-drops-half-the-map` — Parties.setup indexes Game.county by raw county FIPS, so 48% of every emergent party's footprint is silently discarded by the Area merge

- **Severity:** high  ·  **Category:** data-integrity
- **Where:** `js/parties.js, js/game.js` — lines parties.js:63-65; game.js:51-65, 375-378

**Evidence**

```
parties.js:63-65
```
for (const f of def.counties) {
  const c = Game.county[f];
  if (!c) continue;
```
`Game.init` collapses 483 Areas at game.js:51-65, deleting the member records (`delete county[m]; alias[m] = aid;`) and reducing 3143 counties to 1676 live Areas. `Game.area(id)` / `Game.areaIdOf` (game.js:375-377) exist precisely to resolve this, and are not used here.
Measured against data/parties.json + data/areas.json — county references that survive the merge:
  El Paso United         12 ->   2  (83% lost)
  Libertarians          394 ->  84  (79% lost)
  The Farmers Union     983 -> 287  (71% lost)
  A Free Texas          254 -> 104  (59% lost)
  New Confederacy      1142 -> 536  (53% lost)
  Blue-Collar Populist  504 -> 297  (41% lost)
  Great Lakes Free Trade 66 ->  45  (32% lost)
  New England United     68 ->  53  (22% lost)
Total: 2025 of 4198 party-county references (48%) hit `if (!c) continue`.
```

**Why it matters.** Every regional party spawns on roughly half its intended geography, and the loss is wildly uneven — El Paso United gets 2 Areas instead of 12. `A Free Texas` and `New Confederacy`, both flagship playable factions in the target design, lose 59% and 53% of their homeland. It fails silently: no console warning, no count in the "Regional parties emerged" toast at app.js:71. It also means the party footprint depends on data/areas.json, which the map editor can change.

**Fix.** Resolve through the alias and merge duplicates:
```
const seen = new Set();
for (const raw of def.counties) {
  const f = Game.areaIdOf(raw);
  if (seen.has(f)) continue;
  seen.add(f);
  const c = Game.county[f];
  if (!c) { console.warn('party', name, 'unknown area', raw); continue; }
```
Then add a build-time assertion in build/build_parties.py that every emitted FIPS resolves to a live Area id under data/areas.json, so the two data files cannot drift apart again.


### 4. `civilwar-even-spread-annihilates-counties` — applyCivilWarCost spreads the population loss evenly per Area then clamps at zero, wiping the ruling party out of hundreds of small counties and under-applying the loss

- **Severity:** high  ·  **Category:** correctness
- **Where:** `js/game.js` — lines 265-278 (269, 271-276)

**Evidence**

```
game.js:272 `const per = (lossPct * (rulingDem ? d : g)) / loser.counties.size; // spread evenly by county`
game.js:275-276
```
if (rulingDem) c.demPop = Math.max(0, c.demPop - per);
else c.gopPop = Math.max(0, c.gopPop - per);
```
Measured on the real Area-merged data:
  score=200 (lossPct 0.100): Colorado loses its ruling-party population entirely in 29 of 64 Areas and only 70% of the intended loss is actually applied; California 21/58 Areas zeroed, 77% applied. 116/1676 Areas zeroed nationwide.
  score=1000 (lossPct 0.400): Colorado 48/64 Areas zeroed, only 42% of the intended loss applied; California 34/58 zeroed (57% applied); New York 32/50; Texas 44/104. 483/1676 Areas zeroed nationwide.
Note also line 269 sums only `demPop`/`gopPop` — a nation whose largest bloc is an emergent party or "Other" pays nothing at all.
```

**Why it matters.** Two failures at once. The severity dial is broken: doubling the score does not double the casualties, because the clamp silently eats 30-58% of the intended loss on exactly the nations that are supposed to suffer most. And it destroys map information permanently: a zeroed county has demPop = 0, so `Game.leanOf` returns lean 'R' with margin ~100, and it can only recover through drift/growth reseeding — a shortcut to the homogenisation failure above. Under the target design's occupation-cost and suppression mechanics this gets called far more often.

**Fix.** Make the loss proportional, not flat, so it is scale-free and cannot clamp:
```
const base = rulingDem ? d : g;
if (base > 0) for (const f of loser.counties) {
  const c = county[f];
  if (rulingDem) c.demPop *= 1 - lossPct; else c.gopPop *= 1 - lossPct;
}
```
If uneven regional impact is wanted, weight by distance from the front or by county lean, but always as a fraction of that county's own bloc. Separately, generalise line 269 to pick the actual largest bloc including `ext` via `Game.demographics(loser.counties)`.

> **Verifier note.** The "116/1676 Areas zeroed nationwide" and "483/1676" figures (I measure 118 and 485) are the sum of all 51 nations each independently losing a war, which cannot happen in one event. A single civil war zeroes only the victim's Areas — 29 of Colorado's 64 at score 200. The per-nation numbers are the meaningful ones and they are correct.


### 5. `gdp-frozen-in-advanceturn` — GDP never changes in the world turn — it is copied into snap/nxt and written straight back unmodified

- **Severity:** medium  ·  **Category:** simulation-integrity
- **Where:** `js/world.js` — lines 140-160 (144, 145, 154, 156)

**Evidence**

```
world.js:144 `snap[f] = { demPop: ..., ext: { ...c.ext }, gdp: c.gdp };`
world.js:145 `nxt[f]  = { demPop: ..., ext: { ...c.ext }, gdp: c.gdp };`
No phase between lines 147-151 touches `.gdp`.
world.js:154 `c.demPop = v.demPop; ...; c.gdp = v.gdp;`   <- writes back the identical value
world.js:156 `Game.tickTreasuries(); // income minus maintenance, on this turn's updated GDP`   <- the comment is false; GDP was never updated.
The only GDP growth anywhere is game.js:307 `c.gdp *= 1 + rate;` inside `growAll`, which World never calls.
```

**Why it matters.** Population compounds ~0.93%/turn while GDP is a constant, so GDP-per-capita decays monotonically and every downstream system built on GDP silently degrades: treasuries become a fixed linear ramp (see treasury finding), and the market inflates until all six sectors pin at the price ceiling (see market finding). Every economic win condition in the target design ("economic supremacy", the GDP half of the Reunify capstone) is measured against a number that cannot move.

**Fix.** Add a `phaseEconomicGrowth(snap, nxt, rate)` that writes `nxt[f].gdp` from `snap[f].gdp`, and make the rate a function of something the player influences (party mix, IT/Finance sector share from data/economy.json, trade deals, war damage) so it is not just a second constant. Keep it in the double-buffered pipeline rather than mutating live records.

> **Verifier note.** "GDP never changes" is only true INSIDE advanceTurn. In a played game GDP moves constantly: `growAll` (+5% per county per round, game.js:307), `boostGdp` on every trade/transit/export deal (actions.js:358-359, 411, 449-450), and `applyCivilWarCost` (game.js:284-287). So the downstream "GDP-per-capita decays monotonically" and "treasuries become a fixed linear ramp" hold only for a player who presses Advance World and does nothing else. This is a missing phase in an engine whose own header says "The phases are stubs for now, to be filled in next" (world.js:12), not a defect in existing logic — medium, not critical.


### 6. `two-uncoupled-growth-clocks` — growAll(0.05) in completeTurn and phasePopulationGrowth(1%) are two independent implementations of the same mechanic on two unrelated clocks

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/app.js, js/game.js, js/world.js` — lines app.js:508-518 (512); game.js:293-311; world.js:66-88, 140-160

**Evidence**

```
app.js:511-513
```
if (TurnSystem.progress().round > beforeRound) {
  Game.growAll(0.05); // end of a full cycle: everyone grows ~5%
```
game.js:303-307
```
const frac = (c.demPop + c.gopPop + c.othPop) / pop; // share of the nation
c.demPop += add * fd * frac;   // add = pop*rate, so this is countyPop*rate in the nation mix
...
c.gdp *= 1 + rate;
```
That is algebraically the same rule as world.js:83-86, at 5x the rate, on a different trigger, in a different module, and it ALSO omits `ext` (game.js:296 and 303 both sum only demPop/gopPop/othPop).
The only caller of `World.advanceTurn()` is the manual button at app.js:503 — grep over js/ finds no other call site.
```

**Why it matters.** Two consequences, both bad. (1) If the player never presses "Advance world", the entire world engine — drift, party growth, cleanup, treasuries, market — never runs, and the game is fully playable to a conclusion with the simulation dormant. (2) If the player presses it once per nation turn, population compounds 1.0093^51 x 1.05 = 1.684 per round while GDP grows only 1.05, so GDP-per-capita falls 37.6% every round and market prices multiply by ~1.88 per round, pinning at MAX_P within about three rounds. There is no rate at which the two systems are consistent. Meanwhile growAll's 5% is silently ~4.7% for any county holding an emergent party, for the same ext bug.

**Fix.** Delete `Game.growAll` and its call at app.js:512, and drive `World.advanceTurn()` from `completeTurn()` on the round boundary (or once per nation turn with the rate divided by the nation count). One growth rule, one clock. If a round-boundary GDP bump is wanted, make it a world phase (see the GDP finding) so it is double-buffered and visible to `tickTreasuries`.

> **Verifier note.** Two overstatements. "Two independent implementations of the same mechanic" is not quite right: growAll grows population AND GDP, advanceTurn grows population only, so they are not interchangeable — deleting growAll as proposed would remove the only GDP growth in the game. And "there is no rate at which the two systems are consistent" is simply wrong; both rates are literal constants and can be aligned. Medium rather than high: "Advance world" reads as an explicit manual/dev control in an unfinished engine, not a system silently miscalibrated against another.


### 7. `treasuries-are-a-fixed-linear-ramp` — With GDP frozen, every nation's treasury delta is a constant forever; 11 of 51 nations bleed money every turn with no recovery path

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/game.js, js/world.js` — lines game.js:26-28, 316-326 (320-321, 325); world.js:156

**Evidence**

```
game.js:320-321
```
const income = gdp * TAX_RATE;                                    // 0.02
const maintenance = gdp * (GOV_TYPES[n.gov] ?? GOV_TYPES.Republic) + n.counties.size * AREA_UPKEEP;  // 0.015, $40M/Area
```
delta = gdp*0.005 - areas*40e6, so break-even is $8.0B GDP per Area. Measured on data/game-data.json after the areas.json merge: 1136 of 1676 Areas (68%) are below break-even; median Area GDP is $4.93B.
Per-turn delta, computed on the real data:
  Montana  -$1.85B   Idaho -$1.11B   Wyoming -$663M   New Mexico -$585M   Alaska -$562M   Mississippi -$409M   West Virginia -$348M   Kentucky -$243M
  California +$17.9B  Texas +$9.69B  New York +$9.61B  Florida +$6.71B
  11 of 51 nations negative; aggregate +$78.7B/turn.
Because GDP never changes in `advanceTurn` (see that finding), `treasuryFlow(nid).delta` is literally constant, so treasury(t) = t * delta — Montana is at -$185B after 100 world turns.
```

**Why it matters.** A third of the map's nations are structurally insolvent from turn 1 with no mechanic that can ever reverse it: there is no GDP growth in the world turn, no debt, no bankruptcy, no way to trade upkeep for anything. `Game.spend` (game.js:336-342) gates on `n.treasury < amount`, so the moment any action costs money — which the target design requires for suppression, autonomy grants and military — those eleven nations are permanently locked out. It also rewards holding few, dense Areas and punishes exactly the large rural nations that the secession fantasy is about.

**Fix.** Make upkeep scale with what an Area is worth rather than flat: e.g. `maintenance = gdp * govRate + counties.size * AREA_UPKEEP_MIN + gdp * AREA_UPKEEP_RATE`, or make AREA_UPKEEP a function of Area population. Calibrate so the median nation is near zero, not the 78th percentile. Then add GDP growth to the world turn so the treasury is a dynamic rather than a straight line, and add a deficit consequence (rising unrest / sentiment penalty) instead of an unbounded negative number nobody reads.

> **Verifier note.** "delta is literally constant" and "treasury(t) = t * delta" hold only for a player who presses Advance World and never trades or completes a round — growAll(+5% GDP/round), boostGdp on every trade, and applyCivilWarCost all move the GDP the formula reads. More importantly, `Game.spend` has ZERO call sites in the codebase (grep confirms), and nothing reads `n.treasury` except the panel display at app.js:619 — so "those eleven nations are permanently locked out" is entirely prospective. The calibration objection is sound but its only present-day symptom is a negative number in a panel: medium, not high.


### 8. `market-inflates-to-the-ceiling` — Market demand tracks live population while supply tracks frozen GDP, so all six sector prices inflate monotonically and pin at MAX_P

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/market.js, js/world.js` — lines market.js:18-37 (24, 31, 34-35); world.js:157

**Evidence**

```
market.js:24 `const live = Game.countyGdp(aid) / 1e6; // $M`  -> supply is proportional to GDP, which `advanceTurn` never changes.
market.js:31 `if (perCap == null) perCap = gdpTotal / popTotal; // calibrate once at game start`
market.js:34 `const demand = DEMAND_SHARE[i] * perCap * popTotal;`  -> demand is proportional to population, which grows 0.93%/turn.
Simulated on data/economy.json + game-data.json with DEMAND_SHARE = [0.08,0.10,0.22,0.15,0.15,0.10] and ELASTICITY 1.3:
  t0   [Ag 81, Ex 124, Mfg 126, Trade 60, Fin 61, IT 41]
  t50  [148, 227, 231, 110, 111, 76]
  t100 [270, 400*, 400*, 201, 203, 138]   (* pinned at MAX_P)
  t150 [400*, 400*, 400*, 367, 371, 252]
  t200 [400*, 400*, 400*, 400*, 400*, 400*]  -- every sector pinned, market is a constant
Conversely with `growAll` only (GDP and pop both +5%), prices are byte-identical at r10, r50 and r100 — the market never moves at all.
```

**Why it matters.** The market has exactly two behaviours available and both are degenerate: a one-way ratchet to the ceiling, or perfectly frozen. The price trend arrows in `Market.html` (market.js:45-50) will show green for every sector for 200 turns and then nothing. Trade actions price against `Market.getPrices()` (actions.js:224, 308, 382), so the value of every trade deal inflates in lockstep regardless of what anyone does.

**Fix.** Recalibrate `perCap` against the live economy each turn instead of freezing it at t0 — e.g. `perCap = gdpTotal / popTotal` every update, so demand is "share of income" not "share of turn-0 income" — or, better, fix GDP growth (see that finding) so supply and demand share a clock. Then reserve MIN_P/MAX_P for genuine shocks rather than as the resting state.

> **Verifier note.** The "conversely with growAll only, prices are byte-identical at r10, r50 and r100" claim is wrong. growAll grows every county's GDP by exactly 5% but its population by only 5%x(1-extShare) — ext is omitted at game.js:296/303 — so demand/supply falls ~0.4%/round and prices slowly DEFLATE (~-31% over 100 rounds). They are identical only in the improbable case that none of the 16 regional parties spawned. Severity medium: this ramp requires the player to press Advance World ~150 times while never trading (any trade calls boostGdp, which lifts supply).


### 9. `js-python-engines-diverge` — js/world.js and game_state.py implement materially different simulations; the Python mirror cannot validate the JS engine

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `js/world.js, game_state.py` — lines world.js:24-38, 44-61, 66-88, 94-119, 124-138, 140-160; game_state.py:170-183, 186-207, 210-236, 239-255, 258-283, 286-304

**Evidence**

```
1. Emergent parties in DRIFT. Python game_state.py:201 `for p in set(src["parties"]) | set(target):` — drift covers emergent parties and pulls them toward the nation-wide share. JS world.js:51 `const pop = c.demPop + c.gopPop + c.othPop;` and 53-59 — drift is confined to D/R/Other and never touches `ext`.
2. Emergent parties in GROWTH. Python game_state.py:281 `grown = {p: int(round(n + growth * tot.get(p, 0) / nation_pop)) for p, n in cur.items()}` grows every party; JS world.js:84-86 grows only three. Measured: Python pop ratio t0->t1 = 1.010000 exactly; JS port = 1.009296.
3. Party leakage. Python drift ADDS a party to counties that do not have it (target keys union). Controlled test, Iowa, TestParty seeded in 1 of 99 counties: after drift it exists in 99/99 counties, after cleanup 1/99 — every turn, forever. JS has no such contagion at all.
4. Cleanup reachability. Python `phase_cleanup` fires on 98 leaked parties per nation per turn. JS `phaseCleanup` (world.js:124-138) can never fire — see the separate finding.
5. Equilibria. A one-county party settles at ~0.21 share in Python (drift pull vs gain) but 0.2777 in JS (no drift, dilution only).
6. Numeric contract. Python enforces `sum(parties) == population` exactly via `_counts_from_percentages` after every phase (game_state.py:109-115, 206, 235, 255); JS keeps floats, rounds only D/R/Other in one phase (world.js:84-86) and never rounds `ext`, with no invariant check anywhere.
7. Scope. Python `advance_turn` (286-304) has no treasuries, no market, no GDP, no Area merge, no ownership changes; JS `advanceTurn` (140-160) has all of them.
8. Data model. Python: `{"parties": {name: count}, "population": n, "owner": nid}`. JS: `{demPop, gopPop, othPop, ext:{}}` plus a separate `owner` Map and `nations` Map.
```

**Why it matters.** The file header calls this a mirror and the target design wants a 50-turn step-through simulator to expose runaway spirals. A mirror that produces a different equilibrium, a different growth rate, a different cleanup rate and an entire contagion mechanic the runtime does not have will validate the wrong engine and hide exactly the spirals it is meant to find.

**Fix.** Stop maintaining two engines. Either (a) delete the phase functions from game_state.py and drive the dev simulator against the real js/world.js under Node (no build step is needed — the IIFE globals load fine with a small shim), or (b) if Python must stay, adopt the Python data model in JS (`county.parties` as one map with an explicit `population`, core parties as reserved keys) so the two files can share a single line-for-line spec and a golden-output test. Pick one before the sentiment/authority/influence phases are written, because the divergence cost multiplies with each new phase.

> **Verifier note.** "The file header calls this a mirror" is false — game_state.py's docstring says "Serializable game-state model for Nation States" and never claims to mirror world.js; the mirror framing comes from the project brief, not the code. Sub-claim 7 also misstates JS: advanceTurn performs no ownership changes either. Severity medium: nothing drives game_state.py today (its only __main__ path is a round-trip guard), the JS engine is the shipped one, and the "will validate the wrong engine" harm is contingent on a dev simulator that does not exist yet.


### 10. `no-seeded-rng` — Five unseeded Math.random() call sites and no RNG state in the save — a turn cannot be replayed and a save/load does not reproduce the game

- **Severity:** medium  ·  **Category:** determinism
- **Where:** `js/turns.js, js/parties.js, js/civilwar.js, js/actions.js, js/saves.js` — lines turns.js:21; parties.js:59, 69; civilwar.js:19; actions.js:120; saves.js:9

**Evidence**

```
turns.js:21  `const j = Math.floor(Math.random() * (i + 1));`   (turn order, and `insertAfter` at 62)
parties.js:59 `if (Math.random() > (def.chance == null ? 0.5 : def.chance)) continue;`
parties.js:69 `const x = lo + Math.random() * (hi - lo);`
civilwar.js:19 `const roll = () => 1 + Math.floor(Math.random() * 6);`
actions.js:120 `if (Math.random() < P) {`
Grep for `seed|mulberry|xorshift|prng` across js/ returns nothing.
saves.js:9 `const snapshot = () => ({ v: 1, ts: Date.now(), game: Game.serialize(), turns: TurnSystem.serialize(), colorMode: store.colorMode });`  — no RNG state, no World turn, no Parties roster.
The JS world engine itself is deterministic, except that `phasePartyGrowth` is `ext`-key-order dependent (see that finding).
```

**Why it matters.** The target design asks for a developer dashboard with a 50-turn step-through simulator and live sliders — that is only useful if you can hold the seed fixed and vary one variable. It also asks for a player-facing "why did this happen?" layer, which needs the turn to be reconstructible. Today, loading a save and replaying gives a different turn order, different dice and a different party roster, so no A/B comparison and no bug reproduction is possible.

**Fix.** Add a tiny seeded PRNG module (mulberry32 is ~6 lines), route all five call sites through `Rng.next()`, store the seed and the current draw counter in `Game.serialize()`, and restore both in `loadState`. Then fix the `ext` key-order dependence in `phasePartyGrowth` so the world phases are order-independent as well.

> **Verifier note.** Severity medium rather than high: nothing in the shipped game replays a turn, and the justification rests on target-design features (a step-through simulator, live sliders, a "why did this happen?" layer) that do not exist yet. The party roster in particular is regenerated at app startup before any load, so it is not a save-replay defect so much as a missing capability.


### 11. `even-split-gdp-flattens-the-map` — boostGdp and the civil-war GDP transfer both split the amount evenly per Area, flattening the GDP map toward uniformity

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/game.js` — lines 279-288 (284, 286-287); 328-333 (331-332)

**Evidence**

```
game.js:284 `for (const f of loser.counties) { const take = county[f].gdp * gPct; county[f].gdp -= take; moved += take; }`  <- taken PROPORTIONALLY
game.js:286-287 `const perW = moved / winner.counties.size;` / `for (const f of winner.counties) county[f].gdp += perW;`  <- given back EVENLY
game.js:331-332 `const per = amount / n.counties.size;` / `for (const f of n.counties) county[f].gdp += per;`
Measured on California (58 Areas, GDP min $0.127B, max $1006B, ratio 7888x). Twenty $5B trade deals ($100B, ~$1.72B per Area): min becomes $1.85B, max $1006B, ratio 543x. The smallest Area's GDP grew 14.6x; the largest's grew 0.17%.
```

**Why it matters.** Every economic action is a levelling operation. Trade deals (actions.js:358-359, 411, 449-450) and won wars both push county GDPs toward equality, so the GDP map mode goes flat the same way the political map does, and the Market's supply model (market.js:24-27, which scales the baked sector profile by live Area GDP) starts reporting Los Angeles and rural Modoc as comparable producers. The target design's economic-supremacy win condition and county-level Quality of Life both read GDP per Area.

**Fix.** Distribute proportionally to existing GDP, matching how the loss is taken: `const total = [...n.counties].reduce((s,f)=>s+county[f].gdp,0) || 1; for (const f of n.counties) county[f].gdp += amount * (county[f].gdp / total);`. If a deliberate levelling effect is wanted somewhere (post-war reconstruction), make it an explicit, named, opt-in rule rather than the default for every GDP transfer in the game.

> **Verifier note.** Worth noting the even split is stated intent, not an oversight — game.js:327 says "add GDP to a nation, spread evenly across its areas". So this is a balance objection to a deliberate rule rather than a defect. The magnitude claim still stands, and the knock-on to market.js:24-27 (supply scaled by live Area GDP) is real.


### 12. `double-buffering-does-not-hold` — The advertised "double buffering" discipline is false: two of four phases read nxt written by earlier phases, one reads only nxt, and ownership is read live

- **Severity:** low  ·  **Category:** architecture
- **Where:** `js/world.js, game_state.py, DESIGN.md` — lines world.js:6-10, 27, 47, 76, 79-81, 100-104, 124-138; game_state.py:290-296; DESIGN.md:118-122

**Evidence**

```
Claim, world.js:9-10: `* No phase ever reads a value it has already updated this turn, so feedback loops` / `* can't compound within a single turn.` (repeated at DESIGN.md:119-122 as "strict double buffering").
Actual reads of already-written `nxt`:
  world.js:100-104 (phasePartyGrowth) `const c = nxt[f];` ... `const sh = { _d: c.demPop / pop, ... }` — base shares come from post-drift nxt.
  world.js:79-81 (phasePopulationGrowth) `// per-county counts from nxt (post-drift, so phases compose);` / `const c = nxt[f];` — post-drift AND post-partyGrowth.
  world.js:124-138 (phaseCleanup) reads `nxt` exclusively.
Only phasePoliticalDrift (world.js:50 `const c = snap[f];`) is genuinely snapshot-driven.
Ownership is never snapshotted: world.js:27, 47 and 76 all call `Game.getOwner(f)` against the LIVE `owner` Map.
```

**Why it matters.** The header is load-bearing documentation that a future contributor will trust when adding phases — and the target design adds many (sentiment, authority, influence, county defection, movement breakaway, occupation cost). Under the real semantics, phase order silently determines the result, and any phase that moves a county (continuous county defection is explicitly planned) will make every subsequent phase in the SAME turn see the new owner, creating exactly the within-turn feedback the comment promises cannot happen. It also masks the ext-dilution bug: because popGrowth runs on nxt after partyGrowth, partyGrowth's carefully computed share is immediately diluted.

**Fix.** Pick one and enforce it. Either (a) make it a real pipeline and say so — rename the comment to "sequential phases; cross-county aggregates come from snap, per-county values compose" — or (b) make it actually double-buffered: give each phase its own `prev`/`next` pair and swap between phases. Either way, snapshot ownership too: build `const ownerSnap = {}; for (const f in Game.county) ownerSnap[f] = Game.getOwner(f);` in advanceTurn and have every phase read `ownerSnap[f]`.

> **Verifier note.** The framing is wrong in two ways. (1) The cross-phase composition is not an accident being papered over — it is documented at the exact line where it happens: world.js:79-80 "per-county counts from nxt (post-drift, so phases compose); the nation mix still comes from snap", mirrored verbatim at game_state.py:275-276. And the invariant that actually prevents feedback compounding — every cross-county aggregate (the lean cache at 24-38, natTotals at 68-74) is built from `snap` — does hold in every phase. The header sentence "No phase ever reads a value it has already updated" is literally true per-phase: no phase reads back its own writes. (2) Ownership is immutable for the duration of advanceTurn — no phase calls moveCounties or touches the owner Map — so reading it live is currently bit-identical to a snapshot. The whole hazard is prospective, contingent on phases the target design has not been written yet. This is documentation-precision, severity low.


### 13. `partygrowth-overwrites-drift` — phasePartyGrowth assigns sh[name] = cur + gain from the SNAPSHOT, discarding the drift phase's result, and is dependent on ext key insertion order

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/world.js, game_state.py` — lines world.js:94-119 (esp. 106-109); game_state.py:210-236 (esp. 226-233)

**Evidence**

```
world.js:106-109
```
const cur = s.ext[name] / spop;              // snapshot share (0..1)
const gain = PARTY_STEP * (PARTY_CEILING - cur);
for (const q in sh) if (q !== name) sh[q] *= 1 - gain;
sh[name] = cur + gain;
```
`sh[name]` was just initialised from `nxt` at line 104 (`sh[p] = c.ext[p] / pop`) and is then thrown away by the assignment at 109. game_state.py:233 is identical (`sh[name] = cur + gain`).
I ran the exact port on a county with snapshot ext share 10%:
  drift pushed the party UP to 15%  -> post-growth share 0.113024
  drift pushed the party DOWN to  5% -> post-growth share 0.102344
A 10-point spread in drift output collapses to 1.1 points, and only via the renormalisation denominator.
Order dependence, two emergent parties with IDENTICAL inputs (each 10% of a 1000-person county):
  iteration order A,B -> A=0.106455  B=0.107260
  iteration order B,A -> A=0.107260  B=0.106455
The loop at 108 scales B by (1-gainA), then line 109 for B overwrites that scaling — last party in `Object.keys(s.ext)` wins by 0.08 points.
```

**Why it matters.** phasePartyGrowth is documented as composing with drift ("the gained share is taken proportionally from all OTHER parties"), but for the growing party itself it is a hard reset to snapshot+gain. Political drift on emergent parties is ~89% discarded. In the target design where movements (Deseret, Cascadia, New Confederacy) are supposed to respond to sentiment factors, the response is overwritten every turn. The key-order dependence also breaks replayability and makes two identically-seeded movements settle at different strengths for no modelled reason.

**Fix.** Make it an increment on the post-drift value and compute all gains before applying any of them:
```
const gains = {};
for (const name of names) gains[name] = PARTY_STEP * (PARTY_CEILING - s.ext[name] / spop);
const totalGain = Object.values(gains).reduce((a,b)=>a+b, 0);
for (const q in sh) if (!(q in gains)) sh[q] *= 1 - totalGain;
for (const name in gains) sh[name] += gains[name];
```
This is order-independent, keeps the drift result, and needs no renormalisation fudge. Mirror it in game_state.py.

> **Verifier note.** The headline claim is FALSE for the JS engine. `phasePoliticalDrift` never writes `c.ext` — measured max absolute change to any ext value across a full drift phase over all 1676 Areas is exactly 0, and the county total is preserved to 3.4e-16 relative. Therefore `c.ext[name]/pop` (nxt) is identical to `s.ext[name]/spop` (snap), and `sh[name] = cur + gain` is arithmetically the same as `sh[name] += gain` for a single-party county. There is no drift result on emergent parties to discard, and the cited experiment ("drift pushed the party UP to 15% -> post-growth 0.113024") is unreachable in js/world.js — it requires a drift that moves ext, which only game_state.py has. So "political drift on emergent parties is ~89% discarded" is wrong for JS; the genuine drift-discard bug exists only at game_state.py:233. What remains in JS is an ext-key-order determinism bug worth ~0.08 share points — real, and the fix is right, but low severity.


### 14. `party-floor-unreachable` — PARTY_FLOOR = 0.01 is mathematically unreachable in JS, so phaseCleanup is dead code; the same constant fires on every county every turn in Python

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/world.js, game_state.py` — lines world.js:18-20, 124-138; game_state.py:23-25, 201, 239-255

**Evidence**

```
world.js:18-20
```
const PARTY_CEILING = 0.35;
const PARTY_STEP = 0.03;
const PARTY_FLOOR = 0.01;
```
The minimum possible post-growth share is `PARTY_STEP * PARTY_CEILING = 0.03 * 0.35 = 0.01050` (world.js:107-109 with cur=0), and after the worst-case population-growth dilution that is 0.01050/1.01 = 0.01040 — still above 0.01. So `c.ext[p] / pop < PARTY_FLOOR` at world.js:131 can never be true after a growth phase.
Confirmed empirically: over 500 simulated turns on the real data, the count of county-party pairs stayed at exactly 1088 and the count of counties holding a party at exactly 1053 — phaseCleanup never removed anything.
In Python the same 0.01 is hot: `phase_political_drift` (game_state.py:201) leaks every nation-level party into every county of the nation at a sub-floor share, and `phase_cleanup` deletes them again in the same turn. Controlled Iowa test: 99 counties hold TestParty after drift, 1 after cleanup, every turn.
```

**Why it matters.** The JS engine ships a documented mechanic ("counties splintering into tiny parties is stopped" — world.js:121-123, DESIGN.md:131-132) that does nothing, so nobody will notice when tuning breaks it. The Python engine burns ~57% of its remaining turn budget on 98 dict inserts + deletes + two full renormalisations per county per turn for a net-zero result. And when the target design adds parties that can shrink (movements losing support), the JS floor will start firing in a way nobody has ever observed.

**Fix.** In JS, either drop `phaseCleanup` until a shrink mechanic exists, or raise PARTY_FLOOR above `PARTY_STEP * PARTY_CEILING` (e.g. 0.02) so it can bite. In Python, restrict the drift party set to `set(src["parties"])` unless contagion is a deliberate mechanic — and if it is, implement it in JS too, with a spread threshold instead of an immediate cleanup.

> **Verifier note.** "Mathematically unreachable" is not proven. The bound PARTY_STEP x PARTY_CEILING = 0.0105 ignores the renormalisation denominator at world.js:111-112, which exceeds 1 once several parties gain in the same county; with four near-zero parties the post-growth share can fall to ~0.0098, below the 0.01 floor. The floor is unreachable in practice on this data, not in principle. Severity low: the JS half is dead code with no behavioural effect, and the Python half is a self-cancelling net-zero.


### 15. `two-definitions-of-lean` — The engine's nation lean excludes emergent parties from the denominator while every UI read includes them — the two numbers diverge by up to 7 points

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/world.js, js/game.js` — lines world.js:24-38 (30, 34-35), 44-61 (51); game.js:79-88 (82, 84), 90-112 (102, 107-109)

**Evidence**

```
Engine, world.js:30 and 34: `t.d += snap[f].demPop; t.g += snap[f].gopPop; t.o += snap[f].othPop;` ... `const t = totals[k], pop = t.d + t.g + t.o;` — `ext` is not in the denominator.
UI, game.js:82: `const t = c.demPop + c.gopPop + c.othPop + extSum(c);` and game.js:102: `const pop = dem + gop + oth + ext;` — `ext` IS in the denominator.
Measured on Area 01001 at t0 (New Confederacy at 9.6%): UI reports dem = 20.91%, the drift target math uses dem = 24.64% — a 3.74-point gap. At the converged emergent-party share of 0.2777 the gap is `engineDem * 0.2777`, i.e. ~7 points for a 25%-D county.
```

**Why it matters.** The panel tells the player their nation is 48% D while the drift phase is steering every county toward 66%. The target design's headline feature is a player-facing "why did this happen?" explanation layer; it cannot explain a drift target the UI has never shown. It also means the emergent-party share is invisible to the mechanic that is supposed to be reacting to it — a nation that is 28% New Confederacy drifts as though that bloc does not exist.

**Fix.** Pick the full-population denominator (it is the one the player sees) and use it everywhere: include `ext` in `phaseRecomputeLeans` totals and in the county share computation at world.js:51-59, and drift emergent parties toward their nation share the way game_state.py:201 already does. Then export the lean cache from `World` so the explanation layer and the panel read the same object.

> **Verifier note.** The consequence is wrong. The engine is internally consistent: world.js:51 computes the COUNTY's own share on the same core-only denominator as the nation target, so drift converges each county's UI-visible dem% to natCoreDem x (1 - countyExtShare), not to natCoreDem. I verified this at t200: max |UI dem% - natCoreDem x (1-extShare)| = 1.55 points, median 0.017. So there is no "panel says 48% while drift steers toward 66%" — the panel number is the correct destination once the county's own ext share is accounted for. The one real point buried here (drift ignores emergent parties entirely) is already finding 10 item 1. Low, and a documentation issue rather than a correctness one.


### 16. `world-turn-not-saved` — Save/load loses the world turn counter, the emergent-party roster and the market calibration

- **Severity:** low  ·  **Category:** save-load
- **Where:** `js/saves.js, js/world.js, js/parties.js, js/market.js` — lines saves.js:9, 16-26; world.js:15, 158, 164; parties.js:14, 83; market.js:16, 31

**Evidence**

```
saves.js:9 `const snapshot = () => ({ v: 1, ts: Date.now(), game: Game.serialize(), turns: TurnSystem.serialize(), colorMode: store.colorMode });`
Not captured: `World`'s module-local `let turn = 0;` (world.js:15, incremented at 158, read by app.js:499 for the banner); `Parties`' `let spawned = []` (parties.js:14, exposed at 83); `Market`'s `prices`/`prev`/`perCap` (market.js:16).
`SaveManager.apply` (saves.js:16-26) restores only TurnSystem and Game.
```

**Why it matters.** Load a 60-world-turn save and the banner reads "World turn 0" (or whatever the current session happens to be at), which is a straight lie about game age — and Authority in the target design is explicitly a function of the age of the nation. `Parties.getSpawned()` is stale, so any UI keyed on the roster is wrong. `Market.perCap` is whatever the loading session calibrated, so prices shift on load. And `Game.serialize` (game.js:345-351) does not carry the RNG state either (see the determinism finding).

**Fix.** Add `world: World.getTurn()`, `parties: Parties.getSpawned()` and `market: { perCap, prices, prev }` to the snapshot, add matching `loadState` entry points to each module, and bump the save format `v`. While there, guard `Game.loadState` (game.js:352-365) against counties in the save that are not live Area ids — today they are silently skipped at line 355 and any Area missing from every nation's list becomes permanently ownerless, which makes `World` skip it in every phase forever.

> **Verifier note.** Two of the three consequences are wrong. (a) `Parties.getSpawned` has zero call sites in js/ (grep confirms) — nothing is keyed on the roster, so a stale roster affects nothing. (b) `Market.perCap` does NOT vary by session: app.js:68 calls Market.update() at startup, before any save can be loaded, and perCap = gdpTotal/popTotal is computed from the pristine baked data — Parties.setup preserves per-county totals and never touches GDP — so it is the same constant in every session and prices do not shift on load because of it. What genuinely survives: the world-turn counter resets, and `prices`/`prev` are the turn-0 values until the next Market.update(), so a trade signed immediately after loading a late-game save is valued at turn-0 prices. Low.


### 17. `civilwar-cost-noop-on-total-conquest` — applyCivilWarCost silently does nothing when the victim was fully annexed — the winner pays no cost and receives no GDP

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/game.js, js/actions.js` — lines game.js:265-290 (266-267, 279); actions.js:569-571

**Evidence**

```
actions.js:569-571
```
} else if (res.outcome === 'victory') {
  Game.moveCounties(chosen, nid);
  Game.applyCivilWarCost(victim, nid, res.score);
```
`moveCounties` calls `pruneEmpty()` (game.js:221, 236-238), which deletes any nation left with zero counties. So if `chosen` was everything the victim owned, `nations.get(loserId)` at game.js:266 returns undefined.
game.js:267 `if (loser && loser.counties.size) { ... }`  -> population loss skipped
game.js:279 `if (winnerId && nations.has(winnerId) && loser && loser.counties.size) { ... }`  -> GDP transfer skipped
The function still reaches `emit()` at 289 and returns normally, and the toast at actions.js:572 still says "Complete victory!".
```

**Why it matters.** The single most decisive outcome in the game — annexing a nation out of existence — is the one that costs nothing and transfers nothing. That is backwards for anti-snowball: it makes total conquest strictly cheaper than partial conquest, which does pay the cost (actions.js:576-577). Combined with `blueShell` only scaling the civil-war score, the dominant strategy is to take everything at once.

**Fix.** Capture the victim's county set and demographics BEFORE `moveCounties`, and apply the cost against that snapshot — or restructure `applyCivilWarCost(loserCounties, winnerId, score)` to take an explicit list rather than looking the nation up after it has been pruned. Assert in the annex path that a `victory` outcome always produces a nonzero cost.

> **Verifier note.** The "why it matters" is backwards. `applyCivilWarCost` never charges the WINNER anything in either branch: because it runs AFTER moveCounties, `loser.counties` is the remnant the winner did NOT take, so the population loss always falls on territory the winner does not own. Partial conquest therefore leaves the winner unharmed AND hands it gPct of the remnant's GDP; total conquest leaves it unharmed and hands it nothing (the GDP is already all its own). Total conquest is if anything marginally WORSE for the winner, not "strictly cheaper", and the "dominant strategy is to take everything at once" conclusion does not follow. What is genuinely wrong is that annihilating a nation produces no fallout at all while the UI announces a decisive war — a flavour/consistency gap. Low.


### 18. `python-engine-perf` — game_state.py deep-copies immutable neighbour lists twice per turn (57% of turn cost) and rebuilds nation membership with an O(counties) scan per query

- **Severity:** low  ·  **Category:** performance
- **Where:** `game_state.py` — lines 286-304 (295-296); 142-166 (143)

**Evidence**

```
game_state.py:295-296
```
snap = copy.deepcopy(state["counties"])
nxt = copy.deepcopy(state["counties"])
```
Each county record carries `"neighbors": neighbors.get(fips, [])` (game_state.py:47) — a list of ~6 strings that is never mutated — plus `"attrs"`, `"name"`, `"id"`, `"est"`. Measured on the real 3143-county state: the two deepcopies take 0.054s of a 0.095s `advance_turn` (57%); full turn 0.18s under instrumentation.
game_state.py:143 `return [c for c in state["counties"].values() if c["owner"] == nation]` — `_owned` scans all 3143 counties, and `nation_lean` -> `nation_party_totals` -> `_owned` means a per-nation loop is O(51 * 3143).
```

**Why it matters.** The target design calls for a developer dashboard with a 50-turn step-through simulator graphing Authority/Sentiment/Influence, plus live sliders. At 0.18s/turn a single 50-turn run is 9s, and a slider sweep of 20 values is 3 minutes — too slow to be the tuning tool it is meant to be. The cost is pure waste: only `parties` and `population` are ever written by the phases.

**Fix.** Copy only what mutates:
```
snap = {f: {"owner": c["owner"], "population": c["population"], "parties": dict(c["parties"])} for f, c in state["counties"].items()}
```
and write the phase results back onto the existing records instead of replacing `state["counties"]` wholesale at line 302. Separately, maintain an `owner -> [fips]` index in `state` and invalidate it on ownership change, so `_owned` is O(1).

> **Verifier note.** Two overstatements. The 0.18s/turn figure is ~2.5x the real cost — I measure 0.073s, so a 50-turn run is 3.7s, not 9s, and a 20-value slider sweep is ~75s, not 3 minutes. And the `_owned` O(counties) scan is not on any hot path: nation_population / nation_party_totals / nation_lean are called only from roundtrip_guard, never from advance_turn or any phase, so "a per-nation loop is O(51 x 3143)" describes code nothing executes. Low: this is a micro-optimisation on a module with no consumer today.


### 19. `advanceturn-bypasses-emit` — World.advanceTurn writes Game.county records directly and never emits, so any driver other than the one button leaves the UI stale

- **Severity:** low  ·  **Category:** architecture
- **Where:** `js/world.js, js/game.js, js/app.js` — lines world.js:152-159; game.js:208-209, 371; app.js:503

**Evidence**

```
world.js:152-155
```
for (const f in nxt) {
  const c = Game.county[f], v = nxt[f];
  c.demPop = v.demPop; c.gopPop = v.gopPop; c.othPop = v.othPop; c.ext = v.ext; c.gdp = v.gdp;
}
```
This mutates the raw exported `county` object (game.js:371) rather than going through a mutator, and neither it nor `Game.tickTreasuries` (game.js:324-326) calls `emit()` (game.js:209). Every other mutation path does — `moveCounties` (222), `growAll` (310), `boostGdp` (333), `applyCivilWarCost` (289), `loadState` (364).
The single caller compensates manually: app.js:503 `document.getElementById('tb-advance').onclick = () => { World.advanceTurn(); onGameChange(); };`
```

**Why it matters.** The target design adds AI opponents and a developer dashboard that will both need to drive the world engine. Any caller that forgets the manual `onGameChange()` gets a silently stale map, leaderboard and panel with no error. It is also the one place in the codebase that writes county state without going through Game, which will make the planned "single persistent JSON that editor + game + tooling read and WRITE IN PLACE" harder to enforce.

**Fix.** Add a `Game.applyCountyState(nxt)` mutator that does the writeback and calls `emit()`, and have `advanceTurn` use it. Then drop the manual `onGameChange()` at app.js:503.

> **Verifier note.** Confirmed by reading. world.js:152-155 writes straight into the raw exported `Game.county` object (game.js:371) and neither it nor Game.tickTreasuries (game.js:324-326) calls emit() (game.js:209), while moveCounties (222), growAll (310), boostGdp (333), applyCivilWarCost (289) and loadState (364) all do. app.js:503 compensates by calling onGameChange() manually, and it is the sole caller. The severity assessment (low, architecture) is accurate — the risk is entirely about future drivers.


### 20. `leanof-ignores-emergent-parties` — leanOf and demographics reduce every county to a D/R letter, so an emergent party can never hold a county, trigger a civil war, or affect a splinter plan

- **Severity:** low  ·  **Category:** ux
- **Where:** `js/game.js, js/civilwar.js, js/actions.js` — lines game.js:87, 110; civilwar.js:23, 31-34; actions.js:104, 107, 599

**Evidence**

```
game.js:87  `return { lean: dem >= gop ? 'D' : 'R', margin: Math.abs(dem - gop), dem, gop, other, extPct };`
game.js:110 `lean: pop ? (dem >= gop ? 'D' : 'R') : null,`
A county that is 34% New Confederacy / 33% D / 33% R reports lean 'D', margin 0.
civilwar.js:23 `const flip = before.lean != null && after.lean != null && before.lean !== after.lean;` and 31-34 `diceCount` both read only that letter, so annexing a bloc of emergent-party counties can never flip a nation or add dice.
actions.js:104/107 build the entire splinter plan from `Game.leanOf(c)?.lean` equality, and actions.js:599 (`partialSubset`) does the same.
At the simulated equilibrium the emergent bloc is 27.77% of the counties that hold one — larger than either core party in many of them.
```

**Why it matters.** Regional parties are the seed of the whole movement/secession design (Deseret, Cascadia, New Confederacy, A Free Texas are all `ext` buckets today), yet they are invisible to every consequential decision the game makes. `Parties.blocs` (parties.js:43-54) already computes proper coalition shares and is used only for display.

**Fix.** Replace the D/R letter with the winning bloc id from `Parties.blocs(demo)[0].group`, and make `CivilWar.assess`/`diceCount` compare bloc ids and use the winning bloc's share instead of `after.dem`/`after.gop`. `planSplinter` and `partialSubset` then group by bloc, which is also what the target design's Movement (ideology + homeland) concept needs.

> **Verifier note.** Confirmed by reading. game.js:87 and game.js:110 both reduce to `dem >= gop ? 'D' : 'R'`, so a 34/33/33 county reports lean 'D' with margin 0. civilwar.js:23 and 31-34 read only that letter, and actions.js:104/107 (planSplinter) and 599 (partialSubset) build their entire county grouping from letter equality. Parties.blocs is confirmed display-only: its single call site is app.js:830 in the panel bars. If anything the finding understates the equilibrium case — at t200 the largest emergent party outpolls BOTH core parties in 667 of the 1326 Areas that hold one (50%), not merely "many".



## Player actions & civil war (26 findings)

### 21. `annex-is-free-and-exponential` — Annexation costs nothing and its cap is a multiple of your own size, so the map is conquered in 3–10 turns

- **Severity:** critical  ·  **Category:** balance
- **Where:** `js/actions.js, js/game.js` — lines actions.js 494-511, 550-595, 469; game.js 211-223

**Evidence**

```
actions.js:504  `if (added.pop >= A.capFactor * A.before.pop || added.gdp >= A.capFactor * A.before.gdp) {`
actions.js:469  `capFactor: 2 - shell`
actions.js:565-568  `if (!res.triggered) { Game.moveCounties(chosen, nid); msg = 'Annexed ...'; kind='good'; }`
There is no treasury debit, no population cost, no cooldown, no per-turn area limit and no war-weariness anywhere in confirmAnnex.
```

**Why it matters.** I swept all 943 legal single-Area annexations at turn 0 against data/game-data.json + data/areas.json: only 21 (2.2%) trigger a civil war at all. The other 97.8% are free land. Because the cap is 2x your OWN pop and GDP, a greedy 'take the largest set that stays under the trigger' play doubles a nation every single turn. Simulated: Wyoming (0.59M pop, $51B) goes 27 -> 33 -> 44 -> 63 -> 108 -> 178 -> 311 -> 569 -> 1167 of 1676 Areas in 9 turns. Vermont takes 10. California takes 3 turns (238 -> 539 -> 1172 Areas, $27.6T GDP). No civil war is ever triggered on that path. There is no reason to ever pick any other action.

**Fix.** Make the cap absolute, not relative: a per-turn annex budget in Areas (e.g. 1-3) or in military/treasury points that Game.spend() actually debits. Charge for annexation (treasury, population, unrest) and add occupation cost so held territory costs upkeep. Trigger the civil war check on the ratio of *what you took this turn* to what you already held, not just on absolute pop/GDP exceedance.

> **Verifier note.** Two supporting numbers are off. The '943 legal single-Area annexations' figure ignores the startAnnex `blocked` gate — with it applied there are 610 legal first picks, of which 9 trigger a war (1.5%); without it, 943 legal and 15 triggers (1.6%), not 21. Either way the qualitative claim (97.8%+ of annexations are free land) holds, and my simulation is faster than the one quoted, so the severity is if anything understated.


### 22. `dice-product-unbounded` — diceCount has no cap; a real party flip produces 4–10 dice and scores in the tens of millions, so every flip war is a guaranteed fall_apart

- **Severity:** critical  ·  **Category:** balance
- **Where:** `js/civilwar.js` — lines 31-35, 46-52

**Evidence**

```
civilwar.js:34  `return Math.max(1, Math.ceil(50 - oldMajorityShareAfter)); // how far past 50 into the other party`
civilwar.js:49  `for (let i = 0; i < dc; i++) { const d = roll(); dice.push(d); product *= d; }`
civilwar.js:51  `const score = dc ? Math.round(pts * product * mult) : 0;`
```

**Why it matters.** I ran a greedy 'maximise the flip within the cap' selection for all 51 nations. Real dice counts: Pennsylvania 10 dice / 223 pts, New Mexico 8 / 32, North Carolina 6 / 187, Michigan 6 / 155, Indiana 6 / 114, Texas 4 / 590, Florida 4 / 383. At 10 dice the median product is 3.5^10 = 2.8e5, so score ~= 223 * 2.8e5 = 6.2e7 — six orders of magnitude past the 67 threshold. Even the *minimum* possible product (all ones, p = 1.65e-8) gives 223, still fall_apart. Exact outcome table: (pts=3, 5 dice) = 1.5% victory / 3.0% partial / 95.5% fall apart; (pts=1, 10 dice) = 100% fall apart. So the score is not a random variable, it is a step function of diceCount. Worse, `50 - after.dem` conflates 'below 50%' with 'lost the majority': once emergent parties exist (Parties.setup gives them up to 20% + all of Other, and World.phasePartyGrowth grows them toward a 35% ceiling), dem and gop both sit far below 50 and a 1-point flip yields 10-15 dice.

**Fix.** Cap dc (e.g. Math.min(6, ...)) and, more importantly, replace the multiplicative product with a sum of dice or a single roll modified by dc, so score grows linearly rather than as 3.5^n. Compute the flip magnitude as `oldMajorityShareAfter - max(otherShares)` (distance from *plurality*), not `50 - share`, so third parties don't inflate it.

> **Verifier note.** (pts=1, 10 dice) is 99.958% fall apart, not 100% (product can be as low as 1). The Texas 4/590 and Florida 4/383 examples are impossible at turn 0: Florida's only neighbours are Georgia and Alabama, both R like Florida, so no flip-capable annexation exists at all; Texas would need a ~3.6M net Democratic swing and its largest D neighbour (New Mexico) has 2.13M people total. North Carolina and Michigan also produced no flip in my search under the cap.


### 23. `fall-apart-is-a-territorial-noop` — fall_apart does nothing territorially for any selection smaller than MIN_NATION, and the flash message says the opposite

- **Severity:** high  ·  **Category:** correctness
- **Where:** `js/actions.js, js/game.js` — lines actions.js 580-588, 614-616; game.js 240-262, 181-190

**Evidence**

```
actions.js:581  `const bornIds = fragment(chosen, nid);`
actions.js:615  `return Game.breakApart(chosen, { exclude: attackerId });`
game.js:254-257  `for (const comp of small) { const near = nearestNationForGroup(comp, exclude); if (near) moveCounties(comp, near, { silent: true }); ... }`
game.js:216-217  `const from = owner.get(f); if (from === toId) continue;`
actions.js:587  `... The ${chosen.length} counties scattered and were absorbed by neighboring nations.`
```

**Why it matters.** `chosen` is grown from the attacker's frontier so it is almost always one contiguous component. If that component has fewer than MIN_NATION (10) Areas it goes to nearestNationForGroup(comp, attacker) — and the attacker is the only excluded nation, so the tally is won by the county's own current owner. moveCounties then hits `if (from === toId) continue` and does nothing. I evaluated this for the real turn-0 trigger cases: Boone->Illinois, Chisago->Minnesota, Lucas->Ohio, Cook->Illinois, New York County->New York, Camden->New Jersey, Capitol Planning Region->Connecticut. Every one is a no-op that returns the Area to the nation that already owned it, while the toast tells the player the counties 'scattered and were absorbed by neighboring nations' (bornIds is empty, so it takes that exact branch). The only exception found was DC -> Fairfax, where a *third* nation (Maryland) is handed Fairfax County for doing nothing.

**Fix.** Exclude the attacker AND make the victim's retention explicit: if no fragment reaches MIN_NATION, the correct outcome is 'the annexation failed, the defender keeps everything', with the message to match. Separately, drop MIN_NATION for breakaways born from a *war* (they should be allowed to be small) or seed them from a movement definition, per the target design.

> **Verifier note.** It is not universal: the no-op only bites when the chosen component is under MIN_NATION (10 Areas). Larger selections — which the free-annex exploit makes the normal case — do produce real breakaway nations.


### 24. `attacker-loses-nothing-real-on-defeat` — On fall_apart the attacker keeps every county and all of its GDP; only ruling-party population bleeds

- **Severity:** high  ·  **Category:** balance
- **Where:** `js/actions.js, js/game.js` — lines actions.js 583; game.js 265-290

**Evidence**

```
actions.js:583  `Game.applyCivilWarCost(nid, null, res.score); // the failed aggressor bleeds population`
game.js:279  `if (winnerId && nations.has(winnerId) && loser && loser.counties.size) {`
game.js:271  `const lossPct = clamp(0.02 + score / 2500, 0.02, 0.4); // 2%..40% of ruling party`
```

**Why it matters.** winnerId is null, so the whole GDP-transfer block at game.js:279-288 is skipped: the attacker's GDP is untouched. It also keeps 100% of its territory — nothing in the fall_apart branch calls moveCounties on the attacker. The only cost is 2%-40% of its ruling party's population, and because of the Math.max(0,...) clamp (see the flat-subtraction finding) the realised loss at the 40% cap is only 57% of that for California. Combined with the previous finding (the defender usually keeps nothing extra either), the worst possible outcome of a declared war is: nobody's borders move and the aggressor loses ~5% of one party. That is not a deterrent, and it is not a civil war.

**Fix.** On fall_apart the attacker must actually fracture: run breakApart on the attacker's own disloyal/peripheral Areas (that is what 'the union fell apart' means), transfer GDP to the defender, and apply a multi-turn war-weariness modifier. Give applyCivilWarCost a GDP-destruction path independent of a winner.

> **Verifier note.** 'the aggressor loses ~5% of one party' understates by roughly 4x. For California the realised worst case is 5.24M of 22.87M Democrats = 22.9% of the ruling party, or 13.3% of total population. Still a weak deterrent, but not 5%.


### 25. `civilwar-cost-flat-subtraction` — applyCivilWarCost subtracts a flat per-Area amount, zeroing out a party in small Areas and silently delivering ~57% of the intended loss

- **Severity:** high  ·  **Category:** simulation-integrity
- **Where:** `js/game.js` — lines 265-290

**Evidence**

```
game.js:272  `const per = (lossPct * (rulingDem ? d : g)) / loser.counties.size; // spread evenly by county`
game.js:274-276  `const c = county[f];
        if (rulingDem) c.demPop = Math.max(0, c.demPop - per);
        else c.gopPop = Math.max(0, c.gopPop - per);`
```

**Why it matters.** Dividing by counties.size instead of scaling proportionally means a 12k-person rural Area and a 9.8M-person metro Area lose the same absolute headcount. At the 40% cap (score >= 950, reached by essentially any flip war): California — 34 of its 58 Areas have their entire Democratic population driven to zero, and the realised loss is 5.24M of the intended 9.14M (57.3%). New York: 32 of 50 Areas zeroed, 66.7% delivered. Montana: 27 of 56 zeroed, 75.5%. Zeroing a party in an Area is not recoverable — World.phasePoliticalDrift multiplies shares, so a 0 stays a 0 until growth reseeds it from the nation mix. Also note `rulingDem = d >= g` (game.js:270) ignores othPop and every ext party, so a regional party that is the actual plurality never suffers a war loss.

**Fix.** `const k = 1 - lossPct;` then `c.demPop *= k` (or gopPop) per Area — proportional, exact, and no clamping needed. Determine the ruling party by comparing demPop, gopPop, othPop and every c.ext entry, not just d vs g.

> **Verifier note.** 'Zeroing a party in an Area is not recoverable... a 0 stays a 0' is wrong. World.phasePoliticalDrift is additive on shares (`d = (c.demPop/pop)*100; d += s*(tgt.d - d)`), so a zeroed party immediately regrows to 2% of the owner nation's share each turn, and phasePopulationGrowth separately adds new residents in the nation mix. The distortion is real but self-healing, not permanent.


### 26. `unite-dominated-by-annex` — unitePeaceChance is driven by S's own size share, so Unite is either a free win against someone you could annex for free, or a hopeless bid — never an interesting choice

- **Severity:** high  ·  **Category:** balance
- **Where:** `js/civilwar.js` — lines 59-68

**Evidence**

```
civilwar.js:60-62  `const popShare = S.pop + T.pop > 0 ? S.pop / (S.pop + T.pop) : 0.5;
    const gdpShare = S.gdp + T.gdp > 0 ? S.gdp / (S.gdp + T.gdp) : 0.5;
    const sizeScore = 0.6 * popShare + 0.4 * gdpShare;`
civilwar.js:65  `let p = sizeScore * (0.6 + 0.4 * politSim);`
```

**Why it matters.** p is bounded above by sizeScore, so two equally sized nations with identical politics can never exceed 50% — Ohio uniting Pennsylvania computes to 45.9% (sizeScore 0.477, politSim 0.91). Meanwhile New York uniting Vermont is 72.7% and Colorado uniting Wyoming is 70.3% — but those are exactly the cases where Annex takes the same territory at 0% risk. Upward unions are pinned at the floor: Vermont->New York 3.0% (the Math.max(0.03) clamp), Nevada->California 6.5%, Oklahoma->Texas 9.5%, Wyoming->Colorado 6.8%. The blue shell (p *= 1 - 0.5*shell) is the only real brake and it only touches the top 5 by population: California->Nevada drops to 42.4%, Texas->Oklahoma to 49.2%. Net effect: no rational player ever presses Unite.

**Fix.** Decide what Unite is FOR. If it is the diplomatic alternative to conquest it must be *cheaper* than annexation for comparable territory — so annexation has to cost something first. Then drive p off political/cultural similarity and relative Authority rather than raw size share, and give the small partner agency (a negotiated union with terms) instead of a size roll it cannot win.

> **Verifier note.** p = sizeScore * (0.6 + 0.4*politSim) is strictly bounded above by sizeScore, and every quoted number reproduces within half a point: Ohio->Pennsylvania 45.9% (sizeScore 0.477, politSim 0.91), New York->Vermont 73.1%, Colorado->Wyoming 70.3%, Vermont->New York 3.0% (at the 0.03 clamp), Nevada->California 6.5%, Oklahoma->Texas 9.5%, Wyoming->Colorado 6.8%, California->Nevada 42.4%, Texas->Oklahoma 49.1%. And in exactly the cases where Unite is favourable the target is small enough to be annexed whole at zero risk (Vermont 0.65M vs New York 19.87M, Nevada 3.27M vs California 39.43M both sit well under the annex cap), so Unite is strictly dominated.


### 27. `plansplinter-same-lean-defect` — planSplinter's defection rule degenerates when S and T share a lean: your entire border region defects to a politically identical neighbour

- **Severity:** high  ·  **Category:** correctness
- **Where:** `js/actions.js` — lines 98-110, 126

**Evidence**

```
actions.js:104  `const defect = Sc.filter((c) => Game.leanOf(c)?.lean === Tlean && touchesT(c));`
actions.js:126  `Game.moveCounties(plan.defect, tid, { silent: true });`
```

**Why it matters.** When Slean === Tlean the filter reduces to 'every border Area that leans the way S already leans' — i.e. S's most loyal territory defects to a nation with the same politics. Measured: Texas (R) failing to unite Oklahoma (R) hands over 10 of 104 Areas, 1.0M people, $90B. Ohio (R) failing on Pennsylvania (R) hands over 4 Areas / $32B. There is no ideological story for that. The complementary case is also wrong: when Slean !== Tlean, `defect` selects the counties that already disagree with S — reasonable — but nothing checks that the defecting bloc is contiguous or that S retains a capital.

**Fix.** Gate defection on the county's distance from S's own lean vs T's, not on equality with Tlean: `score = |countyMargin - Smargin| - |countyMargin - Tmargin|` and defect when positive. Return an empty defect list when Slean === Tlean and put the fallout somewhere else (e.g. straight secession).

> **Verifier note.** 'nothing checks... that S retains a capital' is not a defect — the model has no capital concept at all; there is nothing to retain.


### 28. `breakapart-exclude-null-noop-secession` — confirmUniteAttempt calls breakApart with no exclude, so seceding fragments smaller than MIN_NATION silently rejoin the nation they are seceding from

- **Severity:** high  ·  **Category:** correctness
- **Where:** `js/actions.js, js/game.js` — lines actions.js 127, 170-171; game.js 245-258

**Evidence**

```
actions.js:127  `const created = Game.breakApart(plan.secede);`
game.js:246  `const exclude = opts.exclude || null; // a nation new fragments must not join (e.g. a failed aggressor)`
game.js:255-256  `const near = nearestNationForGroup(comp, exclude);
      if (near) moveCounties(comp, near, { silent: true });`
actions.js:170-171  `<div class="warn-box">On failure your nation fractures: border counties defect to <strong>${escapeHtml(tName)}</strong>, cut-off regions break away, and you lose population &amp; GDP.</div>`
```

**Why it matters.** plan.secede is by definition the set of S's counties that do NOT touch T, so they are surrounded by S. With exclude = null, nearestNationForGroup returns S for every fragment under 10 Areas, moveCounties hits `if (from === toId) continue`, and nothing happens. Measured across five real pairs: Texas/Oklahoma 5 of 5 seceding components are no-ops; Ohio/Pennsylvania 6 of 6; Colorado/Wyoming 4 of 5; New York/Vermont 3 of 4; California/Nevada 1 of 3. Overall 19 of 23. The warn-box promises 'cut-off regions break away' and in the most common case none do.

**Fix.** Pass `{ exclude: S }` at actions.js:127. Then decide what a stranded 3-Area secession actually does — join T, become a small rebel state, or convert into unrest on those Areas — rather than falling through to a silent no-op.

> **Verifier note.** The tally is 16 of 23 components, not 19 of 23 (a few small fragments do route to a genuine third nation). More importantly, 'the warn-box promises cut-off regions break away and in the most common case none do' overstates: 3 of the 5 sampled pairs still produce real breakaway nations from the >=10-Area components (Colorado/Wyoming a 31-Area chunk, New York/Vermont a 26-Area chunk, California/Nevada two 12-Area chunks). The missing `{ exclude: S }` is nonetheless a genuine bug.


### 29. `blocked-only-protects-same-lean` — The annex block only protects same-lean nations, so any minnow can freely chew on its ideological opposite regardless of size

- **Severity:** high  ·  **Category:** balance
- **Where:** `js/actions.js` — lines 459-469, 482-492

**Evidence**

```
actions.js:463-467  `for (const [oid, n] of Game.nations) {
      if (oid === nid) continue;
      const d = Game.nationDemographics(oid);
      if (d.lean === me.lean && (d.gdp > me.gdp || d.pop > me.pop)) blocked.add(oid);
    }`
actions.js:488  `if (o && o !== A.nid && !A.blocked.has(o) && !A.chosen.has(oid... )) sel.add(nb);`
```

**Why it matters.** Wyoming (R, 0.59M pop, $51B) is blocked from touching Montana or Idaho but can annex from Colorado (D, 5.96M, $558B) without restriction — and, per the free-annex finding, can take up to 0.59M pop / $51B of Colorado every single turn at zero risk. The protection is also computed once at startAnnex and never refreshed, and it is nation-level so a nation that is bigger on GDP but smaller on population is either fully blocked or fully open with no gradation. The rule reads as a placeholder for a strength check but implements an ideology check.

**Fix.** Base the block on relative military/Authority strength (the target design's hard-power axis), not party lean, and make it a modifier on the civil-war odds rather than a binary gate — attacking a much stronger neighbour should be possible and disastrous, not forbidden.

> **Verifier note.** actions.js:466 gates purely on `d.lean === me.lean`, so cross-lean size differences are unprotected. Verified in simulation: Wyoming (R, 0.59M, $51B) is blocked from all its R neighbours but Colorado (D, 5.96M, $558B) is wide open, and a greedy Wyoming takes 58 Colorado Areas on turn 1 at zero risk. `blocked` is built once inside startAnnex and recomputeAnnexSelectable reads the stale A.blocked for the rest of the action, as stated.


### 30. `points-rounds-to-zero` — points() rounds to zero for the majority of Areas, so most civil wars have score 0 and are auto-victories

- **Severity:** medium  ·  **Category:** simulation-integrity
- **Where:** `js/civilwar.js` — lines 37-39, 51-52

**Evidence**

```
civilwar.js:38  `return Math.round(added.pop / 1e6) + Math.round(added.gdp / 1e10);`
civilwar.js:51  `const score = dc ? Math.round(pts * product * mult) : 0;`
civilwar.js:52  `const outcome = score <= 33 ? 'victory' : score <= 66 ? 'partial' : 'fall_apart';`
```

**Why it matters.** Of the 1676 Areas, 845 (50.4%) score 0 points (pop < 500k rounds to 0 AND gdp < $5B rounds to 0); another 503 score exactly 1. Median single-Area points = 0. Of the 21 single-Area annexations that DO trigger a civil war at turn 0, 6 have points = 0 (Wisconsin taking Boone, Stephenson, Buchanan, Delta, Houghton or Chisago County). score = round(0 * product * mult) = 0 -> 'victory' no matter what the dice say. The engine rolls dice, prints them via cwLine ('🎲 4  0 pts × 4 = 0'), and the result was decided before the roll. points=1..5 with one die is also 100% victory (5*6=30 <= 33).

**Fix.** Stop rounding to integers at these magnitudes. Use continuous points (e.g. pop/1e5 + gdp/1e9, or log-scaled), or make points a *ratio* of added to existing size — which is the quantity the trigger already cares about — and rescale the 33/66 thresholds to match.

> **Verifier note.** The headline 'most civil wars have score 0' is not supported, and the six Wisconsin examples are fabricated. Boone (17007), Stephenson (17177), Buchanan (19019), Delta (26041), Houghton (26061) and Chisago (27025) all lean R (42.0/38.6/32.4/32.8/38.8/31.4 dem) and Wisconsin itself leans R (49.18 D / 49.35 R), so annexing them cannot flip WI, their pop (32k-103k) and GDP are nowhere near WI's 5.96M / $453B, and CivilWar.assess returns triggered=false — there is no war to score. The claim is also self-contradictory: pts=0 forces 'victory', so those cases could never produce the 'partial' result the sibling finding attributes to them. None of the 15 real turn-0 triggers has points 0 (minimum is 1).


### 31. `only-plurality-victim-pays` — A single annex can strip 14 nations at once, but only the plurality victim pays any civil-war cost

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/actions.js` — lines 554-558, 571, 577, 582

**Evidence**

```
actions.js:555-558  `const victimTally = {}; chosen.forEach((f) => { const o = Game.getOwner(f); victimTally[o] = (victimTally[o] || 0) + 1; });
    let victim = nid, vc = -1;
    for (const [o, c] of Object.entries(victimTally)) if (c > vc) { victim = o; vc = c; }`
actions.js:571  `Game.applyCivilWarCost(victim, nid, res.score);`
```

**Why it matters.** recomputeAnnexSelectable (actions.js:482-492) only requires `o !== A.nid`, so one selection can span any number of nations. In the simulated California turn-1 risk-free annex, 180 Areas were taken from 14 different nations; the plurality victim was Washington (31 Areas) and the other 13 (Oregon 27, Colorado 22, Idaho 20, Utah 16, Arizona 13, New Mexico 11, Nevada 9, Wyoming 8, Montana 8, Nebraska 7, Missouri 4, Kansas 3, Iowa 1) lost territory with zero population loss, zero GDP loss, and no entry in the turn order handling at actions.js:582. `victim` is initialised to `nid`, which is dead-but-dangerous: if a chosen Area ever had an undefined owner the key stringifies to "undefined", Game.nations.get("undefined") is undefined, and applyCivilWarCost silently does nothing at all (both branches are guarded by `loser && loser.counties.size`) — the attacker takes the land and pays nothing.

**Fix.** Either restrict a single annex to one target nation (which also makes the whole 'declare war on X' framing coherent), or loop applyCivilWarCost over every entry in victimTally, weighting the score by that nation's share of the contested Areas. Initialise `victim = null` and bail loudly instead of defaulting to the attacker.

> **Verifier note.** The 'undefined owner' hazard is hypothetical, not live: every Area is assigned an owner in Game.init and moveCounties/pruneEmpty preserve that invariant, so victimTally is always non-empty and the `let victim = nid` initialiser is unreachable dead code rather than a reachable silent-no-cost path. Also, the comment at actions.js:554 ('nation that owns the plurality of the contested counties (splinter parent)') shows the single-victim choice is a deliberate simplification, not an oversight.


### 32. `partial-subset-empty-for-flip-wars` — partialSubset keeps only attacker-lean counties, which for a flip-triggered war is empty by construction

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/actions.js` — lines 574-579, 597-610

**Evidence**

```
actions.js:599  `const same = new Set(chosen.filter((f) => Game.leanOf(f)?.lean === attackerLean));`
actions.js:575-579  `const taken = partialSubset(nid, chosen, before.lean);
      Game.moveCounties(taken, nid);
      Game.applyCivilWarCost(victim, nid, Math.round(res.score / 2));
      msg = ... `Held ${taken.length} of ${chosen.length} counties (same-lean & connected).`;`
```

**Why it matters.** A civil war triggered by `flip` means the annexed bloc leans the *opposite* way to the attacker — that is the definition of the trigger. So `same` is empty and `taken` is []. All 6 zero-point Wisconsin cases and every other single-Area flip war in the turn-0 sweep would yield 'Held 0 of 1 counties' on a partial result. Meanwhile applyCivilWarCost(victim, nid, score/2) still runs, so the victim bleeds population AND transfers 2-20% of its GDP to an attacker that gained nothing. `kind = taken.length ? 'good' : 'warn'` acknowledges the empty case but the code path is never questioned.

**Fix.** For a partial victory take the *contiguous, border-adjacent* subset of chosen sized by the score (e.g. keep floor((66-score)/33 * chosen.length) Areas nearest the attacker's border), not a lean filter. If you keep a lean filter, use it for a *different* outcome (e.g. only the sympathetic counties defect voluntarily) and skip the GDP transfer when taken.length === 0.

> **Verifier note.** 'Empty by construction' is only true for single-Area flip selections. A multi-Area flip bloc can contain same-lean Areas, and the gdp/pop triggers fire with no flip at all — e.g. DC annexing Fairfax (both D) would have `same` = the whole selection, so a 'partial' takes everything. The six zero-point Wisconsin cases cited are doubly wrong: those annexations trigger no war, and pts=0 forces 'victory', so they can never reach the partial branch.


### 33. `trade-mints-gdp-free` — TRADE_GAIN creates GDP out of nothing for both sides every turn with no cost, no cooldown and no meaningful price feedback

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/actions.js` — lines 184, 315, 355-363, 389, 406-415, 422, 444-454

**Evidence**

```
actions.js:184  `const TRADE_GAIN = 0.10; // each side's GDP gain as a share of traded value`
actions.js:449-450  `Game.boostGdp(S, gain * 1e6);
    Game.boostGdp(tid, gain * 1e6);`
actions.js:411  `Game.boostGdp(S, gain * 1e6);`
actions.js:358-359  `Game.boostGdp(S, net * 1e6);
        Game.boostGdp(T, cut * 1e6);`
```

**Why it matters.** DEMAND_SHARE (app.js:630) sums to 0.80, so every nation is structurally guaranteed a surplus of 20% of gross production and the 'Sell all surpluses to the world' button is never empty. Computed at turn 0 from data/economy.json at the opening market prices: one click gives Wyoming +$1.9B (3.78% of its GDP), West Virginia +$4.0B (3.78%), Vermont +$1.6B (3.39%), Michigan +$16.3B (2.32%), Pennsylvania +$13.4B (1.33%). That is per turn, forever, with no counterparty cost — the bilateral version pays BOTH sides. Simulating all 51 nations exporting once per turn: world GDP goes 29.14T -> 34.18T in ten rounds (+17%) while average market price falls only 82.4 -> 78.7, because Market.update's demand term scales with population (which is unchanged) while supply scales with GDP but the MIN_P/MAX_P clamps blunt it. There is no negative feedback loop. Worse, GDP is an input to the annex cap (`capFactor * A.before.gdp`) and to the civil-war trigger (`added.gdp > before.gdp`), so free trade money directly buys larger risk-free annexations.

**Fix.** Make trade a standing agreement with a per-turn yield and a maintenance cost rather than an instant one-shot boost, cap gains against the counterparty's absorbable demand, and route the benefit through the treasury (which Game.spend can then debit) instead of minting county GDP. At minimum add a per-pair cooldown and diminishing returns on repeated deals with the same partner.

> **Verifier note.** 'No meaningful price feedback... there is no negative feedback loop' and the quoted 4.5% price fall are wrong, and internally inconsistent with the +17% GDP figure. Replaying the same 51-nation, 10-round export loop gives world GDP 29.14T -> 33.71T (+15.7%) with the average market price falling 82.4 -> 65.3 (-20.7%), because Market.update's supply term scales with live GDP; the yield is genuinely damped. There is also an opportunity cost the finding omits: a trade action calls completeTurn(), consuming the nation's entire turn, and at ~1.5%/turn the gain is smaller than the 5%/round Game.growAll every nation already receives for free. Real, but secondary to the annexation exploit.


### 34. `treasury-never-spent` — Game.spend is exported but never called; the treasury is a read-only number and no action has an economic cost

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `js/game.js, js/app.js` — lines game.js 336-342, 381; app.js 613-620

**Evidence**

```
game.js:336-342  `function spend(nid, amount) {
    const n = nations.get(nid);
    if (!n || n.treasury < amount) return false;
    n.treasury -= amount;
    emit();
    return true;
  }`
`grep -rn "Game.spend" js/` returns nothing outside game.js's own export list.
```

**Why it matters.** treasuryFlow/tickTreasuries accumulate income minus maintenance every world turn and renderTreasury displays the balance, but nothing in the game can ever consume it. Combined with the fact that annex, unite and trade are all free, the entire economic layer (TAX_RATE, GOV_TYPES, AREA_UPKEEP, the six-sector market) is decorative — it feeds no decision. AREA_UPKEEP = 40e6 per Area per turn is the one term that would punish sprawl, but at 0.02 tax on $29T of GDP nobody ever runs out.

**Fix.** Price the actions: annex costs treasury proportional to target pop/GDP and is refused when Game.spend returns false; military suppression, autonomy grants and county release from the target design all draw from the same pool. Then tune AREA_UPKEEP so wide empires actually go bankrupt.

> **Verifier note.** Framing it as an architecture defect overstates it slightly — the code is openly mid-build (game.js:336's own comment says 'actions draw from the treasury via this', GOV_TYPES is labelled a placeholder, and the Release action that would spend is shipped disabled with title="Coming next"). It is an unfinished wire-up, not a wrong design.


### 35. `min-nation-wrong-at-area-granularity` — MIN_NATION = 10 was written for counties but now applies to Areas, making a breakaway larger than 8 of the 51 starting nations

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/game.js` — lines 240-252

**Evidence**

```
game.js:240-244  `const MIN_NATION = 10; // a new nation from a breakup needs at least this many counties

  // Break a set of counties into new nations. Contiguous chunks of >=10 counties
  // become nations; smaller chunks join their nearest nation ...`
game.js:250  `if (comp.length >= MIN_NATION) created.push(createNation(...))`
```

**Why it matters.** data/areas.json collapses 3143 counties into 1676 atomic Areas (Game.init lines 51-65), so an Area is ~1.9 counties. A 10-Area breakaway is roughly 19 counties. Eight of the 51 starting nations are below that threshold: DC (1 Area), Delaware (3), Hawaii (5), Rhode Island (5), New Hampshire (8), North Dakota (8), Vermont (8), and Connecticut sits at exactly 9. So the rule says a new nation must be bigger than a sixth of the existing nations, which is why almost every fall_apart and secession produces zero new nations (measured above).

**Fix.** Express the threshold in the same terms the rest of the model uses — a population/GDP floor, or a fraction of the parent — rather than a raw unit count, and update the comment to say Areas. Given the target design's movement-based breakaways, this should ultimately come from the movement definition, not a global constant.

> **Verifier note.** Confirmed exactly against the data: data/areas.json collapses 3143 counties into 1676 Areas (483 merges), so MIN_NATION = 10 is ~19 counties. Eight of the 51 starting nations sit below it — District of Columbia 1, Delaware 3, Hawaii 5, Rhode Island 5, New Hampshire 8, North Dakota 8, Vermont 8, Connecticut 9 — and the comment at game.js:240/242 still says 'counties'.


### 36. `blue-shell-inert-on-annex` — blueShell ranks by population only and its two annex effects cancel out, so it does not slow the leader at all

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/game.js, js/actions.js` — lines game.js 199-205; actions.js 468-469, 562

**Evidence**

```
game.js:200-201  `const ranked = [...nations.keys()].map((id) => ({ id, pop: nationDemographics(id).pop })).sort((a, b) => b.pop - a.pop);
    const topCount = Math.max(1, Math.round(0.1 * ranked.length)); // ~top 10% (5 of 51)`
actions.js:469  `... shell, capFactor: 2 - shell };`
actions.js:562  `const res = CivilWar.resolve(before, added, after, { scoreMult: 1 + (A.shell || 0) });`
```

**Why it matters.** For the #1 nation capFactor becomes 1.0 — but 1.0x its own population is still a doubling every turn, so the cap is not a brake (California still conquered 70% of the map in 3 turns in the simulation with shell = 1 applied). scoreMult = 2 only matters if a war triggers, and at capFactor 1 the pop/GDP triggers are unreachable (previous finding), leaving only flips — which are already 100% fall_apart regardless of the multiplier. The ranking is also by population alone, so a nation that pumps GDP through the trade exploit escapes the shell entirely. And topCount shrinks as nations are eaten: at 51 nations 5 are penalised, at 15 nations 2, at 10 or fewer just 1 — the anti-snowball weakens exactly as the snowball grows.

**Fix.** Rank on a composite (pop, GDP, Area count, Authority) and make topCount a fixed count or a share of the *original* nation count. Make the penalty something the leader feels every turn — occupation cost, coalition formation, sentiment penalties — rather than a multiplier on a roll that rarely happens.

> **Verifier note.** Verified by simulation with shell fully applied: California at capFactor 1.0 still reaches 692 Areas on turn 1, 1173 on turn 2 and 1602 of 1676 on turn 3, with zero civil wars — so the halved cap does not brake the leader. The interaction the finding identifies is also real and self-defeating: capFactor 1 makes the pop/GDP triggers unreachable (cap rejects >= 1.0x, trigger needs > 1.0x), leaving scoreMult = 2 to apply only to flip wars that are already deterministic fall_aparts. blueShell ranks on population alone (game.js:200) and topCount = max(1, round(0.1 * nations.size)) does shrink as nations are eaten.


### 37. `action-reentrancy-via-advance-world` — 'Advance world' is not guarded against an active action; it re-renders the nation panel with live action buttons, letting an action be restarted on top of itself and losing the saved colour mode

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/app.js, js/actions.js` — lines app.js 503, 351-364, 570-576; actions.js 28-31, 42-47, 459-480

**Evidence**

```
app.js:503  `document.getElementById('tb-advance').onclick = () => { World.advanceTurn(); onGameChange(); };`
app.js:520-521  `function passTurn() {
  if (Actions.isActive()) return;`  (the pass button IS guarded; advance is not)
app.js:362  `select(store.selected.level, store.selected.id);`
app.js:570-574  `panel.querySelectorAll('.act').forEach((b) => b.addEventListener('click', () => { ... else Actions.start(b.dataset.act, nid); }));`
actions.js:28-30  `let prevColorMode = null;
  function restoreColorMode() {
    if (prevColorMode != null) { setColorMode(prevColorMode); prevColorMode = null; }`
actions.js:476-477  `prevColorMode = store.colorMode;
    setColorMode('political');`
```

**Why it matters.** During an annex, store.selected is still {level:'nation', id:nid}, so onGameChange -> select -> renderNationPanel replaces the action panel with the normal nation panel and re-wires the action buttons, while Actions' internal `A` is still non-null. Clicking 'Annex' again runs startAnnex, which overwrites A (losing the current selection with no clearVisuals) and sets `prevColorMode = store.colorMode` — now 'political' — so the player's original colour mode is lost permanently. The player can also start a *different* action (trade/unite) on top of a half-finished annex, leaving stale `dim`/`chosen` classes on the map. Any other emit() during an action (boostGdp, applyCivilWarCost) reaches the same path.

**Fix.** Guard tb-advance with `if (Actions.isActive()) return;` like passTurn, and have onGameChange skip the panel re-render while Actions.isActive(). Make Actions.start() a no-op (or an explicit cancel-then-start) when A is already set.

> **Verifier note.** Worth noting the in-flow emits are less dangerous than implied: confirmAnnex's own moveCounties/applyCivilWarCost fire before `A = null` and do re-render the panel mid-resolution, but that path self-heals via the immediately following restoreColorMode() and completeTurn(). The user-driven Advance-world path is the real one.


### 38. `transit-negotiation-is-theatre` — The transit toll negotiation accepts the default slider position 89% of the time and the 'need' term is effectively dead

- **Severity:** medium  ·  **Category:** ux
- **Where:** `js/actions.js` — lines 276-299, 316, 364-375

**Evidence**

```
actions.js:284-287  `const incomeToT = total * TRADE_GAIN * base;       // ballpark toll income ($M)
    const need = Math.max(0, Math.min(1, (incomeToT / (dT.gdp / 1e6)) * NEED_SCALE));
    const needMult = 1 - 0.25 * need;                  // the needier, the more it settles
    const ask = Math.max(0.05, Math.min(0.6, base * sizeMult * relMult * needMult));`
actions.js:316  `const start = Math.round(base * 100);`
actions.js:364  `if (p >= v.ask - 0.005) {`
```

**Why it matters.** The slider opens at exactly `base`, and ask = base * sizeMult * relMult * needMult with sizeMult in [0.75,1.25], relMult in [0.80,1.12] and needMult in [0.75,1.00]. Evaluated over all 214 adjacent nation pairs at turn 0: the opening slider value is accepted outright in 190 of 214 (89%) — the player presses Propose, gets a yes, and the negotiation contributed nothing. The need term: median 0.123, minimum 0.0047, and 54% of pairs fall under 0.15, so transitReasons almost always prints 'Frankly, we don't need this deal' while still accepting. (The units in `need` are in fact consistent — `total` is $M because economy.json bakes `values = [round(gdp*pct/100/1e6)]`, and dT.gdp/1e6 converts dollars to $M — the term is dimensionally correct but numerically inert.)

**Fix.** Open the slider below `base` (e.g. 0.6 * base) so the default is a lowball, and rescale NEED_SCALE against something that actually varies — the transit nation's treasury deficit or its own export access — rather than a toll worth 0.3% of its GDP.

> **Verifier note.** The `need` statistics are wrong. Measured over the same pairs: median 0.259 (not 0.123), minimum 0.0064 (not 0.0047), and 34% below 0.15 (not 54%). So transitReasons prints "Frankly, we don't need this deal" for about a third of pairs, not 'almost always'. `rel` spans [-0.53, 1.00] with median 0.69.


### 39. `evaltransit-dem-only-alignment` — evalTransit's 'political alignment' uses only the Democratic share, so it will misread relations as soon as third parties exist

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/actions.js` — lines 282-283

**Evidence**

```
actions.js:282-283  `const rel = Math.max(-1, Math.min(1, 1 - Math.abs((dS.dem || 0) - (dT.dem || 0)) / 25)); // political alignment
    const relMult = 1 - 0.2 * rel;                     // warm relations -> asks less`
```

**Why it matters.** Two nations agree only insofar as their dem percentages match; gop, other and every c.ext regional party are ignored. At turn 0 this accidentally works because other ~1% so dem+gop ~99 and the dem gap tracks the gop gap — measured range across 214 pairs is rel in [-0.62, 0.99] with median 0.68 and the -1 clamp never reached, so relMult only ever spans [0.80, 1.12]. But Parties.setup (parties.js:70) gives an emergent party its rolled share PLUS the county's entire Other share, and World.phasePartyGrowth grows it toward a 35% ceiling. Once a 30%-separatist nation exists, its dem share compresses to ~30 and it reads as 'Relations are warm' with a mainstream nation that also happens to be at dem 30 — while the two have nothing in common. Under the target design's 6 parties on 2 axes this term is meaningless.

**Fix.** Compare on the same basis unitePeaceChance already uses — the (dem - gop) margin — or better, compute distance in the 2-axis ideology space over the full party vector including ext, and reuse that one function everywhere political similarity is needed.

> **Verifier note.** actions.js:282 compares only `dS.dem` against `dT.dem`, ignoring gop, other and every c.ext party. The forward-looking half is stronger than the finding claims, not weaker: Parties.setup already runs at init (parties.js:56, 16 definitions at 50% chance each, rolled share plus the county's entire Other share, one covering 1142 counties), and Game.demographics computes dem as dem/pop*100 with ext folded into pop. With all definitions rolled, Texas reads dem 38.1 / gop 49.2 and California 58.0 / 38.8 at turn 0, so the dem-only gap is already misreading before a single turn is played.


### 40. `nationsurplus-baked-vs-live` — Market.nationSurplus reads baked production while Market.update scales by live GDP, so trade volume is permanently decoupled from the simulated economy

- **Severity:** medium  ·  **Category:** simulation-integrity
- **Where:** `js/market.js, js/actions.js` — lines market.js 23-30, 58-69; actions.js 310-315, 384-388

**Evidence**

```
market.js:24-27  `const live = Game.countyGdp(aid) / 1e6; // \$M
      const baked = a.v.reduce((s, v) => s + v, 0) || 1;
      const k = live / baked;
      a.v.forEach((v, i) => { supply[i] += v * k; });`
market.js:63-68  `for (const aid of n.counties) {
      const a = e.areas[aid];
      if (a) a.v.forEach((v, i) => { prod[i] += v; });
    }
    ... surplus: prod.map((p, i) => p - DEMAND_SHARE[i] * gross)`
```

**Why it matters.** update() correctly rescales each Area's baked profile by its live GDP; nationSurplus does not. So a nation whose GDP has been halved by a civil war exports exactly the same tonnage as before, and a nation that has tripled its GDP through trade spam still exports its turn-0 volume. Every consequence the rest of the engine simulates — war damage, growth, GDP transfer in applyCivilWarCost, boostGdp — is invisible to the trade system. It also means the exploit's yield is fixed in absolute terms while prices drift, which is why the ten-round simulation showed world GDP +17% against only a 4.5% average price fall.

**Fix.** Apply the same `k = Game.countyGdp(aid)/1e6 / sum(a.v)` scaling inside nationSurplus, and factor the shared code into one function so the two can't drift apart again.

> **Verifier note.** The causal attribution at the end is wrong: the ten-round export loop does not show '+17% GDP against only a 4.5% average price fall'. Measured, it is +15.7% GDP against a 20.7% price fall (82.4 -> 65.3), because Market.update's supply term does track live GDP. The decoupling is real; the evidence cited for it is not.


### 41. `boostgdp-even-spread-homogenizes` — boostGdp spreads the gain equally across Areas, flattening the economic geography the market and map modes depend on

- **Severity:** medium  ·  **Category:** simulation-integrity
- **Where:** `js/game.js` — lines 327-334

**Evidence**

```
game.js:328-333  `function boostGdp(nid, amount) {
    const n = nations.get(nid);
    if (!n || !n.counties.size) return;
    const per = amount / n.counties.size;
    for (const f of n.counties) county[f].gdp += per;`
```

**Why it matters.** Area GDP spans four orders of magnitude in the real data (p10 = $0.9B, median $4.9B, max $1006.7B), yet a trade boost gives the $0.9B Area and the $1006.7B Area the same absolute dollars. Wyoming trading every turn for 20 turns adds ~$38B split 23 ways = $1.65B per Area, which multiplies its smallest Areas several times over while barely moving its largest. Because Market.update derives each Area's sector supply from `live/baked`, this progressively rewrites the national sector mix toward whatever the smallest rural Areas produce — the opposite of what a trade boom should do. The same flat-spread bug appears in applyCivilWarCost's GDP payout (game.js:286-287, `const perW = moved / winner.counties.size`).

**Fix.** Distribute proportionally to each Area's existing GDP (`county[f].gdp += amount * county[f].gdp / totalGdp`), or better, route the gain to the Areas whose sectors actually produced the surplus using the economy profile.

> **Verifier note.** game.js:331 divides by n.counties.size with no weighting, and the GDP spread reproduces exactly: p10 $0.91B, median $4.93B, max $1006.7B across the 1676 Areas, so a boost gives the smallest and largest Area identical absolute dollars. Because Market.update derives each Area's sector supply from live/baked, repeated flat boosts do progressively rewrite the national sector mix toward the smallest Areas' profiles. The same flat spread appears in applyCivilWarCost's winner payout (game.js:286-287).


### 42. `annex-cap-first-county-unselectable` — The annex cap is evaluated on the cumulative set including the candidate with >=, so a single Area above the cap can never be selected at all

- **Severity:** low  ·  **Category:** ux
- **Where:** `js/actions.js` — lines 502-507

**Evidence**

```
actions.js:503-507  `const added = Game.demographics([...A.chosen, fips]);
    if (added.pop >= A.capFactor * A.before.pop || added.gdp >= A.capFactor * A.before.gdp) {
      flash('Selection capped — your armies can only mobilize so far.', 'warn');
      return;
    }`
```

**Why it matters.** There is no 'this is the first pick' allowance, so if one neighbouring Area alone exceeds the cap it is permanently unselectable and the player just sees a repeated 'Selection capped' toast with no explanation. Concrete case at turn 0: New Hampshire (1.41M pop, $119B GDP, cap $239B) can never select Middlesex County MA ($241B) — its single most obvious target. The problem gets far worse as the game progresses and nations get whittled down; a 2-Area rump nation next to a metro Area is completely action-locked on annex. Separately, the `>=` here sits exactly on top of the trigger's `>` (civilwar.js:26-27): for the #1 nation capFactor = 2 - 1 = 1, so the cap blocks `>= 1.0x` while the trigger needs `> 1.0x` — the pop and GDP triggers become mathematically unreachable for the leader.

**Fix.** Allow the first selection unconditionally (`if (A.chosen.size && (...))`), or clamp with `>` and surface the cap numerically in the panel ('4.2M / 8.4M mobilised') so the player can see why a target is greyed out. Decouple capFactor from the trigger threshold so the blue shell doesn't accidentally disable the trigger.

> **Verifier note.** The concrete example is wrong and the finding has no turn-0 manifestation. New Hampshire cannot select Middlesex County because Massachusetts is already in the startAnnex `blocked` set (both lean D, MA is larger on both axes) — the cap never gets consulted. Sweeping all 51 nations against every adjacent unblocked Area at turn 0 gives 610 candidate first picks and ZERO that the cap alone rejects; the 943-vs-944 delta in the unblocked sweep is a single pair that the lean rule also blocks. The 'gets far worse as the game progresses' claim is plausible but unverified.


### 43. `release-action-dead-and-unsafe` — Release is wired through three dispatch paths but does nothing, and the code it would reach would throw

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/actions.js, js/app.js` — lines actions.js 46, 55-58, 67, 618-625; app.js 541

**Evidence**

```
actions.js:621-625  `function startRelease(nid) {
    flash('🕊️ Release counties is coming next.', 'warn');
    select('nation', nid);
  }
  function clickRelease() {}`
actions.js:55-58  `} else if (A.type === 'annex' || A.type === 'release') {
      const aid = Game.areaIdOf(d.id);
      if (A.selectable.has(aid) || A.chosen.has(aid)) ...`
app.js:541  `<button class="act" data-act="release" disabled title="Coming next">🕊️ Release counties</button>`
```

**Why it matters.** startRelease never sets A, so `A.type` is never 'release' and the onHover/onClick branches are unreachable — but if it ever did set A without `selectable` and `chosen`, onHover would throw on `A.selectable.has`. The button is disabled in app.js and renderNationPanel's handler re-checks `hasAttribute('disabled')`, so the whole feature is three dead code paths advertising a mechanic that doesn't exist. Voluntary county release is one of the target design's core release valves, so this is a visible hole.

**Fix.** Either implement it (it is the mirror of annex: pick your own Areas, they form a new nation via breakApart with exclude = self) or delete the button and the three dispatch branches until it exists.

> **Verifier note.** The 'unsafe' half of the title is conditional rather than actual — because startRelease never sets A, the `A.selectable.has` throw cannot occur today. This is dead code advertising an unbuilt feature, not a latent crash.


### 44. `trade-preview-missing-null-guards` — renderExternalPreview and renderTransitPreview dereference the economy and price data without the guard tradeFlows has

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/actions.js` — lines 222-226, 307-313, 381-387

**Evidence**

```
actions.js:225-226  `const e = MapModes.getEconomy();
    if (!ms || !ts || !prices) return [];`   (tradeFlows guards)
actions.js:381-385  `const ms = Market.nationSurplus(A.nid);
    const prices = Market.getPrices();
    const e = MapModes.getEconomy();
    const flows = e.sectors
      .map((s, i) => ({ i, s, vol: Math.max(0, ms.surplus[i]) }))`   (no guard)
```

**Why it matters.** app.js:52 fetches economy.json with `.catch(() => null)` and app.js:67-68 only calls MapModes.setEconomy / Market.update `if (economy)`. The Canada/Mexico/World buttons are enabled purely from nationExportAccess (which needs store.trade / store.transport, loaded independently), so with economy.json missing or malformed the buttons are live and clicking one throws `Cannot read properties of null (reading 'sectors')`, killing the action mid-turn with the panel in an inconsistent state. Same for the transit-route buttons at actions.js:307-310.

**Fix.** Add `if (!e || !ms || !prices) return renderTradePrompt();` (with a warn box) at the top of both functions, or disable the external/transit buttons in renderTradePrompt when MapModes.getEconomy() is null.

> **Verifier note.** Confirmed reachable. tradeFlows guards with `if (!ms || !ts || !prices) return []`, but renderExternalPreview (actions.js:381-385) and renderTransitPreview (actions.js:307-311) both dereference `e.sectors` with no guard. The enabling path is genuinely independent of economy.json: app.js:52 catches its fetch to null and app.js:67-68 skips MapModes.setEconomy/Market.update, while the Canada/Mexico/World buttons come from nationExportAccess -> areaExport, which reads only store.trade and store.transport. MapModes.getEconomy() then returns its initial null and the click throws 'Cannot read properties of null (reading sectors)'.


### 45. `dead-code-and-missing-export` — Dead locals and an unexported helper in the civil-war path

- **Severity:** low  ·  **Category:** architecture
- **Where:** `js/game.js, js/actions.js` — lines game.js 280-281, 367-407; actions.js 108-109

**Evidence**

```
game.js:280-281  `let gdp = 0;
      for (const f of loser.counties) gdp += county[f].gdp;`   (gdp is never read again)
actions.js:108-109  `const remnant = rest.filter((c) => !secede.includes(c));
    return { defect, secede, remnant };`   (remnant is never consumed by confirmUniteAttempt)
game.js:398  `nearestNation,`   (nearestNationForGroup, used by breakApart, is not in the export list)
```

**Why it matters.** The unused `gdp` sum in applyCivilWarCost reads as the intended basis for the transfer that was then computed per-county instead — it hides the fact that gPct is applied to each county independently rather than to a national total, which is fine but not what the variable suggests. `remnant` uses `Array.includes` inside a filter (O(n^2)) to compute a value nobody uses. nearestNationForGroup is the function that decides where every war fragment lands and it is not reachable for testing or for the developer dashboard the target design calls for.

**Fix.** Delete the unused `gdp` and `remnant`; export nearestNationForGroup alongside nearestNation so the fragment-routing logic can be unit-tested and shown in the 'why did this happen?' explanation layer.

> **Verifier note.** All three verified. game.js:280-281 sums `gdp` over the loser's counties and never reads it (the transfer at 284 is computed per-county from gPct). actions.js:108 computes `remnant` with an O(n^2) Array.includes inside a filter and confirmUniteAttempt consumes only plan.defect and plan.secede. game.js:398 exports `nearestNation` but not `nearestNationForGroup`, which is the function deciding where every war fragment lands.


### 46. `new-nation-names-say-area` — Nations born from a breakup are named after a merged Area, producing names like 'Maricopa Area'

- **Severity:** low  ·  **Category:** ux
- **Where:** `js/game.js` — lines 56, 168-169, 250, 257

**Evidence**

```
game.js:56  `rec.name = rec.name.replace(/ (County|Parish|Borough|Census Area|city|City)$/, '') + ' Area';`
game.js:168-169  `const SUFFIX = /\s+(County|Borough|Parish|Census Area|city|City|Municipality|Planning Region)$/;
  const nameForCounty = (fips) => (county[fips]?.name || 'New Republic').replace(SUFFIX, '');`
```

**Why it matters.** Game.init rewrites every merged Area's name to end in ' Area', and SUFFIX does not strip that, so createNation(nameForCounty(largestCounty(comp))) yields nation names like 'Maricopa Area' or 'Cook Area'. 483 of the 1676 Areas are merges, and largestCounty picks the most populous member — which is exactly the kind of Area that anchors a breakaway. There is also no uniqueness check, so two breakaways from the same region can share a name.

**Fix.** Add `|Area` to SUFFIX, and de-duplicate against existing nation names (append a numeral or fall back to a region name from the geographical map mode).

> **Verifier note.** Confirmed. Game.init line 56 appends ' Area' to every merged Area's name, and the SUFFIX regex at game.js:168 matches 'Census Area' but not a bare ' Area', so nameForCounty leaves it intact — 483 of the 1676 Areas carry it, and largestCounty picks the most populous member, which is exactly the kind of Area that anchors a breakaway. createNation has no name-uniqueness check, so two breakaways can share a name.



## Turn lifecycle, save/load, state integrity (12 findings)

### 47. `world-turn-not-saved` — World.turn is never serialized; SaveManager.apply silently keeps the current session's counter

- **Severity:** medium  ·  **Category:** save-load
- **Where:** `js/world.js, js/saves.js, js/app.js` — lines world.js 15, 140-170; saves.js 9, 16-26; app.js 499

**Evidence**

```
world.js:15 `let turn = 0;` … world.js:158 `turn += 1;` … world.js:162-170 `return { advanceTurn, getTurn: () => turn, phaseRecomputeLeans, phasePoliticalDrift, phasePartyGrowth, phasePopulationGrowth, phaseCleanup };` — no serialize/loadState. saves.js:9 `const snapshot = () => ({ v: 1, ts: Date.now(), game: Game.serialize(), turns: TurnSystem.serialize(), colorMode: store.colorMode });` — World is absent. saves.js:20-22 restores only TurnSystem and Game. app.js:499 renders `World turn <strong id="world-turn">${World.getTurn()}</strong>`.
```

**Failure scenario.** Play to world turn 40 (populations have drifted 40×, treasuries ticked 40×, market repriced 40×), save as "A". Reload the page (turn=0), load "A". Banner reads "World turn 0" while the counties hold turn-40 values. Now press Advance world once and save again: the save is written at turn 1 with turn-41 county data. The counter is permanently wrong and the corruption is written back on every subsequent save. Worse in one session: advance to turn 40, then load a save taken at turn 3 — the banner still reads 40 while the data is turn-3.

**Why it matters.** World.turn is the clock every phase in world.js runs against and the clock the target design hangs Authority ("age of nation"), war weariness, sentiment damping and rivalry decay on. It is the one number that says how old the simulation is, and it is the one number the save drops. Note game_state.py:54 already does this right — `state = {"counties": counties, "meta": ..., "turn": 0}` — the JS mirror diverged.

**Fix.** Add `serialize: () => ({ turn })` and `loadState: (s) => { turn = s.turn || 0; }` to World's return block, include `world: World.serialize()` in SaveManager.snapshot(), and call `World.loadState(snap.world || { turn: 0 })` in apply() before Game.loadState. Same for Market and Colors (see separate findings) — the rule should be that every module holding mutable state exposes serialize/loadState and snapshot() enumerates them.

> **Verifier note.** World.turn has exactly two consumers in the whole codebase (grep: app.js:499 display, world.js:158 increment) — no simulation logic reads it, so today's manifest impact is a wrong number in the banner, not corrupted data. The failure scenario is also imprecise: turn is never written to the save at all, so nothing is 'written back' or 'permanently wrong' in the file — the counter is simply a session-local artifact that resets on page reload. The Authority/war-weariness/damping consequences are all future (target-design) code.


### 48. `load-during-action-softlock` — Loading a save while an Action or the Editor is open permanently soft-locks the game

- **Severity:** medium  ·  **Category:** state-integrity
- **Where:** `js/saves.js, js/actions.js, js/app.js` — lines saves.js 16-26, 93-94; actions.js 11-13, 28-31, 33-40; app.js 467, 402-403, 520-523

**Evidence**

```
saves.js:93 `document.getElementById('btn-save')?.addEventListener('click', openSave);` / :94 Load — neither is gated on `Actions.isActive()`. saves.js:16-26 `function apply(name) { … TurnSystem.loadState(snap.turns); Game.loadState(snap.game); … select('nation', cur); }` — never touches `A`. actions.js:11 `let A = null;` :13 `const isActive = () => A !== null;`. app.js:467 `if (mode === store.mode || Actions.isActive()) return;` app.js:402-403 `if (Editor.isActive()) return Editor.onClick(d); if (Actions.isActive()) return Actions.onClick(d);` app.js:521 `if (Actions.isActive()) return;` in passTurn.
```

**Failure scenario.** Click a nation on its turn → "⚔️ Annex counties". `A = {type:'annex', nid, chosen:Set, selectable:Set, before, …}` and `prevColorMode` is stashed (actions.js:469, 476-477). Without cancelling, click the header Load button and load any save. The panel is replaced by the nation panel; `A` still holds Sets of county ids and a `before` demographics snapshot from the *discarded* game. Every map click now routes to `Actions.onClick` → `clickAnnex` and tests membership in stale Sets; Pass turn, mode toggles, leaderboard clicks and the turn-bar are all dead. Same via Enter map editor (app.js:456 `Editor.toggle()` is also ungated) — the editor takes click priority, and exiting it leaves `A` non-null.

**Why it matters.** There is no escape. Actions.cancel() is only reachable from a Cancel button that lives in the panel HTML, and both apply()'s `select('nation', cur)` (saves.js:24) and onGameChange's `select(...)` (app.js:362) overwrite that panel with renderNationPanel. Every route out is gated on `!Actions.isActive()`: setMode no-ops, passTurn no-ops, the leaderboard rows no-op (leaderboard.js:56), the turn-bar jump no-ops (app.js:502). The only recovery is a full page reload, which discards the load you just performed.

**Fix.** Gate the Save/Load/Editor header buttons on `!Actions.isActive()` (disable them and add a title), and have `SaveManager.apply()` begin with `if (typeof Actions !== 'undefined' && Actions.isActive()) Actions.cancel(); if (typeof Editor !== 'undefined' && Editor.isActive()) Editor.exit();`. Longer term, expose `Actions.reset()` that nulls `A` and `prevColorMode` without touching selection, and call it from any global state transition (load, new game, faction switch).

> **Verifier note.** It is NOT a permanent soft-lock and does not require a page reload. apply() ends with select('nation', cur) -> renderNationPanel, which renders the action buttons whenever it is that nation's turn, and their handler at app.js:570-576 calls `Actions.start(...)` with no isActive() guard. start() overwrites `A` wholesale (actions.js:75/199/469) and renders a panel whose Cancel calls cancel() -> A = null; startUnite/startTrade even null `A` themselves when there are no eligible neighbours. So one click on any action button recovers the session. Also refreshAnnex() re-renders the annex panel (with its own Cancel) on a successful stale click. Severity is medium, not critical.


### 49. `drop-round-bypasses-growth` — TurnSystem.drop() increments `round` behind completeTurn's back, so a round boundary can pass with no growth tick

- **Severity:** medium  ·  **Category:** simulation-integrity
- **Where:** `js/turns.js, js/app.js` — lines turns.js 37-46 (esp. 44), 71-76; app.js 508-518

**Evidence**

```
turns.js:42-45 `else if (i === ptr) { currentRemoved = true; if (ptr >= order.length) { ptr = 0; round++; } }`. app.js:509-514 `const beforeRound = TurnSystem.progress().round; const next = TurnSystem.endTurn(); if (TurnSystem.progress().round > beforeRound) { Game.growAll(0.05); flash(…); }`. `beforeRound` is sampled inside completeTurn, i.e. *after* every mutation (and therefore after every `emit → onGameChange → TurnSystem.sync() → drop`) has already run — see actions.js:126-134 where completeTurn is the last line.
```

**Failure scenario.** order = [A, B, S], ptr = 2 (S is the last actor of round 1). S runs Unite and the roll fails (actions.js:120-133). `Game.moveCounties(plan.defect, tid, {silent:true})` strips S's border counties; `Game.breakApart(plan.secede)` creates n1, moves S's last counties into it, `pruneEmpty()` deletes S (game.js:236-238), then `emit()` (game.js:260) → onGameChange (app.js:353) → `TurnSystem.sync()` → `drop(S)`: i===ptr===2, splice leaves order=[A,B], `ptr >= order.length` → **ptr=0, round=2**, then sync pushes n1 → order=[A,B,n1]. Control returns to completeTurn: `beforeRound = 2` (already bumped), `endTurn()` sees `currentRemoved` so it neither increments ptr nor round, `progress().round === 2` is not `> 2` → **growAll never runs and the round-2 flash never fires**. Round 2 begins with zero growth.

**Why it matters.** `Game.growAll(0.05)` (game.js:293-311) is the only per-round population and GDP growth in the player loop. Skipping it silently removes a full round of compounding for all 51 nations, and the round-2 toast never fires so the player has no idea. There are two clocks incrementing `round` (drop and endTurn) but only one of them is observed.

**Fix.** Take the round counter out of `drop()` entirely. Have `drop()` only fix ptr (`if (i === ptr && ptr >= order.length) { ptr = 0; wrapped = true; }` setting a flag), and let `endTurn()` be the single place that increments `round` — consuming the wrap flag. Better still: have TurnSystem own the boundary and fire a callback (`onRoundEnd`) rather than making app.js infer the boundary by diffing `progress().round` across the call.

> **Verifier note.** Mechanism verified line by line. drop() increments round at turns.js:44; completeTurn samples beforeRound at app.js:509 *after* all mutation/emit work has run; endTurn() with currentRemoved set neither advances ptr nor increments round again, so progress().round > beforeRound is false and growAll(0.05) plus the round toast are both skipped. I traced the exact order=[A,B,S], ptr=2 case and it lands on round 2 with no growth, as described. Reachability confirmed: the only route is the acting nation dissolving entirely during its own action, i.e. a failed Unite where planSplinter's defect list covers all of S's counties (moveCounties -> pruneEmpty -> breakApart's emit -> sync -> drop) — plausible for a small splinter nation wholly surrounded by, and same-leaning as, its target. Annex paths never remove the actor, and a successful Unite removes T, not the actor, so this is a narrow edge case; the impact is one skipped 5% growth tick, which is medium, not high.


### 50. `market-state-not-saved` — Market prices, prev and the perCap calibration are not saved, and apply() never recalculates them

- **Severity:** medium  ·  **Category:** save-load
- **Where:** `js/market.js, js/saves.js` — lines market.js 16, 18-37, 31, 71; saves.js 9, 16-26

**Evidence**

```
market.js:16 `let prices = null, prev = null, perCap = null;` :31 `if (perCap == null) perCap = gdpTotal / popTotal; // calibrate once at game start` :32 `prev = prices;` :71 `return { update, html, getPrices: () => prices, nationSurplus };` — no serialize. saves.js:9's snapshot omits Market; saves.js:16-26 `apply()` never calls `Market.update()`.
```

**Failure scenario.** Session A: advance 20 world turns (Market.update runs each time, market.js:157 in world.js), prices settle. Load a save from turn 2. `Game.loadState` restores turn-2 GDP; `prices` is untouched (still turn-20). Open Trade → the surplus values are computed against turn-20 prices. Sign the deal → `Game.boostGdp(S, gain * 1e6)` (actions.js:449) writes an inflated GDP. Separately, the ▲/▼ trend arrows (market.js:43-48, `was = prev ? prev[i] : prices[i]`) compare against the pre-load turn-19 prices, so every arrow after a load is meaningless until two more world turns pass.

**Why it matters.** Prices drive every trade valuation (`actions.js:313 f.vol * (prices[f.i] / 100)`, :387, tradeFlows :231) and the market panel rendered into the leaderboard (leaderboard.js:53 `Market.html()`). After a load, `Game.loadState` replaces every county GDP but `prices` still reflects the pre-load world, so the first trade the player signs after loading is priced off a world that no longer exists — and `Game.boostGdp` writes the resulting number straight into the county table, so the mispricing becomes permanent state.

**Fix.** Give Market `serialize: () => ({ prices, prev, perCap })` and a `loadState`, add it to the snapshot, and restore it in apply() before the first render. If you'd rather not persist derived values, at minimum call `Market.update()` at the end of `SaveManager.apply()` and null `prev` so the arrows show flat rather than lying.

> **Verifier note.** perCap does not need to be saved and its omission is harmless. It is calibrated once at app.js:68 (`if (economy) Market.update()`), which runs at init from pristine baked data before any play, so its value is identical in every session — the 'calibration is lost' part of the finding is wrong. Only `prices` (and `prev`, for the trend arrows) are genuinely stale after a load.


### 51. `localstorage-quota-unhandled` — ~525 KB per save against a ~5 MB budget, and setItem has no quota handling — saves fail silently

- **Severity:** medium  ·  **Category:** save-load
- **Where:** `js/saves.js, js/game.js` — lines saves.js 13, 54-59, 61-71; game.js 345-351

**Evidence**

```
saves.js:13 `const write = (name) => localStorage.setItem(PREFIX + name, JSON.stringify(snapshot()));` — bare setItem. saves.js:57-58 `write(name); done(\`💾 Saved as “${name}”.\`);` — no try/catch. saves.js:69 same for overwrite. game.js:347 serializes every county: `counties[f] = { d: c.demPop, g: c.gopPop, o: c.othPop, e: { ...c.ext }, a: { ...c.attrs }, gdp: c.gdp };`.
```

**Failure scenario.** Save 10 games. The 11th throws QuotaExceededError inside `write()`. Nothing catches it: `done()` at saves.js:58 never runs, so the modal stays open with no message, no toast, and an uncaught exception in the console. The player sees a Save button that appears to do nothing, and if they navigate away believing they saved, the session is gone.

**Why it matters.** I measured this rather than guessed. After Area merging (3143 counties − 1467 merged members = 1676 records; areas.json has 483 areas covering 1950 member counties) a fresh snapshot is 172 KB of JSON. After ~30 rounds of growth the floats carry full mantissas and 1326 of 1676 records hold an `ext` party, giving **268,322 chars = 536,644 bytes** in localStorage's UTF-16 accounting — about **10 saves before the 5 MB origin quota**, shared with the editor's `ns_mapmode_*` drafts (editor.js:114) in the same budget. `attrs` is serialized but always `{}` today; the target design fills it with region tags, resources, terrain and modifiers, plus 6 per-county secession factors — that is another ~500 KB of chars per save, putting one save near 1.5 MB and the cap at ~3.

**Fix.** Wrap `write` in try/catch, and on QuotaExceededError show the save-modal message (`#save-msg`) with the size and a list of saves to delete. Shrink the payload while you're there: round populations to integers and GDP to whole dollars before stringifying (`Math.round(c.demPop)` — the sim carries no meaning below 1 person), and omit `e`/`a` when empty. Rounding alone cut my 30-round measurement from 268 KB to near the 172 KB baseline. For the target design's per-county sentiment, plan on IndexedDB rather than localStorage.

> **Verifier note.** localStorage.setItem is atomic — on quota failure nothing is written. It therefore cannot produce a 'truncated save', which is the premise the apply-no-error-handling finding builds on. `attrs` is indeed always {} today (grep: only written as {} in game.js:46 and copied in serialize/loadState).


### 52. `emit-no-payload-full-rerender` — Game.emit() carries no payload, so a GDP-only mutation forces a full map re-render; one civil-war annex costs 2 border meshes, 6464 fill writes and 5 leaderboard rebuilds

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/game.js, js/app.js, js/actions.js` — lines game.js 208-209, 222, 227, 233, 260, 289, 310, 333, 340, 364; app.js 351-365, 352, 354-357, 429; actions.js 358-359, 449-450

**Evidence**

```
game.js:209 `function emit() { listeners.forEach((f) => f()); }` — no argument, no dirty flags. app.js:351-365 onGameChange does `store.outlineCache.clear(); TurnSystem.sync(); recolor(); redrawBorders(); Leaderboard.refresh(); renderTurnBanner();` then `select(...)` — and app.js:429 `Leaderboard.refresh();` runs a *second* time inside select. app.js:183-185 `redrawBorders` = `store.path(topojson.mesh(store.topo, store.topo.objects.counties, (a, b) => meshOwner(a.id) !== meshOwner(b.id)))`. app.js:174-178 `nationOutline` = `topojson.merge` over filtered geometries, and its cache was just cleared at line 352. actions.js:358-359 `Game.boostGdp(S, net * 1e6); Game.boostGdp(T, cut * 1e6);` — two separate emits for one deal.
```

**Failure scenario.** Sign a transit trade deal (actions.js:355-363): `boostGdp(S)` → emit → clear outline cache, sync, recolor 3232 paths, mesh 9869 arcs, 2× leaderboard; `boostGdp(T)` → emit → all of it again; then completeTurn → select → a third merge + a fifth leaderboard. Nothing about county ownership changed, so the border path produced by both meshes is byte-identical to the one already on screen.

**Why it matters.** I counted the real work. data/counties-10m.json holds 3231 county geometries and 9869 arcs; countyFeatures is 3231 − 8 old-CT + 9 CT planning regions = **3232 path elements**. So each onGameChange = 3232 `fill` attribute writes, one full `topojson.mesh` over 9869 arcs plus path stringification, one `topojson.merge` over 3231 filtered geometries, and 2 `Leaderboard.refresh()` (each calling `nationDemographics` for every nation = a full 1676-record scan, plus `Market.html()`). A civil-war annex (`Game.moveCounties` emit #1 at actions.js:570, `Game.applyCivilWarCost` emit #2 at :571) doubles all of that, and `completeTurn`'s own `select()` adds a third merge and a fifth leaderboard rebuild. A transit trade fires two emits for a pure number change with **zero ownership change** — both border meshes and all three outline merges are pure waste. There are currently no AI opponents; the target design has 51 seats acting per round, which multiplies this by 51.

**Fix.** Give emit a reason: `emit({ ownership: bool, values: bool, nations: [ids] })`, and have onGameChange skip `redrawBorders()`/`outlineCache.clear()` when `ownership` is false and skip `recolor()` when the active color mode doesn't depend on what changed. Batch multi-step mutations behind a single emit — add `Game.transaction(fn)` that sets a suppress flag, runs fn, then emits once (breakApart already does this internally with `{silent:true}`; the pattern just needs to be available to callers like confirmUniteAttempt and the two boostGdp calls). Drop the duplicate `Leaderboard.refresh()` at app.js:429 — onGameChange already refreshed it.

> **Verifier note.** Every count is exactly right: counties-10m.json holds 3231 county geometries and 9869 arcs, ct-planning-regions.geojson has 9 features, and 8 old-CT ids are filtered, so countyFeatures = 3232. emit() (game.js:209) takes no argument and has no dirty flags; onGameChange clears the outline cache, recolors all 3232 paths, rebuilds the full border mesh and refreshes the leaderboard, then select() refreshes the leaderboard a second time (app.js:356 and 429). The two boostGdp calls in the transit path (actions.js:358-359) really do fire two emits for a pure value change with byte-identical border output. Downgraded to medium: this is measurable waste, not a demonstrated failure — no timing evidence is given, the loop is human-paced with one action per click, and the '51 seats' multiplier is future AI code that does not exist.


### 53. `cross-build-save-corruption` — loadState silently skips unknown county ids and never validates the save; an areas.json change turns a save into unowned grey counties and then a TypeError

- **Severity:** medium  ·  **Category:** save-load
- **Where:** `js/game.js, js/saves.js` — lines game.js 51-65, 352-365 (esp. 354-355, 359-362), 269, 296; saves.js 9, 19

**Evidence**

```
game.js:353-356 `for (const [f, c] of Object.entries(snap.counties)) { const cc = county[f]; if (cc) { … } }` — a snapshot key with no live record is dropped without a word. game.js:359-362 `for (const n of snap.nations) { nations.set(n.id, { … counties: new Set(n.counties) }); for (const f of n.counties) owner.set(f, n.id); }` — no validation that those fips exist in `county`. saves.js:9 writes `v: 1` but saves.js:19 `const snap = JSON.parse(raw);` never reads it. `alias` (game.js:17, built at :62 `alias[m] = aid;`) is rebuilt from the *current* areas.json and is not part of the save.
```

**Failure scenario.** Save with the current areas.json. Re-run build_areas.py with a lower threshold so county 06045 now merges into Area 06023. Load the save: `snap.counties['06045']` finds no `county['06045']` → skipped, so its played population and GDP are lost while `county['06023']` keeps its pristine init sum. Then `owner.set('06045', '06')` puts a dead fips in the owner map and in `nations.get('06').counties`. Symptom 1: the panel says "N counties" counting a county that contributes 0 to `demographics()` (game.js:96 `const c = county[f]; if (!c) continue;`). Symptom 2: if Area 06023 itself isn't listed in any nation, `Game.getOwner('06023')` is undefined → `colorForCounty` returns `'#c9ced6'` (game.js:386) and `redrawBorders` draws a hard border around a grey hole. Symptom 3: the next round wrap crashes — game.js:296 `const c = county[f]; d += c.demPop;` in growAll throws `TypeError: Cannot read properties of undefined (reading 'demPop')` on the dead fips, and so does game.js:269 in applyCivilWarCost.

**Why it matters.** The county table's shape is a function of data/areas.json (3143 raw counties collapse to 1676 records via 483 areas covering 1950 members). areas.json is a build artifact the owner edits — build/build_areas.py has a `threshold` key right in the file. The moment that threshold moves, every existing save is silently wrong, and the failure is delayed and non-obvious. The target design's "single source of truth JSON that editor + game + tooling read and write in place" makes this worse, not better, unless the save is version-gated.

**Fix.** Stamp the build into the save — hash areas.json (or carry its `threshold` and area count) into `snapshot()` alongside `v`, and have `apply()` refuse to load a mismatched save with a clear message rather than corrupting state. Independently, make loadState defensive: skip nation counties whose `county[f]` is missing, count them, and report; and add `if (!c) continue;` guards in growAll (game.js:296, 302) and applyCivilWarCost (game.js:269, 281, 284, 287) so a bad load degrades instead of throwing.

> **Verifier note.** Verified end to end. game.js:353-356 silently drops snapshot keys with no live record; 359-362 rebuilds nations and the owner map from the save with no validation that the fips exist; `v: 1` is written at saves.js:9 and never read; `alias` is rebuilt from the current areas.json and is not in the save. The premise is well founded rather than hypothetical: areas.json carries `"threshold": 50000` and build/build_areas.py line 22 is `THRESHOLD = 50_000   # tune me`, so the owner is invited to change it. The crash claim is correct — growAll (game.js:296) does `const c = county[f]; d += c.demPop;` over n.counties with no guard, so a dead fips throws TypeError, as does applyCivilWarCost:269. Medium is the right severity: it needs a deliberate rebuild, but the failure is delayed, silent and then fatal.


### 54. `external-trade-free-money` — Market.nationSurplus uses baked economy values, never live GDP, so external trade is a zero-risk repeatable GDP grant and the dominant action every turn

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/market.js, js/actions.js` — lines market.js 18-37 (esp. 24-27), 56-69 (esp. 63-68); actions.js 380-416 (esp. 385-389, 406-415)

**Evidence**

```
market.js:24-27 in `update()` scales supply by live GDP: `const live = Game.countyGdp(aid) / 1e6; const baked = a.v.reduce((s, v) => s + v, 0) || 1; const k = live / baked; a.v.forEach((v, i) => { supply[i] += v * k; });`. But market.js:63-68 in `nationSurplus()` does not: `for (const aid of n.counties) { const a = e.areas[aid]; if (a) a.v.forEach((v, i) => { prod[i] += v; }); }` — raw baked values. actions.js:406-415 `document.getElementById('a-go').onclick = () => { … Game.boostGdp(S, gain * 1e6); Market.update(); … completeTurn(); }` — no cost, no cooldown, no counterparty, no risk.
```

**Failure scenario.** Any coastal nation selects Trade → 🌐 World market → Sign export deal, every turn, unopposed. Ten rounds later its GDP is ~35% above baseline with zero risk taken, and because `Game.boostGdp` spreads the gain across counties (game.js:328-333) it also inflates every downstream metric — treasury income (`gdp * TAX_RATE`, game.js:320), the leaderboard, blueShell ranking, and the annex cap (`A.capFactor * A.before.gdp`, actions.js:504). Nations without port/border access (`acc.any` false, actions.js:244) can never do this and fall permanently behind on a coin-flip of geography.

**Why it matters.** I computed it: California's baked production is $4,048,112M gross with $1,236,702M of positive surplus, so `renderExternalPreview` grants `total * TRADE_GAIN` = **$123.7B, or +3.06% of GDP, every single turn**, for the price of an action that would otherwise be Pass. Because `nationSurplus` never reads live GDP, the surplus figure never changes, so the grant never diminishes on its own — it decays only indirectly, via `update()` raising supply and easing prices. Every other action carries dice (annex), a peace roll (unite), or a negotiation (transit). Free money that is strictly better than passing makes the whole action menu vestigial: the optimal line for all 51 seats is "export to the world market, forever".

**Fix.** Scale `nationSurplus` by live GDP the same way `update()` does — compute `k = Game.countyGdp(aid) / bakedSum` per area — so surplus responds to war losses and growth. Then make external trade an ongoing arrangement rather than a per-turn grant: sign once for a recurring per-world-turn income booked in `tickTreasuries`, with a partner-appetite cap so the world market saturates. At minimum, put a cooldown on it and let the price mechanism bite by charging the exporter's own demand against the sale.

> **Verifier note.** I recomputed from data/economy.json + game-data.json. California's baked gross ($4,048,112M) and raw positive surplus ($1,236,702M) match exactly, but the finding then multiplied the RAW surplus by TRADE_GAIN and ignored the price factor in `f.vol * (prices[f.i] / 100)`. CA's surplus sectors are Trade & Transportation, Finance and IT, whose opening prices are 60.4, 61.0 and 41.4 — all well below 100. Actual exported value is $660,999M, so the grant is $66.1B = 1.63% of CA GDP per turn, not $123.7B / 3.06% (opening prices computed from the same model: [80.9, 124.1, 126.3, 60.4, 61.0, 41.4]). Also 'nations without port/border access can never do this and fall permanently behind' is overstated — the transit-route mechanic the finding itself cites (actions.js:302-377) lets a landlocked nation reach the same market for a 17.5-35% toll.


### 55. `colors-gen-not-saved` — Colors.gen is not serialized, so nations minted after a load reuse colors already on the map

- **Severity:** low  ·  **Category:** save-load
- **Where:** `js/colors.js, js/game.js, js/saves.js` — lines colors.js 28-34; game.js 231, 345-351; saves.js 9

**Evidence**

```
colors.js:28-33 `let gen = 0; function newColor() { const i = 51 + gen++; const hue = (i * 137.508 + 40) % 360; const light = 54 + (i % 2) * 8; return \`hsl(${hue.toFixed(1)}deg 60% ${light}%)\`; }`. game.js:231 `nations.set(id, { id, name, color: color || Colors.newColor(), … })`. game.js:350 `return { seq, counties, nations: nats };` — `seq` is saved (and restored at game.js:363) but `gen` is not, and saves.js:9's snapshot has no Colors entry.
```

**Failure scenario.** Play a session where 6 nations break away (gen reaches 6, colors for i = 51..56 consumed and stored on those nations). Save, reload the page (gen resets to 0), load the save — the 6 breakaways come back with their saved colors, but `gen === 0`. The very next civil war calls `Colors.newColor()` → i = 51 → the exact same `hsl(…)` string as the first breakaway. Two distinct nations now render identically; `redrawBorders()` still draws a line between them, so the map shows a heavy border cutting through what looks like one country, and the leaderboard shows two rows with the same swatch.

**Why it matters.** `seq` and `gen` advance in lockstep during play (every createNation consumes both) but only one is persisted. Nation color is the primary identity channel on this map — the fill, the leaderboard swatch (leaderboard.js:46), the panel swatch (app.js:552) and the turn-banner dot (app.js:497) are all just `n.color`. Two nations sharing a color is indistinguishable from one nation, and with 22 playable factions and continuous county defection in the target design, minting collides constantly.

**Fix.** Add `serialize: () => ({ gen })` / `loadState: (s) => { gen = s.gen || 0; }` to Colors and carry it in the snapshot. Or derive the color deterministically from the nation id (`gen` = the numeric part of `n5`) so it needs no separate counter — that also makes colors stable across a reload of the same save.

> **Verifier note.** Verified: colors.js:28 `let gen = 0` with no serialize, game.js:350 saves `seq` (restored at 363) but nothing carries `gen`, and saves.js:9 has no Colors entry. createNation always calls newColor() (no call site passes an explicit color), so seq and gen really do advance in lockstep and only one survives. The collision after page-reload + load + next breakaway is exact (same i -> same hsl string). Severity is overstated: nothing in the model keys off color — it is used only for the fill, leaderboard swatch, panel swatch and banner dot — so the failure is purely cosmetic, self-limited to nations minted after a load, and cannot occur at all within a single session (gen is not reset by loading).


### 56. `apply-no-error-handling` — SaveManager.apply has no try/catch and its return value is ignored — a corrupt save throws mid-load and still flashes "Loaded"

- **Severity:** low  ·  **Category:** save-load
- **Where:** `js/saves.js` — lines 16-26 (esp. 17-21), 88

**Evidence**

```
saves.js:17-21 `const raw = localStorage.getItem(PREFIX + name); if (!raw) return false; const snap = JSON.parse(raw); TurnSystem.loadState(snap.turns); Game.loadState(snap.game);` — no try/catch, and no check that `snap.turns` / `snap.game` / `snap.game.nations` exist. saves.js:88 `b.onclick = () => { apply(b.dataset.name); done(\`📂 Loaded “${b.dataset.name}”.\`); }` — `done()` fires unconditionally, ignoring the boolean apply returns. Contrast saves.js:79, where the *list rendering* does wrap JSON.parse in try/catch.
```

**Failure scenario.** A save was truncated by a quota failure on a previous write (see the quota finding — setItem can fail mid-session). Click it in the Load list: `JSON.parse` throws, `apply` never returns, but the exception propagates out of the click handler so `done()` never runs either — the modal stays open, no error is shown, and the console has an uncaught SyntaxError. Variant: the JSON parses but `snap.turns` is undefined → `TurnSystem.loadState` throws on `snap.order.slice()` (turns.js:83) *after* nothing has been replaced, or worse, a partially-valid snapshot passes turns and dies inside Game.loadState's nation loop, leaving `nations` empty and the map fully grey.

**Why it matters.** The load sequence is destructive in the middle: `TurnSystem.loadState` (saves.js:20) has already replaced order/ptr/round before `Game.loadState` (saves.js:21) runs. A throw between them leaves the turn order from save X pointing at nations from game Y. `Game.loadState` is destructive too — game.js:357-358 `nations.clear(); owner.clear();` runs before the repopulation loop, so a throw inside that loop leaves a map with no nations at all.

**Fix.** Validate before mutating: parse, then check `snap.v === 1 && snap.game && Array.isArray(snap.game.nations) && snap.turns && Array.isArray(snap.turns.order)` and return false with a message otherwise. Wrap the whole apply in try/catch, and in the catch restore from a pre-load snapshot taken with `SaveManager.snapshot()` so a failed load is not also a destroyed session. Then honour the return value at saves.js:88: `if (apply(name)) done(...); else flash('Could not load that save — it may be corrupt.', 'bad');`.

> **Verifier note.** The title claim — 'throws mid-load and still flashes Loaded' — is impossible: if apply() throws, the exception propagates out of the arrow function and done() is never reached, so no 'Loaded' toast appears (the finding's own failure scenario admits this, contradicting its title). The only path that flashes falsely is apply() returning false, which requires the entry to vanish between rendering the list and the click. The stated trigger is also invalid: 'a save was truncated by a quota failure' cannot happen — localStorage.setItem is atomic and writes nothing on QuotaExceededError. What remains is a hand-edited or cross-build save (see cross-build-save-corruption), which is where the destructive mutation ordering genuinely bites.


### 57. `no-seeded-rng` — Math.random() everywhere with no seed and no RNG state in the save — blocks the design's step-through simulator and makes save-scumming free

- **Severity:** low  ·  **Category:** simulation-integrity
- **Where:** `js/turns.js, js/civilwar.js, js/parties.js, js/saves.js` — lines turns.js 19-25 (esp. 21), 62; civilwar.js 19; parties.js 59, 69; actions.js 120; saves.js 9

**Evidence**

```
turns.js:21 `const j = Math.floor(Math.random() * (i + 1));` (turn order shuffle, also used by insertAfter at :62). civilwar.js:19 `const roll = () => 1 + Math.floor(Math.random() * 6);`. actions.js:120 `if (Math.random() < P) {` (unite outcome). parties.js:59 `if (Math.random() > (def.chance == null ? 0.5 : def.chance)) continue;` and :69 `const x = lo + Math.random() * (hi - lo);`. saves.js:9's snapshot contains no RNG state.
```

**Failure scenario.** Save before a 3-dice annex. `CivilWar.resolve` (civilwar.js:43-53) rolls 6×6×5 = 180 → `fall_apart`, the nation shatters. Load the save, take the identical action: fresh Math.random() values, 1×2×1 = 2 → `victory`, everything annexed. Nothing in the model prevents this, and the dev-dashboard simulator the design calls for would produce a different graph on every run of the same scenario.

**Why it matters.** Two consequences. (1) The target design asks for a developer dashboard with a "50-turn step-through simulator graphing Authority/Sentiment/Influence to expose runaway spirals" and "RNG-seeded growth from a seed with a size cap" for New Confederacy / Great Lakes / Native American Confederation. Neither is buildable on unseeded Math.random() — you cannot reproduce a spiral you cannot replay, and you cannot A/B a slider change against a fixed rollout. (2) Right now, a save taken before an annex and reloaded after a bad roll gives a different roll, so every risky action is free: the player saves, declares war, and reloads until the dice land. That removes the tension the whole CivilWar module exists to create.

**Fix.** Replace Math.random with a small seeded PRNG (mulberry32/sfc32 is ~6 lines) exposed as `RNG.next()`, seed it at `TurnSystem.begin`, and serialize its state in the snapshot. Route every call site through it — turns.js:21, civilwar.js:19, actions.js:120, parties.js:59/69. That single change makes saves deterministic, makes the step-through simulator possible, and lets you optionally offer ironman (persist the state) vs. casual (reseed on load) as an explicit difficulty tier rather than an accident.

> **Verifier note.** Every call site checks out (turns.js:21 and 62, civilwar.js:19, actions.js:120, parties.js:59 and 69) and no RNG state appears in snapshot(). Save-scumming is genuinely free today, and an unseeded Math.random does block the target design's 50-turn step-through simulator and its RNG-seeded movement growth. Downgraded to low because nothing in the existing code misbehaves — this is an unimplemented design requirement and a difficulty-tier choice, not a fault, and the fix is additive rather than corrective.


### 58. `minor-state-omissions` — Parties.spawned, store.mode and store.cultureGran are outside the save, and setColorMode runs after loadState so the map renders twice in the wrong mode

- **Severity:** low  ·  **Category:** save-load
- **Where:** `js/parties.js, js/app.js, js/saves.js` — lines parties.js 14, 56-57, 80, 83; app.js 19-35 (esp. 20), 207; saves.js 9, 21-24

**Evidence**

```
parties.js:14 `let spawned = [];` :57 `spawned = [];` (reset on every setup) :83 `return { setup, getSpawned: () => spawned, … }` — not serialized. app.js:20 `mode: 'nations',` and app.js:207 `store.cultureGran = store.cultureGran || 'sub';` — neither in `snapshot()` (saves.js:9, which carries only `colorMode`). saves.js:21-22 `Game.loadState(snap.game); // emits -> full re-render` then `setColorMode(snap.colorMode || 'standard');` — in that order.
```

**Failure scenario.** Save a game in which Cascadian Separatists spawned but Northern Christian Kingdom did not. Reload the page — `Parties.setup` rerolls and this time spawns both. Load the save: `county.ext` correctly contains only Cascadian Separatists, but `Parties.getSpawned()` returns both names. Any future roster-driven UI (a movement list, a faction picker, the design's 22 playable factions) shows a party that has zero population anywhere on the map.

**Why it matters.** `Parties.spawned` is harmless today only because `getSpawned()` has no callers (verified by grep) — the actual party head counts live in `county.ext` and are correctly serialized at game.js:347 (`e: { ...c.ext }`) and restored at game.js:355. But the design's Ideology/Movement vocabulary will read the roster, and the moment it does, a loaded save will report the *current session's* random spawn set (parties.js:59 rerolls `Math.random() > def.chance` on every page load) rather than the one in the save. The setColorMode ordering means `Game.loadState`'s emit drives a full `recolor()` (app.js:354) under the pre-load color mode, and `setColorMode` immediately recolors all 3232 paths again — one wasted full render per load, plus a visible flash of the wrong palette.

**Fix.** Add `spawned` to the snapshot with a `Parties.loadState` that restores the roster, and skip `Parties.setup` entirely when the session begins from a load. Move `setColorMode(snap.colorMode)` in `apply()` to *before* `Game.loadState` so the single emit-driven render already uses the right mode, and add `mode` and `cultureGran` to the snapshot so a save reopens the view the player left.

> **Verifier note.** The 'visible flash of the wrong palette' is wrong. Both recolors happen inside the same synchronous click handler, so the browser paints only once, at the end of the task — the cost is one wasted 3232-path attribute pass, with nothing visible to the player.



## Rendering, UI & performance (26 findings)

### 59. `areafeature-uncached-merge-on-hover` — areaFeature() runs topojson.merge over all 3,231 county geometries on every mousemove for the 483 merged Areas

- **Severity:** high  ·  **Category:** performance
- **Where:** `js/app.js` — lines 371-376, 393; js/actions.js:57; js/editor.js:93

**Evidence**

```
function areaFeature(id) {
  const members = Game.areaCounties(id);
  if (members.length === 1) return store.countyById.get(members[0]);
  const set = new Set(members);
  return topojson.merge(store.topo, store.topo.objects.counties.geometries.filter((g) => set.has(g.id)));
}
```

**Why it matters.** data/areas.json defines 483 merged Areas covering 1,950 of the 3,143 counties — 60% of the map surface. Every mousemove over any of them executes: a 3,231-element `.filter()` allocating a fresh array, then topojson.merge which decodes the member arcs and runs an exterior/interior containment test per ring (area 02050 has 95 rings and 1,944 exterior points), then a full geoPath projection. Area membership is 100% static — it is baked offline by build/build_areas.py and never mutates at runtime — so this entire computation produces a bit-identical result every time it runs. There is no cache at all. This is also the inner loop of the Editor's state-granularity hover (finding editor-state-hover-quadratic), where it runs up to 33 times per pointer event.

**Fix.** Memoize permanently: `const areaFeatureCache = new Map(); function areaFeature(id){ if(areaFeatureCache.has(id)) return areaFeatureCache.get(id); ... areaFeatureCache.set(id, feat); return feat; }`. It must NOT be cleared in onGameChange — unlike nationOutline, Area membership never changes. Better still, precompute all 483 merges once in buildMap with a single pass that groups geometries by `Game.areaIdOf(g.id)`, turning 483 x 3,231 filter iterations into one 3,231 iteration pass.

> **Verifier note.** The title overstates the merge itself: topojson.merge runs only over the Area's 1-22 member geometries, not 'over all 3,231 county geometries'. The 3,231-element pass is the .filter() that selects them (the evidence block shows this correctly). '60% of the map surface' should be 62% of counties. Also, this is dead cost only in Counties select mode, annex hover, and the editor — the default Nations mode uses the cached nationOutline path instead.


### 60. `editor-state-hover-quadratic` — Editor.onHover in State granularity does a 1,676-key scan plus up to 33 topojson.merge calls per mousemove — and then draws nothing

- **Severity:** high  ·  **Category:** performance
- **Where:** `js/editor.js` — lines 50-55, 92-95

**Evidence**

```
function unitAreas(fips) {
    const aid = Game.areaIdOf(fips);
    if (gran === 'county') return [aid];
    const st = Game.county[aid].st;
    return Object.keys(Game.county).filter((a) => Game.county[a].st === st);
  }
  function onHover(d) {
    const feats = unitAreas(d.id).map((a) => areaFeature(a));
    store.hoverShape.attr('d', store.path({ type: 'FeatureCollection', features: feats.flatMap((f) => (f.type === 'FeatureCollection' ? f.features : [f])) })).style('display', null);
  }
```

**Failure scenario.** Enter the map editor, click "Select by: State", move the mouse across Texas. Per pointer event: `Object.keys(Game.county)` allocates a 1,676-element array and filters it, returning Texas's 104 Areas; 33 of those are merged, so `areaFeature` runs 33 x 3,231 = 106,623 filter iterations plus 33 topojson.merge calls; then a 104-feature FeatureCollection is projected. At 60-120 events/sec this is tens of milliseconds per event — the editor drops to single-digit fps while the mouse moves.

**Why it matters.** On top of the cost, the output is wrong. `areaFeature` returns a GeoJSON *Feature* for singleton areas (line 373, from `store.countyById`) but a raw *Geometry* (MultiPolygon) from `topojson.merge` for merged ones. d3's FeatureCollection stream handler is `FeatureCollection:function(t,n){for(var e=t.features,...)Uf(e[r].geometry,n)}` and `Uf(t,n){t&&Of.hasOwnProperty(t.type)&&Of[t.type](t,n)}` — it reads `.geometry` off each member. A raw MultiPolygon has no `.geometry`, so it is silently skipped. Every merged Area is invisible in the editor hover highlight, in both County and State granularity. That is 483 of 1,676 Areas you cannot see the outline of while painting them.

**Fix.** Make `areaFeature` return a consistent shape — always a Feature (`{type:'Feature', id, geometry: merged}`) — and fix the wrapper. Then hoist the state->Areas map out of the hover path: build `const areasByState = {}` once in `enter()` and look it up. Add a `lastHoverKey` guard so re-entering the same state is a no-op.

> **Verifier note.** The title's 'and then draws nothing' is wrong. areaFeature returns real Features for singleton Areas (from store.countyById), so 71 of Texas's 104 Areas DO render in the state-granularity hover; only the 33 merged ones vanish. The body states this correctly. Worth adding: the same silent drop hits County granularity too, so all 483 merged Areas are invisible on hover in the editor regardless of mode.


### 61. `editor-no-import-of-published-modes` — The editor can only publish map modes, never load them back — there is no round trip between data/*.mapmode.json and the authoring tool

- **Severity:** high  ·  **Category:** architecture
- **Where:** `js/editor.js` — lines 30-34, 101-129

**Evidence**

```
  const newMode = (name, requireAll) => ({ name, requireAll, nodes: [], assign: {} });
  function defaults() {
    modes = { Geographical: newMode('Geographical', true), Cultural: newMode('Cultural', true) };
    cur = 'Geographical';
  }
  ...
  function publish() { ... a.download = `${m.name.toLowerCase().replace(/\W+/g, '-')}.mapmode.json`; a.click(); ... }
  function loadDraft(name) { const raw = localStorage.getItem(PREFIX + name); ... }
```

**Why it matters.** `defaults()` always creates EMPTY Geographical and Cultural modes. The editor never reads `MapModes.getRegion()` or `MapModes.getCulture()`, so the 1,676 assignments and 101 nodes already published in data/cultural.mapmode.json are invisible to the tool that made them. The only persistence is a localStorage draft under `ns_mapmode_<name>`; clear site data, switch browsers, or open the game on another machine and the authored work is gone with only a downloaded JSON file that nothing can re-import. Publishing also requires manually moving the file out of ~/Downloads into data/ and hand-bumping a cache-buster. This is precisely the "single persistent JSON that editor + game read and WRITE IN PLACE" the target design calls for, and it is the one part of that goal that is actively contradicted by the current code.

**Fix.** On `enter()`, seed `modes.Geographical` and `modes.Cultural` from `MapModes.getRegion().def` / `MapModes.getCulture().def` when a draft is absent, and set `idSeq` past the highest existing `n<number>` id so new nodes cannot collide. Add an "Import .mapmode.json" file input next to Publish. Longer term, move persistence behind a small local write endpoint so publish writes data/<name>.mapmode.json in place.

> **Verifier note.** Minor: the idSeq collision risk the fix mentions is real but currently latent — loadDraft does restore idSeq (line 124), so collisions only appear once seeding from published JSON is added, which is what the fix proposes.


### 62. `hover-on-mousemove-no-guard` — onHover is bound to mousemove with no "same target" guard — the whole hover outline is re-projected and re-serialized on every pointer event

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/app.js` — lines 132, 378-395

**Evidence**

```
.on('mousemove', onHover)   // line 132

function onHover(event, d) {
  ...
  if (store.mode === 'nations') {
    const nid = Game.getOwner(d.id);
    if (nid) store.hoverShape.attr('d', store.path(nationOutline(nid))).style('display', null);   // 391
  } else {
    store.hoverShape.attr('d', store.path(areaFeature(d.id))).style('display', null);            // 393
  }
}
```

**Why it matters.** mousemove fires 60-120x/second while the pointer moves. The culture branch is the only one that early-outs on an unchanged target (`if (nid === store.cultureHoverId) return;`, line 383). The nations and counties branches have no such guard, so every single event rebuilds the same `d` string. I measured the merged outlines from data/counties-10m.json: mean nation outline = 330 coordinate pairs, Texas = 856, Alaska = 4,194. Each pair goes through d3.geoAlbersUsa, a composite projection that multiplexes every point into three clipped sub-streams, then gets formatted into a path string that the browser must re-parse and re-rasterize. Hovering Alaska means ~12,600 projection calls and a ~50KB `d` attribute rewrite per pointer event, for a shape that has not changed.

**Fix.** Track the last hovered key (nation id / area id) in `store` exactly as the culture branch already does, and return early when it is unchanged. Then cache the serialized path string, not just the feature: `store.pathCache = new Map()` keyed by nation id, cleared in onGameChange alongside `store.outlineCache.clear()` (line 352). Apply the same guard to Actions.onHover (js/actions.js:53, 57) and Editor.onHover (js/editor.js:92).

> **Verifier note.** Two overstatements. (1) nationOutline() IS cached in store.outlineCache (app.js:173-179), so the per-event cost is re-projection + string serialization only, not the merge — the finding's own fix text concedes this but the title implies otherwise. (2) 'mousemove fires 60-120x/second' — browsers coalesce mousemove to roughly one dispatch per animation frame, so ~60/s is the realistic rate. The app stays usable; this is visible jank on large outlines (AK, TX, CA), not a hang.


### 63. `editor-membercount-per-render` — Editor.renderSidebar recomputes memberCount for every tree node against every assignment on every paint click

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/editor.js` — lines 47, 133-140, 56-75

**Evidence**

```
const memberCount = (id) => Object.values(modes[cur].assign).filter((p) => p.includes(id)).length;
...
  <button class="ed-name" data-sel="${n.id}">${esc(n.name)} <span>${memberCount(n.id)}</span></button>
...
  function paintUnit(fips) {
    ...
    renderSidebar();
    recolor();
  }
```

**Failure scenario.** Load the published Cultural hierarchy (data/cultural.mapmode.json has 4 + 20 + 77 = 101 nodes and 1,676 assignments). Each click on a county to paint it runs `renderSidebar()`, which calls `memberCount` once per node: 101 x `Object.values(assign)` (allocating a 1,676-element array each time) x a `.includes` over the path = ~169,000 array scans plus 101 array allocations of 1,676 elements. Then `unassignedCount()` scans 1,676 keys again (line 162), the whole sidebar innerHTML is rebuilt, ~500 event handlers are re-attached (lines 168-218), and `recolor()` repaints all 3,232 paths. One paint click.

**Why it matters.** Authoring a map mode means thousands of paint clicks. This makes each one cost ~100ms+, and it gets worse linearly as the tree grows — exactly the direction the target design goes (per-county sentiment regions, 22 factions, homelands). The editor is the tool that produces the game's data; if it is slow to paint, the data does not get authored.

**Fix.** Maintain the counts incrementally. Keep `counts = {nodeId: n}` on the mode, updated in `paintUnit` when an assignment changes (decrement the old path's ids, increment the new path's). Recompute from scratch only in `loadDraft`/mode-switch. Separately, stop calling `renderSidebar()` from `paintUnit` — only the count spans and the status line change; update those two text nodes in place and leave the tree DOM (and its listeners, and the scroll position of `.ed-tree`) alone.

> **Verifier note.** The stated failure scenario is unreachable. defaults() (editor.js:31-34) always creates EMPTY Geographical/Cultural modes and editor.js contains zero references to MapModes (I grepped) — you cannot 'load the published Cultural hierarchy' into the editor at all, per the reviewer's own finding editor-no-import-of-published-modes. The 101-node/1,676-assignment state only arises after an author builds it by hand and reloads a localStorage draft. The cost estimate is also inflated: 169k .includes over <=3-element arrays plus 101 array copies is single-digit milliseconds, not '~100ms+'; handlers re-attached are ~300-400, not ~500; and the actual dominant cost of a paint click is recolor() (3,232 fills x 2 interpolateRgb each), i.e. the finding interpolatergb-per-county.


### 64. `ongamechange-fanout` — One annex triggers 2 emits, which cascade into 5 Leaderboard rebuilds, 5 whole-topology merges, 3 full recolors and 4 panel rebuilds — with no batching

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/app.js` — lines 350-365; js/game.js:209, 222, 289; js/actions.js:566-594

**Evidence**

```
function onGameChange() {
  store.outlineCache.clear();
  TurnSystem.sync();
  recolor();
  redrawBorders();
  Leaderboard.refresh();
  renderTurnBanner();
  if (store.selected) { ... select(store.selected.level, store.selected.id); }
}
// and select() itself ends with:  Leaderboard.refresh();   (line 429)
```

**Failure scenario.** Confirm an annex that wins a civil war (js/actions.js:569-573). `Game.moveCounties` emits (game.js:222) and `Game.applyCivilWarCost` emits (game.js:289) — 2 emits. Each onGameChange does recolor + redrawBorders + Leaderboard.refresh + select(), and select() calls Leaderboard.refresh() again. Then `restoreColorMode()` (actions.js:591) calls setColorMode -> recolor #3; `clearVisuals()` (592) runs two more full `.classed` passes over 3,232 paths; `completeTurn()` -> `select('nation', next)` -> Leaderboard.refresh #5. Total per annex: 3 full fill passes + 2 class passes = 16,160 DOM attribute writes; 2 full redrawBorders; 5 Leaderboard.refresh (each = 51 x Game.nationDemographics = 1,676 record reads + innerHTML + ~54 addEventListener calls, so 8,380 record reads and ~270 listener registrations); 5 nationOutline() calls each filtering 3,231 geometries (16,155 iterations) because outlineCache was just cleared; 4 full right-panel innerHTML rebuilds. On a round rollover `Game.growAll` (game.js:310) adds a third emit and two more refreshes.

**Why it matters.** Every one of those repetitions produces the same final pixels. The player sees the panel and leaderboard flicker through 4-5 intermediate states. More importantly this is the cost floor for the target design, where county-level secessionist sentiment updates every county every turn: if each sentiment tick emits, you pay the full cascade per tick, and the 50-turn step-through simulator in the dev dashboard becomes minutes of DOM thrash.

**Fix.** Coalesce. Make `emit()` set a dirty flag and schedule onGameChange on requestAnimationFrame (or a microtask), so N mutations in one action collapse to one render. Split the render into independent dirty bits — `ownershipChanged` (redrawBorders + outlineCache.clear), `valuesChanged` (recolor + leaderboard), `selectionChanged` (panel) — so a pure GDP tick does not re-mesh borders. Remove the `Leaderboard.refresh()` from `select()` (429) and `deselect()` (438); instead toggle the `.sel` class on the one affected `<li>`.

> **Verifier note.** Three corrections. (1) nationOutline recomputes 3 times, not 5 — outlineCache is cleared once per onGameChange and repopulated by that same call's select(), so only the 2 onGameChange selects plus completeTurn's select miss. (2) Right-panel innerHTML rebuilds are 3, not 4. (3) The user-visible claim is false: the entire cascade runs inside one synchronous JS task, so the browser never paints an intermediate state — the player does NOT 'see the panel and leaderboard flicker through 4-5 intermediate states'. The real cost is CPU and GC, which still justifies the rAF-coalescing fix.


### 65. `redrawborders-full-mesh` — redrawBorders() re-meshes the entire 3,231-geometry county topology on every model change

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/app.js` — lines 181-186, 168-170

**Evidence**

```
function redrawBorders() {
  store.nationBorders.attr(
    'd',
    store.path(topojson.mesh(store.topo, store.topo.objects.counties, (a, b) => meshOwner(a.id) !== meshOwner(b.id)))
  );
}
```

**Why it matters.** Measured against data/counties-10m.json: topojson's extractArcs walks all 3,231 geometries and pushes 19,019 arc references into 9,869 freshly-allocated per-arc arrays (so ~29,000 objects allocated per call, all garbage immediately after), then invokes the filter 9,869 times — 19,738 `meshOwner`/`Game.getOwner` calls — then stitches and decodes the 1,232 arcs that pass (4,531 coordinate pairs at game start) and projects them through geoAlbersUsa. That is ~5ms and ~29k allocations per call, and it runs twice per annex (finding ongamechange-fanout). The arc-to-owner relationship only changes for arcs touching counties that actually changed hands — typically a handful.

**Fix.** Precompute the arc adjacency ONCE in buildMap: walk the topology to build `arcNeighbors[arcIdx] = [geomIdA, geomIdB]` (the same 19,019-reference pass, done once). Then redrawBorders becomes a 9,869-iteration loop over a flat array with no allocation, feeding `{type:'MultiLineString', arcs: stitch(...)}`. For an incremental version, keep a per-arc owner-pair cache and only re-evaluate arcs whose geometries are in the changed set.

> **Verifier note.** The '~5ms per call' is an unverified estimate (I could not run a JS benchmark — no node in this environment). At 4,531 output coordinate pairs the projection half is small; the allocation-heavy extractArcs pass dominates. Two calls per action puts this in the ~10ms-per-click range, which is wasteful but well under a dropped frame budget for a discrete click.


### 66. `interpolatergb-per-county` — Every value map mode constructs a fresh d3.interpolateRgb per county per recolor — 3,232 to 6,464 color parses per repaint

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/mapmodes.js` — lines 39, 96, 101, 106; js/editor.js:85-86

**Evidence**

```
// mapmodes.js
    return d3.interpolateRgb(base, '#ffffff')(0.22 * (p.length - 1)); // 39, geographic
    return d3.interpolateRgb(PURPLE, margin >= 0 ? BLUE : RED)(t);    // 96, political
    return d3.interpolateRgb('#eaf5ec', '#146a34')(gdpScale(v));       // 101, gdp
    return d3.interpolateRgb('#fde047', '#15308f')(popScale(v));       // 106, population
// editor.js
    c = d3.interpolateRgb(c, '#ffffff')(0.22 * (path.length - 1));                  // 85
    if (selId && !path.includes(selId)) c = d3.interpolateRgb(c, '#242a31')(0.75);  // 86
```

**Why it matters.** `recolor()` (app.js:192) calls `fillFor` for all 3,232 `<path>` elements. In geographic, political, gdp, population and editor modes each call constructs a brand-new interpolator, which parses both endpoint color strings (regex + named-color lookup), builds three per-channel gamma interpolators, and returns a closure — all thrown away after one evaluation. Editor.color does it twice per county, so a single editor paint click costs 6,464 color parses on top of everything else in finding editor-membercount-per-render. This is pure waste: there are at most 12 distinct color ramps in the whole program.

**Fix.** Hoist them to module scope: `const RAMP_POLITICAL_D = d3.interpolateRgb(PURPLE, BLUE), RAMP_POLITICAL_R = d3.interpolateRgb(PURPLE, RED), RAMP_GDP = d3.interpolateRgb('#eaf5ec','#146a34'), RAMP_POP = d3.interpolateRgb('#fde047','#15308f')`. For the tier-lightening in regionColor/Editor.color, precompute the 3 or 4 possible (palette entry x tier) results into a lookup table when the mode is set, since `0.22 * (path.length - 1)` only takes 3 values.

> **Verifier note.** Two inaccuracies. The count is understated, not overstated: each interpolateRgb parses TWO colors, so a normal recolor is ~6,464 parses and an editor recolor ~12,928, not '3,232 to 6,464'. And 'every value map mode' is too broad — standard, cultural and economy return precomputed strings and build nothing; it is political/gdp/population/geographic plus the editor. Realistic cost is a few milliseconds per repaint, which matters because of the 3-5 repaints per action, not on its own.


### 67. `county-lines-toggle-desync` — setMode() strips the .active class off the County-lines button, desyncing it from the actual SVG state

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/app.js` — lines 466-475; index.html:38-43

**Evidence**

```
function setMode(mode) {
  if (mode === store.mode || Actions.isActive()) return;
  store.mode = mode;
  document.querySelectorAll('.toggle button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
// index.html
          <div class="toggle" role="group" aria-label="County lines">
            <button id="btn-clines" title="...">County lines</button>
          </div>
```

**Failure scenario.** Click "County lines" (button gets `.active`, `svg.hide-clines` is removed, interior county lines appear). Now click "Nations" or "Counties". The selector `.toggle button` also matches `#btn-clines` because it lives inside a `<div class="toggle">`; it has no `data-mode`, so `undefined === mode` is false and `classList.toggle('active', false)` strips the class. The lines are still drawn but the button reads as OFF. The next click on it computes `show = !clines.classList.contains('active')` -> true, re-adds `.active` and sets `hide-clines` to false — no visible change. The user has to click it twice to turn the lines off.

**Why it matters.** The toggle silently lies about map state, and `setMode` is also called from the leaderboard rows (leaderboard.js:57), the turn banner (app.js:502), completeTurn (516) and SaveManager.apply (saves.js:24) — so it desyncs constantly during normal play, not just when the user touches the mode toggle.

**Fix.** Scope the selector: `document.querySelectorAll('.toggle button[data-mode]')`, matching what `wireControls` already uses on line 450. Or give the lines button its own container class.

> **Verifier note.** 'It desyncs constantly during normal play' is overstated. setMode early-returns on `mode === store.mode` (line 467), so the strip only happens on an actual Nations<->Counties transition, and only matters if the user had turned county lines on. The leaderboard/turn-banner/completeTurn/SaveManager calls the finding lists are almost always setMode('nations') while already in nations mode, i.e. no-ops. Impact is a lying button label plus one wasted click.


### 68. `editor-exit-restores-nothing` — Editor.enter() mutates global UI state that exit() never restores, and the editor is not gated on an in-flight action

- **Severity:** medium  ·  **Category:** ux
- **Where:** `js/editor.js` — lines 222-236; js/app.js:456

**Evidence**

```
  function enter() {
    if (!modes) defaults();
    active = true;
    document.getElementById('btn-editor').textContent = 'Exit map editor';
    deselect();
    setMode('counties');
    renderSidebar();
    recolor();
  }
  function exit() {
    active = false;
    document.getElementById('btn-editor').textContent = 'Enter map editor';
    Leaderboard.refresh();
    recolor();
  }
```

**Failure scenario.** You are on Texas's turn in Nations mode with the nation panel open. Click "Enter map editor" — `deselect()` wipes the panel to the placeholder and `setMode('counties')` flips the select mode. Paint a few areas, click Exit. You are returned to: Counties select mode (not Nations), an empty placeholder panel, no selection outline, and no way to know it was Nations before. The turn is still Texas's but nothing on screen says so except the turn bar. Worse: start an Annex action, then click "Enter map editor". `Actions.isActive()` is still true so `setMode('counties')` silently early-returns (app.js:467); `deselect()` runs but leaves the `.dim`/`.chosen` classes and the actionLayer on the map; `onClick` now routes to `Editor.onClick` (app.js:402, checked before Actions) so you paint instead of annexing, while `A` is still live and the Advance-world / Pass-turn buttons remain clickable.

**Why it matters.** The editor is the authoring tool for the game's single source of truth. Round-tripping between play and authoring has to be lossless or you lose your place every time; and it must not be enterable mid-action or the action state machine is left in an unreachable state.

**Fix.** Snapshot in enter(): `saved = {mode: store.mode, colorMode: store.colorMode, selected: store.selected}`; in exit(), restore `setMode(saved.mode)`, `setColorMode(saved.colorMode)` and re-`select(...)` (or `renderPlaceholder()`), then `Leaderboard.refresh()`. Guard `toggle()` with `if (Actions.isActive()) return flash('Finish or cancel the current action first.', 'warn')`, and disable the turn-bar buttons and the Map/Select toggles while active.

> **Verifier note.** One detail is wrong: the Pass-turn button is not live during a stranded action — passTurn() (app.js:521) starts with `if (Actions.isActive()) return;`. Only 'Advance world' (app.js:502) is genuinely clickable and unguarded. The rest of the failure scenario reproduces as written.


### 69. `leaderboard-rebuild-cost` — Leaderboard.refresh rescans every nation's counties, rebuilds all innerHTML and re-attaches ~54 listeners — 5 times per player action

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/leaderboard.js` — lines 9-19, 28-67

**Evidence**

```
  function rows() {
    const list = [];
    for (const [id, n] of Game.nations) {
      const d = Game.nationDemographics(id);
      list.push({ id, name: n.name, ... });
    }
  ...
    host.innerHTML = ` ... ${list.map(...).join('')} ... ${typeof Market !== 'undefined' ? Market.html() : ''}`;
    host.querySelectorAll('.lb-row').forEach((el) => { el.addEventListener('click', ...); });
    host.querySelectorAll('.lb-sort button').forEach((b) => { b.addEventListener('click', ...); });
```

**Why it matters.** `rows()` is O(total Areas) = 1,676 record reads plus 51 result-object allocations (each `demographics()` also allocates an `extTotals` and an `extPct` object and does two `for..in` loops). Multiplied by the 5 refreshes per annex traced in finding ongamechange-fanout, that is 8,380 record reads and ~270 addEventListener registrations per action, all producing identical markup. The user-visible symptom is worse than the CPU cost: `#leaderboard` is `overflow-y: auto` at a fixed 206px (css/style.css:337) and holding 51+ rows, so **the scroll position resets to the top on every refresh**. Scroll down to look at the bottom-ranked nations, advance the world, and you are yanked back to rank 1. With the target design's ~22 factions plus continuous county defection creating and dissolving nations every turn, this fires constantly.

**Fix.** Cache demographics per nation, invalidated by a model version counter bumped in `Game.emit()`. Build the list once and diff it: keep the 51 `<li>` nodes and update only `textContent` of `.lb-rank`/`.lb-metric` and the `.sel` class; create/remove rows only when nations actually appear or dissolve. Use one delegated click listener on `host` instead of 54. Preserve `host.scrollTop` across any full rebuild.

> **Verifier note.** The scroll reset is the substantive user-visible defect; the CPU cost (~8k plain object-field reads plus 51 small allocations) is a couple of milliseconds and is not what the user feels.


### 70. `neighbors-panel-uses-raw-counties` — renderNeighbors lists raw county neighbours and raw county names, ignoring the Area abstraction the rest of the game uses

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/app.js` — lines 796-804

**Evidence**

```
function renderNeighbors(fips) {
  const members = new Set(Game.areaCounties(fips));
  const list = [...new Set([...members].flatMap((m) => (store.neighbors && store.neighbors[m]) || []))]
    .filter((f) => !members.has(f));
  ...
  const names = list.map((f) => escapeHtml(store.data.counties[f]?.name || f));
```

**Failure scenario.** Select an Area that borders a merged Area. `store.neighbors` (data/county_neighbors.json) is keyed by raw county FIPS, so the list contains individual member counties of neighbouring Areas — several entries for what is actually one clickable unit — and names them from the raw `store.data.counties` records rather than the Area name (which Game.init rewrote to '<X> Area', game.js:56). The panel says 'Neighbors - Census adjacency - 11' when the unit actually has 4 neighbouring Areas, and names counties the player cannot select or interact with.

**Why it matters.** Game.countyNeighbors (game.js:116-125) already does this correctly, collapsing through `cid()` and de-duplicating at Area level — it is what every gameplay path uses (annexTargets, components, partialSubset, transitLink). The panel is the one place that bypasses it, so the number the player reads does not match the number of things they can annex. Adjacency and neighbouring-power pull are load-bearing in the target design's sentiment model.

**Fix.** `const list = Game.countyNeighbors(fips);` and name each with `Game.area(f)?.name`. That also removes the redundant `store.neighbors` fetch (app.js:47) since data/adjacency.json already backs Game.countyNeighbors.

> **Verifier note.** There is a further defect the finding misses: county_neighbors.json still keys Connecticut by the eight old counties ('09001' is present, '09190' is not), so every CT planning region renders 'Neighbors - Census adjacency - 0' with '— none on file for this unit'. Switching to Game.countyNeighbors fixes that too.


### 71. `global-namespace-and-load-order` — Implicit cross-module globals with a hand-maintained script order and per-file cache-busters, and DEMAND_SHARE is a lexical const consumed by a script that loads earlier

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `index.html` — lines 70-84; js/app.js:630; js/market.js:34, 68

**Evidence**

```
    <script src="js/leaderboard.js?v=23"></script>
    <script src="js/world.js?v=23"></script>
    <script src="js/market.js?v=25"></script>
    <script src="js/app.js?v=30"></script>
// app.js:630
const DEMAND_SHARE = [0.08, 0.10, 0.22, 0.15, 0.15, 0.10];
// market.js:34 and :68, in a file that loads BEFORE app.js
      const demand = DEMAND_SHARE[i] * perCap * popTotal;
```

**Why it matters.** Every module reads other modules' globals implicitly: market.js reads `DEMAND_SHARE` from app.js; leaderboard.js reads `store`, `escapeHtml`, `setMode`, `select`, `Actions`; editor.js reads `flash`, `recolor`, `deselect`, `setMode`, `areaFeature`, `store`; actions.js reads `nationOutline`, `meshOwner`, `areaFeature`, `setSelectOutline`, `completeTurn`, `nationExportAccess`, `transitLink`; saves.js reads `setColorMode`, `store`. That is a dependency cycle app.js <-> {leaderboard, actions, editor, market, saves}. `DEMAND_SHARE` is declared with `const`, so it lives in the global *lexical* environment and is NOT a property of `window`; it is in the temporal dead zone until app.js finishes executing. It works today only because nothing calls Market.update() before `init()` does (app.js:68). Any reordering, any `defer`, any future module conversion turns that into a ReferenceError. Separately: the 13 `?v=` cache-busters are bumped by hand and already inconsistent (app.js and actions.js at v=30, mapmodes at v=28, editor at v=18), and only ONE of the twelve data fetches is versioned (`data/county_trade.json?v=2`, app.js:49) — so re-running build/build_economy.py while game-data.json stays cached gives you a silently desynced economy where `e.areas[aid]` misses and the economy map mode paints everything '#3a4149'.

**Fix.** Move the six shared constants and helpers (`DEMAND_SHARE`, `escapeHtml`, `fmtPop`, `fmtGdp`, `store`) into a `js/core.js` loaded first, and hang everything off one `NS` namespace object so the reads are explicit and greppable. Replace the hand-bumped query strings with a single build-stamp applied to every script AND every data URL (`?v=<hash>`), or serve with `Cache-Control: no-cache` in the dev server.

> **Verifier note.** The cache-desync consequence is speculative and overstated: a stale game-data.json against a fresh economy.json would surface as missing e.areas[aid] entries only for Areas whose ids changed, painting those '#3a4149' — not 'everything'. And game-data.json and economy.json are produced by different build scripts, so the specific coupling described is not the likeliest failure.


### 72. `strokes-scale-with-zoom` — All map strokes are scaled by the zoom transform — at 9x zoom the nation borders are 10px slabs

- **Severity:** medium  ·  **Category:** ux
- **Where:** `css/style.css` — lines 81-99, 101-115, 194-196, 221-224; js/app.js:159-164

**Evidence**

```
/* app.js */
  const zoom = d3.zoom().scaleExtent([1, 9]) ... .on('zoom', (e) => g.attr('transform', e.transform));
/* style.css - no vector-effect anywhere */
.nation-borders { fill: none; stroke: #0b1017; stroke-width: 1.1px; ... }
.select-shape { ... stroke-width: 2.4px; ... filter: drop-shadow(0 0 4px rgba(255, 213, 74, 0.8)); }
.county { stroke: rgba(10, 16, 23, 0.35); stroke-width: 0.3px; ... }
```

**Failure scenario.** Zoom to the maximum 9x to inspect an individual county. The transform is applied to `<g>`, so every stroke width is multiplied by 9: nation borders become 9.9px, the selection outline 21.6px, the nation outline 12.6px. At that zoom a small county can be entirely covered by its own border. There is no `vector-effect: non-scaling-stroke` on any rule in the stylesheet.

**Why it matters.** Max zoom is precisely when the player is trying to read fine-grained county detail — which is the whole premise of the target design's county-level secession model. The feature actively degrades at the level it is most needed. Compounding it, `.select-shape` carries a `drop-shadow()` filter, which forces the browser to allocate a separate raster surface for a path that can be all of Alaska (4,194 points) and re-rasterize it on every zoom step and every `d` change (4-5 per action).

**Fix.** Add `vector-effect: non-scaling-stroke` to `.county`, `.nation-borders`, `.nation-outline`, `.area-borders`, `.hover-shape`, `.select-shape`, `.c-super`, `.c-region`, `.c-sub`. Replace the `drop-shadow` on `.select-shape` with a second stroked path underneath (a wider, semi-transparent accent stroke), which costs nothing to rasterize.

> **Verifier note.** Minor scoping: .county's 0.3px stroke is suppressed by default via `svg.hide-clines .county { stroke: none; }` (css:222), so the county-line half of the complaint only applies when the user turns County lines on. The nation borders, outlines, hover and selection strokes all thicken as described.


### 73. `path-per-county-not-per-area` — 3,232 <path> elements are rendered for 1,676 atomic Areas, so every recolor writes ~1,556 redundant fills and merged-Area interiors need a CSS hack to hide

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `js/app.js` — lines 123-140, 192-194; css/style.css:220-224

**Evidence**

```
  store.countyPaths = g.append('g').attr('class', 'counties').selectAll('path')
    .data(countyFeatures).join('path')...
    .attr('fill', (d) => fillFor(d.id))
// and the workaround it forces:
  g.append('path').attr('class', 'area-borders')
    .attr('d', path(topojson.mesh(topo, topo.objects.counties, (a, b) => a !== b && Game.areaIdOf(a.id) !== Game.areaIdOf(b.id))));
/* css */
svg.hide-clines .county { stroke: none; }
svg.hide-clines .area-borders { display: block; }
```

**Why it matters.** The atomic unit is the Area (game.js:375-378) — 1,676 of them after the merge collapses 1,950 counties into 483. But the DOM keeps one path per pre-merge county (3,231 topo geometries minus 8 old-CT plus 9 CT planning regions = 3,232). Every `recolor()` therefore evaluates `fillFor` and calls setAttribute 3,232 times to produce only 1,676 distinct values, and every `.classed('dim'/'chosen')` pass in Actions.dimExcept does the same. It also forces the whole `hide-clines` mechanism: a second 29,685-point mesh path (measured) plus a CSS class dance, purely to hide the interior lines of merged Areas. And it is the reason `areaFeature` has to merge geometry at runtime at all.

**Fix.** Build one path per Area in buildMap: group `topo.objects.counties.geometries` by `Game.areaIdOf(g.id)` in a single 3,231-iteration pass, merge each group once, and bind those 1,676 features. That halves every recolor and class pass, deletes `areaFeature`'s runtime merge entirely (the feature is already the bound datum), deletes the `.area-borders` mesh and the `hide-clines` CSS, and makes `d.id` an Area id everywhere so `Game.areaIdOf` drops out of the hot paths.

> **Verifier note.** Calling hide-clines 'a CSS hack the architecture forces' misreads intent: index.html:40-43 exposes it as a deliberate user feature ('Show the individual county lines inside merged Areas'), and the proposed one-path-per-Area rewrite would delete that feature outright — a trade-off the finding does not acknowledge. Per-county paths are also what makes the county-lines view possible at all.


### 74. `xss-flash-save-and-mode-names` — Save names, draft names and editor mode names are interpolated raw into flash(), which assigns innerHTML

- **Severity:** low  ·  **Category:** security
- **Where:** `js/saves.js` — lines 58, 69, 88; js/editor.js:115, 127; js/app.js:478-484

**Evidence**

```
// app.js flash()
function flash(html, kind = '') {
  let el = document.getElementById('toast');
  el.className = 'toast show ' + kind;
  el.innerHTML = html;
// saves.js
    done(`\u{1F4BE} Saved as “${name}”.`);                  // 58, name unescaped
    document.getElementById('overwrite').onclick = () => { write(name); done(`...“${name}”.`); };  // 69
    ... done(`\u{1F4C2} Loaded “${b.dataset.name}”.`);      // 88
// editor.js
    flash(`\u{1F4BE} Draft saved: ${cur}`, 'good');                    // 115, cur unescaped
    flash(`\u{1F4C2} Draft loaded: ${name}`, 'good');                  // 127
```

**Failure scenario.** Click Save, type `<img src=x onerror=alert(document.cookie)>` as the save name, press Enter. `trySave` -> `done(...)` -> `flash(...)` -> `el.innerHTML = html` -> the image element is created, fails to load, and the handler fires. Same via the editor's "+ mode" name field -> Save (draft saved: <name>).

**Why it matters.** These are the only three places in the codebase where raw user keystrokes reach innerHTML, and they are inconsistent with code five lines away: SaveManager already escapes the exact same `name` in the modal at lines 64, 81 and 82 (`esc(name)`), and the editor escapes mode names at 146 and draft names at 183. The escaping is applied to the low-risk path and skipped on the high-risk one. Once saves become shareable JSON files (a stated target-design goal), a save name becomes an attacker-controlled string.

**Fix.** Escape at every flash() call site that interpolates non-literal text — `done(\`Saved as “${esc(name)}”.\`)` etc. Better: make `flash()` take `(text, kind)` and use `textContent`, with a separate `flashHtml()` for the handful of call sites in actions.js that legitimately need `<strong>` markup (they already escape their interpolations).

> **Verifier note.** This is self-XSS only. The string is the user's own keystrokes, stored in their own same-origin localStorage, executed in their own tab — there is no second party and no privilege boundary crossed. The shareable-save future is a legitimate reason to fix it now, but it is a latent hardening issue today, not a live vulnerability. Note also that flash() has legitimate HTML callers (actions.js passes <strong> markup), so the textContent fix needs the two-function split the finding proposes.


### 75. `xss-legend-and-sector-names` — MapModes.legend() and the economy panels interpolate node names and sector names without escaping, while the same strings are escaped elsewhere

- **Severity:** low  ·  **Category:** security
- **Where:** `js/mapmodes.js` — lines 123, 130, 137; js/app.js:647, 664, 667; js/actions.js:318, 391, 425

**Evidence**

```
// mapmodes.js legend()
        .map((s, i) => `<span class="legend-key"><i style="background:${ECON_COLORS[i]}"></i>${s}</span>`)          // 123
        .map((id, i) => `<span class="legend-key"><i style="background:${REGION_PALETTE[...]}"></i>${region.names[id]}</span>`)  // 130
        .map((id) => `<span class="legend-key"><i style="background:${culture.colorByNode[id]}"></i>${culture.names[id]}</span>`) // 137
// app.js renderEconomy - line 664 raw, line 667 escaped, same variable:
      <span><i class="econ-dot" ...></i>${s}</span>                                    // 664
  return `<div class="stat"><div class="label">Economy &middot; dominant: ${escapeHtml(e.sectors[a.d])}</div>...`  // 667
```

**Failure scenario.** Author a map mode in the editor with a super-region named `<img src=x onerror=...>`, publish it, drop it in data/ as geographical.mapmode.json. `setColorMode('geographic')` -> `legend.innerHTML = MapModes.legend(mode)` (app.js:201) executes it. The same names ARE escaped when rendered in the county panel (app.js:697 `escapeHtml(r.names[id])`) and the culture panel (328, 338, 687).

**Why it matters.** Not a remote-attacker vector today, but it is a correctness bug even without malice: any region or sector name containing `&`, `<` or an apostrophe renders as broken markup in the legend while rendering correctly in the panel. And the target design has the editor and game sharing one persistent JSON that gets passed around — data-authored names will not stay trusted.

**Fix.** Escape all three legend interpolations. Then delete the three duplicate escapers (js/app.js:886 `escapeHtml`, js/editor.js:132 `esc`, js/saves.js:36 `esc` — byte-identical implementations) and expose one shared `NS.escapeHtml` that every module uses, so the next divergence is impossible.

> **Verifier note.** e.sectors comes from data/economy.json baked by build/build_economy.py with fixed sector labels, so that half is not attacker- or even author-controlled. The realistic defect is the correctness one the finding already names second: an editor-authored region name containing & or an apostrophe renders as broken markup in the legend while rendering correctly in the panel. No remote vector exists in the current architecture.


### 76. `blueshell-full-rank-in-render-path` — Game.blueShell recomputes demographics for every nation and sorts, and is called from inside click-driven render paths

- **Severity:** low  ·  **Category:** performance
- **Where:** `js/game.js` — lines 199-205; js/actions.js:153, 468

**Evidence**

```
  function blueShell(nid) {
    const ranked = [...nations.keys()].map((id) => ({ id, pop: nationDemographics(id).pop })).sort((a, b) => b.pop - a.pop);
    const topCount = Math.max(1, Math.round(0.1 * ranked.length));
    const idx = ranked.findIndex((x) => x.id === nid);
// actions.js:153, inside renderUnitePreview (runs on every click on a candidate nation)
    const shell = Game.blueShell(A.nid);
```

**Why it matters.** Each call is a full pass over all 1,676 Areas plus 51 demographics-object allocations plus a sort, to extract a single 0..1 number and throw the rest away. `renderUnitePreview` runs on every click on a candidate nation, and it already computes `Game.nationDemographics` twice and `Game.demographics(combined)` once on the same data. So one click on a unite target does roughly four full scans of the same county records. The anti-snowball ranking is exactly the kind of derived value the target design will want every turn for coalitions and difficulty tiers.

**Fix.** Compute the population ranking once per model version and cache it on Game (invalidate in `emit()`). `blueShell` then becomes an index lookup. Same for `nationDemographics` — memoize per nation per version; it is called from `rows()`, `blueShell`, `startAnnex` (which loops all nations calling it), `renderNationPanel`, `treasuryFlow` and `planSplinter`.

> **Verifier note.** 'Inside click-driven render paths' is accurate, but the title's framing invites reading this as a hot path. It is not: these are discrete click handlers, not hover or per-frame code. One pass is ~1,676 field reads plus 51 small objects plus a 51-element sort, roughly a millisecond. It is real duplicated work and worth memoizing for the target design's per-turn coalition math, but it is imperceptible today.


### 77. `export-access-linear-scans-in-panel` — nationExportAccess does two linear Array.includes per Area on every nation-panel render; transitLink is |neighbors| x |myAreas| with a Set allocation per Area

- **Severity:** low  ·  **Category:** performance
- **Where:** `js/app.js` — lines 717-736, 739-755, 702-714, 565; js/actions.js:248-250

**Evidence**

```
function areaExport(fips) {
  const members = Game.areaCounties(fips);
  const t = store.trade, x = store.transport;
  return {
    port: !!(t && t.counties && members.some((m) => t.counties[m]?.has_port)),
    canada: !!(x && members.some((m) => x.external.Canada.includes(m))),
    mexico: !!(x && members.some((m) => x.external.Mexico.includes(m))),
  };
}
// actions.js renderTradePrompt
    const routes = Game.adjacentNations(A.nid)
      .filter((t) => nationExportAccess(t).any)
      .map((t) => ({ t, link: transitLink(A.nid, t) }));
```

**Why it matters.** `x.external.Canada` and `.Mexico` are plain arrays of 18 and 14 entries (measured from data/transport.json) scanned linearly, once per member county per Area. `renderExportAccess` is on the nation panel (line 565), so it runs on every panel render — which is 4 times per annex (finding ongamechange-fanout). `transitLink` is worse: for each adjacent nation it loops all of the acting nation's Areas, and for each calls `Game.countyNeighbors(aid)` which allocates a new Set and walks the adjacency lists. Texas with 104 Areas and ~8 neighbors is ~832 Set allocations and ~5,000 neighbor lookups every time the Trade panel opens or you press Back. Under the target design's reunification endgame (one nation holding most of 1,676 Areas) that becomes ~30,000 lookups and Set allocations per panel open.

**Fix.** Convert `external.Canada`/`Mexico` to Sets once at load (`store.canadaGateways = new Set(x.external.Canada)`). Memoize `areaExport` per Area id permanently — trade/transport attributes are baked offline and never mutate. Memoize `Game.countyNeighbors` per Area id for the same reason (adjacency is static; only ownership changes). Cache `nationExportAccess` per nation per model version.

> **Verifier note.** The impact is trivial. A linear scan of an 18-element array is faster than a Set lookup at that size, and ~832 Set allocations plus a few thousand adjacency reads is around a millisecond on a click path. The panel-render count is also 3 per annex, not 4 (see ongamechange-fanout). The reunification-endgame projection (~30,000 lookups) is speculative extrapolation to a state the game cannot currently reach. Worth memoizing since all this data is statically baked, but it is not a present performance problem.


### 78. `culturemembers-uncached-expansion` — cultureMembers() rebuilds a 1,400-element county-id array on every panel render, and Game.demographics silently drops the ~half of those ids that are dead

- **Severity:** low  ·  **Category:** performance
- **Where:** `js/app.js` — lines 231-237, 302, 331, 684; js/game.js:91-99

**Evidence**

```
function cultureMembers(nodeId) {
  const c = MapModes.getCulture();
  const areas = (c && c.nodeAreas[nodeId]) || [];
  const out = [];
  for (const a of areas) for (const m of Game.areaCounties(a)) out.push(m);
  return out;
}
// game.js demographics()
    for (const f of countyIds) {
      const c = county[f];
      if (!c) continue;      // <-- absorbed member counties were deleted; silently skipped
```

**Why it matters.** Measured against data/cultural.mapmode.json: the 'South' super-region covers 637 Areas which expand to 1,427 county ids, of which ~790 were `delete`d from `Game.county` by the Area merge (game.js:61) and are silently skipped. `renderCulture` (app.js:673-691) does this for all three tiers on every county-panel render, and `renderCultureNodePanel` (295-348) does it for the node plus every child (line 331), so selecting 'South' in Culture mode expands ~1,427 ids for the parent plus several hundred per child across 20 children. `cultureOutline` is cached (line 238-244) but `cultureMembers` — which is the expensive half — is not. It is correct only by accident: it works because every Area id happens to be present in its own member list (verified across all 483 entries in areas.json). Any caller passing a mix of Area ids and raw member ids to `demographics()` will silently under-count with no error.

**Fix.** Cache `cultureMembers` per node id permanently — cultural assignments are static — and have it return AREA ids (`c.nodeAreas[nodeId]` flattened through ancestry) rather than expanded member counties, since `demographics()` keys on Area ids anyway. Then make `demographics()` loud about unknown ids in dev (`console.warn`) instead of skipping them, so the next caller that passes raw county ids finds out.

> **Verifier note.** The performance half is minor: ~1,400 array pushes plus a 1,400-iteration loop, on click-driven panel renders only, is well under a millisecond. The valuable part of this finding is the latent correctness hazard — demographics() silently under-counting for any future caller that mixes Area ids with raw member ids — not the cost.


### 79. `editor-monkeypatch-leaderboard` — editor.js permanently monkey-patches Leaderboard.refresh at module load

- **Severity:** low  ·  **Category:** architecture
- **Where:** `js/editor.js` — lines 238-240; index.html:79, 84

**Evidence**

```
  // while the editor is active the leaderboard must not overwrite the sidebar
  const origRefresh = Leaderboard.refresh;
  Leaderboard.refresh = (...a) => { if (!active) origRefresh(...a); };
```

**Why it matters.** This executes when the script tag runs, whether or not the editor is ever opened, so every Leaderboard.refresh in the program is permanently routed through an extra closure and rest-args allocation. It creates a hard load-order dependency (editor.js must come after leaderboard.js in index.html, which is only true by accident of the hand-maintained script list) and it is not idempotent — a double `<script>` include or any hot-reload nests the wrappers. It also means the editor's sidebar ownership is implicit: nothing reading leaderboard.js can tell that `#leaderboard` gets hijacked, and the editor and leaderboard silently share one DOM node (`document.getElementById('leaderboard')`, editor.js:143).

**Fix.** Invert the dependency: have `Leaderboard.refresh` itself start with `if (typeof Editor !== 'undefined' && Editor.isActive()) return;`, or have the editor render into its own `<aside id="editor">` that it shows/hides, leaving the leaderboard node untouched. Either way, delete the patch.

> **Verifier note.** The performance argument is noise — one closure and a rest-args array per refresh is unmeasurable. This is purely a maintainability/coupling finding, and it is a contained three-line, commented pattern rather than an architectural hazard.


### 80. `init-catch-misreports-render-errors` — init()'s single try/catch reports any render-time exception as a data-loading failure and leaves the app half-built

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/app.js` — lines 40-85

**Evidence**

```
async function init() {
  try {
    const [topo, data, ...] = await Promise.all([...]);
    ...
    buildMap(topo, ctGeo);
    wireControls();
    Leaderboard.refresh();
    renderTurnBanner();
    select('nation', TurnSystem.currentId());
    document.getElementById('loading')?.remove();
  } catch (err) {
    const el = document.getElementById('loading');
    if (el) el.textContent = 'Could not load map data. Run a local server (see README).';
```

**Why it matters.** The catch spans both the fetches and the entire first render. A null-deref in `buildMap`, `Leaderboard.refresh`, `MapModes.setCulture` or `renderNationPanel` produces the message 'Could not load map data. Run a local server' — pointing the developer at the network when the bug is in rendering. And because `document.getElementById('loading')?.remove()` is the last statement, the `.loading` overlay (`position:absolute; inset:0`, css:277) is left covering the map and intercepting pointer events, on top of a partially-built SVG. Individual data files already degrade gracefully via `.catch(() => null)` on lines 47-54, so the only thing this catch adds is the misdiagnosis.

**Fix.** Split it: `try { fetch... } catch { 'Could not load map data...' }` then a separate `try { buildMap; wireControls; ... } catch (e) { el.textContent = 'Render failed - see console'; throw e; }`. Remove the loading overlay in a `finally` so it never survives a failure.

> **Verifier note.** One claim is flatly wrong: 'Individual data files already degrade gracefully via .catch(() => null) on lines 47-54, so the only thing this catch adds is the misdiagnosis.' The four core fetches — counties-10m.json, game-data.json, ct-planning-regions.geojson, adjacency.json at lines 41-44 — have NO .catch, so this handler genuinely covers a real data-loading failure and its message is correct in that case. The valid part of the finding is only the over-broad span plus the overlay surviving a failure; the fix (split the try, remove the overlay in finally) still stands.


### 81. `panel-rebuilt-mid-action` — Game mutations emit while an action is still live, so onGameChange re-renders the nation panel over the action UI before the action finishes resolving

- **Severity:** low  ·  **Category:** ux
- **Where:** `js/actions.js` — lines 550-594; js/app.js:358-364

**Evidence**

```
// actions.js confirmAnnex
    if (!res.triggered) {
      Game.moveCounties(chosen, nid);        // emits -> onGameChange -> select() -> renderNationPanel
      ...
    } else if (res.outcome === 'victory') {
      Game.moveCounties(chosen, nid);        // emit 1
      Game.applyCivilWarCost(victim, nid, res.score);   // emit 2
    ...
    A = null;                                 // only cleared HERE, line 590
    restoreColorMode();
    clearVisuals();
```

**Why it matters.** `A` is not cleared until line 590, but the mutations on lines 566-583 each emit. onGameChange (app.js:358-364) sees `store.selected` still pointing at the acting nation and calls `select('nation', nid)` -> `renderNationPanel`, which writes the full nation card (including live, clickable Action buttons wired to `Actions.start`) into `#panel` while the annex is mid-resolution. `completeTurn()` then overwrites it again. The player sees the panel flash through 2-4 states. In the fall-apart branch the acting nation may have just lost counties, so the intermediate panel shows numbers that are true for no moment the player can reason about. Compare `finalize()` in the transit-trade path (line 357), which correctly does `A = null; clearVisuals();` BEFORE `Game.boostGdp` — the two paths disagree about ordering.

**Fix.** Adopt the transit path's ordering everywhere: clear `A`, restore the color mode and clear visuals BEFORE any Game mutation, so onGameChange runs exactly once against a settled action state. Combined with the rAF coalescing in finding ongamechange-fanout, one annex becomes one render.

> **Verifier note.** The user-facing half of this finding is false. The entire confirmAnnex chain executes in one synchronous task, so the browser never paints between the intermediate renders — the player cannot 'see the panel flash through 2-4 states', cannot observe numbers 'true for no moment', and cannot click the transiently-written action buttons before completeTurn overwrites them. What remains is wasted renders plus a genuine ordering inconsistency between two code paths that should agree.


### 82. `no-escape-no-focus-no-media-queries` — No Escape key, no focus styles, no keyboard path to the map, and not one media query in the stylesheet

- **Severity:** low  ·  **Category:** ux
- **Where:** `css/style.css` — lines 1-400 (no @media, no :focus); index.html:19-43, 57-65

**Evidence**

```
$ grep -n "keydown|Escape|tabindex|aria-|@media|focus" js/*.js index.html css/style.css
index.html:19:  <div class="toggle" role="group" aria-label="Selection mode">
index.html:27:  <div class="color-toggle" role="group" aria-label="Map coloring">
index.html:40:  <div class="toggle" role="group" aria-label="County lines">
js/editor.js:218: ... onkeydown = (e) => { if (e.key === 'Enter') addIt(); };
js/saves.js:51:  input.onkeydown = (e) => { if (e.key === 'Enter') go(); };
```

**Why it matters.** Four things that actually bite a desktop strategy game. (1) Escape does nothing — the save/load modal closes only by backdrop click or the Cancel button (saves.js:95-97), and a running Action cancels only by finding the Cancel button in the panel. Escape-to-cancel is reflexive in this genre. (2) Zero `:focus`/`:focus-visible` rules, while every button overrides `background` and `border` — so the UA focus ring is invisible against the custom dark chrome and keyboard navigation is untrackable. (3) The `role="group"` toggles never set `aria-pressed`; state lives only in an `.active` class. (4) No `@media` rules at all, with `#leaderboard { flex: 0 0 206px }` and `#panel { flex: 0 0 360px }` hard-coded — below ~900px viewport width the map column is squeezed to nothing and the header wraps to three rows.

**Fix.** Add a single `document.addEventListener('keydown')` handler: Escape closes the modal, else cancels a running Action, else deselects. Add a `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }` rule. Set `aria-pressed` alongside every `.active` toggle. Add one breakpoint that collapses the leaderboard to a drawer under ~1100px.

> **Verifier note.** Verified by grep across js/, index.html and css/style.css: zero @media rules, zero :focus/:focus-visible rules, zero aria-pressed, zero tabindex, and exactly two keydown handlers (editor.js:218 and saves.js:51), both Enter-only. The modal closes only via backdrop or data-close (saves.js:95-97) and an Action cancels only via the panel's Cancel button. #leaderboard is `flex: 0 0 206px` (css:337) and #panel `flex: 0 0 360px` (css:118) with no breakpoint, so the map column is squeezed on narrow viewports. All four sub-claims hold.


### 83. `publish-download-anchor` — Editor.publish() clicks a detached anchor and revokes the object URL synchronously — the download can silently fail outside Chrome

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/editor.js` — lines 101-112

**Evidence**

```
    const blob = new Blob([JSON.stringify({ type: 'ns-mapmode', ...m }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${m.name.toLowerCase().replace(/\W+/g, '-')}.mapmode.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash(`\u{1F4E4} Published ${a.download} (check your downloads).`, 'good');
```

**Why it matters.** The anchor is never inserted into the document, and the object URL is revoked in the same synchronous tick as the click. Firefox requires the anchor to be connected for a programmatic `click()` to start a download, and revoking before the fetch for the blob completes can abort it. The user gets the success toast either way, so a failed publish is indistinguishable from a successful one — and publish is the only way work leaves the editor (finding editor-no-import-of-published-modes), so a silent failure loses authored data.

**Fix.** `document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 0);` — and capture `url` in a variable, since `a.href` returns the resolved absolute URL rather than the string you set.

> **Verifier note.** The Firefox claim is dated — Firefox has supported programmatic click() on a detached anchor for years; the durable hazard is the synchronous revokeObjectURL racing the download fetch, which MDN explicitly warns against. The fix's stated rationale for capturing the URL in a variable is also wrong: blob: URLs are already absolute, so a.href returns exactly the string that was set and revoking it works fine.


### 84. `nation-color-unescaped-from-save` — Nation colors from deserialized save data are interpolated raw into style attributes in five render paths

- **Severity:** low  ·  **Category:** security
- **Where:** `js/app.js` — lines 497, 552, 592; js/leaderboard.js:46; js/actions.js:630

**Evidence**

```
// app.js renderTurnBanner / renderNationPanel / renderCountyPanel
    <button class="tb-current" id="tb-jump"><span class="dot" style="background:${n.color}"></span>
      <span class="swatch" style="background:${n.color}"></span>
      <span class="swatch" style="background:${color}"></span>
// leaderboard.js
            <span class="lb-sw" style="background:${r.color}"></span>
// game.js loadState reads it straight from JSON:
      nations.set(n.id, { id: n.id, name: n.name, color: n.color, ... });
```

**Why it matters.** `Game.serialize`/`loadState` (game.js:349, 360) round-trip `color` as an arbitrary string with no validation. A save whose nation color is `red" onmouseover="...` breaks out of the style attribute. Today saves live in same-origin localStorage so the exposure is limited, but the nation *name* on the adjacent line IS escaped (`escapeHtml(n.name)`) — the inconsistency is the tell. The target design's shareable-save direction turns this into a real vector.

**Fix.** Validate on load: `color: /^(#[0-9a-f]{3,8}|hsl\(|rgb\()/i.test(n.color) ? n.color : Colors.newColor()`, and escape at the five interpolation sites regardless. Same treatment for `n.gov`, which is already escaped at app.js:620 but used as an object key at game.js:321.

> **Verifier note.** Self-XSS only today: the payload has to be written into the user's own same-origin localStorage by the user, and the app offers no import path for a foreign save. The severity as filed (low) is right for the current architecture; it becomes real only if the shareable-save direction lands.



## Economy, market & trade (17 findings)

### 85. `price-monotonic-ratchet` — Every market price drifts up 1.302% per world turn forever and pins at the 400 clamp; nothing can ever push it back down

- **Severity:** high  ·  **Category:** simulation-integrity
- **Where:** `js/market.js, js/world.js, js/game.js` — lines market.js:31-36; world.js:66-88,144-157; game.js:293-311

**Evidence**

```
market.js:31 `if (perCap == null) perCap = gdpTotal / popTotal;` — calibrated once, never again.
market.js:34-35 `const demand = DEMAND_SHARE[i] * perCap * popTotal;` / `BASE * Math.pow(demand / (sup || 1), ELASTICITY)`.
world.js:66-88 `phasePopulationGrowth` writes only `c.demPop/gopPop/othPop`; world.js:144-145 copies `gdp: c.gdp` into snap AND nxt and world.js:152-155 writes it straight back — no phase in `advanceTurn` ever touches GDP.
game.js:307 `c.gdp *= 1 + rate;` inside `growAll`, which also grows pop by the same `rate`.
```

**Failure scenario.** Start a game, click 'Advance world' 90 times without doing anything else. Manufacturing and Resource Extraction are both pinned at 400. Click 85 more times and all six sectors read 400 with a flat '·' trend arrow forever. Nothing the player does in the game caused it and nothing can undo it.

**Why it matters.** Because `perCap` is frozen, demand_i = DEMAND_SHARE[i] x perCap x popTotal is exactly proportional to live population, while supply_i is exactly proportional to live GDP (market.js:24-27, k = live/baked). The two growth paths are asymmetric: `Game.growAll(0.05)` (app.js:512, once per full round) multiplies pop AND gdp by 1.05, so demand/supply is unchanged and prices do not move at all on rounds. `World.advanceTurn` grows population 1% and leaves GDP untouched, so every world turn multiplies demand/supply by 1.01 and every price by 1.01^1.3 = 1.013019. This is monotonic and unbounded. Measured from data/economy.json + game-data.json the opening prices are Ag 80.95, Ex 124.11, Mfg 126.31, Trade 60.40, Fin 61.04, IT 41.42; they reach MAX_P=400 at world turns 123.5, 90.5, 89.1, 146.1, 145.3 and 175.3 respectively and stay there permanently. At world turn 50 every price is up 90.9%; at 175 all six are clamped at 400 and the market is a flat line for the rest of the game. There is no mechanism anywhere that reduces demand or raises supply per world turn, so the ratchet is one-way. Worse, the exponent means the drift rate is a UI decision: the market only reprices when the player clicks 'Advance world' (app.js:503), so a player who never clicks it freezes prices and a player who spams it inflates them.

**Fix.** Recalibrate demand against the live economy instead of freezing per-capita spend: either recompute `perCap = gdpTotal / popTotal` every call (which makes demand track GDP and turns the model into a pure composition-vs-consumption comparison, price stable when the mix is stable), or grow GDP alongside population in `World.advanceTurn` (add a `phaseEconomicGrowth` writing `nxt[f].gdp`) so supply and demand move together and only *relative* sector shifts move prices. Also normalize the price to the current index, e.g. `price_i = BASE * ((demand_i/supply_i) / (sum(demand)/sum(supply)))^ELASTICITY`, so the six prices are relative to each other and the aggregate index cannot drift.

> **Verifier note.** The headline is directionally wrong. Game.boostGdp DOES raise supply and push prices DOWN, and every trade action calls Market.update() immediately (actions.js:360, 412, 451), so 'nothing can ever push it back down' is false. I simulated the real data: with the 41 export-capable nations each signing one world-market deal per round, prices FALL every round and hit the MIN_P=20 floor within ~20 rounds even with a world turn interleaved (round 1: 74/114/117/56.5/57.2/38.9; round 10: 38.8/61.2/66.2/32.9/33.8/23.0; round 20: four sectors already at 20). Trade-only, no world turns: all six at or near 20 by round 20. So the practical degenerate outcome is a market pinned at the 20 FLOOR, not the 400 ceiling; the 400 ratchet only occurs if the player advances world turns and never trades. The real defect is that the price index is unanchored (perCap frozen against a live economy with two unmatched growth paths), not a one-way upward ratchet.


### 86. `trade-free-gdp` — Trade actions mint GDP out of nothing every turn: no cost, no cooldown, no capacity, no depletion, no counterparty

- **Severity:** high  ·  **Category:** balance
- **Where:** `js/actions.js, js/game.js` — lines actions.js:184,380-416,444-454; game.js:328-334

**Evidence**

```
actions.js:184 `const TRADE_GAIN = 0.10;`
actions.js:389 `const gain = total * TRADE_GAIN;` then actions.js:411 `Game.boostGdp(S, gain * 1e6);`
actions.js:449-450 `Game.boostGdp(S, gain * 1e6); Game.boostGdp(tid, gain * 1e6);` — both sides get the full gain.
actions.js:385-387 `.map((s, i) => ({ i, s, vol: Math.max(0, ms.surplus[i]) })).filter((f) => f.vol > 1).map((f) => ({ ...f, value: f.vol * (prices[f.i] / 100) }))` — sells every positive surplus, at full price, with no cap.
```

**Failure scenario.** Ohio's turn: Trade -> World market -> Sign. +$21.4B GDP, no cost. Next round, identical click, +$21.4B again (more once prices inflate). Repeat 50 times: Ohio is 55% richer than an identical nation that passed every turn, having paid nothing and risked nothing.

**Why it matters.** 'World market' has no counterparty at all: it converts the nation's entire positive surplus into a permanent GDP addition with no treasury cost, no relationship cost, no route capacity, no stock depletion, and no cooldown beyond 'it uses your one action this turn'. Computed from the real data at opening prices, one click is worth: Ohio +$21,387M (2.32% of GDP), California +$66,101M (1.63%), Texas +$47,455M (1.71%), Wyoming +$1,949M (3.78%), Vermont +$1,569M (3.39%). 41 of the 51 nations have export access; if each one clicks it once per round that creates $462,353M per round = 1.587% of world GDP conjured from nothing, and after 50 rounds world GDP is 30.4% above the pure-growth baseline. Per nation the effect is larger because the money compounds through `growAll`: Ohio ends 50 rounds at $16.47T vs a $10.59T no-trade baseline (+55.5%), Montana +59.7%, California +39.1%. The bilateral variant is worse in kind — `confirmTrade` pays the full gain to BOTH sides, so two neighbouring seats can alternate trade deals and each collect 2x gain per round. Since there are no AI opponents, the 'opponent' never declines.

**Fix.** Make trade a flow, not a grant. (a) Charge the buyer: route external sales through a treasury credit rather than a GDP addition, and make bilateral deals transfer value (`boostGdp(S, +v); boostGdp(T, -v)` plus a small joint efficiency term) instead of paying both sides. (b) Deplete the traded surplus for N turns so the same goods cannot be sold every turn. (c) Gate volume on capacity: cap exported value by the number of ports/gateways and rail/highway links already baked in county_trade.json and transport.json. (d) Add a cooldown or a standing-agreement model (sign once, income each turn, cancellable) so 'trade' is a state, not a repeatable button.

> **Verifier note.** Two overstatements. (1) The 50-round compounding figures assume static prices. With the live repricing the code actually performs, the gain self-damps hard: prices collapse toward MIN_P=20 (see price-monotonic-ratchet), and my simulation with live repricing gives Ohio +21.3% over a no-trade baseline at 50 rounds, not +55.5%; world GDP +15.9%, not +30.4%. The $16.47T figure is also inconsistent with the same reviewer's $15.29T for Ohio at round 50 in baked-vs-live-two-economies; my fixed-price run reproduces $15.29T (+44.4%). (2) Wyoming is cited as a world-market click worth +$1,949M/3.78% but Wyoming is one of the 10 landlocked nations with no export access — it can only reach the market through a tolled transit deal. The exploit is real and uncosted, but it is self-limiting rather than unbounded.


### 87. `baked-vs-live-two-economies` — nationSurplus and the nation panel read frozen baked values while Market.update scales by live GDP — two economies that diverge without limit

- **Severity:** high  ·  **Category:** data-integrity
- **Where:** `js/market.js, js/app.js` — lines market.js:24-27,58-69; app.js:632-653

**Evidence**

```
market.js:24-27 (supply, LIVE): `const live = Game.countyGdp(aid) / 1e6; const baked = a.v.reduce(...); const k = live / baked; a.v.forEach((v, i) => { supply[i] += v * k; });`
market.js:63-68 (surplus, BAKED): `for (const aid of n.counties) { const a = e.areas[aid]; if (a) a.v.forEach((v, i) => { prod[i] += v; }); } ... surplus: prod.map((p, i) => p - DEMAND_SHARE[i] * gross)` — no `k`, no `Game.countyGdp`.
app.js:636-643 is a byte-for-byte duplicate of the same baked computation.
```

**Failure scenario.** Play 25 rounds. Open any nation panel. The 'GDP' stat and the 'GDP after internal consumption' stat differ by 20x and the second one has literally not changed since turn 0. Open a county panel: the six sector values still sum to the 2024 BEA figure while the county's GDP stat is 5x that.

**Why it matters.** The global price model and the per-nation trade/panel model are computed from different numbers and only agree on turn 0. `prod` (and therefore `gross`, `surplus`, and every traded volume) is fixed at the offline bake forever; it changes only when counties change owner. So a nation's export VOLUME never responds to growth, war, or trade. For Ohio: baked gross stays $923,142M and positive surplus stays $227,233M for the whole game, which is 24.6% of GDP at round 0, 12.7% at round 10, 5.4% at round 25 and 1.5% at round 50 — the economy silently shrinks to a rounding error. In the opposite direction, `applyCivilWarCost` can strip 20% of an Area's live GDP (game.js:284) and its export production is completely unaffected. Meanwhile the nation panel prints the frozen `net = 0.2 x baked gross` directly under the live GDP stat: at round 50 Ohio's panel reads 'GDP $15.29 trillion' and immediately below it 'Economy · GDP after internal consumption: $184.6 billion'. The same divergence hits every county panel: Sierra County CA (data/economy.json `06091: {v:[48,13,18,20,15,13]}`) shows sector rows summing to $127M while the GDP stat two rows above shows $314.8 billion after 50 rounds of California trading.

**Fix.** Give `nationSurplus` the same live scaling `Market.update` uses — factor the per-Area live production into one shared helper (`Market.areaProduction(aid)` returning `a.v.map(v => v * Game.countyGdp(aid)/1e6 / bakedSum)`) and have `update()`, `nationSurplus()` and `renderEconomy()`/`renderNationEconomy()` all call it. Delete the duplicated block at app.js:636-643 and make `renderNationEconomy` call `Market.nationSurplus(nid)`.

> **Verifier note.** Sierra County's live GDP at round 50 is ~$252B in my simulation, not $314.8B (the reviewer's compounding assumes static prices). The order of magnitude and the 20x panel divergence hold.


### 88. `boostgdp-flattens-geography` — boostGdp spreads trade gains evenly per Area, so 50 rounds of trading erases the GDP map

- **Severity:** high  ·  **Category:** simulation-integrity
- **Where:** `js/game.js, js/actions.js` — lines game.js:328-334; actions.js:358-359,411,449-450

**Evidence**

```
game.js:331-332 `const per = amount / n.counties.size; for (const f of n.counties) county[f].gdp += per;` — a flat dollar amount per Area, ignoring the Area's size entirely.
Same flat-spread bug in game.js:286-287 `const perW = moved / winner.counties.size; for (const f of winner.counties) county[f].gdp += perW;`.
```

**Failure scenario.** Play California for 50 rounds clicking World market each turn. Switch to the GDP map: the whole state is one flat colour, and the county panel for Sierra County (pop 3,113) reports a GDP of $314 billion — larger than Ohio's starting GDP.

**Why it matters.** An Area that produces $127M of GDP receives exactly the same dollars as one that produces $1,003,000M. Simulated on the real data (external trade once per round for 50 rounds, then 5% growAll): California's Area GDP spread collapses from 7,888:1 to 37:1 — Sierra County goes $127M -> $314,776M (x2,476) while Los Angeles goes $1,002,965M -> $11,814,719M (x11.8, i.e. barely more than the x11.47 it would get from growth alone). Montana: Petroleum County $23M -> $9,846M (x433), max/min 616:1 -> 17:1. Ohio: Hocking County x61.6 vs Franklin County x12.1, 76:1 -> 15:1. The entire economic geography that build_economy.py, build_trade.py and the GDP map mode exist to express is destroyed within a normal-length game, and it is destroyed FASTEST for the sparse rural nations the design cares most about (secession sentiment, county defection, Quality of Life are all meant to key off local economics). It also breaks the GDP map mode outright: `MapModes.init` (mapmodes.js:87) builds `gdpScale` once from the STATIC `data.counties` gdp with `.clamp(true)`, while `gdp(fips)` (mapmodes.js:98-102) reads `Game.countyGdp` live — so after a few rounds every county saturates at the top of the scale and the map is uniformly dark green.

**Fix.** Distribute proportionally to existing output, not evenly: `const total = [...n.counties].reduce((s,f)=>s+county[f].gdp,0) || 1; for (const f of n.counties) county[f].gdp += amount * county[f].gdp / total;`. Better still, distribute by each Area's share of the *traded sectors* (weight by `e.areas[aid].v[i]` for the sectors actually exported) so a port county gains from a shipping deal and an inland farm county does not. Apply the same fix to `applyCivilWarCost`'s winner payout. Separately, rebuild `gdpScale`/`popScale` from live values on `onGameChange` instead of once at init.

> **Verifier note.** The GDP-map-mode sub-claim is wrong. mapmodes.js:87 builds a LOG scale over the static county GDP domain, which spans 158,819:1 ($6.34M to $1.007T). After 50 rounds of pure growth (x11.47) only 3.6% of Areas clamp at the top and the median scale position moves 0.56 -> 0.76 — not 'every county saturates after a few rounds' and not a uniformly dark-green map. Trade flattening does compress the color range, but the stated failure mode is not what the log scale produces. The exact multipliers quoted (Sierra x2,476, ratio 37:1, Montana x433/17:1, Ohio x61.6/15:1) are ~20-25% high.


### 89. `world-market-dominates-bilateral` — 'World market' strictly dominates the bilateral trade action by 1.7x-50x, making the headline trade feature dead content

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/actions.js` — lines actions.js:222-234,380-416,418-442

**Evidence**

```
actions.js:229-231 (bilateral, capped by the partner's deficit) `const sell = Math.min(Math.max(0, ms.surplus[i]), Math.max(0, -ts.surplus[i]));` ... `value: (sell + buy) * (prices[i] / 100)`
actions.js:385-387 (external, uncapped) `vol: Math.max(0, ms.surplus[i])` ... `value: f.vol * (prices[f.i] / 100)`
```

**Failure scenario.** A player learns after two turns that the neighbour-trade screen is always the worse button and never opens it again. The transit negotiation — the most interesting mechanic in the file — is only ever seen by 10 of 51 seats, and only as a tax.

**Why it matters.** The external deal sells the whole positive surplus; the bilateral deal is clipped by whatever deficit the neighbour happens to have, and DEMAND_SHARE guarantees deficits are small (a nation's surplus vector is just its template mix minus a constant, so the deficits are only a few points). Measured at opening prices against the best available neighbour: Ohio external $21,387M vs best bilateral (West Virginia) $3,734M = 5.7x; Texas 6.4x; California 50.2x; Montana 25.0x; even the closest case, Iowa/Wisconsin, is 1.7x. Since 41 of the 51 nations have export access, the 'Trade with nation' flow — which has the most UI investment (partner highlighting, flow preview, direction arrows) — is never the right click for 80% of the map. The 10 landlocked nations (Colorado, DC, Iowa, Kansas, Nebraska, Nevada, South Dakota, Utah, West Virginia, Wyoming) are pushed into the transit flow, which pays them the same benefit minus a 5-60% toll, i.e. strictly worse than what everyone else gets for free.

**Fix.** Cap external sales hard (by port/gateway count and by a per-turn export quota), and price them below bilateral: the world market should be the low-margin fallback, neighbour deals the high-margin option, exactly inverted from today. Give bilateral deals a bonus the world market cannot match — a persistent agreement, a relations improvement, a shared corridor — so the choice is about more than this turn's dollars.

> **Verifier note.** 'Strictly dominates' and 'even the closest case, Iowa/Wisconsin, is 1.7x' are both false. Three nations' best bilateral deal beats their external deal at opening prices: West Virginia 0.95x (landlocked, so external is not available anyway), Vermont 0.95x vs Massachusetts, Alaska 0.99x vs Michigan; Louisiana is near-parity at 1.07x. So the world market is the better click for most nations but not all, and 1.7x is not the floor.


### 90. `state-level-adjacency-gates-trade` — Trade and transit partners come from state-level adjacency, so mid-game you can trade with and route through nations you do not border

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/game.js, js/actions.js, js/app.js` — lines game.js:127-142; actions.js:198,248-250,302-306; app.js:739-753

**Evidence**

```
game.js:128-130 `function statesOf(nid) { const s = new Set(); for (const f of nations.get(nid).counties) s.add(f.slice(0, 2)); return s; }`
game.js:133-141 `const mine = statesOf(nid); const reach = new Set(); for (const s of mine) for (const n of adjacency.state[s] || []) reach.add(n); ... for (const f of n.counties) if (reach.has(f.slice(0, 2))) { out.add(oid); break; }`
actions.js:248-250 `Game.adjacentNations(A.nid).filter((t) => nationExportAccess(t).any).map((t) => ({ t, link: transitLink(A.nid, t) }))`
app.js:752 `return highway ? 'highway' : null;` and actions.js:192 `linkLabel = (link) => (... : '\u{1F69A} overland')`.
```

**Failure scenario.** Turn 1: California annexes Esmeralda County, NV. Turn 2: open Trade. Utah appears in the transit route list with '\u{1F69A} overland · toll 35%', despite California and Utah sharing no border. Sign it and Utah collects a toll on Californian exports it never touches.

**Why it matters.** `adjacentNations` is only correct while nations equal states. The moment a county changes hands — which is the entire game — it degrades into 'any nation that owns a county in a state adjacent to a state I own a county in'. If California annexes one county in Nevada, California becomes a trade and transit partner of Idaho, Utah, Oregon and Arizona regardless of whether it touches any of them. `transitLink` (app.js:739-753) does use real county adjacency, so it correctly returns `null` for a non-neighbour — but the caller does not treat `null` as 'no route', it renders it as `'\u{1F69A} overland'` at the full 35% toll. So the UI offers a plausible-looking overland transit route through a nation on the other side of the continent.

**Fix.** Replace `adjacentNations` with a real county-adjacency scan (`new Set([...n.counties].flatMap(countyNeighbors).map(getOwner))` minus self) and cache it per `emit()`. Then treat `transitLink(...) === null` as ineligible rather than 'overland', so a route requires an actual shared border.

> **Verifier note.** Two corrections to the framing and the example. (1) This is not only a mid-game degradation — build_adjacency.py deliberately adds maritime state links (Alaska borders every Pacific and Canada-border state; Hawaii borders every Pacific state), so adjacency.state['06'] = ['02','04','15','32','41']. California is therefore offered Alaska and Hawaii as '🚚 overland · toll 35%' transit routes on turn 1, before any county changes hands. (2) The specific scenario is wrong: Utah is one of the 10 nations with NO export access, and the transit list is filtered by nationExportAccess(t).any, so Utah can never appear there (it would appear as a bilateral trade partner instead). Nevada's state neighbours are AZ, CA, ID, OR, UT — Oregon and Arizona are already California's neighbours at turn 0, so annexing an NV county adds only Idaho and Utah.


### 91. `save-load-loses-market-state` — Save/load discards world turn, market prices and perCap, and never reprices the loaded world

- **Severity:** medium  ·  **Category:** save-load
- **Where:** `js/saves.js, js/world.js, js/market.js` — lines saves.js:9,16-26; world.js:15,163-164; market.js:16,31

**Evidence**

```
saves.js:9 `const snapshot = () => ({ v: 1, ts: Date.now(), game: Game.serialize(), turns: TurnSystem.serialize(), colorMode: store.colorMode });` — no World state, no Market state.
world.js:15 `let turn = 0;` is module-local with no serialize/loadState pair.
market.js:16 `let prices = null, prev = null, perCap = null;` — same.
saves.js:20-24 `TurnSystem.loadState(...); Game.loadState(...); setColorMode(...)` — never calls `Market.update()`.
```

**Failure scenario.** Save at world turn 60 (Manufacturing at 271). Reload the page, load the save. The banner reads 'World turn 0' and the market panel reads Manufacturing 126 — the fresh-boot price. Sign an export deal and it pays out at less than half the value it should.

**Why it matters.** After a load the world-turn counter in the banner resets to 0 while the nations, populations and GDPs are from turn 40. More importantly, `prices` still holds whatever the pre-load session computed — in a fresh page that is the turn-0 opening prices computed by app.js:68 against the *unloaded* start state. The player then opens Trade and every export value, every transit toll and every 'Traded value' figure is priced off a market that does not correspond to the world they just loaded. Given the price ratchet above, the error can be a factor of 2-4x. It also means saves are not reproducible: reload the same save after clicking 'Advance world' a few times first and the trade values differ.

**Fix.** Add `serialize`/`loadState` to both modules (`World`: `{turn}`; `Market`: `{prices, prev, perCap}`), include them in `saves.js:9`'s snapshot, restore them in `apply()`, and call `Market.update()` after `Game.loadState` as a belt-and-braces reprice. Bump the save `v` and default missing fields to a recalibration.


### 92. `external-transit-crash-no-economy` — External and transit trade screens dereference the economy unguarded, so they throw if economy.json fails to load

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/actions.js, js/app.js` — lines actions.js:307-315,381-387; app.js:50

**Evidence**

```
app.js:50 `fetch('data/economy.json').then((r) => r.json()).catch(() => null),` — the loader explicitly tolerates a missing economy.
actions.js:307-311 `const ms = Market.nationSurplus(S); const prices = Market.getPrices(); const e = MapModes.getEconomy(); const flows = e.sectors.map((s, i) => ({ i, s, vol: Math.max(0, ms.surplus[i]) }))` — `e` may be null, `ms` may be null (market.js:61 `if (!e || !n) return null;`), `prices` may be null (market.js:16).
actions.js:381-385 has the identical unguarded sequence.
By contrast the bilateral path is guarded: `tradeFlows` returns `[]` (market.js/actions.js:226) and the Sign button is disabled.
```

**Failure scenario.** Serve the game with data/economy.json returning 404 (or a JSON syntax error from a half-finished `build_economy.py` run). Map loads fine. Click Trade -> World market -> uncaught TypeError, action mode stuck, board unusable until reload.

**Why it matters.** The Trade prompt's external buttons are enabled purely from `nationExportAccess` (actions.js:242-244), which reads county_trade.json and transport.json — neither of which involves economy.json. So with economy.json missing or malformed the buttons render enabled and clicking one throws `TypeError: Cannot read properties of null (reading 'sectors')`, leaving `A` non-null so the action mode is stuck: the map stays dimmed, clicks are intercepted, and the only escape is a page reload. The transit route buttons have the same problem. The author clearly anticipated a missing economy (the `.catch`, the `if (economy)` guards at app.js:67-68, the `if (!e) return ''` in the renderers) but the two highest-value action paths were missed.

**Fix.** Guard the entry points, not just the renderers: in `startTrade`, if `!MapModes.getEconomy() || !Market.getPrices()`, disable the Canada/Mexico/World and transit buttons with a title explaining why, and early-return from `renderExternalPreview`/`renderTransitPreview` with a warn box. Also wrap the action-mode click handlers so an exception calls `cancel()` rather than stranding `A`.

> **Verifier note.** Confirmed by reading the paths. app.js:50 tolerates a missing economy.json with .catch(() => null) and app.js:67-68 guards Market.update() behind `if (economy)`, so prices stays null and MapModes.getEconomy() returns null. But nationExportAccess reads only county_trade.json/transport.json, so the Canada/Mexico/World buttons render enabled; renderExternalPreview (actions.js:381-387) and renderTransitPreview (actions.js:307-315) both then evaluate `e.sectors.map(...)` on a null `e` and throw TypeError. A is still non-null at that point and nothing resets it, so the action mode is stranded with the map dimmed and clicks intercepted. The bilateral path really is guarded by contrast — tradeFlows returns [] on !ms/!ts/!prices and the Sign button is disabled.


### 93. `template-swamps-dominant-sector` — The six GDP-split templates all carry large off-diagonal shares, so the 'dominant sector' barely affects supply and 4 of 6 prices open below 100

- **Severity:** medium  ·  **Category:** balance
- **Where:** `build/build_economy.py, data/economy.json` — lines build_economy.py:29-36,135

**Evidence**

```
build_economy.py:29-36, e.g. `AG: [38, 10, 14, 16, 12, 10]` and `EX: [8, 40, 16, 16, 12, 8]` — every template gives Trade & Transportation 16-20 and Finance 12-22 regardless of the dominant sector.
Computed over all 1,676 areas in data/economy.json: Agriculture is dominant in 838 areas (50.0% of the map) but supplies only 9.41% of output; Finance is dominant in 25 areas (1.5%) but supplies 21.93%; Trade & Transportation is dominant in 58 areas (3.5%) but supplies 22.13%.
```

**Failure scenario.** A player looks at the Economy map, sees half the country coloured Agriculture, and reasonably concludes agriculture is the biggest sector. It is the smallest, at 9.4%.

**Why it matters.** Because the off-diagonal shares are so large and so uniform, the national sector totals are essentially the population-weighted template average, not the assignment. The Economy map mode and the county panel's 'dominant: X' label therefore describe something that has almost no bearing on what the nation actually supplies or trades. It is also the direct cause of the skewed opening prices: supply shares come out at Ag 0.094, Ex 0.085, Mfg 0.184, Trade 0.221, Fin 0.219, IT 0.197 against DEMAND_SHARE of 0.08/0.10/0.22/0.15/0.15/0.10, so Trade, Finance, IT and Agriculture all open 'oversupplied' (60, 61, 41, 81) purely as an artifact of the template shape, and the supply-weighted index opens at 76.25 rather than the advertised 100. Every trade decision in the game inherits that skew: IT is permanently the cheapest thing to sell and Manufacturing permanently the most valuable, for reasons no player can discover or influence.

**Fix.** Sharpen the templates (dominant 55-70, others 5-12) so the assignment actually drives the totals, and then tune DEMAND_SHARE against the resulting supply shares so the opening index is genuinely near 100 with a couple of deliberate scarcities. Print the realized supply share per sector at the end of build_economy.py so the calibration is visible at bake time.

> **Verifier note.** Trivial: Trade & Transportation is dominant in 57 Areas (3.4%) supplying 22.11%, not 58 / 22.13%. Everything else reproduces exactly.


### 94. `economy-ladder-misclassification` — build_economy.py's ladder assigns Resource Extraction to 130 suburban and non-extractive Areas, and its state-tilt gate uses a different population than the ladder

- **Severity:** medium  ·  **Category:** data-integrity
- **Where:** `build/build_economy.py` — lines build_economy.py:98-99,113-133

**Evidence**

```
build_economy.py:98-99 `pop = sum(gd[m]["pop"] or 0 for m in members)` and `anchor = max((gd[m]["pop"] or 0) for m in members)`.
build_economy.py:117 gates state tilt on the SUM: `elif pop < 200_000 and st in STATE_TILT:`
build_economy.py:126-127 gates the ladder on the ANCHOR: `if anchor < 50_000: dom = AG` / `elif anchor < 200_000: dom = EX`.
```

**Failure scenario.** Open Napa County in the county panel. Dominant sector: Resource Extraction, $2.0B, ahead of Agriculture. The Economy map paints California's wine country the same brown as the Permian Basin.

**Why it matters.** The 50k-200k rung unconditionally means 'Resource Extraction' — 40% of GDP from mining and drilling — for any Area not caught by an earlier rule. Re-running the classifier over the real inputs, 130 Areas land there on the ladder alone, and the list is dominated by places with no extractive economy: New York 27 Areas, California 13, Oregon 11, Maryland 10, New Hampshire 6, New Jersey 6, Rhode Island 4. Concrete cases: Napa County CA, Broomfield County CO (a Denver tech suburb), Queen Anne's County MD, Carroll County NH, Columbia County NY, and the Lower Connecticut River Valley Planning Region are all baked as 40% Resource Extraction. The two-population inconsistency compounds it: three merged Virginia Areas (Newport News 51700, Roanoke 51770, Hampton 51650) fall past their STATE_TILT because their SUMMED pop exceeds 200k, then get classified by their ANCHOR which is under 200k, landing them on the extraction rung too. Because these values are the permanent basis for every trade volume in the game (see the baked-vs-live finding), the misclassification is not cosmetic — it decides what each nation exports for the whole game.

**Fix.** Use one population definition throughout (the summed Area population, with `anchor` only as a tiebreaker for merged rural clusters), and make the extraction rung conditional rather than default: require a signal — STATE_TILT in an energy state, or a mining/energy flag — before assigning EX, and fall back to Manufacturing or a mixed 'General' template otherwise. The 130 affected Areas are small enough to spot-check by hand once the rule is tightened.

> **Verifier note.** I re-ran the classifier from build/build_economy.py against the current inputs. Exactly 130 Areas land on the 50k-200k anchor rung and are assigned Resource Extraction with no extractive signal, distributed NY 27, CA 13, OR 11, MD 10, WA 9, ME 7, CO 7, NH 6, AZ 6, NJ 6, VT 5, RI 4 — matching the finding's list. Every named case checks out: Napa 06055 (pop 132,727), Broomfield 08014 (78,323), Queen Anne's 24035 (73,245), Carroll NH 33003 (83,674), Columbia NY 36021 (107,202), and Lower Connecticut River Valley 09130 (177,540) are all baked as 40% Resource Extraction. The two-population inconsistency is real and I confirmed all three Virginia cases: Newport News 51700 (summed 281,883 / anchor 183,056), Roanoke 51770 (221,154 / 97,912) and Hampton 51650 (221,860 / 137,596) fall past the pop<200,000 STATE_TILT gate at line 117 and are then classified by the anchor at lines 126-127 onto the extraction rung.


### 95. `structural-treasury-deficit` — Flat per-Area upkeep makes 11 of 51 nations permanently insolvent from turn 1, and trade income never reaches the treasury

- **Severity:** medium  ·  **Category:** balance
- **Where:** `js/game.js, js/actions.js` — lines game.js:26-28,316-326; actions.js:411,449-450

**Evidence**

```
game.js:26-28 `const TAX_RATE = 0.02;` / `const GOV_TYPES = { Republic: 0.015 };` / `const AREA_UPKEEP = 40e6;`
game.js:321 `const maintenance = gdp * (GOV_TYPES[n.gov] ?? GOV_TYPES.Republic) + n.counties.size * AREA_UPKEEP;`
actions.js:411 and 449-450 pay trade proceeds with `Game.boostGdp(...)`, never `n.treasury +=`.
```

**Failure scenario.** Play Montana. Click 'Advance world' ten times without doing anything wrong. Treasury: -$18.5B, and every treasury-gated action is greyed out for the rest of the game.

**Why it matters.** Net flow per world turn is `0.005 * gdp - 40e6 * areas`, so solvency depends entirely on GDP-per-Area, and areas.json merges on population, not output. Computed on the real data, 11 nations start with a permanent per-turn deficit: Montana -$1.848B (56 Areas, $78B GDP), Idaho -$1.115B, Wyoming -$0.663B, New Mexico -$0.585B, Alaska -$0.562B, Mississippi -$0.409B, West Virginia -$0.348B, Kentucky -$0.243B, Arkansas -$0.138B, Vermont -$0.089B, South Dakota -$0.016B. Montana needs to grow GDP to $448B — about 36 rounds of 5% growth — before it breaks even, and it cannot trade its way out because trade pays in GDP, not treasury: at the 0.5% net rate, Montana's $1,952M world-market gain is worth $9.8M/turn to its treasury against a $1,848M/turn hole. Meanwhile California nets +$17.9B/turn. Treasuries are allowed to go arbitrarily negative (game.js:325 `n.treasury += treasuryFlow(nid).delta;` with no floor) and `spend` (game.js:336-342) already refuses negative balances, so these 11 nations are locked out of any future treasury-gated action from turn 1 — exactly the sparse western states the target design wants as secessionist homelands.

**Fix.** Make upkeep scale with what an Area actually is rather than a flat count — e.g. `upkeep = AREA_UPKEEP_BASE + areaGdp * UPKEEP_RATE` — or set AREA_UPKEEP from a percentile of GDP-per-Area so the median nation breaks even by construction. Route trade proceeds to the treasury as well as (or instead of) GDP so the trade action is a real fiscal lever. Add a debt mechanic (interest, or an insolvency event) so a negative treasury means something instead of silently disabling the nation.

> **Verifier note.** Minor: 'locked out of any future treasury-gated action from turn 1' is forward-looking rather than an observed effect — Game.spend is currently dead code (no caller anywhere in js/), and every nation starts at treasury 0, so nothing is gated on the treasury today. The structural insolvency is real; its consequence is latent.


### 96. `demand-share-sums-to-080` — DEMAND_SHARE sums to 0.80, so 'GDP after internal consumption' is just 0.2 x gross for every nation and '100 = balanced' is false

- **Severity:** low  ·  **Category:** correctness
- **Where:** `js/app.js, js/market.js` — lines app.js:630,642-643,650-651; market.js:53,68

**Evidence**

```
app.js:630 `const DEMAND_SHARE = [0.08, 0.10, 0.22, 0.15, 0.15, 0.10];` — sums to 0.80.
app.js:643 `const net = gross - DEMAND_SHARE.reduce((s, d) => s + d, 0) * gross;` which is algebraically `0.2 * gross`.
app.js:650 `<div class="label">Economy &middot; GDP after internal consumption</div>` with app.js:651 `${fmtGdp(net * 1e6)}`.
market.js:53 `<div class="mkt-head">Market prices <span>index &middot; 100 = balanced</span></div>`.
```

**Failure scenario.** Open the panel for any nation on turn 1. 'GDP after internal consumption' = exactly 20% of its six sector values, every time. Open the market: Ag 81, Trade 60, Fin 61, IT 41 — four sectors 'oversupplied' on turn 0 of a world that has not done anything yet.

**Why it matters.** Three separate problems fall out of the 0.80. (1) The panel's headline number is a constant multiple of gross for all 51 nations, so it ranks nations identically to GDP and carries exactly zero information; it is presented as a derived economic quantity but it is `gross * 0.2`. It is also not what 'GDP after consumption' means — consumption is a *use* of GDP, not a deduction from it. (2) Because sum(surplus_i) = gross - 0.8*gross = +0.2*gross by construction, EVERY nation is structurally a net exporter in every game state. No nation can ever be a net importer, no nation can ever face a shortage, and the 'Resource surplus / deficit' readout can never show an economy in trouble. This is also what makes the free-trade exploit unbounded: there is always something to sell. (3) In the market, total demand is 0.8 x total supply by construction, so the supply-weighted price index at turn 0 is 76.25, not 100 — four of the six sectors open below the 'balanced' line purely because of the missing 20%, and the legend tells the player 100 is balanced when the model can never average 100.

**Fix.** Decide what the missing 20% is and name it. If it is savings/investment/export share, make it explicit (`const EXPORT_SHARE = 0.20;`) and label the panel stat 'Exportable output' rather than 'GDP after internal consumption'. If demand is meant to be full consumption, make DEMAND_SHARE sum to 1.0 and let surplus be zero-sum across sectors so a nation can genuinely run a deficit. Then rescale the price index so 100 is the actual aggregate equilibrium (divide by the supply-weighted mean) and the legend becomes true.

> **Verifier note.** Two of the three sub-claims are weak. (1) The 0.80 reads as a deliberate '80% consumed internally, 20% exportable' assumption, not an arithmetic slip — and given that model, 'GDP after internal consumption' = gross - 0.8*gross is a literally accurate label, not a misnomer. (2) 'No nation can ever face a shortage / the readout can never show an economy in trouble' is false at the level the readout actually operates: per-SECTOR deficits are common (any nation without manufacturing shows Mfg = 0 - 0.22*gross), they render as red deficit rows, and they are exactly what the bilateral trade mechanic matches against. Only the aggregate is structurally positive. The substantive residue is the third point: the 'index · 100 = balanced' legend in market.js:53 is unreachable because the index opens at 76.25 — a labeling/calibration issue, not a high-severity correctness bug.


### 97. `demand-share-two-denominators` — DEMAND_SHARE is applied against per-capita spend globally but against gross output nationally; the two demand models diverge by 64% in 50 world turns

- **Severity:** low  ·  **Category:** simulation-integrity
- **Where:** `js/market.js, js/app.js` — lines market.js:34,68; app.js:642

**Evidence**

```
market.js:34 (global) `const demand = DEMAND_SHARE[i] * perCap * popTotal;`
market.js:68 (national) `surplus: prod.map((p, i) => p - DEMAND_SHARE[i] * gross)`
app.js:642 (national, duplicated) `const surplus = prod.map((p, i) => p - DEMAND_SHARE[i] * gross);`
```

**Failure scenario.** Advance the world 50 turns. Aggregate market demand is now $38.4T-equivalent while the 51 nations' own demand figures still sum to $23.3T. The prices shown in the leaderboard are consistent with neither the panel's surplus figures nor the volumes the trade screen offers.

**Why it matters.** The same constant is used with two incompatible denominators. Globally, demand is proportional to POPULATION (`perCap * popTotal`). Nationally, demand is proportional to that nation's baked OUTPUT (`gross`). These coincide exactly on turn 0 only because `perCap * popTotal == gdpTotal == sum of all baked gross`. From turn 1 they separate: global demand grows with population (x1.6446 by world turn 50) while the sum of all national demands is pinned to the frozen baked gross forever, a 64.5% mismatch by turn 50. So the prices the player trades at are set by one demand curve while the volumes they trade are set by a different one. It also encodes a hidden and probably unintended assumption: nationally, a rich nation consumes proportionally more per person than a poor one (demand tracks its GDP, not its people), which is the opposite of the global model. The duplicated formula in two files across a rendering module and a simulation module means any fix to one silently desynchronizes the other.

**Fix.** Pick one demand law and use it everywhere. The population-based one is the more defensible: `demand_i(nation) = DEMAND_SHARE[i] * perCap * Game.nationDemographics(nid).pop`, and global demand is then literally the sum of national demands, which restores the invariant by construction. Export a single `Market.demandFor(countyIds)` and have `update()`, `nationSurplus()` and the panel all call it.

> **Verifier note.** The causal attribution misreads the model. The 64.5% divergence at world turn 50 is 1.01^50 - 1: it is entirely produced by world turns growing population while no phase grows GDP (the price-monotonic-ratchet defect) plus the frozen baked gross (the baked-vs-live defect). Making nationSurplus use LIVE gross would not fix it — global demand would still be perCap0 x live pop while national demand tracked a GDP that world turns never move, giving the identical 64.5% gap. So this is a re-derivation of two already-filed findings rather than a third independent defect. Also, 'a rich nation consumes proportionally more per person' is not obviously an unintended assumption — consumption proportional to income is the more standard modeling choice, and the finding's proposed population-based fix is arguably the weaker economics. The genuine residue is the duplicated formula across market.js and app.js.


### 98. `market-no-feedback` — Prices have no consumers and supply cannot respond: the market is a decorative index with one exploitable output

- **Severity:** low  ·  **Category:** architecture
- **Where:** `js/market.js, js/game.js, js/actions.js` — lines market.js:33-36,71; game.js:316-323; actions.js:231,313,387

**Evidence**

```
game.js:320-321 `const income = gdp * TAX_RATE; const maintenance = gdp * (GOV_TYPES[n.gov] ?? GOV_TYPES.Republic) + n.counties.size * AREA_UPKEEP;` — no price term anywhere.
The only readers of `Market.getPrices()` are actions.js:224, 308 and 382, all of which use it as `value = volume * (prices[i] / 100)` feeding `TRADE_GAIN`.
Supply is `a.v[i] * k` (market.js:27) where `a.v` is the immutable baked profile — nothing in the codebase ever writes `economy.areas[*].v`.
```

**Failure scenario.** Manufacturing hits 400 at world turn 89. No nation can build a factory, no nation pays more for manufactured goods, no treasury changes. The only consequence is that everyone's export cheque got bigger.

**Why it matters.** There is no production response and no consumption cost, so the market has no negative feedback loop and can never clear. A nation whose dominant sector is at price 400 cannot shift into it; a nation whose sector is at 20 cannot shift out. Treasury income and maintenance are pure functions of GDP, so a shortage or a price spike costs nobody anything. The only channel from price to game state is trade gain — which means the price index is not a market, it is a multiplier on the free-GDP exploit that inflates 1.3% per world turn. And that channel is one-directional: a single completed trade moves prices by only 0.06%-0.20% (measured: Ohio's full world-market sale moves Manufacturing -0.20%, Agriculture -0.06%), so the comment at actions.js:451 'traded supply moves the prices' is not true at any observable scale, and most sectors will render the flat '·' arrow (`Math.abs(trend) < 0.05`, market.js:47) after a trade. DESIGN.md:216 already admits 'nothing yet spends against them', but the trade action now does spend against them, so the doc and the code disagree in the direction that matters.

**Fix.** Give prices at least one cost-side consumer before adding more supply-side content: charge nations for their *deficit* sectors out of treasury each world turn (`deficit_i * price_i/100 * TAX_RATE`) so a shortage hurts, and let a nation's sector mix drift toward high-priced sectors over several turns (mutate a live copy of `a.v` toward the price gradient, capped per turn) so supply can respond. That single change turns the ratchet into a loop.

> **Verifier note.** Two issues. (1) 'a multiplier on the free-GDP exploit that inflates 1.3% per world turn' has the sign backwards: with trade in play the index deflates to the MIN_P=20 floor within ~20 rounds, so a manufacturing price pinned at 400 is not the scenario the code produces. (2) DESIGN.md:211-217 explicitly files the resource market under 'Systems baked but not yet mechanical — prices move each turn but nothing yet spends against them', so this is a documented, deliberate roadmap gap rather than an undiscovered architectural defect. The finding's own catch — that the trade action now does spend against prices, making the doc stale — is correct and is the useful part.


### 99. `demand-share-cross-file` — DEMAND_SHARE is a script-scope const in a rendering file, read by market.js which loads first

- **Severity:** low  ·  **Category:** architecture
- **Where:** `js/app.js, js/market.js, js/leaderboard.js, index.html` — lines app.js:630; market.js:34,68; leaderboard.js:53; index.html:79-82

**Evidence**

```
index.html:79-82 load order: `leaderboard.js` -> `world.js` -> `market.js` -> `app.js`.
app.js:630 `const DEMAND_SHARE = ...` — a top-level `const`, so it is NOT a property of `window`; it lives in the global declarative record and is in TDZ until app.js finishes evaluating.
market.js:34 and :68 reference `DEMAND_SHARE` as a free identifier.
leaderboard.js:53 `${typeof Market !== 'undefined' ? Market.html() : ''}`.
```

**Failure scenario.** Add `defer` to the script tags in index.html (a natural performance change). Scripts still execute in order, but if anyone later reorders `market.js` after `app.js` or introduces a module boundary, `Market.update()` throws `ReferenceError: Cannot access 'DEMAND_SHARE' before initialization` from inside a try/catch in init() and the whole map silently fails to load with the generic 'Could not load map data' message.

**Why it matters.** This works today only by accident of timing: `init()` is registered on `DOMContentLoaded` at the end of app.js, so app.js is fully evaluated before anything calls `Market.update()`. Any of these changes silently breaks it with a runtime ReferenceError rather than a load error: adding `defer`/`async` or `type="module"` to the script tags, moving `Market.update()` earlier, calling Market from the editor, or (the likely near-term one) splitting the growing app.js. A simulation tunable also does not belong in the file that draws HTML — the target design's developer dashboard with 'live sliders per variable' needs every tunable reachable from one place. The defensive `typeof Market !== 'undefined'` in leaderboard.js cannot do what it is written to do: `Market` is also a top-level `const`, and `typeof` on a TDZ binding throws ReferenceError rather than returning 'undefined', so the guard only protects against market.js failing to load at all, not against ordering.

**Fix.** Move `DEMAND_SHARE` (and `TRADE_GAIN`, `TRANSIT_TOLL`, `TAX_RATE`, `AREA_UPKEEP`, `PARTY_STEP`, growth rates) into a single `js/tunables.js` loaded first, exposed as one `const Tunables = {...}` object. That is also the object the planned developer dashboard binds its sliders to.

> **Verifier note.** There is no bug today and no realistic near-term trigger: the project's stated architecture is deliberately no-modules, no-defer, ordered classic scripts (DESIGN.md and the ?v= cache-busted tags), under which the ordering is deterministic rather than accidental. This is a code-organization improvement (a simulation tunable living in the rendering file, and a tunables module the planned dev dashboard would want) rather than a medium-severity latent failure.


### 100. `war-moves-prices-backwards` — Civil war lowers prices instead of raising them: GDP is transferred not destroyed, while population is destroyed

- **Severity:** low  ·  **Category:** simulation-integrity
- **Where:** `js/game.js, js/market.js` — lines game.js:265-290; market.js:6-9

**Evidence**

```
game.js:284-287 `for (const f of loser.counties) { const take = county[f].gdp * gPct; county[f].gdp -= take; moved += take; } const winner = nations.get(winnerId); const perW = moved / winner.counties.size; for (const f of winner.counties) county[f].gdp += perW;` — global GDP is exactly conserved.
game.js:271-277 destroys population outright (`c.demPop = Math.max(0, c.demPop - per)`), never returning it.
market.js:8-9 documents the opposite: `population growth pushes demand up each turn while wars and GDP transfers shift supply`; DESIGN.md:176 repeats it: `So war losses cut supply and push prices up`.
```

**Failure scenario.** Trigger a civil war that kills 30% of a large nation's ruling party. Advance the world. Every market price ticks DOWN, and the leaderboard's trend arrows show green triangles for a catastrophe.

**Why it matters.** In the market model supply tracks GDP and demand tracks population. A civil war leaves total GDP unchanged (it moves it) and permanently deletes 2-40% of the loser's ruling-party population. So the net market effect of a war is demand down, supply flat, i.e. prices FALL — the exact opposite of what both the module header and the design doc promise. There is also a silent branch where nothing happens at all: game.js:279 `if (winnerId && nations.has(winnerId) && loser && loser.counties.size)` — a war resolved with no surviving winner nation applies zero GDP cost. So the mechanic intended as the game's main economic shock either does nothing or pushes the index the wrong way. It matters more as the target design lands, because secession sentiment is meant to key off nation power and Quality of Life; a war that makes goods *cheaper* nationwide is a perverse incentive.

**Fix.** Actually destroy value: scale down `county[f].gdp` in the war zone by a destruction factor before computing the winner's transfer (`const destroyed = take * WAR_DESTRUCTION; moved += take - destroyed;`), and move the winner's share proportionally (see the boostGdp fix) rather than flat. Then correct the comments in market.js:6-9 and DESIGN.md:176 to describe what the code does.

> **Verifier note.** The 'silent branch where nothing happens at all' is a misread. The population-loss block (game.js:267-278) is gated only on `loser && loser.counties.size` and runs regardless of winnerId; only the GDP transfer is skipped when there is no winner, and that is deliberate — actions.js:583 calls applyCivilWarCost(nid, null, res.score) with the comment 'the failed aggressor bleeds population'. So both branches do something, and both push the index the same (downward) way. Magnitude is also small: killing 30% of California's ruling party removes ~1.7% of national population, i.e. roughly a 2% price move, so the practical content of this finding is the comment/doc contradiction rather than a significant simulation distortion.


### 101. `economy-json-no-provenance` — economy.json carries no provenance stamp, is already one Area stale, and missing Areas fail silently as zero production

- **Severity:** low  ·  **Category:** data-integrity
- **Where:** `build/build_economy.py, data/economy.json, js/market.js, js/app.js` — lines build_economy.py:138-140; market.js:64-65; app.js:637-638

**Evidence**

```
build_economy.py:140 `json.dump({"sectors": SECTORS, "areas": out}, f, ...)` — no threshold, no source hash, no timestamp, while data/areas.json does record `"threshold": 50000`.
market.js:64-65 `const a = e.areas[aid]; if (a) a.v.forEach(...)` and app.js:637-638 `const a = e.areas[aid]; if (a) a.v.forEach(...)` — an unknown Area contributes 0 and is never reported.
Re-running the current build_economy.py against the current inputs today produces a different result for one Area: `48355 Nueces County` is baked as Manufacturing but would now classify as Trade & Transportation.
```

**Failure scenario.** Change areas.json's threshold from 50000 to 75000 and re-run build_areas.py. New merge parents appear. The game loads without error; Texas's economy panel now shows a gross that is $80B short and its export deals pay proportionally less, with no console output and no visual cue.

**Why it matters.** The three id-spaces currently reconcile perfectly — all 1,676 runtime Area ids (2,660 unmerged counties collapsed by the 483 merge groups in areas.json, plus the merge parents) appear in economy.json and vice versa, with total baked GDP $29,137,863M against live $29,137,791M, a 0.00025% match. That is good, and it is fragile. `areas.json` is generated with a population threshold; change it and re-run build_areas.py without re-running build_economy.py and the runtime will look up Area ids that economy.json has never heard of. Because both consumers guard with a bare `if (a)`, those Areas contribute zero production, zero surplus and zero supply — the nation's economy panel silently under-reports, its trade volume silently shrinks, and no error appears anywhere. The single stale Nueces entry proves the pipeline already drifts. This directly contradicts the target design's 'single source of truth: one persistent JSON that editor + game + tooling read and WRITE IN PLACE'.

**Fix.** Write a provenance block into economy.json (`{"built": iso8601, "areas_threshold": <from areas.json>, "source_counties": len(gd), "n_areas": len(out)}`), assert at load time in app.js that `economy.areas` covers every id in `Game.nations`' county sets, and `console.warn` (or flash) the count of misses. Add a `--check` mode to build_economy.py that diffs against the existing file and exits non-zero on drift so it can run in a pre-commit hook. Re-run the bake to pick up Nueces.

> **Verifier note.** Severity is overstated for a data-integrity label. There is zero current impact: the reconciliation is exact, the single drift is one Area's dominant-sector label out of 1,676, and the failure mode described requires a developer to re-run build_areas.py with a changed threshold and not re-run build_economy.py. This is pipeline hygiene / a nice pre-commit guard, not a live integrity problem.



## Offline data pipeline & data integrity (20 findings)

### 102. `build-areas-nondeterministic` — build_areas.py is not reproducible: set-iteration tie-break changes Area IDs across runs on identical inputs

- **Severity:** high  ·  **Category:** data-integrity
- **Where:** `build/build_areas.py` — lines 92-104 (esp. 101)

**Evidence**

```
92:            neigh_roots = set()
...
101:            target = min(neigh_roots, key=lambda x: gpop[x])
102:            union(r, target)

`neigh_roots` is a set of FIPS strings. `min()` returns the first minimum in ITERATION order, and CPython randomizes str hashing per process (PYTHONHASHSEED). I copied the script, redirected its output, and ran it 5 times with PYTHONHASHSEED=1..5 against the unmodified data/:
  seed1 sha=fdadc5c5..  seed2/3/4 sha=0f1e13e4..  seed5 sha=fdadc5c5..
  6 Areas differ between the two outcomes: 46093, 46013, 46081, 46065, 46102, 46029
seeds 2/3/4 reproduce the shipped data/areas.json; seeds 1/5 do not. Under seed 1, Meade Area (46093) is a 16-county eastern-SD blob and Lawrence (46081) / Hughes (46065) exist as Area IDs; under the shipped partition Meade is a 10-county western blob and 46029 / 46102 are the Area IDs instead. Instrumenting the loop shows exactly one merge step where `min(neigh_roots,...)` has a tie — one coin flip cascades into 6 different Areas.
```

**Why it matters.** areas.json is the join key for three other data files. Re-running the build to change THRESHOLD or add an AUTHORED_MERGE silently reshuffles unrelated Area IDs, so the build is not a function of its inputs and cannot be checked into version control with confidence. The owner's stated goal of "one persistent JSON that editor + game + tooling read and WRITE IN PLACE" is impossible while the primary key is hash-seed dependent.

**Fix.** Make every choice total-ordered on FIPS: `target = min(sorted(neigh_roots), key=lambda x: gpop[x])` (line 101) and `for r in sorted(roots, key=lambda r: (gpop[r], r))` (line 89). Then add a regression check that re-running the script byte-for-byte reproduces data/areas.json.

> **Verifier note.** None on the facts. The one thing worth noting is that `sorted(roots, key=lambda r: gpop[r])` at :89 is already deterministic (roots is a dict built by iterating the JSON-ordered `counties`), so only :101 actually needs the sort — the suggested :89 change is harmless but not load-bearing.


### 103. `js-deletes-member-counties` — Game.init deletes the merged member-county records, so 1467 of 3143 counties have no runtime state at all

- **Severity:** high  ·  **Category:** architecture
- **Where:** `js/game.js` — lines 51-64 (esp. 61)

**Evidence**

```
js/game.js:57-62
        for (const m of members) {
          if (m === aid || !county[m]) continue;
          const c = county[m];
          rec.demPop += c.demPop; rec.gopPop += c.gopPop; rec.othPop += c.othPop; rec.gdp += c.gdp;
          delete county[m];
          alias[m] = aid;

Measured: game-data has 3143 counties, areas.json merges 1467 of them away, leaving 1676 live records. Only `rec.counties` (a list of FIPS strings) survives; the per-member demPop/gopPop/othPop/gdp are summed in and the records are destroyed. `serialize()` (game.js:345-351) walks `Object.entries(county)`, so saves contain only the 1676 Areas.
```

**Why it matters.** The target design's core loop is county-level secessionist sentiment recomputed each turn from "county party majority" plus 5 other factors. For 46.7% of US counties there is no county party majority in the runtime model to read — the data was folded into a 22-county blob and thrown away. This is the single biggest architectural blocker between the current code and the stated roadmap, and it is invisible because everything reads through `cid()`.

**Fix.** Keep the member county records live (do not `delete`), and make the Area a lightweight index over them: `rec.members = members.map(m => county[m])`, with Area-level pop/gdp computed as a sum on read rather than baked at init. Then sentiment can live on the county and roll up to the Area for display.

> **Verifier note.** 'the data was folded into a 22-county blob and thrown away' overstates it. The static per-county pop/gdp/dem/gop/other records are still in memory — app.js:44 fetches data/game-data.json and app.js:64 hands the full 3143-county object to MapModes.init, and app.js keeps it as store.data (used at app.js:802). What is destroyed is the *mutable runtime* per-county state and everything in saves. That makes the fix cheaper than the finding implies (the source rows are already loaded), so this is an architecture-shaped blocker for the roadmap rather than irrecoverable data loss.


### 104. `hawaii-no-county-adjacency` — Hawaii's three main islands have no entry at all in adjacency.json, making Hawaii mechanically inert

- **Severity:** high  ·  **Category:** simulation-integrity
- **Where:** `build/build_adjacency.py, data/adjacency.json` — lines build_adjacency.py:58-72, 89-93

**Evidence**

```
Adjacency is derived purely from shared TopoJSON arcs:
66:     adj = defaultdict(set)
67:     for fips_list in arc_to_fips.values():
Islands share no arcs, so they never enter `adj` and never reach `county_adj` at line 89-93. Measured:
  game-data counties missing from adjacency.county: ['02016','15001','15003','15007','25019','53055']
  live Areas with NO adjacency key: ['15001','15007','15003'] (Hawaii, Kauai, Honolulu)
  15009 adjacency: ['15005']   15005: ['15009']   (Maui<->Kalawao only)
02016, 25019 and 53055 are rescued by AUTHORED_MERGES (build_areas.py:28-33); the three Hawaiian islands are not.
```

**Why it matters.** Game.countyNeighbors returns [] for them, so annexTargets (game.js:143-148) never yields a Hawaiian Area, nearestNation (game.js:172-180) returns null, and components() (game.js:149-165) splits Hawaii into 4 pieces. Hawaii can neither annex nor be annexed county-by-county, and any breakApart involving it produces isolated one-Area nations. The state-level PACIFIC_STATES patch (build_adjacency.py:108-111) fixes the Unite action but not a single county-level mechanic.

**Fix.** Add an authored inter-island adjacency table to build_adjacency.py the same way CT and the AK/HI state links are handled: 15001<->15009, 15009<->15003, 15003<->15007, and 02016 <-> the Aleutian chain, so island Areas are on the graph. Assert at the end of build_adjacency.py that every game-data county has a non-empty neighbor list.

> **Verifier note.** Minor scoping note: 02016 is listed as a missing county but is not actually a defect in the shipped data — it sits inside the authored Aleutians Area whose other members carry adjacency, so the only live orphans are the three Hawaiian islands.


### 105. `area-id-join-key-orphans` — economy.json, cultural.mapmode.json and geographical.mapmode.json are keyed by Area ID with no validator and no regeneration path

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `data/economy.json, data/cultural.mapmode.json, data/geographical.mapmode.json, js/mapmodes.js` — lines mapmodes.js:26-27, 36-37, 72-74

**Evidence**

```
All three files key exactly the 1676 post-merge Area IDs (measured: `not-a-live-Area=0, live-Areas-missing=0` for each). Only economy.json has a build script; the two mapmode files are hand-published out of js/editor.js as a browser download.

Using the PYTHONHASHSEED=1 partition from the previous finding:
  economy.json               keys not in area-set: 2 ['46029','46102'] | missing: 2 ['46065','46081']
  cultural.mapmode.json      keys not in area-set: 2 ['46029','46102'] | missing: 2 ['46065','46081']
  geographical.mapmode.json  keys not in area-set: 2 ['46029','46102'] | missing: 2 ['46065','46081']

The failure is silent by design:
mapmodes.js:26-27  const a = economy && economy.areas[Game.areaIdOf(fips)];
                   return a ? ECON_COLORS[a.d] : '#3a4149';
mapmodes.js:73-74  if (!p || !p.length) return '#3a4149';
```

**Why it matters.** A single re-run of build_areas.py (or any THRESHOLD change) leaves Areas rendering as anonymous dark grey in Geographic/Cultural/Economy modes, drops them out of Market supply (market.js:23 iterates economy.areas, so an orphaned Area contributes nothing), and there is no build step, assertion, or console warning anywhere that would tell you. DESIGN.md line 55 even advertises THRESHOLD as a tunable.

**Fix.** Add a `build/validate_data.py` that asserts key-set equality between areas-derived IDs and economy.areas / *.mapmode.json assign, run at the end of every build. Better: stop using "most populous member" as the Area ID (build_areas.py:114 `primary = max(members, key=lambda f: pop[f])`) and mint a stable synthetic ID, or key on the lexicographically smallest member FIPS, which cannot move when the merge changes.

> **Verifier note.** Two overstatements. (1) DESIGN.md:55 does not 'advertise THRESHOLD as a tunable' — it just states the 50k threshold as fact; the 'tune me' invitation is in build_areas.py:23. (2) The market claim is only half right: an orphaned *live* Area (missing key) does contribute nothing, but a *stale* key that happens to be a merged-away member still resolves through Game.areaIdOf in market.js:23-24, so it double-counts the absorbing Area's live GDP rather than contributing nothing. Severity: today all three key sets are exactly equal, so this is a latent coupling hazard downstream of the previous finding, not a present defect.


### 106. `python-model-different-atomic-unit` — game_state.py load_state never applies areas.json, so the Python mirror models 3143 units against the JS model's 1676

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `game_state.py` — lines 28-56, 118-129

**Evidence**

```
load_state reads only data/game-data.json and data/county_neighbors.json — there is no reference to areas.json anywhere in the file. Verified by running it:
  Python model units: 3143
  merged-away counties still present as separate Python units: 1467
The Area abstraction is a stub that lies about itself:
122: def area(state, area_id):
124:     return state["counties"][area_id]
119-121 comment: "Today an area maps 1:1 to a county (it IS the county record)"
That comment was true before build_areas.py existed; it is now false in the JS model.
```

**Why it matters.** The two models cannot be cross-checked, which is exactly what a mirror is for. `nation_population(s,'46')` returns 924,669 over 66 South Dakota counties while the JS nation is built from 10 Areas; any per-unit tunable (upkeep is $40M per Area in game.js:28, party ceilings are per-county in game_state.py:23) means something different in each. Worse, the Python model is the one that still has county granularity, so it looks like the right base for the sentiment work while actually being the un-mirrored one.

**Fix.** Either load areas.json in load_state and collapse identically to game.js:51-64, or (preferred, and consistent with the fix above) make BOTH models county-atomic with Areas as a derived display grouping, and add a test that asserts nation_population/nation_lean agree between the two for all 51 nations.

> **Verifier note.** Severity is inflated. `grep -rn game_state` across the repo finds only two DESIGN.md prose mentions — nothing imports it, there are no tests, and the browser game never touches it. The divergence blocks future cross-checking but affects zero running behaviour today.


### 107. `stale-census-adjacency-file` — county_neighbors.json is built from a pre-2015 Census adjacency file: obsolete CT counties, no planning regions, 11 phantom FIPS

- **Severity:** medium  ·  **Category:** data-integrity
- **Where:** `build/build_neighbors.py, build/raw/county_adjacency.txt, data/county_neighbors.json` — lines build_neighbors.py:18-31

**Evidence**

```
Measured against data/game-data.json:
  county_neighbors keys: 3233 | old CT counties present: 8 (09001,09003,09005,09007,09009,09011,09013,09015) | CT planning regions present: 0 | territory FIPS present: 91 | keys not in game-data: 102
  Phantom FIPS referenced as neighbors: 02270 (Wade Hampton, renamed 02158 in 2015), 46113 (Shannon, renamed 46102 in 2015), 51515 (Bedford city, dissolved 2013), plus the 8 old CT counties. `grep -c "46113\|02270\|51515" build/raw/county_adjacency.txt` = 18.
Running game_state.load_state():
  counties with NO neighbors in Python model: 15 -> all 9 CT planning regions, 15001/15003/15007 (HI), 02158, 27165, 46102.
game_state.py:47 feeds this straight into the model: "neighbors": neighbors.get(fips, []).
build_trade.py:200-210 also reads it to generate bank_pairs.
```

**Why it matters.** Every Connecticut planning region is an adjacency island in the Python model and in the app's "Neighbors - Census adjacency" panel (app.js:795-800). build_data.py and build_adjacency.py both went to the trouble of swapping CT's 8 obsolete counties for the 9 planning regions; build_neighbors.py did not, so one layer of the pipeline still speaks 2010 geography. DESIGN.md line 34 compounds this by claiming adjacency.json also comes from this file, which it does not (build_adjacency.py derives it from shared TopoJSON arcs).

**Fix.** Download the current (2023) Census County Adjacency File, then apply the same OLD_CT -> CT_REGIONS substitution build_adjacency.py:73-84 already implements, and drop territory FIPS the same way build_adjacency.py:86-93 does. Add an assertion that `set(county_neighbors) == set(game-data.counties)` at the end of the script. Fix DESIGN.md:34 to say adjacency.json is arc-derived.

> **Verifier note.** The blast radius is narrower than 'one layer of the pipeline still speaks 2010 geography' suggests. data/adjacency.json — the file every gameplay mechanic uses — is correct for all of these: 27165 -> 5 neighbours, 09110 -> 17, 46102 -> 7, 02158 -> 3. county_neighbors.json feeds only (a) the informational 'Neighbors · Census adjacency' panel at app.js:795-803, (b) bank_pairs in build_trade.py, and (c) the unreferenced Python mirror. Nothing in annexation, secession or contiguity reads it.


### 108. `build-neighbors-cannot-rebuild` — build_neighbors.py is a no-op once its output exists — updating the raw file cannot regenerate it

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `build/build_neighbors.py` — lines 34-49

**Evidence**

```
34: def load_neighbors():
35:     """Return the cached county->neighbors dict, building it once if needed."""
36:     if os.path.exists(OUT):
37:         with open(OUT, encoding="utf-8") as f:
38:             return json.load(f)
...
47:     data = load_neighbors()

Proof: I copied build/ to a scratch dir, DELETED build/raw entirely, kept data/county_neighbors.json, and ran `python build/build_neighbors.py`. It printed "counties: 3233 | total adjacency links: 18967 / output: ..\\data\\county_neighbors.json (179 KB)" and exited 0 — a successful-looking run with no raw input in existence.
```

**Why it matters.** This is precisely how the stale-adjacency bug above survives. DESIGN.md:99-102 tells you to "rebuild any baked data ... by re-running it", and for this one script that instruction silently does nothing. Every other build_*.py has `if __name__ == "__main__": main()` semantics that actually rebuild; this one has cache-read semantics dressed as a build.

**Fix.** Split them: keep `load_neighbors()` cache-first for library use, but make the `__main__` block call `_parse(RAW)` unconditionally and write the output. Also raise a clear error if RAW is missing rather than falling through to a stale cache.

> **Verifier note.** Two things. (1) This is documented intent, not a silent bug: the module docstring says outright 'Parses it once and caches the result to data/county_neighbors.json so the raw file is never parsed again.' The defect is the contradiction between that contract and DESIGN.md's blanket rebuild instruction, which makes it doc/design drift rather than a correctness failure. (2) The DESIGN.md citation is wrong — the rebuild sentence is at DESIGN.md:238-241, not 99-102 (the file is 267 lines).


### 109. `watonwan-missing-block` — Watonwan County MN (27165) has zero neighbors because its block is missing from the raw adjacency file, and nothing checks

- **Severity:** medium  ·  **Category:** data-integrity
- **Where:** `build/raw/county_adjacency.txt, data/county_neighbors.json` — lines build_neighbors.py:18-31

**Evidence**

```
grep -n "Watonwan" build/raw/county_adjacency.txt returns 6 hits, all at lines 9116/9123/9183/9287/9373/9634 and all beginning with two literal tabs (\t\t"Watonwan County, MN"\t27165) — i.e. it only ever appears as somebody else's neighbor, never as a block header. build_neighbors.py:25-27 only creates a key when row[0] is non-empty:
25:             if row[0].strip():          # a 4-field line starts a new county block
26:                 current = row[1].strip()
27:                 neighbors[current] = []
Result: 27165 is absent from county_neighbors.json, and game_state.load_state() gives it "neighbors": [].
```

**Why it matters.** A landlocked Minnesota county is unreachable in the Python adjacency graph — it can never be annexed, can never be part of a contiguous breakaway, and would be its own connected component in any flood fill. The parser has no post-condition check, so a truncated or malformed raw file degrades into silently wrong geography rather than an error.

**Fix.** After parsing, assert that every FIPS appearing as a neighbor also has its own key, and that the key set matches game-data. Reciprocate any one-way links (`for a,nbs in n.items(): for b in nbs: n.setdefault(b,[]).append(a)`) and re-download the raw file.

> **Verifier note.** The consequence is scoped to the Python mirror and the info panel, not the game. data/adjacency.json (arc-derived, what annexation/contiguity actually read) gives 27165 five neighbours: 27013, 27015, 27033, 27063, 27091. So 'can never be annexed, can never be part of a contiguous breakaway' is true of game_state.py — which drives nothing — and false of the running game. The parser's missing post-condition check is the real defect and stands.


### 110. `valdez-cordova-fips-mismatch` — Valdez-Cordova AK: game-data keys the obsolete 02261 while county_trade keys successors 02063/02066, so its port is invisible

- **Severity:** medium  ·  **Category:** data-integrity
- **Where:** `build/build_data.py, data/county_trade.json, data/economy.json` — lines build_data.py:70-71, 200-205, 208-221

**Evidence**

```
build_data.py:71  VALDEZ_CORDOVA = ("02261", ["02063", "02066"])
It keeps 02261 as the unit (because that is what counties-10m.json renders) and back-fills pop/gdp from the successors. But build_trade.py runs against the current TIGER county layer, so:
  county_trade keys not in game-data: ['02063','02066']   <-- the ONLY two
  02063: {'has_port': True, 'coastal': True, 'rivers': ['Cordova Harbor','Prince William Sound','Valdez Harbor'], ...}
  trade rec for 02261: None
  county_trade port counties absent from game-data: ['02063']
All consumers key by Area member FIPS — app.js:721 `members.some((m) => t.counties[m]?.has_port)`, app.js:774 `allMembers.filter((m) => t.counties[m])`, build_economy.py:103 `any(trade.get(m, {}).get("has_port") for m in members)` — and 02261's member list is just ['02261'].
```

**Why it matters.** Valdez is one of the largest-throughput ports in the US (the TAPS terminal). In game it shows no Port chip, no Coastal chip, no waterways, contributes nothing to nationExportAccess, and build_economy's structural port rule never fires — it fell through to the ladder and got dominant sector = Resource Extraction. It is also a live worked example that the pipeline has no FIPS-vintage reconciliation between the 2010-era geometry and the current TIGER/BEA/Census sources.

**Fix.** Build an explicit FIPS alias table in one place (`{'02261': ['02063','02066'], '46113':'46102', '02270':'02158', ...}`) and apply it in build_trade.py / build_transport.py output and in build_neighbors.py, so every layer speaks the geometry's FIPS. Add a build assertion that `set(county_trade.counties) <= set(game-data.counties)`.

> **Verifier note.** The build_economy half is wrong on two counts. 02261 (pop 9,235) gets its Resource Extraction profile from rule 3, STATE_TILT['02'] = EX at build_economy.py:117-118 — not from the fallback ladder. And the structural port rule at :113 requires `has_port and pop >= 250_000`, so it could never have fired for a 9,235-person Area even with correct trade data: fixing the FIPS alias would leave economy.json byte-identical. The real impact is confined to the app's trade chips and export-access readout, which is why this is medium rather than high.


### 111. `parties-lookup-bypasses-area` — Parties.setup looks up Game.county[f] instead of the Area, silently dropping 48% of party-county entries

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/parties.js` — lines 63-78 (esp. 65-66)

**Evidence**

```
63:      for (const f of def.counties) {
64:        const c = Game.county[f];
65:        if (!c) continue;
Game.county has had merged members deleted (game.js:61), so any merged-away FIPS is a silent no-op. Measured over data/parties.json vs data/areas.json:
  total party-county entries: 4198 | entries whose FIPS is no longer an Area: 2025 (48.2%) | unknown FIPS: 0
  worst: The Farmers Union 696/983, New Confederacy 606/1142, Libertarians 310/394, Blue-Collar Populist 207/504, A Free Texas 150/254
Population impact is mostly masked because whole-state rules also list the Area primary, but three hand-authored parties lose real ground:
  Great Lakes Free Trade: 15 counties / 308,341 people never spawned (1.5%)
  New Absaroka:            2 counties /  16,689 (2.9%)
  El Paso United:          2 counties /  10,226 (1.1%)
And the merge over-reaches the other way, because a hit Area drags in members that failed the rule: Christian Nationalism +626,040, Eastern Progressives +200,476, Great Lakes +35,502.
```

**Why it matters.** A hand-authored region list is the designer's direct expression of intent, and half of it is being discarded with no warning at load time. It also means build_parties.py's `min_pop` / `max_pop` filters (build_parties.py:95-98) are evaluated on county population but applied to Area population — "The Farmers Union: counties under 100k" lands on Areas of 85k-140k. As more hand-curated county lists arrive for the ~22 planned factions (Deseret, Cascadia, Jefferson, Franklin, Acadiana...), this failure mode scales with them.

**Fix.** In parties.js use the Area: `const aid = Game.areaIdOf(f); if (seen.has(aid)) continue; seen.add(aid); const c = Game.county[aid];` — de-duplicating so one Area gets one roll. Then in build_parties.py, resolve rules against Areas (load areas.json, evaluate min_pop/max_pop/lean on Area aggregates) so the authored intent and the runtime unit agree, and print a warning for any authored FIPS that is not an Area primary.

> **Verifier note.** The 48% headline is an entry count, not an impact figure, and the finding's own numbers show why: 13 of 16 parties lose exactly zero population, and the worst case is 2.9%. (The finding also misses a fourth, tiny loser: The Farmers Union, 2 counties / 16,269.) Real bug, real fix, but the present-day gameplay effect is small — the weight of the case is the forward-looking one about hand-curated faction lists.


### 112. `gdp-year-implicit` — build_data.py picks the GDP year by last-column position, so a new BEA release silently changes the data while meta still says 2024

- **Severity:** medium  ·  **Category:** data-integrity
- **Where:** `build/build_data.py` — lines 108-117, 271

**Evidence**

```
108:     header = next(reader)
109:     last = len(header) - 1
...
117:             val = int(float(row[last].strip().strip('"').strip())) * 1000
The actual header today is ['GeoFIPS','GeoName','Region','TableName','LineCode','IndustryClassification','Description','Unit','2001',...,'2024'] — 32 columns, last = '2024', which happens to match the hard-coded provenance string at line 271 ("CAGDP2 2024"). Nothing verifies that.
```

**Why it matters.** CAGDP2 gains a column every year. The next time someone drops in a fresh CAGDP2.zip, GDP silently becomes 2025 while game-data.json's meta, DESIGN.md's table, and the UI all still say 2024 — and the population source stays pinned at co-est2024. Mixed-vintage GDP and population quietly breaks the per-capita GDP estimator at build_data.py:177-181, which is what fills in every Virginia city and combined area.

**Fix.** Add `YEAR = "2024"` as a module constant, resolve the column with `col = header.index(YEAR)` (raising a clear error if absent), and interpolate YEAR into the meta strings at lines 270-271 so provenance cannot drift from the column actually read.

> **Verifier note.** Verified directly against build/raw/CAGDP2.zip. The archive member is CAGDP2__ALL_AREAS_2001_2024.csv and its header is exactly 32 columns ending ['...','2022','2023','2024'], so `last = len(header) - 1` at build_data.py:109 resolves to the 2024 column by position only. build_data.py:271 hard-codes 'CAGDP2 2024' in meta with nothing tying the two together, and the population source string at :270 is separately pinned to the 2024 estimates. The mixed-vintage concern is legitimate because the per-capita estimator at :177-181 multiplies state GDP by county population — it fills 51 Virginia records plus 2 Hawaii ones today.


### 113. `no-dependency-or-build-order-docs` — No requirements.txt, no documented geopandas dependency, and no build order for a pipeline with a real DAG

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `build/build_trade.py, build/build_transport.py, DESIGN.md, README.md` — lines build_trade.py:145; build_transport.py:80, 111; DESIGN.md:99-102

**Evidence**

```
The heavy dependency is imported inside functions, so it is invisible at the top of the file:
  build_trade.py:145      import geopandas as gpd
  build_transport.py:80   import geopandas as gpd
  build_transport.py:111  import geopandas as gpd
No requirements.txt, pyproject.toml, Makefile, or .sh/.bat exists anywhere in the repo (verified by find). DESIGN.md:99-102 lists all eight scripts in one comma-separated sentence as if order-independent. The real DAG, from the actual file reads:
  build_data.py       -> game-data.json      (needs raw/co-est2024, raw/CAGDP2.zip, raw/election2024, data/counties-10m.json)
  build_adjacency.py  -> adjacency.json      (needs counties-10m.json)
  build_neighbors.py  -> county_neighbors    (needs raw/county_adjacency.txt)
  build_trade.py      -> county_trade.json   (needs county_neighbors.json + network)
  build_areas.py      -> areas.json          (needs game-data.json + adjacency.json)
  build_economy.py    -> economy.json        (needs game-data + areas + county_trade)
  build_transport.py  -> transport.json      (needs game-data + county_trade + raw/trade/counties.zip + network)
With build/raw deleted, failures are raw tracebacks: build_data.py gives a bare FileNotFoundError on co-est2024-alldata.csv; build_transport.py gives `pyogrio.errors.DataSourceError: '/vsizip/...\\raw\\trade\\counties.zip' does not exist in the file system`.
```

**Why it matters.** Nobody can reproduce data/ from a clean checkout. The scripts don't document which raw files they expect (build_data.py's docstring does, the others don't), don't fail with an actionable message, and run in an order you can only discover by reading all eight. `io` and `zipfile` are imported and never used in both build_trade.py and build_transport.py, which is a hint the import block was never audited.

**Fix.** Add build/requirements.txt (geopandas, shapely, pyogrio) and a build/build_all.py that runs the seven scripts in dependency order and stops on the first failure. Give each script a `require(path, hint)` helper that raises `SystemExit(f"missing {path} - {hint}")`, and list the expected raw filenames in every docstring the way build_data.py already does.

> **Verifier note.** The DAG omits build_parties.py, which reads game-data.json and adjacency.json (build_parties.py:83-86) and so must run after both — the pipeline is eight nodes, not seven, and a build_all.py would need to run eight scripts. Also the DESIGN.md citation is 238-241, not 99-102.


### 114. `network-fetch-in-build` — build_trade.py and build_transport.py fetch live endpoints at build time; rail_counties() has no cache at all

- **Severity:** medium  ·  **Category:** data-integrity
- **Where:** `build/build_transport.py, build/build_trade.py` — lines build_transport.py:61-76, 86-95; build_trade.py:112-141

**Evidence**

```
build_transport.py:61-75 queries ArcGIS on every single run with no on-disk cache:
62:     """Distinct county FIPS crossed by Class I rail (attribute-only queries)."""
65:         q = (f"{RAIL_URL}?where=1%3D1&outFields=STCNTYFIPS&returnGeometry=false"
67:         with urllib.request.urlopen(q, timeout=120) as r:
build_trade.py caches but has no pinning or integrity check (112-119, 122-141). Proof of the risk: I deleted build/raw entirely and ran build_trade.py — it silently re-downloaded ~83MB from census.gov and two ArcGIS FeatureServers and rebuilt county_trade.json. I diffed the result against the shipped file: 987 counties both sides, 0 keys added, 0 removed, 0 records changed, corridors and 213 bank_pairs identical. So it happens to be reproducible today, purely because upstream has not changed.
The HTTP paths that ARE versioned (TIGER2023, GENZ2023) are the census ones; the three ArcGIS FeatureServer URLs (build_transport.py:28-29, build_trade.py:106-109) carry no version or date at all.
```

**Why it matters.** "Everything is baked offline" (DESIGN.md:42) is true of the game but not of the build. A rebuild a year from now silently produces different ports, different Class I rail counties, different choke-point coverage — with no diff, no manifest, and no way to tell whether a gameplay change came from your edit or from an upstream layer refresh. rail_counties() additionally makes the build fail outright on a plane or behind a firewall.

**Fix.** Give rail_counties() the same `fetch_arcgis`-style cache build_trade.py already has (write build/raw/transport/rail.json). Then write a build/raw/MANIFEST.json recording each source URL, download date, byte size and sha256, verify it on every run, and add a `--offline` flag that refuses to hit the network.

> **Verifier note.** I did not re-run the 83MB download, so the 'diffed the result, 0 records changed' claim is unverified here — but it is not load-bearing: the code-level facts (unconditional network call, unpinned endpoints, no integrity check) all hold on inspection.


### 115. `sector-mix-vs-demand-mismatch` — The TEMPLATE sector floors make Agriculture 9.4% of national output vs ~0.9% in reality, so no market price starts near the documented 100

- **Severity:** medium  ·  **Category:** balance
- **Where:** `build/build_economy.py, js/app.js, js/market.js` — lines build_economy.py:28-36; app.js:630; market.js:33-36

**Evidence**

```
Every profile floors Agriculture at 4-8% and Extraction at 4-6% of an Area's whole GDP:
build_economy.py:30-35
    AG: [38, 10, 14, 16, 12, 10],
    ...
    FI: [4, 6, 10, 20, 42, 18],
    IT: [4, 4, 10, 16, 22, 44],
Summed over data/economy.json (verified total = $29.138T, matching game-data GDP to 0.0002%):
    Agriculture             $2,743B   9.4%   (BEA real ~0.9%)
    Resource Extraction     $2,468B   8.5%   (~1.5%)
    Manufacturing           $5,356B  18.4%   (~10%)
    Trade & Transportation  $6,441B  22.1%   (~15%)
    Finance                 $6,390B  21.9%   (~21%)
    Information Technology  $5,740B  19.7%   (~6%)
Against app.js:630 `const DEMAND_SHARE = [0.08, 0.10, 0.22, 0.15, 0.15, 0.10]` (sums to 0.80), market.js:33-36 gives opening prices:
    Ag 80.9 | Ex 124.1 | Mfg 126.3 | Trade 60.4 | Fin 61.0 | IT 41.4
```

**Why it matters.** market.js:12 documents "100 = balanced" and the legend renders it that way, but turn 1 opens with IT at 41 and Manufacturing at 126 — a 3x spread that is an artifact of two tables (TEMPLATE and DEMAND_SHARE) never being reconciled, not of anything the player did. Because perCap is calibrated once (market.js:31) the spread is permanent, so every trade deal and surplus/deficit readout is scored against a baseline nobody chose. A $1T Finance Area also "produces" $40B of agriculture, which makes the surplus/deficit panel (market.js:58-69) read as noise.

**Fix.** Pick one source of truth: either set DEMAND_SHARE to the normalized supply mix so prices open at 100 and only diverge through play, or steepen the TEMPLATE rows (drop the AG/EX floors toward 1-2% for FI/IT/TR profiles) so the baked mix approximates the real national accounts. Then assert in build_economy.py that the national mix is within a tolerance of DEMAND_SHARE and print it at the end of the run.

> **Verifier note.** Two small attribution points. The '100 = balanced' string is in market.js's html() (the mkt-head line), not market.js:12, which only says prices move above/below 100. More substantively, DEMAND_SHARE sums to 0.80, not 1.0 — so demand is structurally 20% below supply and the *average* price is pushed under 100 by construction, independently of the TEMPLATE mix. Reconciling the two tables without also fixing that sum will not land prices at 100.


### 116. `merge-blobs-no-size-cap` — Merging into the smallest neighbor chains tiny counties into 22-county blobs; the threshold is population-only with no geographic cap

- **Severity:** medium  ·  **Category:** ux
- **Where:** `build/build_areas.py` — lines 78-104 (esp. 101)

**Evidence**

```
101:            target = min(neigh_roots, key=lambda x: gpop[x])
The deficient group merges into its SMALLEST adjacent group, so two tiny groups combine, are still deficient, and merge again — growing one chain until it crosses 50k. Measured on the shipped areas.json:
  member-count histogram: {2:148, 3:116, 4:82, 5:51, 6:34, 7:17, 8:8, 9:5, 10:6, 11:2, 12:4, 13:1, 14:1, 15:4, 16:1, 18:2, 22:1}
  31157 Scotts Bluff Area  NE  22 counties  pop 85,069
  20009 Barton Area        KS  18 counties  pop 93,128
  48465 Val Verde Area     TX  18 counties  pop 124,008
  38105 Williams Area      ND  15 counties  pop 139,287
Per-state collapse: NE 93->15, SD 66->10, KS 105->22, ND 53->8, TX 254->104, GA 159->68.
Separately, one Area silently never meets the threshold and nothing reports it: 51001 (Accomack + Northampton, the Delmarva peninsula) = 45,415 < 50,000, because build_areas.py:99-100 `if not neigh_roots: continue` gives up quietly when no same-state neighbor exists.
```

**Why it matters.** A single clickable unit covering roughly a third of Nebraska while holding 85k people is a bad map object — you cannot express regional politics inside it, and the target design's county-level sentiment has nowhere to live there. Nebraska with 15 Areas next to Texas with 104 also skews everything that counts Areas: the $40M/Area upkeep (game.js:28), MIN_NATION = 10 for breakaways (game.js:240), and annexation surface area. The under-threshold Delmarva case shows the algorithm has no report-on-failure path at all.

**Fix.** Add a member-count cap (e.g. stop merging a group past ~8 members even if under threshold) and prefer the smallest neighbor that keeps the result under the cap, falling back to the largest. Print every Area that ends under THRESHOLD and every Area over the member cap at the end of main() so these are visible instead of silent.

> **Verifier note.** Every measurement reproduces exactly. The member-count histogram on shipped areas.json is {2:148, 3:116, 4:82, 5:51, 6:34, 7:17, 8:8, 9:5, 10:6, 11:2, 12:4, 13:1, 14:1, 15:4, 16:1, 18:2, 22:1}, and the largest blobs are 31157 Scotts Bluff NE 22 counties / 85,069, 20009 Barton KS 18 / 93,128, 48465 Val Verde TX 18 / 124,008, 38105 Williams ND 15 / 139,287. Per-state collapse verified: NE 93->15, SD 66->10, KS 105->22, ND 53->8, TX 254->104, GA 159->68. The mechanism at build_areas.py:101 is confirmed — merging into the *smallest* adjacent group is what chains tiny groups together. And the silent-failure case checks out: scanning all live non-WEST_EXEMPT Areas, exactly one falls under THRESHOLD — 51001 Accomack at 45,415 with 2 members — because build_areas.py:99-100 `if not neigh_roots: continue` gives up without reporting. Nothing in main()'s report block (:126-133) surfaces either condition.


### 117. `party-coverage-gaps` — 350 Areas including all of Alaska, Colorado, New Mexico, Arizona and Hawaii can never receive an emergent party, while 129 are contested by 3-4

- **Severity:** medium  ·  **Category:** balance
- **Where:** `build/build_parties.py, data/parties.json` — lines 57-75

**Evidence**

```
Measured over the 1676 live Areas against data/parties.json:
  claimed by 1 party: 615 | 2: 582 | 3: 122 | 4: 7 | claimed by ZERO: 350
  states at 0% coverage: 04 (AZ, 0/15), 35 (NM, 0/33), 08 (CO, 0/64), 02 (AK, 0/23), 15 (HI, 0/5)
  near-zero: 32 (NV) 1/17, 54 (WV) 3/22, 21 (KY) 7/43, 24 (MD) 5/20, 36 (NY) 14/50
No entry in REGIONS (build_parties.py:57-75) names state FIPS 08, 04, 35, 02 or 15.
Separately, the absorption rule makes spawn ORDER load-bearing: parties.js:69-70 `newCount = x * pop + c.othPop;` then `c.othPop = 0`. Whoever spawns first in a contested county takes the entire Other bloc; everyone after gets only x*pop. The order is `Object.entries(defs)` = JSON insertion order = the literal order of the REGIONS dict, so Christian Nationalism always gets first claim and Eastern Progressives always gets last.
```

**Why it matters.** Colorado is the 4th-largest zero-coverage bloc on the map and simply has no political story available to it; Alaska and Hawaii likewise. Meanwhile El Paso, Travis and Williamson counties are each claimed by 4 parties (expected ~2 spawning simultaneously at chance 0.5), which is where the order-dependent Other grab actually bites. For a design heading toward ~22 playable ideological factions, coverage and contention need to be a checked property of the table, not an emergent accident of 16 hand-written rules.

**Fix.** Have build_parties.py print a coverage report at the end (Areas with 0 parties by state, Areas with >2 parties) and fail loudly on any state at 0%. Add regions for the Mountain West / Southwest / Alaska / Hawaii. Make the Other-absorption fair: split it proportionally among all parties spawning in a county, or shuffle spawn order with a seeded RNG instead of inheriting dict order.

> **Verifier note.** Reproduced exactly against the 1676 live Areas: claimed by 1 party 615, by 2 582, by 3 122, by 4 seven, by zero 350. Zero-coverage states confirmed at 0/15 for AZ (04), 0/33 NM (35), 0/64 CO (08), 0/23 AK (02), 0/5 HI (15); near-zero NV 1/17 (the single hit is 32007 Elko, pulled in via DESERET_FIPS), WV 3/22, KY 7/43, MD 5/20, NY 14/50. Reading build_parties.py:57-75, no REGIONS entry names 08, 04, 35, 02 or 15 in states, fips_states or any hand list — so the zero-coverage states hold at raw county level too, independently of the Area-lookup bug. The order dependence is real: parties.js:70-76 does `newCount = x * pop + c.othPop` then `c.othPop = 0`, and setup() iterates Object.entries(defs) which is parties.json insertion order, which is literal REGIONS order — Christian Nationalism first, Eastern Progressives last.


### 118. `est-note-false-about-connecticut` — The shipped est_note tells players Connecticut GDP is apportioned, but BEA publishes the planning regions directly and no CT record is flagged

- **Severity:** low  ·  **Category:** data-integrity
- **Where:** `build/build_data.py, DESIGN.md` — lines build_data.py:273-277; DESIGN.md:38-40

**Evidence**

```
build_data.py:273-277 (written into data/game-data.json meta and shown in the UI via app.js:806-820):
            "est_note": "... Virginia independent "
                        "cities and Connecticut regions (GDP apportioned from the real BEA "
                        "combined-area / state total by population)."
Reality, from build/raw/CAGDP2.zip, CAGDP2__ALL_AREAS_2001_2024.csv, LineCode 1:
  09110 'Capitol, CT*'             2024 = 110914256   (real)
  09190 'Western Connecticut, CT*' 2024 =  76343680   (real)
  09001 'Fairfield, CT*'           2024 = (NA)
And measured over data/game-data.json:
  est flag combos: {'v': 29, 'gv': 1, 'g': 52}
  'g' by state: {'51': 51, '15': 2}   -- zero Connecticut records carry any est flag
DESIGN.md:40 repeats the same claim.
```

**Why it matters.** The project's stated principle is "Nothing is invented where real data exists" and the est. badge is the contract with the player. A metadata string that over-claims estimation is the same class of bug as one that under-claims it — it undermines trust in the badge everywhere else, and it will mislead whoever next edits build_data.py into thinking CT needs the apportionment path.

**Fix.** Delete "and Connecticut regions" from build_data.py:276 and from DESIGN.md:40. Optionally have main() derive the est_note from the actual est counts it already computes at lines 289-292, so the note cannot drift from the data again.

> **Verifier note.** The DESIGN.md half is false. `grep -n Connecticut DESIGN.md` returns exactly one hit, line 30, in the geometry table ('Current 9 planning regions from Census TIGERweb'), which is accurate. The 'Known estimates' paragraph at DESIGN.md:38-40 names Alaska boroughs, Virginia independent cities + their counties, and Hawaii's Maui/Kalawao — it never mentions Connecticut. There is nothing to delete at DESIGN.md:40; only build_data.py:276 needs the edit. Severity is low: a metadata string, no data or mechanic affected.


### 119. `pop-fallback-whole-state` — The population fallback assigns a county its entire state's population, flagged only by a small est. badge

- **Severity:** low  ·  **Category:** data-integrity
- **Where:** `build/build_data.py` — lines 195-205

**Evidence**

```
202:         if p is None:
203:             p, est[fips] = state_pop.get(fips[:2]), est[fips] + "p"
204:         pop[fips] = p
This is not a per-capita or apportioned estimate — it literally writes the state total into one county. Currently harmless (measured: 'p' flag count = 0, no county takes this branch), but it is the only guard for a geometry/Census FIPS mismatch, which is exactly the failure mode that already produced the 02261 and 46113 problems elsewhere in the pipeline.
```

**Why it matters.** If a future counties-10m.json or Census release introduces one unmatched FIPS, that county gets e.g. 39 million people, becomes the largest unit on the map by an order of magnitude, dominates the leaderboard, the blue shell, the GDP-per-capita estimator (which then propagates the error into gdp), the Area merge, and the market — and the only signal is a 4-character "est." badge in the info panel. Silent, catastrophic, and plausible.

**Fix.** Make it fatal: collect unmatched FIPS and `raise SystemExit(f"no population for {sorted(missing)} - add to POP_HARDCODE or fix the FIPS alias table")`. If a soft fallback is genuinely wanted, use the state's median county population, not its total.

> **Verifier note.** Severity should be low, not medium. The scenario is entirely hypothetical — the unit set is driven by the geometry (build_data.py:188-193) and every rendered FIPS currently resolves in co-est2024 or POP_HARDCODE. The two real vintage mismatches in the pipeline (02261, 46113) both hit *other* layers, never population. The code smell is genuine and the fix trivially right, but nothing is wrong in the shipped data.


### 120. `transport-hawaii-and-ak-gaps` — transport.json has 0 Hawaii and only 4 Alaska records; the Interstate regex cannot match Hawaii's H-routes

- **Severity:** low  ·  **Category:** data-integrity
- **Where:** `build/build_transport.py` — lines 103-105, 125-135

**Evidence**

```
103:             m = re.search(r"I-?\s*(\d+[A-Z]?)", str(row["FULLNAME"]))
Hawaii's Interstates are signed H-1/H-2/H-3, which this pattern cannot match, and Alaska's are A-1..A-4. Measured over data/transport.json:
  transport.counties: HI = 0, AK = 4, CT planning regions = 8 of 9
RAIL_HUBS (build_transport.py:36-57) lists 5 Alaska entries but one of them is 02063 (Whittier), which is not a game-data FIPS — the output loop at 126 `for f in gd:` drops it, which is why AK lands at 4.
```

**Why it matters.** Two whole states show "Interior - no major trade access" / no transport chips in the info panel (app.js:305-325, 775-780), and transitLink (app.js:738-755) can never find a rail or highway corridor through them. It is small today because transport drives no mechanics, but DESIGN.md lists a logistics layer as the next consumer of this file, and it would inherit the blind spots.

**Fix.** Widen the regex to `[IHA]-?\s*(\d+[A-Z]?)` and prefix the match with the state's route letter, or drop the Interstate concept for AK/HI and hand-author their corridors. Fix the 02063 hub key to 02261 via the FIPS alias table, and warn on any RAIL_HUBS key not present in game-data.

> **Verifier note.** The '8 of 9 CT planning regions' data point is not evidence of a bug. The missing one is 09160 Northwest Hills, which genuinely has no Interstate, no Class I rail flag and no rail hub — 8/9 is the correct answer for that region, not a gap. Only the HI/AK regex blindness and the 02063 key are defects.


### 121. `dead-code-and-doc-drift` — Dead helper, unused imports, and an undocumented rule field in the editable party table

- **Severity:** low  ·  **Category:** correctness
- **Where:** `build/build_areas.py, build/build_trade.py, build/build_transport.py, build/build_parties.py` — lines build_areas.py:79-80; build_trade.py:21,25; build_transport.py:17,22; build_parties.py:8-15 vs 71-72

**Evidence**

```
build_areas.py:79-80 defines a helper that is never called (the loop recomputes group sums inline at 87):
79:     def group_pop(root):
80:         return sum(pop[f] for f in counties if find(f) == root)
build_trade.py:21 `import io` and :25 `import zipfile` are never used (grep for `io\.` / `zipfile\.` returns nothing); same for build_transport.py:17 and :22.
build_parties.py's docstring enumerates the rule fields at lines 8-15 (states, min_pop, max_pop, lean, fips, mt_interior, chance, share) but omits `fips_states`, which is implemented at line 90-91 and is the only thing making Northern Christian Kingdom work:
71:     "Northern Christian Kingdom": {"states": ["41", "53"], "lean": "R",
72:                                    "fips_states": ["16", "30", "56"]},
Also build_parties.py:95-98 uses truthiness (`if rule.get("min_pop")`), so a threshold of 0 would be silently ignored.
```

**Why it matters.** These files are explicitly designed to be edited by hand — each carries an "EDITABLE TABLE" banner and an invitation to re-run. An undocumented rule field in the one table the designer is meant to edit is a real usability defect, and the unused imports/dead helper suggest the top-of-file blocks are not being maintained alongside the code.

**Fix.** Document `fips_states` in the build_parties.py docstring rule list (line 8-15), change the filter guards to `if rule.get("min_pop") is not None`, delete build_areas.py:79-80, and drop the four unused imports.

> **Verifier note.** All four items verified. `grep -n group_pop build/build_areas.py` returns a single hit at line 79 — the helper is defined at :79-80 and never called, with the loop recomputing group sums inline at :87. io and zipfile are imported at build_trade.py:21/:25 and build_transport.py:17/:22, and grepping for `io.` / `zipfile.` in either file returns nothing. build_parties.py's docstring rule list at :8-15 enumerates states, min_pop, max_pop, lean, fips, mt_interior, chance/share and omits fips_states, which is implemented at :90-91 and is the only mechanism giving Northern Christian Kingdom (:71-72) its ID/MT/WY counties. And :95/:97 do use truthiness (`if rule.get("min_pop")`), so a 0 threshold would be silently skipped.



## Architecture & fitness for the target design (16 findings)

### 122. `verdict-rearchitect-the-core` — VERDICT: REARCHITECT the core, keep the shell — and the shell is the good part

- **Severity:** critical  ·  **Category:** architecture
- **Where:** `multiple` — lines js/game.js:38-47; js/world.js:94-119; js/actions.js:550-616; js/app.js:351-365; index.html:70-84

**Evidence**

```
The four load-bearing facts, each verified below: (1) `lean: dem >= gop ? 'D' : 'R'` (game.js:87,110) is a binary enum used as a *control-flow key* by civil war, annex eligibility, splinter planning and partial-victory contiguity. (2) `const names = Object.keys(s.ext); if (!names.length) continue;` (world.js:96) — an emergent movement can never appear in an area that did not spawn one. (3) `Actions` exports `{ isActive, start, onHover, onClick, cancel }` (actions.js:641) — every outcome is computed inside a DOM `onclick` closure. (4) `function emit() { listeners.forEach((f) => f()); }` (game.js:209) → `onGameChange` re-projects the whole national border mesh (app.js:181-186).
```

**Failure scenario.** Attempting to add the target design incrementally: you add a `sentiment` field to the county record, then discover sentiment needs per-movement ideology distance, then discover `lean` is binary, then discover rewriting `lean` breaks civilwar.js, actions.js, leaderboard.js, mapmodes.js and app.js at once, then discover you cannot test any of it because there is no headless entry point and no seed. Each step is blocked by the one you skipped.

**Why it matters.** Not EXTEND: the target design's central mechanic is movements *spreading*, and the shipping runtime structurally cannot grow one. Not REFACTOR-IN-PLACE either: the two things that must change first (the area record's shape and the singleton module state) are read by all 13 files, so "in place" is a euphemism for the same rewrite done in a worse order. But this is a rearchitecture of ~1,200 lines of model code, not of the project. Keep all of `data/` and `build/` (the data foundation is the strongest part of this project and needs no change), the d3 map setup (app.js:90-165), the editor's tree/painting UX, the CSS, the panel/leaderboard layout, and the *math* in civilwar.js and the world phases — the formulas are fine; the two-party vocabulary and the global state they're written against are not.

**Fix.** Spine: `content/world.json` (authored, versioned, written in place by the editor) + `content/tunables.json`; `sim/rng.js` (seeded named streams); `sim/state.js` (columnar index + typed arrays, `clone()` = one `slice()` per array); `sim/defs.js` (6 ideologies on 2 axes, ~22 movements as homeland-mask + seed + cap, governments — data, not literals); `sim/graph.js` (CSR area adjacency built once); `sim/phases/*.js` as pure `(prev,next,ctx)=>void`, with `sentiment.js` writing the value AND its 6 factor contributions; `sim/pipeline.js` `advance(state,tunables,rng)->{state,trace,events}`; `sim/actions/*` split into `plan(state,intent)->Preview` (pure, no RNG) and `resolve(state,intent,rng)->{state,events}`; `sim/ai/policy.js` scoring `plan()` outputs; `ui/*` imports `sim`, `sim` imports nothing from `ui`; `tools/sim.mjs` `run(seed,tunables,turns)->series[]`. Determinism lives in exactly three places: the rng passed explicitly (never a module global), phases that never read what they wrote, and iteration by integer index over typed arrays. Build order, each step shipping a working game: (1) CSR adjacency behind the existing `countyNeighbors` signature; (2) seeded RNG through the five `Math.random` sites + seed in the save; (3) columnar state + six symmetric ideologies; (4) plan/resolve split + EventLog; (5) diff renderer, detached for AI turns; (6) sentiment phase + trace + dashboard. Do (1) and (2) this week regardless of what you decide about the rest — they are cheap, strictly additive, and make every later step easier.

> **Verifier note.** "the two things that must change first ... are read by all 13 files" is an overstatement. `lean` appears in 7 of 13 JS files (actions, app, civilwar, game, leaderboard, mapmodes, world) and colors.js, editor.js, market.js, parties.js, saves.js, turns.js contain no reference to it. The area record is read directly by fewer still. The claim should be "read by 7-8 of 13", which does not change the conclusion but the stated 13 is wrong.


### 123. `movements-cannot-spread` — Emergent parties are frozen to their spawn areas forever — the target design's core mechanic is structurally absent

- **Severity:** critical  ·  **Category:** simulation-integrity
- **Where:** `js/world.js, js/parties.js, js/game.js` — lines js/world.js:44-63, 66-90, 94-119, 124-138; js/parties.js:56-81; js/game.js:293-311

**Evidence**

```
`phasePoliticalDrift` writes only `nxt[f].demPop/gopPop/othPop` (world.js:57-59) and computes its base as `const pop = c.demPop + c.gopPop + c.othPop;` (world.js:51) — `ext` is never touched. `phasePartyGrowth` opens with `const names = Object.keys(s.ext); if (!names.length) continue;` (world.js:95-96). `phaseCleanup` only deletes (world.js:131). Both growth paths exclude ext from the base *and* the distribution: `const growth = (c.demPop + c.gopPop + c.othPop) * r;` (world.js:83) and `d += c.demPop; g += c.gopPop; o += c.othPop;` / `const frac = (c.demPop + c.gopPop + c.othPop) / pop;` (game.js:296,303).
```

**Failure scenario.** Deseret spawns in its 41 authored counties at ~10% share. Play 200 turns. It is still in exactly those 41 areas at ~35%, and has spread to zero neighbors. Cascadia, Greater Idaho, Jefferson, Franklin — same. Two-tier secession (continuous county defection then discrete breakaway) has no continuous tier to build on.

**Why it matters.** The target design is built on secessionist movements that grow from a seed, spread across a homeland, and eventually break away. In the shipping runtime the *set of areas holding any emergent party is fixed at setup and can never change*. No drift carries a movement to a neighbor; no growth path adds members to one; `phasePartyGrowth` can only raise the share inside areas that already have it. Every growth tick from either engine injects population containing zero movement members, diluting them, while `phasePartyGrowth` pushes back at 3% of the gap — so a movement's trajectory depends on how many times the player pressed a button. Meanwhile the abandoned `game_state.py` does have the right behavior (see below), which means the correct mechanic was written and then dropped.

**Fix.** Sentiment/movement share must be a per-area, per-movement quantity updated by a diffusion phase that reads the neighbor graph, not a bag that only exists where it was seeded. Replace `ext:{}` with a `Float32Array sentiment` of length `nAreas * nMovements` and a phase that computes, per area per movement, the six target-design factors (county ideology majority, nation power, Authority, QoL, civil liberties, neighboring-power pull) — the last of which is exactly the diffusion term that is missing today. Keep the raw contribution of each factor alongside the result; that is the "why did this happen?" data.

> **Verifier note.** Two corrections. (a) "the set of areas holding any emergent party is fixed at setup and can never change" is wrong in one direction: phaseCleanup (world.js:124-138) deletes any ext party below PARTY_FLOOR=0.01, so the set can shrink. The accurate statement is that it can never grow. (b) The cross-reference "the abandoned game_state.py does have the right behavior" is overstated. Python's drift does seed the party into same-nation counties (via `set(src["parties"]) | set(target)` at game_state.py:201), but it is nation-wide, not neighbor-based -- game_state.py never reads the `neighbors` field it stores. And Python's own phase_cleanup FLOOR wipes the seeded share out at realistic magnitudes: I ran the real `advance_turn` on the finding's own scenario and county B holds X=0 after all 10 turns under Python too. The correct mechanic was not "written and then dropped"; a partial, geographically-blind version was written and is itself self-cancelling.


### 124. `county-record-cannot-carry-target-model` — The flat mutable Area record needs replacing, not extending — sentiment is a matrix and ideology is not three fields plus a bag

- **Severity:** critical  ·  **Category:** data-integrity
- **Where:** `js/game.js` — lines js/game.js:14-21, 38-47, 51-64, 76-88, 91-112, 344-365, 371-378

**Evidence**

```
`county[fips] = { name, st, demPop: pop*dem, gopPop: pop*gop, othPop: pop*oth, ext: {}, gdp: r.gdp || 0, attrs: {} };` (game.js:38-47). Serialization mirrors it exactly: `counties[f] = { d: c.demPop, g: c.gopPop, o: c.othPop, e: {...c.ext}, a: {...c.attrs}, gdp: c.gdp }` (game.js:347).
```

**Failure scenario.** You add `sentiment: {}` and `qol: {}` to the record. `advanceTurn`'s snapshot/next copy (world.js:144-145) silently drops them because it enumerates fields by hand; `Game.serialize` (game.js:347) silently drops them for the same reason; saves round-trip as zeros with no error. Then the 50-turn dashboard run allocates ~3.4M short-lived objects and stutters.

**Why it matters.** Four specific things break. (a) Three privileged scalar fields plus an untyped name→count bag. Six *symmetric* ideologies need six symmetric slots; `ext` entries have no id, no ideology coordinates, no homeland, no colour — their identity is a display string, and `Parties.groupOf` (parties.js:38) maps names to colour families through a hard-coded dict covering 6 of the 16 baked parties, so the other 10 (New England United, Blue-Collar Populist, Techno-Autocrat, A Free Texas, Deseret, Great Lakes Free Trade, New Absaroka, El Paso United, The Farmers Union, Eastern Progressives) collapse to 'yellow' and `Parties.blocs` (parties.js:43-54) then reports them as one pooled coalition. (b) `attrs: {}` — the designed extension point, present in both implementations — is written by nothing and read by nothing; its only accessor `Game.areaAttrs` (game.js:376) has zero callers. The editor, the tool that should populate it, instead writes a parallel `assign` map and publishes it as a browser download. (c) Sentiment is a matrix, not a field: 1,676 areas × ~22 movements = 36,872 values, plus QoL(3) + liberties(2) + occupation + homeland per area. `advanceTurn` deep-copies every record twice per turn as object literals (world.js:141-146); at target scope that is ~1,676 × 2 × ~35 fields ≈ 117k property writes per turn *before any math*, and the requested dashboard re-runs 50 turns on every slider drag. (d) Ownership is stored twice — `owner: Map<fips,nid>` and `nation.counties: Set<fips>` (game.js:16,67) hand-synced in `moveCounties` (211-223) and `loadState` (352-365). Every new relation the target design adds (occupier, claimant, homeland, garrison) either adds another parallel index or bolts onto the same object.

**Fix.** Columnar state. Build the area index once at load (`fips -> int`), then hold `Float32Array` per field: `pop[6]` (one per ideology), `gdp`, `food`, `health`, `it`, `libPos`, `libNeg`; `Int16Array owner`, `Int16Array homeland`; `Uint8Array occupied`; and `Float32Array sentiment` of length `nAreas * nMovements`. A turn becomes `next = state.clone()` — one `.slice()` per array, one memcpy each — and every phase becomes an index loop with zero allocation. Keep a thin `Area` view object materialised on demand for the info panel only. Ownership lives in exactly one array; `nation.counties` becomes a derived index rebuilt when ownership changes, not a second source of truth.

> **Verifier note.** The failure scenario's mechanism is slightly off. advanceTurn's swap-back (world.js:150-153) assigns five named fields onto the existing live record rather than replacing it, so an added `sentiment` field survives on `Game.county[f]`. What is actually dropped is any *phase write* into `nxt[f].sentiment` (discarded at swap-back because the swap enumerates fields by hand), plus the save round-trip via serialize (game.js:347). And the save loses them as *absent*, not as zeros -- loadState (game.js:355) assigns only the listed fields, so the in-memory value is untouched by a load and lost only across a page reload. The conclusion (hand-enumerated copy paths silently drop new state) holds.


### 125. `two-party-is-structural-not-cosmetic` — D/R is a binary control-flow key across 9 of 13 JS files — replacing it with six ideologies is a model rewrite, not a find-and-replace

- **Severity:** critical  ·  **Category:** architecture
- **Where:** `multiple` — lines js/game.js:34-36,87,110,265-277,293-311; js/world.js:24-37,44-63,66-90,94-119,124-138; js/civilwar.js:23,32-34,63; js/parties.js:24-39,43-54; js/mapmodes.js:77-97,141-142; js/actions.js:104-107,466,599,633; js/leaderboard.js:13,17,25,48; js/app.js:685-688,825-855; css/style.css:9-10,174,229-240,352-353

**Evidence**

```
`return { lean: dem >= gop ? 'D' : 'R', margin: Math.abs(dem - gop), dem, gop, other, extPct };` (game.js:87). Consumed as control flow: `const flip = ... before.lean !== after.lean;` (civilwar.js:23); `const oldMajorityShareAfter = before.lean === 'D' ? after.dem : after.gop;` (civilwar.js:33); `const marginDiff = Math.abs((S.dem - S.gop) - (T.dem - T.gop));` (civilwar.js:63); `if (d.lean === me.lean && (d.gdp > me.gdp || d.pop > me.pop)) blocked.add(oid);` (actions.js:466); `const defect = Sc.filter((c) => Game.leanOf(c)?.lean === Tlean && touchesT(c));` (actions.js:104); `const same = new Set(chosen.filter((f) => Game.leanOf(f)?.lean === attackerLean));` (actions.js:599). And `const sums = { red: demo.gop || 0, blue: demo.dem || 0 };` (parties.js:44).
```

**Failure scenario.** A nation is 45% New Confederacy, 30% R, 25% D. `leanOf` returns 'D'. Annexing a Republican county "flips" it to 'R' and triggers a civil war; `applyCivilWarCost` then bleeds Democrats — the third-largest group — while the actual ruling movement is untouched. `mapmodes.political()` paints the area blue.

**Why it matters.** ~26 sites across 9 JS files plus CSS, but the site count understates it. `lean` is a *binary enum the model returns* that four different game decisions answer with `===`: does this annexation trigger a civil war, may I annex this neighbour, who defects in a failed union, which counties survive a partial victory. With six symmetric ideologies there is no `===` answer — the question becomes "how far apart are these two polities on two axes", which is a different function with a threshold, and every one of those decisions must be re-derived. Two more consequences today: `applyCivilWarCost` picks the bleeding party as `const rulingDem = d >= g;` (game.js:271) so a nation whose actual majority is an emergent movement bleeds the wrong population and a movement can never take casualties; and `demographics.lean` ignores `ext` entirely (game.js:102-110), so a nation that is 40% Deseret / 31% R / 29% D reports as leaning 'D'.

**Fix.** Delete `lean` from the model API. Replace with `ideologyMix(scope) -> Float32Array[6]`, `dominant(scope) -> ideologyId`, and `distance(a, b) -> number` on the two design axes. Every `x.lean === y.lean` becomes `distance(x,y) < tunables.affinityThreshold`; every `dem - gop` becomes a position on the plane. `Parties.blocs` and the hard-coded `PARTY_GROUP`/`GROUP_COLORS` dicts die — coalition membership becomes proximity on the axes, read from content data. Budget: all of civilwar.js, the demographics layer of game.js, all five world phases, the four lean-keyed decisions in actions.js, and the political map mode + legend — roughly 60-70% of the model code and 100% of civilwar.js.

> **Verifier note.** Two errors. (1) The file count is wrong: `lean` appears in 7 of 13 JS files, not 9. parties.js is cited but contains zero occurrences of `lean` (it is two-party-hardcoded via red/blue, a related but different thing), and world.js's two-party structure lives in d/g/o fields, never in the 'D'/'R' enum. Call it 8 files touching D/R semantics. (2) Both worked examples are arithmetically backwards. `dem >= gop ? 'D' : 'R'` on 31% R / 29% D returns 'R', not 'D'; on 30% R / 25% D it returns 'R', not 'D'; and mapmodes.political() (mapmodes.js:91-97) keys on `p.dem - p.gop`, so it would paint that area RED, not blue. The real defect is subtler than the finding renders it: lean is decided by a D-vs-R comparison that simply ignores a 40-45% plurality movement, so the reported lean is a minority party -- not that it flips to the wrong one of D/R.


### 126. `no-headless-action-layer` — Every action's outcome lives inside a DOM onclick closure — AI, tests, and replay all have nowhere to attach

- **Severity:** critical  ·  **Category:** architecture
- **Where:** `js/actions.js, js/app.js` — lines js/actions.js:113-135, 349-376, 444-454, 519-548, 550-616, 641; js/app.js:508-518, 570-576

**Evidence**

```
`document.getElementById('a-go').onclick = confirmAnnex;` (actions.js:547) where `confirmAnnex` reads module-private UI state `A`, rolls `CivilWar.resolve(...)` (actions.js:562), mutates `Game`, and ends with `A = null; restoreColorMode(); clearVisuals(); flash(msg, kind); completeTurn();` (actions.js:590-594) — returning nothing. Same shape in `confirmUniteAttempt` (113-135), the transit `finalize` (355-363), and `confirmTrade` (444-454). Public surface: `return { isActive, start, onHover, onClick, cancel };` (actions.js:641).
```

**Failure scenario.** You write `AI.takeTurn(nid)`. To annex, you must set `Actions`' private `A`, which you cannot reach; so you copy `confirmAnnex`'s 60 lines into the AI. Six weeks later you fix a civil-war edge case in one copy.

**Why it matters.** There is no `resolve(intent)` anywhere. To add a single AI nation you must either synthesise DOM clicks or re-implement every resolution path, and the second copy will drift exactly the way game_state.py drifted. The same missing seam blocks four other target-design systems at once: the AI turn loop, deterministic replay, unit tests for outcomes, and the "why did this happen?" layer — because the only output any action produces is an HTML string handed to `flash()` (app.js:478-484), a 6-second toast that overwrites the previous message. There is no event log in the codebase, so the narrative-events system and the map-history timeline have no substrate either.

**Fix.** Split every action in two. `plan(state, intent) -> Preview` — pure, no RNG, no DOM; this feeds the human's preview panel *and* the AI's candidate scoring, so they can never disagree about what an action does. `resolve(state, intent, rng) -> { state, events[] }` — pure, RNG explicit. The UI renders `Preview`, calls `resolve`, and renders `events`. The AI calls `plan` over candidates, scores, calls `resolve` on the winner. `events[]` becomes the single feed for the toast, the explanation panel, the timeline, and the test assertions. This one split is what makes AI, replay, tests and the explanation layer possible simultaneously — do it before anything else in actions.js.

> **Verifier note.** Verified exactly. actions.js:641 exports `{ isActive, start, onHover, onClick, cancel }` and nothing else. Every resolution path is a DOM handler closing over the module-private `A`: `document.getElementById('a-go').onclick = confirmAnnex` (actions.js:547) where confirmAnnex (550-595) reads A, rolls `CivilWar.resolve` (562), mutates Game (566/570/571/576/577/581/583), then does `A = null; restoreColorMode(); clearVisuals(); flash(msg, kind); completeTurn();` (590-594) and returns undefined. Same shape at confirmUniteAttempt (113-135), the transit finalize (355-363), confirmTrade (444-454). There is no `resolve(intent)` anywhere and no event log anywhere in js/ -- I grepped for EventLog/eventLog/addEvent/history and the only hits are DOM addEventListener calls. flash() (app.js:478-484) is the sole output channel and clears itself after 6000ms, overwriting any prior message. All four downstream blockers named (AI loop, replay, outcome tests, explanation layer) follow directly.


### 127. `no-determinism-no-harness` — Five unseeded Math.random calls, no headless mode, no tests — the requested 50-turn simulator cannot exist yet

- **Severity:** critical  ·  **Category:** architecture
- **Where:** `multiple` — lines js/parties.js:59,69; js/civilwar.js:19; js/turns.js:21; js/actions.js:120; js/saves.js:9; js/market.js:19,34,58,68; js/app.js:630; js/world.js:142,152

**Evidence**

```
`const roll = () => 1 + Math.floor(Math.random() * 6);` (civilwar.js:19); `if (Math.random() > (def.chance == null ? 0.5 : def.chance)) continue;` (parties.js:59); `if (Math.random() < P)` (actions.js:120); `const j = Math.floor(Math.random() * (i + 1));` (turns.js:21). The save: `const snapshot = () => ({ v: 1, ts: Date.now(), game: Game.serialize(), turns: TurnSystem.serialize(), colorMode: store.colorMode });` (saves.js:9) — no seed, no RNG state. And `const e = MapModes.getEconomy();` inside `Market.update` (market.js:19) with `DEMAND_SHARE` declared at app.js:630.
```

**Failure scenario.** You add the sentiment phase, see Texas snowball to 40 nations by turn 30, and try to bisect it. You cannot re-run the same game, cannot run the model without a browser, and cannot isolate one phase to test it. Every diagnosis is a manual click-through with different dice.

**Why it matters.** Three separate blockers, in dependency order. (a) No replay: load a save, take the same action, get a different civil war — so you cannot reproduce the runaway spiral the dashboard exists to find. (b) No headless mode: `World.advanceTurn` calls `Market.update` (world.js:157), which reads its economic input out of the *rendering* module (`MapModes.getEconomy`, market.js:19 and 58) and reads `DEMAND_SHARE` from app.js:630 — a constant declared inside the DOM file, working only because index.html loads market.js before app.js and nothing calls `update()` until app.js has evaluated. You cannot load the simulation without loading the renderer. (c) Iteration-order hazard: every phase iterates `for (const f in Game.county)`. Of the 3,143 FIPS keys, 2,826 are canonical integer strings ("48453") and 317 are not ("01001"), so V8 emits the 2,826 in ascending numeric order first and the leading-zero ones — all of AL, AK, AZ, AR, CA, CO, CT, DE — last in insertion order. Nothing depends on order today, but `phaseCleanup` deletes keys (world.js:131) and any future order-sensitive phase (contagion, neighbour pull, resource allocation) is silently non-reproducible. There are also zero tests and zero assertions in the JS; the only assertion in the repo is `roundtrip_guard` (game_state.py:327-329), in the file that should be deleted.

**Fix.** In order: (1) a seeded PRNG object (mulberry32 or xoshiro128**) with named streams — `rng.stream('combat')`, `rng.stream('spawn')` — passed as an explicit argument into every phase and resolver, never a module global, so adding a die roll to combat doesn't reshuffle party spawns; (2) the model as DOM-free modules with no d3 import and economy/trade/transport data owned by the sim, not by MapModes/store; (3) `advance(state, tunables, rng) -> { state, trace }` where `trace` records each factor's contribution to each sentiment value; (4) `run(seed, tunables, turns) -> series[]` driven from a JS runtime; (5) then the dashboard is a chart over `series` and the "show your work" panel is a view over `trace`. Build the trace once — it is the same data the player-facing explanation layer needs.

> **Verifier note.** The list of leading-zero states is wrong: DE does not belong. Delaware's FIPS is 10, so "10001" is a canonical integer string and Delaware sorts with the numeric group. The actual non-canonical prefixes are exactly 01, 02, 04, 05, 06, 08, 09 -- AL, AK, AZ, AR, CA, CO, CT. Also market.js:58 is the `nationSurplus` function header; the getEconomy call is line 59.


### 128. `render-fires-on-every-mutation` — Game.onChange re-projects the entire national border mesh per mutation; 51 AI nations would do it 100+ times a round

- **Severity:** high  ·  **Category:** performance
- **Where:** `js/game.js, js/app.js` — lines js/game.js:208-209, 222, 227, 233, 260, 289, 310, 333, 340, 364; js/app.js:181-186, 192-194, 351-365, 503; js/world.js:140-160

**Evidence**

```
`function emit() { listeners.forEach((f) => f()); }` (game.js:209), called unconditionally from nine mutators. The single listener: `function onGameChange() { store.outlineCache.clear(); TurnSystem.sync(); recolor(); redrawBorders(); Leaderboard.refresh(); renderTurnBanner(); ... select(...); }` (app.js:351-365). `redrawBorders` = `store.path(topojson.mesh(store.topo, store.topo.objects.counties, (a, b) => meshOwner(a.id) !== meshOwner(b.id)))` (app.js:182-185).
```

**Failure scenario.** 51 AI nations each resolve one action per round → 100+ full border re-meshes and re-projections plus 100+ sidebar innerHTML rebuilds per round, on the UI thread, with the player watching a frozen tab. Nothing in the current architecture lets you turn it off.

**Why it matters.** I measured the geometry: counties-10m.json holds 9,869 arcs, 46,565 coordinate pairs and 19,019 arc references across 3,231 county geometries. Every `emit` re-runs `topojson.mesh` over all of it with a JS predicate invoked per shared arc (two `meshOwner` calls each = two object lookups plus two `Map.get`), then re-projects the resulting mesh through `d3.geoAlbersUsa` — a composite projection that point-tests every coordinate against three sub-projections — and assigns one path string with tens of thousands of segments, forcing a full re-parse and re-raster. `recolor` then writes 3,231 fill attributes, each allocating a fresh `d3.interpolateRgb` closure in political mode. `Leaderboard.refresh` rebuilds the sidebar's innerHTML and calls `nationDemographics` per nation. A single resolved annexation triggers this twice (actions.js:566 then 571, both unconditional emits). There is no coalescing, no dirty tracking, no rAF batching, and no escape hatch: only `moveCounties` accepts `{silent}` — `applyCivilWarCost`, `growAll`, `boostGdp`, `spend` and `breakApart` always emit. The contract is also inconsistent in the other direction: `World.advanceTurn` mutates every area and does *not* emit (world.js:140-160); its one caller compensates by hand (`World.advanceTurn(); onGameChange();`, app.js:503), so AI code calling it will silently leave a stale map.

**Fix.** Replace the `onChange` ping with a versioned diff. The round pipeline returns `{ state, changed: { areas: Int32Array, nations: [], borders: bool } }`. The renderer takes `(prev, next, changed)`: repaint only changed area fills, re-mesh borders only when `changed.borders`, rebuild only changed leaderboard rows, and coalesce everything into one rAF. Run AI turns with the renderer detached entirely — resolve N intents, render once at end of round. Cache the area-level border mesh keyed by an ownership-version integer so repeated no-ownership-change turns skip the mesh completely.

> **Verifier note.** "only `moveCounties` accepts `{silent}`" is wrong -- createNation (game.js:230-234) also accepts and honors `{silent}`. The substantive point survives: applyCivilWarCost, growAll, boostGdp, spend and breakApart have no escape hatch. On severity: today there are zero AI nations (DESIGN.md lists this under "Open / unresolved"), a human takes one action per turn, and the finding's own framing concedes the cost is invisible at present scale. The entire critical rating rests on a hypothetical 51-AI round. It is a genuine architectural blocker for the target design, which is high, not a critical defect in shipping code.


### 129. `singleton-modules-block-simulation` — Every module is a singleton IIFE with private mutable state — you cannot run two worlds, so you cannot run the dashboard

- **Severity:** high  ·  **Category:** architecture
- **Where:** `multiple` — lines js/game.js:13-21; js/world.js:14-20; js/market.js:14-16; js/turns.js:13-17; js/colors.js:10-11,28-29; js/parties.js:13-15; js/editor.js:16-28

**Evidence**

```
`const Game = (function () { const county = {}; const nations = new Map(); const owner = new Map(); const alias = {}; let adjacency = null; let seq = 0; ...` (game.js:13-20). `init(data, adj, areasDef)` mutates them in place; there is no constructor, no reset, and `county` is never cleared.
```

**Failure scenario.** You build the dashboard and drag the drift slider. To show the 50-turn projection you must mutate the live `World` constants and advance the real game 50 turns, then somehow undo it — there is no second instance and no snapshot/restore that covers World, Market, Colors or Parties (see the persistence finding).

**Why it matters.** The requested developer dashboard wants live sliders plus a 50-turn step-through that graphs Authority/Sentiment/Influence to expose runaway spirals. That means running the simulation many times with different tunables while the displayed game stays untouched — impossible when there is exactly one `Game`, one `World.turn`, one `Market.prices`, one `TurnSystem.order` and one `Colors` counter per page. `Game.init` cannot even be called twice safely. It is also why there is no unit test: you cannot exercise one phase without booting the whole world. Compounding it, the tunables the sliders must bind to are scattered as module-private consts across five files: game.js:23,26-28,240 (TURNOUT, TAX_RATE, GOV_TYPES, AREA_UPKEEP, MIN_NATION); world.js:18-20; market.js:15; actions.js:184,188-190,194-195; app.js:630.

**Fix.** `createWorld(defs, tunables, rng) -> World` returning a plain object; every sim function takes the world explicitly as its first argument. Collapse all tunables into one `tunables` object loaded from content and passed in — the dashboard then binds sliders to keys of that object with zero per-slider code, and a projection run is `run(structuredClone(state), {...tunables, driftStep: v}, 50)` against a throwaway copy.

> **Verifier note.** Verified. game.js:13-21 is the closure verbatim; init (game.js:30) mutates `county`, `nations`, `owner`, `alias` in place with no constructor and no reset, and `county` is never cleared, so a second Game.init would leave stale merged members and accumulate aliases. Same singleton shape at world.js:15 (`let turn = 0`), market.js:15-16, turns.js:9-12, colors.js:10/28-29, parties.js:14, editor.js:16-28. The tunables are scattered exactly as claimed: TURNOUT game.js:23, TAX_RATE 26, GOV_TYPES 27, AREA_UPKEEP 28, MIN_NATION 240; PARTY_CEILING/STEP/FLOOR world.js:18-20; market.js:15; TRADE_GAIN/TRANSIT_TOLL/RAIL_DISCOUNT/HIGHWAY_DISCOUNT/NEED_SCALE/COUNTER_FLOOR actions.js:184/188-190/194-195; DEMAND_SHARE app.js:630. A 50-turn projection against a throwaway copy is impossible with one instance of each module. Severity high is right -- it blocks a requested feature rather than breaking a shipped one.


### 130. `layering-inverted` — app.js is simultaneously above and below the model — the sim reads its inputs out of the renderer

- **Severity:** high  ·  **Category:** architecture
- **Where:** `js/market.js, js/mapmodes.js, js/app.js, js/actions.js, js/editor.js` — lines js/market.js:19,34,58,68; js/mapmodes.js:22-28; js/app.js:19-35,630,702-755; js/actions.js:16-19,30-31,38-40; js/editor.js:239-240

**Evidence**

```
`const e = MapModes.getEconomy();` inside `Market.update` (market.js:19) — a simulation system reading simulation data through the rendering module, because `MapModes.setEconomy` (mapmodes.js:24) is where economy.json was parked. `const DEMAND_SHARE = [0.08, 0.10, 0.22, 0.15, 0.15, 0.10];` at app.js:630, consumed at market.js:34 and 68. `const origRefresh = Leaderboard.refresh; Leaderboard.refresh = (...a) => { if (!active) origRefresh(...a); };` at editor.js:239-240 — a monkey-patch executed at script-evaluation time.
```

**Failure scenario.** You try to `import { advance } from './sim/pipeline.js'` in a Node script. It pulls World → Market → MapModes → d3 → `document`, and dies before reaching any game logic.

**Why it matters.** The dependency graph has no direction. app.js renders the model *and* supplies its economic constants *and* holds its trade rules: `areaExport` (app.js:717), `nationExportAccess` (726) and `transitLink` (739) decide which trade actions exist and what toll applies, yet live in the rendering file and read `store.trade`/`store.transport` — game data reachable only through the UI store object, which itself mixes render handles (`svg`, `path`, `countyPaths`) with model data (`data`, `trade`, `transport`, `neighbors`) at app.js:19-35. `Actions` reads roughly twelve app.js globals (`store`, `select`, `deselect`, `flash`, `setColorMode`, `completeTurn`, `nationOutline`, `areaFeature`, `meshOwner`, `escapeHtml`, `fmtPop`, `fmtGdp`, `renderPolitics`). Extracting a headless core is therefore not "move some files" — this tangle must be cut first, and the editor's monkey-patch means script load order is load-bearing behaviour, not just sequencing.

**Fix.** Three layers, enforced by ESM imports so there is no other option: `sim/` (no d3, no DOM, no `document`, no `window`), `content/` (data + tunables), `ui/` (imports sim; sim imports nothing from ui). Move economy, trade and transport into the sim's world state at load — `areaExport`, `nationExportAccess` and `transitLink` are trade mechanics and belong in `sim/`. The editor composes instead of patching: the sidebar host takes a renderer and entering the editor swaps it.

> **Verifier note.** Verified. Market.update reads `MapModes.getEconomy()` at market.js:19 and again at :59 and :63 -- a simulation system reaching for simulation data through the rendering module, because economy.json is parked via MapModes.setEconomy (mapmodes.js:24). DEMAND_SHARE is declared at app.js:630 and consumed at market.js:34 and :68. editor.js:239-240 is the monkey-patch verbatim, executed at script-evaluation time. store (app.js:19-35) genuinely mixes render handles (svg, path, countyPaths, hoverShape) with model data (data, trade, transport, neighbors). Trade mechanics live in the renderer: areaExport (app.js:717), nationExportAccess (726) and transitLink (739-755) all read store.trade/store.transport. I counted Actions' reads of app.js globals and every one of the ~12 named is present and non-zero (escapeHtml 20, fmtGdp 18, store 12, flash 11, nationOutline 6, select 5, completeTurn 5, fmtPop 3, setColorMode 2, renderPolitics 2, areaFeature 1, meshOwner 1, deselect 1).


### 131. `persistence-is-partial-and-not-a-source-of-truth` — Only 2 of 8 stateful modules serialize, and authored world data lives in four stores — one of which is the Downloads folder

- **Severity:** high  ·  **Category:** save-load
- **Where:** `js/saves.js, js/game.js, js/editor.js, js/world.js, js/market.js, js/colors.js, js/parties.js` — lines js/saves.js:9-27; js/game.js:345-365; js/editor.js:20,101-128; js/world.js:16; js/market.js:16,32; js/colors.js:28-29; js/parties.js:15

**Evidence**

```
`const snapshot = () => ({ v: 1, ts: Date.now(), game: Game.serialize(), turns: TurnSystem.serialize(), colorMode: store.colorMode });` (saves.js:9) — that is the entire save. And publish: `a.download = `${m.name.toLowerCase().replace(/\W+/g, '-')}.mapmode.json`; a.click(); ... flash('Published ... (check your downloads).')` (editor.js:108-111).
```

**Failure scenario.** You author a Cultural map mode, publish it, forget to move the file out of Downloads, and reload — the draft is in localStorage under a different shape than the published file, `data/cultural.mapmode.json` is stale, and nothing reports a mismatch. Meanwhile a mid-session load leaves the market priced by the abandoned game.

**Why it matters.** Lost or corrupted on every load: `World.turn` (world.js:16, no serialize — the world-turn counter resets to 0 while the game state doesn't); `Market.prices/prev/perCap` (market.js:16, and `perCap` is calibrated once via `if (perCap == null)` at market.js:32, so loading a save mid-session silently prices the new game with the *previous* game's calibration); `Colors.gen` (colors.js:29 — nations minted after a load can be handed colours already in use); `Parties.spawned` (parties.js:15 — `getSpawned()` returns empty). `Game.serialize` also omits the Area membership lists and the alias map, which are rebuilt at init from areas.json — so re-running `build_areas.py` with a different `THRESHOLD` silently invalidates every existing save, with no check: `v: 1` is written at saves.js:9 and never read by `apply` (saves.js:19-27). Separately, the "single source of truth" the owner asked for does not exist in any form. Authored world data lives in four places: 8 `build/*.py` scripts with editable tables at the top → 12 files in `data/`; editor drafts in `localStorage` under `ns_mapmode_*` (editor.js:20,114); published map modes as **browser downloads the user hand-copies into data/** (editor.js:101-112); and saves in `localStorage` under `ns_save_*`. No schema, no versioning, no write-back.

**Fix.** Minimum architecture that delivers the ask: (1) one `data/world.json` as the authored document — areas with member lists, homelands, movement definitions, ideology seeds, economy profiles, region hierarchies, tunables — carrying a `schema` integer. (2) A ~50-line dev server extending the `python -m http.server` already configured in `.claude/launch.json`, with a `PUT /data/world.json` handler; the editor then genuinely reads and writes in place. That is the whole ask and it is an afternoon. (3) Build scripts become *importers*: they merge a new source release into world.json and leave authored fields alone; they stop being the authoring surface. (4) A save becomes `{ schema, seed, rngState, turn, tunablesHash, worldHash, delta }` and refuses to load when `worldHash` doesn't match, instead of silently mis-loading. Route every module's state through one registry so adding a module to the sim adds it to the save by construction.

> **Verifier note.** Minor: "the world-turn counter resets to 0 while the game state doesn't" -- World.turn is never written by load at all, so it retains the current session's value on a mid-session load and is 0 only on a fresh page. The mismatch is real either way.


### 132. `build-runtime-key-mismatch` — 48% of authored party spawn targets silently no-op because the runtime deletes merged counties and parties.js bypasses the alias

- **Severity:** high  ·  **Category:** data-integrity
- **Where:** `js/parties.js, js/game.js, data/parties.json` — lines js/parties.js:64-65; js/game.js:17-18, 51-64, 91-99; js/app.js:231-237

**Evidence**

```
`const c = Game.county[f]; if (!c) continue;` (parties.js:64-65) — a raw lookup with no `cid()`. Meanwhile `Game.init` does `delete county[m]; alias[m] = aid;` (game.js:61-62) for every merged member county.
```

**Failure scenario.** You add the New Confederacy as a playable secessionist faction. It spawns in 536 of its 1,142 authored counties, all of them arbitrarily the ones that happened to survive an unrelated 50k-population merge threshold, and its homeland has holes in it that no one authored.

**Why it matters.** I resolved every county FIPS in data/parties.json against data/areas.json: **2,025 of 4,198 spawn targets (48.2%) name counties that `Game.init` deleted**, so `Parties.setup` skips them without a word. Per party: Libertarians 310/394 (79%), The Farmers Union 696/983 (71%), A Free Texas 150/254 (59%), New Confederacy 606/1142 (53%), El Paso United 10/12 (83%). Deseret, Cascadian Separatists and Northern Christian Kingdom lose 0% — purely because their counties sit in the western states `build_areas.py` exempts from merging (WEST_EXEMPT, build_areas.py:26). So the authored political geography is half-applied and the distortion is *regionally biased*: eastern movements are gutted, western ones intact — the exact opposite of what a game built on regional movements needs. Nobody would notice: there is no assertion and no test. Same root cause elsewhere: `Game.demographics` does `const c = county[f];` with no `cid()` (game.js:95) while `cultureMembers` (app.js:231-237) feeds it member-county ids; it happens to total correctly only because each Area's representative FIPS is itself in the member list (verified 483/483) and carries the summed values. Pass any *other* member id and you get 0.

**Fix.** Make the alias non-bypassable. Either (a) never delete merged counties — keep them as read-only rows with `owner = -1` and an `areaOf` pointer, so a stale id resolves instead of vanishing; or (b) resolve every external key through a single `resolveArea(id)` at the data boundary, and change the build scripts to emit Area ids rather than county ids. Then add a load-time assertion: every id referenced by parties / economy / mapmode / trade data must resolve to a live Area, or boot fails loudly. Re-run `build_parties.py` after `build_areas.py` so the two agree by construction.

> **Verifier note.** Independently reproduced and the numbers are exact. I resolved every county FIPS in data/parties.json against the deletion set that Game.init (game.js:51-64) produces from data/areas.json: 2,025 of 4,198 spawn targets (48.2%) name counties the runtime deletes, and parties.js:64-65 does a raw `Game.county[f]` lookup with no `cid()`, so they are skipped silently. Per-party figures all match: The Farmers Union 696/983, New Confederacy 606/1142, Libertarians 310/394, Blue-Collar Populist 207/504, A Free Texas 150/254, El Paso United 10/12. And the regional bias is confirmed -- Deseret 0/41, Cascadian Separatists 0/164, Northern Christian Kingdom 0/176, Anarcho-Capitalist 0/38, Techno-Autocrat 0/11, Eastern Progressives 0/65, because their counties sit in the states build/build_areas.py:26 WEST_EXEMPT skips. The secondary claim is also exact: Game.demographics (game.js:95) uses a raw `county[f]` while cultureMembers (app.js:231-237) feeds it member ids, and it totals correctly only because each Area's representative FIPS is in its own member list -- I checked all 483 and every one is. There is no assertion or test guarding any of it.


### 133. `two-growth-engines-two-clocks` — Population grows via two unrelated models on two independent clocks, one of which the player controls with a button

- **Severity:** high  ·  **Category:** simulation-integrity
- **Where:** `js/game.js, js/world.js, js/app.js` — lines js/game.js:293-311, 316-326; js/world.js:66-90, 140-160; js/app.js:503, 508-518

**Evidence**

```
`Game.growAll(0.05)` fired on round rollover: `if (TurnSystem.progress().round > beforeRound) { Game.growAll(0.05); ... }` (app.js:511-514). And `phasePopulationGrowth(snap, nxt)` at default `rate = 0.01` (world.js:67) inside `advanceTurn`, wired to a manual button: `document.getElementById('tb-advance').onclick = () => { World.advanceTurn(); onGameChange(); };` (app.js:503).
```

**Failure scenario.** Player A ends 20 rounds without touching "Advance world": population +5%/round compounding, GDP +5%/round, no maintenance, no market movement, movements diluted to nothing. Player B presses it three times per round: 1%/turn growth, no GDP growth, treasuries draining, movements climbing. Same game, same seed, unrecognisably different states.

**Why it matters.** Two growth models with different semantics on two unsynchronised clocks. `growAll` grows each area by its share of the *nation* and also does `c.gdp *= 1 + rate` (game.js:307); `phasePopulationGrowth` grows each area by its own size and never touches GDP. Nothing reconciles them, and the world-turn counter and the round counter are fully independent — a player can press "Advance world" ten times in one round or never. Both exclude `ext` from the base and the distribution (game.js:296,303; world.js:83), so every growth tick dilutes emergent movements while `phasePartyGrowth` pushes them the other way at 3% of the gap to a 35% ceiling: whether a movement grows or shrinks is decided by button-press count. And `tickTreasuries` (game.js:324-326) runs only inside `advanceTurn`, so a player who never presses the button plays with no economic drain at all — `spend` (game.js:336-342) is the only other outflow.

**Fix.** One pipeline, one clock. `endRound()` runs: collect intents (player + AI) → resolve in turn order → run world phases → tick economy → emit one render. Delete `growAll`; population growth belongs to exactly one phase, and that phase must include every ideology in both its base and its distribution. The "Advance world" button becomes "End round" — the target design's per-turn sentiment update makes this non-negotiable.

> **Verifier note.** Verified by call-site grep. Game.growAll has exactly one caller, app.js:512, fired only on round rollover at 5%, and it multiplies gdp (game.js:307). World.advanceTurn has exactly one caller, the 'Advance world' button at app.js:503, running phasePopulationGrowth at 1% with no GDP effect. The two counters (TurnSystem round, World.turn) are fully independent. Game.tickTreasuries has exactly one caller, world.js:156 inside advanceTurn, so a player who never presses the button takes no maintenance drain -- Game.spend (336-342) is indeed the only other outflow. Both growth paths exclude ext from base and distribution (game.js:296/303, world.js:83), and I confirmed the dilution numerically: growAll at 5% on a county at 20% movement share drops it to 19.23% in one round while phasePartyGrowth (world.js:107) pushes the other way at 3% of the gap to a 0.35 ceiling. Whether a movement climbs or decays really is decided by button-press count.


### 134. `no-entity-identity-history-or-relations` — Nations have no founding turn, no history, no relations and no succession — Authority, rivalries, leaders and events have nowhere to live

- **Severity:** high  ·  **Category:** architecture
- **Where:** `js/game.js, js/turns.js, js/actions.js, js/app.js` — lines js/game.js:67, 224-238, 229-235; js/turns.js:37-54; js/actions.js:278-289; js/app.js:478-484

**Evidence**

```
`nations.set(st, { id: st, name: s.name, color: Colors.forState(st), counties: new Set(), origin: true, treasury: 0, gov: 'Republic' });` (game.js:67). `function mergeInto(intoId, fromId) { const from = nations.get(fromId); if (from) moveCounties([...from.counties], intoId, { silent: true }); emit(); }` (game.js:224-228) followed by `for (const [id, n] of nations) if (n.counties.size === 0) nations.delete(id);` (game.js:237).
```

**Failure scenario.** You add persistent rivalries. Texas annexes 30 counties from Oklahoma; Oklahoma drops to zero counties and is deleted by `pruneEmpty`. Every rivalry, treaty, war-weariness accumulator and grudge keyed to Oklahoma's id now points at nothing, and the counties Texas holds carry no record that they were ever taken — so occupation cost and Authority penalty have no input.

**Why it matters.** Mapping the target design onto the current model, system by system: **Authority** = f(age of nation, annexations, losses) — the record has no founding turn, no annexation count, no loss record; `origin: true` is the only historical fact in the entire model. **Persistent rivalries / relations** — no store at all; the only "relations" in the codebase is `evalTransit` computing `rel` on the fly from `Math.abs((dS.dem||0) - (dT.dem||0))` (actions.js:282) and discarding it. **Military / occupation / suppression / war weariness** — no unit or strength concept anywhere; combat is `points × dice product` (civilwar.js:37-55), and occupation cost needs per-area occupier state that has no field. **Leaders with traits** — nowhere. **Events, crises, map-history timeline** — no event type, no log, no bus; `flash()` (app.js:478-484) is the only output channel and destroys the previous message after 6 seconds. **Identity across merges** — `mergeInto` + `pruneEmpty` delete the absorbed nation outright with no succession link, so a rivalry or a "you annexed us on turn 12" grudge against a nation that later merges is orphaned with nowhere to redirect. Nation ids also come from two namespaces (2-digit state FIPS for the 51 origins, `'n' + ++seq` for the rest, game.js:230) with `seq` restored from saves (game.js:363) but `Colors.gen` not.

**Fix.** Give nations a real entity record: `foundedTurn`, `predecessors[]`, `successorOf`, `annexations[]`, `losses[]`, and an append-only `events[]`. Make dissolution a state (`dissolved: true`, `absorbedBy: id`) rather than a `Map.delete`, so history survives and rivalries can be redirected. Add a `relations` table keyed by unordered nation pair, owned by the sim and mutated only by resolvers. Add one `EventLog` that every resolver writes to — it is simultaneously the toast source, the "why did this happen?" source, and the map-history timeline source, and building it once is the difference between three systems and one.

> **Verifier note.** Minor: evalTransit's `rel` (actions.js:282) is not "computed on the fly and discarded" -- it is returned in the verdict object, feeds the ask calculation at :287, and is rendered by transitReasons (:296-297). It is simply never persisted between turns, which is the point the finding is actually making.


### 135. `python-mirror-is-divergent-dead-weight` — game_state.py and the JS runtime produce different numbers from the same input, and the dead one has the better model

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `game_state.py, js/world.js, js/game.js` — lines game_state.py:170-183, 186-207, 286-304; js/world.js:24-37, 44-63, 140-160

**Evidence**

```
Python's lean cache sums every party — `for p, n in c["parties"].items(): t[p] = t.get(p, 0) + n` (game_state.py:177-178) — and its drift iterates `for p in set(src["parties"]) | set(target)` (game_state.py:201). The JS lean cache sums three fields — `t.d += snap[f].demPop; t.g += snap[f].gopPop; t.o += snap[f].othPop;` (world.js:30) — and its drift touches three. Python's unit is the raw county (`load_state` reads game-data.json only; it never opens areas.json); JS's unit is the merged Area.
```

**Failure scenario.** You tune the drift step to fix a runaway spiral, verify it in Python because Python is the only thing you can run headlessly, ship it to the JS engine, and get different behavior — because the JS drift denominator excludes emergent parties and Python's doesn't, and because the JS engine has half as many units.

**Why it matters.** These are two implementations of one model that disagree. I ran both drift+party-growth phases on identical input (2 counties, 1 nation; A = D400/R300/O100/X200, B = D100/R800/O100) for 10 turns: county B ends X=0.00 under the JS rules and X=85.94 under the Python rules — the Python model diffuses the movement nation-wide, the JS model cannot. They also disagree on the unit count: Python simulates 3,143 counties, JS simulates 1,676 Areas (areas.json folds 1,950 members into 483 groups; verified). `game_state.py` (mtime 2026-07-07 19:49) predates `data/areas.json` (20:16 the same day) and still carries `area()` / `area_attrs()` stubs whose docstring claims a 1:1 county↔Area mapping that has been false since the day it was written. The duplication costs: every model change must be made twice or silently forked (it forked), and the file that a reader would reasonably take as the spec is the one that isn't running.

**Fix.** Delete game_state.py. The JS runtime is the real game — it is the only thing index.html loads and the only one with ownership, Areas, treasuries, market, economy, actions, civil war, turns, editor and saves. But port the one thing Python got right into JS: `parties: {name: count}` as a single open map with no privileged keys (game_state.py:20,45), and owner stored once on the unit rather than in two hand-synced structures. Keep Python for `build/` bakes only — a data importer, never a second model.

> **Verifier note.** The headline empirical demo is fabricated or mis-run. I built both models on the finding's exact input (2 counties, 1 nation, A = D400/R300/O100/X200, B = D100/R800/O100) and ran 10 turns. Under the real `game_state.advance_turn`, county B ends with X = 0 -- identical to JS -- because Python's own `phase_cleanup` (FLOOR = 0.01) deletes the ~0.2%/turn share that drift seeds. Only by deleting the cleanup phase does B reach 9.26%. Nowhere does it reach 85.94%, and "the Python model diffuses the movement nation-wide" is false as the code actually runs. The divergence that does exist is the unit count (3,143 vs 1,676) and the drift denominator, not the end-state numbers quoted.


### 136. `area-graph-recomputed-per-query` — The Area adjacency graph is re-derived with fresh allocations on every single query — and it is the target design's hot loop

- **Severity:** medium  ·  **Category:** performance
- **Where:** `js/game.js, js/actions.js, js/app.js` — lines js/game.js:116-125, 143-148, 149-165, 172-190; js/actions.js:103, 482-492, 598-610; js/app.js:739-755

**Evidence**

```
`function countyNeighbors(fips) { const a = cid(fips); const out = new Set(); for (const m of county[a]?.counties || [a]) for (const nb of adjacency.county[m] || []) { const n = cid(nb); if (n !== a) out.add(n); } return [...out]; }` (game.js:116-125) — no memo, a fresh `Set` and a fresh array per call.
```

**Failure scenario.** The sentiment phase lands. One 50-turn dashboard run performs ~1.8M Set allocations for the neighbour-pull term alone, and the slider stops feeling live.

**Why it matters.** The Area-level neighbour graph is never built. It is re-derived from the county-level graph on every call, and every graph algorithm in the codebase calls it in a loop: `components` (game.js:149-165, once per node), `annexTargets` (143-148), `nearestNation`/`nearestNationForGroup` (172-190), `partialSubset` (actions.js:598-610), `planSplinter`'s `touchesT` (actions.js:103, once per county of the acting nation), `recomputeAnnexSelectable` (actions.js:482-492, re-run on every click during annex selection), and `transitLink` (app.js:739-755, a double loop over one nation's areas × their neighbours). At today's scale it is invisible. At target scale it is the bottleneck: the sentiment model needs a neighbouring-power-pull factor per area per movement — 1,676 areas × ~22 movements per turn — which through this function is roughly 37k `Set` allocations and ~220k map lookups per turn for a single one of the six factors, while the dashboard re-runs 50 turns interactively.

**Fix.** Build the Area neighbour graph once at load as flat typed arrays in CSR form: `Int32Array neighborStart[nAreas+1]`, `Int32Array neighborList`. Every graph query becomes an index-range walk with zero allocation, and `components`/`annexTargets`/`partialSubset` become integer BFS over a `Uint8Array` visited mask. About 30 lines, strictly additive behind the existing `countyNeighbors` signature, and it makes every downstream system cheap — do it first, before anything else in the rearchitecture.

> **Verifier note.** Verified. countyNeighbors (game.js:116-125) is exactly as quoted -- fresh Set, fresh spread array, no memo, and it walks the Area's member list crossing into adjacency.county per member with a cid() resolve per neighbor. Every caller named does call it inside a loop: components (game.js:149-165, once per popped node), annexTargets (143-148, once per owned area), nearestNation (172-179) and nearestNationForGroup (181-190), partialSubset (actions.js:598-610, twice -- seed scan plus BFS), planSplinter's touchesT (actions.js:103, once per county of the acting nation), recomputeAnnexSelectable (actions.js:482-492, re-run on every click via clickAnnex), and transitLink (app.js:739-755, a double loop over one nation's areas x their neighbors). No Area-level adjacency structure is ever built. Medium is the right severity -- it is a forward-looking cost, not a present defect, and the finding says so.


### 137. `no-module-system` — 13 script tags with hand-bumped cache busters and cyclic global reads — convert to native ESM, and accept that it needs a JS runtime installed

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `index.html, all js` — lines index.html:70-84; js/market.js:34,68 vs js/app.js:630; js/editor.js:239-240

**Evidence**

```
`<script src="js/colors.js?v=3"></script>` … `js/game.js?v=25` … `js/mapmodes.js?v=28` … `js/actions.js?v=30` … `js/app.js?v=30`, plus `css/style.css?v=30` (index.html:7,70-84) — 13 classic scripts, ~13 implicit globals, versions maintained by hand.
```

**Failure scenario.** You ship a fix to `world.js` and bump `world.js?v=`, but the fix also changed a field name that `game.js` writes; `game.js?v=25` is unchanged, so returning players get new-world + old-game and a silently wrong simulation until they hard-refresh.

**Why it matters.** Three concrete costs. (a) Forget to bump one `?v=` and a user runs a mixed bundle of old and new modules; the symptom looks like a logic bug and there is no way to detect it. (b) Nothing can be imported in isolation, so there is no unit test and no headless run. (c) Load order is semantics, not just sequencing: `editor.js:239-240` monkey-patches `Leaderboard.refresh` at evaluation time, and `market.js:34` reads a `const` declared later in `app.js:630`, working only because of script order and lazy call timing.

**Fix.** Smallest change that unblocks testing and a headless simulator: native ESM. One `<script type="module" src="js/main.js">`; every file gets explicit `import`/`export`. No bundler, no transpiler, no package.json needed for the browser — `python -m http.server` already serves `.js` with the right MIME type, and ESM caches per-URL, so a single `?v=` on the entry point plus `Cache-Control: no-store` in dev replaces all 13 busters. Costs, stated honestly: (1) ESM is strict-mode with different hoisting, so the cyclic global reads must be broken *first* (see the layering finding) — that untangling is the real work; the syntax change is mechanical. (2) Headless testing needs a JS runtime, and Node is **not currently installed on this machine** (`node --version` → command not found). Installing Node/Deno/Bun is a prerequisite, not an option, and it is the price of the dashboard and simulator the design asks for. (3) `file://` still won't work, but it already doesn't. Do not add a bundler. Do not add TypeScript yet — but do add JSDoc `@typedef` for the state shape, because that is the thing most likely to rot silently.

> **Verifier note.** Small mechanical slip: the market.js/app.js coupling works *despite* market.js loading before app.js, not because of it. Top-level `const` in a classic script creates a script-scoped binding in the shared global lexical environment, so the read at market.js:34 succeeds purely because Market.update() is never invoked until after app.js has evaluated (its only callers are the Advance-world button and the trade resolvers). The finding's operative clause -- "nothing calls update() until app.js has evaluated" -- is the correct half.



## Found by the completeness critic (15 findings)

### 138. `no-win-no-lose-no-elimination` — The game has no win condition, no lose condition, and no elimination feedback — it cannot be won, lost, or finished

- **Severity:** critical  ·  **Category:** game-design
- **Where:** `js/game.js, js/turns.js, js/app.js, js/actions.js, DESIGN.md` — lines js/game.js:236-238, 221, 259; js/turns.js:49-53; js/app.js:358-364; DESIGN.md:201-224

**Evidence**

```
js/game.js:236 `function pruneEmpty() { for (const [id, n] of nations) if (n.counties.size === 0) nations.delete(id); }` — that is the entire death path for a nation. js/turns.js:50 `for (const id of [...order]) if (!Game.nations.has(id)) drop(id);`. js/app.js:359 `if (store.selected.level === 'nation' && !Game.getNation(store.selected.id)) { deselect(); }`. `grep -rni "win condition|gameover|game over|eliminat|defeat" js/*.js` returns only CivilWar's internal `outcome === 'victory'` string — there is no game-end check anywhere. DESIGN.md's roadmap (lines 201-224) does not list one either.
```

**Why it matters.** A strategy game with no terminal state is a sandbox, not a game. Nothing rewards playing well and nothing punishes playing badly. Worse, the one dramatic event the systems can produce — a nation being conquered out of existence — is delivered as a silent `Map.delete()`: the swatch vanishes from the leaderboard, the turn order quietly shortens, and if it was the selected nation the panel just blanks to the placeholder. No toast, no obituary, no history entry. The player cannot tell the difference between 'Wyoming was annihilated' and 'I mis-clicked'. The target design's win conditions (reunification / ideological dominance / economic supremacy / the Reunify-the-Union capstone) have no hook to attach to because there is no end-of-turn evaluation pass at all.

**Fix.** Add a `checkEndConditions()` pass that runs once per world turn in `World.advanceTurn()` (after `tickTreasuries`), evaluating a declarative table of conditions against `Game.nations` and returning `{winner, condition, metrics}` or null. Separately, make elimination an event: have `pruneEmpty()` collect the deleted nation records and return them, and have the caller emit a real message (`⚰️ <name> ceased to exist, absorbed by <largest annexer>`) plus an entry in a new persistent `Game.history` array. That history array is also what the target design's map-history timeline and 'why did this happen?' layer need.


### 139. `no-version-control-395mb-raw-in-tree` — The project is not under version control, has no .gitignore, and carries 395 MB of raw download caches inside the source tree

- **Severity:** critical  ·  **Category:** architecture
- **Where:** `build/raw/, .gitignore (absent), .git (absent)` — lines build/raw/transport/ (279 MB, 51 roads_NN.zip), build/raw/trade/ (80 MB), build/raw/CAGDP2.zip (15 MB)

**Evidence**

```
`ls -d .git` → 'No such file or directory'. `ls .gitignore` → 'No such file or directory'. `du -sh build/raw/*` → `15M CAGDP2.zip`, `1.7M co-est2024-alldata.csv`, `712K county_adjacency.txt`, `348K election2024_counties.csv`, `80M trade`, `279M transport`. Total shipped source is ~150 KB of JS + ~2.5 MB of data/*.json; the raw caches are 150x the entire deliverable. `__pycache__/game_state.cpython-313.pyc` and `build/__pycache__/build_economy.cpython-313.pyc` are also in-tree.
```

**Why it matters.** Every other confirmed finding in this review recommends a change, and the headline verdict is 'REARCHITECT the core'. There is no way to branch, diff, revert, or bisect any of it. A rewrite of world.js or game.js is a one-way door: if the new engine is worse there is no previous engine to go back to. Separately, the moment this does become a repo, `git init && git add .` commits 395 MB of Census road shapefiles and a BEA zip into history permanently, where they cannot be removed without a filter-repo. The raw caches are also undocumented — DESIGN.md §2 says 'everything is baked offline' but never says these 395 MB are the offline inputs and are safe to delete.

**Fix.** `git init` and commit a `.gitignore` FIRST, before adding anything: `build/raw/`, `__pycache__/`, `*.pyc`, `.claude/scheduled_tasks.lock`. Then `git add . && git commit`. Add a `build/raw/README.md` (or a DESIGN.md §2 note) listing each raw artifact, its source URL, its size, and the fact that it is a regenerable cache — the download URLs already exist verbatim in `.claude/settings.local.json`, so the manifest can be lifted from there.


### 140. `world-clock-is-a-manual-unbounded-button` — The entire economy only ticks when a human clicks 'Advance world' — unbounded, free, and callable during any nation's turn

- **Severity:** high  ·  **Category:** game-design
- **Where:** `js/app.js, js/world.js, js/game.js` — lines js/app.js:500, 503; js/world.js:140-160 (esp. 156-158); js/game.js:324-326

**Evidence**

```
js/app.js:503 `document.getElementById('tb-advance').onclick = () => { World.advanceTurn(); onGameChange(); };` — no guard, no cost, no counter, no limit. js/world.js:156-158 `Game.tickTreasuries(); Market.update(); turn += 1;`. Grep confirms `Game.tickTreasuries` has exactly one call site (js/world.js:156) and `World.advanceTurn` has exactly one call site (js/app.js:503). The player-turn loop (`completeTurn`, js/app.js:508-518) never advances the world; it only calls `Game.growAll(0.05)` on a round boundary.
```

**Why it matters.** Two failure modes, both reachable in the first minute. (1) A player who never notices the button plays an entire game in which treasuries never move, prices never reprice, no county ever drifts politically, and no emergent party ever grows — every dynamic system in world.js is dormant and the game is a static map. (2) A player who does notice can hammer it: 200 clicks during Alabama's turn compounds population growth 1%/turn to 7.3x, ticks 200 turns of treasury flow, and advances the market 200 turns, all while it is still Alabama's turn and nobody else has acted. The world clock is not a game mechanic, it is a debug stepper wired to the production UI in the same visual style as 'Pass turn' — the two buttons are adjacent, identically classed `tb-pass`, and one of them is the whole simulation.

**Fix.** Decide the coupling and enforce it. The straightforward version: call `World.advanceTurn()` from inside `completeTurn()` exactly where `Game.growAll(0.05)` is today (js/app.js:511-514), delete `growAll` as the duplicate growth path it is, and demote the button to a dev-only control gated behind a flag — which is also what the target design's 50-turn step-through simulator wants it to be. If world turns are meant to be player-triggerable, they need a treasury price and a per-round cap, and the button must be disabled while `Actions.isActive()`.


### 141. `no-player-identity-51-hotseat-seats` — There is no concept of a player nation anywhere in the codebase — you hot-seat all 51 seats, so nothing is ever yours to lose

- **Severity:** high  ·  **Category:** game-design
- **Where:** `js/app.js, js/turns.js, js/actions.js, js/saves.js` — lines js/app.js:533, 535-548; js/turns.js:27-34; js/saves.js:180

**Evidence**

```
`grep -rni "player\b" js/*.js` returns zero hits across all 13 modules. The only gate on acting is js/app.js:533 `const isTurn = nid === TurnSystem.currentId();` — whoever's slot is up gets the live action buttons, and the human operates every slot. js/turns.js:28 `order = shuffle([...ids]);` shuffles all 51 with no seat assignment. `SaveManager.snapshot()` (js/saves.js:180) serializes `{game, turns, colorMode}` — no seat, because there is none.
```

**Why it matters.** This is the root of the 'not fun' problem, upstream of every balance issue. Because you control the aggressor and the victim, an annexation is not a risk — it is a transfer between two of your own accounts. The blue shell, the annex block on larger same-lean nations, and the unite peace roll are all anti-snowball devices that assume an adversary; with one operator they are speed bumps you route around by simply taking the other nation's turn. And a full round is 51 sequential UI decisions before a single 5% growth tick fires, 50 of which are for nations you have no stake in — the tedium is structural, not a tuning problem. The target design's ~22 playable factions, faction-switch release valve, and difficulty tiers all presuppose a seat concept that does not exist yet.

**Fix.** Add `store.playerNation` (persisted in the save) chosen at boot, and split `TurnSystem` consumers into two paths: the player's slot renders the action panel; every other slot resolves through a headless policy function. Even a trivial stub policy (weighted-random over the legal action set, using the same pure resolvers the UI calls) converts 51 clicks into 1 and makes losses land on someone. This is the same seam `no-headless-action-layer` needs, so build it once.


### 142. `ct-area-borders-drawn-from-obsolete-counties` — The default-visible internal border layer draws Connecticut's obsolete 8 counties over its 9 planning-region fills

- **Severity:** high  ·  **Category:** correctness
- **Where:** `js/app.js` — lines 138-140 (vs. 14-17, 92-102, 116, 168-170)

**Evidence**

```
js/app.js:138-140 `g.append('path').attr('class', 'area-borders').attr('d', path(topojson.mesh(topo, topo.objects.counties, (a, b) => a !== b && Game.areaIdOf(a.id) !== Game.areaIdOf(b.id))));` — this meshes the raw topology and keys the predicate on `Game.areaIdOf`, which does NOT know about CT. Verified from the data: `data/counties-10m.json` objects.counties contains only `['09001','09003','09005','09007','09009','09011','09013','09015']`; `data/game-data.json` contains only `['09110'...'09190']`; `data/areas.json` has zero `09*` entries, so `alias` has no CT keys and `Game.areaIdOf('09001') === '09001'`. Every old-CT pair therefore differs and an arc is drawn between them. The nation-border mesh two lines below gets this right because it uses `meshOwner` (js/app.js:168-170), which applies `OLD_CT_TO_REGION`; the area-border mesh forgot to. js/app.js:116 `svg.classed('hide-clines', true)` makes this layer the visible one by default (css/style.css:222-224).
```

**Why it matters.** On first load — no clicks required — Connecticut renders with eight internal boundaries that belong to a jurisdiction the project deliberately deleted, sitting on top of nine differently-shaped colored fills. The lines do not follow the fill edges, so CT reads as a rendering glitch. This is the single most conspicuous visual defect in the default view, and it is in exactly the state the project went to the most trouble to get right (fetching TIGERweb planning regions, reversing ArcGIS ring winding at js/app.js:97-100). It also undermines the README's and DESIGN.md's headline claim that CT was 'resolved with real data'.

**Fix.** Reuse the existing accessor in the predicate: `const areaKey = (id) => Game.areaIdOf(OLD_CT_TO_REGION[id] || id);` then `topojson.mesh(topo, topo.objects.counties, (a, b) => a !== b && areaKey(a.id) !== areaKey(b.id))`. That collapses the old CT counties onto their planning region and suppresses the spurious interior arcs. Better still, hoist `meshOwner`'s CT normalization into a single `baseGeomToArea(id)` helper and route the area mesh, the nation mesh, and `nationOutline` through it so the three layers cannot drift apart again.


### 143. `design-md-omits-the-trade-action-it-documents-as-unbuilt` — DESIGN.md — written today as 'the single place to look' — lists three actions and misses Trade, then states its systems are unbuilt

- **Severity:** high  ·  **Category:** documentation
- **Where:** `DESIGN.md, js/actions.js, js/game.js` — lines DESIGN.md:83-94, 178-180, 211-217; js/actions.js:181-454; js/game.js:336-342

**Evidence**

```
DESIGN.md:83-94 '### Actions' lists only Unite, Annex, and 'Release counties — not built'. Trade is absent. DESIGN.md:213 says of trade geography 'No trade routes, no blockades, no choke-point control yet' and DESIGN.md:216-217 says of the market 'prices move each turn but nothing yet spends against them (no buying, selling, shortages...)'. Contradicted by js/actions.js:181-454, which is ~270 lines implementing bilateral trade (`tradeFlows`, `confirmTrade`), external export deals to Canada/Mexico/world market (`renderExternalPreview`), and a full transit-toll negotiation with a slider, an AI valuation function (`evalTransit`), and accept/counter/decline verdicts — all priced off `Market.getPrices()`. DESIGN.md:180 'Actions draw from the treasury' is likewise false: `Game.spend` (js/game.js:336) has zero call sites.
```

**Why it matters.** DESIGN.md's own preamble (lines 3-8) positions it as the source of truth that supersedes the stale README, and it was assembled the same day as this review. A planning document that omits the single largest and most-used action, and then affirmatively tells the reader that action's systems do not exist, will send the next work session to build a trade system that already ships — while the real trade defects (free GDP minting, world-market dominance, the unstyled negotiation UI) go unlisted because the doc does not know they are reachable. The 'Actions draw from the treasury' line is worse than an omission: it asserts an economic constraint that is the exact thing the game is missing.

**Fix.** Add a '🚛 Trade with nation' entry to DESIGN.md §4 Actions covering all three sub-flows and their constants (TRADE_GAIN 0.10, TRANSIT_TOLL 0.35, RAIL_DISCOUNT 0.5, HIGHWAY_DISCOUNT 0.2, COUNTER_FLOOR 0.55). Rewrite lines 211-217 to say trade and transport DO drive a mechanic (routes and tolls) and name what is still missing (blockades, choke-point control, capacity, depletion). Change line 180 from 'Actions draw from the treasury' to 'No action currently costs treasury — `Game.spend` is exported but unused' and move it into the roadmap.


### 144. `counties-mode-and-release-are-dead-ends` — Half the primary select toggle and one of the four listed actions lead nowhere: no county-level verb exists at all

- **Severity:** high  ·  **Category:** ux
- **Where:** `js/app.js, js/actions.js, css/style.css` — lines js/app.js:405-410, 581-611, 541; js/actions.js:618-625; css/style.css:242-248

**Evidence**

```
js/app.js:409 `select('county', Game.areaIdOf(d.id));` → `renderCountyPanel` (js/app.js:581-611) which emits Population / GDP / Politics / Economy / Culture / Geography / Trade / Neighbors / est-note / sources — and not one button. js/app.js:541 `<button class="act" data-act="release" disabled title="Coming next">🕊️ Release counties</button>`. js/actions.js:621-625 `function startRelease(nid) { flash('🕊️ Release counties is coming next.', 'warn'); select('nation', nid); } function clickRelease() {}`. css/style.css:242-248 still carries a `.actions-stub` ruleset (with `cursor: not-allowed`) that no JS emits — the fossil of the previous disabled-actions block.
```

**Why it matters.** The header's first control is a two-state toggle where one state is a read-only inspector. A player toggles to Counties expecting county-level agency — the whole target design is county-level (sentiment, defection, voluntary release, autonomy grants) — and finds a data sheet. Meanwhile Release, the one action that would give Counties mode a purpose and the one 'release valve' the target design names first, is a permanently greyed button that has been 'coming next' long enough to appear as 'not built' in three separate docs. So the shipped verb set is really three, all nation-level, of which one (Trade) strictly dominates. There is no move that operates on the unit the player spends most of their time looking at.

**Fix.** Implement Release as the county-level action: it already has a dispatch slot (`startRelease`/`clickRelease`), it reuses the annex selection machinery almost verbatim (`recomputeAnnexSelectable` inverted to your own Areas), and it terminates in `Game.breakApart(chosen, {exclude: nid})` which already exists and already works. That single action gives Counties mode a reason to exist, gives the player a non-dominated alternative to Trade, and is the first target-design release valve. Delete the dead `.actions-stub` block from css/style.css while you are in there.


### 145. `readme-is-a-full-era-stale-and-still-the-error-target` — README.md documents a game two feature-eras old, and it is the file the app's own failure message points users at

- **Severity:** medium  ·  **Category:** documentation
- **Where:** `README.md, js/app.js, index.html` — lines README.md:104, 114-119, 131, 167, 169-172, 174-185; js/app.js:82; index.html:6

**Evidence**

```
README.md:167 'Game state lives in memory only — reload the page to reset' and README.md:169-172 '## Next steps (not built yet) - Release counties. - Save/load game state.' — save/load has shipped (js/saves.js). README.md:116-119 lists four map modes; index.html ships seven. README.md:131 '(Turn state is in memory; reloading reshuffles.)' — `TurnSystem.serialize/loadState` exist. README's code map (174-185) omits world.js, market.js, parties.js, saves.js, editor.js, and every build script except build_adjacency.py. The word 'Area' never appears, so the README still presents the county as the atomic unit. Meanwhile js/app.js:82 `el.textContent = 'Could not load map data. Run a local server (see README).'` — the one moment the app sends a user to a doc, it sends them here. index.html:6 `<title>Nation States &mdash; 50 states, 50 nations</title>` also disagrees with the 51-nation board every other surface reports.
```

**Why it matters.** DESIGN.md:223 acknowledges 'README is stale' and declares itself the source of truth, but leaving a wrong README in place is not neutral — it is the file GitHub renders, the file the error path names, and the file a new contributor opens first. It actively teaches the wrong model (counties not Areas, four modes not seven, no persistence) and its 'not built yet' list advertises work as available that is already done. Two documents disagreeing is worse than one being incomplete.

**Fix.** Cut README.md down to what it is uniquely good at — premise, `python -m http.server 8000`, data provenance and the est. caveats — and replace everything from '## Actions' onward with a one-line pointer to DESIGN.md. Update js/app.js:82 to name DESIGN.md, and fix index.html:6 to '51 states, 51 nations' (or drop the count).


### 146. `action-result-toast-clobbered-by-round-growth` — Every action outcome is flashed and then immediately overwritten by the round-growth toast on a round boundary

- **Severity:** medium  ·  **Category:** ux
- **Where:** `js/actions.js, js/app.js` — lines js/actions.js:132-134, 361-362, 413-414, 452-453, 593-594; js/app.js:478-484, 508-514

**Evidence**

```
js/app.js:478-484 `function flash(html, kind = '') { let el = document.getElementById('toast'); el.className = 'toast show ' + kind; el.innerHTML = html; clearTimeout(flash._t); ... }` — one shared element, one shared timer, no queue. Every action resolver flashes then immediately calls completeTurn: js/actions.js:593-594 `flash(msg, kind); completeTurn();` (annex), and identically at 132-134 (unite), 361-362 (transit), 413-414 (external), 452-453 (bilateral). js/app.js:511-514 `if (TurnSystem.progress().round > beforeRound) { Game.growAll(0.05); flash('📈 Round ...'); }`.
```

**Why it matters.** The result message is the only report the game ever gives. For the civil-war path it is the only place the dice, points, product and score are ever shown — `cwLine(res)` at js/actions.js:634-636 renders `🎲 4 × 6 × 3   12 pts × 72 = 864` and that string exists nowhere else, no log, no panel. When the acting nation is the last in the round order, that line is destroyed within the same tick and replaced by a generic '📈 Round N: every nation grew ~5%'. The player watches their nation fall apart and is told about population growth. It is also non-obvious and unreproducible-looking, because it depends on a shuffled hidden turn order.

**Fix.** Give `flash` a queue, or simply reorder: have the action resolvers return their message to `completeTurn()` and let it emit the growth notice first and the outcome last. The durable fix is the `Game.history` array from the no-win-condition finding — append every outcome to it and render a scrollback panel, so no result is ever ephemeral. That log is also the target design's 'why did this happen?' surface.


### 147. `transit-negotiation-ui-has-no-css` — The most elaborate interaction in the game ships with three CSS classes that do not exist — accept and decline render identically

- **Severity:** medium  ·  **Category:** ux
- **Where:** `js/actions.js, css/style.css` — lines js/actions.js:327-330, 354, 365, 370, 374

**Evidence**

```
js/actions.js emits `<div class="slider-row">` (line 327), `<div class="deal-why">` (line 354), and `<div class="deal-verdict accept">` / `.counter` (370) / `.decline` (374). `grep -n "slider-row|deal-why|deal-verdict" css/style.css` returns nothing — all five selectors are absent from the stylesheet. There is also no `input[type=range]` rule, so the toll slider at line 329 renders with the browser's default light-mode control on the `#161d27` panel.
```

**Why it matters.** This is the one screen in the game with a real negotiation: a slider, an opponent that values your offer by size / need / relations, and three distinct verdicts with reasoning text. All three verdicts render as identical unstyled paragraphs inside the panel — the ✅/↔️/❌ emoji is the only differentiator, with no border, no background, no color. Every other outcome surface in the app is carefully coded (`.warn-box`, `.ok-box`, `.chance.safe` / `.chance.risky`, `.toast.good/warn/bad`), so this one screen reads as unfinished precisely where the game is at its most interesting. The unstyled range input on a dark panel compounds it.

**Fix.** Add the five rules next to the existing `.chance` block (css/style.css:374-379), reusing the established semantics: `.deal-verdict.accept` on the `rgba(59,178,115,.12)` green used by `.ok-box`, `.decline` on the `rgba(224,72,59,.12)` red used by `.warn-box`, `.counter` on `var(--accent)`; `.deal-why` at 13px `var(--muted)`; `.slider-row { margin: 12px 0 }` with `accent-color: var(--accent)` on the range input.


### 148. `archive-log-builder-is-a-foreign-app-in-the-project-root` — archive-log-builder.html is a 33 KB Final Cut Pro XML tool sitting in the game's root directory, referenced by nothing

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `archive-log-builder.html, .claude/launch.json, DESIGN.md` — lines archive-log-builder.html:236-237; .claude/launch.json (archive-log-preview entry); DESIGN.md:245-267

**Evidence**

```
archive-log-builder.html:236-237 `<h1>Archive Log Builder...</h1><p>Load a Final Cut Pro XML exported from Premiere Pro, pick the columns your archive log needs, and export a CSV sorted by record timecode.</p>` — a video-editing utility, nothing to do with Nation States. `grep -rn "archive-log" --include=*.html --include=*.js --include=*.md --include=*.py .` returns zero references outside the file itself; it is not in index.html, not in DESIGN.md's code map (lines 245-267), and not in README's project layout. Its provenance is visible in `.claude/settings.local.json`, whose last allow-entry is a `Copy-Item` from a scratchpad belonging to a different session id (`27c1f570-...`) — and `.claude/launch.json` still carries an `archive-log-preview` server pointed at that now-deleted scratchpad directory.
```

**Why it matters.** It is the single largest HTML file in the project (33 KB vs index.html's 3 KB) and the first thing an alphabetical directory listing shows after the two markdown files, so every reader — human or agent — has to work out whether it is part of the game. It is not. Its stray launch config is also broken: the temp directory it serves belongs to a finished session and no longer exists, so anyone selecting that config gets a server on port 8765 with nothing behind it. Untracked, undocumented cross-project spill is exactly the kind of thing that becomes permanent once git is finally initialized.

**Fix.** Move archive-log-builder.html out of this project (it belongs wherever the video-editing work lives), delete the `archive-log-preview` entry from .claude/launch.json, and add it to the .gitignore you create for the version-control finding in case another copy lands. If it must stay, it needs a line in DESIGN.md §7 saying what it is and that it is unrelated to the game.


### 149. `launch-json-carries-foreign-and-broken-configs` — .claude/launch.json — which DESIGN.md points users at — has two of three configs belonging to other projects, one of them broken

- **Severity:** medium  ·  **Category:** architecture
- **Where:** `.claude/launch.json, DESIGN.md` — lines .claude/launch.json:8-19; DESIGN.md:236

**Evidence**

```
.claude/launch.json config 2: `{"name":"resume-engine-ui","runtimeExecutable":"python","runtimeArgs":["C:\\Users\\aaron\\resume-engine\\scripts\\serve.py"],"port":8020}` — a different project entirely. Config 3: `{"name":"archive-log-preview", ... "--directory","C:\\Users\\aaron\\AppData\\Local\\Temp\\claude\\C--Users-aaron-Nation-States\\27c1f570-0c62-4479-b824-308f6ee4d609\\scratchpad"], "port":8765}` — an absolute path into a session-scoped temp scratchpad (session `27c1f570-...`, not the current one) that no longer exists. DESIGN.md:236 'A VS Code launch config for this is in `.claude/launch.json` as `nation-states`.'
```

**Why it matters.** DESIGN.md sends the reader to this file as the sanctioned way to run the game, and two thirds of what they find there is unrelated — one launching an unrelated web app on port 8020, one serving a deleted temp folder. Picking the wrong entry produces either someone else's project or a dead server, with no error explaining why. It also silently documents that this project's tooling config is shared scratch space rather than project config.

**Fix.** Reduce .claude/launch.json to the single `nation-states` entry. Keep per-project launch configs in their own projects.


### 150. `dead-exports-and-a-never-written-attrs-field` — Seven exported symbols have zero call sites, and `attrs` is a placeholder field that is written to every save but never populated

- **Severity:** medium  ·  **Category:** correctness
- **Where:** `js/game.js, js/turns.js, js/colors.js, js/parties.js, js/world.js` — lines js/game.js:143-148, 172-180, 46, 347, 355, 376, 394, 398; js/turns.js:79, 89; js/colors.js:11, 36; js/parties.js:83; js/world.js:162-170

**Evidence**

```
Zero-call-site exports, verified by grep across js/ and game_state.py: `Game.annexTargets` (defined js/game.js:143, exported 394 — the annex flow uses its own `recomputeAnnexSelectable` at js/actions.js:482-492 instead, duplicating the traversal with extra filters), `Game.nearestNation` (172, exported 398 — only `nearestNationForGroup` is used), `Game.areaAttrs` (376), `TurnSystem.snapshot` (js/turns.js:79 — `serialize` at line 81 is the one that ships), `Colors.map` (js/colors.js:36 — leaks the private palette table), `Parties.getSpawned` (js/parties.js:83), and all five phase functions re-exported from `World` (js/world.js:165-169) which nothing outside advanceTurn calls. Separately js/game.js:46 `attrs: {}` is initialized on all 1,676 Areas and round-tripped at js/game.js:347 (`a: { ...c.attrs }`) and 355, but grep shows no assignment to `.attrs` anywhere in js/ — it is written empty into every county record of every save.
```

**Why it matters.** `annexTargets` and `nearestNation` are not harmless: they are plausible-looking, correctly-named alternatives to the functions actually in use, so the next person to touch annexation or fragment placement will reach for them and get subtly different behaviour (no `blocked` filter, no `chosen` frontier). `Colors.map` exposes mutable internal state as a public handle. And `attrs` is the field DESIGN.md and the game.js header comment both nominate as the home for 'region tags, resources, terrain, modifiers' — the target design's per-county sentiment factors — which means the schema slot the redesign depends on has been shipping empty and unexercised through every save since it was added.

**Fix.** Delete `annexTargets`, `nearestNation`, `TurnSystem.snapshot`, `Colors.map`, `Parties.getSpawned`, and the five `World.phase*` re-exports; keep the phase functions module-private until a test harness actually imports them. For `attrs`: either populate it now (it is the natural place for the Area's cultural/geographic/economy node ids currently re-derived per render from the mapmode JSONs) or drop it from `serialize`/`loadState` so saves stop carrying 1,676 empty objects.


### 151. `world-js-docstring-says-the-phases-are-stubs` — world.js's top-of-file docstring tells the reader the phases are unimplemented, directly above 130 lines implementing them

- **Severity:** low  ·  **Category:** documentation
- **Where:** `js/world.js` — lines 12

**Evidence**

```
js/world.js:12 `* The phases are stubs for now, to be filled in next.` — the final line of the module docstring. Immediately below it, lines 24-138 implement `phaseRecomputeLeans`, `phasePoliticalDrift`, `phasePopulationGrowth`, `phasePartyGrowth` and `phaseCleanup` in full, and DESIGN.md:118-133 documents all five as built with their real constants.
```

**Why it matters.** This is the docstring on the file that owns the entire simulation, and it is the first thing anyone auditing the world model reads. It says the model does not exist. Combined with the same docstring's double-buffering claim — which the review already confirmed is false for three of the four phases — the header of world.js is now wrong about both what is implemented and how it is implemented, which is the worst possible state for the file the redesign has to start from.

**Fix.** Delete line 12 and rewrite the double-buffering paragraph (lines 6-11) to describe the actual discipline: leans are cached from `snap`, drift reads `snap`, party growth and population growth read `nxt` written by earlier phases, and ownership is read live from `Game.getOwner`. An accurate header is a prerequisite for anyone trusting the fix.


### 152. `toast-is-not-announced-and-toggles-lack-state` — The only feedback channel in the game has no aria-live, the toggle buttons expose no pressed state, and the map has no accessible name

- **Severity:** low  ·  **Category:** ux
- **Where:** `index.html, js/app.js` — lines index.html:19, 27, 40, 59-62; js/app.js:478-484, 109-118

**Evidence**

```
index.html:62 `<div class="toast" id="toast"></div>` — no `role="status"`, no `aria-live`. js/app.js:480-482 sets `el.innerHTML = html` on that div, which is how every action outcome, every civil-war dice line, and every error reaches the player. The three `role="group" aria-label="..."` wrappers (index.html:19, 27, 40) contain buttons whose selected state is carried only by a CSS class — `b.classList.toggle('active', ...)` at js/app.js:198 and 469 — with no `aria-pressed`. The SVG built at js/app.js:109-118 gets `class`, `viewBox` and `preserveAspectRatio` but no `role`, no `aria-label`, and no text alternative.
```

**Why it matters.** Toast text is not merely decorative here — it is the sole report of what an action did, it never persists (6 s timer, js/app.js:483), and there is no log to recover it from. A screen-reader user gets no announcement of it at all, so the game is unplayable rather than merely awkward. The `aria-label`s already on the toggle groups show the intent was there; the per-button state and the live region were just missed. This sits alongside the already-confirmed absence of focus styles, an Escape handler, and any keyboard route to the map.

**Fix.** Add `role="status" aria-live="polite" aria-atomic="true"` to `#toast` (polite, not assertive — outcomes are not interruptions). Set `aria-pressed` alongside every `classList.toggle('active', ...)` in setColorMode (js/app.js:198), setMode (469) and the county-lines handler (461). Give the SVG `role="img"` plus an `aria-label` naming the current color mode, updated from `setColorMode`.



---

# Target-design gap analysis

One entry per system in the target design. `evidence` = what exists today and is reusable;
`why it matters` = what blocks it; `fix` = the plan and rough size.

### G1. county-sentiment — Does not exist in any form — and the runtime unit is the Area (1676), not the county (3143), so decide the unit before writing a line of it

- **Blocking:** `js/game.js, js/world.js`

**Exists today.** (a) REUSABLE: every area record already carries `ext: {}` and `attrs: {}` (game.js:44-46), both serialized (`e:`/`a:` in Game.serialize game.js:347) and restored (game.js:355) — the only extension points in the model. `Game.leanOf(fips)` (game.js:79-88) is the sole per-unit derived political signal. `World.advanceTurn` (world.js:140-160) is a working double-buffered snap/nxt phase pipeline with 4 phases and the exact discipline sentiment needs. `Game.countyNeighbors` (game.js:116-125) gives Area-level adjacency for the neighbor-pull factor. (b) MISSING: no sentiment field, no factor computation, no term named authority/qol/liberty/pull anywhere in js/ or game_state.py. (c) BLOCKER: Game.init lines 51-65 collapse 3143 counties into 1676 Areas and `delete county[m]` destroys member-county pop/GDP/vote at runtime; they survive only in the read-only data/game-data.json.

**Blocked by.** Sentiment is the spine of the whole target design and 5 of its 6 factors have no input at all: nation power exists only as ad-hoc pop/GDP sums, and Authority, QoL, Civil Liberties and neighbor-pull do not exist as state. Worse, 'county-level sentiment' is ambiguous in this codebase — economy.json, both .mapmode.json files, and the render loop all key on the 1676 Area ids, so choosing true counties silently invalidates four baked data files and the paint path.

**Plan.** Commit to the AREA as the sentiment unit (all baked layers already key on it; going to 3143 means rebuilding areas.json consumers, economy.json, geographical/cultural.mapmode.json and the merge-aware border mesh in app.js:138-145). Add `sent: {v, prev, f:{party,power,authority,qol,liberty,pull}}` beside `attrs` on each area record, serialize it in game.js:347/355, and add `phaseSentiment(snap, nxt, nationIdx)` to world.js inserted after phaseRecomputeLeans and before drift, reading only from snap. Each factor function returns `{value, weight, note}` so the explanation layer and the dashboard get their data free. Damp with `v = v + STEP*(target - v)` in the same self-limiting style as phasePoliticalDrift. Size: L (the phase is M; the four missing nation-level inputs below are what make it L).


### G2. authority — Nothing exists — the nation record has 7 fields and no history, so age/annexations/losses cannot even be counted

- **Blocking:** `js/game.js`

**Exists today.** (a) REUSABLE: the nation record `{id, name, color, counties:Set, origin, treasury, gov}` (game.js:67, 231) is the one place to hang it, and it is fully serialized (game.js:349) and restored (game.js:360). `Game.blueShell` (game.js:199-205) proves the pattern of a derived 0..1 national scalar. (b) MISSING: no authority value, no founding turn, no annexation counter, no territory-loss counter, no per-nation history at all. (c) BLOCKER: `moveCounties` (game.js:211-223) is the single choke point through which every territorial change flows (annex, unite, breakApart, releases) and it records nothing — it mutates two Sets and emits. There is no turn stamp available to it either: World.turn is a module-private counter in world.js:15.

**Blocked by.** Authority is one of two headline power axes and a sentiment factor, and it is defined by history (age of nation, annexations, losses) that this codebase throws away at the moment it happens. Every consumer downstream — sentiment, coalitions, the reunification win condition's Authority floor, occupation cost — is blocked on this one gap.

**Plan.** Add `founded:<worldTurn>`, `annexed:0`, `lost:0`, `authority:0` to the nation record at game.js:67/231; make World.turn readable from Game (or pass a clock into moveCounties). Instrument `moveCounties` to increment `to.annexed` / `from.lost` by county count and stamp `lastChange`. Derive `authority = f(age, recent annex/loss ratio, treasury solvency, military)` in a new js/power.js exported as `Power.authority(nid)`, cached per turn like phaseRecomputeLeans does for leans. Size: M.


### G3. six-ideology-model — Half-present as a colour taxonomy over an open-ended party list; the underlying data model is a hardcoded D/R/Other triple wired into 8 of 13 JS files

- **Blocking:** `js/parties.js, js/game.js, js/world.js, game_state.py`

**Exists today.** (a) REUSABLE: `GROUP_COLORS` (parties.js:24-27) already defines exactly SIX families (red/orange/yellow/green/blue/purple), `PARTY_GROUP` (parties.js:28-37) maps 8 named parties into them, and `Parties.blocs(demo)` (parties.js:43-54) pools same-colour parties into a coalition share and sorts them — the six-ideology reduction already runs in the UI (app.js renderPolitics renders the 'Leans <bloc>' pill from it). data/parties.json ships 16 named parties with real county lists. (b) MISSING: the two axes — no party carries axis coordinates, 'yellow' is literally the fallback for anything unlisted (parties.js:38), and there is no ideological-distance metric. (c) BLOCKER: 52 direct demPop/gopPop/othPop references plus 14 `.dem`/`.gop` reads across game.js, parties.js, world.js, civilwar.js, actions.js, app.js, leaderboard.js and mapmodes.js — including all four world phases (world.js:24-138), the civil-war trigger and dice count (civilwar.js:26-41), planSplinter/partialSubset (actions.js:99-110, 596-604), applyCivilWarCost's ruling-party logic (game.js:265-278), growAll (game.js:293-311, which grows only the triple and never `ext`), and the mirror in game_state.py:19-20.

**Blocked by.** Every mechanic in the target design keys off ideology — sentiment's party-majority factor, movements, civil-liberties alignment, ideological-dominance victory. This refactor touches more files than any other change here, so doing it late means redoing sentiment, secession and the AI on top of it.

**Plan.** Replace `{demPop,gopPop,othPop,ext}` with a single `pop: {ideologyId -> headcount}` map on the area record, preserving the invariant sum(pop) == population that game_state.py:109-115 already enforces. Define the six ideologies once in data/ideologies.json as `{id, name, color, axis:[x,y]}`, map the 16 existing data/parties.json entries onto them (PARTY_GROUP already covers 8), and give every consumer `Ideo.share(area,id)` / `Ideo.distance(a,b)` accessors instead of field access. Do this FIRST, before sentiment. Size: XL (mechanical but wide: ~66 call sites plus the Python mirror).


### G4. ai-opponents — Zero AI; 51 hot seats, and action resolution is fused to the DOM so no move can be made headlessly

- **Blocking:** `js/actions.js, js/app.js, js/turns.js`

**Exists today.** (a) REUSABLE: the DECISION math is already separated from the UI in exactly the places an AI needs — `CivilWar.unitePeaceChance(S,T,shell)` (civilwar.js:59-68), `CivilWar.assess/resolve` (civilwar.js:22-56), `Game.blueShell` (game.js:199), `Game.annexTargets(nid)` (game.js:143-148), `Game.adjacentNations(nid)` (game.js:132-142), `Market.nationSurplus` (market.js:55-70) and `evalTransit` (actions.js:276) are all pure functions over the model. (b) MISSING: every AI — no evaluator, no action selection, no personality, no auto-advance. (c) BLOCKER: action APPLICATION is fused to the DOM. `confirmUniteAttempt` (actions.js:113-135), `confirmAnnex` (actions.js:550-595) and `confirmTrade` (actions.js:444-455) each read the module-global `A` (populated only by map clicks via clickAnnex actions.js:495-512), then call `flash()`, `setPanel()` and `completeTurn()`.

**Blocked by.** AI is the single largest missing system and it is blocked by the largest refactor. Nothing about the target's 22 factions works without it, and the 50-turn step-through simulator cannot run at all without AI decisions driving the turns it is stepping through.

**Plan.** Split js/actions.js into `js/moves.js` (pure: `Moves.unite(state,S,T)`, `Moves.annex(state,nid,areaIds)`, `Moves.release(...)` — each validates, mutates and RETURNS a result object; no DOM, no flash, no completeTurn) and keep actions.js as the UI that collects a selection, calls Moves.*, and renders the returned result. Then `js/ai.js` scores candidate Moves with the existing pure evaluators and picks one. Add a per-seat `controller: 'human'|'ai'` and auto-run AI seats from completeTurn. Size: XL (the split is L, the AI itself is L).


### G5. single-source-of-truth — Four disjoint stores, none writable in place — and the Python mirror has already diverged from the JS model

- **Blocking:** `js/game.js, js/saves.js, js/editor.js, game_state.py`

**Exists today.** (a) REUSABLE: `Game.serialize()/loadState()` (game.js:345-365) is a clean, complete, plain-JSON round trip of the county+nation model, and game_state.py:320-330 has a working `roundtrip_guard`. The editor already emits a well-formed `{type:'ns-mapmode', name, requireAll, nodes, assign}` document (editor.js:105). (b) MISSING: one persistent JSON that editor + game + tooling read and WRITE. (c) BLOCKERS, five of them: runtime state lives in IIFE closures (`const county = {}`, `const nations = new Map()`, game.js:14-15) so it is private, not a document; saves go to localStorage under `ns_save_<name>` (saves.js:7-13), invisible to Python tooling; `Editor.publish()` (editor.js:101-112) triggers a browser DOWNLOAD the user must hand-copy into data/; editor drafts live under a separate `ns_mapmode_` prefix (editor.js:20); and game_state.py has diverged — it models `county['owner']` as a bare string with no nation entity, no Areas (its `area()` at :122 is a 1:1 stub while the JS actually merges 1950 counties away), no treasury, no colour, no GDP growth.

**Blocked by.** The target design names this explicitly, and every downstream tool — dashboard, simulator, timeline, AI tuning, tests — needs to read and write the same document. The Python divergence is the concrete warning: two hand-maintained models of one game have already drifted apart.

**Plan.** Define data/state.json as THE document (`{meta, tune, seed, ideologies, movements, areas, nations, relations, turn, history, player}`); Game.init hydrates from it and Game.serialize emits it. Replace `python -m http.server` (.claude/launch.json) with a ~40-line Python server exposing GET/PUT /state.json and /mapmode/<name>, so the editor's Publish and the game's Save both write in place. Then delete the duplicated model in game_state.py and make it a thin reader/writer of the same document, keeping roundtrip_guard as the invariant test. Size: M for the file + server, L including the game_state.py reconciliation.


### G6. determinism-seeding — Not seeded and not reproducible — five bare Math.random() sites, two of which fire at boot and cannot be replayed

- **Blocking:** `js/parties.js, js/civilwar.js, js/turns.js, js/actions.js, js/saves.js`

**Exists today.** (a) REUSABLE: randomness is already funnelled through exactly five call sites — Math.random() at parties.js:59 (spawn chance), parties.js:69 (initial share), civilwar.js:19 (dice roll), turns.js:21 (Fisher-Yates shuffle) and actions.js:120 (peace roll). Swapping them for a seeded PRNG is a five-line change. game_state.py:59 already threads an `rng=random` parameter through spawn_regional_parties — the right pattern, in the wrong language. (b) MISSING: any seed, any PRNG, any RNG state in saves. (c) BLOCKER: `Parties.setup(partyDefs)` runs inside init() (app.js:63) on EVERY page load and re-rolls all 16 party spawns, and `TurnSystem.begin` (app.js:69) re-shuffles the seat order; neither the seed nor a stream position is in `SaveManager.snapshot` (saves.js:9), so a save/load reproduces current numbers but not the game. Colors' `gen` counter (colors.js:28) is likewise unserialized, so nations minted in play change colour after a reload.

**Blocked by.** The owner wants a step-through simulator to expose runaway spirals and a set of deterministic vs RNG-seeded movements — both are meaningless without reproducible runs. Seeding is a design requirement here, not just a testing convenience.

**Plan.** Add js/rng.js with a small seedable PRNG (mulberry32/xorshift) and NAMED streams — `RNG.stream('parties'|'dice'|'turnorder'|'movements')` — so adding a call site to one system does not shift another's sequence; replace all five Math.random() sites. Persist `seed` plus each stream's counter in SaveManager.snapshot and Game.serialize, and serialize Colors' `gen`. Do this EARLY: it costs an hour and makes every later system testable. Size: S.


### G7. tests — None exist for the game; the only assertion in the repo guards a Python model that has diverged, and there is no module system for a JS runner to import

- **Blocking:** `game_state.py, index.html`

**Exists today.** (a) REUSABLE: `game_state.roundtrip_guard(state)` (game_state.py:320-330) is a real invariant test (save+load reproduces state, nation population and lean unchanged) with a __main__ runner, and `_counts_from_percentages` (game_state.py:109-115) encodes the core invariant sum(parties)==population with explicit drift absorption. The JS side has genuinely testable pure modules: CivilWar (no DOM), all five World phases (world.js:162-170), Market.update, and Game's graph helpers (components, breakApart, nearestNationForGroup). (b) MISSING: any JS test whatsoever; no assertion anywhere that county party counts sum to population — Parties.setup (parties.js:70-75) and phasePartyGrowth (world.js:113-117) both renormalize by hand with no check. (c) BLOCKER: no build step and no module system — index.html:73-85 loads 13 IIFE globals in a hand-maintained order with manual cache busting, so nothing is importable without either adding a build step or loading the files as globals in a VM.

**Blocked by.** The target design multiplies the number of interacting numeric systems by roughly five. Without an invariant harness, every new factor is a chance to break the population and GDP conservation the model depends on, and the step-through simulator will produce confident, wrong graphs.

**Plan.** Add a zero-dependency runner (a node script loading the IIFE files via `vm`, plus a tests/run.html for in-browser checks) covering: population conservation across all five World phases; sum(parties)==pop after Parties.setup and after growth; breakApart contiguity and MIN_NATION; serialize/loadState round trip (mirroring roundtrip_guard); and CivilWar.resolve outcome boundaries under a seeded RNG. Fix growAll's ext omission as the first test's first red. Size: M.


### G8. architectural-spine — The minimum spine is five new modules and three surgical extractions — every remaining target system then plugs into it as a leaf

- **Blocking:** `js/game.js, js/actions.js, js/world.js, index.html`

**Exists today.** The codebase already has the right SHAPE in three places and the wrong shape in three others. Right: World's snap/nxt phase pipeline (world.js:140-160) is the correct home for every per-turn system; CivilWar (civilwar.js) is a pure resolver with no DOM; Game.serialize/loadState (game.js:345-365) is a clean document boundary. Wrong: state lives in IIFE closures (game.js:14-15); tunables are private consts across five files; and action resolution is fused to the DOM inside Actions' confirm* functions (actions.js:113-135, 444-455, 550-595).

**Blocked by.** Nine target systems (sentiment, authority, influence, QoL, liberties, coalitions, occupation cost, weariness, events) are per-turn scalar computations that all want the same three things: a slot in the turn pipeline, a mutable tunables object, and a why-trace convention. Three more (AI, simulator, faction-switch) all want one thing: action resolution callable without a DOM. Building the spine first makes each of those a small independent addition; skipping it means each one invents its own hook and the last few become rewrites.

**Plan.** MINIMUM SPINE. (1) js/rng.js — seeded named RNG streams replacing the five Math.random sites, seed persisted in saves [S]. (2) js/tunables.js — one mutable TUNE object holding every constant now buried in world.js:18-20, game.js:26-28/240/271/282, civilwar.js:52, market.js:15, actions.js:184-192 and app.js:630 [S]. (3) js/model.js — the state document: promote Game's closure vars into an explicit `state` = {meta, tune, seed, ideologies, movements, areas:{id -> {pop:{ideoId->n}, gdp, attrs, sent}}, nations:{id -> {name, color, counties, gov:{type,rulingIdeology}, treasury, founded, annexed, lost, authority, influence, qol, liberties, weariness, military, leader}}, relations, turn, history, player}, loaded from and written back to data/state.json through a tiny write-capable local server. This is where the six-ideology `pop`-map refactor lands [L]. (4) js/power.js — Power.authority/influence/qol/liberties(nid), each returning a Why record {value, inputs:[{label,raw,weight,contribution}], summary}, cached once per turn [M]. (5) js/moves.js — pure Moves.unite/annex/release/suppress/grantAutonomy/changeParty(state, ...) extracted out of Actions' confirm* functions and returning result objects; actions.js becomes UI only [L]. Then extend World.advanceTurn to [recomputeLeans, power, sentiment, movements, secessionCheck, drift, growth, economy, events, cleanup], each phase reading snap and emitting Why records into state.lastTurnWhy, and give phases an explicit ctx so Sim.run(clone, 50, tune) is possible. Everything else is then a leaf: coalitions and rivalries read state.relations; occupation cost is one term in treasuryFlow; the timeline appends the diff moveCounties already sees; the dashboard binds sliders to TUNE and charts the Why records; the AI scores Moves. Size: L-XL for the spine, and it removes the XL from most of what follows.


### G9. build-sequence — Ordered plan: spine first, prove the entire loop on the West, instrument before tuning, AI last — 6 milestones

- **Blocking:** `js/rng.js, js/tunables.js, js/model.js, js/power.js, js/moves.js, js/movements.js, js/ai.js (all new); js/world.js; build/build_parties.py`

**Exists today.** The West is the right first slice for a reason visible in the data, not just in the design: build_areas.py:26 exempts 13 western states (02,04,06,08,15,16,30,32,35,41,49,53,56) from the merge threshold, so western Areas ARE real counties — county-level sentiment there is literally county-level with no Area-merge ambiguity. The West also already carries five authored movement homelands in build_parties.py (Cascadian Separatists :58 with NORTHERN_CA :39-40, Deseret :66 with DESERET_FIPS :44-45, New Absaroka :71 with ABSAROKA :50-52, Northern Christian Kingdom :73-74, El Paso United :72), covers both headline factions' home ground (A Free Texas :65 and NORTHERN_CA for the California-5), and Greater Idaho / Jefferson are trivial additions to that same table. Fewer live nations also keeps the O(nations x counties) recomputes in blueShell (game.js:200) and Leaderboard.rows (leaderboard.js:9) cheap while the loop is being tuned.

**Blocked by.** The dependency graph is strict: ideology refactor -> sentiment -> secession -> release valves -> win conditions, with RNG, tunables and the why-trace convention needed by all of them, and Moves needed before AI. Any other order means writing the sentiment phase twice — once for ideologies and once for traces.

**Plan.** M0 FOUNDATION [S-M]: js/rng.js seeded streams (5 call sites) + js/tunables.js (every const) + serialize World.turn and Colors.gen into saves (fixes a live save/load bug) + the JS invariant test harness + Game.batch() to stop the per-mutation full repaint. Nothing user-visible; everything after depends on it.
M1 MODEL [L]: the six-ideology refactor — `pop:{ideoId->n}` replaces demPop/gopPop/othPop across ~66 sites plus game_state.py; data/ideologies.json with 2-axis coordinates; promote Game's closure state into the data/state.json document behind a write-capable local server; reconcile or delete game_state.py's divergent model.
M2 POWER [M]: js/power.js — Authority (instrument founded/annexed/lost into moveCounties), Influence (promote evalTransit's math), QoL (Market.nationSurplus with DEMAND_SHARE moved out of app.js), Civil Liberties (needs nation.gov.rulingIdeology). Every function returns a Why record; that convention makes M4 nearly free.
M3 WEST VERTICAL SLICE [L] — the proof: scope the scenario to the 13 western states; add phaseSentiment with all 6 factors to World.advanceTurn; add js/movements.js with Cascadia, Deseret, Greater Idaho and Jefferson (deterministic) plus Absaroka and Native American Confederation (seeded, capped) built from the existing build_parties.py table; wire two-tier secession by pointing the EXISTING Game.breakApart + TurnSystem.insertAfter at the sentiment threshold; ship voluntary release and party change (the two cheapest valves); make occupation cost sentiment-scaled (one line in treasuryFlow). Playable end to end on one region.
M4 INSTRUMENT [M] — before tuning anything: the dev dashboard (sliders bound to TUNE, formula panel reading Why records) and the 50-turn headless simulator graphing Authority/Sentiment/Influence. Tune the West with it. This precedes M5 because runaway spirals are cheapest to find with no AI noise in the loop.
M5 AGENCY [XL]: extract js/moves.js out of Actions' confirm* functions, then js/ai.js scoring Moves with the existing pure evaluators; per-seat controller flag; faction selection and faction-switch (store.player); military, suppression and autonomy valves.
M6 DEPTH AND WIDEN [L]: relations/rivalries/coalitions replacing raw blueShell; war weariness; events and crises; leaders; the history timeline; win conditions including the Reunify capstone; THEN extend the scenario east — where the merge means sentiment operates on 483 merged Areas and the eastern movements (Franklin, Acadiana, New England Revivalist, Central States Union, Great Lakes) need homelands baked. Widening last keeps the merge ambiguity a data question rather than a design question.


### G10. influence — Absent, but the trade/transit negotiation already computes an ad-hoc, stateless version of it that should be promoted

- **Blocking:** `js/actions.js, js/game.js`

**Exists today.** (a) REUSABLE: `evalTransit(S,T,base,total)` (actions.js:276-289) already computes exactly the ingredients of soft power — relative GDP share (`relSize`), political alignment (`rel`), and economic need (`need`) — and `transitReasons` (actions.js:290-299) already turns them into player-facing sentences. Trade deals already move real value between nations via `Game.boostGdp` (game.js:328). (b) MISSING: no persistent influence value, no influence projection onto neighbors' counties, no soft-power actions. (c) BLOCKER: evalTransit's numbers are recomputed inline per dialog and thrown away; nothing persists between turns, and nothing outside the trade panel can read them.

**Blocked by.** Influence is the second headline power axis, feeds the neighbor-pull sentiment factor and the 'ideological dominance' win condition, and gates the reunification capstone's Influence floor. Leaving it as throwaway locals inside one UI function means the sentiment phase and any AI have nothing to read.

**Plan.** Extract the evalTransit math into `Power.influence(nid)` in the new js/power.js, persisted on the nation record and recomputed once per world turn from trade partners, shared ideology across the border, GDP share and treasury. Have evalTransit call it instead of recomputing. The neighbor-pull sentiment factor then reads `Power.influence(neighborNation)` weighted by shared border length (Game.countyNeighbors already gives the border tally, see nearestNation game.js:172-180). Size: M.


### G11. quality-of-life — Missing entirely; the six-sector economy is the input it needs but food/healthcare are not modelled as needs and its demand table is stranded in the UI layer

- **Blocking:** `js/market.js, js/app.js, data/economy.json`

**Exists today.** (a) REUSABLE: the six-sector production model is real and live — data/economy.json gives each of 1676 Areas a 6-vector, `Market.update()` (market.js:17-38) rescales it by LIVE GDP each turn, and `Market.nationSurplus(nid)` (market.js:55-70) already produces per-nation surplus/deficit against `DEMAND_SHARE` (app.js:630). That is precisely a 'can this nation feed and supply itself' signal. (b) MISSING: no QoL scalar, no food/healthcare dimension (healthcare is not one of the six sectors), no decoupling from raw GDP. (c) BLOCKER: DEMAND_SHARE lives as a bare const in app.js:630 — the UI file — while Market and the world engine both need it; and market prices are display-only (DESIGN.md roadmap: 'nothing yet spends against them').

**Blocked by.** QoL is a sentiment factor explicitly specified as decoupled from GDP, so it cannot just be another GDP read. The one data source that could decouple it (sector surplus vs population need) is currently trapped behind a UI-file constant and a display-only market.

**Plan.** Move DEMAND_SHARE out of app.js into the shared tunables module. Define `Power.qol(nid) = w1*foodSecurity + w2*healthProxy + w3*itAccess + w4*gdpPerCapita`, where foodSecurity = Agriculture surplus vs population need from Market.nationSurplus, itAccess = IT share of output, gdpPerCapita = live GDP / live pop, and healthProxy = gdpPerCapita x a government-type modifier until a healthcare sector is added to build_economy.py. Cache per turn alongside authority/influence. Size: M (S if healthcare stays a proxy).


### G12. civil-liberties — Nothing exists — and there is no 'aligned vs misaligned population' to measure because a nation has no ruling ideology

- **Blocking:** `js/game.js`

**Exists today.** (a) REUSABLE: `nation.gov` already exists on every nation (game.js:67, 231), is serialized (game.js:349) and restored (game.js:360). `Parties.blocs(demo)` (parties.js:43-54) already computes which colour bloc leads a nation — the raw material for a ruling ideology. (b) MISSING: positive vs negative freedoms, any liberty scalar, and any link between the ruling party and the population's alignment. (c) BLOCKER: `GOV_TYPES = { Republic: 0.015 }` (game.js:27) is a single-entry placeholder whose only use is the maintenance-rate lookup in treasuryFlow (game.js:321). Nothing establishes a Government in the target-design sense (the ruling party of a nation); DESIGN.md lists this as an open roadmap item.

**Blocked by.** Civil Liberties is a sentiment factor defined as aligned-vs-misaligned population under the ruling government. With no ruling-ideology field there is no 'aligned' to measure against, so the factor cannot be written at all — and the same missing field blocks the ideological-dominance win condition and the party-change release valve.

**Plan.** Add `gov: {type, rulingIdeology}` to the nation record; set rulingIdeology at setup from `Parties.blocs(Game.nationDemographics(nid))[0]` and change it only via events, elections or the party-change valve. Define `Power.liberties(nid) = base(govType) + positiveFreedoms - negativeFreedoms`, and compute per-area misalignment as the population share NOT in the ruling ideology (already derivable from leanOf().extPct + dem/gop). Expand GOV_TYPES into a real table (income rate, maintenance rate, liberty base, suppression capacity). Size: M.


### G13. movements-homelands — The homeland geometry already exists as 16 baked county lists; the Movement entity, the seeded growth and the size caps do not

- **Blocking:** `build/build_parties.py, js/parties.js, js/world.js, data/parties.json`

**Exists today.** (a) REUSABLE: build/build_parties.py REGIONS (build_parties.py:57-76) is exactly the homeland authoring table the target needs, with rule fields (states/min_pop/max_pop/lean/fips/mt_interior) and hand lists already written for Deseret (DESERET_FIPS build_parties.py:44-45), Cascadia (:58 + NORTHERN_CA :39-40), New Confederacy (CONFEDERACY :33), Great Lakes (:46-53), Absaroka (:50-52), El Paso United (:54-55), New England United. data/parties.json bakes all 16 into concrete county lists. `Parties.setup(defs)` (parties.js:56-84) already rolls a spawn chance and seeds an initial share with an exact-sum absorption rule. (b) MISSING: 6 of the target's named movements (Greater Idaho, Jefferson, Franklin, Central States Union, Acadiana, Alberta Unification, Native American Confederation; 'New England United' is not the Revivalist movement). No Movement entity = ideology + homeland; no deterministic vs RNG-seeded distinction; no grow-from-a-seed with a size cap. (c) BLOCKER: Parties is spawn-once — `Parties.setup` is called exactly once (app.js:63) and nothing calls into it afterwards except colorOf/blocs for rendering. Growth is handled generically by `World.phasePartyGrowth` (world.js:94-119), which eases EVERY emergent party toward a flat 35% ceiling in every county it already exists in, with no geography, no seed, no cap and no contiguity.

**Blocked by.** Movements are the units the player actually selects and plays (~22 playable factions), and they must be first-class persistent objects with a homeland, an ideology, a seed and a growth rule. Today a 'party' is a string key inside a per-county dict with no identity, no territory and no state of its own — there is nothing to select, nothing to cap and nothing to break away.

**Plan.** Add js/movements.js with a persistent registry `{id, name, ideologyId, homeland:[areaIds], kind:'deterministic'|'seeded', seed:areaId, capPop, capAreas, active}`, baking homelands from an extended build_parties.py REGIONS table (add the 6 missing movements there — it is the right authoring surface and already supports fips lists). Replace the flat-ceiling phasePartyGrowth with per-movement growth: deterministic movements grow across their full homeland, seeded ones flood-fill from `seed` through Game.countyNeighbors under `capPop`, both gated by local sentiment. Size: L.


### G14. two-tier-secession — Tier 2 (discrete breakaway) is 90% built and directly reusable; tier 1 (continuous county defection) does not exist

- **Blocking:** `js/game.js, js/actions.js, js/turns.js`

**Exists today.** (a) REUSABLE and strong: `Game.breakApart(countyIds, {exclude})` (game.js:245-262) already performs the discrete breakaway — connected-component split via `components()` (game.js:149-165), a >=10-county minimum viable nation (MIN_NATION game.js:240), and orphan fragments joining `nearestNationForGroup` while never joining the failed aggressor. `Actions.planSplinter(S,T)` (actions.js:99-110) is a real continuous-defection precedent: same-lean counties touching T defect, cut-off wrong-lean counties secede, the rest is the remnant — pure planning, no mutation. `TurnSystem.insertAfter(parent, newIds)` (turns.js:56-68) already slots newborn nations into the turn order. (b) MISSING: any per-turn, sentiment-driven defection outside an action; any threshold at which a movement declares breakaway; any accumulation between turns. (c) BLOCKER: both mechanisms fire only inside a player action (confirmUniteAttempt actions.js:113-135, confirmAnnex actions.js:550-595) and are keyed on `lean === 'D'|'R'`, not on sentiment or movement membership.

**Blocked by.** This is the least-blocked system in the target design — the hard graph work (contiguity, minimum viable nation, orphan adoption, turn-order insertion) is already done and exercised by play. It just has the wrong trigger and the wrong predicate. Rewiring it is cheap; rewriting it from scratch because nobody noticed would be expensive.

**Plan.** Tier 1: in phaseSentiment, when an area crosses a threshold, shift a fraction of its population toward the movement's ideology and set `sent.defecting` — a data change, no new graph code. Tier 2: add `checkBreakaway()` at the end of World.advanceTurn — for each movement take the contiguous set of homeland areas above the breakaway threshold and call the EXISTING `Game.breakApart(set, {exclude: owner})` plus `TurnSystem.insertAfter`. Generalize planSplinter's lean predicate to a movement/ideology predicate at the same time. Size: M (S for tier 2 given breakApart; the tier-1 threshold and damping tuning is what makes it M).


### G15. release-valves — All five valves missing; the Release button is a disabled stub, and there is no military anywhere in the codebase to suppress with

- **Blocking:** `js/actions.js, js/app.js, js/game.js`

**Exists today.** (a) REUSABLE: the action framework is complete and generic — `Actions.start(type,nid)` (actions.js:42-47) already routes 'release', hover/click dispatch (actions.js:49-68) already has a release branch, and `dimExcept`/`clearVisuals` (actions.js:16-25) plus the annex selection loop (recomputeAnnexSelectable actions.js:483-493, clickAnnex :495-512) are directly copyable for a pick-areas-to-release flow. `Game.breakApart` gives voluntary release its mechanic for free. `Game.spend(nid, amount)` (game.js:336-342) exists to pay for suppression. (b) MISSING: voluntary release, military suppression (there is no military at all — no unit, no army, no strength value in js/), faction-switch, autonomy grants, party change. (c) BLOCKER: `startRelease` (actions.js:621-624) is three lines that flash 'coming next', and app.js:541 hardcodes `disabled title="Coming next"`.

**Blocked by.** Without release valves the sentiment system is a one-way ratchet: the player watches counties defect with no counterplay — precisely the runaway spiral the step-through simulator is meant to expose. Valves must land in the same milestone as sentiment, not after it.

**Plan.** In order: (1) voluntary release — clone the annex selection UI, call Game.breakApart on the chosen set, credit a sentiment/authority adjustment [S, mostly copy-paste]; (2) party change — flip nation.gov.rulingIdeology at a treasury+authority cost [S, once civil-liberties lands]; (3) autonomy grant — an `autonomy` flag per area that damps sentiment and cuts tax yield [S]; (4) military suppression — add `nation.military` funded from the treasury (it is also the missing nation-power sentiment input) and spend it to force sentiment down at an authority/weariness cost [M]. Faction-switch is its own finding. Size: M total, L including military.


### G16. faction-switch — Impossible today: there is no player identity in the codebase — all 51 nations are hot seats and 'your nation' means 'whoever's turn it is'

- **Blocking:** `js/turns.js, js/app.js, js/saves.js`

**Exists today.** (a) REUSABLE: `TurnSystem` already handles a mutable seat list with insertion (insertAfter turns.js:56-68), removal (drop :36-46), model reconciliation (sync :49-54) and round rollover — exactly what is needed when the player hops to a breakaway faction mid-game. (b) MISSING: any `store.player` / playerNation / factionId variable; any concept of a seat being human vs AI. (c) BLOCKER: the entire action gating is `isTurn = nid === TurnSystem.currentId()` (app.js:534) — the player is DEFINED as the current seat — and `TurnSystem.begin([...Game.nations.keys()])` (app.js:69) seats every nation. `SaveManager.snapshot()` (saves.js:9) persists no player identity, so a faction switch could not survive a save.

**Blocked by.** Faction-switch, faction selection, win conditions and AI opponents all depend on the same single missing concept: which seat is mine. Adding it is a one-line state change but it changes the meaning of every action-gating and panel branch, so it must land before AI — otherwise 'not your turn' and 'the AI's turn' are indistinguishable.

**Plan.** Add `store.player = {nationId, factionId}` set at setup and persisted in SaveManager.snapshot (saves.js:9). Change app.js:534 to `isTurn = nid === store.player.nationId && nid === TurnSystem.currentId()`. Faction-switch is then: reassign store.player.nationId to a breakaway id returned by Game.breakApart, behind a confirmation modal (the modal machinery already exists in saves.js:29-35), then re-evaluate win conditions. Size: S for the identity plumbing, M with the switch UI.


### G17. explanation-layer — The pattern already exists in two places and is genuinely good; nothing systematic does, and the world phases return nothing at all

- **Blocking:** `js/civilwar.js, js/actions.js, js/world.js`

**Exists today.** (a) REUSABLE and worth generalizing: `CivilWar.resolve` (civilwar.js:43-56) returns `{flip, reasons:['flip','gdp','pop'], diceCount, dice, points, product, score, outcome, scoreMult}` — a complete why-trace — and `cwLine(res)` (actions.js:629) renders it as a literal formula. `transitReasons(v)` (actions.js:290-299) converts three numeric factors into plain-English sentences. The annex panel lists trigger tags (actions.js:519-527). (b) MISSING: a shared why-record shape, a why panel, and any trace out of the simulation. (c) BLOCKER: all four World phases (world.js:24-138) mutate `nxt` in place and return nothing — the per-turn simulation, which is precisely where 'why did this county flip?' is answered, is opaque by construction.

**Blocked by.** The owner wants a player-facing 'why did this happen?' layer AND a developer 'show your work' formula panel — these are the same data at two verbosities. Retrofitting traces into phases after they are written is far more expensive than adopting a return convention before the sentiment phase exists, which is why this is a spine decision and not a later feature.

**Plan.** Set the convention now: every factor and phase returns a `Why` record `{value, inputs:[{label, raw, weight, contribution}], summary}`, and World.advanceTurn accumulates them into `state.lastTurnWhy[areaId]`. The player panel renders the top 3 contributions; the dev dashboard renders all of them with the literal formula. Reuse the existing rendering idiom from cwLine and transitReasons. Size: S as a convention, M for the two panels.


### G18. dev-dashboard-simulator — Impossible today: every tunable is a module-private const in one of five files, and no phase can run without mutating the live game

- **Blocking:** `js/world.js, js/game.js, js/civilwar.js, js/market.js, js/actions.js, js/app.js`

**Exists today.** (a) REUSABLE: `World` exports all five phases individually (world.js:162-170) — phaseRecomputeLeans / phasePoliticalDrift / phasePartyGrowth / phasePopulationGrowth / phaseCleanup are callable one at a time, which IS the step-through interface. The snap/nxt double buffering (world.js:141-146) already makes a phase a near-pure function of a state copy, and game_state.py mirrors the same phases headlessly. (b) MISSING: sliders, a formula panel, a 50-turn simulator, any charting of Authority/Sentiment/Influence. (c) BLOCKER, two-fold: (1) tunables are private consts scattered across five files — PARTY_CEILING/PARTY_STEP/PARTY_FLOOR (world.js:18-20), TAX_RATE/GOV_TYPES/AREA_UPKEEP/MIN_NATION (game.js:26-28, 240), civil-war magic numbers inline in expressions (game.js:271, 282; the 33/66 thresholds at civilwar.js:52), BASE/ELASTICITY/MIN_P/MAX_P (market.js:15), TRADE_GAIN/TRANSIT_TOLL/RAIL_DISCOUNT/HIGHWAY_DISCOUNT/NEED_SCALE/COUNTER_FLOOR (actions.js:184-192), DEMAND_SHARE (app.js:630) — none exported, none settable at runtime; (2) all phases reach into the `Game.county` singleton via `Game.getOwner` (world.js:26, 46, 69) and advanceTurn ends by calling `Game.tickTreasuries()` and `Market.update()` (world.js:156-157), so a sandbox 50-turn run would corrupt the live game.

**Blocked by.** The dashboard and simulator are the owner's stated instrument for detecting runaway spirals in exactly the systems being added — so they must exist BEFORE the sentiment loop is tuned, not after. Both blockers get more expensive with every new tunable and every new phase that reaches for the singleton.

**Plan.** (1) Create js/tunables.js as one mutable TUNE object holding every constant above, replacing the private consts and the inline magic numbers (~30 mechanical sites). (2) Change the phases to take an explicit `ctx = {areas, owner, nations, tune}` instead of reaching for Game.*, so `Sim.run(cloneState(), 50, tune)` runs headlessly. (3) Build the dashboard as sliders bound to TUNE plus a chart fed by the Why records from the explanation layer. Do (1) and (2) first — they are prerequisites for tuning sentiment at all. Size: M for tunables + phase parameterization, M for the dashboard UI.


### G19. turn-loop-and-render-invalidation — Cross-cutting blocker: every model mutation triggers a full-map repaint plus a full border re-mesh, and two unrelated growth systems run at two different rates

- **Blocking:** `js/app.js, js/game.js, js/world.js`

**Exists today.** `Game.emit()` (game.js:209) fires `onGameChange` (app.js:351-366), which clears the outline cache, runs TurnSystem.sync(), `recolor()` (repaints 3143 SVG paths, app.js:192), `redrawBorders()` (a full `topojson.mesh` over the entire county topology, app.js:181-185), `Leaderboard.refresh()` (which recomputes Game.nationDemographics for every nation, leaderboard.js:9-19) and re-renders the panel. moveCounties, breakApart, applyCivilWarCost, boostGdp, spend and growAll each emit. Separately, population grows TWICE under two unrelated rules: `World.phasePopulationGrowth` at 1% per world turn (world.js:67) and `Game.growAll(0.05)` at 5% per full round of seats (app.js:513) — and growAll also multiplies GDP by 1+rate (game.js:307) while the world phase never touches GDP.

**Blocked by.** A per-turn sentiment pass over 1676 Areas, plus movement growth, plus AI seats acting automatically, multiplies emit() calls by an order of magnitude — each one costing a full topojson.mesh. The duplicated growth rules also mean any sentiment factor reading population or GDP per capita gets a different answer depending on whether a round happened to roll over, which makes the simulator's graphs unreproducible for reasons unrelated to the systems being studied.

**Plan.** Add `Game.batch(fn)` that suppresses emit until the callback returns, and wrap every multi-step mutation (breakApart, civil-war resolution, a full AI turn, a whole world turn) in it. Split onGameChange into `paint` (recolor only) and `structure` (mesh + outline cache), invalidating the mesh only when ownership actually changed. Collapse the two growth systems into one: delete the growAll call at app.js:513 and give phasePopulationGrowth per-nation rates plus the GDP term, as DESIGN.md's roadmap already intends. Size: M.


### G20. faction-selection-win-conditions — Neither exists; the game has no start screen, no end state, and no victory check of any kind

- **Blocking:** `js/app.js, js/turns.js, js/leaderboard.js`

**Exists today.** (a) REUSABLE: `Leaderboard.rows()` (leaderboard.js:9-19) already computes live per-nation pop/GDP/margin rankings — the raw material for economic-supremacy and ideological-dominance checks. The modal system (saves.js:29-35 with index.html #modal) is a ready-made front end for a faction-select screen. `nation.origin` (game.js:67) distinguishes the 51 founding nations from those formed in play, and state capitals are derivable from county names in data/game-data.json. (b) MISSING: faction select, the ~22 playable factions, all three win conditions, the Reunify capstone (3/4 capitals + 1/2 pop + 1/2 GDP + Authority/Influence floors), conditional vassals, difficulty tiers. (c) BLOCKER: `init()` (app.js:40-85) runs straight from data load to `select('nation', TurnSystem.currentId())` — there is no pre-game phase to insert selection into — and neither completeTurn (app.js:508-519) nor World.advanceTurn has a hook where a victory check would run.

**Blocked by.** Win conditions are what make the sentiment spiral a game rather than a simulation, and the capstone needs the Authority and Influence floors that do not exist yet. The missing pre-game phase also blocks difficulty tiers and the West-only vertical slice, which needs a scenario scope to exist at all.

**Plan.** Insert a `Scenario` stage before TurnSystem.begin (app.js:69) that picks the playable faction list, the map subset (the West slice), and the difficulty tier, and writes store.player. Add `checkVictory()` at the end of completeTurn (app.js:519) and World.advanceTurn (world.js:158), reading a new data/capitals.json plus Leaderboard-style aggregates and Power.authority/influence. Size: M (L with conditional vassals).


### G21. anti-snowball-coalitions — A scalar 'blue shell' penalty exists and works; coalitions as diplomatic entities do not, and there is no inter-nation relations state to build them on

- **Blocking:** `js/game.js, js/actions.js, js/civilwar.js`

**Exists today.** (a) REUSABLE: `Game.blueShell(nid)` (game.js:199-205) returns 0..1 for the top ~10% of nations by population and is already wired into three levers — the annex cap (`capFactor: 2 - shell`, actions.js:468), civil-war severity (`scoreMult: 1 + shell`, actions.js:565) and union odds (`p *= 1 - 0.5*shell`, civilwar.js:66). The mechanism and its insertion points are proven. `Parties.blocs` supplies ideological affinity for choosing who would join. (b) MISSING: coalition entities, joint declarations, coalition membership on nations, any persistent relations matrix. (c) BLOCKER: blueShell recomputes `nationDemographics` for EVERY nation on every call (game.js:200) — O(nations x counties) — and there is no relations state anywhere in the model; the only relation-like number is `rel`, computed inline in evalTransit (actions.js:283) and discarded.

**Blocked by.** Coalitions are the target design's replacement for the crude shell and need persistent pairwise relations plus AI willingness — neither exists. The shell itself also becomes a measurable per-turn cost once a sentiment phase runs, because of its recompute-everything implementation.

**Plan.** Add a persistent `relations` map to the state (see rivalries), cache blueShell's ranking once per turn instead of per call, and define a coalition as a derived set: nations whose opinion of the leader is below a threshold and whose combined power exceeds it join automatically, applying the existing shell multipliers plus a joint-war option. Keep raw blueShell as the fallback during the West slice. Size: M.


### G22. occupation-cost — Exists as a flat $40M-per-Area upkeep — right hook, right place, none of the sentiment sensitivity that makes it a real cost

- **Blocking:** `js/game.js`

**Exists today.** (a) REUSABLE: `treasuryFlow(nid)` (game.js:316-323) already computes `maintenance = gdp * govRate + counties.size * AREA_UPKEEP`, `tickTreasuries()` (game.js:324-326) runs once per world turn from World.advanceTurn (world.js:156), and the UI already shows the income/maintenance breakdown (app.js:614-624). (b) MISSING: cost scaled by area sentiment, by distance from the capital, by ideological misalignment, or by recency of conquest. (c) BLOCKER: `AREA_UPKEEP = 40e6` (game.js:28) is a flat constant multiplied by `n.counties.size` — a conquered hostile Area and a loyal founding one cost exactly the same, so conquest has no ongoing price.

**Blocked by.** Occupation cost is the economic brake on the annexation snowball and it is one line away from working. Left flat, the sentiment system produces defection with no matching fiscal pressure and the balance the simulator is meant to expose stays invisible.

**Plan.** Change the maintenance term to `sum over areas of AREA_UPKEEP * (1 + OCC_MULT * area.sent.hostility)` once sentiment exists, and expose AREA_UPKEEP/OCC_MULT through the tunables module so a dashboard slider drives it live. Size: S (one function, once sentiment lands).


### G23. war-weariness — Nothing persists between wars — civil-war fallout is a single instantaneous transfer with no memory

- **Blocking:** `js/game.js, js/civilwar.js`

**Exists today.** (a) REUSABLE: `applyCivilWarCost(loserId, winnerId, score)` (game.js:265-290) already scales the cost by the war's score (`lossPct = clamp(0.02 + score/2500, 0.02, 0.4)` game.js:271; `gPct = clamp(0.02 + score/5000, ...)` game.js:282) and already knows both belligerents — the natural place to accumulate weariness. `CivilWar.resolve` (civilwar.js:43-56) returns a full result object with score and outcome. (b) MISSING: any per-nation weariness value, any decay, any effect on future war odds or on sentiment. (c) BLOCKER: applyCivilWarCost mutates population and GDP and returns nothing; the war is forgotten the instant it resolves, and the nation record has no field to remember it in.

**Blocked by.** Without weariness, repeated annexation is strictly better than restraint — each war is priced independently with no cumulative penalty. This is one of the named anti-runaway mechanisms and also a sentiment input: a war-weary population is a defecting one.

**Plan.** Add `weariness` to the nation record; have applyCivilWarCost add score-scaled weariness to BOTH belligerents and return a summary object instead of nothing; decay it a fixed fraction per world turn in a small new phase; feed it into CivilWar.unitePeaceChance and into the sentiment power factor. Size: S.


### G24. events-crises — No event system at all; a 6-second auto-clearing toast is the entire narrative surface

- **Blocking:** `js/app.js, js/world.js`

**Exists today.** (a) REUSABLE: `flash(html, kind)` (app.js:479-486) is a working toast used by every action for outcome narration, and the modal (saves.js:29-35 with index.html #modal) is a working blocking-choice surface — together they are the presentation half of an event system. Civil war and trade already produce narrative strings (cwLine actions.js:629, transitReasons actions.js:290-299). (b) MISSING: event definitions, triggers, weighted selection, choices with consequences, crisis chains. (c) BLOCKER: `World.advanceTurn` (world.js:140-160) is a fixed 4-phase pipeline with no extension point, and flash's toast auto-clears after 6000ms (app.js:485) so it cannot carry a decision.

**Blocked by.** Events are how the player learns WHY sentiment moved and are the intended pacing mechanism. Adding them late means retrofitting triggers into every mechanic instead of having each new system emit its own events as it is built.

**Plan.** Add an Events module driven by data/events.json (`{id, trigger:{system, condition}, weight, text, choices:[{label, effects}]}`) and an `Events.tick(state)` phase at the end of World.advanceTurn; route non-choice events to flash and choice events to the existing modal. Have each new system emit typed events rather than strings so the explanation layer and the history timeline consume one stream. Size: M.


### G25. rivalries — Absent, and there is no inter-nation relations state of any kind — the save format has nowhere to put one

- **Blocking:** `js/actions.js, js/game.js`

**Exists today.** (a) REUSABLE: `evalTransit` (actions.js:283) computes a political-alignment relation `rel = 1 - |S.dem - T.dem| / 25` clamped to [-1,1], and `transitReasons` (actions.js:290-299) already renders 'Relations are warm' / 'Relations are cool' — the player-facing vocabulary exists. (b) MISSING: persistent pairwise opinion, memory of past wars, annexations or betrayals, rivalry declaration, rivalry effects. (c) BLOCKER: `Game.serialize()` (game.js:345-351) emits only `{seq, counties, nations}` — there is nowhere in the save format for relations, so anything computed would be lost on load. Every relation-like value today is derived from current political distance and recomputed inline.

**Blocked by.** Persistent rivalries are the memory that makes AI behaviour legible and coalitions meaningful; with no relations store every diplomatic system is stateless and the AI cannot hold a grudge. Cheap to add now, expensive to retrofit after AI ships.

**Plan.** Add `relations` to the state as a flat `{['a|b']: {opinion, rivalry, wars, lastWarTurn}}` map, serialized at game.js:345-351 and restored in loadState. Write to it from applyCivilWarCost, from moveCounties (annexation resentment) and from trade confirmation. Have evalTransit read it instead of recomputing `rel`. Size: S-M.


### G26. map-history-timeline — No history is recorded anywhere — saves are single snapshots, and World.turn is not even serialized (a live save/load bug today)

- **Blocking:** `js/saves.js, js/world.js, js/game.js`

**Exists today.** (a) REUSABLE: `Game.serialize()` (game.js:345-351) already produces a compact full-state object and `SaveManager.snapshot()` (saves.js:9) composes game + turns + UI state — a per-turn frame is literally that object. `TurnSystem.serialize` (turns.js:78) covers the seat order. (b) MISSING: any frame list, ownership diff, timeline scrubber or event log. (c) BLOCKER: saves overwrite a single localStorage key per name (saves.js:13) and `World.turn` (world.js:15) is a private counter that is NOT in the snapshot at all; `moveCounties` (game.js:211-223) is the choke point for every ownership change and records nothing.

**Blocked by.** The timeline is also the debugging instrument for the runaway-spiral question the simulator exists to answer, and it needs per-turn ownership diffs that only moveCounties can cheaply produce. The unserialized World.turn should be fixed regardless — it is a real bug now.

**Plan.** Serialize World.turn (and Colors' `gen` counter, colors.js:28) in SaveManager.snapshot immediately. Add `history: [{turn, ownershipDiff, events, aggregates}]` appended once per World.advanceTurn, with the diff collected by instrumenting moveCounties. Store deltas rather than snapshots to stay inside the localStorage quota, and render a scrubber that replays diffs onto a cloned ownership map. Size: M.


### G27. leaders — Not present in any form; nations have a name and a colour and nothing that acts — but this is the least blocked system in the analysis

- **Blocking:** `js/game.js`

**Exists today.** (a) REUSABLE: `Game.nameForCounty(fips)` (game.js:169) already names newborn nations after their largest county, so the naming-at-birth hook sits exactly where a leader would be generated (createNation game.js:229-235). The nation record is serialized wholesale (game.js:349), so new fields persist for free. The `opts` multiplier pattern in CivilWar (scoreMult civilwar.js:44, shell civilwar.js:66) is the precedent for how a trait would apply. (b) MISSING: leaders, traits, succession, any trait effect. (c) BLOCKER: none structural. It is gated only on there being modifiers worth modifying — Authority, Influence, QoL, liberties, war odds — none of which exist yet.

**Blocked by.** Low risk and high flavour, and the natural carrier for difficulty tiers and AI personality — but building it before the power axes exist produces traits with nothing to modify.

**Plan.** Add `leader: {name, traits:[]}` to the nation record, generated in createNation and at setup from a data/leaders.json name pool and trait table; traits apply flat modifiers inside the Power.* functions and through the existing opts-multiplier hooks in CivilWar. Build AFTER the power axes. Size: S.

