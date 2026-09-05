/*
 * TRANSIT AND TOLLS (A2) — the stage that makes geography matter.
 *
 * A1 made a trade a contract. A2 makes it a JOURNEY. Until now two nations could
 * only sign a deal if they touched, which quietly told a quarter of the board
 * that it had no economy: measured on the opening map, 14 of 60 nations hold no
 * port, no Great Lakes shore and no border crossing (docs/spec/a2-measurements.md).
 * They were not badly placed, they were unplayable. Now goods can cross other
 * people's ground, and the countries in between charge for the privilege.
 *
 * THE ONE IDEA WORTH HOLDING ON TO: each toll is charged on WHAT ARRIVES, not on
 * what set out. So the nation nearest the seller collects the most, every
 * crossing after it is worth less, and a long chain of middlemen pays everybody
 * badly — which is what makes a five-hop resale chain a bad idea by arithmetic
 * rather than by a rule that forbids it.
 *
 * THE SCOPE RULE, and the whole stage hangs on it: A2 does not change what a
 * deal is worth. `Deals.settlement` stays gross and byte-identical; the toll is
 * a separate world phase that takes a bite out of the income on its way home.
 * You can read `git diff js/deals.js` for this stage and see a single new field.
 *
 * CANADA AND MEXICO ARE NOT COUNTRIES HERE (the owner's ruling). They are
 * corridors: a flat cost, no negotiation, no agreement, no opinion, nobody
 * credited. The money is not transferred to them — the trade is simply worth
 * less for having gone that way. That ruling is made STRUCTURAL below rather
 * than merely remembered: the corridor branch returns before the agreement
 * machinery is reached, so there is no code path on which Canada could acquire
 * a treasury, a grievance or a veto.
 *
 * A Great Lakes port reaches the world only through Canada. An ocean port
 * reaches it directly. A river port — and 59 of the map's 136 ports are river
 * ports — reaches nothing at all, though it still carries capacity, which is
 * why `Game.areaExport.port` still counts it and the graph below does not.
 */
const Transit = (function () {
  /* ---- what a border can carry ------------------------------------- */

  /*
   * The brief's three tiers, and the only bits a grant may carry. They are bits
   * rather than a string because a border can offer more than one and a grant
   * must be able to name exactly one: the point of the tier system is that a
   * nation can wave the lorries through and refuse the ships.
   */
  const MODE = { HIGHWAY: 1, RAIL: 2, PORT: 4, RIVER: 8 };
  const MODE_NAME = { 1: 'highway', 2: 'rail', 4: 'port', 8: 'river' };
  const MODE_LABEL = { 1: 'road', 2: 'rail', 4: 'port', 8: 'river' };

  /*
   * The three places that are not nations. Prefixed so they can never collide
   * with a nation id: origin nations carry two-digit state FIPS ('01'..'56') and
   * later ones carry 'n' + a counter, so the board is a MIX of two formats and
   * anything that assumes one of them is wrong.
   */
  const CANADA = '@canada';
  const MEXICO = '@mexico';
  const WORLD = '@world';
  const OUTSIDE = [CANADA, MEXICO, WORLD];
  const isOutside = (id) => id.charCodeAt(0) === 64; // '@'

  const T = (tune) => tune || window.TUNE;

  /**
   * WHAT A CROSSING COSTS, BY HOW IT IS CROSSED (A2b).
   *
   * The owner's hierarchy: water is cheapest, then rail, then road as the
   * baseline. The reasoning is that the dissolution takes free interstate trade
   * and the distribution networks with it, so land freight stops being the cheap
   * default it is today — while a barge is a barge whoever owns the bank.
   *
   * Modes were PERMISSIONS ONLY when A2 shipped: a nation could open its
   * railways and close its docks, but crossing by rail cost exactly what
   * crossing by road cost, which threw away half the point of having tiers. The
   * old one-off transit path had this and the rewrite dropped it.
   */
  function frictionFor(mode, tune) {
    const t = T(tune);
    const base = t.get('transit.hopFriction');
    if (mode === MODE.RAIL) return base * t.get('transit.railFrictionMult');
    if (mode === MODE.PORT || mode === MODE.RIVER) return base * t.get('transit.waterFrictionMult');
    return base;                                   // road, and anything unnamed
  }

  /* ---- the corridor graph ------------------------------------------- */

  let cache = null;      // { key, nodes, edges: Map<from, Map<to, modeBits>> }
  let worldSeq = 0;      // bumped by reset(), because ownerEpoch restarts at 0

  function reset() {
    cache = null;
    worldSeq += 1;
    clearRegister();
  }

  /**
   * Who can reach whom, and by what.
   *
   * REBUILT ONCE PER TURN, NEVER PER PLAN. Measured before this was written: the
   * whole rebuild costs about 2 ms against the 153 ms one round of AI planning
   * already spends, so building it fresh whenever the borders may have moved is
   * free. Building it inside `Moves.plan` would not be — that runs 735 times a
   * round, and the same 2 ms becomes a second and a half a turn.
   *
   * The cache key includes a module-local counter as well as the owner epoch,
   * because `Game.reset()` sets the epoch back to zero: on the epoch alone, a
   * fresh world would be served the previous world's borders.
   */
  function graph() {
    const g = Game.graph();
    const key = `${worldSeq}:${Game.ownerEpoch()}:${g ? g.start.length : 0}`;
    if (cache && cache.key === key) return cache;

    const nodes = [...Game.nations.keys()].sort().concat(OUTSIDE);
    const edges = new Map();
    for (const n of nodes) edges.set(n, new Map());
    const add = (a, b, bits) => {
      const m = edges.get(a);
      if (m) m.set(b, (m.get(b) || 0) | bits);
    };

    /*
     * LAND BORDERS, in one sweep of the Area graph. A border carries rail only
     * if BOTH sides do, and a highway only if both sides do — a railhead that
     * stops at the frontier is not a corridor. A border with neither is not a
     * border for goods at all, which promotes what used to be a filter in the
     * trade panel into a fact about the world.
     *
     * Deliberately NOT Game.adjacentNations, which spans water: it once offered
     * California an overland route to Alaska, and that bug is exactly the shape
     * this graph would reproduce at five times the scale.
     */
    const owner = Game.state().owner;
    const carries = new Map(); // area index -> {rail, highway}
    const linkOf = (i) => {
      let hit = carries.get(i);
      if (!hit) { hit = Game.areaTransport(g.idAt(i)); carries.set(i, hit); }
      return hit;
    };
    for (let i = 0; i < owner.length; i++) {
      const oi = owner[i];
      if (oi < 0) continue;
      const a = Game.ownerIdAtIndex(i);
      if (a == null) continue;
      const ta = linkOf(i);
      if (!ta.rail && !ta.highway) continue;
      for (const nb of g.neighbors(i)) {
        const ob = owner[nb];
        if (ob < 0 || ob === oi) continue;
        const b = Game.ownerIdAtIndex(nb);
        if (b == null) continue;
        const tb = linkOf(nb);
        let bits = 0;
        if (ta.rail && tb.rail) bits |= MODE.RAIL;
        if (ta.highway && tb.highway) bits |= MODE.HIGHWAY;
        if (bits) { add(a, b, bits); add(b, a, bits); }
      }
    }

    /*
     * THE WAYS OUT. A gateway is a land crossing and a lake port is a dock, so
     * one is reached by road or rail and the other only by ship — which is why
     * the lake edge carries MODE.PORT: a nation can grant a neighbour the use of
     * its motorway and still refuse it the use of its harbour.
     *
     * '@world' has no outgoing edges at all, so nothing can be laundered through
     * it back onto the map.
     */
    for (const nid of Game.nations.keys()) {
      const acc = Game.exportAccess(nid);
      if (acc.canada) { add(nid, CANADA, MODE.HIGHWAY | MODE.RAIL); add(CANADA, nid, MODE.HIGHWAY | MODE.RAIL); }
      /*
       * A GREAT LAKES PORT PUTS YOU ON THE LAKES, not in Canada (A2c). It used
       * to reach Canada directly, which was the owner's first rule — and then he
       * described the scenario the rule was for, and the scenario is richer than
       * the rule: a shipment out of Chicago has to pass Michigan's gates, then
       * New York's Niagara, then the St. Lawrence, and only then is it in
       * Canadian water. The river layer builds exactly that, so this shortcut
       * would now be a hole straight through four countries' chokepoints.
       */
      if (acc.mexico) { add(nid, MEXICO, MODE.HIGHWAY | MODE.RAIL); add(MEXICO, nid, MODE.HIGHWAY | MODE.RAIL); }
      /*
       * A PORT REACHES THE NEIGHBOURS AS WELL AS THE WORLD (A2b). This wired to
       * the world market alone when A2 shipped, so Los Angeles could sell to
       * Rotterdam and not to Tijuana. A ship leaving an American ocean port can
       * obviously reach a Canadian or Mexican one.
       */
      if (acc.oceanPorts) {
        add(nid, WORLD, MODE.PORT);
        add(nid, CANADA, MODE.PORT); add(CANADA, nid, MODE.PORT);
        add(nid, MEXICO, MODE.PORT); add(MEXICO, nid, MODE.PORT);
      }
    }
    add(CANADA, WORLD, MODE.PORT);
    add(MEXICO, WORLD, MODE.PORT);

    // ...and the rivers, which are borders too, and cheaper ones (A2c).
    riverLayer(add);

    cache = { key, nodes, edges };
    return cache;
  }


  /* ---- the rivers (A2c) ----------------------------------------------- */

  /*
   * THE LARGEST NETWORK OF NAVIGABLE INLAND WATERWAY IN THE WORLD, and until now
   * this game did not know it existed.
   *
   * The argument for building it is Peter Zeihan's and it is recorded in full at
   * FUTURE-IDEAS F6: moving heavy goods by water costs a fraction of moving them
   * by land, the United States has ~17,600 miles of it, and that one geographic
   * fact underwrites American economic power in a way no other continent enjoys.
   * A game about the United States coming apart, in which the rivers do not
   * matter, has thrown away the thing that made it rich.
   *
   * HOW IT IS MODELLED, and the shape came out of the data rather than being
   * imposed on it. Each corridor in data/county_trade.json is an ORDERED run of
   * counties from headwater to mouth — the Mississippi is 105 of them, Minnesota
   * down to Plaquemines. Fifteen counties are flagged as chokepoints, and on the
   * Mississippi they sit at indices 47, 58, 99 and 104: the Missouri confluence,
   * Cairo, New Orleans and the Mouth, in that order. They are not scattered.
   * They are the gates, in sequence.
   *
   * So a corridor is cut at its chokepoints into SEGMENTS. Anybody sharing a
   * segment can move goods to anybody else on it for the price of water, which
   * is what a river IS — a road nobody had to build. To get from one segment to
   * the next you must pass the chokepoint, and whoever owns that county can
   * charge you or refuse you. Nothing new had to be invented for that: a
   * chokepoint holder is an ordinary intermediary, tolled by the machinery A2
   * already built.
   *
   * The confluences fall out for free. The Ohio corridor ends at Cairo and the
   * Missouri at St. Louis, and both of those ARE chokepoints, so the tributaries
   * join the trunk exactly where somebody is standing on the gate.
   */
  function riverLayer(add) {
    const data = typeof Game.tradeData === 'function' ? Game.tradeData() : null;
    if (!data || !data.corridors) return;
    const cps = data.choke_point_labels || {};
    const counties = data.counties || {};
    const ownerOfCounty = (f) => {
      try { return Game.getOwner(Game.areaIdOf(f)); } catch (e) { return undefined; }
    };
    const gateOf = (f) => {
      const row = counties[f] || {};
      return { fips: f, label: cps[f], owner: ownerOfCounty(f),
        coastal: !!row.coastal, lakes: !!row.great_lakes };
    };

    const segments = [];
    const gates = [];

    /*
     * CUT EACH CORRIDOR AT ITS GATES, IN ORDER, and remember which two stretches
     * each gate stands between. Getting this wrong is not a small error: an
     * earlier version let every gate on a river touch every stretch of it, which
     * put Minnesota one hop from Louisiana and quietly deleted the entire
     * mechanic. A river is a LINE. You pass the gates in sequence or you do not
     * pass at all.
     */
    for (const [name, list] of Object.entries(data.corridors)) {
      const mine = [];
      let cur = { corridor: name, nations: new Set(), counties: [] };
      const flush = () => { segments.push(cur); mine.push(segments.length - 1); cur = { corridor: name, nations: new Set(), counties: [] }; };
      for (const f of list) {
        if (cps[f]) {
          flush();
          const g = gateOf(f);
          g.corridor = name;
          g.before = mine[mine.length - 1];
          gates.push(g);
          g.index = gates.length - 1;
          continue;
        }
        cur.counties.push(f);
        const o = ownerOfCounty(f);
        if (o) cur.nations.add(o);
      }
      flush();
      // The stretch that opened after the last gate is the one below it.
      for (const g of gates) {
        if (g.corridor !== name || g.after != null) continue;
        const pos = mine.indexOf(g.before);
        g.after = pos >= 0 && pos + 1 < mine.length ? mine[pos + 1] : null;
      }
    }

    /*
     * THE FIVE GATES THAT ARE NOT ON A RIVER are sea entrances — the Golden
     * Gate, the Chesapeake, Juan de Fuca, the Houston Ship Channel, and the
     * St. Lawrence outlet. They guard a way IN from the ocean rather than a
     * stretch of water, so they attach to whatever stretch they physically
     * touch.
     */
    for (const f of Object.keys(cps)) {
      if (gates.some((g) => g.fips === f)) continue;
      const g = gateOf(f);
      g.corridor = null;
      g.touches = segments
        .map((seg, i) => (seg.counties.some((c) => adjacentCounties(c).includes(f)) ? i : -1))
        .filter((i) => i >= 0);
      gates.push(g);
    }

    /* Anybody on the same stretch of water can reach anybody else on it, for
       the price of water. The river is not anybody's road. */
    for (const seg of segments) {
      const list = [...seg.nations].sort();
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          add(list[i], list[j], MODE.RIVER);
          add(list[j], list[i], MODE.RIVER);
        }
      }
    }

    /*
     * AND THE GATES, each joining ONLY the stretches it actually stands
     * between. Whoever holds the county holds the gate, so passing it is an
     * ordinary hop and they can charge for it or refuse it. This is the whole
     * mechanic, and on the opening board it is: Michigan on four Great Lakes
     * gates, New York on the Niagara and the St. Lawrence, Illinois on Cairo and
     * the Chicago canal, and Louisiana on both New Orleans and the Mouth of the
     * Mississippi.
     */
    const joinGate = (g, segIdx) => {
      const seg = segments[segIdx];
      if (!seg || !g.owner) return;
      for (const n of seg.nations) {
        if (n === g.owner) continue;
        add(n, g.owner, MODE.RIVER);
        add(g.owner, n, MODE.RIVER);
      }
    };
    for (const g of gates) {
      if (!g.owner) continue;
      if (g.corridor) { joinGate(g, g.before); joinGate(g, g.after); }
      else for (const i of g.touches || []) joinGate(g, i);
      /*
       * A gate standing on the open sea is the way OUT, and it is the most
       * valuable ground on this map: Louisiana holding the Mouth of the
       * Mississippi can tax everything that floats down from Minnesota.
       */
      if (g.coastal) add(g.owner, WORLD, MODE.RIVER);
    }

    /*
     * THE LAKES LEAVE BY THE ST. LAWRENCE AND NOWHERE ELSE, which is the whole
     * of Aaron's scenario: a shipment out of Chicago passes Michigan's gates,
     * then New York's Niagara, then New York's St. Lawrence, and only then is it
     * in Canadian water. A Great Lakes port therefore puts a nation ON the lakes;
     * it does not by itself put them in Canada.
     */
    const stLawrence = gates.find((g) => /St\. Lawrence/.test(g.label || ''));
    if (stLawrence && stLawrence.owner) {
      add(stLawrence.owner, CANADA, MODE.RIVER);
      add(CANADA, stLawrence.owner, MODE.RIVER);
    }

    lastRivers = { segments, gates };
  }

  let lastRivers = null;
  /** What the river layer decided this turn: the stretches, and who holds the gates. */
  const rivers = () => { graph(); return lastRivers; };

  /** County neighbours, guarded — the corridor lists carry counties the map may not. */
  function adjacentCounties(f) {
    try { return Game.countyNeighbors(f) || []; } catch (e) { return []; }
  }

  /** Every mode available across one border, as bits. 0 if goods cannot cross. */
  function modesBetween(a, b) {
    const m = graph().edges.get(a);
    return m ? (m.get(b) || 0) : 0;
  }

  /* ---- what a route costs ------------------------------------------- */

  /**
   * THE ONE SPELLING OF THE TOLL ARITHMETIC. Written as a loop rather than a
   * product of factors, because the loop is also the explanation: money is
   * carried, each hand it passes through takes a cut of what reaches it, and
   * what is left goes on.
   *
   * A route with no intermediaries never enters the loop, so `keep` is exactly
   * 1.0 and every deal the game could already sign is unaffected to the bit.
   *
   * `hopFriction` is not decoration. Compounding alone does NOT price out a long
   * chain — five hops at the negotiated floor would still deliver 77% — so
   * without a per-crossing cost that nobody collects, a five-hop resale chain
   * remains profitable and the roadmap's own success metric fails. The friction
   * is what makes distance cost something regardless of how generous the
   * middlemen are.
   */
  function priceRoute(hops, tune) {
    const t = T(tune);
    const foreign = t.get('transit.foreignCorridorToll');
    let carried = 1;
    const legs = [];
    for (const h of hops || []) {
      if (h.corridor) {
        const take = carried * foreign;
        carried -= take;
        // Nobody is credited. The owner's ruling: it is a cost, not a transfer.
        legs.push({ node: h.node, corridor: true, mode: h.mode, rate: foreign, take, transfer: false });
        continue;
      }
      const take = carried * h.rate;
      carried = (carried - take) * (1 - frictionFor(h.mode, t));
      legs.push({ node: h.node, corridor: false, mode: h.mode, rate: h.rate, take, transfer: true });
    }
    return { keep: carried, legs };
  }

  /* ---- finding a way through ---------------------------------------- */

  // Fixed order, cheapest first, so the search meets the best way across a
  // border before the worse ones and the tie-break rarely has to decide.
  const BITS = [MODE.RIVER, MODE.PORT, MODE.RAIL, MODE.HIGHWAY];

  /**
   * The best way to get goods from `a` to `b`, or null.
   *
   * HOP-LAYERED, NOT DIJKSTRA, and the reason is the hop cap. A shortest-path
   * search with a cap bolted on will settle a node at its cheapest depth and
   * then report "no route" when the only permitted way through needs a shallower
   * one. Relaxing layer by layer keeps the best route at EACH depth, so the cap
   * can never hide a route that fits inside it.
   *
   * NO LOGARITHMS. The textbook trick is to sum -ln(factor) and run an ordinary
   * shortest path, but Math.log is not specified bit-identical across JavaScript
   * engines, and a saved game that replays differently because the player opened
   * it in a different browser is the worst class of bug this project can
   * produce. Multiplication of doubles is exactly rounded and every factor is in
   * (0, 1], so the product only ever falls.
   *
   * THE TIE-BREAK IS A TOTAL ORDER — more money, then fewer middlemen, then the
   * alphabetically earlier chain — because "whichever the loop happened to find
   * first" is iteration order, and iteration order is how a replay diverges.
   *
   * PERMISSION IS ASKED HERE, NOT BAKED INTO THE GRAPH. Baking grants into the
   * graph would mean rebuilding it every time anybody signed anything; asking at
   * relax time is what lets the graph be built once a turn.
   */
  function find(a, b, opts) {
    const o = opts || {};
    const t = T(o.tune);
    const g = graph();
    if (a === b || !g.edges.has(a) || !g.edges.has(b)) return null;
    const maxHops = t.get('transit.maxHops');
    const maxCorridors = t.get('transit.maxCorridors');
    const foreign = t.get('transit.foreignCorridorToll');
    /*
     * `permit(node, mode)` answers "may this nation's goods cross that one by
     * that mode, and at what rate". Absent, nothing routes through anybody,
     * which is the correct behaviour before any agreement exists.
     */
    const permit = o.permit || (() => null);

    const better = (x, y) => {
      if (!y) return true;
      if (x.keep !== y.keep) return x.keep > y.keep;
      if (x.hops.length !== y.hops.length) return x.hops.length < y.hops.length;
      return x.chain < y.chain;
    };

    let layer = new Map([[a, { keep: 1, hops: [], corridors: 0, chain: '', enteredBy: 0 }]]);
    let best = null;
    for (let depth = 0; depth <= maxHops; depth++) {
      const next = new Map();
      for (const u of [...layer.keys()].sort()) {
        const st = layer.get(u);
        const outs = g.edges.get(u);
        if (!outs) continue;
        for (const v of [...outs.keys()].sort()) {
          const bits = outs.get(v);
          for (const m of BITS) {
            if (!(bits & m)) continue;
            /*
             * LEAVING an intermediary needs its permission too, at the mode
             * actually used to leave — a nation that opened its motorways has
             * not thereby opened its docks. The corridor nodes are exempt: they
             * are not countries and have no say (the owner's ruling).
             */
            if (u !== a && !isOutside(u) && !permit(u, m)) continue;
            if (v === b) {
              const cand = { keep: st.keep, hops: st.hops, chain: st.chain };
              if (better(cand, best)) best = { keep: st.keep, hops: st.hops.slice(), chain: st.chain };
              continue;
            }
            if (v === WORLD) continue;          // the world is a destination, never a step
            if (depth >= maxHops) continue;     // no room for another middleman
            const corridor = isOutside(v);
            if (corridor && st.corridors >= maxCorridors) continue;
            let rate = 0;
            if (corridor) {
              rate = foreign;
            } else {
              const grant = permit(v, m);
              if (!grant) continue;             // ENTERING needs permission as well
              rate = grant.rate;
            }
            const take = st.keep * rate;
            const carried = corridor ? st.keep - take : (st.keep - take) * (1 - frictionFor(m, t));
            const cand = {
              keep: carried,
              hops: st.hops.concat([{ node: v, mode: m, rate, corridor }]),
              corridors: st.corridors + (corridor ? 1 : 0),
              chain: `${st.chain}|${v}`,
              enteredBy: m,
            };
            if (better(cand, next.get(v))) next.set(v, cand);
          }
        }
      }
      if (!next.size) break;
      layer = next;
    }
    if (!best) return null;
    // Recomputed through the one spelling of the arithmetic, so the route a
    // caller is handed can never disagree with the price it will be charged.
    const priced = priceRoute(best.hops, t);
    return { hops: best.hops, keep: priced.keep, legs: priced.legs };
  }

  /** The best way for a nation to reach a market outside the continent. */
  const toWorld = (nid, opts) => find(nid, WORLD, opts);

  /**
   * Every nation this one can reach through corridors it already holds, in ONE
   * sweep rather than one search per candidate (A4).
   *
   * The distinction matters at this scale. Asking `find` whether each of sixty
   * nations is reachable is sixty searches per nation and 3,600 a round, which
   * measured at a quarter of a second on its own. One outward sweep answers the
   * same question for everybody at once, and the AI only needs the SET — which
   * partners exist — because `Moves.plan` prices the route properly afterwards.
   */
  function reachable(nid, opts) {
    const o = opts || {};
    const t = T(o.tune);
    const g = graph();
    if (!g.edges.has(nid)) return [];
    const permit = o.permit || permitFor(nid, o.turn);
    const maxHops = t.get('transit.maxHops');
    const out = new Set();
    let layer = new Set([nid]);
    const usedAsHop = new Set([nid]);
    for (let depth = 0; depth <= maxHops; depth++) {
      const next = new Set();
      for (const u of [...layer].sort()) {
        const outs = g.edges.get(u);
        if (!outs) continue;
        for (const v of [...outs.keys()].sort()) {
          if (isOutside(v) || v === nid) continue;
          out.add(v);
          if (depth >= maxHops || usedAsHop.has(v)) continue;
          // Somebody may only be STEPPED THROUGH if they have granted passage.
          const bits = outs.get(v);
          const ok = [MODE.RIVER, MODE.PORT, MODE.RAIL, MODE.HIGHWAY]
            .some((m) => (bits & m) && permit(v, m));
          if (ok) { usedAsHop.add(v); next.add(v); }
        }
      }
      if (!next.size) break;
      layer = next;
    }
    return [...out].sort();
  }

  /** Can these two trade at all, directly or through somebody? */
  function reaches(a, b, opts) {
    if (a === b) return false;
    if (modesBetween(a, b)) return true;
    return !!find(a, b, opts);
  }

  /** What share of a deal's income survives its route. 1 when there is none. */
  function keep(deal, tune) {
    if (!deal || !deal.route || !deal.route.hops || !deal.route.hops.length) return 1;
    return priceRoute(deal.route.hops, tune).keep;
  }

  /* ---- the agreement register ---------------------------------------- */

  /*
   * A grant is DIRECTED and PER MODE. Nevada carrying Idaho's goods is a
   * different object from Idaho carrying Nevada's, and the whole point of the
   * mode tiers is that a nation can wave the lorries through and refuse the
   * ships — so the key is the triple, not the pair.
   */
  const gkey = (grantor, grantee, mode) => `${grantor}>${grantee}:${mode}`;

  let offers = new Map();    // id -> incoming request
  let offerSeq = 0;
  let grants = new Map();    // id -> record
  let byKey = new Map();     // 'grantor>grantee:mode' -> id of the live grant
  let notices = [];          // append-only: who closed what, and when
  let seq = 0;

  function clearRegister() {
    grants = new Map();
    byKey = new Map();
    notices = [];
    offers = new Map();
    seq = 0;
    offerSeq = 0;
  }

  /** Turns this grant still has to run, counting the one being asked about. */
  const remaining = (rec, turn) =>
    rec.since + rec.duration - (turn == null ? World.getTurn() : turn);

  /**
   * The live grant on one triple, or null.
   *
   * A grant under NOTICE still carries. That is what a notice period is for:
   * the point of giving a year's warning rather than closing the border on a
   * Tuesday is that the other side gets a year to find another way through.
   */
  function live(grantor, grantee, mode, turn) {
    const id = byKey.get(gkey(grantor, grantee, mode));
    if (!id) return null;
    const rec = grants.get(id);
    if (!rec || rec.status === 'ended') return null;
    if (remaining(rec, turn) < 1) return null;
    if (rec.status === 'noticed' && rec.endsTurn != null
      && (turn == null ? World.getTurn() : turn) >= rec.endsTurn) return null;
    return rec;
  }

  /**
   * May these goods cross this ground, and at what rate?
   *
   * THE CORRIDOR BRANCH COMES FIRST AND RETURNS, and that is the owner's ruling
   * made structural rather than merely remembered: there is no path from here on
   * which Canada or Mexico could acquire an agreement, an opinion, a treasury or
   * a veto. They are priced by one tunable and nothing else.
   */
  function permits(node, grantee, mode, turn) {
    if (isOutside(node)) {
      return { rate: window.TUNE.get('transit.foreignCorridorToll'), transfer: false, id: null };
    }
    const rec = live(node, grantee, mode, turn);
    if (!rec) return null;
    /*
     * A NEIGHBOUR YOU TRADE WITH CHARGES YOU LESS (A2b, the owner's rule).
     *
     * The reasoning is his: a nation that wants your goods has a reason to make
     * getting them cheap, and a corridor ought to be worth something at the
     * trade table rather than being a separate transaction with a separate
     * price. This is the blunt version of that idea — a flat discount, applied
     * automatically — and it is deliberately blunt: it costs almost nothing and
     * it is the cheapest way to find out whether holding a deal AND a corridor
     * with the same neighbour is interesting enough to build the negotiated
     * version (FUTURE-IDEAS F8 and F11).
     */
    let rate = rec.rate;
    if (typeof Deals !== 'undefined' && Deals.live(node, grantee)) {
      rate *= 1 - window.TUNE.get('transit.partnerDiscount');
    }
    return { rate, transfer: true, id: rec.id, cap: rec.cap };
  }

  /** A permission callback bound to one nation, for handing to `find`. */
  const permitFor = (grantee, turn) => (node, mode) => permits(node, grantee, mode, turn);

  /** Every live grant this nation is party to, either way round. */
  function forNation(nid, turn) {
    const out = [];
    for (const rec of grants.values()) {
      if (rec.grantor !== nid && rec.grantee !== nid) continue;
      if (!live(rec.grantor, rec.grantee, rec.mode, turn)) continue;
      out.push(rec);
    }
    return out.sort((a, b) => Number(a.id.slice(1)) - Number(b.id.slice(1)));
  }

  const get = (id) => grants.get(id) || null;

  /** Sign a corridor. Called from the resolver, never from a screen. */
  function grant(g, tune) {
    const t = T(tune);
    if (isOutside(g.grantor) || isOutside(g.grantee)) return null; // nobody grants for Canada
    if (g.grantor === g.grantee) return null;
    if (live(g.grantor, g.grantee, g.mode, g.since)) return null;  // one live grant per triple
    seq += 1;
    const rec = {
      id: `t${seq}`,
      grantor: g.grantor, grantee: g.grantee, mode: g.mode,
      // `cap` is null rather than Infinity: the save test compares bytes and
      // JSON has no way to write Infinity back.
      cap: g.cap == null ? null : g.cap,
      rate: g.rate,
      since: g.since == null ? World.getTurn() : g.since,
      duration: g.duration,
      notice: g.notice == null ? t.get('transit.noticeTurns') : g.notice,
      status: 'live',
      noticedTurn: null, noticedBy: null, endsTurn: null,
      endedTurn: null, reason: null,
    };
    grants.set(rec.id, rec);
    byKey.set(gkey(rec.grantor, rec.grantee, rec.mode), rec.id);
    return rec;
  }

  function close(rec, turn, reason) {
    rec.status = 'ended';
    rec.endedTurn = turn;
    rec.reason = reason;
    const k = gkey(rec.grantor, rec.grantee, rec.mode);
    if (byKey.get(k) === rec.id) byKey.delete(k);
  }

  /**
   * Give notice. EITHER SIDE MAY: a grantee walking away from a corridor it is
   * paying for is the same instrument seen from the other end, and refusing it
   * would leave the grantee no exit but a breach.
   *
   * THE COST IS PAID NOW, NOT WHEN IT TAKES EFFECT. It is the price of the
   * decision: charging at effect would let a nation serve notice on the last
   * turn of a game for nothing, and the injured party should see the entry on
   * the same turn they start counting down.
   */
  function serve(id, by, turn, tune) {
    const rec = grants.get(id);
    if (!rec || rec.status !== 'live') return null;
    const t = T(tune);
    const now = turn == null ? World.getTurn() : turn;
    rec.status = 'noticed';
    rec.noticedTurn = now;
    rec.noticedBy = by;
    rec.endsTurn = now + rec.notice;
    /*
     * The append-only record, in the shape Pacts uses for a torn-up treaty.
     * `kind` carries only one value today and is present anyway, so that the
     * future idea of walking out of a TRADE deal (FUTURE-IDEAS F2) appends
     * `kind: 'deal'` here rather than inventing a second idea about what
     * breaking a promise costs.
     */
    notices.push({
      turn: now, by, against: by === rec.grantor ? rec.grantee : rec.grantor,
      agreementId: rec.id, mode: rec.mode, kind: 'transit',
    });
    return rec;
  }

  /** Take a notice back. The route returns; the memory of it does not. */
  function withdraw(id) {
    const rec = grants.get(id);
    if (!rec || rec.status !== 'noticed') return null;
    rec.status = 'live';
    rec.noticedTurn = null; rec.noticedBy = null; rec.endsTurn = null;
    return rec;
  }

  /** Notices served by this nation still inside the memory window. */
  function reneges(nid, tune, turn) {
    const t = T(tune);
    const w = t.get('nation.historyWindow');
    const now = turn == null ? World.getTurn() : turn;
    return notices.filter((x) => x.by === nid && now - x.turn <= w).length;
  }

  /**
   * How reliable this nation looks as a corridor holder.
   *
   * Corridors held minus corridors closed, and a closure counts for more than a
   * grant — the Pacts asymmetry, for the same reason: signing is cheap, so if a
   * revocation cost no more than an agreement earned, a nation could out-sign
   * its own reputation by granting corridors it intended to close.
   */
  function standing(nid, tune, turn) {
    const t = T(tune);
    const held = forNation(nid, turn).filter((r) => r.grantor === nid).length;
    return held - reneges(nid, t, turn) * t.get('transit.renegeWeight');
  }

  /**
   * One turn of the register: the dead, the noticed, the expired, the forgotten.
   * Walked in ascending id order so a reloaded save resolves in the same order.
   */
  function tickRegister(tune, turn) {
    const t = T(tune);
    const now = turn == null ? World.getTurn() : turn;
    const ids = [...grants.keys()].sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)));
    for (const id of ids) {
      const rec = grants.get(id);
      if (rec.status === 'ended') continue;
      // A corridor whose other party no longer exists is not a corridor.
      if (!Game.getNation(rec.grantor) || !Game.getNation(rec.grantee)) {
        close(rec, now, 'died');
        continue;
      }
      if (rec.status === 'noticed' && rec.endsTurn != null && now >= rec.endsTurn) {
        close(rec, now, 'revoked');
        continue;
      }
      if (remaining(rec, now) < 1) close(rec, now, 'expired');
    }
    // Forget the closed ones, or the save grows without bound — the lesson A1
    // learned the expensive way, applied before it costs anything here.
    const w = t.get('nation.historyWindow');
    for (const [id, rec] of [...grants]) {
      if (rec.status === 'ended' && rec.endedTurn != null && now - rec.endedTurn > w) grants.delete(id);
    }
    notices = notices.filter((x) => now - x.turn <= w * 2);
  }

  /* ---- asking, and being asked --------------------------------------- */

  /*
   * ONE INBOX, NOT TWO. A nation asking to cross the player's ground and a
   * neighbour asking to renew a trade deal are the same shape of decision, and
   * a game that asks them in two different places has taught the player two
   * things where one would do. These are the same functions A1 wrote for deals,
   * with a corridor in them.
   */
  function propose(o, tune) {
    const t = T(tune);
    if (live(o.to, o.from, o.plan.mode)) return null;   // they already carry it
    if (offersFor(o.to).length >= t.get('deal.maxOpenOffers')) return null;
    offerSeq += 1;
    const made = o.made == null ? World.getTurn() : o.made;
    const rec = {
      id: `x${offerSeq}`,
      from: o.from, to: o.to, kind: 'transit',
      made, expires: made + t.get('deal.offerTurns'),
      terms: {
        mode: o.plan.mode, rate: o.plan.rate,
        duration: o.plan.duration, cap: o.plan.cap == null ? null : o.plan.cap,
        notice: o.plan.notice,
      },
    };
    offers.set(rec.id, rec);
    return rec;
  }

  function offersFor(nid, turn) {
    const now = turn == null ? World.getTurn() : turn;
    const out = [];
    for (const o of offers.values()) if (o.to === nid && o.expires > now) out.push(o);
    return out.sort((a, b) => a.made - b.made || (a.id < b.id ? -1 : 1));
  }

  const waiting = (nid, turn) => (nid ? offersFor(nid, turn)[0] || null : null);
  const declineOffer = (id) => offers.delete(id);

  /**
   * Answer one. 'grant' opens the corridor on the offered terms; anything else
   * refuses it. Goes through the model rather than the DOM so the whole decision
   * is testable with no screen attached.
   */
  function answer(offerId, choice, tune) {
    const o = offers.get(offerId);
    if (!o) return { ok: false, reason: 'That request is no longer open.' };
    offers.delete(offerId);
    if (choice !== 'grant') return { ok: true, granted: null };
    const rec = grant({
      grantor: o.to, grantee: o.from, mode: o.terms.mode, rate: o.terms.rate,
      duration: o.terms.duration, cap: o.terms.cap, notice: o.terms.notice,
    }, T(tune));
    return rec ? { ok: true, granted: rec } : { ok: false, reason: 'That corridor is already open.' };
  }

  /* ---- taking the toll ------------------------------------------------ */

  const say = (e) => (typeof Ledger === 'undefined' ? null : Ledger.append({ phase: 'transit', ...e }));
  const nameOf = (nid) => {
    if (nid === CANADA) return 'Canada';
    if (nid === MEXICO) return 'Mexico';
    const n = typeof Game === 'undefined' ? null : Game.getNation(nid);
    return n ? n.name : nid;
  };

  /**
   * ONE TURN OF EVERY ROUTE, in its own phase.
   *
   * DELIBERATELY NOT INSIDE `Deals.tick`. A1's settlement is left gross and
   * untouched, and the toll is taken here afterwards, so the scope rule for this
   * whole stage is provable by reading one diff: `git diff js/deals.js` shows a
   * single new field and nothing else. Put the arithmetic inside the deal and
   * that proof is gone, along with the ability to say what a deal is worth
   * without knowing where its goods went.
   *
   * NO OVERDRAW IS POSSIBLE, and it has to be said because `Game.earn` does not
   * clamp: what is debited here is a share of the credit `Deals.tick` made for
   * that same deal on this same turn, so it can never exceed it.
   *
   * CONSERVATION IS THE INVARIANT. What every hop takes, plus what arrives, is
   * exactly what the deal paid. The foreign corridors are the only leak, and
   * they leak on purpose: the owner's ruling is that Canada's ten per cent is a
   * cost nobody collects.
   *
   * THE PRICE IS RECOMPUTED FROM THE STORED HOPS every turn rather than stored
   * as a multiplier. A float in the save that disagreed with the fold in its last
   * bit would be a treasury drifting by pennies over sixty turns with nothing on
   * screen to point at.
   */
  function tick(tune, turn, opts) {
    const t = T(tune);
    const now = turn == null ? World.getTurn() : turn;
    const player = (opts || {}).player || null;
    tickRegister(t, now);
    if (typeof Deals === 'undefined') return;

    /*
     * IS THE ROUTE STILL THERE? Checked before anything is paid, because the
     * whole point of being able to close a corridor is that it hurts somebody
     * who was relying on it. A stalled deal earns NOTHING this turn — and its
     * term keeps running down, so a corridor holder who gives notice can burn a
     * five-year contract to nothing. That is the drama the stage exists for.
     */
    const live = [];
    for (const d of Deals.all()) {
      if (d.status !== 'live') continue;
      const route = d.route;
      if (!route || !route.hops || !route.hops.length) continue;
      const blocked = blockedAt(d, now);
      if (blocked) {
        if (!route.stalled) {
          route.stalled = { turn: now, at: blocked.at, why: blocked.why };
          if (player && (d.a === player || d.b === player)) {
            say({
              subject: player, kind: 'trade', event: 'stalled', dealId: d.id,
              partner: other({ a: d.a, b: d.b }, player),
              text: `Your goods can no longer cross ${nameOf(blocked.at)} — the deal with `
                + `${nameOf(d.a === player ? d.b : d.a)} pays nothing until there is another way through.`,
            });
          }
        }
        continue;                                  // stalled: nobody is paid
      }
      if (route.stalled) {
        route.stalled = null;
        if (player && (d.a === player || d.b === player)) {
          say({
            subject: player, kind: 'trade', event: 'resumed', dealId: d.id,
            partner: other({ a: d.a, b: d.b }, player),
            text: `Your goods are moving again to ${nameOf(d.a === player ? d.b : d.a)}.`,
          });
        }
      }
      live.push(d);
    }

    for (const d of live) {
      const route = d.route;
      const gross = Deals.settlement(d, t);
      const priced = priceRoute(route.hops, t);
      const lost = 1 - priced.keep;
      if (lost <= 0) continue;
      /*
       * BOTH PARTIES PAY. The goods are theirs jointly and the journey is the
       * deal's, not one side's; charging only the seller would make a routed
       * deal a bargain for whoever happened to be buying.
       */
      Game.earn(d.a, -gross.a * lost * 1e6);
      Game.earn(d.b, -gross.b * lost * 1e6);
      const paid = (gross.a + gross.b) * 1e6;
      for (const leg of priced.legs) {
        if (!leg.transfer) continue;               // Canada and Mexico collect nothing
        Game.earn(leg.node, leg.take * paid);
      }
      if (player && (d.a === player || d.b === player) && !route.told) {
        route.told = true;
        say({
          subject: player, kind: 'trade', event: 'routed', dealId: d.id,
          partner: other({ a: d.a, b: d.b }, player),
          text: `Your goods to ${nameOf(d.a === player ? d.b : d.a)} cross `
            + `${route.hops.map((h) => nameOf(h.node)).join(', ')} — you keep `
            + `${Math.round(priced.keep * 100)}% of what the deal pays.`,
        });
      }
    }
  }

  const other = (d, nid) => (d.a === nid ? d.b : d.a);

  /**
   * The first hop this deal can no longer cross, and why — or null if the whole
   * route still stands.
   *
   * THE REASON IS THE POINT, not the refusal. A route that has simply stopped
   * working is a mystery; one that says "Nevada closed its border" is a decision
   * the player can act on, and it is also exactly the record the network map
   * needs to draw a broken link and offer to renegotiate it.
   */
  function blockedAt(d, turn) {
    const grantee = d.a;    // the route was found from a's side and is stored that way
    for (const h of d.route.hops) {
      if (isOutside(h.node)) continue;             // Canada asks nothing and refuses nothing
      if (!Game.getNation(h.node)) return { at: h.node, why: 'lost' };
      const g = live(h.node, grantee, h.mode, turn);
      if (!g) return { at: h.node, why: 'revoked' };
      // A cap is a promise about volume, and a corridor over it carries the
      // older contract first — which is what a contract means.
      if (g.cap != null && loadOn(g, turn) > g.cap && !firstClaim(g, d, turn)) {
        return { at: h.node, why: 'capped' };
      }
    }
    return null;
  }

  /** Total value of every live routed deal leaning on one grant this turn. */
  function loadOn(g, turn) {
    if (typeof Deals === 'undefined') return 0;
    let sum = 0;
    for (const d of Deals.all()) {
      if (d.status !== 'live' || !d.route || !d.route.hops) continue;
      if (!d.route.hops.some((h) => h.node === g.grantor && h.mode === g.mode)) continue;
      if (d.a !== g.grantee && d.b !== g.grantee) continue;
      sum += Deals.committed(d.a).value;
      break;                                       // value is per nation, counted once
    }
    return sum;
  }

  /**
   * Does this deal have the prior claim on a corridor that is over its cap?
   *
   * OLDEST FIRST, AND A HARD CUT RATHER THAN A HAIRCUT. Sharing a full corridor
   * pro-rata would quietly shave a few per cent off everybody's income with no
   * event to explain it; stalling the newest contract is a thing that happened,
   * that can be said in one sentence, and that the player can do something
   * about.
   */
  function firstClaim(g, d, turn) {
    if (typeof Deals === 'undefined') return true;
    let oldest = null;
    for (const x of Deals.all()) {
      if (x.status !== 'live' || !x.route || !x.route.hops) continue;
      if (!x.route.hops.some((h) => h.node === g.grantor && h.mode === g.mode)) continue;
      if (!oldest || Number(x.id.slice(1)) < Number(oldest.id.slice(1))) oldest = x;
    }
    return !oldest || oldest.id === d.id;
  }

  /** What a nation takes from every deal it has, after carriage. */
  function netFor(nid, tune, turn) {
    if (typeof Deals === 'undefined') return 0;
    const t = T(tune);
    let sum = 0;
    for (const d of Deals.forNation(nid, turn)) {
      const s = Deals.settlement(d, t);
      sum += (d.a === nid ? s.a : s.b) * keep(d, t);
    }
    return sum;
  }

  /* ---- state --------------------------------------------------------- */

  const serialize = () => ({
    seq, offerSeq,
    grants: [...grants.values()].map((r) => ({ ...r })),
    notices: notices.map((n) => ({ ...n })),
    offers: [...offers.values()].map((o) => ({ ...o, terms: { ...o.terms } })),
  });

  function loadState(snap) {
    clearRegister();
    if (!snap) return;              // a document written before A2
    seq = snap.seq || 0;
    offerSeq = snap.offerSeq || 0;
    for (const o of snap.offers || []) offers.set(o.id, { ...o, terms: { ...o.terms } });
    for (const r of snap.grants || []) {
      const rec = { ...r };
      grants.set(rec.id, rec);
      if (rec.status !== 'ended') byKey.set(gkey(rec.grantor, rec.grantee, rec.mode), rec.id);
    }
    notices = (snap.notices || []).map((n) => ({ ...n }));
  }

  return {
    MODE, MODE_NAME, MODE_LABEL, CANADA, MEXICO, WORLD, isOutside,
    reset, graph, modesBetween, priceRoute, keep, find, toWorld, reaches, reachable, rivers,
    live, get, permits, permitFor, forNation, grant, serve, withdraw,
    reneges, standing, remaining, tick, tickRegister, netFor, blockedAt,
    propose, offersFor, waiting, answer, decline: declineOffer,
    serialize, loadState,
    count: () => [...grants.values()].filter((r) => r.status !== 'ended').length,
    all: () => [...grants.values()],
    noticesOf: () => notices.slice(),
  };
})();
