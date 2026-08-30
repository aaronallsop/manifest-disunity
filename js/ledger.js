/*
 * The event ledger: one append-only record of what happened and why.
 *
 *   { turn, phase, subject, kind, delta, terms: [{name, value, key}], text }
 *
 * ONE STRUCTURE, FOUR CONSUMERS, and the reason to build it once is that they
 * want the same thing at different verbosities:
 *
 *   - the player's "why did Salt Lake jump +8?" tooltip renders `terms` as prose
 *   - the developer's formula expander renders `terms` as a table, with `key`
 *     naming the tunable slider that moves each one
 *   - the end-of-game timeline replays `subject` and `delta` over `turn`
 *   - the simulator graphs `delta`, and a save-game bug is diagnosed by reading
 *     the ledger rather than by re-running the game and hoping
 *
 * WHAT IT REPLACES. The only output any action produced was an HTML string
 * handed to `flash()` — a six-second toast that overwrites the previous message,
 * and on a round boundary the action result is immediately clobbered by the
 * growth toast. A player who looked away lost the only account of what they had
 * just done. There was no event log anywhere in the codebase.
 *
 * `terms` IS THE WHY RECORD, in the same shape `js/power.js` and
 * `js/sentiment.js` already produce — so an entry that explains a number costs
 * one array reference rather than a second calculation. That is the whole return
 * on the convention: by the time something is worth logging, its explanation
 * already exists.
 *
 * TEXT IS PLAIN, NOT HTML. The ledger is read by a tooltip, a table, a
 * newspaper and a graph, and three of those do not want markup. Escaping and
 * decoration belong to whoever renders it.
 */
const Ledger = (function () {
  let entries = [];
  let seq = 0;

  /**
   * `kind` is the vocabulary. Keeping it closed means a consumer can switch on
   * it exhaustively, and a typo becomes a missing entry rather than a silent
   * new category nobody renders.
   */
  const KINDS = [
    'annex', 'war', 'unite', 'defect', 'declare', 'fragment', 'release',
    'govern', 'trade', 'found', 'died', 'power', 'won', 'autonomy', 'crisis', 'leader',
  ];

  /**
   * Append one event.
   *
   * @param e {turn, phase, subject, kind, delta, terms, text, ...}
   *          `subject` is the nation or Area the event is ABOUT — the thing a
   *          timeline would draw and a tooltip would hang off. Everything else
   *          the caller wants to carry rides along untouched.
   */
  function append(e) {
    if (!e || !e.kind) return null;
    const entry = {
      id: ++seq,
      turn: e.turn == null ? (typeof World !== 'undefined' ? World.getTurn() : 0) : e.turn,
      phase: e.phase || 'action',
      subject: e.subject == null ? null : e.subject,
      kind: e.kind,
      delta: e.delta == null ? null : e.delta,
      terms: e.terms || null,
      text: e.text || '',
      ...e,
    };
    entry.id = seq;   // the spread must not let a caller forge an id
    entries.push(entry);
    const cap = typeof window !== 'undefined' && window.TUNE ? window.TUNE.peek('ledger.cap') : 5000;
    if (cap && entries.length > cap) entries.splice(0, entries.length - cap);
    return entry;
  }

  /**
   * Attach a Why record's inputs as `terms`, keeping only what a reader needs.
   *
   * The full record carries `raw`, `norm` and `weight` per input; a ledger entry
   * wants the name, what it contributed, and which slider moves it. Dropping the
   * rest keeps a 40-turn game's ledger small enough to sit in the save document.
   */
  const termsOf = (why, limit) => {
    if (!why || !why.inputs) return null;
    return why.inputs
      .filter((i) => Math.abs(i.contribution) > 1e-6)
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, limit || 6)
      .map((i) => ({ name: i.label, value: i.contribution, key: i.key }));
  };

  const all = () => entries;
  const since = (turn) => entries.filter((e) => e.turn >= turn);
  const forTurn = (turn) => entries.filter((e) => e.turn === turn);
  const forSubject = (id) => entries.filter((e) => e.subject === id);
  const ofKind = (kind) => entries.filter((e) => e.kind === kind);
  const latest = (n) => entries.slice(-(n || 20));

  /**
   * The turn-summary newspaper: the few entries from one turn most worth a
   * headline, ranked by how much they moved.
   *
   * Ranked rather than filtered, because "important" is not a property of the
   * kind — a one-Area defection into a movement's first country matters more
   * than a routine six-Area annexation, and only the magnitude knows that.
   */
  const WEIGHT = { won: 1000, declare: 100, died: 90, unite: 70, war: 60, found: 55, annex: 40,
                   govern: 35, crisis: 32, release: 30, autonomy: 28, defect: 25, fragment: 20,
                   leader: 15, trade: 10, power: 5 };

  /**
   * Rank a set of entries and keep the few most worth a headline.
   *
   * Ranked rather than filtered, because "important" is not a property of the
   * kind — a one-Area defection into a movement's first country matters more
   * than a routine six-Area annexation, and only the magnitude knows that.
   */
  function rank(rows, limit) {
    /*
     * A declaration already says a country came into being, so the `found` entry
     * beside it is the same news twice. It stays in the ledger — the timeline
     * and the simulator both want the founding as its own fact — and is dropped
     * only from the headlines, which is a place where saying it twice costs one
     * of five slots.
     */
    const declared = new Set(rows.filter((e) => e.kind === 'declare').map((e) => e.subject));
    return rows
      .filter((e) => e.text)
      .filter((e) => !(e.kind === 'found' && declared.has(e.subject)))
      .map((e) => ({ e, score: (WEIGHT[e.kind] || 1) * 1000 + Math.abs(e.delta || 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 5)
      .map((x) => x.e);
  }

  /*
   * WHAT HAPPENED WHILE YOU WERE AWAY.
   *
   * `headlines` answers "what happened during world turn N", which was the right
   * question while the human took all fifty-one seats and watched every one. From
   * M6.2 the human acts once per round, and the AI sweep between two of their
   * turns crosses a world-turn boundary in the middle — so a single-turn query
   * drops half of every interval, including, on a bad interval, the declaration
   * of independence in the player's own back yard.
   *
   * The interval is marked by ID rather than by turn because the question is
   * "since I finished my turn", not "since the world ticked", and those are two
   * different clocks. It also keeps the player's own action out of their own
   * newspaper: they were told what it did when they did it, and re-reporting it
   * as the top headline (an annexation outranks almost everything) would spend
   * the lead slot saying something they already know.
   */
  const mark = () => (entries.length ? entries[entries.length - 1].id : 0);
  const after = (id) => entries.filter((e) => e.id > id);

  /**
   * The turn-summary newspaper: the few entries from ONE turn most worth a
   * headline.
   */
  function headlines(turn, limit) {
    /*
     * No turn given = the most recent turn that HAS anything, which is what
     * every consumer actually wants and is the one form that cannot be got
     * wrong. Events are stamped with the turn during which they happened, so
     * after `advanceTurn` returns, the turn that just resolved is
     * `World.getTurn() - 1` — an off-by-one every caller would otherwise have to
     * remember, and the first one did not.
     */
    if (turn == null) {
      if (!entries.length) return [];
      turn = entries[entries.length - 1].turn;
    }
    return rank(forTurn(turn), limit);
  }

  function reset() { entries = []; seq = 0; }

  /* The ledger IS state: a save that forgets what happened cannot show a
     timeline, and "why is my Authority falling" is not answerable from a
     snapshot of the present. */
  const serialize = () => ({ seq, entries: entries.map((e) => ({ ...e })) });
  function loadState(snap) {
    if (!snap) { reset(); return; }
    entries = Array.isArray(snap.entries) ? snap.entries.map((e) => ({ ...e })) : [];
    seq = snap.seq || entries.length;
  }

  return {
    KINDS, append, termsOf, all, since, forTurn, forSubject, ofKind, latest,
    headlines, rank, mark, after, reset, serialize, loadState,
    count: () => entries.length,
  };
})();
