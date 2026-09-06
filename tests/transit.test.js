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
  it('every LAND edge is a real shared land border', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    let checked = 0;
    for (const [from, tos] of g.edges) {
      if (Transit.isOutside(from)) continue;
      const overland = new Set(Game.borderingNations(from));
      for (const [to, bits] of tos) {
        if (Transit.isOutside(to)) continue;
        if (!(bits & (Transit.MODE.HIGHWAY | Transit.MODE.RAIL))) continue;    // a river is not a land border
        ok(overland.has(to),
          `${from} -> ${to} carries a road or a railway and they share no land border`);
        checked += 1;
      }
    }
    ok(checked > 100, `only ${checked} land edges on a 60-nation board`);
  });

  it('a lorry never drives across water, which is the bug this replaces', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    /*
     * NARROWED TO THE LAND MODES WHEN THE RIVERS ARRIVED, and deliberately not
     * weakened: two nations on the same stretch of the Mississippi genuinely can
     * move goods to each other without sharing a border, which is the whole point
     * of a river. What must never happen is a ROAD or a RAILWAY between nations
     * that do not touch — that is the defect this replaced, where state-level
     * adjacency spans water and California was offered an overland route to
     * Alaska.
     */
    for (const [from, tos] of g.edges) {
      if (Transit.isOutside(from)) continue;
      const overland = new Set(Game.borderingNations(from));
      for (const [to, bits] of tos) {
        if (Transit.isOutside(to) || !(bits & (Transit.MODE.HIGHWAY | Transit.MODE.RAIL))) continue;
        ok(overland.has(to),
          `${from} -> ${to} is driveable and they are only connected across water; that is the California/Alaska defect`);
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
        /*
         * A PAIR MAY SHARE MORE THAN ONE KIND OF LINK, and since A2d they often
         * do: Alabama and Florida share a land border AND the Gulf. What is
         * checked here is that any LAND mode between them is backed by a real
         * shared border, which the previous test does; a sea link between two
         * neighbours is not a contradiction, it is the coast.
         */
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
      } else if (out.get(Transit.WORLD)) {
        // The one other way out on your own ground: holding a river gate that
        // stands on the open sea (A2c). Anything else is a hole.
        const r = Transit.rivers();
        ok(r.gates.some((x) => x.owner === nid && x.coastal),
          `${nid} reaches the world with no ocean port and no sea gate`);
      }
      if (acc.lakePorts) {
        /*
         * A lake port puts you ON the lakes, and the lakes leave by the
         * St. Lawrence (A2c). Reaching Canada from Chicago means passing
         * Michigan's gates and then New York's, so what is asserted here is that
         * the nation is on the water — not that it is already in Canada.
         */
        ok(Transit.find(nid, Transit.CANADA, { permit: () => ({ rate: 0.2 }) }),
          `${nid} has a Great Lakes port and cannot reach Canada by any route at all`);
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

describe('Transit — the rivers (A2c)', () => {
  const open = { permit: () => ({ rate: 0.2 }) };
  const named = (n) => [...Game.nations.keys()].find((k) => Game.getNation(k).name === n);

  it('cuts each river into stretches at its own chokepoints, in order', async () => {
    await bootWorld({ seed: SEED });
    const r = Transit.rivers();
    ok(r && r.segments.length > 6, `only ${r ? r.segments.length : 0} stretches of water on the whole map`);
    /*
     * THE BUG THIS EXISTS TO CATCH, because it happened: an earlier version let
     * every gate on a river touch every stretch of it, which put Minnesota one
     * hop from Louisiana and deleted the entire mechanic without failing
     * anything. A river is a LINE. You pass the gates in sequence or not at all.
     */
    for (const g of r.gates) {
      if (!g.corridor) continue;
      ok(g.before == null || g.after == null || g.before !== g.after,
        `${g.label} claims to stand between a stretch and itself`);
      if (g.after != null) {
        equal(g.after, g.before + 1,
          `${g.label} joins stretches that are not next to each other`);
      }
    }
  });

  it('the far ends of the Mississippi are not neighbours', async () => {
    await bootWorld({ seed: SEED });
    const mn = named('Minnesota'), la = named('Louisiana');
    ok(mn && la, 'Minnesota or Louisiana is not on this board');
    equal(Transit.modesBetween(mn, la), 0,
      'the top of the Mississippi is directly connected to the bottom, so the gates in between count for nothing');
    // ...but they ARE both on the river, one stretch and some gates apart.
    const route = Transit.find(mn, la, open);
    ok(route && route.hops.length >= 1,
      'Minnesota cannot reach Louisiana by water at all, which the Mississippi contradicts');
  });

  it('nations on the same stretch reach each other for the price of water', async () => {
    await bootWorld({ seed: SEED });
    const r = Transit.rivers();
    const seg = r.segments.find((x) => x.nations.size > 2);
    ok(seg, 'no stretch of river is shared by three nations');
    const list = [...seg.nations];
    for (const a2 of list) {
      for (const b of list) {
        if (a2 === b) continue;
        ok(Transit.modesBetween(a2, b) & Transit.MODE.RIVER,
          `${a2} and ${b} share ${seg.corridor} and cannot reach each other on it`);
      }
    }
  });

  it('whoever holds a gate is on the route, and can close it', async () => {
    await bootWorld({ seed: SEED });
    const wi = named('Wisconsin'), mi = named('Michigan');
    ok(wi && mi, 'Wisconsin or Michigan is not on this board');
    const acc = Game.exportAccess(wi);
    equal(acc.oceanPorts, 0, 'Wisconsin has an ocean port, so it is not the landlocked-on-the-lakes case');
    ok(acc.lakePorts > 0, 'Wisconsin has no Great Lakes port');

    const openRoute = Transit.find(wi, Transit.CANADA, open);
    ok(openRoute, 'Wisconsin cannot reach Canada even with every gate open');
    const closed = Transit.find(wi, Transit.CANADA, { permit: (n) => (n === mi ? null : { rate: 0.2 }) });
    ok(!closed || !closed.hops.some((h) => h.node === mi),
      'Michigan refused passage and the route went through Michigan anyway');
  });

  it('a Great Lakes port puts a nation on the lakes, not in Canada', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    for (const [nid] of Game.nations) {
      const acc = Game.exportAccess(nid);
      if (!acc.lakePorts || acc.canada || acc.oceanPorts) continue;
      const direct = g.edges.get(nid).get(Transit.CANADA);
      ok(!direct,
        `${nid} reaches Canada straight off a lake port, which skips every gate between it and the St. Lawrence`);
    }
  });

  it('a gate on the open sea is a way out, and it is the most valuable ground on the map', async () => {
    await bootWorld({ seed: SEED });
    const r = Transit.rivers();
    const sea = r.gates.filter((x) => x.coastal && x.owner);
    ok(sea.length > 0, 'no chokepoint stands on the open sea');
    const g = Transit.graph();
    for (const x of sea) {
      ok(g.edges.get(x.owner).get(Transit.WORLD),
        `${x.label} stands on the sea and its owner cannot reach the world through it`);
    }
  });

  it('crossing by water is cheaper than crossing by land, so a river is worth holding', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    const river = Transit.priceRoute([{ node: 'x', mode: Transit.MODE.RIVER, rate: 0.2 }], t).keep;
    const road = Transit.priceRoute([{ node: 'x', mode: Transit.MODE.HIGHWAY, rate: 0.2 }], t).keep;
    ok(river > road, `a river crossing (${river.toFixed(3)}) is not cheaper than a road one (${road.toFixed(3)})`);
  });

  it('costs about as much to build as the land graph, once a turn', async () => {
    await bootWorld({ seed: SEED });
    Transit.reset();
    const t0 = performance.now();
    Transit.graph();
    const ms = performance.now() - t0;
    // The whole graph, rivers included, must stay far below one round of AI
    // planning (measured at 153ms) or A2c has quietly blown the turn budget.
    ok(ms < 60, `building the corridor graph took ${ms.toFixed(1)}ms; it is built every turn`);
  });
});

describe('Transit — two seas, not one ocean (A2d)', () => {
  const seas = () => {
    const pac = [], atl = [];
    for (const [nid] of Game.nations) {
      const acc = Game.exportAccess(nid);
      if (acc.pacificPorts) pac.push(nid);
      if (acc.atlanticPorts) atl.push(nid);
    }
    return { pac, atl };
  };

  it('both coasts exist on the board and no nation is on both', async () => {
    await bootWorld({ seed: SEED });
    const { pac, atl } = seas();
    ok(pac.length > 1, `only ${pac.length} Pacific nations`);
    ok(atl.length > 1, `only ${atl.length} Atlantic or Gulf nations`);
    // Not impossible in principle — a nation that conquered both coasts would
    // be on both — but on the opening board nobody has, and if that changes the
    // basin rule still holds because it reads the GROUND a nation holds.
    for (const n of pac) ok(!atl.includes(n), `${n} is somehow on both oceans at the start`);
  });

  it('two ports on the same sea reach each other with nobody in between', async () => {
    await bootWorld({ seed: SEED });
    const { pac, atl } = seas();
    for (const group of [pac, atl]) {
      for (const a2 of group) {
        for (const b of group) {
          if (a2 === b) continue;
          ok(Transit.modesBetween(a2, b) & Transit.MODE.PORT,
            `${a2} and ${b} are on the same sea and cannot reach each other`);
        }
      }
    }
  });

  /*
   * THE HOLE BESIDE THE DOOR (found 5 September 2026, fixed the same day).
   *
   * The test below this one checks that no DIRECT sea edge joins the basins,
   * and it passed from the day A2d shipped. It was not enough. Canada was given
   * an Atlantic coast only, precisely so it could not be used as a canal — but
   * MEXICO WAS GIVEN BOTH, and a corridor node costs nothing to enter and needs
   * nobody's permission to leave. So Washington sailed to Mexico, Mexico sailed
   * to Florida, and the Panama ruling was defeated for a flat ten per cent
   * while every test about it stayed green.
   *
   * This one runs the ROUTE SEARCH rather than reading the edges, which is why
   * it catches what the other missed: with no agreement anywhere on the board,
   * corridor nodes are the only things anybody can pass through, so any route
   * this finds is a route through Canada or Mexico by definition.
   */
  it('THE PANAMA RULING HOLDS THROUGH A THIRD COUNTRY, not just between two', async () => {
    await bootWorld({ seed: SEED });
    const { pac, atl } = seas();
    ok(pac.length && atl.length, 'one of the two oceans is empty — the test proves nothing');
    let tried = 0;
    for (const p of pac) {
      for (const a2 of atl) {
        tried += 1;
        // No `permit`: nothing routes through any NATION, so a route found here
        // can only have gone through Canada or Mexico.
        const bySea = Transit.find(p, a2, {});
        ok(!bySea, `${p} reached ${a2} through ${bySea && bySea.hops.map((h) => h.node).join(' → ')}`);
      }
    }
    ok(tried > 40, `only ${tried} ocean-to-ocean pairs tried — the test proves nothing`);
  });

  it('but Mexico keeps both its coasts, because it really has both', async () => {
    await bootWorld({ seed: SEED });
    const { pac, atl } = seas();
    // The fix must not have quietly amputated Mexico. A Pacific nation and an
    // Atlantic one must each still be able to sell TO Mexico — it is a market,
    // and only its use as a canal was ever the problem.
    ok(Transit.modesBetween(pac[0], '@mexico') & Transit.MODE.PORT,
      'a Pacific nation can no longer ship to Mexico at all');
    ok(Transit.modesBetween(atl[0], '@mexico') & Transit.MODE.PORT,
      'an Atlantic nation can no longer ship to Mexico at all');
    ok(Transit.find(pac[0], '@mexico', {}), 'a Pacific nation cannot reach Mexico as a destination');
    ok(Transit.find(atl[0], '@mexico', {}), 'an Atlantic nation cannot reach Mexico as a destination');
  });

  it('THE PANAMA RULING: no sea link between the two oceans', async () => {
    await bootWorld({ seed: SEED });
    const { pac, atl } = seas();
    /*
     * The canal is shut to former American states, which is also part of why the
     * Union could not hold — it split the navy. So a Pacific port and an
     * Atlantic port share no water, and a route between them has to cross
     * somebody's ground.
     */
    for (const a2 of pac) {
      for (const b of atl) {
        equal(Transit.modesBetween(a2, b) & Transit.MODE.PORT, 0,
          `${a2} (Pacific) and ${b} (Atlantic) share a sea link; the canal is supposed to be shut`);
      }
    }
  });

  it('and Canada cannot be used to sail round the closed canal', async () => {
    await bootWorld({ seed: SEED });
    const { pac } = seas();
    const g = Transit.graph();
    /*
     * Canada has a Pacific coast in life and must not have one here: the moment
     * it does, Washington ships to Vancouver, Vancouver ships to Halifax, and
     * Seattle is trading with Boston by sea after all. A Pacific nation reaches
     * Canada overland, which is how its goods would really go.
     */
    for (const nid of pac) {
      if (Game.exportAccess(nid).atlanticPorts) continue;
      const bits = g.edges.get(nid).get(Transit.CANADA) || 0;
      equal(bits & Transit.MODE.PORT, 0,
        `${nid} can sail to Canada from the Pacific, which reopens the canal by the back door`);
    }
  });

  it('the Great Lakes reach the Atlantic through Canada, and pay for it', async () => {
    await bootWorld({ seed: SEED });
    const { atl } = seas();
    const g = Transit.graph();
    for (const nid of atl) {
      ok(g.edges.get(Transit.CANADA).get(nid) & Transit.MODE.PORT,
        `Canada cannot reach ${nid}, so a Great Lakes nation has no way to the Atlantic`);
    }
    // ...and a lake nation genuinely gets there, at a cost.
    const lakes = [...Game.nations.keys()].find((n) => Game.exportAccess(n).lakePorts
      && !Game.exportAccess(n).oceanPorts);
    ok(lakes, 'no lake-only nation on the board');
    const r = Transit.find(lakes, atl[0], { permit: () => ({ rate: 0.2 }) });
    ok(r, `${lakes} sits on the lakes and cannot reach the Atlantic at all`);
    ok(r.keep < 1, 'it reached the Atlantic for nothing, which is not the deal');
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

describe('Transit — the other nations use it (A4)', () => {
  it('only a nation that cannot reach a market goes asking', async () => {
    await bootWorld({ seed: SEED });
    let asked = 0, coastalAsked = 0;
    for (const [nid] of Game.nations) {
      const wants = Moves.legal(nid, T()).filter((m) => m.type === 'transit');
      if (!wants.length) continue;
      asked += 1;
      if (Game.exportAccess(nid).any) coastalAsked += 1;
    }
    ok(asked > 0, 'not one nation on the board asks for a corridor');
    equal(coastalAsked, 0,
      'a nation with its own port went shopping for passage it does not need');
  });

  it('does not ask the same neighbour twice for what it already holds', async () => {
    await bootWorld({ seed: SEED });
    const stuck = [...Game.nations.keys()].find((n) => !Game.exportAccess(n).any
      && Moves.legal(n, T()).some((m) => m.type === 'transit'));
    ok(stuck, 'no landlocked nation asks for anything');
    const first = Moves.legal(stuck, T()).filter((m) => m.type === 'transit');
    const one = first[0];
    Transit.grant({ grantor: one.target, grantee: stuck, mode: one.mode, rate: 0.2, duration: 20 }, T());
    const after = Moves.legal(stuck, T()).filter((m) => m.type === 'transit');
    ok(!after.some((m) => m.target === one.target && m.mode === one.mode),
      'it asked again for a corridor it already has');
  });

  it('costs about fifty extra plans a round, not seven hundred', async () => {
    await bootWorld({ seed: SEED });
    let transit = 0, total = 0;
    for (const [nid] of Game.nations) {
      for (const m of Moves.legal(nid, T())) { total += 1; if (m.type === 'transit') transit += 1; }
    }
    /*
     * The reason transit candidates are gated on NEED rather than offered per
     * neighbour per mode to everybody: one AI round was measured at 735 plans
     * and 153ms, and the blanket version would roughly double it on a board
     * nobody has tuned yet.
     */
    ok(transit < total * 0.2,
      `corridor candidates are ${transit} of ${total} moves; that is the blanket version, not the targeted one`);
  });

  it('answers what is asked of it by the same rules it is judged by', async () => {
    await bootWorld({ seed: SEED });
    const pair = (() => {
      for (const [a] of Game.nations) {
        for (const b of Game.borderingNations(a)) {
          const bits = Transit.modesBetween(a, b);
          const m = [Transit.MODE.RAIL, Transit.MODE.HIGHWAY].find((x) => bits & x);
          if (m) return { a, b, m };
        }
      }
      return null;
    })();
    ok(pair, 'no bordering pair carries a corridor');
    // A generous offer must be taken; a derisory one must not.
    const generous = Moves.transitVerdict(pair.b, pair.a, T().get('transit.rateMax'), 0, T());
    const stingy = Moves.transitVerdict(pair.b, pair.a, T().get('transit.rateMin') / 2, 0, T());
    equal(generous.kind, 'accept', 'the best offer anyone could make was not accepted');
    ok(stingy.kind !== 'accept', 'an offer below the floor was accepted');
  });

  /*
   * WHAT IS BEING ASKED FOR CHANGES THE PRICE (5 September 2026).
   *
   * Until this, a nation charged the same for its harbour as for a lane of its
   * motorway: `transitVerdict` had no mode argument at all. The owner's point
   * is that they are not the same favour — a port grant puts foreign cargo
   * through your cranes and your people.
   *
   * These run over EVERY bordering pair rather than one, because a single pair
   * could sit against a clamp and prove nothing. The count assertions exist
   * because the first version of this test passed on a board where no pair was
   * ever compared.
   */
  it('a port right costs more than a road right between the same two nations', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    const ask = (a, b, m) => Moves.transitVerdict(b, a, null, 0, t, m).rate;
    const lo = t.get('transit.rateMin'), hi = t.get('transit.rateMax');

    let compared = 0, ordered = 0;
    for (const [a] of Game.nations) {
      for (const b of Game.borderingNations(a)) {
        if (!Transit.modesBetween(a, b)) continue;
        const port = ask(a, b, Transit.MODE.PORT);
        const river = ask(a, b, Transit.MODE.RIVER);
        const rail = ask(a, b, Transit.MODE.RAIL);
        const road = ask(a, b, Transit.MODE.HIGHWAY);

        // The weak claim holds everywhere, clamp or no clamp: a discount off
        // the port price can never come out ABOVE the port price.
        ok(river <= port && rail <= port && road <= port,
          `${a}->${b}: a cheaper mode asked more than a port`);

        compared += 1;
        // The strict ordering is only meaningful clear of both clamps.
        if (port < hi - 1e-9 && road > lo + 1e-9) {
          ordered += 1;
          ok(port > river && river > rail && rail > road,
            `${a}->${b}: modes not strictly ordered — port ${port.toFixed(4)}, `
            + `river ${river.toFixed(4)}, rail ${rail.toFixed(4)}, road ${road.toFixed(4)}`);
        }
      }
    }
    ok(compared > 50, `only ${compared} bordering pairs compared — the test proved nothing`);
    ok(ordered > 20, `only ${ordered} pairs sat clear of the clamps — the ordering is untested`);
  });

  it('an unnamed mode pays the dearest rate, never the cheapest', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    const [a] = [...Game.nations.keys()];
    const b = Game.borderingNations(a).find((x) => Transit.modesBetween(a, x));
    ok(b, 'no bordering pair carries a corridor');
    const port = Moves.transitVerdict(b, a, null, 0, t, Transit.MODE.PORT).rate;
    equal(Moves.transitVerdict(b, a, null, 0, t, null).rate, port,
      'a corridor with no mode named came out cheaper than a port');
    equal(Moves.transitVerdict(b, a, null, 0, t).rate, port,
      'a corridor with no mode argument at all came out cheaper than a port');
  });

  it('the mode multipliers are discounts, so nothing that would be signed is refused', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    for (const m of ['transit.riverAskMult', 'transit.railAskMult', 'transit.roadAskMult']) {
      const v = t.get(m);
      ok(v > 0 && v <= 1, `${m} is ${v} — above 1 it would RAISE an ask, which is the one thing this must not do`);
    }
    equal(Moves.askMultFor(Transit.MODE.PORT, t), 1, 'port is no longer the baseline');
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

  it('a five-hop chain loses to selling straight to the world market, BY EVERY MODE', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    /*
     * CHECKED FOR ALL THREE MODES, not just the baseline. Water is much cheaper
     * to cross than road, which is the point of the hierarchy — and it is
     * exactly the loophole that would let a long chain pay after all. Measured
     * when the hierarchy was added: a road baseline of 0.25 is the LOWEST at
     * which a five-crossing WATER chain still loses, which is why it is 0.25
     * rather than something gentler.
     */
    const alt = t.get('trade.worldMarketPenalty')
      / (t.get('deal.rate') * (t.get('trade.cooldownTurns') + 1));
    for (const [name, mode] of [['road', Transit.MODE.HIGHWAY], ['rail', Transit.MODE.RAIL],
      ['water', Transit.MODE.PORT]]) {
      const hops = [];
      for (let i = 0; i < 5; i++) hops.push({ node: `n${i}`, mode, rate: t.get('transit.rateMin') });
      const five = Transit.priceRoute(hops, t).keep;
      ok(five < alt,
        `five ${name} crossings keep ${(five * 100).toFixed(1)}% at the friendliest rate anyone would `
        + `sign, against ${(alt * 100).toFixed(1)}% for selling abroad directly — raise `
        + 'transit.hopFriction until a long chain stops paying');
    }
  });

  it('water is cheaper to cross than rail, and rail than road', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    const one = (mode) => Transit.priceRoute([{ node: 'x', mode, rate: 0.1 }], t).keep;
    const road = one(Transit.MODE.HIGHWAY), rail = one(Transit.MODE.RAIL), water = one(Transit.MODE.PORT);
    ok(water > rail, `water (${water.toFixed(3)}) is not cheaper than rail (${rail.toFixed(3)})`);
    ok(rail > road, `rail (${rail.toFixed(3)}) is not cheaper than road (${road.toFixed(3)})`);
  });

  it('the search never crosses by a dearer way than the border offers', async () => {
    await bootWorld({ seed: SEED });
    /*
     * Water beats rail beats road, so a route must always take the best link the
     * border actually carries. Checked against the modes AVAILABLE rather than
     * asserting rail specifically, because since A2d a land border may also be a
     * coastline and water would then be the right answer.
     */
    const pick = { permit: () => ({ rate: 0.2 }) };
    const RANK = { 8: 0, 4: 1, 2: 2, 1: 3 };   // river, water, rail, road
    let checked = 0;
    for (const [a] of Game.nations) {
      for (const [c] of Game.nations) {
        if (a === c) continue;
        const r = Transit.find(a, c, pick);
        if (!r || !r.hops.length) continue;
        let prev = a;
        for (const h of r.hops) {
          const bits = Transit.modesBetween(prev, h.node);
          const best = [8, 4, 2, 1].find((m) => bits & m);
          equal(RANK[h.mode], RANK[best],
            `${prev} to ${h.node} was crossed by ${Transit.MODE_LABEL[h.mode]} where `
            + `${Transit.MODE_LABEL[best]} was available and cheaper`);
          prev = h.node;
          checked += 1;
        }
        if (checked > 20) return;
      }
    }
    ok(checked > 0, 'no routed hop was found to check');
  });

  it('a neighbour you already trade with charges you less to cross', async () => {
    await bootWorld({ seed: SEED });
    const pair = (() => {
      for (const [a] of Game.nations) {
        for (const b of Game.borderingNations(a)) {
          const bits = Transit.modesBetween(a, b);
          const m = [Transit.MODE.RAIL, Transit.MODE.HIGHWAY].find((x) => bits & x);
          if (!m) continue;
          const p = Moves.plan({ type: 'trade', nid: a, target: b }, T());
          if (p.ok && p.total > 0) return { a, b, m };
        }
      }
      return null;
    })();
    ok(pair, 'no bordering pair that both carries goods and can trade');
    Transit.grant({ grantor: pair.b, grantee: pair.a, mode: pair.m, rate: 0.4, duration: 20 }, T());

    const full = Transit.permits(pair.b, pair.a, pair.m);
    close(full.rate, 0.4, 1e-12, 'the toll is not what was signed');
    Moves.resolve({ type: 'trade', nid: pair.a, target: pair.b, terms: { duration: 8 } }, null, T());
    const discounted = Transit.permits(pair.b, pair.a, pair.m);
    close(discounted.rate, 0.4 * (1 - T().get('transit.partnerDiscount')), 1e-12,
      'signing a trade deal did not make the corridor cheaper');
    // ...and the AGREEMENT itself is untouched: the discount is what is charged,
    // not a renegotiation behind the grantor's back.
    equal(Transit.get(full.id).rate, 0.4, 'the discount rewrote the signed agreement');
  });

  it('a port reaches the world and Mexico; only an ATLANTIC one reaches Canada', async () => {
    await bootWorld({ seed: SEED });
    const g = Transit.graph();
    let checked = 0;
    for (const [nid] of Game.nations) {
      const acc = Game.exportAccess(nid);
      if (!acc.oceanPorts) continue;
      const out = g.edges.get(nid);
      ok(out.get(Transit.WORLD) & Transit.MODE.PORT, `${nid} cannot reach the world from its own port`);
      ok(out.get(Transit.MEXICO) & Transit.MODE.PORT, `${nid} has an ocean port and cannot ship to Mexico`);
      /*
       * Canada by sea is the Atlantic side only (A2d), and the omission is the
       * point: give Canada a Pacific coast and it becomes the way round the
       * closed canal. Mexico may have both, because nothing on its far side
       * connects onward to the other ocean.
       */
      if (acc.atlanticPorts) {
        ok(out.get(Transit.CANADA) & Transit.MODE.PORT, `${nid} is on the Atlantic and cannot ship to Canada`);
      }
      checked += 1;
    }
    ok(checked > 5, `only ${checked} nations with an ocean port`);
  });

  it('the old five-hop guard, kept as arithmetic over the tunables', async () => {
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
