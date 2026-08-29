/*
 * Headless world bootstrap for the test suites.
 *
 * The thirteen legacy modules are singleton IIFEs on `window` (finding 129:
 * "you cannot run two worlds"), so tests run ONE world repeatedly rather than
 * many worlds at once. `bootWorld()` tears the singleton down and rebuilds it
 * from the baked data at a fixed seed, which is enough for every invariant in
 * M0.5 and for the same-seed determinism check.
 *
 * M2.3 makes state a value; at that point this file becomes `newWorld(seed)`
 * returning an object and the reset dance disappears.
 *
 * The raw JSON is fetched once and shared by every suite — it is ~1.5 MB and
 * parsing it per test would dominate the run.
 */

let dataPromise = null;

/** Fetch (once) every data file the model needs. */
export function loadData() {
  if (!dataPromise) {
    const get = (path, fallback) =>
      fetch(path).then((r) => (r.ok ? r.json() : fallback)).catch(() => fallback);
    dataPromise = Promise.all([
      get('../data/game-data.json'),
      get('../data/adjacency.json'),
      get('../data/areas.json', null),
      get('../data/parties.json', {}),
      get('../data/economy.json', null),
      get('../data/county_neighbors.json', {}),
    ]).then(([data, adjacency, areas, partyDefs, economy, neighbors]) => ({
      data, adjacency, areas, partyDefs, economy, neighbors,
    }));
  }
  return dataPromise;
}

/**
 * Rebuild the world from scratch.
 * @param {{seed?: number, spawnParties?: boolean, tune?: object}} opts
 * @returns {Promise<{seed, rng, tune, raw}>}
 */
export async function bootWorld(opts = {}) {
  const seed = opts.seed == null ? 20260829 : opts.seed;
  const spawnParties = opts.spawnParties !== false;
  const raw = await loadData();

  Game.reset();
  Colors.reset();
  World.setTurn(0);
  Market.loadState(null);

  const tune = opts.tune || window.TUNE;
  const rng = RNG.create(seed);

  Colors.assign(Object.keys(raw.data.states));
  Game.init(raw.data, raw.adjacency, raw.areas);
  const spawned = spawnParties ? Parties.setup(raw.partyDefs, rng) : Parties.setup({}, rng);
  MapModes.init(raw.data);
  if (raw.economy) {
    MapModes.setEconomy(raw.economy);
    Market.update(tune);
  }
  TurnSystem.begin([...Game.nations.keys()], rng);

  return { seed, rng, tune, raw, spawned };
}

/* ------------------------------------------------------------------ */
/* helpers the invariant suites share                                  */
/* ------------------------------------------------------------------ */

/** Total live population across every Area. */
export function totalCountyPop() {
  let t = 0;
  for (const f in Game.county) t += Game.countyPop(f);
  return t;
}

/** Total population across every nation, via the nation aggregate path. */
export function totalNationPop() {
  let t = 0;
  for (const [id] of Game.nations) t += Game.nationDemographics(id).pop;
  return t;
}

/** Population of one Area record without going through the public accessor. */
export function recPop(c) {
  let e = 0;
  for (const p in c.ext) e += c.ext[p];
  return c.demPop + c.gopPop + c.othPop + e;
}

/** Population baked into game-data.json for the member counties of an Area. */
export function bakedAreaPop(raw, aid) {
  const members = Game.areaCounties(aid);
  let t = 0;
  for (const m of members) t += (raw.data.counties[m] && raw.data.counties[m].pop) || 0;
  return t;
}

/**
 * A cheap order-independent fingerprint of the whole world, for
 * "same seed => same outcome". Deliberately coarse enough to survive float
 * noise from a different multiply order, precise enough to catch a real
 * divergence: sums are rounded to 1e-6 relative.
 */
export function fingerprint() {
  const ids = Object.keys(Game.county).sort();
  let dem = 0, gop = 0, oth = 0, gdp = 0, ext = 0, extNames = new Set();
  for (const f of ids) {
    const c = Game.county[f];
    dem += c.demPop; gop += c.gopPop; oth += c.othPop; gdp += c.gdp;
    for (const p in c.ext) { ext += c.ext[p]; extNames.add(p); }
  }
  const nations = [...Game.nations.keys()].sort();
  const owners = ids.map((f) => Game.getOwner(f)).join('|');
  return {
    turn: World.getTurn(),
    areas: ids.length,
    nations: nations.join(','),
    dem: sig(dem), gop: sig(gop), oth: sig(oth), gdp: sig(gdp), ext: sig(ext),
    extNames: [...extNames].sort().join(','),
    ownerHash: hash(owners),
    prices: (Market.getPrices() || []).map((p) => sig(p)).join(','),
    treasuries: nations.map((n) => sig(Game.getNation(n).treasury)).join(','),
    order: TurnSystem.snapshot().order.join(','),
  };
}

const sig = (x) => (Number.isFinite(x) ? Number(x.toPrecision(12)) : x);

function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
