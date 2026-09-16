# The technical design plan — stage 3

**Written 16 September 2026.** *This is a PLAN, not the stage. Nothing in it has been started, and
nothing in it should be started until Aaron has approved the shape and answered §10.*

**Status: ⏳ AWAITING APPROVAL.** *The Control Board card is `stage-3-plan`.*

> **What this replaces:** nothing. **`GDD.md` §9 names this stage in one line — *"formulas, pseudocode,
> inputs and outputs, edge cases"* — and that line was the whole of it.** No brief, no definition of
> done, no order, no estimate.

---

## 0. What this stage is, in one paragraph

**Twenty design documents describe a game. 27,064 lines of JavaScript implement a different, earlier
one** — *measured 16 September 2026: 58 files, plus 16,912 lines of tests across 53 more.* Stage 3 is the
stage that converts the first into instructions precise enough to build,
**stated as differences from what already runs** rather than as a specification written from nothing —
because a specification written from nothing would quietly re-specify the half of the game that already
works, and this project has already paid twice for a figure measured against the wrong thing.

**Every number in this stage is the architect's** — Aaron's line of 14 September, and the reason round 7
refused to set the turn budget. **Every number in it is also a named tunable**, never a literal, which is
this project's oldest standing rule and the one that lets him change a value and reload.

---

## 1. What stage 3 produces

**A master plus satellites, the same shape stage 2 proved** — because the reader downstream is the same
kind of reader: somebody implementing one system who should not have to hold the other eighteen in their
head. The satellites live in `docs/technical/`.

| | |
|---|---|
| **`TDD.md`** | The master. The engine's shape, the contracts every system obeys, the turn pipeline, the state inventory, the index into the satellites |
| **One satellite per system** | Formulas, pseudocode, inputs and outputs, edge cases, **its number register**, **its delta against the build**, and **its test list** |
| **The reconciliation ledger** | One table: what is built, what is designed, and the difference, for all nineteen systems |
| **The build-order dossier** | **Evidence only.** What depends on what, what the alpha needs, what each piece costs. *It does not rank, recommend or cut — that is Aaron's and stage 4's* |

### 1.1 The folder is new, and that is a choice

`docs/design/` now holds three stages' output — the ideation banks, the twenty design documents, and the
two plans that governed them. **A fourth stage's twenty documents would make it unreadable**, so the
technical stage gets its own folder. *A technical choice with a sensible default, taken rather than
asked.*

---

## 2. ⚠ THE MEASUREMENT THAT DECIDES THE ORDER — eleven systems in one knot

**Stage 2's central promise was that a Technical Designer takes one system at a time and never has to
read a system they are not writing.** `GDD.md` §13 states it twice and D230 ratified the nineteen-way
split on it.

**Measured this morning from the documents' own `Depends on:` lines, read one by one rather than
regexed — and the promise does not hold for eleven of the nineteen.**

> **Blocs, diplomacy, economy, force, governing, movements, nation, population, power, trade and war
> form ONE mutually dependent cluster.** *There is no order in which they can be written where each
> only needs the ones before it. **Fourteen pairs read each other directly.***

| | |
|---|---|
| **In the knot** | 11 of 19 |
| **Orderable** | 8 — board, identity, turn, events, missions, opening-board, ai, presentation |
| **Mutual pairs** | **14.** blocs↔trade · diplomacy↔nation · diplomacy↔power · diplomacy↔trade · economy↔power · economy↔trade · force↔governing · force↔power · governing↔movements · governing↔power · nation↔power · nation↔war · population↔power · power↔war |
| **The hub** | **Power is read by twelve of the nineteen.** Board and diplomacy by ten each; economy by eight |

**⚠ This is not a fault in the design documents.** *A simulation game's systems are mutually dependent
because the world is — an economy that does not read a war and a war that does not read an economy would
be two games in one window.* **What it is, is a fault in the ORDERING PLAN**, which was never written
down and was assumed to be "dependency order" because stage 2 said so.

**⚠ And the eight "orderable" systems are not a queue you can work through either.** *Only THREE
documents in the project depend on nothing — **board, identity and turn**. The other five acyclic ones
are acyclic merely in the sense that nothing loops back to them: **events, missions, opening-board, ai
and presentation all read systems inside the knot**, so none can be finished before it.*

> **So dependency order gets you exactly three documents in, and stalls at the fourth.** *And the stall
> would look like a writing problem rather than a structural one, which is the expensive way to find it.
> **Naming it now costs one section. Finding it in week two costs the week.***

---

## 3. The ordering principle that replaces it

**Two principles, and between them they dissolve all fourteen pairs.**

### 3.1 Contracts before internals

**Specify what a system HANDS OVER before specifying what it does inside.** Once trade knows the exact
shape of what economy will give it, either can be written in full without the other being finished — the
pair stops being a cycle and becomes two documents against one agreed edge.

**This is not a technique borrowed from elsewhere; the build already does it in three places and they
are the three that have never caused trouble.** *`Moves.plan` returns a Preview and the interface and the
AI both read that one object, which is why the player's preview and the AI's model cannot disagree about
what an action does. The field registry means adding a per-Area field is one entry and the save cannot
silently drop it. The named random streams mean adding a die roll to combat cannot reshuffle party
spawns.* **All three are contracts. The contracts pass is that habit applied to the eleven.**

### 3.2 Then the turn pipeline, which is acyclic and already fixed

**The order the engine actually runs in is not in dispute and is not circular.** Seven phases over the
snapshot, then twelve against the live world, then the counter moves — `turn-design.md` §6, carried
forward from `DESIGN.md` §4, **and its order is load-bearing with the reasons recorded at each site.**

**So the eleven knotted systems are written in the order their work happens in a turn**, which gives:

> **population → movements → economy → nation → governing → force → diplomacy → trade → war → blocs →
> power**

**Power is last, which is both the engine's answer and the graph's.** *The five stocks recompute last
because every input they read is a result of this turn; and power is the one system twelve others read.
The two reasons are independent and they agree.*

**Population is the one that moves out of this list**, because it is only in the knot through power and
is otherwise substrate — it is written at T2 with board and identity, **which leaves ten for T4.**

---

## 4. The stages

**Seven, and the first two produce no system specification at all.** *That is deliberate: T0 and T1 are
what make the other five writable one at a time.*

### T0 — Foundations. One session. Produces no specification.

| | |
|---|---|
| **T0.1 The architect brief** | The block pasted into a new session, modelled on the designer brief — which is **stale and names ideation as the live stage** (`GDD.md` gap 10), so it must be replaced regardless |
| **T0.2 ⚠ The reconciliation ledger** | **The most valuable single artefact in this stage.** One table, nineteen systems: what is built, what is designed, the difference, and how big it is. **Nine satellites already carry this and ten do not** — so for half the game nobody has written down what already exists |
| **T0.3 The triage of the three hundred** | Below, §6 |
| **T0.4 The three measurements already waiting** | Below, §7. **Measured, not estimated** |
| **T0.5 The state inventory** | What a save must hold. **A project is new persistent state and there is no project module in the list that exists to stop state being forgotten by the save** — and nothing says where in the turn a project resolves. *`turn-design.md` §6.2* |

**Done means:** Aaron can read the ledger and see, per system, how far the game he has designed is from
the game that runs — and no system document has been started.

### T1 — The contracts pass. One document.

**Fixes the edges between systems so the eleven can be written singly.** What it must settle:

- **The Preview object** — `{ok, reason, cost, effects[]}`, and what an `effect` is allowed to be, because
  every new action in the design has to express itself in this vocabulary or the AI cannot score it.
- **What every system hands power**, since power is read by twelve.
- **The phase contract extended to projects** — a project is new state with no home and no resolution slot.
- **The field registry** — every per-Area field the design adds.
- **The Why-record row shape**, which missions, events and power all write into.
- **The named streams** any new die roll joins.
- **The tunable convention** — naming, range, doc line — so **370 entries** (*counted 15 September*) become five hundred without becoming a junk drawer. **And the honesty label with them: of 298 sliders counted strictly, only 21 said *measured* and gave the number.**

**Done means:** each of the fourteen mutual pairs has a written edge, and the pair can be pointed at.

### T2 — The substrate. Three documents: board, identity, population.

**Board and identity depend on nothing. Population depends only on things T1 has now fixed.** *This is
also where `MAX_DISTANCE` is settled, and it is named as the first thing the architect must do.*

### T3 — The turn pipeline. One document.

**The engine's spine: nineteen phases, their order, and the reason each sits where it does, as
requirements rather than commentary.** *Plus the thing removing the action budget broke — something now
has to end a nation's slot, and the old shape's identity between a slot and an action is gone.*

### T4 — The knot. Ten documents, in the §3.2 order.

> **movements → economy → nation → governing → force → diplomacy → trade → war → blocs → power**

**Each one against the contracts fixed at T1, each one carrying its delta against the build.** *This is
the bulk of the stage and the only part of it whose order was ever in doubt.*

### T5 — The frame. Five documents: events, opening board, missions, AI, presentation.

*Nation is written in T4 because it is inside the knot; what remains here is what the world throws at
you, the board's opening state, the three mission trees, the other sixty players, and every screen.*
**Presentation is last because it reads nine systems and `TONE.md` — the longest dependency list in the
project.**

> **Nineteen satellites and a master. 3 + 1 + 10 + 5 = 19, and every system is in exactly one stage.**
> *Checked rather than assumed: the first draft of this plan left `events` in no stage at all and put
> `population` in two.*

### T6 — The build-order dossier. One document. Evidence only.

**What depends on what, what the alpha's stated purpose needs, what each piece costs.** *It does not
rank, recommend or cut. That line is Aaron's, drawn 14 September, and it binds this stage exactly as it
bound the last.*

---

## 5. What "done" looks like for ONE technical document

**Stage 2's satellites had five parts and the shape worked. Stage 3's have seven**, and the two additions
are the ones that make a document buildable rather than merely correct.

| | |
|---|---|
| **1. Depends on** | Carried over. Names every document whose state or formulas it needs |
| **2. What is built today** | **The delta. NEW.** What exists, what is designed, and the difference — the shape `identity-design.md` §8 and `opening-board-design.md` already use |
| **3. The formulas** | Every one, with its inputs, its outputs, its units and its range |
| **4. The pseudocode** | Enough that somebody could build it without inventing anything |
| **5. Edge cases** | What happens at zero, at one, at the boundary, and when two of them fire in the same turn |
| **6. The number register** | **NEW — and `force-design.md` §6 invented it without being asked.** Every constant this system has, each one a named tunable with a range and a doc line, and **each one saying whether its value is measured or argued** |
| **7. The test list** | What must be true after this runs. *The suite held **956 checks over 205 suites** when it was last run — 16 September 2026, in the browser, the only route that runs it. **A new system arrives with its own tests or it arrives untested*** |

**And it ends with its traced scenarios, as stage 2's did** — D232, reinstated by Aaron, and the practice
that found contradictions in every closed round that the rulings alone did not. **A technical trace is
harder than a design trace and worth more: it walks the actual numbers.**

> **The test a technical document has to pass, and it is not the same as a design document's:**
> **could somebody who did not write it build this, without asking a question that is not already in
> its open questions?**

---

## 6. The three hundred items, and how Aaron answers fifty-two questions without getting fifty-two cards

**⚠ Counted this morning across all twenty documents, item by item.** *The project's own convention says
this list lives at the end of the document that owns it and is never reassembled from memory — so it was
re-read, not remembered.*

| | |
|---|---|
| **Open questions, live** | **134** |
| **Gaps, live** | **166** |
| **Total standing** | **300** |
| **Already closed inside the documents** | 13 |

**Who owns the 134 questions, by the documents' own owner column:**

| | |
|---|---|
| **Aaron** | **52** |
| **The architect / stage 3** | **33** |
| **Unassigned or not stated** | ~20 — *and an unassigned question is a question nobody will ask* |
| **The alpha** | 4 |
| **The data stage** | 3 |
| **Named elsewhere** | the rest — mostly filed to a specific document |

**Nothing is wrong with this.** *An honest document ends with what it does not know, and three hundred
is what that honesty costs across eleven thousand lines.* **What is wrong is that nobody had counted it,
so the stage was being sized as "write twenty documents" when it is "settle three hundred things."**

### 6.1 How they get answered

**T0.3 sorts all three hundred into four buckets and nothing else happens to them:**

1. **Blocks the stage** — cannot start the owning system without it. *These become cards, early, few.*
2. **Answered inside the stage** — the architect's, and the stage exists to answer them.
3. **Waits for the alpha** — a question paper cannot settle. *Parked with the test that would settle it.*
4. **Aaron's, but not blocking** — **batched.**

**The default I am taking rather than asking about: Aaron's non-blocking questions arrive at the head of
the system document that owns them, three or four at a time, with the document open in front of him** —
not as fifty-two cards on the board. *The standing rule is to keep the decision queue small, and fifty-two
cards would be a queue nobody could read. A question asked beside the thing it decides also gets a better
answer, which round 6 demonstrated and round 5 paid for.*

**The two cards already live fold in here rather than being asked again separately:** *which toll system
the game means* is a **blocking** question for the trade document, and *where Deseret sits* is **blocking**
for the opening board and for the Deseret mission tree.

---

## 7. What is already waiting for this stage, named rather than discovered

**Four things, and each was handed forward on purpose by the document that found it.**

| | |
|---|---|
| **1. `MAX_DISTANCE` has no value** | **The denominator every tuned threshold in the game is measured against** — coalitions, drift, splinters, defection, civil-war severity, trade alignment, liberty satisfaction, AI diplomacy. On two axes the rule was the widest *authored* pair, **1.7804**, explicitly not the box diagonal. **On three axes the widest authored pair IS the diagonal, 2√3 ≈ 3.4641** — and the old rule does not decide it, because its whole point was that the diagonal was unoccupied. *`GDD.md` gap 11. **T2.*** |
| **2. Nobody has measured the new turn** | An AI round was **735 plans and 153 ms** when sixty nations chose **one** thing each. **They now choose several, and nobody has measured it.** *A headless world turn is 33 ms; a full round about 137 ms; fifty turns 1.7 s in the browser.* **This is the one genuine cost of removing the action budget. T0.4** |
| **3. The victory targets were set for an eighty-turn game** | **A game is now two hundred turns.** *`turn-design.md` §7.2 names it as one of two things 200 turns broke.* **T0.4** |
| **4. Two tone rules are requirements on generators, and no generator knows** | A generated flag may carry no real hate-group iconography; leader name pools are drawn by region and history and **never correlated with ideology**, so the generator cannot make a racial claim nobody wrote. **Checked against a generator, not a writer — which makes them the architect's, and neither generator is specified anywhere.** *`GDD.md` gap 12* |

### 7.1 And three that this plan adds

| | |
|---|---|
| **5. Three documents hand nothing forward** | Seventeen satellites end with *"What this hands the Technical Designer"* — **122 items in total.** **`missions-design.md`, at 1,003 lines the largest document in the project, has no such section**, and neither does the master. *`force-design.md` has one under a better name.* |
| **6. Ten systems have no written account of what is built** | Nine satellites carry a built-against-designed section. **Ten do not** — ai, blocs, board, events, governing, missions, population, power, presentation, turn. *That is what T0.2 exists to fix* |
| **7. ⚠ THERE ARE THIRTY-EIGHT STANDING FAULTS, NOT TWELVE** | **Counted 16 September 2026, entry by entry.** *Thirty numbered sections (16–45), every one still open, plus eight unclosed rows in the register's own top table (6, 8, 10, 11, 12, 13, 14, 15).* **The "twelve" the board card and the handoff both use is 34–45 — the dozen the DESIGN STAGE found — and it has been quoted as if it were the whole register.** Below |

### 7.2 ⚠ The fault count, stated properly, because a decision was taken against the wrong one

**Aaron was asked to choose between scoping this stage and "repairing the twelve faults first", and he
chose scoping.** *The choice stands and is not affected. **The number he was given was wrong, and it was
wrong in the direction that made repair look cheaper than it is.***

| | |
|---|---|
| **Found by the design stage** | **12** — entries 34 to 45. *This is the figure in circulation* |
| **The design wiki's own defects** | **13** — entries 17 to 29. *Cosmetic to structural; nobody has triaged them* |
| **Everything else standing** | **13** — entry 16, entries 30 to 33, and **eight unclosed rows in the top table**, including *trade offers that can never be signed*, *a nation charged three times over for its own founding movement*, and *the external markets still running the pre-alpha model* |
| **TOTAL OPEN** | **38** |

**How it happened is worth one line, because it is the same mechanism as the stale line counts.** *The
register has two formats — a table for 1 to 15 and numbered sections for 16 to 45 — and the twelve were
counted from the section the design stage had been adding to.* **Nobody counted the file.**

> **What it changes: nothing about the decision, and something about T0.3.** *The triage now has thirty-
> eight faults to place alongside the three hundred design items, and **entry 14 in particular is not a
> defect the technical stage can ignore** — a nation reading its own founding movement as maximum strain
> touches the AI's posture, the pressure map and the treasury, and it is Deseret's problem before it is
> anybody's.*

---

## 8. What this costs

**⚠ Stated as an extrapolation from one data point, which by this project's own standard is not a
measurement.**

| | |
|---|---|
| **Stage 1, ideation** | 11,725 lines · seven rounds · **536 ideas, 178 rulings.** *Carried from the record, counted 14 September* |
| **Stage 2, design** | **11,350 lines · twenty documents · two days, 42 commits, two Hog Wild runs.** *97% of stage 1 — a design stage converts an idea stage very nearly one for one* |

> **⚠ The stage 2 figure is 26 lines higher than the one the record publishes (11,324), and the figure
> above is the one measured today.** *The record's was counted yesterday and the documents have been
> edited since — 2 lines in the master, 24 across the satellites. **Recorded rather than silently
> corrected, because a 0.2% drift in a day is the measurable form of this project's most repeated
> lesson** and the next person to quote 11,324 should know which day it belongs to.*
| **Stage 3, forecast** | **No smaller, and probably larger.** *A technical document carries formulas, worked numbers and a test list where a design document could say "the architect decides"* |

**What is known precisely rather than forecast:**

- **T0 is one session** and produces no specification — the ledger, the triage, three measurements, and a brief.
- **T1 is one document** and every other stage waits on it.
- **T4 is eleven documents** and is the bulk of the stage.
- **The forecast has no dates.** *In scope has never had dates on this project and that is deliberate.*

---

## 9. What this stage must NOT do

**Five, and four of them are standing rules that apply here without amendment.**

1. **It does not decide what to cut.** *Aaron, 14 September. The build order and what moves post-alpha are his and stage 4's. A technical document supplies evidence about cost and dependency; it does not rank.*
2. **It does not change what the game does.** *A technical document that finds itself redesigning a system has found a design defect — it stops and files it against the design document, which is then corrected with a reason.*
3. **It does not tune.** *A number gets a named tunable, a range, a doc line, and an honest label saying whether it is measured or argued. **Choosing the value that makes the game feel right is the alpha's job, not paper's.***
4. **It does not touch the full game while working on economy mode, and it does not create a second tuning file.** *Both standing.*
5. **⚠ It does not start building.** *Unless §10's second decision says otherwise — which is exactly why that decision is Aaron's and is asked below.*

---

## 10. The decisions this plan needs from Aaron

**Two. Everything else in this plan is a default I have taken and said so.**

### Decision 1 — Does stage 3 specify the whole game, or the alpha first?

| | |
|---|---|
| **Whole game** | All nineteen systems specified to build standard before anything is built. **Complete, and nothing gets designed into a corner.** *Cost: the longest possible gap before anything is playable, against a game that is already half built and has twelve standing faults* |
| **⭐ Alpha first, whole-game aware** | **My recommendation.** Full build-standard specification for what the alpha needs; for everything else, **only its contract** — what it must expose to its neighbours — so nothing is foreclosed. *The alpha's content scope was already set by Aaron himself on 15 September, so following it is not a cut — it is following a cut he already made* |

### Decision 2 — Does all of stage 3 finish on paper before any code, or does it interleave?

| | |
|---|---|
| **All on paper, then build** | The stage order as `GDD.md` §9 states it. **Clean, and every decision is visible before anything is committed.** *Risk: twenty technical documents written against a build that nobody is correcting, which is how the three hundred items came to exist in the first place* |
| **⭐ Foundations first, then slices** | **My recommendation.** **T0 and T1 complete on paper** — they are cheap, and everything depends on them. Then specify a system and build it before specifying the next. *Each slice ends with something that runs and is tested, and the ledger stays true instead of ageing* |

**⚠ Both recommendations point the same way and it is worth saying why.** *This project's most expensive
lesson, learned three times now, is that a figure measured before the work is finished is a figure about
something else.* **Twenty technical documents written before a line of code is a twenty-document figure
about something else.**

---

## 11. Open questions in this plan itself

*A decision nobody has made, kept separate from a gap, exactly as the design documents do.*

| | | Owner |
|---|---|---|
| **1** | **Do the three mission trees get technical documents, or are they content?** `missions-design.md` is already flagged to split at the system/trees seam, and the trigger is a fourth tree. **Three trees may be data rather than specification** | The architect, at T5 |
| **2** | **Does the alpha test run before stage 3, during it, or after?** *Four design questions are owned by "the alpha" and cannot be answered on paper — and the built alpha has never been played by anyone who did not write it* | **Aaron** |
| **3** | **What happens to the twelve standing faults?** *Two are cheap and isolated. The rest sit in code this stage restructures* | **Aaron**, and it is half-answered — he chose scoping over repair |
| **4** | **Does `DESIGN.md` survive stage 3?** It is the source of truth for what the game DOES, and by the end of this stage nineteen technical documents will also describe what it does. **Two sources of truth is the problem this project has solved twice already** | The architect, at T6 |

## 12. Gaps in this plan

| | |
|---|---|
| **1** | **No estimate has a date, and the one cost figure is an extrapolation from a single stage.** *Stated rather than dressed up* |
| **2** | **The plan assumes the twenty design documents are internally consistent, and three hundred open items say nobody has checked.** *T0.3 is the first time all twenty are read against each other* |
| **3** | **Nothing here says what happens when a technical document disagrees with a design document.** *§9.2 says stop and file it. It does not say who resolves it, or how fast* |
| **4** | **The test list in §5 assumes new tests can run.** **They cannot be trusted under the runner the README used to recommend** — `docs/deferred.md` 45 — and the browser route took **282 seconds for 956 checks** on 16 September. **At fifteen hundred checks that is a real cost to this stage and nobody has priced it** |
| **5** | **This plan has not been checked against the twelve standing faults one by one.** *It says they sit inside code the stage restructures, which is true of most of them and was not verified for each* |
