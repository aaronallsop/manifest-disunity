/*
 * Game state for Nation States.
 *
 * Everything is dynamic. Each county tracks a partisan *population* (demPop /
 * gopPop / othPop) and a mutable gdp; totals and political leaning are always
 * derived from those. Population grows each round, civil wars bleed population
 * and GDP, and counties change hands as nations rise and fall.
 *
 *   county : fips -> { name, st, demPop, gopPop, othPop, gdp }
 *   nation : { id, name, color, counties:Set<fips>, origin }
 *   owner  : fips -> nationId
 */
const Game = (function () {
  const county = {};
  const nations = new Map();
  const owner = new Map();
  const alias = {}; // merged member county fips -> its Area id
  const cid = (f) => alias[f] || f;
  let adjacency = null;
  let seq = 0;
  const listeners = [];

  // Every constant this module uses lives in TUNE (js/tunables.js). Reading it
  // off the global bridge is an M0/M1 interim: game.js is a singleton IIFE that
  // already reads Colors and Market as globals, so threading one argument
  // through would be theatre. M2.5 promotes the closure into an explicit state
  // document and every engine function then takes (state, tune, rng).
  const T = (k) => TUNE.get(k);

  // Tear the singleton down so a fresh init() starts clean. Exists because every
  // module here is a singleton IIFE with private mutable state (finding 129):
  // you cannot run two worlds, so the test harness runs one world repeatedly.
  // M2.3 makes state a value and this goes away.
  function reset() {
    for (const k of Object.keys(county)) delete county[k];
    for (const k of Object.keys(alias)) delete alias[k];
    nations.clear();
    owner.clear();
    adjacency = null;
    seq = 0;
    listeners.length = 0;
  }

  function init(data, adj, areasDef) {
    adjacency = adj;
    for (const [fips, r] of Object.entries(data.counties)) {
      const pop = r.pop || 0;
      const dem = r.dem != null ? r.dem / 100 : 0;
      const gop = r.gop != null ? r.gop / 100 : 0;
      const oth = r.other != null ? r.other / 100 : Math.max(0, 1 - dem - gop);
      // partisan population: split the county's people by its 2024 vote shares
      county[fips] = {
        name: r.name,
        st: r.st,
        demPop: pop * dem,
        gopPop: pop * gop,
        othPop: pop * oth,
        ext: {},           // emergent regional parties: name -> head count
        gdp: r.gdp || 0,
        attrs: {},         // Area attributes: region tags, resources, terrain, modifiers, ...
      };
    }
    // collapse merged Areas (data/areas.json): the Area becomes the atomic unit;
    // people/GDP are summed and the member-county list is kept on the record.
    if (areasDef && areasDef.areas) {
      for (const [aid, members] of Object.entries(areasDef.areas)) {
        const rec = county[aid];
        if (!rec) continue;
        rec.counties = members.slice();
        rec.name = rec.name.replace(/ (County|Parish|Borough|Census Area|city|City)$/, '') + ' Area';
        for (const m of members) {
          if (m === aid || !county[m]) continue;
          const c = county[m];
          rec.demPop += c.demPop; rec.gopPop += c.gopPop; rec.othPop += c.othPop; rec.gdp += c.gdp;
          delete county[m];
          alias[m] = aid;
        }
      }
    }
    for (const [st, s] of Object.entries(data.states)) {
      nations.set(st, { id: st, name: s.name, color: Colors.forState(st), counties: new Set(), origin: true, treasury: 0, gov: 'Republic' });
    }
    for (const [fips, c] of Object.entries(county)) {
      const n = nations.get(c.st);
      if (n) { n.counties.add(fips); owner.set(fips, c.st); }
    }
  }

  /* ---- per-county reads (population includes regional parties in ext) ---- */
  const extSum = (c) => { let s = 0; for (const p in c.ext) s += c.ext[p]; return s; };
  const countyPop = (f) => { const c = county[cid(f)]; return c ? c.demPop + c.gopPop + c.othPop + extSum(c) : 0; };
  const countyGdp = (f) => county[cid(f)]?.gdp || 0;
  function leanOf(fips) {
    const c = county[cid(fips)];
    if (!c) return null;
    const t = c.demPop + c.gopPop + c.othPop + extSum(c);
    if (!t) return null;
    const dem = (c.demPop / t) * 100, gop = (c.gopPop / t) * 100, other = (c.othPop / t) * 100;
    const extPct = {};
    for (const p in c.ext) extPct[p] = (c.ext[p] / t) * 100;
    return { lean: dem >= gop ? 'D' : 'R', margin: Math.abs(dem - gop), dem, gop, other, extPct };
  }

  /* ---- aggregate demographics ---- */
  function demographics(countyIds) {
    let dem = 0, gop = 0, oth = 0, gdp = 0;
    const extTotals = {};
    for (const f of countyIds) {
      const c = county[f];
      if (!c) continue;
      dem += c.demPop; gop += c.gopPop; oth += c.othPop; gdp += c.gdp;
      for (const p in c.ext) extTotals[p] = (extTotals[p] || 0) + c.ext[p];
    }
    let ext = 0;
    for (const p in extTotals) ext += extTotals[p];
    const pop = dem + gop + oth + ext;
    const extPct = {};
    if (pop) for (const p in extTotals) extPct[p] = (extTotals[p] / pop) * 100;
    return {
      pop, gdp, demPop: dem, gopPop: gop, othPop: oth, extTotals, extPct,
      gop: pop ? (gop / pop) * 100 : null,
      dem: pop ? (dem / pop) * 100 : null,
      other: pop ? (oth / pop) * 100 : null,
      lean: pop ? (dem >= gop ? 'D' : 'R') : null,
    };
  }
  const nationDemographics = (nid) => (nations.has(nid) ? demographics(nations.get(nid).counties) : null);

  /* ---- adjacency & grouping (Area level: union of member-county neighbors) ---- */
  function countyNeighbors(fips) {
    const a = cid(fips);
    const out = new Set();
    for (const m of county[a]?.counties || [a])
      for (const nb of adjacency.county[m] || []) {
        const n = cid(nb);
        if (n !== a) out.add(n);
      }
    return [...out];
  }

  function statesOf(nid) {
    const s = new Set();
    for (const f of nations.get(nid).counties) s.add(f.slice(0, 2));
    return s;
  }
  function adjacentNations(nid) {
    const mine = statesOf(nid);
    const reach = new Set();
    for (const s of mine) for (const n of adjacency.state[s] || []) reach.add(n);
    const out = new Set();
    for (const [oid, n] of nations) {
      if (oid === nid) continue;
      for (const f of n.counties) if (reach.has(f.slice(0, 2))) { out.add(oid); break; }
    }
    return [...out];
  }
  function annexTargets(nid) {
    const set = new Set();
    for (const f of nations.get(nid).counties)
      for (const nb of countyNeighbors(f)) if (owner.get(nb) !== nid) set.add(nb);
    return set;
  }
  function components(fipsSet, keyFn) {
    const remaining = new Set(fipsSet);
    const out = [];
    while (remaining.size) {
      const start = remaining.values().next().value;
      remaining.delete(start);
      const key = keyFn ? keyFn(start) : null;
      const group = [start], stack = [start];
      while (stack.length) {
        const cur = stack.pop();
        for (const nb of countyNeighbors(cur))
          if (remaining.has(nb) && (!keyFn || keyFn(nb) === key)) { remaining.delete(nb); group.push(nb); stack.push(nb); }
      }
      out.push(group);
    }
    return out;
  }
  const largestCounty = (arr) => arr.reduce((b, f) => (countyPop(f) > countyPop(b) ? f : b), arr[0]);

  const SUFFIX = /\s+(County|Borough|Parish|Census Area|city|City|Municipality|Planning Region)$/;
  const nameForCounty = (fips) => (county[fips]?.name || 'New Republic').replace(SUFFIX, '');

  // nation sharing the most border with a county / group (its "nearest")
  function nearestNation(fips, excludeCounties) {
    const tally = {};
    for (const nb of countyNeighbors(fips)) {
      if (excludeCounties && excludeCounties.has(nb)) continue;
      const o = owner.get(nb);
      if (o) tally[o] = (tally[o] || 0) + 1;
    }
    return argmax(tally);
  }
  function nearestNationForGroup(comp, excludeNation) {
    const inComp = new Set(comp);
    const tally = {};
    for (const f of comp) for (const nb of countyNeighbors(f)) {
      if (inComp.has(nb)) continue;
      const o = owner.get(nb);
      if (o && o !== excludeNation) tally[o] = (tally[o] || 0) + 1;
    }
    return argmax(tally);
  }
  function argmax(tally) {
    let best = null, bc = -1;
    for (const [k, v] of Object.entries(tally)) if (v > bc) { best = k; bc = v; }
    return best;
  }

  /* ---- blue shell: anti-snowball penalty for the biggest nations ---- */
  // returns severity 0..1 (0 = not in the top tier, 1 = the #1 nation)
  function blueShell(nid) {
    const ranked = [...nations.keys()].map((id) => ({ id, pop: nationDemographics(id).pop })).sort((a, b) => b.pop - a.pop);
    const topCount = Math.max(1, Math.round(T('shell.topShare') * ranked.length)); // ~top 10% (5 of 51)
    const idx = ranked.findIndex((x) => x.id === nid);
    if (idx < 0 || idx >= topCount) return 0;
    return (topCount - idx) / topCount;
  }

  /* ---- mutations ---- */
  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach((f) => f()); }

  function moveCounties(fipsList, toId, { silent } = {}) {
    const to = nations.get(toId);
    if (!to) return;
    for (const f of fipsList) {
      const from = owner.get(f);
      if (from === toId) continue;
      if (from != null && nations.has(from)) nations.get(from).counties.delete(f);
      to.counties.add(f);
      owner.set(f, toId);
    }
    pruneEmpty();
    if (!silent) emit();
  }
  function mergeInto(intoId, fromId) {
    const from = nations.get(fromId);
    if (from) moveCounties([...from.counties], intoId, { silent: true });
    emit();
  }
  function createNation(name, countyIds, { color, silent } = {}) {
    const id = 'n' + ++seq;
    nations.set(id, { id, name, color: color || Colors.newColor(), counties: new Set(), origin: false, treasury: 0, gov: 'Republic' });
    moveCounties(countyIds, id, { silent: true });
    if (!silent) emit();
    return id;
  }
  function pruneEmpty() {
    for (const [id, n] of nations) if (n.counties.size === 0) nations.delete(id);
  }

  // Break a set of counties into new nations. Contiguous chunks of at least
  // TUNE nation.minAreas Areas become nations; smaller chunks join their nearest
  // nation (unless a chunk is the only thing there is, in which case it becomes
  // a small nation anyway).
  function breakApart(countyIds, opts = {}) {
    const exclude = opts.exclude || null; // a nation new fragments must not join (e.g. a failed aggressor)
    const comps = components(new Set(countyIds), null).sort((a, b) => b.length - a.length);
    const created = [], small = [];
    for (const comp of comps) {
      if (comp.length >= T('nation.minAreas')) created.push(createNation(nameForCounty(largestCounty(comp)), comp, { silent: true }));
      else small.push(comp);
    }
    // small fragments join their nearest nation; only truly isolated ones become nations
    for (const comp of small) {
      const near = nearestNationForGroup(comp, exclude);
      if (near) moveCounties(comp, near, { silent: true });
      else created.push(createNation(nameForCounty(largestCounty(comp)), comp, { silent: true }));
    }
    pruneEmpty();
    emit();
    return created;
  }

  /* ---- civil war fallout: population + GDP ---- */
  function applyCivilWarCost(loserId, winnerId, score) {
    const loser = nations.get(loserId);
    if (loser && loser.counties.size) {
      let d = 0, g = 0;
      for (const f of loser.counties) { const c = county[f]; if (!c) continue; d += c.demPop; g += c.gopPop; }
      const rulingDem = d >= g;
      const lossPct = clamp(T('war.popLossBase') + score * T('war.popLossPerScore'), T('war.popLossBase'), T('war.popLossMax'));
      const per = (lossPct * (rulingDem ? d : g)) / loser.counties.size; // spread evenly by county
      for (const f of loser.counties) {
        const c = county[f];
        if (!c) continue;
        if (rulingDem) c.demPop = Math.max(0, c.demPop - per);
        else c.gopPop = Math.max(0, c.gopPop - per);
      }
    }
    if (winnerId && nations.has(winnerId) && loser && loser.counties.size) {
      let gdp = 0;
      for (const f of loser.counties) gdp += county[f] ? county[f].gdp : 0;
      const gPct = clamp(T('war.gdpLossBase') + score * T('war.gdpLossPerScore'), T('war.gdpLossBase'), T('war.gdpLossMax'));
      let moved = 0; // each loser county gives up the same fraction; winner gets it all
      for (const f of loser.counties) { const c = county[f]; if (!c) continue; const take = c.gdp * gPct; c.gdp -= take; moved += take; }
      const winner = nations.get(winnerId);
      const perW = moved / winner.counties.size;
      for (const f of winner.counties) { if (county[f]) county[f].gdp += perW; }
    }
    emit();
  }

  /* ---- round-end growth: +rate population (in the nation's party mix) + GDP ---- */
  function growAll(rate) {
    for (const [, n] of nations) {
      let d = 0, g = 0, o = 0;
      for (const f of n.counties) { const c = county[f]; if (!c) continue; d += c.demPop; g += c.gopPop; o += c.othPop; }
      const pop = d + g + o;
      if (pop <= 0) continue;
      const add = pop * rate;
      const fd = d / pop, fg = g / pop, fo = o / pop; // nation's party proportions
      for (const f of n.counties) {
        const c = county[f];
        if (!c) continue;
        const frac = (c.demPop + c.gopPop + c.othPop) / pop; // share of the nation
        c.demPop += add * fd * frac;
        c.gopPop += add * fg * frac;
        c.othPop += add * fo * frac;
        c.gdp *= 1 + rate;
      }
    }
    emit();
  }

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  /* ---- treasury: income (from GDP) minus maintenance, ticked once per world turn ---- */
  function treasuryFlow(nid) {
    const n = nations.get(nid);
    if (!n) return null;
    const gdp = demographics(n.counties).gdp;
    const gov = T('econ.govMaintenance');
    const income = gdp * T('econ.taxRate');
    const maintenance = gdp * (gov[n.gov] ?? gov.Republic) + n.counties.size * T('econ.areaUpkeep');
    return { income, maintenance, delta: income - maintenance };
  }
  function tickTreasuries() {
    for (const [nid, n] of nations) n.treasury += treasuryFlow(nid).delta;
  }
  // trade gains etc: add GDP to a nation, spread evenly across its areas
  function boostGdp(nid, amount) {
    const n = nations.get(nid);
    if (!n || !n.counties.size) return;
    const per = amount / n.counties.size;
    for (const f of n.counties) { if (county[f]) county[f].gdp += per; }
    emit();
  }
  // spendable balance: actions draw from the treasury via this
  function spend(nid, amount) {
    const n = nations.get(nid);
    if (!n || n.treasury < amount) return false;
    n.treasury -= amount;
    emit();
    return true;
  }

  /* ---- save / load (plain JSON in, plain JSON out) ---- */
  function serialize() {
    const counties = {};
    // LOSSLESS. Rounding populations to 2dp would cut a 30-turn save from ~536 KB
    // to ~172 KB, but it also breaks "a save/load round-trip reproduces the state
    // exactly" — and that property is the substrate for replay, the M5 simulator
    // and M2.5's state document, all of which are worth more than 360 KB on a
    // local disk. Size is handled where it actually bites instead: the primary
    // store is the server (M0.2), and the localStorage fallback surfaces its
    // quota error rather than failing silently. Empty ext/attrs bags ARE omitted,
    // which is free.
    for (const [f, c] of Object.entries(county)) {
      const rec = { d: c.demPop, g: c.gopPop, o: c.othPop, gdp: c.gdp };
      for (const p in c.ext) { rec.e = { ...c.ext }; break; }
      for (const k in c.attrs) { rec.a = { ...c.attrs }; break; }
      counties[f] = rec;
    }
    const nats = [];
    for (const [, n] of nations) nats.push({ id: n.id, name: n.name, color: n.color, origin: n.origin, treasury: n.treasury, gov: n.gov, counties: [...n.counties] });
    return { seq, counties, nations: nats };
  }
  function loadState(snap) {
    let dropped = 0;
    for (const [f, c] of Object.entries(snap.counties)) {
      const cc = county[f];
      if (!cc) { dropped++; continue; }
      cc.demPop = c.d; cc.gopPop = c.g; cc.othPop = c.o;
      cc.ext = { ...(c.e || {}) }; cc.attrs = { ...(c.a || {}) }; cc.gdp = c.gdp;
    }
    nations.clear();
    owner.clear();
    let orphans = 0;
    for (const n of snap.nations) {
      // A save made against a different areas.json can name Areas that no longer
      // exist. Skip them here rather than letting them reach growAll as a
      // TypeError three turns later (finding 53).
      const live = n.counties.filter((f) => { if (county[f]) return true; orphans++; return false; });
      if (!live.length) continue;
      nations.set(n.id, { id: n.id, name: n.name, color: n.color, origin: n.origin, treasury: n.treasury || 0, gov: n.gov || 'Republic', counties: new Set(live) });
      for (const f of live) owner.set(f, n.id);
    }
    seq = snap.seq || 0;
    if (dropped || orphans) {
      console.warn(`Game.loadState: ${dropped} unknown Area records and ${orphans} orphan ownership entries were skipped.`);
    }
    emit();
    return { dropped, orphans };
  }

  return {
    init,
    reset,
    serialize,
    loadState,
    county,
    // Area abstraction: an Area is the atomic map unit. Today it maps 1:1 to a
    // county (same record), so all existing county logic already reads through
    // it; future data (region tags, resources, terrain, ...) goes in .attrs.
    area: (id) => county[cid(id)],
    areaAttrs: (id) => county[cid(id)]?.attrs,
    areaIdOf: cid,
    areaCounties: (id) => county[cid(id)]?.counties || [cid(id)],
    treasuryFlow,
    tickTreasuries,
    spend,
    boostGdp,
    nations,
    getOwner: (f) => owner.get(cid(f)),
    getNation: (nid) => nations.get(nid),
    colorForCounty: (f) => nations.get(owner.get(cid(f)))?.color || '#c9ced6',
    countyPop,
    countyGdp,
    demographics,
    nationDemographics,
    leanOf,
    countyNeighbors,
    adjacentNations,
    annexTargets,
    components,
    largestCounty,
    nameForCounty,
    nearestNation,
    blueShell,
    moveCounties,
    mergeInto,
    createNation,
    breakApart,
    applyCivilWarCost,
    growAll,
    onChange,
  };
})();
