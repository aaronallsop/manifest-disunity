/*
 * M3.1 — the Why-record convention, and Authority on top of it.
 *
 * The convention is the thing under test more than any individual weight. A Why
 * record is what makes M5's "show your work" free, and it is what lets a test
 * assert a CONTRIBUTION rather than an outcome — so a formula change that
 * happens to preserve the total still fails the test that cared about the term.
 * Most of what follows is therefore written against the pure function with
 * hand-made inputs, not against the live world.
 *
 * The other property under test is the anti-death-spiral guarantee: the CHANGE
 * is rate-limited, not the value. That distinction is the whole difference
 * between "a bad decade" and "one bad turn ends you", and it has to hold before
 * any of the weights are worth tuning.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld } from './world-fixture.js';
import * as Pw from '../js/power.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** A nation with nothing going on: no age, no history, no money, no cohesion. */
const blank = (over = {}) => ({
  turn: 0, founded: 0, since: 0, cohesion: 0,
  treasury: 0, upkeep: 1e9, areas: 10, occupied: 0,
  gains: [], losses: [], previous: null, ...over,
});

describe('Normalisation curves', () => {
  it('ramp is linear to full and flat after', () => {
    close(Pw.ramp(0, 10), 0, 1e-12);
    close(Pw.ramp(5, 10), 0.5, 1e-12);
    close(Pw.ramp(10, 10), 1, 1e-12);
    close(Pw.ramp(1000, 10), 1, 1e-12, 'ramp exceeded 1');
    close(Pw.ramp(-5, 10), 0, 1e-12, 'ramp went negative');
    close(Pw.ramp(5, 0), 0, 1e-12, 'a zero scale should be 0, not NaN');
  });

  it('saturate has diminishing returns and never quite reaches 1', () => {
    close(Pw.saturate(0, 6), 0, 1e-12);
    close(Pw.saturate(6, 6), 0.5, 1e-12, 'k should be the half-way point');
    ok(Pw.saturate(1000, 6) < 1, 'saturate reached 1');
    ok(Pw.saturate(12, 6) - Pw.saturate(6, 6) < Pw.saturate(6, 6) - Pw.saturate(0, 6),
      'the second six events counted as much as the first six');
  });

  it('clamp01 turns non-numbers into 0 rather than propagating NaN', () => {
    equal(Pw.clamp01(NaN), 0);
    equal(Pw.clamp01(Infinity), 1);
    equal(Pw.clamp01(-Infinity), 0);
    equal(Pw.clamp01(0.5), 0.5);
  });
});

describe('The Why record', () => {
  const terms = () => ([
    { label: 'Good', raw: 10, norm: 0.5, key: 'power.authority.wAge' },
    { label: 'Bad', raw: 3, norm: 1.0, key: 'power.authority.wLosses' },
  ]);

  it('reports every input with the tunable key that moves it', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.build(0.3, terms(), T());
    equal(r.inputs.length, 2);
    for (const i of r.inputs) {
      ok(i.key && T().peek(i.key) !== undefined, `input "${i.label}" names an unknown tunable "${i.key}"`);
      close(i.contribution, i.weight * i.norm, 1e-12, `${i.label}'s contribution is not weight x norm`);
    }
  });

  it('the value is the base plus every contribution, clamped', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.build(0.3, terms(), T());
    let sum = 0.3;
    for (const i of r.inputs) sum += i.contribution;
    close(r.raw, sum, 1e-12, 'raw is not the honest sum');
    close(r.value, Pw.clamp01(sum), 1e-12);
  });

  it('keeps the UNCLAMPED total, so "pinned at the floor under 0.4 of pressure" is answerable', async () => {
    await bootWorld({ seed: SEED });
    const heavy = [{ label: 'Bad', raw: 99, norm: 1, key: 'power.authority.wLosses' },
                   { label: 'Worse', raw: 99, norm: 1, key: 'power.authority.wOccupation' }];
    const r = Pw.build(0.1, heavy, T());
    equal(r.value, 0, 'the value should clamp at 0');
    ok(r.raw < 0, `raw was clamped too (${r.raw}); the pressure is no longer visible`);
  });

  it('the summary is built from the same array the panel renders', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.build(0.3, terms(), T());
    ok(typeof r.summary === 'string' && r.summary.length > 3);
    // it names the largest positive and the largest negative, both from `inputs`
    const up = r.inputs.filter((i) => i.contribution > 0).sort((a, b) => b.contribution - a.contribution)[0];
    const down = r.inputs.filter((i) => i.contribution < 0).sort((a, b) => a.contribution - b.contribution)[0];
    if (up) ok(r.summary.toLowerCase().includes(up.label.toLowerCase()), `summary omits "${up.label}"`);
    if (down) ok(r.summary.toLowerCase().includes(down.label.toLowerCase()), `summary omits "${down.label}"`);
  });

  it('skips nothing silently: a term with a zero weight is still reported', async () => {
    await bootWorld({ seed: SEED });
    const was = T().peek('power.authority.wAge');
    try {
      T().set('power.authority.wAge', 0);
      const r = Pw.build(0.3, terms(), T());
      equal(r.inputs.length, 2, 'a zero-weight term vanished from the explanation');
      equal(r.inputs[0].contribution, 0);
    } finally {
      T().set('power.authority.wAge', was); // TUNE is shared; a leak poisons every later suite
    }
  });
});

describe('The stock discipline', () => {
  it('a fresh stock opens AT its target, not at the floor', async () => {
    await bootWorld({ seed: SEED });
    close(Pw.step(null, 0.62, T()), 0.62, 1e-12,
      'a new nation would spend fifteen turns climbing to its own opening value');
  });

  it('rises by at most maxRise and falls by at most maxFall', async () => {
    await bootWorld({ seed: SEED });
    const rise = T().get('power.maxRise'), fall = T().get('power.maxFall');
    close(Pw.step(0.5, 1.0, T()), 0.5 + rise, 1e-12, 'a stock jumped to its target');
    close(Pw.step(0.5, 0.0, T()), Math.max(T().get('power.floor'), 0.5 - fall), 1e-12);
    // a small move is not rate-limited
    close(Pw.step(0.5, 0.51, T()), 0.51, 1e-12);
  });

  it('falls faster than it rises — standing is easier to lose than to build', async () => {
    await bootWorld({ seed: SEED });
    ok(T().get('power.maxFall') > T().get('power.maxRise'),
      'maxFall is not greater than maxRise');
  });

  it('never goes below the floor, however hard it is pushed', async () => {
    await bootWorld({ seed: SEED });
    const floor = T().get('power.floor');
    let v = 0.9;
    for (let i = 0; i < 50; i++) v = Pw.step(v, -5, T());
    close(v, floor, 1e-12, `fifty catastrophic turns drove the stock to ${v}`);
    // and it can climb back out, which is the point of a floor rather than a sink
    for (let i = 0; i < 50; i++) v = Pw.step(v, 1, T());
    ok(v > 0.9, `the stock could not recover from the floor (reached ${v})`);
  });

  it('takes a decade of bad turns to collapse, not one', async () => {
    await bootWorld({ seed: SEED });
    let v = 0.7, turns = 0;
    while (v > 0.2 && turns < 100) { v = Pw.step(v, 0, T()); turns++; }
    ok(turns >= 6, `a stock fell from 0.7 to 0.2 in ${turns} turns; that is a cliff, not a decline`);
    ok(turns <= 20, `it took ${turns} turns to fall from 0.7 to 0.2; nothing would ever feel consequential`);
  });
});

describe('Authority', () => {
  it('a brand-new, broke, divided nation sits low but not at zero', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.authority(blank(), T());
    close(r.value, T().get('power.authority.base'), 1e-9,
      'a nation with every input at zero should sit exactly at the base');
    ok(r.value > 0 && r.value < 0.5);
  });

  it('names every one of its terms, each with a real tunable', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.authority(blank(), T());
    const labels = r.inputs.map((i) => i.label);
    for (const want of ['Age', 'Tenure', 'Wars won', 'Solvency', 'Cohesion',
                        'Territory lost', 'Occupation', 'Overreach']) {
      ok(labels.includes(want), `Authority does not report "${want}"`);
    }
    for (const i of r.inputs) {
      ok(T().peek(i.key) !== undefined, `"${i.label}" names unknown tunable ${i.key}`);
      ok(i.note && i.note.length > 5, `"${i.label}" has no note explaining what its raw number is`);
    }
  });

  it('age and tenure raise it, and stop paying past their full point', async () => {
    await bootWorld({ seed: SEED });
    const at = (turn) => Pw.authority(blank({ turn }), T()).value;
    ok(at(20) > at(0), 'age did not help');
    const full = T().get('power.authority.ageFull');
    close(at(full * 3), at(full), 1e-9, 'age kept paying past its full point');
  });

  it('losing territory hurts more than taking it helps — the largest weight', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    ok(Math.abs(t.get('power.authority.wLosses')) > t.get('power.authority.wWars'),
      'losing ground weighs less than taking it');
    const won = Pw.authority(blank({ turn: 10, gains: [{ turn: 9, areas: 6, reason: 'war' }] }), t).value;
    const lost = Pw.authority(blank({ turn: 10, losses: [{ turn: 9, areas: 6 }] }), t).value;
    const flat = Pw.authority(blank({ turn: 10 }), t).value;
    ok(won > flat, 'a won war did not raise Authority');
    ok(lost < flat, 'losing six Areas did not lower Authority');
    ok(flat - lost > won - flat, 'the loss cost less than the equivalent gain paid');
  });

  it('only remembers inside the window', async () => {
    await bootWorld({ seed: SEED });
    const w = T().get('nation.historyWindow');
    const fresh = Pw.authority(blank({ turn: 50, losses: [{ turn: 50 - 1, areas: 8 }] }), T());
    const stale = Pw.authority(blank({ turn: 50, losses: [{ turn: 50 - w - 5, areas: 8 }] }), T());
    const lossFresh = fresh.inputs.find((i) => i.label === 'Territory lost');
    const lossStale = stale.inputs.find((i) => i.label === 'Territory lost');
    ok(lossFresh.contribution < 0, 'a recent loss contributed nothing');
    equal(lossStale.contribution, 0, 'a loss older than the window still counts');
  });

  it('overreach is what stops conquest being a pure Authority engine', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    const steady = Pw.authority(blank({ turn: 20, gains: [{ turn: 19, areas: 3, reason: 'war' }] }), t);
    const blitz = Pw.authority(blank({
      turn: 20,
      gains: Array.from({ length: 12 }, (_, i) => ({ turn: 8 + i, areas: 6, reason: 'war' })),
    }), t);
    const bWar = blitz.inputs.find((i) => i.label === 'Wars won').contribution;
    const bOver = blitz.inputs.find((i) => i.label === 'Overreach').contribution;
    ok(bWar > 0 && bOver < 0, 'the blitz did not register on both terms');
    ok(blitz.value < steady.value,
      `taking 72 Areas in twelve turns (${blitz.value.toFixed(3)}) beat taking 3 ` +
      `(${steady.value.toFixed(3)}); conquest is a pure Authority engine`);
  });

  it('occupying foreign ground costs, holding your own does not', async () => {
    await bootWorld({ seed: SEED });
    const home = Pw.authority(blank({ areas: 50, occupied: 0 }), T());
    const empire = Pw.authority(blank({ areas: 50, occupied: 40 }), T());
    equal(home.inputs.find((i) => i.label === 'Occupation').contribution, 0);
    ok(empire.value < home.value, 'occupation was free');
  });

  it('solvency and cohesion both help', async () => {
    await bootWorld({ seed: SEED });
    const broke = Pw.authority(blank({ treasury: 0, upkeep: 1e9 }), T()).value;
    const rich = Pw.authority(blank({ treasury: 1e11, upkeep: 1e9 }), T()).value;
    ok(rich > broke, 'reserves did not help');
    const split = Pw.authority(blank({ cohesion: 0 }), T()).value;
    const united = Pw.authority(blank({ cohesion: 1 }), T()).value;
    ok(united > split, 'a united population did not help');
  });

  it('an infinite solvency ratio does not become NaN', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.authority(blank({ treasury: 1e9, upkeep: 0 }), T());
    ok(Number.isFinite(r.value), `a zero-upkeep nation produced ${r.value}`);
    ok(r.value > 0);
  });

  it('reports the target beside the rate-limited value', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.authority(blank({ turn: 40, cohesion: 1, treasury: 1e12, upkeep: 1e9, previous: 0.2 }), T());
    ok(r.target > r.value, 'the record does not show where the stock is heading');
    close(r.value, 0.2 + T().get('power.maxRise'), 1e-9, 'the stock was not rate-limited');
  });
});

describe('Authority in the live world', () => {
  it('every nation has one at turn 0', async () => {
    await bootWorld({ seed: SEED });
    for (const [, n] of Game.nations) {
      ok(typeof n.authority === 'number' && Number.isFinite(n.authority),
        `${n.name} has no Authority; whoever built the world did not call World.begin`);
      ok(n.authority > 0 && n.authority <= 1, `${n.name}'s Authority is ${n.authority}`);
      ok(n.why && n.why.authority && n.why.authority.inputs.length > 0,
        `${n.name} has an Authority with no explanation attached`);
    }
  });

  it('opens in a spread, not on one number', async () => {
    await bootWorld({ seed: SEED });
    const vals = [...Game.nations.values()].map((n) => n.authority);
    const min = Math.min(...vals), max = Math.max(...vals);
    ok(max - min > 0.02,
      `every nation opened between ${min.toFixed(3)} and ${max.toFixed(3)}; Authority says nothing`);
  });

  it('is recomputed every world turn, and moves', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = new Map([...Game.nations].map(([id, n]) => [id, n.authority]));
    for (let i = 0; i < 12; i++) World.advanceTurn(T(), rng);
    let moved = 0;
    for (const [id, was] of before) {
      const n = Game.getNation(id);
      if (n && Math.abs(n.authority - was) > 1e-9) moved++;
    }
    ok(moved > 25, `only ${moved} of 51 nations' Authority moved in twelve turns`);
  });

  it('a nation that loses a war loses standing, over turns rather than at once', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
    const victim = '32';
    const before = Game.getNation(victim).authority;
    Game.moveCounties([...Game.getNation(victim).counties].slice(0, 8), '06', { reason: 'war' });
    World.advanceTurn(T(), rng);
    const after1 = Game.getNation(victim).authority;
    ok(after1 < before, `losing eight Areas did not cost Nevada anything (${before} -> ${after1})`);
    ok(before - after1 <= T().get('power.maxFall') + 1e-9,
      `Nevada lost ${(before - after1).toFixed(3)} in one turn against a cap of ${T().get('power.maxFall')}`);
  });

  it('survives a save round-trip as a stock, not as a fresh computation', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 8; i++) World.advanceTurn(T(), rng);
    Game.moveCounties([...Game.getNation('32').counties].slice(0, 6), '06', { reason: 'war' });
    World.advanceTurn(T(), rng);
    const want = new Map([...Game.nations].map(([id, n]) => [id, n.authority]));

    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    await bootWorld({ seed: 777 });
    Game.loadState(doc);
    for (const [id, v] of want) {
      close(Game.getNation(id).authority, v, 1e-12,
        `${id}'s Authority was recomputed on load instead of restored; a stock has to remember`);
    }
  });

  it('a document with no Authority gets one rather than a null', async () => {
    await bootWorld({ seed: SEED });
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    for (const n of doc.nations) delete n.authority;
    Game.loadState(doc);
    World.begin(T(), (n) => n.authority == null);
    for (const [, n] of Game.nations) {
      ok(typeof n.authority === 'number', `${n.name} loaded from an old document with no Authority`);
    }
  });
});

describe('Influence', () => {
  /*
   * Influence is promoted, not invented: `evalTransit` in actions.js has been
   * computing an ad-hoc, stateless version of relative economic size and
   * political alignment inline per trade dialog since M1, recomputing it every
   * time and throwing it away. What is new here is that it persists, that it
   * covers the world rather than one partner, and that taking ground costs it.
   */
  const iBlank = (over = {}) => ({
    turn: 0, gdpShare: 0, alignment: 0, partners: 0,
    areas: 10, occupied: 0, gains: [], previous: null, ...over,
  });

  it('a nation with no economy, no partners and no friends sits at the base', async () => {
    await bootWorld({ seed: SEED });
    close(Pw.influence(iBlank(), T()).value, T().get('power.influence.base'), 1e-9);
  });

  it('starts lower than Authority, because standing abroad has to be earned', async () => {
    await bootWorld({ seed: SEED });
    ok(T().get('power.influence.base') < T().get('power.authority.base'),
      'a nation has authority over its own people by existing, and influence over anyone else only by earning it');
  });

  it('names every term with a real tunable and a note', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.influence(iBlank(), T());
    const labels = r.inputs.map((i) => i.label);
    for (const want of ['Economic weight', 'Reach', 'Alignment', 'Conquest', 'Blitz', 'Occupation']) {
      ok(labels.includes(want), `Influence does not report "${want}"`);
    }
    for (const i of r.inputs) {
      ok(T().peek(i.key) !== undefined, `"${i.label}" names unknown tunable ${i.key}`);
      ok(i.note && i.note.length > 5, `"${i.label}" has no note`);
    }
  });

  it('economy, reach and alignment each raise it', async () => {
    await bootWorld({ seed: SEED });
    const base = Pw.influence(iBlank(), T()).value;
    ok(Pw.influence(iBlank({ gdpShare: 0.2 }), T()).value > base, 'a big economy did not help');
    ok(Pw.influence(iBlank({ partners: 10 }), T()).value > base, 'trade reach did not help');
    ok(Pw.influence(iBlank({ alignment: 1 }), T()).value > base, 'a world that agrees with you did not help');
  });

  it('conquest costs MORE to a nation that already had standing — the (1 + influence) rule', async () => {
    /*
     * The design's context-dependent scaling. A superpower annexing a neighbour
     * pays more in reputation than an unknown does, because it had more to
     * spend. Compared on the CONTRIBUTION rather than the value, because the two
     * nations start from different places and their totals are not comparable.
     */
    await bootWorld({ seed: SEED });
    const gains = [{ turn: 5, areas: 8, reason: 'annex' }];
    const nobody = Pw.influence(iBlank({ turn: 6, gains, previous: 0.1 }), T());
    const power = Pw.influence(iBlank({ turn: 6, gains, previous: 0.9 }), T());
    const cN = nobody.inputs.find((i) => i.label === 'Conquest').contribution;
    const cP = power.inputs.find((i) => i.label === 'Conquest').contribution;
    ok(cP < cN, `the same annexation cost the superpower ${cP.toFixed(4)} and the unknown ${cN.toFixed(4)}`);
    // and the raw input shows the scaling explicitly
    close(power.inputs.find((i) => i.label === 'Conquest').raw, 8 * 1.9, 1e-9);
    close(nobody.inputs.find((i) => i.label === 'Conquest').raw, 8 * 1.1, 1e-9);
  });

  it('a brand-new nation scales conquest by 1, not by 1 + nothing', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.influence(iBlank({ turn: 6, gains: [{ turn: 5, areas: 4, reason: 'annex' }], previous: null }), T());
    close(r.inputs.find((i) => i.label === 'Conquest').raw, 4, 1e-9,
      'a null previous influence produced NaN or the wrong multiplier');
    ok(Number.isFinite(r.value));
  });

  it('taking ground fast costs on top of taking it at all', async () => {
    await bootWorld({ seed: SEED });
    const slow = Pw.influence(iBlank({ turn: 40, previous: 0.5,
      gains: [{ turn: 39, areas: 4, reason: 'annex' }] }), T());
    const fast = Pw.influence(iBlank({ turn: 40, previous: 0.5,
      gains: Array.from({ length: 10 }, (_, i) => ({ turn: 30 + i, areas: 4, reason: 'annex' })) }), T());
    ok(fast.inputs.find((i) => i.label === 'Blitz').contribution < 0, 'a blitz cost nothing');
    equal(slow.inputs.find((i) => i.label === 'Blitz').contribution, 0,
      'one annexation in ten turns counted as a blitz');
    /*
     * Compared on the TARGET, not the value. Both nations are falling fast
     * enough to hit `maxFall` in the same turn, so their post-limit values are
     * identical (0.42 measured) — which is the anti-spiral guarantee doing
     * exactly its job, and a nice demonstration that a test written against the
     * value would have been asserting the rate limiter rather than the term.
     */
    ok(fast.target < slow.target,
      `a ten-turn blitz targets ${fast.target.toFixed(3)} against ${slow.target.toFixed(3)} for one annexation`);
    close(fast.value, slow.value, 1e-12,
      'both should be pinned at the same maxFall this turn; the rate limit is not binding');
    close(fast.value, 0.5 - T().get('power.maxFall'), 1e-12);
  });

  it('the world tolerates expansion less readily than your own institutions do', async () => {
    await bootWorld({ seed: SEED });
    ok(T().get('power.influence.paceFree') < T().get('power.authority.paceFree'),
      'your neighbours forgive expansion faster than your own state can digest it');
  });

  it('is rate-limited like every other stock', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.influence(iBlank({ gdpShare: 0.5, alignment: 1, partners: 20, previous: 0.1 }), T());
    ok(r.target > r.value, 'the record does not show where it is heading');
    close(r.value, 0.1 + T().get('power.maxRise'), 1e-9, 'Influence jumped to its target');
  });
});

describe('Influence in the live world', () => {
  it('every nation has one, in a spread', async () => {
    await bootWorld({ seed: SEED });
    const vals = [];
    for (const [, n] of Game.nations) {
      ok(typeof n.influence === 'number' && Number.isFinite(n.influence), `${n.name} has no Influence`);
      ok(n.why.influence && n.why.influence.inputs.length === 9,
        `Influence reported ${n.why.influence.inputs.length} terms`);
      vals.push(n.influence);
    }
    const min = Math.min(...vals), max = Math.max(...vals);
    ok(max - min > 0.02, `every nation opened between ${min.toFixed(3)} and ${max.toFixed(3)}`);
  });

  it('the big economies lead it', async () => {
    await bootWorld({ seed: SEED });
    const byInfluence = [...Game.nations.values()].sort((a, b) => b.influence - a.influence);
    const byGdp = [...Game.nations.keys()]
      .map((id) => ({ id, gdp: Game.nationDemographics(id).gdp }))
      .sort((a, b) => b.gdp - a.gdp);
    const topGdp = new Set(byGdp.slice(0, 8).map((r) => r.id));
    const hits = byInfluence.slice(0, 8).filter((n) => topGdp.has(n.id)).length;
    ok(hits >= 5, `only ${hits} of the eight most influential nations are in the top eight economies`);
  });

  it('the world context is computed once, not once per nation', async () => {
    await bootWorld({ seed: SEED });
    const ctx = Power.worldContext();
    equal(ctx.rows.length, Game.nations.size);
    let sum = 0;
    for (const r of ctx.rows) sum += r.gdp;
    close(ctx.gdp, sum, 1e-6, 'the world GDP total does not match its own rows');
    const ca = Power.gatherInfluence(Power.nationFacts('06', T()), 0, T(), ctx);
    close(ca.gdpShare, Game.nationDemographics('06').gdp / ctx.gdp, 1e-12);
  });

  it('alignment is the pairwise trade-panel number, generalised to the world', async () => {
    await bootWorld({ seed: SEED });
    const ctx = Power.worldContext();
    const worst = Ideology.affinity('green', 'yellow');
    for (const nid of ['06', '48', '49', '10']) {
      const a = Power.gatherInfluence(Power.nationFacts(nid, T()), 0, T(), ctx).alignment;
      ok(a > 0 && a < 1, `${nid}'s alignment is ${a}, outside the open interval`);
      ok(a > worst, `${nid} is less aligned with the whole world than the two furthest ideologies are`);
    }
  });

  it('conquering the map costs Influence while it builds Authority', async () => {
    /*
     * The two stocks must be able to disagree — that is the whole reason there
     * are two of them. A nation that conquers its neighbours gets more secure at
     * home and less listened to abroad.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 3; i++) World.advanceTurn(T(), rng);
    const nid = '06';
    const i0 = Game.getNation(nid).influence;
    for (let t = 0; t < 14; t++) {
      const targets = [...Game.annexTargets(nid)].slice(0, 5);
      if (targets.length) Game.moveCounties(targets, nid, { reason: 'war' });
      World.advanceTurn(T(), rng);
    }
    const n = Game.getNation(nid);
    ok(n.influence < i0,
      `Influence went ${i0.toFixed(3)} -> ${n.influence.toFixed(3)} after conquering everything in reach`);
    const conquest = n.why.influence.inputs.find((i) => i.label === 'Conquest');
    ok(conquest.contribution < -0.05, `conquest contributed only ${conquest.contribution.toFixed(4)}`);
    ok(n.authority > T().get('power.floor'), 'Authority collapsed too; the two stocks are not independent');
  });

  it('survives a save round-trip as a stock', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
    Game.moveCounties([...Game.getNation('32').counties].slice(0, 5), '06', { reason: 'annex' });
    World.advanceTurn(T(), rng);
    const want = new Map([...Game.nations].map(([id, n]) => [id, n.influence]));
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    await bootWorld({ seed: 777 });
    Game.loadState(doc);
    for (const [id, v] of want) {
      close(Game.getNation(id).influence, v, 1e-12, `${id}'s Influence was recomputed instead of restored`);
    }
  });
});

describe('Quality of Life', () => {
  /*
   * The instruction was "food and healthcare as NEEDS, not just sectors". A
   * share of output is a fact about an economy; what matters is production per
   * PERSON against a per-person requirement, so the same agricultural output
   * feeds a small nation and starves a large one. These tests are mostly about
   * that distinction.
   */
  const qBlank = (over = {}) => ({
    turn: 0, pop: 1e6, gdp: 0, agriculture: 0,
    treasuryDelta: 0, income: 1e9, previous: null, ...over,
  });
  // Comfortably above the requirement, in the model's units: see qol.foodPerCapita.
  const fed = (over = {}) => qBlank({ agriculture: 1e6 * 12000, gdp: 1e6 * 90000, ...over });

  it('a nation with no food and no money sits at the base', async () => {
    await bootWorld({ seed: SEED });
    close(Pw.qol(qBlank(), T()).value, T().get('qol.base'), 1e-9);
  });

  it('food is measured PER PERSON, not as a share of output', async () => {
    await bootWorld({ seed: SEED });
    const ag = 1e6 * 12000;            // enough for a million people
    const small = Pw.qol(qBlank({ pop: 1e6, agriculture: ag }), T());
    const large = Pw.qol(qBlank({ pop: 20e6, agriculture: ag }), T());
    const fSmall = small.inputs.find((i) => i.label === 'Food security');
    const fLarge = large.inputs.find((i) => i.label === 'Food security');
    equal(fSmall.norm, 1, 'a well-fed nation is not reading as fed');
    ok(fLarge.norm < 0.2,
      `the same harvest fed twenty times the people (${fLarge.norm.toFixed(3)}); ` +
      'food is being read as a share of output rather than as a need');
  });

  it('food can be BOUGHT — the District of Columbia does not starve', async () => {
    /*
     * Without the import term the model says every nation that does not farm is
     * hungry, which is not a claim about the world; it is a claim about a model
     * that confused growing food with having food.
     */
    await bootWorld({ seed: SEED });
    const rich = Pw.qol(qBlank({ pop: 1e6, agriculture: 0, gdp: 1e6 * 500000 }), T());
    const poor = Pw.qol(qBlank({ pop: 1e6, agriculture: 0, gdp: 1e6 * 60000 }), T());
    ok(rich.inputs.find((i) => i.label === 'Food security').norm > 0.9,
      'a rich nation with no farms went hungry');
    ok(poor.inputs.find((i) => i.label === 'Food security').norm < 0.4,
      'a poor nation with no farms is somehow fed');
    // agriculture OR money; neither is fatal
    ok(rich.value > poor.value);
  });

  it('hunger gets its own sentence, because nothing else matters as much', async () => {
    await bootWorld({ seed: SEED });
    const hungry = Pw.qol(qBlank({ pop: 50e6, agriculture: 1e6 * 100, gdp: 50e6 * 5000 }), T());
    ok(/hungry/i.test(hungry.summary), `the summary of a starving nation reads "${hungry.summary}"`);
    ok(T().get('qol.wFood') >= T().get('qol.wHealth'), 'food does not outweigh healthcare');
  });

  it('healthcare is bought out of income, not faked as a seventh sector', async () => {
    await bootWorld({ seed: SEED });
    const poor = Pw.qol(fed({ gdp: 1e6 * 20000 }), T());
    const rich = Pw.qol(fed({ gdp: 1e6 * 200000 }), T());
    const hPoor = poor.inputs.find((i) => i.label === 'Healthcare');
    const hRich = rich.inputs.find((i) => i.label === 'Healthcare');
    ok(hRich.contribution > hPoor.contribution, 'income did not buy healthcare');
    equal(hRich.norm, 1, 'a rich nation cannot fully fund care');
  });

  it('a deficit costs, measured against income rather than in dollars', async () => {
    await bootWorld({ seed: SEED });
    const balanced = Pw.qol(fed({ treasuryDelta: 0, income: 1e10 }), T());
    const small = Pw.qol(fed({ treasuryDelta: -1e9, income: 1e10 }), T());   // 10% of income
    const big = Pw.qol(fed({ treasuryDelta: -1e9, income: 2e9 }), T());      // 50% of income
    ok(small.value < balanced.value, 'a deficit was free');
    ok(big.value < small.value,
      'the same dollar deficit cost a small economy no more than a large one');
    equal(balanced.inputs.find((i) => i.label === 'Fiscal strain').contribution, 0);
  });

  it('a surplus is not a bonus — only shortfall counts', async () => {
    await bootWorld({ seed: SEED });
    const a = Pw.qol(fed({ treasuryDelta: 0 }), T()).value;
    const b = Pw.qol(fed({ treasuryDelta: 5e9 }), T()).value;
    close(a, b, 1e-12, 'running a surplus improved daily life, which is not what the term measures');
  });

  it('a nation with no people produces no NaN', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.qol(qBlank({ pop: 0, gdp: 0, income: 0 }), T());
    ok(Number.isFinite(r.value), `an empty nation produced ${r.value}`);
  });
});

describe('Civil Liberties', () => {
  const lBlank = (over = {}) => ({
    turn: 0, alignment: 0, cohesion: 1, perCapita: 0,
    areas: 10, occupied: 0, govType: 'Republic', previous: null, ...over,
  });

  it('names every term with a real tunable and a note', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.liberties(lBlank(), T());
    const labels = r.inputs.map((i) => i.label);
    for (const want of ['Alignment at home', 'Government', 'Prosperity',
                        'A divided people', 'Occupation']) {
      ok(labels.includes(want), `Civil Liberties does not report "${want}"`);
    }
    for (const i of r.inputs) {
      ok(T().peek(i.key) !== undefined, `"${i.label}" names unknown tunable ${i.key}`);
      ok(i.note && i.note.length > 5, `"${i.label}" has no note`);
    }
  });

  it('governing people who agree with you is what lets you govern them lightly', async () => {
    await bootWorld({ seed: SEED });
    const aligned = Pw.liberties(lBlank({ alignment: 1 }), T()).value;
    const opposed = Pw.liberties(lBlank({ alignment: 0 }), T()).value;
    ok(aligned > opposed, 'a state governing people who agree with it is no freer');
    ok(T().get('liberty.wAlignment') >= T().get('liberty.wGovernment'),
      'alignment is not the hinge it is documented to be');
  });

  it('a DIVIDED people is a separate pressure from a distant one', async () => {
    /*
     * The two are genuinely different situations and only cohesion tells them
     * apart: a nation uniformly mildly-opposed (low alignment, high cohesion)
     * versus one split into two camps that agree with the government equally
     * little (same alignment, low cohesion). The second is far harder to govern
     * liberally.
     */
    await bootWorld({ seed: SEED });
    const united = Pw.liberties(lBlank({ alignment: 0.5, cohesion: 1 }), T());
    const split = Pw.liberties(lBlank({ alignment: 0.5, cohesion: 0 }), T());
    equal(united.inputs.find((i) => i.label === 'Alignment at home').contribution,
      split.inputs.find((i) => i.label === 'Alignment at home').contribution,
      'the two cases differ on alignment; the test is not isolating cohesion');
    ok(split.value < united.value,
      'an evenly split population is as easy to govern liberally as a united one');
  });

  it('occupation is the largest single cost — occupied ground is governed differently', async () => {
    await bootWorld({ seed: SEED });
    const home = Pw.liberties(lBlank({ areas: 50, occupied: 0 }), T());
    const empire = Pw.liberties(lBlank({ areas: 50, occupied: 45 }), T());
    ok(empire.value < home.value, 'occupation was free');
    ok(Math.abs(T().get('liberty.wOccupation')) >= Math.abs(T().get('liberty.wDivided')),
      'occupation weighs less than internal division');
  });

  it('an unknown government type falls back rather than producing NaN', async () => {
    await bootWorld({ seed: SEED });
    const r = Pw.liberties(lBlank({ govType: 'Technocracy' }), T());
    ok(Number.isFinite(r.value), `an unlisted government produced ${r.value}`);
    close(r.inputs.find((i) => i.label === 'Government').raw,
      T().get('qol.govTolerance').Republic, 1e-12, 'the fallback is not the Republic rate');
  });
});

describe('QoL and Liberties in the live world', () => {
  it('every nation has both, in a spread', async () => {
    await bootWorld({ seed: SEED });
    const q = [], l = [];
    for (const [, n] of Game.nations) {
      ok(Number.isFinite(n.qol), `${n.name} has no QoL`);
      ok(Number.isFinite(n.liberties), `${n.name} has no Civil Liberties`);
      ok(n.why.qol && n.why.liberties, `${n.name} has values with no explanation`);
      q.push(n.qol); l.push(n.liberties);
    }
    ok(Math.max(...q) - Math.min(...q) > 0.03,
      `QoL spans only ${(Math.max(...q) - Math.min(...q)).toFixed(3)}`);
    ok(Math.max(...l) - Math.min(...l) > 0.03,
      `Liberties span only ${(Math.max(...l) - Math.min(...l)).toFixed(3)}`);
  });

  it('a peacetime board is fed, and food is what collapses under stress', async () => {
    /*
     * Food is deliberately near-saturated at peace: the honest thing for the
     * model to say about the 2024 United States is that it feeds itself. What
     * makes the term earn its weight is not variance at turn 0 but how far it
     * FALLS when an economy is taken apart — a term reading 0.95 at peace and
     * 0.3 after a war is doing its job.
     */
    await bootWorld({ seed: SEED });
    const foodOf = (nid) => Game.getNation(nid).why.qol.inputs
      .find((i) => i.label === 'Food security').norm;
    const hungry = [];
    for (const [nid, n] of Game.nations) {
      if (foodOf(nid) < 0.6) hungry.push(`${n.name} ${foodOf(nid).toFixed(2)}`);
    }
    equal(hungry.length, 0, `${hungry.length} nations open hungry at peace: ${hungry.slice(0, 6)}`);

    // now take an economy apart and watch the same term move
    const nid = '19'; // Iowa
    const before = foodOf(nid);
    for (const f of Game.getNation(nid).counties) Game.county[f].gdp *= 0.06;
    World.begin(T());
    const after = foodOf(nid);
    ok(after < 0.5,
      `stripping 94% of an economy moved food security only ${before.toFixed(2)} -> ${after.toFixed(2)}; ` +
      'the term cannot express a famine');
  });

  it('home alignment is weighted over AREAS, not read off the aggregate mix', async () => {
    /*
     * A nation split into a red half and a blue half has an aggregate centroid
     * sitting between them that resembles neither — and would read as
     * moderately aligned with a centre-governing party that in fact nobody
     * supports. The two numbers must differ on such a nation.
     */
    await bootWorld({ seed: SEED });
    const nid = '48'; // Texas: large, and not politically uniform
    const facts = Power.nationFacts(nid, T());
    const n = Game.getNation(nid);
    const ruling = Ideology.index(n.gov.rulingIdeology);
    const d = Game.nationDemographics(nid);
    let aggregate = 0;
    for (let i = 0; i < d.mix.length; i++) aggregate += (d.mix[i] / d.pop) * Ideology.affinity(i, ruling);
    // for the aggregate-share form these coincide; what must NOT coincide is the
    // centroid form, which is what a naive implementation would have used
    const centroidForm = Ideology.affinity(d.centroid, ruling);
    ok(Math.abs(facts.alignment - centroidForm) > 1e-6,
      'home alignment matches the centroid shortcut; a split nation would read as moderate');
    close(facts.alignment, aggregate, 1e-9,
      'the per-Area weighting does not reduce to the population-weighted share form');
  });

  it('conquest costs liberties as well as influence', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 3; i++) World.advanceTurn(T(), rng);
    const nid = '06';
    const l0 = Game.getNation(nid).liberties;
    for (let t = 0; t < 12; t++) {
      const targets = [...Game.annexTargets(nid)].slice(0, 5);
      if (targets.length) Game.moveCounties(targets, nid, { reason: 'war' });
      World.advanceTurn(T(), rng);
    }
    const n = Game.getNation(nid);
    ok(n.liberties < l0,
      `Civil Liberties went ${l0.toFixed(3)} -> ${n.liberties.toFixed(3)} while conquering`);
    ok(n.why.liberties.inputs.find((i) => i.label === 'Occupation').contribution < 0);
  });

  it('all four stocks survive a save round-trip', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
    const want = new Map([...Game.nations].map(([id, n]) =>
      [id, [n.authority, n.influence, n.qol, n.liberties]]));
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    await bootWorld({ seed: 777 });
    Game.loadState(doc);
    for (const [id, vals] of want) {
      const n = Game.getNation(id);
      const now = [n.authority, n.influence, n.qol, n.liberties];
      for (let i = 0; i < 4; i++) {
        close(now[i], vals[i], 1e-12, `${id} stock ${i} was recomputed instead of restored`);
      }
    }
  });

  it('the four stocks are not the same number wearing four hats', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 8; i++) World.advanceTurn(T(), rng);
    // Rank every nation on each stock; if two rankings agree everywhere, one of
    // the two measures is redundant.
    const ids = [...Game.nations.keys()];
    const rank = (get) => {
      const order = ids.slice().sort((a, b) => get(Game.getNation(b)) - get(Game.getNation(a)));
      return new Map(order.map((id, i) => [id, i]));
    };
    const stocks = {
      authority: rank((n) => n.authority), influence: rank((n) => n.influence),
      qol: rank((n) => n.qol), liberties: rank((n) => n.liberties),
    };
    const names = Object.keys(stocks);
    for (let a = 0; a < names.length; a++) {
      for (let b = a + 1; b < names.length; b++) {
        let same = 0;
        for (const id of ids) if (stocks[names[a]].get(id) === stocks[names[b]].get(id)) same++;
        ok(same < ids.length,
          `${names[a]} and ${names[b]} rank all ${ids.length} nations identically; one is redundant`);
      }
    }
  });
});
