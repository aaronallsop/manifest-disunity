/*
 * M2.2 — the six ideologies.
 *
 * `lean: dem >= gop ? 'D' : 'R'` was a binary enum used as a control-flow key,
 * answered with `===` by four separate game decisions across eight files. It is
 * gone. What replaced it is one number:
 *
 *     affinity(a, b) = 1 - distance(a, b) / MAX_DISTANCE
 *
 * Coalitions, drift attraction, defection targets, splinter direction and civil
 * war severity all derive from it, so the properties below are not decoration —
 * they are the contract the rest of the model is written against. If affinity
 * stops being symmetric, or stops reaching 1 and 0 at the ends, half a dozen
 * thresholds tuned in M5 silently come to mean something else.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, recPop } from './world-fixture.js';

const SEED = 20260829;
const IDS = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];

describe('The ideology table', () => {
  it('is the six from the plan, in canonical order, at the authored coordinates', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    ok(raw.ideologies, 'content/ideologies.json did not load — the FALLBACK is being tested');
    equal(Ideology.count(), 6);
    equal(Ideology.all().map((x) => x.id).join(','), IDS.join(','));

    // the coordinates are the contract; a typo here quietly re-tunes everything
    const at = (id) => Ideology.byId(id);
    close(at('red').economic, 0.6, 1e-12); close(at('red').social, 0.2, 1e-12);
    close(at('blue').economic, 0.3, 1e-12); close(at('blue').social, -0.4, 1e-12);
    close(at('green').economic, -0.6, 1e-12); close(at('green').social, -0.7, 1e-12);
    close(at('yellow').economic, 0.5, 1e-12); close(at('yellow').social, 0.7, 1e-12);
    close(at('orange').economic, -0.4, 1e-12); close(at('orange').social, 0.6, 1e-12);
    close(at('purple').economic, -0.8, 1e-12); close(at('purple').social, -0.2, 1e-12);
  });

  it('gives every ideology a name, a short label and a distinct colour', async () => {
    await bootWorld({ seed: SEED });
    const colors = new Set();
    for (const x of Ideology.all()) {
      ok(x.name && x.name.length > 2, `${x.id} has no display name`);
      ok(x.short && x.short.length <= 5, `${x.id} has no short label`);
      ok(/^#[0-9a-f]{6}$/i.test(x.color), `${x.id} colour "${x.color}" is not a hex triple`);
      colors.add(x.color.toLowerCase());
    }
    equal(colors.size, 6, 'two ideologies share a colour; the political map cannot tell them apart');
  });

  it('index/idAt round-trip, and an unknown id is -1 rather than 0', async () => {
    await bootWorld({ seed: SEED });
    for (let i = 0; i < Ideology.count(); i++) equal(Ideology.index(Ideology.idAt(i)), i);
    equal(Ideology.index('whig'), -1, 'an unknown id resolved to a real ideology');
    equal(Ideology.index('other'), -1, '"Other" is a data artifact, not an ideology');
    equal(Ideology.idAt(99), null);
  });
});

describe('Affinity', () => {
  it('is symmetric, and 1 with itself', async () => {
    await bootWorld({ seed: SEED });
    for (const a of IDS) {
      close(Ideology.affinity(a, a), 1, 1e-12, `${a} is not perfectly aligned with itself`);
      for (const b of IDS) {
        close(Ideology.affinity(a, b), Ideology.affinity(b, a), 1e-12,
          `affinity(${a},${b}) is not symmetric`);
      }
    }
  });

  it('lands in 0..1 for every pair, reaching exactly 0 at the widest', async () => {
    await bootWorld({ seed: SEED });
    let worst = { v: 2, pair: null };
    for (const a of IDS) {
      for (const b of IDS) {
        const v = Ideology.affinity(a, b);
        ok(v >= -1e-12 && v <= 1 + 1e-12, `affinity(${a},${b}) = ${v} is outside 0..1`);
        if (v < worst.v) worst = { v, pair: `${a}/${b}` };
      }
    }
    close(worst.v, 0, 1e-12,
      `the widest pair (${worst.pair}) scores ${worst.v}; maxDistance is not the actual maximum`);
  });

  it('normalises on the REAL maximum, not the theoretical corner-to-corner one', async () => {
    await bootWorld({ seed: SEED });
    // 2*sqrt(2) = 2.8284 is the diagonal of the [-1,1] square. No authored pair is
    // anywhere near it, so normalising on it would squash every affinity into the
    // top third of the range and make every M5 threshold mean less than it says.
    let max = 0;
    for (const a of Ideology.all()) {
      for (const b of Ideology.all()) max = Math.max(max, Ideology.distance(a, b));
    }
    close(Ideology.maxDistance(), max, 1e-12, 'maxDistance is not the largest authored pair distance');
    ok(max < 2, `the widest pair is ${max.toFixed(4)}, well inside the theoretical 2.8284`);
    // green (-0.6, -0.7) to yellow (0.5, 0.7) is the widest authored pair, at 1.7804
    close(max, Math.hypot(1.1, 1.4), 1e-12);
  });

  it('ranks the pairs the way the ideologies read', async () => {
    await bootWorld({ seed: SEED });
    const A = (a, b) => Ideology.affinity(a, b);
    ok(A('red', 'blue') > A('red', 'purple'), 'Republicans are closer to Socialists than to Democrats');
    ok(A('red', 'yellow') > A('red', 'green'),
      'Republicans are closer to Democratic Socialists than to Conservative Nationalists');
    ok(A('green', 'purple') > A('green', 'yellow'),
      'the two left ideologies are further apart than the left and the nationalist right');
    ok(A('orange', 'yellow') > A('orange', 'blue'),
      'Distributists are closer to Democrats than to Conservative Nationalists');
    // the socially AND economically opposed pair is the far end of the scale
    equal(A('green', 'yellow'), 0, 'the widest pair is not green/yellow');
  });

  it('separates the two axes, so trade alignment and moral alignment can differ', async () => {
    await bootWorld({ seed: SEED });
    // red (0.6, 0.2) and yellow (0.5, 0.7): near-identical on economics, apart socially
    close(Ideology.axisDistance('red', 'yellow', 'economic'), 0.1, 1e-12);
    close(Ideology.axisDistance('red', 'yellow', 'social'), 0.5, 1e-12);
    ok(Ideology.axisDistance('red', 'yellow', 'economic') < Ideology.axisDistance('red', 'yellow', 'social'),
      'the axes are not being read independently');
  });
});

describe('Mixes', () => {
  it('shares are percentages summing to 100, and a dead Area returns zeroes rather than NaN', async () => {
    await bootWorld({ seed: SEED });
    const mix = Ideology.zeroMix();
    equal(mix.length, 6);
    for (const v of Ideology.shares(mix)) equal(v, 0, 'an empty mix produced a non-zero share');
    equal(Ideology.dominantIndex(mix), -1, 'an empty mix claims a dominant ideology');
    equal(Ideology.total(mix), 0);
    const c0 = Ideology.centroid(mix);
    ok(Number.isFinite(c0.economic) && Number.isFinite(c0.social), 'an empty mix produced a NaN centroid');

    mix[0] = 300; mix[1] = 500; mix[3] = 200;
    close(Ideology.shares(mix).reduce((a, b) => a + b, 0), 100, 1e-12); // percentages, not fractions
    equal(Ideology.dominantIndex(mix), 1);
    equal(Ideology.dominantId(mix), 'blue');
  });

  it('the centroid of a pure mix is that ideology exactly', async () => {
    await bootWorld({ seed: SEED });
    for (let i = 0; i < 6; i++) {
      const mix = Ideology.zeroMix();
      mix[i] = 1234;
      const c = Ideology.centroid(mix);
      close(c.economic, Ideology.byIndex(i).economic, 1e-12);
      close(c.social, Ideology.byIndex(i).social, 1e-12);
      close(Ideology.cohesion(mix), 1, 1e-12, 'a single-ideology population is not perfectly cohesive');
    }
  });

  it('cohesion falls from 1 to 0 as a population spreads out', async () => {
    await bootWorld({ seed: SEED });
    const pure = Ideology.zeroMix(); pure[0] = 100;
    const two = Ideology.zeroMix(); two[0] = 50; two[1] = 50;
    const even = Ideology.zeroMix().map(() => 100);
    ok(Ideology.cohesion(pure) > Ideology.cohesion(two), 'a split population is as cohesive as a united one');
    ok(Ideology.cohesion(two) > Ideology.cohesion(even), 'cohesion does not fall as the split widens');
    close(Ideology.cohesion(even), 0, 1e-12, 'a perfectly even six-way split is not zero cohesion');
  });

  it('mixAffinity reads two populations, not two points', async () => {
    await bootWorld({ seed: SEED });
    const a = Ideology.zeroMix(); a[Ideology.index('red')] = 100;
    const b = Ideology.zeroMix(); b[Ideology.index('red')] = 100;
    close(Ideology.mixAffinity(a, b), 1, 1e-12, 'two identical populations are not perfectly aligned');
    const c = Ideology.zeroMix(); c[Ideology.index('purple')] = 100;
    ok(Ideology.mixAffinity(a, c) < Ideology.mixAffinity(a, b),
      'a Republican and a Socialist nation are as aligned as two Republican ones');
    // a half-and-half nation sits between the two ends it is made of
    const mid = Ideology.zeroMix();
    mid[Ideology.index('red')] = 50; mid[Ideology.index('purple')] = 50;
    const toRed = Ideology.mixAffinity(mid, a);
    ok(toRed > Ideology.mixAffinity(c, a) && toRed < 1,
      'a half-and-half nation does not sit between the two ideologies it is made of');
  });
});

describe('The 2024 "Other" residual', () => {
  it('splits across the four minority ideologies only, never back into red or blue', async () => {
    await bootWorld({ seed: SEED });
    for (const region of [null, 'default', 'Deep South', 'New England', 'not-a-region']) {
      const w = Ideology.otherWeights(region);
      close(w.reduce((a, b) => a + b, 0), 1, 1e-12, `${region}: weights do not sum to 1`);
      equal(w[Ideology.index('red')], 0, `${region}: Other leaked back into Republican`);
      equal(w[Ideology.index('blue')], 0, `${region}: Other leaked back into Democrat`);
    }
  });

  it('every region key is a real cultural region naming real ideologies', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    const doc = raw.ideologies;
    ok(doc.otherSplit && doc.otherSplit.default, 'there is no default split');

    // the live model is the authority on which region names exist
    const known = new Set();
    for (const f in Game.county) {
      const r = Game.county[f].attrs && Game.county[f].attrs.culture;
      if (r) known.add(r);
    }
    ok(known.size > 0, 'no Area carries a cultural region; the split cannot be keyed on one');

    for (const [region, table] of Object.entries(doc.otherSplit)) {
      if (region === 'default') continue;
      ok(known.has(region),
        `otherSplit names "${region}", which no Area belongs to — a typo, or a stale region name`);
      let sum = 0;
      for (const [id, v] of Object.entries(table)) {
        ok(Ideology.index(id) >= 0, `otherSplit["${region}"] names unknown ideology "${id}"`);
        ok(id !== 'red' && id !== 'blue', `otherSplit["${region}"] splits Other back into "${id}"`);
        ok(v >= 0, `otherSplit["${region}"].${id} is negative`);
        sum += v;
      }
      ok(sum > 0, `otherSplit["${region}"] is all zeroes`);
    }
  });

  it('covers every cultural region the map actually uses', async () => {
    await bootWorld({ seed: SEED });
    const named = new Set(Ideology.otherSplitRegions());
    const used = new Set();
    for (const f in Game.county) {
      const r = Game.county[f].attrs && Game.county[f].attrs.culture;
      if (r) used.add(r);
    }
    const missing = [...used].filter((r) => !named.has(r));
    equal(missing.length, 0,
      `${missing.length} cultural regions fall through to the flat default split: ${missing.join(', ')}`);
  });

  it('gives regions genuinely different textures — the table is not decorative', async () => {
    await bootWorld({ seed: SEED });
    const g = Ideology.index('green'), y = Ideology.index('yellow');
    const ne = Ideology.otherWeights('New England');
    const ms = Ideology.otherWeights('Mormon Corridor');
    ok(ne[g] > ms[g] * 3, 'New England and the Mormon Corridor split Other into the same left share');
    ok(ms[y] > ne[y] * 3, 'the Mormon Corridor and New England split Other into the same nationalist share');
  });
});

describe('The loaded world', () => {
  it('every Area carries a six-slot mix that sums to its population', async () => {
    await bootWorld({ seed: SEED, spawnParties: false });
    let checked = 0;
    for (const f in Game.county) {
      const c = Game.county[f];
      equal(c.pop.length, 6, `Area ${f} has ${c.pop.length} ideology slots`);
      for (let i = 0; i < 6; i++) ok(c.pop[i] >= 0, `Area ${f} holds ${c.pop[i]} ${Ideology.idAt(i)}`);
      close(Game.countyPop(f), recPop(c), 1e-9, `Area ${f}: the accessor and the record disagree`);
      checked++;
    }
    ok(checked > 1600, `only ${checked} Areas were checked`);
  });

  it('all six ideologies hold real population somewhere on the map', async () => {
    await bootWorld({ seed: SEED, spawnParties: false });
    const totals = new Array(6).fill(0);
    for (const f in Game.county) for (let i = 0; i < 6; i++) totals[i] += Game.county[f].pop[i];
    const world = totals.reduce((a, b) => a + b, 0);
    for (let i = 0; i < 6; i++) ok(totals[i] > 0, `${Ideology.idAt(i)} holds nobody in the whole country`);
    // the two mainstream parties dominate before any movement seeding
    const main = (totals[0] + totals[1]) / world;
    ok(main > 0.9,
      `red+blue are only ${(main * 100).toFixed(1)}% of the country at load; the 2024 result says ~96%`);
  });

  it('demographics reports a mix, not a letter', async () => {
    await bootWorld({ seed: SEED });
    const d = Game.nationDemographics('49'); // Utah
    equal(d.lean, undefined, 'the D/R lean letter is still being published');
    equal(d.mix.length, 6);
    close(d.shares.reduce((a, b) => a + b, 0), 100, 1e-9);
    close(Ideology.total(d.mix), d.pop, 1e-6, 'the mix and the headline population disagree');
    equal(d.dominantId, 'red', `Utah's leading ideology is ${d.dominantId}`);
    ok(d.cohesion > 0 && d.cohesion < 1);
    ok(Number.isFinite(d.centroid.economic) && Number.isFinite(d.centroid.social));
  });

  it('the residual really was split by region, not flatly', async () => {
    await bootWorld({ seed: SEED, spawnParties: false });
    // Utah is Mormon Corridor (nationalist-heavy Other); Vermont is New England (left-heavy).
    const nationalistShareOfMinority = (nid) => {
      const d = Game.nationDemographics(nid);
      const y = d.mix[Ideology.index('yellow')], g = d.mix[Ideology.index('green')];
      return y / (y + g);
    };
    const ut = nationalistShareOfMinority('49'), vt = nationalistShareOfMinority('50');
    ok(ut > vt * 2,
      `Utah's Other is ${(ut * 100).toFixed(0)}% nationalist against Vermont's ${(vt * 100).toFixed(0)}%; ` +
      'the region-keyed split is not reaching the model');
  });
});
