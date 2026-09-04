/*
 * M4.3 — two-tier secession.
 *
 *   TIER 2, discrete: a movement whose CORE is entirely over the threshold
 *   declares, and its over-threshold Areas break away as a nation through the
 *   Game.breakApart + TurnSystem.insertAfter machinery that already existed for
 *   civil wars.
 *
 *   TIER 1, continuous: once that nation exists, further Areas that cross the
 *   threshold defect to it, a few per turn.
 *
 * The two tiers have deliberately distinct jobs. Declaring is how a movement
 * becomes a country; defecting is how that country grows. Letting tier 1 create
 * nations too would turn the map to confetti — at a 0.40 threshold with caps up
 * to 0.60, dozens of Areas sit over the line at once.
 *
 * The milestone acceptance is at the bottom: play forty turns and have a
 * breakaway fire that nobody scripted, with the reason legible.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

/*
 * A claim big enough to be a country: the core, plus enough of the homeland to
 * clear `nation.minAreas`.
 *
 * Forcing the bare core used to be enough, because the floor was three Areas and
 * every core cleared it. M6.3 raised the floor — a three-Area country is how a
 * map turns to confetti — and `phaseSecession`'s own comment has always said the
 * rule it means to enforce: a movement declares when it can hold A COUNTRY, not
 * when it has enough Areas somewhere. So the fixture now sets up a claim that
 * can, which is what these tests were always about.
 */
function claim(rec) {
  /*
   * Grown by ADJACENCY from the core, not by taking the first few homeland
   * entries: the declaration rule tests the largest CONNECTED piece of the
   * claim, so a scattered set of the right size still fails — which is the
   * rule working, and would have looked like the fixture failing.
   *
   * M8.2: grown from the largest connected piece OF THE CORE, not from the
   * whole core. The core is derived as "the smallest set of homeland Areas
   * holding 60% of the people", and nothing makes that contiguous — once
   * Deseret's homeland widened to the full Mormon Corridor its core became the
   * Wasatch Front plus St George, 300 miles down the interstate, and growing
   * from `core[0]` produced a claim of seven Areas in two pieces of four and
   * three. The rule then correctly refused to found a country on it and three
   * tests reported a movement that would not declare. The whole core is still
   * included, because tier 2 will not even look at a movement until every core
   * Area is over the line.
   */
  const home = new Set(rec.homeland);
  const need = window.TUNE.get('nation.minAreas') + 2;
  const pieces = Game.components(new Set(rec.core), null).sort((a, b) => b.length - a.length);
  const out = [...(pieces[0] || rec.core)];
  const have = new Set(out);
  for (let i = 0; i < out.length && out.length < need; i++) {
    for (const nb of Game.countyNeighbors(out[i])) {
      if (out.length >= need) break;
      if (home.has(nb) && !have.has(nb)) { out.push(nb); have.add(nb); }
    }
  }
  for (const f of rec.core) if (!have.has(f)) { out.push(f); have.add(f); }
  return out;
}

/** Push a movement over the threshold in the given Areas. */
function force(name, areas, share) {
  const idx = Movements.ideologyIndexOf(name);
  for (const f of areas) {
    const c = Game.county[f];
    if (!c) continue;
    let pop = 0;
    for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
    const want = pop * share;
    let others = 0;
    for (let i = 0; i < c.pop.length; i++) if (i !== idx) others += c.pop[i];
    const take = Math.min(Math.max(0, want - c.pop[idx]), others);
    if (take > 0 && others > 0) {
      const k = 1 - take / others;
      for (let i = 0; i < c.pop.length; i++) if (i !== idx) c.pop[i] *= k;
      c.pop[idx] += take;
    }
    c.mov[name] = Math.min(c.pop[idx], want);
  }
}

describe('Tier 2 — declaration', () => {
  it('a movement that holds its whole core breaks away', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    const over = T().get('secession.countyThreshold') + 0.08;
    force('Deseret', rec.homeland, over);

    const events = World.phaseSecession(T(), rng);
    const declare = events.find((e) => e.kind === 'declare' && e.movement === 'Deseret');
    ok(declare, `Deseret held its whole core and did not declare; events=${JSON.stringify(events)}`);
    // NOT `nations.size > before`: forcing the whole homeland consumes Utah
    // entirely, so the roster stays the same size while its membership changes.
    ok(Game.getNation(declare.nation), 'the declaration named a nation that does not exist');
    equal(Movements.get('Deseret').state, 'realized');
    const n = Game.getNation(Movements.get('Deseret').nation);
    ok(n, 'the movement points at a nation that does not exist');
    equal(n.name, 'Deseret', 'the new nation did not take the movement\'s name');
    equal(n.gov.rulingIdeology, rec.ideology, 'the new state is not governed by its own movement');
  });

  it('does NOT declare while one core Area is short', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    const over = T().get('secession.countyThreshold') + 0.08;
    force('Deseret', rec.homeland, over);
    force('Deseret', [rec.core[0]], T().get('secession.countyThreshold') - 0.05); // one holdout
    const events = World.phaseSecession(T(), rng);
    equal(events.filter((e) => e.kind === 'declare').length, 0,
      'a movement declared with a core Area still under the threshold');
    equal(Movements.get('Deseret').state, 'armed');
  });

  it('the parent records the loss, on the same turn the event names', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    // A viable claim but not the whole homeland, so Utah survives to record the
    // loss. Forcing everything consumes the parent and there is nobody left
    // holding the ledger.
    force('Deseret', claim(rec), T().get('secession.countyThreshold') + 0.08);
    const events = World.phaseSecession(T(), rng);
    const declare = events.find((e) => e.kind === 'declare');
    ok(declare);
    let recorded = null;
    for (const [, n] of Game.nations) {
      const e = n.lost.find((l) => l.reason === 'declare');
      if (e) recorded = { name: n.name, turn: e.turn, areas: e.areas };
    }
    ok(recorded, 'nobody recorded losing the ground that broke away');
    equal(recorded.turn, declare.turn,
      'the event and the history disagree about which turn the secession happened on');
  });

  it('the new nation joins the turn order', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    force('Deseret', claim(Movements.get('Deseret')), T().get('secession.countyThreshold') + 0.08);
    World.phaseSecession(T(), rng);
    equal(TurnSystem.snapshot().order.length, Game.nations.size,
      'the turn order and the roster disagree: a nation either never acts or a dead one still does');
    for (const id of TurnSystem.snapshot().order) {
      ok(Game.getNation(id), `the turn order still lists ${id}, which no longer exists`);
    }
  });

  it('a claim too small to stand alone does not become a country', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    // over the line in the core only, and the core is smaller than minAreas... it
    // is not, so shrink the claim by hand to one Area
    force('Deseret', rec.homeland, 0);
    force('Deseret', [rec.core[0]], T().get('secession.countyThreshold') + 0.08);
    const before = Game.nations.size;
    World.phaseSecession(T(), rng);
    equal(Game.nations.size, before, 'a single Area became a country');
  });
});

describe('Independence has a price and a grace period', () => {
  const declare = async (seed) => {
    const { rng } = await bootWorld({ seed });
    const rec = Movements.get('Deseret');
    force('Deseret', rec.homeland, T().get('secession.countyThreshold') + 0.08);
    const gdpBefore = [...rec.homeland].reduce((t, f) => t + Game.countyGdp(f), 0);
    const events = World.phaseSecession(T(), rng);
    const d = events.find((e) => e.kind === 'declare');
    return { rng, d, n: d ? Game.getNation(d.nation) : null, gdpBefore };
  };

  it('transition costs GDP, proportionally across the new state', async () => {
    const { d, n, gdpBefore } = await declare(SEED);
    ok(d && n);
    let after = 0;
    for (const f of n.counties) after += Game.countyGdp(f);
    const loss = T().get('secession.transitionGdpLoss');
    ok(after < gdpBefore * (1 - loss * 0.5),
      `independence cost nothing: ${gdpBefore.toExponential(3)} -> ${after.toExponential(3)}`);
  });

  it('the honeymoon carries a newborn state that has nothing else', async () => {
    /*
     * A nation founded this turn has no age, no tenure and no reserves — every
     * other Authority term reads zero. Without the honeymoon it would be the
     * weakest government on the board on the day of its founding and would
     * immediately start shedding the Areas that just fought to join it.
     */
    const { d, n } = await declare(SEED);
    ok(d && n);
    equal(n.honeymoonUntil, d.turn + T().get('secession.honeymoonTurns'));
    World.begin(T());
    const hm = n.why.authority.inputs.find((i) => i.label === 'Honeymoon');
    ok(hm && hm.contribution > 0.05,
      `the honeymoon contributed only ${hm ? hm.contribution.toFixed(3) : 'nothing'}`);
    ok(n.authority > T().get('power.authority.base'),
      `a newborn nation opened at ${n.authority.toFixed(3)}, below the base`);
  });

  it('and it expires, visibly', async () => {
    const { rng, d, n } = await declare(SEED);
    ok(d && n);
    World.begin(T());
    const first = n.why.authority.inputs.find((i) => i.label === 'Honeymoon').contribution;
    for (let i = 0; i < T().get('secession.honeymoonTurns') + 2; i++) World.advanceTurn(T(), rng);
    const later = Game.getNation(d.nation);
    if (!later) return; // it may have been absorbed; that is a different test
    const hm = later.why.authority.inputs.find((i) => i.label === 'Honeymoon');
    equal(hm.contribution, 0, `the honeymoon was still worth ${hm.contribution} after it should have run out`);
    ok(first > 0);
  });

  it('the founding territory is not counted as a conquest', async () => {
    /*
     * `createNation` grants its ground through `moveCounties`, which records it
     * as an acquisition — and Authority and Influence read those records as
     * conquest. Measured before the fix: a movement declaring with 39 Areas
     * opened with Overreach at -0.123 and Influence pinned at the floor, for
     * taking nothing from anyone it had not already been living in.
     */
    const { d, n } = await declare(SEED);
    ok(d && n);
    World.begin(T());
    const over = n.why.authority.inputs.find((i) => i.label === 'Overreach');
    const wars = n.why.authority.inputs.find((i) => i.label === 'Wars won');
    equal(over.contribution, 0, 'a nation was penalised for overreach on the day it was born');
    equal(wars.contribution, 0, 'a nation was credited with a war it did not fight');
    const conquest = n.why.influence.inputs.find((i) => i.label === 'Conquest');
    equal(conquest.contribution, 0, 'the world treated a declaration of independence as a conquest');
    ok(n.influence > T().get('power.floor'), 'the new state opened as an international pariah');
  });
});

describe('Tier 1 — defection', () => {
  it('an over-threshold Area next door joins the movement\'s country', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    force('Deseret', claim(rec), T().get('secession.countyThreshold') + 0.08);
    World.phaseSecession(T(), rng);
    const nid = Movements.get('Deseret').nation;
    ok(nid && Game.getNation(nid), 'Deseret did not get a country to defect to');

    // now push a neighbouring homeland Area over the line
    const held = new Set(Game.getNation(nid).counties);
    const frontier = rec.homeland.find((f) => !held.has(f)
      && Game.countyNeighbors(f).some((nb) => held.has(nb)));
    ok(frontier, 'Deseret has no frontier to grow along');
    force('Deseret', [frontier], T().get('secession.countyThreshold') + 0.1);

    const events = World.phaseSecession(T(), rng);
    const defect = events.find((e) => e.kind === 'defect' && e.area === frontier);
    ok(defect, `the frontier Area did not defect; events=${JSON.stringify(events)}`);
    equal(Game.getOwner(frontier), nid);
  });

  it('but not from across the map — a country grows along its frontier', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    force('Deseret', claim(rec), T().get('secession.countyThreshold') + 0.08);
    World.phaseSecession(T(), rng);
    const nid = Movements.get('Deseret').nation;
    const held = new Set(Game.getNation(nid).counties);
    const distant = rec.homeland.find((f) => !held.has(f)
      && !Game.countyNeighbors(f).some((nb) => held.has(nb)));
    if (!distant) return; // the homeland may be entirely adjacent
    force('Deseret', [distant], 0.9);
    const events = World.phaseSecession(T(), rng);
    equal(events.filter((e) => e.kind === 'defect' && e.area === distant).length, 0,
      'an Area with no border to the movement\'s country teleported into it');
  });

  it('is rate-limited, so the map does not turn to confetti', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Deseret');
    force('Deseret', claim(rec), T().get('secession.countyThreshold') + 0.08);
    World.phaseSecession(T(), rng);
    // push the ENTIRE homeland over the line at once
    force('Deseret', rec.homeland, T().get('secession.countyThreshold') + 0.2);
    const events = World.phaseSecession(T(), rng);
    const defections = events.filter((e) => e.kind === 'defect').length;
    ok(defections <= T().get('secession.maxPerTurn'),
      `${defections} Areas defected in one turn against a cap of ${T().get('secession.maxPerTurn')}`);
  });

  it('nothing defects to a movement with no country', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const rec = Movements.get('Cascadian Separatists');
    // over the line everywhere, but the CORE is deliberately left short so it
    // cannot declare — there is nothing to defect to
    force('Cascadian Separatists', rec.homeland, T().get('secession.countyThreshold') + 0.1);
    force('Cascadian Separatists', [rec.core[0]], 0.05);
    const events = World.phaseSecession(T(), rng);
    equal(events.length, 0,
      `a movement with no country still moved ground: ${JSON.stringify(events).slice(0, 200)}`);
  });
});

describe('The M4 acceptance', () => {
  it('play forty turns and a breakaway fires that nobody scripted', async () => {
    /*
     * The milestone criterion, run as written: no forcing, no hand-placed
     * sentiment. Just the world running, and something has to give.
     */
    const { rng } = await bootWorld({ seed: SEED });
    const log = [];
    for (let i = 0; i < 40; i++) {
      World.advanceTurn(T(), rng);
      log.push(...World.getLastEvents());
    }
    const declarations = log.filter((e) => e.kind === 'declare');
    ok(declarations.length > 0,
      'forty turns passed and nothing broke away; the West slice has no vertical to it');

    // and the reason is legible: the movement, the turn, the ground and the why
    const d = declarations[0];
    ok(d.movement && d.turn > 0 && d.areas >= T().get('nation.minAreas'));
    const why = Sentiment.explain(
      Game.getNation(d.nation) ? [...Game.getNation(d.nation).counties][0] : null, d.movement, T());
    if (why) {
      ok(why.inputs.length === 7, 'the reason is not legible: no factor breakdown');
      ok(why.summary && why.summary.length > 10);
    }
  });

  it('the world is still playable afterwards', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
    // every nation is contiguous, owned, and in the turn order
    equal(TurnSystem.snapshot().order.length, Game.nations.size,
      'the turn order and the roster disagree after a secession');
    for (const [nid, n] of Game.nations) {
      ok(n.counties.size > 0, `${n.name} holds nothing`);
      ok(Number.isFinite(n.authority) && Number.isFinite(n.influence), `${n.name} has no power stocks`);
    }
    let owned = 0;
    for (const f in Game.county) if (Game.getOwner(f)) owned++;
    equal(owned, Object.keys(Game.county).length, 'some Areas ended up owned by nobody');
  });

  it('and a save taken after a secession restores it exactly', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
    const before = [...Game.nations].map(([id, n]) => [id, n.name, n.counties.size, n.honeymoonUntil || 0]);
    const movBefore = Movements.all().map((r) => [r.name, r.state, r.nation]);
    const doc = JSON.parse(JSON.stringify(Game.serialize()));
    const movDoc = JSON.parse(JSON.stringify(Movements.serialize()));

    await bootWorld({ seed: 777 });
    Game.loadState(doc);
    Movements.loadState(movDoc);
    const after = [...Game.nations].map(([id, n]) => [id, n.name, n.counties.size, n.honeymoonUntil || 0]);
    equal(JSON.stringify(after), JSON.stringify(before), 'the post-secession world did not round-trip');
    equal(JSON.stringify(Movements.all().map((r) => [r.name, r.state, r.nation])),
      JSON.stringify(movBefore), 'the movements forgot which country they had won');
  });
});
