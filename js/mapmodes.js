/*
 * Map coloring modes. Independent of the Nations/Counties select toggle.
 *
 *   standard    - each nation's own color (ownership view)
 *   political   - per-county 2024 lean: red (R) .. purple (even) .. blue (D)
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
    return d3.interpolateRgb(base, '#ffffff')(0.22 * (p.length - 1)); // deeper tier = lighter
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

  const RED = '#e0483b';
  const BLUE = '#3b6fe0';
  const PURPLE = '#7b57c8';
  const MARGIN_FULL = 40; // margin (pts) at which color is fully saturated

  function init(gameData) {
    data = gameData;
    const recs = Object.values(data.counties);
    const gdps = recs.map((c) => c.gdp).filter((v) => v > 0);
    const pops = recs.map((c) => c.pop).filter((v) => v > 0);
    gdpScale = d3.scaleLog().domain([d3.min(gdps), d3.max(gdps)]).range([0, 1]).clamp(true);
    popScale = d3.scaleLog().domain([d3.min(pops), d3.max(pops)]).range([0, 1]).clamp(true);
  }

  function political(fips) {
    const p = Game.leanOf(fips); // live partisan split (changes over the game)
    if (!p) return '#7a7a7a';
    const margin = p.dem - p.gop; // + = Democratic
    const t = Math.min(Math.abs(margin) / MARGIN_FULL, 1);
    return d3.interpolateRgb(PURPLE, margin >= 0 ? BLUE : RED)(t);
  }
  function gdp(fips) {
    const v = Game.countyGdp(fips);
    if (!v) return '#eef1ee';
    return d3.interpolateRgb('#eaf5ec', '#146a34')(gdpScale(v));
  }
  function population(fips) {
    const v = Game.countyPop(fips);
    if (!v) return '#fef9c3';
    return d3.interpolateRgb('#fde047', '#15308f')(popScale(v));
  }

  function color(mode, fips) {
    if (mode === 'political') return political(fips);
    if (mode === 'gdp') return gdp(fips);
    if (mode === 'population') return population(fips);
    if (mode === 'geographic') return regionColor(fips);
    if (mode === 'cultural') return cultureColor(fips);
    if (mode === 'economy') return economyColor(fips);
    return Game.colorForCounty(fips); // standard / ownership
  }

  function legend(mode) {
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
    if (mode === 'political')
      return grad(`linear-gradient(to right, ${RED}, ${PURPLE}, ${BLUE})`, 'Republican', 'even', 'Democrat');
    if (mode === 'gdp') return grad('linear-gradient(to right, #eaf5ec, #146a34)', 'low GDP', '', 'high GDP');
    if (mode === 'population') return grad('linear-gradient(to right, #fde047, #15308f)', 'low pop.', '', 'high pop.');
    return '';
  }
  function grad(css, a, b, c) {
    return `<div class="legend-bar" style="background:${css}"></div>
      <div class="legend-labels"><span>${a}</span><span>${b}</span><span>${c}</span></div>`;
  }

  return { init, color, legend, setRegion, getRegion: () => region, setCulture, getCulture: () => culture, setEconomy, getEconomy: () => economy, ECON_COLORS };
})();
