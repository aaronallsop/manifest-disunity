# The economy — what is produced, what is needed, and what things cost

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `board-design.md` (the Area, and the ports that decide whether anything can
leave) · `population-design.md` (who eats, and who works) · `power-design.md` (quality of life, and
the treasury's strain term) · `trade-design.md` (the deal, and what a haul is worth).

**Read by:** `trade-design.md` · `governing-design.md` · `nation-design.md` · `events-design.md` ·
`missions-design.md`.

> **⚠ STATUS, AND IT IS UNUSUAL: THE MODEL IN THIS DOCUMENT IS KNOWN TO BE STRUCTURALLY WRONG AND IS
> BEING KEPT ON PURPOSE.** *The addendum says so in as many words: "The existing model is known to be
> structurally wrong (spec §1.2) and it is being kept anyway, on purpose, because fixing it is not
> what alpha is testing."* **Almost nothing in §§3–6 below is built.**

> **The one-sentence version: six sectors, each with a need it cannot meet alone — and one of them is
> upstream of everything, which is either the best thing in the model or the most brittle.**

---

## 1. What is built, and what is not

| **BUILT** | **SPECIFIED, NOT BUILT** |
|---|---|
| Six sectors with a baked profile per Area, rescaled to live output | Derived demand — §3 |
| **One** price index | The five bands and every per-sector effect — §4 |
| The treasury, and occupation as the anti-snowball brake | The five-multiplier deal price |
| Trade as a standing contract, used by all sixty-one nations | Goods actually moving |
| Transit, tolls, the rivers, the two seas | Embargo · lending · hunger claims · treaty succession |

**The load-bearing absence: NOTHING PHYSICALLY MOVES.** *Settlement is a treasury credit, so a buyer
gains **money** rather than goods.* **Until that changes, every downstream system in the spec is
decoration** — the spec's own words.

---

## 2. The six sectors

*Verified from `data/economy.json`, 15 September 2026. **Three documents use three different sets of
names for them** — the data file, the spec's prose, and the wiring page Aaron drew on. Gap 1.*

| Sector | What it needs | What throttles it |
|---|---|---|
| **Agriculture** | **People.** Population, nudged by quality of life | **⚠ Extraction** — ruling 7, and it is new |
| **Resource Extraction** *(energy lives here)* | Factories, mostly — manufacturing capacity at 0.6, plus a slice of population | **Nothing. It is the top of the chain** |
| **Manufacturing** | People and upkeep | **Extraction.** Capped at the extraction ratio in deficit, at **40%** in crisis |
| **Trade & Transportation** *(logistics)* | **Everything that moves** — all internal volume **plus every leg of every trade deal** | Its own capacity |
| **Finance** | Debt service and government spending | **Nothing physical. The one sector a blockade cannot touch** |
| **Information Technology** | People and factories, both at 0.05 | Manufacturing, in practice |

### 2.1 ⚠ The substrate everything sits on is six hand-authored templates

**Each Area's six-sector split comes from one of six authored percentage templates**, chosen by a
four-tier ladder. *Measured 15 September 2026: **849 of 1,688 Areas — 50.3% — share template 0.***

> **The spec condemns this in its own text:** *"Six hand-authored templates with roughly half the map
> sharing one is not a grounded estimate; it is a guess wearing the authority of the real GDP figure
> it is attached to. **It is also the substrate every number in this spec sits on.**"*

**The re-bake from real industry data is scheduled and not done.** *And it carries a trap: **farming in
the game today is ten times bigger than real figures say it should be**, and how much food a person
needs was calibrated against that inflated number — so replacing the data without also resetting
hunger would starve the whole continent on the first turn.*

---

## 3. Demand — derived, and it is the whole point

**Replaces share-of-own-output entirely.**

```
foodDemand          = population × 1.0 × (1 + qolModifier × 0.1)
extractionDemand    = manufacturingCapacity × 0.6 + population × 0.1
manufacturingDemand = population × 0.3 + infrastructureUpkeep
logisticsDemand     = totalVolumeMoved
financeDemand       = debtService + governmentExpenditure
itDemand            = (population + manufacturingCapacity) × 0.05
```

### 3.1 Why this is the whole point

> **As built, no state can ever be short of anything, because every state's demand is defined as a
> share of what that state already produces.** *The "deficits" on the trade screen are statements
> about industry mix, not about sufficiency.* **A game about states that cannot feed themselves
> currently contains no mechanism by which a state can fail to feed itself.**

**There is no additive path.** The built line is `surplus = production − demandShare × grossOutput` —
**demand is literally a fraction of your own production**, so it rises when you produce more.

### 3.2 ⚠ Finding G — ruling 7 does not work as written

**Ruling 7 gates farming on extraction, so *"almost nobody is genuinely self-sufficient."***

**But `extractionDemand` counts no farmland at all.** It reads manufacturing capacity and population
and nothing else.

> **So farmland CONSUMES extraction but never ASKS for it — and the farm-heavy, factory-light nation
> the ruling was written to catch is the one nation it never touches.**

**The fix is one term — `+ agricultureCapacity × k` — and the coefficient is the architect's.** *It
is not made here because `docs/spec/` may not be modified without permission.* **⚠ Ruling 7 does not
work without it.** *Open question 2.*

**⚠ And "all coefficients live in the tuning schema" is false today.** *Not one of the six formulas
above has a tunable key. There is no `band.`, `sector.`, `supply.`, `demand.` or `claim.` prefix
anywhere.* **Gap 2.**

---

## 4. The bands, and what each shortage actually does

```
ratio = supply / demand      — evaluated end of turn
```

| Band | Ratio |
|---|---|
| **Crisis** | < 0.50 |
| **Deficit** | 0.50 – 0.89 |
| **Met** | 0.90 – 1.10 |
| **Surplus** | 1.11 – 1.50 |
| **Glut** | > 1.50 |

**⚠ The ladder has a hole: `0.89 < ratio < 0.90` and `1.10 < ratio < 1.11` fall in no band.** *A second
statement of it elsewhere closes the gap by reading the bounds as inclusive-upper. **The spec table is
authoritative and it is the one with the hole.*** **Gap 3.**

### 4.1 What breaks when each runs short

| Short of… | What happens |
|---|---|
| **Food** | **Quality of life falls hard (−30 in crisis)**, anger rises every turn, **army readiness drops 20** — and claim pressure builds toward every neighbour with a surplus |
| **Extraction** | **Factories capped at 40%.** Admin costs up a quarter. **And now the farms throttle too** |
| **Manufacturing** | **Military equipment halved.** Infrastructure repair stops |
| **Logistics** | **Routes fail outright — 10% a turn each — and a fifth of everything in transit is lost.** Tolls cost more |
| **Finance** | Cannot service debt, **credit frozen**, real default risk each turn |
| **IT** | **You negotiate blind** — other nations' figures come to you wrong by up to **40%** — and a quarter of your tax revenue leaks away |

**Food has storage: four turns of national consumption, and only volume above it triggers a glut.**
*No health effect — the obesity idea is withdrawn.*

**IT's intel error is the reason to invest in it:** *low-IT states negotiate partly blind.* **⚠ And it
is the only place in the design where a system deliberately lies to the player about another nation's
figures** — which collides with round 7's relationship-gated sight. *Open question 5.*

### 4.2 Hunger becomes a claim

**A state in food Deficit or Crisis accrues claim pressure toward each adjacent state in Surplus or
Glut: +2/turn, or +5/turn in crisis. At 50, a casus belli unlocks.** **Suppressed to zero while an
active food deal covers ≥50% of the shortfall at ≤1.3× base price.**

> **Selling food to a hungry neighbour becomes a security policy; starving one becomes a deliberate
> risk.**

**Derived from the spec's own numbers, not stated anywhere:** at +2/turn a Deficit nation reaches 50
in **25 turns**; at +5 a Crisis nation reaches it in **10**. *A turn is a quarter, so roughly **six
years** and **two and a half years**.* **Marked as derived.**

---

## 5. Prices and the treasury

**The built index — and it is the one thing in this document that runs today:**

```
price = 100 × (demand share ÷ supply share) ^ 1.3,  clamped 20–400
```

**The per-capita spend is recalibrated every turn**, so the index reports *what is scarce*, not what
turn it is. **Demand shares sum to exactly 1.0, which is what makes "100 = balanced" true** — *and
they did not until it was found: a sum of 0.80 made every price too low by a factor and the interface
label wrong by construction, with "balanced" actually sitting at 75.*

**The spec makes that index the BASE price and multiplies five terms onto it** — scarcity,
alternatives, relations, risk and duration. *Full treatment in `trade-design.md`; it is the deal's,
not the economy's.* **⚠ Its duration row is keyed to a menu that no longer exists — D233.**

### 5.1 The treasury

```
Treasury = output × tax rate − government maintenance − administration − occupation
```

> **Occupation is the anti-snowball brake**, and it is superlinear:
> ```
> upkeep(a) = base × (1 + hostilityWeight × hostility(a)) × (1 + n^alpha)
> ```
> **25 occupied Areas roughly double their own upkeep; 100 costs about 5×; 400 about 24×. A greedy
> conqueror's per-turn treasury delta crosses into deficit around 110 occupied Areas.**

**The count term stops conquest paying for itself at scale; the hostility term makes WHICH ground you
took matter as much as how much.**

**⚠ Military upkeep is computed every turn and does not appear as a term in that line.** *Either it is
inside "government maintenance" or the line is stale.* **Gap 4.**

---

## 6. The five loops — and one of them is a runaway

### 6.1 ⚠ THE LOGISTICS SPIRAL — the most serious thing round 4 found

> **You go short of something → you import it → that raises the volume you are moving → which pushes
> logistics toward deficit → which makes routes fail and loses a fifth of what is in transit → **so
> less of the thing you were importing actually arrives** → so you import more.**
>
> **THE CURE FEEDS THE DISEASE.** *A nation can be destroyed by its own attempt to fix a shortage, and
> nothing currently stops it.*

**Predicted, not measured.** *Spec §3 has never run, so the severity is unknown and **only the sign of
the effect is certain**.*

**⚠ Say which number you mean.** *The headline "a fifth in transit" is the **Crisis** rate (20%). At
**Deficit** it is 10% of everything in transit plus 15% more in tolls — which is the band the round's
own worked example runs in.*

### 6.2 The other four, for context

| | |
|---|---|
| **The extraction squeeze does not self-correct** | Extraction demand is driven by manufacturing **capacity**, and capacity is frozen by geography — only *utilisation* falls when a shortage bites. **So idle factories go on demanding ore they cannot use**, and there is no automatic relief valve anywhere in the chain |
| **Extraction now reaches all the way to war** | Short of extraction → farms throttle → food short → claim pressure → grounds for war at 50. **A mining shortage becomes an invasion, in four steps** |
| **IT is a slow tax on everything** | **Quiet, compounding, and never a crisis — the right shape for it** |
| **Finance floats free, deliberately** | **A blockaded nation's banks keep working while its farms and factories stop.** ⚠ **And Aaron's own wiring says the opposite** — five of his arrows make finance the thing that BUILDS capacity. *Deferred to F34, unreconciled* |

---

## 7. ⚠ THE BRAKE — chosen here, in Aaron's place

**Finding E left three candidates and chose none. This document chooses.** *It is the single largest
thing decided without him in this run and it is logged in `docs/HOGWILD-LOG.md` with the command that
reverses it.*

### 7.1 The three as the round stated them, and why two fail

| | The candidate | Verdict |
|---|---|---|
| **1** | **Logistics capacity rises with the volume being moved** | ⚠ **Attacks the real driver — and reopens a ruling.** The industry mix is frozen by ruling 1.4(a), and making one sector's capacity mutable is the precedent for all six. **It also creates a second, downward spiral nobody has written:** capacity that rises with volume can fall with it |
| **2** | **Cap transit losses** | **The only one guaranteed to bind.** Cheapest — one number in one table, no new object. **But it caps the SYMPTOM**: demand still climbs, the ratio still falls, and route failure and the toll rise are untouched |
| **3** | **The world market's shipping cap binds first** | ❌ **It does not cover the case the spiral runs in.** The spiral is driven by *"every leg of every trade deal"*, and the round's own worked example runs entirely on **bilateral neighbour deals**. The world-market cap is per state per turn **on the world market**, reachable only through a port. **A landlocked nation importing food from the state next door never touches it** |

### 7.2 What is chosen, and it is candidate 2 sharpened

> **RATE-LIMIT THE FALL OF THE LOGISTICS RATIO, rather than capping the loss it produces.**

**This is brake 2 done the way this project has already solved a runaway once.** *The power stocks do
not clamp the value — they clamp the CHANGE, and the file says why: "clamping the value to a minimum
leaves the pressure unbounded, so the moment the clamp relaxes the nation falls off a cliff. **The
clamp hides the problem.**"*

**Four reasons, in order of weight:**

1. **It binds on the actual failure case**, which candidate 3 does not.
2. **It caps every consequence at once** — losses, route failures and the toll rise all read the band,
   and the band reads the ratio. *Capping only the loss leaves the spiral running through route
   failure, which is candidate 2's real weakness and this answers it.*
3. **The precedent is exact and it is this project's own.** `power.maxFall` exists for a runaway of
   the same shape, and its reasoning transfers without modification.
4. **It survives Aaron's §B, which would make the spiral worse.** *His unruled recommendation gates
   production on hauling — a second arm on the loop. A cap on one consequence would not survive that;
   a limit on how fast the ratio itself can fall does.*

**What it costs, stated:** **it delays the pain rather than removing it.** A nation that keeps importing
into a deficit still gets there — *it gets a few turns to notice and stop*, which is the difference
between a trap and a spiral.

**What is NOT decided here:** **the rate.** *That is the architect's, exactly as `power.maxFall` is,
and no placeholder is invented.*

### 7.3 ⚠ And choosing a brake is the same decision as ruling on §B

**Nothing in the record connects them and they are one question.** Aaron's four arrows — *ore needs
trucks · goods need trucks · food needs trucks · trucks need gas* — ask that **a shortage upstream
throttle PRODUCTION rather than merely tax the journey.** It is recorded as *the cheapest change on
the page* and it was **never ruled on**: he answered the other groups and not this one.

> **Under §B a logistics deficit would cut output as well as losing goods in transit — a second arm on
> the loop. The brake chosen above is the only one of the three that still works if §B lands.**
> *That connection is an inference and is flagged as one. Open question 1, and it is Aaron's.*

---

## 8. Aaron's wiring — 35 arrows, and where they live

**He drew 35 on the evening of 14 September. One was deleted the same evening as a duplicate pointing
the wrong way, so the board holds 40 — six seeded from rulings and 34 of his.**

| | Count | |
|---|---:|---|
| **Already works** | **7** | Fertiliser · fed people are less angry · hungry people stand up to the government · better tech, better army · better finance, better borrowing · bad diplomacy, less trade · better hauling, better trade |
| **⚠ Nearly works — and is STILL OPEN** | **4** | **§B.** *"The same gate, pointed at two more pairs — hauling gated on extraction, and production gated on hauling. No new machinery."* **Recommended for the alpha and never answered** |
| **Needs something that does not exist** | **23** | Eight groups, all deferred to **F27–F34** |
| **A duplicate** | 1 | — |

**The three demands his arrows make on the model**, and the third is the largest gap between his
picture and the spec's:

1. **Capital investment — five arrows.** *"New mines require new capital investments."* **Finance in
   his map is not a sector that floats free — it is the thing that BUILDS capacity.** *§6.2 calls the
   opposite a feature. **Direct contradiction, deferred to F34, unreconciled.***
2. **People are an input — three arrows.** *"Factories need workers."* **No production anywhere reads
   population. A region with no one in it produces exactly what a crowded one does.**
3. **Technology improves everything — eight arrows, more than any other source.** **He is describing a
   multiplier on everything.** *Today IT does exactly two things: it makes other nations' figures
   wrong when you inspect them, and it leaks tax.*

**⚠ And the arrows themselves are not in this repository.** *They live in the published wiring page's
database. Neither design document reproduces all 35 individually.* **Gap 5, and it means the record of
his own design input is outside the project.**

**One number worth noticing: of twelve non-sector categories, EVENTS has nothing pointing at it at
all**, and the treasury and separatists have one each.

---

## 9. What this hands the Technical Designer

| | |
|---|---|
| **Demand must stop being a share of your own output** | §3.1. Until it does, no nation can be short of anything |
| **⚠ Ruling 7 needs one more term before it works** | §3.2. `extractionDemand` has no agriculture input |
| **The band ladder has a numeric hole** | §4 |
| **Rate-limit the ratio's FALL, not the loss** | §7.2, and the rate is yours |
| **Nothing in §§3–6 has a tunable** | Not one. When you name the brake, its key will not exist either |
| **The substrate is six hand-authored templates** | §2.1, and half the map shares one |
| **⚠ Re-baking industry data without resetting hunger starves the continent on turn 1** | §2.1 |

---

## 10. Open questions

| | | Owner |
|---|---|---|
| **1** | **⚠ Should a shortage upstream throttle PRODUCTION, or only tax the journey?** Aaron's §B, recommended for the alpha and never answered. **It is the same decision as the brake** — §7.3 | **Aaron** |
| **2** | **What coefficient gates farming on extraction?** Ruling 7 does not work without the term at all, and the term is not in the authoritative spec, which may not be edited without permission | **Aaron** for the permission, then the architect |
| **3** | **Is one upstream chokepoint the best thing in the model or the most brittle?** Extraction now does three jobs — fuel, ore and fertiliser. **Paper cannot tell which.** *Finding D* | **The alpha** |
| **4** | **Does lasting infrastructure damage exist?** A wrecked rail hub lasts one turn — *a raid, not a demolition* | **Aaron** |
| **5** | **IT's intel error against relationship-gated sight.** Two systems now decide what you can see of another nation and they were designed a week apart | **Aaron**, then `presentation-design.md` |
| **6** | **Where phosphate, potash and natural gas actually are.** ⚠ **Unverified, and ruling 7 rests on it.** *"It must be checked against real data and not from memory"* | **The data stage** |

---

## 11. Gaps

| | |
|---|---|
| **1** | **Three documents use three different names for the same six sectors** — the data file, the spec, and the wiring page |
| **2** | **Not one formula in §§3–4 has a tunable key**, against the project rule that every model constant is one. *The spec claims otherwise in writing* |
| **3** | **The band ladder leaves two numeric gaps** at 0.89–0.90 and 1.10–1.11 |
| **4** | **Military upkeep is absent from the treasury line** and is computed every turn |
| **5** | **⚠ Aaron's 35 arrows exist only outside this repository.** The design input is not in the project |
| **6** | **Spec §1.6 and §5.5 are dead letters inside an authoritative document.** *D166 rules the recognition block stays; the spec still specifies replacing it, and says so in its own text.* **Somebody will build it unless this is said out loud** |
| **7** | **The toll models disagree in SHAPE, not in value.** The spec has per-mode multipliers compounding on delivered cost; the build has one rate with per-mode discounts |

---

## 12. The scenarios this document must be able to tell

**Three traced. One narrates into the chosen brake, one jams on a ruling that does not work, and one
is the failure this whole document exists to prevent.**

### 12.1 ⚠ A landlocked farm state goes short of fertiliser and tries to buy its way out

**Step 1.** Its extraction ratio falls below 0.50. **Crisis.**

**Step 2 — ruling 7 fires.** Farming throttles. *Food falls.*

**Step 3.** Food enters Deficit. **Quality of life drops, anger rises every turn, and claim pressure
starts accruing toward every neighbour with a surplus at +2 a turn.**

**Step 4.** The player does the sensible thing and **imports food.**

**Step 5 — and every leg of that deal is added to logistics demand.** The ratio falls.

**Step 6.** Logistics enters Deficit: **10% of everything in transit is lost and tolls cost 15% more.**
*So less of the food arrives than was bought.*

**Step 7.** The player imports more. **Step 5 again, worse.**

> **❌ WITHOUT A BRAKE THIS DOES NOT STOP.** *The nation is destroyed by its own attempt to fix a
> shortage, and its claim pressure keeps climbing the whole way — so it arrives at a casus belli
> against a neighbour **because it tried to trade with one**.*

**With §7.2's brake:** the ratio cannot fall faster than the limit, **so the player gets several turns
in which the deal is still mostly arriving.** *That is enough time to see the logistics line moving and
stop — which is the whole difference between a trap and a spiral.* **The brake does not save a player
who keeps going.**

### 12.2 ⚠ The farm-heavy nation ruling 7 was written for

**Step 1.** A nation is almost entirely agricultural. Few factories.

**Step 2.** Ruling 7 says its farms should throttle when it cannot get extraction — *that is the whole
point of the ruling, and Aaron ruled it to close the hole where a self-feeding nation could ignore
everybody.*

**Step 3.** Its extraction **demand** is computed: `manufacturingCapacity × 0.6 + population × 0.1`.

**Step 4.** It has almost no manufacturing capacity. **So its extraction demand is almost entirely the
small population term.**

**Step 5.** Its ratio is therefore **comfortably Met.** It is not short of extraction at all.

**Step 6 — so its farms never throttle.**

> **❌ JAMS. The one nation ruling 7 was written to catch is the one nation it never touches.**
> *Finding G, and the fix is a single term with an unset coefficient.* **The ruling is live and does
> not work.**

### 12.3 A blockade is laid, and nothing new had to be built

**Step 1.** A nation wants to strangle another. There is no blockade object in the game.

**Step 2 — it closes its corridors.** A year's notice; the deal it carried **pays nothing while its
term runs down.**

**Step 3 — and it declares an embargo.** Unilateral suspension, a reputation cost, and a cost to its
own economy.

**Step 4.** Together those are the blockade. **Ruling 6: *nothing needs adding. What was missing was
somebody saying that the two together ARE the blockade.***

**Step 5 — and the target's banks keep working.** *Finance is the one sector a blockade cannot touch,
and §6.2 calls that a feature.*

> **✅ Narrates, and it is the best example in the project of the discipline the whole design runs on:
> before adding a verb, check whether two existing verbs used together already spell it.**
> **⚠ But step 5 is exactly where Aaron's own wiring disagrees** — five of his arrows make finance the
> thing that builds everything else, and under his reading a blockade that leaves the banks running is
> a blockade that barely bites. *Deferred to F34 and unreconciled.*

---

*Sources, verified against the files on 15 September 2026: `docs/design/economy-ideation.md` rulings
1–9, findings A–G, §4a's five loops and §4b's arrow analysis; `docs/design/wiring-triage.md` (the
7/4/23/1 triage and §B); `docs/spec/economy-system-spec.md` §§1.2–1.6, 3.2–3.4, 4.1–4.3, 5.6–5.8;
`docs/spec/economy-system-spec-addendum-a.md` §4; `DESIGN.md` §5, §12; `data/economy.json` (the six
sector names and the 1,688 Area records; template distribution counted this session);
`build/build_economy.py` (the six templates and the four-tier ladder); `js/market.js`, `js/tunables.js`
(`econ.*`, `market.*`, `qol.*`). **The spiral is PREDICTED, not measured — spec §3 has never run. The
25-turn and 10-turn claim-pressure figures are derived from the spec's own rates and are marked as
derived. The five-states-above-average-on-both figure that ruling 7 rests on is used as measured in
four places and names no source file — flagged rather than repeated.***
