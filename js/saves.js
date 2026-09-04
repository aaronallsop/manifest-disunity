/*
 * Save / load.
 *
 * A save is ONE document describing the whole runtime, version 2. Every module
 * that holds mutable state exposes serialize/loadState and `snapshot()`
 * enumerates them — that rule is what stops the v1 bug where 2 of 8 stateful
 * modules were persisted and the rest silently carried over from the session.
 *
 * v1 saves are REFUSED, not migrated: they carry no world turn, no market
 * prices, no party roster, no colour counter and no RNG state, so "migrating"
 * one means inventing five values and pretending the result is the player's
 * game. A clear message beats a plausible lie.
 *
 * Storage: the local server (M0.2) is the primary store — a save is
 * `PUT /api/content/save-<slug>.json`, and the most recent one is also written
 * to `data/state.json`, which is the document M2.5 turns into the single source
 * of truth. localStorage is the fallback for when the page is opened without
 * the server; it is capped at ~5 MB and setItem is wrapped, because a bare
 * setItem fails silently at about the 10th save.
 */
const SaveManager = (function () {
  const PREFIX = 'ns_save_';
  /*
   * FROM StateDoc, not a second copy of the number (M9.6). This file only uses
   * it to badge an old save "old format" in the load list, which is exactly the
   * kind of use that goes quietly stale: a version bump in statedoc.js would
   * leave every save in the list looking current while the loader refused them.
   *
   * A FUNCTION, NOT A CONSTANT, and that is not a style choice. `StateDoc` is an
   * ESM module published onto `window` by `js/boot-globals.js`, which is
   * `type="module"` and therefore DEFERRED — it has not run when this classic
   * script is being evaluated. `const VERSION = StateDoc.VERSION` at the top of
   * an IIFE is a load-time ReferenceError that takes the whole module with it,
   * which is the trap js/app.js documents at its own top for OLD_CT. Read it
   * when somebody asks, by which time the bridge exists.
   */
  const version = () => StateDoc.VERSION;
  const SERVER_PREFIX = 'save-';
  const AUTOSAVE_NAME = 'Autosave';

  let serverOk = true; // flips false the first time the API is unreachable

  /* ---- the save document ---------------------------------------- */
  /*
   * The document itself lives in js/statedoc.js, which is DOM-free so the suite
   * and the M5 simulator can run the REAL assemble/apply rather than a copy of
   * them. What stays here is everything that needs a browser: the session values
   * that live in `store`, transport, the modal, the UI restore and the rollback.
   */

  /** The session values a document needs that are not in the model. */
  const session = (extra) => ({
    seed: store.seed,
    rng: store.rng,
    areasDef: store.areasDef,
    ui: { colorMode: store.colorMode, mode: store.mode, cultureGran: store.cultureGran || 'sub' },
    ...extra,
  });

  const buildStamp = () => StateDoc.buildStamp(store.areasDef);
  const snapshot = (extra) => StateDoc.assemble(session(extra));
  const validate = (snap) => StateDoc.validate(snap, store.areasDef);

  /* ---- apply ------------------------------------------------------ */

  /**
   * Load a save document into the live game.
   * @returns {{ok: true} | {ok: false, message: string}}
   */
  function apply(snap) {
    const bad = validate(snap);
    if (bad) return { ok: false, message: bad };

    // An in-flight action holds Sets of county ids from the game being replaced.
    // Leaving it live routes every subsequent map click into stale state.
    if (typeof Actions !== 'undefined' && Actions.isActive()) Actions.cancel();
    if (typeof Editor !== 'undefined' && Editor.isActive()) Editor.exit();

    // Loading is destructive halfway through (Game.loadState clears nations
    // before repopulating), so keep an escape hatch.
    const rollback = snapshot();
    try {
      // colour mode FIRST: Game.loadState emits, which drives a full recolor.
      // Setting it after means painting all 3,232 paths twice.
      setColorMode((snap.ui && snap.ui.colorMode) || 'standard');
      if (snap.ui && snap.ui.mode) store.mode = snap.ui.mode;
      if (snap.ui && snap.ui.cultureGran) store.cultureGran = snap.ui.cultureGran;

      store.seed = (snap.meta && snap.meta.seed) != null ? snap.meta.seed : store.seed;
      const { rng } = StateDoc.applyModel(snap);
      if (rng) store.rng = rng;

      // Prices are derived; if the save predates Market serialization or the
      // economy failed to load, recompute rather than show the previous world's.
      if (!Market.getPrices() && MapModes.getEconomy()) Market.update(TUNE);

      document.querySelectorAll('.toggle button[data-mode]').forEach((b) =>
        b.classList.toggle('active', b.dataset.mode === store.mode));

      /*
       * A load can land the turn pointer on any slot, including one of the fifty
       * the human does not operate. Sweep the AI seats so the game resumes where
       * every other turn resumes: on the player's move.
       */
      if (Game.getPlayer() != null) AI.sweep(TUNE, store.rng);
      const cur = Game.getPlayer() || TurnSystem.currentId();
      if (cur && Game.getNation(cur)) { setMode('nations'); select('nation', cur); }
      else deselect();
      renderTurnBanner();
      // The ledger came back with the document; the journal is its surface, and
      // an unread count carried over from the game we just replaced is a lie.
      if (typeof Journal !== 'undefined') Journal.reset();
      return { ok: true };
    } catch (err) {
      console.error('load failed, rolling back', err);
      try {
        StateDoc.applyModel(rollback);
      } catch (e2) {
        console.error('rollback also failed', e2);
      }
      return { ok: false, message: 'That save could not be read. Nothing was changed.' };
    }
  }

  /* ---- storage ---------------------------------------------------- */

  const slug = (name) =>
    SERVER_PREFIX + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || SERVER_PREFIX + 'game';

  async function serverList() {
    if (!serverOk) return null;
    try {
      const r = await fetch('/api/content');
      if (!r.ok) throw new Error('status ' + r.status);
      const j = await r.json();
      return (j.content || []).filter((n) => n.startsWith(SERVER_PREFIX));
    } catch (e) {
      serverOk = false;
      return null;
    }
  }

  async function serverRead(file) {
    const r = await fetch('/api/content/' + file);
    if (!r.ok) throw new Error('status ' + r.status);
    return r.json();
  }

  async function serverWrite(file, doc) {
    const r = await fetch('/api/content/' + file, { method: 'PUT', body: JSON.stringify(doc) });
    if (!r.ok) throw new Error('status ' + r.status);
    return r.json();
  }

  /** localStorage fallback. Returns {ok} or {ok:false, message}. */
  function localWrite(name, doc) {
    try {
      localStorage.setItem(PREFIX + name, JSON.stringify(doc));
      return { ok: true };
    } catch (err) {
      const quota = err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014);
      const kb = Math.round(JSON.stringify(doc).length / 1024);
      return {
        ok: false,
        message: quota
          ? `Out of browser storage — this save is about ${kb} KB and the ~5 MB budget is full. ` +
            'Delete a save from the Load list, or run the local server so saves go to disk instead.'
          : `Could not save: ${err && err.message ? err.message : err}`,
      };
    }
  }

  const localNames = () =>
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length));

  /**
   * Every save the player can load, from both stores.
   * @returns {Promise<Array<{name, where, ts, file?}>>}
   */
  async function list() {
    const out = new Map();
    const files = await serverList();
    if (files) {
      for (const f of files) {
        try {
          const doc = await serverRead(f);
          out.set(doc.name || f, { name: doc.name || f, where: 'server', ts: doc.ts, file: f, v: doc.v });
        } catch (e) { /* skip an unreadable file rather than failing the whole list */ }
      }
    }
    for (const n of localNames()) {
      if (out.has(n)) continue;
      let ts = null, v = null;
      try { const d = JSON.parse(localStorage.getItem(PREFIX + n)); ts = d.ts; v = d.v; } catch (e) {}
      out.set(n, { name: n, where: 'local', ts, v });
    }
    return [...out.values()].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }

  async function exists(name) {
    return (await list()).some((s) => s.name === name);
  }

  /** Write a save under `name`. Server first, localStorage as the fallback. */
  async function write(name) {
    const doc = snapshot();
    doc.name = name;
    if (serverOk) {
      try {
        await serverWrite(slug(name) + '.json', doc);
        // and the live document tracks the newest state either way
        await fetch('/api/state', { method: 'PUT', body: JSON.stringify(doc) }).catch(() => {});
        return { ok: true, where: 'server' };
      } catch (e) {
        serverOk = false;
      }
    }
    const r = localWrite(name, doc);
    return r.ok ? { ok: true, where: 'local' } : r;
  }

  /* ---- data/state.json: the LIVE document ------------------------- */
  /*
   * Written at every world-turn boundary and read at boot. That is what makes it
   * the source of truth rather than a copy of the last time someone pressed
   * Save: close the tab mid-game, reopen it, and the world is where you left it.
   *
   * Failures here are deliberately silent. Autosave is a convenience running
   * behind the player's back; if the server is not there, the game must keep
   * working exactly as it did before, and the Save button will say so loudly
   * when the player actually asks for a save.
   */
  let autosaveInFlight = false, autosavePending = false;
  /*
   * THE LIVE DOCUMENT WITHOUT A SERVER (M13.2).
   *
   * `data/state.json` is the source of truth when `server.py` is running, and
   * it is what makes closing the tab safe: the world is written at every turn
   * boundary and read back at boot. On a STATIC host — which is how a
   * playtester three time zones away is going to get this — there is no
   * `/api/state`, so before this the autosave simply did nothing and a tester
   * who reloaded lost everything since their last manual Save.
   *
   * localStorage is the same fallback the named saves already use, and the
   * measured shape is fine: a turn-3 document is 670 KB of which the ledger is
   * 47 KB, and writing it costs ~10 ms (4.5 stringify + 5.1 setItem). The part
   * that grows is the ledger, at roughly 0.2 KB an entry.
   *
   * WHICH IS WHY QUOTA IS HANDLED RATHER THAN REPORTED. The ~5 MB budget is
   * shared with the player's named saves, and a long session's ledger is what
   * will eventually push it over. On a quota failure the live copy is written
   * again with its ledger trimmed to the recent past — the game stays
   * resumable, which is the thing this exists for. The FULL ledger is still in
   * memory and still goes into the telemetry export, so nothing a playtest
   * needs is lost; what is lost is old newspaper text after a reload, and that
   * is the right thing to spend.
   */
  const LIVE_KEY = 'ns_live';

  function localLiveWrite(doc) {
    try {
      localStorage.setItem(LIVE_KEY, JSON.stringify(doc));
      return true;
    } catch (err) {
      const quota = err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014);
      if (!quota) return false;
      try {
        // Keep the last few turns of news; the export keeps all of it.
        const keepFrom = Math.max(0, (doc.meta && doc.meta.turn ? doc.meta.turn : 0) - 10);
        const trimmed = {
          ...doc,
          ledger: doc.ledger && Array.isArray(doc.ledger.entries)
            ? { ...doc.ledger, entries: doc.ledger.entries.filter((e) => e.turn >= keepFrom) }
            : doc.ledger,
        };
        localStorage.setItem(LIVE_KEY, JSON.stringify(trimmed));
        if (!liveTrimWarned) {
          liveTrimWarned = true;
          flash('\u{1F4BE} Browser storage is nearly full, so the auto-save is keeping only the '
            + 'last ten turns of the journal. Your game is safe; use <strong>Menu &rarr; Export '
            + 'this session</strong> before you finish.', 'warn');
        }
        return true;
      } catch (e2) {
        return false;
      }
    }
  }
  let liveTrimWarned = false;

  async function autosave() {
    if (autosaveInFlight) { autosavePending = true; return; } // coalesce; never queue
    autosaveInFlight = true;
    try {
      const doc = snapshot({ name: AUTOSAVE_NAME });
      if (serverOk) {
        try {
          /*
           * `r.ok`, NOT merely "it did not throw". A static host answers PUT
           * with 405 or 501 — a RESPONSE, and `fetch` resolves happily on it.
           * The first version of this only fell back when the request threw,
           * so on exactly the host a playtester would be using it wrote
           * nothing, silently, every turn, and reported success.
           */
          const r = await fetch('/api/state', { method: 'PUT', body: JSON.stringify(doc) });
          if (r.ok) return;
          serverOk = false;
        } catch (e) {
          serverOk = false;   // ...and fall through to the browser
        }
      }
      localLiveWrite(doc);
    } finally {
      autosaveInFlight = false;
      if (autosavePending) { autosavePending = false; autosave(); }
    }
  }

  /** The live document, or null if there is none / it is unreadable. */
  async function readLive() {
    try {
      const r = await fetch('/api/state', { cache: 'no-store' });
      if (r.ok) return await r.json();
      // A 404 on a first run is normal; fall through and ask the browser.
    } catch (e) {
      serverOk = false;
    }
    try {
      const raw = localStorage.getItem(LIVE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /** Throw the live document away, so the next boot starts a fresh world. */
  async function clearLive() {
    // BOTH stores, unconditionally. A New game that cleared only the one it
    // happened to be using would resume out of the other one.
    try { await fetch('/api/state', { method: 'DELETE' }); } catch (e) { /* nothing to clear */ }
    try { localStorage.removeItem(LIVE_KEY); } catch (e) { /* nothing to clear */ }
  }

  async function read(entry) {
    if (entry.where === 'server') return serverRead(entry.file);
    const raw = localStorage.getItem(PREFIX + entry.name);
    if (!raw) throw new Error('save not found');
    return JSON.parse(raw);
  }

  async function remove(entry) {
    if (entry.where === 'server') {
      await fetch(`/api/content/${entry.file}`, { method: 'DELETE' }).catch(() => {});
    }
    localStorage.removeItem(PREFIX + entry.name);
  }

  /* ---- modal ------------------------------------------------------ */

  /* openModal/closeModal are app.js's; the card is shared with the game menu
     and with anything else that has to stop the game and ask a question. */
  const done = (t) => { closeModal(); flash(t, 'good'); };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const msg = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

  function openSave() {
    if (blockedByAction()) return;
    openModal(`
      <h3>Save game</h3>
      <input id="save-name" class="modal-input" placeholder="Name your save" autocomplete="off" />
      <div id="save-msg" class="modal-msg"></div>
      <div class="modal-btns">
        <button class="btn ghost" data-close>Cancel</button>
        <button class="btn go" id="save-confirm">Save</button>
      </div>`);
    const input = document.getElementById('save-name');
    input.focus();
    const go = () => trySave(input.value.trim());
    document.getElementById('save-confirm').onclick = go;
    input.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  }

  async function trySave(name) {
    if (!name) return msg('save-msg', 'Enter a name first.');
    msg('save-msg', 'Saving…');
    if (await exists(name)) return openOverwrite(name);
    const r = await write(name);
    if (r.ok) done(`\u{1F4BE} Saved as “${esc(name)}”${r.where === 'local' ? ' (browser storage)' : ''}.`);
    else msg('save-msg', r.message);
  }

  function openOverwrite(name) {
    openModal(`
      <h3>Overwrite?</h3>
      <p class="modal-msg">A save named “<strong>${esc(name)}</strong>” already exists.</p>
      <div id="save-msg" class="modal-msg"></div>
      <div class="modal-btns">
        <button class="btn ghost" id="rename">Save as new name</button>
        <button class="btn go danger" id="overwrite">Overwrite</button>
      </div>`);
    document.getElementById('overwrite').onclick = async () => {
      const r = await write(name);
      if (r.ok) done(`\u{1F4BE} Overwrote “${esc(name)}”.`);
      else msg('save-msg', r.message);
    };
    document.getElementById('rename').onclick = openSave;
  }

  async function openLoad() {
    if (blockedByAction()) return;
    openModal(`<h3>Load game</h3><div class="save-list"><p class="modal-msg">Reading saves…</p></div>
      <div id="load-msg" class="modal-msg"></div>
      <div class="modal-btns"><button class="btn ghost" data-close>Close</button></div>`);
    const saves = await list();
    const body = document.querySelector('#modal .save-list');
    if (!body) return; // modal closed while we were reading
    body.innerHTML = saves.length
      ? saves.map((s, i) => {
          const ts = s.ts ? new Date(s.ts).toLocaleString() : '';
          const where = s.where === 'server' ? 'on disk' : 'browser';
          const stale = s.v != null && s.v < version() ? ' &middot; <em>old format</em>' : '';
          return `<div class="save-row">
            <button class="save-load" data-i="${i}"><strong>${esc(s.name)}</strong><span>${esc(ts)} &middot; ${where}${stale}</span></button>
            <button class="save-del" data-del="${i}" title="Delete">✕</button></div>`;
        }).join('')
      : `<p class="modal-msg">No saved games yet.</p>`;

    body.querySelectorAll('.save-load').forEach((b) => (b.onclick = async () => {
      const entry = saves[+b.dataset.i];
      let doc;
      try {
        doc = await read(entry);
      } catch (e) {
        return msg('load-msg', 'That save could not be read from storage.');
      }
      const r = apply(doc);
      if (r.ok) done(`\u{1F4C2} Loaded “${esc(entry.name)}”.`);
      else msg('load-msg', r.message);
    }));
    body.querySelectorAll('.save-del').forEach((b) => (b.onclick = async () => {
      await remove(saves[+b.dataset.del]);
      openLoad();
    }));
  }

  /** Save/Load/Editor must not fire while an action holds the map. */
  function blockedByAction() {
    if (typeof Actions !== 'undefined' && Actions.isActive()) {
      flash('Finish or cancel the current action first.', 'warn');
      return true;
    }
    return false;
  }

  /* No header buttons of its own since M8: Save and Load are menu items, and
     the menu calls openSave/openLoad through the exports below. */

  return {
    openSave, openLoad, apply, snapshot, validate, list, write, read,
    get VERSION() { return StateDoc.VERSION; },
    autosave, readLive, clearLive, AUTOSAVE_NAME, blockedByAction,
  };
})();
