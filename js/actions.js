/*
 * Player actions. Each action is an atomic mode: you enter it, it resolves, and
 * the map re-renders from the model. While an action runs it intercepts map
 * hover/clicks (see app.js dispatch) and owns the info panel.
 *
 *   Unite   - merge an adjacent nation into yours (warns on a party flip).
 *   Annex   - take adjacent counties; may spark a civil war (CivilWar engine).
 *   Release - (next) shed counties that lean the other way.
 */
const Actions = (function () {
  let A = null; // active action state

  const isActive = () => A !== null;

  /* ---- shared visuals ---- */
  function dimExcept(keepFips) {
    store.countyPaths
      .classed('dim', (d) => !keepFips.has(Game.areaIdOf(d.id)))
      .classed('chosen', (d) => A && A.chosen && A.chosen.has(Game.areaIdOf(d.id)));
  }
  function clearVisuals() {
    store.countyPaths.classed('dim', false).classed('chosen', false);
    store.actionLayer.selectAll('*').remove();
    store.hoverShape.style('display', 'none');
  }

  // Annex auto-switches the map to the political view, then restores it.
  let prevColorMode = null;
  function restoreColorMode() {
    if (prevColorMode != null) { setColorMode(prevColorMode); prevColorMode = null; }
  }

  function cancel() {
    const nid = A && A.nid;
    A = null;
    restoreColorMode();
    clearVisuals();
    if (nid && Game.getNation(nid)) select('nation', nid);
    else deselect();
  }

  function start(type, nid) {
    if (type === 'unite') startUnite(nid);
    else if (type === 'annex') startAnnex(nid);
    else if (type === 'trade') startTrade(nid);
    else if (type === 'release') startRelease(nid);
  }

  function onHover(d) {
    if (!A) return;
    if (A.type === 'unite' || A.type === 'trade') {
      const tid = Game.getOwner(d.id);
      if (tid && A.eligible.has(tid) && tid !== A.pending) store.hoverShape.attr('d', store.path(nationOutline(tid))).style('display', null);
      else store.hoverShape.style('display', 'none');
    } else if (A.type === 'annex' || A.type === 'release') {
      const aid = Game.areaIdOf(d.id);
      if (A.selectable.has(aid) || A.chosen.has(aid)) store.hoverShape.attr('d', store.path(areaFeature(aid))).style('display', null);
      else store.hoverShape.style('display', 'none');
    }
  }

  function onClick(d) {
    if (!A) return;
    if (A.type === 'unite') clickUnite(d);
    else if (A.type === 'trade') clickTrade(d);
    else if (A.type === 'annex') clickAnnex(d);
    else if (A.type === 'release') clickRelease(d);
  }

  /* ================================================================= */
  /* UNITE                                                             */
  /* ================================================================= */
  function startUnite(nid) {
    const eligible = new Set(Game.adjacentNations(nid));
    A = { type: 'unite', nid, eligible, pending: null };
    if (eligible.size === 0) {
      A = null;
      flash('No neighboring nations to unite with.', 'warn');
      return select('nation', nid);
    }
    const keep = new Set();
    for (const f of Game.getNation(nid).counties) keep.add(f);
    for (const e of eligible) for (const f of Game.getNation(e).counties) keep.add(f);
    dimExcept(keep);
    setSelectOutline(nationOutline(nid));
    renderUnitePrompt();
  }

  function clickUnite(d) {
    const tid = Game.getOwner(d.id);
    if (!tid || !A.eligible.has(tid)) return;
    A.pending = tid;
    store.hoverShape.style('display', 'none');
    setSelectOutline(topojson.merge(store.topo, store.topo.objects.counties.geometries.filter((g) => g.id && (meshOwner(g.id) === A.nid || meshOwner(g.id) === tid))));
    renderUnitePreview(tid);
  }

  // Plan (no mutation): who defects to T, who secedes, who stays with S.
  function planSplinter(S, T) {
    const Slean = Game.nationDemographics(S).lean;
    const Tlean = Game.nationDemographics(T).lean;
    const Sc = [...Game.getNation(S).counties];
    const touchesT = (c) => Game.countyNeighbors(c).some((nb) => Game.getOwner(nb) === T);
    const defect = Sc.filter((c) => Game.leanOf(c)?.lean === Tlean && touchesT(c));
    const defectSet = new Set(defect);
    const rest = Sc.filter((c) => !defectSet.has(c));
    const secede = rest.filter((c) => Game.leanOf(c)?.lean !== Slean && !touchesT(c));
    const remnant = rest.filter((c) => !secede.includes(c));
    return { defect, secede, remnant };
  }

  // Roll for the union: peaceful merge, or a splinter civil war (with fallout).
  function confirmUniteAttempt(tid) {
    const S = A.nid;
    const P = A.chance;
    const Sname = Game.getNation(S).name;
    const Tname = Game.getNation(tid).name;
    A = null;
    clearVisuals();
    if (Math.random() < P) {
      Game.mergeInto(S, tid);
      flash(`🤝 <strong>${escapeHtml(Tname)}</strong> united into <strong>${escapeHtml(Game.getNation(S).name)}</strong>.`, 'good');
    } else {
      const score = CivilWar.uniteSeverity(P);
      const plan = planSplinter(S, tid);
      Game.moveCounties(plan.defect, tid, { silent: true });
      const created = Game.breakApart(plan.secede);
      Game.applyCivilWarCost(S, tid, score); // remnant bleeds population; GDP flows to the target
      TurnSystem.insertAfter(S, created);
      const parts = [`${plan.defect.length} counties defected to <strong>${escapeHtml(Tname)}</strong>`];
      if (created.length) parts.push(`${created.length} new ${plural(created.length, 'nation', 'nations')} broke away`);
      flash(`⚔️ <strong>${escapeHtml(Sname)}</strong>'s bid to unite <strong>${escapeHtml(Tname)}</strong> sparked a civil war! ${parts.join('; ')}.`, 'bad');
    }
    completeTurn();
  }

  function renderUnitePrompt() {
    const n = Game.getNation(A.nid);
    setPanel(`
      ${actionHead('🤝 Unite with nation', n)}
      <p class="hint-block">Click a <strong>highlighted neighboring nation</strong> to preview uniting it into
      <strong>${escapeHtml(n.name)}</strong>. Alaska reaches every Pacific &amp; Canada-border nation; Hawaii every Pacific one.</p>
      <div class="btn-row"><button class="btn ghost" id="a-cancel">Cancel</button></div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
  }

  function renderUnitePreview(tid) {
    const me = Game.nationDemographics(A.nid);
    const them = Game.nationDemographics(tid);
    const tName = Game.getNation(tid).name;
    const combined = Game.demographics([...Game.getNation(A.nid).counties, ...Game.getNation(tid).counties]);
    const shell = Game.blueShell(A.nid);
    const P = CivilWar.unitePeaceChance(me, them, shell);
    A.chance = P;
    const pct = Math.round(P * 100);
    const risky = P < 0.5;
    const flip = me.lean != null && combined.lean != null && me.lean !== combined.lean;
    setPanel(`
      ${actionHead('🤝 Unite — preview', Game.getNation(A.nid))}
      <p class="hint-block">Proposing union with <strong>${escapeHtml(tName)}</strong>. If it holds, the combined nation keeps
        the name <strong>${escapeHtml(Game.getNation(A.nid).name)}</strong>.</p>
      <div class="chance ${risky ? 'risky' : 'safe'}">
        <span class="chance-num">${pct}%</span><span class="chance-lbl">chance of peaceful union</span>
      </div>
      <div class="stat"><div class="label">Combined population</div><div class="value">${fmtPop(combined.pop)}</div></div>
      <div class="stat"><div class="label">Combined GDP</div><div class="value">${fmtGdp(combined.gdp)}</div></div>
      <div class="stat"><div class="label">Combined political leaning</div>${renderPolitics(combined)}</div>
      ${flip ? `<div class="warn-box">⚠️ Flips your leaning ${leanName(me.lean)} &rarr; ${leanName(combined.lean)} &mdash; lowers the odds.</div>` : ''}
      <div class="warn-box">On failure your nation fractures: border counties defect to <strong>${escapeHtml(tName)}</strong>,
        cut-off regions break away, and you lose population &amp; GDP.</div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go ${risky ? 'danger' : ''}" id="a-go">${risky ? 'Risk it' : 'Propose union'}</button>
      </div>
    `);
    document.getElementById('a-back').onclick = () => { A.pending = null; setSelectOutline(nationOutline(A.nid)); renderUnitePrompt(); };
    document.getElementById('a-go').onclick = () => confirmUniteAttempt(tid);
  }

  /* ================================================================= */
  /* TRADE                                                             */
  /* ================================================================= */
  const TRADE_GAIN = 0.10; // each side's GDP gain as a share of traded value
  // transit routing: a landlocked nation reaches the market through a neighbor
  // that has export access; the transit nation takes a toll, discounted by the
  // corridor it controls (rail beats highway).
  const TRANSIT_TOLL = 0.35;    // transit nation's cut of the trade benefit
  const RAIL_DISCOUNT = 0.5;    // a rail corridor halves the toll (bigger bonus)
  const HIGHWAY_DISCOUNT = 0.2; // an interstate link shaves 20% off the toll
  const linkDiscount = (link) => (link === 'rail' ? RAIL_DISCOUNT : link === 'highway' ? HIGHWAY_DISCOUNT : 0);
  const linkLabel = (link) => (link === 'rail' ? '🚂 rail corridor' : link === 'highway' ? '🛣 highway' : '🚚 overland');
  // negotiation weights: how the transit nation judges a proposed toll
  const NEED_SCALE = 40;      // toll income vs the transit nation's GDP -> "need"
  const COUNTER_FLOOR = 0.55; // offers below this fraction of their ask get declined

  function startTrade(nid) {
    const eligible = new Set(Game.adjacentNations(nid));
    A = { type: 'trade', nid, eligible, pending: null };
    if (eligible.size === 0) {
      A = null;
      flash('No neighboring nations to trade with.', 'warn');
      return select('nation', nid);
    }
    const keep = new Set();
    for (const f of Game.getNation(nid).counties) keep.add(f);
    for (const e of eligible) for (const f of Game.getNation(e).counties) keep.add(f);
    dimExcept(keep);
    setSelectOutline(nationOutline(nid));
    renderTradePrompt();
  }

  function clickTrade(d) {
    const tid = Game.getOwner(d.id);
    if (!tid || !A.eligible.has(tid) || tid === A.nid) return;
    A.pending = tid;
    store.hoverShape.style('display', 'none');
    renderTradePreview(tid);
  }

  // surplus resources one side sells to the other, valued at market price
  function tradeFlows(S, T) {
    const ms = Market.nationSurplus(S), ts = Market.nationSurplus(T);
    const prices = Market.getPrices();
    const e = MapModes.getEconomy();
    if (!ms || !ts || !prices) return [];
    const flows = [];
    e.sectors.forEach((s, i) => {
      const sell = Math.min(Math.max(0, ms.surplus[i]), Math.max(0, -ts.surplus[i])); // us -> them
      const buy = Math.min(Math.max(0, ts.surplus[i]), Math.max(0, -ms.surplus[i])); // them -> us
      if (sell + buy > 1) flows.push({ i, s, sell, buy, value: (sell + buy) * (prices[i] / 100) });
    });
    return flows;
  }

  function renderTradePrompt() {
    const n = Game.getNation(A.nid);
    const acc = nationExportAccess(A.nid);
    const ext = `
      <div class="label" style="margin-top:10px">External partners &middot; via export points</div>
      <div class="btn-row">
        <button class="btn ghost" id="a-canada" ${acc.canada ? '' : 'disabled title="Needs a Canada border gateway"'}>🇨🇦 Canada</button>
        <button class="btn ghost" id="a-mexico" ${acc.mexico ? '' : 'disabled title="Needs a Mexico border gateway"'}>🇲🇽 Mexico</button>
        <button class="btn ghost" id="a-world" ${acc.any ? '' : 'disabled title="Needs a port or border gateway"'}>🌐 World market</button>
      </div>
      ${acc.any ? '' : '<div class="warn-box">⛔ Landlocked — no port or Canada/Mexico gateway. Route through a neighbor below.</div>'}`;
    // transit routes: neighbors that DO have export access can carry our goods
    const routes = Game.adjacentNations(A.nid)
      .filter((t) => nationExportAccess(t).any)
      .map((t) => ({ t, link: transitLink(A.nid, t) }));
    const transitHtml = routes.length ? `
      <div class="label" style="margin-top:12px">Transit routes &middot; reach the market via a neighbor</div>
      ${routes.map((r) => `<button class="btn ghost transit-btn" data-t="${r.t}">
          <span>${escapeHtml(Game.getNation(r.t).name)}</span>
          <span class="transit-meta">${linkLabel(r.link)} &middot; toll ${Math.round(TRANSIT_TOLL * (1 - linkDiscount(r.link)) * 100)}%</span>
        </button>`).join('')}` : '';
    setPanel(`
      ${actionHead('🚛 Trade with nation', n)}
      <p class="hint-block">Click a <strong>highlighted neighboring nation</strong> to preview a trade deal:
      each side sells its <strong>surplus resources</strong> to the other at market price, boosting both GDPs.</p>
      ${ext}
      ${transitHtml}
      <div class="btn-row"><button class="btn ghost" id="a-cancel">Cancel</button></div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
    const wire = (id, label) => {
      const b = document.getElementById(id);
      if (b && !b.hasAttribute('disabled')) b.onclick = () => renderExternalPreview(label);
    };
    wire('a-canada', 'Canada');
    wire('a-mexico', 'Mexico');
    wire('a-world', 'the world market');
    document.querySelectorAll('.transit-btn').forEach((b) => (b.onclick = () => renderTransitPreview(b.dataset.t)));
  }

  // how the transit nation T judges a proposed toll p (its cut, higher = better
  // for T). Returns its target ask + a verdict + brief reasoning.
  function evalTransit(S, T, base, total) {
    const dS = Game.nationDemographics(S), dT = Game.nationDemographics(T);
    const relSize = dT.gdp / (dS.gdp + dT.gdp);        // T's share of the pair's GDP
    const sizeMult = 0.75 + 0.5 * relSize;             // bigger T holds out for more
    const rel = Math.max(-1, Math.min(1, 1 - Math.abs((dS.dem || 0) - (dT.dem || 0)) / 25)); // political alignment
    const relMult = 1 - 0.2 * rel;                     // warm relations -> asks less
    const incomeToT = total * TRADE_GAIN * base;       // ballpark toll income ($M)
    const need = Math.max(0, Math.min(1, (incomeToT / (dT.gdp / 1e6)) * NEED_SCALE));
    const needMult = 1 - 0.25 * need;                  // the needier, the more it settles
    const ask = Math.max(0.05, Math.min(0.6, base * sizeMult * relMult * needMult));
    return { ask, relSize, rel, need };
  }
  function transitReasons(v) {
    const r = [];
    if (v.relSize > 0.6) r.push('We&rsquo;re the larger power, so we hold out for a better cut.');
    else if (v.relSize < 0.4) r.push('You&rsquo;re bigger than us &mdash; we&rsquo;ll take a smaller cut.');
    if (v.need > 0.5) r.push('The income would really help us.');
    else if (v.need < 0.15) r.push('Frankly, we don&rsquo;t need this deal.');
    if (v.rel > 0.3) r.push('Relations are warm.');
    else if (v.rel < -0.3) r.push('Relations are cool.');
    return r.length ? r.join(' ') : 'A middling offer.';
  }

  // negotiate a transit toll: propose on a slider, they accept / decline / counter
  function renderTransitPreview(throughNid) {
    const S = A.nid, T = throughNid;
    const tName = Game.getNation(T).name;
    const link = transitLink(S, T);
    const base = TRANSIT_TOLL * (1 - linkDiscount(link)); // the "fair" corridor rate
    const ms = Market.nationSurplus(S);
    const prices = Market.getPrices();
    const e = MapModes.getEconomy();
    const flows = e.sectors
      .map((s, i) => ({ i, s, vol: Math.max(0, ms.surplus[i]) }))
      .filter((f) => f.vol > 1)
      .map((f) => ({ ...f, value: f.vol * (prices[f.i] / 100) }));
    const total = flows.reduce((s, f) => s + f.value, 0);
    const benefit = total * TRADE_GAIN;
    const start = Math.round(base * 100);
    const rows = flows.sort((a, b) => b.value - a.value)
      .map((f) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[f.i]}"></i>${f.s} &rarr; export</span>
        <strong>${fmtGdp(f.value * 1e6)}</strong></div>`)
      .join('');
    setPanel(`
      ${actionHead('🚛 Trade — negotiate transit', Game.getNation(S))}
      <p class="hint-block">Propose a toll to <strong>${escapeHtml(tName)}</strong> for carrying your exports to market
      (${linkLabel(link)}). They weigh your offer against their size, need and relations.</p>
      ${flows.length ? rows : '<div class="warn-box">No surpluses to export.</div>'}
      <div class="stat"><div class="label">Exported value</div><div class="value">${fmtGdp(total * 1e6)}</div></div>
      <div class="slider-row">
        <div class="label">Your toll offer to ${escapeHtml(tName)}: <strong id="toll-val">${start}%</strong></div>
        <input type="range" id="toll-slider" min="5" max="60" value="${start}" ${flows.length ? '' : 'disabled'} />
      </div>
      <div class="stat"><div class="label">Transit toll to ${escapeHtml(tName)}</div><div class="value deficit" id="toll-cut">&minus;${fmtGdp(benefit * base * 1e6)}</div></div>
      <div class="stat"><div class="label">Your net GDP boost</div><div class="value surplus" id="toll-net">+${fmtGdp(benefit * (1 - base) * 1e6)}</div></div>
      <div id="deal-response"></div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go" id="a-propose" ${flows.length ? '' : 'disabled'}>Propose deal</button>
      </div>
    `);
    const slider = document.getElementById('toll-slider');
    const refresh = () => {
      const p = +slider.value / 100;
      document.getElementById('toll-val').textContent = slider.value + '%';
      document.getElementById('toll-cut').innerHTML = '&minus;' + fmtGdp(benefit * p * 1e6);
      document.getElementById('toll-net').innerHTML = '+' + fmtGdp(benefit * (1 - p) * 1e6);
      document.getElementById('deal-response').innerHTML = ''; // stale verdict on change
    };
    if (slider) slider.oninput = refresh;
    document.getElementById('a-back').onclick = renderTradePrompt;
    document.getElementById('a-propose').onclick = () => {
      if (!flows.length) return;
      const p = +slider.value / 100;
      const v = evalTransit(S, T, base, total);
      const box = document.getElementById('deal-response');
      const why = `<div class="deal-why">${transitReasons(v)}</div>`;
      const finalize = (toll) => {
        const net = benefit * (1 - toll), cut = benefit * toll;
        A = null; clearVisuals();
        Game.boostGdp(S, net * 1e6);
        Game.boostGdp(T, cut * 1e6);
        Market.update();
        flash(`🚂 <strong>${escapeHtml(Game.getNation(S).name)}</strong> reached the market via <strong>${escapeHtml(tName)}</strong> at ${Math.round(toll * 100)}% toll — net +${fmtGdp(net * 1e6)}.`, 'good');
        completeTurn();
      };
      if (p >= v.ask - 0.005) {
        box.innerHTML = `<div class="deal-verdict accept">✅ ${escapeHtml(tName)} accepts your ${Math.round(p * 100)}% offer.${why}</div>
          <button class="btn go" id="a-sign">Sign at ${Math.round(p * 100)}%</button>`;
        document.getElementById('a-sign').onclick = () => finalize(p);
      } else if (p >= v.ask * COUNTER_FLOOR) {
        const cp = Math.round(v.ask * 100);
        box.innerHTML = `<div class="deal-verdict counter">↔️ ${escapeHtml(tName)} counters at <strong>${cp}%</strong>.${why}</div>
          <button class="btn go" id="a-sign">Accept ${cp}% counter</button>`;
        document.getElementById('a-sign').onclick = () => finalize(v.ask);
      } else {
        box.innerHTML = `<div class="deal-verdict decline">❌ ${escapeHtml(tName)} declines &mdash; too stingy.${why}</div>`;
      }
    };
  }

  // external deal: sell ALL surpluses to Canada/Mexico/world at market price
  function renderExternalPreview(partner) {
    const ms = Market.nationSurplus(A.nid);
    const prices = Market.getPrices();
    const e = MapModes.getEconomy();
    const flows = e.sectors
      .map((s, i) => ({ i, s, vol: Math.max(0, ms.surplus[i]) }))
      .filter((f) => f.vol > 1)
      .map((f) => ({ ...f, value: f.vol * (prices[f.i] / 100) }));
    const total = flows.reduce((s, f) => s + f.value, 0);
    const gain = total * TRADE_GAIN;
    const rows = flows.sort((a, b) => b.value - a.value)
      .map((f) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[f.i]}"></i>${f.s} &rarr; export</span>
        <strong>${fmtGdp(f.value * 1e6)}</strong></div>`)
      .join('');
    setPanel(`
      ${actionHead('🚛 Trade — export preview', Game.getNation(A.nid))}
      <p class="hint-block">Selling every surplus to <strong>${escapeHtml(partner)}</strong> at market prices through your export points.</p>
      ${flows.length ? rows : '<div class="warn-box">No surpluses to export.</div>'}
      <div class="stat"><div class="label">Exported value</div><div class="value">${fmtGdp(total * 1e6)}</div></div>
      <div class="stat"><div class="label">Your GDP boost</div><div class="value">+${fmtGdp(gain * 1e6)}</div></div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go" id="a-go" ${flows.length ? '' : 'disabled'}>Sign export deal</button>
      </div>
    `);
    document.getElementById('a-back').onclick = renderTradePrompt;
    document.getElementById('a-go').onclick = () => {
      if (!flows.length) return;
      const S = A.nid, Sname = Game.getNation(S).name;
      A = null;
      clearVisuals();
      Game.boostGdp(S, gain * 1e6);
      Market.update();
      flash(`🌐 <strong>${escapeHtml(Sname)}</strong> exported ${fmtGdp(total * 1e6)} to ${escapeHtml(partner)} — GDP +${fmtGdp(gain * 1e6)}.`, 'good');
      completeTurn();
    };
  }

  function renderTradePreview(tid) {
    const tName = Game.getNation(tid).name;
    const flows = tradeFlows(A.nid, tid);
    const total = flows.reduce((s, f) => s + f.value, 0);
    const gain = total * TRADE_GAIN;
    const rows = flows
      .sort((a, b) => b.value - a.value)
      .map((f) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[f.i]}"></i>${f.s}
          ${f.sell > f.buy ? '&rarr; them' : '&larr; us'}</span><strong>${fmtGdp(f.value * 1e6)}</strong></div>`)
      .join('');
    setPanel(`
      ${actionHead('🚛 Trade — preview', Game.getNation(A.nid))}
      <p class="hint-block">Deal with <strong>${escapeHtml(tName)}</strong>: surpluses flow to whoever runs the
      matching deficit, valued at current market prices.</p>
      ${flows.length ? rows : '<div class="warn-box">No matching surplus/deficit pairs — nothing to trade.</div>'}
      <div class="stat"><div class="label">Traded value</div><div class="value">${fmtGdp(total * 1e6)}</div></div>
      <div class="stat"><div class="label">GDP boost (each side)</div><div class="value">+${fmtGdp(gain * 1e6)}</div></div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go" id="a-go" ${flows.length ? '' : 'disabled'}>Sign trade deal</button>
      </div>
    `);
    document.getElementById('a-back').onclick = () => { A.pending = null; setSelectOutline(nationOutline(A.nid)); renderTradePrompt(); };
    document.getElementById('a-go').onclick = () => flows.length && confirmTrade(tid, gain);
  }

  function confirmTrade(tid, gain) {
    const S = A.nid;
    const Sname = Game.getNation(S).name, Tname = Game.getNation(tid).name;
    A = null;
    clearVisuals();
    Game.boostGdp(S, gain * 1e6);
    Game.boostGdp(tid, gain * 1e6);
    Market.update(); // traded supply moves the prices
    flash(`🚛 <strong>${escapeHtml(Sname)}</strong> and <strong>${escapeHtml(Tname)}</strong> signed a trade deal — both GDPs +${fmtGdp(gain * 1e6)}.`, 'good');
    completeTurn();
  }

  /* ================================================================= */
  /* ANNEX                                                             */
  /* ================================================================= */
  function startAnnex(nid) {
    const me = Game.nationDemographics(nid);
    // hard block: can't annex FROM a same-lean nation that is bigger than you
    const blocked = new Set();
    for (const [oid, n] of Game.nations) {
      if (oid === nid) continue;
      const d = Game.nationDemographics(oid);
      if (d.lean === me.lean && (d.gdp > me.gdp || d.pop > me.pop)) blocked.add(oid);
    }
    const shell = Game.blueShell(nid);
    A = { type: 'annex', nid, chosen: new Set(), blocked, before: me, selectable: new Set(), shell, capFactor: 2 - shell };
    recomputeAnnexSelectable();
    if (A.selectable.size === 0) {
      A = null;
      flash('No counties you can annex right now (neighbors are protected or too strong).', 'warn');
      return select('nation', nid);
    }
    prevColorMode = store.colorMode;
    setColorMode('political');
    setSelectOutline(nationOutline(nid));
    refreshAnnex();
  }

  function recomputeAnnexSelectable() {
    const sel = new Set();
    const frontier = new Set([...Game.getNation(A.nid).counties, ...A.chosen]);
    for (const f of frontier) {
      for (const nb of Game.countyNeighbors(f)) {
        const o = Game.getOwner(nb);
        if (o && o !== A.nid && !A.blocked.has(o) && !A.chosen.has(nb)) sel.add(nb);
      }
    }
    A.selectable = sel;
  }

  function clickAnnex(d) {
    const fips = Game.areaIdOf(d.id);
    if (A.chosen.has(fips)) {
      A.chosen.delete(fips);
      recomputeAnnexSelectable();
      return refreshAnnex();
    }
    if (!A.selectable.has(fips)) return;
    // selection cap: capFactor x current pop/gdp (halved for top-tier nations)
    const added = Game.demographics([...A.chosen, fips]);
    if (added.pop >= A.capFactor * A.before.pop || added.gdp >= A.capFactor * A.before.gdp) {
      flash('Selection capped — your armies can only mobilize so far.', 'warn');
      return;
    }
    A.chosen.add(fips);
    recomputeAnnexSelectable();
    refreshAnnex();
  }

  function refreshAnnex() {
    const keep = new Set([...Game.getNation(A.nid).counties, ...A.selectable, ...A.chosen]);
    dimExcept(keep);
    renderAnnexPanel();
  }

  function renderAnnexPanel() {
    const n = Game.getNation(A.nid);
    const added = Game.demographics(A.chosen);
    const after = Game.demographics([...Game.getNation(A.nid).counties, ...A.chosen]);
    const assess = A.chosen.size ? CivilWar.assess(A.before, added, after) : { triggered: false, reasons: [] };
    const reasons = assess.reasons || [];
    const triggerHtml = A.chosen.size === 0 ? '' : assess.triggered
      ? `<div class="warn-box">⚔️ <strong>This means civil war.</strong> Triggered by:
          ${reasons.includes('flip') ? '<span class="tag">party flip</span>' : ''}
          ${reasons.includes('gdp') ? '<span class="tag">GDP &gt; yours</span>' : ''}
          ${reasons.includes('pop') ? '<span class="tag">population &gt; yours</span>' : ''}
          Outcome decided by dice on confirm.</div>`
      : `<div class="ok-box">✓ Peaceful annexation — no civil war triggered.</div>`;
    setPanel(`
      ${actionHead('⚔️ Annex counties', n)}
      <p class="hint-block">Click <strong>highlighted counties</strong> bordering your nation to add them. Click a chosen
      county again to drop it.</p>
      <div class="stat"><div class="label">Counties chosen</div><div class="value">${A.chosen.size}</div></div>
      <div class="stat"><div class="label">Would-be population</div><div class="value">${fmtPop(after.pop)} <span class="delta">${deltaPop(added.pop)}</span></div></div>
      <div class="stat"><div class="label">Would-be GDP</div><div class="value">${fmtGdp(after.gdp)} <span class="delta">${deltaGdp(added.gdp)}</span></div></div>
      <div class="stat"><div class="label">Would-be political leaning</div>${renderPolitics(after)}</div>
      ${triggerHtml}
      <div class="btn-row">
        <button class="btn ghost" id="a-cancel">Cancel</button>
        <button class="btn go" id="a-go" ${A.chosen.size ? '' : 'disabled'}>${assess.triggered ? 'Declare war' : 'Annex'} ${A.chosen.size ? '(' + A.chosen.size + ')' : ''}</button>
      </div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
    document.getElementById('a-go').onclick = confirmAnnex;
  }

  function confirmAnnex() {
    if (!A.chosen.size) return;
    const nid = A.nid;
    const chosen = [...A.chosen];
    // nation that owns the plurality of the contested counties (splinter parent)
    const victimTally = {};
    chosen.forEach((f) => { const o = Game.getOwner(f); victimTally[o] = (victimTally[o] || 0) + 1; });
    let victim = nid, vc = -1;
    for (const [o, c] of Object.entries(victimTally)) if (c > vc) { victim = o; vc = c; }
    const before = Game.nationDemographics(nid);
    const added = Game.demographics(chosen);
    const after = Game.demographics([...Game.getNation(nid).counties, ...chosen]);
    const res = CivilWar.resolve(before, added, after, { scoreMult: 1 + (A.shell || 0) });

    let msg, kind;
    if (!res.triggered) {
      Game.moveCounties(chosen, nid);
      msg = `Annexed <strong>${chosen.length}</strong> ${plural(chosen.length, 'county', 'counties')} peacefully.`;
      kind = 'good';
    } else if (res.outcome === 'victory') {
      Game.moveCounties(chosen, nid);
      Game.applyCivilWarCost(victim, nid, res.score);
      msg = `${cwLine(res)} <strong>Complete victory!</strong> All ${chosen.length} counties annexed.`;
      kind = 'good';
    } else if (res.outcome === 'partial') {
      const taken = partialSubset(nid, chosen, before.lean);
      Game.moveCounties(taken, nid);
      Game.applyCivilWarCost(victim, nid, Math.round(res.score / 2));
      msg = `${cwLine(res)} <strong>Partial victory.</strong> Held ${taken.length} of ${chosen.length} counties (same-lean & connected).`;
      kind = taken.length ? 'good' : 'warn';
    } else {
      const bornIds = fragment(chosen, nid);
      TurnSystem.insertAfter(victim, bornIds);
      Game.applyCivilWarCost(nid, null, res.score); // the failed aggressor bleeds population
      const born = bornIds.length;
      msg = born
        ? `${cwLine(res)} <strong>The union fell apart!</strong> The ${chosen.length} counties splintered into ${born} new ${plural(born, 'nation', 'nations')}.`
        : `${cwLine(res)} <strong>The union fell apart!</strong> The ${chosen.length} counties scattered and were absorbed by neighboring nations.`;
      kind = 'bad';
    }
    A = null;
    restoreColorMode();
    clearVisuals();
    flash(msg, kind);
    completeTurn();
  }

  // Partial victory: same-lean chosen counties reachable from the attacker's border.
  function partialSubset(nid, chosen, attackerLean) {
    const same = new Set(chosen.filter((f) => Game.leanOf(f)?.lean === attackerLean));
    const reached = new Set();
    const stack = [];
    for (const f of same) {
      if (Game.countyNeighbors(f).some((nb) => Game.getOwner(nb) === nid)) { reached.add(f); stack.push(f); }
    }
    while (stack.length) {
      const c = stack.pop();
      for (const nb of Game.countyNeighbors(c)) if (same.has(nb) && !reached.has(nb)) { reached.add(nb); stack.push(nb); }
    }
    return [...reached];
  }

  // Fall apart: chosen counties break into new nations (>=10 counties each); small
  // fragments join their nearest neighbor — never the failed aggressor.
  function fragment(chosen, attackerId) {
    return Game.breakApart(chosen, { exclude: attackerId });
  }

  /* ================================================================= */
  /* RELEASE (next turn)                                               */
  /* ================================================================= */
  function startRelease(nid) {
    flash('🕊️ Release counties is coming next.', 'warn');
    select('nation', nid);
  }
  function clickRelease() {}

  /* ---- panel/util helpers ---- */
  function setPanel(html) { document.getElementById('panel').innerHTML = html; }
  function actionHead(title, n) {
    return `<div class="card-head"><span class="swatch" style="background:${n.color}"></span><h2>${escapeHtml(n.name)}</h2></div>
      <div class="kind action-kind">${title}</div>`;
  }
  const leanName = (l) => (l === 'D' ? 'Democratic' : l === 'R' ? 'Republican' : '—');
  function cwLine(res) {
    return `🎲 ${res.dice.join(' × ')} &nbsp; ${res.points} pts × ${res.product} = <strong>${res.score}</strong>.`;
  }
  const plural = (n, a, b) => (n === 1 ? a : b);
  const deltaPop = (n) => (n ? `+${fmtPop(n)}` : '');
  const deltaGdp = (n) => (n ? `+${fmtGdp(n)}` : '');

  return { isActive, start, onHover, onClick, cancel };
})();
