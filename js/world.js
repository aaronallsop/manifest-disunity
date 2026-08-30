/*
 * World turn engine. Advances the WORLD, kept separate from player/AI actions
 * (those go through TurnSystem / Actions). advanceTurn() runs the world-update
 * phases in a FIXED order, then increments the world turn counter.
 *
 * ONE CLOCK. advanceTurn() is driven from completeTurn() at the round boundary —
 * the moment a full cycle of nation turns finishes. There used to be two growth
 * models on two unrelated clocks: Game.growAll(5%) at the round boundary (which
 * grew GDP) and phasePopulationGrowth(1%) which ran only when a human clicked
 * "Advance world" (and did not grow GDP at all). A player who never noticed the
 * button played a game where nothing in this file ever ran; a player who did
 * could click it two hundred times during Alabama's turn. growAll is gone, and
 * the button is a dev control.
 *
 * Per-turn update discipline: every phase reads this turn's start-of-turn values
 * from `snap` (a frozen copy) and writes into `nxt` (a fresh copy); `nxt` is
 * swapped back into the live records at the end. The precise contract, because
 * the loose version of this sentence has already misled once:
 *
 *   - No phase reads back a value IT wrote. That is the invariant that stops
 *     feedback compounding inside one turn.
 *   - Every cross-county AGGREGATE (nation leans, nation totals) is computed
 *     from `snap`, never from partially-updated values.
 *   - Per-county values DO compose down the pipeline: a later phase sees an
 *     earlier phase's per-county result in `nxt`. That is deliberate, and it is
 *     noted at each site that relies on it.
 *   - OWNERSHIP is snapshotted too (`owners`). It is immutable today because no
 *     phase moves a county, but M4's continuous county defection changes that,
 *     and a phase reading live ownership mid-turn would see its predecessor's
 *     moves.
 *
 * Each phase takes `tune` explicitly so the M5 simulator can run one against a
 * modified tunable set without touching the live game.
 */
const World = (function () {
  let turn = 0;

  // Tunables come in per call; the live game passes the session TUNE.
  const T = (tune) => tune || window.TUNE;
  /**
   * A turn buffer: the columnar Area state plus the movement bags.
   *
   * `snap` and `nxt` used to be two objects of 1,676 records each, rebuilt every
   * turn, and every phase walked them with `for (const f in nxt)` and looked
   * neighbours up by FIPS string. Measured, that is not where the time went —
   * the snapshot itself was 1.9 ms of a 24.7 ms turn — but the STRING KEYS
   * were: `phasePoliticalDrift` alone was 8.0 ms of the 12.4 ms the six phases
   * cost between them, and what it spends it on is 9,454 hashed lookups of
   * `snap[neighbourFips]` per turn plus an aliased `Game.anchorOf(f)` per Area.
   *
   * So a buffer is now the columns (one `.slice()` each) and one array of
   * movement bags indexed by node, and every phase is an integer loop over the
   * same node numbering the graph uses. `mov` stays a sparse name->count object
   * per Area until M4 replaces it with the (Area x movement) sentiment matrix,
   * at which point it becomes another column and this comment gets shorter.
   */
  function buffer() {
    const area = Game.state().clone();
    const mov = new Array(area.n);
    for (let i = 0; i < area.n; i++) mov[i] = { ...Game.county[area.idAt(i)].mov };
    return {
      n: area.n, area, mov,
      pop: area.pop, gdp: area.gdp, anchor: area.anchor,
      idAt: (i) => area.idAt(i),
      indexOf: (id) => area.indexOf(id),
    };
  }

  /**
   * Owning nation INDEX per Area node, frozen for one world turn.
   *
   * Ownership is immutable today because no phase moves an Area, but M4's
   * continuous defection changes that, and a phase reading live ownership
   * mid-turn would see its predecessor's moves.
   */
  function snapshotOwners() {
    return Game.state().owner.slice();
  }

  /** Total population of one Area in a buffer. */
  function bufPop(buf, i, N) {
    const base = i * N;
    let t = 0;
    for (let k = 0; k < N; k++) t += buf.pop[base + k];
    return t;
  }

  /** Total population of a snapshot/next record, for the record-shaped callers. */
  const recPop = (c) => {
    let t = 0;
    for (let i = 0; i < c.pop.length; i++) t += c.pop[i];
    return t;
  };

  /**
   * Movement name -> ideology index, resolved once per phase rather than once
   * per (Area, movement) pair. `Movements.ideologyIndexOf` is a two-map walk and
   * the inner loops hit it about 30,000 times a turn.
   */
  function movementIdeologies() {
    const out = Object.create(null);
    for (const name of Movements.getSpawned()) out[name] = Movements.ideologyIndexOf(name);
    return out;
  }

  /**
   * Each nation's ideology SHARES (percent), from the start-of-turn snapshot,
   * indexed by nation index. Drift reads this cache, never a mix influenced by
   * already-drifted Areas.
   *
   * This replaced `phaseRecomputeLeans`, which produced a {d,g,o} triple and a
   * D-or-R letter that ignored every emergent movement.
   */
  function phaseRecomputeMixes(snap, nxt, owners) {
    const own = owners || snapshotOwners();
    const N = Ideology.count();
    const totals = [];
    for (let i = 0; i < snap.n; i++) {
      const o = own[i];
      if (o < 0) continue;
      let t = totals[o];
      if (!t) t = totals[o] = new Float64Array(N);
      const base = i * N;
      for (let k = 0; k < N; k++) t[k] += snap.pop[base + k];
    }
    const out = [];
    for (let o = 0; o < totals.length; o++) if (totals[o]) out[o] = Ideology.shares(totals[o]);
    return out;
  }

  /*
   * Ease each Area toward a BLENDED target, over all six ideologies:
   *
   *   target = ownerWeight     * the owner nation's ideology shares
   *          + anchorWeight    * the Area's own founding character
   *          + neighbourWeight * the population-weighted mean of its neighbours
   *
   * new% = old% + driftStep * (target% - old%), then bounded noise, then
   * renormalise. Moves people BETWEEN ideologies; the Area's total is unchanged.
   *
   * WHY IT IS NOT JUST THE OWNER'S MIX. It used to be. Drift pulled every Area
   * toward its nation's mix and population growth added new residents in that
   * same mix, so both forces pulled toward ONE attractor and nothing pushed
   * back. Measured per-turn deviation multiplier 0.9703, half-life 23 turns:
   * within-nation stdev of the leading share went 12.5 -> 2.5 by turn 50, and
   * nations in which every Area shared one leading ideology went 10/51 -> 51/51.
   * Since Area-level politics is factor #1 of the sentiment model M4.2 builds,
   * that collapse leaves two-tier secession nothing to differentiate.
   *
   * Three counter-forces, each doing a different job:
   *   - the ANCHOR gives every Area its own fixed point, so the equilibrium is a
   *     spread rather than a single value;
   *   - the NEIGHBOUR term makes that spread spatially smooth, so what survives
   *     is a gradient a movement can diffuse along rather than salt-and-pepper;
   *   - the NOISE gives the deviation a non-zero stationary variance instead of
   *     a fixed point it converges onto exactly.
   *
   * This is the most expensive phase in the game by a factor of eight, and the
   * reason is the neighbour term: it is the only phase that reads Areas other
   * than the one it is writing. Walking the CSR rows takes it from 8.0 ms to
   * the numbers in PROGRESS.md.
   */
  function phasePoliticalDrift(snap, nxt, mixes, tune, owners, rng) {
    const tn = T(tune);
    const step = tn.get('world.driftStep');
    const wOwner = tn.get('world.driftOwnerWeight');
    const wAnchor = tn.get('world.driftAnchorWeight');
    const wNbr = Math.max(0, 1 - wOwner - wAnchor);
    const noise = tn.get('world.driftNoise') * 100; // the tunable is a share; these are percent
    const jitter = rng ? rng.stream('drift') : null;
    const own = owners || snapshotOwners();
    const N = Ideology.count();
    const g = Game.graph();
    const start = g.start, list = g.list;
    const nbrMix = new Float64Array(N);
    const cur = new Float64Array(N);

    for (let f = 0; f < nxt.n; f++) {
      const o = own[f];
      const lean = o >= 0 ? mixes[o] : null;
      if (!lean) continue;
      const base = f * N;
      let pop = 0;
      for (let k = 0; k < N; k++) pop += snap.pop[base + k];
      if (!pop) continue;

      // Neighbour mean, population-weighted, read from SNAP so the gradient is
      // computed against start-of-turn values and phase order cannot skew it.
      let nw = 0;
      nbrMix.fill(0);
      if (wNbr > 0) {
        for (let e = start[f]; e < start[f + 1]; e++) {
          const nb = list[e] * N;
          for (let k = 0; k < N; k++) { const v = snap.pop[nb + k]; nbrMix[k] += v; nw += v; }
        }
      }
      const hasNbr = nw > 0;
      // With no neighbours on file the neighbour weight falls back to the owner
      // rather than silently biasing the target toward zero.
      const wO = wOwner + (hasNbr ? 0 : wNbr);

      let tot = 0;
      for (let k = 0; k < N; k++) {
        const target = wO * lean[k]
          + wAnchor * snap.anchor[base + k]
          + (hasNbr ? wNbr * (nbrMix[k] / nw) * 100 : 0);
        let v = (snap.pop[base + k] / pop) * 100;
        v += step * (target - v);
        if (jitter && noise > 0) v = Math.max(0, v + (jitter.random() * 2 - 1) * noise);
        cur[k] = v;
        tot += v;
      }
      if (!tot) continue;
      for (let k = 0; k < N; k++) nxt.pop[base + k] = (cur[k] / tot) * pop;
    }
  }

  /*
   * SENTIMENT: what share of each Area each movement holds, and why.
   *
   *   target = clamp01( base * (grievance + pull) - suppression )
   *
   * This replaced `phaseMovementGrowth`, which closed a fixed fraction of the
   * gap to a fixed ceiling — so every movement in every Area climbed the same
   * curve toward the same number, and the only thing that distinguished Deseret
   * from the Anarcho-Capitalists was where each had been planted. Nothing about
   * how a place was governed changed anything, and nothing spread.
   *
   * Three properties carry the design:
   *
   *   BASE IS MULTIPLICATIVE. An Area that does not share the ideology cannot be
   *   radicalised into that movement no matter how badly it is governed —
   *   *geography defines where a movement can exist; ideology defines how strong
   *   it is there*. Additive grievance would let bad government alone produce any
   *   movement anywhere, collapsing twenty-four regional factions into one
   *   national discontent meter.
   *
   *   PULL IS THE DIFFUSION TERM, and it is the whole reason a movement can now
   *   reach an Area it was never seeded in. Read from the CSR graph and from
   *   SNAP, never from `next`: reading `next` would let a movement spread across
   *   the whole map in one turn in whatever order the loop happened to run.
   *
   *   THE CHANGE IS RATE-LIMITED, NOT THE VALUE — the same discipline as the
   *   power stocks, and the specific fix for a runaway spiral. A region takes
   *   years to turn.
   *
   * SENTIMENT IS THE SHARE ITSELF. `mov[name]` is the head count a movement has
   * organised and its share of the Area is exactly what sentiment means; keeping
   * both would be two representations of one fact needing two stacked rate
   * limits. So this phase moves `mov` toward the target and the save carries
   * nothing new.
   *
   * People converted into a movement come from the ideologies it does NOT belong
   * to, so the Area's total is unchanged and `mov` stays a valid slice of
   * `pop[ideologyOf(name)]`.
   */
  function phaseSentiment(snap, nxt, tune, owners, ctx) {
    const tn = T(tune);
    const rise = tn.get('sent.maxRise');
    const fall = tn.get('sent.maxFall');
    const floor = tn.get('sent.floor');
    const N = Ideology.count();
    const ideologyOf = movementIdeologies();
    const sctx = ctx || Sentiment.context(owners, tn);
    const movements = sctx.movements;
    if (!movements.length) return;

    const own = owners || snapshotOwners();
    const g = Game.graph();
    const start = g.start, list = g.list;
    const gain = new Float64Array(N);

    /*
     * Neighbour shares are read from SNAP for every (Area, movement) pair before
     * anything is written, which is what makes the diffusion order-independent.
     * One pass over the graph rather than one per movement.
     */
    const M = movements.length;
    const share = new Float64Array(nxt.n * M);   // snap share, per Area per movement
    const pops = new Float64Array(nxt.n);
    for (let f = 0; f < nxt.n; f++) {
      const base = f * N;
      let pop = 0;
      for (let k = 0; k < N; k++) pop += snap.pop[base + k];
      pops[f] = pop;
      if (pop <= 0) continue;
      const sMov = snap.mov[f];
      for (let m = 0; m < M; m++) {
        const held = sMov[movements[m]];
        if (held) share[f * M + m] = held / pop;
      }
    }

    for (let f = 0; f < nxt.n; f++) {
      const o = own[f];
      const nation = o >= 0 ? sctx.byNation[o] : null;
      if (!nation) continue;
      const base = f * N;
      let pop = 0;
      for (let k = 0; k < N; k++) pop += nxt.pop[base + k];
      if (pop <= 0) continue;

      const dominant = Ideology.dominantIndex(snap.pop.subarray(base, base + N));
      if (dominant < 0) continue;
      const affinities = sctx.affinity[dominant];
      const occupied = sctx.occupied ? sctx.occupied[f] : 0;

      gain.fill(0);
      let totalGain = 0;
      const nMov = nxt.mov[f];

      for (let m = 0; m < M; m++) {
        const name = movements[m];
        const rec = sctx.homelands[m];
        // Geography first: a movement cannot appear outside its homeland at all,
        // whatever the pull from across the border says.
        if (rec && !rec.has(f)) { if (nMov[name]) delete nMov[name]; continue; }

        let neighbourSum = 0;
        for (let e = start[f]; e < start[f + 1]; e++) neighbourSum += share[list[e] * M + m];

        const want = Sentiment.target({
          base: affinities[m],
          qol: nation.qol,
          liberties: nation.liberties,
          nationPower: nation.power,
          authority: nation.authority,
          neighbourSum,
          occupied,
          cap: sctx.caps[m],
        }, tn).value;

        const cur = share[f * M + m];
        const delta = want - cur;
        let next = cur + (delta > 0 ? Math.min(delta, rise) : Math.max(delta, -fall));
        if (next < floor) next = 0;

        if (next <= 0) { if (nMov[name]) delete nMov[name]; continue; }
        const i = ideologyOf[name];
        if (i === undefined || i < 0) { delete nMov[name]; continue; }
        const grow = Math.max(0, next - cur);
        if (grow > 0) { gain[i] += grow; totalGain += grow; }
        nMov[name] = next * pop;
      }

      // Convert the growth out of the ideologies none of the growing movements
      // belong to, so the Area's total is unchanged.
      if (totalGain > 0) {
        let donor = 0;
        for (let k = 0; k < N; k++) if (!gain[k]) donor += nxt.pop[base + k];
        const take = Math.min(totalGain * pop, donor);
        if (take > 0 && donor > 0) {
          const scale = 1 - take / donor;
          for (let k = 0; k < N; k++) {
            if (gain[k]) nxt.pop[base + k] += take * (gain[k] / totalGain);
            else nxt.pop[base + k] *= scale;
          }
        }
      }
    }
  }

  /*
   * Grow each Area by `world.popGrowth`. The new residents arrive in a blend of
   * the OWNER NATION's ideology mix and the Area's own.
   *
   * The national pull is PARTIAL (`world.growthMixNationWeight`). At 1.0 this
   * phase is a second attractor pulling at exactly the same fixed point as
   * political drift, with nothing opposing either — which is half of why the
   * Area grid collapsed into a nation-level scalar.
   *
   * Movements grow with their ideology, so a movement's members reproduce like
   * everyone else. Omitting them (which is what happened when they lived in a
   * separate `ext` bag) meant realised growth was 0.93%/turn rather than the
   * declared 1%, and every movement was diluted toward a common equilibrium of
   * 0.278 instead of its own ceiling — so movements meant to be playable
   * factions with regional variation all ended up numerically identical.
   */
  function phasePopulationGrowth(snap, nxt, tune, owners) {
    const tn = T(tune);
    const r = tn.get('world.popGrowth');
    const wNat = tn.get('world.growthMixNationWeight');
    const own = owners || snapshotOwners();
    const N = Ideology.count();
    const ideologyOf = movementIdeologies();

    // owner index -> {mix[N], total}, from this turn's snapshot
    const natMix = [], natTotal = [];
    for (let f = 0; f < snap.n; f++) {
      const o = own[f];
      if (o < 0) continue;
      let m = natMix[o];
      if (!m) { m = natMix[o] = new Float64Array(N); natTotal[o] = 0; }
      const base = f * N;
      for (let k = 0; k < N; k++) { const v = snap.pop[base + k]; m[k] += v; natTotal[o] += v; }
    }

    const share = new Float64Array(N);
    for (let f = 0; f < nxt.n; f++) {
      const o = own[f];
      const m = o >= 0 ? natMix[o] : null;
      if (!m || !natTotal[o]) continue;
      // per-Area counts from nxt (post-drift, post-movement, so phases compose);
      // the nation mix still comes from snap.
      const base = f * N;
      let here = 0;
      for (let k = 0; k < N; k++) here += nxt.pop[base + k];
      if (!here) continue;
      const growth = here * r;
      const tot = natTotal[o];
      for (let k = 0; k < N; k++) {
        share[k] = wNat * (m[k] / tot) + (1 - wNat) * (nxt.pop[base + k] / here);
        nxt.pop[base + k] += growth * share[k];
      }
      // Movements keep their share of their own ideology.
      const nMov = nxt.mov[f];
      for (const name in nMov) {
        const i = ideologyOf[name];
        if (i === undefined || i < 0) continue;
        const before = nxt.pop[base + i] - growth * share[i];
        if (before > 0) nMov[name] *= nxt.pop[base + i] / before;
      }
    }
  }

  /*
   * Real GDP growth. There was none: gdp was copied into snap and nxt and
   * written straight back unmodified, while the line under the writeback claimed
   * treasuries ticked "on this turn's updated GDP". Population compounded and
   * GDP did not, so GDP per capita decayed monotonically, treasuries became a
   * fixed linear ramp and every market price inflated to the ceiling.
   *
   * The rate is a base scaled by the Area's SECTOR MIX, plus a share of its
   * realised population growth. The sector differential is what makes relative
   * market prices move at all: with one uniform rate the global sector mix is
   * frozen and the price index is six constants.
   */
  let sectorCache = null, sectorCacheFor = null;
  function sectorFactors(state, sectorMult) {
    const econ = typeof MapModes !== 'undefined' ? MapModes.getEconomy() : null;
    // The economy bake is static for the life of a world, so this is computed
    // once rather than once per turn. Keyed on the doc identity AND the tunable,
    // because M5 drags the sector multipliers on a live world.
    const key = econ ? sectorMult.join(',') : null;
    if (sectorCache && sectorCacheFor === key && sectorCache.length === state.n) return sectorCache;
    const out = new Float64Array(state.n).fill(1);
    if (econ) {
      for (let i = 0; i < state.n; i++) {
        const a = econ.areas[state.idAt(i)];
        if (!a) continue;
        let total = 0, weighted = 0;
        for (let k = 0; k < a.v.length; k++) { total += a.v[k]; weighted += a.v[k] * (sectorMult[k] ?? 1); }
        if (total > 0) out[i] = weighted / total;
      }
    }
    sectorCache = out;
    sectorCacheFor = key;
    return out;
  }
  function phaseEconomicGrowth(snap, nxt, tune) {
    const tn = T(tune);
    const base = tn.get('world.gdpGrowth');
    const coupling = tn.get('world.gdpGrowthPopCoupling');
    const sector = sectorFactors(snap.area, tn.get('world.sectorGrowth'));
    const N = Ideology.count();

    for (let f = 0; f < nxt.n; f++) {
      const b = f * N;
      let was = 0, now = 0;
      for (let k = 0; k < N; k++) { was += snap.pop[b + k]; now += nxt.pop[b + k]; }
      const popRate = was > 0 ? now / was - 1 : 0;
      nxt.gdp[f] = snap.gdp[f] * (1 + base * sector[f] + coupling * popRate);
    }
  }

  /*
   * End-of-turn cleanup: movements below `world.partyFloor` are removed, and
   * every surviving movement is clamped to a valid slice of its ideology.
   *
   * The clamp is the reconciliation step the whole model rests on: drift, growth
   * and war all move `pop[i]` without knowing about movements, so a movement can
   * end a turn claiming more people than its ideology holds. It never leaves
   * this phase that way.
   *
   * NOTE FOR TUNING: under growth-only dynamics the FLOOR cannot fire. The
   * smallest post-growth share a movement can hold is partyStep x partyCeiling =
   * 0.0105, above the 0.01 floor. The phase is kept because M4's sentiment model
   * lets a movement SHRINK, which is the case the floor exists for.
   */
  function phaseCleanup(snap, nxt, tune) {
    const floor = T(tune).get('world.partyFloor');
    const N = Ideology.count();
    const ideologyOf = movementIdeologies();
    const byIdeology = new Float64Array(N);

    for (let f = 0; f < nxt.n; f++) {
      const mov = nxt.mov[f];
      let any = false;
      for (const m in mov) { any = true; break; }
      if (!any) continue;
      const base = f * N;
      let pop = 0;
      for (let k = 0; k < N; k++) pop += nxt.pop[base + k];
      if (!pop) continue;

      byIdeology.fill(0);
      for (const m in mov) {
        const i = ideologyOf[m];
        if (i === undefined || i < 0 || mov[m] / pop < floor) { delete mov[m]; continue; }
        byIdeology[i] += mov[m];
      }
      for (let k = 0; k < N; k++) {
        if (byIdeology[k] <= nxt.pop[base + k]) continue;
        const scale = nxt.pop[base + k] / byIdeology[k];
        for (const m in mov) if (ideologyOf[m] === k) mov[m] *= scale;
      }
    }
  }

  /**
   * Power stocks, recomputed once per turn and stored on the nation.
   *
   * Runs AFTER the population and economy phases and after governments are
   * refreshed, because every input it reads — cohesion, treasury, upkeep,
   * occupied ground, who is in power — is a result of this turn, not of the
   * last one. Running it earlier would report the previous turn's world with
   * this turn's label on it.
   *
   * The Why record is kept beside the value. That is what makes M5's "show your
   * work" free: nothing has to recompute anything to explain a number, and the
   * `key` on each input names the slider that moves it.
   */
  function phasePower(tune, turn, only) {
    const tn = T(tune);
    // The world facts Influence is measured against, computed ONCE. Alignment is
    // O(nations^2) and `nationDemographics` is a full scan of a nation's Areas,
    // so asking 51 times inside 51 loops is 51 passes over the whole map for a
    // number that does not change between them.
    const ctx = Power.worldContext();
    for (const [nid, n] of Game.nations) {
      if (only && !only(n)) continue;
      n.why = n.why || {};
      // Everything the four stocks need about this nation, read in ONE pass.
      const facts = Power.nationFacts(nid, tn);
      if (!facts) continue;

      const auth = Power.authority(Power.gatherAuthority(facts, turn), tn);
      n.authority = auth.value;
      n.why.authority = auth;
      // Influence reads `n.influence` as its own input (the (1 + influence)
      // scaling), so it is assigned after the record is built, not before.
      const infl = Power.influence(Power.gatherInfluence(facts, turn, tn, ctx), tn);
      n.influence = infl.value;
      n.why.influence = infl;

      const q = Power.qol(Power.gatherQol(facts, turn), tn);
      n.qol = q.value;
      n.why.qol = q;

      const lib = Power.liberties(Power.gatherLiberties(facts, turn), tn);
      n.liberties = lib.value;
      n.why.liberties = lib;
    }
  }

  /**
   * Seed the power stocks for a world that has just been built or loaded.
   *
   * A stock has to start somewhere, and `Power.step` treats a null previous
   * value as "open at the target" rather than climbing to it from the floor —
   * so a fresh 51-nation board shows each nation's real opening Authority
   * instead of every one of them at 0.08 for the first fifteen turns.
   *
   * Called by whoever finishes building a world (app.js, the test fixture). The
   * suite asserts that every nation has an Authority at turn 0, so a caller that
   * forgets is a test failure rather than a blank panel.
   */
  function begin(tune, only) {
    phasePower(T(tune), turn, only);
  }

  function advanceTurn(tune, rng) {
    const tn = T(tune);
    const owners = snapshotOwners();
    const snap = buffer(), nxt = buffer();

    const mixes = phaseRecomputeMixes(snap, nxt, owners); // start-of-turn ideology cache
    phasePoliticalDrift(snap, nxt, mixes, tn, owners, rng);
    phaseSentiment(snap, nxt, tn, owners);
    phasePopulationGrowth(snap, nxt, tn, owners);
    phaseEconomicGrowth(snap, nxt, tn); // after popGrowth: reads the realised change
    phaseCleanup(snap, nxt, tn);

    // One render for the whole turn. The writeback mutates the county records
    // directly and never emitted, so any driver other than the one button left
    // the UI stale (finding 19). Batch it and emit exactly once, from here.
    Game.batch(() => {
      // The whole result lands in two memcpys plus the movement bags, and
      // `copyFrom` writes INTO the live columns rather than swapping them, so
      // every outstanding Area view stays valid. `owner` is deliberately not
      // copied back: no phase moves an Area, and when M4's defection does, it
      // will go through Game.moveCounties so the derived index stays right.
      const live = Game.state();
      live.pop.set(nxt.pop);
      live.gdp.set(nxt.gdp);
      for (let i = 0; i < nxt.n; i++) Game.county[nxt.idAt(i)].mov = nxt.mov[i];
      // Who is in power, refreshed at exactly one point in the turn. Reading it
      // live would mean a nation's government changed in the middle of whichever
      // phase was moving its population, so the answer would depend on when you
      // asked. Stored also gives `gov.since` a meaning, which Authority reads.
      Game.refreshGovernments(turn + 1);
      Movements.refreshStates(tn); // derived from the map, so it follows the writeback
      Game.tickTreasuries(); // income minus maintenance, on this turn's updated GDP
      Market.update(tn);     // reprice every resource from live supply vs demand
      phasePower(tn, turn + 1); // last: every input it reads is a result of this turn
      Game.touch({ values: true });
    });
    turn += 1;
    return turn;
  }

  return {
    advanceTurn,
    getTurn: () => turn,
    setTurn: (t) => { turn = t | 0; },
    serialize: () => ({ turn }),
    loadState: (s) => { turn = (s && s.turn) | 0; },
    snapshotOwners,
    begin,
    phasePower,
    buffer,
    recPop,
    phaseRecomputeMixes,
    phasePoliticalDrift,
    phaseSentiment,
    phasePopulationGrowth,
    phaseEconomicGrowth,
    phaseCleanup,
  };
})();
