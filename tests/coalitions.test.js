/*
 * M7.2 — who the continent is ganging up on, and why.
 *
 *   threat(n) = size_share(n) × (1 − influence(n))
 *
 * BEING BIG IS NOT THE CRIME, and that is the whole design: a nation can hold
 * half the map untouched if the other half is glad it is there, and a middling
 * one can be surrounded because of how it got there. Most of what is pinned
 * below is that property.
 *
 * What it replaces is `blueShell`, a tier by size rank, which finding 36
 * measured: with the shell fully applied California still took 692 Areas on turn
 * 1 and 1,602 of 1,676 by turn 3, with zero civil wars. It was a multiplier on a
 * roll that rarely happens, and it was automatic. A coalition costs its target
 * money EVERY TURN, standing every turn, and puts its members' border armies in
 * the way — and it is a set of named nations with reasons, so it can be escaped.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';
import * as RNG from '../js/rng.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** Make one nation enormous by handing it everything except a few neighbours. */
function makeGiant(nid, keep = 6) {
  const others = Object.keys(Game.county).filter((f) => Game.getOwner(f) !== nid);
  Game.moveCounties(others.slice(0, Math.max(0, others.length - keep * 20)), nid,
    { silent: true, reason: 'annex' });
  return Game.getNation(nid);
}

describe('The trigger', () => {
  it('nobody is a threat at the opening position', async () => {
    await bootWorld({ seed: SEED });
    equal(Coalitions.all(T()).length, 0, 'somebody was already being ganged up on at turn 0');
    for (const [nid] of Game.nations) equal(Coalitions.pressure(nid, T()), 0);
  });

  it('threat is size against standing, and says so', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    const rec = Coalitions.against(nid, T());
    ok(rec.share > 0.5, `the giant holds ${(rec.share * 100).toFixed(0)}% of the continent`);
    close(rec.threat, rec.share * (1 - rec.influence), 1e-9,
      'threat is not size against standing');
    ok(rec.formed, 'an enormous nation nobody likes faced no coalition');
  });

  it('BEING BIG IS NOT THE CRIME: a beloved giant is left alone', async () => {
    /*
     * The design in one test. Same nation, same map, same everything — only the
     * Influence differs, and the coalition dissolves. Influence is the stock the
     * rest of the game already spends on being tolerable, and this is what makes
     * spending it worth something.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    ok(Coalitions.against(nid, T()).formed, 'the feared giant faced nobody');
    n.influence = 0.99;
    Coalitions.reset();
    equal(Coalitions.against(nid, T()).formed, false,
      'a giant with the continent\'s goodwill was ganged up on anyway');
    equal(Coalitions.pressure(nid, T()), 0);
  });

  it('a small nation with no friends is still not a threat', async () => {
    await bootWorld({ seed: SEED });
    const nid = '44';                     // Rhode Island
    Game.getNation(nid).influence = 0.01;
    for (const [other] of Game.nations) {
      if (other !== nid) Relations.record(other, nid, 'warred', { scale: 3, tune: T() });
    }
    equal(Coalitions.against(nid, T()).formed, false,
      'the continent lined up against a nation it could ignore');
  });
});

describe('Who joins, and why', () => {
  it('nations that resent it, and nations that border it', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    const rec = Coalitions.against(nid, T());
    ok(rec.members.length > 0, 'a coalition formed with nobody in it');
    const near = new Set(Game.adjacentNations(nid));
    for (const m of rec.members) {
      ok(m.why === 'resents' || m.why === 'borders', `a member joined for "${m.why}"`);
      if (m.why === 'borders') ok(near.has(m.nid), `${m.name} borders nobody`);
      else ok(m.standing <= T().get('coalition.joinRelation'), `${m.name} does not resent it`);
      ok(m.weight > 0);
    }
    // The reason is a VERB, not a sentence: the model does not know whose card
    // it is being rendered on.
    for (const m of rec.members) ok(!/\byou\b|\bthem\b/.test(m.why));
  });

  it('a neighbour is in it before it has a grievance', async () => {
    /*
     * Which is what stops a conqueror being safe simply because it has not got
     * round to its neighbours yet.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    equal(Relations.count(), 0, 'the fixture recorded a grievance it did not mean to');
    const rec = Coalitions.against(nid, T());
    ok(rec.members.some((m) => m.why === 'borders'),
      'nobody joined out of proximity, so a fresh conqueror faces nobody');
  });

  it('and a rump on the far coast is not a check on anybody', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    const floor = T().get('coalition.minMemberShare');
    for (const m of Coalitions.against(nid, T()).members) {
      ok(m.weight >= floor, `${m.name} weighs ${m.weight} and counts as a member`);
    }
  });

  it('pressure is the coalition\'s share of the continent, not its head count', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    const rec = Coalitions.against(nid, T());
    close(rec.pressure, Math.min(1, rec.weight / T().get('coalition.fullShare')), 1e-9);
    ok(rec.pressure >= 0 && rec.pressure <= 1);
  });
});

describe('What it costs, every turn', () => {
  it('money, whether or not anybody attacks', async () => {
    /*
     * Finding 36's own recommendation: "make the penalty something the leader
     * feels every turn rather than a multiplier on a roll".
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.99;
    Coalitions.reset();
    const calm = Game.treasuryFlow(nid);
    equal(calm.encirclement, 0, 'a tolerated giant was charged for encirclement');
    n.influence = 0.1;
    Coalitions.reset();
    const pressed = Game.treasuryFlow(nid);
    ok(pressed.encirclement > 0, 'being surrounded cost nothing');
    ok(pressed.maintenance > calm.maintenance, 'the bill did not go up');
    close(pressed.pressure, Coalitions.pressure(nid, T()), 1e-9,
      'the treasury and the coalition disagree about the pressure');
  });

  it('standing, which is the loop closing', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    Coalitions.reset();
    const rec = Power.influence(
      Power.gatherInfluence(Power.nationFacts(nid, T()), World.getTurn(), T(), Power.worldContext()),
      T());
    const term = rec.inputs.find((i) => i.label === 'Coalition');
    ok(term, 'Influence does not know about the coalition against it');
    ok(term.contribution < 0, 'being surrounded raised its standing');
    close(term.raw, Coalitions.pressure(nid, T()), 1e-9);
  });

  it('and their armies stand in the way of the next annexation', async () => {
    /*
     * A coalition is not a treaty that has to be invoked; it is the fact that
     * three of your neighbours have their armies pointed at you, and they are
     * pointed at you whether or not today's victim is one of them.
     */
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    Coalitions.reset();
    const rec = Coalitions.against(nid, T());
    if (!rec.members.length) return;
    const victim = rec.members.find((m) => m.near) || rec.members[0];
    const other = rec.members.find((m) => m.nid !== victim.nid);
    if (!other) return;
    const withThem = Military.warMultiplier(nid, [victim.nid], T());
    const saved = Coalitions.against;
    Coalitions.against = () => null;
    const alone = Military.warMultiplier(nid, [victim.nid], T());
    Coalitions.against = saved;
    ok(withThem > alone,
      `the coalition's other members did not weigh in (${alone.toFixed(3)} -> ${withThem.toFixed(3)})`);
  });
});

describe('It is the anti-snowball, and it is escapable', () => {
  it('blueShell now IS the coalition pressure, so every old caller reads it', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    const n = makeGiant(nid);
    n.influence = 0.1;
    Coalitions.reset();
    close(Game.blueShell(nid), Coalitions.pressure(nid, T()), 1e-9,
      'the anti-snowball scalar and the coalition disagree');
    // ...and it is still what the annexation preview charges a surcharge on.
    Game.getNation(nid).treasury = 1e15;
    const targets = [...Game.annexTargets(nid)].slice(0, 2);
    if (!targets.length) return;
    const p = Moves.plan({ type: 'annex', nid, areas: targets }, T());
    close(p.shell, Coalitions.pressure(nid, T()), 1e-9);
  });

  it('lower the threat and it dissolves, which a rank never did', async () => {
    await bootWorld({ seed: SEED });
    const nid = '06';
    /*
     * A MODERATE giant, not a total one. At 90% of the continent no amount of
     * goodwill makes you not a threat, and that is correct — the escape hatch is
     * for a large power, not for a nation that has already won.
     */
    const n = Game.getNation(nid);
    const grab = [...Game.annexTargets(nid)];
    Game.moveCounties(grab, nid, { silent: true, reason: 'annex' });
    n.influence = 0.05;
    Coalitions.reset();
    const rec = Coalitions.against(nid, T());
    ok(rec.share < 0.4, `the fixture built a ${(rec.share * 100).toFixed(0)}% giant, which is too big to test escape`);
    ok(rec.formed, 'a large nation nobody likes faced no coalition');
    // Earn the continent's goodwill back.
    n.influence = 0.95;
    Coalitions.reset();
    equal(Coalitions.against(nid, T()).formed, false, 'the coalition would not let go');
    equal(Game.blueShell(nid), 0, 'the anti-snowball penalty outlived the coalition');
  });

  it('surveying changes nothing', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 8; i++) World.advanceTurn(T(), rng);
    const before = fingerprint();
    Coalitions.all(T());
    for (const [nid] of Game.nations) Coalitions.pressure(nid, T());
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `surveying changed ${k}`);
  });

  it('and a played game produces some, but not many', async () => {
    /*
     * A coalition against everybody is a rule about size wearing a costume. The
     * point is that it is rare and specific.
     */
    const { rng } = await bootWorld({ seed: SEED });
    Game.setPlayer(TurnSystem.currentId());
    for (let i = 0; i < 40; i++) { TurnSystem.advance(T(), rng); AI.sweep(T(), rng); }
    const coals = Coalitions.all(T());
    ok(coals.length <= Math.ceil(Game.nations.size * 0.25),
      `${coals.length} of ${Game.nations.size} nations are being ganged up on`);
    for (const c of coals) {
      ok(c.threat >= T().get('coalition.trigger'));
      ok(c.summary && /[.!?]$/.test(c.summary), `the summary is not a sentence: "${c.summary}"`);
    }
  });
});
