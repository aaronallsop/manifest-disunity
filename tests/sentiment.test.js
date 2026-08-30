/*
 * M4.2 — phaseSentiment, with all six factors.
 *
 *   target = clamp01( base * (grievance + pull) - suppression )
 *
 * Two properties matter more than any weight, and most of this file is about
 * them:
 *
 *   BASE IS MULTIPLICATIVE. An Area that does not share the ideology cannot be
 *   radicalised into that movement however badly it is governed. Additive
 *   grievance would let bad government alone produce any movement anywhere,
 *   which collapses twenty-four regional factions into one national discontent
 *   meter — so the test is not "does base help" but "does zero base make
 *   everything else irrelevant".
 *
 *   PULL IS THE DIFFUSION TERM, and it is the whole reason a movement can reach
 *   an Area it was never seeded in. It must read SNAP: reading `next` would let
 *   a movement cross the map in one turn in whatever order the loop ran.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, bufPop } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** A well-governed, ideologically-friendly, undisturbed Area. */
const inputs = (over = {}) => ({
  base: 1, qol: 1, liberties: 1, nationPower: 1, authority: 1,
  neighbourSum: 0, occupied: 0, cap: null, ...over,
});

describe('The sentiment target', () => {
  it('a perfectly-governed, unpressured Area wants nothing', async () => {
    await bootWorld({ seed: SEED });
    close(Sentiment.target(inputs(), T(), true).value, 0, 1e-12,
      'a nation that feeds, frees and protects its people still breeds separatists');
  });

  it('base is MULTIPLICATIVE: no affinity, no movement, however bad things are', async () => {
    await bootWorld({ seed: SEED });
    const misgoverned = { qol: 0, liberties: 0, nationPower: 0, authority: 0, neighbourSum: 3 };
    const aligned = Sentiment.target(inputs({ base: 1, ...misgoverned }), T(), true);
    const hostile = Sentiment.target(inputs({ base: 0, ...misgoverned }), T(), true);
    ok(aligned.value > 0.3, `an aligned, misgoverned Area only reached ${aligned.value.toFixed(3)}`);
    equal(hostile.value, 0,
      'an ideologically hostile Area was radicalised anyway; base is being added, not multiplied');
    // and halfway between is halfway
    const half = Sentiment.target(inputs({ base: 0.5, ...misgoverned }), T(), true);
    close(half.raw, aligned.raw * 0.5, 1e-9, 'base does not scale the whole grievance');
  });

  it('every grievance term pushes the same way, and each is reported', async () => {
    await bootWorld({ seed: SEED });
    const good = Sentiment.target(inputs(), T(), true);
    for (const [field, label] of [['qol', 'Quality of life'], ['liberties', 'Civil liberties'],
                                  ['nationPower', 'A weak nation'], ['authority', 'Weak authority']]) {
      const bad = Sentiment.target(inputs({ [field]: 0 }), T(), true);
      ok(bad.value > good.value, `${label} at zero did not raise sentiment`);
      const row = bad.inputs.find((i) => i.label === label);
      ok(row && row.contribution > 0, `${label} is not reported as a contribution`);
      ok(T().peek(row.key) !== undefined, `${label} names unknown tunable ${row.key}`);
      ok(row.note && row.note.length > 8, `${label} has no note`);
    }
  });

  it('pull rises with neighbours but saturates — a frontier, not a multiplier', async () => {
    await bootWorld({ seed: SEED });
    const at = (n) => Sentiment.target(inputs({ neighbourSum: n }), T(), true).pull;
    ok(at(0.5) > at(0), 'one committed neighbour did nothing');
    ok(at(3) > at(0.5));
    // the tenth neighbour is worth far less than the first
    ok(at(1) - at(0.5) > at(6) - at(5.5),
      'pull is linear in the number of friends; a movement should spread along a frontier');
    ok(at(50) <= T().get('sent.wPull') + 1e-9, 'pull exceeded its own weight');
  });

  it('suppression is subtracted AFTER the multiplier', async () => {
    /*
     * A garrison holds ground down whatever the population thinks of it, so it
     * cannot be inside the term that base scales.
     */
    await bootWorld({ seed: SEED });
    const free = Sentiment.target(inputs({ qol: 0, liberties: 0, occupied: 0 }), T(), true);
    const held = Sentiment.target(inputs({ qol: 0, liberties: 0, occupied: 1 }), T(), true);
    ok(held.raw < free.raw, 'occupation did not suppress anything');
    close(free.raw - held.raw, Math.abs(T().get('sent.wSuppression')), 1e-9,
      'suppression was scaled by base; it should be a flat subtraction');
    ok(/occupation/i.test(held.summary), `the summary of an occupied Area reads "${held.summary}"`);
  });

  it('the per-movement cap binds the target', async () => {
    await bootWorld({ seed: SEED });
    const wild = inputs({ qol: 0, liberties: 0, nationPower: 0, authority: 0, neighbourSum: 5 });
    ok(Sentiment.target(wild, T(), true).value > 0.4);
    close(Sentiment.target({ ...wild, cap: 0.25 }, T(), true).value, 0.25, 1e-12, 'the cap did not bind');
  });

  it('says plainly when a place is out of reach', async () => {
    await bootWorld({ seed: SEED });
    const r = Sentiment.target(inputs({ base: 0.1, qol: 0, liberties: 0 }), T(), true);
    ok(/out of reach/i.test(r.summary), `the summary reads "${r.summary}"`);
  });
});

describe('The phase', () => {
  it('a movement spreads from its seed across its homeland', async () => {
    /*
     * The whole point of `pull`. Before M4.2 a movement existed only where it
     * was planted — measured over 60 turns, every movement's Area count was
     * exactly its turn-0 count.
     */
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    const seeded = Movements.strength('Deseret').areas;
    equal(seeded, rec.seed.length, 'Deseret did not start on its seed');
    ok(seeded < rec.homeland.length, 'Deseret was seeded across its whole homeland');

    for (let i = 0; i < 60; i++) World.advanceTurn(T(), rng);
    const now = Movements.strength('Deseret').areas;
    ok(now > seeded * 2,
      `Deseret went from ${seeded} Areas to ${now} of a possible ${rec.homeland.length}; ` +
      'the diffusion term is not carrying it');
  });

  it('but never outside its homeland, however strong the pull next door', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 60; i++) World.advanceTurn(T(), rng);
    for (const rec of Movements.all()) {
      const home = new Set(rec.homeland);
      for (const f in Game.county) {
        if (Game.county[f].mov[rec.name] > 0 && !home.has(f)) {
          ok(false, `${rec.name} appeared in ${f}, which is outside its homeland`);
        }
      }
    }
    ok(true);
  });

  it('reads neighbours from SNAP, so spreading is order-independent', async () => {
    /*
     * Reading `next` would let a movement cross the map in one turn in whatever
     * order the loop happened to run. The check: one phase call cannot move any
     * Area by more than the per-turn cap, which is only true if the neighbour
     * shares it read were all start-of-turn values.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), rng);
    const owners = World.snapshotOwners();
    const snap = World.buffer(), nxt = World.buffer();
    World.phaseSentiment(snap, nxt, T(), owners);

    const rise = T().get('sent.maxRise'), fall = T().get('sent.maxFall');
    let worst = 0, where = null;
    for (let f = 0; f < nxt.n; f++) {
      const pop = bufPop(snap, f);
      if (pop <= 0) continue;
      const names = new Set([...Object.keys(snap.mov[f]), ...Object.keys(nxt.mov[f])]);
      for (const m of names) {
        const a = (snap.mov[f][m] || 0) / pop;
        const b = (nxt.mov[f][m] || 0) / bufPop(nxt, f);
        const d = b - a;
        if (d > worst) { worst = d; where = `${nxt.idAt(f)}/${m}`; }
        ok(d <= rise + 1e-6, `${nxt.idAt(f)} ${m} rose ${d.toFixed(4)} in one turn (cap ${rise})`);
        ok(d >= -fall - 1e-6, `${nxt.idAt(f)} ${m} fell ${(-d).toFixed(4)} in one turn (cap ${fall})`);
      }
    }
    ok(worst > 0, `nothing moved at all; where=${where}`);
  });

  it('conserves every Area total — it converts people, it does not create them', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 10; i++) World.advanceTurn(T(), rng);
    const owners = World.snapshotOwners();
    const snap = World.buffer(), nxt = World.buffer();
    const before = [];
    for (let i = 0; i < snap.n; i++) before[i] = bufPop(snap, i);
    World.phaseSentiment(snap, nxt, T(), owners);
    for (let i = 0; i < nxt.n; i++) {
      close(bufPop(nxt, i), before[i], 1e-6, `sentiment changed the population of ${nxt.idAt(i)}`);
    }
  });

  it('keeps every movement a valid slice of its own ideology', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
    const N = Ideology.count();
    for (const f in Game.county) {
      const c = Game.county[f];
      const by = new Array(N).fill(0);
      for (const m in c.mov) by[Movements.ideologyIndexOf(m)] += c.mov[m];
      for (let i = 0; i < N; i++) {
        ok(by[i] <= c.pop[i] + 1e-6,
          `${f}: ${Ideology.idAt(i)} holds ${c.pop[i]} but its movements claim ${by[i]}`);
      }
    }
  });

  it('discriminates: not every movement grows', async () => {
    /*
     * A model in which everything rises is a model with one dial. Some movements
     * should be in places that are well governed and ideologically unfriendly,
     * and should lose ground.
     */
    const { rng } = await bootWorld({ seed: SEED });
    const before = new Map(Movements.all().map((r) => [r.name, Movements.strength(r.name).peak]));
    for (let i = 0; i < 60; i++) World.advanceTurn(T(), rng);
    let up = 0, down = 0;
    for (const [name, was] of before) {
      const now = Movements.strength(name).peak;
      if (now > was + 0.01) up++;
      else if (now < was - 0.01) down++;
    }
    ok(up >= 3, `only ${up} movements gained ground in 60 turns`);
    ok(down >= 1, `every movement gained ground; the model has one dial, not six factors`);
  });

  it('a movement reaches its core and declares', async () => {
    // The shape M4.3 tier 2 fires on, and the M4 acceptance in miniature.
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 60; i++) World.advanceTurn(T(), rng);
    Movements.refreshStates(T());
    // 'declared' is transient: the secession phase turns a declared movement
    // into a realized one on the same turn it fires, so the durable observable
    // is that SOMETHING got all the way through.
    const states = Movements.all().map((r) => r.state);
    ok(states.includes('declared') || states.includes('realized'),
      `after 60 turns no movement has taken its core; states are ${[...new Set(states)]}`);
  });
});

describe('The explanation', () => {
  it('is the same function the phase runs, not a second implementation', async () => {
    /*
     * `explain()` recomputes rather than remembering, which is what stops it
     * being a drifting copy. The check is that it reproduces the target the
     * phase would compute for the same Area and movement.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 25; i++) World.advanceTurn(T(), rng);
    const rec = Movements.get('Deseret');
    const held = rec.homeland.filter((f) => Game.county[f].mov.Deseret > 0);
    ok(held.length > 0, 'Deseret holds nothing to explain');

    for (const f of held.slice(0, 5)) {
      const why = Sentiment.explain(f, 'Deseret', T());
      ok(why, `no explanation for ${f}`);
      equal(why.area, f);
      equal(why.movement, 'Deseret');
      // Six until M7.3 added war weariness, the second place a long campaign is
      // felt at home. The count is asserted rather than inferred so that a term
      // added without a reason is a failing test rather than a silent widening.
      ok(why.inputs.length === 7, `${f}: ${why.inputs.length} factors reported, expected 7`);
      // the reported contributions really do add up to the reported total
      let sum = 0;
      for (const i of why.inputs) if (i.label !== 'Suppression') sum += i.contribution;
      const supp = why.inputs.find((i) => i.label === 'Suppression').contribution;
      close(why.raw, why.base * sum + supp, 1e-9,
        'the factors printed do not reconstruct the number printed beside them');
      ok(why.summary && why.summary.length > 10);
      ok(why.current >= 0 && why.current <= 1);
    }
  });

  it('returns null rather than throwing for a movement that is not in the game', async () => {
    await bootWorld({ seed: SEED });
    equal(Sentiment.explain('49035', 'The Whig Revival', T()), null);
    equal(Sentiment.explain('nowhere', 'Deseret', T()), null);
  });
});
