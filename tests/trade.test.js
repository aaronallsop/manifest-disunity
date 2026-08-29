/*
 * M1.9 — trade minted GDP from nothing, and "World market" dominated.
 *
 *   - both sides called Game.boostGdp with no cost, cooldown, capacity or
 *     depletion. The goods had already been counted in GDP when they were
 *     produced, so a deal created output twice — while the treasury, which every
 *     priced action draws on, received nothing and 11 of 51 nations ran a
 *     permanent structural deficit from turn 1 with no recovery path.
 *   - the world market absorbed the WHOLE surplus while a bilateral deal was
 *     clipped by the neighbour's deficits, so external beat bilateral by
 *     1.7x-50x and the headline trade feature was dead content.
 *   - transit routes came from STATE adjacency, which deliberately spans water,
 *     so California was offered Alaska and Hawaii as "overland" routes on turn 1.
 */
import { describe, it, ok, equal, notEqual, close } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

const gainRate = () => T().get('trade.gain');
const penalty = () => T().get('trade.worldMarketPenalty');

/** Positive surplus valued at market prices, $M. */
function exportableValue(nid) {
  const ms = Market.nationSurplus(nid, T());
  const pr = Market.getPrices();
  if (!ms || !pr) return 0;
  let v = 0;
  for (let i = 0; i < 6; i++) if (ms.surplus[i] > 0) v += ms.surplus[i] * pr[i] / 100;
  return v;
}
/** Matched surplus/deficit value between two nations, $M. */
function matchedValue(a, b) {
  const ms = Market.nationSurplus(a, T()), ts = Market.nationSurplus(b, T());
  const pr = Market.getPrices();
  if (!ms || !ts || !pr) return 0;
  let v = 0;
  for (let i = 0; i < 6; i++) {
    const sell = Math.min(Math.max(0, ms.surplus[i]), Math.max(0, -ts.surplus[i]));
    const buy = Math.min(Math.max(0, ts.surplus[i]), Math.max(0, -ms.surplus[i]));
    v += (sell + buy) * pr[i] / 100;
  }
  return v;
}

describe('Trade income', () => {
  it('goes to the treasury, not to GDP', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const gdpBefore = Game.nationDemographics(nid).gdp;
    const treasuryBefore = Game.getNation(nid).treasury;
    Game.earn(nid, 5e9);
    equal(Game.nationDemographics(nid).gdp, gdpBefore, 'trade income inflated GDP');
    close(Game.getNation(nid).treasury, treasuryBefore + 5e9, 1e-6);
  });

  it('Game.earn is the counterpart of Game.spend', async () => {
    await bootWorld({ seed: SEED });
    const n = Game.getNation('16');
    const start = n.treasury;
    Game.earn('16', 1e9);
    Game.spend('16', 1e9);
    close(n.treasury, start, 1e-6);
    equal(Game.earn('nope', 1e9), false, 'earn credited a nonexistent nation');
  });

  it('gives the structurally-deficit nations a recovery path', async () => {
    await bootWorld({ seed: SEED });
    let deficit = 0, coverable = 0;
    for (const [nid] of Game.nations) {
      const flow = Game.treasuryFlow(nid);
      if (flow.delta >= 0) continue;
      deficit++;
      // best single trade action available this turn, in dollars
      const myCapM = Actions.nationTradeCapacityFor(nid);
      let best = 0;
      if (Actions.hasExportAccess(nid)) {
        best = Math.min(exportableValue(nid), myCapM) * gainRate() * penalty();
      }
      for (const t of Game.adjacentNations(nid)) {
        const cap = Math.min(myCapM, Actions.nationTradeCapacityFor(t));
        best = Math.max(best, Math.min(matchedValue(nid, t), cap) * gainRate());
      }
      if (best * 1e6 + flow.delta >= 0) coverable++;
    }
    ok(deficit > 0, 'fixture sanity: some nations should run a deficit');
    ok(coverable / deficit > 0.6,
      `only ${coverable} of ${deficit} deficit nations can cover it by trading; ` +
      'before M1.9 the answer was zero, because trade paid no treasury at all');
  });
});

describe('Trade capacity', () => {
  it('a nation cannot move more than its ports, hubs and gateways carry', async () => {
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '48', '56', '19']) {
      const cap = Actions.nationTradeCapacityFor(nid);
      ok(cap > 0, `${nid} has zero capacity, so it can never trade at all`);
      ok(cap >= T().get('trade.capacityBase'), `${nid} is below the overland base`);
    }
  });

  it('capacity scales with real export infrastructure', async () => {
    await bootWorld({ seed: SEED });
    const coastal = Actions.nationTradeCapacityFor('06'); // California: 9 ports
    const landlocked = Actions.nationTradeCapacityFor('19'); // Iowa
    ok(coastal > landlocked * 5,
      `California (${coastal}) should dwarf Iowa (${landlocked}); the baked port data is not being read`);
  });

  it('binds on a large exporter — the world market cannot absorb everything', async () => {
    await bootWorld({ seed: SEED });
    ok(exportableValue('06') > Actions.nationTradeCapacityFor('06'),
      'California can export its entire surplus in one click; that is the volume advantage ' +
      'that made the world market dominate');
  });
});

describe('World market vs bilateral', () => {
  it('no longer strictly dominates', async () => {
    await bootWorld({ seed: SEED });
    // the review's own sample
    const ratios = {};
    for (const nid of ['39', '48', '30', '19']) { // Ohio, Texas, Montana, Iowa
      const myCap = Actions.nationTradeCapacityFor(nid);
      const ext = Actions.hasExportAccess(nid)
        ? Math.min(exportableValue(nid), myCap) * gainRate() * penalty() : 0;
      let bil = 0;
      for (const t of Game.adjacentNations(nid)) {
        const cap = Math.min(myCap, Actions.nationTradeCapacityFor(t));
        bil = Math.max(bil, Math.min(matchedValue(nid, t), cap) * gainRate());
      }
      ratios[Game.getNation(nid).name] = bil > 0 ? ext / bil : Infinity;
    }
    // review measured Ohio 5.7x, Texas 6.4x, Montana 25.0x, Iowa 1.7x
    for (const [name, r] of Object.entries(ratios)) {
      ok(r < 2, `${name}: the world market still pays ${r.toFixed(2)}x the best bilateral deal`);
    }
  });

  it('an untargeted sale pays a fraction of a matched one', async () => {
    ok(penalty() < 1, 'the world market pays the full bilateral rate');
    ok(penalty() > 0, 'the world market pays nothing at all');
  });
});

describe('Trade cooldown', () => {
  it('starts at zero and blocks after a deal', async () => {
    await bootWorld({ seed: SEED });
    equal(Actions.tradeCooldownLeft('06', 'world'), 0);
    Game.getNation('06').tradeCooldown.world = World.getTurn();
    equal(Actions.tradeCooldownLeft('06', 'world'), T().get('trade.cooldownTurns'));
  });

  it('expires after the configured number of world turns', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    Game.getNation('06').tradeCooldown.world = World.getTurn();
    const wait = T().get('trade.cooldownTurns');
    for (let i = 0; i < wait; i++) World.advanceTurn(T(), rng);
    equal(Actions.tradeCooldownLeft('06', 'world'), 0);
  });

  it('survives a save/load round trip', async () => {
    await bootWorld({ seed: SEED });
    Game.getNation('06').tradeCooldown = { world: 3, 41: 5 };
    const snap = JSON.parse(JSON.stringify(Game.serialize()));
    Game.getNation('06').tradeCooldown = {};
    Game.loadState(snap);
    equal(Game.getNation('06').tradeCooldown.world, 3);
    equal(Game.getNation('06').tradeCooldown['41'], 5);
  });
});

describe('Adjacency', () => {
  it('bordering nations share a real county border', async () => {
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '48', '36']) {
      for (const t of Game.borderingNations(nid)) {
        const touches = [...Game.getNation(nid).counties]
          .some((f) => Game.countyNeighbors(f).some((nb) => Game.getOwner(nb) === t));
        ok(touches, `${nid} lists ${t} as a land border but no county touches it`);
      }
    }
  });

  it('California does not share a land border with Alaska or Hawaii', async () => {
    await bootWorld({ seed: SEED });
    const land = Game.borderingNations('06');
    ok(!land.includes('02'), 'California land-borders Alaska');
    ok(!land.includes('15'), 'California land-borders Hawaii');
    // but the authored maritime rule still reaches them
    const sea = Game.maritimeNations('06');
    ok(sea.includes('02') || sea.includes('15'),
      'the deliberate maritime links from build_adjacency.py were lost');
  });

  it('adjacentNations is land plus sea, and every land neighbour is included', async () => {
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '30', '36']) {
      const all = new Set(Game.adjacentNations(nid));
      for (const t of Game.borderingNations(nid)) ok(all.has(t), `${nid}: land neighbour ${t} was dropped`);
      for (const t of Game.maritimeNations(nid)) ok(all.has(t), `${nid}: sea neighbour ${t} was dropped`);
    }
  });

  it('degrades correctly when a county changes hands', async () => {
    await bootWorld({ seed: SEED });
    const before = new Set(Game.borderingNations('06'));
    ok(!before.has('16'), 'fixture sanity: California should not border Idaho');
    // take a Nevada county that touches nothing new
    const nv = [...Game.annexTargets('06')].filter((f) => Game.getOwner(f) === '32').slice(0, 1);
    Game.moveCounties(nv, '06');
    const after = new Set(Game.borderingNations('06'));
    ok(!after.has('16'),
      'annexing one Nevada county made California a land neighbour of Idaho — that is the ' +
      'state-level adjacency degradation');
  });
});
