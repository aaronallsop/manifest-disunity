# Rebuild progress

Checklist derived from `docs/REBUILD-PLAN.md`. Tick a task only after it is committed and
verified in the browser (zero console errors, `tests/run.html` green).

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## M0 — Safety net & foundation

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

## M1 — Correctness patch pass

- [ ] **M1.1** 48% of emergent party spawns silently fail (Area alias lookup).
- [ ] **M1.2** Connecticut renders wrong internal borders on first load.
- [ ] **M1.3** Civil war is a step function, not a dice game.
- [ ] **M1.4** Annexation is free; absolute cap + treasury debit + occupation upkeep.
- [ ] **M1.5** One growth clock; `ext` in growth; real `phaseEconomicGrowth`.
- [ ] **M1.6** Counties converge to a single political mix — add counter-forces.
- [ ] **M1.7** Even-spread mutations flatten the map — distribute proportionally.
- [ ] **M1.8** Market one-way ratchet; two economies; `DEMAND_SHARE` sums to 0.80.
- [ ] **M1.9** Trade mints GDP from nothing; World market dominates.
- [ ] **M1.10** Implement Release; give Counties mode a purpose.
- [ ] **M1.11** Documentation and dead weight.
- [ ] **M1.12** Performance: the three things that run on mousemove.
- [ ] **M1.13** Data pipeline integrity + `build/validate.py`.

## M2 — Model rewrite

- [ ] **M2.1** Delete `game_state.py` (port the exact-sum drift absorption first).
- [ ] **M2.2** Six symmetric ideologies on two axes; delete `lean` from the model API.
- [ ] **M2.3** Columnar state (typed arrays); ownership stored once.
- [ ] **M2.4** CSR adjacency graph, built once.
- [ ] **M2.5** One state document (`data/state.json`); editor round-trip via the server.

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

**M0 complete.** 71 tests green at `tests/run.html`; the game loads, plays and saves with a clean
console. Next: **M1.1** (48% of emergent party spawns hit a deleted key).

Learned along the way, not written elsewhere:
- The in-app browser serves a cached document on a same-URL `navigate`. Add a throwaway query
  string (`?x=7`) when reloading after an edit, or you will verify the previous build.
- `read_console_messages` keeps a buffer across navigations; open a fresh tab for a clean read.
- `TUNE.trace(fn)` already gives M5's "show your work" data for free — one world turn reads 13 keys.
- `window.__renderCount()` / `__resetRenderCount()` in app.js are the M0.7 instrument; keep them.
