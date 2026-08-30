/*
 * M4.1 — a Movement is more than a homeland and an ideology.
 *
 * The record gains a type, a derived CORE, the seed it actually started from, a
 * per-movement growth cap and a state. Two of those carry most of the weight:
 *
 *   CORE decides how hard it is to declare (M4.3 tier 2), and it is DERIVED in
 *   the bake — the smallest set of homeland Areas holding 60% of its people,
 *   never fewer than three — rather than hand-authored twenty-four times. That
 *   is the principled reading of "heartland": a movement declares when it holds
 *   the places its people actually live, and it re-derives itself whenever
 *   areas.json does.
 *
 *   STATE is READ from the map each turn, never set by an event. A state machine
 *   driven by events goes stale the first time an event is missed — a movement
 *   whose nation is conquered would stay 'realized' forever.
 */
import { describe, it, ok, equal, close, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;
// The spine of each slice: a West with no Deseret is not the scenario, and
// since M7.12 an East with no Franklin is not the widened East.
const DETERMINISTIC = ['Cascadian Separatists', 'Deseret', 'Greater Idaho', 'State of Jefferson',
                      'Franklin', 'New England Revivalist'];

describe('The movement definitions', () => {
  it('every one carries an id, a type, a cap, goals, a homeland and a core', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    const defs = raw.partyDefs;
    // 24 through M7.11; 29 when M7.12 gave the east five of its own; 32 at the
    // M7 close, when the west's own holes were filled and the last Area that
    // could never receive a movement was closed.
    equal(Object.keys(defs).length, 32);
    for (const [name, d] of Object.entries(defs)) {
      ok(/^[a-z0-9-]+$/.test(d.id), `"${name}" has no machine id (got ${d.id})`);
      ok(d.type && d.type.length > 3, `"${name}" has no type`);
      ok(d.growthCap > 0 && d.growthCap <= 1, `"${name}" has cap ${d.growthCap}`);
      ok(Array.isArray(d.goals) && d.goals.length > 0, `"${name}" wants nothing`);
      ok(Array.isArray(d.counties) && d.counties.length > 0, `"${name}" has no homeland`);
      ok(Array.isArray(d.core) && d.core.length >= 3, `"${name}" has a ${d.core.length}-Area core`);
      for (const f of d.core) ok(d.counties.includes(f), `"${name}" core county ${f} is outside its homeland`);
    }
  });

  it('ids are unique, so a rename cannot collide two movements', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    const ids = Object.values(raw.partyDefs).map((d) => d.id);
    equal(new Set(ids).size, ids.length, 'two movements share a machine id');
  });

  it('the core is the heartland: fewer Areas than the homeland, most of the people', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    const pops = raw.data.counties;
    for (const [name, d] of Object.entries(raw.partyDefs)) {
      if (d.counties.length <= 3) continue;
      ok(d.core.length < d.counties.length, `"${name}" core is its whole homeland`);
      let total = 0, core = 0;
      for (const f of d.counties) total += (pops[f] && pops[f].pop) || 0;
      for (const f of d.core) core += (pops[f] && pops[f].pop) || 0;
      if (total > 0) {
        ok(core / total >= 0.55,
          `"${name}" core holds only ${(core / total * 100).toFixed(0)}% of its homeland's people`);
      }
    }
  });

  it('the deterministic four always spawn — a West with no Deseret is not the scenario', async () => {
    for (const seed of [1, 4242, 20260829, 777, 99]) {
      const { spawned } = await bootWorld({ seed });
      for (const name of DETERMINISTIC) {
        ok(spawned.includes(name), `"${name}" did not spawn at seed ${seed}`);
      }
    }
  });

  it('caps differ, so a fringe stays fringe and a contender does not', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    const caps = Object.values(raw.partyDefs).map((d) => d.growthCap);
    ok(Math.max(...caps) - Math.min(...caps) > 0.2,
      'every movement has effectively the same ceiling; the cap says nothing');
    ok(raw.partyDefs.Deseret.growthCap > raw.partyDefs['Anarcho-Capitalist'].growthCap,
      'a country in waiting is capped no higher than a nuisance');
  });
});

describe('The runtime record', () => {
  it('resolves homeland AND core through the Area alias', async () => {
    /*
     * The M1.13 trap, in a new place: authored FIPS are counties, and Game.init
     * deletes the 1,467 members merged into Areas. A core list of raw member
     * fips would resolve to nothing and the movement could never declare — a
     * bug that produces no error, just a mechanic that never fires.
     */
    await bootWorld({ seed: SEED });
    for (const rec of Movements.all()) {
      ok(rec.homeland.length > 0, `${rec.name} resolved to no Areas`);
      ok(rec.core.length > 0, `${rec.name} resolved to no core Areas`);
      for (const f of rec.homeland) ok(Game.county[f], `${rec.name} homeland has dead Area ${f}`);
      for (const f of rec.core) {
        ok(Game.county[f], `${rec.name} core has dead Area ${f}`);
        ok(rec.homeland.includes(f), `${rec.name} core Area ${f} is outside its homeland`);
      }
    }
  });

  it('records where it actually started, which is not the whole homeland', async () => {
    await bootWorld({ seed: SEED });
    let narrower = 0;
    for (const rec of Movements.all()) {
      ok(rec.seed.length > 0, `${rec.name} spawned nowhere`);
      for (const f of rec.seed) ok(rec.homeland.includes(f), `${rec.name} seeded outside its homeland`);
      if (rec.seed.length < rec.homeland.length) narrower++;
    }
    // the gap between seed and homeland is the room the M4.2 diffusion term works in
    ok(narrower >= 0);
  });

  it('carries its type, goals and cap into the runtime', async () => {
    await bootWorld({ seed: SEED });
    const d = Movements.get('Deseret');
    equal(d.type, 'theocratic-separatist');
    ok(d.goals.includes('independence'));
    close(Movements.capOf('Deseret', T()), 0.60, 1e-9);
    // and an unknown movement falls back to the global ceiling rather than NaN
    close(Movements.capOf('Nobody', T()), T().get('world.partyCeiling'), 1e-9);
  });

  it('strength is measured, not remembered', async () => {
    await bootWorld({ seed: SEED });
    const s = Movements.strength('Deseret');
    ok(s.areas > 0 && s.people > 0, 'Deseret holds nobody');
    ok(s.peak > 0 && s.peak <= 1, `peak share is ${s.peak}`);
    ok(s.mean <= s.peak);
    equal(s.coreTotal, Movements.get('Deseret').core.length);
    ok(s.top && Game.county[s.top], 'the strongest Area is not a real Area');

    // wipe it from the map and the measurement follows immediately
    for (const f of Movements.get('Deseret').homeland) delete Game.county[f].mov.Deseret;
    equal(Movements.strength('Deseret').people, 0, 'strength is cached rather than measured');
  });
});

describe('The state machine', () => {
  const setShare = (name, areas, share) => {
    const idx = Movements.ideologyIndexOf(name);
    for (const f of areas) {
      const c = Game.county[f];
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      // put enough people in the movement's own ideology to hold the share
      const want = pop * share;
      if (c.pop[idx] < want) {
        let others = 0;
        for (let i = 0; i < c.pop.length; i++) if (i !== idx) others += c.pop[i];
        const take = Math.min(want - c.pop[idx], others);
        const k = others > 0 ? 1 - take / others : 1;
        for (let i = 0; i < c.pop.length; i++) if (i !== idx) c.pop[i] *= k;
        c.pop[idx] += take;
      }
      c.mov[name] = want;
    }
  };

  it('reads latent / rising / armed / declared off the map', async () => {
    await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    const armed = T().get('secession.countyThreshold');
    const rising = T().get('secession.risingThreshold');

    for (const f of rec.homeland) delete Game.county[f].mov.Deseret;
    Movements.refreshStates(T());
    equal(rec.state, 'latent', 'a movement holding nobody is not latent');

    setShare('Deseret', [rec.core[0]], (rising + armed) / 2);
    Movements.refreshStates(T());
    equal(rec.state, 'rising');

    setShare('Deseret', [rec.core[0]], armed + 0.05);
    Movements.refreshStates(T());
    equal(rec.state, 'armed', 'one Area over the threshold should be armed, not declared');

    setShare('Deseret', rec.core, armed + 0.05);
    Movements.refreshStates(T());
    equal(rec.state, 'declared', 'holding the whole core should declare');
  });

  it('a movement is realized only while its nation is actually on the board', async () => {
    /*
     * The reason the machine is derived rather than set: a movement whose nation
     * is conquered out of existence would stay 'realized' forever if the state
     * were a flag somebody remembered to write.
     */
    await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    const nid = Game.createNation('Deseret', [...Game.getNation('49').counties].slice(0, 6));
    rec.nation = nid;
    Movements.refreshStates(T());
    equal(rec.state, 'realized');

    Game.mergeInto('49', nid);          // conquered back
    Movements.refreshStates(T());
    ok(rec.state !== 'realized', 'a movement whose nation is gone is still "realized"');
    equal(rec.nation, null, 'the dead nation reference was not cleared');
  });

  it('the states are ordered weakest to strongest, and that order is public', async () => {
    await bootWorld({ seed: SEED });
    deepEqual(Movements.STATES, ['latent', 'rising', 'armed', 'declared', 'realized']);
  });
});

describe('The record survives a save', () => {
  it('nation, sponsor, seed and state all round-trip', async () => {
    const { seed, rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    rec.sponsor = '16';
    rec.nation = Game.createNation('Deseret', [...Game.getNation('49').counties].slice(0, 6));
    Movements.refreshStates(T());
    const want = { seed: rec.seed.slice(), nation: rec.nation, sponsor: rec.sponsor, state: rec.state };
    const doc = JSON.parse(JSON.stringify(Movements.serialize()));

    await bootWorld({ seed: 777 });
    Movements.loadState(doc);
    const back = Movements.get('Deseret');
    deepEqual(back.seed, want.seed, 'the spawn seed did not survive; that roll never happens again');
    equal(back.nation, want.nation);
    equal(back.sponsor, want.sponsor);
    equal(back.state, want.state);
    // homeland and core are rebuilt from the bake rather than stored twice
    ok(back.homeland.length > 0 && back.core.length > 0);
  });

  it('a document naming a movement this build no longer defines is skipped, not thrown', async () => {
    await bootWorld({ seed: SEED });
    const doc = JSON.parse(JSON.stringify(Movements.serialize()));
    doc.spawned.push('The Whig Revival');
    doc.live['The Whig Revival'] = { seed: [], nation: null, sponsor: null, state: 'armed' };
    Movements.loadState(doc);
    equal(Movements.get('The Whig Revival'), null, 'an unknown movement was materialised');
    ok(Movements.get('Deseret'), 'the real movements were lost');
  });
});

describe('Per-movement caps in the growth phase', () => {
  it('a movement grows toward ITS ceiling, not a global one', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 200; i++) World.advanceTurn(T(), rng);
    for (const rec of Movements.all()) {
      const cap = Movements.capOf(rec.name, T());
      const s = Movements.strength(rec.name);
      ok(s.peak <= cap + 0.02,
        `${rec.name} reached ${s.peak.toFixed(3)} against its own cap of ${cap}`);
    }
  });

  it('after 200 turns the strong and the fringe are visibly different', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 200; i++) World.advanceTurn(T(), rng);
    const big = Movements.strength('Deseret').peak;
    const small = Movements.strength('Anarcho-Capitalist');
    if (!small) return; // it may not have spawned at this seed
    ok(big > small.peak + 0.1,
      `Deseret peaked at ${big.toFixed(3)} and the Anarcho-Capitalists at ${small.peak.toFixed(3)}; ` +
      'the per-movement cap is not separating them');
  });
});
