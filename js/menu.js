/*
 * THE GAME MENU.
 *
 * The header is for the map — what you are selecting, how it is coloured, where
 * the lines are. Everything that is about the GAME rather than the view lives
 * behind one button here: new game, save, load, timeline, map editor.
 *
 * It exists because the game had no way to start over. `?fresh=1` in the URL
 * was the only route to a new world, which is a route nobody who did not read
 * the source could find, and the four bare header buttons that did exist were
 * competing with eight map-mode toggles for the same eye.
 *
 * Two rules the rest of the file follows:
 *
 *  - THE MENU IS BUILT FRESH EVERY TIME IT OPENS. Nothing here caches a label.
 *    "Enter map editor" / "Leave map editor" and "Timeline" / "Close timeline"
 *    are read from Editor.isActive() and the timeline's own state at draw time,
 *    which is why editor.js no longer repaints a header button and cannot fall
 *    out of sync with one.
 *
 *  - AN ITEM THAT CANNOT RUN SAYS SO, AND SAYS WHY. Save, load, timeline and
 *    the editor are all unsafe while an action holds the map (an in-flight
 *    action carries Sets of county ids that outlive the world they came from).
 *    Rather than let those be clicked and then refuse, the menu draws them
 *    disabled with the reason above them — the same bargain the action panels
 *    make everywhere else in this game.
 */
const Menu = (function () {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /*
   * No `typeof X !== 'undefined'` guards in this file, on purpose. Every module
   * named here is an unconditional <script> tag in index.html, and a guard would
   * turn a missing one into a menu item that silently does nothing instead of a
   * ReferenceError that names the file. The codebase has ~60 of these; this is
   * not the 61st.
   */
  const busy = () => Actions.isActive();   // an in-flight action owns the map
  const editing = () => Editor.isActive();
  const scrubbing = () => timelineTurn != null;

  /* ---- the menu itself -------------------------------------------- */

  const item = (id, icon, title, desc, off) => `
    <button class="menu-item" id="${id}"${off ? ' disabled' : ''}>
      <span class="mi-icon">${icon}</span>
      <span class="mi-text"><span class="mi-t">${title}</span><span class="mi-d">${desc}</span></span>
    </button>`;

  function open() {
    /*
     * Not while the game is waiting on an answer (M10.1). `#endscreen` carries
     * the end of the game, a crisis and the go-with-the-breakaway offer, and it
     * sits above the modal — so a menu opened underneath one renders perfectly
     * and cannot be reached.
     */
    if (screenBlocked()) return flash('Answer what the game is asking first.', 'warn');
    const off = busy();
    const turn = World.getTurn();
    const me = Game.playerNation() ? Game.playerNation().name : null;

    openModal(`
      <h3>Game</h3>
      <p class="menu-where">${me ? `You are <strong>${esc(me)}</strong> &middot; ` : ''}world turn <strong>${turn}</strong></p>
      ${off ? '<p class="menu-warn">An action is holding the map. Finish or cancel it to save, load or start over.</p>' : ''}
      <div class="menu-list">
        ${/* NOT gated on `off` (M10.1). Reading how you win is the one thing in
              here that is safe while an action holds the map — and the moment a
              player most wants it is mid-decision. */''}
        ${item('mi-obj', '&#127919;', 'Objectives', 'The three ways to win, live &mdash; and how to read this game.', false)}
        ${item('mi-deals', '&#128739;', 'Deals',
              'Every standing trade agreement you have &mdash; what each pays, what you signed at against '
              + 'what the market says now, and anything waiting for an answer.', false)}
        ${item('mi-new', '&#127760;', 'New game', 'A fresh world &mdash; choose the opening board and the seed.', off)}
        ${item('mi-save', '&#128190;', 'Save game', 'Write this world to disk under a name you choose.', off)}
        ${item('mi-load', '&#128194;', 'Load game', 'Open a saved world. This one is replaced.', off)}
        ${item('mi-timeline', '&#8987;', scrubbing() ? 'Close timeline' : 'Timeline',
              'The map at every turn it has been, scrubbable.', off)}
        ${item('mi-editor', '&#128506;', editing() ? 'Leave map editor' : 'Map editor',
              'Draw and publish your own regional map modes.', off)}
        ${item('mi-export', '&#128202;', 'Export this session',
              `This session is being recorded so it can be sent back &mdash; `
              + `${World.getTurn()} turns so far. See exactly what is in it.`, false)}
      </div>
      <div class="modal-btns"><button class="btn ghost" data-close>Close</button></div>`);

    // Objectives and Export are live either way: one reads the rules and the
    // other reads the record, and neither touches the world.
    document.getElementById('mi-obj').onclick = () => Objectives.open();
    // Reading what you have already signed is safe mid-action for the same
    // reason reading the objectives is: it changes nothing on the map.
    document.getElementById('mi-deals').onclick = () => { closeModal(); DealBook.open(); };
    document.getElementById('mi-export').onclick = openExport;
    if (off) return; // every other item is disabled; nothing more to wire

    document.getElementById('mi-new').onclick = openNew;
    document.getElementById('mi-save').onclick = () => SaveManager.openSave();
    document.getElementById('mi-load').onclick = () => SaveManager.openLoad();
    document.getElementById('mi-timeline').onclick = () => {
      closeModal();
      if (scrubbing()) closeTimeline(); else openTimeline();
    };
    document.getElementById('mi-editor').onclick = () => {
      closeModal();
      Editor.toggle();
    };
  }

  /* ---- new game ---------------------------------------------------- */

  /*
   * Starting over is a page reload, and deliberately so.
   *
   * A new world is not a state transition this game can make in place: boot
   * assembles the map, the party roster, the opening scenario, the power stocks
   * and the timeline's first frame in one ordered pass, and half a dozen modules
   * hold state that only `reset()` at that point in that order clears correctly.
   * Reloading runs the ONE code path that is known to produce a valid world,
   * instead of a second, quieter one that has to be kept in step with it forever.
   *
   * What we do before reloading is throw the live document away, because the
   * next boot resumes from it. That is destructive and unrecoverable, so the
   * dialog says so and offers to save first.
   */
  function openNew() {
    const board = store.scenario ? 'shattered' : 'none';
    openModal(`
      <h3>New game</h3>
      <p class="modal-msg">This replaces the world in progress, and the autosave with it.
        Save it first if you want it back.</p>
      <div class="menu-opts">
        <label class="opt">
          <input type="radio" name="ns-board" value="shattered"${board === 'shattered' ? ' checked' : ''}>
          <span><strong>The shattered board</strong>
            <em>The opening scenario. The Union has already come apart, and several states with it.</em></span>
        </label>
        <label class="opt">
          <input type="radio" name="ns-board" value="none"${board === 'none' ? ' checked' : ''}>
          <span><strong>Fifty-one states</strong>
            <em>No partition. Every state wakes up whole, sovereign, and still in one piece.</em></span>
        </label>
      </div>
      <div class="menu-opts diff-opts">
        ${Telemetry.PRESETS.map((d) => `
          <label class="opt">
            <input type="radio" name="ns-diff" value="${d.id}"${Telemetry.current() === d.id ? ' checked' : ''}>
            <span><strong>${esc(d.label)}</strong><em>${esc(d.blurb)}</em></span>
          </label>`).join('')}
      </div>
      <div class="menu-opts">
        <label class="opt">
          <input type="radio" name="ns-complexity" value="full"${Complexity.current() !== 'economy' ? ' checked' : ''}>
          <span><strong>Full</strong>
            <em>Everything: movements, secession, elections, leaders, diplomacy, the whole board.</em></span>
        </label>
        <label class="opt">
          <input type="radio" name="ns-complexity" value="economy"${Complexity.current() === 'economy' ? ' checked' : ''}>
          <span><strong>Economy</strong>
            <em>Unite, annex and trade against the market, with politics and separatist movements switched off.</em></span>
        </label>
      </div>
      <label class="menu-field"><span>Seed</span>
        <input id="new-seed" class="modal-input" inputmode="numeric" autocomplete="off"
          placeholder="blank for a random world"></label>
      <p class="menu-hint">A whole number names the world: the same seed and the same board deal the
        same opening every time. This one is <code>${store.seed != null ? store.seed : '&mdash;'}</code>.</p>
      <div id="new-msg" class="modal-msg"></div>
      <div class="modal-btns">
        <button class="btn ghost" id="new-back">Back</button>
        <button class="btn ghost" id="new-save">Save first</button>
        <button class="btn go danger" id="new-go">Start</button>
      </div>`);

    const seedEl = document.getElementById('new-seed');
    const msg = (t) => { document.getElementById('new-msg').textContent = t; };

    document.getElementById('new-back').onclick = open;
    document.getElementById('new-save').onclick = () => SaveManager.openSave();
    document.getElementById('new-go').onclick = async () => {
      const raw = seedEl.value.trim();
      if (raw && !/^-?\d+$/.test(raw)) return msg('A seed is a whole number. Leave it blank for a random one.');
      const pick = document.querySelector('input[name="ns-board"]:checked');
      const diff = document.querySelector('input[name="ns-diff"]:checked');
      const complexity = document.querySelector('input[name="ns-complexity"]:checked');
      msg('Starting a new world…');
      // Throw the live document away BEFORE navigating, or the next boot resumes
      // straight back into the world we were asked to replace.
      await SaveManager.clearLive();
      location.href = url(pick ? pick.value : 'shattered', raw, diff ? diff.value : null,
        complexity ? complexity.value : null);
    };
    seedEl.focus();
  }

  /**
   * The URL a new game boots from.
   *
   * Built from the pathname rather than by editing the current query, so the
   * flags that decided the LAST game — `?play=`, `?fresh=1`, an old `?seed=` —
   * cannot leak into this one. `?dev=1` survives, because it is a property of
   * who is sitting at the keyboard rather than of the world being started.
   *
   * Note there is no `?fresh=1`: that flag skips the resume without deleting
   * anything, so leaving it in the address bar would make every later reload
   * silently discard the game in progress. We delete the document instead and
   * hand back a clean URL that resumes normally from here on.
   */
  function url(boardValue, seed, difficulty, complexity) {
    const q = new URLSearchParams();
    if (boardValue === 'none') q.set('scenario', 'none');
    if (seed) q.set('seed', seed);
    // Carried in the URL as well as in localStorage, so a playtest can hand
    // somebody a specific setting by link (M13.1).
    if (difficulty && difficulty !== 'standard') q.set('difficulty', difficulty);
    if (complexity && complexity !== 'full') q.set('complexity', complexity);
    if (new URLSearchParams(location.search).has('dev')) q.set('dev', '1');
    const s = q.toString();
    return location.pathname + (s ? '?' + s : '');
  }

  /* ---- the telemetry export (M13.1) --------------------------------- */

  /*
   * The instrument the audit pointed at: "the ledger is a telemetry system; it
   * just needs an export button." This is the button.
   */
  function openExport() {
    const sum = Telemetry.summary();
    /*
     * SAY WHAT IS IN THE FILE, ITEM BY ITEM.
     *
     * This is the screen where a playtester decides whether to send their
     * session to somebody. "It carries no personal information" is a claim, and
     * a claim is worth less than a list — so the list is the interface, and it
     * is short enough to read.
     */
    openModal(`
      <h3>Export this session</h3>
      <p class="modal-msg">One JSON file, for the person who asked you to play this.
        <strong>${sum.minutes}</strong> ${sum.minutes === 1 ? 'minute' : 'minutes'},
        <strong>${World.getTurn()}</strong> turns, a median of
        <strong>${sum.medianTurnSeconds}s</strong> a turn.</p>
      <div class="ex-list">
        <div class="geo-row"><span>Everything that happened in the world</span>
          <strong>${Ledger.count()} entries</strong></div>
        <div class="geo-row"><span>Where you stood, turn by turn</span>
          <strong>${sum.rows} rows</strong></div>
        <div class="geo-row"><span>What you did &mdash; including what you opened and cancelled</span>
          <strong>${sum.entries} notes</strong></div>
        <div class="geo-row"><span>The seed, the board, the difficulty and the tuning</span>
          <strong>so it can be replayed</strong></div>
      </div>
      <label class="menu-field"><span>Name</span>
        <input id="ex-name" class="modal-input" autocomplete="off"
          placeholder="e.g. alex-session-2"></label>
      <p class="menu-hint">Nothing else is recorded: no names, no text you typed, nothing about your
        computer, and nothing from outside this tab. Written to <code>content/</code> when the local
        server is running, and downloaded otherwise.</p>
      <div id="ex-msg" class="modal-msg"></div>
      <div class="modal-btns">
        <button class="btn ghost" id="ex-back">Back</button>
        <button class="btn go" id="ex-go">Export</button>
      </div>`);
    const msg = (t) => { document.getElementById('ex-msg').textContent = t; };
    document.getElementById('ex-back').onclick = open;
    document.getElementById('ex-go').onclick = async () => {
      msg('Collecting…');
      const r = await Telemetry.exportRun(document.getElementById('ex-name').value.trim());
      closeModal();
      flash(r.where === 'server'
        ? `\u{1F4CA} Session written to <code>${esc(r.file)}</code> (${Math.round(r.bytes / 1024)} KB).`
        : `\u{1F4CA} Session downloaded as <code>${esc(r.file)}</code> (${Math.round(r.bytes / 1024)} KB).`,
      'good');
    };
    document.getElementById('ex-name').focus();
  }

  return { open, openNew, openExport, url };
})();
