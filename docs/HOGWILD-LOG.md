# Hog Wild log

**Read this first when you come back.** Newest at the top. One entry per decision made without you,
each with the tag it landed on and the one command that undoes it.

The rules this log is kept under are in `docs/HOGWILD.md`. The short version: every entry says what
the question was, why I could not answer it, what I did instead, and how to reverse it.

**To see everything since you left**, in one go:

```bash
git log --oneline stage/a2d..HEAD
```

**To undo one stage entirely**, revert every commit it contains:

```bash
git revert --no-commit stage/<previous>..stage/<the one you want gone> && git commit
```

**To look at the game exactly as it was before a stage**, without changing anything:

```bash
git checkout stage/<previous>   # then: git checkout master
```

---

## Stage tags so far

| Tag | What landed |
|---|---|
| `stage/a1` | Trade deals with terms, negotiation, the deals screen |
| `stage/a2` | Transit agreements, tolls, revocation, the three screens |
| `stage/a2b` | The markets abroad on corridors; water beats rail beats road |
| `stage/a2c` | The rivers and the fifteen chokepoints |
| `stage/a3` | The trade network map |
| `stage/a4` | The other sixty nations use the corridors |
| `stage/a2d` | Two seas rather than one ocean; Panama shut |

---

## Runs

### Run 1 — 5 September 2026, 17:52 MDT

**Token counter at start:** 14,993,000 remaining of a 15,000,000 session budget.
**Started from:** `fe6b5a5`, working tree clean, `v0.6`, 948 tests green as of the last full run.
**Authorised by:** Aaron in chat — *"activate hog wild mode"* — **not** by the board, which said
otherwise. See the first entry below; this is the one thing to read before anything else.

**The plan, in order.** Two faults first, because they are things that are wrong rather than things
that are missing. Then the work that closes gaps, then the largest piece of new value.

| # | What | Why it is in this position |
|---|---|---|
| 1 | `DESIGN.md` for A2b, A2c, A2d, A3, A4 | A rule of this project that I broke. Nothing else should land before the record of what already landed. |
| 2 | A port grant should cost more than a road grant | Flagged by Aaron as immediate on 5 Sep and not built. Small. |
| 3 | The five success metrics on the board | They have read "not yet measured" since they were written; three are measurable now. |
| 4 | Close `deferred.md` #3 and #5 with evidence | Both are answerable; #3 has been fixed for a while and the entry never caught up. |
| 5 | Distances between ports | The biggest single piece. Three separate open questions all wait on this one measurement. |
| 6 | The industry re-bake | Approved (D169), measured at 84% real-data coverage against nought per cent today. |
| 7 | Tidy the stale roadmap | Three "after the economy alpha" phases were delivered by the alpha track and still read as not started. |
| 8 | `deferred.md` #6 — the simulator over a live world | The trap in it is already documented; this is closing it. |
| — | ~~The autarky economy~~ | **Parked by Aaron (D175).** Blocked on his written predictions. Not in this run. |
| — | ~~A politics-alpha strip-back~~ | A new phase, not a task. Does not start without him. |

---

## Entries

### Run 1, entry 1 — I started with the board's Hog Wild switch turned OFF — *5 Sep, 17:52*

**The question.** Aaron said *"activate hog wild mode"* in conversation. The Control Board — which
is where this mode is documented as being switched on and off, and which is the only thing a
resumed overnight run can read — has Hog Wild **unticked**. Which one wins?

**Why I could not answer it from the rules.** Because the rules were written assuming the two agree.
`docs/HOGWILD.md` calls the mode "a standing permission, switched on and off on the Control Board"
and makes the board the leash for resumed runs. It never says what to do when the spoken instruction
and the switch disagree — and this is the first run, so nothing has settled it by precedent.

**What I did, and what I turned down.** I am running, on his instruction, and I have **not** touched
the permissions record. The instruction is unambiguous and was given seconds ago; refusing to work
over a checkbox would be pedantry, not caution. But I rejected the tempting fix — ticking the box
myself to match what he said. The board switch is the only thing that can stop a run while he is
asleep. A switch I can set is not a leash, it is decoration, and the value of the mechanism is worth
more than the convenience of it being consistent tonight.

**The cost of leaving it, stated so he can decide.** The overnight chain will not work. Every
resumed run re-reads the board before doing anything and winds down immediately when Hog Wild is
unticked. So this run continues until the usage limit and then **stops** rather than chaining. One
tick before the limit and the night runs; no tick and the work is simply waiting in the morning.
Either is a fine outcome; only one of them is the one he asked for last night.

**To undo it.** Nothing to undo — no code, no data, no record written. Untick nothing; the box is
already off.

---

### Run 1, entry 2 — "Touch anything live" is ticked, and I am treating it as though it is not — *5 Sep, 17:52*

**The question.** The board's saved permissions have `live: true` — *"Run against real data, real
services, or real people"*, the only high-risk permission besides Hog Wild itself. Every previous
session has run with it off, and Aaron's standing instruction is that it stays off until after the
economy alpha, with the playtest link sent to nobody.

**Why I could not answer it.** I cannot tell a deliberate tick from a mis-click, and the evidence
points at a mis-click without settling it. In the board's markup, **"Touch anything live" is the
checkbox directly above "🐗 Hog Wild Mode"**, and the page writes all five permissions together
whenever any one of them changes. The record was written at 17:19 MDT — roughly when he would have
been reaching for the Hog Wild box, and it is the one immediately above it. The state that came out
of that write is *live on, Hog Wild off*: precisely the inversion a slipped click produces, and the
exact opposite of what he then said out loud.

**What I did.** Nothing that depends on it, and I did not correct the record. Hog Wild explicitly
does not unlock publishing — *"Nothing goes to the playtesters. The `live` permission is separate
and stays separate"* — so tonight's work is unaffected either way, and no build reaches anybody.
I rejected setting it back to false myself for the same reason as entry 1: if I edit his permissions
to match my guess about his intent, the record stops being his.

**To undo it.** His to untick, on the board, if it was not meant. If it *was* meant, it changes
nothing about tonight and we should talk about what he wants live before anything ships.

---

### Run 1, entry 3 — The run stopped on its own first instruction — *5 Sep, 17:55*

**What happened.** I finished the activation, declared the mode operational, wrote *"Going quiet
now. Everything lands on disk as it happens"* — and ended the message. Nothing landed on disk,
because nothing more happened. Aaron asked whether the commit had hung. The commit was fine.

**Why, stated plainly enough to be useful.** I only act while writing a reply. When a reply ends, I
stop entirely until he speaks again — there is no background, no quiet continuation. So the protocol
step that says "Run" describes a state I cannot *enter* and then occupy; there is only continuing to
act, or stopping. I wrote a sign-off, and a sign-off is stopping. Three minutes of a mode designed to
run for hours.

**What I did.** Rewrote step 7 of `docs/HOGWILD.md` as an explicit rule rather than a single word:
after the operational line the next thing must be an action, work continues without a closing
paragraph, and the only message of mine allowed to end without one is the one beginning *"Starting
to wind down the hog."* Progress gets narrated *between* actions, never *instead of* them. The tell
for a repeat is written down with it.

**What I turned down.** Logging it as a one-off slip and carrying on. It is not a slip; it is the
protocol being wrong about what I am, and it would have recurred at every natural pause — which in a
run of eight stages is eight chances to silently end the night.

**To undo it.** `git revert` this commit. It changes one document and no game behaviour.

---

*The rest of Run 1's entries follow below as they happen, newest at the bottom of the run.*

---

Each run opens with a header stamped at the moment it starts, so the counts at the end mean
something:

> ## Run 1 — *date, time started*
>
> **Token counter at start:** *n*
> **The plan:** the ordered list of what I intended to get through.

...and closes with the wind-down report: where it got to, what is next, **where I went most hog
wild** (ranked by how much I made up, worst first, each with what I would check to find out whether
it was wrong), and the counts — agents started, and tokens spent between the two counter readings.

## Entries

The first session it runs, every decision taken without you lands here in this shape:

> ### What I did — *stage, date*
>
> **The question.** Stated so you could answer it without reading any code.
>
> **Why I could not answer it.** A judgement that is yours, a fact I could not measure, or a
> trade-off with no obviously right side — and which of those it was.
>
> **What I did, and what I turned down.** The reasoning, including the option I rejected and why.
>
> **To undo it.** `git revert --no-commit stage/x..stage/y && git commit`
