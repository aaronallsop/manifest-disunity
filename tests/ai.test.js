/*
 * M6.3 — the other fifty nations get an opinion.
 *
 * The AI has NO SECOND MODEL OF THE WORLD. It scores exactly the object the
 * player's panel renders, so a move that looks good to it looks good for reasons
 * the player can read on their own screen, and neither side can be right about
 * an action while the other is wrong. Most of what is pinned below is that
 * property and its consequences, rather than any particular weight — the weights
 * are a tuning pass and will move.
 *
 * The rest is what the AI FOUND. Fifty nations playing every turn is a fuzzer
 * pointed at rules that only a human had ever exercised, and it went straight
 * for the two actions that cost nothing:
 *
 *   - a union had no cooldown and no price, which makes any probability under
 *     100% equal to 100% given enough turns. 35 of 53 nations opened by
 *     proposing one, and 51 nations became 18 by turn 20.
 *   - a release had no price either, which makes territory freely convertible
 *     into stability. Measured over sixty turns: with the AI never releasing,
 *     51 nations become 54; at a relief weight of 0.3, 76; at 0.9, 135.
 *
 * Both are tested here as rules, not as balance, because "this action is free"
 * is a hole rather than a number.
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('The score is a Why record', () => {
  it('every candidate explains itself in the shape the ledger already reads', async () => {
    await bootWorld({ seed: SEED });
    const ranked = AI.deliberate('06', T());
    ok(ranked.length > 3, `California had ${ranked.length} candidate moves`);
    for (const r of ranked) {
      ok(Number.isFinite(r.value), `${r.intent.type} scored ${r.value}`);
      ok(Array.isArray(r.inputs) && r.inputs.length, `${r.intent.type} scored with no terms`);
      ok(typeof r.summary === 'string' && r.summary.length > 4);
      for (const i of r.inputs) {
        ok(i.label && i.key, 'a term with no label or tunable key');
        ok(Number.isFinite(i.weight) && Number.isFinite(i.contribution));
        ok(i.norm >= -1 && i.norm <= 1, `${i.label} normalised to ${i.norm}`);
        ok(i.stance === 'expand' || i.stance === 'hold', `${i.label} has stance "${i.stance}"`);
      }
    }
  });

  it('the value IS the sum of its terms — the summary cannot drift from the number', async () => {
    await bootWorld({ seed: SEED });
    for (const r of AI.deliberate('48', T())) {
      let sum = 0;
      for (const i of r.inputs) sum += i.contribution;
      close(r.value, sum, 1e-9, `${r.intent.type}: the score is not the sum of what it reported`);
    }
  });

  it('sorts best first', async () => {
    await bootWorld({ seed: SEED });
    const ranked = AI.deliberate('12', T());
    for (let i = 1; i < ranked.length; i++) {
      ok(ranked[i - 1].value >= ranked[i].value, 'the candidate list is not sorted');
    }
  });

  it('deliberating changes nothing', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    for (const [nid] of Game.nations) AI.deliberate(nid, T());
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `thinking changed ${k}`);
  });
});

describe('What the weights actually mean', () => {
  it('a prize is worth its odds: a union\'s gain scales with the chance it holds', async () => {
    /*
     * A union hands over a whole nation, but only `chance` of the time. Without
     * the discount a 6%-likely union with California outscores a certain
     * annexation of three Areas — and with a separate term for the odds on top,
     * a coin-flip over a tiny neighbour scores exactly as highly as a coin-flip
     * over a giant one. The ratio is the decision, and it lives in the discount.
     */
    await bootWorld({ seed: SEED });
    const target = Game.adjacentNations('06')[0];
    const intent = { type: 'unite', nid: '06', target };
    const preview = Moves.plan(intent, T());
    if (!preview.ok) return;
    const s = AI.score(intent, preview, T());
    const people = s.inputs.find((i) => i.label === 'People');
    ok(people, 'a union was scored with no term for the people it would gain');
    const undiscounted = AI.score(intent, { ...preview, chance: 1 }, T())
      .inputs.find((i) => i.label === 'People');
    ok(Math.abs(people.norm) < Math.abs(undiscounted.norm),
      'the prize was not discounted by the odds');
    close(people.norm / undiscounted.norm, preview.chance, 1e-6);
  });

  it('posture is read off the STANCE, not off the sign', async () => {
    /*
     * Shedding a seditious Area is a positive term that a fraying nation should
     * want MORE of, not less. Reading posture off the sign gets the release
     * valve exactly backwards, and it is invisible until you watch a nation
     * under pressure decide to invade someone.
     */
    await bootWorld({ seed: SEED });
    const intent = { type: 'annex', nid: '06', areas: [...Game.annexTargets('06')].slice(0, 2) };
    const preview = Moves.plan(intent, T());
    const calm = AI.score(intent, preview, T(), { strain: 0 });
    const fraying = AI.score(intent, preview, T(), { strain: 1 });
    const gain = (s) => s.inputs.find((i) => i.stance === 'expand');
    const risk = (s) => s.inputs.find((i) => i.stance === 'hold' && i.norm < 0);
    ok(Math.abs(gain(fraying).contribution) < Math.abs(gain(calm).contribution),
      'a nation about to fall apart valued expansion just as highly');
    if (risk(calm)) {
      ok(Math.abs(risk(fraying).contribution) > Math.abs(risk(calm).contribution),
        'a nation about to fall apart was no more afraid of the downside');
    }
  });

  it('a secure nation buys no stability, because it needs none', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 12; i++) World.advanceTurn(T(), rng);
    let seen = 0;
    for (const [nid] of Game.nations) {
      const intent = Moves.legal(nid, {}, T()).find((i) => i.type === 'release');
      if (!intent) continue;
      const preview = Moves.plan(intent, T());
      if (!preview.ok) continue;
      const relief = (st) => {
        const s = AI.score(intent, preview, T(), { strain: st });
        const t = s.inputs.find((i) => i.label === 'Sedition shed');
        return t ? t.contribution : 0;
      };
      equal(relief(0), 0, 'a nation in no danger still valued shedding ground');
      ok(relief(1) >= relief(0), 'strain did not raise the value of shedding ground');
      if (++seen >= 5) break;
    }
    ok(seen > 0, 'no nation had a release candidate at all');
  });
});

describe('Choosing', () => {
  it('at zero temperature it takes the best move it found', async () => {
    await bootWorld({ seed: SEED });
    const tune = T();
    const prev = tune.peek('ai.temperature');
    tune.load({ 'ai.temperature': 0 });
    try {
      for (const nid of ['06', '48', '36']) {
        const ranked = AI.deliberate(nid, tune)
          .filter((r) => r.value >= tune.get('ai.actThreshold'));
        const chose = AI.chooseMove(nid, tune, RNG.create(1));
        if (!ranked.length) { equal(chose, null); continue; }
        deepEqual(chose, ranked[0].intent, `${nid} did not take its own best move`);
      }
    } finally { tune.load({ 'ai.temperature': prev }); }
  });

  it('never chooses a move that scores below the bar', async () => {
    /*
     * Passing is a legitimate answer, not a failure to find one. A nation that
     * acts every turn because something scored 0.001 is both unrealistic and
     * exhausting to play against.
     */
    await bootWorld({ seed: SEED });
    const bar = T().get('ai.actThreshold');
    for (const [nid] of Game.nations) {
      const chose = AI.chooseMove(nid, T(), RNG.create(4));
      if (!chose) continue;
      const found = AI.deliberate(nid, T()).find((r) => r.intent.type === chose.type
        && r.intent.target === chose.target && r.intent.ideology === chose.ideology);
      ok(found && found.value >= bar,
        `${nid} chose a ${chose.type} scoring ${found ? found.value.toFixed(3) : '?'} under a bar of ${bar}`);
    }
  });

  it('an impossible bar means everybody passes', async () => {
    await bootWorld({ seed: SEED });
    const tune = T(), prev = tune.peek('ai.actThreshold');
    tune.load({ 'ai.actThreshold': 99 });
    try {
      for (const [nid] of Game.nations) equal(AI.chooseMove(nid, tune, RNG.create(2)), null);
    } finally { tune.load({ 'ai.actThreshold': prev }); }
  });

  it('is reproducible from the seed', async () => {
    const run = async () => {
      const { rng } = await bootWorld({ seed: SEED });
      for (let i = 0; i < 6; i++) AI.round(T(), rng);
      return fingerprint();
    };
    deepEqual(await run(), await run(), 'two identical games diverged');
  });
});

describe('A round is a round', () => {
  it('plays every seat and moves the world exactly one turn', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 5; i++) {
      const before = World.getTurn();
      const seats = TurnSystem.snapshot().order.length;
      const out = AI.round(T(), rng);
      equal(World.getTurn() - before, 1, 'a round did not advance the world exactly once');
      equal(out.rounds, 1);
      /*
       * Measured against the order the round ENDS with: an action that splinters
       * a nation inserts the newborns behind their parent, so a round can
       * legitimately play more seats than existed when it started.
       */
      const ended = TurnSystem.snapshot().order.length;
      ok(out.turns <= Math.max(seats, ended) + 1,
        `${out.turns} turns for an order of ${seats} that ended at ${ended}`);
    }
  });

  it('and the world it produces is not the world nobody plays', async () => {
    /*
     * The simulator stepped `World.advanceTurn` directly until M6.3, so every
     * verdict card in dev.html described a map on which nothing deliberate ever
     * happened. That was true of the game at the time and stopped being true the
     * moment the AI arrived.
     */
    const a = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) AI.round(T(), a.rng);
    const withAi = fingerprint();
    const b = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), b.rng);
    const without = fingerprint();
    ok(withAi.ownerHash !== without.ownerHash,
      'twenty rounds of fifty nations acting left the map exactly as it was');
  });
});

describe('What the AI writes down', () => {
  it('an AI action reaches the ledger, which is how the newspaper sees it', async () => {
    /*
     * The ledger writes lived in `actions.js` — that is, in the UI — until M6.3.
     * Fifty-one nations acted and one of them was logged, so the only entry
     * written from inside the model was the obituary `pruneEmpty` writes when a
     * nation dies. A world whose only news is death is a hole, not a tuning
     * problem.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) AI.round(T(), rng);
    const kinds = new Set();
    for (const e of Ledger.all()) kinds.add(e.kind);
    ok(kinds.has('annex') || kinds.has('war'),
      `25 rounds of an active AI logged nothing but ${[...kinds].join(', ')}`);
    for (const e of Ledger.all()) {
      ok(e.text && e.text.length > 8, `a ledger entry with no readable text: ${JSON.stringify(e).slice(0, 90)}`);
      ok(Ledger.KINDS.includes(e.kind), `unknown ledger kind "${e.kind}"`);
    }
  });
});

describe('What the AI found in the rules', () => {
  it('a union costs money, and is refused when the money is not there', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06', target = Game.adjacentNations(nid)[0];
    const n = Game.getNation(nid);
    n.treasury = 0;
    const broke = Moves.plan({ type: 'unite', nid, target }, T());
    equal(broke.ok, false, 'a bankrupt nation was allowed to buy out its neighbour');
    ok(broke.cost > 0, 'a union quoted no price at all');
    ok(/settlement/i.test(broke.reason), `the refusal reads: "${broke.reason}"`);
    n.treasury = broke.cost * 2;
    const rich = Moves.plan({ type: 'unite', nid, target }, T());
    ok(rich.ok, rich.reason);
    close(rich.cost, broke.cost, 1e-6);
  });

  it('and it has a cooldown, which is what stops re-rolling the same odds', async () => {
    /*
     * Unite was the ONE action with no clock on it — annex, release and changing
     * course all had one. A free re-roll every turn makes any probability under
     * 100% equal to 100% given enough turns, which is not a balance problem so
     * much as the absence of a rule.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const target = Game.adjacentNations(nid)[0];
    Game.getNation(nid).treasury = 1e15;
    equal(Moves.uniteCooldownLeft(nid, T()), 0);
    Moves.resolve({ type: 'unite', nid, target }, RNG.create(3), T());
    const survivor = Game.getNation(nid);
    if (!survivor) return; // absorbed into someone else is a different test
    ok(Moves.uniteCooldownLeft(nid, T()) > 0, 'a union attempt started no cooldown');
    const other = Game.adjacentNations(nid).find((x) => x !== target);
    if (!other) return;
    const again = Moves.plan({ type: 'unite', nid, target: other }, T());
    equal(again.ok, false, 'a nation proposed two unions in the same turn');
  });

  it('a handover costs money too', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const areas = [...Game.getNation(nid).counties].slice(0, 2);
    Game.getNation(nid).treasury = 0;
    const broke = Moves.plan({ type: 'release', nid, areas }, T());
    equal(broke.ok, false, 'releasing ground was free');
    ok(broke.cost > 0);
    Game.getNation(nid).treasury = broke.cost * 2;
    ok(Moves.plan({ type: 'release', nid, areas }, T()).ok);
  });

  it('a movement declares on the core it is asked for, and the ask is a tunable now', async () => {
    /*
     * `coreHeld === coreTotal` survived four milestones because nothing could
     * disturb a core: the world engine pushed sentiment up and only up. The AI
     * defeated it outright — one annexed core Area holds a movement latent
     * forever, and forty turns produced zero declarations where the same seed
     * without an AI produced two.
     *
     * IT SHIPS AT 1.0, the original rule, because loosening it was the wrong
     * lever: cores are SEEDED over the threshold at setup, so at 0.7 the
     * Cascadian Separatists declared on turn zero with 163 Areas. The drought
     * was fixed where it was caused — unite and release were free, so the AI
     * churned every border — and declarations came back at turns 39-44 across
     * three seeds. The knob stays because the fragility is real.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), rng);
    const line = T().get('secession.countyThreshold');
    const share = T().get('secession.coreShare');
    ok(share > 0 && share <= 1, `the core share is ${share}`);
    for (const rec of Movements.all()) {
      if (rec.state !== 'declared' || !rec.core.length) continue;
      let held = 0;
      for (const f of rec.core) {
        const c = Game.county[f];
        if (!c) continue;
        let pop = 0;
        for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
        if (pop > 0 && (c.mov[rec.name] || 0) / pop >= line) held++;
      }
      ok(held >= Math.ceil(rec.core.length * share) || rec.nation,
        `${rec.name} declared holding ${held}/${rec.core.length} of its core`);
    }
  });

  it('the rules read the tune they are given, not the one on the window', async () => {
    /*
     * `Moves` read `window.TUNE` directly, which was invisible while the only
     * caller was a page with exactly one. Then the simulator started driving the
     * AI — `Sim.run` layers overrides onto a CLONE so exploring never touches
     * the session — and every slider under Annexation, Unite and Release
     * silently did nothing. A dashboard whose sliders move nothing is worse than
     * no dashboard.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const areas = [...Game.annexTargets(nid)].slice(0, 2);
    const base = Moves.plan({ type: 'annex', nid, areas }, T());
    const other = TuneMeta.createTune();
    other.load({ 'annex.costPerArea': T().peek('annex.costPerArea') * 10 });
    const dearer = Moves.plan({ type: 'annex', nid, areas }, other);
    ok(dearer.cost > base.cost * 5,
      `the passed tune was ignored: ${Math.round(base.cost)} vs ${Math.round(dearer.cost)}`);
    // ...and the session's tune is untouched by having been shadowed.
    close(Moves.plan({ type: 'annex', nid, areas }, T()).cost, base.cost, 1e-6);
  });
});
