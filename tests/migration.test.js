/*
 * M7.9 — people move.
 *
 * The invariant that matters most is the dull one: MIGRATION CONSERVES PEOPLE.
 * A phase that writes to its neighbours rather than to itself can lose a
 * population to a rounding order or duplicate one by applying as it goes, and
 * neither shows up as an error — it shows up as a world that quietly gains
 * eleven million people over forty turns.
 *
 * After that: the gradient runs uphill and only uphill, a border is friction
 * rather than a wall, movements shrink with the people who leave and are
 * DILUTED by the people who arrive, and the whole thing is order-independent —
 * the node numbering must not decide who moved.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';

const SEED = 20260831;
const T = () => window.TUNE;
const N = () => Ideology.count();

/** World population straight off the live columns. */
function worldPop() {
  const s = Game.state();
  let t = 0;
  for (let i = 0; i < s.pop.length; i++) t += s.pop[i];
  return t;
}

/** A pair of buffers, so a phase can be run on its own. */
function buffers() {
  const snap = World.buffer(), nxt = World.buffer();
  return { snap, nxt };
}

/** Apply a buffer back to the live world, the way advanceTurn does. */
function writeback(nxt) {
  Game.batch(() => {
    const live = Game.state();
    live.pop.set(nxt.pop);
    for (let i = 0; i < nxt.n; i++) Game.county[nxt.idAt(i)].mov = nxt.mov[i];
  });
}

describe('Migration — what must not change', () => {
  it('moves people without creating or destroying any', async () => {
    await bootWorld({ seed: SEED });
    const before = worldPop();
    const { snap, nxt } = buffers();
    const res = Migration.step(snap, nxt, T(), Game.state().owner);
    ok(res.moved > 0, 'nobody moved at all');
    let after = 0;
    for (let i = 0; i < nxt.pop.length; i++) after += nxt.pop[i];
    close(after, before, before * 1e-12, `${Math.round(after - before)} people appeared from nowhere`);
  });

  it('and never leaves a negative population behind', async () => {
    await bootWorld({ seed: SEED });
    const { snap, nxt } = buffers();
    Migration.step(snap, nxt, T(), Game.state().owner);
    for (let i = 0; i < nxt.pop.length; i++) ok(nxt.pop[i] >= 0, `pop[${i}] = ${nxt.pop[i]}`);
  });

  it('the node numbering does not decide who moved', async () => {
    /*
     * Every flow is computed before any is applied. Applying as it goes would
     * let the first Area's arrivals decide the second Area's departures, so the
     * result would depend on the order of the loop — which is exactly the
     * failure the snap/nxt discipline exists to prevent, in a phase that writes
     * to its NEIGHBOURS.
     *
     * Run twice from the same snapshot: identical, to the bit.
     */
    await bootWorld({ seed: SEED });
    const snap = World.buffer();
    const a = World.buffer(), b = World.buffer();
    Migration.step(snap, a, T(), Game.state().owner);
    Migration.step(snap, b, T(), Game.state().owner);
    for (let i = 0; i < a.pop.length; i++) equal(a.pop[i], b.pop[i], `Area ${i} differs between runs`);
  });

  it('reading the pull changes nothing', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    for (const f of Object.keys(Game.county).slice(0, 300)) Migration.explain(f, 'red', T());
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `explaining migration changed ${k}`);
  });
});

describe('Migration — the gradient', () => {
  it('runs uphill: nobody moves somewhere worse', async () => {
    await bootWorld({ seed: SEED });
    const snap = World.buffer(), nxt = World.buffer();
    const own = Game.state().owner;
    const ctx = Migration.build(snap, own, T());
    Migration.step(snap, nxt, T(), own);
    const g = Game.graph();
    const n = N();
    let checked = 0;
    for (let f = 0; f < snap.n && checked < 400; f++) {
      for (let k = 0; k < n; k++) {
        const gained = nxt.pop[f * n + k] - snap.pop[f * n + k];
        if (gained <= 1) continue;
        // Somebody arrived here, so at least one neighbour must be worse off
        // for people like them than this Area is.
        const home = Migration.pull(ctx, f, k);
        let anyWorse = false;
        for (const j of g.neighbors(f)) if (Migration.pull(ctx, j, k) < home) { anyWorse = true; break; }
        ok(anyWorse, `people moved into Area ${f} from nowhere better-off`);
        checked++;
      }
    }
    ok(checked > 0, 'no arrivals to check');
  });

  it('nobody moves when there is nowhere better', async () => {
    /*
     * With the threshold above every gradient on the board, the phase is a
     * no-op — which is the honest test of "people move because it is better
     * there" rather than "people move".
     */
    await bootWorld({ seed: SEED });
    const tune = TuneMeta.createTune();
    tune.set('migration.threshold', 1);
    const { snap, nxt } = buffers();
    const res = Migration.step(snap, nxt, tune, Game.state().owner);
    equal(Math.round(res.moved), 0);
    for (let i = 0; i < nxt.pop.length; i++) equal(nxt.pop[i], snap.pop[i]);
  });

  it('a nation nobody wants to live in loses people to one they do', async () => {
    await bootWorld({ seed: SEED });
    // Two neighbours, one made miserable and one made pleasant. The stocks are
    // the nation's, so this is the whole causal chain the milestone is for.
    const a = Game.getNation('06'), b = Game.getNation('32'); // California, Nevada
    a.qol = 0.05; a.liberties = 0.05;
    b.qol = 0.95; b.liberties = 0.95;
    const { snap, nxt } = buffers();
    const res = Migration.step(snap, nxt, T(), Game.state().owner);
    const out = res.flows.filter((f) => f.from === '06' && f.to === '32');
    const back = res.flows.filter((f) => f.from === '32' && f.to === '06');
    ok(out.length, 'nobody left the miserable nation for the pleasant one');
    ok(!back.length, 'people moved INTO the miserable nation');
    ok(Migration.netFor('32') > 0 && Migration.netFor('06') < 0,
      `net was ${Migration.netFor('06')} / ${Migration.netFor('32')}`);
  });

  it('a border is friction, not a wall', async () => {
    await bootWorld({ seed: SEED });
    Game.getNation('06').qol = 0.05;
    Game.getNation('32').qol = 0.95;
    const open = TuneMeta.createTune();
    open.set('migration.borderFriction', 1);
    const shut = TuneMeta.createTune();
    shut.set('migration.borderFriction', 0);

    const snap = World.buffer();
    const wide = World.buffer(), none = World.buffer();
    const a = Migration.step(snap, wide, open, Game.state().owner);
    const outA = a.flows.filter((f) => f.from === '06' && f.to === '32')
      .reduce((s, f) => s + f.people, 0);
    const b = Migration.step(snap, none, shut, Game.state().owner);
    const outB = b.flows.filter((f) => f.from === '06' && f.to === '32')
      .reduce((s, f) => s + f.people, 0);
    ok(outA > outB, `friction did not slow anybody: ${outA} vs ${outB}`);
    equal(Math.round(outB), 0, 'a closed border still leaked');
    // ...and closing it does not stop people moving INSIDE a nation.
    ok(b.moved > 0, 'a closed border stopped internal movement too');
  });
});

describe('Migration — alignment', () => {
  it('people move toward their own kind, and the map sorts', async () => {
    /*
     * Run in isolation, with nothing else touching the population: the claim is
     * about what migration does, and in a live turn political drift is pulling
     * the other way. Dominance is the share of an Area held by its largest
     * ideology, averaged over the board.
     */
    await bootWorld({ seed: SEED });
    const own = Game.state().owner;
    const n = N();
    const dominance = (buf) => {
      let sum = 0, count = 0;
      for (let f = 0; f < buf.n; f++) {
        let total = 0, best = 0;
        for (let k = 0; k < n; k++) { const v = buf.pop[f * n + k]; total += v; if (v > best) best = v; }
        if (total > 0) { sum += best / total; count++; }
      }
      return count ? sum / count : 0;
    };
    let cur = World.buffer();
    const start = dominance(cur);
    for (let i = 0; i < 12; i++) {
      const nxt = World.buffer();
      nxt.area.copyFrom(cur.area);
      for (let f = 0; f < nxt.n; f++) nxt.mov[f] = { ...cur.mov[f] };
      Migration.step(cur, nxt, T(), own);
      cur = nxt;
    }
    ok(dominance(cur) > start,
      `twelve turns of migration left the map no more sorted: ${start} -> ${dominance(cur)}`);
  });

  it('and alignment is what does it', async () => {
    await bootWorld({ seed: SEED });
    const flat = TuneMeta.createTune();
    flat.set('migration.wAlignment', 0);
    const snap = World.buffer();
    const withIt = World.buffer(), without = World.buffer();
    Migration.step(snap, withIt, T(), Game.state().owner);
    Migration.step(snap, without, flat, Game.state().owner);
    let differs = 0;
    for (let i = 0; i < withIt.pop.length; i++) if (Math.abs(withIt.pop[i] - without.pop[i]) > 1) differs++;
    ok(differs > 100, `turning alignment off changed only ${differs} numbers`);
  });
});

describe('Migration — movements', () => {
  it('a movement shrinks with the people who leave, and is diluted by those who arrive', async () => {
    /*
     * Membership is people. When a tenth of an Area's reds leave, a tenth of the
     * red movement leaves with them; when settlers arrive, the movement's SHARE
     * falls although its membership has not. The second half is what makes
     * settlement an answer to secession, and it is the reason arrivals
     * deliberately do not join.
     */
    await bootWorld({ seed: SEED });
    const snap = World.buffer(), nxt = World.buffer();
    const own = Game.state().owner;
    const n = N();
    // Find an Area holding a movement that will lose people this turn.
    Migration.step(snap, nxt, T(), own);
    let checked = 0;
    for (let f = 0; f < snap.n && checked < 40; f++) {
      const bag = snap.mov[f];
      for (const name in bag) {
        if (!(bag[name] > 0)) continue;
        const k = Movements.ideologyIndexOf(name);
        if (k < 0) continue;
        const was = snap.pop[f * n + k], now = nxt.pop[f * n + k];
        if (now >= was) {
          // Nobody of that ideology left: membership is untouched, so the share
          // can only have fallen if others arrived.
          equal(nxt.mov[f][name], bag[name], 'arrivals recruited themselves into a movement');
        } else {
          ok(nxt.mov[f][name] < bag[name] + 1e-9, 'a movement did not shrink with its people');
          close(nxt.mov[f][name] / bag[name], now / was, 1e-6,
            'a movement shrank by a different share than its people did');
        }
        checked++;
      }
    }
    ok(checked > 0, 'no movements to check');
  });

  it('and a movement never outnumbers the people who could hold it', async () => {
    await bootWorld({ seed: SEED });
    const { snap, nxt } = buffers();
    Migration.step(snap, nxt, T(), Game.state().owner);
    const n = N();
    for (let f = 0; f < nxt.n; f++) {
      for (const name in nxt.mov[f]) {
        const k = Movements.ideologyIndexOf(name);
        if (k < 0) continue;
        ok(nxt.mov[f][name] <= nxt.pop[f * n + k] + 1,
          `${name} has more members than there are people of its ideology in Area ${f}`);
      }
    }
  });
});

describe('Migration — the report', () => {
  it('names who arrived and who left, and separates churn from net', async () => {
    await bootWorld({ seed: SEED });
    Game.getNation('06').qol = 0.05;
    Game.getNation('32').qol = 0.95;
    const { snap, nxt } = buffers();
    Migration.step(snap, nxt, T(), Game.state().owner);
    const r = Migration.report('32');
    ok(r.came > 0, 'nobody arrived in the pleasant nation');
    ok(r.into.some((x) => x.nid === '06'), 'the source is not named');
    ok(r.internal >= 0, 'internal churn is negative');
    // Net is what crossed the border; churn inside a nation cancels by
    // construction and is reported separately rather than folded in.
    close(r.net, r.came - r.left, Math.max(1, Math.abs(r.net) * 1e-6));
  });

  it('the Why record explains one Area to one kind of person', async () => {
    await bootWorld({ seed: SEED });
    const f = [...Game.getNation('06').counties][0];
    const why = Migration.explain(f, 'red', T());
    ok(why && why.value >= 0 && why.value <= 1, 'no pull, or an impossible one');
    equal(why.inputs.length, 5);
    ok(why.inputs.some((i) => i.label === 'Your own kind'), 'alignment is not in the record');
    ok(why.summary.length > 8);
    // Two ideologies looking at the same Area do not see the same place.
    const other = Migration.explain(f, 'purple', T());
    ok(Math.abs(other.value - why.value) > 1e-9,
      'a Socialist and a Republican rate the same ground identically');
  });
});

describe('Migration — in the turn', () => {
  it('the world turn moves people, and the world still adds up', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    const before = worldPop();
    World.advanceTurn(T(), rng);
    const flows = Migration.lastFlows();
    ok(flows.moved > 0, 'a whole world turn moved nobody');
    equal(flows.turn, World.getTurn() - 1, 'the flow record is stamped with the wrong turn');
    // Population grows as well as moves, so this is a floor and a ceiling
    // rather than an equality: nobody vanished and nobody was duplicated.
    const after = worldPop();
    ok(after > before, 'the world stopped growing');
    ok(after < before * 1.05, `the world gained ${Math.round(after - before)} people in one turn`);
  });

  it('and forty turns of it leave every Area with a sane population', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    for (let i = 0; i < 40; i++) World.advanceTurn(T(), rng);
    let empty = 0;
    for (const f of Object.keys(Game.county)) {
      const p = Game.countyPop(f);
      ok(Number.isFinite(p) && p >= 0, `${f} holds ${p} people`);
      if (p < 1) empty++;
    }
    ok(empty === 0, `${empty} Areas were emptied completely`);
  });
});

describe('The clamp conserves (M9.8)', () => {
  /*
   * The old apply step ended `Math.max(0, was + d)`. That is a one-sided guard
   * and it does not lose people — it CREATES them: the destinations have
   * already been credited the full share by the time the source is clamped to
   * zero, so the world quietly gains a few at a time, in the one phase whose
   * headline invariant is that it conserves. `leaving` is now capped at what is
   * actually in the destination buffer, which makes the clamp unreachable, and
   * `clamped` reports the shortfall if it ever is reached rather than letting
   * it be discovered as eleven million extra people in turn forty.
   */
  it('never has to clamp, and says so', async () => {
    const { rng } = await bootWorld({ seed: SEED });
    let worst = 0;
    for (let i = 0; i < 20; i++) {
      World.advanceTurn(T(), rng);
      const rep = Migration.lastFlows();
      if (rep && Number.isFinite(rep.clamped)) worst = Math.max(worst, rep.clamped);
    }
    equal(worst, 0, `the migration clamp created ${worst} people`);
  });
});
