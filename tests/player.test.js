/*
 * M6.2 — there is now such a thing as YOU.
 *
 * Before this milestone `grep -rni "player\b" js/*.js` returned zero hits across
 * thirteen modules and the only gate on acting was "is it this nation's turn",
 * which the human satisfied fifty-one times a round. Everything below is about
 * the two consequences of fixing that:
 *
 *   IDENTITY — one nation is yours, it is saved with the world, and it survives
 *   its own nation ceasing to exist, because losing has to be something the game
 *   can say out loud rather than a banner naming a country that is not there.
 *
 *   THE SWEEP — the other fifty seats resolve headlessly between two of your
 *   turns. The whole risk of that loop is that it does not stop: no player, a
 *   dead player, a corrupted order. Each of those is a test here, because the
 *   failure mode is a hung tab rather than a wrong number, and a hung tab is not
 *   something the rest of the suite would notice.
 */
import { describe, it, ok, equal, deepEqual } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** Boot a world and sit somebody in the chair. */
async function bootPlaying(nid, opts = {}) {
  const ctx = await bootWorld({ seed: SEED, ...opts });
  Game.setPlayer(nid == null ? TurnSystem.currentId() : nid);
  return ctx;
}

describe('Identity', () => {
  it('a fresh world has nobody in the chair', async () => {
    /*
     * This is load-bearing, not incidental. The M5 simulator and most of this
     * suite drive `World.advanceTurn` directly and never sit anyone down; if
     * `Game.init` invented a player, `AI.sweep` would find a slot to stop at and
     * start consuming turns inside code that only asked for a world.
     */
    await bootWorld({ seed: SEED });
    equal(Game.getPlayer(), null);
    equal(Game.playerNation(), null);
    equal(Game.isPlayer('06'), false);
  });

  it('refuses a seat that does not exist', async () => {
    await bootWorld({ seed: SEED });
    equal(Game.setPlayer('not-a-nation'), false);
    equal(Game.getPlayer(), null, 'a refused id was seated anyway');
    equal(Game.setPlayer('06'), true);
    equal(Game.getPlayer(), '06');
    ok(Game.isPlayer('06'));
    ok(!Game.isPlayer('32'));
  });

  it('survives a save and a load', async () => {
    const ctx = await bootPlaying('49');
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    Game.setPlayer('06');            // move the chair...
    StateDoc.applyModel(doc);        // ...and load the document that remembers otherwise
    equal(Game.getPlayer(), '49', 'the loaded document did not restore who was playing');
  });

  it('remembers who you WERE after your nation dies', async () => {
    /*
     * `getPlayer` keeps naming the dead nation and `playerNation` is the one
     * that returns null. Nulling the id on death would throw away the only
     * answer to "what was I playing", which is the first thing a defeat screen
     * needs (M6.4) and the second thing a save wants to say.
     */
    const ctx = await bootPlaying('44'); // Rhode Island: small, absorbable
    const victim = Game.getPlayer();
    const eater = [...Game.adjacentNations(victim)][0];
    Game.mergeInto(eater, victim); // (into, from)
    equal(Game.getPlayer(), '44', 'the seat was cleared when the nation died');
    equal(Game.playerNation(), null, 'a dead nation was returned as a live record');
    equal(Game.getNation('44'), undefined);
    ok(ctx.rng);
  });

  it('a reset clears the chair', async () => {
    await bootPlaying('06');
    Game.reset();
    equal(Game.getPlayer(), null);
  });
});

describe('The AI sweep', () => {
  it('declines to run when nobody is playing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = fingerprint();
    const out = AI.sweep(T(), rng);
    equal(out.turns, 0);
    equal(out.rounds, 0);
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `an unplayed sweep changed ${k}`);
  });

  it('stops exactly on the player\'s slot', async () => {
    const { rng } = await bootPlaying(null);
    const me = Game.getPlayer();
    for (let i = 0; i < 6; i++) {
      TurnSystem.advance(T(), rng);            // the player's own turn ends
      const out = AI.sweep(T(), rng);
      equal(TurnSystem.currentId(), me, `the sweep stopped on ${TurnSystem.currentId()}, not on the player`);
      ok(!out.exhausted, 'the sweep hit its step backstop');
      ok(!out.playerGone);
    }
  });

  it('one player turn is exactly one world turn', async () => {
    /*
     * ONE CLOCK, at its new owner. The world used to advance from a renderer
     * function, so anything headless stepping the turn order moved nations
     * through a world that never changed; now TurnSystem.advance owns the round
     * boundary and this is the invariant that says so.
     */
    const { rng } = await bootPlaying(null);
    for (let i = 0; i < 8; i++) {
      const before = World.getTurn();
      TurnSystem.advance(T(), rng);
      const out = AI.sweep(T(), rng);
      equal(World.getTurn() - before, 1,
        `the world moved ${World.getTurn() - before} turns for one turn of play`);
      equal(out.rounds, 1, 'the sweep did not cross exactly one round boundary');
    }
  });

  it('does not take the player\'s turn for them', async () => {
    const { rng } = await bootPlaying(null);
    const me = Game.getPlayer();
    const before = { ...Game.getNation(me) };
    const areas = Game.getNation(me).counties.size;
    const out = AI.sweep(T(), rng); // called while it IS the player's turn
    equal(out.turns, 0, 'the sweep played the player\'s own seat');
    equal(Game.getNation(me).counties.size, areas);
    equal(Game.getNation(me).treasury, before.treasury);
  });

  it('is deterministic: the same seed sweeps the same way', async () => {
    const run = async () => {
      const { rng } = await bootPlaying('06');
      for (let i = 0; i < 5; i++) { TurnSystem.advance(T(), rng); AI.sweep(T(), rng); }
      return fingerprint();
    };
    deepEqual(await run(), await run(), 'two identical games diverged');
  });

  it('stops, and says so, when the player\'s nation is gone', async () => {
    /*
     * The player's slot will never come up again, so a naive loop runs until the
     * tab dies. This is the case the backstop exists for and the one it must NOT
     * be what catches.
     */
    const { rng } = await bootPlaying('44');
    const me = Game.getPlayer();
    Game.mergeInto([...Game.adjacentNations(me)][0], me); // (into, from)
    const out = AI.sweep(T(), rng);
    equal(out.playerGone, true, 'the sweep did not notice the player was gone');
    equal(out.exhausted, false, 'it ran to the step backstop instead of checking');
    equal(out.turns, 0);
  });

  it('never runs longer than the order it is sweeping', async () => {
    const { rng } = await bootPlaying(null);
    const n = Game.nations.size;
    for (let i = 0; i < 4; i++) {
      TurnSystem.advance(T(), rng);
      const out = AI.sweep(T(), rng);
      ok(out.turns < n, `a sweep of a ${n}-nation order took ${out.turns} turns`);
    }
  });

  it('the fifty seats still pass in M6.2, and that is a decision not a bug', async () => {
    /*
     * The policy is deliberately empty until M6.3: this milestone owns the seam
     * and the loop, and a scoring function landing in the same commit would hide
     * whether either works. The world engine still runs every round, so nations
     * still fragment and movements still declare — what is missing is deliberate
     * action. When M6.3 lands, this expectation flips and the rest of the file
     * should not move.
     */
    const { rng } = await bootPlaying(null);
    equal(AI.chooseMove(Game.getPlayer(), T(), rng), null);
    let acted = 0;
    for (let i = 0; i < 4; i++) {
      TurnSystem.advance(T(), rng);
      acted += AI.sweep(T(), rng).acted.length;
    }
    equal(acted, 0);
  });

  it('a policy that proposes an illegal move passes instead of throwing', async () => {
    /*
     * The AI is allowed to be wrong about what it can afford. It is not allowed
     * to stop the game — so a scoring bug in M6.3 shows up as a nation that does
     * nothing, not as a broken turn loop.
     */
    const { rng } = await bootPlaying(null);
    const real = AI.setPolicy((nid) => ({ type: 'annex', nid, areas: [] })); // always refused
    try {
      const out = AI.takeTurn('06', T(), rng);
      equal(out.intent, null);
      ok(out.refused && out.refused.length > 8, 'the refusal carried no reason');
      TurnSystem.advance(T(), rng);
      const sweep = AI.sweep(T(), rng);
      equal(sweep.acted.length, 0);
      equal(TurnSystem.currentId(), Game.getPlayer());
    } finally {
      AI.setPolicy(real);
    }
  });
});

describe('The newspaper reports the interval, not the turn', () => {
  it('an id mark excludes everything the player has already been told', async () => {
    const { rng } = await bootPlaying(null);
    /*
     * Thirty rounds and not twelve, because with the M6.2 pass-policy the only
     * source of news is the world engine, and the tuning pass put the first
     * secession at turns 22-29. A dozen rounds of a quiet world is a real state
     * of the game, not a broken ledger — but a mark that excludes nothing has
     * not been shown to exclude anything, so this waits for actual history.
     */
    for (let i = 0; i < 30; i++) { TurnSystem.advance(T(), rng); AI.sweep(T(), rng); }
    ok(Ledger.count() > 0, 'thirty rounds produced no events at all');
    const mark = Ledger.mark();
    equal(Ledger.after(mark).length, 0, 'the mark did not exclude the past');
    Ledger.append({ kind: 'annex', subject: '06', text: 'A thing that just happened.' });
    const fresh = Ledger.after(mark);
    equal(fresh.length, 1);
    equal(fresh[0].text, 'A thing that just happened.');
  });

  it('spans a world-turn boundary, which a single-turn query cannot', async () => {
    /*
     * The sweep straddles the boundary — the nations after you in the order act
     * in the old world turn, the ones before you act in the new one. Reporting
     * either half alone silently drops the other.
     */
    const { rng } = await bootPlaying(null);
    for (let i = 0; i < 20; i++) { TurnSystem.advance(T(), rng); AI.sweep(T(), rng); }
    const mark = Ledger.mark();
    const t = World.getTurn();
    Ledger.append({ turn: t, kind: 'defect', subject: 'a', delta: 1, text: 'Before the boundary.' });
    Ledger.append({ turn: t + 1, kind: 'defect', subject: 'b', delta: 1, text: 'After the boundary.' });
    const heads = Ledger.rank(Ledger.after(mark), 6);
    equal(heads.length, 2, 'the interval lost one side of the world-turn boundary');
    equal(Ledger.headlines(t + 1).length, 1, 'a single-turn query should see only its own turn');
  });

  it('still drops a founding that sits beside its own declaration', async () => {
    const { rng } = await bootPlaying(null);
    ok(rng);
    const mark = Ledger.mark();
    const t = World.getTurn();
    Ledger.append({ turn: t, kind: 'declare', subject: 'X', delta: 4, text: 'X declared independence.' });
    Ledger.append({ turn: t, kind: 'found', subject: 'X', delta: 4, text: 'X was founded.' });
    const heads = Ledger.rank(Ledger.after(mark), 6);
    equal(heads.length, 1);
    equal(heads[0].kind, 'declare');
  });
});
