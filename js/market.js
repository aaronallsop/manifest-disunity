/*
 * Global resource market. Each world turn, every resource gets a price from
 * supply vs demand across the whole map:
 *
 *   supply_i = sum of every Area's production of i (baked profile scaled by the
 *              Area's LIVE GDP, so war losses / growth shift supply)
 *   demand_i = DEMAND_SHARE[i] x live population x per-capita spend (calibrated
 *              once at game start) -- population growth pushes demand up each
 *              turn while wars and GDP transfers shift supply
 *   price_i  = 100 x (demand/supply)^ELASTICITY, clamped
 *
 * High demand + low supply -> price above 100; oversupply -> crash below 100.
 */
const Market = (function () {
  const BASE = 100, ELASTICITY = 1.3, MIN_P = 20, MAX_P = 400;
  let prices = null, prev = null, perCap = null;

  function update() {
    const e = MapModes.getEconomy();
    if (!e) return;
    const supply = [0, 0, 0, 0, 0, 0];
    let gdpTotal = 0, popTotal = 0;
    for (const [aid, a] of Object.entries(e.areas)) {
      const live = Game.countyGdp(aid) / 1e6; // $M
      const baked = a.v.reduce((s, v) => s + v, 0) || 1;
      const k = live / baked;
      a.v.forEach((v, i) => { supply[i] += v * k; });
      gdpTotal += live;
      popTotal += Game.countyPop(aid);
    }
    if (perCap == null) perCap = gdpTotal / popTotal; // calibrate once at game start
    prev = prices;
    prices = supply.map((sup, i) => {
      const demand = DEMAND_SHARE[i] * perCap * popTotal;
      return Math.max(MIN_P, Math.min(MAX_P, BASE * Math.pow(demand / (sup || 1), ELASTICITY)));
    });
  }

  function html() {
    const e = MapModes.getEconomy();
    if (!e || !prices) return '';
    const rows = e.sectors
      .map((s, i) => ({ s, i, p: prices[i], was: prev ? prev[i] : prices[i] }))
      .sort((a, b) => b.p - a.p)
      .map(({ s, i, p, was }) => {
        const trend = p - was;
        const arrow = Math.abs(trend) < 0.05 ? '<span class="mkt-flat">&middot;</span>'
          : trend > 0 ? '<span class="surplus">&#9650;</span>' : '<span class="deficit">&#9660;</span>';
        return `<div class="mkt-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[i]}"></i>${s}</span>
          <strong>${p.toFixed(0)}</strong>${arrow}</div>`;
      })
      .join('');
    return `<div class="mkt-head">Market prices <span>index &middot; 100 = balanced</span></div>${rows}`;
  }

  // a nation's per-resource production and surplus/deficit ($M), same model
  // the nation panel shows: surplus_i = production_i - DEMAND_SHARE[i] x gross
  function nationSurplus(nid) {
    const e = MapModes.getEconomy();
    const n = Game.getNation(nid);
    if (!e || !n) return null;
    const prod = [0, 0, 0, 0, 0, 0];
    for (const aid of n.counties) {
      const a = e.areas[aid];
      if (a) a.v.forEach((v, i) => { prod[i] += v; });
    }
    const gross = prod.reduce((s, v) => s + v, 0);
    return { prod, gross, surplus: prod.map((p, i) => p - DEMAND_SHARE[i] * gross) };
  }

  return { update, html, getPrices: () => prices, nationSurplus };
})();
