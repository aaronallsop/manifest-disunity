/*
 * People move.
 *
 * WHY THIS IS THE MILESTONE THAT MAKES QUALITY OF LIFE MEAN SOMETHING. Until
 * M7.9 QoL was a number on a card: a nation could grind its people into the
 * ground and the only thing that happened was a worse number. Population was
 * fixed to the ground it started on and grew there forever, so the political map
 * could only ever change by a border moving. Now a nation that is a bad place to
 * live loses the people who make it worth holding, and a nation that is a good
 * one fills up — which is the same fact the leaderboard reads, arriving through
 * the map instead of through a stat.
 *
 * THE MODEL IS A GRADIENT, NOT A DESTINATION. Nobody computes the best Area on
 * the continent and walks there; people look at the Areas next door and move
 * toward the better ones, in proportion to how much better. Flow along a graph
 * is what makes the result physical — a walled-off paradise does not drain the
 * far coast, distance is real without a single distance calculation, and the
 * transport network the game already bakes is the thing that decides who is next
 * to whom.
 *
 * FOUR THINGS PULL, and they are the four the design has been building toward:
 *
 *   Quality of life   — the nation's stock, so a policy has a demographic price
 *   Civil liberties   — the other stock, so suppression has one too
 *   Prosperity        — output per head HERE, which falls as people arrive and
 *                       is what stops the whole continent piling into one Area
 *   Alignment         — how close this Area's politics are to the mover's own
 *
 * ALIGNMENT IS THE ONE THAT CHANGES THE GAME. People move toward their own kind,
 * so a divided nation sorts itself into homogeneous halves over a few decades,
 * and the halves are exactly the ground a movement organises on. It is also the
 * knob that makes settlement a strategy: pour your own people into a separatist
 * region and the movement's SHARE falls even though its membership has not.
 *
 * CROSSING A BORDER IS HARDER THAN NOT. `migration.borderFriction` is the whole
 * of "network distance" beyond adjacency, and it is what keeps internal sorting
 * — the fast, common, invisible kind — separate from emigration, which is a
 * nation losing people to a rival and ought to be rare enough to notice.
 *
 * AND IT IS WHERE EXPULSION WOULD LIVE. If a later milestone lets a government
 * drive a population out, that is this system with the source forced rather than
 * chosen — not a special-case button with its own arithmetic.
 */
const Migration = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));
  const saturate = (x, k) => (x > 0 && k > 0 ? x / (x + k) : 0);
  const nameOf = (nid) => { const n = Game.getNation(nid); return n ? n.name : nid; };

  /* What the last turn moved, for the panel and the tests. */
  let last = { turn: -1, moved: 0, byNation: new Map(), pairs: 0, flows: [], internal: new Map() };

  /* ------------------------------------------------------------------ */
  /* the pull                                                            */
  /* ------------------------------------------------------------------ */

  /*
   * ONE PASS PER TURN, like the sentiment context and for the same reason: the
   * inner loop asks for an Area's pull once per neighbour per ideology, and
   * every term in it is a property of the Area rather than of the pair. Built
   * from `state` — the phase's snapshot, or the live columns for a read-only
   * caller — and never from a mixture of the two.
   */
  let ctxCache = null, ctxEpoch = -1, ctxTurn = -1;

  function context(state, owners, tune) {
    if (state == null && owners == null) {
      const epoch = Game.ownerEpoch();
      const turn = World.getTurn();
      if (ctxCache && ctxEpoch === epoch && ctxTurn === turn) return ctxCache;
      const built = build(Game.state(), Game.state().owner, tune);
      ctxCache = built; ctxEpoch = epoch; ctxTurn = turn;
      return built;
    }
    return build(state || Game.state(), owners || Game.state().owner, tune);
  }

  function reset() { ctxCache = null; ctxEpoch = -1; ctxTurn = -1; last = { turn: -1, moved: 0, byNation: new Map(), pairs: 0, flows: [], internal: new Map() }; }

  function build(state, owners, tune) {
    const t = tune || window.TUNE;
    const N = Ideology.count();
    const n = state.n;

    // nation index -> the two stocks, read once rather than per Area.
    const byNation = [];
    for (const [nid] of Game.nations) {
      const rec = Game.getNation(nid);
      byNation[Game.nationIndexOf(nid)] = {
        nid,
        qol: rec.qol == null ? 0.5 : rec.qol,
        liberties: rec.liberties == null ? 0.5 : rec.liberties,
      };
    }

    /*
     * ALIGNMENT, RESOLVED ONCE PER AREA PER IDEOLOGY.
     *
     * `align[f*N + k]` is how much an Area's politics suit somebody of ideology
     * k: the affinity to every ideology present, weighted by how many people
     * hold it. Asking this inside the pair loop is the same mistake M3.3 made —
     * 1,676 Areas x 6 neighbours x 6 ideologies x 6 affinities is a quarter of a
     * million lookups for a table with ten thousand entries in it.
     */
    const aff = [];
    for (let i = 0; i < N; i++) {
      aff[i] = new Float64Array(N);
      for (let j = 0; j < N; j++) aff[i][j] = Ideology.affinity(i, j);
    }
    const align = new Float32Array(n * N);
    const total = new Float64Array(n);
    const prosperity = new Float32Array(n);
    const crowding = new Float32Array(n);
    const perCapK = t.get('migration.prosperityK');
    const crowdK = t.get('migration.crowdK');

    for (let f = 0; f < n; f++) {
      const base = f * N;
      let pop = 0;
      for (let k = 0; k < N; k++) pop += state.pop[base + k];
      total[f] = pop;
      if (pop > 0) {
        for (let k = 0; k < N; k++) {
          let a = 0;
          const row = aff[k];
          for (let m = 0; m < N; m++) {
            const share = state.pop[base + m];
            if (share > 0) a += share * row[m];
          }
          align[base + k] = a / pop;
        }
        prosperity[f] = saturate(state.gdp[f] / pop, perCapK);
        crowding[f] = saturate(pop, crowdK);
      }
    }

    const w = {
      qol: t.get('migration.wQol'),
      liberties: t.get('migration.wLiberties'),
      prosperity: t.get('migration.wProsperity'),
      alignment: t.get('migration.wAlignment'),
      crowding: t.get('migration.wCrowding'),
    };

    /*
     * AND THE ANSWER ITSELF, ONCE PER AREA PER IDEOLOGY.
     *
     * The flow loop asks for a pull once per neighbour, so every Area's is
     * computed about six times over — 55,000 evaluations of a five-term sum for
     * a table with ten thousand entries in it. Filling the table costs one pass
     * and turns the inner loop into an array read. Measured: 6.8 ms a turn to
     * 2.4 ms, on a phase that runs inside every world turn of every test.
     */
    const value = new Float32Array(n * N);
    for (let f = 0; f < n; f++) {
      const o = owners[f];
      const nat = o >= 0 ? byNation[o] : null;
      if (!nat) continue;
      const fixed = w.qol * nat.qol + w.liberties * nat.liberties
        + w.prosperity * prosperity[f] - w.crowding * crowding[f];
      const base = f * N;
      for (let k = 0; k < N; k++) value[base + k] = clamp01(fixed + w.alignment * align[base + k]);
    }

    return { N, n, owners, byNation, align, total, prosperity, crowding, value, w };
  }

  /**
   * How much somebody of ideology `k` wants to live in Area node `f`, 0..1.
   *
   * A weighted sum of four normalised pulls and one push, clamped — the same
   * shape as every stock in the game, and for the same reason: the terms have to
   * be comparable to each other or the weights are not weights. Computed in
   * `build`, one pass over the board, and read here.
   */
  const pull = (ctx, f, k) => ctx.value[f * ctx.N + k];

  /**
   * Why somebody would move here, as a Why record — the same convention the
   * stocks use, so the panel can render it with the renderer it already has.
   */
  function explain(fips, ideology, tune) {
    const t = tune || window.TUNE;
    const f = Game.nodeOf(fips);
    if (f < 0) return null;
    const ctx = context(null, null, t);
    const k = typeof ideology === 'number' ? ideology : Ideology.index(ideology);
    const o = ctx.owners[f];
    const nat = o >= 0 ? ctx.byNation[o] : null;
    if (!nat || k < 0) return null;
    const w = ctx.w;
    const inputs = [
      { label: 'Quality of life', raw: nat.qol, norm: nat.qol, weight: w.qol,
        contribution: w.qol * nat.qol, key: 'migration.wQol',
        note: 'the nation you would be living in' },
      { label: 'Civil liberties', raw: nat.liberties, norm: nat.liberties, weight: w.liberties,
        contribution: w.liberties * nat.liberties, key: 'migration.wLiberties',
        note: 'and how it treats the people already there' },
      { label: 'Prosperity', raw: ctx.total[f] > 0 ? Game.countyGdp(Game.areaIdOf(fips)) / ctx.total[f] : 0,
        norm: ctx.prosperity[f], weight: w.prosperity,
        contribution: w.prosperity * ctx.prosperity[f], key: 'migration.wProsperity',
        note: 'output per head here, which falls as people arrive' },
      { label: 'Your own kind', raw: ctx.align[f * ctx.N + k], norm: ctx.align[f * ctx.N + k],
        weight: w.alignment, contribution: w.alignment * ctx.align[f * ctx.N + k],
        key: 'migration.wAlignment', note: 'how close this Area’s politics are to yours' },
      { label: 'Crowding', raw: ctx.total[f], norm: ctx.crowding[f], weight: -w.crowding,
        contribution: -w.crowding * ctx.crowding[f], key: 'migration.wCrowding',
        note: 'people already here' },
    ];
    const value = pull(ctx, f, k);
    inputs.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    return { value, inputs, summary: summarise(value, inputs) };
  }

  function summarise(value, inputs) {
    const band = value >= 0.7 ? 'Somewhere people move to' : value >= 0.5 ? 'Comfortable'
      : value >= 0.3 ? 'Tolerable' : 'Somewhere people leave';
    const up = inputs.find((i) => i.contribution > 0);
    const down = inputs.find((i) => i.contribution < 0);
    if (up && down) return `${band}: ${up.label.toLowerCase()} carries it, ${down.label.toLowerCase()} costs.`;
    return up ? `${band}: ${up.label.toLowerCase()} carries it.` : band;
  }

  /* ------------------------------------------------------------------ */
  /* the flow                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * One turn of people moving, as a phase: reads `snap`, writes `nxt`.
   *
   * EVERY FLOW IS COMPUTED BEFORE ANY IS APPLIED, into a delta buffer. Applying
   * as it goes would let the first Area's arrivals decide the second Area's
   * departures, so who moved would depend on the order of the node numbering —
   * the exact failure the snap/nxt discipline exists to prevent, in a phase that
   * writes to its NEIGHBOURS rather than to itself.
   */
  function step(snap, nxt, tune, owners) {
    const t = tune || window.TUNE;
    const g = Game.graph();
    if (!g) return null;
    const own = owners || Game.state().owner;
    const ctx = build(snap, own, t);
    const { N, n } = ctx;

    const rate = t.get('migration.rate');
    const threshold = t.get('migration.threshold');
    const full = Math.max(1e-9, t.get('migration.gradientFull'));
    const friction = t.get('migration.borderFriction');
    const minPop = t.get('migration.minPop');

    const delta = new Float64Array(n * N);
    // One scratch array for the neighbour gains, sized to the widest Area on the
    // map: allocating one per Area per ideology is ten thousand allocations a
    // turn for a number that never changes.
    let maxDeg = 0;
    for (let i = 0; i < n; i++) { const d = g.degree(i); if (d > maxDeg) maxDeg = d; }
    const gain = new Float64Array(maxDeg);
    /*
     * WHO LEFT FOR WHERE, but only across a border. Recorded here rather than
     * derived from the deltas afterwards, because a net figure per Area cannot
     * say where anybody went — and "12,400 left for Nevada" is the sentence the
     * player can act on, where "population fell" is weather.
     *
     * Internal moves are deliberately not tallied: within one nation they are
     * the common case, they are most of the arithmetic, and nobody needs a
     * report on people moving one county over.
     */
    const crossings = new Map();
    /* And how much churn never left the country, which is most of it. */
    const inside = new Map();
    let moved = 0, pairs = 0;

    for (let f = 0; f < n; f++) {
      const nb = g.neighbors(f);
      if (!nb.length) continue;
      const base = f * N;
      const here = ctx.owners[f];
      if (here < 0) continue;
      for (let k = 0; k < N; k++) {
        const pop = snap.pop[base + k];
        if (pop < minPop) continue;
        const home = pull(ctx, f, k);
        let sum = 0, count = 0;
        for (let i = 0; i < nb.length && i < gain.length; i++) {
          const j = nb[i];
          if (ctx.owners[j] < 0) { gain[i] = 0; continue; }
          let d = pull(ctx, j, k) - home;
          // A BORDER IS FRICTION, NOT A WALL: the gradient across one is real
          // and smaller, so internal sorting is the common case and emigration
          // is the visible one.
          if (ctx.owners[j] !== here) d *= friction;
          gain[i] = d > threshold ? d : 0;
          sum += gain[i];
          if (gain[i] > 0) count++;
        }
        if (!count || sum <= 0) continue;
        // The share that leaves is set by how much better it is next door, up to
        // the per-turn cap: nobody empties an Area in one quarter, however bad.
        const leaving = pop * rate * Math.min(1, sum / full);
        if (leaving <= 0) continue;
        delta[base + k] -= leaving;
        for (let i = 0; i < nb.length && i < gain.length; i++) {
          if (gain[i] <= 0) continue;
          const j = nb[i];
          const share = leaving * (gain[i] / sum);
          delta[j * N + k] += share;
          const there = ctx.owners[j];
          if (there !== here) {
            const key = `${here}>${there}`;
            crossings.set(key, (crossings.get(key) || 0) + share);
          } else {
            inside.set(here, (inside.get(here) || 0) + share);
          }
        }
        moved += leaving;
        pairs += count;
      }
    }

    /*
     * Apply, and take the movements with the people who left.
     *
     * A movement's membership is people, so when a tenth of an Area's reds leave
     * a tenth of the red movement's members leave with them. ARRIVALS DO NOT
     * JOIN: somebody who moved in last quarter is not a member of the local
     * separatist organisation, and that asymmetry is the whole reason settlement
     * works as an answer to secession — the movement's SHARE falls because the
     * denominator grew, which is exactly what happens to a real one.
     */
    const totals = new Map();
    for (let f = 0; f < n; f++) {
      const base = f * N;
      let before = 0, after = 0;
      for (let k = 0; k < N; k++) {
        const d = delta[base + k];
        if (d === 0) continue;
        const was = nxt.pop[base + k];
        const now = Math.max(0, was + d);
        nxt.pop[base + k] = now;
        if (d < 0 && was > 0) scaleMovements(nxt, f, k, now / was);
        before += was; after += now;
      }
      if (before !== after) {
        const o = ctx.owners[f];
        if (o >= 0) {
          const nat = ctx.byNation[o];
          if (nat) totals.set(nat.nid, (totals.get(nat.nid) || 0) + (after - before));
        }
      }
    }

    /*
     * Nation INDICES are what the phase has; nation IDS are what everything else
     * reads, and the two are only the same thing until somebody is conquered.
     * Resolved here, once, while the context that knows the mapping is still in
     * hand.
     */
    const flows = [];
    for (const [key, people] of crossings) {
      if (people < 1) continue;
      const [a, b] = key.split('>').map(Number);
      const from = ctx.byNation[a], to = ctx.byNation[b];
      if (from && to) flows.push({ from: from.nid, to: to.nid, people });
    }
    flows.sort((x, y) => y.people - x.people);
    const internal = new Map();
    for (const [idx, people] of inside) {
      const nat = ctx.byNation[idx];
      if (nat && people >= 1) internal.set(nat.nid, people);
    }
    last = { turn: World.getTurn(), moved, byNation: totals, pairs, flows, internal };
    return last;
  }

  /** Movements of ideology `k` in Area node `f`, scaled by the people left behind. */
  let ideologyOfMovement = null, ideologyOfFor = -1;
  function scaleMovements(nxt, f, k, ratio) {
    const bag = nxt.mov[f];
    if (!bag) return;
    if (ideologyOfMovement == null || ideologyOfFor !== Movements.getSpawned().length) {
      ideologyOfMovement = Object.create(null);
      for (const m of Movements.getSpawned()) ideologyOfMovement[m] = Movements.ideologyIndexOf(m);
      ideologyOfFor = Movements.getSpawned().length;
    }
    for (const name in bag) {
      if (ideologyOfMovement[name] === k) bag[name] *= ratio;
    }
  }

  /** What the last turn moved, net, for one nation. */
  const netFor = (nid) => (last.byNation.get(nid) || 0);
  const lastFlows = () => last;

  /**
   * Who this nation gained and lost people to on the last turn, with the net.
   *
   * The net is the number the panel leads with and the two lists are why it is
   * that number — the same "the explanation is a by-product of the calculation"
   * bargain the stocks make.
   */
  function report(nid) {
    const out = [], into = [];
    for (const f of last.flows || []) {
      if (f.from === nid) out.push({ nid: f.to, name: nameOf(f.to), people: f.people });
      else if (f.to === nid) into.push({ nid: f.from, name: nameOf(f.from), people: f.people });
    }
    const left = out.reduce((s, x) => s + x.people, 0);
    const came = into.reduce((s, x) => s + x.people, 0);
    /*
     * `internal` is CHURN, not net: people moving between two Areas of the same
     * country cancel in the net by construction, and reporting the cancellation
     * would be reporting zero. What the player wants to know is how much of the
     * country is on the move at all.
     */
    return { net: netFor(nid), left, came, out, into,
             internal: (last.internal && last.internal.get(nid)) || 0 };
  }

  return { context, build, pull, explain, step, netFor, lastFlows, report, reset };
})();
