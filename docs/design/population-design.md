# Population — how people are counted, how they change their minds, and how they move

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `identity-design.md` (a position is a location; the sum-to-population
invariant is stated there too) · `board-design.md` (the Area, and the adjacency graph migration walks)
· `power-design.md` (quality of life and civil liberties, which migration reads).

**Read by:** `movements-design.md` · `economy-design.md` · `governing-design.md` ·
`nation-design.md` · `events-design.md`.

**Status: BUILT, and unusually well measured.** Almost everything here exists and has numbers behind
it. **Three things in this document correct `DESIGN.md`**, which had gone stale on what is built — see
§9.

> **The one-sentence version: people are exact integers that must always sum, and every phase that
> moves them is written so that the order it runs in cannot change the answer.**

---

## 1. What a population IS

**Every Area holds one exact count per political position.** Today six; under D231, ten.

**The world total is an exact invariant: 340,110,988 people.** *Asserted by the suite — a save
round-trip must reproduce the state bit-for-bit.*

### 1.1 Two invariants the whole model rests on

| | |
|---|---|
| **Every Area's counts sum exactly to its population** | And every nation's totals reconcile with its Areas' |
| **A nation is DERIVED, never stored** | Population, output and politics are always the sum of the Areas it owns. **There is no second copy to disagree** |

**A movement is a slice of a position, not an eleventh bucket** — so **the whole population is always
exactly the sum of the positions**, and every phase that moves people can ignore movements entirely.
*Full treatment in `identity-design.md` §5.4.*

### 1.2 Exact sums need a tie-break, and the tie-break is a determinism rule

**Splitting a population by shares produces a rounding residual.** *Measured: the float split is
inexact for **986 of 3,143 counties** — 31.4%.*

**The residual goes to the LARGEST bloc, because that is where it is proportionally smallest** — *at
most half a person on a bloc of tens of thousands.*

> **⚠ And ties break on the SORTED NAME, so the result is reproducible.** *This is not tidiness. It is
> the same discipline as sorted neighbour rows in the adjacency graph: **a quantity that depends on
> which bloc the loop happened to reach first is a replay divergence waiting to happen.***

**There is a second path** for a residual larger than the largest bloc, reachable only from shares
that do not sum to the scale — *a guard against a caller's bug, not a normal case.*

### 1.3 How it is stored, and why the types are what they are

**Every per-Area field is one typed array in a `FIELDS` registry**, so adding a field is one entry and
the clone, the byte accounting and the save path all iterate the list — **nothing can add a field the
save silently drops.**

| Field | Type | Why |
|---|---|---|
| **people, per position** | **Float64** | *The world total is an exact integer invariant and 24 bits of mantissa is not enough* |
| **output** | **Float64** | *~1.5e11 per Area quantises to ~16k under Float32* |
| **the founding character (anchor)** | Float64, **not saved** | Derived from the bake at load |
| **quality of life, civil liberties** | Float32, per Area | **⚠ These are per-AREA and `DESIGN.md` §12 still says they are not. §9** |
| **owner** | Int16, **not saved** | The single source of truth for ownership; the document states it once as each nation's Area list |

---

## 2. Where population sits in the turn, and why

**Seven phases run over the columnar snapshot buffer. The order is load-bearing and the reasons are
requirements, not commentary.**

| | Phase | The stated reason it sits here |
|---|---|---|
| 1 | Recompute mixes | Cached from the start-of-turn snapshot |
| 2 | **Political drift** | — |
| 3 | Sentiment and movement growth | Each movement closes a fraction of the gap to its own ceiling |
| 4 | **Migration** | **After drift, because somebody migrates as whoever they have just become; before growth, so the babies are born where their parents ended up** |
| 5 | **Population growth** | Everybody, movements included |
| 6 | Economic growth | **After population growth: it reads the REALISED change** |
| 7 | Cleanup | Movements below a floor removed, survivors clamped back inside their position. **That clamp is the reconciliation the whole model rests on** |

### 2.1 The phase contract

- **No phase reads back a value it wrote.**
- **Every cross-Area aggregate is computed from the snapshot**, never the working buffer.
- **Per-Area values DO compose down the pipeline** — a later phase sees an earlier one's result. *This
  is deliberate and is noted at each site that relies on it.*
- **Ownership is snapshotted for the whole turn.**

### 2.2 ⚠ Two phases read Areas other than the one they write

**Political drift reads its neighbours' mixes. Migration WRITES to its neighbours, which is worse.**

> **Every flow on the board is computed before any is applied.** *Applying as it goes would let the
> first Area's arrivals decide the second Area's departures — and the node numbering would decide who
> moved.*

---

## 3. Political drift

**Each Area eases toward a blended target over all positions, then takes a small bounded jitter, then
renormalises. It moves people BETWEEN positions; the Area's total is unchanged.**

```
target = 0.35 × its owner nation's mix
       + 0.40 × its own founding character   (the structural anchor)
       + 0.25 × the population-weighted mean of its neighbours
```

**Then:** `v += step × (target − v)`, with `step` = `world.driftStep` = **0.02**.

### 3.1 ⚠ The 0.25 is DERIVED and has no tunable key

**`world.driftOwnerWeight` = 0.35 and `world.driftAnchorWeight` = 0.40 are named tunables. The
neighbourhood weight is `max(0, 1 − owner − anchor)`.**

> **⚠ This is the one place in the model where a constant of the drift formula is not a named
> tunable**, and the project's own rule says every model constant is one. **It is defensible — the
> three must sum to 1 and the suite asserts it — but a reader will search for
> `world.driftNeighbourWeight` and not find it.** *Gap 1.*

### 3.2 Three details the formula does not show

| | |
|---|---|
| **The neighbour mean is read from the SNAPSHOT** | *So the gradient is computed against start-of-turn values and phase order cannot skew it* |
| **No neighbours falls back to the OWNER** | *Rather than silently biasing the target toward zero* |
| **Noise is rescaled** | The tunable is a share; the drift works in percentage points. `world.driftNoise` = **0.004** |

### 3.3 Why the anchor and the neighbourhood term exist — the collapse they prevent

**With the owner's mix as the ONLY target, which is what it was**, drift and population growth both
pulled toward one attractor with nothing pushing back:

| | Within-nation spread of the leading position's share |
|---|---|
| **The collapse** | **12.5 points at t0 → 2.5 by t50 → effectively zero by t200**, 23-turn half-life, **every nation politically uniform** |
| **After the fix** | **13.3 (t0) → 7.5 (t50) → 5.5 (t100) → 4.8 (t200) → 4.8 (t300)** — **it STABILISES rather than decaying** |

> **Since Area-level politics is the foundation the sentiment model is built on, that collapse would
> leave nothing to differentiate.** *The suite pins it: median within-nation spread ≥ 4 at t200, the
> t300 figure must be > 0.9 × the t200 figure, and monolithic nations must stay under 75% of the
> board.*

**The anchor is the Area's own 2024 result**, computed **after** the merge so a merged Area is anchored
to the character of the whole Area.

---

## 4. Growth

### 4.1 People

**New residents arrive 35% in the owner nation's mix and 65% in the Area's own**
(`world.growthMixNationWeight` = 0.35, `world.popGrowth` = 0.01 per turn).

> **A full national mix would be a second attractor at exactly the drift fixed point.** *The suite
> asserts this weight is < 1 for that reason.*

**Emergent movements grow with everybody else.** *Omitting them — which is what happened — meant
movement members literally did not reproduce, and every movement was diluted toward a common
equilibrium instead of its own ceiling.*

**The per-Area counts are read post-drift and post-movement so phases compose; the nation mix still
comes from the snapshot.**

**⚠ `world.popGrowth` was recorded as provisional** — *"the rate is a named tunable; M5.3 measures it
and M5 tunes it"* — **and no record was found that it was ever measured.** *At 1% a turn it compounds
2.2× over an eighty-turn game; over 200 turns nobody has said.* **Gap 2.**

### 4.2 Output

```
gdp' = gdp × (1 + base × sectorMultiplier(Area) + coupling × realisedPopulationRate)
```

`world.gdpGrowth` = **0.008**, `world.gdpGrowthPopCoupling` = **0.6**, and the sector multipliers are
an array read against the Area's six-sector profile:

| Ag | Extraction | Manufacturing | Trade | Finance | IT |
|---:|---:|---:|---:|---:|---:|
| 0.45 | 0.65 | 0.90 | 1.05 | 1.25 | **1.70** |

> **The sector differential is what makes relative market prices move at all.** *With one uniform rate
> the global sector mix is frozen and the price index is six constants.*

**What this replaced: there was no economic growth at all.** Output was copied through unmodified.
**Population compounded and output did not, so output per head decayed monotonically, treasuries became
a fixed linear ramp, and every market price inflated to the ceiling.**

---

## 5. Migration

**Until it existed, a nation could grind its people into the ground and the only consequence was a
worse number.** *Population was fixed to the ground it started on and the political map could change
only by a border moving.*

### 5.1 A gradient, not a destination

> **Nobody computes the best Area on the continent and walks there.** People look at the Areas next
> door and move toward the better ones, in proportion to how much better.

**Flow along the adjacency graph is what makes the result physical** — *a walled-off paradise does not
drain the far coast, and distance is real without a single distance calculation.*

### 5.2 The five terms — four pull and one pushes

| Term | Weight | What it does |
|---|---:|---|
| **Quality of life** | 0.40 | **So the stock acquires a demographic price** |
| **Alignment** | **0.35** | **THE TERM THAT CHANGES THE GAME.** How close this Area's politics are to the mover's own |
| **Output per head, HERE** | 0.25 | **The brake.** It falls as people arrive |
| **Civil liberties** | 0.20 | **Suppression costs you the people who can leave** |
| **Crowding** | −0.15 | A second and smaller brake |

**Alignment, in full, because it is the one that changes the game:** *people move toward people who
think as they do, so a divided nation sorts itself into homogeneous halves over a few decades — and
those halves are exactly the ground a movement organises on.* **Measured in isolation over twelve
turns: the average Area's dominant position goes from 63.3% to 66.5% — a map sorting itself while
political drift pulls the other way.**

**And it is what makes settlement an answer to secession:** *pour your own people into a separatist
region and the movement's SHARE falls even though its membership has not.*

**Output per head is measured HERE rather than nationally, and it is the brake on the whole system:**
*output does not move with people, so every arrival lowers the number that attracted them.* **Without
it the continent piles into one Area and stays there.**

### 5.3 ⚠ The weights do not sum to 1, and the result is CLAMPED rather than normalised

**0.40 + 0.35 + 0.25 + 0.20 − 0.15 = 1.05 of pull against 0.15 of push, and the attractiveness is
clamped to 0–1.**

> **⚠ This is a real modelling choice and it is not written down anywhere as one.** Clamping means
> **an Area that is good on several terms at once saturates**, so the top of the range compresses:
> two very attractive Areas can be indistinguishable to a mover. *Whether that is intended is
> unstated.* **Gap 3.**

### 5.4 What actually moves

**A cap, not a speed.** `migration.rate` = **0.030** — *nobody empties an Area in a quarter however bad
it is, and the number that actually moves is this scaled by how much better it is next door.* **At 3% a
strong gradient shifts about an eighth of a population a decade** — fast enough to see on the map, slow
enough that a bad decade is recoverable.

| | | |
|---|---:|---|
| `migration.threshold` | **0.015** | How much better next door has to be before anybody goes |
| `migration.gradientFull` | **0.30** | The gradient that reads as an outright exodus. *Basis: the opening board's spread between best and worst reachable Area is about 0.2* |
| `migration.minPop` | **200** | The smallest group that bothers to move |
| `migration.borderFriction` | **0.40** | **THE WHOLE OF "NETWORK DISTANCE" BEYOND ADJACENCY** |

**⚠ Friction is applied to the differential BEFORE the threshold test**, so a border does not merely
tax a flow — **it can stop one that would otherwise have happened.** *Not stated in `DESIGN.md`.*

**A border is friction rather than a wall**, so **internal sorting is the common, invisible case and
emigration is the one that gets a line in the panel.** *And it is where expulsion would live if a later
milestone wants it: this system with the source FORCED rather than chosen, not a special-case button
with its own arithmetic.*

### 5.5 ⚠ The conservation fix, recorded because the failure mode is instructive

**Departures are capped at what is actually in the working buffer, not at what the snapshot said.**

> **The clamp CREATED people.** The source was read from the snapshot and the delta applied to the
> working buffer, which an earlier phase may have left lower. When that happened, the apply step
> clamped the source to zero **after the destinations had already been credited the full share** —
> *which does not lose people, it creates them, silently, a few at a time, **in the one phase whose
> headline invariant is that it conserves.***

**Capping at the source rather than clamping at the destination is what makes it conserve exactly: the
same number that leaves is the number that arrives, because there is only ever one of it.** *A counter
records any clamp and the suite asserts it stays at zero.*

### 5.6 Movements under migration, and the asymmetry is the point

**Movements shrink with the people who leave and are DILUTED by those who arrive.**

**Membership is people**, so when a tenth of an Area's reds leave, a tenth of the red movement goes
with them — **but arrivals deliberately do not join**, *because somebody who moved in last quarter is
not a member of the local separatist organisation.*

> **That asymmetry is what makes settlement an answer to secession: the movement's SHARE falls because
> the denominator grew, which is what happens to a real one.**

---

## 6. What the player sees

- **The Population map mode**, and the political map that sorts itself over decades.
- **Emigration gets a line in the panel; internal churn does not** — cross-border flows are tallied by
  pair, internal movement per nation and deliberately not itemised.
- **Flows under one person are dropped.**
- **Migration returns a Why record with exactly five inputs**, so *"why is my population leaving"* is
  answerable in the same shape as every power stock. *The suite asserts there are five.*

---

## 7. What this hands the Technical Designer

| | |
|---|---|
| **Exactness is the headline invariant** | Counts sum to population, the world total is one exact integer, and **the tie-break is by sorted name** |
| **Compute every flow before applying any** | §2.2. **This is the phase that writes to its neighbours** |
| **Cap at the source, never clamp at the destination** | §5.5, and the reason is that clamping creates people |
| **The drift weights must sum to 1 and one of them is derived** | §3.1 |
| **Float64 for people and money** | Not a preference. The world total is an exact integer invariant |
| **⚠ Alignment reads `affinity`** | So **`MAX_DISTANCE` blocks migration too** — `identity-design.md` open question 1. *Every migration weight was tuned against a two-axis denominator* |

---

## 8. Open questions

| | | Owner |
|---|---|---|
| **1** | **Was `world.popGrowth` ever measured?** It was recorded as provisional — *"M5.3 measures it and M5 tunes it"* — and **no record of that measurement was found.** At 1% a turn it compounds 2.2× over eighty turns; **nobody has said what it does over two hundred** | **A measurement**, then the architect |
| **2** | **Should attractiveness be normalised rather than clamped?** §5.3. Clamping compresses the top of the range, so two very attractive Areas can read the same to a mover | **The architect** |
| **3** | **Does migration ever need to cross a border it has no reason to cross?** Stated as a known limit: *"a diaspora cannot form on the far side of the continent and a refugee flow out of a collapsing state goes next door rather than to the best place available. That is the right first model and the wrong final one"* | **Aaron**, after the alpha |
| **4** | **Do the migration weights survive the three-axis board?** Alignment reads affinity, and every weight here was tuned against a denominator that D231 changes | **The architect** |

---

## 9. Gaps

| | |
|---|---|
| **1** | **The drift formula's neighbourhood weight is not a named tunable.** §3.1. Derived as `1 − owner − anchor`; a reader will search for a key that does not exist |
| **2** | **`world.popGrowth` carries no measurement.** Also open question 1 |
| **3** | **Clamping versus normalising the migration pull is undocumented as a choice.** §5.3 |
| **4** | **⚠ `DESIGN.md` §7.6 says migration reads quality of life and liberties as *"the nation's"*. It blends 60% per-AREA** (`migration.wLocal` = 0.6). *The document predates that change* |
| **5** | **⚠ `DESIGN.md` §12 lists per-Area stocks as NOT BUILT and calls it the number-one structural gap. They ARE built** — the columns exist and a ground phase computes them. *A "deliberately not built yet" entry for something that is built is the worst kind of stale, because it is read as a decision* |
| **6** | **⚠ `DESIGN.md`'s phase list omits the ground phase entirely.** It runs after the writeback and before the power stocks, *"so the national stocks it blends from are last turn's"* |
| **7** | **⚠ `DESIGN.md` §4 points migration at §7.7. Migration is §7.6; §7.7 is instrumentation** |
| **8** | **`world.partyFloor`'s doc says a cleaned-up movement's share is *"redistributed"*. The code deletes the entry and leaves the population untouched** — *which is correct, because a movement is a slice rather than a bucket, so there is nothing to redistribute.* **The word is vestigial and misleading** |
| **9** | **Nothing specifies what migration does when a position has no people in it.** With ten positions rather than six, **empty positions become common** — §5.1 of `identity-design.md` shows three positions carry no movement at all |

> **⚠ Gaps 4 through 7 are corrections to `DESIGN.md` and are being made under D232's permission**, as
> marked corrections of fact with their date. **Gap 5 is the serious one**: it is not a stale figure,
> it is a *built system listed as unbuilt.*

---

## 10. The scenarios this document must be able to tell

**Four traced. Three narrate, and the fourth is the one that matters most because it is how the model
failed silently once already.**

### 10.1 A government suppresses its people and loses them

**Step 1.** A nation raises a garrison and restricts its people. **Civil liberties fall.**

**Step 2.** Liberties are a migration term at weight **0.20**. The Areas next door become
comparatively more attractive.

**Step 3.** People leave — capped at 3% of an Area in a quarter, scaled by how much better next door
is, and only if the gap clears 0.015.

**Step 4 — and crossing the border costs 0.40 of the gradient**, applied **before** the threshold test.
So **most of the movement is internal**: people sort within the nation before they emigrate.

**Step 5.** The movements in the Areas they left **shrink with them**, because membership is people.
**The movements in the Areas they arrive in do not grow**, because arrivals do not join.

> **✅ Narrates, and it delivers the design's stated aim exactly: quality of life and liberties acquire
> a demographic price, so suppression costs you the people who can leave.** *And the border friction
> makes the first-order effect internal sorting rather than an exodus, which is both truer and more
> interesting.*

### 10.2 ⚠ A player settles their own people into a separatist region

**Step 1.** A region is organising under a separatist movement. Its share is climbing toward its
ceiling.

**Step 2.** The player's own people, elsewhere, are politically aligned with the government and not
with the movement.

**Step 3.** Alignment pulls them toward Areas whose politics resemble their own — **and the separatist
region does not.** *So the model does not do this by itself.*

**Step 4 — but if they arrive**, for any reason: **they are counted in the Area's population and they
do not join the movement.**

**Step 5.** The movement's membership is unchanged and its **denominator has grown. Its share falls.**

**Step 6.** Share is what the secession thresholds read.

> **✅ Narrates — and this is the mechanism the design explicitly claims: *"settlement is an answer to
> secession."*** **⚠ But the trace exposes that it is PASSIVE.** Nothing in the game lets a player
> *direct* settlement; migration is a gradient nobody steers. **So the answer exists in the model and
> is not available as a move.** *Whether it should be is a question for `governing-design.md` — the
> release valves are what a government can actually do — and it is filed there rather than invented
> here.*

### 10.3 Two Areas swap people on the same turn

**Step 1.** Area A is better for reds; Area B is better for blues. They are neighbours.

**Step 2.** Reds in B want to move to A. Blues in A want to move to B.

**Step 3 — every flow on the board is computed before any is applied**, into a delta buffer.

**Step 4.** So B's departures are computed against **B as it was at the start of the turn**, not
against B after A's blues arrived.

**Step 5 — and the suite pins it:** two runs of the same turn must be **bit-identical Area by Area**.

> **✅ Narrates, and it is the clearest example in the project of why the snapshot discipline exists.**
> *Without it, whichever Area the loop reached first would decide who moved — and the answer would
> depend on the node numbering, which is an implementation detail leaking into the model.*

### 10.4 ⚠ An earlier phase leaves an Area with fewer people than migration expects

**This is the failure that actually happened, and it is traced because it is the shape of the next
one.**

**Step 1.** Migration reads the departure population from the **snapshot**.

**Step 2.** It writes the delta into the **working buffer** — which drift, sentiment and any other
earlier phase may already have altered.

**Step 3.** The destinations are credited their full share.

**Step 4.** The source is then clamped so it cannot go below zero.

**Step 5 — and the arithmetic no longer balances.** *The destinations received more than the source
gave up.*

> **❌ THIS DOES NOT LOSE PEOPLE — IT CREATES THEM. Silently, a few at a time, in the one phase whose
> headline invariant is that it conserves.**

**The fix is structural rather than defensive: cap at the SOURCE instead of clamping at the
DESTINATION**, so *the same number that leaves is the number that arrives, because there is only ever
one of it.* **A counter records any clamp and the suite asserts it stays at zero.**

**The general lesson, which belongs to the Technical Designer rather than to history:** *when a phase
writes somewhere other than where it read, a defensive clamp at the write end is not a safety net —
it is where the invariant breaks.*

---

*Sources, verified against the files on 15 September 2026: `DESIGN.md` §3, §4, §7.6, §12;
`js/state.js` (the FIELDS registry), `js/world.js` (drift, growth, cleanup and the phase order),
`js/migration.js` (the five terms, the delta buffer, the source cap), `js/counts.js` (the exact-sum
split and its tie-break); `js/tunables.js` (`world.*`, `migration.*`); `content/tunables.json`
(the only override is `sent.maxRise`); `tests/drift.test.js`, `tests/migration.test.js`,
`tests/invariants.test.js` (the pinned bounds); `DECISIONS.md` D19, D20, D22, D23, D25, D45, D126,
D148. **The spread and alignment figures are quoted as measured in their sources; no date is attached
to them there, and none is invented here.***
