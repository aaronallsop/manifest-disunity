# Rebuild progress

Checklist derived from `docs/REBUILD-PLAN.md`. Tick a task only after it is committed and
verified in the browser (zero console errors, `tests/run.html` green).

Legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## M0 — Safety net & foundation

- [x] **M0.1** Version control first — `.gitignore` (excludes 376 MB `build/raw/`), `git init`,
      baseline commit, `build/raw/README.md`. `.git` = 1.4 MB.
- [ ] **M0.2** Write-capable local server (`server.py`, stdlib only, 127.0.0.1, `/api/state`,
      `/api/content/<name>.json`); clean `.claude/launch.json`.
- [ ] **M0.3** Seeded RNG with named streams (`js/rng.js`); replace all 5 `Math.random()` sites.
- [ ] **M0.4** One tunables object (`js/tunables.js`), every constant named, reads recorded.
- [ ] **M0.5** Test harness (`tests/`, ESM, `tests/run.html`) + seed invariants.
- [ ] **M0.6** Fix live save/load bugs; save v2; refuse v1; guard against in-flight action.
- [ ] **M0.7** `Game.batch(fn)` — stop the per-mutation full repaint.

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

- Current task: **M0.2**.
