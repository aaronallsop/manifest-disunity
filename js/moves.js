/*
 * Moves: what an action WOULD do, and what it DOES.
 *
 *   Moves.plan(intent)        -> Preview   pure, no RNG, no DOM
 *   Moves.resolve(intent, rng) -> Result   RNG explicit, mutates, logs
 *
 * ONE PLAN FUNCTION, TWO CALLERS, and that is the whole point. The UI renders
 * `plan` as a preview and then calls `resolve`; the AI calls `plan` over its
 * candidate moves, scores the previews, and calls `resolve` on the winner. Being
 * the same function is what stops the human's preview and the AI's model from
 * ever disagreeing about what an action does — and a disagreement there is
 * unfalsifiable from inside the game, because each side only ever sees its own
 * answer.
 *
 * It also unblocks three other things at once, which is why the plan says to do
 * it before anything else in M6: deterministic replay (resolve takes the rng),
 * outcome tests (plan is pure, so an assertion needs no world), and the
 * explanation layer (a Preview is already the shape a tooltip wants).
 *
 * WHAT A PREVIEW IS. Always `{ ok, reason, cost, effects[], ... }`:
 *   ok       may this nation do this, right now
 *   reason   if not, a sentence written for a player and reusable by the AI as
 *            a filter — one string rather than a code every caller re-translates
 *   cost     treasury, so affordability is one comparison for both callers
 *   effects  what it would change, as {label, value} — the preview the UI draws
 *            and the vector the AI scores
 *
 * WHAT STAYS IN actions.js. Selection state, map highlighting, panels, the
 * multi-step transit negotiation. That file becomes UI; this one is the model.
 */
const Moves = (function () {
  /*
   * THE TUNE IS A PARAMETER, not a global read.
   *
   * `T()` returned `window.TUNE` until M6.3, which was invisible while the only
   * caller was a page that had exactly one. Then the simulator started driving
   * the AI, `Sim.run` layers its overrides onto a CLONE so exploring never
   * touches the session — and every slider under Annexation, Unite and Release
   * silently did nothing, because the rules were reading the session's tune
   * while the world phases read the clone. A dashboard whose sliders move
   * nothing is worse than no dashboard.
   *
   * Same shape js/world.js uses: `T(tune)` falls back to the session for the UI
   * callers, which genuinely do have exactly one.
   */
  const T = (t) => t || window.TUNE;
  const nationOf = (nid) => Game.getNation(nid);

  /** A refusal, in the one shape every caller reads. */
  const no = (reason, extra) => ({ ok: false, reason, cost: 0, effects: [], ...extra });

  const nameOf = (nid) => { const n = nationOf(nid); return n ? n.name : nid; };
  const areaWord = (k) => (k === 1 ? 'Area' : 'Areas');

  /*
   * THE LEDGER IS WRITTEN HERE, NOT BY THE CALLER.
   *
   * It lived in `actions.js` until M6.3 — that is, in the UI — which was fine
   * while the only thing that ever acted was a human clicking a button. The
   * moment the AI took the other fifty seats, fifty-one nations acted and one of
   * them was logged: the newspaper reported nothing but obituaries, because the
   * only entry written from inside the model was the one `pruneEmpty` writes
   * when a nation dies. A world where the only news is death is not a tuning
   * problem, it is a hole.
   *
   * Logging from the resolver also removes the possibility of the two callers
   * describing the same event differently, which is the same argument that put
   * `plan` in one place.
   */
  const log = (e) => Ledger.append({ phase: 'action', ...e });

  /*
   * AND THE OTHER NATIONS REMEMBER IT.
   *
   * Recorded from the resolver for the same reason the ledger is: it is the one
   * place that knows what actually happened, and two callers describing the same
   * event differently is the failure the whole plan/resolve split exists to
   * prevent.
   *
   * `witnessed` is the term that matters most and is easiest to leave out. A
   * conqueror resented only by its victims is resented only by the nations least
   * able to do anything about it; the coalition M7.2 builds needs the neighbours
   * who merely watched, and they have to have been watching all along.
   */
  function remember(actor, victims, kind, scale, tune) {
    const hit = new Set(victims.filter(Boolean));
    for (const v of hit) Relations.record(v, actor, kind, { scale, tune });
    for (const other of Game.adjacentNations(actor)) {
      if (hit.has(other)) continue;
      Relations.record(other, actor, 'witnessed', { scale, tune });
    }
  }

  /* ------------------------------------------------------------------ */
  /* shared preconditions                                               */
  /* ------------------------------------------------------------------ */

  /**
   * WHO A NEW NATION BROKE AWAY FROM (M7.8).
   *
   * Every way a nation can be born has a parent, and recognition turns that
   * from a piece of colour into the pivot of the newcomer's early game — while
   * the state it left calls it a rebellion, the rest of the continent waits.
   * Recorded at every birth site rather than derived afterwards, because the
   * only place the answer is still knowable is before the ground moves.
   *
   * `was` maps Area -> the nation that held it a moment ago, so a collapse that
   * shatters three countries' ground into four fragments gives each fragment the
   * parent it actually came out of rather than one shared guess.
   */
  function recordBirths(born, was, opts = {}) {
    if (typeof Recognition === 'undefined') return;
    for (const id of born) {
      const n = nationOf(id);
      if (!n) continue;
      const tally = {};
      for (const f of n.counties) {
        const o = was instanceof Map ? was.get(f) : was;
        if (o && o !== id) tally[o] = (tally[o] || 0) + 1;
      }
      let best = null, bc = 0;
      for (const k of Object.keys(tally).sort()) if (tally[k] > bc) { best = k; bc = tally[k]; }
      Recognition.founded(id, best, opts);
    }
  }

  function cooldown(nid, stamp, key, tune) {
    const n = nationOf(nid);
    if (!n || !Number.isFinite(n[stamp])) return 0;
    return Math.max(0, T(tune).get(key) - (World.getTurn() - n[stamp]));
  }

  const annexCooldownLeft = (nid, tune) => cooldown(nid, 'lastAnnexTurn', 'annex.cooldownTurns', tune);
  const releaseCooldownLeft = (nid, tune) => cooldown(nid, 'lastReleaseTurn', 'release.cooldownTurns', tune);
  const uniteCooldownLeft = (nid, tune) => cooldown(nid, 'lastUniteTurn', 'unite.cooldownTurns', tune);

  /**
   * What one annexation costs the treasury. Flat per Area plus a per-head term,
   * so swallowing a metro Area costs more than swallowing empty ground; the
   * leader tier pays a surcharge on top.
   */
  function annexCost(areas, shell, tune) {
    const pop = areas.length ? Game.demographics(areas).pop : 0;
    const base = areas.length * T(tune).get('annex.costPerArea') + pop * T(tune).get('annex.costPopScale');
    return base * (1 + T(tune).get('annex.shellCostMult') * (shell || 0));
  }



  /* ------------------------------------------------------------------ */
  /* treaties and aid (M11.2)                                            */
  /* ------------------------------------------------------------------ */

  const cooldownOn = (nid, field, key, tune) => {
    const n = nationOf(nid);
    if (!n || n[field] == null) return 0;
    return Math.max(0, T(tune).get(key) - (World.getTurn() - n[field]));
  };

  /**
   * @param intent {type:'treaty', nid, target, kind}
   *
   * A pact is the first thing in this game a nation can PROMISE. Everything
   * else it can do to another country is something it does TO them and then
   * they remember; this sits on the board until somebody breaks it, and the
   * breaking is worth more than the never-signing.
   */
  function planTreaty(intent, tune) {
    const { nid, target } = intent;
    const kind = intent.kind || 'nonaggression';
    const me = nationOf(nid), them = nationOf(target);
    if (!me || !them) return no('That nation no longer exists.');
    if (nid === target) return no('You cannot sign a treaty with yourself.');
    if (!Pacts.KINDS.includes(kind)) return no(`There is no such thing as a "${kind}".`);
    if (Pacts.live(nid, target)) {
      return no(`You already have a ${Pacts.LABEL[Pacts.live(nid, target).kind]} with ${them.name}.`);
    }
    if (!Game.adjacentNations(nid).includes(target)) {
      return no(`${them.name} is not within reach.`);
    }
    const cd = cooldownOn(nid, 'lastTreatyTurn', 'treaty.cooldownTurns', tune);
    if (cd > 0) return no(`Your diplomats are still drafting — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);
    /*
     * A SIGNATURE NEEDS TWO GOVERNMENTS, exactly as a trade deal does.
     */
    if (typeof Recognition !== 'undefined' && !Recognition.canTrade(nid, target)) {
      return no(`${them.name} will not sign anything with a government it does not admit exists.`);
    }
    /*
     * ...AND THEY HAVE TO BE WILLING. The bar is deliberately BELOW zero: two
     * nations that merely tolerate one another are exactly the pair a
     * non-aggression pact is for, and requiring warmth first would make a treaty
     * a reward for a relationship rather than a way of building one.
     */
    const standing = Relations.score(target, nid, T(tune));
    const bar = T(tune).get('treaty.minStanding');
    if (standing < bar) {
      return no(`${them.name} will not sign with you. `
        + `They will need to think better of you first.`, { standing });
    }
    return {
      ok: true, reason: null, cost: 0, target, kind, standing,
      effects: [
        { label: 'Pacts held', value: 1 },
        { label: 'How they see you', value: standing },
      ],
    };
  }

  function resolveTreaty(intent, rng, tune) {
    const plan = planTreaty(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, target } = intent;
    const kind = plan.kind;
    Pacts.sign(nid, target, kind);
    const n = nationOf(nid);
    if (n) n.lastTreatyTurn = World.getTurn();
    // Both directions: signing is a thing two governments did together.
    Relations.record(nid, target, 'treatied', { tune: T(tune) });
    Relations.record(target, nid, 'treatied', { tune: T(tune) });
    Game.touch({ values: true });
    const entry = log({
      subject: nid, kind: 'treaty', delta: 1, partner: target,
      text: `${nameOf(nid)} and ${nameOf(target)} signed a ${Pacts.LABEL[kind]}.`,
    });
    return { ...plan, events: [entry] };
  }

  /**
   * @param intent {type:'aid', nid, target}
   *
   * A cheque, and three things bought with it: standing, a better chance of
   * being recognised, and a share of the recipient's politics. The third is the
   * active lever Ideological Dominance was missing — see js/pacts.js.
   *
   * The AMOUNT is not a choice. It is `aid.shareOfTreasury` of what the donor
   * holds, for the same reason every other price in this game is derived: a
   * figure the player types is a figure the AI cannot compare against, and the
   * interesting decision is who to fund rather than how much.
   */
  function planAid(intent, tune) {
    const { nid, target } = intent;
    const me = nationOf(nid), them = nationOf(target);
    if (!me || !them) return no('That nation no longer exists.');
    if (nid === target) return no('You cannot pay yourself.');
    const cd = cooldownOn(nid, 'lastAidTurn', 'aid.cooldownTurns', tune);
    if (cd > 0) return no(`The last transfer is still clearing — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);
    const cost = Math.max(0, me.treasury) * T(tune).get('aid.shareOfTreasury');
    if (cost <= 0 || me.treasury < cost) {
      return no('There is nothing in the treasury to give.');
    }
    /*
     * WHAT IT BUYS depends on the RECIPIENT's size, not the donor's. The same
     * money is a transformative sum to a small country and a rounding error to
     * a large one, which is what makes buying the continent's politics
     * impossible and buying one neighbour's entirely reasonable.
     */
    const flow = Game.treasuryFlow(target);
    const income = flow ? Math.max(1, flow.income) : 1;
    const share = cost / income;
    const patron = Pacts.patronOf(target);
    return {
      ok: true, reason: null, cost, target, share,
      // What the recipient's patron weight would become. `Pacts.pay` owns the
      // arithmetic; this previews it without performing it, because `plan` is pure.
      wouldBe: Math.min(T(tune).get('aid.patronMax'),
        ((patron && patron.nid === nid) ? patron.weight : 0) + share * T(tune).get('aid.patronGain')),
      patron,
      effects: [
        { label: 'Treasury', value: -cost },
        { label: 'A year of their income', value: share },
        { label: 'How they see you', value: 1 },
      ],
    };
  }

  function resolveAid(intent, rng, tune) {
    const plan = planAid(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, target } = intent;
    if (!Game.spend(nid, plan.cost)) return no('The treasury moved before the transfer went out.');
    Game.earn(target, plan.cost);
    const n = nationOf(nid);
    if (n) n.lastAidTurn = World.getTurn();
    const p = Pacts.pay(nid, target, plan.share, T(tune));
    /*
     * ONE DIRECTION. Gratitude is not symmetric: the recipient thinks better of
     * the donor, and the donor has no new opinion of the recipient beyond
     * being out of pocket.
     */
    Relations.record(target, nid, 'aided', { tune: T(tune) });
    Game.touch({ values: true });
    const entry = log({
      subject: nid, kind: 'aid', delta: -plan.cost, partner: target,
      text: `${nameOf(nid)} sent ${Math.round(plan.cost / 1e9)}bn to ${nameOf(target)}`
        + `${p && p.nid === nid && p.weight > 0.05 ? `, who now govern noticeably more like them` : ''}.`,
      terms: [
        { name: 'Share of their income', value: plan.share, key: 'aid.shareOfTreasury' },
        { name: 'Patron weight', value: p ? p.weight : 0, key: 'aid.patronGain' },
      ],
    });
    return { ...plan, patron: p, events: [entry] };
  }

  /* ------------------------------------------------------------------ */
  /* trade (M11.1)                                                       */
  /* ------------------------------------------------------------------ */

  /*
   * TRADE BECOMES A MOVE, and the reason is not tidiness.
   *
   * The rules below were written in M6.6 and lived in `js/actions.js` — that
   * is, in the UI — so only the human could use them. The consequence the audit
   * found is sharper than "the AI does not trade": `traded` is the ONLY
   * relations channel ordinary play generates. Every other entry in the ledger
   * comes from taking something from somebody. So the player could farm
   * standing at zero risk, every few turns, for union odds and coalition
   * exemptions the AI could never earn back — not because the AI was worse at
   * it, but because the rule was not written where the AI could see it.
   *
   * This is the same argument M6.3 made about annexation, in the one place it
   * had not yet been applied.
   *
   * WHAT MOVED AND WHAT DID NOT. The bilateral deal is here, because it is the
   * one that creates a relationship. Selling to the world market stays a UI path
   * in actions.js: it is a nation and a price, it records nothing about anybody,
   * and giving the AI a free income button with no counterparty would change the
   * economy without changing the diplomacy.
   */

  /** A nation's tradeable flows against another, by sector, at market prices ($M). */
  function tradeFlows(a, b, tune) {
    if (typeof Market === 'undefined' || typeof MapModes === 'undefined') return [];
    const ms = Market.nationSurplus(a, T(tune)), ts = Market.nationSurplus(b, T(tune));
    const prices = Market.getPrices();
    const e = MapModes.getEconomy();
    if (!ms || !ts || !prices || !e) return [];
    const flows = [];
    e.sectors.forEach((sec, i) => {
      const sell = Math.min(Math.max(0, ms.surplus[i]), Math.max(0, -ts.surplus[i]));
      const buy = Math.min(Math.max(0, ts.surplus[i]), Math.max(0, -ms.surplus[i]));
      if (sell + buy > 1) {
        flows.push({ i, s: sec, sell, buy, vol: sell + buy, value: (sell + buy) * (prices[i] / 100) });
      }
    });
    return flows;
  }

  /**
   * Clip a set of flows to what the two nations can physically move.
   *
   * A CAP, and it is what stopped the world market being strictly better than
   * every neighbour: capacity comes off the baked ports, rail hubs and border
   * gateways, so geography decides how much of a matched surplus actually ships.
   */
  function applyCapacity(flows, capacity) {
    const uncappedTotal = flows.reduce((sum, f) => sum + f.value, 0);
    if (uncappedTotal <= capacity || uncappedTotal <= 0) {
      return { flows, total: uncappedTotal, capped: false, uncappedTotal };
    }
    const k = capacity / uncappedTotal;
    return {
      flows: flows.map((f) => ({ ...f, vol: f.vol * k, value: f.value * k })),
      total: capacity, capped: true, uncappedTotal,
    };
  }

  /** Turns until `nid` may deal with `key` again ('world', 'Canada', or a nation id). */
  function tradeCooldownLeft(nid, key, tune) {
    const n = nationOf(nid);
    if (!n || !n.tradeCooldown) return 0;
    const last = n.tradeCooldown[key];
    if (last == null) return 0;
    return Math.max(0, T(tune).get('trade.cooldownTurns') - (World.getTurn() - last));
  }

  function markTraded(nid, key) {
    const n = nationOf(nid);
    if (n) (n.tradeCooldown || (n.tradeCooldown = {}))[key] = World.getTurn();
  }

  /**
   * @param intent {type:'trade', nid, target}
   *
   * Both sides earn the same. That is not a simplification — a matched deal is
   * two nations each selling what the other lacks, and the whole point of the
   * bilateral rate being higher than the world market is that finding a partner
   * whose deficits mirror your surpluses is a skill.
   */
  function planTrade(intent, tune) {
    const { nid, target } = intent;
    const me = nationOf(nid), them = nationOf(target);
    if (!me || !them) return no('That nation no longer exists.');
    if (nid === target) return no('You cannot trade with yourself.');
    if (!Game.adjacentNations(nid).includes(target)) {
      return no(`${them.name} is not within reach.`);
    }
    const cd = tradeCooldownLeft(nid, target, tune);
    if (cd > 0) {
      return no(`You dealt with ${them.name} recently — ${cd} more world ${areaWord(cd) === 'Area' ? 'turn' : 'turns'}.`);
    }
    /*
     * A DEAL NEEDS TWO GOVERNMENTS (M7.8). An unrecognised state can still sell
     * to the world market through intermediaries, but a trade agreement is a
     * signature, and a signature needs both sides to admit the other exists.
     */
    if (typeof Recognition !== 'undefined' && !Recognition.canTrade(nid, target)) {
      const oneWay = !Recognition.recognises(target, nid);
      return no(oneWay
        ? `${them.name} does not recognise you as a country, and a trade agreement is a signature between two governments.`
        : `You do not recognise ${them.name} as a country.`);
    }
    const limit = Math.min(Game.tradeCapacity(nid).total, Game.tradeCapacity(target).total);
    const res = applyCapacity(tradeFlows(nid, target, tune), limit);
    if (!res.flows.length || res.total <= 0) {
      return no(`Nothing to trade — you and ${them.name} run the same surpluses.`);
    }
    const gain = res.total * T(tune).get('trade.gain');
    return {
      ok: true, reason: null, target, cost: 0,
      flows: res.flows, total: res.total, capped: res.capped, uncappedTotal: res.uncappedTotal,
      gain,
      effects: [
        { label: 'Traded value', value: res.total * 1e6 },
        { label: 'Treasury, each side', value: gain * 1e6 },
        // What it buys that money cannot is a `traded` entry in BOTH
        // directions, which is the one relations channel ordinary play
        // generates without taking anything from anybody. It is not a number
        // the effects vector can carry, so what is reported here is the size of
        // the deal that earns it.
        { label: 'Sectors traded', value: res.flows.length },
      ],
    };
  }

  function resolveTrade(intent, rng, tune) {
    const plan = planTrade(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, target } = intent;
    const a = nameOf(nid), b = nameOf(target);
    const gain = plan.gain;
    Game.batch(() => {
      Game.earn(nid, gain * 1e6);
      Game.earn(target, gain * 1e6);
      markTraded(nid, target);
      markTraded(target, nid);
      /*
       * BOTH DIRECTIONS. The only relations term that accumulates through
       * ordinary play rather than through violence, which is what lets a
       * patient nation build standing without taking anything from anybody.
       */
      Relations.record(nid, target, 'traded', { tune: T(tune) });
      Relations.record(target, nid, 'traded', { tune: T(tune) });
    });
    if (typeof Market !== 'undefined') Market.update(T(tune)); // traded supply moves the prices
    const entry = log({
      subject: nid, kind: 'trade', delta: gain * 1e6, partner: target,
      text: `${a} and ${b} signed a trade deal worth ${Math.round(gain)}M to each.`,
    });
    return { ...plan, gain, events: [entry] };
  }

  /* ------------------------------------------------------------------ */
  /* annex                                                              */
  /* ------------------------------------------------------------------ */

  /*
   * THE UNTOUCHABLE NEIGHBOUR (M9.3).
   *
   * A nation more than `annex.strongNeighbourFactor` times your size on BOTH
   * population and GDP cannot be annexed from at all. Decided by size and not
   * by ideology: the rule this replaced blocked only same-lean nations that
   * were bigger, which left every ideological opposite wide open however large
   * — Wyoming (0.59M, $51B) could not touch Montana or Idaho but could chew on
   * Colorado (5.96M, $558B) freely, every turn, at no risk.
   *
   * It lives HERE now, and that is the whole point of the M9.3 move. It was
   * enforced in `Actions.startAnnex` — the human's click path — and nowhere
   * else: not in `planAnnex`, not in `legal`, not anywhere the AI or the
   * simulator could see it. The rules of the same action differed by which
   * caller you were, and the caller who got the looser rules was the one with
   * fifty seats. One function, three callers, one rule.
   */
  function tooStrongToAnnex(nid, ownerId, tune) {
    if (!ownerId || ownerId === nid) return false;
    const factor = T(tune).get('annex.strongNeighbourFactor');
    const me = Game.nationDemographics(nid);
    const them = Game.nationDemographics(ownerId);
    if (!me || !them) return false;
    return them.pop > me.pop * factor && them.gdp > me.gdp * factor;
  }

  /** Every nation `nid` may not annex from, as a Set of nation ids. */
  function untouchable(nid, tune) {
    const out = new Set();
    for (const [oid] of Game.nations) if (tooStrongToAnnex(nid, oid, tune)) out.add(oid);
    return out;
  }

  /**
   * @param intent {type:'annex', nid, areas:[fips]}
   *
   * The civil-war assessment is part of the PREVIEW, not just the result: a
   * player deciding whether to take four Areas needs to know it would flip their
   * governing ideology before they commit, and the AI needs the same number to
   * decide whether it is worth it. `CivilWar.assess` is pure, so both get it.
   */
  function planAnnex(intent, tune) {
    const { nid, areas = [] } = intent;
    const n = nationOf(nid);
    if (!n) return no('That nation no longer exists.');
    const cd = annexCooldownLeft(nid, tune);
    if (cd > 0) return no(`Your armies are still regrouping — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);
    if (!areas.length) return no('Nothing selected.');

    const budget = T(tune).get('annex.budgetAreas');
    if (areas.length > budget) return no(`You may take at most ${budget} Areas in one turn.`);

    const own = n.counties;
    const targets = [];
    for (const f of areas) {
      if (own.has(f)) return no('You already hold that Area.');
      if (!Game.county[f]) return no('That Area does not exist.');
      targets.push(f);
    }

    /*
     * ...and not from somebody who could swat you. See tooStrongToAnnex: until
     * M9.3 this was checked only on the human's click path, so `plan` — the
     * function the AI, the simulator and every test go through — did not know
     * the rule existed.
     */
    const factor = T(tune).get('annex.strongNeighbourFactor');
    const strong = targets
      .map((f) => Game.getOwner(f))
      .find((o) => tooStrongToAnnex(nid, o, tune));
    if (strong) {
      const who = Game.getNation(strong);
      return no(`${who ? who.name : 'That nation'} is more than ${factor}\u00d7 your size on both `
        + 'population and GDP. There is no ground to take from them.');
    }

    /*
     * OUT OF REACH IS NOT A PRICE (M7.11). Past the edge of what a nation can
     * project from its seats of government, along the network rather than across
     * the map, there is no amount of money that buys the ground. This is the
     * refusal every other anti-snowball device is not: the coalition and the
     * cost of occupation make expansion expensive, and this makes it impossible
     * until the nation takes the infrastructure that would carry it.
     */
    if (typeof Projection !== 'undefined') {
      const far = targets.find((f) => !Projection.inRange(nid, f, T(tune)));
      if (far) {
        const why = Projection.explain(nid, far, T(tune));
        return no(`${Game.nameForCounty(far)} is beyond anything you could hold. ${why.summary}`,
          { projection: why });
      }
    }

    const shell = Game.blueShell(nid);
    const reachMult = typeof Projection !== 'undefined'
      ? Projection.costMultiplier(nid, targets, T(tune)) : 1;
    const cost = annexCost(targets, shell, tune) * reachMult;
    const against = [...new Set(targets.map((f) => Game.getOwner(f)).filter((o) => o && o !== nid))];
    /*
     * ...and an army fighting at the edge of its reach fights worse. The same
     * number that priced the attempt, so the panel explains both with one
     * record rather than two that could disagree.
     */
    const reachWar = typeof Projection !== 'undefined'
      ? Projection.warMultiplier(nid, targets, T(tune)) : 1;
    /*
     * THE NUMBER THE RESOLVER WILL USE, COMPUTED ONCE (M9.3).
     *
     * This is `scoreMult`: everything that scales the civil-war score, where
     * low is a win for the attacker. Three factors, and until M9.3 no caller
     * saw all three —
     *
     *   (1 + shell)  the coalition surcharge. Applied by `resolveAnnex`, absent
     *                from the preview, so a nation the world had ganged up on
     *                was shown a fight it was not going to get.
     *   Military     your Field army against their Borders.
     *   reachWar     the edge-of-reach penalty (M7.11 / §6.4). Shown in the
     *                preview, NEVER passed to the roll — so a war at the limit
     *                of projection was priced higher, previewed as harder, and
     *                then fought exactly as well as one next door. One of the
     *                three things reach is documented to do simply did not
     *                happen.
     *
     * `resolveAnnex` now reads `plan.scoreMult` rather than rebuilding it. Two
     * expressions kept in step is the arrangement that produced this bug; one
     * expression, called twice, is the arrangement that cannot.
     */
    const scoreMult = (1 + (shell || 0)) * Military.warMultiplier(nid, against, tune) * reachWar;
    // `forceMult` is the name the panel and the AI have always known it by.
    const forceMult = scoreMult;
    const affordable = n.treasury >= cost;

    const before = Game.nationDemographics(nid);
    const added = Game.demographics(targets);
    const after = Game.demographics([...own, ...targets]);
    const war = CivilWar.assess(before, added, after, T(tune));

    return {
      ok: affordable,
      reason: affordable ? null
        : `Mobilising costs ${Math.round(cost / 1e9)}bn and the treasury holds ${Math.round(Math.max(0, n.treasury) / 1e9)}bn.`,
      cost, shell, targets, war, forceMult, scoreMult, reachMult, reachWar,
      effects: [
        { label: 'Areas', value: targets.length },
        { label: 'Population', value: added.pop },
        { label: 'GDP', value: added.gdp },
        { label: 'Civil war', value: war.triggered ? 1 : 0 },
        // Below 1 when your Field beats their Border. The human sees it as
        // "your army is ready"; the AI scores it. Same number.
        { label: 'Force', value: forceMult },
      ],
    };
  }

  function resolveAnnex(intent, rng, tune) {
    const plan = planAnnex(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid } = intent;
    const targets = plan.targets;
    const n = nationOf(nid);

    if (!Game.spend(nid, plan.cost)) return no('The treasury moved before the order went out.');
    n.lastAnnexTurn = World.getTurn();

    // Who is losing ground, and how much of the contested set is theirs.
    const victims = {};
    for (const f of targets) {
      const o = Game.getOwner(f);
      if (o && o !== nid) victims[o] = (victims[o] || 0) + 1;
    }

    const before = Game.nationDemographics(nid);
    const added = Game.demographics(targets);
    const after = Game.demographics([...n.counties, ...targets]);
    /*
     * The blue-shell surcharge, the force ratio AND the reach penalty —
     * straight off the plan the player was shown (M9.3). `scoreMult` scales the
     * civil-war score, where low is a win for the attacker, so a prepared Field
     * army makes the same annexation go better and an unprepared one makes it
     * go worse. Before M6.5 the only input to a war was how big you were.
     *
     * Read from `plan`, not recomputed. This line used to build its own version
     * of the expression in planAnnex, and the two had drifted: the resolver had
     * the shell the preview lacked, and the preview had the reach the resolver
     * lacked.
     */
    const res = CivilWar.resolve(before, added, after, {
      scoreMult: plan.scoreMult, rng, tune: T(tune),
    });

    let taken = targets, born = [];
    // Read before anything moves: after `breakApart` there is nothing to ask.
    const heldBy = new Map(targets.map((f) => [f, Game.getOwner(f)]));
    Game.batch(() => {
      if (!res.triggered || res.outcome === 'victory') {
        Game.moveCounties(targets, nid, { reason: res.triggered ? 'war' : 'annex' });
      } else if (res.outcome === 'partial') {
        taken = partialSubset(nid, targets, res.score, tune);
        Game.moveCounties(taken, nid, { reason: 'war' });
      } else {
        taken = [];
        born = Game.breakApart(targets, { exclude: nid, reason: 'fragment', rng });
        recordBirths(born, heldBy, { tune: T(tune) });
      }
      if (res.triggered && res.outcome === 'collapse') {
        /*
         * THE AGGRESSOR BLEEDS, not the defender. A collapse is your own
         * offensive falling apart; charging the victims for it — which is what
         * this did until M6.3, because the branch was written once for the
         * winning cases and reused — paid the loser's bill to the winner and
         * handed the defender a population loss for successfully defending.
         */
        Game.applyCivilWarCost(nid, null, res.score);
      } else if (res.triggered) {
        const share = res.outcome === 'partial' ? Math.round(res.score / 2) : res.score;
        for (const [oid, count] of Object.entries(victims)) {
          if (Game.getNation(oid)) {
            Game.applyCivilWarCost(oid, nid, Math.round(share * (count / targets.length)));
          }
        }
      }
    });
    if (born.length) TurnSystem.insertAfter(nid, born);

    /*
     * The civil-war roll IS the explanation, and it already exists: dice, points
     * and the flip magnitude are what `CivilWar.resolve` returned. Logging them
     * as `terms` costs one array literal and turns a six-second toast into a
     * permanent, inspectable account of why the annexation went the way it did.
     */
    const terms = res.triggered ? [
      { name: 'Dice', value: res.diceCount, key: 'war.dicePerFlipPoint' },
      { name: 'Roll', value: res.diceSum, key: 'war.diceSides' },
      { name: 'Points', value: res.points, key: 'war.pointsScale' },
      { name: 'Flip magnitude', value: res.flipMagnitude, key: 'war.diceFlipFloor' },
      { name: 'Score', value: res.score, key: 'war.victoryBand' },
    ] : null;
    /*
     * ...AND A PACT YOU SIGNED WITH THE VICTIM IS TORN UP BY THIS (M11.2).
     *
     * Recorded HERE, in the resolver, for the same reason the ledger and the
     * relations memories are: this is the one place that knows what actually
     * happened. The breach is a separate, heavier memory than the annexation
     * itself — being taken from by somebody who promised not to is worse than
     * being taken from by somebody who never promised anything, and that
     * asymmetry is the entire reason a treaty is worth signing.
     */
    for (const victim of Object.keys(victims)) {
      const p = typeof Pacts !== 'undefined' ? Pacts.live(nid, victim) : null;
      if (!p || p.kind !== 'nonaggression') continue;
      Pacts.breach(nid, victim);
      Relations.record(victim, nid, 'reneged', { tune: T(tune) });
      log({ subject: nid, kind: 'treaty', delta: -1, partner: victim,
        text: `${nameOf(nid)} tore up its non-aggression pact with ${nameOf(victim)}.` });
    }
    remember(nid, Object.keys(victims), res.triggered ? 'warred' : 'annexed',
      Math.max(1, taken.length), tune);
    const who = nameOf(nid);
    const entry = log({
      subject: nid, kind: res.triggered ? 'war' : 'annex', delta: taken.length, terms,
      text: res.triggered
        ? `${who} fought a civil war over ${targets.length} ${areaWord(targets.length)} — `
          + `${String(res.outcome).replace('_', ' ')}.`
        : `${who} annexed ${targets.length} ${areaWord(targets.length)} peacefully.`,
      outcome: res.triggered ? res.outcome : 'peaceful',
      from: res.fromIdeology, to: res.toIdeology,
    });
    return { ...plan, ok: true, res, taken, born, victims, events: [entry] };
  }

  /**
   * What a partial victory keeps: a contiguous front advancing from the
   * attacker's own border, sized by the score.
   *
   * The front used to be "whatever the Set iterated to", which could hand a
   * winner a detached pocket on the far side of the contested ground.
   */
  function partialSubset(nid, chosen, score, tune) {
    if (!chosen.length) return [];
    const pool = new Set(chosen);
    const want = Math.max(1, Math.round(CivilWar.partialKeepFraction(score, T(tune)) * chosen.length));
    const own = nationOf(nid).counties;
    const seeds = chosen
      .filter((f) => Game.countyNeighbors(f).some((nb) => own.has(nb)))
      .sort((a, b) => Game.countyPop(b) - Game.countyPop(a));
    if (!seeds.length) seeds.push(Game.largestCounty(chosen));

    const held = new Set();
    const queue = [...seeds];
    while (queue.length && held.size < want) {
      const cur = queue.shift();
      if (held.has(cur) || !pool.has(cur)) continue;
      held.add(cur);
      for (const nb of Game.countyNeighbors(cur)) if (pool.has(nb) && !held.has(nb)) queue.push(nb);
    }
    return [...held];
  }

  /* ------------------------------------------------------------------ */
  /* unite                                                              */
  /* ------------------------------------------------------------------ */

  /**
   * Who leaves if the union fails, and which way.
   *
   * An Area DEFECTS to the target if its politics sit closer to the target's
   * than to yours and it touches the target; it SECEDES if its affinity to you
   * falls below `war.splinterAffinity` and it is cut off. Both continuous, which
   * is what lets one number decide how fissile the map is.
   */
  function planSplinter(S, target, tune) {
    const sCentre = Ideology.centroid(Game.nationDemographics(S).mix);
    const tCentre = Ideology.centroid(Game.nationDemographics(target).mix);
    const threshold = T(tune).get('war.splinterAffinity');
    const own = [...nationOf(S).counties];
    const touchesT = (c) => Game.countyNeighbors(c).some((nb) => Game.getOwner(nb) === target);

    const toS = {}, toT = {};
    for (const c of own) {
      const p = Game.areaPolitics(c);
      const centre = p ? p.centroid : sCentre;
      toS[c] = Ideology.affinity(centre, sCentre);
      toT[c] = Ideology.affinity(centre, tCentre);
    }
    const defect = own.filter((c) => toT[c] > toS[c] && touchesT(c));
    const defectSet = new Set(defect);
    const rest = own.filter((c) => !defectSet.has(c));
    const secede = rest.filter((c) => toS[c] < threshold && !touchesT(c));
    const seceded = new Set(secede);
    return { defect, secede, remnant: rest.filter((c) => !seceded.has(c)) };
  }

  /** @param intent {type:'unite', nid, target} */
  function planUnite(intent, tune) {
    const { nid, target } = intent;
    const me = nationOf(nid), them = nationOf(target);
    if (!me || !them) return no('That nation no longer exists.');
    if (nid === target) return no('You cannot unite with yourself.');
    if (!Game.adjacentNations(nid).includes(target)) {
      return no(`${them.name} is not within reach.`);
    }
    /*
     * THE MISSING CLOCK. Annex, release and changing course all have a cooldown;
     * unite had none, and it is the only action that can hand over an entire
     * nation. A free re-roll every turn makes any probability under 100% equal
     * to 100% given enough turns, which is not a balance problem so much as the
     * absence of a rule.
     *
     * It ran on the honour system until M6.3, because the human was operating
     * all fifty-one seats and nobody was going to spam a 30% union for ten turns
     * to find out. The AI did it on its first run: 35 of 53 nations opened by
     * proposing a union, and the map would have consolidated inside five rounds.
     *
     * It is charged on the ATTEMPT, not on the failure, so a nation cannot walk
     * along its border absorbing a neighbour a turn.
     */
    const ucd = uniteCooldownLeft(nid, tune);
    if (ucd > 0) {
      return no(`Talks with your neighbours are still going on — ${ucd} more world ${ucd === 1 ? 'turn' : 'turns'}.`);
    }
    /*
     * STANDING MOVES THE ODDS. A nation that likes you is likelier to accept
     * union and one that does not is likelier to come apart in the attempt.
     * Multiplied rather than added, so it scales a probability and the result
     * stays inside [0,1] without a clamp doing the work.
     */
    const standing = Relations.score(target, nid, T(tune));
    const chance = CivilWar.unitePeaceChance(
      Game.nationDemographics(nid), Game.nationDemographics(target), Game.blueShell(nid), T(tune))
      * (1 + T(tune).get('rel.uniteSwing') * standing);
    const fallout = planSplinter(nid, target, tune);
    const gained = them.counties.size;
    const prize = Game.nationDemographics(target);
    /*
     * A UNION HAS A PRICE. Buying out a government costs a share of what that
     * government is worth — pensions, guarantees, a settlement its ministers
     * will sign — and it is charged whether or not the union then holds,
     * because you paid for the attempt.
     *
     * It cost nothing at all until M6.3, which made it strictly dominant: free,
     * unconstrained by the treasury, and it takes a whole nation where an
     * annexation takes three Areas. No human ever noticed, because a human
     * playing all fifty-one seats had no reason to grind the same 40% roll.
     */
    const cost = prize.gdp * T(tune).get('unite.costGdpShare');
    if (me.treasury < cost) {
      return no(`A settlement with ${them.name} would cost ${Math.round(cost / 1e9)}bn and the treasury `
        + `holds ${Math.round(Math.max(0, me.treasury) / 1e9)}bn.`,
      { cost, chance, fallout, target });
    }
    return {
      ok: true, reason: null, cost, chance, fallout, target, standing,
      effects: [
        { label: 'Areas gained if it works', value: gained },
        // The PRIZE, under the same labels every other move uses for it. It was
        // missing until M6.3, which under-informed the human — a union preview
        // that does not say how many people you would gain is half a preview —
        // and left the AI scoring unions on the odds alone, so every union
        // looked equally attractive whatever was on the other side of it.
        { label: 'Population', value: prize.pop },
        { label: 'GDP', value: prize.gdp },
        { label: 'Chance', value: chance },
        { label: 'How they see you', value: standing },
        { label: 'Areas that would defect', value: fallout.defect.length },
        { label: 'Areas that would secede', value: fallout.secede.length },
      ],
    };
  }

  function resolveUnite(intent, rng, tune) {
    const plan = planUnite(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, target } = intent;
    if (!Game.spend(nid, plan.cost)) return no('The treasury moved before the offer went out.');
    nationOf(nid).lastUniteTurn = World.getTurn();
    const peaceful = rng.stream('unite').chance(plan.chance);
    const odds = { name: 'Chance of a peaceful union', value: plan.chance, key: 'war.unitePeaceBase' };
    const theirName = nameOf(target), myName = nameOf(nid);
    if (peaceful) {
      const gained = nationOf(target).counties.size;
      // Everybody notices a country leaving the map, including the ones who
      // were not in it. The victim is gone, so there is nobody to resent it.
      remember(nid, [], 'absorbed', Math.max(1, gained / 10), tune);
      Game.mergeInto(nid, target);
      const entry = log({
        subject: nid, kind: 'unite', delta: gained, terms: [odds], absorbed: target,
        text: `${theirName} united into ${myName}.`,
      });
      return { ...plan, ok: true, peaceful: true, created: [], events: [entry] };
    }
    const score = CivilWar.uniteSeverity(plan.chance, T(tune));
    const created = Game.batch(() => {
      Game.moveCounties(plan.fallout.defect, target, { silent: true, reason: 'defect' });
      const born = Game.breakApart(plan.fallout.secede, { exclude: nid, reason: 'secede', rng });
      recordBirths(born, nid, { tune: T(tune) });
      Game.applyCivilWarCost(nid, target, score);
      return born;
    });
    TurnSystem.insertAfter(nid, created);
    Relations.record(target, nid, 'broke',
      { scale: Math.max(1, plan.fallout.defect.length / 3), tune });
    const entry = log({
      subject: nid, kind: 'unite', target, failed: true,
      delta: -(plan.fallout.defect.length + plan.fallout.secede.length),
      terms: [odds, { name: 'Severity', value: score, key: 'war.pointsScale' }],
      text: `${myName}'s bid to unite ${theirName} failed and the union fell apart: `
        + `${plan.fallout.defect.length} Areas defected and ${created.length} new nations broke away.`,
    });
    return { ...plan, ok: true, peaceful: false, score, created, events: [entry] };
  }

  /* ------------------------------------------------------------------ */
  /* release                                                            */
  /* ------------------------------------------------------------------ */

  /**
   * Will `recipient` accept a released fragment from `giver`?
   *
   * The guardrail: without it, releasing counties is a way to DUMP them on a
   * rival. Political compatibility, a standing trade relationship, or a
   * recipient small enough that any territory beats ceasing to exist.
   */
  function acceptsRelease(giver, tune) {
    return (recipient, comp) => {
      const r = nationOf(recipient);
      if (!r) return false;
      const them = Game.nationDemographics(recipient);
      const it = Game.demographics(new Set(comp));
      if (Ideology.mixAffinity(them.mix, it.mix) >= T(tune).get('release.acceptAffinity')) return true;
      /*
       * Or they simply think well of you. This replaced "there is a trade deal
       * on the books", which was a proxy for exactly this and could not tell a
       * long partnership from one transaction ten turns ago.
       */
      if (Relations.score(recipient, giver, T(tune)) >= T(tune).get('rel.acceptFriend')) return true;
      return r.counties.size <= T(tune).get('release.desperateAreas');
    };
  }

  /**
   * @param intent {type:'autonomy', nid, areas:[fips], grant?:boolean}
   *
   * THE OTHER VALVE. Garrison and autonomy are the same trade run in opposite
   * directions: one buys quiet with troops and pays in civil liberties, the
   * other buys it with self-rule and pays in revenue and in Authority. Release
   * is the third and the most final — it gives the ground away.
   *
   * A grant is REVERSIBLE, unlike a release, and that is the whole reason to
   * have both: autonomy is what you offer a region you still intend to keep.
   */
  function planAutonomy(intent, tune) {
    const { nid, areas = [], grant = true } = intent;
    const n = nationOf(nid);
    if (!n) return no('That nation no longer exists.');
    const cd = cooldown(nid, 'lastAutonomyTurn', 'autonomy.cooldownTurns', tune);
    if (cd > 0) return no(`The last settlement is still being negotiated — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);
    if (!areas.length) return no('Nothing selected.');
    const budget = T(tune).get('autonomy.budgetAreas');
    if (areas.length > budget) return no(`You may settle at most ${budget} Areas at once.`);
    for (const f of areas) {
      if (!n.counties.has(f)) return no('You do not hold that Area.');
      if (Game.isAutonomous(f) === !!grant) {
        return no(grant ? 'That Area already governs itself.' : 'That Area does not govern itself.');
      }
    }
    const held = Game.autonomousCount(nid);
    const after = grant ? held + areas.length : held - areas.length;
    const cap = Math.floor(n.counties.size * T(tune).get('autonomy.maxShare'));
    if (grant && after > cap) {
      return no(`A state that governs none of itself is not a state: at most ${cap} of your `
        + `${n.counties.size} Areas may be autonomous, and ${held} already are.`);
    }
    const d = Game.demographics(areas);
    const forgone = d.gdp * T(tune).get('econ.taxRate') * (1 - T(tune).get('autonomy.taxShare'));
    return {
      ok: true, reason: null, cost: 0, targets: areas, grant, forgone,
      effects: [
        { label: 'Areas governing themselves', value: grant ? areas.length : -areas.length },
        { label: 'Revenue', value: grant ? -forgone : forgone },
        { label: 'Grievance answered', value: (grant ? 1 : -1) * T(tune).get('autonomy.sentimentRelief') },
      ],
    };
  }

  function resolveAutonomy(intent, rng, tune) {
    const plan = planAutonomy(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid } = intent;
    const changed = Game.setAutonomy(plan.targets, plan.grant);
    nationOf(nid).lastAutonomyTurn = World.getTurn();
    const entry = log({
      subject: nid, kind: 'autonomy', delta: plan.grant ? changed : -changed,
      terms: [{ name: 'Revenue given up', value: -plan.forgone, key: 'autonomy.taxShare' },
              { name: 'Grievance answered', value: T(tune).get('autonomy.sentimentRelief'),
                key: 'autonomy.sentimentRelief' }],
      text: plan.grant
        ? `${nameOf(nid)} granted self-rule to ${changed} ${areaWord(changed)}.`
        : `${nameOf(nid)} took back direct rule over ${changed} ${areaWord(changed)}.`,
    });
    return { ...plan, ok: true, changed, events: [entry] };
  }

  /** @param intent {type:'release', nid, areas:[fips]} */
  function planRelease(intent, tune) {
    const { nid, areas = [] } = intent;
    const n = nationOf(nid);
    if (!n) return no('That nation no longer exists.');
    const cd = releaseCooldownLeft(nid, tune);
    if (cd > 0) return no(`The last handover is still being arranged — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);
    if (!areas.length) return no('Nothing selected.');
    if (areas.length >= n.counties.size) return no('You cannot release your last Area.');
    const budget = Math.min(T(tune).get('release.budgetAreas'), n.counties.size - 1);
    if (areas.length > budget) return no(`You may release at most ${budget} Areas in one turn.`);
    for (const f of areas) if (!n.counties.has(f)) return no('You do not hold that Area.');

    const d = Game.demographics(areas);
    /*
     * A HANDOVER HAS A PRICE: assets written off, guarantees, pensions, a border
     * to draw. Charged on the ground being released rather than on the whole
     * nation, so letting go of an empty county is cheap and letting go of a
     * metro region is not.
     *
     * It was free until M6.3, and free made it dominant — see
     * `release.costGdpShare`. It also has a second effect worth naming: a nation
     * in real trouble may now be unable to AFFORD to let go, which is a bind
     * worth having in a game about holding a country together.
     */
    const cost = d.gdp * T(tune).get('release.costGdpShare');
    const n2 = nationOf(nid);
    if (n2.treasury < cost) {
      return no(`Handing over ${areas.length} ${areas.length === 1 ? 'Area' : 'Areas'} means a settlement of `
        + `${Math.round(cost / 1e9)}bn and the treasury holds ${Math.round(Math.max(0, n2.treasury) / 1e9)}bn.`,
      { cost, targets: areas });
    }
    return {
      ok: true, reason: null, cost, targets: areas,
      effects: [
        { label: 'Areas', value: -areas.length },
        { label: 'Population', value: -d.pop },
        { label: 'GDP', value: -d.gdp },
      ],
    };
  }

  function resolveRelease(intent, rng, tune) {
    const plan = planRelease(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, areas } = intent;
    const n = nationOf(nid);
    if (!Game.spend(nid, plan.cost)) return no('The treasury moved before the handover was signed.');
    n.lastReleaseTurn = World.getTurn();
    const wasOwner = new Map(areas.map((f) => [f, Game.getOwner(f)]));
    const born = Game.batch(() =>
      Game.breakApart(areas, { exclude: nid, accept: acceptsRelease(nid, tune), reason: 'release', rng }));
    TurnSystem.insertAfter(nid, born);

    /*
     * LETTING GO IS RECOGNITION (M7.8), and this is the cleanest difference
     * between the two ways a nation can be born. A state that DECLARED
     * independence spends its first years as a pariah while the parent calls it
     * a rebellion; a state that was RELEASED is a country from the first day,
     * because the only government whose opinion the world is waiting on has
     * already given it. Nothing else about the two moves says that as plainly.
     */
    recordBirths(born, nid, { recognised: true, tune: T(tune) });
    const bornSet = new Set(born);
    let toNew = 0, toNeighbours = 0, refused = 0;
    const thanked = new Map();
    for (const [f, was] of wasOwner) {
      const now = Game.getOwner(f);
      if (now === was) refused++;
      else if (bornSet.has(now)) toNew++;
      else { toNeighbours++; thanked.set(now, (thanked.get(now) || 0) + 1); }
    }
    // Gratitude, and the reason release is not only a way to shed a problem:
    // the neighbour who takes the Areas remembers who handed them over.
    for (const [who, n2] of thanked) Relations.record(who, nid, 'granted', { scale: n2, tune });
    const entry = log({
      subject: nid, kind: 'release', delta: -areas.length, born: born.length,
      terms: [{ name: 'Refused by every neighbour', value: refused, key: 'release.acceptAffinity' }],
      text: `${nameOf(nid)} released ${areas.length} ${areaWord(areas.length)}: `
        + `${toNew} into new nations, ${toNeighbours} to neighbours, ${refused} refused.`,
    });
    return { ...plan, ok: true, born, toNew, toNeighbours, refused, events: [entry] };
  }

  /* ------------------------------------------------------------------ */
  /* recognise                                                          */
  /* ------------------------------------------------------------------ */

  /**
   * @param intent {type:'recognise', nid, target}
   *
   * ADMIT THAT SOMEBODY ELSE IS A COUNTRY. It costs no money and takes no
   * ground, and it is still a decision, because the state the target broke away
   * from will hold it against you — going first for somebody else's rebels is
   * the cheapest favour in the game and the one with the longest memory.
   *
   * It matters most when YOU are the parent. Everybody else is waiting to see
   * whether you will keep calling them a rebellion, and the turn you stop, the
   * queue moves: that is the `recognition.wParent` term, and it is the largest
   * single term in the decision fifty other capitals are making.
   */
  function planRecognise(intent, tune) {
    const { nid, target } = intent;
    const n = nationOf(nid), t2 = nationOf(target);
    if (!n) return no('That nation no longer exists.');
    if (!t2) return no('There is no such nation.');
    if (nid === target) return no('A nation does not need to recognise itself.');
    if (typeof Recognition === 'undefined') return no('Recognition is not part of this game.');
    if (Recognition.recognises(nid, target)) return no(`You already recognise ${nameOf(target)}.`);

    const before = Recognition.scalar(target);
    const share = Game.nationWeight(nid) / Math.max(1e-9, continentWeight() - Game.nationWeight(target));
    const parent = Recognition.parentOf(target);
    const angers = parent && parent !== nid && nationOf(parent) && !Recognition.recognises(parent, target)
      ? parent : null;
    const effects = [
      { label: 'Their legitimacy', value: Math.min(1, before + share) - before },
      { label: 'How they will see you', value: T(tune).get('rel.magRecognised') },
    ];
    if (angers) {
      effects.push({ label: `How ${nameOf(angers)} will see you`, value: T(tune).get('rel.magBetrayed') });
    }
    return {
      ok: true, reason: null, cost: 0, target, parent: angers, before,
      unlocks: parent === nid, effects,
    };
  }

  /** The whole board's weight, for pricing what one nation's word is worth. */
  function continentWeight() {
    let total = 0;
    for (const [id] of Game.nations) total += Game.nationWeight(id);
    return total;
  }

  function resolveRecognise(intent, rng, tune) {
    const plan = planRecognise(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, target } = intent;
    Recognition.grant(nid, target, { tune: T(tune) });
    const after = Recognition.scalar(target);
    const entry = log({
      subject: nid, kind: 'recognise', delta: 1, target,
      terms: [{ name: 'Their legitimacy', value: after, key: 'recognition.tradeFloor' },
              { name: 'How they will see you', value: T(tune).get('rel.magRecognised'),
                key: 'rel.magRecognised' }],
      text: plan.unlocks
        ? `${nameOf(nid)} recognised ${nameOf(target)}, the state that broke away from it.`
        : `${nameOf(nid)} recognised ${nameOf(target)}.`,
    });
    return { ...plan, ok: true, after, events: [entry] };
  }

  /* ------------------------------------------------------------------ */
  /* govern (appeasement)                                               */
  /* ------------------------------------------------------------------ */

  /** @param intent {type:'govern', nid, ideology} */
  function planGovern(intent, tune) {
    const { nid, ideology } = intent;
    const n = nationOf(nid);
    if (!n) return no('That nation no longer exists.');
    const to = Ideology.index(ideology);
    const from = Ideology.index(n.gov.rulingIdeology);
    if (to < 0) return no(`"${ideology}" is not an ideology.`);
    if (to === from) return no('That is already your governing ideology.');

    const cd = n.gov.lastChange == null ? 0
      : T(tune).get('gov.changeCooldown') - (World.getTurn() - n.gov.lastChange);
    if (cd > 0) return no(`The government changed course too recently — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);

    const d = Game.nationDemographics(nid);
    const share = d.pop > 0 ? d.mix[to] / d.pop : 0;
    const need = T(tune).get('gov.changeMinShare');
    const distance = 1 - Ideology.affinity(from, to);
    const cost = d.gdp * T(tune).get('gov.changeCost') * distance;

    if (share < need) {
      return no(`Only ${(share * 100).toFixed(1)}% of your people hold that ideology; a government needs `
        + `${(need * 100).toFixed(0)}% to claim the mandate.`, { cost, share, distance });
    }
    if (n.treasury < cost) {
      return no(`Changing course would cost ${Math.round(cost / 1e9)}bn and you have `
        + `${Math.round(n.treasury / 1e9)}bn.`, { cost, share, distance });
    }
    return {
      ok: true, reason: null, cost, share, distance, to: ideology, from: Ideology.idAt(from),
      effects: [
        { label: 'Support', value: share },
        { label: 'Distance moved', value: distance },
        { label: 'Authority', value: -T(tune).get('gov.changeAuthorityHit') * distance },
      ],
    };
  }

  function resolveGovern(intent, rng, tune) {
    const plan = planGovern(intent, tune);
    if (!plan.ok) return { ...plan, events: [] };
    /*
     * The ONE action that does not log from here: `Game.changeRulingIdeology`
     * already writes a richer entry, because changing course also moves the
     * Authority stock and that shock belongs to the same record. Logging it
     * again here reported one change twice, which is the failure mode a single
     * owner exists to prevent — so the owner is Game, and this returns its
     * entry rather than writing a second one.
     */
    const res = Game.changeRulingIdeology(intent.nid, intent.ideology, { rng });
    if (!res.ok) return { ...plan, ok: false, reason: res.message, events: [] };
    return { ...plan, ok: true, reason: null,
      cost: res.cost == null ? plan.cost : res.cost,
      events: [Ledger.latest(1)[0]] };
  }

  /* ------------------------------------------------------------------ */
  /* the front door                                                     */
  /* ------------------------------------------------------------------ */

  const PLANNERS = { annex: planAnnex, unite: planUnite, release: planRelease, govern: planGovern,
                    autonomy: planAutonomy, recognise: planRecognise, trade: planTrade,
                    treaty: planTreaty, aid: planAid };
  const RESOLVERS = { annex: resolveAnnex, unite: resolveUnite, release: resolveRelease,
                      govern: resolveGovern, autonomy: resolveAutonomy, recognise: resolveRecognise,
                      trade: resolveTrade, treaty: resolveTreaty, aid: resolveAid };

  /** Pure. Never draws, never rolls, never mutates. */
  function plan(intent, tune) {
    const f = PLANNERS[intent && intent.type];
    return f ? f(intent, tune) : no(`Unknown move "${intent && intent.type}".`);
  }

  /** Mutates. `rng` is explicit so a replay is a replay. */
  function resolve(intent, rng, tune) {
    const f = RESOLVERS[intent && intent.type];
    return f ? f(intent, rng, tune) : no(`Unknown move "${intent && intent.type}".`);
  }

  /**
   * Every legal move a nation could make right now, as intents.
   *
   * The AI's candidate list, and the thing that makes "what can I do" one
   * question rather than four. Deliberately NOT scored — scoring is policy and
   * belongs in js/ai.js; this is the rules.
   */
  function legal(nid, opts = {}, tune) {
    const out = [];
    const n = nationOf(nid);
    if (!n) return out;
    const budget = T(tune).get('annex.budgetAreas');

    if (!annexCooldownLeft(nid, tune)) {
      // One intent per bordering nation, taking the Areas of theirs nearest to
      // you — a full power set of 3-Area combinations is thousands of intents
      // for a decision that turns on which neighbour, not which three Areas.
      // Out-of-reach ground is not a candidate: the AI should not spend its
      // scoring on moves the rules will refuse, and a list that offers them is
      // a list that teaches the wrong thing.
      // Out of reach is not a candidate, and neither is a nation that could
      // swat you (M9.3) — `plan` refuses both, and a candidate list that
      // offers a move the rules refuse teaches the scorer the wrong thing.
      const blocked = untouchable(nid, tune);
      const targets = [...Game.annexTargets(nid)]
        .filter((f) => typeof Projection === 'undefined' || Projection.inRange(nid, f, T(tune)));
      const byOwner = {};
      for (const f of targets) {
        const o = Game.getOwner(f);
        if (o && !blocked.has(o)) (byOwner[o] = byOwner[o] || []).push(f);
      }
      for (const [o, areas] of Object.entries(byOwner)) {
        const pick = areas
          .sort((a, b) => Game.countyPop(b) - Game.countyPop(a))
          .slice(0, budget);
        out.push({ type: 'annex', nid, areas: pick, against: o });
      }
    }
    if (!uniteCooldownLeft(nid, tune)) {
      for (const other of Game.adjacentNations(nid)) out.push({ type: 'unite', nid, target: other });
    }

    /*
     * TRADE, with every neighbour it is not on cooldown with (M11.1).
     *
     * One candidate per bordering nation, exactly like unite: the deal itself is
     * not a choice — the flows are whatever the two economies happen to mismatch
     * on — so the only decision is WHO, and that is one intent each.
     *
     * `plan` refuses the ones that cannot happen (nothing to trade, no mutual
     * recognition), which is the same division of labour every other move here
     * uses: `legal` is cheap and generous, `plan` is the rulebook.
     */
    for (const other of Game.adjacentNations(nid)) {
      if (!tradeCooldownLeft(nid, other, tune)) out.push({ type: 'trade', nid, target: other });
    }

    /*
     * TREATIES AND AID (M11.2), the two Influence verbs.
     *
     * A treaty candidate per neighbour without one; `plan` refuses where the
     * other side will not sign. Aid is offered to neighbours too — not to the
     * whole continent — because a patron relationship you cannot reach is a
     * cheque posted into the dark, and because fifty-one aid candidates per
     * nation per turn is a scoring pass nobody asked for.
     */
    if (Complexity.enabled('politics') && !cooldownOn(nid, 'lastTreatyTurn', 'treaty.cooldownTurns', tune)) {
      for (const other of Game.adjacentNations(nid)) {
        if (!Pacts.live(nid, other)) out.push({ type: 'treaty', nid, target: other, kind: 'nonaggression' });
      }
    }
    if (Complexity.enabled('politics') && !cooldownOn(nid, 'lastAidTurn', 'aid.cooldownTurns', tune)) {
      for (const other of Game.adjacentNations(nid)) out.push({ type: 'aid', nid, target: other });
    }

    /*
     * RELEASE is the valve, and leaving it out of the candidate list is what
     * makes an AI spiral: a fraying nation with nothing on the list but
     * expansion keeps expanding, which is the one move that makes fraying
     * worse.
     *
     * Canonicalised the same way the annex candidate is — the Areas closest to
     * leaving anyway, up to the budget. That is a representative candidate and
     * not the only legal release; a caller with its own opinion about which
     * ground to shed passes its own intent, and `plan` judges it by the same
     * rules.
     */
    if (Complexity.enabled('movements') && !releaseCooldownLeft(nid, tune) && n.counties.size > 1) {
      const budget = Math.min(T(tune).get('release.budgetAreas'), n.counties.size - 1);
      const worst = [...n.counties]
        .map((f) => [f, Sentiment.pressure(f)])
        .filter((x) => x[1] > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, budget)
        .map((x) => x[0]);
      if (worst.length) out.push({ type: 'release', nid, areas: worst });
    }

    /*
     * Autonomy over the same ground, canonicalised the same way. It is offered
     * beside release rather than instead of it because they are different
     * answers to the same problem — one keeps the Area and one does not — and
     * the choice between them is exactly what the scorer is for.
     */
    if (Complexity.enabled('movements') && !cooldown(nid, 'lastAutonomyTurn', 'autonomy.cooldownTurns', tune)) {
      const cap = Math.floor(n.counties.size * T(tune).get('autonomy.maxShare'));
      const room = cap - Game.autonomousCount(nid);
      if (room > 0) {
        const budget = Math.min(T(tune).get('autonomy.budgetAreas'), room);
        const worst = [...n.counties]
          .filter((f) => !Game.isAutonomous(f))
          .map((f) => [f, Sentiment.pressure(f)])
          .filter((x) => x[1] > 0)
          .sort((a, b) => b[1] - a[1])
          .slice(0, budget)
          .map((x) => x[0]);
        if (worst.length) out.push({ type: 'autonomy', nid, areas: worst, grant: true });
      }
    }
    if (!opts.skipGovern && Complexity.enabled('politics')) {
      for (const x of Ideology.all()) {
        if (x.id !== n.gov.rulingIdeology) out.push({ type: 'govern', nid, ideology: x.id });
      }
    }
    /*
     * `recognise` IS DELIBERATELY NOT HERE. An AI's recognitions are not a move
     * competing for the one action it gets each turn — they are `Recognition.tick`,
     * where every capital makes up its own mind about every newcomer every turn,
     * priced by standing and kinship and how long the thing has lasted. A nation
     * that spent its whole turn signing a paper about a three-Area rump would be
     * a worse opponent, and fifty of them doing it would be an unreadable
     * newspaper. The player's is a move because the player's is a decision.
     */
    return out;
  }

  return {
    plan, resolve, legal,
    planSplinter, partialSubset, acceptsRelease,
    annexCost, annexCooldownLeft, releaseCooldownLeft, uniteCooldownLeft,
    // The one implementation of the 4x rule (M9.3). The UI asks it the same
    // question `plan` and `legal` ask, rather than answering it a second way.
    tooStrongToAnnex, untouchable,
    // ...and of the trade rules (M11.1), for the same reason.
    tradeFlows, applyCapacity, tradeCooldownLeft, markTraded,
    autonomyCooldownLeft: (nid, tune) => cooldown(nid, 'lastAutonomyTurn', 'autonomy.cooldownTurns', tune),
  };
})();
