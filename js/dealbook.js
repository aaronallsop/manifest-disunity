/*
 * THE DEALS SCREEN (A1) — everything you have promised, on one page.
 *
 * WHY IT IS NOT CALLED A LEDGER. `Ledger` is the event ledger, the newspaper of
 * things that happened. This is a register of things that are STILL TRUE, which
 * is a different kind of object, and two modules whose names both ended in
 * "Ledger" would be read as the same thing by everybody who came afterwards.
 *
 * WHY IT EXISTS AT ALL, given the nation panel already lists deals. The panel
 * block shows the five closest to running out and the income, which is what you
 * want at a glance. It cannot show the thing that makes a long deal a bet: the
 * price you signed at against the price today. Over five years that gap is the
 * whole story of the deal, and it needs a column, not a hover.
 *
 * READ-ONLY on the running tab, deliberately. There is no button here to break
 * a deal, because in this stage deals run their term (D171) — and inventing a
 * breach cost while nobody has played with deals yet would be tuning by
 * construction. The offers tab is the exception, because an offer that cannot
 * be answered is not an offer.
 */
const DealBook = (function () {
  let tab = 'running';

  const T = () => window.TUNE;

  /** '4 turns' as a person would say it, from the calendar's own month count. */
  const SPELT = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  function termWords(turns) {
    const months = turns * (T().peek('calendar.monthsPerTurn') || 3);
    if (months % 12 === 0) {
      const y = months / 12;
      return `${SPELT[y] || y} ${y === 1 ? 'year' : 'years'}`;
    }
    return `${SPELT[months] || months} months`;
  }

  const sectorName = (i) => {
    const e = typeof MapModes === 'undefined' ? null : MapModes.getEconomy();
    return e && e.sectors ? e.sectors[i] : `sector ${i}`;
  };

  /**
   * The countdown's colour. The same rule the nation panel uses, and for the
   * same reason: amber has to mean "running out", not "exists", so it must be
   * both inside the warning window AND past the halfway point of this deal's
   * own term. Otherwise a four-turn deal is amber from the hour it is signed.
   */
  function countdownClass(left, duration) {
    const warnAt = Math.max(...(T().peek('deal.countdownAt') || [1]));
    if (left <= 1) return 'deficit';
    return (left <= warnAt && left <= duration / 2) ? 'warn' : 'surplus';
  }

  /* ---- running ------------------------------------------------------ */

  function runningHtml(me) {
    const live = Deals.forNation(me);
    if (!live.length) {
      return '<p class="ob-empty">No deals running. Open <strong>Trade with nation</strong> on your own '
        + 'card and click a neighbour to sign one.</p>';
    }
    const prices = typeof Market === 'undefined' ? null : Market.getPrices();
    const rows = live.map((d) => {
      const them = Game.getNation(Deals.other(d, me));
      const left = Deals.remaining(d);
      const s = Deals.settlement(d, T());
      const carriage = Transit.keep(d, T());
      const mine = (d.a === me ? s.a : s.b) * carriage;
      /*
       * THE BET, in one cell. A deal holds the price it was signed at for its
       * whole term, so a seller who signed at 104 and watched the index climb
       * to 130 is losing money every quarter and has no way to know it unless
       * this column exists.
       */
      const drift = d.flows.map((f) => {
        const now = prices ? Math.round(prices[f.i]) : null;
        const then = Math.round(f.price);
        const dir = now == null || now === then ? '' : (now > then ? ' up' : ' down');
        return `<div class="db-sec"><span>${escapeHtml(sectorName(f.i))}</span>` +
          `<em class="db-drift${dir}">signed ${then}${now == null || now === then ? '' : ` &rarr; ${now}`}</em></div>`;
      }).join('');
      return `<div class="db-row">
        <div class="db-who"><i class="dot" style="background:${them ? them.color : '#888'}"></i>${escapeHtml(them ? them.name : '?')}</div>
        <div class="db-what">${drift}</div>
        <div class="db-pay surplus">+${fmtGdp(mine * 1e6)}<small>a turn</small></div>
        <div class="db-when"><strong class="${countdownClass(left, d.duration)}">${left} ${left === 1 ? 'turn' : 'turns'} left</strong>
          <small>${escapeHtml(Calendar.label(d.since + d.duration, T()))} &middot; signed for ${escapeHtml(termWords(d.duration))}</small></div>
        <div class="db-renew">${d.autoRenew ? '&#10003; renews' : '&mdash;'}</div>
      </div>`;
    }).join('');
    const income = Transit.netFor(me, T());
    return `<div class="db-head">
        <div class="db-who">With</div><div class="db-what">What, and at what price</div>
        <div class="db-pay">To you</div><div class="db-when">Runs until</div><div class="db-renew">Renew</div>
      </div>${rows}
      <p class="db-total">${live.length} ${live.length === 1 ? 'deal' : 'deals'} running &middot;
        <strong class="surplus">+${fmtGdp(income * 1e6)}</strong> a turn to your treasury.</p>`;
  }

  /* ---- on the table -------------------------------------------------- */

  function offersHtml(me) {
    const open = Deals.offersFor(me);
    if (!open.length) {
      return '<p class="ob-empty">Nothing on the table. When another nation wants a deal with you it '
        + 'arrives here, and as a card at the end of the round.</p>';
    }
    const now = World.getTurn();
    return open.map((o) => {
      const them = Game.getNation(o.from);
      const plan = Moves.plan({ type: 'trade', nid: me, target: o.from,
        terms: { duration: o.terms.duration, autoRenew: o.terms.autoRenew, priceMult: o.terms.priceMult } }, T());
      const per = plan.ok && plan.perTurn ? plan.perTurn.me : 0;
      const expires = o.expires - now;
      return `<div class="db-row db-offer" data-offer="${escapeHtml(o.id)}">
        <div class="db-who"><i class="dot" style="background:${them ? them.color : '#888'}"></i>${escapeHtml(them ? them.name : '?')}
          <small>${o.kind === 'renew' ? 'wants to renew' : 'wants a deal'}</small></div>
        <div class="db-what">${o.terms.flows.map((f) => `<div class="db-sec"><span>${escapeHtml(sectorName(f.i))}</span>
          <em class="db-drift">quoted ${Math.round(f.price)}</em></div>`).join('')}</div>
        <div class="db-pay ${plan.ok ? 'surplus' : 'deficit'}">${plan.ok ? `+${fmtGdp(per * 1e6)}` : '&mdash;'}<small>a turn</small></div>
        <div class="db-when"><strong>${escapeHtml(termWords(o.terms.duration))}</strong>
          <small>expires in ${expires} ${expires === 1 ? 'turn' : 'turns'}</small></div>
        <div class="db-renew db-acts">
          <button class="btn go db-yes" data-id="${escapeHtml(o.id)}" ${plan.ok ? '' : 'disabled'}
            title="${plan.ok ? '' : escapeHtml(plan.reason || '')}">Sign</button>
          <button class="btn ghost db-no" data-id="${escapeHtml(o.id)}">No</button>
        </div>
      </div>`;
    }).join('');
  }

  /* ---- the screen ---------------------------------------------------- */

  function open(which) {
    // The crisis card and the expiry card both outrank this one.
    if (typeof screenBlocked === 'function' && screenBlocked()) {
      return flash('Answer what the game is asking first.', 'warn');
    }
    const me = Game.getPlayer();
    if (!me) return flash('No nation is yours yet.', 'warn');
    if (which) tab = which;
    if (typeof Telemetry !== 'undefined') Telemetry.note('dealbook', { d: tab });
    const nOpen = Deals.offersFor(me).length;
    const body = tab === 'offers' ? offersHtml(me) : runningHtml(me);
    openModal(`
      <h3>Deals</h3>
      <div class="ob-tabs">
        <button class="ob-tab${tab === 'running' ? ' active' : ''}" data-tab="running">Running (${Deals.forNation(me).length})</button>
        <button class="ob-tab${tab === 'offers' ? ' active' : ''}" data-tab="offers">On the table (${nOpen})</button>
      </div>
      <div class="ob-body db-body">${body}</div>
      <div class="modal-btns"><button class="btn ghost" data-close>Close</button></div>`,
    { wide: true });
    document.querySelectorAll('.ob-tab').forEach((b) => { b.onclick = () => open(b.dataset.tab); });
    /*
     * Both answers go through the model, never the DOM, so the same decision is
     * reachable from the card at the end of the round and from here and cannot
     * behave differently in the two places.
     */
    document.querySelectorAll('.db-yes').forEach((b) => {
      b.onclick = () => {
        const r = Deals.answer(b.dataset.id, 'renew', T());
        if (r.ok) flash('\u{1F69B} Signed.', 'good');
        else flash(`⛔ ${escapeHtml(r.reason)}`, 'bad');
        Game.touch({ values: true });
        open(tab);
      };
    });
    document.querySelectorAll('.db-no').forEach((b) => {
      b.onclick = () => { Deals.answer(b.dataset.id, 'lapse', T()); open(tab); };
    });
  }

  return { open, termWords };
})();
