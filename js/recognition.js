/*
 * Whether the rest of the continent admits that you exist.
 *
 * ONE SCALAR AND ONE MATRIX, which is the whole system:
 *
 *   recognises(A, B)  — a directed fact, stored only where it is not the default
 *   legitimacy(B)     — the share of the continent, by weight, that recognises B
 *
 * WHAT IT IS FOR. Until M7.8 a nation born on turn 14 was, the instant it
 * existed, a peer of the fifty states it broke out of: it could sign a trade
 * deal with anybody, join a coalition, and carry the same standing into every
 * calculation. That is the one thing secession is not. A new state's first
 * problem is not its army or its treasury, it is that the world will not deal
 * with it — and giving that problem a number turns the moment after a
 * declaration from a formality into the hardest stretch of a breakaway's life.
 *
 * THE DEFAULT IS THE STORAGE TRICK. The fifty-one nations the game opens with
 * are recognised by everybody, always, and nothing is written down for them;
 * `origin` already says who they are. Only a nation founded during play needs a
 * row, and it starts with none — so the matrix is empty on turn 0, holds a
 * handful of sets in a normal game, and never grows to n^2.
 *
 * RECOGNITION IS EARNED, NOT GRANTED BY THE CLOCK. Every turn, each nation that
 * does not yet recognise a newcomer decides whether to, and the decision is a
 * Why record like everything else here: standing, kinship, how long the thing
 * has lasted, how big it is, and — the big one — whether the state it broke away
 * from has given in yet. A parent that will not acknowledge its breakaway keeps
 * the whole continent hesitant, which is exactly the leverage a parent should
 * have and the reason the player's own recognition is a move worth having.
 *
 * WHAT IT COSTS TO BE A PARIAH: no bilateral trade with anyone who does not
 * recognise you, a smuggler's price on the world market, no seat in a coalition,
 * and a signed penalty on Influence. All four are the same fact seen from
 * different rooms, and none of them is permanent.
 */
const Recognition = (function () {
  /* to -> Set(from). Only ever holds nations founded during play. */
  let granted = new Map();
  /* nid -> {parent, turn}: who they broke away from, where that is known. */
  let origins = new Map();
  let seq = 0; // bumped on every write, so the cache below can be keyed on it

  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));
  const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);
  const nameOf = (nid) => { const n = Game.getNation(nid); return n ? n.name : nid; };

  function reset() { granted = new Map(); origins = new Map(); seq++; cache = null; }

  /**
   * Record how a nation came into being.
   *
   * `parent` is the state it left, and it matters twice: the parent's own
   * recognition unlocks everybody else's, and a nation that was RELEASED rather
   * than lost is recognised by its parent from the first day — which is the
   * cleanest difference between the two moves the game has. Letting go is worth
   * something to the ground you let go of.
   */
  function founded(nid, parent, opts = {}) {
    if (!nid) return null;
    const rec = { parent: parent || null, turn: opts.turn == null ? World.getTurn() : opts.turn };
    origins.set(nid, rec);
    seq++;
    if (parent && opts.recognised) grant(parent, nid, { silent: true, tune: opts.tune });
    return rec;
  }

  const parentOf = (nid) => { const o = origins.get(nid); return o ? o.parent : null; };
  const bornOn = (nid) => {
    const o = origins.get(nid);
    if (o) return o.turn;
    const n = Game.getNation(nid);
    return n && n.founded != null ? n.founded : 0;
  };

  /** Does `from` accept that `to` is a country? */
  function recognises(from, to) {
    if (!from || !to || from === to) return true;
    const n = Game.getNation(to);
    if (!n) return false;
    if (n.origin) return true; // the states the game opened with need no vouching
    const set = granted.get(to);
    return !!(set && set.has(from));
  }

  /**
   * `from` recognises `to`, and the continent remembers both halves of it.
   *
   * The newcomer is grateful; the state it broke away from takes it as a
   * betrayal, which is why recognition is a decision rather than a courtesy.
   * Both go through the existing relations vocabulary — a second feelings table
   * that could disagree with the first is the thing M7.1 exists to prevent.
   */
  function grant(from, to, opts = {}) {
    if (!from || !to || from === to) return false;
    if (recognises(from, to)) return false;
    const set = granted.get(to) || new Set();
    set.add(from);
    granted.set(to, set);
    seq++;
    const t = opts.tune || window.TUNE;
    if (typeof Relations !== 'undefined' && !opts.silent) {
      Relations.record(to, from, 'recognised', { tune: t });
      const p = parentOf(to);
      if (p && p !== from && Game.getNation(p) && !recognises(p, to)) {
        Relations.record(p, from, 'betrayed', { tune: t });
      }
    }
    return true;
  }

  /* ------------------------------------------------------------------ */
  /* the scalar                                                          */
  /* ------------------------------------------------------------------ */

  /*
   * A PER-TURN SNAPSHOT, for the same reason the coalition survey is one: the
   * legitimacy of every nation is read by Influence for every nation on every
   * turn, by the trade screens on every render, and by the coalition survey on
   * every annexation the AI previews. Keyed on the ownership epoch (weights move
   * when ground does), the turn, and the write counter — a recognition granted
   * mid-turn has to be visible in the same turn it was granted, or the button
   * the player just pressed appears to have done nothing.
   */
  let cache = null;

  function snapshot() {
    const epoch = Game.ownerEpoch();
    const turn = World.getTurn();
    if (cache && cache.epoch === epoch && cache.turn === turn && cache.seq === seq) return cache;
    const w = new Map();
    let total = 0;
    for (const [nid] of Game.nations) {
      const x = Game.nationWeight(nid);
      w.set(nid, x);
      total += x;
    }
    cache = { epoch, turn, seq, w, total, value: new Map() };
    return cache;
  }

  /**
   * The share of the continent, by weight, that recognises this nation.
   *
   * WEIGHT AND NOT HEAD COUNT, the same choice coalition pressure makes: forty
   * rump states acknowledging you is a sentence, and California acknowledging
   * you is a country. An origin nation is 1 by definition and costs nothing to
   * compute, which is most nations for most of a game.
   */
  function scalar(nid) {
    const n = Game.getNation(nid);
    if (!n) return 0;
    if (n.origin) return 1;
    const snap = snapshot();
    const hit = snap.value.get(nid);
    if (hit != null) return hit;
    const set = granted.get(nid);
    const mine = snap.w.get(nid) || 0;
    const others = snap.total - mine;
    let sum = 0;
    if (set) for (const from of set) if (Game.nations.has(from)) sum += snap.w.get(from) || 0;
    const v = others > 0 ? clamp01(sum / others) : 1;
    snap.value.set(nid, v);
    return v;
  }

  const BANDS = [
    [0.75, 'Recognised'], [0.45, 'Partly recognised'], [0.15, 'Barely recognised'],
  ];

  /** The scalar with its working: who acknowledges this state, and who will not. */
  function legitimacy(nid, tune) {
    const n = Game.getNation(nid);
    if (!n) return null;
    const value = scalar(nid);
    const snap = snapshot();
    const by = [], refused = [];
    for (const [other] of Game.nations) {
      if (other === nid) continue;
      const share = snap.total > 0 ? (snap.w.get(other) || 0) / Math.max(1e-9, snap.total - (snap.w.get(nid) || 0)) : 0;
      const row = { nid: other, name: nameOf(other), share };
      if (recognises(other, nid)) by.push(row);
      else refused.push(row);
    }
    by.sort((a, b) => b.share - a.share);
    refused.sort((a, b) => b.share - a.share);
    const parent = parentOf(nid);
    return {
      value, origin: !!n.origin, parent,
      parentRecognises: parent ? recognises(parent, nid) : null,
      by, refused, age: Math.max(0, World.getTurn() - bornOn(nid)),
      summary: summarise(nid, value, refused, parent, tune),
    };
  }

  function summarise(nid, value, refused, parent) {
    const n = Game.getNation(nid);
    if (n && n.origin) return 'A founding state — recognised by everyone.';
    const band = BANDS.find((b) => value >= b[0]);
    const head = band ? band[1] : 'Unrecognised';
    if (!refused.length) return `${head}: the whole continent deals with it.`;
    if (parent && !recognises(parent, nid)) {
      return `${head}: ${nameOf(parent)} still calls it a rebellion, and ${refused.length - 1 > 0
        ? `${refused.length - 1} other ${refused.length - 1 === 1 ? 'nation follows' : 'nations follow'} their lead`
        : 'nobody will go first'}.`;
    }
    return `${head}: ${refused.length} ${refused.length === 1 ? 'nation does' : 'nations do'} not accept it.`;
  }

  /* ------------------------------------------------------------------ */
  /* how the world makes up its mind                                     */
  /* ------------------------------------------------------------------ */

  /**
   * The chance that `from` recognises `to` this turn, with its working.
   *
   * Five inputs, and the shape of them is the design: a state is recognised for
   * being liked, for being like you, for lasting, for being too big to ignore,
   * and — most of all — for having been let go of. The first four are slow and
   * the fifth is a step change, which is what makes the parent's decision the
   * pivot of a breakaway's early game.
   */
  function chance(from, to, tune) {
    const t = tune || window.TUNE;
    const a = Game.getNation(from), b = Game.getNation(to);
    if (!a || !b || from === to) return { value: 0, inputs: [], summary: 'Not a pair.' };
    if (recognises(from, to)) {
      return { value: 0, inputs: [], summary: `${nameOf(from)} already recognises them.` };
    }
    const standing = typeof Relations !== 'undefined' ? Relations.score(from, to, t) : 0;
    const kin = a.gov && b.gov
      ? Ideology.affinity(Ideology.index(a.gov.rulingIdeology), Ideology.index(b.gov.rulingIdeology)) : 0.5;
    const age = Math.max(0, World.getTurn() - bornOn(to));
    const ageK = Math.max(1e-9, t.get('recognition.ageTurns'));
    const size = scalarShare(to);
    const parent = parentOf(to);
    const parentIn = parent && Game.getNation(parent) ? (recognises(parent, to) ? 1 : 0) : 1;

    const inputs = [
      { label: 'Standing', signed: true, raw: standing, norm: clamp(standing, -1, 1),
        key: 'recognition.wStanding', note: 'what they already think of them' },
      { label: 'Kinship', signed: true, raw: kin, norm: clamp(2 * kin - 1, -1, 1),
        key: 'recognition.wKinship', note: 'how close the two governments sit politically' },
      { label: 'Endurance', raw: age, norm: clamp01(age / ageK),
        key: 'recognition.wEndurance', note: 'a state that lasts becomes a fact' },
      { label: 'Weight', raw: size, norm: clamp01(size / Math.max(1e-9, t.get('recognition.weightFull'))),
        key: 'recognition.wWeight', note: 'share of the continent — too big to ignore' },
      /*
       * THE PIVOT. While the state it broke from calls it a rebellion, everybody
       * else has a reason to wait; the moment the parent gives in, the queue
       * moves. A nation with no known parent — a fragment of a collapse, a nation
       * carved out by a failed union — is treated as though the question does not
       * arise, rather than as though the answer were no.
       */
      { label: 'Let go of', raw: parentIn, norm: parentIn, key: 'recognition.wParent',
        note: parent ? (parentIn ? `${nameOf(parent)} has accepted it` : `${nameOf(parent)} still claims them`)
          : 'nobody is claiming them' },
    ];

    let total = t.get('recognition.disposition');
    for (const i of inputs) {
      i.weight = t.get(i.key);
      i.norm = i.signed ? clamp(i.norm, -1, 1) : clamp01(i.norm);
      i.contribution = i.weight * i.norm;
      total += i.contribution;
    }
    const value = clamp01(total) * t.get('recognition.rate');
    inputs.sort((x, y) => Math.abs(y.contribution) - Math.abs(x.contribution));
    return { value, raw: total, inputs, summary: chanceSummary(value, inputs, t) };
  }

  /** A nation's share of the continent by weight — the raw material of `Weight`. */
  function scalarShare(nid) {
    const snap = snapshot();
    return snap.total > 0 ? (snap.w.get(nid) || 0) / snap.total : 0;
  }

  function chanceSummary(value, inputs) {
    const band = value >= 0.2 ? 'About to' : value >= 0.08 ? 'Coming round'
      : value > 0.02 ? 'Unmoved' : 'Refuses';
    const worst = inputs.find((i) => i.contribution < 0);
    const best = inputs.find((i) => i.contribution > 0);
    if (worst) return `${band}: ${worst.label.toLowerCase()} is what holds them back.`;
    return best ? `${band}: ${best.label.toLowerCase()} carries it.` : band;
  }

  /**
   * One turn of the world making up its mind.
   *
   * Only nations founded during play are considered, and only those not already
   * recognised by everyone, so the loop is empty on a board nobody has broken
   * yet and costs one relation lookup per undecided pair afterwards.
   *
   * THE PLAYER IS NOT ROLLED FOR. Recognising a breakaway is a decision with a
   * price — the state it left will hold it against you — and a decision the
   * player would have made for them by a dice roll is not a decision. Theirs is
   * the `recognise` move.
   */
  function tick(tune, rng) {
    const t = tune || window.TUNE;
    const stream = rng ? rng.stream('recognition') : null;
    const out = [];
    // Drop rows for nations that no longer exist, so a long game's matrix stays
    // the size of the roster rather than the size of its history.
    for (const [to] of granted) if (!Game.nations.has(to)) { granted.delete(to); seq++; }
    for (const [nid] of origins) if (!Game.nations.has(nid)) { origins.delete(nid); seq++; }

    for (const [to, n] of Game.nations) {
      if (n.origin) continue;
      if (scalar(to) >= 1) continue;
      for (const [from] of Game.nations) {
        if (from === to || recognises(from, to)) continue;
        if (typeof Game.isPlayer === 'function' && Game.isPlayer(from)) continue;
        const c = chance(from, to, t);
        if (c.value <= 0) continue;
        if (!(stream ? stream.chance(c.value) : false)) continue;
        grant(from, to, { tune: t });
        out.push({ from, to, chance: c });
      }
    }
    if (out.length) announce(out, t);
    return out;
  }

  /**
   * One line per newly recognised nation, not one per pair.
   *
   * Fifty-one separate "Nevada recognised Jefferson" entries is a newspaper
   * nobody reads; "Jefferson was recognised by four more nations, and now holds
   * 38% recognition" is the fact the player needs, and the pairs are on the card.
   */
  function announce(rows, tune) {
    const byTarget = new Map();
    for (const r of rows) {
      const list = byTarget.get(r.to);
      if (list) list.push(r); else byTarget.set(r.to, [r]);
    }
    for (const [to, list] of byTarget) {
      const v = scalar(to);
      Ledger.append({
        turn: World.getTurn(), phase: 'roster', subject: to, kind: 'recognised', delta: list.length,
        text: `${nameOf(to)} was recognised by ${list.length} more `
          + `${list.length === 1 ? 'nation' : 'nations'} — ${Math.round(v * 100)}% of the continent now deals with them.`,
        terms: [{ name: 'Legitimacy', value: v, key: 'recognition.rate' }],
        recognisers: list.map((r) => r.from),
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* what it is worth                                                    */
  /* ------------------------------------------------------------------ */

  /*
   * WHEN RECOGNITION IS SWITCHED OFF, IT MUST NOT STILL CHARGE FOR ITSELF.
   *
   * Economy mode turns the politics layer off: `Recognition.tick` never runs, so
   * nobody's standing ever changes, and the panel and the Recognise button are
   * both hidden. Leaving the gates below live meant a frozen political value the
   * player could neither see nor alter was silently refusing their trades — in
   * the one mode built for testing trade. That was introduced with the mode and
   * is the defect this answers.
   *
   * The rule is answered HERE rather than at each call site so a future caller
   * cannot forget it, and it reads the same way the existing guards do: callers
   * already treat an absent Recognition module as "no gate", and a switched-off
   * one is the same situation.
   *
   * Note this is NOT the "hard block versus haircut" change the economy brief
   * asks for in its ruling 1.6. DESIGN.md deliberately specifies both: no
   * bilateral trade with anyone who does not recognise you, AND a smuggler's
   * rate on the world market. The code already implements both correctly. See
   * D166.
   */
  const live = () => typeof Complexity === 'undefined' || Complexity.enabled('politics');

  /** May these two sign a bilateral deal? Both have to admit the other exists. */
  const canTrade = (a, b) => !live() || (recognises(a, b) && recognises(b, a));

  /**
   * What a nation gets paid on the world market, as a fraction of the going rate.
   *
   * A HAIRCUT RATHER THAN A LOCK. Refusing external trade outright would make an
   * unrecognised landlocked state unplayable and, worse, would be untrue: goods
   * from a country nobody recognises do reach the market, through intermediaries
   * who take a cut for the trouble. The cut shrinks to nothing as the world comes
   * round, so this is a problem that solves itself if you survive it.
   */
  function marketRate(nid, tune) {
    if (!live()) return 1; // see canTrade: a switched-off system charges nothing
    const t = tune || window.TUNE;
    const floor = t.get('recognition.tradeFloor');
    const v = scalar(nid);
    if (v >= floor || floor <= 0) return 1;
    const rate = t.get('recognition.smugglingRate');
    return rate + (1 - rate) * (v / floor);
  }

  /** May this nation take a seat in a coalition? Nobody coordinates with a ghost. */
  function seated(nid, tune) {
    const t = tune || window.TUNE;
    return scalar(nid) >= t.get('recognition.coalitionFloor');
  }

  /* ------------------------------------------------------------------ */

  const count = () => { let n = 0; for (const s of granted.values()) n += s.size; return n; };

  const serialize = () => ({
    granted: [...granted].map(([to, set]) => [to, [...set]]),
    origins: [...origins].map(([nid, o]) => [nid, o.parent, o.turn]),
  });

  /**
   * A DOCUMENT THAT PREDATES THE CONCEPT SAYS NOBODY IS ILLEGITIMATE.
   *
   * Loading a save written before M7.8 with an empty matrix would retroactively
   * strip every nation founded during that game of its standing, its trade and
   * its coalition seat — a save that got worse for having been saved. The
   * document does not say those nations were unrecognised; it says nothing at
   * all, and the honest reading of nothing is the world as it was played.
   *
   * Converted once, on load, so the next save carries the matrix like any other.
   */
  function adopt() {
    for (const [nid, n] of Game.nations) {
      if (n.origin) continue;
      const set = new Set();
      for (const [other] of Game.nations) if (other !== nid) set.add(other);
      granted.set(nid, set);
    }
    seq++;
  }

  function loadState(snap) {
    reset();
    if (snap === undefined || snap === null) { adopt(); return; }
    for (const [to, list] of snap.granted || []) granted.set(to, new Set(list));
    for (const [nid, parent, turn] of snap.origins || []) origins.set(nid, { parent, turn });
    seq++;
  }

  return {
    reset, founded, parentOf, bornOn, recognises, grant, scalar, legitimacy, chance, tick,
    canTrade, marketRate, seated, count, serialize, loadState,
  };
})();
