/*
 * M1.3 — the civil war is a dice game again.
 *
 * Two defects together made the middle outcome unreachable:
 *   - points() rounded to zero for the median Area, so score = 0 = auto-victory
 *   - diceCount was uncapped and the dice were MULTIPLIED, so a real party flip
 *     scored ~6e7 against a 67 threshold and even the minimum possible product
 *     still landed in fall_apart
 *
 * ACCEPTANCE: a sweep over realistic annexations produces a spread across all
 * three outcomes.
 */
import { describe, it, ok, equal, close, deepEqual, every } from './harness.js';
import { bootWorld } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** A demographics-shaped object for the pure-math tests. */
const demo = (pop, gdp, shares = {}) => ({
  pop, gdp,
  dem: shares.dem ?? 0, gop: shares.gop ?? 0, other: shares.other ?? 0,
  extPct: shares.ext || {},
});

describe('Civil war scoring', () => {
  it('points are continuous — the median Area is not worth zero', async () => {
    await bootWorld({ seed: SEED });
    // the review's median Area: 88,948 people, $4.93B
    const before = demo(5_000_000, 4e11);
    const added = demo(88_948, 4.93e9);
    const p = CivilWar.points(before, added, T());
    ok(p > 0, `median-Area annexation scored ${p} points; the old code rounded it to 0`);
    ok(p < 1, `a tiny bite of a big nation should be well under one point, got ${p}`);
  });

  it('points rise monotonically with the size of the bite', async () => {
    await bootWorld({ seed: SEED });
    const before = demo(5_000_000, 4e11);
    let last = -1;
    for (const frac of [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 4]) {
      const p = CivilWar.points(before, demo(5_000_000 * frac, 4e11 * frac), T());
      ok(p > last, `points did not increase from ${last} at ratio ${frac}`);
      last = p;
    }
  });

  it('points are a RATIO: the same bite hurts a small nation more', async () => {
    await bootWorld({ seed: SEED });
    const bite = demo(1_000_000, 8e10);
    const small = CivilWar.points(demo(2_000_000, 1.6e11), bite, T());
    const large = CivilWar.points(demo(20_000_000, 1.6e12), bite, T());
    ok(small > large * 2, `a 50% bite (${small}) should cost far more than a 5% one (${large})`);
  });

  it('the size curve is sub-linear, so doubling your size is a gamble not a certainty', async () => {
    await bootWorld({ seed: SEED });
    const before = demo(1e6, 1e11);
    const one = CivilWar.points(before, demo(1e6, 1e11), T());     // ratio 1
    const four = CivilWar.points(before, demo(4e6, 4e11), T());    // ratio 4
    close(one, 1, 1e-9, 'a 1:1 annexation should be exactly one point');
    ok(four < 4, `linear points would give 4; the curve should compress it, got ${four}`);
    close(four, 2, 1e-9, 'sqrt(4) should be 2');
  });

  it('dice are SUMMED, not multiplied', async () => {
    await bootWorld({ seed: SEED });
    const rng = RNG.create(1);
    const before = demo(1e6, 1e11, { dem: 60, gop: 40 });
    const added = demo(3e6, 3e11, { dem: 0, gop: 100 });
    const after = demo(4e6, 4e11, { dem: 15, gop: 85 });
    const res = CivilWar.resolve(before, added, after, { rng, tune: T() });
    equal(res.diceSum, res.dice.reduce((a, b) => a + b, 0), 'diceSum is not the sum of the dice');
    ok(res.product === undefined, 'the multiplicative product should be gone');
    const expected = Math.round(res.points * res.diceSum * T().get('war.pointsScale'));
    equal(res.score, expected, 'score is not points x diceSum x scale');
  });

  it('the dice count is capped', async () => {
    await bootWorld({ seed: SEED });
    const cap = T().get('war.maxDice');
    // an annihilating flip: the old leader is left with almost nothing
    const before = demo(1e6, 1e11, { dem: 90, gop: 10 });
    const after = demo(1e6, 1e11, { dem: 1, gop: 99 });
    equal(CivilWar.diceCount(before, after, T()), cap, 'a total flip should saturate the cap, not exceed it');
    const rng = RNG.create(2);
    const res = CivilWar.resolve(before, demo(9e6, 9e11), after, { rng, tune: T() });
    ok(res.dice.length <= cap, `rolled ${res.dice.length} dice against a cap of ${cap}`);
  });

  it('flip magnitude is measured from the PLURALITY, not from 50%', async () => {
    await bootWorld({ seed: SEED });
    // Three-way split: nobody is near 50, but the lead barely changes hands.
    // The old rule (50 - oldShareAfter) would read this as a 15-point flip and
    // hand out 15 dice; the plurality rule reads it as the 2 points it is.
    const before = demo(1e6, 1e11, { dem: 35, gop: 33, ext: { Deseret: 32 } });
    const after = demo(1e6, 1e11, { dem: 33, gop: 35, ext: { Deseret: 32 } });
    const mag = CivilWar.flipMagnitude(before, after);
    close(mag, 2, 1e-9, 'flip magnitude should be the 2-point gap between the new and old leaders');
    const oldRuleDice = Math.max(1, Math.ceil(50 - 33));
    const nowDice = CivilWar.diceCount(before, after, T());
    ok(nowDice < oldRuleDice, `plurality gives ${nowDice} dice; the 50%-rule gave ${oldRuleDice}`);
  });

  it('an emergent movement can hold the plurality and be flipped', async () => {
    await bootWorld({ seed: SEED });
    const before = demo(1e6, 1e11, { dem: 29, gop: 31, ext: { Deseret: 40 } });
    equal(CivilWar.plurality(before).name, 'Deseret',
      'a nation that is 40% Deseret must not report a minority party as its lead');
    const after = demo(1e6, 1e11, { dem: 20, gop: 55, ext: { Deseret: 25 } });
    const a = CivilWar.assess(before, demo(1e5, 1e9), after);
    ok(a.flip, 'losing the Deseret plurality is a flip');
    equal(a.fromParty, 'Deseret');
    equal(a.toParty, 'Republican');
  });

  it('no trigger means no dice and no score', async () => {
    await bootWorld({ seed: SEED });
    const rng = RNG.create(3);
    const before = demo(1e7, 1e12, { dem: 60, gop: 40 });
    const added = demo(1e5, 1e9, { dem: 60, gop: 40 });
    const after = demo(1.01e7, 1.001e12, { dem: 60, gop: 40 });
    const res = CivilWar.resolve(before, added, after, { rng, tune: T() });
    equal(res.triggered, false);
    equal(res.diceCount, 0);
    equal(res.score, 0);
    equal(res.outcome, 'victory');
  });

  /* ---------------- the acceptance ---------------- */

  it('ACCEPTANCE: a sweep of realistic annexations spreads across all three outcomes', async () => {
    await bootWorld({ seed: SEED });
    const tune = T();
    const counts = { victory: 0, partial: 0, fall_apart: 0 };
    const rng = RNG.create(99);

    // Sweep the space a player actually plays in: bites from 5% to 150% of the
    // annexer, with flips from marginal to decisive.
    for (const ratio of [0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1.0, 1.5]) {
      for (const flipGap of [0, 2, 5, 10, 20]) {
        for (let trial = 0; trial < 40; trial++) {
          const before = demo(4_000_000, 3e11, { dem: 52, gop: 48 });
          const added = demo(4_000_000 * ratio, 3e11 * ratio, { dem: 20, gop: 80 });
          const after = flipGap > 0
            ? demo(0, 0, { dem: 50 - flipGap / 2, gop: 50 + flipGap / 2 })
            : demo(0, 0, { dem: 52, gop: 48 });
          after.pop = before.pop + added.pop;
          after.gdp = before.gdp + added.gdp;
          const res = CivilWar.resolve(before, added, after, { rng, tune });
          if (res.triggered) counts[res.outcome]++;
        }
      }
    }
    const total = counts.victory + counts.partial + counts.fall_apart;
    ok(total > 500, `only ${total} triggered wars in the sweep`);
    for (const k of ['victory', 'partial', 'fall_apart']) {
      const share = counts[k] / total;
      ok(share > 0.08,
        `outcome "${k}" is ${(share * 100).toFixed(1)}% of ${total} wars — not a spread. ${JSON.stringify(counts)}`);
    }
  });

  it('the outcome distribution moves the right way with size and with flip severity', async () => {
    await bootWorld({ seed: SEED });
    const tune = T();
    const rng = RNG.create(7);
    const N = 400;
    /** ratio = bite as a fraction of the annexer; gap = how decisively it flips */
    const run = (ratio, gap) => {
      const c = { victory: 0, partial: 0, fall_apart: 0 };
      for (let i = 0; i < N; i++) {
        const before = demo(4e6, 3e11, { dem: 52, gop: 48 });
        const added = demo(4e6 * ratio, 3e11 * ratio, { dem: 10, gop: 90 });
        const after = demo(before.pop + added.pop, before.gdp + added.gdp,
          { dem: 50 - gap / 2, gop: 50 + gap / 2 });
        c[CivilWar.resolve(before, added, after, { rng, tune }).outcome]++;
      }
      return c;
    };

    // A small bite that barely shifts the balance is routine.
    const easy = run(0.05, 2);
    ok(easy.victory / N > 0.9, `a 5% bite with a 2-point flip should be routine: ${JSON.stringify(easy)}`);
    equal(easy.fall_apart, 0, `it must never fall apart: ${JSON.stringify(easy)}`);

    // The SAME small bite, but it costs you your plurality outright: contested,
    // usually still yours, never a collapse. Losing control of your own
    // government is a political problem, not a military one.
    const contested = run(0.05, 8);
    equal(contested.fall_apart, 0, `a 5% bite must never collapse the nation: ${JSON.stringify(contested)}`);
    ok(contested.victory > 0 && contested.partial > 0,
      `a decisive flip on a small bite should be contested, not decided: ${JSON.stringify(contested)}`);
    ok(contested.victory / N < easy.victory / N,
      'a harsher flip should not be at least as safe as a mild one');

    // Swallowing something half again your own size is how nations end.
    const huge = run(1.5, 8);
    ok(huge.fall_apart / N > 0.6, `a 150% annexation should usually fall apart: ${JSON.stringify(huge)}`);
    ok(huge.victory / N < 0.1, `a 150% annexation should rarely be a clean win: ${JSON.stringify(huge)}`);
  });

  it('the same seed produces the same war, twice', async () => {
    await bootWorld({ seed: SEED });
    const tune = T();
    const args = [demo(4e6, 3e11, { dem: 52, gop: 48 }), demo(2e6, 1.5e11, { dem: 10, gop: 90 }),
                  demo(6e6, 4.5e11, { dem: 38, gop: 62 })];
    const a = CivilWar.resolve(...args, { rng: RNG.create(555), tune });
    const b = CivilWar.resolve(...args, { rng: RNG.create(555), tune });
    deepEqual(a, b, 'the same seed produced a different war');
  });
});

describe('Partial victory', () => {
  it('keeps a contiguous, border-adjacent front — never zero', async () => {
    await bootWorld({ seed: SEED });
    const nid = '16'; // Idaho
    const chosen = [...Game.annexTargets(nid)].slice(0, 12);
    ok(chosen.length >= 6, 'not enough annex targets to test with');

    for (const score of [34, 45, 55, 66]) {
      const frac = CivilWar.partialKeepFraction(score, window.TUNE);
      ok(frac > 0 && frac <= 1, `keep fraction ${frac} out of range at score ${score}`);
      const want = Math.max(1, Math.round(frac * chosen.length));
      ok(want >= 1, 'a partial victory must hold at least one Area');
    }
  });

  it('holds more at the bottom of the partial band than at the top', async () => {
    await bootWorld({ seed: SEED });
    const tune = window.TUNE;
    const low = CivilWar.partialKeepFraction(tune.get('war.victoryBand') + 1, tune);
    const high = CivilWar.partialKeepFraction(tune.get('war.partialBand'), tune);
    ok(low > high, `a narrow win (${low}) should hold more than a near-loss (${high})`);
    close(high, tune.get('war.partialMinKeep'), 1e-9);
  });

  it('is clamped to the configured floor and ceiling', async () => {
    await bootWorld({ seed: SEED });
    const tune = window.TUNE;
    close(CivilWar.partialKeepFraction(-999, tune), 1, 1e-9);
    close(CivilWar.partialKeepFraction(99999, tune), tune.get('war.partialMinKeep'), 1e-9);
  });
});
