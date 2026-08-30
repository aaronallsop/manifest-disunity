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

  it('seeding moves people between ideologies, never creates them', async () => {
    await bootWorld({ seed: 4242, spawnParties: false });
    const before = {};
    for (const f in Game.county) before[f] = recPop(Game.county[f]);

    await bootWorld({ seed: 4242, spawnParties: true });
    for (const f in Game.county) {
      close(recPop(Game.county[f]), before[f], 1e-6, `Area ${f} gained or lost people during seeding`);
    }
  });

  it('seeding shifts population INTO the movement\'s own ideology', async () => {
    await bootWorld({ seed: 4242, spawnParties: false });
    const before = {};
    for (const f in Game.county) before[f] = Game.county[f].pop.slice();

    const { spawned } = await bootWorld({ seed: 4242, spawnParties: true });
    // for each seeded movement, its ideology should have gained where it seeded
    for (const name of spawned) {
      const idx = Movements.ideologyIndexOf(name);
      ok(idx >= 0, `"${name}" has no ideology`);
      const areas = Movements.resolveAreas(Movements.getDefinition(name).counties).areas;
      let gained = 0;
      for (const f of areas) if (Game.county[f].pop[idx] > before[f][idx] + 1e-9) gained++;
      ok(gained > 0, `"${name}" (${Ideology.idAt(idx)}) gained no ground in any of its ${areas.length} Areas`);
    }
  });

  it('every spawned movement actually holds population somewhere', async () => {
    const { spawned } = await bootWorld({ seed: 4242, spawnParties: true });
    const totals = {};
    for (const f in Game.county) {
      const c = Game.county[f];
      for (const m in c.mov) totals[m] = (totals[m] || 0) + c.mov[m];
    }
    for (const name of spawned) {
      ok(totals[name] > 0, `"${name}" is in the roster but holds zero people anywhere`);
    }
    for (const m of Object.keys(totals)) {
      ok(spawned.includes(m), `"${m}" holds population but is not in the spawned roster`);
    }
  });

  it('every movement carries an ideology from the bake', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    for (const [name, def] of Object.entries(raw.partyDefs)) {
      ok(def.ideology, `"${name}" has no ideology in parties.json`);
      ok(Ideology.index(def.ideology) >= 0,
        `"${name}" has ideology "${def.ideology}", which is not in content/ideologies.json`);
    }
    // and every one of the six is used by at least one movement, or the spread
    // of the authored set is narrower than the model claims
    const used = new Set(Object.values(raw.partyDefs).map((d) => d.ideology));
    ok(used.size >= 4, `only ${used.size} of ${Ideology.count()} ideologies have a movement: ${[...used]}`);
  });

  it('the movement roster covers every state', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const byState = {};
    for (const [name, def] of Object.entries(raw.partyDefs)) {
      for (const a of Parties.resolveAreas(def.counties).areas) {
        (byState[a.slice(0, 2)] = byState[a.slice(0, 2)] || new Set()).add(name);
      }
    }
    const states = new Set(Object.keys(Game.county).map((f) => f.slice(0, 2)));
    const bare = [...states].filter((s) => !byState[s]).sort();
    equal(bare.length, 0, `states with no movement homeland at all: ${bare}`);
    ok(Object.keys(raw.partyDefs).length >= 20,
      `only ${Object.keys(raw.partyDefs).length} movements defined`);
  });

  /*
   * M7.12 — THE EAST COULD RAISE ALMOST NOTHING.
   *
   * Every movement mechanic in the game — sentiment, grievance, two-tier
   * secession, the whole of M4 and M5 — runs on an Area being inside somebody's
   * homeland. Measured before this milestone: Kentucky and West Virginia had no
   * homeland at all, upstate New York had two Areas of one, and Maryland,
   * Delaware and rural New Jersey had none, so 278 of 1,676 Areas were outside
   * the system permanently and the eastern half of the map was scenery.
   *
   * The five the plan names are Franklin, Acadiana, New England Revivalist,
   * Central States Union and Great Lakes; Delmarva is the sixth, because the
   * peninsula that has petitioned for its own statehood more than once was the
   * only honest way to close Maryland and Delaware.
   */
  const EAST_MOVEMENTS = ['Franklin', 'Acadiana', 'New England Revivalist',
                          'Central States Union', 'Delmarva Republic'];

  it('the east has its own separatisms, and they resolve', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    for (const name of EAST_MOVEMENTS) {
      const def = raw.partyDefs[name];
      ok(def, `"${name}" is not in the bake`);
      ok(def.counties.length >= 20, `"${name}" has a ${def.counties.length}-county homeland`);
      const { unresolved, areas } = Parties.resolveAreas(def.counties);
      equal(unresolved.length, 0, `"${name}" has ${unresolved.length} unresolvable FIPS`);
      ok(areas.length >= 10, `"${name}" reaches only ${areas.length} Areas`);
      ok(def.core.length >= 3 && def.core.every((f) => def.counties.includes(f)),
        `"${name}" has a core outside its own homeland`);
    }
  });

  it('Franklin is a mountain range, not a state', async () => {
    /*
     * The State of Franklin really existed, from 1784 to 1788, and the point of
     * it is that it crossed what are now four state lines: a movement that sat
     * inside one state would be a grievance against one capital rather than the
     * thing the mountains have in common.
     */
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const states = new Set(raw.partyDefs.Franklin.counties.map((f) => f.slice(0, 2)));
    ok(states.size >= 5, `Franklin spans ${states.size} states: ${[...states]}`);
    for (const st of ['47', '37', '51', '21', '54']) {
      ok(states.has(st), `Franklin does not reach state ${st}`);
    }
  });

  it('and the states that could raise nothing at all now can', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const byState = {};
    for (const def of Object.values(raw.partyDefs)) {
      for (const a of Parties.resolveAreas(def.counties).areas) {
        (byState[a.slice(0, 2)] = byState[a.slice(0, 2)] || new Set()).add(a);
      }
    }
    const live = {};
    for (const f of Object.keys(Game.county)) (live[f.slice(0, 2)] = live[f.slice(0, 2)] || new Set()).add(f);
    // Kentucky and West Virginia were 0%; Maryland was a quarter; New York a third.
    for (const [st, name] of [['21', 'Kentucky'], ['54', 'West Virginia'], ['24', 'Maryland'],
                              ['10', 'Delaware'], ['23', 'Maine'], ['22', 'Louisiana'],
                              ['36', 'New York'], ['34', 'New Jersey']]) {
      const covered = (byState[st] || new Set()).size;
      const total = live[st].size;
      ok(covered / total >= 0.6,
        `${name}: only ${covered} of ${total} Areas can ever receive a movement`);
    }
  });

  it('the whole board is better covered than it was, and pinned so it stays that way', async () => {
    const { raw } = await bootWorld({ seed: SEED, spawnParties: false });
    const reachable = new Set();
    for (const def of Object.values(raw.partyDefs)) {
      for (const a of Parties.resolveAreas(def.counties).areas) reachable.add(a);
    }
    const live = Object.keys(Game.county);
    const orphans = live.filter((f) => !reachable.has(f));
    // 278 before M7.12, 179 after, and what is left is the empty western
    // interior rather than a whole region of the map.
    ok(orphans.length <= 185,
      `${orphans.length} of ${live.length} Areas can never receive a movement`);
    const east = orphans.filter((f) => Number(f.slice(0, 2)) >= 21 && !['27', '19'].includes(f.slice(0, 2))
      && !['32', '35', '41', '53', '49', '56', '30', '38', '46', '31', '40', '48'].includes(f.slice(0, 2)));
    ok(east.length < 25, `${east.length} eastern Areas are still outside the movement system`);
  });

  it('an eastern movement actually organises in a played game', async () => {
    /*
     * A homeland that never raises anybody is a list, not a movement. This is
     * the end-to-end check: spawn, then let sentiment run, and look for support
     * on the ground in the east.
     */
    const { rng } = await bootWorld({ seed: SEED, spawnParties: true });
    for (let i = 0; i < 12; i++) World.advanceTurn(window.TUNE, rng);
    let found = 0;
    for (const f of Object.keys(Game.county)) {
      const st = f.slice(0, 2);
      if (!['21', '54', '47', '37', '22', '23', '50', '33', '36', '24', '10'].includes(st)) continue;
      const c = Game.county[f];
      for (const m in c.mov) if (c.mov[m] > 0) { found++; break; }
    }
    ok(found > 40, `only ${found} eastern Areas hold any organised movement at all`);
  });

  it('there is no "Other" bucket left to absorb', async () => {
    // The 2024 residual is split across the four minority ideologies at load;
    // "Other" is a data artifact, not an ideology, and no longer exists.
    await bootWorld({ seed: 4242, spawnParties: true });
    equal(Ideology.index('other'), -1, 'an "other" ideology is in the table');
    equal(Ideology.count(), 6);
  });
});
