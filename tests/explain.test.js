/*
 * M5.4 — the player-facing explanation layer.
 *
 * The same data as the dashboard at lower verbosity, plus the three things that
 * turn it from retrospective to predictive:
 *
 *   - PRESSURE CLOCKS: "breakaway in ~3 turns at current trend" is a statement a
 *     player can act on; "38% organised" is one they have to model in their head.
 *   - THE PRESSURE MAP: in a game about fragmentation this is the real map, and
 *     ownership is what you check to see what it did.
 *   - FOG: exact bands for your own ground, calm/rising/critical for everyone
 *     else's — which is what stops the pressure map from being an omniscient
 *     targeting overlay for the annex button.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const T = () => window.TUNE;

describe('Pressure clocks', () => {
  it('an Area already over the line reports zero, not a negative countdown', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
    const threshold = T().get('secession.countyThreshold');
    let found = null;
    for (const rec of Movements.all()) {
      for (const f of rec.homeland) {
        const c = Game.county[f];
        let pop = 0;
        for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
        if (pop > 0 && (c.mov[rec.name] || 0) / pop >= threshold) { found = [f, rec.name]; break; }
      }
      if (found) break;
    }
    if (!found) return;
    const cl = Sentiment.clock(found[0], found[1], T());
    equal(cl.turns, 0);
    equal(cl.arriving, true);
    ok(cl.current >= cl.threshold);
  });

  it('says STALLING rather than lying about a trend that flattens', async () => {
    /*
     * A movement whose target sits below the threshold is not slowly
     * approaching it — it is never getting there, and "in 12 turns" would be a
     * confident falsehood about the most important number on the screen.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 30; i++) World.advanceTurn(T(), rng);
    let stalling = 0, arriving = 0;
    for (const rec of Movements.all()) {
      for (const f of rec.homeland) {
        const cl = Sentiment.clock(f, rec.name, T());
        if (!cl) continue;
        if (cl.turns === null) { stalling++; ok(cl.target < cl.threshold, 'a stalling clock has a target over the line'); }
        else if (cl.turns > 0) { arriving++; ok(cl.target >= cl.threshold, 'an arriving clock has a target under the line'); }
      }
    }
    ok(stalling > 0, 'nothing is stalling anywhere; the honest case is untested');
    ok(arriving > 0, 'nothing is arriving anywhere; the countdown is untested');
  });

  it('the countdown shortens as an Area gets closer', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 25; i++) World.advanceTurn(T(), rng);
    const pick = [];
    for (const rec of Movements.all()) {
      for (const f of rec.homeland) {
        const cl = Sentiment.clock(f, rec.name, T());
        if (cl && cl.turns > 2) { pick.push([f, rec.name, cl.turns]); break; }
      }
      if (pick.length) break;
    }
    if (!pick.length) return;
    const [f, name, before] = pick[0];
    for (let i = 0; i < 3; i++) World.advanceTurn(T(), rng);
    const after = Sentiment.clock(f, name, T());
    if (!after || after.turns == null) return; // the target may have moved under the line
    ok(after.turns <= before, `the clock went from ${before} to ${after.turns} turns while the share rose`);
  });

  it('returns null for a movement that is not in the game', async () => {
    await bootWorld({ seed: SEED });
    equal(Sentiment.clock('49035', 'The Whig Revival', T()), null);
  });

  it('never estimates faster than the rate limit allows', async () => {
    /*
     * The clock is a FLOOR on the time, which is the direction a warning should
     * err in: the approach is rate-limited AND eases as it nears the target, so
     * the real arrival is never sooner than this.
     */
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), rng);
    // The rate is PER MOVEMENT since M8.2 (`sent.maxRise` x `growthRate`), and
    // the clock has to use the movement's own or it is a second, wrong model of
    // the phase — a corridor that turns half again as fast arrives sooner.
    const maxRise = T().get('sent.maxRise');
    for (const rec of Movements.all()) {
      const rise = maxRise * Movements.rateOf(rec.name);
      for (const f of rec.homeland.slice(0, 20)) {
        const cl = Sentiment.clock(f, rec.name, T());
        if (!cl || cl.turns == null || cl.turns === 0) continue;
        const gap = cl.threshold - cl.current;
        ok(cl.turns >= Math.ceil(gap / rise) - 1e-9,
          `${f}/${rec.name}: ${cl.turns} turns to cross a gap of ${gap.toFixed(3)} at ${rise}/turn`);
      }
    }
  });
});

describe('The pressure map', () => {
  it('reads the strongest movement in an Area', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), rng);
    for (const f of Object.keys(Game.county).slice(0, 200)) {
      const c = Game.county[f];
      let pop = 0;
      for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
      let worst = 0;
      for (const m in c.mov) worst = Math.max(worst, pop > 0 ? c.mov[m] / pop : 0);
      close(MapModes.pressureOf(f), worst, 1e-9, `pressure disagrees with the map at ${f}`);
    }
    equal(MapModes.pressureOf('nowhere'), 0, 'an unknown Area should be 0, not NaN');
  });

  it('gives a colour for every Area and a legend for the mode', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 20; i++) World.advanceTurn(T(), rng);
    const colors = new Set();
    for (const f in Game.county) {
      const c = MapModes.color('pressure', f);
      ok(/^#[0-9a-f]{6}$/i.test(c), `Area ${f} got colour "${c}"`);
      colors.add(c);
    }
    ok(colors.size >= 3,
      `the whole country is ${colors.size} colour(s); the pressure map says nothing`);
    ok(MapModes.legend('pressure').includes('Critical'), 'the pressure legend has no bands');
  });

  it('the bands separate a quiet Area from a critical one', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
    let quiet = null, hot = null;
    for (const f in Game.county) {
      const v = MapModes.pressureOf(f);
      if (v < 0.02 && !quiet) quiet = f;
      if (v > 0.45 && !hot) hot = f;
    }
    if (!quiet || !hot) return;
    ok(MapModes.color('pressure', quiet) !== MapModes.color('pressure', hot),
      'a quiet Area and a critical one are painted the same colour');
  });
});

describe('The newspaper', () => {
  it('a turn with a secession leads with it, not with the growth line', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    let heads = null;
    for (let i = 0; i < 60 && !heads; i++) {
      World.advanceTurn(T(), rng);
      const h = Ledger.headlines();
      if (h.some((x) => x.kind === 'declare')) heads = h;
    }
    ok(heads, 'sixty turns produced no secession to report');
    equal(heads[0].kind, 'declare', 'something outranked a declaration of independence');
  });

  it('does not say the same news twice', async () => {
    /*
     * A declaration already says a country came into being, so the `found`
     * entry beside it is the same news in one of five slots. It stays in the
     * ledger, where the timeline wants it as its own fact.
     */
    const { rng } = await bootWorld({ seed: SEED });
    let turn = null;
    for (let i = 0; i < 60 && turn === null; i++) {
      World.advanceTurn(T(), rng);
      if (Ledger.headlines().some((x) => x.kind === 'declare')) turn = World.getTurn() - 1;
    }
    if (turn === null) return;
    const heads = Ledger.headlines(turn);
    const declared = new Set(heads.filter((h) => h.kind === 'declare').map((h) => h.subject));
    for (const h of heads) {
      ok(!(h.kind === 'found' && declared.has(h.subject)),
        'the newspaper reported a founding and the declaration that caused it');
    }
    // ...and the founding is still in the ledger
    ok(Ledger.forTurn(turn).some((e) => e.kind === 'found'), 'the founding was dropped from the ledger too');
  });
});
