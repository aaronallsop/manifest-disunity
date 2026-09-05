/*
 * STANDING TRADE DEALS (A1) — a trade stops being a transaction and becomes a
 * contract.
 *
 * WHAT CHANGED AND WHY. Until now a bilateral trade was one click: both sides
 * earned `total * trade.gain` on the spot, and a cooldown stopped the same pair
 * doing it again for `trade.cooldownTurns` (3) turns. It worked, and it said
 * nothing. Nobody was promising anybody anything, so nothing could be broken,
 * nothing could run out, and there was no reason to prefer one neighbour to
 * another beyond this quarter's arithmetic. A deal with a TERM is the smallest
 * change that makes trade a relationship: you are agreeing to something for two
 * quarters or five years, and for that whole time the price is what you signed
 * at, whatever the market does afterwards.
 *
 * THE RATE, AND WHY IT IS NOT `trade.gain` ALONE (Aaron's ruling, D171). A deal
 * pays EVERY turn what the click paid ONCE every four. Left alone, that is
 * roughly four times the trade income per partner, and every number tuned
 * against the old rhythm — army upkeep, the price of annexing, how fast a broken
 * state recovers — would silently be tuned for a poorer world than the one it
 * was now in. So settlement is scaled by `deal.rate`, which starts at
 * 1 / (trade.cooldownTurns + 1) = 0.25: over a year a deal pays what a year of
 * clicking paid. The change is about commitment, not sudden wealth. It is a
 * slider, so trade can be turned up deliberately after the alpha rather than by
 * accident before it.
 *
 * A HAPPY CONSEQUENCE. With `deal.rate` at 0.25 and `deal.defaultDuration` at 4,
 * an AI nation signing a default deal earns exactly what its click used to earn,
 * spread across exactly the four turns it used to spend waiting. So the AI could
 * be moved onto deals in A1 without changing its cash flow by a cent, and the
 * world is not asymmetric while the player waits for A4.
 *
 * PRICE IS A SPLIT, NOT A PRICE (yet). `priceMult` moves the joint gain between
 * the two parties: the seller takes `value * priceMult`, the buyer
 * `value * (2 - priceMult)`, so the SUM never moves and at 1.0 the arithmetic is
 * byte-for-byte what `resolveTrade` paid. That is the only honest meaning a
 * counter-offer on price can have while nothing physically moves — a real
 * buyer-pays-seller price would leave every buyer worse off in an economy where
 * buying has no modelled benefit. A true price waits for goods to move.
 *
 * WHAT IT DOES NOT TOUCH, and this is the rule the whole stage hangs on: demand,
 * supply and the price index. Settlement is a treasury credit and nothing else.
 * `Market.getPrices()` is READ at signing and at renewal, to fix the deal's
 * price, and never written. There is a test that proves it.
 *
 * ONE LIVE DEAL PER PAIR, and it is what replaces the cooldown. A pair cannot
 * sign again while a deal runs, and a live deal's volume is subtracted from the
 * surplus available to sign with anybody else (`committed`). Without that second
 * half, retiring the cooldown would let fifty AI nations promise the same wheat
 * to every neighbour they have.
 */
const Deals = (function () {
  /* Ordered pair, so live(a,b) and live(b,a) are one lookup — the Pacts rule. */
  const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  let deals = new Map();     // id -> record
  let byPair = new Map();    // 'a|b' -> id of the LIVE deal, if any
  let offers = new Map();    // id -> offer record
  let seq = 0;               // deal ids
  let offerSeq = 0;          // offer ids

  const T = (tune) => tune || window.TUNE;

  function reset() {
    deals = new Map();
    byPair = new Map();
    offers = new Map();
    seq = 0;
    offerSeq = 0;
  }

  /* ---- reading ------------------------------------------------------ */

  /** The live deal between two nations, or null. */
  function live(a, b) {
    const id = byPair.get(key(a, b));
    if (!id) return null;
    const d = deals.get(id);
    return d && d.status === 'live' ? d : null;
  }

  const get = (id) => deals.get(id) || null;

  /** Every live deal `nid` is party to, soonest to expire first, then by id. */
  function forNation(nid, turn) {
    const t = turn == null ? World.getTurn() : turn;
    const out = [];
    for (const d of deals.values()) {
      if (d.status === 'live' && (d.a === nid || d.b === nid)) out.push(d);
    }
    return out.sort((x, y) => remaining(x, t) - remaining(y, t) || (x.id < y.id ? -1 : 1));
  }

  /** The other party, from one side's point of view. */
  const other = (d, nid) => (d.a === nid ? d.b : d.a);

  /** Turns this deal still has to run, counting the one being settled. */
  const remaining = (d, turn) => d.since + d.duration - (turn == null ? World.getTurn() : turn);

  /**
   * What `nid` has already promised away, per sector.
   *
   * THE COOLDOWN'S REPLACEMENT, and the half that is easy to forget. Selling is
   * positive, buying negative, in the same units and sign convention as
   * `Market.nationSurplus`, so `planTrade` can subtract it straight off the
   * available surplus. A nation that has promised its whole wheat surplus to
   * Kansas has none left to offer Nebraska, which is what a contract means.
   */
  function committed(nid, ignoreId) {
    const bySector = [0, 0, 0, 0, 0, 0];
    let value = 0;
    for (const d of deals.values()) {
      if (d.status !== 'live' || (d.a !== nid && d.b !== nid)) continue;
      // A deal being renewed must not block its own renewal.
      if (ignoreId && d.id === ignoreId) continue;
      const selling = (f) => (f.dir === 'ab' ? d.a : d.b) === nid;
      for (const f of d.flows) {
        while (bySector.length <= f.i) bySector.push(0);
        bySector[f.i] += selling(f) ? f.vol : -f.vol;
        value += (f.vol * f.price) / 100;
      }
    }
    return { bySector, value };
  }

  /* ---- what a turn of a deal pays ----------------------------------- */

  /**
   * One turn's treasury credit to each party, in $M.
   *
   * At `priceMult` 1 and `deal.rate` 1 this is exactly `resolveTrade`'s old
   * `total * trade.gain` to each side — the expression is deliberately the same
   * one, so a reader can see that nothing was quietly re-derived.
   */
  function settlement(d, tune) {
    const t = T(tune);
    const rate = t.get('trade.gain') * t.get('deal.rate');
    let a = 0, b = 0;
    for (const f of d.flows) {
      const value = (f.vol * f.price) / 100;
      const seller = f.dir === 'ab' ? 'a' : 'b';
      const sellerTake = value * d.priceMult * rate;
      const buyerTake = value * (2 - d.priceMult) * rate;
      if (seller === 'a') { a += sellerTake; b += buyerTake; } else { b += sellerTake; a += buyerTake; }
    }
    return { a, b };
  }

  /** What `nid` takes from every live deal in a turn, in $M. */
  function income(nid, tune, turn) {
    let sum = 0;
    for (const d of forNation(nid, turn)) {
      const s = settlement(d, tune);
      sum += d.a === nid ? s.a : s.b;
    }
    return sum;
  }

  /* ---- signing ------------------------------------------------------ */

  /**
   * Turn an accepted plan into a standing deal. Called from `Moves.resolve`,
   * never directly by the UI — the resolver is the one place that knows what
   * actually happened, which is the same argument that put `plan` in one place.
   */
  function sign(plan, opts) {
    const o = opts || {};
    const a = plan.nid < plan.target ? plan.nid : plan.target;
    const b = plan.nid < plan.target ? plan.target : plan.nid;
    const flip = a !== plan.nid;
    seq += 1;
    const d = {
      id: `d${seq}`,
      a, b,
      since: o.since == null ? World.getTurn() : o.since,
      duration: plan.duration,
      autoRenew: !!plan.autoRenew,
      priceMult: plan.priceMult,
      /*
       * `dir` is stored against the ORDERED pair, not against the proposer, so
       * a deal reads the same whichever side loads it. `plan.flows` are written
       * from the proposer's point of view: `sell` is what the proposer ships.
       */
      flows: plan.flows.map((f) => ({
        i: f.i, s: f.s,
        dir: (f.sell >= f.buy) === !flip ? 'ab' : 'ba',
        vol: f.vol, price: f.price,
      })),
      paid: 0, earnedA: 0, earnedB: 0,
      /*
       * WHERE THE GOODS GO (A2), and the only line this file gained for that
       * whole stage. `null` means they cross nobody's ground but the two
       * parties' own, which is every deal the game could sign before A2 and
       * costs exactly nothing. The toll is taken in its own world phase, so
       * settlement below stays gross and unchanged.
       */
      route: plan.route || null,
      status: 'live', endedTurn: null, reason: null,
      renewedFrom: o.renewedFrom || null,
    };
    deals.set(d.id, d);
    byPair.set(key(a, b), d.id);
    return d;
  }

  /* ---- offers ------------------------------------------------------- */

  /**
   * An offer is a price you were QUOTED, so its prices are snapshotted when it
   * is made. In A1 offers come from the player's negotiation and from the
   * renegotiation prompt at expiry; the AI starts sending them in A4, against
   * the same functions.
   */
  function propose(o, tune) {
    const t = T(tune);
    if (live(o.from, o.to)) return null;
    const open = offersFor(o.to).length;
    if (open >= t.get('deal.maxOpenOffers')) return null;
    offerSeq += 1;
    const made = o.made == null ? World.getTurn() : o.made;
    const rec = {
      id: `o${offerSeq}`,
      from: o.from, to: o.to,
      kind: o.kind || 'new',
      dealId: o.dealId || null,
      replyTo: o.replyTo || null,
      made,
      expires: made + t.get('deal.offerTurns'),
      terms: {
        duration: o.terms.duration,
        autoRenew: !!o.terms.autoRenew,
        priceMult: o.terms.priceMult,
        flows: (o.terms.flows || []).map((f) => ({ ...f })),
      },
    };
    offers.set(rec.id, rec);
    return rec;
  }

  /** Unexpired offers addressed to `nid`, oldest first. */
  function offersFor(nid, turn) {
    const t = turn == null ? World.getTurn() : turn;
    const out = [];
    for (const o of offers.values()) if (o.to === nid && o.expires > t) out.push(o);
    return out.sort((x, y) => x.made - y.made || (x.id < y.id ? -1 : 1));
  }

  /** Is anything waiting for this nation to answer? */
  const waiting = (nid, turn) => (nid ? offersFor(nid, turn)[0] || null : null);

  const decline = (id) => offers.delete(id);

  /* ---- one turn of every deal --------------------------------------- */

  const say = (e) => (typeof Ledger === 'undefined' ? null : Ledger.append({ phase: 'deal', ...e }));
  const nameOf = (nid) => {
    const n = typeof Game === 'undefined' ? null : Game.getNation(nid);
    return n ? n.name : nid;
  };

  /**
   * Settle, warn, expire — once per world turn, inside the world's own batch.
   *
   * ORDER MATTERS AND IS FIXED: a deal is paid for the turn it is closing
   * BEFORE it is allowed to expire, so a four-turn deal pays four times. Deals
   * are walked in ascending id order so a save reloaded mid-game settles in the
   * same order it would have.
   *
   * PER TURN, NEVER A LUMP. Paying the whole term at signing would make a
   * five-year deal a five-times click, and — worse — would make a partner dying
   * in year two cost nothing. The money has to arrive over time for the term to
   * mean anything.
   *
   * WHAT IS DELIBERATELY NOT LOGGED: the settlements. Sixty deals over sixty
   * turns is 3,600 entries against a ledger capped at 4,000, and the real news
   * would be pushed out by a payment nobody reads. Signing, renewal, expiry and
   * the player's own countdowns are news; a standing order is not.
   */
  function tick(tune, turn, opts) {
    const t = T(tune);
    const now = turn == null ? World.getTurn() : turn;
    const player = (opts || {}).player || null;
    const countdownAt = t.get('deal.countdownAt') || [];
    const ids = [...deals.keys()].sort((x, y) => (Number(x.slice(1)) - Number(y.slice(1))));

    for (const id of ids) {
      const d = deals.get(id);
      if (d.status !== 'live') continue;

      /* A deal whose other party no longer exists is not a deal (Pacts' rule). */
      if (!Game.getNation(d.a) || !Game.getNation(d.b)) {
        close(d, now, 'void', 'died');
        const survivor = Game.getNation(d.a) ? d.a : d.b;
        say({ subject: survivor, kind: 'trade', event: 'void', dealId: d.id, partner: other(d, survivor),
              text: `${nameOf(survivor)}'s trade deal died with ${nameOf(other(d, survivor))}.` });
        continue;
      }

      const left = remaining(d, now);
      if (left < 1) { expire(d, now, t, player); continue; }

      const s = settlement(d, t);
      Game.earn(d.a, s.a * 1e6);
      Game.earn(d.b, s.b * 1e6);
      d.paid += 1;
      d.earnedA += s.a;
      d.earnedB += s.b;

      /*
       * Countdowns are written only for deals the PLAYER is party to. Fifty
       * nations' expiry notices are a newspaper nobody reads, and the AI does
       * not read the journal; every other countdown is derivable from the deal
       * ledger, which shows turns-left on every row.
       */
      if (player && (d.a === player || d.b === player) && countdownAt.includes(left)) {
        say({ subject: player, kind: 'trade', event: 'countdown', dealId: d.id, left,
              partner: other(d, player),
              text: `Your trade deal with ${nameOf(other(d, player))} has ${left} ${left === 1 ? 'turn' : 'turns'} left.` });
      }

      if (left === 1) expire(d, now, t, player);
    }

    /*
     * FORGET THE DEAD ONES, or the save grows without bound. Measured: 22 turns
     * of a 61-nation board produced 737 deal records, 673 of them finished —
     * a hundred turns would put several thousand flow-carrying objects into
     * every save document for the sake of history nothing reads. Ended deals
     * are kept for `nation.historyWindow` turns, the same window the territorial
     * memory and the breach list use, so the Deals screen and a renegotiation
     * card can still look back at what a deal paid.
     */
    const window = t.get('nation.historyWindow');
    for (const [id, d] of [...deals]) {
      if (d.status !== 'live' && d.endedTurn != null && now - d.endedTurn > window) deals.delete(id);
    }

    /* An offer nobody answered is not an offer. */
    for (const [oid, o] of [...offers]) {
      if (o.expires > now) continue;
      offers.delete(oid);
      if (player && o.to === player) {
        say({ subject: player, kind: 'trade', event: 'offer-lapsed', partner: o.from,
              text: `The offer from ${nameOf(o.from)} expired unanswered.` });
      }
    }
  }

  function close(d, turn, status, reason) {
    d.status = status;
    d.endedTurn = turn;
    d.reason = reason;
    if (byPair.get(key(d.a, d.b)) === d.id) byPair.delete(key(d.a, d.b));
  }

  /**
   * The end of a term, and the three things that can happen at it.
   *
   * The re-plan goes back through `Moves.plan`, not through a private copy of
   * the rules: it re-fixes the price at today's index, re-clips the volume to
   * what is actually available now, and re-checks that both nations are alive,
   * still bordering and still recognise each other. So "the surplus you were
   * selling has dried up" is answered here and only here — a deal holds its
   * price and volume for its whole term, and the loss bites at renewal.
   */
  function expire(d, turn, tune, player) {
    const rePlan = replan(d, tune);
    if (d.autoRenew && rePlan && rePlan.ok) {
      close(d, turn, 'renewed', 'renewed');
      const next = sign({ ...rePlan, nid: d.a, target: d.b }, { since: turn + 1, renewedFrom: d.id });
      const before = settlement(d, tune), after = settlement(next, tune);
      say({ subject: d.a, kind: 'trade', event: 'renewed', dealId: next.id, partner: d.b,
            delta: (after.a - before.a) * 1e6,
            terms: [
              { name: 'Per turn, was', value: before.a, key: 'deal.rate' },
              { name: 'Per turn, now', value: after.a, key: 'deal.rate' },
              { name: 'Turns', value: next.duration, key: 'deal.durations' },
            ],
            text: `${nameOf(d.a)} and ${nameOf(d.b)} renewed their trade deal for another ${next.duration} turns.` });
      return next;
    }
    if (d.autoRenew) {
      close(d, turn, 'expired', 'lapsed');
      say({ subject: d.a, kind: 'trade', event: 'lapsed', dealId: d.id, partner: d.b,
            text: `${nameOf(d.a)} and ${nameOf(d.b)} could not renew their trade deal — ${rePlan && rePlan.reason ? rePlan.reason : 'the terms no longer stand'}` });
      return null;
    }
    close(d, turn, 'expired', 'expired');
    say({ subject: d.a, kind: 'trade', event: 'expired', dealId: d.id, partner: d.b,
          text: `The trade deal between ${nameOf(d.a)} and ${nameOf(d.b)} has run out.` });
    /*
     * THE RENEGOTIATION PROMPT. A deal the player was party to comes back as an
     * offer from the counterparty on the terms that just ended, which the shell
     * turns into a halt at the end of the round. If neither party is the player,
     * nothing further happens: an AI re-opening a deal on its own is A4.
     */
    if (player && (d.a === player || d.b === player) && rePlan && rePlan.ok) {
      propose({
        from: other(d, player), to: player, kind: 'renew', dealId: d.id, made: turn,
        terms: {
          duration: d.duration, autoRenew: d.autoRenew, priceMult: d.priceMult,
          flows: rePlan.flows.map((f) => ({ i: f.i, s: f.s, vol: f.vol, price: f.price })),
        },
      }, tune);
    }
    return null;
  }

  /** Today's answer to the terms this deal was signed on. */
  function replan(d, tune) {
    if (typeof Moves === 'undefined' || !Moves.plan) return null;
    try {
      return Moves.plan({
        type: 'trade', nid: d.a, target: d.b,
        terms: { duration: d.duration, autoRenew: d.autoRenew, priceMult: d.priceMult },
        ignoreDeal: d.id,
      }, tune);
    } catch (e) { return null; }
  }

  /**
   * Answer a renegotiation prompt: 'renew' signs the offer's terms, 'lapse'
   * drops it. Goes through the model rather than the DOM so the whole prompt is
   * testable headless.
   */
  function answer(offerId, choice, tune) {
    const o = offers.get(offerId);
    if (!o) return { ok: false, reason: 'That offer is no longer open.' };
    offers.delete(offerId);
    if (choice !== 'renew') return { ok: true, renewed: null };
    const plan = typeof Moves === 'undefined' ? null : Moves.plan({
      type: 'trade', nid: o.to, target: o.from,
      terms: { duration: o.terms.duration, autoRenew: o.terms.autoRenew, priceMult: o.terms.priceMult },
    }, tune);
    if (!plan || !plan.ok) return { ok: false, reason: (plan && plan.reason) || 'Those terms no longer stand.' };
    return { ok: true, renewed: Moves.resolve({
      type: 'trade', nid: o.to, target: o.from,
      terms: { duration: o.terms.duration, autoRenew: o.terms.autoRenew, priceMult: o.terms.priceMult },
    }, null, tune) };
  }

  /* ---- state --------------------------------------------------------- */

  /*
   * Plain JSON only — finite numbers, strings, booleans and null. The save test
   * round-trips the whole document and compares bytes, so an Infinity or a Map
   * here fails loudly rather than quietly. `seq` travels with the deals, the way
   * the Ledger's does, so ids never collide after a load.
   */
  const serialize = () => ({
    seq, offerSeq,
    deals: [...deals.values()].map((d) => ({
      ...d,
      flows: d.flows.map((f) => ({ ...f })),
      // Deep-copied like the flows: a shallow spread passes the round-trip test
      // and still leaves a loaded game sharing hop objects with the live one.
      route: d.route ? { ...d.route, hops: d.route.hops.map((h) => ({ ...h })) } : null,
    })),
    offers: [...offers.values()].map((o) => ({ ...o, terms: { ...o.terms, flows: o.terms.flows.map((f) => ({ ...f })) } })),
  });

  function loadState(snap) {
    reset();
    if (!snap) return;                       // a document written before A1
    seq = snap.seq || 0;
    offerSeq = snap.offerSeq || 0;
    for (const d of snap.deals || []) {
      const rec = { ...d, flows: (d.flows || []).map((f) => ({ ...f })) };
      rec.route = d.route ? { ...d.route, hops: (d.route.hops || []).map((h) => ({ ...h })) } : null;
      deals.set(rec.id, rec);
      if (rec.status === 'live') byPair.set(key(rec.a, rec.b), rec.id);
    }
    for (const o of snap.offers || []) {
      offers.set(o.id, { ...o, terms: { ...o.terms, flows: (o.terms.flows || []).map((f) => ({ ...f })) } });
    }
  }

  return {
    key, reset,
    live, get, forNation, other, remaining, committed,
    settlement, income, sign,
    propose, offersFor, waiting, decline, answer,
    tick, serialize, loadState,
    count: () => [...deals.values()].filter((d) => d.status === 'live').length,
    all: () => [...deals.values()],
  };
})();
