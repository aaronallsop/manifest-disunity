/*
 * The headless simulator: run N turns from a seed and report a series.
 *
 *   Sim.run({ seed, turns, tune, sample }) -> { series[], events[], summary }
 *
 * This is what M0.3's seeded RNG and M2.3's cheap `clone()` were for. A run of
 * 50 turns takes about 600 ms, which is the whole reason the dashboard can
 * recompute on a slider drag rather than asking you to wait.
 *
 * IT DRIVES THE REAL GAME, not a copy of it. `Sim.run` boots the same
 * `Game.init` the page boots and calls the same `World.advanceTurn` the Pass
 * button calls — which is the only arrangement in which tuning the simulator
 * tunes the game. A second lightweight model that "captures the essentials"
 * would be a fourth implementation of the world after the model, the tests and
 * the explanation layer, and it would be the one everybody trusted.
 *
 * WHAT IT SAMPLES, and why these:
 *   - the four power stocks, spread across nations — the M3 death-spiral watch
 *   - movement peak and reach — is anything actually spreading?
 *   - nations, and the count of secessions — the M4 fragmentation rate, which is
 *     the first number the West needs tuned against
 *   - within-nation political spread — the M1.6 collapse watch, which stays
 *     watched because every later phase pulls on it
 *
 * A series is per TURN, not per nation per turn: 80 turns x 51 nations x 8
 * values is 32,000 points to chart, and what a tuning pass needs is the shape of
 * the distribution, not every line in it. Min / median / max per turn says
 * "something is spiralling" and "everything is converging" equally well, and
 * both of those are what a runaway looks like.
 */
const Sim = (function () {
  /** min / median / max of an array, in one pass over a sorted copy. */
  function band(values) {
    if (!values.length) return { min: 0, med: 0, max: 0 };
    const v = values.slice().sort((a, b) => a - b);
    return { min: v[0], med: v[(v.length / 2) | 0], max: v[v.length - 1] };
  }

  /** The row a single turn contributes to the series. */
  function sample(turn) {
    const auth = [], infl = [], qol = [], lib = [];
    for (const [, n] of Game.nations) {
      if (Number.isFinite(n.authority)) auth.push(n.authority);
      if (Number.isFinite(n.influence)) infl.push(n.influence);
      if (Number.isFinite(n.qol)) qol.push(n.qol);
      if (Number.isFinite(n.liberties)) lib.push(n.liberties);
    }

    const peaks = [], reach = [];
    let organised = 0, people = 0;
    for (const rec of Movements.all()) {
      const s = Movements.strength(rec.name);
      if (!s) continue;
      peaks.push(s.peak);
      reach.push(rec.homeland.length ? s.areas / rec.homeland.length : 0);
      organised += s.people;
    }
    for (const f in Game.county) people += Game.countyPop(f);

    /*
     * Within-nation political spread: the standard deviation of the leading
     * ideology's share across a nation's Areas, medianed over nations. M1.6
     * measured this collapsing with a 23-turn half-life and fixed it; every
     * phase added since pulls on the same grid, so it stays watched.
     */
    const spreads = [];
    for (const [, n] of Game.nations) {
      if (n.counties.size < 4) continue;
      const shares = [];
      for (const f of n.counties) {
        const c = Game.county[f];
        let pop = 0;
        for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
        if (pop <= 0) continue;
        const d = Ideology.dominantIndex(c.pop);
        if (d >= 0) shares.push((c.pop[d] / pop) * 100);
      }
      if (shares.length < 4) continue;
      const mean = shares.reduce((a, b) => a + b, 0) / shares.length;
      const varc = shares.reduce((a, x) => a + (x - mean) * (x - mean), 0) / shares.length;
      spreads.push(Math.sqrt(varc));
    }

    const states = {};
    for (const rec of Movements.all()) states[rec.state] = (states[rec.state] || 0) + 1;

    return {
      turn,
      nations: Game.nations.size,
      authority: band(auth), influence: band(infl), qol: band(qol), liberties: band(lib),
      movementPeak: band(peaks), movementReach: band(reach),
      organisedPct: people > 0 ? (organised / people) * 100 : 0,
      politicalSpread: band(spreads).med,
      states,
      declared: Ledger.ofKind('declare').length,
      defected: Ledger.ofKind('defect').length,
      died: Ledger.ofKind('died').length,
    };
  }

  /**
   * Run the world forward and sample it.
   *
   * @param opts {seed, turns, tune, overrides, onTurn}
   *   `overrides` is a flat {key: value} applied to a CLONE of the tunables, so
   *   a dashboard slider can explore without changing the game the player is
   *   in — the single most important property for a tool you use while playing.
   * @returns {Promise<{series, summary, seed, turns}>}
   */
  async function run(opts = {}) {
    const seed = opts.seed == null ? 20260829 : opts.seed;
    const turns = opts.turns == null ? 50 : opts.turns;

    const raw = await SimData.load();

    /*
     * A CLONE, never the live TUNE: exploring must not mutate the session.
     * Layered the way the game layers them — schema defaults, then the authored
     * overrides in content/tunables.json, then whatever this run is exploring —
     * so a slider is always measured against the tuning that actually ships.
     */
    const tune = TuneMeta.createTune ? TuneMeta.createTune() : window.TUNE;
    if (raw.tunables) tune.load(raw.tunables.values || raw.tunables);
    if (opts.overrides) tune.load(opts.overrides);
    const rng = RNG.create(seed);
    Game.reset();
    Ledger.reset();
    Relations.reset();
    Coalitions.reset();
    Colors.reset();
    World.setTurn(0);
    Market.loadState(null);
    Ideology.load(raw.ideologies);
    Colors.assign(Object.keys(raw.data.states));
    Game.init(raw.data, raw.adjacency, raw.areas,
      { trade: raw.trade, transport: raw.transport, culture: raw.culture });
    if (raw.capitals) Victory.load(raw.capitals);
    Movements.setup(raw.partyDefs, rng);
    MapModes.init(raw.data);
    if (raw.economy) { MapModes.setEconomy(raw.economy); Market.update(tune); }
    TurnSystem.begin([...Game.nations.keys()], rng);
    World.begin(tune);

    /*
     * `ai: false` runs the world with every nation passing.
     *
     * The default is to PLAY, because a dashboard that measures a world nobody
     * plays measures the wrong world. But some questions are about the world
     * ENGINE and the AI is a confound in them rather than the subject — the
     * M5.3 pacing verdicts are about how fast sentiment moves, and fifty nations
     * annexing each other while you ask is noise. Those callers say so, in the
     * call, which is also how the suite got back the four minutes it had spent
     * simulating an AI it was not asking about.
     */
    const prevPolicy = opts.ai === false ? AI.setPolicy(AI.pass) : null;
    try {
    const series = [sample(0)];
    for (let t = 1; t <= turns; t++) {
      /*
       * A ROUND, not a world tick. `AI.round` plays every seat and lets
       * `TurnSystem.advance` take the world over the wrap — the same clock the
       * Pass button drives. Stepping `World.advanceTurn` directly, which is what
       * this did until M6.3, measured a map on which no nation ever chose
       * anything.
       */
      AI.round(tune, rng);
      series.push(sample(t));
      if (opts.onTurn) await opts.onTurn(t, series[series.length - 1]);
    }

    return { seed, turns, series, summary: summarise(series), events: Ledger.all().slice() };
    } finally { if (prevPolicy) AI.setPolicy(prevPolicy); }
  }

  /**
   * The verdicts a tuning pass actually reads, computed rather than eyeballed.
   *
   * Each is a question the milestones already asked, so the simulator answers
   * them the same way every run instead of leaving it to whoever is looking at
   * the graph.
   */
  function summarise(series) {
    const first = series[0], last = series[series.length - 1];
    const firstDeclare = series.find((s) => s.declared > 0);
    return {
      turns: last.turn,
      nations: `${first.nations} -> ${last.nations}`,
      secessions: last.declared,
      firstSecessionTurn: firstDeclare ? firstDeclare.turn : null,
      defections: last.defected,
      nationsLost: last.died,
      // The anti-death-spiral watch: does anything sit on the floor?
      authorityFloor: Math.min(...series.map((s) => s.authority.min)),
      influenceFloor: Math.min(...series.map((s) => s.influence.min)),
      // The M1.6 watch: does the Area grid survive?
      spread: `${first.politicalSpread.toFixed(1)} -> ${last.politicalSpread.toFixed(1)}`,
      spreadCollapsed: last.politicalSpread < first.politicalSpread * 0.4,
      organised: `${first.organisedPct.toFixed(1)}% -> ${last.organisedPct.toFixed(1)}%`,
      // Is anything spreading, and is anything failing to?
      reachSpan: `${(last.movementReach.min * 100).toFixed(0)}%-${(last.movementReach.max * 100).toFixed(0)}%`,
      states: last.states,
    };
  }

  return { run, sample, band, summarise };
})();

/*
 * The data the simulator boots from, fetched once per page.
 *
 * Deliberately the same files and the same `cache: 'no-store'` the game uses,
 * so a simulator run and a played game cannot disagree about what the world is
 * made of — the D38 lesson, which cost hours the one time the two diverged.
 */
const SimData = (function () {
  let promise = null;
  function load() {
    if (promise) return promise;
    const get = (path, fallback) =>
      fetch(path, { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : fallback))
        .catch(() => fallback);
    /*
     * ABSOLUTE paths. The simulator is driven from `/dev.html` and from
     * `/tests/run.html`, and a relative path resolves against the page — so the
     * suite silently fetched `/tests/data/game-data.json`, got a 404, took the
     * fallback and then threw on `raw.data.states`. Absolute is the only form
     * that means the same thing from both.
     */
    promise = Promise.all([
      get('/data/game-data.json'), get('/data/adjacency.json'), get('/data/areas.json', null),
      get('/data/parties.json', {}), get('/data/economy.json', null),
      get('/data/county_trade.json', null), get('/data/transport.json', null),
      get('/content/cultural.json', null), get('/content/ideologies.json', null),
      get('/content/tunables.json', null), get('/content/capitals.json', null),
    ]).then(([data, adjacency, areas, partyDefs, economy, trade, transport, culture,
              ideologies, tunables, capitals]) =>
      ({ data, adjacency, areas, partyDefs, economy, trade, transport, culture,
         ideologies, tunables, capitals }));
    return promise;
  }
  return { load };
})();
