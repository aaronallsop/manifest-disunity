# Power — the five stocks, the rate limit, and the Why record

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `identity-design.md` (cohesion and alignment) · `population-design.md` ·
`economy-design.md` (solvency, prosperity, food) · `force-design.md` (the garrison, the army in the
field) · `governing-design.md` (tenure, the form of government) · `diplomacy-design.md` (recognition,
treaties, clients) · `war-design.md` (wars, occupation, the coalition) · `nation-design.md` (the
honeymoon).

**Read by:** *every satellite.* **This is the aggregator, which is why it comes near the end — it can
only cite what it reads once those documents exist.**

> **The one-sentence version: five numbers, each one the sum of named terms, each one rate-limited so a
> nation cannot fall off a cliff — and every single one of them can explain itself.**

---

## 1. The convention this file exists for, and it matters more than any formula in it

> **EVERY FUNCTION RETURNS A WHY RECORD.** *"That convention is the point of this file — **more than any
> individual formula in it.**"*

```
{ value, target, raw, base, inputs[], summary }
```

**Each entry in `inputs` carries:** *its label, its raw figure, its normalised figure, its weight, its
**contribution**, **the tunable key that moves it**, a note, and whether it is signed.*

**Three things fall out of it and none of them costs extra:**

1. **The player's "why is my Authority falling?" panel IS the inputs array.** *Nothing has to be
   recomputed to explain a number.*
2. **The dashboard's show-your-work view is the same array, and the key on each input is the slider
   that moves it.**
3. **A test can assert a CONTRIBUTION rather than an outcome** — *"so a formula change that happens to
   preserve the total still fails the test that cared about the term."*

**And the summary is built from the SAME array the panel renders, not from a second pass:**

> **"A summary that can disagree with the numbers beside it is worse than no summary."**

**Contribution is kept UNCLAMPED even though the value is clamped**, *so **"your Authority is at the
floor and here is the 0.4 of pressure holding it there"** is still answerable.*

> **⚠ A Why record must not have side effects, and that was learned the hard way.** *One note seated a
> leader when the chair was empty — it read the modifier before that happened and wrote the note after,
> **so the term said "Governor Vance" while its own value said nobody was in charge.***

---

## 2. The five stocks

| | | What it is |
|---|---|---|
| **Authority** | base **0.30** | *"How firmly a state holds its own ground."* |
| **Influence** | base **0.25** | *"Soft power: how much the rest of the world listens to you."* |
| **Quality of Life** | base **0.20** | *"How well a nation feeds, treats and pays its people."* |
| **Civil Liberties** | base **0.22** | *"How freely a state lets its people disagree with it."* |
| **War weariness** | base **0** | *"the fifth stock, and **the only one that measures what a nation is doing to ITSELF**"* |

### 2.1 ⚠ The ORDER they are computed in is load-bearing

**Influence after Authority**, because it reads Authority as its own input. **Weariness LAST.** *And
quality of life reads the **previous** turn's weariness on purpose:* **"a stock that fed itself within
one turn would compound."**

---

## 3. What feeds each one

### 3.1 Authority — and the largest weight in the game is a negative

| Term | Weight | |
|---|---:|---|
| **Territory lost** | **−0.30** | **THE LARGEST SINGLE WEIGHT IN EITHER DIRECTION.** *"A state that cannot hold its territory **has failed at the one thing a state is for**"* |
| **Honeymoon** | **+0.22** | *"Large enough to carry a newborn nation — which has no age, no tenure and no reserves — **past the moment when every other term reads zero**"* |
| **Cohesion** | **+0.20** | **the largest positive**, *"because a state governing people who agree with each other is the easiest state to govern"* |
| Occupation | −0.18 | *a standing commitment of force that is not available for anything else* |
| Self-rule | −0.18 | *"Smaller than the occupation weight, **because this was a decision rather than a defeat**"* |
| Age | +0.18 | |
| Solvency | +0.16 | |
| Overreach | −0.16 | |
| Wars won | +0.14 | |
| Tenure | +0.12 | |
| **Leadership** *(signed)* | **+0.06** | **small on purpose** — see §5 |

**And one shape constant carries a measurement that explains why it exists:** *before it was tuned, **a
single six-Area war scored +0.047 on wars won and −0.060 on overreach, so winning a war LOWERED
Authority.***

### 3.2 Influence — soft power follows the money, and conquest is the largest cost

| Term | Weight | |
|---|---:|---|
| **Conquest** | **−0.34** | **the largest in either direction, and it SCALES WITH WHAT YOU ALREADY HAD** |
| **Recognition** *(signed, a DEFICIT)* | **0.35** | *"a fully recognised nation contributes **exactly nothing** and a wholly unrecognised one loses the full weight"* |
| **Economic weight** | **+0.30** | **the largest positive.** *"Soft power follows the money"* |
| **Coalition** | **−0.30** | **deliberately a feedback loop** — §4.2 |
| Alignment | +0.22 | *"Being ideologically close to California is worth more than being close to Wyoming, **which is what soft power means**"* |
| Blitz | −0.20 | *what taking ground FAST costs, on top of taking it at all* |
| Reach | +0.18 | |
| Treaties *(signed)* | +0.16 | *pacts held, minus breaches at **2.5×** — "a nation that breaks one pact has to keep three to get back to level"* |
| Occupation | −0.14 | *"a heavier drain on your own institutions than on your reputation"* |
| Clients | +0.12 | *"Standing **bought** rather than earned — which is why it is the smallest of the positive terms, and why it **evaporates the moment the payments stop**"* |

> **⚠ The recognition term was nearly written the wrong way round, and the reason it was not is the best
> methodological note in the file:** *written as a bonus rather than a deficit **"it would have raised
> every established nation's Influence by a constant and quietly re-tuned the coalition trigger — which
> is the mistake the leadership term already made once."***

### 3.3 Quality of Life — and food gets its own sentence

| Term | Weight | |
|---|---:|---|
| **Food security** | **+0.34** | **the largest, and the only one whose shortfall gets its own sentence in the summary.** *"**Nothing else about a nation matters much to someone who is not eating.**"* |
| **War weariness** | **−0.30** | *"The first place a tired country feels it: **the young are elsewhere, the budget is elsewhere, and the years are going somewhere other than into anybody's life.**"* |
| Healthcare | +0.24 | |
| Fiscal strain | −0.22 | *"services are what get cut"* |
| Prosperity | +0.20 | |
| Leadership *(signed)* | +0.05 | |

**Every calibration constant here carries a real measurement in its doc string** — *food per head
against a real spread of $3,392 to $26,212 with a median of $6,995; healthcare against $53,751 to
$262,439 with a median of $77,684.* **These are the best-grounded numbers in the project.**

### 3.4 Civil Liberties — and the hinge is not what you would guess

| Term | Weight | |
|---|---:|---|
| **Alignment at home** | **+0.34** | **THE HINGE.** *"A state governing people who broadly agree with it has no reason to restrict them; a state governing a population sitting at the far end of both axes is under constant pressure"* |
| **Garrison** | **−0.35** | **the largest negative, and the whole price of suppression** |
| Government | +0.26 | |
| Occupation | −0.24 | *"Occupied ground is governed under different rules, **and those rules leak home**"* |
| **A divided people** | **−0.20** | **⚠ NOT a duplicate of alignment, and the distinction is subtle and right** — *"A nation can be uniformly mildly-opposed (low alignment, high cohesion) or evenly split into two camps that agree with the government equally little (same alignment, low cohesion). **The second is far harder to govern liberally, and only cohesion tells them apart.**"* |
| Prosperity | +0.12 | |
| Leadership *(signed)* | +0.06 | *"the one where a leader is most visible from inside the country"* |

> **⚠ TWO BOOKKEEPING FAULTS HERE.** *The occupation term's doc still calls itself **"the largest
> negative weight"** — it is not; the garrison term at −0.35 is larger, and it was added later in a
> different part of the file.* **And the garrison term is filed in the wrong tuning group**, so it
> appears in the wrong dashboard section. *Gap 4.*

### 3.5 War weariness — the inverted stock

| Term | Weight | |
|---|---:|---|
| **Wars fought** | **0.40** | **SEPARATE wars, not Areas** — *"starting a fourth war is a different thing from widening the first"* |
| **Occupation** | **0.30** | *"The war that does not end"* |
| **In the field** | **0.30** | **an army in the field, not an army** |
| Ground taken by force | 0.20 | |
| Leadership *(signed)* | 0.05 | *"A Hawk spends the country; a Veteran spares it"* |

> **⚠ `DESIGN.md`'s table for this stock is wrong in two ways in one row.** *It lists "civil wars" as a
> term — **there is none** — and omits **In the field**, which is a real one.* **Gap 3.**

---

## 4. The stock discipline — and it is the anti-death-spiral guarantee

```
value = max(floor, clamp01( previous + clamp(target − previous, −maxFall, +maxRise) ))
previous == null  ⇒  open AT the target
```

| | | |
|---|---:|---|
| `power.floor` | **0.08** | **A floor on the STOCK, not on the target** — *"a nation can be under sustained downward pressure and still hold the floor, **which is what stops 'already losing' from meaning 'cannot recover'**"* |
| `power.maxRise` | **0.05** | *"Standing is built slowly; **one good war does not make a state legitimate**"* |
| `power.maxFall` | **0.08** | *"Deliberately larger than the rise — authority is easier to lose than to build — **but bounded, which is the whole anti-spiral guarantee**"* |

> **THIS is the anti-death-spiral guarantee, and it is the pattern D234 borrowed for the logistics
> brake:**
>
> *"Rate-limiting the CHANGE rather than the value means a nation that has a catastrophic turn still
> ends it with most of the standing it had — **the collapse takes a decade of bad turns, which is long
> enough to be a story and long enough to be recoverable.** Limiting the value instead (clamping
> Authority to a minimum) leaves the **pressure** unbounded, so the moment the clamp is relaxed the
> nation falls off a cliff."*

### 4.1 ⚠ Three things the short version of the formula hides

1. **⚠ "Opens AT target" is not true at the bottom of the range.** *A newborn nation whose target is
   below the floor opens **at the floor**, not at its target.* **`DESIGN.md` states the rule with no
   floor caveat.**
2. **The floor and the limits are overridable per stock**, and weariness is the one that overrides both.
3. **The clamp is applied to the target BEFORE the delta, not after.** *Identical in practice; not the
   same expression.*

### 4.2 Weariness inverts the asymmetry, and it took a milestone to notice

> *"The other four stocks are things a nation HAS… **Weariness is a thing a nation SUFFERS**, and
> inheriting those limits silently inverted it — **a country could exhaust itself only slowly and then
> shrug the exhaustion off half again as fast.**"*

**It rises at 0.08 and falls at 0.05.** *"A war tires a country faster than peace rests it"*, and **"the
cost of a war outlives the war."** *For a long time it climbed at 0.05 and fell at 0.08 — **exactly
backwards.***

---

## 5. The leader is a thumb on the scale, and deliberately small

**Every stock has a signed leadership term, and every one is between 0.05 and 0.06.**

> *"**Small on purpose.** A leader should be a thumb on the scale, not the scale — the point of the
> trait system is personality and legibility, and **a leader who swings a stock by a third makes every
> other term in it noise.**"*

**Each stock names the leader it is for:** *Authority's machinery, **"the stock a Conciliator or an
Orator is for"**, **"a Technocrat or a Steward"**, **"a Hardliner or a Reformer"**, and **"a Hawk spends
the country; a Veteran spares it."***

---

## 6. The signed/unsigned split, and the file's most-repeated lesson

**A term is either 0..1 or −1..1, and mixing them has broken this project more than once:**

> *"Mapping a signed value onto 0..1 gives every nation **a constant offset and quietly moves the base
> for everybody**, which three 'sits at the base' tests caught."*

> **⚠ AND THE HELPER THAT DOES THAT MAPPING IS EXPORTED, DOCUMENTED, AND DEAD.** *No term uses it —
> every signed term clamps its raw value directly instead.* **Five comments across the file still
> describe a mechanism the code does not use.** *Gap 2.*

---

## 7. What this hands the Technical Designer

| | |
|---|---|
| **The Why record is the contract.** *Every stock; every term; the key that moves it* | §1 |
| **Rate-limit the CHANGE, never the value** | §4 — *and D234 applies it to the logistics ratio* |
| **⚠ "Opens at target" has a floor caveat nobody has written down** | §4.1 |
| **The order of computation is load-bearing** | §2.1 |
| **⚠ A dead helper and five stale comments describing it** | §6 |
| **⚠ Two bookkeeping faults in the liberties block** | §3.4 |
| **⚠ `DESIGN.md`'s weariness row is wrong twice and its worked record example is arithmetically impossible** | Gap 3 |

---

## 8. Open questions

| | | Owner |
|---|---|---|
| **1** | **Does military readiness ever become an Authority term?** *It was named in the plan alongside two that arrived, and never came* | **Not stated.** *Implied: the designer* |
| **2** | **Two lookup tables hold ONE entry each and fall back for everything else** — *the tolerance of a form of government, and what a government costs to run.* **Their doc says "one entry until the player gets a government to choose", and that shipped** | **Not stated** |
| **3** | **Should Authority, Influence and weariness follow quality of life and liberties into being PER AREA?** *Two of the five already are* | **Not stated** |
| **4** | **Should the turn-0 bands be re-measured on the 61-nation board?** *The published spread was taken on the pre-Shattering 51 and includes none of the extremes the new board added* | **Not stated** |

---

## 9. Gaps

| | |
|---|---|
| **1** | **⚠ Nothing specifies in one place what a stock is FOR downstream.** *Five stocks feed sentiment, elections, victory, coalitions, migration and the faction picker, **and the list exists nowhere***. This document is the first place it is even gestured at |
| **2** | **⚠ The signed-value helper is exported, documented and dead**, and five comments describe it as live |
| **3** | **⚠ `DESIGN.md`'s weariness row names a term that does not exist and omits one that does**, and its worked Why-record example is **arithmetically impossible** — *the target it prints cannot be produced from the raw figure beside it* |
| **4** | **⚠ The liberties block has two bookkeeping faults** — *a "largest negative weight" claim that is false, and a term filed in the wrong tuning group so it renders in the wrong dashboard section* |
| **5** | **Two stocks are missing from the module's default export.** *Harmless today only because every consumer imports the namespace; a consumer using the default import gets **four stocks and no error*** |
| **6** | **The turn-0 bands are a measurement on a board that no longer exists** |
| **7** | **⚠ `DESIGN.md` says twice that treaties and aid do not exist** while both are live Influence terms. *Open since 6 September* |

---

## 10. The scenarios this document must be able to narrate

### 10.1 ✅ A player asks why their Authority is falling, and the game answers

**Step 1.** Authority drops for the third turn running. **The player opens the panel.**

**Step 2 — nothing is recomputed.** *The panel renders the `inputs` array the stock already returned.*

**Step 3 — every term is listed with its contribution**, and **territory lost is at −0.30, the largest
weight in the game in either direction.**

**Step 4 — and each row carries the tunable key that moves it**, so the dashboard's show-your-work view
is the same array with sliders attached.

**Step 5 — the summary sentence is built from that same array**, so it cannot disagree with the numbers
beside it.

**Step 6 — and the contribution is unclamped even though the value is clamped**, so the panel can say
*"you are at the floor, and here is the pressure holding you there."*

> **✅ NARRATES PERFECTLY, and it is the single best piece of engineering in the project.** *The
> explanation is not a feature bolted on: it is the return value.*

### 10.2 ✅ A nation has a catastrophic turn and does not die

**Step 1.** A nation loses six Areas, its treasury empties and its leader falls. **Its Authority TARGET
collapses.**

**Step 2 — the stock does not follow it.** *It may fall by at most 0.08.*

**Step 3 — so the nation ends the turn with most of the standing it had.**

**Step 4 — and the collapse takes a decade of bad turns**, which is *"long enough to be a story and long
enough to be recoverable."*

**Step 5 — the floor catches it at 0.08**, and the floor is on the stock rather than the target, *"which
is what stops 'already losing' from meaning 'cannot recover'."*

**Step 6 — and the pressure stays visible the whole way down**, because the contributions are unclamped.

> **✅ NARRATES, AND IT IS THE PATTERN THE WHOLE PROJECT NOW BORROWS.** *D234 applied exactly this
> reasoning to the logistics spiral: **clamp the change, not the value, because the clamp hides the
> problem.***

### 10.3 ⚠ A nation is founded below the floor and opens higher than it should

**Step 1.** A nation is born mid-game. **Every Authority term reads zero** — no age, no tenure, no
reserves.

**Step 2 — it has no previous value, so the rule says it opens AT its target.**

**Step 3 — ⚠ its target is below 0.08.**

**Step 4 — so it opens at 0.08, not at its target.** *The floor is applied on the same line.*

**Step 5 — and `DESIGN.md` states the rule with no floor caveat**, so anybody reasoning from the
document gets a different number from the game.

**Step 6 — and if it declared, the honeymoon at +0.22 lifts it clear anyway.** *If it was born any of
the other four ways, **it gets no honeymoon at all** — `nation-design.md` §3.1.*

> **⚠ NARRATES, AND THE BEHAVIOUR IS RIGHT.** *A newborn nation should not open below the floor.* **What
> is wrong is the documentation, and the trace exists to say that the two disagree.**

### 10.4 ⚠ A conqueror is strangled by a loop it cannot escape by conquering harder

**Step 1.** A nation takes ground fast. **Conquest at −0.34 and Blitz at −0.20 both bite Influence.**

**Step 2 — and conquest SCALES WITH WHAT IT ALREADY HAD**, so the term gets heavier the more it holds.

**Step 3 — low Influence raises its coalition threat**, because threat is size × (1 − Influence).

**Step 4 — a coalition forms, and its weight takes another −0.30 off Influence.**

**Step 5 — ⚠ which raises the threat again.** *A deliberate feedback loop.*

**Step 6 — it is escapable: stop taking ground and the memories decay.** *But **"it does not let go on
its own, which is what makes an overreach a decision you can lose."***

**Step 7 — and meanwhile occupation is dragging four stocks at once** and the surcharge is superlinear
in the count.

> **✅ NARRATES, AND IT IS THE ANTI-SNOWBALL WORKING AS ONE SYSTEM** — *five weights, a coalition, a
> treasury line and a stock discipline, none of which knows about the others.* **⚠ The one thing to
> check in the alpha is whether it is escapable in practice as well as in principle**, because the only
> exit is patience and patience is invisible to the player: **nothing shows a decaying memory decaying.**

---

*Sources, verified 15 September 2026: `js/power.js` read end to end — the five stock functions, their
adapters, `build`, `step`, the Why-record structure and every comment quoted here; `js/world.js` (the
phase order and the reason for it); `js/tunables.js` (52 `power.*` keys, 13 `qol.*`, 8 `liberty.*`, each
with its verbatim doc string); `DESIGN.md` §4.1; `content/tunables.json` (**no `power.*` key is
overridden, so every value here is live**). **The dead helper, the missing default exports and the
mis-grouped garrison key were each verified by reading the source in this session. The turn-0 band
figures are carried forward with their original attribution and are flagged as a measurement on the
pre-Shattering board.***
