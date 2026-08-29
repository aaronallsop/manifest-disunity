/*
 * M0.5 — the invariants that already matter.
 *
 * These are the ones the plan seeds the harness with:
 *   - every Area's party counts sum exactly to its population
 *   - sum(nation.pop) == sum(area.pop)
 *   - ownership is consistent: the owner map and nation.counties agree
 *   - a save/load round-trip reproduces the state exactly
 *   - same seed => same 10-turn outcome
 *
 * They run against the REAL baked data, not a fixture, because the failures
 * they are here to catch (finding 3: 48% of party spawns hit a deleted key;
 * finding 103: 1,467 counties have no runtime state) are data-shape failures.
 */
import { describe, it, ok, equal, close, deepEqual, every } from './harness.js';
import { bootWorld, loadData, totalCountyPop, totalNationPop, recPop, bakedAreaPop, fingerprint }
  from './world-fixture.js';

const SEED = 20260829;

describe('World invariants', () => {
  it('boots 51 nations over the merged Area map', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    equal(Game.nations.size, 51, 'nation count');
    const areas = Object.keys(Game.county).length;
    ok(areas > 1600 && areas < 1800, `expected ~1676 Areas, got ${areas}`);
    equal(Object.keys(raw.data.counties).length > areas, true, 'Areas should be fewer than raw counties');
  });

  it('every Area sums its parts exactly (dem + gop + oth + ext == pop)', async () => {
    await bootWorld({ seed: SEED });
    for (const f in Game.county) {
      const c = Game.county[f];
      close(Game.countyPop(f), recPop(c), 1e-9, `Area ${f} accessor disagrees with its record`);
      ok(c.demPop >= 0 && c.gopPop >= 0 && c.othPop >= 0, `Area ${f} has a negative party count`);
      for (const p in c.ext) ok(c.ext[p] >= 0, `Area ${f} has a negative ${p} count`);
    }
  });

  it('party spawning does not create or destroy people', async () => {
    // parties.js documents "exact: sums stay = pop". Check it against the map.
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const before = {};
    for (const f in Game.county) before[f] = Game.countyPop(f);

    await bootWorld({ seed: SEED, spawnParties: true });
    let moved = 0;
    for (const f in Game.county) {
      close(Game.countyPop(f), before[f], 1e-6, `Area ${f} population changed during party spawn`);
      const c = Game.county[f];
      for (const p in c.ext) moved += c.ext[p];
    }
    ok(moved > 0, 'no emergent party population was placed at all');
    ok(raw.partyDefs && Object.keys(raw.partyDefs).length > 0, 'parties.json is empty');
  });

  it('runtime population matches the baked totals Area by Area', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    for (const f in Game.county) {
      close(Game.countyPop(f), bakedAreaPop(raw, f), 1e-6,
        `Area ${f} does not carry the sum of its member counties' baked population`);
    }
  });

  it('sum(nation.pop) == sum(area.pop)', async () => {
    await bootWorld({ seed: SEED });
    close(totalNationPop(), totalCountyPop(), 1e-6, 'nation totals do not reconcile with Area totals');
  });

  it('sum(nation.gdp) == sum(area.gdp)', async () => {
    await bootWorld({ seed: SEED });
    let areaGdp = 0;
    for (const f in Game.county) areaGdp += Game.countyGdp(f);
    let natGdp = 0;
    for (const [id] of Game.nations) natGdp += Game.nationDemographics(id).gdp;
    close(natGdp, areaGdp, 1e-6, 'nation GDP does not reconcile with Area GDP');
  });

  it('ownership is stored consistently in both places', async () => {
    await bootWorld({ seed: SEED });
    // every Area has exactly one owner, and that owner claims it
    for (const f in Game.county) {
      const o = Game.getOwner(f);
      ok(o != null, `Area ${f} has no owner`);
      const n = Game.getNation(o);
      ok(n, `Area ${f} is owned by nonexistent nation ${o}`);
      ok(n.counties.has(f), `nation ${o} does not claim Area ${f} it owns`);
    }
    // and every claimed Area points back
    let claimed = 0;
    for (const [id, n] of Game.nations) {
      for (const f of n.counties) {
        claimed++;
        equal(Game.getOwner(f), id, `Area ${f} is claimed by ${id} but owned by ${Game.getOwner(f)}`);
        ok(Game.county[f], `nation ${id} claims Area ${f}, which has no record`);
      }
    }
    equal(claimed, Object.keys(Game.county).length, 'claimed-Area count != Area count');
  });

  it('ownership stays consistent after a move and a breakApart', async () => {
    await bootWorld({ seed: SEED });
    const donor = [...Game.nations.get('49').counties].slice(0, 4); // Utah
    Game.moveCounties(donor, '16'); // -> Idaho
    for (const f of donor) equal(Game.getOwner(f), '16');
    ok(!Game.nations.get('49') || ![...Game.nations.get('49').counties].some((f) => donor.includes(f)),
      'the donor still claims the moved Areas');

    const born = Game.breakApart([...Game.nations.get('16').counties].slice(0, 12));
    for (const [id, n] of Game.nations) {
      for (const f of n.counties) equal(Game.getOwner(f), id, `after breakApart, ${f} is inconsistent`);
    }
    ok(born.length >= 0);
    // no nation is left empty
    for (const [id, n] of Game.nations) ok(n.counties.size > 0, `nation ${id} is empty and was not pruned`);
  });

  it('save/load round-trips the model exactly', async () => {
    await bootWorld({ seed: SEED });
    World.advanceTurn(window.TUNE);
    Game.moveCounties([...Game.nations.get('32').counties].slice(0, 3), '06');
    const snap = JSON.parse(JSON.stringify(Game.serialize()));
    const fpBefore = fingerprint();

    // scribble over the live state, then restore
    World.advanceTurn(window.TUNE);
    World.advanceTurn(window.TUNE);
    Game.moveCounties([...Game.nations.get('06').counties].slice(0, 20), '41');

    Game.loadState(snap);
    World.setTurn(fpBefore.turn);
    deepEqual(Game.serialize(), snap, 'serialize -> loadState -> serialize is not the identity');
    const fpAfter = fingerprint();
    // TurnSystem/Market are restored separately (M0.6); compare the model fields
    for (const k of ['areas', 'nations', 'dem', 'gop', 'oth', 'gdp', 'ext', 'extNames', 'ownerHash', 'turn']) {
      deepEqual(fpAfter[k], fpBefore[k], `field "${k}" did not survive the round trip`);
    }
  });

  it('same seed => same 10-turn outcome', async () => {
    await bootWorld({ seed: 777 });
    for (let i = 0; i < 10; i++) World.advanceTurn(window.TUNE);
    const a = fingerprint();

    await bootWorld({ seed: 777 });
    for (let i = 0; i < 10; i++) World.advanceTurn(window.TUNE);
    const b = fingerprint();

    deepEqual(b, a, 'two runs on seed 777 diverged over 10 turns');
    equal(a.turn, 10);
  });

  it('a different seed produces a different world', async () => {
    await bootWorld({ seed: 777 });
    for (let i = 0; i < 5; i++) World.advanceTurn(window.TUNE);
    const a = fingerprint();

    await bootWorld({ seed: 778 });
    for (let i = 0; i < 5; i++) World.advanceTurn(window.TUNE);
    const b = fingerprint();

    ok(a.extNames !== b.extNames || a.order !== b.order,
      'seed 777 and 778 produced identical party rosters AND turn orders');
  });

  it('population is conserved-or-grown across a world turn, never lost', async () => {
    await bootWorld({ seed: SEED });
    const before = totalCountyPop();
    World.advanceTurn(window.TUNE);
    const after = totalCountyPop();
    ok(after > before, `population did not grow: ${before} -> ${after}`);
    // and the nation aggregate still reconciles
    close(totalNationPop(), after, 1e-5, 'nation totals drifted from Area totals after a turn');
  });

  it('no Area loses all its people or goes negative over 10 turns', async () => {
    await bootWorld({ seed: SEED });
    for (let i = 0; i < 10; i++) World.advanceTurn(window.TUNE);
    for (const f in Game.county) {
      const c = Game.county[f];
      ok(c.demPop >= 0 && c.gopPop >= 0 && c.othPop >= 0, `Area ${f} went negative`);
      for (const p in c.ext) ok(c.ext[p] >= 0, `Area ${f} ${p} went negative`);
      ok(Game.countyPop(f) > 0, `Area ${f} lost its entire population`);
    }
  });
});

describe('Data integrity', () => {
  it('every Area id in economy.json resolves to a live Area', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    if (!raw.economy) return; // economy.json is optional
    const dead = Object.keys(raw.economy.areas).filter((a) => !Game.county[a]);
    equal(dead.length, 0, `economy.json has ${dead.length} dead Area ids, e.g. ${dead.slice(0, 5)}`);
  });

  it('every nation has at least one Area and a colour', async () => {
    await bootWorld({ seed: SEED });
    for (const [id, n] of Game.nations) {
      ok(n.counties.size > 0, `nation ${id} is empty`);
      ok(n.color && n.color !== '#c9ced6', `nation ${id} has no distinct colour`);
      ok(n.name, `nation ${id} has no name`);
    }
  });

  it('every live Area has at least one neighbour', async () => {
    // An Area with no neighbours is mechanically inert: nothing can be annexed
    // from it, nothing released into it, and the neighbour-pull term in
    // political drift has nothing to read. Hawaii's three main islands were in
    // exactly this state — county adjacency comes from shared map arcs, and an
    // island shares none. build_adjacency.py MARITIME_COUNTY_LINKS fixes it.
    await bootWorld({ seed: SEED });
    const isolated = Object.keys(Game.county).filter((f) => Game.countyNeighbors(f).length === 0);
    equal(isolated.length, 0, `mechanically inert Areas: ${isolated.slice(0, 8)}`);
  });

  it('every state can receive at least one emergent movement', async () => {
    // Five states — Alaska, Arizona, Colorado, Hawaii and New Mexico — had no
    // homeland in build_parties.py at all, so 348 Areas were permanently outside
    // the movement system with nothing for secession to build on.
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const reachable = new Set();
    for (const def of Object.values(raw.partyDefs)) {
      for (const a of Parties.resolveAreas(def.counties).areas) reachable.add(a);
    }
    const statesWithout = new Set();
    for (const f of Object.keys(Game.county)) {
      if (!reachable.has(f)) statesWithout.add(f.slice(0, 2));
    }
    const covered = new Set([...reachable].map((f) => f.slice(0, 2)));
    const bare = [...statesWithout].filter((s) => !covered.has(s)).sort();
    equal(bare.length, 0, `states no movement can ever reach: ${bare}`);
  });

  it('countyNeighbors is symmetric at Area level', async () => {
    await bootWorld({ seed: SEED });
    const ids = Object.keys(Game.county);
    let checked = 0, asymmetric = [];
    for (const f of ids.slice(0, 400)) {
      for (const nb of Game.countyNeighbors(f)) {
        checked++;
        if (!Game.countyNeighbors(nb).includes(f)) asymmetric.push(`${f}->${nb}`);
      }
    }
    ok(checked > 0, 'no adjacency at all');
    equal(asymmetric.length, 0, `asymmetric adjacency: ${asymmetric.slice(0, 5)}`);
  });
});
