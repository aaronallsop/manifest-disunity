# Future ideas

Ideas deliberately **not** being built now, kept so they are not lost and not re-argued from scratch.

This is not a backlog and nothing here is committed to. An idea earns a place by being worth
remembering; it earns a phase by being asked for. Known defects live in `docs/deferred.md`; decisions
already taken live in `DECISIONS.md`.

**Format.** One heading per idea, newest last, each with: whose it is and when; what it is, in the
owner's words where possible; why it is interesting; what it would touch; and what would have to be
true before it is worth doing.

---

## F1 — Sub-turns: quarterly decisions, monthly execution

**Aaron, 4 September 2026.** Raised while confirming that a turn stays a quarter.

> "I think there might be something later down the road (much later) where I had sub-turns, so like
> you picked your big things at the start of Q1, then you do jan, feb, mar, then big things for Q2
> and so on."

**What it is.** Two clocks instead of one. The player commits to strategy at the top of a quarter —
the annexations, the unions, the trade deals, the things a state decides once and lives with — and
then the three months inside that quarter play out, carrying consequences, arrivals, shortages and
events without reopening the big decisions.

**Why it is interesting.** It resolves the tension that produced the quarter-versus-month question in
the first place, rather than picking a side. A quarter is the right resolution for a *decision*: no
government re-decides its trade posture monthly, and a game that asks you to is a game of admin. A
month is the right resolution for a *consequence*: a food shortage bites in weeks, a corridor closure
is felt immediately, and a calendar that ticks in months reads like a newspaper rather than a
spreadsheet. Sub-turns give each thing its own clock.

It would also make the 1 March 2036 opening land properly. The Texas bicentenary falls on the second
day of play, and a monthly inner clock is what would let the game notice.

**What it would touch.**

- Every rate in the engine is currently per *turn* and tuned as such. Sub-turns mean deciding, for
  each of roughly 335 constants, whether it acts per quarter or per month. That is the same
  re-derivation pass that made the month expensive today — it does not go away, it moves.
- The turn pipeline runs fifteen phases in a fixed order with a strict rule that no phase reads a
  value it wrote. Splitting into an outer and inner loop means deciding which phases run monthly
  (growth, consumption, shortage, migration) and which run quarterly (secession, elections,
  recognition, coalitions). Getting that wrong is subtle rather than loud.
- Save format, the turn counter, the timeline, the journal's turn headers, and every "in N turns"
  countdown in the UI would all need to say which clock they mean.
- The AI takes one action per turn. Sub-turns mean deciding whether that stays one per quarter or
  becomes one per month, which changes the pace of the whole board.

**Before it is worth doing.** The economy needs to exist and be tuned first — this is a change to how
time is spent, and there is no point tuning the shape of a turn before there is something in it worth
spending time on. Realistically it belongs after the economy roadmap completes, and it wants a
playtest behind it showing that players find the quarterly rhythm too coarse to feel consequences.

**What today's decision costs it.** Nothing. Choosing the quarter now is the outer clock of this
design; the inner clock is additive. Choosing the month would have been the harder starting point,
because it would have to be coarsened rather than subdivided.

---

## F2 — Breaking a trade deal early, and paying for it in reputation

**Aaron, 5 September 2026.** Left as a note on the `deal-early-exit` card, alongside approving the
recommendation that A1 not build this.

> "I agree with your recomdation. For the ideas doc, I think that you should be able to cancel a
> trade deal half way through but if you do that should damage your reputation with other nations,
> make other nations hesitant to create trade deals with you (raising the amount they would want
> from you and that would cool down over time)"

**What it is.** A deal can be walked out of before its term. Doing it is not free and the price is
not paid to the partner — it is paid to everyone. Every other state becomes warier of signing with
you, and the wariness shows up as a worse price: they want more to take the same risk. It decays,
so a reputation can be rebuilt by not doing it again.

**Why it is interesting.** It is the first thing in the roadmap that makes a *record* matter. Every
other cost in the game is paid once, at the moment of the act. This one follows you: the deal you
broke in year two is why nobody will give you a fair rate in year five, and no single screen tells
you that — you infer it from the offers getting worse. That is the shape of a consequence worth
having. It also gives the four durations real weight. A five-year deal is only a commitment if
leaving it costs something; without this, the long terms are just a longer number.

It is also the honest answer to the objection against A1's ruling: that a five-year deal signed in
error is a five-year mistake. It is — until this exists, at which point it becomes an expensive
decision instead of a trap.

**What it would touch.**

- The reputation number itself: a new per-nation standing that decays toward neutral, and a rule
  for how much a break costs and how fast it recovers. This is the whole idea; everything else is
  plumbing.
- How another state prices an offer to you. Today an offer's terms do not vary by who is asking.
  They would have to.
- The AI's decision to accept, which would need to read reputation as one more factor — the
  five-factor acceptance model in the roadmap is where this belongs.
- A2 already builds revocation-with-notice for transit agreements, including a notice period and a
  reputation cost. **That is the same machinery.** Build this on top of A2's rather than beside it,
  or the game will have two different ideas about what breaking a promise costs.
- Whether a broken deal is remembered by the injured party specifically, or by everyone equally.
  Aaron's note says other nations plural, so: everyone, with the partner perhaps hit harder.

**Before it is worth doing.** A2 must exist, because it brings the notice-period and reputation-cost
machinery this would otherwise have to invent. It also wants the alpha behind it — the whole point
is that breaking a deal is painful, and there is no way to know whether the pain lands correctly
until deals have been lived with for a few dozen turns.

---

## F3 — Interest groups: farmers and industrialists who can be angry with you

**Aaron, 5 September 2026.** Left as a note on the `factions-approval` card, approving the
recommendation that a glut hit the money and the general mood for now.

> "As far as these factions, lets save this as an idea for later after we build out the factions
> system."

**What it is.** Groups inside a nation with their own approval of the government — farmers,
industrialists, and whoever else earns a name. A food glut collapses farm-gate prices and the
farmers are furious; a manufacturing glut and the industrialists are. The brief already asks for
both consequences; there is presently nothing for them to land on, so they land on the treasury and
the general mood instead.

**Why it is interesting.** It is the difference between "the country is unhappy" and "the farmers
are furious with you", which is the difference between a number moving and a story happening. It
also makes the six industries mean something politically rather than only economically: a state
whose economy is one sector deep has one group who can hold it hostage.

**A naming problem, and it is not cosmetic.** "Faction" is already taken in this game — it means a
nation you can choose to play, rated by how hard it is, and it is used that way throughout the code
and the UI. A second, unrelated meaning would be a permanent source of confusion for everyone who
touches this project afterwards. When this is built it should be called **interest groups**, and
Aaron's "factions system" above should be read as naming the idea, not the eventual label.

**What it would touch.**

- A new per-nation, per-group approval, which is a new system to learn — precisely the kind of thing
  that made the game hard to read and started the strip-back in the first place. It should arrive
  behind the complexity switch like everything else, off by default until it earns its place.
- The economy's price and glut logic, which would need to say which group each movement of a price
  hurts or helps.
- The politics layer, if angry groups are to do anything: withhold support, force a policy, fund a
  separatist movement. Without a consequence, an approval number is decoration.

**Before it is worth doing.** After the economy roadmap completes and has been played. The test is
Aaron's own: play the economy and find out whether he misses them. If a food glut feels like it
should have made somebody angry and it did not, that is the signal.

---

## F4 — Using somebody's PORT is not the same as using their road

**Aaron, 5 September 2026.** Raised while specifying how Canada, Mexico and the world market should
work, in the middle of stage A2.

> "it isn't like I am just going through their ports to the world the same way I am using Nevadas
> roads and rails, but I am actually using their port which requires man power, infastructure, and
> also is a hard limit of how much they can export to the world market as well"

**What it is.** A transit agreement for a road or a railway lets somebody's lorries cross your
ground. A transit agreement for your PORT puts their cargo through your cranes, your docks and your
people, and every ton of theirs you handle is a ton of your own you cannot. So a port grant should
cost more than a road grant, and — the harder half — it should EAT INTO THE HOST'S OWN CAPACITY
rather than being free to give away.

**Why it is interesting.** It turns a port from a permission into a scarce asset. Today a nation
either has export capacity or it does not, and lending a corridor costs the host nothing but the
toll it chose to charge. Under this rule a coastal nation with a big port becomes a genuine hub
whose capacity is fought over — and one that has already sold its dock space to three neighbours has
to decide whether to keep its own goods at home. That is a real strategic position that geography
hands to about a third of the board.

**What it would touch.**

- `Game.tradeCapacity` is currently a per-nation number derived from ports, rail hubs and gateways,
  and it is the volume cap on every standing deal in the game. Making it SHARED between a host and
  its guests changes what that number means everywhere it is read, which is the single most
  load-bearing figure in the economy. It is not a small change and it should not be pretended to be.
- The toll rate would need to differ by mode. That half is nearly free: A2 already grants road, rail
  and port separately, so a higher floor and ceiling for a port grant is a tunable and one line.
- The AI's willingness to grant would need to know that a port grant costs it something real.

**Before it is worth doing.** After the alpha, and after the capacity model has been looked at once
in its own right. The cheap half — a port toll costing more than a road toll — can land much sooner
and is listed as an A2b item rather than here.

---

## F5 — A tax on particular goods crossing a border

**Aaron, 5 September 2026.** Raised alongside F4.

> "the toll/cost of trading with the world, canada, mexico if you have signed a trade deal with a
> coastal city with a port should be much higher and possibly should be a set tax as well for
> certain goods"

**What it is.** Not a share of the money, but a levy on a particular commodity: a fee per ton of
grain, or a flat charge on manufactured goods, regardless of what they sold for.

**Why it is deferred rather than scheduled.** It cannot be built honestly yet. Nothing physically
moves in this economy — settlement is a treasury credit, and a deal's "volume" is a matched surplus
valued at market prices rather than a quantity of anything that leaves one place and arrives at
another. A tax per ton of a good, on an economy with no tons and no goods, would be a number
pretending to be a rule. **It becomes buildable the moment goods actually move**, which the roadmap
places after the alpha, and it should be built in the same pass as that.

---

## F6 — The rivers, and why they matter more than they look

**Aaron, 5 September 2026.** Raised while specifying the external markets, with the reasoning
credited to Peter Zeihan's *The Accidental Superpower* (2014): the United States holds roughly
17,600 miles of navigable internal waterway, more than the rest of the world combined, and moving
heavy goods by water costs a fraction of moving them by land. Zeihan's argument is that this one
geographic fact underwrites American economic power, where China and Germany are limited by not
having it.

**Why this is recorded here and not simply built.** It is scheduled — see the roadmap — but the
REASON belongs in writing, because a future reader looking at four river corridors and fifteen
chokepoints in the data will otherwise assume they are decoration. They are not. They are the
argument the whole map rests on: a game about the United States fracturing, in which the rivers do
not matter, has thrown away the thing that made the United States rich in the first place.

**What is already in the data, baked in July 2026 and never once read by the game:**

- Four named navigable corridors: **Mississippi** (105 counties), **Ohio** (56), **Missouri** (50)
  and the **Great Lakes** (81).
- **Fifteen named chokepoints**, and measured on the opening board they fall to NINE different
  nations: Michigan holds four (the Soo Locks, the Straits of Mackinac, the St. Clair and the
  Detroit River), New York two (Niagara and the St. Lawrence outlet), Illinois two (Cairo and the
  Chicago Sanitary & Ship Canal), Louisiana two — including **the Mouth of the Mississippi**, which
  is a licence to tax everything that floats down from Minnesota. Houston, Virginia, Washington,
  Missouri and the Bay Area hold one each.
- **213 bank pairs** — counties facing each other across a navigable river. Measured: all 213
  straddle different Areas, and on the opening board all 213 have different owners. So "hold both
  banks, or pay whoever holds the other one" is a live question in two hundred places rather than a
  theoretical one.
- 1,216 distinct named rivers across 932 counties, including the **Columbia** (19 counties), which
  answers the open question about Pacific access for the interior northwest: it is there.

**The scenario, in Aaron\'s words, and it is exactly what the data encodes:**

> "I am Illinois and Cook County has the modifiers Port + Great Lakes. So they can trade with every
> other great lakes nation and Canada. But lets say they get into a trade war with Michigan, then
> Michigan isn\'t going to let their ships pass through their choke point. So Illinois has to pay a
> hefty toll to go through their waters. So now they want to trade to the world markets, and now New
> York which has a choke point on the great lakes is going to charge them a toll to get through. And
> then finally they need to sign a seperate agreement with Canada to let their ships pass through
> Canada to get to the open market."

Chicago is 17031 and is Illinois\'s. The Detroit River is 26163 and is Michigan\'s. Niagara is 36063
and the St. Lawrence outlet 36089, both New York\'s. He described that chain from memory and the
dataset agrees with him county for county.
