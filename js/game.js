/*
 * Game state for Nation States.
 *
 * Politics is SIX SYMMETRIC IDEOLOGIES ON TWO AXES (js/ideology.js). Each Area
 * carries one head count per ideology, and every political question is answered
 * by distance on that plane rather than by comparing a letter.
 *
 *   area   : fips -> { name, st, pop: number[6], mov: {name -> count},
 *                      gdp, attrs, anchor: number[6] }
 *   nation : { id, name, color, counties: Set<fips>, origin, treasury, gov, ... }
 *   owner  : fips -> nationId
 *
 * `pop[i]` is the head count of ideology i. `mov[name]` is how many of those
 * people belong to an organised MOVEMENT — a movement is not an ideology, it is
 * a named regional faction that HAS one, so `mov[name]` is a slice of
 * `pop[ideologyOf(name)]` and never exceeds it. M4 gives movements their own
 * entity and replaces the head count with a sentiment value.
 *
 * WHAT THIS REPLACED. `demPop / gopPop / othPop / ext{}` plus
 * `lean: dem >= gop ? 'D' : 'R'` — a binary enum answered with `===` by four
 * separate game decisions across eight files, which also ignored `ext`
 * entirely, so a nation that was 40% Deseret / 31% R / 29% D reported its lean
 * as a minority party.
 */
const Game = (function () {
  const county = {};
  const nations = new Map();
  const alias = {}; // merged member county fips -> its Area id

  /*
   * OWNERSHIP IS STORED IN EXACTLY ONE PLACE: `state.owner`, an Int16Array of
   * nation indices keyed by Area node.
   *
   * It used to live in two — `owner: Map<fips,nid>` AND `nation.counties:
   * Set<fips>` — hand-synced in moveCounties and loadState. Two sources of truth
   * for the same fact is a bug waiting for the third writer, and the target
   * design adds occupier, claimant, homeland and garrison on top of it; each
   * would either add another parallel index or bolt onto the same object.
   *
   * `nation.counties` still exists, because a hundred call sites iterate it, but
   * it is now DERIVED: a getter that rebuilds every nation's Set in one pass
   * when the ownership epoch has moved. Ownership changes are rare (annex,
   * release, civil war) and reads are frequent, so that is one O(n) rebuild per
   * mutation, not per read.
   */
  /*
   * THE CLOCK. Territorial history is stamped with the world turn, and
   * `moveCounties` had no way to read it: `World.turn` is a module-private
   * counter and world.js loads AFTER game.js, so a top-level read is not
   * available and a call is only safe inside a function body. One accessor,
   * defensive about load order, rather than the same guard at four call sites.
   */
  const worldTurn = () => (typeof World !== 'undefined' && World.getTurn ? World.getTurn() : 0);

  const nationIdList = [];            // nation index -> nation id
  const nationIdx = new Map();        // nation id -> nation index
  let ownerEpoch = 0, derivedEpoch = -1;

  /** Index for a nation id, assigned on first use and never reused. */
  function nationIndexOf(nid) {
    let i = nationIdx.get(nid);
    if (i === undefined) { i = nationIdList.length; nationIdList.push(nid); nationIdx.set(nid, i); }
    return i;
  }
  const ownerIndexAt = (node) => (node < 0 ? -1 : state.owner[node]);
  const ownerIdAt = (node) => { const i = ownerIndexAt(node); return i < 0 ? undefined : nationIdList[i]; };
  function setOwnerNode(node, nid) {
    if (node < 0) return;
    state.owner[node] = nid == null ? -1 : nationIndexOf(nid);
    ownerEpoch++;
  }
  /** Rebuild every nation's derived county Set, if ownership has moved. */
  function refreshCounties() {
    if (derivedEpoch === ownerEpoch || !state) return;
    for (const [, n] of nations) n._counties.clear();
    for (let i = 0; i < state.n; i++) {
      const oi = state.owner[i];
      if (oi < 0) continue;
      const n = nations.get(nationIdList[oi]);
      if (n) n._counties.add(state.idAt(i));
    }
    derivedEpoch = ownerEpoch;
  }
  /**
   * The government of a nation.
   *
   * `gov` was the string 'Republic', used as a lookup key into a maintenance
   * table with one entry — so it was a constant wearing a variable's clothes.
   * It is now a record, because M3 needs two things out of it that a string
   * cannot carry: the TYPE (which sets the maintenance rate and, in M3.3, how
   * much dissent the state tolerates) and the RULING IDEOLOGY (which is what
   * "aligned vs misaligned population" is measured against).
   *
   * `rulingIdeology` is null until a nation has a population to read — it is
   * derived, refreshed once per turn, and stored so that a nation that changes
   * hands does not silently change government on the same tick that its
   * demographics move.
   */
  /**
   * @param spec a type string (a new nation), or a stored gov record (a load).
   *
   * `since` is READ FROM THE SPEC when there is one. Stamping it with the
   * current turn on every construction meant a load re-dated every government in
   * the world to the turn the save was opened, so a save round-trip was not the
   * identity and Authority's "how long has this ideology held power" was reset
   * by the act of loading.
   */
  function makeGov(spec) {
    const g = typeof spec === 'string' ? { type: spec } : (spec || {});
    return {
      type: g.type || 'Republic',
      rulingIdeology: g.rulingIdeology == null ? null : g.rulingIdeology,
      since: g.since == null ? worldTurn() : g.since,   // when this ideology took power
      // null = never deliberately changed course, which is not the same as
      // "changed course on turn 0" (see changeRulingIdeology).
      lastChange: g.lastChange == null ? null : g.lastChange,
      /*
       * The turn an election was lost, and to whom it was lost FROM (M7.10).
       *
       * Carried through `makeGov` explicitly, like everything else here: `gov`
       * is serialized wholesale with a spread and rebuilt through this function,
       * so a field that is not named here is silently dropped by a save — which
       * would reopen a game with the result already conceded and the choice
       * gone.
       */
      lostAt: g.lostAt == null ? null : g.lostAt,
      lostFrom: g.lostFrom == null ? null : g.lostFrom,
    };
  }

  /**
   * Build a nation record whose `counties` is a view of the ownership column.
   *
   * HISTORY. Authority is a function of age, of ground held without losing it,
   * and of what a nation has taken and lost — and none of that could be computed
   * because the record had seven fields and no memory. Every territorial change
   * in the game flows through `moveCounties`, and it recorded nothing.
   *
   *   founded   world turn the nation came into being
   *   annexed[] {turn, from, areas} — one entry per acquisition
   *   lost[]    {turn, to, areas}   — one entry per loss
   *
   * They are event LISTS rather than counters because Authority weights recent
   * events more than old ones, and a counter cannot be windowed after the fact.
   * The lists are bounded (see `remember`), because a save is a document and an
   * 80-turn game must not carry an unbounded one.
   */
  function makeNation(props) {
    const n = {
      annexed: [],
      lost: [],
      authority: null,   // power STOCKS (js/power.js); null until first computed
      influence: null,
      qol: null,
      liberties: null,
      ...props,
      gov: makeGov(props.gov),
      _counties: new Set(),
    };
    Object.defineProperty(n, 'counties', {
      enumerable: true,
      get() { refreshCounties(); return n._counties; },
    });
    nationIndexOf(n.id);
    return n;
  }

  /**
   * Append a territorial event, keeping only the recent window.
   *
   * Authority reads a window, not the whole history, so the tail is dead weight
   * in every save and every turn's recompute. `nation.historyWindow` turns of
   * events is what is kept; the running totals survive the trim, because
   * "has this nation ever lost ground" is a different question from "has it lost
   * ground lately" and both get asked.
   */
  function remember(n, list, entry) {
    list.push(entry);
    const window = T('nation.historyWindow');
    const cutoff = entry.turn - window;
    if (list.length > 1 && list[0].turn < cutoff) {
      let i = 0;
      while (i < list.length && list[i].turn < cutoff) i++;
      list.splice(0, i);
    }
  }
  const cid = (f) => alias[f] || f;
  let adjacency = null;
  let state = null;   // the columnar Area store (js/state.js)
  let seq = 0;
  let originalNationCount = 0; // the leader tier is a share of THIS, not of the survivors
  /*
   * WHO THE HUMAN IS.
   *
   * Until M6.2 there was no such thing: `grep -rni "player" js/*.js` returned
   * zero hits across thirteen modules, and the only gate on acting was "is it
   * this nation's turn", which the human satisfied fifty-one times a round. That
   * is upstream of every balance complaint in the review. If you control both
   * the aggressor and the victim then an annexation is not a risk, it is a
   * transfer between two of your own accounts — and every anti-snowball device
   * in the game is a speed bump you route around by taking the other nation's
   * turn.
   *
   * It lives HERE, in the model, and not in `store`, for the same reason the
   * turn order does: it is saved state, the headless suite has to be able to set
   * it, and a renderer that owns a model invariant is a renderer the simulator
   * silently disagrees with.
   *
   * It is an id and not a nation reference, deliberately. A nation can cease to
   * exist; the answer to "who were you playing" must survive that, because
   * losing is a thing the game has to be able to say out loud (M6.4). So
   * `getPlayer()` can name a nation that is gone, and `playerNation()` is the
   * one that returns null.
   */
  let player = null;
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
    nationIdList.length = 0;
    nationIdx.clear();
    ownerEpoch = 0;
    derivedEpoch = -1;
    graph = null;
    state = null;
    maritimeLinks = null;
    adjacency = null;
    tradeData = null;
    transportData = null;
    seq = 0;
    originalNationCount = 0;
    player = null;
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

  /** Cultural-region name for an Area, used only to steer the Other split. */
  function regionIndexFrom(cultureDoc) {
    if (!cultureDoc || !cultureDoc.assign) return () => null;
    const names = {};
    (function walk(ns) {
      for (const n of ns) { names[n.id] = n.name; walk(n.children || []); }
    })(cultureDoc.nodes || []);
    return (aid) => {
      const path = cultureDoc.assign[aid];
      if (!path || !path.length) return null;
      return names[path[1]] || names[path[0]] || null;
    };
  }

  function init(data, adj, areasDef, extras) {
    adjacency = adj;
    graph = null;
    state = null;
    tradeData = (extras && extras.trade) || null;
    transportData = (extras && extras.transport) || null;
    const regionOf = regionIndexFrom((extras && extras.culture) || null);
    const N = Ideology.count();

    /*
     * Stage 1: exact integer R / D / Other counts per COUNTY.
     *
     * `pop * share/100` for three parties gives three floats that do not sum to
     * the integer population — measured, that is 986 of 3,143 counties, worst
     * case Clark County NV at 2,398,870.9999999995 for 2,398,871 people. The
     * exact-sum absorption (js/counts.js) makes "the counts sum to the
     * population" an equality instead of an approximation with an undocumented
     * tolerance.
     */
    for (const [fips, r] of Object.entries(data.counties)) {
      const pop = r.pop || 0;
      const dem = r.dem != null ? r.dem : 0;
      const gop = r.gop != null ? r.gop : 0;
      const oth = r.other != null ? r.other : Math.max(0, 100 - dem - gop);
      const split = Counts.countsFromShares(pop, { d: dem, g: gop, o: oth });
      county[fips] = {
        name: r.name,
        st: r.st,
        raw: { d: split.d, g: split.g, o: split.o }, // dropped after stage 3
        pop: null,
        mov: {},           // movement name -> head count (a slice of its ideology)
        gdp: r.gdp || 0,
        attrs: {},         // Area attributes: region tags, resources, terrain, ...
        anchor: null,
      };
    }

    // Stage 2: collapse merged Areas (data/areas.json). The Area becomes the
    // atomic unit; people and GDP are summed and the member list is kept.
    if (areasDef && areasDef.areas) {
      for (const [aid, members] of Object.entries(areasDef.areas)) {
        const rec = county[aid];
        if (!rec) continue;
        rec.counties = members.slice();
        rec.name = rec.name.replace(/ (County|Parish|Borough|Census Area|city|City)$/, '') + ' Area';
        for (const m of members) {
          if (m === aid || !county[m]) continue;
          const c = county[m];
          rec.raw.d += c.raw.d; rec.raw.g += c.raw.g; rec.raw.o += c.raw.o;
          rec.gdp += c.gdp;
          delete county[m];
          alias[m] = aid;
        }
      }
    }

    /*
     * Stage 2b: the ONE index. Every Area gets a node number here, and the graph
     * and the columnar state are both keyed on it, so "node 412" means the same
     * Area in the adjacency walk and in `state.pop`. Built before stage 3
     * because stage 3 writes populations, and populations now live in a column.
     */
    const ids = Object.keys(county);
    buildGraph(ids);
    state = new AreaState(ids, { mixWidth: N });
    for (let i = 0; i < ids.length; i++) county[ids[i]] = makeView(ids[i], i, county[ids[i]]);

    /*
     * Stage 3: map onto the six ideologies. R -> red, D -> blue, and OTHER split
     * across the remaining four BY REGION.
     *
     * Other is the residual that everything outside the two-party system lived
     * in, and a third-party voter in Vermont is not the same person as one in
     * Alabama; content/ideologies.json carries the per-region weights. Done here
     * rather than per county so a merged Area takes one region's texture instead
     * of a blend of its members'.
     *
     * The STRUCTURAL ANCHOR is the result, as shares: the Area's founding
     * political character, fixed for the life of the game. Political drift pulls
     * partly toward it and a nation can only partly override it. Without a
     * per-Area fixed point, drift and owner-mix growth pull every Area toward
     * the SAME attractor with nothing pushing back, and the grid collapses into
     * a nation-level scalar with a 23-turn half-life.
     */
    const RED = Ideology.index('red'), BLUE = Ideology.index('blue');
    for (const f in county) {
      const c = county[f];
      const region = regionOf(f);
      // Kept on the Area, not just consumed here: the West slice picks its
      // scenario by region and the simulator reports by region, and both would
      // otherwise have to re-walk the culture tree to learn what init knew.
      if (region) c.attrs.culture = region;
      const w = Ideology.otherWeights(region);
      const shares = {};
      for (let i = 0; i < N; i++) shares[i] = w[i] * c.raw.o;
      if (RED >= 0) shares[RED] += c.raw.g;
      if (BLUE >= 0) shares[BLUE] += c.raw.d;
      const total = c.raw.d + c.raw.g + c.raw.o;
      // scale = the share total, so countsFromShares treats these as weights
      const split = Counts.countsFromShares(total, shares, total || 1);
      const pop = c.pop;
      for (let i = 0; i < N; i++) pop[i] = split[i] || 0;
      c.anchor = Ideology.shares(pop);
      delete c.raw;
    }
    for (const [st, s] of Object.entries(data.states)) {
      nations.set(st, makeNation({
        id: st, name: s.name, color: Colors.forState(st), origin: true,
        treasury: 0, gov: 'Republic',
        founded: 0,        // world turn the nation came into being
        homeSt: st,        // its own soil; anything else it holds is OCCUPIED
        lastAnnexTurn: -Infinity,
        lastReleaseTurn: -Infinity,
        lastUniteTurn: -Infinity,
        lastAutonomyTurn: -Infinity,
        tradeCooldown: {}, // partner key -> world turn of the last deal
      }));
    }
    for (let i = 0; i < ids.length; i++) {
      const st = county[ids[i]].st;
      if (nations.has(st)) setOwnerNode(i, st);
    }
    originalNationCount = nations.size;
    // NOT refreshGovernments() here: `init` is not the end of world
    // construction. Movement seeding runs next and converts population between
    // ideologies, and in a state as close as Wisconsin that flips the answer.
    // `Parties.setup` refreshes when it is done moving people.
    // Open the books with a few turns of income banked. Without this the treasury
    // is zero at turn 0 and every priced action is unaffordable until several
    // world turns have passed, which reads as a broken action menu, not as scarcity.
    const bank = T('econ.startingTreasuryTurns') * T('econ.taxRate');
    for (const [nid, n] of nations) n.treasury = demographics(n.counties).gdp * bank;
  }

  /**
   * An Area record, backed by the columns.
   *
   * `Game.county[f]` is read and written in a hundred places above the model —
   * `c.pop[2]`, `c.gdp += x`, `c.pop = v.pop` — and none of them should have to
   * know that the storage is now flat. So the record keeps its shape and its
   * numeric fields become accessors onto the columns. `pop` and `anchor` hand
   * back the CACHED subarray view for that Area, so a read in a hot loop
   * allocates nothing and a write through it writes the state.
   *
   * The fields that are not numbers per Area stay plain properties: `name` and
   * `st` are strings, `counties` is the merged member list, `attrs` is the
   * extension bag, and `mov` is a sparse name->count map. `mov` becomes the
   * `Float32Array sentiment` matrix in M4, when there is a value for every
   * (Area, movement) pair rather than only for the ones that were seeded.
   */
  function makeView(id, i, rec) {
    const v = {
      name: rec.name,
      st: rec.st,
      mov: rec.mov,
      attrs: rec.attrs,
      raw: rec.raw,          // dropped at the end of init
      node: i,               // its index in the graph and in every column
    };
    if (rec.counties) v.counties = rec.counties;
    Object.defineProperty(v, 'pop', {
      enumerable: true,
      get: () => state.slot('pop', i),
      set: (src) => { const s = state.slot('pop', i); if (src === s) return; s.fill(0); s.set(src); },
    });
    Object.defineProperty(v, 'anchor', {
      enumerable: true,
      get: () => state.slot('anchor', i),
      set: (src) => { const s = state.slot('anchor', i); if (src === s) return; s.fill(0); s.set(src); },
    });
    Object.defineProperty(v, 'gdp', {
      enumerable: true,
      get: () => state.gdp[i],
      set: (x) => { state.gdp[i] = x; },
    });
    // Seed the columns from whatever the plain record already held. Stages 1 and
    // 2 run before the columns exist, so GDP is summed onto the record; without
    // this line the view is created over a zeroed column and every dollar in the
    // country is silently discarded at the moment the record becomes a view.
    if (rec.gdp) state.gdp[i] = rec.gdp;
    if (rec.pop) v.pop = rec.pop;
    if (rec.anchor) v.anchor = rec.anchor;
    return v;
  }

  /* ---- per-Area reads ---- */
  const areaPop = (c) => { let t = 0; for (let i = 0; i < c.pop.length; i++) t += c.pop[i]; return t; };
  const countyPop = (f) => { const c = county[cid(f)]; return c ? areaPop(c) : 0; };
  const countyGdp = (f) => county[cid(f)]?.gdp || 0;

  /**
   * One Area's politics: the ideology counts, their shares, which one leads, and
   * which organised movements hold ground there.
   *
   * This replaced `leanOf`, whose whole answer was a D-or-R letter plus a margin
   * — and which ignored movements entirely, so an Area that was 40% Deseret
   * reported a minority party as its lean.
   */
  function areaPolitics(fips) {
    const c = county[cid(fips)];
    if (!c) return null;
    const total = areaPop(c);
    if (!total) return null;
    const mix = c.pop.slice();
    const shares = Ideology.shares(mix);
    const movements = {};
    for (const m in c.mov) if (c.mov[m] > 0) movements[m] = (c.mov[m] / total) * 100;
    return {
      pop: total, mix, shares,
      dominant: Ideology.dominantIndex(mix),
      dominantId: Ideology.dominantId(mix),
      centroid: Ideology.centroid(mix),
      cohesion: Ideology.cohesion(mix),
      movements,
    };
  }

  /* ---- aggregate demographics ---- */
  /**
   * The political and economic totals of a set of Areas.
   *
   * `mix` is the head count per ideology and `shares` the same in percent;
   * `dominant` is an index into the ideology table, `centroid` a position on the
   * two axes. There is no `lean`: the question "which way does this lean" has no
   * single-letter answer once there are six ideologies, and every caller that
   * used to ask it now asks how far apart two centroids are.
   */
  function demographics(countyIds) {
    const N = Ideology.count();
    const mix = new Array(N).fill(0);
    const movements = {};
    let gdp = 0;
    for (const f of countyIds) {
      const c = county[f];
      if (!c) continue;
      for (let i = 0; i < N; i++) mix[i] += c.pop[i];
      for (const m in c.mov) movements[m] = (movements[m] || 0) + c.mov[m];
      gdp += c.gdp;
    }
    let pop = 0;
    for (let i = 0; i < N; i++) pop += mix[i];
    const movementPct = {};
    if (pop) for (const m in movements) movementPct[m] = (movements[m] / pop) * 100;
    return {
      pop, gdp, mix,
      shares: Ideology.shares(mix),
      dominant: pop ? Ideology.dominantIndex(mix) : -1,
      dominantId: pop ? Ideology.dominantId(mix) : null,
      centroid: Ideology.centroid(mix),
      cohesion: Ideology.cohesion(mix),
      movements, movementPct,
    };
  }
  const nationDemographics = (nid) => (nations.has(nid) ? demographics(nations.get(nid).counties) : null);

  /*
   * HOW MUCH A NATION COUNTS FOR, in one place.
   *
   * Population plus GDP at a hundred thousand dollars a head: a blend, because
   * neither half alone is what the rest of the world weighs. Head count alone
   * makes a poor crowded state the equal of an industrial one; GDP alone makes
   * an empty rich one a superpower.
   *
   * It was written out three times — sentiment's `power`, the coalition survey
   * and now recognition — and three copies of a blend is three chances for the
   * game to disagree with itself about who matters.
   */
  const nationWeight = (nid) => {
    const d = nationDemographics(nid);
    return d ? d.pop + d.gdp / 1e5 : 0;
  };

  /** Ideology counts for a set of Areas — the hot path, without the extras. */
  function ideologyMix(countyIds) {
    const N = Ideology.count();
    const mix = new Array(N).fill(0);
    for (const f of countyIds) {
      const c = county[f];
      if (!c) continue;
      for (let i = 0; i < N; i++) mix[i] += c.pop[i];
    }
    return mix;
  }
  const dominantOf = (countyIds) => Ideology.dominantIndex(ideologyMix(countyIds));

  /* ---- adjacency & grouping (Area level: union of member-county neighbors) ---- */
  /*
   * ONE compressed-sparse-row graph, built once at load (js/graph.js).
   *
   * This used to allocate a fresh Set and re-walk every member county on EVERY
   * query — and it is the hot loop for the neighbour-pull term in political
   * drift, for contiguity, for annex targeting, for splinter planning, and for
   * every system M4 adds. M1 bought time with a memo Map; the graph removes the
   * string hashing and the array-of-strings result as well.
   *
   * The string signature stays for the callers above the model (the DOM speaks
   * FIPS), but everything inside walks integer indices.
   */
  let graph = null;
  function buildGraph(ids) {
    graph = Graph.build(ids, (a) => {
      const out = [];
      for (const m of county[a]?.counties || [a])
        for (const nb of adjacency.county[m] || []) out.push(cid(nb));
      return out;
    });
  }
  /** Node index for an Area id (or a member county id). */
  const nodeOf = (fips) => graph.indexOf(cid(fips));
  /** Neighbours as Area ids. The returned array is shared and frozen. */
  function countyNeighbors(fips) { return graph.neighborIds(cid(fips)); }
  /** The nodes a nation holds, as a mask — the shape every graph query wants. */
  function nationMask(nid) {
    const mask = graph.mask();
    const n = nations.get(nid);
    if (n) for (const f of n.counties) { const i = nodeOf(f); if (i >= 0) mask[i] = 1; }
    return mask;
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
    if (!nations.has(nid)) return [];
    const self = nationIndexOf(nid);
    const out = new Set();
    for (const i of graph.frontier(nationMask(nid))) {
      const o = state.owner[i];
      if (o >= 0 && o !== self) out.add(nationIdList[o]);
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
    if (!nations.has(nid)) return new Set();
    const out = new Set();
    for (const i of graph.frontier(nationMask(nid))) out.add(graph.idAt(i));
    return out;
  }
  /**
   * Connected components of a set of Area ids, optionally split by a key so
   * "contiguous AND same owner" is one call. Returns arrays of ids, because
   * every caller feeds them straight back into ownership moves.
   */
  function components(fipsSet, keyFn) {
    const nodes = [];
    for (const f of fipsSet) { const i = nodeOf(f); if (i >= 0) nodes.push(i); }
    const byIndex = keyFn ? (i) => keyFn(graph.idAt(i)) : null;
    return graph.components(nodes, byIndex).map((comp) => {
      const out = new Array(comp.length);
      for (let k = 0; k < comp.length; k++) out[k] = graph.idAt(comp[k]);
      return out;
    });
  }
  const largestCounty = (arr) => arr.reduce((b, f) => (countyPop(f) > countyPop(b) ? f : b), arr[0]);

  const SUFFIX = /\s+(County|Borough|Parish|Census Area|city|City|Municipality|Planning Region)$/;
  const nameForCounty = (fips) => (county[fips]?.name || 'New Republic').replace(SUFFIX, '');

  /** The ideology a set of Areas actually holds — a new nation governs as its people do. */
  const dominantIdeologyOf = (ids) => Ideology.idAt(dominantOf(ids));

  /*
   * WHAT A NEW COUNTRY CALLS ITSELF (M7.7).
   *
   * A breakaway used to take the name of its largest county — "Riverside",
   * "Cook", "Miami-Dade" — which is a place rather than a country, and read on
   * the leaderboard as though somebody had forgotten to finish it. The templates
   * live in content/names.json and are drawn against the founding ideology, so a
   * Distributist breakaway is a Compact and a Nationalist one is a Directorate.
   *
   * Falls back to the bare place name when there is no content loaded, which is
   * what this did before — the map editor and any page without the file still
   * produce something.
   */
  function nameFor(countyIds, ideology, rng) {
    if (typeof Identity !== 'undefined' && Identity.loaded()) {
      const used = new Set();
      for (const [, n] of nations) used.add(n.name);
      return Identity.name(countyIds, ideology, rng, (x) => used.has(x));
    }
    return nameForCounty(largestCounty(countyIds));
  }

  /*
   * The nation sharing the most border with an Area or a group — its "nearest".
   *
   * Tallied by nation INDEX, not by id string. That matters for the tie-break:
   * the old version tallied into a plain object and took the first maximum in
   * `Object.entries` order, which is insertion order, which was the order the
   * neighbours happened to come out of a Set. Two nations with an equal share of
   * the border now resolve to the lower nation index, which is a fact about the
   * world rather than about a traversal.
   */
  function nearestNation(fips, excludeCounties) {
    const node = nodeOf(fips);
    if (node < 0) return null;
    const tally = [];
    for (const nb of graph.neighbors(node)) {
      if (excludeCounties && excludeCounties.has(graph.idAt(nb))) continue;
      const o = state.owner[nb];
      if (o >= 0) tally[o] = (tally[o] || 0) + 1;
    }
    return argmaxIndex(tally);
  }
  function nearestNationForGroup(comp, excludeNation, accept) {
    const inComp = graph.mask();
    for (const f of comp) { const i = nodeOf(f); if (i >= 0) inComp[i] = 1; }
    const skip = excludeNation != null && nationIdx.has(excludeNation)
      ? nationIndexOf(excludeNation) : -1;
    const tally = [];
    for (const f of comp) {
      const node = nodeOf(f);
      if (node < 0) continue;
      for (const nb of graph.neighbors(node)) {
        if (inComp[nb]) continue;
        const o = state.owner[nb];
        if (o >= 0 && o !== skip) tally[o] = (tally[o] || 0) + 1;
      }
    }
    if (!accept) return argmaxIndex(tally);
    // Offer it to each neighbour in order of how much border they share, and
    // take the first that will have it.
    const ranked = [];
    for (let i = 0; i < tally.length; i++) if (tally[i] > 0) ranked.push(i);
    ranked.sort((a, b) => tally[b] - tally[a] || a - b);
    for (const i of ranked) {
      const nid = nationIdList[i];
      if (nations.has(nid) && accept(nid, comp)) return nid;
    }
    return null;
  }
  /** The nation id with the highest tally; ties break on the lower index. */
  function argmaxIndex(tally) {
    let best = -1, bc = 0;
    for (let i = 0; i < tally.length; i++) if (tally[i] > bc) { best = i; bc = tally[i]; }
    return best < 0 ? null : nationIdList[best];
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
  /*
   * THE ANTI-SNOWBALL PRESSURE ON A NATION, 0..1.
   *
   * From M7.2 this is `Coalitions.pressure` — a set of named nations that each
   * have a reason — and the size-rank tier below is the fallback for a world
   * with no coalition module loaded (the map editor, an old save opened in a
   * page that predates it).
   *
   * The name is kept because every caller reads it and because the concept did
   * not change: it is still "how hard is the rest of the world pressing on the
   * leader". What changed is that it is now escapable and answerable. Finding 36
   * measured the old one: with the shell fully applied, California still took
   * 1,602 of 1,676 Areas in three turns.
   */
  function blueShell(nid) {
    if (typeof Coalitions !== 'undefined') return Coalitions.pressure(nid);
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

  /**
   * THE ONE CHOKE POINT for territorial change — annex, unite, release, civil
   * war fragmentation and nation creation all land here — which is why the
   * history is recorded here and nowhere else. Instrumenting the four callers
   * separately is how one of them ends up not doing it.
   */
  function moveCounties(fipsList, toId, { silent, reason } = {}) {
    const to = nations.get(toId);
    if (!to) return;
    const turn = worldTurn();
    const from = new Map(); // previous owner id -> how many Areas it lost

    // One write per Area, to one array. The old version also had to delete from
    // the losing nation's Set and add to the winner's, which is the hand-sync
    // that made ownership two facts instead of one.
    for (const f of fipsList) {
      const node = nodeOf(f);
      if (node < 0) continue;
      const prev = ownerIdAt(node);
      if (prev === toId) continue;   // a no-op move is not an event
      if (prev != null) from.set(prev, (from.get(prev) || 0) + 1);
      setOwnerNode(node, toId);
    }

    if (from.size) {
      let gained = 0;
      for (const [prevId, count] of from) {
        gained += count;
        const loser = nations.get(prevId);
        if (loser) remember(loser, loser.lost, { turn, to: toId, areas: count, reason });
      }
      remember(to, to.annexed, { turn, from: [...from.keys()], areas: gained, reason });
    }

    const removed = pruneEmpty();
    /*
     * `silent` suppresses the RENDER, not the FACT.
     *
     * A nation ceasing to exist is a model event, and the turn order has to hear
     * about it however the caller wanted the map drawn. It did not: every silent
     * caller is inside `batch()`, so the roster bit was simply dropped, and a
     * nation whose last Area defected kept its slot and went on being handed
     * turns. Measured: Alaska lost 02110 to Alaskan Independence on turn 34 and
     * was still in the order six turns later.
     *
     * Inside a batch this merges into the one pending emit, so it costs nothing.
     */
    if (!silent) emit({ ownership: true, roster: removed > 0 });
    else if (removed > 0) emit({ roster: true });
  }
  function mergeInto(intoId, fromId) {
    batch(() => {
      const from = nations.get(fromId);
      if (from) moveCounties([...from.counties], intoId, { silent: true, reason: 'unite' });
      emit({ ownership: true, roster: true });
    });
  }
  /**
   * The state most of a set of Areas sits in — a new nation's home soil.
   * Ties break on the alphabetically first state FIPS, not on iteration order.
   */
  function modalState(countyIds) {
    const tally = {};
    for (const f of countyIds) {
      const c = county[cid(f)];
      if (c) tally[c.st] = (tally[c.st] || 0) + 1;
    }
    let best = null, bc = 0;
    for (const k of Object.keys(tally).sort()) if (tally[k] > bc) { best = k; bc = tally[k]; }
    return best;
  }

  function createNation(name, countyIds, opts = {}) {
    const { color, silent, founded } = opts;
    const id = 'n' + ++seq;
    nations.set(id, makeNation({
      id, name, color: color || Colors.newColor(), origin: false,
      treasury: 0, gov: 'Republic',
      founded: founded == null ? worldTurn() : founded,
      homeSt: modalState(countyIds),
      lastAnnexTurn: -Infinity,
      lastReleaseTurn: -Infinity,
      lastUniteTurn: -Infinity,
      lastAutonomyTurn: -Infinity,
      tradeCooldown: {},
    }));
    moveCounties(countyIds, id, { silent: true, reason: opts.reason || 'secede' });
    if (!silent) emit({ ownership: true, roster: true });
    return id;
  }
  /**
   * Delete nations with no territory. Returns how many were removed.
   *
   * A nation being conquered out of existence used to be a silent `Map.delete`:
   * the swatch vanished from the leaderboard, the turn order quietly shortened,
   * and the player could not tell "Wyoming was annihilated" from "I mis-clicked".
   * It is an event now, which is the cheapest half of the elimination feedback
   * the review asks for.
   */
  function pruneEmpty() {
    refreshCounties();
    let n = 0;
    for (const [id, rec] of nations) {
      if (rec._counties.size !== 0) continue;
      nations.delete(id);
      n++;
      Ledger.append({
        turn: worldTurn(), phase: 'roster', subject: id, kind: 'died', delta: -1,
        text: `${rec.name} ceased to exist.`,
        founded: rec.founded, lost: rec.lost.length,
      });
    }
    return n;
  }

  // Break a set of counties into new nations. Contiguous chunks of at least
  // TUNE nation.minAreas Areas become nations; smaller chunks join their nearest
  // nation (unless a chunk is the only thing there is, in which case it becomes
  // a small nation anyway).
  function breakApart(countyIds, opts = {}) {
    const exclude = opts.exclude || null; // a nation new fragments must not join (e.g. a failed aggressor)
    const reason = opts.reason || 'secede';
    const comps = components(new Set(countyIds), null).sort((a, b) => b.length - a.length);
    const refused = [];
    const minAreas = T('nation.minAreas');
    const minPop = T('nation.minPop');

    /*
     * A chunk stands alone on AREAS **or** on POPULATION.
     *
     * `nation.minPop` was in the schema and read by nothing — a slider that did
     * nothing, which is worse than no slider. It matters because Area count is a
     * poor proxy for whether a breakaway is viable once Areas range from one
     * county to eight: two Areas holding 4 million people between them is a
     * country, and five holding 30,000 is not. Both thresholds are cheap, so the
     * chunk qualifies on either.
     */
    const viable = (comp) => {
      if (comp.length >= minAreas) return true;
      let pop = 0;
      for (const f of comp) pop += countyPop(f);
      return pop >= minPop;
    };

    const created = [], small = [];
    for (const comp of comps) {
      if (viable(comp)) created.push(createNation(nameFor(comp, dominantIdeologyOf(comp), opts.rng), comp, { silent: true, reason }));
      else small.push(comp);
    }
    /*
     * Small fragments join their nearest nation — IF that nation will have them.
     *
     * `opts.accept(nid, comp)` is the guardrail from the design: without it,
     * releasing counties is a way to DUMP them on a rival. Hand a hostile
     * neighbour three Areas full of a movement it cannot govern and you have
     * exported your secession problem for free. A recipient that refuses simply
     * does not receive: the fragment stays where it was, which is the honest
     * outcome — you tried to give something away and nobody wanted it.
     */
    for (const comp of small) {
      const near = nearestNationForGroup(comp, exclude, opts.accept);
      if (near) moveCounties(comp, near, { silent: true, reason: 'fragment' });
      else if (opts.accept) refused.push(...comp);   // nobody would take it; it stays put
      else created.push(createNation(nameFor(comp, dominantIdeologyOf(comp), opts.rng), comp, { silent: true, reason }));
    }
    pruneEmpty();
    emit({ ownership: true, roster: true });
    created.refused = refused;   // Areas nobody would accept, still where they were
    return created;
  }

  /**
   * Which ideology rules a set of Areas — the index of its largest bloc, or -1.
   *
   * The old test was `d >= g` over demPop and gopPop alone, so a nation whose
   * real plurality was an emergent movement bled the WRONG population and a
   * movement could never take a single casualty however many wars it lost.
   * "Other" was invisible too. With six symmetric ideologies the question is
   * just "which count is biggest".
   */
  const rulingBloc = (countyIds) => Ideology.dominantIndex(ideologyMix(countyIds));

  /**
   * Scale one ideology's head count on an Area, keeping the movements inside it
   * consistent: a movement's members are a slice of its ideology, so if the
   * ideology loses a fifth of its people, so does every movement in it.
   */
  function blocScale(c, i, k) {
    if (i < 0 || i >= c.pop.length) return;
    c.pop[i] *= k;
    for (const name in c.mov) {
      if (Movements.ideologyIndexOf(name) === i) c.mov[name] *= k;
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
      const bloc = rulingBloc(loser.counties); // an ideology index, or -1
      if (bloc >= 0) {
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

  /**
   * Refresh every nation's ruling ideology from its own population.
   *
   * Derived, but STORED, and refreshed at exactly one point in the turn. Reading
   * it live would mean a nation's government changed in the middle of a phase
   * that was busy moving its population around, so "who is in power" would
   * depend on when you asked. Stored also gives `gov.since` a meaning: how long
   * this ideology has held power, which is one of Authority's inputs.
   *
   * A nation with no population keeps whatever it had rather than dropping to
   * null; losing your last Area is a different event from having no politics.
   */
  /*
   * A nation that has never intervened DRIFTS with its people; one that has
   * chosen stays chosen.
   *
   * Deriving the ruling ideology from the plurality was right in M3.4, when
   * nothing else could set it. It is wrong now that a player can deliberately
   * govern by a minority ideology to appease a movement: measured, the choice
   * fired — the money was spent and the Authority hit landed — and then this
   * function put the plurality straight back at the end of the same turn, so the
   * whole valve was a fee for nothing.
   *
   * `gov.lastChange != null` is the record of a deliberate choice, so it is also
   * the flag that says "leave this alone". The consequence is a real and wanted
   * one: a government that has chosen can end up badly out of step with its own
   * population, which is exactly the pressure Civil Liberties and sentiment are
   * built to express.
   */
  function refreshGovernments(asOf) {
    // The turn is passed in from the world loop, because the refresh happens
    // while turn N is being RESOLVED and the government it produces is the one
    // that governs turn N+1. Stamping `worldTurn()` there would date a new
    // government to the last turn of the old one.
    const turn = asOf == null ? worldTurn() : asOf;
    for (const [, n] of nations) {
      /*
       * ONLY A NATION THAT HAS NO GOVERNMENT AT ALL (M7.10).
       *
       * This used to track the popular plurality every turn for any nation that
       * had never deliberately changed course, and lock in anybody who had:
       * "it chose; it keeps its choice". Both halves were wrong. The first is a
       * government that silently becomes whatever its people are, which is not a
       * government; the second is the costume problem the elections milestone
       * exists to fix — change hats once to defuse a secession and never answer
       * for it again.
       *
       * A government changes hands at an election now, and nowhere else. What is
       * left here is the founding case: a nation that has just come into being
       * out of a collapse holds nothing yet, and takes the politics of the
       * ground it stands on.
       */
      if (n.gov.rulingIdeology != null) continue;
      const bloc = rulingBloc(n.counties);
      if (bloc < 0) continue;
      n.gov.rulingIdeology = Ideology.idAt(bloc);
      n.gov.since = turn;
    }
  }

  /**
   * APPEASEMENT: a government changes the ideology it governs by.
   *
   * The cheapest release valve in the game, and it needs almost no machinery
   * because M3 already put `gov.rulingIdeology` in the record and M3.3 made
   * Civil Liberties a function of how far the governed sit from the governing.
   * Change the ruling ideology and **the model does the rest**: liberties rise
   * where the new ideology is strong and fall where the old one was, grievance
   * follows, and M4.2's sentiment follows that. Nobody has to write "calms the
   * aligned region and angers another" — it is what the existing terms already
   * say.
   *
   * Three guardrails, because a free switch would let a player dodge every
   * consequence in the game by changing hats each turn:
   *   - you may only adopt an ideology with real support (`gov.changeMinShare`),
   *     since a government cannot claim a mandate it has no voters for;
   *   - it costs treasury, scaled to how far you are moving on the axes;
   *   - and it costs Authority, because a state that changes what it believes
   *     by decree has admitted the last thing was not a conviction.
   *
   * @returns {{ok: true, from, to, cost}} or {{ok: false, message}}
   */
  function changeRulingIdeology(nid, ideologyId, opts = {}) {
    const n = nations.get(nid);
    if (!n) return { ok: false, message: 'No such nation.' };
    const to = Ideology.index(ideologyId);
    if (to < 0) return { ok: false, message: `"${ideologyId}" is not an ideology.` };
    const from = Ideology.index(n.gov.rulingIdeology);
    if (to === from) return { ok: false, message: 'That is already your governing ideology.' };

    const turn = opts.asOf == null ? worldTurn() : opts.asOf;
    /*
     * The cooldown runs from the last DELIBERATE change, not from `gov.since`.
     *
     * `since` looked like the same clock and is not: it is set at founding, so
     * every nation began the game under an eight-turn lockout for a decision
     * nobody had made; and `refreshGovernments` moves it whenever the population
     * shifts a plurality, which would hand a player a free reset for something
     * they did not do.
     */
    const cd = n.gov.lastChange == null ? 0
      : T('gov.changeCooldown') - (turn - n.gov.lastChange);
    if (cd > 0 && !opts.force) {
      return { ok: false, message: `The government changed course too recently — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.` };
    }

    const d = demographics(n.counties);
    const share = d.pop > 0 ? d.mix[to] / d.pop : 0;
    const need = T('gov.changeMinShare');
    if (share < need && !opts.force) {
      return { ok: false, message: `Only ${(share * 100).toFixed(1)}% of your people hold that ideology; `
        + `a government needs ${(need * 100).toFixed(0)}% to claim the mandate.` };
    }

    // The further you move on the axes, the more it costs to be believed.
    const distance = 1 - Ideology.affinity(from, to);
    const cost = d.gdp * T('gov.changeCost') * distance;
    if (n.treasury < cost && !opts.force) {
      return { ok: false, message: `Changing course would cost ${Math.round(cost / 1e9)}bn and you have `
        + `${Math.round(n.treasury / 1e9)}bn.` };
    }

    /*
     * AN ELECTION IS NOT A REBRANDING (M7.10). The cost buys belief in a course
     * a government CHOSE; a government that lost a vote did not choose anything
     * and has no bill to pay, and charging one would take money out of the
     * treasury of a party that is no longer in office.
     */
    if (!opts.free) n.treasury -= cost;
    const wasId = Ideology.idAt(from);
    n.gov.rulingIdeology = ideologyId;
    n.gov.since = turn;
    /*
     * AN ELECTION IS NOT A DELIBERATE CHANGE (M7.10). `lastChange` is the clock
     * the cooldown runs from and it means "the last time this government CHOSE a
     * course" — losing a vote is the opposite of choosing one, and stamping it
     * here charged a government for a decision its electorate made: measured, a
     * player who lost an election could not use the appeasement valve for two
     * turns afterwards, which is exactly the turn they most need it.
     */
    if (!opts.free) n.gov.lastChange = turn;
    /*
     * A NEW GOVERNMENT IS A NEW GOVERNMENT (M7.5). Changing course and keeping
     * the same person in the chair is the version of this that means nothing;
     * the leader is where the change becomes a face and a sentence in the
     * newspaper rather than a shift in an ideology index.
     */
    if (typeof Leaders !== 'undefined' && Leaders.loaded()) {
      Leaders.replace(nid, opts.rng || null, null, 'course');
    }
    Ledger.append({
      turn, phase: 'action', subject: nid, kind: 'govern', delta: distance,
      text: opts.reason === 'election'
        ? `${n.name} changed hands: ${Ideology.byId(ideologyId).name} replaced ${Ideology.nameAt(from)}.`
        : opts.reason === 'steal'
          ? `${n.name} put ${Ideology.byId(ideologyId).name} back in office.`
          : `${n.name} changed course from ${Ideology.nameAt(from)} to ${Ideology.byId(ideologyId).name}.`,
      terms: [
        { name: 'Support for the new course', value: share, key: 'gov.changeMinShare' },
        { name: 'Distance moved on the axes', value: distance, key: null },
        { name: 'Cost', value: opts.free ? 0 : -cost, key: 'gov.changeCost' },
        { name: 'Authority', value: -T('gov.changeAuthorityHit') * distance, key: 'gov.changeAuthorityHit' },
      ],
      from: wasId, to: ideologyId,
    });
    // Applied to the STOCK, not to the target: the target recomputes from the
    // world next turn and would simply undo it. This is a shock, and the stock
    // discipline is what turns it back into a recovery over several turns.
    if (typeof n.authority === 'number') {
      n.authority = Math.max(T('power.floor'), n.authority - T('gov.changeAuthorityHit') * distance);
    }
    emit({ values: true });
    return { ok: true, from: Ideology.idAt(from), to: ideologyId,
             cost: opts.free ? 0 : cost, share, distance };
  }

  /**
   * How hostile an Area is to whoever holds it, 0..1.
   *
   * The strongest organised movement's share of it. A movement IS opposition to
   * the state that governs the Area — that is what M4.1 made them — so the share
   * it has organised is the readiest measure of how expensive the place is to
   * sit on. Nothing new is stored: this reads the sentiment M4.2 already keeps.
   */
  function hostility(f) {
    const c = county[cid(f)];
    if (!c) return 0;
    let pop = 0;
    for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
    if (pop <= 0) return 0;
    let worst = 0;
    for (const m in c.mov) { const s = c.mov[m] / pop; if (s > worst) worst = s; }
    return worst > 1 ? 1 : worst;
  }

  /* ---- treasury: income (from GDP) minus maintenance, ticked once per world turn ---- */
  function treasuryFlow(nid) {
    const n = nations.get(nid);
    if (!n) return null;
    const gdp = demographics(n.counties).gdp;
    const gov = T('econ.govMaintenance');
    /*
     * SELF-RULE KEEPS MOST OF WHAT IT RAISES. The revenue side of the autonomy
     * valve: an Area that governs itself is still yours on the map and mostly
     * not yours on the ledger, which is what makes granting it a real cost
     * rather than a free way to keep somewhere quiet.
     */
    let autonomousGdp = 0;
    for (const f of n.counties) {
      const c = county[f];
      if (c && c.attrs && c.attrs.autonomy) autonomousGdp += countyGdp(f);
    }
    const forgone = autonomousGdp * T('econ.taxRate') * (1 - T('autonomy.taxShare'));
    const income = gdp * T('econ.taxRate') - forgone;
    const base = T('econ.areaUpkeep');

    /*
     * OCCUPATION COSTS MORE WHERE IT IS RESENTED (M4.5).
     *
     *   upkeep(a) = base * (1 + hostility(a)) * (1 + n_occupied^alpha)
     *
     * Two independent multipliers doing two different jobs. The COUNT term is
     * superlinear, so past a point conquest stops paying for itself whatever the
     * locals think — anti-snowball brake #2, and holding 25 occupied Areas
     * doubles their upkeep, 100 costs ~5x, 400 costs ~24x. The HOSTILITY term is
     * per Area, and it is what makes *which* ground you took matter as much as
     * how much: sitting on a place that is 50% organised against you is not the
     * same expense as sitting on a place that shrugged.
     *
     * Hostility is read straight off the sentiment the model already maintains —
     * the strongest movement share in that Area — so this is one helper and no
     * new state. Before M4.2 there was no sentiment to read and the hook could
     * not have been written.
     */
    const occ = occupiedCount(nid);
    const ref = T('econ.occupationRef');
    const countMult = occ ? Math.pow(occ / ref, T('econ.occupationAlpha')) : 0;
    let surcharge = 0;
    if (occ) {
      const w = T('econ.occupationHostility');
      for (const f of n.counties) {
        const c = county[f];
        if (!c || c.st === n.homeSt) continue;      // its own soil is not occupied
        surcharge += base * (1 + w * hostility(f)) * countMult;
      }
    }

    /*
     * BEING SURROUNDED IS EXPENSIVE, whether or not anybody attacks. The penalty
     * finding 36 asks for: something the leader feels every turn rather than a
     * multiplier on a roll that rarely happens.
     */
    const pressure = typeof Coalitions !== 'undefined' ? Coalitions.pressure(nid) : 0;
    const encirclement = n.counties.size * base * T('coalition.costMult') * pressure;
    const administration = n.counties.size * base + encirclement;
    /*
     * AND THE ARMY IS ON THE BOOKS (M6.5). Charged on force rather than on where
     * that force points, which is what makes "how much" a question rather than
     * "as much as possible" — and what makes a nation that has overspent on
     * troops feel it in every other decision it takes.
     */
    const army = typeof Military !== 'undefined' ? Military.upkeep(nid) : 0;
    const maintenance = gdp * (gov[n.gov.type] ?? gov.Republic) + administration + surcharge + army;
    return { income, maintenance, administration, occupation: surcharge, army, occupied: occ,
             autonomy: forgone, encirclement, pressure, delta: income - maintenance };
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
      // Array.from, not .slice(): a Float64Array stringifies to {"0":..,"1":..}.
      const rec = { p: Array.from(c.pop), gdp: c.gdp };
      for (const m in c.mov) { rec.m = { ...c.mov }; break; }
      for (const k in c.attrs) { rec.a = { ...c.attrs }; break; }
      counties[f] = rec;
    }
    const nats = [];
    for (const [, n] of nations) nats.push({
      id: n.id, name: n.name, color: n.color, origin: n.origin, treasury: n.treasury,
      gov: { ...n.gov },
      founded: n.founded, homeSt: n.homeSt,
      honeymoonUntil: n.honeymoonUntil || 0,
      annexed: n.annexed.map((e) => ({ ...e })),
      lost: n.lost.map((e) => ({ ...e })),
      authority: n.authority,
      influence: n.influence,
      qol: n.qol,
      liberties: n.liberties,
      weariness: n.weariness,
      // -Infinity does not survive JSON; null means "has never annexed".
      lastAnnexTurn: Number.isFinite(n.lastAnnexTurn) ? n.lastAnnexTurn : null,
      lastReleaseTurn: Number.isFinite(n.lastReleaseTurn) ? n.lastReleaseTurn : null,
      lastUniteTurn: Number.isFinite(n.lastUniteTurn) ? n.lastUniteTurn : null,
      lastAutonomyTurn: Number.isFinite(n.lastAutonomyTurn) ? n.lastAutonomyTurn : null,
      tradeCooldown: { ...n.tradeCooldown },
      counties: [...n.counties],
    });
    return { seq, originalNationCount, player, counties, nations: nats };
  }
  function loadState(snap) {
    let dropped = 0;
    for (const [f, c] of Object.entries(snap.counties)) {
      const cc = county[f];
      if (!cc) { dropped++; continue; }
      // A save written before the ideology model carried d/g/o + e{}; it is
      // refused by SaveManager on the version stamp, so only `p` is read here.
      // Guarded: `cc.pop` is now a view onto the column, and assigning it to
      // itself would zero the column before copying from it.
      if (Array.isArray(c.p)) cc.pop = c.p;
      cc.mov = { ...(c.m || {}) };
      cc.gdp = c.gdp;
      // MERGED, not replaced: attrs also holds values derived from the bake at
      // init (attrs.culture), and a save is allowed not to carry those.
      cc.attrs = { ...cc.attrs, ...(c.a || {}) };
    }
    nations.clear();
    nationIdList.length = 0;
    nationIdx.clear();
    state.owner.fill(-1);
    ownerEpoch++;
    let orphans = 0;
    for (const n of snap.nations) {
      // A save made against a different areas.json can name Areas that no longer
      // exist. Skip them here rather than letting them reach a world phase as a
      // TypeError three turns later (finding 53).
      const live = n.counties.filter((f) => { if (county[f]) return true; orphans++; return false; });
      if (!live.length) continue;
      nations.set(n.id, makeNation({
        id: n.id, name: n.name, color: n.color, origin: n.origin,
        treasury: n.treasury || 0,
        // A pre-M3 document carries `gov` as the string 'Republic'; makeGov
        // takes either shape.
        gov: n.gov,
        annexed: Array.isArray(n.annexed) ? n.annexed.map((e) => ({ ...e })) : [],
        lost: Array.isArray(n.lost) ? n.lost.map((e) => ({ ...e })) : [],
        authority: n.authority == null ? null : n.authority,
        influence: n.influence == null ? null : n.influence,
        qol: n.qol == null ? null : n.qol,
        liberties: n.liberties == null ? null : n.liberties,
        weariness: n.weariness == null ? null : n.weariness,
        founded: n.founded || 0,
        homeSt: n.homeSt || modalState(live),
        honeymoonUntil: n.honeymoonUntil || 0,
        lastAnnexTurn: n.lastAnnexTurn == null ? -Infinity : n.lastAnnexTurn,
        lastReleaseTurn: n.lastReleaseTurn == null ? -Infinity : n.lastReleaseTurn,
        lastUniteTurn: n.lastUniteTurn == null ? -Infinity : n.lastUniteTurn,
        lastAutonomyTurn: n.lastAutonomyTurn == null ? -Infinity : n.lastAutonomyTurn,
        tradeCooldown: { ...(n.tradeCooldown || {}) },
      }));
      for (const f of live) setOwnerNode(nodeOf(f), n.id);
    }
    seq = snap.seq || 0;
    originalNationCount = snap.originalNationCount || nations.size;
    // `|| null` and not `?? null`: a document written before M6.2 has no player.
    player = snap.player || null;
    // A pre-M3 document carries no ruling ideology; derive one rather than
    // leaving every nation ungoverned. A document that HAS one keeps it,
    // including `since` — deriving over the top would re-date every government
    // in the world to the turn the save was opened.
    for (const [, n] of nations) if (!n.gov.rulingIdeology) { refreshGovernments(); break; }
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
    /** Does this Area govern itself? Stored in `attrs`, so it saves for free. */
    isAutonomous: (id) => !!(county[cid(id)] && county[cid(id)].attrs
      && county[cid(id)].attrs.autonomy),
    /** How many of a nation's Areas govern themselves. */
    autonomousCount: (nid) => {
      const n = nations.get(nid);
      if (!n) return 0;
      let k = 0;
      for (const f of n.counties) { const c = county[f]; if (c && c.attrs && c.attrs.autonomy) k++; }
      return k;
    },
    /** Grant or revoke, and say how many actually changed. */
    setAutonomy: (ids, on) => {
      let changed = 0;
      for (const id of ids) {
        const c = county[cid(id)];
        if (!c) continue;
        const had = !!(c.attrs && c.attrs.autonomy);
        if (had === !!on) continue;
        if (!c.attrs) c.attrs = {};
        /*
         * `true`, not the turn. Storing the world turn read as autonomous
         * everywhere except turn ZERO, where it is 0 and falsy — so a grant made
         * on the opening turn silently did nothing, and every reader agreed with
         * every other reader that it had not happened. The turn is kept beside
         * it, where nothing tests it for truth.
         */
        if (on) { c.attrs.autonomy = true; c.attrs.autonomySince = worldTurn(); }
        else { delete c.attrs.autonomy; delete c.attrs.autonomySince; }
        changed++;
      }
      if (changed) emit({ values: true });
      return changed;
    },
    areaIdOf: cid,
    areaCounties: (id) => county[cid(id)]?.counties || [cid(id)],
    anchorOf: (id) => county[cid(id)]?.anchor,
    treasuryFlow,
    tickTreasuries,
    occupiedCount,
    hostility,
    rulingBloc,
    earn,
    areaExport,
    exportAccess,
    tradeCapacity,
    originalNations: () => originalNationCount,
    /** The id of the nation the human is playing, or null in a headless world. */
    getPlayer: () => player,
    /** The player's nation record, or null if there is none or it has died. */
    playerNation: () => (player == null ? null : nations.get(player) || null),
    isPlayer: (nid) => player != null && nid === player,
    /**
     * Choose who the human is. Refuses an id that names nothing, because the
     * failure mode of accepting it is a turn loop that sweeps forever looking
     * for a slot that will never come up.
     */
    setPlayer: (nid) => {
      if (nid != null && !nations.has(nid)) return false;
      player = nid == null ? null : nid;
      emit({ values: true });
      return true;
    },
    spend,
    boostGdp,
    nations,
    getOwner: (f) => ownerIdAt(nodeOf(f)),
    getNation: (nid) => nations.get(nid),
    colorForCounty: (f) => nations.get(ownerIdAt(nodeOf(f)))?.color || '#c9ced6',
    countyPop,
    countyGdp,
    demographics,
    nationDemographics,
    nationWeight,
    areaPolitics,
    ideologyMix,
    dominantOf,
    areaPop: (f) => { const c = county[cid(f)]; return c ? areaPop(c) : 0; },
    countyNeighbors,
    /** The CSR graph itself, for index-space callers (the phases, the tests). */
    graph: () => graph,
    /** The columnar store. `Game.state().pop[node * 6 + i]` is the flat path. */
    state: () => state,
    nodeOf,
    nationMask,
    adjacentNations,
    borderingNations,
    maritimeNations,
    annexTargets,
    components,
    largestCounty,
    nameForCounty,
    nameFor,
    nearestNation,
    blueShell,
    epoch: () => epoch,
    /*
     * A counter that moves on every OWNERSHIP write, synchronously, whatever the
     * batch depth. `epoch` is the render clock and is deliberately frozen inside
     * a batch; this is the model clock, and it is what a cache of a world
     * snapshot must key on. The two are different questions and conflating them
     * handed the AI a sentiment context built before a nation existed, indexed
     * by a nation index that had not been assigned yet.
     */
    ownerEpoch: () => ownerEpoch,
    /** Nation id -> its integer index in the ownership column. */
    nationIndexOf,
    /** Is this Area foreign soil to whoever holds it? */
    isOccupied: (f) => {
      const c = county[cid(f)];
      const nid = ownerIdAt(nodeOf(f));
      const n = nid && nations.get(nid);
      return !!(c && n && c.st !== n.homeSt);
    },
    refreshGovernments,
    changeRulingIdeology,
    /** Territorial events inside the memory window, newest last. */
    historyOf: (nid) => { const n = nations.get(nid); return n ? { annexed: n.annexed, lost: n.lost } : null; },
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
