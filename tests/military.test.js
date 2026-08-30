/*
 * M6.5 — force, as an allocation.
 *
 * No unit counters. One number for how much a nation can bring to bear, and one
 * decision about where it points: Garrison holds your own ground down, Border
 * makes you expensive to attack, Field makes your attacks land.
 *
 * What is pinned here is mostly the SHAPE of that, because the weights are a
 * tuning pass and will move:
 *
 *   - force is derived, so it cannot drift out of step with the rest of the
 *     model, and a nation falling apart gets weaker at the moment it needs the
 *     army — the honest direction for that feedback to run;
 *   - readiness lags the allocation, which is the entire cost of changing your
 *     mind and the only reason the three sliders are a decision rather than
 *     something you set at the moment of use;
 *   - suppression is a TRADE. It buys quiet in the sentiment phase and pays for
 *     it in Civil Liberties, which feed the grievance driving the next movement.
 *     Without the second half it is a button you would always press.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

const full = (nid, role) => {
  const alloc = { garrison: 0, border: 0, field: 0 };
  alloc[role] = 1;
  Military.allocate(nid, alloc);
  for (let i = 0; i < 40; i++) Military.tick(T());   // long enough to be ready
};

describe('How much force there is', () => {
  it('is derived from the nation, and says how', async () => {
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '48', '39', '44']) {
      const f = Military.force(nid, T());
      const d = Game.nationDemographics(nid);
      close(f.manpower, d.pop * T().get('mil.manpowerShare'), 1e-6);
      ok(f.equipment > 0 && f.equipment < 1, `equipment ${f.equipment} is not a share`);
      ok(f.doctrine >= T().get('mil.doctrineFloor') && f.doctrine <= 1);
      close(f.value, f.manpower * f.equipment * f.doctrine, 1e-6);
      equal(f.inputs.length, 3);
      for (const i of f.inputs) ok(i.label && i.key && i.note);
    }
  });

  it('a bigger, richer, better-governed nation fields more', async () => {
    await bootWorld({ seed: SEED });
    const big = Military.force('06', T()).value;   // California
    const small = Military.force('50', T()).value; // Vermont
    ok(big > small * 10, `California fields ${Math.round(big)} and Vermont ${Math.round(small)}`);
  });

  it('a state that cannot govern still fields something', async () => {
    /*
     * The floor. Without it a nation in crisis loses its army at the exact
     * moment the model wants it to have a hard choice about using one.
     */
    await bootWorld({ seed: SEED });
    const n = Game.getNation('06');
    n.authority = 0;
    const f = Military.force('06', T());
    ok(f.doctrine >= T().get('mil.doctrineFloor'), `doctrine collapsed to ${f.doctrine}`);
    ok(f.value > 0);
  });

  it('and it is on the books every turn', async () => {
    await bootWorld({ seed: SEED });
    const flow = Game.treasuryFlow('39');
    const up = Military.upkeep('39', T());
    close(flow.army, up, 1e-6, 'the army is not in the maintenance line');
    ok(flow.army > 0, 'a standing army costs nothing');
    ok(flow.army < flow.income * 0.25,
      `the army is ${Math.round(100 * flow.army / flow.income)}% of income before anything else`);
    ok(flow.delta > 0, 'a nation cannot pay for its opening army');
  });

  it('charged on force, not on where the force points', async () => {
    /*
     * You do not save money by pointing the army somewhere else. This is what
     * makes "how much force" a question rather than "as much as possible".
     */
    await bootWorld({ seed: SEED });
    const a = Military.upkeep('39', T());
    full('39', 'field');
    close(Military.upkeep('39', T()), a, 1e-6, 'reallocating changed the bill');
  });
});

describe('Readiness is the cost of changing your mind', () => {
  it('lags the allocation in both directions', async () => {
    await bootWorld({ seed: SEED });
    const nid = '39';
    Military.allocate(nid, { garrison: 1, border: 0, field: 0 });
    const s = Military.state(nid);
    const start = s.ready.garrison;
    Military.tick(T());
    const after = s.ready.garrison;
    ok(after > start, 'readiness did not rise toward the allocation');
    ok(after < 1, 'readiness reached the allocation in a single turn');
    close(after - start, T().get('mil.readyRise'), 1e-9);
  });

  it('falls faster than it rises, because standing down is quick', async () => {
    await bootWorld({ seed: SEED });
    ok(T().get('mil.readyFall') > T().get('mil.readyRise'));
    const nid = '39';
    full(nid, 'garrison');
    const s = Military.state(nid);
    close(s.ready.garrison, 1, 1e-9);
    Military.allocate(nid, { garrison: 0, border: 1, field: 0 });
    Military.tick(T());
    close(1 - s.ready.garrison, T().get('mil.readyFall'), 1e-9);
  });

  it('so switching everything to Field the turn before you invade buys nothing', async () => {
    await bootWorld({ seed: SEED });
    const nid = '39';
    const standing = (() => { full(nid, 'field'); return Military.strength(nid, 'field', T()); })();
    Military.allocate(nid, Military.evenSplit());
    for (let i = 0; i < 40; i++) Military.tick(T());
    Military.allocate(nid, { garrison: 0, border: 0, field: 1 });
    Military.tick(T());
    const panicked = Military.strength(nid, 'field', T());
    ok(panicked < standing * 0.6,
      `a one-turn switch reached ${Math.round(100 * panicked / standing)}% of a standing posture`);
  });

  it('an allocation always sums to one, however it is given', async () => {
    await bootWorld({ seed: SEED });
    for (const given of [{ garrison: 5, border: 5, field: 0 }, { garrison: 0, border: 0, field: 0 },
      { garrison: -3, border: 1, field: 1 }, { garrison: 100, border: 200, field: 700 }]) {
      const a = Military.allocate('39', given);
      let sum = 0;
      for (const r of Military.ROLES) { ok(a[r] >= 0, `${r} = ${a[r]}`); sum += a[r]; }
      close(sum, 1, 1e-9, `an allocation summed to ${sum}`);
    }
  });
});

describe('What the force does', () => {
  it('a garrison holds ground down, and is spread thinner the more ground there is', async () => {
    await bootWorld({ seed: SEED });
    const nid = '39';
    equal(Military.garrisonPressure(nid, T()) > 0, true);
    full(nid, 'garrison');
    const concentrated = Military.garrisonPressure(nid, T());
    ok(concentrated > 0.2, `a full garrison only reached ${concentrated.toFixed(3)}`);
    ok(concentrated < 1, 'a garrison can suppress a population completely');
    // ...and the same army over twice the ground is worth less per Area.
    const targets = [...Game.annexTargets(nid)];
    Game.moveCounties(targets, nid, { silent: true, reason: 'annex' });
    ok(Military.garrisonPressure(nid, T()) < concentrated,
      'the same army held twice the ground down just as hard');
  });

  it('suppression is a TRADE: quiet now, grievance later', async () => {
    /*
     * The half that makes it a decision. A garrison lowers the sentiment target
     * and lowers Civil Liberties, and Civil Liberties are a grievance term in
     * the same formula.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
    /*
     * The Area where a movement is STRONGEST, not the first core Area with an
     * owner: a core Area whose dominant ideology is hostile to the movement has
     * a sentiment target of zero, and a test that starts at zero cannot show a
     * garrison lowering anything.
     */
    let found = null, best = 0;
    for (const rec of Movements.all()) {
      for (const f of rec.homeland) {
        const owner = Game.getOwner(f);
        if (!owner) continue;
        const w = Sentiment.explain(f, rec.name, T());
        if (w && w.value > best) { best = w.value; found = [owner, f, rec.name]; }
      }
    }
    ok(found && best > 0.02, `no movement has meaningful sentiment anywhere (best ${best})`);
    const [nid, area, mv] = found;
    const quiet = Sentiment.explain(area, mv, T());
    const libBefore = Power.liberties(Power.gatherLiberties(Power.nationFacts(nid, T()), 1), T());
    full(nid, 'garrison');
    const held = Sentiment.explain(area, mv, T());
    const libAfter = Power.liberties(Power.gatherLiberties(Power.nationFacts(nid, T()), 1), T());
    /*
     * RAW, not the clamped value. The sentiment target has a ceiling, and this
     * test picks the Area where a movement is STRONGEST — so once the content
     * grew (M7.12), the strongest Area on the board was one whose raw target
     * sat above the ceiling both before and after a garrison, and the test read
     * 0.500 -> 0.500 while the model was moving 0.558 -> 0.472 underneath it.
     * The claim is about what suppression does to the target; the ceiling is a
     * different rule, with its own test.
     */
    ok(held.raw < quiet.raw,
      `a full garrison did not lower the target (${quiet.raw.toFixed(3)} -> ${held.raw.toFixed(3)})`);
    ok(held.inputs.some((i) => i.label === 'Suppression' && i.contribution < 0),
      'the Why record does not name the garrison that lowered it');
    ok(libAfter.target < libBefore.target,
      `a full garrison cost no liberties (${libBefore.target.toFixed(3)} -> ${libAfter.target.toFixed(3)})`);
  });

  it('a prepared army makes the same annexation go better', async () => {
    /*
     * `warMultiplier` scales the civil-war score, where low is a win for the
     * attacker. Before M6.5 the only input to a war was how big you were.
     */
    await bootWorld({ seed: SEED });
    const nid = '39';
    const target = Game.adjacentNations(nid)[0];
    const parity = Military.warMultiplier(nid, [target], T());
    close(parity, 1, 0.35, 'two similar nations are wildly unequal at an even split');
    full(nid, 'field');
    const ready = Military.warMultiplier(nid, [target], T());
    ok(ready < parity, `a field army did not help (${parity.toFixed(3)} -> ${ready.toFixed(3)})`);
    full(target, 'border');
    const defended = Military.warMultiplier(nid, [target], T());
    ok(defended > ready, `the defender's border army did nothing (${ready.toFixed(3)} -> ${defended.toFixed(3)})`);
  });

  it('nobody having anything is a draw, not a divide by zero', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) Military.allocate(nid, { garrison: 1, border: 0, field: 0 });
    for (let i = 0; i < 40; i++) Military.tick(T());
    const m = Military.warMultiplier('39', [Game.adjacentNations('39')[0]], T());
    ok(Number.isFinite(m), `the multiplier came back ${m}`);
    close(m, 1, 1e-9, 'two nations with no field and no border armies were not even');
  });

  it('and the preview says so, so the human and the AI read one number', async () => {
    await bootWorld({ seed: SEED });
    const nid = '39';
    const areas = [...Game.annexTargets(nid)].slice(0, 2);
    Game.getNation(nid).treasury = 1e15;
    const p = Moves.plan({ type: 'annex', nid, areas }, T());
    ok(p.ok, p.reason);
    ok(Number.isFinite(p.forceMult), 'the annexation preview does not report the force ratio');
    const eff = p.effects.find((e) => e.label === 'Force');
    ok(eff, 'the force ratio is not in the effects vector the AI scores');
    close(eff.value, p.forceMult, 1e-9);
  });
});

describe('The posture is state', () => {
  it('survives a save and a load', async () => {
    const ctx = await bootWorld({ seed: SEED });
    Military.allocate('39', { garrison: 0.7, border: 0.2, field: 0.1 });
    for (let i = 0; i < 5; i++) Military.tick(T());
    const want = { ...Military.state('39').alloc };
    const ready = { ...Military.state('39').ready };
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    Military.allocate('39', Military.evenSplit());
    StateDoc.applyModel(doc);
    const back = Military.state('39');
    for (const r of Military.ROLES) {
      close(back.alloc[r], want[r], 1e-9, `${r} allocation was not restored`);
      close(back.ready[r], ready[r], 1e-9, `${r} readiness was not restored`);
    }
  });

  it('a nation that has never been told begins evenly split', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) {
      const s = Military.state(nid);
      for (const r of Military.ROLES) close(s.alloc[r], 1 / 3, 1e-9);
    }
  });

  it('reading it changes nothing', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    for (const [nid] of Game.nations) { Military.posture(nid, T()); Military.garrisonPressure(nid, T()); }
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `reading the army changed ${k}`);
  });
});

describe('The AI points its army', () => {
  it('a fraying nation garrisons; a nation about to attack takes the field', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), rng);
    let strained = null, calm = null;
    for (const [nid] of Game.nations) {
      const s = AI.strain(nid, T());
      if (s > 0.7 && !strained) strained = nid;
      if (s < 0.1 && !calm) calm = nid;
    }
    if (!strained || !calm) return;
    const a = AI.allocate(strained, T(), null);
    const b = AI.allocate(calm, T(), { intent: { type: 'annex' } });
    ok(a.garrison > b.garrison,
      `a nation at ${AI.strain(strained, T()).toFixed(2)} strain garrisoned ${a.garrison.toFixed(2)} `
      + `and a calm attacker ${b.garrison.toFixed(2)}`);
    ok(b.field > a.field, 'the attacker did not take the field');
  });

  it('a nation that passes still has a posture', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const prev = AI.setPolicy(AI.pass);
    try {
      AI.round(T(), rng);
      for (const [nid] of Game.nations) {
        const s = Military.state(nid);
        let sum = 0;
        for (const r of Military.ROLES) sum += s.alloc[r];
        close(sum, 1, 1e-9, `${nid} has no posture at all`);
      }
    } finally { AI.setPolicy(prev); }
  });
});
