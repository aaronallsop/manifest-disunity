# Decisions

Every judgment call made during the rebuild instead of asking, with the reason. Newest last.

---

### D1 — `build/raw/README.md` is committed, everything else under `build/raw/` is not
**M0.1.** `.gitignore` uses `build/raw/*` + `!build/raw/README.md` rather than `build/raw/`.
A bare directory exclusion stops git descending into the directory at all, so the negation would
never fire and the plan's requirement ("write `build/raw/README.md` listing each raw artifact")
would produce an untracked file. The `*`-plus-negation form keeps the 376 MB out and the
self-documentation in.

### D2 — `.gitattributes` normalises to LF
**M0.1.** The working tree is Windows; git warned on every one of the 48 baseline files that LF
would become CRLF. Left alone, the first `sed`/heredoc edit would produce whole-file diffs. Set
`* text=auto eol=lf` and `core.autocrlf=false` so diffs stay line-scoped for the rest of the
rebuild.

### D3 — New engine modules are ESM; the legacy IIFEs reach them through a `window` bridge
**M0.3.** `js/rng.js` and `js/tunables.js` are native ES modules so `tests/` can import them today
and `node --test` can run the same files unchanged later. The thirteen legacy files are classic
IIFE globals until M2. `js/boot-globals.js` imports the real modules and publishes them on
`window`; because `<script type="module">` is deferred it evaluates after every classic script and
before `DOMContentLoaded`, which is when `app.js:init` runs. M2 deletes the bridge.

### D4 — `TUNE` is read off the global bridge inside the legacy modules, not threaded as an argument
**M0.4.** Working rule 5 says the engine takes `(state, tune, rng)` explicitly. The legacy modules
are singleton IIFEs that already read `Game`, `Colors`, `Market` and `MapModes` as globals, so
threading one argument through them while the other four stay global would be theatre. The rule is
honoured where it can be: the pure-math surfaces — every `world.js` phase, `CivilWar.resolve`,
`Market.update`, `Market.nationSurplus` — take `tune` as a parameter and only fall back to the
global when a caller omits it. M2.5 promotes the closure into an explicit state document and the
fallback goes away.

### D5 — M0.4 is behaviour-preserving; value changes wait for the milestone that owns them
**M0.4.** Constants moved into `TUNE` at their *current* values, including `market.demandShare`,
which sums to 0.80 and is wrong (M1.8 owns the fix). Keys for future milestones (annex budget,
occupation cost, trade capacity, the drift blend) are in the schema but unread, so they change
nothing until wired. `TUNE.unreadKeys()` lists exactly what is still pending. Verified by the
opening market prices, which still match the review's measured baseline to 0.1.

### D6 — `TUNE` freezes composite values rather than copying them per read
**M0.4/M0.5.** The test suite caught `get()` handing out arrays by reference, so a caller could
mutate a tunable. Copying on every read was the obvious fix, but `get()` runs inside per-Area loops
and a six-element copy per Area per turn is ~10,000 allocations a turn for nothing. Stored arrays
and objects are cloned once on the way in and frozen; a write now throws in the module code that
would do it, instead of silently corrupting the run.

### D7 — Saves are lossless; size is handled by moving the primary store to disk
**M0.6.** Finding 51 measured a 30-round save at 536 KB and proposed rounding populations to cut it
to ~172 KB. Rounding was implemented, then reverted: it broke "a save/load round-trip reproduces
the state exactly", which is an M0.5 acceptance criterion and the substrate for replay, the M5
simulator and M2.5's state document — all worth more than 360 KB on a local disk. Size is handled
where it actually bites instead: saves go to the server first, and the `localStorage` fallback
surfaces its quota error rather than failing silently. Empty `ext`/`attrs` bags are still omitted,
which is free.

### D8 — Named saves live at `content/save-<slug>.json`; `data/state.json` mirrors the latest
**M0.6.** The M0.2 API has one `/api/state` slot and a `/api/content/<name>.json` namespace. Named
saves need many slots, so they go to content under a slug matching the endpoint's `^[a-z0-9-]+$`
validation, with the display name carried inside the document. Every save also writes
`data/state.json`, which is the document M2.5 promotes to the single source of truth.
`content/save-*.json` is gitignored — content is otherwise authored data and IS committed, but a
save game is not authored data.

### D9 — `TurnSystem.drop()` no longer touches `round`; `endTurn()` owns it
**M0.6, finding 49.** Two clocks were incrementing `round` and only one was observed, so a nation
dissolving on its own turn could pass a round boundary with no growth tick and no toast. `drop()`
now sets a `wrapped` flag and `endTurn()` consumes it, making `endTurn` the single owner.

### D10 — `Game.reset()` / `Colors.reset()` exist for the tests
**M0.5.** Every module is a singleton IIFE with private mutable state (finding 129), so the harness
cannot run two worlds; it runs one world repeatedly and needs an explicit teardown. M2.3 makes
state a value and these go away.

### D11 — War points are a size RATIO through a square root, not an absolute
**M1.3.** The plan offered "continuous point values, or scale so a median Area is ~1 point".
Absolute points have a worse problem than rounding: they scale linearly with the size of the
annexation while the outcome bands are fixed, so *every* large annexation becomes a certain
fall-apart regardless of the dice — the same step function in a different direction. Points are
therefore `sqrt(0.6·popRatio + 0.4·gdpRatio)`, the bite relative to the biter, which is the quantity
the trigger already tests. `sqrt` is what keeps doubling your size a bad gamble (mostly fall apart,
sometimes partial) rather than a mathematical certainty. Measured on the real turn-0 map across 52
triggered wars: 30.8% victory / 30.8% partial / 38.5% fall apart, against the old 1.5 / 3.0 / 95.5.

### D12 — The flip test itself moved to plurality, not just the magnitude
**M1.3.** The plan asked for flip *magnitude* measured from the plurality. Measuring the magnitude
that way while still detecting the flip with `before.lean !== after.lean` would be incoherent: the
D-vs-R letter ignores `ext` entirely, so a nation that is 40% Deseret / 31% R / 29% D reports its
lean as a minority party and a real change of leadership is invisible to it. `CivilWar.assess` now
takes the plurality over the full share set — D, R, Other and every emergent movement — which is
both correct today and the shape M2.2 needs.

### D13 — `partialSubset` was rewritten in M1.3, not left for later
**M1.3.** M1.3's acceptance is "a spread across all three outcomes". The middle outcome was
reachable but *territorially empty*: it kept only Areas matching the attacker's own lean, which for
a flip-triggered war is empty by construction (a flip means the annexed bloc leans the other way).
Measured on the real map, a 6-Area Pennsylvania flip war held 1 of 6 under the old rule. Shipping
"a spread" whose middle third does nothing would not have been the fix. A partial victory now
advances a breadth-first front from the attacker's own border through the contested set and stops
when the score's allowance runs out — always connected, always non-empty, sized 97% → 15% of the
selection across the partial band.

### D14 — Untouchable neighbours are decided by SIZE, not by ideology
**M1.4, finding 29.** The annex gate blocked only *same-lean* nations that were larger, which left
every ideological opposite wide open however large it was: Wyoming (0.59M, $51B) could not touch
Montana or Idaho but could chew on Colorado (5.96M, $558B) freely, every turn, at no risk. The rule
reads as a placeholder for a strength check and implements an ideology check. It is now a size gate
(`annex.strongNeighbourFactor`, 4×, on *both* population and GDP). This was going to have to be
rewritten in M2.2 anyway when `lean` leaves the model API — doing it once, now, is less work than
doing it twice, and it removes a perverse incentive in the meantime.

### D15 — Nations gained `founded`, `homeSt` and `lastAnnexTurn` in M1.4, ahead of M3
**M1.4.** M3 owns nation history proper (`annexed[]`, `lost[]`). But the M1.4 cooldown needs a clock
on the nation record, and the occupation cost needs to know which ground is *foreign* — which needs
a notion of home soil. `homeSt` is the state for an origin nation and the modal state of the
founding Areas for one born in a breakup. M4.5 replaces it with a real per-Area `occupied` flag and
scales the cost by hostility.

### D16 — A starting treasury, because otherwise nothing is affordable at turn 0
**M1.4.** `treasury` starts at 0 and only ticks on world turns, so the moment annexation had a price
it became unreachable until several world turns had passed — an action menu that does nothing reads
as broken, not as scarce. Every nation now opens with `econ.startingTreasuryTurns` (4) turns of
gross tax income banked.

### D17 — Every nation that loses ground pays, not just the plurality victim
**M1.4, finding 31.** One selection can span any number of nations; charging only the plurality
victim meant the rest lost territory with no population loss, no GDP transfer and no
acknowledgement. `chargeVictims` now applies the civil-war cost to each, weighted by its share of
the contested Areas. `victim` also initialises to `null` rather than to the attacker.

### D18 — The fall-apart message reports what actually happened
**M1.4, finding 23.** A selection smaller than `nation.minAreas` cannot form a breakaway, so its
fragments go to their nearest neighbour — which, with the attacker excluded, is usually the nation
that already owned them. That is the correct *outcome* (the defender holds) and the wrong *message*:
the old text claimed the counties "scattered and were absorbed by neighboring nations" when nothing
had moved. `confirmAnnex` now diffs ownership across the resolution and says which of three things
occurred.

### D19 — `world.popGrowth` stays at 1%/turn for now; retuning is M5's job
**M1.5.** Unifying the clock changed the effective rate a lot: `growAll` ran at 5% per player round
and the world engine at 1% per button press, which in practice was never. One clock at 1% per round
compounds to 2.2× over an 80-turn game — generous for a 20-year span but *visible*, which matters
more while there is no simulator to measure with. The rate is a named tunable; M5.3 measures it and
M5 tunes it. Retuning it now, before the tool that measures it exists, is exactly what the plan
warns against.

### D20 — `phaseCleanup` is kept and documented as inert rather than retuned
**M1.5, finding 14.** The floor cannot fire under growth-only dynamics: the smallest reachable
movement share is `partyStep × partyCeiling` = 0.0105, above the 0.01 floor, and 500 measured turns
removed nothing. Raising the floor would only delete movements that happened to spawn small; the
case the floor exists for is a movement that *shrinks*, which arrives with M4's sentiment model. The
phase stays, the reasoning is written at the code, and a test asserts the current inertness so that
when M4 makes it fire, that is a deliberate change and not a surprise.

### D21 — Ownership is snapshotted per world turn, ahead of need
**M1.5, finding 12.** No phase moves a county today, so reading live ownership is bit-identical to
reading a snapshot — the hazard is entirely prospective. But M4.2's continuous county defection is
a phase that moves counties, and the header comment is load-bearing documentation that a
contributor will trust. Snapshotting now costs one object per turn and makes the contract true
rather than true-by-accident. The header was also rewritten to say precisely what holds: no phase
reads back its own writes, aggregates come from `snap`, per-county values deliberately compose.

### D22 — M1.6 needed a fourth counter-force the plan did not list: the growth mix
**M1.6.** The plan named three fixes — a local blend, a structural anchor, bounded noise. All three
were implemented, and the collapse only *slowed*: median within-nation stdev still fell 13.2 → 2.32
by turn 200, under the ≥4 acceptance. The reason is that `phasePopulationGrowth` adds new residents
in the owner nation's mix, which is a **second attractor at exactly the same fixed point** as drift,
and the plan's three fixes only counter the first one. `world.growthMixNationWeight` (0.35) blends
the arriving cohort between the nation's mix and the county's own. With it, and with the drift
weights at owner 0.35 / anchor 0.40 / neighbourhood 0.25, the spread stabilises: 7.45 at t50, 5.54
at t100, **4.78 at t200, 4.80 at t300** — it stops falling, which is the property that actually
matters. Monolithic nations settle at 25/51 instead of 51/51.

### D23 — The anchor is the county's founding mix, not a culture-region lookup
**M1.6.** The plan offered "urban/rural, or the culture region from `data/cultural.mapmode.json`".
The county's own 2024 result is a better anchor than either: it already encodes urban/rural *and*
culture *and* everything else that made the place vote the way it did, it needs no join against a
second file that a map-editor session can change underneath the model, and it is exactly the
quantity whose spread the acceptance measures. It is computed after the Area merge (so a merged
Area is anchored to the character of the whole Area) and derived from baked data, so it is
recomputed at `init` and needs no place in the save.

### D24 — `Game.countyNeighbors` is memoized now, not in M2.4
**M1.6.** The neighbour-pull term calls it once per Area per turn, and it re-derived the graph with
fresh `Set` allocations on every query (finding 136). A one-line `Map` cache turns 200 simulated
turns from unusable into 17 seconds of test suite. M2.4 replaces the cache with the CSR graph behind
the same signature.
