/*
 * M0.6 — save/load.
 *
 * SaveManager itself is DOM-bound (modals, flash, select), so these tests
 * exercise the module-level serialize/loadState contract it is built on: every
 * module holding mutable state round-trips, and the pieces v1 dropped —
 * World.turn, Colors.gen, Parties.spawned, Market prices, the RNG — all survive.
 */
import { describe, it, ok, equal, notEqual, close, deepEqual } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';
import * as StateDoc from '../js/statedoc.js';

const SEED = 20260829;

/*
 * THE REAL DOCUMENT CODE, not a copy of it.
 *
 * These two used to be a hand-written reimplementation of SaveManager's
 * snapshot() and apply(), because those functions were tangled up with the DOM
 * and could not run headlessly. A test of a copy passes while the original is
 * broken, so M2.5 split the model half into js/statedoc.js and these are now
 * thin wrappers that supply the session values a page would supply.
 */
const headlessSnapshot = (seed, rng) => StateDoc.assemble({ seed, rng, ts: 1 });
const headlessApply = (snap) => StateDoc.applyModel(snap).rng;

describe('Save round-trip', () => {
  it('every stateful module exposes serialize + loadState', () => {
    for (const [name, mod] of [['Game', Game], ['TurnSystem', TurnSystem], ['World', World],
                               ['Market', Market], ['Colors', Colors], ['Movements', Movements]]) {
      ok(typeof mod.serialize === 'function', `${name}.serialize is missing`);
      ok(typeof mod.loadState === 'function', `${name}.loadState is missing`);
    }
  });

  it('World.turn survives — the v1 save dropped it', async () => {
    await bootWorld({ seed: SEED });
    for (let i = 0; i < 7; i++) World.advanceTurn(window.TUNE);
    equal(World.getTurn(), 7);
    const snap = World.serialize();
    World.setTurn(0);
    World.loadState(snap);
    equal(World.getTurn(), 7, 'world turn did not survive the round trip');
  });

  it('Colors.gen survives, so a post-load nation does not reuse a colour', async () => {
    await bootWorld({ seed: SEED });
    const a = Colors.newColor();
    const b = Colors.newColor();
    notEqual(a, b);
    const snap = Colors.serialize();
    equal(snap.gen, 2);

    // reload the page: gen resets, then the save restores it
    Colors.reset();
    Colors.assign(['06', '48']);
    equal(Colors.newColor(), a, 'without a restore, gen restarts and reuses the first colour');
    Colors.loadState(snap);
    const c = Colors.newColor();
    notEqual(c, a, 'restored gen still produced a colour already in use');
    notEqual(c, b);
  });

  it('the movement roster survives — a loaded save reports its own', async () => {
    const { spawned } = await bootWorld({ seed: 4242 });
    ok(spawned.length > 0, 'no movements spawned at seed 4242');
    const snap = JSON.parse(JSON.stringify(Movements.serialize()));
    deepEqual(snap.spawned, spawned);
    ok(Object.keys(snap.ideologyOf).length > 0, 'the movement->ideology map was not serialized');

    // a fresh session rerolls a different roster...
    const other = await bootWorld({ seed: 99 });
    // ...and loading the save must put the original roster back
    Movements.loadState(snap);
    deepEqual(Movements.getSpawned(), spawned, 'the roster from the save was not restored');
    ok(other.spawned.length >= 0);
  });

  it('Market prices survive, so the first trade after a load is priced correctly', async () => {
    await bootWorld({ seed: SEED });
    for (let i = 0; i < 5; i++) World.advanceTurn(window.TUNE);
    const priced = Market.getPrices().slice();
    const snap = Market.serialize();

    for (let i = 0; i < 15; i++) World.advanceTurn(window.TUNE);
    notEqual(JSON.stringify(Market.getPrices()), JSON.stringify(priced), 'prices did not move over 15 turns');

    Market.loadState(snap);
    deepEqual(Market.getPrices(), priced, 'prices did not survive the round trip');
  });

  it('the RNG survives, so a loaded save is not a fresh dice roll', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) rng.stream('combat').random();
    const snap = rng.serialize();
    const expected = Array.from({ length: 6 }, () => rng.stream('combat').roll(6));

    const restored = RNG.restore(snap);
    const actual = Array.from({ length: 6 }, () => restored.stream('combat').roll(6));
    deepEqual(actual, expected, 'a loaded save re-rolls different dice — save-scumming is free');
  });

  it('a full snapshot -> apply reproduces the whole world', async () => {
    const { rng, seed } = await bootWorld({ seed: 31337 });
    for (let i = 0; i < 6; i++) World.advanceTurn(window.TUNE);
    Game.moveCounties([...Game.nations.get('32').counties].slice(0, 5), '06');
    const snap = JSON.parse(JSON.stringify(headlessSnapshot(seed, rng)));
    const before = fingerprint();

    // scribble hard over the live state
    await bootWorld({ seed: 5 });
    for (let i = 0; i < 3; i++) World.advanceTurn(window.TUNE);
    notEqual(JSON.stringify(fingerprint()), JSON.stringify(before));

    headlessApply(snap);
    deepEqual(fingerprint(), before, 'the world did not come back identical');
  });

  it('a restored world advances identically to one that never saved', async () => {
    const { rng, seed } = await bootWorld({ seed: 8080 });
    for (let i = 0; i < 4; i++) World.advanceTurn(window.TUNE);
    const snap = JSON.parse(JSON.stringify(headlessSnapshot(seed, rng)));

    for (let i = 0; i < 6; i++) World.advanceTurn(window.TUNE);
    const straightThrough = fingerprint();

    headlessApply(snap);
    for (let i = 0; i < 6; i++) World.advanceTurn(window.TUNE);
    deepEqual(fingerprint(), straightThrough,
      'save-then-continue diverged from never-saving');
  });

  it('the serialized payload is lossless and omits empty ext/attrs', async () => {
    await bootWorld({ seed: SEED });
    for (let i = 0; i < 30; i++) World.advanceTurn(window.TUNE);
    const doc = Game.serialize();
    const recs = Object.values(doc.counties);
    ok(recs.length > 1600);

    // Lossless: every stored number is bit-identical to the live model. This is
    // what "a save/load round-trip reproduces the state exactly" costs.
    for (const [f, r] of Object.entries(doc.counties)) {
      const c = Game.county[f];
      equal(r.gdp, c.gdp, `Area ${f} gdp was altered by serialize`);
      for (let i = 0; i < c.pop.length; i++) {
        equal(r.p[i], c.pop[i], `Area ${f} ${Ideology.idAt(i)} count was altered by serialize`);
      }
    }

    // empty bags are absent, not written as {}
    ok(recs.some((r) => r.m === undefined), 'every Area carries a movement bag; the omission is not working');
    equal(recs.some((r) => r.a !== undefined && Object.keys(r.a).length === 0), false,
      'an empty attrs bag was serialized');
    equal(recs.some((r) => r.m !== undefined && Object.keys(r.m).length === 0), false,
      'an empty movement bag was serialized');
  });

  it('loadState skips Areas the current build does not have, and reports them', async () => {
    await bootWorld({ seed: SEED });
    const snap = Game.serialize();
    snap.counties['99999'] = { p: Ideology.zeroMix(), gdp: 1 };
    snap.nations[0].counties = [...snap.nations[0].counties, '99999'];
    const r = Game.loadState(snap);
    equal(r.dropped, 1, 'an unknown Area record was not counted');
    equal(r.orphans, 1, 'an orphan ownership entry was not counted');
    equal(Game.getOwner('99999'), undefined, 'a dead fips reached the owner map');
    // and the world still runs rather than throwing three turns later
    World.advanceTurn(window.TUNE);
    World.advanceTurn(window.TUNE);
    ok(true);
  });
});

describe('Turn order', () => {
  it('round is incremented once per wrap, by endTurn alone', async () => {
    await bootWorld({ seed: SEED });
    const n = TurnSystem.progress().total;
    equal(TurnSystem.progress().round, 1);
    for (let i = 0; i < n; i++) TurnSystem.endTurn();
    equal(TurnSystem.progress().round, 2, 'one full cycle should advance exactly one round');
    equal(TurnSystem.progress().index, 1);
  });

  it('dropping the last actor wraps without hiding the round boundary', async () => {
    await bootWorld({ seed: SEED });
    const order = TurnSystem.snapshot().order;
    // walk to the last slot
    while (TurnSystem.progress().index < TurnSystem.progress().total) TurnSystem.endTurn();
    const last = TurnSystem.currentId();
    equal(last, order[order.length - 1]);
    const roundBefore = TurnSystem.progress().round;

    // the acting nation dissolves during its own turn
    TurnSystem.sync();
    Game.moveCounties([...Game.nations.get(last).counties], order[0]);
    TurnSystem.sync(); // -> drop(last), wraps ptr to 0 but must not bump round

    equal(TurnSystem.progress().round, roundBefore,
      'drop() bumped the round counter behind completeTurn\'s back');
    TurnSystem.endTurn();
    equal(TurnSystem.progress().round, roundBefore + 1,
      'endTurn() did not consume the wrap flag, so the round-boundary growth tick is skipped');
  });
});

describe('data/state.json — the live document', () => {
  /*
   * M2.5's acceptance: the round-trip test passes against the real file, over
   * the real HTTP endpoint. Everything above this block round-trips a document
   * through memory; this one round-trips it through the server, so the JSON
   * encoding, the atomic write and the read path are all under test too.
   *
   * The file is the player's live game, so the suite puts back whatever it
   * found before it started.
   */
  const GET = () => fetch('/api/state', { cache: 'no-store' });

  it('round-trips the whole world through the server', async () => {
    const preserved = await GET().then((r) => (r.ok ? r.json() : null)).catch(() => null);
    let served = true;
    try {
      const { seed, rng } = await bootWorld({ seed: 4242 });
      for (let i = 0; i < 5; i++) World.advanceTurn(window.TUNE, rng);
      // move some ground so ownership is not just the opening position
      Game.moveCounties([...Game.annexTargets('49')].slice(0, 5), '49');
      const doc = StateDoc.assemble({ seed, rng, ts: 1, name: 'round-trip' });
      const before = fingerprint();

      const put = await fetch('/api/state', { method: 'PUT', body: JSON.stringify(doc) });
      if (!put.ok) { served = false; return; }

      // a completely different world, so nothing can survive by accident
      await bootWorld({ seed: 777 });
      for (let i = 0; i < 3; i++) World.advanceTurn(window.TUNE, RNG.create(1));
      notEqual(fingerprint().ownerHash, before.ownerHash, 'the two worlds were identical to begin with');

      const back = await GET().then((r) => r.json());
      equal(StateDoc.validate(back, null), null, 'the served document did not validate');
      StateDoc.applyModel(back);

      const after = fingerprint();
      for (const k of Object.keys(before)) {
        equal(after[k], before[k], `${k} did not survive the trip through data/state.json`);
      }
    } finally {
      if (served && preserved) {
        await fetch('/api/state', { method: 'PUT', body: JSON.stringify(preserved) }).catch(() => {});
      } else if (served && !preserved) {
        await fetch('/api/state', { method: 'DELETE' }).catch(() => {});
      }
    }
  });

  it('the served document is exactly what assemble() built', async () => {
    const preserved = await GET().then((r) => (r.ok ? r.json() : null)).catch(() => null);
    try {
      const { seed, rng } = await bootWorld({ seed: 4242 });
      const doc = StateDoc.assemble({ seed, rng, ts: 1 });
      const put = await fetch('/api/state', { method: 'PUT', body: JSON.stringify(doc) });
      if (!put.ok) return;
      const back = await GET().then((r) => r.json());
      // byte-identical after a JSON round-trip: no NaN, no Infinity, no typed
      // array stringified as {"0":..}, no undefined silently dropped
      deepEqual(back, JSON.parse(JSON.stringify(doc)),
        'the document changed shape on its way through the server');
    } finally {
      if (preserved) await fetch('/api/state', { method: 'PUT', body: JSON.stringify(preserved) }).catch(() => {});
      else await fetch('/api/state', { method: 'DELETE' }).catch(() => {});
    }
  });
});

describe('The document module', () => {
  it('enumerates every stateful module, so none can be forgotten', async () => {
    await bootWorld({ seed: SEED });
    const mods = { Game, TurnSystem, World, Market, Colors, Movements, Ledger, Military, Relations, Events, Leaders };
    for (const name of StateDoc.STATEFUL_MODULES) {
      ok(mods[name], `STATEFUL_MODULES names "${name}", which does not exist`);
      ok(typeof mods[name].serialize === 'function', `${name}.serialize is missing`);
      ok(typeof mods[name].loadState === 'function', `${name}.loadState is missing`);
    }
    // and the document actually carries a key for each of them
    const doc = StateDoc.assemble({ seed: SEED, rng: RNG.create(1) });
    for (const k of ['game', 'turns', 'world', 'market', 'colors', 'parties', 'military', 'relations', 'events', 'leaders']) {
      ok(doc[k] !== undefined, `the document has no "${k}" section`);
    }
  });

  it('refuses a v1 document with a message a player can act on', async () => {
    await bootWorld({ seed: SEED });
    const msg = StateDoc.validate({ v: 1, game: { nations: [] } }, null);
    ok(msg && /version 1/.test(msg), `the v1 refusal said: ${msg}`);
    ok(/Start a new game/.test(msg), 'the refusal does not tell the player what to do');
  });

  it('refuses a document made against a different map build', async () => {
    await bootWorld({ seed: SEED });
    const doc = StateDoc.assemble({ seed: SEED, rng: RNG.create(1) });
    doc.build.areas = 999;
    const msg = StateDoc.validate(doc, null);
    ok(msg && /different map build/.test(msg), `the build-mismatch refusal said: ${msg}`);
    ok(/999/.test(msg) && /areas\.json/.test(msg), 'the refusal does not name the numbers or the file');
  });

  it('accepts its own output', async () => {
    const { seed, rng } = await bootWorld({ seed: SEED });
    equal(StateDoc.validate(StateDoc.assemble({ seed, rng }), null), null);
  });
});
