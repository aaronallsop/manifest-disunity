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

## Entries

*Nothing yet. Hog Wild Mode has not been run.*

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
