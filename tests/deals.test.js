/*
 * A1 — a trade is a contract, not a transaction.
 *
 * The three things these tests exist to pin, in order of how much it would cost
 * to break one silently:
 *
 *   1. THE SCOPE RULE. A1 builds on the economy and does not touch it. Signing a
 *      deal and settling it for a whole term leaves the price index byte-
 *      identical. If this test ever goes red, the stage has stopped being what
 *      it was scoped as, whatever else is passing.
 *   2. AARON'S INCOME RULING (D171). A year of a deal pays what a year of
 *      clicking paid. The old click paid `total * trade.gain` once every
 *      `trade.cooldownTurns + 1` turns; a deal pays `deal.rate` of that every
 *      turn. At the shipped defaults those two are the same number, and this is
 *      the test that says so in arithmetic rather than in a comment.
 *   3. THE TERM IS REAL. A four-turn deal pays four times and then stops. Not
 *      three, not five, and not once at signing — a lump sum would make a
 *      five-year deal a five-times click and would make a partner dying in year
 *      two cost nothing.
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** A neighbouring pair that actually has something to trade, or null. */
function findPair() {
  for (const [nid] of Game.nations) {
    for (const other of Game.adjacentNations(nid)) {
      const p = Moves.plan({ type: 'trade', nid, target: other }, T());
      if (p.ok && p.total > 0) return { a: nid, b: other, plan: p };
    }
  }
  return null;
}

const treasury = (nid) => Game.getNation(nid).treasury;

describe('Deals — the term', () => {
  it('a four-turn deal pays four times and then stops', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair on this map');
    const per = pair.plan.perTurn.me * 1e6;

    const before = treasury(pair.a);
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 4 } }, null, T());
    equal(treasury(pair.a), before, 'a deal paid something at signing; the first money is the next tick');

    const d = Deals.live(pair.a, pair.b);
    ok(d, 'signing did not produce a live deal');
    equal(d.duration, 4);

    // Settle by hand so the assertion is about Deals.tick and nothing else.
    const t0 = World.getTurn();
    for (let i = 0; i < 4; i++) Deals.tick(T(), t0 + i, {});
    equal(d.paid, 4, 'a four-turn deal did not pay exactly four times');
    equal(d.status, 'expired', 'a deal that has run its term is still live');
    close(d.earnedA + d.earnedB > 0 ? d.earnedA : 1, d.earnedA, 1e-9);

    const paidSoFar = d.paid;
    Deals.tick(T(), t0 + 4, {});
    equal(d.paid, paidSoFar, 'an expired deal paid again');
  });

  it('the money arrives per turn, not as a lump at signing', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    const plan = Moves.plan({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 4 } }, T());
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 4 } }, null, T());
    const t0 = World.getTurn();
    const before = treasury(pair.a);
    Deals.tick(T(), t0, {});
    close(treasury(pair.a) - before, plan.perTurn.me * 1e6, Math.abs(plan.perTurn.me) * 1e3 + 1,
      'one turn of a deal did not pay one turn of the plan');
  });

  it('a deal whose partner is gone is voided rather than paying a ghost', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 20 } }, null, T());
    const d = Deals.live(pair.a, pair.b);
    ok(d);
    const saved = Game.getNation(pair.b);
    Game.nations.delete(pair.b);
    Deals.tick(T(), World.getTurn(), {});
    equal(d.status, 'void');
    equal(d.reason, 'died');
    equal(d.paid, 0, 'a deal paid on the turn its partner died');
    Game.nations.set(pair.b, saved);
  });
});

describe('Deals — Aaron\'s income ruling (D171)', () => {
  it('a year of a deal pays what a year of clicking paid', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    /*
     * The old click: `total * trade.gain` outright, then the pair waited
     * `trade.cooldownTurns` turns. So its rhythm was one payment per
     * (cooldown + 1) turns. `deal.rate` is set so a deal of that many turns
     * pays exactly the same total.
     */
    const clickRhythm = T().get('trade.cooldownTurns') + 1;
    const oldLump = pair.plan.total * T().get('trade.gain');
    const plan = Moves.plan({ type: 'trade', nid: pair.a, target: pair.b,
      terms: { duration: 4 } }, T());
    close(plan.perTurn.me * clickRhythm, oldLump, Math.abs(oldLump) * 1e-9 + 1e-9,
      'a year of a deal no longer pays what a year of clicking paid — deal.rate and trade.cooldownTurns have drifted apart');
  });

  it('the AI still values a default deal at exactly what it valued a click at', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    // `AI.score` reads preview.gain against a turn of income. Reporting the
    // per-turn figure there would quarter every AI's appetite for trade, which
    // is a Full-game behaviour change smuggled in under an economy stage.
    const oldLump = pair.plan.total * T().get('trade.gain');
    close(pair.plan.gain, oldLump, Math.abs(oldLump) * 1e-9 + 1e-9,
      'plan.gain is no longer the whole-term take at the default duration');
  });

  it('the price split moves money between the parties and never changes the total', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    const even = Moves.plan({ type: 'trade', nid: pair.a, target: pair.b,
      terms: { duration: 4, priceMult: 1 } }, T());
    const tilted = Moves.plan({ type: 'trade', nid: pair.a, target: pair.b,
      terms: { duration: 4, priceMult: T().get('deal.priceMultMax') } }, T());
    const sum = (p) => p.perTurn.me + p.perTurn.them;
    close(sum(tilted), sum(even), Math.abs(sum(even)) * 1e-9 + 1e-9,
      'the price split changed the joint gain; it is only allowed to move it');
    ok(even.perTurn.me !== tilted.perTurn.me || even.total === 0,
      'the price split moved nothing at all');
  });
});

describe('Deals — the scope rule', () => {
  it('signing a deal leaves the price index byte-identical', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    const before = JSON.stringify(Market.getPrices());
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    equal(JSON.stringify(Market.getPrices()), before, 'signing a deal moved a price');
  });

  it('settling a deal for its whole term leaves the price index byte-identical', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const before = JSON.stringify(Market.getPrices());
    const t0 = World.getTurn();
    for (let i = 0; i < 8; i++) Deals.tick(T(), t0 + i, {});
    equal(JSON.stringify(Market.getPrices()), before, 'settling a deal moved a price');
  });
});

describe('Deals — one per pair, and what is promised is not available', () => {
  it('a pair with a live deal cannot sign another', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const again = Moves.plan({ type: 'trade', nid: pair.a, target: pair.b }, T());
    equal(again.ok, false, 'a pair signed twice');
    ok(/already have a deal/.test(again.reason), `unexpected refusal: ${again.reason}`);
  });

  it('legal() stops offering a partner once a deal with them is running', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    const has = () => Moves.legal(pair.a, T())
      .some((m) => m.type === 'trade' && m.target === pair.b);
    ok(has(), 'the pair was not offered as a trade candidate to begin with');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    equal(has(), false, 'a partner with a live deal is still being offered');
  });

  it('a signed flow is booked against the seller\'s free surplus, sector by sector', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    const before = Market.nationSurplus(pair.a, T()).surplus.slice();
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 20 } }, null, T());
    const d = Deals.live(pair.a, pair.b);
    const c = Deals.committed(pair.a);

    // What the ledger says is committed is exactly what the deal's flows say,
    // signed from this nation's side: selling positive, buying negative.
    const expected = [0, 0, 0, 0, 0, 0];
    for (const f of d.flows) {
      const sellingIsMe = (f.dir === 'ab' ? d.a : d.b) === pair.a;
      expected[f.i] += sellingIsMe ? f.vol : -f.vol;
    }
    for (let i = 0; i < 6; i++) {
      close(c.bySector[i], expected[i], Math.abs(expected[i]) * 1e-9 + 1e-9,
        `sector ${i} is committed for the wrong volume`);
    }

    // ...and the free surplus a further deal could draw on has shrunk toward
    // zero by exactly that amount in every sector the deal touched. This is the
    // half of the cooldown's retirement that stops a nation promising the same
    // goods to every neighbour it has.
    let touched = 0;
    for (let i = 0; i < 6; i++) {
      if (Math.abs(expected[i]) < 1e-9) continue;
      touched += 1;
      const free = before[i] - c.bySector[i];
      ok(Math.abs(free) < Math.abs(before[i]) + 1e-6,
        `sector ${i}: promising volume away did not reduce what is left to promise`);
    }
    ok(touched > 0, 'the deal committed nothing at all');
  });

  it('a signed surplus never makes a third nation a BIGGER offer', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    const thirds = Game.adjacentNations(pair.a).filter((x) => x !== pair.b);
    const before = new Map();
    for (const x of thirds) {
      const p = Moves.plan({ type: 'trade', nid: pair.a, target: x }, T());
      if (p.ok) before.set(x, p.total);
    }
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 20 } }, null, T());
    for (const [x, was] of before) {
      const p = Moves.plan({ type: 'trade', nid: pair.a, target: x }, T());
      const now = p.ok ? p.total : 0;
      ok(now <= was + 1e-6, `signing away surplus made the offer to ${x} LARGER`);
    }
    /*
     * Deliberately NOT asserting that some third offer shrinks. It usually will
     * not: on the fixture map the first tradeable pair is DC and Maryland, DC's
     * only other neighbour is Virginia, and the two deals match on different
     * sectors entirely — while Virginia's offer is capacity-capped anyway, so
     * clipping the flows behind it would not move the total. An assertion that
     * happens to hold on one map's topology is a test of the map, not the rule.
     */
  });
});

describe('Deals — expiry, renewal and the prompt', () => {
  it('auto-renew signs a fresh deal on today\'s prices rather than yesterday\'s', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b,
      terms: { duration: 2, autoRenew: true } }, null, T());
    const first = Deals.live(pair.a, pair.b);
    const t0 = World.getTurn();
    Deals.tick(T(), t0, {});
    Deals.tick(T(), t0 + 1, {});
    equal(first.status, 'renewed', 'an auto-renewing deal did not renew');
    const second = Deals.live(pair.a, pair.b);
    ok(second && second.id !== first.id, 'renewal did not produce a new deal');
    equal(second.renewedFrom, first.id);
    equal(second.since, t0 + 2, 'the renewal double-paid or skipped a turn');
  });

  it('a deal the player is party to raises a renegotiation offer when it lapses', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 2 } }, null, T());
    const t0 = World.getTurn();
    Deals.tick(T(), t0, { player: pair.a });
    equal(Deals.waiting(pair.a, t0), null, 'a prompt was raised before the deal ran out');
    Deals.tick(T(), t0 + 1, { player: pair.a });
    const offer = Deals.waiting(pair.a, t0 + 1);
    ok(offer, 'an expired player deal raised no renegotiation prompt');
    equal(offer.from, pair.b);
    equal(offer.kind, 'renew');
  });

  it('nobody is prompted about two AI nations\' deal', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 2 } }, null, T());
    const t0 = World.getTurn();
    Deals.tick(T(), t0, { player: null });
    Deals.tick(T(), t0 + 1, { player: null });
    equal(Deals.waiting(pair.a, t0 + 1), null);
    equal(Deals.waiting(pair.b, t0 + 1), null);
  });

  it('settlement writes no ledger entry, so a long game does not bury its own news', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 20 } }, null, T());
    const before = Ledger.all().length;
    const t0 = World.getTurn();
    for (let i = 0; i < 10; i++) Deals.tick(T(), t0 + i, { player: null });
    equal(Ledger.all().length, before, 'settling a deal wrote to the event ledger');
  });
});

describe('Deals — the save does not grow without bound', () => {
  it('forgets a finished deal once it is out of the memory window', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 2 } }, null, T());
    const id = Deals.live(pair.a, pair.b).id;
    const t0 = World.getTurn();
    Deals.tick(T(), t0, {});
    Deals.tick(T(), t0 + 1, {});
    ok(Deals.get(id), 'a deal that ended this turn was forgotten immediately');

    const window = T().get('nation.historyWindow');
    Deals.tick(T(), t0 + 1 + window, {});
    ok(Deals.get(id), 'a deal was forgotten while still inside the memory window');
    Deals.tick(T(), t0 + 2 + window, {});
    equal(Deals.get(id), null, 'a finished deal is still in the save long after anyone can read it');
  });
});

describe('Deals — save and restore', () => {
  it('round-trips exactly, ids included', async () => {
    await bootWorld({ seed: SEED });
    const pair = findPair();
    ok(pair, 'no tradeable neighbouring pair');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    Deals.tick(T(), World.getTurn(), {});
    const snap = JSON.parse(JSON.stringify(Deals.serialize()));
    Deals.loadState(snap);
    deepEqual(Deals.serialize(), snap, 'a deals snapshot did not survive its own round trip');
    ok(Deals.live(pair.a, pair.b), 'a live deal was not live after restore');
  });

  it('a document written before A1 loads as no deals rather than throwing', async () => {
    await bootWorld({ seed: SEED });
    Deals.loadState(undefined);
    equal(Deals.count(), 0);
    Deals.loadState(null);
    equal(Deals.count(), 0);
  });
});
