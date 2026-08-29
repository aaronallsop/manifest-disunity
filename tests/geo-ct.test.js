/*
 * M1.2 — Connecticut.
 *
 * Three data files disagree about what Connecticut is, and the renderer used to
 * split the difference: nine planning-region fills with eight obsolete county
 * boundaries drawn over them, on first load, with no clicks.
 *
 * These tests pin the DATA facts that make the trap possible (so a future data
 * refresh that fixes it upstream shows up as a failure here, not as silence),
 * and the mapping's own correctness.
 */
import { describe, it, ok, equal, deepEqual } from './harness.js';
import { bootWorld, loadData } from './world-fixture.js';
import { OLD_CT_TO_REGION, CT_REGIONS, OLD_CT, baseGeomToArea } from '../js/geo-ct.js';

const SEED = 20260829;

describe('Connecticut normalisation', () => {
  it('the mapping covers all eight obsolete counties', () => {
    equal(OLD_CT.size, 8);
    deepEqual(
      [...OLD_CT].sort(),
      ['09001', '09003', '09005', '09007', '09009', '09011', '09013', '09015']
    );
  });

  it('every old county maps to one of the nine live planning regions', () => {
    for (const [old, region] of Object.entries(OLD_CT_TO_REGION)) {
      ok(CT_REGIONS.includes(region), `${old} maps to ${region}, which is not a planning region`);
    }
  });

  it('two old counties share the Capitol region — the mapping is not 1:1', () => {
    // Hartford and Tolland both became Capitol Planning Region. A predicate-only
    // fix suppresses exactly this one interior arc and leaves seven wrong ones.
    const byRegion = {};
    for (const [old, r] of Object.entries(OLD_CT_TO_REGION)) (byRegion[r] = byRegion[r] || []).push(old);
    const shared = Object.entries(byRegion).filter(([, v]) => v.length > 1);
    equal(shared.length, 1, 'expected exactly one many-to-one region');
    equal(shared[0][0], '09110');
    deepEqual(shared[0][1].sort(), ['09003', '09013']);
  });

  it('the model holds the nine planning regions and none of the old counties', async () => {
    await bootWorld({ seed: SEED });
    const ctInModel = Object.keys(Game.county).filter((f) => f.startsWith('09')).sort();
    deepEqual(ctInModel, [...CT_REGIONS].sort(), 'the model does not hold exactly the nine regions');
    for (const old of OLD_CT) {
      equal(Game.county[old], undefined, `${old} has a live record; it should not exist`);
    }
  });

  it('areas.json has no CT entries, so areaIdOf alone cannot normalise CT', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    const ctAreas = Object.keys(raw.areas.areas).filter((a) => a.startsWith('09'));
    equal(ctAreas.length, 0, 'areas.json now has CT entries; re-check the renderer assumption');
    // This is the trap the border layer fell into:
    for (const old of OLD_CT) {
      equal(Game.areaIdOf(old), old, `areaIdOf('${old}') resolved it; the alias now knows about CT`);
    }
  });

  it('baseGeomToArea resolves every old county to a live Area', async () => {
    await bootWorld({ seed: SEED });
    for (const old of OLD_CT) {
      const aid = baseGeomToArea(old, Game.areaIdOf);
      ok(Game.county[aid], `${old} -> ${aid}, which has no live record`);
      equal(aid, OLD_CT_TO_REGION[old]);
    }
  });

  it('baseGeomToArea leaves the rest of the country to areaIdOf', async () => {
    await bootWorld({ seed: SEED });
    for (const f of ['06037', '48201', '36061', '49035', '02020']) {
      equal(baseGeomToArea(f, Game.areaIdOf), Game.areaIdOf(f));
    }
  });

  it('every CT planning region has population, GDP and an owner', async () => {
    await bootWorld({ seed: SEED });
    for (const r of CT_REGIONS) {
      ok(Game.countyPop(r) > 0, `${r} has no population`);
      ok(Game.countyGdp(r) > 0, `${r} has no GDP`);
      equal(Game.getOwner(r), '09', `${r} is not owned by Connecticut`);
    }
  });

  it('the base geometry still carries the obsolete counties — this is why the fix is needed', async () => {
    const topo = await fetch('../data/counties-10m.json').then((r) => r.json());
    const ids = new Set(topo.objects.counties.geometries.map((g) => g.id));
    for (const old of OLD_CT) ok(ids.has(old), `counties-10m.json no longer has ${old}`);
    for (const r of CT_REGIONS) {
      equal(ids.has(r), false, `counties-10m.json now has planning region ${r}; the fix can be simplified`);
    }
  });
});
