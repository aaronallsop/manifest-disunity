/*
 * Movements — named regional factions, each of which HAS an ideology.
 *
 * A movement is not an ideology. The six ideologies (js/ideology.js) are the
 * political truth of a population; a movement is an organised faction *within*
 * one of them, with a homeland, a name and an agenda. `Deseret` is a movement
 * whose ideology is Conservative Nationalist; `Cascadian Separatists` is one
 * whose ideology is Democratic Socialist. That distinction is what lets the
 * model carry six symmetric axes-based ideologies while movements stay named,
 * regional and separately trackable.
 *
 * THE RECORD (M4.1):
 *
 *   { id, name, ideology, type, homeland[], core[], seed[],
 *     growthCap, goals[], sponsor, state }
 *
 *   homeland  every Area the movement CAN exist in. Geography defines where.
 *   core      the Areas it must ALL hold to declare (M4.3 tier 2). Derived in
 *             the bake as the smallest set holding 60% of the homeland's people,
 *             never fewer than three — a movement that declares the moment one
 *             Area turns is not a movement, it is a switch.
 *   seed      where it actually started, filled at setup. The difference between
 *             seed and homeland is the room the diffusion term has to work in.
 *   growthCap its own ceiling, replacing the single global one. This is what
 *             makes "the Anarcho-Capitalists are a nuisance" and "Deseret is a
 *             country in waiting" different facts rather than the same fact at
 *             different times.
 *   growthRate how FAST it gets there, as a multiplier on `sent.maxRise` (M8.2).
 *             Distinct from the cap, and the distinction is load-bearing: a
 *             seeded share erodes back toward the formula's target at
 *             `sent.maxFall` every turn, so "this region is angrier than
 *             anywhere else and getting angrier" cannot be said by planting a
 *             bigger number — that is a spike that decays. It needs a rate.
 *   state     latent -> rising -> armed -> declared -> realized.
 *
 * THE STATE MACHINE is a description, not a driver. It is derived each turn from
 * what the movement actually holds — peak sentiment, core coverage, whether it
 * has a nation — so it cannot disagree with the map. A state machine that is
 * *set* by events instead of *read* from them is one that goes stale the first
 * time an event is missed.
 *
 * SPAWN, ONCE, AT SETUP. Each movement rolls its chance, then takes a share of
 * every Area in its homeland. Those people move INTO the movement's ideology
 * from all the others, proportionally, so the Area's total is unchanged.
 * `area.mov[name]` records how many of that ideology's people are organised
 * under the movement's banner — a slice of `pop[ideologyOf(name)]`, never more.
 *
 * WHAT THIS REPLACED. Six hard-coded colour families and a `PARTY_GROUP` dict
 * that covered 6 of 16 baked parties, collapsing the other 10 into "yellow" and
 * reporting them as one pooled coalition. Coalition membership is now proximity
 * on the two axes, which needs no table at all.
 */
const Movements = (function () {
  let spawned = [];
  let coverage = {};      // name -> {authored, areas, unresolved[]}
  let ideologyOf = {};    // name -> ideology id, from the bake
  let defsById = {};      // name -> the authored definition
  let live = {};          // name -> the runtime record (homeland/core as AREAS)

  const ideologyIdOf = (name) => ideologyOf[name] || null;
  const ideologyIndexOf = (name) => Ideology.index(ideologyOf[name] || '');
  const colorOf = (name) => Ideology.colorAt(ideologyIndexOf(name));

  /** The five states a movement can be in, weakest first. */
  const STATES = ['latent', 'rising', 'armed', 'declared', 'realized'];

  /**
   * Resolve an authored county-FIPS list to the Areas the runtime actually has.
   *
   * data/parties.json is written in COUNTY fips, but Game.init collapses 483
   * Areas and DELETES the member records. Indexing by a raw member fips hits
   * nothing: 2,025 of 4,198 authored references (48.2%) used to no-op silently.
   * Game.areaIdOf is the alias that resolves it; several members map to the same
   * Area, so de-duplicate or one Area takes one roll per member county.
   *
   * `core` goes through here too, and for the same reason — a core list of raw
   * member fips would resolve to nothing and the movement could never declare.
   */
  function resolveAreas(fipsList) {
    const areas = [];
    const seen = new Set();
    const unresolved = [];
    for (const raw of fipsList || []) {
      const aid = Game.areaIdOf(raw);
      if (seen.has(aid)) continue;
      seen.add(aid);
      if (!Game.county[aid]) { unresolved.push(raw); continue; }
      areas.push(aid);
    }
    return { areas, unresolved };
  }

  /**
   * Seed the movements. `rng` is REQUIRED and explicit: spawn draws come from
   * the 'spawn' stream so that adding a die roll elsewhere cannot reshuffle
   * which movements appear.
   */
  function setup(defs, rng) {
    const r = rng.stream('spawn');
    spawned = [];
    coverage = {};
    ideologyOf = {};
    defsById = {};
    live = {};

    for (const [name, def] of Object.entries(defs || {})) {
      ideologyOf[name] = def.ideology || 'yellow';
      defsById[name] = def;
    }

    for (const [name, def] of Object.entries(defs || {})) {
      if (r.random() > (def.chance == null ? 0.5 : def.chance)) continue;
      const idx = ideologyIndexOf(name);
      if (idx < 0) {
        console.warn(`Movements: "${name}" has ideology "${def.ideology}", which is not in the table`);
        continue;
      }
      spawned.push(name);
      const [lo, hi] = def.share || [0.0, 0.2];
      const { areas, unresolved } = resolveAreas(def.counties);
      const core = resolveAreas(def.core).areas;
      coverage[name] = {
        authored: (def.counties || []).length, areas: areas.length, unresolved,
        ideology: def.ideology, core: core.length,
      };
      if (unresolved.length) {
        console.warn(`Movements: "${name}" lists ${unresolved.length} FIPS that resolve to no live Area`,
          unresolved.slice(0, 8));
      }

      /*
       * SEED THE CORE, NOT THE WHOLE HOMELAND.
       *
       * Setup used to plant every homeland Area at once, which meant a movement
       * began at its full geographic extent and the M4.2 diffusion term had
       * nowhere to carry it — measured over 60 turns, every movement's Area
       * count was unchanged from turn 0 (Deseret 41 -> 41, A Free Texas
       * 104 -> 104) while only the shares moved. `pull` was doing nothing
       * observable because there was nothing left to reach.
       *
       * A movement now starts where its people are — its core — and everything
       * else in the homeland is ground it has to win. That is what makes the
       * distinction between `seed` and `homeland` mean something, and it is what
       * a frontier needs in order to be a frontier.
       */
      const seed = [];
      for (const f of core) {
        const c = Game.county[f];
        let total = 0;
        for (let i = 0; i < c.pop.length; i++) total += c.pop[i];
        if (!total) continue;

        // The movement organises `x` of the Area, drawn proportionally from
        // every OTHER ideology and added to its own. The total is unchanged.
        const x = r.range(lo, hi);
        const want = x * total;
        let fromOthers = 0;
        for (let i = 0; i < c.pop.length; i++) if (i !== idx) fromOthers += c.pop[i];
        const take = Math.min(want, fromOthers);
        if (take > 0 && fromOthers > 0) {
          const k = 1 - take / fromOthers;
          for (let i = 0; i < c.pop.length; i++) if (i !== idx) c.pop[i] *= k;
          c.pop[idx] += take;
        }
        // Everyone the movement converted, plus a share of those already in its
        // ideology, march under its banner.
        const held = Math.min(c.pop[idx], take + (c.pop[idx] - take) * x);
        c.mov[name] = (c.mov[name] || 0) + held;
        if (held > 0) seed.push(f);
      }
      void areas; // resolved above for `coverage` and the homeland record

      live[name] = {
        id: def.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name,
        ideology: ideologyOf[name],
        type: def.type || 'ideological',
        homeland: areas,
        core,
        seed,
        growthCap: def.growthCap == null ? null : def.growthCap,
        growthRate: def.growthRate == null ? 1 : def.growthRate,
        goals: def.goals || [],
        sponsor: null,       // M6: a nation backing it
        nation: null,        // the nation it realised into, once it has one
        state: 'latent',
      };
    }
    clampMovements();
    /*
     * Seeding CONVERTED population between ideologies, so who is in power may
     * have changed. Announced here rather than left to the caller: `Game.init`
     * used to compute governments at the end of its own run, which is before
     * this function has moved anybody — and in Wisconsin, a 49.6/48.7 state, a
     * single movement seeding flipped the answer. A save round-trip then
     * disagreed with the live game about who governed.
     */
    Game.refreshGovernments();
    return spawned;
  }

  /**
   * The ceiling on a movement's share of one Area.
   *
   * Per movement, falling back to the global tunable for anything the bake did
   * not give a cap. One number per movement is the difference between a fringe
   * that stays fringe and a country in waiting.
   */
  function capOf(name, tune) {
    const rec = live[name];
    const t = tune || window.TUNE;
    return rec && rec.growthCap != null ? rec.growthCap : t.get('world.partyCeiling');
  }

  /**
   * How fast this movement organises, as a multiplier on `sent.maxRise`.
   *
   * 1.0 for everything the bake did not single out, so the world engine's rate
   * limit is unchanged for every movement but the one the design wanted moving
   * faster. It multiplies the RISE cap only: a movement that grows quickly still
   * loses ground at the same speed as everybody else, because organising being
   * slower than collapsing is a property of the model, not of a movement.
   */
  function rateOf(name) {
    const rec = live[name];
    const r = rec && rec.growthRate;
    return Number.isFinite(r) && r > 0 ? r : 1;
  }

  /**
   * What a movement currently holds, measured rather than remembered.
   *
   * @returns {{peak, mean, areas, coreHeld, coreTotal, people, top}}
   */
  function strength(name) {
    const rec = live[name];
    if (!rec) return null;
    let peak = 0, sum = 0, held = 0, people = 0, top = null;
    for (const f of rec.homeland) {
      const c = Game.county[f];
      if (!c) continue;
      const n = c.mov[name] || 0;
      if (n <= 0) continue;
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      const share = pop > 0 ? n / pop : 0;
      if (share > peak) { peak = share; top = f; }
      sum += share;
      held++;
      people += n;
    }
    let coreHeld = 0;
    const threshold = window.TUNE.get('secession.countyThreshold');
    for (const f of rec.core) {
      const c = Game.county[f];
      if (!c) continue;
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      if (pop > 0 && (c.mov[name] || 0) / pop >= threshold) coreHeld++;
    }
    return {
      peak, mean: held ? sum / held : 0, areas: held, people, top,
      coreHeld, coreTotal: rec.core.length,
    };
  }

  /**
   * Derive every movement's state from what it holds.
   *
   * READ, NOT SET. A state machine driven by events goes stale the first time an
   * event is missed — a movement whose nation is conquered would stay 'realized'
   * forever. Deriving it each turn from the map means it cannot disagree with
   * the map, and it costs one pass over each movement's homeland.
   *
   *   realized  it has a nation on the board
   *   declared  every Area in its core is over the secession threshold
   *   armed     its peak Area is over the threshold
   *   rising    its peak Area is over the rising mark
   *   latent    otherwise
   */
  function refreshStates(tune) {
    const t = tune || window.TUNE;
    const armed = t.get('secession.countyThreshold');
    const rising = t.get('secession.risingThreshold');
    for (const name of spawned) {
      const rec = live[name];
      if (!rec) continue;
      if (rec.nation && Game.getNation(rec.nation)) { rec.state = 'realized'; continue; }
      rec.nation = null;
      const s = strength(name);
      if (!s) { rec.state = 'latent'; continue; }
      /*
       * A MOVEMENT DECLARES WHEN IT HOLDS ITS HEARTLAND, not when it holds every
       * last piece of it.
       *
       * This tested `coreHeld === coreTotal`, an AND across the whole core, and
       * it survived four milestones because nothing could disturb a core: the
       * world engine pushed sentiment up and only up. The M6.3 AI defeated it
       * outright — one annexed core Area, whose new owner's authority and
       * liberties pull its sentiment back under the line, holds the whole
       * movement latent forever. Measured at seed 7: two declarations over forty
       * turns without an AI, zero with one.
       *
       * IT SHIPS AT 1.0 ANYWAY, which is the original rule, because loosening it
       * turned out to be the wrong lever: a movement's core is SEEDED over the
       * threshold at setup, so at 0.7 the Cascadian Separatists declared on turn
       * ZERO with 163 Areas — the all-or-nothing test was the only thing between
       * the opening position and an instant secession. The declaration drought
       * was fixed where it was actually caused (unite and release were free, so
       * the AI churned every border), and declarations came back at turns 39-44
       * across three seeds with this at 1.0. The knob stays because the
       * fragility is real and a future tuning pass should be able to reach it.
       */
      const need = Math.max(1, Math.ceil(s.coreTotal * t.get('secession.coreShare')));
      if (s.coreTotal > 0 && s.coreHeld >= need) rec.state = 'declared';
      else if (s.peak >= armed) rec.state = 'armed';
      else if (s.peak >= rising) rec.state = 'rising';
      else rec.state = 'latent';
    }
  }

  /**
   * Keep every `mov[name]` a valid slice of its ideology's head count.
   *
   * Drift, growth and war all move `pop[i]` without knowing about movements, so
   * this is the reconciliation step: if the movements inside one ideology add up
   * to more than that ideology holds, scale them down proportionally.
   */
  function clampMovements() {
    const N = Ideology.count();
    for (const f in Game.county) {
      const c = Game.county[f];
      let any = false;
      for (const m in c.mov) { any = true; break; }
      if (!any) continue;
      const byIdeology = new Array(N).fill(0);
      for (const m in c.mov) {
        const i = ideologyIndexOf(m);
        if (i >= 0) byIdeology[i] += c.mov[m];
        else delete c.mov[m];
      }
      for (let i = 0; i < N; i++) {
        if (byIdeology[i] <= c.pop[i]) continue;
        const k = c.pop[i] / byIdeology[i];
        for (const m in c.mov) if (ideologyIndexOf(m) === i) c.mov[m] *= k;
      }
      for (const m in c.mov) if (!(c.mov[m] > 0)) delete c.mov[m];
    }
  }

  /*
   * The runtime record is serialized, not just the roster.
   *
   * `state` is derived and could be recomputed, but `nation` and `sponsor` are
   * not — they are decisions the game made — and `seed` is a fact about a roll
   * that will never happen again. Homeland and core resolve from the bake, so
   * they are rebuilt on load rather than stored twice.
   */
  const serialize = () => ({
    spawned: spawned.slice(),
    ideologyOf: { ...ideologyOf },
    live: Object.fromEntries(spawned.map((n) => {
      const r = live[n] || {};
      return [n, { seed: (r.seed || []).slice(), nation: r.nation || null,
                   sponsor: r.sponsor || null, state: r.state || 'latent' }];
    })),
  });

  function loadState(snap) {
    if (Array.isArray(snap)) { spawned = snap.slice(); return; } // tolerate the older shape
    spawned = (snap && Array.isArray(snap.spawned)) ? snap.spawned.slice() : [];
    if (snap && snap.ideologyOf) ideologyOf = { ...snap.ideologyOf };
    if (snap && snap.live) {
      for (const [name, saved] of Object.entries(snap.live)) {
        const def = defsById[name];
        // A document can name a movement this build's bake no longer defines.
        if (!def) continue;
        live[name] = {
          ...(live[name] || {}),
          id: def.id || name,
          name,
          ideology: ideologyOf[name] || def.ideology,
          type: def.type || 'ideological',
          homeland: resolveAreas(def.counties).areas,
          core: resolveAreas(def.core).areas,
          growthCap: def.growthCap == null ? null : def.growthCap,
          growthRate: def.growthRate == null ? 1 : def.growthRate,
          goals: def.goals || [],
          seed: (saved.seed || []).slice(),
          nation: saved.nation || null,
          sponsor: saved.sponsor || null,
          state: saved.state || 'latent',
        };
      }
    }
  }

  return {
    setup,
    getSpawned: () => spawned,
    getCoverage: () => coverage,
    getDefinition: (name) => defsById[name] || null,
    /** The runtime record: homeland and core as AREAS, plus state. */
    get: (name) => live[name] || null,
    all: () => spawned.map((n) => live[n]).filter(Boolean),
    STATES,
    strength,
    refreshStates,
    capOf,
    rateOf,
    resolveAreas,
    clampMovements,
    ideologyIdOf,
    ideologyIndexOf,
    colorOf,
    serialize,
    loadState,
  };
})();

/* The module was called `Parties` while politics was D/R/Other plus a bag of
   named parties. It is `Movements` now, because that is what these are. */
const Parties = Movements;
