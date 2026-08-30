/*
 * M3.4 — nations get a memory and a government.
 *
 * The record had seven fields and no history, so none of Authority's inputs
 * could even be counted: not age, not what a nation had taken, not what it had
 * lost. And `gov` was the string 'Republic' used as a lookup key into a
 * maintenance table with one entry — a constant wearing a variable's clothes —
 * so Civil Liberties had nothing to measure "aligned vs misaligned population"
 * against.
 *
 * Two properties matter more than the fields:
 *
 *   1. History is recorded at ONE choke point. Every territorial change in the
 *      game — annex, unite, release, civil-war fragmentation, nation creation —
 *      flows through `moveCounties`. Instrumenting the callers separately is how
 *      one of them ends up not doing it, so the tests below drive each caller
 *      and check the record, rather than calling `moveCounties` five times.
 *   2. The government is derived but STORED, and refreshed at exactly one point
 *      in the turn. Reading it live would mean a nation's government changed
 *      mid-phase, so who was in power depended on when you asked.
 */
import { describe, it, ok, equal, notEqual, close, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('Nation history', () => {
  it('every nation starts with a founding turn and an empty memory', async () => {
    await bootWorld({ seed: SEED });
    for (const [, n] of Game.nations) {
      equal(n.founded, 0, `${n.name} was not founded at turn 0`);
      deepEqual(n.annexed, [], `${n.name} starts with an annexation on the books`);
      deepEqual(n.lost, [], `${n.name} starts with a loss on the books`);
    }
  });

  it('an annexation is recorded on both sides, with the turn and the count', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 4; i++) World.advanceTurn(T(), rng);
    const taken = [...Game.getNation('32').counties].slice(0, 3);
    Game.moveCounties(taken, '06', { reason: 'annex' });

    const ca = Game.getNation('06'), nv = Game.getNation('32');
    equal(ca.annexed.length, 1, 'the annexer recorded nothing');
    equal(ca.annexed[0].turn, 4);
    equal(ca.annexed[0].areas, 3);
    equal(ca.annexed[0].reason, 'annex');
    deepEqual(ca.annexed[0].from, ['32']);

    equal(nv.lost.length, 1, 'the loser recorded nothing');
    equal(nv.lost[0].turn, 4);
    equal(nv.lost[0].areas, 3);
    equal(nv.lost[0].to, '06');
  });

  it('one move that takes from several nations records one loss each', async () => {
    await bootWorld({ seed: SEED });
    const mixed = [...Game.getNation('32').counties].slice(0, 2)
      .concat([...Game.getNation('41').counties].slice(0, 3));
    Game.moveCounties(mixed, '06');
    equal(Game.getNation('06').annexed.length, 1, 'the gain should be one event, not one per victim');
    equal(Game.getNation('06').annexed[0].areas, 5);
    equal(Game.getNation('06').annexed[0].from.length, 2);
    equal(Game.getNation('32').lost[0].areas, 2);
    equal(Game.getNation('41').lost[0].areas, 3);
  });

  it('a move that changes nothing is not an event', async () => {
    await bootWorld({ seed: SEED });
    const own = [...Game.getNation('06').counties].slice(0, 4);
    Game.moveCounties(own, '06');
    equal(Game.getNation('06').annexed.length, 0, 'moving Areas to their own owner was recorded');
  });

  it('records what a civil war fragmented, not just what a player clicked', async () => {
    // breakApart -> createNation -> moveCounties. If history lived in the action
    // layer instead of the choke point, this whole path would record nothing.
    await bootWorld({ seed: SEED });
    const tx = [...Game.getNation('48').counties];
    const chunk = tx.slice(0, 30);
    const made = Game.breakApart(chunk, { exclude: '48' });
    ok(made.length > 0, 'nothing broke away');
    equal(Game.getNation('48').lost.length > 0, true, 'Texas lost ground and did not record it');
    let recorded = 0;
    for (const e of Game.getNation('48').lost) recorded += e.areas;
    ok(recorded > 0 && recorded <= chunk.length,
      `Texas recorded ${recorded} Areas lost out of ${chunk.length}`);
    for (const id of made) {
      const n = Game.getNation(id);
      if (!n) continue;
      ok(n.annexed.length > 0, `${n.name} came into being holding ground it never recorded taking`);
      equal(n.founded, World.getTurn(), `${n.name} has the wrong founding turn`);
    }
  });

  it('records a union', async () => {
    await bootWorld({ seed: SEED });
    const nvAreas = Game.getNation('32').counties.size;
    Game.mergeInto('06', '32');
    const ca = Game.getNation('06');
    ok(ca.annexed.some((e) => e.reason === 'unite'), 'a union was not recorded as one');
    equal(ca.annexed[ca.annexed.length - 1].areas, nvAreas);
    equal(Game.nations.has('32'), false);
  });

  it('remembers a window, not a lifetime — a save must not grow without bound', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const window = T().get('nation.historyWindow');
    // one annexation per turn, for well past the window
    for (let i = 0; i < window + 12; i++) {
      const targets = [...Game.annexTargets('06')].slice(0, 1);
      if (targets.length) Game.moveCounties(targets, '06');
      World.advanceTurn(T(), rng);
    }
    const ca = Game.getNation('06');
    ok(ca.annexed.length <= window + 2,
      `${ca.annexed.length} events kept against a ${window}-turn window`);
    ok(ca.annexed.length > 1, 'the trim ate everything');
    const oldest = ca.annexed[0].turn;
    ok(World.getTurn() - oldest <= window + 1,
      `the oldest kept event is ${World.getTurn() - oldest} turns old`);
  });

  it('history survives a save round-trip exactly', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 3; i++) World.advanceTurn(T(), rng);
    Game.moveCounties([...Game.getNation('32').counties].slice(0, 4), '06', { reason: 'war' });
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    const wantA = Game.getNation('06').annexed.map((e) => ({ ...e }));
    const wantL = Game.getNation('32').lost.map((e) => ({ ...e }));

    await bootWorld({ seed: 777 });
    Game.loadState(doc);
    deepEqual(Game.getNation('06').annexed, wantA, 'the annexation record did not survive');
    deepEqual(Game.getNation('32').lost, wantL, 'the loss record did not survive');
  });
});

describe('Government', () => {
  it('is a record, not a string used as a lookup key', async () => {
    await bootWorld({ seed: SEED });
    for (const [, n] of Game.nations) {
      equal(typeof n.gov, 'object', `${n.name}.gov is still a ${typeof n.gov}`);
      equal(n.gov.type, 'Republic');
      ok(Ideology.index(n.gov.rulingIdeology) >= 0,
        `${n.name} is governed by "${n.gov.rulingIdeology}", which is not an ideology`);
      equal(n.gov.since, 0);
    }
  });

  it('the ruling ideology is the nation\'s actual largest bloc', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid, n] of Game.nations) {
      const bloc = Game.rulingBloc(n.counties);
      equal(n.gov.rulingIdeology, Ideology.idAt(bloc),
        `${n.name} is governed by ${n.gov.rulingIdeology} but its largest bloc is ${Ideology.idAt(bloc)}`);
    }
  });

  it('is computed AFTER movement seeding, not in the middle of world construction', async () => {
    /*
     * Game.init used to refresh governments at the end of its own run — which is
     * before Parties.setup has converted anybody. Wisconsin is 49.6/48.7, and a
     * single movement seeding flipped the answer, so the live game and a save
     * round-trip disagreed about who governed it.
     */
    await bootWorld({ seed: SEED });
    const wi = Game.getNation('55');
    const bloc = Game.rulingBloc(wi.counties);
    equal(wi.gov.rulingIdeology, Ideology.idAt(bloc),
      'Wisconsin is governed by a bloc that is not its largest');
    // and it really is close enough for the ordering to matter
    const s = Game.nationDemographics('55').shares;
    const sorted = [...s].sort((a, b) => b - a);
    ok(sorted[0] - sorted[1] < 5,
      `Wisconsin's top two are ${sorted[0].toFixed(1)} and ${sorted[1].toFixed(1)} apart; ` +
      'this test no longer exercises a near-tie');
  });

  it('changes only when the bloc actually changes, and stamps when', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 3; i++) World.advanceTurn(T(), rng);
    const n = Game.getNation('49');
    equal(n.gov.since, 0, 'Utah\'s government was re-dated by turns that changed nothing');

    // force a different bloc and advance one turn
    const YELLOW = Ideology.index('yellow');
    for (const f of n.counties) {
      const c = Game.county[f];
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      c.pop.fill(0);
      c.pop[YELLOW] = pop;
      c.mov = {};
    }
    World.advanceTurn(T(), rng);
    equal(Game.getNation('49').gov.rulingIdeology, 'yellow', 'the government did not follow the bloc');
    equal(Game.getNation('49').gov.since, World.getTurn(), 'the change was not dated');
  });

  it('a nation with no population keeps the government it had', async () => {
    await bootWorld({ seed: SEED });
    const n = Game.getNation('10');
    const was = n.gov.rulingIdeology;
    for (const f of n.counties) Game.county[f].pop.fill(0);
    Game.refreshGovernments();
    equal(Game.getNation('10').gov.rulingIdeology, was,
      'losing your people is not the same as having no politics');
  });

  it('gov.since is restored by a load, not re-dated to the turn the save was opened', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 5; i++) World.advanceTurn(T(), rng);
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    const want = new Map([...Game.nations].map(([id, n]) => [id, { ...n.gov }]));

    for (let i = 0; i < 3; i++) World.advanceTurn(T(), rng);
    Game.loadState(doc);
    for (const [id, gov] of want) {
      deepEqual(Game.getNation(id).gov, gov, `${id}'s government was not restored exactly`);
    }
  });

  it('a pre-M3 document whose gov is the string "Republic" still loads', async () => {
    await bootWorld({ seed: SEED });
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    for (const n of doc.nations) { n.gov = 'Republic'; delete n.annexed; delete n.lost; }
    Game.loadState(doc);
    for (const [, n] of Game.nations) {
      equal(n.gov.type, 'Republic');
      ok(Ideology.index(n.gov.rulingIdeology) >= 0,
        'an old document left the nation ungoverned instead of deriving one');
      deepEqual(n.annexed, []);
    }
  });

  it('maintenance still reads the government, through the record', async () => {
    await bootWorld({ seed: SEED });
    const flow = Game.treasuryFlow('06');
    ok(flow.maintenance > 0, 'maintenance is zero; the gov lookup fell through');
    const rate = T().get('econ.govMaintenance').Republic;
    const gdp = Game.nationDemographics('06').gdp;
    close(flow.maintenance - flow.administration - flow.occupation, gdp * rate, 1,
      'the maintenance rate is not the one the government type names');
  });
});
