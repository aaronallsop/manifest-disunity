/*
 * THE TRADE NETWORK MAP (A3) — where your goods actually go.
 *
 * Everything the last three stages built is invisible. A deal says it pays less
 * than it should and the panel says "through Nevada"; a corridor closes and a
 * line of text says which country stopped you. That is enough to be told, and
 * not enough to UNDERSTAND — because the thing a player needs to see is not one
 * deal, it is the shape of the whole arrangement: who they depend on, who
 * depends on them, and which single neighbour could cut half of it.
 *
 * WHAT IT DRAWS, in one sentence each:
 *
 *   YOUR NETWORK. Every deal you hold, drawn along the ground it actually
 *   crosses. A direct deal is one line to your neighbour. A routed one is a line
 *   per crossing, so the two countries standing between you and your partner are
 *   on the screen rather than in a tooltip.
 *
 *   BY WHAT. Road, rail and water are three colours, and each can be switched
 *   off, because "show me only the railways" is how a player finds out that
 *   their whole economy runs through one line.
 *
 *   WHAT IS BROKEN, AND WHO BROKE IT. A stalled route is drawn in red to the
 *   country that stopped it, labelled with the reason. Clicking it opens the
 *   table with that country, because the point of knowing is being able to act.
 *
 * WHY LINES BETWEEN CENTRES AND NOT ROUTES ALONG ROADS. The game has county
 * geometry and no road geometry — the transport data says which counties carry
 * rail and interstate, never where the rails and roads run. Drawing a plausible
 * line along ground nobody surveyed would be an invention dressed as data, and
 * this project has a rule about that. A straight line between two capitals is
 * obviously a diagram, which is what it is.
 */
const TradeMap = (function () {
  /* Which kinds of link are shown. All on; the point is being able to turn one
     off and see what is left. */
  let shown = { 1: true, 2: true, 4: true, 8: true };
  let layer = null;

  const T = () => window.TUNE;
  const MODE_COLOR = { 1: '#c98a3a', 2: '#7ea1ff', 4: '#4fc4d6', 8: '#4fc4d6' };
  const MODE_TEXT = { 1: 'road', 2: 'rail', 4: 'water', 8: 'river' };

  const isOut = (id) => typeof Transit !== 'undefined' && Transit.isOutside(id);
  const label = (id) => {
    if (typeof Transit === 'undefined') return id;
    if (id === Transit.CANADA) return 'Canada';
    if (id === Transit.MEXICO) return 'Mexico';
    if (id === Transit.WORLD) return 'World market';
    const n = Game.getNation(id);
    return n ? n.name : id;
  };

  /*
   * WHERE TO PUT A COUNTRY ON THE SCREEN. A nation goes at the centre of its own
   * shape; the three places that are not nations go off the edges, where they
   * belong — Canada above, Mexico below, and the world market out to sea.
   */
  function anchor(id) {
    const box = store.svg ? store.svg.node().viewBox.baseVal : null;
    const W = box ? box.width : 960, H = box ? box.height : 600;
    if (typeof Transit !== 'undefined') {
      if (id === Transit.CANADA) return [W * 0.5, H * 0.045];
      if (id === Transit.MEXICO) return [W * 0.42, H * 0.965];
      if (id === Transit.WORLD) return [W * 0.965, H * 0.5];
    }
    const feat = typeof nationOutline === 'function' ? nationOutline(id) : null;
    if (!feat || !store.path) return null;
    const c = store.path.centroid(feat);
    return (isFinite(c[0]) && isFinite(c[1])) ? c : null;
  }

  /* ---- what there is to draw ---------------------------------------- */

  /**
   * Every link in one nation's arrangements: the deals, the corridors it holds
   * or rents, and the ways out it can actually use.
   *
   * A link is deduplicated on (from, to, mode) and keeps the WORST state it was
   * seen in — a corridor carrying two deals, one of them stalled, is drawn
   * broken, because that is the fact a player needs.
   */
  function links(me) {
    const out = new Map();
    const rank = { held: 0, rented: 1, broken: 2 };
    const put = (from, to, mode, kind, note) => {
      if (!from || !to || from === to) return;
      const k = `${from}>${to}:${mode}`;
      const prev = out.get(k);
      if (prev && rank[prev.kind] >= rank[kind]) return;
      out.set(k, { from, to, mode, kind, note });
    };

    if (typeof Deals !== 'undefined') {
      for (const d of Deals.forNation(me)) {
        const them = Deals.other(d, me);
        const hops = d.route && d.route.hops ? d.route.hops : [];
        const stalled = d.route && d.route.stalled;
        if (!hops.length) {
          const bits = typeof Transit === 'undefined' ? 0 : Transit.modesBetween(me, them);
          const m = [8, 4, 2, 1].find((x) => bits & x) || 1;
          put(me, them, m, 'held', `deal with ${label(them)}`);
          continue;
        }
        // A routed deal is drawn along its actual chain: you, each country in
        // between, then your partner.
        let prev = me;
        for (const h of hops) {
          const broken = stalled && stalled.at === h.node;
          put(prev, h.node, h.mode, broken ? 'broken' : 'held',
            broken ? whyText(stalled.why) : `carries your deal with ${label(them)}`);
          prev = h.node;
        }
        const lastBits = typeof Transit === 'undefined' ? 0 : Transit.modesBetween(prev, them);
        const lm = [8, 4, 2, 1].find((x) => lastBits & x) || hops[hops.length - 1].mode;
        put(prev, them, lm, stalled ? 'broken' : 'held', `deal with ${label(them)}`);
      }
    }

    if (typeof Transit !== 'undefined') {
      // Corridors: ones you rent, and ones you grant. Both are your network.
      for (const g of Transit.forNation(me)) {
        // Drawn in the direction the GOODS move, which is the direction the
        // money comes back along: from whoever is crossing to whoever is
        // charging. Both halves are your network — one is what you depend on,
        // the other is what depends on you.
        const rented = g.grantee === me;
        if (rented) {
          put(g.grantor, me, g.mode, 'rented',
            `you pay ${Math.round(g.rate * 100)}% to cross ${label(g.grantor)}`);
        } else {
          put(me, g.grantee, g.mode, 'held',
            `${label(g.grantee)} pays you ${Math.round(g.rate * 100)}% to cross your ground`);
        }
      }
      // ...and the ways out that actually work today.
      for (const dest of [Transit.WORLD, Transit.CANADA, Transit.MEXICO]) {
        const direct = Transit.modesBetween(me, dest);
        if (direct) {
          const m = [4, 8, 2, 1].find((x) => direct & x);
          put(me, dest, m, 'held', `you reach ${label(dest)} from your own ground`);
          continue;
        }
        const r = Transit.find(me, dest, { permit: Transit.permitFor(me) });
        if (!r) continue;
        let prev = me;
        for (const h of r.hops) {
          put(prev, h.node, h.mode, 'rented', `on the way to ${label(dest)}`);
          prev = h.node;
        }
        const bits = Transit.modesBetween(prev, dest);
        put(prev, dest, [4, 8, 2, 1].find((x) => bits & x) || 4, 'rented',
          `${label(prev)} is your way to ${label(dest)}`);
      }
    }
    return [...out.values()];
  }

  const whyText = (why) => ({
    revoked: 'they closed the border',
    lost: 'that country is gone',
    capped: 'the corridor is full',
    expired: 'the agreement ran out',
  }[why] || 'no way through');

  /* ---- drawing ------------------------------------------------------- */

  function ensureLayer() {
    if (layer) return layer;
    if (!store.svg) return null;
    // Above the map, below the action layer, so a route never sits on top of a
    // question the player is being asked.
    const parent = store.actionLayer && store.actionLayer.node()
      ? d3.select(store.actionLayer.node().parentNode) : store.svg;
    layer = parent.insert('g', '.action-layer').attr('class', 'trade-layer');
    return layer;
  }

  function clear() {
    if (layer) layer.selectAll('*').remove();
  }

  function render() {
    const g = ensureLayer();
    if (!g) return;
    g.selectAll('*').remove();
    if (store.colorMode !== 'trade') return;
    const me = (store.selected && store.selected.level === 'nation' && store.selected.id)
      || Game.getPlayer();
    if (!me || !Game.getNation(me)) return;

    const rows = links(me).filter((l) => shown[l.mode]);
    const seen = new Set();
    for (const l of rows) {
      const a = anchor(l.from), b = anchor(l.to);
      if (!a || !b) continue;
      const cls = `tl-link tl-${l.kind}`;
      g.append('line')
        .attr('class', cls)
        .attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1])
        .attr('stroke', l.kind === 'broken' ? '#e0483b' : MODE_COLOR[l.mode])
        .attr('stroke-width', l.kind === 'broken' ? 3.2 : 2.2)
        .attr('stroke-dasharray', l.kind === 'rented' ? '6 4' : null)
        .attr('opacity', l.kind === 'broken' ? 1 : 0.85)
        .append('title')
        .text(`${label(l.from)} → ${label(l.to)} by ${MODE_TEXT[l.mode]}\n${l.note}`);
      /*
       * A BROKEN LINK IS A THING TO ACT ON, not a thing to look at. Clicking it
       * opens the table with whoever stopped you, which is the shortest path
       * from "my income fell" to "here is what I can do about it".
       */
      if (l.kind === 'broken' && !isOut(l.to)) {
        g.append('line')
          .attr('class', 'tl-hit')
          .attr('x1', a[0]).attr('y1', a[1]).attr('x2', b[0]).attr('y2', b[1])
          .attr('stroke', 'transparent').attr('stroke-width', 14)
          .style('cursor', 'pointer')
          .on('click', () => { setMode('nations'); select('nation', l.to); })
          .append('title').text(`${label(l.to)} — ${l.note}. Click to open their card.`);
      }
      for (const id of [l.from, l.to]) {
        if (seen.has(id)) continue;
        seen.add(id);
        const p = anchor(id);
        if (!p) continue;
        const n = Game.getNation(id);
        g.append('circle')
          .attr('class', 'tl-node').attr('cx', p[0]).attr('cy', p[1])
          .attr('r', id === me ? 6 : 4)
          .attr('fill', n ? n.color : '#9aa0a6')
          .attr('stroke', id === me ? '#fff' : 'rgba(0,0,0,.45)')
          .attr('stroke-width', id === me ? 2 : 1)
          .append('title').text(label(id));
        if (isOut(id)) {
          g.append('text').attr('class', 'tl-label')
            .attr('x', p[0]).attr('y', p[1] - 9).attr('text-anchor', 'middle')
            .text(label(id));
        }
      }
    }
  }

  /* ---- the legend, which is also the controls ------------------------ */

  function legendHtml(me) {
    const who = me && Game.getNation(me) ? Game.getNation(me).name : null;
    const chip = (bit, text) => `<button class="tl-chip${shown[bit] ? ' on' : ''}" data-tl="${bit}">
      <i style="background:${MODE_COLOR[bit]}"></i>${text}</button>`;
    return `<div class="tl-legend">
      <div class="tl-who">${who ? `${escapeHtml(who)}’s network` : 'Select a nation'}</div>
      <div class="tl-chips">${chip(1, 'Road')}${chip(2, 'Rail')}${chip(4, 'Water')}</div>
      <div class="tl-key">
        <span><i class="tl-solid"></i>yours</span>
        <span><i class="tl-dash"></i>somebody else’s ground</span>
        <span><i class="tl-red"></i>blocked — click it</span>
      </div>
    </div>`;
  }

  /** Wire the mode chips after the legend has been written into the page. */
  function bind() {
    document.querySelectorAll('.tl-chip').forEach((b) => {
      b.onclick = () => {
        const bit = Number(b.dataset.tl);
        shown[bit] = !shown[bit];
        // Water covers both the sea and the rivers: to a player they are the
        // same decision, and splitting them would be a distinction without one.
        if (bit === 4) shown[8] = shown[4];
        b.classList.toggle('on', shown[bit]);
        render();
      };
    });
  }

  return {
    render, clear, legendHtml, bind, links, anchor,
    shown: () => ({ ...shown }),
    reset: () => { shown = { 1: true, 2: true, 4: true, 8: true }; clear(); },
  };
})();
