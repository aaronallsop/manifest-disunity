/*
 * THE JOURNAL — the game's memory, where the player can read it (M9.7).
 *
 * WHAT THIS REPLACES, and why it is the biggest thing in M9.
 *
 * `flash()` is one toast slot. Every action confirm in js/actions.js flashed
 * its result and then synchronously called `completeTurn()`, which flashed the
 * newspaper over the top of it — in the same frame. The civil-war dice roll,
 * which is the richest single piece of feedback this game produces and which
 * `Moves.resolve` goes to the trouble of logging as `terms`, was painted for
 * zero frames and replaced, every single time. DESIGN.md §7.7 describes that
 * pathology as fixed. It was not; only the content had changed.
 *
 * The fix is not a longer toast or a second slot. It is that a game whose whole
 * identity is "it explains itself honestly" needs somewhere the explanation
 * STAYS. The ledger has been that record since M6.3 — one append-only entry per
 * event, each carrying the `terms` that justify it — and the only thing missing
 * was a surface. This is the surface.
 *
 * THE DIVISION OF LABOUR, now:
 *
 *   flash()     transient status only. "Finish or cancel the current action
 *               first." "Saved as X." Things that are true for six seconds and
 *               then are not worth screen space. Also alarms: a nation MOVING
 *               toward victory (M9.5) is rare enough to interrupt for.
 *   the journal  everything that happened, permanently, grouped by turn, with
 *               the Why rows a click away. Nothing here is ever overwritten.
 *   the newspaper  no longer a toast. It is the journal's TURN HEADER — the
 *               same ranked headlines, rendered as the divider between one
 *               turn's entries and the next.
 *
 * An action result still flashes, because immediate feedback at the point of
 * the click is worth having. The difference is that it is now a *copy* of
 * something durable rather than the only telling of it.
 *
 * READS THE LEDGER, OWNS NOTHING. There is no journal state to serialize: the
 * ledger already round-trips through the save (js/ledger.js), so a loaded game
 * reopens with its whole history intact. What this module holds is where the
 * player has scrolled and what they have already seen, which are properties of
 * the person rather than of the world.
 */
const Journal = (function () {
  /* ---- what the player has already read ---------------------------- */
  /*
   * The unread mark is an ENTRY ID, not a turn. "Since I last looked" and
   * "since the world ticked" are two different clocks, and the AI sweep between
   * two of the player's turns crosses a world-turn boundary in the middle —
   * the same reason `Ledger.mark`/`after` exist rather than a turn comparison.
   */
  let seenId = 0;
  let open = false;
  let filter = 'all';

  /*
   * THE FILTERS ARE FAMILIES, NOT KINDS.
   *
   * `Ledger.KINDS` has twenty entries and a row of twenty chips is not a
   * filter, it is a second problem. These five are the questions a player
   * actually asks of a log — what did I do, who is fighting, who is governing,
   * who is talking to whom — and every kind lands in exactly one of them, so
   * "All" is genuinely the sum of the others.
   */
  const FAMILIES = [
    { id: 'all', label: 'Everything' },
    { id: 'you', label: 'Yours' },
    { id: 'ground', label: 'Ground', kinds: ['annex', 'war', 'unite', 'defect', 'declare', 'fragment', 'release', 'autonomy', 'died', 'found', 'scenario'] },
    { id: 'politics', label: 'Politics', kinds: ['govern', 'election', 'leader', 'crisis', 'power'] },
    { id: 'world', label: 'The world', kinds: ['trade', 'recognise', 'recognised', 'won', 'treaty', 'aid'] },
  ];
  const familyOf = (id) => FAMILIES.find((f) => f.id === id) || FAMILIES[0];

  /** Does this entry belong in the current filter? */
  function matches(e) {
    if (filter === 'all') return true;
    if (filter === 'you') {
      const me = Game.getPlayer();
      return !!me && (e.subject === me || e.parent === me || e.actor === me);
    }
    const fam = familyOf(filter);
    return !!fam.kinds && fam.kinds.includes(e.kind);
  }

  /* ---- rendering --------------------------------------------------- */

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /*
   * Numbers in a Why row are of wildly different magnitudes — a die roll of 14
   * beside a flip magnitude of 0.0037 — so the format follows the value.
   *
   * Whole numbers print whole and unsigned, because half these terms are COUNTS
   * rather than deltas: "Dice +1.0" is a wrong description of one die. Fractions
   * keep their sign, because those are the contributions, and which way a
   * contribution pushed is the thing the row exists to say.
   */
  const num = (v) => {
    if (!Number.isFinite(v)) return String(v);
    if (Number.isInteger(v)) return Math.abs(v) >= 1000 ? v.toLocaleString() : String(v);
    const a = Math.abs(v);
    const body = a >= 1000 ? Math.round(a).toLocaleString()
      : a >= 10 ? a.toFixed(1)
        : a >= 1 ? a.toFixed(2)
          : a.toFixed(3);
    return (v < 0 ? '\u2212' : '+') + body;
  };

  /*
   * THE WHY ROWS, which is the whole reason this panel is worth building.
   *
   * `terms` is the same shape js/power.js and js/sentiment.js produce, and for
   * a civil war it is the dice: how many, what they rolled, the points, the
   * flip magnitude and the resulting score. That is the account of why an
   * annexation went the way it did, and until now it existed in the save file
   * and nowhere a player could see it.
   */
  function termsHtml(e) {
    if (!e.terms || !e.terms.length) return '';
    return `<div class="j-terms">${e.terms.map((t) =>
      `<span class="j-term"><span class="j-tn">${esc(t.name)}</span>`
      + `<span class="j-tv ${t.value < 0 ? 'neg' : t.value > 0 ? 'pos' : ''}">`
      + `${num(t.value)}</span></span>`).join('')}</div>`;
  }

  function entryHtml(e, unread) {
    const me = Game.getPlayer();
    const mine = me && e.subject === me;
    const n = e.subject ? Game.getNation(e.subject) : null;
    return `<div class="j-entry k-${esc(e.kind)}${mine ? ' mine' : ''}${unread ? ' new' : ''}">
      <span class="j-dot" style="background:${n ? n.color : 'var(--muted)'}"></span>
      <div class="j-body">
        <div class="j-text">${esc(e.text)}</div>
        ${termsHtml(e)}
      </div>
      <span class="j-kind">${esc(e.kind)}</span>
    </div>`;
  }

  /*
   * THE NEWSPAPER, AS A DIVIDER.
   *
   * The same `Ledger.rank` the toast used, rendered as the header of the turn's
   * group rather than as a message that arrives and leaves. A turn that
   * produced nothing worth ranking says so, because "a quiet quarter" is
   * information too — it is the difference between nothing happening and the
   * player having missed something.
   */
  function turnHeadHtml(turn, rows) {
    const heads = Ledger.rank(rows, 3);
    const lead = heads.length
      ? heads.map((h) => esc(h.text)).join(' · ')
      : 'A quiet quarter.';
    return `<div class="j-turn"><span class="j-tno">Turn ${turn}</span>
      <span class="j-lead">${lead}</span></div>`;
  }

  function render() {
    const el = document.getElementById('journal');
    if (!el) return;
    const rows = Ledger.all().filter((e) => e.text);
    const unread = rows.filter((e) => e.id > seenId).length;
    const latest = rows.length ? rows[rows.length - 1] : null;

    const chips = FAMILIES.filter((f) => f.id !== 'politics' || Complexity.enabled('politics')).map((f) =>
      `<button class="j-chip${filter === f.id ? ' active' : ''}" data-fam="${f.id}">${esc(f.label)}</button>`).join('');

    /*
     * COLLAPSED, THE STRIP STILL CARRIES THE LAST THING THAT HAPPENED.
     *
     * A dock that closes to a bare title bar is a dock nobody opens, and the
     * whole failure this replaces was a player looking away and losing the only
     * account of what they had just done. Closed, it is one line; open, it is
     * the record.
     */
    const strip = latest
      ? `<span class="j-latest">${esc(latest.text)}</span>`
      : '<span class="j-latest quiet">Nothing has happened yet.</span>';

    el.className = open ? 'open' : '';
    el.innerHTML = `
      <div class="j-bar">
        <button class="j-toggle" id="j-toggle" aria-expanded="${open}">
          <span class="j-caret">${open ? '▾' : '▴'}</span> Journal
          ${unread ? `<span class="j-badge">${unread}</span>` : ''}
        </button>
        ${open ? `<div class="j-chips">${chips}</div>` : strip}
      </div>
      ${open ? `<div class="j-list" id="j-list">${listHtml(rows)}</div>` : ''}`;

    document.getElementById('j-toggle').onclick = toggle;
    el.querySelectorAll('.j-chip').forEach((b) => {
      b.onclick = () => {
        if (typeof Telemetry !== 'undefined') Telemetry.note('journal-filter', { d: b.dataset.fam });
        filter = b.dataset.fam; render();
      };
    });
    // Opening the journal IS reading it.
    if (open) seenId = Ledger.mark();
  }

  function listHtml(rows) {
    const shown = rows.filter(matches);
    if (!shown.length) {
      return `<div class="j-empty">Nothing yet under &ldquo;${esc(familyOf(filter).label)}&rdquo;.</div>`;
    }
    /*
     * Grouped by turn, newest first, and capped. A sixty-turn game is a few
     * hundred entries and rebuilding all of them on every render is work nobody
     * asked for; the timeline is where a whole game is reviewed.
     */
    const byTurn = new Map();
    for (const e of shown) {
      if (!byTurn.has(e.turn)) byTurn.set(e.turn, []);
      byTurn.get(e.turn).push(e);
    }
    const turns = [...byTurn.keys()].sort((a, b) => b - a).slice(0, 40);
    return turns.map((t) => {
      const group = byTurn.get(t);
      // The turn header ranks over EVERYTHING that turn, not over the filtered
      // subset: a headline that changes with the filter is not a headline.
      const head = turnHeadHtml(t, Ledger.forTurn(t).filter((e) => e.text));
      return head + group.slice().reverse().map((e) => entryHtml(e, e.id > seenId)).join('');
    }).join('');
  }

  /* ---- the public surface ------------------------------------------ */

  function toggle() {
    open = !open;
    if (typeof Telemetry !== 'undefined') Telemetry.note('journal', { d: open ? 'open' : 'close' });
    render();
    if (open) {
      const list = document.getElementById('j-list');
      if (list) list.scrollTop = 0;
    }
  }

  /**
   * Something happened; show it.
   *
   * Called after every action and every turn. Cheap when closed — one line of
   * text and a badge count — which is what lets it be called unconditionally
   * rather than by whoever remembers to.
   */
  function refresh() { render(); }

  /**
   * A turn has resolved. The newspaper used to be a toast here; now it is the
   * header of this turn's group, and all this has to do is make sure the dock
   * is showing the new one.
   */
  function noteTurn() {
    render();
    const el = document.getElementById('journal');
    if (!el) return;
    // A one-shot pulse, so a closed dock still says "look here" without
    // stealing the screen. Removed on animation end so it can fire again.
    el.classList.remove('pulse');
    void el.offsetWidth;                 // restart the animation
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 1200);
  }

  /** A new world: nothing has been read, because nothing has happened. */
  function reset() { seenId = 0; render(); }

  return { render, refresh, noteTurn, toggle, reset, isOpen: () => open, FAMILIES };
})();
