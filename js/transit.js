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
  const MODE = { HIGHWAY: 1, RAIL: 2, PORT: 4 };
  const MODE_NAME = { 1: 'highway', 2: 'rail', 4: 'port' };
  const MODE_LABEL = { 1: 'road', 2: 'rail', 4: 'port' };

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
      if (acc.lakePorts) { add(nid, CANADA, MODE.PORT); add(CANADA, nid, MODE.PORT); }
      if (acc.mexico) { add(nid, MEXICO, MODE.HIGHWAY | MODE.RAIL); add(MEXICO, nid, MODE.HIGHWAY | MODE.RAIL); }
      if (acc.oceanPorts) add(nid, WORLD, MODE.PORT);
    }
    add(CANADA, WORLD, MODE.PORT);
    add(MEXICO, WORLD, MODE.PORT);

    cache = { key, nodes, edges };
    return cache;
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
    const friction = t.get('transit.hopFriction');
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
      carried = (carried - take) * (1 - friction);
      legs.push({ node: h.node, corridor: false, mode: h.mode, rate: h.rate, take, transfer: true });
    }
    return { keep: carried, legs };
  }

  /* ---- finding a way through ---------------------------------------- */

  const BITS = [MODE.RAIL, MODE.HIGHWAY, MODE.PORT]; // fixed order: rail first

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
    const friction = t.get('transit.hopFriction');
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
            const carried = corridor ? st.keep - take : (st.keep - take) * (1 - friction);
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
    return rec ? { rate: rec.rate, transfer: true, id: rec.id, cap: rec.cap } : null;
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
    reset, graph, modesBetween, priceRoute, keep, find, toWorld, reaches,
    live, get, permits, permitFor, forNation, grant, serve, withdraw,
    reneges, standing, remaining, tick, tickRegister, netFor, blockedAt,
    propose, offersFor, waiting, answer, decline: declineOffer,
    serialize, loadState,
    count: () => [...grants.values()].filter((r) => r.status !== 'ended').length,
    all: () => [...grants.values()],
    noticesOf: () => notices.slice(),
  };
})();
