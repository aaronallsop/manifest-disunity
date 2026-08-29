/*
 * TUNE — one mutable object holding every constant the model uses.
 *
 * Two rules make this worth the indirection:
 *
 *   1. No magic numbers in model code. Every constant is a named key here, with
 *      a label, a range and a one-line doc, so the M5 dashboard can render a
 *      slider for it without a second table.
 *   2. Every read goes through TUNE.get(key), which RECORDS the key it served.
 *      That recording is the "show your work" panel — a formula's ruleset keys
 *      fall out of tracing its reads instead of being hand-listed a second time.
 *
 * Values load from content/tunables.json when the server has one, overriding the
 * defaults below key by key. Defaults stay the schema: they define what exists,
 * what type it is and what range a slider spans.
 */

/**
 * key -> { v, label, group, doc, min?, max?, step?, kind? }
 *
 * `kind` is 'number' (default), 'array', 'object' or 'bool'. Array and object
 * values are not slider-able; the dashboard renders them as editable JSON.
 */
export const SCHEMA = {
  /* ---------------- world phases ---------------- */
  'world.driftStep': {
    v: 0.02, min: 0, max: 0.2, step: 0.005, group: 'World',
    label: 'Political drift step',
    doc: 'Fraction of the gap to the drift target a county closes each turn.',
  },
  'world.driftOwnerWeight': {
    v: 0.5, min: 0, max: 1, step: 0.05, group: 'World',
    label: 'Drift target: owner weight',
    doc: 'Share of the drift target taken from the owner nation vs the local neighbourhood. 1.0 reproduces the pre-M1.6 single global attractor.',
  },
  'world.driftAnchorWeight': {
    v: 0.25, min: 0, max: 1, step: 0.05, group: 'World',
    label: 'Drift target: structural anchor weight',
    doc: 'Share of the drift target held by the county\'s own founding mix — the part a nation can never fully override.',
  },
  'world.driftNoise': {
    v: 0.004, min: 0, max: 0.05, step: 0.001, group: 'World',
    label: 'Political drift noise',
    doc: 'Bounded per-county per-turn jitter in share space, so deviation has non-zero stationary variance.',
  },
  'world.popGrowth': {
    v: 0.01, min: 0, max: 0.1, step: 0.001, group: 'World',
    label: 'Population growth / turn',
    doc: 'Base per-turn population growth rate, applied to every party including emergent movements.',
  },
  'world.gdpGrowth': {
    v: 0.008, min: -0.05, max: 0.1, step: 0.001, group: 'World',
    label: 'GDP growth / turn',
    doc: 'Base per-turn real GDP growth before per-nation modifiers.',
  },
  'world.gdpGrowthPopCoupling': {
    v: 0.6, min: 0, max: 2, step: 0.05, group: 'World',
    label: 'GDP growth: population coupling',
    doc: 'How much of a county\'s population growth feeds through into its GDP growth.',
  },
  'world.partyCeiling': {
    v: 0.35, min: 0, max: 1, step: 0.01, group: 'World',
    label: 'Emergent party ceiling',
    doc: 'Maximum population share an emergent movement grows toward in a county.',
  },
  'world.partyStep': {
    v: 0.03, min: 0, max: 0.5, step: 0.005, group: 'World',
    label: 'Emergent party step',
    doc: 'Fraction of the gap to the ceiling an emergent movement closes each turn.',
  },
  'world.partyFloor': {
    v: 0.01, min: 0, max: 0.2, step: 0.002, group: 'World',
    label: 'Emergent party floor',
    doc: 'Movements below this share of a county are cleaned up and their share redistributed.',
  },

  /* ---------------- treasury & upkeep ---------------- */
  'econ.taxRate': {
    v: 0.02, min: 0, max: 0.2, step: 0.001, group: 'Economy',
    label: 'Tax rate',
    doc: 'Treasury income per turn as a share of GDP.',
  },
  'econ.govMaintenance': {
    v: { Republic: 0.015 }, kind: 'object', group: 'Economy',
    label: 'Government maintenance rate',
    doc: 'Maintenance cost per turn as a share of GDP, by government type.',
  },
  'econ.areaUpkeep': {
    v: 40e6, min: 0, max: 2e8, step: 1e6, group: 'Economy',
    label: 'Area upkeep ($/turn)',
    doc: 'Flat per-Area administrative upkeep per turn.',
  },
  'econ.occupationAlpha': {
    v: 1.15, min: 1, max: 2, step: 0.01, group: 'Economy',
    label: 'Occupation cost exponent',
    doc: 'Superlinear exponent on the number of occupied Areas, so conquest stops paying for itself. Anti-snowball brake #2.',
  },
  'econ.occupationHostility': {
    v: 1.0, min: 0, max: 3, step: 0.05, group: 'Economy',
    label: 'Occupation hostility multiplier',
    doc: 'How strongly an Area\'s hostility scales its upkeep.',
  },

  /* ---------------- market ---------------- */
  'market.base': {
    v: 100, min: 10, max: 500, step: 5, group: 'Market',
    label: 'Price index base',
    doc: 'Index value at which demand exactly equals supply.',
  },
  'market.elasticity': {
    v: 1.3, min: 0.2, max: 4, step: 0.05, group: 'Market',
    label: 'Price elasticity',
    doc: 'Exponent on demand/supply. Higher means prices swing harder.',
  },
  'market.minPrice': {
    v: 20, min: 1, max: 200, step: 1, group: 'Market',
    label: 'Price floor',
    doc: 'Lower clamp on any sector price.',
  },
  'market.maxPrice': {
    v: 400, min: 100, max: 2000, step: 10, group: 'Market',
    label: 'Price ceiling',
    doc: 'Upper clamp on any sector price.',
  },
  'market.demandShare': {
    v: [0.08, 0.10, 0.22, 0.15, 0.15, 0.10], kind: 'array', group: 'Market',
    label: 'Demand share by sector',
    doc: 'Ag, Extraction, Manufacturing, Trade, Finance, IT. Sums to 0.80 today, which is why the "100 = balanced" label is wrong (balanced is 75). M1.8 fixes the sum or relabels the index. Lives here, not in the renderer, which is where it used to be (app.js:630) — a live load-order hazard.',
  },

  /* ---------------- trade ---------------- */
  'trade.gain': {
    v: 0.10, min: 0, max: 0.5, step: 0.005, group: 'Trade',
    label: 'Trade gain',
    doc: 'Each side\'s benefit as a share of traded value.',
  },
  'trade.worldMarketPenalty': {
    v: 0.45, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'World market penalty',
    doc: 'Fraction of the bilateral rate an untargeted world-market sale earns, so bilateral deals stay competitive (M1.9).',
  },
  'trade.cooldownTurns': {
    v: 3, min: 0, max: 20, step: 1, group: 'Trade',
    label: 'Partner cooldown (turns)',
    doc: 'Turns before the same partner can be traded with again.',
  },
  'trade.capacityPerPort': {
    v: 9000, min: 0, max: 100000, step: 500, group: 'Trade',
    label: 'Capacity per port ($M)',
    doc: 'Tradeable volume unlocked by each port Area.',
  },
  'trade.capacityPerRailHub': {
    v: 4500, min: 0, max: 100000, step: 500, group: 'Trade',
    label: 'Capacity per rail hub ($M)',
    doc: 'Tradeable volume unlocked by each rail-hub Area.',
  },
  'trade.capacityPerGateway': {
    v: 6000, min: 0, max: 100000, step: 500, group: 'Trade',
    label: 'Capacity per land gateway ($M)',
    doc: 'Tradeable volume unlocked by each Canada/Mexico border gateway.',
  },
  'trade.capacityBase': {
    v: 1200, min: 0, max: 50000, step: 100, group: 'Trade',
    label: 'Base overland capacity ($M)',
    doc: 'Volume a nation can move with no port, hub or gateway at all.',
  },
  'trade.transitToll': {
    v: 0.35, min: 0, max: 0.9, step: 0.01, group: 'Trade',
    label: 'Transit toll',
    doc: 'A transit nation\'s baseline cut of the trade benefit.',
  },
  'trade.railDiscount': {
    v: 0.5, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Rail corridor discount',
    doc: 'Fraction the toll is reduced by when a rail corridor links the pair.',
  },
  'trade.highwayDiscount': {
    v: 0.2, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Highway corridor discount',
    doc: 'Fraction the toll is reduced by when an interstate links the pair.',
  },
  'trade.needScale': {
    v: 40, min: 0, max: 500, step: 5, group: 'Trade',
    label: 'Transit need scale',
    doc: 'Scales toll income against the transit nation\'s GDP into a 0..1 "need".',
  },
  'trade.counterFloor': {
    v: 0.55, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Counter-offer floor',
    doc: 'Offers below this fraction of the transit nation\'s ask are declined outright.',
  },

  /* ---------------- civil war ---------------- */
  'war.popPerPoint': {
    v: 1e6, min: 1e4, max: 1e8, step: 1e4, group: 'Civil war',
    label: 'People per war point',
    doc: 'Annexed population divided by this gives the population half of the war points.',
  },
  'war.gdpPerPoint': {
    v: 1e10, min: 1e8, max: 1e12, step: 1e8, group: 'Civil war',
    label: 'GDP per war point ($)',
    doc: 'Annexed GDP divided by this gives the GDP half of the war points.',
  },
  'war.pointsScale': {
    v: 1, min: 0.1, max: 100, step: 0.5, group: 'Civil war',
    label: 'Points scale',
    doc: 'Multiplier turning raw points into the score band. M1.3 raises it once the rounding is removed, so a median Area annexation lands near the victory/partial boundary.',
  },
  'war.maxDice': {
    v: 6, min: 1, max: 20, step: 1, group: 'Civil war',
    label: 'Dice cap',
    doc: 'Hard cap on the dice count. Uncapped + multiplied is what made every flip war a guaranteed fall-apart.',
  },
  'war.diceSides': {
    v: 6, min: 2, max: 20, step: 1, group: 'Civil war',
    label: 'Die sides',
    doc: 'Sides on each war die.',
  },
  'war.dicePerFlipPoint': {
    v: 0.35, min: 0, max: 3, step: 0.05, group: 'Civil war',
    label: 'Dice per point of plurality flip',
    doc: 'Dice granted per point of distance between the old plurality share and the new leader\'s share.',
  },
  'war.victoryBand': {
    v: 33, min: 0, max: 200, step: 1, group: 'Civil war',
    label: 'Victory band ceiling',
    doc: 'Scores at or below this are a complete victory.',
  },
  'war.partialBand': {
    v: 66, min: 0, max: 400, step: 1, group: 'Civil war',
    label: 'Partial band ceiling',
    doc: 'Scores at or below this are a partial victory; above it the union falls apart.',
  },
  'war.popLossBase': {
    v: 0.02, min: 0, max: 0.5, step: 0.005, group: 'Civil war',
    label: 'Population loss floor',
    doc: 'Minimum share of the ruling bloc lost by the loser.',
  },
  'war.popLossPerScore': {
    v: 1 / 2500, min: 0, max: 0.01, step: 0.00002, group: 'Civil war',
    label: 'Population loss per score point',
    doc: 'Additional ruling-bloc loss per point of war score.',
  },
  'war.popLossMax': {
    v: 0.4, min: 0, max: 1, step: 0.01, group: 'Civil war',
    label: 'Population loss cap',
    doc: 'Upper clamp on the loser\'s ruling-bloc population loss.',
  },
  'war.gdpLossBase': {
    v: 0.02, min: 0, max: 0.5, step: 0.005, group: 'Civil war',
    label: 'GDP transfer floor',
    doc: 'Minimum share of the loser\'s GDP transferred to the winner.',
  },
  'war.gdpLossPerScore': {
    v: 1 / 5000, min: 0, max: 0.01, step: 0.00002, group: 'Civil war',
    label: 'GDP transfer per score point',
    doc: 'Additional GDP transfer per point of war score.',
  },
  'war.gdpLossMax': {
    v: 0.2, min: 0, max: 1, step: 0.01, group: 'Civil war',
    label: 'GDP transfer cap',
    doc: 'Upper clamp on the GDP share transferred.',
  },
  'war.unitePopWeight': {
    v: 0.6, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'Union size score: population weight',
    doc: 'Weight on the proposer\'s population share; the remainder weights its GDP share.',
  },
  'war.uniteSizeFloor': {
    v: 0.6, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'Union: size score floor',
    doc: 'Share of the peace chance that comes from size alone, before political similarity is applied.',
  },
  'war.unitePolitScale': {
    v: 100, min: 10, max: 200, step: 5, group: 'Civil war',
    label: 'Union: political-difference scale',
    doc: 'Margin difference (0..200 points) at which political similarity hits zero.',
  },
  'war.uniteShellPenalty': {
    v: 0.5, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'Union: leader penalty',
    doc: 'How much a full blue-shell severity cuts the peace chance.',
  },
  'war.uniteSeverityScale': {
    v: 200, min: 10, max: 1000, step: 10, group: 'Civil war',
    label: 'Failed-union severity scale',
    doc: 'Turns (1 - peace chance) into a war score for the fallout calculation.',
  },
  'war.unitePeaceMin': {
    v: 0.03, min: 0, max: 0.5, step: 0.01, group: 'Civil war',
    label: 'Union peace floor',
    doc: 'Lowest possible chance a proposed union is peaceful.',
  },
  'war.unitePeaceMax': {
    v: 0.97, min: 0.5, max: 1, step: 0.01, group: 'Civil war',
    label: 'Union peace ceiling',
    doc: 'Highest possible chance a proposed union is peaceful.',
  },

  /* ---------------- nations & annexation ---------------- */
  'nation.minAreas': {
    v: 3, min: 1, max: 50, step: 1, group: 'Nations',
    label: 'Minimum Areas for a new nation',
    doc: 'A contiguous breakaway chunk needs this many Areas to become its own nation. Re-derived at Area scale — 10 was written for counties (M4.3).',
  },
  'nation.minPop': {
    v: 250000, min: 0, max: 5e6, step: 10000, group: 'Nations',
    label: 'Minimum population for a new nation',
    doc: 'Alternative threshold: a chunk qualifies on Areas OR population.',
  },
  'annex.budgetAreas': {
    v: 3, min: 1, max: 50, step: 1, group: 'Annexation',
    label: 'Annex budget (Areas / turn)',
    doc: 'ABSOLUTE per-turn cap. The old cap was a multiple of your own size, which is what let Wyoming take 1,167 Areas in 9 turns (M1.4).',
  },
  'annex.costPerArea': {
    v: 900e6, min: 0, max: 1e10, step: 50e6, group: 'Annexation',
    label: 'Annex cost per Area ($)',
    doc: 'Treasury debited per Area taken. Game.spend finally has a call site.',
  },
  'annex.costPopScale': {
    v: 1400, min: 0, max: 20000, step: 50, group: 'Annexation',
    label: 'Annex cost per head ($)',
    doc: 'Additional treasury cost scaled by the population being taken.',
  },
  'annex.shellCostMult': {
    v: 1.0, min: 0, max: 3, step: 0.05, group: 'Annexation',
    label: 'Leader surcharge',
    doc: 'Extra annex cost multiplier applied in proportion to blue-shell severity.',
  },
  'annex.cooldownTurns': {
    v: 1, min: 0, max: 20, step: 1, group: 'Annexation',
    label: 'Annex cooldown (turns)',
    doc: 'Turns a nation must wait between annexations.',
  },

  /* ---------------- anti-snowball ---------------- */
  'shell.topShare': {
    v: 0.1, min: 0, max: 1, step: 0.02, group: 'Anti-snowball',
    label: 'Leader tier share',
    doc: 'Fraction of nations, by size, that count as the leading tier.',
  },
};

/* ------------------------------------------------------------------ */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const cloneValue = (v) => (Array.isArray(v) ? v.slice() : isPlainObject(v) ? { ...v } : v);

export class Tune {
  constructor(overrides) {
    this.values = {};
    for (const [k, def] of Object.entries(SCHEMA)) this.values[k] = cloneValue(def.v);
    if (overrides) this.load(overrides);
    /** key -> {count, last} for every key served since the last resetReads() */
    this.readLog = new Map();
    this._trace = null;
  }

  /** Read a tunable. Records the key — that recording IS the explanation layer. */
  get(key) {
    const v = this.values[key];
    if (v === undefined) throw new Error(`TUNE: unknown key "${key}"`);
    let rec = this.readLog.get(key);
    if (!rec) this.readLog.set(key, (rec = { count: 0, last: v }));
    rec.count++;
    rec.last = v;
    if (this._trace) this._trace.add(key);
    return v;
  }

  /** Read without recording — for UI that displays a tunable rather than using it. */
  peek(key) {
    return this.values[key];
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.values, key);
  }

  set(key, value) {
    if (!this.has(key)) throw new Error(`TUNE: unknown key "${key}"`);
    this.values[key] = cloneValue(value);
    return this;
  }

  /** Apply a flat {key: value} override map, ignoring keys not in the schema. */
  load(overrides) {
    const unknown = [];
    for (const [k, v] of Object.entries(overrides || {})) {
      if (this.has(k)) this.values[k] = cloneValue(v);
      else unknown.push(k);
    }
    return unknown;
  }

  /** Only the keys that differ from the schema default — what content/tunables.json holds. */
  diff() {
    const out = {};
    for (const [k, def] of Object.entries(SCHEMA)) {
      const cur = this.values[k];
      if (JSON.stringify(cur) !== JSON.stringify(def.v)) out[k] = cloneValue(cur);
    }
    return out;
  }

  /** Every key and its current value — what the dashboard and the save both want. */
  serialize() {
    const out = {};
    for (const k of Object.keys(SCHEMA)) out[k] = cloneValue(this.values[k]);
    return out;
  }

  /** Collect the keys read during fn(). Nests safely. */
  trace(fn) {
    const outer = this._trace;
    const seen = new Set();
    this._trace = seen;
    try {
      const result = fn();
      return { result, keys: [...seen] };
    } finally {
      this._trace = outer;
      if (outer) for (const k of seen) outer.add(k);
    }
  }

  resetReads() {
    this.readLog.clear();
  }

  /** Keys never read since the last reset — finds constants that fell out of use. */
  unreadKeys() {
    return Object.keys(SCHEMA).filter((k) => !this.readLog.has(k));
  }
}

export function createTune(overrides) {
  return new Tune(overrides);
}

/** Metadata for one key, for the dashboard and the "show your work" table. */
export function describe(key) {
  const d = SCHEMA[key];
  if (!d) return null;
  return {
    key,
    label: d.label,
    group: d.group,
    doc: d.doc,
    kind: d.kind || 'number',
    min: d.min,
    max: d.max,
    step: d.step,
    default: cloneValue(d.v),
  };
}

/** Schema grouped for rendering: [{group, keys:[describe(key), ...]}, ...] */
export function groups() {
  const byGroup = new Map();
  for (const key of Object.keys(SCHEMA)) {
    const d = describe(key);
    if (!byGroup.has(d.group)) byGroup.set(d.group, []);
    byGroup.get(d.group).push(d);
  }
  return [...byGroup].map(([group, keys]) => ({ group, keys }));
}

export default { SCHEMA, Tune, createTune, describe, groups };
