# Nation States — Rebuild Plan

**Paste this whole file into a new Claude Code chat in `C:\Users\aaron\Nation States` and work
through it in order.** Every milestone ends with a working game. Nothing here is optional
sequencing advice — the dependency order is real, and doing M2 before M0 means writing M2 twice.

Companion documents in this repo:
- `DESIGN.md` — what the game is today (accurate as of 2026-08-29, with the corrections in M1.11)
- `docs/CODE-REVIEW-FINDINGS.md` — 152 verified findings with evidence, line numbers and fixes.
  **Every task below that says "see finding `x`" refers to a section in that file. Read it before
  writing the fix.**

---

## 0. Read this first (context for the assistant)

### What exists

A browser strategy game. All 51 US states start as nations on a real-data county map.
~3,000 lines of vanilla JS in 13 IIFE globals loaded by `<script>` tags, d3 + topojson vendored in
`lib/`, all geography baked offline by Python scripts in `build/` into `data/*.json`.
`game_state.py` is an abandoned partial Python mirror of the model.

Run it with `python -m http.server 8000` from the repo root.

**What is genuinely good and must be preserved:** the whole `data/` + `build/` foundation (real
Census/BEA/election data, county adjacency, ports, navigable rivers, rail, interstates, choke
points, the 3-tier map-mode editor output); the d3 map setup in `app.js:90-165`; the editor's
tree/painting UX; the CSS; the panel and leaderboard layout; and the *math* in `civilwar.js` and
the world phases. The formulas are reasonable. The vocabulary and the global state they are
written against are not.

### Where it is going

A grand-strategy game about the fragmentation and re-formation of the United States. County-level
secessionist **sentiment** driven by six factors; two independent power axes (**Authority** =
hard power, **Influence** = soft power); Quality of Life decoupled from GDP; six symmetric
ideologies on two axes; ~22 playable factions built from **movements** (ideology + homeland);
two-tier secession (continuous county defection, discrete movement breakaway); five release
valves; anti-snowball coalitions; occupation cost; war weariness; narrative events; a
player-facing "why did this happen?" layer; a developer dashboard with a 50-turn step-through
simulator; and a single source-of-truth JSON that the editor, the game and tooling all read and
write in place.

### The verdict from the review

**Rearchitect the core (~1,200 lines of model code); keep the shell.** Four facts force it:

1. `lean: dem >= gop ? 'D' : 'R'` (`game.js:87,110`) is a **binary enum used as a control-flow
   key** by four separate game decisions across 8 files. Six symmetric ideologies is not a
   find-and-replace; it is a different function with a threshold everywhere that `===` appears.
2. `const names = Object.keys(s.ext); if (!names.length) continue;` (`world.js:96`) — **an
   emergent movement can never appear in an area that did not spawn one.** Movements spreading is
   the central mechanic of the target design and it is structurally impossible today.
3. `Actions` exports `{ isActive, start, onHover, onClick, cancel }` (`actions.js:641`). **Every
   action outcome is computed inside a DOM `onclick` closure and returns nothing.** AI, tests,
   replay and the explanation layer all have nowhere to attach.
4. `function emit() { listeners.forEach(f => f()); }` (`game.js:209`) triggers a **full map
   repaint plus a full national border re-mesh on every single mutation.** One annex costs 5
   leaderboard rebuilds and 5 whole-topology merges. 51 AI nations acting per turn does that
   ~100+ times a round.

### Language decision — settled, do not relitigate

**JavaScript owns the rules. Python owns the server and the offline bakes. `game_state.py` gets
deleted.**

Reasoning: the JS model is the real, working game; Python is a divergent second implementation of
it and is the exact failure mode to avoid. But the target design's "one JSON the editor, the game
and tooling all read and write in place" is **impossible in a static page** — browsers cannot
write files — so a local process must own the state file. That process is Python, because the
project already launches with `python -m http.server` and Python 3.13 is installed here.
Node.js is **not** installed; the dev dashboard and the 50-turn simulator therefore run as browser
pages (d3 is already vendored), and the test harness is written as plain ESM so it runs in a
browser today and in Node later without changes.

---

## Milestone map

| | Milestone | Size | Ships |
|---|---|---|---|
| **M0** | Safety net & foundation | S–M | nothing visible; everything after depends on it |
| **M1** | Correctness patch pass | M | the current game, but honest and not exploitable |
| **M2** | Model rewrite: six ideologies, columnar state, one state document | L | same game on the new model |
| **M3** | Power: Authority, Influence, QoL, Civil Liberties | M | four new nation stats with why-traces |
| **M4** | West vertical slice: sentiment, movements, secession, valves | L | **the actual game, on one region** |
| **M5** | Instrumentation: dashboard, simulator, explanation layer | M | the tools to tune M4 |
| **M6** | Agency: plan/resolve, AI, player seat, factions, win conditions | XL | a game you can win and lose |
| **M7** | Depth & widen: relations, coalitions, events, leaders, timeline, East | L | the full design |

---

# M0 — Safety net & foundation

*Nothing user-visible. Do all of it before touching anything else.*

### M0.1 — Version control, first, before any other change

The project is not a git repo, has no `.gitignore`, and carries **395 MB of raw download caches**
inside the source tree (`build/raw/transport/` 279 MB, `build/raw/trade/` 80 MB,
`build/raw/CAGDP2.zip` 15 MB). A naive `git init && git add .` commits all of it permanently.

1. Write `.gitignore` **first**:
   ```
   build/raw/
   __pycache__/
   *.pyc
   .claude/scheduled_tasks.lock
   data/state.json
   ```
2. `git init && git add . && git commit -m "Baseline before rebuild"`
3. Write `build/raw/README.md` listing each raw artifact, its source URL and its size, and stating
   that it is a regenerable cache. The download URLs already exist verbatim in
   `.claude/settings.local.json` — lift them from there.

**Acceptance:** `git status` clean; `du -sh .git` well under 10 MB.

> This is the highest-priority task in the document. Every remaining milestone is a rewrite of
> something, and right now there is no way to branch, diff, revert or bisect any of it.

### M0.2 — Write-capable local server

Create `server.py` (Python stdlib `http.server` only, no pip installs). It must:
- serve the repo as static files exactly as `python -m http.server` does today;
- `GET  /api/state` → the contents of `data/state.json` (404 if absent);
- `PUT  /api/state` → atomically write the posted JSON to `data/state.json`
  (write to `data/state.json.tmp`, then `os.replace`);
- `PUT  /api/content/<name>.json` → atomically write into `content/`, with `<name>` validated
  against `^[a-z0-9-]+$` so path traversal is impossible;
- bind to `127.0.0.1` only.

Update `.claude/launch.json`: point the `nation-states` config at `server.py`, and **delete the
two foreign configs** (`resume-engine-ui`, `archive-log-preview`) — they belong to other projects
and one of them points at a temp directory that no longer exists.

**Acceptance:** `python server.py`, then in the browser console
`await fetch('/api/state',{method:'PUT',body:'{"hello":1}'})` creates `data/state.json`.

### M0.3 — Seeded RNG

Create `js/rng.js` exporting a seeded PRNG (mulberry32 is fine) with **named streams**:

```js
const rng = RNG.create(seed);
rng.stream('combat').roll(6);
rng.stream('spawn').random();
```

Named streams matter: adding a die roll to combat must not reshuffle party spawns.

Replace all five bare `Math.random()` sites — `parties.js:59`, `parties.js:69`, `civilwar.js:19`,
`turns.js:21`, `actions.js:120` — with an explicitly-passed rng. **Never a module global.**
Serialize `seed` and each stream's counter in the save.

**Acceptance:** same seed + same action sequence ⇒ identical outcome, twice, verified by a test.

### M0.4 — One tunables object

Create `js/tunables.js` exporting a single mutable `TUNE` object holding every constant now buried
in five files: `world.js:18-20` (PARTY_CEILING/STEP/FLOOR), `game.js:26-28` (TAX_RATE, GOV_TYPES,
AREA_UPKEEP), `game.js:240` (MIN_NATION), `game.js:271,282` (civil-war loss percentages),
`civilwar.js:52` (the 33/66 outcome bands), `market.js:15` (BASE, ELASTICITY, MIN_P, MAX_P),
`actions.js:184-192` (TRADE_GAIN, TRANSIT_TOLL, RAIL_DISCOUNT, HIGHWAY_DISCOUNT, NEED_SCALE,
COUNTER_FLOOR), and `app.js:630` (DEMAND_SHARE — note this is a *simulation* constant currently
declared inside the *rendering* file and read by `market.js`; that is a live load-order hazard).

Every read goes through one accessor, e.g. `TUNE.get('sentiment.w_qol')`, which records the key it
served. That recording is what makes the "show your work" panel free in M5 rather than a second
implementation.

**Acceptance:** `grep -rn "0\.02\|0\.35\|40e6\|1\.3" js/` returns no magic numbers in model code.

### M0.5 — Test harness

Create `tests/` with plain ESM modules and a `tests/run.html` page that executes them and prints
pass/fail. Write it so the same files run under `node --test` later with no changes.

Seed it with the invariants that already matter:
- every county's party counts sum exactly to its population;
- `sum(nation.pop for all nations) == sum(county.pop for all counties)`;
- ownership is consistent: `owner` map and `nation.counties` sets agree;
- a save/load round-trip reproduces the state exactly;
- same seed ⇒ same 10-turn outcome.

**Acceptance:** `http://localhost:8000/tests/run.html` shows all green.

### M0.6 — Fix the live save/load bugs

The save snapshot (`saves.js:9`) is `{v, ts, game, turns, colorMode}` and omits:
`World.turn` (world.js:15), `Colors.gen` (colors.js:28), `Parties.spawned` (parties.js:14),
`Market.prices`/`prev`/`perCap` (market.js:16), and the RNG state from M0.3.
Add all of them, bump the save version to `2`, and have `SaveManager.apply` refuse a `v:1` save
with a clear message rather than loading it half-initialised.

Also: **guard load against an in-flight action.** Loading while an Action or the Editor is open
permanently soft-locks the game (`saves.js:16-26` vs `actions.js:11-13`). Call `Actions.cancel()`
and `Editor.exit()` before applying.

Also: `localStorage.setItem` (`saves.js:13`) has no quota handling and a save is ~525 KB against a
~5 MB budget. Wrap it in try/catch and surface the failure. Better: once M0.2 exists, save through
`PUT /api/state` and keep localStorage as a fallback.

**Acceptance:** save → reload the page → load ⇒ world turn, prices, party roster and colours all
survive; the test from M0.5 passes.

### M0.7 — Stop the per-mutation full repaint

`Game.emit()` (`game.js:209`) carries no payload and fires from `moveCounties`, `createNation`,
`breakApart`, `applyCivilWarCost`, `growAll`, `boostGdp` and `spend`. One annex triggers 2 emits
which cascade into 5 leaderboard rebuilds, 5 whole-topology `topojson.merge` calls, 3 full recolors
and 4 panel rebuilds.

Add `Game.batch(fn)` that suppresses `emit` until `fn` returns, then emits once. Wrap every
multi-step mutation (`breakApart`, `confirmAnnex`, `confirmUniteAttempt`, `advanceTurn`'s
writeback) in it.

**Acceptance:** instrument `onGameChange` with a counter; one annex causes exactly 1 call.

---

# M1 — Correctness patch pass

*The current game, made honest. Each of these is independently shippable.*

### M1.1 — 48% of emergent parties silently fail to spawn — **fix first**

`Parties.setup` (`parties.js:63-65`) does `const c = Game.county[f]; if (!c) continue;` keyed by
**raw county FIPS**. But `Game.init` (`game.js:51-64`) *deletes* the 1,467 member counties merged
into Areas. Measured: **2,025 of 4,198 party-county references (48.2%) hit a deleted key and
silently no-op.** El Paso United loses 83% of its footprint, Libertarians 79%, The Farmers Union
71%, A Free Texas 59%, New Confederacy 53%.

Fix: route the lookup through the Area alias — `const c = Game.area(f)` — and de-duplicate, since
several member counties now map to the same Area. Then add a build-time validator (M1.13).

**Acceptance:** a test asserting 0 unresolvable FIPS in `data/parties.json`.

### M1.2 — Connecticut renders with the wrong internal borders on first load

`app.js:138-140` meshes the raw topology keyed on `Game.areaIdOf`, which knows nothing about the
CT planning regions. `data/counties-10m.json` still contains the 8 obsolete CT counties;
`data/game-data.json` contains only the 9 planning regions; `data/areas.json` has no `09*` entries.
So every old-CT pair differs and an arc is drawn — eight boundaries that do not follow the nine
coloured fills, visible with zero clicks, in the one place the project worked hardest to get right.

Fix: hoist the CT normalisation out of `meshOwner` into one helper and route all three layers
through it:
```js
const baseGeomToArea = (id) => Game.areaIdOf(OLD_CT_TO_REGION[id] || id);
```
Use it in the area-border mesh, the nation mesh and `nationOutline`.

### M1.3 — Civil war is a step function, not a dice game

Two separate defects that together make the middle outcome unreachable:

- `points()` (`civilwar.js:37-39`) is `round(pop/1e6) + round(gdp/1e10)`. The **median Area** is
  88,948 people and $4.93B GDP ⇒ **0 points** ⇒ `score = 0` ⇒ auto-victory even when triggered.
- `diceCount()` (`civilwar.js:34`) is uncapped and the dice are **multiplied**
  (`civilwar.js:49`). A real party flip yields 4–10 dice; at 10 dice the median product is
  3.5¹⁰ ≈ 2.8×10⁵, so a 223-point war scores ~6×10⁷ — six orders of magnitude past the 67
  threshold. Even the minimum possible product still lands in `fall_apart`. Measured outcome
  table: (3 pts, 5 dice) = 1.5% victory / 3.0% partial / 95.5% fall apart.

Also: `50 - oldMajorityShareAfter` conflates "below 50%" with "lost the majority". Once emergent
parties exist (up to 20% at spawn, growing toward 35%), D and R both sit far below 50 and a
1-point flip yields 10–15 dice.

Fix: (a) use continuous point values, not rounded ones, or scale so a median Area is ~1 point;
(b) cap `dc`; (c) **replace the product with a sum of dice, or one roll modified by `dc`**, so
score grows linearly not exponentially; (d) compute flip magnitude as distance from *plurality*
(`oldMajorityShare - max(otherShares)`), not from 50.

**Acceptance:** a test sweeping realistic annexations produces a spread across all three outcomes.

### M1.4 — Annexation is free and the map falls in under 10 turns

`confirmAnnex` (`actions.js:550-595`) debits nothing: no treasury, no population, no cooldown, no
per-turn limit, no war weariness. The selection cap is `capFactor * A.before.pop` — **a multiple of
your own size** (`actions.js:504`), so a greedy "take the largest set that stays under the trigger"
play doubles a nation every turn. Simulated from turn 0: Wyoming reaches 1,167 of 1,676 Areas in
9 turns; California takes 3. No civil war triggers on that path. There is no reason to ever pick
another action.

Fix: make the cap **absolute, not relative** — a per-turn annex budget in Areas (1–3) or in
military/treasury points that `Game.spend()` actually debits (`Game.spend` is exported at
`game.js:381` and has **zero call sites** — no action in the game costs anything). Add occupation
upkeep so held territory keeps costing. Trigger the civil-war check on the ratio of *what you took
this turn* to what you already held.

### M1.5 — One growth clock

There are two unrelated growth models on two independent clocks:
- `Game.growAll(0.05)` (`app.js:512`) — 5%/round at the player-turn round boundary, grows GDP too;
- `World.phasePopulationGrowth(1%)` (`world.js:66-88`) — only when a human clicks **Advance world**
  (`app.js:503` is its *only* call site), and it does **not** grow GDP at all.

So a player who never notices the button plays a game where nothing in `world.js` ever runs; a
player who does can click it 200 times during Alabama's turn.

Fix: call `World.advanceTurn()` from inside `completeTurn()` exactly where `growAll` is today,
delete `growAll`, and demote the button to a dev-only control behind a flag (it becomes the
step-through control in M5). Guard it on `Actions.isActive()`.

While in `phasePopulationGrowth`: **it ignores `ext` entirely** (`world.js:73,83`) — emergent-party
members never reproduce, so realised growth is 0.93%/turn not 1%, and every movement is diluted
toward an equilibrium of 0.278 instead of the declared ceiling of 0.35. Include `ext` in both the
nation totals and the county growth base. And add a `phaseEconomicGrowth` that actually writes
`nxt[f].gdp` — GDP is currently copied into `snap`/`nxt` and written straight back unmodified
(`world.js:144,145,154`), while the comment on line 156 claims otherwise.

### M1.6 — Counties converge to a single political mix

`phasePoliticalDrift` pulls each county toward its owner nation's lean, and `phasePopulationGrowth`
adds new residents in that same nation mix. Both pull toward the same attractor and nothing pushes
back. Measured per-turn deviation multiplier ≈ 0.9703, **half-life 23 turns**: population-weighted
within-nation stdev of dem% goes 12.5 → 2.5 by turn 50; nations where every county carries the same
lean letter goes 10/51 → 35/51 by turn 50.

Since factor #1 of the target sentiment model is "county party majority", this degenerates the
county grid into a nation-level scalar.

Fix: give the fixed point a counter-force.
(a) make the drift target a **local blend** — e.g. 50% owner-nation lean + 50% population-weighted
mean of `Game.countyNeighbors(f)` read from `snap` — so gradients survive;
(b) add a per-county structural anchor (urban/rural, or the culture region from
`data/cultural.mapmode.json`) that the county drifts toward and the nation can only partly
override;
(c) add bounded noise or migration so deviation has non-zero stationary variance.

**Acceptance:** a test asserting median within-nation stdev of the dominant-ideology share stays
above a floor (≥4 points) at turn 200.

### M1.7 — Even-spread mutations flatten the map

Three functions distribute a total evenly across a nation's Areas, which destroys the geography
every map mode and the market depend on:
- `Game.boostGdp` (`game.js:328-334`) — `per = amount / counties.size`, called on every trade;
- the civil-war GDP transfer (`game.js:284-287`);
- `applyCivilWarCost`'s population loss (`game.js:271-276`) — a flat per-Area subtraction that
  **clamps at zero**, so it wipes the ruling party out of hundreds of small Areas and delivers only
  ~57% of the intended loss.

Fix all three to distribute **proportionally to each Area's existing share**, not evenly.

### M1.8 — The market is a one-way ratchet, and there are two economies

`Market.update` (`market.js:31`) calibrates `perCap` once and never again; demand tracks live
population while supply tracks GDP that (per M1.5) never changes. Net: every price drifts up
1.302%/turn forever and pins at the 400 clamp around turn ~105. Relative prices never change,
because the sector mix is fixed.

Separately, `Market.nationSurplus` (`market.js:58-69`) reads the **baked** `a.v` values while
`Market.update` scales by **live** GDP — two economies that never reconcile, so tradeable volume is
constant for the entire game.

Also: `DEMAND_SHARE` sums to **0.80**, so global demand is 80% of global supply and the UI's
"100 = balanced" label is wrong (balanced is `100 × 0.8^1.3 = 75`).

Fix: recalibrate `perCap` against live GDP each turn (or normalise demand to total supply); make
`nationSurplus` scale by live GDP the same way `update` does; and either make `DEMAND_SHARE` sum to
1.0 or relabel the index honestly.

### M1.9 — Trade mints GDP from nothing, and "World market" dominates

`confirmTrade` / `renderExternalPreview` / the transit `finalize` all call `Game.boostGdp(...)` on
both sides with no cost, no cooldown, no capacity, no depletion. The **World market** option
strictly dominates bilateral trade by 1.7×–50×, making the headline trade feature dead content.
And trade income goes to **GDP**, never to the treasury — while 11 of 51 nations run a permanent
structural deficit from turn 1 because of the flat `$40M`-per-Area upkeep.

Fix: route trade income to the **treasury**, not to GDP; cap tradeable volume by port/rail capacity
(the data is already baked); add a per-turn cooldown per partner; and re-price the World market
option so bilateral deals are competitive.

### M1.10 — Implement Release, and give Counties mode a purpose

Half the primary select toggle is a read-only inspector (`renderCountyPanel`, `app.js:581-611`,
emits no buttons at all) and the Release action is a permanently disabled stub
(`actions.js:618-625`). Release is also the target design's first release valve.

It reuses the annex machinery almost verbatim — `recomputeAnnexSelectable` inverted to your own
Areas — and terminates in `Game.breakApart(chosen, {exclude: nid})`, which already exists and
works. Implement it. Delete the dead `.actions-stub` ruleset from `css/style.css:242-248`.

### M1.11 — Documentation and dead weight

- `README.md` is a full feature-era stale — and it is the file the app's own failure message points
  users at (`app.js:83`). Rewrite it or make it a pointer to `DESIGN.md`.
- `DESIGN.md` lists three actions and omits **Trade**, which is implemented and is currently the
  strongest action in the game. Fix that, and fix the `world.js:12` docstring that says
  "The phases are stubs for now" directly above 130 lines implementing them.
- Delete `archive-log-builder.html` — it is a 33 KB Final Cut Pro XML tool, referenced by nothing.
- Delete `__pycache__/` and `build/__pycache__/`.
- Delete `game_state.py` (see M2.1) once M2 lands; until then mark it clearly as dead.

### M1.12 — Performance: the three things that run on mousemove

- `areaFeature()` (`app.js:371-376`) runs `topojson.merge` over all 3,231 county geometries on
  **every mousemove** for the 483 merged Areas. Cache it, keyed by area id.
- `onHover` is bound to `mousemove` with no same-target guard (`app.js:132`). Add one.
- `Editor.onHover` at State granularity does a 1,676-key scan plus up to 33 `topojson.merge` calls
  per mousemove (`editor.js:50-55,92-95`). Precompute state→areas once.

Also: `redrawBorders()` re-meshes the entire topology on every model change (`app.js:181-186`), and
3,232 `<path>` elements are rendered for 1,676 atomic Areas. Fold both into the M0.7 batching, and
consider rendering one path per Area.

### M1.13 — Data pipeline integrity

- `build_areas.py:92-104` is **non-deterministic**: a set-iteration tie-break changes Area IDs
  across runs on identical inputs. Sort the candidate set before choosing.
- Merging into the *smallest* neighbour chains tiny counties into 22-county blobs with no
  geographic size cap. Add one.
- Hawaii's three main islands have **no entry at all** in `adjacency.json`, making Hawaii
  mechanically inert. Watonwan County MN (`27165`) has zero neighbours because its block is missing
  from the raw file. Valdez-Cordova AK is keyed as the obsolete `02261` in `game-data.json` but as
  successors `02063`/`02066` in `county_trade.json`, so its port is invisible.
- `build_neighbors.py:34-49` is a **no-op once its output exists** — updating the raw file cannot
  regenerate it. Add a `--force` flag.
- `county_neighbors.json` is built from a **pre-2015** Census adjacency file: obsolete CT counties,
  no planning regions, 11 phantom FIPS.
- `build_trade.py` and `build_transport.py` **fetch live endpoints at build time**;
  `rail_counties()` has no cache at all. Cache to `build/raw/`.
- 350 Areas — including all of Alaska, Colorado, New Mexico, Arizona and Hawaii — can never receive
  an emergent party.
- No `requirements.txt`, no documented dependency list (some builds need geopandas/shapely), and no
  documented build order for a pipeline that has a real DAG.

**Add `build/validate.py`** that runs after every bake and asserts cross-file key consistency:
every key in `parties.json`, `economy.json`, `county_trade.json`, `transport.json`,
`*.mapmode.json` resolves to a live Area or a real member county. Wire it into the build order.
This is the check that would have caught M1.1 at build time.

---

# M2 — Model rewrite

*Same game, new model. This is the milestone that unblocks everything after it.*

### M2.1 — Delete `game_state.py`

It implements a **materially different simulation** from `js/world.js` (different drift
denominator, different growth base, different atomic unit — it never applies `areas.json`, so it
models 3,143 units against the JS model's 1,676) and cannot validate the JS engine. Port anything
worth keeping (the exact-sum `_counts_from_percentages` drift absorption is worth keeping) into the
JS model and the M0.5 test suite, then delete the file and its `__pycache__`.

### M2.2 — Six symmetric ideologies on two axes

Create `content/ideologies.json`:

```json
{ "axes": ["economic", "social"],
  "ideologies": [
    {"id":"red",    "name":"Republican",              "economic": 0.6, "social": 0.2, "color":"#e0483b"},
    {"id":"blue",   "name":"Democrat",                "economic": 0.3, "social":-0.4, "color":"#3b6fe0"},
    {"id":"green",  "name":"Democratic Socialist",    "economic":-0.6, "social":-0.7, "color":"#33a852"},
    {"id":"yellow", "name":"Conservative Nationalist","economic": 0.5, "social": 0.7, "color":"#e3c229"},
    {"id":"orange", "name":"Distributist",            "economic":-0.4, "social": 0.6, "color":"#e8862d"},
    {"id":"purple", "name":"Socialist",               "economic":-0.8, "social":-0.2, "color":"#8a5cf5"}
  ]}
```

**One function drives everything downstream:**
```js
affinity(a, b) = 1 - distance(a, b) / MAX_DISTANCE   // 0..1
```
Coalitions, drift attraction, liberty satisfaction, trade alignment, defection targets and AI
diplomacy all derive from it. This is what makes six ideologies cost two numbers each instead of
fifteen hand-authored compatibility pairs. Shared economic axis ⇒ trade alignment; shared social
axis ⇒ moral alignment.

**Delete `lean` from the model API.** Replace with `ideologyMix(scope) -> Float32Array[6]`,
`dominant(scope) -> ideologyId`, `distance(a,b) -> number`. Then:
- `x.lean === y.lean` becomes `distance(x,y) < TUNE.affinityThreshold`
- `dem - gop` becomes a position on the plane
- `Parties.blocs` and the hard-coded `PARTY_GROUP`/`GROUP_COLORS` dicts die — coalition membership
  becomes proximity on the axes. (Today those dicts cover **6 of 16** baked parties; the other 10
  all collapse to "yellow" and get reported as one pooled coalition.)

Sites to change (~26 across 8 files): `game.js:87,110,265-277,293-311`; all of `civilwar.js`;
`actions.js:104,466,599`; `world.js` phases; `mapmodes.js:91-97` and its legend;
`leaderboard.js:13,17,25`; `parties.js:44`.

Two bugs this fixes on the way: `applyCivilWarCost` picks the bleeding party as
`const rulingDem = d >= g` (`game.js:271`) so a nation whose actual majority is an emergent
movement bleeds the wrong population and a movement can never take casualties; and
`demographics.lean` ignores `ext` entirely (`game.js:102-110`), so a nation that is 40% Deseret /
31% R / 29% D reports its lean as a minority party.

Map the existing D/R/Other data into the six at load: 2024 R → red, D → blue, Other → split across
the remaining four by region, or start them at zero and let movements introduce them.

### M2.3 — Columnar state

The current record is `{name, st, demPop, gopPop, othPop, ext:{}, gdp, attrs:{}}` (`game.js:38-47`)
with a hand-enumerated copy path in `serialize` (`game.js:347`) and another in `advanceTurn`'s
writeback (`world.js:152-155`). Any new field added by a phase is **silently dropped** by both.

The target model needs, per Area: 6 ideology counts, gdp, food, health, IT, positive/negative
liberty, owner, homeland, occupied flag, garrison, and a **sentiment value per movement**
(1,676 × ~22 = 36,872 values). As objects that is ~117k property writes per turn before any math —
and the M5 dashboard re-runs 50 turns on every slider drag.

Build an area index once at load (`fips -> int`), then hold typed arrays:
```
Float32Array pop[6]      per ideology
Float32Array gdp, food, health, it, libPos, libNeg
Int16Array   owner, homeland
Uint8Array   occupied
Float32Array sentiment   length nAreas * nMovements
```
`next = state.clone()` becomes one `.slice()` per array. Every phase becomes an index loop with
zero allocation. Materialise a thin `Area` view object on demand for the info panel only.

**Store ownership in exactly one place.** Today it is stored twice — `owner: Map<fips,nid>` and
`nation.counties: Set<fips>` (`game.js:16,67`) — hand-synced in `moveCounties` and `loadState`.
Keep the array; make `nation.counties` a derived index rebuilt when ownership changes.

### M2.4 — CSR adjacency graph, built once

`countyNeighbors` (`game.js:116-125`) re-derives the Area adjacency graph with fresh Set
allocations on **every single query**, and it is the hot loop for every target system (neighbour
pull, diffusion, contiguity, projection range). Build a compressed-sparse-row graph once at load
and keep the existing function signature so nothing else has to change yet.

### M2.5 — One state document

Promote `Game`'s closure variables into an explicit `state` object, loaded from and written back to
`data/state.json` through the M0.2 server:

```
state = { meta:{version, seed, turn}, tune, ideologies, movements,
          areas: <columnar arrays>,
          nations: { id -> {name, color, founded, gov:{type, rulingIdeology},
                            treasury, authority, influence, qol, liberties,
                            weariness, military, leader, annexed[], lost[]} },
          relations: [], history: [], player: nationId }
```

Authored world data currently lives in **four disjoint stores**, one of which is the user's
Downloads folder (the editor's `publish()` at `editor.js:101-112` triggers a browser download that
must be hand-copied into `data/`). Consolidate: the editor writes map modes through
`PUT /api/content/<name>.json`, and gains the **import** path it has never had
(`editor.js:30-34` — it can only publish, never load a published mode back).

**Acceptance:** the M0.5 round-trip test passes against `data/state.json`; the editor can open,
edit and re-save `content/cultural.json` without a download.

---

# M3 — Power: Authority, Influence, QoL, Civil Liberties

Create `js/power.js`. Every function returns a **Why record**, and that convention is what makes
M5 nearly free:

```js
{ value: 0.62,
  inputs: [ {label:'Age', raw: 14, weight: 0.2, contribution: 0.11, key:'power.authority.w_age'},
            {label:'Unrest', raw: 0.3, weight:-0.4, contribution:-0.12, key:'power.authority.w_unrest'} ],
  summary: 'High authority: long-established, low unrest' }
```

```
authority = f(age, wars_won, territory_held_without_unrest, gov_type, readiness)
          - f(losses, failed_suppressions, unrest, coalition_pressure)

influence = f(qol_rank, liberties, ideological_consistency, treaties_honoured, aid_given)
          - f(annexations * (1 + influence), expulsions, treaties_broken, blitz_pace)
```

The design's context-dependent scaling falls out of `(1 + influence)`: annexing costs a
high-Influence nation more because the penalty scales with what it had. Pacing falls out of
`blitz_pace` = annexations in the last N turns. **Both stocks get a floor and a maximum per-turn
delta** — that is the anti-death-spiral guarantee, and it must be in from the start.

Prerequisites this milestone must add:
- **Nations have no history.** `game.js:67` creates `{id, name, color, counties, origin, treasury,
  gov}` — no founding turn, no annexation record, no losses. Authority cannot be computed until
  `moveCounties` instruments `founded`, `annexed[]` and `lost[]`.
- **Nations have no ruling ideology.** `gov: 'Republic'` is a maintenance-rate lookup key with one
  entry. Civil Liberties needs `gov.rulingIdeology` and `gov.type` before it can measure
  "aligned vs misaligned population".
- **QoL** needs food and healthcare modelled as *needs*, not just sectors. `Market.nationSurplus`
  plus `DEMAND_SHARE` (moved out of `app.js` in M0.4) is the right input; add per-capita
  requirement curves.
- **Influence** already exists in ad-hoc stateless form inside `evalTransit` (`actions.js:276-299`)
  — size, relations and need. Promote that math rather than inventing new.

Cache all four once per turn.

---

# M4 — The West vertical slice

*This is the milestone where it becomes the game in the design doc. Scope it to the 13 western
states and prove the whole loop there before widening.*

**Why the West is the right slice, from the data:** `build_areas.py:26` exempts
`02,04,06,08,15,16,30,32,35,41,49,53,56` from the merge threshold, so **western Areas are real
counties** — county-level sentiment there is literally county-level with no merge ambiguity. The
West already carries five authored movement homelands in `build_parties.py` (Cascadian Separatists,
Deseret, New Absaroka, Northern Christian Kingdom, El Paso United), covers both headline factions'
home ground, and Greater Idaho and Jefferson are trivial additions to the same table. Fewer live
nations also keeps the O(nations × counties) recomputes cheap while you tune.

### M4.1 — `js/movements.js`

A Movement is `{id, ideology, type, homeland[], core[], seed, growth_cap, state, goals[], sponsor}`
with `state ∈ latent | rising | armed | declared | realized`.

Deterministic: **Cascadia, Deseret, Greater Idaho, Jefferson.**
RNG-seeded with a size cap: **Absaroka, Native American Confederation.**
Build the homelands from the existing `build_parties.py` region table (`build/build_parties.py:57-75`).

### M4.2 — `phaseSentiment` with all six factors

```
base        = affinity(area.dominant_ideology, movement.ideology)      # 0..1
grievance   = w_qol   * (1 - qol_norm)
            + w_lib   * (1 - liberty_satisfaction)
            + w_power * (1 - nation_power_norm)
            + w_auth  * (1 - authority_norm)
pull        = w_nbr * tanh(k * SUM_neighbours(same-movement strength))
suppression = w_sup * garrison_pressure(area)

target      = clamp01( base * (grievance + pull) - suppression )
sent[a][m] += clamp( target - sent[a][m], -MAX_FALL, +MAX_RISE )
```

Two properties matter more than the weights:

1. **`base` is multiplicative.** An area that does not share the ideology cannot be radicalised into
   that movement no matter how badly it is governed. That is the design rule — *geography defines
   where a movement can exist; ideology defines how strong it is there* — made mechanical.
2. **The change is rate-limited, not the value.** This is the specific and sufficient fix for the
   death spiral. Same treatment on Authority (M3).

Normalise every input to 0..1 **before** weighting, so the weights are comparable and an M5 slider
means something. Store each factor's raw contribution alongside the result — that array *is* the
"why did this happen?" data and the "show your work" data. Do not compute it twice.

`pull` is the diffusion term that is entirely missing today and is what lets a movement spread from
its seed. Read neighbours from the M2.4 CSR graph and from `snap`, never from `next`.

### M4.3 — Two-tier secession

- **Tier 1, continuous:** an Area whose `sent[a][m]` crosses `TUNE.secession.countyThreshold`
  defects to `m`'s realised nation, or becomes independent if there is none. Slow, per-turn.
- **Tier 2, discrete:** when every Area in a movement's `core` crosses the threshold, the movement
  **declares**. Point the *existing* `Game.breakApart` + `TurnSystem.insertAfter` machinery at it —
  tier 2 is ~90% built already.

Two fixes required in that existing machinery first:
- `confirmUniteAttempt` calls `Game.breakApart(plan.secede)` with **no `exclude`**
  (`actions.js:127`), so seceding fragments smaller than `MIN_NATION` silently rejoin the nation
  they just seceded from.
- `MIN_NATION = 10` (`game.js:240`) was written for counties but now applies to **Areas**, making a
  breakaway larger than 8 of the 51 starting nations. Re-derive it at Area scale, or express it as
  a population threshold.

Also add the honeymoon and the independence penalty from the design: 2–3 turns of an Authority
boost and a sentiment drop, against reduced GDP, military and QoL from transition chaos.

### M4.4 — The two cheapest release valves

- **Voluntary county release** — falls straight out of M1.10. Add the guardrail from the design:
  the recipient must accept, or be at war with you, or be in a deal with you, so you cannot dump
  counties on a rival to game sentiment.
- **Party change (appeasement)** — switch `nation.gov.rulingIdeology`; calms the aligned region and
  angers another. Needs M3's ruling-ideology field and nothing else.

Defer military suppression and autonomy grants to M6 (they need the military model).

### M4.5 — Sentiment-scaled occupation cost

`treasuryFlow` (`game.js:316-326`) already has flat `$40M`-per-Area upkeep — right hook, right
place, no sentiment sensitivity. Make it:
```
upkeep(a) = base * (1 + hostility(a)) * (1 + n_occupied^alpha)
```
Superlinear in the count, so conquest stops paying for itself past a point. This is anti-snowball
brake #2 and it is one line plus a helper.

**M4 acceptance:** start as Deseret on the western map, play 40 turns, and have a breakaway fire
somewhere that you did not script — with the reason legible in the trace.

---

# M5 — Instrumentation

*Before tuning anything. Runaway spirals are cheapest to find with no AI noise in the loop.*

### M5.1 — The event ledger

One append-only structure, per turn:
```js
{ turn, phase, subject, kind, delta,
  terms: [{name, value, ruleset_key}],
  text }
```

It serves **four** features and you should build it once:
- the player's "why did Salt Lake jump +8?" tooltip — render `terms` as prose
- the developer's formula expander — render `terms` as a table with ruleset keys
- the end-of-game map-history timeline — replay `subject`/`delta` over turns
- the simulator's graphs and save-game debugging

Today the *only* output any action produces is an HTML string handed to `flash()`
(`app.js:478-484`), a 6-second toast that overwrites the previous message — and on a round boundary
the action result is immediately clobbered by the growth toast. There is no event log anywhere in
`js/`.

### M5.2 — Developer dashboard

A page with a slider per `TUNE` key, live recalculation, and a "show your work" panel that expands
any computed value into its labelled inputs by reading the Why records from M3 and the factor
contributions from M4.2.

### M5.3 — 50-turn step-through simulator

`Sim.run(seed, tune, turns) -> series[]`, driven from a browser page (d3 is already vendored),
graphing Authority / Sentiment / Influence per nation over time to expose runaway spirals. This is
what M0.3's seeded RNG and M2.3's cheap `clone()` were for.

Tune the West with it before going further.

### M5.4 — Player-facing explanation

The same data at lower verbosity. Plus the additions worth making here:
- **Pressure clocks** — "Salt Lake corridor: breakaway in ~3 turns at current trend". Turns the
  explanation layer from retrospective to predictive.
- **A turn-summary newspaper** — 3–6 headlines per turn drawn from the ledger.
- **A Pressure map mode, made the default during play.** In a game about fragmentation the
  sentiment map is the real map; ownership is what you check to see what the pressure map did.
- **Fog** — exact sentiment for your own areas, banded (calm/rising/critical) for everyone else's.

---

# M6 — Agency

### M6.1 — Split every action into `plan` and `resolve`

```js
plan(state, intent) -> Preview                 // pure, no RNG, no DOM
resolve(state, intent, rng) -> {state, events} // pure, RNG explicit
```

The UI renders `Preview`, calls `resolve`, renders `events`. The AI calls `plan` over candidates,
scores them, calls `resolve` on the winner. **`plan` being shared is what stops the human's preview
and the AI's model from ever disagreeing about what an action does.**

Extract from `confirmAnnex` (`actions.js:550-595`), `confirmUniteAttempt` (113-135), the transit
`finalize` (355-363) and `confirmTrade` (444-454). `actions.js` becomes UI only.

This one split simultaneously unblocks the AI loop, deterministic replay, outcome tests and the
explanation layer. Do it before anything else in this milestone.

### M6.2 — Player identity

`grep -rni "player\b" js/*.js` returns **zero hits** across all 13 modules. The only gate on acting
is `const isTurn = nid === TurnSystem.currentId()` (`app.js:533`) — the human operates all 51 seats.

That is the root of the "not fun" problem, upstream of every balance issue: because you control
both the aggressor and the victim, an annexation is not a risk, it is a transfer between two of
your own accounts, and every anti-snowball device in the game is a speed bump you route around by
taking the other nation's turn.

Add `state.player` (persisted), and split `TurnSystem` consumers: the player's slot renders the
action panel; every other slot resolves through a headless policy function.

### M6.3 — AI

`js/ai.js` scoring `plan()` outputs with the pure evaluators. Even a weighted-random stub over the
legal action set converts 51 clicks into 1 and makes losses land on someone. Then give AI
personalities weights in `TUNE.ai` per win archetype.

Note the render implication: with M0.7 batching plus a diff renderer (invalidate only changed
Areas), 51 AI turns is fine. Without it, it is 100+ full topology re-meshes per round.

### M6.4 — Faction selection and win conditions

The game currently has **no win condition, no lose condition, and no elimination feedback.** A
nation being conquered out of existence is delivered as a silent `Map.delete()` (`game.js:236-238`)
— the swatch vanishes from the leaderboard, the turn order quietly shortens, the panel blanks. The
player cannot tell "Wyoming was annihilated" from "I mis-clicked".

Add:
- a start screen listing the ~22 factions with **difficulty tiers** (honest onboarding *and* a
  balancing lever — weaker starts get a small opening bonus without changing the map);
- `checkEndConditions()` once per world turn, evaluating a declarative table and returning
  `{winner, condition, metrics}` or null;
- the three archetypes: **Reunification** (control a territory set), **Ideological Dominance**
  (Authority + Influence + sway across a region), **Economic Supremacy** (GDP/trade target);
- the capstone **Reunification of the Union**: 3/4 of state capitals + 1/2 of population + 1/2 of
  GDP + Authority **and Influence** floors. The Influence floor is what blocks a pure-conquest win;
- **conditional vassals**: a vassal's capital counts toward your 3/4 only if your Influence over it
  clears a threshold — high-Authority/low-Influence vassals "vote no", which creates the late-game
  kingmaker role;
- elimination as a real **event**: `pruneEmpty()` returns the deleted records, the caller emits an
  obituary and a history entry.

### M6.5 — Faction-switch, military, remaining valves

- **Faction-switch** — when a breakaway is imminent, become the breakaway instead of going down
  with the parent. Needs M6.2's seat concept.
- **Military** as allocation: Force = Manpower × Equipment × Doctrine, split across
  Garrison / Border / Field with readiness decay. No unit counters; combat stays an odds roll with
  force ratios as the input.
- **Military suppression** and **autonomy grants**, the two remaining release valves.

---

# M7 — Depth and widen

- **Relations as one append-only structure:** `{turn, from, to, kind, magnitude}` with
  `relation(a,b) = base + Σ magnitude·decay^(now-turn)`. Memory, rivalries, coalition triggers and
  "they annexed us three turns ago" all fall out of this one list. There is no inter-nation
  relations state of any kind today and the save format has nowhere to put one.
- **Coalitions** replacing the raw blue shell: trigger on `threat = size_share × (1 - influence)`,
  so a beloved unifier is left alone and a feared conqueror gets ganged up on. (The current
  `blueShell` at `game.js:199-205` ranks by population only and its two annex effects cancel out,
  so it does not slow the leader at all.)
- **War weariness** — continuous warfare raises sentiment and lowers QoL across the *aggressor's*
  nation. Nothing persists between wars today.
- **Events and crises** — 2–3 options with real tradeoffs. A 6-second auto-clearing toast is
  currently the entire narrative surface.
- **Leaders** with light traits — the least blocked system in the whole analysis, and cheap
  personality.
- **Map-history timeline** — replay the ledger.
- **Names and flags for new nations** — ideology-flavoured name templates and a procedural SVG flag.
- **Recognition / legitimacy** — an unrecognised breakaway cannot sign trade deals or join
  coalitions. One scalar plus a matrix; gives new nations a real early problem.
- **Migration** — people move along the QoL gradient weighted by alignment and network distance.
  This is what makes QoL physical and what makes expulsion a forced version of an existing system
  rather than a special-case button.
- **Elections** — otherwise the party-change valve makes ideology a costume. Let a drifting nation
  lose its own government.
- **Projection range** off the transport network — anti-snowball brake #3, and the thing that
  finally makes the baked rail/port/choke-point data do something.
- **Then widen east.** Last, deliberately: east of the MT/WY/CO/NM line, sentiment operates on 483
  merged Areas rather than counties, and the eastern movements (Franklin, Acadiana, New England
  Revivalist, Central States Union, Great Lakes) need homelands baked. Widening last keeps the
  merge ambiguity a data question instead of a design question.

---

## Working rules for the assistant

1. **`git commit` after every numbered task.** M0.1 exists so that this is possible.
2. **Read the finding in `docs/CODE-REVIEW-FINDINGS.md` before writing a fix.** Each one carries
   the exact line numbers, the measured evidence, and a verifier note recording where the original
   claim was corrected or narrowed. The verifier notes matter — several findings are true but
   narrower than they first sound.
3. **Add a test with every fix**, into the M0.5 harness. The invariants are the point.
4. **No magic numbers.** Every constant goes in `TUNE` (M0.4) with a name.
5. **The engine never touches the DOM and never reads a global.** Every function takes
   `(state, tune, rng)` explicitly. This single constraint is what buys the simulator, the
   dashboard, the tests, replay and the AI — they are all just other callers.
6. **Phases read `snap`, write `next`, append to the ledger.** Never read what you wrote this turn.
   (The current code advertises this discipline at `world.js:6-10` and violates it in two of four
   phases — do not repeat that.)
7. **Ship a working game at the end of every milestone.** If a milestone cannot end playable, split
   it.
