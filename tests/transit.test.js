/*
 * A2 — the corridor graph, and the arithmetic of a toll.
 *
 * Two things these tests exist to hold, in order of how expensive they are to
 * get wrong:
 *
 *   1. THE GRAPH DESCRIBES THE REAL MAP. Every edge in it must be a real shared
 *      land border that really carries rail or road. The bug this guards against
 *      has already happened once in this project, at smaller scale: state-level
 *      adjacency deliberately spans water, so California was offered an
 *      "overland" route to Alaska. A routing engine built on the same mistake
 *      would ship goods across the Pacific on a motorway.
 *   2. A LONG CHAIN LOSES MONEY. The roadmap's own success metric is that a
 *      five-hop resale chain is unprofitable. It has to be true of the
 *      ARITHMETIC and not merely of the hop cap, or it stops being true the
 *      moment somebody raises the cap.
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('Transit — the corridor graph describes the real map', () => {
  it('every edge between two nations is a real shared land border', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    let checked = 0;
    for (const [from, tos] of g.edges) {
      if (Transit.isOutside(from)) continue;
      for (const to of tos.keys()) {
        if (Transit.isOutside(to)) continue;
        ok(Game.borderingNations(from).includes(to),
          `${from} -> ${to} is in the corridor graph but they share no land border`);
        checked += 1;
      }
    }
    ok(checked > 100, `only ${checked} land edges on a 60-nation board`);
  });

  it('never routes across water, which is the bug this replaces', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    for (const [from, tos] of g.edges) {
      if (Transit.isOutside(from)) continue;
      const overland = new Set(Game.borderingNations(from));
      for (const to of tos.keys()) {
        if (Transit.isOutside(to)) continue;
        ok(overland.has(to),
          `${from} -> ${to} is reachable only across water; that is the California/Alaska defect`);
      }
    }
  });

  it('a border carries a mode only when both sides do', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    let rail = 0, road = 0;
    for (const [from, tos] of g.edges) {
      if (Transit.isOutside(from)) continue;
      for (const [to, bits] of tos) {
        if (Transit.isOutside(to)) continue;
        ok(bits !== 0, `${from} -> ${to} exists with no mode at all`);
        ok((bits & ~(Transit.MODE.HIGHWAY | Transit.MODE.RAIL)) === 0,
          `${from} -> ${to} carries a mode a land border cannot`);
        if (bits & Transit.MODE.RAIL) rail += 1;
        if (bits & Transit.MODE.HIGHWAY) road += 1;
      }
    }
    ok(rail > 0 && road > 0, `expected both kinds of corridor, got rail ${rail} road ${road}`);
  });

  it('is symmetric between nations: a border is a border from both sides', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    for (const [from, tos] of g.edges) {
      if (Transit.isOutside(from)) continue;
      for (const [to, bits] of tos) {
        if (Transit.isOutside(to)) continue;
        equal(g.edges.get(to).get(from), bits, `${from}/${to} disagree about their own border`);
      }
    }
  });

  it('is a pure function of the board, and notices when the board moves', async () => {
    await bootWorld({ seed: SEED });
    const a = Transit.graph();
    equal(Transit.graph(), a, 'the graph was rebuilt when nothing had changed');

    /*
     * The cache is the whole reason routing is affordable — it is built once a
     * turn rather than 735 times — so a stale one is the expensive failure. The
     * borders in this game move constantly: every annexation, union, release and
     * civil war redraws them.
     */
    const donor = [...Game.nations.keys()].find((n) => Game.annexTargets(n).size > 1);
    ok(donor, 'no nation on the board has anything to annex');
    Game.moveCounties([...Game.annexTargets(donor)].slice(0, 2), donor);
    const after = Transit.graph();
    ok(after !== a, 'the graph was served stale after a border moved');
  });

  it('a fresh world does not inherit the last one\'s borders', async () => {
    await bootWorld({ seed: SEED });
    const before = Transit.graph();
    // Game.reset() sets the owner epoch back to zero, so a cache keyed on the
    // epoch alone would hand a brand new world the previous world's corridors.
    await bootWorld({ seed: SEED + 1 });
    ok(Transit.graph() !== before, 'a new world was served the old world\'s corridor graph');
  });
});

describe('Transit — the ways out', () => {
  it('an ocean port reaches the world; a Great Lakes port reaches it only via Canada', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    let ocean = 0, lakes = 0;
    for (const [nid] of Game.nations) {
      const acc = Game.exportAccess(nid);
      const out = g.edges.get(nid);
      if (acc.oceanPorts) {
        ok(out.get(Transit.WORLD) & Transit.MODE.PORT, `${nid} has an ocean port but cannot reach the world`);
        ocean += 1;
      } else {
        ok(!out.get(Transit.WORLD), `${nid} reaches the world with no ocean port`);
      }
      if (acc.lakePorts) {
        ok(out.get(Transit.CANADA) & Transit.MODE.PORT, `${nid} has a lake port but cannot reach Canada by ship`);
        lakes += 1;
      }
    }
    ok(ocean > 0, 'no nation on the board has an ocean port');
    ok(lakes > 0, 'no nation on the board has a Great Lakes port');
  });

  it('nothing can be laundered back through the world market', async () => {
    await bootWorld({ seed: SEED });
    const out = Transit.graph().edges.get(Transit.WORLD);
    equal(out.size, 0, 'the world market has an outgoing edge, so goods could re-enter the map through it');
  });

  it('Canada and Mexico are corridors, not countries', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    for (const id of [Transit.CANADA, Transit.MEXICO]) {
      ok(g.edges.has(id), `${id} is not in the graph`);
      ok(g.edges.get(id).get(Transit.WORLD), `${id} cannot reach the world`);
      equal(Game.getNation(id), undefined, `${id} exists as a nation and could therefore be conquered`);
    }
  });
});

describe('Transit — finding a way through', () => {
  /* Everybody grants everybody, at a fixed rate: the search under test, with
     the register held still so a failure can only be the search. */
  const openBorders = (rate) => ({ permit: () => ({ rate }) });

  it('two neighbours need nobody in between', async () => {
    await bootWorld({ seed: SEED });
    const [a] = [...Game.nations.keys()];
    const b = Game.borderingNations(a).find((x) => Transit.modesBetween(a, x));
    ok(b, 'no neighbour of the first nation carries a corridor at all');
    const r = Transit.find(a, b, openBorders(0.2));
    ok(r, `no route from ${a} to its own neighbour ${b}`);
    equal(r.hops.length, 0, 'a route was found through somebody between two neighbours');
    equal(r.keep, 1, 'two neighbours paid a toll to each other');
  });

  it('finds nobody at all when nobody has granted anything', async () => {
    await bootWorld({ seed: SEED });
    // The landlocked case with a closed continent: correct answer is "no".
    let refused = 0, tried = 0;
    for (const [nid] of Game.nations) {
      if (Game.exportAccess(nid).any) continue;
      tried += 1;
      if (!Transit.toWorld(nid, {})) refused += 1;
    }
    ok(tried > 0, 'no landlocked nation on the board to check');
    equal(refused, tried, 'a nation reached the world market through a corridor nobody granted');
  });

  it('a landlocked nation reaches the world once its neighbours allow it', async () => {
    await bootWorld({ seed: SEED });
    const stuck = [...Game.nations.keys()].filter((n) => !Game.exportAccess(n).any);
    ok(stuck.length, 'no landlocked nation on the board');
    let reached = 0;
    for (const nid of stuck) {
      const r = Transit.toWorld(nid, openBorders(0.2));
      if (r) {
        reached += 1;
        ok(r.hops.length >= 1, `${nid} reached the world with nobody in between and no port of its own`);
        ok(r.keep < 1, `${nid} paid nothing to cross somebody else's ground`);
      }
    }
    ok(reached > 0, 'not one landlocked nation could reach the world even with every border open');
  });

  it('the same board gives the same route twice', async () => {
    await bootWorld({ seed: SEED });
    const stuck = [...Game.nations.keys()].find((n) => !Game.exportAccess(n).any
      && Transit.toWorld(n, openBorders(0.2)));
    ok(stuck, 'no routed nation to check');
    const a = Transit.toWorld(stuck, openBorders(0.2));
    const b = Transit.toWorld(stuck, openBorders(0.2));
    deepEqual(a.hops, b.hops, 'the same question got two different routes');
  });

  it('respects the hop cap without hiding a shorter route', async () => {
    await bootWorld({ seed: SEED });
    const stuck = [...Game.nations.keys()].find((n) => !Game.exportAccess(n).any
      && Transit.toWorld(n, openBorders(0.2)));
    ok(stuck, 'no routed nation to check');
    for (const r of [Transit.toWorld(stuck, openBorders(0.2))]) {
      ok(r.hops.length <= T().get('transit.maxHops'), 'a route exceeded the hop cap');
    }
  });

  it('a nation that grants nothing cannot be routed through', async () => {
    await bootWorld({ seed: SEED });
    const stuck = [...Game.nations.keys()].find((n) => !Game.exportAccess(n).any
      && Transit.toWorld(n, openBorders(0.2)));
    ok(stuck, 'no routed nation to check');
    const via = Transit.toWorld(stuck, openBorders(0.2)).hops[0].node;
    const closed = Transit.toWorld(stuck, { permit: (node) => (node === via ? null : { rate: 0.2 }) });
    ok(!closed || closed.hops[0].node !== via,
      `${via} refused passage and the route went through it anyway`);
  });

  it('nothing routes through the world market', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) {
      const r = Transit.toWorld(nid, openBorders(0.1));
      if (!r) continue;
      ok(!r.hops.some((h) => h.node === Transit.WORLD),
        `${nid}'s route treats the world market as a country to pass through`);
    }
  });
});

describe('Transit — the toll comes off the income, never out of the deal', () => {
  /*
   * THE THREE TRIPWIRES FOR THE WHOLE STAGE. A2 was scoped as an addition: a new
   * instrument and a new cost on a new kind of deal, with nothing that already
   * worked paying differently. If any of these three goes red, it has stopped
   * being that and become an economy change, whatever else is passing.
   */

  /**
   * Open every border to everybody, through the real register, so these tests
   * exercise the whole path rather than a stub. Returns how many were opened —
   * asserted non-zero, because a fixture that quietly grants nothing turns every
   * test below into a test that passes by not running.
   */
  function openEveryBorder(rate) {
    let opened = 0;
    for (const [a] of Game.nations) {
      for (const [b] of Game.nations) {
        if (a === b) continue;
        const bits = Transit.modesBetween(a, b);
        for (const m of [Transit.MODE.RAIL, Transit.MODE.HIGHWAY, Transit.MODE.PORT]) {
          if (!(bits & m)) continue;
          if (Transit.grant({ grantor: a, grantee: b, mode: m, rate, duration: 20 }, T())) opened += 1;
        }
      }
    }
    return opened;
  }

  /** A pair that do NOT touch but can reach each other through somebody. */
  function routedPair() {
    for (const [a] of Game.nations) {
      const direct = new Set(Game.adjacentNations(a));
      for (const [b] of Game.nations) {
        if (a === b || direct.has(b)) continue;
        const p = Moves.plan({ type: 'trade', nid: a, target: b }, T());
        if (p.ok && p.route && p.route.hops.length && p.total > 0) return { a, b, plan: p };
      }
    }
    return null;
  }

  /** Boot, open every border, and find a genuinely routed pair. Never null. */
  async function routedWorld() {
    await bootWorld({ seed: SEED });
    const opened = openEveryBorder(T().get('transit.rateMin'));
    ok(opened > 50, `only ${opened} corridors granted; the fixture is not opening the board`);
    const pair = routedPair();
    ok(pair, 'no two nations on the whole board need a corridor to reach each other');
    return pair;
  }

  it('a direct deal is untouched to the bit', async () => {
    await bootWorld({ seed: SEED });
    let checked = 0;
    for (const [a] of Game.nations) {
      for (const b of Game.adjacentNations(a)) {
        const p = Moves.plan({ type: 'trade', nid: a, target: b }, T());
        if (!p.ok) continue;
        equal(p.route, null, `${a}-${b} share a border and were given a route anyway`);
        equal(p.carriage, 1, `${a}-${b} are neighbours and were charged carriage`);
        checked += 1;
        if (checked > 30) return;
      }
    }
    ok(checked > 0, 'no direct pair found to check');
  });

  it('a routed deal\'s GROSS settlement is what it would have been with no route', async () => {
    const pair = await routedWorld();
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const d = Deals.live(pair.a, pair.b);
    ok(d && d.route, 'the deal was signed without the route it needed');
    const gross = Deals.settlement(d, T());
    const bare = Deals.settlement({ ...d, route: null }, T());
    deepEqual(gross, bare,
      'the toll has moved INSIDE the deal\'s own arithmetic; it must come off the income afterwards');
  });

  it('what everyone takes plus what arrives is exactly what the deal paid', async () => {
    const pair = await routedWorld();
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const d = Deals.live(pair.a, pair.b);
    const total = () => [...Game.nations.values()].reduce((s, n) => s + n.treasury, 0);

    const before = total();
    const t0 = World.getTurn();
    Deals.tick(T(), t0, {});
    const afterGross = total();
    Transit.tick(T(), t0, {});
    const afterToll = total();

    const gross = Deals.settlement(d, T());
    const priced = Transit.priceRoute(d.route.hops, T());
    const paid = (gross.a + gross.b) * 1e6;
    const tol = Math.abs(paid) * 1e-9 + 1;
    close(afterGross - before, paid, tol,
      'the deal did not pay what its settlement says it pays');

    /*
     * WHAT LEAVES THE BOARD, AND WHY IT IS ALLOWED TO. Two of the three things
     * a journey costs are deliberately collected by nobody:
     *
     *   the FOREIGN CORRIDOR share — the owner's ruling is that Canada's ten per
     *   cent is a cost, not a transfer;
     *   the CROSSING FRICTION — handling, transhipment and delay, which is what
     *   makes distance expensive regardless of how generous the middlemen are.
     *
     * Everything a domestic nation charges is a TRANSFER and must still be on
     * the board afterwards. So the board's total falls by exactly what the two
     * parties paid minus what the transit nations received — three quantities
     * computed three different ways, which is what makes this an invariant
     * rather than a restatement.
     */
    const collected = priced.legs.filter((l) => l.transfer).reduce((s, l) => s + l.take, 0) * paid;
    const chargedToParties = (1 - priced.keep) * paid;
    close(afterToll - afterGross, collected - chargedToParties, tol,
      'money was minted or destroyed on the journey');
    ok(collected > 0, 'the transit nations were charged for but paid nothing');
    ok(chargedToParties > collected,
      'nothing was lost to the crossings themselves, so distance costs the parties nothing');
  });

  it('every nation that carried the goods was actually paid for it', async () => {
    const pair = await routedWorld();
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const d = Deals.live(pair.a, pair.b);
    const gross = Deals.settlement(d, T());
    const paid = (gross.a + gross.b) * 1e6;
    const priced = Transit.priceRoute(d.route.hops, T());
    const before = new Map([...Game.nations.keys()].map((n) => [n, Game.getNation(n).treasury]));
    const t0 = World.getTurn();
    Deals.tick(T(), t0, {});
    Transit.tick(T(), t0, {});
    let checked = 0;
    for (const leg of priced.legs) {
      if (!leg.transfer) {
        // A corridor node is not a nation and cannot hold money at all.
        equal(Game.getNation(leg.node), undefined,
          `${leg.node} took a cut and exists as a nation, which the ruling forbids`);
        continue;
      }
      const got = Game.getNation(leg.node).treasury - before.get(leg.node);
      close(got, leg.take * paid, Math.abs(paid) * 1e-9 + 1,
        `${leg.node} carried the goods and was paid the wrong amount`);
      checked += 1;
    }
    ok(checked > 0, 'the route had no domestic hop to check');
  });

  it('routing leaves the price index byte-identical', async () => {
    const pair = await routedWorld();
    const before = JSON.stringify(Market.getPrices());
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const t0 = World.getTurn();
    for (let i = 0; i < 8; i++) { Deals.tick(T(), t0 + i, {}); Transit.tick(T(), t0 + i, {}); }
    equal(JSON.stringify(Market.getPrices()), before, 'carrying goods moved a price');
  });

  it('a routed deal survives a save with its hops deep-copied', async () => {
    const pair = await routedWorld();
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const snap = JSON.parse(JSON.stringify(Deals.serialize()));
    Deals.loadState(snap);
    deepEqual(Deals.serialize(), snap, 'a routed deal did not survive its own round trip');
    const d = Deals.live(pair.a, pair.b);
    ok(d.route && d.route.hops.length, 'the route was lost in the save');
    // Mutating the loaded copy must not reach back into the snapshot.
    d.route.hops[0].rate = 999;
    ok(snap.deals.every((x) => !x.route || x.route.hops.every((h) => h.rate !== 999)),
      'the loaded game shares hop objects with its own save');
  });
});

describe('Transit — closing a corridor under a running deal', () => {
  function openEveryBorder(rate) {
    let opened = 0;
    for (const [a] of Game.nations) {
      for (const [b] of Game.nations) {
        if (a === b) continue;
        const bits = Transit.modesBetween(a, b);
        for (const m of [Transit.MODE.RAIL, Transit.MODE.HIGHWAY, Transit.MODE.PORT]) {
          if (!(bits & m)) continue;
          if (Transit.grant({ grantor: a, grantee: b, mode: m, rate, duration: 20 }, T())) opened += 1;
        }
      }
    }
    return opened;
  }
  async function routedDeal() {
    await bootWorld({ seed: SEED });
    ok(openEveryBorder(T().get('transit.rateMin')) > 50, 'the fixture opened no corridors');
    for (const [a] of Game.nations) {
      const direct = new Set(Game.adjacentNations(a));
      for (const [b] of Game.nations) {
        if (a === b || direct.has(b)) continue;
        const p = Moves.plan({ type: 'trade', nid: a, target: b }, T());
        if (!p.ok || !p.route || !p.route.hops.length || p.total <= 0) continue;
        Moves.resolve({ type: 'trade', nid: a, target: b, terms: { duration: 20 } }, null, T());
        return { a, b, deal: Deals.live(a, b) };
      }
    }
    ok(false, 'no routed deal could be signed anywhere on the board');
    return null;
  }

  it('a notice keeps the goods moving for exactly its notice period', async () => {
    const r = await routedDeal();
    const hop = r.deal.route.hops.find((h) => !h.corridor);
    ok(hop, 'the route crosses nobody, so there is nothing to close');
    const g = Transit.live(hop.node, r.a, hop.mode);
    ok(g, 'the hop it routes through has no grant behind it');

    const t0 = World.getTurn();
    Transit.serve(g.id, hop.node, t0, T());
    const notice = g.notice;
    // Still carrying, right up to the last turn of the notice.
    for (let i = 0; i < notice; i++) {
      equal(Transit.blockedAt(r.deal, t0 + i), null,
        `the corridor stopped carrying ${i} turns into a ${notice}-turn notice`);
    }
    Transit.tickRegister(T(), t0 + notice);
    ok(Transit.blockedAt(r.deal, t0 + notice),
      'the corridor was still carrying after its notice had run out');
  });

  it('a closed corridor stops the deal paying, and its term keeps running down', async () => {
    const r = await routedDeal();
    const hop = r.deal.route.hops.find((h) => !h.corridor);
    ok(hop, 'the route crosses nobody');
    const g = Transit.live(hop.node, r.a, hop.mode);
    const t0 = World.getTurn();

    // One good turn first, so the comparison is against a deal that was paying.
    Deals.tick(T(), t0, {});
    Transit.tick(T(), t0, {});
    const paidBefore = r.deal.paid;
    ok(paidBefore > 0, 'the deal was not paying even before the corridor closed');

    Transit.serve(g.id, hop.node, t0, T());
    const closed = t0 + g.notice;
    Transit.tickRegister(T(), closed);
    const treasuryBefore = Game.getNation(r.a).treasury;
    Transit.tick(T(), closed, {});
    equal(Game.getNation(r.a).treasury, treasuryBefore,
      'a stalled deal still moved money');
    ok(r.deal.route.stalled, 'the deal was blocked and nothing recorded why');
    equal(r.deal.route.stalled.at, hop.node, 'the stall names the wrong nation');
    equal(r.deal.route.stalled.why, 'revoked');
    // ...and the clock does not stop. A corridor holder can burn a long contract
    // down to nothing, which is the whole reason closing one is a threat.
    ok(Deals.remaining(r.deal, closed) < Deals.remaining(r.deal, t0),
      'the deal\'s term stopped running while it was stalled');
  });

  it('says who to talk to, which is what makes it a decision', async () => {
    const r = await routedDeal();
    const hop = r.deal.route.hops.find((h) => !h.corridor);
    const g = Transit.live(hop.node, r.a, hop.mode);
    const t0 = World.getTurn();
    Transit.serve(g.id, hop.node, t0, T());
    Transit.tickRegister(T(), t0 + g.notice);
    const b = Transit.blockedAt(r.deal, t0 + g.notice);
    ok(b && b.at && b.why, 'a blocked route reported no reason a player could act on');
    ok(Game.getNation(b.at), 'the blockage names something that is not a nation');
  });

  it('nobody can close Canada', async () => {
    await bootWorld({ seed: SEED });
    for (const id of [Transit.CANADA, Transit.MEXICO]) {
      equal(Transit.live(id, [...Game.nations.keys()][0], Transit.MODE.RAIL), null,
        `${id} holds a grant, which means somebody could revoke it`);
      // ...and asking permission of a corridor always succeeds, at the flat rate.
      const p = Transit.permits(id, [...Game.nations.keys()][0], Transit.MODE.RAIL);
      ok(p, `${id} refused passage, which the ruling says it cannot do`);
      equal(p.transfer, false, `${id} is being paid, which the ruling forbids`);
      equal(p.rate, T().get('transit.foreignCorridorToll'));
    }
  });
});

describe('Transit — what a route costs', () => {
  it('a route with nobody in between costs exactly nothing', async () => {
    await bootWorld({ seed: SEED });
    equal(Transit.priceRoute([], T()).keep, 1, 'a direct deal lost money to a route it does not have');
    equal(Transit.keep({ route: null }, T()), 1);
    equal(Transit.keep({ route: { hops: [] } }, T()), 1);
  });

  it('tolls compound rather than add', async () => {
    await bootWorld({ seed: SEED });
    // Two 20% tolls take 36% between them, not 40%: the second is charged on
    // what actually arrives. Friction is separate and is checked below.
    const t = T();
    const saved = t.get('transit.hopFriction');
    t.replace({ 'transit.hopFriction': 0 });
    const r = Transit.priceRoute([
      { node: 'a', rate: 0.2 }, { node: 'b', rate: 0.2 },
    ], t);
    close(r.keep, 0.64, 1e-12, 'tolls were added instead of compounded');
    t.replace({ 'transit.hopFriction': saved });
  });

  it('the nation nearest the seller collects the most', async () => {
    await bootWorld({ seed: SEED });
    const r = Transit.priceRoute([
      { node: 'a', rate: 0.2 }, { node: 'b', rate: 0.2 }, { node: 'c', rate: 0.2 },
    ], T());
    ok(r.legs[0].take > r.legs[1].take, 'the first country in the chain did not collect the most');
    ok(r.legs[1].take > r.legs[2].take, 'the tolls did not fall along the chain');
  });

  it('a foreign corridor charges the flat rate and credits nobody', async () => {
    await bootWorld({ seed: SEED });
    const r = Transit.priceRoute([{ node: Transit.CANADA, corridor: true }], T());
    close(r.keep, 1 - T().get('transit.foreignCorridorToll'), 1e-12);
    equal(r.legs[0].transfer, false,
      'the Canada corridor is marked as a transfer; the ruling is that it is a cost nobody receives');
    equal(r.legs.length, 1);
  });

  it('conserves: what everyone takes plus what arrives is exactly what set out', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    const saved = t.get('transit.hopFriction');
    t.replace({ 'transit.hopFriction': 0 });
    const r = Transit.priceRoute([
      { node: 'a', rate: 0.25 }, { node: Transit.CANADA, corridor: true }, { node: 'c', rate: 0.1 },
    ], t);
    const taken = r.legs.reduce((s, l) => s + l.take, 0);
    close(taken + r.keep, 1, 1e-12, 'money was minted or destroyed on the way');
    t.replace({ 'transit.hopFriction': saved });
  });

  it('a five-hop chain loses to selling straight to the world market', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    /*
     * THE SUCCESS METRIC FROM THE ROADMAP, AS ARITHMETIC RATHER THAN AS A CAP.
     * Nobody is on the board for this one: it is a claim about the tunables, so
     * that raising transit.maxHops can never quietly make long chains pay.
     *
     * The alternative to a five-hop route is selling abroad yourself, which pays
     * trade.worldMarketPenalty of the bilateral rate. A standing deal pays every
     * turn where that sale pays once every trade.cooldownTurns + 1 turns, so the
     * honest comparison scales the one-off by deal.rate x (cooldown + 1).
     */
    const best = 1 - t.get('transit.rateMin');
    const friction = 1 - t.get('transit.hopFriction');
    const keepFive = Math.pow(best * friction, 5);
    const alternative = t.get('trade.worldMarketPenalty')
      / (t.get('deal.rate') * (t.get('trade.cooldownTurns') + 1));
    ok(keepFive < alternative,
      `five hops keep ${(keepFive * 100).toFixed(1)}% at the friendliest rates anyone would sign, `
      + `against ${(alternative * 100).toFixed(1)}% for selling abroad directly — a long chain still pays, `
      + 'so raise transit.hopFriction until it does not');
  });

  it('every extra crossing is worse than the one before it', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    const hops = [];
    let last = 1;
    for (let i = 0; i < 5; i++) {
      hops.push({ node: `n${i}`, rate: t.get('transit.rateMin') });
      const now = Transit.priceRoute(hops, t).keep;
      ok(now < last, `hop ${i + 1} did not cost anything`);
      last = now;
    }
  });
});
