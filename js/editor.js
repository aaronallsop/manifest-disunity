/*
 * Map editor: author 3-tier region hierarchies (EU4-style) as "map modes".
 *
 *   tier 1  super-region  (e.g. West Coast / The South)
 *   tier 2  region        (e.g. Northern California / Gulf States)
 *   tier 3  group         (e.g. Central Valley / Florida)
 *
 * Rules: each Area belongs to at most ONE path -- one group, which belongs to
 * one region, which belongs to one super-region. Painting at a child node
 * auto-assigns the parent chain; painting a different branch reassigns.
 *
 * Modes: built-in Geographical + Cultural (both "contain all areas": publish is
 * blocked until every Area is assigned) plus user-created modes.
 *
 * Two stores, and the distinction is the point. DRAFTS are unfinished work and
 * live in localStorage, on the machine they were drafted on. PUBLISHED modes are
 * authored content and live in `content/<slug>.json`, written and read through
 * the server — the same directory and the same atomic write the rest of the
 * authored data uses. Before M2.5b there was no second store: Publish triggered
 * a browser DOWNLOAD which the author had to find and hand-copy into `data/`
 * under a different name, and there was no import at all, so a published mode
 * was write-only the moment it left the browser.
 */
const Editor = (function () {
  const PALETTE = ['#e0483b', '#3b6fe0', '#33a852', '#e8862d', '#8a5cf5', '#e3c229',
    '#00b5ad', '#f04f8f', '#7d9c3f', '#c0653a', '#5580a0', '#a86ee8'];
  const UNASSIGNED = '#39414b';
  const PREFIX = 'ns_mapmode_';

  let active = false;
  let modes = null;         // { name: mode }
  let cur = null;           // current mode name
  let selPath = [];         // selected node path (ids, root..node)
  let gran = 'county';      // 'state' | 'county' (county == Area)
  let paint = 'assign';     // 'assign' | 'deselect'
  let idSeq = 1;

  const newMode = (name, requireAll) => ({ name, requireAll, nodes: [], assign: {} });
  function defaults() {
    modes = { Geographical: newMode('Geographical', true), Cultural: newMode('Cultural', true) };
    cur = 'Geographical';
  }

  /* ---- tree helpers ---- */
  const nid = () => 'n' + idSeq++;
  function findPath(nodes, id, trail = []) {
    for (const n of nodes) {
      if (n.id === id) return [...trail, n];
      const r = findPath(n.children, id, [...trail, n]);
      if (r) return r;
    }
    return null;
  }
  const nodeByPath = (path) => (path.length ? findPath(modes[cur].nodes, path[path.length - 1]) : null);
  /*
   * One pass over the assignments per render instead of one pass PER NODE.
   * renderSidebar calls this for every node in the tree, and it ran the full
   * 1,676-entry scan each time — so a 40-node tree cost 67,000 array scans per
   * paint click.
   */
  let countCache = null;
  function buildCounts() {
    countCache = new Map();
    for (const path of Object.values(modes[cur].assign)) {
      for (const id of path) countCache.set(id, (countCache.get(id) || 0) + 1);
    }
  }
  const memberCount = (id) => (countCache ? countCache.get(id) || 0 : 0);

  /* ---- painting ---- */
  /*
   * PRECOMPUTED. At State granularity this scanned all 1,676 Area keys and the
   * caller then ran up to 33 topojson.merge calls — per mousemove.
   * State -> Areas is immutable, so it is built once on entry.
   */
  let areasByState = null;
  function buildStateIndex() {
    areasByState = new Map();
    for (const a of Object.keys(Game.county)) {
      const st = Game.county[a].st;
      let list = areasByState.get(st);
      if (!list) areasByState.set(st, (list = []));
      list.push(a);
    }
  }
  function unitAreas(fips) {
    const aid = Game.areaIdOf(fips);
    if (gran === 'county') return [aid];
    if (!areasByState) buildStateIndex();
    return areasByState.get(Game.county[aid].st) || [aid];
  }
  function paintUnit(fips) {
    if (!selPath.length) return flash('Select a node in the tree first.', 'warn');
    const assign = modes[cur].assign;
    const selId = selPath[selPath.length - 1];
    for (const aid of unitAreas(fips)) {
      const curPath = assign[aid] || [];
      if (paint === 'deselect') {
        const i = curPath.indexOf(selId);
        if (i >= 0) {
          const trimmed = curPath.slice(0, i);
          if (trimmed.length) assign[aid] = trimmed;
          else delete assign[aid];
        }
      } else {
        assign[aid] = selPath.slice(); // auto-chain: child assignment implies parents
      }
    }
    renderSidebar();
    recolor();
  }

  /* ---- coloring (used by app.fillFor while active) ---- */
  // Editor.color ran TWO fresh d3.interpolateRgb per county per repaint, which
  // is ~12,928 colour parses for one paint click.
  const dimCache = new Map();
  function dim(c) {
    let hit = dimCache.get(c);
    if (hit === undefined) { hit = d3.interpolateRgb(c, '#242a31')(0.75); dimCache.set(c, hit); }
    return hit;
  }

  function color(fips) {
    const aid = Game.areaIdOf(fips);
    const path = modes[cur].assign[aid];
    const selId = selPath.length ? selPath[selPath.length - 1] : null;
    if (!path) return selId ? '#242a31' : UNASSIGNED;
    const rootIdx = modes[cur].nodes.findIndex((n) => n.id === path[0]);
    let c = PALETTE[(rootIdx + PALETTE.length) % PALETTE.length];
    c = MapModes.lighten(c, path.length - 1); // deeper tier = lighter, memoized
    if (selId && !path.includes(selId)) c = dim(c); // dim others, memoized
    return c;
  }

  /* ---- map events (routed from app.js) ---- */
  const onClick = (d) => paintUnit(d.id);
  // Same-target guard: bound to mousemove, so without it the whole unit outline
  // is rebuilt and re-serialised on every pointer event inside one shape.
  let hoverKey = null;
  function onHover(d) {
    const key = gran + ':' + (gran === 'county' ? Game.areaIdOf(d.id) : Game.county[Game.areaIdOf(d.id)].st);
    if (key === hoverKey) return;
    hoverKey = key;
    const feats = unitAreas(d.id).map((a) => areaFeature(a));
    store.hoverShape.attr('d', store.path({ type: 'FeatureCollection', features: feats.flatMap((f) => (f.type === 'FeatureCollection' ? f.features : [f])) })).style('display', null);
  }

  /* ---- publish / drafts ---- */
  function unassignedCount() {
    return Object.keys(Game.county).filter((a) => !modes[cur].assign[a]).length;
  }
  /*
   * PUBLISH: write the mode into content/ through the server.
   *
   * It used to trigger a browser DOWNLOAD, which the author then had to find in
   * their Downloads folder and hand-copy into data/ under a different name. That
   * made the editor the one authoring tool whose output lived outside the repo,
   * and it is why the two shipped map modes sat in data/ — the bake-output
   * directory — rather than in content/ with everything else authored.
   *
   * The document is now PUT to /api/content/<slug>.json, which is the same
   * atomic write the save system uses, to the same directory the game loads map
   * modes from. The download survives only as the offline fallback: the editor
   * has to keep working when the page is opened without the server, and losing
   * an afternoon of painting because a fetch failed is not an acceptable
   * outcome.
   */
  const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function download(doc, name) {
    const blob = new Blob([JSON.stringify(doc, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    return a.download;
  }

  async function publish() {
    const m = modes[cur];
    const missing = unassignedCount();
    if (m.requireAll && missing) return flash(`Cannot publish: ${missing} areas are still unassigned.`, 'bad');
    const name = slug(m.name);
    if (!name) return flash('That mode name has no letters or digits in it, so it cannot be a filename.', 'bad');
    const doc = { type: 'ns-mapmode', ...m };
    try {
      const r = await fetch(`/api/content/${name}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc, null, 1),
      });
      if (!r.ok) throw new Error(`server said ${r.status}`);
      flash(`\u{1F4BE} Published to <strong>content/${name}.json</strong>. Reload to play with it.`, 'good');
    } catch (e) {
      const file = download(doc, name);
      flash(`\u{26A0} The server did not accept it (${esc(e.message)}), so ${esc(file)} was `
        + 'downloaded instead. Copy it into content/ by hand.', 'warn');
    }
  }

  /*
   * IMPORT: read a published mode back out of content/.
   *
   * The editor could publish and never load, so a mode was write-only the moment
   * it left the browser: reopening one meant re-painting 1,676 Areas by hand, or
   * finding the localStorage draft on the machine it was drafted on. Drafts are
   * still local (they are unfinished work); published modes are now round-trip.
   */
  async function publishedNames() {
    try {
      const r = await fetch('/api/content', { cache: 'no-store' });
      if (!r.ok) return [];
      const body = await r.json();
      return (body.content || [])
        .map((f) => String(f).replace(/\.json$/, ''))
        // content/ also holds saves and the authored game tables; only offer
        // things the editor could plausibly have written.
        .filter((n) => !n.startsWith('save-') && n !== 'tunables' && n !== 'ideologies');
    } catch (e) {
      return [];
    }
  }

  async function importPublished(name) {
    try {
      const r = await fetch(`/api/content/${name}.json`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`server said ${r.status}`);
      const doc = await r.json();
      if (doc.type !== 'ns-mapmode' || !Array.isArray(doc.nodes) || !doc.assign) {
        return flash(`content/${esc(name)}.json is not a map mode.`, 'bad');
      }
      const mode = { name: doc.name || name, requireAll: !!doc.requireAll, nodes: doc.nodes, assign: doc.assign };
      // Node ids are minted from a counter; importing a mode whose ids run past
      // ours would mint duplicates on the next Add.
      let maxId = idSeq;
      (function walk(ns) {
        for (const n of ns) {
          const num = /^n(\d+)$/.exec(n.id);
          if (num) maxId = Math.max(maxId, Number(num[1]) + 1);
          walk(n.children || []);
        }
      })(mode.nodes);
      idSeq = maxId;
      modes[mode.name] = mode;
      cur = mode.name;
      selPath = [];
      renderSidebar();
      recolor();
      flash(`\u{1F4C2} Imported <strong>content/${esc(name)}.json</strong> `
        + `(${Object.keys(mode.assign).length} areas assigned).`, 'good');
    } catch (e) {
      flash(`Could not read content/${esc(name)}.json: ${esc(e.message)}`, 'bad');
    }
  }
  function saveDraft() {
    localStorage.setItem(PREFIX + cur, JSON.stringify({ mode: modes[cur], idSeq }));
    flash(`\u{1F4BE} Draft saved: ${cur}`, 'good');
  }
  function loadDraft(name) {
    const raw = localStorage.getItem(PREFIX + name);
    if (!raw) return;
    const d = JSON.parse(raw);
    modes[d.mode.name] = d.mode;
    idSeq = Math.max(idSeq, d.idSeq || 1);
    cur = d.mode.name;
    selPath = [];
    renderSidebar();
    recolor();
    flash(`\u{1F4C2} Draft loaded: ${name}`, 'good');
  }
  const draftNames = () => Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).map((k) => k.slice(PREFIX.length));

  /* ---- sidebar UI ---- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function nodeRow(n, path, depth) {
    const sel = selPath[selPath.length - 1] === n.id;
    const kids = n.children.map((k) => nodeRow(k, [...path, k.id], depth + 1)).join('');
    const addSub = depth < 3 ? `<button class="ed-mini" data-addsub="${n.id}" title="Add a tier-${depth + 1} subset">+ sub</button>` : '';
    return `<div class="ed-node d${depth} ${sel ? 'sel' : ''}">
      <button class="ed-name" data-sel="${n.id}">${esc(n.name)} <span>${memberCount(n.id)}</span></button>
      ${addSub}<button class="ed-mini" data-del="${n.id}">✕</button></div>${kids}`;
  }
  function renderSidebar() {
    buildCounts();
    const m = modes[cur];
    const el = document.getElementById('leaderboard');
    el.innerHTML = `
      <div class="ed-head"><strong>Map editor</strong><button id="ed-exit" class="ed-mini">Exit</button></div>
      <div class="ed-modes">${Object.keys(modes).map((k) => `<button class="ed-chip ${k === cur ? 'on' : ''}" data-mode="${esc(k)}">${esc(k)}</button>`).join('')}
        <button class="ed-chip" id="ed-newmode">+ mode</button></div>
      <div id="ed-newmode-form" style="display:none">
        <input id="ed-mode-name" class="ed-input" placeholder="New map mode name" />
        <div class="ed-row"><button class="ed-btn" id="ed-mk-all">Contains all areas</button>
        <button class="ed-btn" id="ed-mk-some">Doesn't contain all</button></div></div>
      <div class="ed-row"><button class="ed-btn" id="ed-save">Save draft</button>
        <button class="ed-btn" id="ed-load">Drafts</button>
        <button class="ed-btn" id="ed-import">Open published</button>
        <button class="ed-btn go" id="ed-publish">Publish</button></div>
      <div id="ed-drafts" style="display:none"></div>
      <div class="ed-row ed-lbl">Select by
        <button class="ed-chip ${gran === 'state' ? 'on' : ''}" data-gran="state">State</button>
        <button class="ed-chip ${gran === 'county' ? 'on' : ''}" data-gran="county">County/Area</button></div>
      <div class="ed-row ed-lbl">Click mode
        <button class="ed-chip ${paint === 'assign' ? 'on' : ''}" data-paint="assign">Assign</button>
        <button class="ed-chip ${paint === 'deselect' ? 'on' : ''}" data-paint="deselect">Deselect</button></div>
      <div class="ed-status">${m.requireAll ? `${unassignedCount()} areas unassigned` : 'partial mode (publish anytime)'}</div>
      <div class="ed-tree">${m.nodes.map((n) => nodeRow(n, [n.id], 1)).join('') || '<div class="ed-status">No areas yet.</div>'}</div>
      <div class="ed-row"><input id="ed-add-name" class="ed-input" placeholder="${selPath.length ? 'New subset name' : 'New area (tier 1) name'}" />
        <button class="ed-btn" id="ed-add">Add</button></div>`;

    el.querySelector('#ed-exit').onclick = exit;
    el.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = () => { cur = b.dataset.mode; selPath = []; renderSidebar(); recolor(); }));
    el.querySelector('#ed-newmode').onclick = () => { el.querySelector('#ed-newmode-form').style.display = 'block'; el.querySelector('#ed-mode-name').focus(); };
    const mkMode = (all) => {
      const name = el.querySelector('#ed-mode-name').value.trim();
      if (!name || modes[name]) return flash('Give the mode a unique name.', 'warn');
      modes[name] = newMode(name, all);
      cur = name; selPath = [];
      renderSidebar(); recolor();
    };
    el.querySelector('#ed-mk-all').onclick = () => mkMode(true);
    el.querySelector('#ed-mk-some').onclick = () => mkMode(false);
    el.querySelector('#ed-save').onclick = saveDraft;
    el.querySelector('#ed-load').onclick = () => {
      const box = el.querySelector('#ed-drafts');
      box.style.display = 'block';
      box.innerHTML = draftNames().map((n) => `<button class="ed-chip" data-draft="${esc(n)}">${esc(n)}</button>`).join('') || '<div class="ed-status">No drafts.</div>';
      box.querySelectorAll('[data-draft]').forEach((b) => (b.onclick = () => loadDraft(b.dataset.draft)));
    };
    el.querySelector('#ed-import').onclick = async () => {
      const box = el.querySelector('#ed-drafts');
      box.style.display = 'block';
      box.innerHTML = '<div class="ed-status">Reading content/ ...</div>';
      const names = await publishedNames();
      box.innerHTML = names.length
        ? '<div class="ed-status">Published in content/</div>'
          + names.map((n) => `<button class="ed-chip" data-pub="${esc(n)}">${esc(n)}</button>`).join('')
        : '<div class="ed-status">Nothing published yet (or the server is not running).</div>';
      box.querySelectorAll('[data-pub]').forEach((b) => (b.onclick = () => importPublished(b.dataset.pub)));
    };
    el.querySelector('#ed-publish').onclick = publish;
    el.querySelectorAll('[data-gran]').forEach((b) => (b.onclick = () => { gran = b.dataset.gran; renderSidebar(); }));
    el.querySelectorAll('[data-paint]').forEach((b) => (b.onclick = () => { paint = b.dataset.paint; renderSidebar(); }));
    el.querySelectorAll('[data-sel]').forEach((b) => (b.onclick = () => {
      const p = findPath(m.nodes, b.dataset.sel).map((n) => n.id);
      selPath = selPath[selPath.length - 1] === b.dataset.sel ? [] : p; // click again to unselect
      renderSidebar(); recolor();
    }));
    el.querySelectorAll('[data-addsub]').forEach((b) => (b.onclick = () => {
      selPath = findPath(m.nodes, b.dataset.addsub).map((n) => n.id);
      renderSidebar();
      el.querySelector('#ed-add-name').focus();
    }));
    el.querySelectorAll('[data-del]').forEach((b) => (b.onclick = () => {
      const id = b.dataset.del;
      const strip = (nodes) => { const i = nodes.findIndex((n) => n.id === id); if (i >= 0) nodes.splice(i, 1); else nodes.forEach((n) => strip(n.children)); };
      strip(m.nodes);
      for (const [a, p] of Object.entries(m.assign)) { const i = p.indexOf(id); if (i === 0) delete m.assign[a]; else if (i > 0) m.assign[a] = p.slice(0, i); }
      if (selPath.includes(id)) selPath = [];
      renderSidebar(); recolor();
    }));
    const addIt = () => {
      const name = el.querySelector('#ed-add-name').value.trim();
      if (!name) return;
      const node = { id: nid(), name, children: [] };
      const parent = nodeByPath(selPath);
      if (parent) parent[parent.length - 1].children.push(node);
      else m.nodes.push(node);
      selPath = [...selPath, node.id]; // select it so painting starts immediately
      renderSidebar(); recolor();
    };
    el.querySelector('#ed-add').onclick = addIt;
    el.querySelector('#ed-add-name').onkeydown = (e) => { if (e.key === 'Enter') addIt(); };
  }

  /* ---- enter / exit ---- */
  function enter() {
    if (!modes) defaults();
    if (!areasByState) buildStateIndex();
    patchLeaderboard();
    active = true;
    document.getElementById('btn-editor').textContent = 'Exit map editor';
    deselect();
    setMode('counties');
    renderSidebar();
    recolor();
  }
  function exit() {
    active = false;
    document.getElementById('btn-editor').textContent = 'Enter map editor';
    if (typeof Leaderboard !== 'undefined') Leaderboard.refresh();
    recolor();
  }

  /*
   * While the editor is active the leaderboard must not overwrite the sidebar it
   * is drawing into.
   *
   * Patched on first ENTER, not at load. This ran at the top level, which made
   * editor.js silently depend on leaderboard.js having been evaluated first — it
   * happens to be true in index.html and is not true anywhere else, so loading
   * editor.js on its own threw `Leaderboard is not defined` and the whole module
   * failed to define. The wrapper only has a job while the editor is open, so
   * that is when it is installed.
   */
  let refreshPatched = false;
  function patchLeaderboard() {
    if (refreshPatched || typeof Leaderboard === 'undefined') return;
    const origRefresh = Leaderboard.refresh;
    Leaderboard.refresh = (...a) => { if (!active) origRefresh(...a); };
    refreshPatched = true;
  }

  return {
    isActive: () => active, enter, exit, toggle: () => (active ? exit() : enter()),
    color, onClick, onHover,
    // The content round-trip, exposed so the suite can drive it without a DOM.
    publish, publishedNames, importPublished,
  };
})();
