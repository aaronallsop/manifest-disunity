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

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function begin(ids) {
    order = shuffle([...ids]);
    ptr = 0;
    round = 1;
    currentRemoved = false;
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
      if (ptr >= order.length) { ptr = 0; round++; }
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
    if (currentRemoved) currentRemoved = false; // ptr already sits on the successor
    else ptr++;
    if (ptr >= order.length) { ptr = 0; round++; }
    return currentId();
  }

  const progress = () => ({ index: ptr + 1, total: order.length, round });
  const snapshot = () => ({ order: [...order], ptr });

  const serialize = () => ({ order: [...order], ptr, round });
  function loadState(snap) {
    order = snap.order.slice();
    ptr = snap.ptr;
    round = snap.round;
    currentRemoved = false;
  }

  return { begin, currentId, sync, insertAfter, endTurn, progress, snapshot, serialize, loadState };
})();
