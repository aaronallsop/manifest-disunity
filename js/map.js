/*
 * THE MAP (M10.0, split out of js/app.js).
 *
 * Rendering is driven by Game ownership: each county is filled with its owning
 * nation's colour, and the heavy borders are the boundaries between nations. As
 * actions move counties around, the map re-renders from the model.
 *
 * Everything here reads `store` and the globals declared in js/app.js. They are
 * one classic-script scope; the split is a filing decision.
 */

/* ------------------------------------------------------------------ */
/* map                                                                 */
/* ------------------------------------------------------------------ */
function buildMap(topo, ctGeo) {
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

  // Borders between AREAS only (interior county lines of a merged Area omitted);
  // shown instead of per-county strokes when county lines are toggled off.
  //
  // Connecticut is excluded from the topology mesh entirely and drawn from the
  // planning-region geojson instead. Fixing only the mesh PREDICATE is not
  // enough: the topology carries the eight pre-2022 CT county polygons, so any
  // arc it emits inside CT follows an old county edge, while the nine coloured
  // fills are the planning-region polygons. The lines and the fills are different
  // shapes, and no predicate over the wrong geometry can reconcile them.
  const ctBoundaries = path({ type: 'FeatureCollection', features: ctGeo.features });
  const nonCtMesh = path(topojson.mesh(topo, topo.objects.counties, (a, b) =>
    a !== b
    && !OLD_CT.has(a.id) && !OLD_CT.has(b.id)
    && baseGeomToArea(a.id) !== baseGeomToArea(b.id)));
  g.append('path')
    .attr('class', 'area-borders')
    .attr('d', (nonCtMesh || '') + (ctBoundaries || ''));

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
  store.selectGlow = g.append('path').attr('class', 'select-glow').style('display', 'none');
  store.selectShape = g.append('path').attr('class', 'select-shape').style('display', 'none');

  redrawBorders();

  const zoom = d3
    .zoom()
    .scaleExtent([1, 9])
    .translateExtent([[0, 0], [WIDTH, HEIGHT]])
    .on('zoom', (e) => g.attr('transform', e.transform));
  svg.call(zoom).on('dblclick.zoom', null);
}

/*
 * Base geometry -> Area id. THE single place the old-CT proxy counties are
 * normalised.
 *
 * data/counties-10m.json still carries Connecticut's eight pre-2022 counties;
 * data/game-data.json carries only the nine planning regions, and data/areas.json
 * has no 09* entries at all, so Game.areaIdOf('09001') returns '09001' unchanged.
 * Any mesh predicate keyed on Game.areaIdOf alone therefore sees eight distinct
 * CT keys and draws eight interior boundaries that follow none of the nine
 * coloured fills — visible on first load, with no clicks, in the one state the
 * project worked hardest to get right.
 *
 * The nation mesh got this right via meshOwner; the area mesh did not. Now all
 * three layers (area borders, nation borders, nation outline) route through here.
 */
function baseGeomToArea(id) {
  return GeoCT.baseGeomToArea(id, Game.areaIdOf);
}

/* owner of a base-geometry county id (handles old-CT proxy counties) */
function meshOwner(id) {
  return Game.getOwner(baseGeomToArea(id));
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
// Cached: the node -> Area mapping is authored data and the Area -> member
// mapping is baked, so this list never changes. It was rebuilt on every panel
// render, and the panel re-renders on every selection change.
const cultureMemberCache = new Map();
function cultureMembers(nodeId) {
  let hit = cultureMemberCache.get(nodeId);
  if (hit) return hit;
  const c = MapModes.getCulture();
  const areas = (c && c.nodeAreas[nodeId]) || [];
  const out = [];
  for (const a of areas) for (const m of Game.areaCounties(a)) out.push(m);
  cultureMemberCache.set(nodeId, out);
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
  pressure: 'values',
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

  // (the turn order syncs itself: TurnSystem registers for roster changes)
  if (r.ownership) {
    store.outlineCache.clear();
    store.hoverKey = null; // the cached hover outline is now stale
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
/*
 * The clickable unit is the Area: one feature, or the merged member features.
 *
 * CACHED. An Area's shape is a function of the immutable geometry and the
 * immutable Area membership, so it never changes — but this ran a full
 * topojson.merge over all 3,231 county geometries on EVERY mousemove for each of
 * the 483 merged Areas.
 */
const areaFeatureCache = new Map();
function areaFeature(id) {
  let hit = areaFeatureCache.get(id);
  if (hit !== undefined) return hit;
  const members = Game.areaCounties(id);
  hit = members.length === 1
    ? store.countyById.get(members[0])
    : topojson.merge(store.topo, store.topo.objects.counties.geometries.filter((g) => new Set(members).has(g.id)));
  areaFeatureCache.set(id, hit);
  return hit;
}

/*
 * SAME-TARGET GUARD. This is bound to `mousemove`, which fires continuously while
 * the pointer sits inside one shape. Without the guard, every single event
 * re-projected the whole hovered outline — which for a nation is a
 * topojson.merge plus a path serialisation of up to 4,000 points — and wrote it
 * back into the DOM.
 */
function onHover(event, d) {
  if (Editor.isActive()) return Editor.onHover(d);
  if (Actions.isActive()) return Actions.onHover(d);
  if (store.colorMode === 'cultural' && MapModes.getCulture()) {
    const nid = cultureNodeAt(d.id);
    if (nid === store.hoverKey) return;
    store.hoverKey = nid;
    if (nid) store.hoverShape.attr('d', store.path(cultureOutline(nid))).style('display', null);
    else store.hoverShape.style('display', 'none');
    return;
  }
  if (store.mode === 'nations') {
    const nid = Game.getOwner(d.id);
    const key = 'n:' + nid;
    if (key === store.hoverKey) return;
    store.hoverKey = key;
    if (nid) store.hoverShape.attr('d', store.path(nationOutline(nid))).style('display', null);
    else store.hoverShape.style('display', 'none');
  } else {
    const aid = Game.areaIdOf(d.id);
    const key = 'a:' + aid;
    if (key === store.hoverKey) return;
    store.hoverKey = key;
    store.hoverShape.attr('d', store.path(areaFeature(aid))).style('display', null);
  }
}
function onHoverOut() {
  if (Actions.isActive()) return;
  store.hoverKey = null;
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
  setSelectOutline(level === 'nation' ? nationOutline(id) : areaFeature(id));
  if (level === 'nation') renderNationPanel(id);
  else renderCountyPanel(id);
  updateCultureHighlight();
  Leaderboard.setSelected(level === 'nation' ? id : null);
}

function deselect() {
  store.selected = null;
  setSelectOutline(null);
  store.hoverShape.style('display', 'none');
  updateCultureHighlight();
  renderPlaceholder();
  Leaderboard.setSelected(null);
}

function setSelectOutline(feature) {
  const d = feature ? store.path(feature) : null;
  if (d) {
    store.selectShape.attr('d', d).style('display', null);
    if (store.selectGlow) store.selectGlow.attr('d', d).style('display', null);
  } else {
    store.selectShape.style('display', 'none');
    if (store.selectGlow) store.selectGlow.style('display', 'none');
  }
}
