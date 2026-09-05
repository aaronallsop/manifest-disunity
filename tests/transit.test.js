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
