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
