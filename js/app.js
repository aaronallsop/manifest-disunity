/*
 * Nation States - a map game where every U.S. state becomes its own nation.
 *
 * Rendering is driven by Game ownership: each county is filled with its owning
 * nation's color, and the heavy borders are the boundaries between nations. As
 * actions move counties around, the map re-renders from the model.
 */

const WIDTH = 975;
const HEIGHT = 610;

// Connecticut's old counties still live in the base geometry (used only for the
// border mesh). Map each to the planning region that carries its ownership.
const OLD_CT_TO_REGION = {
  '09001': '09190', '09003': '09110', '09005': '09160', '09007': '09130',
  '09009': '09170', '09011': '09180', '09013': '09110', '09015': '09150',
};

const store = {
  mode: 'nations', // 'nations' | 'counties'
  colorMode: 'standard', // 'standard' | 'political' | 'gdp' | 'population'
  data: null,
  topo: null,
  path: null,
  g: null,
  svg: null,
  hoverShape: null,
  selectShape: null,
  actionLayer: null,
  countyPaths: null,
  nationBorders: null,
  countyById: new Map(),
  outlineCache: new Map(),
  selected: null, // { level:'nation'|'county', id }
  rng: null,      // seeded RNG for this session (js/rng.js); serialized in the save
  seed: null,
};

/* ------------------------------------------------------------------ */
/* boot                                                                */
/* ------------------------------------------------------------------ */
async function init() {
  try {
    const [topo, data, ctGeo, adjacency, neighbors, partyDefs, trade, areas, geoMode, economy, transport, cultureMode, tunables] = await Promise.all([
      fetch('data/counties-10m.json').then((r) => r.json()),
      fetch('data/game-data.json').then((r) => r.json()),
      fetch('data/ct-planning-regions.geojson').then((r) => r.json()),
      fetch('data/adjacency.json').then((r) => r.json()),
      fetch('data/county_neighbors.json').then((r) => r.json()).catch(() => ({})),
      fetch('data/parties.json').then((r) => r.json()).catch(() => ({})),
      fetch('data/county_trade.json?v=2').then((r) => r.json()).catch(() => null),
      fetch('data/areas.json').then((r) => r.json()).catch(() => null),
      fetch('data/geographical.mapmode.json').then((r) => r.json()).catch(() => null),
      fetch('data/economy.json').then((r) => r.json()).catch(() => null),
      fetch('data/transport.json').then((r) => r.json()).catch(() => null),
      fetch('data/cultural.mapmode.json').then((r) => r.json()).catch(() => null),
      fetch('content/tunables.json').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);
    // Authored tunable overrides, applied over the schema defaults in js/tunables.js.
    if (tunables) {
      const unknown = TUNE.load(tunables.values || tunables);
      if (unknown.length) console.warn('content/tunables.json: unknown keys ignored:', unknown);
    }
    // Seeded RNG, created before anything draws. Everything downstream takes it
    // explicitly; nothing reads it off a module global.
    store.seed = RNG.newSeed();
    store.rng = RNG.create(store.seed);

    store.data = data;
    store.topo = topo;
    store.areasDef = areas; // the build stamp a save is validated against
    store.neighbors = neighbors; // Census County Adjacency File (fips -> [fips])
    store.trade = trade;         // offline-baked trade attributes (county_trade.json)
    store.transport = transport; // rail / interstates / Canada-Mexico gateways (transport.json)
    Colors.assign(Object.keys(data.states));
    Game.init(data, adjacency, areas);
    const emerged = Parties.setup(partyDefs, store.rng); // setup-only regional party spawns
    MapModes.init(data);
    if (geoMode && geoMode.type === 'ns-mapmode') MapModes.setRegion(geoMode); // published in the editor
    if (cultureMode && cultureMode.type === 'ns-mapmode') MapModes.setCulture(cultureMode);
    if (economy) MapModes.setEconomy(economy); // baked six-sector production values
    if (economy) Market.update(TUNE); // opening market prices
    TurnSystem.begin([...Game.nations.keys()], store.rng);
    if (emerged.length) {
      setTimeout(() => flash(`\u{1F5F3} Regional parties emerged: <strong>${emerged.map(escapeHtml).join('</strong>, <strong>')}</strong>.`, 'warn'), 300);
    }
    Game.onChange(onGameChange);
    buildMap(topo, ctGeo);
    wireControls();
    Leaderboard.refresh();
    renderTurnBanner();
    select('nation', TurnSystem.currentId());
    document.getElementById('loading')?.remove();
  } catch (err) {
    const el = document.getElementById('loading');
    if (el) el.textContent = 'Could not load map data. Run a local server (see README).';
    console.error(err);
  }
}

/* ------------------------------------------------------------------ */
/* map                                                                 */
/* ------------------------------------------------------------------ */
function buildMap(topo, ctGeo) {
  const OLD_CT = new Set(Object.keys(OLD_CT_TO_REGION));
  const countyFeatures = topojson.feature(topo, topo.objects.counties).features.filter((f) => !OLD_CT.has(f.id));
  ctGeo.features.forEach((f) => {
    f.id = f.properties.GEOID;
    f.properties.name = f.properties.NAME;
    // ArcGIS winds rings opposite the GeoJSON spec; reverse so d3 sees small shapes.
    if (d3.geoArea(f) > 2 * Math.PI) {
      const g = f.geometry;
      (g.type === 'MultiPolygon' ? g.coordinates.flat() : g.coordinates).forEach((r) => r.reverse());
    }
    countyFeatures.push(f);
  });
  countyFeatures.forEach((f) => store.countyById.set(f.id, f));

  const projection = d3.geoAlbersUsa().fitSize([WIDTH, HEIGHT], { type: 'FeatureCollection', features: countyFeatures });
  const path = d3.geoPath(projection);
  store.path = path;

  const svg = d3
    .select('#map')
    .append('svg')
    .attr('class', 'usmap')
    .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  store.svg = svg;
  svg.classed('hide-clines', true); // county lines off by default: Areas read as one shape

  svg.append('rect').attr('class', 'bg').attr('width', WIDTH).attr('height', HEIGHT).on('click', onBackgroundClick);

  const g = svg.append('g');
  store.g = g;

  store.countyPaths = g
    .append('g')
    .attr('class', 'counties')
    .selectAll('path')
    .data(countyFeatures)
    .join('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('fill', (d) => fillFor(d.id))
    .on('mousemove', onHover)
    .on('mouseleave', onHoverOut)
    .on('click', onClick);

  // borders between AREAS only (interior county lines of a merged Area omitted);
  // shown instead of per-county strokes when county lines are toggled off
  g.append('path')
    .attr('class', 'area-borders')
    .attr('d', path(topojson.mesh(topo, topo.objects.counties, (a, b) => a !== b && Game.areaIdOf(a.id) !== Game.areaIdOf(b.id))));

  store.nationBorders = g.append('path').attr('class', 'nation-borders');
  g.append('path')
    .attr('class', 'nation-outline')
    .attr('d', path(topojson.mesh(topo, topo.objects.states, (a, b) => a === b)));

  // cultural-highlight layer: nested super / region / sub-region outlines
  const cl = g.append('g').attr('class', 'culture-highlight');
  store.cSuper = cl.append('path').attr('class', 'c-super').style('display', 'none');
  store.cRegion = cl.append('path').attr('class', 'c-region').style('display', 'none');
  store.cSub = cl.append('path').attr('class', 'c-sub').style('display', 'none');

  store.actionLayer = g.append('g').attr('class', 'action-layer');
  store.hoverShape = g.append('path').attr('class', 'hover-shape').style('display', 'none');
  store.selectShape = g.append('path').attr('class', 'select-shape').style('display', 'none');

  redrawBorders();

  const zoom = d3
    .zoom()
    .scaleExtent([1, 9])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .on('zoom', (e) => g.attr('transform', e.transform));
  svg.call(zoom).on('dblclick.zoom', null);
}

/* owner of a base-geometry county id (handles old-CT proxy counties) */
function meshOwner(id) {
  return Game.getOwner(OLD_CT_TO_REGION[id] || id);
}

/* merged outline of a nation (cached; invalidated on every mutation) */
function nationOutline(nid) {
  if (store.outlineCache.has(nid)) return store.outlineCache.get(nid);
  const geoms = store.topo.objects.counties.geometries.filter((gm) => gm.id && meshOwner(gm.id) === nid);
  const feat = geoms.length ? topojson.merge(store.topo, geoms) : null;
  store.outlineCache.set(nid, feat);
  return feat;
}

function redrawBorders() {
  store.nationBorders.attr(
    'd',
    store.path(topojson.mesh(store.topo, store.topo.objects.counties, (a, b) => meshOwner(a.id) !== meshOwner(b.id)))
  );
}

function fillFor(fips) {
  if (typeof Editor !== 'undefined' && Editor.isActive()) return Editor.color(fips);
  return MapModes.color(store.colorMode, fips);
}
function recolor() {
  store.countyPaths.attr('fill', (d) => fillFor(d.id));
}

function setColorMode(mode) {
  store.colorMode = mode;
  document.querySelectorAll('.color-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.color === mode));
  const legend = document.getElementById('legend');
  const html = MapModes.legend(mode);
  legend.innerHTML = html;
  legend.classList.toggle('show', !!html);
  recolor();
  // entering/leaving Culture mode: drop a stale county/nation or culture selection
  if (mode === 'cultural') {
    if (store.selected && store.selected.level !== 'culture') deselect();
    store.cultureGran = store.cultureGran || 'sub';
    const bar = `<div class="cult-gran"><span>Select:</span>` +
      [['super', 'Super region'], ['region', 'Region'], ['sub', 'Sub-region']]
        .map(([g, label]) => `<button data-gran="${g}" class="${store.cultureGran === g ? 'on' : ''}">${label}</button>`).join('') +
      `</div>`;
    legend.insertAdjacentHTML('afterbegin', bar);
    legend.classList.add('show');
    legend.querySelectorAll('[data-gran]').forEach((b) => (b.onclick = () => {
      store.cultureGran = b.dataset.gran;
      legend.querySelectorAll('[data-gran]').forEach((x) => x.classList.toggle('on', x === b));
      if (store.selected && store.selected.level === 'culture') {
        const anc = cultureAncestry(store.selected.id);
        const idx = { super: 0, region: 1, sub: 2 }[store.cultureGran];
        if (anc[Math.min(idx, anc.length - 1)]) selectCulture(anc[Math.min(idx, anc.length - 1)]);
      }
    }));
  } else if (store.selected && store.selected.level === 'culture') {
    deselect();
  }
  updateCultureHighlight();
}

/* nested super/region/sub-region outlines when a county is picked in Culture mode */
const cultureOutlineCache = new Map();
function cultureMembers(nodeId) {
  const c = MapModes.getCulture();
  const areas = (c && c.nodeAreas[nodeId]) || [];
  const out = [];
  for (const a of areas) for (const m of Game.areaCounties(a)) out.push(m);
  return out;
}
function cultureOutline(nodeId) {
  if (cultureOutlineCache.has(nodeId)) return cultureOutlineCache.get(nodeId);
  const set = new Set(cultureMembers(nodeId));
  const feat = topojson.merge(store.topo, store.topo.objects.counties.geometries.filter((g) => set.has(g.id)));
  cultureOutlineCache.set(nodeId, feat);
  return feat;
}
/* ancestry (root..node) and children of a cultural node */
function cultureAncestry(nodeId) {
  const c = MapModes.getCulture();
  const someArea = (c && c.nodeAreas[nodeId] || [])[0];
  const full = (c && c.def.assign[someArea]) || [];
  const i = full.indexOf(nodeId);
  return i >= 0 ? full.slice(0, i + 1) : [nodeId];
}
function findCultureNode(nodeId, nodes) {
  nodes = nodes || (MapModes.getCulture() || {}).def.nodes || [];
  for (const n of nodes) {
    if (n.id === nodeId) return n;
    const r = findCultureNode(nodeId, n.children);
    if (r) return r;
  }
  return null;
}
function cultureNodeAt(fips) {
  const c = MapModes.getCulture();
  const p = (c && c.def.assign[Game.areaIdOf(fips)]) || [];
  if (!p.length) return null;
  const idx = { super: 0, region: 1, sub: 2 }[store.cultureGran || 'sub'];
  return p[Math.min(idx, p.length - 1)];
}

// selection is the cultural NODE itself (not a county/nation)
function selectCulture(nodeId) {
  if (!nodeId) return;
  store.selected = { level: 'culture', id: nodeId };
  const anc = cultureAncestry(nodeId);
  setSelectOutline(cultureOutline(nodeId));
  const ctx = (layer, id) => (id && id !== nodeId
    ? layer.attr('d', store.path(cultureOutline(id))).style('display', null)
    : layer.style('display', 'none'));
  ctx(store.cSuper, anc[0]);   // parent super-region for context
  ctx(store.cRegion, anc[1]);  // parent region for context
  store.cSub.style('display', 'none');
  renderCultureNodePanel(nodeId);
  Leaderboard.setSelected(null);
}
function clearCultureHighlight() {
  [store.cSuper, store.cRegion, store.cSub].forEach((l) => l && l.style('display', 'none'));
}
function updateCultureHighlight() {
  if (store.colorMode === 'cultural' && store.selected && store.selected.level === 'culture') selectCulture(store.selected.id);
  else clearCultureHighlight();
}

/* right-panel info for a selected cultural node: aggregated pop, GDP, politics,
   trade/transport, its parent chain, and the child regions it contains */
function renderCultureNodePanel(nodeId) {
  const c = MapModes.getCulture();
  if (!c) return;
  const anc = cultureAncestry(nodeId);
  const tier = ['Super region', 'Region', 'Sub-region'][anc.length - 1] || 'Region';
  const node = findCultureNode(nodeId);
  const areaIds = c.nodeAreas[nodeId] || [];
  const members = cultureMembers(nodeId);
  const demo = Game.demographics(members);

  let ports = 0, canada = 0, mexico = 0, coastal = 0, lakes = 0, railHubs = 0;
  const inter = new Set();
  for (const aid of areaIds) {
    const ex = areaExport(aid);
    if (ex.port) ports++; if (ex.canada) canada++; if (ex.mexico) mexico++;
    for (const m of Game.areaCounties(aid)) {
      const tr = store.trade && store.trade.counties[m];
      if (tr) { if (tr.coastal) coastal++; if (tr.great_lakes) lakes++; }
      const x = store.transport && store.transport.counties[m];
      if (x) { if (x.rail_hub) railHubs++; (x.interstates || []).forEach((i) => inter.add(i)); }
    }
  }
  const chips = [];
  if (ports) chips.push(`&#9875; ${ports} ${ports === 1 ? 'port' : 'ports'}`);
  if (canada) chips.push(`&#128678; Canada &times;${canada}`);
  if (mexico) chips.push(`&#128678; Mexico &times;${mexico}`);
  if (coastal) chips.push(`&#127754; ${coastal} coastal`);
  if (lakes) chips.push(`&#127756; ${lakes} Great Lakes`);
  if (railHubs) chips.push(`&#128649; ${railHubs} rail hub${railHubs === 1 ? '' : 's'}`);
  if (inter.size) chips.push(`&#128664; ${inter.size} interstates`);
  if (!chips.length) chips.push('Interior &mdash; no major trade access');

  const crumb = anc.map((id, i) => (i === anc.length - 1
    ? `<strong>${escapeHtml(c.names[id])}</strong>`
    : `<button class="linklike" data-node="${id}">${escapeHtml(c.names[id])}</button>`)).join(' &rsaquo; ');
  const kids = ((node && node.children) || []).map((k) => {
    const kp = Game.demographics(cultureMembers(k.id)).pop;
    return `<button class="cult-child" data-node="${k.id}"><span class="cult-sw" style="background:${c.colorByNode[k.id]}"></span>
      <span class="cult-name">${escapeHtml(k.name)}</span><span class="cult-fig">${fmtPop(kp)}</span></button>`;
  }).join('');

  const panel = document.getElementById('panel');
  panel.innerHTML = `
    <div class="card-head"><span class="swatch" style="background:${c.colorByNode[nodeId]}"></span><h2>${escapeHtml(c.names[nodeId])}</h2></div>
    <div class="kind">${tier} &middot; ${areaIds.length} areas &middot; ${members.length} counties</div>
    <div class="cult-crumbs">${crumb}</div>
    <div class="stat"><div class="label">Population</div><div class="value">${fmtPop(demo.pop)}</div></div>
    <div class="stat"><div class="label">GDP</div><div class="value">${fmtGdp(demo.gdp)}</div></div>
    <div class="stat"><div class="label">Political leaning</div>${renderPolitics(demo)}</div>
    <div class="stat"><div class="label">Trade &amp; transport</div><div class="trade-chips">${chips.map((x) => `<span class="chip">${x}</span>`).join('')}</div></div>
    ${kids ? `<div class="stat"><div class="label">Contains</div><div class="cult-children">${kids}</div></div>` : ''}
  `;
  panel.querySelectorAll('[data-node]').forEach((b) => (b.onclick = () => selectCulture(b.dataset.node)));
}

/* Which map modes depend on which kind of change. Standard mode paints owner
   colours, so it moves only when ownership does; the value modes paint per-Area
   numbers, so they move only when values do; the authored modes are static. */
const MODE_DEPENDS = {
  standard: 'ownership',
  political: 'values',
  gdp: 'values',
  population: 'values',
  geographic: null,
  cultural: null,
  economy: null,
};

/* called after any change to the model, with the reason Game.emit reported */
let gameChangeCount = 0; // instrumentation: window.__renderCount() reads it
function onGameChange(reason) {
  const r = reason || { ownership: true, values: true, roster: true };
  gameChangeCount++;

  if (r.roster) TurnSystem.sync();
  if (r.ownership) {
    store.outlineCache.clear();
    redrawBorders();
  }
  const dep = MODE_DEPENDS[store.colorMode];
  if (dep && r[dep]) recolor();
  if (r.ownership || r.values || r.roster) Leaderboard.refresh();
  if (r.roster) renderTurnBanner();

  if (store.selected) {
    if (store.selected.level === 'nation' && !Game.getNation(store.selected.id)) {
      deselect();
    } else {
      select(store.selected.level, store.selected.id);
    }
  }
}
window.__renderCount = () => gameChangeCount;
window.__resetRenderCount = () => { gameChangeCount = 0; };

/* ------------------------------------------------------------------ */
/* interaction (dispatches to Actions when an action is running)       */
/* ------------------------------------------------------------------ */
/* the clickable unit is the Area: one feature, or the merged member features */
function areaFeature(id) {
  const members = Game.areaCounties(id);
  if (members.length === 1) return store.countyById.get(members[0]);
  const set = new Set(members);
  return topojson.merge(store.topo, store.topo.objects.counties.geometries.filter((g) => set.has(g.id)));
}

function onHover(event, d) {
  if (Editor.isActive()) return Editor.onHover(d);
  if (Actions.isActive()) return Actions.onHover(d);
  if (store.colorMode === 'cultural' && MapModes.getCulture()) {
    const nid = cultureNodeAt(d.id);
    if (nid === store.cultureHoverId) return;
    store.cultureHoverId = nid;
    if (nid) store.hoverShape.attr('d', store.path(cultureOutline(nid))).style('display', null);
    else store.hoverShape.style('display', 'none');
    return;
  }
  if (store.mode === 'nations') {
    const nid = Game.getOwner(d.id);
    if (nid) store.hoverShape.attr('d', store.path(nationOutline(nid))).style('display', null);
  } else {
    store.hoverShape.attr('d', store.path(areaFeature(d.id))).style('display', null);
  }
}
function onHoverOut() {
  if (Actions.isActive()) return;
  store.cultureHoverId = null;
  store.hoverShape.style('display', 'none');
}
function onClick(event, d) {
  if (Editor.isActive()) return Editor.onClick(d);
  if (Actions.isActive()) return Actions.onClick(d);
  if (store.colorMode === 'cultural' && MapModes.getCulture()) return selectCulture(cultureNodeAt(d.id));
  if (store.mode === 'nations') {
    const nid = Game.getOwner(d.id);
    if (nid) select('nation', nid);
  } else {
    select('county', Game.areaIdOf(d.id));
  }
}
function onBackgroundClick() {
  if (Actions.isActive()) return;
  deselect();
}

/* ------------------------------------------------------------------ */
/* selection                                                           */
/* ------------------------------------------------------------------ */
function select(level, id) {
  if (level === 'culture') return selectCulture(id);
  store.selected = { level, id };
  const feat = level === 'nation' ? nationOutline(id) : areaFeature(id);
  if (feat) store.selectShape.attr('d', store.path(feat)).style('display', null);
  else store.selectShape.style('display', 'none');
  if (level === 'nation') renderNationPanel(id);
  else renderCountyPanel(id);
  updateCultureHighlight();
  Leaderboard.setSelected(level === 'nation' ? id : null);
}

function deselect() {
  store.selected = null;
  store.selectShape.style('display', 'none');
  store.hoverShape.style('display', 'none');
  updateCultureHighlight();
  renderPlaceholder();
  Leaderboard.setSelected(null);
}

function setSelectOutline(feature) {
  if (feature) store.selectShape.attr('d', store.path(feature)).style('display', null);
  else store.selectShape.style('display', 'none');
}

/* ------------------------------------------------------------------ */
/* controls                                                            */
/* ------------------------------------------------------------------ */
function wireControls() {
  document.querySelectorAll('.toggle button[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
  document.querySelectorAll('.color-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => setColorMode(btn.dataset.color));
  });
  document.getElementById('btn-editor').addEventListener('click', () => {
    // The editor takes click priority over an in-flight action, and exiting it
    // leaves that action's stale Sets live (finding 48). Gate it.
    if (Actions.isActive()) return flash('Finish or cancel the current action first.', 'warn');
    Editor.toggle();
  });
  // county-lines toggle (off by default: merged Areas render as one shape)
  const clines = document.getElementById('btn-clines');
  clines.addEventListener('click', () => {
    const show = !clines.classList.contains('active');
    clines.classList.toggle('active', show);
    store.svg.classed('hide-clines', !show);
  });
}

function setMode(mode) {
  if (mode === store.mode || Actions.isActive()) return;
  store.mode = mode;
  document.querySelectorAll('.toggle button').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  onHoverOut();
  if (store.selected) {
    if (mode === 'nations' && store.selected.level === 'county') select('nation', Game.getOwner(store.selected.id));
    else if (mode === 'counties' && store.selected.level === 'nation') deselect();
  }
}

/* toast for action results */
function flash(html, kind = '') {
  let el = document.getElementById('toast');
  el.className = 'toast show ' + kind;
  el.innerHTML = html;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => (el.className = 'toast'), 6000);
}

/* ------------------------------------------------------------------ */
/* turns                                                               */
/* ------------------------------------------------------------------ */
function renderTurnBanner() {
  const bar = document.getElementById('turnbar');
  const id = TurnSystem.currentId();
  const n = Game.getNation(id);
  if (!n) { bar.innerHTML = ''; return; }
  const p = TurnSystem.progress();
  bar.innerHTML = `
    <span class="tb-label">Round ${p.round} &middot; ${p.index}/${p.total}</span>
    <button class="tb-current" id="tb-jump"><span class="dot" style="background:${n.color}"></span>
      <strong>${escapeHtml(n.name)}</strong>'s turn</button>
    <span class="tb-label">&middot; World turn <strong id="world-turn">${World.getTurn()}</strong></span>
    <button class="tb-pass" id="tb-advance" style="margin-left:0">Advance world &#9193;</button>
    <button class="tb-pass" id="tb-pass">Pass turn &#9197;</button>`;
  document.getElementById('tb-jump').onclick = () => { if (!Actions.isActive()) { setMode('nations'); select('nation', TurnSystem.currentId()); } };
  document.getElementById('tb-advance').onclick = () => {
    // Advancing the world re-renders the nation panel with live action buttons,
    // letting an action be restarted on top of itself and losing the stashed
    // colour mode (finding 37).
    if (Actions.isActive()) return flash('Finish or cancel the current action first.', 'warn');
    World.advanceTurn(TUNE); // emits once, from inside its own batch
  };
  document.getElementById('tb-pass').onclick = passTurn;
}

/* advance to the next nation after the current one has acted (or passed) */
function completeTurn() {
  const beforeRound = TurnSystem.progress().round;
  const next = TurnSystem.endTurn();
  if (TurnSystem.progress().round > beforeRound) {
    Game.growAll(0.05); // end of a full cycle: everyone grows ~5%
    flash(`📈 Round ${TurnSystem.progress().round}: every nation grew ~5% (new residents follow each nation's own party mix).`, '');
  }
  renderTurnBanner();
  if (next && Game.getNation(next)) { setMode('nations'); select('nation', next); }
  else deselect();
}

function passTurn() {
  if (Actions.isActive()) return;
  completeTurn();
}

/* ------------------------------------------------------------------ */
/* info panel                                                          */
/* ------------------------------------------------------------------ */
function renderNationPanel(nid) {
  const n = Game.getNation(nid);
  if (!n) return renderPlaceholder();
  const demo = Game.nationDemographics(nid);
  const sub = n.origin ? 'Sovereign nation &middot; former U.S. state' : 'Sovereign nation &middot; formed during play';
  const isTurn = nid === TurnSystem.currentId();
  const currentName = Game.getNation(TurnSystem.currentId())?.name || '';
  const actionsHtml = isTurn
    ? `<div class="actions">
        <div class="label">Actions &middot; your move</div>
        <button class="act" data-act="unite">🤝 Unite with nation</button>
        <button class="act" data-act="annex">⚔️ Annex counties</button>
        <button class="act" data-act="trade">🚛 Trade with nation</button>
        <button class="act" data-act="release" disabled title="Coming next">🕊️ Release counties</button>
        <button class="act pass" data-act="pass">⏭ Pass turn</button>
      </div>`
    : `<div class="actions">
        <div class="label">Actions</div>
        <div class="locked-note">Not this nation's turn &mdash; it's <strong>${escapeHtml(currentName)}</strong>'s.
          <button class="linklike" id="goto-current">Go to them &rarr;</button></div>
      </div>`;
  const panel = document.getElementById('panel');
  panel.innerHTML = `
    <div class="card-head">
      <span class="swatch" style="background:${n.color}"></span>
      <h2>${escapeHtml(n.name)}</h2>
    </div>
    <div class="kind">${sub} &middot; ${n.counties.size} counties</div>

    <div class="stat"><div class="label">Population</div><div class="value">${fmtPop(demo.pop)}</div></div>
    <div class="stat"><div class="label">GDP</div><div class="value">${fmtGdp(demo.gdp)}</div></div>
    ${renderTreasury(nid)}
    <div class="stat">
      <div class="label">Political leaning</div>
      ${renderPolitics(demo)}
    </div>
    ${renderNationEconomy(nid)}
    ${renderExportAccess(nid)}

    ${actionsHtml}
    ${renderSources('nation')}
  `;
  panel.querySelectorAll('.act').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.hasAttribute('disabled')) return;
      if (b.dataset.act === 'pass') passTurn();
      else Actions.start(b.dataset.act, nid);
    })
  );
  const goto = panel.querySelector('#goto-current');
  if (goto) goto.onclick = () => { setMode('nations'); select('nation', TurnSystem.currentId()); };
}

function renderCountyPanel(fips) {
  const rec = store.data.counties[fips];
  const ownerId = Game.getOwner(fips);
  const ownerName = Game.getNation(ownerId)?.name || 'an unknown nation';
  const members = Game.areaCounties(fips);
  const name = Game.area(fips)?.name || (rec ? rec.name : store.countyById.get(fips)?.properties.name || fips);
  const color = Game.colorForCounty(fips);
  const pol = Game.leanOf(fips);
  const panel = document.getElementById('panel');
  panel.innerHTML = `
    <div class="card-head">
      <span class="swatch" style="background:${color}"></span>
      <h2>${escapeHtml(name)}</h2>
    </div>
    <div class="kind">${members.length > 1 ? `Area &middot; ${members.length} counties` : 'County'} &middot; part of <span class="nation-of">${escapeHtml(ownerName)}</span></div>

    <div class="stat"><div class="label">Population</div><div class="value">${fmtPop(Game.countyPop(fips))}${estTag(rec, 'p')}</div></div>
    <div class="stat"><div class="label">GDP</div><div class="value">${fmtGdp(Game.countyGdp(fips))}${estTag(rec, 'g')}</div></div>
    <div class="stat">
      <div class="label">Political leaning</div>
      ${renderPolitics(pol, rec)}
    </div>
    ${renderEconomy(fips)}
    ${renderCulture(fips)}
    ${renderGeography(fips)}
    ${renderTrade(fips)}
    ${renderNeighbors(fips)}
    ${renderEstNote(rec)}
    ${renderSources('county')}
  `;
}

/* treasury: spendable balance, ticked each world turn (income − maintenance) */
function renderTreasury(nid) {
  const n = Game.getNation(nid);
  const flow = Game.treasuryFlow(nid);
  if (!n || !flow) return '';
  const sign = (v) => `<strong class="${v >= 0 ? 'surplus' : 'deficit'}">${v >= 0 ? '+' : '&minus;'}${fmtGdp(Math.abs(v))}</strong>`;
  const bal = `${n.treasury < 0 ? '&minus;' : ''}${fmtGdp(Math.abs(n.treasury))}`;
  return `<div class="stat"><div class="label">Treasury &middot; ${escapeHtml(n.gov)}</div>
    <div class="value">${bal}</div>
    <div class="geo-row"><span>Per turn (income &minus; maintenance)</span>${sign(flow.delta)}</div>
    <div class="geo-row"><span>Income ${fmtGdp(flow.income)} &middot; maintenance ${fmtGdp(flow.maintenance)}</span></div>
  </div>`;
}

/* nation economy: sum of Area production minus internal consumption. Each Area
   demands resources in a fixed mix (share of its gross output); a nation's
   per-resource surplus/deficit is production minus that demand. Display-only.
   The mix itself is TUNE 'market.demandShare' — it used to be a const declared
   HERE, in the renderer, and read by market.js, which worked only because of
   script order. */
function renderNationEconomy(nid) {
  const e = MapModes.getEconomy();
  if (!e) return '';
  const DEMAND_SHARE = TUNE.get('market.demandShare');
  const prod = [0, 0, 0, 0, 0, 0];
  for (const aid of Game.getNation(nid).counties) {
    const a = e.areas[aid];
    if (a) a.v.forEach((v, i) => { prod[i] += v; });
  }
  const gross = prod.reduce((s, v) => s + v, 0);
  if (!gross) return '';
  const surplus = prod.map((p, i) => p - DEMAND_SHARE[i] * gross);
  const net = gross - DEMAND_SHARE.reduce((s, d) => s + d, 0) * gross;
  const rows = e.sectors
    .map((s, i) => ({ s, i, d: surplus[i] }))
    .sort((x, y) => y.d - x.d)
    .map(({ s, i, d }) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[i]}"></i>${s}</span>
      <strong class="${d >= 0 ? 'surplus' : 'deficit'}">${d >= 0 ? '+' : '&minus;'}${fmtGdp(Math.abs(d) * 1e6)}</strong></div>`)
    .join('');
  return `<div class="stat"><div class="label">Economy &middot; GDP after internal consumption</div>
    <div class="value">${fmtGdp(net * 1e6)}</div>
    <div class="label" style="margin-top:8px">Resource surplus / deficit</div>${rows}</div>`;
}

/* six-sector production values from the baked economy.json */
function renderEconomy(fips) {
  const e = MapModes.getEconomy();
  const a = e && e.areas[Game.areaIdOf(fips)];
  if (!a) return '';
  const rows = e.sectors
    .map((s, i) => ({ s, i, v: a.v[i] }))
    .sort((x, y) => y.v - x.v)
    .map(({ s, i, v }) => `<div class="geo-row ${i === a.d ? 'econ-dom' : ''}">
      <span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[i]}"></i>${s}</span>
      <strong>${fmtGdp(v * 1e6)}</strong></div>`)
    .join('');
  return `<div class="stat"><div class="label">Economy &middot; dominant: ${escapeHtml(e.sectors[a.d])}</div>${rows}</div>`;
}

/* geography tiers from the published editor map mode */
/* cultural tiers for a county: sub-region / region / super-region, each with the
   aggregated pop, GDP and lean of every area that shares that cultural node */
function renderCulture(fips) {
  const c = MapModes.getCulture();
  if (!c) return '';
  const path = c.def.assign[Game.areaIdOf(fips)];
  if (!path || !path.length) return '';
  const tiers = [
    { label: 'Sub-region', id: path[2] },
    { label: 'Region', id: path[1] },
    { label: 'Super region', id: path[0] },
  ].filter((t) => t.id);
  const rows = tiers.map((t) => {
    const d = Game.demographics(cultureMembers(t.id));
    const lean = d.lean === 'D' ? `D+${Math.abs(d.dem - d.gop).toFixed(0)}` : `R+${Math.abs(d.dem - d.gop).toFixed(0)}`;
    return `<div class="cult-row"><span class="cult-sw" style="background:${c.colorByNode[t.id]}"></span>
      <span class="cult-name"><em>${t.label}</em> ${escapeHtml(c.names[t.id])}</span>
      <span class="cult-fig">${fmtPop(d.pop)} &middot; ${fmtGdp(d.gdp)} &middot; <b class="${d.lean === 'D' ? 'dem' : 'gop'}">${lean}</b></span></div>`;
  }).join('');
  return `<div class="stat"><div class="label">Cultural region</div>${rows}</div>`;
}

function renderGeography(fips) {
  const r = MapModes.getRegion();
  if (!r) return '';
  const p = r.def.assign[Game.areaIdOf(fips)] || [];
  const row = (label, id) => `<div class="geo-row"><span>${label}</span><strong>${id ? escapeHtml(r.names[id]) : '&mdash;'}</strong></div>`;
  return `<div class="stat"><div class="label">Geography</div>
    ${row('Super region', p[0])}${row('Region', p[1])}${row('Area', p[2])}</div>`;
}

function renderExportAccess(nid) {
  if (!store.transport && !store.trade) return '';
  const acc = nationExportAccess(nid);
  const bits = [];
  if (acc.ports) bits.push(`${acc.ports} ${acc.ports === 1 ? 'port' : 'ports'}`);
  if (acc.canada) bits.push(`Canada &times;${acc.canada}`);
  if (acc.mexico) bits.push(`Mexico &times;${acc.mexico}`);
  const line = acc.any
    ? `&#127758; International market access: ${bits.join(' &middot; ')}`
    : '&#9940; Landlocked &mdash; no export points (no port or border gateway)';
  return `<div class="stat"><div class="label">Export access</div>
    <div class="trade-chips"><span class="chip">${line}</span></div></div>`;
}

/* export points: an Area with a port, or a Canada/Mexico border gateway */
function areaExport(fips) {
  const members = Game.areaCounties(fips);
  const t = store.trade, x = store.transport;
  return {
    port: !!(t && t.counties && members.some((m) => t.counties[m]?.has_port)),
    canada: !!(x && members.some((m) => x.external.Canada.includes(m))),
    mexico: !!(x && members.some((m) => x.external.Mexico.includes(m))),
  };
}
function nationExportAccess(nid) {
  const acc = { ports: 0, canada: 0, mexico: 0 };
  for (const aid of Game.getNation(nid).counties) {
    const e = areaExport(aid);
    if (e.port) acc.ports++;
    if (e.canada) acc.canada++;
    if (e.mexico) acc.mexico++;
  }
  acc.any = acc.ports + acc.canada + acc.mexico > 0;
  return acc;
}

// best transport corridor across the border between two nations: rail > highway
function transitLink(fromNid, throughNid) {
  const x = store.transport;
  if (!x) return null;
  const rail = (aid) => Game.areaCounties(aid).some((m) => x.counties[m] && x.counties[m].rail);
  const hwy = (aid) => Game.areaCounties(aid).some((m) => x.counties[m] && (x.counties[m].interstates || []).length);
  let highway = false;
  for (const aid of Game.getNation(fromNid).counties) {
    const r = rail(aid), h = hwy(aid);
    if (!r && !h) continue;
    for (const nb of Game.countyNeighbors(aid)) {
      if (Game.getOwner(nb) !== throughNid) continue;
      if (r && rail(nb)) return 'rail'; // best possible link
      if (h && hwy(nb)) highway = true;
    }
  }
  return highway ? 'highway' : null;
}

/* trade attributes from the offline-baked county_trade.json */
function renderTrade(fips) {
  const t = store.trade;
  if (!t || !t.counties) return '';
  // union the trade attributes across the Area's member counties
  const allMembers = Game.areaCounties(fips);
  const members = allMembers.filter((m) => t.counties[m]);
  const any = (k) => members.some((m) => t.counties[m][k]);
  const chips = [];
  if (any('has_port')) chips.push('&#9875; Port');
  if (any('coastal')) chips.push('&#127754; Coastal');
  if (any('great_lakes')) chips.push('&#127756; Great Lakes');
  const bc = members.filter((m) => t.counties[m].border_crossing);
  if (bc.length) chips.push(`&#128678; Border crossing &mdash; ${bc.map((m) => escapeHtml(t.border_crossing_labels[m] || '')).join('; ')}`);
  const cp = members.filter((m) => t.counties[m].choke_point);
  if (cp.length) chips.push(`&#9888;&#65039; Choke point &mdash; ${cp.map((m) => escapeHtml(t.choke_point_labels[m] || '')).join('; ')}`);
  const corridors = Object.keys(t.corridors).filter((k) => members.some((m) => t.corridors[k].includes(m)));
  if (corridors.length) chips.push(`&#128739; Corridor: ${corridors.map(escapeHtml).join(', ')}`);
  const x = store.transport;
  if (x) {
    const recs = allMembers.map((m) => x.counties[m]).filter(Boolean);
    if (recs.some((r) => r.rail_hub)) chips.push('&#128649; Rail hub');
    else if (recs.some((r) => r.rail)) chips.push('&#128642; Rail line');
    const hwys = [...new Set(recs.flatMap((r) => r.interstates || []))].sort();
    if (hwys.length) chips.push(`&#128664; ${hwys.map(escapeHtml).join(' &middot; ')}`);
  }
  const ex = areaExport(fips);
  if (ex.port || ex.canada || ex.mexico) {
    const via = [ex.port && 'port', ex.canada && 'Canada', ex.mexico && 'Mexico'].filter(Boolean).join(', ');
    chips.push(`&#128230; Export point &mdash; via ${via}`);
  }
  const rivers = [...new Set(members.flatMap((m) => t.counties[m].rivers))].sort();
  const riversHtml = rivers.length ? `<div class="trade-rivers">Waterways: ${rivers.map(escapeHtml).join(', ')}</div>` : '';
  if (!chips.length && !rivers.length) return '';
  return `<div class="stat"><div class="label">Trade</div>
    <div class="trade-chips">${chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div>${riversHtml}</div>`;
}

/* neighbors from the Census County Adjacency File */
function renderNeighbors(fips) {
  const members = new Set(Game.areaCounties(fips));
  const list = [...new Set([...members].flatMap((m) => (store.neighbors && store.neighbors[m]) || []))]
    .filter((f) => !members.has(f));
  const label = `<div class="label">Neighbors &middot; Census adjacency &middot; ${list.length}</div>`;
  if (!list.length) return `<div class="stat">${label}<div class="neighbors-list muted">— none on file for this unit</div></div>`;
  const names = list.map((f) => escapeHtml(store.data.counties[f]?.name || f));
  return `<div class="stat">${label}<div class="neighbors-list">${names.join(', ')}</div></div>`;
}

/* small "est." badge shown next to an estimated field */
function estTag(rec, ch) {
  if (!rec || !rec.est || !rec.est.includes(ch)) return '';
  return ' <span class="est-tag" title="Best estimate — see note below">est.</span>';
}

function renderEstNote(rec) {
  if (!rec || !rec.est) return '';
  const notes = [];
  if (rec.est.includes('v'))
    notes.push('Political leaning uses the 2024 <em>statewide</em> result &mdash; Alaska reports the presidential vote by house district, not by borough.');
  if (rec.est.includes('g'))
    notes.push('GDP is apportioned by population from the official combined-area / state total (not reported separately by the BEA).');
  if (rec.est.includes('p')) notes.push('Population is estimated.');
  return `<div class="est-note"><strong>est.</strong> = best estimate. ${notes.join(' ')}</div>`;
}

// obj: any {gop,dem,other,extPct?}; estRec: county record for est badge (optional)
// Emergent regional parties render inside this same area, each in its own color.
function renderPolitics(obj, estRec) {
  if (!obj || obj.gop == null || obj.dem == null) return `<div class="value small">No 2024 results available</div>`;
  const other = obj.other != null && obj.other > 0 ? obj.other : 0;
  const ext = Object.entries(obj.extPct || {}).filter(([, v]) => v >= 0.05).sort((a, b) => b[1] - a[1]);
  // lean = leading color BLOC: same-color parties pool their share (coalition)
  const bl = Parties.blocs(obj);
  const lead = bl[0], second = bl[1];
  const margin = (lead.pct - (second ? second.pct : 0)).toFixed(1);
  const label = lead.members.length > 1
    ? `${lead.group[0].toUpperCase()}${lead.group.slice(1)} Coalition`
    : lead.members[0];
  const winner = `<span class="pill" style="background:${lead.color}">${escapeHtml(label)} +${margin}</span>`;
  const extBars = ext.map(([p, v]) => `<span style="width:${v}%;background:${Parties.colorOf(p)}"></span>`).join('');
  const extLegend = ext.map(([p, v]) => `<span class="k custom" style="--kc:${Parties.colorOf(p)}">${escapeHtml(p)} ${v.toFixed(1)}%</span>`).join('');
  const otherLegend = other > 0 ? `<span class="k oth">Other ${other.toFixed(1)}%</span>` : '';
  return `
    <div class="vote-bar">
      <span class="dem" style="width:${obj.dem}%"></span>
      <span class="gop" style="width:${obj.gop}%"></span>
      ${extBars}
      <span class="oth" style="width:${other}%"></span>
    </div>
    <div class="vote-legend">
      <span class="k dem">Democrat ${obj.dem.toFixed(1)}%</span>
      <span class="k gop">Republican ${obj.gop.toFixed(1)}%</span>
      ${extLegend}
      ${otherLegend}
    </div>
    <div class="margin-line">Leans ${winner}${estTag(estRec, 'v')}</div>
  `;
}

function renderSources() {
  const m = store.data.meta;
  return `<div class="sources">Sources &mdash; Population: ${escapeHtml(m.population_source)}. GDP: ${escapeHtml(m.gdp_source)}. Vote: ${escapeHtml(m.election_source)}.</div>`;
}

function renderPlaceholder() {
  document.getElementById('panel').innerHTML = `
    <div class="placeholder">
      <span class="big">&#128506;</span>
      Select a <strong>nation</strong> or <strong>county</strong> on the map to see its
      population, GDP, and political leaning &mdash; then act on it.
      <br /><br />
      Toggle <strong>Nations</strong> / <strong>Counties</strong> above to choose what a click selects.
    </div>`;
}

/* ------------------------------------------------------------------ */
/* formatting helpers                                                  */
/* ------------------------------------------------------------------ */
function fmtPop(n) {
  return n == null ? '&mdash;' : Math.round(n).toLocaleString('en-US');
}
function fmtGdp(n) {
  if (n == null) return '&mdash;';
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + ' trillion';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + ' billion';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(1) + ' million';
  return '$' + Math.round(n).toLocaleString('en-US');
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

window.addEventListener('DOMContentLoaded', init);
