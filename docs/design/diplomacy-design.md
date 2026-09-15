# Diplomacy — what two nations are to each other

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `identity-design.md` (kinship, and the affinity function the recognition
formula reads) · `power-design.md` (Influence, which recognition feeds) · `nation-design.md` (who is a
pariah and why) · `trade-design.md` (what recognition gates).

**Read by:** `blocs-design.md` · `war-design.md` · `ai-design.md` · `presentation-design.md` ·
`opening-board-design.md` · `missions-design.md`.

> **⚠ PROGRAMMER RULE 17 — AND IT BITES HARDER HERE THAN ANYWHERE ELSE.** *Round 5 described the
> story's board as though it were the built one and had to correct itself in place.* **"Thirty-three
> permanent quarrels" is a figure about the STORY board. On the built board the most it could be is
> TWENTY — ten Texan pairs and ten Californian — and today it is ZERO.** *Nothing in this round that
> touches the Confederacy, the capital contest or stateless ground can be built until the story's board
> is.*

> **The one-sentence version: this system has more verbs than any other — six of the game's eleven
> moves — against a budget of one action a turn, and it reaches all six by clicking the map.**

---

## 1. What is built and what is not, before anything else

| **BUILT** | **DESIGNED, NOT BUILT** |
|---|---|
| **The relations list** — append-only, directed, decaying, 15 kinds | **The eight-state pair spine.** *No stance machine exists at all* |
| **Recognition** — a matrix, a five-term chance, four costs of being a pariah | **Alliances, guarantees, vassalage, blocs, federations** |
| **Coalitions** — form on threat, dissolve when it passes, nobody signs | **Every contest hostility floor.** *Zero exist on the board today* |
| **Patronage** — ⚠ *a client-state system nobody knew was there* | **Sponsorship, the overture, mediation** |
| **Treaties and aid** | **Any hostility gate on trade or transit** |

> **⚠ The single most important line in this document: THERE IS NO STANCE STATE MACHINE.** *Hostile,
> Wary, Cease-fire and Allied are **names for something the game cannot represent.*** **What exists is a
> score with five labels printed on it.** *Finding C, and it is half-open.*

---

## 2. The eight-state pair spine

**⚠ It is not in the diplomacy round.** *It was ruled in round 2 and assigned here by D217, for a reason
worth keeping:* **"It describes what two nations are to each other; war is one of its states. Somebody
writing the fight should not have to own hostility's cooling clock."**

**Aaron's list, ordered least to most constrained:**

| State | His words | |
|---|---|---|
| **Peace** | *"You can do anything with the nation"* | live |
| **Wary** | *"Trade and dealings are permitted, but guarded. **The step every cooling grudge passes through on its way back to Peace**"* | live — **added later, which is what makes it eight** |
| **Peace-treaty** | *"You signed a treaty with stipulations — trade, territory, repayment. **Breaking it has a huge impact**"* | live |
| **Hostile** | *"Things have happened that bring you close to war without being at war. **It has impacts**"* | live |
| **Cease-fire** | *"**All the impacts of war, but you cannot attack**"* | live |
| **War** | *"Trade is prohibited and you may attack"* | live |
| **Subject** | *"Deferred — later"* | **closed as Vassal by ruling 5** |
| **Allied** | *"Deferred — later"* | **taken by conquest ruling 27, not built** |

### 2.1 The transitions, and the shape they make

| From | Leaves by | Into |
|---|---|---|
| Peace | the five causes | Hostile |
| Peace | one nation declaring | War |
| **Hostile** | **time** | **Wary** *— not straight back to Peace* |
| **Wary** | **time** | **Peace** |
| **Wary** | the five causes | back to Hostile |
| War | **both agreeing** | Cease-fire |
| War | one side ceasing to exist | — |
| Cease-fire | its term running out | Peace-treaty if signed, **otherwise Hostile** |
| Peace-treaty | its term running out | Peace |
| Peace-treaty | **being broken** | ⚠ **open** |

> **The shape: the only two transitions needing both nations to agree are the ones INTO a cease-fire
> and INTO a peace-treaty.** *Everything else one side can do alone or time does by itself.* **So a pair
> cannot get permanently stuck anywhere except War** — which is the property that makes the machine
> safe.

---

## 3. What is actually built — one list, and everything reads it

### 3.1 The relations list

```
{ turn, from, to, kind, magnitude }
relation(a, b) = base + Σ magnitude × decay^(now − turn)     clamped to −1 … +1
```

**Directed, append-only, and every opinion in the game is therefore something that HAPPENED** — *which
is what makes the record answerable rather than assumed.*

**Fifteen kinds. Five of them are good.** *Verified by count this session; the round document says
sixteen and is wrong on the count while right that five are positive.*

| Bad | | Good | |
|---|---:|---|---:|
| **reneged** — *broke a pact* | **−1.40** | **aided** | **+0.30** |
| **seceded** — *we walked out* | **−0.40** | **granted** — *handed us ground* | **+0.30** |
| **broke** — *your union bid shattered us* | **−0.35** | **recognised** | **+0.20** |
| **warred** · **revoked** · **lost** | **−0.30** | **treatied** | **+0.18** |
| **annexed** *(per Area)* | **−0.22** | **traded** | **+0.12** |
| **betrayed** — *recognised our rebels* | **−0.16** | | |
| **absorbed** · **witnessed** | **−0.14 · −0.05** | | |

**Three of those carry the design in their doc strings and are worth reading twice:**

- **`witnessed`, at −0.05, is the seed of every coalition.** *"A nation nobody has attacked still ends
  up surrounded by neighbours who have been watching. **Without a witness term a conqueror is resented
  only by its victims, who are by then the nations least able to do anything about it.**"*
- **`traded`, at +0.12, is the only term that accumulates through ordinary play rather than through
  violence** — *which is what lets a patient nation build standing without taking anything.*
- **`reneged`, at −1.40, is worse than being annexed by somebody who never promised otherwise** — *which
  is the entire reason a treaty is worth signing.*

**Decay is 0.94 a turn** — *an event is two thirds of itself after ten turns and a fifth after thirty.*
**"This is what makes 'recently' mean something without anybody storing a window"** — *and setting it to
1 gives nations perfect infinite memory, which is a different and much less forgiving game.*

**Scale is capped at 3×:** *five Areas taken is worse than one, but **the point of a magnitude is that a
big event is bigger — not that a big enough event is unforgivable forever.***

### 3.2 What the player is actually shown — and it is one sentence

```
band + the single heaviest LIVE memory + its age
```

> **"Cold: took our ground, 6 turns ago."**

**Bands: Close ≥ 0.5 · Warm ≥ 0.15 · Indifferent > −0.15 · Cold > −0.5 · Hostile ≤ −0.5.**

**⚠ These are labels printed on a score and nothing else. There is no state behind them.** *A pair
reading "Hostile" is not in the Hostile state of §2 — that state does not exist.* **Two vocabularies,
one word, and nothing in the project says so.**

**And the inputs are sorted by DECAYED weight, not raw magnitude** — *so the sentence names what is
heaviest **now**, which is the right answer and is not the obvious one.*

> **⚠ GAP FOUND IN CODE: one memory kind has no label.** *`revoked` — a closed corridor — is in the
> kinds table and not in the labels table, so it falls through to the raw key.* **The player is shown
> *"Cold: revoked, 3 turns ago."*** *Fifteen kinds, fourteen labels. Verified by reading both tables
> this session.*

### 3.3 What the player is NOT shown, and it is the real gap

**The decay is invisible.** *The band and the heaviest memory are both live figures; nothing tells the
player that a grievance is **fading**, or how fast, or when it will stop mattering.* **A player who
waits is doing something the interface never confirms is working.**

---

## 4. Recognition — one scalar, one matrix, and the pivot

**The 51 opening nations are recognised by everybody unconditionally and nothing is stored.** *Only
nations founded during play get a row.* **⚠ Which is also why the federal remnant recognises everybody
and nobody wrote it down** — `docs/deferred.md` 33.2.

### 4.1 The chance, and its five terms

```
value = clamp01( disposition + Σ weight × normalised term ) × rate
```

| Term | Weight | |
|---|---:|---|
| **Let go of** — *has the parent signed?* | **0.40** | **THE PIVOT, and the largest single term.** *"While the state it broke from calls it a rebellion the rest of the continent has a reason to wait; **the turn the parent gives in, the queue moves.** This is what makes a player's recognition worth asking for, and what makes refusing one a weapon."* |
| **Standing** *(signed)* | **0.45** | Largest of the four ordinary terms. *"Recognition is the cheapest favour a nation can do… **a nation that has taken ground from you will leave you in the cold for a decade**"* |
| **Endurance** | **0.25** | *"A state that is still there next year is a fact, whatever anybody thinks of it. **This is the term that guarantees the problem is temporary** — without it a hated breakaway with a hostile parent would stay a ghost forever, which is a dead end rather than a difficulty"* |
| **Kinship** *(signed)* | **0.20** | *"Deliberately smaller than standing, because **what a state has DONE to you should outrank what it believes**"* |
| **Weight** | **0.20** | *"Nobody refuses to deal with a fifth of the continent on principle"* |

**Base disposition 0.22** — *a newcomer nobody has an opinion about is recognised by a given nation
roughly once every thirteen turns, so a breakaway spends its first years as a pariah unless somebody
speaks for it — **which is the problem the system exists to create.*** **Rate 0.28** is *a cap rather
than a speed: **even an ideal case takes a few turns to sweep the continent, because fifty capitals do
not move on the same day.***

**The full-weight figure is calibrated against the real board:** *the opening board's largest nation is
California **[BUILT]** at 12.7%, so 8% is a genuinely large breakaway — **the Deseret [BUILT] scale** —
rather than every fragment that gets a flag.*

**⚠ The player is never rolled for.** *Recognition happens **to** you and **by** the AI; your own
signature is always your choice.*

### 4.2 What being a pariah costs — four things, all live

| | |
|---|---|
| **No bilateral trade** — and the gate is **MUTUAL** | both must recognise the other |
| **The smuggler's rate** below 0.35 legitimacy | *"A hard lock would make an unrecognised landlocked state unplayable **and would also be untrue — what an unrecognised country loses is the margin, not the trade.**"* It pays **45%** of the going rate at the bottom, rising as the world comes round |
| **No coalition seat** below 0.30 | *"Nobody coordinates with a state they do not admit exists."* **Lower than the trade floor because standing shoulder to shoulder against a common threat is easier than signing a paper** |
| **An Influence deficit**, weighted 0.35 | **Signed and measured as a deficit**: fully recognised contributes nothing, wholly unrecognised loses the full weight |

**Legitimacy bands: Recognised ≥ 0.75 · Partly ≥ 0.45 · Barely ≥ 0.15 · Unrecognised.**

### 4.3 ⚠ THE ONE ROUTE OUT OF THE TRAP DOES NOT EXIST

**A tunable called `aid.recognitionBoost` sits in the tuning file at 0.25, and its own doc string says
what it is for:**

> *"Added to the recipient's per-turn chance of recognising the donor, scaled by patron weight. **Aid is
> how an unrecognised state buys its way onto the map, which is the one route out of the recognition
> trap that does not involve winning a war.**"*

> **❌ IT IS READ BY NO CODE.** *Verified this session across `js/` and `tests/`: the only occurrence is
> its own definition.* **The chance formula has five terms and aid is not one of them.**

**So a pariah that spends its treasury buying friends gets the money's other effects — the `aided`
memory at +0.30, which feeds Standing, which IS a term — but not the thing the tunable promises.**
*The route exists indirectly and at a fifth of the advertised strength, and **the tuning file describes
a mechanism the game does not have.*** **Gap 1, and it is the kind that survives because it looks
implemented.**

---

## 5. The twenty-two rulings

**All ruled 14 September 2026. Closed with rounds 6 and 7 by one click at 02:53 on 15 September.**

### 5.1 The three that decide which quarrels are permanent

| | Aaron's words | |
|---|---|---|
| **1** | *"Texas and California stays hostile the whole game. Confederacy thaws."* | **The hostility floor is per contest, not a global rule** |
| **2** | *"All the way."* | **A Confederate claimant is an ordinary neighbour** — may warm, sign, ally, federate **or unite** while still claiming the prize. **The contest puts no ceiling on the relationship** |
| **3** | *"Permanent, like Texas and California."* | **The capital contest never thaws** |

> **The rule underneath all three, and it is the best sentence in the round:** *"**a contest thaws when
> the thing being restored is history, and stays frozen when it is last year.** The Confederacy is a
> memory. Texas, California and the Union are a bereavement."*

**⚠ The arithmetic is a STORY-board figure.** *33 pairs, 10 with a diplomatic exit and 23 without.* **On
the built board the maximum is twenty and the actual is zero.**

### 5.2 The rest, in one table

| | | |
|---|---|---|
| **4** | *"Two objects — a bloc is light."* | **A bloc is a standing multilateral deal and nothing more.** *`blocs-design.md`* |
| **5** | *"Foreign policy only."* | **A vassal keeps its turn and loses its foreign column** |
| **6** | *"A fixed gap, set once."* | **The petition line is ONE number, a fixed gap below the secession line, the same for every movement** |
| **7** | *"Allow it — it is the point."* | **Sponsor a movement, wait, then invite it.** *Ground changes hands with no army* |
| **8** | *"After the alpha test."* | ⚠ **SUPERSEDED by D222 — see §7** |
| **9** | *"Let's save this decision for the architecture stage… let's file it as a diplomatic action."* | **The overture exists and is named. Its price is stage 3's** |
| **10** | *"Yes, and joining brings recognition."* | **Admitting somebody to a bloc IS recognising them** — every member's signature at once |
| **11** | *"Author them all, before the alpha."* then *"Stands — build them first."* | **The board opens with its agreements on it.** *It moved the roadmap* |
| **16** | *"Terrain with a price."* | **Stateless ground is terrain with a toll. Nobody signs for it, nobody collects it** |
| **18** | *"Whoever takes the ground inherits the claim."* | **The parent relationship is a property of the TERRITORY** |
| **22** | *"The old rule was only ever about Texas."* | **Politics ruling 31 narrows to the Texan five alone** |

### 5.3 The eight defaults he confirmed with the same click

**⚠ They are never listed in one place in the source document.** *Derived by construction; there is
exactly one consistent set.*

| | What was taken |
|---|---|
| **12** | **Recognition's payoff is their gratitude, and gratitude is already a number.** *Nothing new to build* |
| **13** | **An inherited quarrel decays at the normal rate.** *The better version — frozen while the alliance stands — was rejected because **there is no relationship object to hang it on***, and a non-decaying grudge freezes the board |
| **14** | **A creditor may demand recognition, transit or a vote — never ground or submission.** *"A debt is not an ultimatum and **collapsing the two would make every loan a conquest**"* |
| **15** | **A guarantee is a one-sided alliance** — one object serving guarantee, protectorate and Canadian protection. **Mediation deferred** |
| **17** | **A government may propose a union with nobody asking it to.** *"Making this one reactive would put **the game's only peaceful merger permanently in the hands of the movement layer**"* |
| **19** | **ONE offer object and five things wear it** — petition, ultimatum, proposal of union, demand of submission, offer of alliance. *"Five objects would mean five sets of rules… **and they would drift apart**"* |
| **20** | **An alliance is negotiated like a deal and has no term.** *"A pact that merely expires is weather"* |
| **21** | **Intervention needs no new object. It is the coalition, already built** |

> **⚠ AND ELEVEN MORE DEFAULTS WERE TAKEN INSIDE RULINGS THAT WERE NOT THEMSELVES DEFAULTS**, confirmed
> by the same click without ever being enumerated. **Three are load-bearing and are recorded here so
> they are not mistaken for settled design:**
>
> - **A bloc cannot expel**, and **a bloc does NOT make its members peaceful with each other** — *two
>   members of the same bloc may be Hostile.*
> - **Vassalage can be DEMANDED, and refusing is a casus belli**; it can be offered upward; and **a
>   vassal may repudiate, which is a hostile act rather than a free exit.**
> - **Admission to a bloc must be UNANIMOUS** — *"a majority vote would mean a nation being outvoted
>   into recognising a country it refuses to recognise."*

---

## 6. Six of eleven moves are diplomatic, and every one is reached by clicking the map

**The move registry holds eleven.** *Annex, unite, release, govern, autonomy —* **then recognise,
trade, treaty, aid, transit and revoke.**

> **"This round's budget problem is not that it has no verbs. It is that it already has more than any
> other system, against a budget of one action a turn."**

**There is no diplomacy screen.** *Recognise, non-aggression pact and send-aid are buttons inside the
**nation card**, and the card opens on a map click.* **Filed to this stage and still open.**

**Recognising costs nothing and does not end your turn** — *one of the three exceptions that gave the
turn design its rule:* **a decision is free when you did not choose to be asked.**

---

## 7. ⚠ FOUR THINGS DECIDED AFTER THIS ROUND CLOSED THAT CHANGE IT

**Round 5 closed at 02:53. All four were decided later the same day and none is reflected in the round
document.**

| | |
|---|---|
| **1** | **⚠ Ruling 8 is SUPERSEDED (D222).** *"That reasoning was sound when the alpha was an economy test. **It no longer holds. The alpha now carries mission trees, and Texas is one of the three.**"* Austin's rebel board comes forward into the alpha |
| **2** | **⚠ Finding I — the round's worst — is CLOSED, for free.** *Four unrecognised Texans **[BUILT]** put four recipients on the board, so Deseret **[BUILT]** can recognise them from turn 1.* **The pariah's empty instrument needed a scheduling change rather than the overture, and the round does not say so** |
| **3** | **⚠ Deseret's opening recognition changed (D227).** *It now opens recognised by its six neighbours and **not by Utah** — because transit requires **mutual** recognition and a nation with no port and no crossing needs a corridor to do anything at all.* **Verified before ruling: even all six signing leaves legitimacy under 0.15, so the pariah story survives and only the dead end goes** |
| **4** | **⚠ Ruling 11's duration default is VOID ON ITS PREMISE (D233).** *It reasoned from a four-entry menu of 2/4/8/20 turns. **`deal.durations` has been `[20,30,40,50,100]` since 6 September** — the shortest term is already five years and 100 turns comfortably contains the story's twenty. `2/4/8/20` is the **transit** table, a different object* |

**And one more that changes a formula rather than a ruling:** **D231 moves politics to three axes and
ten positions.** *The recognition chance's Kinship term reads the affinity function directly, so **the
formula's second-largest ordinary term changes meaning when the political board converts** — and its
denominator has no authored value on the new board.*

---

## 8. What this hands the Technical Designer

| | |
|---|---|
| **❌ `aid.recognitionBoost` is dead.** *Either wire it or delete it — a tunable that describes a mechanism the game does not have is worse than no tunable* | §4.3 |
| **❌ One memory kind renders as its raw key** in the player's sentence | §3.2 |
| **A stance machine does not exist**, and four rulings name states it would hold | §1, §2 |
| **⚠ Two vocabularies use the word "Hostile"** — a band on a score, and a state in a machine that is not built | §3.2 |
| **No hostility gate exists on trade or transit**, though three conquest rulings specify one. *The only standing gate in the game is a minimum of −0.2 on treaties* | — |
| **The decay is invisible to the player** | §3.3 |
| **Six moves, one action a turn, no screen** | §6 |

---

## 9. Open questions

| | | Owner as stated |
|---|---|---|
| **1** | **What does the overture cost?** *Four options, none chosen: the whole turn with a chance of refusal; the whole turn always landing; a standing payment; **only the weaker party may go first*** | **Stage 3** — *Aaron filed it there himself* |
| **2** | **The petition gap's number**, which must be set **as a set of three** beside politics ruling 15's threshold and the secession line | **Stage 3**, then the data stage |
| **3** | **Mediation** — *the only idea in the round where one action moves three nations.* **"Either the answer to the action budget or a reason to reject it outright"** | **Stage 3** |
| **4** | **The vassal's tithe, and what the overlord's veto costs the overlord** | **Stage 3** |
| **5** | **⚠ Finding K — is vassalage the pariah's escape hatch, and is it too cheap?** *Vassalage sits on aid; aid is not recognition-gated; **so submitting to your own parent currently buys your existence.*** *"Excellent drama; possibly too cheap"* | **Unanswered** |
| **6** | **Does the federal remnant open recognising nobody?** *Deferred alongside ruling 8 — **and ruling 8 has since been superseded, so the deferral's reasoning no longer holds*** | **Unassigned** |
| **7** | **Are the contest hostility floors seeded at the same time as the Texas recognition change?** *D222's own scope note leaves it open* | **Not decided** |
| **8** | **What does sponsorship cost per turn** — the action every turn, or a standing payment? | **Round 7 owns the budget; the number is stage 3's** |
| **9** | **⚠ Should a hundred-turn deal be on the menu at all?** *Half the game* | **Aaron.** *`trade-design.md` open question 1* |

---

## 10. Gaps

| | |
|---|---|
| **1** | **❌ `aid.recognitionBoost` is a dead tunable** whose doc string claims it is *"the one route out of the recognition trap that does not involve winning a war."* **Read by nothing** |
| **2** | **❌ `revoked` has no label.** *Fifteen memory kinds, fourteen labels; the raw key leaks into the player's sentence* |
| **3** | **⚠ The 33 hostile pairs have never been measured.** *"A data job, half an hour, and **every argument about the thaw rests on it**"* |
| **4** | **A stale 89% / 91% figure** whose replacement is unmeasured |
| **5** | **Finding H is uncountable until the petition gap has a number** — *how many movements sit permanently in the asking state, able to ask forever and never leave* |
| **6** | **No stance machine**, so every ruling naming a state names something the game cannot represent |
| **7** | **⚠ Two names for one stage.** *Rounds 1–4 send numbers to "the mechanics stage"; Aaron's word is **architecture**. Ruling 9 flags it and declines to fix it: "renaming four closed rounds is not a diplomacy job — **but it should be fixed once, deliberately**"* |
| **8** | **`DESIGN.md` states in two places that treaties and aid do not exist. Both are built.** *Open since 6 September* |
| **9** | **No hostility gate on trade or transit**, against three conquest rulings |
| **10** | **Is an offer visible to everyone, or to nobody?** *"**The board's whole atmosphere depends on this and it has never been asked**"* |
| **11** | **⚠ Three stale counts about this round survive in the planning documents** — *the rulings, the findings and the in-tray totals each appear with two different values in two places.* **Authoritative: 22 rulings, 15 findings, 33 in-tray rows of which 29 were questions** |

---

## 11. The scenarios this document must be able to narrate

**Four traced. One is the system at its best, one jams on a dead tunable, one exposes the two-vocabulary
problem, and one is the escape hatch nobody intended.**

### 11.1 ✅ Deseret is born a pariah and the continent makes up its mind

**Step 1.** Deseret **[BUILT]** opens with its parent refusing. **Its legitimacy is under 0.15 — the
smuggler's band — even with all six neighbours signing.**

**Step 2.** It pays **45% of the going rate** on everything it moves. *Not a lock — "what an
unrecognised country loses is the margin, not the trade."*

**Step 3.** It has **no coalition seat**, and an **Influence deficit** dragging a national stock.

**Step 4 — the endurance term ticks.** *Twelve turns is the full scale.* **A state still there next year
is a fact, whatever anybody thinks of it.**

**Step 5 — and the whole thing hangs on one signature.** *Utah's refusal is the 0.40 term.* **The moment
it gives in, the continent's per-turn chance goes 0.070 → 0.181.**

> **✅ NARRATES COMPLETELY, and it is the most measured piece of drama in the game.** *Every step is
> built, every number is authored and reachable, and the pivot is legible to the player because the
> parent is named on the card.*

### 11.2 ❌ A pariah tries to buy its way onto the map

**Step 1.** An unrecognised state has money and no friends. *It sends aid to a neighbour.*

**Step 2 — 12% of its treasury moves**, and the recipient records **`aided` at +0.30.**

**Step 3.** The player reads the tuning file and finds `aid.recognitionBoost` at 0.25, documented as
**"the one route out of the recognition trap."**

**Step 4 — ❌ nothing adds it.** *The chance formula has five terms and aid is not one.*

**Step 5 — so it works anyway, sideways and weaker.** *`aided` feeds Standing, Standing is the 0.45
term, so the gift does move the needle — **through a path nobody documented, at a fraction of the
advertised strength.***

> **❌ JAMS AGAINST ITS OWN DOCUMENTATION.** *The mechanism is described, tuned, and absent.* **This is
> the most dangerous class of gap in the project, because a tunable with a doc string looks
> implemented.**

### 11.3 ⚠ A player asks why they cannot trade with a neighbour that says "Hostile"

**Step 1.** The card reads **"Hostile: took our ground, 4 turns ago."**

**Step 2.** The player expects trade to be blocked. *Three conquest rulings say no deal with a hostile
nation.*

**Step 3 — ⚠ the trade goes through.** *There is no hostility gate anywhere on trade or transit.*

**Step 4 — and "Hostile" here is a BAND ON A SCORE, not the Hostile STATE.** *The state exists only in
round 2's design. The band is a label printed when the number falls below −0.5.*

**Step 5.** *The only standing gate in the entire game is a minimum of −0.2 on signing a **treaty**.*

> **⚠ NARRATES AND TEACHES THE PLAYER SOMETHING FALSE.** *Two vocabularies share one word and nothing
> in the project says so.* **Whichever way it is resolved — build the gate, or rename the band — it has
> to be resolved, because the interface is currently promising a rule the engine does not have.**

### 11.4 ⚠ A breakaway submits to the parent that refuses to recognise it

**Step 1.** A new nation is a pariah. **Its parent will not sign, which is the 0.40 term.**

**Step 2.** Ruling 5 lets it **offer vassalage upward.**

**Step 3 — vassalage sits on the patronage system**, and **patronage is not recognition-gated.** *Aid
flows to an unrecognised state exactly as it flows to anyone.*

**Step 4 — it becomes its parent's vassal.** *It loses its foreign column: no deal, no corridor, no
bloc, no alliance, no war without consent.*

**Step 5 — and it has bought its existence.** *Being somebody's vassal is being somebody's — which is
recognition in all but the signature.*

> **⚠ NARRATES, AND IT IS EXCELLENT DRAMA THAT NOBODY DESIGNED.** *Finding K, still open, in the
> round's own words:* **"excellent drama; possibly too cheap."** *And the objection is precise: **if
> submitting delivers recognition automatically, every breakaway ends the same way.***

---

*Sources, verified 15 September 2026: `docs/design/diplomacy-ideation.md` (1,682 lines — all 22
rulings, 15 findings, ideas T1–T85 and T76a, §2e's in-tray recount); `docs/design/conquest-ideation.md`
§2/§7 (the eight-state spine, ruling 17's sixth live state, the transition table);
`docs/design/politics-ideation.md` rulings 25–39; `DECISIONS.md` D214, D215, D216, D217, D222, D227,
D231, D233; `docs/deferred.md` 13 and 33; `js/relations.js` (the 15 kinds, the 14 labels, `summarise`,
`forget`, `toward`); `js/recognition.js` (the matrix, the five-term chance, the four pariah costs, the
player exemption); `js/pacts.js`; `js/coalitions.js`; `js/moves.js` (the eleven planners, the three
`canTrade` gates, `treaty.minStanding`); `js/panels.js`; `js/tunables.js` (every `rel.*`,
`recognition.*`, `treaty.*` and `aid.*` key with its doc string). **The dead tunable and the missing
label were each verified by grep against `js/` and `tests/` this session rather than taken from the
research brief. The 33-pair figure, the 89%/91% figure and the 0.070→0.181 recognition measurement are
carried forward with their original attribution; the last is dated by milestone only.***
