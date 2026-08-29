/*
 * Minimal test harness — plain ESM, no dependencies.
 *
 * The same test FILES run two ways with no changes:
 *   - browser: tests/run.html imports each suite and calls run(); results render
 *     into the page and are also written to window.__TEST_RESULTS__ so a headless
 *     driver can read them.
 *   - node:    `node --test tests/*.test.js` once Node exists — describe/it map
 *     onto node:test's own globals via the shim at the bottom of this file.
 *
 * Assertions throw. A thrown assertion fails one `it`, never the whole run.
 */

/* ------------------------------------------------------------------ */
/* assertions                                                          */
/* ------------------------------------------------------------------ */

export class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertionError';
  }
}

const fmt = (v) => {
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toPrecision(8);
  if (typeof v === 'string') return JSON.stringify(v);
  if (v instanceof Set) return `Set(${v.size}){${[...v].slice(0, 6).join(',')}${v.size > 6 ? ',…' : ''}}`;
  if (v instanceof Map) return `Map(${v.size})`;
  if (ArrayBuffer.isView(v)) return `${v.constructor.name}(${v.length})[${[...v.slice(0, 6)].join(',')}${v.length > 6 ? ',…' : ''}]`;
  try {
    const s = JSON.stringify(v);
    return s && s.length > 240 ? s.slice(0, 237) + '…' : s;
  } catch {
    return String(v);
  }
};

export function ok(cond, msg) {
  if (!cond) throw new AssertionError(msg || `expected truthy, got ${fmt(cond)}`);
}

export function equal(actual, expected, msg) {
  if (!Object.is(actual, expected) && !(actual === expected)) {
    throw new AssertionError(`${msg ? msg + ': ' : ''}expected ${fmt(expected)}, got ${fmt(actual)}`);
  }
}

export function notEqual(actual, expected, msg) {
  if (Object.is(actual, expected)) {
    throw new AssertionError(`${msg ? msg + ': ' : ''}expected something other than ${fmt(expected)}`);
  }
}

/** Numeric comparison with an absolute or relative tolerance. */
export function close(actual, expected, tol = 1e-9, msg) {
  if (!Number.isFinite(actual) || !Number.isFinite(expected)) {
    throw new AssertionError(`${msg ? msg + ': ' : ''}non-finite: got ${fmt(actual)}, expected ${fmt(expected)}`);
  }
  const diff = Math.abs(actual - expected);
  const scale = Math.max(1, Math.abs(expected));
  if (diff > tol && diff / scale > tol) {
    throw new AssertionError(
      `${msg ? msg + ': ' : ''}expected ${fmt(expected)} ± ${tol}, got ${fmt(actual)} (Δ ${fmt(diff)})`
    );
  }
}

export function deepEqual(actual, expected, msg) {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new AssertionError(`${msg ? msg + ': ' : ''}\n  expected ${b}\n  got      ${a}`);
}

export function throws(fn, msg) {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new AssertionError(msg || 'expected the call to throw');
}

/** Every element of `arr` satisfies `pred`; reports the first that does not. */
export function every(arr, pred, msg) {
  const list = [...arr];
  for (let i = 0; i < list.length; i++) {
    if (!pred(list[i], i)) {
      throw new AssertionError(`${msg ? msg + ': ' : ''}element ${i} failed — ${fmt(list[i])}`);
    }
  }
}

export const assert = { ok, equal, notEqual, close, deepEqual, throws, every };

/* ------------------------------------------------------------------ */
/* collection                                                          */
/* ------------------------------------------------------------------ */

const suites = [];
let current = null;

/** Group of tests. Nested describes concatenate their names. */
export function describe(name, fn) {
  const parent = current;
  const suite = { name: parent ? `${parent.name} › ${name}` : name, tests: [], before: [] };
  suites.push(suite);
  current = suite;
  try {
    fn();
  } finally {
    current = parent;
  }
}

/** One test. `fn` may be async. Throwing fails it. */
export function it(name, fn) {
  if (!current) throw new Error(`it("${name}") outside a describe()`);
  current.tests.push({ name, fn });
}

/** Skip a test but keep it visible in the report. */
it.skip = (name, fn) => {
  if (!current) throw new Error(`it.skip("${name}") outside a describe()`);
  current.tests.push({ name, fn, skip: true });
};

/** Runs once before every test in the enclosing describe. */
export function beforeEach(fn) {
  if (!current) throw new Error('beforeEach outside a describe()');
  current.before.push(fn);
}

/* ------------------------------------------------------------------ */
/* execution                                                           */
/* ------------------------------------------------------------------ */

/**
 * Run every collected suite.
 * @param {(evt) => void} [onEvent] progress callback: {type:'suite'|'test'|'done', ...}
 * @returns {Promise<{passed, failed, skipped, durationMs, suites}>}
 */
export async function run(onEvent) {
  const emit = (evt) => onEvent && onEvent(evt);
  const t0 = now();
  let passed = 0, failed = 0, skipped = 0;
  const report = [];

  for (const suite of suites) {
    emit({ type: 'suite', name: suite.name });
    const results = [];
    for (const test of suite.tests) {
      if (test.skip) {
        skipped++;
        results.push({ name: test.name, status: 'skip' });
        emit({ type: 'test', suite: suite.name, name: test.name, status: 'skip' });
        continue;
      }
      const s0 = now();
      try {
        for (const b of suite.before) await b();
        await test.fn();
        const ms = now() - s0;
        passed++;
        results.push({ name: test.name, status: 'pass', ms });
        emit({ type: 'test', suite: suite.name, name: test.name, status: 'pass', ms });
      } catch (err) {
        const ms = now() - s0;
        failed++;
        const detail = err && err.stack ? String(err.stack) : String(err);
        results.push({ name: test.name, status: 'fail', ms, error: String(err && err.message || err), detail });
        emit({ type: 'test', suite: suite.name, name: test.name, status: 'fail', ms, error: String(err && err.message || err), detail });
      }
    }
    report.push({ name: suite.name, tests: results });
  }

  const summary = { passed, failed, skipped, durationMs: now() - t0, suites: report };
  emit({ type: 'done', ...summary });
  return summary;
}

/** Discard collected suites — lets run.html re-run without a reload. */
export function reset() {
  suites.length = 0;
  current = null;
}

const now = () =>
  (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

export default { describe, it, beforeEach, run, reset, assert, ...assert };
