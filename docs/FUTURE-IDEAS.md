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
