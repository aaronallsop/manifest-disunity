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
