/*
 * M7.10 — a nation can lose its own government.
 *
 * WHAT THIS REPLACES. `refreshGovernments` tracked the popular plurality every
 * turn, but only for a nation that had never deliberately changed course:
 * "it chose; it keeps its choice" locked everybody else in for the rest of the
 * game. So a player could change hats to defuse a secession and never answer for
 * it, and an ideology was a costume. The first test in the second block below is
 * the one that matters: a government holding 39% of its people against a rival
 * holding 58% loses.
 *
 * The tuning bug worth remembering is pinned here too. The incumbent's terms are
 * measured against the WORLD MEAN, not against the middle of their range: the
 * stocks do not sit around 0.5 — a settled board runs Quality of Life in the
 * eighties — so centring on 0.5 hands every incumbent alive the same large
 * bonus. Measured with that mistake in place, 284 elections over 84 turns turned
 * out three governments; against the mean it is 56.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';

const SEED = 20260901;
const T = () => window.TUNE;

/** Run the world until this nation's polling day, and hold it. */
function runToPolls(nid, rng) {
  for (let i = 0; i <= Elections.termOf(T()) + 1; i++) {
    if (Elections.due(nid, T())) return true;
    World.advanceTurn(T(), rng);
  }
  return Elections.due(nid, T());
}

describe('Elections — the schedule', () => {
  it('everybody votes, on their own clock, and nothing is stored to say so', async () => {
    await bootWorld({ seed: SEED });
    const term = Elections.termOf(T());
    const seen = new Map();
    for (const [nid] of Game.nations) seen.set(nid, 0);
    for (let turn = 1; turn <= term; turn++) {
      World.setTurn(turn);
      for (const [nid] of Game.nations) if (Elections.due(nid, T())) seen.set(nid, seen.get(nid) + 1);
    }
    for (const [nid, count] of seen) equal(count, 1, `${nid} voted ${count} times in one term`);
  });

  it('and they are staggered, or the newspaper is a wall of them', async () => {
    await bootWorld({ seed: SEED });
    const term = Elections.termOf(T());
    let worst = 0;
    for (let turn = 1; turn <= term; turn++) {
      World.setTurn(turn);
      let n = 0;
      for (const [nid] of Game.nations) if (Elections.due(nid, T())) n++;
      worst = Math.max(worst, n);
    }
    ok(worst < Game.nations.size / 4, `${worst} of ${Game.nations.size} nations voted on one turn`);
  });

  it('the countdown agrees with the day', async () => {
    await bootWorld({ seed: SEED });
    // Turn 0 reads a full term for everybody: a world one quarter old has no
    // record to run on, and the countdown says so rather than reading "today"
    // beside a vote that will not happen.
    for (const [nid] of Game.nations) equal(Elections.nextFor(nid, T()), Elections.termOf(T()));
    World.setTurn(7);
    for (const [nid] of Game.nations) {
      const left = Elections.nextFor(nid, T());
      ok(left >= 0 && left < Elections.termOf(T()), `${nid} is ${left} turns from a vote`);
      equal(left === 0, Elections.due(nid, T()));
    }
  });
});

describe('Elections — the vote', () => {
  it('a government far from its own people loses, which is the point', async () => {
    /*
     * THE COSTUME FIX. California is 58% Democrat and 39% Republican; a player
     * who switches to Republican to defuse something now faces the electorate
     * over it, where before they held the seat for the rest of the game.
     */
    const { rng } = await bootWorld({ seed: SEED });
    Game.changeRulingIdeology('06', 'red', { force: true });
    const before = Elections.poll('06', T());
    ok(before.change, `the poll kept a minority government: ${before.summary}`);
    runToPolls('06', rng);
    const res = Elections.hold('06', T(), rng);
    ok(res.changed, 'the election kept a minority government');
    equal(Game.getNation('06').gov.rulingIdeology, 'blue');
  });

  it('the base is the population and nothing else', async () => {
    await bootWorld({ seed: SEED });
    const flat = TuneMeta.createTune();
    for (const k of ['wRecord', 'wOrder', 'wLiberties', 'wWeariness', 'wLeader']) {
      flat.set(`election.${k}`, 0);
    }
    const res = Elections.poll('06', flat);
    const d = Game.nationDemographics('06');
    equal(res.swing, 0);
    for (const row of res.rows) close(row.share, d.mix[row.i] / d.pop, 1e-9);
  });

  it('the record is measured against the world, not against a half', async () => {
    /*
     * The bug this pins: centred on 0.5, every incumbent on a board running QoL
     * in the eighties gets the same large bonus, which is not a record. Two
     * nations with identical politics and different records must swing
     * differently, and a nation AT the world average must swing on that term by
     * nothing at all.
     */
    await bootWorld({ seed: SEED });
    let sum = 0, n = 0;
    for (const [, rec] of Game.nations) { sum += rec.qol == null ? 0.5 : rec.qol; n++; }
    const mean = sum / n;
    const nation = Game.getNation('06');
    nation.qol = mean;
    const at = Elections.poll('06', T()).terms.find((x) => x.label === 'Record in office');
    close(at.contribution, 0, 1e-6, 'an average government is being paid for being average');
    nation.qol = Math.min(1, mean + T().get('election.spread'));
    const above = Elections.poll('06', T()).terms.find((x) => x.label === 'Record in office');
    ok(above.contribution > 0.1, `a standout record was worth ${above.contribution}`);
  });

  it('a bad decade costs the government that presided over it', async () => {
    await bootWorld({ seed: SEED });
    const n = Game.getNation('06');
    const good = Elections.poll('06', T()).swing;
    n.qol = 0.2; n.liberties = 0.2; n.weariness = 0.9;
    const bad = Elections.poll('06', T()).swing;
    ok(bad < good - 0.3, `war and hardship moved the swing from ${good} to ${bad}`);
    ok(bad < 0, 'a government that ruined the country still has an advantage');
  });

  it('and the poll is pure — it is read on every render', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    for (const [nid] of Game.nations) Elections.poll(nid, T());
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `polling changed ${k}`);
  });
});

describe('Elections — the result', () => {
  it('losing one costs the treasury nothing', async () => {
    /*
     * `changeRulingIdeology` charges for a course a government CHOSE. A
     * government that lost a vote did not choose anything, and charging one
     * would take money out of the treasury of a party that is no longer in
     * office.
     */
    const { rng } = await bootWorld({ seed: SEED });
    Game.changeRulingIdeology('06', 'red', { force: true });
    runToPolls('06', rng);
    // Read on polling day: the turns in between collect taxes, and a purse
    // measured before them is measuring the wrong thing.
    const purse = Game.getNation('06').treasury;
    const res = Elections.hold('06', T(), rng);
    ok(res.changed);
    equal(Game.getNation('06').treasury, purse, 'an election charged a rebranding fee');
  });

  it('and it writes one entry that says who won', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    runToPolls('06', rng);
    const before = Ledger.all().filter((e) => e.kind === 'election').length;
    const res = Elections.hold('06', T(), rng);
    const rows = Ledger.all().filter((e) => e.kind === 'election');
    equal(rows.length, before + 1);
    const last = rows[rows.length - 1];
    equal(last.subject, '06');
    equal(last.winner, res.winner);
    ok(/polls/.test(last.text), last.text);
  });

  it('a whole world turn holds the ones that are due', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    // A full term PLUS the opening turn, which is never a polling day: a world
    // one quarter old has no record to run on.
    for (let i = 0; i <= Elections.termOf(T()); i++) World.advanceTurn(T(), rng);
    const voted = new Set(Ledger.all().filter((e) => e.kind === 'election').map((e) => e.subject));
    for (const [nid] of Game.nations) ok(voted.has(nid), `${nid} never went to the polls`);
  });
});

describe('Elections — refusing the result', () => {
  it('only a government that has already ground its people down can', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const n = Game.getNation('06');
    n.liberties = 0.9;
    ok(!Elections.canSteal('06', T()), 'a free country set a vote aside');
    n.liberties = T().get('election.stealBelow') - 0.01;
    ok(Elections.canSteal('06', T()));
    // ...and the attempt is refused when there is nothing to refuse.
    equal(Elections.steal('06', T(), rng).ok, false);
  });

  it('it keeps the government, and costs the liberties that allowed it', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    Game.changeRulingIdeology('06', 'red', { force: true });
    const n = Game.getNation('06');
    runToPolls('06', rng);
    // AFTER the turns, not before: the stock is recomputed every one of them,
    // and a police state set up ten turns early is a free country by polling day.
    n.liberties = T().get('election.stealBelow') - 0.05;
    const res = Elections.hold('06', T(), rng);
    ok(res.changed, 'the minority government was not turned out to begin with');
    ok(Elections.pending('06'), 'there is no result to refuse');
    const before = n.liberties;
    const s = Elections.steal('06', T(), rng);
    ok(s.ok, s.reason);
    equal(Game.getNation('06').gov.rulingIdeology, 'red', 'the stolen election did not stick');
    close(Game.getNation('06').liberties, before - T().get('election.stealLibertiesHit'), 1e-9);
    ok(!Elections.pending('06'), 'the result can be refused twice');
    const last = Ledger.all().filter((e) => e.kind === 'election').pop();
    ok(last.stolen, 'the newspaper does not say it was refused');
  });

  it('a nation the caller defers is left with the decision open', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    Game.changeRulingIdeology('06', 'red', { force: true });
    runToPolls('06', rng);
    Game.getNation('06').liberties = T().get('election.stealBelow') - 0.05;
    const out = Elections.tick(T(), rng, { defer: (nid) => nid === '06' });
    const mine = out.find((r) => r.nid === '06');
    ok(mine && mine.changed, 'the deferred nation did not hold an election at all');
    ok(!mine.stolen, 'the caller was not given the choice');
    ok(Elections.pending('06'), 'the window closed before the caller could decide');
  });

  it('and everybody else who can, does', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    Game.changeRulingIdeology('06', 'red', { force: true });
    runToPolls('06', rng);
    Game.getNation('06').liberties = T().get('election.stealBelow') - 0.05;
    const out = Elections.tick(T(), rng);
    const mine = out.find((r) => r.nid === '06');
    ok(mine && mine.stolen, 'a police state politely conceded');
    equal(Game.getNation('06').gov.rulingIdeology, 'red');
  });

  it('the open decision survives a save', async () => {
    /*
     * `gov` is serialized wholesale and rebuilt through `makeGov`, which names
     * its fields — so a field not named there is dropped by a round trip, and
     * the game would reopen with the result already conceded and the choice
     * gone.
     */
    const ctx = await bootWorld({ seed: SEED });
    Game.changeRulingIdeology('06', 'red', { force: true });
    runToPolls('06', ctx.rng);
    Game.getNation('06').liberties = T().get('election.stealBelow') - 0.05;
    Elections.hold('06', T(), ctx.rng);
    ok(Elections.pending('06'));
    const doc = StateDoc.assemble({ seed: ctx.seed, rng: ctx.rng, areasDef: ctx.raw.areas });
    StateDoc.applyModel(doc);
    ok(Elections.pending('06'), 'a save closed the window on a result nobody had settled');
    equal(Game.getNation('06').gov.lostFrom, 'red');
  });
});

describe('Elections — the leader clock', () => {
  it('a government that changes hands is a new person', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    Game.changeRulingIdeology('06', 'red', { force: true });
    const was = Leaders.of('06', rng, T());
    runToPolls('06', rng);
    const res = Elections.hold('06', T(), rng);
    ok(res.changed);
    ok(Leaders.all()['06'].name !== was.name || Leaders.all()['06'].since === World.getTurn(),
      'the same person carried on under a government that lost');
  });

  it('and a party that wins again eventually fields a new face', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const term = T().get('leader.termTurns');
    // Seat somebody long enough ago that their term is up.
    const seat = Leaders.of('06', rng, T());
    const wasName = seat.name;
    seat.since = World.getTurn() - term;
    runToPolls('06', rng);
    const res = Elections.hold('06', T(), rng);
    if (res.changed) return; // the electorate answered a different question
    ok(Leaders.all()['06'].name !== wasName || Leaders.all()['06'].since >= World.getTurn() - 1,
      'a leader served past their term because nothing was watching the clock');
  });

  it('nobody is retired by a bare timer any more', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = Leaders.of('06', rng, T());
    before.since = -1000; // an impossibly long service
    const out = Leaders.tick(T(), rng);
    equal(out.replaced, 0, 'the leader timer is still running outside the election');
    equal(Leaders.all()['06'].name, before.name);
  });
});

describe('Elections — a played game', () => {
  it('governments change hands, but not every time', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 3 * Elections.termOf(T()); i++) World.advanceTurn(T(), rng);
    const rows = Ledger.all().filter((e) => e.kind === 'election');
    const changed = rows.filter((e) => e.changed).length;
    ok(rows.length > 100, `only ${rows.length} elections in three full terms`);
    ok(changed > 0, 'three terms of elections and no government ever lost one');
    ok(changed < rows.length * 0.6,
      `${changed} of ${rows.length} elections turned a government out; that is a lottery`);
  });

  it('and the world is still the world afterwards', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 2 * Elections.termOf(T()); i++) World.advanceTurn(T(), rng);
    for (const [nid, n] of Game.nations) {
      ok(n.gov.rulingIdeology, `${nid} is governed by nothing`);
      ok(Ideology.index(n.gov.rulingIdeology) >= 0, `${nid} is governed by "${n.gov.rulingIdeology}"`);
      ok(n.treasury > -Infinity && Number.isFinite(n.treasury), `${nid} has a broken treasury`);
    }
  });
});
