/*
 * M1.1 — emergent party spawn coverage.
 *
 * `Parties.setup` indexed `Game.county` by raw county FIPS, but `Game.init`
 * deletes the 1,467 member counties merged into Areas. Measured: 2,025 of 4,198
 * authored party-county references (48.2%) hit a deleted key and no-oped. The
 * acceptance is 0 unresolvable FIPS in data/parties.json.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, loadData, recPop } from './world-fixture.js';

const SEED = 20260829;

describe('Party spawn coverage', () => {
  it('every authored FIPS in parties.json resolves to a live Area', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const offenders = [];
    let authored = 0;
    for (const [name, def] of Object.entries(raw.partyDefs)) {
      authored += (def.counties || []).length;
      const { unresolved } = Parties.resolveAreas(def.counties);
      if (unresolved.length) offenders.push(`${name}: ${unresolved.length} (${unresolved.slice(0, 3)})`);
    }
    ok(authored > 3000, `expected ~4,198 authored references, found ${authored}`);
    equal(offenders.length, 0, `unresolvable FIPS: ${offenders.join(' | ')}`);
  });

  it('the alias recovers the footprint the raw lookup discarded', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    let rawHits = 0, aliasHits = 0, authored = 0;
    for (const def of Object.values(raw.partyDefs)) {
      for (const f of def.counties || []) {
        authored++;
        if (Game.county[f]) rawHits++;      // the old, broken lookup
      }
      aliasHits += Parties.resolveAreas(def.counties).areas.length;
    }
    ok(rawHits < authored * 0.6, `the raw lookup should have missed ~48%; it hit ${rawHits}/${authored}`);
    ok(aliasHits > rawHits, `the alias lookup (${aliasHits}) must beat the raw one (${rawHits})`);
  });

  it('de-duplicates: one Area takes exactly one roll however many members it has', async () => {
    await bootWorld({ seed: SEED, spawnParties: false });
    // find a merged Area and feed every one of its members in
    const merged = Object.keys(Game.county).find((f) => Game.areaCounties(f).length > 3);
    ok(merged, 'no merged Area found in the data');
    const members = Game.areaCounties(merged);
    const { areas } = Parties.resolveAreas(members);
    equal(areas.length, 1, `${members.length} members of one Area resolved to ${areas.length} entries`);
    equal(areas[0], merged);
  });

  it('a spawn covers more Areas than the pre-fix lookup would have', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: true });
    const cov = Parties.getCoverage();
    ok(Object.keys(cov).length > 0, 'nothing spawned at all');
    for (const [name, c] of Object.entries(cov)) {
      equal(c.unresolved.length, 0, `${name} had unresolvable FIPS`);
      ok(c.areas > 0, `${name} spawned into no Areas`);
      ok(c.areas <= c.authored, `${name} covered more Areas (${c.areas}) than it authored (${c.authored})`);
    }
    ok(raw.partyDefs);
  });

  it('the absorption rule is exact: spawning moves people, never creates them', async () => {
    await bootWorld({ seed: 4242, spawnParties: false });
    const before = {};
    for (const f in Game.county) before[f] = recPop(Game.county[f]);

    await bootWorld({ seed: 4242, spawnParties: true });
    for (const f in Game.county) {
      close(recPop(Game.county[f]), before[f], 1e-6, `Area ${f} gained or lost people during spawn`);
    }
  });

  it('every spawned party actually holds population somewhere', async () => {
    const { spawned } = await bootWorld({ seed: 4242, spawnParties: true });
    const totals = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      for (const p in c.ext) totals[p] = (totals[p] || 0) + c.ext[p];
    }
    for (const name of spawned) {
      ok(totals[name] > 0, `"${name}" is in the roster but holds zero people anywhere`);
    }
    // and nothing holds population without being in the roster
    for (const p of Object.keys(totals)) {
      ok(spawned.includes(p), `"${p}" holds population but is not in the spawned roster`);
    }
  });

  it('Other is fully absorbed in every Area a party spawns into', async () => {
    await bootWorld({ seed: 4242, spawnParties: true });
    for (const f in Game.county) {
      const c = Game.county[f];
      let hasExt = false;
      for (const p in c.ext) { hasExt = true; break; }
      if (!hasExt) continue;
      close(c.othPop, 0, 1e-6, `Area ${f} holds a party but kept ${c.othPop} in Other`);
    }
  });
});
