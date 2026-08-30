/*
 * M1.7 — even-spread mutations flattened the map.
 *
 * Three functions divided a total evenly across a nation's Areas:
 *   - Game.boostGdp (called on every trade)
 *   - the civil-war GDP transfer to the winner
 *   - applyCivilWarCost's population loss, which ALSO clamped at zero
 *
 * The population one was the worst: a 12k-person rural Area and a 9.8M-person
 * metro Area lost the same absolute head count, so at the 40% cap California had
 * its Democratic population driven to zero in 34 of 58 Areas and only 57.3% of
 * the intended loss was applied. The severity dial was broken — doubling the
 * score did not double the casualties.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;

const nationGdp = (nid) => {
  let t = 0;
  for (const f of Game.getNation(nid).counties) t += Game.countyGdp(f);
  return t;
};
/** Coefficient of variation of GDP across a nation's Areas — 0 means flat. */
function gdpSpread(nid) {
  const vals = [...Game.getNation(nid).counties].map((f) => Game.countyGdp(f));
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (!mean) return 0;
  const v = vals.reduce((a, x) => a + (x - mean) * (x - mean), 0) / vals.length;
  return Math.sqrt(v) / mean;
}

describe('Proportional GDP', () => {
  it('boostGdp preserves the shape of the economy', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const before = [...Game.getNation(nid).counties].map((f) => Game.countyGdp(f));
    const total = before.reduce((a, b) => a + b, 0);
    const spreadBefore = gdpSpread(nid);

    Game.boostGdp(nid, total * 0.5);

    const after = [...Game.getNation(nid).counties].map((f) => Game.countyGdp(f));
    close(after.reduce((a, b) => a + b, 0), total * 1.5, 1e-6, 'the boost was not fully delivered');
    // every Area grew by the same FACTOR
    for (let i = 0; i < before.length; i++) {
      if (before[i] <= 0) continue;
      close(after[i] / before[i], 1.5, 1e-9, 'Areas grew by different factors');
    }
    close(gdpSpread(nid), spreadBefore, 1e-9, 'the GDP map was flattened by a trade');
  });

  it('fifty trades do not erase the economic geography', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const spreadBefore = gdpSpread(nid);
    for (let i = 0; i < 50; i++) Game.boostGdp(nid, nationGdp(nid) * 0.02);
    close(gdpSpread(nid), spreadBefore, 1e-6,
      'fifty rounds of trading changed the shape of the GDP map');
    ok(nationGdp(nid) > 0);
  });

  it('an even split WOULD have flattened it — the contrast case', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = Game.getNation(nid);
    const spreadBefore = gdpSpread(nid);
    // reproduce the old behaviour by hand
    const amount = nationGdp(nid) * 5;
    const per = amount / n.counties.size;
    for (const f of n.counties) Game.county[f].gdp += per;
    ok(gdpSpread(nid) < spreadBefore * 0.5,
      'the contrast case did not flatten, so this test proves nothing');
  });

  it('a nation with no GDP still receives the full amount', async () => {
    await bootWorld({ seed: SEED });
    const nid = '10'; // Delaware
    for (const f of Game.getNation(nid).counties) Game.county[f].gdp = 0;
    Game.boostGdp(nid, 1e9);
    close(nationGdp(nid), 1e9, 1e-6, 'the fallback even split lost or duplicated the amount');
  });
});

describe('Civil war population loss', () => {
  it('is proportional: no Area is zeroed, however severe the war', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const bloc = Game.rulingBloc(Game.getNation(nid).counties);
    ok(bloc >= 0, 'California has no ruling ideology');
    const before = new Map([...Game.getNation(nid).counties].map((f) => [f, Game.county[f].pop[bloc]]));
    Game.applyCivilWarCost(nid, null, 5000); // far past the cap
    let zeroed = 0;
    for (const [f, was] of before) {
      if (was > 0 && Game.county[f].pop[bloc] <= 0) zeroed++;
    }
    equal(zeroed, 0, `${zeroed} Areas had their ruling ideology driven to exactly zero`);
  });

  it('delivers the full intended loss — the severity dial works', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const bloc = Game.rulingBloc(Game.getNation(nid).counties);
    const blocTotal = () => {
      let t = 0;
      for (const f of Game.getNation(nid).counties) t += Game.county[f].pop[bloc];
      return t;
    };
    const before = blocTotal();
    const tune = window.TUNE;
    const score = 5000;
    const pct = Math.min(tune.get('war.popLossMax'),
      Math.max(tune.get('war.popLossBase'),
        tune.get('war.popLossBase') + score * tune.get('war.popLossPerScore')));
    Game.applyCivilWarCost(nid, null, score);
    close(blocTotal(), before * (1 - pct), 1e-6,
      `the realised loss was not the intended ${(pct * 100).toFixed(0)}% — the clamp used to eat 43%`);
  });

  it('doubling the score roughly doubles the casualties', async () => {
    const lossAt = async (score) => {
      await bootWorld({ seed: SEED });
      const nid = '06';
      const pop = () => { let t = 0; for (const f of Game.getNation(nid).counties) t += Game.countyPop(f); return t; };
      const before = pop();
      Game.applyCivilWarCost(nid, null, score);
      return before - pop();
    };
    const a = await lossAt(100);
    const b = await lossAt(200);
    ok(b > a * 1.5, `score 100 cost ${Math.round(a)}, score 200 cost ${Math.round(b)} — the dial is flat`);
  });

  it('the bleeding bloc is the real plurality, whichever ideology that is', async () => {
    await bootWorld({ seed: SEED });
    const nid = '49'; // Utah
    const n = Game.getNation(nid);
    const YELLOW = Ideology.index('yellow');
    // make a MINORITY ideology the outright plurality
    for (const f of n.counties) {
      const c = Game.county[f];
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      c.pop.fill(0);
      c.pop[YELLOW] = pop * 0.9;
      c.pop[Ideology.index('red')] = pop * 0.05;
      c.pop[Ideology.index('blue')] = pop * 0.05;
      c.mov = {};
    }
    equal(Game.rulingBloc(n.counties), YELLOW,
      'the ruling bloc test does not follow the actual plurality');

    let before = 0;
    for (const f of n.counties) before += Game.county[f].pop[YELLOW];
    Game.applyCivilWarCost(nid, null, 400);
    let after = 0;
    for (const f of n.counties) after += Game.county[f].pop[YELLOW];
    ok(after < before,
      'the ruling ideology took no casualties — the old d >= g test bled the wrong bloc');
  });

  it('leaves the other blocs untouched', async () => {
    await bootWorld({ seed: SEED });
    const nid = '48'; // Texas
    const n = Game.getNation(nid);
    const bloc = Game.rulingBloc(n.counties);
    const other = (bloc + 1) % Ideology.count();
    let before = 0;
    for (const f of n.counties) before += Game.county[f].pop[other];
    Game.applyCivilWarCost(nid, null, 500);
    let after = 0;
    for (const f of n.counties) after += Game.county[f].pop[other];
    close(after, before, 1e-6, 'the war hurt an ideology that was not in power');
  });
});

describe('Civil war GDP transfer', () => {
  it('the winner receives it in proportion to its own economy', async () => {
    await bootWorld({ seed: SEED });
    const loser = '32', winner = '06'; // Nevada -> California
    const spreadBefore = gdpSpread(winner);
    const gdpBefore = nationGdp(winner);
    const loserBefore = nationGdp(loser);

    Game.applyCivilWarCost(loser, winner, 800);

    const moved = loserBefore - nationGdp(loser);
    ok(moved > 0, 'nothing was transferred');
    close(nationGdp(winner), gdpBefore + moved, 1e-6, 'the transfer lost or created GDP');
    close(gdpSpread(winner), spreadBefore, 1e-6, 'reparations flattened the winner\'s GDP map');
  });

  it('every loser Area gives up the same FRACTION of its own GDP', async () => {
    await bootWorld({ seed: SEED });
    const loser = '32';
    const before = new Map([...Game.getNation(loser).counties].map((f) => [f, Game.countyGdp(f)]));
    Game.applyCivilWarCost(loser, '06', 300);
    let ratio = null;
    for (const [f, was] of before) {
      if (was <= 0) continue;
      const r = Game.countyGdp(f) / was;
      if (ratio === null) ratio = r;
      else close(r, ratio, 1e-9, `Area ${f} gave up a different fraction`);
    }
    ok(ratio !== null && ratio < 1, 'no GDP was taken at all');
  });
});
