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

  it('emergent-party members reproduce', async () => {
    await bootWorld({ seed: 4242 });
    const extTotal = () => {
      let t = 0;
      for (const f in Game.county) for (const p in Game.county[f].ext) t += Game.county[f].ext[p];
      return t;
    };
    const before = extTotal();
    ok(before > 0, 'no movement population to test with');
    World.advanceTurn(T());
    ok(extTotal() > before, 'movement head counts did not grow at all');
  });

  it('a movement approaches the declared ceiling, not a dilution equilibrium', async () => {
    await bootWorld({ seed: 4242 });
    const ceiling = T().get('world.partyCeiling');
    for (let i = 0; i < 300; i++) World.advanceTurn(T());

    // the strongest movement share in any county should be near the ceiling
    let best = 0;
    for (const f in Game.county) {
      const c = Game.county[f];
      const pop = recPop(c);
      if (!pop) continue;
      for (const p in c.ext) best = Math.max(best, c.ext[p] / pop);
    }
    ok(best > ceiling * 0.9,
      `strongest movement share settled at ${best.toFixed(4)} against a ${ceiling} ceiling; ` +
      'the ext-dilution bug drove this to 0.278');
  });

  it('movements do not all converge on the SAME share', async () => {
    await bootWorld({ seed: 4242 });
    for (let i = 0; i < 200; i++) World.advanceTurn(T());
    const shares = [];
    for (const f in Game.county) {
      const c = Game.county[f];
      const pop = recPop(c);
      if (!pop) continue;
      for (const p in c.ext) shares.push(c.ext[p] / pop);
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

  it('party growth is independent of ext key insertion order', async () => {
    await bootWorld({ seed: SEED, spawnParties: false });
    const f = '06037';
    const c = Game.county[f];
    const pop = recPop(c);

    // two identical movements, inserted in opposite orders
    const build = (first, second) => {
      const rec = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, gdp: c.gdp, ext: {} };
      rec.ext[first] = pop * 0.10;
      rec.ext[second] = pop * 0.10;
      const scale = (pop - pop * 0.20) / (rec.demPop + rec.gopPop + rec.othPop);
      rec.demPop *= scale; rec.gopPop *= scale; rec.othPop *= scale;
      return rec;
    };
    const run = (first, second) => {
      const snap = { [f]: build(first, second) };
      const nxt = { [f]: JSON.parse(JSON.stringify(snap[f])) };
      World.phasePartyGrowth(snap, nxt, T());
      const p = recPop(nxt[f]);
      return { A: nxt[f].ext.A / p, B: nxt[f].ext.B / p };
    };
    const ab = run('A', 'B'), ba = run('B', 'A');
    close(ab.A, ba.A, 1e-12, 'party A settled differently depending on key order');
    close(ab.B, ba.B, 1e-12, 'party B settled differently depending on key order');
    close(ab.A, ab.B, 1e-12, 'two identical movements settled at different shares');
  });

  it('every phase conserves the county total it is not meant to change', async () => {
    await bootWorld({ seed: 4242 });
    const owners = World.snapshotOwners();
    const snap = {}, nxt = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      snap[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
      nxt[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
    }
    const before = {};
    for (const f in snap) before[f] = recPop(snap[f]);

    const leans = World.phaseRecomputeLeans(snap, nxt, owners);
    World.phasePoliticalDrift(snap, nxt, leans, T(), owners);
    for (const f in nxt) close(recPop(nxt[f]), before[f], 1e-6, `drift changed the population of ${f}`);

    World.phasePartyGrowth(snap, nxt, T());
    for (const f in nxt) close(recPop(nxt[f]), before[f], 1e-6, `party growth changed the population of ${f}`);
  });

  it('phaseCleanup is currently inert on this data — documented, not accidental', async () => {
    await bootWorld({ seed: 4242 });
    const pairs = () => {
      let n = 0;
      for (const f in Game.county) n += Object.keys(Game.county[f].ext).length;
      return n;
    };
    const before = pairs();
    ok(before > 0, 'no movements spawned');
    for (let i = 0; i < 30; i++) World.advanceTurn(T());
    equal(pairs(), before,
      'phaseCleanup removed a movement. That is a behaviour change: under ' +
      'growth-only dynamics the smallest reachable share is partyStep x ' +
      'partyCeiling, which is above the floor. Re-read the note in world.js.');
  });
});
