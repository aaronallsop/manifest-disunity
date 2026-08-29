/*
 * Save / load. The whole runtime state is serialized to one plain object and kept
 * in localStorage under a player-chosen name (browsers can't write files directly).
 * Save prompts for a name and offers overwrite-or-rename; Load lists saved games.
 */
const SaveManager = (function () {
  const PREFIX = 'ns_save_';

  const snapshot = () => ({ v: 1, ts: Date.now(), game: Game.serialize(), turns: TurnSystem.serialize(), colorMode: store.colorMode });
  const names = () =>
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length)).sort();
  const exists = (name) => localStorage.getItem(PREFIX + name) != null;
  const write = (name) => localStorage.setItem(PREFIX + name, JSON.stringify(snapshot()));
  const remove = (name) => localStorage.removeItem(PREFIX + name);

  function apply(name) {
    const raw = localStorage.getItem(PREFIX + name);
    if (!raw) return false;
    const snap = JSON.parse(raw);
    TurnSystem.loadState(snap.turns);
    Game.loadState(snap.game); // emits -> full re-render
    setColorMode(snap.colorMode || 'standard');
    const cur = TurnSystem.currentId();
    if (cur && Game.getNation(cur)) { setMode('nations'); select('nation', cur); }
    return true;
  }

  /* ---- modal ---- */
  const openModal = (html) => {
    const m = document.getElementById('modal');
    m.querySelector('.modal-body').innerHTML = html;
    m.classList.add('show');
  };
  const closeModal = () => document.getElementById('modal').classList.remove('show');
  const done = (t) => { closeModal(); flash(t, 'good'); };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function openSave() {
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

  function trySave(name) {
    if (!name) { document.getElementById('save-msg').textContent = 'Enter a name first.'; return; }
    if (exists(name)) return openOverwrite(name);
    write(name);
    done(`\u{1F4BE} Saved as “${name}”.`);
  }

  function openOverwrite(name) {
    openModal(`
      <h3>Overwrite?</h3>
      <p class="modal-msg">A save named “<strong>${esc(name)}</strong>” already exists.</p>
      <div class="modal-btns">
        <button class="btn ghost" id="rename">Save as new name</button>
        <button class="btn go danger" id="overwrite">Overwrite</button>
      </div>`);
    document.getElementById('overwrite').onclick = () => { write(name); done(`\u{1F4BE} Overwrote “${name}”.`); };
    document.getElementById('rename').onclick = openSave;
  }

  function openLoad() {
    const list = names();
    const rows = list.length
      ? list
          .map((n) => {
            let ts = '';
            try { ts = new Date(JSON.parse(localStorage.getItem(PREFIX + n)).ts).toLocaleString(); } catch (e) {}
            return `<div class="save-row">
              <button class="save-load" data-name="${esc(n)}"><strong>${esc(n)}</strong><span>${ts}</span></button>
              <button class="save-del" data-del="${esc(n)}" title="Delete">✕</button></div>`;
          })
          .join('')
      : `<p class="modal-msg">No saved games yet.</p>`;
    openModal(`<h3>Load game</h3><div class="save-list">${rows}</div>
      <div class="modal-btns"><button class="btn ghost" data-close>Close</button></div>`);
    document.querySelectorAll('.save-load').forEach((b) => (b.onclick = () => { apply(b.dataset.name); done(`\u{1F4C2} Loaded “${b.dataset.name}”.`); }));
    document.querySelectorAll('.save-del').forEach((b) => (b.onclick = () => { remove(b.dataset.del); openLoad(); }));
  }

  // wire header buttons + backdrop/close (this script is at the end of <body>)
  document.getElementById('btn-save')?.addEventListener('click', openSave);
  document.getElementById('btn-load')?.addEventListener('click', openLoad);
  document.getElementById('modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal' || e.target.hasAttribute('data-close')) closeModal();
  });

  return { openSave, openLoad, apply, names };
})();
