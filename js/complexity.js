/*
 * Complexity: which layers of the simulation actually run.
 *
 * Two independent flags, both true by default — FULL mode, byte-for-byte the
 * game as it has always run. ECONOMY mode sets both false, so a playtester can
 * learn unite / annex / trade / the market without separatist movements or the
 * politics layer (leaders, elections, coalitions, recognition, pacts, victory)
 * running underneath them. Each flag is independent so a layer can come back
 * on its own, one playtest at a time, rather than all at once.
 *
 * FLAGS ARE READ, NOT PUSHED. Every call site asks `Complexity.enabled(flag)`
 * at the moment it would otherwise act. There is no change event and no
 * re-render hook — switching modes mid-session is a `?complexity=` reload or a
 * new game, exactly like `difficulty`, not a live toggle.
 *
 * `movements`  — separatist movements, sentiment, secession, migration.
 * `politics`   — leaders, elections, the govern action, coalitions,
 *                recognition, pacts/treaties/aid, authored events, victory.
 *
 * annex / unite / trade, the six-sector market, and treasuries are never
 * gated by either flag — they are the core loop this mode exists to isolate.
 */
const Complexity = (function () {
  const FLAGS = ['movements', 'politics'];

  const PRESETS = {
    full: { movements: true, politics: true },
    economy: { movements: false, politics: false },
  };

  const KEY = 'ns_complexity';
  let state = { ...PRESETS.full };

  function enabled(flag) { return !!state[flag]; }

  /** Apply a named preset ('full' | 'economy'). An unknown name falls back to full. */
  function applyPreset(name) {
    state = { ...(PRESETS[name] || PRESETS.full) };
    try { localStorage.setItem(KEY, current()); } catch (e) { /* not important enough to fail */ }
    return current();
  }

  /**
   * The preset actually in effect, named the same way `Telemetry.current()`
   * names a difficulty: read back from state rather than from what was asked
   * for, so a save's own flags are always described honestly.
   */
  function current() {
    for (const name of Object.keys(PRESETS)) {
      const p = PRESETS[name];
      if (FLAGS.every((f) => state[f] === p[f])) return name;
    }
    return 'custom';
  }

  /** What the player chose last time, if they chose. */
  function remembered() {
    try { return localStorage.getItem(KEY) || 'full'; } catch (e) { return 'full'; }
  }

  /**
   * Boot-time resolution, in the same precedence `difficulty` uses in
   * js/app.js: an explicit `?complexity=` wins, then a loaded save's own
   * record of what it was played with, then whatever was remembered last,
   * then Full.
   *
   * @param {{url?: string, saved?: {movements: boolean, politics: boolean}}} opts
   */
  function init(opts) {
    const { url, saved } = opts || {};
    if (url && PRESETS[url]) return applyPreset(url);
    if (saved) {
      state = { movements: !!saved.movements, politics: !!saved.politics };
      return current();
    }
    return applyPreset(remembered());
  }

  function serialize() { return { ...state }; }

  /** Test hygiene: back to Full between suites, like every other singleton here. */
  function reset() { state = { ...PRESETS.full }; }

  return { FLAGS, PRESETS, enabled, applyPreset, current, remembered, init, serialize, reset };
})();
