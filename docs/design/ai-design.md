# The AI — the other sixty nations

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `turn-design.md` (the budget, which changed under it) · `power-design.md`
(the Why-record shape it borrows) · **and every system that supplies a Preview** — `trade-design.md`,
`war-design.md`, `diplomacy-design.md`, `governing-design.md`, `movements-design.md`,
`economy-design.md`.

**Read by:** `presentation-design.md` · `opening-board-design.md` · `missions-design.md`.

> **The one-sentence version: it plays the game through the same preview the player sees, scores every
> option with the same Why record the stocks use, and its whole personality is one number — how
> frightened it is.**

---

## 1. The one rule that makes the AI trustworthy

> **The AI scores the SAME preview object the player's panel renders.**
>
> *"Being the same function is what stops the human's preview and the AI's model from ever disagreeing
> about what an action does — and **a disagreement there is unfalsifiable from inside the game, because
> each side only ever sees its own answer.**"*

**The preview is pure: no randomness, no interface.** *Its refusal reason is a **sentence**, not a code,
so the AI filters on whether it succeeded and the interface prints the string.*

**And the rules are kept apart from the policy on purpose:** *the move list is **"deliberately NOT
scored — scoring is policy and belongs in the AI; this is the rules."***

---

## 2. How a nation takes its turn

```
answer any offers          ← free, never uses the turn
list every legal move      ← the rules, unscored
plan each one              ← the player's own preview
score each one             ← a Why record
drop anything under the bar
soften into a probability and draw
set the army's posture     ← every turn, action or not
resolve
```

**Answering offers comes FIRST and costs nothing:**

> *"A nation that leaves requests unanswered while it goes shopping is not playing the same game as the
> player, who is stopped and asked… **Answering costs nothing and never uses the turn, which is the same
> rule the player plays under.**"*

**A refused move is a pass, not an exception:** *"The AI is allowed to be wrong about what it can
afford; **it is not allowed to stop the game.**"*

### 2.1 ⚠ AND THE WHOLE THING IS BUILT ON A TURN RULE THAT HAS BEEN SUPERSEDED

**It takes exactly one action per seat per turn. Every comment in the move layer reasons from that.**

> **D218, 15 September: *"There is no action budget at all. You may start as many things as you like;
> you end the turn; the world answers you."***

**So the AI plays a different game from the one the turn document describes.** *The scale of the problem
is known and was priced: **one AI round is about 735 plans and 153 milliseconds, so a second pass is
affordable.*** **What has never been measured is sixty nations each choosing SEVERAL things** — *which
the turn design calls **"the one genuine cost of removing the budget."*** *Gap 1, and it is the largest
thing in this document.*

---

## 3. What it may do, and the two things it deliberately may not

**One intent per bordering nation for annex, unite, trade, treaty and aid.** *One per non-ruling
ideology for changing government. **One** intent each for release and autonomy, canonicalised the same
way.*

**Transit is the interesting exception: it is offered ONLY to nations with no export access at all**,
and only the cheapest mode, *because "one candidate per neighbour per mode for everybody" was measured
and rejected — **one AI round is 735 plans and 153 ms, and that would have added about fifty.***

### 3.1 Recognising is deliberately not on the list, and the reason is the best paragraph in the file

> *"An AI's recognitions are **not a move competing for the one action it gets each turn** — they are
> every capital making up its own mind about every newcomer every turn, priced by standing and kinship
> and how long the thing has lasted. **A nation that spent its whole turn signing a paper about a
> three-Area rump would be a worse opponent, and fifty of them doing it would be an unreadable
> newspaper.** The player's is a move because the player's is a decision."*

### 3.2 ⚠ Revoking is also not on the list, and nobody said why

**A planner and a resolver both exist. Nothing ever proposes it.** *Unlike recognition, **it carries no
comment and no reason.***

> **The consequence is on the record: "No AI nation ever closes a corridor. They sign them, price them,
> and let them expire."**

**Two separate ideation rounds name it as an opportunity.** *Gap 2.*

---

## 4. Scoring — a Why record that is allowed to go negative

**It uses the stocks' record shape and deliberately does NOT go through their builder:**

> *"A score has to be able to be negative, **or the difference between a bad move and a catastrophic one
> disappears exactly where it matters.**"*

**Two invariants stated up front:**

1. **EVERY TERM IS A SHARE OF THE ACTING NATION.** *"That is what lets **one set of weights serve a
   two-Area rump and a sixty-Area giant** without a size table."*
2. **⚠ Posture is not the same thing as the sign** — *"reading posture off the sign gets the release
   valve exactly backwards, **which is a mistake worth naming because it is invisible until you watch a
   nation under pressure decide to invade someone.**"*

### 4.1 The weights

**Universal, on every move:** *People **1.00** · Wealth **0.70** · the Price **0.80** · and Solvency at
**1.20** if the move leaves under six turns of upkeep.* **The prize is always multiplied by its odds.**

| The heaviest | | |
|---|---:|---|
| **Closing a victory** | **1.30** | *"**The heaviest single weight, deliberately**: without it the AI does not know the conditions exist and **the human wins by default the moment they read the table — which is not an opponent but a scoreboard with nobody else on it**"* |
| **If a union fails** | **1.30** | *higher than the aversion to civil war: **a failed union costs you ground you already held*** |
| **Denying the leader** | **1.30** | *scored on the LEADER's binding requirement, not on your own progress.* **"Without it the AI plays solitaire beside a human reading the victory table"** |
| **A civil war** | **1.10** | graded by how far the annexation moves you politically |
| **Who it is with** | **1.10** | **above the money a trade deal pays** — *"the diplomacy is the point"* |

**And three small ones that carry the design:**

- **Wealth below people**, *"because people vote, pay tax and hold ground, and money only does the
  second."*
- **The relief valve at 0.60**, *"without it a fraying nation has no move but to keep expanding, **which
  is exactly the wrong one.**"*
- **Standing at 0.40, SIGNED, and the sign is the interesting part:** *"a nation that already resents you
  is **cheaper** to move against, because you have nothing left to lose with them. **Turning it negative
  gives you an AI that prefers to attack its friends, which is a coherent and horrible opponent.**"*

### 4.2 Posture — the whole personality, and it is one number

```
k = strainPosture × strain
every expanding term  × (1 − k)
every defensive term  × (1 + k)
```

**Strain is the PEAK movement share across the nation's own ground, read against the secession
threshold** — *"peak and not mean, because **a nation does not lose its average Area; it loses the worst
one.**"*

> *"**One number, two multipliers, and the whole difference between a secure nation that expands and a
> fraying one that consolidates** — no stored personality, so the posture follows the situation **and can
> change back.**"*

### 4.3 The bar, and the draw

**A move must clear 0.10 to be worth doing at all** — *"a nation that acts every single turn because
something scored 0.001 is both unrealistic and **exhausting to play against.**"*

**Then a softmax at 0.22:** *"0 always takes the best-scoring move, which makes fifty similar nations
behave identically and **makes the AI solvable.** Higher is more surprising and **worse at the game.**"*

---

## 5. Determinism

**One named stream, used only for the softmax draw.** *Set the temperature to zero and the AI draws
nothing at all.*

**Eleven streams exist across the whole game**, each seeded from the world seed plus its own name, *"so
adding a die roll to combat does not reshuffle party spawns."*

**And the round loop runs until the round ENDS, not for a fixed number of seats** — *after a bug where
**counting seats stopped one short of the wrap, which meant the world never ticked at all on exactly the
turns something interesting happened.*** **The backstop warns loudly if it fires**, because *"a silently
truncated sweep is a round the world half-played."*

---

## 6. ⚠ What it is worst at, ranked

| | | |
|---|---|---|
| **1** | **❌ A nation is charged three times over for its own founding movement** | *Strain reads the peak movement share on its own ground — **so Deseret [BUILT], holding the corridor its own movement organised, reads its heartland as MAXIMUM strain and plays permanently defensive.*** **Ruled fixed; not built.** *This is the largest live AI defect and it lands hardest on the one nation the whole opening scenario is built around* |
| **2** | **It has no personality** | *"A nation that believes it was wronged, or that it won, behaves differently — **and today they all behave identically.**"* Posture is derived from fright alone |
| **3** | **It never closes a corridor** | §3.2 |
| **4** | **It cannot value a BUNDLE** | *"It weighs one agreement at a time… **Give it a bundle and it will either take every bundle or refuse every bundle, and neither teaches anybody anything.**"* An idea was deferred on this ground alone |
| **5** | **It cannot explain a refusal** | *"Every other number in this game is a why record. **A nation that says no should say why**… Cheap, and it is **the difference between diplomacy and a slot machine.**"* |
| **6** | **It is deliberately stupid about crises** | *and that one is right — "a scoring apparatus of its own here would be a second opinion about a table twelve rows long"* |
| **7** | **It will throw itself at giants** | *accepted in writing: "**If that reads as foolish in the alpha, the fix is to make the AI weigh the percentage harder — not to put the wall back.**"* |
| **8** | **It can impose a trade on the player** with no consent step | |
| **9** | **It makes offers the player can never sign**, because reach is directional | |

---

## 7. ⚠ The explanation exists and nothing renders it

**The full ranked list of every candidate with its score and its Why record is exposed, and the reason
is excellent:**

> *"because it is **the honest answer to 'why did Texas do that'**, and because **a tuning pass on sixteen
> weights is guesswork without being able to ask a nation what it was thinking.**"*

> **⚠ It has no interface. Only the test suite reads it.** *Gap 3, and it is the cheapest valuable thing
> in this document.*

---

## 8. What the AI costs, measured

| | |
|---|---|
| **One AI round** | **735 plans, 153 ms** |
| **A headless world turn** | **33 ms** |
| **A full round with fifty nations acting** | **about 137 ms** |
| **A fifty-turn simulator run** | **1.7 s in the browser** |

**Fifty nations playing every turn is a fuzzer pointed at the rules**, and it has behaved like one:
*measured in one run, **35 of 53 nations opened by proposing a union**; 51 nations became 18 by turn 20;
and with the release weight set too high, 51 nations became **135**.*

**And the lesson that came out of that is a standing rule of this project:**

> *"**The first explanation for a symptom the AI surfaces is usually the rule the AI touched last, and
> usually wrong. The AI is a measuring instrument; what it measures is everything at once.**"*

---

## 9. What this hands the Technical Designer

| | |
|---|---|
| **❌ The AI is built on a turn rule that no longer holds** | §2.1. *And sixty nations choosing several things has never been measured* |
| **❌ A nation is punished for its own founding movement** | §6.1. *Ruled fixed, unbuilt* |
| **⚠ Can it play under a restricted view, and what does that cost?** | §10.3 |
| **⚠ Revoking has no candidate and no stated reason** | §3.2 |
| **The explanation exists and has no renderer** | §7 |
| **⚠ All twenty-four weights are unmeasured defaults** | Gap 4 |
| **⚠ The army-posture weights are literals, not tunables** | `force-design.md` |

---

## 10. Open questions

| | | Owner as stated |
|---|---|---|
| **1** | **Does an AI nation with a mission tree pursue it?** *"Is the player racing an opponent that does not know the race is on?"* | **Aaron, then the architect** |
| **2** | **Do the other fifty-four nations get trees?** | **Aaron, at the build-order stage** |
| **3** | **⚠ Can the AI act on a restricted view, and what does it cost?** *Ruled that it plays under the same restriction as the player — and **"an AI that must act on a restricted view is a harder AI to write and a worse one to watch. If it is given sight the player does not have, the player is playing against a cheat."*** | **The technical design director** — *flagged as "the real cost of this ruling"* |
| **4** | **Sixty nations each choosing SEVERAL things has never been measured** | **The architect.** *"The one genuine cost of removing the budget"* |
| **5** | **⚠ Re-derive the victory targets for a 200-turn game.** *They were set at 2–5× an AI-only world **on the reasoning that a player playing deliberately for EIGHTY turns should substantially outperform a mild AI.** The game is now 200 turns* | **The architect, named rather than discovered** |
| **6** | **Vassalage and the turn:** does the overlord spend the vassal's action, is vassalage AI-only, or does a vassal keep its action? | **Open, two answers recorded** |
| **7** | **Should the AI weigh bad odds harder, now the size shield is gone?** | **The alpha** |

---

## 11. Gaps

| | |
|---|---|
| **1** | **⚠ The AI is built on one action per seat, and there is no action budget any more** |
| **2** | **Revoking is a rule with no candidate and no stated reason.** *Recognition got a nine-line justification; this got nothing* |
| **3** | **The full explanation of every nation's reasoning exists and only the test suite reads it** |
| **4** | **⚠ All twenty-four weights are unmeasured defaults.** *None is overridden; none carries a measurement in its doc — **chosen by argument rather than by measurement***, which the project says of itself |
| **5** | **A denominator drift:** *"fourteen of sixty"* in one place and *"fourteen of sixty-one"* in two others — **and `trade-design.md` §5 now says the predicate itself was doing two jobs** |
| **6** | **The Closing term is named in the document list and defined nowhere in `docs/design/`.** *Its definition lives in a decision record* |

---

## 12. The scenarios this document must be able to narrate

### 12.1 ✅ A nation under pressure decides NOT to invade

**Step 1.** A movement is climbing in three of its Areas. **Its strain reads the worst one, not the
average.**

**Step 2 — every expanding term is discounted and every defensive one inflated**, by one number in two
directions.

**Step 3 — the annexation that scored well last turn now scores badly**, and **the release that scored
badly now scores well.**

**Step 4 — the relief valve fires.** *"Without it a fraying nation has no move but to keep expanding,
which is exactly the wrong one."*

**Step 5 — and nothing is stored**, so when the pressure passes the posture changes back.

> **✅ NARRATES, and it is the whole personality system in one number.** *No stored traits, no mood, no
> table — the posture follows the situation.*

### 12.2 ❌ Deseret plays permanently defensive because of its own people

**Step 1.** Deseret **[BUILT]** holds the corridor its own movement organised. *That ground is its
heartland.*

**Step 2 — strain reads the PEAK movement share on its own ground.**

**Step 3 — ❌ its heartland reads as maximum strain**, because the movement that founded it is still
measured there.

**Step 4 — so every expanding term is discounted to the floor and every defensive one inflated**, on
turn one, for ever.

**Step 5 — the one nation the entire opening scenario is built around plays like a nation about to come
apart**, because its own founding movement is counted as a threat to it.

**Step 6 — and it is RULED FIXED.** *A realised movement's own ground is loyalty, not pressure.* **Not
built.**

> **❌ JAMS, AND IT IS THE LARGEST LIVE AI DEFECT.** *It is also charged three times over — strain feeds
> the posture, the crisis deck and the release valve.*

### 12.3 ⚠ The player wins on a condition the AI cannot see them approaching

**Step 1.** The player quietly accumulates toward a non-conquest victory. *Both of those keep Influence
high by construction.*

**Step 2 — ⚠ so no coalition forms**, because threat is size × (1 − Influence). *That hole was found and
a victory-proximity term was added for it.*

**Step 3 — and the Denying weight fires above 0.6 of any condition**, deliberately below the level at
which the newspaper starts shouting: *"an opponent that only reacts once the alarm fires reacts too late
to matter."*

**Step 4 — ⚠ but the victory TARGETS were set for an eighty-turn game.** *The game is 200 turns.*

**Step 5.** *So the bar the AI is watching, and the bar the player must clear, were both calibrated
against a game less than half this long, **and nobody has re-derived them.***

> **⚠ NARRATES, AND THE MECHANISM IS GOOD — but it is aimed at a target that has moved.** *Named rather
> than discovered, which is the right way round; it is still open.*

### 12.4 ⚠ Sixty nations are given as many actions as they like

**Step 1.** The turn rule changes: **no action budget.**

**Step 2 — the player may start as many things as they like.**

**Step 3 — ⚠ the AI takes exactly one action per seat**, because that is what it was built to do and
every comment in the move layer reasons from it.

**Step 4 — so the AI is playing a strictly weaker game than the player**, and nothing says so.

**Step 5 — and the fix is not free.** *A second pass is affordable at 735 plans and 153 ms; **sixty
nations each choosing SEVERAL things has never been measured**, and the turn design calls that "the one
genuine cost of removing the budget."*

**Step 6 — and there is a standing precedent that decides the direction:** *"**The AI gets the same
budget as the player, whatever it is.**"*

> **⚠ JAMS ON A RULE MADE TODAY.** *The precedent is clear, the cost is unmeasured, and the measurement
> is the architect's.* **This is the largest single thing this document hands forward.**

---

*Sources, verified 15 September 2026: `js/ai.js` read end to end — the turn loop, the candidate walk,
every scoring term with its weight key, the posture aggregation, the softmax, the sweep guards and the
victory-requirement list; `js/moves.js` (`legal`, the Preview contract, and the two deliberate
exclusions with their comments); `js/events.js` (the crisis chooser and its sign inversion);
`js/tunables.js` (all 24 `ai.*` keys with verbatim docs, plus `coalition.wVictory` and
`secession.coreShare`); `content/tunables.json` (**no `ai.*` key is overridden**); `DECISIONS.md` D100,
D105, D106, D109, D114, D156, D170, D218, D223; `docs/deferred.md` 11, 14; `docs/design/turn-design.md`
§§7, 10, 11; `docs/design/the-things-above-ideation.md` ruling 3 and W12;
`docs/design/secession-ideation.md` ruling 16; `docs/design/missions-design.md` open questions.
**Timing figures are carried forward with their original attribution and were not re-measured this
session.***
