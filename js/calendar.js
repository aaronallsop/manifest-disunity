/*
 * The calendar: what date a world turn is.
 *
 * WHY THIS EXISTS. The turn counter has always been a bare integer, and an
 * integer cannot carry a story. Spec v2 §2.2 asks for a real date, and Aaron
 * asked for a specific one: the game opens on 1 March 2036, the eve of two
 * hundred years since Texas declared itself a nation. The bicentenary therefore
 * falls on the second day of play, in the first turn, on a board that has just
 * come apart for the second time.
 *
 * A TURN IS A QUARTER (D163). The month was ruled and then reversed once the
 * cost was priced: every rate in the engine is tuned per turn and calibrated as
 * a quarter, so the unit buys flavour only and the re-derivation was not worth a
 * week. Three months per turn, and the quarters run from the opening date rather
 * than from the calendar's own — turn 0 is March, turn 1 June, turn 2 September,
 * turn 3 December, turn 4 March again. That keeps Aaron's date exact AND gives
 * every turn a real month, which aligning to Jan/Apr/Jul/Oct would not.
 *
 * NOTHING HERE IS A LITERAL. The opening year, the opening month and the number
 * of months in a turn are all tunables, so the whole calendar can be moved from
 * the dashboard without a rebuild — including to one month per turn, if the
 * sub-turn design in docs/FUTURE-IDEAS.md is ever built.
 *
 * PURE. No DOM, no Game, no World. It takes a turn number and returns a date, so
 * the headless simulator and the CSV export can stamp rows with the same answer
 * the turn bar shows, and no two surfaces can disagree about what year it is.
 */
const Calendar = (function () {
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const T = (tune) => tune || window.TUNE;

  /**
   * The date a world turn begins.
   *
   * @returns {{year, month, day, monthName, monthShort, quarter, label, short, iso}}
   *          `month` is 1-12. `quarter` is the calendar quarter the date falls
   *          in, reported rather than assumed — with a March opening the game's
   *          turns and the calendar's quarters do not coincide, and pretending
   *          otherwise would put "Q1" on a June turn.
   */
  function forTurn(turn, tune) {
    const t = T(tune);
    const startYear = t.get('calendar.startYear') | 0;
    const startMonth = t.get('calendar.startMonth') | 0;   // 1-12
    const day = t.get('calendar.startDay') | 0;
    const per = Math.max(1, t.get('calendar.monthsPerTurn') | 0);

    // Months elapsed since the opening, as an absolute month index.
    const abs = (startYear * 12) + (startMonth - 1) + (Math.max(0, turn | 0) * per);
    const year = Math.floor(abs / 12);
    const month = (abs % 12) + 1;

    return {
      year,
      month,
      day,
      monthName: MONTHS[month - 1],
      monthShort: SHORT[month - 1],
      quarter: Math.floor((month - 1) / 3) + 1,
      label: `${MONTHS[month - 1]} ${year}`,
      short: `${SHORT[month - 1]} ${year}`,
      iso: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  }

  /** "March 2036" — what the turn bar shows. */
  const label = (turn, tune) => forTurn(turn, tune).label;

  /** "Mar 2036" — for a table column or a chart axis. */
  const short = (turn, tune) => forTurn(turn, tune).short;

  /** "2036-03-01" — for exports, where a sortable date beats a pretty one. */
  const iso = (turn, tune) => forTurn(turn, tune).iso;

  /**
   * How long a turn is, in words, for a tooltip. Reads the tunable rather than
   * saying "quarter", so it stays true if the length is ever changed.
   */
  function unit(tune) {
    const per = Math.max(1, T(tune).get('calendar.monthsPerTurn') | 0);
    if (per === 1) return 'month';
    if (per === 3) return 'quarter';
    if (per === 6) return 'half-year';
    if (per === 12) return 'year';
    return `${per} months`;
  }

  return { forTurn, label, short, iso, unit, MONTHS, SHORT };
})();
