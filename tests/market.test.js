/*
 * M1.8 — the market was a one-way ratchet over two economies.
 *
 *   - `perCap` was calibrated once at game start and never again, so demand
 *     tracked live population while supply tracked GDP: every price drifted up
 *     1.302%/turn forever and pinned at the 400 clamp around turn 105.
 *   - Relative prices never changed at all, because the sector mix was constant.
 *   - `nationSurplus` read the BAKED production values while `update` scaled by
 *     live GDP — two economies that never reconciled, so tradeable volume was
 *     frozen for the whole game.
 *   - `demandShare` summed to 0.80, so the UI's "100 = balanced" was wrong by
 *     construction: balanced was 75.
 */
import { describe, it, ok, equal, notEqual, close, every } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('Market calibration', () => {
  it('demand shares sum to 1.0, so "100 = balanced" is true', async () => {
    const sum = T().get('market.demandShare').reduce((a, b) => a + b, 0);
    close(sum, 1, 1e-9,
      `demand shares sum to ${sum.toFixed(4)}; the index is demand share over supply share, ` +
      'so any other sum shifts every price by sum^elasticity and the label lies');
  });

  it('a sector whose demand share equals its supply share prices at exactly 100', async () => {
    await bootWorld({ seed: SEED });
    const e = MapModes.getEconomy();
    ok(e, 'no economy data');
    // total live supply by sector
    const supply = [0, 0, 0, 0, 0, 0];
    let total = 0;
    for (const [aid, a] of Object.entries(e.areas)) {
      const p = Market.areaProduction(aid, a);
      for (let i = 0; i < 6; i++) { supply[i] += p[i]; total += p[i]; }
    }
    // set demand shares to exactly the supply shares, then restore
    const original = [...T().get('market.demandShare')];
    try {
      T().set('market.demandShare', supply.map((s) => s / total));
      Market.update(T());
      for (const p of Market.getPrices()) close(p, 100, 1e-6, 'a perfectly balanced sector did not price at 100');
    } finally {
      T().set('market.demandShare', original);
      Market.update(T());
    }
  });

  it('perCap is recalibrated every turn, not frozen at game start', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const first = Market.getPerCap();
    ok(first > 0);
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), rng);
    notEqual(Market.getPerCap(), first,
      'per-capita spend is still calibrated once; that IS the ratchet');
  });
});

describe('No price ratchet', () => {
  it('prices do not pin at the ceiling', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const cap = T().get('market.maxPrice');
    for (let i = 0; i < 200; i++) World.advanceTurn(T(), rng);
    const prices = Market.getPrices();
    every(prices, (p) => p < cap,
      `a price reached the ${cap} clamp; the old model pinned all six around turn 105`);
    every(prices, (p) => p > T().get('market.minPrice'), 'a price hit the floor');
  });

  it('the price LEVEL is stable — no monotonic drift in every sector at once', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const mean = () => Market.getPrices().reduce((a, b) => a + b, 0) / 6;
    const a = mean();
    for (let i = 0; i < 100; i++) World.advanceTurn(T(), rng);
    const b = mean();
    // 1.302%/turn compounding over 100 turns is a factor of 3.7
    ok(b < a * 1.6, `the mean price went ${a.toFixed(1)} -> ${b.toFixed(1)} over 100 turns`);
    ok(b > a * 0.6, `the mean price collapsed ${a.toFixed(1)} -> ${b.toFixed(1)}`);
  });

  it('RELATIVE prices move, because the sector mix moves', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = Market.getPrices().slice();
    for (let i = 0; i < 100; i++) World.advanceTurn(T(), rng);
    const after = Market.getPrices();
    // ratios must change, not just the level
    const ratioBefore = before[0] / before[5];
    const ratioAfter = after[0] / after[5];
    ok(Math.abs(ratioAfter / ratioBefore - 1) > 0.1,
      `Agriculture/IT went ${ratioBefore.toFixed(2)} -> ${ratioAfter.toFixed(2)}; ` +
      'with one uniform growth rate the mix is frozen and every price is a constant');
  });

  it('the fastest-growing sector gets cheaper and the slowest dearer', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const mult = T().get('world.sectorGrowth');
    let fastest = 0, slowest = 0;
    for (let i = 1; i < mult.length; i++) {
      if (mult[i] > mult[fastest]) fastest = i;
      if (mult[i] < mult[slowest]) slowest = i;
    }
    const before = Market.getPrices().slice();
    for (let i = 0; i < 150; i++) World.advanceTurn(T(), rng);
    const after = Market.getPrices();
    ok(after[fastest] < before[fastest],
      `the fastest-growing sector (${fastest}) got dearer, not cheaper`);
    ok(after[slowest] > before[slowest],
      `the slowest-growing sector (${slowest}) got cheaper, not dearer`);
  });
});

describe('One economy', () => {
  it('nationSurplus tracks LIVE GDP, not the baked values', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = Market.nationSurplus('06', T()).gross;
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), rng);
    const after = Market.nationSurplus('06', T()).gross;
    ok(after > before * 1.05,
      `gross production went ${Math.round(before)} -> ${Math.round(after)}; ` +
      'reading the baked values froze tradeable volume for the whole game');
  });

  it('a war that destroys GDP reduces what a nation can export', async () => {
    await bootWorld({ seed: SEED });
    const before = Market.nationSurplus('32', T()).gross;
    Game.applyCivilWarCost('32', '06', 4000); // Nevada loses hard
    const after = Market.nationSurplus('32', T()).gross;
    ok(after < before,
      'a nation can lose half its economy and export exactly as much the next turn');
  });

  it('nation production sums to the nation\'s live GDP', async () => {
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '48', '36', '16']) {
      const ns = Market.nationSurplus(nid, T());
      let gdp = 0;
      for (const f of Game.getNation(nid).counties) {
        // only Areas the economy file knows about contribute
        if (MapModes.getEconomy().areas[f]) gdp += Game.countyGdp(f);
      }
      close(ns.gross, gdp / 1e6, 1e-3, `${nid}: production does not sum to live GDP`);
    }
  });

  it('surpluses and deficits net to zero, because demand sums to 1.0', async () => {
    await bootWorld({ seed: SEED });
    // globally, not per nation: one nation can run a real net surplus
    const e = MapModes.getEconomy();
    const share = T().get('market.demandShare');
    const supply = [0, 0, 0, 0, 0, 0];
    let total = 0;
    for (const [aid, a] of Object.entries(e.areas)) {
      const p = Market.areaProduction(aid, a);
      for (let i = 0; i < 6; i++) { supply[i] += p[i]; total += p[i]; }
    }
    let net = 0;
    for (let i = 0; i < 6; i++) net += supply[i] - share[i] * total;
    close(net, 0, Math.max(1, total * 1e-9), 'global supply and demand do not balance');
  });

  it('the market survives a save/load round trip', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 12; i++) World.advanceTurn(T(), rng);
    const snap = Market.serialize();
    const priced = Market.getPrices().slice();
    for (let i = 0; i < 12; i++) World.advanceTurn(T(), rng);
    Market.loadState(snap);
    equal(JSON.stringify(Market.getPrices()), JSON.stringify(priced));
    close(Market.getPerCap(), snap.perCap, 1e-9);
  });
});
