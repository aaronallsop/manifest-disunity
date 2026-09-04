/*
 * Global resource market. Each world turn, every resource gets a price from
 * supply vs demand across the whole map:
 *
 *   supply_i = every Area's production of i — its baked sector profile scaled by
 *              the Area's LIVE GDP, so war losses, growth and trade shift supply
 *   demand_i = demandShare[i] x total live GDP  (the per-capita spend is
 *              RECALIBRATED every turn against the live economy)
 *   price_i  = 100 x (demand/supply)^elasticity, clamped
 *
 * Demand share above supply share -> price above 100; oversupply -> below 100.
 *
 * TWO THINGS THIS FIXES.
 *
 * 1. THE RATCHET. `perCap` was calibrated once at game start and never again,
 *    so demand tracked live population while supply tracked GDP. Every price
 *    drifted up 1.302% per turn forever and pinned at the 400 clamp around turn
 *    105 — and relative prices never changed at all, because the sector mix is
 *    what actually differs between them and that was constant. Recalibrating
 *    makes demand and supply the same quantity measured two ways, so the level
 *    is stable and only the MIX moves the prices. That is the whole point of a
 *    market: it should say what is scarce, not what turn it is.
 *
 * 2. TWO ECONOMIES. `nationSurplus` read the BAKED `a.v` values while `update`
 *    scaled by live GDP, so tradeable volume was frozen for the entire game
 *    while the price it was valued at moved. A nation could lose half its
 *    economy in a war and export exactly as much the next turn. Both now scale
 *    the same way, through one helper.
 *
 * `market.demandShare` sums to 1.0. It used to sum to 0.80, which made the UI's
 * "100 = balanced" label wrong by construction — balanced was 75.
 */
const Market = (function () {
  let prices = null, prev = null, perCap = null;

  /**
   * An Area's live production by sector, in $M: the baked profile rescaled so it
   * totals the Area's CURRENT GDP. This is the single definition of supply —
   * `update` and `nationSurplus` both go through it, which is what stops the two
   * economies from diverging again.
   */
  function areaProduction(aid, a) {
    const live = Game.countyGdp(aid) / 1e6; // $M
    let baked = 0;
    for (let i = 0; i < a.v.length; i++) baked += a.v[i];
    const k = baked > 0 ? live / baked : 0;
    return a.v.map((v) => v * k);
  }

  function update(tune) {
    const T = tune || window.TUNE;
    const BASE = T.get('market.base'), ELASTICITY = T.get('market.elasticity');
    const MIN_P = T.get('market.minPrice'), MAX_P = T.get('market.maxPrice');
    const DEMAND_SHARE = T.get('market.demandShare');
    const e = MapModes.getEconomy();
    if (!e) return;

    const supply = [0, 0, 0, 0, 0, 0];
    let gdpTotal = 0, popTotal = 0;
    for (const [aid, a] of Object.entries(e.areas)) {
      const prod = areaProduction(aid, a);
      for (let i = 0; i < supply.length; i++) supply[i] += prod[i];
      gdpTotal += Game.countyGdp(aid) / 1e6;
      popTotal += Game.countyPop(aid);
    }

    // RECALIBRATED every turn. Frozen, this was the ratchet.
    perCap = popTotal > 0 ? gdpTotal / popTotal : 0;

    prev = prices;
    prices = supply.map((sup, i) => {
      const demand = DEMAND_SHARE[i] * perCap * popTotal; // == share x live GDP
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
    return `<div class="mkt-head">Market prices <span title="Demand shares sum to 1.0, so a sector whose share of demand equals its share of output prices at exactly 100.">index &middot; 100 = balanced</span></div>${rows}`;
  }

  /**
   * A nation's per-resource production and surplus/deficit ($M).
   *   surplus_i = production_i - demandShare[i] x gross
   *
   * Production is LIVE (see areaProduction). Reading the baked values here while
   * `update` scaled by live GDP is what made external trade a zero-risk
   * repeatable grant: the surplus figure never moved, so the grant never
   * diminished however much the economy had actually changed.
   */
  function nationSurplus(nid, tune) {
    const DEMAND_SHARE = (tune || window.TUNE).get('market.demandShare');
    const e = MapModes.getEconomy();
    const n = Game.getNation(nid);
    if (!e || !n) return null;
    const prod = [0, 0, 0, 0, 0, 0];
    for (const aid of n.counties) {
      const a = e.areas[aid];
      if (!a) continue;
      const live = areaProduction(aid, a);
      for (let i = 0; i < prod.length; i++) prod[i] += live[i];
    }
    const gross = prod.reduce((s, v) => s + v, 0);
    return { prod, gross, surplus: prod.map((p, i) => p - DEMAND_SHARE[i] * gross) };
  }

  const serialize = () => ({ prices: prices ? prices.slice() : null, prev: prev ? prev.slice() : null, perCap });
  function loadState(snap) {
    prices = snap && snap.prices ? snap.prices.slice() : null;
    prev = snap && snap.prev ? snap.prev.slice() : null;
    perCap = snap ? snap.perCap : null;
  }

  return {
    update, html, getPrices: () => prices, getPerCap: () => perCap,
    areaProduction, nationSurplus, serialize, loadState,
  };
})();
