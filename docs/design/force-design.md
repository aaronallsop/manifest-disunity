# Force — one number, and three places to point it

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `population-design.md` (manpower) · `economy-design.md` (equipment, and the
upkeep bill) · `power-design.md` (Authority and cohesion make doctrine; the garrison pays in
liberties) · `governing-design.md` (suppression as an answer to a movement).

**Read by:** `war-design.md` · `movements-design.md` · `ai-design.md` · `power-design.md`.

> **The one-sentence version: there are no troops, no unit types and no recruitment. There is one
> derived number, three sliders, and a readiness bar that lags them — and the gap between the slider
> and the bar is the entire cost of changing your mind.**

**And the constraint that made it this way is Aaron's, in his own words:**

> *"I want it to be really simple from a user experience level. **There isn't going to be troops /
> troop types / etc.**"*

---

## 1. ⚠ THREE SLICES, NOT FOUR

**Garrison · Border · Field.** *Verified in the code this session.*

| Slice | Buys you | Paid for in |
|---|---|---|
| **Garrison** | **quiet at home** | **civil liberties** |
| **Border** | **being expensive to attack** | the field army you did not raise |
| **Field** | **your own attacks landing** | the garrison you did not station |

> **⚠ A FOURTH SLICE — *Ally* — IS WIDELY ASSUMED AND IS NOT BUILT.** *It was taken as a **default by a
> session rather than ruled by Aaron**, to serve conquest ruling 27's "you lend soldiers — by a lever
> you set". **It is not in the list of seven defaults Aaron later confirmed**, and one of round 2's own
> traced scenarios already narrates as though it existed.* **Open question 1, and `GDD.md`'s document
> list said four until it was corrected today.**

---

## 2. What the one number is

```
force = manpower × equipment × doctrine
```

| Factor | | |
|---|---|---|
| **manpower** | population × a fixed share | **four in a thousand** — *roughly a peacetime standing force: enough that a large nation fields a large army and a small one cannot bluff, **without turning the game into a mobilisation race*** |
| **equipment** | **SATURATING** on GDP per head, not linear | *"the difference between a poor nation and a middling one is most of the story, and the difference between a rich one and a very rich one is very little of it. **A linear term would make California's army twelve times Wyoming's before a single soldier was counted**"* |
| **doctrine** | a floor, plus Authority (0.6) and cohesion (0.4) | *"The machinery — whether the state can actually get people into uniform"* and *"the willingness. **A divided population fields a divided army**"* |

**The doctrine floor exists for a specific reason:** *"a state with no authority and a population that
agrees with nothing still fields something. **Without a floor, a nation in crisis loses its army at the
exact moment the model wants it to have a hard choice about using it.**"*

**Nothing about force is stored.** *Only the allocation and the readiness are state.*

### 2.1 ⚠ Force is never RAISED or LOST as an act

**There is no recruit action, no build action, and no battlefield losses.** *It moves only when its four
inputs move: population, GDP per head, Authority, cohesion.*

> **So the one place a war reduces your army is indirect — the civil-war cost cuts the loser's ruling
> bloc population, which cuts manpower.** *And the file says why that is right:* **"a nation that is
> falling apart gets weaker at exactly the moment it needs the army — which is the honest direction for
> that feedback to run."**

---

## 3. Readiness — the cost of changing your mind

**The allocation is a distribution and sums to 1.** *A nation that has never been told opens on an even
split, a third each.*

**⚠ READINESS IS NOT A DISTRIBUTION.** *Each role's readiness is an independent 0..1 chasing its own
share*, and the code refuses to normalise it on load, in as many words:

> *"Normalising them on load quietly rewrote every posture that was mid-transition, **which is exactly
> the state a save is most likely to be taken in.**"*

**It rises at 0.06 a turn and falls at 0.12 — twice as fast down as up.** *"An army stood down is stood
down immediately, and an army worked up takes seasons."*

**Measured: a one-turn switch to Field reaches under 60% of a standing posture.**

**And the tunable that governs it says what the whole mechanism is for:**

> *"**THE COST OF CHANGING YOUR MIND.** Without a rate limit the allocation is three sliders you set at
> the moment of use — everything to Field on the turn you invade, everything to Garrison on the turn a
> movement crosses the line — and **a decision you can always take later is not a decision.**"*

### 3.1 What the player sees, and why the bar matters more than the slider

**Three sliders, and a readiness bar beside each.** *Only for your own nation.*

> *"**The readiness bar beside each is the point**: it lags the allocation, so the panel shows you what
> you HAVE as well as what you have asked for, and the gap between them is the cost of having changed
> your mind. **Without showing readiness the sliders would look free.**"*

**What one posture is worth:** `force × allocation × readiness`.

**Force ticks before the power stocks**, deliberately — *because a garrison that came up this turn
should be holding ground down when Civil Liberties are computed at the end of it.*

---

## 4. What the force actually does

### 4.1 Garrison → quiet, and the price of it

```
free = force × a peacetime allowance
per Area = max(0, garrison strength − free) ÷ Areas held
suppression = saturate(per Area)
```

**The subtraction is load-bearing.** *The allowance is set to exactly what the default even split
leaves at home — a third of the force at a third readiness — **so a nation that has made no military
decision suppresses nothing at all.*** *Without it, **every nation on the map quietly held its own
population down from turn zero and the secession timeline moved for a world in which nobody had chosen
anything.***

**The per-Area divisor is what stops a large empire suppressing everything at once:** *"a garrison
spread over sixty Areas is not the garrison of a nation with four, and that is exactly the difference
between an occupier who can hold a province and one stretched across a continent."*

**And it is calibrated against the force the model actually produces**, not against a guess — *at the
first estimate the suppression term read 0.027 and did nothing at all.*

### 4.2 ⚠ And the price is ONE term, not two

**A garrison costs civil liberties, weighted −0.35**, and the reason is the best statement of the
design:

> *"A garrison buys quiet in the sentiment phase and pays for it here, in the stock that feeds the
> grievance driving the next movement. **Without this, suppression is a free answer to secession and the
> whole valve is a button you would always press.**"*

> **⚠ A SECOND TUNABLE FOR THE SAME JOB EXISTS, IS DOCUMENTED, AND IS READ BY NOTHING.** *Verified by
> grep this session.* **`governing-design.md` cited it twice as live and has been corrected.**
> *`docs/deferred.md` 42.*

### 4.3 Field vs Border → the war multiplier

```
share = my Field strength ÷ (my Field + their Border + every coalition member's Border × 0.45)
multiplier = (1 + 0.45 × (0.5 − share) × 2) × the leader's thumb
```

**It multiplies the civil-war SCORE, where low is a win for the attacker.** *Range: **×0.55 at total
superiority to ×1.45 at total inferiority.***

**At 0.45 a prepared army roughly halves the score it would otherwise face and an unprepared one adds
half again** — *large enough to be worth planning for, small enough that the dice still decide.*

**⚠ Coalition members' border armies count against you whether or not today's victim is one of them.**
*"A coalition is not a treaty that has to be invoked; it is the fact that three of your neighbours have
their armies pointed at you."*

### 4.4 Field → weariness at home

**An army in the field is a burden in a way a border garrison is not.**

> *"This is the one place the allocation costs something at home, and it is what makes **"everything to
> Field" a decision with a price rather than a free preparation.**"*

---

## 5. Upkeep — and the question it claims to ask

**Charged on FORCE, not on the allocation.** *"You do not save money by pointing it somewhere else.
**This is what makes 'how much force' a question rather than 'as much as possible'.**"*

**Calibrated by measurement:** *at the first figure the army ate the whole of one state's opening
surplus and **every nation on the map ran a deficit from turn one**. At the shipped figure it is about a
third of what a state has spare — **a real bill rather than a death sentence.***

> **⚠ BUT IT IS NOT ACTUALLY A QUESTION, AND THE PROJECT ALREADY KNOWS.** *The manpower share is fixed
> and there is no lever on force size anywhere.* **The weariness term states the problem in its own doc
> string and works around it:**
>
> *"Force size is not a choice in this game — the manpower share is fixed, so force ÷ population varies
> only with equipment and doctrine and reads as **a constant 0.05–0.10 for every nation forever**, which
> is **a term carrying no information and a permanent drag with no lever.**"*
>
> **The same objection applies to the upkeep tunable's claim, and nobody has recorded it.** *Open
> question 3.*

---

## 6. Every number this system has

| Key | | |
|---|---:|---|
| `mil.manpowerShare` | **0.004** | *"Four in a thousand… without turning the game into a mobilisation race"* |
| `mil.equipmentHalf` | **60,000** | *saturating on GDP per head* |
| `mil.doctrineFloor` | **0.35** | *"A state with no authority… still fields something"* |
| `mil.wAuthority` · `mil.wCohesion` | **0.6 · 0.4** | the machinery, and the willingness |
| `mil.upkeepPerHead` | **35,000** | *"a real bill rather than a death sentence"* |
| `mil.readyRise` · `mil.readyFall` | **0.06 · 0.12** | **the cost of changing your mind** |
| `mil.garrisonFree` | **0.111** | *exactly the peacetime split, so no decision means no suppression* |
| `mil.garrisonHalf` | **200** | **PER AREA** |
| `mil.warSwing` | **0.45** | ×0.55 to ×1.45 |
| `liberty.wGarrison` | **−0.35** | **the price, and the whole of it** |
| `leader.warSwing` | **0.12** | *"who is in charge should matter less than whether the army is ready and whether the neighbours have lined up"* |
| ~~`mil.suppressLiberty`~~ | ~~0.35~~ | **❌ DEAD. Read by nothing** |

**⚠ And five numbers that should be here are not.** *The AI's allocation weights are **literals in
code**, against the standing project rule that every model constant is a named tunable.* *Gap 2.*

---

## 7. What is ruled and not built

| | |
|---|---|
| **The fight should be a STATED PERCENTAGE**, before you commit | Aaron: *"**I do like the idea of a percentage chance — it feels like your generals analysed the data and are giving you a chance to win / succeed**"* |
| **⚠ And it must fire on EVERY attack** | *Today the Field-vs-Border comparison is read **only** when the attacker's own civil war happens to trigger. **That is the one structural change the ruling asks for and nothing has been built*** |
| **Three kinds of base as map geography** | **Army → manpower · Air Force → attack · Naval → coastal attack, plus a bonus to foreign port trade.** *And explicitly: **no nuclear weapons** — decided, not deferred* |
| **A bonus for attacking ground your own movement holds** | *And a penalty for attacking an armed population that hates you — **"the same formula read in two directions."*** *Aaron named it and said "decided later on"* |
| **⚠ A garrison should RADICALISE the ground it holds** | *Round 1 asked for it, round 2 confirmed it is missing, a later ruling gave it a home.* **Today suppression only subtracts.** *Nothing specifies the magnitude* |

---

## 8. Open questions

| | | Owner |
|---|---|---|
| **1** | **⚠ Is the allocation three slices or four?** *The fourth is an unconfirmed default, absent from the list Aaron confirmed, and a traced scenario already narrates it* | **Aaron, or the Technical Designer** |
| **2** | **The fight must be a stated percentage on EVERY attack.** *Ruled; nothing built* | *"Whoever builds it" — no owner named* |
| **3** | **⚠ Upkeep is charged on a quantity nobody can choose.** *Should force size become a lever, or should the tunable stop claiming it is a question?* | **Unassigned — found here** |
| **4** | **What does "good tech increases your chance" mean?** *Named by Aaron; **no tech system exists anywhere in the game*** | **Unassigned** |
| **5** | **The magnitudes for the three kinds of base** | **The data stage, then the architect** |

---

## 9. Gaps

| | |
|---|---|
| **1** | **❌ `mil.suppressLiberty` is defined, documented, was cited twice in a design document, and is read by nothing** |
| **2** | **⚠ The AI's five allocation weights are literals in code**, against the project's standing rule |
| **3** | **Upkeep's doc string claims it makes "how much force" a question. There is no lever on force size** |
| **4** | **The three kinds of base have no data, no formula and no magnitude** — *and the naval one's trade bonus crosses into the economy* |
| **5** | **The radicalising garrison has a home and no number** |

---

## 10. The scenarios this document must be able to narrate

### 10.1 ✅ A movement crosses the line and the player reaches for the army

**Step 1.** A movement's share passes the threshold in three Areas. **The player pushes the Garrison
slider to the top.**

**Step 2 — nothing happens this turn.** *Readiness climbs at 0.06. The bar beside the slider shows the
gap.*

**Step 3 — and the gap IS the mechanic.** *A one-turn switch reaches under 60% of a standing posture.*
**The player is being shown, on the panel, that they should have decided this three turns ago.**

**Step 4 — when it does arrive, the suppression is divided by every Area held.** *A nation with sixty
Areas gets a thin garrison everywhere; a nation with four gets a real one.*

**Step 5 — and it costs civil liberties at −0.35**, which feeds the grievance driving the next
movement.

> **✅ NARRATES COMPLETELY, and it is the cleanest trade in the game:** *suppression buys quiet now and
> buys the next movement later, so it is a decision rather than a button.*

### 10.2 ⚠ A player prepares for a war and is told nothing about their odds

**Step 1.** The player moves Field to the top and waits several turns for readiness.

**Step 2 — they attack.** *The preview shows a price and a reach check.*

**Step 3 — ⚠ the Field-vs-Border comparison is read ONLY if the attacker's own civil war triggers.**
*If it does not, **the defender is never consulted at all.***

**Step 4.** *So a nation with its whole army on the border and a hostile, well-armed population is,
mechanically, a shop.*

**Step 5 — and the percentage Aaron asked for is nowhere.** *"I do like the idea of a percentage
chance — it feels like your generals analysed the data."*

> **⚠ JAMS on the one structural change the ruling asked for.** *The multiplier exists and is good; it
> is wired to the wrong event.* **Everything the player did in steps 1–2 may have had no effect
> whatsoever, and the game never says so.**

### 10.3 ⚠ A nation is falling apart and reaches for more soldiers

**Step 1.** A nation is losing Areas. **Its Authority falls, its cohesion falls.**

**Step 2 — its doctrine falls with them**, because doctrine is Authority and cohesion.

**Step 3 — its population falls too**, if the losses came through a civil war.

**Step 4 — so its force falls.** *"A nation that is falling apart gets weaker at exactly the moment it
needs the army — **which is the honest direction for that feedback to run.**"*

**Step 5 — and the doctrine FLOOR catches it.** *A state with no authority still fields something,
**so the nation has a hard choice rather than no army at all.***

**Step 6 — ⚠ and it cannot raise more.** *There is no recruit action. The manpower share is fixed. The
only lever is where to point what it has.*

> **⚠ NARRATES, AND THE SHAPE IS DELIBERATE AND GOOD — but step 6 is where the upkeep tunable's claim
> breaks.** *It says charging on force rather than allocation makes "how much force" a question.* **It
> is not a question. It is a fact the nation is billed for.**

---

*Sources, verified 15 September 2026: `js/military.js` end to end (the three roles, the product, the
readiness step and its load refusal, suppression, the war multiplier, upkeep); `js/power.js` (the
liberties garrison term, the weariness deployed term and its doc string's objection); `js/ai.js` (the
allocation weights, which are literals); `js/panels.js` (the three sliders and the readiness bars);
`js/tunables.js` (every `mil.*` key with its verbatim doc, plus `liberty.wGarrison`, `leader.warSwing`,
`coalition.warShare`, `sent.wSuppression`); `DESIGN.md` §6.1; `docs/design/conquest-ideation.md`
rulings 11, 12, 26, 31 and ideas C23, C77, C108, C110. **`mil.suppressLiberty` was verified dead by
grep across `js/` and `tests/` in this session, not taken from a brief. The "under 60% of a standing
posture" figure and the garrison calibration figures are carried forward with their original
attribution.***
