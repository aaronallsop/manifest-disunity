/*
 * Force, as an allocation.
 *
 * NO UNIT COUNTERS, no stacks, no map tokens. A nation has one number for how
 * much it can bring to bear, and the only decision is where it points:
 *
 *   Garrison  holds your own ground down. Buys sentiment, costs liberties.
 *   Border    makes you expensive to attack.
 *   Field     makes your own attacks land.
 *
 * That is the whole system, and it is deliberately small. The game already has
 * four power stocks, six sentiment terms and a civil-war roll; a second tactical
 * layer with its own map would be a different game bolted to this one. What was
 * missing was not depth but a DECISION — before M6.5 the only way to answer
 * rising secession was to give ground away, and the only input to a war was how
 * big you were.
 *
 * FORCE IS DERIVED. Manpower from population, equipment from wealth per head,
 * doctrine from whether the state governs well and its people agree with it:
 *
 *   force = manpower x equipment x doctrine
 *
 * so nothing about it can drift out of step with the rest of the model, and a
 * nation that is falling apart gets weaker at exactly the moment it needs the
 * army — which is the honest direction for that feedback to run.
 *
 * WHAT IS STATE is the allocation and the READINESS, because those are the parts
 * with memory. Readiness follows the allocation the way a power stock follows
 * its target: rate-limited, so switching everything to Field the turn before you
 * invade buys you nothing, and a standing posture is worth more than a reaction.
 * That rate limit is the entire cost of changing your mind, and without it the
 * allocation is three sliders that may as well be set at the moment of use.
 *
 * AND IT COSTS MONEY EVERY TURN. An army you keep is an army you pay for; that
 * is what makes "how much force" a question at all rather than "as much as
 * possible".
 */
const Military = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));
  const saturate = (x, k) => (x > 0 && k > 0 ? x / (x + k) : 0);

  const ROLES = ['garrison', 'border', 'field'];

  /** An even split, which is what a nation that has never been told begins with. */
  const evenSplit = () => ({ garrison: 1 / 3, border: 1 / 3, field: 1 / 3 });

  /** Normalise any three numbers into shares that sum to 1. */
  function normalise(alloc) {
    const out = {};
    let total = 0;
    for (const r of ROLES) { out[r] = Math.max(0, Number(alloc && alloc[r]) || 0); total += out[r]; }
    if (total <= 0) return evenSplit();
    for (const r of ROLES) out[r] /= total;
    return out;
  }

  /** The record a nation carries, created on demand so old saves just work. */
  function state(nid) {
    const n = Game.getNation(nid);
    if (!n) return null;
    if (!n.mil) n.mil = { alloc: evenSplit(), ready: evenSplit() };
    if (!n.mil.alloc) n.mil.alloc = evenSplit();
    if (!n.mil.ready) n.mil.ready = { ...n.mil.alloc };
    return n.mil;
  }

  /* ------------------------------------------------------------------ */
  /* how much force there is                                            */
  /* ------------------------------------------------------------------ */

  /**
   * What this nation can bring to bear, and why — a Why record like everything
   * else, so the panel and the AI read the same three numbers.
   *
   * @returns {{value, manpower, equipment, doctrine, inputs, summary}}
   */
  function force(nid, tune) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n) return null;
    const d = Game.nationDemographics(nid);
    const perCapita = d.pop > 0 ? d.gdp / d.pop : 0;

    const manpower = d.pop * t.get('mil.manpowerShare');
    /*
     * Equipment saturates rather than scaling: the difference between a poor
     * nation and a middling one is most of the story, and the difference between
     * a rich one and a very rich one is very little of it. A linear term would
     * make California's army twelve times Wyoming's before a single soldier is
     * counted.
     */
    const equipment = saturate(perCapita, t.get('mil.equipmentHalf'));
    /*
     * Doctrine: whether the state can actually get its people to fight for it.
     * Authority is the machinery and alignment is the willingness, and a nation
     * with neither still fields SOMETHING, hence the floor.
     */
    const align = d.cohesion == null ? 0.5 : d.cohesion;
    const doctrine = t.get('mil.doctrineFloor')
      + (1 - t.get('mil.doctrineFloor'))
        * clamp01(t.get('mil.wAuthority') * (n.authority || 0) + t.get('mil.wCohesion') * align);

    const value = manpower * equipment * doctrine;
    return {
      value, manpower, equipment, doctrine,
      inputs: [
        { label: 'Manpower', raw: manpower, key: 'mil.manpowerShare',
          note: `${Math.round(manpower / 1000)}k under arms` },
        { label: 'Equipment', raw: equipment, key: 'mil.equipmentHalf',
          note: 'what the economy can put in their hands' },
        { label: 'Doctrine', raw: doctrine, key: 'mil.wAuthority',
          note: 'whether the state can get them to fight for it' },
      ],
      summary: `${Math.round(manpower / 1000)}k troops at ${Math.round(equipment * 100)}% equipment `
        + `and ${Math.round(doctrine * 100)}% doctrine`,
    };
  }

  /** What one posture is actually worth right now: force x share x readiness. */
  function strength(nid, role, tune) {
    const s = state(nid);
    const f = force(nid, tune);
    if (!s || !f) return 0;
    return f.value * (s.alloc[role] || 0) * (s.ready[role] || 0);
  }

  /** Everything a caller wants about one nation's posture, in one call. */
  function posture(nid, tune) {
    const s = state(nid);
    const f = force(nid, tune);
    if (!s || !f) return null;
    const out = { force: f, alloc: { ...s.alloc }, ready: { ...s.ready }, strength: {} };
    for (const r of ROLES) out.strength[r] = f.value * s.alloc[r] * s.ready[r];
    out.upkeep = upkeep(nid, tune);
    return out;
  }

  /**
   * The bill, every turn, for whatever is standing.
   *
   * Charged on FORCE rather than on the allocation, because the allocation is
   * where an army points and not how big it is — you do not save money by
   * pointing it somewhere else. This is what makes "how much force" a question
   * rather than "as much as possible".
   */
  function upkeep(nid, tune) {
    const t = tune || window.TUNE;
    const f = force(nid, t);
    return f ? f.value * t.get('mil.upkeepPerHead') : 0;
  }

  /* ------------------------------------------------------------------ */
  /* changing your mind                                                 */
  /* ------------------------------------------------------------------ */

  /** Point the army somewhere. Readiness follows on its own, slowly. */
  function allocate(nid, alloc) {
    const s = state(nid);
    if (!s) return null;
    s.alloc = normalise(alloc);
    return { ...s.alloc };
  }

  /**
   * Readiness steps toward the allocation, rate-limited in both directions.
   *
   * The rate limit IS the cost of changing your mind. Without it the allocation
   * is three sliders you set at the moment of use — everything to Field on the
   * turn you invade, everything to Garrison on the turn a movement crosses the
   * line — and a decision you can always take later is not a decision.
   *
   * Falling is faster than rising, because an army stood down is stood down
   * immediately and an army worked up takes seasons.
   */
  function tick(tune) {
    const t = tune || window.TUNE;
    const rise = t.get('mil.readyRise');
    const fall = t.get('mil.readyFall');
    for (const [nid] of Game.nations) {
      const s = state(nid);
      if (!s) continue;
      for (const r of ROLES) {
        const want = s.alloc[r], have = s.ready[r];
        const gap = want - have;
        s.ready[r] = clamp01(have + (gap > 0 ? Math.min(gap, rise) : Math.max(gap, -fall)));
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* what the force does                                                */
  /* ------------------------------------------------------------------ */

  /**
   * How hard this nation is holding its own ground down, 0..1.
   *
   * Per Area, because a garrison spread over sixty Areas is not the garrison of
   * a nation with four — that is exactly the difference between an occupier who
   * can hold a province and one who is stretched across a continent, and it is
   * the term that stops a large empire suppressing everything at once.
   */
  function garrisonPressure(nid, tune) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n || !n.counties.size) return 0;
    const f = force(nid, t);
    if (!f) return 0;
    /*
     * ONLY WHAT YOU POINT INWARD DELIBERATELY.
     *
     * A peacetime army holds nobody down, and `mil.garrisonFree` is exactly the
     * share of force the default even split leaves at home — so a nation that
     * has made no military decision suppresses nothing at all. Without the
     * subtraction every nation on the map quietly held its own population down
     * from turn zero, which moved the secession timeline for a world in which
     * nobody had chosen anything.
     */
    const free = f.value * t.get('mil.garrisonFree');
    const per = Math.max(0, strength(nid, 'garrison', t) - free) / n.counties.size;
    return saturate(per, t.get('mil.garrisonHalf'));
  }

  /**
   * The war multiplier for an attack: below 1 when the attacker's Field beats
   * the defenders' Border, above 1 when it does not.
   *
   * It multiplies the civil-war SCORE, where low is a win for the attacker — so
   * a prepared army makes the same annexation go better, and an unprepared one
   * makes it go worse. The shape is a share rather than a ratio so it cannot
   * blow up when a defender has nothing at all.
   */
  function warMultiplier(attacker, defenders, tune) {
    const t = tune || window.TUNE;
    const mine = strength(attacker, 'field', t);
    let theirs = 0;
    const counted = new Set(defenders || []);
    for (const d of counted) theirs += strength(d, 'border', t);
    /*
     * AND EVERYBODY ELSE WHO HAS LINED UP AGAINST YOU (M7.2).
     *
     * A coalition is not a treaty that has to be invoked; it is the fact that
     * three of your neighbours have their armies pointed at you, and they are
     * pointed at you whether or not today's victim is one of them. Counted at a
     * discount, because they are not the ones being attacked and their border
     * force is spread across a frontier rather than concentrated on this one.
     *
     * This is what "gets ganged up on" means mechanically, and it is the reason
     * the coalition is a set of NAMED nations rather than a rank: the discount
     * is applied to specific armies belonging to specific countries with
     * specific grievances.
     */
    /*
     * ...and who is in charge (M7.5). Smaller than the force ratio and smaller
     * than the coalition, deliberately: a Hawk should matter less than whether
     * the army is ready and whether the neighbours have lined up.
     */
    let leaderMult = 1;
    if (typeof Leaders !== 'undefined' && Leaders.loaded()) {
      leaderMult = 1 - t.get('leader.warSwing') * Leaders.modifier(attacker, 'war') * -1;
    }
    if (typeof Coalitions !== 'undefined') {
      const rec = Coalitions.against(attacker, t);
      if (rec && rec.formed) {
        const share = t.get('coalition.warShare');
        for (const m of rec.members) {
          if (counted.has(m.nid)) continue;
          theirs += strength(m.nid, 'border', t) * share;
        }
      }
    }
    const total = mine + theirs;
    // Nobody has anything: no advantage either way, rather than a divide by zero.
    const share = total > 0 ? mine / total : 0.5;
    return (1 + t.get('mil.warSwing') * (0.5 - share) * 2) * leaderMult;
  }

  /* ------------------------------------------------------------------ */
  /* state                                                              */
  /* ------------------------------------------------------------------ */

  const serialize = () => {
    const out = {};
    for (const [nid] of Game.nations) {
      const s = state(nid);
      if (s) out[nid] = { alloc: { ...s.alloc }, ready: { ...s.ready } };
    }
    return out;
  };

  function loadState(snap) {
    for (const [nid, rec] of Object.entries(snap || {})) {
      const n = Game.getNation(nid);
      if (!n) continue;
      /*
       * The allocation is a distribution and READINESS IS NOT. Each role's
       * readiness is an independent 0..1 that chases its own share, and the
       * three only sum to 1 while nothing has changed — normalising them on load
       * quietly rewrote every posture that was mid-transition, which is exactly
       * the state a save is most likely to be taken in.
       */
      const ready = {};
      for (const r of ROLES) ready[r] = clamp01(Number(rec.ready && rec.ready[r]) || 0);
      n.mil = { alloc: normalise(rec.alloc), ready };
    }
  }

  return {
    ROLES, evenSplit, normalise, state, force, strength, posture, upkeep,
    allocate, tick, garrisonPressure, warMultiplier, serialize, loadState,
  };
})();
