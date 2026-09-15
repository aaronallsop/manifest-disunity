# Handoff — 14 September 2026, 20:58 (written 15 September, ~03:30)

**Written at the final commit of the sign-off.** If commits have landed after it, this document is
history and not truth — the session-start hook counts them and names them; read those first.

---

## 1. The state, and nothing is broken

**Everything is committed and pushed. Nothing failed. Nothing is unverified.**

**956 tests green, 0 failing, 51 files, 212.71 seconds — run in the browser at sign-off, not quoted.**
No game code, `data/`, `content/` or `DESIGN.md` was touched: three design rounds ran, and design
rounds write documents only. The suite was run anyway.

**⚠ STAGE 1 IS CLOSED. All seven ideation rounds.** Aaron closed rounds 5, 6 and 7 on the Control
Board at **02:53 on 15 September**, with the same click confirming the eight defaults round 5 took in
his place. **He did it while the session was still working**, so the closes were found by re-reading
the board's saved records at sign-off rather than in the conversation — every document has since been
brought into line.

**The current phase is now STAGE 2, DESIGN, and none of it exists.**

---

## 2. Read these first, in this order

| | Why |
|---|---|
| `CLAUDE.md` **definition of done** | Rewritten tonight. Names stage 2 as the current phase, carries its **whole backlog**, and records **the two lines Aaron drew today** |
| `DECISIONS.md` **D214, D215, D216** | Round 5; rounds 6 and 7 with the scope correction; and stage 1 closing |
| `docs/PROGRAMMER-RULES.md` **17 and 18** | Both earned today. **18 is the third repeat of one rule** |
| `docs/deferred.md` **33** | Three opening-board facts specified by rulings and not built — and a ruling now depends on two of them |
| The three round documents | `diplomacy-`, `events-`, `the-things-above-ideation.md` |

---

## 3. ⚠ The two lines Aaron drew today, and they bind every session after this one

**These matter more than any single ruling, because they change what a design session is allowed to
do.** Both are in `CLAUDE.md` now.

1. **"You are currently the game designer working towards a game design document. The actions/turn
   will be handled by the technical design director in the next step."** — **The turn budget and the
   clock are not the designer's.** Round 7 hands them forward as a *requirement*, not an answer, and
   **two of its four rulings are refusals to decide.** Whether a thing can work, and how, is the
   architect's.
2. **"Remember — you are not deciding what to cut."** — **The build order and what moves post-alpha
   are Aaron's and the planning stage's.** A design document supplies evidence: what a thing depends
   on, and whether the alpha's stated purpose needs it. It does not rank, recommend, or cut.

*Both arrived mid-round and both required correcting something already written. Round 7's §0a had
called the action budget "the round's central item" and promised to answer it; the claim is corrected
in place, in all three places it appeared, rather than edited away.*

---

## 4. What the three rounds decided, shortest useful version

**Round 5, diplomacy — 22 rulings, 86 ideas, 16 findings.** The in-tray was emptied on day one: 33
rows from four closed rounds, nine days uncollected. **Both blocking items closed** — the thaw
(ruling 9, named but its price deferred to stage 3) and the petition threshold (ruling 6, a fixed gap
below the secession line, which gives the game its middle act). **The best thing in it:** sponsorship
and petitions were ruled separately in September and nobody had joined them — together they make a
campaign a player *runs*, which is the answer to the risk the ideation plan named about itself.

**Round 6, events — 7 rulings, 74 ideas, 6 findings.** The most restrained round of the seven. A
shock has a **blast radius on the map**, so no world layer was needed; a nation feels it in proportion
to the ground it holds inside it; **no chains run in play**; the game opens on a front page dated
1 March 2036. **Ruling 3 deleted the entire remaining half of the round and nothing that matters was
lost.**

**Round 7, the things above — 4 rulings, 50 ideas, 6 findings.** Two rulings are the refusals above.
The two real ones: **playing the federal remnant is a different game** (restore, where everyone else
replaces), and **what a nation may know is gated on the relationship** — which answers three rounds'
questions at once and gives an alliance its first non-military benefit.

---

## 5. The three structural facts these rounds found, written down nowhere before

1. **"One action per turn" is not a rule with a flag. It IS the turn.** A turn is a *round*: sixty-one
   nations act in sequence, each nation's turn is its action, and the world advances once when the
   pointer wraps. **There is no "has acted" flag because there need not be one.** So changing it is a
   change to how the game is stepped.
2. **Three exceptions to it already exist and share one principle nobody had stated: a decision is
   free when you did not choose to be asked.** Recognise, a movement's demands, and now an event.
3. **The entire game has ONE piece of hidden information** — the unrest map's three bands for other
   people's ground — **and its written reason is not realism but that a screen must not become a
   targeting computer.** That is a better test than *"what would a government plausibly know"*,
   because it can be applied to a specific screen and answered.

---

## 6. The worst thing found, and it is still true

**A brand-new nation that nobody recognises has no diplomatic move available to it at all.** Trade,
treaty and transit all require **mutual** recognition and all refuse it; recognition is the only
unilateral act in the game and **every opening nation already recognises everybody**, so there is
nobody for a pariah to recognise. **Deseret is on the opening board and the game's answer to it is
wait, and hope.**

**The cure is ruling 9's overture and it is not built.** Round 5's §7 traces it in full.

---

## 7. ⚠ The rules you must not get wrong

**Programmer rule 17, earned this afternoon: verify the ROSTER, not only the code.** Round 5 read the
engine carefully, got every line of it right, and then wrote eleven rulings about the Deep South,
Appalachia, Philadelphia and six regions of stateless ground — **none of which is on the board.** The
game opens with **twelve** new nations: Texas's five, California's six, and Deseret. The story's
twenty-nine are a design in `secession-ideation.md` §8 and are **not built**, and four closed rounds
had been quoting them as though they were the game. *Before writing anything that names a nation,
read `DESIGN.md` §2.1 and the scenario content and list who is actually there.*

**Programmer rule 18, and it is the THIRD time: the Control Board is edited with the file editor.**
Tonight a Python script generated two phase entries and the escape sequences arrived as real line
breaks, which is a syntax error inside a string literal; the page's data object stopped evaluating.
**Nothing reached Aaron** — the check that reads the object back under `node` ran before publishing
and refused it. Reverted, redone by hand. **The rule is now general: text with quotes, apostrophes or
escapes is written by the file editor, never generated.** Scripts may still read and check; that is
what caught it.

**A design session does not touch code or data.** Not `js/`, `tests/`, `css/`, `index.html`,
`dev.html`, `server.py`; not `data/` or `content/`; not `DESIGN.md`; not `docs/spec/` without
permission.

---

## 8. What is waiting on Aaron — one card, and it is a day old

**Should a shortage stop things being MADE, or only lose them on the road?** Four of his own arrows
say the first. It has been the only thing on the board since the 14th and **three design rounds went
past it without touching it.** It is one line and the cheapest change on any list put to him.

---

## 9. Where to start next session: stage 2, and it has a backlog rather than a blank sheet

**One `docs/design/<system>-design.md` per system** — what the thing does, what it is measured in,
what the player sees, what happens at each level. **It is not inventing; it is converting** 536 ideas
and 178 rulings into seven specifications.

**What the rounds filed to it** (the full list is in `CLAUDE.md`):

- **The logistics spiral's brake** — the most serious thing round 4 found; three candidates, none
  chosen. *Start here.*
- **The federation's flat toll against the built corridor system** — and diplomacy's ruling 4 made it
  worse: two internal-trade regimes to reconcile with the one that is built.
- **A diplomacy screen** — six of eleven moves are diplomatic and all are reached through the map.
- **What a shock looks like on screen** — the first event about a *region*.
- **Whether infrastructure damage lasts** — today a wrecked rail hub is a raid, and nobody chose that.
- **Round 7's two open halves** — the remnant's condition set, and what a restricted view *looks* like.

**⚠ Do not size stage 2 from a guess.** Nobody has written one of these documents in this project, so
any figure would be invented — the thing this project has a rule against. **Write one, measure it,
then estimate seven.**

---

## 10. Known but unverified

- **Nothing in rounds 4–7's models has ever run.** Every ruling is paper.
- **The game has not been opened since 5 September.** Only the test page was run tonight.
- **Ruling 7 of round 4 still depends on where phosphate, potash and natural gas actually are, and
  that is NOT verified.** A data job; check it, never remember it.
- **Three watch items for the alpha**, none answerable on paper: whether the south runs away with the
  continent now that it is the only large region that can freely combine; whether the Confederacy gets
  assembled by agreement; and whether submitting to the state that claims you is too cheap an escape
  from being nobody.
- **The wiki is PAUSED at Aaron's instruction** (14 September). `docs/wiki/Economy.md` still says the
  economy has had no design round, which is false. **Do not fix it without asking** — he paused it
  deliberately.
- The repository is **public and that is correct** — his decision of 7 September. **Do not raise it.**

---

## 11. Before you stop, every time

Run `/signoff`, and **write the handoff last**. If you commit anything after it, rewrite it — step 7
proves it with a commit count that must print `0`.
