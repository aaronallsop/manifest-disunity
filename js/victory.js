/*
 * How a game of Nation States ends.
 *
 * Until M6.4 it did not. There was no win condition, no lose condition, and
 * eighty turns of a game whose whole subject is whether a country holds together
 * ended the way the fortieth turn ended: with a map, and nothing said about it.
 *
 * THREE ARCHETYPES, ONE TABLE. The conditions are data, not code paths — each is
 * a row with an id, a label, and an `evaluate` returning the same shape every
 * other explained quantity in this codebase returns:
 *
 *   { met, progress, terms: [{label, value, target, met, key}], summary }
 *
 * so "how close am I" and "why did they win" are the same query at different
 * verbosities, and adding a fourth condition is adding a row. `progress` is the
 * WORST of its terms rather than their average, because a victory condition is
 * an AND: reporting 80% when one requirement sits at zero would be a lie about
 * the only number that matters.
 *
 * WHY INFLUENCE IS IN THE CAPSTONE. Reunification asks for three quarters of the
 * seats, half the people, half the economy — and floors under BOTH power stocks.
 * The Influence floor is the whole design: without it, the shortest path to
 * winning is conquering the continent, which is the strategy the rest of the
 * game spends its time punishing. With it, a conqueror can hold the ground and
 * still not be able to close, and has to spend the late game being tolerable.
 *
 * CONDITIONAL SEATS are the same idea again. A seat you do not own counts toward
 * your three quarters if the nation holding it governs as you do, your Influence
 * clears `win.seatInfluence`, AND it exceeds theirs by `win.seatInfluenceGap` —
 * so a beloved hegemon reunifies through nations it never invaded, and a feared
 * one has to take every capital by hand. That is the late-game kingmaker role
 * the review asks for, without inventing a vassal contract the save format has
 * nowhere to put.
 *
 * The gap is what makes it a relationship rather than a coincidence of politics;
 * without it Ohio counted twenty-eight seats on turn zero. WITH it, California
 * still opens with eight, and that is the rule working rather than leaking: it
 * is the largest economy on the continent, its Influence genuinely exceeds most
 * of the map's by the required margin, and half the country genuinely does
 * govern as it does. A big state starts closer to reunifying the Union than a
 * small one, which is the whole reason the difficulty tiers exist.
 */
const Victory = (function () {
  let capitals = null;   // stFips -> {city, county, fips, area}

  /**
   * Load the authored seats of government.
   *
   * Resolved through `Game.areaIdOf` at load, once, because several capital
   * counties are merged into a larger Area and a raw FIPS lookup would silently
   * miss — the M1.13 trap, which discarded 48.2% of authored references the
   * first time and would be just as quiet here.
   */
  function load(doc) {
    const rows = (doc && doc.capitals) || {};
    capitals = {};
    for (const [st, rec] of Object.entries(rows)) {
      const area = Game.areaIdOf(rec.fips);
      if (!Game.county[area]) continue;
      capitals[st] = { ...rec, area };
    }
    return Object.keys(capitals).length;
  }

  const loaded = () => !!capitals;
  const all = () => capitals || {};

  /* ------------------------------------------------------------------ */
  /* the seats                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Which seats of government count for this nation, and why.
   *
   * @returns {{held, own, aligned, total, rows}}
   */
  function seats(nid, tune) {
    const t = tune || window.TUNE;
    const me = Game.getNation(nid);
    const rows = [];
    if (!me || !capitals) return { held: 0, own: 0, aligned: 0, total: 0, rows };
    const need = t.get('win.seatInfluence');
    const gap = t.get('win.seatInfluenceGap');
    const influential = (me.influence || 0) >= need;
    const mine = me.gov && me.gov.rulingIdeology;
    for (const [st, rec] of Object.entries(capitals)) {
      const owner = Game.getOwner(rec.area);
      const own = owner === nid;
      const holder = owner && Game.getNation(owner);
      /*
       * SHARING AN IDEOLOGY IS NOT THE SAME AS FOLLOWING SOMEBODY.
       *
       * Same-ideology alone handed Ohio twenty-eight seats on turn zero, because
       * at the opening position most of the country governs as most of the rest
       * of it does; three quarters of the Union was more than half won before a
       * single move. The gap is what makes it a relationship rather than a
       * coincidence: the holder must be inside your shadow, not merely next to
       * you in politics. At turn 0 every nation's Influence is much the same, so
       * nobody is anybody's junior; the mechanic arrives late, which is exactly
       * where a kingmaker belongs.
       */
      const aligned = !own && !!holder && influential
        && holder.gov && holder.gov.rulingIdeology === mine
        && (me.influence || 0) - (holder.influence || 0) >= gap;
      rows.push({ st, city: rec.city, area: rec.area, owner, own, aligned, counts: own || aligned });
    }
    const own = rows.filter((r) => r.own).length;
    const aligned = rows.filter((r) => r.aligned).length;
    return { held: own + aligned, own, aligned, total: rows.length, rows };
  }

  /* ------------------------------------------------------------------ */
  /* the world a condition is measured against                          */
  /* ------------------------------------------------------------------ */

  /**
   * One pass over the roster, shared by every condition and every nation.
   *
   * Built once per `check` rather than per nation per condition: three
   * conditions across seventy nations is two hundred and ten evaluations, and
   * each of them wants the same four world totals.
   */
  function context(tune) {
    const t = tune || window.TUNE;
    let pop = 0, gdp = 0;
    const per = [];
    const rows = new Map();
    /*
     * THE MEDIAN IS TAKEN OVER REAL NATIONS, not over every fragment on the map.
     *
     * A played-out world is mostly small pieces — 107 nations at turn 80 in the
     * run this was calibrated against — and a median dragged down by a hundred
     * two-Area rumps makes "richer than the median nation" mean nothing. Worse,
     * it produced a leader board headed by Nevada at 153x the median, which is
     * one county with an airport and nobody living in it.
     */
    const floor = t.get('nation.minAreas');
    for (const [nid] of Game.nations) {
      const d = Game.nationDemographics(nid);
      rows.set(nid, d);
      pop += d.pop;
      gdp += d.gdp;
      const n = Game.getNation(nid);
      if (d.pop > 0 && n && n.counties.size >= floor) per.push(d.gdp / d.pop);
    }
    per.sort((a, b) => a - b);
    const median = per.length ? per[Math.floor(per.length / 2)] : 0;
    /*
     * Which ideology each Area actually holds, for the sway term.
     *
     * `Game.dominantOf` takes a COLLECTION of Area ids, not one — passing the
     * string iterated its characters and returned nothing that matched any
     * nation's government, so Ideological Dominance read 0.000 for all 107
     * nations and could not be won at all.
     */
    const byIdeology = new Array(Ideology.count()).fill(0);
    let areas = 0;
    const one = [null];
    for (const f in Game.county) {
      one[0] = f;
      const dom = Game.dominantOf(one);
      if (dom >= 0) { byIdeology[dom]++; areas++; }
    }
    return { pop, gdp, median, rows, byIdeology, areas };
  }

  /* ------------------------------------------------------------------ */
  /* the conditions                                                     */
  /* ------------------------------------------------------------------ */

  /** One requirement, in the shape every reader wants. */
  const need = (label, value, target, key) => ({
    label, value, target, key, met: value >= target,
    progress: target > 0 ? Math.min(1, value / target) : 1,
  });

  const CONDITIONS = [
    {
      id: 'reunification',
      label: 'Reunification of the Union',
      blurb: 'Hold the seats of government, the people and the economy — and be tolerated while you do it.',
      evaluate(nid, ctx, t) {
        const n = Game.getNation(nid);
        const d = ctx.rows.get(nid);
        const s = seats(nid, t);
        return [
          need('Seats of government', s.total ? s.held / s.total : 0, t.get('win.reuniteSeats'), 'win.reuniteSeats'),
          need('Share of the people', ctx.pop > 0 ? d.pop / ctx.pop : 0, t.get('win.reunitePop'), 'win.reunitePop'),
          need('Share of the economy', ctx.gdp > 0 ? d.gdp / ctx.gdp : 0, t.get('win.reuniteGdp'), 'win.reuniteGdp'),
          need('Authority', n.authority || 0, t.get('win.reuniteAuthority'), 'win.reuniteAuthority'),
          need('Influence', n.influence || 0, t.get('win.reuniteInfluence'), 'win.reuniteInfluence'),
        ];
      },
    },
    {
      id: 'ideology',
      label: 'Ideological Dominance',
      blurb: 'Govern well, be heard abroad, and watch the continent come round to your way of thinking.',
      evaluate(nid, ctx, t) {
        const n = Game.getNation(nid);
        const mine = Ideology.index(n.gov && n.gov.rulingIdeology);
        const sway = ctx.areas > 0 && mine >= 0 ? ctx.byIdeology[mine] / ctx.areas : 0;
        return [
          need('Areas holding your ideology', sway, t.get('win.ideoSway'), 'win.ideoSway'),
          need('Authority', n.authority || 0, t.get('win.ideoAuthority'), 'win.ideoAuthority'),
          need('Influence', n.influence || 0, t.get('win.ideoInfluence'), 'win.ideoInfluence'),
        ];
      },
    },
    {
      id: 'economy',
      label: 'Economic Supremacy',
      blurb: 'Be the economy the continent runs on, and be rich per head as well as in total.',
      evaluate(nid, ctx, t) {
        const d = ctx.rows.get(nid);
        const perCapita = d.pop > 0 ? d.gdp / d.pop : 0;
        return [
          need('Share of the economy', ctx.gdp > 0 ? d.gdp / ctx.gdp : 0, t.get('win.econGdpShare'), 'win.econGdpShare'),
          need('GDP per head, against the median nation',
            ctx.median > 0 ? perCapita / ctx.median : 0, t.get('win.econPerCapita'), 'win.econPerCapita'),
          need('Quality of life', Game.getNation(nid).qol || 0, t.get('win.econQol'), 'win.econQol'),
        ];
      },
    },
  ];

  /**
   * How close one nation is to each condition.
   *
   * `progress` is the WORST term, not the mean: a victory condition is an AND,
   * and reporting 80% while one requirement sits at zero would be a lie about
   * the only number that matters.
   */
  function progress(nid, tune, ctx) {
    const t = tune || window.TUNE;
    if (!Game.getNation(nid)) return [];
    const c = ctx || context(t);
    return CONDITIONS.map((cond) => {
      const terms = cond.evaluate(nid, c, t);
      const met = terms.every((x) => x.met);
      const worst = terms.reduce((a, x) => Math.min(a, x.progress), 1);
      const missing = terms.filter((x) => !x.met)
        .sort((a, b) => a.progress - b.progress);
      return {
        id: cond.id, label: cond.label, blurb: cond.blurb, terms, met, progress: worst,
        summary: met ? `${cond.label}: achieved.`
          : `${cond.label}: ${missing.length} of ${terms.length} short — `
            + missing.slice(0, 2).map((x) => x.label.toLowerCase()).join(' and ') + '.',
      };
    });
  }

  /**
   * Has anybody won?
   *
   * Run once per world turn, over every nation, because a game whose victory
   * check only looks at the human is a game the AI cannot win — and an AI that
   * cannot win is not an opponent, it is scenery.
   *
   * Ties break on the widest margin over the requirement rather than on roster
   * order, so two nations crossing the same line on the same turn resolve the
   * same way twice.
   *
   * @returns {{winner, condition, label, terms, turn}|null}
   */
  function check(tune) {
    const t = tune || window.TUNE;
    if (World.getTurn() < t.get('win.graceTurns')) return null;
    const ctx = context(t);
    let best = null;
    for (const [nid] of Game.nations) {
      for (const row of progress(nid, t, ctx)) {
        if (!row.met) continue;
        const margin = row.terms.reduce((a, x) => a + (x.value - x.target), 0);
        if (!best || margin > best.margin) {
          best = { winner: nid, condition: row.id, label: row.label, terms: row.terms, margin };
        }
      }
    }
    if (!best) return null;
    return { ...best, turn: World.getTurn(), name: Game.getNation(best.winner).name };
  }

  /**
   * The leaderboard of who is closest, for the panel and the end screen.
   * Sorted by best progress across any condition.
   */
  function standings(tune, limit) {
    const t = tune || window.TUNE;
    const ctx = context(t);
    const rows = [];
    for (const [nid] of Game.nations) {
      const conds = progress(nid, t, ctx);
      const top = conds.reduce((a, c) => (c.progress > a.progress ? c : a), conds[0]);
      if (top) rows.push({ nid, name: Game.getNation(nid).name, best: top, conditions: conds });
    }
    rows.sort((a, b) => b.best.progress - a.best.progress);
    return limit ? rows.slice(0, limit) : rows;
  }

  return { load, loaded, all, seats, progress, check, standings, context, CONDITIONS };
})();
