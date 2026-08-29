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
  const VERSION = 2;
  const SERVER_PREFIX = 'save-';

  let serverOk = true; // flips false the first time the API is unreachable

  /* ---- the save document ---------------------------------------- */

  function buildStamp() {
    // The county table's SHAPE is a function of areas.json. If that file is
    // rebuilt with a different threshold, every existing save silently refers to
    // Areas that no longer exist (finding 53). Stamp it and refuse a mismatch.
    return {
      areas: Object.keys(Game.county).length,
      threshold: (store.areasDef && store.areasDef.threshold) || null,
      merged: store.areasDef ? Object.keys(store.areasDef.areas).length : null,
    };
  }

  function snapshot() {
    return {
      v: VERSION,
      ts: Date.now(),
      build: buildStamp(),
      meta: { seed: store.seed, turn: World.getTurn() },
      rng: store.rng ? store.rng.serialize() : null,
      game: Game.serialize(),
      turns: TurnSystem.serialize(),
      world: World.serialize(),
      market: Market.serialize(),
      colors: Colors.serialize(),
      parties: Parties.serialize(),
      tune: TUNE.diff(), // only deliberate overrides, so a schema change is not baked in
      ui: { colorMode: store.colorMode, mode: store.mode, cultureGran: store.cultureGran || 'sub' },
    };
  }

  /** Structural check run BEFORE anything is mutated. Returns null or a message. */
  function validate(snap) {
    if (!snap || typeof snap !== 'object') return 'That file is not a Nation States save.';
    if (snap.v == null) return 'That save has no version stamp and cannot be read.';
    if (snap.v < VERSION) {
      return `That is a version ${snap.v} save from before the model rewrite. ` +
        'It carries no world turn, market prices, party roster or RNG state, so it cannot be ' +
        'loaded without inventing them. Start a new game.';
    }
    if (snap.v > VERSION) return `That save is version ${snap.v}; this build reads version ${VERSION}.`;
    if (!snap.game || !Array.isArray(snap.game.nations)) return 'That save has no nations in it.';
    if (!snap.turns || !Array.isArray(snap.turns.order)) return 'That save has no turn order in it.';
    const b = snap.build || {};
    const now = buildStamp();
    if (b.areas != null && b.areas !== now.areas) {
      return `That save was made against a different map build (${b.areas} Areas; this build has ` +
        `${now.areas}). data/areas.json has changed, so the save's Area ids no longer line up.`;
    }
    return null;
  }

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

      if (snap.tune) TUNE.load(snap.tune);
      store.seed = (snap.meta && snap.meta.seed) != null ? snap.meta.seed : store.seed;
      if (snap.rng) {
        store.rng = RNG.restore(snap.rng);
        TurnSystem.setRng(store.rng);
      }
      World.loadState(snap.world || { turn: (snap.meta && snap.meta.turn) || 0 });
      Colors.loadState(snap.colors);
      Parties.loadState(snap.parties);
      Market.loadState(snap.market);
      TurnSystem.loadState(snap.turns);
      Game.loadState(snap.game); // emits -> full re-render

      // Prices are derived; if the save predates Market serialization or the
      // economy failed to load, recompute rather than show the previous world's.
      if (!Market.getPrices() && MapModes.getEconomy()) Market.update(TUNE);

      document.querySelectorAll('.toggle button[data-mode]').forEach((b) =>
        b.classList.toggle('active', b.dataset.mode === store.mode));

      const cur = TurnSystem.currentId();
      if (cur && Game.getNation(cur)) { setMode('nations'); select('nation', cur); }
      else deselect();
      renderTurnBanner();
      return { ok: true };
    } catch (err) {
      console.error('load failed, rolling back', err);
      try {
        World.loadState(rollback.world);
        Colors.loadState(rollback.colors);
        Parties.loadState(rollback.parties);
        Market.loadState(rollback.market);
        TurnSystem.loadState(rollback.turns);
        Game.loadState(rollback.game);
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
        // Keep data/state.json pointing at the most recent save — this is the
        // document M2.5 promotes to the single source of truth.
        await fetch('/api/state', { method: 'PUT', body: JSON.stringify(doc) }).catch(() => {});
        return { ok: true, where: 'server' };
      } catch (e) {
        serverOk = false;
      }
    }
    const r = localWrite(name, doc);
    return r.ok ? { ok: true, where: 'local' } : r;
  }

  async function read(entry) {
    if (entry.where === 'server') return serverRead(entry.file);
    const raw = localStorage.getItem(PREFIX + entry.name);
    if (!raw) throw new Error('save not found');
    return JSON.parse(raw);
  }

  async function remove(entry) {
    if (entry.where === 'server') {
      // The API has no DELETE for content; overwrite with a tombstone the list
      // filter drops. Simpler than adding an endpoint for a rare operation.
      await serverWrite(entry.file, { v: VERSION, deleted: true, ts: Date.now() }).catch(() => {});
    }
    localStorage.removeItem(PREFIX + entry.name);
  }

  /* ---- modal ------------------------------------------------------ */

  const openModal = (html) => {
    const m = document.getElementById('modal');
    m.querySelector('.modal-body').innerHTML = html;
    m.classList.add('show');
  };
  const closeModal = () => document.getElementById('modal').classList.remove('show');
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
          const stale = s.v != null && s.v < VERSION ? ' &middot; <em>old format</em>' : '';
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

  document.getElementById('btn-save')?.addEventListener('click', openSave);
  document.getElementById('btn-load')?.addEventListener('click', openLoad);
  document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal' || e.target.hasAttribute('data-close')) closeModal();
  });

  return { openSave, openLoad, apply, snapshot, validate, list, write, read, VERSION };
})();
