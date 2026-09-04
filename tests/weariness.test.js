/*
 * M7.3 — war weariness, the fifth stock and the only one that measures what a
 * nation is doing to ITSELF.
 *
 * Nothing persisted between wars before this: a nation could fight every turn
 * for forty turns and the only trace was a treasury line. Weariness is what
 * makes a campaign a campaign rather than a series of unrelated rolls — it
 * accumulates while you fight, decays while you do not, and it is felt at home
 * in the two places a tired country would feel it: quality of life falls, and
 * every movement in your own ground gets an argument it did not have.
 *
 * IT IS THE AGGRESSOR'S. Being invaded was already expensive — you lose Areas,
 * Authority reads the losses, sentiment reads the occupation. What had no cost
 * at all was doing the invading, over and over, and winning.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

const wear = (nid) => Power.weariness(Power.gatherWeariness(Power.nationFacts(nid, T()), World.getTurn()), T());

describe('A nation at peace is not tired', () => {
  it('the opening position is rested', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) {
      const w = wear(nid);
      ok(w.target < 0.1, `${Game.getNation(nid).name} opens at ${w.target.toFixed(3)} weariness`);
    }
  });

  it('and every point of it is something the nation did', async () => {
    await bootWorld({ seed: SEED });
    const w = wear('06');
    for (const i of w.inputs) {
      ok(i.label && i.key, 'a weariness term with no label or tunable behind it');
      /*
       * Every term but one is "how much of a thing", 0..1, and every one of them
       * can only ADD to weariness — a nation is tired because of something it
       * did. Leadership is the exception and is signed: a Veteran spares the
       * country and a Hawk spends it, which is the one input here that can point
       * either way.
       */
      if (i.signed) {
        ok(i.norm >= -1 && i.norm <= 1, `${i.label} normalised to ${i.norm}`);
      } else {
        ok(i.norm >= 0 && i.norm <= 1, `${i.label} normalised to ${i.norm}`);
        ok(i.contribution >= 0, `${i.label} made a nation LESS tired`);
      }
    }
    close(w.raw, w.inputs.reduce((a, i) => a + i.contribution, T().get('power.weariness.base')), 1e-9,
      'the value is not the sum of what it reported');
  });
});

describe('Fighting is what makes it', () => {
  it('a war raises it, and a bigger war raises it more', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const before = wear(nid).target;
    const n = Game.getNation(nid);
    n.annexed.push({ turn: World.getTurn(), areas: 4, reason: 'war' });
    const one = wear(nid).target;
    ok(one > before, 'a war left the nation no more tired than peace');
    n.annexed.push({ turn: World.getTurn(), areas: 12, reason: 'war' });
    ok(wear(nid).target > one, 'a second, larger war changed nothing');
  });

  it('separate wars weigh more than one wide one', async () => {
    /*
     * Starting a fourth war is a different thing from widening the first, and
     * `power.weariness.wWars` is the heaviest term for exactly that reason.
     */
    await bootWorld({ seed: SEED });
    const turn = World.getTurn();
    const wide = Game.getNation('06');
    wide.annexed.push({ turn, areas: 12, reason: 'war' });
    const many = Game.getNation('48');
    for (let i = 0; i < 4; i++) many.annexed.push({ turn, areas: 3, reason: 'war' });
    ok(wear('48').target > wear('06').target,
      'four wars of three Areas tired a nation no more than one of twelve');
  });

  it('an ANNEXATION that never came to war does not tire anybody', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const before = wear(nid).target;
    Game.getNation(nid).annexed.push({ turn: World.getTurn(), areas: 10, reason: 'annex' });
    close(wear(nid).target, before, 1e-9,
      'taking ground without a fight tired the nation as though it had fought');
  });

  it('and it is the AGGRESSOR who tires, not the victim', async () => {
    await bootWorld({ seed: SEED });
    const attacker = '06', victim = '32';
    const turn = World.getTurn();
    Game.getNation(attacker).annexed.push({ turn, areas: 8, reason: 'war' });
    Game.getNation(victim).lost.push({ turn, areas: 8, reason: 'war' });
    ok(wear(attacker).target > wear(victim).target,
      'losing a war was as tiring as winning one; the aggressor pays nothing');
  });

  it('it fades: the same war matters less as it recedes', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).annexed.push({ turn: 0, areas: 10, reason: 'war' });
    World.setTurn(1);
    const fresh = wear(nid).target;
    World.setTurn(T().get('nation.historyWindow') + 2);
    const gone = wear(nid).target;
    ok(gone < fresh, `the war weighed the same ${T().get('nation.historyWindow') + 2} turns later`);
  });

  it('an army in the field is a burden; an army at home is not', async () => {
    /*
     * Force SIZE is not a choice in this game, so `force / pop` reads as a
     * constant for every nation forever — a term with no information and a
     * permanent drag with no lever. The posture is chosen every turn.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const set = (alloc) => {
      Military.allocate(nid, alloc);
      for (let i = 0; i < 40; i++) Military.tick(T());
    };
    set({ garrison: 0, border: 1, field: 0 });
    const home = wear(nid).inputs.find((i) => i.label === 'In the field');
    set({ garrison: 0, border: 0, field: 1 });
    const abroad = wear(nid).inputs.find((i) => i.label === 'In the field');
    close(home.contribution, 0, 1e-9, 'an army sitting on its own border tired the country');
    ok(abroad.contribution > 0.1, `a fully deployed army contributed ${abroad.contribution}`);
  });
});

describe('Where it is felt', () => {
  it('quality of life falls', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = Game.getNation(nid);
    const qol = () => Power.qol(Power.gatherQol(Power.nationFacts(nid, T()), World.getTurn()), T());
    n.weariness = 0;
    const rested = qol();
    n.weariness = 0.8;
    const tired = qol();
    ok(tired.target < rested.target,
      `weariness cost no quality of life (${rested.target.toFixed(3)} -> ${tired.target.toFixed(3)})`);
    const term = tired.inputs.find((i) => i.label === 'War weariness');
    ok(term && term.contribution < 0, 'QoL does not name the war as a reason');
  });

  it('and every movement in your own ground gets an argument', async () => {
    /*
     * The second place a long campaign is felt at home, and the one that turns
     * it into a secession problem.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) World.advanceTurn(T(), rng);
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
    const n = Game.getNation(nid);
    n.weariness = 0;
    const rested = Sentiment.explain(area, mv, T());
    n.weariness = 0.9;
    const tired = Sentiment.explain(area, mv, T());
    /*
     * `raw`, not `value`. The strongest Area for a movement is usually already
     * at the movement's own ceiling, so the capped value cannot move and a test
     * on it proves nothing either way. `raw` is the grievance before the cap,
     * which is the quantity this term is actually about.
     */
    ok(tired.raw > rested.raw,
      `an exhausted state gave the movement nothing (${rested.raw.toFixed(3)} -> ${tired.raw.toFixed(3)})`);
    const term = tired.inputs.find((i) => i.label === 'War weariness');
    ok(term && term.contribution > 0, 'sentiment does not name the war as a reason');
  });
});

describe('It is a stock, and it is state', () => {
  it('rate-limited in both directions, like the other four', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '06';
    World.advanceTurn(T(), rng);
    const n = Game.getNation(nid);
    n.annexed.push({ turn: World.getTurn(), areas: 20, reason: 'war' });
    for (let i = 0; i < 3; i++) n.annexed.push({ turn: World.getTurn(), areas: 6, reason: 'war' });
    const rec = wear(nid);
    ok(rec.target > rec.value,
      'a nation became exhausted in a single turn; the stock discipline is not applied');
    ok(rec.value >= (n.weariness || 0) - 1e-9);
  });

  it('the world computes it every turn and remembers why', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 3; i++) World.advanceTurn(T(), rng);
    for (const [, n] of Game.nations) {
      ok(typeof n.weariness === 'number' && Number.isFinite(n.weariness),
        `${n.name} has no weariness`);
      // Four, plus Leadership since M7.5.
      ok(n.why.weariness && n.why.weariness.inputs.length === 5,
        `${n.name} reported ${n.why.weariness ? n.why.weariness.inputs.length : 0} terms`);
      ok(/[A-Z]/.test(n.why.weariness.summary));
    }
  });

  it('survives a save and a load', async () => {
    const ctx = await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).weariness = 0.42;
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    Game.getNation(nid).weariness = 0;
    StateDoc.applyModel(doc);
    close(Game.getNation(nid).weariness, 0.42, 1e-9, 'the war was forgotten on load');
  });

  it('reading it changes nothing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 4; i++) World.advanceTurn(T(), rng);
    const before = fingerprint();
    for (const [nid] of Game.nations) wear(nid);
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `reading weariness changed ${k}`);
  });
});

describe('War weariness is rate-limited the other way up (M9.8)', () => {
  /*
   * The other four power stocks are things a nation HAS, so `power.maxFall`
   * (0.08) is deliberately larger than `power.maxRise` (0.05): standing is
   * easier to lose than to build. Weariness is a thing a nation SUFFERS, and it
   * inherited those limits — so it climbed at 0.05 and shed at 0.08, which is
   * the intended asymmetry inverted. The bill is supposed to arrive while you
   * are still fighting and to still be there afterwards.
   */
  it('rises faster than it falls, unlike every other stock', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    ok(t.get('power.weariness.maxRise') > t.get('power.weariness.maxFall'),
      'weariness sheds faster than it accumulates');
    ok(t.get('power.maxFall') > t.get('power.maxRise'),
      'the shared limits are no longer the ones weariness must NOT use');
  });

  it('and moves by its own caps, not the shared ones', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const t = T();
    const rise = t.get('power.weariness.maxRise');
    const fall = t.get('power.weariness.maxFall');

    // From zero: whatever the target, one turn can only climb by maxRise.
    Game.getNation('06').weariness = 0;
    World.advanceTurn(t, rng);
    const up = Game.getNation('06').weariness;
    ok(up <= rise + 1e-9, `weariness rose ${up} in one turn, past its own cap of ${rise}`);

    // From one: whatever the target, one turn can only shed by maxFall.
    Game.getNation('06').weariness = 1;
    World.advanceTurn(t, rng);
    const down = 1 - Game.getNation('06').weariness;
    ok(down <= fall + 1e-9, `weariness fell ${down} in one turn, past its own cap of ${fall}`);
  });
});
