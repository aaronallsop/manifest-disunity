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

  /*
   * Plan (no mutation): who defects to T, who secedes, who stays with S.
   *
   * Membership is decided by AFFINITY on the two axes, not by a matching letter.
   * The old rule was `Game.leanOf(c).lean === Tlean` — with two letters, "leans
   * the same way as the target" and "leans differently from me" partitioned the
   * map cleanly, and when S and T happened to share a letter the whole border
   * region defected to a politically identical neighbour for no reason.
   *
   * With six ideologies the question is how CLOSE an Area is to each side:
   *   defect — closer to T than to S, and touching T
   *   secede — far from S, and cut off from T
   *   remnant — everyone else
   */
  function planSplinter(S, T) {
    const sMix = Game.nationDemographics(S).mix;
    const tMix = Game.nationDemographics(T).mix;
    const sCentre = Ideology.centroid(sMix), tCentre = Ideology.centroid(tMix);
    const threshold = TUNE.get('war.splinterAffinity');
    const Sc = [...Game.getNation(S).counties];
    const touchesT = (c) => Game.countyNeighbors(c).some((nb) => Game.getOwner(nb) === T);

    const toS = {}, toT = {};
    for (const c of Sc) {
      const p = Game.areaPolitics(c);
      const centre = p ? p.centroid : sCentre;
      toS[c] = Ideology.affinity(centre, sCentre);
      toT[c] = Ideology.affinity(centre, tCentre);
    }
    const defect = Sc.filter((c) => toT[c] > toS[c] && touchesT(c));
    const defectSet = new Set(defect);
    const rest = Sc.filter((c) => !defectSet.has(c));
    const secede = rest.filter((c) => toS[c] < threshold && !touchesT(c));
    const seceded = new Set(secede);
    const remnant = rest.filter((c) => !seceded.has(c));
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
    if (store.rng.stream('unite').chance(P)) {
      Game.mergeInto(S, tid);
      flash(`🤝 <strong>${escapeHtml(Tname)}</strong> united into <strong>${escapeHtml(Game.getNation(S).name)}</strong>.`, 'good');
    } else {
      const score = CivilWar.uniteSeverity(P, TUNE);
      const plan = planSplinter(S, tid);
      // One render for the whole fallout, not four.
      const created = Game.batch(() => {
        Game.moveCounties(plan.defect, tid, { silent: true });
        const born = Game.breakApart(plan.secede);
        Game.applyCivilWarCost(S, tid, score); // remnant bleeds population; GDP flows to the target
        return born;
      });
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
    const P = CivilWar.unitePeaceChance(me, them, shell, TUNE);
    A.chance = P;
    const pct = Math.round(P * 100);
    const risky = P < 0.5;
    const flip = me.dominant >= 0 && combined.dominant >= 0 && me.dominant !== combined.dominant;
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
      ${flip ? `<div class="warn-box">⚠️ Flips your leading ideology ${leanName(me.dominant)} &rarr; ${leanName(combined.dominant)} &mdash; lowers the odds.</div>` : ''}
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
  /*
   * Trade sells SURPLUS PRODUCTION for MONEY.
   *
   * It used to call Game.boostGdp on both sides — minting GDP out of nothing,
   * every turn, with no cost, no cooldown, no capacity and no depletion. The
   * goods had already been counted in GDP when they were produced, so the deal
   * created output twice; meanwhile the treasury, which every priced action now
   * draws on, received nothing at all, and eleven of the fifty-one nations ran a
   * permanent structural deficit from turn 1 with no recovery path.
   *
   * Three things make it a decision rather than a free click:
   *   CAPACITY  — you can only move what your ports, rail hubs and border
   *               gateways can physically carry. The baked transport/trade data
   *               finally does something.
   *   COOLDOWN  — the same partner cannot be squeezed every single turn.
   *   PRICING   — the world market pays a FRACTION of the bilateral rate. It used
   *               to be the better click for 41 of 51 nations by 1.7x-50x,
   *               because it absorbs your whole surplus while a bilateral deal is
   *               clipped by whatever deficit the neighbour happens to run. The
   *               capacity cap removes that volume advantage and the penalty
   *               inverts the margin, so the world market is the low-margin
   *               fallback and a well-matched neighbour is the skilled play.
   */
  const TRADE_GAIN = () => TUNE.get('trade.gain');
  // transit routing: a landlocked nation reaches the market through a neighbour
  // that has export access; the transit nation takes a toll, discounted by the
  // corridor it controls (rail beats highway).
  const TRANSIT_TOLL = () => TUNE.get('trade.transitToll');
  const linkDiscount = (link) =>
    (link === 'rail' ? TUNE.get('trade.railDiscount')
      : link === 'highway' ? TUNE.get('trade.highwayDiscount') : 0);
  const linkLabel = (link) => (link === 'rail' ? '\u{1F682} rail corridor' : link === 'highway' ? '\u{1F6E3} highway' : '\u{1F69A} overland');

  // Export access and trade capacity are model quantities; Game owns the baked
  // trade/transport data they read.
  const nationTradeCapacityFor = (nid) => Game.tradeCapacity(nid).total;
  const hasExportAccess = (nid) => Game.exportAccess(nid).any;

  /** Turns until `nid` may deal with `key` again ('world', 'Canada', or a nation id). */
  function tradeCooldownLeft(nid, key) {
    const n = Game.getNation(nid);
    if (!n || !n.tradeCooldown) return 0;
    const last = n.tradeCooldown[key];
    if (last == null) return 0;
    return Math.max(0, TUNE.get('trade.cooldownTurns') - (World.getTurn() - last));
  }
  function markTraded(nid, key) {
    const n = Game.getNation(nid);
    if (n) (n.tradeCooldown || (n.tradeCooldown = {}))[key] = World.getTurn();
  }

  /** A nation's positive surplus by sector, valued at market prices ($M). */
  function exportFlows(nid) {
    const ms = Market.nationSurplus(nid, TUNE);
    const prices = Market.getPrices();
    const e = MapModes.getEconomy();
    if (!ms || !prices || !e) return [];
    return e.sectors
      .map((s, i) => ({ i, s, vol: Math.max(0, ms.surplus[i]) }))
      .filter((f) => f.vol > 1)
      .map((f) => ({ ...f, value: f.vol * (prices[f.i] / 100) }));
  }

  /**
   * Scale a set of flows down to fit a capacity, preserving their shape.
   * Returns {flows, total, capped, uncappedTotal}.
   */
  function applyCapacity(flows, capacity) {
    const uncappedTotal = flows.reduce((s, f) => s + f.value, 0);
    if (uncappedTotal <= capacity || uncappedTotal <= 0) {
      return { flows, total: uncappedTotal, capped: false, uncappedTotal };
    }
    const k = capacity / uncappedTotal;
    return {
      flows: flows.map((f) => ({ ...f, vol: f.vol * k, value: f.value * k })),
      total: capacity,
      capped: true,
      uncappedTotal,
    };
  }

  /** A short line describing the capacity that limited a deal. */
  function capacityNote(nid, res, viaName) {
    const cap = nationTradeCapacity(nid);
    const who = viaName ? `${escapeHtml(viaName)}'s` : 'Your';
    const detail = `${who} ports, rail hubs and border gateways can move ${fmtGdp(cap.total * 1e6)} a turn` +
      ` (${cap.ports} ${plural(cap.ports, 'port', 'ports')}, ${cap.railHubs} rail ` +
      `${plural(cap.railHubs, 'hub', 'hubs')}, ${cap.gateways} ${plural(cap.gateways, 'gateway', 'gateways')}).`;
    return res.capped
      ? `<div class="warn-box">\u{1F6A2} Capped at <strong>${fmtGdp(res.total * 1e6)}</strong> of ` +
        `${fmtGdp(res.uncappedTotal * 1e6)} available. ${detail}</div>`
      : `<div class="geo-row"><span>${detail}</span></div>`;
  }

  function startTrade(nid) {
    const eligible = new Set(Game.adjacentNations(nid));
    A = { type: 'trade', nid, eligible, pending: null };
    if (eligible.size === 0) {
      A = null;
      flash('No neighbouring nations to trade with.', 'warn');
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
    const ms = Market.nationSurplus(S, TUNE), ts = Market.nationSurplus(T, TUNE);
    const prices = Market.getPrices();
    const e = MapModes.getEconomy();
    if (!ms || !ts || !prices) return [];
    const flows = [];
    e.sectors.forEach((s, i) => {
      const sell = Math.min(Math.max(0, ms.surplus[i]), Math.max(0, -ts.surplus[i])); // us -> them
      const buy = Math.min(Math.max(0, ts.surplus[i]), Math.max(0, -ms.surplus[i])); // them -> us
      if (sell + buy > 1) flows.push({ i, s, sell, buy, vol: sell + buy, value: (sell + buy) * (prices[i] / 100) });
    });
    return flows;
  }

  function renderTradePrompt() {
    const n = Game.getNation(A.nid);
    const acc = nationExportAccess(A.nid);
    const cap = nationTradeCapacity(A.nid);
    const penalty = TUNE.get('trade.worldMarketPenalty');
    const cd = (key) => tradeCooldownLeft(A.nid, key);
    const extBtn = (id, key, label, enabled, why) => {
      const left = cd(key);
      const off = !enabled || left > 0;
      const title = left > 0 ? `Recently traded — ${left} more world ${plural(left, 'turn', 'turns')}` : why;
      return `<button class="btn ghost" id="${id}" ${off ? `disabled title="${title}"` : ''}>${label}${left > 0 ? ` <span class="act-note">${left}</span>` : ''}</button>`;
    };
    const ext = `
      <div class="label" style="margin-top:10px">External partners &middot; via export points</div>
      <div class="btn-row">
        ${extBtn('a-canada', 'Canada', '\u{1F1E8}\u{1F1E6} Canada', acc.canada, 'Needs a Canada border gateway')}
        ${extBtn('a-mexico', 'Mexico', '\u{1F1F2}\u{1F1FD} Mexico', acc.mexico, 'Needs a Mexico border gateway')}
        ${extBtn('a-world', 'world', '\u{1F310} World market', acc.any, 'Needs a port or border gateway')}
      </div>
      <div class="geo-row"><span>External sales pay <strong>${Math.round(penalty * 100)}%</strong> of the bilateral rate &mdash; volume without margin.</span></div>
      <div class="geo-row"><span>Export capacity</span><strong>${fmtGdp(cap.total * 1e6)} / turn</strong></div>
      ${acc.any ? '' : '<div class="warn-box">⛔ Landlocked &mdash; no port or Canada/Mexico gateway. Route through a neighbour below.</div>'}`;

    /*
     * Transit needs a REAL shared border and a REAL corridor.
     *
     * The route list came from state-level adjacency, which build_adjacency.py
     * deliberately extends across water (Alaska borders every Pacific state), so
     * California was offered Alaska and Hawaii as "overland" routes on turn 1 —
     * and `transitLink` returning null was rendered as "overland" at the full
     * 35% toll rather than as "no route".
     */
    const routes = Game.borderingNations(A.nid)
      .filter((t) => nationExportAccess(t).any)
      .map((t) => ({ t, link: transitLink(A.nid, t) }))
      .filter((r) => r.link !== null);
    const transitHtml = routes.length ? `
      <div class="label" style="margin-top:12px">Transit routes &middot; reach the market through a neighbour</div>
      ${routes.map((r) => `<button class="btn ghost transit-btn" data-t="${r.t}" ${tradeCooldownLeft(A.nid, r.t) ? 'disabled' : ''}>
          <span>${escapeHtml(Game.getNation(r.t).name)}</span>
          <span class="transit-meta">${linkLabel(r.link)} &middot; toll ${Math.round(TRANSIT_TOLL() * (1 - linkDiscount(r.link)) * 100)}%</span>
        </button>`).join('')}` : '';

    setPanel(`
      ${actionHead('\u{1F69B} Trade with nation', n)}
      <p class="hint-block">Click a <strong>highlighted neighbouring nation</strong> to preview a trade deal:
      each side sells its <strong>surplus resources</strong> to the other at market price. Income goes to the
      <strong>treasury</strong>, not to GDP &mdash; the goods were already counted when they were made.</p>
      ${ext}
      ${transitHtml}
      <div class="btn-row"><button class="btn ghost" id="a-cancel">Cancel</button></div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
    const wire = (id, key, label) => {
      const b = document.getElementById(id);
      if (b && !b.hasAttribute('disabled')) b.onclick = () => renderExternalPreview(key, label);
    };
    wire('a-canada', 'Canada', 'Canada');
    wire('a-mexico', 'Mexico', 'Mexico');
    wire('a-world', 'world', 'the world market');
    document.querySelectorAll('.transit-btn').forEach((b) => {
      if (!b.hasAttribute('disabled')) b.onclick = () => renderTransitPreview(b.dataset.t);
    });
  }

  // how the transit nation T judges a proposed toll p (its cut, higher = better
  // for T). Returns its target ask + a verdict + brief reasoning.
  function evalTransit(S, T, base, total) {
    const dS = Game.nationDemographics(S), dT = Game.nationDemographics(T);
    const relSize = dT.gdp / (dS.gdp + dT.gdp);        // T's share of the pair's GDP
    const sizeMult = 0.75 + 0.5 * relSize;             // bigger T holds out for more
    /*
     * Political alignment over the FULL party vector. It compared only the
     * Democratic share, so two nations agreed insofar as their dem percentages
     * matched — gop, Other and every emergent movement ignored. Once a
     * 30%-separatist nation exists its dem share compresses to ~30 and it reads
     * as "relations are warm" with a mainstream nation that happens to be at 30
     * while the two have nothing in common. Parties.setup already runs at init,
     * so this is misreading at turn 0, not eventually.
     */
    const sS = CivilWar.shares(dS), sT = CivilWar.shares(dT);
    let dist = 0;
    for (const k of new Set([...Object.keys(sS), ...Object.keys(sT)])) {
      dist += Math.abs((sS[k] || 0) - (sT[k] || 0));
    }
    const rel = Math.max(-1, Math.min(1, 1 - dist / TUNE.get('trade.alignmentScale')));
    const relMult = 1 - 0.2 * rel;                     // warm relations -> asks less
    const incomeToT = total * TRADE_GAIN() * base;     // ballpark toll income ($M)
    const need = Math.max(0, Math.min(1, (incomeToT / (dT.gdp / 1e6)) * TUNE.get('trade.needScale')));
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
    const base = TRANSIT_TOLL() * (1 - linkDiscount(link)); // the "fair" corridor rate
    // Your goods leave through THEIR export points, so THEIR capacity is the limit.
    const res = applyCapacity(exportFlows(S), nationTradeCapacity(T).total);
    const flows = res.flows;
    const total = res.total;
    const benefit = total * TRADE_GAIN() * TUNE.get('trade.worldMarketPenalty');
    // Open below the corridor rate so the default is a lowball rather than an
    // offer they accept 89% of the time without the player deciding anything.
    const start = Math.max(5, Math.round(base * TUNE.get('trade.openingOfferFactor') * 100));
    const rows = flows.slice().sort((a, b) => b.value - a.value)
      .map((f) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[f.i]}"></i>${f.s} &rarr; export</span>
        <strong>${fmtGdp(f.value * 1e6)}</strong></div>`)
      .join('');
    setPanel(`
      ${actionHead('\u{1F69B} Trade — negotiate transit', Game.getNation(S))}
      <p class="hint-block">Propose a toll to <strong>${escapeHtml(tName)}</strong> for carrying your exports to market
      (${linkLabel(link)}). They weigh your offer against their size, need and relations.</p>
      ${flows.length ? rows : '<div class="warn-box">No surpluses to export.</div>'}
      ${capacityNote(S, res, tName)}
      <div class="stat"><div class="label">Exported value</div><div class="value">${fmtGdp(total * 1e6)}</div></div>
      <div class="slider-row">
        <div class="label">Your toll offer to ${escapeHtml(tName)}: <strong id="toll-val">${start}%</strong></div>
        <input type="range" id="toll-slider" min="5" max="60" value="${start}" ${flows.length ? '' : 'disabled'} />
      </div>
      <div class="stat"><div class="label">Transit toll to ${escapeHtml(tName)}</div><div class="value deficit" id="toll-cut">${fmtGdp(-benefit * base * 1e6)}</div></div>
      <div class="stat"><div class="label">Your net treasury income</div><div class="value surplus" id="toll-net">+${fmtGdp(benefit * (1 - base) * 1e6)}</div></div>
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
      document.getElementById('toll-cut').innerHTML = fmtGdp(-benefit * p * 1e6);
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
        Game.batch(() => {
          Game.earn(S, net * 1e6);
          Game.earn(T, cut * 1e6);
          markTraded(S, T);
          markTraded(S, 'world');
        });
        Market.update(TUNE);
        flash(`\u{1F682} <strong>${escapeHtml(Game.getNation(S).name)}</strong> reached the market via <strong>${escapeHtml(tName)}</strong> at ${Math.round(toll * 100)}% toll &mdash; treasury +${fmtGdp(net * 1e6)}.`, 'good');
        completeTurn();
      };
      if (p >= v.ask - 0.005) {
        box.innerHTML = `<div class="deal-verdict accept">✅ ${escapeHtml(tName)} accepts your ${Math.round(p * 100)}% offer.${why}</div>
          <button class="btn go" id="a-sign">Sign at ${Math.round(p * 100)}%</button>`;
        document.getElementById('a-sign').onclick = () => finalize(p);
      } else if (p >= v.ask * TUNE.get('trade.counterFloor')) {
        const cp = Math.round(v.ask * 100);
        box.innerHTML = `<div class="deal-verdict counter">↔️ ${escapeHtml(tName)} counters at <strong>${cp}%</strong>.${why}</div>
          <button class="btn go" id="a-sign">Accept ${cp}% counter</button>`;
        document.getElementById('a-sign').onclick = () => finalize(v.ask);
      } else {
        box.innerHTML = `<div class="deal-verdict decline">❌ ${escapeHtml(tName)} declines &mdash; too stingy.${why}</div>`;
      }
    };
  }

  // external deal: sell surplus to Canada/Mexico/the world, capped by capacity
  // and paid at a FRACTION of the bilateral rate
  function renderExternalPreview(key, partner) {
    const S = A.nid;
    const res = applyCapacity(exportFlows(S), nationTradeCapacity(S).total);
    const flows = res.flows, total = res.total;
    const penalty = TUNE.get('trade.worldMarketPenalty');
    const gain = total * TRADE_GAIN() * penalty;
    const rows = flows.slice().sort((a, b) => b.value - a.value)
      .map((f) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[f.i]}"></i>${f.s} &rarr; export</span>
        <strong>${fmtGdp(f.value * 1e6)}</strong></div>`)
      .join('');
    setPanel(`
      ${actionHead('\u{1F69B} Trade — export preview', Game.getNation(S))}
      <p class="hint-block">Selling surplus to <strong>${escapeHtml(partner)}</strong> at market prices through your
      export points. An untargeted sale pays <strong>${Math.round(penalty * 100)}%</strong> of what a matched
      neighbour deal pays.</p>
      ${flows.length ? rows : '<div class="warn-box">No surpluses to export.</div>'}
      ${capacityNote(S, res)}
      <div class="stat"><div class="label">Exported value</div><div class="value">${fmtGdp(total * 1e6)}</div></div>
      <div class="stat"><div class="label">Your treasury income</div><div class="value surplus">+${fmtGdp(gain * 1e6)}</div></div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go" id="a-go" ${flows.length ? '' : 'disabled'}>Sign export deal</button>
      </div>
    `);
    document.getElementById('a-back').onclick = renderTradePrompt;
    document.getElementById('a-go').onclick = () => {
      if (!flows.length) return;
      const Sname = Game.getNation(S).name;
      A = null;
      clearVisuals();
      Game.batch(() => {
        Game.earn(S, gain * 1e6);
        markTraded(S, key);
        markTraded(S, 'world');
      });
      Market.update(TUNE);
      flash(`\u{1F310} <strong>${escapeHtml(Sname)}</strong> exported ${fmtGdp(total * 1e6)} to ${escapeHtml(partner)} &mdash; treasury +${fmtGdp(gain * 1e6)}.`, 'good');
      completeTurn();
    };
  }

  function renderTradePreview(tid) {
    const S = A.nid;
    const tName = Game.getNation(tid).name;
    // Both sides must be able to physically move the goods.
    const limit = Math.min(nationTradeCapacity(S).total, nationTradeCapacity(tid).total);
    const res = applyCapacity(tradeFlows(S, tid), limit);
    const flows = res.flows, total = res.total;
    const gain = total * TRADE_GAIN(); // FULL rate: a matched deal is the good one
    const cd = tradeCooldownLeft(S, tid);
    const rows = flows.slice()
      .sort((a, b) => b.value - a.value)
      .map((f) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[f.i]}"></i>${f.s}
          ${f.sell > f.buy ? '&rarr; them' : '&larr; us'}</span><strong>${fmtGdp(f.value * 1e6)}</strong></div>`)
      .join('');
    setPanel(`
      ${actionHead('\u{1F69B} Trade — preview', Game.getNation(S))}
      <p class="hint-block">Deal with <strong>${escapeHtml(tName)}</strong>: surpluses flow to whoever runs the
      matching deficit, valued at current market prices. A matched deal pays the full rate to both sides.</p>
      ${flows.length ? rows : '<div class="warn-box">No matching surplus/deficit pairs &mdash; nothing to trade.</div>'}
      ${flows.length ? capacityNote(S, res) : ''}
      <div class="stat"><div class="label">Traded value</div><div class="value">${fmtGdp(total * 1e6)}</div></div>
      <div class="stat"><div class="label">Treasury income (each side)</div><div class="value surplus">+${fmtGdp(gain * 1e6)}</div></div>
      ${cd ? `<div class="warn-box">⏳ You dealt with ${escapeHtml(tName)} recently &mdash; ${cd} more world ${plural(cd, 'turn', 'turns')}.</div>` : ''}
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go" id="a-go" ${flows.length && !cd ? '' : 'disabled'}>Sign trade deal</button>
      </div>
    `);
    document.getElementById('a-back').onclick = () => { A.pending = null; setSelectOutline(nationOutline(A.nid)); renderTradePrompt(); };
    document.getElementById('a-go').onclick = () => flows.length && !cd && confirmTrade(tid, gain);
  }

  function confirmTrade(tid, gain) {
    const S = A.nid;
    const Sname = Game.getNation(S).name, Tname = Game.getNation(tid).name;
    A = null;
    clearVisuals();
    Game.batch(() => {
      Game.earn(S, gain * 1e6);
      Game.earn(tid, gain * 1e6);
      markTraded(S, tid);
      markTraded(tid, S);
    });
    Market.update(TUNE); // traded supply moves the prices
    flash(`\u{1F69B} <strong>${escapeHtml(Sname)}</strong> and <strong>${escapeHtml(Tname)}</strong> signed a trade deal &mdash; both treasuries +${fmtGdp(gain * 1e6)}.`, 'good');
    completeTurn();
  }
  /* ================================================================= */
  /* ANNEX                                                             */
  /* ================================================================= */
  /*
   * What one annexation of `chosen` Areas costs the treasury.
   * Flat per Area plus a per-head term, so swallowing a metro Area costs more
   * than swallowing empty ground. The leader tier pays a surcharge.
   */
  function annexCost(chosen, shell) {
    const pop = chosen.length ? Game.demographics(chosen).pop : 0;
    const base = chosen.length * TUNE.get('annex.costPerArea') + pop * TUNE.get('annex.costPopScale');
    return base * (1 + TUNE.get('annex.shellCostMult') * (shell || 0));
  }

  /** Turns until this nation may annex again; 0 when it is ready. */
  function annexCooldownLeft(nid) {
    const n = Game.getNation(nid);
    if (!n || !Number.isFinite(n.lastAnnexTurn)) return 0;
    const wait = TUNE.get('annex.cooldownTurns');
    return Math.max(0, wait - (World.getTurn() - n.lastAnnexTurn));
  }

  function startAnnex(nid) {
    const me = Game.nationDemographics(nid);
    const cd = annexCooldownLeft(nid);
    if (cd > 0) {
      flash(`Your armies are still regrouping &mdash; ${cd} more world ${plural(cd, 'turn', 'turns')} before you can annex again.`, 'warn');
      return select('nation', nid);
    }
    /*
     * Untouchable neighbours are decided by SIZE, not by ideology.
     *
     * The old rule blocked only same-lean nations that were bigger, which left
     * every ideological opposite wide open however large it was: Wyoming (0.59M,
     * $51B) could not touch Montana or Idaho but could chew on Colorado (5.96M,
     * $558B) freely, every turn, at no risk. A strength gate is what that rule
     * was clearly reaching for.
     */
    const factor = TUNE.get('annex.strongNeighbourFactor');
    const blocked = new Set();
    for (const [oid] of Game.nations) {
      if (oid === nid) continue;
      const d = Game.nationDemographics(oid);
      if (d.pop > me.pop * factor && d.gdp > me.gdp * factor) blocked.add(oid);
    }
    const shell = Game.blueShell(nid);
    A = {
      type: 'annex', nid, chosen: new Set(), blocked, before: me, selectable: new Set(), shell,
      budget: TUNE.get('annex.budgetAreas'),
    };
    recomputeAnnexSelectable();
    if (A.selectable.size === 0) {
      A = null;
      flash('No counties you can annex right now (every neighbour is more than ' +
        `${factor}\u00d7 your size).`, 'warn');
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
    /*
     * The cap is an ABSOLUTE per-turn budget in Areas.
     *
     * It used to be a multiple of your OWN size, which is a doubling every turn:
     * a greedy "take the largest set that stays under the trigger" play took
     * Wyoming from 27 to 1,167 of 1,676 Areas in nine turns without triggering a
     * single civil war, and California did it in three. A relative cap cannot be
     * an anti-snowball device, because it grows with the snowball.
     */
    if (A.chosen.size >= A.budget) {
      flash(`Your armies can mobilise for <strong>${A.budget}</strong> ${plural(A.budget, 'Area', 'Areas')} this turn. ` +
        'Drop one to pick another.', 'warn');
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
    const assess = A.chosen.size ? CivilWar.assess(A.before, added, after, TUNE) : { triggered: false, reasons: [] };
    const reasons = assess.reasons || [];
    const ratioPct = Math.round(TUNE.get('war.triggerSizeRatio') * 100);
    const triggerHtml = A.chosen.size === 0 ? '' : assess.triggered
      ? `<div class="warn-box">\u2694\ufe0f <strong>This means civil war.</strong> Triggered by:
          ${reasons.includes('flip') ? '<span class="tag">party flip</span>' : ''}
          ${reasons.includes('gdp') ? `<span class="tag">GDP &gt; ${ratioPct}% of yours</span>` : ''}
          ${reasons.includes('pop') ? `<span class="tag">population &gt; ${ratioPct}% of yours</span>` : ''}
          Outcome decided by dice on confirm.</div>`
      : `<div class="ok-box">\u2713 Peaceful annexation \u2014 no civil war triggered.</div>`;

    const cost = annexCost([...A.chosen], A.shell);
    const canPay = n.treasury >= cost;
    const afterTreasury = n.treasury - cost;
    const costHtml = `<div class="stat"><div class="label">Cost to mobilise</div>
      <div class="value ${canPay ? '' : 'deficit'}">${fmtGdp(cost)}</div>
      <div class="geo-row"><span>Treasury after</span><strong class="${canPay ? 'surplus' : 'deficit'}">${fmtGdp(afterTreasury)}</strong></div>
      ${A.shell ? `<div class="geo-row"><span>Leader surcharge</span><strong>+${Math.round(TUNE.get('annex.shellCostMult') * A.shell * 100)}%</strong></div>` : ''}
      ${canPay ? '' : '<div class="warn-box">\u26d4 Your treasury cannot pay for this. Drop an Area, or bank another turn of income.</div>'}
    </div>`;

    const blockedGo = !A.chosen.size || !canPay;
    setPanel(`
      ${actionHead('\u2694\ufe0f Annex counties', n)}
      <p class="hint-block">Click <strong>highlighted counties</strong> bordering your nation to add them. Click a chosen
      county again to drop it.</p>
      <div class="stat"><div class="label">Mobilisation budget</div>
        <div class="value">${A.chosen.size} / ${A.budget} ${plural(A.budget, 'Area', 'Areas')}</div>
        <div class="geo-row"><span>A fixed budget &mdash; not a share of your size, so it does not grow as you do.</span></div>
      </div>
      ${costHtml}
      <div class="stat"><div class="label">Would-be population</div><div class="value">${fmtPop(after.pop)} <span class="delta">${deltaPop(added.pop)}</span></div></div>
      <div class="stat"><div class="label">Would-be GDP</div><div class="value">${fmtGdp(after.gdp)} <span class="delta">${deltaGdp(added.gdp)}</span></div></div>
      <div class="stat"><div class="label">Would-be political leaning</div>${renderPolitics(after)}</div>
      ${triggerHtml}
      <div class="btn-row">
        <button class="btn ghost" id="a-cancel">Cancel</button>
        <button class="btn go" id="a-go" ${blockedGo ? 'disabled' : ''}>${assess.triggered ? 'Declare war' : 'Annex'} ${A.chosen.size ? '(' + A.chosen.size + ')' : ''}</button>
      </div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
    document.getElementById('a-go').onclick = confirmAnnex;
  }

  /**
   * Charge the civil-war cost to EVERY nation that lost ground, weighted by its
   * share of the contested Areas.
   *
   * One selection can span any number of nations. Charging only the plurality
   * victim meant a 180-Area annexation off 14 nations cost 13 of them nothing:
   * no population loss, no GDP transfer, no acknowledgement.
   */
  function chargeVictims(tally, total, winnerId, score) {
    for (const [oid, count] of Object.entries(tally)) {
      if (!Game.getNation(oid)) continue;
      Game.applyCivilWarCost(oid, winnerId, Math.round(score * (count / total)));
    }
  }

  function confirmAnnex() {
    if (!A.chosen.size) return;
    const nid = A.nid;
    const chosen = [...A.chosen];
    const me = Game.getNation(nid);

    // Pay first. Game.spend was exported with zero call sites; this is the first
    // action in the game that costs anything.
    const cost = annexCost(chosen, A.shell);
    if (!Game.spend(nid, cost)) {
      flash(`\u26d4 <strong>${escapeHtml(me.name)}</strong> cannot afford to mobilise (${fmtGdp(cost)} needed, ${fmtGdp(Math.max(0, me.treasury))} in the treasury).`, 'bad');
      return;
    }
    me.lastAnnexTurn = World.getTurn();

    // Who is losing ground, and how much of the contested set is theirs.
    const victimTally = {};
    chosen.forEach((f) => { const o = Game.getOwner(f); if (o && o !== nid) victimTally[o] = (victimTally[o] || 0) + 1; });
    let victim = null, vc = -1;
    for (const [o, c] of Object.entries(victimTally)) if (c > vc) { victim = o; vc = c; }

    const before = Game.nationDemographics(nid);
    const added = Game.demographics(chosen);
    const after = Game.demographics([...Game.getNation(nid).counties, ...chosen]);
    const res = CivilWar.resolve(before, added, after, { scoreMult: 1 + (A.shell || 0), rng: store.rng, tune: TUNE });
    const bill = `<span class="deal-cost">Cost ${fmtGdp(cost)}.</span>`;

    let msg, kind;
    // Every branch below is a multi-step mutation; batch() collapses each to one
    // render instead of two or three full border meshes and leaderboard rebuilds.
    if (!res.triggered) {
      Game.moveCounties(chosen, nid);
      msg = `Annexed <strong>${chosen.length}</strong> ${plural(chosen.length, 'county', 'counties')} peacefully. ${bill}`;
      kind = 'good';
    } else if (res.outcome === 'victory') {
      Game.batch(() => {
        Game.moveCounties(chosen, nid);
        chargeVictims(victimTally, chosen.length, nid, res.score);
      });
      msg = `${cwLine(res)} <strong>Complete victory!</strong> All ${chosen.length} counties annexed. ${bill}`;
      kind = 'good';
    } else if (res.outcome === 'partial') {
      const taken = partialSubset(nid, chosen, res.score);
      Game.batch(() => {
        Game.moveCounties(taken, nid);
        chargeVictims(victimTally, chosen.length, nid, Math.round(res.score / 2));
      });
      msg = `${cwLine(res)} <strong>Partial victory.</strong> Held ${taken.length} of ${chosen.length} counties &mdash; a connected front from your border. ${bill}`;
      kind = taken.length ? 'good' : 'warn';
    } else {
      // Report what actually happened territorially. A selection smaller than
      // nation.minAreas cannot form a breakaway, so its fragments go to their
      // nearest neighbour - which, with the attacker excluded, is usually the
      // nation that already owned them. That is the right OUTCOME (the defender
      // holds) and the wrong MESSAGE: the old text claimed the counties
      // "scattered and were absorbed by neighboring nations" when nothing moved.
      const ownersBefore = new Map(chosen.map((f) => [f, Game.getOwner(f)]));
      const bornIds = Game.batch(() => {
        const ids = fragment(chosen, nid);
        Game.applyCivilWarCost(nid, null, res.score); // the failed aggressor bleeds population
        return ids;
      });
      TurnSystem.insertAfter(victim || nid, bornIds);
      const born = bornIds.length;
      let changed = 0;
      for (const [f, was] of ownersBefore) if (Game.getOwner(f) !== was) changed++;
      msg = born
        ? `${cwLine(res)} <strong>The union fell apart!</strong> The ${chosen.length} counties splintered into ${born} new ${plural(born, 'nation', 'nations')}. ${bill}`
        : changed
          ? `${cwLine(res)} <strong>The offensive collapsed.</strong> ${changed} of ${chosen.length} counties changed hands in the chaos &mdash; none of them yours. ${bill}`
          : `${cwLine(res)} <strong>The offensive collapsed.</strong> The defenders held every county, and your own people paid for it. ${bill}`;
      kind = 'bad';
    }
    A = null;
    restoreColorMode();
    clearVisuals();
    flash(msg, kind);
    completeTurn();
  }

  /*
   * Partial victory: the CONTIGUOUS, border-adjacent share of the contested
   * Areas that the score lets you hold.
   *
   * The old rule kept only Areas matching the attacker's own lean - which, for a
   * war triggered BY a party flip, is empty by construction: a flip means the
   * annexed bloc leans the other way. That is what a "partial victory" was:
   * "Held 0 of 1 counties", while the victim still bled population and handed
   * over 2-20% of its GDP to an attacker that gained nothing.
   *
   * Now the front advances from the attacker's own border through the contested
   * set, breadth-first, and stops when the score's allowance runs out. A partial
   * victory is always a real, connected gain.
   */
  function partialSubset(nid, chosen, score) {
    if (!chosen.length) return [];
    const pool = new Set(chosen);
    const want = Math.max(1, Math.round(CivilWar.partialKeepFraction(score, TUNE) * chosen.length));

    // Seed: contested Areas touching the attacker, largest first, so the hold is
    // the militarily meaningful part rather than whatever the Set iterates to.
    const seeds = chosen
      .filter((f) => Game.countyNeighbors(f).some((nb) => Game.getOwner(nb) === nid))
      .sort((a, b) => Game.countyPop(b) - Game.countyPop(a));
    // A selection is grown from the attacker's frontier, so there is always at
    // least one seed; fall back to the largest contested Area if that ever fails.
    if (!seeds.length) seeds.push(Game.largestCounty(chosen));

    const held = new Set();
    const queue = [...seeds];
    while (queue.length && held.size < want) {
      const cur = queue.shift();
      if (held.has(cur) || !pool.has(cur)) continue;
      held.add(cur);
      for (const nb of Game.countyNeighbors(cur)) if (pool.has(nb) && !held.has(nb)) queue.push(nb);
    }
    return [...held];
  }

  // Fall apart: chosen counties break into new nations (>=10 counties each); small
  // fragments join their nearest neighbor — never the failed aggressor.
  function fragment(chosen, attackerId) {
    return Game.breakApart(chosen, { exclude: attackerId });
  }

  /* ================================================================= */
  /* RELEASE                                                           */
  /* ================================================================= */
  /*
   * Let territory go.
   *
   * This is the first of the design's five release valves and the reason
   * Counties mode exists: a nation that has over-extended can shed the ground
   * that is costing it more than it earns — occupation upkeep is superlinear
   * (M1.4), so the marginal Area of a sprawling empire is genuinely expensive —
   * and a nation whose politics have drifted away from a region can let it go
   * before that region takes the decision itself.
   *
   * It is the annex machinery inverted: the same selection loop over YOUR OWN
   * Areas, terminating in Game.breakApart(chosen, {exclude: nid}) — which
   * already existed and already worked. The exclude is load-bearing: without it
   * a fragment too small to stand alone rejoins the nation that just released it.
   *
   * M4.4 adds the guardrail from the design (the recipient must accept, be at war
   * with you, or be in a deal with you) so you cannot dump counties on a rival to
   * game their sentiment.
   */
  function releaseCooldownLeft(nid) {
    const n = Game.getNation(nid);
    if (!n || !Number.isFinite(n.lastReleaseTurn)) return 0;
    return Math.max(0, TUNE.get('release.cooldownTurns') - (World.getTurn() - n.lastReleaseTurn));
  }

  function startRelease(nid) {
    const n = Game.getNation(nid);
    const cd = releaseCooldownLeft(nid);
    if (cd > 0) {
      flash(`The last handover is still being arranged &mdash; ${cd} more world ${plural(cd, 'turn', 'turns')}.`, 'warn');
      return select('nation', nid);
    }
    if (n.counties.size <= 1) {
      flash('You cannot release your last Area.', 'warn');
      return select('nation', nid);
    }
    A = {
      type: 'release', nid, chosen: new Set(), selectable: new Set(),
      budget: Math.min(TUNE.get('release.budgetAreas'), n.counties.size - 1),
      before: Game.nationDemographics(nid),
    };
    recomputeReleaseSelectable();
    setSelectOutline(nationOutline(nid));
    refreshRelease();
  }

  /** Everything you hold except what you have already chosen. */
  function recomputeReleaseSelectable() {
    const sel = new Set();
    for (const f of Game.getNation(A.nid).counties) if (!A.chosen.has(f)) sel.add(f);
    A.selectable = sel;
  }

  function clickRelease(d) {
    const fips = Game.areaIdOf(d.id);
    if (A.chosen.has(fips)) {
      A.chosen.delete(fips);
      recomputeReleaseSelectable();
      return refreshRelease();
    }
    if (!A.selectable.has(fips)) return;
    if (A.chosen.size >= A.budget) {
      flash(`You can hand over <strong>${A.budget}</strong> ${plural(A.budget, 'Area', 'Areas')} at a time.`, 'warn');
      return;
    }
    A.chosen.add(fips);
    recomputeReleaseSelectable();
    refreshRelease();
  }

  function refreshRelease() {
    dimExcept(new Set(Game.getNation(A.nid).counties));
    renderReleasePanel();
  }

  function renderReleasePanel() {
    const n = Game.getNation(A.nid);
    const given = Game.demographics(A.chosen);
    const keptIds = [...n.counties].filter((f) => !A.chosen.has(f));
    const after = Game.demographics(keptIds);

    // What it saves: the upkeep of the Areas you hand over, plus the occupation
    // surcharge you stop paying on any of them that were not your own soil.
    const flowNow = Game.treasuryFlow(A.nid);
    let occupiedGiven = 0;
    for (const f of A.chosen) {
      const c = Game.area(f);
      if (c && c.st !== n.homeSt) occupiedGiven++;
    }
    const savedAdmin = A.chosen.size * TUNE.get('econ.areaUpkeep');

    const preview = A.chosen.size
      ? `<div class="ok-box">\u{1F54A}\u{FE0F} Handing over <strong>${A.chosen.size}</strong>
          ${plural(A.chosen.size, 'Area', 'Areas')}: ${fmtPop(given.pop)} people and ${fmtGdp(given.gdp)} of output.
          ${occupiedGiven ? `<strong>${occupiedGiven}</strong> of them ${occupiedGiven === 1 ? 'is' : 'are'} occupied ground, so the occupation surcharge falls too.` : ''}</div>`
      : `<p class="hint-block">Click <strong>your own Areas</strong> to hand them over. A contiguous group large
          enough to stand alone becomes a new nation; anything smaller joins its nearest neighbour &mdash;
          never you.</p>`;

    setPanel(`
      ${actionHead('\u{1F54A}\u{FE0F} Release counties', n)}
      ${preview}
      <div class="stat"><div class="label">Handover budget</div>
        <div class="value">${A.chosen.size} / ${A.budget} ${plural(A.budget, 'Area', 'Areas')}</div></div>
      <div class="stat"><div class="label">Upkeep you stop paying</div>
        <div class="value surplus">+${fmtGdp(savedAdmin)} / turn</div>
        <div class="geo-row"><span>Current maintenance</span><strong>${fmtGdp(flowNow.maintenance)}</strong></div>
        ${flowNow.occupation ? `<div class="geo-row"><span>of which occupation</span><strong class="deficit">${fmtGdp(-flowNow.occupation)}</strong></div>` : ''}
      </div>
      <div class="stat"><div class="label">Population after</div><div class="value">${fmtPop(after.pop)} <span class="delta">${given.pop ? '&minus;' + fmtPop(given.pop) : ''}</span></div></div>
      <div class="stat"><div class="label">GDP after</div><div class="value">${fmtGdp(after.gdp)} <span class="delta">${given.gdp ? '&minus;' + fmtGdp(given.gdp) : ''}</span></div></div>
      <div class="stat"><div class="label">Political leaning after</div>${renderPolitics(after)}</div>
      <div class="btn-row">
        <button class="btn ghost" id="a-cancel">Cancel</button>
        <button class="btn go" id="a-go" ${A.chosen.size ? '' : 'disabled'}>Release ${A.chosen.size ? '(' + A.chosen.size + ')' : ''}</button>
      </div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
    document.getElementById('a-go').onclick = confirmRelease;
  }

  function confirmRelease() {
    if (!A.chosen.size) return;
    const nid = A.nid;
    const chosen = [...A.chosen];
    const me = Game.getNation(nid);
    const name = me.name;
    const ownersBefore = new Map(chosen.map((f) => [f, Game.getOwner(f)]));

    me.lastReleaseTurn = World.getTurn();
    // exclude: nid — otherwise a fragment too small to stand alone is handed
    // straight back to the nation that just released it.
    const born = Game.batch(() => Game.breakApart(chosen, { exclude: nid }));
    TurnSystem.insertAfter(nid, born);

    // Count where each released Area actually ended up, rather than inferring it:
    // breakApart can hand a fragment too small to stand alone to a nation it just
    // created, so nation sizes are not a reliable proxy.
    const bornSet = new Set(born);
    let toNewNations = 0, toNeighbours = 0, stayed = 0;
    for (const [f, was] of ownersBefore) {
      const now = Game.getOwner(f);
      if (now === was) stayed++;
      else if (bornSet.has(now)) toNewNations++;
      else toNeighbours++;
    }

    A = null;
    clearVisuals();
    const parts = [];
    if (born.length) {
      parts.push(`${toNewNations} ${plural(toNewNations, 'Area', 'Areas')} became ` +
        `${born.length} new ${plural(born.length, 'nation', 'nations')} ` +
        `(<strong>${born.map((id) => escapeHtml(Game.getNation(id).name)).join('</strong>, <strong>')}</strong>)`);
    }
    if (toNeighbours) parts.push(`${toNeighbours} ${plural(toNeighbours, 'Area', 'Areas')} joined neighbouring nations`);
    if (stayed) parts.push(`${stayed} had nowhere to go and stayed`);
    flash(`\u{1F54A}\u{FE0F} <strong>${escapeHtml(name)}</strong> released ${chosen.length} ` +
      `${plural(chosen.length, 'Area', 'Areas')}: ${parts.join('; ') || 'nothing changed hands'}.`, 'good');
    completeTurn();
  }
  /* ---- panel/util helpers ---- */
  function setPanel(html) { document.getElementById('panel').innerHTML = html; }
  function actionHead(title, n) {
    return `<div class="card-head"><span class="swatch" style="background:${n.color}"></span><h2>${escapeHtml(n.name)}</h2></div>
      <div class="kind action-kind">${title}</div>`;
  }
  const leanName = (i) => (i >= 0 ? Ideology.nameAt(i) : '—');
  function cwLine(res) {
    const roll = res.dice.length ? `${res.dice.join(' + ')} = ${res.diceSum}` : '\u2014';
    return `\u{1F3B2} ${roll} &nbsp; \u00d7 ${res.points.toFixed(2)} pts = <strong>${res.score}</strong>.`;
  }
  const plural = (n, a, b) => (n === 1 ? a : b);
  const deltaPop = (n) => (n ? `+${fmtPop(n)}` : '');
  const deltaGdp = (n) => (n ? `+${fmtGdp(n)}` : '');

  /** Start Release with one Area already picked — the Counties-mode entry point. */
  function startReleaseWith(nid, fips) {
    startRelease(nid);
    if (A && A.type === 'release' && A.selectable.has(fips)) clickRelease({ id: fips });
  }

  return {
    isActive, start, onHover, onClick, cancel,
    annexCooldownLeft, annexCost,
    tradeCooldownLeft, nationTradeCapacityFor, hasExportAccess, exportFlows, applyCapacity,
    releaseCooldownLeft, startReleaseWith,
  };
})();
