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
    // ...and what they backed out of. See start().
    if (A && typeof Telemetry !== 'undefined') Telemetry.note('action-cancel', { d: A.type });
    const nid = A && A.nid;
    A = null;
    restoreColorMode();
    clearVisuals();
    if (nid && Game.getNation(nid)) select('nation', nid);
    else deselect();
  }

  function start(type, nid) {
    /*
     * WHAT THEY OPENED, whether or not they went through with it (M13.2). An
     * annexation a player opens, looks at and cancels is a decision they
     * CONSIDERED and rejected — it never reaches the ledger, and it is exactly
     * the moment a designer wants to see.
     */
    if (typeof Telemetry !== 'undefined') Telemetry.note('action-open', { d: type });
    if (type === 'unite') startUnite(nid);
    else if (type === 'annex') startAnnex(nid);
    else if (type === 'trade') startTrade(nid);
    else if (type === 'release') startRelease(nid);
    else if (type === 'govern') startGovern(nid);
  }

  /*
   * CHANGE COURSE — the appeasement valve.
   *
   * Every ideology with real support in your own population, with what adopting
   * it would cost and what it would do. The interesting part is the last column:
   * the *effect* is not scripted anywhere, it is Civil Liberties recomputing
   * against a different ruling ideology, so the preview is honest by
   * construction — it reports the same affinity the model will use next turn.
   */
  function startGovern(nid) {
    const n = Game.getNation(nid);
    const d = Game.nationDemographics(nid);
    const cur = Ideology.index(n.gov.rulingIdeology);
    const need = TUNE.get('gov.changeMinShare');

    const options = Ideology.all().map((x, i) => {
      const share = d.pop > 0 ? d.mix[i] / d.pop : 0;
      const distance = 1 - Ideology.affinity(cur, i);
      return { x, i, share, distance, cost: d.gdp * TUNE.get('gov.changeCost') * distance,
               ok: i !== cur && share >= need && n.treasury >= d.gdp * TUNE.get('gov.changeCost') * distance };
    }).filter((o) => o.i !== cur).sort((a, b) => b.share - a.share);

    const rows = options.map((o) => `
      <div class="geo-row gov-opt ${o.ok ? '' : 'dim'}" ${o.ok ? `data-ideo="${o.x.id}"` : ''}>
        <span><i class="econ-dot" style="background:${o.x.color}"></i>${escapeHtml(o.x.name)}
          &middot; ${(o.share * 100).toFixed(1)}% of your people</span>
        <strong>${o.share < TUNE.get('gov.changeMinShare') ? 'no mandate' : fmtGdp(o.cost)}</strong>
      </div>`).join('');

    setPanel(`
      ${actionHead('\u{1F5F3} Change course', n)}
      <p class="hint-block">Govern by a different ideology. Areas that hold it will find the state
      easier to live under and Areas that held the old one will not &mdash; which is not a scripted
      effect but civil liberties recomputing against a new government.
      Costs ${(TUNE.peek('gov.changeCost') * 100).toFixed(1)}% of GDP scaled by how far you move,
      and ${(TUNE.peek('gov.changeAuthorityHit') * 100).toFixed(0)}% of your Authority.</p>
      <div class="stat"><div class="label">Currently ${escapeHtml(Ideology.nameAt(cur))}
        &middot; since turn ${n.gov.since}</div>${rows}</div>
      <div class="btn-row"><button class="btn ghost" id="a-cancel">Cancel</button></div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
    document.querySelectorAll('.gov-opt[data-ideo]').forEach((el) => {
      el.onclick = () => confirmGovern(nid, el.dataset.ideo);
    });
  }

  function confirmGovern(nid, ideologyId) {
    const r = Moves.resolve({ type: 'govern', nid, ideology: ideologyId }, store.rng);
    if (!r.ok) return flash(escapeHtml(r.reason), 'warn');
    A = null;
    clearVisuals();
    flash(`\u{1F5F3} <strong>${escapeHtml(Game.getNation(nid).name)}</strong> now governs as `
      + `<strong>${escapeHtml(Ideology.byId(ideologyId).name)}</strong>, at a cost of `
      + `${fmtGdp(r.cost)} and its standing.`, '');
    completeTurn();
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
   * ONE DEFINITION EACH, in js/moves.js.
   *
   * These sat here as well until M6.3, which is how the preview a human
   * reads and the preview the AI scores could have come to disagree — and a
   * disagreement there is unfalsifiable from inside the game, because each side
   * only ever sees its own answer. They are kept as local names because the
   * panel code below reads better for it, not because there is a second version.
   */
  const annexCost = (chosen, shell) => Moves.annexCost(chosen, shell);
  const annexCooldownLeft = (nid) => Moves.annexCooldownLeft(nid);
  const releaseCooldownLeft = (nid) => Moves.releaseCooldownLeft(nid);

  function confirmUniteAttempt(tid) {
    const S = A.nid;
    const Sname = Game.getNation(S).name;
    const Tname = Game.getNation(tid).name;
    A = null;
    clearVisuals();
    const r = Moves.resolve({ type: 'unite', nid: S, target: tid }, store.rng);
    if (!r.ok) return flash(escapeHtml(r.reason), 'warn');
    if (r.peaceful) {
      flash(`\u{1F91D} <strong>${escapeHtml(Tname)}</strong> united into <strong>${escapeHtml(Game.getNation(S).name)}</strong>.`, 'good');
    } else {
      const parts = [`${r.fallout.defect.length} counties defected to <strong>${escapeHtml(Tname)}</strong>`];
      if (r.created.length) parts.push(`${r.created.length} new ${plural(r.created.length, 'nation', 'nations')} broke away`);
      flash(`\u2694\uFE0F <strong>${escapeHtml(Sname)}</strong>'s bid to unite <strong>${escapeHtml(Tname)}</strong> sparked a civil war! ${parts.join('; ')}.`, 'bad');
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
    /*
     * The SAME plan the AI scores. It used to recompute the chance here from
     * CivilWar directly and describe the fallout in prose — "cut-off regions
     * break away" — while `planSplinter` had the actual count in hand. The
     * player was the only participant in this game not told how many Areas were
     * at stake.
     */
    const plan = Moves.plan({ type: 'unite', nid: A.nid, target: tid });
    const me = Game.nationDemographics(A.nid);
    const tName = Game.getNation(tid).name;
    const combined = Game.demographics([...Game.getNation(A.nid).counties, ...Game.getNation(tid).counties]);
    const P = plan.chance;
    A.chance = P;
    const atRisk = plan.fallout.defect.length + plan.fallout.secede.length;
    const pct = Math.round(P * 100);
    const risky = P < 0.5;
    /*
     * THE PRICE, WHICH THIS PANEL DID NOT MENTION AT ALL (M9.4).
     *
     * Union costs `unite.costGdpShare` of what the other government is worth -
     * pensions, guarantees, a settlement its ministers will sign - and it is
     * charged ON THE ATTEMPT, not on success. So the player could be shown a
     * 30% chance, click "Risk it", lose the roll AND the money, and nothing in
     * the game had ever told them the second half was coming. The AI has read
     * `plan.cost` off this same object since M6.3.
     */
    const cost = plan.cost || 0;
    const treasury = Game.getNation(A.nid).treasury;
    const costHtml = `<div class="stat"><div class="label">Settlement, charged on the attempt</div>
      <div class="value ${plan.ok ? '' : 'deficit'}">${fmtGdp(cost)}</div>
      <div class="geo-row"><span>Treasury after</span><strong class="${plan.ok ? 'surplus' : 'deficit'}">${fmtGdp(treasury - cost)}</strong></div>
      <div class="geo-row"><span>Paid whether the union holds or not.</span></div>
    </div>`;
    const refusal = plan.ok ? ''
      : `<div class="warn-box">\u26d4 ${escapeHtml(plan.reason || 'This union cannot be proposed.')}</div>`;
    const flip = me.dominant >= 0 && combined.dominant >= 0 && me.dominant !== combined.dominant;
    setPanel(`
      ${actionHead('🤝 Unite — preview', Game.getNation(A.nid))}
      <p class="hint-block">Proposing union with <strong>${escapeHtml(tName)}</strong>. If it holds, the combined nation keeps
        the name <strong>${escapeHtml(Game.getNation(A.nid).name)}</strong>.</p>
      <div class="chance ${risky ? 'risky' : 'safe'}">
        <span class="chance-num">${pct}%</span><span class="chance-lbl">chance of peaceful union</span>
      </div>
      ${costHtml}
      ${refusal}
      <div class="stat"><div class="label">Combined population</div><div class="value">${fmtPop(combined.pop)}</div></div>
      <div class="stat"><div class="label">Combined GDP</div><div class="value">${fmtGdp(combined.gdp)}</div></div>
      <div class="stat"><div class="label">Combined political leaning</div>${renderPolitics(combined)}</div>
      ${flip ? `<div class="warn-box">⚠️ Flips your leading ideology ${leanName(me.dominant)} &rarr; ${leanName(combined.dominant)} &mdash; lowers the odds.</div>` : ''}
      <div class="warn-box">On failure <strong>${atRisk}</strong> of your own ${plural(atRisk, 'Area', 'Areas')} leave:
        ${plan.fallout.defect.length} defect to <strong>${escapeHtml(tName)}</strong>,
        ${plan.fallout.secede.length} break away as new nations, and you lose population &amp; GDP.</div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go ${risky ? 'danger' : ''}" id="a-go" ${plan.ok ? '' : 'disabled'}>${risky ? 'Risk it' : 'Propose union'}</button>
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

  /*
   * WHAT AN UNRECOGNISED STATE IS PAID (M7.8).
   *
   * A bilateral deal is a signature between two governments, so it needs both to
   * admit the other is a government. An external sale is not: goods from a
   * country nobody recognises still reach the market, through intermediaries who
   * take a cut for the trouble — so the world market is a HAIRCUT rather than a
   * lock, and the haircut shrinks to nothing as the continent comes round.
   *
   * Refusing external trade outright would make an unrecognised landlocked state
   * unplayable, which is a dead end rather than a difficulty.
   */
  const marketRate = (nid) => (typeof Recognition === 'undefined' ? 1 : Recognition.marketRate(nid, TUNE));
  const dealsWith = (a, b) => (typeof Recognition === 'undefined' ? true : Recognition.canTrade(a, b));

  /** The line that explains a smuggler's price, or nothing when there is none. */
  function smugglingNote(nid) {
    const rate = marketRate(nid);
    if (rate >= 0.999) return '';
    const v = Recognition.scalar(nid);
    return `<div class="warn-box">\u{1F3F4} Unrecognised &mdash; only <strong>${Math.round(v * 100)}%</strong> of the
      continent admits you are a country, so your goods move through intermediaries who keep
      <strong>${Math.round((1 - rate) * 100)}%</strong> of the price. It shrinks as the world comes round.</div>`;
  }

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

  /**
   * ADMIT THAT A NEW STATE IS A COUNTRY.
   *
   * It does NOT end your turn, and that is deliberate: recognition costs no
   * money, moves no ground and takes no army, so charging a nation's one action
   * for it would price a diplomatic signature at the same rate as a war. What it
   * costs is with whoever they broke away from, and that bill arrives on its own.
   */
  function recognise(target) {
    const me = Game.getPlayer();
    if (me == null) return;
    const res = Moves.resolve({ type: 'recognise', nid: me, target }, store.rng, TUNE);
    if (!res.ok) return flash(`\u26d4 ${escapeHtml(res.reason)}`, 'bad');
    const name = Game.getNation(target)?.name || 'them';
    Game.touch({ values: true });
    flash(`\u{1F91D} <strong>${escapeHtml(Game.getNation(me).name)}</strong> recognised
      <strong>${escapeHtml(name)}</strong> &mdash; ${Math.round(res.after * 100)}% of the continent now does.`
      + (res.unlocks ? ' The rest of the world takes its lead from you.' : ''), 'good');
    select('nation', target);
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
    /*
     * CORRIDORS (A2) — a standing right to move goods across somebody's ground,
     * as against the one-off sale above it. The two sit on the same panel on
     * purpose: they answer the same question for a landlocked nation, and the
     * difference between renting a lift this quarter and holding the road open
     * for five years is exactly the thing the player is being asked to weigh.
     *
     * Every neighbour with a real corridor is listed, including ones the player
     * already has an agreement with, so the panel says what it holds as well as
     * what it could ask for.
     */
    const corridors = (typeof Transit === 'undefined' ? [] : Game.borderingNations(A.nid)
      .map((t) => ({ t, bits: Transit.modesBetween(A.nid, t) }))
      .filter((r) => r.bits))
      .map((r) => {
        const held = [Transit.MODE.RAIL, Transit.MODE.HIGHWAY, Transit.MODE.PORT]
          .filter((m) => (r.bits & m) && Transit.live(r.t, A.nid, m));
        return { ...r, held };
      });
    const corridorHtml = corridors.length ? `
      <div class="label" style="margin-top:12px">Corridors &middot; a standing right to cross their ground</div>
      ${corridors.map((r) => {
        const modes = [Transit.MODE.RAIL, Transit.MODE.HIGHWAY, Transit.MODE.PORT]
          .filter((m) => r.bits & m).map((m) => Transit.MODE_LABEL[m]).join(', ');
        return `<button class="btn ghost transit-btn" data-corridor="${r.t}">
          <span>${escapeHtml(Game.getNation(r.t).name)}</span>
          <span class="transit-meta">${escapeHtml(modes)}${r.held.length
            ? ` &middot; you hold ${r.held.map((m) => Transit.MODE_LABEL[m]).join(' + ')}` : ''}</span>
        </button>`;
      }).join('')}` : '';

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
      ${corridorHtml}
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
      if (b.hasAttribute('disabled')) return;
      b.onclick = () => (b.dataset.corridor
        ? renderCorridorAsk(b.dataset.corridor) : renderTransitPreview(b.dataset.t));
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
    const benefit = total * TRADE_GAIN() * TUNE.get('trade.worldMarketPenalty') * marketRate(S);
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
      ${smugglingNote(S)}
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

  /*
   * ASKING A NEIGHBOUR TO CARRY YOUR GOODS (A2).
   *
   * The one-off sale above this rents a lift to market for one quarter. This
   * buys the road for years, and it is what a landlocked nation actually needs:
   * a trade deal you cannot get your goods to is not a trade deal.
   *
   * THREE THINGS THE PLAYER CHOOSES, and each one is a real decision rather than
   * a form field: WHICH WAY (road, rail or their docks, and a nation may open
   * one and refuse the others), HOW LONG, and WHAT TO OFFER. The neighbour has
   * an opinion about all three, and it comes from the model, so it is the same
   * opinion fifty other nations get.
   */
  function renderCorridorAsk(tid, prefill) {
    const S = A.nid;
    const them = Game.getNation(tid);
    if (!them) return renderTradePrompt();
    const bits = Transit.modesBetween(S, tid);
    const durations = TUNE.peek('deal.durations');
    if (!A.corridor || A.corridor.t !== tid) {
      const first = [Transit.MODE.RAIL, Transit.MODE.HIGHWAY, Transit.MODE.PORT].find((m) => bits & m);
      const want = TUNE.peek('deal.defaultDuration');
      A.corridor = {
        t: tid, mode: first,
        duration: durations.includes(want) ? want : durations[0],
        rate: null,
      };
    }
    if (prefill) Object.assign(A.corridor, prefill);
    const c = A.corridor;
    const plan = Moves.plan({ type: 'transit', nid: S, target: tid,
      mode: c.mode, duration: c.duration, rate: c.rate }, TUNE);
    const fair = plan.ok ? plan.verdict.rate : TUNE.get('trade.transitToll');
    if (c.rate == null) {
      // Open BELOW what they would ask, so the slider is a decision rather than
      // a button they say yes to nine times in ten (D31).
      c.rate = Math.max(TUNE.get('transit.rateMin'), fair * TUNE.get('trade.openingOfferFactor'));
    }
    const held = Transit.live(tid, S, c.mode);

    const modeRow = [Transit.MODE.RAIL, Transit.MODE.HIGHWAY, Transit.MODE.PORT].map((m) => {
      const can = bits & m;
      const have = can && Transit.live(tid, S, m);
      return `<button class="btn ghost dur-opt${m === c.mode ? ' active' : ''}" data-mode="${m}"
        ${can ? '' : 'disabled title="That border carries no such link"'}>${escapeHtml(Transit.MODE_LABEL[m])}
        <small>${can ? (have ? 'you hold this' : 'available') : 'no link'}</small></button>`;
    }).join('');
    const durRow = durations.map((d) => `<button class="btn ghost dur-opt${d === c.duration ? ' active' : ''}"
      data-dur="${d}">${d} ${plural(d, 'turn', 'turns')}<small>${escapeHtml(termWords(d))}</small></button>`).join('');

    setPanel(`
      ${actionHead('\u{1F6E3} Corridor \u2014 ask to cross their ground', Game.getNation(S))}
      <p class="hint-block">Ask <strong>${escapeHtml(them.name)}</strong> for a standing right to move your
      goods across their territory. It lasts the term you agree, they take a cut of what passes, and
      either side can end it with <strong>${TUNE.peek('transit.noticeTurns')} turns'</strong> notice.</p>
      ${held ? `<div class="ok-box">\u2705 You already have a ${escapeHtml(Transit.MODE_LABEL[c.mode])} corridor
        across ${escapeHtml(them.name)} &mdash; ${Transit.remaining(held)} more
        ${plural(Transit.remaining(held), 'turn', 'turns')} at ${Math.round(held.rate * 100)}%.</div>` : ''}
      <div class="stat"><div class="label">Which way</div><div class="dur-opts">${modeRow}</div></div>
      <div class="stat"><div class="label">How long</div><div class="dur-opts">${durRow}</div></div>
      <div class="slider-row">
        <div class="label">Your offer to ${escapeHtml(them.name)}: <strong id="corr-val">${Math.round(c.rate * 100)}%</strong>
          of what crosses</div>
        <input type="range" id="corr-slider" min="${Math.round(TUNE.get('transit.rateMin') * 100)}"
          max="${Math.round(TUNE.get('transit.rateMax') * 100)}" value="${Math.round(c.rate * 100)}">
      </div>
      ${plan.ok || !plan.reason ? '' : `<div class="warn-box">\u26d4 ${escapeHtml(plan.reason)}</div>`}
      <div id="deal-response"></div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go" id="a-propose" ${plan.ok && !held ? '' : 'disabled'}>Propose</button>
      </div>
    `);
    for (const b of document.querySelectorAll('.dur-opt[data-mode]')) {
      if (!b.hasAttribute('disabled')) {
        b.onclick = () => { A.corridor.mode = Number(b.dataset.mode); A.corridor.rate = null; renderCorridorAsk(tid); };
      }
    }
    for (const b of document.querySelectorAll('.dur-opt[data-dur]')) {
      b.onclick = () => { A.corridor.duration = Number(b.dataset.dur); renderCorridorAsk(tid); };
    }
    const sl = document.getElementById('corr-slider');
    if (sl) {
      sl.oninput = () => {
        A.corridor.rate = +sl.value / 100;
        document.getElementById('corr-val').textContent = sl.value + '%';
        document.getElementById('deal-response').innerHTML = ''; // a stale yes is a lie
      };
    }
    document.getElementById('a-back').onclick = () => { A.corridor = null; renderTradePrompt(); };
    const prop = document.getElementById('a-propose');
    if (prop && !prop.hasAttribute('disabled')) prop.onclick = () => proposeCorridor(tid);
  }

  function proposeCorridor(tid) {
    const tName = Game.getNation(tid).name;
    const box = document.getElementById('deal-response');
    /*
     * RE-PLANNED HERE, NOT REUSED FROM THE RENDER. The slider moves the offer
     * without re-rendering — deliberately, so dragging it does not rebuild the
     * panel under the player's finger — which means the plan captured when the
     * panel was drawn is judging the OPENING offer, whatever the slider now
     * says. Found by playing it: every offer was refused with the same reasons
     * however generous it got.
     */
    const c = A.corridor;
    const plan = Moves.plan({ type: 'transit', nid: A.nid, target: tid,
      mode: c.mode, duration: c.duration, rate: c.rate }, TUNE);
    const v = plan.verdict;
    if (!box || !v) return;
    if (typeof Telemetry !== 'undefined') Telemetry.note('corridor-propose', { d: v.kind, mode: A.corridor.mode });
    const why = `<div class="deal-why">${v.reasons.map((r) => escapeHtml(r)).join(' ')}</div>`;
    const sign = (rate) => {
      const r = Moves.resolve({ type: 'transit', nid: A.nid, target: tid,
        mode: A.corridor.mode, duration: A.corridor.duration, rate }, store.rng);
      if (!r.ok) return flash(`\u26d4 ${escapeHtml(r.reason)}`, 'bad');
      A = null; clearVisuals();
      flash(`\u{1F6E3} <strong>${escapeHtml(tName)}</strong> will carry your goods by
        ${escapeHtml(Transit.MODE_LABEL[r.mode])} for ${escapeHtml(termWords(r.duration))},
        at ${Math.round(rate * 100)}%.`, 'good');
      completeTurn();
    };
    if (v.kind === 'accept') {
      box.innerHTML = `<div class="deal-verdict accept">\u2705 ${escapeHtml(tName)} accepts
        ${Math.round(A.corridor.rate * 100)}%.${why}</div>
        <button class="btn go" id="a-sign">Sign \u2014 ${escapeHtml(termWords(A.corridor.duration))}</button>`;
      document.getElementById('a-sign').onclick = () => sign(A.corridor.rate);
      return;
    }
    if (v.kind === 'counter') {
      box.innerHTML = `<div class="deal-verdict counter">\u2194\ufe0f ${escapeHtml(tName)} wants
        <strong>${Math.round(v.rate * 100)}%</strong>, not ${Math.round(A.corridor.rate * 100)}%.${why}</div>
        <div class="btn-row">
          <button class="btn go" id="a-sign">Pay their ${Math.round(v.rate * 100)}%</button>
          <button class="btn ghost" id="a-adjust">Change my offer</button>
        </div>`;
      document.getElementById('a-sign').onclick = () => sign(v.rate);
      document.getElementById('a-adjust').onclick = () => renderCorridorAsk(tid, { rate: v.rate });
      return;
    }
    box.innerHTML = `<div class="deal-verdict decline">\u274c ${escapeHtml(tName)} will not carry your
      goods for that.${why}</div>`;
  }

  // external deal: sell surplus to Canada/Mexico/the world, capped by capacity
  // and paid at a FRACTION of the bilateral rate
  function renderExternalPreview(key, partner) {
    const S = A.nid;
    const res = applyCapacity(exportFlows(S), nationTradeCapacity(S).total);
    const flows = res.flows, total = res.total;
    const penalty = TUNE.get('trade.worldMarketPenalty');
    const gain = total * TRADE_GAIN() * penalty * marketRate(S);
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
      ${smugglingNote(S)}
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

  /*
   * THE PANEL RENDERS THE PLAN IT RESOLVES (M11.1), like every other action.
   *
   * These rules moved into `Moves` this milestone, and the point of moving them
   * was that the AI could not see them here. Having moved them, the UI has to
   * read them back from the same place — otherwise there are two
   * implementations again and the human's is the one that drifts, which is the
   * failure M6.3 fixed for annexation and M9.4 fixed for its price.
   */
  /**
   * THE NEGOTIATING TABLE (A1). This used to be a preview with one button on
   * it: the flows were whatever the two economies happened to mismatch on, the
   * money was whatever that was worth, and the only decision was whether to
   * press the button. Now there is a decision on the panel — how long you are
   * agreeing to this for — and it is the decision the whole stage exists to
   * create. Everything else here is the old preview, kept.
   *
   * `A.terms` holds what the player has chosen so far, so re-rendering after a
   * click does not throw the choice away.
   */
  function renderTradePreview(tid) {
    const S = A.nid;
    const tName = Game.getNation(tid).name;
    const durations = TUNE.peek('deal.durations');
    if (!A.terms) {
      const want = TUNE.peek('deal.defaultDuration');
      A.terms = {
        duration: durations.includes(want) ? want : durations[0],
        autoRenew: !!TUNE.peek('deal.defaultAutoRenew'),
      };
    }
    const plan = Moves.plan({ type: 'trade', nid: S, target: tid, terms: A.terms });
    const flows = plan.flows || [];
    const total = plan.total || 0;
    const perTurn = plan.perTurn ? plan.perTurn.me : 0;
    const gain = plan.gain || 0;
    const res = { capped: plan.capped, total, uncappedTotal: plan.uncappedTotal };
    const openDeal = typeof Deals === 'undefined' ? null : Deals.live(S, tid);
    /*
     * A DEAL NEEDS TWO GOVERNMENTS. Shown as a refusal on the preview rather
     * than by hiding the neighbour, because "Nevada will not deal with you and
     * here is why" is a fact the player can act on, and a missing button is a
     * bug report.
     */
    const shut = !dealsWith(S, tid);
    const oneWay = shut && typeof Recognition !== 'undefined' && !Recognition.recognises(tid, S);
    const rows = flows.slice()
      .sort((a, b) => b.value - a.value)
      .map((f) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[f.i]}"></i>${f.s}
          ${f.sell > f.buy ? '&rarr; them' : '&larr; us'}</span><strong>${fmtGdp(f.value * 1e6)}</strong></div>`)
      .join('');
    /*
     * THE TERM, as four buttons rather than a slider. The durations are a menu
     * (`deal.durations`) and not a range, so a segmented row is the honest
     * control: there is no meaningful 5-turn deal to slide past.
     */
    const durRow = durations.map((d) => `<button class="btn ghost dur-opt${d === A.terms.duration ? ' active' : ''}"
        data-dur="${d}">${d} ${plural(d, 'turn', 'turns')}<small>${escapeHtml(termWords(d))}</small></button>`).join('');
    const until = Calendar.label(World.getTurn() + A.terms.duration, TUNE);

    setPanel(`
      ${actionHead('\u{1F69B} Trade — a deal with terms', Game.getNation(S))}
      <p class="hint-block">Deal with <strong>${escapeHtml(tName)}</strong>: surpluses flow to whoever runs the
      matching deficit, valued at current market prices. A matched deal pays the full rate to both sides,
      <strong>every turn until it runs out</strong> &mdash; at the price you sign at, whatever the market does after.</p>
      ${flows.length ? rows : '<div class="warn-box">No matching surplus/deficit pairs &mdash; nothing to trade.</div>'}
      ${flows.length ? capacityNote(S, res) : ''}
      <div class="stat"><div class="label">How long &mdash; and this is the decision</div>
        <div class="dur-opts">${durRow}</div>
        <label class="opt auto-renew"><input type="checkbox" id="a-renew" ${A.terms.autoRenew ? 'checked' : ''}>
          Renew on the same terms when it runs out</label>
      </div>
      <div class="stat"><div class="label">Traded value, per turn</div><div class="value">${fmtGdp(total * 1e6)}</div></div>
      <div class="stat"><div class="label">To your treasury, per turn</div><div class="value surplus">+${fmtGdp(perTurn * 1e6)}</div></div>
      <div class="stat"><div class="label">Over the whole deal</div><div class="value surplus">+${fmtGdp(gain * 1e6)}</div>
        <div class="geo-row"><span>Runs until</span><strong>${escapeHtml(until)}</strong></div></div>
      ${openDeal ? `<div class="warn-box">\u{1F4C4} You already have a deal with ${escapeHtml(tName)} &mdash;
        ${Deals.remaining(openDeal)} more ${plural(Deals.remaining(openDeal), 'turn', 'turns')}. Renegotiate when it expires.</div>` : ''}
      ${shut ? `<div class="warn-box">\u{1F6AB} No deal. ${oneWay
        ? `${escapeHtml(tName)} does not recognise you as a country, and a trade agreement is a signature between two governments.`
        : `You do not recognise ${escapeHtml(tName)} as a country. Recognise them from their card and the table is open.`}</div>` : ''}
      ${plan.ok || !plan.reason ? '' : `<div class="warn-box">\u26d4 ${escapeHtml(plan.reason)}</div>`}
      <div id="deal-response"></div>
      <div class="btn-row">
        <button class="btn ghost" id="a-back">Back</button>
        <button class="btn go" id="a-propose" ${plan.ok ? '' : 'disabled'}>Propose ${A.terms.duration} ${plural(A.terms.duration, 'turn', 'turns')}</button>
      </div>
    `);
    // Every control re-plans and re-renders, so the three money lines and the
    // end date always describe the terms actually on the table.
    for (const b of document.querySelectorAll('.dur-opt')) {
      // Re-rendering clears #deal-response, so a yes to eight turns can never be
      // left sitting under a panel that now says twenty.
      b.onclick = () => { A.terms.duration = Number(b.dataset.dur); renderTradePreview(tid); };
    }
    const renew = document.getElementById('a-renew');
    if (renew) renew.onchange = () => { A.terms.autoRenew = renew.checked; renderTradePreview(tid); };
    document.getElementById('a-back').onclick = () => {
      A.pending = null; A.terms = null; setSelectOutline(nationOutline(A.nid)); renderTradePrompt();
    };
    document.getElementById('a-propose').onclick = () => plan.ok && proposeDeal(tid, plan);
  }

  /*
   * THE ANSWER, AND WHY IT IS NOT A DICE ROLL.
   *
   * `plan.verdict` is a pure function of the world and the terms, so proposing
   * the same length twice gets the same answer. There is nothing to grind and
   * no reroll to shop for, which is what stops a negotiation becoming a slot
   * machine. What moves the answer is the world: trade with somebody who
   * actually needs what you have and they will commit for years.
   *
   * The old panel signed on one click. That was a menu, not a negotiation, and
   * "is negotiating a deal interesting, or is it a menu?" is one of the
   * questions the alpha exists to answer — so the button now proposes, and
   * signing is what a yes unlocks.
   */
  function proposeDeal(tid, plan) {
    const tName = Game.getNation(tid).name;
    const v = plan.verdict;
    const box = document.getElementById('deal-response');
    if (!box || !v) return confirmTrade(tid);
    if (typeof Telemetry !== 'undefined') {
      Telemetry.note('deal-propose', { d: v.kind, dur: A.terms.duration });
      A.rounds = (A.rounds || 0) + 1;
    }
    const why = `<div class="deal-why">${v.reasons.map((r) => escapeHtml(r)).join(' ')}</div>`;
    if (v.kind === 'accept') {
      box.innerHTML = `<div class="deal-verdict accept">\u2705 ${escapeHtml(tName)} accepts
        ${A.terms.duration} ${plural(A.terms.duration, 'turn', 'turns')}.${why}</div>
        <button class="btn go" id="a-sign">Sign &mdash; ${escapeHtml(termWords(A.terms.duration))},
        +${fmtGdp(plan.perTurn.me * 1e6)} a turn</button>`;
      document.getElementById('a-sign').onclick = () => confirmTrade(tid);
      return;
    }
    /*
     * A counter names a length and says why. Two ways out of it, because the
     * player should be able to take the deal OR keep haggling: accept their
     * number, or load it into the buttons and change something first.
     */
    const theirs = Moves.plan({ type: 'trade', nid: A.nid, target: tid,
      terms: { duration: v.duration, autoRenew: A.terms.autoRenew } });
    box.innerHTML = `<div class="deal-verdict counter">\u2194\ufe0f ${escapeHtml(tName)} counters:
      <strong>${escapeHtml(termWords(v.duration))}</strong>, not ${escapeHtml(termWords(A.terms.duration))}.${why}</div>
      <div class="deal-diff"><div class="geo-row"><span>You asked for</span><strong>${A.terms.duration}
        ${plural(A.terms.duration, 'turn', 'turns')}</strong></div>
        <div class="geo-row"><span>They will sign</span><strong class="surplus">${v.duration}
        ${plural(v.duration, 'turn', 'turns')}${theirs.ok ? ` &middot; +${fmtGdp(theirs.perTurn.me * 1e6)} a turn` : ''}</strong></div></div>
      <div class="btn-row">
        <button class="btn go" id="a-sign" ${theirs.ok ? '' : 'disabled'}>Take their ${v.duration} ${plural(v.duration, 'turn', 'turns')}</button>
        <button class="btn ghost" id="a-adjust">Change my offer</button>
      </div>`;
    const sign = document.getElementById('a-sign');
    if (sign) sign.onclick = () => { A.terms.duration = v.duration; confirmTrade(tid); };
    document.getElementById('a-adjust').onclick = () => { A.terms.duration = v.duration; renderTradePreview(tid); };
  }

  /**
   * '4 turns' in words a person uses, from the calendar's own month count — so
   * a change to how long a turn is renames every button rather than leaving
   * four hard-coded lies on the panel.
   */
  const SPELT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function termWords(turns) {
    const months = turns * (TUNE.peek('calendar.monthsPerTurn') || 3);
    if (months % 12 === 0) {
      const y = months / 12;
      return `${SPELT[y] || y} ${y === 1 ? 'year' : 'years'}`;
    }
    return `${SPELT[months] || months} months`;
  }

  /*
   * ...AND THE RESOLVER IS THE MOVE (M11.1). Everything this used to do — pay
   * both treasuries, set both cooldowns, record the relationship in both
   * directions, write the ledger, reprice the market — is `Moves.resolveTrade`,
   * which is also what `AI.act` calls. Two implementations of "what a trade
   * deal does", one reachable by a human and one by the other fifty nations, is
   * the exact disagreement the plan/resolve split exists to prevent.
   */
  function confirmTrade(tid) {
    const S = A.nid;
    const terms = A.terms;
    const Sname = Game.getNation(S).name, Tname = Game.getNation(tid).name;
    const rounds = A.rounds || 1;
    const r = Moves.resolve({ type: 'trade', nid: S, target: tid, terms }, store.rng);
    if (!r.ok) return flash(`\u26d4 ${escapeHtml(r.reason)}`, 'bad');
    if (typeof Telemetry !== 'undefined') {
      Telemetry.note('deal-sign', { dur: r.duration, rounds, autoRenew: terms.autoRenew ? 1 : 0 });
    }
    A = null;
    clearVisuals();
    flash(`\u{1F69B} <strong>${escapeHtml(Sname)}</strong> and <strong>${escapeHtml(Tname)}</strong> signed a
      ${escapeHtml(termWords(r.duration))} deal &mdash; +${fmtGdp(r.perTurn.me * 1e6)} a turn to each,
      until ${escapeHtml(Calendar.label(r.until, TUNE))}. First payment this turn.`, 'good');
    completeTurn();
  }
  /* ================================================================= */
  /* TREATIES AND AID (M11.2)                                          */
  /* ================================================================= */
  /*
   * NO SELECTION FLOW. Both are asked about one named country, which is already
   * on the screen when the button is there — so there is no map state to hold,
   * no `A` to set, and nothing to cancel. That is why these two are the
   * shortest action paths in the file and why they do not go through `start`.
   */
  function treaty(nid) {
    const me = Game.getPlayer();
    if (!me || blocked()) return;
    const intent = { type: 'treaty', nid: me, target: nid, kind: 'nonaggression' };
    const plan = Moves.plan(intent);
    if (!plan.ok) return flash(`\u26d4 ${escapeHtml(plan.reason)}`, 'warn');
    const r = Moves.resolve(intent, store.rng);
    if (!r.ok) return flash(`\u26d4 ${escapeHtml(r.reason)}`, 'bad');
    flash(`\u{1F4DC} <strong>${escapeHtml(Game.getNation(me).name)}</strong> and `
      + `<strong>${escapeHtml(Game.getNation(nid).name)}</strong> signed a non-aggression pact.`, 'good');
    completeTurn();
  }

  function aid(nid) {
    const me = Game.getPlayer();
    if (!me || blocked()) return;
    const intent = { type: 'aid', nid: me, target: nid };
    const plan = Moves.plan(intent);
    if (!plan.ok) return flash(`\u26d4 ${escapeHtml(plan.reason)}`, 'warn');
    const r = Moves.resolve(intent, store.rng);
    if (!r.ok) return flash(`\u26d4 ${escapeHtml(r.reason)}`, 'bad');
    const w = r.patron && r.patron.nid === me ? Math.round(r.patron.weight * 100) : 0;
    flash(`\u{1F4B0} <strong>${escapeHtml(Game.getNation(me).name)}</strong> sent `
      + `${fmtGdp(r.cost)} to <strong>${escapeHtml(Game.getNation(nid).name)}</strong>`
      + (w ? ` &mdash; they now govern <strong>${w}%</strong> like you.` : '.'), 'good');
    completeTurn();
  }

  /** Shared guard: neither is available while something else holds the map. */
  function blocked() {
    if (isActive()) { flash('Finish or cancel the current action first.', 'warn'); return true; }
    return false;
  }

  /* ================================================================= */
  /* ANNEX                                                             */
  /* ================================================================= */
  /*
   * What one annexation of `chosen` Areas costs the treasury.
   * Flat per Area plus a per-head term, so swallowing a metro Area costs more
   * than swallowing empty ground. The leader tier pays a surcharge.
   */
  function startAnnex(nid) {
    const me = Game.nationDemographics(nid);
    const cd = annexCooldownLeft(nid);
    if (cd > 0) {
      flash(`Your armies are still regrouping &mdash; ${cd} more world ${plural(cd, 'turn', 'turns')} before you can annex again.`, 'warn');
      return select('nation', nid);
    }
    /*
     * Untouchable neighbours are decided by SIZE, not by ideology — and the
     * rule now lives in `Moves` (M9.3). This function used to be its ONLY
     * enforcement: `Moves.planAnnex`, `Moves.legal` and therefore the whole AI
     * played by a looser rulebook than the human clicking the map. What is left
     * here is the click path's need for the SET, so the map can grey the
     * blocked nations out before anything is selected.
     */
    const factor = TUNE.get('annex.strongNeighbourFactor');
    const blocked = Moves.untouchable(nid);
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
    /*
     * ...and beyond the edge of what this nation can project, nothing is
     * selectable at all (M7.11). Dropped here rather than refused on click,
     * because the map is the explanation: the ground you cannot reach is the
     * ground that does not light up, and the panel says why underneath.
     */
    if (typeof Projection !== 'undefined') {
      for (const f of [...sel]) if (!Projection.inRange(A.nid, f, TUNE)) sel.delete(f);
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

  /*
   * THE PANEL RENDERS THE PLAN IT WILL RESOLVE (M9.4).
   *
   * It used to call `annexCost` itself, and that was the bug: `annexCost` is
   * the BASE price, and `planAnnex` multiplies it by `Projection.costMultiplier`
   * before charging. At the edge of reach the shown price understated the
   * charged price by up to 1.6x - precisely the case M7.11 made central, and
   * precisely the number the AI could read off `plan` and the human could not.
   *
   * Rendering the plan rather than re-deriving it also means the panel now
   * refuses for every reason the resolver refuses - out of reach, cooldown, the
   * 4x rule (M9.3) - and says which, before the click rather than after it.
   */
  function renderAnnexPanel() {
    const n = Game.getNation(A.nid);
    const chosen = [...A.chosen];
    const added = Game.demographics(A.chosen);
    const after = Game.demographics([...n.counties, ...A.chosen]);
    const plan = chosen.length ? Moves.plan({ type: 'annex', nid: A.nid, areas: chosen }) : null;
    // `plan.war` IS `CivilWar.assess` over the same three demographics. Asking
    // it a second way here is exactly how the two would come to disagree.
    const assess = (plan && plan.war) || { triggered: false, reasons: [] };
    const reasons = assess.reasons || [];
    const ratioPct = Math.round(TUNE.get('war.triggerSizeRatio') * 100);
    const triggerHtml = !plan ? '' : assess.triggered
      ? `<div class="warn-box">\u2694\ufe0f <strong>This means civil war.</strong> Triggered by:
          ${reasons.includes('flip') ? '<span class="tag">party flip</span>' : ''}
          ${reasons.includes('gdp') ? `<span class="tag">GDP &gt; ${ratioPct}% of yours</span>` : ''}
          ${reasons.includes('pop') ? `<span class="tag">population &gt; ${ratioPct}% of yours</span>` : ''}
          Outcome decided by dice on confirm.</div>`
      : `<div class="ok-box">\u2713 Peaceful annexation \u2014 no civil war triggered.</div>`;

    // THE CHARGED PRICE, off the plan - reach multiplier included.
    const cost = plan ? plan.cost : 0;
    const canPay = n.treasury >= cost;
    const afterTreasury = n.treasury - cost;
    // The reach surcharge, named. It is the whole difference between the base
    // price and the charged one, and nothing anywhere used to say it existed.
    const reachPct = plan && plan.reachMult > 1.0001
      ? Math.round((plan.reachMult - 1) * 100) : 0;
    const costHtml = `<div class="stat"><div class="label">Cost to mobilise</div>
      <div class="value ${canPay ? '' : 'deficit'}">${fmtGdp(cost)}</div>
      <div class="geo-row"><span>Treasury after</span><strong class="${canPay ? 'surplus' : 'deficit'}">${fmtGdp(afterTreasury)}</strong></div>
      ${A.shell ? `<div class="geo-row"><span>Leader surcharge</span><strong>+${Math.round(TUNE.get('annex.shellCostMult') * A.shell * 100)}%</strong></div>` : ''}
      ${reachPct ? `<div class="geo-row"><span>Distance from your seats of government</span><strong class="deficit">+${reachPct}%</strong></div>` : ''}
      ${plan && plan.reachWar > 1.0001 ? `<div class="geo-row"><span>&hellip;and your army fights at</span><strong class="deficit">${plan.reachWar.toFixed(2)}&times; the odds against</strong></div>` : ''}
      ${canPay ? '' : '<div class="warn-box">\u26d4 Your treasury cannot pay for this. Drop an Area, or bank another turn of income.</div>'}
    </div>`;

    // A refusal that is not about money gets its own sentence, before the click.
    const refusal = plan && !plan.ok && canPay
      ? `<div class="warn-box">\u26d4 ${escapeHtml(plan.reason || 'This annexation is not allowed.')}</div>` : '';

    const blockedGo = !plan || !plan.ok;
    setPanel(`
      ${actionHead('\u2694\ufe0f Annex counties', n)}
      <p class="hint-block">Click <strong>highlighted counties</strong> bordering your nation to add them. Click a chosen
      county again to drop it.</p>
      <div class="stat"><div class="label">Mobilisation budget</div>
        <div class="value">${A.chosen.size} / ${A.budget} ${plural(A.budget, 'Area', 'Areas')}</div>
        <div class="geo-row"><span>A fixed budget &mdash; not a share of your size, so it does not grow as you do.</span></div>
      </div>
      ${costHtml}
      ${refusal}
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
  /*
   * UI ONLY, from M6.3. Everything this used to do — paying, rolling, moving
   * Areas, charging the losers, writing the ledger — is `Moves.resolve`, which
   * is also what the AI calls. Two implementations of "what an annexation does",
   * one reachable by a human and one by the other fifty nations, is the exact
   * disagreement M6.1 exists to prevent; this file kept its copy until M6.3 made
   * the second caller real.
   */
  function confirmAnnex() {
    if (!A.chosen.size) return;
    const nid = A.nid;
    const chosen = [...A.chosen];
    const me = Game.getNation(nid);
    const r = Moves.resolve({ type: 'annex', nid, areas: chosen }, store.rng);
    if (!r.ok) return flash(`\u26d4 <strong>${escapeHtml(me.name)}</strong> \u2014 ${escapeHtml(r.reason)}`, 'bad');

    A = null;
    restoreColorMode();
    clearVisuals();

    const res = r.res;
    const bill = `<span class="deal-cost">Cost ${fmtGdp(r.cost)}.</span>`;
    let msg, kind;
    if (!res.triggered) {
      msg = `Annexed <strong>${chosen.length}</strong> ${plural(chosen.length, 'county', 'counties')} peacefully. ${bill}`;
      kind = 'good';
    } else if (res.outcome === 'victory') {
      msg = `${cwLine(res)} <strong>Complete victory!</strong> All ${chosen.length} counties annexed. ${bill}`;
      kind = 'good';
    } else if (res.outcome === 'partial') {
      msg = `${cwLine(res)} <strong>Partial victory.</strong> Held ${r.taken.length} of ${chosen.length} counties &mdash; a connected front from your border. ${bill}`;
      kind = r.taken.length ? 'good' : 'warn';
    } else {
      /*
       * Report what actually happened territorially. A selection smaller than
       * nation.minAreas cannot form a breakaway, so its fragments go to their
       * nearest neighbour — which, with the attacker excluded, is usually the
       * nation that already owned them. That is the right OUTCOME (the defender
       * holds) and the wrong MESSAGE: the old text claimed the counties
       * "scattered and were absorbed by neighboring nations" when nothing moved.
       */
      const born = r.born.length;
      msg = born
        ? `${cwLine(res)} <strong>The union fell apart!</strong> The ${chosen.length} counties splintered into ${born} new ${plural(born, 'nation', 'nations')}. ${bill}`
        : `${cwLine(res)} <strong>The offensive collapsed.</strong> The defenders held, and your own people paid for it. ${bill}`;
      kind = 'bad';
    }
    flash(msg, kind);
    completeTurn();
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
      if (Game.area(f) && !Game.isHomeGround(A.nid, f)) occupiedGiven++;
    }
    const savedAdmin = A.chosen.size * TUNE.get('econ.areaUpkeep');

    /*
     * ...AND WHAT IT COSTS (M9.4).
     *
     * Handing ground over is not free: `release.costGdpShare` of the released
     * output is a settlement, charged once. This panel showed the savings and
     * only the savings, so release read as a pure gain - which is precisely
     * backwards for a valve whose whole design is "relief, at a price". The
     * price is the reason autonomy and appeasement are different answers to the
     * same problem rather than worse versions of this one.
     */
    const plan = A.chosen.size
      ? Moves.plan({ type: 'release', nid: A.nid, areas: [...A.chosen] }) : null;
    const cost = plan ? plan.cost : 0;
    const settleHtml = plan
      ? `<div class="stat"><div class="label">Settlement, paid once</div>
          <div class="value deficit">&minus;${fmtGdp(cost)}</div>
          <div class="geo-row"><span>Treasury after</span><strong class="${plan.ok ? 'surplus' : 'deficit'}">${fmtGdp(n.treasury - cost)}</strong></div>
          <div class="geo-row"><span>${Math.round(TUNE.get('release.costGdpShare') * 100)}% of the output you are handing over.</span></div>
          ${plan.ok ? '' : `<div class="warn-box">\u26d4 ${escapeHtml(plan.reason || 'This handover cannot be arranged.')}</div>`}
        </div>`
      : '';

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
      ${settleHtml}
      <div class="stat"><div class="label">Population after</div><div class="value">${fmtPop(after.pop)} <span class="delta">${given.pop ? '&minus;' + fmtPop(given.pop) : ''}</span></div></div>
      <div class="stat"><div class="label">GDP after</div><div class="value">${fmtGdp(after.gdp)} <span class="delta">${given.gdp ? '&minus;' + fmtGdp(given.gdp) : ''}</span></div></div>
      <div class="stat"><div class="label">Political leaning after</div>${renderPolitics(after)}</div>
      <div class="btn-row">
        <button class="btn ghost" id="a-cancel">Cancel</button>
        <button class="btn go" id="a-go" ${plan && plan.ok ? '' : 'disabled'}>Release ${A.chosen.size ? '(' + A.chosen.size + ')' : ''}</button>
      </div>
    `);
    document.getElementById('a-cancel').onclick = cancel;
    document.getElementById('a-go').onclick = confirmRelease;
  }

  function confirmRelease() {
    if (!A.chosen.size) return;
    const nid = A.nid;
    const chosen = [...A.chosen];
    const name = Game.getNation(nid).name;
    const r = Moves.resolve({ type: 'release', nid, areas: chosen }, store.rng);
    if (!r.ok) return flash(escapeHtml(r.reason), 'warn');

    A = null;
    clearVisuals();
    const parts = [];
    if (r.born.length) {
      parts.push(`${r.toNew} ${plural(r.toNew, 'Area', 'Areas')} became ` +
        `${r.born.length} new ${plural(r.born.length, 'nation', 'nations')} ` +
        `(<strong>${r.born.map((id) => escapeHtml(Game.getNation(id) ? Game.getNation(id).name : id)).join('</strong>, <strong>')}</strong>)`);
    }
    if (r.toNeighbours) parts.push(`${r.toNeighbours} ${plural(r.toNeighbours, 'Area', 'Areas')} joined neighbouring nations`);
    if (r.refused) parts.push(`${r.refused} had nowhere to go and stayed`);
    flash(`\u{1F54A}\uFE0F <strong>${escapeHtml(name)}</strong> released ${chosen.length} `
      + `${plural(chosen.length, 'Area', 'Areas')}: ${parts.join('; ')}.`,
      r.refused === chosen.length ? 'warn' : '');
    completeTurn();
  }

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
    treaty, aid,
    isActive, start, onHover, onClick, cancel,
    annexCooldownLeft, annexCost,
    tradeCooldownLeft, nationTradeCapacityFor, hasExportAccess, exportFlows, applyCapacity,
    releaseCooldownLeft, startReleaseWith,
    recognise,
  };
})();
