/*
 * How far a nation can actually reach.
 *
 * ANTI-SNOWBALL BRAKE #3, and the one that finally makes the baked rail and
 * interstate data do something. The first two — the coalition and the cost of
 * occupation — are prices a big nation pays. This is a LIMIT: past a certain
 * distance from the places you govern from, measured along the network rather
 * than across the map, there is no price that buys the ground. An empire that
 * wants to keep growing has to take the infrastructure that lets it, which is a
 * decision about where to expand rather than whether to.
 *
 * REACH IS A DIJKSTRA FROM ONE PLACE: where the government sits. Its own
 * homeland's seat if it still holds it, otherwise the largest Area it does —
 * a government that has lost its capital sits in its largest city. Cost
 * accumulates per Area entered and reach is `decay^cost`, so it falls smoothly
 * and there is no ring on the map.
 *
 * ONE source and not every capital it holds, and that is the whole design. The
 * first cut made every captured seat a source too, on the reasoning that taking
 * a capital should extend your reach; measured, it made the brake a no-op,
 * because an empire built by conquest captures capitals by construction. A
 * nation holding 852 of the 1,676 Areas had twenty-four seats and full reach
 * over every one of its frontier targets. Reach has to decay from a CORE or it
 * does not decay at all.
 *
 * THE NETWORK IS THE POINT. Entering an Area costs full price overland, less
 * along an interstate, less again where there is rail, and least of all through
 * a rail hub — so the corridors the country was actually built along are the
 * ones armies move down. Foreign ground costs a multiple: projecting THROUGH
 * somebody else's territory is most of what makes a distant war hard, and it is
 * why a nation that has been given transit rights by a neighbour it never
 * conquered still cannot fight a war on the far side of them.
 *
 * WHAT IT COSTS: an annexation at the edge of a nation's reach is dearer and
 * fought worse, and beyond `proj.minReach` it is not offered at all. All three
 * come off the same number, so the panel can explain the refusal with the same
 * record that priced the attempt.
 */
const Projection = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));

  /* ------------------------------------------------------------------ */
  /* the network, resolved once per world                                */
  /* ------------------------------------------------------------------ */

  /*
   * The cost of ENTERING each Area, from the baked transport attributes.
   *
   * Immutable for the life of a world — rail does not move — so it is built once
   * and keyed on the graph's node count rather than recomputed per nation per
   * turn. Best link wins: an Area with a hub and an interstate is a hub.
   */
  let stepCost = null, stepFor = -1;

  function costs(tune) {
    const t = tune || window.TUNE;
    const g = Game.graph();
    if (!g) return null;
    if (stepCost && stepFor === g.n) return stepCost;
    const hub = t.get('proj.hubCost'), rail = t.get('proj.railCost');
    const road = t.get('proj.highwayCost'), land = t.get('proj.overlandCost');
    stepCost = new Float32Array(g.n);
    for (let i = 0; i < g.n; i++) {
      const a = Game.areaTransport(g.idAt(i));
      stepCost[i] = a.hub ? hub : a.rail ? rail : a.highway ? road : land;
    }
    stepFor = g.n;
    return stepCost;
  }

  /* ------------------------------------------------------------------ */
  /* reach                                                               */
  /* ------------------------------------------------------------------ */

  let cache = new Map(), cacheEpoch = -1, cacheTurn = -1;

  function reset() {
    cache = new Map(); cacheEpoch = -1; cacheTurn = -1; stepCost = null; stepFor = -1;
  }

  /**
   * The ONE Area a nation projects force from: where its government sits.
   *
   * Its own homeland's seat if it still holds it, and otherwise the largest Area
   * it does hold — a government that has lost its capital sits in its largest
   * city, which is what governments do.
   *
   * ONE SOURCE, AND THAT IS THE WHOLE DESIGN. The first cut made every seat of
   * government a nation holds a source, on the reasoning that capturing a
   * capital should extend your reach. Measured, that made the brake a no-op:
   * an empire built by conquest captures capitals BY CONSTRUCTION, and one
   * holding 852 of the 1,676 Areas had twenty-four seats, full reach over every
   * one of its twenty-two frontier targets, and no limit of any kind. Reach has
   * to decay from a CORE or it does not decay at all — and the shape that falls
   * out of one core is the interesting one: an empire grows as a blob around its
   * capital and a long thin one cannot push at its far end, whatever it holds
   * in between.
   */
  function sources(nid) {
    const n = Game.getNation(nid);
    if (!n) return [];
    if (typeof Victory !== 'undefined' && Victory.loaded() && n.homeSt) {
      const seat = Victory.all()[n.homeSt];
      if (seat && n.counties.has(seat.area)) return [seat.area];
    }
    const biggest = Game.largestCounty(n.counties);
    return biggest ? [biggest] : [];
  }

  /**
   * Reach from this nation's seats, per Area node, 0..1.
   *
   * A BOUNDED Dijkstra: the search stops where reach falls under `proj.minReach`,
   * because an Area nobody can act on does not need a number. That bound is what
   * makes this affordable — the AI asks for it once per nation per ownership
   * change, and an unbounded sweep of 1,676 nodes fifty-one times a round is not
   * a cache miss, it is a stall.
   */
  function field(nid, tune) {
    const t = tune || window.TUNE;
    const g = Game.graph();
    if (!g) return null;
    const epoch = Game.ownerEpoch();
    if (cacheEpoch !== epoch || cacheTurn !== World.getTurn()) {
      cache = new Map(); cacheEpoch = epoch; cacheTurn = World.getTurn();
    }
    const hit = cache.get(nid);
    if (hit) return hit;

    const step = costs(t);
    const decay = Math.max(1e-6, Math.min(0.999, t.get('proj.decay')));
    const minReach = Math.max(1e-6, t.get('proj.minReach'));
    const foreign = t.get('proj.foreignCost');
    const limit = Math.log(minReach) / Math.log(decay); // cost at which reach dies
    const own = Game.state().owner;
    const mine = Game.nationIndexOf(nid);

    /*
     * FLOAT64, AND IT HAS TO BE.
     *
     * `dist` is an accumulated cost — a quantity — and the heap holds ordinary
     * JavaScript numbers. Stored in a Float32Array, a distance is rounded on the
     * way in and compared against an unrounded copy on the way out, so
     * `d > dist[node]` is true for a node whose own entry it is and the node is
     * skipped as stale. Measured: Oregon sat 3.05 from Sacramento by
     * Bellman-Ford and read as unreachable here, and 481 of 944 annexation
     * targets were being refused for a rounding error. This is the state
     * module's own rule — Float64 for quantities, Float32 for bounded scores —
     * and `out` below is a 0..1 score, so it stays Float32.
     */
    const dist = new Float64Array(g.n).fill(Infinity);
    const heap = new Heap();
    for (const f of sources(nid)) {
      const i = Game.nodeOf(f);
      if (i < 0) continue;
      dist[i] = 0;
      heap.push(i, 0);
    }
    while (heap.size) {
      const [node, d] = heap.pop();
      if (d > dist[node]) continue;
      const nb = g.neighbors(node);
      for (let k = 0; k < nb.length; k++) {
        const j = nb[k];
        /*
         * Ground you do not hold is dear to move through, whoever holds it, and
         * that multiple is most of what the brake is: a nation's own territory
         * costs what the terrain costs, and everybody else's costs a multiple of
         * it. There was briefly a matching discount for home ground here, added
         * to fix a Texas that could not reach one of its twenty targets — the
         * cause turned out to be the Float32 distance array below, and a knob
         * that exists to work around a bug is worse than no knob.
         */
        const cost = step[j] * (own[j] === mine ? 1 : foreign);
        const nd = d + cost;
        if (nd >= limit || nd >= dist[j]) continue;
        dist[j] = nd;
        heap.push(j, nd);
      }
    }
    /*
     * HOLDING IS NOT PROJECTING, and the floor is where that is said.
     *
     * A nation always administers its own soil: measured without this, nineteen
     * of the fifty-one opening nations could not reach part of their own state
     * and Nevada could reach nine of its seventeen Areas, which reads as a
     * broken map rather than as a limit. The floor is applied AFTER the search,
     * so it never feeds the frontier — a far border still projects nothing
     * beyond itself, which is the whole point of the brake. What a nation can
     * hold and what it can take are different questions.
     */
    const home = t.get('proj.homeFloor');
    const out = new Float32Array(g.n);
    for (let i = 0; i < g.n; i++) {
      const v = dist[i] === Infinity ? 0 : Math.pow(decay, dist[i]);
      out[i] = own[i] === mine ? Math.max(v, home) : v;
    }
    cache.set(nid, out);
    return out;
  }

  /** Reach at one Area, 0..1. */
  function at(nid, fips, tune) {
    const f = field(nid, tune);
    if (!f) return 1;
    const i = Game.nodeOf(fips);
    return i < 0 ? 0 : f[i];
  }

  /** Can this nation act on this Area at all? */
  function inRange(nid, fips, tune) {
    const t = tune || window.TUNE;
    return at(nid, fips, t) >= t.get('proj.minReach');
  }

  /** The multiplier this Area's distance puts on an annexation's price. */
  function costMultiplier(nid, areas, tune) {
    const t = tune || window.TUNE;
    let worst = 1;
    for (const f of areas) worst = Math.min(worst, at(nid, f, t));
    return 1 + t.get('proj.costAtLimit') * (1 - clamp01(worst));
  }

  /** ...and on how badly it goes when it comes to a fight. */
  function warMultiplier(nid, areas, tune) {
    const t = tune || window.TUNE;
    let worst = 1;
    for (const f of areas) worst = Math.min(worst, at(nid, f, t));
    return 1 + t.get('proj.warAtLimit') * (1 - clamp01(worst));
  }

  /**
   * Why this Area is or is not within reach — the same record that prices it.
   *
   * The route matters as much as the number: "eleven Areas from Sacramento, six
   * of them through Nevada" is something a player can act on, where "reach 0.07"
   * is a number they can only resent.
   */
  function explain(nid, fips, tune) {
    const t = tune || window.TUNE;
    const value = at(nid, fips, t);
    const from = sources(nid);
    const seats = from.map((f) => Game.nameForCounty(f));
    const decay = Math.max(1e-6, Math.min(0.999, t.get('proj.decay')));
    const cost = value > 0 ? Math.log(value) / Math.log(decay) : Infinity;
    const inR = value >= t.get('proj.minReach');
    return {
      value, cost, sources: from, seats, inRange: inR,
      costMultiplier: costMultiplier(nid, [fips], t),
      warMultiplier: warMultiplier(nid, [fips], t),
      summary: !from.length ? 'This nation governs from nowhere.'
        : inR
          ? `${Math.round(value * 100)}% reach from ${seats[0]}${seats.length > 1 ? ` and ${seats.length - 1} other ${seats.length === 2 ? 'seat' : 'seats'}` : ''}.`
          : `Out of reach: ${Math.round(value * 100)}% from ${seats[0]}. Take a seat of government or the rail between here and there.`,
    };
  }

  /* A binary min-heap, because the search is over a graph with float weights. */
  class Heap {
    constructor() { this.a = []; }
    get size() { return this.a.length; }
    push(node, d) {
      const a = this.a;
      a.push([node, d]);
      let i = a.length - 1;
      while (i > 0) {
        const p = (i - 1) >> 1;
        if (a[p][1] <= a[i][1]) break;
        const tmp = a[p]; a[p] = a[i]; a[i] = tmp;
        i = p;
      }
    }
    pop() {
      const a = this.a;
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        let i = 0;
        for (;;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < a.length && a[l][1] < a[m][1]) m = l;
          if (r < a.length && a[r][1] < a[m][1]) m = r;
          if (m === i) break;
          const tmp = a[m]; a[m] = a[i]; a[i] = tmp;
          i = m;
        }
      }
      return top;
    }
  }

  return { field, at, inRange, sources, costMultiplier, warMultiplier, explain, reset };
})();
