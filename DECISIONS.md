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

### D25 — M1.8 needed sector-differentiated GDP growth, or the market reports a constant
**M1.8.** Recalibrating `perCap` kills the ratchet exactly as the plan says — prices stop climbing
and no longer pin at the 400 clamp. But it leaves the market reporting the *same six numbers
forever*, because with one uniform growth rate the global sector mix never moves and the price index
is a pure function of that mix. The finding names this as part of the defect ("relative prices never
change, because the sector mix is fixed"); fixing only the level would have replaced a market that
lies with a market that says nothing. `world.sectorGrowth` multiplies the base GDP growth rate by an
Area's baked sector profile, so IT-heavy Areas compound faster than agricultural ones and the global
mix genuinely shifts. Measured over 200 turns: Agriculture 108→140, Extraction 166→196, IT 55→46,
nothing pinned. Prices now move for a modelled structural reason, which is the only thing a price
index can honestly be about.

### D26 — `demandShare` was normalised, not relabelled
**M1.8.** The plan offered "make it sum to 1.0 or relabel the index honestly". Normalising is
strictly better: the index is demand share over supply share, so a sum of 0.80 shifts *every* price
by 0.80^1.3 for no modelled reason, and "balanced is 75" is a fact about an arithmetic slip rather
than about the economy. The authored 0.80 mix was divided through by its own sum, so the relative
structure the designer chose is exactly preserved.

### D27 — The nation panel's "GDP after internal consumption" became "exportable surplus"
**M1.8.** With demand shares summing to 1.0, a nation's surpluses and deficits net to zero by
construction, so that line would have printed `$0` for every nation forever. It now shows the sum of
the nation's *positive* surpluses valued at market prices — which is what the trade screens actually
move, and therefore a number a player can act on.

### D28 — Trade pays the treasury and nothing else; it does not grow GDP
**M1.9.** The plan says "route trade income to the treasury, not to GDP". Taken literally that
leaves trade with no GDP effect at all, which is the coherent reading: the goods were already
counted in GDP when they were *produced*, so paying GDP for selling them counts the same output
twice. Selling surplus converts production into money. GDP grows through `phaseEconomicGrowth`,
which is where growth belongs. This also gives every priced action a funding source, which is what
the structural-deficit nations lacked.

### D29 — Trade capacity and export access moved from the renderer into `Game`
**M1.9.** They were app.js helpers reading `store.trade` / `store.transport`, so two quantities that
*decide what an action can do* were unreachable to anything headless — the first two capacity tests
failed for that reason alone. `Game.init` now takes the baked trade/transport data and owns
`areaExport`, `exportAccess` and `tradeCapacity`; app.js keeps one-line aliases. M2.5 folds the data
into the state document.

### D30 — `adjacentNations` split into land borders and maritime reach
**M1.9, finding 90.** The state-level adjacency table is not simply wrong — `build_adjacency.py`
*deliberately* adds sea links (Alaska borders every Pacific and Canada-border state) and the Unite
prompt documents that rule. The bug is that a state-level table was the only adjacency the game had,
so it degraded into "any nation owning a county in a state adjacent to a state I own a county in"
the moment one county changed hands, and California was offered Alaska as an **overland** transit
route on turn 1. Land pairs are now derived from the real county adjacency; anything in the state
table that is not a land pair is a maritime link. Transit requires a land border *and* a non-null
corridor; Unite and bilateral trade keep the sea reach.

### D31 — The transit slider opens below the corridor rate
**M1.9, finding 38.** It opened *at* the rate, which the transit nation accepted outright in 190 of
214 adjacent pairs: the player pressed Propose, got a yes, and the most elaborate interaction in the
game contributed nothing. `trade.openingOfferFactor` (0.6) makes the default a lowball, so the
slider is a decision. Verified live: South Dakota opens at 11% against an 18% rail corridor and
Minnesota counters at 19%.

### D32 — Counties mode acts through the *acting* nation, not through a player identity
**M1.10.** The county panel now shows what the nation whose turn it is can do with the selected
Area: release it if it is theirs, annex from it if it is not — with the reason spelled out when it
is neither. That is the honest thing to render while `state.player` does not exist (M6.2). When it
does, "the acting nation" becomes "you" and the same panel keeps working.

### D33 — Release is free but budgeted and on a cooldown
**M1.10.** Giving territory away already costs the population, the output and the strategic depth of
what you hand over; charging a treasury fee on top would make the release valve something a nation
in trouble cannot afford, which is precisely backwards — the valve exists for the over-extended.
`release.budgetAreas` (6) is larger than the annex budget on purpose, and `release.cooldownTurns`
stops a nation dissolving itself one Area at a time inside a single round.

### D34 — The dead `.actions-stub` CSS was replaced, not just deleted
**M1.10.** The plan says delete it. Deleting it alone leaves finding 147 standing: the transit
negotiation — the most elaborate interaction in the game — shipped referencing `deal-verdict`,
`deal-why` and a slider row that had no styles at all, so an accept, a counter and a decline all
rendered identically. The block those rules now occupy defines them.

### D35 — The validator runs against the shipped data and is honest about what it finds
**M1.13a.** `build/validate.py` reproduces every data finding independently — 48.2% of party
references pointing at deleted counties, 348 Areas with no movement coverage, the Valdez-Cordova
FIPS mismatch, Hawaii's isolated islands, the 22-county blob, the 102 phantom keys in the pre-2015
Census file. It separates ERROR (exit 1) from WARN, because "the largest Area holds 22 counties" is
a design smell that the *next* bake fixes, while "two trade keys join to nothing" is a bug in the
data as shipped.

### D36 — `build_areas.py` was fixed but NOT re-baked
**M1.13b.** The determinism fix and the `MAX_MEMBERS` cap both change the merge plan: the capped
rebake yields 1,689 Areas instead of 1,676 and moves 10 of 483 primaries. An Area id is the join key
for `economy.json`, both `*.mapmode.json` files and every save, and the runtime *deletes* the
counties merged away — so adopting it means re-baking economy, repainting the map modes wherever
coverage is lost, and invalidating saves. That is a data migration, and M2 rewrites the model that
consumes it. The script is correct now and the validator reports the 22-county blob as a warning on
every run, so the next legitimate rebake picks it up with the migration it needs. Verified: five
runs under different `PYTHONHASHSEED` values produce byte-identical output; before the fix the
candidate neighbours lived in a `set` and CPython randomises string hashing per process.

### D37 — `adjacency.json` and `county_trade.json` WERE repaired in place
**M1.13c.** Unlike `areas.json`, neither is a join key for anything: adjacency is a pure graph and
the trade file is keyed by county FIPS. Regenerating adjacency is therefore free, and the
Valdez-Cordova fold is a two-record edit. Both were fixed in the shipped data as well as in the
scripts, because Hawaii being mechanically inert and Cordova's port being invisible are live bugs,
not future ones.

### D38 — Data fetches bypass the HTTP cache
**M1.13.** After re-baking, the game kept booting the *old* data: a cache entry written before the
dev server started sending `no-store` survived every reload, so Hawaii still had no adjacency and
sixteen movements loaded instead of twenty-four — silently, hours after the bake, with no way to
tell from inside the page. `data/*.json` is regenerated by `build/`, so every load goes through a
`getJSON` helper that passes `cache: 'no-store'`. This is what the hand-bumped `?v=` query strings
were reaching for; saying it once needs no maintenance.

### D39 — Eight new movements, authored here rather than deferred to M4.1
**M1.13f.** Alaska, Arizona, Colorado, Hawaii and New Mexico had no homeland in `build_parties.py`
at all, so 348 Areas were permanently outside the emergent-movement system with nothing for the
sentiment model to build on. Added: **Greater Idaho** and **State of Jefferson** (both named in
M4.1, both real proposals, both `chance: 1.0` because M4.1 wants them deterministic), **Native
American Confederation** (also named in M4.1), **Alaskan Independence**, **Hawaiian Sovereignty**,
**Front Range Republic**, **Sonoran Republic** and **Rio Grande Union**. Every state now has a
homeland; uncovered Areas fall from 348 to 278. M4.1 authors the rest.

### D40 — Movements are named factions that HAVE an ideology; they are a slice, not a seventh bloc
**M2.2.** The obvious reading of "six ideologies plus emergent parties" is seven-plus buckets:
`pop[6]` for the ideologies and `mov[name]` alongside it. That is wrong, and it is the same mistake
the old model made with `ext` — a parallel population that drift, growth and war all had to be
taught about separately, and mostly were not. Instead `mov[name]` is a **slice of**
`pop[ideologyOf(name)]`: Deseret's members are counted in Conservative Nationalist and also recorded
as organised under Deseret. The whole population is always exactly `sum(pop)`, so every phase that
moves people can keep ignoring movements entirely, and `phaseCleanup` clamps each ideology's
movements back inside their bloc once per turn. Deseret is therefore not an opinion, it is an
organisation *of* an opinion — which is also what makes "Deseret grows" and "Conservative
Nationalism grows" two different events the model can tell apart.

### D41 — Affinity normalises on the ACTUAL maximum pair distance (1.7804), not 2√2
**M2.2.** `affinity(a,b) = 1 - distance(a,b)/MAX_DISTANCE` needs a denominator, and the tempting one
is the diagonal of the [-1,1] coordinate box, 2√2 = 2.8284. No authored pair is anywhere near it:
the widest is Democratic Socialist to Conservative Nationalist at **1.7804**. Normalising on 2.8284
would have squashed every real affinity into the range 0.37–1.0, so a "low affinity" threshold of
0.3 would never fire and every M5 dial would mean less than its label said. `MAX_DISTANCE` is
therefore computed from the loaded table at `Ideology.load`, which also means adding a seventh
ideology re-normalises the scale instead of quietly compressing it. The cost is that affinity is a
*relative* measure — it says how far apart two ideologies are compared to the widest gap that
exists, not compared to an absolute political space. That is the more useful of the two.

### D42 — `war.splinterAffinity` replaces `x.lean === y.lean`
**M2.2.** Four game decisions asked "are these two the same political letter" and answered with
`===`: does this annexation trigger a civil war, may I annex this neighbour, who defects in a failed
union, which Areas survive a partial victory. Six symmetric ideologies has no `===` answer, so each
became a distance question against a named threshold. Splintering is the one that changed most:
a county defects to a neighbour when its ideology is closer to that neighbour than to its current
owner, and secedes when its affinity to its owner falls below `war.splinterAffinity` **and** it is
geographically cut off. Both conditions are now continuous, so the M5 simulator can tune how
fissile the map is with one number instead of by editing branch logic.

### D43 — Any change of governing plurality costs at least `war.diceFlipFloor` dice
**M2.2.** Flip magnitude is the lead gap between the incoming and outgoing leading ideologies,
scaled by `1 - affinity` between them, so an annexation that swings a nation from Republican to
Conservative Nationalist is a smaller shock than one that swings it to Socialist. Correct, and it
had one measured consequence I did not want: Democrat→Republican is the commonest flip on this map
and the two are *adjacent* on both axes, so the scaling drove it to 2 dice and the outcome
distribution collapsed to **400 victories out of 400** — the civil-war system stopped existing for
the flip that happens most. A floor of 2 dice (with `war.dicePerFlipPoint` raised 0.35→0.5 to keep
the distant flips where they were) restores the spread: losing the plurality is a constitutional
crisis whatever replaces it, and *how bad* it gets is what distance decides.

### D44 — The 2024 "Other" residual is split by cultural region, and the region is kept on the Area
**M2.2.** R becomes red and D becomes blue; Other is everything outside the two-party system, and a
third-party voter in Vermont is not the same person as one in Alabama. `content/ideologies.json`
carries per-region weights over the four minority ideologies for all 20 cultural regions, with a
flat `default`. Two notes. First, the split runs on the **merged Area**, not per member county, so
an Area takes one region's texture rather than a blend of its members' — Areas are the atomic unit
and a blended texture would be an average of a thing that no longer exists. Second, `init` computed
the region and threw it away; it now lands in `attrs.culture`. M4 picks its West scenario by region
and M5 reports by region, and both would otherwise re-walk the culture tree to learn what `init`
already knew. All 1,676 Areas are tagged and all 20 regions are covered, which the ideology suite
asserts so a new region cannot silently fall through to the default.

### D45 — Shares are percentages (0–100), counts are people, and the two never mix
**M2.2.** `Ideology.shares(mix)` returns 0–100, not 0–1, because every consumer is a label, a bar
width or an authored threshold written in points ("55.2% Republican", `war.splinterAffinity`). The
counts vector `pop[]` is people and is exact — `js/counts.js` absorbs the rounding residual so
`sum(pop)` equals the baked integer population, measured across 986 of 3,143 counties where the
float product does not. Mixing the two is the easiest bug to write here, so the naming is rigid:
`pop`/`mix` are counts, `shares` are percentages, `affinity`/`cohesion` are 0–1 fractions.

### D46 — M2.4 (the CSR graph) was done BEFORE M2.3 (columnar state)
**M2.4.** The plan numbers columnar state first, but the review that produced the plan is explicit
about the opposite order — "do it first, before anything else in the rearchitecture" — and the
reason holds up: building the graph creates the `fips -> int` Area index, which is the same index
the columnar arrays are keyed on. Doing columnar first would mean building that index for the
arrays and then either rebuilding or retrofitting it for the graph. The two tasks are independent
otherwise, both ship a playable game, and both land inside M2, so the swap costs nothing.

### D47 — Neighbour rows are sorted by node index, not left in `adjacency.json` key order
**M2.4.** The old walk built a Set in whatever order the JSON listed a county's neighbours, and
that order was load-bearing in two places: `argmax` tie-breaks in `nearestNation` (first maximum
wins) and the traversal order of every component search. So a re-bake that happened to emit keys
differently was a silent replay divergence with no modelled cause — a save from before the bake
would resolve a tie the other way. Sorting each row by index makes neighbour order a property of
the graph rather than of the file that described it. Same-seed determinism is unaffected either
way; what changes is that determinism now survives a re-bake.

### D48 — The graph symmetrises every edge, and the test measures how much repair that hides
**M2.4.** `build()` adds both directions of any edge declared in one. That is the right default —
an edge is a fact about a pair — but it can also paper over a genuinely broken bake, so the suite
measures the repair rather than trusting it: if more than 1% of edges are added by symmetrisation,
`adjacency.json` is meaningfully one-directional and the graph is covering for it. Measured on the
shipped bake: **0 added of 9,454**, so `build_adjacency.py` already emits a symmetric file and the
symmetrisation is a guarantee rather than a fix.

### D49 — Five fixed road crossings added to `adjacency.json`: bridges are LAND borders
**M2.4.** The contiguity test the graph made cheap enough to write reported four states starting in
two disconnected pieces: Michigan (the Upper Peninsula), New York (Staten Island), Rhode Island
(Aquidneck Island) and Virginia (the Eastern Shore). Census adjacency is shared-polygon-arc
adjacency, so a county you can only reach by driving over water has no neighbours on that side at
all. That was not cosmetic: the splinter rule secedes an Area that is politically distant from its
owner **and** geographically cut off, so Staten Island and the Upper Peninsula were one bad roll
from leaving on turn 1 for a reason the map does not show, and the Verrazzano-Narrows Bridge is
right there. Added as `FIXED_CROSSINGS` in `build_adjacency.py`: Mackinac (26097-26047),
Verrazzano-Narrows (36085-36047), Pell Newport and Mount Hope (44005-44009, 44005-44001), and the
Chesapeake Bay Bridge-Tunnel (51131-51810).

Deliberately a SEPARATE table from `MARITIME_COUNTY_LINKS`, because the distinction is load-bearing:
`game.js` derives land pairs from county adjacency and treats whatever is left in the state table as
maritime. Putting the Mackinac Bridge in the maritime table would tell the game you cannot march
across it. And Alaska and Hawaii stay unconnected at the county level on purpose — they are three
separate land components and reach the mainland through the maritime layer, which is why the
component test asserts exactly three rather than one.

### D50 — `tests/run.html` imports the real `boot-globals.js` instead of copying it
**M2.4.** The harness had its own hand-maintained copy of the ESM-to-global bridge, and it had
already drifted: it published RNG, TUNE, Counts and Ideology but not GeoCT. A suite that runs
against a different set of globals than the page can pass while the game is broken, which is the
one thing a test harness must never do. It now imports `../js/boot-globals.js` and gets whatever
the game gets, by construction.

### D51 — Float64, not the plan's Float32, for population and GDP
**M2.3a.** The plan says `Float32Array`. That is wrong for these two fields and right for the ones
M3 and M4 add. Float32 carries a 24-bit mantissa, so it represents integers exactly only up to
16,777,216 — and this game's invariants are exact ones: world population is 340,110,988 and a save
round-trip has to reproduce the state bit for bit (which is what replay, the M5 simulator and M2.5's
state document all rest on). A single Area survives Float32 today, since the largest is Los Angeles
at 9.8M, but the sums do not, and GDP at ~1.5e11 per Area would be quantised to the nearest ~16,000
dollars. So the rule is **Float64 for quantities (people, money), Float32 for bounded 0–1 scores** —
M3's food/health/IT and liberties, M4's 1,676 x 22 sentiment matrix — where seven significant digits
is far more precision than a designed score carries meaning. Measured cost of the choice: the whole
store is 173 KB.

### D52 — `Game.county[f]` stays an object; its numbers become views onto the columns
**M2.3a.** `c.pop[2]`, `c.gdp += x` and `c.pop = v.pop` appear in about a hundred places above the
model, and none of them should have to know where the bytes live. So the record keeps its shape and
`pop`, `anchor` and `gdp` become accessors. `pop` and `anchor` hand back a **cached** `subarray`
view for that Area, so a read in a hot loop allocates nothing and a write through it writes the
column; `slice()` still detaches, which is what every snapshot in the model relies on. This is only
sound because the columns are allocated once per world and never replaced — `clone()` builds a
separate object with its own view cache, and loading a save writes *into* the arrays. Two traps
found by writing the tests: assigning a record's own mix to itself (`cc.pop = cc.pop`, which
`loadState` did) zeroed the Area before copying from it, and creating the views before seeding them
from the pre-view records silently discarded every dollar of GDP in the country.

### D53 — One field registry, because "remember to update three lists" is not a fix
**M2.3a.** The actual bug was not that Areas were objects. It was that `Game.serialize` enumerated
an Area's fields by hand and `World.advanceTurn`'s snapshot and writeback enumerated them again, so
a field a phase added was dropped by **both** — it would work for one turn, vanish at the writeback,
and reappear at its default with no error anywhere. M3 adds five fields per Area and M4 adds a value
per (Area, movement) pair, so that is not hypothetical. `FIELDS` in `js/state.js` is now the only
list: `clone()`, `copyFrom()`, `bytes()` and the save path all iterate it. The test that matters is
the one that adds a field at runtime and clones — nothing in `clone()` mentions it by name, and it
survives. Fields carry `save: false` when they are derived from immutable baked data (`anchor`), so
the registry stays honest without putting 80 KB of reproducible numbers in every save.

### D54 — `nation.counties` is a derived cache, rebuilt on an ownership epoch
**M2.3b.** Ownership was two facts: `owner: Map<fips,nid>` and `nation.counties: Set<fips>`,
hand-synced in `moveCounties` and `loadState`. Two sources of truth for one fact is a bug waiting
for its third writer, and the target design adds occupier, claimant, homeland and garrison on top.
`state.owner` (Int16Array of nation index, keyed by Area node) is now the only place ownership
lives. `nation.counties` still exists, because about a hundred call sites iterate it, but it is a
getter over a Set that is **refilled in one pass when the ownership epoch has moved** — never
replaced, so an outstanding reference cannot go stale. Ownership changes are rare (annex, release,
civil war) and reads are frequent, so that is one O(1,676) rebuild per mutation rather than per
read, and `moveCounties` went from three writes per Area to one.

The Set is a cache, not an interface: writing to it would be invisible to the column until the next
ownership change. Nothing does — the only remaining reference outside `Game` is `serialize`, which
reads it — and the suite asserts the column and every nation's Set agree after each kind of
mutation, which is the invariant that actually matters.

### D55 — Two tie-breaks made canonical while converting them to index space
**M2.3b.** `nearestNation` and `nearestNationForGroup` tallied border counts into a plain object and
took the first maximum in `Object.entries` order — insertion order, which was the order neighbours
happened to leave a Set. `modalState` did the same over state FIPS. Two nations with an equal share
of a border therefore resolved on a traversal detail, which is a replay divergence with no modelled
cause, of exactly the kind D47 removed from the graph. Ties now break on the lower nation index and
on the alphabetically first state FIPS respectively: facts about the world rather than about how it
was walked.

### D56 — The snapshot was NOT the bottleneck; the string keys were
**M2.3c.** The plan justifies columnar state with "advanceTurn deep-copies every record twice per
turn — about 117k property writes before any math". Measured on the real world, that copy is
**1.9 ms of a 24.7 ms turn**, 7.3%. What actually cost was the string keys: with the six phases
timed individually, `phasePoliticalDrift` alone was **8.0 ms of the 12.4 ms** the phases spent
between them, and what it spends it on is 9,454 hashed `snap[neighbourFips]` lookups per turn plus
an aliased `Game.anchorOf(f)` per Area — it is the only phase that reads Areas other than the one it
writes.

So the conversion was aimed at the neighbour walk rather than at the allocation. Every phase is now
an integer loop over the same node numbering the graph uses, and the buffer is the columns plus one
array of movement bags. Measured after: drift 8.0 → 2.0 ms, all six phases 12.4 → 2.8 ms,
`advanceTurn` 24.7 → 9.3 ms, a 50-turn simulator run 1,237 → 466 ms, and the test suite (which runs
several hundred turns) 41.4 → 10.5 s. The remaining 6.5 ms of a turn is `tickTreasuries`,
`Market.update` and the single emit — M5's problem if the dashboard needs it, and now the visible
majority rather than a rounding error.

The lesson is not that the plan was wrong to want columnar state; it is right, and it is what made
the index loops possible. It is that the reason given for it was not the reason it pays.

### D57 — A latent bug in the movement rescale, found by rewriting the phase
**M2.3c.** `phasePopulationGrowth` grows each ideology and then rescales each movement by
`pop[i] / before` so that a movement keeps exactly its share of its own ideology — growth is meant
to be neutral for movements, since their members reproduce like everyone else. It reconstructed
`before` as `pop[i] - growth * (wNat * nationShare + (1 - wNat) * pop[i] / here)` — using the
**already-grown** `pop[i]` in the share it subtracted, so the share it took back was not the share it
had added and `before` was not the pre-growth count. Every movement drifted against its own ideology
by roughly 0.01% a turn, which compounds: 14.345% of the country organised at turn 10 against a
correct 14.343%, 19.939% against 19.936% by turn 30.

The rewrite keeps the share it actually applied and subtracts that, which is exact to 2.2e-16 across
1,691 movement placements. Verified the fix is the ONLY behavioural change in the conversion by
running the previous commit and the new one from the same seed for 30 turns: population and GDP
agree to every digit printed, and the only divergence is the movement head count.

### D58 — The state document is a module of its own, because the suite was testing a copy of it
**M2.5a.** `SaveManager` already built and applied the whole-world document, but it did so tangled
with the things only a browser can do — set the colour mode, repaint the toolbar, open a modal,
reach into `store`. So the suite could not run the real load path, and instead ran a hand-written
reimplementation of it (`headlessSnapshot` / `headlessApply`). **A test of a copy passes while the
original is broken** — the same trap as the drifted harness bridge in D50, and here it covered the
single most destructive operation in the game.

Split by dependency rather than by feature: `js/statedoc.js` is `assemble` / `validate` /
`applyModel`, pure model, no DOM and no globals it does not receive; `SaveManager` keeps transport,
the modal, the UI restore and the rollback around a failed load. The session values a document needs
but the model does not hold (seed, RNG, the areas build, the UI mode) are passed in, which is what
makes the module callable from the suite and, in M5, from the simulator.

### D59 — `data/state.json` is written at every world-turn boundary, and read at boot
**M2.5a.** It existed before as a copy of the last manual save, which made it a backup rather than
the source of truth the plan asks for. It is now autosaved on each round boundary — once per 51
nation turns, ~390 KB, coalesced so a slow write can never queue behind itself — and read at boot,
so closing the tab mid-game and reopening it puts the world back where it was. Verified live: three
world turns, reload, and the turn, population, seed and every border came back identical.

Three deliberate choices around it. **Autosave failures are silent**: it runs behind the player's
back, so if the server is not there the game must behave exactly as it did before, and it is the
Save button — which the player actually asked for — that reports the server honestly. **The resume
happens after a full fresh world is built**, not instead of one, so a document that turns out to be
unreadable leaves a playable game rather than a blank map. **`?fresh=1` skips the resume without
deleting anything**, because "start over" and "throw away my game" are different requests.

### D60 — The two shipped map modes were authored content living in the bake-output directory
**M2.5b.** `data/cultural.mapmode.json` and `data/geographical.mapmode.json` sat in `data/` beside
the offline bakes, and nothing in `build/` generates them — they are hand-painted in the editor.
They were there because the editor's only publish path was a **browser download**, which the author
then had to find in Downloads and hand-copy in under a different name, so the file landed wherever
the person doing the copying decided. Moved to `content/cultural.json` and `content/geographical.json`,
which is where the plan says authored content lives and where `PUT /api/content/<name>.json` writes.
The old paths are gone rather than left as a redirect: two copies of an authored file is how the two
copies diverge, and the suite asserts a 404 at the old location.

### D61 — Publish writes through the server; the download survives only as the offline fallback
**M2.5b.** `publish()` now PUTs to `/api/content/<slug>.json` — the same atomic write the save system
uses, into the same directory the game loads from — so an afternoon of painting lands in the repo
instead of in Downloads. The download path is kept for exactly one case: the page opened without the
server. Losing painted work because a fetch failed is not an acceptable outcome, and the flash says
plainly which of the two happened.

The editor also gains the **import** it never had. It could publish and never load, so a mode was
write-only the moment it left the browser: reopening one meant re-painting 1,676 Areas by hand.
Drafts stay in localStorage because they are unfinished work tied to the machine they were drafted
on; published modes are authored content and now round-trip. Verified through the actual UI: Open
published → Cultural (1,676 unassigned → 0 assigned), add a region, Publish, and
`content/cultural.json` came back with the new region and all 1,676 assignments intact.

### D62 — `editor.js` read another module's global at load time
**M2.5b.** It wrapped `Leaderboard.refresh` at the top level, so the module silently required
`leaderboard.js` to have been evaluated first. That is true in `index.html` by luck of script order
and true nowhere else, so loading `editor.js` into the test harness threw `Leaderboard is not
defined` and the whole module failed to define — the same failure mode as the top-level read of an
ESM-bridged global in M1. The wrapper only has a job while the editor is open, so it is installed on
first `enter()`. The rule this keeps breaking is worth stating plainly: **a module may read another
module's global inside a function body, never at the top level.**

### D63 — `DELETE /api/content/<name>.json` exists, because two callers were working around its absence
**M2.5b.** The content API had GET and PUT and no DELETE, and both callers that wanted one had built
a workaround rather than asking for it. `SaveManager.remove` wrote a `{deleted: true}` **tombstone**
that the listing then had to filter out — so a deleted save was still a file, still listed by the
server, and still read once by `list()` before being dropped. The test suite simply left its scratch
documents on disk, and one of them, `content/test-roundtrip.json`, was committed as authored content
in the M2 close commit.

Two independent workarounds for the same missing operation is the signal that the operation should
exist. Added, with the same `NAME_RE` guard as GET and PUT, returning `{ok, existed}` so deleting
something that is not there is a success rather than an error. `content/test-*.json` is gitignored
as the second line of defence, and the content suite's last test now asserts that it has cleaned up
after itself and that the four committed documents are untouched.

### D64 — M3.4 was done first, because the plan files its own prerequisites under it
**M3.4.** The plan numbers Authority as M3.1 and "Nation history + `gov.rulingIdeology`" as M3.4,
but its own prose files those under *"Prerequisites this milestone must add"* — Authority is a
function of age, of what a nation has taken and lost, and of who governs it, and none of that
existed. So the order is M3.4 → M3.1 → M3.2 → M3.3. Same kind of call as D46, same reason: the
plan's task numbering is a table of contents, not a dependency graph.

### D65 — History is a bounded list of events, not a pair of counters
**M3.4.** Authority weights recent gains and losses more than old ones, and **a counter cannot be
windowed after the fact**. So a nation carries `annexed[]` and `lost[]` of `{turn, from|to, areas,
reason}`, trimmed to `nation.historyWindow` (20 turns). The `reason` is on the record because
Authority should not weigh a war won like a peaceful annexation, or either like a release.

Recorded at **one choke point**. Every territorial change in the game — annex, unite, release,
civil-war fragmentation, nation creation — flows through `moveCounties`, and instrumenting the five
callers separately is exactly how one of them ends up not doing it. The tests drive each caller and
check the record rather than calling `moveCounties` five times, because it is the *coverage* of the
choke point that is the property under test.

### D66 — `gov` becomes a record, and the government is derived but stored
**M3.4.** `gov: 'Republic'` was a string used as a lookup key into a maintenance table with one
entry — a constant wearing a variable's clothes. It is now `{type, rulingIdeology, since}`.

Stored rather than computed on read, and refreshed at exactly one point in the turn. Reading it live
would mean a nation's government changed in the middle of whichever phase was busy moving its
population, so "who is in power" would depend on when you asked. Storing it is also what gives
`since` a meaning — how long this ideology has held power — which is one of Authority's inputs.

Two bugs found by writing the tests, both about *when*:

- `Game.init` refreshed at the end of its own run, which is **not** the end of world construction:
  `Parties.setup` runs next and converts population between ideologies. Wisconsin is 49.6/48.7, and
  one movement seeding flipped it — so the live game and a save round-trip disagreed about who
  governed it. `Parties.setup` now refreshes when it has finished moving people.
- The refresh runs while turn N is being *resolved*, but the government it produces is the one that
  governs turn N+1, so the world loop passes the effective turn in. Stamping `worldTurn()` there
  dated every new government to the last turn of the government it replaced. And on a load,
  `makeGov` stamped `since` with the current turn instead of reading it back, so opening a save
  re-dated every government in the world — which the round-trip test caught as a straight identity
  failure.

### D67 — The Why record is the calculation, not a second description of it
**M3.1.** The plan asks every power function to return `{value, inputs, summary}`. The rule that
makes it pay is that **nothing downstream recomputes anything**: the nation panel reads the record
the power phase already produced, the M5 dashboard will read the same array, and the `key` on each
input names the exact tunable slider that moves that term. A summary built from a second pass over
the source data can disagree with the numbers printed beside it, so `defaultSummary` is built from
the `inputs` array itself.

It also changes what a test can assert. `tests/power.test.js` checks *contributions* — that
territory lost outweighs territory taken, that age stops paying past its full point, that overreach
is what stops conquest being a pure Authority engine — rather than final values. A formula change
that happens to preserve the total still fails the test that cared about the term.

Two supporting rules. **Normalise before weighting**: every input is mapped to 0–1 by a named curve
(`ramp`, `saturate`) before its weight applies, so weights are comparable and a slider means the
same kind of thing everywhere; raw numbers with implicit scales are how a weight of 0.2 ends up
dominating a weight of 5. And **the unclamped total is kept** alongside the clamped value, so "your
Authority is pinned at the floor and here is the 0.4 of pressure holding it there" stays answerable.

### D68 — The CHANGE is rate-limited, not the value
**M3.1.** `power.floor`, `power.maxRise` (0.05) and `power.maxFall` (0.08) apply to every stock in
`js/power.js`, and they are in from the start rather than added when a death spiral shows up —
because by then the tuning is built on top of the spiral.

The distinction matters and is easy to get backwards. Clamping the **value** to a minimum leaves the
*pressure* unbounded, so the moment the clamp is relaxed the nation falls off a cliff; the clamp is
hiding the problem rather than solving it. Rate-limiting the **change** means a nation that has a
catastrophic turn still ends it with most of the standing it had, and a collapse takes a decade of
bad turns — long enough to be a story, and long enough to be recoverable. `maxFall > maxRise`
because standing is easier to lose than to build. A null previous value opens **at** the target
rather than climbing from the floor, so a fresh 51-nation board shows real opening Authority instead
of every nation at 0.08 for fifteen turns.

### D69 — Authority ships with five real terms, not eight with three sources of zero
**M3.1.** The plan lists `f(age, wars_won, territory_held_without_unrest, gov_type, readiness) -
f(losses, failed_suppressions, unrest, coalition_pressure)`. Unrest and failed suppressions are M4
(they need sentiment), coalition pressure and military readiness are M6. Adding placeholder terms
for them would mean tuning the terms that exist against three constants of zero, and then re-tuning
everything when they arrive. What shipped is age, tenure, wars won, solvency and cohesion against
territory lost, occupation and overreach — all eight of which read something the model actually
knows. The rest become terms here when the mechanics behind them do.

**Overreach** earned a tunable the tests forced into existence. Taking ground pays through "wars
won"; taking a *lot* of ground quickly should cost, because a state digesting six conquests at once
is not more secure than one that took two. The first implementation had no free allowance, and
measured, a single six-Area war scored +0.047 on wars won against −0.060 on overreach — so
**winning a war lowered Authority**, which is not a position anyone would defend. `power.authority.
paceFree` (0.35 Areas/turn) is the rate a state absorbs without strain; only what is taken above it
counts as overreach. The test that caught it is the one that says a won war must raise Authority.

### D70 — Influence was promoted out of `evalTransit`, not invented
**M3.2.** The review's own note says the trade/transit negotiation "already computes an ad-hoc,
stateless version of it that should be promoted" — relative economic size, political alignment and
need, recomputed inline per dialog and thrown away, so nothing outside the trade panel could read it
and nothing persisted between turns. The two size and alignment terms here are that math,
generalised from "against this one partner" to "against the world": economic weight is GDP as a
share of the world's, and alignment is the GDP-weighted mean affinity between this nation's
political centroid and every other's. `need` stays in `evalTransit`, because it is a fact about one
deal rather than about a nation.

Trade reach reads `nation.tradeCooldown`, which already records who a nation does business with. A
second relations table would be a second source of truth that could disagree with the one the trade
screens read — the D54 mistake in a new place.

### D71 — `(1 + influence)` is why Influence is the one stock that is its own input
**M3.2.** The plan asks for `annexations * (1 + influence)`, and it is the mechanism behind the
design's context-dependent cost: a superpower annexing a neighbour pays more in reputation than an
unknown does, **because it had more to spend**. Measured, the same eight-Area annexation costs a
0.9-influence nation 1.7× what it costs a 0.1-influence one.

That makes Influence the only stock whose own value feeds its target, which is also exactly why the
rate limit (D68) is not optional here — the feedback would otherwise run away in both directions. A
nation with a null previous Influence scales by 1 rather than by `1 + nothing`: a brand-new state
has no reputation to spend.

Verified live and it is the behaviour the whole milestone is for: California conquering from 58 to
118 Areas over 12 turns went **Authority 0.501 → 0.515** and **Influence 0.666 → 0.148**. Secure at
home, a pariah abroad. Two stocks that can disagree is the entire reason there are two.

### D72 — One renderer for every Why record
**M3.2.** `renderAuthority` became `renderWhy(label, record)` the moment there were two stocks, and
the nation panel calls it twice. Two near-identical renderers is how the two drift — one gains a
trajectory arrow, the other does not; one starts hiding near-zero terms, the other keeps them — and
a player then has to learn that the same kind of number is presented two ways. Influence gets the
warm end of the palette against Authority's cool one, which is the only thing that differs.

### D73 — Food is a need, and it can be bought
**M3.3.** The instruction was "food and healthcare as *needs*, not just sectors", and the distinction
is the whole term: a share of output is a fact about an economy, not about whether anyone eats. Food
security is production **per person** against a per-person requirement, so the same harvest feeds a
small nation and starves a large one — which a sector share cannot express.

The second half matters as much. A nation covers the requirement out of its fields **or out of its
wallet**: `qol.foodImportShare` of GDP is treated as redirectable to imports. Without that term the
model says the District of Columbia starves, which is not a claim about the world — it is a claim
about a model that confused growing food with having food. The mechanic that falls out is the right
one: agriculture or money, and a nation with neither is in trouble.

Healthcare has no sector in the six-sector economy and is **not faked as one**. It is bought out of
income, and GDP per head against a per-head requirement is the honest proxy — the one real health
outcomes track most closely.

### D74 — The QoL requirements are calibrated in the model's units, from measurement
**M3.3.** The first values were picked from real-world figures ($1,100/person of food, $22,000 of
income for full healthcare) and every nation on the board maxed all three terms: 45 of 51 read QoL
0.95+, so M4's grievance — which is `1 - qol` — would have been 0.03 everywhere and the factor would
have been inert. A stat where every nation reads the same carries no information.

The reason is that the model's "Agriculture" is a template-apportioned share of GDP, not real farm
revenue, so it runs an order of magnitude above farm-gate value. Measured across the 51 opening
nations: agriculture $3,392–$26,212 per head (median $6,995); GDP $53,751–$262,439 per head (median
$77,684). The requirements were then set from those numbers rather than from the real world.

Overshot once on the way, which is worth recording: at 12,000 no nation on the board fully fed
itself, which is a strange thing for the model to say about a country that exports food. Settled at
8,000, and the reason is a design position rather than a number — **food should be near-saturated at
peace and is the term that COLLAPSES under stress**. A term reading 0.95 at peace and 0.3 after a war
is doing its job; one reading 0.7 at peace is miscalibrated. Healthcare and prosperity carry the
peacetime variance instead. Final bands at turn 0: Authority 0.44–0.56, Influence 0.45–0.66, QoL
0.55–0.98, Liberties 0.60–0.84.

### D75 — Civil Liberties measures alignment at home, and division separately from distance
**M3.3.** The hinge is why this could not be written before `gov.rulingIdeology` existed: a state
governing people who broadly agree with it has no reason to restrict them, and a state governing a
population sitting at the far end of both axes is under constant pressure to. That is the
population-weighted affinity between each Area's mix and the ruling ideology — the same `affinity`
function that drives everything else, pointed inward.

**Weighted over Areas, not read off the nation's aggregate mix**, and the two are genuinely different
numbers: a nation split into a red half and a blue half has an aggregate centroid sitting between
them that resembles neither, and would read as moderately aligned with a centre-governing party that
in fact nobody supports.

The "divided people" term is **not** a duplicate of alignment. A nation can be uniformly
mildly-opposed (low alignment, high cohesion) or split into two camps that agree with the government
equally little (same alignment, low cohesion). The second is far harder to govern liberally, and only
cohesion tells them apart — which is what the test isolates by holding alignment fixed.

### D76 — One pass per nation, because four gathers meant six full scans
**M3.3.** Each of the four `gather*` functions asked the model for what it needed, which was
`nationDemographics` four times and `treasuryFlow` twice per nation per turn — and each of those is a
full scan of that nation's Areas. Measured, the power phase was **4.51 ms of an 8.12 ms turn**, more
than the six world phases put together, for numbers that cannot change between the four calls. The
other half of the cost was the home-alignment loop calling `Ideology.affinity(i, ruling)` per
ideology per Area: about ten thousand distance computations a turn for what is a **six-element lookup
table**.

`Power.nationFacts(nid, tune)` reads everything once and the four gathers take it. Measured after:
**2.32 ms**, and the suite went 30.2s → 23.7s. Same lesson as `worldContext` one task earlier, and
the same lesson as the drift phase in M2.3c: the cost is almost never the arithmetic.

### D77 — Two prerequisite bugs in the existing secession machinery, fixed before building on it
**M4.0.** The plan flags both under M4.3; doing them first means M4.3 is only the new mechanic.

`confirmUniteAttempt` called `Game.breakApart(plan.secede)` with **no `exclude`**. Without it, a
seceding fragment too small to stand alone rejoins its *nearest* nation — which, for a chunk that has
just torn itself out of S and is surrounded by S, is S. So a failed union quietly handed the
aggressor back the ground that had just rebelled against it, and **the smaller the rebellion the more
reliably it was undone**.

`nation.minPop` was in the schema and read by nothing — a slider that does nothing, which is worse
than no slider. A breakaway now stands alone on Areas **or** on population, whichever it clears
first, because Area count is a poor proxy for viability once Areas range from one county to eight:
two Areas holding four million people between them is a country, and five holding thirty thousand is
not. (`nation.minAreas` had already been re-derived at Area scale in M1, so that half of the plan's
note was done.)

### D78 — A movement's core is DERIVED, not hand-authored
**M4.1.** The core is the set of Areas a movement must all hold before it can declare (M4.3 tier 2),
so it decides how hard declaring is. Hand-authoring twenty-four county lists is data entry that goes
stale the moment `areas.json` is re-baked — the same class of problem as the 48.2% of authored
references M1.13 found silently discarded.

Instead the bake derives it: **the smallest set of homeland Areas that between them hold 60% of the
homeland's population**, ranked by population with the FIPS as a deterministic tie-break. That is the
principled reading of "heartland" — a movement declares when it holds the places its people actually
live — and it produces the right answers by construction: Deseret's core is the Wasatch Front (4
Areas of 41), Cascadia's is the Portland–Seattle corridor (25 of 164).

With a floor of **three**, because three homelands (El Paso United, Hawaiian Sovereignty, the Sonoran
Republic) are dominated by a single metro and derived a one-Area core. A movement that declares
independence the moment one Area turns is not a movement, it is a switch.

### D79 — The movement state machine is READ from the map, never set by events
**M4.1.** `latent → rising → armed → declared → realized` is derived every turn from what the
movement actually holds: peak Area share against the secession thresholds, core coverage, and whether
its nation is on the board. It is a *description*, not a driver.

A state machine that is written by events goes stale the first time an event is missed — most
obviously, a movement whose nation is conquered out of existence would stay `realized` for the rest
of the game. Deriving it costs one pass over each movement's homeland and cannot disagree with the
map. The test that matters creates a nation, checks `realized`, merges it away, and checks the
movement notices.

### D80 — Per-movement growth caps replace the single global ceiling
**M4.1.** `world.partyCeiling` applied one number to every movement, so the only difference between
the Anarcho-Capitalists and Deseret was where they started. `growthCap` is authored per movement
(0.25 for a nuisance, 0.60 for a country in waiting) with the global as the fallback, which is what
makes "this is a fringe that stays fringe" and "this is a country in waiting" different *facts*
rather than the same fact at different times.

Also: the plan names **Cascadia, Deseret, Greater Idaho and Jefferson** as the deterministic four,
but only Greater Idaho and Jefferson carried `chance: 1.0` — Cascadia and Deseret were still rolling
0.5, so half the spine of the West slice was absent from half of all runs. Caught by the test that
boots five different seeds and demands all four.

### D81 — Sentiment IS the movement's share, not a second number beside it
**M4.2.** The plan writes `sent[a][m] += clamp(target - sent[a][m], ...)` as if sentiment were a new
quantity. But `area.mov[name]` is already the head count a movement has organised, and its share of
the Area is exactly what "sentiment" means — so keeping both would be **two representations of one
fact** (the D54 mistake) and would stack two rate limits on top of each other: sentiment easing
toward its target, then the share easing toward sentiment.

So `phaseSentiment` moves `mov` directly toward the six-factor target. One quantity, one rate limit,
and **nothing new goes in the save** — sentiment persists exactly as `mov` always has. It also means
the M4.3 secession threshold and the movement state machine read the same number the panel prints.

### D82 — The explanation is the calculation, recomputed rather than stored
**M4.2.** The plan says "store each factor's raw contribution alongside the result". At 1,676 Areas
x 17 movements x 6 factors that is ~170,000 objects allocated *every turn* for data nobody has asked
for — and the phase would throw all of it away.

`Sentiment.target(inputs, tune, collect)` takes a flag: the phase passes false and gets the number,
`Sentiment.explain(area, movement)` passes true and gets the rows. **One implementation, the same
expressions in the same order**, so the explanation cannot become a second drifting model of the
model — which is exactly what a separately-written "why" panel would be. Measured cost of the flag:
the sentiment phase went 3.71 → 2.97 ms.

The test that keeps it honest reconstructs the printed total from the printed factors:
`raw === base * Σ(grievance + pull) + suppression`. If the two ever diverge, the arithmetic that
produced the number and the arithmetic that explained it are no longer the same.

### D83 — A movement seeds its CORE, not its whole homeland
**M4.2.** Setup planted every homeland Area at once, which meant a movement began at its full
geographic extent. Measured over 60 turns with the new diffusion term in place, **every movement's
Area count was unchanged from turn 0** — Deseret 41 → 41, A Free Texas 104 → 104 — while only the
shares moved. `pull` was computing correctly and doing nothing observable, because there was nothing
left for it to reach.

A movement now starts where its people are — its derived core — and everything else in its homeland
is ground it has to win. That is what makes the distinction between `seed` and `homeland` mean
something, and it is what a frontier needs in order to be a frontier. Measured after: Deseret spreads
4 → 41 Areas over 60 turns and takes 4/4 of its core; A Free Texas 11 → 104; the New Confederacy
100 → 536.

Worth recording that this was **a bug in the seeding, found by measuring the new mechanic rather than
by testing it**. The diffusion term passed every unit test it had while being globally inert.

### D84 — The model has to discriminate, so a test demands that something LOSES ground
**M4.2.** A model in which everything rises is a model with one dial wearing six labels. The suite
therefore asserts not only that several movements gain ground over 60 turns but that **at least one
loses it**. Measured on the real map: Cascadia's peak share falls 0.176 → 0.109 and El Paso United's
0.166 → 0.075, because both sit in well-governed places whose leading ideology is a poor match — the
multiplicative `base` doing precisely the job it exists for. Meanwhile Deseret runs to its cap.

Turn-45 spread across 17 movements: 1 declared, 7 armed, 6 rising, 3 latent.

### D85 — Tier 1 cannot make a country; only tier 2 can
**M4.3.** The plan says an over-threshold Area "defects to `m`'s realised nation, **or becomes
independent if there is none**". The second half is wrong at this threshold: at 0.40 with caps up to
0.60, dozens of Areas sit over the line simultaneously, and letting each go independent on its own
turns the map to confetti.

So the two tiers get genuinely distinct jobs. **Declaring is how a movement becomes a country;
defecting is how that country grows.** Tier 1 moves an Area only to a movement that already has a
nation, only along that nation's frontier, and only `secession.maxPerTurn` Areas a turn taken
strongest-first. Single-Area independence was already refused downstream by `nation.minAreas`, so
nothing is lost.

### D86 — Independence has a grace period and a price, opposite in sign and different in duration
**M4.3.** A nation founded this turn has no age, no tenure and no reserves — **every other Authority
term reads zero** — so without a honeymoon it would be the weakest government on the board on the day
of its founding and would immediately start shedding the Areas that just fought to join it. The
honeymoon is a decaying Authority *term*, not a patch on the value, so a player can see exactly why a
young country is holding together and watch the reason expire.

Against it, a one-off proportional GDP cut: institutions, contracts and trade routes break at once.
Proportional through `boostGdp`, not an even split, so it does not flatten the economic map M1.7
spent a fix un-flattening. Without the cost, declaring independence would be free.

### D87 — Conquest is a REASON, not a date
**M4.3.** `createNation` grants a new nation its founding territory through `moveCounties`, which
records it as an acquisition — correctly, because that is what the ledger is for. But Authority and
Influence read those records as conquest, so **a movement declaring independence with 39 Areas was
scored as having blitzed 39 Areas on the day it was born**: measured, Deseret opened with Overreach
at −0.123 and Influence pinned at the 0.08 floor, for taking nothing from anyone it had not already
been living in.

The first fix compared `e.turn !== n.founded`, which worked only while two independent clocks agreed
and broke the moment a test called the phase directly. Filtering on the reason — only `annex` and
`war` are conquest — needs no clock at all, and lives in `nationFacts` so the two stocks cannot
disagree about what counts.

### D88 — One clock, again: `phaseSecession` reads the world's counter rather than being handed one
**M4.3.** The phase took a `turn` argument while `moveCounties` independently read the same value
through `Game`'s own accessor. Two sources for "what turn is it" agree exactly as long as every
caller remembers to pass the right one — and they disagreed the first time a test called the phase
directly, stamping the event with one turn and the territorial history with another. The phase now
reads the module's counter, which is what `moveCounties` reads too. Same lesson as D66.

### D89 — `silent` suppresses the render, not the fact
**M4.3.** `moveCounties(..., {silent: true})` skipped its `emit` entirely — including the `roster`
bit that says a nation has ceased to exist. Every silent caller is inside `batch()`, where emits are
merged anyway, so the flag was not saving a render; it was **dropping a model event**. Measured:
Alaska lost its last Area to a defection on turn 34, was pruned from the roster, and was still in the
turn order six turns later being handed turns as a nation that did not exist.

The related half: that sync lived in `app.js`'s change handler, so it ran in the live page and
nowhere else — and the M5 simulator is headless by definition. `TurnSystem` now registers for roster
changes itself at `begin()`, which makes the renderer's involvement unnecessary and the invariant
impossible to miss.

### D90 — A released fragment needs a recipient, not a target
**M4.4.** Without the guardrail, releasing counties is a way to **dump** them: hand a hostile
neighbour three Areas full of a movement it cannot govern and you have exported your secession
problem for free. `breakApart` now takes an `accept(nid, comp)` predicate, and a neighbour that
refuses simply does not receive — the Areas stay where they were, which is the honest outcome of
trying to give something away that nobody wants.

Three ways in, matching the design: the fragment is politically compatible with the recipient
(`release.acceptAffinity`), the two nations have a live trade relationship (a standing deal is
consent enough), or the recipient is small enough that any territory beats ceasing to exist.

A chunk large enough to stand alone never needs anyone's consent, which is why the predicate applies
only to the fragments that would otherwise be forced on a neighbour.

### D91 — Appeasement needed almost no machinery, and that is the point
**M4.4.** M3 put `gov.rulingIdeology` in the record and M3.3 made Civil Liberties a function of how
far the governed sit from the governing. So changing course is one field write, and **the model does
the rest**: liberties move where the new ideology is strong and where the old one was, grievance
follows, and M4.2's sentiment follows that. Nobody had to write "calms the aligned region and angers
another" — it is what the existing terms already say.

Verified live, Oklahoma switching Republican → Democrat: alignment at home **0.9338 → 0.6683**,
civil liberties **0.733 → 0.653**, Authority **0.765 → 0.647**. Which also shows the valve is a real
trade rather than a free fix: appeasing a minority alienates the majority you already had.

Three guardrails, because a free switch would let a player dodge every consequence in the game by
changing hats each turn: a mandate threshold (you cannot claim support you have no voters for), a
treasury cost **scaled by how far you move on the axes** (a small correction is cheap, a reversal is
not), and an Authority hit applied to the **stock rather than the target** — applied to the target,
the next power phase recomputes from the world and the shock simply vanishes.

### D92 — A nation that has never chosen drifts with its people; one that has chosen stays chosen
**M4.4.** `refreshGovernments` derives the ruling ideology from the plurality, which was right in
M3.4 when nothing else could set it. It is wrong the moment a player can deliberately govern by a
minority ideology: measured, the change fired — the money was spent, the Authority hit landed — and
then the refresh put the plurality straight back at the end of the same turn, **so the whole valve
was a fee for nothing**.

`gov.lastChange != null` is the record of a deliberate choice, so it is also the flag that says
"leave this alone". Unmanaged nations still track their own politics, which is what keeps AI
governments sensible; a nation that has chosen keeps its choice until it chooses again.

The consequence is wanted rather than tolerated: a government that has chosen can end up badly out of
step with its own population, which is precisely the pressure Civil Liberties and sentiment exist to
express. Changing course becomes a commitment instead of a toggle.

### D93 — The change-course cooldown needed its own clock
**M4.4.** It ran from `gov.since`, which looks like the same clock and is not. `since` is set at
founding, so **every nation began the game under an eight-turn lockout for a decision nobody had
made**; and `refreshGovernments` moves it whenever the population shifts a plurality, which would
hand a player a free reset for something they did not do. `gov.lastChange` is null until a
deliberate change and is the only thing the cooldown reads. Third instance of the same lesson as D66
and D88: when two quantities look like the same clock, they are usually two clocks.

### D94 — The simulator drives the real game, not a model of it
**M5.3.** `Sim.run` boots the same `Game.init` the page boots and calls the same `World.advanceTurn`
the Pass button calls. That is the only arrangement in which **tuning the simulator tunes the game**.
A separate lightweight model that "captures the essentials" would be a fourth implementation of the
world after the model, the tests and the explanation layer — and it would be the one everybody
trusted, because it is the one with the graphs.

The cost is that a run leaves the live modules holding that world, which is fine for a dev page and
is asserted rather than assumed: the suite checks that after a run, `World.getTurn()`, the roster and
the live movement shares are the ones the series reports.

Two things fell out of building it. `SimData` fetches **absolute** paths, because the simulator is
driven from `/dev.html` and from `/tests/run.html` and a relative path resolves against the page —
the suite silently fetched `/tests/data/game-data.json`, took the fallback, and threw one layer
later. And `TuneMeta` never exposed `createTune`, so `TuneMeta.createTune ? … : window.TUNE` fell
through to the live tunables and **every dashboard slider mutated the session it was modelling** —
caught by the test written for exactly that, which is the best possible outcome for a test.

### D95 — The dashboard is a renderer, generated from the schema
**M5.2.** Every one of its 142 sliders is built from `SCHEMA` — label, range, step and doc all come
from the same declaration the engine reads — so a tunable added in `js/tunables.js` appears with no
work and one renamed cannot leave a stale control behind. That is the return on M0.4 putting every
constant in one schema *with metadata* rather than in a bag of numbers.

The verdict cards are the questions a tuning pass actually asks, computed rather than eyeballed:
first-secession turn, the two death-spiral floors, the M1.6 political-spread collapse, the movement
reach span. Each is a question an earlier milestone asked once; the dashboard asks all of them every
run, so a regression in any of them is visible while tuning something else.

### D96 — The tuning pass: `sent.maxRise` 0.035 → 0.014
**M5.3.** The plan says "tune the West with it before going further", and the first run said why: at
the schema default the three deterministic western movements all declared by **turn 8, 9 and 10** —
the West fell apart before a player had learned the board, and three separate crises arrived as one
event.

`sent.maxRise` turned out to be a clean, near-orthogonal pacing dial. Measured across four seeds:
0.035 → first secession t9, 0.024 → t13, 0.018 → t17, **0.014 → t22–t29**, with the organised share,
the movement reach span and the within-nation political spread all essentially unchanged. At 0.010
the pacing is better still but movements start failing to arrive at all — Greater Idaho never
declares — so 0.014 is the last value before the game loses content.

Written to `content/tunables.json` with the measurement that justifies it, because a tuned number
with no record of what it was tuned against is a number nobody can ever change again.

### D97 — A movement declares with the ground it can actually hold
**M5.3.** Found by reading the simulator's own event log rather than by a test. A movement declared
on all its over-threshold Areas, and `breakApart` then split them: at seed 777 the State of Jefferson
*"declared independence, taking 4 Areas"* and **came into being with two**, because the four were in
pieces of {2,1,1} and the outliers were folded into neighbours. It was absorbed eight turns later and
re-declared at turn 29 with fourteen. The first declaration was a fizzle that cost a movement its
moment, and the claimed and founded numbers in the log disagreed.

The claim is now the largest *connected* piece, and it must clear `nation.minAreas` as a matter of
territory — the population escape in `breakApart` exists for civil-war fragments, which is a
different situation from founding a country on purpose. The two numbers now agree by construction,
and the outliers still arrive later through tier 1.

Worth keeping: a movement whose country is destroyed and which then re-declares bigger is **not** a
bug. Seed 777 reads as Greater Idaho revolting at t28, being crushed at t29, and returning at t30
with seventeen Areas. That is a story.

### D98 — The test fixture loads the authored tuning
**M5.3.** `tests/world-fixture.js` applied the schema defaults and never read `content/tunables.json`,
so the suite validated a differently-tuned world than the one that ships — and M5.3's tuning pass is
exactly the kind of change that would have silently stopped being tested. Same mistake as D50, in a
new place, and worth stating as a rule: **anything the game loads at boot, the fixture loads too.**

### D99 — One `plan` function, two callers
**M6.1.** The UI renders a Preview and then calls `resolve`; the AI plans over its candidates, scores
the previews, and resolves the winner. Being the **same function** is what stops the human's preview
and the AI's model from ever disagreeing about what an action does — and a disagreement there is
unfalsifiable from inside the game, because each side only ever sees its own answer.

The plan says to do this before anything else in M6, and the reason is that it unblocks three things
at once: deterministic replay (`resolve` takes the rng explicitly), outcome tests (`plan` is pure, so
an assertion needs no world and no dice), and the explanation layer (a Preview is already the shape a
tooltip wants).

A Preview is always `{ok, reason, cost, effects[]}`. `reason` is **a sentence**, not a code, so the
UI can print it and the AI can filter on `ok` without either of them re-translating anything. The
civil-war assessment is part of the *preview* rather than the result, because a player deciding
whether to take four Areas needs to know it would flip their governing ideology **before** they
commit — and `CivilWar.assess` is pure, so both callers get it from the same call.

### D100 — `Moves.legal` is the rules; scoring is policy and lives elsewhere
**M6.1.** `legal(nid)` enumerates every move a nation could make, unscored and unfiltered by whether
it looks like a good idea. If it pre-filtered on affordability the AI could never be given a
different opinion without changing the rules — and the test that pins this gives a nation a zero
treasury, checks it is still *offered* annexations, and checks `plan` is what says no.

One annex intent per bordering nation rather than the power set: a full enumeration of 3-Area
combinations is thousands of intents for a decision that turns on *which neighbour*, not which three
Areas.

### D101 — The player is an id in the model, not a nation in `store`
**M6.2.** `grep -rni "player\b" js/*.js` returned **zero hits** across thirteen modules before this
task. The only gate on acting was `nid === TurnSystem.currentId()`, which the human satisfied
fifty-one times a round — so an annexation was not a risk, it was a transfer between two of your own
accounts, and every anti-snowball device in the game was a speed bump you routed around by taking
the other nation's turn. That is upstream of every balance complaint in the review.

It lives in `js/game.js` and not in `store` for the reason the turn order moved out of `app.js`: it
is saved state, the headless suite has to be able to set it, and a renderer that owns a model
invariant is a renderer the simulator silently disagrees with.

It is an **id**, and `getPlayer()` keeps naming a nation that has died. `playerNation()` is the one
that returns null. Nulling the id on death would throw away the only answer to "what was I playing",
which is the first thing a defeat screen needs and the second thing a save wants to say.

**A fresh world has nobody in the chair**, and that is load-bearing rather than incidental: the M5
simulator and most of the suite drive `World.advanceTurn` directly, and if `Game.init` invented a
player then `AI.sweep` would find a slot to stop at and start consuming turns inside code that only
asked for a world. There is a test whose whole job is to say so.

Until M6.4's faction picker, the seat is assigned from the seed — the nation at the head of the
shuffled turn order — with `?play=<id or name>` to override, which is how a particular situation
gets played twice. Assigning rather than asking is deliberate: the milestone is about there BEING
one seat, and a chooser landing in the same commit would hide whether the seat works.

### D102 — `TurnSystem.advance` owns the round boundary; the sweep is one batch
**M6.2.** The world used to advance from `completeTurn()` in `app.js`, so the one clock in the game
was owned by the renderer: a headless caller stepping the turn order moved nations through a world
that never changed. That was survivable while a human took all fifty-one seats. From M6.2 most turns
are not taken by a human at all, so it moves to `TurnSystem.advance(tune, rng)` and `app.js` keeps
only what is genuinely UI — the banner, the newspaper, the autosave.

**Termination is the contract** of `AI.sweep`, not a detail, because its failure mode is a hung tab
rather than a wrong number — which is exactly the kind of failure the rest of the suite would not
notice. Three guards, three tests: no player (decline to start), a dead player (stop and report
`playerGone`), and a corrupted order (a `maxSteps` backstop that warns, and that the dead-player
test asserts is *not* what caught it).

The whole sweep runs inside one `Game.batch`, so fifty AI turns cost one repaint. Measured: 25 rounds
in 552 ms in the browser, about 22 ms per round including every render.

### D103 — M6.2 ships a seam with an empty policy, on purpose
**M6.2.** The AI passes. That is a decision, not a stub left behind: the turn loop is the part that
can hang the page, silently skip a round's growth tick, or diverge between the browser and the
simulator, and it should not land in the same commit as a scoring function whose weights will be
argued with for the rest of M6.

It is playable in the meantime because the world engine still runs every round — population,
economies, the power stocks, sentiment, secession — so nations still fragment and movements still
declare. Verified in the browser: playing Ohio, the State of Jefferson declared at turn 30 with 14
Areas and Greater Idaho ceased to exist, none of it scripted and none of it the player's doing.

The policy is a **field** (`AI.setPolicy`), not a function body, which is what lets the suite drive
the real turn loop with a deliberately bad policy — one that proposes moves the rules refuse — and
assert the game passes rather than throws. A move the policy proposed and the rules refused is a
pass: the AI is allowed to be wrong about what it can afford, it is not allowed to stop the game.

### D104 — The newspaper reports an interval marked by ledger id, not a world turn
**M6.2.** `headlines(turn)` answered "what happened during world turn N", which was the right
question while the human watched all fifty-one seats. The AI sweep straddles the turn boundary — the
nations after you in the order act in the old world turn, the ones before you act in the new one —
so a single-turn query silently drops half of every interval, including, on a bad interval, the
declaration of independence in the player's own back yard.

Marked by **id** rather than by turn because the question is "since I finished my turn", not "since
the world ticked", and those are two different clocks. It also keeps the player's own action out of
their own newspaper: they were told what it did when they did it, and an annexation outranks almost
everything, so re-reporting it would spend the lead slot on news they already have.

### D105 — The AI scores the player's own preview, and its reasoning is a Why record
**M6.3.** `AI.deliberate(nid)` walks `Moves.legal`, prices each candidate with `Moves.plan`, and
scores the **Preview** — the same object the human's panel renders. There is no second model of the
world, so a move that looks good to the AI looks good for reasons the player can read on their own
screen, and neither side can be right about an action while the other is wrong.

The score comes back in the shape `js/power.js` and `js/sentiment.js` already produce — `{value,
inputs:[{label, raw, norm, weight, contribution, key}], summary}` — because "why did Texas attack me"
is a question the game has to be able to answer and the ledger's `termsOf` already knows how to read
that shape. It does **not** go through `Power.build`, which clamps to [0, 1] because a stock cannot be
negative; a score has to be able to be, or the difference between a bad move and a catastrophic one
disappears exactly where it matters.

**Every term is a share of the acting nation.** That is what lets one set of weights serve a two-Area
rump and a sixty-Area giant without a size table: "a fifth more people" means the same to both.

**A prize is worth its odds.** A union hands over a whole nation, but only `chance` of the time, so
the growth terms are discounted by the preview's own probability. There is deliberately no separate
term for the odds: rewarding likelihood on its own scores a coin-flip over a tiny neighbour exactly
as highly as a coin-flip over a giant one.

**Posture is derived, not stored.** One number — strain, the peak movement share across the nation's
own ground against the secession threshold, which is what the pressure map already paints — and two
multipliers. A secure nation expands; a fraying one consolidates. No personality is assigned at
setup, so a nation's character follows its situation and can change back when the situation does.

Posture is read off each term's **stance** (`expand` / `hold`), not off its sign. Shedding a
seditious Area is a positive term that a fraying nation should want *more* of; reading posture off
the sign gets the release valve exactly backwards, and it is invisible until you watch a nation under
pressure decide to invade someone.

**Softmax, not argmax**, at `ai.temperature`. Always taking the best move makes fifty similarly-placed
nations behave identically on the same turn and makes the whole AI solvable: once a player knows the
weights, every future move is known. And a move must clear `ai.actThreshold` — passing is a
legitimate answer, not a failure to find one.

### D106 — Fifty nations playing every turn is a fuzzer pointed at the rules
**M6.3.** The plan said an AI "makes losses land on someone". It also plays every rule ten thousand
times, and it went straight for the two actions that cost nothing.

**Unite had no cooldown and no price** — the only action in the game with neither, and the one that
can hand over an entire nation. A free re-roll every turn makes any probability under 100% equal to
100% given enough turns, which is the absence of a rule rather than a balance problem. Measured on
the first run: 35 of 53 nations opened by proposing a union, and 51 nations became 18 by turn 20. Now
`unite.cooldownTurns` (charged on the attempt, so a nation cannot walk its border absorbing a
neighbour a turn) and `unite.costGdpShare` — buying out a government costs a share of what that
government is worth.

**Release had no price either**, which makes territory freely convertible into stability. Measured
over sixty turns at two seeds: with the AI never releasing, 51 nations become 54; at a relief weight
of 0.3, 76; at 0.9, 135. A move that buys safety for free is dominant at *any* weight, so the answer
is a price (`release.costGdpShare`) rather than a smaller appetite. It has a second effect worth
having in a game about holding a country together: a nation in real trouble may now be unable to
afford to let go.

**`nation.minAreas` was 3, below `release.budgetAreas` of 6**, so every release manufactured a
country: 75 of the 88 nations a fifty-turn game produced were released fragments rather than anything
anyone had fought for. Raised to 5 — bounded above by the authored movements, whose cores run from 2
to 5 Areas, so a floor of 7 would leave three of them unable ever to reach the goal they were
written to want.

**`annex.cooldownTurns` and `release.cooldownTurns` were both 1**, which is no cooldown at all once
every seat is actually played. Raised to 4 and 8.

None of this was reachable before. A human operating all fifty-one seats was never going to grind the
same 30% union for ten turns to find out that it always lands eventually.

### D107 — The ledger belongs to the model, and so does the tune
**M6.3.** Two things `actions.js` had been holding that only ever worked because one human was the
only thing that acted.

**The ledger writes lived in the UI.** The moment the AI took the other fifty seats, fifty-one
nations acted and one of them was logged — the newspaper reported nothing but obituaries, because the
only entry written from inside the model was the one `pruneEmpty` writes when a nation dies. They now
live in `Moves.resolve*`, which also removes the possibility of two callers describing the same event
differently. The one exception is `govern`: `Game.changeRulingIdeology` already writes a richer entry
because the change also moves the Authority stock, so it stays the single owner and `resolveGovern`
returns its entry.

**`Moves` read `window.TUNE` directly.** Invisible while the only caller was a page with exactly one.
Then the simulator started driving the AI — `Sim.run` layers overrides onto a *clone* so exploring
never touches the session — and every slider under Annexation, Unite and Release silently did
nothing. A dashboard whose sliders move nothing is worse than no dashboard. `plan`, `resolve` and
`legal` now take the tune explicitly, the same shape `js/world.js` uses.

And `actions.js` finally became what M6.1 said it should be: 1246 lines to 997, with `confirmAnnex`,
`confirmUniteAttempt`, `confirmRelease` and `confirmGovern` calling `Moves.resolve` and rendering the
result. The union preview reads `Moves.plan` too, and now tells the player how many of their own
Areas would leave — a number `planSplinter` had been computing all along and only the AI could see.

### D108 — The simulator plays the game, it does not watch it
**M6.3.** `Sim.run` stepped `World.advanceTurn` directly, so every verdict card in `dev.html`
described a map on which nothing deliberate ever happened. That was true of the game at the time and
stopped being true the moment the AI arrived. It now calls `AI.round`, which plays every seat and
lets `TurnSystem.advance` take the world over the wrap — the same clock the Pass button drives.

`AI.round` runs until the round **ends**, not for a fixed number of seats: a round that splinters a
nation inserts the newborns behind their parent, so counting seats stopped one short of the wrap and
the world never ticked at all on exactly the turns something interesting happened.

`tests/run.html?only=ai,secession` loads a slice of the suite. The full run crossed four minutes in
M6.3 because half a dozen suites now play tens of thousands of AI turns, and a suite you cannot run
part of is a suite you stop running.

### D109 — What the declaration drought actually was
**M6.3.** With the AI on, forty turns produced **zero** declarations of independence where the same
seed without one produced two. The obvious culprit was `refreshStates`, which required a movement to
hold **every** Area of its core — an AND across the whole core, which survived four milestones
because nothing could disturb a core: the world engine pushed sentiment up and only up. One annexed
core Area holds a movement latent forever.

Loosening it to 70% was the wrong fix, and the test suite said so within a minute: cores are *seeded*
over the threshold at setup, so at 0.7 the Cascadian Separatists declared on **turn zero** with 163
Areas. The all-or-nothing rule was the only thing standing between the opening position and an
instant secession.

The drought was caused elsewhere — unite and release were free, so the AI churned every border — and
fixing those brought declarations back at turns 39–44 across three seeds with the core rule at 1.0.
`secession.coreShare` ships at 1.0, which is the original rule, and stays in the schema because the
fragility is real and a future tuning pass should be able to reach it.

Worth recording as a pattern rather than an incident: **the first explanation for a symptom the AI
surfaces is usually the rule the AI touched last, and usually wrong.** The AI is a measuring
instrument; what it measures is everything at once.

### D110 — The fog could not have worked before there was a player
**M6.3.** `MapModes.pressureColor` chose between exact bands and calm/rising/critical by reading
`store.player`, and `store.player` never existed — `grep -rni "player\b" js/*.js` returned zero hits
until M6.2. The whole feature was inert, silently, because "no player" and "every Area is yours" take
the same branch. It reads `Game.getPlayer()` now.

`Sentiment.pressure` is the one definition of how close an Area is to leaving, moved out of
`MapModes` where the model then had to re-derive it. Two definitions of "about to secede" is exactly
the kind of pair that drifts apart quietly and disagrees only in the cases that matter.

### D111 — The seats of government are authored content, by name
**M6.4.** `data/game-data.json` carries no capitals, and the capstone needs them. Two options: derive
"the seat" from the largest Area in each state, or author the real ones. Authored, because
"you hold Montpelier" is a better sentence than "you hold the biggest Area in Vermont", and because
targeting metros would quietly turn Reunification into a population race it already has a term for.

Written as **state → county NAME** and baked to a FIPS by `build/`, so a typo is a loud miss rather
than a silently wrong county — all 51 resolved on the first pass. `build/validate.py` re-checks them
every run: that every state has one, that none names a county in the wrong state, and that every one
survives the Area merge. Two of the fifty-one sit in a county the merge folds into a larger Area, so
`Victory.load` resolves through `Game.areaIdOf` — the M1.13 trap, which discarded 48.2% of authored
references the first time it was met and would have been exactly as quiet here.

### D112 — Win conditions are a table, and each row is a Why record
**M6.4.** Three archetypes, one array of rows, each with an `evaluate` returning
`{met, progress, terms:[{label, value, target, met, key}], summary}` — the same shape `js/power.js`,
`js/sentiment.js` and `js/ai.js` already produce. So "how close am I" (the panel) and "why did they
win" (the end screen) are one query at two verbosities, and adding a fourth condition is adding a row.

`progress` is the **worst** term, not the mean. A victory condition is an AND; reporting 80% while
one requirement sits at zero would be a lie about the only number that matters.

Evaluated over **every nation**, not only the player's. A victory check that looks only at the human
is a game the AI cannot win, and an AI that cannot win is not an opponent, it is scenery.

**The Influence floor in the capstone is the whole design.** Without it, the shortest path to winning
is conquering the continent — the strategy the rest of the game spends its time punishing. The test
that pins it hands one nation every Area, every seat, all the people and all the money, and checks it
still loses on that one term.

### D113 — Conditional seats: sharing an ideology is not following somebody
**M6.4.** A seat you do not own counts toward Reunification if the holder governs as you do, your
Influence clears `win.seatInfluence`, **and** it exceeds theirs by `win.seatInfluenceGap`. The gap is
what makes it a relationship rather than a coincidence of politics: without it Ohio counted
twenty-eight of fifty-one seats on turn zero, because at the opening position most of the country
governs as most of the rest of it does, and the capstone was more than half won before a move.

With the gap, California still opens with eight, and that is the rule working rather than leaking —
it is the largest economy on the continent and its Influence genuinely exceeds most of the map's by
the margin. A big state starts closer to reunifying the Union than a small one, which is the whole
reason the difficulty tiers exist.

This is the "conditional vassal" the review asks for, read as **sphere of influence** rather than as
a contract, because there is no vassalage mechanic and the save format has nowhere to put one.

### D114 — The targets are calibrated against a measured world, not guessed
**M6.4.** The first cut of the thresholds was reasonable-sounding and completely unreachable: at turn
80 with nobody playing, the best nation held 10% of GDP against a 35% target, and Ideological
Dominance read **0.000 for all 107 nations** because `Game.dominantOf` takes a collection of Area ids
and was being handed one string, which iterated its characters.

Measured across an eighty-turn game after the fix — GDP share ≤ 0.102, population share ≤ 0.092,
seats ≤ 0.098, Authority ≤ 0.91, **Influence ≤ 0.53**, sway ≤ 0.448, QoL ≤ 0.98 — every target was
reset with the evidence written into its `doc`. The Influence ceiling is the important one: the two
floors had been set at 0.6 and 0.75 as if the stock ranged to 1, and nothing on the map ever gets
there.

Set at roughly two to five times what the AI-only world produces, on the reasoning that a player
playing deliberately for eighty turns should substantially outperform a deliberately mild AI. That
last step is a judgement, not a measurement, and it is the first thing a real play test should
revisit.

The per-capita median is taken over nations of at least `nation.minAreas` Areas: a played-out world
is mostly small pieces, and a median dragged down by a hundred rumps put Nevada at 153× the median,
which is one county with an airport and nobody living in it.

### D115 — Difficulty is derived, and the tiers are proportions of the field
**M6.4.** A faction's tier is computed from the opening position with the functions the game already
uses — Area count, economy, `demographics().cohesion`, `AI.strain`, and the share of neighbours
smaller than you. An authored tier list is a second opinion about the world that drifts from it the
moment anything is tuned, silently, because nobody re-plays fifty-one openings after moving a slider.

**Ranks, not ratios.** Population and GDP across the fifty-one states are heavy-tailed: measured
against California, Nebraska scores 0.048 and Vermont 0.010, so a ratio to the maximum put
forty-five of fifty-one nations in the bottom fifth and the tiers collapsed into one band.

**The bands are proportions of the field** (20% Comfortable, 35% Testing, 30% Punishing, 15% Brutal)
rather than fixed score thresholds. The question a new player is asking is "which of these is the
gentle one", and fixed thresholds answered it badly — the first cut put twenty of fifty-one nations
in one band and exactly one in another. Measured after: 11 / 17 / 15 / 8.

**Every nation is playable.** Restricting to a curated two dozen would be an arbitrary line through a
map whose whole premise is that every state is a country now.

**The handicap is money, not territory and not a rule change.** Every faction has to play the same
continent or the difficulty rating is describing a world nobody else is in. Money buys time — an
early annexation, a handover you could not otherwise afford — which is exactly what a hard opening is
short of. Paid once, in `Factions.choose`, because `Game.setPlayer` runs again on every load and a
grant that reapplied there would pay out for reloading.

And the card names the term, not the tier: "New Mexico's problem is economy — 147bn" and "Wisconsin's
problem is calm — 53% of the way to a breakaway" are two different games, where twenty cards reading
"Comfortable" are a list of names with extra words.
### D116 — Force is derived, and only the allocation is state
**M6.5a.** `manpower × equipment × doctrine`, read off population, wealth per head and whether the
state governs well and its people agree with it. Storing an army would be a second model of a
nation's strength that drifts from the first; deriving it means a nation falling apart gets weaker at
exactly the moment it needs the army, which is the honest direction for that feedback to run.

What *is* state is where the force points and how ready it is, and readiness follows the allocation
the way a power stock follows its target — rate-limited, falling faster than it rises. That rate
limit is the entire cost of changing your mind: without it the three sliders are something you set at
the moment of use, and a decision you can always take later is not a decision.

**A peacetime army suppresses nobody.** `mil.garrisonFree` is exactly the share the default even
split leaves at home, so a nation that has made no military decision holds no one down. Without the
subtraction every nation on the map quietly suppressed its own population from turn zero, which moved
the secession timeline for a world in which nobody had chosen anything.

### D117 — Autonomy scales the whole grievance rather than subtracting from one term
**M6.5b.** Self-rule is not "your quality of life improved", it is "this is your government now", so
it multiplies the grievance instead of discounting one input to it. It is reversible — which is the
only reason it is not release — capped at `autonomy.maxShare` because a state that governs none of
itself is not a state, and it costs revenue and Authority rather than liberties, which is what makes
it a different price for the same relief.

**The flag stores `true` plus a date, not the turn number.** It stored the turn, and turn 0 is
falsy, so a grant on the first turn of a game silently did nothing.

### D118 — Relations are one append-only list, directed and decaying
**M7.1.** `{turn, from, to, kind, magnitude}` with `relation(a,b) = base + Σ magnitude·decay^age`.
Memory, rivalry, gratitude, the coalition trigger and whether a neighbour will accept ground you are
handing over are all queries over the same list. The alternative is a scalar per pair per feeling,
which is a matrix that grows with every emotion anybody thinks of and cannot answer "why".

**Directed, not symmetric** — a conqueror is not resented by the ground it took in the way it
resents the neighbour who stopped it, and symmetric would be one line less code and would delete the
rivalry. **Decaying, not forgotten** — which is what makes "recently" mean something without anybody
storing a window, and what keeps a list that lives in the save document bounded.

`witnessed` — a nation minding somebody else's annexation — is the term easiest to leave out and the
one the coalitions rest on: a conqueror resented only by its victims is resented only by the nations
least able to do anything about it.

### D119 — Being big is not the crime
**M7.2.** `threat = size_share × (1 − influence)`. A nation can hold half the map untouched if the
other half is glad it is there, and a middling one can be surrounded because of how it got there.

It replaces a tier by size rank, and finding 36 measured what that was worth: with the shell fully
applied California still took 692 Areas on turn 1 and 1,602 of 1,676 by turn 3, with zero civil wars.
The finding's own recommendation is the shape used — a penalty the leader feels **every turn** rather
than a multiplier on a roll that rarely happens — so a coalition costs money every turn, standing
every turn, and puts its members' border armies in the way of the next annexation whether or not
they are the ones being annexed.

And it is a set of **named nations that each have a reason**, which is what makes it answerable and
escapable. A rank is neither.

### D120 — War weariness is the aggressor's, and it is a stock
**M7.3.** Being invaded was already expensive; what had no cost at all was doing the invading, over
and over, and winning. Weariness is what makes a campaign a campaign rather than a series of
unrelated rolls.

Its fourth term started as "share of the population under arms" and was wrong in an instructive way:
force *size* is not a choice in this game — `mil.manpowerShare` is fixed — so that term read as a
constant for every nation forever, a permanent drag with no lever. The **posture** is chosen every
turn, so the term is the share of the army in the field, and it is the one place the M6.5 allocation
costs something at home.

**`power.floor` does not apply to it.** A floor of 0.08 on a stock that means "how tired of war are
you" says a nation at peace is permanently eight per cent exhausted.

### D121 — A crisis invents no mechanics
**M7.4.** Every trigger reads a fact some other system already computes and every effect moves a
number some other system already owns, so `content/events.json` is content and a new crisis is a row.
A table that could invent mechanics would be a second design living in a data file.

A test checks structurally that no option **dominates** another — beats it on every shared axis while
costing nothing of its own — because an option that is strictly best is a button wearing a choice's
clothes.

### D122 — A leader is a thumb on the scale, and every trait pays for what it gives
**M7.5.** The five stocks already explain themselves term by term, so a leader is one extra named
line in each stock they touch rather than a mechanism of their own. A test checks structurally that
no trait is all upside, because a leader who is simply better than another leader is a stat rather
than a character. (The Steward was, until it caught one.)

Two traits **sum**, so a Hawk paired with a Reformer cancels, and traits are drawn against the
government's ideology at three to one — a more interesting distribution than either always-on-brand
or a coin flip.

**And it made `Power.build` learn about signed inputs.** Mapping a modifier of roughly -1..1 onto the
0..1 an ordinary term wants gives every nation a constant offset and quietly moves the base for
everybody; three "sits at the base" tests caught it. A Why record also must not seat a leader as a
side effect of describing one, which the first cut did.

### D123 — The timeline is one baseline and a list of deltas, with a cast
**M7.6.** Ownership barely moves between two turns, so a full snapshot per turn is a quarter of a
megabyte of almost entirely repeated numbers. Measured over thirty turns: 13 KB, with a test pinning
that it stays under a third of the naive size.

**Nations are recorded when they first appear**, name and colour kept after `Game` has forgotten
them, because half the roster will not exist by the end and a timeline that cannot name the country
that used to be somewhere is a timeline of grey shapes.

### D124 — A flag is a pure function of the id, and a name is drawn against the ideology
**M7.7.** Layout, palette and charge all fall out of hashing the nation id, so a flag survives a save
without being in one, is the same flag everywhere it is drawn, and cannot drift from the nation.
Nothing is stored and nothing needs migrating.

Names come from `content/names.json` drawn against the **founding ideology**, because the name is the
first thing the game tells you about a country and it should be true: a Distributist breakaway is a
Compact and a Nationalist one a Directorate. The county suffix is stripped, because "Cook" is a place
and not a country.

**Two countries may not share a name.** The first cut minted the Fairfax Federation twice, which is
not a flavour problem: it is a leaderboard with two identical rows and a newspaper that cannot say
which one did the thing. Every template is tried, then the generic ones, then the place is qualified
— "Upper Fairfax Federation" reads as a country where "Fairfax Federation (2)" reads as a bug.

### D125 — Recognition is one scalar and one matrix, and the default is the storage trick
**M7.8.** The fifty-one founding nations are recognised by everybody always and nothing is written
down for them; only a nation born during play needs a row. So the matrix is empty on turn 0, holds a
handful of sets in a normal game, and never grows to n².

**The parent is the pivot.** Recognition is earned by standing, kinship, endurance and size, and —
worth more than all of them — by the state you broke away from giving in. Measured: Texas's chance of
recognising the State of Jefferson was 0.07 a turn while California called it a rebellion and 0.24
the moment California signed. That is what makes the player's own recognition a move worth having.

This forced a matching change to M7.1: the parent's own feeling about a secession had never been
recorded, on the grounds that Authority already reads the Areas lost. True until the parent's opinion
became the thing the rest of the continent waits on — with nothing on record, a parent recognised its
own breakaway as readily as a stranger would.

**A save that predates the concept says nothing, not "no".** Loading one adopts every nation founded
in that game as recognised, because the alternative is a save that got worse for having been saved.

**And the Influence term is a deficit** (`legitimacy - 1`), so a recognised nation contributes exactly
nothing. Written the other way round it would have raised every established nation's Influence by a
constant and quietly re-tuned the coalition trigger for the whole board.

### D126 — Migration is a gradient along the graph, and arrivals do not join movements
**M7.9.** Nobody computes the best Area on the continent and walks there; people move toward the
better Areas next door, in proportion to how much better. Flow along the adjacency graph is what
makes distance real without a distance calculation.

**Alignment is the term that changes the game**: people move toward people who think as they do, so
a divided nation sorts itself into homogeneous halves and those halves are the ground a movement
organises on. Measured in isolation over twelve turns, the average Area's dominant ideology goes
63.3% → 66.5% while political drift pulls the other way.

**Movements shrink with the people who leave and are diluted by those who arrive.** Membership is
people; somebody who moved in last quarter is not a member of the local separatist organisation. That
asymmetry is what makes settlement an answer to secession.

Every flow is computed before any is applied. This is the first phase that writes to its
**neighbours**, and applying as it went would let the first Area's arrivals decide the second Area's
departures — the node numbering would decide who moved.

### D127 — An election is the population, adjusted by the record, measured against the world
**M7.10.** The base is every ideology's share of the nation's people. The government gets one swing
against it, made of the four things it is answerable for, and that swing is measured **against the
world mean rather than the middle of the range**: the stocks do not sit around 0.5, so a term centred
there hands every incumbent alive the same large bonus. With that mistake in place, 284 elections
over 84 turns turned out three governments and a government holding 39% of its people against a rival
holding 58% was re-elected. Against the mean it is 56 of 266.

**The schedule is derived, not stored** — `(turn + hash(id)) % term` — so it needs no field in the
save, no migration and no reset, and fifty-one elections do not land on the same turn.

**A result can be refused only by a government that has already ground its people down.** The
capacity and the score are the same fact, so nothing new had to be invented to say who may; the price
is a further shock to the liberties that allowed it. The rule is identical for the player, except
that the player is asked — it is the one moment in the game where the honest answer and the available
answer differ.

Losing an election does **not** consume `gov.lastChange`, the cooldown on the appeasement valve: that
clock means "the last time this government CHOSE a course", and losing a vote is the opposite of
choosing one.

### D128 — Reach decays from one core, or it does not decay at all
**M7.11.** The first cut made every seat of government a nation holds a projection source, on the
reasoning that capturing a capital should extend your reach. Measured, that made the brake a no-op:
an empire built by conquest captures capitals *by construction*, and one holding 852 of 1,676 Areas
had twenty-four seats and full reach over every frontier target it had.

So: one source, the government's own seat if it still holds it and otherwise its largest Area. The
shape that falls out is the interesting one — an empire grows as a blob around its capital and a long
thin one cannot push at its far end whatever it holds in between.

**A nation always reaches its own soil**, floored after the search so it never feeds the frontier:
holding and taking are different questions.

**And the distance array is Float64.** Stored as Float32, an accumulated cost is rounded on the way
in and compared against an unrounded copy on the way out, so Dijkstra discards a node's own heap
entry as stale — Oregon sat 3.05 from Sacramento by Bellman-Ford and read as unreachable, and 481 of
944 annexation targets were being refused for a rounding error. It also cost a knob: a home-ground
discount was added to fix a Texas that could not reach one of its twenty targets, and the cause was
the rounding. A knob that exists to work around a bug is worse than no knob.

### D129 — The east gets its own separatisms, and Delmarva is the sixth
**M7.12.** Every movement mechanic runs on an Area being inside somebody's homeland, so Kentucky and
West Virginia having no homeland at all meant separatism was a western feature of a game that ships
the whole country. Five movements were authored county by county rather than filtered out of a rule,
because a homeland is a claim about a place: Franklin, Acadiana, New England Revivalist, Central
States Union and — beyond the five the plan names — the Delmarva Republic, because the peninsula that
has petitioned for its own statehood more than once was the only honest way to close Maryland and
Delaware. A movement that covered them from somewhere else would be a coverage patch wearing a name.

**Franklin and New England Revivalist spawn deterministically**, for the same reason Cascadia and
Deseret do. The first bake left all six rolling at 0.5 and produced a world with one eastern movement
in it: an East with no Franklin is not the widened East.

### D130 — The west's own holes, and Cascadia was wrong
**M7 close.** Closing the east left 179 Areas that could never receive a movement, almost all of them
western — a flagship slice whose flagship state had 36 of its 58 Areas outside the system. Three more
real movements close it: California Republic, the Sagebrush Rebellion and the Fifty-First State,
which eleven Colorado plains counties voted on in November 2013.

**And Cascadia's homeland was the R-leaning inland northwest**, which is not Cascadia: it derived a
core of Butte and Shasta counties in *California* and Ada and Bannock in *Idaho*, while the test
alongside it asserted the core was the Portland–Seattle corridor. The documented intent was right and
the data was wrong. The rural inland it used to hold is already Greater Idaho's and the Northern
Christian Kingdom's, twice over.

Areas that can never receive a movement: 348 → 278 → 179 → **0**, and the validator warning that has
stood since M1 is gone.

### D131 — Home ground is a set stamped at birth, not a state code (D-M8c)
**M8.1.** `homeSt` was one modal state FIPS and occupation was `area.st !== homeSt`. That reading
breaks in both directions the moment the opening board is not fifty-one intact states: all five
Texan successors would read `'48'`, so Dallas annexing Houston would pay no occupation anywhere in
Texas; and a Deseret spanning seven states would count most of its own founding homeland as
occupied — paying the superlinear surcharge, dragging four power stocks, and **suppressing its own
movement on its own soil** through the sentiment suppression term.

Home ground is now a per-nation `Set` of Area ids, stamped once: an origin state gets every Area of
its state (identical to the old rule, and the suite proves it), a nation born in play gets its
founding grant whatever states that spans. Ground taken later is never home and nothing becomes home
by being held long enough — an occupation cost that expired on its own would be a timer, not a cost.
`homeSt` survives as a display fact and no rule reads it.

**It is not bit-identical on the baseline board, and the divergence is the change.** At seed
20260829 the first difference from the pre-M8.1 world is world turn 2, and the only value that
differs anywhere in the fingerprint — ownership, population, GDP, movements and the other fifty-four
treasuries all identical — is the treasury of the **Washoe Republic**, founded on turn 1 out of
Washoe County (Nevada) and Placer County (California). Its modal state was `'06'` on the
alphabetical tie-break, so the county it is *named after* was foreign soil to it. $274,717,136
before, $275,774,192 after: it stopped paying an occupier's surcharge to stand in its own capital.

### D132 — The save path walks the field registries instead of naming fields
**M8.1.** `Game.serialize` and `Game.loadState` each hand-enumerated what they copied, which is the
failure `js/state.js` exists to end one level down: a field added to the record works for a session,
is dropped by the save, and reappears at its default when the game is reopened. It had already
happened here — `makeGov` carries a comment saying so about `gov.lostAt` — and `home` is exactly the
kind of field it happens to next.

Both halves now iterate a table. The Area columns come from `state.savedFields()`, which the audit
found was called only by tests; `owner` is marked `save: false` with a reason (a document states
ownership once, as each nation's Area list, and a second copy keyed on a nation *index* would not
survive a roster that loads in a different order) and `pop` carries `saveKey: 'p'` so the frozen v2
key survives a column rename. The nation record gets its own `NATION_FIELDS` table with optional
`out`/`in` converters; `counties` is deliberately outside it, because ownership is restored by
writing the owner column rather than by assigning to a derived getter.

### D133 — Movement homelands widen in the bake and nowhere else (D-M8f)
**M8.2.** `phaseSentiment` hard-deletes any share outside the baked homeland every turn, and runtime
homeland edits do not survive a save — so a scenario that seeds sentiment outside a homeland is not
writing a subtle bug, it is writing a value that disappears on the next turn. Deseret's homeland goes
from 41 Areas to 61, Cascadia gains the cultural document's own Cascadia leaf, and the State of
Jefferson gains Mendocino and the rest of the southern Oregon tier.

**The regions come from `content/cultural.json`, not from a hand-copied list.** The Mormon Corridor
and Cascadia are authored there, in the map mode the player can see and the editor can republish;
a second copy in `build_parties.py` would drift the first time either was repainted. The bake reads
the doc and expands each Area back through `areas.json` into its member counties, because everything
else in that file is county FIPS and a homeland written in Area ids would derive its core from a
fraction of the people who live in it.

**Deseret keeps `states: ["49"]` beside the corridor.** The corridor covers 25 of Utah's 29 counties,
and dropping Carbon, Emery, Grand and San Juan would put four Areas outside every homeland in the
game — the exact hole the M7 close spent a milestone closing. The corridor is the scenario's cession
ground; the homeland is the corridor plus the rest of its own state.

### D134 — "Grows faster" is a rate, not a bigger seed (D-M8g)
**M8.2.** A seeded share erodes back toward the formula's target at `sent.maxFall` every turn, so
planting a bigger number makes a region angriest on turn 1 and calmest by turn 10 — the story
backwards. `growthRate` is a per-movement multiplier on `sent.maxRise` (default 1.0, Deseret 1.5),
baked → live record → `Sentiment.build`'s `rises[]` → the one comparison in `phaseSentiment`. The
RISE only: a movement that falls at its own speed would make "organising is slower than collapsing"
a property of a movement rather than of the model.

Measured as an A/B on one bake — because changing a homeland changes the derived core, which changes
how many draws seeding takes, which reshuffles the spawn stream for every movement after it — 20
world turns at seed 20260829 with no AI:

| | mean share | peak | organised |
| --- | ---: | ---: | ---: |
| rate 1.0 | 0.2417 | 0.4446 | 1,831,462 |
| rate 1.5 | 0.3532 | 0.5769 | 2,552,558 |

and the reference movement, New England United, is identical to the person at 5,532,593. Franklin
and A Free Texas move by one and four people, which arrives through the world market rather than
through sentiment.

### D135 — The scenario is authored content applied by one DOM-free module (D-M8a)
**M8.3.** `content/scenario-shattered.json` says what the board is; `js/scenario.js` knows nothing
about Texas. Claims are resolved against the cultural document's own `assign` table, so a leaf
repainted in the editor moves a successor's border and no code changes. Two phases, and the split is
the ordering contract: `apply` after `Parties.setup` (movements must exist to be wired) and before
`TurnSystem.begin` (or the successors are never dealt a turn) and before `World.begin` (the power
stocks open *at target* on whatever they see, and `History.capture(0)` takes the timeline's first
frame); `afterBegin` strictly after `World.begin`, which calls `Recognition.reset()` and would
silently erase anything phase A wrote there.

**Default game = shattered**, reachable back through `?scenario=none`, `opts.scenario` in Sim, and
default-off in the test fixture. The 785 pre-M8 tests keep booting the baseline and stay meaningful
as the model's baseline: a scenario is content laid over one engine, not a second engine.

**An authored partition is validated before anything moves**, and the error names the FIPS. Three
ways it can be wrong and all three are silent without the check: an Area that is not on this map
build, an Area the dissolving state does not hold, and an Area claimed twice or not at all. The last
is the one that actually happens — the Dallas leaf carries eight Oklahoma Areas and El Paso one —
and its symptom without a check is a Texas that survives the shattering holding nine counties in the
Panhandle.

### D136 — Successors are founding states; Deseret is a declared breakaway (D-M8b)
**M8.3 / M8.6.** The eleven Texan and Californian successors and Cascadia carry `origin: true`:
recognised by construction, no honeymoon, no parent, because the dissolution settled before turn 0.
Deseret is `origin: false` with `Recognition.founded(id, '49', {recognised: false})` authored in
phase B — a pariah earning recognition in play, whose parent's signature is the key that unlocks the
continent, on the board from turn 0.

`World.applyIndependence` bundled two opposite things and is now two functions. Deseret takes the
honeymoon Authority term and **not** the 12% transition GDP cut: the shattering predates the first
turn, and an economy that opens under its own published figures reads as a data bug rather than as a
story.

**Setup writes no `declare` or `died` entries** (D-M8e). `Sim.summarise` reads those two words for
`firstSecessionTurn` and `nationsLost`, and dev.html paints a verdict card red below turn 12 — a
shattering that spoke in them would report every run as broken before the first turn. A dedicated
`scenario` ledger kind carries it instead, and the turn-0 newspaper prints those entries once as the
opening edition. `pruneEmpty` grew a `quiet` flag for the same reason: a dissolved parent runs out
of ground and lands there, and its death is announced in the scenario's own voice.

### D137 — Austin's government is authored, and the reason is a measurement
**M8.4.** The plan says governments fall out of the plurality and Austin lands blue because the data
says so. The data does say so — its thirteen Areas are 47.9R–50.6D by population, blue ahead by
98,404 people, and 47.1R–51.4D by vote — but the turn-0 plurality does not: the Techno-Autocrat seed
in Travis converts people out of a blue supermajority and takes more blue than red with it, and
across eight seeds Austin landed red five times and blue three. A flagship of the scenario should not
be a coin toss against its own data, so the government is authored in the scenario file with that
measurement written beside it. Cascadia's green is authored for the opposite reason: it is
*deliberately* not what its people lean toward.

**And docs/SHATTER-PLAN.md's Texan population column is wrong.** Its rows were computed by summing
only each Area's representative county and dropping the members the Area merge folded into it — the
M1.13 trap one level up — so they understate every Texan successor and miss 1.5M people between
them. Real: Dallas 9.34M, Houston 10.07M, El Paso 2.79M, Austin 3.69M, San Antonio 5.40M, summing to
Texas's own 31.29M. The California rows happen to agree because California has 58 counties and 58
Areas and nothing is merged.

### D138 — The cession rolls per Area, and the odds were tuned against the measurement (D-M8d)
**M8.6.** Deseret's cession draws from a new named rng stream, `scenario`, so that taking
fifty-seven numbers does not reshuffle which movements exist in every game on the board.

**One roll per Area at its sub-region's odds, not one roll per sub-region.** A roll per sub-region
has the same mean and a ruinous variance — five coins decide the whole map, and one seed in
seventeen hands Deseret nothing but the Wasatch Front — and, more interestingly, it makes the
connectivity rule a no-op, because whole sub-regions are contiguous and almost never strand
anything. Areas do, and the ones they strand are the places that voted to leave and did not get to.
That is what `leftBehind` is for.

The plan's odds (1.0 / 0.70 / 0.50 / 0.40 / 0.35) are an expected 30.8 of 57 Areas *before* the
connectivity filter, and on a corridor this thin the filter is not a rounding error: about nine of
every thirty-one rolled Areas end up cut off from Salt Lake. Measured over 20 seeds at the paper odds
the cession ran 14–39 with a mean of 21.3. The shipped odds are 1.0 / 0.82 / 0.70 / 0.60 / 0.55,
which measures 19–45 with a mean of 31.1 Areas and 3.75M people — where the design said it should be.

### D139 — The corridor that stayed gets a seed AND a standing grievance
**M8.7.** Two different things. The seed is where the movement starts and is deliberately **under**
`secession.countyThreshold`, because an Area over the line on turn 0 defects on turn 1 — the
turn-zero Cascadia disaster `movements.js` carries a note about. It is written with the
grow-then-set pattern, because `clampMovements` scales a movement back to what its ideology actually
holds and a seed written the naive way is clamped most of the way back to nothing before the first
turn runs.

`attrs.sentBoost` is the other half: a per-Area term inside grievance, weighted by `sent.wBoost`, and
the only thing in the sentiment formula that is a property of the *place* rather than of the nation
holding it. It rides inside grievance rather than beside it, so it is still multiplied by `base`: an
authored grievance cannot radicalise ground into a movement whose ideology it does not share, which
is the rule the whole formula is built on. `attrs` already round-trips in the v2 document, and
because `target` and `explain` are one implementation the boost shows up as a named row —
"Unfinished business" — in the Why panel with no second code path.

Measured over 40 world turns at seed 20260829, mean Deseret share across the 28 Areas the cession
left behind: **0.2950 → 0.4597** as shipped, 0.4024 with `sent.wBoost` at zero, 0.4193 with
`growthRate` at 1.0. The boost is worth +0.057 of share and the rate +0.040.

**What is not measured is the comparison the milestone asked for** — the corridor's slope against
another movement's home ground — because it cannot mean what it sounds like: the corridor is *seeded*
at 0.295 and every movement converges toward its own ceiling, so anything starting near zero
necessarily posts the steeper line. For the record it is +0.0041/turn against Franklin's
+0.0090/turn, from 0.295 and 0.056. The A/B on one board is the measurement that isolates the claim.

### D140 — The statewide movements are retargeted, not deleted (D-M8j)
**M8.8.** "A Free Texas" and "California Republic" would otherwise declare a sixth Texas out of the
five successors. They stay, with their type changed to `reunification` and goals to match, because a
movement to put the old state back together is exactly the right pressure on a board that has just
come apart — and the mechanics already do the right thing, since each homeland is the whole of its
state and what it founds if it declares *is* the old state coming back. Names unchanged: renaming
would break the deterministic-spawn list and every save that carries one.

`origin: true` needed a label other than "former U.S. state", so the nation record gains a display-only
`kind`: `successor`, `breakaway`, or nothing. No rule reads it.

### D141 — One menu button, and starting over is a reload
**Post-M8.** The game had no New game. The only route to a fresh world was `?fresh=1` in the address
bar, which is a route nobody who has not read `app.js` can find, and the four bare header buttons
that did exist (Save, Load, Timeline, Enter map editor) were competing with eight map-mode toggles
and two selection toggles for the same eye. The header is now for the MAP — what you are selecting,
how it is coloured, where the lines are — and one accent-coloured **Menu** button opens everything
that is about the GAME (`js/menu.js`).

**Starting over is a page reload, deliberately.** A new world is not a state transition this game
can make in place: boot assembles the map, the party roster, the opening scenario, the power stocks
and the timeline's first frame in one ordered pass, and eight modules hold state that only `reset()`
at that point in that order clears correctly. Reloading runs the ONE code path known to produce a
valid world rather than a second, quieter one that would have to be kept in step with it forever.
What the dialog does before reloading is `SaveManager.clearLive()`, because the next boot resumes
from `data/state.json` — and because that is destructive and unrecoverable, the dialog says so and
offers Save first.

The URL it reloads to is **built from `location.pathname`, not by editing the current query**, so
the flags that decided the last game (`?play=`, an old `?seed=`) cannot leak into this one; `?dev=1`
survives, because it is a property of who is at the keyboard rather than of the world. There is
deliberately **no `?fresh=1`**: that flag skips the resume without deleting anything, so leaving it
in the address bar would make every later reload silently discard the game in progress. Delete the
document, hand back a clean URL, resume normally from there.

`?seed=<whole number>` is new and is what makes the dialog's Seed field mean anything — the same
seed and the same board deal the same opening every time. A value that is not a whole number is
ignored with a console warning rather than coerced, because a seed of `NaN` is a silently different
game every reload; the dialog refuses it before it can become a URL.

Two smaller consequences. `openModal`/`closeModal` moved from `saves.js` to `app.js`: they stopped
being a save/load detail the moment a second module needed to stop the game and ask a question, and
the card now also closes on Escape. And `editor.js` no longer repaints a header button's label on
enter/exit — the menu is rebuilt from `Editor.isActive()` every time it opens, so "Enter map editor"
/ "Leave map editor" and "Timeline" / "Close timeline" cannot fall out of sync with the thing they
describe, and there is no `getElementById` in the editor to throw the day that button is renamed.

An item that cannot run says so and says why: an in-flight action carries Sets of county ids that
outlive the world they came from, so save, load, timeline and the editor are all unsafe while one
holds the map. The menu draws them disabled with the reason above them rather than letting them be
clicked and then refusing — the same bargain the action panels make everywhere else.

### D142 — The election clock, and why one test hid the bug for three milestones
**M9.2.** `World.advanceTurn` calls `Elections.tick(tn, rng, { defer, asOf: turn + 1 })`, and `hold`
stamps `gov.lostAt = asOf` — deliberately, because the count happens while turn N is being resolved
and the decision belongs to whoever is looking at the board on N+1. But `steal` and `pending` both
compared `lostAt === World.getTurn()`, which still reads N inside the batch. So the AI's immediate
refusal always returned "There is no result to refuse", and every police state in the world politely
conceded. The documented behaviour was dead code on the only path that runs it.

The fix is one helper, `isOpen(n, asOf)`, and two kinds of caller: inside the batch you pass the
`asOf` you are resolving under, outside it you pass nothing and get `World.getTurn()`, which by then
has caught up to the stamp. That is why the player's modal always worked and nothing else did.

**The test that covered it passed**, and that is the part worth recording. `tests/elections.test.js`
called `tick` with no `asOf` — the single arrangement in which the two clocks agree, and one
`js/world.js` has never used. A regression test that invokes the function the way the caller invokes
it is now beside it, written as a separate case rather than a parameter, because "stealing works" and
"stealing works where it is actually called from" are two different claims. Measured through
`World.advanceTurn` with every government eligible: 222 elections over 60 turns, 32 changes of
government, **32 refusals**. Before: zero, for any number of turns.

### D143 — One expression for the annexation multiplier, called twice
**M9.3.** `planAnnex` previewed a Force number built from the reach penalty and the army ratio;
`resolveAnnex` built its own from the coalition shell and the army ratio. Neither had what the other
had. So a war at the edge of reach was priced higher, previewed as harder, and then **fought exactly
as well as one next door** — one of the three things §6.4 says reach does simply did not happen —
while a nation the world had ganged up on was previewed a fight it was not going to get.

The plan/resolve split exists to make precisely this impossible, and it had happened anyway, because
the two sides were two expressions kept in step rather than one expression called twice. `planAnnex`
now computes `scoreMult = (1 + shell) * Military.warMultiplier * reachWar` and `resolveAnnex` reads
`plan.scoreMult`. The test asserts the resolver's returned `scoreMult` equals the plan's, and that
the plan's equals the product of all three factors — structural rather than numeric, because a
pinned value would pass again the moment somebody rebuilt the expression with a different set of
terms.

### D144 — The 4x rule moved out of the click path
**M9.3.** `annex.strongNeighbourFactor` — you cannot annex from a nation more than four times your
size on both population and GDP — was enforced in `Actions.startAnnex` and nowhere else. That is the
human's click path. The AI plans through `Moves.legal` and resolves through `Moves.plan`, and neither
knew the rule existed: fifty nations played by a looser rulebook than the one person it was written
for, and the map tooltip derived its own third answer to the same question.

`Moves.tooStrongToAnnex` is now the only implementation. `plan` refuses, `legal` never offers, and
both UI callers ask it rather than re-deriving it.

**A test changed with it, and the change is the milestone working.** `a different seed can give a
different result` used Delaware — a small state taking a big bite, which is the case that actually
rolls dice. Delaware's only neighbours are Pennsylvania, Maryland and New Jersey, all of them past
the factor, so under the rule the human has always played by, Delaware cannot annex anybody at all.
The test could only ever have been written against a move no player could make. It is New Hampshire
now: same shape of case, against a neighbour it is legally allowed to bite.

### D145 — Every panel renders the plan it resolves
**M9.4.** Three action panels showed a number the resolver did not charge. Unite charged 8% of the
target's GDP **on the attempt** and the panel never mentioned it — so a player could take a 30%
chance, lose the roll, and discover the fee afterwards. Release charged a 10% settlement and the
panel showed only the savings, which made a valve deliberately priced as *relief* read as a pure
gain. Annex called `Moves.annexCost` directly, which is the BASE price: the charged price is that
times `Projection.costMultiplier`, so at the edge of reach the shown price understated the bill by up
to 1.6x — the exact case M7.11 made central.

All three now render `Moves.plan(...)`, which also means they refuse for every reason the resolver
refuses, before the click rather than after it, and name the reason. The annex panel gained two rows
that had never existed anywhere in the game: the reach surcharge as a percentage, and the odds the
army fights at when it is out past its own projection.

### D146 — The victory alarm asks a different question
**M9.5.** It was `standings().filter(progress >= win.warnAt)`, and it fired on turn 1 of every game:
three nations "84% of the way" before anybody had done anything. That is not a threshold set too low,
it is the wrong question. `progress` is the WORST term of a condition, and the worst term of two of
the three conditions is a power stock that opens near its target and stays there — so "is anybody
near a victory" is answered yes on the opening board, permanently, by nations that are not going
anywhere.

The question is now "has anybody MOVED toward winning", gated three ways: near (`win.warnAt`), moving
(`win.warnDelta` since we last looked at that exact nation-and-condition pair), and quiet (not
already said inside `win.warnRepeatTurns`). Plus a grace gate — `check` refuses to return a winner
before `win.graceTurns`, so warning before then is warning about a race nobody can finish.

`win.warnDelta` is **measured, not chosen**. At seed 20260829 over 40 turns, across every nation
already past the bar: 314 turn-to-turn moves, median **+0.0127**. The first threshold tried was 0.01
— below the median, so it fired on less than routine settling and was not a threshold at all: 143
alarms before turn 12 and 98 after it. At **0.03** the same run reports three times, all after the
grace period.

The baseline is deliberately NOT saved. A fresh boot or a loaded game has nothing to compare against,
records the board and says nothing; one quiet turn after a load beats a false alarm, and it is the
same mechanism that makes turn 1 silent.

### D147 — The journal, and the end of the single toast slot
**M9.7.** `flash()` is one slot. Every action confirm flashed its result and then synchronously
called `completeTurn()`, which flashed the newspaper over it — in the same frame. The civil-war dice
roll, the richest feedback this game produces and the thing `Moves.resolve` goes to the trouble of
logging as `terms`, was painted for zero frames and replaced, every single time. DESIGN.md §7.7
describes that pathology as fixed. It was not; only the content had changed.

The fix is not a longer toast or a second slot. A game whose identity is "it explains itself
honestly" needs somewhere the explanation STAYS, and the ledger has been that record since M6.3 —
what was missing was a surface. `js/journal.js` is a docked, turn-grouped, filterable panel that
reads the ledger and owns nothing: no state to serialize, because the ledger already round-trips
through the save, so a loaded game reopens with its whole history intact.

The division of labour now: **flash** is transient status and the victory alarm; **the journal** is
everything that happened, permanently, with the Why rows beside each entry; **the newspaper** is no
longer a message that arrives and leaves — it is the journal's turn header, the same `Ledger.rank`
headlines rendered as the divider between one turn's entries and the next. An action result still
flashes, because feedback at the point of the click is worth having, but it is now a copy of
something durable rather than the only telling of it.

The filters are FAMILIES, not kinds: `Ledger.KINDS` has twenty entries and a row of twenty chips is
not a filter, it is a second problem. Everything · Yours · Ground · Politics · The world, and every
kind lands in exactly one, so "Everything" is genuinely the sum of the others.

### D148 — Three sweeps: weariness, the migration clamp, and the tuning a save carries
**M9.8.** Each one small, each one the kind of thing a second programmer trips over.

**War weariness inherited the wrong asymmetry.** `power.maxFall` (0.08) is deliberately larger than
`power.maxRise` (0.05) because the other four stocks are things a nation HAS and standing is easier
to lose than to build. Weariness is a thing a nation SUFFERS, and inheriting those limits inverted it
exactly: a country exhausted itself slowly and shrugged the exhaustion off half again as fast. It has
its own pair now, the other way up, and `Power.step` takes them as a parameter for the same reason it
takes the floor as one.

**The migration clamp created people.** The apply step ended `Math.max(0, was + d)`, which is a
one-sided guard: `leaving` is computed from `snap` and applied to `nxt`, and any earlier phase that
left `nxt` lower made the source clamp to zero *after* the destinations had been credited the full
share. That does not lose people, it invents them — a few at a time, in the one phase whose headline
invariant is that it conserves, and the suite's one-sided total-population check passed throughout.
`leaving` is now capped at what is actually in the buffer, which makes the clamp unreachable, and the
phase report carries `clamped` so that if it ever is reached we find out then rather than as eleven
million extra people in turn forty.

**A load merged the tuning instead of replacing it.** `doc.tune` is `TUNE.diff()` — what the saved
game was PLAYED with — and `statedoc` applied it with `load`, which merges. The dev dashboard sets
overrides on the live TUNE, so this was not hypothetical: move a slider, load a save, and the loaded
game silently keeps your slider, running on a third tuning that neither the save nor the session ever
used. `TUNE.replace` resets to schema defaults first. That is the v1 bug in a new place: a save that
restores state has to restore all of it.

And one that could not be fixed in JavaScript at all: **`econ.occupationHostility` was defined
twice.** The M0.3 placeholder (`v: 1.0`, one-line doc) sat BELOW the argued M4 definition (`v: 1.6`,
the full anti-snowball rationale), so the later definition won and the game shipped the placeholder
while every reader of `tunables.js`, `DESIGN.md` and the code review found 1.6. A duplicate key in an
object literal is not an error and leaves no trace once the literal has collapsed, so the guard has
to read the SOURCE: `tests/tunables.test.js` now fetches `js/tunables.js` as text, scans for
top-level keys, and cross-checks the count against `SCHEMA` so that a scan which silently stopped
matching would fail rather than pass.

### D149 — The Area re-bake, adopted
**M9.6.** D36 deferred it: `build_areas.py` was made deterministic and capped at 8 counties per Area
in M1.13b, but `data/areas.json` was never regenerated, because an Area id is the join key for
`economy.json`, both map modes, every authored homeland and every save. `build/validate.py` has
warned about the surviving 22-county blob on every run since.

It happens **now**, before M13 hands builds to playtesters who will make saves, and not in M12 where
the audit filed it — the argument for "before launch" is the same argument for "before everything",
only weaker, and every intervening milestone adds content to at least two of the files it touches.

`build/migrate_areas.py` is the piece the re-bake cannot do for itself: carrying the AUTHORED data
across. Both map modes are `{areaId: [nodeId]}` maps in which a human decided, one Area at a time,
which region something belongs to, and that judgement is not derivable from anything. The rule is
**inherit through the primary county** — a new Area takes the assignment of whichever old Area
contained the county that is now its primary — which is the same rule the game uses for every other
question about a merged Area, and means nothing is invented and nothing is lost. Where a new Area
spans counties that were in two different old Areas, the primary decides, exactly as it decides the
Area's name, its seat and its id.

Measured: **1,676 Areas -> 1,688** (11 retired, 23 new; 483 -> 507 merge groups). Of 1,688
assignments in each map mode, 1,665 kept their id and 23 inherited through their primary — **none
unassigned**. `economy.json` and `parties.json` were re-baked from the new plan in dependency order
(parties reads `cultural.json` as well, because a homeland is authored as culture nodes and expanded
into member counties). `build/validate.py`: **0 errors, 1 warning**, down from 0 and 2 — the
remaining one is the pre-2015 `county_neighbors.json` vintage, which is a different known issue.
Determinism re-verified: three `PYTHONHASHSEED` values produce byte-identical output, matching what
shipped.

The save format is **version 3**, and a version 2 document is refused by name rather than migrated:
migrating one would mean guessing where a dozen borders went. `js/saves.js` now reads
`StateDoc.VERSION` instead of keeping a second copy of the number — a duplicate that would have left
every stale save in the load list badged as current while the loader refused it.

### D150 — app.js split five ways, mechanically
**M10.0.** 2,406 lines, and the audit's phrase for it was "a monolith renderer on the far side of an
otherwise clean model boundary". Split along the seams the file's own comment banners already marked:
`app.js` (the store, the data fetch, `init`, who you are), `map.js` (the d3 map, colouring, hover,
selection), `shell.js` (controls, modal, toast, turn banner and turn flow, end screen, timeline),
`panels.js` (every `render*`), `format.js` (three helpers).

**Mechanical and only mechanical.** Every function stays a global function declaration in the shared
classic-script scope, so nothing changed about who can call what — this is a filing decision, not an
architectural one, and that is what makes it verifiable: all 98 top-level declarations survive,
none is duplicated, and the acceptance is a clean boot plus a green suite. It happened BEFORE M10's
own work rather than after because M10 and M11 were about to add a journal, an objectives screen, a
generated reference and progressive disclosure to a sixteen-block panel — 3,200 lines would have
been worse to move than 2,400.

### D151 — The objectives screen is generated, not written
**M10.1.** "A stranger cannot answer 'what are my ways to win,' and no surface explains the two axes,
the stocks, or the eight map modes." All of it existed — in `Victory.CONDITIONS`, in the TUNE
schema's `doc` strings, in the stock summaries. What was missing was a door.

The reference tab is built from `TuneMeta.describe(key)` and the same `CONDITIONS` table the victory
check runs on, and that is the whole design: hand-written copy about a tuned system goes stale on the
first tuning pass, silently, and the player is the last to find out. If a target moves this screen
says the new number the same turn, because it is reading the number rather than a memory of it. The
same strings are the map-mode tooltips and the stock-label tooltips (M10.3) — one source, three
surfaces.

Rivals are listed **per condition** rather than overall. `Victory.standings` sorts on a nation's best
condition, which answers "who is winning" and not "who is winning at this"; a player deciding whether
to contest Economic Supremacy needs the second, and the first would hide a nation two moves from it
behind three idling near a different one.

It also produced `screenBlocked()`: the Objectives item is deliberately NOT gated on an in-flight
action — reading how you win is safe mid-decision and that is when a player most wants it — and the
first version could therefore be opened underneath a waiting crisis, where it rendered perfectly and
could not be reached or closed. `#endscreen` outranks `#modal` by design; now the menu knows.

### D152 — The panel folds, and never folds a control
**M10.2.** Sixteen blocks, "every block individually excellent, collectively unreadable to a
newcomer". This hides nothing: every block keeps its headline — label, value, and the one-line
summary the model already writes — and the rows that justify the number go behind a click. Measured
on a live turn-18 game: **15 blocks, 8 of 29 Why rows visible**, two of them marked as having moved
this turn.

**A DOM transform, not sixteen edits.** It runs over the rendered panel rather than inside each
`render*`, because the alternative is teaching sixteen functions the same lesson and teaching the
seventeenth the day somebody adds it.

Two things it got wrong first, both worth keeping written down. The block id was the whole label, and
panel labels carry live detail after a middle dot — "Election · in 2 turns" — so a block the player
left open closed itself the moment the number in its own title moved, which is exactly when they were
reading it. The id is now the stable half. And the fold caught **action buttons**: the M11.2
diplomacy block's two buttons vanished behind it, and the recognition button had quietly been in the
same position since M10.2 shipped. A control the player cannot see is a control that does not exist,
so a block carrying a button, input or select is never folded — a rule about content rather than a
list of block names, so the next block to grow a button is covered without anybody remembering.

### D153 — Trade became a Move, and the reason is not tidiness
**M11.1.** The rules were written in M6.6 and lived in `js/actions.js` — in the UI — so only the
human could use them. The consequence is sharper than "the AI does not trade": `traded` is the ONLY
relations channel ordinary play generates, and every other entry in the ledger comes from taking
something from somebody. The player could farm standing at zero risk for union odds and coalition
exemptions the AI could never earn back — not because the AI was worse at it, but because the rule
was not written where the AI could see it. This is the M6.3 argument in the one place it had not been
applied.

Measured over 60 turns after the move: **2,022 AI trade events across 71 actors**, against a human
ceiling of 60. The acceptance criterion was "AI–AI trade should outnumber player trades".

The bilateral deal moved; selling to the world market did not. That one is a nation and a price, it
records nothing about anybody, and giving the AI a free income button with no counterparty would
change the economy without changing the diplomacy.

### D154 — Treaties are the first thing a nation can promise
**M11.2.** Every other diplomatic fact in this game is an EVENT that decays: `Relations.record`
writes a memory and the memory fades. A pact sits on the board until somebody breaks it, and
breaking it is worth more than never having signed — `rel.magReneged` is -1.4 against `magTreatied`
+0.18, and the Influence term charges a breach at 2.5 pacts. That asymmetry IS the mechanic: signing
is cheap, so without it a serial betrayer simply out-signs their own reputation.

Annexing a pact partner tears the pact up, recorded in `resolveAnnex` rather than checked for
afterwards, because "who broke this and by doing what" is knowable only where it happened.

### D155 — Aid buys politics, slowly, expensively, and reversibly
**M11.2.** The audit: "Ideological Dominance is govern-well-and-wait." Aid is the verb. A payment
buys standing, a better chance of being recognised, and a PATRON relationship that blends the
recipient's government lean toward the donor's in `phasePoliticalDrift` — capped at
`aid.patronMax` 0.35, decaying at 8% a turn, and scaled by the payment as a share of the
RECIPIENT's income, so a small country is cheap to buy and a large one effectively unbuyable.

**A blend, not a fourth drift term.** The drift target is a weighted average of owner, anchor and
neighbours whose weights sum to one; a fourth term means renormalising three tuned constants and
every measurement in this file that rests on them. Blending the patron INTO the owner's lean changes
what "the government's politics" means for that one nation and nothing else — which is also the more
honest description of a client state.

`applyPatrons` indexes by `Game.nationIndexOf`, not by roster iteration order. Those are different
things — an index is assigned on first use and never reused, so a dead nation leaves a hole — and the
first version numbered as it walked, which silently blends the wrong country's politics into another
the moment anybody is conquered.

**And the AI could not use it until `ACTIONABLE` changed.** That set names the victory requirements a
move can shift, and 'People holding your ideology' was excluded because no verb could shift it — so a
nation whose binding requirement was sway had no actionable goal, fell through to the nearest
condition, and played for position. Aid is the verb, so the goal is now worth having. Before the
change aid scored -0.30 at best and was never chosen; after it, it fires.

### D156 — Nothing contested a rival who was quietly winning
**M11.3.** Coalition threat read `size × (1 − influence)`, and BOTH non-conquest victories keep
Influence high by construction — Reunification has an Influence floor, Ideological Dominance requires
it, Economic Supremacy comes with it. So no coalition ever formed against a nation closing on either,
no AI term read victory proximity at all, and against a human who has read the victory table the AI
was an opponent on one board out of three.

`coalition.wVictory` reads proximity directly and is deliberately NOT scaled by `(1 − influence)`:
being liked is a defence against being feared for your size, and it is not a defence against being
about to win. `ai.wDeny` scores a move by what it does to the LEADER's binding requirement rather
than to the scorer's own progress, so taking ground off the nation closing on Reunification is worth
doing even when it advances nothing of yours. `ai.denyBar` sits below `win.warnAt` because an
opponent that only pushes back once the newspaper starts shouting pushes back too late to matter.

**Both wait for `win.graceTurns`, and that is what keeps the older claim honest.** "Being big is not
the crime" is the design in one sentence, and on the opening board size and victory proximity are the
same number — the largest economy IS the nation closest to Economic Supremacy, by construction and
without having done anything. The grace period is where the two come apart: after it, a nation is
close because of what it did.

### D157 — The ground itself
**M12.** DESIGN.md §12's #1 structural gap. Quality of life and civil liberties were national stocks,
so every Area of a country was exactly as pleasant and exactly as free as every other, grievance had
one number per nation to build on, and migration pulled toward one number per nation — which is why
the pressure map was flat inside a border and why "the Rust Belt is angry while the coast thrives"
was a sentence this model could not produce.

**The shape is `national stock + what is true HERE`, not a second full formula.** The national stock
already reads everything national — solvency, the government, war weariness, the leader — and a
per-Area version that re-derived those would be a second implementation free to disagree with the
number on the panel. What is local is local: wealth against the nation's OWN median (what makes
somewhere feel left behind is the rest of its own country), occupation, self-rule, and the garrison.

**The garrison term is the one that most needed to be per-Area, and the honest derivation took two
goes.** `Military.garrisonPressure` is a national number and the model has no per-Area garrison, so
the first cut looked for a `Game.isGarrisoned` that does not exist — inventing a mechanic to make a
formula work. Troops go where the trouble is, so the national pressure lands on an Area in proportion
to `Game.hostility` there, the same quantity occupation upkeep is already priced on. Occupied ground
takes the whole weight regardless. The consequence is the one M12 exists for: a nation holding one
restive province down is unfree in that province and no less free than before in its capital.

`-1` in the column means "never computed", so a new or newly conquered Area opens AT its reading
rather than climbing from zero — the same rule `Power.step` uses for a null previous value, and for
the same reason: a brand-new Area reading 0 would be the worst place on the continent on the day it
was founded. Measured on a live turn-20 game: a **0.286 spread** of quality of life inside one
nation whose national stock reads 0.79.

Float32, not Float64: these are 0..1 stocks read to two decimals, and 1,688 Areas × two columns is
13.5 KB against 27 KB for precision nothing consumes. Saved, unlike `anchor` — they are rate-limited
stocks with history in them, and a document that dropped them would reopen with the whole country at
its national average and the gradient gone.

### D158 — The telemetry export is a collector, not a calculator
**M13.1.** "The ledger is a telemetry system. Your playtest program's instrument already exists; it
just needs an export button." Exactly right, and it is why `js/telemetry.js` computes nothing. The
export is the ledger whole (every entry carrying the `terms` that justify it — which is what makes it
telemetry rather than a score sheet), a per-turn series sampled AS THE GAME IS PLAYED, the player's
own actions filtered out of the ledger rather than tracked separately, and the run's identity.

Each of the four questions M13 asks has a field: "when did you first feel behind" is the per-turn
standings and rank; "what did you do on turn 25" is the action filter; "did you see the secession
coming" is the pressure high-water mark inside the player's own ground, turn by turn, because what
matters is the map the player could have looked at rather than the secession they got.

Written to `content/` when the local server is running and downloaded when it is not, because a
tester who has to find and send a file is a tester whose data arrives late or not at all.

**The difficulty presets are TUNE overrides**, which is the whole requirement — "so the playtest can
A/B pacing without builds". A difficulty setting here cannot be a damage multiplier because there is
no damage; what there is, is pacing: opening treasury, how often the world acts, how fast the ground
turns, how long a new state is left alone. Each preset is a hypothesis about those, written in
tunables that already have documented meanings. `standard` is deliberately EMPTY rather than a copy
of the defaults, because a preset that restates the shipped tuning is a second place it lives and
would go stale the first time M13 moves a number. `?difficulty=` carries a setting by link.

### D159 — The playtest build is the browser build, on a static host
**M13.2.** The question was whether a remote tester needs a program or a link, and the answer is a
link — but only after closing one gap, and the gap was not the one it looked like.

Manual Save and Load already fell back to localStorage; what did **not** was the live document. The
autosave and the resume both went to `/api/state` and nowhere else, so on a static host a tester who
reloaded lost everything since their last deliberate Save. `data/state.json` is what makes closing
the tab safe, and it had no browser equivalent.

**The bug that fallback exposed is the one worth recording.** A static host answers `PUT /api/state`
with **501**, and `fetch` resolves happily on a 501 — it only rejects on a network failure. The first
fallback triggered on `catch`, so on exactly the host a playtester would be using it wrote nothing,
silently, every turn, and reported success. Verified against `python -m http.server` rather than
reasoned about, which is the only reason it was found: `r.ok`, not "it did not throw".

Quota is handled rather than reported. The ~5 MB budget is shared with named saves and the part that
grows is the ledger (~0.2 KB an entry against a 670 KB world), so on a quota failure the live copy is
rewritten with its ledger trimmed to the last ten turns. The game stays resumable, which is what the
autosave is for; the FULL ledger is still in memory and still goes into the export, so what is lost
is old newspaper text after a reload. That is the right thing to spend.

`clearLive` clears BOTH stores unconditionally — a New game that cleared only the one it happened to
be using would resume out of the other.

**A folder is not an option**, and the reason is structural rather than fixable: `boot-globals.js` is
an ES module and every data file is fetched, and browsers block both over `file://`. Double-clicking
`index.html` gives a blank page and console errors, which is the worst thing to hand somebody three
time zones away. `build/package_playtest.py` therefore produces a folder for a HOST — 75 files, 4.0
MB, 1.1 MB zipped — and checks its own manifest against what `index.html` actually asks for, so a
script tag added without a thought fails the package rather than 404ing on a tester's machine. It
excludes `data/state.json` by name, because shipping the author's own game means every tester resumes
into it and reports the game as broken.

### D160 — The play log records what the ledger cannot
**M13.2.** The ledger is a record of what happened in the WORLD, and it is complete. What it cannot
hold is the half of a playtest that is about the person: how long they sat on turn 24, the annexation
they opened and cancelled, the refusal they hit four times, whether they ever opened the Objectives
screen M10 was built for. None of that is in a save, and none of it is recoverable afterwards.

So `Telemetry.note` is a second, tiny record beside it: a kind, a turn, a millisecond offset and one
short detail. Turn duration comes off the per-turn sample, because the fastest way to find the sparse
mid-game the audit predicts is a run of eight-second turns.

**The first version logged news as refusals**, and it is worth saying why the obvious rule failed.
`warn` and `bad` are the two colours the game says no in — and also the colours it announces a
scenario, a victory alarm and a breakaway in. Three of the first eleven entries in a test session were
the opening edition, the party spawns and the playtest notice itself, which buries the one signal the
log exists for. The colour cannot tell them apart, so the caller does: `flash(html, kind, {news:
true})` marks an announcement, and there are five of those against roughly thirty refusals — which is
why the flag is on the rare case rather than the common one.

**It says so in the game.** `?playtest=1` shows a one-time notice on the tester's first turn, and the
export dialog lists what the file contains item by item rather than claiming nothing personal is
collected. A claim is worth less than an itemisation somebody can read, and the list is short enough
to read — which is the point of keeping the log small in the first place.

### D161 — Versions start at the prototype, not at today

Aaron asked what the version numbers should be, expecting something like `v3.1.2`, and asked whether
the economy work would be `v0.1.1`. Both instincts were close and both needed one correction.

**The prototype takes `v0.1`, not the alpha.** The build already on the `main` branch is finished,
playable in a browser, and has been lost by its own designer — a rival nation reached one of the three
victory conditions. A thing that can be won and lost is a game, and it deserves the first number. Had
the alpha taken `v0.1`, the build that testers actually hold would have had no name, and any report
from them would be untraceable.

**Economy work moves the middle number, not the last.** `v0.1.1` announces "nothing new, something was
patched", which is exactly wrong for a system that adds capability the game did not have. A tester
told `v0.1.1` would never look for it. The rule written into `docs/VERSIONING.md` is a question rather
than a taxonomy — *would I have to tell a tester anything new?* — because that is the form a
non-programmer can apply without looking anything up.

**Tags go on `master`, at the commit the build came from.** `main` holds an orphan branch with a
single commit: the browser build, uploaded so testers can open a link. It shares no history with the
project. Tagging it would attach a version to an output rather than to a state of the work, and the
next build would have nowhere to go. `v0.1` therefore points at `d64da4f`, the last change before the
playtest build was pushed twenty-five minutes later.

**Rejected:** semantic versioning as normally practised, where the first number tracks breaking changes
to an interface other programmers depend on. Nobody depends on this game's internals, so that meaning
is unavailable, and importing the convention without its meaning would produce numbers nobody could
interpret. The stages a game actually passes through — prototype, alpha, beta, release — are what the
numbers track here instead.

**Also decided:** the alpha bumps once per phase of the economy brief, and only after the phase's
Control Board checkpoint has been approved in writing. The brief already requires that approval; this
makes the version history the record of it, so a future session can read the tags and know which
phases were genuinely signed off rather than merely finished.

### D162 — Three rulings from Aaron before Phase 0

**The Control Board does not drive the game.** The economy brief's Phase 0 asks for the Control Board
to step turns, fast-forward, force a state's resource supply and force a conquest. Aaron has ruled
that this was a mistake in the brief: the Control Board is where he reads progress and answers
decisions, nothing more. The game is played in a browser as it always has been.

Those testing controls therefore belong to the game's own developer dashboard, behind the existing
dev flag, which already carries the tuning sliders and a manual step-one-turn button. The two are
different instruments with different session lengths — the board is read once and closed, the
dashboard is poked for twenty minutes beside the map it is poking. This is a departure from
`docs/spec/economy-system-spec.md` and the spec has not been altered, because it is authoritative and
Aaron's; this entry is the correction of record.

**The game starts on 1 March 2036.** One turn is one month, so turn 1 is March 2036 and the second
day of play is the bicentenary of Texas declaring itself a nation. The date is not decoration: it
gives the opening board a reason to be the day it is, and every turn counter in the game now reads as
a date somebody could put on a newspaper.

**One tuning file, not two.** The economy's constants — band thresholds, base prices, price
coefficients, toll multipliers, demand coefficients, recognition thresholds, storage capacities — go
into the tuning file the game already has, rather than a second file beside it. Two files means two
places the truth lives and eventually they disagree, and the disagreement is silent: the game reads
one and the designer edits the other.

**Rejected:** a separate `economy.tuning.json` on the grounds that it would be tidier to hand to a
designer. Tidiness is not worth a second source of truth, and the existing file already carries every
other model constant with a name, a range and a comment.

### D163 — The turn stays a quarter, and the date stays anyway

**Supersedes the turn-length half of D162.**

D162 recorded Aaron's ruling that a turn is one month. That was recorded before the cost was priced,
which was the error: the audit then found "quarter" written into the explanations of dozens of
tunables, into the recorded reasoning beside every number that has been tuned, and into two
player-facing strings. A month makes all of it wrong by a factor of three.

**Observed:** every rate in the engine is expressed per *turn* and calibrated as such. Nothing
mechanical distinguishes a month from a quarter — the label changes only what the calendar prints and
what the written justifications beside the numbers claim.

**Decided:** the turn is a quarter. Deal durations become 2 / 4 / 8 / 20 turns — six months, one
year, two years, five years. The re-derivation week goes into the economy instead.

**Kept regardless:** the game opens **1 March 2036**, the eve of two hundred years since Texas
declared itself a nation. Aaron wants the date for the story, and it costs nothing to keep: the
anniversary still falls on turn 1 whichever unit the clock advances in.

**Rejected:** the month, on the grounds that a calendar reading "March, April, May" is better
than one reading "Q1, Q2, Q3". It is, but not by a week of re-tuning before a single economic figure
exists.

**Not foreclosed:** Aaron raised sub-turns — quarterly strategic decisions with the three months
playing out inside each — which would give both clocks. Recorded as F1 in `docs/FUTURE-IDEAS.md`.
Today's choice is that design's outer clock, so it is additive later rather than a reversal. Had the
month been kept, the same design would have required coarsening rather than subdividing.
