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
  let originalNationCount = 0; // the leader tier is a share of THIS, not of the survivors
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
    neighborCache.clear();
    maritimeLinks = null;
    adjacency = null;
    tradeData = null;
    transportData = null;
    seq = 0;
    originalNationCount = 0;
    epoch = 0;
    shellCache = null;
    shellEpoch = -1;
    listeners.length = 0;
  }

  /**
   * Baked trade and transport attributes, keyed by raw county fips.
   *
   * These used to be loaded straight into the RENDERER's `store` and read by
   * app.js helpers, which meant export access and trade capacity — both model
   * quantities that decide what an action can do — were unreachable to anything
   * headless. M2.5 folds them into the state document; for now Game owns them.
   */
  let tradeData = null, transportData = null;

  function init(data, adj, areasDef, extras) {
    adjacency = adj;
    tradeData = (extras && extras.trade) || null;
    transportData = (extras && extras.transport) || null;
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
        // STRUCTURAL ANCHOR: the county's founding political character, in
        // percent, fixed for the life of the game. Political drift pulls partly
        // toward this and a nation can only partly override it. Without a
        // per-county fixed point, drift and owner-mix growth pull every county
        // toward the SAME attractor with nothing pushing back, and the county
        // grid collapses into a nation-level scalar in ~23 turns of half-life.
        // Derived from the baked 2024 result, so it is recomputed at init and
        // needs no place in the save.
        anchor: null,
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
    // Anchors are computed AFTER the Area merge so a merged Area's anchor is the
    // political character of the whole Area, not of its primary county.
    for (const f in county) {
      const c = county[f];
      const core = c.demPop + c.gopPop + c.othPop;
      c.anchor = core > 0
        ? { d: (c.demPop / core) * 100, g: (c.gopPop / core) * 100, o: (c.othPop / core) * 100 }
        : { d: 0, g: 0, o: 0 };
    }
    for (const [st, s] of Object.entries(data.states)) {
      nations.set(st, {
        id: st, name: s.name, color: Colors.forState(st), counties: new Set(), origin: true,
        treasury: 0, gov: 'Republic',
        founded: 0,        // world turn the nation came into being
        homeSt: st,        // its own soil; anything else it holds is OCCUPIED
        lastAnnexTurn: -Infinity,
        lastReleaseTurn: -Infinity,
        tradeCooldown: {}, // partner key -> world turn of the last deal
      });
    }
    for (const [fips, c] of Object.entries(county)) {
      const n = nations.get(c.st);
      if (n) { n.counties.add(fips); owner.set(fips, c.st); }
    }
    originalNationCount = nations.size;
    // Open the books with a few turns of income banked. Without this the treasury
    // is zero at turn 0 and every priced action is unaffordable until several
    // world turns have passed, which reads as a broken action menu, not as scarcity.
    const bank = T('econ.startingTreasuryTurns') * T('econ.taxRate');
    for (const [nid, n] of nations) n.treasury = demographics(n.counties).gdp * bank;
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
  /*
   * Memoized. The Area adjacency graph is derived from immutable data, but this
   * used to allocate a fresh Set and re-walk every member county on EVERY query
   * — and it is the hot loop for the neighbour-pull term in political drift, for
   * contiguity, and for every system M4 adds. M2.4 replaces the cache with a
   * compressed-sparse-row graph built once; the signature stays the same so
   * nothing else has to change.
   */
  const neighborCache = new Map();
  function countyNeighbors(fips) {
    const a = cid(fips);
    let hit = neighborCache.get(a);
    if (hit) return hit;
    const out = new Set();
    for (const m of county[a]?.counties || [a])
      for (const nb of adjacency.county[m] || []) {
        const n = cid(nb);
        if (n !== a) out.add(n);
      }
    hit = [...out];
    neighborCache.set(a, hit);
    return hit;
  }

  function statesOf(nid) {
    const s = new Set();
    for (const f of nations.get(nid).counties) s.add(f.slice(0, 2));
    return s;
  }

  /*
   * MARITIME reach, kept separate from land borders.
   *
   * build_adjacency.py deliberately adds sea links to the STATE table — Alaska
   * borders every Pacific and Canada-border state, Hawaii every Pacific one —
   * and the Unite prompt documents that rule. But the state table was ALSO the
   * only adjacency the game used for partners, and `adjacentNations` degrades
   * into "any nation owning a county in a state adjacent to a state I own a
   * county in" the moment a single county changes hands. California was offered
   * Alaska and Hawaii as overland transit routes on turn 1, before any county
   * moved at all.
   *
   * So: land pairs are derived from the real COUNTY adjacency, and anything in
   * the state table that is not a land pair is a maritime link. Callers pick the
   * reach they actually mean.
   */
  let maritimeLinks = null; // st -> Set(st) of sea-only links
  function buildMaritimeLinks() {
    const land = {};
    for (const [f, nbs] of Object.entries(adjacency.county || {})) {
      const a = f.slice(0, 2);
      for (const nb of nbs) {
        const b = nb.slice(0, 2);
        if (a === b) continue;
        (land[a] = land[a] || new Set()).add(b);
      }
    }
    maritimeLinks = {};
    for (const [st, nbs] of Object.entries(adjacency.state || {})) {
      const sea = new Set();
      for (const other of nbs) if (!(land[st] && land[st].has(other))) sea.add(other);
      if (sea.size) maritimeLinks[st] = sea;
    }
  }

  /** Nations sharing a real land border with `nid`. */
  function borderingNations(nid) {
    const n = nations.get(nid);
    if (!n) return [];
    const out = new Set();
    for (const f of n.counties) {
      for (const nb of countyNeighbors(f)) {
        const o = owner.get(nb);
        if (o && o !== nid) out.add(o);
      }
    }
    return [...out];
  }

  /** Nations reachable only across water (Alaska, Hawaii, the Pacific rim). */
  function maritimeNations(nid) {
    if (!maritimeLinks) buildMaritimeLinks();
    const reach = new Set();
    for (const st of statesOf(nid)) for (const other of maritimeLinks[st] || []) reach.add(other);
    if (!reach.size) return [];
    const out = new Set();
    for (const [oid, n] of nations) {
      if (oid === nid) continue;
      for (const f of n.counties) if (reach.has(f.slice(0, 2))) { out.add(oid); break; }
    }
    return [...out];
  }

  /** Everyone you can reach: a shared land border, or a sea link. */
  function adjacentNations(nid) {
    const out = new Set(borderingNations(nid));
    for (const o of maritimeNations(nid)) out.add(o);
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
  /*
   * Ranked on a COMPOSITE of population, GDP and territory, against a tier size
   * fixed to the ORIGINAL nation count.
   *
   * Ranking on population alone let a nation that pumped GDP escape the shell
   * entirely. Sizing the tier as a share of the SURVIVORS made the anti-snowball
   * weaken exactly as the snowball grew: 5 nations penalised at 51, 2 at 15, 1 at
   * 10 or fewer.
   */
  /*
   * Memoized per mutation. This recomputes demographics for EVERY nation — a full
   * scan of all 1,676 Area records — and then sorts, and it is called from
   * click-driven render paths (startAnnex, renderUnitePreview, the annex cost
   * panel on every selection change). The ranking cannot move without a
   * mutation, so `epoch` invalidates it.
   */
  let shellCache = null, shellEpoch = -1;
  function blueShell(nid) {
    if (shellEpoch === epoch && shellCache) return shellCache.get(nid) || 0;
    const rows = [...nations.keys()].map((id) => {
      const d = nationDemographics(id);
      return { id, pop: d.pop, gdp: d.gdp, areas: nations.get(id).counties.size };
    });
    let maxPop = 0, maxGdp = 0, maxAreas = 0;
    for (const r of rows) {
      if (r.pop > maxPop) maxPop = r.pop;
      if (r.gdp > maxGdp) maxGdp = r.gdp;
      if (r.areas > maxAreas) maxAreas = r.areas;
    }
    for (const r of rows) {
      r.score = (maxPop ? r.pop / maxPop : 0) + (maxGdp ? r.gdp / maxGdp : 0) + (maxAreas ? r.areas / maxAreas : 0);
    }
    rows.sort((a, b) => b.score - a.score);
    const base = originalNationCount || rows.length;
    const topCount = Math.max(1, Math.round(T('shell.topShare') * base));
    shellCache = new Map();
    for (let i = 0; i < topCount && i < rows.length; i++) {
      shellCache.set(rows[i].id, (topCount - i) / topCount);
    }
    shellEpoch = epoch;
    return shellCache.get(nid) || 0;
  }

  /* ---- mutations ---- */
  /*
   * emit() carries a REASON. Without one, every mutation forced the renderer to
   * clear the outline cache, re-mesh all 9,869 arcs of the county topology,
   * rewrite 3,232 fills and rebuild the leaderboard — even for a pure treasury
   * change. One annex cost two of those cascades; a transit trade cost two for a
   * change that moved no border at all.
   *
   *   ownership : who owns what changed  -> borders, outline cache, standard fill
   *   values    : population/GDP/treasury changed -> value fills, leaderboard, panel
   *   roster    : nations were created or destroyed -> turn order, banner
   *
   * batch(fn) suppresses emits for the duration of fn and fires ONE merged emit
   * afterwards, so a multi-step mutation renders once.
   */
  function onChange(fn) { listeners.push(fn); }

  let batchDepth = 0;
  let pending = null;
  /** Bumped on every emit. Caches that are only valid between mutations key on it. */
  let epoch = 0;

  const FULL = { ownership: true, values: true, roster: true };

  function merge(into, r) {
    into.ownership = into.ownership || !!r.ownership;
    into.values = into.values || !!r.values;
    into.roster = into.roster || !!r.roster;
    return into;
  }

  const NONE = () => ({ ownership: false, values: false, roster: false });

  function emit(reason) {
    // Always hand listeners all three bits. A partial object would make
    // `reason.ownership` undefined, which reads as false but tests as neither.
    const r = merge(NONE(), reason || FULL);
    if (batchDepth > 0) {
      pending = merge(pending || NONE(), r);
      return;
    }
    epoch++;
    listeners.forEach((f) => f(r));
  }

  /** Run fn with emits suppressed, then emit once with everything fn touched. */
  function batch(fn) {
    batchDepth++;
    try {
      return fn();
    } finally {
      batchDepth--;
      if (batchDepth === 0 && pending) {
        const r = pending;
        pending = null;
        epoch++;
        listeners.forEach((f) => f(r));
      }
    }
  }

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
    const removed = pruneEmpty();
    if (!silent) emit({ ownership: true, roster: removed > 0 });
  }
  function mergeInto(intoId, fromId) {
    batch(() => {
      const from = nations.get(fromId);
      if (from) moveCounties([...from.counties], intoId, { silent: true });
      emit({ ownership: true, roster: true });
    });
  }
  /** The state most of a set of Areas sits in — a new nation's home soil. */
  function modalState(countyIds) {
    const tally = {};
    for (const f of countyIds) {
      const c = county[f];
      if (c) tally[c.st] = (tally[c.st] || 0) + 1;
    }
    return argmax(tally);
  }

  function createNation(name, countyIds, { color, silent, founded } = {}) {
    const id = 'n' + ++seq;
    nations.set(id, {
      id, name, color: color || Colors.newColor(), counties: new Set(), origin: false,
      treasury: 0, gov: 'Republic',
      founded: founded == null ? (typeof World !== 'undefined' ? World.getTurn() : 0) : founded,
      homeSt: modalState(countyIds),
      lastAnnexTurn: -Infinity,
      lastReleaseTurn: -Infinity,
      tradeCooldown: {},
    });
    moveCounties(countyIds, id, { silent: true });
    if (!silent) emit({ ownership: true, roster: true });
    return id;
  }
  /** Delete nations with no territory. Returns how many were removed. */
  function pruneEmpty() {
    let n = 0;
    for (const [id, rec] of nations) if (rec.counties.size === 0) { nations.delete(id); n++; }
    return n;
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
    emit({ ownership: true, roster: true });
    return created;
  }

  /**
   * Which bloc actually rules a set of Areas: 'dem', 'gop', 'oth', or the name of
   * an emergent movement. Returns null for an empty set.
   *
   * The old test was `d >= g` over demPop and gopPop alone, so a nation whose
   * real plurality was an emergent movement bled the WRONG bloc, and a movement
   * could never take a single casualty however many wars it lost. `Other` was
   * invisible too.
   */
  function rulingBloc(countyIds) {
    const tally = { dem: 0, gop: 0, oth: 0 };
    for (const f of countyIds) {
      const c = county[f];
      if (!c) continue;
      tally.dem += c.demPop; tally.gop += c.gopPop; tally.oth += c.othPop;
      for (const p in c.ext) tally['ext:' + p] = (tally['ext:' + p] || 0) + c.ext[p];
    }
    let best = null, bv = -1;
    for (const k of Object.keys(tally).sort()) if (tally[k] > bv) { best = k; bv = tally[k]; }
    return bv > 0 ? best : null;
  }

  /** Read/write one bloc's head count on an Area record. */
  const blocGet = (c, bloc) =>
    bloc === 'dem' ? c.demPop : bloc === 'gop' ? c.gopPop : bloc === 'oth' ? c.othPop
      : (c.ext[bloc.slice(4)] || 0);
  function blocScale(c, bloc, k) {
    if (bloc === 'dem') c.demPop *= k;
    else if (bloc === 'gop') c.gopPop *= k;
    else if (bloc === 'oth') c.othPop *= k;
    else {
      const name = bloc.slice(4);
      if (c.ext[name]) c.ext[name] *= k;
    }
  }

  /* ---- civil war fallout: population + GDP ---- */
  /*
   * Both halves distribute PROPORTIONALLY to each Area's existing share, never
   * as a flat per-Area amount.
   *
   * The population loss used to be `lossPct * total / counties.size` subtracted
   * from every Area and clamped at zero, so a 12k-person rural Area and a
   * 9.8M-person metro Area lost the same absolute head count. Measured at the
   * 40% cap: California had its Democratic population driven to zero in 34 of 58
   * Areas and only 57.3% of the intended loss was actually applied; New York
   * 32/50 and 66.7%. The severity dial was broken — doubling the score did not
   * double the casualties, because the clamp ate 30-58% of it on exactly the
   * nations meant to suffer most — and it flattened the political map wherever
   * it landed.
   *
   * A proportional loss is scale-free, exact, and cannot clamp.
   */
  function applyCivilWarCost(loserId, winnerId, score) {
    const loser = nations.get(loserId);
    if (loser && loser.counties.size) {
      const bloc = rulingBloc(loser.counties);
      if (bloc) {
        const lossPct = clamp(T('war.popLossBase') + score * T('war.popLossPerScore'), T('war.popLossBase'), T('war.popLossMax'));
        const k = 1 - lossPct;
        for (const f of loser.counties) {
          const c = county[f];
          if (c) blocScale(c, bloc, k);
        }
      }
    }
    if (winnerId && nations.has(winnerId) && loser && loser.counties.size) {
      const gPct = clamp(T('war.gdpLossBase') + score * T('war.gdpLossPerScore'), T('war.gdpLossBase'), T('war.gdpLossMax'));
      let moved = 0; // each loser Area gives up the same fraction of its own GDP
      for (const f of loser.counties) { const c = county[f]; if (!c) continue; const take = c.gdp * gPct; c.gdp -= take; moved += take; }
      // ...and the winner receives it in proportion to where its economy already
      // is, so reparations do not flatten the victor's GDP map either.
      addGdpProportionally(nations.get(winnerId), moved);
    }
    emit({ values: true });
  }

  /**
   * Add `amount` of GDP across a nation's Areas in proportion to their existing
   * GDP. An even split is what erased the economic geography every map mode and
   * the market depend on: 50 rounds of trading drove every Area in a nation
   * toward the same output.
   *
   * Falls back to an even split only when the nation has no GDP at all to
   * proportion against.
   */
  function addGdpProportionally(n, amount) {
    if (!n || !n.counties.size || !amount) return;
    let total = 0;
    for (const f of n.counties) if (county[f]) total += county[f].gdp;
    if (total > 0) {
      for (const f of n.counties) {
        const c = county[f];
        if (c) c.gdp += amount * (c.gdp / total);
      }
    } else {
      const per = amount / n.counties.size;
      for (const f of n.counties) { if (county[f]) county[f].gdp += per; }
    }
  }

  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  /**
   * Areas a nation holds that are not its own soil.
   * An origin nation's soil is its state; a nation born from a breakup takes the
   * state most of its founding Areas sat in. M4.5 replaces this with a real
   * occupied flag and scales the cost by per-Area hostility.
   */
  function occupiedCount(nid) {
    const n = nations.get(nid);
    if (!n) return 0;
    let k = 0;
    for (const f of n.counties) {
      const c = county[f];
      if (c && c.st !== n.homeSt) k++;
    }
    return k;
  }

  /* ---- export access & trade capacity (from the baked trade/transport data) ---- */
  /** Does this Area carry a port, or a Canada/Mexico border gateway? */
  function areaExport(fips) {
    const members = county[cid(fips)]?.counties || [cid(fips)];
    const t = tradeData, x = transportData;
    return {
      port: !!(t && t.counties && members.some((m) => t.counties[m] && t.counties[m].has_port)),
      canada: !!(x && x.external && members.some((m) => x.external.Canada.includes(m))),
      mexico: !!(x && x.external && members.some((m) => x.external.Mexico.includes(m))),
      railHub: !!(x && x.counties && members.some((m) => x.counties[m] && x.counties[m].rail_hub)),
    };
  }

  /** Ports, land gateways and rail hubs a nation holds. */
  function exportAccess(nid) {
    const n = nations.get(nid);
    const acc = { ports: 0, canada: 0, mexico: 0, railHubs: 0, gateways: 0, any: false };
    if (!n) return acc;
    for (const aid of n.counties) {
      const e = areaExport(aid);
      if (e.port) acc.ports++;
      if (e.canada) acc.canada++;
      if (e.mexico) acc.mexico++;
      if (e.railHub) acc.railHubs++;
    }
    acc.gateways = acc.canada + acc.mexico;
    acc.any = acc.ports + acc.gateways > 0;
    return acc;
  }

  /**
   * How much trade a nation can physically move in a turn, in $M.
   *
   * This is the first thing that makes the baked port / rail-hub / border-gateway
   * data do work. Without a capacity cap the world market absorbs a nation's
   * ENTIRE surplus in one click, which is what made it dominate bilateral trade
   * by 1.7x-50x: a bilateral deal is clipped by whatever deficit the neighbour
   * happens to run, so the external option won on volume no matter what rate it
   * paid. Cap the volume and the rate becomes the thing that decides.
   */
  function tradeCapacity(nid) {
    const acc = exportAccess(nid);
    const total = T('trade.capacityBase')
      + acc.ports * T('trade.capacityPerPort')
      + acc.railHubs * T('trade.capacityPerRailHub')
      + acc.gateways * T('trade.capacityPerGateway');
    return { ...acc, total };
  }

  /* ---- treasury: income (from GDP) minus maintenance, ticked once per world turn ---- */
  function treasuryFlow(nid) {
    const n = nations.get(nid);
    if (!n) return null;
    const gdp = demographics(n.counties).gdp;
    const gov = T('econ.govMaintenance');
    const income = gdp * T('econ.taxRate');
    const base = T('econ.areaUpkeep');

    // Occupation is SUPERLINEAR in how much foreign ground you sit on, so past a
    // point conquest stops paying for itself. Anti-snowball brake #2: holding 25
    // occupied Areas doubles their upkeep, 100 costs ~5x, 400 costs ~24x.
    const occ = occupiedCount(nid);
    const ref = T('econ.occupationRef');
    const surcharge = occ ? occ * base * Math.pow(occ / ref, T('econ.occupationAlpha')) : 0;

    const administration = n.counties.size * base;
    const maintenance = gdp * (gov[n.gov] ?? gov.Republic) + administration + surcharge;
    return { income, maintenance, administration, occupation: surcharge, occupied: occ, delta: income - maintenance };
  }
  function tickTreasuries() {
    for (const [nid, n] of nations) n.treasury += treasuryFlow(nid).delta;
  }
  // Trade gains etc: add GDP to a nation, in proportion to where its economy
  // already is. An even split flattened the map that the market, every value map
  // mode and the target design's economic win condition all read.
  function boostGdp(nid, amount) {
    const n = nations.get(nid);
    if (!n || !n.counties.size) return;
    addGdpProportionally(n, amount);
    emit({ values: true });
  }
  /**
   * Credit the treasury. The counterpart of spend().
   *
   * Trade income used to be added to GDP via boostGdp, which minted GDP out of
   * nothing for both sides every turn — the goods had already been counted when
   * they were produced — while the treasury, which every action now draws on,
   * received nothing at all. Eleven of the fifty-one nations ran a permanent
   * structural deficit from turn 1 with no recovery path.
   */
  function earn(nid, amount) {
    const n = nations.get(nid);
    if (!n || !amount) return false;
    n.treasury += amount;
    emit({ values: true });
    return true;
  }

  // spendable balance: actions draw from the treasury via this
  function spend(nid, amount) {
    const n = nations.get(nid);
    if (!n || n.treasury < amount) return false;
    n.treasury -= amount;
    emit({ values: true });
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
    for (const [, n] of nations) nats.push({
      id: n.id, name: n.name, color: n.color, origin: n.origin, treasury: n.treasury, gov: n.gov,
      founded: n.founded, homeSt: n.homeSt,
      // -Infinity does not survive JSON; null means "has never annexed".
      lastAnnexTurn: Number.isFinite(n.lastAnnexTurn) ? n.lastAnnexTurn : null,
      lastReleaseTurn: Number.isFinite(n.lastReleaseTurn) ? n.lastReleaseTurn : null,
      tradeCooldown: { ...n.tradeCooldown },
      counties: [...n.counties],
    });
    return { seq, originalNationCount, counties, nations: nats };
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
      // exist. Skip them here rather than letting them reach a world phase as a
      // TypeError three turns later (finding 53).
      const live = n.counties.filter((f) => { if (county[f]) return true; orphans++; return false; });
      if (!live.length) continue;
      nations.set(n.id, {
        id: n.id, name: n.name, color: n.color, origin: n.origin,
        treasury: n.treasury || 0, gov: n.gov || 'Republic',
        founded: n.founded || 0,
        homeSt: n.homeSt || modalState(live),
        lastAnnexTurn: n.lastAnnexTurn == null ? -Infinity : n.lastAnnexTurn,
        lastReleaseTurn: n.lastReleaseTurn == null ? -Infinity : n.lastReleaseTurn,
        tradeCooldown: { ...(n.tradeCooldown || {}) },
        counties: new Set(live),
      });
      for (const f of live) owner.set(f, n.id);
    }
    seq = snap.seq || 0;
    originalNationCount = snap.originalNationCount || nations.size;
    if (dropped || orphans) {
      console.warn(`Game.loadState: ${dropped} unknown Area records and ${orphans} orphan ownership entries were skipped.`);
    }
    emit(FULL);
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
    anchorOf: (id) => county[cid(id)]?.anchor,
    treasuryFlow,
    tickTreasuries,
    occupiedCount,
    rulingBloc,
    earn,
    areaExport,
    exportAccess,
    tradeCapacity,
    originalNations: () => originalNationCount,
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
    borderingNations,
    maritimeNations,
    annexTargets,
    components,
    largestCounty,
    nameForCounty,
    nearestNation,
    blueShell,
    epoch: () => epoch,
    moveCounties,
    mergeInto,
    createNation,
    breakApart,
    applyCivilWarCost,
    onChange,
    batch,
    /** Declare a change made by writing the records directly (world.js's phase
     *  writeback). Inside batch() it merges into the one pending emit. */
    touch: (reason) => emit(reason),
  };
})();
