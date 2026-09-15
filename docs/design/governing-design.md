# Governing — the state, its leader, its elections, and the price of every answer it can give

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `identity-design.md` (a party occupies a position and can move; an ideology
cannot) · `power-design.md` (four of the five stocks are what a government answers for) ·
`movements-design.md` (what it is answering) · `economy-design.md` (the treasury) ·
`force-design.md` (the garrison).

**Read by:** `movements-design.md` · `nation-design.md` · `blocs-design.md` · `events-design.md` ·
`ai-design.md`.

**Status: the government, the leader, elections and four valves are BUILT and measured. Martial law,
the referendum, the demand channel and the fifth valve are RULED AND NOT BUILT** — *zero occurrences
of "martial" or "referendum" anywhere in the code.*

> **The one-sentence version: a government is one ideology, one leader and one clock — and everything
> it can do about its own people is the same relief at a different price.**

---

## 1. What a government IS

**Three fields: `{ type, rulingIdeology, since }`.**

| | |
|---|---|
| **`type`** | The **form**. **Only one value exists in the entire build: `Republic`.** Both tunables that read it are single-entry objects with a documented fallback, each saying *"one entry until the player gets a government to choose"* |
| **`rulingIdeology`** | The position the nation **governs as** |
| **`since`** | The turn this government took office. **Read by Authority as tenure** |

**Two further fields the election path writes and the record above does not name:** `lostAt` and
`lostFrom` (the refuse-the-result window) and `lastChange` (the change-course cooldown). *Gap 1.*

### 1.1 "Governs as" does two jobs

1. **It is a column on the opening board** — Austin governs **blue** while every other Texan successor
   governs red; Cascadia governs **green** over ground that leans the other way.
2. **It is a victory test.** *A seat you do NOT own counts toward Reunification if the holder governs
   as you do and your Influence exceeds theirs by a margin.*

### 1.2 ⚠ A government changes hands at an election, and nowhere else

**This is a correction the build already made and the reasoning is worth carrying.** It used to track
the popular plurality every turn for any nation that had never deliberately changed course, and lock
in anybody who had — *"it chose; it keeps its choice."*

> **Both halves were wrong.** The first made a government a readout rather than an actor; the second
> **locked every nation that had never chosen into a government it never chose**, for the rest of the
> game.

**Now: the founding path fires only for a nation with no government at all**, and everything after
that is an election.

---

## 2. The leader — a thumb on the scale, deliberately small

**One named person per nation. Two traits drawn against the government's ideology. A SIGNED modifier
on each of the five stocks, plus a small pull on the war roll.**

**Two traits sum, so a Hawk paired with a Reformer cancels.**

### 2.1 Why signed matters

> **Mapping a modifier of roughly −1..1 onto the 0..1 an ordinary term wants gives every nation a
> constant offset and quietly moves the base for everybody** — *a mistake three "sits at the base"
> tests caught the first time it was made.*

**Recognition is signed for the same reason and measured as a DEFICIT** (`legitimacy − 1`), *so a
recognised nation contributes exactly nothing and a pariah loses the whole weight.* **The pattern is
general: a term that can help or hurt must be able to be zero.**

### 2.2 The draw

**Weighted, not uniform.** A trait whose affinity list contains the government's ideology is
`leader.affinityWeight` = **3** times as likely as one that does not. *"At 3 a fitting trait is three
times as likely as any other. Set it to 1 for pure chance."* **The second trait can never equal the
first.**

**A Distributist state is likelier to be led by a Steward than by a Financier, and unlikely to be led
by either by accident.**

### 2.3 The twelve traits

*Effect keys are `authority · influence · qol · liberties · weariness · war`. **Six keys, not five** —
the sixth is the civil-war roll, which is why `DESIGN.md` says "five stocks plus a small pull on the
war roll" rather than "six effects."*

| Trait | Blurb | Effects |
|---|---|---|
| **Hawk** | *"Believes the border is a verb."* | authority +0.35, weariness +0.30, war −0.25, liberties −0.15 |
| **Conciliator** | *"Would rather be owed a favour than a border."* | influence +0.40, war +0.20, authority −0.10 |
| **Technocrat** | *"Has read the file and will tell you what is in it."* | qol +0.35, authority +0.15, influence −0.10 |
| **Orator** | *"Can hold a square for an hour and does."* | influence +0.35, liberties +0.15, qol −0.10 |
| **Hardliner** | *"Order first, and then whatever is left."* | authority +0.40, liberties −0.35, influence −0.15 |
| **Reformer** | *"Arrived with a list and has not put it down."* | liberties +0.35, qol +0.15, authority −0.20 |
| **Steward** | *"Governs as though somebody will inherit it."* | qol +0.25, liberties +0.15, weariness −0.20, authority −0.20 |
| **Financier** | *"Knows exactly what everything costs."* | authority +0.20, influence +0.20, qol −0.15 |
| **Veteran** | *"Was there, and has not said much about it since."* | war −0.20, weariness −0.25, authority +0.15 |
| **Idealist** | *"Means every word, which is the problem."* | influence +0.25, liberties +0.25, authority −0.25 |
| **Populist** | *"Says the thing the room is already thinking."* | authority +0.25, qol +0.15, influence −0.25 |
| **Caretaker** | *"Did not want the job and is doing it anyway."* | liberties +0.10, weariness −0.10, authority −0.05 |

**Weights into the stocks: 0.05–0.06 each.** *"Small on purpose. A leader should be a thumb on the
scale, not the scale."*

### 2.4 A new government is a new person

**Replaced on a change of course** — *changing course and keeping the same face is the version of
that which means nothing.* **And on an election the incumbent wins, once `leader.termTurns` = 24 has
passed.**

**⚠ The free-running term timer is gone and its tunable's doc has not caught up** — it still says
*"a placeholder for elections"* and *"0 means leaders serve for life."* **Both are stale: the clock
lives in the election now.** *Gap 2.*

---

## 3. Elections

### 3.1 The schedule is derived, not stored

**Every nation votes every `election.termTurns` = 16 — four years of quarters — on a schedule
staggered by a hash of its id and stored NOWHERE.**

> **A derived schedule needs no field in the save, no migration and no reset** — and **fifty-one
> elections landing on the same turn is a newspaper nobody reads.**

**Turn 0 is never a polling day.**

### 3.2 The base is the population; the incumbent gets ONE swing

**Every position's share of the nation's people is the base — the number the map already carries.**
Then the government in office gets one swing, made of **the four things it is answerable for, plus its
leader**:

| Term | Reads | Weight |
|---|---|---:|
| **Record in office** | Quality of life | **0.45** — *the largest, because it is the one the player spends every other lever on* |
| **War weariness** | Weariness, **sign inverted** | **0.45** |
| **Order** | Authority | 0.25 |
| **Liberties** | Civil liberties | 0.25 — ***the other half of the suppression bargain: a garrison buys quiet this decade and votes against you the next*** |
| **Leadership** | The leader's **Influence** modifier | 0.20 |

**The swing is SIGNED and MULTIPLICATIVE on the incumbent's own base, then everything renormalises.**

> **A government with a good record does not take votes from one named rival — it holds people who
> would otherwise have drifted.** *The renormalisation is what moves a share without inventing a
> voter.*

**⚠ There is no `election` trait key and there does not need to be:** *the leaders who campaign well
are the ones who carry Influence — the Orator, the Populist, the Idealist.*

**The poll is PURE.** It seats nobody, changes nothing, and may be called by a panel on every render.

### 3.3 ⚠ Measured against the WORLD MEAN, not the middle of the range

**This is the difference between a system that works and one that does not.**

> **The stocks do not sit around 0.5.** A settled board runs quality of life in the eighties, **so a
> term centred on 0.5 hands every incumbent alive the same large bonus** — which is not a record, it
> is a thumb on the scale for whoever happens to be in office.

| | Elections | Turnovers |
|---|---:|---:|
| **Centred on 0.5 — the mistake** | **284** over 84 turns | **3** |
| **Against the world mean** | **266** | **56** |

**With the mistake in place, a government holding 39% of its people against a rival holding 58% was
re-elected.** Against the mean, California switched to the minority ideology is predicted to **lose
50–47**.

**`election.spread` = 0.15 is what saturates a term:** *fifteen points of quality of life clear of the
average is a government nobody turns out.*

**⚠ Two cautions on those figures.** **Neither run carries a date** — both are tagged to a milestone
only. **And the denominators differ, 284 against 266, with no source explaining the eighteen-election
gap.** *Do not present them as like-for-like without re-running them.* **Gap 3.**

### 3.4 An election can be stolen, and the capacity and the score are the same fact

**A government whose civil liberties have already fallen below `election.stealBelow` = 0.32 is, by
definition, a state that can refuse a result.** *Nothing new had to be invented to say who may.*

**The price is `election.stealLibertiesHit` = 0.12, applied to the STOCK so it decays rather than
being undone by the next recompute.**

> **Suppression buys you this term and buys the grievance that takes the next one.** *The tightest
> form of the loop the whole game runs on.*

**Three structural properties worth carrying:**

1. **The result is ALWAYS counted honestly first.** Stealing is a separate call. *A model path that
   quietly did it for the AI and a interface path that did it for the human would be two rules, and
   they would drift.*
2. **Everybody who can refuse a result, does** — *a state with the liberties of a police state behaves
   like one whether or not a human is watching.* **The rule is identical for the player, except that
   the player is ASKED.**
3. **The refusal window is one turn and is stamped on the government**, because *a save taken between
   the count and the decision must reopen with the decision still to make.*

**On the opening board every nation is far above 0.32.** *A state gets there by holding its own people
down for years.*

### 3.5 Losing an election is not a deliberate change

**`lastChange` is not stamped when a government falls.** *Otherwise a player who lost an election
could not use the appeasement valve for two turns afterwards — **which is exactly the turn they most
need it**.*

**And the cost of changing course buys belief in a course a government CHOSE.** *A government that
lost a vote did not choose anything and has no bill to pay.*

---

## 4. The one table — five moves against six verbs

**Ruling 11, and the discovery is that nothing had to be invented.**

> **The four built valves are not four ad-hoc levers for *Separate*. They are four general moves, and
> nobody noticed because they were only ever aimed at one verb.**

| The built valve | The general move |
|---|---|
| Release the ground | **Concede** — give them exactly what they want |
| Grant autonomy | **Concede less** — a cheaper substitute that scratches the itch |
| Change course | **Remove the want** — fix the cause so they stop wanting it |
| Garrison | **Suppress** — force |

**Ruling 9 adds a fifth: *become them*. Concede everything, including your identity.**

| Verb *(movements)* | Concede | Concede less | Become them | Remove the want | Suppress |
|---|---|---|---|---|---|
| **Separate** *(15)* | release the ground ·**built** | autonomy ·**built** | ruling 9 | raise quality of life; change course ·**built** | garrison ·**built** |
| **Rejoin** *(0)* | hand it back to its old parent | autonomy | — | **govern it better** | garrison |
| **Unify** *(5)* | merge with the neighbour | **join a bloc** — the form without the substance | ruling 9 | deliver what they think merging would bring | garrison |
| **Reunify** *(3)* | put the state back together | a treaty short of merger | ruling 9 | **string them along until the verb changes** | garrison |
| **Expand** *(2)* | go and take it | **buy it rather than take it** | — | **stop being short** | garrison |
| **Reconquer** *(0)* | go and take it back | **get it by treaty** | — | renounce the claim | garrison |

**Four things fall out of it:**

1. **Weighted by what is actually on the board, the hole is 40%, not five-sixths.** *Separate is 15 of
   the 25 reviewed.*
2. **Rejoin and Reconquer have no authored movements at all.** *Both are born in play only — and
   nothing founds a movement in play.*
3. **Rejoin is the only verb curable by governing better.** *Every other verb needs you to give
   something away, act abroad, or suppress. **This one you fix by being better.***
4. **"Join a bloc" is the cheap answer to Unify.**

**⚠ The empty cells are deliberate.** *Become them* does not apply to Expand or Reconquer, *because
adopting an expansionist programme is simply obeying it — the cell collapses into Concede.* **The
verbs with fewer moves are the ones that squeeze the player hardest, which is a feature worth keeping
rather than filling in.**

### 4.1 The *remove the want* column belongs to the ADJECTIVE

**Ruling 11a**, and it is why the design is **6 verbs + 5 adjectives + 5 moves = SIXTEEN things, not
forty-two authored cells.** *Full adjective table in `movements-design.md` §1.2.*

---

## 5. The prices, as built

| Move | What it costs | Clock |
|---|---|---|
| **Release** | `release.costGdpShare` = **0.10** of the **released ground's** output, from the treasury | `release.cooldownTurns` = 8, budget 6 Areas |
| **Autonomy** | **`autonomy.taxShare` = 0.55 forgone every turn**, plus `power.authority.wAutonomy` = −0.18 | cooldown 6, budget 3 Areas, cap `autonomy.maxShare` = 0.3 |
| **Change course** | `distance × gov.changeCost` (0.02) of output, **and an Authority hit of `distance × 0.12` applied to the STOCK** | `gov.changeCooldown` = 8, mandate gate `gov.changeMinShare` = 0.12 |
| **Garrison** | **⚠ `liberty.wGarrison` = −0.35, and that is the WHOLE mechanism.** *`mil.suppressLiberty` = 0.35 is defined, documented and **read by no code** — verified by grep this session. This row previously described a two-term mechanism where only one term exists* | Suppression halves at **200 troops per Area** |
| **Become them** | ⚠ **No number. None invented** | — |

**Two of those prices carry a reason worth keeping.**

> **Autonomy: *"THE PRICE, and it is money rather than force: an Area governing itself keeps most of
> what it raises. Garrison and autonomy are the same trade run in opposite directions — one buys quiet
> with troops and pays in liberties, the other buys it with self-rule and pays in revenue and
> reach."***

> **Its relief is applied to the WHOLE grievance rather than to one term, because the answer autonomy
> gives is not "your quality of life improved" but "this is your government now."**

**Release's price was measured, not argued.** *Release cost NOTHING until it was priced, which made it
a machine for converting territory into stability — and the AI found it immediately. **Measured over
sixty turns at two seeds: with the AI never releasing, 51 nations become 54; at a weight of 0.3, 76;
at 0.9, 135.** A move that buys safety for free is dominant at any weight, so the answer is a price
rather than a smaller appetite.*

**Change course is priced by DISTANCE and already is.** *The build computes `1 − affinity(from, to)`
and multiplies both the treasury cost and the Authority hit by it.* **⚠ So ruling 40 does not
introduce distance pricing — it changes the BOARD the distance is measured on.** *`identity-design.md`
§4.1: crossing the moral line costs √6 direct against 2 through the centre.*

**And the Authority hit lands on the stock, not the target** — *the target recomputes from the world
next turn and would simply undo it. **This is a shock, and the stock discipline is what turns it back
into a recovery over several turns.***

### 5.1 The measured effect of changing course

**Oklahoma switching Republican → Democrat: alignment at home 0.9338 → 0.6683, civil liberties
0.733 → 0.653.**

> **Nobody wrote "calms the aligned region and angers another" — it is what the existing terms say.**
> **Which also shows it is a real trade: appeasing a minority alienates the majority you had.**

**⚠ And the trace found that it only bites for one adjective.** A Nevada/Sagebrush trace **failed to
produce the dilemma at all**, because Sagebrush is *autonomist* and **for autonomists the cheap
substitute and the cure are the same act** — *it never has to choose between its identity and its
territory.* **The scenario is specifically about an IDEOLOGICAL movement, and six of twenty-six are.**

---

## 6. Martial law — ruled, and not one line of it built

> **Martial law is a LEGAL state, not a military one. It does not give you soldiers — it takes away
> the rules the soldiers you already have are operating under.**

**The constraint that decided the shape:** suppression halves **per Area**, *which is what stops a
large empire suppressing everything at once.* **Any martial law that simply suppresses everywhere
breaks that on purpose. So martial law must not be more force.**

| | |
|---|---|
| **Declared over** | A chosen set of Areas, the way release and autonomy already work |
| **What it does there** | **Multiplies the suppression an existing garrison produces.** No garrison in an Area, no effect in it — **a nation with no army gets nothing from declaring it** |
| **What it does nationally** | **Suspends the election** — the one thing nothing else in the game can do — **if it covers over 50% of the nation.** *Aaron's own note: "which also means that conquering too much could be a bad thing"* |
| **What it costs** | Civil liberties in every Area under it, at a multiple of a garrison's rate; **and Authority nationally, because a government that suspends elections has announced it cannot win one** |
| **What ends it** | **Nothing hard. The cost compounds each turn it holds** |

> **Martial law suppresses the symptom and feeds the disease**: the movement share falls while it
> holds, and the liberties it burns raise the grievance that regrows it faster. **Buying time at
> compound interest.**

### 6.1 ⚠ The part worth keeping, and it fell out rather than being designed

**The game already has a way to stay in power against a vote: stealing the election, available only
below 0.32 liberties. So the two are available at OPPOSITE ENDS of the same scale, and neither is
strictly better.**

| | |
|---|---|
| **A rotten government** — liberties already under 0.32 | **Steals quietly and cheaply.** It is barely a change from what it already was |
| **A decent government** — liberties well above 0.32 | **Cannot steal at all.** Its only option is to declare martial law openly, **and it pays far more, because it had further to fall** |

> **That is the whole plan's scenario 3 arriving from an unexpected direction: a government that
> chooses between its own identity and its territory. A decent government in a crisis must lose power
> honestly or become the thing it was elected to prevent.** **Elections run every sixteen turns — four
> years — so the choice is rare and it lands hard.**

### 6.2 ⚠ It bites through DENSITY, not size

**Measured.** To hold half your Areas at half suppression you need **100 troops × your Area count** on
garrison duty.

| A nation whose Areas average | Share of the whole army on garrison |
|---|---:|
| **201,000 people** — the map's average | **≈12%** — trivial, inside the default third |
| **50,000 people** — the Area floor | **≈50%** — half your army, taken from Field and Border |

> **So size alone never blocks it. What blocks it is DENSITY — and conquest LOWERS density, because
> the cheap ground is the empty ground.** **The bite is not *"you are too big to suspend an
> election"*; it is *"you must choose between suspending elections and campaigning abroad."***

**And readiness is rate-limited, so you cannot flip to garrison on the turn you need it.**
**Martial law is not a panic button. It is a posture you committed to several turns before you knew
you would need it.**

**No tunable for any of it exists. Every figure above is borrowed from an existing one.** *Gap 4.*

---

## 7. The referendum — the only genuinely new valve

**Of round 1's four proposed new powers, three were already answered by things built or ruled in the
meantime. The design grew by exactly ONE verb.**

| Proposed | Ruled |
|---|---|
| Negotiate with the movement | **Already built. Do not add it again** |
| **Hold a referendum** | ✅ **ADDED** |
| Buy them | Deferred |
| Partition it yourself | **Dropped — you can already do it** |

> **Let the ground vote. Lose and it leaves CLEANLY — released, a country from day one, no war. Win
> and the movement is set back for years.**

**It re-points the election machinery that already exists, INCLUDING the honesty of the result:** a
vote can only be rigged below 0.32 liberties, and rigging costs 0.12 more.

> **So the trustworthiness of the referendum depends on what kind of government you have been** — the
> same shape martial law found, arrived at independently.

**And it carries its own second-order cost:** *win narrowly and you have **proved** that half the
region wants out, in public, with a number.* **Nothing else in the design makes a movement's support
common knowledge.**

**Why "released, a country from day one" matters:** *a state that DECLARED independence spends its
first years as a pariah; one that was RELEASED is a country from the first day.*

**Nothing of it is built, and it has no numbers at all** beyond the two it borrows. *Gap 4.*

---

## 8. Crises

**Authored, with a trigger over facts the model already computes, a weight for the draw, and two or
three options whose effects come from a CLOSED vocabulary.**

> **Nothing here invents a mechanic: every effect moves a number some other system owns, which is what
> keeps an event a nudge and a story rather than a second design.**

**Twelve exist**, and **every one is triggered by a nation's OWN condition** — *which is exactly the
limitation round 6 had to work around, and `events-design.md` owns.*

**The effect vocabulary:** `treasuryShare · authority · influence · qol · liberties · weariness ·
sentiment · standing`.

**Two rules inside it worth carrying:**

- **Stocks are nudged rather than set, and the nudge lands on the STOCK not its target** — *the same
  discipline changing course uses, for the same reason.*
- **Sentiment moves the movements ALREADY PRESENT.** *A crisis gives an existing argument more people;
  it does not invent a separatist tradition.*

**`events.cooldownTurns` = 8, and its doc is the whole justification:** ***"A country that has a crisis
every turn is not having crises."***

---

## 9. What this hands the Technical Designer

| | |
|---|---|
| **A government changes hands at an election and nowhere else** | §1.2, and both halves of what it replaced were wrong |
| **The schedule is DERIVED** | A hash of the id. No field, no migration, no reset |
| **Measure the swing against the WORLD MEAN** | §3.3. Centred on 0.5 it produced three turnovers in 284 elections |
| **Count the result honestly, then steal separately** | Two code paths for one rule will drift |
| **Shocks land on the STOCK, never the target** | Change course, stolen elections and crises all do this |
| **Losing is not choosing** | No cooldown, no bill |
| **⚠ The five moves are already built as four** | Nothing new is needed except *become them*, which has no price |
| **⚠ Martial law and the referendum have no tunables at all** | Every figure they quote is borrowed |

---

## 10. Open questions

| | | Owner |
|---|---|---|
| **1** | **What multiple does martial law apply, and what does it cost nationally?** §6 names both and neither exists. **The 50% coverage gate has no tunable either** | **The architect** |
| **2** | **At what point may a government *become* the movement?** Ruling 9's *"over a certain number"* — **no threshold named and none invented** | **Aaron** |
| **3** | **The referendum has no numbers at all** — no threshold to call one, no cooldown, no duration for *"set back for years"* | **The architect** |
| **4** | **Does martial law cost an action?** Aaron deferred it: *"we need to change the whole one action per turn."* **⚠ That has since happened — D218 removed the action budget — so the question is now answerable and nobody has answered it** | **Aaron**, then the architect |
| **5** | **Should `type` ever be more than `Republic`?** Two tunables are single-entry objects waiting for it | **Aaron** |
| **6** | **Re-run the election measurement.** §3.3 — undated, and the two denominators differ by eighteen | **A measurement** |

---

## 11. Gaps

| | |
|---|---|
| **1** | **The government record has two fields the design never names** — `lostAt`/`lostFrom` and `lastChange` |
| **2** | **`leader.termTurns`'s doc is stale.** It still calls itself a placeholder and says *"0 means leaders serve for life"*; the clock moved into the election |
| **3** | **The election measurement is undated and its denominators differ** — 284 against 266, unexplained |
| **4** | **Martial law and the referendum have no tunables, no code and no data.** Both are fully ruled |
| **5** | **"Become them" has no price**, and it is the only one of the five moves that does not |
| **6** | **Nothing says what a government does with a movement whose verb is *Rejoin*** — the only verb curable by governing better, **and there are zero authored ones** |

---

## 12. The scenarios this document must be able to tell

**Three traced. Two narrate; the third is the one that shows the design's best accident.**

### 12.1 A decent government is about to lose, and cannot cheat

**Step 1.** A nation has governed well for a decade. Quality of life high, liberties **0.71** — well
above the 0.32 line.

**Step 2.** It fights a war. Weariness climbs, and weariness carries **0.45** in the swing — joint
heaviest with the record.

**Step 3.** The election comes. The swing goes negative. **It is going to lose.**

**Step 4 — can it refuse the result?** **No.** *"A country with this many liberties left cannot simply
ignore a vote."* **The capacity and the score are the same fact.**

**Step 5 — so its only instrument is martial law, declared openly**, costing liberties in every Area
under it and Authority nationally, **compounding every turn it holds.**

**Step 6 — and a rotten neighbour in the same position steals the election quietly for 0.12.**

> **✅ Narrates, and it is the best accident in the design.** **Two mechanisms written in different
> rounds for different reasons sit at opposite ends of one scale, and neither is strictly better.**
> *A decent government in a crisis must lose power honestly or become the thing it was elected to
> prevent.*

### 12.2 A movement demands and the government reaches for the cheapest answer

**Step 1.** An **autonomist** movement demands self-rule. *Seven of twenty-six are autonomist — the
largest adjective.*

**Step 2.** The government looks at the table. **Concede** is the Area. **Suppress** is the garrison.
**Concede less** is autonomy.

**Step 3 — and for an autonomist movement, *concede less* and *remove the want* are THE SAME ACT.**

**Step 4.** It grants autonomy. It forgoes **55% of that ground's tax** every turn and takes an
Authority hit of 0.18. The grievance falls by **0.45 — applied to the whole of it**, not to one term.

**Step 5 — and it keeps the Area.**

> **✅ Narrates. *An autonomist movement is the cheapest kind to satisfy, because its cheap substitute
> and its cure are the same act.*** **And the trace explains why the scenario the whole plan was built
> around fails here: this government never has to choose between its identity and its territory.**
> *That choice belongs to the six ideological movements and nowhere else.*

### 12.3 ⚠ A government is asked six questions before it can move

**Step 1.** Answering a movement's demand is **free and mandatory** — you answer before your turn can
move.

**Step 2.** Measured: **median 2 movements touch a state, worst 5 — and the worst is Oregon.**

**Step 3 — but three components now claim the same channel**: movements, events, and the answers to
offers you sent.

**Step 4.** Ruling 12 named the precedent when it created it: *this is the first thing in the whole
design to get a guaranteed decision every turn without spending the action — **and every other
component will now want the same channel, and the answer has to be no unless it earns it the same
way.***

**Step 5 — and the answer was not a cap.** `turn-design.md` §4.3: **the briefing is ranked and edited,
not rationed.** *Triage IS the game, and the interface is where it lives or dies.*

> **✅ Narrates, and the trace's value is that it closes a loop across three documents.** **The demand
> channel was created here, the queue risk was found in round 7, and the answer arrived in the turn
> design from the interface rather than from the budget.** *None of the three sessions that wrote
> those pieces had the other two in front of it.*

---

*Sources, verified against the files on 15 September 2026: `docs/design/politics-ideation.md` rulings
9, 11, 11a, 12, 14, 15, 19, 21, 22, 40, finding E and the scenario-3 trace; `DESIGN.md` §6, §6.6,
§7.4; `content/leaders.json` (twelve traits, six titles, the name pools); `content/events.json`
(twelve crises and the effect vocabulary); `js/elections.js`, `js/leaders.js`, `js/game.js`
(`changeRulingIdeology`), `js/events.js`; `js/tunables.js` (`election.*`, `leader.*`, `events.*`,
`autonomy.*`, `release.*`, `gov.*`, `liberty.wGarrison` — **but NOT `mil.suppressLiberty`, which is a
dead key**). **The election and
Oklahoma measurements carry no date in any source and none is invented here; both are tagged to a
milestone only.***
