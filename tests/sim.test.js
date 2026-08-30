/*
 * M5.3 — the headless simulator.
 *
 * The property that matters more than anything it measures: **it drives the real
 * game**. `Sim.run` boots the same `Game.init` the page boots and calls the same
 * `World.advanceTurn` the Pass button calls, which is the only arrangement in
 * which tuning the simulator tunes the game. A second lightweight model that
 * "captured the essentials" would be a fourth implementation of the world after
 * the model, the tests and the explanation layer — and it would be the one
 * everybody trusted.
 *
 * The second property: a run must not touch the session. A dashboard you use
 * while playing has to be able to explore a tunable without changing the game
 * you are in.
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const T = () => window.TUNE;

describe('The simulator', () => {
  it('runs, and reports one sample per turn plus the start', async () => {
    const r = await Sim.run({ seed: 20260829, turns: 8 });
    equal(r.series.length, 9, 'the series should be turns + 1');
    equal(r.series[0].turn, 0);
    equal(r.series[8].turn, 8);
    equal(r.turns, 8);
    equal(r.seed, 20260829);
  });

  it('is deterministic: the same seed gives the same history', async () => {
    const a = await Sim.run({ seed: 4242, turns: 10 });
    const b = await Sim.run({ seed: 4242, turns: 10 });
    deepEqual(a.series, b.series, 'two runs of the same seed diverged');
    equal(JSON.stringify(a.summary), JSON.stringify(b.summary));
  });

  it('and different seeds give different histories', async () => {
    const a = await Sim.run({ seed: 1, turns: 10 });
    const b = await Sim.run({ seed: 2, turns: 10 });
    ok(JSON.stringify(a.series) !== JSON.stringify(b.series),
      'two different seeds produced identical worlds');
  });

  it('EXPLORING DOES NOT TOUCH THE SESSION', async () => {
    /*
     * The single most important property for a tool you use while playing. The
     * run applies its overrides to a CLONE of the tunables.
     */
    await bootWorld({ seed: 20260829 });
    const before = T().peek('sent.maxRise');
    const diffBefore = JSON.stringify(T().diff());
    await Sim.run({ seed: 1, turns: 4, overrides: { 'sent.maxRise': 0.2, 'power.floor': 0.4 } });
    equal(T().peek('sent.maxRise'), before, 'a simulator run mutated the live tunables');
    equal(JSON.stringify(T().diff()), diffBefore);
  });

  it('an override actually changes the outcome', async () => {
    // ...and the test above is therefore about isolation, not about inertness.
    const fast = await Sim.run({ seed: 20260829, turns: 40, overrides: { 'sent.maxRise': 0.05 } });
    const slow = await Sim.run({ seed: 20260829, turns: 40, overrides: { 'sent.maxRise': 0.004 } });
    ok(fast.summary.secessions >= slow.summary.secessions,
      `a fivefold slower sentiment produced as many secessions (${fast.summary.secessions} vs ${slow.summary.secessions})`);
    ok(fast.series[40].organisedPct > slow.series[40].organisedPct,
      'the override did not change how much of the country ended up organised');
  });

  it('drives the real game, not a copy of it', async () => {
    /*
     * After a run the live modules hold that world — same Game, same Movements,
     * same Ledger. If the simulator had its own model this would be untrue, and
     * the check is cheap enough to be worth pinning.
     */
    const r = await Sim.run({ seed: 20260829, turns: 12 });
    equal(World.getTurn(), 12, 'the simulator did not advance the real world clock');
    equal(Game.nations.size, r.series[12].nations, 'the reported roster is not the live one');
    ok(Object.keys(Game.county).length > 1600, 'the live Area table is not the one the run built');
    // The live movements are the ones the run left behind, at the shares it left
    // them at — which a separate model of the world could not produce.
    const rec = Movements.get('Deseret');
    ok(rec, "the live movement roster is not the run's");
    let peak = 0;
    for (const m of Movements.all()) peak = Math.max(peak, Movements.strength(m.name).peak);
    close(peak, r.series[12].movementPeak.max, 1e-9,
      'the reported peak is not measured from the live model');
  });
});

describe('What a sample says', () => {
  it('bands every stock min / median / max, in range', async () => {
    const r = await Sim.run({ seed: 20260829, turns: 6 });
    for (const s of r.series) {
      for (const k of ['authority', 'influence', 'qol', 'liberties', 'movementPeak', 'movementReach']) {
        const b = s[k];
        ok(b.min <= b.med && b.med <= b.max, `${k} band is out of order at turn ${s.turn}`);
        ok(b.min >= 0 && b.max <= 1, `${k} left 0..1 at turn ${s.turn}: ${JSON.stringify(b)}`);
      }
      ok(s.nations > 0);
      ok(s.organisedPct >= 0 && s.organisedPct <= 100);
      ok(s.politicalSpread >= 0);
    }
  });

  it('counts secessions cumulatively, so the series is monotonic in them', async () => {
    const r = await Sim.run({ seed: 777, turns: 40 });
    for (let i = 1; i < r.series.length; i++) {
      ok(r.series[i].declared >= r.series[i - 1].declared, 'the declaration count went down');
      ok(r.series[i].defected >= r.series[i - 1].defected, 'the defection count went down');
      ok(r.series[i].died >= r.series[i - 1].died, 'the death count went down');
    }
  });

  it('band handles the empty and single cases rather than returning NaN', () => {
    deepEqual(Sim.band([]), { min: 0, med: 0, max: 0 });
    deepEqual(Sim.band([0.5]), { min: 0.5, med: 0.5, max: 0.5 });
    const b = Sim.band([3, 1, 2]);
    equal(b.min, 1); equal(b.max, 3);
  });
});

describe('The summary answers the questions a tuning pass asks', () => {
  it('names the first secession, or says there was none', async () => {
    const quiet = await Sim.run({ seed: 20260829, turns: 12, overrides: { 'sent.maxRise': 0.0011 } });
    equal(quiet.summary.firstSecessionTurn, null, 'something seceded with sentiment barely moving');
    const loud = await Sim.run({ seed: 20260829, turns: 40, overrides: { 'sent.maxRise': 0.06 } });
    ok(loud.summary.firstSecessionTurn > 0, 'nothing seceded even with sentiment racing');
  });

  it('watches the death-spiral floors', async () => {
    const r = await Sim.run({ seed: 20260829, turns: 40 });
    const floor = T().peek('power.floor');
    ok(r.summary.authorityFloor >= floor - 1e-9, 'Authority went below its own floor');
    ok(r.summary.influenceFloor >= floor - 1e-9, 'Influence went below its own floor');
    ok(r.summary.authorityFloor > floor,
      `some nation is pinned at the Authority floor (${r.summary.authorityFloor}); that is a spiral`);
  });

  it('watches the M1.6 political-spread collapse', async () => {
    const r = await Sim.run({ seed: 20260829, turns: 60 });
    equal(r.summary.spreadCollapsed, false,
      `the within-nation political spread collapsed (${r.summary.spread}); ` +
      'the Area grid has flattened into a nation-level scalar again');
  });

  it('reports the reach span, so "nothing is spreading" is visible', async () => {
    const r = await Sim.run({ seed: 20260829, turns: 60 });
    ok(/\d+%-\d+%/.test(r.summary.reachSpan), `the reach span reads "${r.summary.reachSpan}"`);
    const [lo, hi] = r.summary.reachSpan.split('-').map((x) => parseInt(x, 10));
    ok(hi > lo, 'every movement reached exactly the same share of its homeland');
  });
});

describe('The tuned pacing', () => {
  it('the first secession lands after a player has had time to learn the board', async () => {
    /*
     * The M5.3 acceptance: "tune the West with it before going further." At the
     * schema default the three deterministic western movements all declared by
     * turn 10, so three separate crises arrived as one and the West fell apart
     * before the player had done anything. `content/tunables.json` carries the
     * result of that pass.
     */
    for (const seed of [20260829, 1, 4242]) {
      const r = await Sim.run({ seed, turns: 80 });
      const t = r.summary.firstSecessionTurn;
      ok(t === null || t >= 15,
        `at seed ${seed} the first secession is turn ${t}; the West falls apart before the player moves`);
      ok(t === null || t <= 55,
        `at seed ${seed} the first secession is turn ${t}; nothing happens for most of the game`);
    }
  });

  it('and the game still has content: something declares, and something does not', async () => {
    const r = await Sim.run({ seed: 20260829, turns: 80 });
    ok(r.summary.secessions >= 1, 'eighty turns and nobody left');
    const states = r.summary.states;
    ok(states.realized > 0, 'no movement got a country');
    ok((states.rising || 0) + (states.armed || 0) > 0,
      'every movement resolved; nothing is left simmering for the player to worry about');
  });

  it('a declaration takes the ground it can actually hold', async () => {
    /*
     * Before the fix, a movement declared on its scattered over-threshold Areas
     * and `breakApart` split them: at seed 777 the State of Jefferson "declared
     * independence taking 4 Areas" and came into being with TWO, was absorbed
     * eight turns later, and re-declared with fourteen. The claimed and founded
     * counts now agree by construction.
     */
    const r = await Sim.run({ seed: 777, turns: 60 });
    const declares = r.events.filter((e) => e.kind === 'declare');
    ok(declares.length > 0);
    for (const d of declares) {
      const f = r.events.find((e) => e.kind === 'found' && e.subject === d.subject && e.turn === d.turn);
      ok(f, `a declaration at turn ${d.turn} founded nothing`);
      equal(f.delta, d.delta,
        `${d.movement} claimed ${d.delta} Areas and came into being with ${f.delta}`);
      ok(d.delta >= T().peek('nation.minAreas'), `${d.movement} declared on ${d.delta} Areas`);
    }
  });
});
