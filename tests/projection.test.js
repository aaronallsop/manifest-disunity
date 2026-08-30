/*
 * M7.11 — how far a nation can actually reach.
 *
 * ANTI-SNOWBALL BRAKE #3, and the only one of the three that is a LIMIT rather
 * than a price. Two things are pinned hardest here, and both are mistakes the
 * first cut made:
 *
 * REACH DECAYS FROM ONE CORE. Making every seat of government a nation holds a
 * source read well — capturing a capital should extend your reach — and made the
 * brake a no-op, because an empire built by conquest captures capitals BY
 * CONSTRUCTION: one holding 852 of the 1,676 Areas had twenty-four seats and
 * full reach over every frontier target it had.
 *
 * AND THE DISTANCES ARE Float64. Stored in a Float32Array, an accumulated cost
 * is rounded on the way in and compared against an unrounded copy on the way
 * out, so Dijkstra discards a node's own heap entry as stale. Oregon sat 3.05
 * from Sacramento by Bellman-Ford and read as unreachable, and 481 of 944
 * annexation targets were being refused for a rounding error. The
 * agrees-with-brute-force test below is what catches that class of thing.
 */
import { describe, it, ok, equal, close } from './harness.js';
import { bootWorld, fingerprint } from './world-fixture.js';

const SEED = 20260902;
const T = () => window.TUNE;

/** Hand every one of these states' Areas to `nid`, the way a conquest would. */
function conquer(nid, states) {
  const take = [];
  for (const st of states) {
    const n = Game.getNation(st);
    if (!n || st === nid) continue;
    for (const f of n.counties) take.push(f);
  }
  Game.batch(() => Game.moveCounties(take, nid, { silent: true, reason: 'annex' }));
  Projection.reset();
}

describe('Projection — the field', () => {
  it('agrees with a brute-force shortest path, to the last decimal', async () => {
    /*
     * The Float32 bug in one test: Bellman-Ford over the same rules, no heap and
     * no early exit, compared against the real thing everywhere it says an Area
     * is reachable.
     */
    await bootWorld({ seed: SEED });
    const g = Game.graph();
    const t = T();
    const own = Game.state().owner, mine = Game.nationIndexOf('06');
    const step = new Float64Array(g.n);
    for (let i = 0; i < g.n; i++) {
      const a = Game.areaTransport(g.idAt(i));
      step[i] = a.hub ? t.get('proj.hubCost') : a.rail ? t.get('proj.railCost')
        : a.highway ? t.get('proj.highwayCost') : t.get('proj.overlandCost');
    }
    const foreign = t.get('proj.foreignCost');
    const dist = new Float64Array(g.n).fill(Infinity);
    for (const f of Projection.sources('06')) dist[Game.nodeOf(f)] = 0;
    for (let pass = 0; pass < 60; pass++) {
      let moved = false;
      for (let i = 0; i < g.n; i++) {
        if (dist[i] === Infinity) continue;
        for (const j of g.neighbors(i)) {
          const c = dist[i] + step[j] * (own[j] === mine ? 1 : foreign);
          if (c < dist[j] - 1e-9) { dist[j] = c; moved = true; }
        }
      }
      if (!moved) break;
    }
    const decay = t.get('proj.decay');
    const home = t.get('proj.homeFloor');
    const field = Projection.field('06', t);
    let checked = 0;
    for (let i = 0; i < g.n; i++) {
      if (field[i] <= 0) continue;
      const want = own[i] === mine
        ? Math.max(Math.pow(decay, dist[i]), home) : Math.pow(decay, dist[i]);
      close(field[i], want, 1e-3, `Area ${g.idAt(i)} reads ${field[i]}, shortest path says ${want}`);
      checked++;
    }
    ok(checked > 200, `only ${checked} Areas had any reach at all`);
  });

  it('a nation projects from one place: where its government sits', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid] of Game.nations) {
      const src = Projection.sources(nid);
      equal(src.length, 1, `${nid} projects from ${src.length} places`);
      ok(Game.getNation(nid).counties.has(src[0]), `${nid} governs from ground it does not hold`);
    }
  });

  it('...and capturing somebody else’s capital does not move it', async () => {
    /*
     * The no-op the first cut shipped. An empire built by conquest captures
     * capitals by construction, so a rule that made each one a source removed
     * the limit entirely at exactly the size it was meant to bind.
     */
    await bootWorld({ seed: SEED });
    const before = Projection.sources('06')[0];
    conquer('06', ['32', '41', '04']);
    equal(Projection.sources('06')[0], before, 'the government moved itself to a captured capital');
  });

  it('a government that loses its capital rules from its largest city', async () => {
    await bootWorld({ seed: SEED });
    const seat = Projection.sources('06')[0];
    Game.batch(() => Game.moveCounties([seat], '32', { silent: true, reason: 'annex' }));
    Projection.reset();
    const now = Projection.sources('06');
    equal(now.length, 1);
    ok(now[0] !== seat, 'a nation is still governing from a capital it does not hold');
    equal(now[0], Game.largestCounty(Game.getNation('06').counties));
  });

  it('holding is not projecting: a nation always reaches its own soil', async () => {
    await bootWorld({ seed: SEED });
    for (const [nid, n] of Game.nations) {
      for (const f of n.counties) {
        ok(Projection.inRange(nid, f, T()), `${nid} cannot reach its own Area ${f}`);
      }
    }
  });

  it('and the floor does not leak into the search', async () => {
    /*
     * Applied AFTER the Dijkstra, or a far border would project from its own
     * floor and the brake would walk itself across the map one Area at a time.
     */
    await bootWorld({ seed: SEED });
    conquer('06', ['32', '41', '04', '16', '49', '35', '30', '56', '08', '48']);
    const field = Projection.field('06', T());
    const g = Game.graph();
    const own = Game.state().owner, mine = Game.nationIndexOf('06');
    let outside = 0, floored = 0;
    for (let i = 0; i < g.n; i++) {
      if (own[i] === mine) { if (field[i] <= T().get('proj.homeFloor') + 1e-6) floored++; continue; }
      if (field[i] > 0 && field[i] < T().get('proj.homeFloor')) outside++;
    }
    ok(floored > 0, 'nothing was floored, so this proves nothing');
    ok(outside > 0, 'every foreign Area reads at least the home floor — it leaked');
  });
});

describe('Projection — the network', () => {
  it('rail is cheaper to move along than open country', async () => {
    await bootWorld({ seed: SEED });
    const t = T();
    ok(t.get('proj.hubCost') < t.get('proj.railCost'));
    ok(t.get('proj.railCost') < t.get('proj.highwayCost'));
    ok(t.get('proj.highwayCost') < t.get('proj.overlandCost'));
    // ...and the data behind it is actually there.
    let rail = 0, hub = 0, road = 0;
    for (const f of Object.keys(Game.county)) {
      const a = Game.areaTransport(f);
      if (a.rail) rail++;
      if (a.hub) hub++;
      if (a.highway) road++;
    }
    ok(hub > 20 && hub < 400, `${hub} Areas carry a rail hub`);
    ok(rail > hub && road > 100, `${rail} rail, ${road} interstate`);
  });

  it('and the same distance reaches further along a corridor', async () => {
    await bootWorld({ seed: SEED });
    const slow = TuneMeta.createTune();
    slow.set('proj.railCost', slow.get('proj.overlandCost'));
    slow.set('proj.hubCost', slow.get('proj.overlandCost'));
    slow.set('proj.highwayCost', slow.get('proj.overlandCost'));
    Projection.reset();
    const withNet = Projection.field('48', T()).reduce((s, v) => s + (v > 0 ? 1 : 0), 0);
    Projection.reset();
    const flat = Projection.field('48', slow).reduce((s, v) => s + (v > 0 ? 1 : 0), 0);
    Projection.reset();
    ok(withNet > flat, `the network bought nothing: ${withNet} Areas against ${flat}`);
  });

  it('ground you do not hold is dearer to cross', async () => {
    await bootWorld({ seed: SEED });
    const easy = TuneMeta.createTune();
    easy.set('proj.foreignCost', 1);
    Projection.reset();
    const strict = Projection.field('06', T());
    Projection.reset();
    const open = Projection.field('06', easy);
    let bigger = 0;
    for (let i = 0; i < strict.length; i++) if (open[i] > strict[i] + 1e-6) bigger++;
    Projection.reset();
    ok(bigger > 50, `foreign ground cost nothing extra: ${bigger} Areas differed`);
  });
});

describe('Projection — the brake', () => {
  it('leaves the opening board alone: every nation can take the ground next to it', async () => {
    await bootWorld({ seed: SEED });
    let total = 0, blocked = 0;
    for (const [nid] of Game.nations) {
      for (const f of Game.annexTargets(nid)) {
        total++;
        if (!Projection.inRange(nid, f, T())) blocked++;
      }
    }
    ok(total > 500, `${total} annexation targets on the opening board`);
    equal(blocked, 0, `${blocked} of ${total} opening targets were already out of reach`);
  });

  it('and stops an empire that has outgrown its capital', async () => {
    await bootWorld({ seed: SEED });
    conquer('06', ['32', '41', '53', '04', '16', '49', '35', '30', '56', '08', '48',
                   '38', '46', '31', '20', '40', '05', '22', '27', '55', '17', '19', '29']);
    const tg = [...Game.annexTargets('06')];
    const out = tg.filter((f) => !Projection.inRange('06', f, T()));
    ok(Game.getNation('06').counties.size > 500, 'the empire is not big enough to test this');
    ok(out.length > 0,
      `an empire of ${Game.getNation('06').counties.size} Areas could still reach all ${tg.length} of its targets`);
  });

  it('the price rises before the refusal does', async () => {
    await bootWorld({ seed: SEED });
    const near = [...Game.annexTargets('06')]
      .sort((a, b) => Projection.at('06', b, T()) - Projection.at('06', a, T()));
    const closest = near[0], furthest = near[near.length - 1];
    const cheap = Projection.costMultiplier('06', [closest], T());
    const dear = Projection.costMultiplier('06', [furthest], T());
    ok(cheap >= 1 && dear >= cheap, `${cheap} then ${dear}`);
    ok(dear > cheap, 'distance is free right up to the moment it is impossible');
    // ...and the same for how the fight goes.
    ok(Projection.warMultiplier('06', [furthest], T())
       > Projection.warMultiplier('06', [closest], T()));
  });

  it('a move beyond reach is refused, and says why', async () => {
    await bootWorld({ seed: SEED });
    conquer('06', ['32', '41', '53', '04', '16', '49', '35', '30', '56', '08', '48',
                   '38', '46', '31', '20', '40', '05', '22', '27', '55', '17', '19', '29']);
    const far = [...Game.annexTargets('06')].find((f) => !Projection.inRange('06', f, T()));
    if (!far) return;
    const plan = Moves.plan({ type: 'annex', nid: '06', areas: [far] }, T());
    ok(!plan.ok, 'an out-of-reach annexation was allowed');
    ok(/reach/i.test(plan.reason), plan.reason);
    ok(plan.projection && plan.projection.seats.length, 'the refusal does not name where you govern from');
  });

  it('and it is not on the AI’s candidate list either', async () => {
    await bootWorld({ seed: SEED });
    conquer('06', ['32', '41', '53', '04', '16', '49', '35', '30', '56', '08', '48',
                   '38', '46', '31', '20', '40', '05', '22', '27', '55', '17', '19', '29']);
    for (const m of Moves.legal('06', {}, T())) {
      if (m.type !== 'annex') continue;
      for (const f of m.areas) ok(Projection.inRange('06', f, T()), `${f} is beyond reach and was offered`);
    }
  });

  it('an annexation in reach still costs more the further out it is', async () => {
    await bootWorld({ seed: SEED });
    const tg = [...Game.annexTargets('06')]
      .sort((a, b) => Projection.at('06', b, T()) - Projection.at('06', a, T()));
    const near = Moves.plan({ type: 'annex', nid: '06', areas: [tg[0]] }, T());
    const far = Moves.plan({ type: 'annex', nid: '06', areas: [tg[tg.length - 1]] }, T());
    ok(near.reachMult <= far.reachMult, `${near.reachMult} then ${far.reachMult}`);
    ok(far.reachWar >= near.reachWar);
  });
});

describe('Projection — the bookkeeping', () => {
  it('reading it changes nothing', async () => {
    await bootWorld({ seed: SEED });
    const before = fingerprint();
    for (const [nid] of Game.nations) {
      Projection.field(nid, T());
      Projection.explain(nid, [...Game.annexTargets(nid)][0] || [...Game.getNation(nid).counties][0], T());
    }
    const after = fingerprint();
    for (const k of Object.keys(before)) equal(after[k], before[k], `reading projection changed ${k}`);
  });

  it('the cache follows the ownership clock', async () => {
    await bootWorld({ seed: SEED });
    const f = [...Game.annexTargets('06')][0];
    const before = Projection.at('06', f, T());
    ok(before > 0);
    // Taking it makes it my own ground, which is cheaper to be in.
    Game.batch(() => Game.moveCounties([f], '06', { silent: true, reason: 'annex' }));
    const after = Projection.at('06', f, T());
    ok(after >= before, `reach fell after taking the ground: ${before} -> ${after}`);
    ok(after >= T().get('proj.homeFloor') - 1e-6, 'own ground is below the home floor');
  });

  it('and a nation with nothing left projects nothing', async () => {
    await bootWorld({ seed: SEED });
    const nid = '44'; // Rhode Island
    const areas = [...Game.getNation(nid).counties];
    Game.batch(() => Game.moveCounties(areas, '25', { silent: true, reason: 'annex' }));
    equal(Projection.sources(nid).length, 0, 'a nation that no longer exists still governs from somewhere');
  });
});
