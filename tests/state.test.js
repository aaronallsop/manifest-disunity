/*
 * M2.3a — the columnar Area store.
 *
 * The bug this exists to make impossible: both paths that copy an Area
 * hand-enumerated its fields — `Game.serialize` listed them and
 * `World.advanceTurn`'s snapshot and writeback listed them again — so a field a
 * phase added was silently dropped by both. It would work for one turn, vanish
 * at the writeback, and reappear at its default. The test for that is not "does
 * pop survive a clone"; it is "does a field NOBODY WROTE CODE FOR survive a
 * clone", which is what the registry buys and what `a field added at runtime`
 * below actually checks.
 *
 * The second thing under test is that `Game.county[f]` still behaves exactly
 * like the plain object it replaced, because a hundred call sites above the
 * model read `c.pop[2]` and write `c.gdp += x` and none of them were changed.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, recPop, bakedAreaPop } from './world-fixture.js';
import { AreaState, FIELDS } from '../js/state.js';

const SEED = 20260829;
const mk = (n = 4, mixWidth = 3) =>
  new AreaState(Array.from({ length: n }, (_, i) => `a${i}`), { mixWidth });

describe('AreaState — structure', () => {
  it('allocates one column per field at the declared width', () => {
    const s = mk(4, 3);
    equal(s.n, 4);
    equal(s.pop.length, 12, 'a mix field should be n x mixWidth');
    equal(s.gdp.length, 4, 'a scalar field should be n');
    equal(s.anchor.length, 12);
    equal(s.owner.length, 4);
  });

  it('honours the declared type, so exactness is a choice and not an accident', () => {
    const s = mk();
    ok(s.pop instanceof Float64Array, 'pop is not Float64; the world-population invariant is exact');
    ok(s.gdp instanceof Float64Array, 'gdp is not Float64');
    ok(s.owner instanceof Int16Array, 'owner is not an integer array');
  });

  it('applies a declared fill, so "unowned" is -1 and not area zero', () => {
    const s = mk();
    for (let i = 0; i < s.n; i++) equal(s.owner[i], -1, 'owner did not start unowned');
    for (let i = 0; i < s.n; i++) equal(s.gdp[i], 0);
  });

  it('indexes ids both ways, and an unknown id is -1', () => {
    const s = mk();
    for (let i = 0; i < s.n; i++) equal(s.indexOf(s.idAt(i)), i);
    equal(s.indexOf('nope'), -1);
  });

  it('slot() is a live view, not a copy', () => {
    const s = mk(4, 3);
    const v = s.slot('pop', 2);
    equal(v.length, 3);
    v[1] = 42;
    equal(s.pop[2 * 3 + 1], 42, 'writing through the view did not write the column');
    s.pop[2 * 3 + 0] = 7;
    equal(v[0], 7, 'the view did not see a write to the column');
  });

  it('slot() hands back the SAME view every time, so a hot loop allocates nothing', () => {
    const s = mk();
    ok(s.slot('pop', 1) === s.slot('pop', 1), 'slot() allocated a second view for the same Area');
    ok(s.slot('pop', 1) !== s.slot('pop', 2));
    ok(s.slot('pop', 1).buffer === s.pop.buffer, 'the view is not a window onto the column');
  });

  it('an unknown field name throws rather than returning undefined', () => {
    const s = mk();
    let threw = false;
    try { s.slot('sentiment', 0); } catch (e) { threw = true; }
    ok(threw, 'reading an unallocated field returned quietly');
  });
});

describe('AreaState — clone', () => {
  it('is a deep copy of every column and shares nothing writable', () => {
    const s = mk(3, 2);
    s.pop[0] = 1; s.pop[1] = 2; s.gdp[2] = 99; s.owner[1] = 5;
    const c = s.clone();
    equal(c.pop[0], 1); equal(c.gdp[2], 99); equal(c.owner[1], 5);
    c.pop[0] = 777; c.gdp[2] = 0;
    equal(s.pop[0], 1, 'writing the clone changed the original');
    equal(s.gdp[2], 99);
    s.owner[1] = 9;
    equal(c.owner[1], 5, 'writing the original changed the clone');
  });

  it('shares the index, which is what makes the copy cheap', () => {
    const s = mk();
    const c = s.clone();
    ok(c.index === s.index, 'the clone rebuilt the id index');
    ok(c.ids === s.ids);
    equal(c.n, s.n);
  });

  it('gives the clone its own view cache, or the views would alias', () => {
    const s = mk(3, 2);
    const c = s.clone();
    const a = s.slot('pop', 1), b = c.slot('pop', 1);
    ok(a !== b, 'the clone handed back the original\'s view');
    b[0] = 5;
    equal(a[0], 0, 'the clone\'s view writes into the original\'s column');
  });

  it('a field added at runtime is cloned too — the whole point of the registry', () => {
    // Nothing in clone() mentions this field by name. That is the property that
    // was missing: `serialize` and the turn writeback each enumerated fields by
    // hand, so a phase could add one and have it dropped by both.
    const s = mk(3, 2);
    s.addField({ key: 'grievance', type: Float32Array, doc: 'test' });
    s.grievance[2] = 0.5;
    const c = s.clone();
    equal(c.grievance[2], 0.5, 'a field the clone code never heard of was dropped');
    c.grievance[2] = 0;
    equal(s.grievance[2], 0.5);
    ok(s.keys().includes('grievance'));
  });

  it('addField is idempotent, so a reload cannot wipe a column', () => {
    const s = mk();
    s.addField({ key: 'x', type: Float32Array });
    s.x[0] = 3;
    s.addField({ key: 'x', type: Float32Array });
    equal(s.x[0], 3, 'declaring a field twice reallocated it');
    equal(s.keys().filter((k) => k === 'x').length, 1);
  });

  it('copyFrom writes in place, keeping every outstanding view valid', () => {
    const s = mk(3, 2), t = mk(3, 2);
    const view = s.slot('pop', 0);
    t.pop[0] = 8; t.gdp[1] = 4;
    s.copyFrom(t);
    equal(s.pop[0], 8);
    equal(view[0], 8, 'copyFrom swapped the buffer and orphaned an existing view');
  });

  it('reports which fields belong in a save', () => {
    const s = mk();
    ok(s.keys().includes('anchor'));
    ok(!s.saved().includes('anchor'),
      'anchor is derived from the bake at load and should not be written to a save');
    ok(s.saved().includes('pop') && s.saved().includes('gdp'));
  });
});

describe('The live store', () => {
  it('is keyed on the same index as the graph', async () => {
    await bootWorld({ seed: SEED });
    const st = Game.state(), g = Game.graph();
    equal(st.n, g.n, 'the state and the graph hold different numbers of Areas');
    for (let i = 0; i < st.n; i += 97) {
      equal(st.idAt(i), g.idAt(i), `node ${i} is a different Area in the state and the graph`);
    }
    for (const f in Game.county) equal(Game.county[f].node, Game.nodeOf(f));
  });

  it('holds the whole country in about a quarter of a megabyte', async () => {
    await bootWorld({ seed: SEED });
    const st = Game.state();
    // 1,676 Areas x (6 pop + 6 anchor) x 8 + 1,676 x 8 + 1,676 x 2
    equal(st.bytes(), st.n * (12 * 8 + 8 + 2));
    ok(st.bytes() < 300 * 1024, `the store is ${(st.bytes() / 1024).toFixed(0)} KB`);
  });

  it('the Area record still behaves exactly like the object it replaced', async () => {
    await bootWorld({ seed: SEED });
    const c = Game.county['06037'];
    ok(c.name && c.st === '06');
    equal(c.pop.length, Ideology.count());

    // read
    const before = recPop(c);
    ok(before > 0);
    // index write
    const was = c.pop[0];
    c.pop[0] = was + 1000;
    equal(Game.county['06037'].pop[0], was + 1000, 'an indexed write did not stick');
    c.pop[0] = was;
    // whole-array write
    const fresh = Ideology.zeroMix();
    fresh[1] = 5;
    c.pop = fresh;
    equal(c.pop[1], 5);
    equal(c.pop[0], 0, 'assigning a whole mix did not clear the slots it omitted');
    // scalar read/write
    c.gdp = 1234;
    equal(Game.county['06037'].gdp, 1234);
    c.gdp += 1;
    equal(c.gdp, 1235);
  });

  it('c.pop.slice() detaches, so a snapshot is not a live view', async () => {
    await bootWorld({ seed: SEED });
    const c = Game.county['06037'];
    const snap = c.pop.slice();
    const was = snap[0];
    c.pop[0] = was + 1;
    equal(snap[0], was, 'slice() handed back a live view; every snapshot in the model is broken');
  });

  it('assigning a record\'s own mix to itself is not a self-wipe', async () => {
    // `cc.pop = cc.pop` reaches the setter, which fills with zero before copying.
    // loadState used to do exactly this on the fallback branch.
    await bootWorld({ seed: SEED });
    const c = Game.county['06037'];
    const before = recPop(c);
    c.pop = c.pop;
    close(recPop(c), before, 1e-9, 'a self-assignment zeroed the Area');
  });

  it('every Area\'s population still sums to the baked integer', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    let checked = 0, world = 0;
    for (const f in Game.county) {
      const want = bakedAreaPop(raw, f);
      equal(recPop(Game.county[f]), want, `Area ${f} does not sum to its baked population`);
      world += want;
      checked++;
    }
    equal(world, 340110988, 'the world population changed');
    ok(checked > 1600);
  });

  it('GDP survived the move into a column', async () => {
    // It did not, the first time: the view was created over a zeroed column and
    // every dollar in the country was discarded at that moment. Fifteen tests
    // failed and all of them said something else.
    const { raw } = await bootWorld({ seed: SEED });
    let live = 0, baked = 0;
    for (const f in Game.county) live += Game.countyGdp(f);
    for (const r of Object.values(raw.data.counties)) baked += r.gdp || 0;
    close(live, baked, 1e-3, 'the live GDP total does not match the bake');
    ok(live > 2e13, `total GDP is ${live}`);
  });

  it('anchors are shares of the founding mix and are not saved', async () => {
    await bootWorld({ seed: SEED, spawnParties: false });
    for (const f in Game.county) {
      const a = Game.anchorOf(f);
      equal(a.length, Ideology.count());
      let t = 0;
      for (let i = 0; i < a.length; i++) t += a[i];
      close(t, 100, 1e-9, `Area ${f}'s anchor is not a share vector`);
    }
    const doc = Game.serialize();
    const rec = Object.values(doc.counties)[0];
    equal(rec.anchor, undefined, 'the anchor was written into the save');
  });

  it('a save round-trip is still bit-exact through the columns', async () => {
    await bootWorld({ seed: SEED });
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    const before = {};
    for (const f in Game.county) before[f] = [...Game.county[f].pop, Game.county[f].gdp];
    // perturb
    for (const f in Game.county) { Game.county[f].gdp *= 1.5; Game.county[f].pop[0] += 17; }
    Game.loadState(doc);
    for (const f in Game.county) {
      const now = [...Game.county[f].pop, Game.county[f].gdp];
      for (let i = 0; i < now.length; i++) {
        equal(now[i], before[f][i], `Area ${f} field ${i} did not round-trip exactly`);
      }
    }
  });

  it('a load restores derived attrs it does not carry', async () => {
    await bootWorld({ seed: SEED });
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    for (const rec of Object.values(doc.counties)) if (rec.a) delete rec.a.culture;
    Game.loadState(doc);
    let tagged = 0;
    for (const f in Game.county) if (Game.county[f].attrs.culture) tagged++;
    equal(tagged, Object.keys(Game.county).length,
      'loading a save that omits attrs.culture wiped the region off every Area');
  });

  it('the store is rebuilt per world, not carried between them', async () => {
    await bootWorld({ seed: SEED });
    const first = Game.state();
    await bootWorld({ seed: 777 });
    ok(Game.state() !== first, 'the columnar store survived a Game.reset()');
  });
});

describe('The field registry', () => {
  it('declares exactly the fields the model uses, with a reason each', () => {
    const keys = FIELDS.map((f) => f.key);
    for (const k of ['pop', 'gdp', 'anchor', 'owner']) ok(keys.includes(k), `${k} is not declared`);
    for (const f of FIELDS) {
      ok(f.doc && f.doc.length > 20, `${f.key} has no doc; a field nobody can explain is a field nobody can drop`);
      ok(typeof f.type === 'function', `${f.key} has no array type`);
    }
  });
});
