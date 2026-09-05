# Hog Wild Mode

**Aaron's, 5 September 2026.** A standing permission, switched on and off on the Control Board.

> "Hog Wild Mode is where I let you loose and keep building on this project until there is nothing
> left for you to work on. It also gives you permission to open up as many extra agents as possible
> to work on different things. Think of it as going hog wild on the coding and the only two things
> you care about are getting as much work done as possible and making sure you are documenting
> everything along the way so that when I come back and we can see where we are we know what
> happened and can easily change things."

His reasoning, and it is the part worth keeping in mind while the mode is on:

> "I am a firm believer in the idea of MVP (minimum viable product) and I know that sometimes you've
> got to let programmers iniate hog wild mode to get you to a product you can actually work with."

---

## The protocol

**Aaron's, 5 September 2026, with four changes agreed in the same conversation.** The spoken phrases
are exact: they are how both sides know which state we are in.

| # | Who | What happens |
|---|---|---|
| 1 | Aaron | *"What have you got left to do?"* |
| 2 | **Me** | I tell him — **and clear the desk in the same breath.** Every ruling to `DECISIONS.md`, every deferred idea to `docs/FUTURE-IDEAS.md`, the board republished, a handoff written. Then: **"Desk is clear — safe to compact."** |
| 3 | Aaron | `/compact`, or better a fresh session |
| 4 | Aaron | *"Activate hog wild mode"* — **not yet permission to run** |
| 5 | **Me** | Last preparation. Reply: **"Hog wild mode activation commencing."** |
| 6 | **Me** | Commit anything outstanding, stamp the start time and the token counter into `docs/HOGWILD-LOG.md`, and write the plan — the ordered list of what I intend to get through. Then: **"Hog Wild Mode Fully Operational. OINK OINK!"** |
| 7 | **Me** | Run. |
| 8 | **Me** | On any exit condition below: **"Starting to wind down the hog."** |
| 9 | **Me** | Final documentation, board, and the wind-down report. |
| 10 | **Me** | If the run ended on the usage limit and the night is not over: schedule the resume — see *Running overnight*. |

**THE ONE CHANGE THAT MATTERS is step 2.** Aaron's version compacted before I had prepared; the
preparation is what makes compacting safe. Flush, then compact, then run — see *Before it starts*
below for why the order is not a detail.

### The four ways it ends

1. **There is nothing left that does not need him.** The intended ending.
2. **He comes back and says stop.** Immediate, no argument, no finishing the current thought first.
3. **Two stages in a row have gone badly.** That means the plan is wrong rather than the execution,
   and going faster makes it worse.
4. **The room is running out.** And this is the one that has to be watched rather than discovered:
   *begin the wind-down while there is still enough left to do it properly.* A run that goes flat out
   until it is cut off produces no report, no board update and no list of what was guessed at — which
   is every part of the mode's value gone at once. Landing the plane is not the last thing to spend
   room on, it is the first thing to reserve it for.

### Running overnight

**Aaron, 5 September 2026:**

> "is there a way that you could also run hog wild all night? So you wind down at a usage limit but
> as soon as it resets you go hog wild where you left off?"

**Yes.** A run that ends on the usage limit schedules its own resume, so the night goes:
run → limit → wind down → schedule → wait → resume → repeat.

**What makes it possible is the paperwork, not the scheduler.** A scheduled run starts with NO
memory of the conversation that set it going. It knows only what is on disk. So everything the mode
already demands — the log, the handoff, the board, the stage tags — stops being good practice and
becomes the mechanism: it is the entire contents of the next run's head. A wind-down that skimps on
the report does not produce a poor report, it produces a resumed run that does not know what it is
doing.

**The two conditions, both of which are Aaron's to meet, not mine:**

1. **The Claude app has to stay open.** Scheduled tasks run while the app is running; if it is
   closed when one is due, it fires on next launch instead. That is still useful — the work is
   waiting when he sits down — but it is not overnight.
2. **The machine must not sleep.** Same reason.

**The leash, and it works while he is asleep.** Every resumed run re-reads the Control Board before
doing anything. Untick Hog Wild and the next run winds down immediately instead of continuing. The
scheduled task can also be cancelled outright; ask, and it is one call.

**The cap.** A run may schedule at most **three** resumes before it stops chaining and waits for
him, whatever the board says. A chain that could extend itself forever is not a licence, it is a
runaway — and three covers a night, since the limit resets roughly every five hours.

**What I do not know yet, and this is exactly the shape of thing the mode is supposed to write
down.** A scheduled run may not be able to reach the Control Board: publishing it goes through the
same authentication as the browser, and the notes on this kind of run warn that interactively
authenticated services can be missing. If that turns out to be true, an overnight run can still
commit, tag and write to `docs/`, and the board update simply waits for the morning. The first
overnight run will settle it and the answer goes in this file. Until then, assume the board might
not update and make sure the log alone is enough to understand the night.

### The wind-down report

Written into `docs/HOGWILD-LOG.md` and summarised on the board. Four parts, and the third is the one
Aaron actually asked for:

1. **Where it got to** — stages landed, tests green, the tag each one is on.
2. **What is next**, and what of it needs him.
3. **WHERE I WENT MOST HOG WILD** — the decisions ranked by *how much I made up*, worst first. Not a
   list of everything I decided; a list of the ones where I was least sure and a reasonable person
   might have gone the other way. These are the ones for us both to look at with the mode switched
   off. Each says what I would check first to find out whether it was wrong.
4. **The counts.** Agents started, and tokens spent from the counter at step 6 to the counter now.
   Both are exact. What I cannot break down is which agent spent what, so the number is a total and
   should be read as one.

### Agents inherit the mode

While it is on, the agents I start carry the same instruction: keep going, decide rather than queue,
and write down what you decided and why. What they do NOT inherit is the ability to act on the world
— they do not commit, publish, or touch the board, and their decisions reach the log through me. So
"an agent in hog wild mode" means one that will not stop to ask me a question it can answer and
document; it does not mean a second one of me.

## Before it starts: clear the desk

**Aaron, 5 September 2026, proposing this:**

> "since the purpose of it is to go hog wild for as long as possible would it make sense to have a
> compact feature built into hogwild mode first so that the the programmer knows they are going to
> be going hog wild but before they do they compact the session so it burns less tokens and they can
> go hog wild longer and harder?"

**Yes — and the step BEFORE compacting is the one that matters.**

Compacting a conversation summarises it, which frees room and cuts what has to be re-sent on every
turn. That is real and it is worth doing. But summarising is lossy, and this mode is precisely the
one where losing something is expensive: if a ruling of Aaron's gets blurred into a summary, I can
contradict a decision he made and not know I have done it. The whole licence rests on me carrying
his intent correctly while he is not here to correct me.

**So the ordering is: flush, then compact, then run.** Compaction is safe exactly to the extent that
nothing important lives only in the conversation. Which means the entry ritual is:

1. **Write everything durable to disk.** Every ruling from the conversation into `DECISIONS.md`,
   every deferred idea into `docs/FUTURE-IDEAS.md`, the Control Board republished, and a handoff in
   `docs/handoffs/`. After this step the chat should contain nothing that matters and is not also in
   a file.
2. **Start fresh rather than compact, if the choice is available.** Aaron's own standing rules
   already say to prefer a handoff plus a new session over `/compact` at a natural boundary, and
   they are right: a compacted session still carries its summary plus everything since, where a
   fresh one carries only what `/resume` reads back. Hog Wild always begins at a natural boundary,
   because step 1 makes one.
3. **Then go**, with `/resume` reading the handoff, the board and the repo state — including the Hog
   Wild toggle itself.

I cannot compact the session myself; that is Aaron's command. What I can do is get everything to a
state where compacting or restarting costs nothing, and then say so.

## Spending the room well once it is running

The point of clearing the desk is to run longer, which is wasted if the room goes on re-reading
things. While the mode is on:

- **Do not re-read a file already read this session** unless it has been edited since.
- **Run the slice, not the suite.** `?only=transit,deals` answers most questions in a few seconds;
  the full run is for the end of a stage, not the middle of one.
- **Do not re-derive what is written down.** `DECISIONS.md` and the spec measurements exist so a
  question is answered once. Re-measuring a figure already recorded is the same waste as re-reading
  a file.
- **Let the agents carry the reading.** A fan-out that returns a structured answer costs less of
  this session's room than doing the same reading here, which is half the reason the mode allows
  them.

## What it turns on

**Keep going.** Do not stop at the end of a stage to report and wait. Finish it, write it down, start
the next one. The mode ends when there is nothing left that does not need Aaron — not when there is
a convenient place to pause.

**Use as many agents as the work will take.** Map a stage with a fan-out, attack the designs with
independent challengers, run separate agents on separate stages at once. Token cost is not a
consideration while this is on; Aaron has said so explicitly.

**Decide, do not queue.** A question that would normally become a card on the board gets answered by
me instead — but only in the shape below, and never silently.

---

## The one obligation: a trail he can follow back

The whole mode rests on this. Aaron is not reading the code; he is reading what I write about it.
If the trail is not good enough to reverse a decision, the mode is a liability rather than a licence.

### Every unknown gets four sentences, not one

When I hit something I do not know the answer to, `docs/HOGWILD-LOG.md` gets an entry with all four
of these, in this order. Three of the four are the ones that are easy to skip and are the reason the
entry exists:

1. **The question**, stated plainly enough that Aaron could answer it without reading any code.
2. **Why I could not answer it** — is it a product judgement that is genuinely his, a fact I could
   not measure, or a trade-off with no obviously right side?
3. **What I did**, and the reasoning, including the option I rejected.
4. **How to undo it**: the stage tag, and the one command that reverses it.

### Every stage gets a tag

`stage/<name>`, on the commit where the stage landed. This is what makes a decision reversible by
somebody who is not me: `git revert` a stage or check out the one before it, without having to
identify a commit by reading forty messages. Retro-tagged back to A1 on the day this was written,
because the gap was found by Aaron asking the obvious question — *could you actually roll A2b back?*
— and the honest answer was "I could; you could not".

### The log is written as it happens, not reconstructed at the end

A log assembled from memory when Aaron comes back is a story about the work. A log written while
doing it is a record of it. They are not the same document and only one of them is any use for
reversing a decision.

---

## What it does NOT turn on

Worth stating, because "go hog wild" could reasonably be read as "the guardrails are off", and they
are not. None of these are mine to relax and none of them are what Aaron is asking for:

- **Nothing goes to the playtesters.** The `live` permission is separate and stays separate.
  Publishing changes what other people receive, and that decision is his in every mode.
- **No force-push, no rewritten history, no deleted branches.** The trail IS the deliverable here; a
  rewritten history destroys the exact thing the mode depends on.
- **No secrets, no `data/`, no `clients/` committed.** Unchanged.
- **Nothing is marked done that was not verified,** and no number is published that was not measured
  this session. Going fast is not a reason to start guessing — and a wrong figure in the log is
  worse than no log, because Aaron would act on it.
- **The brief still wins.** Building ahead of it is not "more work done", it is work that has to be
  argued about later. If the spec does not ask for it, it goes in `docs/FUTURE-IDEAS.md`.

## When to stop and say so

Stop, write it up, and leave it for him if any of these is true. These are the cases where guessing
is worse than waiting:

- The decision would be **expensive to reverse** — a re-bake of the underlying data, a save-format
  break, anything that invalidates existing games.
- It is **a matter of taste about how the game should feel**, with no measurement that could settle
  it. Those are the ones he is actually for.
- It would **spend money**, or reach anything outside this machine.
- Two stages in a row have gone badly. Something is wrong with the plan, not the execution, and more
  speed makes it worse.
