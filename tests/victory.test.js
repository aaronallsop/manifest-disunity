/*
 * M6.4 — how a game ends, and who you are when it does.
 *
 * Before this the game had no win condition, no lose condition, and eighty turns
 * of a game about whether a country holds together ended the way the fortieth
 * turn ended: with a map, and nothing said about it.
 *
 * The conditions are a TABLE, not code paths, and each row returns the same
 * shape every explained quantity here returns. Most of what is pinned below is
 * that property — that "how close am I" and "why did they win" are one query at
 * two verbosities — plus the two things that are easy to get quietly wrong:
 *
 *   - a condition nobody can reach is worse than no condition at all, so the
 *     targets are checked against what the world actually produces;
 *   - the seats a nation does not own are the whole design of the capstone, and
 *     the first cut of that rule handed Ohio twenty-eight of them on turn zero.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('The seats of government', () => {
  it('all 51 resolve to live Areas', async () => {
    /*
     * Authored by county and resolved through `Game.areaIdOf`, because several
     * capital counties are merged into a larger Area — the M1.13 trap, which
     * discarded 48.2% of authored references the first time it was met and would
     * be exactly as quiet here.
     */
    await bootWorld({ seed: SEED });
    ok(Victory.loaded(), 'content/capitals.json did not load');
    const caps = Victory.all();
    equal(Object.keys(caps).length, 51);
    for (const [st, rec] of Object.entries(caps)) {
      ok(Game.county[rec.area], `${rec.city} resolves to no live Area`);
      equal(Game.county[rec.area].st !== undefined, true);
      ok(rec.city && rec.county, `the seat for ${st} is missing its name`);
    }
  });

  it('a nation opens holding exactly its own', async () => {
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '48', '39', '44']) {
      const s = Victory.seats(nid, T());
      equal(s.own, 1, `${nid} does not open holding its own seat`);
      equal(s.total, 51);
    }
  });

  it('sharing an ideology is not the same as following somebody', async () => {
    /*
     * The whole design of the capstone, and the first cut of it handed Ohio
     * TWENTY-EIGHT seats on turn zero — because at the opening position most of
     * the country governs as most of the rest of it does, so three quarters of
     * the Union was more than half won before a single move. The Influence gap
     * is what makes an aligned seat a relationship rather than a coincidence.
     */
    await bootWorld({ seed: SEED });
    const need = T().get('win.reuniteSeats');
    for (const [nid] of Game.nations) {
      const s = Victory.seats(nid, T());
      /*
       * Not zero, and deliberately not asserted as zero. California opens with
       * eight borrowed seats and that is the rule WORKING: it is the largest
       * economy, its opening Influence genuinely exceeds most of the map's by
       * the required margin, and half the country genuinely does govern as it
       * does. That is a real head start, and it is why California is rated
       * Comfortable.
       *
       * A rule tuned until a test reads zero is a rule tuned to the test. What
       * must be true is that nobody opens most of the way to the capstone.
       */
      ok(s.aligned < 12, `${Game.getNation(nid).name} started with ${s.aligned} borrowed seats`);
      ok(s.held / s.total < need * 0.5,
        `${Game.getNation(nid).name} opens holding ${s.held}/${s.total} of the ${Math.round(need * s.total)} seats it needs`);
    }
  });

  it('...and a hegemon collects them', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const me = Game.getNation(nid);
    me.influence = 0.95;
    let same = 0;
    for (const [other, n] of Game.nations) {
      if (other === nid) continue;
      n.influence = 0.1;
      if (n.gov.rulingIdeology === me.gov.rulingIdeology) same++;
    }
    const s = Victory.seats(nid, T());
    ok(s.aligned > 0, `a nation at 0.95 Influence over a field at 0.10 borrowed nothing (${same} share its ideology)`);
    ok(s.aligned <= same, 'more seats were borrowed than there are nations sharing the ideology');
  });
});

describe('The conditions', () => {
  it('every condition explains itself term by term', async () => {
    await bootWorld({ seed: SEED });
    const rows = Victory.progress('06', T());
    equal(rows.length, 3, 'the three archetypes are not all there');
    for (const r of rows) {
      ok(r.id && r.label && r.blurb, 'a condition with no name');
      ok(r.terms.length >= 3, `${r.id} has only ${r.terms.length} requirements`);
      for (const t of r.terms) {
        ok(t.label && t.key, `${r.id}: a requirement with no tunable behind it`);
        ok(Number.isFinite(t.value) && Number.isFinite(t.target));
        equal(t.met, t.value >= t.target);
        ok(t.progress >= 0 && t.progress <= 1);
      }
      ok(r.summary && /[.!?]$/.test(r.summary), `the summary is not a sentence: "${r.summary}"`);
    }
  });

  it('progress is the WORST requirement, not the average', async () => {
    /*
     * A victory condition is an AND. Reporting 80% while one requirement sits at
     * zero would be a lie about the only number that matters.
     */
    await bootWorld({ seed: SEED });
    for (const nid of ['06', '48', '50']) {
      for (const r of Victory.progress(nid, T())) {
        const worst = r.terms.reduce((a, t) => Math.min(a, t.progress), 1);
        close(r.progress, worst, 1e-12, `${nid}/${r.id} reported better than its worst requirement`);
      }
    }
  });

  it('the Influence floor is what a conqueror fails', async () => {
    /*
     * Give one nation the entire continent — every Area, every seat, all the
     * people and all the money — and leave its Influence where a feared power's
     * would be. It must still not win, or the shortest path to victory is the
     * strategy the rest of the game spends its time punishing.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.moveCounties(Object.keys(Game.county).filter((f) => Game.getOwner(f) !== nid), nid,
      { silent: true, reason: 'annex' });
    const me = Game.getNation(nid);
    me.authority = 0.95;
    me.influence = T().get('win.reuniteInfluence') - 0.05;
    const r = Victory.progress(nid, T()).find((x) => x.id === 'reunification');
    equal(Victory.seats(nid, T()).own, 51, 'the test did not actually hand over every seat');
    equal(r.met, false, 'a nation holding the entire continent won on conquest alone');
    const short = r.terms.filter((t) => !t.met);
    equal(short.length, 1);
    equal(short[0].label, 'Influence');
    me.influence = T().get('win.reuniteInfluence') + 0.01;
    ok(Victory.progress(nid, T()).find((x) => x.id === 'reunification').met,
      'clearing the last requirement did not win');
  });

  it('nobody wins from the opening position', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) {
      for (const r of Victory.progress(nid, T())) {
        equal(r.met, false, `${Game.getNation(nid).name} had already achieved ${r.label} on turn 0`);
      }
    }
  });

  it('and no condition is out of reach of the world that exists', async () => {
    /*
     * A target the map cannot approach is a feature that never fires. These are
     * calibrated against a measured eighty-turn game (see the docs on each
     * `win.*` key); this pins the shape of that calibration rather than the
     * numbers, so a tuning pass can move them and a mistake still fails.
     */
    const t = T();
    ok(t.get('win.reuniteSeats') < 1, 'Reunification needs every seat on the map');
    ok(t.get('win.reunitePop') + t.get('win.reuniteGdp') < 1.2, 'the capstone asks for more than exists');
    for (const key of ['win.reuniteInfluence', 'win.ideoInfluence']) {
      ok(t.get(key) <= 0.6,
        `${key} is ${t.get(key)}, and Influence measured no higher than 0.53 in an eighty-turn game`);
    }
    ok(t.get('win.ideoSway') > 0.45, 'political drift alone reaches 0.45 by turn 80');
  });
});

describe('Winning', () => {
  it('nothing is checked during the grace period', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    Game.moveCounties(Object.keys(Game.county).filter((f) => Game.getOwner(f) !== nid), nid,
      { silent: true, reason: 'annex' });
    const me = Game.getNation(nid);
    me.authority = 0.99; me.influence = 0.99; me.qol = 0.99;
    World.setTurn(T().get('win.graceTurns') - 1);
    equal(Victory.check(T()), null, 'a game was won inside the grace period');
    World.setTurn(T().get('win.graceTurns'));
    const v = Victory.check(T());
    ok(v, 'nothing was won by a nation holding the entire continent');
    equal(v.winner, nid);
  });

  it('the world records the winner, once, and remembers it', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '06';
    Game.moveCounties(Object.keys(Game.county).filter((f) => Game.getOwner(f) !== nid), nid,
      { silent: true, reason: 'annex' });
    const me = Game.getNation(nid);
    me.authority = 0.99; me.influence = 0.99; me.qol = 0.99;
    World.setTurn(T().get('win.graceTurns'));
    World.advanceTurn(T(), rng);
    const w = World.getWinner();
    ok(w, 'the world did not notice');
    equal(w.winner, nid);
    equal(Ledger.ofKind('won').length, 1, 'the victory was not logged exactly once');
    World.advanceTurn(T(), rng);
    equal(Ledger.ofKind('won').length, 1, 'the victory was logged again the following turn');
    ok(World.serialize().winner, 'the winner is not saved with the world');
  });

  it('a headline leads with the victory', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '06';
    Game.moveCounties(Object.keys(Game.county).filter((f) => Game.getOwner(f) !== nid), nid,
      { silent: true, reason: 'annex' });
    const me = Game.getNation(nid);
    me.authority = 0.99; me.influence = 0.99; me.qol = 0.99;
    World.setTurn(T().get('win.graceTurns'));
    const mark = Ledger.mark();
    World.advanceTurn(T(), rng);
    const heads = Ledger.rank(Ledger.after(mark), 5);
    ok(heads.length, 'nothing was reported at all');
    equal(heads[0].kind, 'won', 'something outranked the end of the game');
  });

  it('standings rank the field by how close it is', async () => {
    await bootWorld({ seed: SEED });
    const rows = Victory.standings(T(), 5);
    equal(rows.length, 5);
    for (let i = 1; i < rows.length; i++) {
      ok(rows[i - 1].best.progress >= rows[i].best.progress, 'the standings are not sorted');
    }
    ok(rows[0].best.progress > 0, 'nobody has made any progress toward anything');
  });

  it('checking changes nothing', async () => {
    await bootWorld({ seed: SEED });
    World.setTurn(40);
    const before = fingerprint();
    Victory.check(T());
    Victory.standings(T());
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `checking changed ${k}`);
  });
});

describe('Who you play', () => {
  it('every nation is playable and rated', async () => {
    await bootWorld({ seed: SEED });
    const rows = Factions.list(T());
    equal(rows.length, Game.nations.size);
    for (const r of rows) {
      ok(r.name && r.tier && r.label, 'a faction with no rating');
      ok(r.score >= 0 && r.score <= 1, `${r.name} scored ${r.score}`);
      ok(r.terms.length >= 4, `${r.name} was rated on ${r.terms.length} things`);
      for (const t of r.terms) ok(t.value >= 0 && t.value <= 1, `${r.name}: ${t.label} = ${t.value}`);
      ok(/[.!?]$/.test(r.summary), `the summary is not a sentence: "${r.summary}"`);
    }
    for (let i = 1; i < rows.length; i++) {
      ok(rows[i - 1].score >= rows[i].score, 'the faction list is not sorted');
    }
  });

  it('the tiers are a spread of the field, not a heap in one band', async () => {
    /*
     * The first cut used fixed score thresholds and put twenty of fifty-one
     * nations in one band and exactly one in another, which tells a new player
     * nothing. The bands are proportions of the field now.
     */
    await bootWorld({ seed: SEED });
    const rows = Factions.list(T());
    const counts = {};
    for (const r of rows) counts[r.tier] = (counts[r.tier] || 0) + 1;
    for (const t of Factions.TIERS) {
      ok(counts[t.id] > 0, `nothing at all is ${t.label}`);
      ok(counts[t.id] <= rows.length * 0.45,
        `${counts[t.id]} of ${rows.length} nations are ${t.label}`);
    }
  });

  it('says something different about different nations', async () => {
    await bootWorld({ seed: SEED });
    const rows = Factions.list(T());
    const distinct = new Set(rows.map((r) => r.summary));
    ok(distinct.size > rows.length * 0.5,
      `${distinct.size} distinct summaries for ${rows.length} nations`);
  });

  it('a harder start gets more money, and the map is untouched', async () => {
    await bootWorld({ seed: SEED });
    const rows = Factions.list(T());
    const easiest = rows[0], hardest = rows[rows.length - 1];
    ok(hardest.bonus > easiest.bonus,
      `${hardest.name} (${hardest.label}) got ${hardest.bonus} and ${easiest.name} got ${easiest.bonus}`);
    const before = fingerprint();
    Factions.choose(hardest.nid, T());
    const after = fingerprint();
    equal(after.ownerHash, before.ownerHash, 'choosing a faction moved the map');
    equal(after.areas, before.areas);
    equal(Game.getPlayer(), hardest.nid);
  });

  it('the grant is paid once, at the start', async () => {
    /*
     * `Game.setPlayer` runs again on every load. A bonus that reapplied there
     * would pay out for reloading, which is a save-scumming exploit rather than
     * a difficulty setting.
     */
    await bootWorld({ seed: SEED });
    const rows = Factions.list(T());
    const pick = rows[rows.length - 1];
    const before = Game.getNation(pick.nid).treasury;
    Factions.choose(pick.nid, T());
    const after = Game.getNation(pick.nid).treasury;
    close(after - before, pick.bonus, 1e-6, 'the grant paid was not the grant quoted');
    Game.setPlayer(pick.nid);
    close(Game.getNation(pick.nid).treasury, after, 1e-6, 'seating the player again paid a second grant');
  });

  it('rating changes nothing', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    Factions.list(T());
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `rating changed ${k}`);
  });
});

describe('Going with the breakaway', () => {
  it('a declaration records who lost the ground', async () => {
    /*
     * The model half of M6.5c. The seat is offered to the parent and to nobody
     * else, and after `breakApart` there is no longer anything to ask — so the
     * owner is read before the ground moves and carried on the event.
     */
    const { rng } = await bootWorld({ seed: SEED });
    let found = null;
    for (let i = 0; i < 60 && !found; i++) {
      World.advanceTurn(T(), rng);
      found = Ledger.ofKind('declare')[0] || null;
    }
    ok(found, 'sixty turns produced no declaration');
    ok(found.parent, 'the declaration does not say which nation lost the ground');
    ok(found.nation && Game.getNation(found.nation), 'the declaration names no live nation');
    ok(found.parent !== found.nation, 'a nation declared independence from itself');
  });

  it('the seat can move to it, and the world carries on', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    let d = null;
    for (let i = 0; i < 60 && !d; i++) {
      World.advanceTurn(T(), rng);
      d = Ledger.ofKind('declare')[0] || null;
    }
    if (!d) return;
    /*
     * The parent may not have survived its own breakaway — which is the case
     * the switch exists for, and the reason the offer is made before the defeat
     * screen rather than after it.
     */
    if (Game.getNation(d.parent)) {
      Game.setPlayer(d.parent);
      equal(Game.getPlayer(), d.parent);
    }
    // Going with them is exactly this, which is the point of M6.2's seat.
    ok(Game.setPlayer(d.nation), 'the breakaway could not be taken up');
    equal(Game.getPlayer(), d.nation);
    equal(TurnSystem.seat(d.nation), true, 'the new nation has no slot in the order');
    equal(TurnSystem.currentId(), d.nation);
    World.advanceTurn(T(), rng);
    ok(Game.getNation(Game.getPlayer()), 'the world did not survive the switch');
  });
});
