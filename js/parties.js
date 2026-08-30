/*
 * Movements — named regional factions, each of which HAS an ideology.
 *
 * A movement is not an ideology. The six ideologies (js/ideology.js) are the
 * political truth of a population; a movement is an organised faction *within*
 * one of them, with a homeland and a name. `Deseret` is a movement whose
 * ideology is Conservative Nationalist; `Cascadian Separatists` is one whose
 * ideology is Democratic Socialist. That distinction is what lets the model
 * carry six symmetric axes-based ideologies while movements stay named,
 * regional and separately trackable — and it is the shape M4.1 needs, where a
 * Movement is `{id, ideology, type, homeland[], core[], seed, ...}`.
 *
 * Definitions come from data/parties.json, baked by build/build_parties.py —
 * the editable region table (spawn chances, share ranges, ideology, county
 * lists) lives at the top of that script.
 *
 * SPAWN, ONCE, AT SETUP. Each movement rolls its chance, then takes a share of
 * every Area in its homeland. Those people move INTO the movement's ideology
 * from all the others, proportionally, so the Area's total is unchanged.
 * `area.mov[name]` records how many of that ideology's people are organised
 * under the movement's banner — a slice of `pop[ideologyOf(name)]`, never more.
 *
 * WHAT THIS REPLACED. Six hard-coded colour families and a `PARTY_GROUP` dict
 * that covered 6 of 16 baked parties, collapsing the other 10 into "yellow" and
 * reporting them as one pooled coalition. Coalition membership is now proximity
 * on the two axes, which needs no table at all.
 */
const Movements = (function () {
  let spawned = [];
  let coverage = {};      // name -> {authored, areas, unresolved[]}
  let ideologyOf = {};    // name -> ideology id, from the bake
  let defsById = {};      // name -> the whole definition

  const ideologyIdOf = (name) => ideologyOf[name] || null;
  const ideologyIndexOf = (name) => Ideology.index(ideologyOf[name] || '');
  const colorOf = (name) => Ideology.colorAt(ideologyIndexOf(name));

  /**
   * Resolve an authored county-FIPS list to the Areas the runtime actually has.
   *
   * data/parties.json is written in COUNTY fips, but Game.init collapses 483
   * Areas and DELETES the member records. Indexing by a raw member fips hits
   * nothing: 2,025 of 4,198 authored references (48.2%) used to no-op silently.
   * Game.areaIdOf is the alias that resolves it; several members map to the same
   * Area, so de-duplicate or one Area takes one roll per member county.
   */
  function resolveAreas(fipsList) {
    const areas = [];
    const seen = new Set();
    const unresolved = [];
    for (const raw of fipsList || []) {
      const aid = Game.areaIdOf(raw);
      if (seen.has(aid)) continue;
      seen.add(aid);
      if (!Game.county[aid]) { unresolved.push(raw); continue; }
      areas.push(aid);
    }
    return { areas, unresolved };
  }

  /**
   * Seed the movements. `rng` is REQUIRED and explicit: spawn draws come from
   * the 'spawn' stream so that adding a die roll elsewhere cannot reshuffle
   * which movements appear.
   */
  function setup(defs, rng) {
    const r = rng.stream('spawn');
    spawned = [];
    coverage = {};
    ideologyOf = {};
    defsById = {};

    for (const [name, def] of Object.entries(defs || {})) {
      ideologyOf[name] = def.ideology || 'yellow';
      defsById[name] = def;
    }

    for (const [name, def] of Object.entries(defs || {})) {
      if (r.random() > (def.chance == null ? 0.5 : def.chance)) continue;
      const idx = ideologyIndexOf(name);
      if (idx < 0) {
        console.warn(`Movements: "${name}" has ideology "${def.ideology}", which is not in the table`);
        continue;
      }
      spawned.push(name);
      const [lo, hi] = def.share || [0.0, 0.2];
      const { areas, unresolved } = resolveAreas(def.counties);
      coverage[name] = { authored: (def.counties || []).length, areas: areas.length, unresolved, ideology: def.ideology };
      if (unresolved.length) {
        console.warn(`Movements: "${name}" lists ${unresolved.length} FIPS that resolve to no live Area`,
          unresolved.slice(0, 8));
      }

      for (const f of areas) {
        const c = Game.county[f];
        let total = 0;
        for (let i = 0; i < c.pop.length; i++) total += c.pop[i];
        if (!total) continue;

        // The movement organises `x` of the Area, drawn proportionally from
        // every OTHER ideology and added to its own. The total is unchanged.
        const x = r.range(lo, hi);
        const want = x * total;
        let fromOthers = 0;
        for (let i = 0; i < c.pop.length; i++) if (i !== idx) fromOthers += c.pop[i];
        const take = Math.min(want, fromOthers);
        if (take > 0 && fromOthers > 0) {
          const k = 1 - take / fromOthers;
          for (let i = 0; i < c.pop.length; i++) if (i !== idx) c.pop[i] *= k;
          c.pop[idx] += take;
        }
        // Everyone the movement converted, plus a share of those already in its
        // ideology, march under its banner.
        c.mov[name] = (c.mov[name] || 0) + Math.min(c.pop[idx], take + (c.pop[idx] - take) * x);
      }
    }
    clampMovements();
    return spawned;
  }

  /**
   * Keep every `mov[name]` a valid slice of its ideology's head count.
   *
   * Drift, growth and war all move `pop[i]` without knowing about movements, so
   * this is the reconciliation step: if the movements inside one ideology add up
   * to more than that ideology holds, scale them down proportionally.
   */
  function clampMovements() {
    const N = Ideology.count();
    for (const f in Game.county) {
      const c = Game.county[f];
      let any = false;
      for (const m in c.mov) { any = true; break; }
      if (!any) continue;
      const byIdeology = new Array(N).fill(0);
      for (const m in c.mov) {
        const i = ideologyIndexOf(m);
        if (i >= 0) byIdeology[i] += c.mov[m];
        else delete c.mov[m];
      }
      for (let i = 0; i < N; i++) {
        if (byIdeology[i] <= c.pop[i]) continue;
        const k = c.pop[i] / byIdeology[i];
        for (const m in c.mov) if (ideologyIndexOf(m) === i) c.mov[m] *= k;
      }
      for (const m in c.mov) if (!(c.mov[m] > 0)) delete c.mov[m];
    }
  }

  const serialize = () => ({ spawned: spawned.slice(), ideologyOf: { ...ideologyOf } });
  function loadState(snap) {
    if (Array.isArray(snap)) { spawned = snap.slice(); return; } // tolerate the older shape
    spawned = (snap && Array.isArray(snap.spawned)) ? snap.spawned.slice() : [];
    if (snap && snap.ideologyOf) ideologyOf = { ...snap.ideologyOf };
  }

  return {
    setup,
    getSpawned: () => spawned,
    getCoverage: () => coverage,
    getDefinition: (name) => defsById[name] || null,
    resolveAreas,
    clampMovements,
    ideologyIdOf,
    ideologyIndexOf,
    colorOf,
    serialize,
    loadState,
  };
})();

/* The module was called `Parties` while politics was D/R/Other plus a bag of
   named parties. It is `Movements` now, because that is what these are. */
const Parties = Movements;
