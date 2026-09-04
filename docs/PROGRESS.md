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
- [x] **M7 close (a)** The rest of the map — three more movements and one correction, so that every
      Area in the country can receive a movement: **California Republic**, the **Sagebrush Rebellion**
      (the federal-land counties, a western politics since 1979) and the **Fifty-First State** (the
      eleven Colorado plains counties that actually voted on secession in 2013). **Cascadia was
      wrong**: its homeland was the R-leaning inland northwest, which gave the flagship movement of
      the West slice a core in Butte and Shasta counties in CALIFORNIA. It is the wet side of the
      mountains now, and its core is the Portland-Seattle corridor the tests always said it was.
      Areas that can never receive a movement: 179 → **0**, and the validator warning that has stood
      since M1 is gone.
- [x] **M7 close (b)** `DESIGN.md` rewritten for a game with diplomacy, elections, migration and a
      limit on how far anybody can reach; `README.md`'s module map brought up to date; and
      `docs/DECISIONS.md` given the fifteen entries M6.5 through M7.12 never got.

---

## M8 — The Shattering ✅

*`docs/SHATTER-PLAN.md`. The opening board stops being the moment before the story.*

- [x] **M8.1** Home ground is a per-nation **set stamped at birth**, not a modal state FIPS.
      `occupiedCount`, the treasury surcharge and `isOccupied` read it; `ai.js`, `actions.js` and
      `app.js` go through `Game.isHomeGround`; `homeSt` survives as a display fact that no rule
      reads. Origin states are stamped with every Area of their state, which is exactly what the old
      rule said about them, so the refactor is **exact for the whole baseline board** — the suite
      asserts the two predicates agree Area by Area. It is not bit-identical once a nation is born
      in play, and that divergence IS the change: at seed 20260829 the first difference is world turn
      2, and the only value that moves anywhere in the fingerprint is the treasury of the **Washoe
      Republic**, founded on turn 1 out of Washoe County (NV) and Placer County (CA), which under
      the old rule paid an occupier's surcharge to stand in the county it is named after.
      $274,717,136 → $275,774,192.
      And `Game.serialize`/`loadState` now walk field **registries** rather than naming fields —
      `AreaState.savedFields()` for the columns (which the audit found only tests called) and a
      `NATION_FIELDS` table for the record — so the new field could not be silently dropped.
- [x] **M8.2** The bake. Deseret's homeland 41 → **61 Areas** (the authored 57-Area Mormon Corridor
      plus the rest of Utah, because dropping four eastern Utah Areas would reopen the coverage hole
      the M7 close closed); Cascadia gains the cultural doc's own Cascadia leaf; Jefferson gains
      Mendocino and the rest of the southern Oregon tier. The regions are read out of
      `content/cultural.json` rather than hand-copied, so a repainted leaf moves them.
      New per-movement **`growthRate`** (default 1.0, Deseret 1.5) plumbed bake → live record →
      `Sentiment.build`'s `rises[]` → the one comparison in `phaseSentiment`. Measured as an A/B on
      one bake, 20 turns, no AI: Deseret's mean share 0.2417 → 0.3532 while New England United is
      identical to the person.
- [x] **M8.3** `js/scenario.js` + `content/scenario-shattered.json`: a two-phase, DOM-free applier
      wired into `app.js`, `sim.js` (with a dev.html toggle), the test fixture (default off) and all
      three HTML pages, plus `?scenario=`. Claims resolve against the cultural `assign` table;
      partitions are validated before anything moves and the error names the FIPS.
- [x] **M8.4** Texas, five ways: 22 / 32 / 16 / 13 / 21, the nine Oklahoma strays filtered out,
      Austin holding Travis and therefore the old Texas seat.
- [x] **M8.5** California, five ways plus a cession: 1 / 9 / 3 / 6 / 30 and nine Areas to **Cascadia**,
      green over red ground — opening Civil Liberties **0.4735** against 0.63–0.71 for its
      neighbours, and the only *brutal* opening on the faction picker.
- [x] **M8.6** Deseret's cession: per-Area rolls at each sub-region's odds on a new `scenario` rng
      stream, the Wasatch Front forced, and only the component holding Salt Lake cedes. Twenty seeds:
      **mean 31.1 Areas, 3.75M people, spanning 19–45**, always connected. Opens unrecognised with
      Utah as its parent — Utah's signature moves the continent's per-turn recognition chance
      0.070 → 0.181 — and takes the honeymoon without the transition GDP cut.
- [x] **M8.7** The corridor that stayed: seeded under the 0.40 line (nothing defects on turn 1) with
      a standing `attrs.sentBoost`, read by `Sentiment.target()` behind `sent.wBoost` and rendered in
      the Why panel as **Unfinished business**. Over 40 turns the corridor runs 0.295 → **0.460**,
      against 0.402 with the boost off and 0.419 at the ordinary rate.
- [x] **M8.8** Close: the two statewide movements rebranded as *reunification* movements, a
      `successor state` label and authored colours, the picker's tier spread verified over 61
      openings (13 / 20 / 19 / 9 against the authored 20/35/30/15), `ai.js`'s `seats: 51` still
      matching Victory's row count, dev.html verdict cards re-baselined for both boards, and
      `tests/scenario.test.js` — 29 tests running the invariants under the shattered fixture plus
      what is particular to it. **824 tests green.** `DESIGN.md` §1 and a new §2.1 rewritten;
      `docs/DECISIONS.md` given D131–D140.

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

**M0–M8 complete.** Every numbered task in `docs/REBUILD-PLAN.md` and `docs/SHATTER-PLAN.md` is
done. **824 tests green** at `tests/run.html` in about four minutes, `build/validate.py` reports 0
errors and 2 warnings (both of them data-vintage notes with no fix that is not a re-bake), and a
fresh shattered boot plays 60 turns in the browser with an empty console. `DESIGN.md` was rewritten at the M7 close: §4.1 is five stocks, §6.4 is reach,
§6.5 is relations, coalitions and recognition, §6.6 is leaders, crises and elections, §7.6 is
migration, and §12 is now an account of where the model stops rather than a queue.
`docs/DECISIONS.md` carries D116–D130 for M6.5 through the close.

What a next pass would take up, in the order the evidence argues for it: **per-Area power
stocks** (the one structural gap left, and the thing that would give migration and the diffusion
term a real gradient), **trade as a Move** so the AI can use rules it already has, and a **play
test against the victory targets**, which are the largest un-measured judgement in the game.

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
- **M8:** changing a movement's HOMELAND changes its derived core, which changes how many draws
  seeding takes, which reshuffles the `spawn` stream for every movement after it. Two bakes are
  therefore never comparable movement-by-movement. Measure a tuning change as an A/B on ONE bake, by
  mutating the loaded `raw.partyDefs` between two `bootWorld` calls and restoring it in a `finally`.
- **M8:** `Sim.run` is idempotent across repeated calls in one page, so a baseline captured in the
  console is trustworthy — but the console buffer and `localStorage` are the only things that
  survive the reload you need in order to pick up an edit. `git stash push -- js/` around a
  measurement is the cheap way to get a true before/after; it normalises CRLF to LF on the way back,
  which is a whole-file `file` diff and a zero-line `git diff`.
- **M8:** the Areas of a merged Area are NOT visible to anything that sums `counties[aid]`. The
  SHATTER-PLAN's Texan population table was computed that way and understates every Texan successor
  by the rural counties the merge folded in — the M1.13 trap, at the level of the plan rather than
  the code. California is immune (58 counties, 58 Areas), which is exactly why it looked right.
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

---

## Post-M8: the menu, and the plan the audit argues for

**The game menu (D141).** The game had no New game. The only route to a fresh world was `?fresh=1`
in the address bar, which nobody who has not read `app.js` can find. The header is now for the MAP
and one accent **Menu** button (`js/menu.js`) opens everything about the GAME: new game, save, load,
timeline, map editor. Starting over is a page reload preceded by `SaveManager.clearLive()`, because
boot is the one code path known to produce a valid world; the URL it reloads to is built from
`location.pathname` so last game's `?play=` and `?seed=` cannot leak into this one, and deliberately
carries no `?fresh=1` — that flag left in the address bar would make every later reload silently
discard the game in progress. `?seed=<whole number>` is new and is what makes the dialog's Seed
field mean anything. `openModal`/`closeModal` moved from `saves.js` to `app.js` (Escape closes now),
and `editor.js` stopped repainting a header button label, because the menu is rebuilt from
`Editor.isActive()` every time it opens. **825 tests green in 152s** after the change.

**`docs/AUDIT-PLAN.md`** turns *The Union Audit* (Technical 86/100, Design 82/100, market grade B —
conditional) into M9–M14 with acceptance criteria. Three things it establishes that the audit could
not: all five high-severity findings **still reproduce** at current line numbers; one second-tier
finding (`Game.serialize` vs the FIELDS registry) was **already fixed by M8.1**; and the duplicate
`econ.occupationHostility` is **worse than reported** — the two definitions carry different values
(1.6 and 1.0) and the second wins, so the shipped brake is 1.0 and the argued 1.6 is dead text.

Four re-orderings against the audit's sequence, each argued in §2 of that document: the **rename is
step zero** (it gates a 6–12 month wishlist runway, the longest pole in the plan); the **Area re-bake
moves up to M9** (it invalidates saves, and M13 hands builds to humans who will make saves); the
**victory alarm is a bug, not onboarding**; and **`app.js` (2,406 lines) splits at the M9/M10
boundary**, before M9's journal and M10's objectives screen add another 600–800 lines of renderer to
it.

---

## M9 — the seams

Every confirmed gap between what the game shows and what it does, closed. Nothing new; everything
honest. `docs/AUDIT-PLAN.md` §3 is the milestone; `docs/DECISIONS.md` D142–D149 are the arguments.

**M9.1 — the duplicate tunable.** `econ.occupationHostility` was defined twice, and the two
definitions carried different values: the M0.3 placeholder (`v: 1.0`, one-line doc) sat below the
argued M4 definition (`v: 1.6`, the full anti-snowball rationale), so the game shipped the
placeholder while every reader of `tunables.js`, `DESIGN.md` and the code review found 1.6. A
duplicate key in an object literal is not an error and leaves no trace once the literal collapses, so
the guard reads the SOURCE: `tests/tunables.test.js` fetches `js/tunables.js` as text, scans for
top-level keys, and cross-checks the count against `SCHEMA` so a scan that stopped matching would
fail rather than pass.

**M9.2 — the election clock.** `World.advanceTurn` calls `Elections.tick` with `asOf: turn + 1`;
`steal` and `pending` compared against `World.getTurn()`, still reading N inside the batch. Every AI
police state politely conceded, and the test that covered it passed because it called `tick` without
`asOf` — the one arrangement in which the two clocks agree, and one `js/world.js` has never used.
One helper, `isOpen(n, asOf)`. Measured through the live path with every government eligible: **222
elections over 60 turns, 32 changes of government, 32 refusals.** Before: zero, for any number of
turns.

**M9.3 — one expression, called twice.** `planAnnex` previewed reach × army; `resolveAnnex` rolled
shell × army. Neither had what the other had, so a war at the edge of reach was priced higher,
previewed as harder, and fought exactly as well as one next door. `plan.scoreMult` is now the single
expression and the resolver reads it. And `annex.strongNeighbourFactor` — the 4× untouchable rule —
moved out of `Actions.startAnnex`, which was its only enforcement, into `Moves`: the AI had been
playing by a looser rulebook than the human the rule was written for.

**M9.4 — panels that render the plan they resolve.** Unite charged 8% of the target's GDP on the
attempt and never said so; release charged a 10% settlement and showed only the savings; annex priced
through `annexCost` rather than the plan, understating the bill by up to 1.6× at the edge of reach.
All three now render `Moves.plan(...)`, refuse for every reason the resolver refuses, and name the
reason before the click. The annex panel gained two rows that had never existed: the reach surcharge
as a percentage, and the odds an army fights at out past its own projection.

**M9.5 — the victory alarm asks a different question.** It fired on turn 1 of every game — three
nations "84% of the way" before anybody had done anything — because `progress` is a condition's WORST
term and the worst term of two of three conditions is a power stock that opens near its target. It
now asks whether anybody has MOVED, gated on near + moving + not-said-lately, plus a grace gate
because `check` cannot return a winner before `win.graceTurns` anyway. `win.warnDelta` is **measured,
not chosen**: at seed 20260829 over 40 turns, 314 turn-to-turn moves among nations already past the
bar, median **+0.0127** — so the first threshold tried (0.01) was below the median and fired 143
times before turn 12 and 98 after. At **0.03** the same run reports three times.

**M9.6 — the Area re-bake, adopted.** D36 deferred it since M1.13b. `build/migrate_areas.py` carries
the authored map modes across by inheriting each new Area's region through its primary county — the
same rule the game uses for every other question about a merged Area. **1,676 Areas → 1,688** (11
retired, 23 new; 483 → 507 merge groups); of 1,688 assignments in each map mode, 1,665 kept their id
and 23 inherited, **none unassigned**. `economy.json` and `parties.json` re-baked in dependency
order. `build/validate.py`: **0 errors, 1 warning**, down from 0 and 2 — the 22-county blob is gone
and only the pre-2015 `county_neighbors.json` vintage remains. Determinism re-verified across three
`PYTHONHASHSEED` values. Save format is **version 3**; a version 2 document is refused by name.

**M9.7 — the journal.** `flash()` is one slot, and every action confirm flashed its result and then
called `completeTurn()`, which flashed the newspaper over it in the same frame — the civil-war dice
roll was painted for zero frames, every time. `js/journal.js` is a docked, turn-grouped, filterable
panel that reads the ledger and owns nothing: no state to serialize, because the ledger already
round-trips through the save. The newspaper stopped being a message that arrives and leaves; it is
the journal's turn header now. Only the victory alarm still interrupts.

**M9.8 — the sweep.** War weariness has its own rate limits, the other way up to the four stocks a
nation HAS (it inherited `maxFall > maxRise` and therefore tired slowly and recovered fast, which is
the intended asymmetry inverted). Migration's clamp conserves: `leaving` is capped at what is in the
buffer, the phase reports `clamped`, and the suite asserts it stays zero — the old one-sided
`Math.max(0, was + d)` did not lose people, it invented them. A load `replace`s TUNE overrides
instead of merging them.

### What the re-bake taught the suite

Seven tests failed on the new Area plan and **none of them was a regression** — but only two were
re-pins. The other five were tests making claims their measurements could not support:

- **Two were pinned to one seed.** An Area re-bake changes every movement's derived core, which
  changes how many draws seeding takes, which reshuffles the `spawn` stream. Measured across twelve
  seeds, 80 turns, no AI: **16 secessions before, 14 after; median first secession turn 29 both
  ways.** Individual seeds inverted completely (20260829 went 2 → 0 while seed 1 went 0 → 2). Both
  tests now read a seed set and assert the distribution.
- **One assumed an accident of the data.** `hostility` returns the strongest movement in an Area; the
  test compared it against Deseret's own share in Deseret's `core[0]`, which held only while Deseret
  happened to lead there. It tests the max now, over an Area chosen for having more than one
  movement in it.
- **One was measuring its own success away.** The corridor test read "mean Deseret share across the
  28 stay-behind Areas" as the proof that `growthRate` reaches the engine — and the faster rate makes
  the mean FALL, because it converts six more of those Areas into Deseret's territory and leaves the
  mean measuring the most stubborn residue (ten Areas rather than sixteen). The rate is measured on
  organised people (+261,467) and ground (49 Areas held against 42, 18 joined against 12); the boost
  keeps the mean, because a boost does not move borders.
- **The Texas partition table** is a genuine re-measure: 104 Texan Areas became 106, so Dallas holds
  23 rather than 22 and El Paso 17 rather than 16. The partition itself is unchanged — every Texan
  Area belongs to exactly one successor, the Oklahoma strays are still Oklahoma's, and the five still
  sum to 31.29M, which is the check that settles it whatever the merge plan is.

Learned, and worth keeping:
- **A measured number pinned to one seed is a claim with an expiry date.** Three of the seven
  failures were that, and the expiry was the next legitimate bake. Pin the distribution, record the
  seed's value in the comment so the next reader can tell a re-measure from a regression.
- **`content/cultural.json` is authored data that a bake reads.** `build_parties.py` expands
  homelands through it, so it is migrated BEFORE the parties bake, not after.
- Reading an ESM-bridged global (`StateDoc`, `GeoCT`) at the top level of a classic script is a
  load-time ReferenceError that takes the whole module with it — `boot-globals.js` is deferred.
  `js/app.js` documents this for `OLD_CT`; `js/saves.js` now hits it for `StateDoc.VERSION` and reads
  it through a function instead.
- The in-app browser's `read_console_messages` buffer survives navigation, and so does `SimData`'s
  cache: a measurement taken in a tab opened before a data change is a measurement of the old data.
  Open a fresh tab, and put a throwaway query string on the URL.

---

## M10 — the player who just arrived

**M10.0 — `app.js` split five ways.** 2,406 lines into `app.js` (store, boot, who you are),
`map.js`, `shell.js` (chrome and turn flow), `panels.js`, `format.js` — along the seams the file's
own comment banners already marked. Mechanical only: all 98 top-level declarations survive, none
duplicated, every function still a global in the shared classic-script scope. Done BEFORE M10's own
work, because M10 and M11 were about to add ~800 lines of renderer to it.

**M10.1 — the objectives screen.** Three victory conditions with live per-term progress, the binding
requirement named and explained, and who else is closest **per condition** rather than overall. Plus
a "How to read this game" reference **generated** from `TuneMeta.describe` and the `CONDITIONS`
table — hand-written copy about a tuned system goes stale on the first tuning pass and the player is
the last to find out. Reachable from the menu, and deliberately not gated on an in-flight action.

**M10.2 — progressive disclosure.** Every block keeps its headline; the Why rows fold. Measured on a
live turn-18 game: **15 blocks, 8 of 29 rows visible**, two marked as moved this turn. Two bugs found
and fixed in the doing: block ids were the whole label, so a block closed itself when the number in
its own title moved; and the fold caught **action buttons** — the diplomacy block's two, and the
recognition button, which had been hidden since M10.2 shipped. A control the player cannot see is a
control that does not exist.

**M10.3 — tooltips** on all eight map modes and all five stocks, from the same generated source as
the reference tab. One source, three surfaces.

## M11 — a world that trades back, and minds you winning

**M11.1 — trade is a Move.** The rules were in `js/actions.js`, so only the human could use them —
and `traded` is the only relations channel ordinary play generates, so the player had a monopoly on
building standing without taking anything from anybody. Measured over 60 turns: **2,022 AI trade
events across 71 actors**, against a human ceiling of 60.

**M11.2 — treaties and aid**, the two Influence verbs the design list reserved. A pact is the first
thing a nation can PROMISE — it sits on the board until broken, and breaking it costs more than
never signing (`rel.magReneged` -1.4 against `magTreatied` +0.18; the Influence term charges a breach
at 2.5 pacts). Aid buys standing, recognition odds, and a **patron** relationship that blends the
recipient's government lean toward the donor's in `phasePoliticalDrift` — capped at 0.35, decaying
8% a turn, scaled by the payment as a share of the RECIPIENT's income. That is the active lever
Ideological Dominance was missing, and it only worked once `ACTIONABLE` gained 'People holding your
ideology': before that a nation whose binding requirement was sway had no actionable goal at all.

**M11.3 — the denial layer.** Coalition threat read `size × (1 − influence)` and both non-conquest
victories keep Influence high by construction, so nothing ever formed against a nation quietly
winning. `coalition.wVictory` reads proximity directly and is deliberately not scaled by influence —
being liked is a defence against being feared for your size, not against being about to win. `ai.wDeny`
scores a move by what it does to the LEADER's binding requirement. Both wait for `win.graceTurns`,
which is what keeps "being big is not the crime" honest: on the opening board size and victory
proximity are the same number.

## M12 — the ground itself

Per-Area quality of life and civil liberties as Float32 columns in the FIELDS registry — the #1
structural gap in DESIGN.md §12. The shape is `national stock + what is true HERE` rather than a
second full formula, because the national stock already reads everything national and a per-Area
version that re-derived it could disagree with the panel.

Measured on a live turn-20 game: a **0.286 spread** of quality of life inside one nation whose
national stock reads 0.79. The pressure map has a gradient inside a border for the first time.

The garrison term took two goes. `Military.garrisonPressure` is national and there is no per-Area
garrison, so the first cut looked for a `Game.isGarrisoned` that does not exist — inventing a
mechanic to make a formula work. Troops go where the trouble is, so it lands in proportion to
`Game.hostility`, the quantity occupation upkeep is already priced on.

**Civil liberties are uniform until something makes them not be**, and that is the design rather than
a gap: quality of life varies everywhere because wealth does, liberties only vary where there is
occupation, self-rule or trouble. The first acceptance test asked a calm nation for a spread and got
none, correctly; it now tests the mechanism where it applies — ground a nation took is less free than
ground it had.

## M13.1 — the instrument

`js/telemetry.js` computes nothing; it collects. The ledger whole (with the `terms` that justify each
entry — which is what makes it telemetry rather than a score sheet), a per-turn series sampled as the
game is played, the player's own actions filtered out of the ledger, and the run's identity. Each of
M13's four questions has a field, including "did you see the secession coming" as the pressure
high-water mark inside the player's own ground, turn by turn.

**Difficulty is four TUNE override presets** — Gentle / Standard / Hard / Brutal — because a
difficulty setting here cannot be a damage multiplier and what there is instead is pacing. `standard`
is deliberately empty rather than a copy of the defaults. `?difficulty=` carries one by link.

**M13.2 and M13.3 are the human playtest itself and the retune that follows it — the milestone only
the author can run.** The instrument is built and exports; what it needs now is five to ten people.

### What these three milestones taught the suite

- **A test can assert an accident of the data.** The liberties acceptance test asked a calm nation for
  a spread; the hostility test compared `Game.hostility` against one movement's share in that
  movement's own core. Both passed for years because the data happened to agree with them.
- **A count bound can be a proxy the model outgrows.** `AI.sweep` legitimately plays more seats than
  the order has at either end, because a splinter inserts and a union removes DURING the sweep — the
  peak is not observable from outside. The test now asserts what "past the wrap" means: it stopped
  because it reached the player, and not because it ran out of patience.
- **A pinned byte count should be an arithmetic expression.** `st.n * (12*8 + 8 + 2 + 4*2)` says what
  the next field costs; `178928` says nothing anybody can derive.

## M13.2 — getting it to people who are not here

`docs/PLAYTEST.md` is the operational guide; this is what had to change to make it true.

**The playtest build is the browser build on a static host**, and everything works there — boot,
save, load, resume, export — with no install and no Python. Verified against `python -m http.server`,
a server with no `/api` at all, on a clean origin: 1,688 Areas, 60 nations, a named save round-tripped
through localStorage, and a reload resumed at turn 3 with 219 journal entries intact.

**One gap had to close first.** Manual Save/Load already fell back to localStorage; the live document
did not, so a tester who reloaded lost everything since their last deliberate Save. It falls back now,
with quota handled by trimming the journal in the stored copy rather than failing — the export still
carries the full ledger from memory.

**And one bug came out of testing it properly.** A static host answers `PUT /api/state` with **501**,
and `fetch` resolves on a 501; it only rejects on a network failure. The first fallback triggered on
`catch`, so on exactly the host a playtester would use it wrote nothing, silently, every turn, and
reported success. `r.ok`, not "it did not throw".

**A folder does not work and cannot be made to.** `boot-globals.js` is an ES module and every data
file is fetched — browsers block both over `file://`. `build/package_playtest.py` produces a folder
for a HOST instead: 75 files, 4.0 MB, 1.1 MB zipped, with `data/state.json` excluded by name and the
manifest checked against what `index.html` actually asks for.

**The play log** (`Telemetry.note`) records what the ledger cannot: turn durations, actions opened and
cancelled, refusals hit, map modes used, whether Objectives was ever opened, which Why rows were
expanded. `?playtest=1` says so in the game on the first turn, and the export dialog itemises the file
rather than claiming nothing personal is in it.

Learned: **the toast colour cannot tell a refusal from an announcement.** `warn` and `bad` are how the
game says no and also how it announces a scenario, an alarm and a breakaway — three of the first
eleven log entries in a test session were news. The caller marks announcements now (`{news: true}`),
five sites against thirty refusals.

Also learned, the dull way: **two test-runner tabs on one dev server race on `/api/state`**, and the
live-document round-trip test fails with somebody else's turn number. One suite at a time.
