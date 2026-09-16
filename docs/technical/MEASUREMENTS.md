# The three measurements that were waiting

**Stage 3, step 1 (T0.4). Taken 16 September 2026.**

> **All three were named by stage 2 as waiting for this reader.** *Two are answered. **The third
> cannot be answered, because the thing it measures cannot currently be produced** — and finding that
> out is the most consequential result in this document.*

| | | |
|---|---|---|
| **1. `MAX_DISTANCE`** | ✅ **Answered, with a recommendation** | *And it turned up a second problem the question did not contain* |
| **2. The victory targets at 200 turns** | ⚠ **Partly — and the targets are already stale at EIGHTY** | *The 200-turn figure is unobtainable; see 3* |
| **3. The cost of a turn** | ⛔ **NOT ANSWERED, and the reason is a defect** | **The game cannot be simulated past roughly turn 80–95.** `docs/deferred.md` 46 |

---

## 1. `MAX_DISTANCE` — the denominator every tuned threshold is measured against

### What was asked

`GDD.md` gap 11: the affinity function is `affinity(a,b) = 1 − distance(a,b) / MAX_DISTANCE`, and on
the three-axis board **nobody has authored the denominator.** On two axes it was **1.7804** — the
*actual widest authored pair*, and explicitly **not** the box diagonal, because the diagonal was
unoccupied and normalising on it would squash every real affinity into the top third of the range.

### The answer: 2√3 ≈ 3.4641, and the old rule chooses it

**Computed from the ten authored positions rather than asserted.** *Coordinates taken from `GDD.md`
§15.1 — economy, morals and power each −1…+1; eight corners of the cube, plus two centrists at
(0, ∓1, 0).*

**Four pairs sit at the maximum and they are genuine opposites:** Fascism ↔ Liberal Anarchy,
Distributism ↔ Digital Technocracy, Democratic Socialism ↔ Christian Nationalism, Communism ↔
Anarcho-Capitalism.

> **So on three axes the widest authored pair IS the box diagonal**, and the two-axis rule — *use the
> widest authored pair* — selects **2√3** without being overruled. **The rules agree, and that is
> worth saying out loud**, because it means adopting 3.4641 is following the existing rule rather
> than replacing it.

**Three claims in `GDD.md` §15.1 were checked against the arithmetic while doing this. Two hold, one
does not:**

| | |
|---|---|
| ✅ | *"A centrist sits √2 from each of the four corners on its own moral side"* — **true for all eight** |
| ✅ | *"Republicans and Democrats are exactly 2 apart, the same distance as fascism and communism"* — **both exactly 2.0000** |
| ⚠ | *"any two corners are 2 apart"* — **false.** Corner pairs range **2.0000 to 3.4641**: 2 when they differ on one axis, 2√2 ≈ 2.8284 on two, 2√3 on three. *The conclusion it supports still holds — a centrist at √2 is nearer than the closest corner pair at 2 — so the **claim** is wrong and the **point** survives* |

### ⚠ And the measurement found something the question did not contain

**Normalising on 3.4641 does not fix the range problem. It moves it, and it splits the one function
into two that behave nothing alike.**

| Population | Range of affinity | Shape |
|---|---|---|
| **Position against position** — drift, splinter direction, the price of changing your own politics | **0.000 – 0.592** | *Only **five distinct values** exist in the whole system: 0, 0.1835, 0.2929, 0.4226, 0.5918. **Nothing is ever more than 59% aligned with anything*** |
| **Nation against nation at turn 0** — coalitions, trade alignment, AI diplomacy | **0.423 – 1.000** | *Arithmetic, not simulation: the 2024 seed lands on the two centrists, so every nation's centroid lies on a segment of length 2 inside a cube of diagonal 3.4641. **The floor is 1 − 2/3.4641 = 0.4226 and it cannot go lower at turn 0*** |

> **The two populations overlap in a band 0.10 wide — 0.491 to 0.592 on a simulated spread of 61
> nations.** *A single threshold tuned on one is meaningless on the other: **"aligned means affinity
> above 0.6" can never be true of two positions and is true of almost every pair of nations.***

**⚠ SO THE RECOMMENDATION IS NOT ONE NUMBER.** *Adopt 2√3 as the denominator — it follows the stated
rule and it is the only defensible single value.* **And then declare, per use, which population a
threshold is tuned against**, because the same 0–1 scale means two different things depending on
whether its inputs are positions or mixes of positions. *This is `identity-design.md`'s technical
document to settle and it should settle it before anything downstream is tuned.*

---

## 2. The victory targets — stale at 200 turns, and already stale at 80

### What was asked

`turn-design.md` §7.2: the game is now **200 turns** (D223) and **the targets were set for eighty.**

### What the targets say about themselves

**Three of them state their own calibration in their own doc lines, and all three quote an
eighty-turn world with nobody playing:**

| Tunable | Value | Its own stated baseline |
|---|---|---|
| `win.reuniteSeats` | **0.55** | *"over eighty turns with nobody playing, the best AI nation held **five seats (9.8%)**, so this is **five and a half times** what the map produces on its own"* |
| `win.reunitePop` | **0.30** | *"Three times the **9.2%** the largest nation reaches"* |
| `win.reuniteGdp` | **0.30** | *"Three times the **10.2%** the largest economy reaches on its own"* |

### ⚠ What a run measures today — and it is not what those lines say

**Seed `tdd-t0`, 200 requested, nobody playing, measured in the browser 16 September 2026.**

| Turn | Nations left | Best seat share | Best population share | Best GDP share |
|---:|---:|---:|---:|---:|
| **25** | 40 | **0.5098** *(26 of 51)* | 0.1338 | 0.1523 |
| **50** | 41 | 0.4706 *(24)* | 0.1472 | 0.1700 |
| **75** | 39 | 0.2745 *(14)* | 0.1539 | 0.1799 |
| **80** | 36 | **0.2941** *(15)* | **0.1634** | **0.1881** |

**Against the stated baselines, at the same eighty turns those baselines describe:**

| | Doc says | Measured | The multiple the doc claims | The multiple today |
|---|---:|---:|---:|---:|
| **Seats** | 9.8% | **29.4%** | 5.5× | **1.9×** |
| **Population** | 9.2% | **16.3%** | 3× | **1.8×** |
| **GDP** | 10.2% | **18.8%** | 3× | **1.6×** |

> **⚠ So the problem is not only that the game got longer. The baselines no longer describe the game
> at the length they were taken at.** *Between them and now the alpha track added deals with terms,
> corridors, tolls, rivers and an AI that uses all of it — a world that consolidates differently.*

**And the seat term does something a victory condition should not: it PEAKS EARLY AND FALLS.** *51% of
the 55% target at turn 25, then down to 27% by turn 75.* **That is the exact shape the code already
identified and fixed once** — `js/victory.js` records that counting Areas made the ideology condition
*"easiest at the start and got harder, which is exactly backwards for a victory."* **The seat term now
has that shape.** *Note it counts seats **owned or aligned**, so this may be alignment rather than
conquest — which would make it a question about `win.seatInfluence`, not about conquest speed.*

**⚠ ONE SEED.** *This project's own rule is that one run is not enough to attribute a fault to a
cause. **The figures above are reported as one seed's world, not as the game's behaviour.*** A proper
recalibration needs a spread of seeds at the real game length — **and that is exactly what cannot be
produced today.**

---

## 3. ⛔ The cost of a turn — NOT MEASURED, because a 200-turn game will not run

### What was asked

`turn-design.md` §9 hands forward: *an AI round was **735 plans and 153 ms** when sixty nations chose
**one** thing each; they now choose several, and **nobody has measured it.*** **That remains
unmeasured, and for a reason nobody anticipated.**

### What happened

**The simulator hangs before it reaches 200 turns. Reproducibly, on both seeds tried.**

| Run | Seed | Instrumented? | Reached | Then |
|---|---|---|---:|---|
| 1 | `tdd-t0` | yes, sampling at 5 turns | **turn 80** | hung |
| 2 | `tdd-t0` | yes, timing every turn | **turn 80** | hung |
| 3 | `tdd-t0` | **no callback at all** | **turn 80** *(inferred — no output)* | hung |
| 4 | `seed-B-19770` | yes, turn counter only | **turn 94** | hung |

**Ruled out, each by an actual check rather than by argument:**

- **Not my instrumentation** — run 3 passed no `onTurn` at all and hung the same way.
- **Not browser throttling** — the tab was fronted; turns 1–80 ran at **261–431 ms each** with no
  upward trend, and the world then stops dead.
- **Not slowness** — across a 20-second window and again a 40-second window, **the turn counter and
  the nation count did not change by one**. It is a hang, not a crawl.
- **Not a fixed 80-turn horizon** — the second seed reached 94. *There is no turn cap in the code;
  the loop is a plain `for (let t = 1; t <= turns; t++)`.*
- **Not the known non-re-entrancy** — the dashboard's own auto-run had finished before each run
  started, checked each time.

**Where it is.** *`onTurn` never fires for the turn after the last one recorded, so the loop is stuck
inside `AI.round` — the call that plays all sixty-one seats.* **The world-state dependence (80 on one
seed, 94 on another) says it is a condition some world reaches rather than a counter running out.**

### Why this matters more than the measurement it blocked

> **The game is designed to be 200 turns (D223) and cannot currently complete one.**

*Three things in stage 3 were going to be settled by running a 200-turn world: the turn cost, the
victory recalibration, and whether the economy's logistics spiral actually spirals. **None of them can
be settled until this is fixed.***

**Filed as `docs/deferred.md` 46.** *It is not fixed here: this is a measuring session, and the repair
is a programming session under a different permission.*

---

## 4. What this document did not do

| | |
|---|---|
| **1** | **No threshold was re-tuned.** *The plan forbids it — a number gets a named tunable, a range and an honest label, and the value is the alpha's job* |
| **2** | **`MAX_DISTANCE` is recommended, not set.** *No code was changed; `identity-design.md`'s technical document adopts it* |
| **3** | **The victory figures are one seed.** *Explicitly not a recalibration* |
| **4** | **The 200-turn world was never produced**, so nothing in this document describes the game at its actual length |
