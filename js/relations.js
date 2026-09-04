/*
 * What nations remember about each other.
 *
 * ONE APPEND-ONLY LIST, and everything else falls out of it:
 *
 *   { turn, from, to, kind, magnitude }
 *   relation(a, b) = base + Σ magnitude · decay^(now - turn)
 *
 * Memory, rivalry, gratitude, "they annexed us three turns ago", the coalition
 * trigger, whether a neighbour will accept ground you are trying to hand over —
 * all of it is a query over the same list. Before M7.1 there was no inter-nation
 * state of any kind, and the save format had nowhere to put one; the alternative
 * to this is a scalar per pair per feeling, which is a matrix that grows with
 * every emotion anybody thinks of and cannot answer "why".
 *
 * DIRECTED, not symmetric. `between(a, b)` is how A feels about B, and the two
 * directions are genuinely different: a conqueror is not resented by the ground
 * it took in the same way it resents the neighbour who stopped it. Making it
 * symmetric would be one line less code and would delete the rivalry.
 *
 * DECAYING, not forgotten. `rel.decay` per turn, so an annexation is most of a
 * grievance the year it happens and background noise a decade later — which is
 * what makes "recently" mean something without anybody storing a window.
 * Entries whose decayed weight falls under `rel.forget` are dropped, so a long
 * game's list stays small enough to live in the save document.
 *
 * IT IS A WHY RECORD, like every other explained number here. `between` returns
 * the entries that made it, so "why will Nevada not take these Areas" is
 * answerable, and so is "why is Texas about to be ganged up on" when M7.2 reads
 * the same list.
 */
const Relations = (function () {
  let entries = [];
  let seq = 0;

  /*
   * ONE SOURCE OF TRUTH, ONE CACHE, AND AN EPOCH.
   *
   * The list is the truth — it is what the save carries and what a Why record
   * reads — but `score(a, b)` is called for every pair the AI considers on every
   * candidate move, and walking a list that grows all game is quadratic in the
   * wrong things. Measured at turn 20 of a played game: 483 entries turned a
   * 244 ms round into a 690 ms one, and the list only gets longer.
   *
   * So a `from|to -> entries` index, rebuilt whenever the list changes. Keyed on
   * BOTH `seq` and the length, because `record` moves the first and `forget`
   * moves only the second — a cache keyed on one of them is a cache that is
   * silently stale exactly after a prune.
   */
  let index = null, indexSeq = -1, indexLen = -1;
  const pairKey = (a, b) => `${a}|${b}`;

  function pairs() {
    if (index && indexSeq === seq && indexLen === entries.length) return index;
    index = new Map();
    for (const e of entries) {
      const k = pairKey(e.from, e.to);
      const row = index.get(k);
      if (row) row.push(e); else index.set(k, [e]);
    }
    indexSeq = seq;
    indexLen = entries.length;
    return index;
  }

  /**
   * The vocabulary. Closed, like the ledger's, so a consumer can switch on it
   * exhaustively and a typo becomes a missing entry rather than a silent new
   * category nobody weighs.
   */
  const KINDS = {
    annexed: 'rel.magAnnexed',     // they took ground from us
    warred: 'rel.magWarred',       // ...and it came to a civil war
    witnessed: 'rel.magWitnessed', // we watched them take somebody else's
    absorbed: 'rel.magAbsorbed',   // they swallowed a nation whole
    broke: 'rel.magBroke',         // their bid to unite us failed and cost us Areas
    granted: 'rel.magGranted',     // they handed us ground
    traded: 'rel.magTraded',       // we did business
    seceded: 'rel.magSeceded',     // we broke away from them
    lost: 'rel.magLost',           // they broke away from us
    recognised: 'rel.magRecognised', // they admitted we are a country
    betrayed: 'rel.magBetrayed',   // they admitted our rebels are a country
    // M11.2 — the two things a nation can now do FOR another rather than TO it,
    // and the one it can do to a promise.
    treatied: 'rel.magTreatied',   // we signed something together
    aided: 'rel.magAided',         // they paid for something of ours
    reneged: 'rel.magReneged',     // they broke a pact they had signed with us
  };

  const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

  /**
   * Remember something.
   *
   * `scale` multiplies the kind's tuned magnitude — five Areas taken is worse
   * than one — and is clamped, because the point of a magnitude is that a big
   * event is bigger and not that a big enough event is unforgivable forever.
   *
   * @returns the entry, or null if there is nothing to remember.
   */
  function record(from, to, kind, opts = {}) {
    if (!from || !to || from === to) return null;
    const key = KINDS[kind];
    if (!key) return null;
    const t = opts.tune || window.TUNE;
    const scale = clamp(opts.scale == null ? 1 : opts.scale, 0, t.get('rel.maxScale'));
    if (scale <= 0) return null;
    const entry = {
      id: ++seq,
      turn: opts.turn == null ? World.getTurn() : opts.turn,
      from, to, kind,
      magnitude: t.get(key) * scale,
      note: opts.note || null,
    };
    entries.push(entry);
    return entry;
  }

  /** Everything one nation remembers about another, with the working. */
  function between(a, b, tune) {
    const t = tune || window.TUNE;
    const decay = t.get('rel.decay');
    const now = World.getTurn();
    const inputs = [];
    let value = t.get('rel.base');
    for (const e of pairs().get(pairKey(a, b)) || []) {
      const age = Math.max(0, now - e.turn);
      const weight = e.magnitude * Math.pow(decay, age);
      if (Math.abs(weight) < 1e-9) continue;
      value += weight;
      inputs.push({ label: labelOf(e), raw: e.magnitude, age, contribution: weight,
                    key: KINDS[e.kind], kind: e.kind, turn: e.turn, note: e.note });
    }
    value = clamp(value, -1, 1);
    inputs.sort((x, y) => Math.abs(y.contribution) - Math.abs(x.contribution));
    return { value, inputs, summary: summarise(value, inputs) };
  }

  /** The scalar alone, for the hot paths that do not want the working. */
  function score(a, b, tune) {
    const row = pairs().get(pairKey(a, b));
    const t = tune || window.TUNE;
    let value = t.get('rel.base');
    if (!row) return clamp(value, -1, 1);
    const decay = t.get('rel.decay');
    const now = World.getTurn();
    for (const e of row) value += e.magnitude * Math.pow(decay, Math.max(0, now - e.turn));
    return clamp(value, -1, 1);
  }

  const LABELS = {
    annexed: 'took our ground', warred: 'fought us for it', witnessed: 'took somebody else\'s',
    absorbed: 'swallowed a nation whole', broke: 'their bid to unite us fell apart',
    granted: 'handed us ground', traded: 'did business with us',
    seceded: 'we broke away from them', lost: 'they walked out on us',
    recognised: 'recognised us', betrayed: 'recognised our breakaway',
    treatied: 'signed a pact with us', aided: 'paid for something of ours',
    reneged: 'tore up a pact they had signed with us',
  };
  const labelOf = (e) => LABELS[e.kind] || e.kind;

  function summarise(value, inputs) {
    const band = value >= 0.5 ? 'Close' : value >= 0.15 ? 'Warm'
      : value > -0.15 ? 'Indifferent' : value > -0.5 ? 'Cold' : 'Hostile';
    if (!inputs.length) return `${band}: nothing has happened between them.`;
    const top = inputs[0];
    return `${band}: ${top.label}${top.age ? `, ${top.age} ${top.age === 1 ? 'turn' : 'turns'} ago` : ' this turn'}.`;
  }

  /** How everyone else sees this nation, worst first. The coalition's raw material. */
  function toward(nid, tune) {
    const rows = [];
    for (const [other] of Game.nations) {
      if (other === nid) continue;
      rows.push({ nid: other, name: Game.getNation(other).name, value: score(other, nid, tune) });
    }
    rows.sort((a, b) => a.value - b.value);
    return rows;
  }

  /**
   * Drop what nobody can feel any more.
   *
   * Run once a turn. Without it a long game accumulates one entry per action per
   * nation forever, and the save document — which the ledger already makes the
   * largest thing in the game — grows without bound for entries contributing
   * less than a thousandth of a relation.
   */
  function forget(tune) {
    const t = tune || window.TUNE;
    const decay = t.get('rel.decay');
    const floor = t.get('rel.forget');
    const now = World.getTurn();
    const before = entries.length;
    entries = entries.filter((e) => {
      if (!Game.nations.has(e.from) || !Game.nations.has(e.to)) return false;
      return Math.abs(e.magnitude) * Math.pow(decay, Math.max(0, now - e.turn)) >= floor;
    });
    return before - entries.length;
  }

  function reset() { entries = []; seq = 0; index = null; indexSeq = -1; indexLen = -1; }

  const all = () => entries;
  const count = () => entries.length;

  const serialize = () => ({ seq, entries: entries.map((e) => ({ ...e })) });
  function loadState(snap) {
    if (!snap) { reset(); return; }
    entries = Array.isArray(snap.entries) ? snap.entries.map((e) => ({ ...e })) : [];
    seq = snap.seq || entries.length;
    index = null; indexSeq = -1; indexLen = -1;
  }

  return { KINDS, record, between, score, toward, forget, reset, all, count, serialize, loadState };
})();
