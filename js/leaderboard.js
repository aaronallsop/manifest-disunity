/*
 * Leaderboard: ranks every current nation by population, GDP, or ideology.
 * Rebuilt from the model on every change, so nations that form or dissolve appear
 * and disappear automatically. Clicking a row selects that nation on the map.
 */
const Leaderboard = (function () {
  let sortKey = 'pop'; // 'pop' | 'gdp' | 'political'

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
      });
    }
    if (sortKey === 'pop') list.sort((a, b) => b.pop - a.pop);
    else if (sortKey === 'gdp') list.sort((a, b) => b.gdp - a.gdp);
    // Grouped by ideology in canonical order, firmest first within each — so the
    // list reads as a political map of the board rather than one axis of it.
    else list.sort((a, b) => (a.dominant - b.dominant) || (b.lead - a.lead));
    return list;
  }

  function metric(r) {
    if (sortKey === 'pop') return fmtPopShort(r.pop);
    if (sortKey === 'gdp') return fmtGdpShort(r.gdp);
    if (r.dominant < 0) return '—';
    return `${Ideology.byIndex(r.dominant).short}+${r.lead.toFixed(0)}`;
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
        ${sortBtn('pop', 'Pop')}${sortBtn('gdp', 'GDP')}${sortBtn('political', 'Ideology')}
      </div>
      <ol class="lb-list">
        ${list
          .map(
            (r, i) => `<li class="lb-row ${r.id === selId ? 'sel' : ''}" data-id="${r.id}">
            <span class="lb-rank">${i + 1}</span>
            <span class="lb-sw" style="background:${r.color}"></span>
            <span class="lb-name">${escapeHtml(r.name)}</span>
            <span class="lb-metric" ${sortKey === 'political' && r.dominant >= 0 ? `style="color:${Ideology.colorAt(r.dominant)}"` : ''}>${metric(r)}</span>
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
