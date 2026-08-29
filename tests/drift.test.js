/*
 * M1.6 — the county grid must not collapse into a nation-level scalar.
 *
 * Political drift pulled every county toward its owner nation's mix, and
 * population growth added new residents in that same mix. Both forces pulled
 * toward ONE attractor and nothing pushed back. Measured per-turn deviation
 * multiplier 0.9703, half-life 23 turns: population-weighted within-nation stdev
 * of dem% went 12.5 -> 2.5 by turn 50, and nations in which every county carried
 * the same lean letter went 10/51 -> 51/51 by turn 200.
 *
 * Since "county party majority" is factor #1 of the sentiment model M4.2 builds,
 * that collapse leaves two-tier secession nothing to differentiate.
 *
 * ACCEPTANCE: median within-nation stdev of the dominant-ideology share stays
 * above 4 points at turn 200.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** Population-weighted within-nation stdev of dem%, on the core denominator. */
function medianWithinNationSd() {
  const out = [];
  for (const [, n] of Game.nations) {
    let W = 0, sum = 0;
    const rows = [];
    for (const f of n.counties) {
      const c = Game.county[f];
      const core = c.demPop + c.gopPop + c.othPop;
      if (core <= 0) continue;
      const x = (c.demPop / core) * 100;
      rows.push([x, core]);
      W += core;
      sum += x * core;
    }
    if (rows.length < 2 || !W) continue;
    const mean = sum / W;
    let v = 0;
    for (const [x, w] of rows) v += w * (x - mean) * (x - mean);
    out.push(Math.sqrt(v / W));
  }
  out.sort((a, b) => a - b);
  return out.length ? out[Math.floor(out.length / 2)] : 0;
}

/** Nations in which every county carries the same D/R letter. */
function monolithicNations() {
  let n = 0;
  for (const [, nat] of Game.nations) {
    let letter = null, same = true;
    for (const f of nat.counties) {
      const c = Game.county[f];
      const l = c.demPop >= c.gopPop ? 'D' : 'R';
      if (letter === null) letter = l;
      else if (letter !== l) { same = false; break; }
    }
    if (same) n++;
  }
  return n;
}

describe('Political drift', () => {
  it('every Area has a structural anchor derived from its founding character', async () => {
    await bootWorld({ seed: SEED });
    let differing = 0;
    for (const f in Game.county) {
      const a = Game.anchorOf(f);
      ok(a, `Area ${f} has no anchor`);
      close(a.d + a.g + a.o, 100, 1e-6, `Area ${f} anchor does not sum to 100`);
      if (Math.abs(a.d - 50) > 5) differing++;
    }
    ok(differing > 1000, 'the anchors are nearly all identical; there is no structure to anchor to');
  });

  it('the drift target blends owner, anchor and neighbourhood', async () => {
    const t = T();
    const wO = t.get('world.driftOwnerWeight');
    const wA = t.get('world.driftAnchorWeight');
    const wN = 1 - wO - wA;
    ok(wO > 0, 'the owner nation must still pull');
    ok(wA > 0, 'without an anchor every county shares one fixed point');
    ok(wN > 0, 'without a neighbourhood term the surviving spread is salt-and-pepper, not a gradient');
    close(wO + wA + wN, 1, 1e-9);
  });

  it('new residents do not all arrive in the national mix', async () => {
    ok(T().get('world.growthMixNationWeight') < 1,
      'population growth is a second unopposed attractor at exactly the drift fixed point');
  });

  it('ACCEPTANCE: within-nation spread stays above 4 points at turn 200', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const start = medianWithinNationSd();
    ok(start > 10, `fixture sanity: expected ~13 points of spread at turn 0, got ${start.toFixed(2)}`);

    for (let i = 0; i < 200; i++) World.advanceTurn(T(), rng);
    const end = medianWithinNationSd();
    ok(end >= 4,
      `median within-nation stdev of dem% fell to ${end.toFixed(2)} at turn 200 (floor is 4). ` +
      'The old model reached 0.026.');
  });

  it('the spread STABILISES rather than decaying — it has a stationary value', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 200; i++) World.advanceTurn(T(), rng);
    const at200 = medianWithinNationSd();
    for (let i = 0; i < 100; i++) World.advanceTurn(T(), rng);
    const at300 = medianWithinNationSd();
    ok(at300 > at200 * 0.9,
      `spread fell from ${at200.toFixed(2)} at t200 to ${at300.toFixed(2)} at t300 — ` +
      'still decaying, so the fixed point has no counter-force, only a slower approach');
  });

  it('nations do not all become politically monolithic', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = monolithicNations();
    for (let i = 0; i < 200; i++) World.advanceTurn(T(), rng);
    const after = monolithicNations();
    const total = Game.nations.size;
    ok(after < total * 0.75,
      `${after}/${total} nations are politically uniform at turn 200 (was 10/51 at turn 0; ` +
      'the old model reached 51/51)');
  });

  it('drift noise is bounded and does not create or destroy people', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      before[f] = c.demPop + c.gopPop + c.othPop;
    }
    const owners = World.snapshotOwners();
    const snap = {}, nxt = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      snap[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
      nxt[f] = { demPop: c.demPop, gopPop: c.gopPop, othPop: c.othPop, ext: { ...c.ext }, gdp: c.gdp };
    }
    const leans = World.phaseRecomputeLeans(snap, nxt, owners);
    World.phasePoliticalDrift(snap, nxt, leans, T(), owners, rng);
    for (const f in nxt) {
      const v = nxt[f];
      close(v.demPop + v.gopPop + v.othPop, before[f], 1e-6, `drift changed the core population of ${f}`);
      ok(v.demPop >= 0 && v.gopPop >= 0 && v.othPop >= 0, `${f} went negative under noise`);
    }
  });

  it('drift is reproducible for a given rng', async () => {
    const fp = async () => {
      const w = await bootWorld({ seed: 31337 });
      for (let i = 0; i < 15; i++) World.advanceTurn(T(), w.rng);
      let d = 0;
      for (const f in Game.county) d += Game.county[f].demPop;
      return Number(d.toPrecision(12));
    };
    equal(await fp(), await fp(), 'two identical runs diverged — the drift noise is not seeded');
  });
});

describe('Area adjacency cache', () => {
  it('returns the same array for repeated queries', async () => {
    await bootWorld({ seed: SEED });
    const a = Game.countyNeighbors('06037');
    const b = Game.countyNeighbors('06037');
    equal(a, b, 'the neighbour list is reallocated on every query');
    ok(a.length > 0);
  });

  it('never lists an Area as its own neighbour', async () => {
    await bootWorld({ seed: SEED });
    for (const f of Object.keys(Game.county).slice(0, 500)) {
      ok(!Game.countyNeighbors(f).includes(f), `${f} is its own neighbour`);
    }
  });
});
