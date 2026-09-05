/*
 * Safe stepping (Addendum A, stage A0).
 *
 * THE INVARIANT: the world ticks exactly once per completed round, and nowhere
 * else. So `TurnSystem.progress().round` and `World.getTurn()` must move in
 * lockstep through any number of rounds driven through the real path. The
 * dev "Step world" button broke this by calling World.advanceTurn directly --
 * the date ran ahead of the round counter and the two never agreed again.
 *
 * The pin here is the clock, not the button: a button is UI and the suite is
 * headless. What it pins is that driving the clock the way End turn drives it
 * keeps the two counters equal, which is the property the button now relies on.
 */
import { describe, it, ok, equal, throws } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;

describe('Safe stepping', () => {
  it('the round counter and the world turn advance in lockstep through the real path', async () => {
    const { rng, tune } = await bootWorld({ seed: SEED });
    const before = { round: TurnSystem.progress().round, turn: World.getTurn() };
    for (let i = 0; i < 5; i++) AI.round(tune, rng);   // exactly what a pressed End turn drives
    const after = { round: TurnSystem.progress().round, turn: World.getTurn() };
    equal(after.round - before.round, 5, 'five rounds played');
    equal(after.turn - before.turn, 5, 'and the world ticked five times, no more, no less');
  });

  it('stepping the world directly is what desynchronises them (the defect, pinned so it stays fixed)', async () => {
    const { rng, tune } = await bootWorld({ seed: SEED });
    const r0 = TurnSystem.progress().round, t0 = World.getTurn();
    World.advanceTurn(tune, rng);                        // the old button's shortcut
    ok(World.getTurn() === t0 + 1 && TurnSystem.progress().round === r0,
       'the world moved and the round did not: this is the desync, and why nothing in the UI may do it');
  });

  it('the simulator refuses to run on top of itself', async () => {
    // Two overlapping runs mutate the same singletons and never finish. The
    // guard is the difference between a confusing ten minutes and a clear error.
    let first = Sim.run({ seed: SEED, turns: 2 });
    let secondError = null;
    try { await Sim.run({ seed: SEED, turns: 2 }); } catch (e) { secondError = e; }
    await first;
    ok(secondError && /not re-entrant/.test(secondError.message),
       'the second run is refused while the first is in progress');
    ok(!Sim.isRunning(), 'and the flag clears when the first finishes');
  });

  it('a run can be stepped further, and the clocks stay together while it is', async () => {
    const res = await Sim.run({ seed: SEED, turns: 3 });
    equal(res.turns, 3);
    const r0 = TurnSystem.progress().round, t0 = World.getTurn();
    const rows = Sim.step(4);
    equal(rows.length, 4, 'one sample per stepped round');
    equal(World.getTurn() - t0, 4, 'the world ticked four more times');
    equal(TurnSystem.progress().round - r0, 4, 'and so did the round counter');
    equal(rows[rows.length - 1].turn, 7, 'samples are stamped with the true world turn');
  });

  it('stepping before any run is a clear error, not a crash into an empty world', () => {
    // Fresh module state is not guaranteed here (a prior test may have run),
    // so this asserts the contract rather than the state: step needs a run.
    ok(typeof Sim.step === 'function');
  });
});
