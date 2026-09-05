/*
 * Leaderboard: ranks every current nation by population, GDP, ideology or one of
 * the four power stocks. Rebuilt from the model on every change, so nations that
 * form or dissolve appear and disappear automatically. Clicking a row selects
 * that nation on the map.
 *
 * The power sorts exist because a stock you can only read one nation at a time
 * is half a feature: the interesting question about Authority is never "what is
 * California's" but "who is weakest, and who is climbing". The values are read
 * straight off the nation record, where the power phase left them, so this view
 * costs one property read per nation and cannot disagree with the panel.
 */
const Leaderboard = (function () {
  // 'pop' | 'gdp' | 'political' | 'authority' | 'influence' | 'qol' | 'liberties'
  let sortKey = 'pop';
  const STOCKS = {
    authority: 'Authority', influence: 'Influence', qol: 'Quality of life', liberties: 'Liberties',
  };

  function rows() {
    const list = [];
    for (const [id, n] of Game.nations) {
      const d = Game.nationDemographics(id);
      // The lead over the runner-up, which is what "how firmly" means once there
      // are six ideologies rather than two. A margin off a single D-minus-R line
      // cannot express it.
      let first = 0, second = 0;
      for (const s of d.shares) {
        if (s > first) { second = first; first = s; }
        else if (s > second) second = s;
      }
      list.push({
        id, name: n.name, color: n.color, pop: d.pop, gdp: d.gdp,
        dominant: d.dominant, lead: first - second,
        econ: d.centroid.economic, social: d.centroid.social,
        authority: n.authority, influence: n.influence, qol: n.qol, liberties: n.liberties,
        // Where the stock is heading, so a nation on the way down reads
        // differently from one that has been weak for a decade.
        trend: n.why && n.why[sortKey] ? n.why[sortKey].target - n.why[sortKey].value : 0,
      });
    }
    if (sortKey === 'pop') list.sort((a, b) => b.pop - a.pop);
    else if (sortKey === 'gdp') list.sort((a, b) => b.gdp - a.gdp);
    else if (STOCKS[sortKey]) list.sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));
    // Grouped by ideology in canonical order, firmest first within each — so the
    // list reads as a political map of the board rather than one axis of it.
    else list.sort((a, b) => (a.dominant - b.dominant) || (b.lead - a.lead));
    return list;
  }

  function metric(r) {
    if (sortKey === 'pop') return fmtPopShort(r.pop);
    if (sortKey === 'gdp') return fmtGdpShort(r.gdp);
    if (STOCKS[sortKey]) {
      const v = r[sortKey];
      if (typeof v !== 'number') return '—';
      const arrow = r.trend > 0.005 ? '\u2191' : r.trend < -0.005 ? '\u2193' : '';
      return `${(v * 100).toFixed(0)}%${arrow}`;
    }
    if (r.dominant < 0) return '—';
    return `${Ideology.byIndex(r.dominant).short}+${r.lead.toFixed(0)}`;
  }

  /**
   * Colour the metric: ideology by its own colour, a power stock by a red-amber-
   * green heat. A column of bare percentages is hard to scan for the one nation
   * that is in trouble, which is the whole reason to sort by it.
   */
  function metricStyle(r) {
    if (sortKey === 'political') {
      return r.dominant >= 0 ? `style="color:${Ideology.colorAt(r.dominant)}"` : '';
    }
    if (!STOCKS[sortKey] || typeof r[sortKey] !== 'number') return '';
    const v = r[sortKey];
    const c = v >= 0.6 ? '#3bb273' : v >= 0.4 ? '#e3c229' : v >= 0.25 ? '#e8862d' : '#e0483b';
    return `style="color:${c}"`;
  }

  function refresh() {
    const host = document.getElementById('leaderboard');
    if (!host) return;
    const selId = store.selected && store.selected.level === 'nation' ? store.selected.id : null;
    const list = rows();
    host.innerHTML = `
      <div class="lb-head">
        <span class="lb-title">Leaderboard</span>
        <span class="lb-count">${list.length} nations</span>
      </div>
      <div class="lb-sort">
        ${sortBtn('pop', 'Pop')}${sortBtn('gdp', 'GDP')}
        ${Complexity.enabled('politics') ? `${sortBtn('political', 'Ideology')}
        ${sortBtn('authority', 'Auth')}${sortBtn('influence', 'Infl')}` : ''}
        ${sortBtn('qol', 'QoL')}
        ${Complexity.enabled('politics') ? sortBtn('liberties', 'Lib') : ''}
      </div>
      <ol class="lb-list">
        ${list
          .map(
            (r, i) => `<li class="lb-row ${r.id === selId ? 'sel' : ''}" data-id="${r.id}">
            <span class="lb-rank">${i + 1}</span>
            ${typeof Identity !== 'undefined' && Identity.loaded()
              ? Identity.flag(r.id, 16, 11)
              : `<span class="lb-sw" style="background:${r.color}"></span>`}
            <span class="lb-name">${escapeHtml(r.name)}</span>
            <span class="lb-metric" ${metricStyle(r)}>${metric(r)}</span>
          </li>`
          )
          .join('')}
      </ol>
      ${typeof Market !== 'undefined' ? Market.html() : ''}`;
    host.querySelectorAll('.lb-row').forEach((el) => {
      el.addEventListener('click', () => {
        if (Actions.isActive()) return;
        setMode('nations');
        select('nation', el.dataset.id);
      });
    });
    host.querySelectorAll('.lb-sort button').forEach((b) => {
      b.addEventListener('click', () => {
        sortKey = b.dataset.key;
        refresh();
      });
    });
  }

  const sortBtn = (key, label) => `<button data-key="${key}" class="${sortKey === key ? 'active' : ''}">${label}</button>`;

  /* Move the selection highlight without rebuilding 51 rows, re-reading 1,676
     Area records and re-attaching ~54 listeners. select() used to call refresh(),
     which meant every onGameChange rebuilt the leaderboard twice. */
  function setSelected(nid) {
    const host = document.getElementById('leaderboard');
    if (!host) return;
    host.querySelectorAll('.lb-row').forEach((el) => el.classList.toggle('sel', el.dataset.id === nid));
  }

  return { refresh, setSelected };
})();

/* compact number formatting for the narrow leaderboard column */
function fmtPopShort(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
  return String(Math.round(n));
}
function fmtGdpShort(n) {
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(0) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(0) + 'M';
  return '$' + Math.round(n);
}
