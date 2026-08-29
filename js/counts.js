/*
 * Shares -> head counts that sum EXACTLY to the population.
 *
 * Ported from `game_state.py:_counts_from_percentages`, which is the one thing
 * in that abandoned Python mirror worth keeping. Everything else in it was a
 * second, divergent implementation of the JS model — a different drift
 * denominator, a different growth base, and 3,143 counties against the JS
 * model's 1,676 merged Areas — so it could not validate the engine, which is the
 * only reason a mirror would earn its keep.
 *
 * WHY EXACTNESS MATTERS HERE. A county's population is an integer from the
 * Census; its politics are percentages to one decimal place. Multiplying the two
 * gives three floats that do not sum to the integer:
 *
 *     pop 88948, dem 41.7%, gop 56.9%, other 1.4%
 *     -> 37091.316 + 50611.412 + 1245.272 = 88948.00000000001
 *
 * Small, but it is the seed of a class of bug that is very hard to see later: a
 * nation's reported population is the sum of ~1,676 of those, every world turn
 * multiplies them again, and any invariant stated as "the counts sum to the
 * population" quietly becomes "the counts sum to the population, to within some
 * tolerance nobody wrote down". The fix is one line — round each share, then push
 * the whole residual onto the largest bloc — and it makes the invariant testable
 * as an equality instead of an approximation.
 *
 * The residual goes to the LARGEST bloc because that is where it is proportionally
 * smallest: at most half a person on a bloc of tens of thousands.
 */

/**
 * Integer head counts from shares, summing to exactly `population`.
 *
 * @param {number} population  total head count (rounded to an integer)
 * @param {Object<string, number>} shares  name -> share; see `scale`
 * @param {number} [scale=100]  what a full share is worth (100 for percentages,
 *                              1 for fractions)
 * @returns {Object<string, number>} name -> integer count
 */
export function countsFromShares(population, shares, scale = 100) {
  const pop = Math.round(population || 0);
  const counts = {};
  const names = Object.keys(shares);
  if (!names.length) return counts;

  let total = 0;
  for (const name of names) {
    const c = Math.round(((shares[name] || 0) / scale) * pop);
    counts[name] = c;
    total += c;
  }

  // Absorb the rounding residual on the largest bloc, where it is proportionally
  // smallest. Ties break on the sorted name so the result is reproducible.
  let residual = pop - total;
  if (residual !== 0) {
    let best = null, bv = -Infinity;
    for (const name of names.slice().sort()) {
      if (counts[name] > bv) { best = name; bv = counts[name]; }
    }
    counts[best] += residual;
    // A residual larger than the largest bloc would drive it negative — only
    // reachable from shares that do not sum to `scale`. Clamp and re-spread.
    if (counts[best] < 0) {
      residual = counts[best];
      counts[best] = 0;
      for (const name of names.slice().sort()) {
        if (residual === 0) break;
        const take = Math.min(counts[name], -residual);
        counts[name] -= take;
        residual += take;
      }
    }
  }
  return counts;
}

/**
 * The inverse: shares from counts, as percentages of their own total.
 * Returns all-zero shares for an empty population rather than NaN.
 */
export function sharesFromCounts(counts, scale = 100) {
  let total = 0;
  for (const k in counts) total += counts[k];
  const out = {};
  for (const k in counts) out[k] = total ? (counts[k] / total) * scale : 0;
  return out;
}

/** Sum of a count bag. */
export function sumCounts(counts) {
  let t = 0;
  for (const k in counts) t += counts[k];
  return t;
}

export default { countsFromShares, sharesFromCounts, sumCounts };
