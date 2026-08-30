/*
 * Power: Authority, Influence, Quality of Life, Civil Liberties.
 *
 * EVERY FUNCTION RETURNS A WHY RECORD, and that convention is the point of this
 * file — more than any individual formula in it.
 *
 *   { value: 0.62,
 *     inputs: [ { label: 'Age', raw: 14, norm: 0.56, weight: 0.20,
 *                 contribution: 0.112, key: 'power.authority.wAge' }, ... ],
 *     summary: 'Long-established, but bleeding territory' }
 *
 * Three things fall out of it and none of them cost extra:
 *   - the player-facing "why is my Authority falling?" panel is `inputs`;
 *     nothing has to be recomputed to explain a number;
 *   - the M5 dashboard's "show your work" view is the same array, and the
 *     `key` on each input is the tunable slider that moves it;
 *   - a test can assert a CONTRIBUTION rather than an outcome, so a formula
 *     change that happens to preserve the total still fails the test that cared
 *     about the term.
 *
 * TWO RULES THE WHOLE FILE OBEYS.
 *
 * 1. **Normalise before weighting.** Every input is mapped to 0..1 by an
 *    explicit, named curve BEFORE its weight is applied. Weights are therefore
 *    comparable to each other, and a slider labelled "weight of territorial
 *    losses" means the same kind of thing as one labelled "weight of age". Raw
 *    numbers with implicit scales are how a weight of 0.2 ends up dominating a
 *    weight of 5.
 *
 * 2. **The CHANGE is rate-limited, not the value.** Authority and Influence are
 *    stocks: each turn they move at most `power.maxRise` up or `power.maxFall`
 *    down toward the target, and never below `power.floor`. This is the
 *    anti-death-spiral guarantee and it is in from the start rather than added
 *    when a spiral shows up, because by then the tuning is built on top of it.
 *    A nation that loses a war has a bad decade, not an instant collapse.
 *
 * THE PURE/ADAPTER SEAM. The scoring functions take a plain input object and a
 * tunable set — no globals, no DOM, no `Game` — so they are testable against
 * hand-written numbers and runnable by the M5 simulator. The `gather*` functions
 * at the bottom are the one place that reads the live model, and they exist so
 * that the seam is a documented boundary rather than an accident.
 */

/* ------------------------------------------------------------------ */
/* normalisation curves                                               */
/* ------------------------------------------------------------------ */

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : (Number.isFinite(x) ? x : 0));

/** Linear to `full`, then flat. For quantities with a natural "enough". */
export const ramp = (x, full) => clamp01(full > 0 ? x / full : 0);

/**
 * Diminishing returns with no ceiling: `x / (x + k)`, so `k` is the half-way
 * point. For unbounded counts — Areas lost, occupied ground — where the tenth
 * event should matter less than the first but no amount should saturate to
 * exactly 1.
 */
export const saturate = (x, k) => (x > 0 && k > 0 ? x / (x + k) : 0);

/** Map a signed ratio into 0..1 with 0 at the centre. For "above or below par". */
export const centred = (x, span) => clamp01(0.5 + (span > 0 ? x / (2 * span) : 0));

/* ------------------------------------------------------------------ */
/* the Why record                                                     */
/* ------------------------------------------------------------------ */

/**
 * Build a Why record from weighted terms.
 *
 * @param base   the value with every input at zero — where a nation sits before
 *               anything good or bad has happened to it
 * @param terms  [{ label, raw, norm, key, note }]. `norm` must already be 0..1;
 *               the weight is read from `key` so the record can name the exact
 *               slider that moves each term.
 * @param tune   the tunable set
 *
 * Weights are SIGNED: positive for what builds a stock, negative for what drains
 * it, exactly as the record reads back to a player. `value` is the clamped sum,
 * but every contribution is kept unclamped, so "your Authority is at the floor
 * and here is the 0.4 of pressure holding it there" is still answerable.
 */
export function build(base, terms, tune, summarise) {
  const inputs = [];
  let total = base;
  for (const t of terms) {
    if (!t) continue;
    const weight = tune.get(t.key);
    const norm = clamp01(t.norm);
    const contribution = weight * norm;
    total += contribution;
    inputs.push({ label: t.label, raw: t.raw, norm, weight, contribution, key: t.key, note: t.note });
  }
  const value = clamp01(total);
  return { value, raw: total, base, inputs, summary: (summarise || defaultSummary)(value, inputs) };
}

/**
 * "Long-established, but bleeding territory" — the two largest movers, named.
 *
 * Deliberately built from the SAME array the panel renders, rather than from a
 * second pass over the source data. A summary that can disagree with the numbers
 * beside it is worse than no summary.
 */
function defaultSummary(value, inputs) {
  const band = value >= 0.75 ? 'Very strong' : value >= 0.55 ? 'Strong'
    : value >= 0.35 ? 'Steady' : value >= 0.18 ? 'Weak' : 'Critical';
  const ranked = inputs.filter((i) => Math.abs(i.contribution) > 1e-9)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  if (!ranked.length) return band;
  const up = ranked.find((i) => i.contribution > 0);
  const down = ranked.find((i) => i.contribution < 0);
  const parts = [];
  if (up) parts.push(`${up.label.toLowerCase()} helps`);
  if (down) parts.push(`${down.label.toLowerCase()} hurts`);
  return parts.length ? `${band} — ${parts.join(', ')}` : band;
}

/**
 * Move a stock toward a target, rate-limited and floored.
 *
 * THIS is the anti-death-spiral guarantee. Rate-limiting the CHANGE rather than
 * the value means a nation that has a catastrophic turn still ends it with most
 * of the standing it had — the collapse takes a decade of bad turns, which is
 * long enough to be a story and long enough to be recoverable. Limiting the
 * value instead (clamping Authority to a minimum) leaves the *pressure*
 * unbounded, so the moment the clamp is relaxed the nation falls off a cliff.
 *
 * The floor is separate and is a floor on the stock, not on the target: a nation
 * can be under 0.4 of sustained downward pressure and still hold the floor,
 * which is what stops "already losing" from being the same as "cannot recover".
 */
export function step(previous, target, tune) {
  const floor = tune.get('power.floor');
  const rise = tune.get('power.maxRise');
  const fall = tune.get('power.maxFall');
  if (previous == null) return Math.max(floor, clamp01(target));
  const delta = clamp01(target) - previous;
  const moved = previous + (delta > 0 ? Math.min(delta, rise) : Math.max(delta, -fall));
  return Math.max(floor, clamp01(moved));
}

/* ------------------------------------------------------------------ */
/* Authority                                                           */
/* ------------------------------------------------------------------ */

/**
 * How firmly a state holds its own ground.
 *
 *   authority = f(age, tenure, wars won, solvency, cohesion)
 *             - f(territory lost, occupation, overreach)
 *
 * The plan's list also names failed suppressions, coalition pressure and
 * military readiness. None of those exist yet — suppression is M4, coalitions
 * and the military are M6 — and inventing a placeholder for each would mean
 * tuning the five real terms against three sources of zero. They arrive as terms
 * here when the mechanics behind them do.
 *
 * OVERREACH is the term worth explaining. Taking ground raises Authority through
 * `wars`, but taking a lot of ground *quickly* lowers it: a state digesting six
 * conquests at once is not more secure than one that took two. That is what
 * stops conquest from being a pure Authority engine, and it is the same shape as
 * the plan's `blitz_pace`.
 *
 * @param a {turn, founded, since, cohesion, treasury, upkeep, areas, occupied,
 *           gains: [{turn, areas, reason}], losses: [{turn, areas}], previous}
 */
export function authority(a, tune) {
  const window = tune.get('nation.historyWindow');
  const recent = (list) => (list || []).filter((e) => a.turn - e.turn <= window);

  const age = Math.max(0, a.turn - (a.founded || 0));
  const tenure = Math.max(0, a.turn - (a.since || 0));

  const gains = recent(a.gains);
  const losses = recent(a.losses);
  const warAreas = gains.filter((e) => e.reason === 'war').reduce((s, e) => s + e.areas, 0);
  const takenAreas = gains.reduce((s, e) => s + e.areas, 0);
  const lostAreas = losses.reduce((s, e) => s + e.areas, 0);

  // Solvency: how many turns of upkeep the treasury covers. A state that cannot
  // pay for itself does not command; one sitting on ten years of reserves does.
  const solvency = a.upkeep > 0 ? a.treasury / a.upkeep : (a.treasury > 0 ? Infinity : 0);

  /*
   * Overreach: acquisitions per turn over the window, ABOVE a free allowance.
   *
   * The allowance is what makes this "digesting six conquests at once" rather
   * than "conquest is bad". Without it, measured: a single six-Area war over a
   * 20-turn window scored +0.047 on wars won and -0.060 on overreach, so
   * *winning a war lowered Authority* — which is not a design position anyone
   * would defend, and the test that said "a won war did not raise Authority"
   * caught it.
   */
  const pace = window > 0 ? takenAreas / window : 0;
  const excess = Math.max(0, pace - tune.get('power.authority.paceFree'));

  // Occupation: what share of what you hold is somebody else's soil.
  const occupation = a.areas > 0 ? (a.occupied || 0) / a.areas : 0;

  const terms = [
    { label: 'Age', raw: age, norm: ramp(age, tune.get('power.authority.ageFull')),
      key: 'power.authority.wAge', note: 'turns since founding' },
    { label: 'Tenure', raw: tenure, norm: ramp(tenure, tune.get('power.authority.tenureFull')),
      key: 'power.authority.wTenure', note: 'turns this ideology has governed' },
    { label: 'Wars won', raw: warAreas, norm: saturate(warAreas, tune.get('power.authority.warsK')),
      key: 'power.authority.wWars', note: 'Areas taken by force, recently' },
    { label: 'Solvency', raw: solvency,
      norm: ramp(Number.isFinite(solvency) ? solvency : 999, tune.get('power.authority.solvencyFull')),
      key: 'power.authority.wSolvency', note: 'turns of upkeep the treasury covers' },
    { label: 'Cohesion', raw: a.cohesion || 0, norm: clamp01(a.cohesion || 0),
      key: 'power.authority.wCohesion', note: 'how ideologically united the population is' },
    /*
     * A new nation's honeymoon (M4.3), decaying over its remaining turns. It is
     * a TERM rather than a patch on the value so that a player looking at a
     * young country can see exactly why its Authority is where it is, and watch
     * the reason expire.
     */
    { label: 'Honeymoon', raw: a.honeymoon || 0, norm: clamp01(a.honeymoon || 0),
      key: 'power.authority.wHoneymoon', note: 'goodwill toward a government that just won independence' },
    { label: 'Territory lost', raw: lostAreas, norm: saturate(lostAreas, tune.get('power.authority.lossesK')),
      key: 'power.authority.wLosses', note: 'Areas lost, recently' },
    { label: 'Occupation', raw: occupation, norm: clamp01(occupation),
      key: 'power.authority.wOccupation', note: 'share of held ground that is foreign soil' },
    { label: 'Overreach', raw: pace, norm: saturate(excess, tune.get('power.authority.overreachK')),
      key: 'power.authority.wOverreach', note: 'Areas taken per turn beyond what a state can digest' },
  ];

  const record = build(tune.get('power.authority.base'), terms, tune, authoritySummary);
  record.target = record.value;
  record.value = step(a.previous, record.value, tune);
  return record;
}

function authoritySummary(value, inputs) {
  const band = value >= 0.75 ? 'Unquestioned' : value >= 0.55 ? 'Secure'
    : value >= 0.35 ? 'Holding' : value >= 0.18 ? 'Strained' : 'Failing';
  const ranked = inputs.filter((i) => Math.abs(i.contribution) > 1e-9)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const up = ranked.find((i) => i.contribution > 0);
  const down = ranked.find((i) => i.contribution < 0);
  if (!up && !down) return band;
  if (up && down) return `${band}: ${up.label.toLowerCase()} carries it, ${down.label.toLowerCase()} drags`;
  return `${band}: ${(up || down).label.toLowerCase()} dominates`;
}


/* ------------------------------------------------------------------ */
/* Influence                                                           */
/* ------------------------------------------------------------------ */

/**
 * Soft power: how much the rest of the world listens to you.
 *
 *   influence = f(economic weight, reach, alignment)
 *             - f(conquest x (1 + influence), blitz pace, occupation)
 *
 * PROMOTED, NOT INVENTED. `evalTransit` in actions.js has been computing an
 * ad-hoc, stateless version of exactly this since M1 — relative economic size,
 * political alignment and need — recomputed inline per dialog and thrown away,
 * so nothing outside the trade panel could read it and nothing persisted between
 * turns. The two size and alignment terms here are that math, generalised from
 * "against this one partner" to "against the world" and given somewhere to live.
 * `need` stays in `evalTransit`, because it is a fact about one deal rather than
 * about a nation.
 *
 * THE (1 + influence) SCALING IS THE POINT. The design asks for a cost that
 * depends on standing: a superpower annexing a neighbour pays more in reputation
 * than an unknown does, because it had more to spend. That falls out of scaling
 * the conquest term by `1 + previous`, and it means Influence is the one stock
 * whose *own* value is an input — which is also why it must be rate-limited, or
 * the feedback runs away in either direction.
 *
 * WHAT IS NOT HERE YET. The plan also names QoL rank, civil liberties, treaties
 * honoured and broken, and aid given. QoL and liberties arrive in M3.3 and are
 * added as terms then; treaties and aid need mechanics that do not exist (M6).
 * Same rule as Authority: a term arrives when the thing it measures does.
 *
 * @param a {turn, gdpShare, alignment, partners, areas, occupied,
 *           gains: [{turn, areas, reason}], previous}
 */
export function influence(a, tune) {
  const window = tune.get('nation.historyWindow');
  const gains = (a.gains || []).filter((e) => a.turn - e.turn <= window);
  const takenAreas = gains.reduce((s, e) => s + e.areas, 0);
  const pace = window > 0 ? takenAreas / window : 0;
  const excess = Math.max(0, pace - tune.get('power.influence.paceFree'));
  const occupation = a.areas > 0 ? (a.occupied || 0) / a.areas : 0;

  /*
   * The cost of conquest scales with the standing you already had. `previous` is
   * null on the first turn of a nation's life, and a brand-new nation has no
   * reputation to spend, so it scales by 1 rather than by 1 + nothing.
   */
  const standing = 1 + (a.previous == null ? 0 : a.previous);
  const conquest = takenAreas * standing;

  const terms = [
    { label: 'Economic weight', raw: a.gdpShare || 0,
      norm: saturate(a.gdpShare || 0, tune.get('power.influence.gdpShareK')),
      key: 'power.influence.wEconomy', note: 'share of world GDP' },
    { label: 'Reach', raw: a.partners || 0,
      norm: saturate(a.partners || 0, tune.get('power.influence.partnersK')),
      key: 'power.influence.wReach', note: 'nations you have live trade relations with' },
    { label: 'Alignment', raw: a.alignment || 0, norm: clamp01(a.alignment || 0),
      key: 'power.influence.wAlignment',
      note: 'how close the rest of the world is to you politically, weighted by their size' },
    { label: 'Conquest', raw: conquest,
      norm: saturate(conquest, tune.get('power.influence.conquestK')),
      key: 'power.influence.wConquest',
      note: 'Areas taken recently, scaled by the standing you had to spend' },
    { label: 'Blitz', raw: pace, norm: saturate(excess, tune.get('power.influence.paceK')),
      key: 'power.influence.wBlitz', note: 'Areas taken per turn beyond a pace the world tolerates' },
    { label: 'Occupation', raw: occupation, norm: clamp01(occupation),
      key: 'power.influence.wOccupation', note: 'share of held ground that is foreign soil' },
  ];

  const record = build(tune.get('power.influence.base'), terms, tune, influenceSummary);
  record.target = record.value;
  record.value = step(a.previous, record.value, tune);
  return record;
}

function influenceSummary(value, inputs) {
  const band = value >= 0.75 ? 'Commanding' : value >= 0.55 ? 'Respected'
    : value >= 0.35 ? 'Heard' : value >= 0.18 ? 'Marginal' : 'Ignored';
  const ranked = inputs.filter((i) => Math.abs(i.contribution) > 1e-9)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const up = ranked.find((i) => i.contribution > 0);
  const down = ranked.find((i) => i.contribution < 0);
  if (!up && !down) return band;
  if (up && down) return `${band}: ${up.label.toLowerCase()} carries it, ${down.label.toLowerCase()} costs`;
  return `${band}: ${(up || down).label.toLowerCase()} dominates`;
}


/* ------------------------------------------------------------------ */
/* Quality of Life                                                     */
/* ------------------------------------------------------------------ */

/**
 * How well a nation feeds, treats and pays its people.
 *
 *   qol = f(food security, healthcare, prosperity) - f(fiscal strain)
 *
 * FOOD IS A NEED, NOT A SECTOR. That is the whole instruction: the six-sector
 * economy already reports Agriculture as a share of output, but a share of
 * output is a fact about an economy, not about whether anyone eats. What matters
 * is production PER PERSON against a per-person requirement — so the same
 * agricultural output feeds a small nation and starves a large one, which is not
 * something a sector share can express.
 *
 * AND FOOD CAN BE BOUGHT. A nation covers the requirement out of its own fields
 * OR out of its wallet: `qol.foodImportShare` of GDP is treated as redirectable
 * to imports. Without that term the model says the District of Columbia starves,
 * which is not a claim about the world — it is a claim about a model that
 * confused growing food with having food. The mechanic that falls out is the
 * right one: agriculture or money, and a nation with neither is in trouble.
 *
 * HEALTHCARE has no sector, so it is not faked as one. It is bought out of
 * income, and GDP per capita against a per-capita requirement is the honest
 * proxy — the same one the real world's health outcomes track closely.
 *
 * PER NATION, FOR NOW. M4.2's grievance wants QoL per AREA, and the economy bake
 * is already per Area, so that refinement is a change of scope rather than of
 * model. What is here is what M3 asked for: one number per nation, cached once a
 * turn, with its working attached.
 *
 * @param a {pop, gdp, agriculture, treasuryDelta, income, previous}
 */
export function qol(a, tune) {
  const pop = a.pop || 0;
  const perCap = pop > 0 ? a.gdp / pop : 0;

  // Dollars of food-equivalent available per person per year: what the fields
  // produce, plus the share of income a nation can redirect to imports.
  const foodSupply = (a.agriculture || 0) + (a.gdp || 0) * tune.get('qol.foodImportShare');
  const foodCover = pop > 0 ? (foodSupply / pop) / tune.get('qol.foodPerCapita') : 0;

  const healthCover = perCap / tune.get('qol.healthPerCapita');

  // Fiscal strain: a deficit measured against income, because a $1bn shortfall
  // means something different to Wyoming and to California.
  const strain = a.income > 0 ? Math.max(0, -(a.treasuryDelta || 0)) / a.income : 0;

  const terms = [
    { label: 'Food security', raw: foodCover, norm: clamp01(foodCover),
      key: 'qol.wFood', note: 'domestic agriculture plus affordable imports, against the per-person requirement' },
    { label: 'Healthcare', raw: healthCover, norm: clamp01(healthCover),
      key: 'qol.wHealth', note: 'income per person against the per-person cost of care' },
    { label: 'Prosperity', raw: perCap, norm: ramp(perCap, tune.get('qol.prosperityFull')),
      key: 'qol.wProsperity', note: 'GDP per person' },
    { label: 'Fiscal strain', raw: strain, norm: saturate(strain, tune.get('qol.strainK')),
      key: 'qol.wStrain', note: 'this turn\'s deficit as a share of income' },
  ];

  const record = build(tune.get('qol.base'), terms, tune, qolSummary);
  record.target = record.value;
  record.value = step(a.previous, record.value, tune);
  return record;
}

function qolSummary(value, inputs) {
  const band = value >= 0.75 ? 'Comfortable' : value >= 0.55 ? 'Decent'
    : value >= 0.35 ? 'Getting by' : value >= 0.18 ? 'Hard' : 'Desperate';
  const food = inputs.find((i) => i.label === 'Food security');
  if (food && food.norm < 0.6) return `${band}: people are going hungry`;
  const ranked = inputs.filter((i) => Math.abs(i.contribution) > 1e-9)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const down = ranked.find((i) => i.contribution < 0);
  const up = ranked.find((i) => i.contribution > 0);
  if (down) return `${band}: ${down.label.toLowerCase()} is the drag`;
  return up ? `${band}: ${up.label.toLowerCase()} carries it` : band;
}

/* ------------------------------------------------------------------ */
/* Civil Liberties                                                     */
/* ------------------------------------------------------------------ */

/**
 * How freely a state lets its people disagree with it.
 *
 *   liberties = f(alignment at home, government type, prosperity)
 *             - f(occupation, dissent under a divided population)
 *
 * ALIGNMENT AT HOME IS THE HINGE, and it is why this could not be written before
 * `gov.rulingIdeology` existed. A state governing people who broadly agree with
 * it has no reason to restrict them; a state governing a population half of
 * which sits at the far end of both axes is under constant pressure to. That
 * pressure is measured as the population-weighted mean affinity between each
 * Area's political mix and the ruling ideology — the same `affinity` function
 * that drives everything else, pointed inward.
 *
 * The DIVIDED term is separate from alignment and is not a duplicate of it: a
 * nation can be uniformly mildly-opposed (low alignment, high cohesion) or
 * evenly split into two camps that agree with the government equally little
 * (same alignment, low cohesion). The second is the harder one to govern
 * liberally, and only cohesion can tell them apart.
 *
 * WHAT THIS FEEDS. M4.2's grievance reads `1 - liberty_satisfaction` as one of
 * its factors, so this number is an input to whether people organise against
 * their government — which is the mechanism the whole West slice is built on.
 *
 * @param a {alignment, cohesion, perCapita, areas, occupied, govType, previous}
 */
export function liberties(a, tune) {
  const tolerance = tune.get('qol.govTolerance');
  const govTol = tolerance[a.govType] != null ? tolerance[a.govType] : tolerance.Republic;
  const occupation = a.areas > 0 ? (a.occupied || 0) / a.areas : 0;
  const divided = 1 - clamp01(a.cohesion || 0);

  const terms = [
    { label: 'Alignment at home', raw: a.alignment || 0, norm: clamp01(a.alignment || 0),
      key: 'liberty.wAlignment',
      note: 'how close the governed population sits to the governing ideology' },
    { label: 'Government', raw: govTol, norm: clamp01(govTol),
      key: 'liberty.wGovernment', note: 'how much dissent this form of government tolerates' },
    { label: 'Prosperity', raw: a.perCapita || 0,
      norm: ramp(a.perCapita || 0, tune.get('qol.prosperityFull')),
      key: 'liberty.wProsperity', note: 'GDP per person; comfortable states restrict less' },
    { label: 'A divided people', raw: divided, norm: divided,
      key: 'liberty.wDivided',
      note: 'how split the population is, apart from how far it sits from the government' },
    { label: 'Occupation', raw: occupation, norm: clamp01(occupation),
      key: 'liberty.wOccupation', note: 'share of held ground governed as occupied territory' },
  ];

  const record = build(tune.get('liberty.base'), terms, tune, libertySummary);
  record.target = record.value;
  record.value = step(a.previous, record.value, tune);
  return record;
}

function libertySummary(value, inputs) {
  const band = value >= 0.75 ? 'Free' : value >= 0.55 ? 'Open'
    : value >= 0.35 ? 'Constrained' : value >= 0.18 ? 'Repressive' : 'Police state';
  const ranked = inputs.filter((i) => Math.abs(i.contribution) > 1e-9)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const down = ranked.find((i) => i.contribution < 0);
  const up = ranked.find((i) => i.contribution > 0);
  if (up && down) return `${band}: ${up.label.toLowerCase()} holds, ${down.label.toLowerCase()} presses`;
  return ranked.length ? `${band}: ${ranked[0].label.toLowerCase()} decides it` : band;
}

/* ------------------------------------------------------------------ */
/* the adapter — the one place this file reads the live model          */
/* ------------------------------------------------------------------ */

/**
 * The world facts every nation's Influence is measured against, computed ONCE.
 *
 * Alignment is O(nations^2) if each nation asks the world about itself, and
 * `nationDemographics` is a full scan of that nation's Areas — so asking 51
 * times inside 51 loops is 51 full passes over the map per turn for a number
 * that does not change between them.
 */
export function worldContext() {
  const rows = [];
  let gdp = 0;
  for (const [nid] of Game.nations) {
    const d = Game.nationDemographics(nid);
    rows.push({ nid, gdp: d.gdp, mix: d.mix });
    gdp += d.gdp;
  }
  return { rows, gdp };
}

/**
 * Everything the four stocks need about ONE nation, read in a single pass.
 *
 * The four `gather*` functions each used to ask the model for what they needed,
 * which meant `nationDemographics` four times and `treasuryFlow` twice per
 * nation per turn — and each of those is a full scan of that nation's Areas. The
 * power phase measured 4.51 ms of an 8.12 ms turn, more than the six world
 * phases put together, for numbers that cannot change between the four calls.
 *
 * The other half of that cost was the home-alignment loop asking
 * `Ideology.affinity(i, ruling)` per ideology per Area — about ten thousand
 * distance computations a turn for a **six-element lookup table**. It is
 * computed once here and the Area loop becomes arithmetic.
 */
/**
 * Which territorial gains count as conquest.
 *
 * Filtering on the REASON rather than on "was this the turn you were founded"
 * is the robust form: a nation created by a declaration of independence takes
 * its founding ground through `moveCounties` like everything else, and comparing
 * turn stamps to detect that only works while two independent clocks agree.
 */
const CONQUEST = new Set(['annex', 'war']);

export function nationFacts(nid, tune) {
  const n = Game.getNation(nid);
  if (!n) return null;
  const d = Game.nationDemographics(nid);
  const flow = Game.treasuryFlow(nid);
  const surplus = typeof Market !== 'undefined' ? Market.nationSurplus(nid, tune) : null;

  // Home alignment: how close the governed population sits to the governing
  // ideology, population-weighted over the nation's own Areas.
  //
  // Weighted over AREAS rather than computed from the nation's aggregate mix,
  // and the two are different numbers: a nation split into a red half and a blue
  // half has an aggregate centroid sitting between them that resembles neither,
  // and would read as moderately aligned with a centre-governing party that in
  // fact nobody supports.
  const ruling = n.gov ? Ideology.index(n.gov.rulingIdeology) : -1;
  let alignment = 0;
  if (ruling >= 0) {
    const N = Ideology.count();
    const affTo = new Array(N);
    for (let i = 0; i < N; i++) affTo[i] = Ideology.affinity(i, ruling);
    let weighted = 0, weight = 0;
    for (const f of n.counties) {
      const c = Game.county[f];
      if (!c) continue;
      let pop = 0, a = 0;
      for (let i = 0; i < N; i++) { pop += c.pop[i]; a += c.pop[i] * affTo[i]; }
      if (pop <= 0) continue;
      weighted += a;      // already population-weighted: a is sum(pop_i * aff_i)
      weight += pop;
    }
    alignment = weight > 0 ? weighted / weight : 0;
  }

  /*
   * THE GROUND A NATION IS BORN HOLDING IS NOT GROUND IT TOOK.
   *
   * `createNation` grants its founding territory through `moveCounties`, which
   * records it as an acquisition — correctly, because that is what the ledger is
   * for. But Authority and Influence read those records as conquest, so a
   * movement that declared independence with 39 Areas was scored as having
   * blitzed 39 Areas on the day it was founded: measured, Deseret opened with
   * Overreach at -0.123 and Influence pinned at the 0.08 floor, for taking
   * nothing from anyone that it had not already been living in.
   *
   * Filtered once here rather than in each stock, so the two cannot disagree
   * about what counts as a conquest.
   */
  const gains = (n.annexed || []).filter((e) => CONQUEST.has(e.reason));

  return {
    nid, n, d, flow, gains,
    pop: d.pop,
    gdp: d.gdp,
    perCapita: d.pop > 0 ? d.gdp / d.pop : 0,
    cohesion: d.cohesion,
    // nationSurplus reports $M; everything else here is dollars.
    agriculture: surplus ? surplus.prod[0] * 1e6 : 0,
    areas: n.counties.size,
    occupied: Game.occupiedCount(nid),
    alignment,
  };
}

/** Authority's inputs, from one nation's facts. */
export function gatherAuthority(facts, turn) {
  if (!facts) return null;
  const { n, flow } = facts;
  // The honeymoon decays linearly to nothing as its turns run out.
  const left = (n.honeymoonUntil || 0) - turn;
  const span = window.TUNE.get('secession.honeymoonTurns');
  const honeymoon = left > 0 && span > 0
    ? window.TUNE.get('secession.honeymoonAuthority') * Math.min(1, left / span) : 0;

  return {
    turn,
    honeymoon,
    founded: n.founded,
    since: n.gov ? n.gov.since : 0,
    cohesion: facts.cohesion,
    treasury: n.treasury,
    upkeep: flow ? flow.maintenance : 0,
    areas: facts.areas,
    occupied: facts.occupied,
    gains: facts.gains,
    losses: n.lost,
    previous: n.authority,
  };
}

/**
 * Influence's inputs. `alignment` here is the GDP-weighted mean affinity between
 * this nation's political centroid and every OTHER nation's — the
 * generalisation of the pairwise `rel` that `evalTransit` computes for a single
 * trade partner. Weighted by size because being ideologically close to
 * California is worth more than being close to Wyoming, which is what soft power
 * means. It is a different number from `facts.alignment`, which points inward.
 */
export function gatherInfluence(facts, turn, tune, ctx) {
  if (!facts) return null;
  const { nid, n } = facts;
  const world = ctx || worldContext();
  const self = world.rows.find((r) => r.nid === nid);
  if (!self) return null;

  let weighted = 0, weight = 0;
  for (const other of world.rows) {
    if (other.nid === nid || other.gdp <= 0) continue;
    weighted += other.gdp * Ideology.mixAffinity(self.mix, other.mix);
    weight += other.gdp;
  }

  // Trade partners inside the memory window: `tradeCooldown` is partner -> the
  // world turn of the last deal, which is already a record of who you do
  // business with. Reusing it beats inventing a second relations table that
  // could disagree with the one the trade screens read.
  const recent = tune.get('nation.historyWindow');
  let partners = 0;
  for (const k in n.tradeCooldown || {}) if (turn - n.tradeCooldown[k] <= recent) partners++;

  return {
    turn,
    gdpShare: world.gdp > 0 ? self.gdp / world.gdp : 0,
    alignment: weight > 0 ? weighted / weight : 0,
    partners,
    areas: facts.areas,
    occupied: facts.occupied,
    gains: facts.gains,
    previous: n.influence,
  };
}

/**
 * QoL's inputs. Agriculture comes from `Market.nationSurplus`, which is the
 * single definition of production in the game — reading the baked economy
 * directly here would be the second economy that M1 spent a fix removing.
 */
export function gatherQol(facts, turn) {
  if (!facts) return null;
  const { n, flow } = facts;
  return {
    turn,
    pop: facts.pop,
    gdp: facts.gdp,
    agriculture: facts.agriculture,
    treasuryDelta: flow ? flow.delta : 0,
    income: flow ? flow.income : 0,
    previous: n.qol,
  };
}

/** Civil Liberties' inputs. `alignment` points INWARD — see `nationFacts`. */
export function gatherLiberties(facts, turn) {
  if (!facts) return null;
  const { n } = facts;
  return {
    turn,
    alignment: facts.alignment,
    cohesion: facts.cohesion,
    perCapita: facts.perCapita,
    areas: facts.areas,
    occupied: facts.occupied,
    govType: n.gov ? n.gov.type : 'Republic',
    previous: n.liberties,
  };
}

export default {
  clamp01, ramp, saturate, centred, build, step,
  worldContext, nationFacts,
  authority, gatherAuthority,
  influence, gatherInfluence,
  qol, gatherQol,
  liberties, gatherLiberties,
};
