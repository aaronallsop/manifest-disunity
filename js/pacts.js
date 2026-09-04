/*
 * TREATIES AND AID (M11.2) — the two Influence verbs the design list reserved.
 *
 * The audit's finding: "two of three victory paths lack active verbs.
 * Ideological Dominance is govern-well-and-wait." Both halves of the fix are
 * here, because they are the same idea seen twice — a nation spending something
 * it has on a relationship it wants.
 *
 * A TREATY is a standing object, and that is the whole point of it. Every other
 * diplomatic fact in this game is an EVENT that decays: `Relations.record`
 * writes a memory, the memory fades, and nothing is ever promised. A pact is a
 * promise, so it sits on the board until somebody breaks it — and breaking it
 * is worth more than never having signed, because the world remembers a
 * betrayal differently from an absence.
 *
 *   nonaggression   neither may annex from the other. Broken by taking their
 *                   ground, and the breach is what the ledger records.
 *   compact         a standing trade understanding: both sides' deals with each
 *                   other skip the cooldown. Broken by refusing to recognise.
 *
 * AID is a treasury transfer, and what it buys is three things at once:
 * standing (an `aided` memory, in one direction only — gratitude is not
 * symmetric), a better chance of being recognised, and a PATRON relationship
 * that makes the recipient's politics drift toward the donor's.
 *
 * THAT LAST ONE IS THE POINT. Ideological Dominance asks for a share of the
 * continent holding your ideology, and until now the only lever on that number
 * was governing well and waiting for the drift to come to you. Aid is a lever:
 * a patron's ideology is blended into the recipient's own government lean in
 * `phasePoliticalDrift`, weighted by how recently and how much they were paid,
 * decaying every turn they are not. Buying a country's politics is slow,
 * expensive and reversible, which is the correct shape for it.
 *
 * WHY THE BLEND RATHER THAN A NEW TERM. The drift target is a weighted average
 * of owner, anchor and neighbours whose weights sum to one. Adding a fourth
 * term means renormalising three tuned constants, and every measurement in
 * DECISIONS.md that rests on them. Blending the patron INTO the owner's lean
 * changes what "the government's politics" means for that nation and nothing
 * else — which is also the more honest description of what a client state is.
 */
const Pacts = (function () {
  /*
   * Pacts are keyed on an ORDERED pair id so `live(a,b)` and `live(b,a)` are one
   * lookup. A treaty is symmetric; the ledger entries about it are not.
   */
  const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  let pacts = new Map();     // key -> {a, b, kind, since}
  let breaches = [];         // {turn, by, against, kind} — append-only, decays out
  let patrons = new Map();   // recipient nid -> {nid: donor, weight}

  const KINDS = ['nonaggression', 'compact'];
  const LABEL = { nonaggression: 'non-aggression pact', compact: 'trade compact' };

  function reset() {
    pacts = new Map();
    breaches = [];
    patrons = new Map();
  }

  /* ---- treaties ---------------------------------------------------- */

  /** The live pact between two nations, or null. */
  function live(a, b) {
    return pacts.get(key(a, b)) || null;
  }

  /** Every pact `nid` is party to. */
  function forNation(nid) {
    const out = [];
    for (const p of pacts.values()) if (p.a === nid || p.b === nid) out.push(p);
    return out;
  }

  /** The other party, from one side's point of view. */
  const other = (p, nid) => (p.a === nid ? p.b : p.a);

  function sign(a, b, kind) {
    if (a === b || !KINDS.includes(kind)) return null;
    const p = { a, b, kind, since: World.getTurn() };
    pacts.set(key(a, b), p);
    return p;
  }

  /**
   * Break one, from `by`'s side.
   *
   * Called from the resolver of whatever broke it rather than checked for
   * afterwards, because "who broke this and by doing what" is knowable only
   * where it happened — the same reason `recordBirths` runs before the ground
   * moves.
   */
  function breach(by, against) {
    const p = live(by, against);
    if (!p) return null;
    pacts.delete(key(by, against));
    breaches.push({ turn: World.getTurn(), by, against, kind: p.kind });
    return p;
  }

  /** Breaches by this nation still inside the memory window. */
  function breachesBy(nid, tune) {
    const t = tune || window.TUNE;
    const w = t.get('nation.historyWindow');
    const now = World.getTurn();
    return breaches.filter((x) => x.by === nid && now - x.turn <= w);
  }

  /**
   * The standing a nation's treaty record is worth, for the Influence term.
   *
   * Pacts held MINUS breaches, and a breach is deliberately worth more than a
   * pact: signing is cheap and a signature nobody keeps is worth nothing, so
   * the number has to be able to go negative or a serial betrayer could out-sign
   * their reputation. `power.influence.breachWeight` is that asymmetry.
   */
  function standing(nid, tune) {
    const t = tune || window.TUNE;
    const held = forNation(nid).length;
    const broke = breachesBy(nid, t).length;
    return held - broke * t.get('power.influence.breachWeight');
  }

  /* ---- aid --------------------------------------------------------- */

  /**
   * Record a payment. `share` is the donation as a share of the recipient's
   * annual income, which is what decides how much of a client they become —
   * the same money buys far more of a small country than of a large one.
   */
  function pay(donor, recipient, share, tune) {
    const t = tune || window.TUNE;
    const cap = t.get('aid.patronMax');
    const cur = patrons.get(recipient);
    const add = Math.min(cap, Math.max(0, share) * t.get('aid.patronGain'));
    /*
     * ONE PATRON AT A TIME, and the newcomer has to outbid the incumbent. A
     * recipient with two benefactors pulled in two directions would average to
     * nothing, which is a quieter answer than the model deserves: a client state
     * is somebody's client.
     */
    if (!cur || cur.nid === donor) {
      patrons.set(recipient, { nid: donor, weight: Math.min(cap, (cur ? cur.weight : 0) + add) });
    } else if (add > cur.weight) {
      patrons.set(recipient, { nid: donor, weight: add - cur.weight });
    } else {
      patrons.set(recipient, { nid: cur.nid, weight: cur.weight - add });
    }
    return patrons.get(recipient);
  }

  /** Who is funding this nation, and how strongly. Null if nobody. */
  const patronOf = (nid) => patrons.get(nid) || null;

  /** Every nation this one is currently patron to. */
  function clientsOf(nid) {
    const out = [];
    for (const [rec, p] of patrons) if (p.nid === nid) out.push({ nid: rec, weight: p.weight });
    return out;
  }

  /**
   * One turn of forgetting. Gratitude is not permanent and neither is influence
   * bought with money: a patron who stops paying stops being one.
   */
  function tick(tune) {
    const t = tune || window.TUNE;
    const decay = t.get('aid.patronDecay');
    for (const [rec, p] of [...patrons]) {
      const w = p.weight * (1 - decay);
      if (w < 0.005) patrons.delete(rec);
      else patrons.set(rec, { nid: p.nid, weight: w });
    }
    // ...and a pact whose other party no longer exists is not a pact.
    for (const [k, p] of [...pacts]) {
      if (!Game.getNation(p.a) || !Game.getNation(p.b)) pacts.delete(k);
    }
    const w = t.get('nation.historyWindow');
    const now = World.getTurn();
    breaches = breaches.filter((x) => now - x.turn <= w * 2);
  }

  /* ---- state ------------------------------------------------------- */

  const serialize = () => ({
    pacts: [...pacts.values()].map((p) => ({ ...p })),
    breaches: breaches.map((b) => ({ ...b })),
    patrons: [...patrons].map(([rec, p]) => ({ rec, nid: p.nid, weight: p.weight })),
  });

  function loadState(snap) {
    reset();
    if (!snap) return;
    for (const p of snap.pacts || []) pacts.set(key(p.a, p.b), { ...p });
    breaches = (snap.breaches || []).map((b) => ({ ...b }));
    for (const r of snap.patrons || []) patrons.set(r.rec, { nid: r.nid, weight: r.weight });
  }

  return {
    KINDS, LABEL, live, forNation, other, sign, breach, breachesBy, standing,
    pay, patronOf, clientsOf, tick, reset, serialize, loadState,
    count: () => pacts.size,
  };
})();
