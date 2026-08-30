# Rebuild progress

Checklist derived from `docs/REBUILD-PLAN.md`. Tick a task only after it is committed and
verified in the browser (zero console errors, `tests/run.html` green).

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## M0 — Safety net & foundation ✅

- [x] **M0.1** Version control first — `.gitignore` (excludes 376 MB `build/raw/`), `git init`,
      baseline commit, `build/raw/README.md`. `.git` = 1.4 MB.
- [x] **M0.2** `server.py` (stdlib, 127.0.0.1) with GET/PUT/DELETE `/api/state` and
      GET/PUT `/api/content/<name>.json`, atomic writes, traversal-proof names. `launch.json`
      cut to one config. Static responses send `no-store`, retiring the `?v=` cache-busters.
- [x] **M0.3** `js/rng.js` — mulberry32 per named stream, stream seed = hash(runSeed, name).
      All five `Math.random()` sites take an explicit rng. Streams proven independent.
- [x] **M0.4** `js/tunables.js` — 60 named keys with label/group/doc/range; `TUNE.get` records
      every read and `TUNE.trace(fn)` returns a computation's ruleset keys. Behaviour-preserving:
      opening prices still match the review's measured baseline.
- [x] **M0.5** `tests/` + `tests/run.html`. The plan's five invariants plus data-integrity and
      determinism checks. Caught a real defect on first run (tunables handed out arrays by ref).
- [x] **M0.6** Save v2: all 8 stateful modules serialize; v1 refused with a clear message; build
      stamp refuses a cross-build save; load cancels an in-flight action; quota surfaced; primary
      store is the server. Verified: turn 6 -> reload -> load restores everything.
- [x] **M0.7** `Game.batch(fn)` + `{ownership, values, roster}` emit reasons. **One annex = 1
      render**, measured through the real action layer.

## M1 — Correctness patch pass ✅

- [x] **M1.1** Party spawn routes through the Area alias and de-duplicates. Measured 48.2% of
      authored references were hitting a deleted key; now 0 unresolved across all 16 parties.
- [x] **M1.2** CT area-borders drawn from the planning-region geojson, not the obsolete county
      topology. A predicate-only fix suppresses 1 of 8 arcs — proved by overlaying the old mesh.
- [x] **M1.3** Ratio points through a sqrt curve, dice SUMMED and capped, plurality flips,
      partialSubset by contiguity. Real map: 30.8/30.8/38.5 (was 1.5/3.0/95.5).
- [x] **M1.4** Absolute 3-Area budget, priced through `Game.spend`, superlinear occupation cost,
      composite blue shell. Wyoming 27→32 Areas then bankrupt (was 27→1,167 in 9 turns).
- [x] **M1.5** One clock at the round boundary; `growAll` deleted; `ext` grows; real
      `phaseEconomicGrowth`. One round = +1.000% pop, +1.4% GDP, one render.
- [x] **M1.6** Anchor + neighbourhood + noise + a blended growth mix. Spread STABILISES at
      4.78 (t200) / 4.80 (t300) against a floor of 4; was 0.026.
- [x] **M1.7** All three even-spread mutations distribute proportionally; the bleeding bloc is the
      real plurality. California at the 40% cap: 0 Areas zeroed, 100% delivered (was 34/58, 57.3%).
- [ ] **M1.8** Market one-way ratchet; two economies; `DEMAND_SHARE` sums to 0.80.
- [ ] **M1.9** Trade mints GDP from nothing; World market dominates.
- [ ] **M1.10** Implement Release; give Counties mode a purpose.
- [ ] **M1.11** Documentation and dead weight.
- [ ] **M1.12** Performance: the three things that run on mousemove.
- [x] **M1.13** Data pipeline integrity + `build/validate.py`. Split into six sub-tasks:
  - [x] **M1.13a** `build/validate.py`: 13 cross-file checks, wired into the documented build
        order. Reproduces every data finding on the shipped data, including the 48.2% figure.
  - [x] **M1.13b** `build_areas.py` deterministic (five runs under different `PYTHONHASHSEED`
        are byte-identical) + `MAX_MEMBERS` cap. **Not re-baked** — see D36.
  - [x] **M1.13c** Hawaii's islands linked (`MARITIME_COUNTY_LINKS`), Valdez-Cordova folded onto
        the legacy FIPS the game data uses. 0 isolated Areas, Cordova's port visible.
  - [x] **M1.13d** `build_neighbors.py --force`; `rail_counties()` cached to `build/raw/`.
  - [x] **M1.13e** `build/requirements.txt` + `build/README.md` with the DAG and run order.
  - [x] **M1.13f** Eight new authored movements. Every state now has a homeland; uncovered Areas
        348 → 278, states with no coverage 5 → 0.

## M2 — Model rewrite

- [x] **M2.1** `game_state.py` deleted. Its one worthwhile algorithm — the exact-sum
      shares→counts absorption — is `js/counts.js`, used by `Game.init`, with 12 tests. Measured:
      the float split it replaces is inexact for 986 of 3,143 counties (31.4%).
- [x] **M2.2** Six symmetric ideologies on two axes; `lean` deleted from the model API.
      `js/ideology.js` + `content/ideologies.json`; one function (`affinity`) now answers what
      `x.lean === y.lean` answered in four places across eight files. Area politics is `pop[6]`
      counts; movements are a slice of their own ideology, not a seventh bucket. Measured: world
      population still exactly 340,110,988 at load; red+blue 96.0% before movement seeding; all
      1,676 Areas tagged with one of 20 cultural regions; 229 tests green.
- [ ] **M2.3** Columnar state (typed arrays); ownership stored once. Split, because the two halves
      are independent and each ships playable on its own:
  - [x] **M2.3a** `js/state.js`: the columnar store + a field REGISTRY, so `clone()` is one
        `.slice()` per array and no phase can add a field that `serialize` silently drops.
        `Game.county[f]` is a live view over the columns, so no caller changed. Measured: the whole
        country is 173 KB in four columns, a full-state `clone()` is 0.068 ms, and the test suite
        (which boots the world ~270 times) fell from 41.4s to 27.6s. Float64 not Float32 (D51).
  - [x] **M2.3c** `advanceTurn` snapshots the store; all six phases are integer loops over the
        graph's node numbering. Measured: drift 8.0 -> 2.0 ms, all phases 12.4 -> 2.8 ms,
        `advanceTurn` 24.7 -> 9.3 ms, a 50-turn sim run 1,237 -> 466 ms, the suite 41.4 -> 10.5 s.
        The snapshot itself was never the cost (D56); the string-keyed neighbour walk was. Fixed a
        latent movement-rescale bug the rewrite exposed (D57).
  - [x] **M2.3b** Ownership stored once: `state.owner` (Int16Array of nation index) is the truth and
        `nation.counties` is a derived Set refilled on an ownership epoch (D54). `moveCounties` went
        from three writes per Area to one. Two tie-breaks made canonical on the way (D55).
- [x] **M2.4** CSR adjacency graph, built once (`js/graph.js`), done BEFORE M2.3 because it builds
      the `fips -> int` Area index the columnar arrays need (D46). 1,676 nodes / 9,454 directed
      edges / 43.5 KB of flat Int32Array; a full graph sweep is 7.7x faster than the already-memoized
      string path it replaces (0.042 ms vs 0.325 ms). Found and fixed five missing road bridges
      (D49): Michigan, New York, Rhode Island and Virginia all started in two disconnected pieces.
- [x] **M2.5** One state document (`data/state.json`); editor round-trip via the server.
  - [x] **M2.5a** `js/statedoc.js` — assemble/validate/applyModel, DOM-free, so the suite runs the
        REAL load path instead of the hand-written copy it had been testing (D58). `data/state.json`
        is autosaved every world turn and resumed at boot (D59); the round-trip test now goes
        through the actual HTTP endpoint. Verified live: 3 turns, reload, world came back identical.
  - [x] **M2.5b** The editor writes map modes through `PUT /api/content/<name>.json` (download kept
        only as the offline fallback) and gains the import path it never had (D61). The two authored
        map modes moved out of `data/` — bake output — into `content/` (D60). Verified through the
        real UI: Open published -> Cultural (1,676 unassigned -> 0), add a region, Publish, and the
        file came back with the new region and all 1,676 assignments. Fixed a top-level global read
        in `editor.js` that made it undefinable outside `index.html` (D62).

## M3 — Power

- [ ] **M3.1** `js/power.js` Why-record convention + Authority.
- [ ] **M3.2** Influence.
- [ ] **M3.3** QoL (food/health as needs) + Civil Liberties.
- [ ] **M3.4** Nation history (`founded`, `annexed[]`, `lost[]`), `gov.rulingIdeology`, caching.

## M4 — West vertical slice

- [ ] **M4.1** `js/movements.js`.
- [ ] **M4.2** `phaseSentiment` with all six factors.
- [ ] **M4.3** Two-tier secession (+ `MIN_NATION` re-derivation, `exclude` fix).
- [ ] **M4.4** The two cheapest release valves.
- [ ] **M4.5** Sentiment-scaled occupation cost.

## M5 — Instrumentation

- [ ] **M5.1** The event ledger.
- [ ] **M5.2** Developer dashboard.
- [ ] **M5.3** 50-turn step-through simulator.
- [ ] **M5.4** Player-facing explanation (clocks, newspaper, Pressure mode, fog).

## M6 — Agency

- [ ] **M6.1** Split every action into `plan` and `resolve`.
- [ ] **M6.2** Player identity.
- [ ] **M6.3** AI.
- [ ] **M6.4** Faction selection and win conditions.
- [ ] **M6.5** Faction-switch, military, remaining valves.

## M7 — Depth and widen

- [ ] **M7.1** Relations as one append-only structure.
- [ ] **M7.2** Coalitions replacing the blue shell.
- [ ] **M7.3** War weariness.
- [ ] **M7.4** Events and crises.
- [ ] **M7.5** Leaders with light traits.
- [ ] **M7.6** Map-history timeline.
- [ ] **M7.7** Names and flags for new nations.
- [ ] **M7.8** Recognition / legitimacy.
- [ ] **M7.9** Migration.
- [ ] **M7.10** Elections.
- [ ] **M7.11** Projection range off the transport network.
- [ ] **M7.12** Widen east.

---

## Resume notes

*(Updated as work proceeds — what is done, what is next, what was learned that is not yet
written down elsewhere.)*

**M0, M1 and M2 complete.** 301 tests green at `tests/run.html` in ~17s (41s before the columnar
conversion), `build/validate.py` reports 0 errors, and the game loads, plays and saves with a clean
console. `DESIGN.md` rewritten at the M2 close to describe the game as it actually is.

Verified end to end at the M2 close: fresh boot -> world turns driven through the real Pass button
-> autosave to `data/state.json` -> reload the page -> resumed at the same turn, population, seed
and borders -> map editor -> Open published -> Cultural (1,676 unassigned becomes 0 assigned) ->
add a region -> Publish -> `content/cultural.json` came back with the new region and all 1,676
assignments, with no download anywhere in the loop.

Performance, measured on the real map rather than predicted: a world turn 24.7 -> 9.3 ms, the six
phases 12.4 -> 2.8 ms, political drift 8.0 -> 2.0 ms, a 50-turn simulator run 1,237 -> 466 ms. The
columnar store is 173 KB and the adjacency graph 43.5 KB.

Next: **M3.1** (`js/power.js`: the Why-record convention, then Authority).

Open, carried into M2.3: after 21 turns no Area is yet LED by a minority ideology (Rep 1,288 /
Dem 388 of 1,676). That is the expected shape at 11% organised movements and it is M5's dial to
turn, not a bug -- but it is the number to watch when the simulator lands, because a map where the
four minority ideologies can never take an Area is a map with two ideologies and four decorations.

Learned along the way, not written elsewhere:
- The in-app browser serves a cached document on a same-URL `navigate`. Add a throwaway query
  string (`?x=7`) when reloading after an edit, or you will verify the previous build.
- `read_console_messages` keeps a buffer across navigations; open a fresh tab for a clean read.
- The browser also replayed a **pre-M0.2 HTTP cache entry** for `data/*.json` for hours after a
  re-bake. `getJSON` now passes `cache: 'no-store'`; if a data change seems not to land, that is why.
- `TUNE.trace(fn)` already gives M5's "show your work" data for free - one world turn reads 13 keys.
- `window.__renderCount()` / `__resetRenderCount()` in app.js are the M0.7 instrument; keep them.
- `Game.epoch()` is the invalidation key for caches that are valid between mutations (M1.12).
- Editing JS from Python: write the script to a FILE rather than `python - <<'PY'`, and use raw
  strings. A literal `\u{1F69B}` inside a normal Python string is a syntax error, and the JS source
  contains real emoji, so anchor replacements on lines that do not carry them.
- The test suite takes ~28s, dominated by the drift and market suites running 200-300 world turns.
  That IS the M1.6 and M1.8 acceptance criteria; M2.3's columnar state makes it fast.

Learned along the way, not written elsewhere:
- The in-app browser serves a cached document on a same-URL `navigate`. Add a throwaway query
  string (`?x=7`) when reloading after an edit, or you will verify the previous build.
- `read_console_messages` keeps a buffer across navigations; open a fresh tab for a clean read.
- `TUNE.trace(fn)` already gives M5's "show your work" data for free — one world turn reads 13 keys.
- `window.__renderCount()` / `__resetRenderCount()` in app.js are the M0.7 instrument; keep them.
