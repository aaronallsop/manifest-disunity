/*
 * M7.8 — whether the rest of the continent admits that you exist.
 *
 * Until this milestone a nation born on turn 14 was, the instant it existed, a
 * peer of the fifty states it broke out of. What is pinned here is the four
 * things that stopped being true: an unrecognised state cannot sign a bilateral
 * deal, cannot take a seat in a coalition, is paid a smuggler's price on the
 * world market, and carries a signed penalty on Influence — and none of it is
 * permanent, because a state that lasts becomes a fact whatever anybody thinks.
 *
 * The two most important invariants are the cheap ones. THE FOUNDING STATES ARE
 * RECOGNISED BY CONSTRUCTION, so the matrix is empty on turn 0 and the whole
 * system costs nothing on a board nobody has broken; and RECOGNITION IS A
 * DEFICIT IN THE INFLUENCE STOCK, so adding it did not move a single established
 * nation's standing.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as Power from '../js/power.js';
import * as RNG from '../js/rng.js';

const SEED = 20260830;
const T = () => window.TUNE;

/** A breakaway with a parent, made the way the game makes one. */
function breakOff(parent, n, rng) {
  const areas = [...Game.getNation(parent).counties].slice(0, n);
  const born = Game.breakApart(areas, { exclude: parent, reason: 'declare', rng });
  for (const id of born) Recognition.founded(id, parent, { turn: World.getTurn() });
  return born[0];
}

describe('Recognition — the default', () => {
  it('the fifty-one founding states are recognised by everybody, and store nothing', async () => {
    await bootWorld({ seed: SEED });
    equal(Recognition.count(), 0, 'the matrix is not empty on turn 0');
    for (const [a] of Game.nations) {
      equal(Recognition.scalar(a), 1, `${a} is not fully recognised`);
      for (const [b] of Game.nations) ok(Recognition.recognises(a, b), `${a} does not recognise ${b}`);
    }
  });

  it('and a nation founded during play is recognised by nobody', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    ok(nid, 'nothing broke off');
    equal(Recognition.scalar(nid), 0, 'a brand-new state opened with recognition');
    ok(!Recognition.recognises('06', nid), 'the state it left recognises it already');
    equal(Recognition.parentOf(nid), '06');
  });

  it('a state that was RELEASED is recognised by whoever let it go', async () => {
    /*
     * The cleanest difference between the two ways a nation is born: a
     * declaration is a rebellion until the parent says otherwise, and a release
     * has the only signature the world is waiting on from the first day.
     */
    const { rng } = await bootWorld({ seed: SEED });
    const areas = [...Game.getNation('06').counties].slice(0, 6);
    const res = Moves.resolve({ type: 'release', nid: '06', areas }, rng, T());
    if (!res.ok || !res.born.length) return;
    for (const id of res.born) {
      ok(Recognition.recognises('06', id), 'the releaser does not recognise what it released');
      ok(Recognition.scalar(id) > 0, 'a released state opened as a pariah');
    }
  });
});

describe('Recognition — the scalar', () => {
  it('is weight, not head count', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    // Two rump states against one large one.
    const small = [...Game.nations.keys()].filter((x) => x !== nid && x !== '06')
      .sort((a, b) => Game.nationWeight(a) - Game.nationWeight(b));
    Recognition.grant(small[0], nid, { tune: T() });
    Recognition.grant(small[1], nid, { tune: T() });
    const two = Recognition.scalar(nid);
    Recognition.reset();
    Recognition.founded(nid, '06', { turn: World.getTurn() });
    const big = small[small.length - 1];
    Recognition.grant(big, nid, { tune: T() });
    ok(Recognition.scalar(nid) > two,
      'two of the smallest nations counted for more than the largest one');
  });

  it('and reaches 1 when the whole continent has signed', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    for (const [other] of Game.nations) if (other !== nid) Recognition.grant(other, nid, { tune: T() });
    close(Recognition.scalar(nid), 1, 1e-9);
  });

  it('the Why record names who is refusing, worst first', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const rec = Recognition.legitimacy(nid, T());
    ok(rec.refused.length === Game.nations.size - 1, 'somebody is neither for nor against');
    for (let i = 1; i < rec.refused.length; i++) {
      ok(rec.refused[i - 1].share >= rec.refused[i].share, 'the refusers are not sorted by weight');
    }
    ok(/rebellion/.test(rec.summary), `the parent is not named: "${rec.summary}"`);
  });
});

describe('Recognition — how the world makes up its mind', () => {
  it('the parent giving in is the largest single term', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const other = [...Game.nations.keys()].find((x) => x !== nid && x !== '06');
    const before = Recognition.chance(other, nid, T()).value;
    Recognition.grant('06', nid, { tune: T() });
    const after = Recognition.chance(other, nid, T()).value;
    ok(after > before, `the parent's recognition did not move anybody: ${before} -> ${after}`);
    const term = Recognition.chance(other, nid, T()).inputs.find((i) => i.label === 'Let go of');
    ok(term && term.contribution > 0, 'the parent term is not in the record');
  });

  it('a state that lasts becomes a fact whatever anybody thinks', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const other = [...Game.nations.keys()].find((x) => x !== nid && x !== '06');
    const young = Recognition.chance(other, nid, T()).value;
    // The same pair, with the founding pushed back beyond the establishment window.
    Recognition.founded(nid, '06', { turn: World.getTurn() - T().get('recognition.ageTurns') });
    const old = Recognition.chance(other, nid, T()).value;
    ok(old > young, `endurance bought nothing: ${young} -> ${old}`);
  });

  it('and somebody who already recognises you is not asked again', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const other = [...Game.nations.keys()].find((x) => x !== nid && x !== '06');
    Recognition.grant(other, nid, { tune: T() });
    equal(Recognition.chance(other, nid, T()).value, 0);
    equal(Recognition.grant(other, nid, { tune: T() }), false, 'the same recognition was banked twice');
  });

  it('a tick moves the world along, and only toward recognition', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    let last = 0;
    for (let i = 0; i < 25; i++) {
      World.setTurn(World.getTurn() + 1);
      Recognition.tick(T(), rng);
      const v = Recognition.scalar(nid);
      ok(v >= last, `legitimacy went backwards: ${last} -> ${v}`);
      last = v;
    }
    ok(last > 0.5, `after 25 turns only ${Math.round(last * 100)}% of the continent had signed`);
  });

  it('the player is never rolled for — recognising is their decision', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    Game.setPlayer('48'); // Texas, an uninvolved bystander
    for (let i = 0; i < 30; i++) { World.setTurn(World.getTurn() + 1); Recognition.tick(T(), rng); }
    ok(!Recognition.recognises('48', nid), 'the world recognised on the player’s behalf');
    Game.setPlayer(null);
  });

  it('and both halves of the decision are remembered', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const other = [...Game.nations.keys()].find((x) => x !== nid && x !== '06');
    const parentBefore = Relations.score('06', other, T());
    Recognition.grant(other, nid, { tune: T() });
    ok(Relations.score(nid, other, T()) > 0, 'the new state is not grateful');
    ok(Relations.score('06', other, T()) < parentBefore,
      'the state that lost the ground did not mind who spoke for it');
  });
});

describe('Recognition — what it costs', () => {
  it('no bilateral deal without two governments', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    ok(!Recognition.canTrade(nid, '06'), 'the parent will deal with a rebellion');
    Recognition.grant('06', nid, { tune: T() });
    ok(Recognition.canTrade(nid, '06'), 'recognition did not open the table');
  });

  it('a smuggler’s price on the world market, and it shrinks as the world comes round', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const worst = Recognition.marketRate(nid, T());
    close(worst, T().get('recognition.smugglingRate'), 1e-9);
    for (const [other] of Game.nations) {
      if (other === nid) continue;
      Recognition.grant(other, nid, { tune: T() });
      if (Recognition.scalar(nid) >= T().get('recognition.tradeFloor')) break;
    }
    const better = Recognition.marketRate(nid, T());
    ok(better > worst, `the haircut did not shrink: ${worst} -> ${better}`);
    for (const [other] of Game.nations) Recognition.grant(other, nid, { tune: T() });
    equal(Recognition.marketRate(nid, T()), 1, 'a fully recognised state is still being clipped');
    equal(Recognition.marketRate('06', T()), 1, 'a founding state is paying a smuggler');
  });

  it('no seat in a coalition until somebody admits you exist', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    ok(!Recognition.seated(nid, T()), 'a two-turn-old rebellion took a seat');
    for (const [other] of Game.nations) if (other !== nid) Recognition.grant(other, nid, { tune: T() });
    ok(Recognition.seated(nid, T()), 'a recognised state was kept out');
  });

  it('and Influence carries it as a DEFICIT, so nobody established moved', async () => {
    /*
     * The mistake the leadership term made once: a term worth 1.0 to everybody
     * who is recognised would raise every founding nation's Influence by a
     * constant and quietly re-tune the coalition trigger for the whole board.
     */
    await bootWorld({ seed: SEED });
    const facts = Power.nationFacts('06', T());
    const a = Power.gatherInfluence(facts, World.getTurn(), T());
    const term = Power.influence(a, T()).inputs.find((i) => i.label === 'Recognition');
    ok(term, 'the Recognition term is not in the record');
    equal(term.contribution, 0, 'a fully recognised nation is paying for its recognition');
    ok(term.signed, 'the term is not signed, so it cannot cost anything');
  });

  it('...and a pariah pays the whole weight of it', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const facts = Power.nationFacts(nid, T());
    const a = Power.gatherInfluence(facts, World.getTurn(), T());
    const term = Power.influence(a, T()).inputs.find((i) => i.label === 'Recognition');
    close(term.contribution, -T().get('power.influence.wRecognition'), 1e-9);
  });
});

describe('Recognition — the move', () => {
  it('is refused when there is nothing to recognise', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    ok(!Moves.plan({ type: 'recognise', nid: '06', target: '06' }, T()).ok);
    ok(!Moves.plan({ type: 'recognise', nid: '06', target: 'nobody' }, T()).ok);
    ok(!Moves.plan({ type: 'recognise', nid: '06', target: '32' }, T()).ok,
      'a founding state can be recognised, which means nothing');
    breakOff('06', 6, rng);
  });

  it('prices what it will cost with the state they broke away from', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const other = [...Game.nations.keys()].find((x) => x !== nid && x !== '06');
    const p = Moves.plan({ type: 'recognise', nid: other, target: nid }, T());
    ok(p.ok, p.reason);
    equal(p.cost, 0, 'recognition costs money');
    equal(p.parent, '06');
    ok(p.effects.some((e) => e.value < 0), 'the plan does not show a price at all');
    // ...and the parent's own recognition unlocks rather than betrays.
    const own = Moves.plan({ type: 'recognise', nid: '06', target: nid }, T());
    ok(own.unlocks, 'the parent recognising its own breakaway is not marked as the pivot');
    equal(own.parent, null, 'the parent is being charged for angering itself');
  });

  it('and resolving it writes one entry and moves the scalar', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const before = Ledger.all().length;
    const res = Moves.resolve({ type: 'recognise', nid: '06', target: nid }, rng, T());
    ok(res.ok, res.reason);
    ok(res.after > res.before, 'legitimacy did not move');
    equal(Ledger.all().length, before + 1, 'a recognition wrote more than one entry');
    equal(Ledger.latest(1)[0].kind, 'recognise');
  });

  it('it is deliberately not on the AI’s candidate list', async () => {
    /*
     * An AI's recognitions are `Recognition.tick`, not a move competing for the
     * one action it gets each turn — a nation that spent its whole turn signing
     * a paper about a three-Area rump would be a worse opponent.
     */
    const { rng } = await bootWorld({ seed: SEED });
    breakOff('06', 6, rng);
    for (const [nid] of Game.nations) {
      ok(!Moves.legal(nid, {}, T()).some((m) => m.type === 'recognise'),
        `${nid} was offered a recognition as a move`);
    }
  });
});

describe('Recognition — the save', () => {
  it('survives a round trip, both the matrix and who broke from whom', async () => {
    const ctx = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, ctx.rng);
    const other = [...Game.nations.keys()].find((x) => x !== nid && x !== '06');
    Recognition.grant(other, nid, { tune: T() });
    const before = Recognition.scalar(nid);
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    StateDoc.applyModel(doc);
    close(Recognition.scalar(nid), before, 1e-9);
    equal(Recognition.parentOf(nid), '06', 'the save forgot who they broke away from');
    ok(Recognition.recognises(other, nid) && !Recognition.recognises('06', nid),
      'the matrix came back wrong');
  });

  it('and drops rows for nations that no longer exist', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = breakOff('06', 6, rng);
    const other = [...Game.nations.keys()].find((x) => x !== nid && x !== '06');
    Recognition.grant(other, nid, { tune: T() });
    ok(Recognition.count() > 0);
    // `moveCounties` prunes a nation whose last Area leaves, so this kills it.
    Game.batch(() => Game.moveCounties([...Game.getNation(nid).counties], '06', { silent: true }));
    ok(!Game.getNation(nid), 'the nation survived losing every Area');
    Recognition.tick(T(), rng);
    equal(Recognition.count(), 0, 'the matrix still holds a dead nation');
  });

  it('reading it changes nothing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    breakOff('06', 6, rng);
    const before = fingerprint();
    for (const [nid] of Game.nations) {
      Recognition.scalar(nid);
      Recognition.legitimacy(nid, T());
      Recognition.marketRate(nid, T());
    }
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `reading recognition changed ${k}`);
  });
});

describe('Recognition — a played game', () => {
  it('a breakaway is a pariah, then it is not', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    Game.setPlayer(TurnSystem.currentId());
    let born = null;
    for (let i = 0; i < 22 && !born; i++) {
      TurnSystem.advance(T(), rng);
      AI.sweep(T(), rng);
      for (const [nid, n] of Game.nations) {
        // A nation whose parent is on record: born through one of the four ways
        // the game makes one, rather than adopted by a legacy save.
        if (!n.origin && Recognition.parentOf(nid)) { born = nid; break; }
      }
    }
    if (!born) return; // a quiet seed: nothing broke off, and that is not a failure here
    const opening = Recognition.scalar(born);
    ok(opening < 1, 'a state was recognised by the whole world the turn it appeared');
    for (let i = 0; i < 12; i++) { TurnSystem.advance(T(), rng); AI.sweep(T(), rng); }
    if (Game.getNation(born)) {
      ok(Recognition.scalar(born) > opening,
        `twelve turns of existing bought nothing: still ${Recognition.scalar(born)}`);
    }
    // And nothing anywhere can hand out a recognition that is not in the matrix:
    // every nation's legitimacy is a number between nought and one.
    for (const [nid] of Game.nations) {
      const v = Recognition.scalar(nid);
      ok(v >= 0 && v <= 1, `${nid} has a legitimacy of ${v}`);
    }
    Game.setPlayer(null);
  });
});
