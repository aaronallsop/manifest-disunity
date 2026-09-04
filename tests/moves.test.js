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

  /*
   * PREVIEW AND RESOLUTION COME FROM ONE EXPRESSION (M9.3).
   *
   * `planAnnex` showed a Force number built from the reach penalty and the army
   * ratio; `resolveAnnex` built its own from the coalition shell and the army
   * ratio. Neither had what the other had, so a war at the edge of reach was
   * priced higher, previewed as harder, and then fought exactly as well as one
   * next door — while a nation the world had ganged up on was previewed a
   * fight it was not going to get. The plan/resolve split exists precisely to
   * make that impossible, and it had happened anyway, because the two sides
   * were two expressions rather than one.
   *
   * The check is structural rather than numeric: the resolver must consume the
   * plan's number, and the number must contain all three factors. A test that
   * pinned a value would pass again the moment somebody rebuilt the expression
   * with a different set of terms.
   */
  it('the annex preview and the civil-war roll use the same multiplier', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const areas = [...Game.annexTargets(nid)].slice(0, 2);
    Game.getNation(nid).treasury = 1e15;
    const p = Moves.plan({ type: 'annex', nid, areas }, T());
    ok(p.ok, p.reason);

    // The plan reports it, and the effects vector the AI scores shows the same.
    ok(Number.isFinite(p.scoreMult), 'the plan does not report the multiplier it will resolve with');
    close(p.forceMult, p.scoreMult, 1e-12, 'Force and scoreMult have drifted apart again');

    // ...and it is the product of all three factors, not a subset.
    const against = [...new Set(areas.map((f) => Game.getOwner(f)).filter((o) => o && o !== nid))];
    const expected = (1 + (p.shell || 0))
      * Military.warMultiplier(nid, against, T())
      * (typeof Projection === 'undefined' ? 1 : Projection.warMultiplier(nid, areas, T()));
    close(p.scoreMult, expected, 1e-12, 'the multiplier is missing one of shell / army / reach');

    // The resolver reports back what it actually rolled with (`res`, the
    // CivilWar result, which carries the scoreMult it was handed).
    const r = Moves.resolve({ type: 'annex', nid, areas }, RNG.create(SEED), T());
    ok(r.ok, r.reason);
    close(r.res.scoreMult, p.scoreMult, 1e-12,
      'the roll used a different multiplier than the panel showed');
  });

  /*
   * ...and the reach term is really in there: an Area at the edge of what a
   * nation can project must resolve with a HARSHER multiplier than one next to
   * its capital. `Projection.warMultiplier` is >= 1 and rises with distance, and
   * a high civil-war score is bad for the attacker.
   */
  it('reach makes the roll worse, not only the price', async () => {
    await bootWorld({ seed: SEED });
    if (typeof Projection === 'undefined') return;   // reach is optional at load
    const nid = '06';
    const targets = [...Game.annexTargets(nid)]
      .filter((f) => Projection.inRange(nid, f, T()));
    if (targets.length < 2) return;
    const byReach = targets
      .map((f) => [f, Projection.warMultiplier(nid, [f], T())])
      .sort((a, b) => a[1] - b[1]);
    const near = byReach[0], far = byReach[byReach.length - 1];
    if (!(far[1] > near[1] + 1e-9)) return;          // this board has no gradient to test
    Game.getNation(nid).treasury = 1e15;
    const pNear = Moves.plan({ type: 'annex', nid, areas: [near[0]] }, T());
    const pFar = Moves.plan({ type: 'annex', nid, areas: [far[0]] }, T());
    ok(pNear.ok && pFar.ok, 'one of the two single-Area annexations was refused');
    ok(pFar.reachWar > pNear.reachWar, 'the two Areas do not differ in reach after all');
    ok(pFar.scoreMult > pNear.scoreMult,
      'reach priced the far Area higher but did not make its war go worse');
  });

  /*
   * ONE RULEBOOK, WHOEVER IS ASKING (M9.3).
   *
   * `annex.strongNeighbourFactor` — you cannot annex from a nation more than
   * 4x your size on both population and GDP — was enforced in
   * `Actions.startAnnex` and nowhere else. That is the human's click path. The
   * AI plans through `Moves.legal` and resolves through `Moves.plan`, and
   * neither knew the rule existed, so fifty nations played by a looser rulebook
   * than the one person the rule was written for.
   *
   * Two claims, because the rule has to hold at both doors: `legal` must not
   * OFFER such a target, and `plan` must REFUSE one handed to it directly —
   * a caller with its own intent (a test, the editor, a future scripted move)
   * goes straight to `plan`.
   */
  it('the 4x untouchable rule binds every caller, not just the click path', async () => {
    await bootWorld({ seed: SEED });
    const factor = T().get('annex.strongNeighbourFactor');

    // Find a real pair: somebody small next to somebody more than 4x their size.
    let small = null, giant = null;
    for (const [nid] of Game.nations) {
      const hit = Game.adjacentNations(nid).find((o) => Moves.tooStrongToAnnex(nid, o, T()));
      if (hit) { small = nid; giant = hit; break; }
    }
    ok(small && giant, 'no nation on this board is 4x any of its neighbours — nothing to test');

    // 1. The candidate list never offers it.
    const offered = Moves.legal(small, {}, T())
      .filter((m) => m.type === 'annex')
      .map((m) => m.against);
    ok(!offered.includes(giant),
      `legal() offered ${small} an annexation of ${giant}, which is over ${factor}x its size`);

    // 2. And plan() refuses it when handed the intent directly.
    const areas = [...Game.annexTargets(small)].filter((f) => Game.getOwner(f) === giant);
    ok(areas.length, 'the two nations do not actually border each other');
    Game.getNation(small).treasury = 1e15;   // so the refusal cannot be about money
    const p = Moves.plan({ type: 'annex', nid: small, areas: areas.slice(0, 1) }, T());
    equal(p.ok, false, 'plan() allowed an annexation the click path refuses');
    ok(/your size/.test(p.reason), `the refusal does not name the rule: "${p.reason}"`);

    // 3. resolve() refuses exactly what plan() refused — the M6.1 contract.
    const r = Moves.resolve({ type: 'annex', nid: small, areas: areas.slice(0, 1) },
      RNG.create(SEED), T());
    equal(r.ok, false, 'resolve() went through with a move plan() refused');
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

  /*
   * WHAT THE PANEL SHOWS IS WHAT THE TREASURY PAYS (M9.4).
   *
   * `charges exactly what the preview quoted` above proves resolve charges
   * plan.cost. What it cannot prove is that the PANEL shows plan.cost, and
   * until M9.4 two of the three action panels did not:
   *
   *   - annex called `Moves.annexCost` directly, which is the BASE price. The
   *     charged price is that times `Projection.costMultiplier`, so at the edge
   *     of reach the panel understated the bill by up to 1.6x.
   *   - unite showed no price at all. It costs `unite.costGdpShare` of the
   *     target's GDP, charged on the ATTEMPT — so a player could take a 30%
   *     chance, lose the roll, and discover the fee afterwards.
   *   - release showed the savings and not the `release.costGdpShare`
   *     settlement, which made a valve priced as relief read as a pure gain.
   *
   * The panels live in js/actions.js and are DOM-bound, so what is pinned here
   * is the contract they now rest on: for all three moves the plan's `cost` is
   * the number the resolver spends. A panel that renders `plan.cost` cannot
   * then lie; a panel that derives its own number can, and did.
   */
  it('every priced move quotes what it charges — annex, unite and release', async () => {
    await bootWorld({ seed: SEED });
    const spend = (nid, intent, seed) => {
      const p = Moves.plan(intent, T());
      ok(p.ok, `${intent.type} was refused: ${p.reason}`);
      ok(p.cost > 0, `${intent.type} quoted a price of ${p.cost}`);
      const before = Game.getNation(nid).treasury;
      const r = Moves.resolve(intent, RNG.create(seed), T());
      ok(r.ok, `${intent.type} resolve refused what plan allowed: ${r.reason}`);
      const paid = before - Game.getNation(nid).treasury;
      close(paid, p.cost, Math.max(1, p.cost * 1e-9),
        `${intent.type}: quoted ${p.cost}, charged ${paid}`);
      return p;
    };

    // ANNEX — and specifically that the quote carries the reach multiplier,
    // which is the half the panel used to drop.
    const nid = '06';
    const areas = [...Game.annexTargets(nid)].slice(0, 2);
    Game.getNation(nid).treasury = 1e15;
    const pa = spend(nid, { type: 'annex', nid, areas }, 7);
    const base = Moves.annexCost(areas, pa.shell, T());
    close(pa.cost, base * pa.reachMult, Math.max(1, pa.cost * 1e-9),
      'the annex quote is not the base price times the reach multiplier');

    // UNITE — charged on the attempt, whatever the roll says.
    await bootWorld({ seed: SEED });
    const un = '39';
    const target = Game.adjacentNations(un)[0];
    Game.getNation(un).treasury = 1e15;
    spend(un, { type: 'unite', nid: un, target }, 11);

    // RELEASE — the settlement, which the panel showed as savings only.
    await bootWorld({ seed: SEED });
    const rl = '48';
    const give = [...Game.getNation(rl).counties].slice(0, 2);
    Game.getNation(rl).treasury = 1e15;
    spend(rl, { type: 'release', nid: rl, areas: give }, 13);
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
     * New Hampshire, not California: three Areas is a rounding error to the
     * largest economy on the board and does not trigger a war at all, so every
     * seed would return "peaceful" and the test would prove nothing about the
     * RNG. A big bite by a small state is the case that actually rolls dice.
     *
     * It was DELAWARE until M9.3, and the change is the milestone working
     * rather than a test being appeased. Delaware's only neighbours are
     * Pennsylvania, Maryland and New Jersey, all of them past
     * `annex.strongNeighbourFactor` — so under the rule the human has always
     * played by, Delaware cannot annex anybody at all. `plan` did not know
     * that rule existed, which is exactly why this test could be written
     * against a move no player could make. New Hampshire is the same shape of
     * case (small state, big bite, triggers on both GDP and population)
     * against a neighbour it is legally allowed to bite.
     */
    const run = async (s) => {
      await bootWorld({ seed: SEED });
      const nid = '33';
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
      // trade, treaty and aid joined the list in M11 — the candidate list is
      // the AI's whole view of what it may do, so a move missing from here is a
      // move fifty nations cannot make.
      ok(['annex', 'unite', 'govern', 'release', 'autonomy', 'trade', 'treaty', 'aid']
        .includes(m.type), `unexpected move type ${m.type}`);
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
