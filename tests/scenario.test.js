/*
 * M8 — the Shattering.
 *
 * The game's story is that the United States has already come apart, and until
 * this milestone the board opened as fifty-one intact states: the moment BEFORE
 * the story. These tests are about the opening position telling it — Texas as
 * five successor states, California as five plus a cession to Cascadia, and a
 * Deseret that is half-born, with the corridor that did not cede carrying the
 * argument forward.
 *
 * TWO BOARDS, ONE ENGINE. `bootWorld({scenario: true})` is the shattered
 * fixture; the default is still the fifty-one states, and the 785 tests that
 * existed before M8 still run against it and still mean what they meant. That
 * is the whole shape of D-M8a: a scenario is authored content laid over the same
 * model, not a second model.
 */
import { describe, it, ok, equal, notEqual, close, deepEqual, throws } from './harness.js';
import { bootWorld, loadData, totalCountyPop, totalNationPop, recPop, fingerprint }
  from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

/** The successor by name, from a report. */
const byName = (report, name) => report.created.find((r) => r.name === name);
/** The live nation record behind a named successor. */
const nationNamed = (report, name) => Game.getNation(byName(report, name).id);

/* ------------------------------------------------------------------ */
/* M8.3 — the engine                                                   */
/* ------------------------------------------------------------------ */

describe('The scenario engine', () => {
  it('reaches a playable board: ~61 nations, every one governed, seated and banked', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    /*
     * 51 - 2 dissolved + 11 successors + Deseret = 61. Deseret is the only one
     * of the twelve that is not a founding state.
     */
    equal(Game.nations.size, 61, 'the shattered roster is not 61 nations');
    equal(scenario.created.length, 12);
    equal(scenario.dissolved.length, 2);
    ok(!Game.getNation('48') && !Game.getNation('06'),
      'a parent survived its own dissolution');

    // `originalNations` is what Reunification measures three quarters against
    // and what the leaderboard calls "of the original N". Measured against 51 it
    // would report a continent that had already lost ten nations before turn 1.
    equal(Game.originalNations(), 61);

    const bank = T().get('econ.startingTreasuryTurns') * T().get('econ.taxRate');
    for (const rec of scenario.created) {
      const n = Game.getNation(rec.id);
      ok(n, `${rec.name} is not on the board`);
      ok(n.gov.rulingIdeology, `${rec.name} is a country nobody governs`);
      equal(n.seat, Game.areaIdOf(n.seat), 'the seat was not resolved through the Area alias');
      ok(n.counties.has(n.seat), `${rec.name} does not hold its own seat`);
      const want = Game.nationDemographics(rec.id).gdp * bank;
      close(n.treasury / want, 1, 0.01, `${rec.name}'s opening treasury is not the init formula`);
      equal(Game.occupiedCount(rec.id), 0,
        `${rec.name} is occupying its own founding ground (M8.1)`);
    }

    /*
     * AND THE RUMPS ARE RE-BANKED TOO (D-M8i). Utah's opening treasury was
     * computed by `Game.init` against a Utah that still had Salt Lake in it, so
     * leaving it alone would hand a rump the reserves of the whole state. Six
     * corridor states lose ground at this seed; every nation on the board ends
     * up within 1% of the same formula.
     */
    const donors = [...scenario.rebank].filter((id) => !scenario.created.some((r) => r.id === id));
    ok(donors.includes('49'), 'Utah was not re-banked after losing Salt Lake');
    ok(donors.length >= 3, `only ${donors.length} states lost ground to the cession`);
    for (const [nid] of Game.nations) {
      const n = Game.getNation(nid);
      const want = Game.nationDemographics(nid).gdp * bank;
      close(n.treasury / want, 1, 0.01, `${n.name} is not banked against the state it actually holds`);
    }
  });

  it('a nation projects from its own seat, ahead of its state\'s capital', async () => {
    /*
     * All five Texan successors have `homeSt` '48', so `Victory.all()['48']` —
     * Austin — is the seat every one of them would have projected from. One
     * nation's reach measured from another nation's capital is not a brake, it
     * is a bug with a plausible shape.
     */
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    for (const name of ['Dallas', 'Houston', 'El Paso', 'San Antonio']) {
      const n = nationNamed(scenario, name);
      equal(n.homeSt, '48', 'the fixture assumes the Texan successors share a modal state');
      deepEqual(Projection.sources(n.id), [n.seat],
        `${name} projects from somewhere other than its own seat`);
    }
    // ...and Austin genuinely holds the old Texas seat, so both rules agree.
    const austin = nationNamed(scenario, 'Austin');
    equal(austin.seat, Victory.all()['48'].area);
  });

  it('the baseline board is untouched by any of it', async () => {
    /*
     * D-M8a's other half: `?scenario=none` and the default fixture still boot
     * the game the 785 pre-M8 tests describe.
     */
    await bootWorld({ seed: SEED });
    equal(Game.nations.size, 51);
    equal(Game.originalNations(), 51);
    ok(Game.getNation('48') && Game.getNation('06'), 'the baseline board lost a state');
    equal(Ledger.ofKind('scenario').length, 0, 'the baseline board logged scenario news');
    for (const [, n] of Game.nations) {
      equal(n.seat, null, 'a baseline nation carries an authored seat');
      equal(n.kind, null, 'a baseline nation carries a scenario kind');
    }
  });

  it('setup writes scenario news and NOT declarations or deaths', async () => {
    /*
     * D-M8e. `Sim.summarise` reads `declare` for `firstSecessionTurn` and `died`
     * for `nationsLost`, and dev.html paints a verdict card red below turn 12 —
     * so a shattering that spoke in those two words would report every run as
     * broken before the first turn was taken.
     */
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    equal(Ledger.ofKind('declare').length, 0, 'setup declared independence');
    equal(Ledger.ofKind('died').length, 0, 'setup killed a nation out loud');
    const news = Ledger.ofKind('scenario');
    // One per successor plus one per dissolution.
    equal(news.length, scenario.created.length + scenario.dissolved.length);
    for (const e of news) {
      equal(e.turn, 0, 'scenario news is not dated turn 0');
      ok(e.text && e.text.length > 10, 'a scenario entry has nothing to print');
    }
    ok(news.some((e) => /Texas dissolved/.test(e.text)));
    ok(Ledger.KINDS.includes('scenario'), 'the vocabulary does not carry the kind it uses');
  });

  it('an authored partition that does not add up throws, and names the FIPS', async () => {
    const { raw } = await bootWorld({ seed: SEED });
    const base = raw.scenario;
    ok(base, 'content/scenario-shattered.json did not load');
    const clone = () => JSON.parse(JSON.stringify(base));

    /* A leftover: drop a successor and 21 Areas of Texas belong to nobody. */
    const short = clone();
    short.dissolve[0].successors.pop();
    let err = null;
    try {
      await bootWorld({ seed: SEED, scenario: short });
    } catch (e) { err = e; }
    ok(err, 'a partition with a hole in it was accepted');
    ok(/claimed by nobody/.test(err.message), `wrong error: ${err.message}`);
    ok(/48\d{3}/.test(err.message), `the error names no offending FIPS: ${err.message}`);

    /* A double claim: hand Travis to Dallas as well as Austin. */
    const twice = clone();
    twice.dissolve[0].successors[0].areas = ['48453'];
    err = null;
    try {
      await bootWorld({ seed: SEED, scenario: twice });
    } catch (e) { err = e; }
    ok(err && /claimed by both/.test(err.message), `wrong error: ${err && err.message}`);
    ok(err.message.includes('48453'), `the error names no offending FIPS: ${err.message}`);

    /*
     * A claim on ground the dissolving state does not hold. Aimed at Los
     * Angeles rather than at a Texan successor on purpose: `state` filters
     * everything including a hand-listed `areas`, so a Utah Area handed to
     * Dallas is silently dropped by the filter that exists to drop Oklahoma.
     */
    const foreign = clone();
    foreign.dissolve[1].successors[0].areas = ['06037', '49035'];
    err = null;
    try {
      await bootWorld({ seed: SEED, scenario: foreign });
    } catch (e) { err = e; }
    ok(err && /does not hold/.test(err.message), `wrong error: ${err && err.message}`);

    /* A leaf that is not in the cultural document at all. */
    const noLeaf = clone();
    noLeaf.dissolve[0].successors[0].leaves = ['Llano Estacado'];
    err = null;
    try {
      await bootWorld({ seed: SEED, scenario: noLeaf });
    } catch (e) { err = e; }
    ok(err && /no region named/.test(err.message), `wrong error: ${err && err.message}`);

    /* A seat outside the nation it belongs to. */
    const badSeat = clone();
    badSeat.dissolve[0].successors[0].seat = '48201';   // Harris, which is Houston's
    err = null;
    try {
      await bootWorld({ seed: SEED, scenario: badSeat });
    } catch (e) { err = e; }
    ok(err && /seat .* is not inside/.test(err.message), `wrong error: ${err && err.message}`);

    // ...and the fixture still boots afterwards, so a thrown scenario has not
    // left the singleton world in a state nothing else can use.
    await bootWorld({ seed: SEED });
    equal(Game.nations.size, 51);
  });
});

/* ------------------------------------------------------------------ */
/* M8.4 — Texas, five ways                                             */
/* ------------------------------------------------------------------ */

describe('Texas, five ways', () => {
  /*
   * THE POPULATIONS ARE NOT THE ONES IN docs/SHATTER-PLAN.md's table, and the
   * table is what is wrong. Its Texan rows were computed by summing only each
   * Area's REPRESENTATIVE county and dropping the members the Area merge folded
   * into it — the M1.13 trap one level up — so they understate every Texan
   * successor and miss 1.5M people between them. The California rows happen to
   * agree because California has 58 counties and 58 Areas and nothing is merged.
   *
   *   plan   Dallas 9.02M  Houston 9.69M  El Paso 2.37M  Austin 3.54M  SA 5.17M
   *   real   Dallas 9.21M  Houston 10.07M El Paso 2.89M  Austin 3.72M  SA 5.40M
   *
   * The real figures sum to Texas's own 31.29M, which is the check that settles
   * it and settles it whatever the merge plan is.
   *
   * RE-MEASURED AT THE M9.6 AREA RE-BAKE. Texas holds 106 Areas now rather than
   * 104: the capped merge splits two of its blobs, which lands one extra Area
   * in Dallas (22 -> 23) and one in El Paso (16 -> 17) and moves a little
   * population between the three that touch them. Nothing about the PARTITION
   * changed — every Texan Area still belongs to exactly one successor, the
   * Oklahoma strays are still Oklahoma's, and the five still sum to Texas.
   * These are the numbers of a different map, not a different rule.
   */
  const EXPECT = {
    Dallas: { areas: 23, pop: 9.21e6, seat: '48113' },
    Houston: { areas: 32, pop: 10.07e6, seat: '48201' },
    'El Paso': { areas: 17, pop: 2.89e6, seat: '48141' },
    Austin: { areas: 13, pop: 3.72e6, seat: '48453' },
    'San Antonio': { areas: 21, pop: 5.40e6, seat: '48029' },
  };
  /* The five add up to Texas, whatever the merge plan makes Texas. */
  const TEXAN_AREAS = Object.values(EXPECT).reduce((t, x) => t + x.areas, 0);

  it('partitions every Texan Area exactly once, with the Oklahoma strays filtered out', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const seen = new Set();
    let total = 0;
    for (const name of Object.keys(EXPECT)) {
      const n = nationNamed(scenario, name);
      equal(n.counties.size, EXPECT[name].areas, `${name} holds the wrong number of Areas`);
      total += n.counties.size;
      for (const f of n.counties) {
        equal(Game.county[f].st, '48', `${name} holds ${f}, which is not in Texas`);
        ok(!seen.has(f), `${f} is held by two successors`);
        seen.add(f);
      }
    }
    equal(total, TEXAN_AREAS, 'the five successors do not add up to Texas');
    // Every Area that was Texas is held by one of them and by nobody else.
    const texan = Object.keys(Game.county).filter((f) => Game.county[f].st === '48');
    equal(texan.length, TEXAN_AREAS,
      'the Area plan changed and the EXPECT table above did not follow it');
    for (const f of texan) ok(seen.has(f), `${f} was Texas and is now nobody's`);

    /*
     * The strays: the Dallas leaf holds eight Oklahoma Areas and El Paso one,
     * because a cultural region does not stop at a state line. They are still
     * Oklahoma's, which is the `state` filter doing its job — without it the
     * partition throws rather than quietly annexing the Panhandle.
     */
    for (const f of ['40009', '40013', '40139']) {
      equal(Game.getOwner(f), '40', `${f} left Oklahoma with the Texas partition`);
    }
  });

  it('every successor carries the population and the seat the data says', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    for (const [name, want] of Object.entries(EXPECT)) {
      const n = nationNamed(scenario, name);
      const demo = Game.nationDemographics(n.id);
      close(demo.pop / want.pop, 1, 0.005, `${name} has ${Math.round(demo.pop)} people, not ~${want.pop}`);
      equal(n.seat, want.seat, `${name} does not sit where it was authored to`);
      ok(n.counties.has(want.seat));
    }
    // And the five populations still add up to the Texas the bake shipped.
    const total = Object.keys(EXPECT)
      .reduce((t, name) => t + Game.nationDemographics(nationNamed(scenario, name).id).pop, 0);
    close(total / 31.29e6, 1, 0.005, 'the five successors do not hold all of Texas\'s people');
  });

  it('Austin holds Travis, and therefore the old Texas seat of government', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const austin = nationNamed(scenario, 'Austin');
    ok(austin.counties.has('48453'), 'Austin does not hold Travis');
    equal(Victory.all()['48'].area, '48453', 'the Texas capital moved');
    equal(Victory.seats(austin.id, T()).own, 1, 'Austin does not own a seat of government');
    /*
     * The only blue Texan successor, surrounded by the four it just divorced.
     * The government is AUTHORED (see the note in the scenario file): the
     * thirteen Areas are 47.9R-50.6D by population, but the turn-0 plurality
     * flips on the seed because the Techno-Autocrat seed in Travis converts
     * people out of a blue supermajority. Five of eight seeds landed red.
     */
    equal(austin.gov.rulingIdeology, 'blue', 'Austin is not the blue Texan successor');
    for (const name of ['Dallas', 'Houston', 'El Paso', 'San Antonio']) {
      equal(nationNamed(scenario, name).gov.rulingIdeology, 'red',
        `${name} is not red, which is what its own ground says`);
    }
  });
});

/* ------------------------------------------------------------------ */
/* M8.5 — California, five ways plus a cession                         */
/* ------------------------------------------------------------------ */

describe('California, five ways plus a cession', () => {
  const EXPECT = {
    'Los Angeles': 1, 'Bay Area': 9, Riverside: 3, SoCal: 6,
    'Northern California': 30, Cascadia: 9,
  };

  it('partitions all 58 Californian Areas across six recipients', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const seen = new Set();
    for (const [name, count] of Object.entries(EXPECT)) {
      const n = nationNamed(scenario, name);
      equal(n.counties.size, count, `${name} holds the wrong number of Areas`);
      for (const f of n.counties) {
        equal(Game.county[f].st, '06', `${name} holds ${f}, which is not in California`);
        ok(!seen.has(f), `${f} is held twice`);
        seen.add(f);
      }
    }
    equal(seen.size, 58);
    const californian = Object.keys(Game.county).filter((f) => Game.county[f].st === '06');
    equal(californian.length, 58);
    for (const f of californian) ok(seen.has(f), `${f} was California and is now nobody's`);
  });

  it('Cascadia opens governed by a movement its own people do not lean toward', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const casc = nationNamed(scenario, 'Cascadia');
    equal(casc.gov.rulingIdeology, 'green', 'Cascadia is not governed by the movement that made it');
    equal(casc.seat, '06023', 'Cascadia does not sit in Humboldt');

    // The ground itself leans the other way: not one of its nine Areas has green
    // as its largest bloc.
    let green = 0;
    for (const f of casc.counties) {
      if (Ideology.idAt(Ideology.dominantIndex(Game.county[f].pop)) === 'green') green++;
    }
    equal(green, 0, 'Cascadia\'s ground actually is green, and the drama is gone');

    /*
     * AND THE PRICE IS ON THE BOARD FROM TURN 0. Civil Liberties measure how far
     * the governed sit from the governing, so a green government over red ground
     * opens well below its Californian neighbours. Recorded rather than merely
     * asserted to be "low", because the number is the point:
     *
     *      Cascadia 0.4735   Northern California 0.6319
     *      Bay Area 0.7124   Los Angeles 0.6961
     */
    close(casc.liberties, 0.4735, 0.02, 'Cascadia\'s opening liberties moved');
    for (const name of ['Northern California', 'Bay Area', 'Los Angeles']) {
      ok(nationNamed(scenario, name).liberties > casc.liberties + 0.1,
        `${name} is no freer than the green government over red ground`);
    }
  });

  it('the State of Jefferson is live on every Area Cascadia governs', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const casc = nationNamed(scenario, 'Cascadia');
    const jeff = Movements.get('State of Jefferson');
    ok(jeff, 'the State of Jefferson did not spawn — it carries chance 1.0');
    const home = new Set(jeff.homeland);
    for (const f of casc.counties) {
      ok(home.has(f), `Cascadia governs ${f}, which is outside Jefferson's homeland — `
        + 'phaseSentiment would delete any support there every turn');
    }
    // Its own country is not Cascadia: Cascadia belongs to the Cascadian
    // Separatists, and Jefferson opens as the opposition on the same ground.
    equal(Movements.get('Cascadian Separatists').nation, casc.id);
    notEqual(jeff.nation, casc.id);
  });

  it('a movement with a country cannot found a second one', async () => {
    /*
     * D-M8h. `refreshStates` reads `realized` only when `rec.nation` names a
     * live nation, and a realised movement is never a tier-2 candidate — so
     * wiring the link is what stops `phaseSecession` declaring a second Cascadia
     * out of the first one's own territory.
     */
    const { scenario, rng } = await bootWorld({ seed: SEED, scenario: true });
    equal(Movements.get('Cascadian Separatists').state, 'realized');
    equal(Movements.get('Deseret').state, 'realized');
    const before = Game.nations.size;
    const names = new Set([...Game.nations.values()].map((n) => n.name));
    for (let i = 0; i < 10; i++) World.advanceTurn(T(), rng);
    let cascadias = 0, deserets = 0;
    for (const [, n] of Game.nations) {
      if (n.name === 'Cascadia') cascadias++;
      if (n.name === 'Deseret') deserets++;
    }
    equal(cascadias, 1, 'a second Cascadia was founded out of the first one');
    equal(deserets, 1, 'a second Deseret was founded out of the first one');
    ok(before > 0 && names.size > 0);
    ok(scenario.cession);
  });
});

/* ------------------------------------------------------------------ */
/* M8.6 — Deseret: the cession                                         */
/* ------------------------------------------------------------------ */

describe('Deseret, half-born', () => {
  const SEEDS = [1, 2, 3, 42, 77, 99, 777, 4242, 12345, 20260829,
                 20260831, 555, 808, 1010, 31337, 2718, 1618, 161803, 90210, 60614];
  // The ten Wasatch Front Areas, from the cultural document.
  const WASATCH = ['16007', '16041', '49003', '49005', '49011',
                   '49029', '49033', '49035', '49049', '49057'];

  it('across twenty seeds the cession is a plausible country, always connected', async () => {
    /*
     * MEASURED, at the shipped odds (1.0 / 0.82 / 0.70 / 0.60 / 0.55):
     *
     *      mean 31.1 Areas and 3.75M people, spanning 19-45 across these seeds.
     *
     * The plan's table read 1.0 / 0.70 / 0.50 / 0.40 / 0.35, which is 30.8 Areas
     * expected BEFORE the connectivity filter — and the filter is not a rounding
     * error on a corridor this thin: about nine of every thirty-one rolled Areas
     * end up cut off from Salt Lake. At the paper odds twenty seeds ran 14-39
     * with a mean of 21.3, so the odds were raised until the measurement matched
     * what the design says it should be. They are authored numbers in the
     * scenario file; this is what they were tuned against.
     *
     * The band asserted here is wider than the span measured, deliberately: it
     * is a statistical statement over twenty arbitrary seeds, and a pin set to
     * the exact span would fail on the twenty-first for no reason worth having.
     */
    const sizes = [];
    for (const seed of SEEDS) {
      const { scenario } = await bootWorld({ seed, scenario: true });
      const c = scenario.cession;
      const ceded = new Set(c.ceded);
      sizes.push(c.ceded.length);

      for (const f of WASATCH) {
        ok(ceded.has(f), `seed ${seed}: the Wasatch Front Area ${f} did not cede`);
      }
      equal(Game.components(new Set(c.ceded), null).length, 1,
        `seed ${seed}: Deseret came into being in more than one piece`);
      // Anything that rolled to go and could not is remembered, not ceded.
      for (const f of c.leftBehind) {
        ok(!ceded.has(f), `seed ${seed}: ${f} is both ceded and left behind`);
        notEqual(Game.getOwner(f), scenario.cession.id);
      }
      equal(c.ceded.length + c.leftBehind.length + c.declined.length, 57,
        `seed ${seed}: the corridor is not 57 Areas`);
    }
    const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
    ok(Math.min(...sizes) >= 14, `a seed ceded only ${Math.min(...sizes)} Areas`);
    ok(Math.max(...sizes) <= 50, `a seed ceded ${Math.max(...sizes)} Areas`);
    ok(mean > 26 && mean < 36, `the mean cession is ${mean.toFixed(1)} Areas`);
  });

  it('the same seed cedes the same ground twice', async () => {
    /*
     * The roll draws from its own named stream, 'scenario' (D-M8d). Taking
     * fifty-seven numbers out of 'spawn' instead would reshuffle which movements
     * exist in every game on the board — same-seed determinism broken for a
     * reason nobody could see from the outside.
     */
    const a = (await bootWorld({ seed: 4242, scenario: true })).scenario.cession;
    const b = (await bootWorld({ seed: 4242, scenario: true })).scenario.cession;
    deepEqual(a.ceded.slice().sort(), b.ceded.slice().sort());
    deepEqual(a.leftBehind.slice().sort(), b.leftBehind.slice().sort());
    const c = (await bootWorld({ seed: 4243, scenario: true })).scenario.cession;
    notEqual(JSON.stringify(c.ceded.slice().sort()), JSON.stringify(a.ceded.slice().sort()),
      'two different seeds ceded identical ground');
  });

  it('pays no occupation on its founding ground, across seven states', async () => {
    /*
     * M8.1's whole point, and the case that made it necessary. Deseret spans up
     * to seven states; under the old `area.st !== homeSt` rule it would have
     * counted most of its own founding homeland as occupied — paying the
     * superlinear surcharge, dragging four power stocks, and SUPPRESSING ITS OWN
     * MOVEMENT on its own soil (sentiment.js's suppression term).
     */
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const des = Game.getNation(scenario.cession.id);
    const states = new Set([...des.counties].map((f) => Game.county[f].st));
    ok(states.size >= 3, `the cession only spans ${states.size} states; this proves little`);
    equal(Game.occupiedCount(des.id), 0, 'Deseret is occupying its own founding ground');
    equal(Game.treasuryFlow(des.id).occupation, 0);
    for (const f of des.counties) {
      equal(Game.isOccupied(f), false, `${f} reads as occupied on Deseret's founding ground`);
    }
    // And the old rule would have said otherwise for most of it.
    let foreignByTheOldRule = 0;
    for (const f of des.counties) if (Game.county[f].st !== des.homeSt) foreignByTheOldRule++;
    ok(foreignByTheOldRule > 0,
      'this cession no longer crosses a state line and proves nothing');
  });

  it('opens as a pariah with a parent, and the honeymoon without the wound', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const des = Game.getNation(scenario.cession.id);

    equal(des.origin, false, 'Deseret is a founding state, so nothing is at stake');
    equal(des.kind, 'breakaway');
    const legit = Recognition.legitimacy(des.id, T());
    equal(legit.value, 0, 'Deseret opens recognised');
    equal(legit.parent, '49', 'Deseret has no parent to earn a signature from');
    equal(legit.parentRecognises, false, 'Utah already signed');
    equal(Recognition.recognises('49', des.id), false);
    // ...while every successor state is recognised by construction.
    for (const rec of scenario.created) {
      if (rec.id === des.id) continue;
      equal(Recognition.recognises('01', rec.id), true,
        `${rec.name} needs vouching for, and it should not`);
    }

    /*
     * D-M8b: the honeymoon Authority term without the 12% transition GDP cut.
     * The shattering predates the first turn, and an economy that opens under
     * its own published figures reads as a data bug, not as a story.
     */
    equal(des.honeymoonUntil, T().get('secession.honeymoonTurns'),
      'Deseret did not get the honeymoon');
    const raw = await loadData();
    let want = 0;
    for (const f of des.counties) {
      for (const m of Game.areaCounties(f)) want += (raw.data.counties[m] || {}).gdp || 0;
    }
    close(Game.nationDemographics(des.id).gdp / want, 1, 0.001,
      'Deseret opened with a transition cut taken out of its economy');
  });

  it('Utah\'s signature is the key that unlocks the continent', async () => {
    /*
     * THE GAME'S BEST MECHANIC, ON THE BOARD FROM TURN 0. A parent that will not
     * acknowledge its breakaway keeps the whole continent hesitant, so Utah's
     * recognition is the single most valuable thing anybody can give Deseret —
     * and, because the player may be Utah or may be Deseret, it is a decision
     * with a price on both sides of the table from the opening position rather
     * than something that might come up around turn forty.
     *
     * MEASURED: the mean per-turn chance of the rest of the continent
     * recognising Deseret is 0.0695 while Utah refuses and 0.1808 the moment it
     * signs — 2.6x, off one signature.
     */
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const des = scenario.cession.id;
    const others = [...Game.nations.keys()].filter((x) => x !== des && x !== '49');
    const mean = () => others.reduce((t, o) => t + Recognition.chance(o, des, T()).value, 0)
      / others.length;

    const before = mean();
    ok(before > 0, 'nobody is even considering it');
    Recognition.grant('49', des, { tune: T() });
    const after = mean();
    ok(after > before * 2, `Utah's signature moved the continent from ${before.toFixed(4)} `
      + `to ${after.toFixed(4)}, which is not a pivot`);
    close(before, 0.0695, 0.02, 'the pariah opening moved');
    close(after, 0.1808, 0.03, 'the value of the parent\'s signature moved');
    const term = Recognition.chance(others[0], des, T()).inputs.find((i) => i.label === 'Let go of');
    ok(term && term.contribution > 0, 'the parent term is not in the record');
  });

  it('every state that lost ground remembers it', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const des = scenario.cession.id;
    const losers = new Set(scenario.cession.ceded.map((f) => Game.county[f].st));
    ok(losers.has('49'), 'Utah did not lose ground to the cession');
    for (const st of losers) {
      if (!Game.getNation(st)) continue;
      const rel = Relations.between(st, des, T());
      ok(rel.value < 0, `${st} has no opinion about the country that took its ground`);
      ok(rel.inputs.some((i) => i.kind === 'lost'),
        `${st} remembers something other than losing ground`);
      ok(rel.inputs.every((i) => i.turn === 0), 'the memory is not back-dated to turn 0');
    }
    // Silent grants: nobody was told, because there was nobody to tell on turn 0.
    equal(Ledger.ofKind('recognise').length, 0);
  });
});

/* ------------------------------------------------------------------ */
/* M8.7 — the corridor that stayed                                     */
/* ------------------------------------------------------------------ */

describe('The corridor that stayed', () => {
  it('is seeded below the secession line, so nothing mass-defects on turn 1', async () => {
    /*
     * `secession.countyThreshold` is 0.40 and an Area over it defects the turn
     * after. Seeding the corridor over the line would reproduce the turn-zero
     * Cascadia disaster the guard at movements.js:283 is a note about.
     */
    const { scenario, rng } = await bootWorld({ seed: SEED, scenario: true });
    const line = T().get('secession.countyThreshold');
    ok(scenario.seeded.length > 15, `only ${scenario.seeded.length} corridor Areas were seeded`);
    const homeland = new Set(Movements.get('Deseret').homeland);
    for (const s of scenario.seeded) {
      const c = Game.county[s.area];
      ok(homeland.has(s.area),
        `${s.area} was seeded outside Deseret's homeland; phaseSentiment deletes it next turn`);
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      const share = (c.mov.Deseret || 0) / pop;
      ok(share > 0.15, `${s.area} was seeded at ${share.toFixed(3)}, which is not elevated`);
      ok(share < line, `${s.area} was seeded at ${share.toFixed(3)}, over the ${line} line`);
    }
    const before = Game.getNation(scenario.cession.id).counties.size;
    World.advanceTurn(T(), rng);
    equal(Ledger.ofKind('defect').length, 0, 'the corridor mass-defected on turn 1');
    equal(Game.getNation(scenario.cession.id).counties.size, before);
  });

  it('the seed survives the clamp, and every movement stays a slice of its ideology', async () => {
    /*
     * `clampMovements` scales a movement back to what its own ideology actually
     * holds. A seed written the naive way — set `mov[name]` and hope — is
     * clamped most of the way back to nothing before the first turn runs, which
     * is why the applier grows the ideology first and sets the head count after
     * (the movements.test.js:146 pattern).
     */
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const idx = Movements.ideologyIndexOf('Deseret');
    for (const s of scenario.seeded) {
      const c = Game.county[s.area];
      ok(c.mov.Deseret > 0, `${s.area} lost its seed to the clamp`);
      ok(c.mov.Deseret <= c.pop[idx] + 1e-6,
        `${s.area} claims more people than its ideology holds`);
    }
    // The whole-board invariant, on the shattered board.
    const N = Ideology.count();
    for (const f in Game.county) {
      const c = Game.county[f];
      const byIdeology = new Array(N).fill(0);
      for (const m in c.mov) byIdeology[Movements.ideologyIndexOf(m)] += c.mov[m];
      for (let i = 0; i < N; i++) {
        ok(byIdeology[i] <= c.pop[i] + 1e-6,
          `${f}: ${Ideology.idAt(i)} holds ${c.pop[i]} and its movements claim ${byIdeology[i]}`);
      }
    }
  });

  it('the boost is a named row in the Why panel, hardest on the ground left behind', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const stay = scenario.seeded.filter((s) => s.group === 'stay');
    const left = scenario.seeded.filter((s) => s.group === 'leftBehind');
    ok(stay.length && left.length,
      `this seed produced ${stay.length} stay-behind and ${left.length} left-behind Areas`);
    ok(Game.county[left[0].area].attrs.sentBoost > Game.county[stay[0].area].attrs.sentBoost,
      'the Areas that voted to go and could not are no angrier than the ones that stayed');

    const why = Sentiment.explain(stay[0].area, 'Deseret', T());
    const row = why.inputs.find((i) => i.key === 'sent.wBoost');
    ok(row, `the boost is not in the explanation: ${why.inputs.map((i) => i.label).join(', ')}`);
    equal(row.label, 'Unfinished business');
    close(row.contribution, Game.county[stay[0].area].attrs.sentBoost * T().get('sent.wBoost'), 1e-9,
      'the explained contribution is not the one the model used');

    // ...and it is INSIDE grievance, so it is still multiplied by base: an
    // authored grievance cannot radicalise ground that does not share the
    // ideology. Zero the weight and the target falls.
    const withBoost = why.value;
    T().load({ 'sent.wBoost': 0 });
    const without = Sentiment.explain(stay[0].area, 'Deseret', T()).value;
    T().load({ 'sent.wBoost': 0.35 });
    ok(withBoost > without, 'switching the weight off changed nothing');
  });

  it('over forty turns the boost and the rate each visibly move the corridor', async () => {
    /*
     * MEASURED, on the shattered board at seed 20260829, over 40 world turns,
     * across the 28 Areas the cession left behind:
     *
     *                                    mean share   organised   Areas joined
     *      as shipped (boost .35, rate 1.5)  0.3415    3,767,808        18
     *      with sent.wBoost = 0              0.3067    —                18
     *      with growthRate  = 1.0            0.3601    3,506,341        12
     *
     * THE MEAN SHARE IS NOT THE METRIC FOR THE RATE, and finding that out is
     * what the M9.6 re-bake was good for. Look at the third column: the faster
     * rate converts SIX MORE stay-behind Areas into Deseret's territory, which
     * takes them out of the contested set and leaves the mean measuring only
     * the most stubborn residue — sixteen Areas at rate 1.0 against ten at rate
     * 1.5. So the mean falls *because the rate worked*. The confound was always
     * there; the re-bake moved the board far enough for it to bite, and before
     * that this test had been quietly asserting a number that could invert.
     *
     * The rate is therefore measured on the two things it cannot fake:
     * organised PEOPLE (+261,467, and people do not stop being organised by
     * crossing a border) and GROUND (49 Areas held against 42, 18 joined
     * against 12). The BOOST keeps the mean, because the boost does not move
     * borders — it makes the same ground angrier, which is exactly what a mean
     * share is for.
     *
     * WHAT THIS DOES NOT DO is compare the corridor's slope against another
     * movement's home ground, which is what the milestone asked for, because
     * that comparison cannot mean what it sounds like: the corridor is SEEDED at
     * 0.295 and every movement converges toward its own ceiling, so a movement
     * starting near zero necessarily posts the steeper line. Measured anyway,
     * for the record: corridor +0.0041/turn against Franklin's +0.0090/turn,
     * from 0.295 and 0.056 respectively. The A/B above is the measurement that
     * actually isolates the claim, because it is the same board twice.
     */
    const raw = await loadData();
    const meanShare = (areas, name) => {
      let t = 0, n = 0;
      for (const f of areas) {
        const c = Game.county[f];
        if (!c) continue;
        let p = 0;
        for (let i = 0; i < c.pop.length; i++) p += c.pop[i];
        if (p <= 0) continue;
        t += (c.mov[name] || 0) / p;
        n++;
      }
      return n ? t / n : 0;
    };
    const run = async ({ wBoost, rate }) => {
      const original = raw.partyDefs.Deseret.growthRate;
      raw.partyDefs.Deseret.growthRate = rate;
      try {
        const { rng, scenario } = await bootWorld({ seed: SEED, scenario: true });
        T().load({ 'sent.wBoost': wBoost });
        const stay = scenario.seeded.map((s) => s.area);
        const at0 = meanShare(stay, 'Deseret');
        for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
        return { at0, at40: meanShare(stay, 'Deseret'),
                 // Organised people, which a defection cannot take off the
                 // books the way it takes an Area out of the contested set.
                 people: Movements.strength('Deseret').people,
                 held: Game.getNation(scenario.cession.id).counties.size,
                 joined: stay.filter((f) => Game.getOwner(f) === scenario.cession.id).length };
      } finally {
        raw.partyDefs.Deseret.growthRate = original;
        T().load({ 'sent.wBoost': 0.35 });
      }
    };

    const shipped = await run({ wBoost: 0.35, rate: 1.5 });
    const noBoost = await run({ wBoost: 0, rate: 1.5 });
    const slowRate = await run({ wBoost: 0.35, rate: 1.0 });

    close(shipped.at0, 0.2950, 0.02, 'the corridor no longer opens elevated');
    ok(shipped.at40 > shipped.at0, 'the corridor did not rise at all');
    ok(shipped.at40 - noBoost.at40 > 0.02,
      `the boost is worth only ${(shipped.at40 - noBoost.at40).toFixed(4)} of share over 40 turns`);
    /*
     * The rate, on the two channels a defection cannot invert. See the note
     * above: mean share across the stay-behind set FALLS under the faster rate,
     * because the faster rate turns six more of those Areas into territory.
     */
    ok(shipped.people - slowRate.people > 100e3,
      `the rate organised only ${Math.round(shipped.people - slowRate.people)} more people over 40 turns`);
    ok(shipped.joined > slowRate.joined,
      `the rate took ${shipped.joined} stay-behind Areas against ${slowRate.joined} — no better`);
    ok(shipped.held > slowRate.held,
      `Deseret finished with ${shipped.held} Areas at rate 1.5 and ${slowRate.held} at rate 1.0`);

    /*
     * AND THE GROUND ACTUALLY MOVES. Tier-1 defection is what a realised
     * movement's country grows by, and the corridor is where it should be
     * happening: most of what stayed behind ends up inside Deseret within forty
     * turns, one Area at a time along the frontier.
     */
    ok(shipped.joined > shipped.at0 * 0 + 10,
      `only ${shipped.joined} stay-behind Areas ever joined Deseret`);
    ok(shipped.held > 40, `Deseret finished with only ${shipped.held} Areas`);
  });
});

/* ------------------------------------------------------------------ */
/* M8.8 — the shattered board is a world like any other                */
/* ------------------------------------------------------------------ */

describe('The shattered board, as a world', () => {
  it('conserves population and keeps ownership single-valued', async () => {
    const { raw } = await bootWorld({ seed: SEED, scenario: true });
    close(totalNationPop(), totalCountyPop(), 1e-6, 'nations and Areas disagree about the people');
    let baked = 0;
    for (const f in raw.data.counties) baked += raw.data.counties[f].pop || 0;
    close(totalCountyPop(), baked, 1, 'the board does not hold the population the bake shipped');

    for (const [id, n] of Game.nations) {
      for (const f of n.counties) equal(Game.getOwner(f), id, `${f} is owned by two nations`);
    }
    let owned = 0;
    for (const [, n] of Game.nations) owned += n.counties.size;
    equal(owned, Object.keys(Game.county).length, 'an Area is held by nobody or by two nations');
  });

  it('round-trips through a save with no format change beyond M8.1\'s', async () => {
    const { scenario } = await bootWorld({ seed: SEED, scenario: true });
    const before = JSON.stringify(Game.serialize());
    const movBefore = JSON.stringify(Movements.serialize());
    Game.loadState(JSON.parse(before));
    Movements.loadState(JSON.parse(movBefore));
    equal(JSON.stringify(Game.serialize()), before, 'serialize -> load -> serialize is not the identity');

    equal(Game.nations.size, 61);
    const des = Game.getNation(scenario.cession.id);
    equal(des.origin, false);
    equal(des.kind, 'breakaway');
    equal(des.seat, '49035', 'the authored seat did not survive the round-trip');
    equal(Game.occupiedCount(des.id), 0, 'home ground did not survive the round-trip');
    equal(Movements.get('Deseret').nation, des.id, 'the movement lost its country');
    equal(Movements.get('Cascadian Separatists').nation, byName(scenario, 'Cascadia').id);
    // The authored per-Area grievance rides in `attrs`, which the v2 document
    // already carried — nothing new in the format for it.
    ok(Game.county[scenario.seeded[0].area].attrs.sentBoost > 0,
      'the corridor lost its grievance in the save');
  });

  it('same seed, same world, sixty turns in', async () => {
    const a = await bootWorld({ seed: 777, scenario: true });
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), a.rng);
    const fa = fingerprint();
    const b = await bootWorld({ seed: 777, scenario: true });
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), b.rng);
    deepEqual(fingerprint(), fa, 'two runs at one seed produced different worlds');
  });

  it('plays sixty turns without founding a duplicate of anything', async () => {
    const { rng, scenario } = await bootWorld({ seed: SEED, scenario: true });
    for (let i = 0; i < 60; i++) World.advanceTurn(T(), rng);
    const counts = new Map();
    for (const [, n] of Game.nations) counts.set(n.name, (counts.get(n.name) || 0) + 1);
    for (const [name, k] of counts) {
      ok(k === 1, `${k} nations are called "${name}"`);
    }
    // Every movement that has a country has exactly one, and it is alive.
    for (const rec of Movements.all()) {
      if (!rec.nation) continue;
      ok(Game.getNation(rec.nation), `${rec.name} points at a nation that no longer exists`);
      equal(rec.state, 'realized');
    }
    ok(Game.nations.size > 10, 'the continent collapsed to nothing');
    ok(scenario.created.length === 12);
  });

  it('a 61-nation round costs what a 51-nation round did, plus its nations', async () => {
    /*
     * MEASURED on this machine, mean of five rounds after three warm-up rounds:
     *
     *      baseline   137.5 ms   (54 nations by the time the AI has played)
     *      shattered  187.3 ms   (63)
     *
     * about 36% more work for about 17% more nations, which is the shape to
     * expect: reach, coalitions and the recognition survey are all per nation
     * per nation. The bound here is deliberately loose — this is a smoke alarm
     * for an accidental quadratic, not a benchmark.
     */
    const time = async (scenario) => {
      const { rng } = await bootWorld({ seed: SEED, scenario });
      for (let i = 0; i < 2; i++) AI.round(T(), rng);
      const t0 = performance.now();
      for (let i = 0; i < 3; i++) AI.round(T(), rng);
      return (performance.now() - t0) / 3;
    };
    const baseline = await time(false);
    const shattered = await time(true);
    ok(shattered < baseline * 3,
      `a shattered round costs ${shattered.toFixed(0)}ms against a baseline ${baseline.toFixed(0)}ms`);
    ok(shattered > 0);
  });
});

describe('The shattered board, as a menu', () => {
  it('the faction picker spreads 61 openings across all four tiers', async () => {
    /*
     * The tiers are PROPORTIONS OF THE FIELD (0.20 / 0.35 / 0.30 / 0.15), not
     * fixed score thresholds, so they should survive the field growing by ten —
     * and measured, they do:
     *
     *      baseline  51 nations  11 / 17 / 15 / 8
     *      shattered 61 nations  13 / 20 / 19 / 9
     *
     * and the twelve new countries land in four different bands rather than
     * clumping: Northern California comfortable, Cascadia brutal, and Austin —
     * blue, small, and surrounded by the four states it just divorced —
     * punishing.
     */
    await bootWorld({ seed: SEED, scenario: true });
    const list = Factions.list(T());
    equal(list.length, 61);
    const count = {};
    for (const r of list) count[r.tier] = (count[r.tier] || 0) + 1;
    for (const t of Factions.TIERS) {
      const share = (count[t.id] || 0) / list.length;
      ok(Math.abs(share - t.share) < 0.06,
        `${t.id} holds ${(share * 100).toFixed(0)}% of the field, not ~${t.share * 100}%`);
    }
    const tierOf = (name) => list.find((r) => r.name === name).tier;
    equal(tierOf('Cascadia'), 'brutal', 'a nine-Area green government over red ground is not brutal');
    ok(new Set(['Dallas', 'Houston', 'Austin', 'Cascadia', 'Deseret'].map(tierOf)).size >= 3,
      'the successors all landed in the same band');
    for (const r of list) ok(r.bonus >= 0 && Number.isFinite(r.bonus));
  });

  it('the seats table is untouched, so the AI\'s literal still matches it', async () => {
    /*
     * `ai.js` scores reunification against a hard-coded `seats: 51`, and
     * `Victory` counts seats out of `content/capitals.json`, which the scenario
     * does not touch: a successor may hold a seat or not, but the number of
     * seats on the continent is still fifty-one. Pinned here because the two
     * numbers agreeing is a coincidence maintained by hand.
     */
    await bootWorld({ seed: SEED, scenario: true });
    equal(Object.keys(Victory.all()).length, 51);
    let held = 0;
    for (const [nid] of Game.nations) held += Victory.seats(nid, T()).own;
    equal(held, 51, 'a seat of government belongs to nobody');
    for (const [nid] of Game.nations) equal(Victory.seats(nid, T()).total, 51);
  });

  it('the two statewide movements became reunification movements', async () => {
    /*
     * D-M8j. Five successors where Texas was, and "A Free Texas" would otherwise
     * be a sixth Texas declared out of the other five. It is not deleted,
     * because a movement to put the old state back together is exactly the right
     * pressure on a board that has just come apart — and the mechanics already
     * do the right thing, since its homeland is the whole state and what it
     * founds if it declares IS Texas coming back. Only the type and the goals
     * changed.
     */
    const { raw } = await bootWorld({ seed: SEED, scenario: true });
    for (const name of ['A Free Texas', 'California Republic']) {
      equal(raw.partyDefs[name].type, 'reunification', `${name} is still a separatist movement`);
      ok(raw.partyDefs[name].goals.some((g) => /reunite/.test(g)),
        `${name} does not say what it wants: ${raw.partyDefs[name].goals}`);
      const rec = Movements.get(name);
      if (!rec) continue;   // both roll at 0.5
      equal(rec.type, 'reunification');
      equal(rec.nation, null, 'a reunification movement already has a country');
      // Its homeland is the whole of the state that came apart, which is what
      // makes the thing it would found the old state rather than a sixth piece.
      const st = name === 'A Free Texas' ? '48' : '06';
      const home = new Set(rec.homeland);
      const inState = Object.keys(Game.county).filter((f) => Game.county[f].st === st);
      const covered = inState.filter((f) => home.has(f)).length;
      ok(covered / inState.length > 0.9,
        `${name} covers only ${covered} of ${inState.length} Areas of the state it wants back`);
    }
  });
});
