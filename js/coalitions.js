/*
 * Who the continent is ganging up on, and why.
 *
 *   threat(n) = size_share(n) × (1 − influence(n))
 *
 * A beloved unifier is left alone and a feared conqueror gets ganged up on, and
 * that one line is the whole design: **being big is not the crime**. A nation
 * can hold half the map and go untouched if the other half is glad it is there,
 * and a nation can be middling and surrounded because of how it got there.
 * Influence is the stock the rest of the game already spends on being tolerable,
 * and this is what finally makes spending it worth something.
 *
 * WHAT IT REPLACES. `blueShell` ranked nations by size and handed the top tenth
 * a penalty, and finding 36 measured what that was worth: with the shell fully
 * applied California still took 692 Areas on turn 1 and 1,602 of 1,676 by turn
 * 3, with zero civil wars. Two problems, and the fix is the same for both.
 *
 * It was a MULTIPLIER ON A ROLL THAT RARELY HAPPENS. The finding's own
 * recommendation is the shape used here — "make the penalty something the leader
 * feels every turn — occupation cost, coalition formation, sentiment penalties —
 * rather than a multiplier on a roll". So a coalition costs its target money
 * every turn, standing every turn, and puts its members' border armies in the
 * way of the next annexation whether or not they are the ones being annexed.
 *
 * And it was AUTOMATIC. A tier by rank is a rule about a leaderboard; a coalition
 * is a set of NAMED nations that each have a reason, read off the relations list
 * M7.1 built. That is what makes it answerable — "Idaho, Nevada and Oregon, and
 * here is what you did to them" — and what makes it escapable: mend the relation
 * or lower the threat and the coalition dissolves, which a rank never does.
 */
const Coalitions = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));

  /*
   * A PER-TURN SNAPSHOT, and that is a design statement rather than a cache.
   *
   * A coalition is a diplomatic fact, not a number that flickers: it should not
   * form and dissolve twice inside one turn because somebody signed a trade deal
   * in the middle of it. So the survey is taken once per world turn and once per
   * ownership change — `Game.ownerEpoch()`, which moves on every ownership write
   * whatever the batch depth, where `Game.epoch()` is the render clock and is
   * frozen inside one — and a mid-turn change in GDP or standing is felt on the
   * next turn.
   *
   * It is also what makes it affordable: `pressure` is read on every annexation
   * preview the AI scores, and the survey walks the whole roster.
   *
   * `reset()` forces a rebuild, for tests and for the map editor.
   */
  let cache = null, cacheEpoch = -1, cacheTurn = -1;

  /** Share of the continent by the same blended weight sentiment's `power` uses. */
  function weights() {
    const rows = new Map();
    let total = 0;
    for (const [nid] of Game.nations) {
      const w = Game.nationWeight(nid);
      rows.set(nid, w);
      total += w;
    }
    return { rows, total };
  }

  /** Everything, in one pass, for every nation. */
  function survey(tune) {
    const t = tune || window.TUNE;
    const epoch = Game.ownerEpoch();
    const turn = World.getTurn();
    if (cache && cacheEpoch === epoch && cacheTurn === turn) return cache;

    const { rows, total } = weights();
    const trigger = t.get('coalition.trigger');
    const joinAt = t.get('coalition.joinRelation');
    const out = new Map();

    /*
     * WHO IS ABOUT TO WIN (M11.3), read once for the whole survey.
     *
     * `Victory.standings` walks every nation and every condition, so it is not a
     * thing to do inside the loop below.
     */
    const bar = t.get('ai.denyBar');
    const wVictory = t.get('coalition.wVictory');
    const closing = new Map();
    /*
     * NOT BEFORE ANYBODY CAN WIN. `Victory.check` refuses to return a winner
     * before `win.graceTurns` and `Victory.alarms` refuses to report one, so a
     * coalition formed against somebody "about to win" on turn 0 is a coalition
     * against a race that has not started.
     *
     * It also keeps the older claim honest. "Being big is not the crime" is the
     * design in one sentence, and on the opening board size and victory
     * proximity are the same number — the largest economy IS the nation closest
     * to Economic Supremacy, by construction and without having done anything.
     * The grace period is where those two come apart: after it, a nation is
     * close because of what it did.
     */
    const grace = World.getTurn() < t.get('win.graceTurns');
    if (!grace && wVictory > 0 && typeof Victory !== 'undefined' && Victory.loaded()) {
      for (const row of Victory.standings(t)) {
        if (row.best && row.best.progress >= bar) closing.set(row.nid, row.best);
      }
    }

    for (const [nid] of Game.nations) {
      const n = Game.getNation(nid);
      const share = total > 0 ? rows.get(nid) / total : 0;
      const influence = n.influence == null ? 0.5 : n.influence;
      /*
       * THREAT IS SIZE-AND-DISLIKE **PLUS BEING ABOUT TO WIN** (M11.3).
       *
       * `share * (1 - influence)` alone is the whole anti-snowball machinery
       * pointed at exactly one strategy. Both non-conquest victories keep
       * Influence HIGH by construction — Reunification has an Influence floor,
       * Ideological Dominance requires it, Economic Supremacy comes with it —
       * so a nation quietly closing on either had its threat multiplied by
       * something near zero and no coalition ever formed against it. The audit:
       * "nothing in the game contests a rival who is quietly winning."
       *
       * The new term is deliberately NOT scaled by (1 - influence). Being
       * liked is a defence against being feared for your size; it is not a
       * defence against being about to win, because the thing the rest of the
       * continent minds is the winning.
       */
      const near = closing.get(nid);
      const closeness = near ? Math.max(0, (near.progress - bar) / Math.max(1e-6, 1 - bar)) : 0;
      const threat = share * (1 - influence) + wVictory * closeness * share;
      const rec = {
        nid, share, influence, threat, members: [],
        closing: near ? { label: near.label, progress: near.progress } : null,
        pressure: 0, weight: 0,
        summary: '', formed: threat >= trigger,
      };
      if (rec.formed) {
        /*
         * WHO JOINS. Nations that resent it, plus its neighbours — because a
         * nation next to a threat is in the coalition whether it has a grievance
         * yet or not, which is what stops a conqueror being safe simply because
         * it has not got round to its neighbours.
         *
         * A member must be able to feel the threat at all: a two-Area rump on
         * the far coast is not a check on anybody, so membership is weighted by
         * size and the weightless are left out of the count.
         */
        const near = new Set(Game.adjacentNations(nid));
        for (const [other] of Game.nations) {
          if (other === nid) continue;
          const standing = Relations.score(other, nid, t);
          const isNear = near.has(other);
          if (standing > joinAt && !isNear) continue;
          const w = total > 0 ? rows.get(other) / total : 0;
          if (w < t.get('coalition.minMemberShare')) continue;
          /*
           * AND IT MUST BE A COUNTRY (M7.8). A coalition is coordination between
           * governments, and nobody coordinates with a state they do not admit
           * exists — a two-turn-old breakaway does not get to convene the
           * neighbours against the power it just left.
           */
          if (typeof Recognition !== 'undefined' && !Recognition.seated(other, t)) continue;
          rec.members.push({
            nid: other, name: Game.getNation(other).name, standing, near: isNear, weight: w,
            // A VERB, not a sentence. The model does not know whether it is
            // being rendered on your own card or a rival's, and a stored
            // "resents you" reads as nonsense on somebody else's.
            why: standing <= joinAt ? 'resents' : 'borders',
          });
          rec.weight += w;
        }
        rec.members.sort((a, b) => b.weight - a.weight);
        /*
         * PRESSURE is the coalition's share of the continent, not its head
         * count. Twenty rump states lining up against a superpower is a
         * sentence, not a constraint.
         */
        rec.pressure = clamp01(rec.weight / Math.max(1e-9, t.get('coalition.fullShare')));
      }
      rec.summary = summarise(rec);
      out.set(nid, rec);
    }

    cache = out; cacheEpoch = epoch; cacheTurn = turn;
    return out;
  }

  function summarise(rec) {
    if (!rec.formed) {
      return rec.share > 0.15
        ? (rec.closing
          ? `${Math.round(rec.closing.progress * 100)}% of the way to ${rec.closing.label} — and being liked is no defence against that.`
          : `Large, and tolerated: ${Math.round(rec.influence * 100)}% Influence keeps it from being a threat.`)
        : 'Not big enough to worry anybody.';
    }
    const top = rec.members.slice(0, 3).map((m) => m.name).join(', ');
    return `${rec.members.length} ${rec.members.length === 1 ? 'nation is' : 'nations are'} aligned against it`
      + (top ? ` — ${top}${rec.members.length > 3 ? ' and others' : ''}.` : '.');
  }

  /** The record for one nation, with its working. */
  const against = (nid, tune) => survey(tune).get(nid) || null;

  /**
   * How hard the continent is pressing on this nation, 0..1.
   *
   * The one number every existing anti-snowball caller reads — annexation cost,
   * the civil-war score multiplier, the union chance — so replacing the old
   * size-rank shell with this changed all three at once and added no plumbing.
   */
  function pressure(nid, tune) {
    const rec = against(nid, tune);
    return rec ? rec.pressure : 0;
  }

  /** Is this nation part of the coalition against that one? */
  function joined(member, target, tune) {
    const rec = against(target, tune);
    return !!(rec && rec.formed && rec.members.some((m) => m.nid === member));
  }

  /** Every nation currently facing a coalition, worst first. */
  function all(tune) {
    const rows = [];
    for (const rec of survey(tune).values()) if (rec.formed) rows.push(rec);
    rows.sort((a, b) => b.pressure - a.pressure);
    return rows;
  }

  function reset() { cache = null; cacheEpoch = -1; cacheTurn = -1; }

  return { survey, against, pressure, joined, all, reset };
})();
