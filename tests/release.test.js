/*
 * M1.10 — Release, and a reason for Counties mode to exist.
 *
 * Release was wired through three dispatch paths and did nothing: the button
 * shipped disabled with title="Coming next", startRelease flashed a message and
 * clickRelease was an empty function. It is also the design's first release
 * valve and the only county-level verb in the game, so half of the primary
 * Select toggle led nowhere.
 *
 * It reuses the annex machinery inverted over your own Areas and terminates in
 * Game.breakApart(chosen, {exclude: nid}) — which already existed and worked.
 */
import { describe, it, ok, equal, notEqual, close } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** breakApart the way confirmRelease calls it, without the DOM. */
function release(nid, areas) {
  const ownersBefore = new Map(areas.map((f) => [f, Game.getOwner(f)]));
  Game.getNation(nid).lastReleaseTurn = World.getTurn();
  const born = Game.batch(() => Game.breakApart(areas, { exclude: nid }));
  let toNew = 0, toNeighbours = 0, stayed = 0;
  const bornSet = new Set(born);
  for (const [f, was] of ownersBefore) {
    const now = Game.getOwner(f);
    if (now === was) stayed++;
    else if (bornSet.has(now)) toNew++;
    else toNeighbours++;
  }
  return { born, toNew, toNeighbours, stayed };
}

describe('Release', () => {
  it('is no longer a stub', async () => {
    await bootWorld({ seed: SEED });
    equal(typeof Actions.releaseCooldownLeft, 'function');
    equal(typeof Actions.startReleaseWith, 'function');
  });

  it('hands territory to a NEW nation when the chunk is big enough', async () => {
    await bootWorld({ seed: SEED });
    const nid = '48'; // Texas: plenty of Areas
    const before = Game.getNation(nid).counties.size;
    // a contiguous block, grown from one Area so it can stand alone
    const seed0 = [...Game.getNation(nid).counties][0];
    const block = [seed0];
    const frontier = [...Game.countyNeighbors(seed0)];
    while (block.length < 8 && frontier.length) {
      const f = frontier.shift();
      if (Game.getOwner(f) !== nid || block.includes(f)) continue;
      block.push(f);
      frontier.push(...Game.countyNeighbors(f));
    }
    ok(block.length >= T().get('nation.minAreas'), 'could not assemble a releasable block');

    const r = release(nid, block);
    ok(r.born.length > 0, 'a block large enough to stand alone did not become a nation');
    equal(Game.getNation(nid).counties.size, before - block.length,
      'the releasing nation did not actually lose the Areas');
    for (const f of block) notEqual(Game.getOwner(f), nid, `${f} is still owned by the releaser`);
  });

  it('a fragment too small to stand alone never comes back to the releaser', async () => {
    await bootWorld({ seed: SEED });
    const nid = '48';
    // one Area, well under nation.minAreas
    const one = [...Game.getNation(nid).counties].find((f) =>
      Game.countyNeighbors(f).some((nb) => Game.getOwner(nb) !== nid));
    ok(one, 'no border Area to release');
    const r = release(nid, [one]);
    equal(r.stayed, 0,
      'the released Area was handed straight back — Game.breakApart was called without {exclude}');
    notEqual(Game.getOwner(one), nid);
  });

  it('the released Areas keep their people and output', async () => {
    await bootWorld({ seed: SEED });
    const nid = '30'; // Montana
    const block = [...Game.getNation(nid).counties].slice(0, 5);
    const popBefore = block.reduce((t, f) => t + Game.countyPop(f), 0);
    const gdpBefore = block.reduce((t, f) => t + Game.countyGdp(f), 0);
    release(nid, block);
    close(block.reduce((t, f) => t + Game.countyPop(f), 0), popBefore, 1e-6, 'population vanished');
    close(block.reduce((t, f) => t + Game.countyGdp(f), 0), gdpBefore, 1e-6, 'GDP vanished');
  });

  it('cuts the upkeep bill — which is the point of the valve', async () => {
    await bootWorld({ seed: SEED });
    const nid = '30';
    const before = Game.treasuryFlow(nid);
    const block = [...Game.getNation(nid).counties].slice(0, 6);
    release(nid, block);
    const after = Game.treasuryFlow(nid);
    ok(after.administration < before.administration,
      'releasing six Areas did not reduce the administrative bill');
    close(before.administration - after.administration,
      block.length * T().get('econ.areaUpkeep'), 1e-6);
  });

  it('sheds occupation cost when the released ground is foreign', async () => {
    await bootWorld({ seed: SEED });
    const nid = '16'; // Idaho takes foreign ground first
    const grab = [...Game.annexTargets(nid)].slice(0, 25);
    Game.moveCounties(grab, nid);
    const occupiedBefore = Game.occupiedCount(nid);
    ok(occupiedBefore > 0, 'nothing registered as occupied');
    const before = Game.treasuryFlow(nid).occupation;
    ok(before > 0, 'occupation is costing nothing to shed');

    release(nid, grab.slice(0, 12));
    ok(Game.occupiedCount(nid) < occupiedBefore, 'occupied count did not fall');
    ok(Game.treasuryFlow(nid).occupation < before,
      'handing back occupied ground did not reduce the occupation surcharge');
  });

  it('the cooldown blocks a second handover and then expires', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const nid = '48';
    equal(Actions.releaseCooldownLeft(nid), 0);
    Game.getNation(nid).lastReleaseTurn = World.getTurn();
    equal(Actions.releaseCooldownLeft(nid), T().get('release.cooldownTurns'));
    for (let i = 0; i < T().get('release.cooldownTurns'); i++) World.advanceTurn(T(), rng);
    equal(Actions.releaseCooldownLeft(nid), 0);
  });

  it('the release clock survives a save/load round trip', async () => {
    await bootWorld({ seed: SEED });
    Game.getNation('48').lastReleaseTurn = 7;
    const snap = JSON.parse(JSON.stringify(Game.serialize()));
    Game.getNation('48').lastReleaseTurn = -Infinity;
    Game.loadState(snap);
    equal(Game.getNation('48').lastReleaseTurn, 7);
  });

  it('ownership stays consistent after a release', async () => {
    await bootWorld({ seed: SEED });
    release('48', [...Game.nations.get('48').counties].slice(0, 20));
    for (const [id, n] of Game.nations) {
      for (const f of n.counties) equal(Game.getOwner(f), id, `${f} is inconsistent after a release`);
      ok(n.counties.size > 0, `nation ${id} is empty and was not pruned`);
    }
    let claimed = 0;
    for (const [, n] of Game.nations) claimed += n.counties.size;
    equal(claimed, Object.keys(Game.county).length, 'Areas were lost or duplicated');
  });

  it('population and GDP are conserved across a release', async () => {
    await bootWorld({ seed: SEED });
    const total = () => {
      let p = 0, g = 0;
      for (const f in Game.county) { p += Game.countyPop(f); g += Game.countyGdp(f); }
      return { p, g };
    };
    const before = total();
    release('06', [...Game.nations.get('06').counties].slice(0, 10));
    const after = total();
    close(after.p, before.p, 1e-6, 'people were created or destroyed');
    close(after.g, before.g, 1e-6, 'GDP was created or destroyed');
  });
});

describe('Release budget', () => {
  it('is a named tunable, larger than the annex budget', async () => {
    ok(T().get('release.budgetAreas') > 0);
    ok(T().get('release.budgetAreas') >= T().get('annex.budgetAreas'),
      'giving territory away should not be harder than taking it');
  });
});
