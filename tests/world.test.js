/*
 * M1.5 — one growth clock, ext included, GDP that actually moves.
 *
 * There were two growth models on two unrelated clocks: Game.growAll(5%) at the
 * player round boundary (which grew GDP) and phasePopulationGrowth(1%) which ran
 * only when a human clicked "Advance world" (and did not grow GDP at all). The
 * button was World.advanceTurn's ONLY caller, so a player who never noticed it
 * played a game with the simulation dormant.
 *
 * phasePopulationGrowth also omitted `ext` from both the nation totals and the
 * county growth base, so members of a regional party never reproduced.
 */
import { describe, it, ok, equal, notEqual, close } from './harness.js';
import { bootWorld, totalCountyPop, recPop } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('One growth clock', () => {
  it('Game.growAll no longer exists', async () => {
    await bootWorld({ seed: SEED });
    equal(typeof Game.growAll, 'undefined',
      'the second growth model is still exported; there are two clocks again');
  });

  it('a world turn grows population at exactly the declared rate', async () => {
    await bootWorld({ seed: SEED });
    const before = totalCountyPop();
    World.advanceTurn(T());
    const after = totalCountyPop();
    const realised = after / before - 1;
    close(realised, T().get('world.popGrowth'), 1e-6,
      `realised growth ${(realised * 100).toFixed(4)}% against a declared ${(T().get('world.popGrowth') * 100).toFixed(2)}% — ext is being excluded again`);
  });

  it('movement members reproduce', async () => {
    const { rng } = await bootWorld({ seed: 4242 });
    const movTotal = () => {
      let t = 0;
      for (const f in Game.county) for (const m in Game.county[f].mov) t += Game.county[f].mov[m];
      return t;
    };
    const before = movTotal();
    ok(before > 0, 'no movement population to test with');
    World.advanceTurn(T(), rng);
    ok(movTotal() > before, 'movement head counts did not grow at all');
  });

  it('a movement approaches the declared ceiling, not a dilution equilibrium', async () => {
    const { rng } = await bootWorld({ seed: 4242 });
    const ceiling = T().get('world.partyCeiling');
    for (let i = 0; i < 300; i++) World.advanceTurn(T(), rng);

    let best = 0;
    for (const f in Game.county) {
      const c = Game.county[f];
      const pop = recPop(c);
      if (!pop) continue;
      for (const m in c.mov) best = Math.max(best, c.mov[m] / pop);
    }
    ok(best > ceiling * 0.8,
      `strongest movement share settled at ${best.toFixed(4)} against a ${ceiling} ceiling; ` +
      'the old dilution bug drove this to 0.278');
  });

  it('movements do not all converge on the SAME share', async () => {
    const { rng } = await bootWorld({ seed: 4242 });
    for (let i = 0; i < 200; i++) World.advanceTurn(T(), rng);
    const shares = [];
    for (const f in Game.county) {
      const c = Game.county[f];
      const pop = recPop(c);
      if (!pop) continue;
      for (const m in c.mov) shares.push(c.mov[m] / pop);
    }
    ok(shares.length > 100, 'not enough movement/county pairs to measure');
    const min = Math.min(...shares), max = Math.max(...shares);
    ok(max - min > 0.02,
      `every movement settled within ${(max - min).toFixed(4)} of the same share — ` +
      'they are numerically identical, which is what the dilution equilibrium produced');
  });
});

describe('Economic growth', () => {
  it('GDP moves inside a world turn', async () => {
    await bootWorld({ seed: SEED });
    const gdp = () => { let t = 0; for (const f in Game.county) t += Game.countyGdp(f); return t; };
    const before = gdp();
    World.advanceTurn(T());
    const after = gdp();
    notEqual(after, before, 'GDP was copied into snap/nxt and written straight back');
    ok(after > before, 'GDP shrank on a growth turn');
  });

  it('GDP growth couples to realised population growth and to the sector mix', async () => {
    await bootWorld({ seed: SEED });
    const base = T().get('world.gdpGrowth');
    const coupling = T().get('world.gdpGrowthPopCoupling');
    const popRate = T().get('world.popGrowth');
    const mult = T().get('world.sectorGrowth');
    const f = '06037'; // Los Angeles
    // the Area's own growth multiplier, from its baked sector profile
    const a = MapModes.getEconomy().areas[f];
    let total = 0, weighted = 0;
    for (let i = 0; i < a.v.length; i++) { total += a.v[i]; weighted += a.v[i] * mult[i]; }
    const sectorFactor = weighted / total;

    const before = Game.countyGdp(f);
    World.advanceTurn(T());
    close(Game.countyGdp(f) / before - 1, base * sectorFactor + coupling * popRate, 1e-6,
      'GDP growth is not base x sectorFactor + coupling x population growth');
    ok(Math.abs(sectorFactor - 1) > 0.01,
      'Los Angeles has a sector-neutral mix; pick a different Area for this test');
  });

  it('GDP per capita does not decay monotonically', async () => {
    await bootWorld({ seed: SEED });
    const perCap = () => {
      let g = 0;
      for (const ff in Game.county) g += Game.countyGdp(ff);
      return g / totalCountyPop();
    };
    const start = perCap();
    for (let i = 0; i < 50; i++) World.advanceTurn(T());
    const end = perCap();
    ok(end > start * 0.95,
      `GDP per capita fell from ${start.toFixed(0)} to ${end.toFixed(0)} over 50 turns; ` +
      'frozen GDP against compounding population is what did that');
  });

  it('treasuries are not a fixed linear ramp', async () => {
    await bootWorld({ seed: SEED });
    const flowAt = () => Game.treasuryFlow('06').delta;
    const a = flowAt();
    for (let i = 0; i < 20; i++) World.advanceTurn(T());
    const b = flowAt();
    notEqual(a, b, 'the per-turn treasury delta is a constant forever');
    ok(b > a, 'treasury flow did not improve as the economy grew');
  });
});

describe('Phase discipline', () => {
  it('ownership is snapshotted for the whole turn', async () => {
    await bootWorld({ seed: SEED });
    const owners = World.snapshotOwners();
    equal(Object.keys(owners).length, Object.keys(Game.county).length);
    for (const f in Game.county) equal(owners[f], Game.getOwner(f));
    // and moving a county afterwards does not change the frozen copy
    const some = [...Game.nations.get('49').counties].slice(0, 2);
    Game.moveCounties(some, '16');
    equal(owners[some[0]], '49', 'the ownership snapshot tracked a live move');
  });

  it('movement growth is independent of key insertion order', async () => {
    // Two movements of the SAME ideology and the same size in one Area must
    // settle identically. Applying their gains one at a time made the result
    // depend on insertion order, worth 0.08 share points — replay-breaking
    // nondeterminism with no modelled cause.
    await bootWorld({ seed: SEED, spawnParties: true });
    const f = '06037';
    const c = Game.county[f];
    const pop = recPop(c);
    const byIdeology = {};
    for (const n of Movements.getSpawned()) {
      const i = Movements.ideologyIndexOf(n);
      (byIdeology[i] = byIdeology[i] || []).push(n);
    }
    const pair = Object.values(byIdeology).find((v) => v.length >= 2);
    ok(pair, 'no two spawned movements share an ideology; cannot test order independence');
    const A = pair[0], B = pair[1];

    const build = (first, second) => {
      const rec = { pop: c.pop.slice(), gdp: c.gdp, mov: {} };
      rec.mov[first] = pop * 0.10;
      rec.mov[second] = pop * 0.10;
      return rec;
    };
    const run = (first, second) => {
      const snap = { [f]: build(first, second) };
      const nxt = { [f]: { pop: snap[f].pop.slice(), gdp: snap[f].gdp, mov: { ...snap[f].mov } } };
      World.phaseMovementGrowth(snap, nxt, T());
      const p = recPop(nxt[f]);
      return { a: nxt[f].mov[A] / p, b: nxt[f].mov[B] / p };
    };
    const ab = run(A, B), ba = run(B, A);
    close(ab.a, ba.a, 1e-12, `${A} settled differently depending on key order`);
    close(ab.b, ba.b, 1e-12, `${B} settled differently depending on key order`);
    close(ab.a, ab.b, 1e-12, 'two identical movements settled at different shares');
  });

  it('every phase conserves the Area total it is not meant to change', async () => {
    const { rng } = await bootWorld({ seed: 4242 });
    const owners = World.snapshotOwners();
    const snap = {}, nxt = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      snap[f] = { pop: c.pop.slice(), mov: { ...c.mov }, gdp: c.gdp };
      nxt[f] = { pop: c.pop.slice(), mov: { ...c.mov }, gdp: c.gdp };
    }
    const before = {};
    for (const f in snap) before[f] = recPop(snap[f]);

    const mixes = World.phaseRecomputeMixes(snap, nxt, owners);
    World.phasePoliticalDrift(snap, nxt, mixes, T(), owners, rng);
    for (const f in nxt) close(recPop(nxt[f]), before[f], 1e-6, `drift changed the population of ${f}`);

    World.phaseMovementGrowth(snap, nxt, T());
    for (const f in nxt) close(recPop(nxt[f]), before[f], 1e-6, `movement growth changed the population of ${f}`);
  });

  it('phaseCleanup keeps every movement a valid slice of its ideology', async () => {
    const { rng } = await bootWorld({ seed: 4242 });
    const pairs = () => {
      let n = 0;
      for (const f in Game.county) n += Object.keys(Game.county[f].mov).length;
      return n;
    };
    ok(pairs() > 0, 'no movements spawned');
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), rng);
    ok(pairs() > 0, 'every movement was cleaned up');

    // The clamp is the invariant the whole model rests on: drift, growth and war
    // all move pop[i] without knowing about movements.
    const N = Ideology.count();
    for (const f in Game.county) {
      const c = Game.county[f];
      const byIdeology = new Array(N).fill(0);
      for (const m in c.mov) byIdeology[Movements.ideologyIndexOf(m)] += c.mov[m];
      for (let i = 0; i < N; i++) {
        ok(byIdeology[i] <= c.pop[i] + 1e-6,
          `Area ${f}: ${Ideology.idAt(i)} holds ${c.pop[i]} but its movements claim ${byIdeology[i]}`);
      }
    }
  });
});
