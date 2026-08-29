/*
 * Seeded RNG with named streams.
 *
 * Every random draw in the game comes from here, and every engine function that
 * needs one takes it as an explicit argument. Nothing reads a module global.
 *
 *   const rng = RNG.create(20260829);
 *   rng.stream('combat').roll(6);        // 1..6
 *   rng.stream('spawn').random();        // 0..1
 *
 * NAMED STREAMS are the point. Each name gets its own independent generator
 * seeded from (seed, name), so adding a die roll to combat does not reshuffle
 * party spawns, and a change to the spawn table does not change the dice. That
 * is what makes the M5 dashboard's "hold the seed, move one slider" workflow
 * mean anything.
 *
 * The whole thing serializes to {seed, streams:{name:{state,count}}} and
 * restores in O(1) — the raw 32-bit state is saved, not replayed.
 */

/* mulberry32: 32-bit state, one multiply-xorshift round. ~2^32 period per
 * stream, which is ample for a game that draws a few thousand times a session. */
function step(s) {
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return { state: s, value: ((t ^ (t >>> 14)) >>> 0) / 4294967296 };
}

/* cyrb53-style string hash, mixed with the run seed, to derive a stream seed. */
function hashStream(seed, name) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < name.length; i++) {
    const ch = name.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ h2) | 0;
}

class Stream {
  constructor(name, state) {
    this.name = name;
    this.state = state | 0;
    this.count = 0;
  }
  /** uniform float in [0, 1) */
  random() {
    const r = step(this.state);
    this.state = r.state;
    this.count++;
    return r.value;
  }
  /** integer in [0, n) */
  int(n) {
    return Math.floor(this.random() * n);
  }
  /** a die: integer in [1, sides] */
  roll(sides) {
    return 1 + this.int(sides);
  }
  /** float in [lo, hi) */
  range(lo, hi) {
    return lo + this.random() * (hi - lo);
  }
  /** true with probability p */
  chance(p) {
    return this.random() < p;
  }
  /** uniform element of a non-empty array (null if empty) */
  pick(arr) {
    return arr.length ? arr[this.int(arr.length)] : null;
  }
  /** Fisher-Yates, in place, returns the same array */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      const t = arr[i];
      arr[i] = arr[j];
      arr[j] = t;
    }
    return arr;
  }
}

class Rng {
  constructor(seed) {
    this.seed = seed | 0;
    this.streams = new Map();
  }
  stream(name) {
    let s = this.streams.get(name);
    if (!s) {
      s = new Stream(name, hashStream(this.seed, name));
      this.streams.set(name, s);
    }
    return s;
  }
  /** every stream touched so far, for the save and for diagnostics */
  serialize() {
    const streams = {};
    for (const [name, s] of this.streams) streams[name] = { state: s.state, count: s.count };
    return { seed: this.seed, streams };
  }
  /** total draws across all streams — a cheap "has anything changed?" probe */
  totalDraws() {
    let n = 0;
    for (const [, s] of this.streams) n += s.count;
    return n;
  }
}

/** Fresh generator for `seed`. */
export function create(seed) {
  return new Rng(seed);
}

/** Restore a generator from `Rng.serialize()` output. */
export function restore(snap) {
  const r = new Rng(snap && snap.seed != null ? snap.seed : 1);
  for (const [name, st] of Object.entries((snap && snap.streams) || {})) {
    const s = new Stream(name, st.state);
    s.count = st.count || 0;
    r.streams.set(name, s);
  }
  return r;
}

/** A seed for a brand-new game. The only place Date.now/Math.random is allowed. */
export function newSeed() {
  return (Date.now() ^ (Math.random() * 0x100000000)) | 0;
}

export default { create, restore, newSeed };
