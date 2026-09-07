# Resources — the simplification pass

**Stage: IDEATION (phase 1). Nothing here is built and nothing here is decided.**
Written 6 September 2026. This is the pass you asked for over `resources.md`, which stays where it
is as the raw material — everything cut from here is still recorded there. `DESIGN.md` remains the
truth about what the game actually does.

**The verdict this answers is yours:** *"I like where this is going but this seems pretty
complicated."* You were right. What follows is the same idea with three quarters of it removed.

---

## The one job

The resource system is not here to model an economy. The game already has one that works — six
industries, prices, surpluses, standing deals, corridors, tolls, sixty nations using all of it.

It is here to fix one thing, and it is written down in the project's own definition of done as the
hole we agreed to leave:

> **Nothing bad happens to a nation that does not trade.**

That is the whole brief. Anything in the resource design that does not make it hurt to be alone is
decoration, and I have cut it on that test.

---

## Cut 1 — the three tiers become one rule

The tiers gave each resource its own zero and its own range: necessities −1 to 0, middle −0.5 to
+0.5, wealth 0 to +1. Three ranges means three systems, and I do not think we need any of them.

Look at what the three tiers actually say:

- Tier 1: you need a certain amount; less is punished; more is worthless.
- Tier 2: you need a certain amount; less is slow; more is sellable.
- Tier 3: you need nothing; more is money.

**Tier 3 is not a resource.** "No floor, no need, more is better" is the definition of income, and
the treasury already exists. It goes.

**Tier 1 and tier 2 are the same sentence with a different customer.** One needs feeding people, the
other needs feeding factories. So there is one rule:

> **Every resource has a requirement and a supply. Divide one by the other and you have its
> coverage. Below enough, things go wrong. Above enough, you have something to sell. There is no
> prize for hoarding.**

The bands that coverage falls into — crisis, deficit, met, surplus, glut — are already written into
the economy brief and partly built. **The asymmetric ranges were a new way of writing a ratio the
project already had.** That is the largest single saving in this document.

The one thing the tiers carried that a ratio does not is worth keeping, and it is one line rather
than a number scheme: **a full belly is not a reward.** Surplus food does not make your people
happier. It makes you money. Write that once and the whole of tier 1's character survives.

---

## Cut 2 — the four-stage chain becomes two arrows

Extraction → processing → manufacturing → capital goods, each needing two kinds of labour, two kinds
of equipment, infrastructure, energy and water, plus depreciation, stockpiles, minimum viable scale
and educated people emigrating. That is not a system inside this game. That is a second game.

And the loop inside it — stage four builds the tools stages one and three need, so you cannot
bootstrap and you slide rather than collapse — is the best idea in the whole conversation. It is
also a decade-scale idea in a game whose next question is whether trading is fun over sixty turns.

**What survives is the pattern, not the chain.** The lesson of your four objects was never "model
eight steps". It was:

> **One invisible input is enough to ruin you.**

So each necessity gets exactly one, and no necessity gets two:

| The thing you need | The invisible thing standing behind it | What it means when it is cut |
|---|---|---|
| **Food** | **Fertilizer** | Your fields are still there and they yield less every year |
| **Energy** | **Refining** | You are sitting on the oil and cannot put it in a tank |
| **Water** | **nothing** | And that is the point — nothing stands between you and the rain |

Two arrows. The pen and the dishwasher tablet do not get their own; their lesson is the arrow
itself, and it is already told twice.

Everything else — capital goods, depreciation, minimum viable scale, labour that is not fungible,
educated people leaving a country that is going badly — goes to the ideas file as one entry. It is
good and it is not now.

---

## Cut 3 — capability and allocation survive, for farmland only

Your alfalfa insight is the best mechanical idea in `resources.md` and it stays: a county does not
*have* food, it has **land**, and food is merely what the land is currently doing. When nobody wants
alfalfa and everybody wants calories, the allocation moves. Nothing is built; something existing is
pointed somewhere else.

Applied to all six industries that is a general-purpose reallocation engine — a big system with a
lot of ways to be surprising. Applied to farmland alone it is **one lever**:

> How much of your farmland is growing food for your own people, and how much is growing whatever
> sells?

Automatic by default, because nobody wants to hand-farm sixty-one countries. Overridable by the
player — direct the economy, subsidise, ration — at a cost, because directing an economy costs
something.

And it keeps the painful part, which is the whole reason to have it: **every acre feeding you is an
acre not earning.** Feeding yourself makes you poorer. That is the correct answer and it should
sting.

---

## So: what the model is, in full

**Four things, and money.**

| | Who needs it | What makes it | How long before it bites | How long to fix |
|---|---|---|---|---|
| **Food** | people | farmland, times how much of it you point at eating | ~4 turns (a year of silos) | fast — a season |
| **Energy** | people and industry | wells, mines, generation | ~1–2 turns of fuel | medium — years for new generation |
| **Materials** | industry | mines and works | medium | medium |
| **Water** | people, farms and industry | **geography** | **none** | **effectively never** |

Two numbers per resource: how long you can go without noticing, and how long it takes to put right.
Those two alone produce the whole character you wanted — **food frightening but survivable, energy
awkward, water a sentence you cannot argue with.** You do not need a separate speed system; the
buffer and the rebuild time *are* the speed.

**Water has no buffer on purpose.** Reservoirs exist, but giving water a cushion would blunt the one
thing that makes it different from everything else on the board. Water bites now and stays bitten.

### One physical unit, not four

`resources.md` wanted calories, litres and megawatt-hours. I would keep **one**.

Your insight about calories is right and it is worth the whole mechanism: *"your people are eating
1,840 calories a day"* is a sentence anybody can act on, and it scales itself — a nation of forty
million and a nation of six hundred thousand read the same number and both understand it.

But megawatt-hours per person per day is not a sentence anybody can act on. Nobody has a feel for
it. So the rule is: **a resource gets a physical unit only if the player already has a feel for it,
and calories is the only one that qualifies.** Energy, materials and water read as a plain
percentage with a consequence attached — *"you are meeting 78% of what you burn; the factories are
on four days a week."*

And the calories are free. You do not track a single one. Coverage of 0.88 against a requirement of
2,100 a head is 1,850 calories, and your famine table reads straight off it.

### On the famine bands

I would **adopt your table and move the top band to 2,100**, so that "adequate" means what the
standards mean by it, and food insecurity runs 1,750–2,100.

Two reasons. It matches the figure humanitarian agencies plan general rations against — **and I
should say plainly that I know that figure from memory and have not checked it against a source
this session, so it wants verifying before it is built on.** And it leaves your later idea room to
work: if a war effort raises the bar, it raises it from a line that is already the honest one.

Under this model that idea is one number. Raising the requirement is the entire mechanic.

---

## Where the numbers would come from, honestly

Measured this session against the federal files already on disk.

| | Source | Status |
|---|---|---|
| **Food capability** | published farm output per county, 2024 | **measured** for 2,726 of 3,127 counties (87.2%) |
| **Energy capability** | published mining, oil, gas and utilities per county | **measured** — mining is published almost everywhere, utilities for 95.0% |
| **Materials capability** | mining plus manufacturing | **measured** for 87.7% |
| **Calories per acre** | — | **invented.** Farm output is a *value*, not a calorie |
| **Fertilizer** | — | **invented.** Placed by hand |
| **Refining** | — | **invented.** Placed by hand |
| **Water** | — | **absent.** See the bad news below |

**The distortion you should know about in the food figure.** It measures the *value* of what a place
farms, not what it feeds. California's almonds and wine are worth a great deal and feed relatively
few people; Iowa's maize is worth less per acre and feeds a continent. So the ranking below is
directionally right and understates the Midwest. That is a real limitation and it is the price of
using data that exists over data that does not.

### And the map it produces is worth having

Food capability per head, against the national average, measured from the 2024 county figures:

| Poorest | | Richest | |
|---|---:|---|---:|
| District of Columbia | 0.02 | South Dakota | 8.07 |
| New Jersey | 0.13 | North Dakota | 7.03 |
| Connecticut | 0.13 | Nebraska | 6.16 |
| Massachusetts | 0.17 | Iowa | 5.87 |
| **Nevada** | **0.19** | Idaho | 3.36 |

Median 0.81. Top to bottom, a spread of **515×**.

Energy is uneven too but differently — a spread of 25×, with North Dakota, Alaska, Wyoming, New
Mexico, West Virginia and Texas at the top and Maine, Washington, Tennessee and Oregon at the
bottom.

**The two maps are almost unrelated. That is the finding.** The correlation between a state's food
capability and its energy capability is **0.211** — near enough to nothing. Which means, of the
fifty-one:

- **23 are below the national average on both.** They need somebody.
- **5 are above on both.** They need nobody.
- **23 have exactly one of the two.** They have something to sell and something to buy.

That is the trade game, and it is not something we have to design. It is already sitting in the
data. Almost half the board is structurally dependent on the day the game opens.

---

## What this collides with

**1. The re-bake and hunger are one job, not two.** The industry re-bake was stopped in September
because farming is baked ten times larger than it really is, and hunger was calibrated against that
inflation — so fixing the data alone starves the continent on turn one. This design is the other
half of that change. **They ship together or neither ships.** That is the sequencing that stopped
the work before, and naming it is most of solving it.

**2. Deals stay on the six industries. Resources sit on top of them.** A deal today carries an
industry and a volume. If resources replaced industries as the traded thing, every deal, every
corridor and every negotiation screen would change subject, and that is all of A1 to A4 rebuilt. So:
**the industries are still what you trade; the resources are what the trade is FOR.** Food is what
farming produces. Nothing already built has to move. This is my call rather than yours unless you
disagree, and I would defend it hard — it is the difference between a fortnight and a season.

**3. It closes a known gap.** Canada, Mexico and the world market currently have no idea what they
want. What an outside market demands is exactly what this design decides, so the gap closes as a
consequence rather than as a job.

**4. And it needs your permission to exist.** The authoritative brief asks for six industries with
bands and derived demand. It does not ask for any of this. Under the project's own rule the default
answer to that is no — so either this becomes an addendum to the brief with your say-so, or it goes
in the ideas file. **I need you to say which.**

---

## The bad news: the rivers in the game are the wrong rivers

`resources.md` says water may be the best resource in the game, and that the rivers, their
chokepoints and their ownership are *already in the game*. The second half is true and does not help
as much as it looks.

I checked. The game's rivers were baked from the commercially-navigable-waterways layer — they are
**shipping lanes**. Four of them: the Mississippi, the Ohio, the Missouri and the Great Lakes, cut
into stretches at fifteen real chokepoints. They carry cargo. They do not carry water: there is no
flow, no volume, and nobody upstream taking any out.

And the river the whole argument rests on is not there. **The Colorado — Hoover Dam, Lake Mead, the
fight Utah and Arizona and California and Nevada are actually having — does not appear anywhere in
the game's data.** It is not navigable, so the layer never included it. The single county in the
whole dataset that names a "Colorado River" is Matagorda, Texas, which is a different river with the
same name. The Rio Grande is absent for the same reason.

So water is not the cheap resource. It is the expensive one, and it needs a dataset we do not have —
who is upstream of whom, and how much each of them takes out. That data exists and is federal and
free, but fetching it reaches off your machine, which makes it your call and not mine.

**My recommendation: design water now, build it last.** Food, energy and materials can be built and
verified on measured data alone. Water joins them when you decide about the data. Nothing about the
first pass has to be undone to add it — water is a fourth requirement, and requirements are the one
thing this model has plenty of room for.

---

## What was cut, and where it went

| Cut | Where it is now |
|---|---|
| Tier 3 as a tier | It was the treasury. Kept only as a note: money from finance survives a blockade, money from shipping does not |
| The −1 to 0 / −0.5 to +0.5 / 0 to +1 ranges | Replaced by coverage and the bands the brief already has |
| Health as a resource | Cut. It is not tradeable and it was carried along by the tier structure |
| Logistics, tier 2 or tier 3 | **Question withdrawn.** Under this model it is neither — it is the corridor system, which is built |
| Extraction → processing → manufacturing → capital goods | Cut to two arrows. The rest to the ideas file as one entry |
| Depreciation, minimum viable scale, non-fungible labour, emigration | Same entry |
| Capability and allocation for six industries | Kept for farmland only |
| Litres and megawatt-hours | Cut. One physical unit, and it is calories |
| Nine tracked quantities | **Four**, plus two invisible inputs behind them |

---

## The worked examples — and this is where a design is tested

Your four objects, traced through the model above. **Two of them come out worse than they went in,
and I would rather show you that than claim four passes.**

### Milk — *partly*

Requirement: people need food. Supply: Wisconsin's farmland (measured at **1.57×** the national
average per head), times how much of it is pointed at eating, times fertilizer coverage, times
energy coverage.

- Cut Wisconsin's fertilizer and its food supply falls **next year** — the cows are still there and
  the feed yield is not.
- Cut its energy and its food supply falls **this quarter** — no refrigeration, no pasteurising, no
  cold chain.

Both stories land, and the second is the one that surprised you in the original tracing. **What is
lost:** milk's shelf life of days. The model gives food a year of silos, and milk does not have a
year. A dairy nation and a grain nation buffer identically, and that is wrong.

### Petrol — *yes*

Requirement: people and factories need energy. Supply: wells, times refining coverage.

Texas measures **3.21×** the national average on energy. Under the model, a nation with Texas's
wells and no refining capacity reads as energy-poor, because the arrow behind energy is refining and
not oil. That is the exact story you found — *the refinery, not the oil* — and it is tellable as
written. **What is lost:** that refineries are built for a specific grade of crude, so the wrong oil
is no better than no oil. One layer too fine.

### Dishwasher detergent — *partly*

A manufactured good: materials plus a great deal of energy. "Congealed electricity, oil and Wyoming"
comes out as **congealed electricity and oil**. The general shape survives — you cannot make things
without power and stuff.

**What is lost is Wyoming.** Soda ash from one state is a third concentrated input, and the model
allows exactly two. This one is a genuine miss and I am recommending we accept it.

### A ballpoint pen — *no*

Not tellable. There is no tungsten carbide in this model and there should not be.

But its *lesson* is tellable, and the lesson was the point: one exotic input nobody can see is
enough to stop you making something you obviously know how to make. That sentence is fertilizer and
it is refining. **The object fails and the idea it taught is load-bearing in two places.** I think
that is the right trade, and it is worth saying out loud that it is a trade.

---

## And five things that should happen in play

The four objects test whether the model describes the world. These test whether it makes a game.

**1. Nevada and Iowa, turn one.** Near-identical populations — 3.27 million and 3.24 million — and
mirror-image maps. Nevada's food capability is **0.19**, Iowa's is **5.87**. Nevada opens in famine
and must buy or die; it has energy at **1.05** to sell and nothing else. Iowa opens with five times
the food it can eat and **0.51** on energy, so it opens cold. *They are each other's answer, and
they are eighteen hundred miles apart.* Everything in between — whose ground, whose river, whose
toll — is the game we have already built. This is the scenario the whole design exists to produce
and it falls out of measured data without anybody tuning anything.

**2. Massachusetts discovers what it is.** Food **0.17**, energy **0.69**, manufacturing at the
national average. A rich nation, one of the richest on the board, that cannot feed or heat itself.
It buys its way out for as long as it can pay — and the moment a corridor closes, wealth stops being
an answer. This is the asymmetry from `resources.md` in play: the things that decide whether you
survive are a tenth of the economy, and the things that decide whether you are powerful are the
rest.

**3. North Dakota needs nobody.** Food **7.03**, energy **6.99**, eight hundred thousand people. One
of only five states above the national average on both. It can sit out the entire trade game — and a
sandbox where somebody *can* opt out is how we find out whether the pressure we have built is real.
If North Dakota wins by doing nothing, the tuning is wrong and we will know by turn forty.

**4. Somebody stands on the Soo Locks.** Fertilizer is the arrow behind food, the potash comes
across the Canadian border, and the Great Lakes reach the world only through Canada — which is
already how the game works. So whoever holds the locks is not charging a toll on cargo. They are
holding a famine two years out, over a gate that already exists, on a map that is already drawn. No
new mechanism at all; the resource is what makes the old one matter.

**5. The Bay Area buys a factory instead of a meal.** California measures **1.77** on food and
**0.66** on energy, and its money is real. Buying food is a purchase that changes nothing — you make
the same choice next quarter. Buying a fertilizer plant changes the map permanently. **Both should
be available and the second should be much slower and much more expensive**, because that is the
difference between surviving and stopping being dependent, and a game about a continent coming apart
should charge properly for the second one.

---

## What I need from you

Four things, in the order they block work.

**1. Does this become part of the brief?** The authoritative brief asks for six industries with
bands and derived demand, and none of the above. Either you approve this as an addendum, or the
right answer is that it goes in the ideas file and we build what the brief already asks for. I
recommend the addendum — the brief's own model is the one that had to be stopped in September.

**2. Water: design now, build last?** That is my recommendation, given the rivers we have are the
wrong rivers. The alternative is inventing the water map, and I would rather not add an invented
resource to a system whose problem is that its numbers are invented.

**3. Do you accept losing Wyoming's soda ash, milk's shelf life, and the pen?** Those are the three
places the simplification bites, they are listed above with what each costs, and I think all three
are worth losing. If any of them is the thing you actually cared about, say so and I will find the
room.

**4. The calorie bands — 2,000 or 2,100 at the top?** I recommend 2,100, with the honest caveat that
the standard I am citing is from memory and unverified.

And one thing that is not a question: **the re-bake and this design are the same job.** Whenever
this gets built, it gets built with the industry data fix in the same change, or the continent
starves on turn one.

---

*Footnotes for whoever builds this. Figures measured 6 September 2026 from `build/raw/CAGDP2.zip`
(BEA county GDP by industry, 2024) and `build/raw/co-est2024-alldata.csv` (Census county population,
2024); baked industry shares from `data/economy.json`; rivers, chokepoints and ports from
`data/county_trade.json`. The 2,100 kcal humanitarian planning figure is from memory and unverified.
`docs/design/resources.md` holds everything cut from here.*
