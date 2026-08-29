/*
 * M0.4 — one tunables object, every read recorded.
 */
import { describe, it, ok, equal, close, deepEqual, throws } from './harness.js';
import { SCHEMA, createTune, describe as describeKey, groups } from '../js/tunables.js';

describe('TUNE', () => {
  it('every schema entry carries the metadata the dashboard needs', () => {
    for (const [key, d] of Object.entries(SCHEMA)) {
      ok(d.label, `${key} has no label`);
      ok(d.group, `${key} has no group`);
      ok(d.doc && d.doc.length > 20, `${key} has no useful doc`);
      ok(d.v !== undefined, `${key} has no default value`);
      const kind = d.kind || 'number';
      if (kind === 'number') {
        ok(typeof d.v === 'number', `${key} is declared number but its default is not`);
        ok(d.min !== undefined && d.max !== undefined && d.step !== undefined,
          `${key} is a number with no slider range`);
        ok(d.v >= d.min && d.v <= d.max, `${key} default ${d.v} is outside [${d.min}, ${d.max}]`);
      }
      if (kind === 'array') ok(Array.isArray(d.v), `${key} declared array but is not`);
      if (kind === 'object') ok(d.v && typeof d.v === 'object' && !Array.isArray(d.v), `${key} declared object but is not`);
    }
  });

  it('get() returns the default and records the key', () => {
    const t = createTune();
    equal(t.readLog.size, 0);
    equal(t.get('econ.taxRate'), SCHEMA['econ.taxRate'].v);
    equal(t.readLog.get('econ.taxRate').count, 1);
    t.get('econ.taxRate');
    equal(t.readLog.get('econ.taxRate').count, 2);
  });

  it('peek() does not record', () => {
    const t = createTune();
    t.peek('econ.taxRate');
    equal(t.readLog.size, 0);
  });

  it('an unknown key throws rather than returning undefined', () => {
    const t = createTune();
    throws(() => t.get('does.not.exist'));
    throws(() => t.set('does.not.exist', 1));
  });

  it('trace() returns exactly the keys a computation read', () => {
    const t = createTune();
    const { result, keys } = t.trace(() => t.get('market.base') * t.get('market.elasticity'));
    equal(result, SCHEMA['market.base'].v * SCHEMA['market.elasticity'].v);
    deepEqual(keys.sort(), ['market.base', 'market.elasticity']);
  });

  it('trace() nests: an inner trace still reports up to the outer one', () => {
    const t = createTune();
    const { keys } = t.trace(() => {
      t.get('war.victoryBand');
      t.trace(() => t.get('war.partialBand'));
    });
    deepEqual(keys.sort(), ['war.partialBand', 'war.victoryBand']);
  });

  it('load() applies known keys and reports unknown ones', () => {
    const t = createTune();
    const unknown = t.load({ 'econ.taxRate': 0.05, 'not.a.key': 1 });
    equal(t.get('econ.taxRate'), 0.05);
    deepEqual(unknown, ['not.a.key']);
  });

  it('array and object values cannot be mutated through a get()', () => {
    // Stored composites are frozen rather than copied per read: get() runs inside
    // per-Area loops and a copy per read would be thousands of allocations a turn.
    // A caller that tries to write gets a TypeError in strict/module code.
    const t = createTune();
    const share = t.get('market.demandShare');
    ok(Object.isFrozen(share), 'array tunables must be frozen');
    throws(() => { share[0] = 999; }, 'writing to a tunable array should throw in strict mode');
    equal(t.get('market.demandShare')[0], SCHEMA['market.demandShare'].v[0],
      'mutating a returned array leaked back into TUNE');
    equal(SCHEMA['market.demandShare'].v[0] === 999, false, 'the schema default was mutated');

    const gov = t.get('econ.govMaintenance');
    ok(Object.isFrozen(gov), 'object tunables must be frozen');
    throws(() => { gov.Republic = 9; });
  });

  it('set() replaces a composite rather than editing it in place', () => {
    const t = createTune();
    t.set('market.demandShare', [1, 0, 0, 0, 0, 0]);
    deepEqual([...t.get('market.demandShare')], [1, 0, 0, 0, 0, 0]);
    // and the array the caller handed in is not the one now stored
    const mine = [0, 0, 0, 0, 0, 1];
    t.set('market.demandShare', mine);
    mine[0] = 42;
    equal(t.get('market.demandShare')[0], 0, 'set() aliased the caller\'s array');
  });

  it('diff() reports only deliberate overrides', () => {
    const t = createTune();
    deepEqual(t.diff(), {});
    t.set('war.maxDice', 9);
    deepEqual(t.diff(), { 'war.maxDice': 9 });
  });

  it('serialize() round-trips through a fresh Tune', () => {
    const t = createTune({ 'econ.areaUpkeep': 12e6, 'war.diceSides': 8 });
    const t2 = createTune(t.serialize());
    deepEqual(t2.serialize(), t.serialize());
    equal(t2.get('econ.areaUpkeep'), 12e6);
  });

  it('groups() covers every key exactly once', () => {
    const seen = new Set();
    for (const g of groups()) for (const k of g.keys) {
      ok(!seen.has(k.key), `${k.key} appears in two groups`);
      seen.add(k.key);
    }
    equal(seen.size, Object.keys(SCHEMA).length);
  });

  it('describeKey() carries the default through', () => {
    const d = describeKey('world.partyCeiling');
    equal(d.default, SCHEMA['world.partyCeiling'].v);
    equal(d.kind, 'number');
    equal(describeKey('nope'), null);
  });

  /* --- invariants over the values themselves --- */

  it('civil-war bands are ordered', () => {
    const t = createTune();
    ok(t.get('war.victoryBand') < t.get('war.partialBand'), 'victory band is not below the partial band');
  });

  it('loss bases are below their caps', () => {
    const t = createTune();
    ok(t.get('war.popLossBase') <= t.get('war.popLossMax'));
    ok(t.get('war.gdpLossBase') <= t.get('war.gdpLossMax'));
    ok(t.get('war.unitePeaceMin') < t.get('war.unitePeaceMax'));
  });

  it('market price floor is below its ceiling', () => {
    const t = createTune();
    ok(t.get('market.minPrice') < t.get('market.maxPrice'));
  });

  it('demandShare has one entry per sector and no negatives', () => {
    const t = createTune();
    const d = t.get('market.demandShare');
    equal(d.length, 6, 'demandShare must have six sectors');
    for (const x of d) ok(x >= 0, 'negative demand share');
  });

  /* M1.8 will make this sum 1.0; until then the current 0.80 is recorded so the
   * change shows up as a deliberate edit rather than a silent drift. */
  it('demandShare currently sums to 0.80 — M1.8 fixes this', () => {
    const t = createTune();
    const sum = t.get('market.demandShare').reduce((a, b) => a + b, 0);
    close(sum, 0.80, 1e-9, 'demandShare sum');
  });
});
