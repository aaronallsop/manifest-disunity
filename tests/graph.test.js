/*
 * M2.4 — the Area adjacency graph, in CSR form, built once.
 *
 * Two things are being tested and they are different. The first is that the
 * graph is a correct graph: symmetric, no self-loops, no duplicates, sorted.
 * The second is that swapping it in did not change what the GAME sees — every
 * Area has the same neighbours it had when the answer was recomputed from
 * `adjacency.json` on every query. The second is the one that matters, because
 * a fast graph that disagrees with the map is worse than a slow one.
 *
 * The one deliberate behaviour change is ORDER: neighbour lists are sorted by
 * node index rather than left in the key order of adjacency.json. That order
 * decided `argmax` ties and component traversal, so a re-bake that emitted keys
 * differently used to be a silent replay divergence.
 */
import { describe, it, ok, equal, deepEqual } from './harness.js';
import { bootWorld, loadData } from './world-fixture.js';
import * as GraphMod from '../js/graph.js';

const SEED = 20260829;

describe('CSR graph — pure structure', () => {
  const line = () => GraphMod.build(['a', 'b', 'c', 'd'], (id) =>
    ({ a: ['b'], b: ['c'], c: ['d'], d: [] }[id]));

  it('symmetrises: an edge declared one way exists both ways', () => {
    const g = line();
    equal(g.n, 4);
    deepEqual([...g.neighborIds('b')], ['a', 'c']);
    deepEqual([...g.neighborIds('d')], ['c'], 'the d->c direction was never declared');
    equal(g.m, 6, 'three undirected edges should be six directed entries');
  });

  it('drops self-loops, unknown ids and duplicates', () => {
    const g = GraphMod.build(['a', 'b'], (id) =>
      ({ a: ['a', 'b', 'b', 'zz'], b: ['a'] }[id]));
    deepEqual([...g.neighborIds('a')], ['b']);
    equal(g.degree(g.indexOf('a')), 1);
    equal(g.m, 2);
  });

  it('sorts each row by index, so order is a property of the graph', () => {
    // declared in reverse; the rows must still come out ascending
    const g = GraphMod.build(['a', 'b', 'c'], (id) =>
      ({ a: ['c', 'b'], b: ['c'], c: [] }[id]));
    const row = g.neighbors(g.indexOf('a'));
    ok(row[0] < row[1], 'the neighbour row is not sorted');
    deepEqual([...g.neighborIds('a')], ['b', 'c']);
  });

  it('start[] is a valid CSR offset table', () => {
    const g = line();
    equal(g.start.length, g.n + 1);
    equal(g.start[0], 0);
    equal(g.start[g.n], g.m);
    for (let i = 0; i < g.n; i++) ok(g.start[i] <= g.start[i + 1], `start is not monotonic at ${i}`);
  });

  it('hasEdge agrees with the rows it binary-searches', () => {
    const g = line();
    for (let i = 0; i < g.n; i++) {
      const row = new Set(g.neighbors(i));
      for (let j = 0; j < g.n; j++) equal(g.hasEdge(i, j), row.has(j), `hasEdge(${i},${j})`);
    }
  });

  it('an unknown id is -1 and an empty neighbour list, not a throw', () => {
    const g = line();
    equal(g.indexOf('zz'), -1);
    deepEqual([...g.neighborIds('zz')], []);
  });

  it('neighborIds hands back a frozen shared array', () => {
    const g = line();
    const a = g.neighborIds('b'), b = g.neighborIds('b');
    ok(a === b, 'neighborIds allocated a second array for the same node');
    ok(Object.isFrozen(a), 'the shared array is writable; one caller could corrupt every other');
  });

  it('components splits a disconnected set and respects a key', () => {
    // a-b   c-d   (two components), then split a-b by key
    const g = GraphMod.build(['a', 'b', 'c', 'd'], (id) => ({ a: ['b'], b: [], c: ['d'], d: [] }[id]));
    const all = [0, 1, 2, 3];
    equal(g.components(all).length, 2);
    equal(g.components(all).map((c) => c.length).join(','), '2,2');
    const keyed = g.components(all, (i) => g.idAt(i)); // every node its own key
    equal(keyed.length, 4, 'the key did not split the components');
    // a subset of one component is still one component
    equal(g.components([0, 1]).length, 1);
    equal(g.components([0, 2]).length, 2, 'two unconnected nodes merged into one component');
  });

  it('components ignores edges that leave the subset', () => {
    // a-b-c: taking {a, c} must give two components, not one via b
    const g = GraphMod.build(['a', 'b', 'c'], (id) => ({ a: ['b'], b: ['c'], c: [] }[id]));
    equal(g.components([g.indexOf('a'), g.indexOf('c')]).length, 2,
      'a component search walked through a node outside the set');
  });

  it('frontier returns what touches the set but is not in it', () => {
    const g = GraphMod.build(['a', 'b', 'c', 'd'], (id) => ({ a: ['b'], b: ['c'], c: ['d'], d: [] }[id]));
    const inside = g.mask();
    inside[g.indexOf('a')] = 1; inside[g.indexOf('b')] = 1;
    const f = [...g.frontier(inside)].map((i) => g.idAt(i));
    deepEqual(f, ['c'], 'the frontier is wrong');
    // a fully-enclosed set has no frontier
    const allIn = g.mask().fill(1);
    equal(g.frontier(allIn).length, 0);
  });

  it('bfs walks outward in distance order and honours the filter', () => {
    const g = GraphMod.build(['a', 'b', 'c', 'd'], (id) => ({ a: ['b'], b: ['c'], c: ['d'], d: [] }[id]));
    const order = [...g.bfs([g.indexOf('a')])].map((i) => g.idAt(i));
    deepEqual(order, ['a', 'b', 'c', 'd']);
    const blocked = [...g.bfs([g.indexOf('a')], (i) => g.idAt(i) !== 'c')].map((i) => g.idAt(i));
    deepEqual(blocked, ['a', 'b'], 'the filter did not stop the walk');
  });
});

describe('The live Area graph', () => {
  it('is built over every Area exactly once', async () => {
    await bootWorld({ seed: SEED });
    const g = Game.graph();
    equal(g.n, Object.keys(Game.county).length, 'the graph and the model disagree on the Area count');
    equal(new Set(g.ids).size, g.n, 'an Area appears twice in the graph');
    for (const f in Game.county) ok(Game.nodeOf(f) >= 0, `Area ${f} is not in the graph`);
  });

  it('resolves a merged member county to the Area that absorbed it', async () => {
    await bootWorld({ seed: SEED });
    let checked = 0;
    for (const aid in Game.county) {
      const members = Game.areaCounties(aid);
      if (members.length < 2) continue;
      for (const m of members) {
        if (m === aid) continue;
        equal(Game.nodeOf(m), Game.nodeOf(aid),
          `member county ${m} resolves to a different node than its Area ${aid}`);
        checked++;
      }
      if (checked > 200) break;
    }
    ok(checked > 0, 'no merged Areas to test with');
  });

  it('is symmetric and self-loop free across all 1,676 Areas', async () => {
    await bootWorld({ seed: SEED });
    const g = Game.graph();
    let asym = 0, self = 0, unsorted = 0;
    for (let i = 0; i < g.n; i++) {
      let prev = -1;
      for (const j of g.neighbors(i)) {
        if (j === i) self++;
        if (j <= prev) unsorted++;
        prev = j;
        if (!g.hasEdge(j, i)) asym++;
      }
    }
    equal(self, 0, `${self} Areas border themselves`);
    equal(asym, 0, `${asym} edges exist in one direction only`);
    equal(unsorted, 0, `${unsorted} rows are not sorted ascending`);
  });

  it('says the same thing the old per-query walk said', async () => {
    // The reference implementation, verbatim from the pre-M2.4 game.js.
    const { raw } = await bootWorld({ seed: SEED });
    const adjacency = raw.adjacency;
    const reference = (aid) => {
      const out = new Set();
      for (const m of Game.areaCounties(aid)) {
        for (const nb of adjacency.county[m] || []) {
          const n = Game.areaIdOf(nb);
          if (n !== aid) out.add(n);
        }
      }
      return out;
    };
    let compared = 0, differed = [];
    for (const aid in Game.county) {
      const was = reference(aid);
      const now = new Set(Game.countyNeighbors(aid));
      // the graph symmetrises, so it may hold edges the one-directional walk
      // missed; it must never LOSE one
      for (const x of was) if (!now.has(x)) differed.push(`${aid} lost ${x}`);
      compared++;
    }
    equal(differed.length, 0, `the graph dropped ${differed.length} edges: ${differed.slice(0, 5)}`);
    ok(compared > 1600, `only ${compared} Areas compared`);
  });

  it('the symmetrisation is not hiding a broken bake', async () => {
    // If adjacency.json were badly one-directional the fix above would mask it,
    // so measure how much repair the graph is actually doing.
    const { raw } = await bootWorld({ seed: SEED });
    const adjacency = raw.adjacency;
    let declared = 0, added = 0;
    const g = Game.graph();
    for (const aid in Game.county) {
      const was = new Set();
      for (const m of Game.areaCounties(aid)) {
        for (const nb of adjacency.county[m] || []) {
          const n = Game.areaIdOf(nb);
          if (n !== aid) was.add(n);
        }
      }
      declared += was.size;
      for (const x of Game.countyNeighbors(aid)) if (!was.has(x)) added++;
    }
    ok(added / declared < 0.01,
      `the graph added ${added} of ${declared} edges (${(added / declared * 100).toFixed(2)}%) ` +
      'by symmetrising; adjacency.json is meaningfully one-directional');
    ok(g.m === declared + added, 'the edge accounting does not add up');
  });

  it('is the mainland plus exactly two islands, each internally whole', async () => {
    // Alaska and Hawaii are SUPPOSED to be separate land components. Land pairs
    // are derived from county adjacency and everything left over in the state
    // table is maritime, so joining Hawaii to California here would tell the
    // game you can march to Honolulu. Three components is the correct answer;
    // what would be wrong is a fourth, or an island that is itself in pieces.
    await bootWorld({ seed: SEED });
    const g = Game.graph();
    const comps = g.components([...Array(g.n).keys()]).sort((a, b) => b.length - a.length);
    const label = comps.map((c) => g.idAt(c[0]).slice(0, 2) + ':' + c.length).join(' ');
    equal(comps.length, 3, `the map is in ${comps.length} land pieces (${label})`);
    ok(comps[0].length > 1600, `the mainland is only ${comps[0].length} Areas`);
    for (const c of comps.slice(1)) {
      const sts = new Set([...c].map((i) => g.idAt(i).slice(0, 2)));
      equal(sts.size, 1, `an island component spans ${[...sts]}`);
      const st = [...sts][0];
      ok(st === '02' || st === '15', `${st} is a land component of its own and should not be`);
      equal(c.length, Game.getNation(st).counties.size,
        `${st} is an island component holding only part of its own state`);
    }
  });

  it('every nation is contiguous at turn 0', async () => {
    // This found four real holes in the bake: the Mackinac Bridge, the
    // Verrazzano-Narrows, the two Aquidneck Island bridges and the Chesapeake
    // Bay Bridge-Tunnel. Census adjacency is shared-polygon-arc adjacency, so a
    // county you can only reach by driving over water has no neighbours at all
    // -- and the splinter rule secedes an Area that is politically distant AND
    // cut off, so Staten Island was one bad roll from leaving on turn 1.
    await bootWorld({ seed: SEED });
    const broken = [];
    for (const [, n] of Game.nations) {
      const comps = Game.components(n.counties, null).sort((a, b) => b.length - a.length);
      if (comps.length > 1) {
        broken.push(n.name + ' (' + comps.map((c) => c.length) + '): ' +
          comps.slice(1).flat().map((f) => Game.county[f].name).join(', '));
      }
    }
    equal(broken.length, 0, 'nations starting in pieces:\n  ' + broken.join('\n  '));
  });

  it('annexTargets is exactly the frontier, and excludes your own soil', async () => {
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '49', '15', '02', '10']) {
      const own = Game.getNation(nid).counties;
      const targets = Game.annexTargets(nid);
      for (const f of targets) {
        ok(!own.has(f), `${nid} was offered its own Area ${f}`);
        ok(Game.countyNeighbors(f).some((nb) => own.has(nb)),
          `${nid} was offered ${f}, which touches none of its Areas`);
      }
      // and nothing that touches it was missed
      let missed = 0;
      for (const f of own) for (const nb of Game.countyNeighbors(f)) {
        if (!own.has(nb) && !targets.has(nb)) missed++;
      }
      equal(missed, 0, `${nid} has ${missed} bordering Areas that were not offered`);
    }
  });
});

describe('The graph is cheap', () => {
  it('holds the whole 1,676-Area graph in flat arrays under 100 KB', async () => {
    await bootWorld({ seed: SEED });
    const g = Game.graph();
    ok(g.bytes() < 100 * 1024,
      `the graph is ${(g.bytes() / 1024).toFixed(1)} KB`);
    ok(g.m / g.n > 3 && g.m / g.n < 10,
      `average degree is ${(g.m / g.n).toFixed(2)}, which is not a plausible county map`);
  });

  it('a neighbour walk allocates nothing', async () => {
    await bootWorld({ seed: SEED });
    const g = Game.graph();
    const a = g.neighbors(10), b = g.neighbors(10);
    ok(a.buffer === g.list.buffer, 'neighbors() copied instead of returning a view');
    ok(b.buffer === g.list.buffer);
    // a full sweep of the graph, the shape every phase wants
    let sum = 0;
    for (let i = 0; i < g.n; i++) for (let k = g.start[i]; k < g.start[i + 1]; k++) sum += g.list[k];
    ok(sum > 0);
  });

  it('is rebuilt from scratch on reset, not carried between worlds', async () => {
    await bootWorld({ seed: SEED });
    const first = Game.graph();
    await bootWorld({ seed: 777 });
    const second = Game.graph();
    ok(first !== second, 'the graph survived a Game.reset(); a stale graph is a stale map');
    equal(first.n, second.n);
  });
});
