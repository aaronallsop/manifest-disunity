/*
 * THE OBJECTIVES SCREEN (M10.1) — how you win, and how to read the game.
 *
 * The audit's finding was blunt: "the victory paths are never enumerated
 * anywhere in the UI. A stranger cannot answer 'what are my ways to win,' and
 * no surface explains the two axes, the stocks, or the eight map modes." All
 * three of those things exist in the model and are already explained — by
 * `Victory.CONDITIONS`, by the TUNE schema's `doc` strings, by the stock
 * summaries. What was missing was a door.
 *
 * TAUGHT BY EXPLAINING, NOT BY TUTORIALIZING. Nothing here walks the player
 * through a click. It is a reference they open when they want one, showing the
 * three conditions with live per-term progress, who is closest to each, and two
 * sentences on every quantity the game will otherwise expect them to already
 * understand.
 *
 * GENERATED, NOT WRITTEN. The reference tab is built from `TuneMeta.describe(key)`
 * and the same `CONDITIONS` table the victory check runs on. That is the whole
 * design: hand-written copy about a tuned system goes stale on the first tuning
 * pass, silently, and the player is the last to find out. If a target moves,
 * this screen says the new number the same turn — because it is reading the
 * number, not a memory of it.
 *
 * WHAT IT DELIBERATELY DOES NOT DO is rank the player against the leaders on a
 * single scale. Three conditions are three different games, and a league table
 * across them would invent a comparison the model does not make.
 */
const Objectives = (function () {
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let tab = 'win';

  /*
   * A victory term is a ratio against a target, and the two are of wildly
   * different kinds — a share of the continent's people, a stock between 0 and
   * 1, a multiple of the median nation's GDP per head. Formatting follows the
   * target rather than the value, so "1.30x the median" does not render as
   * "130%" of anything.
   */
  const fmtTerm = (value, target) => (target > 1.0001
    ? `${value.toFixed(2)}× of ${target.toFixed(2)}×`
    : `${Math.round(value * 100)}% of ${Math.round(target * 100)}%`);

  /* ---- the three conditions, live ---------------------------------- */

  function conditionHtml(row, isMine) {
    const pct = Math.round(row.progress * 100);
    const bind = row.terms.filter((x) => !x.met).sort((a, b) => a.progress - b.progress)[0];
    return `
      <div class="ob-cond${row.met ? ' met' : ''}">
        <div class="ob-head">
          <span class="ob-name">${esc(row.label)}</span>
          <span class="ob-pct${row.met ? ' met' : ''}">${row.met ? 'ACHIEVED' : pct + '%'}</span>
        </div>
        <p class="ob-blurb">${esc(row.blurb)}</p>
        <div class="ob-terms">
          ${row.terms.map((t) => {
    const w = Math.round(Math.min(1, t.progress) * 100);
    const doc = TuneMeta.describe(t.key);
    return `<div class="ob-term${t.met ? ' met' : ''}${bind && bind.key === t.key ? ' binding' : ''}"
              title="${esc(doc ? doc.doc : '')}">
              <span class="ob-tl">${esc(t.label)}</span>
              <span class="ob-bar"><i style="width:${w}%"></i></span>
              <span class="ob-tv">${esc(fmtTerm(t.value, t.target))}</span>
            </div>`;
  }).join('')}
        </div>
        ${bind && isMine
    ? `<p class="ob-bind">The one holding you back is <strong>${esc(bind.label)}</strong>. `
              + `${esc((TuneMeta.describe(bind.key) || {}).doc || '').slice(0, 240)}</p>`
    : ''}
      </div>`;
  }

  /*
   * WHO ELSE IS CLOSE, per condition rather than overall.
   *
   * `Victory.standings` sorts on a nation's BEST condition, which answers "who
   * is winning" and not "who is winning at this". A player deciding whether to
   * contest Economic Supremacy needs the second question, and the first would
   * hide a nation two moves from it behind three nations idling near a
   * different one.
   */
  function rivalsHtml(condId, me) {
    const rows = [];
    for (const [nid] of Game.nations) {
      const r = Victory.progress(nid).find((x) => x.id === condId);
      if (r) rows.push({ nid, name: Game.getNation(nid).name, progress: r.progress });
    }
    rows.sort((a, b) => b.progress - a.progress);
    const top = rows.slice(0, 3);
    if (!top.length) return '';
    return `<div class="ob-rivals">${top.map((r) => {
      const n = Game.getNation(r.nid);
      return `<span class="ob-rival${r.nid === me ? ' mine' : ''}">
        <span class="dot" style="background:${n.color}"></span>${esc(r.name)}
        <b>${Math.round(r.progress * 100)}%</b></span>`;
    }).join('')}</div>`;
  }

  function winHtml() {
    const me = Game.getPlayer();
    if (!me || !Victory.loaded()) {
      return '<p class="ob-empty">The victory conditions load with the seats of government; '
        + 'they are not available in this world.</p>';
    }
    const rows = Victory.progress(me);
    const grace = TUNE.peek('win.graceTurns');
    const turn = World.getTurn();
    return `
      <p class="ob-lede">Three ways to win, and they are three different games. Every requirement is
        an <strong>AND</strong>, so the percentage shown is the <em>worst</em> of them &mdash; the
        one still holding you back, not an average that would flatter you.</p>
      ${turn < grace
    ? `<p class="ob-note">Nobody can win before world turn <strong>${grace}</strong>. The opening
          position is not a victory.</p>` : ''}
      ${rows.map((r) => conditionHtml(r, true) + rivalsHtml(r.id, me)).join('')}`;
  }

  /* ---- the reference, generated ------------------------------------ */

  /*
   * Two sentences each, and the second sentence is the tunable's own `doc`.
   * The first is the only hand-written text on this tab, because "what is this
   * quantity" is a claim about the design and the design does not move when a
   * slider does.
   */
  const STOCKS = [
    ['Authority', 'power.authority.base',
      'How firmly a state holds its own ground — age, tenure, wars won, solvency, cohesion, '
      + 'against territory lost and ground occupied.'],
    ['Influence', 'power.influence.base',
      'How the rest of the continent regards you. It is the one stock conquest actively costs, '
      + 'and the reason a conqueror can hold everything and still not be able to close.'],
    ['Quality of life', 'qol.base',
      'What it is like to live there. It pulls people in through migration and it is a '
      + 'requirement of Economic Supremacy.'],
    ['Civil liberties', 'liberty.base',
      'How free the place is. Low liberties are what let a government refuse an election it '
      + 'lost — and what makes every movement in its ground angrier for it.'],
    ['War weariness', 'power.weariness.base',
      'What fighting costs at home. It is the aggressor’s: being invaded was always '
      + 'expensive, and this is the price of doing the invading.'],
  ];

  /*
   * Keyed by the `data-color` the header button carries, so the tooltip and the
   * reference tab cannot drift: they are the same string, read twice (M10.3).
   */
  const MODES = [
    ['Standard', 'Each nation in its own colour. The borders are who owns what.', 'standard'],
    ['Pressure', 'How close each Area is to leaving. This is the map that tells you where the game '
      + 'is about to happen.', 'pressure'],
    ['Political', 'The leading ideology in each Area, on the same six-colour scale as everything else.', 'political'],
    ['GDP', 'Economic output per Area, darker for more.', 'gdp'],
    ['Population', 'People per Area.', 'population'],
    ['Geographic', 'The authored regional map — the physical continent rather than the political one.', 'geographic'],
    ['Culture', 'The authored cultural regions. This is the map movements are written against, which '
      + 'is why a homeland can cross a state line.', 'cultural'],
    ['Economy', 'Which of the six sectors each Area actually produces.', 'economy'],
  ];

  function refHtml() {
    const stock = ([label, key, lead]) => {
      const d = TuneMeta.describe(key);
      return `<div class="ob-ref">
        <div class="ob-rt">${esc(label)}</div>
        <p>${esc(lead)}</p>
        ${d ? `<p class="ob-doc">${esc(d.doc)}</p>` : ''}
      </div>`;
    };
    const ideologies = (Ideology.all && Ideology.all()) || [];
    return `
      <p class="ob-lede">Everything below is read out of the model, not written down beside it. If a
        number here disagrees with the game, the game is right and this is a bug.</p>

      <h4>The two axes</h4>
      <p class="ob-doc">Politics is not a left&ndash;right line. Every ideology sits at a fixed point
        on two axes &mdash; <strong>economic</strong> (market to planned) and <strong>social</strong>
        (traditional to progressive) &mdash; and how close two of them are on that plane decides
        everything from whether a coalition holds to how badly a change of government goes.</p>
      ${ideologies.length ? `<div class="ob-ideo">${ideologies.map((i) =>
    `<span class="ob-i"><span class="dot" style="background:${i.color}"></span>${esc(i.name)}
      <em>${(i.economic ?? 0).toFixed(2)} / ${(i.social ?? 0).toFixed(2)}</em></span>`).join('')}</div>` : ''}

      <h4>The five stocks</h4>
      ${STOCKS.map(stock).join('')}

      <h4>The eight map modes</h4>
      ${MODES.map(([name, text]) => `<div class="ob-ref">
        <div class="ob-rt">${esc(name)}</div><p>${esc(text)}</p></div>`).join('')}

      <h4>One action a turn</h4>
      <p class="ob-doc">Annex, unite, release, grant autonomy, change course, trade, recognise. Each
        has a cooldown and a price, and the price is shown before you commit &mdash; what the panel
        quotes is what the treasury pays. A refusal always says why.</p>`;
  }

  /* ---- the screen -------------------------------------------------- */

  function open(which) {
    // See screenBlocked() in js/shell.js: the crisis card outranks this one.
    if (typeof screenBlocked === 'function' && screenBlocked()) {
      return flash('Answer what the game is asking first.', 'warn');
    }
    // Did they ever open it, and which tab did they read? The M10 onboarding is
    // only worth what somebody actually looks at (M13.2).
    if (typeof Telemetry !== 'undefined') Telemetry.note('objectives', { d: which || tab });
    if (which) tab = which;
    const body = tab === 'win' ? winHtml() : refHtml();
    openModal(`
      <h3>Objectives</h3>
      <div class="ob-tabs">
        <button class="ob-tab${tab === 'win' ? ' active' : ''}" data-tab="win">How you win</button>
        <button class="ob-tab${tab === 'ref' ? ' active' : ''}" data-tab="ref">How to read this game</button>
      </div>
      <div class="ob-body">${body}</div>
      <div class="modal-btns"><button class="btn ghost" data-close>Close</button></div>`,
    { wide: true });
    document.querySelectorAll('.ob-tab').forEach((b) => {
      b.onclick = () => open(b.dataset.tab);
    });
  }

  /* ---- the same words, as tooltips (M10.3) -------------------------- */

  /** Two sentences on a map mode, by its `data-color` key. */
  function modeDoc(key) {
    const row = MODES.find((m) => m[2] === key);
    return row ? `${row[0]} — ${row[1]}` : '';
  }

  /** Two sentences on a stock, by the label the panel prints. */
  function stockDoc(label) {
    const row = STOCKS.find((r) => r[0].toLowerCase() === String(label).toLowerCase());
    if (!row) return '';
    const d = TuneMeta.describe(row[1]);
    return row[2] + (d ? `\n\n${d.doc}` : '');
  }

  /**
   * Hang the map-mode text on the header buttons, once, at boot.
   *
   * Written onto the DOM rather than into index.html for the reason the whole
   * reference tab is generated: two copies of an explanation is one explanation
   * and one lie waiting to happen, and the copy in the markup is the one nobody
   * updates.
   */
  function wireTooltips() {
    document.querySelectorAll('.color-toggle button[data-color]').forEach((b) => {
      const t = modeDoc(b.dataset.color);
      if (t) b.title = t;
    });
  }

  return { open, winHtml, refHtml, modeDoc, stockDoc, wireTooltips };
})();
