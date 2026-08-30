/*
 * M7.4 — crises, as a table.
 *
 * A six-second toast and the turn-summary newspaper were the whole narrative
 * surface of this game. An event is the first thing in it that asks the player a
 * QUESTION — two or three options, each with a real cost, and no option that is
 * simply correct.
 *
 * IT INVENTS NO MECHANICS, and that is the constraint most of this file checks:
 * every trigger reads a fact some other system already computes, and every
 * effect moves a number some other system already owns. So `content/events.json`
 * is content, and a new crisis is a row rather than a code path.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('The table', () => {
  it('loads, and every row is playable', async () => {
    await bootWorld({ seed: SEED });
    ok(Events.loaded(), 'content/events.json did not load');
    const facts = Events.facts('06', T());
    for (const e of Events.all()) {
      ok(e.id && e.title && e.text, `${e.id}: a crisis with no story`);
      ok(e.options.length >= 2 && e.options.length <= 3,
        `${e.id} offers ${e.options.length} options; a question with one answer is a button`);
      for (const o of e.options) {
        ok(o.label, `${e.id}: an option with no label`);
        ok(o.effects && Object.keys(o.effects).length,
          `${e.id}/${o.label}: an option that costs and gives nothing`);
        for (const k of Object.keys(o.effects)) {
          ok(Events.EFFECTS[k], `${e.id}/${o.label}: "${k}" is not an effect this game knows how to apply`);
        }
      }
      // Triggers may only read facts the model already computes.
      for (const k of Object.keys(e.when || {})) {
        ok(facts[k] !== undefined, `${e.id}: triggers on "${k}", which is not a fact`);
      }
    }
  });

  it('every id is distinct, so the cooldown can find it', async () => {
    await bootWorld({ seed: SEED });
    const seen = new Set();
    for (const e of Events.all()) {
      ok(!seen.has(e.id), `two crises share the id "${e.id}"`);
      seen.add(e.id);
    }
  });

  it('no option is strictly better than another', async () => {
    /*
     * An option that beats another on every axis is a button wearing a choice's
     * clothes. Checked structurally: for any two options of the same crisis,
     * neither may dominate on every effect they have in common while having no
     * cost of its own.
     */
    await bootWorld({ seed: SEED });
    const worseWhenUp = { weariness: true, sentiment: true };
    const better = (a, b) => {
      const keys = new Set([...Object.keys(a.effects), ...Object.keys(b.effects)]);
      let strictlyBetter = false;
      for (const k of keys) {
        const av = (a.effects[k] || 0) * (worseWhenUp[k] ? -1 : 1);
        const bv = (b.effects[k] || 0) * (worseWhenUp[k] ? -1 : 1);
        if (av < bv) return false;
        if (av > bv) strictlyBetter = true;
      }
      return strictlyBetter;
    };
    for (const e of Events.all()) {
      for (const a of e.options) {
        for (const b of e.options) {
          if (a === b) continue;
          ok(!better(a, b), `${e.id}: "${a.label}" is strictly better than "${b.label}"`);
        }
      }
    }
  });
});

describe('Triggering', () => {
  it('a crisis fires only when its condition holds', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = Game.getNation(nid);
    World.setTurn(20);
    n.qol = 0.95;
    ok(!Events.candidates(nid, T()).some((e) => e.id === 'harvest-fails'),
      'a well-fed nation drew a harvest failure');
    n.qol = 0.3;
    ok(Events.candidates(nid, T()).some((e) => e.id === 'harvest-fails'),
      'a hungry nation drew no harvest failure');
  });

  it('and not before its earliest turn', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).qol = 0.3;
    World.setTurn(0);
    ok(!Events.candidates(nid, T()).some((e) => e.id === 'harvest-fails'),
      'a crisis fired on turn 0, before the player has done anything');
  });

  it('a nation is not given a crisis every turn', async () => {
    /*
     * A country that has a crisis every turn is not having crises, it is having
     * weather.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    World.setTurn(20);
    Game.getNation(nid).qol = 0.3;
    const rng = RNG.create(1);
    const first = Events.draw(nid, rng, T());
    ok(first, 'nothing was drawn for a nation in obvious trouble');
    Events.resolve(nid, first, first.options[0], T());
    equal(Events.draw(nid, rng, T()), null, 'the same nation drew again immediately');
  });

  it('and does not relive the same one', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    World.setTurn(20);
    Game.getNation(nid).qol = 0.3;
    const e = Events.all().find((x) => x.id === 'harvest-fails');
    Events.resolve(nid, e, e.options[0], T());
    World.setTurn(20 + T().get('events.cooldownTurns') + 1);
    ok(!Events.candidates(nid, T()).some((x) => x.id === 'harvest-fails'),
      'the same crisis came back before events.repeatTurns');
    World.setTurn(20 + T().get('events.repeatTurns') + 1);
    ok(Events.candidates(nid, T()).some((x) => x.id === 'harvest-fails'),
      'the crisis never came back at all');
  });

  it('the draw is seeded, so a replay replays', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    World.setTurn(20);
    Game.getNation(nid).qol = 0.3;
    Game.getNation(nid).weariness = 0.6;
    const a = Events.draw(nid, RNG.create(7), T());
    const b = Events.draw(nid, RNG.create(7), T());
    equal(a && a.id, b && b.id, 'the same seed drew two different crises');
  });
});

describe('Answering', () => {
  it('the effects are exactly what the option promised', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = Game.getNation(nid);
    n.qol = 0.5; n.influence = 0.5;
    const before = { qol: n.qol, influence: n.influence };
    const applied = Events.apply(nid, { qol: -0.04, influence: 0.04 }, T());
    close(n.qol, before.qol - 0.04, 1e-9, 'quality of life did not move as promised');
    close(n.influence, before.influence + 0.04, 1e-9, 'influence did not move as promised');
    equal(applied.length, 2);
  });

  it('the treasury effect is a share of income, not a flat sum', async () => {
    /*
     * So the same crisis means the same thing to Wyoming and to California.
     */
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '50']) {
      const n = Game.getNation(nid);
      const income = Game.treasuryFlow(nid).income;
      const before = n.treasury;
      Events.apply(nid, { treasuryShare: -0.25 }, T());
      close(before - n.treasury, income * 0.25, 1e-6, `${nid}: the bill was not a share of income`);
    }
  });

  it('a sentiment effect grows what is there and invents nothing', async () => {
    /*
     * A crisis gives an existing argument more people; it does not invent a
     * separatist tradition where there was none.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 5; i++) World.advanceTurn(T(), rng);
    const nid = [...Game.nations.keys()].find((id) => {
      for (const f of Game.getNation(id).counties) {
        if (Object.keys(Game.county[f].mov || {}).length) return true;
      }
      return false;
    });
    ok(nid, 'no nation has a movement in it at all');
    const empty = [...Game.getNation(nid).counties]
      .filter((f) => !Object.keys(Game.county[f].mov || {}).length);
    const before = new Map(empty.map((f) => [f, Object.keys(Game.county[f].mov || {}).length]));
    let held = 0;
    for (const f of Game.getNation(nid).counties) {
      for (const m in Game.county[f].mov) held += Game.county[f].mov[m];
    }
    Events.apply(nid, { sentiment: 0.05 }, T());
    let after = 0;
    for (const f of Game.getNation(nid).counties) {
      for (const m in Game.county[f].mov) after += Game.county[f].mov[m];
    }
    ok(after > held, 'a crisis moved no sentiment at all');
    for (const [f, n0] of before) {
      equal(Object.keys(Game.county[f].mov || {}).length, n0,
        'a crisis invented a movement in an Area that had none');
    }
  });

  it('a standing effect reaches the neighbours, in the M7.1 list', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const neighbours = Game.adjacentNations(nid);
    ok(neighbours.length);
    Events.apply(nid, { standing: 0.12 }, T());
    let warmed = 0;
    for (const o of neighbours) if (Relations.score(o, nid, T()) > 0) warmed++;
    equal(warmed, neighbours.length, 'the goodwill did not reach every neighbour');
  });

  it('is written down, with its terms', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const e = Events.all()[0];
    const res = Events.resolve(nid, e, e.options[0], T());
    ok(res && res.entry, 'a crisis resolved without a ledger entry');
    equal(res.entry.kind, 'crisis');
    ok(res.entry.text.includes(e.title), `the entry does not name the crisis: "${res.entry.text}"`);
    ok(res.entry.terms.length, 'the entry does not say what it changed');
  });
});

describe('Who answers', () => {
  it('the player is asked, and nobody answers for them', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.setPlayer(nid);
    World.setTurn(20);
    Game.getNation(nid).qol = 0.25;
    const before = Game.getNation(nid).qol;
    const out = Events.tick(T(), RNG.create(3));
    if (!out.pending) return;                       // the draw went to somebody else
    equal(out.pending.nid, nid);
    close(Game.getNation(nid).qol, before, 1e-9,
      'the game answered the player\'s crisis for them');
    const res = Events.answer(out.pending.event.options[0].label, T());
    ok(res, 'the answer did nothing');
    equal(Events.waiting(), null, 'the question is still waiting after being answered');
  });

  it('an AI takes the option that most helps what it is worst at', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = Game.getNation(nid);
    const e = Events.all().find((x) => x.id === 'currency-crisis');
    ok(e, 'the currency crisis is not in the table');
    // Broke: it should take the option that raises the most money.
    n.treasury = 0;
    n.qol = 0.9; n.authority = 0.9; n.influence = 0.9; n.weariness = 0;
    const poor = Events.choose(nid, e, T());
    ok((poor.effects.treasuryShare || 0) > 0, `a bankrupt nation chose "${poor.label}"`);
    // Exhausted and rich: it should take the one that stands the army down.
    n.treasury = 1e15;
    n.weariness = 0.9;
    const tired = Events.choose(nid, e, T());
    ok((tired.effects.weariness || 0) < 0,
      `an exhausted nation with money chose "${tired.label}"`);
  });

  it('the world produces some, and not too many', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), rng);
    const fired = Ledger.ofKind('crisis');
    ok(fired.length > 0, 'thirty turns produced no crises at all');
    ok(fired.length <= 30 * T().get('events.maxPerTurn'),
      `${fired.length} crises in thirty turns, above the per-turn budget`);
    for (const e of fired) ok(e.text && /[.!?]$/.test(e.text), `"${e.text}"`);
  });

  it('and the history is state', async () => {
    const ctx = await bootWorld({ seed: SEED });
    const nid = '06';
    const e = Events.all()[0];
    Events.resolve(nid, e, e.options[0], T());
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    Events.reset();
    ok(Events.candidates(nid, T()).length >= 0);
    StateDoc.applyModel(doc);
    equal(Events.draw(nid, RNG.create(1), T()), null,
      'a load forgot that the nation had just had a crisis');
  });
});
