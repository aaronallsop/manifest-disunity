/*
 * Who is actually in charge, and what they are like.
 *
 * A leader is a NAME, TWO TRAITS AND A DATE, and that is the whole system. The
 * review calls this the least blocked idea in the analysis and it is right: the
 * five power stocks already explain themselves term by term, so a leader is one
 * extra named line in each stock they touch rather than a mechanism of their own.
 *
 * WHY IT IS WORTH HAVING ANYWAY. Everything else in this game is a number about
 * a place. A nation with a Hardliner and a nation with a Reformer play
 * differently, read differently in the newspaper, and — this is the part that
 * matters — give the player a reason to care that the government of Nevada
 * changed. Before this, "Nevada changed course" was a line about an ideology
 * index.
 *
 * TRAITS ARE DRAWN AGAINST THE IDEOLOGY, not uniformly. A Distributist state is
 * likelier to be led by a Steward than by a Financier, and a leader whose traits
 * fight their own government is possible but rare — which is a more interesting
 * distribution than either "always on-brand" or "coin flip".
 *
 * A LEADER CHANGES when the government does, and when their term runs out. The
 * second is a placeholder for elections (M7.8), and deliberately a plain one:
 * the interesting version is a nation losing a government it wanted to keep, and
 * that needs a vote rather than a timer.
 */
const Leaders = (function () {
  let defs = null;
  /** nation id -> { name, title, traits: [id], since } */
  let seats = {};

  function load(doc) {
    if (!doc || !Array.isArray(doc.traits) || !doc.traits.length) return 0;
    defs = doc;
    return doc.traits.length;
  }

  const loaded = () => !!defs;
  const traitOf = (id) => (defs ? defs.traits.find((t) => t.id === id) : null);

  /* ------------------------------------------------------------------ */
  /* choosing one                                                       */
  /* ------------------------------------------------------------------ */

  /**
   * A leader for this nation, drawn from the seeded rng.
   *
   * Two traits, the second never the same as the first. Weighted toward the
   * government's ideology by `leader.affinityWeight` — a nation usually gets a
   * leader who fits it, and occasionally does not, which is the more interesting
   * distribution.
   */
  function make(nid, rng, tune) {
    const t = tune || window.TUNE;
    const n = Game.getNation(nid);
    if (!n || !defs) return null;
    const stream = rng ? rng.stream('leaders') : null;
    const pick = (arr) => (stream ? arr[stream.int(arr.length)] : arr[0]);
    const ideology = n.gov ? n.gov.rulingIdeology : null;

    const draw = (exclude) => {
      const pool = defs.traits.filter((tr) => tr.id !== exclude);
      let total = 0;
      for (const tr of pool) total += (tr.affinity || []).includes(ideology)
        ? t.get('leader.affinityWeight') : 1;
      let roll = (stream ? stream.random() : 0) * total;
      for (const tr of pool) {
        roll -= (tr.affinity || []).includes(ideology) ? t.get('leader.affinityWeight') : 1;
        if (roll <= 0) return tr.id;
      }
      return pool[pool.length - 1].id;
    };

    const first = draw(null);
    const second = draw(first);
    return {
      name: `${pick(defs.first)} ${pick(defs.last)}`,
      title: (defs.titles && defs.titles[ideology]) || 'Governor',
      traits: [first, second],
      since: World.getTurn(),
    };
  }

  /** The leader of this nation, appointing one if the seat is empty. */
  function of(nid, rng, tune) {
    if (!defs) return null;
    if (!Game.getNation(nid)) return null;
    if (!seats[nid]) {
      const made = make(nid, rng, tune);
      if (made) seats[nid] = made;
    }
    return seats[nid] || null;
  }

  /** Put somebody new in the chair, and say why. */
  function replace(nid, rng, tune, reason) {
    if (!defs || !Game.getNation(nid)) return null;
    const was = seats[nid];
    const now = make(nid, rng, tune);
    if (!now) return null;
    seats[nid] = now;
    Ledger.append({
      phase: 'roster', subject: nid, kind: 'leader', delta: 0,
      text: `${Game.getNation(nid).name}: ${now.title} ${now.name} takes office`
        + `${was ? `, replacing ${was.name}` : ''} — ${describe(now)}.`,
      leader: now.name, traits: now.traits, reason: reason || 'succession',
    });
    return now;
  }

  const describe = (l) => (l && l.traits || []).map((id) => {
    const tr = traitOf(id);
    return tr ? tr.name.toLowerCase() : id;
  }).join(', ');

  /** The blurbs, for a panel that wants to say who this person is. */
  const traits = (nid) => {
    const l = seats[nid];
    return l ? l.traits.map(traitOf).filter(Boolean) : [];
  };

  /* ------------------------------------------------------------------ */
  /* what they change                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * This leader's pull on one quantity, roughly -1..1.
   *
   * Read by the five power stocks and by the war roll. Summed across both
   * traits, so a Hawk who is also a Veteran is more of a soldier than either
   * alone — and a Hawk who is also a Reformer largely cancels, which is a real
   * kind of government.
   */
  function modifier(nid, key) {
    const l = seats[nid];
    if (!l || !defs) return 0;
    let v = 0;
    for (const id of l.traits) {
      const tr = traitOf(id);
      if (tr && tr.effects && tr.effects[key]) v += tr.effects[key];
    }
    return v;
  }

  /* ------------------------------------------------------------------ */
  /* the clock                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * Once a turn: seat anybody missing, and retire anybody whose term is up.
   *
   * The term limit is a placeholder for elections (M7.8) and deliberately a
   * plain one — the interesting version is a nation losing a government it
   * wanted to keep, and that needs a vote rather than a timer.
   */
  function tick(tune, rng) {
    if (!defs) return { seated: 0, replaced: 0 };
    const t = tune || window.TUNE;
    const term = t.get('leader.termTurns');
    let seated = 0, replaced = 0;
    for (const [nid] of Game.nations) {
      if (!seats[nid]) { if (of(nid, rng, t)) seated++; continue; }
      if (term > 0 && World.getTurn() - seats[nid].since >= term) {
        replace(nid, rng, t, 'term');
        replaced++;
      }
    }
    // A seat belonging to a nation that no longer exists is not a seat.
    for (const nid of Object.keys(seats)) if (!Game.nations.has(nid)) delete seats[nid];
    return { seated, replaced };
  }

  function reset() { seats = {}; }
  const all = () => seats;

  const serialize = () => JSON.parse(JSON.stringify(seats));
  function loadState(snap) { seats = snap ? JSON.parse(JSON.stringify(snap)) : {}; }

  return {
    load, loaded, of, make, replace, traits, traitOf, describe, modifier, tick,
    reset, all, serialize, loadState,
  };
})();
