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

Done in the order **M3.4 -> M3.1 -> M3.2 -> M3.3**, because the plan lists M3.4's contents under
"Prerequisites this milestone must add" and Authority cannot be computed before them (D64).

- [x] **M3.4** Nation history (`founded`, `annexed[]`, `lost[]`) recorded at the one territorial
      choke point, bounded to a 20-turn window (D65); `gov` is now `{type, rulingIdeology, since}`,
      derived but stored and refreshed once per turn (D66). 29 red / 22 blue governments at turn 0,
      matching the 2024 map.
- [x] **M3.1** `js/power.js`: the Why-record convention (D67), the rate-limited stock discipline
      (D68) and Authority on top of both (D69). Rendered in the nation panel straight from the
      record — nothing recomputed. Measured at turn 0: Authority spreads 0.399 (Montana) to 0.559
      (DC) across 51 nations; by turn 11 California reads 65% with solvency +13.8, cohesion +9.4,
      wars won +6.0 against overreach −2.7 and occupation −2.4.
- [x] **M3.2** Influence, promoted out of `evalTransit`'s stateless inline version (D70), with the
      `(1 + influence)` conquest scaling that makes it the one stock that is its own input (D71).
      Measured live: California conquering 58 -> 118 Areas over 12 turns went Authority 0.501 ->
      0.515 and Influence 0.666 -> 0.148. One renderer serves both stocks (D72).
- [x] **M3.3** QoL with food and healthcare as NEEDS rather than sectors, and food buyable as well
      as growable (D73); Civil Liberties hinged on alignment at home, with division measured
      separately from distance (D75). Requirements calibrated from measurement in the model's own
      units, not from real-world figures (D74). One pass per nation instead of six full scans:
      phasePower 4.51 -> 2.32 ms (D76). Turn-0 bands: Authority 0.44-0.56, Influence 0.45-0.66,
      QoL 0.55-0.98, Liberties 0.60-0.84.
- [x] **M3.5** All four cached once per turn in `phasePower` and surfaced twice: the nation panel
      renders each Why record in full, and the leaderboard gains a sort per stock with a heat colour
      and a trend arrow, because a stock you can only read one nation at a time is half a feature.

## M4 — West vertical slice

- [x] **M4.0** Prerequisites in the existing machinery, which the plan files under M4.3: the missing
      `exclude` in the unite-failure secession, and `nation.minPop` wired in as an OR against
      `minAreas` (D77).
- [x] **M4.1** `js/movements.js` replaces `js/parties.js`. The record gains a machine id, a type, a
      derived core (D78), the seed it started from, a per-movement growth cap (D80) and a state
      machine read off the map rather than set by events (D79). All four plan-named movements are
      now actually deterministic.

- [ ] **M4.1** `js/movements.js`.
- [x] **M4.2** `phaseSentiment` with all six factors, replacing `phaseMovementGrowth`. Sentiment is
      the movement's share itself (D81); the explanation is the calculation, recomputed not stored
      (D82); movements seed their core so the diffusion term has somewhere to carry them (D83); and
      the model discriminates, with a test demanding something lose ground (D84). Measured at turn
      45: Deseret spreads 4 -> 41 Areas and DECLARES, 1 declared / 7 armed / 6 rising / 3 latent.
- [x] **M4.3** Two-tier secession. Tier 2 declares and creates the nation; tier 1 grows it along its
      frontier, rate-limited (D85). Independence carries a decaying Authority honeymoon against a
      proportional GDP cost (D86). Three bugs found: conquest read as a date rather than a reason
      (D87), a second clock in the phase (D88), and `silent` dropping the roster event so a dead
      nation kept its turn slot (D89).
      **M4 ACCEPTANCE MET**: 50 turns produced three unscripted breakaways — Alaskan Independence
      t6, Greater Idaho t8, Deseret t10 — grown by 70 defections to 23, 17 and 39 Areas.

      *Watch in M5:* all three declare by turn 10, which is fast. The plan tunes the West with the
      simulator and this is the first number to point it at.
- [x] **M4.4** The two release valves. Voluntary release gains the recipient guardrail (D90);
      appeasement is `gov.rulingIdeology` plus three guardrails, and the effect is Civil Liberties
      recomputing rather than anything scripted (D91). Two bugs: the refresh stomping a deliberate
      choice (D92) and the cooldown reading the wrong clock (D93). Measured live, Oklahoma
      Republican -> Democrat: alignment at home 0.93 -> 0.67, liberties 0.73 -> 0.65.
- [x] **M4.5** Occupation upkeep scaled by local hostility: `base * (1 + w*hostility) * (1 + n^alpha)`.
      The count term is the anti-snowball brake; the hostility term is what makes WHICH ground you
      took matter as much as how much. One helper, no new state — it reads the sentiment M4.2 keeps.
- [x] **M5.1** `js/ledger.js`: one append-only structure serving the tooltip, the formula expander,
      the timeline and the simulator. `terms` IS the Why record, so logging an explanation costs one
      array reference rather than a second calculation. Wired into annex, civil war, both unite
      outcomes, release, changing course and both tiers of secession — and a nation ceasing to exist
      is an event now rather than a silent `Map.delete`.
- [x] **M5.2** `dev.html`: 142 sliders generated from the TUNE schema, live charts, verdict cards
      for the questions each earlier milestone asked once, and the ledger rendered with its terms
      and slider keys expanded (D95).
- [x] **M5.3** `js/sim.js`, driving the REAL game rather than a model of it (D94). A 50-turn run is
      1.7s. **The West is tuned** (D96): `sent.maxRise` 0.035 -> 0.014 moves the first secession from
      turn 9 to turns 22-29 across four seeds with nothing else materially changing. Found and fixed
      the declaration fizzle by reading the log (D97), and made the fixture load the authored tuning
      (D98).
- [x] **M5.4** Player-facing explanation: a Pressure map mode with fog, pressure clocks in the Area
      panel (with STALLING rather than a fake ETA), and a turn-summary newspaper drawn from the
      ledger, replacing a growth line that said the same thing every turn. (clocks, newspaper, Pressure mode, fog).

## M6 — Agency

- [x] **M6.1** `js/moves.js`: `plan(intent)` pure, `resolve(intent, rng)` with the RNG explicit, for
      annex, unite, release and govern (D99). `Moves.legal(nid)` is the AI's candidate list — the
      rules, unscored (D100). The contract is what the tests pin: plan never mutates, resolve refuses
      exactly what plan refused with the same sentence, and the bill matches the quote.
- [x] **M6.2** Player identity. `Game.getPlayer/setPlayer/isPlayer/playerNation`, persisted in the
      state document (D101). `TurnSystem.advance` takes the round boundary back off the renderer, and
      `js/ai.js`'s `sweep` plays the other fifty seats headlessly between two of yours (D102). The
      policy is deliberately empty until M6.3 (D103). The newspaper now reports the interval since
      your turn ended rather than one world turn, because the sweep straddles the boundary.
      *Observed while verifying:* Areas can oscillate across a contested border turn by turn
      ("Douglas County left Greater Idaho for State of Jefferson", and back the next turn). Real, and
      now visible because the interval newspaper reports both halves. Belongs with M7's relations
      work or a defection hysteresis tunable; not fixed here.
- [x] **M6.3** AI. `js/ai.js` scores `Moves.plan` previews with a signed Why record; posture is
      derived from strain rather than assigned (D105). Sixteen `TUNE.ai.*` weights. Fifty nations
      playing every turn turned out to be a fuzzer pointed at the rules and found four holes: unite
      had no cooldown and no price, release had no price, `nation.minAreas` sat below
      `release.budgetAreas`, and both remaining cooldowns were 1 (D106). Also fixed on the way: the
      ledger writes lived in the UI so 50 of 51 nations acted invisibly, and `Moves` read
      `window.TUNE` so no dashboard slider could reach an action rule (D107); the simulator stepped
      the world instead of playing it (D108); the pressure fog read a `store.player` that never
      existed (D110). `actions.js` 1246 -> 997 lines and finally UI-only.

      **Measured**, three seeds x 60 turns: 51 nations -> 55 / 79 / 74, first secession t39-44,
      declarations 6 / 3 / 2, defections 22-39, 249-290 annexations, 38-41 civil wars, 2-8 unions,
      7-18 releases. Playing Ohio and passing 40 turns: 51 -> 72 nations, Ohio eaten from 63 Areas to
      48, 244 ms per round with ~70 nations acting, zero console errors.

      **Left open, deliberately:** (a) the AI never changes course - `govern: 0` across every run, so
      `ai.wMandate` / `gov.changeCost` want a look in a tuning pass; (b) first secession moved from
      t22-29 (the M5 pass, no AI) to t39-44, because AI annexations disturb movement cores - arguably
      better, since the player gets time to learn the board, but it is a change to a deliberately
      tuned number; (c) the suite crossed four minutes, hence `tests/run.html?only=<names>`.
- [x] **M6.4** Faction selection and win conditions. `content/capitals.json` (51 seats, authored by
      county name, validated every bake, D111); `js/victory.js` — three archetypes as a table of Why
      records, checked over every nation once per world turn (D112); conditional seats read as a
      sphere of influence (D113); every target calibrated against a measured eighty-turn game rather
      than guessed (D114); `js/factions.js` rating all 51 openings with tiers as proportions of the
      field and a money-only handicap (D115). End screen, defeat screen, and a live path-to-victory
      in the player's own panel. Elimination was already an event (`pruneEmpty`, M4).

      **Fixed on the way:** `Game.dominantOf` takes a collection and was being handed one Area id,
      which iterated its characters — Ideological Dominance read 0.000 for all 107 nations and could
      not be won at all.

      **Left open, deliberately:** (a) the AI does not know the victory conditions exist, so it never
      plays toward one — the human wins by default once they know the table. That is the single most
      valuable thing left in M6 and it belongs with M6.5's work on the AI; (b) the targets are set at
      2-5x what an AI-only world produces on the reasoning that a deliberate player outperforms a
      deliberately mild AI, which is a judgement rather than a measurement and the first thing a real
      play test should revisit.
- [x] **M6.5** Faction-switch, military, remaining valves. Split, because it is four systems:
      - [x] **M6.5a** `js/military.js` — force as an allocation across Garrison / Border / Field,
            derived from population, wealth per head and how well the state governs. Readiness lags
            the allocation (the whole cost of changing your mind); upkeep is charged on force, not on
            where it points. Suppression stops being a boolean and becomes a trade: quiet in the
            sentiment phase, paid for in Civil Liberties. The war roll reads the force ratio, and the
            annexation preview reports it so the human and the AI see one number.
      - [x] **M6.5b** Autonomy grants — the other valve, and the one that keeps the ground. Scales
            the whole grievance rather than one term of it; costs revenue and Authority; reversible,
            which is the whole reason it is not release. Stored in the Area's `attrs`, so it saves
            for free. Offered to the AI beside release over the same ground, so the choice turns on
            the prices. Also here: `Sim.run({ai:false})` for the two suites that ask about the world
            engine's pacing rather than about anybody's choices — 265 of the suite's 412 seconds.
      - [x] **M6.5c** Faction-switch. The declaration event carries `parent`, read before `breakApart`
            moves the ground; the offer is made after the declaration (so you decide knowing what
            actually left) and BEFORE the defeat check, which is the case the review names — the
            breakaway that takes everything.
      - [x] **M6.5d** The AI plays toward a victory condition: a Closing term on the binding
            requirement of the condition it is nearest, scoring only what a territorial move can
            actually shift. Nothing an annexation does moves Influence, which is the shape of the
            capstone rather than an omission.

## M7 — Depth and widen

- [x] **M7.1** Relations as one append-only structure — `js/relations.js`. Directed, decaying, a Why
      record, recorded from the resolvers beside the ledger writes. `witnessed` is the term the
      coalitions rest on. Two live consumers: a union's odds and whether a neighbour will take
      released ground. Plus three caches (a from|to index, `Victory.context`, `Sentiment.context`)
      keyed on a new `Game.ownerEpoch()` — the MODEL clock, where `Game.epoch()` is the render clock
      and is frozen inside a batch. Round cost 244ms -> 97ms; suite 298s -> 104s.
- [x] **M7.2** Coalitions replacing the blue shell — `js/coalitions.js`. `threat = share x (1 -
      influence)`; members are named nations that resent you or border you, read off the M7.1 list.
      Costs money every turn (encirclement), standing every turn (an Influence term, a deliberate
      loop), and their border armies count against you in any war. `Game.blueShell` delegates, so
      annex cost, the civil-war multiplier and the union chance all changed at once. Two legacy tests
      rewritten: they pinned properties of a size tier that no longer exists, and the concern behind
      them — "the anti-snowball weakens as the snowball grows" — is now tested directly.
- [x] **M7.3** War weariness — a fifth power stock, `Power.weariness`. Separate wars, ground taken by
      force, occupied ground, and the share of the army in the field. Felt in QoL and in sentiment, so
      a long campaign becomes a secession problem. The aggressor's, not the victim's. The "in the
      field" term replaced "share under arms", which could not vary because force size is not a
      choice.
- [x] **M7.4** Events and crises — `content/events.json` (12 authored) and `js/events.js`. Triggers
      read facts the model already computes; effects move numbers other systems already own; a test
      checks no option dominates another. The AI answers from its own shortfalls; the player's is
      left pending. *Turned up in play:* Ideological Dominance counted Areas and 80.7% of counties
      are red on turn 0, so it was won before anybody moved — it counts people now, and the
      newspaper warns when anybody is within 80% of a condition. Also: the test runner now FAILS on a
      suite that will not load (a syntax error had silently deleted 22 tests while the run read
      green), and `power.floor` no longer applies to war weariness.
- [x] **M7.5** Leaders with light traits — `content/leaders.json` (12 traits, 80 names) and
      `js/leaders.js`. One signed `Leadership` term in each of the five stocks, plus a small pull on
      the war roll. Traits are drawn against the government's ideology; two traits sum, so a Hawk
      paired with a Reformer cancels. A new government is a new person. Also here: `Power.build`
      learned about SIGNED inputs (mapping a modifier through `centred` gave every nation a constant
      offset), and a Why record no longer seats a leader as a side effect of describing one.
- [x] **M7.6** Map-history timeline — `js/history.js`. One baseline plus per-turn ownership DELTAS
      (13 KB for thirty turns against ~250 KB naive), a cast recording every nation's name and colour
      when it first appears so the timeline can name countries that no longer exist, and a scrubber
      that repaints the map and lists that turn's standings and news.
- [x] **M7.7** Names and flags for new nations — `content/names.json` and `js/identity.js`.
      Names are drawn against the FOUNDING IDEOLOGY, so a Distributist breakaway is a Compact
      and a Nationalist one is a Directorate; the county suffix is stripped because "Cook" is a
      place and not a country. Flags are a pure function of the nation id — layout, palette and
      charge all fall out of one hash — so a flag survives a save without being in one and
      cannot drift from the nation. Two countries may not share a name: the first cut minted
      the Fairfax Federation twice.
- [x] **M7.8** Recognition / legitimacy — `js/recognition.js`. One scalar and one matrix:
      `recognises(A,B)` is stored only where it is not the default, so the fifty-one founding
      states cost nothing and the matrix is empty on turn 0. An unrecognised state cannot sign a
      bilateral deal, cannot take a coalition seat, is paid a smuggler’s rate on the world market
      and carries a SIGNED deficit on Influence. The parent’s recognition is the pivot — the
      largest single term in the decision every other capital is making — and a RELEASED state is
      recognised by its parent from the first day, which is the cleanest difference between the
      two ways a nation can be born. Also here: `Game.nationWeight`, one definition of how much a
      nation counts for, replacing three copies of the same blend.
- [x] **M7.9** Migration — `js/migration.js`, a phase between drift and growth. People move along
      the adjacency graph toward Areas that are better for people like them: quality of life and
      civil liberties (the nation’s), output per head and crowding (the Area’s), and alignment —
      which is the term that changes the game, because a divided nation sorts itself into
      homogeneous halves and those halves are the ground a movement organises on. A gradient, not
      a destination, so distance is real without a distance calculation; a border is friction
      (0.40) rather than a wall. Movements shrink with the people who leave and are DILUTED by
      the people who arrive, which makes settlement an answer to secession. Every flow is
      computed before any is applied, or the node numbering would decide who moved.
- [x] **M7.10** Elections — `js/elections.js`. Every nation votes every `election.termTurns`, on a
      schedule STAGGERED by a hash of its id and stored nowhere. The base is the population; the
      government in office gets one swing made of the four things it is answerable for, measured
      AGAINST THE WORLD MEAN rather than against 0.5 — the stocks sit in the eighties, so centring
      on the middle of the range handed every incumbent alive the same large bonus and 284
      elections produced three changes of government. This replaces `refreshGovernments` tracking
      the plurality every turn and “it chose; it keeps its choice” locking in anybody who ever
      used the appeasement valve. A government whose Civil Liberties are already below
      `election.stealBelow` may refuse the result and pay in more of them; the player is asked.
- [x] **M7.11** Projection range off the transport network — `js/projection.js`. Reach is a bounded
      Dijkstra from ONE place, where the government sits: making every captured seat a source made
      the brake a no-op, because an empire built by conquest captures capitals by construction.
      Entering an Area costs what its transport costs — hub, rail, interstate, open country — and
      foreign ground costs 2.2x that, so armies move down the corridors the country was built
      along. It prices an annexation, weakens the army that fights for it, and past
      `proj.minReach` refuses the move outright: the opening board is untouched (944 of 944
      targets), a 517-Area empire loses a third of its frontier and a 660-Area one loses nearly
      half. Also fixed here: the distance array was Float32, so Dijkstra discarded its own heap
      entries as stale and 481 of 944 targets were refused for a rounding error.
- [x] **M7.12** Widen east — five eastern movements authored into `build/build_parties.py` and
      baked: **Franklin** (the state that really existed from 1784 to 1788, across what are now
      five state lines), **Acadiana**, **New England Revivalist**, **Central States Union** and
      **Delmarva Republic**, plus the Great Lakes homeland widened along the Erie Canal. Kentucky
      and West Virginia had no homeland AT ALL, upstate New York had two Areas of one, and
      Maryland, Delaware and rural New Jersey had none — so every movement mechanic in the game
      was a western feature. Areas that can never receive a movement: 278 → 179, and what is left
      is the empty western interior. Franklin and New England Revivalist spawn deterministically,
      for the same reason Deseret and Cascadia do.

---

## Resume notes

*(Updated as work proceeds — what is done, what is next, what was learned that is not yet
written down elsewhere.)*

**M0-M5 complete.** 785 tests green at `tests/run.html` in ~140s,
`build/validate.py` reports 0 errors, and the game loads, plays and saves with a clean console.
`DESIGN.md` rewritten at the M5 close: section 4.1 is the four power stocks, section 7 is movements,
sentiment and two-tier secession, section 7.6 is the ledger, the simulator, the dashboard and the
tuning pass.

Verified at the M4 close: 40 world turns through the real Pass button produced three unscripted
breakaways (Deseret 39 Areas, Alaskan Independence 23, Greater Idaho 17), movement states spread
across all five values, Deseret paying $288M a turn to occupy 12 Areas beyond its homeland, and the
turn order in sync with the roster at 53.

Verified end to end at the M2 close: fresh boot -> world turns driven through the real Pass button
-> autosave to `data/state.json` -> reload the page -> resumed at the same turn, population, seed
and borders -> map editor -> Open published -> Cultural (1,676 unassigned becomes 0 assigned) ->
add a region -> Publish -> `content/cultural.json` came back with the new region and all 1,676
assignments, with no download anywhere in the loop.

Performance, measured on the real map rather than predicted: a world turn 24.7 -> 9.3 ms, the six
phases 12.4 -> 2.8 ms, political drift 8.0 -> 2.0 ms, a 50-turn simulator run 1,237 -> 466 ms. The
columnar store is 173 KB and the adjacency graph 43.5 KB.

Next: the **M7 close** — the western half of the movement-coverage gap, then the DESIGN.md rewrite.

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
