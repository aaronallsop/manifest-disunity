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
 * blocked until every Area is assigned) plus user-created modes. Save/Load are
 * localStorage drafts; Publish downloads <name>.mapmode.json to apply later.
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
  const memberCount = (id) => Object.values(modes[cur].assign).filter((p) => p.includes(id)).length;

  /* ---- painting ---- */
  function unitAreas(fips) {
    const aid = Game.areaIdOf(fips);
    if (gran === 'county') return [aid];
    const st = Game.county[aid].st;
    return Object.keys(Game.county).filter((a) => Game.county[a].st === st);
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
  function color(fips) {
    const aid = Game.areaIdOf(fips);
    const path = modes[cur].assign[aid];
    const selId = selPath.length ? selPath[selPath.length - 1] : null;
    if (!path) return selId ? '#242a31' : UNASSIGNED;
    const rootIdx = modes[cur].nodes.findIndex((n) => n.id === path[0]);
    let c = PALETTE[(rootIdx + PALETTE.length) % PALETTE.length];
    c = d3.interpolateRgb(c, '#ffffff')(0.22 * (path.length - 1)); // deeper tier = lighter
    if (selId && !path.includes(selId)) c = d3.interpolateRgb(c, '#242a31')(0.75); // dim others
    return c;
  }

  /* ---- map events (routed from app.js) ---- */
  const onClick = (d) => paintUnit(d.id);
  function onHover(d) {
    const feats = unitAreas(d.id).map((a) => areaFeature(a));
    store.hoverShape.attr('d', store.path({ type: 'FeatureCollection', features: feats.flatMap((f) => (f.type === 'FeatureCollection' ? f.features : [f])) })).style('display', null);
  }

  /* ---- publish / drafts ---- */
  function unassignedCount() {
    return Object.keys(Game.county).filter((a) => !modes[cur].assign[a]).length;
  }
  function publish() {
    const m = modes[cur];
    const missing = unassignedCount();
    if (m.requireAll && missing) return flash(`Cannot publish: ${missing} areas are still unassigned.`, 'bad');
    const blob = new Blob([JSON.stringify({ type: 'ns-mapmode', ...m }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${m.name.toLowerCase().replace(/\W+/g, '-')}.mapmode.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    flash(`\u{1F4E4} Published ${a.download} (check your downloads).`, 'good');
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
      <div class="ed-row"><button class="ed-btn" id="ed-save">Save</button>
        <button class="ed-btn" id="ed-load">Load</button>
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
    Leaderboard.refresh();
    recolor();
  }

  // while the editor is active the leaderboard must not overwrite the sidebar
  const origRefresh = Leaderboard.refresh;
  Leaderboard.refresh = (...a) => { if (!active) origRefresh(...a); };

  return { isActive: () => active, enter, exit, toggle: () => (active ? exit() : enter()), color, onClick, onHover };
})();
