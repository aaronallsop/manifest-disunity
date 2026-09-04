/*
 * Map coloring modes. Independent of the Nations/Counties select toggle.
 *
 *   standard    - each nation's own color (ownership view)
 *   political   - per-Area leading ideology, its colour, deepened by how
 *   gdp         - per-county GDP: white (low) .. green (high)
 *   population  - per-county population: yellow (low) .. blue (high)
 *
 * The value maps are static (based on each county's own numbers); nation borders
 * are still drawn on top so you can read ownership and the data at once.
 */
const MapModes = (function () {
  let data = null;
  let gdpScale = null;
  let popScale = null;
  let region = null; // published editor map mode (geographical.mapmode.json)

  // same palette the editor paints with, so published colors match
  const REGION_PALETTE = ['#e0483b', '#3b6fe0', '#33a852', '#e8862d', '#8a5cf5', '#e3c229',
    '#00b5ad', '#f04f8f', '#7d9c3f', '#c0653a', '#5580a0', '#a86ee8'];

  let economy = null; // baked six-sector production values (economy.json)
  const ECON_COLORS = ['#7d9c3f', '#8a6a4f', '#7f8ea3', '#e8862d', '#3b6fe0', '#8a5cf5'];
  const setEconomy = (def) => { economy = def; };
  function economyColor(fips) {
    const a = economy && economy.areas[Game.areaIdOf(fips)];
    return a ? ECON_COLORS[a.d] : '#3a4149';
  }

  function setRegion(def) {
    const names = {};
    (function walk(ns) { for (const n of ns) { names[n.id] = n.name; walk(n.children); } })(def.nodes);
    region = { def, names, order: def.nodes.map((n) => n.id) };
  }
  function regionColor(fips) {
    const p = region && region.def.assign[Game.areaIdOf(fips)];
    if (!p) return '#3a4149';
    const base = REGION_PALETTE[region.order.indexOf(p[0]) % REGION_PALETTE.length];
    return lighten(base, p.length - 1); // deeper tier = lighter
  }

  // Cultural mode: each super-region gets its own HUE; its regions are different
  // LIGHTNESS shades of that hue; each region's sub-regions are shades around it.
  let culture = null;
  const CULTURE_HUES = [140, 212, 20, 278, 45, 330, 190, 96]; // one per super-region
  const clamp01 = (v) => Math.max(0.16, Math.min(0.82, v));
  const hsl = (h, s, l) => d3.hsl(h, s, l).formatHex();

  function setCulture(def) {
    const names = {}, colorByNode = {}, nodeAreas = {};
    const order = def.nodes.map((n) => n.id);
    (function walk(ns) { for (const n of ns) { names[n.id] = n.name; walk(n.children); } })(def.nodes);
    def.nodes.forEach((sup, i) => {
      const hue = CULTURE_HUES[i % CULTURE_HUES.length];
      colorByNode[sup.id] = hsl(hue, 0.5, 0.5);
      const regs = sup.children;
      regs.forEach((reg, j) => {
        const rl = regs.length > 1 ? 0.34 + 0.30 * (j / (regs.length - 1)) : 0.5; // spread by region
        colorByNode[reg.id] = hsl(hue, 0.46, rl);
        const subs = reg.children;
        subs.forEach((sub, k) => {
          const sl = subs.length > 1 ? rl - 0.08 + 0.16 * (k / (subs.length - 1)) : rl; // band around region
          colorByNode[sub.id] = hsl(hue, 0.42, clamp01(sl));
        });
      });
    });
    for (const [aid, path] of Object.entries(def.assign))
      for (const id of path) (nodeAreas[id] = nodeAreas[id] || []).push(aid);
    culture = { def, names, colorByNode, nodeAreas, order };
  }
  function cultureColor(fips) {
    const p = culture && culture.def.assign[Game.areaIdOf(fips)];
    if (!p || !p.length) return '#3a4149';
    return culture.colorByNode[p[p.length - 1]] || '#3a4149';
  }

  // Ideology colours come from content/ideologies.json, so there is one place
  // that decides what "Democratic Socialist" looks like.
  const CONTESTED = '#5b5f6b'; // the colour of a place nobody owns outright

  /*
   * Colour ramps are built ONCE.
   *
   * recolor() calls color() for all 3,232 path elements, and each
   * d3.interpolateRgb parses two colour strings, builds three per-channel gamma
   * interpolators and returns a closure that is thrown away after one
   * evaluation. That is ~6,464 colour parses per repaint in political/gdp/
   * population/geographic mode, and ~12,928 in the editor, which does it twice
   * per county. There are at most a dozen distinct ramps in the whole program.
   */
  const RAMP_GDP = d3.interpolateRgb('#eaf5ec', '#146a34');
  const RAMP_POP = d3.interpolateRgb('#fde047', '#15308f');
  /** memoized `mix toward white by tier` — the argument only ever takes 3 values */
  const tierCache = new Map();
  function lighten(base, tier) {
    const key = base + '|' + tier;
    let hit = tierCache.get(key);
    if (hit === undefined) {
      hit = d3.interpolateRgb(base, '#ffffff')(0.22 * tier);
      tierCache.set(key, hit);
    }
    return hit;
  }

  function init(gameData) {
    data = gameData;
    const recs = Object.values(data.counties);
    const gdps = recs.map((c) => c.gdp).filter((v) => v > 0);
    const pops = recs.map((c) => c.pop).filter((v) => v > 0);
    gdpScale = d3.scaleLog().domain([d3.min(gdps), d3.max(gdps)]).range([0, 1]).clamp(true);
    popScale = d3.scaleLog().domain([d3.min(pops), d3.max(pops)]).range([0, 1]).clamp(true);
  }

  /*
   * The leading ideology's own colour, mixed toward a neutral grey by how
   * CONTESTED the Area is.
   *
   * The old version interpolated along a single red-purple-blue line, because a
   * D-vs-R margin is a scalar and a line is all a scalar can colour. Six
   * ideologies is a plane, so the honest encoding is "who leads, and by how
   * much": a solid green Area is Democratic Socialist and unified, a washed-out
   * yellow one is Conservative Nationalist and barely.
   *
   * "By how much" is the leader's margin over the runner-up, not its raw share:
   * 30% against a field of five is a commanding lead, and 30% against one rival
   * on 29% is not.
   */
  const ramps = new Map();
  function politicalRamp(i) {
    let r = ramps.get(i);
    if (!r) { r = d3.interpolateRgb(CONTESTED, Ideology.colorAt(i)); ramps.set(i, r); }
    return r;
  }
  const MARGIN_FULL = 25; // lead over the runner-up (pts) at which colour saturates

  function political(fips) {
    const p = Game.areaPolitics(fips);
    if (!p || p.dominant < 0) return '#7a7a7a';
    let first = 0, second = 0;
    for (const s of p.shares) {
      if (s > first) { second = first; first = s; }
      else if (s > second) second = s;
    }
    const t = Math.min((first - second) / MARGIN_FULL, 1);
    return politicalRamp(p.dominant)(0.25 + 0.75 * t);
  }
  function gdp(fips) {
    const v = Game.countyGdp(fips);
    if (!v) return '#eef1ee';
    return RAMP_GDP(gdpScale(v));
  }
  function population(fips) {
    const v = Game.countyPop(fips);
    if (!v) return '#fef9c3';
    return RAMP_POP(popScale(v));
  }

  /*
   * PRESSURE: the strongest organised movement in an Area, banded.
   *
   * In a game about fragmentation this is the real map, and ownership is what
   * you check to see what the pressure map did. It is the one mode that shows
   * you something BEFORE it happens rather than after.
   *
   * FOG. Exact bands for your own ground; for everyone else's, only calm /
   * rising / critical. You know the temperature of your own country and you read
   * the newspaper about everyone else's — and the fog is what stops the pressure
   * map from being an omniscient targeting overlay for the annex button.
   */
  const PRESSURE_BANDS = [
    { upto: 0.08, color: '#2b3440', label: 'Quiet' },
    { upto: 0.20, color: '#3d5a45', label: 'Stirring' },
    { upto: 0.32, color: '#8a9a3a', label: 'Organised' },
    { upto: 0.44, color: '#e3c229', label: 'Rising' },
    { upto: 0.56, color: '#e8862d', label: 'Armed' },
    { upto: 1.01, color: '#e0483b', label: 'Critical' },
  ];
  const FOG_BANDS = [
    { upto: 0.20, color: '#2b3440', label: 'Calm' },
    { upto: 0.40, color: '#7d7440', label: 'Rising' },
    { upto: 1.01, color: '#8a4038', label: 'Critical' },
  ];

  /** The strongest movement share in an Area, 0..1. Defined in js/sentiment.js. */
  const pressureOf = (fips) => Sentiment.pressure(fips);

  function pressureColor(fips) {
    const v = pressureOf(fips);
    /*
     * FOG. Exact bands for your own ground, calm/rising/critical for everyone
     * else's — which is what stops the pressure map being an omniscient
     * targeting overlay for the annex button.
     *
     * It read `store.player` until M6.3, and `store.player` never existed: the
     * whole feature was inert, and silently, because "no player" and "every Area
     * is yours" take the same branch. It could not have worked before M6.2,
     * because there was nobody to keep a secret from.
     */
    const player = Game.getPlayer();
    const mine = player == null || Game.getOwner(Game.areaIdOf(fips)) === player;
    const bands = mine ? PRESSURE_BANDS : FOG_BANDS;
    for (const b of bands) if (v <= b.upto) return b.color;
    return bands[bands.length - 1].color;
  }

  function color(mode, fips) {
    if (mode === 'pressure') return pressureColor(fips);
    if (mode === 'political') return political(fips);
    if (mode === 'gdp') return gdp(fips);
    if (mode === 'population') return population(fips);
    if (mode === 'geographic') return regionColor(fips);
    if (mode === 'cultural') return cultureColor(fips);
    if (mode === 'economy') return economyColor(fips);
    return Game.colorForCounty(fips); // standard / ownership
  }

  function legend(mode) {
    if (mode === 'pressure') {
      const own = typeof store !== 'undefined' && store.player;
      const rows = PRESSURE_BANDS
        .map((b) => `<span class="legend-key"><i style="background:${b.color}"></i>${b.label}</span>`)
        .join('');
      return `<div class="legend-keys">${rows}`
        + (own ? '<span class="legend-key" style="opacity:.7">&mdash; other nations shown banded</span>' : '')
        + '</div>';
    }
    if (mode === 'economy') {
      if (!economy) return '';
      const rows = economy.sectors
        .map((s, i) => `<span class="legend-key"><i style="background:${ECON_COLORS[i]}"></i>${s}</span>`)
        .join('');
      return `<div class="legend-keys">${rows}</div>`;
    }
    if (mode === 'geographic') {
      if (!region) return '';
      const rows = region.order
        .map((id, i) => `<span class="legend-key"><i style="background:${REGION_PALETTE[i % REGION_PALETTE.length]}"></i>${region.names[id]}</span>`)
        .join('');
      return `<div class="legend-keys">${rows}</div>`;
    }
    if (mode === 'cultural') {
      if (!culture) return '';
      const rows = culture.order
        .map((id) => `<span class="legend-key"><i style="background:${culture.colorByNode[id]}"></i>${culture.names[id]}</span>`)
        .join('');
      return `<div class="legend-keys">${rows}<span class="legend-note">shades = regions &amp; sub-regions</span></div>`;
    }
    if (mode === 'political') {
      const rows = Ideology.all()
        .map((x) => `<span class="legend-key"><i style="background:${x.color}"></i>${x.name}</span>`)
        .join('');
      return `<div class="legend-keys">${rows}<span class="legend-note">washed out = contested</span></div>`;
    }
    if (mode === 'gdp') return grad('linear-gradient(to right, #eaf5ec, #146a34)', 'low GDP', '', 'high GDP');
    if (mode === 'population') return grad('linear-gradient(to right, #fde047, #15308f)', 'low pop.', '', 'high pop.');
    return '';
  }
  function grad(css, a, b, c) {
    return `<div class="legend-bar" style="background:${css}"></div>
      <div class="legend-labels"><span>${a}</span><span>${b}</span><span>${c}</span></div>`;
  }

  return { init, color, legend, lighten, pressureOf, setRegion, getRegion: () => region, setCulture, getCulture: () => culture, setEconomy, getEconomy: () => economy, ECON_COLORS };
})();
