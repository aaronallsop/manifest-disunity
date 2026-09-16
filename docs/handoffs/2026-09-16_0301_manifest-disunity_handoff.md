# Manifest Disunity — handoff, 16 September 2026, 03:01

**Written at sign-off.** *Supersedes the handoff of 15 September 15:07, which described the world
before the tone document, the twentieth design document, and the close of stage 2.*

---

## ⚠ READ THIS FIRST — the thing that went wrong

**`node --test` REPORTS EVERY SUITE GREEN WITHOUT RUNNING A SINGLE CHECK.** *Node is on this machine
now, the README recommended that route, and I used it at sign-off and **wrote down "51 of 51 green"
before catching it.***

**Why it lies:** *`tests/harness.js` says `describe`/`it` map onto `node:test` "via the shim at the
bottom of this file". **There is no shim.** `describe`/`it` only collect suites into an array, and the
browser page is the only thing that calls `run()`. Under node each file registers its suites, executes
nothing, and node counts the FILE as one passing test.*

> **Proved, not inferred:** a suite whose only check was `ok(false)` reported **`pass 1, fail 0`, exit
> code 0.**

**`docs/deferred.md` 45. README corrected and now carries the warning at the command. D243.**

> **⚠ `docs/PROGRAMMER-RULES.md` rule 16 ALREADY described this exact incident**, from an earlier
> session, naming the command and both figures — **and it did not stop me**, because it lives in a file
> nobody reads at the moment of the mistake. *Rule 16 now carries that as its second clause, plus the
> ten-second canary that settles it for any runner: **add a check written to fail and confirm the
> runner goes red. A runner that cannot fail cannot pass.***

### THE TESTS THEMSELVES ARE FINE

| | |
|---|---|
| **956 passed · 0 failed · 0 skipped** | **205 suites, 282 seconds** |
| **How** | `python server.py`, then `http://localhost:8000/tests/run.html` — **the only route that runs them** |
| **Measured** | 16 September 2026, this session. **Do not quote it without re-running** |

---

## Where things are, in one paragraph

**STAGE 2, DESIGN, IS CLOSED** — Aaron, on the board at 09:01 (D241). **Twenty documents, 11,324 lines,
sixty-seven situations traced.** The last two landed in this session: `TONE.md`, written from his own
interview, and `presentation-design.md`, the twentieth. **The live stage is now STAGE 3, TECHNICAL
DESIGN — and it has never been scoped: no brief, no definition of done, no estimate, and nobody has
said it starts.** Everything is committed and pushed; the tree is clean.

---

## Read these first, in this order

1. **`CLAUDE.md`** — rewritten at the top. It opens on stage 3 now, with what is waiting for that reader.
2. **`DECISIONS.md` D238–D243.** *D242 is the biggest scope call since D239.*
3. **`docs/deferred.md` 44 and 45** — the two faults found in these two days. **45 is the test runner.**
4. **`docs/design/presentation-design.md` §14** — five traced scenarios, **two of which jam**.

---

## What was done

| | |
|---|---|
| **`TONE.md`** | Aaron's interview, written up. **41 rules, 11 worked examples, 19 open questions.** D238 |
| **`presentation-design.md`** | **706 lines. The twentieth and last.** Closes `GDD.md` gap 6, takes over its open question 3, and gives round 7's ruling 3 its form. D240 |
| **Post-alpha register** | **F36–F40**, plus a note splitting F19. Seven things pushed past the alpha, each with a written way back |
| **Alpha content scope** | D239 — two movements and the despotic state out; stateless ground in but unplayable; Texas / Great Lakes / West |
| **Aaron's four rulings** | D241 (stage closed), D242 (the writing goes post-alpha), D243 (the test route) |
| **Commits** | **6, all pushed.** One tag: `stage/presentation-design` |
| **New faults filed** | **2** — 44 (Deseret's politics) and 45 (the test runner). **Total standing: 12** |

---

## ⚠ THREE FINDINGS FROM TRACING, and they are other documents' work

**All three came out of walking scenarios step by step, not from reading.**

| | |
|---|---|
| **The opening board holds NOTHING IN FLIGHT** | *No offer sent and unanswered — **no turn −1 of any kind.** Aaron's taught first turn needs Miami answering a deal Houston sent before the game began, which is the beat that teaches the whole turn loop.* **`opening-board-design.md` §6 has a list of what the board does NOT open with and this was not on it** — never asked, rather than deferred. **Row added** |
| **A peace treaty as recognition is a mechanic with no home** | *Aaron's own line: "nations only sign peace treaties with nations." **That couples two things `diplomacy-design.md` keeps independent** — a treaty is a pair state, recognition is a separate matrix* |
| **"The worst option available" does not reach a symmetrical card** | *Ruled for a movement's demand. **Undefined when Miami counter-offers and neither answer is obviously worse.** Three readings, and they are different games* |

---

## ⚠ TWO CARDS LOOK ANSWERED AND ARE NOT

1. **`two-toll-systems` — approved, and it names no system.** *The card asked whether to decide now or
   leave it to stage 3. He said now, which was right. **Approving that did not pick one.*** *Re-asked
   on the board as `which-toll-system`.*
2. **`deseret-politics` — commented, and the note is my own evidence line quoted back.** *Still open.*

---

## What needs Aaron — three cards

| | |
|---|---|
| **⛔ What is the next session for?** | **Scope stage 3, or repair the twelve faults first.** *My lean: scope stage 3, because it is the stage all twenty documents were written for and several faults live in code that stage will rewrite. **Two of the twelve are cheap and isolated and worth doing either way*** |
| **Which toll system does the game mean?** | *Above* |
| **Where does Deseret sit on the ten-position board?** | *Above* |

---

## What was NOT done, and why

| | |
|---|---|
| **No code, no data, no tests touched** | *The twelve faults are FILED, not fixed. **A repair session is a different permission*** |
| **The `node --test` shim not written** | *A sign-off does not start new work. **The route is withdrawn instead***, and the harness's own false comment is still there because it is code |
| **Stage 3 not begun** | *Nobody has described it. **The next session's first job is to put a SHAPE to Aaron, not to start*** |
| **`TONE.md`'s opening paragraph not edited** | *One phrase in it was overtaken by his own rule-21 amendment. **It is his summary of his own position, and a summary quietly edited after the fact stops being a record.*** A note sits beside it |
| **Nothing sent to playtesters** | *He turned the `live` permission back OFF at 06:09. The playtest link is still 132 commits stale and still sent to nobody* |

---

## The state of the repository

- **Branch `master`, clean, everything pushed.** *`main` is the built playtest copy and is untouched.*
- **Version `v0.6`.** *No bump: no code changed.*
- **Permissions as of 06:09:** `rerun` ✅ · `fix` ✅ · `quality` ❌ · `live` ❌ · **Hog Wild ❌**
- **Control Board republished — version 41.** *Three cards, stage 3 marked live.*
- **⚠ A dev server was started on port 8000 to run the tests.** *Stopped at sign-off. If anything is
  still listening there, it is mine and it is safe to kill.*

---

## For the next session

**Run `/resume` first.** Then:

1. **Read the card asking what this session is for.** *If Aaron has answered it, that is the session.*
2. **If he has not**, the honest default is **scoping stage 3 and bringing it back for approval** —
   not starting it. *A stage nobody has described is not a stage anybody can begin.*
3. **Do not run `node --test`.** *See the top of this file.*
