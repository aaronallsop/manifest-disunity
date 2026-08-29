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

  /** Total population of a snapshot/next record, movements included. */
  const recPop = (c) => {
    let e = 0;
    for (const p in c.ext) e += c.ext[p];
    return c.demPop + c.gopPop + c.othPop + e;
  };

  // Compute and cache each nation's lean (% d/g/o) from the start-of-turn snapshot;
  // drift reads this cache, never leans influenced by already-drifted counties.
  function phaseRecomputeLeans(snap, nxt, owners) {
    const own = owners || snapshotOwners();
    const totals = {};
    for (const f in snap) {
      const o = own[f];
      if (!o) continue;
      const t = totals[o] || (totals[o] = { d: 0, g: 0, o: 0 });
      t.d += snap[f].demPop; t.g += snap[f].gopPop; t.o += snap[f].othPop;
    }
    const leans = {};
    for (const k in totals) {
      const t = totals[k], pop = t.d + t.g + t.o;
      leans[k] = pop ? { d: (t.d / pop) * 100, g: (t.g / pop) * 100, o: (t.o / pop) * 100 } : { d: 0, g: 0, o: 0 };
    }
    return leans;
  }

  /*
   * Ease each county toward a BLENDED target:
   *
   *   target = ownerWeight    * the owner nation's lean
   *          + anchorWeight   * the county's own founding character
   *          + neighbourWeight * the population-weighted mean of its neighbours
   *
   * new% = old% + driftStep * (target% - old%), then bounded noise, then
   * renormalise. Moves people BETWEEN parties; population is unchanged here.
   *
   * WHY IT IS NOT JUST THE OWNER'S LEAN. It used to be. Drift pulled every
   * county toward its nation's mix and population growth added new residents in
   * that same mix, so both forces pulled toward ONE attractor and nothing pushed
   * back. Measured per-turn deviation multiplier 0.9703, half-life 23 turns:
   * population-weighted within-nation stdev of dem% went 12.5 -> 2.5 by turn 50,
   * and nations in which every county carried the same lean letter went 10/51 ->
   * 35/51. Since "county party majority" is factor #1 of the sentiment model
   * M4.2 builds, that collapse degenerates the county grid into a nation-level
   * scalar and leaves two-tier secession nothing to differentiate.
   *
   * Three counter-forces, each doing a different job:
   *   - the ANCHOR gives every county its own fixed point, so the equilibrium is
   *     a spread rather than a single value;
   *   - the NEIGHBOUR term makes that spread spatially smooth, so what survives
   *     is a gradient a movement can diffuse along rather than salt-and-pepper;
   *   - the NOISE gives the deviation a non-zero stationary variance instead of
   *     a fixed point it converges onto exactly.
   */
  function phasePoliticalDrift(snap, nxt, leans, tune, owners, rng) {
    const tn = T(tune);
    const step = tn.get('world.driftStep');
    const wOwner = tn.get('world.driftOwnerWeight');
    const wAnchor = tn.get('world.driftAnchorWeight');
    const wNbr = Math.max(0, 1 - wOwner - wAnchor);
    const noise = tn.get('world.driftNoise') * 100; // tunable is a share; shares here are percent
    const jitter = rng ? rng.stream('drift') : null;
    const own = owners || snapshotOwners();

    for (const f in nxt) {
      const o = own[f];
      const lean = o && leans[o];
      if (!lean) continue;
      const c = snap[f];
      const pop = c.demPop + c.gopPop + c.othPop;
      if (!pop) continue;

      const anchor = Game.anchorOf(f) || lean;

      // Neighbour mean, population-weighted, read from SNAP so the gradient is
      // computed against start-of-turn values and phase order cannot skew it.
      let nd = 0, ng = 0, no = 0, nw = 0;
      if (wNbr > 0) {
        for (const nb of Game.countyNeighbors(f)) {
          const s2 = snap[nb];
          if (!s2) continue;
          const w = s2.demPop + s2.gopPop + s2.othPop;
          if (w <= 0) continue;
          nd += s2.demPop; ng += s2.gopPop; no += s2.othPop; nw += w;
        }
      }
      const hasNbr = nw > 0;
      const wN = hasNbr ? wNbr : 0;
      // With no neighbours on file (Hawaii, Watonwan MN) the neighbour weight
      // falls back to the owner rather than silently biasing toward zero.
      const wO = wOwner + (hasNbr ? 0 : wNbr);

      const tD = wO * lean.d + wAnchor * anchor.d + (hasNbr ? wN * (nd / nw) * 100 : 0);
      const tG = wO * lean.g + wAnchor * anchor.g + (hasNbr ? wN * (ng / nw) * 100 : 0);
      const tO = wO * lean.o + wAnchor * anchor.o + (hasNbr ? wN * (no / nw) * 100 : 0);

      let d = (c.demPop / pop) * 100; d += step * (tD - d);
      let g = (c.gopPop / pop) * 100; g += step * (tG - g);
      let o2 = (c.othPop / pop) * 100; o2 += step * (tO - o2);

      if (jitter && noise > 0) {
        d = Math.max(0, d + (jitter.random() * 2 - 1) * noise);
        g = Math.max(0, g + (jitter.random() * 2 - 1) * noise);
        o2 = Math.max(0, o2 + (jitter.random() * 2 - 1) * noise);
      }

      const tot = (d + g + o2) || 1;
      nxt[f].demPop = (d / tot) * pop;
      nxt[f].gopPop = (g / tot) * pop;
      nxt[f].othPop = (o2 / tot) * pop;
    }
  }

  /*
   * Ease each emergent party toward its per-county ceiling. The gain closes
   * `partyStep` of the gap (computed from the SNAPSHOT share, so it eases in and
   * never exceeds the ceiling); the gained share is taken proportionally from
   * every other party.
   *
   * All gains are computed BEFORE any of them is applied. Applying them one at a
   * time made the result depend on the insertion order of the `ext` keys — two
   * identically-seeded movements in one county settled 0.08 share points apart
   * depending on which was inserted first, which is a replay-breaking source of
   * nondeterminism with no modelled cause.
   */
  function phasePartyGrowth(snap, nxt, tune) {
    const ceiling = T(tune).get('world.partyCeiling');
    const stepFrac = T(tune).get('world.partyStep');
    for (const f in nxt) {
      const s = snap[f];
      const names = Object.keys(s.ext);
      if (!names.length) continue;
      const spop = recPop(s);
      const c = nxt[f];
      const pop = recPop(c); // post-drift per-county values; drift never moves ext
      if (!spop || !pop) continue;

      const sh = { _d: c.demPop / pop, _g: c.gopPop / pop, _o: c.othPop / pop };
      for (const p in c.ext) sh[p] = c.ext[p] / pop;

      const gains = {};
      let totalGain = 0;
      for (const name of names) {
        const cur = s.ext[name] / spop; // snapshot share (0..1)
        const g = stepFrac * (ceiling - cur);
        gains[name] = g;
        totalGain += g;
      }
      for (const q in sh) if (!(q in gains)) sh[q] *= 1 - totalGain;
      for (const name in gains) sh[name] = (sh[name] || 0) + gains[name];

      let tot = 0;
      for (const q in sh) tot += sh[q];
      c.demPop = (sh._d / tot) * pop;
      c.gopPop = (sh._g / tot) * pop;
      c.othPop = (sh._o / tot) * pop;
      c.ext = {};
      for (const q in sh) if (q[0] !== '_') c.ext[q] = (sh[q] / tot) * pop;
    }
  }

  /*
   * Grow each county by `world.popGrowth` and drift it politically: the NEW
   * residents arrive in the party mix of the county's OWNER NATION, not the
   * county's own, so an annexed county gradually drifts toward its nation's
   * alignment while nation-level ratios stay put.
   *
   * The national pull is PARTIAL (`world.growthMixNationWeight`). At 1.0 this
   * phase is a second attractor pulling at exactly the same fixed point as
   * political drift, with nothing opposing either — which is half of why the
   * county grid collapsed into a nation-level scalar. The remainder of the new
   * residents arrive in the county's own mix, which is neutral.
   *
   * The national pull is PARTIAL (`world.growthMixNationWeight`). At 1.0 this
   * phase is a second attractor pulling at exactly the same fixed point as
   * political drift, with nothing opposing either - which is half of why the
   * county grid collapsed into a nation-level scalar. The rest of the new
   * residents arrive in the county's own mix, which is politically neutral.
   *
   * The national pull is PARTIAL (`world.growthMixNationWeight`). At 1.0 this
   * phase is a second attractor pulling at exactly the same fixed point as
   * political drift, with nothing opposing either - which is half of why the
   * county grid collapsed into a nation-level scalar. The rest of the new
   * residents arrive in the county's own mix, which is politically neutral.
   *
   * `ext` IS INCLUDED, in the nation mix and in the county growth base.
   * Omitting it meant members of a regional party literally did not reproduce:
   * realised growth was 0.93%/turn rather than the declared 1%, every movement
   * was diluted by the growth of the parties around it, and the emergent-party
   * share settled at a dilution equilibrium of 0.278 instead of the declared
   * 0.35 ceiling — with every county holding a movement converging on the SAME
   * 0.278. Movements meant to be playable factions with regional variation all
   * ended up numerically identical.
   */
  function phasePopulationGrowth(snap, nxt, tune, owners) {
    const tn = T(tune);
    const r = tn.get('world.popGrowth');
    const wNat = tn.get('world.growthMixNationWeight');
    const own = owners || snapshotOwners();
    const natTotals = {}; // owner -> {d,g,o,ext:{},total}, from this turn's snapshot
    for (const f in snap) {
      const o = own[f];
      if (!o) continue;
      const t = natTotals[o] || (natTotals[o] = { d: 0, g: 0, o: 0, ext: {}, total: 0 });
      const c = snap[f];
      t.d += c.demPop; t.g += c.gopPop; t.o += c.othPop;
      for (const p in c.ext) t.ext[p] = (t.ext[p] || 0) + c.ext[p];
      t.total += recPop(c);
    }
    for (const f in nxt) {
      const o = own[f];
      const t = o && natTotals[o];
      if (!t || !t.total) continue;
      // per-county counts from nxt (post-drift, post-partyGrowth, so phases
      // compose); the nation mix still comes from snap.
      const c = nxt[f];
      const here = recPop(c);
      if (!here) continue;
      const growth = here * r; // new people this turn, movements included

      // Blend the nation's mix with the county's own. Names are unioned so a
      // movement present in either shows up in the arriving cohort.
      const mix = (natShare, ownCount) => wNat * natShare + (1 - wNat) * (ownCount / here);
      c.demPop += growth * mix(t.d / t.total, c.demPop);
      c.gopPop += growth * mix(t.g / t.total, c.gopPop);
      c.othPop += growth * mix(t.o / t.total, c.othPop);
      const names = new Set([...Object.keys(t.ext), ...Object.keys(c.ext)]);
      for (const p of names) {
        const add = growth * mix((t.ext[p] || 0) / t.total, c.ext[p] || 0);
        if (add) c.ext[p] = (c.ext[p] || 0) + add;
      }
    }
  }

  /*
   * Real GDP growth. There was none: gdp was copied into snap and nxt and
   * written straight back unmodified, while the line beneath the writeback
   * claimed treasuries ticked "on this turn's updated GDP". Population compounded
   * and GDP did not, so GDP per capita decayed monotonically, treasuries became a
   * fixed linear ramp and every market price inflated to the ceiling.
   *
   * The rate is a base plus a share of the county's REALISED population growth,
   * so a county that is growing produces more. M5 makes it respond to the sector
   * mix and to trade.
   */
  function phaseEconomicGrowth(snap, nxt, tune) {
    const tn = T(tune);
    const base = tn.get('world.gdpGrowth');
    const coupling = tn.get('world.gdpGrowthPopCoupling');
    const sectorMult = tn.get('world.sectorGrowth');
    const econ = typeof MapModes !== 'undefined' ? MapModes.getEconomy() : null;

    // An Area's growth multiplier from its baked sector mix, memoized per turn.
    // Without this every Area grows at the same rate, the GLOBAL sector mix is
    // frozen forever, and every market price is a constant — a price index that
    // reports nothing is not a fixed market, it is a broken one that no longer
    // climbs.
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
   * End-of-turn cleanup: emergent parties below `world.partyFloor` are removed
   * and their share redistributed proportionally to the remaining parties (D/R/
   * Other are structural and never removed).
   *
   * NOTE FOR TUNING: under growth-only dynamics this phase cannot fire. The
   * smallest post-growth share a movement can hold is
   * partyStep x partyCeiling = 0.0105, above the 0.01 floor. Measured over 500
   * turns on the real data: 1,088 county-party pairs before and after, every
   * turn. The phase is kept because M4's sentiment model lets a movement SHRINK,
   * which is the case the floor exists for. Until then, raising the floor would
   * only delete movements that happened to spawn small, and lowering it changes
   * nothing.
   */
  function phaseCleanup(snap, nxt, tune) {
    const floor = T(tune).get('world.partyFloor');
    for (const f in nxt) {
      const c = nxt[f];
      const pop = recPop(c);
      if (!pop) continue;
      let removed = 0;
      for (const p in c.ext) {
        if (c.ext[p] / pop < floor) { removed += c.ext[p]; delete c.ext[p]; }
      }
      if (!removed) continue;
      const k = pop / (pop - removed);
      c.demPop *= k; c.gopPop *= k; c.othPop *= k;
      for (const p in c.ext) c.ext[p] *= k;
    }
  }

  /**
   * Run one world turn.
   * @param tune the tunable set; the live game passes the session TUNE
   * @param rng  the session RNG. Optional only so a caller can run a
   *             deterministic no-noise turn; without it the drift jitter is off.
   */
  function advanceTurn(tune, rng) {
    const tn = T(tune);
    const owners = snapshotOwners();
    const snap = {}, nxt = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      snap[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
      nxt[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
    }
    const leans = phaseRecomputeLeans(snap, nxt, owners); // start-of-turn lean cache
    phasePoliticalDrift(snap, nxt, leans, tn, owners, rng);
    phasePartyGrowth(snap, nxt, tn);
    phasePopulationGrowth(snap, nxt, tn, owners);
    phaseEconomicGrowth(snap, nxt, tn); // after popGrowth: reads the realised change
    phaseCleanup(snap, nxt, tn);

    // One render for the whole turn. The writeback mutates the county records
    // directly and never emitted, so any driver other than the one button left
    // the UI stale (finding 19). Batch it and emit exactly once, from here.
    Game.batch(() => {
      for (const f in nxt) {
        const c = Game.county[f], v = nxt[f];
        c.demPop = v.demPop; c.gopPop = v.gopPop; c.othPop = v.othPop; c.ext = v.ext; c.gdp = v.gdp;
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
    phaseRecomputeLeans,
    phasePoliticalDrift,
    phasePartyGrowth,
    phasePopulationGrowth,
    phaseEconomicGrowth,
    phaseCleanup,
  };
})();
