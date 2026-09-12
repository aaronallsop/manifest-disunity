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

**See also F7**, which carries the other half: ports are not interchangeable, and the real tonnages
are in the dataset the map was baked from. Whoever builds one should build both.

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

---

## F7 — Ports with real sizes, and the ability to build and upgrade them

**Aaron, 5 September 2026.** Raised on confirming that only a real port lets a nation ship abroad.

> "I would want each port to have a limit based on actual data on how big that port is, the ability
> to upgrade ports (and rail and roads as capital infastrucure builds that cost money and time but
> increase the ammount of trade" ... "and also the ability to build ports and those 136 ports we
> would want to analyze them and what are their actual feasibility for building a port there
> (because it might just be because no one is there an it doesn't make sense or it might be beacuse
> its geography makes for a terrible port so if a nation only has that county as a coastal region
> they could build a port there but because it is terible it would cost extra to overhaul it.)"

**Three ideas that belong together**, because each is worth much less alone:

1. **Ports are not interchangeable.** Today every port counts the same: one port is
   `trade.capacityPerPort` of throughput, whether it is Los Angeles or a barge dock. The Principal
   Ports dataset the map was baked from carries real tonnage, so the sizes are available and are
   simply being thrown away.
2. **Infrastructure can be BUILT**, at a price in money and turns — a port, a railway, a road.
3. **Where you can build one, and what it costs, depends on the ground.** Some of the 86 coastal
   counties with no port have none because nobody lives there; some because the geography is
   hopeless. A nation whose only coast is the second kind can still build, but it should pay through
   the nose for it.

**Why it is interesting, and this is the sentence that makes it worth building:**

> "you can also add rail if you'd rather not attack an enemy to get somewhere by rail"

That is the whole argument. Every route out of a landlocked country in this game currently ends in
somebody else's hands — you ask, you pay, or you invade. Capital infrastructure is the third answer:
slow, expensive, and yours. A game where the only response to a hostile neighbour is an army is a
narrower game than one where you can spend ten years and a fortune building your own way round them.

**What it would touch.** `Game.tradeCapacity` stops being a function of what you hold and becomes a
function of what you hold AND what you have built, which means a per-nation build ledger in the save.
The AI needs to know building is an option or it will never do it and the player will out-develop
fifty nations without trying. And it wants a real cost curve, which is a tuning job on top of a
building job.

**Before it is worth doing.** After the alpha. It is a new verb, and the alpha exists to find out
whether the verbs that already exist are any good.

---

## F8 — Bundled deals: pay me at both ports and the railway is free

**Aaron, 5 September 2026.**

> "mississippi could give me a deal, like pay us at both ports but we will give you a discounted or
> free rail toll. The reason why this would be a future idea is that it would have to have logic
> built in and incentives that I don't think are as built out as possible."

**What it is.** A single negotiation covering several agreements at once, where one leg is discounted
to make another palatable. Not "here is my rate for the railway" but "here is my price for the whole
journey across my country, and I have decided how to split it."

**Why it is deferred, in Aaron's own judgement and I agree with it.** Package deals only mean
anything when both sides can value the package, and the AI cannot yet: it weighs one agreement at a
time against its size, its need and its politics. Give it a bundle and it will either take every
bundle or refuse every bundle, and neither teaches anybody anything. The simpler version of the same
idea — a flat discount on tolls between nations that already trade — is scheduled rather than
deferred, and is the thing that will show whether the incentive is interesting enough to build the
complicated version.

---

## F9 — "Find me a way out": the game proposes the routes

**Aaron, 5 September 2026.**

> "lets say that I am Minnesotta and I say that I am trying to reach the world market I could put out
> a bid of proposal (or something else) where the program would go through and analyze every possible
> way to create trading networks (tolls and stuff) to get to the ocean and then it would pick the
> three that would be the cheapest in theory and I could look through them and what all they would
> entail and because I the player know that I plan on attacking iowa in a few turns want to go for
> routes that don't include iowa or something like that."

**What it is.** Instead of the player working out who to ask, the game does: here are the three
cheapest ways you could reach the ocean, here is who you would have to persuade for each, and here
is what each would cost. The player picks — and picks on information the game does not have, like
which neighbour they are about to invade.

**Why it is a good idea and cheaper than it sounds.** The routing engine built in A2 already finds
the best way through for a GIVEN set of agreements. Finding the best way through assuming you could
get agreement from anybody is the same search with the permission check switched off, and finding the
best three instead of the best one is a small change to how the search keeps its results. The genuinely
new work is the screen and the exclusions ("not through Iowa"), not the arithmetic.

**One caution, and it is a real one.** "Analyse every possible way to create trading networks" taken
literally means enumerating every combination of agreements across sixty nations, which is not a
large problem, it is an impossible one. What is tractable — and what actually answers the player's
question — is: find the best routes as if everyone would say yes, then tell them who they would have
to ask. That is a different question with the same answer, and it runs in milliseconds.

**Before it is worth doing.** After the network map exists, because it is that screen with one more
mode.

---

## F10 — Asking the map where you could go

**Aaron, 5 September 2026.** Raised while specifying the network map.

> "there should be a search bar as well that lets me select a nation, mexico, canada, or world and it
> should show potential trade routes to get there (using the same color scheme of rail, road, or
> water but a desatured color)"

**What it is.** The network map draws what you HAVE. This draws what you COULD have: pick any
destination, and the map shows the ways through in the same colours as your real routes, faded, so
the difference between a road you hold and a road you would have to ask for is legible at a glance.

**Why it is separated from the map itself.** The map's first job is to make the network you already
have understandable, and that job is finished before this one starts. This is also the natural home
for F9 — once the map can draw a hypothetical route, showing three of them and letting the player
rule one out is the same screen.

---

## F11 — Trading with somebody should make their tolls cheaper (the general version)

**Aaron, 5 September 2026.**

> "I am Wisconsin and Minnesota wants to trade with me but I don't like their rates but I want to to
> trade with the dakotas. So I say I'll accept that rate as well as tolls for free or reduced rates
> or something like that."

**Status: the simple half is SCHEDULED, not deferred.** A flat discount on tolls between two nations
that hold a live trade deal is going into the alpha, at Aaron's own suggested playtest figure. What
stays here is the general version he described: tolls as a bargaining CHIP inside a trade
negotiation, offered and withdrawn as part of the haggle rather than applied automatically.

That version needs what F8 needs — a counterparty that can value a package — and it should be built
in the same pass as F8 or not at all, because they are the same mechanism seen from two ends.

---

## F12 — The Panama Canal is shut to former American states

**Aaron, 5 September 2026.** Given as the reason the two oceans are separate, while specifying how
coastal shipping should work.

> "For now lets say that diagetically that the Panama Canal isn't letting any former american state
> through so that is why pacific and atlantic are cut off (and diagetically that would help explain
> the split because american navies would have been cut off)"

**Status: BUILT as a rule, recorded here as a STORY that has not been told.** The mechanic shipped
in A2d — a Pacific port and an Atlantic port share no water, and Canada is given no Pacific coast so
it cannot be sailed round the back. What does not exist is any way for a player to find that out.
There is no line of text anywhere in the game saying the canal is closed; a player simply notices
that Seattle cannot ship to Boston and has to guess why.

**Why it is worth telling properly.** The second half of Aaron's note is the interesting half: the
canal being shut is not only a consequence of the collapse, it is part of the CAUSE — a navy that
cannot move between its own oceans is not one navy, it is two. That is a good piece of history for a
game that opens after the fact, and it belongs somewhere a player will meet it: an opening card, a
line in the journal the first time somebody's route is refused, or an entry in whatever eventually
explains the world.

**Before it is worth doing.** Whenever the game gets a place to say things about the world it is set
in. There is not one yet, and inventing one for a single fact would be the wrong order.

---

## F13 — Over short distances, is a ship really cheaper than a lorry?

**Aaron, 5 September 2026.** Raised in the same message, about his own rule.

> "I imagine though that it would make more sense to ship via rail and road for florida and georgia
> than ships right? Or is over the water still shipping cheaper over short distances? Lets save this
> in future ideas"

**The question is sharper than it looks, and the honest answer today is that the game cannot tell.**
Water is cheaper per crossing than rail, and rail than road, and that is the whole of the model —
there is no DISTANCE in it. Florida to Georgia and Florida to Massachusetts cost exactly the same,
because both are one sea link with nobody in between. So the game currently says a ship is always
better, and it says so for the wrong reason: not because water is cheap, but because it does not
know how far anything is.

**In life the answer is that it depends on the leg.** Water wins decisively over long hauls and
loses over short ones, because loading and unloading a ship costs the same whether it sails fifty
miles or five thousand — which is exactly the transhipment cost this model also does not have.

**What would answer it properly.** A real distance between ports, which is measurable from the
county centroids already in the map, plus a fixed cost per port call. Those two together produce the
real-world shape on their own: short sea legs lose to the lorry, long ones win easily, and nobody has
to hand-tune a table of exceptions. It is the same missing piece the coastal-shipping decision named
— see the `coastal-shipping` card on the Control Board — and both should be built in one pass.

**Before it is worth doing.** After the economy alpha. It is a refinement of a mechanic nobody has
played with yet, and the alpha may well say the flat version is fine.

---

## F14 — A turn should arrive as news, not as a number

**Aaron, 6 September 2026, after playing:**

> "The turn system is working but I think that there needs to be a bigger deal for new turn, I am
> thinking that it is a news headline and underneath it is something that is going to impact the
> game mechanics and there are some that are RNG for the whole game and for the beta we would create
> some for 10 of the nations."

**What it is.** A new turn currently changes a counter. This makes it an event: a **headline**, and
underneath it **something that actually moves a rule** — not flavour text over an unchanged world.
Three tiers, and the tiers are the design:

1. **World events**, drawn at random, that hit everybody — a commodity shock, a bad winter, a
   financial panic. These are the ones that make two games of the same map play differently.
2. **National events**, hand-written for about ten specific nations, so that playing California is
   not playing Ohio with a different colour. This is a beta job by his own framing.
3. **Consequence, not colour.** Every headline names the rule it changed and for how long, so the
   player can read the paper and then read it back off the map.

**Why it is not now.** It is the strongest single idea for making the game feel alive, and it is a
*game* feature rather than an economy one. Dropping it into the economy alpha would mean tuning the
economy against a world that is being shocked at random — which is exactly the confound the alpha
exists to avoid. It also wants the event ledger and the journal, both of which already exist, so the
machinery is largely built.

**What it would need.** An event object with a headline, a body, a duration and a set of tunable
deltas; a draw that is seeded like everything else so the same seed gives the same history; and a
rule that no two events may move the same tunable at once.

---

## F15 — Are counties too small a unit to be fun?

**Aaron, 6 September 2026:**

> "Counties - are they too granular for the game to actually be fun? Maybe a better way to break
> things out would be to use approximate congressional district maps. Approximate because they don't
> split cleanly."

**The question behind it is the right one**, and it is about attention rather than data: 3,144
counties merged into 1,688 Areas is still more places than anybody can hold in their head, and a
player who cannot hold the map cannot plan on it.

**What it would change.** 435 congressional districts against 1,688 Areas is roughly a quarter of
the pieces. Districts are also *equal in population by construction*, which is a genuinely different
game: today a nation's Areas vary enormously in weight, and moving one can matter fifty times more
than moving another. Districts would make every piece worth about the same in people and wildly
different in ground, which is a cleaner thing for a player to reason about.

**Why "approximate" is the whole problem.** Districts do not nest inside counties — a county can
hold several, and a district can straddle several counties. Every figure in this game is baked per
county from federal data keyed on county FIPS: population, the six industries, ports, rail, border
crossings, rivers. Re-baking onto districts means apportioning each of those across a boundary that
does not follow the data, which introduces error into numbers currently taken straight from the
source. It would also invalidate every save, every authored scenario, and the map-mode region tables.

**The cheaper experiment first.** Raise the Area merge cap and re-bake — the merge is already
deterministic and capped at 8 counties, so the same builder would produce a coarser map with no new
data problem at all, and it would answer "is coarser more fun" for a fraction of the cost. If the
answer is yes, districts become worth their price.

**Before it is worth doing.** After the economy alpha, and probably after a playtest that asks
directly whether the map feels too big.

---

## F16 — A border region that puts itself under Canadian (or Mexican) protection

**Aaron, 7 September 2026.** Added to the Movement Register as a movement called *Canadian Refuge*,
and withdrawn in the same breath.

> "To become their own state as a safe vassal of Canadian protection. If this happens Canada will
> protect them (and trade will go through them to Canada) and you cannot attack them but you will be
> able to influence other separatist movements growing. I am realizing that this is a little too much
> for now so lets move this idea and one for Mexico to the future ideas."

**What it is.** Ground along the northern border — the counties touching Canada and up to four
counties deep — organises not for independence but for *protection*. It becomes its own state under a
foreign guarantee: nobody on the continent may attack it, its trade runs north, and in exchange it is
a permanent foreign foothold from which other separatist movements can be encouraged. A Mexican
equivalent would do the same along the southern border.

**Why it is interesting.** It is the only idea so far that makes Canada and Mexico *matter* rather
than merely exist. Today they are geography — a flat toll and a route to the world market, with no
opinion and no reach. This turns the northern border into a thing the continent has to think about,
and it gives small border states a third option beside being eaten and standing alone.

It also introduces the first piece of ground on the board that **cannot be taken by force**, which is
a genuinely new strategic object: an untouchable neighbour is a permanent problem rather than a
temporary one.

**What it would touch.**

- **Canada and Mexico would stop being geography and become actors** — which is a standing ruling
  (D168, ruling 2) that would have to be revisited deliberately, not drifted past. That ruling exists
  because giving them opinions was judged out of scope, and this is exactly the thing it excluded.
- **A protection guarantee is a new diplomatic object** — closer to the alliance and vassal questions
  filed in `diplomacy-ideation.md` than to anything built, and it would need the AI to understand
  that some ground is simply not available.
- **"Influence other separatist movements growing"** is sponsorship (secession ruling 21) pointed
  across a border by a power that is not on the board.
- The trade rerouting is nearly free: the Canada corridor already exists with its flat toll.

**Before it is worth doing.** After the alliance, vassal and bloc questions are answered in the
diplomacy round, because this is the most extreme version of all three at once — and after somebody
has decided whether Canada and Mexico are allowed to want things. Aaron's own judgement is that it is
too much for now, and the reason to keep it is that it is the best answer yet to a question the
project has not otherwise asked: what are the neighbours *for*?

---

## F17 — A Free Texas is the movement that started all of this

**Aaron, 7 September 2026.** Raised while confirming that a movement is bound to counties and only
its *goals* refer to state lines.

> "I like the idea of Free Texas being the original movement that spawned all of this. Like they were
> the movement originally started when all 50 states were united."

**What it is.** A Free Texas is not one movement among thirty-two. It is **the first one** — the
movement that existed while the country was still whole, whose success in 2034 broke the Union, and
which then survived its own victory to become the thing five rival Texases are now competing to
inherit.

**Why it is interesting.** It answers a question the backstory does not: *why Texas?* At present the
story says Texas seceded and the consequences cascaded, but nothing says what Texas had that nobody
else did. This gives it an organisation with a two-hundred-year name behind it — and it makes the
game's opening date do double duty, since the bicentenary of the Republic falls on the second day of
play and the movement that won independence is watching five governments argue over which of them
is the heir.

It also gives the movement a **different character from every other one on the board**. Everything
else is trying to happen. A Free Texas already happened, and what it wants now is for the thing it
made to stop being five things — which is why its verb is Reunify and why its members are inside all
five successors at once.

**What it would touch.**

- Nothing mechanical. The movement exists, its homeland is baked, its verb is settled (ruling 18: a
  reunification movement declares a winner rather than founding a sixth Texas) and its core already
  spans all five claimants. **This is a story that fits the machinery rather than a change to it.**
- The opening newspaper, whenever the game gets a voice to tell the backstory in — see F14 and F12,
  both of which are waiting for the same thing.
- It would want a founding date in the movement record, which nothing else has.

**Before it is worth doing.** Whenever the backstory is written into the game rather than into
`secession-ideation.md`. It costs nothing to adopt now as a fact about the world, and nothing depends
on it, which is exactly why it can wait.

---

## F18 — Relationship states that run one way

**Aaron, 7 September 2026.** Raised and immediately deferred while settling the seven states two
nations can be in (D181, conquest ideation rulings 2 and 5).

> "I think down the road I could see a more complex version of the game being different, but for now
> they are shared."

**What it is.** Every relationship state — Peace, Peace-treaty, Hostile, Cease-fire, War, and later
Subject and Allied — is currently **one shared fact held between a pair of nations**, true for both of
them at once. The more complex version splits them: the *agreements* stay shared, because nobody
signs a treaty alone and you cannot be at war with somebody who is not at war with you, but the
*attitudes* run one way. **A nation could be hostile toward a neighbour that has not noticed.**

**Why it is interesting.** It restores three things the shared model cannot say:

- **A grievance nobody has registered.** El Paso can loathe Dallas while Dallas is busy with Houston.
  A small nation nursing a resentment against a giant that has not looked at it is a real position to
  play from, and it is arguably the position most of the board is in.
- **Mutual hostility as a distinct, hotter state.** If hostility runs one way, then both sides being
  hostile is a genuine escalation — the waiting room for war — and it comes free without inventing a
  sixth state.
- **A truer fit to the causes.** Four of the five causes Aaron gave for hostility are naturally
  one-sided: a movement growing inside somebody, a nation refusing to sell, a nation funding
  somebody's rebels, a hostility inherited through an ally. The shared model survives all of them
  (the word describes the relationship rather than the emotion), but it survives them by rounding.

**What it would touch.**

- The state itself, wherever it is stored, and every place that reads it.
- **Not the memory list**, which is already directed and stays that way under either model — the
  dated, decaying record of what one nation has done to another is the thing that carries rivalry
  today, and `DESIGN.md` is explicit that symmetrising it would delete the rivalry. The shared state
  sits on top of directed feelings; this idea merely makes the top layer directed too.
- The map view, which would need to show two colours on a border rather than one.
- The AI, which would gain a genuinely asymmetric read of the world and would have to be checked for
  it — a nation that does not know it is hated behaves differently from one that does.

**Before it is worth doing.** After the shared model has been played. The question the alpha should
answer is whether players ever *want* to be quietly hostile — whether the one-sided case turns up in
play as a felt absence, or only as an elegance. This is not a fix waiting to happen; it is a
refinement waiting for evidence.

---

## F19 — Despotism and statelessness: falling off the political board

**Aaron, 9 September 2026.** Designed in the politics round and deferred in the same sitting, to be
picked up **after the alpha build**.

> "Stateless and despotism would be things you could fall into. So Fascism and christian nationalism
> would become despots with no parties and one party rule and then same thing with communism and
> digital technocracy."
>
> "That would add a fun mechanic where if you go too far you get more power (full state control) but
> also nations don't like you as much and other things we can figure out later."

**What it is.** The ten political positions sit on a board with morals running across it and state
power running from authoritarian at both *outer* ends to libertarian in the middle. Past the edges lie
two conditions that are **not parties**, because nobody stands for election as either:

- **Despotism**, off either authoritarian end. One party or none. Full command of the state, and every
  other nation treating you as what you have become.
- **Stateless**, out through the libertarian middle. The government dissolves into ground with people
  on it, output coming off it, and nobody in charge.

**Only the two centrist parties stand over solid ground.** Each of the eight corners has a trapdoor
under it.

**Why it is interesting.** Three reasons, and the third was not designed.

First, it closes the horseshoe *mechanically* rather than as an observation. The geometry already
makes fascism and communism neighbours — they differ on morals alone and agree on both a collective
economy and an authoritarian state. This makes them **arrive at the same destination**, which is the
strongest available statement of that.

Second, it is a genuine trade rather than a penalty: **power bought at the price of standing.** That
is the shape this game already uses everywhere — a garrison buys quiet and costs liberties, autonomy
buys quiet and costs revenue.

Third, **statelessness already exists in the story and this gives it a second way in.** Six regions
open in it, and it is the largest unbuilt mechanic in round 1's inbox. Today the only stateless ground
is ground that never had a government; this adds ground whose government *let go*.

**What it would touch.** The change-course valve; civil liberties and authority; recognition, and how
other nations price you; and whatever answers round 3's first question about what a stateless region
actually is. **Nothing in the economy alpha.**

**What would have to be true before it is worth doing.** The alpha build finished — this is politics
and the alpha track is trade. And three numbers picked that nobody has picked: what despotism buys,
what it costs in standing, and how far "too far" is. **No placeholder was invented for any of them,
deliberately.**

**Where the design already is.** The board, the ten positions and the drift partition are ruled and
current — `DECISIONS.md` D185 and D186, and `docs/design/politics-ideation.md` P5 and P6. **Only the
falling is deferred.** The register at
`https://claude.ai/code/artifact/bc72d871-db3b-4e2d-8363-6909e491abe7` carries both conditions.

---

## F20 — What else, besides two million people, makes stranded ground go stateless

**Aaron, 9 September 2026**, deferring the second half of his own rule as he made it.

> "I think there should be a rule that if those sections together are more than 2,000,000 citizens
> **and maybe something else (not sure yet we can figure that out later in future ideas)** it becomes
> a stateless society."

**What it is.** Ruling 4 says territory severed from its nation and surrounded by other states becomes
a stateless society once the severed sections together pass **2,000,000 citizens**. Aaron wanted a
second condition alongside it and did not know yet what it should be. This is the placeholder for it.

**Why it needs one, measured against the real map.** 340.1 million people across 3,143 counties, and a
median county of 26,138.

- **2,000,000 is 0.59% of the country.**
- **Seventeen counties are already over it on their own.** Los Angeles is 9.76M by itself.
- **It takes 507 of the smallest counties to reach it.**

**So a population-only threshold fires the instant a dense metro is severed and effectively never
fires in the countryside** — which is backwards from where statelessness belongs. Aaron's own tier-3
description is *"areas small enough to run on their own… naturally fairly libertarian or anarchist"*,
and the six regions that open stateless are Arkansas, Wyoming, New Mexico, Kentucky, Ohio and
Michigan. **As written, the rule strands Chicago and never strands Montana.**

**The recommendation, for whoever picks this up.** Add an **extent** condition and require *both* — a
minimum number of Areas as well as the population floor. The build already carries the two halves for
new nations, `nation.minAreas` and `nation.minPop`, though it ORs them: *"a breakaway chunk stands
alone on Areas OR on population, whichever it clears first."* **Stranding wants AND rather than OR**,
because the thing being tested is whether a government can still administer distant ground, and one
dense county is not distant ground.

**Two other candidates worth weighing before settling:** how far the severed piece is from the
capital, and how many turns it has been severed — a region cut off for two quarters is an emergency,
one cut off for twenty is a fact.

**The caution this project has already paid for.** `nation.minAreas` records that at 3 Areas,
*"75 of the 88 nations a fifty-turn game produced were released fragments rather than anything anyone
had fought for."* **An automatic threshold that manufactures map objects has turned this map to
confetti once.** Stateless ground is a cheaper object than a nation, so the failure would be milder —
but it is the same shape and it should be measured before it ships.

**And one ratio to set deliberately rather than inherit.** `nation.minPop` is 250,000, so the stranding
threshold is currently **eight times the bar for becoming a whole country**. Defensible — a breakaway
is chosen and a stranding is not — but it should be a decision.

**What would have to be true before it is worth doing.** Ruling 4 built at all, which needs stateless
ground to exist, which does not today. **Not in the alpha.**

**UPDATE, 9 September 2026 — largely answered the same day it was filed.** Ruling 5 replaced ruling
4's threshold and inverted its outcome: enveloped territory over 500,000 people becomes **a nation**,
and 500,000 or fewer becomes **a stateless society**. **The concern this entry was written about is
gone** — a population test now sorts metros into countries and sparse countryside into stateless
ground, which is the right way round and needs no extent condition to rescue it.

**The threshold also stopped being a gate and became a fork**, so there is no longer a "nothing
happens" case for a second condition to guard. **What remains open here is smaller:** whether the
chosen-breakaway bar (`nation.minPop`, 250,000) and the enveloped bar (500,000) should be one tunable
or two, and whether time-since-severed or distance-from-capital should modify either. Kept open rather
than closed, because neither has been played.

## F21 — Fund propaganda before a referendum

**Aaron's, 11 September 2026**, filed the moment the referendum was ruled in (round 3 ruling 21):
*"a future idea would be to fund propoganda"*.

**What it is.** Spend money to swing a referendum rather than rigging the count. Round 1's **S26**
("buy them" — spend on a region the way a harvest crisis lets you spend on grain) pointed at a vote
instead of at a region.

**Why it is worth keeping, and where it would sit.** The game already has one way to survive a vote
you should lose: **stealing it**, available only when Civil Liberties are below **0.32** and costing
**0.12** more. **Propaganda would be the legal end of the same scale** — a government with liberties
too high to cheat could still spend its way to a result, and pay for it in money rather than in
liberties. That is the same shape ruling 14 found between martial law and a stolen election: **a
decent government's options are expensive and public; a rotten one's are cheap and quiet.** A third
point on that scale is worth more than a new system.

**Why it is not built now.** What money can buy is round 4's to say — the same reason **S26** was
deferred rather than ruled. Building the price before the economy round has run would mean inventing
a number and then discovering it was wrong.

**What it needs before it can be designed.** Whether spending is visible to the other side (it should
be, or it is just a quieter rig); whether it moves the vote or only the turnout; and whether the
movement can spend too, which turns a referendum into a contest rather than a purchase.

## F22 — A federation can string a member along, the way a government strings a movement along

**Aaron's, 11 September 2026** — *"Lets save that for future ideas"* — filed the moment it was noticed,
during round 3's federation rulings.

**The observation.** Ruling 25 gives the federation a turn in which it may *petition to allow a
declaration of war*, so a member asks and the federation answers. **That is the same shape as ruling 22:
a body that keeps answering "wait" is stringing somebody along**, and ruling 22 says what that produces —
the asker stops asking and wants out. At nation level the destination would not be *Separate*; it would
be **leaving the federation**.

**Why it is attractive.** It would mean a federation can be destroyed from the inside by its own
caution, without a single rule about federations breaking up: a leader who refuses every war to protect
the trade income slowly loses the members who wanted those wars. **One mechanism, already ruled for
movements, doing a second job.**

**Why it is not being built now.** Nothing about a federation exists yet, the object was ruled the same
evening, and layering a second-order behaviour onto an unbuilt one is how a design gets ahead of itself.
It also needs the answer to a question still open: what actually happens when a petition is refused.

**What it needs before it can be designed:** whether membership is a stock that can decay at all, or a
binary; and whether the member or its people carry the disappointment — a government that wanted a war
is not the same thing as a population that did.
