/*
 * The other fifty seats.
 *
 * M6.2 built the SEAM — when a non-player nation acts, that the sweep between
 * two of the human's turns always terminates, and that an AI turn is
 * reproducible from the seed. M6.3 fills in the OPINION, and it fits in one
 * function because of how M6.1 left the rules:
 *
 *   Moves.legal(nid)     every move this nation could make, unscored
 *   Moves.plan(intent)   what each one would do, purely, no dice
 *   score(preview)       what this nation thinks of that
 *
 * THE AI HAS NO SECOND MODEL OF THE WORLD. It scores exactly the object the
 * player's panel renders, so a move that looks good to it looks good for reasons
 * the player can read on their own screen — and neither side can be right about
 * an action while the other is wrong, because there is only one answer.
 *
 * The score is a WHY RECORD, in the shape js/power.js and js/sentiment.js
 * already produce, because "why did Texas attack me" is a question the game has
 * to be able to answer and the ledger already knows how to read that shape.
 *
 * IT IS HEADLESS, like everything under js/ that is not app.js. No DOM, no
 * `store`, no module-level rng: `sweep(tune, rng)` takes both explicitly, so the
 * suite and the M5 simulator drive the identical loop the Pass button drives.
 * The only reason an AI turn differs from the human's is which function picked
 * the intent — both of them resolve it through `Moves.resolve`, which is the
 * whole point of M6.1.
 */
const AI = (function () {
  const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));
  const signed = (x) => (Number.isFinite(x) ? (x < -1 ? -1 : x > 1 ? 1 : x) : 0);

  /* ------------------------------------------------------------------ */
  /* posture                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * STRAIN: how close this nation is to losing an Area to secession, 0..1.
   *
   * The one number that decides posture, and it is the same number the pressure
   * map paints — the peak movement share across the nation's own ground, read
   * against the secession threshold. Peak and not mean, because a nation does
   * not lose its average Area; it loses the worst one, and a single Area at 95%
   * of the line is a crisis that an average would report as calm.
   */
  function strain(nid, tune) {
    const n = Game.getNation(nid);
    if (!n) return 0;
    const line = tune.get('secession.countyThreshold');
    let worst = 0;
    for (const f of n.counties) {
      const p = Sentiment.pressure(f);
      if (p > worst) worst = p;
    }
    return line > 0 ? clamp01(worst / line) : 0;
  }

  /* ------------------------------------------------------------------ */
  /* scoring                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * One weighted term.
   *
   * `norm` is signed and clamped to [-1, 1]; the sign lives in the term, not in
   * the weight, so a slider set to zero always means "this nation does not care"
   * and never "this nation wants the opposite".
   *
   * `stance` is 'expand' or 'hold', and it is NOT the same thing as the sign.
   * Shedding a seditious Area is a positive term that a fraying nation should
   * want MORE of, not less — reading posture off the sign gets the release valve
   * exactly backwards, which is a mistake worth naming because it is invisible
   * until you watch a nation under pressure decide to invade someone.
   */
  const term = (label, key, raw, norm, stance, note) =>
    ({ label, key, raw, norm: signed(norm), stance: stance || 'hold', note });

  /**
   * Score a preview.
   *
   * WHY THIS IS A WHY RECORD. It comes back in the same shape `js/power.js` and
   * `js/sentiment.js` produce — `{value, inputs:[{label, raw, norm, weight,
   * contribution, key}], summary}` — because the reason a nation attacked you is
   * a thing the game has to be able to say, and the ledger's `termsOf` already
   * knows how to read that shape. The explanation is a by-product of the
   * calculation rather than a second account of it, which is the whole
   * convention: by the time something is worth logging, its reason exists.
   *
   * It does NOT go through `Power.build`, which clamps its result to [0, 1]
   * because a stock cannot be negative. A score has to be able to be, or the
   * difference between a bad move and a catastrophic one disappears exactly
   * where it matters.
   *
   * EVERY TERM IS A SHARE OF THE ACTING NATION. That is what lets one set of
   * weights serve a two-Area rump and a sixty-Area giant without a size table:
   * "a fifth more people" means the same thing to both.
   */
  function score(intent, preview, tune, ctx) {
    if (!preview || !preview.ok) return null;
    const n = Game.getNation(intent.nid);
    if (!n) return null;
    const d = ctx && ctx.demo ? ctx.demo : Game.nationDemographics(intent.nid);
    const st = ctx && ctx.strain != null ? ctx.strain : strain(intent.nid, tune);

    const eff = {};
    for (const e of preview.effects || []) eff[e.label] = e.value;
    const dPop = eff.Population || 0;
    const dGdp = eff.GDP || 0;
    const terms = [];

    /* ---- what every move has in common ---- */

    // Growth as a share of the RESULTING nation, not of the current one: a
    // three-Area rump doubling itself scores 0.5, not 1.0, and the term stays
    // bounded when a small nation eyes an enormous neighbour.
    const endPop = Math.max(1, d.pop + dPop);
    const endGdp = Math.max(1, d.gdp + dGdp);
    /*
     * A PRIZE IS WORTH ITS ODDS. A union hands over a whole nation, but only
     * `chance` of the time; discounting the gain by the preview's own
     * probability is what stops a 6%-likely union with California looking better
     * than a certain annexation of three Areas. A move with no `chance` is
     * certain in what it gains — an annexation's uncertainty is a civil war, and
     * that has a term of its own.
     */
    const odds = preview.chance == null ? 1 : preview.chance;
    terms.push(term('People', 'ai.wGrowth', dPop, (dPop / endPop) * odds, 'expand'));
    terms.push(term('Wealth', 'ai.wWealth', dGdp, (dGdp / endGdp) * odds, 'expand'));

    const cost = preview.cost || 0;
    if (cost > 0) {
      const purse = Math.max(1, n.treasury);
      terms.push(term('Price', 'ai.wPrice', cost, -cost / purse, 'hold'));
      /*
       * SOLVENCY is a separate term from price and not a steeper version of it,
       * because they answer different questions: price is reluctance to spend,
       * solvency is refusal to go broke. A nation that ends a move unable to pay
       * its upkeep has no way back in this game — nothing restores a treasury
       * that cannot fund the actions that would grow it.
       */
      const flow = Game.treasuryFlow(intent.nid);
      const upkeep = flow ? Math.max(1, flow.maintenance) : 1;
      const runway = (n.treasury - cost) / upkeep;
      const want = tune.get('ai.runwayTurns');
      if (want > 0 && runway < want) {
        terms.push(term('Solvency', 'ai.wSolvency', runway, -(want - runway) / want, 'hold',
          `${Math.max(0, Math.round(runway))} turns of upkeep left`));
      }
    }

    /* ---- what is particular to each move ---- */

    if (intent.type === 'annex') {
      const w = preview.war;
      if (w && w.triggered) {
        // Graded by how far the annexation moves the nation politically. A flip
        // between neighbouring ideologies is a smaller shock than one across the
        // board, and `shift` is the number that says so — the boolean could not.
        const sev = 0.5 + 0.5 * clamp01(w.shift / Ideology.maxDistance());
        terms.push(term('Civil war', 'ai.wWar', w.shift, -sev, 'hold', w.reasons.join(', ')));
      }
      const added = Game.demographics(intent.areas || preview.targets || []);
      // Signed on purpose: taking a hostile population is a COST, not merely a
      // smaller benefit, and the two are different decisions when the ground is
      // otherwise attractive.
      const fit = Ideology.mixAffinity(d.mix, added.mix);
      terms.push(term('Political fit', 'ai.wFit', fit, 2 * fit - 1, 'hold'));

      let foreign = 0;
      for (const f of (preview.targets || [])) {
        const c = Game.county[Game.areaIdOf(f)];
        if (c && c.st !== n.homeSt) foreign++;
      }
      const endAreas = Math.max(1, n.counties.size + (preview.targets || []).length);
      terms.push(term('Foreign ground', 'ai.wOccupy', foreign,
        -(Game.occupiedCount(intent.nid) + foreign) / endAreas, 'hold'));
    }

    if (intent.type === 'unite') {
      /*
       * There is deliberately NO term for the odds themselves. The prize above
       * is already discounted by `chance`, and a second term rewarding
       * likelihood on its own scores a coin-flip over a tiny neighbour exactly
       * as highly as a coin-flip over a giant one — the same mistake as scoring
       * a union with no prize at all, in the other direction. It is the ratio
       * that decides, and the ratio is in the discount.
       */
      const fo = preview.fallout || { defect: [], secede: [] };
      const lost = fo.defect.length + fo.secede.length;
      // Heavier than a civil war, and the reason is whose ground is at stake: a
      // failed union costs you Areas you already held.
      terms.push(term('If it fails', 'ai.wFallout', lost, -lost / Math.max(1, n.counties.size), 'hold'));
    }

    if (intent.type === 'release') {
      /*
       * The growth terms above are already negative here — that is the price.
       * This is the thing being bought, and it is measured by the CLOCK rather
       * than by the raw share: an Area at 47% of the threshold is not slowly
       * leaving, it is a long way off, and scoring the share linearly made
       * releasing ground the best opening move on the board for every nation on
       * turn one.
       *
       * `Sentiment.clock` is the function that puts "breakaway in ~3 turns" in
       * the player's Area panel. It reads `null` for a movement whose target
       * sits below the line — a plateau, not a slow climb — and ground nobody is
       * coming for is worth nothing to shed, which is exactly right.
       */
      const areas = intent.areas || [];
      let sum = 0, soonest = null;
      for (const f of areas) {
        let best = 0;
        const c = Game.county[Game.areaIdOf(f)];
        for (const m in (c ? c.mov : {})) {
          const cl = Sentiment.clock(f, m, tune);
          if (!cl || cl.turns == null) continue;
          const v = 1 / (1 + cl.turns);
          if (v > best) best = v;
          if (soonest == null || cl.turns < soonest) soonest = cl.turns;
        }
        sum += best;
      }
      /*
       * ...and it is worth what the NATION is at risk of, not what the Area is.
       * Shedding your three worst Areas is cheap and effective for a sixty-Area
       * power that is in no danger at all, and without this the AI did it
       * constantly: 79 releases in 50 turns, and 51 nations became 135. Scaling
       * by strain says the plain thing — you buy stability with territory when
       * you need stability, and a secure nation needs none.
       */
      const mean = (areas.length ? sum / areas.length : 0) * st;
      terms.push(term('Sedition shed', 'ai.wRelief', mean, mean, 'hold',
        soonest == null ? 'no movement is arriving' : `soonest breakaway in ${soonest} turns`));
    }

    if (intent.type === 'autonomy') {
      /*
       * The same relief term release gets, and deliberately the same weight:
       * the two moves answer the same problem and the choice between them should
       * turn on their PRICES, not on the AI liking one more. Release loses the
       * people and the ground; autonomy loses the revenue and some Authority and
       * keeps both. The generic price terms above already carry that difference.
       */
      const areas = intent.areas || [];
      let sum = 0, soonest = null;
      for (const f of areas) {
        let bestClock = 0;
        const c = Game.county[Game.areaIdOf(f)];
        for (const m in (c ? c.mov : {})) {
          const cl = Sentiment.clock(f, m, tune);
          if (!cl || cl.turns == null) continue;
          const v = 1 / (1 + cl.turns);
          if (v > bestClock) bestClock = v;
          if (soonest == null || cl.turns < soonest) soonest = cl.turns;
        }
        sum += bestClock;
      }
      const mean = (areas.length ? sum / areas.length : 0) * st;
      terms.push(term('Grievance answered', 'ai.wRelief', mean, mean, 'hold',
        soonest == null ? 'no movement is arriving' : `soonest breakaway in ${soonest} turns`));
      // The revenue it costs, as a share of what the nation makes.
      const flow = Game.treasuryFlow(intent.nid);
      const income = flow ? Math.max(1, flow.income) : 1;
      terms.push(term('Revenue given up', 'ai.wPrice', preview.forgone,
        -(preview.forgone || 0) / income, 'hold'));
    }

    if (intent.type === 'govern') {
      const now = d.pop > 0 ? d.mix[Ideology.index(n.gov.rulingIdeology)] / d.pop : 0;
      terms.push(term('Mandate', 'ai.wMandate', preview.share, preview.share - now, 'hold'));
      terms.push(term('Upheaval', 'ai.wUpheaval', preview.distance, -preview.distance, 'hold'));
    }

    /*
     * POSTURE. One number, two multipliers: a nation close to losing an Area
     * discounts every gain and inflates every risk. That is the whole difference
     * between a secure nation that expands and a fraying one that consolidates,
     * and it is DERIVED rather than stored — so a nation's character follows its
     * situation and can change back when the situation does, instead of being a
     * label assigned at setup that outlives the reason for it.
     */
    const k = tune.get('ai.strainPosture') * st;
    const inputs = [];
    let value = 0;
    for (const t of terms) {
      const weight = tune.get(t.key);
      const posture = t.stance === 'expand' ? 1 - k : 1 + k;
      const contribution = weight * t.norm * posture;
      value += contribution;
      inputs.push({ ...t, weight, posture, contribution });
    }
    return { value, inputs, strain: st, summary: summarise(intent, value, inputs) };
  }

  /** "Ohio annexed 3 Areas — people, wealth, against a risk of civil war." */
  function summarise(intent, value, inputs) {
    const sorted = [...inputs].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    const top = sorted.slice(0, 2).filter((i) => Math.abs(i.contribution) > 1e-6);
    if (!top.length) return `${intent.type}: nothing either way.`;
    return `${intent.type}: ` + top.map((i) =>
      `${i.label} ${i.contribution >= 0 ? '+' : ''}${i.contribution.toFixed(2)}`).join(', ');
  }

  /* ------------------------------------------------------------------ */
  /* the policy                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * WHERE THIS NATION POINTS ITS ARMY, decided from its own situation.
   *
   * Not an intent, and deliberately not part of the move list: an allocation is
   * a standing posture rather than a turn's action, and readiness is
   * rate-limited precisely so that it cannot be spent as one. It is set every
   * turn, and the rate limit means it takes several turns to mean anything —
   * which is the same reason it is worth setting early.
   *
   * The shape is the same argument the score uses: strain says hold, and a
   * nation whose best move is an annexation wants the army pointed at it.
   */
  function allocate(nid, tune, best) {
    const t = tune || window.TUNE;
    const st = strain(nid, t);
    const attacking = best && best.intent && best.intent.type === 'annex' ? 1 : 0;
    const occupied = Game.occupiedCount(nid);
    const areas = Math.max(1, Game.getNation(nid).counties.size);
    /*
     * Three pulls, and none of them is a new tunable: ground you are holding
     * against its will wants a garrison, ground you are about to take wants a
     * field army, and everything else is border. A nation with no crisis and no
     * plan sits mostly on its border, which is what a peacetime army does.
     */
    const garrison = 0.15 + 0.55 * Math.max(st, occupied / areas);
    const field = 0.15 + 0.45 * attacking;
    return Military.allocate(nid, { garrison, field, border: Math.max(0.1, 1 - garrison - field) });
  }

  /**
   * Every move this nation could make, scored, best first.
   *
   * Exposed because it is the honest answer to "why did Texas do that", and
   * because a tuning pass on sixteen weights is guesswork without being able to
   * ask a nation what it was thinking.
   */
  function deliberate(nid, tune) {
    const t = tune || window.TUNE;
    const out = [];
    const ctx = { demo: Game.nationDemographics(nid), strain: strain(nid, t) };
    for (const intent of Moves.legal(nid, {}, t)) {
      const preview = Moves.plan(intent, t);
      if (!preview.ok) continue;
      const s = score(intent, preview, t, ctx);
      if (s) out.push({ intent, preview, ...s });
    }
    out.sort((a, b) => b.value - a.value);
    return out;
  }

  /**
   * What this nation wants to do this turn, as an intent, or null to pass.
   *
   * SOFTMAX, not argmax. Always taking the best-scoring move makes fifty
   * similarly-placed nations behave identically on the same turn, and makes the
   * whole AI solvable: once a player knows the weights, every future move is
   * known. A temperature costs the AI a little quality and buys a world that
   * cannot be read off a table. Set `ai.temperature` to 0 to get argmax back.
   *
   * The floor is deliberate too. A nation that acts every turn because something
   * scored 0.001 is both unrealistic and exhausting to play against, so a move
   * has to clear `ai.actThreshold` to be worth doing at all — and passing is a
   * legitimate answer, not a failure to find one.
   */
  function deliberatePolicy(nid, tune, rng) {
    const t = tune || window.TUNE;
    const ranked = deliberate(nid, t).filter((r) => r.value >= t.get('ai.actThreshold'));
    if (!ranked.length) return null;
    const temp = t.get('ai.temperature');
    if (temp <= 0) return ranked[0].intent;

    const best = ranked[0].value;
    const weights = ranked.map((r) => Math.exp((r.value - best) / temp));
    let total = 0;
    for (const w of weights) total += w;
    let roll = (rng ? rng.stream('ai').random() : 0) * total;
    for (let i = 0; i < ranked.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return ranked[i].intent;
    }
    return ranked[ranked.length - 1].intent;
  }

  /*
   * The policy is a FIELD, not a function body, and it is the only mutable thing
   * in this module. That is what lets the suite drive the real turn loop with a
   * deliberately bad policy — one that proposes moves the rules refuse — and
   * assert that the game passes rather than throws. Testing that by editing the
   * policy would test a different loop from the one that ships.
   */
  let policy = deliberatePolicy;

  /** Swap the policy in, returning the previous one so a caller can restore it. */
  function setPolicy(fn) {
    const prev = policy;
    policy = fn || deliberatePolicy;
    return prev;
  }

  /** Nobody home: the M6.2 policy, kept because "pass" is a useful control. */
  const pass = () => null;

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
    // The army is pointed every turn, whether or not anything else happens: a
    // posture is not an action and a nation that passes still has one.
    allocate(nid, tune, intent ? { intent } : null);
    if (!intent) return { nid, intent: null, result: null };
    /*
     * A move the policy proposed but the rules refuse is a PASS, not an
     * exception. The AI is allowed to be wrong about what it can afford; it is
     * not allowed to stop the game. `plan` is pure, so this costs nothing but
     * the check, and it means a scoring bug in M6.3 shows up as a nation that
     * does nothing rather than as a broken turn loop.
     */
    const preview = Moves.plan(intent, tune);
    if (!preview.ok) return { nid, intent: null, result: null, refused: preview.reason };
    return { nid, intent, result: Moves.resolve(intent, rng, tune) };
  }

  /**
   * Play ONE FULL ROUND: every seat in the order takes its turn, and the world
   * ticks at the wrap.
   *
   * This is the simulator's entry point, and the reason it exists is the same
   * reason `Sim.run` drives the real `World.advanceTurn` rather than a
   * lightweight model of it: a tuning dashboard that measures a world nobody is
   * playing measures the wrong world. Before M6.3 the simulator stepped the
   * world engine with all fifty-one nations passing, so every verdict card in
   * `dev.html` described a map on which nothing deliberate ever happened — which
   * was true of the game at the time, and stopped being true the moment the AI
   * arrived.
   *
   * @returns {{turns, rounds, acted}}
   */
  function round(tune, rng) {
    const out = { turns: 0, rounds: 0, acted: [] };
    /*
     * Until the round ENDS, not for a fixed number of seats. A round that
     * splinters a nation inserts the newborns into the order behind their
     * parent, so the order is longer than it was when the round started — and
     * counting seats stopped one short of the wrap, which meant the world never
     * ticked at all on exactly the turns something interesting happened.
     */
    const guard = TurnSystem.snapshot().order.length * 3 + 32;
    Game.batch(() => {
      for (let i = 0; i < guard && out.rounds === 0; i++) {
        const nid = TurnSystem.currentId();
        if (nid == null) break;
        const t = takeTurn(nid, tune, rng);
        if (t.intent) out.acted.push(t);
        out.turns++;
        if (TurnSystem.advance(tune, rng).roundEnded) out.rounds++;
      }
    });
    return out;
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

  return { chooseMove, setPolicy, deliberate, score, strain, allocate, pass, takeTurn, sweep, round };
})();
