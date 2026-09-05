/*
 * The calendar (spec v2 §2.2).
 *
 * A turn is a quarter and the game opens on 1 March 2036, the eve of two hundred
 * years since Texas declared itself a nation (D163). These tests pin the two
 * properties that make the date worth having: it is DERIVED from tunables rather
 * than hardcoded, so the dashboard can move it; and one answer serves every
 * surface, so the turn bar, the journal and the export cannot disagree about
 * what year it is.
 */
import { describe, it, ok, equal } from './harness.js';

const T = () => window.TUNE;

describe('Calendar', () => {
  it('opens on the authored date — March 2036, turn 0', () => {
    const d = Calendar.forTurn(0, T());
    equal(d.year, 2036, 'opening year');
    equal(d.month, 3, 'opening month is March');
    equal(d.label, 'March 2036');
    equal(d.iso, '2036-03-01', 'exports get a sortable full date');
  });

  it('advances one quarter per turn, so four turns is a year', () => {
    equal(Calendar.label(0, T()), 'March 2036');
    equal(Calendar.label(1, T()), 'June 2036');
    equal(Calendar.label(2, T()), 'September 2036');
    equal(Calendar.label(3, T()), 'December 2036');
    equal(Calendar.label(4, T()), 'March 2037', 'four turns later, same month, next year');
    equal(Calendar.label(40, T()), 'March 2046', 'ten years is forty turns');
  });

  /*
   * The reason the quarters run from March rather than from January: it keeps
   * Aaron's opening date exact AND leaves every turn on a real month. Aligning
   * to calendar quarters would have printed "Q1" over a June turn.
   */
  it('every turn lands on a real month, not an abstract quarter', () => {
    const months = new Set();
    for (let t = 0; t < 40; t++) months.add(Calendar.forTurn(t, T()).monthName);
    equal(months.size, 4, 'exactly four distinct months recur');
    ok(months.has('March') && months.has('June') && months.has('September') && months.has('December'),
       `expected March/June/September/December, got ${[...months].join(', ')}`);
  });

  it('is derived from tunables, not hardcoded — the dashboard can move it', () => {
    const tune = window.TuneMeta.createTune();
    tune.load({ 'calendar.startYear': 1861, 'calendar.startMonth': 4, 'calendar.monthsPerTurn': 1 });
    equal(Calendar.label(0, tune), 'April 1861');
    equal(Calendar.label(1, tune), 'May 1861', 'one month per turn when set to one');
    equal(Calendar.unit(tune), 'month', 'and it says so, rather than still claiming a quarter');
  });

  it('names its own turn length rather than assuming a quarter', () => {
    equal(Calendar.unit(T()), 'quarter');
  });

  it('never runs backwards, and treats a negative turn as the opening', () => {
    equal(Calendar.label(-5, T()), Calendar.label(0, T()), 'before the beginning is the beginning');
    let prev = -Infinity;
    for (let t = 0; t < 100; t++) {
      const d = Calendar.forTurn(t, T());
      const abs = d.year * 12 + d.month;
      ok(abs > prev, `turn ${t} (${d.label}) did not advance past the turn before it`);
      prev = abs;
    }
  });

  it('reports the calendar quarter honestly, rather than pretending turns are quarters', () => {
    // Turn 0 is March, which really is in calendar Q1. Turn 1 is June: Q2.
    equal(Calendar.forTurn(0, T()).quarter, 1);
    equal(Calendar.forTurn(1, T()).quarter, 2);
    equal(Calendar.forTurn(2, T()).quarter, 3);
    equal(Calendar.forTurn(3, T()).quarter, 4);
  });

  it('crosses the year boundary correctly', () => {
    const tune = window.TuneMeta.createTune();
    tune.load({ 'calendar.startYear': 2036, 'calendar.startMonth': 11, 'calendar.monthsPerTurn': 3 });
    equal(Calendar.label(0, tune), 'November 2036');
    equal(Calendar.label(1, tune), 'February 2037', 'three months on from November is the next year');
  });
});
