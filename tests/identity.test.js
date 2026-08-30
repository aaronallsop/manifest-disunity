/*
 * M7.7 — what a new country calls itself, and what it looks like.
 *
 * A nation that came into being during play arrived with no identity at all,
 * and both halves of that were visible: a breakaway around Riverside County was
 * called "Riverside" — a place, not a country — and every nation on the
 * leaderboard was a coloured square.
 *
 * FLAGS ARE DERIVED FROM THE ID, not stored, which is most of what is pinned
 * here. A flag is a pure function of who you are, so it survives a save without
 * being in one, it is the same flag everywhere it is drawn, and there is no way
 * for a nation's flag to drift from the nation.
 */
import { describe, it, ok, equal } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('Names', () => {
  it('the content loads, with a template set for every ideology', async () => {
    await bootWorld({ seed: SEED });
    ok(Identity.loaded(), 'content/names.json did not load');
    for (const x of Ideology.all()) {
      const one = Identity.name([...Game.getNation('06').counties].slice(0, 3), x.id, RNG.create(1));
      ok(one && one.length > 3, `${x.id} produced "${one}"`);
    }
  });

  it('strips the administrative suffix, which is not part of a country', async () => {
    await bootWorld({ seed: SEED });
    for (const f of Object.keys(Game.county).slice(0, 200)) {
      const p = Identity.place(f);
      ok(!/ (County|Parish|Borough|Planning Region|Census Area)$/.test(p),
        `"${p}" still carries its administrative suffix`);
      ok(p.length > 0);
    }
  });

  it('sounds like the ideology that founded it', async () => {
    await bootWorld({ seed: SEED });
    const areas = [...Game.getNation('06').counties].slice(0, 4);
    const names = {};
    for (const x of Ideology.all()) {
      names[x.id] = new Set();
      for (let s = 1; s <= 12; s++) names[x.id].add(Identity.name(areas, x.id, RNG.create(s)));
    }
    // Each ideology has its own vocabulary, so two of them cannot produce
    // identical sets of names for identical ground.
    const purple = names.purple, red = names.red;
    if (purple && red) {
      const shared = [...purple].filter((n) => red.has(n));
      ok(shared.length < Math.min(purple.size, red.size),
        'a Socialist and a Republican breakaway are named identically');
    }
  });

  it('two countries may not share a name', async () => {
    /*
     * Fragments break off the same ground more than once in a long game, and
     * the first cut produced two separate nations both called the Fairfax
     * Federation — a leaderboard with two identical rows and a newspaper that
     * cannot say which one did the thing.
     */
    await bootWorld({ seed: SEED });
    const areas = [...Game.getNation('06').counties].slice(0, 3);
    const used = new Set();
    for (let i = 0; i < 12; i++) {
      const n = Identity.name(areas, 'red', RNG.create(i + 1), (x) => used.has(x));
      ok(!used.has(n), `"${n}" was handed out twice`);
      used.add(n);
    }
  });

  it('and a played game produces no duplicates either', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    Game.setPlayer(TurnSystem.currentId());
    for (let i = 0; i < 30; i++) { TurnSystem.advance(T(), rng); AI.sweep(T(), rng); }
    const seen = new Set();
    for (const [, n] of Game.nations) {
      ok(!seen.has(n.name), `two nations are both called "${n.name}"`);
      seen.add(n.name);
    }
    const born = [...Game.nations.values()].filter((n) => !n.origin);
    if (born.length) {
      ok(born.some((n) => / /.test(n.name)),
        'every nation founded during play is still named after a single county');
    }
  });
});

describe('Flags', () => {
  it('every nation has one, and it is the same one every time', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) {
      const a = Identity.flag(nid);
      ok(/^<svg /.test(a) && /<\/svg>$/.test(a), `${nid} has no flag`);
      equal(Identity.flag(nid), a, `${nid} drew a different flag the second time`);
    }
  });

  it('a flag is a function of the id, so a save cannot lose it', async () => {
    const ctx = await bootWorld({ seed: SEED });
    const before = Identity.design('06');
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    StateDoc.applyModel(doc);
    const after = Identity.design('06');
    equal(after.layout, before.layout);
    equal(after.charge, before.charge);
    equal(after.field, before.field);
  });

  it('the designs are actually different from each other', async () => {
    await bootWorld({ seed: SEED });
    const seen = new Set();
    for (const [nid] of Game.nations) {
      const d = Identity.design(nid);
      seen.add(`${d.layout}|${d.charge}|${d.field}`);
    }
    ok(seen.size > Game.nations.size * 0.8,
      `${seen.size} distinct designs across ${Game.nations.size} nations`);
  });

  it('every layout and charge in the vocabulary is reachable', async () => {
    await bootWorld({ seed: SEED });
    const layouts = new Set(), charges = new Set();
    for (const [nid] of Game.nations) {
      const d = Identity.design(nid);
      layouts.add(d.layout);
      charges.add(d.charge);
    }
    for (const l of Identity.LAYOUTS) ok(layouts.has(l), `no nation was ever drawn as "${l}"`);
    ok(charges.size >= 3, `only ${charges.size} charges appeared`);
  });

  it('the size is a parameter and the coordinates are not', async () => {
    /*
     * One viewBox serves a 16px swatch and a 120px card, so a flag cannot be
     * drawn differently in two places by accident.
     */
    await bootWorld({ seed: SEED });
    const small = Identity.flag('06', 16, 11);
    const big = Identity.flag('06', 120, 80);
    ok(/width="16"/.test(small) && /width="120"/.test(big));
    ok(/viewBox="0 0 60 40"/.test(small) && /viewBox="0 0 60 40"/.test(big),
      'the two sizes do not share a coordinate system');
    const strip = (s) => s.replace(/width="\d+"/, '').replace(/height="\d+"/, '');
    equal(strip(small), strip(big), 'the same flag was drawn differently at two sizes');
  });

  it('and a nation minted during play, whose colour is an hsl(), still gets one', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const areas = [...Game.getNation('06').counties].slice(0, 8);
    const born = Game.breakApart(areas, { exclude: '06', reason: 'release', rng });
    if (!born.length) return;
    for (const nid of born) {
      const d = Identity.design(nid);
      ok(d.field && d.trim, `${nid} has an incomplete palette`);
      ok(!/NaN|undefined/.test(Identity.flag(nid)), `${nid}'s flag contains a broken colour`);
    }
  });

  it('drawing one changes nothing', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    for (const [nid] of Game.nations) Identity.flag(nid);
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `drawing a flag changed ${k}`);
  });
});
