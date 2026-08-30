/*
 * Six symmetric ideologies on two axes.
 *
 * ONE FUNCTION DRIVES EVERYTHING DOWNSTREAM:
 *
 *     affinity(a, b) = 1 - distance(a, b) / MAX_DISTANCE     // 0..1
 *
 * Coalitions, drift attraction, liberty satisfaction, trade alignment,
 * defection targets and AI diplomacy all derive from it. That is what makes six
 * ideologies cost two numbers each instead of fifteen hand-authored
 * compatibility pairs — and what makes a seventh cost two more rather than six.
 * A shared economic axis is trade alignment; a shared social axis is moral
 * alignment.
 *
 * WHAT THIS REPLACES. `lean: dem >= gop ? 'D' : 'R'` was a BINARY ENUM USED AS A
 * CONTROL-FLOW KEY, answered with `===` by four separate game decisions across
 * eight files: does this annexation trigger a civil war, may I annex this
 * neighbour, who defects in a failed union, which counties survive a partial
 * victory. Six symmetric ideologies has no `===` answer — the question becomes
 * "how far apart are these two on two axes", which is a different function with
 * a threshold, everywhere the letter used to be compared.
 *
 * Two live bugs fell out of that letter on the way:
 *   - `applyCivilWarCost` picked the bleeding party as `d >= g`, so a nation
 *     whose real majority was an emergent movement bled the wrong population and
 *     a movement could never take a single casualty. (Fixed in M1.7 by ruling
 *     bloc; now it is just the dominant ideology.)
 *   - `demographics.lean` ignored `ext` entirely, so a nation that was 40%
 *     Deseret / 31% R / 29% D reported its lean as a minority party.
 *
 * Loaded from content/ideologies.json so the set is authored data, not code.
 */

let TABLE = [];              // [{id,name,short,economic,social,color}] in canonical order
let INDEX = new Map();       // id -> 0..n-1
let MAX_DISTANCE = 1;        // the largest distance between any two of them
let OTHER_SPLIT = { default: {} };

/** Fallback table, so the model boots even if content/ideologies.json is missing. */
const FALLBACK = {
  axes: ['economic', 'social'],
  ideologies: [
    { id: 'red', name: 'Republican', short: 'Rep', economic: 0.6, social: 0.2, color: '#e0483b' },
    { id: 'blue', name: 'Democrat', short: 'Dem', economic: 0.3, social: -0.4, color: '#3b6fe0' },
    { id: 'green', name: 'Democratic Socialist', short: 'DSoc', economic: -0.6, social: -0.7, color: '#33a852' },
    { id: 'yellow', name: 'Conservative Nationalist', short: 'CNat', economic: 0.5, social: 0.7, color: '#e3c229' },
    { id: 'orange', name: 'Distributist', short: 'Dist', economic: -0.4, social: 0.6, color: '#e8862d' },
    { id: 'purple', name: 'Socialist', short: 'Soc', economic: -0.8, social: -0.2, color: '#8a5cf5' },
  ],
  otherSplit: { default: { green: 0.25, yellow: 0.25, orange: 0.25, purple: 0.25 } },
};

/**
 * Install an ideology set. Called once at boot with content/ideologies.json.
 * Returns the loaded table.
 */
export function load(doc) {
  const d = doc && Array.isArray(doc.ideologies) && doc.ideologies.length ? doc : FALLBACK;
  TABLE = d.ideologies.map((x) => ({ ...x }));
  INDEX = new Map(TABLE.map((x, i) => [x.id, i]));

  /*
   * MAX_DISTANCE is the largest distance among the ideologies ACTUALLY LOADED,
   * not the theoretical 2*sqrt(2) of the full [-1,1]^2 square. Using the
   * theoretical maximum would compress every real affinity into the top half of
   * the range (0.5-0.95) and make every threshold a fiddly decimal. Normalising
   * on the real spread means affinity 0 is "the two furthest apart ideologies in
   * this game" and 1 is "identical", which is what a threshold should mean.
   */
  MAX_DISTANCE = 0;
  for (let i = 0; i < TABLE.length; i++) {
    for (let j = i + 1; j < TABLE.length; j++) {
      const dd = rawDistance(TABLE[i], TABLE[j]);
      if (dd > MAX_DISTANCE) MAX_DISTANCE = dd;
    }
  }
  if (!MAX_DISTANCE) MAX_DISTANCE = 1;

  OTHER_SPLIT = (d.otherSplit && d.otherSplit.default) ? d.otherSplit : FALLBACK.otherSplit;
  return TABLE;
}

const rawDistance = (a, b) => Math.hypot(a.economic - b.economic, a.social - b.social);

/** Every ideology, in canonical order. */
export const all = () => TABLE;
/** How many there are. Read this rather than hard-coding 6. */
export const count = () => TABLE.length;
/** id -> canonical index, or -1. */
export const index = (id) => (INDEX.has(id) ? INDEX.get(id) : -1);
/** canonical index -> record. */
export const byIndex = (i) => TABLE[i];
/** id -> record. */
export const byId = (id) => TABLE[index(id)];
export const idAt = (i) => (TABLE[i] ? TABLE[i].id : null);
export const nameAt = (i) => (TABLE[i] ? TABLE[i].name : '—');
export const colorAt = (i) => (TABLE[i] ? TABLE[i].color : '#7a7a7a');
export const maxDistance = () => MAX_DISTANCE;

/** Euclidean distance on the two axes. Accepts ids, indices or records. */
export function distance(a, b) {
  const ra = resolve(a), rb = resolve(b);
  if (!ra || !rb) return MAX_DISTANCE;
  return rawDistance(ra, rb);
}

/** 0 = as far apart as this set goes, 1 = identical. THE function. */
export function affinity(a, b) {
  return Math.max(0, 1 - distance(a, b) / MAX_DISTANCE);
}

/** Distance on one axis only: economic for trade, social for moral alignment. */
export function axisDistance(a, b, axis) {
  const ra = resolve(a), rb = resolve(b);
  if (!ra || !rb) return 1;
  return Math.abs(ra[axis] - rb[axis]);
}

function resolve(x) {
  if (x == null) return null;
  if (typeof x === 'number') return TABLE[x];
  if (typeof x === 'string') return TABLE[index(x)];
  return x.economic !== undefined ? x : null;
}

/* ------------------------------------------------------------------ */
/* mixes                                                               */
/* ------------------------------------------------------------------ */

/** A zeroed count vector of the right length. */
export const zeroMix = () => new Array(TABLE.length).fill(0);

/** Total of a mix. */
export function total(mix) {
  let t = 0;
  for (let i = 0; i < mix.length; i++) t += mix[i];
  return t;
}

/** Percentage shares of a count mix. Zeroes rather than NaN for an empty scope. */
export function shares(mix) {
  const t = total(mix);
  const out = new Array(mix.length);
  for (let i = 0; i < mix.length; i++) out[i] = t ? (mix[i] / t) * 100 : 0;
  return out;
}

/** Index of the largest bloc, -1 for an empty mix. Ties break on canonical order. */
export function dominantIndex(mix) {
  let best = -1, bv = 0;
  for (let i = 0; i < mix.length; i++) if (mix[i] > bv) { best = i; bv = mix[i]; }
  return best;
}
export const dominantId = (mix) => idAt(dominantIndex(mix));

/**
 * The population-weighted centre of a mix on the two axes.
 * This is what "dem - gop" was reaching for and could not express: a position on
 * a plane rather than a scalar on a line.
 */
export function centroid(mix) {
  const t = total(mix);
  if (!t) return { economic: 0, social: 0 };
  let e = 0, s = 0;
  for (let i = 0; i < mix.length; i++) {
    e += TABLE[i].economic * mix[i];
    s += TABLE[i].social * mix[i];
  }
  return { economic: e / t, social: s / t };
}

/** How politically alike two scopes are, 0..1, from their centroids. */
export function mixAffinity(mixA, mixB) {
  return affinity(centroid(mixA), centroid(mixB));
}

/**
 * How concentrated a mix is: 1 when everyone shares one ideology, falling toward
 * 0 as it spreads. (1 - normalised Shannon entropy.) M3's Civil Liberties and
 * M4's grievance both want "how aligned is this population with itself".
 */
export function cohesion(mix) {
  const t = total(mix);
  if (!t || TABLE.length < 2) return 1;
  let h = 0;
  for (let i = 0; i < mix.length; i++) {
    const p = mix[i] / t;
    if (p > 0) h -= p * Math.log(p);
  }
  return 1 - h / Math.log(TABLE.length);
}

/* ------------------------------------------------------------------ */
/* the "Other" residual                                                */
/* ------------------------------------------------------------------ */

/**
 * Weights over the ideologies for splitting the 2024 "Other" residual in a
 * region. Returns a normalised count-length vector.
 *
 * R becomes red and D becomes blue, but Other is where everything outside the
 * two-party system lived, and a third-party voter in Vermont is not the same
 * person as one in Alabama. Keyed by cultural-region name, with a default.
 */
export function otherWeights(regionName) {
  const table = (regionName && OTHER_SPLIT[regionName]) || OTHER_SPLIT.default || {};
  const w = zeroMix();
  let t = 0;
  for (const [id, v] of Object.entries(table)) {
    const i = index(id);
    if (i >= 0 && v > 0) { w[i] = v; t += v; }
  }
  if (!t) { // nothing usable: spread over everything but red and blue
    for (let i = 2; i < w.length; i++) { w[i] = 1; t += 1; }
    if (!t) { w[0] = 1; t = 1; }
  }
  for (let i = 0; i < w.length; i++) w[i] /= t;
  return w;
}

/** Region names the split table knows about, for validation. */
export const otherSplitRegions = () => Object.keys(OTHER_SPLIT).filter((k) => k !== 'default');

// Boot with the fallback so importers never see an empty table.
load(FALLBACK);

export default {
  load, all, count, index, byIndex, byId, idAt, nameAt, colorAt, maxDistance,
  distance, affinity, axisDistance,
  zeroMix, total, shares, dominantIndex, dominantId, centroid, mixAffinity, cohesion,
  otherWeights, otherSplitRegions,
};
