# Aaron's wiring, sorted against what the game can actually do

**Written 14 September 2026**, at his request: *"take what I wrote and adapt it into something that
would work with the game, and for everything that won't work give me a list and I'll decide what gets
moved to future ideas and what we should make work for the alpha."*

**The source is the Sector Wiring page** — the 35 arrows he drew on the evening of 14 September. The
reading of them is `economy-ideation.md` §4b; this document is the triage.

**Every claim below was checked against `DESIGN.md` or `docs/spec/economy-system-spec.md` on
14 September 2026.** Where something is half-built, it says so rather than rounding up.

**The count:** 7 already work · 4 need one small change · 23 need something that does not exist ·
1 is a duplicate pointing the wrong way. **35.**

---

## A. Already works — seven arrows, nothing to build

These describe something the game or the brief already does. **No decision needed.**

| His arrow | Why it already works |
|---|---|
| **Farms need fertiliser** *(extraction → farming)* | **Ruling 7**, this morning. Already his |
| **Fed people are less angry** *(farming → quality of life)* | Quality of life **rises with food security** — it is one of its three terms |
| **Hungry people stand up to the government** *(farming → separatists)* | A food crisis costs **30 quality of life** and adds **5 grievance a turn** to every Area; quality of life is 17% of why a region turns |
| **Better tech, better army** *(information → army)* | The brief already gives **five military tech tiers** driven straight off the information sector's band |
| **Better finance, better borrowing** *(finance → treasury)* | Finance already sets the **debt ceiling** and the **interest rate** |
| **Bad diplomacy, less trade** *(diplomacy → trade deals)* | Recognition already **blocks** trade outright, and how much they like you already **moves the price** |
| **Better hauling, better trade** *(hauling → trade deals)* | A hauling shortfall already **loses a fifth of goods in transit** and raises tolls 15% |

---

## B. Nearly works — four arrows, one small change between them

**All four are the same change**, and it is the same shape as the fertiliser gate he already ruled.

**His arrows:** ore needs trucks · goods need trucks · food needs trucks · trucks need gas.

**What the game does today:** a hauling shortage loses goods **in transit**. It does not stop anything
being **made**.

**What his arrows say:** a shortage upstream should **throttle production**, not merely tax the
journey. That is exactly what ruling 7 did for fertiliser and farms.

**What it would take:** the same gate, pointed at two more pairs — hauling gated on extraction (gas),
and production gated on hauling. **No new machinery, no new number beyond the coefficients.**

> **Recommendation: do it for the alpha.** It costs the least of anything on this page and it closes
> the one real oddity left in the sector map — that the sector everything depends on cannot currently
> stop anything.

---

## C. Will not work — twenty-three arrows in eight groups

**Grouped by what is missing**, so the decision is per group rather than per arrow. Each says what it
would take and what it already has going for it.

### C1 — Money builds things · 5 arrows · **the biggest thing he drew**

> *"New mines require new capital investments." · "New factories require huge capital investments."
> · "Tech needs huge capital investments." · "An army without finance is no longer an industrial
> complex."*

**What is missing.** Nothing in the game turns money into capacity. A sector's size comes from
geography and from GDP, and **you cannot build a mine at any price.** Finance today is a sector that
earns; in his map it is the thing everything else queues behind.

**What it would take.** A genuinely new system: a spend, a build time, and a capacity figure that
changes. It also reaches backwards — every existing save assumes capacity is fixed.

**What it has going for it.** Banked as **E26** on 6 September — *"the Bay Area buying food is one
thing; the Bay Area buying a fertilizer plant is the other, and only the second changes the map
permanently."* And it is the only thing on this page that gives a rich nation something to **do** with
money besides buy food.

**Against it:** it is the largest build here by a wide margin, and §4a found finance is currently the
one sector a blockade cannot touch — which this would reverse.

### C2 — People work the mines · 3 arrows

> *"People to work the mines." · "Factories need workers." · "Tech needs skilled workers."*

**What is missing.** Population exists, grows, migrates, and already feeds GDP growth — but **no
production anywhere reads it.** A region with no one in it produces exactly what a crowded one does.

**What it would take.** Moderate. The population figure is already per region, so the join exists;
what is new is a labour requirement per sector. **"Skilled" workers is a second, larger thing** —
banked as E36 and E37, where educated labour takes a generation to make and a year to lose.

### C3 — Technology improves everything · 5 arrows

> *"Better tech means better extraction · better factories · better logistics management · better
> farming · better finance."*

**What is missing.** Information does exactly **two** things today: it makes other nations' figures
wrong when you inspect them, and it leaks tax.

**What it has going for it, and it is more than expected.** **IT already compounds GDP fastest of the
six sectors** — so the instinct that technology makes everything grow is *half built already*, just as
a growth rate rather than as a multiplier on output.

**What it would take.** A coefficient from the information sector onto every other sector's output.
Conceptually simple, and it touches all six.

### C4 — Quality of life pushes back on the government · 3 arrows

> *"People with a bad life don't trust the government as much." · "Better life, the more they are
> willing to let the government get away with things."*

**What is missing.** The **electorate already reads quality of life** — it is one of the four things a
government is answerable for at an election. **Authority does not read it between elections.**

**One of the three points the wrong way.** His *quality of life → war weariness* arrow reverses
something already built: **war weariness already feeds quality of life**, not the other way round. His
note is really about a *defensive* war being different, which is a separate idea and a good one.

### C5 — Reputation nobody measures · 4 arrows

> *"People don't like resource extraction in their back yard." · "People like better tech." · "Better
> tech means people like you to get your tech." · "Poorly treated people makes you look bad to
> neighbours."*

**What is missing.** Influence rises with **economic weight, trade reach and alignment abroad** and
falls with conquest, occupation, coalitions and not being recognised. **Not liberties. Not
technology.** And nothing anywhere models a local cost to extraction.

**What it would take.** Each is a small separate term rather than one system — which makes this the
easiest group to take *partially*.

### C6 — Food makes people · 1 arrow

> *"If man's caloric intake is sufficient, he will somehow stagger to maturity, and he will
> reproduce."*

**What is missing.** Population grows at a base rate that **does not read food at all.** A starving
nation grows exactly as fast as a fed one.

**What it would take.** Small — one term on the growth rate. **Worth noting it makes famine
compound**, which nothing currently does.

### C7 — Tired armies fight worse · 1 arrow

**What is missing.** Force is derived from **population, wealth per head, and how well the state
governs and whether its people agree with it.** War weariness is not in it.

**What it would take.** One term. **And it closes a loop that is currently open**: weariness rises
with fighting and today costs you only politics.

### C8 — Better finance, better trade · 1 arrow

**What is missing.** A finance surplus already lets you **lend**; there is no direct link from finance
to getting better terms on a trade deal.

**What it would take.** Small, and it overlaps with the price multipliers the spec already defines.

---

## D. One to delete

**`extraction → finance`, "Capital investments grow resource extraction."** The note describes
finance acting on extraction — which he drew correctly later as `finance → extraction`. **This one
points the wrong way and duplicates that.** *Recommend deleting it; it costs nothing either way.*

---

## The shape of the decision

**Cheapest first**, if he wants an order rather than a yes/no per group:

| | Group | Size | What it buys |
|---|---|---|---|
| 1 | **B — shortages throttle production** | one line | Closes the oddity that the sector everything depends on cannot stop anything |
| 2 | **C7 — tired armies fight worse** | one term | Closes an open loop; weariness currently costs only politics |
| 3 | **C6 — food makes people** | one term | Makes famine compound, which nothing does today |
| 4 | **C4 — quality of life feeds authority** | one term | The electorate reads it already; the government does not |
| 5 | **C5 — reputation terms** | several small | Can be taken in pieces |
| 6 | **C8 — finance improves trade terms** | small | Overlaps what the price model already has |
| 7 | **C3 — technology multiplies everything** | moderate, touches all six | Half-built already as a growth rate |
| 8 | **C2 — people as an input** | moderate | Makes an empty region produce like an empty region |
| 9 | **C1 — money builds capacity** | **large, new system** | The only thing here that gives money something to do besides buy food |

**Nothing in C reopens a ruling.** Every one is an addition to the model Aaron kept this morning, and
six of the nine already exist as ideas in the bank rather than as new inventions.

---

## What Aaron decided, 14 September 2026

**All eight groups in C went to future ideas** — *"lets save those 8 ideas for later to future
ideas"* — and are now **F27 to F34**, ordered cheapest first so the numbering carries the order.

**A ninth was filed without being asked**, because throwing it away would have lost something real:
**F35**, his aside that a *defensive* war should not cost a government what an offensive one does.
It rode in on the one arrow that was pointing the wrong way.

**The errors were fixed** — thirteen changes, pinned to the versions read so nothing of his could be
clobbered. One deleted, one reversed, eight relabelled, four typos including one that said the
opposite of what the arrow meant.

**The vocabulary was the real error and it was mine.** `earns` is retired — he used it five times to
mean *improves* and money never came into it — replaced by the opposed pair **raises** and **lowers**,
with `breaks` reworded to *when this is short, that fails* so it stops doing two jobs.

**One arrow was deliberately left alone:** *farming breaks separatists.* When food runs short
separatists **rise** rather than fail, and no kind fits that cleanly even with five. Forcing it would
have been deciding what he meant.

### ⚠ Section B was never ruled on, and the round's closure does not cover it

**B is not in C and did not go to future ideas.** It was recommended **for the alpha** and Aaron
answered the C groups without answering it. **It remains open**, it is the cheapest change on this
page, and it is carried in **D213** so it cannot be lost.
