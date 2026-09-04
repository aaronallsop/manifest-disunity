/*
 * Crises, as a table.
 *
 * A six-second toast and the turn-summary newspaper were the whole narrative
 * surface of this game. An event is the first thing in it that asks the player a
 * QUESTION — two or three options, each with a real cost, and no option that is
 * simply correct.
 *
 * IT INVENTS NO MECHANICS, and that is the constraint that keeps it a table
 * rather than a second design. Every trigger reads a fact some other system
 * already computes — quality of life, war weariness, coalition pressure, the
 * peak secession pressure the map already paints — and every effect moves a
 * number some other system already owns. So an event is a nudge and a story, and
 * `content/events.json` is content rather than code.
 *
 * WHY THE OPTIONS HAVE NO RIGHT ANSWER. The three answers to a restless region
 * (M6.5) are three prices for the same relief, and these are the same idea in
 * prose: buy grain and pay for it, ration it and pay in liberties, or do nothing
 * and pay in sentiment. An option that is strictly best is a button, and a
 * button is not a decision.
 *
 * THE AI ANSWERS TOO, from its own situation — it takes the option that most
 * helps whatever it is currently worst at. That is a deliberately simple policy:
 * an event is a place where the world speaks to the player, and giving the AI a
 * scoring apparatus of its own here would be a second opinion about a table that
 * is only twelve rows long.
 */
const Events = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));

  let table = [];
  /** nation id -> { [eventId]: turn it last fired, __any: turn anything fired } */
  let history = {};
  /** The player's pending question, if one is waiting. */
  let pending = null;

  function load(doc) {
    table = ((doc && doc.events) || []).filter((e) => e && e.id && Array.isArray(e.options) && e.options.length);
    return table.length;
  }

  const loaded = () => table.length > 0;
  const all = () => table;

  /* ------------------------------------------------------------------ */
  /* the facts a trigger may read                                       */
  /* ------------------------------------------------------------------ */

  /**
   * Everything `when` can test, and nothing else.
   *
   * A closed list on purpose: it is what makes an authored event checkable
   * (`build/validate.py` reads the same names) and what stops a crisis quietly
   * becoming the only consumer of some number nobody else looks at.
   */
  function facts(nid, tune) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n) return null;
    const flow = Game.treasuryFlow(nid);
    const mil = typeof Military !== 'undefined' ? Military.state(nid) : null;
    return {
      turn: World.getTurn(),
      minTurn: World.getTurn(),
      qol: n.qol == null ? 0.5 : n.qol,
      liberties: n.liberties == null ? 0.5 : n.liberties,
      authority: n.authority == null ? 0.5 : n.authority,
      influence: n.influence == null ? 0.5 : n.influence,
      weariness: n.weariness || 0,
      strain: typeof AI !== 'undefined' ? AI.strain(nid, t) : 0,
      coalition: typeof Coalitions !== 'undefined' ? Coalitions.pressure(nid, t) : 0,
      areas: n.counties.size,
      occupied: n.counties.size ? Game.occupiedCount(nid) / n.counties.size : 0,
      // Turns of upkeep the treasury covers — the same figure Authority reads.
      runway: flow && flow.maintenance > 0 ? n.treasury / flow.maintenance : 999,
      deployed: mil ? mil.alloc.field * mil.ready.field : 0,
      neighbourDied: diedNearby(nid, t),
    };
  }

  /** Did a nation next door cease to exist within living memory? */
  function diedNearby(nid, tune) {
    const t = tune || window.TUNE;
    const since = World.getTurn() - t.get('events.memoryTurns');
    for (const e of Ledger.ofKind('died')) {
      if (e.turn < since) continue;
      // The nation is gone, so adjacency cannot be asked; the ledger entry is
      // all there is, and any death nearby in time is close enough for a story.
      return true;
    }
    return false;
  }

  /** `{ qol: {below: 0.6}, minTurn: 5 }` — every clause must hold. */
  function matches(when, f) {
    for (const [key, test] of Object.entries(when || {})) {
      const v = f[key];
      if (v === undefined) return false;
      if (key === 'minTurn') { if (f.turn < test) return false; continue; }
      if (typeof test === 'boolean') { if (!!v !== test) return false; continue; }
      if (typeof test === 'number') { if (v < test) return false; continue; }
      if (test.below != null && !(v < test.below)) return false;
      if (test.above != null && !(v > test.above)) return false;
    }
    return true;
  }

  /** Every event that could fire for this nation right now. */
  function candidates(nid, tune) {
    const t = tune || window.TUNE;
    const f = facts(nid, t);
    if (!f) return [];
    const seen = history[nid] || {};
    const gap = t.get('events.repeatTurns');
    return table.filter((e) => {
      if (seen[e.id] != null && f.turn - seen[e.id] < gap) return false;
      return matches(e.when, f);
    });
  }

  /* ------------------------------------------------------------------ */
  /* effects                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * The closed vocabulary. Each one moves a number another system owns.
   *
   * Stocks are nudged rather than set, and the nudge is applied to the STOCK and
   * not to its target — the target recomputes from the world next turn and would
   * simply undo it. That is the same discipline `changeRulingIdeology` uses, and
   * for the same reason: an event is a shock, and the stock discipline is what
   * turns a shock back into a recovery over several turns.
   */
  const EFFECTS = {
    treasuryShare: (n, v, ctx) => { n.treasury += (ctx.flow ? ctx.flow.income : 0) * v; },
    authority: (n, v) => { n.authority = clamp01((n.authority == null ? 0.5 : n.authority) + v); },
    influence: (n, v) => { n.influence = clamp01((n.influence == null ? 0.5 : n.influence) + v); },
    qol: (n, v) => { n.qol = clamp01((n.qol == null ? 0.5 : n.qol) + v); },
    liberties: (n, v) => { n.liberties = clamp01((n.liberties == null ? 0.5 : n.liberties) + v); },
    weariness: (n, v) => { n.weariness = clamp01((n.weariness || 0) + v); },
    /*
     * Sentiment moves the MOVEMENTS already present in this nation's ground, by
     * a share of each Area's population, rather than conjuring a movement where
     * there was none. A crisis gives an existing argument more people; it does
     * not invent a separatist tradition.
     */
    sentiment: (n, v) => {
      for (const f of n.counties) {
        const c = Game.county[f];
        if (!c) continue;
        let pop = 0;
        for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
        if (pop <= 0) continue;
        for (const m in c.mov) {
          const idx = Movements.ideologyIndexOf(m);
          if (idx < 0) continue;
          const want = c.mov[m] + pop * v;
          c.mov[m] = Math.max(0, Math.min(c.pop[idx], want));
        }
      }
    },
    /** How the neighbours feel about you, in the M7.1 list. */
    standing: (n, v, ctx) => {
      const kind = v >= 0 ? 'granted' : 'warred';
      const scale = Math.abs(v) / Math.max(1e-9, Math.abs(ctx.tune.get(
        v >= 0 ? 'rel.magGranted' : 'rel.magWarred')));
      for (const other of Game.adjacentNations(n.id)) {
        Relations.record(other, n.id, kind, { scale, tune: ctx.tune });
      }
    },
  };

  function apply(nid, effects, tune) {
    const n = Game.getNation(nid);
    if (!n) return [];
    const t = tune || window.TUNE;
    const ctx = { tune: t, flow: Game.treasuryFlow(nid) };
    const done = [];
    Game.batch(() => {
      for (const [key, v] of Object.entries(effects || {})) {
        const fn = EFFECTS[key];
        if (!fn || !v) continue;
        fn(n, v, ctx);
        done.push({ key, value: v });
      }
      Game.touch({ values: true });
    });
    return done;
  }

  /* ------------------------------------------------------------------ */
  /* firing                                                             */
  /* ------------------------------------------------------------------ */

  function remember(nid, id, turn) {
    if (!history[nid]) history[nid] = {};
    history[nid][id] = turn;
    history[nid].__any = turn;
  }

  const readyFor = (nid, tune) => {
    const t = tune || window.TUNE;
    const last = (history[nid] || {}).__any;
    return last == null || World.getTurn() - last >= t.get('events.cooldownTurns');
  };

  /**
   * Draw one event for a nation, or null.
   *
   * Weighted, from the seeded rng, so a replay replays. Nothing is drawn while
   * the nation is inside its own cooldown — a country that has a crisis every
   * turn is not having crises, it is having weather.
   */
  function draw(nid, rng, tune) {
    const t = tune || window.TUNE;
    if (!readyFor(nid, t)) return null;
    const pool = candidates(nid, t);
    if (!pool.length) return null;
    let total = 0;
    for (const e of pool) total += Math.max(0, e.weight || 1);
    let roll = (rng ? rng.stream('events').random() : 0) * total;
    for (const e of pool) {
      roll -= Math.max(0, e.weight || 1);
      if (roll <= 0) return e;
    }
    return pool[pool.length - 1];
  }

  /**
   * How an AI answers: the option that most helps whatever it is worst at.
   *
   * Deliberately simple. An event is a place where the world speaks to the
   * player, and a scoring apparatus of its own here would be a second opinion
   * about a table twelve rows long. The weights are the nation's own shortfalls,
   * so a nation with no money takes the money and a hated one buys goodwill.
   */
  function choose(nid, event, tune) {
    const t = tune || window.TUNE;
    const f = facts(nid, t);
    if (!f) return event.options[0];
    const need = {
      authority: 1 - f.authority, influence: 1 - f.influence,
      qol: 1 - f.qol, liberties: 1 - f.liberties,
      weariness: f.weariness,
      treasuryShare: clamp01(1 - f.runway / Math.max(1, t.get('events.comfortableRunway'))),
      standing: clamp01(f.coalition),
      sentiment: clamp01(f.strain),
    };
    let best = event.options[0], bestScore = -Infinity;
    for (const o of event.options) {
      let score = 0;
      for (const [key, v] of Object.entries(o.effects || {})) {
        // Weariness and sentiment are BAD when they go up, so their need weight
        // is applied to the negation.
        const sign = (key === 'weariness' || key === 'sentiment') ? -1 : 1;
        score += sign * v * (need[key] == null ? 0.5 : need[key]);
      }
      if (score > bestScore) { bestScore = score; best = o; }
    }
    return best;
  }

  /** Resolve a drawn event with a chosen option, and write it down. */
  function resolve(nid, event, option, tune) {
    const n = Game.getNation(nid);
    if (!n) return null;
    const t = tune || window.TUNE;
    const done = apply(nid, option.effects, t);
    remember(nid, event.id, World.getTurn());
    const entry = Ledger.append({
      phase: 'event', subject: nid, kind: 'crisis', delta: done.length,
      text: `${n.name}: ${event.title} — ${option.label}.`,
      terms: done.map((d) => ({ name: d.key, value: d.value, key: null })),
      event: event.id, option: option.label,
    });
    return { nid, event, option, effects: done, entry };
  }

  /**
   * One pass over the roster: draw for everyone, answer for everyone but the
   * player, and leave the player's question waiting.
   *
   * The player's is left PENDING rather than auto-answered because the whole
   * point of an event is that somebody chooses. `pending` is read by the UI and
   * cleared by `answer`; a headless caller that never answers simply never gets
   * another one, which is the correct behaviour for a game nobody is playing.
   */
  function tick(tune, rng, opts = {}) {
    const t = tune || window.TUNE;
    if (!loaded()) return { fired: [], pending: null };
    const player = opts.player === undefined ? Game.getPlayer() : opts.player;
    const fired = [];
    let budget = t.get('events.maxPerTurn');
    for (const [nid] of Game.nations) {
      if (budget <= 0) break;
      const e = draw(nid, rng, t);
      if (!e) continue;
      budget--;
      if (nid === player && !opts.autoAnswer) {
        pending = { nid, event: e };
        remember(nid, e.id, World.getTurn());   // it fired; the answer is separate
        continue;
      }
      fired.push(resolve(nid, e, choose(nid, e, t), t));
    }
    return { fired, pending };
  }

  /** The player's answer. */
  function answer(label, tune) {
    if (!pending) return null;
    const { nid, event } = pending;
    const option = event.options.find((o) => o.label === label) || event.options[0];
    pending = null;
    return resolve(nid, event, option, tune);
  }

  const waiting = () => pending;
  function reset() { history = {}; pending = null; }

  const serialize = () => ({ history: JSON.parse(JSON.stringify(history)), pending: pending
    ? { nid: pending.nid, id: pending.event.id } : null });
  function loadState(snap) {
    history = (snap && snap.history) ? JSON.parse(JSON.stringify(snap.history)) : {};
    pending = null;
    if (snap && snap.pending) {
      const e = table.find((x) => x.id === snap.pending.id);
      if (e && Game.getNation(snap.pending.nid)) pending = { nid: snap.pending.nid, event: e };
    }
  }

  return {
    load, loaded, all, facts, matches, candidates, draw, choose, resolve, apply,
    tick, answer, waiting, reset, serialize, loadState, EFFECTS,
  };
})();
