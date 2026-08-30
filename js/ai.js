/*
 * The other fifty seats.
 *
 * M6.2 builds the SEAM, not the opinion. This module owns three things — when a
 * non-player nation acts, that the sweep between two of the human's turns always
 * terminates, and that an AI turn is reproducible from the seed. What a nation
 * actually wants is policy, it lives in `chooseMove` alone, and M6.3 fills it
 * in. Everything else here is finished.
 *
 * Splitting it that way is not bookkeeping. The turn loop is the part that can
 * hang the page, silently skip a round's growth tick, or diverge between the
 * browser and the simulator; it deserves its own tests and its own commit, and
 * it should not be landing at the same time as a scoring function whose weights
 * are going to be argued with for the rest of M6.
 *
 * IT IS HEADLESS, like everything under js/ that is not app.js. No DOM, no
 * `store`, no module-level rng: `sweep(tune, rng)` takes both explicitly, so the
 * suite and the M5 simulator drive the identical loop the Pass button drives.
 * The only reason an AI turn differs from the human's is which function picked
 * the intent — both of them resolve it through `Moves.resolve`, which is the
 * whole point of M6.1.
 */
const AI = (function () {
  /**
   * What this nation wants to do this turn, as an intent, or null to pass.
   *
   * M6.2 passes. That is a real, playable state of the world and not a
   * placeholder crash: the world engine still runs every round — population,
   * economies, the power stocks, sentiment, secession — so nations still
   * fragment, movements still declare and the map still moves. What is missing
   * is deliberate action, which is exactly M6.3's subject.
   *
   * The candidate list is already here and already correct: `Moves.legal(nid)`
   * enumerates every move, `Moves.plan(intent)` prices each one purely, and the
   * pure evaluators in js/power.js score the result. M6.3 is a scoring function
   * over `plan()` output; it needs nothing from this file except this signature.
   *
   * @param {string} nid
   * @param {object} tune
   * @param {object} rng — for a policy that wants to break ties or bluff
   * @returns {object|null} an intent for Moves.resolve, or null to pass
   */
  // eslint-disable-next-line no-unused-vars
  function pass(nid, tune, rng) {
    return null;
  }

  /*
   * The policy is a FIELD, not a function body, and it is the only mutable thing
   * in this module. That is what lets the suite drive the real turn loop with a
   * deliberately bad policy — one that proposes moves the rules refuse — and
   * assert that the game passes rather than throws. Testing that by editing the
   * policy would test a different loop from the one that ships.
   */
  let policy = pass;

  /** Swap the policy in, returning the previous one so a caller can restore it. */
  function setPolicy(fn) {
    const prev = policy;
    policy = fn || pass;
    return prev;
  }

  const chooseMove = (nid, tune, rng) => policy(nid, tune, rng);

  /**
   * Take one nation's turn. Does NOT advance the turn order — the caller owns
   * the clock, because the round boundary has to be observed in one place.
   *
   * @returns {{nid, intent, result}} `intent` is null for a pass.
   */
  function takeTurn(nid, tune, rng) {
    if (!Game.getNation(nid)) return { nid, intent: null, result: null };
    const intent = chooseMove(nid, tune, rng);
    if (!intent) return { nid, intent: null, result: null };
    /*
     * A move the policy proposed but the rules refuse is a PASS, not an
     * exception. The AI is allowed to be wrong about what it can afford; it is
     * not allowed to stop the game. `plan` is pure, so this costs nothing but
     * the check, and it means a scoring bug in M6.3 shows up as a nation that
     * does nothing rather than as a broken turn loop.
     */
    const preview = Moves.plan(intent);
    if (!preview.ok) return { nid, intent: null, result: null, refused: preview.reason };
    return { nid, intent, result: Moves.resolve(intent, rng) };
  }

  /**
   * Play every non-player seat until it is the human's turn again.
   *
   * TERMINATION IS THE CONTRACT. Three ways this loop could run forever, all of
   * them guarded:
   *
   *   - nobody is playing (the simulator, most of the suite). Then there is no
   *     slot to stop at, so the sweep declines to start rather than consuming
   *     the world. Headless callers step `World.advanceTurn` themselves.
   *   - the player's nation has been destroyed. Its slot will never come up
   *     again. The sweep stops and says so; M6.4 turns that into a defeat
   *     screen, and until then it is a banner rather than a hung tab.
   *   - a bug in the turn order. `maxSteps` is a backstop that is not supposed
   *     to fire and warns loudly if it does, because a silently truncated sweep
   *     is a round the world half-played.
   *
   * The whole sweep runs inside one `Game.batch`, so fifty AI turns cost the
   * renderer one repaint rather than fifty. That is not an optimisation detail:
   * without it, every nation's action would re-render the panel of whatever the
   * human had selected, in a loop, before the human saw any of it.
   *
   * @returns {{turns, rounds, acted, playerGone, exhausted}}
   */
  function sweep(tune, rng, opts = {}) {
    const out = { turns: 0, rounds: 0, acted: [], playerGone: false, exhausted: false };
    const player = Game.getPlayer();
    if (player == null) return out;
    if (!Game.getNation(player)) { out.playerGone = true; return out; }

    const maxSteps = opts.maxSteps || Game.nations.size * 2 + 16;
    Game.batch(() => {
      while (TurnSystem.currentId() !== player) {
        if (out.turns >= maxSteps) { out.exhausted = true; break; }
        if (!Game.getNation(player)) { out.playerGone = true; break; }
        const nid = TurnSystem.currentId();
        const t = takeTurn(nid, tune, rng);
        if (t.intent) out.acted.push(t);
        out.turns++;
        const step = TurnSystem.advance(tune, rng);
        if (step.roundEnded) out.rounds++;
      }
    });
    if (out.exhausted) {
      console.warn(`AI.sweep: stopped after ${out.turns} turns without reaching the player's slot.`);
    }
    return out;
  }

  return { chooseMove, setPolicy, takeTurn, sweep };
})();
