/*
 * A nation can lose its own government.
 *
 * WHAT THIS FIXES. `changeRulingIdeology` — the appeasement valve — let a
 * government pick an ideology and then keep it forever: `refreshGovernments`
 * tracked the popular plurality every turn, but only for a nation that had never
 * deliberately chosen, and "it chose; it keeps its choice" locked everybody else
 * in for the rest of the game. So the player could change hats to defuse a
 * secession and never answer for it, and an ideology was a costume rather than a
 * position. This is the answer the plan asks for: put it to a vote.
 *
 * THE VOTE IS THE POPULATION, ADJUSTED BY THE RECORD. Every ideology's base is
 * the share of the nation's people who hold it — the number the map already
 * carries — and the government in office gets one swing against it, made of the
 * four things it is answerable for: Quality of Life, Authority, Civil Liberties
 * and War weariness. A government that delivered survives a hostile electorate;
 * a government that presided over a decade of war and hardship loses one that
 * agrees with it.
 *
 * ELECTIONS ARE STAGGERED AND THE SCHEDULE IS NOT STORED. `(turn + hash(id)) %
 * term` — pure, so nothing has to be saved, migrated or reset, and fifty-one
 * elections do not land on the same turn and produce a newspaper nobody reads.
 *
 * AND THEY CAN BE STOLEN. A government whose Civil Liberties have already fallen
 * below `election.stealBelow` is, by definition, a state that can refuse a
 * result — so it may, and the price is a further shock to the liberties that let
 * it. That is the loop the whole game is built on running in its tightest form:
 * suppression buys you this term and buys the grievance that takes the next one.
 * The rule is the same for the player, except that the player is ASKED. Their
 * government concedes by default and they may refuse the result within the same
 * turn, which is the one moment in the game where the honest answer and the
 * available answer are different and the choice is genuinely theirs.
 */
const Elections = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));
  const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

  /* A stable per-nation offset, so the terms are staggered across the roster. */
  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < String(s).length; i++) {
      h ^= String(s).charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }

  const termOf = (t) => Math.max(1, Math.round((t || window.TUNE).get('election.termTurns')));

  /**
   * Turns until this nation next goes to the polls. 0 means today.
   *
   * Turn 0 is never a polling day — a world one quarter old has no record to run
   * on — and the countdown says so rather than reading "today" beside a vote
   * that will not happen.
   */
  function nextFor(nid, tune) {
    const term = termOf(tune);
    if (World.getTurn() <= 0) return term;
    const phase = (World.getTurn() + (hash(nid) % term)) % term;
    return phase === 0 ? 0 : term - phase;
  }
  const due = (nid, tune) => nextFor(nid, tune) === 0;

  /* ------------------------------------------------------------------ */
  /* the vote                                                            */
  /* ------------------------------------------------------------------ */

  /*
   * WHAT COUNTS AS A GOOD RECORD IS WHAT EVERYBODY ELSE IS MANAGING.
   *
   * Centred on the WORLD MEAN rather than on 0.5, and that is the difference
   * between a system that works and one that does not. The stocks do not sit
   * around the middle of their range — a settled board runs Quality of Life in
   * the eighties — so a term centred on 0.5 hands every incumbent on the map the
   * same large bonus, which is not a record, it is a thumb on the scale for
   * whoever happens to be in office. Measured with that mistake in place: 284
   * elections over 84 turns turned out three governments, and a government
   * holding 39% of its people against a rival holding 58% was re-elected.
   *
   * Against the mean it is a comparison, which is how an electorate actually
   * judges: nobody re-elects a government for an 0.80 when every neighbour is
   * managing 0.90.
   */
  let meanCache = null, meanEpoch = -1, meanTurn = -1;

  function means() {
    const epoch = Game.ownerEpoch();
    const turn = World.getTurn();
    if (meanCache && meanEpoch === epoch && meanTurn === turn) return meanCache;
    let qol = 0, lib = 0, auth = 0, weary = 0, n = 0;
    for (const [, rec] of Game.nations) {
      qol += rec.qol == null ? 0.5 : rec.qol;
      lib += rec.liberties == null ? 0.5 : rec.liberties;
      auth += rec.authority == null ? 0.5 : rec.authority;
      weary += rec.weariness == null ? 0 : rec.weariness;
      n++;
    }
    meanCache = n ? { qol: qol / n, liberties: lib / n, authority: auth / n, weariness: weary / n }
      : { qol: 0.5, liberties: 0.5, authority: 0.5, weariness: 0 };
    meanEpoch = epoch; meanTurn = turn;
    return meanCache;
  }

  /**
   * The result, with its working: one row per ideology, and the incumbent's
   * swing named term by term.
   *
   * PURE. It seats nobody, changes nothing and may be called by a panel on every
   * render — the M7.5 lesson about a Why record with a side effect cost an
   * afternoon, and this one is read by the UI far more often than it is acted on.
   */
  function poll(nid, tune) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n) return null;
    const d = Game.nationDemographics(nid);
    if (!d || d.pop <= 0) return null;
    const ruling = Ideology.index(n.gov.rulingIdeology);

    /*
     * THE INCUMBENT'S SWING. Signed, and multiplicative on their own base rather
     * than additive across everybody: a government with a good record does not
     * take votes from one named rival, it holds people who would otherwise have
     * drifted. Everything is renormalised afterwards, so the swing moves a share
     * without inventing a voter.
     */
    const qol = n.qol == null ? 0.5 : n.qol;
    const lib = n.liberties == null ? 0.5 : n.liberties;
    const auth = n.authority == null ? 0.5 : n.authority;
    const weary = n.weariness == null ? 0 : n.weariness;
    const leader = typeof Leaders !== 'undefined' && Leaders.loaded()
      ? Leaders.modifier(nid, 'influence') : 0;
    const avg = means();
    const spread = Math.max(1e-6, t.get('election.spread'));
    const vs = (x, mean) => clamp((x - mean) / spread, -1, 1);
    const terms = [
      { label: 'Record in office', raw: qol, norm: vs(qol, avg.qol),
        key: 'election.wRecord', note: 'how well the country lives, against everybody else' },
      { label: 'Order', raw: auth, norm: vs(auth, avg.authority),
        key: 'election.wOrder', note: 'a government that can govern is worth keeping' },
      { label: 'Liberties', raw: lib, norm: vs(lib, avg.liberties),
        key: 'election.wLiberties', note: 'and one that leans on people is not' },
      { label: 'War weariness', raw: weary, norm: -vs(weary, avg.weariness),
        key: 'election.wWeariness', note: 'the bill for a decade of fighting' },
      /*
       * WHO IS IN CHARGE. There is no `election` trait key in the content and
       * there does not need to be: the leaders who campaign well are the ones
       * who carry Influence — the Orator, the Populist, the Idealist — and
       * borrowing that modifier keeps one number describing one person rather
       * than adding a second that could disagree with it.
       */
      { label: 'Leadership', raw: leader, norm: clamp(leader, -1, 1),
        key: 'election.wLeader',
        note: typeof Leaders !== 'undefined' && Leaders.loaded() && Leaders.all()[nid]
          ? `${Leaders.all()[nid].title} ${Leaders.all()[nid].name} on the stump` : 'whoever is in charge' },
    ];
    let swing = 0;
    for (const term of terms) {
      term.weight = t.get(term.key);
      term.contribution = term.weight * term.norm;
      swing += term.contribution;
    }

    const rows = [];
    let total = 0;
    for (let i = 0; i < Ideology.count(); i++) {
      const base = d.mix[i] / d.pop;
      const value = i === ruling ? Math.max(0, base * (1 + swing)) : base;
      rows.push({ i, id: Ideology.idAt(i), name: Ideology.nameAt(i), base, value, incumbent: i === ruling });
      total += value;
    }
    for (const r of rows) r.share = total > 0 ? r.value / total : 0;
    const ranked = rows.slice().sort((a, b) => b.share - a.share);
    const winner = ranked[0];
    const held = rows[ruling] || null;
    terms.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

    return {
      nid, rows, ranked, winner, incumbent: held, swing, terms,
      change: !!(held && winner && winner.i !== held.i),
      margin: ranked.length > 1 ? ranked[0].share - ranked[1].share : ranked[0].share,
      summary: summarise(winner, held, swing, terms),
    };
  }

  function summarise(winner, held, swing, terms) {
    if (!held) return `${winner.name} would take a country nobody governs.`;
    const top = terms[0];
    const blame = top ? `${top.label.toLowerCase()} ${top.contribution < 0 ? 'against them' : 'for them'}` : '';
    if (winner.i === held.i) {
      return `${held.name} holds on with ${Math.round(held.share * 100)}% — ${blame}.`;
    }
    return `${winner.name} takes it with ${Math.round(winner.share * 100)}%, `
      + `${held.name} out on ${Math.round(held.share * 100)}% — ${blame}.`;
  }

  /* ------------------------------------------------------------------ */
  /* the result                                                          */
  /* ------------------------------------------------------------------ */

  /*
   * IS THE WINDOW STILL OPEN — and against which clock (M9.2).
   *
   * `hold` stamps `gov.lostAt` with `asOf`, which is turn N+1 when the world is
   * resolving turn N: the count happens inside the batch and the decision
   * belongs to whoever is looking at the board afterwards. Everything that asks
   * "can this still be refused" therefore has to ask against the SAME clock,
   * and there are two kinds of caller with two different answers to what the
   * clock reads:
   *
   *   - inside the batch (`World.advanceTurn` -> `tick` -> `steal`),
   *     `World.getTurn()` is still N while the stamp says N+1;
   *   - after it (the player's modal, a save reopening), `World.getTurn()` has
   *     moved to N+1 and matches the stamp.
   *
   * Until M9.2 only the second kind passed. `steal` and `pending` both compared
   * against `World.getTurn()` unconditionally, so the AI's immediate refusal
   * always returned "There is no result to refuse" and every police state in
   * the world politely conceded — the documented behaviour was dead code on the
   * live path. The test that covered it passed because it called `tick` without
   * `asOf`, which is the one way the two clocks agree.
   *
   * So: callers inside a batch pass the `asOf` they are resolving under, and
   * everyone else gets `World.getTurn()`. One helper, so there is one answer.
   */
  const isOpen = (n, asOf) => n.gov.lostAt === (asOf == null ? World.getTurn() : asOf);

  /** May this government refuse a result it has just lost? */
  function canSteal(nid, tune) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n) return false;
    return (n.liberties == null ? 0.5 : n.liberties) < t.get('election.stealBelow');
  }

  /**
   * Hold one. Always resolves HONESTLY — the government that lost, loses.
   *
   * Stealing is a separate call, so that there is one implementation of it and
   * two callers: `tick` for a nation the machine is playing, and the player's
   * own decision for theirs. A model path that quietly did it for the AI and a
   * UI path that did it for the human would be two rules, and they would drift.
   */
  function hold(nid, tune, rng, opts = {}) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n) return null;
    const res = poll(nid, t);
    if (!res) return null;
    const turn = World.getTurn();
    /*
     * A government elected while turn N is being resolved GOVERNS TURN N+1, and
     * `gov.since` has to say so — `refreshGovernments` already takes the same
     * argument for the same reason. Dating it to N would make a brand-new
     * government a turn old on the day it took office, which Authority reads as
     * tenure.
     */
    const asOf = opts.asOf == null ? turn : opts.asOf;
    const was = n.gov.rulingIdeology;
    let changed = false;

    if (res.change) {
      const out = Game.changeRulingIdeology(nid, res.winner.id,
        { force: true, free: true, rng, reason: 'election', asOf });
      changed = !!out.ok;
      if (changed) {
        /*
         * The window in which the result can still be refused. Stamped with
         * `asOf` and not with the turn being resolved, for the same reason
         * `gov.since` is: the count happens while turn N is being resolved and
         * the decision belongs to whoever is looking at the board on turn N+1.
         * Dating it to N closed the window before the player could see it — the
         * modal never appeared, because by the time anybody could click,
         * `World.getTurn()` had moved on.
         *
         * Stored on the government, because a save taken between the count and
         * the decision must reopen with the decision still to make.
         */
        n.gov.lostAt = asOf;
        n.gov.lostFrom = was;
      }
    } else {
      /*
       * A GOVERNMENT THAT WINS AGAIN STILL AGES. `leader.termTurns` used to be a
       * free-running timer that retired people on its own; now the election owns
       * that clock too, and a party that has held power for long enough fields a
       * new face rather than the same one for forty years.
       */
      const term = t.get('leader.termTurns');
      const seat = typeof Leaders !== 'undefined' && Leaders.loaded() ? Leaders.all()[nid] : null;
      if (seat && term > 0 && asOf - seat.since >= term) Leaders.replace(nid, rng, t, 'term');
    }

    Ledger.append({
      turn, phase: 'roster', subject: nid, kind: 'election', delta: res.margin,
      text: changed
        ? `${n.name} went to the polls and turned its government out: `
          + `${res.winner.name} took ${Math.round(res.winner.share * 100)}% of the vote.`
        : `${n.name} went to the polls and returned its government with `
          + `${Math.round((res.incumbent ? res.incumbent.share : 0) * 100)}% of the vote.`,
      terms: res.terms.map((x) => ({ name: x.label, value: x.contribution, key: x.key })),
      winner: res.winner.id, from: was, changed,
    });
    return { nid, changed, winner: res.winner.id, from: was, poll: res, canSteal: canSteal(nid, t) };
  }

  /**
   * Refuse the result: the government that lost stays, and pays for it.
   *
   * The price is the Civil Liberties that made it possible in the first place,
   * applied to the STOCK rather than to its target — the target recomputes from
   * the world next turn and would simply undo it. So it is a shock that decays
   * over several turns, which is the same bargain a civil war and a change of
   * course already make, and every consequence follows from the model: lower
   * liberties raise grievance, grievance feeds the movements, and the movements
   * are what takes the country apart.
   */
  function steal(nid, tune, rng, opts = {}) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n) return { ok: false, reason: 'No such nation.' };
    if (!isOpen(n, opts.asOf) || !n.gov.lostFrom) {
      return { ok: false, reason: 'There is no result to refuse.' };
    }
    if (!canSteal(nid, t)) {
      return { ok: false, reason: 'A country with this many liberties left cannot simply ignore a vote.' };
    }
    const took = n.gov.rulingIdeology;
    const back = n.gov.lostFrom;
    const res = Game.changeRulingIdeology(nid, back, { force: true, free: true, rng, reason: 'steal' });
    if (!res.ok) return { ok: false, reason: res.message };
    n.gov.lostAt = null;
    n.gov.lostFrom = null;
    const hit = t.get('election.stealLibertiesHit');
    if (typeof n.liberties === 'number') n.liberties = Math.max(0, n.liberties - hit);
    Ledger.append({
      turn: World.getTurn(), phase: 'roster', subject: nid, kind: 'election', delta: -hit,
      text: `${n.name} refused the result: the ${Ideology.byId(back).name} government stayed, `
        + `and the ${Ideology.byId(took).name} victory was set aside.`,
      terms: [{ name: 'Civil liberties', value: -hit, key: 'election.stealLibertiesHit' }],
      stolen: true, winner: took, from: back,
    });
    return { ok: true, kept: back, denied: took, cost: hit };
  }

  /**
   * Every election due this turn.
   *
   * `opts.defer` names the nations whose result is the caller's to settle — the
   * player's, in the live game. Everybody else who can refuse a result, does:
   * a state with the liberties of a police state behaves like one whether or not
   * a human is watching.
   */
  function tick(tune, rng, opts = {}) {
    const t = tune || window.TUNE;
    const out = [];
    for (const [nid] of Game.nations) {
      if (!due(nid, t)) continue;
      const res = hold(nid, t, rng, { asOf: opts.asOf });
      if (!res) continue;
      if (res.changed && res.canSteal && !(opts.defer && opts.defer(nid))) {
        // THE SAME CLOCK `hold` STAMPED WITH. See isOpen.
        const s = steal(nid, t, rng, { asOf: opts.asOf });
        res.stolen = s.ok;
      }
      out.push(res);
    }
    return out;
  }

  /**
   * Is there a result this nation could still refuse?
   *
   * `asOf` for a caller inside the world batch; omitted for the UI, which runs
   * after it and reads the same clock the stamp was written on. See isOpen.
   */
  function pending(nid, asOf) {
    const n = Game.getNation(nid);
    return !!(n && isOpen(n, asOf) && n.gov.lostFrom);
  }

  return { due, nextFor, poll, hold, steal, tick, canSteal, pending, termOf };
})();
