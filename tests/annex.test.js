/*
 * M1.4 — annexation costs something and its cap is absolute.
 *
 * The cap was `capFactor * your own pop/GDP` — a multiple of YOUR OWN SIZE, so a
 * greedy "take the largest set that stays under the trigger" play doubled a
 * nation every turn: Wyoming reached 1,167 of 1,676 Areas in nine turns without
 * triggering a single civil war, and California did it in three. `Game.spend`
 * was exported with zero call sites; no action in the game cost anything.
 *
 * These tests are headless, so they exercise the model contracts (budget, price,
 * occupation cost, blue shell, trigger ratio) rather than the DOM action layer.
 */
import { describe, it, ok, equal, notEqual, close } from './harness.js';
import { bootWorld } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('Annexation cost', () => {
  it('nations open with a real treasury, so priced actions are reachable at turn 0', async () => {
    await bootWorld({ seed: SEED });
    for (const [id, n] of Game.nations) {
      ok(n.treasury > 0, `${n.name} opened with an empty treasury; nothing is affordable`);
      const gdp = Game.nationDemographics(id).gdp;
      close(n.treasury, gdp * T().get('econ.startingTreasuryTurns') * T().get('econ.taxRate'), 1e-6,
        `${n.name} starting treasury`);
    }
  });

  it('Game.spend actually debits and refuses what cannot be paid', async () => {
    await bootWorld({ seed: SEED });
    const n = Game.getNation('06');
    const start = n.treasury;
    equal(Game.spend('06', start / 2), true);
    close(n.treasury, start / 2, 1e-6);
    equal(Game.spend('06', start), false, 'spend allowed an overdraft');
    close(n.treasury, start / 2, 1e-6, 'a refused spend still moved the treasury');
  });

  it('cost rises with both Area count and population', async () => {
    await bootWorld({ seed: SEED });
    const areas = [...Game.nations.get('06').counties].slice(0, 3);
    const one = Actions.annexCost(areas.slice(0, 1), 0);
    const three = Actions.annexCost(areas, 0);
    ok(three > one, 'three Areas should cost more than one');
    ok(one > 0, 'annexation is still free');
    // the per-head term must actually matter
    const big = [...Game.nations.get('06').counties].sort((a, b) => Game.countyPop(b) - Game.countyPop(a))[0];
    const small = [...Game.nations.get('06').counties].sort((a, b) => Game.countyPop(a) - Game.countyPop(b))[0];
    ok(Actions.annexCost([big], 0) > Actions.annexCost([small], 0),
      'a metro Area should cost more to swallow than an empty one');
  });

  it('the leader pays a surcharge', async () => {
    await bootWorld({ seed: SEED });
    const areas = [...Game.nations.get('06').counties].slice(0, 2);
    const plain = Actions.annexCost(areas, 0);
    const leader = Actions.annexCost(areas, 1);
    close(leader, plain * (1 + T().get('annex.shellCostMult')), 1e-6);
  });
});

describe('Annexation cap', () => {
  it('the budget is absolute — the same for a minnow and for a superpower', async () => {
    await bootWorld({ seed: SEED });
    const budget = T().get('annex.budgetAreas');
    ok(budget >= 1 && budget <= 10, `an absolute budget of ${budget} Areas is not a plausible cap`);
    // and it is NOT derived from any nation's size
    const wy = Game.nationDemographics('56'), ca = Game.nationDemographics('06');
    ok(ca.pop > wy.pop * 10, 'fixture sanity: California should dwarf Wyoming');
    // budget is a constant, so nothing about the two nations can change it
    equal(T().get('annex.budgetAreas'), budget);
  });

  it('the greedy exploit is dead: a small nation cannot double every turn', async () => {
    await bootWorld({ seed: SEED });
    const nid = '56'; // Wyoming, the review's worst case: 27 -> 1,167 Areas in 9 turns
    const start = Game.nations.get(nid).counties.size;
    const trace = greedyConquest(nid, 12);
    const end = Game.getNation(nid) ? Game.getNation(nid).counties.size : 0;
    ok(end < start + 40,
      `Wyoming reached ${end} Areas in ${trace.length} turns from ${start}; the old exploit reached 1,167 in 9`);
    ok(trace.some((t) => t.stop), 'the run should hit a wall — budget, bankruptcy or no legal targets');
  });

  it('even the largest nation is braked within a game length', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06'; // California took 70% of the map in 3 turns under the old rule
    greedyConquest(nid, 40);
    const end = Game.getNation(nid) ? Game.getNation(nid).counties.size : 0;
    const share = end / Object.keys(Game.county).length;
    ok(share < 0.35, `California holds ${(share * 100).toFixed(1)}% of the map after 40 greedy turns`);
    // and it is running a deficit by the end
    const flow = Game.treasuryFlow(nid);
    ok(flow.occupation > 0, 'occupation is costing nothing after 40 turns of conquest');
  });
});

describe('Occupation cost', () => {
  it('a nation on its own soil pays no occupation surcharge', async () => {
    await bootWorld({ seed: SEED });
    for (const [id] of Game.nations) {
      equal(Game.occupiedCount(id), 0, `${id} counts occupied Areas at turn 0`);
      equal(Game.treasuryFlow(id).occupation, 0);
    }
  });

  it('is superlinear in the amount of foreign ground held', async () => {
    await bootWorld({ seed: SEED });
    const nid = '16'; // Idaho
    const costPer = [];
    for (const grab of [10, 20, 40]) {
      await bootWorld({ seed: SEED });
      const targets = [...Game.annexTargets(nid)];
      const take = [];
      // breadth-first grab so the set stays adjacent
      const frontier = [...targets];
      while (take.length < grab && frontier.length) {
        const f = frontier.shift();
        if (Game.getOwner(f) === nid) continue;
        take.push(f);
        for (const nb of Game.countyNeighbors(f)) if (Game.getOwner(nb) !== nid) frontier.push(nb);
      }
      Game.moveCounties(take, nid);
      const flow = Game.treasuryFlow(nid);
      ok(flow.occupied > 0, 'nothing registered as occupied');
      costPer.push(flow.occupation / flow.occupied);
    }
    ok(costPer[1] > costPer[0], 'per-Area occupation cost did not rise from 10 to 20 Areas');
    ok(costPer[2] > costPer[1], 'per-Area occupation cost did not rise from 20 to 40 Areas');
  });

  it('a nation born from a breakup takes its modal state as its home soil', async () => {
    await bootWorld({ seed: SEED });
    const chunk = [...Game.nations.get('48').counties].slice(0, 30); // Texas
    const born = Game.breakApart(chunk);
    ok(born.length > 0, 'no nation was born');
    for (const id of born) {
      const n = Game.getNation(id);
      ok(n.homeSt, `${id} has no home state`);
      ok(n.founded != null, `${id} has no founding turn`);
    }
  });
});

/*
 * THE ANTI-SNOWBALL, which stopped being a rank in M7.2.
 *
 * These two tests used to pin the properties of a size TIER — that it ranked on
 * a composite rather than on population alone, and that its size was fixed to
 * the original nation count so it did not shrink as nations were eaten. Both
 * were real fixes to the tier, and both are moot now that there is no tier: the
 * pressure is a coalition of named nations triggered on
 * `share x (1 - influence)`.
 *
 * What survives is the CONCERN behind them, which finding 36 stated as "the
 * anti-snowball weakens exactly as the snowball grows". That is what is tested
 * here now, and it is a stronger test than either of the originals: eat forty
 * nations and check the survivor is under MORE pressure, not less.
 */
describe('Anti-snowball pressure', () => {
  it('a nation is nothing until it is big AND resented', async () => {
    await bootWorld({ seed: SEED });
    equal(Game.blueShell('06'), 0, 'the largest nation was already being ganged up on at turn 0');
    const mid = '49'; // Utah
    equal(Game.blueShell(mid), 0);
    // Wealth is half of what makes a threat; standing is the other half.
    Game.boostGdp(mid, Game.nationDemographics('06').gdp * 8);
    Game.getNation(mid).influence = 0.02;
    Coalitions.reset();
    ok(Game.blueShell(mid) > 0, 'a hated economic superpower faced nobody at all');
    Game.getNation(mid).influence = 0.98;
    Coalitions.reset();
    equal(Game.blueShell(mid), 0, 'the same superpower, admired, was still ganged up on');
  });

  it('does NOT weaken as the snowball grows', async () => {
    /*
     * Finding 36's real complaint, and the old tier's real failure: `topCount`
     * was a share of the live roster, so at 51 nations five were penalised, at
     * ten just one — the brake let go exactly as it was needed.
     */
    await bootWorld({ seed: SEED });
    const survivor = '06';
    Game.getNation(survivor).influence = 0.2;
    Coalitions.reset();
    const before = Game.blueShell(survivor);

    const ids = [...Game.nations.keys()].filter((id) => id !== survivor).slice(0, 40);
    Game.batch(() => { for (const id of ids) Game.mergeInto(survivor, id); });
    ok(Game.nations.size <= 11, `expected ~11 nations left, got ${Game.nations.size}`);
    Game.getNation(survivor).influence = 0.2;
    Coalitions.reset();

    ok(Game.blueShell(survivor) > before,
      `pressure went ${before.toFixed(3)} -> ${Game.blueShell(survivor).toFixed(3)} after eating `
      + '40 nations; the anti-snowball weakened as the snowball grew');
  });
});

describe('Civil war trigger', () => {
  it('fires on the ratio of what you took to what you held', async () => {
    await bootWorld({ seed: SEED });
    const tune = T();
    const ratio = tune.get('war.triggerSizeRatio');
    const evenMix = (pop) => {
      const mix = Ideology.zeroMix();
      mix[Ideology.index('blue')] = pop * 0.5;
      mix[Ideology.index('red')] = pop * 0.5;
      return { pop, mix, shares: Ideology.shares(mix), dominant: Ideology.dominantIndex(mix),
               centroid: Ideology.centroid(mix) };
    };
    const before = { ...evenMix(1e6), gdp: 1e11 };
    const small = { ...evenMix(1e6 * ratio * 0.9), gdp: 1e11 * ratio * 0.9 };
    const big = { ...evenMix(1e6 * ratio * 1.1), gdp: 1e11 * ratio * 1.1 };
    const after = { ...evenMix(2e6), gdp: 2e11 };
    equal(CivilWar.assess(before, small, after, tune).triggered, false,
      'a bite just under the ratio should not start a war');
    equal(CivilWar.assess(before, big, after, tune).triggered, true,
      'a bite just over the ratio should start one');
  });
});

/* ------------------------------------------------------------------ */

/** Greedy annexation under the real budget, price and war rules. */
function greedyConquest(nid, turns) {
  const trace = [];
  const rng = RNG.create(4242);
  for (let t = 0; t < turns; t++) {
    const n = Game.getNation(nid);
    if (!n) { trace.push({ t, stop: 'eliminated' }); break; }
    const me = Game.nationDemographics(nid);
    const factor = window.TUNE.get('annex.strongNeighbourFactor');
    const blocked = new Set();
    for (const [oid] of Game.nations) {
      if (oid === nid) continue;
      const d = Game.nationDemographics(oid);
      if (d.pop > me.pop * factor && d.gdp > me.gdp * factor) blocked.add(oid);
    }
    const legal = [...Game.annexTargets(nid)].filter((f) => !blocked.has(Game.getOwner(f)));
    if (!legal.length) { trace.push({ t, stop: 'no legal targets' }); break; }
    const chosen = legal.sort((a, b) => Game.countyPop(b) - Game.countyPop(a))
      .slice(0, window.TUNE.get('annex.budgetAreas'));
    const shell = Game.blueShell(nid);
    if (!Game.spend(nid, Actions.annexCost(chosen, shell))) {
      trace.push({ t, stop: 'bankrupt', areas: n.counties.size });
      break;
    }
    const added = Game.demographics(chosen);
    const after = Game.demographics([...n.counties, ...chosen]);
    const res = CivilWar.resolve(me, added, after, { rng, tune: window.TUNE, scoreMult: 1 + shell });
    if (!res.triggered || res.outcome === 'victory') Game.moveCounties(chosen, nid);
    else if (res.outcome === 'partial') {
      const keep = Math.max(1, Math.round(CivilWar.partialKeepFraction(res.score, window.TUNE) * chosen.length));
      Game.moveCounties(chosen.slice(0, keep), nid);
    }
    World.advanceTurn(window.TUNE);
    trace.push({ t, areas: Game.getNation(nid) ? Game.getNation(nid).counties.size : 0 });
  }
  return trace;
}
