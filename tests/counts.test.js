/*
 * M2.1 — the exact-sum share/count conversion, ported from the Python mirror
 * before it was deleted.
 *
 * The property that makes it worth keeping: the counts sum to the population
 * EXACTLY, so "each Area's party counts sum to its population" is an equality
 * rather than an approximation with an undocumented tolerance.
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { countsFromShares, sharesFromCounts, sumCounts } from '../js/counts.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;

describe('Exact-sum counts', () => {
  it('sums to exactly the population, for every share mix', () => {
    const mixes = [
      { d: 41.7, g: 56.9, o: 1.4 },
      { d: 33.3, g: 33.3, o: 33.4 },
      { d: 0, g: 100, o: 0 },
      { d: 50, g: 50, o: 0 },
      { d: 12.3, g: 45.6, o: 42.1 },
      { a: 20, b: 20, c: 20, d: 20, e: 20 },
      { only: 100 },
    ];
    for (const pop of [0, 1, 2, 3, 7, 999, 88948, 9757179, 39538223]) {
      for (const mix of mixes) {
        const counts = countsFromShares(pop, mix);
        equal(sumCounts(counts), pop,
          `pop ${pop} with ${JSON.stringify(mix)} summed to ${sumCounts(counts)}`);
      }
    }
  });

  it('the float split it replaces is inexact for a third of the real map', async () => {
    // Measured on data/game-data.json: 986 of 3,143 counties (31.4%) have
    // pop*d/100 + pop*g/100 + pop*o/100 !== pop. Clark County NV is the worst:
    // 2,398,870.9999999995 for a population of 2,398,871.
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const naiveOf = (r) => {
      const pop = r.pop || 0;
      const dem = r.dem != null ? r.dem : 0, gop = r.gop != null ? r.gop : 0;
      const oth = r.other != null ? r.other : Math.max(0, 100 - dem - gop);
      return { pop, sum: pop * (dem / 100) + pop * (gop / 100) + pop * (oth / 100),
               shares: { d: dem, g: gop, o: oth } };
    };
    const clark = naiveOf(raw.data.counties['32003']);
    ok(clark.sum !== clark.pop,
      `Clark County NV now splits exactly (${clark.sum} vs ${clark.pop}); pick another case`);
    equal(sumCounts(countsFromShares(clark.pop, clark.shares)), clark.pop);

    let inexact = 0, total = 0;
    for (const r of Object.values(raw.data.counties)) {
      const n = naiveOf(r);
      total++;
      if (n.sum !== n.pop) inexact++;
      equal(sumCounts(countsFromShares(n.pop, n.shares)), n.pop, 'exact split failed');
    }
    ok(inexact > total * 0.2,
      `only ${inexact} of ${total} counties split inexactly; the measurement was 986 of 3,143`);
  });

  it('every count is a non-negative integer', () => {
    for (const pop of [0, 5, 12345, 9757179]) {
      const counts = countsFromShares(pop, { d: 41.7, g: 56.9, o: 1.4 });
      for (const [k, v] of Object.entries(counts)) {
        equal(Number.isInteger(v), true, `${k} is not an integer: ${v}`);
        ok(v >= 0, `${k} is negative: ${v}`);
      }
    }
  });

  it('the residual lands on the LARGEST bloc, where it is proportionally smallest', () => {
    // 7 people, 3 equal shares: 2.333 each rounds to 2, residual 1
    const counts = countsFromShares(7, { a: 10, b: 45, c: 45 });
    equal(sumCounts(counts), 7);
    ok(counts.b >= counts.a && counts.c >= counts.a);
  });

  it('is deterministic — ties break on the sorted name, not on key order', () => {
    const a = countsFromShares(100, { x: 33.33, y: 33.33, z: 33.34 });
    const b = countsFromShares(100, { z: 33.34, y: 33.33, x: 33.33 });
    // compare per key: deepEqual serialises, and JSON preserves INSERTION order,
    // so it would fail on two identical bags built in different orders.
    for (const k of ['x', 'y', 'z']) {
      equal(a[k], b[k], `"${k}" differs by key order: ${a[k]} vs ${b[k]}`);
    }
    equal(sumCounts(a), 100);
  });

  it('handles shares that do not sum to 100 without going negative', () => {
    for (const mix of [{ a: 10, b: 10 }, { a: 200, b: 50 }, { a: 0, b: 0 }]) {
      const counts = countsFromShares(1000, mix);
      equal(sumCounts(counts), 1000, `${JSON.stringify(mix)} did not reach the population`);
      for (const v of Object.values(counts)) ok(v >= 0, `negative count from ${JSON.stringify(mix)}`);
    }
  });

  it('accepts fractions with scale = 1', () => {
    const counts = countsFromShares(1000, { a: 0.25, b: 0.75 }, 1);
    equal(sumCounts(counts), 1000);
    equal(counts.a, 250);
    equal(counts.b, 750);
  });

  it('an empty share bag yields an empty bag, not NaN', () => {
    deepEqual(countsFromShares(1000, {}), {});
  });

  it('sharesFromCounts is the inverse to within one head', () => {
    const mix = { d: 41.7, g: 56.9, o: 1.4 };
    const counts = countsFromShares(88948, mix);
    const back = sharesFromCounts(counts);
    for (const k of Object.keys(mix)) close(back[k], mix[k], 0.01, `${k} did not round-trip`);
  });

  it('sharesFromCounts returns zeros for an empty population, not NaN', () => {
    deepEqual(sharesFromCounts({ a: 0, b: 0 }), { a: 0, b: 0 });
  });
});

describe('The model uses it', () => {
  it('every Area opens with integer ideology counts summing to its baked total', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    for (const f in Game.county) {
      const c = Game.county[f];
      let total = 0;
      for (let i = 0; i < c.pop.length; i++) {
        equal(Number.isInteger(c.pop[i]), true,
          `Area ${f} ${Ideology.idAt(i)} is not an integer at boot: ${c.pop[i]}`);
        total += c.pop[i];
      }
      const baked = Game.areaCounties(f)
        .reduce((t, m) => t + ((raw.data.counties[m] && raw.data.counties[m].pop) || 0), 0);
      // EXACT, not close(): that is the whole point of the port.
      equal(total, baked, `Area ${f} population ${total} != baked ${baked}`);
    }
  });

  it('the world total is exactly the sum of the baked county populations', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    let model = 0;
    for (const f in Game.county) {
      const c = Game.county[f];
      for (let i = 0; i < c.pop.length; i++) model += c.pop[i];
    }
    let baked = 0;
    for (const r of Object.values(raw.data.counties)) baked += r.pop || 0;
    equal(model, baked, 'the model population is not exactly the baked population');
  });
});
