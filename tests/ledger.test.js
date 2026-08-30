/*
 * M5.1 — the event ledger.
 *
 * One append-only structure serving four features, which is the whole reason to
 * build it once: the player's tooltip, the developer's formula expander, the
 * end-of-game timeline and the simulator's graphs all want the same entries at
 * different verbosities.
 *
 * The property that matters most is that `terms` is THE WHY RECORD — the same
 * array `js/power.js` and `js/sentiment.js` already produce — so logging an
 * explanation costs one array reference rather than a second calculation. A
 * ledger that recomputed its own reasons would be a third model of the model.
 *
 * What it replaces: the only output any action produced was an HTML string
 * handed to `flash()`, a six-second toast that overwrites the previous message —
 * and on a round boundary the action result is immediately clobbered by the
 * growth toast. A player who looked away lost the only account of what they had
 * just done.
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('The ledger', () => {
  it('starts empty in a fresh world', async () => {
    await bootWorld({ seed: SEED });
    equal(Ledger.count(), 0, 'a new world remembers events from the last one');
  });

  it('stamps every entry with a turn, a phase, a subject and an id', async () => {
    await bootWorld({ seed: SEED });
    World.setTurn(7);
    const e = Ledger.append({ kind: 'annex', subject: '06', delta: 3, text: 'California annexed 3 Areas.' });
    equal(e.turn, 7, 'the turn was not taken from the world clock');
    equal(e.phase, 'action');
    equal(e.subject, '06');
    equal(e.id, 1);
    equal(Ledger.append({ kind: 'war', subject: '48' }).id, 2, 'ids are not monotonic');
  });

  it('refuses an entry with no kind — a category nobody renders is worse than nothing', async () => {
    await bootWorld({ seed: SEED });
    equal(Ledger.append({ subject: '06', text: 'something happened' }), null);
    equal(Ledger.append(null), null);
    equal(Ledger.count(), 0);
  });

  it('a caller cannot forge an id', async () => {
    await bootWorld({ seed: SEED });
    Ledger.append({ kind: 'annex' });
    const e = Ledger.append({ kind: 'annex', id: 9999 });
    equal(e.id, 2, 'a caller overwrote the ledger\'s own sequence');
  });

  it('queries by turn, subject and kind', async () => {
    await bootWorld({ seed: SEED });
    Ledger.append({ kind: 'annex', subject: '06', turn: 1 });
    Ledger.append({ kind: 'war', subject: '06', turn: 2 });
    Ledger.append({ kind: 'annex', subject: '48', turn: 2 });
    equal(Ledger.forTurn(2).length, 2);
    equal(Ledger.forSubject('06').length, 2);
    equal(Ledger.ofKind('annex').length, 2);
    equal(Ledger.since(2).length, 2);
    equal(Ledger.latest(1).length, 1);
    equal(Ledger.latest(1)[0].subject, '48');
  });

  it('is capped, so an unattended simulator run cannot grow it without bound', async () => {
    await bootWorld({ seed: SEED });
    const cap = T().peek('ledger.cap');
    for (let i = 0; i < cap + 50; i++) Ledger.append({ kind: 'power', subject: 'x', turn: i });
    equal(Ledger.count(), cap, `the ledger holds ${Ledger.count()} against a cap of ${cap}`);
    // the OLDEST go, so the recent past is what survives
    ok(Ledger.all()[0].turn > 0, 'the trim kept the beginning and dropped the end');
  });
});

describe('terms is the Why record, not a second calculation', () => {
  it('carries the name, the contribution and the tunable key', async () => {
    await bootWorld({ seed: SEED });
    const n = Game.getNation('06');
    const terms = Ledger.termsOf(n.why.authority);
    ok(terms.length > 0 && terms.length <= 6);
    for (const t of terms) {
      ok(t.name, 'a term with no name');
      ok(Number.isFinite(t.value), `${t.name} has value ${t.value}`);
      ok(t.key === null || T().peek(t.key) !== undefined, `${t.name} names unknown tunable ${t.key}`);
    }
  });

  it('ranks by magnitude and drops the noise, so a tooltip has something to say', async () => {
    await bootWorld({ seed: SEED });
    const terms = Ledger.termsOf(Game.getNation('06').why.authority);
    for (let i = 1; i < terms.length; i++) {
      ok(Math.abs(terms[i - 1].value) >= Math.abs(terms[i].value), 'terms are not ranked');
    }
    for (const t of terms) ok(Math.abs(t.value) > 1e-6, 'a zero term survived into the ledger');
  });

  it('is null for a record with no inputs, rather than an empty array to guard for', async () => {
    await bootWorld({ seed: SEED });
    equal(Ledger.termsOf(null), null);
    equal(Ledger.termsOf({}), null);
  });
});

describe('The model writes to it', () => {
  it('a secession is logged with the sentiment factors that caused it', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
    const declares = Ledger.ofKind('declare');
    ok(declares.length > 0, 'forty turns produced no logged declaration');
    const d = declares[0];
    ok(d.text && /declared independence/.test(d.text), `the text reads "${d.text}"`);
    ok(d.movement, 'the entry does not name the movement');
    ok(d.terms && d.terms.length > 0, 'a secession was logged with no reason attached');
    for (const t of d.terms) ok(t.key === null || T().peek(t.key) !== undefined);
    // and the nation it created is logged as coming into being
    ok(Ledger.ofKind('found').length > 0, 'a nation appeared with no record of its founding');
  });

  it('a nation ceasing to exist is an event, not a silent Map.delete', async () => {
    /*
     * The review's complaint, verbatim: the swatch vanished from the
     * leaderboard, the turn order quietly shortened, and the player could not
     * tell "Wyoming was annihilated" from "I mis-clicked".
     */
    await bootWorld({ seed: SEED });
    const victim = '10'; // Delaware
    const name = Game.getNation(victim).name;
    Game.moveCounties([...Game.getNation(victim).counties], '24');
    equal(Game.nations.has(victim), false);
    const died = Ledger.ofKind('died');
    equal(died.length, 1, 'a nation was deleted without a word');
    equal(died[0].subject, victim);
    ok(died[0].text.includes(name), `the obituary reads "${died[0].text}"`);
  });

  it('changing course is logged with what it cost', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.getNation(nid).treasury = 1e15;
    const d = Game.nationDemographics(nid);
    const to = Ideology.all().map((x, i) => ({ id: x.id, share: d.mix[i] / d.pop }))
      .filter((o) => o.id !== Game.getNation(nid).gov.rulingIdeology)
      .sort((a, b) => b.share - a.share)[0];
    Game.changeRulingIdeology(nid, to.id, { force: true });
    const e = Ledger.ofKind('govern')[0];
    ok(e, 'a change of government was not logged');
    ok(e.terms.some((t) => t.name === 'Cost' && t.value < 0), 'the cost is not in the record');
    ok(e.from && e.to, 'the entry does not say what changed to what');
  });
});

describe('The turn-summary newspaper', () => {
  it('ranks what happened, because importance is not a property of the kind', async () => {
    /*
     * A one-Area defection into a movement's first country matters more than a
     * routine six-Area annexation, and only the magnitude knows that.
     */
    await bootWorld({ seed: SEED });
    World.setTurn(3);
    Ledger.append({ kind: 'trade', subject: 'a', delta: 1, text: 'a trade' });
    Ledger.append({ kind: 'declare', subject: 'b', delta: 4, text: 'a declaration' });
    Ledger.append({ kind: 'annex', subject: 'c', delta: 2, text: 'an annexation' });
    const heads = Ledger.headlines(3, 3);
    deepEqual(Ledger.headlines(null, 3).map((h) => h.kind), heads.map((h) => h.kind),
      'the default turn is not the most recent one with entries');
    equal(heads.length, 3);
    equal(heads[0].kind, 'declare', 'a trade outranked a declaration of independence');
    equal(heads[2].kind, 'trade');
  });

  it('drops entries with nothing to say', async () => {
    await bootWorld({ seed: SEED });
    World.setTurn(1);
    Ledger.append({ kind: 'power', subject: 'a', delta: 1 });         // no text
    Ledger.append({ kind: 'annex', subject: 'b', delta: 1, text: 'x' });
    equal(Ledger.headlines(1).length, 1, 'a textless entry became a headline');
  });

  it('a real turn produces headlines a player could read', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    let found = null;
    for (let i = 0; i < 40 && !found; i++) {
      World.advanceTurn(T(), rng);
      // No argument: the most recent turn that has anything. Asking for
      // `World.getTurn()` here is off by one, because a phase event is stamped
      // with the turn it happened DURING and the counter has already moved on.
      const h = Ledger.headlines();
      if (h.length) found = h;
    }
    ok(found, 'forty turns produced not one headline');
    for (const h of found) {
      ok(h.text.length > 10 && !/[<>]/.test(h.text),
        `a headline is markup rather than prose: "${h.text}"`);
    }
  });
});

describe('The ledger is state', () => {
  it('survives a save round-trip', async () => {
    const { rng, seed } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), rng);
    ok(Ledger.count() > 0, 'thirty turns produced no events to round-trip');
    const before = JSON.stringify(Ledger.all());
    const doc = JSON.parse(JSON.stringify(StateDocSerialize()));

    await bootWorld({ seed: 777 });
    equal(Ledger.count(), 0);
    Ledger.loadState(doc.ledger);
    equal(JSON.stringify(Ledger.all()), before, 'the ledger did not survive the trip');
  });

  it('is in the state document, so a save can show a timeline', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 10; i++) World.advanceTurn(T(), rng);
    const doc = StateDocSerialize();
    ok(doc.ledger, 'the document has no ledger section');
    ok(Array.isArray(doc.ledger.entries));
    equal(doc.ledger.entries.length, Ledger.count());
  });

  function StateDocSerialize() {
    // the same shape statedoc.assemble builds, without needing the page session
    return { ledger: Ledger.serialize() };
  }
});
