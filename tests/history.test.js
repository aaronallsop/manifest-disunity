/*
 * M7.6 — the map, at every turn it has been.
 *
 * ONE BASELINE AND A LIST OF DELTAS. Ownership barely moves between two turns —
 * a handful of Areas out of 1,676 — so a full snapshot per turn is a quarter of
 * a megabyte of almost entirely repeated numbers, and what CHANGED is a few
 * dozen. Measured over thirty turns of a played game: 13 KB.
 *
 * The ledger already says "the State of Jefferson declared independence, taking
 * 14 Areas", and that is a sentence about a SHAPE. This is what lets a player
 * see the shape.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** The live ownership vector, for comparing against a replayed one. */
function liveOwners() {
  const g = Game.graph();
  return Int16Array.from(Game.state().owner.subarray(0, g.n));
}

describe('Recording', () => {
  it('the opening position is a frame', async () => {
    await bootWorld({ seed: SEED });
    equal(History.count(), 1, 'the timeline does not start where the game does');
    equal(History.first(), 0);
    equal(History.lastTurn(), 0);
  });

  it('one frame per turn, and the first one is the only full copy', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
    equal(History.count(), 7);
    equal(History.lastTurn(), 6);
    const ser = History.serialize();
    equal(ser.frames[0].base, true, 'the baseline is not marked as one');
    for (const f of ser.frames.slice(1)) {
      equal(f.base, false, `turn ${f.turn} stored a full copy`);
      ok(f.nodes.length < Game.graph().n, `turn ${f.turn} stored ${f.nodes.length / 2} changes`);
    }
  });

  it('and it is small, which is the whole reason for the deltas', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), rng);
    const bytes = JSON.stringify(History.serialize()).length;
    const full = Game.graph().n * 21 * 4;   // a naive per-turn snapshot, roughly
    ok(bytes < full / 3,
      `${Math.round(bytes / 1024)} KB against a naive ${Math.round(full / 1024)} KB`);
  });

  it('recording twice for the same turn replaces rather than appends', async () => {
    await bootWorld({ seed: SEED });
    History.capture(0);
    History.capture(0);
    equal(History.count(), 1, 'a caller that ticked twice doubled the history');
  });
});

describe('Replaying', () => {
  it('the last frame IS the live map', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 10; i++) World.advanceTurn(T(), rng);
    const replayed = History.ownersAt(World.getTurn());
    const live = liveOwners();
    equal(replayed.length, live.length);
    for (let i = 0; i < live.length; i++) {
      equal(replayed[i], live[i], `node ${i} disagrees between the replay and the world`);
    }
  });

  it('an earlier turn is a different map', async () => {
    /*
     * The ownership is moved deliberately rather than by waiting for the world
     * to do it: `advanceTurn` alone only moves borders through secession, which
     * at this seed does not fire inside fifteen turns — so a test that waits is
     * testing the tuning of the secession pacing rather than the timeline.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 5; i++) World.advanceTurn(T(), rng);
    const targets = [...Game.annexTargets('06')].slice(0, 8);
    ok(targets.length, 'California borders nobody');
    Game.moveCounties(targets, '06', { silent: true, reason: 'annex' });
    World.advanceTurn(T(), rng);
    const then = History.ownersAt(0);
    const now = History.ownersAt(World.getTurn());
    let moved = 0;
    for (let i = 0; i < now.length; i++) if (then[i] !== now[i]) moved++;
    equal(moved, targets.length, `${moved} Areas changed hands; ${targets.length} were taken`);
  });

  it('and a scrubber dragged past either end reads the end', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 5; i++) World.advanceTurn(T(), rng);
    const first = History.ownersAt(History.first());
    const last = History.ownersAt(History.lastTurn());
    const before = History.ownersAt(-99);
    const after = History.ownersAt(9999);
    for (let i = 0; i < first.length; i++) {
      equal(before[i], first[i], 'a turn before the game began is not the opening position');
      equal(after[i], last[i], 'a turn after the game is not the latest one');
    }
  });

  it('the standings at a turn are the standings at that turn', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const opening = History.standingsAt(0);
    for (let i = 0; i < 12; i++) World.advanceTurn(T(), rng);
    const now = History.standingsAt(World.getTurn());
    ok(opening.length >= 50, `the opening board had ${opening.length} nations`);
    for (let i = 1; i < now.length; i++) {
      ok(now[i - 1].areas >= now[i].areas, 'the standings are not sorted');
    }
    // ...and they agree with the live model at the live turn.
    const live = new Map();
    for (const [nid] of Game.nations) live.set(nid, Game.getNation(nid).counties.size);
    for (const row of now) {
      if (!row.id || !live.has(row.id)) continue;
      equal(row.areas, live.get(row.id), `${row.name}: the timeline and the world disagree`);
    }
  });
});

describe('The cast', () => {
  it('a nation is named even after it has ceased to exist', async () => {
    /*
     * Half the roster will not be there by the end, and a timeline that cannot
     * name the country that used to be somewhere is a timeline of grey shapes.
     */
    const { rng } = await bootWorld({ seed: SEED });
    const doomed = '44';
    const name = Game.getNation(doomed).name;
    const index = Game.nationIndexOf(doomed);
    World.advanceTurn(T(), rng);
    Game.mergeInto([...Game.adjacentNations(doomed)][0], doomed);
    World.advanceTurn(T(), rng);
    equal(Game.getNation(doomed), undefined, 'the fixture did not actually remove it');
    equal(History.nameOf(index), name, 'the timeline forgot a nation that used to exist');
    ok(History.colorOf(index), 'and it has no colour to draw it with');
  });

  it('every owner index on the map can be named and coloured', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 15; i++) World.advanceTurn(T(), rng);
    for (const turn of [0, 5, 10, 15]) {
      const owners = History.ownersAt(turn);
      const seen = new Set();
      for (let i = 0; i < owners.length; i++) if (owners[i] >= 0) seen.add(owners[i]);
      for (const idx of seen) {
        ok(History.who(idx), `turn ${turn}: owner index ${idx} is nobody`);
        // Hex for the 51 founding states, hsl() for nations minted during play.
        ok(/^(#[0-9a-f]{6}|hsl\()/i.test(History.colorOf(idx)),
          `owner ${idx} has no colour: "${History.colorOf(idx)}"`);
      }
    }
  });
});

describe('It is state', () => {
  it('survives a save and a load, deltas and cast alike', async () => {
    const ctx = await bootWorld({ seed: SEED });
    for (let i = 0; i < 8; i++) World.advanceTurn(T(), ctx.rng);
    const at3 = Array.from(History.ownersAt(3));
    const frames = History.count();
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    History.reset();
    equal(History.count(), 0);
    StateDoc.applyModel(doc);
    equal(History.count(), frames, 'the timeline did not come back');
    const back = History.ownersAt(3);
    for (let i = 0; i < at3.length; i++) equal(back[i], at3[i], `node ${i} replayed differently`);
  });

  it('and carries on recording after a load', async () => {
    const ctx = await bootWorld({ seed: SEED });
    for (let i = 0; i < 4; i++) World.advanceTurn(T(), ctx.rng);
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    StateDoc.applyModel(doc);
    const before = History.count();
    World.advanceTurn(T(), ctx.rng);
    equal(History.count(), before + 1, 'a loaded game stopped recording its own history');
    const replayed = History.ownersAt(World.getTurn());
    const live = liveOwners();
    for (let i = 0; i < live.length; i++) {
      equal(replayed[i], live[i], `node ${i} diverged after a load`);
    }
  });

  it('reading it changes nothing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
    const before = fingerprint();
    for (let t = 0; t <= 6; t++) { History.ownersAt(t); History.standingsAt(t); }
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `reading the timeline changed ${k}`);
  });
});
