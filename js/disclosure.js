/*
 * PROGRESSIVE DISCLOSURE ON THE PANEL (M10.2).
 *
 * The audit: "the nation panel is a sixteen-block information wall — every
 * block individually excellent, collectively unreadable to a newcomer, with no
 * progressive disclosure and no 'what changed'." Both halves of that are true
 * and neither is a reason to show less: the Why rows under each stock are the
 * best thing in this game. They are just not what somebody meets it with.
 *
 * SO THIS HIDES NOTHING, IT FOLDS. Every block keeps its headline — label,
 * value, and the one-line summary the model already writes — and the rows that
 * justify the number go behind a click. A new player sees six lines and ten
 * titles; a player who wants to know why Authority fell clicks Authority and
 * gets exactly what they got before.
 *
 * A DOM TRANSFORM, NOT SIXTEEN EDITS. It runs over the rendered panel rather
 * than inside each `render*` function, and that is deliberate: the alternative
 * is teaching sixteen functions the same lesson and teaching the seventeenth
 * one the day somebody adds it. The structure it relies on is the one every
 * block already shares — `.stat > .label, .value, [.auth-bar], [.auth-summary],
 * .geo-row*` — and a block that does not have it simply is not folded, which is
 * the right failure.
 *
 * WHAT CHANGED THIS TURN is a text comparison, and that is not a shortcut. The
 * values are already rendered to whole percents and rounded magnitudes, so a
 * changed string IS a change the player could see; comparing the underlying
 * floats would light up every block every turn with movement too small to have
 * been rendered.
 */
const Disclosure = (function () {
  const KEY = 'ns_panel_open';

  /*
   * OPEN BY DEFAULT: what a nation IS. Closed by default: why it is that way.
   * Population and GDP have no detail at all and so are never folded, which is
   * why they are not in this list — it names the blocks that have rows and open
   * anyway.
   */
  const DEFAULT_OPEN = new Set(['authority', 'treasury']);

  let open = null;              // Set of slugs the player has left open
  let baseline = new Map();     // block value as of the previous turn
  let current = new Map();      // ...and as of this one
  let forTurn = -1;

  /*
   * THE ID IS THE STABLE HALF OF THE LABEL.
   *
   * Panel labels carry live detail after a middle dot: "Election · in 2 turns",
   * "Armed forces · 46k", "Treasury · Republic", "Path to victory · Ideological
   * Dominance". Slugging the whole thing gives an id that changes every turn,
   * so the block the player left open closes itself the moment the number in
   * its own title moves — which is exactly when they were reading it.
   */
  const slug = (s) => String(s).split('\u00b7')[0]
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  function load() {
    if (open) return open;
    open = new Set(DEFAULT_OPEN);
    /*
     * localStorage can throw outright (a private window, site data blocked),
     * not merely come back empty, so the read is wrapped rather than defaulted.
     */
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) open = new Set(JSON.parse(raw));
    } catch (e) { /* the defaults are a fine answer */ }
    return open;
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify([...load()])); } catch (e) { /* ignore */ }
  }

  /**
   * Fold the blocks of a freshly rendered panel.
   *
   * @param panel the container that was just written
   * @param key   whose panel it is — the change marker is per subject, because
   *              "Authority changed" about a nation you clicked into for the
   *              first time is not news, it is a different nation.
   */
  function apply(panel, key) {
    if (!panel) return;
    const opened = load();
    const turn = typeof World !== 'undefined' ? World.getTurn() : 0;
    if (turn !== forTurn) { baseline = current; current = new Map(); forTurn = turn; }

    panel.querySelectorAll('.stat').forEach((el) => {
      if (el.classList.contains('folded')) return;      // already done
      const kids = [...el.children];
      const label = kids.find((k) => k.classList.contains('label'));
      if (!label) return;

      /*
       * The headline runs to the end of the summary: label, value, the bar that
       * draws the value, and the sentence the model wrote about it. Everything
       * after that is the working.
       */
      let headEnd = kids.indexOf(label);
      for (let i = headEnd + 1; i < kids.length; i++) {
        const c = kids[i].classList;
        if (c.contains('value') || c.contains('auth-bar') || c.contains('auth-summary')
            || c.contains('vote-bar') || c.contains('margin-line')) headEnd = i;
        else break;
      }
      const detail = kids.slice(headEnd + 1);
      if (!detail.length) return;                        // nothing to fold

      /*
       * NEVER FOLD A CONTROL.
       *
       * A block that carries a button is not an explanation, it is an offer —
       * Recognise, sign a pact, send aid, the military sliders — and a control
       * the player cannot see is a control that does not exist. Found by adding
       * the M11.2 diplomacy block and watching both of its buttons vanish
       * behind a fold they had no reason to be behind; the recognition button
       * had quietly been in the same position since M10.2 shipped.
       *
       * The rule is the block's own content rather than a list of block names,
       * so the next one to grow a button is covered without anybody
       * remembering to add it.
       */
      if (detail.some((d) => d.matches('button, input, select, textarea')
          || d.querySelector('button, input, select, textarea'))) return;

      const id = slug(label.textContent);
      const isOpen = opened.has(id);

      // "Changed this turn", per subject and per block.
      const vEl = kids.find((k) => k.classList.contains('value'));
      const text = vEl ? vEl.textContent.trim() : '';
      const mapKey = `${key || ''}:${id}`;
      const was = baseline.get(mapKey);
      if (text) current.set(mapKey, text);
      const changed = was != null && text && was !== text;

      el.classList.add('folded');
      el.classList.toggle('is-open', isOpen);
      if (changed) el.classList.add('changed');

      const body = document.createElement('div');
      body.className = 'stat-detail';
      detail.forEach((d) => body.appendChild(d));
      el.appendChild(body);

      /*
       * The whole headline is the control, not a separate caret: a click target
       * the size of a caret is a click target nobody finds, and there is nothing
       * else in a headline to click.
       */
      const toggle = document.createElement('button');
      toggle.className = 'stat-toggle';
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.title = isOpen ? 'Hide the working' : 'Why?';
      toggle.innerHTML = `<span class="st-caret">${isOpen ? '−' : '+'}</span>`
        + `<span class="st-count">${detail.filter((d) => d.classList.contains('geo-row')).length || ''}</span>`;
      toggle.onclick = (e) => {
        e.stopPropagation();
        const now = !el.classList.contains('is-open');
        el.classList.toggle('is-open', now);
        toggle.setAttribute('aria-expanded', String(now));
        toggle.title = now ? 'Hide the working' : 'Why?';
        toggle.querySelector('.st-caret').textContent = now ? '−' : '+';
        if (now) opened.add(id); else opened.delete(id);
        // Which Why rows a player opens is the clearest signal there is about
        // which explanations they actually wanted (M13.2).
        if (typeof Telemetry !== 'undefined') {
          Telemetry.note('why', { d: id, open: now });
        }
        persist();
      };
      el.appendChild(toggle);
    });
  }

  /** Open everything, once — for a player who wants the old wall back. */
  function expandAll(panel) {
    const opened = load();
    panel.querySelectorAll('.stat.folded').forEach((el) => {
      el.classList.add('is-open');
      const t = el.querySelector('.stat-toggle');
      if (t) { t.setAttribute('aria-expanded', 'true'); t.querySelector('.st-caret').textContent = '−'; }
      const lab = el.querySelector('.label');
      if (lab) opened.add(slug(lab.textContent));
    });
    persist();
  }

  function collapseAll(panel) {
    const opened = load();
    panel.querySelectorAll('.stat.folded').forEach((el) => {
      el.classList.remove('is-open');
      const t = el.querySelector('.stat-toggle');
      if (t) { t.setAttribute('aria-expanded', 'false'); t.querySelector('.st-caret').textContent = '+'; }
      const lab = el.querySelector('.label');
      if (lab) opened.delete(slug(lab.textContent));
    });
    persist();
  }

  /** A new world: forget what was open and what had changed. */
  function reset() {
    open = null;
    baseline = new Map();
    current = new Map();
    forTurn = -1;
  }

  return { apply, expandAll, collapseAll, reset };
})();
