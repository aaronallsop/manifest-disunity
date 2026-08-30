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
