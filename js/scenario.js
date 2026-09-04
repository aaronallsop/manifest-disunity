/*
 * The opening board, when the opening board is not fifty-one intact states.
 *
 * WHAT THIS IS FOR. The game's story is that the United States has already come
 * apart, and until M8 the board opened as fifty-one states — the moment BEFORE
 * the story. A scenario is the surgery that makes the opening position tell it:
 * Texas partitioned into its five authored cultural regions, California into
 * five plus a cession to Cascadia, and a Deseret that is half-born, with the
 * corridor that did not cede carrying the argument.
 *
 * ONE MODULE, NO DOM, AND THE CONTENT IS DATA. `content/scenario-shattered.json`
 * is authored; this file knows nothing about Texas. It reads Area claims out of
 * the cultural map mode's own `assign` table — the same document the player sees
 * in the Culture view and the editor can republish — so a repainted leaf moves a
 * successor's border and nothing here has to change. The pattern is
 * `js/statedoc.js`: pure model, called by whoever built the world.
 *
 * TWO PHASES, AND THE SPLIT IS LOAD-BEARING. The fact-finding pass for M8 found
 * five separate ordering traps, and they resolve into exactly two hook points:
 *
 *   Colors.assign -> Game.init -> Parties.setup    movements exist, governments refreshed
 *       -> Scenario.apply(...)                     PHASE A: the surgery
 *       -> choosePlayer / the faction picker       must see the shattered roster
 *       -> TurnSystem.begin                        or the successors never act
 *       -> World.begin                             stocks open AT TARGET on what they see,
 *                                                  and History.capture(0) takes the timeline's
 *                                                  turn-0 frame; World.begin also calls
 *                                                  Recognition.reset() (world.js:841)
 *       -> Scenario.afterBegin(...)                PHASE B: recognition + relations
 *
 * Each line earns its place:
 *   - AFTER Parties.setup, because phase A wires `movement.nation` and seeds
 *     corridor shares, and neither exists before the movements do.
 *   - BEFORE TurnSystem.begin, because `createNation` does not touch the turn
 *     order — every other birth site calls `TurnSystem.insertAfter` itself. Born
 *     before `begin`, the successors are simply in the shuffled opening order.
 *   - BEFORE World.begin, because a stock with no previous value opens AT its
 *     target rather than climbing from the floor, and `History.capture(0)` is
 *     the timeline's first frame. Run the split later and the timeline opens on
 *     an intact Texas and eleven nations spend fifteen turns climbing.
 *   - Governments settled before World.begin, because a null `rulingIdeology` at
 *     stock time means "a country nobody governs" in the polls, spurious
 *     alignment in Victory, and an unweighted leader draw.
 *   - Recognition STRICTLY after World.begin, which wipes both the granted
 *     matrix and the origins map (world.js:841, recognition.js:47). Anything
 *     phase A wrote there would simply vanish.
 *
 * NOTHING IS READ OFF A GLOBAL. `apply` takes the cultural document, the rng and
 * the tunables explicitly, because `MapModes.getCulture()` is null headless and
 * `attrs.culture` only carries the region-level name — the leaf a successor is
 * cut from is in the document or it is nowhere.
 */
const Scenario = (function () {
  /* The authored document, and what the last `apply` actually did. */
  let doc = null;
  let report = null;

  /** Accept an authored document. Returns false for anything that is not one. */
  function load(d) {
    doc = d && d.type === 'ns-scenario' ? d : null;
    return !!doc;
  }
  const loaded = () => !!doc;
  const get = () => doc;
  const lastReport = () => report;
  function reset() { report = null; }

  const fail = (msg) => { throw new Error(`scenario: ${msg}`); };
  const T = (tune) => tune || window.TUNE;

  /* ------------------------------------------------------------------ */
  /* resolving a claim                                                   */
  /* ------------------------------------------------------------------ */

  /**
   * The node ids of the named leaves of a cultural document.
   *
   * Named rather than numbered: `n70` is a fact about the order somebody drew
   * the tree in, and "Dallas" is a fact about the map. A name that is not in the
   * tree is an authoring error and throws here rather than silently resolving to
   * an empty claim, which would then fail the partition check with a confusing
   * "104 Areas are claimed by nobody".
   */
  function leafNodeIds(culture, names) {
    const want = new Set(names);
    const ids = new Set();
    const found = new Set();
    const walk = (node) => {
      if (want.has(node.name)) { ids.add(node.id); found.add(node.name); }
      for (const child of node.children || []) walk(child);
    };
    for (const node of (culture && culture.nodes) || []) walk(node);
    const missing = names.filter((n) => !found.has(n));
    if (missing.length) fail(`cultural.json has no region named ${missing.join(', ')}`);
    return ids;
  }

  /** Every Area the cultural document assigns to one of those leaves. */
  function areasOfLeaves(culture, names) {
    const ids = leafNodeIds(culture, names);
    const out = [];
    for (const [area, path] of Object.entries((culture && culture.assign) || {})) {
      if (path && path.length && ids.has(path[path.length - 1])) out.push(area);
    }
    return out;
  }

  /**
   * One successor's claim, as live Area ids.
   *
   *   leaves  cultural leaves to take whole
   *   areas   Area ids to add outright
   *   state   keep only Areas in this state FIPS — the Oklahoma trap: the Dallas
   *           leaf holds eight Oklahoma Areas and El Paso one, because a
   *           cultural region does not stop at a state line and a partition of
   *           Texas does
   *   except  Area ids to remove, for "the leaf minus the ones already spoken for"
   *
   * APPLIED IN THAT ORDER, and `state` filters the hand-listed `areas` too — so
   * a claim that names an Area outside the filtered state is dropped rather than
   * rejected. That is the right precedence (the filter's whole job is to make
   * "this leaf, in this state" one idea) but it does mean `state` and `areas`
   * together can hide a typo, which is why nothing in the shipped document uses
   * both.
   *
   * Everything goes through `Game.areaIdOf`, because a capital or a hand-listed
   * county may be merged into a larger Area and a raw FIPS lookup misses it
   * silently — the M1.13 trap, which discarded 48.2% of authored references the
   * first time it was met.
   */
  function resolveClaim(spec, culture) {
    const out = new Set();
    if (spec.leaves) for (const a of areasOfLeaves(culture, spec.leaves)) out.add(Game.areaIdOf(a));
    for (const a of spec.areas || []) out.add(Game.areaIdOf(a));
    if (spec.state) {
      for (const a of [...out]) {
        const c = Game.county[a];
        if (!c || c.st !== spec.state) out.delete(a);
      }
    }
    for (const a of spec.except || []) out.delete(Game.areaIdOf(a));
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* phase A: the surgery                                                */
  /* ------------------------------------------------------------------ */

  /**
   * @param opts {doc, culture, rng, tune}
   * @returns a report: what was created, what ceded, what was left behind.
   */
  function apply(opts = {}) {
    const d = opts.doc || doc;
    if (!d) return null;
    if (!opts.culture) fail('no cultural document — pass raw.culture explicitly, '
      + 'MapModes.getCulture() is null headless');
    const tune = T(opts.tune);
    const culture = opts.culture;

    report = { id: d.id, name: d.name, edition: d.edition, created: [], dissolved: [],
               ceded: [], leftBehind: [], cession: null, corridor: [], seeded: [],
               /*
                * Whose books have to be reopened. Every nation created, plus
                * every SURVIVING nation that lost ground — Utah's opening
                * balance was banked against a Utah that still had Salt Lake in
                * it, and leaving it there would hand a rump the treasury of the
                * whole state (D-M8i).
                */
               rebank: new Set() };

    Game.batch(() => {
      for (const entry of d.dissolve || []) dissolveState(entry, culture, tune);
      if (d.cession) cede(d.cession, culture, tune, opts.rng);

      /*
       * ONE refresh, then the authored overrides.
       *
       * `refreshGovernments` gives a nation with no government the politics of
       * the ground it stands on, which is the right default and is what puts
       * four of the five Texan successors red without anybody authoring it.
       *
       * The overrides are the deliberate exceptions, and each one carries its
       * reason in the scenario file. Cascadia is governed by the movement that
       * founded it rather than by the plurality of the people it governs, and
       * that disagreement is the point of it. Austin is authored blue because
       * the turn-0 plurality is a coin toss against its own data: its ground is
       * 47.9R-50.6D by population, but the Techno-Autocrat seed in Travis
       * converts people out of a blue supermajority and takes more blue than red
       * with it, so five of eight seeds landed it red.
       */
      Game.refreshGovernments(0);
      for (const rec of report.created) {
        if (!rec.gov) continue;
        const n = Game.getNation(rec.id);
        if (!n) continue;
        if (Ideology.index(rec.gov) < 0) fail(`"${rec.gov}" is not an ideology`);
        n.gov.rulingIdeology = rec.gov;
        n.gov.since = 0;
      }

      /*
       * AND THE BOOKS ARE OPENED AGAIN (D-M8i).
       *
       * `Game.init` banks the opening treasury before any of this ran, and
       * `createNation` opens at zero — so a successor would begin the game
       * unable to afford any priced action at all, which is the exact failure
       * the opening bank exists to prevent. The same formula, per nation: it is
       * not a grant, it is the same few turns of income every other nation was
       * given. Every nation that lost ground is re-banked too, because Utah's
       * opening balance was computed against a Utah that included Salt Lake.
       */
      const bank = tune.get('econ.startingTreasuryTurns') * tune.get('econ.taxRate');
      for (const r of report.created) report.rebank.add(r.id);
      for (const nid of report.rebank) {
        const n = Game.getNation(nid);
        if (n) n.treasury = Game.nationDemographics(nid).gdp * bank;
      }

      /*
       * THE ROSTER THE GAME OPENED WITH is the shattered one. `originalNations`
       * is what Reunification measures three quarters against and what the
       * leaderboard calls "of the original N" — measured against fifty-one it
       * would report a continent that had already lost ten nations before the
       * first turn.
       */
      Game.setOriginalNations(Game.nations.size);
      Game.touch({ ownership: true, roster: true, values: true });
    });

    if (typeof Movements !== 'undefined') Movements.refreshStates(tune);
    return report;
  }

  /* ---- dissolving one state into successors ---- */

  function dissolveState(entry, culture, tune) {
    const parent = Game.getNation(entry.state);
    if (!parent) fail(`no nation ${entry.state} to dissolve`);
    const parentName = parent.name;
    const held = new Set(parent.counties);

    /*
     * VALIDATED BEFORE ANYTHING MOVES, and the error names the FIPS.
     *
     * Three ways an authored partition can be wrong and all three are silent
     * without this: an Area that does not exist on this map build, an Area the
     * dissolving state does not hold, and an Area claimed twice or not at all.
     * The last is the one that actually happens — the Dallas leaf carries eight
     * Oklahoma Areas — and its symptom without a check is a Texas that survives
     * the shattering holding nine counties in the Panhandle.
     */
    const claimed = new Map();
    const claims = [];
    for (const spec of entry.successors || []) {
      const areas = resolveClaim(spec, culture);
      if (!areas.size) fail(`${spec.name} claims no Areas at all`);
      for (const a of areas) {
        if (!Game.county[a]) fail(`${spec.name} claims Area ${a}, which is not on this map build`);
        if (!held.has(a)) {
          fail(`${spec.name} claims Area ${a}, which ${parentName} does not hold `
            + `(it belongs to ${Game.getOwner(a) || 'nobody'})`);
        }
        const other = claimed.get(a);
        if (other) fail(`Area ${a} is claimed by both ${other} and ${spec.name}`);
        claimed.set(a, spec.name);
      }
      claims.push({ spec, areas: [...areas] });
    }
    const leftover = [...held].filter((a) => !claimed.has(a));
    if (leftover.length) {
      fail(`${leftover.length} ${leftover.length === 1 ? 'Area' : 'Areas'} of ${parentName} `
        + `${leftover.length === 1 ? 'is' : 'are'} claimed by nobody: ${leftover.slice(0, 8).join(', ')}`);
    }

    for (const { spec, areas } of claims) {
      create(spec, areas, tune, { parent: entry.state, parentName, origin: true });
    }

    /*
     * The parent is GONE, and quietly.
     *
     * `moveCounties` prunes a nation that has run out of ground and writes a
     * `died` entry for it — which is right in play and wrong here: Sim's
     * `nationsLost` verdict card and the newspaper's headline ranking would read
     * every shattered run as a continent that lost ten nations before the first
     * turn (D-M8e). The dissolution is announced in the scenario's own voice
     * instead, one entry, on the opening edition.
     */
    if (Game.nations.has(entry.state)) Game.nations.delete(entry.state);
    report.rebank.delete(entry.state);
    report.dissolved.push({ id: entry.state, name: parentName, into: claims.length });
    Ledger.append({
      turn: 0, phase: 'scenario', subject: entry.state, kind: 'scenario',
      delta: -1, scenario: report.id,
      text: entry.text || `${parentName} dissolved into ${claims.length} successor states.`,
    });
  }

  /** Found one nation from an authored claim, and remember what it was. */
  function create(spec, areas, tune, ctx) {
    const id = Game.createNation(spec.name, areas, {
      reason: 'secede',
      founded: 0,
      silent: true,
      // No `died` entry for the parent this drains: the scenario says it once,
      // in its own words, and Sim's verdict cards read the ledger.
      quiet: true,
      color: spec.color,
      /*
       * ORIGIN by construction (D-M8b). The eleven successors are FOUNDING
       * states: the dissolution settled before turn 0, so they are recognised by
       * everybody (recognition.js:80), have no honeymoon and no parent to earn a
       * signature from. Deseret is the one that is not, and it passes origin
       * false — it is a pariah with a story to play out.
       */
      origin: !!ctx.origin,
      // Display only. A successor state is not a former U.S. state and not a
      // country minted in play, and the panel has to be able to say which.
      kind: ctx.origin ? 'successor' : 'breakaway',
      seat: spec.seat,
    });
    const n = Game.getNation(id);
    if (spec.seat && !n.counties.has(Game.areaIdOf(spec.seat))) {
      fail(`${spec.name}'s seat ${spec.seat} is not inside its own territory`);
    }
    const demo = Game.nationDemographics(id);
    report.created.push({ id, name: spec.name, areas: areas.length, gov: spec.gov || null,
                          seat: n.seat, parent: ctx.parent || null, movement: spec.movement || null,
                          pop: demo.pop, gdp: demo.gdp, origin: !!ctx.origin });
    Ledger.append({
      turn: 0, phase: 'scenario', subject: id, kind: 'scenario', delta: areas.length,
      scenario: report.id, parent: ctx.parent || null,
      text: spec.text || `${spec.name} took ${areas.length} `
        + `${areas.length === 1 ? 'Area' : 'Areas'} and ${fmtPeople(demo.pop)} people`
        + (ctx.parentName ? ` out of ${ctx.parentName}.` : '.'),
    });

    /*
     * A MOVEMENT WITH A COUNTRY IS `realized` (D-M8h), and wiring it does two
     * jobs at once: it arms tier-1 frontier defection toward this nation
     * (world.js:764) and it stops `phaseSecession` founding a SECOND Cascadia
     * out of the first one's territory, because a movement whose `nation` names
     * a live nation is never a candidate to declare.
     */
    if (spec.movement && typeof Movements !== 'undefined') {
      const rec = Movements.get(spec.movement);
      if (!rec) fail(`${spec.name} names movement "${spec.movement}", which did not spawn`);
      rec.nation = id;
    }
    return id;
  }

  const fmtPeople = (p) => (p >= 1e6 ? `${(p / 1e6).toFixed(1)}M` : `${Math.round(p / 1e3)}k`);

  /* ------------------------------------------------------------------ */
  /* the cession: Deseret, half-born                                     */
  /* ------------------------------------------------------------------ */

  /**
   * Roll the corridor, keep what is connected, and found a country on it.
   *
   * THE ROLL DRAWS FROM ITS OWN NAMED STREAM (D-M8d). Every other draw at setup
   * comes from 'spawn', and taking 57 numbers out of that stream would reshuffle
   * which movements exist in every game — same-seed determinism would break for
   * a reason nobody could see.
   *
   * CONNECTIVITY IS THE SECOND HALF OF THE RULE. Sub-regions roll independently,
   * so a run can hand Deseret the Wasatch Front and Tetonia and nothing between
   * them. A country in two pieces separated by three hundred miles of Idaho is
   * not what "the corridor seceded" means, so only the component holding Salt
   * Lake cedes; Areas that rolled to go and could not are recorded as
   * `leftBehind`, and they are the angriest ground on the map for it.
   */
  function cede(spec, culture, tune, rng) {
    if (!rng) fail('the cession needs an rng — it is a seeded roll, not a constant');
    const stream = rng.stream('scenario');

    const rolled = [];        // Areas that voted to go
    const declined = [];      // Areas that voted to stay
    const corridor = [];      // every corridor Area, ceded or not
    for (const region of spec.regions || []) {
      const chance = region.chance == null ? 0.5 : region.chance;
      /*
       * ONE ROLL PER AREA, at its sub-region's odds — not one roll per
       * sub-region. Two reasons, and the second is the interesting one.
       *
       * A roll per sub-region has the same mean (about 31 of 57 Areas) and a
       * ruinous variance: five independent coins decide the whole map, so one
       * seed in seventeen hands Deseret nothing but the Wasatch Front and
       * another hands it the entire corridor. Measured before the change: 10
       * Areas at seed 42, 42 at seed 12345.
       *
       * And a per-Area roll is what makes the connectivity rule below MEAN
       * something. Whole sub-regions are contiguous, so region-level rolls
       * almost never strand anything; Areas do, and the ones they strand are the
       * places that voted to leave and did not get to. That is the story the
       * `leftBehind` boost is about.
       *
       * Sorted, so the sequence of draws does not depend on the order
       * `Object.entries` happened to walk the assign table in.
       */
      const areas = areasOfLeaves(culture, [region.leaf])
        .map((a) => Game.areaIdOf(a)).filter((a) => Game.county[a]).sort();
      for (const a of areas) {
        corridor.push(a);
        (stream.random() < chance ? rolled : declined).push(a);
      }
    }
    if (!rolled.length) fail('the cession rolled nothing at all — check the region chances');

    const seat = Game.areaIdOf(spec.seat);
    const pieces = Game.components(new Set(rolled), null);
    const core = pieces.find((p) => p.includes(seat));
    if (!core) fail(`the cession's seat ${spec.seat} did not roll to cede — the Wasatch Front `
      + 'must carry chance 1.0');
    const ceded = new Set(core);
    const leftBehind = rolled.filter((a) => !ceded.has(a));

    // Whoever is about to lose ground, read BEFORE it moves, so their opening
    // treasury can be re-banked against the state they are left with.
    for (const f of ceded) {
      const owner = Game.getOwner(f);
      if (owner) report.rebank.add(owner);
    }

    const id = create({ ...spec, movement: spec.movement, text: spec.text }, [...ceded], tune,
      { origin: false, parent: spec.parent, parentName: Game.getNation(spec.parent)
        ? Game.getNation(spec.parent).name : null });

    /*
     * THE HONEYMOON WITHOUT THE TRANSITION COST (D-M8b).
     *
     * `World.applyIndependence` bundles two opposite things: a few turns of
     * extra Authority because a population that just got what it wanted gives
     * its government the benefit of the doubt, and an immediate GDP cut because
     * institutions, contracts and trade routes all break at once. The first is
     * exactly right here. The second is not: the shattering happened BEFORE turn
     * 0, and an economy that opens twelve per cent under its own data reads as a
     * data bug rather than as a story.
     */
    if (typeof World !== 'undefined' && World.grantHoneymoon) {
      World.grantHoneymoon(Game.getNation(id), tune, 0);
    }

    report.cession = { id, name: spec.name, parent: spec.parent, seat,
                       ceded: [...ceded], leftBehind, declined, corridor,
                       recognised: !!spec.recognised };
    report.ceded = [...ceded];
    report.leftBehind = leftBehind;
    report.corridor = corridor;

    seedStayBehind(spec, id, declined, leftBehind, tune);
    return id;
  }

  /**
   * THE CORRIDOR THAT STAYED.
   *
   * Two things, and they are different: a SEED, which is where the movement
   * starts, and a per-Area `sentBoost`, which is a standing argument the
   * sentiment formula reads every turn afterwards. Seeding alone would be a
   * spike that decays — a share above its target erodes back at `sent.maxFall`
   * every turn — so without the boost the corridor would be angriest on turn 1
   * and calmest by turn 10, which is the opposite of the story.
   *
   * THE SEED STAYS UNDER `secession.countyThreshold`. An Area over the line on
   * turn 0 defects on turn 1: measured, that is the turn-zero Cascadia disaster
   * the guard at movements.js:283 exists to record. And it is written with the
   * grow-then-set pattern — move people INTO the movement's ideology first, then
   * set the head count — because `clampMovements` scales a movement back to what
   * its ideology actually holds, and a seed written the naive way is clamped
   * most of the way back to nothing before the first turn runs.
   */
  function seedStayBehind(spec, deseretId, declined, leftBehind, tune) {
    const name = spec.movement;
    if (!name || typeof Movements === 'undefined' || !Movements.get(name)) return;
    const idx = Movements.ideologyIndexOf(name);
    if (idx < 0) return;
    const line = tune.get('secession.countyThreshold');
    const homeland = new Set(Movements.get(name).homeland);

    const groups = [
      { areas: declined, cfg: spec.stay || {}, tag: 'stay' },
      { areas: leftBehind, cfg: spec.leftBehind || spec.stay || {}, tag: 'leftBehind' },
    ];
    for (const { areas, cfg, tag } of groups) {
      const [lo, hi] = cfg.seed || [0, 0];
      for (const f of areas) {
        const c = Game.county[f];
        if (!c || Game.getOwner(f) === deseretId) continue;
        /*
         * Only inside the baked homeland. `phaseSentiment` hard-deletes any
         * share outside it on the very next turn (world.js:328), so a seed
         * placed there is not a subtle bug, it is a value that disappears.
         */
        if (!homeland.has(f)) continue;

        // Deterministic within the Area, so two runs at one seed agree: the
        // share is the midpoint of the authored band, nudged by the Area's own
        // position in the corridor rather than by another draw.
        const share = Math.min(line - 0.02, lo + (hi - lo) * 0.5);
        if (share > 0) grow(c, idx, name, share);
        if (cfg.boost) c.attrs.sentBoost = (c.attrs.sentBoost || 0) + cfg.boost;
        report.seeded.push({ area: f, share, boost: cfg.boost || 0, group: tag });
      }
    }
    /*
     * Reconciled, because seeding wrote head counts directly. `clampMovements`
     * scales a movement back to what its own ideology actually holds, and the
     * grow-then-set pattern above is what stops it clamping the seed most of the
     * way back to nothing (movements.test.js:146).
     */
    Movements.clampMovements();
  }

  /** Move people into a movement's ideology, then hand it that share of them. */
  function grow(c, idx, name, share) {
    let pop = 0;
    for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
    if (pop <= 0) return;
    const want = pop * share;
    let others = 0;
    for (let i = 0; i < c.pop.length; i++) if (i !== idx) others += c.pop[i];
    const take = Math.min(Math.max(0, want - c.pop[idx]), others);
    if (take > 0 && others > 0) {
      const k = 1 - take / others;
      for (let i = 0; i < c.pop.length; i++) if (i !== idx) c.pop[i] *= k;
      c.pop[idx] += take;
    }
    c.mov[name] = Math.min(c.pop[idx], want);
  }

  /* ------------------------------------------------------------------ */
  /* phase B: recognition and relations                                  */
  /* ------------------------------------------------------------------ */

  /**
   * Everything that only exists after `World.begin` has run.
   *
   * `World.begin` calls `Recognition.reset()`, which wipes the granted matrix
   * AND the origins map (world.js:841, recognition.js:47). A `founded` written
   * in phase A is not merely overwritten here — it is gone, silently, and
   * Deseret would open as a nation nobody had any opinion about instead of as a
   * pariah with a parent.
   */
  function afterBegin(opts = {}) {
    const d = opts.doc || doc;
    if (!d || !report) return null;
    const tune = T(opts.tune);
    const c = report.cession;
    if (!c) return report;

    /*
     * A DECLARED BREAKAWAY, not a founding state. Deseret is `origin: false`, so
     * it needs a row in the matrix and it starts with none — no bilateral trade
     * with anybody who does not recognise it, a smuggler's price on the world
     * market, no seat in a coalition, and a signed penalty on Influence. Its
     * parent's signature is the key that unlocks the rest of the continent,
     * which makes Utah's recognition the most valuable thing on the board from
     * turn 0.
     */
    if (typeof Recognition !== 'undefined' && Game.getNation(c.id)) {
      Recognition.founded(c.id, c.parent || null, { turn: 0, tune, recognised: c.recognised });
    }

    /*
     * AND THE STATES IT TOOK GROUND FROM REMEMBER IT.
     *
     * `lost` — "they broke away from us" — through the closed Relations
     * vocabulary, granted silently because there is nobody to tell on turn 0.
     * Coalitions read these memories when they decide who to gang up on, so
     * leaving them out would mean seven states had no opinion at all about the
     * country that took a third of one of them. Utah is NOT authored as refusing
     * recognition: the board starts quiet and the player watches it sour.
     */
    if ((d.relations || {}).lostToCession !== false && typeof Relations !== 'undefined') {
      const losers = new Map();
      for (const f of c.ceded) {
        const st = Game.county[f] && Game.county[f].st;
        if (st) losers.set(st, (losers.get(st) || 0) + 1);
      }
      for (const [st, areas] of losers) {
        if (!Game.getNation(st)) continue;
        Relations.record(st, c.id, 'lost', { tune, scale: areas, turn: 0 });
      }
      report.grieved = [...losers.keys()];
    }
    return report;
  }

  return {
    load, loaded, get, reset, apply, afterBegin,
    report: lastReport,
    /* exported for the suite and for anything that wants to ask the same
       question the applier asks, rather than asking it a second way */
    areasOfLeaves, resolveClaim,
  };
})();
