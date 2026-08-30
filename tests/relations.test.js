/*
 * M7.1 — what nations remember about each other.
 *
 * One append-only list, and everything else is a query over it:
 *
 *   { turn, from, to, kind, magnitude }
 *   relation(a, b) = base + Σ magnitude · decay^(now - turn)
 *
 * Before this there was no inter-nation state of any kind and the save format
 * had nowhere to put one. What is pinned below is the shape rather than the
 * weights — the weights are a tuning pass — plus the three properties that would
 * be quietly wrong if nobody checked:
 *
 *   DIRECTED. `between(a, b)` is how A feels about B, and the two directions are
 *   genuinely different. Making it symmetric would be one line less code and
 *   would delete the rivalry.
 *
 *   DECAYING. Which is what makes "recently" mean something without anybody
 *   storing a window, and what keeps the list small enough to save.
 *
 *   WITNESSED. The term easiest to leave out and the one the coalitions in M7.2
 *   rest on: a conqueror resented only by its victims is resented only by the
 *   nations least able to do anything about it.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('The list', () => {
  it('a fresh world remembers nothing', async () => {
    await bootWorld({ seed: SEED });
    equal(Relations.count(), 0);
    for (const [a] of Game.nations) {
      for (const b of Game.adjacentNations(a)) {
        equal(Relations.score(a, b, T()), T().get('rel.base'),
          `${a} already had an opinion about ${b}`);
      }
    }
  });

  it('refuses what it cannot represent', async () => {
    await bootWorld({ seed: SEED });
    equal(Relations.record(null, '06', 'annexed'), null);
    equal(Relations.record('06', null, 'annexed'), null);
    equal(Relations.record('06', '06', 'annexed'), null, 'a nation resented itself');
    equal(Relations.record('06', '48', 'sulked'), null, 'an unknown kind was recorded');
    equal(Relations.record('06', '48', 'annexed', { scale: 0 }), null);
    equal(Relations.count(), 0);
  });

  it('is directed: the two ways round are different numbers', async () => {
    await bootWorld({ seed: SEED });
    Relations.record('06', '48', 'annexed', { scale: 3, tune: T() });
    ok(Relations.score('06', '48', T()) < -0.1, 'the victim does not resent the aggressor');
    equal(Relations.score('48', '06', T()), T().get('rel.base'),
      'resentment leaked backwards along the pair');
  });

  it('scales with the size of what happened, up to a limit', async () => {
    await bootWorld({ seed: SEED });
    Relations.record('06', '48', 'annexed', { scale: 1, tune: T() });
    const one = Relations.score('06', '48', T());
    Relations.reset();
    Relations.record('06', '48', 'annexed', { scale: 3, tune: T() });
    const three = Relations.score('06', '48', T());
    ok(Math.abs(three) > Math.abs(one), 'three Areas were resented no more than one');
    Relations.reset();
    Relations.record('06', '48', 'annexed', { scale: 999, tune: T() });
    const huge = Relations.score('06', '48', T());
    close(huge, T().get('rel.magAnnexed') * T().get('rel.maxScale'), 1e-9,
      'a big enough event was unforgivable without limit');
  });

  it('decays, so "recently" means something', async () => {
    await bootWorld({ seed: SEED });
    Relations.record('06', '48', 'annexed', { scale: 2, tune: T(), turn: 0 });
    const fresh = Relations.score('06', '48', T());
    World.setTurn(10);
    const older = Relations.score('06', '48', T());
    World.setTurn(40);
    const ancient = Relations.score('06', '48', T());
    ok(Math.abs(older) < Math.abs(fresh), 'ten turns changed nothing');
    ok(Math.abs(ancient) < Math.abs(older), 'thirty more turns changed nothing');
    close(older, fresh * Math.pow(T().get('rel.decay'), 10), 1e-9);
  });

  it('and the working says which event and how long ago', async () => {
    await bootWorld({ seed: SEED });
    Relations.record('06', '48', 'annexed', { scale: 2, tune: T(), turn: 0 });
    Relations.record('06', '48', 'traded', { tune: T(), turn: 0 });
    World.setTurn(4);
    const r = Relations.between('06', '48', T());
    equal(r.inputs.length, 2);
    for (const i of r.inputs) {
      ok(i.label && i.key, 'a memory with no label or tunable behind it');
      equal(i.age, 4);
      ok(Number.isFinite(i.contribution));
    }
    // Sorted by how much it still weighs, so the summary names the real reason.
    ok(Math.abs(r.inputs[0].contribution) >= Math.abs(r.inputs[1].contribution));
    ok(/4 turns ago/.test(r.summary), `the summary reads "${r.summary}"`);
    close(r.value, r.inputs.reduce((a, i) => a + i.contribution, T().get('rel.base')), 1e-9,
      'the value is not the sum of what it reported');
  });

  it('drops what nobody can feel any more', async () => {
    await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) Relations.record('06', '48', 'traded', { tune: T(), turn: 0 });
    equal(Relations.count(), 20);
    World.setTurn(400);
    const dropped = Relations.forget(T());
    equal(dropped, 20, 'four hundred turns later the list still carried every deal');
    equal(Relations.count(), 0);
  });

  it('...and everything about a nation that no longer exists', async () => {
    await bootWorld({ seed: SEED });
    Relations.record('06', '44', 'annexed', { scale: 2, tune: T() });
    Relations.record('44', '06', 'annexed', { scale: 2, tune: T() });
    equal(Relations.count(), 2);
    Game.mergeInto('06', '44');
    Relations.forget(T());
    equal(Relations.count(), 0, 'the list still remembers a nation nobody can name');
  });

  it('survives a save and a load', async () => {
    const ctx = await bootWorld({ seed: SEED });
    Relations.record('06', '48', 'warred', { scale: 2, tune: T() });
    Relations.record('48', '06', 'traded', { tune: T() });
    const a = Relations.score('06', '48', T());
    const b = Relations.score('48', '06', T());
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    Relations.reset();
    equal(Relations.count(), 0);
    StateDoc.applyModel(doc);
    equal(Relations.count(), 2, 'the memories did not come back');
    close(Relations.score('06', '48', T()), a, 1e-9);
    close(Relations.score('48', '06', T()), b, 1e-9);
  });
});

describe('What gets remembered', () => {
  it('an annexation is resented by the victim AND noticed by the neighbours', async () => {
    /*
     * The witness term is the one easiest to leave out and the one M7.2's
     * coalitions rest on. A conqueror resented only by its victims is resented
     * only by the nations least able to do anything about it.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).treasury = 1e15;
    const areas = [...Game.annexTargets(nid)].slice(0, 3);
    const victims = new Set(areas.map((f) => Game.getOwner(f)));
    const neighbours = Game.adjacentNations(nid);
    Moves.resolve({ type: 'annex', nid, areas }, RNG.create(3), T());
    for (const v of victims) {
      if (!Game.getNation(v)) continue;
      ok(Relations.score(v, nid, T()) < -0.05, `${v} does not resent losing ground`);
    }
    let watched = 0;
    for (const o of neighbours) {
      if (victims.has(o) || !Game.getNation(o)) continue;
      if (Relations.score(o, nid, T()) < 0) watched++;
    }
    ok(watched > 0, 'nobody who merely watched thought any less of the aggressor');
  });

  it('handing ground over is remembered too, and the other way', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const areas = [...Game.getNation(nid).counties].slice(0, 3);
    Game.getNation(nid).treasury = 1e15;
    const r = Moves.resolve({ type: 'release', nid, areas }, RNG.create(1), T());
    ok(r.ok, r.reason);
    if (!r.toNeighbours) return;   // everything became a new nation; nothing to thank
    let grateful = 0;
    for (const [other] of Game.nations) {
      if (other === nid) continue;
      if (Relations.score(other, nid, T()) > 0.05) grateful++;
    }
    ok(grateful > 0, 'a neighbour took the ground and thought nothing of it');
  });

  it('a breakaway resents the state it left', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    let d = null;
    for (let i = 0; i < 60 && !d; i++) {
      World.advanceTurn(T(), rng);
      d = Ledger.ofKind('declare')[0] || null;
    }
    if (!d) return;
    if (!Game.getNation(d.parent) || !Game.getNation(d.nation)) return;
    ok(Relations.score(d.nation, d.parent, T()) < 0,
      'a nation that fought its way out feels nothing about the state it left');
  });

  it('reading it changes nothing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
    const before = fingerprint();
    for (const [a] of Game.nations) { Relations.toward(a, T()); for (const b of Game.adjacentNations(a)) Relations.between(a, b, T()); }
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `reading relations changed ${k}`);
  });
});

describe('What it changes', () => {
  it('a nation that likes you is likelier to accept union', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const target = Game.adjacentNations(nid)[0];
    Game.getNation(nid).treasury = 1e15;
    const cold = Moves.plan({ type: 'unite', nid, target }, T()).chance;
    for (let i = 0; i < 6; i++) Relations.record(target, nid, 'granted', { scale: 3, tune: T() });
    const warm = Moves.plan({ type: 'unite', nid, target }, T());
    ok(warm.chance > cold, `standing did not move the odds (${cold} -> ${warm.chance})`);
    ok(warm.standing > 0, 'the preview does not report the standing it used');
    ok(warm.effects.some((e) => e.label === 'How they see you'),
      'the human cannot see the number the AI is using');
    // ...and the reverse.
    Relations.reset();
    for (let i = 0; i < 6; i++) Relations.record(target, nid, 'warred', { scale: 3, tune: T() });
    ok(Moves.plan({ type: 'unite', nid, target }, T()).chance < cold,
      'being hated did not lower the odds');
  });

  it('a neighbour who thinks well of you will take ground you release', async () => {
    /*
     * Replaces "there is a trade deal on the books", which was a proxy for
     * exactly this and could not tell a long partnership from one transaction
     * ten turns ago.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const other = Game.adjacentNations(nid)[0];
    const accept = Moves.acceptsRelease(nid, T());
    const comp = [...Game.getNation(nid).counties].slice(0, 2);
    const before = accept(other, comp);
    for (let i = 0; i < 8; i++) Relations.record(other, nid, 'granted', { scale: 3, tune: T() });
    ok(Relations.score(other, nid, T()) >= T().get('rel.acceptFriend'));
    equal(Moves.acceptsRelease(nid, T())(other, comp), true,
      'a neighbour that thinks well of you still refused the ground');
    ok(before === false || before === true);   // either is fine; the point is the change
  });

  it('the AI can see how it is regarded', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const target = Game.adjacentNations(nid)[0];
    for (let i = 0; i < 4; i++) Relations.record(target, nid, 'warred', { scale: 3, tune: T() });
    let found = null;
    for (const r of AI.deliberate(nid, T())) {
      const t = r.inputs.find((i) => i.label === 'How they see you');
      if (t && (r.intent.target === target
        || (r.intent.areas || []).some((f) => Game.getOwner(f) === target))) { found = t; break; }
    }
    ok(found, 'no candidate against a nation that hates it carried a standing term');
    ok(found.norm < 0, 'being hated scored as neutral or good');
  });
});
