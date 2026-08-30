/*
 * What a new country calls itself, and what it looks like.
 *
 * Two things, one concern: a nation that comes into being during play arrives
 * with no identity at all, and both halves of that were visible. A breakaway
 * around Riverside County was called "Riverside" — a place, not a country — and
 * every nation on the leaderboard was a coloured square.
 *
 * NAMES come from `content/names.json`, drawn against the founding ideology, so
 * a Distributist breakaway is a Compact and a Nationalist one is a Directorate.
 * The place is the largest Area of the founding ground with its "County" /
 * "Parish" / "Planning Region" suffix stripped, because the suffix is a fact
 * about American administrative geography and not part of a country's name.
 *
 * FLAGS are procedural and DERIVED FROM THE ID, not stored. A flag is a pure
 * function of who you are — layout, palette and charge all fall out of hashing
 * the nation id — so it survives a save without being in one, it is the same
 * flag in the panel and the leaderboard and the timeline, and there is no way
 * for a nation's flag to drift from the nation.
 *
 * They are drawn as inline SVG rather than as images because they are eight
 * shapes and a hash: an asset pipeline for something the CPU can produce in a
 * microsecond is a build step nobody needs.
 */
const Identity = (function () {
  let defs = null;

  function load(doc) {
    if (!doc || !doc.templates) return 0;
    defs = doc;
    return Object.keys(doc.templates).length;
  }
  const loaded = () => !!defs;

  /* ------------------------------------------------------------------ */
  /* names                                                              */
  /* ------------------------------------------------------------------ */

  /** "Riverside County" -> "Riverside". */
  function place(fips) {
    const c = Game.county[Game.areaIdOf(fips)];
    let name = (c && c.name) || 'the Territory';
    for (const suffix of (defs && defs.suffixes) || []) {
      if (name.endsWith(suffix)) { name = name.slice(0, -suffix.length); break; }
    }
    return name.trim();
  }

  /**
   * A name for a nation founded on this ground by this ideology.
   *
   * Falls back to the bare place name when there is no content loaded, which is
   * exactly what the game did before M7.7 — so the map editor and any page
   * without the file still produce something rather than nothing.
   */
  function name(areas, ideology, rng, taken) {
    const seat = Game.largestCounty(areas);
    const p = place(seat);
    if (!defs) return p;
    const pool = (defs.templates && defs.templates[ideology]) || defs.generic || ['{PLACE}'];
    const stream = rng ? rng.stream('names') : null;
    const used = taken || (() => false);
    const start = stream ? stream.int(pool.length) : 0;

    /*
     * TWO COUNTRIES MAY NOT SHARE A NAME.
     *
     * Fragments break off the same ground more than once in a long game, and
     * the first cut produced two separate nations both called the Fairfax
     * Federation — which is not a flavour problem, it is a leaderboard with two
     * identical rows and a newspaper that cannot say which one did the thing.
     *
     * Every template for the ideology is tried, then the generic ones, then the
     * place is qualified. A qualifier is a better answer than a number: "Upper
     * Fairfax Federation" reads as a country and "Fairfax Federation (2)" reads
     * as a bug.
     */
    const all = pool.concat(defs.generic || []);
    for (let i = 0; i < all.length; i++) {
      const candidate = all[(start + i) % all.length].replace(/\{PLACE\}/g, p);
      if (!used(candidate)) return candidate;
    }
    for (const q of ['Upper ', 'Lower ', 'Greater ', 'Inner ', 'Outer ', 'North ', 'South ']) {
      const candidate = all[start % all.length].replace(/\{PLACE\}/g, q + p);
      if (!used(candidate)) return candidate;
    }
    return all[start % all.length].replace(/\{PLACE\}/g, p);
  }

  /* ------------------------------------------------------------------ */
  /* flags                                                              */
  /* ------------------------------------------------------------------ */

  /* A tiny string hash, so a flag is a pure function of the id. */
  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  }

  const LAYOUTS = ['bands', 'pales', 'canton', 'bend', 'cross', 'saltire', 'pile', 'quarters'];
  const CHARGES = ['none', 'star', 'disc', 'ring', 'bar'];

  /** Shift a colour's lightness, working for both hex and hsl(). */
  function shade(color, delta) {
    if (typeof color !== 'string') return '#888888';
    if (color.startsWith('hsl')) {
      return color.replace(/(\d+(?:\.\d+)?)%\)$/, (m, l) => {
        const v = Math.max(6, Math.min(94, Number(l) + delta));
        return `${v}%)`;
      });
    }
    const n = parseInt(color.slice(1), 16);
    if (!Number.isFinite(n)) return color;
    const f = delta / 100 * 255;
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((v) => Math.max(0, Math.min(255, Math.round(v + f))));
    return `#${ch.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }

  /**
   * The design, as data. Separate from the drawing so a test can assert what a
   * flag IS without parsing SVG, and so a second renderer (a bigger one for an
   * end screen, say) cannot draw a different flag from the small one.
   */
  function design(nid) {
    const n = Game.getNation(nid);
    const h = hash(String(nid));
    const base = (n && n.color) || '#7a8090';
    const ideology = n && n.gov ? n.gov.rulingIdeology : null;
    const accent = ideology && typeof Ideology !== 'undefined'
      ? Ideology.colorAt(Ideology.index(ideology)) || shade(base, 26) : shade(base, 26);
    return {
      layout: LAYOUTS[h % LAYOUTS.length],
      charge: CHARGES[(h >>> 3) % CHARGES.length],
      field: base,
      accent,
      trim: shade(base, (h >>> 6) % 2 ? 30 : -30),
      flip: !!((h >>> 8) & 1),
    };
  }

  /**
   * The flag as an inline SVG string, `w` by `h`.
   *
   * `viewBox` is a fixed 60x40 whatever the requested size, so one set of
   * coordinates serves a 16px swatch and a 120px card.
   */
  function flag(nid, w, h) {
    const d = design(nid);
    const W = w || 24, H = h || 16;
    const parts = [`<rect width="60" height="40" fill="${d.field}"/>`];
    const A = d.accent, Tm = d.trim;
    switch (d.layout) {
      case 'bands':
        parts.push(`<rect y="13" width="60" height="14" fill="${A}"/>`,
          `<rect y="26" width="60" height="14" fill="${Tm}"/>`);
        break;
      case 'pales':
        parts.push(`<rect x="20" width="20" height="40" fill="${A}"/>`,
          `<rect x="40" width="20" height="40" fill="${Tm}"/>`);
        break;
      case 'canton':
        parts.push(`<rect width="26" height="18" fill="${A}"/>`);
        break;
      case 'bend':
        parts.push(d.flip ? `<polygon points="0,0 60,40 60,26 0,-14" fill="${A}"/>`
          : `<polygon points="0,40 60,0 60,14 0,54" fill="${A}"/>`);
        break;
      case 'cross':
        parts.push(`<rect y="15" width="60" height="10" fill="${A}"/>`,
          `<rect x="18" width="10" height="40" fill="${A}"/>`);
        break;
      case 'saltire':
        parts.push(`<polygon points="0,0 8,0 60,34 60,40 52,40 0,6" fill="${A}"/>`,
          `<polygon points="60,0 52,0 0,34 0,40 8,40 60,6" fill="${A}"/>`);
        break;
      case 'pile':
        parts.push(`<polygon points="0,0 0,40 30,20" fill="${A}"/>`);
        break;
      default:
        parts.push(`<rect width="30" height="20" fill="${A}"/>`,
          `<rect x="30" y="20" width="30" height="20" fill="${A}"/>`);
    }
    const cx = d.layout === 'canton' ? 13 : 30, cy = d.layout === 'canton' ? 9 : 20;
    switch (d.charge) {
      case 'star':
        parts.push(`<polygon fill="${Tm}" points="${star(cx, cy, 7, 3)}"/>`);
        break;
      case 'disc':
        parts.push(`<circle cx="${cx}" cy="${cy}" r="6.5" fill="${Tm}"/>`);
        break;
      case 'ring':
        parts.push(`<circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="${Tm}" stroke-width="3"/>`);
        break;
      case 'bar':
        parts.push(`<rect x="${cx - 10}" y="${cy - 2.5}" width="20" height="5" fill="${Tm}"/>`);
        break;
      default: break;
    }
    return `<svg class="flag" width="${W}" height="${H}" viewBox="0 0 60 40" `
      + `preserveAspectRatio="none" aria-hidden="true">${parts.join('')}`
      + `<rect width="60" height="40" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/></svg>`;
  }

  /** Five-pointed star as a points list. */
  function star(cx, cy, outer, inner) {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? inner : outer;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(' ');
  }

  return { load, loaded, name, place, design, flag, LAYOUTS, CHARGES };
})();
