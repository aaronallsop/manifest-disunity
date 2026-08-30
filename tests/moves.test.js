/*
 * M6.1 — every action split into `plan` and `resolve`.
 *
 *   plan(intent)         pure: no RNG, no DOM, no mutation
 *   resolve(intent, rng) mutates, with the RNG explicit
 *
 * ONE PLAN FUNCTION, TWO CALLERS. The UI renders a Preview and then resolves;
 * the AI plans over candidates, scores the previews and resolves the winner.
 * Being the *same* function is what stops the human's preview and the AI's model
 * from disagreeing about what an action does — and a disagreement there is
 * unfalsifiable from inside the game, because each side only ever sees its own
 * answer. So the tests below are mostly about the CONTRACT rather than any
 * individual outcome:
 *
 *   - plan never mutates, however many times it is called
 *   - resolve refuses exactly what plan refused, with the same reason
 *   - the same intent and the same seed give the same result
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('plan is pure', () => {
  it('changes nothing, however many times it is called', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    const nid = '06';
    const targets = [...Game.annexTargets(nid)].slice(0, 3);
    for (let i = 0; i < 5; i++) {
      Moves.plan({ type: 'annex', nid, areas: targets });
      Moves.plan({ type: 'unite', nid, target: '32' });
      Moves.plan({ type: 'release', nid, areas: [...Game.getNation(nid).counties].slice(0, 2) });
      Moves.plan({ type: 'govern', nid, ideology: 'yellow' });
    }
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `plan() changed ${k}`);
  });

  it('is stable: the same question twice gives the same answer', async () => {
    await bootWorld({ seed: SEED });
    const intent = { type: 'annex', nid: '06', areas: [...Game.annexTargets('06')].slice(0, 3) };
    const a = Moves.plan(intent), b = Moves.plan(intent);
    equal(a.ok, b.ok);
    close(a.cost, b.cost, 1e-9);
    deepEqual(a.effects, b.effects);
  });

  it('refuses an unknown move rather than throwing', async () => {
    await bootWorld({ seed: SEED });
    const r = Moves.plan({ type: 'invade', nid: '06' });
    equal(r.ok, false);
    ok(/Unknown move/.test(r.reason));
    equal(Moves.resolve({ type: 'invade', nid: '06' }, RNG.create(1)).ok, false);
  });

  it('every refusal carries a sentence a player could read', async () => {
    await bootWorld({ seed: SEED });
    const refusals = [
      Moves.plan({ type: 'annex', nid: '06', areas: [] }),
      Moves.plan({ type: 'annex', nid: 'nope', areas: [] }),
      Moves.plan({ type: 'unite', nid: '06', target: '06' }),
      Moves.plan({ type: 'unite', nid: '06', target: '09' }),   // not adjacent
      Moves.plan({ type: 'release', nid: '06', areas: [] }),
      Moves.plan({ type: 'govern', nid: '06', ideology: 'whig' }),
    ];
    for (const r of refusals) {
      equal(r.ok, false, `expected a refusal, got ${JSON.stringify(r).slice(0, 80)}`);
      ok(r.reason && r.reason.length > 8 && /[.!?]$/.test(r.reason),
        `the refusal is not a sentence: "${r.reason}"`);
      deepEqual(r.effects, [], 'a refused move still reported effects');
    }
  });
});

describe('resolve honours what plan said', () => {
  it('refuses exactly what plan refused, for the same reason', async () => {
    await bootWorld({ seed: SEED });
    const rng = RNG.create(1);
    const cases = [
      { type: 'annex', nid: '06', areas: [] },
      { type: 'unite', nid: '06', target: '06' },
      { type: 'release', nid: '06', areas: [] },
      { type: 'govern', nid: '06', ideology: 'whig' },
    ];
    for (const intent of cases) {
      const p = Moves.plan(intent);
      const r = Moves.resolve(intent, rng);
      equal(r.ok, p.ok, `plan and resolve disagree about ${intent.type}`);
      equal(r.reason, p.reason, `they disagree about WHY ${intent.type} was refused`);
    }
  });

  it('charges exactly what the preview quoted', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const areas = [...Game.annexTargets(nid)].slice(0, 2);
    const p = Moves.plan({ type: 'annex', nid, areas });
    ok(p.ok, `the annexation was refused: ${p.reason}`);
    const before = Game.getNation(nid).treasury;
    Moves.resolve({ type: 'annex', nid, areas }, RNG.create(1));
    close(before - Game.getNation(nid).treasury, p.cost, 1e-6,
      'the bill did not match the quote');
  });

  it('the same intent and seed give the same result', async () => {
    const run = async () => {
      await bootWorld({ seed: SEED });
      const nid = '06';
      const areas = [...Game.annexTargets(nid)].slice(0, 3);
      const r = Moves.resolve({ type: 'annex', nid, areas }, RNG.create(99));
      return { outcome: r.res ? r.res.outcome : null, taken: r.taken.length, fp: fingerprint().ownerHash };
    };
    deepEqual(await run(), await run(), 'the same move with the same seed diverged');
  });

  it('a different seed can give a different result', async () => {
    /*
     * Delaware, not California: three Areas is a rounding error to the largest
     * economy on the board and does not trigger a war at all, so every seed
     * would return "peaceful" and the test would prove nothing about the RNG.
     * A big bite by a small state is the case that actually rolls dice.
     */
    const run = async (s) => {
      await bootWorld({ seed: SEED });
      const nid = '10';
      const areas = [...Game.annexTargets(nid)].slice(0, 3);
      Game.getNation(nid).treasury = 1e15;
      const r = Moves.resolve({ type: 'annex', nid, areas }, RNG.create(s));
      ok(r.res && r.res.triggered, 'the chosen case does not trigger a civil war');
      return `${r.res.outcome}:${r.res.diceSum}`;
    };
    const seen = new Set();
    for (const s of [1, 2, 3, 4, 5, 6, 7, 8]) seen.add(await run(s));
    ok(seen.size > 1, 'eight different seeds produced identical civil wars');
  });
});

describe('The previews say something worth reading', () => {
  it('an annexation warns about the civil war BEFORE it is committed', async () => {
    /*
     * A player deciding whether to take four Areas needs to know it would flip
     * their governing ideology before they commit, and the AI needs the same
     * number to decide whether it is worth it. `CivilWar.assess` is pure, so
     * both get it from the same call.
     */
    await bootWorld({ seed: SEED });
    const nid = '49';
    const areas = [...Game.annexTargets(nid)].slice(0, 3);
    const p = Moves.plan({ type: 'annex', nid, areas });
    ok(p.war, 'the preview does not assess the civil war');
    ok(typeof p.war.triggered === 'boolean');
    ok(p.effects.some((e) => e.label === 'Civil war'), 'the war is not in the effects vector');
    ok(p.effects.some((e) => e.label === 'Population' && e.value > 0));
  });

  it('a union preview reports the chance AND what would break off', async () => {
    await bootWorld({ seed: SEED });
    const p = Moves.plan({ type: 'unite', nid: '06', target: '32' });
    ok(p.ok, p.reason);
    ok(p.chance > 0 && p.chance <= 1, `the chance is ${p.chance}`);
    ok(p.fallout && Array.isArray(p.fallout.defect) && Array.isArray(p.fallout.secede));
    ok(p.effects.some((e) => e.label === 'Areas that would secede'));
  });

  it('a release preview reports what leaves, as negatives', async () => {
    await bootWorld({ seed: SEED });
    const areas = [...Game.getNation('06').counties].slice(0, 2);
    const p = Moves.plan({ type: 'release', nid: '06', areas });
    ok(p.ok, p.reason);
    for (const e of p.effects) ok(e.value <= 0, `${e.label} is positive on a release`);
  });

  it('a govern preview quotes the mandate and the distance', async () => {
    await bootWorld({ seed: SEED });
    const d = Game.nationDemographics('06');
    const cur = Game.getNation('06').gov.rulingIdeology;
    const best = Ideology.all().map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .filter((o) => o.id !== cur).sort((a, b) => b.share - a.share)[0];
    const p = Moves.plan({ type: 'govern', nid: '06', ideology: best.id });
    close(p.share, best.share, 1e-9);
    ok(p.distance > 0 && p.distance <= 1);
    ok(p.cost > 0);
  });
});

describe('Moves.legal — the AI\'s candidate list', () => {
  it('offers something to do, and only legal things', async () => {
    await bootWorld({ seed: SEED });
    const moves = Moves.legal('06');
    ok(moves.length > 3, `only ${moves.length} legal moves`);
    for (const m of moves) {
      equal(m.nid, '06');
      ok(['annex', 'unite', 'govern', 'release', 'autonomy'].includes(m.type),
        `unexpected move type ${m.type}`);
      if (m.type === 'annex') {
        ok(m.areas.length > 0 && m.areas.length <= T().get('annex.budgetAreas'));
        for (const f of m.areas) ok(!Game.getNation('06').counties.has(f), 'offered to annex its own Area');
      }
      if (m.type === 'unite') ok(m.target !== '06', 'offered to unite with itself');
      if (m.type === 'govern') ok(m.ideology !== Game.getNation('06').gov.rulingIdeology);
      if (m.type === 'release') {
        ok(m.areas.length > 0 && m.areas.length < Game.getNation('06').counties.size,
          'offered to release everything it had');
        for (const f of m.areas) ok(Game.getNation('06').counties.has(f), 'offered to release ground it does not hold');
      }
      if (m.type === 'autonomy') {
        ok(m.areas.length > 0, 'offered to settle nothing');
        for (const f of m.areas) {
          ok(Game.getNation('06').counties.has(f), 'offered to settle ground it does not hold');
          ok(!Game.isAutonomous(f), 'offered to grant self-rule to somewhere that already has it');
        }
      }
    }
  });

  it('is the RULES, not policy — it does not score or filter on affordability', async () => {
    /*
     * Scoring is js/ai.js's job. If `legal` pre-filtered on what looked like a
     * good idea, the AI could never be given a different opinion without
     * changing the rules.
     */
    await bootWorld({ seed: SEED });
    Game.getNation('06').treasury = 0;
    const moves = Moves.legal('06');
    const annexes = moves.filter((m) => m.type === 'annex');
    ok(annexes.length > 0, 'a broke nation was offered no annexations at all');
    // ...and plan is what says no
    ok(annexes.every((m) => !Moves.plan(m).ok), 'a broke nation could afford an annexation');
  });

  it('offers nothing to a nation that does not exist', async () => {
    await bootWorld({ seed: SEED });
    deepEqual(Moves.legal('nope'), []);
  });

  it('respects the annex cooldown', async () => {
    await bootWorld({ seed: SEED });
    Game.getNation('06').lastAnnexTurn = World.getTurn();
    ok(Moves.legal('06').every((m) => m.type !== 'annex'),
      'a nation still regrouping was offered an annexation');
  });

  it('every candidate can be planned without throwing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 8; i++) World.advanceTurn(T(), rng);
    let planned = 0;
    for (const [nid] of Game.nations) {
      for (const m of Moves.legal(nid)) {
        const p = Moves.plan(m);
        ok(typeof p.ok === 'boolean', `plan of ${m.type} returned ${JSON.stringify(p).slice(0, 60)}`);
        planned++;
      }
    }
    ok(planned > 100, `only ${planned} candidate moves across the whole board`);
  });
});

describe('The model still behaves the same way through Moves', () => {
  it('a peaceful annexation moves the ground and records it', async () => {
    await bootWorld({ seed: SEED });
    const nid = '16'; // Idaho
    const areas = [...Game.annexTargets(nid)].slice(0, 1);
    const victim = Game.getOwner(areas[0]);
    const r = Moves.resolve({ type: 'annex', nid, areas }, RNG.create(3));
    ok(r.ok, r.reason);
    equal(Game.getOwner(areas[0]), nid);
    ok(Game.getNation(nid).annexed.length > 0, 'the annexation was not recorded');
    if (Game.getNation(victim)) ok(Game.getNation(victim).lost.length > 0);
  });

  it('a release still needs a willing recipient', async () => {
    await bootWorld({ seed: SEED });
    const nid = '30';
    const areas = [...Game.getNation(nid).counties]
      .sort((a, b) => Game.countyPop(a) - Game.countyPop(b)).slice(0, 2);
    const r = Moves.resolve({ type: 'release', nid, areas }, RNG.create(1));
    ok(r.ok, r.reason);
    equal(r.toNew + r.toNeighbours + r.refused, areas.length,
      'the release lost track of where the Areas went');
  });

  it('governing through Moves is the same as governing through Game', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).treasury = 1e15;
    const d = Game.nationDemographics(nid);
    const cur = Game.getNation(nid).gov.rulingIdeology;
    const pick = Ideology.all().map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .filter((o) => o.id !== cur && o.share >= T().get('gov.changeMinShare'))
      .sort((a, b) => b.share - a.share)[0];
    if (!pick) return;
    const r = Moves.resolve({ type: 'govern', nid, ideology: pick.id }, RNG.create(1));
    ok(r.ok, r.reason);
    equal(Game.getNation(nid).gov.rulingIdeology, pick.id);
    equal(Ledger.ofKind('govern').length, 1, 'the change was not logged exactly once');
  });
});
