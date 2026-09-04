/*
 * The Area adjacency graph, in compressed sparse row form, built once at load.
 *
 * WHAT THIS REPLACES. `countyNeighbors(fips)` allocated a fresh Set and re-walked
 * every member county of the Area on every single query — and it is the hot loop
 * for the neighbour-pull term in political drift, for contiguity, for annex
 * targeting, for splinter planning, and for every system M4 adds on top. M1
 * bought time with a memo Map keyed by fips string; that removed the re-walk but
 * not the string hashing, the array-of-strings result, or the fresh Set every
 * component search allocates.
 *
 * CSR is three arrays and no objects:
 *
 *     start : Int32Array(n + 1)   start[i]..start[i+1] is node i's slice
 *     list  : Int32Array(m)       every neighbour of every node, concatenated
 *     ids   : string[]            index -> Area id, for the boundary with the DOM
 *
 * A neighbour walk is `for (let k = start[i]; k < start[i+1]; k++) list[k]` —
 * one contiguous read, zero allocation. A component search is a stack of ints
 * against a `Uint8Array` visited mask instead of a Set of strings.
 *
 * NEIGHBOUR ORDER IS SORTED BY INDEX, which is a deliberate behaviour change.
 * The old order came from the key order of `adjacency.json`, so a re-bake that
 * happened to emit a county's neighbours in a different order would silently
 * change which nation won an `argmax` tie and which Area a component search
 * reached first — a replay divergence with no modelled cause. Sorted order is a
 * property of the graph rather than of the file that described it.
 *
 * This module knows nothing about the game: it is nodes and edges. `Game` owns
 * what a node means.
 */

/**
 * Build a CSR graph.
 *
 * @param {string[]} ids       node ids, in the order that becomes the index
 * @param {(id: string) => Iterable<string>} neighborsOf
 *        every neighbour of a node, as ids. Unknown ids and self-loops are
 *        dropped; duplicates are collapsed. The result is symmetrised, so an
 *        edge declared in one direction only still exists in both.
 * @returns {Graph}
 */
export function build(ids, neighborsOf) {
  const n = ids.length;
  const index = new Map();
  for (let i = 0; i < n; i++) index.set(ids[i], i);

  // Pass 1: collect each node's neighbour set as indices, symmetrising as we go.
  const sets = new Array(n);
  for (let i = 0; i < n; i++) sets[i] = new Set();
  for (let i = 0; i < n; i++) {
    for (const nb of neighborsOf(ids[i]) || []) {
      const j = index.get(nb);
      if (j === undefined || j === i) continue;
      sets[i].add(j);
      sets[j].add(i); // an edge is a fact about a pair, not about one end of it
    }
  }

  // Pass 2: flatten, sorted by index so the order is a property of the graph.
  const start = new Int32Array(n + 1);
  let m = 0;
  for (let i = 0; i < n; i++) { start[i] = m; m += sets[i].size; }
  start[n] = m;
  const list = new Int32Array(m);
  for (let i = 0; i < n; i++) {
    const row = [...sets[i]].sort((a, b) => a - b);
    for (let k = 0; k < row.length; k++) list[start[i] + k] = row[k];
  }

  return new Graph(ids.slice(), index, start, list);
}

export class Graph {
  constructor(ids, index, start, list) {
    this.ids = ids;
    this.index = index;
    this.start = start;
    this.list = list;
    this.n = ids.length;
    this.m = list.length;
    /** id -> frozen string[] of neighbour ids, materialised on demand. */
    this._idCache = new Map();
  }

  /** Node index for an id, or -1. */
  indexOf(id) {
    const i = this.index.get(id);
    return i === undefined ? -1 : i;
  }

  idAt(i) { return this.ids[i]; }

  degree(i) { return this.start[i + 1] - this.start[i]; }

  /**
   * A zero-copy view of node i's neighbours as indices. Valid for the life of
   * the graph; do not write to it.
   */
  neighbors(i) { return this.list.subarray(this.start[i], this.start[i + 1]); }

  /**
   * Neighbours as ids, for the string-keyed callers that still exist above the
   * model. Cached and frozen: the array is shared, so a caller that mutated it
   * would corrupt every later query.
   */
  neighborIds(id) {
    let hit = this._idCache.get(id);
    if (hit) return hit;
    const i = this.indexOf(id);
    if (i < 0) return EMPTY;
    const out = new Array(this.degree(i));
    for (let k = this.start[i], p = 0; k < this.start[i + 1]; k++, p++) out[p] = this.ids[this.list[k]];
    hit = Object.freeze(out);
    this._idCache.set(id, hit);
    return hit;
  }

  /** Is there an edge between these two indices? Binary search on the sorted row. */
  hasEdge(a, b) {
    let lo = this.start[a], hi = this.start[a + 1] - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const v = this.list[mid];
      if (v === b) return true;
      if (v < b) lo = mid + 1; else hi = mid - 1;
    }
    return false;
  }

  /** A reusable visited mask, so a BFS in a render path allocates nothing. */
  mask() { return new Uint8Array(this.n); }

  /**
   * Connected components of a subset.
   *
   * @param {Iterable<number>} nodes  indices to partition
   * @param {(i:number)=>any} [keyFn] two nodes join only if their keys are ===,
   *        so "contiguous AND same owner" is one call rather than a pre-filter
   *        per owner.
   * @returns {Int32Array[]} one array per component, each sorted ascending
   */
  components(nodes, keyFn) {
    const inSet = this.mask();
    const seen = this.mask();
    const order = [];
    for (const i of nodes) if (!inSet[i]) { inSet[i] = 1; order.push(i); }
    order.sort((a, b) => a - b); // component order is the graph's, not the caller's

    const out = [];
    const stack = [];
    for (const s of order) {
      if (seen[s]) continue;
      seen[s] = 1;
      const key = keyFn ? keyFn(s) : null;
      const group = [s];
      stack.length = 0;
      stack.push(s);
      while (stack.length) {
        const cur = stack.pop();
        for (let k = this.start[cur]; k < this.start[cur + 1]; k++) {
          const nb = this.list[k];
          if (!inSet[nb] || seen[nb]) continue;
          if (keyFn && keyFn(nb) !== key) continue;
          seen[nb] = 1;
          group.push(nb);
          stack.push(nb);
        }
      }
      group.sort((a, b) => a - b);
      out.push(Int32Array.from(group));
    }
    return out;
  }

  /**
   * Every node OUTSIDE the set that touches it — the frontier of a territory.
   * `inside` is a Uint8Array mask so annex targeting can reuse one allocation.
   */
  frontier(inside) {
    const out = [];
    const seen = this.mask();
    for (let i = 0; i < this.n; i++) {
      if (!inside[i]) continue;
      for (let k = this.start[i]; k < this.start[i + 1]; k++) {
        const nb = this.list[k];
        if (!inside[nb] && !seen[nb]) { seen[nb] = 1; out.push(nb); }
      }
    }
    return Int32Array.from(out);
  }

  /**
   * Breadth-first order from a set of sources, over nodes `allow` accepts.
   * Used by the partial-victory subset walk, which must take Areas in order of
   * distance from the winner's own soil rather than in whatever order a Set
   * happened to hold them.
   */
  bfs(sources, allow) {
    const seen = this.mask();
    const queue = [];
    for (const s of sources) if (!seen[s]) { seen[s] = 1; queue.push(s); }
    const out = [];
    for (let head = 0; head < queue.length; head++) {
      const cur = queue[head];
      out.push(cur);
      for (let k = this.start[cur]; k < this.start[cur + 1]; k++) {
        const nb = this.list[k];
        if (seen[nb] || (allow && !allow(nb))) continue;
        seen[nb] = 1;
        queue.push(nb);
      }
    }
    return Int32Array.from(out);
  }

  /** Bytes held by the flat arrays, for the M5 instrumentation panel. */
  bytes() { return this.start.byteLength + this.list.byteLength; }
}

const EMPTY = Object.freeze([]);

export default { build, Graph };
