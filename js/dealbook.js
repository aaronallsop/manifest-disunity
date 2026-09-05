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
 * a DEAL, because deals run their term (D171) — and inventing a breach cost
 * while nobody has played with deals yet would be tuning by construction. The
 * other two tabs are different: an offer that cannot be answered is not an
 * offer, and a corridor is explicitly revocable with notice (A2), which is the
 * machinery the deferred "walk out of a deal" idea will eventually be built on.
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

  /** A name a person would use, for a nation or for a place that is not one. */
  const nodeName = (id) => {
    if (id === Transit.CANADA) return 'Canada';
    if (id === Transit.MEXICO) return 'Mexico';
    if (id === Transit.WORLD) return 'the world market';
    const n = Game.getNation(id);
    return n ? n.name : id;
  };

  const stallWhy = (why) => ({
    revoked: 'they closed the border',
    lost: 'that country no longer exists',
    capped: 'the corridor is full',
    expired: 'the agreement ran out',
  }[why] || 'no way through');

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
      /*
       * THE ONE LINE THAT MAKES A2 LEGIBLE BEFORE THE MAP EXISTS. If a deal's
       * goods cross somebody else's ground, the toll and the deal it comes off
       * belong in the same row — otherwise the player sees an income that does
       * not match the arithmetic and has nowhere to look.
       */
      const via = d.route && d.route.hops && d.route.hops.length
        ? `<div class="db-via${d.route.stalled ? ' stalled' : ''}">${d.route.stalled
            ? `&#9888; stopped at ${escapeHtml(nodeName(d.route.stalled.at))} &mdash; ${escapeHtml(stallWhy(d.route.stalled.why))}`
            : `&minus;${Math.round((1 - carriage) * 100)}% &middot; through ${escapeHtml(
                d.route.hops.map((h) => nodeName(h.node)).join(', '))}`}</div>`
        : '';
      return `<div class="db-row">
        <div class="db-who"><i class="dot" style="background:${them ? them.color : '#888'}"></i>${escapeHtml(them ? them.name : '?')}</div>
        <div class="db-what">${drift}${via}</div>
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

  /* ---- routes -------------------------------------------------------- */

  /*
   * SECOND OF THREE TABS, BECAUSE IT EXPLAINS THE FIRST. A player looking at a
   * deal that pays less than it should needs the corridor it crosses to be one
   * click away, not somewhere else in the game.
   *
   * Two halves, and they are different decisions. Routes you USE cost you money
   * and giving one up hurts nobody but you, so it is a plain button. Routes you
   * GRANT earn you money and closing one is done TO somebody, so it takes notice
   * and it costs you standing — which is why that button says what it will cost.
   */
  function routesHtml(me) {
    const now = World.getTurn();
    const all = Transit.forNation(me, now);
    const using = all.filter((r) => r.grantee === me);
    const granting = all.filter((r) => r.grantor === me);
    if (!all.length) {
      return '<p class="ob-empty">No corridors. Open <strong>Trade with nation</strong> on your own card '
        + 'and ask a neighbour for a standing right to cross their ground &mdash; or wait to be asked.</p>';
    }
    const row = (r, mine) => {
      const other = Game.getNation(mine ? r.grantee : r.grantor);
      const left = Transit.remaining(r, now);
      const noticed = r.status === 'noticed';
      return `<div class="db-row">
        <div class="db-who"><i class="dot" style="background:${other ? other.color : '#888'}"></i>${
          escapeHtml(other ? other.name : '?')}<small>${mine ? 'crosses your ground' : 'you cross theirs'}</small></div>
        <div class="db-what"><div class="db-sec"><span>${escapeHtml(Transit.MODE_LABEL[r.mode])}</span>
          <em class="db-drift">${Math.round(r.rate * 100)}% of what passes</em></div></div>
        <div class="db-pay ${mine ? 'surplus' : 'deficit'}">${mine ? '+' : '&minus;'}${Math.round(r.rate * 100)}%<small>${
          mine ? 'to you' : 'to them'}</small></div>
        <div class="db-when"><strong class="${noticed ? 'deficit' : 'surplus'}">${noticed
          ? `closes in ${Math.max(0, r.endsTurn - now)} ${(Math.max(0, r.endsTurn - now) === 1 ? 'turn' : 'turns')}`
          : `${left} ${(left === 1 ? 'turn' : 'turns')} left`}</strong>
          <small>${escapeHtml(Calendar.label(r.since + r.duration, T()))}</small></div>
        <div class="db-renew db-acts">${noticed
          ? `<button class="btn ghost db-undo" data-id="${escapeHtml(r.id)}">Take it back</button>`
          : `<button class="btn ghost db-end" data-id="${escapeHtml(r.id)}">${mine
              ? `Give ${r.notice} ${(r.notice === 1 ? 'turn' : 'turns')}' notice` : 'Give it up'}</button>`}</div>
      </div>`;
    };
    return `${granting.length ? `<div class="db-head"><div class="db-who">Routes you grant</div>
        <div class="db-what">How</div><div class="db-pay">Toll</div>
        <div class="db-when">Runs until</div><div class="db-renew"></div></div>
      ${granting.map((r) => row(r, true)).join('')}` : ''}
      ${using.length ? `<div class="db-head" style="margin-top:12px"><div class="db-who">Routes you use</div>
        <div class="db-what">How</div><div class="db-pay">Toll</div>
        <div class="db-when">Runs until</div><div class="db-renew"></div></div>
      ${using.map((r) => row(r, false)).join('')}` : ''}
      <p class="db-total">Closing a corridor somebody relies on is remembered &mdash; by them, and by
        everyone watching.</p>`;
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
    const body = tab === 'offers' ? offersHtml(me)
      : (tab === 'routes' ? routesHtml(me) : runningHtml(me));
    openModal(`
      <h3>Deals</h3>
      <div class="ob-tabs">
        <button class="ob-tab${tab === 'running' ? ' active' : ''}" data-tab="running">Running (${Deals.forNation(me).length})</button>
        <button class="ob-tab${tab === 'routes' ? ' active' : ''}" data-tab="routes">Routes (${Transit.forNation(me).length})</button>
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
    // Ending a corridor goes through the Move, so it costs what it costs and
    // the neighbourhood hears about it — never straight into the register.
    document.querySelectorAll('.db-end').forEach((b) => {
      b.onclick = () => {
        const r = Moves.resolve({ type: 'revoke', nid: me, agreementId: b.dataset.id }, store.rng);
        if (!r.ok) flash(`\u26d4 ${escapeHtml(r.reason)}`, 'bad');
        else flash(r.closing ? '\u{1F6E7} Notice given.' : '\u{1F6E7} You have given up that route.', '');
        Game.touch({ values: true });
        open('routes');
      };
    });
    document.querySelectorAll('.db-undo').forEach((b) => {
      b.onclick = () => {
        Transit.withdraw(b.dataset.id);
        flash('The route stays open. What was said about it stays said.', '');
        open('routes');
      };
    });
  }

  return { open, termWords };
})();
