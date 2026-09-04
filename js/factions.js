/*
 * Who you can play, and how hard it will be.
 *
 * TWO JOBS, ONE NUMBER. The tier is honest onboarding — "Vermont is going to be
 * difficult and here is why" is worth more than a list of fifty-one names — and
 * it is the balancing lever the review asks for: a weaker start gets a small
 * opening bonus, so the range stays playable *without changing the map*, which
 * is the one thing that must stay the same for every faction. Everybody plays
 * the same continent.
 *
 * IT IS DERIVED, NOT AUTHORED. Difficulty is computed from the opening position
 * with the same functions the game itself uses — the Area count, the economy,
 * `demographics().cohesion`, and `AI.strain`, which is the peak secession
 * pressure the pressure map already paints. An authored tier list is a second
 * opinion about the world that starts drifting from the world the moment
 * anything is tuned, and it drifts silently, because nobody re-plays fifty-one
 * openings after moving a slider.
 *
 * Every nation is playable. Restricting the list to a curated two dozen would be
 * an arbitrary line through a map whose whole premise is that every state is a
 * country now; the tier is what does the steering instead.
 *
 * The rating is a Why record like everything else here, so the start screen can
 * say WHY Rhode Island is brutal rather than just asserting it.
 */
const Factions = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));

  /*
   * The bands, and they are PROPORTIONS OF THE FIELD rather than fixed score
   * thresholds.
   *
   * Difficulty here is relative — the question a new player is asking is "which
   * of these is the gentle one", not "what is Ohio's absolute score" — and a
   * fixed threshold answers the second question badly: the first cut of this
   * put twenty of fifty-one nations in one band and exactly one in another,
   * which tells a player nothing. Shaped rather than quartered, because a
   * quarter of the map being Brutal overstates it: the top fifth are
   * comfortable, the bottom seventh are not.
   *
   * Four bands, because three cannot separate "a hard start" from "a start that
   * is the point of the game", and five is more names than anyone reads on a
   * menu.
   */
  const TIERS = [
    { id: 'comfortable', label: 'Comfortable', share: 0.20, blurb: 'Room, money and time to learn the board.' },
    { id: 'testing', label: 'Testing', share: 0.35, blurb: 'A real country with real problems.' },
    { id: 'punishing', label: 'Punishing', share: 0.30, blurb: 'Small, split, or sitting on a movement. Expect to lose ground before you gain any.' },
    { id: 'brutal', label: 'Brutal', share: 0.15, blurb: 'You begin the game losing. Everything has to go right.' },
  ];

  /** @param place 0 (the strongest opening on the map) to 1 (the weakest). */
  function tierOf(place) {
    let acc = 0;
    for (const t of TIERS) {
      acc += t.share;
      if (place < acc) return t;
    }
    return TIERS[TIERS.length - 1];
  }

  /** One rating term, in the shape every explained quantity here uses. */
  const term = (label, value, weight, note) => ({ label, value: clamp01(value), weight, note });

  /**
   * How hard this nation is to play from the opening position, 0 (brutal) to 1.
   *
   * Measured against the CONTINENT rather than against absolute numbers, so the
   * bands mean the same thing whatever the tunables say about population growth
   * or the size of the economy.
   */
  function rate(nid, tune, ctx) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n) return null;
    const c = ctx || context();
    const d = Game.nationDemographics(nid);

    /*
     * RANK, not ratio.
     *
     * Population and GDP across the fifty-one states are heavy-tailed: measured
     * against California, Nebraska scores 0.048 and Vermont 0.010, so a ratio to
     * the maximum puts forty-five of fifty-one nations in the bottom fifth of
     * the scale and the tiers collapse into one band. A percentile answers the
     * question the player is actually asking — how do I compare to everyone else
     * on this map — and it spreads them evenly by construction.
     */
    const terms = [
      term('Size', c.rankAreas.get(nid) || 0, t.get('start.wSize'),
        `${n.counties.size} ${n.counties.size === 1 ? 'Area' : 'Areas'}`),
      term('Economy', c.rankGdp.get(nid) || 0, t.get('start.wEconomy'),
        `${Math.round(d.gdp / 1e9)}bn`),
      // Cohesion is already 1 when everyone agrees and falls as a population
      // splits, which is exactly "how governable is this place".
      term('Agreement', d.cohesion, t.get('start.wCohesion'),
        `${Math.round(d.cohesion * 100)}% aligned with itself`),
      /*
       * Calm is the one that separates two nations of the same size: Utah and
       * Missouri open with similar numbers, and one of them has Deseret in it.
       */
      term('Calm', 1 - AI.strain(nid, t), t.get('start.wCalm'),
        `${Math.round(AI.strain(nid, t) * 100)}% of the way to a breakaway`),
      // Somewhere to go. A nation ringed by larger neighbours has no first move.
      term('Room to grow', c.smallerShare.get(nid) || 0, t.get('start.wRoom'),
        `${Math.round((c.smallerShare.get(nid) || 0) * 100)}% of its neighbours are smaller`),
    ];

    let total = 0, weight = 0;
    for (const x of terms) { total += x.value * x.weight; weight += x.weight; }
    const score = weight > 0 ? total / weight : 0;
    const place = c.place ? (c.place.get(nid) == null ? 0.5 : c.place.get(nid)) : 0.5;
    const tier = tierOf(place);
    const sorted = terms.slice().sort((a, b) => a.value - b.value);
    const worst = sorted[0], best = sorted[sorted.length - 1];
    /*
     * NAME THE TERM, not the tier. Twenty cards all reading "opens with room and
     * no immediate crisis" is a list of fifty-one names with extra words; "New
     * Mexico's problem is economy — 147bn" and "Wisconsin's problem is calm —
     * 53% of the way to a breakaway" are two different games.
     */
    const summary = tier.id === 'comfortable' || tier.id === 'testing'
      ? `${n.name}'s strength is ${best.label.toLowerCase()} — ${best.note}.`
      : `${n.name}'s problem is ${worst.label.toLowerCase()} — ${worst.note}.`;
    return {
      nid, name: n.name, color: n.color, score, place, tier: tier.id, label: tier.label,
      blurb: tier.blurb, terms, worst, best,
      bonus: openingBonus(score, t),
      summary,
    };
  }

  /**
   * The opening grant a weaker start gets.
   *
   * MONEY, not territory and not a rule change. Territory would change the map,
   * and every faction has to play the same continent or the difficulty rating is
   * describing a world nobody else is in. Money buys time — an early annexation,
   * a handover you could not otherwise afford — which is exactly what a hard
   * opening is short of.
   */
  function openingBonus(score, tune) {
    const t = tune || window.TUNE;
    return Math.round((1 - clamp01(score)) * t.get('start.bonusAtZero'));
  }

  /** Where each nation sits in the pack, 0 (last) to 1 (first). */
  function percentile(values) {
    const rows = [...values.entries()].sort((a, b) => a[1] - b[1]);
    const out = new Map();
    const n = rows.length;
    rows.forEach(([nid], i) => out.set(nid, n > 1 ? i / (n - 1) : 0.5));
    return out;
  }

  /** The continent-wide comparison every rating is measured against. */
  function context() {
    const sizes = new Map(), gdps = new Map();
    for (const [nid] of Game.nations) {
      sizes.set(nid, Game.getNation(nid).counties.size);
      gdps.set(nid, Game.nationDemographics(nid).gdp);
    }
    const smallerShare = new Map();
    for (const [nid] of Game.nations) {
      const nb = Game.adjacentNations(nid);
      if (!nb.length) { smallerShare.set(nid, 0.5); continue; } // an island has no land neighbours
      let smaller = 0;
      for (const o of nb) if ((sizes.get(o) || 0) < sizes.get(nid)) smaller++;
      smallerShare.set(nid, smaller / nb.length);
    }
    return { sizes, gdps, smallerShare, rankAreas: percentile(sizes), rankGdp: percentile(gdps) };
  }

  /**
   * The context plus where every nation places in the field, which the tier
   * bands need and a single `rate` call cannot know on its own.
   *
   * Two passes: score everyone against the continent, then rank the scores.
   */
  function field(tune) {
    const ctx = context();
    const scores = new Map();
    for (const [nid] of Game.nations) {
      const r = rate(nid, tune, ctx);
      if (r) scores.set(nid, r.score);
    }
    const best = percentile(scores);           // 1 = the strongest opening
    ctx.place = new Map();
    for (const [nid, p] of best) ctx.place.set(nid, 1 - p);  // 0 = the strongest
    return ctx;
  }

  /** Every playable nation, rated, hardest last. */
  function list(tune) {
    const ctx = field(tune);
    const out = [];
    for (const [nid] of Game.nations) {
      const r = rate(nid, tune, ctx);
      if (r) out.push(r);
    }
    out.sort((a, b) => b.score - a.score);
    return out;
  }

  /**
   * Sit the human down and pay the opening grant.
   *
   * The grant is applied HERE and only here, once, at the start of a game —
   * `Game.setPlayer` is called again on every load, and a bonus that reapplied
   * on load would be a save-scumming exploit that pays out for reloading.
   */
  function choose(nid, tune) {
    if (!Game.setPlayer(nid)) return null;
    const r = rate(nid, tune, field(tune));
    if (r && r.bonus > 0) Game.getNation(nid).treasury += r.bonus;
    return r;
  }

  return { TIERS, rate, list, context, field, openingBonus, choose, tierOf };
})();
