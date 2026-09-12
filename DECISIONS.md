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

### D164 — The industry split can be re-baked from real data, and the gate was measured rather than argued

Spec v2 ruling 1.4(b) ordered the invented six-sector split replaced with real BEA county-industry
data if coverage permits, and told engineering to verify coverage and suppression before committing.

Eight agents investigated. Every one of them flagged the same load-bearing unknown — the disclosure
suppression rate — and not one of them measured it, because measuring it was outside each of their
briefs. Two of them said plainly that their findings established availability and not usability, and
that nobody should commit on their strength. They were right to say so, and the useful move at that
point was to stop reading opinions and count.

**Observed**, from `build/raw/CAGDP2.zip`, 3,127 counties, 2024, counted directly:

- 18.8% of county-sector cells are suppressed or unavailable; 81.2% carry a real figure.
- Falling back to BEA's aggregate lines where a component is suppressed lifts measured coverage from
  77.0% to **83.5%** of all sector figures on the map.
- **99.6% of counties publish a usable all-industry total** — the anchor apportionment requires.
- The game's six sectors span only **52.5%** of measured county GDP.
- The data has been on disk since 2 July. The existing data build reads this exact file and discards
  33 of its 34 industry lines with one filter.

**Decided:** re-bake with apportionment. 83.5% measured, 16.5% apportioned from a real county total
and flagged **est.** via the badge mechanism that already exists for population, GDP and vote. Today's
figure is 0% measured, so this is not a marginal improvement.

**Rejected:** a straight re-bake, because only 42.8% of counties have all six sectors published and
insisting on complete data would discard the other 57%. Also rejected: doing nothing and labelling the
templates as estimates, which spec v2 offers as the fallback — it is honest but it leaves the substrate
of every economic number in the game invented when a real substrate is sitting in the repository.

**Escalated to Aaron:** the 47.5% of real GDP with no game sector — government, professional services,
healthcare, education, construction, utilities, hospitality. The data cannot decide where it goes and
two of the three available answers re-introduce the invention this ruling exists to remove. Carded on
the Control Board with a recommendation to widen the six definitions so every dollar lands somewhere
real.

**Method note:** the finding that mattered here was produced by measurement after eight agents had
correctly identified what they could not answer. Their value was in naming the gate precisely enough
that it could be measured in two minutes. Recorded because the instinct to run another agent round
would have been wrong.

### D165 — The six sectors stay as they are; the re-bake is deferred, not cancelled

Aaron: "Lets stick with the resources as they are without any changes for now and move forward."

**Decided:** the six sectors keep their current definitions and membership. The widening proposed in
D164 — absorbing the 47.5% of real GDP that has no game sector — is not done. Phase 0.5 stays on the
roadmap and is deferred rather than deleted; the measurement in `docs/BEA-INDUSTRY-FEASIBILITY.md`
does not go stale, because the data file and the suppression rates it counted are fixed 2024 figures.

**What this leaves standing, and it must not be quietly forgotten:** the industry split under every
Area is invented, and the game currently presents it to the player as measured — the Area panel names
a dominant sector and the economy map colours by it, neither carrying the **est.** badge the design
document requires. Spec v2 is explicit that the fallback of keeping the templates is acceptable *only*
if they are labelled honestly, and that "what is not acceptable is leaving invented figures presented
as measured ones."

So the deferral is of the re-bake, not of the honesty. The labelling is carried in `docs/deferred.md`
and stays visible on the Control Board until it is either labelled or replaced. It is a small change
to a badge mechanism that already exists and is already wired to population, GDP and vote.

**Rejected:** treating "no changes" as closing the question. Aaron ruled on scope and sequencing, which
is his; he did not rule that invented data may be presented as real, which is his design document's
rule and still binds.

### D166 — The recognition trade block is not a bug; the consultant misread the design document

Spec v2 ruling 1.6 says the code hard-blocks bilateral trade between unrecognised states, that
`DESIGN.md` §6.5 specifies a smuggler's rate instead, and that "the document is right and the code is
the bug." Checked before changing anything, and the premise is wrong.

`DESIGN.md`:833-836 specifies BOTH, and names them as two of the four costs of being a pariah:

> "no bilateral trade with anyone who does not recognise you, a smuggler's rate on the world market,
> no seat in a coalition, and a signed deficit on Influence. The market is a haircut rather than a
> lock, because refusing external trade outright would make an unrecognised landlocked state
> unplayable"

The "haircut rather than a lock" sentence is about the **world market**, not about bilateral deals.
The code implements both correctly: `canTrade` requires mutual recognition for a bilateral deal, and
`marketRate` applies the sliding smuggler's rate on the world market with a comment restating the
document's reasoning. Nothing here contradicts anything.

**The actual defect was mine.** Economy mode switches the politics layer off — recognition never
ticks, and both the recognition panel and the Recognise button are hidden — while `canTrade` went on
gating trade against a frozen value the player could neither see nor change. In the one mode built
for testing trade, trades were refused with no visible cause and no route to fix it.

**Decided:** a switched-off system does not charge for itself. `canTrade` and `marketRate` now return
the permissive answer when the politics layer is off, answered inside `js/recognition.js` rather than
at each of the seven call sites, so a future caller cannot forget it. This reads the same way the
existing guards do — callers already treat an absent Recognition module as "no gate", and a
switched-off one is the same situation.

**Rejected:** implementing ruling 1.6 as written. Removing the bilateral block would delete a
deliberate, documented cost of secession that the design document argues for, on the strength of a
misreading. Spec v2's recognition RAMP (its §5.5) is a real change and stays scheduled for Phase 5;
it replaces the block with graded access, which is a different thing from deleting it.

**For the consultant:** ruling 1.6's premise needs correcting in v3. The code was right.

### D167 — 100-turn timing is still unmeasured, and the attempt found something worse

Spec v2 §2.5 asks for two figures nobody has ever produced: a 100-turn run proven byte-identical from
the same seed, and one honest speed number to replace the stale, mutually contradictory ones in the
project's own documents.

**Measured cleanly:** a 50-turn headless run takes **22.0 s** and **22.2 s** on this machine (two
observations, dashboard load, 51-state board). That is the first real speed figure this project has.

**Not measured, and deliberately not published:** the 100-turn figure. Two 100-turn runs launched
together had not finished after ten minutes. Against 22 s for 50 turns, a linear cost would have
predicted about 90 seconds for both. The discrepancy is roughly thirteenfold per turn.

Two candidate explanations and no evidence separating them, which is exactly why no number is going
on the board:

1. **Background throttling.** The runs were driven through a hidden browser tab, and browsers throttle
   those hard. If that is the cause, the real figure could still be near 45 s and the measurement is
   simply invalid.
2. **Superlinear cost per turn.** If the engine really does slow down as a run lengthens, that is a
   far more important finding than the timing task it came out of — it would mean Phase 8's twenty
   headless runs are not affordable, and it would have surfaced there rather than here.

**Decided:** record both figures honestly, publish neither as the answer, and re-run the measurement
in a foreground tab where throttling cannot be the explanation. If the per-turn cost is genuinely
superlinear, that becomes its own investigation before Phase 8 is planned — and the audit method that
found the demand bug is the right instrument for it.

**Rejected:** extrapolating 100 turns from the 50-turn figure. The whole point of §2.5 is to replace
estimates that were quietly wrong with measurements; producing another estimate would be the same
mistake in a new place. Also rejected: reporting the ten-minute observation as the speed, since the
method cannot support it.

**Note for the next session:** this is the one Phase 0 item that is measured-but-inconclusive rather
than done. It does not block anything else in Phase 0.

### D168 — Addendum A: trade first, the economy after, and four rulings on the way in

The project manager's Addendum A reorders the roadmap so that an alpha test happens before any of the
economic model is replaced: A0 unblock, A1 deals with terms, A2 transit and tolls, A3 the network map,
A4 the AI using the new instruments, then alpha. The reasoning is sound and is the addendum's own:
the v2 order is right for building a simulation and wrong for finding out whether the game is fun.

Filed at `docs/spec/economy-system-spec-addendum-a.md` with Aaron's rulings folded in. Four of them,
and two corrections to the addendum itself.

**Rulings.**

1. **The A-stages run straight through** — no stop for written approval between them. Supersedes,
   for the alpha track only, the master rule that each phase waits for sign-off. The alpha test is
   the checkpoint that matters.
2. **Canada and Mexico are geography, not nations.** Not actors, not conquerable, no negotiation, no
   opinion. Any bordering state may route through them at a flat placeholder toll of 10% — a cost to
   the trader, not a transfer to Canada. Aaron's example: Idaho trading with Minnesota via Canada keeps
   10% less of that deal's income. Conditions (hesitancy toward a fresh secession) may come later.
3. **The recognition trade block stays**, per D166. The addendum restated v2 ruling 1.6; Aaron chose
   the design document.
4. **Great Lakes ports reach the world market only through Canada; ocean ports reach it directly.**

**Corrections to the addendum.**

- Its A4 premise — that trade lives in the UI so the AI never trades — is stale. M11.1 moved trade
  onto `Moves.plan`/`resolve` and the AI has traded since; verified in play. `DESIGN.md` §12 carried
  the same stale line and has been corrected under its own rule. What A4 genuinely adds is the AI
  using the *new* deal and transit objects, and the offer cap and expiry.
- Its A0 restated ruling 1.6; see ruling 3.

**A mistake of mine, caught before it cost anything.** I told Aaron the county data had no ports and
raised it as a blocking question. It has 986 counties flagged, from the 21 MB Principal Ports dataset
pulled in July, baked into `data/county_trade.json` — I had checked `transport.json`, the wrong file.
The running game sees them correctly (Houston 5, Florida 8, Illinois 12, Michigan 7 on the lakes,
Wyoming 0). Verified at runtime before withdrawing the question. The lesson is the same as rule 1 in
PROGRAMMER-RULES: check the thing the code actually reads, not the thing its name suggests.

**Also struck by the addendum:** the five-nation prediction exercise. The answer key computed for it
(`docs/PHASE1-ANSWER-KEY.md`) is not wasted — its findings about the demand formulas' units and the
invented industry data stand regardless, and matter when derived demand is built after alpha.

### D169 — The six sectors will be widened and re-baked; Aaron approved it, it stays after alpha

*2026-09-05.* The `sector-coverage` card on the Control Board was approved with no note at
08:17Z. The card recommended **widening the six sectors so every dollar of a county's real output
lands somewhere**, over the two alternatives (drop the missing 47.5%, breaking the design
document's promise that sectors sum to real output; or spread it evenly, which is inventing again).
The approval is therefore an approval of that recommendation.

It supersedes nothing in D165 — that entry deferred the re-bake, and this one does not un-defer it.
The re-bake still sits in the `After alpha — Honest industry data` phase. What changed is that the
design question in front of it is now settled, so the phase is no longer blocked on Aaron.

Measured coverage, unchanged from D165: 83.5% of county-industry figures come straight from
published BEA data (with addenda), 99.6% of county totals are usable, and the present six sectors
span 52.5% of GDP. Widening is what closes the other 47.5%.

### D170 — A1 is built from four of eight design passes, not re-run

*2026-09-05.* The A1 planning workflow died twice on session limits. Run 2 (`wf_27be10f9-9d9`)
completed **all four `map:` agents** — model/settlement, UI/negotiation, persistence/determinism,
and the reuse/retire audit of the existing trade code — and lost the four adversarial challengers
and the synthesiser.

The four results are extracted and kept (see the run's `journal.jsonl`). They agree with each other
on every load-bearing point: a new `js/deals.js` IIFE modelled on `js/pacts.js`; ids from a
serialized module counter, never the RNG; settlement as treasury-only money movement inside
`World.advanceTurn`; `Moves.tradeFlows` reused unchanged as the deal's volume and price; the
one-click bilateral trade and its per-partner cooldown retired; and — the point the whole stage
hangs on — **no step writes to demand, supply, or the price index**. Four independent passes
reaching the same architecture is most of what the four challengers were commissioned to test.

Decided: build from these rather than spend a morning re-running the other four. The alternative
buys a second opinion at the cost of the day, on a stage whose scope rule is already checkable by
test (prices byte-identical before and after signing and after six turns of settlement — one of the
tests the audit pass specified).

**If A1 comes out wrong, look here first.**

Three findings from the four passes, and what was done with each:

- **Income scale (Aaron's).** A standing deal pays every turn what the click paid once per
  `trade.cooldownTurns + 1 = 4` turns, so trade income per partner rises ~4x, more where a deal
  runs 20 turns. This re-tunes the whole game around a richer world. On the board as
  `deal-income-scale`.
- **Consent (mine).** `resolveTrade` has no consent step: today an AI can impose a one-click trade
  on the player, harmless because both sides gain. A 20-turn standing deal imposed the same way is
  not harmless. A1 gives the player accept/decline, which the offer/counter-offer machinery needs
  anyway.
- **Ledger bloat (mine).** Logging settlement per deal per turn would push real news out of
  `ledger.cap` (5000) within ~100 turns. A1 logs signing, renewal and expiry only; the running
  total lives on the Deals screen.

And one for Aaron that the addendum left open: whether a deal can be **broken early**. Recommended
no for A1 — revocation-with-notice is already specified for A2. On the board as `deal-early-exit`.

### D171 — Aaron's four rulings on A1, 5 September

*2026-09-05.* Asked before a line of A1 was written; all four answered the same morning.

**1. A deal pays over a year what a click paid over a year.** The two cards on the board framed it
as: a standing deal pays every turn what the click paid once per `trade.cooldownTurns + 1 = 4`
turns, so trade income per partner would rise ~4x. Aaron chose *same over a year*. So A1's
settlement scales the per-turn payment by a tunable that starts at 1/(cooldown+1), i.e. the deal is
about **commitment, not sudden wealth**, and everything already tuned around the old rhythm — army
upkeep, annexation cost, recovery rates — stays true. The multiplier is a tunable so trade can be
turned up deliberately after the alpha rather than by accident before it. Rejected: paying the raw
arithmetic and re-tuning the whole cost model around a richer world before anyone has played it.

**2. Deals run their term.** No early exit in A1. Breaking a deal arrives with A2, where
revocation-with-notice is already specified and costed. To stop a five-year mistake being made by
accident, **the term is the largest thing on the confirmation**. See F2 in `docs/FUTURE-IDEAS.md`
for Aaron's own design for what breaking one should eventually cost.

**3. Playtesters wait for the alpha.** The `live` permission stays off. Aaron added, mid-session:
the playtest is live on GitHub but he has sent it to nobody and will not until the alpha is built.
So there is no audience to disturb and no urgency; the finished Economy build waits with the rest.

**4. The industry re-bake stays after the alpha.** D169's approval is not a reschedule. Re-baking
changes what every county is made of and would move every number the alpha exists to measure.
Rejected: doing the honest data first, which delays trade and makes the alpha test a world nobody
has played.

Two ideas were captured rather than built, both Aaron's, both in `docs/FUTURE-IDEAS.md`:
**F2** breaking a deal early and paying for it in a decaying reputation that makes every other
state price you worse — build it on A2's machinery, not beside it; and **F3** interest groups
(farmers, industrialists) with their own approval, which the original brief assumed existed. F3
carries a naming warning: `faction` already means a playable nation here, so the eventual system
must be called something else.

### D172 — The external markets, the modes, and where the rivers go in the order

*2026-09-05.* Aaron specified how Canada, Mexico and the world market should work, and the answers
change three things about what was built earlier the same day.

**1. A PORT REACHES CANADA AND MEXICO, not only the world market.** What shipped in A2 wired a port
to the world market alone, so Los Angeles could sell to Rotterdam and not to Tijuana. Aaron's rule:
a nation reaches Mexico if it holds a Mexico border crossing, OR a port, OR a chain of transit
agreements to somebody who does — and reaches Canada by all of those, plus the Great Lakes route
already built. This is a hole in A2 and it is being fixed rather than deferred.

**2. A PORT, NOT A COASTLINE.** Aaron ruled that only a real port lets a nation ship abroad: the 136
port counties come from the Principal Ports dataset, so the infrastructure is already there, whereas
a coastline is only the possibility of one. Measured: 222 counties are coastal and 136 hold a port,
so 86 touch the sea with nothing to load a ship from. That gap is deliberate and load-bearing — it is
what makes a port worth capturing, and it is the thing F7's "build a port" idea eventually acts on.

**3. THE MODES ARE A COST HIERARCHY, not only a permission.** Aaron: ocean is cheapest, then river,
then rail, then road as the baseline — because free interstate trade and the distribution networks
that made land freight cheap do not survive the dissolution. A2 shipped the mode tiers as permissions
ONLY: road, rail and port are separately grantable, and every crossing costs the same
`transit.hopFriction` whatever it crosses. That loses half the point of having tiers, and it is worth
noting that the OLD one-off transit path did have this (`trade.railDiscount` 0.5,
`trade.highwayDiscount` 0.2) and the rewrite dropped it. Being restored as a per-mode friction.

**4. RIVERS BEFORE THE NETWORK MAP.** Aaron agreed. The map's whole job is drawing who can reach whom
and where it is blocked; building it before the rivers exist means drawing it twice. The alpha track
order is therefore A2 → A2b (external markets on corridors) → **A2c (rivers and chokepoints)** → A3
(the map) → A4 (the AI).

**What made the rivers cheap enough to schedule rather than defer.** Measured before deciding: the
data has been baked since July and never once read — four named corridors (Mississippi 105 counties,
Ohio 56, Missouri 50, Great Lakes 81), fifteen named chokepoints falling to NINE different nations,
and 213 river bank-pairs of which all 213 straddle different Areas with different owners today. The
corridor graph built in A2 is already a graph of places joined by mode-tiered links, and a chokepoint
is a place that charges a toll, which is what an intermediary already is. The genuinely new work is a
river mode tier and a bank-permission check, not a new engine.

**Deferred to `docs/FUTURE-IDEAS.md` from the same conversation:** F7 (real port sizes, and building
and upgrading infrastructure — carrying Aaron's best line, that adding rail should be an alternative
to invading somebody to use theirs), F8 (bundled package deals), F9 (the game proposing three routes
out), F10 (asking the map where you could go), F11 (tolls as a bargaining chip inside a trade
negotiation). One item from that list is NOT deferred: a flat discount on tolls between nations that
already trade, at Aaron's own suggested playtest figure, which goes into the alpha because it costs
almost nothing and is the cheapest possible test of whether the incentive is interesting at all.

**What was ruled out as not buildable.** Nothing Aaron asked for, and that is worth writing down
plainly rather than manufacturing a category. The one caution recorded against F9: "analyse every
possible way to create trading networks" taken literally is enumerating every combination of
agreements across sixty nations, which is not a large problem but an impossible one. The tractable
question with the same answer is "find the best routes as if everyone said yes, then say who you
would have to ask", and that runs in milliseconds.

### D173 — This is the ECONOMY alpha. The game alpha is a different thing, later

*2026-09-05.* Aaron, at the end of the A4 work:

> "this is the economy alpha not the game alpha. Once we get all alphas done for each part of the
> game are we really at an alpha"

He is right, and the docs have been sloppy about it. Everything written in this project since
Addendum A says "the alpha" and means "the economy alpha", which is a different and much smaller
claim. Renamed throughout, and the distinction is worth stating properly rather than just
find-and-replacing, because it changes what the finish line is.

**AN ECONOMY ALPHA answers economy questions and nothing else.** Is negotiating a deal interesting
or is it a menu? Does holding a corridor feel powerful? Do expiries create useful pressure or just
admin? Does the world feel alive with other nations trading? Every one of those can be answered with
politics and separatist movements switched off, which is exactly why they ARE switched off. It is a
test of one system, run in isolation, and isolation is what makes the answers trustworthy.

**A GAME ALPHA is the first time somebody plays the whole thing.** Every system on at once, with the
questions that only exist at the join: does an economic grievance turn into a separatist movement?
Does a nation that has cornered a chokepoint get invaded for it? Does the player have too much to
think about again — which is the exact complaint that started this whole rebuild? None of those can
be asked of a stripped-back build, and none of them are what the next few weeks are testing.

**THE MECHANISM FOR DOING THIS TO EVERY SYSTEM ALREADY EXISTS,** and it is worth saying because it
was built for a narrower reason. `js/complexity.js` was written to strip politics and movements away
so the economy could be built alone. It is the same switch a POLITICS alpha would use in the other
direction: turn the economy down to a baseline, build the political layer properly, test it on its
own terms. The pattern is repeatable — strip back, build one system until it argues back, alpha it,
switch it on — and the flags are how.

**So the honest shape of the road is:**

| | |
|---|---|
| now | economy alpha — trade, deals, corridors, rivers, markets |
| then | the other systems, each stripped back and built the same way |
| finally | the GAME alpha — every flag on, played end to end, and the first honest test of whether it is a game rather than a set of systems |

Which also means the game alpha needs something none of the per-system alphas do: a fresh set of
questions about the WHOLE, written before it is played. That is Aaron's to write and it does not
exist yet. Not urgent — but it should not be discovered on the day.

### D174 — Hog Wild Mode, and the gap Aaron's own question found

*2026-09-05.* Aaron created a standing permission: keep building unattended until there is nothing
left that does not need him, with as many parallel agents as the work takes, deciding the questions
that would otherwise become cards — on condition that every such decision is written down as it
happens. Defined in full in `docs/HOGWILD.md`, logged in `docs/HOGWILD-LOG.md`, toggled on the
Control Board.

**What makes this worth recording as a decision rather than just a setting** is the question he
asked while proposing it:

> "If you pushed through to A2B and there was an issue you would be able to read the documentation
> to know what happened and how to fix or roll back right?"

Measured against the repository as it actually stood, the honest answer was **half yes**:

- *What happened and why* — yes, comfortably. Every stage has a commit message that argues its own
  case, a numbered entry here, and measurements in `docs/spec/`. A2b's commit says why the road
  friction is 0.25 and not 0.12, with the table.
- *How to roll it back* — **no, not by Aaron.** There were six tags, all milestone-level. A2b had
  none. Undoing it required knowing it was commit `35753a3`, which I can find and he cannot. Under a
  mode where eight stages might land while he is away, that is not a small gap; it is the difference
  between a licence and a liability.

**So the mode ships with the fix rather than the flaw.** Every stage now carries a `stage/<name>`
tag, retro-applied back to A1: `stage/a1`, `stage/a2`, `stage/a2b`, `stage/a2c`, `stage/a2d`,
`stage/a3`, `stage/a4`. Each log entry names the one command that reverses its stage. A decision made
in Aaron's absence that he cannot undo from what I wrote is worse than a decision I never made, and
the tags are what make the difference concrete rather than aspirational.

**Five things the mode deliberately does NOT unlock,** written down because "go hog wild" could
reasonably be read as "the guardrails are off": nothing goes to the playtesters (`live` stays a
separate permission); no force-push or rewritten history (the trail IS the deliverable, and a
rewritten history destroys the thing the mode depends on); no secrets or `data/` committed; nothing
marked done that was not verified and no number published that was not measured; and the brief still
wins — building ahead of it is not "more work done", it is work to be argued about later.

**And four cases where it stops and waits anyway,** because guessing is worse: a decision expensive
to reverse (a data re-bake, a save-format break); a matter of taste about how the game should FEEL
with no measurement that could settle it, which is what Aaron is actually for; anything that spends
money or reaches off this machine; and two bad stages in a row, which means the plan is wrong rather
than the execution, and speed makes it worse.

---

### D175 — The autarky economy is parked for the duration of the run, 5 September

**Aaron, immediately before the first Hog Wild run:**

> "I am about to unleash you but one thing - skip the autarky economy phase and move forward with
> anything else."

**Recorded here because a resumed run has no memory of the conversation that started it.** An
overnight resume knows only what is on disk, so a ruling made in chat and not written down is a
ruling that expires at the first usage limit. This one has to survive three resumes.

**It costs nothing from the runnable list, because autarky was already blocked on him.** The spec
(`docs/spec/economy-system-spec.md`, Phase 1) requires the owner to write predictions *before* the
build starts — which five nations are self-sufficient, which five are structurally short, and of
what — and says in terms that this is a comprehension check on the owner, not a lookup task for
engineering. Writing those predictions myself is not a shortcut, it is the deletion of the only
thing the phase is for. So autarky was never in the set of work that could be done without him; his
instruction removes something already absent, and closes off the drift toward it.

**What it does NOT touch, checked rather than assumed: the industry re-bake.** The spec orders
industry-data honesty as Phase 0.5 and autarky as Phase 1 — the re-bake comes *before* autarky, not
out of it. And the six-sector split is consumed today by eight live modules (`market.js`, `moves.js`,
`dealbook.js`, `mapmodes.js`, `objectives.js`, `panels.js`, `actions.js`, `tunables.js`), so widening
it improves the game that is currently playable rather than laying groundwork for one that is not.
The re-bake stays in.

**One clash resolved.** D174 lists "a data re-bake" as a case where the mode stops and waits.
That guardrail exists for re-bakes Aaron has not seen; this one he approved on 5 September (D169),
with the coverage figure measured. Pre-approved, so it proceeds — and the guardrail stands unchanged
for the next one.

**The reading of "skip".** Taken as *for this run*, not *forever*. Autarky returns the moment his
predictions exist. Worth him knowing what deferring it repeatedly costs: the alpha track has now
built deals, transit, routing and the network map on the current simplified economy, so the deep
band-and-derived-demand model gets retrofitted under a working game instead of sitting under it as
the foundation the spec's roadmap assumed. That is not a reason to build it tonight without him. It
is a reason for the predictions to be near the top of his list.

---

### D176 — What a right of way is worth depends on what is being asked for, 5 September

**Observed.** `Moves.transitVerdict` took no `mode` argument at all, so a nation charged the same for
its harbour as for a lane of its motorway. Aaron flagged this on the morning of 5 September; it was
called nearly free to build and then not built.

**Decided.** A fourth term, and the only one about the favour rather than about the two countries.
Port is the baseline — `trade.transitToll` keeps the meaning it was tuned with — and the others are
discounts: river 0.95, rail 0.85, road 0.75.

**The alternative rejected**, and it was tempting because the numbers already existed:
`trade.railDiscount` 0.5 and `trade.highwayDiscount` 0.2, left over from the pre-A2 one-off transit
screen and still wired into it. They encode how cheap a mode is to MOVE on, which is a different
question from what it costs to be LET IN, and they place rail below road. Reusing them would have
imported an argument nobody made.

**Why discounts rather than a premium on ports.** A discount can only lower an ask, so nothing that
would have been signed before this existed is refused because of it. If the sizes are wrong they are
wrong in the safe direction. **The direction is defensible and the magnitudes are invented** — the
first thing to check is whether the fourteen landlocked nations can still afford to reach the sea,
since a port right is now the dearest thing on the board and the only thing that gets them out.

**Note the deliberate inversion.** This runs opposite to the friction hierarchy, where water is
cheapest. Water is the cheapest way to move goods and the dearest way to be let in, and the two
together say something the game could not say before: the sea is cheap, and the harbour is not.

---

### D177 — The closed canal was open through Mexico, and the tests could not see it, 5 September

**Observed.** A2d gave Canada an Atlantic coast only, with a long comment explaining that a Pacific
one would let Washington reach Boston by sea. It then gave Mexico both coasts three lines later,
asserting that nothing on the far side of Mexico connects onward. That was false when written: a
corridor node costs nothing to enter and needs nobody's permission to leave, and one such hop is
allowed per route. Washington → Mexico → Florida, for a flat ten per cent, cheaper than crossing its
own continent.

**Why it survived.** Four tests guard the ruling and all four read the graph's edges. The two oceans
were never joined *directly*, so all four passed while the thing they exist to prevent happened
through a third country. Now `docs/PROGRAMMER-RULES.md` rule 5.

**Decided.** Water in, water out, across two different basins is refused; the sea a route sits in is
tracked only while it stands on a corridor node it sailed to, so the check costs nothing on almost
every hop.

**Deliberately NOT decided: the flat-rate corridor.** Reaching Mexico or Canada overland and shipping
onward is still allowed — that is what those goods would really do, and A2d says so. But it is also
priced at a flat ten per cent with no crossing cost of any kind, which makes a foreign corridor the
cheapest way across the continent regardless of distance. That is a design question with a
measurement attached (see D178) and it is Aaron's, not mine.

---

### D178 — The industry re-bake is stopped, and the 84% was wrong, 5 September

**Observed, by measuring it again rather than re-reading it.** The board carried "84% of industry
figures real after the re-bake" from the morning of 5 September. Independently recomputed against the
same government file: **77.0% of county sector cells and 75.4% at the Area level the game keys on.**
The gap is method, not arithmetic — the earlier count scored a place as measured when only a
*combined* line covering two of the six sectors was published, which gives the sum and neither part,
and scored trade without requiring transport. The two errors account for 6.45 points exactly.

**Two further findings, either of which alone would stop the job.** Agriculture is baked 10.2× above
its real share, and `qol.foodPerCapita` was explicitly calibrated against that inflation — its own
doc says so — so replacing the data without re-deriving hunger in the same change starves the
continent on turn one. And the six sectors reach only about 51% of a real economy: government,
construction, health, education and professional services have nowhere to land, so a faithful re-bake
deletes half the map's income rather than making it honest.

**And it reaches backwards.** `data/economy.json` is baked into the game and is not serialised into
saves, so every existing save would come back different.

**Decided: stopped, and brought back to Aaron.** He approved this on 5 September (D169), and that
approval was for a job described as clean. It is not clean, and three of the four cases the Hog Wild
rules name as stop-and-ask apply at once — expensive to reverse, invalidates existing games, and a
question of how the game should feel with no measurement that settles it. **An approval obtained on a
wrong description is not an approval.** Still worth doing; not worth doing quickly.

---

### D179 — All four stages happen in Claude Code, against one set of documents, 6 September

**Aaron, 6 September 2026:**

> "There are essentially four stages of this that we are doing: 1. Ideation and design
> 2. Architecture and planning 3. Programming and verifying 4. Play testing. I was doing #4, you and
> me are doing #3, but I was doing #1 and 2 in claude chat. The issue is that claude chat doesn't
> really do a good job of reading through the documents like you do."

**The problem, and it is a real one.** Design work done somewhere that cannot read the project
invents things that contradict it. A rule already recorded, a number already measured, a decision
already made — none of it is visible to a conversation with no access to the files, so the design it
produces has to be reconciled by hand afterwards, and the reconciliation is where mistakes enter.

**Decided.** All four stages run here, against the same documents, one stage at a time so that no
two sessions edit the same files. Aaron's intention is to work through ideation himself, then turn
the architecture loose to run unattended and review it, then turn the build loose the same way.

**What this needs that did not exist, all three raised in the same conversation:**

1. **A home for design in progress.** The project had `docs/spec/` for authoritative briefs,
   `DESIGN.md` for what is built, `FUTURE-IDEAS.md` for what is deferred and `deferred.md` for known
   defects — and nowhere for a system being thought about. `docs/design/` is now that place.
2. **A precedence rule**, or one folder simply recreates the contradiction it was meant to remove.
   **`DESIGN.md` stays the truth about what the game DOES; `docs/design/` holds what it is INTENDED
   to do and is not built.** When a thing ships, its design note points at `DESIGN.md` and stops
   being authoritative.
3. **A definition of "done" for a design stage.** Code has tests; a design has nothing, and its
   failure mode is not a bug but an elegant system that cannot describe a real situation. The answer
   found in the same conversation, by accident, is that **worked examples are to a design what tests
   are to code**: Aaron traced four things he had consumed in one day — milk, petrol, dishwasher
   detergent, a pen — back through their inputs, and it exposed more about the model than any amount
   of argument. A design stage ends with a set of concrete scenarios it must be able to narrate, each
   traced through.

**And a consequence for Hog Wild.** Everything in `docs/HOGWILD.md` is written for programming —
commit, tag, test, revert. Running it over a design phase needs its own verification, because there
is nothing to test and nothing to roll back. Recorded here rather than solved; the rules want writing
before the mode is used that way.

**First output of the new arrangement:** `docs/design/resources.md`, which is the resource
conversation of 6 September written down — the three tiers, the physical units, capability versus
allocation, the production chain, the six inputs and what is missing from them, the four worked
examples, and Aaron's own verdict that it is all too complicated.

### D180 — Five stages, not four, and ideation gets a document of its own, 6 September

**Aaron, 6 September 2026**, setting out how the design work runs:

> "1. Ideation - Food should be a resource that is traded and you need to reach a certain ammount to
> feed your citizens 2. Design - Food will be measured in gCalories in the game menu and shown to the
> user as the average kCalories per day their citizens eat which and at each level there are different
> negative effects 3. Architecht - Takes that design and actually creates the numbers that are needed
> for this 4. Program manager - takes everything and organizes it in a way that is easiest for the
> programmer to do 5. Programmer - does the programming."

**What changed.** D179 recorded four stages, with ideation and design together as one and architecture
and planning together as another. Both pairs are now split, giving five: ideation, design,
architecture, planning, programming. Playtesting still follows and is still Aaron's.

**Why this is not bookkeeping.** The first design note written under D179's arrangement —
`docs/design/resources-v2.md` — did ideation and design in a single pass, and its simplification cut
the model from nine tracked quantities to four before several of those ideas had been written down
anywhere at all. Cutting is a design act. Performed during ideation it destroys the material that
design is supposed to work from, and the only record of the cut ideas was a conversation. Under the
new split that was the wrong order, and it was wrong in a way that would have been invisible in a
month.

**Corrected the same day.** Everything `resources-v2.md` removed is restored in
`docs/design/economy-ideation.md` — the four-stage production chain, capital goods and the loop,
depreciation, minimum viable scale, non-fungible labour, emigration of the educated, litres and
megawatt-hours, and the eight- and ten-sector structures. `resources-v2.md` stays on disk as the
record of the pass; it is a preview of stage 2 and is not authoritative.

**The documents this stage owns.**

| | |
|---|---|
| `docs/design/economy-ideation.md` | Stage 1. Every idea, unjudged, numbered E1 upward. Grows until Aaron closes it |
| `docs/design/economy-design.md` | Stage 2. Not yet written. The artefact the architect receives |

**Three judgements taken inside the ruling, all reversible on a word from Aaron.**

1. **Scope.** This ideation round covers the economy and resources. F1 (sub-turns), F14 (a turn
   arriving as news) and F15 (whether counties are too granular) were left out: they concern time,
   presentation and the size of the map, and each wants its own round rather than being folded into
   this one. Aaron's instruction was to pull the ideas from the ideas file in, and this narrows it.
2. **`docs/FUTURE-IDEAS.md` was not emptied.** The idea was brought across in a few lines and the
   long-form reasoning left where it is, with the F-numbers kept so the trail runs both ways.
   Deleting the entries would break that file's own promise — that nothing is re-argued from
   scratch — and would duplicate fifteen pages.
3. **An end condition was written into the ideation document**, because a phase with no way to finish
   does not finish: ideation ends when a session reads it end to end and the only new entries are
   recombinations of ones already there, and when Aaron says so.

**One proposal attached to the design stage, not yet ruled on.** Every quantity in the design document
should be marked as one of *measure it from a named file*, *invent it as a placeholder tunable*, or
*ask Aaron*. Stage 3's brief is to "actually create the numbers", and this project's recorded failure
is an invented number arriving on the Control Board looking measured and standing for a day
(D178, programmer rule 7). Without that column the architect will invent in good faith and the result
will read as counted.


---

### D181 — This is not a war game, and two nations are always in one of seven named states, 7 September 2026

**Two rulings from Aaron on the day round 2 (military conquest) opened, and the second follows from
the first.**

**The observation that prompted them.** Round 2 opened by putting one question to Aaron: does a war
exist as a thing you are *in*, or does taking ground stay what it is today — a purchase? The question
was worth asking because of something verified against the running annexation move that morning:
unless a civil war fires **inside the attacker**, ground changes hands with no roll of any kind. The
defender's Border allocation, its readiness and its measured armed population are read only as a
multiplier on the attacker's own civil-war score. If that war does not trigger, the defender is never
consulted at all. Taking land is shopping, and the only rule that has ever refused a purchase is the
one protecting nations four times your size — which protects the big from the bigger and nobody else.

**Ruling 1 — the arrows point the other way.** In Aaron's words: *"This isn't a war game. I don't want
this to be a game of just war and conquering, where economics and diplomacy help your war effort. I
want a game where war impacts your economy and your diplomacy and your internal relations, and they
all interact."*

This is a statement about what the game **is**, not about conquest, and it binds every round that
follows. The usual strategy-game arrangement — an economy that funds an army, diplomacy that buys
allies for a war — is explicitly rejected. Conquest is not the system the others serve; it is a
system that happens *to* them. An idea earns its place by what it does to the economy, to the
neighbours and to a nation's own people, not by how well it wins wars.

**Ruling 2 — a war is a standing state, and it is one of seven.** Two nations are always in a named
relationship with each other:

| | |
|---|---|
| **Peace** | You can do anything with the nation |
| **Peace-treaty** | A signed treaty with stipulations — trade, territory, repayment. **Breaking it has a huge impact** |
| **Hostile** | Events have brought two nations close to war without war. It has impacts |
| **Cease-fire** | **All the impacts of war, except that you cannot attack** |
| **War** | Trade is prohibited, and you may attack |
| **Subject** | Deferred by Aaron — later in the round |
| **Allied** | Deferred by Aaron — later in the round |

**What was rejected, and it was mine.** I proposed a war *object*: declared for a named aim, running
on its own, ended by treaty or exhaustion. Aaron's answer is better and supersedes it. A war object
is a special case bolted beside the model; a relationship state is the same shape as everything in
this game that has already worked — recognition is a standing directed fact, a trade deal is a
standing contract with a term, a coalition is a standing set of named nations. The war aims idea is
not dead; it survives as a property of the War state rather than as a thing of its own.

**Why the seven-state form serves ruling 1 specifically.** None of the five live states is about
fighting. Four of them are lists of what a nation is *not allowed to do* — and prohibition is exactly
how a war reaches an economy that never sees a soldier. One consequence is already visible and uses
machinery that exists: a trade deal is a standing contract of 2, 4, 8 or 20 turns, and Aaron ruled on
the Control Board on 5 September that breaking one early damages your reputation and raises what
others ask of you, cooling over time. If War prohibits trade, then **declaring war on a trading
partner breaks a signed contract on the day it is declared** — an economic and diplomatic price paid
before a shot is fired.

**Where this lands.** `docs/design/conquest-ideation.md` §0 and §6, with the spine and the ideas
hanging off it at the head of the idea bank. Open questions on the spine — what causes Hostile,
whether a state is shared or one-sided, how transitions happen and whether they cost the single
action, and whether a peace-treaty expires — are listed in that document's §8 and are being put to
Aaron one at a time.

---

### D182 — The relationship spine: sixteen rulings that make war a state rather than an event, 8 September 2026

**Round 2 of ideation (military conquest) opened and ran its first session on 7–8 September. D181
recorded the frame and the first two rulings; this entry records what the remaining fourteen settled,
because together they change the shape of the game and every later round inherits them.** The rulings
themselves, with their reasoning and the ideas hanging off them, are in
`docs/design/conquest-ideation.md` §6 and at the head of its idea bank. Nothing here is built.

**What was decided.**

- **A pair of nations is always in one named state** — Peace, Peace-treaty, Hostile, Cease-fire, War,
  with Subject and Allied deferred inside the round. The state is **shared, not directed** (ruling 5);
  the directed, decaying record of what one nation did to another is untouched and sits underneath it.
  The one-sided variant of hostility was banked as **F18** rather than dropped.
- **Every state has an exit and three of the four are clocks** (ruling 7). Only two transitions need
  both nations to agree — into a cease-fire and into a treaty. A pair can be stuck in exactly one
  place, War, which is deliberate: **a war ends only by agreement and refusing is allowed** (ruling 6).
- **A cease-fire is a fixed term with all of war's costs running** (ruling 3), ending in a negotiation
  whose **default is Hostile rather than War** (ruling 8). A counter-offer extends it.
- **Five causes put two nations into Hostile** (ruling 4) and **not one of them is a military act** —
  a movement growing across a border, rival claimants to the same inheritance, resource desperation
  met with refusal or gouging, funding somebody's rebels, and hostility inherited through alliances.
  **What it costs** (ruling 9): tolls rise, what they demand before granting a crossing rises,
  matching movements grow faster inside you, and guarding the border costs more.
- **Ground changes hands at the settlement** (ruling 10), war stays **simple where the player touches
  it** — no troops, no troop types (ruling 11) — and **a fight is the attacker's Field against the
  defender's Border, shown as a percentage** (ruling 12).
- **Held ground carries one of three flags** (ruling 13): `occupied-war` while the war runs, which
  raises unrest, hits the economy hard and **may not be granted to anybody else as a trade passage**;
  `occupied` once a treaty is signed; `occupied-movement` where the matching movement is over 50% and
  the occupier is that movement's nation. **So what settles at a treaty is the tenure, not the border
  — a peace treaty is a title deed.**
- **An attack has two outcomes and the price was paid before the dice** (ruling 14).
- **A treaty has four levers** (ruling 15): territory, repayment capped at 1.25× what was spent on the
  war, forced trade deals, and a term. Refusing keeps the war running, raising weariness and making
  crises likelier.
- **A movement states DEMANDS on a screen of their own, and each gets one of three answers** —
  implement, decline, or tell them to wait, where never delivering after asking them to wait angers
  them more than declining would have (ruling 16).

**Three things this closed that were open.**

1. **Round 1's finding D**, which round 1 could not close and handed to politics: five of the six
   movement verbs had no government response, because the four release valves only ever answered
   *Separate*. Ruling 16 is the general form — an answer for all six verbs at once.
2. **The Tuesday question** the ideation plan requires every round to answer, and on which round 1's
   fifth traced scenario stalled. A screen of standing demands with three buttons is a thing to do on
   a Tuesday, and it is the first mechanism in either round that lets a player act on a movement
   rather than watch one.
3. **The risk logged under ruling 6** — that a player could be held in a war they cannot leave by an
   opponent willing to bleed. Ruling 15 answers it with no new machinery: crises trigger over the
   stocks and war weariness is one, and an election's single swing against an incumbent is built from
   four things including war weariness. **The stubborn opponent's own electorate removes them.**

**What was rejected, and most of it was mine.** A war *object* with named aims, superseded by the
relationship state (D181). A penalty for refusing peace — unnecessary, because the frame already makes
war expensive for the side that will not stop. A readiness cost for a failed attack — unnecessary, and
argued from a false premise: verified in the code, the price of an attack is debited **before** the
roll, so the money is gone either way and the odds price themselves. War restarting when a cease-fire
lapses, replaced by Aaron's gentler and better default of Hostile. And an indirect mechanism whereby a
hostile border drags the army outward and grows *all* your separatists, replaced by ruling 9's direct
and targeted version and kept as C76 because it makes a different claim.

**One finding recorded rather than solved.** Ruling 4's first cause and ruling 9's third effect close
a loop: a movement growing makes you hostile, and hostility makes it grow. That defeats ruling 7's
cooling clock, because the cause never goes away. Three existing brakes stand in the way — a
per-movement cap, multiplicative ideological match, and rate-limited sentiment — and none has been
measured against it. It may also be correct. **It is the first thing the closing trace of round 2 must
run.**

**Two numbers are placeholders and are marked as such**, per the rule that a design document says where
every quantity comes from: the **50%** threshold on `occupied-movement` (stated, measured against
nothing — and it sits *above* the 0.40 secession threshold, so every such Area was going to defect
anyway, which means the two should be set against each other rather than independently), and the
**1.25×** repayment cap, whose basis — the winner's war costs or the loser's — is one word that has
not been settled.

---

### D183 — A grudge fades on time at a speed the causes set, there is a sixth state called Wary, and the reunification rivalries never fade, 9 September 2026

**Ruling 17 of round 2.** The Control Board card asked whether hostility cools on a clock or only when
its cause goes away. **Aaron answered with a third thing that neither option contained**, and it is
better than the one I recommended.

**What was decided, in four parts.**

1. **The clock is real and always runs.** My proposal — that hostility ends only when its cause
   clears, with the clock as a cooling-off period afterwards — was rejected. Time ends a grudge.
2. **A sixth state, Wary, sits between Hostile and Peace.** Trade and dealings are permitted but
   guarded; the other nation will still make a deal with you. Every cooling grudge passes through it.
3. **The causes set the clock's speed rather than gating it.** A trade deal and other good standing
   cool a pair faster; a growing separatist movement or another live cause cools them slower.
4. **The four reunification contests are a permanent floor, not a slow clock.** The five Texan
   successors, the five Californians and the eastern capitals stay Hostile with each other at a
   minimum, for good. Aaron: *"That way it creates impositions and challenges."*

**Why part 3 is the good part.** I framed the question as cause **or** time and argued that a pure
clock would make a pair with a live cause *blink* — expire into Peace, be re-checked, snap back to
Hostile. Aaron's answer is **time at a speed the causes set**, which gets the permanent-rivalry feel
without any pair locking solid; and the new Wary state absorbs the blink, because the step down from
Hostile is to a guarded peace rather than to a clean one.

**And the loop that D182 recorded unsolved is closed by it.** A movement growing makes you hostile and
hostility makes it grow, which under a cause-gated clock meant the quarrel could never end. Under
ruling 17 a live cause only *slows* the clock — and the brake weakens on its own, because movement
growth is geometric against a per-movement ceiling (verified in `DESIGN.md`, 9 September). **Hostility
over a separatist movement is hardest to escape when the movement is new and eases as the situation
becomes chronic.** Nobody designed that curve; it falls out of machinery that already exists.

**What was rejected:** my cause-gated clock (part 1), on Aaron's judgement that grudges should fade.

**Two corrections recorded against the ruling rather than argued.**

- **Aaron wrote "weary"; it is recorded as "Wary".** From his own description — guarded, cautious,
  still willing to trade — the sense is *wary*. **"Weary" is already taken:** war weariness is one of
  the five power stocks, read by both crises and elections. One word to correct if he meant otherwise.
- **Austin's death is accepted, but not for the reason given.** Aaron accepts Austin may be wiped out
  early — *"they have no trade possibility then, but that is ok with me"* — which assumes Hostile bans
  trade. **Nothing ruled says it does.** Ruling 2 gives the trade prohibition to War alone and ruling
  9's costs of Hostile are prices, not bans. What actually strangles Austin is that it has no port and
  no international border and reaches the world only across ground now permanently hostile, so ruling
  9's toll costs apply to the whole of its foreign trade forever. **And the project answered a version
  of this question the other way once already:** an unrecognised nation keeps the world market at a
  smuggler's rate, deliberately, because a total block *"would make an unrecognised landlocked state
  unplayable and would also be untrue"*. **Whether Hostile permits trade at all is now an open
  question and it jumped the queue.**

**One new finding, replacing the one D182 left open as the trace's first job.** A Free Texas is *one*
movement with five claimants, so under the floor in part 4 every Texan nation is permanently hostile
with four neighbours who all match the same movement. **If ruling 9's growth bonus stacks per hostile
neighbour, every Texan carries a quadruple-accelerated separatist movement** against a 0.40 secession
threshold, and Texas reunifies itself by defection on a timer in every game — a script rather than a
story. *Proposed default, flagged rather than asked: the bonus takes the largest matching quarrel, not
the sum.* **This is now the first thing the closing trace of round 2 must run.**

---

### D184 — Round 2 of ideation closes: fifteen more rulings, six scenarios traced, seven findings, 9 September 2026

**Military conquest is closed.** Thirty-one rulings across two sittings, 121 ideas banked, and all six
scenarios traced end to end at the close. **Five narrate; one stalls, on a gap this project had already
recorded and already owns.** Round 1 closed three-of-five, so the round improved on it.

**The fifteen rulings made today, in one line each.** A grudge fades on **time**, at a speed the causes
set, through a new sixth state called **Wary** — and the reunification contests are a permanent **floor**
rather than a slow clock (17). Hostility **honours what is signed and permits nothing new**, for trade
deals (18) and for corridors (20). **Austin is the legitimate Texas** and the other four successors are
rebels (19). Hostility is resolved by time and by a diplomatic action handed to round 5, never by a
treaty (21). The repayment cap is priced off **whoever sends the treaty** (22). What a war *costs* goes
to round 4, and **an Area under attack produces nothing that turn whether or not it falls** (23). **One
Area per attack**, with the per-turn cap and the cooldown removed (24), and the four-times-your-size
shield removed with them (25). **Occupied ground eventually becomes your country**, at a speed set by
whether life got better (26). **Allied** is taken and kept thin; **Subject** is deferred (27). Breaking
a treaty **turns every neighbour but your allies hostile at once** (28). War may be declared from Peace,
*"because there is no treaty — they are just at peace"* (29). Declining a movement's demand makes it
**grow**; stringing it along makes it **change what it wants** (30). Three kinds of **base** as map
geography, and **no nuclear weapons** (31).

**Four of my recommendations were rejected and Aaron's replacements were better every time.** I proposed
a cause-gated cooling clock; he gave time at a speed the causes set, plus a state I had not thought of.
I proposed that hostility take the margin rather than the trade; he gave a rule that honours signatures
and refuses new ones, which completed a four-step ladder of permission. I proposed the repayment cap be
priced off the winner; he priced it off the proposer, **which means the game never has to decide who
won — and it has no way to decide.** I proposed a justification ladder for breaking a treaty; he charged
the cost to the audience instead of the victim.

**And two rulings turned out to do more than they were asked to.** Quality of life as the digestion
modifier (26) is, undesigned, **the strongest anti-snowball device in the round** — a prosperous nation
can absorb what it takes and a struggling one cannot, so conquest becomes a luxury of the successful,
inverting the usual logic in which conquest is how the poor get rich. And ruling 19 reversed Austin's
fate: recognition is earned above all **by the state you broke away from giving in**, and Austin *is*
that state — so a bankrupt, encircled, starving nation holds a veto over four larger ones.

**Seven findings, recorded in `conquest-ideation.md` §7b with owners.** Three of them are contradictions
between rulings made in the same session, which is what tracing is for. **Three need one line from
Aaron:** whose treaty is on the table when a cease-fire ends and both sides may propose (B); whether
alliance-inherited hostility is transitive, since one betrayal could otherwise turn the whole board (C);
and which nations actually claim the California Republic, **since the board has six successors where the
design has been saying five, and the answer decides whether 33 pairs open hostile or 38** (D).

**What was verified in the build rather than assumed, and each changed an answer:** movement growth is
geometric against a per-movement ceiling, which dissolved the runaway loop D182 left open; a corridor
carries the same term lengths as a trade deal and is not a standing toll, which inverted what ruling 20
does to Austin; the relations ledger has sixteen entry kinds and five of them are positive, so round 5
inherits half a system; output is held per Area across six sectors, so an attack denies a named kind of
production rather than income; and the cap-and-cooldown arithmetic showed that ruling 24 makes conquest
**67% faster** rather than slower, which is the opposite of how it reads.

**The one place this design asks for machinery that does not exist** is ruling 30's mutable movement
verb. Everything else re-points something already built. Handed to round 3, which opens next.

---

### D185 — Politics is rebuilt on three axes; eight parties are taken and the twenty-seven are parked, 9 September 2026

**What was observed.** Round 3 opened by asking whether to add a seventh political alignment —
Libertarianism — which Aaron had raised three separate times while marking up the Movement Register.
Checking the build first showed the cost was far lower than the ideation plan had assumed: the code is
genuinely table-driven, the number six appears only in comments, and ideology ids are literals in three
files. A seventh would have cost two numbers and a colour, plus re-weighting twenty authored region
recipes.

**Aaron rejected the question rather than answering it, and was right to.** The two alignments with
nowhere to sit — a market-liberal one and a technocratic one — were homeless for *opposite* reasons on
the *same* missing dimension. The built social axis runs liberal to traditional, which is a claim about
values; neither of those two is a claim about values. Both are claims about **who may compel whom**.
One alignment could never have housed both, because they sit at opposite ends of an axis that did not
exist.

**Decided: three axes — economy, morals, government power.** The third is new and it is the one most
spectrums leave out. **The economic axis's high end is *neo-liberal*, not *capitalist*** — Aaron's
terminology, and the word the game uses.

**A correction made in session, and it mattered.** Aaron's first enumeration listed nine positions and
tied government power to morals: every conservative authoritarian, every progressive libertarian. That
makes the third axis a copy of the second, and it deletes exactly the two positions that motivated
adding it. Three positions per axis gives **twenty-seven**; two gives **eight**.

**Aaron's own finding, kept because it is good and falls out of the geometry rather than a rule:**
extremism is structurally isolating. On the full cube a corner borders three positions, an edge four, a
face-centre five, and the dead centre six. Nobody has to write that down and it can never drift out of
sync with anything.

**Decided: the eight corners, each named for a real political party.** Seven of the eight are genuine
American parties or organisations — the Union Party of 1936, the People's Party of 1892, the Communist
Party, the Industrial Workers of the World, the America First Party, the Constitution Party, Technocracy
Incorporated and the Libertarian Party. Named parties rather than ideological families because what a
player meets is a ballot, not a taxonomy. **That was Aaron's reason and it is the correct one.**

**The alternative rejected, and its cost, recorded so it is not re-argued.** I recommended **nine** —
the eight corners plus the dead centre — on two grounds: with the middles gone every position is a
corner bordering exactly three others, so Aaron's own asymmetry disappears and all eight play the same;
and a country seeded from real American voting data is mostly moderate, so a set with no centre makes
every citizen an extremist on all three axes. **Aaron chose eight, twice.** The cost is real and is
accepted knowingly. If the board later feels shrill or the coalitions feel flat, the dead centre is the
first thing to add back and it costs three numbers.

**The twenty-seven are parked, not discarded.** Aaron: *"Can we save this for later."* They are the map
of the space the eight are the corners of, and the open problem he named — how twenty-seven positions
reconcile with the handful of parties that actually show up in a nation — is the reason. Both the
reference document and the editable register survive intact.

**What this still owes.** The map is seeded from 2024 county results as Republican, Democrat and other.
Under this scheme **neither major party maps across** — a Republican in Alabama and one in Vermont are
not the same party — so both must be split across the eight by cultural region, the way the small
"other" share already is. That is authoring rather than engineering, and it is the largest single job in
the change. **It has not been started and nothing has been built.** No code, data or `DESIGN.md` was
touched.

**Where it lives.** `docs/design/political-spectrum.md` is the twenty-seven with real-world analogues;
the registers are at
`https://claude.ai/code/artifact/e2ebf889-7ab9-4448-a707-60203b4c9605` (twenty-seven, collection
`positions`) and
`https://claude.ai/code/artifact/bc72d871-db3b-4e2d-8363-6909e491abe7` (eight, collection `parties`).

---

### D186 — Ten positions, authoritarians at both ends, and two conditions you fall into, 9 September 2026

**Supersedes D185's roster of eight. The three axes and the naming principle are unchanged.**

**Ten positions.** Republicans and Democrats hold the middle of the economy and power axes, split by
morals. Eight corners around them: Fascism, Distributism, Christian Nationalism and Anarcho-Capitalism
on the conservative side; Communism, Democratic Socialism, Digital Technocracy and Liberal Anarchy on
the progressive side. **Aaron's own list of twelve produced all eight corners exactly, arrived at
without working from the cube** — the strongest validation the three axes have had. The other four of
his twelve were two centrists and two conditions, which is why the set had felt incoherent to him.

**Aaron's layout: authoritarian at both outer ends.** Fascism at the far left, Communism at the far
right, libertarian corners inside. **This makes the horseshoe visible.** The arithmetic had already
found that fascism and communism are *neighbours* — they differ on morals alone and agree on both a
collective economy and an authoritarian state — and the layout now says it: both ends run off the
board into the same place.

**Aaron's mechanic: Despotism and Stateless are conditions you fall into, not parties.** Off either
authoritarian end is **Despotism** — one party or none, full command of the state, and a standing
penalty with every other nation. Out through the libertarian middle is **Stateless** — the government
dissolves into ground with people on it and nobody in charge. **Only the two centrist parties stand
over solid ground; every corner has a trapdoor under it.** The exchange rate between power gained and
standing lost is deliberately not set.

**The drift is an exact partition — Aaron spotted it, and it verifies tighter than he put it.** A
centrist reaches four corners by answering two questions: which way on the economy, which way on state
power. Morals stay put. Four each, eight in total, every corner reachable from exactly one starting
party. **So crossing the moral line is the expensive move**: a Republican party cannot become Communist
without becoming Democrat first, which makes moral realignment the slowest change on the board — as it
has been in American history.

**Two things this quietly fixes.** It re-points the built *change course* valve instead of asking for
new machinery; that valve is already gated on popular share and priced by distance moved. And it
shrinks the job D185 called the largest single piece of authoring: under ten positions the two major
parties **do** map straight across from the 2024 county seed, leaving only the small "other" share to
split by region.

**Nothing built.** No code, data or `DESIGN.md` touched. Register rebuilt at
`https://claude.ai/code/artifact/bc72d871-db3b-4e2d-8363-6909e491abe7` — collection `parties`,
documents `p01`-`p12`.


---

### D187 — The falling mechanic is deferred to after the alpha; the board is not, 9 September 2026

**Aaron, minutes after designing it:** *"we can work on that later and actually lets save that for
future ideas after the alpha build."*

**What is deferred.** Only the *mechanic* — what despotism buys, what it costs in standing, how far
"too far" is, and whether statelessness works the same way in reverse. Recorded as **F19** in
`docs/FUTURE-IDEAS.md` with the reasoning, Aaron's own words, and what would have to be true before
it is worth doing.

**What is not deferred.** The three axes, the ten positions, the layout with authoritarians at both
outer ends, and the drift partition — all ruled in D185 and D186 and all current. **Despotism and
Stateless stay named on the board**, because the shape needs them: a corner with nothing beyond it is
not a corner, and the four authoritarian corners are only extreme relative to something.

**Why this is the right call and not merely his.** The alpha track is A0-A4, which is trade — deals,
transit, the network map, AI nations trading unprompted. **Politics is not in it at all.** Deferring
a politics mechanic costs the alpha nothing, and the three numbers it needs are exactly the kind this
project has been burned by inventing: D185's own record notes that an invented number once reached
the Control Board looking measured. **No placeholder was written.**

---

### D188 — A stateless society is counties with no government, and it is the cheapest road on the continent, 9 September 2026

**Aaron's ruling**, answering the largest open question in round 3's inbox and the one round 1 called
the biggest unbuilt mechanic in the story.

> "A stateless society is a group of counties that are running without a government or anything."
> "They have a set trading fee of 10%... you are going in and trading directly with people."
> "They also have a set 5% toll... you will run trade through there but you are paying 5% along the
> way to protect your trade and pay off people you meet along the way."

**No government therefore no treasury, no army, no elections, no foreign policy.** Ground with people
on it.

**Derived and flagged as derived: both figures are COSTS, not transfers.** Nothing collects them —
there is no institution to collect them, and Aaron's reasoning sends the money to people met along the
road. That is precisely how `transit.foreignCorridorToll` already treats the Canada/Mexico corridor.

**Checked against the build, and both numbers land on something.** The 10% trading fee is *exactly*
the Canada/Mexico corridor cost. The 5% toll is *exactly* `transit.rateMin`, the lowest toll any
nation in the game will sign. Against a 35% baseline transit toll, a 60% ceiling and a 25% road
crossing cost that nobody collects, **this makes lawless ground the cheapest passage on the
continent.**

**And that answers C51, which round 2 handed forward unanswered.** C51 asked whether taking unclaimed
ground should anger anybody at all. **It does now: it angers everyone who was routing through it**,
because conquering the cheapest corridor on the map converts it into somebody's toll gate. Stateless
ground gains a constituency that nobody designed. **It also closes round 1's finding B for conquest:**
stateless ground has no stocks, because it has nothing to hold them.

**Cost to build:** the trade half is nearly free — it is the shipped Canada/Mexico corridor mechanism
pointed at different ground. **The ground is the expensive half**, since every Area belongs to a nation
today.

**Both figures become named tunables and are placeholders that stay put**, per Addendum A. **Nothing
built this sitting.** No code, data or `DESIGN.md` touched.

**Raised with Aaron and not yet answered:** whether it is deliberate that routing through lawless
ground undercuts every government on the map, including Canada.

---

### D189 — Stranded ground goes stateless, a movement can rise from it, and the threshold fires on cities, 9 September 2026

**Aaron's ruling, closing the rest of round 3's inbox question 1.** Territory severed from its nation
by a civil war or a shattered union, and surrounded by other states, **becomes a stateless society**
once the severed sections together exceed **2,000,000 citizens**. A second condition is wanted and is
deferred to **F20** at his instruction. **And a movement can rise out of stateless ground**, which
closes the open half of the question — *can it grow back into a state?* Yes.

**The life cycle is now complete: stranded → stateless → a movement organises → a nation.** What makes
it coherent is that nobody *chose* a stranded region; it has no claim and no organising principle, only
people on the wrong side of a line. A movement supplies the missing thing.

**Also confirmed this sitting:** the 5% stateless toll undercutting every government on the map,
Canada included, is deliberate. Aaron: *"you aren't dealing with governments you are dealing with
people and communities. No tolls, no nothing."*

**THE FINDING, measured against the real map and put to Aaron.** 340.1 million people across 3,143
counties, median county 26,138. **2,000,000 is 0.59% of the country. Seventeen counties clear it on
their own** — Los Angeles is 9.76M by itself — **and it takes 507 of the smallest counties to reach
it.** So two million people is one big city, or five hundred rural counties. **A population-only
threshold fires the moment a dense metro is severed and effectively never fires in the countryside**,
which is backwards from where statelessness belongs: the six regions that open stateless are Arkansas,
Wyoming, New Mexico, Kentucky, Ohio and Michigan. **As written the rule strands Chicago and never
strands Montana.** Recommendation carried in F20: require extent as well as population, and AND them
rather than OR them.

**And the caution from this project's own history.** `nation.minAreas` records that at 3 Areas,
*"75 of the 88 nations a fifty-turn game produced were released fragments rather than anything anyone
had fought for."* An automatic threshold that manufactures map objects has made this map confetti once.
Stateless ground is a cheaper object than a nation, so a repeat would be milder — same shape.

**One ratio surfaced that nobody had put side by side:** `nation.minPop` is **250,000**, so the
stranding threshold is **eight times the bar for becoming a whole country**. Defensible, since a
breakaway is chosen and a stranding is not, but it should be decided rather than inherited.

**What the build already gives this for nothing:** contiguity is computed, so detecting severed
territory is not new machinery; and a movement's homeland binds to Areas rather than to a parent
nation, so a movement on ungoverned ground needs no special case.

**Nothing built.** No code, data or `DESIGN.md` touched. Both figures become named tunables.

---

### D190 — Enveloped territory: over 500,000 it is a nation, under it a stateless society, 9 September 2026

**Supersedes D189's threshold and its outcome.** D189 stands in the record; it is not edited away.

**Aaron's ruling.** When a country loses ground and part of its territory ends up **enveloped by
another nation, or by two**, with no way to reach it:

- **more than 500,000 people → it becomes a nation**
- **500,000 or fewer → it becomes a stateless society**

**This inverts D189, and the inversion is the fix.** D189 had severed ground going stateless once it
passed **two million**, which put big regions into statelessness and left small ones attached — the
opposite of every other statement in this design about what stateless ground is. The finding raised
against it was that a population-only test *"strands Chicago and never strands Montana."* **Ruling 5
turns it the right way up:** a severed metro becomes a country, sparse severed countryside goes
stateless. It now agrees with Aaron's own tier-3 words — *"areas small enough to run on their own…
naturally fairly libertarian or anarchist"* — and with the six opening stateless regions being rural.

**And it is simpler than what it replaces, which is worth recording because the usual complaint runs
the other way.** **The threshold stopped being a gate and became a fork.** Under D189 the number
decided whether anything happened at all, leaving a silent third case: enveloped ground below the bar,
ungovernable and unmodelled. Under D190 every enveloped region becomes *something*. **F20's reserved
second condition may no longer be needed** — a fork does not need a gate's guard — and F20 is updated
to say so rather than left standing as an open worry.

**Two population bars now exist, and the harder one is on the case nobody chose.** `nation.minPop` is
**250,000** for a chosen breakaway — a movement that organised, fought and won. Enveloped ground needs
**500,000**. **Recorded as deliberate:** a breakaway arrives with leadership, a claim and a reason to
cohere; enveloped ground arrives with none of those and needs more mass to hold together. Whether the
two should be one tunable or two is left open.

**A trap flagged before anyone builds it.** The detection must be **"cut off by other nations' land"**,
not **"not contiguous"**. An island is not enveloped by anybody. A naive contiguity test would detach
every overseas holding the moment it was acquired — Alaska is 740,133 and Hawaii about 1.4 million, so
both clear 500,000 and would declare themselves on the turn any nation took them. The build already
reasons about *"an island has no land neighbours"*, so the distinction exists to be reused.

**Measured.** 500,000 is **0.15%** of the country and sits just below **Wyoming (587,618)**, the
smallest real state. **148 counties clear it alone**, against 292 at the 250,000 bar.

**Nothing built.** Both figures become named tunables.

---

### D191 — A coalition is a shared enemy, not an agreement; and movement members arm themselves, 9 September 2026

**Aaron struck the recommendation put to him and replaced it with something simpler.** I proposed that
two movements could work together if they shared a verb, shared ground, and sat close enough on the
political board to tolerate each other. **He removed all three conditions.** *"Movements only work
together when they are fighting against the state."*

**Ruling 6. There is no coalition object.** Nothing forms, holds, breaks or dissolves; there is no
alliance state between movements. **The coalition is an arithmetic fact about the government** — what
share of my people are in a movement, counting all of them. Two movements that despise each other both
count against you. **This is a simplification and it is recorded as one**, since the usual complaint
runs the other way. It also disposes of Aaron's own *"more chaos afterwards"* without a rule: they were
never allied, only simultaneously against you, so removing the government removes the only thing they
had in common.

**The build already half-agrees, and its code contradicts its own comment.** `Game.hostility(f)` is
documented as *"a movement IS opposition to the state that governs the Area"* — an argument for the
sum — and then takes the **maximum** single movement and discards the rest. **Ruling 6 makes the code
agree with its own reasoning, and it is one line.** The result stays within 0..1 naturally.

**Aaron's example is calibrated to a threshold he was never told about.** `secession.countyThreshold`
is **0.40**. His 26% is under it; his 26 + 26 = 52% is over it. Neither movement takes a county alone;
together they take it.

**One question this opens and it is his, not mine.** The leave test is written *per movement*. If the
total crosses 40% and no single movement has, **which movement takes the Area?** Recommended: none —
it goes stateless, since an Area whose government has lost control while no successor has won it is
ungoverned by definition, and D190 already built that object. **Not decided.**

**Ruling 7. Movement members join the militia rather than the army.** `Military.of` computes manpower
as `pop × mil.manpowerShare` at **0.004**, with **no movement term whatsoever** — a nation half
organised against itself currently fields the same army as one with no movements at all.

**Worked against the real Oregon** (4,272,371 people) at 26 / 26: the state army falls from **17,089**
to **8,202**, and each militia stands at **4,443**. **The state beats either militia 1.8 to 1 and
loses to both together, 8,202 against 8,886.** Nobody tuned that; it falls out of Aaron's two figures
meeting a manpower rate set long ago for an unrelated reason. **Two independent mechanics now put
Oregon on the same knife edge at 26 / 26**, which is good evidence the numbers sit in the right place.

**Left open as a tunable, with no figure invented:** whether a militia arms at the same four-in-a-
thousand rate as a peacetime state or higher, a militia being mobilised where a state is not.

**Nothing built.** No code, data or `DESIGN.md` touched.

---

### D192 — Past 40% a civil war clock starts, and a government may join the movement instead, 9 September 2026

**Ruling 8 — the countdown.** Aaron struck the recommendation that an Area past 40% with no single
winner goes stateless, and replaced an outcome with a pressure: **one movement past 40%, or several
summing past 40%, starts a per-turn chance of civil war that rises with the share.** The government
does not lose the ground; it lives with a rising risk of the thing that takes the ground away. That
matches how the rest of the game already works. **No figure named and none invented.**

**The finding under it.** `js/civilwar.js` is a complete, tested resolver — size-ratio scoring, summed
dice, three outcomes — and **every one of its triggers is an annexation**: a flipped plurality, or
annexed counties out-massing the annexer in GDP or population. **There is no internal path to civil war
in this game at all.** A nation can be half organised against itself and never risk one. Ruling 8 adds
a trigger to an engine that exists, which is the cheap half — **but the resolver is framed in
`before / added / after` demographics and a movement-driven war has no "added".** That framing must be
answered before it is built. Flagged, not solved.

**The scale question, raised with Aaron and open.** The built 40% (`secession.countyThreshold`) is
**per Area**. Aaron's coalition arithmetic is **per nation** — *"I am Oregon and now I have 26% of my
population."* **Two different measurements now both carry 40%.** Whether that is one number used twice
or two that coincide is undecided, and it matters: a nation at 40% overall may have no single county
near it, and a nation with three counties past 40% may sit at 5% nationally.

**Ruling 9 — a government may join the movement.** *"Looks like we are Cascadia now."* **A fifth
release valve, and the strongest.** The four built valves answer a movement by giving ground, giving
self-rule, changing what the government stands for, or sending soldiers; **this one answers by becoming
it.** Changing course changes an ideology; this changes an identity.

**Aaron's own price is self-balancing:** adopt one movement and every county where a *different*
movement is stronger walks out to that one. In the Oregon case, adopting Cascadia hands over every
county Greater Idaho leads. **You solve half the problem by conceding the other half.**

**What is built is not this.** Round 1's S29, *"going with the breakaway"*, is `Game.setPlayer` — the
**player changes seats** to a nation that has already declared. Ruling 9 is the opposite in every
respect: the **nation** transforms, nothing has declared, no split occurs unless the price triggers it,
and the player does not move. New machinery, though the county-handover half re-points release.

**No threshold named for ruling 9** — Aaron's *"over a certain number"* — **and none invented.**

**Nothing built.** No code, data or `DESIGN.md` touched.

---

### D193 — The one table: five moves against six verbs, and the adjective owns one column, 9 September 2026

**Ruling 11.** Aaron confirmed the structure: *"That is the general shape - yes."*

**The discovery that made it one table rather than two.** The four built release valves are **not four
ad-hoc levers for *Separate***. They are four **general moves**, unrecognised as general only because
they had never been aimed at another verb: **Concede** (release the ground), **Concede less**
(autonomy), **Remove the want** (change course), **Suppress** (garrison). **D192's ruling 9 adds a
fifth — Become them.** Five moves against six verbs fills the whole table with re-pointings of
machinery that already exists.

**Default taken and flagged: *become them* is a fifth move, not the maximum of conceding.** Releasing
ground gives away territory; becoming the movement gives away identity and keeps the territory. Too
different to collapse without hiding a choice from the player. One line to correct.

**Ruling 11a, proposed not ruled: the remove-the-want column belongs to the ADJECTIVE.** Round 1's
ruling 40 already said *"every movement has a verb — what happens if it wins — and an adjective — what
would make it stop wanting to"*, and nobody carried it into the table. **Four of the five moves are the
verb's; that one is the adjective's.** It fills the cell nobody could fill — what stops a Unify
movement wanting to merge — by making the answer depend on *why* it wants to merge: three of the five
are economic (deliver the prosperity, not the compact) and two are ideological (the *change course*
valve, already built).

**Four things the table turned up.**

1. **Weighted by movements rather than verbs, the hole is 40%, not five-sixths.** Finding D counted
   verbs. **Separate is 15 of the 25 reviewed — 60%** — so the built valves already answer three
   movements in five.
2. **Rejoin and Reconquer have no authored movements at all**; both are born in play only, so two of
   the "five verbs with no answer" have nothing yet to answer.
3. **Rejoin is the only verb curable by governing better.** Round 1 triggers it on authority, quality
   of life, war weariness and occupation — all things a government controls about itself. Every other
   verb needs you to give something away, act abroad, or suppress.
4. **"Join a bloc" is the concede-less move for Unify**, which answers round 1's inbox item 7 as a
   by-product: joining a bloc is a domestic political act, and it is integration without a merger.

**Two economies recorded.** An **autonomist** movement is the cheapest kind to satisfy, because its
cheap substitute and its cure are the same act. And **the design is 6 verbs + 7 adjectives + 5 moves =
18 things rather than 42 authored cells** — the table is generated, not written, the same economy the
ideology axes buy.

**Still open:** whether answering a movement costs the turn's action. Round 2's **C117** took the
default *free to answer, costly to obey* without asking, and it has never been confirmed.

**Nothing built.** No code, data or `DESIGN.md` touched.

---

### D194 — Seven adjectives become five, and one proposed merge was refused, 9 September 2026

**Ruling 11a is now ruled.** Aaron asked whether religious/ideological and resource/economic should
merge — *"would it make the game easier"*. **One did, one did not, and a third he had not asked about
did.**

**The test, and it is reusable: two adjectives merge when the same government act cures both.**

| Adjective | Movements | What removes the want |
|---|---|---|
| **autonomist** *(+ indigenous)* | 7 | self-rule, and giving land back |
| **cultural** | 6 | recognition |
| **ideological** *(+ religious)* | 6 | change course — **built** |
| **resource** | 3 | a share of what its own ground produces |
| **economic** | 3 | national policy — prosperity by other means |

**Religious merged into ideological.** Both are cured by the government adopting a position, and under
D186's three axes a religious movement *is* an ideological one at the traditional end of morals.
Nothing lost.

**Resource did NOT merge into economic, and Aaron's suggestion was refused with reasons.** They land in
different parts of the machine: **resource** is revenue forgone locally and permanently, re-pointing
the **autonomy** machinery; **economic** is national policy, re-pointing the **trade** machinery and
costing standing with every neighbour. **Merging them would hide a price difference that is the whole
reason the choice is interesting** — and it would surface only when someone tried to build one cure and
found it was two.

**Indigenous merged into autonomist** — not asked about, and stronger than either candidate he named.
The Native American Confederation and Hawaiian Sovereignty both want sovereignty and land restoration;
the Sagebrush Rebellion wants *"return the federal land, county supremacy."* Same two acts.
**Read from his approval of the summary table rather than stated in words, and flagged as such — one
word reverses it.** Movements keep their own names and goals regardless, so nothing a player reads
changes.

**The design is now 6 verbs + 5 adjectives + 5 moves = 16 things**, generating a table that would
otherwise be 42 authored cells.

**Still open on this table:** whether answering a movement costs the turn's action. Round 2's **C117**
took *free to answer, costly to obey* as a default without asking, and it has never been confirmed.

**Nothing built.**

---

### D195 — Martial law is a legal state, not a military one, and the one-action rule is going to change, 10 September 2026

**Ruling 14.** Martial law removes the rules the soldiers you already have are operating under. **It
gives no soldiers.** It multiplies an existing garrison and does nothing at all in an Area you do not
hold, so a nation with no army gets nothing from declaring it. **That shape was forced by a constraint
already in the build:** `mil.garrisonHalf` is per Area *"which is what stops a large empire suppressing
everything at once"*, and any martial law that simply suppresses everywhere breaks that on purpose.

**Aaron's three answers.** The election is suspended **only above 50% of the nation** — his note:
*"which also means that conquering too much could be a bad thing."* **It costs one action**, deferred
because *"we need to change the whole one action per turn."* **The AI may declare it**, with an
architecture note to bound it in both directions.

**What it costs:** civil liberties in every Area under it, above a garrison's rate; and **Authority
nationally**, because a government that suspends elections has announced it cannot win one. **Nothing
ends it** — the cost compounds, following round 2's taste of prices rather than hard brakes.

**The result that fell out rather than being designed.** Stealing an election is available only below
`election.stealBelow` = **0.32** liberties. **So a rotten government steals quietly and cheaply, and a
decent government cannot steal at all** and must declare openly at far greater cost, having further to
fall. **Neither is strictly better and they sit at opposite ends of the same scale** — which is
scenario 3 of the whole plan, *a government choosing between its own identity and its territory*,
arriving from an unexpected direction. Elections run every 16 turns, so the choice is rare and lands
hard.

**Finding E — Aaron's "conquering too much is bad" is true, and the mechanism is the posture, not the
size.** Measured: Areas are built to a **50,000-person floor**; force is `pop × 0.004` split three ways
between garrison, border and field; suppression is half at **200 per Area**. To hold half your Areas
needs `100 × Areas` garrisoning — **≈12% of your army at the map's average density of 201,000 per Area,
and ≈50% at the Area floor.** **So size never blocks it; density does, and conquest lowers density
because the cheap ground is the empty ground.** The bite is not *"too big to suspend an election"* but
**"choose between suspending elections and campaigning abroad"** — the force martial law needs at home
is exactly the Field force you wanted for more conquest.

**And readiness is rate-limited**, so a government cannot flip to garrison on the turn it needs martial
law. **It is a posture committed to several turns earlier, not a panic button.**

**Handed to round 7:** Aaron's statement that the one-action-per-turn rule needs changing, filed in
`the-things-above-ideation.md` with ruling 12's free-and-mandatory exception beside it, since that
exception should be designed in rather than grandfathered.

**Nothing built.** No code, data or `DESIGN.md` touched.

### D196 — The Control Board source file had the published page's wrapper baked into it
**Board maintenance, 10 September 2026.** The board source in this project was not a source file at
all: it was a saved copy of the *published* page, carrying the artifact viewer's own
`<!doctype html>…<body>` header and `</body></html>` footer around the real content. Every other
project's board source is clean. It had not caused a visible fault, because publishing tolerated the
extra wrapper, but it meant the file could not be rebuilt from the shared board template without
first being unwrapped — which is how it was found.

Stripped the wrapper, leaving the content byte-identical, then rebuilt the board from the shared
template like every other project. The board's own data was verified unchanged against the live
published version before and after: identical, apart from the one line naming this project's colour.



### D197 — The record was three documents behind the work, and the fix is machinery rather than advice
**Session housekeeping, 11 September 2026.** A `/resume` at the start of this session found that
**every document a fresh session reads first was describing a world that no longer existed.** The
newest handoff, written 9 September at 14:49, said round 3 had not started. In fact the same day's
evening and the whole of 10 September produced **fourteen rulings, two decisions (D195, D196) and
twenty-four commits.** The ideation plan still called round 3 "OPEN — next session"; the designer's
brief still credited round 2 with 31 rulings rather than 41 and said three of its findings were
waiting on Aaron when all three were answered; the Control Board still led on round 2 closing and was
stamped 9 September 12:40.

**This is the second time.** The 9 September handoff opens by describing the identical failure from
8 September — *"Write your handoff. This is the specific failure this document exists to prevent."*
It was written in bold, at the top of the document the failing session read. **It did not work,
because advice inside an artefact cannot protect that artefact:** a session only reads the warning
after it has already decided to trust the file carrying it.

**Decided, in two parts.**

**1. The record is straightened.** The round document now carries a status block at its head — 14
rulings, which spine questions are answered and by which ruling, which are still open, and the two
things that are Aaron's and were never carded. The five answered questions are struck through where
they are asked. The plan and the brief now say what is true. The board is republished. This handoff
is written.

**2. Staleness is measured by machinery, fleet-wide.** Recorded in full as **D10 in the
`000-default-prompts` repository**, which is installed on both machines: the session-start hook finds
the commit that last touched the newest handoff, counts what landed after it and names those commits;
`/resume` measures the same thing and is required to read those commits rather than the handoff when
they disagree, and to straighten the record before starting new work; `/handoff` and `/signoff` state
that the handoff is the last thing a session writes and must be rewritten if anything lands after it,
with a check in sign-off that must print `0`. **Verified against this project before shipping: the
hook prints the warning and names all 24 commits.**

**Rejected:** writing a third, firmer instruction to remember. Two have now failed. **Also rejected:**
a hook that refuses to let a session end without a handoff — it cannot tell which turn is the last
one, so it would fire constantly and be disabled inside a day.

**Nothing built.** No code, data or `DESIGN.md` touched; this was housekeeping and documents.

**Two things found while straightening, both Aaron's and neither ever put in front of him:**
**Finding A** — the Farmers Union covers 983 counties and 22.6 million people, has never been given a
verb, and the story calls it a bloc of governors while the data calls it a popular movement; five
other movement pairs cannot be judged until it has one. And **ruling 6's opened question** — when the
*total* movement share in an Area crosses the 40% threshold but no single movement has, which
movement takes the Area? *(Recommendation on file: none of them, it goes stateless.)* Both are now
cards on the board.

### D198 — The Farmers Union is a movement that wants a union, and a Unify movement's demand is a diplomatic act
**Round 3 ruling 15, 11 September 2026.** Finding A asked whether the Farmers Union — 983 counties,
22.6 million people, the one movement never in front of Aaron — is a popular movement or the bloc of
governors the story describes, and what it wants. **Aaron: a movement, seeking "to unify the entire
farmers movement into a solid state entity", and it must be hard to achieve because of the trade
arteries a united farm state would hold.** The governors' bloc becomes a separate object for round 5.
The five movement pairs that could not be judged without a verb are unblocked.

**The part that is general, and it is new machinery.** *"They are trying to get their government to do
something, create a union… if a country has X% of the farmers movement the demand would be that they
start asking their neighbors, so to propose. And depending on how things go the proposal could go one
of two ways — positive or negative. Positive would be that they agree and negative would be that they
feel like the nation is trying to consolidate power."* **So a Unify movement does not demand a merger;
it demands that the government go and ASK.** The answer is another nation's to give.

**Observed, and it is why the ruling is right.** Ruling 11's table gave *Concede* for **Unify** as
"merge with the neighbour". That is **the only cell in the whole table a government cannot deliver by
itself** — every other move acts on its own people, ground or policy. This one needs a yes from
somebody else, so for Unify, conceding is an **attempt that can fail**. Nothing else in the design has
that shape. It also supplies the round's missing player verb from an unexpected direction: Q3 asked
whether *negotiate* should be added, and here the movement makes you negotiate on its behalf.

**Measured rather than assumed, against the game's own trade data.** Three of the fifteen chokepoints
sit inside Farmers Union ground — the **Soo Locks**, the **Straits of Mackinac** and **Cairo**, the
Ohio–Mississippi confluence — along with 164 counties on named waterways (47 Mississippi, 39 Missouri,
16 Ohio, 16 Illinois), 23 ports, 47 Great Lakes counties and 4 border crossings. **A united farm state
would hold a fifth of the continent's gates.** Aaron's premise stands on the data.

**A correction carried into the same entry.** The movement was put to Aaron in session as "the second
largest in the game". True **by ground** (983 counties, behind the New Confederacy's 1,142) and that is
how finding A stated it — but **by people it is fourth of the six Unify movements**: Christian
Nationalism 96.9m, Blue-Collar Populist 70.1m, Great Lakes Free Trade 23.7m, Farmers Union 22.6m, New
England United 15.4m, Central States Union 10.0m. It is the movement with the most ground and the
fewest people on it. The ruling is unaffected; the framing was too heavy.

**Finding F, measured while pricing this.** The Farmers Union and the Blue-Collar Populists overlap on
**504 counties and 15.1 million people — two-thirds of the Farmers Union's own population — and both
want Unify.** Under ruling 6 they sum against the same government; under this ruling they would both
be demanding proposals to neighbours, for two different unions, on the same ground, in the same turn.
The largest coalition on the board, and nobody designed it.

**Rejected:** (a) taking it off the movement list and treating it only as a bloc of governors, which
would have deleted the largest source of pressure in the interior. (b) Giving it **Separate**, which
was offered as the alternative: with 983 counties spread evenly across thirteen states and no home
state, there is nothing for it to walk out of.

**Deferred, not invented:** the **X%** share at which the demand fires. No placeholder was
substituted; it joins the tunables at the mechanics stage beside ruling 39's Wary multiplier.

**Open and asked in order:** what a neighbour's *yes* actually produces; what decides positive or
negative; whether asking once satisfies the movement; and whether proposing costs the turn's one
action.

### D199 — A proposal has three answers, a maybe grows the movement abroad, and a union carries none of conquest's penalties
**Round 3 ruling 16, 11 September 2026.** Ruling 15 left four questions; this answers the first.
**Aaron: a neighbour says yes, "let's think about it", or no. A "let's think about it" means they are
seriously considering it and the movement inside THEIR country gets a bonus growth modifier. A yes
makes the two nations one entity, with everyone a full member of that state — "no negative multipliers
like when conquering territory".**

**Observed.** The middle answer is new and it is the best part: **a diplomatic act that grows a
movement in another country.** Nothing else in the design crosses a border that way — goods move,
soldiers move, and ideology leaks through affinity, but nobody could deliberately grow somebody else's
movement before. It also gives the asking government something to do while it waits, which stops the
whole mechanic being one roll of a die.

**Measured rather than asserted, because "no negative multipliers" names something the build already
has.** Ground held as *occupied* today drags five separate things: **Authority** (one of its eleven
inputs), **Influence** (the same share read again), **Civil liberties** (`liberty.wOccupation`, *"share
of held ground governed as occupied territory"*), **war weariness**, and **a superlinear treasury
surcharge that scales with how hostile the ground is**. A union pays none of the five. **So the ruling
says more than it looks: joining is the only route to size that does not poison the ground you
gained** — which is this game's title arriving as a mechanic rather than as a theme.

**Default taken, not asked; one line to reverse.** *Their movements come with them.* A yes waives the
**occupation** penalty, not the **politics**. Otherwise a merger would be a way to launder a hostile
population — walk in by invitation and a region that wanted out of them stops wanting out of you.
Finding F is exactly that case: unite to satisfy the farmers and you inherit the rust belt's movement,
which under ruling 6 sums against you.

**Risk recorded now because later answers decide it.** If a "let's think about it" costs the asker
nothing, asking every turn is a dominant strategy: farm the neighbour's movement upward until their
own government is the one carrying the demand. Three possible brakes exist and none is confirmed — the
turn's one action, the suspicion a refusal creates, and the X% gate before the demand fires. **At least
one must bite**, and whichever answer lands should be checked against this.

**Still open from ruling 15:** what decides which of the three answers; whether asking once satisfies
the movement; whether proposing costs the turn's action.

### D200 — What decides a neighbour's answer: their appetite, your weight, and the relationship as a gate
**Round 3 ruling 17, 11 September 2026.** Ruling 15's second question. The shape put to Aaron was one
dial, two modifiers and a gate, all from machinery that already exists; **he approved it and corrected
one term: "size should also include authority and influence".**

**Decided.** The **dial** is the share of the *neighbour's own* population organised in the same
movement — low refuses, middling gives ruling 16's "let's think about it", high agrees. **Political
closeness warms it**, using the same `affinity` already driving coalitions, drift, trade alignment,
defection and AI diplomacy. **Your weight against theirs cools it — size, Authority and Influence
together** — and that is also where *"they feel like the nation is trying to consolidate power"* comes
from. **The relationship gates it**: round 2 ruled a *wary* nation less willing to agree to what you
propose, and a *hostile* one cannot say yes at all.

**Why the correction is right.** Physical size alone would make a sprawling, badly governed country
frightening and a small, firmly held, widely trading one harmless, which is backwards. A nation is
frightening for what it can bring to bear. It also makes the brake self-correcting: **the nation that
is winning is the one that finds unions hardest**, since winning is what raises all three terms — which
delivers ruling 15's "it should be hard to actually do" without a rule that says no.

**Observed while checking it, and it is a real trap.** Influence in the build is share of world output,
trading reach, and how close the rest of the world is to you politically — **and it is reduced by ground
taken recently, scaled by how big you already were** (*"a superpower annexing a neighbour pays more in
reputation than an unknown does"*). Used raw on the cooling side, that means **a nation fresh from a
conquest looks less frightening for as long as the penalty lasts.** The dip is temporary, and it points
the wrong way while it holds.

**Default taken, one line to reverse:** ground taken recently counts as frightening in its own right,
beside the three terms; the game already tracks it in the same history window Influence uses.
**The alternative is recorded rather than dismissed:** Influence is standing in the world's eyes and a
conqueror has spent it, so a conqueror is not less threatening but **less persuasive** — under that
reading Influence belongs on the warm side. Aaron's wording puts all three on the cooling side, so that
is what is ruled.

**Filed, not answered:** whether a player can SEE a neighbour's Authority and Influence before
proposing. Joined to **C130**, round 2's open question about what a nation can see of its enemy when
writing a blind peace treaty; both want one answer.

**Still open:** whether asking once satisfies the movement, and whether proposing costs the turn's one
action. The proposal-spam exploit recorded in D199 is still unbraked.

### D201 — Asking discharges the demand, the movement comes back elsewhere, and that is what closes the exploit
**Round 3 rulings 18 and 19, 11 September 2026.** The last two of ruling 15's four questions.

**Ruling 18, agreed by Aaron.** The demand names a neighbour; **asking that neighbour discharges it**,
and the movement raises it again later pointing at whichever neighbour is now the likeliest yes — often
the one that said *"let's think about it"*, because that answer grew their appetite. **The movement is
clever for free**: it points at whoever scores highest under ruling 17, so the calculation that decides
the answer also decides who gets asked, and it never sends the player somewhere hopeless.

**The part worth keeping: this is the brake the previous two rulings were missing.** D199 recorded a
dominant strategy — propose every turn, farm the neighbour's movement upward, wait until their own
government carries the demand. **It closes by itself, because the proposal runs on the movement's clock
rather than the player's.** You ask when your own people demand it, and asking more often would mean a
bigger movement at home, which is a worse problem than the one being solved. No rule had to be written
to forbid anything.

**Rejected**, and it was put to him: a demand that never discharges until a union exists. Truer to a
single-issue movement, but a country with an unlucky neighbour would carry a permanent penalty it could
not clear by doing anything right.

**Ruling 19 — a default taken rather than asked, one line to reverse.** Does proposing cost the turn's
one action? **Yes, by precedent**: ruling 12 settled that answering a demand is free and mandatory
while obeying it is costly, and making the proposal is obeying. It costs what granting autonomy or
releasing ground costs. Nothing about a union is special enough to need its own rule. **The caveat is
Aaron's own**, from ruling 14: *"we need to change the whole one action per turn"* — filed in round 7.
When that rule changes, this one changes with it, because it is a consequence of that rule rather than
an independent decision.

**Deferred, not invented:** how long a discharged demand stays quiet. Joins ruling 15's **X%** in the
tunables.

**Filed for round 5:** whether a government may propose a union with no movement demanding it — a
nation-to-nation act rather than an answer to its own people.

### D202 — A split region goes ungoverned, and its edge counties pick a neighbour over the local winner
**Round 3 ruling 20, 11 September 2026.** Closes ruling 6's opened question and the second board card.

**Part one, as recommended and agreed.** When the total organised share of an Area crosses the 0.40
leave line and no single movement has crossed it alone, **nobody takes the ground — it goes
ungoverned.** Ruling 5 already built that object and ruling 13 already says how movements behave on it
(attraction, not grievance), so both movements carry on competing there with no government to push
against. **Two movements can bring a government down together and neither inherits what is left.**
*Rejected:* the largest movement taking it, which would hand a quarter of a region's organisers a place
three-quarters of it did not choose; and the ground merely costing more to hold, which is what the
build does today by accident and which makes the coalition rule toothless.

**Part two, added by Aaron and the more interesting half.** *"Edge counties should possibly join up
with them… if it has similiar politics or other things it has a greater chance of joining up with a
state that they aren't aligned with from a movement standpoint — because sometimes it is better to be
governed by people you don't like rather than worry about being governed by people who hate you."*

**So a county on the boundary weighs two futures, and the dial is politics rather than movement
alignment.** Both are computable with machinery that exists: `affinity` asked **twice** — once between
the county's people and the adjacent state's government (*how much you would dislike them*), once
between the county's people and the strongest movement on the ungoverned ground (*how much the local
winner hates you*) — and the county leaves when the second is worse than the first. One existing
function, two futures, no new data. **No movement-based rule could produce the behaviour Aaron wants;
this one produces it as its normal case.**

**Measured, and it changes the size of the rule.** The unit that goes ungoverned is an **Area**, and the
map has **1,688 Areas over 3,143 counties — 1,181 of them (70%) a single county**, with a hard ceiling
of 8. **So for seven Areas in ten, "the edge counties" is the entire Area.** A lone Area that falls out
of a nation is all edge and will usually attach to somebody. That is the rule saving itself from its own
worst outcome: **small pockets get absorbed, and only a large collapse leaves lasting ungoverned
ground** — the shape of the six regions the story opens with, arrived at without a rule that says "only
big ones count".

**Two defaults taken, each one line to reverse:** the receiving state gets no refusal (the county
arrives with its grievance and any movement organised in it, which is the same price ruling 16 put on a
union); and the choice happens when the ground falls rather than continuously (counties leaking to
neighbours every turn afterwards would give ungoverned ground a slow decay, and is noted for the
mechanics stage instead).

**Deferred, not invented:** the margin by which "they hate us" must beat "we dislike them", and whatever
Aaron's *"or other things"* turns out to hold. Joins ruling 15's X% and ruling 18's quiet period.

### D203 — Of the four new release valves round 1 proposed, only the referendum is new
**Round 3 ruling 21, 11 September 2026**, answering Q3. Aaron approved all four verdicts.

**Decided.** **S24, negotiate with the movement — already built; not added again.** Round 1 called it
"the missing player verb", but round 2 then built the screen where a nation's own separatists make
demands it can grant, refuse or tell to wait, and ruling 12 made answering them free and mandatory.
That is S15 from the government's side, which is what S24 asked for; the only difference left is who
opens the conversation. **S25, hold a referendum — ADDED**, and it is the only genuinely new valve.
**S26, buy them — deferred to round 4**, because what money can buy is the economy's to say. **S27,
partition it yourself — dropped**, on two grounds: releasing ground already works over a chosen set of
Areas, so releasing the ones that want out while keeping the rest *is* partition under a name that
already exists; and a line cannot be drawn below an Area, since the Area is the atomic unit and
**1,181 of the map's 1,688 Areas are a single county**.

**Why the referendum earns its place.** Lose and the ground leaves cleanly — released, a country from
day one, no war. Win and the movement is set back for years. It re-points machinery that exists,
including the honesty of the result: a vote can only be rigged when Civil Liberties are already below
`election.stealBelow` (**0.32**), and rigging costs **0.12** more — so how trustworthy your referendum
is depends on what kind of government you have been. That is the same shape ruling 14 found between
martial law and a stolen election, reached independently. **And it carries the second-order cost S28
demanded of every answer:** win narrowly and you have proved in public, with a number, that half the
region wants out. Nothing else in the design makes a movement's support common knowledge.

**Worth naming, because the complaint usually runs the other way.** Round 1 proposed four new
government powers on 6 September. Five days later **three of the four are answered by things built or
ruled in the meantime** — one exists, one is another round's, one was always possible — and the design
grew by exactly one verb.

**Filed as F21:** Aaron's extension, **funding propaganda** before a referendum. It is S26 pointed at a
vote rather than at a region, and it sits opposite rigging on the same scale — money buys a result
legally, liberties buy it illegally. Not designed now, for the same reason S26 is deferred: the price
is round 4's to set.

### D204 — The mutable movement verb: it counts broken promises, moves one step to Separate, and never comes back
**Round 3 ruling 22, 11 September 2026**, answering **Q5** — the only piece of machinery the whole
design asks for that does not exist. Aaron: **"Correct - counts broken promises."**

**Half of it was already ruled and the spine had not noticed.** Round 2's ruling 30 settled the
behaviour — *wait and never deliver, and the movement's verb changes toward Separate* — with the reason
that if stringing somebody along were merely a larger growth number, a player would use "wait" as a
cheap delay and absorb the difference. **What round 3 owed was the mechanism, not the principle.**

**Decided.** **The clock counts broken promises, not turns**: each time a demand is answered with
*wait* and the thing has still not arrived when the movement asks again, the count rises by one. **It
moves one step, always to *Separate*, and never back.** **It fires once, as an event the player is
told about**, not as a recalculation each turn.

**Why each.** A turn timer would punish a government that waited once and delivered late — the opposite
of the lesson. A count punishes exactly the behaviour being named, and ruling 12's mandatory answering
makes it immune to a player who simply never opens the screen. A ladder of intermediate wants would
need a rule for every pair of six verbs, which is the bookkeeping ruling 11's table exists to avoid;
disappointment has one destination. And **C133 requires the once-only firing** — a verb that flips on a
re-check has the same defect that would make round 2's ruling 38 impossible.

**Finding G becomes real here, and it is the only exit from a permanent feud in the design.** Two
nations contesting the same inheritance never forgive each other — **but if the Reunify movement
driving one of them gives up, the permanent hostility floor lifts with it.** A country can talk its way
out of a forever-war by disappointing its own hardliners until they stop asking, at the price of
turning them into separatists.

**Default taken, one line to reverse:** the **adjective** does not change, only the verb. What would buy
the movement off stays what it was; ruling 11a put the adjective in charge of the *remove the want*
column and being disappointed does not change what the grievance is about.

**Deferred, not invented:** how many broken promises. Joins ruling 15's X%, ruling 18's quiet period and
ruling 20's margin.

### D205 — A nation's stance toward the old country is read from its movements, not stored
**Round 3 ruling 23, 11 September 2026**, answering Q12 — *"Correct"*. It cost nothing, because ruling
22 had just been made.

**Decided.** A nation's posture toward the old United States is **what the movements inside it want**:
**waiting** if a Rejoin or Reunify movement is organised on its ground, **gone** if none is. It changes
exactly when ruling 22 fires — strung along, the verb flips to *Separate*, and the country stops
waiting — **one way and permanently**. Nothing is stored and nothing new is built; the posture is a view
of data that already exists, the same economy ruling 11a bought by making the table generated rather
than authored.

**What it is for.** Ruling 11 found that **Rejoin is the only verb curable by governing better** (round
1's ruling 42 triggers it on authority, quality of life, war weariness and occupation). **So the posture
decides whether that door is open:** a nation still waiting can be won back by a remnant that governs
well; a nation that has given up can never be won back, however good the old country becomes.

**The consequence worth keeping: the federal remnant gets a clock it does not control.** Every province
that gives up waiting is one it can never recover, and it cannot stop them giving up — it can only be
worth coming back to, fast enough. Nothing else in the design puts a government under a deadline it
cannot touch, and it turns Q7 from a flavour question into a live one: a remnant that opens with its
authority below where it should be opens already losing that race.

**And the inbox story tells itself.** Greater Idaho "originally planned on staying in the union but then
decided to leave altogether" — meant to stay, strung along, want flipped, gone for good. No rule was
written for Greater Idaho.

### D206 — The remnant opens weak because its losses are seeded, not because a number says so
**Round 3 ruling 24, 11 September 2026**, answering Q7 — *"Agreed"*.

**Part one, decided.** The federal remnant opens with its authority below where it should be, and the
mechanism is to **seed the history rather than the number**: authority already reads recent losses, so
writing the states it actually lost into its record when the world is made produces the low authority
from the model itself — and lets it climb back on its own as those losses age out of the window. No new
tunable and no invented figure. **It is a pattern already chosen**, not a new idea: round 2 settled the
same question for pre-game wars, which leave grudges, tiredness and armies out of position written into
the world at creation.

**The argument that makes it compulsory, read from the build.** Authority is also raised by Age ("turns
since founding") and Tenure ("turns this ideology has governed"), and **the remnant is the only nation
on the board that is not brand new**. Leave its losses unwritten and the country that has just lost half
of itself opens as the best-governed nation in the game, above sixty newborn neighbours — on the opening
screen.

**And ruling 23 raised the stakes while this sat in the inbox:** provinces stop waiting one by one and
can never be won back, so the remnant opens already losing a race it cannot stop, and how far below it
starts decides how much of the country is still reachable.

**Part two, decided: nothing new fills the vacuum.** "Local powers stepping up and filling in" is what
movements and ungoverned ground already are. A separate mechanism would be two answers to one question
and both would need tuning. **This round has now declined to build something four times** — S24, S27,
the second vacuum mechanism, and the coalition object ruling 6 disposed of.

### D207 — A federation is a real form: many states, a flat internal toll, an elected leader and a turn of its own
**Round 3 ruling 25, 11 September 2026**, answering Q8 — **and overruling the recommendation**, which
was that a federation should be a name for a union that keeps self-rule.

**Aaron ruled it as an object.** A federation is a relation between **multiple** states — an alliance is
two — modelled on the EU. Inside it, a free trade agreement with every member carrying a **flat 10% toll
applied automatically**, of which **5% goes to the nation and 5% to the federation**, and that 5% is the
federation's **sole** income. Members **elect a leader** every so often, HRE-style, and that nation then
runs **two budgets, its own and the federation's**. The federation takes a **separate, deliberately short
turn**: help a struggling member financially, petition to allow a declaration of war, and accept or
reject trade deals offered from outside. **An outside deal is signed with the whole federation** — at 20%,
5% to the federation and the remaining 15% to all the other members. Tolls the same way.

**Why overruling was right, and the recommendation was a category error.** A union is ONE state; this is
**many states that stay states**, which the build cannot express at all: alliances are pairs and blocs
have no substance. It is a genuinely new object — the second this round has asked for, after ruling 22's
clock.

**Three consequences nobody designed.** (1) **A federation's power scales with how much its members trade
with each other**, because its only income is a slice of internal trade — a federation of neighbours who
ignore each other is broke. (2) **Being elected leader is worth real money**, since the leader spends the
federation's budget as well as its own, and one of the three permitted actions — helping a struggling
member — is also how a leader buys the next election. (3) **The leader does the work and the members take
the money**: the external split is 5% federation and 15% to the others, and the negotiating is the
federation's turn. Which is the EU exactly.

**Flagged, not solved: it collides with the built trade engine.** Corridors today are negotiated,
per-mode, per-direction standing agreements with a notice period, and tolls compound on what arrives. A
flat, automatic, unrefusable 10% between members is a different animal. Also noted so nobody conflates
them: **10% is already the placeholder toll for routing through Canada and Mexico** — same number,
unrelated meaning.

**Scope.** A diplomacy object ruled in the politics round. Round 3 owns its domestic price (Q11); **its
mechanics are round 5's and the toll split is round 4's**, because what a percentage of trade is worth is
the economy's to say. Recorded here in full and handed on rather than built. **Aaron's figures — 10%, the
5/5 split, the 20% example — are recorded as given**, not invented by me, and become tunables at the
mechanics stage. "Every so often" for the election is deferred; national elections run every 16 turns and
whether the federation borrows that is undecided.

**Seven questions opened and being asked in order:** whether the flat 10% replaces members' own corridors
or sits on top; which nation takes the 5%; what happens when a petition for war is refused; whether two
members can be hostile at all; how a nation joins and leaves; what becomes of the federation if its
leader is conquered or leaves; and whether the external 15% splits evenly or by size.

### D208 — The federation, designed in eleven rulings
**Round 3 rulings 26–36, 11 September 2026.** Ruling 25 (D207) made the federation a real object and
opened seven questions; they were answered in one sitting, and the answers are recorded in
`politics-ideation.md`. Summarised here because `DECISIONS.md` is the index a future session reads.

**Decided.** The flat 10% **replaces** members' own arrangements with each other, so joining costs a
nation the sharpest weapon in the game — the right to shut a neighbour's route and burn its contract
(**26**). The nation's 5% goes to **whoever's ground is crossed**, and two members who are direct
neighbours pay only the federation's 5%, because there is no host (**27**). **An attack on one member
is a war with all of them** (**28**). A refused petition is **not a wall**: declare anyway and you are
out, losing the flat rates, the external share and collective defence on the turn your war starts
(**29**). **Inside a federation you are at peace with every member** — no hostility and no wariness
(**30**). The contest claimants carry a modifier that **blocks them from ever joining a union**, so
round 2's 33 permanent rivalries survive (**31**). **A union is one state; a federation is a union of
states** — Aaron's correction, and it made ruling 11's table work harder, because *concede* for a Unify
movement is now blocked between rivals while *concede less* is not (**32**). So **nothing is
suppressed**: Christian Nationalism grows where it was authored and the federation is the answer its
government can still give (**33**). **The members vote you in, anyone may walk out immediately, and
three is the floor** (**34**). **The federation makes peace as one, through its leader**, and a member
that wants out leaves first (**35**). **The outside 15% splits evenly**, which is what pays a small
nation for being there (**36**).

**Three things nobody designed, all of them falling out of rulings made minutes apart.** The money
flows to the **gate-holders** and the protection flows to the **weak**, inside an institution whose
leader those same members elect. An even external split means **every new member dilutes everyone's
share**, so members have a reason to keep the club shut while the leader wants more traders — the
enlargement argument, with numbers on both sides. And a federation **can be destroyed without taking a
single Area**, by making a war tiresome enough that members leave until it falls below three.

**Measured rather than asserted:** three of the game's fifteen chokepoints sit on Farmers Union ground;
Michigan, New York, Illinois and Louisiana hold the gates a federation would most want and lose most by
joining; and barring union-seeking movements from contested ground would have cost Christian
Nationalism 89% of its counties, which is why ruling 33 exists.

**Rejected along the way:** a hard block on a member's war (round 2 removed every hard brake and
replaced it with a price); wariness between members (parked as **F23**); and the recommendation that a
federation was merely a name for a union that keeps self-rule, which Aaron overruled as a category
error — a union is one state and this is many states that stay states.

**Parked as future ideas:** **F22**, a federation stringing its own members along the way a government
strings a movement along; **F23**, members who quietly resent each other.

### D209 — Round 3 closes: 41 rulings, the movements re-placed, and three findings the trace produced
**Round 3 rulings 37–41 and the close, 11 September 2026.**

**Ruling 37 answers Q11, the last of round 1's inbox.** Joining a federation costs **Authority** in
proportion to how far your own people sit from the members — the existing alignment sum pointed at the
members instead of the world — and being led by somebody else costs a little each turn while leading
gains a little. **Aaron added the half that matters: it raises Influence.** And that half was already
built: Influence counts *reach*, meaning nations you hold live trade relations with, and membership is
flat-rate trade with every member. **So a federation trades authority for influence**, and both stocks
have existed since M3.

**Ruling 38 answers Q10**, the last spine question: the fervour of a new country becomes a **tolerance
applied to grievance** as well as borrowed Authority, and **it ends worse than neutral** — a patience
that has been spent is a grievance with a date on it. It matters because almost every nation on this
board is four turns old, and today a new nation is fragile in the moment it should be unbreakable.

**Rulings 39 and 40:** a **vassal keeps its own government** and its people blame that government
rather than the overlord; and **three words for three things** — ideology is a position on the board and
cannot move because it *is* a location, a party is an organisation inside one nation that occupies a
position, a movement is unchanged. The payoff is that *change course* is priced by how far the party
moves rather than by a tunable.

**Ruling 41** raises the growth cap of the **Sagebrush Rebellion, Acadiana and El Paso United** from
0.35 to **0.45**, so they can take ground of their own. **Specified and not made** — a design session
does not touch `data/`. 0.45 rather than 0.40 for a checked reason: the leave test is `>=` and the cap
is a hard clamp rather than an asymptote, so 0.40 would technically qualify but only at a movement's
absolute maximum, which is *can* in arithmetic and *cannot* in play.

**All 26 live movements were re-placed** on the ten positions rulings 1–2 built, because the register's
leanings were marked against the old six-ideology board. Seventeen were straight translations; nine
needed the third axis. **Aaron confirmed the Sagebrush Rebellion at Anarcho-Capitalism** — the corner he
asked for months ago — and **moved A Free Texas to Fascism**, because the story is that it was taken
over by a fascist bloc. That is the most consequential placement on the board: the Texas contest now has
a villain, and ruling 31 leaves no peaceful road to one Texas at all.

**The close.** The Tuesday test passes — round 1 left this round with **one** answer to a movement and
it leaves with **nine**, seven of them re-pointings of built machinery. **Scenario 3 failed its first
trace and that is what made it useful:** traced against Nevada facing the Sagebrush Rebellion, the
government is never cornered, because an autonomist movement's cheap answer and its cure are the same
act. Re-traced against an ideological movement it narrates — so the scenario was testing ruling 11a all
along.

**Three findings the trace produced.** **H** — three of the ten positions carry no movement, and the
movement layer touches only six of them. **I** — nine movements are capped below the 0.40 line, half of
them harmlessly (they never secede) but with a hard consequence: **ruling 15's unset X% must sit below
0.30**, or the two largest union movements can never make a demand at all. **J** — the federation's
deterrent may be absolute, which would make joining the dominant opening for every small nation; every
counterweight exists and none has been played, so **it is the first thing an alpha should watch**.

**Corrected at sign-off, before Aaron acted on it:** finding I first reported 155 million people and
32%. That summed nine overlapping homelands, counting a county once per movement covering it — the
denominator came to 485 million, more people than the country has. Counted over distinct counties it is
**117,847,633 people across 1,526 counties, and 38%**.

### D210 — The design wiki is generated scaffolding with hand-written prose, and the verbs come into the project, 12 September 2026

**What was observed.** By the close of round 3 the design was 135 numbered rulings across three
documents organised by *when* a thing was decided. Aaron asked where the Sagebrush Rebellion's
politics lived and the answer was in four places. Measured this session: it is in **nine**, in three
incompatible schemes — four say Republican (and those four are the code and data the game actually
runs on), two say Paleolibertarianism, three say Anarcho-Capitalism. Only the design documents agree
with ruling 41.

**What was decided.** An Obsidian wiki at `docs/wiki/`, generated by `build/build_wiki.py`: eleven
master topics, 81 pages, every page carrying *what it is*, *how it works in the game*, *the story
behind it*, and a linked *interacts with* section. Modelled on the Europa Universalis 4 wiki at
Aaron's direction. The prose is written by a hired writer working outside this repository.

**The rule F24 set — generated, not hand-written — is kept by dividing the page rather than the
wiki.** Facts live in blocks the generator owns and rewrites on every run; prose lives outside them
and is never touched again. Proved by test: a page edited by hand, then regenerated, kept every word.
No fact is restated in a page — figures are read from `data/parties.json` and the round documents at
run time, and every claim cites the ruling that made it true.

**The alternative rejected: generating the prose as well.** A script can establish that two things
co-occur; it cannot say *why* they connect, and the corpus carries 732 bare "ruling N" citations most
of which are an old ruling quoted inside an argument about something else. A generated why-clause
would have been a citation wearing an explanation's clothes. What is generated instead is the
*candidate edge* — 467 of them — marked unverified, for the writer to keep, rewrite or delete.

**Two things came into the project that were outside it.** The Movement Register's **verbs** and
**adjectives** lived only on a published web page; they are now `build/wiki_movements.json`, read from
that page's live database — Aaron's own markup, not its seed, and six verbs differ between the two.
And the **ten political positions** now have a page each, with every live movement placed on them per
ruling 41's re-map, eight of the placements flagged as authored rather than ruled.

**Where the design and the running game disagree, pages say both.** Sagebrush shows a cap of *0.45
ruled, 0.35 running* and a position of *Anarcho-Capitalism ruled, Republican running*. Aaron's
instruction this session was that merging the two is architecture's job, not ideation's, so the wiki
records the gap rather than resolving it.

**Superseded rulings are classified rather than lumped.** The round documents record replaced,
refined, renamed and confirmed-and-unchanged in the same breath. Presenting all of them as
"superseded" would retire rules that are still live — the worst thing this wiki could publish — so the
generator separates **39 true supersessions** from **18 rulings a later ruling merely amended or
confirmed**, and defaults to the weaker label when the wording is not explicit.

**What this does not answer.** There is still no committed nation roster: the only nation-shaped file
is a turn-4 autosave that is not backed up, so nation pages are keyed on display names. Economy and
Events have no pages, their rounds being open and unrun. Fourteen topic pages will ship with an empty
story section because round 1's break-up narrative is the only sustained fiction in the project.
