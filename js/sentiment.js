/*
 * Sentiment: how much of an Area a movement holds, and why.
 *
 *   base        = affinity(area's leading ideology, movement's ideology)   0..1
 *   grievance   = w_qol   * (1 - quality of life)
 *               + w_lib   * (1 - civil liberties)
 *               + w_power * (1 - how powerful the nation holding it is)
 *               + w_auth  * (1 - the nation's authority)
 *   pull        = w_nbr   * tanh(k * SUM over neighbours of their share)
 *   suppression = w_sup   * garrison pressure
 *
 *   target      = clamp01( base * (grievance + pull) - suppression )
 *
 * `base` IS MULTIPLICATIVE, and that is the design rule made mechanical:
 * *geography defines where a movement can exist; ideology defines how strong it
 * is there*. An Area that does not share the ideology cannot be radicalised into
 * that movement no matter how badly it is governed — misgovern a Democratic
 * Socialist city and you do not get Deseret, you get somebody else. Additive
 * grievance would have let bad government alone produce any movement anywhere,
 * which turns twenty-four regional factions into one national discontent meter.
 *
 * SENTIMENT IS THE SHARE ITSELF, not a second number beside it. `area.mov[name]`
 * is already the head count a movement has organised, and its share of the Area
 * is exactly what "sentiment" means; keeping both would be two representations
 * of one fact — the D54 mistake — and would need two rate limits stacked on each
 * other. So the movement's share eases toward this target, and `mov` persists
 * the result the way it always has. Nothing new goes in the save.
 *
 * THE EXPLANATION IS THE CALCULATION. `target()` returns a Why record in the
 * same shape `js/power.js` produces, and the phase throws the `inputs` array
 * away because storing 1,676 x 12 of them every turn is 20,000 objects for data
 * nobody has asked for yet. `explain()` calls THE SAME FUNCTION and keeps it, so
 * the answer to "why did Salt Lake jump?" is recomputed rather than remembered —
 * and cannot be a second, drifting implementation of the model.
 *
 * PULL is the diffusion term that did not exist before M4.2, and it is what lets
 * a movement spread from its seed instead of only ever existing where it was
 * planted. Read from the CSR graph and from `snap`, never from `next`.
 */
const Sentiment = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));

  /**
   * One (Area, movement) target, with its working.
   *
   * @param a {base, qol, liberties, nationPower, authority, neighbourSum,
   *           occupied, cap, current}
   * @returns {{value, target, base, grievance, pull, suppression, inputs[], summary}}
   */
  function target(a, tune, collect) {
    /*
     * `collect` is false on the hot path and true for `explain()`.
     *
     * ONE implementation either way — the same expressions in the same order, so
     * the explanation cannot drift from the model. What it skips is building the
     * rows the phase immediately throws away: 1,676 Areas x 17 movements x 6
     * terms is about 170,000 objects a turn allocated to be discarded.
     */
    const rows = collect ? [] : null;
    const term = (label, raw, norm, key, note) => {
      const weight = tune.get(key);
      const n = clamp01(norm);
      const contribution = weight * n;
      if (rows) rows.push({ label, raw, norm: n, weight, contribution, key, note });
      return contribution;
    };

    // GRIEVANCE — every term is "how badly is this place served", 0..1.
    let grievance = 0;
    grievance += term('Quality of life', a.qol, 1 - clamp01(a.qol),
      'sent.wQol', 'how poorly the nation feeds, treats and pays its people');
    grievance += term('Civil liberties', a.liberties, 1 - clamp01(a.liberties),
      'sent.wLiberty', 'how little room the government leaves to disagree with it');
    grievance += term('A weak nation', a.nationPower, 1 - clamp01(a.nationPower),
      'sent.wPower', 'how little weight the nation holding this Area carries');
    grievance += term('Weak authority', a.authority, 1 - clamp01(a.authority),
      'sent.wAuthority', 'how loosely the state holds its own ground');
    /*
     * WAR WEARINESS (M7.3), the second place a long campaign is felt at home and
     * the one that turns it into a secession problem.
     *
     * Fed the value DIRECTLY rather than `1 - value` like its neighbours here,
     * because weariness already measures how badly things are going: a rested
     * state gives a movement nothing, an exhausted one hands it an argument.
     */
    grievance += term('War weariness', a.weariness || 0, clamp01(a.weariness || 0),
      'sent.wWeariness', "what the state's own wars are costing the people at home");

    /*
     * A STANDING ARGUMENT ON PARTICULAR GROUND (M8.7).
     *
     * Every other grievance term is a property of the NATION holding the Area —
     * how it feeds its people, how it governs, how tired it is. This one is a
     * property of the AREA, and it is the only way to say something the model
     * otherwise cannot: that this specific place has a reason of its own, older
     * than whoever currently governs it.
     *
     * The Shattering uses it for the Mormon Corridor that did not cede, and
     * hardest on the Areas that voted to go and were cut off from Salt Lake. It
     * had to be a term rather than a bigger seed, because a seeded share erodes
     * back toward the formula's target at `sent.maxFall` every turn: seeding
     * alone makes a region angriest on turn 1 and calmest by turn 10, which is
     * the story backwards.
     *
     * It rides INSIDE grievance, so it is still multiplied by `base` — a place
     * with an authored grievance toward a movement whose ideology it does not
     * share still cannot be radicalised into it, which is the rule the whole
     * formula is built on. `attrs.sentBoost` round-trips in the v2 save for
     * free, and because `target` and `explain` are one implementation the boost
     * shows up as a named row in the Why panel with no second code path.
     */
    if (a.boost) {
      grievance += term('Unfinished business', a.boost, clamp01(a.boost),
        'sent.wBoost', 'a grievance this ground carries whoever governs it');
    }

    // PULL — the diffusion term. tanh so that one committed neighbour matters a
    // lot and the tenth matters little: a movement spreads along a frontier, it
    // does not multiply by how many friends it already has.
    const k = tune.get('sent.pullScale');
    const pull = term('Neighbours', a.neighbourSum, Math.tanh(k * (a.neighbourSum || 0)),
      'sent.wPull', 'how strongly the surrounding Areas already hold this movement');

    /*
     * SUPPRESSION — subtracted after the multiplier, because a garrison holds
     * ground down whatever the population thinks of it.
     *
     * It was a BOOLEAN until M6.5: occupied ground was held down and everything
     * else was not, so the only way to answer a rising movement was to give the
     * ground away. It is now `Military.garrisonPressure`, which is continuous,
     * costs money every turn, and costs Civil Liberties — which feed the
     * grievance that makes the next movement. A garrison buys quiet now and
     * pays for it later, and that is the trade the term exists to offer.
     *
     * Occupied ground still counts on its own: a foreign garrison is not the
     * same thing as a domestic one, and the model already knew that.
     */
    const held = Math.max(a.occupied ? 1 : 0, a.garrison || 0);
    const suppression = term('Suppression', held, held,
      'sent.wSuppression', a.occupied ? 'occupying force stationed here' : 'garrison stationed here');

    const base = clamp01(a.base);
    /*
     * SELF-RULE ANSWERS THE GRIEVANCE, not one term of it.
     *
     * A garrison presses the number down from outside; autonomy takes the
     * argument away. The answer it gives is not "your quality of life improved"
     * but "this is your government now", so it scales the whole grievance rather
     * than adding another subtraction beside suppression — which is also what
     * stops the two valves stacking into a free answer when used together.
     */
    const selfRule = a.autonomous ? tune.get('autonomy.sentimentRelief') : 0;
    const raw = base * (grievance * (1 - selfRule) + pull) + suppression; // suppression's weight is negative
    let value = clamp01(raw);
    if (a.cap != null) value = Math.min(value, a.cap);

    if (!rows) return { value, target: value, raw, base, grievance, pull, suppression };
    return {
      value, target: value, raw, base, grievance, pull, suppression,
      inputs: rows,
      summary: summarise(value, base, grievance, pull, suppression, a),
    };
  }

  function summarise(value, base, grievance, pull, suppression, a) {
    if (base < 0.35) return 'Ideologically out of reach here, however it is governed';
    const band = value >= 0.5 ? 'Strong' : value >= 0.3 ? 'Organised'
      : value >= 0.12 ? 'Present' : 'Marginal';
    const driver = pull > grievance ? 'spreading from its neighbours'
      : grievance > 0.25 ? 'fed by how this place is governed'
        : 'held together by little more than sympathy';
    const held = suppression < -0.001 ? ', held down by occupation' : '';
    return `${band}, ${driver}${held}`;
  }

  /**
   * The per-turn facts every (Area, movement) target is measured against.
   *
   * Built once: the nation-level terms are the same for every Area a nation
   * owns, and `Ideology.affinity` between two fixed ideologies is a lookup, not
   * a computation — asking per Area per movement is the M3.3 mistake again.
   */
  let ctxCache = null, ctxEpoch = -1, ctxTurn = -1;

  function context(owners, tune) {
    /*
     * ONE PASS PER TURN for the read-only callers, and only for them.
     *
     * `explain` and `clock` build this to answer one question about one Area,
     * and the AI's scorer asks that question for every candidate release and
     * every candidate grant of autonomy — several hundred times a turn, each
     * one a full sweep of the roster and all 1,676 Areas. Measured: it was
     * 950 ms of a 1,000 ms round.
     *
     * The `owners` argument is the PHASE's, which passes a specific ownership
     * snapshot and must never be handed somebody else's — so only the
     * `owners == null` path is cached. Keyed on `Game.ownerEpoch()`, the MODEL
     * clock: it moves on every ownership write whatever the batch depth, where
     * `Game.epoch()` is the render clock and is frozen inside one. Keying on the
     * render clock handed the scorer a context built before a nation existed,
     * indexed by a nation index that had not been assigned yet.
     */
    if (owners == null) {
      const epoch = Game.ownerEpoch();
      const turn = World.getTurn();
      if (ctxCache && ctxEpoch === epoch && ctxTurn === turn) return ctxCache;
      const built = build(owners, tune);
      ctxCache = built; ctxEpoch = epoch; ctxTurn = turn;
      return built;
    }
    return build(owners, tune);
  }

  function build(owners, tune) {
    const byNation = [];           // nation index -> {qol, liberties, power, authority}
    let maxWeight = 0;
    const weightOf = [];
    for (const [nid] of Game.nations) {
      const w = Game.nationWeight(nid);
      weightOf.push({ nid, w });
      maxWeight = Math.max(maxWeight, w);
    }
    for (const { nid, w } of weightOf) {
      const n = Game.getNation(nid);
      if (!n) continue;
      byNation[Game.nationIndexOf(nid)] = {
        qol: n.qol == null ? 0.5 : n.qol,
        liberties: n.liberties == null ? 0.5 : n.liberties,
        authority: n.authority == null ? 0.5 : n.authority,
        weariness: n.weariness == null ? 0 : n.weariness,
        // "How powerful is the nation holding me": its share of the largest
        // nation's weight. A weak state invites secession; a superpower does not.
        power: maxWeight > 0 ? clamp01(w / maxWeight) : 0,
        // How hard this nation is holding its own ground down (M6.5). Computed
        // once per nation per turn rather than per Area, because it is a
        // property of the nation and its Area count, not of the Area.
        garrison: typeof Military !== 'undefined' ? Military.garrisonPressure(nid, tune) : 0,
      };
    }

    // affinity[ideologyIndex][movementIndex], resolved once.
    const movements = Movements.getSpawned();
    const N = Ideology.count();
    const affinity = [];
    for (let i = 0; i < N; i++) {
      affinity[i] = movements.map((m) => Ideology.affinity(i, Movements.ideologyIndexOf(m)));
    }
    const caps = movements.map((m) => Movements.capOf(m, tune));
    /*
     * HOW FAR (`caps`) AND HOW FAST (`rises`), resolved once per turn beside
     * each other because they are the two halves of one question and the phase
     * reads both in the same inner loop. `rises[m]` is already multiplied by
     * `sent.maxRise`, so the phase compares a delta against a number rather than
     * doing a lookup and a multiply 1,676 x 32 times a turn.
     */
    const maxRise = tune.get('sent.maxRise');
    const rises = movements.map((m) => maxRise * Movements.rateOf(m));

    /*
     * Homelands as NODE sets, and occupation as a node-indexed flag.
     *
     * Both are read per (Area, movement) in the inner loop — 1,676 x 12 lookups
     * a turn — so they are resolved to integers once here rather than going
     * through `Game.areaIdOf` and a Set of strings twenty thousand times.
     */
    const homelands = movements.map((m) => {
      const rec = Movements.get(m);
      const set = new Set();
      if (rec) for (const f of rec.homeland) { const i = Game.nodeOf(f); if (i >= 0) set.add(i); }
      return set;
    });
    const g = Game.graph();
    const occupied = new Uint8Array(g ? g.n : 0);
    const autonomous = new Uint8Array(g ? g.n : 0);
    // The authored per-Area grievance (M8.7). Float32: it is a bounded score,
    // and 1,676 of them is a rounding error beside the sentiment matrix.
    const boost = new Float32Array(g ? g.n : 0);
    if (g) {
      for (let i = 0; i < g.n; i++) {
        const id = g.idAt(i);
        occupied[i] = Game.isOccupied(id) ? 1 : 0;
        autonomous[i] = Game.isAutonomous(id) ? 1 : 0;
        const c = Game.county[id];
        boost[i] = (c && c.attrs && c.attrs.sentBoost) || 0;
      }
    }

    return { byNation, movements, affinity, caps, rises, homelands, occupied, autonomous, boost, owners };
  }

  /**
   * Recompute one Area's sentiment toward one movement, WITH its working.
   *
   * The UI's "why is this happening?" answer. Calls the same `target()` the
   * phase calls, so the explanation cannot drift from the model.
   */
  function explain(areaId, movementName, tune) {
    const t = tune || window.TUNE;
    const c = Game.county[areaId];
    const rec = Movements.get(movementName);
    if (!c || !rec) return null;
    const ctx = context(null, t);
    const mi = ctx.movements.indexOf(movementName);
    if (mi < 0) return null;

    const nid = Game.getOwner(areaId);
    const nation = nid ? ctx.byNation[Game.nationIndexOf(nid)] : null;
    const node = Game.nodeOf(areaId);
    const g = Game.graph();
    let pop = 0;
    for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
    let neighbourSum = 0;
    for (const nb of g.neighbors(node)) {
      const other = Game.county[g.idAt(nb)];
      if (!other) continue;
      let p = 0;
      for (let i = 0; i < other.pop.length; i++) p += other.pop[i];
      if (p > 0) neighbourSum += (other.mov[movementName] || 0) / p;
    }

    /*
     * THE AREA'S OWN QUALITY OF LIFE AND LIBERTIES (M12), blended with its
     * nation's. Both are true: a country in crisis is in crisis everywhere, and
     * a poor interior is a poor interior inside a rich country. Before M12 the
     * second half did not exist and grievance had no gradient to build on
     * inside a border — which is why the pressure map was flat inside one.
     *
     * `-1` in the column means the ground has not been read yet (a brand-new
     * Area, the turn it is created), and the honest answer then is the nation's
     * number rather than zero.
     */
    const wLocal = t.get('sent.wLocal');
    const areaQol = Game.areaQol ? Game.areaQol(areaId) : -1;
    const areaLib = Game.areaLiberties ? Game.areaLiberties(areaId) : -1;
    const natQol = nation ? nation.qol : 0.5;
    const natLib = nation ? nation.liberties : 0.5;
    const rc = target({
      base: ctx.affinity[Ideology.dominantIndex(c.pop)][mi],
      qol: areaQol >= 0 ? (1 - wLocal) * natQol + wLocal * areaQol : natQol,
      liberties: areaLib >= 0 ? (1 - wLocal) * natLib + wLocal * areaLib : natLib,
      nationPower: nation ? nation.power : 0.5,
      authority: nation ? nation.authority : 0.5,
      neighbourSum,
      weariness: (Game.getNation(Game.getOwner(areaId)) || {}).weariness || 0,
      occupied: Game.isOccupied ? Game.isOccupied(areaId) : false,
      autonomous: Game.isAutonomous ? Game.isAutonomous(areaId) : false,
      // Read off the Area, the same value the phase reads out of its context.
      boost: (c.attrs && c.attrs.sentBoost) || 0,
      /*
       * Read LIVE, not from the cached context. The garrison is the one input
       * here that changes without ownership moving and without the turn
       * advancing — the two things the context cache is keyed on — so a player
       * dragging the Garrison slider would have seen the sentiment panel report
       * the pressure they had before they touched it. Caught by the test that
       * garrisons fully and checks the target moves.
       */
      garrison: typeof Military !== 'undefined'
        ? Military.garrisonPressure(Game.getOwner(areaId), t) : 0,
      cap: ctx.caps[mi],
      current: pop > 0 ? (c.mov[movementName] || 0) / pop : 0,
    }, t, true);   // collect: this IS the explanation
    rc.current = pop > 0 ? (c.mov[movementName] || 0) / pop : 0;
    rc.area = areaId;
    rc.movement = movementName;
    return rc;
  }

  /**
   * PRESSURE CLOCK: turns until this Area crosses the secession threshold, at
   * the rate it is currently moving.
   *
   * "Salt Lake corridor: breakaway in ~3 turns at current trend" is a different
   * kind of statement from "Salt Lake is 38% organised", and it is the one that
   * lets a player act BEFORE rather than read about it after. It turns the
   * explanation layer from retrospective to predictive, which the plan asks for
   * in as many words.
   *
   * Honest about its own limits: it reports the gap to the target as well as the
   * ETA, because a movement whose target sits below the threshold is not slowly
   * approaching it — it is never getting there, and "12 turns" would be a lie
   * about a trend that flattens. `null` means exactly that.
   *
   * @returns {{turns, target, current, threshold, arriving}} or null
   */
  function clock(areaId, movementName, tune) {
    const t = tune || window.TUNE;
    const why = explain(areaId, movementName, t);
    if (!why) return null;
    const threshold = t.get('secession.countyThreshold');
    const cur = why.current;
    const target = why.value;
    if (cur >= threshold) return { turns: 0, target, current: cur, threshold, arriving: true };
    // A target under the line is a plateau, not a slow climb.
    if (target < threshold) return { turns: null, target, current: cur, threshold, arriving: false };
    // This movement's own rate, not the world's (M8.2): a corridor that turns
    // half again as fast arrives sooner, and a clock that reported otherwise
    // would be a second, wrong model of the same phase.
    const rise = t.get('sent.maxRise') * Movements.rateOf(movementName);
    // The approach is rate-limited AND eases as it nears the target, so the
    // honest estimate is the rate-limited one: it is a floor on the time, which
    // is the direction a warning should err in.
    const turns = Math.ceil((threshold - cur) / Math.max(1e-9, Math.min(rise, target - cur)));
    return { turns, target, current: cur, threshold, arriving: true };
  }

  /**
   * How close an Area is to leaving: the strongest movement's share of its
   * population, 0..1, against `secession.countyThreshold`.
   *
   * One definition, three readers — the pressure map, the AI's posture, and the
   * AI's release candidate. It lived only inside `MapModes` until M6.3, which
   * made it a rendering detail that the model then had to re-derive; two
   * definitions of "about to secede" is exactly the kind of pair that drifts
   * apart quietly and disagrees only in the cases that matter.
   */
  function pressure(areaId) {
    const c = Game.county[Game.areaIdOf(areaId)];
    if (!c) return 0;
    let pop = 0;
    for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
    if (pop <= 0) return 0;
    let worst = 0;
    for (const m in c.mov) { const s = c.mov[m] / pop; if (s > worst) worst = s; }
    return worst;
  }

  return { target, context, explain, clock, pressure, clamp01 };
})();
