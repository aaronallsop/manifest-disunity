/*
 * Columnar Area state: one typed array per field, indexed by Area node.
 *
 * WHAT THIS REPLACES. Every Area was a plain object — `{name, st, pop, mov, gdp,
 * attrs, anchor}` — and both paths that copy an Area hand-enumerated its fields:
 * `Game.serialize` listed them, and `World.advanceTurn`'s snapshot and writeback
 * listed them again. **Any field a phase added was silently dropped by both.**
 * Not "lost with a warning": a new field would work perfectly for one turn,
 * vanish at the writeback, and reappear at its default. M3 adds five fields per
 * Area and M4 adds a value per Area per movement, so that is not hypothetical.
 *
 * The fix is not "remember to update three lists". It is that there is only one
 * list: FIELDS. `clone()`, `bytes()` and the save path all iterate it, so adding
 * a field is one entry and it is copied, cloned and persisted by construction.
 *
 * WHY TYPED ARRAYS. At the target scope an Area carries ~35 values and
 * `advanceTurn` deep-copies every record twice per turn — about 117k property
 * writes before any math — and the M5 dashboard re-runs 50 turns on every slider
 * drag. Columnar makes a turn's copy one `.slice()` per field (a memcpy each)
 * and every phase an index loop with zero allocation.
 *
 * WHY Float64 AND NOT Float32. The plan says Float32Array; that is wrong for
 * these fields and right for the ones M3 and M4 add. Float32 carries 24 bits of
 * mantissa, so it holds integers exactly only up to 16,777,216 — and this game's
 * invariants are exact: world population is 340,110,988 and a save round-trip
 * must reproduce the state bit-for-bit. A single Area survives Float32 today
 * (Los Angeles is 9.8M), but the sums do not, and GDP at ~1.5e11 per Area would
 * be quantised to the nearest ~16,000 dollars. So: **Float64 for quantities
 * (population, money), Float32 for bounded 0..1 scores** — M3's food, health, IT
 * and liberties, M4's 1,676 x 22 sentiment matrix — where seven significant
 * digits is far more precision than a designed score carries meaning.
 *
 * THE ARRAYS ARE ALLOCATED ONCE PER WORLD and never replaced, only written into.
 * That is what lets `slot()` hand out a cached `subarray` view instead of
 * allocating one per call, which in turn is what lets `Game.county[f].pop[2]`
 * keep working unchanged while the storage underneath is flat.
 *
 * This module knows nothing about the game. It is arrays and an index.
 */

/**
 * The field table. `stride: 'mix'` means one value per ideology per Area;
 * a number, or omitted, means one value per Area.
 *
 * `save: false` marks a field that is DERIVED from immutable baked data at load
 * and so does not belong in a save file.
 *
 * To add a field: add an entry. That is the whole change.
 */
export const FIELDS = [
  {
    key: 'pop', type: Float64Array, stride: 'mix',
    doc: 'People, per ideology. Float64 because the world total is an exact integer invariant.',
  },
  {
    key: 'gdp', type: Float64Array,
    doc: 'Annual output in dollars. Float64: ~1.5e11 per Area quantises to ~16k under Float32.',
  },
  {
    key: 'anchor', type: Float64Array, stride: 'mix', save: false,
    doc: 'The Area\'s founding political character as ideology shares, fixed for the game. '
       + 'Political drift pulls partly toward it, which is what stops every Area collapsing '
       + 'onto one national attractor. Derived from the bake at load, so it is not saved.',
  },
  {
    key: 'owner', type: Int16Array, fill: -1,
    doc: 'Nation index, or -1 for unowned. THE single source of truth for ownership (M2.3b).',
  },
];

export class AreaState {
  /**
   * @param {string[]} ids  Area ids in the order that becomes the index. Pass
   *                        the graph's `ids` so the graph and the state share
   *                        one index and a node number means the same thing in
   *                        both.
   * @param {{mixWidth?: number, fields?: object[]}} opts
   */
  constructor(ids, opts = {}) {
    this.ids = ids.slice();
    this.n = this.ids.length;
    this.mixWidth = opts.mixWidth || 1;
    this.index = new Map();
    for (let i = 0; i < this.n; i++) this.index.set(this.ids[i], i);

    this.fields = [];
    this.columns = Object.create(null);
    this.stride = Object.create(null);
    this._slots = Object.create(null);
    for (const spec of opts.fields || FIELDS) this.addField(spec);
  }

  /**
   * Allocate a field. Idempotent by key, so a reload cannot double-allocate.
   * Returns the column.
   */
  addField(spec) {
    if (this.columns[spec.key]) return this.columns[spec.key];
    const stride = spec.stride === 'mix' ? this.mixWidth : (spec.stride || 1);
    const col = new spec.type(this.n * stride);
    if (spec.fill) col.fill(spec.fill);
    this.fields.push(spec);
    this.columns[spec.key] = col;
    this.stride[spec.key] = stride;
    this[spec.key] = col; // state.pop, state.gdp, ... for the flat index loops
    return col;
  }

  indexOf(id) {
    const i = this.index.get(id);
    return i === undefined ? -1 : i;
  }

  idAt(i) { return this.ids[i]; }

  /**
   * A zero-copy view of Area i's slot in a strided field. Writing to it writes
   * the state — that is the point.
   *
   * The view is CACHED, so a read in a hot loop allocates nothing. That is only
   * sound because the columns are never reallocated: `clone()` builds a separate
   * object with its own cache, and loading a save writes into the existing
   * arrays rather than swapping them.
   */
  slot(key, i) {
    let cache = this._slots[key];
    if (!cache) cache = this._slots[key] = new Array(this.n);
    let v = cache[i];
    if (v === undefined) {
      const st = this.stride[key];
      if (st === undefined) throw new Error(`unknown state field "${key}"`);
      v = cache[i] = this.columns[key].subarray(i * st, i * st + st);
    }
    return v;
  }

  /**
   * A copy with the same index and independent storage: one `.slice()` per
   * field. This is what a turn's snapshot costs.
   */
  clone() {
    const out = Object.create(AreaState.prototype);
    out.ids = this.ids;       // ids never change within a world, so share them
    out.n = this.n;
    out.mixWidth = this.mixWidth;
    out.index = this.index;   // shared for the same reason
    out.fields = this.fields.slice();
    out.columns = Object.create(null);
    out.stride = Object.create(null);
    out._slots = Object.create(null);
    for (const spec of out.fields) {
      const col = this.columns[spec.key].slice();
      out.columns[spec.key] = col;
      out.stride[spec.key] = this.stride[spec.key];
      out[spec.key] = col;
    }
    return out;
  }

  /** Copy every field of `other` into this one, in place, keeping the views valid. */
  copyFrom(other) {
    for (const spec of this.fields) {
      const src = other.columns[spec.key];
      if (src) this.columns[spec.key].set(src);
    }
    return this;
  }

  /** Total bytes held, for the M5 instrumentation panel. */
  bytes() {
    let t = 0;
    for (const spec of this.fields) t += this.columns[spec.key].byteLength;
    return t;
  }

  /** Field keys in declaration order; `saved()` is the subset a save carries. */
  keys() { return this.fields.map((f) => f.key); }
  saved() { return this.fields.filter((f) => f.save !== false).map((f) => f.key); }
}

export default { AreaState, FIELDS };
