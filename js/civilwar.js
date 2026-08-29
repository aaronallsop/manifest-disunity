/*
 * Civil War resolver (pure math).
 *
 * Triggered by an annexation when any of these hold:
 *   - the annexation flips the nation's majority party,
 *   - the annexed counties' GDP exceeds the nation's current GDP,
 *   - the annexed counties' population exceeds the nation's current population.
 *
 * Scoring:
 *   dice   = ceil(points past 50% into the other party)   [>=1 if any trigger]
 *   points = round(addedPop / 1e6) + round(addedGdp / 1e10)
 *   score  = points * (d1 * d2 * ... )                     [each die 1-6]
 *
 *   0-33  -> victory        (annex everything)
 *   34-66 -> partial        (same-lean contiguous subset)
 *   67+   -> fall apart     (targets fragment into new nations)
 */
const CivilWar = (function () {
  const roll = (rng, sides) => rng.roll(sides);

  // Would annexing `added` into `before` trigger a civil war, and why?
  function assess(before, added, after) {
    const flip = before.lean != null && after.lean != null && before.lean !== after.lean;
    const reasons = [];
    if (flip) reasons.push('flip');
    if (added.gdp > before.gdp) reasons.push('gdp');
    if (added.pop > before.pop) reasons.push('pop');
    return { flip, reasons, triggered: reasons.length > 0 };
  }

  function diceCount(before, after) {
    if (before.lean == null || after.lean == null || before.lean === after.lean) return 0;
    const oldMajorityShareAfter = before.lean === 'D' ? after.dem : after.gop;
    return Math.max(1, Math.ceil(50 - oldMajorityShareAfter)); // how far past 50 into the other party
  }

  function points(added, tune) {
    return Math.round(added.pop / tune.get('war.popPerPoint'))
         + Math.round(added.gdp / tune.get('war.gdpPerPoint'));
  }

  // Full resolution. `before`/`after`/`added` are demographics objects.
  // opts.scoreMult scales the score (blue-shell penalty for big aggressors).
  // opts.rng is REQUIRED: every die comes from the caller's 'combat' stream.
  function resolve(before, added, after, opts = {}) {
    const dieStream = opts.rng.stream('combat');
    const tune = opts.tune || window.TUNE;
    const mult = opts.scoreMult || 1;
    const { flip, reasons, triggered } = assess(before, added, after);
    const dc = Math.max(triggered ? 1 : 0, diceCount(before, after));
    const dice = [];
    let product = 1;
    const sides = tune.get('war.diceSides');
    for (let i = 0; i < dc; i++) { const d = roll(dieStream, sides); dice.push(d); product *= d; }
    const pts = points(added, tune);
    const score = dc ? Math.round(pts * product * mult * tune.get('war.pointsScale')) : 0;
    const outcome = score <= tune.get('war.victoryBand') ? 'victory'
      : score <= tune.get('war.partialBand') ? 'partial' : 'fall_apart';
    return { flip, reasons, triggered, diceCount: dc, dice, points: pts, product, score, outcome, scoreMult: mult };
  }

  // Probability a union is peaceful (vs. sparking a splinter civil war). Driven by
  // combined-population share, GDP share, and political similarity, clamped so there
  // is always a chance either way. A blue-shell penalty (0..1) lowers it.
  function unitePeaceChance(S, T, shell = 0, tune) {
    const tn = tune || window.TUNE;
    const popShare = S.pop + T.pop > 0 ? S.pop / (S.pop + T.pop) : 0.5;
    const gdpShare = S.gdp + T.gdp > 0 ? S.gdp / (S.gdp + T.gdp) : 0.5;
    const wPop = tn.get('war.unitePopWeight');
    const sizeScore = wPop * popShare + (1 - wPop) * gdpShare;
    const marginDiff = Math.abs((S.dem - S.gop) - (T.dem - T.gop)); // 0..200
    const politSim = Math.max(0, 1 - marginDiff / tn.get('war.unitePolitScale'));
    const floor = tn.get('war.uniteSizeFloor');
    let p = sizeScore * (floor + (1 - floor) * politSim);
    p *= 1 - tn.get('war.uniteShellPenalty') * shell;
    return Math.max(tn.get('war.unitePeaceMin'), Math.min(tn.get('war.unitePeaceMax'), p));
  }

  // Severity score for a failed union (used for population/GDP fallout).
  const uniteSeverity = (p, tune) => Math.round((1 - p) * (tune || window.TUNE).get('war.uniteSeverityScale'));

  return { assess, diceCount, points, resolve, unitePeaceChance, uniteSeverity };
})();
