/*
 * The map, at every turn it has been.
 *
 * ONE BASELINE AND A LIST OF DELTAS. Ownership barely moves between two turns —
 * a handful of Areas out of 1,676 — so storing a full snapshot per turn is a
 * quarter of a megabyte of almost entirely repeated numbers, and storing what
 * CHANGED is a few dozen. Replaying forward from turn zero gives any turn, which
 * is the same trick the ledger uses to be a timeline rather than a log.
 *
 * WHY THE MAP AND NOT JUST THE TEXT. The ledger already says "the State of
 * Jefferson declared independence, taking 14 Areas", and that is a sentence
 * about a shape. A player who has spent an hour watching a border move should be
 * able to see it move again; it is also the only way to answer "when did that
 * happen" for anything the newspaper scrolled past.
 *
 * NATIONS ARE RECORDED WHEN THEY FIRST APPEAR, because half of them will not
 * exist by the end and a timeline that cannot name the country that used to be
 * there is a timeline of grey shapes. The name and colour are kept even after
 * `Game` has forgotten them, which is the whole point.
 */
const History = (function () {
  /** turn -> Int32Array of node -> owner index, only where it changed. */
  let frames = [];
  /** owner index -> { id, name, color, first } */
  let cast = {};
  /** The last owner vector recorded, for diffing. */
  let last = null;

  function reset() { frames = []; cast = {}; last = null; }

  /** Note a nation the first time it is seen, so the timeline can name it. */
  function record(nid, index, turn) {
    if (cast[index]) return;
    const n = Game.getNation(nid);
    if (!n) return;
    cast[index] = { id: nid, name: n.name, color: n.color, first: turn };
  }

  /**
   * Take this turn's frame. Idempotent per turn: called again for the same turn
   * it replaces rather than appends, so a caller that ticks twice does not
   * double the history.
   */
  function capture(turn) {
    const g = Game.graph();
    const state = Game.state();
    if (!g || !state) return null;
    const owners = state.owner;
    const t = turn == null ? World.getTurn() : turn;

    for (let i = 0; i < g.n; i++) {
      const oi = owners[i];
      if (oi >= 0 && !cast[oi]) record(Game.getOwner(g.idAt(i)), oi, t);
    }

    let frame;
    if (!last) {
      // The baseline: every node, once.
      frame = { turn: t, base: true, nodes: Array.from(owners) };
      last = Int16Array.from(owners);
    } else {
      const nodes = [];
      for (let i = 0; i < g.n; i++) {
        if (owners[i] !== last[i]) { nodes.push(i, owners[i]); last[i] = owners[i]; }
      }
      frame = { turn: t, base: false, nodes };
    }
    const at = frames.findIndex((f) => f.turn === t);
    if (at >= 0) frames[at] = frame; else frames.push(frame);
    return frame;
  }

  /**
   * Who owned what at the end of a given turn, as node index -> owner index.
   *
   * Replayed from the baseline. A turn before the first frame gives the
   * baseline; a turn after the last gives the last, which is what a scrubber
   * dragged past the end should show.
   */
  function ownersAt(turn) {
    if (!frames.length) return null;
    const out = Int16Array.from(frames[0].nodes);
    for (let k = 1; k < frames.length; k++) {
      if (frames[k].turn > turn) break;
      const nodes = frames[k].nodes;
      for (let i = 0; i < nodes.length; i += 2) out[nodes[i]] = nodes[i + 1];
    }
    return out;
  }

  /** The colour of an owner index, including nations that no longer exist. */
  const colorOf = (index) => (cast[index] ? cast[index].color : '#c9ced6');
  const nameOf = (index) => (cast[index] ? cast[index].name : null);
  const who = (index) => cast[index] || null;

  const turns = () => frames.map((f) => f.turn);
  const first = () => (frames.length ? frames[0].turn : 0);
  const lastTurn = () => (frames.length ? frames[frames.length - 1].turn : 0);
  const count = () => frames.length;

  /**
   * How many Areas each nation held at a turn — the timeline's leaderboard.
   */
  function standingsAt(turn) {
    const owners = ownersAt(turn);
    if (!owners) return [];
    const tally = new Map();
    for (let i = 0; i < owners.length; i++) {
      const o = owners[i];
      if (o < 0) continue;
      tally.set(o, (tally.get(o) || 0) + 1);
    }
    return [...tally.entries()]
      .map(([index, areas]) => ({ index, areas, ...(cast[index] || {}) }))
      .sort((a, b) => b.areas - a.areas);
  }

  /*
   * The frames are STATE. A timeline that only covers the turns since the last
   * reload is not a timeline, and the whole feature is about the game you have
   * been playing rather than the session you are in.
   */
  const serialize = () => ({ frames: frames.map((f) => ({ ...f, nodes: Array.from(f.nodes) })), cast });
  function loadState(snap) {
    if (!snap || !Array.isArray(snap.frames)) { reset(); return; }
    frames = snap.frames.map((f) => ({ ...f, nodes: Array.from(f.nodes || []) }));
    cast = snap.cast ? { ...snap.cast } : {};
    last = frames.length ? Int16Array.from(ownersAt(lastTurn())) : null;
  }

  return {
    reset, capture, ownersAt, standingsAt, colorOf, nameOf, who,
    turns, first, lastTurn, count, serialize, loadState,
  };
})();
