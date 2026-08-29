/*
 * M0.7 — one mutation, one render.
 *
 * `Game.emit()` used to carry no payload, so a pure treasury change forced the
 * renderer to clear the outline cache, re-mesh all 9,869 arcs of the county
 * topology and rewrite 3,232 fills. It also fired once per step, so a civil-war
 * annex (moveCounties + applyCivilWarCost) cost two full cascades.
 *
 * The contract these tests pin down:
 *   - emit carries {ownership, values, roster}
 *   - batch(fn) collapses every emit inside fn into one, with the reasons merged
 *   - batch returns fn's return value and still emits if fn throws
 */
import { describe, it, ok, equal, notEqual, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;

/** Attach a counting listener; returns {n, last, reasons, reset}. */
function watch() {
  const w = { n: 0, last: null, reasons: [] };
  Game.onChange((reason) => { w.n++; w.last = reason; w.reasons.push(reason); });
  w.reset = () => { w.n = 0; w.last = null; w.reasons.length = 0; };
  return w;
}

describe('Render batching', () => {
  it('emit carries a reason with all three bits', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = [...Game.nations.keys()][0];
    Game.getNation(nid).treasury = 1e9;
    equal(Game.spend(nid, 1), true, 'spend refused a funded treasury');
    equal(w.n, 1);
    ok(w.last && typeof w.last === 'object', 'emit fired with no reason object');
    for (const k of ['ownership', 'values', 'roster']) ok(k in w.last, `reason has no "${k}" bit`);
  });

  it('a treasury change does not claim ownership moved', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = [...Game.nations.keys()][0];
    Game.getNation(nid).treasury = 1e12;
    Game.spend(nid, 1000);
    equal(w.n, 1);
    equal(w.last.ownership, false, 'spend() reported an ownership change; that re-meshes 9,869 arcs for nothing');
    equal(w.last.values, true);
  });

  it('boostGdp is a value change, not an ownership change', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    Game.boostGdp([...Game.nations.keys()][0], 1e9);
    equal(w.n, 1);
    equal(w.last.ownership, false, 'a trade re-meshed every border for a pure number change');
    equal(w.last.values, true);
  });

  it('moveCounties is an ownership change', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = '16';
    Game.moveCounties([...Game.annexTargets(nid)].slice(0, 2), nid);
    equal(w.n, 1);
    equal(w.last.ownership, true);
  });

  it('creating or destroying a nation reports a roster change', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    Game.createNation('Testland', [...Game.nations.get('30').counties].slice(0, 4));
    ok(w.reasons.some((r) => r.roster), 'createNation did not report a roster change');
  });

  it('batch collapses N emits into 1 and merges the reasons', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = '16';
    Game.batch(() => {
      Game.boostGdp(nid, 1e9);            // values
      Game.boostGdp(nid, 1e9);            // values
      Game.moveCounties([...Game.annexTargets(nid)].slice(0, 2), nid); // ownership
    });
    equal(w.n, 1, 'three mutations produced more than one render');
    equal(w.last.values, true, 'the merged reason lost the value bit');
    equal(w.last.ownership, true, 'the merged reason lost the ownership bit');
  });

  it('the same three mutations UNBATCHED cost three renders', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = '16';
    Game.boostGdp(nid, 1e9);
    Game.boostGdp(nid, 1e9);
    Game.moveCounties([...Game.annexTargets(nid)].slice(0, 2), nid);
    equal(w.n, 3, 'the contrast case should be three renders');
  });

  it('a civil-war annex is one render', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = '16';
    const victim = Game.getOwner([...Game.annexTargets(nid)][0]);
    Game.batch(() => {
      Game.moveCounties([...Game.annexTargets(nid)].slice(0, 3), nid);
      Game.applyCivilWarCost(victim, nid, 40);
    });
    equal(w.n, 1, 'one annex should cause exactly one render');
  });

  it('batch nests without emitting early', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = '16';
    Game.batch(() => {
      Game.boostGdp(nid, 1e9);
      Game.batch(() => {
        Game.boostGdp(nid, 1e9);
        equal(w.n, 0, 'an inner batch emitted while an outer batch was open');
      });
      equal(w.n, 0, 'the inner batch emitted on exit while the outer batch was still open');
    });
    equal(w.n, 1);
  });

  it('batch returns fn\'s value', async () => {
    await bootWorld({ seed: SEED });
    equal(Game.batch(() => 42), 42);
  });

  it('batch still emits when fn throws, and does not wedge the depth counter', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const nid = '16';
    let caught = false;
    try {
      Game.batch(() => {
        Game.boostGdp(nid, 1e9);
        throw new Error('boom');
      });
    } catch (e) { caught = true; }
    ok(caught, 'batch swallowed the exception');
    equal(w.n, 1, 'a throwing batch lost its pending render');

    w.reset();
    Game.boostGdp(nid, 1e9);
    equal(w.n, 1, 'the batch depth counter was left above zero, so emits are now suppressed forever');
  });

  it('advanceTurn emits exactly once, from inside its own batch', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    World.advanceTurn(window.TUNE);
    equal(w.n, 1, 'a world turn should render once');
    equal(w.last.values, true, 'a world turn changes values and must say so');
  });

  /* --- M1.12: caches that must invalidate on a mutation, not per call --- */

  it('blueShell is memoized between mutations and recomputed after one', async () => {
    await bootWorld({ seed: SEED });
    const e0 = Game.epoch();
    const a = Game.blueShell('06');
    equal(Game.epoch(), e0, 'reading the shell should not count as a mutation');
    equal(Game.blueShell('06'), a);

    // a mutation must invalidate it: give a mid-tier nation an enormous economy
    Game.boostGdp('49', Game.nationDemographics('06').gdp * 5);
    ok(Game.epoch() > e0, 'the epoch did not advance on a mutation');
    ok(Game.blueShell('49') > 0, 'the memoized ranking survived a mutation that should have changed it');
  });

  it('the epoch advances exactly once per render, batched or not', async () => {
    await bootWorld({ seed: SEED });
    const e0 = Game.epoch();
    Game.batch(() => {
      Game.boostGdp('06', 1e9);
      Game.boostGdp('06', 1e9);
      Game.boostGdp('06', 1e9);
    });
    equal(Game.epoch(), e0 + 1, 'a batch of three mutations advanced the epoch more than once');
    Game.boostGdp('06', 1e9);
    equal(Game.epoch(), e0 + 2);
  });

  it('MapModes.lighten memoizes its ramp results', async () => {
    await bootWorld({ seed: SEED });
    const a = MapModes.lighten('#e0483b', 2);
    const b = MapModes.lighten('#e0483b', 2);
    equal(a, b);
    ok(typeof a === 'string' && a.startsWith('rgb'), `expected a colour string, got ${a}`);
    notEqual(MapModes.lighten('#e0483b', 0), MapModes.lighten('#e0483b', 2),
      'the tier argument is being ignored');
  });

  it('breakApart is one render however many nations it mints', async () => {
    await bootWorld({ seed: SEED });
    const w = watch();
    const born = Game.breakApart([...Game.nations.get('48').counties].slice(0, 40));
    equal(w.n, 1, `breakApart minted ${born.length} nations in ${w.n} renders`);
    equal(w.last.roster, true);
  });
});
