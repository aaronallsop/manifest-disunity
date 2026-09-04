/*
 * Turn system.
 *
 * At game start the nations are shuffled into a hidden 1..N order; play proceeds
 * through that order, one action (or pass) per nation. When an action splinters a
 * nation into new ones, the newborns are slotted into the order right after their
 * parent (in random relative order) and everyone after shifts down. Dissolved
 * nations drop out.
 *
 *   order : nation ids in turn sequence
 *   ptr   : index of the nation whose turn it is
 */
const TurnSystem = (function () {
  let order = [];
  let ptr = 0;
  let round = 1;
  let currentRemoved = false;
  let wrapped = false; // set by drop() when removing the current actor wrapped the order

  // The turn-order rng is handed in at begin() and kept so that insertAfter can
  // draw from the same 'turnorder' stream mid-game. It is the ONLY module-level
  // rng reference in the codebase and it exists because TurnSystem's own API is
  // called from event handlers that have no state argument to thread one through.
  let rng = null;
  const orderStream = () => rng.stream('turnorder');

  const shuffle = (a) => orderStream().shuffle(a);

  function begin(ids, r) {
    rng = r;
    order = shuffle([...ids]);
    ptr = 0;
    /*
     * THE TURN ORDER FOLLOWS THE ROSTER, and it hears about it itself.
     *
     * This sync used to live in app.js's change handler — which meant it ran in
     * the live page and nowhere else, so anything headless drifted: a nation
     * pruned by a defection or a civil war kept its slot and would be handed
     * turns after it had ceased to exist. The M5 simulator runs headless by
     * definition, so the renderer is exactly the wrong owner for a model
     * invariant. Game.reset() clears its listeners, so this registers once per
     * world.
     */
    Game.onChange((reason) => { if (reason.roster) sync(); });
    round = 1;
    currentRemoved = false;
    wrapped = false;
  }

  const currentId = () => order[ptr];

  // Remove a dissolved nation, keeping ptr pointed at the same live nation.
  function drop(id) {
    const i = order.indexOf(id);
    if (i < 0) return;
    order.splice(i, 1);
    if (i < ptr) ptr--;
    else if (i === ptr) {
      currentRemoved = true;
      // Wrapping here must NOT bump `round`: completeTurn samples the round
      // counter after every mutation has run, so a bump inside drop() is
      // invisible to it and the round's growth tick is silently skipped
      // (finding 49). endTurn() is the single owner of `round`; it consumes
      // this flag.
      if (ptr >= order.length) { ptr = 0; wrapped = true; }
    }
  }

  // Reconcile with the model: drop any nations that no longer exist.
  function sync() {
    for (const id of [...order]) if (!Game.nations.has(id)) drop(id);
    // safety net: any live nation not yet placed goes to the end
    for (const id of Game.nations.keys()) if (!order.includes(id)) order.push(id);
  }

  // Insert new nations right after their parent's slot (random relative order).
  function insertAfter(parentId, newIds) {
    if (!newIds || !newIds.length) return;
    for (const id of newIds) {
      const k = order.indexOf(id);
      if (k >= 0) { order.splice(k, 1); if (k < ptr) ptr--; }
    }
    const batch = shuffle([...newIds]);
    let j = order.indexOf(parentId);
    if (j < 0) j = ptr; // parent gone -> fall in right after the current actor
    const pos = j + 1;
    order.splice(pos, 0, ...batch);
    if (pos <= ptr) ptr += batch.length;
  }

  // Advance to the next nation's turn.
  function endTurn() {
    if (currentRemoved) {
      currentRemoved = false; // ptr already sits on the successor
      if (wrapped) { wrapped = false; round++; }
    } else {
      ptr++;
    }
    if (ptr >= order.length) { ptr = 0; round++; }
    return currentId();
  }

  /*
   * End the current nation's turn and, if that completed a round, ADVANCE THE
   * WORLD.
   *
   * This used to live in `completeTurn()` in app.js, which meant the one clock
   * in the game was owned by the renderer: the world advanced when a human
   * clicked, and any headless caller stepping the turn order got the nations
   * moving through a world that never changed. It is the same mistake as the
   * turn-order sync that used to live in app.js's change handler, and M6.2 is
   * where it starts to bite, because from here on most turns are not taken by a
   * human at all.
   *
   * app.js keeps what is genuinely UI — the banner, the newspaper, the autosave
   * — and reads `roundEnded` to know when to draw it.
   */
  function advance(tune, rng) {
    const before = round;
    const next = endTurn();
    const roundEnded = round > before;
    if (roundEnded) World.advanceTurn(tune, rng); // emits once, from its own batch
    return { next, roundEnded, round };
  }

  /**
   * Put the pointer on a nation's slot without anybody playing.
   *
   * For the START of a game only. `?play=<nation>` can name a seat anywhere in
   * the shuffled order, and sweeping the AI to reach it means the world takes a
   * full round before the human has looked at the map once — with the M6.3
   * policy live that opened one game with eleven nations already absorbed. The
   * order is a sequence, not a queue of debts: nobody is owed the turn they
   * would have had in a game that had not started yet.
   */
  function seat(id) {
    const i = order.indexOf(id);
    if (i < 0) return false;
    ptr = i;
    return true;
  }

  const progress = () => ({ index: ptr + 1, total: order.length, round });
  /** Where a given nation sits in the order, or -1. */
  const indexOf = (id) => order.indexOf(id);
  const snapshot = () => ({ order: [...order], ptr });

  const serialize = () => ({ order: [...order], ptr, round });
  function loadState(snap) {
    order = snap.order.slice();
    ptr = snap.ptr;
    round = snap.round;
    currentRemoved = false;
    wrapped = false;
  }

  return { begin, currentId, sync, insertAfter, endTurn, advance, seat, progress, indexOf, snapshot, serialize, loadState, setRng: (r) => { rng = r; } };
})();
