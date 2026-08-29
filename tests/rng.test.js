/*
 * M0.3 — seeded RNG with named streams.
 * The acceptance is: same seed + same action sequence => identical outcome, twice.
 */
import { describe, it, ok, equal, notEqual, close, deepEqual, every } from './harness.js';
import * as RNG from '../js/rng.js';

const draw = (rng, stream, n) => Array.from({ length: n }, () => rng.stream(stream).random());

describe('RNG', () => {
  it('is deterministic: same seed, same sequence', () => {
    const a = draw(RNG.create(12345), 'combat', 16);
    const b = draw(RNG.create(12345), 'combat', 16);
    deepEqual(a, b, 'two generators on the same seed diverged');
  });

  it('differs across seeds', () => {
    const a = draw(RNG.create(12345), 'combat', 16);
    const b = draw(RNG.create(12346), 'combat', 16);
    notEqual(JSON.stringify(a), JSON.stringify(b));
  });

  it('differs across stream names on the same seed', () => {
    const r = RNG.create(7);
    const a = draw(r, 'combat', 16);
    const b = draw(r, 'spawn', 16);
    notEqual(JSON.stringify(a), JSON.stringify(b));
  });

  it('streams are independent: draining one does not move another', () => {
    const r1 = RNG.create(999);
    for (let i = 0; i < 500; i++) r1.stream('combat').random();
    const afterDrain = draw(r1, 'spawn', 8);

    const r2 = RNG.create(999);
    const clean = draw(r2, 'spawn', 8);
    deepEqual(afterDrain, clean, 'combat draws perturbed the spawn stream');
  });

  it('serializes and restores exactly', () => {
    const r = RNG.create(4242);
    const s = r.stream('x');
    for (let i = 0; i < 37; i++) s.random();
    const snap = r.serialize();

    const expected = Array.from({ length: 10 }, () => s.random());
    const restored = RNG.restore(snap);
    const actual = Array.from({ length: 10 }, () => restored.stream('x').random());
    deepEqual(actual, expected, 'restore did not resume the exact sequence');
    equal(RNG.restore(snap).seed, 4242);
  });

  it('restore preserves the draw counter', () => {
    const r = RNG.create(1);
    for (let i = 0; i < 5; i++) r.stream('a').random();
    for (let i = 0; i < 3; i++) r.stream('b').random();
    equal(r.totalDraws(), 8);
    equal(RNG.restore(r.serialize()).totalDraws(), 8);
  });

  it('produces values strictly inside [0, 1)', () => {
    const s = RNG.create(31337).stream('u');
    const xs = Array.from({ length: 5000 }, () => s.random());
    every(xs, (x) => x >= 0 && x < 1, 'value outside [0,1)');
  });

  it('roll(6) covers 1..6 and is roughly uniform', () => {
    const s = RNG.create(2024).stream('dice');
    const counts = new Array(7).fill(0);
    const N = 60000;
    for (let i = 0; i < N; i++) counts[s.roll(6)]++;
    equal(counts[0], 0, 'roll produced a 0');
    for (let f = 1; f <= 6; f++) {
      ok(counts[f] > 0, `face ${f} never appeared`);
      close(counts[f] / N, 1 / 6, 0.02, `face ${f} frequency`);
    }
  });

  it('shuffle is a permutation and depends on the stream', () => {
    const base = Array.from({ length: 60 }, (_, i) => i);
    const a = RNG.create(5).stream('turnorder').shuffle(base.slice());
    const b = RNG.create(5).stream('turnorder').shuffle(base.slice());
    deepEqual(a, b, 'shuffle is not reproducible');
    deepEqual([...a].sort((x, y) => x - y), base, 'shuffle lost or duplicated elements');
    notEqual(JSON.stringify(a), JSON.stringify(base), 'shuffle was the identity');
  });

  it('chance(p) fires at about rate p', () => {
    const s = RNG.create(88).stream('unite');
    let hits = 0;
    const N = 40000;
    for (let i = 0; i < N; i++) if (s.chance(0.3)) hits++;
    close(hits / N, 0.3, 0.02, 'chance(0.3) rate');
  });

  it('range(lo,hi) stays in bounds', () => {
    const s = RNG.create(6).stream('share');
    const xs = Array.from({ length: 4000 }, () => s.range(0.02, 0.2));
    every(xs, (x) => x >= 0.02 && x < 0.2, 'range escaped its bounds');
  });

  it('newSeed produces a 32-bit int', () => {
    const s = RNG.newSeed();
    equal(s | 0, s, 'newSeed is not a 32-bit integer');
  });
});
