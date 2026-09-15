# The ideation plan

**Written 6 September 2026.** How we work through stage 1 across the whole game, in what order, and
what each round has to hand the next one. Aaron's proposal: start with secessionist movements
because that is the story, then take the system that touches the most others and work down.

**The first half of that is right and the second half needs replacing**, for a reason worth showing.

---

## Why "most connected" does not sort them

I counted. Every one of the six components reads from or writes to roughly six others. Economy
touches the board, people, diplomacy, conquest, politics and secession. Conquest touches economy,
politics, diplomacy, the board, people and secession. They are all about equally connected, so the
metric returns a tie and we would end up choosing by feel anyway.

**The metric that does sort them is: whose output does the next round need as an input?**

And when you apply that, Aaron's instinct comes out right for a better reason than the one he gave
it. Here is the formula that decides whether a region turns against the country holding it — it is
built, it is running, and it is the centre of the game:

| What feeds a region's anger | Which system produces it |
|---|---|
| How well its people are fed, treated and paid | **Economy** |
| How freely they are allowed to disagree | **Politics** |
| How firmly the government holds its own ground | **Politics + Conquest** |
| How tired of war the country is | **Conquest** |
| How powerful the country holding it is | **Conquest** |
| Whether there are soldiers standing on it | **Conquest** |
| How closely the region's politics match the movement's | **Identity** |
| Whose neighbours have already turned | **The board** |
| A grudge older than whoever governs it | **The place itself** |

**Secession is not a leaf. It is the scoreboard.** Its central mechanism is a weighted sum of what
every other system produces. So the first round is not really "design secession" — it is **write the
requirements list for the entire rest of the game**, in the form of: *here is every pressure that has
to be capable of reaching a region, and here is how hard each one needs to be able to push.*

That is why it goes first, and it is a stronger argument than the story one.

**And it gives the running order**, by how much of that pressure list each system owns: Conquest owns
four of the nine inputs, Politics two, Economy one — but the deepest one — Identity and the board two
between them, and **Diplomacy owns none of them directly.** Diplomacy reaches a region's anger only
by going through somebody else, which is exactly why it should go late and inherit rather than early
and guess.

---

## The map of the whole game

Settled first so no round has to re-litigate its own scope. Nothing here is a system to be ideated;
it is the filing cabinet.

| | |
|---|---|
| **Above everything** | The turn and its single action · What winning means · Time |
| **The six components** | Secession · Conquest · Politics · Economy · Diplomacy · Events |
| **Beneath everything** | The board (geography) · People · Identity (the six ideologies) |
| **Running through all of it** | Information — what a nation is allowed to know about the others |

**Three rules that come out of this filing and save arguments later.**

1. **The board and Identity are fixed.** Geography is baked from federal data and the six ideologies
   on two axes are the language every component speaks. Neither gets its own round. If a round finds
   itself wanting to change one, that is a finding worth stopping for — it is expensive and it is
   Aaron's.
2. **The two seams get an owner now.** *Unite* — merging with a neighbour on a roll that can shatter
   you — belongs to **Conquest**, because its failure mode is a civil war and that is conquest's
   machinery. *Autonomy, release and changing course* belong to **Politics**, because they are the
   four prices a government can pay to keep a region, and paying them is a political act.
3. **The single action per turn is written at the top of every round.** One action per nation, and it
   ends the turn. Six components are competing for one slot. Any idea that assumes it gets a decision
   every turn has just taken that turn away from the other five, and the round it came from has to
   say so out loud.

---

## The rounds

Each round produces three things, and the third is what makes this a sequence rather than a list:

1. **The idea bank** — every idea, unjudged, numbered.
2. **What this system needs from the others** — which becomes an input to their rounds.
3. **What the others may demand of this one** — the requirements it accepts. *This is the handover.*

| # | Round | Why here |
|---|---|---|
| **1** ✅ | **Secessionist movements, and the people who make them** — **CLOSED 7 September 2026, 53 rulings.** Five scenarios traced at the close; three narrate, two stall. Findings A–F in `secession-ideation.md` §6c, each with an owner | The story, and the scoreboard. Writes the requirements list everything else is measured against. Migration comes in here rather than getting its own round, because its main consequence *is* this one: people move toward people who think as they do, a divided nation sorts itself into homogeneous halves over a few decades, and those halves are the ground a movement organises on |
| **2** ✅ | **Military conquest** — **FULLY CLOSED 9 September 2026, 41 rulings, 127 ideas** (numbered C1–C131: four numbers were never used and two were reused; counted 12 September)**.** All six scenarios traced; five narrate, one stalls on round 4's known hollow spot. Findings A–G in `conquest-ideation.md` §7b; **B, C and D were Aaron's and are answered** (rulings 32–40), and ruling 41 confirmed the seven defaults taken without asking. **Nothing outstanding is Aaron's.** A goes to whoever builds ruling 26, E to round 4, G to round 3 | Owns four of the nine pressures. Also shares actual machinery with round 1 — a civil war that goes badly makes new nations, which is what secession does. Ideating them apart would grow two answers to one question |
| **3** ✅ | **Politics** — **CLOSED 11 September 2026, 41 rulings** (plus the half-ruling 11a), **10 findings.** All twelve spine questions answered; all 26 live movements re-placed on the ten positions; scenario 3 traced. Closed by Aaron on the Control Board, 12 September 02:41. Findings A–J in `politics-ideation.md` §8, each with an owner; §9 is what the round hands to rounds 4, 5 and 7 | Owns two more pressures, and owns all four ways a government can answer a movement — give ground, give self-rule, change what you stand for, or send soldiers. **Round 2 handed it two things: the mutable movement verb (ruling 30, C120) — the one piece of machinery this design asks for that does not exist — and the government's answer to Expand and Reconquer beside the four release valves, as one table rather than two** |
| **4** ✅ | **Economy** — **CLOSED 14 September 2026 by Aaron on the Control Board, 21:06. Nine rulings, seven findings, 96 entries** (E1–E96). Scenario 4 traced and it narrates. **The hollow spot is closed**: ruling 1 kept the written cure nobody had built, and ruling 7 shut the other half by gating farmland on extraction, so a self-sufficient nation can no longer opt out. §7 is what it hands to rounds 5, 6 and 7 | Opened 93 entries deep and parked. Its in-tray from rounds 2 and 3 had never been collected — nine items, three of them blocking a rule already written; all three now closed |
| **5** ◀ **LIVE** | **Diplomacy** — **opened 14 September 2026 and run in one session. 86 ideas (T1–T85 plus T76a), 21 rulings, 12 findings, scenario 5 traced.** Its in-tray was collected as the first act: **26 items from four closed rounds, 22 now answered**, and the four still open belong to the design stage or are inherited facts. **Both blocking items are closed** — the thaw by ruling 9, and secession's finding A, the petition threshold, by ruling 6. **Not closed; Aaron closes rounds** | Reaches the scoreboard only through the others, so it goes late and inherits. It is also the round where a *new* nation's problems land — recognition, alliances against a conqueror, being nobody. **It opened shorter than the others** because round 3's thirteen federation rulings had already settled what a federation is. **What it found instead**: scenario 5 does not narrate — a pariah has no diplomatic move of its own at all — and ruling 11 puts three new objects, the alliance, the bloc and vassalage, **in front of the alpha** (D214) |
| **6** ◀ **LIVE** | **Events** — **opened 14 September 2026. 74 ideas (X1–X74), 7 rulings, 6 findings, scenario 6 traced BEFORE any ruling, in-tray 9 of 9 answered. Not closed; Aaron closes rounds.** **The most restrained round of the six**: a shock has a blast radius on the map, a nation feels it in proportion to the ground it holds inside it, **no chains run in play**, and the opening becomes a front page dated 1 March 2036 | Things that happen that nobody chose. Reads from nothing and writes to everything, so it went last: you cannot design a shock before you know what it is shocking. **What it found:** the twelve authored *crises* are all triggered by a nation's own condition, so there was no way to make anything true for more than one nation — ruling 1 answers that with a place rather than a world. **Scenario 6 failed at both halves of its own sentence** before any ruling was made |
| **7** ◀ **LIVE** | **The things above** — **opened 14 September 2026. 50 ideas (W1–W50), 4 rulings, 4 findings, in-tray 12 of 12 answered or handed on. Not closed; Aaron closes rounds.** **Two of its four rulings are refusals to decide**, on Aaron's instruction: the action budget and the clock belong to the technical design director, and this round hands them the requirement instead of an answer. **What it did rule:** the federal remnant plays a different game — restore, where everyone else replaces — and **what a nation may know is gated on the relationship**, which answers three rounds' questions at once and gives an alliance its first non-military benefit |

---

### Where each round lives

One document per round in this folder: `secession-ideation.md` (closed), `conquest-ideation.md` (closed),
`politics-ideation.md` (closed), `economy-ideation.md` (closed), `diplomacy-ideation.md`,
`events-ideation.md`, `the-things-above-ideation.md`. **The unopened ones are stubs, and they are not
empty:** round 1's story handed each of them questions, filed on 6 September as the handover the
plan describes. A round opens with its inbox already full.

---

## What this costs, and the one decision it needs from Aaron

**Roughly a session a round, and round 1 probably two**, because it is also inventing the language
the other six use. That is an estimate from the shape of the work and not a measurement — this
project has never run an ideation round before, so there is nothing to measure it against.

**The real cost is that the build is idle.** Six rounds of ideation before any design document exists
means nothing reaches the architect for some time. The alternative is to interleave — write the
economy's design document while ideation continues on the later rounds.

**My recommendation: do not interleave before round 4.** Rounds 1, 2 and 3 will change what the
economy has to deliver, and designing it first means designing food and then discovering that
secession wanted hunger to bite differently. After round 4 the economy design can be written and sent
onward while rounds 5, 6 and 7 carry on — by then everything that can make demands of it has made
them.

**One thing to watch, and it is the risk of this whole plan.** The gap the ideation document already
names is that almost every idea we have is something that happens *to* a nation, and very few are
things a player *does*. An order that runs pressure-first — secession, then conquest, then politics
— will make that worse before it makes it better, because all three are about forces acting on you.
**Every round should be made to answer the same question before it closes: what does the player
actually do about this, on a Tuesday, with one action?** If a round cannot answer that, it is not
finished.

---

## The scenarios this plan has to produce

An ideation round is finished when it can put concrete situations in front of the design stage.
These are the ones the sequence as a whole is aimed at, and each names the round that owns it.

**1. A region turns, and the player can see why in one sentence.** *(Round 1.)* Salt Lake's anger
jumps in a single quarter and the panel says which of the nine pressures did it — not a number, a
reason. Today the machinery for that exists and the pressures come from systems that mostly cannot
yet move.

**2. A conquest that pays for itself economically and costs the conqueror the country.** *(Rounds 1
and 2 together.)* You take four Areas, your treasury improves, your war weariness rises, the ground
you took resents the garrison standing on it, and eighteen months later the region next to it — which
you have held for a century — declares. The point of ideating conquest immediately after secession
is that this story runs through both and neither can tell it alone.

**3. A government that chooses between its own identity and its territory.** *(Round 3.)* A movement
is over the line in three Areas. The government can hand the ground away, grant self-rule, change
what it stands for and lose the majority that elected it, or send soldiers and make the next
movement. Four prices for the same relief, and the player has to pick one.

**4. A hungry nation with an army.** *(Rounds 1, 2 and 4.)* Its people are short of food, its
neighbour has fields, and buying is possible but expensive. The interesting version of this is the
one where invading is *cheaper* and the player has to weigh a fed population against the anger of the
ground they just took. That scenario needs three rounds finished before it can be told, which is why
it is the test of whether this sequence worked.

**5. A brand-new nation that nobody will talk to.** *(Round 5.)* Born out of round 1's machinery,
holding real ground, unable to trade because nobody recognises it. What it can do about that is
diplomacy's whole reason to exist, and it cannot be designed until secession is producing such
nations on purpose.

**6. A bad winter.** *(Round 6.)* Nobody chose it, everybody feels it, and it lands differently on a
nation that feeds itself than on one that buys. Written last, because it is only interesting once
there is something for it to hit.
