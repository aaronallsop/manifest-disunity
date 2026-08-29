/*
 * Emergent regional parties. Spawn ONCE at setup, before play begins.
 *
 * Definitions come from data/parties.json, baked by build/build_parties.py --
 * the editable region table (spawn chances, share ranges, county lists) lives
 * at the top of that script.
 *
 * Absorption rule (per county receiving a new party at rolled share X): the new
 * party takes X of the population PLUS the county's entire "Other" share (Other
 * drops to 0); the remaining parties shrink proportionally so counts still sum
 * to the county's population. E.g. Other 2.6% + rolled 4% -> new party 6.6%.
 */
const Parties = (function () {
  let spawned = [];

  // Six fixed color families -- parties sharing a color form a COALITION (close
  // enough interests to work together and pool their share):
  //   red    Republican
  //   orange Confederate States / Southern Christian Nationalism
  //   yellow socialists / any organization not listed below
  //   green  Northern Christian Kingdom / Cascadian Separatists
  //   blue   Democrat
  //   purple Libertarians / Anarchists
  const GROUP_COLORS = {
    red: '#e0483b', orange: '#e8862d', yellow: '#e3c229',
    green: '#33a852', blue: '#3b6fe0', purple: '#8a5cf5',
  };
  const PARTY_GROUP = {
    'Republican': 'red',
    'Democrat': 'blue',
    'Christian Nationalism': 'orange',
    'New Confederacy': 'orange',
    'Northern Christian Kingdom': 'green',
    'Cascadian Separatists': 'green',
    'Libertarians': 'purple',
    'Anarcho-Capitalist': 'purple',
  }; // any party not listed -> yellow
  const groupOf = (name) => PARTY_GROUP[name] || 'yellow';
  const colorOf = (name) => GROUP_COLORS[groupOf(name)];

  // Pool a demographics object ({dem, gop, extPct}) into color blocs, sorted by
  // combined share; parties of one color count together (the coalition).
  function blocs(demo) {
    const sums = { red: demo.gop || 0, blue: demo.dem || 0 };
    const members = { red: ['Republican'], blue: ['Democrat'] };
    for (const [p, v] of Object.entries(demo.extPct || {})) {
      const g = groupOf(p);
      sums[g] = (sums[g] || 0) + v;
      (members[g] = members[g] || []).push(p);
    }
    return Object.keys(sums)
      .map((g) => ({ group: g, color: GROUP_COLORS[g], pct: sums[g], members: members[g] }))
      .sort((a, b) => b.pct - a.pct);
  }

  // rng is REQUIRED and explicit: spawn draws come from the 'spawn' stream so
  // that adding a die roll elsewhere cannot reshuffle which movements appear.
  function setup(defs, rng) {
    const r = rng.stream('spawn');
    spawned = [];
    for (const [name, def] of Object.entries(defs || {})) {
      if (r.random() > (def.chance == null ? 0.5 : def.chance)) continue;
      spawned.push(name);
      colorOf(name);
      const [lo, hi] = def.share || [0.0, 0.2];
      for (const f of def.counties) {
        const c = Game.county[f];
        if (!c) continue;
        const extSum = Object.values(c.ext).reduce((a, b) => a + b, 0);
        const pop = c.demPop + c.gopPop + c.othPop + extSum;
        if (!pop) continue;
        const x = r.range(lo, hi);
        const newCount = x * pop + c.othPop;      // rolled share + all of "Other"
        const pool = pop - c.othPop;
        const factor = pool ? (pop - newCount) / pool : 0;
        c.demPop *= factor;
        c.gopPop *= factor;
        for (const p in c.ext) c.ext[p] *= factor;
        c.othPop = 0;
        c.ext[name] = (c.ext[name] || 0) + newCount; // exact: sums stay = pop
      }
    }
    return spawned;
  }

  const serialize = () => spawned.slice();
  const loadState = (list) => { spawned = Array.isArray(list) ? list.slice() : []; };

  return { setup, getSpawned: () => spawned, serialize, loadState, colorOf, groupOf, blocs };
})();
