/*
 * World turn engine. Advances the WORLD, kept separate from player/AI actions
 * (those go through TurnSystem / Actions). advanceTurn() runs the world-update
 * phases in a FIXED order, then increments the world turn counter.
 *
 * Per-turn update discipline (double buffering): every phase reads this turn's
 * county values from `snap` (a frozen copy) and writes each next value into `nxt`
 * (a fresh copy); `nxt` is swapped back into the live counties only at the end.
 * No phase ever reads a value it has already updated this turn, so feedback loops
 * can't compound within a single turn.
 *
 * Each phase takes `tune` explicitly so the M5 simulator can run a phase against
 * a modified tunable set without touching the live game.
 */
const World = (function () {
  let turn = 0;

  // Tunables come in per call; the live game passes the session TUNE.
  const T = (tune) => tune || window.TUNE;

  // Compute and cache each nation's lean (% d/g/o) from the start-of-turn snapshot;
  // drift reads this cache, never leans influenced by already-drifted counties.
  function phaseRecomputeLeans(snap, nxt) {
    const totals = {};
    for (const f in snap) {
      const o = Game.getOwner(f);
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

  // Ease each county toward its OWNER nation's cached lean:
  // new% = old% + step * (target% - old%), renormalized (default closes 2% of the
  // gap per turn -- self-limiting). Moves people BETWEEN parties; population is
  // unchanged by this phase.
  function phasePoliticalDrift(snap, nxt, leans, tune) {
    const s = T(tune).get('world.driftStep');
    for (const f in nxt) {
      const own = Game.getOwner(f);
      const tgt = own && leans[own];
      if (!tgt) continue;
      const c = snap[f];
      const pop = c.demPop + c.gopPop + c.othPop;
      if (!pop) continue;
      let d = (c.demPop / pop) * 100; d += s * (tgt.d - d);
      let g = (c.gopPop / pop) * 100; g += s * (tgt.g - g);
      let o = (c.othPop / pop) * 100; o += s * (tgt.o - o);
      const tot = (d + g + o) || 1;
      nxt[f].demPop = (d / tot) * pop;
      nxt[f].gopPop = (g / tot) * pop;
      nxt[f].othPop = (o / tot) * pop;
    }
  }
  // Grow each county by `rate` (default 1%/turn) and drift it politically: the NEW
  // residents arrive in the party mix of the county's OWNER NATION, not the county's
  // own -- so an annexed county gradually drifts toward its nation's alignment while
  // nation-level ratios stay put. (Per-nation rates come later.)
  function phasePopulationGrowth(snap, nxt, tune) {
    const r = T(tune).get('world.popGrowth');
    const natTotals = {}; // owner -> {d,g,o}, from this turn's snapshot
    for (const f in snap) {
      const o = Game.getOwner(f);
      if (!o) continue;
      const t = natTotals[o] || (natTotals[o] = { d: 0, g: 0, o: 0 });
      t.d += snap[f].demPop; t.g += snap[f].gopPop; t.o += snap[f].othPop;
    }
    for (const f in nxt) {
      const own = Game.getOwner(f);
      const t = own && natTotals[own];
      if (!t) continue;
      // per-county counts from nxt (post-drift, so phases compose); the nation
      // mix still comes from snap.
      const c = nxt[f];
      const natPop = (t.d + t.g + t.o) || 1;
      const growth = (c.demPop + c.gopPop + c.othPop) * r; // new people this turn
      c.demPop = Math.round(c.demPop + growth * (t.d / natPop));
      c.gopPop = Math.round(c.gopPop + growth * (t.g / natPop));
      c.othPop = Math.round(c.othPop + growth * (t.o / natPop));
    }
  }

  // Ease each emergent party toward its per-county ceiling: gain closes
  // PARTY_STEP of the gap (computed from the SNAPSHOT share, so it eases in and
  // never exceeds the ceiling); the gained share is taken proportionally from
  // all OTHER parties, then everything is renormalized.
  function phasePartyGrowth(snap, nxt, tune) {
    const ceiling = T(tune).get('world.partyCeiling');
    const stepFrac = T(tune).get('world.partyStep');
    for (const f in nxt) {
      const s = snap[f];
      const names = Object.keys(s.ext);
      if (!names.length) continue;
      const spop = s.demPop + s.gopPop + s.othPop + Object.values(s.ext).reduce((a, b) => a + b, 0);
      const c = nxt[f];
      const pop = c.demPop + c.gopPop + c.othPop + Object.values(c.ext).reduce((a, b) => a + b, 0);
      if (!spop || !pop) continue;
      const sh = { _d: c.demPop / pop, _g: c.gopPop / pop, _o: c.othPop / pop };
      for (const p in c.ext) sh[p] = c.ext[p] / pop;
      for (const name of names) {
        const cur = s.ext[name] / spop;              // snapshot share (0..1)
        const gain = stepFrac * (ceiling - cur);
        for (const q in sh) if (q !== name) sh[q] *= 1 - gain;
        sh[name] = cur + gain;
      }
      let tot = 0;
      for (const q in sh) tot += sh[q];
      c.demPop = (sh._d / tot) * pop;
      c.gopPop = (sh._g / tot) * pop;
      c.othPop = (sh._o / tot) * pop;
      c.ext = {};
      for (const q in sh) if (q[0] !== '_') c.ext[q] = (sh[q] / tot) * pop;
    }
  }

  // End-of-turn cleanup: emergent parties below PARTY_FLOOR are removed and their
  // share redistributed proportionally to the remaining parties (D/R/Other are
  // structural and never removed). Stops counties splintering into tiny parties.
  function phaseCleanup(snap, nxt, tune) {
    const floor = T(tune).get('world.partyFloor');
    for (const f in nxt) {
      const c = nxt[f];
      const pop = c.demPop + c.gopPop + c.othPop + Object.values(c.ext).reduce((a, b) => a + b, 0);
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

  function advanceTurn(tune) {
    const tn = T(tune);
    const snap = {}, nxt = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      snap[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
      nxt[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
    }
    const leans = phaseRecomputeLeans(snap, nxt); // start-of-turn lean cache
    phasePoliticalDrift(snap, nxt, leans, tn);
    phasePartyGrowth(snap, nxt, tn);
    phasePopulationGrowth(snap, nxt, tn);
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
    phaseRecomputeLeans,
    phasePoliticalDrift,
    phasePartyGrowth,
    phasePopulationGrowth,
    phaseCleanup,
  };
})();
