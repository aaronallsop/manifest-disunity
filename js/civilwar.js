/*
 * Civil War resolver (pure math — no DOM, no globals, rng and tune passed in).
 *
 * Triggered by an annexation when any of these hold:
 *   - the annexation flips the nation's PLURALITY party,
 *   - the annexed counties' GDP exceeds the nation's current GDP,
 *   - the annexed counties' population exceeds the nation's current population.
 *
 * Scoring — three deliberate properties, each fixing a way the old version was
 * not a dice game at all:
 *
 *   1. POINTS ARE A RATIO, NOT AN ABSOLUTE, AND ARE NOT ROUNDED.
 *      `round(pop/1e6) + round(gdp/1e10)` gave the median Area (88,948 people,
 *      $4.93B) exactly 0 points, so `score = 0` and the war was an automatic
 *      victory however the dice fell. Points are now how big the bite is
 *      relative to the biter — which is the quantity the trigger already cares
 *      about — passed through a square root so that doubling your size is a bad
 *      gamble rather than certain doom.
 *
 *   2. THE DICE ARE SUMMED, NOT MULTIPLIED, AND THEIR COUNT IS CAPPED.
 *      A real party flip produced 4-10 dice, and at 10 dice the median product
 *      is 3.5^10 = 2.8e5 — six orders of magnitude past the 67 threshold, so
 *      even the minimum possible product still landed in `fall_apart`. Score now
 *      grows linearly in the dice, so the outcome is a distribution.
 *
 *   3. FLIP MAGNITUDE IS MEASURED FROM THE PLURALITY, NOT FROM 50%.
 *      `50 - oldMajorityShareAfter` conflates "below 50%" with "lost the lead".
 *      Once emergent movements exist (up to 20% at spawn, growing toward 35%)
 *      both D and R sit far below 50, so a 1-point flip yielded 10-15 dice.
 *
 *   score   = pointsScale * sqrt(sizeRatio) * (d1 + d2 + ... + dN)
 *   0..33   -> victory        (annex everything)
 *   34..66  -> partial        (contiguous border-adjacent subset, sized by score)
 *   67+     -> fall apart     (targets fragment into new nations)
 */
const CivilWar = (function () {
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  /**
   * Ideology shares of a demographics object, as percentages.
   *
   * The engine used to answer this with a D-vs-R letter that ignored emergent
   * movements entirely, so a nation that was 40% Deseret / 31% R / 29% D
   * reported its lean as a minority party. It is now just the ideology mix.
   */
  function shares(demo) {
    if (!demo) return [];
    if (demo.shares) return demo.shares;
    if (demo.mix) return Ideology.shares(demo.mix);
    return [];
  }

  /** The leading ideology and its share. `index` is -1 for an empty scope. */
  function plurality(demo) {
    const s = shares(demo);
    let index = -1, pct = 0;
    for (let i = 0; i < s.length; i++) if (s[i] > pct) { index = i; pct = s[i]; }
    return { index, id: Ideology.idAt(index), name: Ideology.nameAt(index), pct };
  }

  /*
   * Would annexing `added` into `before` trigger a civil war, and why?
   *
   * The size triggers fire on the RATIO of what you took this turn to what you
   * already held, not on out-and-out exceedance. The old rule needed a single
   * annexation to outweigh the entire nation, which an absolute per-turn Area
   * budget (M1.4) makes unreachable for anyone larger than a few Areas — so the
   * only surviving trigger would have been the flip.
   */
  function assess(before, added, after, tune) {
    const tn = tune || window.TUNE;
    const ratio = tn.get('war.triggerSizeRatio');
    const b = plurality(before), a = plurality(after);
    const flip = b.index >= 0 && a.index >= 0 && b.index !== a.index;
    const reasons = [];
    if (flip) reasons.push('flip');
    if (added.gdp > before.gdp * ratio) reasons.push('gdp');
    if (added.pop > before.pop * ratio) reasons.push('pop');
    return {
      flip, reasons, triggered: reasons.length > 0,
      fromParty: b.name, toParty: a.name,
      fromIdeology: b.id, toIdeology: a.id,
      // How far the nation MOVED on the two axes. A flip between neighbouring
      // ideologies is a smaller shock than one across the board, and this is
      // the number that says so — the letter could not.
      shift: before.centroid && after.centroid
        ? Ideology.distance(before.centroid, after.centroid) : 0,
    };
  }

  /**
   * How decisively the plurality flipped, in percentage points: the new leader's
   * share minus what the old leader is left with, scaled by how far apart the
   * two ideologies actually are.
   *
   * The distance factor is the thing six symmetric ideologies buy that a letter
   * could not express: losing the lead from Republican to Conservative
   * Nationalist — neighbours on both axes — is a different event from losing it
   * to Socialist, and the dice should say so. `affinity` is 1 for identical and
   * 0 for the furthest pair in the set, so `1 - affinity` is the shock.
   */
  function flipMagnitude(before, after) {
    const b = plurality(before), a = plurality(after);
    if (b.index < 0 || a.index < 0 || b.index === a.index) return 0;
    const afterShares = shares(after);
    const gap = Math.max(0, a.pct - (afterShares[b.index] || 0));
    return gap * (1 - Ideology.affinity(b.index, a.index));
  }

  /**
   * Dice for a flip, capped. Uncapped multiplied dice were the whole problem.
   *
   * The FLOOR matters as much as the cap: losing your governing plurality is a
   * constitutional crisis whatever replaces it, so any flip costs at least
   * `war.diceFlipFloor` dice. Without it, scaling the magnitude by ideological
   * distance made the commonest flip of all — Democrat to Republican, adjacent
   * on both axes — a guaranteed walkover: measured 400 victories out of 400.
   */
  function diceCount(before, after, tune) {
    const mag = flipMagnitude(before, after);
    if (mag <= 0) return 0;
    const per = tune.get('war.dicePerFlipPoint');
    const floor = tune.get('war.diceFlipFloor');
    return clamp(floor + Math.round(per * mag), 1, tune.get('war.maxDice'));
  }

  /**
   * Points: how big the annexation is relative to the annexer, compressed.
   *
   * Continuous — no rounding at any magnitude. `sqrt` (war.pointsCurve) is what
   * keeps a 1:1 annexation a bad gamble rather than a mathematical certainty:
   * without it, score is linear in size and every large annexation is a
   * guaranteed fall-apart regardless of the dice.
   */
  function points(before, added, tune) {
    const wPop = tune.get('war.sizeRatioPopWeight');
    const popRatio = added.pop / Math.max(1, before.pop);
    const gdpRatio = added.gdp / Math.max(1, before.gdp);
    const ratio = wPop * popRatio + (1 - wPop) * gdpRatio;
    return Math.pow(Math.max(0, ratio), tune.get('war.pointsCurve'));
  }

  /**
   * Full resolution.
   * @param before/added/after demographics objects
   * @param opts {rng (required), tune, scoreMult}
   */
  function resolve(before, added, after, opts = {}) {
    const tune = opts.tune || window.TUNE;
    const dieStream = opts.rng.stream('combat');
    const mult = opts.scoreMult || 1;
    const { flip, reasons, triggered, fromParty, toParty, fromIdeology, toIdeology, shift } =
      assess(before, added, after, tune);
    const dc = Math.max(triggered ? 1 : 0, diceCount(before, after, tune));

    const sides = tune.get('war.diceSides');
    const dice = [];
    let sum = 0;
    for (let i = 0; i < dc; i++) { const d = dieStream.roll(sides); dice.push(d); sum += d; }

    const pts = points(before, added, tune);
    const score = dc ? Math.round(pts * sum * mult * tune.get('war.pointsScale')) : 0;
    const outcome = score <= tune.get('war.victoryBand') ? 'victory'
      : score <= tune.get('war.partialBand') ? 'partial' : 'fall_apart';
    return {
      flip, reasons, triggered, fromParty, toParty, fromIdeology, toIdeology, shift,
      diceCount: dc, dice, diceSum: sum,
      points: pts, flipMagnitude: flipMagnitude(before, after),
      score, outcome, scoreMult: mult,
    };
  }

  /**
   * What fraction of the contested Areas a partial victory keeps.
   * A score just past the victory band keeps nearly all of them; a score at the
   * top of the partial band keeps the floor.
   */
  function partialKeepFraction(score, tune) {
    const vb = tune.get('war.victoryBand'), pb = tune.get('war.partialBand');
    const span = Math.max(1, pb - vb);
    return clamp((pb - score) / span, tune.get('war.partialMinKeep'), 1);
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
    // How alike the two nations are politically: the affinity of their
    // population centroids on the two axes. This was |(S.dem-S.gop) -
    // (T.dem-T.gop)|, a distance along ONE line that no longer exists.
    const politSim = Ideology.mixAffinity(S.mix || [], T.mix || []);
    const floor = tn.get('war.uniteSizeFloor');
    let p = sizeScore * (floor + (1 - floor) * politSim);
    p *= 1 - tn.get('war.uniteShellPenalty') * shell;
    return Math.max(tn.get('war.unitePeaceMin'), Math.min(tn.get('war.unitePeaceMax'), p));
  }

  // Severity score for a failed union (used for population/GDP fallout).
  const uniteSeverity = (p, tune) =>
    Math.round((1 - p) * (tune || window.TUNE).get('war.uniteSeverityScale'));

  return {
    assess, diceCount, points, resolve, unitePeaceChance, uniteSeverity,
    shares, plurality, flipMagnitude, partialKeepFraction,
  };
})();
