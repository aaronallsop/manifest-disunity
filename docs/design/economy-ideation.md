# The economy — ideation

**Stage 1 of five: IDEATION. Nothing here is judged, chosen, sized or ruled on.**

This is the idea bank for the economy and resources. Its only job is to be **complete** — every idea
we have had about how this part of the game should work, in one place, so that when we move to
design nothing gets quietly lost because it happened to be in a conversation nobody re-read.

**The rule for this document:** an idea earns a place by having been had. It does not have to be
good, affordable, consistent with its neighbours, or compatible with what is already built. Several
entries below flatly contradict each other and that is correct at this stage. Judging them is the
next document's job.

**Where they came from.** `docs/design/resources.md` (the 6 September conversation),
`docs/design/resources-v2.md` (the simplification pass — *including everything it cut, which is
restored here, because cutting is a design act and this is not the design*), `docs/FUTURE-IDEAS.md`
entries F2 to F13, and the known gaps in `docs/deferred.md`. The long-form reasoning for the
F-entries stays where it is; what is here is the idea itself.

**Not included, on purpose:** F1 (sub-turns), F14 (a turn arriving as news) and F15 (whether
counties are too small). Those are about time, presentation and the size of the map — three
different systems, each of which deserves its own ideation round rather than being smuggled into
this one.

---

## 0a. The three things written at the top of every round

**One action per nation per turn, and it ends the turn.** Six components compete for one slot. Any
idea below that assumes a decision every turn has taken that turn away from the other five, and this
round has to say so out loud.

**The board and the six ideologies are fixed.** Geography is baked from federal data. If this round
finds itself wanting to change either, that is a finding worth stopping for.

**Every quantity says where its number comes from** — measured from a named file, invented as a
placeholder, or still to be asked about.

---

## 1. What this round owns

The economy owns **one of the nine pressures** that feed a region's anger — how well its people are
fed, treated and paid — and round 1 called it the deepest of them. Round 1 measured the term at
**17% of grievance** and asked that quality of life be able to *fall*, visibly and for a reason a
player can read, and recover when the cause is fixed.

It also inherits the story the whole plan is aimed at: **scenario 4, a hungry nation with an army**,
where buying food is possible but invading for it is cheaper. That story needs rounds 1, 2 and 4
finished before it can be told, which makes it this round's exam rather than one of its exercises.

### What this round is NOT, and it changes the shape of the work

**It is not "invent how shortage works". That is already written.** `docs/spec/economy-system-spec.md`
§3 specifies a complete resource model — supply-to-demand bands, derived demand, and a table of
effects per sector per band — and its owner rulings 1.2 to 1.5 already replaced the broken parts of
the built economy **on paper**.

**None of it is built.** The alpha track deliberately built trade and transit *on top of* the
known-wrong economy and left demand, supply and price alone: *"A1 and A2 build on the existing economy
and do not touch it. No changes to demand, supply or price… The model is known to be structurally
wrong and is being kept on purpose."*

So the hollow spot everybody keeps naming — **nothing bad happens to a nation that does not trade** —
**has a written cure that was never built.** This round's job is to test that cure against what three
closed rounds now demand of it, and to settle where the two disagree. It is not to write a second one.

### What is already built, verified against `DESIGN.md` on 14 September 2026

| | |
|---|---|
| **Six sectors** | Agriculture, Resource Extraction, Manufacturing, Trade & Transportation, Finance, Information Technology. Each Area has a baked production profile, rescaled to its live GDP |
| **One price index** | `100 × (demand share ÷ supply share)^1.3`, clamped, recalibrated every turn so it reports *what is scarce* rather than what turn it is |
| **Treasury** | GDP × tax rate, less maintenance, administration and occupation |
| **Occupation as the anti-snowball brake** | Superlinear on Areas held outside the home state. A greedy conqueror's treasury crosses into deficit around **110 occupied Areas** |
| **Trade as a standing contract** | A term, a fixed price and an expiry. All sixty nations use it, not only the player |
| **Transit across other people's ground** | Compounding tolls, a notice period, and a route-finder |
| **The rivers** | Four corridors and **fifteen chokepoints**, all real places. A gate bridges the stretch above it and the stretch below it and no other pair |
| **Two seas and a shut canal** | Panama closed to former American states |
| **Canada and Mexico** | Geography, not nations. Great Lakes ports reach the world market only through the Canada corridor |

### What is not built, and this round has to know all five

1. **Nothing physically moves.** Settlement is a treasury credit, so a buyer gains *money* rather than
   goods. `DESIGN.md` §12 calls this "the honest remaining gap". **Spec ruling 1.3 already replaced it
   on paper** — *"trade becomes a transfer of quantities… goods move too, and the buyer's supply figure
   rises"* — and it was never built.
2. **A trade deal cannot be haggled on price.** The lever exists in the model and reaches no screen, so
   *a buyer with no alternative pays exactly what a buyer with three alternatives pays*. `DESIGN.md`
   calls this "the single largest gap between what the economy spec asks for and what is built".
   **The spec already closes it on paper** — §4.1's scarcity and alternatives multipliers — so this is
   a build gap and not a design one, and conquest's I3 is answered. See finding C.
3. **Nothing in the transit layer has a length.** Measured 5 September 2026: the closest two ports on
   one sea are **16 miles** apart and the farthest **2,578**, priced identically; a Canada corridor
   spans **411 to 2,442 miles** at one flat rate.
4. **No AI nation ever closes a corridor.** They sign them, price them and let them expire. The
   decision to cut somebody off is the player's alone, and the machinery is symmetrical.
5. **Quality of life is one national number.** This was finding A, and **ruling 2 keeps it that way**
   deliberately: one national pot, shortage felt identically everywhere, round 1's "locally" deferred
   to F25 for the sake of a simple first alpha.

---

## 2. The inbox — what rounds 1, 2 and 3 handed this one

**Filed 14 September 2026, seven days after the round went live.** Rounds 2 and 3 closed on 9 and
11 September and neither handover was carried across at the time. This section is that repair.
**Nothing here is new** — every row is a demand already written down in a closed round, and three of
them block a rule that has already been ruled.

### Blocking — a written rule cannot work until this round answers

**Two of these three were unblocked by ruling 1 within the hour**, because the answers were already in
the spec and the spine had been written before the whole spec was read. See **finding C**.

| # | From | What it asks for | State |
|---|---|---|---|
| **I1** | **Conquest**, ruling 23 | **What a war costs to run.** Deferred here explicitly, and ruling 22's repayment lever cannot be priced without it | ✅ **CLOSED by ruling 3** — a four-line ledger of things the game already counts, per war. **No blocking item remains** |
| **I2** | **Conquest**, ruling 4's third cause | **Desperation must bite.** A nation that cannot get a resource must actually suffer for it, or the third cause of war can never fire | ✅ **CLOSED by ruling 1.** Spec §5.7 — a state in food deficit or crisis accrues claim pressure toward each adjacent state in surplus, **+2 a turn** deficit and **+5** crisis, and **at 50 a casus belli unlocks**. Suppressed to zero while a food deal covers **≥50%** of the shortfall at **≤1.3× base price**. That is not merely suffering — it is suffering pointed at a neighbour's fields, which is ruling 4's third cause exactly |
| **I3** | **Conquest**, ruling 4 | **A price must be settable by the seller**, or nobody can charge the absurd price that same cause names | ✅ **CLOSED by ruling 1.** Spec §4.1 — deal price layers five multipliers on the base index, two of which are this: **ScarcityMult** rises as the buyer's own ratio falls, to ×2.5; **AlternativesMult** rises as the buyer's supplier count falls, to ×1.5. The spec calls the second *"the most important term… what makes cutting a rival's other supplier a strategic act rather than a flavour event. Do not simplify it away."* |

### Owed, but blocking nothing

| # | From | What it asks for |
|---|---|---|
| **I4** | **Conquest** | What a **blockade** actually stops, and what a **destroyed rail hub** does to a corridor — ✅ **ruling 6** |
| **I5** | **Conquest**, finding E | Its fifth story stalls on **I2**. Filed so this round knows its answer unblocks somebody else's scenario |
| **I6** | **Politics**, rulings 25–27 | **What a federation's toll split is worth** — 5% between direct neighbours, 10% routed, the host's share going to the ground actually crossed — ✅ **ruling 5** states the principle; the sizing goes to the mechanics stage |
| **I7** | **Politics**, ruling 21 (S26) | **Buying a movement off.** Deferred here because what money can buy is this round's to say — ❌ **refused by ruling 8**, because ruling 2 removed the regional mood it would act on. Comes back if F25 is ever built |
| **I8** | **Politics**, F21 | **Funding propaganda** before a referendum — ✅ **accepted by ruling 8.** The legal end of the same scale as rigging: money buys the result openly, liberties buy it quietly |
| **I9** | **Secession**, §4 | **Quality of life must be able to fall** — from hunger, from a broken supply, from a blockade — visibly, for a readable reason, **and locally** — and recover when the cause is fixed |

### One item corrected on arrival

**Ruling 15's X% is not this round's.** Politics §9 assigns it to the **mechanics stage**, carrying the
hard constraint that it must sit **below 0.30** or two Unify movements can never make a demand at all
(politics finding I). It is noted here only because this round may set what a *share of trade* is
worth (I6), and the two numbers will be read side by side by whoever sets them.

---

## 3. The spine — the questions, in the order they are asked

Asked one at a time, each with a recommendation. Answered ones move into a rulings section.

**The order puts the blocking questions first**, so that the three rules already written in another
round stop being blocked as early as possible, and puts the Tuesday test last because every answer
above it changes what there is to do.

| # | Question | Why here | State |
|---|---|---|---|
| **Q1** | **Does the spec's resource model still stand, now that three rounds have made demands of it?** | Everything else is a detail of the answer. It is also the cheapest possible outcome: if it stands, most of this round is filing rather than inventing | ✅ **Ruling 1**, 14 Sep |
| **Q2** | **Does shortage land on a place, or on a country?** | **Finding A.** Round 1 demanded local; the spec rules resources pool nationally. They cannot both be right | ✅ **Ruling 2**, 14 Sep |
| ~~**Q4**~~ | ~~Can a seller set a price?~~ | **Struck.** Already answered by spec §4.1 and therefore by ruling 1. See finding C | ✅ **Withdrawn** |
| **Q3** | **What does a war cost to run?** | **I1 — the last blocking item**, and nothing in the spec touches it | ✅ **Ruling 3** (default) |
| **Q5** | **What does the outside world want?** | Spec §4.3 makes it a price-taker with slow prices and a shipping cap, which says what it *pays* but not what it *wants* | ✅ **Ruling 4** (default) |
| **Q6** | **What stops a self-sufficient nation from simply opting out?** | Measured: five states are above the national average on both food and energy. **The spec names this as a balance risk and its whole mitigation is "a Phase 1 stop condition"** — a measurement, not a design | ✅ **Ruling 7**, 14 Sep |
| **Q7** | **What can money buy?** | **I7 and I8** — buying a movement off, and funding a referendum | ✅ **Ruling 8**, 14 Sep |
| **Q8** | **What is a share of trade worth?** | **I6.** The federation is newer than the spec, so the spec is silent by age rather than by choice | ✅ **Ruling 5** (default) — principle here, sizing to the mechanics stage |
| **Q9** | **What does a blockade stop?** | **I4.** Spec §5.6 names embargo and corridor closure as instruments without saying what they do to the goods | ✅ **Ruling 6** (default) |
| **Q10** | **Where does water data come from, if water is to be geography rather than invention?** | E51 measured that the rivers in the game are shipping lanes with no flow and no volume, and that the Colorado — the actual water fight — is absent entirely | ◀ **Open — Aaron's**, because it is a spend |
| **Q11** | **What does the player actually do about all of this, on a Tuesday, with one action?** | The Tuesday test. Last, because every answer above changes it | ◀ **Open** |

---

## 3a. Findings

### Finding A — shortage cannot land on a place, and two documents disagree about whether it can

**Round 1 handed this round the requirement that quality of life must fall *locally***, adding: *"the
formula already reads the Area's own condition."* **It does — but not through the term this round
owns.**

Verified against `DESIGN.md` §7.2 and §12 on 14 September 2026. A region's grievance reads quality of
life, civil liberties, how powerful the holding nation is, that nation's authority, war weariness, and
the Area's own authored grievance. **Of those six, only the authored grievance is a property of the
place.** The rest are national stocks, and `DESIGN.md` §12 says so in terms: *"the power stocks are
still per NATION, so sentiment's grievance terms are uniform across everything a nation owns."*

**The spec makes the same collision internally, which is the part worth stopping for.** §3.3 gives a
food crisis two effects — **Quality of Life −30** *and* **Area grievance +5/turn** — but §3.5 rules
that **resources pool nationally, with no intra-national supply chain.** If every Area is equally
short, every Area takes the same +5, and the per-Area channel is national in everything but name.

**Why it matters more than it sounds.** The story this round is examined on needs hunger to be *worse
somewhere*. A nation uniformly 8% short of food has a management problem. A nation whose two eastern
Areas are starving while the capital eats has a **secession** problem — and that is the game.

**What it would cost, in the document's own words.** `DESIGN.md` §12 names the fix and prices it as
cheap: *"Quality of life and liberty satisfaction per Area would give the diffusion term a real
gradient to run along, and would give migration a much sharper one; the economy bake is already per
Area, so it is a change of scope rather than of model."*

**Owner: Aaron**, as **Q2**. It is a scope decision rather than a technical one.

**✅ CLOSED 14 September 2026 by ruling 2, in the spec's favour and deliberately.** One national pot
stands; shortage is felt identically everywhere; round 1's "locally" is deferred to **F25** for the
sake of a simple first alpha. The contradiction is resolved rather than fixed — **round 1 does not get
what it asked for**, and that is a recorded trade rather than an oversight.

### Finding B — the cure for the hollow spot was written a week before the hollow spot was named

The known hollow spot — *nothing bad happens to a nation that does not trade* — is recorded in three
places as an open problem. **The spec answers it**: derived demand (§3.4) replaces demand-as-a-share-
of-own-output, which is the single thing that makes a shortage arithmetically impossible today; bands
(§3.1) turn a ratio into a state; and the per-sector tables (§3.3) attach real consequences to each
band, food crisis included.

**It was not built because the alpha track was told not to touch it**, and that was a deliberate,
recorded choice rather than an oversight.

**What this changes about the round:** the first question is not *what should happen to a hungry
nation* but **whether the answer already written is still the right one** after three rounds of new
demands. That is **Q1**, and it is cheap to ask and expensive to skip.

### Finding C — the spine was written from a third of the spec, and overstated what was open

**Mine, 14 September 2026, recorded because it is the same mistake this project keeps paying for.**

§1, §2 and the spine were written after reading the spec's §1 (the owner rulings) and §3 (the resource
model). **§4 to §9 were read an hour later, and they closed two of the three blocking items outright.**

| | What the spine claimed was open | What the spec already said |
|---|---|---|
| **I3 / Q4** | A seller cannot set a price; conquest is blocked | **§4.1.** Deal price is the base index times five multipliers. **ScarcityMult** climbs to ×2.5 as the buyer's own ratio falls; **AlternativesMult** climbs to ×1.5 as the buyer's supplier count falls. The spec calls the second the most important term in the model and says in terms: *"Do not simplify it away"* |
| **I2** | Desperation does not bite; the third cause of war cannot fire | **§5.7.** A state in food deficit accrues **+2 claim pressure a turn** toward each adjacent state in surplus, **+5** in crisis, and **at 50 a casus belli unlocks** — suppressed to zero while a deal covers **≥50%** of the shortfall at **≤1.3× base**. That is desperation pointed at a specific neighbour's fields |

**So ruling 1 did more than keep a model — it closed two blocking items in another round**, and
neither Aaron nor this document knew that when he answered.

**Why this is worth a finding rather than a quiet correction.** Two of the eleven questions put to
Aaron were not questions. The project's own brief warns about exactly this — *"this project has
measured numbers and recorded rulings, and quietly contradicting one is the specific failure this
arrangement exists to prevent"* — and the mirror-image failure is **asking him to decide something
already decided**, which costs his time and, worse, risks a second answer that contradicts the first.

**The rule it earns:** read the whole of a governing document before writing the list of what it
leaves open. A table of contents is not a reading. *(Proposed for `docs/PROGRAMMER-RULES.md`.)*

**What it saves.** The round is materially cheaper than §2 implied. **One blocking item remains** —
what a war costs to run — and the spec is silent on it by omission rather than by choice.

---

## 4. Rulings

### Ruling 1 — The written resource model stands, and this round extends it rather than replacing it

**RULED 14 September 2026**, answering **Q1**. Aaron: *"Yes lets keep it"*.

**What is now settled.** `docs/spec/economy-system-spec.md` §3 is the economy's spine and stays:

| | |
|---|---|
| **Need is derived, not a share of own output** | §3.4. This is the single change that makes a shortage arithmetically *possible*, and it is the root cure for the hollow spot |
| **Supply ÷ need gives a ratio, and the ratio gives a named state** | §3.1 — crisis under 0.50, deficit to 0.89, met to 1.10, surplus to 1.50, glut above |
| **Each state has written consequences per sector** | §3.3. A food crisis costs 30 quality of life, adds 5 Area grievance a turn, and drops army readiness 20 |
| **Output is capacity × utilisation, and the industry mix stays frozen** | §3.2 and ruling 1.4(a) |
| **The existing price index becomes the base price and deal terms layer on top** | Ruling 1.5 |

**What this ruling does NOT settle, said plainly so nobody reads it as more than it is.** The model
was written on 4 September, before any ideation round closed. Three rounds have closed since and made
**nine demands** of it (§2). The written model covers two of them, is **silent on five**, and
**contradicts one**:

- **Silent on:** what a war costs to run (I1), what a blockade stops (I4), what a share of trade is
  worth (I6), what money can buy (I7, I8) — and, from this round's own bank, how a brand-new country
  tolerates hunger (E93) and what becomes of federal land (E92).
- **Contradicts:** §3.5 pools resources nationally with no internal distribution, and round 1 demanded
  that shortage be felt **locally** (I9). That is finding A and it is **Q2**.

**The honest caveat, recorded because it was put to Aaron before he answered.** This is a plan whose
central mechanism **has never run**. It is well-reasoned and aimed at the right problem, and nobody
has watched it behave. If it is wrong, that is discovered at the number-setting stage rather than here.

**What it saves.** The alternative was a fresh model, which would have put everything rounds 1 to 3
assumed about hunger back on the table. This round is now mostly filing, tracing and the six gaps
above, rather than an invention.

### Ruling 2 — One national pot. Shortage is a national fact, and round 1's local demand is deferred for the alpha

**RULED 14 September 2026**, answering **Q2** and resolving finding A. Aaron: *"Keep one national pot
— for the first real alpha we want this to still be a simple game"*.

**What is settled.** Spec §3.5 stands **unchanged**: resources pool nationally, there is no
intra-national supply chain, and **a shortage is felt identically everywhere the nation holds.** The
recommendation put to Aaron had a second half — that what a region *grows* should decide how much it
feels the shortfall — and **that half is refused**, on the stated ground that the first real alpha
should stay a simple game.

**Read §3.3's "Area grievance +5/turn" as uniform, and write it down here so nobody later reads it as
a gradient.** Under one national pot every Area is equally short, so every Area takes the same +5. It
is a per-Area *line item* and a national *quantity*. That is not a defect; it is this ruling.

**What round 1 gets, and what it does not.** I9 asked that quality of life be able to fall from
hunger, from a broken supply and from a blockade — visibly, for a readable reason, **locally**, and
recoverably. **Three of those four are delivered** by ruling 1: derived demand makes a shortage
arithmetically possible for the first time, the bands give it a name, the food crisis costs 30 quality
of life, and it recovers when supply returns. **"Locally" is deferred.**

**What still works, and it matters that this is not a blocker.** Conquest's **I2 — desperation must
bite — is satisfied.** A national food crisis costs real quality of life and drives grievance in every
region the nation holds, so ruling 4's third cause of war **can fire**. The bite is blunter than round
1 wanted, not absent. **Scenario 4 can still be traced**; it is told in national terms.

**What is actually lost, said plainly.** Texture. A hungry nation's anger is uniform, so a player
cannot point at a region and say *there* — the anger arrives as a national mood rather than a place on
the map. And the Tuesday verb this would have produced for free — **taking the farmers' food to feed
the cities** — cannot exist, because there is no distinction between farm and city to trade off.

**Deferred, not dropped:** per-region quality of life, and the requisition verb that depends on it, go
to `docs/FUTURE-IDEAS.md` **F25**. The game's own design document already recommends the change and
prices it as cheap, so it stays cheap whenever it is picked up.

**One line to reverse.** If the alpha shows that a uniform national mood is too blunt to read, this
ruling is the thing to revisit first, and F25 is the work.

### Rulings 3–6 — four defaults taken without asking, 14 September 2026

**Taken rather than asked, on the precedent of conquest ruling 41**, which confirmed seven defaults in
one go. Each is a technical shape built entirely out of quantities the game already computes; none
invents a gameplay concept; all four follow Aaron's steer at ruling 2 that the first real alpha should
stay a simple game. **Each is one line to reverse and says so.**

---

#### Ruling 3 — the cost of a war is a ledger of four things the game already counts, opened at the declaration and closed at the settlement

**Answers I1, the last blocking item.** Conquest ruling 23(a) deferred *what a war costs* here
explicitly, and ruling 22's repayment cap is measured against it, so nothing could be priced until it
landed. Ruling 22 also states the constraint: *"the cost of the war must mean more than what you spent
attacking."*

**It does, and all four lines already exist:**

| Line | Where it already comes from |
|---|---|
| **What you spent attacking** | The attack price, already charged **per Area and per head** |
| **The extra upkeep of a war posture over your peacetime one** | Force is already on the books every turn, charged on force rather than on where it points |
| **The output you lost from your own Areas that were attacked** | **Ruling 23(b)** — an Area under attack produces nothing that turn whether or not it falls, and the loss is already **per sector**, not merely "income" |
| **The occupation surcharge on ground you took and now hold** | Already superlinear, and already the anti-snowball brake |

**Both sides keep one**, because ruling 33 makes both sides table a treaty and ruling 22 prices the cap
off the proposer's costs. **It is per war** — opened when the war is declared, closed when it is
settled — because a cap measured against a lifetime of wars is not a cap.

**Nothing new is invented, and that is the recommendation's whole argument.** The alternative was a
fresh war-economy subsystem, which is the opposite of the steer at ruling 2.

**The one number that is not here:** whether the price of an attack exceeds one turn of the target's
output. Conquest C102 flagged it as the raid exploit and assigned it to the mechanics stage. **It stays
there** — this ruling gives it a ledger to be measured against, which it did not have before.

---

#### Ruling 4 — the outside world is one market reached through geography, and Canada and Mexico are not customers

**Answers Q5 and closes deferred #12**, which recorded that Canada, Mexico and the world market have no
demand at all.

**The world market is adopted exactly as spec §4.3 writes it:** reachable only through a port you own,
port transit rights, or a Canada/Mexico corridor; **a price-taker with slow-moving prices, not an
infinite sink**; a shipping capacity cap per state per turn; and the existing external-trade rate as
the baseline haircut.

**And the part that is new, which resolves the conflict rather than the gap: Canada and Mexico are the
road to the customer, not the customer.** `CLAUDE.md` rules them geography and not nations — not
actors, no opinion, no negotiation — so giving them an appetite of their own would make them actors by
the back door. **The demand lives in the world market; Canada and Mexico are how you reach it.** That
is already how the map is built: Great Lakes ports reach the world only through the Canada corridor and
ocean ports reach it directly.

**So "what does the outside world want?" has a deliberately boring answer: anything, slowly, up to a
cap.** It is a floor under a cornered seller and a ceiling on an export strategy, and it is not a
character.

---

#### Ruling 5 — a toll between two actors is a transfer; a toll through geography is a cost

**Answers I6's principle.** Politics rulings 25–27 already set the federation's *rates* — 5% between
direct neighbours, 10% routed, the host's share going to the ground actually crossed. What the economy
owed was **what a share of trade is worth**, and the honest answer has two halves.

**The principle, which is this round's to state:** when both ends of a toll are nations, the money
**moves** — it leaves the payer and arrives in the holder's treasury, which is what makes a chokepoint
worth holding and worth resenting. When the ground crossed belongs to nobody who can hold a treasury —
Canada, Mexico — the toll is **burned**, a cost to the payer that arrives nowhere. `CLAUDE.md` already
rules the Canada corridor's 10% *"a cost, not a transfer"*; this generalises it and gives the reason.

**The sizing is not this round's and is not taken here.** Whether 5% of trade is real money is a
measurement against a built economy, and it belongs to the mechanics stage — **beside ruling 15's X%**,
which the politics round sent to the same place with a hard constraint of its own.

---

#### Ruling 6 — a blockade is not a new instrument, and neither is a destroyed rail hub

**Answers I4**, and it is the cheapest answer in the round.

**A blockade is corridor closure plus embargo, and both are built or specified.** Corridor closure
already exists with a notice period, and a deal whose route has closed **pays nothing while its term
runs down** — the strangle the rivers section already describes. Embargo is spec §5.6: unilateral
suspension, a reputation cost, and a cost to your own economy. **Nothing needs adding.** What was
missing was somebody saying that the two together *are* the blockade.

**A destroyed rail hub is ruling 23(b) pointed at a Trade & Transportation Area.** Attacking an Area
switches off its production for the turn, the loss is already per sector, and Trade & Transportation
**is** the sector that moves everything else. So attacking the hub denies the logistics — which is what
destroying a rail hub should mean — with no new mechanic, no new object, and no new number.

**The honest limit, stated so nobody mistakes this for more than it is.** Ruling 23(b) lasts **one
turn**. A rail hub that is rebuilt by the following quarter is a raid, not a demolition. If the alpha
wants lasting infrastructure damage, that is a new mechanic and this ruling does not provide it —
**it goes to the design stage as a question, not into this round as an assumption.**

---

### Ruling 7 — farmland needs what comes out of the ground, so almost nobody is self-sufficient

**RULED 14 September 2026**, answering **Q6**. Aaron: *"That is correct — it needs imported resources
and so that would reduce farming input."*

**What is settled.** The spec already throttles a sector that cannot get its inputs: §3.2 gates
utilisation on input availability, and §3.3 caps **Manufacturing** utilisation at the extraction ratio
in deficit and at **40%** in crisis. **That same gate now applies to Agriculture.** A nation with
fields it cannot fertilise runs them below capacity, and fertiliser is phosphate, potash and nitrogen
from natural gas — all of which come out of the ground and none of which is spread evenly.

**What it buys, and it is the whole reason for asking.** The hollow spot had two halves. Ruling 1
closed the first — a nation that goes short now suffers, and a hungry one builds claim pressure toward
a neighbour with full fields. **This closes the second.** An earlier session measured **five states
above the national average on both food and energy**, and for those the economy was optional. Now
being rich in fields means having something worth selling *and* a reason to keep one road open.

**It adds nothing to the model.** No new resource, no new number, no supply chain — an existing rule
pointed at a second sector. That is the same test rulings 3–6 were held to.

**Unverified, and flagged as such.** *Where* phosphate, potash and gas actually sit on this map has
**not been checked against data** — E45 lists candidates and calls them unverified, and they stay
unverified here. Nothing in this ruling depends on the locations; the gate works off whatever the
extraction bake says. **Checking them is a build job at the data stage** and must not be done from
memory.

**The consequence that is new, and §4a traces it:** an extraction shortage now causes **famines**, and
therefore **wars**, because food shortage drives claim pressure. Extraction was already the gate on
industry; it is now the gate on eating.

---

### Ruling 8 — money buys the vote, not the region

**RULED 14 September 2026**, answering **Q7** and closing **I7** and **I8**. Aaron, verbatim: *"money
buys the vote, not the region"*.

**What is accepted.** A government may **spend money to swing a referendum** — F21, funding propaganda,
which is round 1's S26 pointed at a vote instead of at a region. It lands on machinery round 3 already
built and becomes the third point on a scale that already has two: **a vote can be rigged** only when
civil liberties have already fallen below `election.stealBelow` = **0.32**, and rigging costs **0.12**
more. **Propaganda is the same act with a different bill** — open, legal, and paid in cash.

**The shape round 3 found twice, arrived at a third time:** a decent government's options are expensive
and public; a rotten one's are cheap and quiet.

**What is refused, and the reason is this morning's other ruling.** **S26 — buying a restless region
off — is dropped.** It would have worked by lifting that region's quality of life, and **ruling 2
removed the thing it acts on**: quality of life is one national number, so there is no regional mood to
purchase. Spending to lift the national figure is not buying a region off; it is being richer
everywhere.

**This is a consequence of ruling 2 and not an independent judgement**, and it is recorded that way so
that whoever revisits ruling 2 knows S26 comes back with it. **F25 is the route**; if regional quality
of life is ever built, S26 is live again and should be re-asked rather than assumed dead.

**One default taken inside this ruling.** F21 asks whether the spending is **visible to the other
side**. It is — and that follows from the ruling rather than being a new choice, because the whole
distinction between propaganda and rigging is that one is open and one is hidden. *Hidden spending
would just be a quieter rig, which is the thing the scale already has.*

**Two of F21's questions are NOT answered here and go to the design stage**, because both change what
the player does rather than what money is worth: whether the spending **moves the vote or only the
turnout**, and whether **the movement can spend too** — which would turn a referendum from a purchase
into a contest.

**The number is not set.** How much swing a given spend buys is a measurement and belongs to the
mechanics stage, beside the other deferred figures.

---

## 4a. How the six sectors feed each other

**Written 14 September 2026 at Aaron's request** — *"it would be good to work out how each resource
interacts with each other."* Assembled from spec §3.2, §3.3 and §3.4 plus ruling 7. **Nothing here is
invented**; it is the existing model read as a network rather than as six separate tables, which is the
first time anyone has done that. The findings at the end are what fell out of doing it.

### What each sector needs, and who needs it

| Sector | Its need comes from | It is throttled by |
|---|---|---|
| **Agriculture** (food) | **People.** Straightforwardly population, nudged by quality of life | **Extraction** — *new, ruling 7* |
| **Resource Extraction** (and **energy lives here**) | **Factories, mostly** — manufacturing capacity at 0.6, plus a small slice of population | Nothing. **It is the top of the chain** |
| **Manufacturing** | **People and upkeep** — population at 0.3, plus whatever infrastructure costs to maintain | **Extraction.** Capped at the extraction ratio in deficit, at **40%** in crisis |
| **Trade & Transportation** (logistics) | **Everything that moves** — all internal volume *plus every leg of every trade deal* | Its own capacity |
| **Finance** | **Debts and government** — debt service plus government spending | **Nothing physical.** It is the one sector a blockade cannot touch |
| **Information Technology** | **People and factories** — both, at 0.05 | Manufacturing, in practice |

### What breaks when each one runs short

| Short of… | What actually happens |
|---|---|
| **Food** | Quality of life falls hard (−30 in crisis), anger rises every turn, **army readiness drops 20** — and claim pressure builds toward every neighbour with a surplus, unlocking grounds for war at 50 |
| **Extraction** | **Factories capped at 40%.** Admin costs up a quarter. Quality of life down. **And now the farms throttle too** |
| **Manufacturing** | **Military equipment halved.** Infrastructure repair stops. Quality of life down |
| **Logistics** | **Routes start failing outright** — 10% a turn each — and **a fifth of everything in transit is simply lost.** Tolls cost more |
| **Finance** | Cannot service debt, **credit frozen**, real risk of default each turn |
| **IT** | **You negotiate blind** — other nations' figures come to you wrong by up to 40% — and a quarter of your tax revenue leaks away |

### The five loops, and two of them are dangerous

**1. The logistics death spiral, and it is the nastiest thing in the model.** Logistics demand counts
**every leg of every trade deal**. So: you go short of something → you import it → that raises the
volume you are moving → which pushes logistics toward deficit → which makes routes fail and loses a
fifth of what is in transit → **so less of the thing you were importing actually arrives** → so you
import more. **The cure feeds the disease.** A nation can be destroyed by its own attempt to fix a
shortage, and nothing currently stops it.

**2. The extraction squeeze does not self-correct.** Extraction demand is driven by manufacturing
**capacity**, and capacity is frozen by geography — only *utilisation* falls when a shortage bites.
**So idle factories go on demanding ore they cannot use.** The shortage does not ease as output
collapses; it persists at full strength until you import or your economy shrinks. Whether that is
right is a judgement — your factories do still want the ore — but it means **there is no automatic
relief valve anywhere in the chain**.

**3. Extraction now reaches all the way to war.** Short of extraction → farms throttle → food short →
claim pressure against a neighbour with fields → grounds for war at 50. **A mining shortage becomes an
invasion**, in four steps, all of them already written. *This is scenario 4 — the hungry nation with an
army — assembling itself out of the existing rules, which is the strongest evidence yet that ruling 1
was right.*

**4. IT is a slow tax on everything.** Short of IT and you lose a quarter of your tax take *and*
negotiate against figures that are wrong by 40%. Poor information makes for bad deals, bad deals make
for less money, less money makes it harder to fix the IT. **Quiet, compounding, and never a crisis** —
the right shape for it.

**5. Finance floats free, and that is deliberate.** Its demand is debt and government spending, neither
of which crosses a border. **A blockaded nation's banks keep working** while its farms and factories
stop — which is exactly what E6 argued and is worth keeping.

### Findings

**Finding D — Resource Extraction is now doing three jobs, and it is the single point of failure.**
There is no energy sector, so **energy lives inside extraction** alongside ore and — after ruling 7 —
fertiliser. One shortage therefore hits **fuel, industry and food at once.** That is true to life: the
1970s oil shock raised food prices precisely because fertiliser is made from gas. But it means the
whole model has **one upstream chokepoint** and no diversity of failure. *Owner: the alpha. It is
either the best thing in the model or the most brittle, and paper cannot tell which.*

**Finding E — the logistics spiral needs a brake, and the round should say so before the design stage.**
Loop 1 is a genuine runaway with nothing damping it. Three candidate brakes exist already and none is
chosen here: logistics capacity could rise with the volume being moved rather than staying fixed;
transit losses could be capped; or the world market's shipping cap could bind first. *Owner: the design
stage. Recorded now so it is designed rather than discovered in a play test.*

**Finding F — water and energy are necessities with no home in the model.** The idea bank names three
necessities — food, water, energy (E8). The six sectors have a home for food, **energy hides inside
extraction**, and **water appears nowhere at all.** Ruling 1 froze the sector list, so this is not a
defect to fix here; it is the boundary of what the current model can express. *Water is **Q10** and
still open.*

---

## A. What a resource fundamentally is

**E1 — A resource is a thing you need a certain amount of, not a thing you own.** *(Aaron, 6 Sep)*
Food should be a resource that is traded, and you need to reach a certain amount to feed your
citizens. The number that matters is not how much you have but how much you have *against how much
you need*.

**E2 — One number is currently doing two jobs, and they are unrelated.** *(6 Sep)* A sector's share
of the economy is being used as both "how much this is worth" and "how much of it you need". Farming
is 0.9% of the American economy and the first requirement to stay alive.

**E3 — GDP and trade are not the same thing.** *(6 Sep)* GDP measures value added where it happens;
trade is what physically moves. A county full of insurance offices posts enormous output and puts
nothing on a lorry.

**E4 — Three tiers, each with its own zero.** *(Aaron, 6 Sep)* Necessities run −1 to 0, where zero
means *fed* and there is no reward above it. A middle tier runs −0.5 to +0.5 around what you need. A
wealth tier runs 0 to +1 with no floor and no requirement. Each tier gets its own scale so they
never have to be converted into one another.

**E5 — Or: one rule, two customers.** *(Claude, 6 Sep)* Every resource has a requirement and a
supply; divide one by the other and you have its coverage. Below enough, things go wrong; above
enough, you have something to sell. The only difference between the tiers is *who* is short — the
people, or the factories.

**E6 — The wealth tier is just money.** *(6 Sep)* No floor and no need means "more is better", which
is the definition of income. But the *sources* still differ in how they fail: money from finance
keeps arriving under blockade, money from shipping stops when the ports close, money from knowledge
needs an educated population that can leave.

**E7 — A full belly is not a reward.** *(6 Sep)* Surplus food does not make your people happier. It
makes you money. Whatever shape the model takes, the asymmetry between "short" and "spare" has to
survive.

---

## B. Necessities, need, and what shortage feels like

**E8 — The three necessities are food, water and energy.** *(Aaron, 6 Sep)*

**E9 — Measure necessities in physical units, not money.** *(Aaron, 6 Sep)* Calories, litres,
megawatt-hours. The point is that cutting a nation's imports and watching its factories stall three
turns later only works if the thing flowing is tonnes and calories rather than dollars.

**E10 — Calories per person per day, because it scales itself.** *(Aaron, 6 Sep)* California needing
eighty billion calories is frightening and meaningless. "Your people are eating 1,840 calories a
day" is a sentence anyone can act on, and a nation of forty million and one of six hundred thousand
read the same number and both understand it.

**E11 — The famine bands.** *(Aaron, 6 Sep)* Under 1,000 total famine; 1,000–1,250 severe rationing;
1,250–1,500 rationing; 1,500–1,750 food shortages; 1,750–2,000 food insecurity; 2,000+ adequate.

**E12 — Or move the top band to 2,100**, so "adequate" means what humanitarian standards mean by it.
*(Claude, 6 Sep — and the 2,100 figure is from memory and unverified.)*

**E13 — The requirement itself can be raised deliberately.** *(Aaron, 6 Sep)* Working a population
harder for a war effort might set the bar at 2,100 instead of 2,000.

**E14 — Only give a resource a physical unit if the player already has a feel for it.** *(Claude,
6 Sep)* Calories qualify. Megawatt-hours per person per day do not. Everything else reads as a
percentage with a consequence attached.

**E15 — The three necessities should differ sharply in how fast a shortfall can be fixed.**
*(Aaron, 6 Sep)* Food is fast — a season, frightening and survivable. Energy is medium — burn more
of what you hold, but new generation takes years. Water is nearly immovable: you cannot decide to
have more rain.

**E16 — Two numbers give you that character: a buffer and a rebuild time.** *(Claude, 6 Sep)* How
long you can go without noticing, and how long it takes to put right. Food: a year of silos, fixed
in a season. Water: no buffer at all, and effectively never fixed.

**E17 — Bands with named effects.** *(economy brief)* Crisis, deficit, met, surplus, glut — each
firing an event the journal can print, and each with its own consequences per resource.

**E18 — Food storage as silos measured in turns of national consumption.** *(economy brief)* Surplus
fills storage freely; only volume above capacity counts as a glut.

---

## C. Making more of something

**E19 — A county does not have a resource, it has a capability and a current allocation of it.**
*(Aaron, 6 Sep)* Utah farmland can grow alfalfa or wheat; the land is the capability and alfalfa is
merely what it is doing. When nobody wants alfalfa and everybody wants calories, the allocation
moves. Nothing is built; something existing is pointed somewhere else.

**E20 — What a county exports stops being a label and becomes a consequence.** *(6 Sep)* It is
whatever it produces far past what it consumes.

**E21 — Feeding yourself makes you poorer.** *(6 Sep)* Every acre growing wheat is an acre not
earning. The trade-off should be real and it should sting.

**E22 — Some places simply cannot.** *(Aaron, 6 Sep)* The Bay Area has no arable capability, so it
must buy. That stops being an assertion and becomes an output of the model.

**E23 — Allocation moves automatically, following need and price.** *(Aaron, 6 Sep)* Nobody wants to
hand-farm sixty-one countries.

**E24 — The player can override it, and overriding costs something.** *(Aaron, 6 Sep)* Direct the
economy, subsidise, ration. Directing an economy costs something.

**E25 — Capability for farmland only, or for everything?** *(open)* One lever — how much of your
farmland feeds you versus earns — is small. The same idea across all industries is a general-purpose
reallocation engine.

**E26 — Money builds capacity.** *(Aaron, 6 Sep)* The Bay Area buying food is one thing; the Bay
Area buying a *fertilizer plant* is the other, and only the second changes the map permanently.
Buying a meal is a choice you make again next quarter; buying a factory is a choice you make once.

---

## D. The production chain

**E27 — Four stages, each converting the one before it.** *(Aaron, 6 Sep)* Extraction produces raw
resources; processing produces materials; manufacturing produces goods; and a fourth stage produces
capital goods.

**E28 — The fourth stage is capital goods, not "better goods".** *(Aaron, 6 Sep)* Stage three makes
what *people* consume; stage four makes what *the economy* consumes. Bread versus the oven.

**E29 — The loop is the point.** *(6 Sep)* Stage four makes the industrial equipment stage one needs
and the factories stage three needs, so the economy builds its own tools.

**E30 — Which means you cannot bootstrap.** *(6 Sep)* Advanced factories are required to make
advanced factories.

**E31 — And losing stage four does not kill you immediately — you slide, visibly, over a decade.**
*(6 Sep)* That is the right feeling for a fractured continent.

**E32 — The inputs, at the broad level:** raw resources; labour, educated and manual; industrial
equipment; manufacturing equipment; infrastructure; energy. *(Aaron, 6 Sep)*

**E33 — Nothing wears out, and it should.** *(6 Sep)* Without depreciation, capital goods become a
one-off purchase. With it, every country needs a permanent trickle just to stand still, and a
country cut off from it slides rather than collapsing.

**E34 — No lag and no stockpile.** *(6 Sep)* Ore should become steel next turn and a machine the
turn after, with inventory in between. Without stock, a severed input is instant famine — punishing
once. With it, the player gets a visible countdown and a chance to act.

**E35 — Minimum viable scale.** *(6 Sep)* A refinery, a fab, a smelter and a fertilizer plant each
have a smallest economic size. A nation of two million cannot run one at any price. This is the
arithmetic that *forces* trade rather than encouraging it, and gives small nations a structural
reason to unify.

**E36 — Labour is not fungible.** *(6 Sep)* A miner is not a fab technician.

**E37 — And educated labour leaves.** *(6 Sep)* It takes a generation to make and a year to lose,
and when a country goes badly the educated go first — so advanced capacity can be destroyed by
emigration without a shot fired.

**E38 — Water belongs in the input list**, for refineries, power-station cooling, semiconductors and
above all agriculture. *(6 Sep)*

**E39 — Or: cut the chain entirely and keep only the pattern.** *(Claude, 6 Sep)* The lesson of the
worked examples was never "model eight steps", it was *one invisible input is enough to ruin you*.
Give each necessity exactly one and no necessity two.

**E40 — Capability that is not fed decays.** *(Claude, 6 Sep)* Farmland without fertilizer yields
less next year. A cheap version of depreciation that does not need a capital-goods system.

---

## E. The invisible layer

**E41 — Between ore in the ground and a thing on a shelf sits a layer of processed intermediates
that only a few places make.** *(Aaron, 6 Sep)* This is where a broken continent actually hurts,
because these take years to build and cannot be improvised.

**E42 — The filter for what earns a place.** *(6 Sep)* An input qualifies only if it is all three
of: **essential** (production drops sharply without it, not merely gets dearer), **concentrated**
(not everyone has it, so it must cross a border), and **slow to replace** (it cannot be fixed inside
a few turns). Fertilizer passes all three. Sand passes none. Semiconductors pass spectacularly.

**E43 — Fertilizer is the canonical example.** *(Aaron, 6 Sep)* It is three separate things —
nitrogen from natural gas, phosphate mined in few places, potash in fewer still — and losing any one
drops yields hard. An invisible input standing between a country and famine.

**E44 — One invisible input per necessity, and no more.** *(Claude, 6 Sep)* Fertilizer behind food;
refining behind energy; **nothing** behind water — and that is the point of water.

**E45 — Candidates on this map**, all unverified: potash from Canada; refining on the Gulf Coast
with the continent fed by pipeline from Texas and Louisiana; the grid already being three separate
machines, with Texas islanded in real life; steel in the Ohio Valley; phosphate in Florida and
Idaho; nitrogen wherever the gas is; soda ash in Wyoming.

**E46 — Nine tracked quantities, or four?** *(open)* The original conclusion was roughly nine —
four or five foundation inputs plus a small number of essential, concentrated, slow intermediates.
The simplification pass argued four, plus two arrows.

---

## F. Water

**E47 — Water may be the best resource in the game.** *(Aaron, 6 Sep)* It is the only one that
arrives by **geography rather than by trade**.

**E48 — It flows downhill across borders whether anyone agrees or not.** *(6 Sep)* An upstream
nation can simply turn it off. Every other resource needs a deal; water needs a river and the will
to dam it.

**E49 — Water is an industrial input as well as a human one.** *(6 Sep)* Refineries, cooling,
semiconductors, and above all agriculture. Putting it in both places is what connects the two
systems.

**E50 — A water crisis is categorically worse than a food crisis** — not because the number is
bigger, but because nothing you do this decade changes it. *(Aaron, 6 Sep)*

**E51 — The rivers in the game are the wrong rivers.** *(Claude, 6 Sep — measured)* The four
corridors were baked from the navigable-waterways layer: they are shipping lanes, with no flow, no
volume and nobody upstream taking any out. The Colorado — the actual water fight — is absent
entirely, because it is not navigable. So water needs a dataset the project does not have.

**E52 — Build water last, or invent it now?** *(open)* Food, energy and materials can be built on
measured data. Water cannot.

---

## G. Geography, rivers and routes

**E53 — The rivers are the argument the whole map rests on.** *(Aaron, 5 Sep, F6)* The United States
holds more navigable internal waterway than the rest of the world combined, and moving heavy goods
by water costs a fraction of moving them by land. A game about America fracturing in which the
rivers do not matter has thrown away the thing that made America rich.

**E54 — Hold both banks, or pay whoever holds the other one.** *(F6)* Measured: 213 county pairs
face each other across a navigable river, and on the opening board all 213 have different owners.

**E55 — The chokepoint chain.** *(Aaron, F6)* Illinois falls out with Michigan, so Michigan will not
let its ships through the Detroit River; it pays a toll; then New York charges it again at Niagara;
then it needs a separate agreement with Canada to reach the open market. Three tolls and a foreign
agreement to sell a bushel of wheat.

**E56 — Over short distances, is a ship really cheaper than a lorry?** *(Aaron, 5 Sep, F13)* Water
wins decisively over long hauls and loses over short ones, because loading and unloading costs the
same whether it sails fifty miles or five thousand. The game has no distance and no transhipment
cost, so it currently says a ship is always better for the wrong reason.

**E57 — "Find me a way out."** *(Aaron, 5 Sep, F9)* The player asks the game for the three cheapest
ways to reach the ocean, sees who they would have to persuade for each, and picks — on information
the game does not have, like which neighbour they are about to invade.

**E58 — Ask the map where you could go.** *(Aaron, 5 Sep, F10)* Pick a destination and the map draws
the routes you *could* have in faded versions of the colours it uses for the ones you *do*.

**E59 — The canal is shut, and nobody is told.** *(Aaron, 5 Sep, F12)* The Panama Canal being closed
to former American states is not only a consequence of the collapse, it is part of the cause — a
navy that cannot move between its own oceans is two navies. The rule is built; the story has never
been told to a player.

---

## H. Trade as an instrument

**E60 — Breaking a deal early, and paying for it in reputation.** *(Aaron, 5 Sep, F2)* You can walk
out of a deal before its term, and the price is not paid to the partner — it is paid to everyone.
Every other state becomes warier of signing with you, and it shows up as a worse price. It decays,
so a reputation can be rebuilt.

**E61 — A tax on particular goods crossing a border.** *(Aaron, 5 Sep, F5)* Not only a percentage
toll on everything, but a set tax on certain goods.

**E62 — Bundled deals.** *(Aaron, 5 Sep, F8)* "Pay us at both ports and the rail toll is free." One
negotiation covering several agreements, where one leg is discounted to make another palatable.

**E63 — Tolls as a bargaining chip inside a trade negotiation.** *(Aaron, 5 Sep, F11)* "I'll accept
your rate, if you give me free transit to the Dakotas."

**E64 — A buyer with no alternative should pay visibly more.** *(deferred #8)* The lever exists in
the model and reaches no screen. The missing piece is not the slider — it is a representation of
*alternatives*: how many other nations could the buyer plausibly get this from, and reach?

**E65 — The outside world has no idea what it wants.** *(deferred #12)* Canada, Mexico and the world
market have no demand at all. What an outside market demands is exactly what a resource model
decides.

**E66 — Nothing in the game currently rewards timing.** *(measured, 5 Sep)* Over ten years the
largest sector price moved 4.7%. Prices are too flat for a fixed-price contract to be a gamble.

---

## I. Infrastructure you can build

**E67 — Using somebody's port is not the same as using their road.** *(Aaron, 5 Sep, F4)* A port
grant puts their cargo through your cranes and your people, and every ton of theirs you handle is a
ton of your own you cannot. It should cost more, and it should eat into the host's own capacity.

**E68 — Ports are not interchangeable.** *(Aaron, 5 Sep, F7)* Real tonnages exist in the dataset the
map was baked from and are currently thrown away: today Los Angeles and a barge dock count the same.

**E69 — Infrastructure can be built.** *(Aaron, 5 Sep, F7)* Ports, railways, roads — at a price in
money and turns.

**E70 — And where you can build, and what it costs, depends on the ground.** *(Aaron, F7)* Some
coastal counties have no port because nobody lives there; some because the geography is hopeless. A
nation whose only coast is the second kind can still build, and should pay through the nose.

**E71 — Building is the third answer to a hostile neighbour.** *(Aaron, F7)* "You can add rail if
you'd rather not attack an enemy to get somewhere by rail." Every route out of a landlocked country
currently ends in somebody else's hands: you ask, you pay, or you invade. Capital infrastructure is
slow, expensive, and yours.

---

## J. Consequences, politics and people

**E72 — Interest groups who can be angry with you.** *(Aaron, 5 Sep, F3)* A food glut collapses
farm-gate prices and the farmers are furious; a manufacturing glut and the industrialists are. The
difference between "the country is unhappy" and "the farmers are furious with you".

**E73 — Hunger should generate claims.** *(economy brief)* A starving nation has a reason to want its
neighbour's fields, and that reason should be legible.

**E74 — Shortage should reach the political layer, not only the treasury.** *(6 Sep)* Heavy
penalties, unrest, and faster secessionist pressure.

**E75 — Being rich and being safe are different things.** *(6 Sep)* The five things that decide
whether a nation survives — water, food, energy, materials, consumer goods — are about 12% of the
economy between them. The four that decide whether it is powerful are the other 88%. A rich nation
can be one bad harvest from crisis while a poor one is unconquerable because it feeds itself.

---

## K. The shape of the sectors, and honesty about data

**E76 — Fifteen BEA industry lines sum to exactly 100%.** *(measured 6 Sep)* Finance 21.4%,
professional services 13.0%, government 11.3%, manufacturing 9.8%, education and health 8.7%,
retail 6.3%, wholesale 5.8%, information 5.4%, construction 4.5%, arts and hospitality 4.4%,
transport 3.4%, other services 2.1%, utilities 1.6%, mining 1.4%, agriculture 0.9%.

**E77 — A seventh, non-traded bucket.** *(6 Sep)* Government, health, education, hospitality and
other services are 26.5% of the economy and none of it ships. Today those are smeared across the six
game sectors, which is why every sector reads larger than it is.

**E78 — Eight sectors:** food; energy; materials; industry; building; logistics; capital; services.
*(6 Sep)*

**E79 — Ten sectors:** the eight, splitting heavy industry from consumer goods, and adding water.
*(6 Sep)*

**E80 — Water has no industry line at all**, because it is geography rather than industry. That is
exactly why it works: no value and absolute need, so it cannot be bought out of trouble, only shared
or fought over. *(6 Sep)*

**E81 — Resources could sit on top of the six industries rather than replacing them.** *(Claude,
6 Sep)* The industries stay what you trade; the resources are what the trade is *for*. Nothing
already built has to change subject.

**E82 — Or the six could be re-cut entirely** to match what a resource model needs, at the cost of
every deal, corridor and screen changing subject.

**E83 — The Freight Analysis Framework.** *(6 Sep)* A federal dataset of what physically moves
between places, by commodity and by mode. It is the right data for a trade model and the wrong data
for a GDP model — and it describes flows as they were when America was one country with no internal
borders, which is exactly the baseline this game needs. Not fetched; that reaches off Aaron's
machine.

**E84 — Every quantity should say where it comes from.** *(Claude, 6 Sep)* Measured from a file,
invented as a placeholder, or still to be asked about — marked as such at the point it is defined,
so nothing invented can be mistaken for something counted.

---

## L. Inherited from the story of the break-up (6 September)

Filed here from round 1. The story is recorded in `secession-ideation.md` §8; these are the parts
of it that belong to the economy, left as questions.

**E85 — The opening is an energy shock.** Texas's war halted oil production; gas could not leave
Texas because the United States would not recognise its successors; "extreme gas shortages" broke
the people's trust in Washington. Does the economy open in that state — fuel short everywhere,
prices high, supply chains broken — or at its 2024 equilibrium as today? *Built: the economy opens
at its published figures; the recognition trade block is exactly the mechanism the story describes.*

**E86 — A corridor can be overloaded.** With the mountain states cut off, "all trade and
transportation was funnelling down through Arizona… stressing Arizona's freight transportation
capabilities." Does a corridor have a finite capacity that congests when everyone uses it? *Built:
capacity belongs to a nation — its ports, rail hubs and gateways — and caps what it can move; a
corridor has no capacity of its own.*

**E87 — What a bloc does to an economy.** The Farmers Union protects its members' farming and their
corridors to Canada and down the Mississippi. Free transit inside, a common front outside, price
supports, shared storage? *(The relationship is diplomacy's; what it does to prices and routes is
this round's.)*

**E88 — Stateless ground charging tolls.** Wyoming as a tier-3 zone, "mainly just charging tolls to
anyone shipping food to Deseret and new Idaho." Can ground with no state grant a corridor and take a
toll, and where does the money go?

**E89 — Refineries as prizes.** Houston wanted Louisiana for "Mississippi access and the oil
processing plants." The story reaches for the refining arrow (E44) and treats refineries as assets
that can be taken by force. Are they places on the map?

**E90 — Free trade as two corridors.** The New England–Rochester "free trade deal" is really mutual
transit at no toll in both directions, giving the Great Lakes a route to salt water that competes
with the Canada corridor for the first time. Zero-toll corridors; and a term four times longer than
the built five-year maximum.

**E91 — The money.** The dollar, the federal debt and federal transfers — still unaddressed by the
story. A state that lived on federal money opens richer than it should.

**E92 — Federal land.** Still unaddressed. Most of the West's ground was federal, and the Sagebrush
Rebellion's authored goal is to get it back.

**E93 — A new country's people will go hungry for it, for a while.** *(Aaron, 7 September —
secession S65.)* If realisation brings a fervour in which citizens "overlook certain things", one of
those things is shortage. So the same food coverage should hurt a two-year-old country less than a
settled one — and hurt it much more when the fervour runs out. The economy decides how far that
tolerance stretches and whether it applies to hunger at all, or only to money. *(Politics owns the
fervour itself; this is the part that lands here.)*

---

## Questions we have no idea for yet

These are not ideas. They are holes, recorded so that ideation can aim at them.

1. **What makes a nation want to trade rather than merely benefit from it?** The known hollow spot:
   today, nothing bad happens to a nation that does not trade.
2. **What does an outside market want?** Canada, Mexico and the world have no demand.
3. **Where does water data come from**, if water is to be geography rather than invention?
4. **What stops a self-sufficient nation from simply opting out?** Measured: five states are above
   the national average on both food and energy.
5. **What is the player's verb?** Almost every idea above is something that happens *to* a nation.
   Very few are things a player *does* on a given turn.

---

## The state of this document

**Not yet complete, and here is exactly what it is missing**, measured against the three closed
rounds on 14 September 2026.

| | State |
|---|---|
| **The three things at the top of every round** (§0a) | ✅ Written 14 September |
| **What this round owns** (§1) | ✅ Written 14 September, verified against `DESIGN.md` |
| **The inbox** (§2) | ✅ **Nine items carried across 14 September**, seven days late. Three blocked a rule another round had already written; **ruling 1 closed two of them** (finding C). **I1 is the last one open** |
| **The spine** (§3) | ✅ Eleven questions, **now ten** — Q4 was struck as already answered. **Eight ruled**; **two open: Q10 and Q11** |
| **Findings** (§3a, §4a) | Six. **A** closed by ruling 2, deliberately and not in round 1's favour. **B** closed by ruling 1. **C** is mine and earned rule 14. **D, E and F** came out of §4a's interaction map: extraction is a single point of failure, the logistics spiral has no brake, and water and energy have no home in the model |
| **The idea bank** (A–L) | 93 entries, E1–E93. Complete enough to argue from, not yet closed |
| **Rulings** | **Eight.** 1 keeps the written model; 2 keeps one national pot; **3–6 are defaults taken without asking** and want confirmation; 7 gates farmland on extraction; 8 lets money buy a referendum but not a region |
| **The scenarios, traced** | ❌ **None.** Scenario 4 — a hungry nation with an army — is this round's exam |
| **The Tuesday test** | ❌ Unanswered, and recorded as hole 5 below |
| **What this round hands onward** | ❌ Not written |

Ideation is finished when a session can read this end to end and the only new entries are
recombinations of ones already here, when every scenario has been traced, when it has answered what
the player actually does about this on a Tuesday with one action — and when Aaron says so.

*Sources: `docs/design/resources.md`, `docs/design/resources-v2.md`, `docs/FUTURE-IDEAS.md` F2–F13,
`docs/deferred.md` #8 and #12, `docs/spec/economy-system-spec.md` §3. Measured figures from
`build/raw/CAGDP2.zip` and `build/raw/co-est2024-alldata.csv`, 6 September 2026.*
