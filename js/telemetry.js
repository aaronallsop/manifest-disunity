/*
 * TELEMETRY AND DIFFICULTY (M13.1) — the instrument for the playtest program.
 *
 * The audit's observation, and it is the reason this file is short: "the ledger
 * is a telemetry system. Your playtest program's instrument already exists; it
 * just needs an export button." That is exactly right. Every action, every
 * civil-war roll, every election and every Why record has been written to the
 * ledger since M6.3, the per-turn series the dashboard graphs comes out of
 * `Sim`, and the save document already knows how to describe a whole world.
 * Nothing here computes anything. It collects.
 *
 * WHAT A PLAYTEST NEEDS TO ANSWER, from docs/AUDIT-PLAN.md M13:
 *   - when did you first feel behind      -> the per-turn standings series
 *   - what did you do on turn 25          -> the player's own action history
 *   - did you see the secession coming    -> pressure at the Areas that left,
 *                                            in the turns before they did
 *   - did you understand why you lost     -> the ledger, with its Why terms
 *
 * So the export is the ledger, a per-turn series sampled as the game is played
 * rather than simulated, and the run's identity — seed, board, tuning, who they
 * played. A session is reconstructable from it without the save file, which
 * matters because a tester who hits a bug is far likelier to send a 400 KB JSON
 * than to find `data/state.json`.
 *
 * THE DIFFICULTY PRESETS ARE TUNE OVERRIDES, and that is the whole point of
 * them: "so the playtest can A/B pacing without builds." Every one is a handful
 * of numbers that already exist and already have documented meanings, so a
 * preset is a hypothesis about pacing written in the game's own vocabulary
 * rather than a second set of rules to keep in step.
 */
const Telemetry = (function () {
  /*
   * ONE ROW PER TURN, SAMPLED AS IT HAPPENS. The alternative — reconstructing
   * the series from the save at the end — cannot work: a save is the present,
   * and the questions above are all about the shape of the middle.
   */
  let series = [];
  let started = null;

  /*
   * THE PLAY LOG — what the PLAYER did, which the ledger cannot see.
   *
   * The ledger is a record of what happened in the WORLD: it has every action
   * that resolved, with the Why terms that justify it. What it does not have,
   * and cannot have, is the half of a playtest that is about the person:
   *
   *   TIME      how long they sat on turn 24. The single best signal for "where
   *             did they get stuck, and where did they get bored" — and it is
   *             not recoverable from a save, because a save has no clock.
   *   ABANDONED an annexation they opened, looked at, and cancelled is a
   *             decision they CONSIDERED and rejected. That never reaches the
   *             ledger, and it is exactly the moment a designer wants to see.
   *   REFUSED   every time the game said no. A tester who hits the same refusal
   *             four times has found something the game explains badly.
   *   LOOKED AT which map modes they used, whether they ever opened Objectives,
   *             whether they read the journal. This is how you find out if the
   *             M10 onboarding worked rather than assuming it did.
   *
   * Deliberately small: a kind, a turn, a millisecond offset, and one short
   * detail string. No coordinates, no free text the player typed, nothing about
   * the machine. It is a record of a game, and it should read like one to
   * anybody who opens the file.
   */
  let log = [];
  const LOG_CAP = 8000;   // ~40 an hour of hard play; a bound, not a budget

  /**
   * Note something the player did.
   *
   * Cheap enough to call from a click handler and safe enough to call before
   * the recording has started — a session that begins mid-boot is still a
   * session.
   */
  function note(kind, detail) {
    if (log.length >= LOG_CAP) return;
    log.push({
      t: started ? Date.now() - started : 0,
      turn: typeof World !== 'undefined' ? World.getTurn() : 0,
      kind,
      ...(detail && typeof detail === 'object' ? detail : (detail == null ? {} : { d: String(detail) })),
    });
  }

  /** Begin (or restart) a recording. Called at boot and on a new game. */
  function reset() {
    series = [];
    log = [];
    started = Date.now();
  }

  /**
   * Take this turn's row.
   *
   * Deliberately cheap and deliberately small: five stocks for the player, the
   * standings of the top few, the pressure high-water mark, and the counts. A
   * hundred-turn session is a few hundred kilobytes, which is a thing somebody
   * will actually email you.
   */
  function sample() {
    const me = Game.getPlayer();
    const n = me ? Game.getNation(me) : null;
    const row = {
      turn: World.getTurn(),
      nations: Game.nations.size,
      you: me || null,
    };
    if (n) {
      const d = Game.nationDemographics(me);
      row.pop = Math.round(d.pop);
      row.gdp = Math.round(d.gdp);
      row.areas = n.counties.size;
      row.treasury = Math.round(n.treasury);
      row.authority = round3(n.authority);
      row.influence = round3(n.influence);
      row.qol = round3(n.qol);
      row.liberties = round3(n.liberties);
      row.weariness = round3(n.weariness);
    }
    /*
     * "WHEN DID YOU FIRST FEEL BEHIND" is not answerable from a stock. It is
     * answerable from where the player sat in the standings, turn by turn,
     * against what they could see of everybody else.
     */
    if (typeof Victory !== 'undefined' && Victory.loaded()) {
      const st = Victory.standings(window.TUNE, 5);
      row.leaders = st.map((r) => ({ nid: r.nid, p: round3(r.best.progress), c: r.best.id }));
      if (me) {
        const mine = Victory.progress(me, window.TUNE);
        row.mine = mine.map((r) => ({ c: r.id, p: round3(r.progress) }));
        const all = Victory.standings(window.TUNE);
        row.rank = all.findIndex((r) => r.nid === me) + 1;
      }
    }
    /*
     * "DID YOU SEE THE SECESSION COMING" needs the pressure the player could
     * have looked at, not the secession they got. The high-water mark inside
     * their own ground is the one number that says "the map was telling you".
     */
    if (n && typeof Sentiment !== 'undefined') {
      let worst = 0, worstArea = null;
      for (const f of n.counties) {
        const p = Sentiment.pressure(f);
        if (p > worst) { worst = p; worstArea = f; }
      }
      row.peakPressure = round3(worst);
      row.peakArea = worstArea;
    }
    /*
     * HOW LONG THAT TURN TOOK. Wall-clock between samples, which is the number
     * "what did you do on turn 25" is really asking about — a turn somebody
     * spent four minutes on is a turn that mattered to them, and a run of
     * eight-second turns is somebody clicking End turn to see what happens.
     */
    const prev = series[series.length - 1];
    row.ms = prev && prev.at ? Date.now() - prev.at : 0;
    row.at = Date.now();
    series.push(row);
    return row;
  }

  const round3 = (x) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 1000) / 1000 : null);

  /* ---- the export --------------------------------------------------- */

  /**
   * Everything a playtest session is, as one object.
   *
   * The ledger goes in whole. It is the largest part of the file and the only
   * part that answers "why did that happen" — every entry carries the `terms`
   * that justify it, which is what makes this a telemetry export rather than a
   * score sheet.
   */
  function collect() {
    return {
      kind: 'ns-telemetry',
      v: 1,
      // The run's identity: enough to replay it, and to know what it was played on.
      run: {
        seed: store.seed,
        scenario: store.scenario ? (store.scenario.id || 'shattered') : 'none',
        build: typeof StateDoc !== 'undefined' ? StateDoc.buildStamp(store.areasDef) : null,
        saveVersion: typeof StateDoc !== 'undefined' ? StateDoc.VERSION : null,
        difficulty: current(),
        started, ended: Date.now(),
        turns: World.getTurn(),
      },
      // Only the deliberate overrides, so a schema change is not baked into a
      // report and a diff between two testers is a diff of what they changed.
      tune: window.TUNE.diff(),
      player: {
        nid: Game.getPlayer(),
        name: store.playerName || (Game.playerNation() ? Game.playerNation().name : null),
      },
      series,
      // What the player did, including the things that never reached the ledger.
      log,
      /*
       * The player's OWN actions, pulled out of the ledger rather than tracked
       * separately, because a second record of the same thing is a second thing
       * that can be wrong. "What did you do on turn 25" is a filter, not a log.
       */
      actions: Ledger.all()
        .filter((e) => e.phase === 'action' && e.subject === Game.getPlayer())
        .map((e) => ({ turn: e.turn, kind: e.kind, delta: e.delta, text: e.text })),
      ledger: Ledger.serialize(),
    };
  }

  /**
   * Hand the file over.
   *
   * Written to the local server when there is one — `content/` is where this
   * project already keeps documents a human collects — and offered as a
   * download when there is not, because a tester running from a file:// URL is
   * exactly the tester whose data is hardest to get.
   */
  async function exportRun(name) {
    const doc = collect();
    const slug = 'telemetry-' + String(name || `t${doc.run.turns}-${doc.run.seed}`)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
    try {
      const r = await fetch(`/api/content/${slug}.json`, {
        method: 'PUT', body: JSON.stringify(doc),
      });
      if (!r.ok) throw new Error('status ' + r.status);
      return { ok: true, where: 'server', file: `content/${slug}.json`,
               bytes: JSON.stringify(doc).length };
    } catch (e) {
      /*
       * The fallback is a Blob download. It is second because a file the author
       * has to ask the tester to find and send is a file that arrives late or
       * not at all — and `content/` is a directory the author already reads.
       */
      const blob = new Blob([JSON.stringify(doc)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return { ok: true, where: 'download', file: `${slug}.json`,
               bytes: JSON.stringify(doc).length };
    }
  }

  /* ---- difficulty --------------------------------------------------- */

  /*
   * FOUR PRESETS, AND EVERY NUMBER IN THEM ALREADY EXISTS.
   *
   * A difficulty setting in this game cannot be a damage multiplier, because
   * there is no damage. What there is, is pacing: how much room the player has
   * at the start, how often the world acts, how fast the ground turns against
   * them, and how forgiving an election is. Each preset is a hypothesis about
   * those four, written as overrides on tunables that already have documented
   * meanings — so a playtest can A/B pacing without a build, which is the whole
   * requirement.
   *
   * `standard` is deliberately EMPTY rather than a copy of the defaults. A
   * preset that restates the schema is a second place the shipped tuning lives,
   * and it would go stale the first time M13 moves a number.
   */
  const PRESETS = [
    {
      id: 'gentle', label: 'Gentle',
      blurb: 'More room and a slower fuse. The world still comes apart; it gives you longer to notice.',
      overrides: {
        'econ.startingTreasuryTurns': 8,
        'ai.actThreshold': 0.35,
        'sent.maxRise': 0.020,
        'secession.honeymoonTurns': 10,
      },
    },
    {
      id: 'standard', label: 'Standard',
      blurb: 'The game as tuned. Everything below is measured against this.',
      overrides: {},
    },
    {
      id: 'hard', label: 'Hard',
      blurb: 'Less in the bank, a world that acts more often, and ground that turns faster.',
      overrides: {
        'econ.startingTreasuryTurns': 2,
        'ai.actThreshold': 0.05,
        'sent.maxRise': 0.045,
      },
    },
    {
      id: 'brutal', label: 'Brutal',
      blurb: 'Nothing banked, everybody moving, and a continent already leaving.',
      overrides: {
        'econ.startingTreasuryTurns': 1,
        'ai.actThreshold': 0.0,
        'sent.maxRise': 0.060,
        'secession.honeymoonTurns': 0,
        'ai.wDeny': 2.2,
      },
    },
  ];

  const KEY = 'ns_difficulty';
  let chosen = 'standard';

  const byId = (id) => PRESETS.find((p) => p.id === id) || PRESETS[1];

  /**
   * The difficulty ACTUALLY IN EFFECT, not the one that was asked for.
   *
   * Loading a save calls `TUNE.replace(doc.tune)` (M9.8) — correctly, because a
   * save's tuning is what it was played with — and that discards whatever
   * preset the session had chosen. The label would otherwise keep saying
   * "Hard" over a game running on Standard numbers, and it would say so in the
   * telemetry export, which is the one place a wrong label does real damage:
   * a playtest report is worthless if it misnames the conditions.
   *
   * So the answer is checked against the live tuning rather than remembered.
   * A preset whose overrides are not all present is not in effect, and the
   * honest name for the tuning that results is `custom`.
   */
  function current() {
    const p = byId(chosen);
    const keys = Object.keys(p.overrides);
    if (!keys.length) {
      // `standard` is the absence of overrides, so it is in effect exactly when
      // no OTHER preset's are.
      const other = PRESETS.find((q) => Object.keys(q.overrides).length
        && Object.entries(q.overrides).every(([k, v]) => window.TUNE.peek(k) === v));
      return other ? other.id : 'standard';
    }
    return keys.every((k) => window.TUNE.peek(k) === p.overrides[k]) ? p.id : 'custom';
  }

  /**
   * Apply a preset to the live tuning.
   *
   * `replace` and not `load`, and for the reason M9.8 gave: applying a preset
   * over another preset's leftovers is a third tuning that neither describes.
   * The authored `content/tunables.json` is re-applied underneath, because a
   * preset is a modifier on the shipped game rather than a replacement for it.
   */
  function apply(id, authored) {
    chosen = byId(id).id;
    try { localStorage.setItem(KEY, chosen); } catch (e) { /* not important enough to fail */ }
    window.TUNE.replace({ ...(authored || {}), ...byId(chosen).overrides });
    return chosen;
  }

  /** What the player chose last time, if they chose. */
  function remembered() {
    try { return localStorage.getItem(KEY) || 'standard'; } catch (e) { return 'standard'; }
  }

  /** A short human summary, for the export dialog and for the author's sanity. */
  function summary() {
    const mins = started ? Math.round((Date.now() - started) / 60000) : 0;
    const byKind = log.reduce((a, e) => { a[e.kind] = (a[e.kind] || 0) + 1; return a; }, {});
    const turns = series.filter((r) => r.ms > 0);
    const med = turns.length
      ? turns.map((r) => r.ms).sort((a, b) => a - b)[(turns.length / 2) | 0] : 0;
    return { minutes: mins, entries: log.length, rows: series.length,
             medianTurnSeconds: Math.round(med / 1000), byKind };
  }

  return { reset, sample, note, collect, exportRun, summary,
           PRESETS, apply, current, remembered, byId,
           series: () => series, log: () => log };
})();
