/*
 * M7.5 — who is actually in charge.
 *
 * A leader is a NAME, TWO TRAITS AND A DATE, and that is the whole system. The
 * five power stocks already explain themselves term by term, so a leader is one
 * extra named line in each stock they touch rather than a mechanism of their own.
 *
 * Everything else in this game is a number about a place. This is the one thing
 * that is about a person, and it is what makes "Nevada changed course" something
 * that happened to somebody rather than a shift in an ideology index.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('The table', () => {
  it('loads, and every trait is applicable', async () => {
    await bootWorld({ seed: SEED });
    ok(Leaders.loaded(), 'content/leaders.json did not load');
    const stocks = new Set(['authority', 'influence', 'qol', 'liberties', 'weariness', 'war']);
    const ids = new Set();
    for (const tr of Leaders.traits('06')) ok(tr.name && tr.blurb, 'a seated trait with no character');
    // Every trait in the file, reached through the one lookup the game uses.
    for (const id of ['hawk', 'conciliator', 'technocrat', 'orator', 'hardliner', 'reformer',
      'steward', 'financier', 'veteran', 'idealist', 'populist', 'caretaker']) {
      const tr = Leaders.traitOf(id);
      ok(tr, `the trait "${id}" is missing from content/leaders.json`);
      ok(!ids.has(id), `the trait "${id}" is defined twice`);
      ids.add(id);
      ok(tr.name && tr.blurb, `${id}: a trait with no name or no character`);
      ok(Object.keys(tr.effects || {}).length, `${id}: a trait that changes nothing`);
      for (const k of Object.keys(tr.effects)) {
        ok(stocks.has(k), `${id}: pulls on "${k}", which no stock reads`);
        ok(Math.abs(tr.effects[k]) <= 1, `${id}: ${k} is ${tr.effects[k]}, outside -1..1`);
      }
    }
  });

  it('no trait is all upside', async () => {
    /*
     * A leader who is simply better than another leader is a stat, not a
     * character. Every trait pays for what it gives — a Hawk buys Authority with
     * liberties and weariness, a Reformer buys liberties with Authority.
     */
    await bootWorld({ seed: SEED });
    const worseWhenUp = { weariness: true };
    for (const id of ['hawk', 'conciliator', 'technocrat', 'orator', 'hardliner', 'reformer',
      'steward', 'financier', 'veteran', 'idealist', 'populist']) {
      const tr = Leaders.traitOf(id);
      const costs = Object.entries(tr.effects).some(([k, v]) => (worseWhenUp[k] ? v > 0 : v < 0));
      ok(costs, `${tr.name} costs nothing at all`);
    }
  });
});

describe('Appointing one', () => {
  it('every nation has one before the first stock is computed', async () => {
    /*
     * Or the Leadership term reads an empty chair on turn 0 while its own note
     * names the person — which is what happened, because building the note
     * SEATED a leader as a side effect of describing one.
     */
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) {
      const l = Leaders.all()[nid];
      ok(l, `${Game.getNation(nid).name} has nobody in charge`);
      ok(l.name && l.title, 'a leader with no name or title');
      equal(l.traits.length, 2);
      ok(l.traits[0] !== l.traits[1], `${l.name} has the same trait twice`);
    }
  });

  it('and they are not all the same person', async () => {
    await bootWorld({ seed: SEED });
    const names = new Set(Object.values(Leaders.all()).map((l) => l.name));
    ok(names.size > Game.nations.size * 0.8,
      `${names.size} distinct names across ${Game.nations.size} nations`);
  });

  it('traits lean toward the government, without being certain', async () => {
    await bootWorld({ seed: SEED });
    let fitting = 0, total = 0;
    for (const [nid] of Game.nations) {
      const l = Leaders.all()[nid];
      const gov = Game.getNation(nid).gov.rulingIdeology;
      for (const id of l.traits) {
        total++;
        if ((Leaders.traitOf(id).affinity || []).includes(gov)) fitting++;
      }
    }
    const share = fitting / total;
    ok(share > 0.25, `only ${(share * 100).toFixed(0)}% of traits fit their government`);
    ok(share < 0.95, `${(share * 100).toFixed(0)}% of traits fit; nobody is ever off-brand`);
  });

  it('the draw is seeded, so a replay replays', async () => {
    const a = await bootWorld({ seed: SEED });
    const first = JSON.stringify(Leaders.serialize());
    const b = await bootWorld({ seed: SEED });
    equal(JSON.stringify(Leaders.serialize()), first, 'two identical games seated different people');
    ok(a && b);
  });
});

describe('What they change', () => {
  it('one named line in each stock they touch', async () => {
    await bootWorld({ seed: SEED });
    for (const [, n] of Game.nations) {
      for (const key of ['authority', 'influence', 'qol', 'liberties', 'weariness']) {
        const rec = n.why[key];
        ok(rec, `${n.name} has no ${key} record`);
        const t = rec.inputs.find((i) => i.label === 'Leadership');
        ok(t, `${key} does not say who is in charge`);
        ok(t.note && /—/.test(t.note), `the leadership term names nobody: "${t.note}"`);
      }
    }
  });

  it('and it is a thumb on the scale, not the scale', async () => {
    /*
     * A leader who swings a stock by a third makes every other term in it noise.
     */
    await bootWorld({ seed: SEED });
    for (const [, n] of Game.nations) {
      for (const key of ['authority', 'influence', 'qol', 'liberties', 'weariness']) {
        const t = n.why[key].inputs.find((i) => i.label === 'Leadership');
        ok(Math.abs(t.contribution) <= 0.09,
          `${n.name}: leadership moved ${key} by ${t.contribution.toFixed(3)}`);
      }
    }
  });

  it('a hawk fights better than a conciliator', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const target = Game.adjacentNations(nid)[0];
    const set = (traits) => { Leaders.all()[nid] = { name: 'Test', title: 'Governor', traits, since: 0 }; };
    set(['hawk', 'veteran']);
    const hawk = Military.warMultiplier(nid, [target], T());
    set(['conciliator', 'idealist']);
    const dove = Military.warMultiplier(nid, [target], T());
    ok(hawk < dove,
      `a hawk did not fight better than a conciliator (${hawk.toFixed(3)} vs ${dove.toFixed(3)})`);
  });

  it('two traits sum, so a hawkish reformer largely cancels', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const set = (traits) => { Leaders.all()[nid] = { name: 'Test', title: 'Governor', traits, since: 0 }; };
    set(['hardliner', 'caretaker']);
    const hard = Leaders.modifier(nid, 'liberties');
    set(['hardliner', 'reformer']);
    const mixed = Leaders.modifier(nid, 'liberties');
    ok(Math.abs(mixed) < Math.abs(hard),
      `a hardliner paired with a reformer was as repressive as one paired with a caretaker`);
  });

  it('reading them changes nothing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 4; i++) World.advanceTurn(T(), rng);
    const before = fingerprint();
    for (const [nid] of Game.nations) { Leaders.modifier(nid, 'authority'); Leaders.traits(nid); }
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `reading a leader changed ${k}`);
  });
});

describe('Changing one', () => {
  it('a new government is a new government', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).treasury = 1e15;
    const was = Leaders.all()[nid].name;
    const d = Game.nationDemographics(nid);
    const cur = Game.getNation(nid).gov.rulingIdeology;
    const pick = Ideology.all().map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .filter((o) => o.id !== cur && o.share >= T().get('gov.changeMinShare'))
      .sort((a, b) => b.share - a.share)[0];
    if (!pick) return;
    Moves.resolve({ type: 'govern', nid, ideology: pick.id }, RNG.create(5), T());
    ok(Leaders.all()[nid].name !== was,
      'the government changed course and the same person stayed in the chair');
    ok(Ledger.ofKind('leader').some((e) => e.subject === nid),
      'nobody wrote down that somebody new took office');
  });

  it('a term runs out', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '06';
    const was = Leaders.all()[nid].name;
    World.setTurn(T().get('leader.termTurns') + 1);
    Leaders.tick(T(), rng);
    ok(Leaders.all()[nid].name !== was, 'a leader served past the end of their term');
    equal(Leaders.all()[nid].since, World.getTurn());
  });

  it('and a seat belonging to nobody is not a seat', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '44';
    ok(Leaders.all()[nid]);
    Game.mergeInto([...Game.adjacentNations(nid)][0], nid);
    Leaders.tick(T(), rng);
    equal(Leaders.all()[nid], undefined, 'a nation that no longer exists still has a governor');
  });

  it('they survive a save and a load', async () => {
    const ctx = await bootWorld({ seed: SEED });
    const before = JSON.stringify(Leaders.serialize());
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    Leaders.reset();
    equal(Object.keys(Leaders.all()).length, 0);
    StateDoc.applyModel(doc);
    equal(JSON.stringify(Leaders.serialize()), before, 'the government was forgotten on load');
  });
});
