# Resources — design note

**Stage: IDEATION (phase 1). Nothing here is built, and nothing here is decided.**
Written 6 September 2026 from a long conversation between Aaron and Claude Code. It exists so the
thinking survives the session. `DESIGN.md` remains the truth about what the game actually does; this
is only what it might do.

**The open worry, stated first because it is Aaron's and it is the most important line in the
conversation:** *"I like where this is going but this seems pretty complicated."* Everything below
should be read as raw material for a simplification pass, not as a plan.

---

## The problem this is trying to solve

**One number is doing two jobs.** A sector's share of the economy is being used as both "how much
this is worth" and "how much of it you need", and those are unrelated quantities.

Agriculture is the clearest case. Measured against real published figures, farming is **0.9% of the
American economy** and simultaneously the **first requirement to stay alive**. In the game today it
is baked at 9.4% — ten times too large — precisely because the model had no other way to express
that it matters.

A second, deeper version of the same problem: **GDP and trade are not the same thing.** GDP measures
value added where it happens; trade is what physically moves. Roughly 60% of a modern economy is
services that never travel. The current trade system derives what crosses a border from a number
that has never described a single shipment. A county full of insurance offices posts enormous GDP
and puts nothing on a lorry.

---

## The proposal: three tiers, with asymmetric ranges

Aaron's structure. The ranges are the move that makes it work — each tier gets its own zero, so the
tiers never have to be converted into one another.

| Tier | Contents | Range | Behaviour |
|---|---|---|---|
| **1 — Necessities** | Food, Water, Energy | **-1 to 0** | Zero means *fed*. No reward above it. Shortfall gives heavy penalties, unrest, and faster secessionist pressure. Surplus is exportable. |
| **2 — Middle** | Health, Resources, Manufacturing | **-0.5 to +0.5** | Measured as plus or minus 50% around need. Shortage slows everything; surplus speeds it up or can be sold. |
| **3 — Wealth** | Information, Finance (and see the note on logistics) | **0 to +1** | No floor, no requirement. More is simply better. |

**Tier 3 collapses to money.** If a thing has no floor and no need, "more is better" is the
definition of income, and the treasury already exists. Worth keeping: the *sources* still differ in
how they fail. Money from finance keeps arriving under blockade; money from logistics stops when the
ports close; money from information needs an educated population that can leave.

**Open: where logistics belongs.** Aaron placed it in tier 3. The argument for tier 2 is Aaron's own
opening premise — that everything reaches a shop through mass producers shipping to central
distribution centres, and that this is what breaks. A nation with warehouses full of food and no way
to distribute it should be in trouble, which is tier-2 behaviour. Unresolved.

## Measurement in physical units

The point of physical units is that they make the brief's central demonstration possible: cut a
nation's imports and watch its factories stall three turns later. That only works if the thing
flowing is tonnes and calories rather than dollars.

- **Food — calories.** Total food grown and imported, divided by population, shown as *calories per
  person per day*. Aaron's insight that this auto-scales: California needing 80 billion calories is
  frightening and meaningless; "your people are eating 1,840 calories a day" is a sentence anyone
  can act on. Gigacalories for the trade screens, per-person-per-day for the player.
- **Water — litres.** Clean drinking water. See the geography note below.
- **Energy — megawatt-hours.**

### The famine bands

Aaron's proposal, with real-world reference points offered against them. **Both the reference figures
and their sourcing are from memory and want checking before anything is built on them.**

| Band | Aaron's range | Note |
|---|---|---|
| Total famine | under 1,000 | |
| Severe rationing | 1,000-1,250 | Sustained intake under ~1,500 is where measurable wasting begins |
| Rationing | 1,250-1,500 | |
| Food shortages | 1,500-1,750 | |
| Food insecurity | 1,750-2,000 | FAO minimum dietary energy requirement sits around 1,650-1,900 |
| Adequate | 2,000+ | Humanitarian emergency ration planning uses **2,100 kcal/person/day** |

One suggested change: extend food insecurity to 1,750-2,100 so that "adequate" means what the
standards mean by it. **Aaron has not ruled on this.**

**A later idea Aaron raised:** the base requirement could be raised deliberately — working a
population harder for a war effort might set the bar at 2,100 instead of 2,000.

---

## How you make more of a necessity

The hole Aaron identified: if food is a quantity, something must be able to increase it.

**The proposed answer — a county does not have a resource, it has a CAPABILITY and a current
ALLOCATION of it.** This is Aaron's own alfalfa story generalised: Utah farmland can grow alfalfa or
wheat; the land is the capability and alfalfa is merely what it is doing. When nobody wants alfalfa
and everybody wants calories, the allocation moves. Nothing was built; something existing was
pointed somewhere else.

What this buys:

- **Turning up food** is shifting allocation, bounded by capability. No new mechanic.
- **The Bay Area cannot do it** — no arable capability, so it must buy. Aaron's example stops being
  an assertion and becomes an output of the model.
- **"What a county exports"** stops being a fixed label and becomes a consequence: what it produces
  far past what it consumes.
- **The trade-off is real.** Every acre growing wheat is an acre not earning. Feeding yourself makes
  you poorer, which is the correct and painful answer.

**Who moves it:** automatically, following need and price — nobody wants to hand-farm sixty-one
countries. The player gets to *override*: direct the economy, subsidise, ration. That should cost
something, because directing an economy does.

### Speed is where the strategy lives

The three necessities should differ sharply in how fast a shortfall can be fixed:

- **Food is fast** — a season. Frightening and survivable.
- **Energy is medium** — burn more of what you hold now; new generation takes years.
- **Water is nearly immovable** — you cannot decide to have more rain. A dam, over a very long time,
  or somebody else's river.

That ordering is the reason to have three tier-1 resources rather than one called "needs": a water
crisis is categorically worse than a food crisis, not because the number is bigger but because
nothing you do this decade changes it.

### Water may be the best resource in the game

It is the only one that arrives by **geography rather than by trade**, and it flows downhill across
borders whether anyone agrees or not. The rivers, their chokepoints and their ownership are
**already in the game**. An upstream nation can simply turn it off — Utah and the Colorado is a real
argument people are having now. Every other resource needs a deal; water needs a river and the will
to dam it.

Water is also an *industrial* input, not only a human one: refineries, power-station cooling,
semiconductors, and above all agriculture. Putting it in both places is what connects the two
systems.

---

## The production chain

Aaron's four stages. Each converts the one before it.

| Stage | Produces | Needs |
|---|---|---|
| **1. Extraction** | Raw resources | Manual labour, industrial equipment, logistics |
| **2. Processing** | Materials | Manual and educated labour, processing plant, energy, logistics |
| **3. Manufacturing** | Goods | Manual labour, factories, energy, logistics |
| **4. Capital goods** | Industrial equipment, manufacturing equipment, advanced military, computers | Educated and manual labour, advanced factories, a great deal of power, resources and materials |

**Stage 4 is not "better goods" — it is CAPITAL GOODS.** Aaron flagged that this stage felt like it
fell apart; the fix is one distinction. Stage 3 makes what *people* consume; stage 4 makes what *the
economy* consumes. Bread versus the oven.

**The loop is the best thing in the design.** Stage 4 makes the industrial equipment stage 1 needs
and the factories stage 3 needs, so the economy builds its own tools. Two consequences fall straight
out: **you cannot bootstrap** (advanced factories are required to make advanced factories), and
**losing stage 4 does not kill you immediately** — you slide, visibly, over a decade.

### The inputs, at the broad level

Aaron's list: raw resources; labour (educated and manual); industrial equipment; manufacturing
equipment; infrastructure; energy.

### What is missing from it

1. **Nothing wears out.** No depreciation, so stage 4 becomes a one-off purchase. Add decay and
   every country needs a permanent trickle of capital goods just to stand still — and a country cut
   off from it *slides* rather than collapsing, which is the right feeling for a fractured
   continent. **This is the single biggest omission.**
2. **No lag and no stockpile.** Ore should become steel next turn and a machine the turn after, with
   inventory in between. Without stock, a severed input is instant famine — punishing once. With it,
   the player gets a visible countdown and a chance to act.
3. **Water is absent from the input list** (see above).
4. **No minimum viable scale.** A refinery, a fab, a smelter and a fertilizer plant each have a
   smallest economic size. A nation of two million cannot run one at any price. This is the
   arithmetic that *forces* trade rather than encouraging it, and gives small nations a structural
   reason to unify.
5. **Labour is not fungible, and educated labour leaves.** A miner is not a fab technician. Educated
   labour takes a generation to make and a year to lose, and when a country goes badly the educated
   go first — so stage-4 capacity can be destroyed by emigration without a shot fired.
6. **Money builds capacity.** Infrastructure is listed as an input but nothing creates it. This is
   where tier 3 reconnects: the Bay Area buying food is one thing, the Bay Area buying a *fertilizer
   plant* is the other, and only the second changes the map permanently.

### Two axes, not one

The **needs tiers** and the **production chain** are different classifications over the same
objects. Food is an extracted resource *and* a processed material *and* a consumer good *and* a
tier-1 necessity, all at once. That is genuinely how it works, but the two want to stay separate
labels or they will tangle the moment anything is built.

---

## The forgotten layer, and the filter

Between "ore in the ground" and "thing on a shelf" sits a layer of processed intermediates that only
a few places make. **This is where a broken continent actually hurts**, because these take years to
build and cannot be improvised.

**Fertilizer is the canonical example** (and the one from Peter Zeihan that Aaron reached for). It
is three separate things — nitrogen from natural gas, phosphate mined in few places, potash in fewer
still — and losing any one drops yields hard. An invisible input standing between a country and
famine.

**The filter for what earns a place in the model.** An input qualifies only if it is *all three* of:

- **Essential** — production drops sharply without it, not merely gets dearer.
- **Concentrated** — not everyone has it, so it must cross a border.
- **Slow to replace** — it cannot be fixed inside a few turns.

Fertilizer passes all three. Sand passes none. Semiconductors pass spectacularly.

### What passes that filter on *this* map

Unverified, and worth checking properly before building on:

- **Potash from Canada.** Canada is already in the game as a flat-rate market with no opinion. Give
  it the potash and it becomes the most important thing on the board — an embargo is a famine two
  years later, travelling through Great Lakes chokepoints that already exist.
- **Refining on the Gulf Coast**, with the rest of the continent fed by pipeline from Texas and
  Louisiana.
- **The grid is already three separate machines** — eastern, western, and Texas alone. Texas is
  islanded in real life, so the mechanic does not have to be invented.
- **Steel in the Ohio Valley. Phosphate in Florida and Idaho. Nitrogen wherever the gas is.**

---

## The worked examples — the test suite for this design

Aaron's exercise: four things he consumed in one day, traced back. **These are to a design what
tests are to code** — the question is not whether the model is elegant but whether it can tell these
stories.

| Thing | What it really needs | Where it breaks |
|---|---|---|
| **Milk** | Irrigated land, fertilizer, diesel, 30-50 gallons of water a day per cow, electricity, refrigeration, natural gas for pasteurising, synthesised vitamin D, polyethylene from natural gas, an unbroken cold chain | **Not cows — fertilizer and cold.** Shelf life in days, so it cannot be stockpiled |
| **Petrol** | Drilling, water, pipelines, refineries built for a *specific* crude grade, platinum/palladium/rhenium catalysts, hydrogen from natural gas, vast cooling water, roughly 10% corn ethanol, seasonal blends | **The refinery, not the oil.** Concentrated, a decade to build, grade-specific. And it contains corn, so it competes with food for acres |
| **Dishwasher detergent** | Surfactants from ethylene or palm oil, fermented enzymes from a handful of firms worldwide, **soda ash mined in Wyoming**, chlor-alkali bleach needing enormous electricity, sodium silicate, petrochemical polymers | **The purest case of the forgotten layer** — congealed electricity, oil and Wyoming |
| **A ballpoint pen** | Polystyrene and polypropylene, petrochemical ink, **a tungsten carbide ball machined to microns**, brass socket, precision tool-steel moulds | **One exotic input is enough.** China could not make good pen tips domestically until about a decade ago despite making the pens |

### What the four have in common

- **They bottom out in the same short list**: energy, water, oil and gas *as raw material*, a few
  minerals, farmland. Four unrelated products, one small foundation.
- **The dangerous input is never the obvious one**, and is invisible in the finished object.
- **Oil appears in two completely different jobs** — fuelling the truck, and *being* the pen. A
  nation with refineries but no petrochemical plants has one and not the other.
- **Two of the four secretly contain farmland.** Petrol has corn in it; detergent's enzymes and
  citrate are fermented from corn.
- **Depth predicts fragility.** Milk is three steps from a field; a pen is eight.

**The conclusion drawn from them:** you do not need a full bill of materials. Four or five
foundation inputs, plus a small number of processed intermediates that are essential, concentrated
and slow to build — fertilizer, refined fuel, basic chemicals, steel, semiconductors. Roughly nine
things, and all four stories are tellable.

---

## Where this was left

**Aaron: "this seems pretty complicated."** The next move is a simplification pass, not more
structure. Open questions carried forward:

1. Can the whole thing be told with about nine tracked quantities rather than a full chain?
2. Does logistics belong in tier 2 or tier 3?
3. Is depreciation in, and at what rate?
4. Do stocks and lags exist, or does a cut input bite immediately?
5. Where does the water data come from, and is the mechanic worth having before the data exists?
6. Aaron's calorie bands — adopt as proposed, or shift the top band to 2,100?

**Also parked and relevant:** the Freight Analysis Framework, a federal dataset of what physically
moves between places by commodity and by mode. It is the right data for a trade model and the wrong
data for a GDP model, and it describes flows *as they were when America was one country with no
internal borders* — which is exactly the baseline this game needs. Not fetched; that reaches off
Aaron's machine and is his call.
