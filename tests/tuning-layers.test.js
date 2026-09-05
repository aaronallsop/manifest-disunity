/*
 * Three tuning layers (spec v2 §2.3).
 *
 *   schema defaults  <  content/tunables.json  <  deliberate overrides
 *
 * The bug these pin down: a save recorded every value that differed from the
 * SCHEMA default, which swept the whole authored file in as though it were a
 * set of choices somebody made. Loading that save then reset the authored file
 * back to what it said when the save was written — so a designer who edited a
 * number and reloaded a game in progress silently got his old number back, with
 * nothing on screen to say so. That is the acceptance test for this phase
 * ("change a value, reload, see the effect") failing on the commonest path.
 */
import { describe, it, ok, equal, deepEqual } from './harness.js';

const fresh = () => window.TuneMeta.createTune();

describe('Tuning layers', () => {
  it('an untouched Tune has no authored baseline, so nothing changes for tests or the simulator', () => {
    const t = fresh();
    deepEqual(t.authored, {}, 'authored starts empty');
    deepEqual(t.diffFromAuthored(), t.diff(), 'with no baseline the two diffs agree');
  });

  it('the authored file is a baseline, not an override', () => {
    const t = fresh();
    const schemaDefault = t.peek('world.popGrowth');
    t.setAuthored({ 'world.popGrowth': 0.017 });
    t.replace({});                       // as a save with no deliberate overrides would
    equal(t.get('world.popGrowth'), 0.017, 'the authored value survives a replace');
    ok(schemaDefault !== 0.017, 'and it genuinely differs from the schema default');
  });

  it('a save carries only what was deliberately changed away from the shipped game', () => {
    const t = fresh();
    t.setAuthored({ 'world.popGrowth': 0.017 });
    t.load({ 'world.popGrowth': 0.017 });          // equal to authored: not a choice
    deepEqual(t.diffFromAuthored(), {}, 'nothing to record');
    ok('world.popGrowth' in t.diff(), 'where the old diff would have recorded it');

    t.set('world.gdpGrowth', 0.05);                // a real deliberate change
    deepEqual(t.diffFromAuthored(), { 'world.gdpGrowth': 0.05 });
  });

  /*
   * The scenario, end to end: play with an authored value, save, re-author that
   * value, load. The edit must win, because it is the shipped tuning and the
   * save never disagreed with it.
   */
  it('re-authoring a number reaches a game already in progress', () => {
    const session = fresh();
    session.setAuthored({ 'world.popGrowth': 0.017 });
    session.replace({});
    const saved = session.diffFromAuthored();      // what the save document stores
    deepEqual(saved, {}, 'the player deliberately changed nothing');

    // ...the designer edits content/tunables.json, and the game is reloaded.
    const reloaded = fresh();
    reloaded.setAuthored({ 'world.popGrowth': 0.019 });
    reloaded.replace(saved);
    equal(reloaded.get('world.popGrowth'), 0.019, 'the edit took effect');
  });

  it('but a deliberate override still beats a later edit to the authored file', () => {
    const session = fresh();
    session.setAuthored({ 'world.popGrowth': 0.017 });
    session.replace({});
    session.set('world.popGrowth', 0.030);         // the player chose this
    const saved = session.diffFromAuthored();
    deepEqual(saved, { 'world.popGrowth': 0.030 });

    const reloaded = fresh();
    reloaded.setAuthored({ 'world.popGrowth': 0.019 });
    reloaded.replace(saved);
    equal(reloaded.get('world.popGrowth'), 0.030,
          'a save still restores what it was actually played with');
  });

  it('replace still wipes a stale override, which is what it exists for', () => {
    const t = fresh();
    t.setAuthored({ 'world.popGrowth': 0.017 });
    t.set('world.gdpGrowth', 0.099);               // a slider left over from exploring
    t.replace({});                                 // loading a save that never set it
    equal(t.get('world.gdpGrowth'), t.peek('world.gdpGrowth') === 0.099 ? 'unchanged' : t.get('world.gdpGrowth'),
          'sanity');
    ok(t.get('world.gdpGrowth') !== 0.099, 'the stale slider is gone');
    equal(t.get('world.popGrowth'), 0.017, 'while the authored baseline stays');
  });

  it('ignores authored keys that are not in the schema', () => {
    const t = fresh();
    t.setAuthored({ 'world.popGrowth': 0.017, 'not.a.real.key': 1 });
    deepEqual(Object.keys(t.authored), ['world.popGrowth']);
  });
});
