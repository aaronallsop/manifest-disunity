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

  /** fips -> owning nation id, frozen for the duration of one world turn. */
  function snapshotOwners() {
    const out = {};
    for (const f in Game.county) out[f] = Game.getOwner(f);
    return out;
  }

  /** Total population of a snapshot/next record. */
  const recPop = (c) => {
    let t = 0;
    for (let i = 0; i < c.pop.length; i++) t += c.pop[i];
    return t;
  };

  /**
   * Each nation's ideology SHARES (percent), from the start-of-turn snapshot.
   * Drift reads this cache, never a mix influenced by already-drifted Areas.
   *
   * This replaced `phaseRecomputeLeans`, which produced a {d,g,o} triple and a
   * D-or-R letter that ignored every emergent movement.
   */
  function phaseRecomputeMixes(snap, nxt, owners) {
    const own = owners || snapshotOwners();
    const N = Ideology.count();
    const totals = {};
    for (const f in snap) {
      const o = own[f];
      if (!o) continue;
      let t = totals[o];
      if (!t) t = totals[o] = new Array(N).fill(0);
      const c = snap[f];
      for (let i = 0; i < N; i++) t[i] += c.pop[i];
    }
    const out = {};
    for (const k in totals) out[k] = Ideology.shares(totals[k]);
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
    const nbrMix = new Array(N);
    const cur = new Array(N);

    for (const f in nxt) {
      const o = own[f];
      const lean = o && mixes[o];
      if (!lean) continue;
      const c = snap[f];
      const pop = recPop(c);
      if (!pop) continue;
      const anchor = Game.anchorOf(f) || lean;

      // Neighbour mean, population-weighted, read from SNAP so the gradient is
      // computed against start-of-turn values and phase order cannot skew it.
      let nw = 0;
      nbrMix.fill(0);
      if (wNbr > 0) {
        for (const nb of Game.countyNeighbors(f)) {
          const s2 = snap[nb];
          if (!s2) continue;
          for (let i = 0; i < N; i++) { nbrMix[i] += s2.pop[i]; nw += s2.pop[i]; }
        }
      }
      const hasNbr = nw > 0;
      // With no neighbours on file the neighbour weight falls back to the owner
      // rather than silently biasing the target toward zero.
      const wO = wOwner + (hasNbr ? 0 : wNbr);

      let tot = 0;
      for (let i = 0; i < N; i++) {
        const target = wO * lean[i]
          + wAnchor * anchor[i]
          + (hasNbr ? wNbr * (nbrMix[i] / nw) * 100 : 0);
        let v = (c.pop[i] / pop) * 100;
        v += step * (target - v);
        if (jitter && noise > 0) v = Math.max(0, v + (jitter.random() * 2 - 1) * noise);
        cur[i] = v;
        tot += v;
      }
      if (!tot) continue;
      for (let i = 0; i < N; i++) nxt[f].pop[i] = (cur[i] / tot) * pop;
    }
  }

  /*
   * Movements gain ground: each closes `partyStep` of the gap to its per-Area
   * ceiling, converting people from every OTHER ideology into its own.
   *
   * The gain is computed from the SNAPSHOT share, so it eases in and never
   * exceeds the ceiling. All gains are computed BEFORE any is applied: applying
   * them one at a time made the result depend on the insertion order of the
   * movement names, so two identically-seeded movements in one Area settled 0.08
   * share points apart — a replay-breaking source of nondeterminism with no
   * modelled cause.
   *
   * M4.2 replaces the fixed ceiling with sentiment: a movement's target becomes
   * a function of ideological affinity, quality of life, liberty, the power of
   * the nation holding it, and the pull of neighbouring Areas that already
   * carry it.
   */
  function phaseMovementGrowth(snap, nxt, tune) {
    const ceiling = T(tune).get('world.partyCeiling');
    const stepFrac = T(tune).get('world.partyStep');
    const N = Ideology.count();

    for (const f in nxt) {
      const s = snap[f];
      const names = Object.keys(s.mov);
      if (!names.length) continue;
      const spop = recPop(s);
      const c = nxt[f];
      const pop = recPop(c);
      if (!spop || !pop) continue;

      // What each movement wants to gain, as a share of the Area.
      const gains = {};
      let totalGain = 0;
      for (const name of names) {
        const cur = s.mov[name] / spop;
        const g = Math.max(0, stepFrac * (ceiling - cur));
        gains[name] = g;
        totalGain += g;
      }
      if (totalGain <= 0) continue;

      // Convert from the ideologies the movements do NOT belong to.
      const target = new Array(N).fill(0);
      for (const name in gains) {
        const i = Movements.ideologyIndexOf(name);
        if (i >= 0) target[i] += gains[name];
      }
      let donor = 0;
      for (let i = 0; i < N; i++) if (!target[i]) donor += c.pop[i];
      const want = totalGain * pop;
      const take = Math.min(want, donor);
      if (take > 0 && donor > 0) {
        const k = 1 - take / donor;
        for (let i = 0; i < N; i++) if (!target[i]) c.pop[i] *= k;
        for (let i = 0; i < N; i++) if (target[i]) c.pop[i] += take * (target[i] / totalGain);
      }
      for (const name in gains) c.mov[name] = (c.mov[name] || 0) + gains[name] * pop;
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

    const natTotals = {}; // owner -> {mix[N], total}, from this turn's snapshot
    for (const f in snap) {
      const o = own[f];
      if (!o) continue;
      let t = natTotals[o];
      if (!t) t = natTotals[o] = { mix: new Array(N).fill(0), total: 0 };
      const c = snap[f];
      for (let i = 0; i < N; i++) { t.mix[i] += c.pop[i]; t.total += c.pop[i]; }
    }

    for (const f in nxt) {
      const o = own[f];
      const t = o && natTotals[o];
      if (!t || !t.total) continue;
      // per-Area counts from nxt (post-drift, post-movement, so phases compose);
      // the nation mix still comes from snap.
      const c = nxt[f];
      const here = recPop(c);
      if (!here) continue;
      const growth = here * r;
      for (let i = 0; i < N; i++) {
        const share = wNat * (t.mix[i] / t.total) + (1 - wNat) * (c.pop[i] / here);
        c.pop[i] += growth * share;
      }
      // Movements keep their share of their own ideology.
      for (const m in c.mov) {
        const i = Movements.ideologyIndexOf(m);
        if (i < 0) continue;
        const before = c.pop[i] - growth * (wNat * (t.mix[i] / t.total) + (1 - wNat) * (c.pop[i] / here));
        if (before > 0) c.mov[m] *= c.pop[i] / before;
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
  function phaseEconomicGrowth(snap, nxt, tune) {
    const tn = T(tune);
    const base = tn.get('world.gdpGrowth');
    const coupling = tn.get('world.gdpGrowthPopCoupling');
    const sectorMult = tn.get('world.sectorGrowth');
    const econ = typeof MapModes !== 'undefined' ? MapModes.getEconomy() : null;

    const mixCache = new Map();
    function sectorFactor(f) {
      if (!econ) return 1;
      let m = mixCache.get(f);
      if (m !== undefined) return m;
      const a = econ.areas[f];
      if (!a) { mixCache.set(f, 1); return 1; }
      let total = 0, weighted = 0;
      for (let i = 0; i < a.v.length; i++) { total += a.v[i]; weighted += a.v[i] * (sectorMult[i] ?? 1); }
      m = total > 0 ? weighted / total : 1;
      mixCache.set(f, m);
      return m;
    }

    for (const f in nxt) {
      const s = snap[f], c = nxt[f];
      const before = recPop(s);
      const popRate = before > 0 ? recPop(c) / before - 1 : 0;
      c.gdp = s.gdp * (1 + base * sectorFactor(f) + coupling * popRate);
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
    for (const f in nxt) {
      const c = nxt[f];
      const pop = recPop(c);
      if (!pop) continue;
      for (const m in c.mov) {
        if (c.mov[m] / pop < floor) delete c.mov[m];
      }
      // clamp each ideology's movements to what that ideology actually holds
      const byIdeology = new Array(N).fill(0);
      for (const m in c.mov) {
        const i = Movements.ideologyIndexOf(m);
        if (i >= 0) byIdeology[i] += c.mov[m];
        else delete c.mov[m];
      }
      for (let i = 0; i < N; i++) {
        if (byIdeology[i] <= c.pop[i]) continue;
        const k = c.pop[i] / byIdeology[i];
        for (const m in c.mov) if (Movements.ideologyIndexOf(m) === i) c.mov[m] *= k;
      }
    }
  }

  function advanceTurn(tune, rng) {
    const tn = T(tune);
    const owners = snapshotOwners();
    const snap = {}, nxt = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      snap[f] = { pop: c.pop.slice(), mov: { ...c.mov }, gdp: c.gdp };
      nxt[f] = { pop: c.pop.slice(), mov: { ...c.mov }, gdp: c.gdp };
    }
    const mixes = phaseRecomputeMixes(snap, nxt, owners); // start-of-turn ideology cache
    phasePoliticalDrift(snap, nxt, mixes, tn, owners, rng);
    phaseMovementGrowth(snap, nxt, tn);
    phasePopulationGrowth(snap, nxt, tn, owners);
    phaseEconomicGrowth(snap, nxt, tn); // after popGrowth: reads the realised change
    phaseCleanup(snap, nxt, tn);

    // One render for the whole turn. The writeback mutates the county records
    // directly and never emitted, so any driver other than the one button left
    // the UI stale (finding 19). Batch it and emit exactly once, from here.
    Game.batch(() => {
      for (const f in nxt) {
        const c = Game.county[f], v = nxt[f];
        c.pop = v.pop; c.mov = v.mov; c.gdp = v.gdp;
      }
      Game.tickTreasuries(); // income minus maintenance, on this turn's updated GDP
      Market.update(tn);     // reprice every resource from live supply vs demand
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
    phaseRecomputeMixes,
    phasePoliticalDrift,
    phaseMovementGrowth,
    phasePopulationGrowth,
    phaseEconomicGrowth,
    phaseCleanup,
  };
})();
