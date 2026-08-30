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
  const T = () => window.TUNE;
  const nationOf = (nid) => Game.getNation(nid);

  /** A refusal, in the one shape every caller reads. */
  const no = (reason, extra) => ({ ok: false, reason, cost: 0, effects: [], ...extra });

  /* ------------------------------------------------------------------ */
  /* shared preconditions                                               */
  /* ------------------------------------------------------------------ */

  function cooldown(nid, stamp, key) {
    const n = nationOf(nid);
    if (!n || !Number.isFinite(n[stamp])) return 0;
    return Math.max(0, T().get(key) - (World.getTurn() - n[stamp]));
  }

  const annexCooldownLeft = (nid) => cooldown(nid, 'lastAnnexTurn', 'annex.cooldownTurns');
  const releaseCooldownLeft = (nid) => cooldown(nid, 'lastReleaseTurn', 'release.cooldownTurns');

  /**
   * What one annexation costs the treasury. Flat per Area plus a per-head term,
   * so swallowing a metro Area costs more than swallowing empty ground; the
   * leader tier pays a surcharge on top.
   */
  function annexCost(areas, shell) {
    const pop = areas.length ? Game.demographics(areas).pop : 0;
    const base = areas.length * T().get('annex.costPerArea') + pop * T().get('annex.costPopScale');
    return base * (1 + T().get('annex.shellCostMult') * (shell || 0));
  }

  /* ------------------------------------------------------------------ */
  /* annex                                                              */
  /* ------------------------------------------------------------------ */

  /**
   * @param intent {type:'annex', nid, areas:[fips]}
   *
   * The civil-war assessment is part of the PREVIEW, not just the result: a
   * player deciding whether to take four Areas needs to know it would flip their
   * governing ideology before they commit, and the AI needs the same number to
   * decide whether it is worth it. `CivilWar.assess` is pure, so both get it.
   */
  function planAnnex(intent) {
    const { nid, areas = [] } = intent;
    const n = nationOf(nid);
    if (!n) return no('That nation no longer exists.');
    const cd = annexCooldownLeft(nid);
    if (cd > 0) return no(`Your armies are still regrouping — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);
    if (!areas.length) return no('Nothing selected.');

    const budget = T().get('annex.budgetAreas');
    if (areas.length > budget) return no(`You may take at most ${budget} Areas in one turn.`);

    const own = n.counties;
    const targets = [];
    for (const f of areas) {
      if (own.has(f)) return no('You already hold that Area.');
      if (!Game.county[f]) return no('That Area does not exist.');
      targets.push(f);
    }

    const shell = Game.blueShell(nid);
    const cost = annexCost(targets, shell);
    const affordable = n.treasury >= cost;

    const before = Game.nationDemographics(nid);
    const added = Game.demographics(targets);
    const after = Game.demographics([...own, ...targets]);
    const war = CivilWar.assess(before, added, after, T());

    return {
      ok: affordable,
      reason: affordable ? null
        : `Mobilising costs ${Math.round(cost / 1e9)}bn and the treasury holds ${Math.round(Math.max(0, n.treasury) / 1e9)}bn.`,
      cost, shell, targets, war,
      effects: [
        { label: 'Areas', value: targets.length },
        { label: 'Population', value: added.pop },
        { label: 'GDP', value: added.gdp },
        { label: 'Civil war', value: war.triggered ? 1 : 0 },
      ],
    };
  }

  function resolveAnnex(intent, rng) {
    const plan = planAnnex(intent);
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
    const res = CivilWar.resolve(before, added, after,
      { scoreMult: 1 + (plan.shell || 0), rng, tune: T() });

    let taken = targets, born = [];
    Game.batch(() => {
      if (!res.triggered || res.outcome === 'victory') {
        Game.moveCounties(targets, nid, { reason: res.triggered ? 'war' : 'annex' });
      } else if (res.outcome === 'partial') {
        taken = partialSubset(nid, targets, res.score);
        Game.moveCounties(taken, nid, { reason: 'war' });
      } else {
        taken = [];
        born = Game.breakApart(targets, { exclude: nid, reason: 'fragment' });
      }
      if (res.triggered) {
        const share = res.outcome === 'partial' ? Math.round(res.score / 2) : res.score;
        for (const [oid, count] of Object.entries(victims)) {
          if (Game.getNation(oid)) {
            Game.applyCivilWarCost(oid, nid, Math.round(share * (count / targets.length)));
          }
        }
      }
    });
    if (born.length) TurnSystem.insertAfter(nid, born);

    return { ...plan, ok: true, res, taken, born, victims, events: [] };
  }

  /**
   * What a partial victory keeps: a contiguous front advancing from the
   * attacker's own border, sized by the score.
   *
   * The front used to be "whatever the Set iterated to", which could hand a
   * winner a detached pocket on the far side of the contested ground.
   */
  function partialSubset(nid, chosen, score) {
    if (!chosen.length) return [];
    const pool = new Set(chosen);
    const want = Math.max(1, Math.round(CivilWar.partialKeepFraction(score, T()) * chosen.length));
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
  function planSplinter(S, target) {
    const sCentre = Ideology.centroid(Game.nationDemographics(S).mix);
    const tCentre = Ideology.centroid(Game.nationDemographics(target).mix);
    const threshold = T().get('war.splinterAffinity');
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
  function planUnite(intent) {
    const { nid, target } = intent;
    const me = nationOf(nid), them = nationOf(target);
    if (!me || !them) return no('That nation no longer exists.');
    if (nid === target) return no('You cannot unite with yourself.');
    if (!Game.adjacentNations(nid).includes(target)) {
      return no(`${them.name} is not within reach.`);
    }
    const chance = CivilWar.unitePeaceChance(
      Game.nationDemographics(nid), Game.nationDemographics(target), Game.blueShell(nid), T());
    const fallout = planSplinter(nid, target);
    const gained = them.counties.size;
    return {
      ok: true, reason: null, cost: 0, chance, fallout, target,
      effects: [
        { label: 'Areas gained if it works', value: gained },
        { label: 'Chance', value: chance },
        { label: 'Areas that would defect', value: fallout.defect.length },
        { label: 'Areas that would secede', value: fallout.secede.length },
      ],
    };
  }

  function resolveUnite(intent, rng) {
    const plan = planUnite(intent);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, target } = intent;
    const peaceful = rng.stream('unite').chance(plan.chance);
    if (peaceful) {
      Game.mergeInto(nid, target);
      return { ...plan, ok: true, peaceful: true, created: [], events: [] };
    }
    const score = CivilWar.uniteSeverity(plan.chance, T());
    const created = Game.batch(() => {
      Game.moveCounties(plan.fallout.defect, target, { silent: true, reason: 'defect' });
      const born = Game.breakApart(plan.fallout.secede, { exclude: nid, reason: 'secede' });
      Game.applyCivilWarCost(nid, target, score);
      return born;
    });
    TurnSystem.insertAfter(nid, created);
    return { ...plan, ok: true, peaceful: false, score, created, events: [] };
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
  function acceptsRelease(giver) {
    return (recipient, comp) => {
      const r = nationOf(recipient);
      if (!r) return false;
      const them = Game.nationDemographics(recipient);
      const it = Game.demographics(new Set(comp));
      if (Ideology.mixAffinity(them.mix, it.mix) >= T().get('release.acceptAffinity')) return true;
      const g = nationOf(giver);
      if (g && g.tradeCooldown && g.tradeCooldown[recipient] != null) return true;
      return r.counties.size <= T().get('release.desperateAreas');
    };
  }

  /** @param intent {type:'release', nid, areas:[fips]} */
  function planRelease(intent) {
    const { nid, areas = [] } = intent;
    const n = nationOf(nid);
    if (!n) return no('That nation no longer exists.');
    const cd = releaseCooldownLeft(nid);
    if (cd > 0) return no(`The last handover is still being arranged — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);
    if (!areas.length) return no('Nothing selected.');
    if (areas.length >= n.counties.size) return no('You cannot release your last Area.');
    const budget = Math.min(T().get('release.budgetAreas'), n.counties.size - 1);
    if (areas.length > budget) return no(`You may release at most ${budget} Areas in one turn.`);
    for (const f of areas) if (!n.counties.has(f)) return no('You do not hold that Area.');

    const d = Game.demographics(areas);
    return {
      ok: true, reason: null, cost: 0, targets: areas,
      effects: [
        { label: 'Areas', value: -areas.length },
        { label: 'Population', value: -d.pop },
        { label: 'GDP', value: -d.gdp },
      ],
    };
  }

  function resolveRelease(intent) {
    const plan = planRelease(intent);
    if (!plan.ok) return { ...plan, events: [] };
    const { nid, areas } = intent;
    const n = nationOf(nid);
    n.lastReleaseTurn = World.getTurn();
    const wasOwner = new Map(areas.map((f) => [f, Game.getOwner(f)]));
    const born = Game.batch(() =>
      Game.breakApart(areas, { exclude: nid, accept: acceptsRelease(nid), reason: 'release' }));
    TurnSystem.insertAfter(nid, born);

    const bornSet = new Set(born);
    let toNew = 0, toNeighbours = 0, refused = 0;
    for (const [f, was] of wasOwner) {
      const now = Game.getOwner(f);
      if (now === was) refused++;
      else if (bornSet.has(now)) toNew++;
      else toNeighbours++;
    }
    return { ...plan, ok: true, born, toNew, toNeighbours, refused, events: [] };
  }

  /* ------------------------------------------------------------------ */
  /* govern (appeasement)                                               */
  /* ------------------------------------------------------------------ */

  /** @param intent {type:'govern', nid, ideology} */
  function planGovern(intent) {
    const { nid, ideology } = intent;
    const n = nationOf(nid);
    if (!n) return no('That nation no longer exists.');
    const to = Ideology.index(ideology);
    const from = Ideology.index(n.gov.rulingIdeology);
    if (to < 0) return no(`"${ideology}" is not an ideology.`);
    if (to === from) return no('That is already your governing ideology.');

    const cd = n.gov.lastChange == null ? 0
      : T().get('gov.changeCooldown') - (World.getTurn() - n.gov.lastChange);
    if (cd > 0) return no(`The government changed course too recently — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}.`);

    const d = Game.nationDemographics(nid);
    const share = d.pop > 0 ? d.mix[to] / d.pop : 0;
    const need = T().get('gov.changeMinShare');
    const distance = 1 - Ideology.affinity(from, to);
    const cost = d.gdp * T().get('gov.changeCost') * distance;

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
        { label: 'Authority', value: -T().get('gov.changeAuthorityHit') * distance },
      ],
    };
  }

  function resolveGovern(intent) {
    const plan = planGovern(intent);
    if (!plan.ok) return { ...plan, events: [] };
    const res = Game.changeRulingIdeology(intent.nid, intent.ideology);
    return { ...plan, ok: res.ok, reason: res.ok ? null : res.message, events: [] };
  }

  /* ------------------------------------------------------------------ */
  /* the front door                                                     */
  /* ------------------------------------------------------------------ */

  const PLANNERS = { annex: planAnnex, unite: planUnite, release: planRelease, govern: planGovern };
  const RESOLVERS = { annex: resolveAnnex, unite: resolveUnite, release: resolveRelease, govern: resolveGovern };

  /** Pure. Never draws, never rolls, never mutates. */
  function plan(intent) {
    const f = PLANNERS[intent && intent.type];
    return f ? f(intent) : no(`Unknown move "${intent && intent.type}".`);
  }

  /** Mutates. `rng` is explicit so a replay is a replay. */
  function resolve(intent, rng) {
    const f = RESOLVERS[intent && intent.type];
    return f ? f(intent, rng) : no(`Unknown move "${intent && intent.type}".`);
  }

  /**
   * Every legal move a nation could make right now, as intents.
   *
   * The AI's candidate list, and the thing that makes "what can I do" one
   * question rather than four. Deliberately NOT scored — scoring is policy and
   * belongs in js/ai.js; this is the rules.
   */
  function legal(nid, opts = {}) {
    const out = [];
    const n = nationOf(nid);
    if (!n) return out;
    const budget = T().get('annex.budgetAreas');

    if (!annexCooldownLeft(nid)) {
      // One intent per bordering nation, taking the Areas of theirs nearest to
      // you — a full power set of 3-Area combinations is thousands of intents
      // for a decision that turns on which neighbour, not which three Areas.
      const targets = [...Game.annexTargets(nid)];
      const byOwner = {};
      for (const f of targets) {
        const o = Game.getOwner(f);
        if (o) (byOwner[o] = byOwner[o] || []).push(f);
      }
      for (const [o, areas] of Object.entries(byOwner)) {
        const pick = areas
          .sort((a, b) => Game.countyPop(b) - Game.countyPop(a))
          .slice(0, budget);
        out.push({ type: 'annex', nid, areas: pick, against: o });
      }
    }
    for (const other of Game.adjacentNations(nid)) out.push({ type: 'unite', nid, target: other });
    if (!opts.skipGovern) {
      for (const x of Ideology.all()) {
        if (x.id !== n.gov.rulingIdeology) out.push({ type: 'govern', nid, ideology: x.id });
      }
    }
    return out;
  }

  return {
    plan, resolve, legal,
    planSplinter, partialSubset, acceptsRelease,
    annexCost, annexCooldownLeft, releaseCooldownLeft,
  };
})();
