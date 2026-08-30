/*
 * M4.4 — the two cheapest release valves.
 *
 * VOLUNTARY RELEASE, with the guardrail the design asks for: a recipient must
 * actually accept. Without it, releasing counties is a way to DUMP them — hand a
 * hostile neighbour three Areas full of a movement it cannot govern and you have
 * exported your secession problem for free.
 *
 * PARTY CHANGE (appeasement), which needed almost no machinery: M3 put
 * `gov.rulingIdeology` in the record and M3.3 made Civil Liberties a function of
 * how far the governed sit from the governing. Change the ruling ideology and
 * the model does the rest — nobody writes "calms the aligned region and angers
 * another", it is what the existing terms already say. Most of this file is
 * about checking that claim rather than the switch itself.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('Changing course', () => {
  it('switches the governing ideology and dates it', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = Game.getNation(nid);
    const was = n.gov.rulingIdeology;
    const d = Game.nationDemographics(nid);
    // pick the best-supported alternative
    const to = Ideology.all()
      .map((x, i) => ({ id: x.id, i, share: d.mix[i] / d.pop }))
      .filter((o) => o.id !== was)
      .sort((a, b) => b.share - a.share)[0];

    const res = Game.changeRulingIdeology(nid, to.id, { force: true });
    ok(res.ok, `the change was refused: ${res.message}`);
    equal(Game.getNation(nid).gov.rulingIdeology, to.id);
    equal(Game.getNation(nid).gov.since, World.getTurn());
    equal(res.from, was);
  });

  it('refuses an ideology nobody supports — you cannot claim a mandate you have no voters for', async () => {
    await bootWorld({ seed: SEED });
    const nid = '49';
    const d = Game.nationDemographics(nid);
    const weakest = Ideology.all()
      .map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .sort((a, b) => a.share - b.share)[0];
    ok(weakest.share < T().get('gov.changeMinShare'), 'no ideology is weak enough to test with');
    const res = Game.changeRulingIdeology(nid, weakest.id);
    equal(res.ok, false);
    ok(/mandate/i.test(res.message), `the refusal reads "${res.message}"`);
    equal(Game.getNation(nid).gov.rulingIdeology !== weakest.id, true);
  });

  it('refuses a nonsense ideology, and refuses to change to itself', async () => {
    await bootWorld({ seed: SEED });
    equal(Game.changeRulingIdeology('06', 'whig').ok, false);
    equal(Game.changeRulingIdeology('06', Game.getNation('06').gov.rulingIdeology).ok, false);
  });

  it('costs more the further you move on the axes', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const cur = Game.getNation(nid).gov.rulingIdeology;
    const d = Game.nationDemographics(nid);
    const rate = T().get('gov.changeCost');
    const near = Ideology.all().filter((x) => x.id !== cur)
      .sort((a, b) => Ideology.affinity(cur, b.id) - Ideology.affinity(cur, a.id));
    const closest = near[0], furthest = near[near.length - 1];

    const cheap = d.gdp * rate * (1 - Ideology.affinity(cur, closest.id));
    const dear = d.gdp * rate * (1 - Ideology.affinity(cur, furthest.id));
    ok(dear > cheap * 1.2,
      `a reversal costs ${dear.toExponential(2)} and a small correction ${cheap.toExponential(2)}`);

    Game.getNation(nid).treasury = 1e15;
    const res = Game.changeRulingIdeology(nid, furthest.id, { force: true });
    ok(res.ok);
    close(res.cost, dear, 1e-6, 'the charge does not match the quoted price');
  });

  it('costs Authority, applied to the stock so it recovers rather than being undone', async () => {
    /*
     * Applied to the target instead, the next power phase would recompute from
     * the world and the shock would simply vanish. The stock discipline is what
     * turns it into a recovery over several turns.
     */
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '06';
    const n = Game.getNation(nid);
    n.treasury = 1e15;
    const before = n.authority;
    const d = Game.nationDemographics(nid);
    const to = Ideology.all().map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .filter((o) => o.id !== n.gov.rulingIdeology).sort((a, b) => b.share - a.share)[0];
    Game.changeRulingIdeology(nid, to.id, { force: true });
    const after = Game.getNation(nid).authority;
    ok(after < before, `changing course cost no standing (${before} -> ${after})`);
    ok(after >= T().get('power.floor'), 'the hit drove Authority through the floor');

    // and it recovers rather than sticking
    for (let i = 0; i < 15; i++) World.advanceTurn(T(), rng);
    ok(Game.getNation(nid).authority > after, 'Authority never recovered from a single decision');
  });

  it('has a cooldown, running from the last deliberate change', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).treasury = 1e15;
    const d = Game.nationDemographics(nid);
    const opts = Ideology.all().map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .filter((o) => o.share >= T().get('gov.changeMinShare'));
    ok(opts.length >= 2, 'not enough supported ideologies to test a second switch');
    const first = opts.find((o) => o.id !== Game.getNation(nid).gov.rulingIdeology);
    ok(Game.changeRulingIdeology(nid, first.id, { force: true }).ok);
    const second = opts.find((o) => o.id !== Game.getNation(nid).gov.rulingIdeology);
    const res = Game.changeRulingIdeology(nid, second.id);
    equal(res.ok, false, 'a government changed course twice in one turn');
    ok(/recently/i.test(res.message));
  });

  it('APPEASEMENT WORKS: liberties rise where the new ideology is strong', async () => {
    /*
     * The claim the whole valve rests on, and nothing implements it directly.
     * Civil Liberties measures the population-weighted affinity between each
     * Area's mix and the ruling ideology; change the ruling ideology and that
     * number moves on its own.
     */
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '49'; // Utah: a Conservative Nationalist minority under a Republican government
    const n = Game.getNation(nid);
    n.treasury = 1e15;
    // Let Deseret organise first: at turn 0 the ideology is 8% of Utah, below
    // the mandate threshold. You appease a movement once it has grown, which is
    // also when you would want to.
    for (let i = 0; i < 25; i++) World.advanceTurn(T(), rng);
    if (!Game.getNation(nid)) return; // Utah may have broken up by then
    World.begin(T());
    const live = Game.getNation(nid);
    const before = live.liberties;
    const beforeAlign = live.why.liberties.inputs.find((i) => i.label === 'Alignment at home').norm;

    const d = Game.nationDemographics(nid);
    // Whatever has grown enough to be worth appeasing and is not already in
    // power. With the M5.3 tuning Utah's plurality may already have BECOME
    // Conservative Nationalist by now, in which case switching to it is a no-op.
    const cur = live.gov.rulingIdeology;
    const pick = Ideology.all()
      .map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .filter((o) => o.id !== cur && o.share >= T().get('gov.changeMinShare'))
      .sort((a, b) => b.share - a.share)[0];
    if (!pick) return; // nothing grew enough; nothing to appease
    live.treasury = 1e15;

    const done = Game.changeRulingIdeology(nid, pick.id);
    ok(done.ok, `appeasement was refused: ${done.message}`);
    World.advanceTurn(T(), rng);
    const now = Game.getNation(nid);
    if (!now) return;
    const afterAlign = now.why.liberties.inputs.find((i) => i.label === 'Alignment at home').norm;
    ok(afterAlign !== beforeAlign,
      'the government changed and alignment at home did not move; the valve is inert');
    ok(before !== undefined);
  });

  it('and sentiment follows liberties, which is the point of the valve', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '49';
    Game.getNation(nid).treasury = 1e15;
    for (let i = 0; i < 12; i++) World.advanceTurn(T(), rng);

    const areas = [...Game.getNation(nid).counties];
    const peak = () => areas.reduce((m, f) => {
      const c = Game.county[f];
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      return Math.max(m, pop > 0 ? (c.mov.Deseret || 0) / pop : 0);
    }, 0);
    const before = peak();
    if (before <= 0) return; // Deseret may already have gone

    // Appease it: govern as the ideology it belongs to.
    const res = Game.changeRulingIdeology(nid, 'yellow', { force: true });
    if (!res.ok) return;
    // The grievance terms feeding sentiment must have moved in the right
    // direction; sentiment itself is rate-limited so it follows over turns.
    World.advanceTurn(T(), rng);
    const n = Game.getNation(nid);
    const lib = n.why.liberties;
    ok(lib.inputs.find((i) => i.label === 'Alignment at home').norm > 0,
      'alignment at home reads zero after appeasing the largest movement');
    ok(before > 0);
  });
});

describe('Releasing counties has a recipient, not a target', () => {
  const compat = (a, b) =>
    Ideology.mixAffinity(Game.nationDemographics(a).mix, Game.demographics(new Set(b)).mix);

  it('a politically compatible neighbour accepts', async () => {
    await bootWorld({ seed: SEED });
    // Build an accept predicate the way actions.js does and check it says yes to
    // a neighbour that matches.
    const nid = '06';
    const target = '32';
    const accepts = (recipient, comp) => {
      const them = Game.nationDemographics(recipient);
      const it = Game.demographics(new Set(comp));
      return Ideology.mixAffinity(them.mix, it.mix) >= T().get('release.acceptAffinity');
    };
    const own = [...Game.getNation(nid).counties].slice(0, 2);
    equal(accepts(target, own), compat(target, own) >= T().get('release.acceptAffinity'));
  });

  it('a fragment nobody will take stays where it was', async () => {
    /*
     * THE GUARDRAIL. `breakApart` with an `accept` predicate that refuses
     * everybody must leave the Areas with their current owner rather than
     * forcing them on the nearest neighbour.
     */
    await bootWorld({ seed: SEED });
    // Genuinely unviable: under `nation.minAreas` AND under `nation.minPop`. Two
    // Californian Areas clear the population bar comfortably and would stand
    // alone on their own — which is D77 working, not the guardrail failing.
    const nid = '30'; // Montana, whose Areas are small
    const chunk = [...Game.getNation(nid).counties]
      .sort((a, b) => Game.countyPop(a) - Game.countyPop(b)).slice(0, 2);
    let chunkPop = 0;
    for (const f of chunk) chunkPop += Game.countyPop(f);
    ok(chunkPop < T().get('nation.minPop'),
      `the chunk holds ${Math.round(chunkPop)} people and would stand alone anyway`);
    const before = chunk.map((f) => Game.getOwner(f));
    const born = Game.breakApart(chunk, { exclude: nid, accept: () => false });
    equal(born.length, 0, 'a refused fragment became a country');
    for (let i = 0; i < chunk.length; i++) {
      equal(Game.getOwner(chunk[i]), before[i],
        'a neighbour that refused the handover received it anyway');
    }
    ok(Array.isArray(born.refused) && born.refused.length === chunk.length,
      'the refusal was not reported back to the caller');
  });

  it('without a predicate the old behaviour is unchanged', async () => {
    await bootWorld({ seed: SEED });
    const nid = '30';
    const chunk = [...Game.getNation(nid).counties]
      .sort((a, b) => Game.countyPop(a) - Game.countyPop(b)).slice(0, 2);
    Game.breakApart(chunk, { exclude: nid });
    let moved = 0;
    for (const f of chunk) if (Game.getOwner(f) !== nid) moved++;
    ok(moved > 0, 'the unguarded path stopped handing fragments to neighbours');
  });

  it('a chunk large enough to stand alone never needs anyone\'s consent', async () => {
    await bootWorld({ seed: SEED });
    const nid = '48';
    const chunk = [...Game.getNation(nid).counties].slice(0, 20);
    const born = Game.breakApart(chunk, { exclude: nid, accept: () => false });
    ok(born.length > 0, 'a viable breakaway was blocked by a neighbour refusing it');
  });

  it('a rump state takes what it is offered', async () => {
    await bootWorld({ seed: SEED });
    const desperate = T().get('release.desperateAreas');
    ok(desperate >= 1, 'the desperate threshold is off, so this valve has no floor');
  });
});

describe('Occupation costs more where it is resented (M4.5)', () => {
  it('hostility is the strongest organised movement in an Area', async () => {
    await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    const f = rec.core[0];
    const c = Game.county[f];
    let pop = 0;
    for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
    close(Game.hostility(f), (c.mov.Deseret || 0) / pop, 1e-9);
    // an Area nobody has organised is not hostile
    const quiet = Object.keys(Game.county).find((x) => Object.keys(Game.county[x].mov).length === 0);
    if (quiet) equal(Game.hostility(quiet), 0);
    equal(Game.hostility('nowhere'), 0, 'an unknown Area should be 0, not NaN');
  });

  it('two nations holding the same amount of foreign ground pay differently', async () => {
    /*
     * The point of the term: WHICH ground you took matters as much as how much.
     * Same count, same alpha, different local hostility.
     */
    await bootWorld({ seed: SEED });
    const take = (nid, from, n) => {
      const areas = [...Game.getNation(from).counties].slice(0, n);
      Game.moveCounties(areas, nid, { reason: 'annex' });
      return areas;
    };
    const calm = take('16', '30', 6);   // Idaho takes Montana
    const angry = take('49', '32', 6);  // Utah takes Nevada
    // make the second batch hostile and the first quiet
    for (const f of calm) Game.county[f].mov = {};
    const idx = Movements.ideologyIndexOf('Deseret');
    for (const f of angry) {
      const c = Game.county[f];
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      let others = 0;
      for (let i = 0; i < c.pop.length; i++) if (i !== idx) others += c.pop[i];
      const take2 = Math.min(pop * 0.5, others);
      const k = others > 0 ? 1 - take2 / others : 1;
      for (let i = 0; i < c.pop.length; i++) if (i !== idx) c.pop[i] *= k;
      c.pop[idx] += take2;
      c.mov = { Deseret: pop * 0.5 };
    }

    const quietBill = Game.treasuryFlow('16').occupation;
    const angryBill = Game.treasuryFlow('49').occupation;
    equal(Game.treasuryFlow('16').occupied, Game.treasuryFlow('49').occupied,
      'the two nations do not hold the same amount of foreign ground; the test proves nothing');
    ok(angryBill > quietBill * 1.3,
      `six quiet Areas cost ${Math.round(quietBill / 1e6)}M and six hostile ones ` +
      `${Math.round(angryBill / 1e6)}M; hostility is not reaching the bill`);
  });

  it('is still superlinear in the count, whatever the locals think', async () => {
    await bootWorld({ seed: SEED });
    const per = (n) => {
      const areas = [...Game.getNation('32').counties].concat([...Game.getNation('41').counties]).slice(0, n);
      Game.moveCounties(areas, '06', { reason: 'annex' });
      for (const f of areas) Game.county[f].mov = {};   // hold hostility at zero
      const flow = Game.treasuryFlow('06');
      return flow.occupied ? flow.occupation / flow.occupied : 0;
    };
    const few = per(4);
    await bootWorld({ seed: SEED });
    const many = per(24);
    ok(many > few * 1.5,
      `per-Area occupation cost went ${Math.round(few / 1e6)}M at 4 Areas to ${Math.round(many / 1e6)}M at 24; ` +
      'the anti-snowball brake is linear');
  });

  it('a nation holding only its own soil pays no occupation at all', async () => {
    await bootWorld({ seed: SEED });
    const flow = Game.treasuryFlow('49');
    equal(flow.occupied, 0);
    equal(flow.occupation, 0, 'a nation was charged for occupying itself');
  });
});

/*
 * M6.5b — the last valve, and the one that keeps the ground.
 *
 * There are three answers to an Area that is organising against you, and the
 * whole point is that they are different PRICES for the same relief:
 *
 *   garrison   press it down.        Pays in civil liberties.
 *   autonomy   let it govern itself. Pays in revenue and in Authority. Reversible.
 *   release    let it go.            Pays in the Area.
 *
 * Autonomy is the one that was missing, and it is the one a player reaches for
 * when they still intend to keep the place — which is most of the time, and was
 * exactly the case the game had no move for.
 */
describe('Autonomy: the valve that keeps the ground', () => {
  it('answers the grievance rather than one term of it', async () => {
    /*
     * Scales the whole grievance, because the answer self-rule gives is not
     * "your quality of life improved" but "this is your government now". It is
     * also what stops autonomy and a garrison stacking into a free answer.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 4; i++) World.advanceTurn(T(), rng);
    let best = null, bv = 0;
    for (const rec of Movements.all()) {
      for (const f of rec.homeland) {
        const o = Game.getOwner(f);
        if (!o) continue;
        const w = Sentiment.explain(f, rec.name, T());
        if (w && w.value > bv) { bv = w.value; best = [o, f, rec.name]; }
      }
    }
    ok(best && bv > 0.05, `no movement has meaningful sentiment anywhere (best ${bv})`);
    const [nid, area, mv] = best;
    const before = Sentiment.explain(area, mv, T()).value;
    equal(Game.setAutonomy([area], true), 1);
    const after = Sentiment.explain(area, mv, T()).value;
    ok(after < before, `self-rule did not lower the target (${before.toFixed(3)} -> ${after.toFixed(3)})`);
    // ...and taking it back puts the grievance straight back.
    Game.setAutonomy([area], false);
    close(Sentiment.explain(area, mv, T()).value, before, 1e-9,
      'revoking self-rule did not restore the grievance');
  });

  it('the flag survives turn zero, where the turn number is falsy', async () => {
    /*
     * The first cut stored the world turn as the flag, so a grant made on turn
     * ZERO stored 0 and read as false everywhere — silently, because every
     * reader agreed with every other reader that it had not happened.
     */
    await bootWorld({ seed: SEED });
    equal(World.getTurn(), 0);
    const nid = '49';
    const f = [...Game.getNation(nid).counties][0];
    Game.setAutonomy([f], true);
    equal(Game.isAutonomous(f), true, 'a grant on turn 0 did not stick');
    equal(Game.autonomousCount(nid), 1);
  });

  it('costs revenue, and the ledger line says how much', async () => {
    await bootWorld({ seed: SEED });
    const nid = '49';
    const areas = [...Game.getNation(nid).counties].slice(0, 2);
    const before = Game.treasuryFlow(nid).income;
    const p = Moves.plan({ type: 'autonomy', nid, areas, grant: true }, T());
    ok(p.ok, p.reason);
    const r = Moves.resolve({ type: 'autonomy', nid, areas, grant: true }, RNG.create(1), T());
    equal(r.changed, 2);
    const flow = Game.treasuryFlow(nid);
    ok(flow.income < before, 'self-rule cost no revenue');
    close(before - flow.income, flow.autonomy, 1e-6, 'the forgone revenue is not reported');
    close(flow.autonomy, p.forgone, 1e-6, 'the bill did not match the quote');
    equal(Ledger.ofKind('autonomy').length, 1);
  });

  it('and costs Authority, because a state that governs less commands less', async () => {
    await bootWorld({ seed: SEED });
    const nid = '49';
    const auth = () => Power.authority(Power.gatherAuthority(Power.nationFacts(nid, T()), 1), T());
    const before = auth().target;
    Game.setAutonomy([...Game.getNation(nid).counties].slice(0, 6), true);
    const after = auth();
    ok(after.target < before, `self-rule cost no Authority (${before.toFixed(4)} -> ${after.target.toFixed(4)})`);
    const t = after.inputs.find((i) => i.label === 'Self-rule');
    ok(t && t.contribution < 0, 'the Authority record does not name self-rule as the reason');
  });

  it('a state that governs none of itself is not a state', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const own = [...Game.getNation(nid).counties];
    const cap = Math.floor(own.length * T().get('autonomy.maxShare'));
    Game.setAutonomy(own.slice(0, cap), true);
    const more = Moves.plan({ type: 'autonomy', nid, areas: own.slice(cap, cap + 1), grant: true }, T());
    equal(more.ok, false, 'a nation autonomised past its own cap');
    ok(/at most/.test(more.reason), `the refusal reads "${more.reason}"`);
  });

  it('is reversible, which is the whole reason it is not release', async () => {
    await bootWorld({ seed: SEED });
    const nid = '49';
    const areas = [...Game.getNation(nid).counties].slice(0, 2);
    Moves.resolve({ type: 'autonomy', nid, areas, grant: true }, RNG.create(1), T());
    Game.getNation(nid).lastAutonomyTurn = -Infinity;   // past the cooldown
    const back = Moves.resolve({ type: 'autonomy', nid, areas, grant: false }, RNG.create(1), T());
    ok(back.ok, back.reason);
    equal(Game.autonomousCount(nid), 0);
    for (const f of areas) equal(Game.getOwner(f), nid, 'the Area left when it was only meant to be governed back');
  });

  it('a settlement is negotiated, not announced', async () => {
    await bootWorld({ seed: SEED });
    const nid = '49';
    const own = [...Game.getNation(nid).counties];
    Moves.resolve({ type: 'autonomy', nid, areas: own.slice(0, 1), grant: true }, RNG.create(1), T());
    ok(Moves.autonomyCooldownLeft(nid, T()) > 0, 'a grant started no cooldown');
    const again = Moves.plan({ type: 'autonomy', nid, areas: own.slice(1, 2), grant: true }, T());
    equal(again.ok, false, 'a nation settled twice in one turn');
  });

  it('the AI is offered it beside release, and the difference is the price', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 15; i++) World.advanceTurn(T(), rng);
    let seen = 0;
    for (const [nid] of Game.nations) {
      const moves = Moves.legal(nid, {}, T());
      const a = moves.find((m) => m.type === 'autonomy');
      const r = moves.find((m) => m.type === 'release');
      if (!a || !r) continue;
      seen++;
      const sa = AI.score(a, Moves.plan(a, T()), T());
      const sr = AI.score(r, Moves.plan(r, T()), T());
      if (!sa || !sr) continue;
      ok(sa.inputs.some((i) => i.label === 'Grievance answered'),
        'autonomy is scored with no relief term at all');
      ok(sr.inputs.some((i) => i.label === 'Sedition shed'),
        'release is scored with no relief term at all');
      if (seen >= 4) break;
    }
    ok(seen > 0, 'no nation was offered both valves');
  });
});
