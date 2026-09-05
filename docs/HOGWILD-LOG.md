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

*Nothing yet. Hog Wild Mode has not been run.*

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
