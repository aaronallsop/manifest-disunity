# Politics — ideation (round 3)

**Status: OPEN and part-way through. Opened 9 September 2026; 14 rulings as of 11 September 2026.**
Round 1 (secession) closed 7 September with 53 rulings; round 2 (conquest) closed 9 September with 41.
This round is third per `IDEATION-PLAN.md`.

Nothing below §4 is decided. Rulings are written into §4 **as they happen**, not summarised at the
end.

### Where the round stands — corrected 11 September 2026

*This block was missing while fourteen rulings were made, and a fresh session read the round as
un-started. Update it whenever a spine question is answered.*

| | |
|---|---|
| **Rulings made** | **37** (§4 and §5), plus findings A–G (§5, §6) |
| **Spine questions answered** | **Q1** *(replaced by P1 and rulings 1–2)* · **Q2** *(rulings 11, 11a)* · **Q3** *(ruling 21)* · **Q4** *(ruling 3)* · **Q5** *(ruling 22)* · **Q6** *(ruling 14)* · **Q9** *(ruling 6)* · **Q7** *(ruling 24)* · **Q8** *(ruling 25)* · **Q11** *(ruling 37)* · **Q12** *(ruling 23)* |
| **Part answered** | *(none)* |
| **Still open** | **Q10 only.** **The federation is finished** — all seven of ruling 25's questions answered (rulings 26-36), plus separate peace (35) and ruling 31's open half (33) |
| **Waiting on Aaron** | **Nothing.** Both board cards are answered — the Farmers Union by ruling 15, and ruling 6's opened question by ruling 20. **Ruling 15's four questions are all answered** — 1 by ruling 16, 2 by ruling 17, 3 by ruling 18, and 4 by ruling 19 as a flagged default. The proposal-spam exploit named in ruling 16 is closed by ruling 18: proposals run on the movement's clock, not the player's. **Finding A is ANSWERED by ruling 15**: the Farmers Union is a movement and its verb is Unify |
| **Still to do before the round closes** | the closing test — *what does the player do about this on a Tuesday, with one action?* — and **trace scenario 3** |

---

## 1. What this round owns

Politics owns **two of the nine pressures** that feed a region's anger — how freely people are
allowed to disagree, and how firmly the government holds its own ground — and it owns **every answer
a government can give to a movement**. That second thing is why this round matters more than its
position in the order suggests: round 1 found that *five of the six movement verbs have no
government response at all*, and that is the whole Tuesday problem in one sentence.

Per the plan, this round also owns the seam marked **autonomy, release and changing course** — three
of the four prices a government can pay to keep a region.

### What is already built, verified 9 September 2026

Read before proposing anything, so this round extends the machine rather than replacing it.

| | State |
|---|---|
| **Six ideologies on two axes** | `content/ideologies.json`. Axes are **collective ↔ market** and **liberal ↔ traditional**. `affinity(a,b) = 1 - distance/maxDistance` drives coalitions, drift, liberty satisfaction, trade alignment, defection and AI diplomacy |
| **The four release valves** | All four exist. **Release** ground (`release.costGdpShare` of the output goes with it, and a cooldown), **autonomy** per Area (the Area keeps most of what it raises; capped by share; cooldown), **change course** (`changeRulingIdeology` — needs a popular share for the mandate, costs treasury scaled by how far you move on the axes, and costs Authority), **garrison** (buys quiet, pays in civil liberties) |
| **Elections** | Staggered by a hash of the nation id so fifty-one do not land together. The vote is the population's ideological mix, swung by the government's record on Quality of Life, Authority, Civil Liberties and war weariness. **They can be stolen** below a liberties threshold, at the price of a further liberties shock — and the player is *asked* rather than defaulted |
| **Authority and civil liberties** | National stocks with per-Area versions blended in. Authority reads age, tenure, wars, solvency, cohesion, honeymoon, losses, occupation, overreach, autonomy and who is in charge. Liberties read the garrison, autonomy, occupation and the leader |
| **The honeymoon** | Four turns of borrowed Authority against a proportional GDP cut |

### What is not built, and this round is the first to ask for it

- **A movement that changes what it wants** — round 2's ruling 30 (C120). The only piece of
  machinery in the whole conquest design that does not re-point something that already exists.
- **Ground that belongs to nobody.** Every Area belongs to a nation today. There is no
  nobody's-land, and the story opens with six regions in one.
- **Any answer to a movement that is not *Separate*.** Round 1's finding D.
- **Movements that know about each other.** Coalitions do not exist.

---

## 2. The inbox — what rounds 1 and 2 handed this one

**Preserved as filed. Nothing here is judged.** Round 1 filed items 1–12 on 6–7 September; round 2
added the three marked ▶ on 9 September.

1. **What is a tier-3 "stateless society"?** Aaron's three tiers: a *recognised state*, a
   *secessionist state*, and a *stateless society* — "areas small enough to run on their own and
   make their own deals, and naturally fairly libertarian or anarchist." Six regions open this way:
   Arkansas, Wyoming, New Mexico, Kentucky, Ohio and Michigan. Does a tier-3 zone have a
   government, a treasury, an army, elections? Is it one entity per region or many — the story says
   Kentucky, Ohio and Michigan "fracture into 3rd tier governments", plural? Can it grow back into a
   state, and can a state fall into it? *Built: nothing. Every Area belongs to a nation; there is no
   nobody's-land. This is the largest new mechanic in the story.* The definition lives here; how one
   forms is secession's question (round 1, S50), what standing it has abroad is diplomacy's
   (round 5).

2. **Martial law.** The federal government declared it in the counties around Washington to prevent
   a coup. What is martial law — a garrison, a liberties hit, elections suspended, all three, and
   for how long? *Built: garrison pressure suppresses movements and costs liberties; nothing
   suspends an election; the painted "Washington D.C." region (12 Areas: VA 8, MD 3, DC 1) is the
   ring, ready-made.*

3. **A federated state.** The United States of New England — six former states under one flag. Is
   federation a form of government, with members keeping self-rule, or a name? *Built: autonomy per
   Area exists and costs the centre revenue and authority every turn, so a literal federation is a
   weak government by construction.*

4. **Governments that changed their minds.** Greater Idaho "originally planned on staying in the
   union but then decided to leave altogether." A stance toward the federal remnant — loyal, gone,
   waiting — as a political fact a nation carries. *Built: no personality; posture is derived from
   fear alone.*

5. **Trust in a government collapsing.** "The people's trust in the US government dropped
   dramatically and local powers started stepping up and filling in." The federal remnant's authority
   at open, and institutions filling a vacuum. *Built: authority is a stock that opens at its target;
   nothing fills a vacuum.*

6. **A vassal's own politics.** Oklahoma submits to Dallas. Who governs Oklahoma — its own government
   under Dallas's protection? Can its people object, and to whom? *The relationship itself is
   diplomacy's (round 5).*

7. **Governors making foreign policy.** Seven governors signed the Farmers Union. Is joining a bloc
   a thing a government does, with a domestic cost or reward — and what did it cost Illinois when
   Chicago walked out?

8. **Is there a seventh political alignment, and is it Libertarianism?** *(Aaron, 7 September, raised
   three times in one sitting.)* On the Sagebrush Rebellion: "we might need to add another political
   alignment with Libertarianism. We can keep politics in this table for now but when we get to the
   politics section we can rework it." On the Central States Union: "this might be something where
   they would be republican but support unions — including libertarian later would help solve some of
   this." And by striking the **Libertarians** and **Anarcho-Capitalist** movements as politics
   rather than movements. *Built: six ideologies at fixed points on an economic axis and a social
   axis; `affinity` between any two falls out of the distance, so a seventh costs two numbers rather
   than six hand-authored pairs. The open question is where it sits — a market-liberal corner exists
   on the current axes, and **Techno-Autocrat has no home on them at all**, which is either an
   argument for a third axis or for leaving it out.* See `docs/design/old-ideas.md`.

9. **Political leaning is already being marked up.** The Movement Register carries an editable
   leaning per movement and Aaron has been changing it — Deseret from Conservative Nationalist to
   **Distributist** ("a law of consecration lite… the closest analogue would be Distributist, which
   is a Catholic teaching"), the Central States Union and El Paso United to **Republican**, the
   California Republic and the New England Revivalists to **Democrat**, the Rio Grande Union to
   **Distributist**. His note on New England United asks whether Boston's Catholic population should
   pull it toward Distributist too. **That column is this round's inbox**, already populated.

10. **Coalitions between movements, and what happens after they win.** *(Aaron, on the State of
    Jefferson.)* "This will be an interesting one that is fighting against the Greater Idaho movement
    and possibly working together with them… unlike current American politics there are going to be
    coalitions, so they might be somewhat aligned on politics and 100% aligned on separating, but once
    done there will be more chaos." Two movements that want the same ground for different reasons can
    ally to leave and then fall out. *Built: nothing — movements do not know about each other.*

11. **The fervour of a new country.** *(Aaron, 7 September — secession S65, ruling 16.)* A nation
    that has just been realised carries "an extra fervour, like the citizens are willing to overlook
    certain things." What does a government get to do badly while it lasts — govern harshly, lose a
    war, let people go hungry? Is it a tolerance applied to grievance, a bonus to the stocks, or a
    budget that gets spent? And what happens when it runs out: does a people whose patience has
    expired end up angrier than one that never had any? *Built: the honeymoon is four turns of
    borrowed Authority against a proportional GDP cut — narrower than this, and the natural place to
    hang it.*

12. **Autonomy, release and changing course live here** (per the plan) — three of the four answers to
    a movement and their prices. Round 1 has proposed four more (`secession-ideation.md` S24–S27).

▶ 13. **The mutable movement verb — ruling 30, C120.** A movement whose government keeps declining it
    **grows**; a movement whose government keeps *promising and never delivering* **changes what it
    wants, toward *Separate***. A change of kind, not degree. **This is the only thing in the entire
    conquest design that asks for machinery that does not exist**; everything else re-points
    something already built.

▶ 14. **The government's answer to *Expand* and *Reconquer***, beside round 1's four release valves.
    **Aaron's instruction was one table, not two.**

▶ 15. **Finding G — there is a way out of a permanent rivalry, and ruling 30 built it by accident.**
    A government that strings its own reunification movement along until it gives up watches that
    movement change its verb toward *Separate* — and a nation whose people have stopped wanting the
    old country back has stopped contesting the inheritance, so the permanent hostility floor lifts.
    *A player can talk their way out of a permanent rivalry by disappointing their own irredentists
    for long enough.* Nobody designed it; it fell out of ruling 30. **Round 3 builds it.**

---

## 3. The spine — the questions, in the order they are asked

Put to Aaron **one at a time**, in this order, each with a recommendation. Answered ones move into
§4 as rulings and are struck through here.

**Why this order.** Q1 first because it is the *language* every other question is written in and
because the plan reserves it to Aaron explicitly. Q2 and Q3 next because they are the round's spine
and the Tuesday problem. Q4 next because it is the largest new mechanic in the story. Then the rest,
roughly by how much else depends on them.

### Q1 — ~~Is there a seventh political alignment, and is it Libertarian?~~ **ANSWERED — replaced entirely by P1, and ruled at rulings 1 and 2**

*Inbox 8 and 9. Raised by Aaron three separate times in one sitting.*

**The plan reserves this one.** `IDEATION-PLAN.md` rule 1: the board and Identity are fixed, and *"if
a round finds itself wanting to change one, that is a finding worth stopping for — it is expensive
and it is Aaron's."*

**What it actually costs, measured rather than asserted.** The code is genuinely table-driven — the
number six appears only in comments, and ideology ids appear as literals in just three files. So a
seventh costs **two numbers and a colour** in the authored table. The real bill is elsewhere: the
minority-ideology split that gives each cultural region its texture is **twenty hand-authored rows
weighted over four ideologies**, and every one of them needs a fifth column. That is the honest
price — a couple of hours of authoring, not a rebuild.

**Recommendation: yes, add Libertarian; no, do not add a third axis.** Libertarian sits in the
market-liberal corner — furthest along *market*, on the *liberal* side of the social axis — which is
currently empty and which is exactly where the Sagebrush Rebellion's "return the federal land, county
supremacy" belongs. It is also where the struck **Anarcho-Capitalist** movement sat, and the
resonance with tier-3 stateless ground is not a coincidence. **Techno-Autocrat stays out**: it has no
home on these axes, a third axis re-prices every affinity in the game, and it would buy one movement
that Aaron has already struck.

### Q2 — ~~The one table: what can a government do about each of the six verbs?~~ **ANSWERED — rulings 11 and 11a**

*Round 1's finding D, round 2's handover 14, and the Tuesday problem located precisely.*

The four release valves answer ***Separate*** and nothing else. **Unify, Reunify, Rejoin, Expand and
Reconquer have no government response at all** — which means that for five of the six things a
movement can want, the player has nothing to do on a Tuesday.

**Aaron's instruction is one table, not two**: the answers to *Expand* and *Reconquer* go in beside
the four valves rather than into a separate list of their own.

**Recommendation: the *adjective* decides the shape of the answer, not the verb.** Round 1 already
observed this — "a policy for *economic*, recognition for *cultural*, a share of the ground for
*resource*." That gives one table with six rows and a small number of answer-shapes reused across
them, instead of thirty hand-authored pairs. The table itself is the deliverable and I will draft it
for Aaron to mark up rather than ask him to invent it.

### Q3 — ~~Do the four proposed new valves join the table?~~ **ANSWERED — ruling 21.** Only the referendum joins

*Round 1, S24–S27, unruled.* **Negotiate** with the movement (give it two of the five things it
wants); **hold a referendum** (lose and it leaves cleanly, win and it is set back — with the honesty
of the result depending on your liberties, exactly as a stolen election already works);
**buy them** (spend on the region, the way the harvest crisis already lets you spend on grain);
**partition it yourself** (draw the line first and keep the half that wants you).

**Recommendation: take negotiate and referendum, defer buy, drop partition.** Negotiate is the
missing *player verb* and the whole round needs one. Referendum reuses the stolen-election machinery
and is the most dramatic single button in the game. Buying them waits for round 4, because what money
buys is the economy's to say. Partition is release with extra steps and a hard map problem.

**And S28 applies to all of them: every answer must make the next movement.** Today only two of the
four carry a second-order cost.

### Q4 — ~~What is a tier-3 stateless society?~~ **ANSWERED — ruling 3**

*Inbox 1. The largest new mechanic in the story, and six regions open in it.*

Does it have a government, a treasury, an army, elections? One entity per region or many? Can it grow
into a state, and can a state fall into one?

**Recommendation: it is ground with people and output and no government.** No treasury, no elections,
no foreign policy, no army beyond the local resistance that already exists — and **many small ones
per region, not one**, because the story says Kentucky, Ohio and Michigan "fracture into 3rd tier
governments", plural. It can be annexed cheaply, which round 1 already priced. It can **grow into a
state** if a movement realises on it. **A state cannot fall into one** in this version — that is a
collapse mechanic and it belongs to a later pass.

### Q5 — ~~The mutable movement verb: what are the legal changes, and what triggers them?~~ **ANSWERED — ruling 22**

*Inbox 13, ruling 30, C120. The one piece of machinery that does not exist.*

**Recommendation: one direction only, and only toward *Separate*.** A movement that is promised and
not delivered walks toward wanting out, and never back. It fires on a clock — a count of promises
made and unkept — rather than re-checking every turn, which is also what **C133** requires. And per
**finding G**, when a reunification movement's verb flips, the permanent hostility floor its contest
created lifts with it.

### Q6 — ~~Martial law: what is it, and for how long?~~ **ANSWERED — ruling 14**

*Inbox 2.* Garrison, liberties hit, suspended elections, all three?

**Recommendation: it is the garrison you already have, declared nationally, plus the one thing the
game cannot do yet — it suspends the election.** That gives martial law real teeth without inventing
a second suppression system, and it puts the price exactly where the game already puts it: the
liberties that let you do it are the liberties you spend doing it.

### Q7 — ~~Does the federal remnant open below its authority, and does anything fill a vacuum?~~ **ANSWERED — ruling 24**

*Inbox 5.* "The people's trust in the US government dropped dramatically and local powers started
stepping up and filling in."

**Recommendation: yes to the first, no to the second.** Authority opening below its target — and
climbing back — is one seeded number and it tells the story. "Local powers filling in" is what
movements and tier-3 ground already are; giving it a second mechanism would grow two answers to one
question, which is the thing this plan exists to avoid.

### Q8 — ~~Is a federation a form of government, or a name?~~ **ANSWERED — ruling 25: a real form, and the recommendation was overruled**

*Inbox 3, and Aaron raised it again on Acadiana: "the gulf compact could be a unified states? We can
talk about that later in governments and diplomacy."*

**Recommendation: a name, for now — and say why out loud.** Autonomy per Area already exists and
already costs the centre revenue and authority, so a literal federation is *a weak government by
construction* and the game can already build one. What is missing is a label and a reason to want it.
Aaron has flagged it twice, so if he wants it as a real form this is where it lands, and it wants
round 5 beside it.

### Q9 — ~~Coalitions between movements, and the chaos afterwards~~ **ANSWERED — ruling 6**, which disposed of the aftermath without a rule for it

*Inbox 10.* Two movements that want the same ground for different reasons ally to leave, then fall
out.

**Recommendation: two movements with the same verb and overlapping ground may declare together, and
the coalition dissolves the moment they succeed** — leaving two movements inside the new nation, both
realised, wanting different things. That is Aaron's "once done there will be more chaos" and it costs
almost nothing, because both halves already exist; only the pairing is new.

### Q10 — The fervour of a new country: what does it buy, and what does it cost when it ends?

*Inbox 11.* Tolerance, bonus, or a budget that gets spent? And is a people whose patience has expired
angrier than one that never had any?

**Recommendation: widen the honeymoon that exists rather than add a second thing.** Today it is four
turns of borrowed Authority against a GDP cut; make it a *tolerance applied to grievance* as well, so
a new country can genuinely govern badly for a while. **And yes — it should end worse than neutral.**
A patience that has been spent is a grievance with a date on it, and that is the more interesting
game.

### Q11 — Is joining a bloc a domestic political act with a domestic price? **PART ANSWERED — ruling 11 point 4.** The bloc is the *concede-less* move for a Unify movement; the domestic price below is still open

*Inbox 7.* Seven governors signed the Farmers Union — and what did it cost Illinois when Chicago
walked out?

**Recommendation: yes.** Joining a bloc costs Authority with the share of your own people whose
ideology is furthest from the bloc's — which needs no new machinery, because `affinity` already
answers it. **The bloc itself is round 5's**; only its domestic bill is this round's.

### Q12 — ~~Is a nation's stance toward the old country a political fact it carries?~~ **ANSWERED — ruling 23**

*Inbox 4.* Greater Idaho "originally planned on staying in the union but then decided to leave
altogether."

**Recommendation: yes, and it is Q5's machinery pointed at nations instead of movements.** A nation
carries a posture toward the remnant — loyal, gone, waiting — and it can change, on the same
promise-and-disappointment clock. If Q5 is ruled, this is nearly free; if Q5 is refused, this should
be refused with it rather than built separately.

### The closing test — asked at the end of the round, not now

**What does the player actually do about this, on a Tuesday, with one action?** Every round answers
it before it closes. **And the scenarios get traced at the close** — tracing found contradictions in
round 1 that fifty-three rulings had not, and seven findings in round 2 that forty-one had not.

Round 3 owns scenario 3: *a government that chooses between its own identity and its territory.* A
movement is over the line in three Areas; the government can hand the ground away, grant self-rule,
change what it stands for and lose the majority that elected it, or send soldiers and make the next
movement. **Four prices for the same relief, and the player has to pick one.**

---

## 4. Rulings

*Written as they happen.*

**Ruling 1** — three axes, and the roster named for real parties. Recorded at **P2** and in
`DECISIONS.md` **D185**. Superseded in its roster by ruling 2.

**Ruling 2** — ten positions, authoritarians at both outer ends, the drift partition, and the two
conditions. Recorded at **P5** and **P6**, and in **D186**. The *falling* is deferred to
`docs/FUTURE-IDEAS.md` **F19** (**D187**); the board is not.

### Ruling 3 — What a stateless society is, and what it costs to trade with one

**Aaron, 9 September 2026**, answering §3 Q4 and part of inbox question 1:

> "A stateless society is a group of counties that are running without a government or anything."
>
> "They have a set trading fee of 10%. The logic is that you are going in and trading directly with
> people."
>
> "They also have a set 5% toll. The logic is that you will run trade through there but you are
> paying 5% along the way to protect your trade and pay off people you meet along the way."

**What it settles.** A stateless society is **a group of counties with no government** — and
therefore no treasury, no army, no elections and no foreign policy. It is ground with people on it.

**Derived, not asserted, and correctable in one line: both figures are COSTS, not transfers.** There
is no government, so there is no treasury for the money to arrive in, and Aaron's own reasoning sends
it to *"people you meet along the way"* rather than to an institution. This is exactly how the build
already treats the Canada/Mexico corridor — `transit.foreignCorridorToll`, whose note reads *"it is a
COST rather than a transfer: nobody receives it."*

**Measured against the build rather than assumed, and both numbers land somewhere that matters:**

| | Aaron's figure | What it equals in the build today |
|---|---|---|
| Trading **with** stateless ground | **10%** | Exactly the Canada / Mexico corridor cost |
| Routing **through** stateless ground | **5%** | Exactly `transit.rateMin` — **the lowest toll any nation will ever sign** |

For scale: a nation's baseline transit toll is **35%**, the ceiling is **60%**, and every road border
crossing costs a further **25%** that nobody collects.

**The consequence, and it is large: lawless ground becomes the cheapest passage on the continent** —
cheaper than Canada and Mexico at 10%, and level with the floor below which no government will ever
sign.

**This answers C51, which round 2 handed to round 3 and could not answer itself.** C51 asked
*"whether taking unclaimed ground should anger anybody at all."* **It does now — it angers everybody
who was routing through it**, because conquering the cheapest corridor on the map turns it into
somebody's toll gate. **Stateless ground acquires a constituency without anyone designing it one**,
which is the exact hole C51 was pointing at.

**It also closes round 1's finding B for conquest's purposes:** stateless ground has no stocks,
because it has no government to hold any.

**What building it costs.** The trade half is nearly free — it is the Canada/Mexico corridor
mechanism pointed at a different kind of ground, and that machinery is built and shipped. **The
expensive half is the ground itself:** every Area belongs to a nation today and there is no
nobody's-land.

**Both figures become named tunables**, per the project rule that no number is a literal. Per Addendum
A they are **placeholders that stay put** and are not tuned.

**Still open inside inbox question 1:** one stateless entity per region or many; whether a region can
grow back into a state; and whether a *state* can fall into one — that last path is parked in **F19**.

**Confirmed by Aaron when the undercut was put to him:** the 5% is deliberate and the reasoning is the
mechanic. *"You aren't dealing with governments, you are dealing with people and communities. No
tolls, no nothing."* Lawless ground is cheap **because** there is no state on it to charge you.

### Ruling 4 — Stranded ground goes stateless, and a movement can rise from it

**Aaron, 9 September 2026**, closing the rest of inbox question 1.

> "In play testing there would be times where a civil war would happen or trying to unite a nation
> would cause a nation to break apart and it would have a section of their country cut off from them
> and surrounded by other states. I think there should be a rule that if those sections together are
> more than 2,000,000 citizens and maybe something else (not sure yet we can figure that out later in
> future ideas) it becomes a stateless society."
>
> "And of course a movement can rise out of a stateless society."

**The rule.** Territory severed from its nation — by a civil war, or by a union that shattered — and
surrounded by other states **becomes a stateless society** once the severed sections together exceed
**2,000,000 citizens**. A further condition is wanted and is **deliberately deferred to
`docs/FUTURE-IDEAS.md` F20** at Aaron's instruction.

**And stateless ground is a stage, not a terminus: a movement can rise out of it.** That closes the
open half of inbox question 1 — *can it grow back into a state?* **Yes, the same way anywhere else
does.** The full life cycle is now: **stranded → stateless → a movement organises → a nation.** The
distinction that makes it coherent is that *nobody chose* a stranded region — it has no claim and no
organising principle, only people who woke up on the wrong side of a line. A movement is what supplies
the missing thing.

**What the build already gives this for nothing.** Contiguity is computed (`js/graph.js` — *"contiguous
AND same owner is one call"*), so detecting severed territory is not new machinery. And a movement's
homeland is bound to Areas rather than to a parent nation, so a movement on ungoverned ground needs no
special case.

**Measured, not assumed — and this is the finding.** Against the real map: **340.1 million people
across 3,143 counties, median county 26,138.**

| | |
|---|---|
| 2,000,000 as a share of the country | **0.59%** |
| Counties already over 2,000,000 **on their own** | **17** — Los Angeles alone is 9.76M, Cook 5.18M, Harris 5.01M |
| Smallest counties needed to reach 2,000,000 | **507** |

**So two million people is one big city, or five hundred rural counties.** A threshold in *population*
fires the moment a dense metro is severed and effectively never fires in the countryside. **That is
backwards from where statelessness belongs**: Aaron's own tier-3 description is *"areas small enough to
run on their own… naturally fairly libertarian or anarchist"*, and the six regions that open stateless
— Arkansas, Wyoming, New Mexico, Kentucky, Ohio, Michigan — are not metros. **As written the rule
strands Chicago and never strands Montana.**

**And a second, related caution from this project's own measured history.** `nation.minAreas` records
what happened the last time an automatic threshold spawned entities: at 3 Areas, *"75 of the 88 nations
a fifty-turn game produced were released fragments rather than anything anyone had fought for."*
**A rule that manufactures new map objects from fragments has turned this map to confetti once
already.** Stateless ground is a cheaper object than a nation — no government, no army, no diplomacy —
so the failure would be milder, but it is the same shape.

**One number to compare it against, which nobody had put side by side.** The build already carries
`nation.minPop` = **250,000**: *"a breakaway chunk stands alone on Areas OR on population, whichever it
clears first."* **Aaron's stranding threshold is eight times the bar for becoming a whole country.**
That is not incoherent — a breakaway is *chosen* and a stranding is not, and the two deserve different
bars — but the ratio should be a decision rather than an accident.

**Both figures become named tunables**, per the project rule. **Nothing built.**

### Ruling 5 — Enveloped territory: over 500,000 it is a nation, under it a stateless society

**Aaron, 9 September 2026, superseding ruling 4's threshold AND its outcome.** Ruling 4 is struck
through below rather than removed, per the project rule.

> "There were times when parts of a country would lose ground to another and parts of its territory
> would be enveloped by the other nation or the other nation and another nation so that country has no
> way to reach that part of their country. If that happens and it is **more than 500,000 people it is
> a nation**, if it is **less it is a stateless society**."

**~~Ruling 4: severed sections totalling more than 2,000,000 become a stateless society.~~
SUPERSEDED.** It had big ground going stateless and small ground staying attached, which is backwards
from every other statement of what stateless ground is. **Ruling 5 turns it the right way up.**

| Enveloped territory | Becomes |
|---|---|
| **more than 500,000 people** | **a nation** — big enough to stand on its own |
| **500,000 or fewer** | **a stateless society** — counties running without a government |

**This is now consistent with the tier-3 definition it used to contradict.** Aaron's original words
were *"areas small enough to run on their own and make their own deals, and naturally fairly
libertarian or anarchist"* — **small**. Ruling 5 delivers exactly that, and it disposes of the finding
raised against ruling 4: a severed metro becomes a country, a severed stretch of sparse countryside
goes stateless. **Los Angeles cut off becomes a nation; forty counties of eastern Montana cut off
become a stateless society.** That is the right way round, and it matches the six regions that open
stateless being rural rather than urban.

**And it is simpler than what it replaces — worth naming, because complexity is the usual complaint.**
**The threshold stopped being a gate and became a fork.** Under ruling 4 the number decided *whether
anything happened at all*, which left a silent third case — enveloped ground below the bar that just
persisted, ungovernable and unmodelled. Under ruling 5 **every enveloped region becomes something**;
the size only decides which. There is no third case, and **the second condition Aaron reserved in F20
may no longer be needed at all** — a fork does not need a gate's guard.

**Two population bars now exist for becoming a nation, and the harder one is on the case nobody
chose.** The build carries `nation.minPop` = **250,000** for a *chosen* breakaway — a movement that
organised, fought and won. Ruling 5 sets **500,000** for territory that was merely cut off. **That
ordering is correct and should be recorded as deliberate rather than inherited:** a breakaway arrives
with leadership, a claim and a reason to cohere; enveloped ground arrives with none of those, so it
needs more mass to hold together. **Whether the two should be one tunable or two is open.**

**A trap in the detection, flagged before it is built.** The test must be *"cut off by other nations'
land"*, **not** *"not contiguous"*. An island is not enveloped by anybody — it is across water. A
naive contiguity test detaches every overseas holding the moment it is acquired: Alaska is 740,133
people and Hawaii about 1.4 million, so both would clear 500,000 and declare themselves the turn any
nation took them. The build already knows the difference — `js/factions.js` reasons about *"an island
has no land neighbours"* — so the distinction exists to be reused rather than invented.

**Measured, for scale.** 500,000 is **0.15%** of the country and sits just under **Wyoming
(587,618)**, the smallest real state — an honest floor for *"this is a country"*. **148 counties clear
it on their own**, against 292 at the old 250,000 bar.

**Both figures become named tunables. Nothing built.**

### Ruling 6 — A coalition is a shared enemy, and it is measured as total movement share

**Aaron, 9 September 2026**, rejecting the recommendation put to him and replacing it with something
simpler.

> "I think that movements only work together when they are fighting against the state. So greater
> idaho and cascadia would fight together against the state."
>
> "In practical terms though the way I think it would work mechanically is that I am Oregon and now I
> have 26% of my population for the cascadia movement and 26% for the greater idaho movement and that
> would cause a problem."

**My recommendation is struck.** I proposed three conditions — same verb, shared ground, and close
enough on the political board to stand each other. **Aaron removed all three.** Movements do not need
to agree, negotiate, or like one another. **They are working together by virtue of being inside the
same government, and nothing else.**

**Name the simplification, because the usual complaint runs the other way.** There is now **no
coalition object at all** — nothing to form, hold, track, break or dissolve, and no alliance state
between movements. **The coalition is an arithmetic fact about the government:** what share of my
people are in a movement, counting all of them. Two movements that despise each other still both
count against you.

**And it disposes of Aaron's own "more chaos afterwards" without a rule for it.** They were never
allied — they were simultaneously against you. Remove the government they were both pushing on and
there is nothing holding them together, which is precisely the chaos he described on the State of
Jefferson.

**The build already half-agrees, and its code contradicts its own explanation.** `Game.hostility(f)`
measures how hostile an Area is to whoever holds it, and its note reads:

> *"The strongest organised movement's share of it. **A movement IS opposition to the state that
> governs the Area** — that is what M4.1 made them — so the share it has organised is the readiest
> measure of how expensive the place is to sit on."*

**The sentence argues for the sum and the code takes the maximum:**
`for (const m in c.mov) { const s = c.mov[m] / pop; if (s > worst) worst = s; }`

**Ruling 6 makes the code agree with its own reasoning.** It is one line. The result stays inside
0..1 naturally, because a movement's members are a slice of the Area's population and the slices
cannot sum past the whole.

**Aaron's 26 / 26 is calibrated to a threshold he was not told about.** `secession.countyThreshold` is
**0.40** — the share a movement must organise before an Area will leave. **26% is under it. 52% is
over it.** Neither movement can take a county alone; together they take it. Whether he knew the number
or arrived at it by instinct, the example lands exactly in the gap the mechanic creates.

**THE QUESTION IT OPENS, and it is Aaron's.** The leave test is written *per movement*. If the total
crosses 40% and no single movement has, **which movement takes the Area?** *Recommendation: none of
them — it goes stateless.* An Area whose government has lost control while no successor has won it is
ungoverned by definition, and ruling 5 already built the object for that. **Not decided.**

### Ruling 7 — Movement members join the militia, not the army

**Aaron, 9 September 2026**, flagged by him as belonging to the population work.

> "Once we get to population — the larger the movement size the less people from that movement will
> join the military and instead join the movement militia."

**What is built.** `Military.of` computes `manpower = pop × mil.manpowerShare`, and
`mil.manpowerShare` is **0.004** — four in a thousand, a peacetime standing force. **There is no
movement term in it at all.** A nation half of whose people are organised against it currently fields
exactly the same army as one with no movements whatsoever.

**Worked against the real Oregon**, 4,272,371 people, at Aaron's 26 / 26:

| | Today | Under ruling 7 |
|---|---|---|
| State army | **17,089** | **8,202** |
| Cascadian militia | — | **4,443** |
| Greater Idaho militia | — | **4,443** |

**The state beats either militia comfortably — 1.8 to 1 — and loses to both of them together, 8,202
against 8,886.** Nobody tuned that. It falls out of Aaron's two figures meeting a manpower rate set
long before for an unrelated reason.

**So two independent mechanics put Oregon on the same knife edge at 26 / 26**: the secession threshold
(26 under, 52 over) and now the manpower split. That is a strong sign the numbers are in the right
place.

**Left open, and it is a tunable rather than a design question:** whether a militia arms at the same
four-in-a-thousand rate as a peacetime state, or higher because a militia is mobilised and a state is
not. **No figure invented.**

### Ruling 8 — Past 40% the countdown to civil war begins

**Aaron, 9 September 2026**, answering the question ruling 6 opened and rejecting the recommendation.

> "I think in that instance the countdown to civil war would begin. So it would be if a movement gets
> more than 40% but if any combined movements are more than 40% combined it starts a timer (I am
> thinking something like each turn there is an X% chance of civil war starting and the higher the
> percentage of a movement gets the greater the risk)."

**My recommendation is struck.** I proposed that an Area past 40% with no single winner goes
**stateless**. **Aaron's is a pressure rather than an outcome**, and it is the better shape: the
government does not lose the ground, it lives with a rising chance of the thing that takes the ground
away. It also matches how the rest of this game already works — probabilities per turn rather than
switches.

**Single or combined, the same bar.** One movement past 40%, or several summing past 40%, starts the
same clock. **Per-turn chance of civil war, rising with the share.** No figure named, and **none
invented.**

**What is built, and it is the sharp part.** `js/civilwar.js` is a complete resolver — scoring by
size ratio, summed dice, three outcomes (**victory · partial · fall apart**) — and its header says
what fires it:

> *"Triggered by an annexation when any of these hold: the annexation flips the nation's plurality
> party, the annexed counties' GDP exceeds the nation's current GDP, the annexed counties' population
> exceeds the nation's current population."*

**All three triggers are about taking too much. There is no internal path to civil war at all.** A
nation can be half organised against itself and never risk one. **Ruling 8 adds a trigger to an engine
that already exists** — which is the cheap half — but the resolver is framed around an annexation, in
`before / added / after` demographics, and **a movement-driven war has no "added".** That framing has
to be answered before it is built. **Flagged, not solved.**

**THE SCALE QUESTION, and it is Aaron's.** The built 40% (`secession.countyThreshold`) is **per
Area** — the share of *one county* a movement must organise before that county leaves. Aaron's
arithmetic in ruling 6 is **per nation** — *"I am Oregon and now I have 26% of my population."*
**Two different measurements now both use 40%.** Whether that is one number used twice or two numbers
that happen to match is not decided, and it matters: a nation at 40% overall may have no single county
anywhere near 40%, and a nation with three counties past 40% may sit at 5% nationally.

### Ruling 9 — A government can give up and join the movement

**Aaron, 9 September 2026.** A fifth answer to a movement, and the one nobody had proposed.

> "There should also be a mechanic that if a nation has over a certain number of a movement that the
> government can adjust and join in with the movement. Example — Oregon has a rising cascadia movement
> and they say **Looks like we are cascadaia now.** There would be some penalties, maybe counties with
> movements larger than theirs would leave for their movements?"

**This is a fifth release valve and it is the strongest of them.** The four built valves answer a
movement by giving ground, giving self-rule, changing what the government stands for, or sending
soldiers. **Ruling 9 answers it by becoming it.** Changing course changes an ideology; this changes an
identity.

**Aaron's own price is elegant and self-balancing: adopt one movement and every county where a
*different* movement is stronger walks out to that one.** In the Oregon case — adopt Cascadia, and
every county where Greater Idaho leads leaves immediately. **You solve half the problem by handing
over the other half.**

**What is built, and it is NOT this.** Round 1's S29 — *"going with the breakaway"* — is marked built,
and it is `Game.setPlayer`: **the player changes seats** to the new nation after a declaration has
already happened. **Ruling 9 is the opposite in every respect**: the *nation* transforms, nothing has
declared yet, no split occurs unless the price triggers it, and the player stays where they are. It is
new machinery, though the county-handover half re-points what release already does.

**No threshold named — Aaron's *"over a certain number"* — and none invented.**

### Ruling 10 — The two forties are two dials with two jobs, and the values go to the architect

**Aaron, 9 September 2026:** *"Not sure — is this something we can figure out in the architecture
stage?"*

**Half of it yes, and by his own definition.** D180 sets the architect's job as *"takes that design and
actually creates the numbers that are needed for this."* **Any question of the form "what value" is the
architect's**, and both forties are that. **Deferred, correctly.**

**But the other half needed no deferring, because Aaron had already answered it without being asked.**
The question raised against ruling 8 was whether the built 40% and his 40% are the same number. **They
are not the same measurement and they do not do the same job, so there was never a conflict:**

| Measured | Over its bar | Consequence |
|---|---|---|
| **One county's** organised share | that county leaves with the movement | **built** — `secession.countyThreshold` |
| **A whole nation's** total movement share | the civil war clock starts ticking | **ruling 8** |

**They compose, and the pair tells two stories the game could not tell before.** A county at 45% in a
nation at 10% is one furious corner that secedes cleanly while the country carries on. **A nation at
45% with no single county past 40% is a country thinly angry everywhere — nothing secedes, and it tears
itself apart instead.** The second is new; nothing in the build can produce it.

**So the only instruction forward is a plumbing one: two tunables, not one shared constant**, so moving
the county bar never silently moves the national one. That is the architect's, and it is trivial.

**The general rule, extracted so this call can be made without asking again.** Under D180: *what should
happen* is ideation's; *what is measured, and what the effects are at each level* is design's; **the
values are the architect's.** A question reaches Aaron only when the answer would change what a
playtester sees happen.

---

## 5. The idea bank

*Numbered P1, P2, … Unjudged.*

### P1 — The three-axis cube, and the eight corners

**Aaron's, 9 September, replacing Q1 entirely.** Rather than adding a seventh alignment to the
existing two axes, the whole scheme is rebuilt on **three** axes, each with a low and a high end:

| Axis | Low ↔ high | What it decides in the game |
|---|---|---|
| **Economy** | collective · middle · **neo-liberal** | Trade alignment |
| **Morals** | conservative · middle · progressive | Moral alignment, who tolerates whom |
| **Government power** | authoritarian · middle · libertarian | *New.* What a population will forgive |

**Aaron's terminology, 9 September: the high end of the economic axis is *neo-liberal*, not
*capitalist*.** That is the word the game uses.

**Aaron took the full twenty-seven**, middles included, over the eight corners. **The reference table
is `docs/design/political-spectrum.md`** — all 27 named, with real-world analogues and no game
content in it at all, which was his instruction. This document does not duplicate it.

**The arithmetic, corrected in session.** Aaron's first enumeration listed nine cells and tied
government power to morals — every conservative authoritarian, every progressive libertarian. That
makes the third axis a copy of the second, and it deletes the two positions that motivated adding it
at all: **Sagebrush** (capitalist, conservative, *libertarian*) and **Techno-Autocrat** (capitalist,
progressive, *authoritarian*) both live off that diagonal. Three positions per axis gives **27**;
**two positions per axis gives 8** — the corners of the cube, and the shape Aaron took.

**Aaron's own finding, and it is a good one: extremism is structurally isolating, and nobody has to
write a rule saying so.** On a 3×3×3 cube a corner touches 3 neighbours, an edge 4, a face-centre 5
and the middle 6. It falls out of the geometry, so it can never drift out of sync with anything.
**Note the cost of dropping to 8: every cell becomes a corner, every corner touches exactly three
others, and that asymmetry disappears.** Adding back the dead centre alone — nine — restores it,
because the centre is closer to all eight corners than any corner is to its nearest neighbour.
**Recommended and put to Aaron; not yet ruled.**

### P2 — RULED: eight parties at the corners, named for real parties

**Ruling 1 (D185), 9 September.** Three axes — **economy** (collective · **neo-liberal**), **morals**
(conservative · progressive) and **government power** (authoritarian · libertarian), the third being new.
**Two ends per axis, so eight parties, one at each corner of the cube.** Each is named for a **real
political party**, seven of the eight American, because what a player meets on a ballot is a party and
not an ideological family — Aaron's reason, and the correct one.

| # | Economy | Morals | Power | Party |
|---|---|---|---|---|
| 1 | collective | conservative | authoritarian | **Union Party** (US, 1936) |
| 2 | collective | conservative | libertarian | **People's Party** (US, 1892) |
| 3 | collective | progressive | authoritarian | **Communist Party** |
| 4 | collective | progressive | libertarian | **Industrial Workers of the World** (US, 1905) |
| 5 | neo-liberal | conservative | authoritarian | **America First Party** |
| 6 | neo-liberal | conservative | libertarian | **Constitution Party** (US, 1992) |
| 7 | neo-liberal | progressive | authoritarian | **Technocracy Incorporated** (US, 1933) |
| 8 | neo-liberal | progressive | libertarian | **Libertarian Party** (US, 1971) |

**The geometry, and it is free.** Each corner borders exactly three others — the ones it shares two
axes with — and disagrees with exactly one on everything. The opposed pairs are **1–8, 2–7, 3–6 and
4–5**. No rule has to assert who can coalition with whom; the shape already says.

**The twenty-seven are parked, not discarded** (Aaron: *"save this for later"*). They are the space the
eight are the corners of, and the reason for parking is the open problem he named: how twenty-seven
positions reconcile with the few parties that actually appear in one nation. **`political-spectrum.md`
and its register both survive intact.**

**Two things the ruling settles that were open questions in §2.**

1. **The seventh-alignment request is resolved by being made moot.** A collective economy with
   conservative morals now exists (positions 1 and 2), which is what the register's
   "pro-union but socially traditional" note was asking for. The axis was missing, not the alignment.
2. **The market-liberal and technocratic corners now exist** (6, 7 and 8). Those were the two positions
   with nowhere to sit, and they are *opposite* corners — which is why one added alignment could never
   have housed both.

**Recorded against the ruling, and not to be re-raised:** I recommended nine, the eight plus the dead
centre, because with the middles gone every position borders exactly three others and Aaron's own
asymmetry finding disappears, and because a board seeded from real American data is mostly moderate.
**He chose eight twice, knowing the cost.** If coalitions later feel flat, the centre is three numbers.

**What it still owes.** The 2024 county seed gives Republican, Democrat and other; **neither major
party maps onto a corner**, so both must be split across the eight by cultural region. Authoring, not
engineering, and the largest single job in the change. **Not started.**

### P4 — Aaron's twelve, sorted: ten positions, not twelve

**Aaron's list, 9 September, given as six opposed pairs:** Republicans/Democrats ·
Communists/Fascists · Anarcho-Capitalists/Democratic Socialism · Liberal Anarchy/Christian
Nationalism · Distributism/Digital Technocracy · Stateless/Despotism. **Proposed, not ruled.**

**Why it felt tricky, which was his own word for it: the twelve are not twelve of the same kind of
thing.** They are **eight corners**, **two centrists** and **two conditions**.

| | Economy | Morals | Power | |
|---|---|---|---|---|
| **Fascism** | collective | conservative | authoritarian | corner |
| **Distributism** | collective | conservative | libertarian | corner |
| **Communism** | collective | progressive | authoritarian | corner |
| **Democratic Socialism** | collective | progressive | libertarian | corner |
| **Christian Nationalism** | neo-liberal | conservative | authoritarian | corner |
| **Anarcho-Capitalism** | neo-liberal | conservative | libertarian | corner |
| **Digital Technocracy** | neo-liberal | progressive | authoritarian | corner |
| **Liberal Anarchy** | neo-liberal | progressive | libertarian | corner |
| **Republicans** | middle | conservative | middle | the centre |
| **Democrats** | middle | progressive | middle | the centre |

**Stateless** and **Despotism** are not positions at all. Stateless is *ground with no government* —
the tier-3 regions already in the story, and a condition of the map. Despotism is what *any*
government becomes when it holds power with no liberties left, which the build already models as a
stock. Neither is something a person votes for.

**Aaron's eight fill all eight corners exactly — no gap, no duplicate — and he got there without
working from the cube.** That is the strongest validation the three axes have had.

**Three things this settles.**

1. **Fascism was never missing.** It is the corner ruling 1 named *Union Party*. **The naming was too
   gentle** — that corner's most famous occupant is fascism, and calling it after a minor 1936
   American party hid the fact. Aaron's complaint was about the label, not the structure.
2. **He was right about *Nationalist*.** Nationalism is not a coordinate — it appears at **both**
   conservative-authoritarian corners and is a flavour laid over a position. That is exactly why
   "Christian Nationalism is nationalism with an adjective" felt wrong: the parent term was never a
   position in the first place.
3. **Republicans and Democrats have nowhere to go among eight corners**, and his own list is what
   brought the centre back. They are the middle economic band, split by morals.

**Where his pairings and the geometry disagree, and the geometry is interesting.** Only one of his six
pairs is a true diagonal.

| His pair | What the cube says |
|---|---|
| Distributism / Digital Technocracy | **Exact opposites**, all three axes |
| Anarcho-Capitalism / Democratic Socialism | Two axes apart. The true diagonals are **AnCap ↔ Communism** and **DemSoc ↔ Christian Nationalism** |
| Liberal Anarchy / Christian Nationalism | Two axes apart. Liberal Anarchy's true opposite is **Fascism** |
| **Communists / Fascists** | **Neighbours, not opposites** — they differ on morals alone and agree on both a collective economy and an authoritarian state. **The cube says the horseshoe is real**, and it was not authored |

**Why ten works better than eight, measured rather than asserted.** A centrist sits **√2** from each of
the four corners on its own moral side, while any two corners are **2** apart. So Republicans are
closer to fascists, distributists, Christian nationalists and anarcho-capitalists than any two of
those four are to each other — **the mainstream party is the great coalition-builder of its own half**,
without being bland. And Republicans and Democrats are exactly **2** apart, the same distance as
fascism and communism, which is a true and useful thing to be able to say about American politics.

**This supersedes ruling 1's roster of eight** if Aaron takes it. The three axes and the naming
principle — real names a player would recognise on a ballot — are unchanged.

### P5 — RULED: the board, the drift, and the two things you fall into

**Ruling 2, 9 September, superseding ruling 1's roster.** Aaron took P4's ten and made two changes,
both his.

**1. Authoritarian sits at both outer ends.** Morals run across the board; within each moral half,
power runs from authoritarian on the *outside* to libertarian on the *inside*.

| | cons / **auth** | cons / lib | prog / lib | prog / **auth** |
|---|---|---|---|---|
| **Collective** | Fascism | Distributism | Democratic Socialism | Communism |
| **Middle** | *Republicans, across both conservative columns* | | *Democrats, across both progressive columns* | |
| **Neo-liberal** | Christian Nationalism | Anarcho-Capitalism | Liberal Anarchy | Digital Technocracy |

**This makes the horseshoe visible.** Fascism sits at the far left edge and Communism at the far
right, and P4 had already found by arithmetic that they are *neighbours* rather than opposites. Now
the picture says it too: both ends run off the board into the same place.

**2. Despotism and Stateless become things you fall into.** Not parties — nobody stands for election
as either. **Off either authoritarian end → Despotism**: one party or none, full command of the
state, and every other nation treating you as what you have become. **Out through the libertarian
middle → Stateless**: the government dissolves into ground with people on it and nobody in charge.
**Aaron's mechanic: going too far buys power and costs standing.** The exchange rate is deliberately
not set.

**Only the two centrist parties stand over solid ground.** Every one of the eight corners has a
trapdoor under it.

**DEFERRED the same sitting, at Aaron's instruction: the *falling* goes to `docs/FUTURE-IDEAS.md`
F19, to be picked up after the alpha build.** The board, the ten positions and the drift partition
below are **ruled and current**; what despotism buys, what it costs in standing, and how far "too
far" is are **not being answered now** and no placeholder was invented for any of them. The two
conditions stay named on the board because the shape needs them — a corner with nothing beyond it is
not a corner.

### P6 — The drift is an exact partition, and it is the opening move

**Aaron, 9 September:** *"at the start of the game we have republicans and democrats and they could
drift into four different categories each."*

**Verified, and tighter than stated.** A centrist holds the middle on economy and on power and sits
at one end of morals. The corners reachable without changing morals are exactly those varying the
other two axes: **2 × 2 = four** for each centrist, and **4 + 4 = 8 covers every corner once**. No
corner is unreachable; no corner is reachable from both.

| From | Economy | Power | Corner |
|---|---|---|---|
| **Republicans** | collective | authoritarian | Fascism |
| | collective | libertarian | Distributism |
| | neo-liberal | authoritarian | Christian Nationalism |
| | neo-liberal | libertarian | Anarcho-Capitalism |
| **Democrats** | collective | authoritarian | Communism |
| | collective | libertarian | Democratic Socialism |
| | neo-liberal | authoritarian | Digital Technocracy |
| | neo-liberal | libertarian | Liberal Anarchy |

**Leaving the centre is two questions with two answers each** — which way on the economy, which way
on state power — and morals is the thing you do not change. That is politically true: parties
rearrange their economics and their tolerance for coercion far more readily than they change the
moral coalition that elected them.

**The consequence nobody asked for, recorded because it is load-bearing: crossing the moral line is
the expensive move.** A Republican party cannot become Communist. It would have to become Democrat
first — measured, √6 direct against 2 through the centre — which makes moral realignment the rarest
and slowest change on the board, exactly as it has been in American history.

**This re-points the existing *change course* valve** rather than asking for new machinery: the build
already has `changeRulingIdeology`, gated on popular share, priced in treasury by distance moved, and
costing Authority. **Two of the four release valves now have a geometry behind them instead of a
tunable.**

**Still owed, and smaller than it was:** the 2024 county seed gives Republican, Democrat and other,
and under this scheme **the two big parties DO map straight across** — they are positions 1 and 2.
Only the small "other" share needs splitting by cultural region, across the eight corners. **Ruling 2
shrinks the job D185 called the largest single piece of authoring in the change.**

### Ruling 11 — The one table: five moves, six verbs, and the built valves were the answer all along

**RULED 9 September 2026.** Aaron on the structure below: *"That is the general shape - yes."* This is round 1's finding D and Aaron's instruction that the
answers to *Expand* and *Reconquer* go in **one table, not two**.

**The discovery that makes it one table.** The four built valves are not four ad-hoc levers for
*Separate*. **They are four general moves, and nobody noticed because they were only ever aimed at one
verb:**

| The built valve | The general move |
|---|---|
| Release the ground | **Concede** — give them exactly what they want |
| Grant autonomy | **Concede less** — a cheaper substitute that scratches the itch |
| Change course | **Remove the want** — fix the cause so they stop wanting it |
| Garrison | **Suppress** — force |

**Ruling 9 adds a fifth: become them.** Concede everything, including your identity.

**So the table is five moves against six verbs, and almost nothing has to be invented** — most cells
are re-pointings of machinery that exists.

| Verb *(authored movements)* | Concede | Concede less | Become them | Remove the want | Suppress |
|---|---|---|---|---|---|
| **Separate** *(15)* | release the ground **·built** | autonomy **·built** | ruling 9 | raise quality of life; change course **·built** | garrison **·built** |
| **Rejoin** *(0)* | hand it back to its old parent | autonomy | — | **govern it better** | garrison |
| **Unify** *(5)* | merge with the neighbour | **join a bloc** — the form without the substance | ruling 9 | deliver what they think merging would bring | garrison |
| **Reunify** *(3)* | put the state back together | a treaty short of merger | ruling 9 | **string them along until the verb changes** *(round 2 ruling 30)* | garrison |
| **Expand** *(2)* | go and take it | **buy it rather than take it** | — | **stop being short** *(round 4's)* | garrison |
| **Reconquer** *(0)* | go and take it back | **get it by treaty** *(round 2's machinery)* | — | renounce the claim *(finding G)* | garrison |

**Four things this turns up.**

1. **Weighted by what is actually on the board, the hole is 40%, not five-sixths.** Finding D counted
   verbs. Counting *movements*: **Separate is 15 of the 25 reviewed — 60%** — so the four built valves
   already answer three movements in five. Unify 5, Reunify 3, Expand 2. **The gap is real and it is
   smaller than the verb count makes it sound.**
2. **Rejoin and Reconquer have no authored movements at all.** Both are born in play only. Two of
   finding D's "five verbs with no answer" currently have nothing to answer.
3. **Rejoin is the only verb curable by governing better.** Round 1's ruling 42 triggers it on
   authority, quality of life, war weariness and occupation — all things the government controls about
   itself. **Every other verb needs you to give something away, act abroad, or suppress. This one you
   fix by being better.** Nothing else on the board has that property.
4. **"Join a bloc" is the cheap answer to Unify — which answers inbox item 7 as a by-product.** Round 1
   asked whether joining a bloc is a political act with a domestic price. It is: **it is the
   concede-less move for a Unify movement**, giving them integration without a merger. The bloc itself
   stays round 5's.

**The empty cells are informative rather than missing.** *Become them* does not apply to Expand or
Reconquer, because adopting an expansionist programme is simply obeying it — the cell collapses into
Concede. **The verbs with fewer moves are the ones that squeeze the player hardest**, which is a
feature worth keeping rather than filling in.

**Default taken rather than asked, and flagged: *become them* is a fifth move, not the maximum of
conceding.** Releasing ground gives away **territory**; becoming the movement gives away **identity**
and keeps the territory, minus whatever walks out under ruling 9's price. Those are different enough
that collapsing them would hide a real choice from the player. **One line to correct if wrong.**

### Ruling 11a — The "remove the want" column belongs to the ADJECTIVE, and there are five of them

**RULED 9 September 2026.** The one cell nobody could fill was *what makes a Unify movement stop wanting
to merge*. Working it produced a structural answer that applies to the whole column.

**Round 1's ruling 40 already said it and nobody carried it forward:** *"Every movement has a verb —
what happens if it wins — and an adjective — what would make it stop wanting to."* **The adjective IS
the remove-the-want column.** Four of the five moves are the verb's; that one is the adjective's.

**Seven adjectives became five.** Aaron asked whether religious/ideological and resource/economic
should merge. **The test used, and it is reusable: two adjectives merge when the same government act
cures both.**

| Adjective *(movements)* | What removes the want | Merged in |
|---|---|---|
| **autonomist** *(7)* | self-rule, and giving land back — **the same cell as *concede less*, so these two collapse** | **indigenous** |
| **cultural** *(6)* | recognition — let them be what they are, inside your state | |
| **ideological** *(6)* | change course **·built** | **religious** |
| **resource** *(3)* | a share of what its own ground produces | |
| **economic** *(3)* | deliver the prosperity by other means — national policy | |

**Why religious merged.** Both are cured by **the government adopting a position**, and under the
three-axis spectrum a religious movement *is* an ideological one sitting at the traditional end of
morals. Deseret wants to live under a communal-traditional order; the Northern Christian Kingdom wants
a religious government. **Nothing is lost.**

**Why resource did NOT merge with economic, though Aaron asked.** They land in different parts of the
machine. **Resource** is *"this region keeps a share of what its own ground produces"* — revenue
forgone locally and permanently, which re-points the **autonomy** machinery. **Economic** is national
policy — tariffs, compacts — which re-points the **trade** machinery and costs standing with every
neighbour. **Merging them would hide a price difference that is the whole reason the choice is
interesting**, and it would surface only when somebody tried to build one cure and found it was two.

**Indigenous merged into autonomist**, by the same test and not originally asked: the Native American
Confederation and Hawaiian Sovereignty both want *sovereignty and land restoration*, and the Sagebrush
Rebellion wants *"return the federal land, county supremacy"* — the same two acts. **Read from
Aaron's approval of the table rather than stated by him; one word to reverse.** Movements keep their
own names and goals either way, so nothing a player reads changes.

**So a Unify movement's cure depends on why it wants to merge, not on the merging.** Three of the five
are economic — fix the prosperity and the compact stops mattering — and two are ideological, which is
the *change course* valve that already exists. **Nothing new is needed for either.**

**Two consequences worth keeping.**

1. **An autonomist movement is the cheapest kind to satisfy**, because its cheap substitute and its
   cure are the same act. Five of the twenty-five reviewed are autonomist.
2. **The whole design is 6 verbs + 5 adjectives + 5 moves = 16 things, not 42 authored cells.** The
   table is generated rather than written, which is the same economy the ideology axes buy.

~~**Still open:** whether answering a movement costs the turn's action. Round 2's **C117** took the
default **free to answer, costly to obey** without asking, and it has never been confirmed.~~
**ANSWERED by ruling 12** — free, and mandatory before the turn can move.

### Ruling 12 — Demands are free, mandatory, and answered before the turn can move

**Aaron, 9 September 2026**, confirming round 2's C117 default and adding to it.

> "Responding to them is not counted as part of your turn and it is something you have to do before
> you can move on. So a notification will appear with some text (we will figure that out later) but
> like **MOVEMENT DEMANDS:** with the list of their demands."

**C117 is confirmed — free to answer, costly to obey — and Aaron made it *mandatory*.** A turn now has
two phases: **answer every demand on the table**, which costs nothing, and then **take your one
action**. The wording of the notification is deliberately left for later.

**THE PRECEDENT, and it is the largest thing in this ruling.** `IDEATION-PLAN.md` rule 3 says: *"One
action per nation, and it ends the turn. Six components are competing for one slot. Any idea that
assumes it gets a decision every turn has just taken that turn away from the other five."*

**Ruling 12 is the first thing in the whole design to get a guaranteed decision every turn without
spending the action.** It is the right call for movements — the pressure is the point, and making the
player pay an action to say *no* would mean whole turns spent refusing people — **but every other
component will now want the same channel, and the answer has to be no unless it earns it the same
way.** Recorded so the precedent is deliberate rather than discovered.

**Volume, measured before it was worried about.** Movements whose homeland touches each state:
**median 2, worst 5** — and the worst is **Oregon**, which is the nation Aaron used for his own
example. Eight states have one or none. **A mandatory phase is two cards on a normal turn and five on
the hardest, which is a rhythm rather than a wall.**

**No deadlock is possible**, because refusing is always available and always free. It is not free of
consequence — round 2's ruling 30 makes a refused movement **grow**, and a strung-along one **change
what it wants**.

**What is built: nothing.** There is no petition or demand machinery in the game at all — the only
`demand` in the code is the economic kind in `market.js`.

**And ruling 12 pulls round 1's finding A forward, out of the round that owns it.** Finding A: *"the
petition threshold must sit below the secession threshold, and nobody set one… if those are the same
number, no movement ever petitions — it declares first. Cascadia would take Portland and Seattle
rather than ask for them."* It was filed to **diplomacy, round 5**. **A mandatory per-turn demand
phase cannot be built without knowing when a movement starts demanding, so finding A is now this
round's and it is blocking.** No number invented.

### Finding D — Ruling 3 and ruling 4 contradict each other on stateless ground

**Found while tracing ruling 12 against round 1's open findings, and it is mine to own: I closed round
1's finding B too confidently in ruling 3.**

- **Ruling 3** says stateless ground has **no stocks** — no government, so nothing to hold quality of
  life, liberties, authority or weariness.
- **Ruling 4** says **a movement can rise out of a stateless society.**
- **Round 1's finding B** is the collision: *grievance reads the holder's quality of life, liberties,
  authority and weariness.* **With no holder there is no grievance, and grievance is what makes
  movements grow.** Finding B names the casualties — *"three of the six stateless regions… and the Rio
  Grande Union, the Central States Union and the Sagebrush Rebellion have nowhere to grow."*

**Ruling 3 marked finding B closed *"for conquest's purposes"*, which was true and insufficient.** Its
second half — whether a movement can grow on ungoverned ground — was left standing and then
contradicted by ruling 4 an hour later.

**Proposed resolution, not ruled: on stateless ground a movement grows by ATTRACTION rather than
GRIEVANCE.** The growth model already has two terms — the movement's own rate against its ceiling,
and a diffusion pull from neighbouring Areas — and only the grievance term needs a holder. **A
stateless region has nobody to be aggrieved at; what it has is neighbours joining something and people
who agree with them.** That is thematically right and it needs no new machinery, only permission for
the grievance term to be absent rather than zero.

### Ruling 13 — On ungoverned ground a movement grows by attraction, not grievance

**Aaron, 9 September 2026:** *"Correct."* **Finding D closes, and with it round 1's finding B — both
halves this time.**

**Verified against the model, and it is subtraction rather than addition.** `js/sentiment.js` computes:

```
grievance = w_qol * (1 - quality of life) + liberties + weak nation + weak authority + weariness
pull      = w_nbr * tanh(k * SUM over neighbours of their share)
target    = clamp01( base * (grievance + pull) - suppression )
```

**Every input to `grievance` belongs to a holder.** Quality of life, civil liberties, national power,
authority, war weariness — all of them are facts about a government. **`pull` needs nothing but
neighbours, and `base` is the ideological match.** So on stateless ground the rule is simply
**`target = base × pull`**: grievance is *absent* rather than zero, and the movement grows on who its
neighbours are and whether these people agree with it. **One term drops out. Nothing is invented.**

**The consequence nobody asked for, and it is a good one: `suppression` also drops out.** Suppression
comes from a garrison, and **there is no government on stateless ground to garrison it.** So a
movement there grows **entirely unopposed** — no grievance to accelerate it, and no force able to hold
it down.

**That makes stateless regions the natural incubators of movements**, which completes the life cycle
rulings 4 and 5 built: **stranded → stateless → a movement organises, unopposed → a nation.** The
middle step now has an engine rather than an assertion.

**And roughly 176 Areas become live ground rather than dead scenery** — the thing finding B was
warning about. The Rio Grande Union, the Central States Union and the Sagebrush Rebellion keep their
homelands.

### Ruling 14 — Martial law: fewer rules, not more soldiers

**RULED 10 September 2026.** Proposed at Aaron's request — *"how do you think martial law should work
based on everything else in the game"* — and ruled with his three answers below.

**The constraint that decides the shape.** `mil.garrisonHalf` is documented as **PER AREA**, and says
why: *"which is what stops a large empire suppressing everything at once: a garrison spread over sixty
Areas is not the garrison of a nation with four."* **Any martial law that simply suppresses everywhere
breaks that on purpose.** So martial law must not be more force.

**The proposal: martial law is a LEGAL state, not a military one. It does not give you soldiers — it
takes away the rules the soldiers you already have are operating under.**

| | |
|---|---|
| **Declared over** | a chosen set of Areas, the way release and autonomy already work. The story's version is regional — the 12 Areas around Washington |
| **What it does there** | **multiplies the suppression an existing garrison produces.** No garrison in an Area, no effect in it — a nation with no army gets nothing from declaring it |
| **What it does nationally** | **suspends the election** — the one thing nothing in the game can do — *if* it covers enough of the country |
| **What it costs** | civil liberties in every Area under it, at a multiple of a garrison's rate; and **Authority nationally**, because a government that suspends elections has announced it cannot win one |
| **What ends it** | nothing hard. **The cost compounds each turn it holds.** Round 2 removed all three hard brakes on conquest and left only prices; this follows that taste |

**It obeys the law this game states three times in its own tunables** — *"a garrison buys quiet now and
buys the grievance that feeds the next movement… without which suppression is a free answer to
secession and the whole valve is a button you would always press."* **Martial law suppresses the
symptom and feeds the disease**: the movement share falls while it holds, and the liberties it burns
raise the grievance that regrows it faster.

**Against ruling 8's civil war clock:** it slows the clock while it holds and speeds up what the clock
is measuring. Buying time at compound interest.

**THE PART WORTH KEEPING, and it fell out rather than being designed.** The game already has a way to
stay in power against a vote: **stealing the election**, available only when Civil Liberties are below
**`election.stealBelow` = 0.32**, costing **0.12** more. **So the two are available at opposite ends of
the same scale, and neither is strictly better:**

- **A rotten government** — liberties already under 0.32 — **steals quietly and cheaply.** It is
  barely a change from what it already was.
- **A decent government** — liberties well above 0.32 — **cannot steal at all.** Its only option is to
  declare martial law openly, and it pays far more, because it had further to fall.

**That is scenario 3 of the whole plan, arriving from an unexpected direction:** *a government that
chooses between its own identity and its territory.* A decent government in a crisis must lose power
honestly or become the thing it was elected to prevent. **Elections run every 16 turns — four years —
so the choice is rare and it lands hard.**

**Where it sits in ruling 11's table:** it is the **Suppress** move at national scale, and the only
move in the game that touches an election.

**Aaron's three answers, 10 September 2026.**

1. **The election is suspended only when martial law covers over 50% of the nation.** His own note:
   *"which also means that conquering too much could be a bad thing."*
2. **It costs one action** — *"but lets move that to the mechanics stage because **we need to change
   the whole one action per turn**."* **Deferred**, and the second half of that sentence is the bigger
   statement; filed to round 7 in `the-things-above-ideation.md`.
3. **The AI may declare it**, with a note to the architecture stage to make sure it *"doesn't [go] in
   either direction too much"* — neither constantly nor never.

**No numbers invented.** Every figure quoted above is one already in the build.

### Finding E — "Conquering too much is bad" is true, and the mechanism is the posture, not the size

**Aaron's instinct on the 50% threshold is right and the reason is not the one it looks like.**
Measured against the build rather than reasoned about:

| | |
|---|---|
| Areas are built to a floor of | **50,000 people**, at most 8 counties |
| Force | `pop × 0.004` |
| Force splits three ways | **garrison · border · field**, an even third each by default |
| Suppression is half at | **200 troops per Area** |

**To hold half your Areas at half-suppression you need `100 × Areas` on garrison duty.** Run against
the two ends of the density range:

| A nation whose Areas average | Share of your whole army needed on garrison |
|---|---|
| **201,000 people** *(the map's average)* | **≈12%** — trivial, well inside the default third |
| **50,000 people** *(the Area floor)* | **≈50%** — half your army, taken from Field and Border |

**So size alone never blocks it.** What blocks it is **density**, and conquest lowers density
*because the cheap ground is the empty ground*. **The bite is therefore not "you are too big to
suspend an election" — it is "you must choose between suspending elections and campaigning
abroad."** The force martial law needs at home is exactly the force you wanted in Field to conquer
more.

**And a second constraint makes it a commitment rather than a lever.** `js/military.js`: readiness is
rate-limited, *"so switching everything to Field the turn before you invade buys you nothing, and a
standing posture is worth more than a reaction."* **The same is true in reverse: you cannot flip to
garrison on the turn you need martial law.** A government must already have been facing inward.
**Martial law is not a panic button. It is a posture you committed to several turns before you knew
you would need it** — which is both truer to life and a better game.

### Ruling 15 — The Farmers Union wants a union, and a Unify movement's demand is that YOU go and ask

**RULED 11 September 2026**, answering finding A and the board card `farmers-union`. Aaron, verbatim:

> "The Famers Union would be a movement that seeks to unify the entire farmers movement into a solid
> state entity. Because it would control the huge trading arteries in the USA it should be something
> that is hard to actually do. I think that it needs to be different because they are trying to get
> their government to do something, create a union. So if a country has X% of the farmers movemnet
> the demand would be that they start asking their neighbors, so to propose. And depending on how
> things go the proposal could go one of two ways - positive or negative. Positive would be that they
> agree and negative would be that they feel like the nation is trying to consolidate power or
> something ismiliar."

**Three things are settled.**

1. **It is a MOVEMENT, not a bloc of governors, and its verb is *Unify*.** The story's "seven
   governors signed the Farmers Union" is a separate object and goes to round 5 with the other blocs.
   The five pairs blocked by finding A are unblocked.
2. **A united farm state must be hard to achieve**, because of what it would hold. Checked rather
   than assumed — see the measurement below. His premise is true.
3. **A Unify movement's demand is a DIPLOMATIC ACT the government must perform, not a merger it must
   deliver.** Past a share of the population, the demand is *go and propose to your neighbours*. The
   neighbour's answer can be **positive** — they agree — or **negative**: they read the approach as a
   nation trying to consolidate power.

**WHAT THIS CHANGES IN RULING 11's TABLE, and it is structural.** The *Concede* cell for **Unify**
read "merge with the neighbour". That is now known to be **the only cell in the whole table that the
government cannot deliver by itself.** Every other move acts on your own people, your own ground or
your own policy — release, autonomy, change course, garrison, become them. This one needs **another
nation to say yes**, so for Unify, *Concede* is not an act but an **attempt, and it can fail.**
Nothing else in the design has that shape, and it is why Aaron is right that Unify "needs to be
different".

**And it hands the round its player verb from a direction nobody proposed.** Q3 asked whether
*negotiate* should join the table as the missing thing a player DOES on a Tuesday. Here the movement
makes you negotiate — with a neighbour, on its behalf, and you can be refused.

**THE NUMBER IS DEFERRED, NOT INVENTED.** Aaron wrote **X%** and no figure was substituted. It joins
the tunables at the mechanics stage, beside ruling 39's Wary multiplier. *(An invented number
reaching his board looking measured has cost this project a day once already.)*

**THE MEASUREMENT — his premise about the arteries, checked against the game's own trade data.**

| | |
|---|---|
| Chokepoints in the game | **15** |
| Chokepoints inside Farmers Union ground | **3** — the **Soo Locks**, the **Straits of Mackinac**, and **Cairo**, the Ohio-Mississippi confluence |
| Its counties on a named waterway | **164** — 47 Mississippi, 39 Missouri, 16 Ohio, 16 Illinois, 12 Lake Michigan |
| Its counties with a port / on the Great Lakes / on a national border | **23 / 47 / 4** |

**So "it would control the huge trading arteries" is true**, and specifically: a single farm state
would hold **a fifth of the continent's gates**, including the one the river work named as the gate
between the Ohio and the Mississippi. Being hard to build is not a balance decision bolted on — it is
what the map says the prize is worth.

**A CORRECTION TO WHAT AARON WAS TOLD IN THIS SESSION.** The Farmers Union was put to him as "the
second largest movement in the game". True **by ground** — 983 counties, behind only the New
Confederacy's 1,142, which is how finding A stated it. **By people it is fourth of the six Unify
movements**, and not close:

| Unify movement | Counties | People |
|---|---|---|
| Christian Nationalism | 255 | **96,886,368** |
| Blue-Collar Populist | 693 | **70,123,744** |
| Great Lakes Free Trade | 103 | 23,731,284 |
| **The Farmers Union** | **983** | **22,638,807** |
| New England United | 68 | 15,386,085 |
| Central States Union | 215 | 9,998,817 |

It is the movement with **the most ground and the fewest people on it**, which is exactly what a farm
movement should be. It does not change the ruling; it changes how frightening the thing is. It is
wide, not heavy.

**FOUR QUESTIONS THIS OPENS. None answered, asked in this order.**

1. **If the neighbour says yes, what actually happens?** One nation, or something short of a merger?
2. **What decides positive or negative?**
3. **Does asking once satisfy the demand**, or does the movement keep demanding until a union exists?
4. **Does making the proposal cost the turn's one action?** *(Ruling 12: answering is free, obeying is
   costly — and proposing is obeying.)*

### Ruling 16 — A proposal has three answers, and the middle one is the interesting one

**RULED 11 September 2026**, answering the first of ruling 15's four questions. Aaron, verbatim:

> "I think that they either say yes, lets think about (and in this sense they are seriously
> considering it and the movement in that country gets a bonus growth modifier) or no.
>
> If they say yes they become one entity and everyone becomes members of that state (so no negative
> multipliers like when conquering territory)"

**Three answers, not two.**

| Answer | What it does |
|---|---|
| **Yes** | The two nations become **one entity**. Everyone in the joined ground is a **full member of that state** |
| **"Let's think about it"** | They are seriously considering it, and **the movement inside THEIR country grows faster** |
| **No** | Refused — and per ruling 15, a refusal can be the reading that you are consolidating power |

**THE MIDDLE ANSWER IS THE ONE NOBODY HAD, and it is the best thing in this ruling.** A maybe is not
a null result: **it grows the movement inside the other country.** That makes it the first mechanism
in this design where a *diplomatic act grows a movement abroad* — everything else that crosses a
border either moves goods, moves soldiers, or leaks ideology through affinity. **A country that keeps
being asked starts to want it.** And it gives the asking government something to do while it waits,
which is what stops this being one roll of a die.

**WHAT A YES IS WORTH, MEASURED AGAINST CONQUEST RATHER THAN ASSERTED.** Aaron's "no negative
multipliers like when conquering territory" names something the build already carries. Ground held as
**occupied** today drags **five** separate things:

| | |
|---|---|
| **Authority** | occupation is one of its eleven inputs |
| **Influence** | the same share, read again |
| **Civil liberties** | `liberty.wOccupation` — *"share of held ground governed as occupied territory"* |
| **War weariness** | occupation feeds the stock that makes a campaign a campaign |
| **The treasury** | a **superlinear surcharge** that scales with how hostile the ground is |

**A union pays none of the five.** So the ruling says something much larger than it looks:
**joining is the only way to grow that does not poison the ground you gained.** Every other route to
size — annexing, conquering, holding — costs authority, liberties, money and patience for as long as
you hold it. That is the game's own title arriving as a mechanic rather than as a theme.

**DEFAULT TAKEN, NOT ASKED — one line to reverse.** *Their movements come with them.* What a yes
waives is the **occupation** penalty, not the **politics**: the joined population arrives as full
members with no surcharge and no liberties hit, and every movement organised in those counties arrives
too. Otherwise a merger would be a way to launder a hostile population — walk in by invitation, and a
region that wanted out of them stops wanting out of you. **Finding F is exactly this case**: a
government that unites with its neighbour to satisfy the farmers inherits the rust belt's movement as
well, and under ruling 6 the two sum against it.

**A RISK WORTH NAMING NOW, because three later answers decide it.** If a "let's think about it" costs
the asker nothing, then **asking repeatedly is a dominant strategy**: propose every turn, farm the
neighbour's movement upward, and wait until their own government is the one carrying the demand. Three
brakes exist and none of them is confirmed yet — whether proposing costs the turn's one action
(question 4), what a refusal costs in suspicion (question 2), and the **X%** gate that has to be
crossed before the demand fires at all. **At least one of the three must bite.**

**Still open from ruling 15:** what decides which of the three answers you get; whether asking once
satisfies the movement; and whether proposing costs the turn's action.

### Ruling 17 — What decides the answer: their appetite, your weight, and the relationship as a gate

**RULED 11 September 2026**, answering ruling 15's question 2. Aaron approved the shape put to him and
corrected one term:

> "Yes to all of those but the other thing I would say is that size should also include authority and
> influence"

**The shape, as ruled. One dial, two modifiers, one gate — and every one of them already exists.**

| | |
|---|---|
| **The dial** | **Their own people's appetite** — the share of THEIR population organised in the same movement. Low → *no*. Middling → *let's think about it*. High → *yes* |
| **Warms it** | **Political closeness** — the same `affinity` already driving coalitions, drift, trade alignment, defection and AI diplomacy |
| **Cools it** | **Your WEIGHT against theirs — size, Authority and Influence together**, not physical size alone. This is also where "they feel you are consolidating power" comes from |
| **The gate** | **The relationship.** Round 2 ruled that a *wary* nation is less willing to agree to what you propose; a *hostile* one cannot say yes at all. Checked before anything above is computed |

**WHY AARON'S CORRECTION IS THE RIGHT ONE.** Physical size alone would make a sprawling, badly
governed country frightening and a small, firmly held, widely trading one harmless — which is
backwards. **A nation is frightening because of what it can bring to bear, not how much map it
covers.** It also makes the brake self-correcting: *the nation that is winning is the one that finds
unions hardest*, because winning is exactly what raises all three terms. That is the "hard to actually
do" of ruling 15, arriving without a rule that says no.

**WHAT INFLUENCE ALREADY CONTAINS, read from the build rather than assumed.** Share of world output;
**reach**, meaning the nations you hold live trade relations with; and **alignment**, how close the
rest of the world is to you politically, weighted by their size. It is **reduced by ground taken
recently, scaled by how big you already were** — *"a superpower annexing a neighbour pays more in
reputation than an unknown does"*. So Aaron's term arrives carrying the whole diplomatic picture, not
just a number.

**THE TRAP THAT FELL OUT OF CHECKING IT, and the default taken.** Because Influence **falls** when you
conquer, a nation fresh from taking ground would score *lower* on the frightening side for as long as
that penalty lasts — **so the serial conqueror would look more approachable exactly when it is most
dangerous.** The dip is temporary (it is a rate over the history window, and size raises Influence
again afterwards) but it points the wrong way while it lasts.

**Default: ground taken recently counts as frightening in its own right**, beside the three terms. The
game already tracks exactly that, in the same history window Influence uses, so it costs nothing to
read. **One line to reverse.** The alternative reading is defensible and is recorded rather than
dismissed: Influence is *standing in the world's eyes*, and a conqueror has spent its standing — so it
is not less threatening, it is **less persuasive**. Under that reading Influence belongs on the warm
side and only size and Authority cool it. Aaron's wording puts all three on the cooling side, so that
is what is ruled.

**A VISIBILITY QUESTION, filed rather than answered.** Can a player *see* a neighbour's Authority and
Influence before proposing? If not, the answer arrives as a surprise and the player cannot plan
against it. **Filed with C130** — the same question round 2 left open about what a nation can see of
its enemy when writing a blind peace treaty. It wants one answer covering both.

**Still open from ruling 15:** whether asking once satisfies the movement, and whether proposing costs
the turn's action. **The exploit named in ruling 16 is still unbraked** — nothing ruled so far stops a
government proposing every turn to farm the neighbour's movement upward.

### Ruling 18 — Asking discharges the demand, and the movement comes back pointing somewhere else

**RULED 11 September 2026** — *"Agreed"* — answering ruling 15's question 3.

**The demand names a neighbour. Asking that neighbour discharges it.** Later the movement raises it
again, pointing at whichever neighbour is now the likeliest *yes* — **which will often be the one who
said "let's think about it", because that answer grew their appetite** (ruling 16). Your last approach
is what makes the next one warmer.

**THE MOVEMENT IS CLEVER FOR FREE.** It points at whichever neighbour scores highest under **ruling
17** — their people's appetite, warmed by political closeness, cooled by your weight, gated by the
relationship. The same calculation that decides the answer also decides who gets asked, so nothing new
has to be written and the movement never asks you to do something obviously hopeless.

**AND THIS IS THE BRAKE THE LAST TWO RULINGS WERE MISSING.** The exploit named in ruling 16 — propose
every turn, farm the neighbour's movement upward, wait until their government carries the demand —
**closes by itself, because the proposal runs on the MOVEMENT's clock rather than the player's.** You
do not ask when you like; you ask when your own people demand it. To ask more often you would need
your own movement bigger, and a bigger movement is a worse problem than the one you were solving.

**Refusing to ask stays the expensive branch.** Round 2 already built the screen where a movement's
demands are granted, refused, or told to wait; refusing feeds the grievance that grows the movement.

**Rejected, and it was put to him:** the demand never discharges until a union actually exists, sitting
there getting angrier. Truer to a movement with one idea, but **a country with an unlucky neighbour
would carry a permanent penalty it could not clear by doing anything right.**

**Deferred, not invented:** how long "for a while" is. It joins the tunables with ruling 15's **X%**.

**Filed for round 5:** whether a government may propose a union with **no movement demanding it** — a
nation-to-nation act rather than an answer to its own people. That is diplomacy's question, not this
round's.

### Ruling 19 — Proposing costs the turn's action, by precedent rather than by a new decision

**DEFAULT TAKEN 11 September 2026, not asked — one line to reverse.** Ruling 15's question 4 is
already answered by rulings this round has made.

**Ruling 12** settled it in principle: **answering a demand is free and mandatory; obeying it is
costly.** Making the proposal *is* obeying, so it costs the turn's one action, exactly as granting
autonomy or releasing ground does. Nothing about a union is special enough to need its own rule.

**The caveat is Aaron's own, and it is bigger than this ruling.** At **ruling 14** he wrote: *"lets move
that to the mechanics stage because we need to change the whole one action per turn."* That is filed in
round 7 with ruling 12's free-and-mandatory exception beside it. **When the one-action rule changes,
this ruling changes with it** — it is a consequence of that rule, not an independent decision.

### Ruling 20 — A split region goes ungoverned, and its edge counties choose a neighbour over the winner

**RULED 11 September 2026**, closing ruling 6's opened question and the board card
`area-split-between-movements`. Aaron agreed the recommendation and added the second half:

> "yes and I think that the edge counties should possibly join up with them and there would be a
> formula we come up with where if it has similiar politics or other things it has a greater chance of
> joining up with a state that they aren't aligned with from a movement standpoint - because sometimes
> it is better to be governed by people you don't like rather than worry about being governed by people
> who hate you"

**Part one — who takes the ground: NOBODY.** When the *total* organised share crosses
`secession.countyThreshold` (**0.40**) and no single movement has, the Area goes **ungoverned**. A
government that has lost control while no successor has won it is the definition of ungoverned ground,
and ruling 5 already built that object, so it costs nothing new. Ruling 13 then takes over: on
ungoverned ground movements grow by **attraction** rather than grievance, so both carry on competing
for the same people with no government left to push against, and whichever becomes the better offer can
stand it up as a state. **Two movements can bring a government down together and neither inherits what
is left.**

*Rejected:* **the largest movement takes it** — a movement organising a quarter of a region would win a
place three-quarters of it did not choose, and swallow its rival for free. And **nothing happens, the
ground merely costs more to hold** — which is what the build does today by accident, and it makes the
coalition rule toothless: two movements could reach 90% between them and the map would never change.

**Part two — the edge counties choose, and the choice is not about the movement.** A county on the
boundary of newly ungoverned ground may attach itself to an adjacent **state** instead. **The dial is
politics, not movement alignment**, and Aaron's reason is the whole mechanic:

> *"sometimes it is better to be governed by people you don't like rather than worry about being
> governed by people who hate you"*

**So the county weighs two futures, and both are already computable.** `affinity` — the same function
driving coalitions, drift, trade alignment, defection and AI diplomacy — is asked **twice**:

| | |
|---|---|
| **How much you would dislike the neighbour** | `affinity(this county's people, that state's government)` |
| **How much the local winner hates you** | `affinity(this county's people, the strongest movement on the ungoverned ground)` |

**It joins the neighbour when the second is worse than the first.** No new data and no new machinery —
one existing function asked about two different futures. It also explains why a county would join a
state it disagrees with, which is the behaviour Aaron is asking for and which no *movement*-based rule
could ever produce.

**THE MEASUREMENT THAT SHAPES THIS, and it changes how big the rule is.** The unit that goes ungoverned
is an **Area**, and an Area is small:

| | |
|---|---|
| Counties on the map | **3,143** |
| Areas | **1,688** |
| Areas that are a **single county** | **1,181 — 70%** |
| Largest Area allowed | **8 counties** (`max_members`), built to a 50,000-person floor |

**So for seven Areas in ten, "the edge counties" is the whole Area.** A lone Area that falls out of a
nation is all edge, and under this ruling it will usually attach to somebody rather than sit there.
**That is the rule saving itself from its own worst outcome:** without it the map would slowly fill
with single-county holes. With it, **small pockets get absorbed and only a large collapse leaves
lasting ungoverned ground** — which is exactly the shape of the six regions the story opens with, and
nobody had to write a rule saying "only big ones count".

**Two defaults taken, each one line to reverse.**

1. **The receiving state does not get a refusal.** The county joins, bringing its grievance and any
   movement organised in it. Free ground that argues with you is a price, not a gift, and it is the
   same price ruling 16 put on a union.
2. **The choice is made when the ground falls**, not continuously. Counties leaking to neighbours every
   turn afterwards is a bigger mechanic — it would give ungoverned ground a slow decay — and it is
   noted for the mechanics stage rather than ruled here.

**Deferred, not invented:** the margin by which "they hate us" must beat "we dislike them" before a
county moves, and whatever else Aaron's *"or other things"* turns out to hold. Joins ruling 15's **X%**
and ruling 18's quiet period in the tunables.

### Ruling 21 — Of round 1's four new valves, only one is new: the referendum

**RULED 11 September 2026**, answering **Q3**. Aaron: *"Yes to all three - especially since for #2 a
future idea would be to fund propoganda"*, then, asked which three: **"all four"**.

| Round 1 proposed | Ruled |
|---|---|
| **S24 — negotiate with the movement** | **Already built. Do not add it again** |
| **S25 — hold a referendum** | **ADDED.** The only genuinely new valve |
| **S26 — buy them** | **Deferred to round 4** |
| **S27 — partition it yourself** | **Dropped — you can already do it** |

**S24 was overtaken while nobody was looking.** Round 1 called negotiation *"the missing player
verb"*. Round 2 then built the screen where a nation's own separatists make demands it can **grant,
refuse or tell to wait**, and **ruling 12** made answering them free and mandatory. That is S15 from
the government's side, which is exactly what S24 asked for. The only difference left is **who opens
the conversation**, and a movement that wants something does not need to be asked first. **And the
round is no longer short of a player verb**: ruling 15 gave it one, from a direction nobody proposed.

**S25 is the one worth building, and it is nearly free.** Let the ground vote. **Lose and it leaves
cleanly** — released, a country from day one, no war. **Win and the movement is set back for years.**
It re-points the election machinery that already exists, *including the honesty of the result*: a vote
can only be rigged when Civil Liberties are already below **`election.stealBelow` = 0.32**, and
rigging costs **0.12** more. **So the trustworthiness of the referendum depends on what kind of
government you have been** — the same shape ruling 14 found between martial law and a stolen election,
arrived at independently.

**It carries its own second-order cost, which S28 demanded of every answer.** Win narrowly and you
have *proved* that half the region wants out, in public, with a number. Nothing else in the design
makes a movement's support common knowledge.

**S27 is dropped for two reasons, and the second is measured.** Releasing ground already works over a
**chosen set of Areas** — the same way autonomy and (per ruling 14) martial law do — so releasing the
Areas that want out while keeping the ones that do not **is** partition, under a name that already
exists. And a line cannot be drawn *below* an Area: the Area is the atomic unit of the map, and
**1,181 of the 1,688 Areas are a single county**. There is nothing to cut.

**NAME WHAT JUST HAPPENED, because it is the direction Aaron keeps asking for.** Round 1 proposed four
new government powers on 6 September. Five days later **three of the four are answered by things that
were built or ruled in the meantime** — one exists, one is somebody else's round, one was always
possible — and the design grew by exactly **one** verb. *(The handoff rule: his most common complaint
is that things get too complicated, so say it out loud when the opposite happens.)*

**Filed, not built:** Aaron's own extension — **funding propaganda** before a referendum — is
`docs/FUTURE-IDEAS.md` **F21**. It is S26 pointed at a vote instead of at a region, and it sits
opposite rigging on the same scale: money buys the result legally, liberties buy it illegally.

### Ruling 22 — The movement that changes its mind counts broken promises, and never changes back

**RULED 11 September 2026**, answering **Q5** — the one piece of machinery in the whole design that
does not exist. Aaron: **"Correct - counts broken promises"**, confirming the recommendation put to
him. *(He quoted the first part; the other three were in the same recommendation and are ruled with
it. Each is one line to reverse.)*

**Round 2 had already done half of this and the spine did not say so.** Ruling 30 settled the
*behaviour*: **wait and never deliver, and the movement's verb changes toward *Separate***. Its
reasoning is worth keeping in front of whoever builds this — *"if that were only a larger growth
number, a player would use 'wait' as a cheap delay and absorb the difference. Making it convert the
movement's aim is the only version in which stringing somebody along costs more than saying no."*
**What round 3 owed was the mechanism, not the principle.**

| | |
|---|---|
| **What the clock counts** | **Broken promises, not turns.** Each time a demand is answered with *wait* and the thing has still not arrived when it asks again, the count goes up by one |
| **How far it moves** | **One step, always to *Separate*.** No ladder of intermediate wants |
| **Which way** | **Never back.** A movement that has been disappointed does not start believing you again |
| **How it fires** | **Once, as an event the player is told about** — not a recalculation every turn |

**Why a count and not a timer.** A turn timer punishes a government that told a movement to wait once
and then delivered late — which is the opposite of the lesson ruling 30 exists to teach. A count of
promises made and not kept punishes exactly the behaviour being named. **It is also immune to a player
who simply never opens the screen**, because ruling 12 made answering demands mandatory before the
turn can move.

**Why one step and never a ladder.** Six verbs would need a rule for every pair, which is the
bookkeeping ruling 11's table economy exists to avoid. Disappointment has one destination: **you stop
asking and start wanting out.**

**Why it must fire once.** **C133** requires it: alliance-inherited hostility fires as an event rather
than re-checking each turn, or round 2's ruling 38 is impossible — and a verb that flips on a re-check
has the same problem. It also buys the game a moment worth printing: *the Farmers Union has stopped
asking.*

**FINDING G BECOMES REAL HERE, and it is the only exit from a permanent feud in the design.** Two
nations contesting the same inheritance never forgive each other (round 2). **But if the *Reunify*
movement driving one of them gives up, the permanent hostility floor its contest created lifts with
it.** So a country can talk its way out of a forever-war by **disappointing its own hardliners until
they stop asking** — at the price of turning them into separatists. Nobody designed that; it fell out
of ruling 30 and it arrives here.

**Default taken, one line to reverse: the ADJECTIVE does not change, only the verb.** What would buy
the movement off stays what it was — the farmers still want farm policy, they just want it in their own
country now. Ruling 11a put the adjective in charge of the *remove the want* column, and nothing about
being disappointed changes what the grievance is about.

**Deferred, not invented:** how many broken promises. Joins ruling 15's **X%**, ruling 18's quiet
period and ruling 20's margin.

**And the grimmest sentence in the game now has a second form.** Round 2 produced *"a movement that
asked you to march becomes a movement that wants to leave."* With ruling 15, there is now another: **a
movement that asked you to go and make friends becomes a movement that wants to leave.**

### Ruling 23 — A nation's stance toward the old country is read, not stored — and it gives the remnant a clock it cannot stop

**RULED 11 September 2026** — *"Correct"* — answering **Q12**, and it cost nothing because ruling 22
had just been made.

**A nation's posture toward the old United States is not a new fact to maintain. It is what the
movements inside it want.**

| Reading | When |
|---|---|
| **Waiting** | A **Rejoin** or **Reunify** movement is organised on its ground |
| **Gone** | None is |

**It changes exactly when ruling 22 fires** — the movement is strung along, its verb flips to
*Separate*, and the country stops waiting. **One way, permanently**, because that flip never reverses.
Nothing is stored and nothing new is built; the posture is a *view* of data that already exists, which
is the same economy ruling 11a bought when it made the table generated rather than authored.

**WHAT IT IS FOR, so that it is not decoration.** Ruling 11 found that **Rejoin is the only verb
curable by governing better** — round 1's ruling 42 triggers it on authority, quality of life, war
weariness and occupation, all things a government controls about itself. **So the posture decides
whether that door is open at all:**

- **A nation still waiting can be won back** by a remnant that governs well.
- **A nation that has given up can never be won back**, however good the old country becomes.

**AND THAT HANDS THE FEDERAL REMNANT THE BEST PROBLEM IN THE GAME: A CLOCK IT DOES NOT CONTROL.**
Every province that gives up waiting is one it can never recover, and it cannot stop them giving up —
it can only **be worth coming back to, fast enough**. Nothing else in the design puts a government
under a deadline it cannot touch. **It also makes Q7 a live question rather than a flavour one**: if
the remnant opens with its authority below where it should be, it opens *already losing that race*.

**The inbox story now tells itself.** Greater Idaho *"originally planned on staying in the union but
then decided to leave altogether"* — they meant to stay; the movement asking for it was strung along;
its want flipped; and the country is gone for good. **No rule was written for Greater Idaho.**

### Ruling 24 — The remnant opens weak because its losses are written into the world, not because a number says so

**RULED 11 September 2026** — *"Agreed"* — answering **Q7**, inbox item 5: *"The people's trust in the
US government dropped dramatically and local powers started stepping up and filling in."*

**Part one: yes, it opens below where it should be — and the honest way is to seed the HISTORY, not
the number.** Authority already reads **recent losses**. Write the states the remnant actually lost
into its record when the world is made, and the low authority **falls out of the model** — then climbs
back on its own as those losses age out of the window. **No new tunable and no invented figure.**

**This is a pattern already chosen rather than a new idea.** Round 2 settled the same question for the
fighting that happened before turn one: *"the wars that happened before the game opens will leave real
marks — grudges, tiredness, armies out of position… history can simply be written into it when the
world is made."* Q7 is that decision applied to one more stock.

**THE ARGUMENT THAT MAKES IT COMPULSORY, read from the build.** Authority is also raised by **Age**
(*"turns since founding"*) and **Tenure** (*"turns this ideology has governed"*). **The remnant is the
only nation on the board that is not brand new.** Leave its losses unwritten and the country that has
just lost half of itself opens as **the best-governed nation in the game**, above sixty newborn
neighbours. That is the opening screen, and it would be backwards.

**And ruling 23 raised the stakes while this question sat in the inbox.** Provinces stop waiting one by
one and can never be won back. **So the remnant opens already losing a race it cannot stop, and how far
below it starts decides how much of the country is still reachable.** Q7 stopped being a flavour
question the moment ruling 23 landed.

**Part two: no, nothing new fills the vacuum.** *"Local powers stepping up and filling in"* is what
**movements** and **ungoverned ground** already are — a region organising against a government that
cannot hold it, and ground with nobody governing it at all. A separate mechanism would be two answers
to one question, and both would need tuning. **This round has now declined to build something four
times** (S24, S27, the second vacuum mechanism, and the coalition object ruling 6 disposed of), which
is worth counting.

### Ruling 25 — A federation is a real form, not a name: many states, a flat internal toll, an elected leader and a turn of its own

**RULED 11 September 2026**, answering **Q8** — and **overruling the recommendation put to him**, which
was that a federation should be a label on a union that keeps self-rule. Aaron, verbatim:

> "A federation should be a relation between multiple states. Alliance is two states. A federation is
> like the EU - so free trade agreement with every nation with a flat 10% toll that is automatically
> applied. 5% goes to the nation, and 5% goes to the federation, and that is the sole source of the
> federation's income. Every so often there will be elections among the federation states on who to
> elect as the leader (similiar to HRE in EU4) and that nation will have two budgets theirs and the
> federations. They will have a seperate turn for what the federation will do but those would be
> limited, it would be help out struggling nation financially, petition to allow for a declration of
> war, and accept or reject trade deals from other countries (which they would get with all the
> federation. So lets say that a country signs a trade deal with them for 20% - 5% goes to the
> federation and the remaining 15% goes to all the remaining countries. Same for the tolls."

**THE OBJECT, as ruled.**

| | |
|---|---|
| **What it is** | A relation between **multiple** states. An **alliance is two**; a federation is many. The model is the EU |
| **Inside it** | A **free trade agreement with every member**, carrying a **flat 10% toll applied automatically** — not negotiated, not per-mode, not refusable |
| **Where the 10% goes** | **5% to the nation, 5% to the federation** |
| **The federation's income** | **That 5% and nothing else** |
| **Who leads it** | A member state, **elected by the members every so often** — the Holy Roman Emperor in EU4 |
| **What leading means** | That nation runs **two budgets: its own and the federation's** |
| **The federation's turn** | Separate, and **deliberately short**: help a struggling member financially · petition to allow a declaration of war · accept or reject trade deals offered from outside |
| **Deals from outside** | Signed **with the whole federation**. At 20%: **5% to the federation, the remaining 15% to all the other members.** Tolls the same way |

**WHAT THE RULING BUYS, and why overruling me was right.** The recommendation said a federation was a
union that kept self-rule — a label on two existing buttons. **That was a category error.** A union is
**one state**; Aaron's federation is **many states that stay states**, which the game genuinely cannot
express today. Nothing in the build is a relation among *several* nations with a treasury of its own:
alliances are pairs and blocs have no substance. **This is a new object, and it is the first one this
round has asked for besides ruling 22's clock.**

**THREE CONSEQUENCES WORTH NAMING, none of them designed on purpose.**

1. **A federation's power scales with how much its members trade with each other.** Its only income is
   a slice of internal trade, so **a federation of neighbours who ignore each other is broke** and one
   whose members are economically entangled is rich. The institution grows out of the behaviour rather
   than being granted by a rule.
2. **Being elected leader is worth real money**, because the leader spends the federation's budget as
   well as its own — and the three permitted actions include *helping a struggling member*, which is
   also how a leader buys the next election. **That is a politics the players will find on their own.**
3. **The external deal splits the take three ways and the leader is not one of them.** 5% federation,
   15% to *"all the remaining countries"*, and the negotiating is done by the federation's turn. So the
   leader does the work and the members take the money, which is the EU exactly.

**WHERE IT COLLIDES WITH WHAT EXISTS — flagged, not solved.** The build's corridors are **negotiated,
per-mode, per-direction standing agreements with a notice period**, and tolls **compound on what
arrives**. A flat, automatic, unrefusable 10% between members is a different animal, and **whether it
replaces members' own agreements with each other is the first open question below.** Also worth noting
so nobody confuses them later: **10% is already the placeholder toll for routing through Canada and
Mexico.** Same number, unrelated meaning.

**SCOPE, stated plainly.** This is a **diplomacy object ruled in the politics round**. Round 3 owns
what it does at home — Q11's domestic price of joining one. **Its mechanics belong to round 5, and the
toll split lands on round 4's ground**, because what a percentage of trade is worth is the economy's to
say. Recorded here in full so nothing is lost, and handed on rather than built.

**Aaron's numbers are recorded as given: 10%, 5/5, and the 20% worked example.** They are his, not
invented by me, and they become tunables at the mechanics stage like every other figure. **"Every so
often" for the election is deferred** — the game's national elections run every 16 turns, and whether
the federation borrows that number is not decided.

**SEVEN QUESTIONS THIS OPENS, in the order they are being asked.**

1. **Does the federation's flat 10% replace members' own negotiated corridors with each other**, or sit
   on top of them?
2. **Which nation takes the 5%** — the one whose ground is crossed, or the one selling?
3. **What happens when the federation refuses a member's petition for war?** Can it declare anyway, and
   at what price?
4. **Can two members be hostile to each other at all**, or does membership forbid it?
5. **How does a nation join, and how does it leave?** Who decides?
6. **What happens to the federation if the leading nation is conquered, or leaves?**
7. **Does the external 15% split evenly among members, or by size?**

### Ruling 26 — The federation's flat toll replaces what members had with each other, and that is the price of joining

**RULED 11 September 2026** — *"Correct"* — answering the first of ruling 25's seven.

**The flat 10% REPLACES members' own arrangements with one another.** Inside a federation there are no
negotiated corridors between members: they trade at a rate nobody can refuse or revoke.

**WHAT THAT COSTS, and it is the sharpest thing in the game.** A2 built the right of passage as a
weapon: a neighbour can close a corridor with a year's notice and **burn a five-year contract to
nothing while its clock keeps running**. That threat is the only reason holding a corridor is worth
anything. **Joining a federation gives it up** — you can no longer squeeze the people you are in it
with. The sacrifice is real, it explains itself in one sentence, and it makes the federation's income
predictable: **five per cent of everything that moves inside it.**

**THE PROBLEM IT PRODUCES FOR FREE, and it is the best thing in the idea.** The nations worth most to a
federation are the ones holding the gates — and those are exactly the nations that lose most by
joining, because **their leverage is the thing membership dissolves.** From the trade data:

| Gate-holder | What it holds |
|---|---|
| **Michigan** | four Great Lakes chokepoints |
| **New York** | the Niagara and the St. Lawrence |
| **Illinois** | the Chicago canal and Cairo |
| **Louisiana** | New Orleans and the Mouth of the Mississippi |

**So a federation must pay them, elect them, or do without them — and the map decides which.** Nobody
wrote that rule; it falls out of the toll being flat.

**Ruled with it: agreements signed before joining run out their term first**, and the flat rate takes
over as each expires. Tearing up signed contracts is exactly what round 2 priced as treaty-breaking,
and a federation must not quietly do to its members what it would punish them for doing to each other.

**Note for Q11, still open:** this is the *foreign* price of membership. **The domestic price — what it
costs at home to join — is still unanswered**, and it is the last thing in the spine.

### Ruling 27 — The 5% goes to the ground that is crossed, and direct neighbours pay half

**RULED 11 September 2026** — *"Yes, I think in the architecture stage this is going to get a little
more complicated but yes"* — answering the second of ruling 25's seven.

| | |
|---|---|
| **Who takes the nation's 5%** | **The nation whose ground the goods actually cross.** That is what a toll already is here: charged by the country you pass through, on what ARRIVES rather than what set out |
| **Two members who are direct neighbours** | **Only the federation's 5% is levied.** There is no host, so there is no host's half — **direct trade inside a federation costs 5%, routed trade costs 10%** |

**Why not the seller.** A toll taken by the seller is a **sales tax**, and the map stops mattering. This
game's whole trade design is geography with prices on it; the one thing it cannot afford is a levy that
does not care where anything is.

**What it does to ruling 26's problem, and it is an improvement.** Michigan still earns from every
member's cargo crossing its lakes — at a fixed 5% rather than whatever it could have extracted. **So
joining does not zero a gate-holder's advantage; it caps it.** They keep the income and lose the
threat, which is a far better offer than "give up everything" — and it means **the federation's
internal money flows toward whoever holds the water**, which is both a reason they might join and a
reason the others might resent them.

**And a federation is cheapest between people who are already next to each other**, which is what a
customs union feels like, and which gives distant members a real stake in who else joins.

**AARON'S CAVEAT, RECORDED BECAUSE IT IS THE USEFUL PART: *"in the architecture stage this is going to
get a little more complicated."* He is right, and here is what will bite**, written down now so the
build does not discover it:

1. **Multi-hop inside the federation.** Goods crossing **two** member states — does each host take 5%,
   or is there one host share divided between them? *Leaning: one share, divided — otherwise "flat 10%"
   stops being flat and the federation starts punishing distance, which is the opposite of a customs
   union. NOT ruled.*
2. **Tolls compound on what arrives.** Two hosts at 5% each leave **90.25%**, not 90%. **"Flat" and
   "compounding" are not the same arithmetic**, and the build does the second one today.
3. **Routes that leave the federation and come back**, crossing a non-member in between, where the
   federation's rate and a negotiated corridor apply to the same journey.

**These go to the mechanics stage as named work, not as a surprise.**

### Ruling 28 — An attack on one member is a war with all of them

**RULED 11 September 2026.** Aaron: *"For now, if a war is declared on the federation all members are
at war with that nation."*

**The reading, stated because it has to be:** a federation holds **no ground of its own**, so war can
only be declared on a *member*. **Attacking any member puts the attacker at war with every member.**
That is the only reading the machinery can carry. *One line to correct if he meant something narrower.*

**WHAT IT BUYS, and it completes the object.** Ruling 26 made membership costly — you surrender the
right to squeeze your neighbours — and until now the only thing bought with it was a predictable toll.
**This is the other half: a federation is collective defence.** It is why a small state joins at all.

**AND IT CREATES THE FEDERATION'S REAL POLITICS, which nobody designed.** Put ruling 27 beside this
one:

| | Flows to |
|---|---|
| **The money** | the **gate-holders** — whoever's ground the trade crosses |
| **The protection** | the **weak** — whoever is most likely to be attacked |

**So the big trading states pay in and the small states draw out.** That is a standing grievance in
both directions, inside an institution whose leader is *elected by those same members*. The politics
of the thing is not written anywhere; it falls out of two rulings made twenty minutes apart.

**FLAGGED FOR THE TRACE, because it may be too big.** Round 2's **ruling 37** spreads hostility **one
hop through alliances**: your ally's enemies become yours. A federation of ten states, each with its
own allies, would turn **one attack on the smallest member into a continental war** in a single turn.
That is either the best event in the game or a runaway, and **it cannot be judged without tracing it**.
It goes on the list for the close of the round.

**Opened and not answered:** can **one member make a separate peace**? Round 2's peace machinery is
written per pair — both sides table terms and the defender chooses — which does not obviously survive
a war with ten defenders. **Added to the federation questions.**

### Ruling 29 — A refused petition is not a wall: declare anyway, and you are out

**RULED 11 September 2026** — *"Just the echo"*, confirming that only F22 was parked and the
recommendation stands. The third of ruling 25's seven is now answered on both sides.

**There is no hard block.** A member whose petition is refused **may declare war anyway — and it leaves
the federation the moment it does.**

**Why not a wall.** Round 2 removed **all three** rules that used to refuse an attack outright and
replaced them with prices and an electorate that gets tired. A federation that simply forbade a war
would put one of those rules straight back, and *a player stopped by a rule learns nothing*.

**The price is built entirely from rulings already made tonight**, which is why it did not need
inventing:

| On the day you declare | |
|---|---|
| **Ruling 26** | the flat rates end — every member may squeeze you again |
| **Ruling 27** | the gate-holders' 5% becomes whatever they can extract |
| **Ruling 25** | your share of every deal the federation signed ends |
| **Ruling 28** | **and you lose collective defence in the same turn you start a war** |

**That last line is the whole ruling.** You begin a war on the day you stop being protected, and the
people who were obliged to fight for you yesterday are now free to price your cargo.

**AND IT GIVES THE FEDERATION A MOTIVE THAT IS NOT MORAL.** Its only income is a slice of what members
trade with each other, and war breaks routes. **The leader refuses wars because a war shrinks the budget
the leader spends** — a reason an AI can compute and a player can predict, which is worth more than a
diplomacy score nobody can see.

**To the mechanics stage:** what becomes of a leaver's standing agreements. Ruling 26 said agreements
signed *before* joining run out their term; the reverse case — what a departing member keeps — is not
ruled and is smaller than it looks, because inside the federation there were no negotiated agreements
to keep.

### Ruling 30 — Inside a federation you are at peace with every member. Full stop

**RULED 11 September 2026.** Aaron: *"Save that for future ideas but for now if you are apart of a
federation you are peaceful to every member."* **The recommendation — hostile no, wary yes — was
narrowed**: membership forces **peace**, not merely non-hostility. The wary texture is parked as
`docs/FUTURE-IDEAS.md` **F23**.

**Why the simple version is defensible, and probably better.** Hostility and membership were already a
contradiction in the machinery: the flat rate is automatic and unrefusable while hostility forbids new
agreements, so two members at war would be forced to trade freely and forbidden to trade at all. **Aaron
removed the middle case as well**, which means membership is a single fact with no gradations — and this
project's record is that the simpler version of a rule has outlived the textured one more often than
not.

**To attack somebody you are federated with, you leave first.** That is ruling 29 with nothing added:
**declaring on a fellow member IS leaving.**

**AND IT IS WHAT MEMBERSHIP IS ACTUALLY WORTH.** Ruling 26 asked a nation to give up the right to
squeeze its neighbours. This is the return: **inside a federation, the people next to you cannot turn on
you without first paying to walk out.** For a small state beside a large one, that is the entire
proposition — and with ruling 28 it is the whole defensive case in two sentences.

**A COLLISION WITH ROUND 2, FOUND HERE AND NOT RULED.** Round 2 settled that nations contesting the same
inheritance — the five Texases, the five Californias, five Confederate claimants, three eastern capitals,
**33 pairs** — **never forgive each other**. It is the one grudge in the design that nothing clears.
**"Peaceful to every member" would clear it the moment two rivals joined the same federation.** Two
readings, and it is Aaron's:

1. **Permanent rivals cannot be in the same federation.** The rivalry survives; the federation is
   refused. *Leaning: this one — a trade club should not erase the only permanent thing in the design,
   and it makes a lovely map fact: there can be no federation across Texas until the contest is settled.*
2. **Membership overrides even permanent hostility** — joining is the one act that ends a forever-war,
   beside ruling 22's finding-G exit.

**Asked, not assumed.**

### Ruling 31 — The contest claimants carry a modifier: they can never join a union. Its BREADTH is open

**RULED 11 September 2026**, resolving ruling 30's collision. Aaron:

> "Lets say that those five have a modifier that they cannot join a union ever - this also means that we
> need to make sure that no movements seaking for unions and federations don't grow in their natural
> boundries. If they conquer areas that is ok."

**Settled.** The nations contesting the same inheritance **carry a modifier that blocks them from ever
joining a union or a federation.** The permanent rivalry survives; the membership is what is refused.
Round 2's 33 permanent quarrels are untouched, and **there can be no federation across Texas until the
contest is settled** — somebody has to win before anybody can build an institution there.

**Two readings recorded, because the sentence carries both and both are wanted.** *"If they conquer
areas that is ok"* means (a) **the modifier blocks voluntary union, never conquest** — these nations
still grow by force, which is the story: Texas is put back together by an army, not by a treaty; and
(b) **ground they conquer is outside the protected boundary**, so a union-seeking movement may grow
there. Under (b) conquest brings you people who want something you can never give them, and ruling 22
then turns them into separatists — **every route to size in this design carries its own poison**, and
this is the fourth.

**Aaron applied it to "those five" while Texas was under discussion. It is recorded as applying to all
four contests** — the five Texases, the five Californias, the five Confederate claimants and the three
eastern capitals — because the collision it fixes applies to all 33 pairs. *One line to narrow if he
meant Texas alone.*

**THE SECOND HALF IS OPEN, AND FINDING G IS WHY.** *"No movements seeking unions and federations grow
in their natural boundaries"* has a price nobody could see without measuring it, and it falls on exactly
one movement. **Asked before it is written.**

### Finding G — Suppressing union movements on contested ground deletes exactly one movement, and it is the biggest

**Measured while writing ruling 31**, against the authored homelands and the census populations.

| Unify movement | Counties | Inside contested ground | Share | People it would lose |
|---|---|---|---|---|
| **Christian Nationalism** | 255 | **227** | **89%** | **88,561,580** |
| Blue-Collar Populist | 693 | 0 | 0% | — |
| The Farmers Union | 983 | 0 | 0% | — |
| Great Lakes Free Trade | 103 | 0 | 0% | — |
| Central States Union | 215 | 0 | 0% | — |
| New England United | 68 | 0 | 0% | — |

*(Contested ground = the eleven Confederate states plus California. Texas is inside the eleven.)*

**So the rule as stated has one victim and five bystanders.** It would remove **89% of the ground and 91%
of the people** of **the largest Unify movement in the game** — Christian Nationalism, 96.9m people, whose
authored homeland is *"Southern counties over 100,000 people"*. Every other union-seeking movement is
untouched, because none of them reaches the South at all.

**AND THE MACHINERY MAY ALREADY SOLVE THE PROBLEM THE SUPPRESSION EXISTS TO PREVENT.** The worry is an
*impossible demand*: a movement asking a nation to do something the modifier forbids. But **ruling 17
gates the answer on the relationship, and a permanent rival is permanently hostile — so the demand can
never point at a rival in the first place.** Ruling 18 sends the demand to whichever neighbour scores
highest, and a hostile one scores nothing.

**What is left is narrower than the rule.** The demand could still point at an innocent neighbour that
would say yes — and the modifier would stop the nation accepting. **That is the only genuinely impossible
case, and it disappears entirely if the modifier is read as "cannot join a union CONTAINING A RIVAL"
rather than "cannot join a union ever".** Under that reading no movement needs suppressing anywhere, the
33 rivalries are still safe, and the South keeps its largest movement.

### Ruling 32 — A union is ONE state; a federation is a union OF states. They are different wants

**RULED 11 September 2026.** Aaron, correcting the framing finding G had used:

> "The difference is this: Christian Nationalism is unifying as a singular sate where a federation is a
> union of states."

**The distinction, and it was being blurred.** Finding G wrote *"union-seeking movements"* as though one
category. It is two:

| | |
|---|---|
| **Union** | **One state.** Ruling 16: the nations become a single entity and everyone is a full member of it |
| **Federation** | **A union OF states.** Ruling 25: many states that stay states, with a flat toll, an elected leader and a treasury |

**Christian Nationalism wants the first.** Its want is a singular southern state, not a club of southern
states — so the movement is asking the Confederate claimants for the one thing ruling 31's modifier
forbids them.

**WHICH MAKES RULING 11's TABLE WORK HARDER THAN IT KNEW.** That table already had both, one rung apart,
and nobody had noticed they were now two different objects:

- ***Concede*** for a Unify movement = **merge with the neighbour** — one state. **Blocked between
  rivals by ruling 31.**
- ***Concede less*** for a Unify movement = **join a bloc**, *"the form without the substance"* — which
  **ruling 25 has since turned into a real object: the federation.**

**So the cheap answer survives where the expensive one dies.** A claimant that can never become one
state with its rivals **can still federate with the neighbours it is not contesting** — and that is the
move the table hands it when the full concession is unavailable. Five moves exist precisely so that
losing one does not leave the player with nothing.

**A consequence that falls straight out, and it is checkable:** the five Confederate claimants are
rivals of *each other*, so **a southern federation can contain at most one of them**, plus any number of
non-claimants. **The South cannot be one country while the contest is live — but it can be a federation
built around whichever claimant joins first.** Nobody wrote that; it is ruling 30 and ruling 31 meeting.

### Ruling 33 — Nothing is suppressed: the federation IS the answer to a union nobody can give

**RULED 11 September 2026** — *"Your recomendation is correct"* — closing the open half of ruling 31 and
**overturning the suppression** Aaron first asked for, on his own distinction from ruling 32.

**No movement is barred from growing anywhere.** Christian Nationalism grows where it was authored to
grow — 255 counties, 96.9 million people, 89% of it on contested ground — and **finding G's 88.6 million
people stay in the game.**

**The reason it is safe is ruling 11's table.** A movement that wants a union has two answers, not one.
The full concession — *merge into a single state* — is forbidden between rivals by ruling 31. **The
cheap one — the federation — is not.** So a Confederate claimant facing Christian Nationalism is not
cornered; it has exactly one route open, and it is the one the table hands it.

**AND THE PROBLEM BECOMES AN ENGINE.** The largest union-seeking movement in the game turns into **the
thing that builds the South's federation**, because its government cannot give it a country and gives it
a club instead. Then ruling 31 bites: **at most one claimant can be in any federation**, so whoever
builds first locks the other four out of their own region. **A race, produced by three rulings that were
not designed together.**

**The count of what this round has declined to build stands at five** — S24, S27, the second vacuum
mechanism, ruling 6's coalition object, and now this suppression, which was asked for and then made
unnecessary by the design rather than argued away.

### Ruling 34 — The members vote you in, anyone may walk out, and three is the floor

**RULED 11 September 2026** — *"Agreed."* — answering the fifth of ruling 25's seven.

| | |
|---|---|
| **Admission** | **The members vote.** A candidate applies; the existing members decide |
| **Leaving** | **Free and immediate.** No notice period |
| **The floor** | **Three.** Below that it is not a federation |

**Why admission is not the leader's to give.** The leader's turn is deliberately three actions long —
fund a struggling member, permit a war, handle outside trade deals — and admission is not among them.
It should stay that way, because of **ruling 28**: letting somebody in **obliges every existing member
to go to war for them.** That is too large to be one nation's gift, even an elected one.

**And it gives the federation its politics a second time.** The leader wants members who **trade**,
because trade is the budget. The small members want members who are **safe**, because they are the ones
who will be fighting. **A rich nation with an angry neighbour is exactly the argument a federation would
have** — and both sides of it are computable from things the game already tracks.

**Why leaving is immediate.** There is nothing to unwind: ruling 26 removed negotiated agreements
between members, so walking out only stops the flat rate and the protection. **It also has to be
immediate to stay consistent with ruling 29**, where declaring war on a member *is* leaving — that
cannot wait a year.

**Three is taken from Aaron's own words, not invented:** *"A federation should be a relation between
multiple states. Alliance is two."* **A federation that falls to two members stops being one** — a quiet
and fair way for these things to die, and it needs no rule about collapse.

### Ruling 35 — The federation makes peace as one; a member that wants out leaves first

**RULED 11 September 2026** — *"Correct"* — answering the question ruling 28 opened.

**Round 2 wrote peace as a deal between two countries**: both sides table terms blind on the same turn
and the one that was attacked opens both and chooses. **That does not survive a war with ten defenders**
— so the federation is **one party to the war**, and the **leader** negotiates for all of it. Round 2's
machinery is preserved rather than rewritten: there are still two sides at the table.

**The leader already negotiates for everyone** on outside trade deals (ruling 25), so peace is the same
shape rather than a new power. **And it is what makes collective defence mean anything**: if members
could peel off one at a time, an attacker would pick off the frightened ones and ruling 28's guarantee
would be worth nothing.

**The escape hatch is required, not optional.** Without it a leader could hold its members in a war
forever — which is exactly the failure parked as **F22**. So: **leave the federation and you may sue for
peace yourself**, at the price ruling 29 and ruling 34 already set. No new machinery; the cost is one
that has now been charged three times tonight for three different acts, which is what a consistent
design looks like.

**AND IT HANDS AN ATTACKER A STRATEGY THAT IS NOT MILITARY.** Make the war expensive enough that
somebody walks out. **Every departure shrinks the guarantee for everyone still in**, and by ruling 34 a
federation that falls to two members stops being one. **So a federation can be destroyed without taking
a single Area** — by being made tiresome. Nobody designed that either.

### Ruling 36 — The outside 15% splits evenly, and that is what buys the small nations

**RULED 11 September 2026.** Aaron: *"Yes lets do that. It encourages smaller nations to join."* The
last of ruling 25's seven.

**One share each, regardless of size.** It is also closest to his original wording — *"the remaining 15%
goes to all the remaining countries"*, with no mention of weighting.

**WHY IT IS THE RIGHT HALF OF A PAIR.** Ruling 27 sends the **internal** toll to whoever's ground the
goods cross, so **the gate-holders are already rich**. If the **external** money also went by size, the
large members would take both and a small member would get nothing but protection. **The even split is
the only thing in the design that pays a small nation for being there**, and Aaron named that as the
reason.

**AND IT CLOSES A LOOP OPENED IN RULING 34.** Admission is a vote of the members. Under an even split
**every new member makes everyone else's share smaller** — so the existing members have a standing
reason to keep the club shut, while **the leader wants more traders, because trade is the budget.**
That is the enlargement argument, with a number on both sides of it, and neither side had to be
written.

**Cost accepted and named:** a large member subsidises small ones and will resent it. **That resentment
now has a cause** — it is the thing parked as **F23**, and this ruling is where it comes from.

**Default taken, one line to reverse:** if the leading nation is **conquered or leaves**, the members
hold an election **immediately** rather than the federation running leaderless. Nothing hangs on it and
it needs no new rule. *(This answers ruling 25's sixth question.)*

**All seven of ruling 25's questions are now answered**, plus the separate-peace question ruling 28
opened. The federation is designed.

### Ruling 37 — A federation trades authority for influence, and the model already computes both

**RULED 11 September 2026**, answering **Q11** — the last of round 1's inbox items and the final piece
of the federation. Aaron:

> "Agreed to all of that - it costs a little authority but increases influence. So yes you may not be as
> authoritative letting another country lead you but you are apart of a bigger block of countries"

| | |
|---|---|
| **On joining** | **Authority falls**, in proportion to how far your own people sit from the members you are joining |
| **While somebody else leads** | **a little Authority each turn**; leading it **gains** a little |
| **Throughout** | **Influence rises**, because you are part of a bigger bloc |

**The first is the existing sum pointed somewhere new.** Influence already measures *"how close the rest
of the world is to you politically, weighted by their size"*. **Aim that at the members instead of at
the world and Q11 is answered** — a federation of people unlike you is expensive to join at home,
however profitable it is abroad. **That is the Chicago argument from round 1's inbox**: a government
offered a deal that is plainly good for the treasury and cannot survive signing it.

**THE THIRD LINE IS ALREADY BUILT, AND NOBODY PLANNED IT.** Influence counts **Reach** — *"nations you
have live trade relations with"*. **Membership is flat-rate trade with every member** (ruling 26), so
**joining an eight-member federation hands you seven live trade relations in one act.** Aaron's *"you
are apart of a bigger block of countries"* is not a new term to add; **it is what the model does today**,
the moment membership is expressed as trade.

**SO THE BARGAIN HAS A NAME: a federation trades AUTHORITY for INFLUENCE.** Less the master of your own
house, more of a power in the world — and both halves are already measured, by two stocks that have
existed since M3.

**A SECOND-ORDER EFFECT WORTH FLAGGING, because it points the other way.** Ruling 17 made **weight —
size, Authority and Influence together** — the thing that makes a neighbour suspicious of your proposal.
**So joining a federation raises your influence and therefore makes your future unions harder to get
agreed.** The bloc that makes you powerful makes you harder to grow. That is either a fine irony or a
trap, and it goes on the list for the trace.

### Finding F — The two largest Unify movements share 504 counties, and both want the same thing

**Measured while pricing ruling 15.** The Farmers Union and the **Blue-Collar Populists** overlap on
**504 counties and 15.1 million people — two-thirds of the Farmers Union's entire population.** Both
want **Unify**.

| Farmers Union overlaps | Counties | People |
|---|---|---|
| **Blue-Collar Populist** | **504** | **15,104,223** |
| Central States Union | 90 | 2,544,724 |
| Great Lakes Free Trade | 30 | 1,069,101 |

**Under ruling 6 they sum against the same government**, and under ruling 15 they would both be
demanding that it go and ask its neighbours — for two different unions, on the same ground, in the
same turn. The farm belt and the rust belt are the same counties in the middle of the country, and
nobody designed that: it fell out of two authored homelands overlapping.

**It is also the largest coalition on the board.** Finding B measured the coalition candidates before
the Farmers Union had a verb, so this pair was not in that count.

### P3 — Three words for three things

*Proposed in session, unruled.* **Ideology** is the cell — universal, permanent, eight of them,
and it cannot move because it *is* a location. **Party** is an organisation inside **one nation**
that occupies a cell and contests that nation's elections; Dallas and Vermont can both hold a
Libertarian party and they are two different parties. **Movement** is unchanged and already works.
The payoff: **a party can move through the cube and an ideology cannot** — which is the *change
course* valve, priced by the geometry rather than by a tunable.

---

## 6. Findings

*What this round discovered that nobody asked it.*

### Finding A — The Farmers Union is a 983-county movement Aaron has never reviewed

**`data/parties.json` carries 32 movements. The Movement Register Aaron marked up on 7 September
carried 31 of them.** The one that has never been in front of him is **The Farmers Union** — and it is
not small.

| | |
|---|---|
| Counties | **983** — the second largest movement in the game, behind only the New Confederacy's 1,142 |
| Population | **22,638,807** |
| Ideology | `orange` (Distributist) · type `economic` · spawn chance 0.5 · growth cap 0.30 |
| Goals | *farm price supports, rural credit* |
| **Verb** | **NONE. It has never been given one**, because it was never reviewed |

**It overlaps five other movements on the ground** and none of those pairs can be judged, because a
coalition rule keyed on the verb cannot read a movement that has not got one.

**And there is a category question underneath it.** Round 1 filed the Farmers Union into politics as
inbox item 7 — *"Seven governors signed the Farmers Union"* — which describes **a diplomatic bloc that
governments join**, not a popular movement that grows in counties. **The data says movement; the story
says bloc. Nobody has said which it is.** Aaron's, and it is asked.

### Finding B — Coalitions are common, and the network has two hubs nobody placed there

Measured across the 26 live movements (the six Aaron struck excluded), 325 possible pairs:

| | |
|---|---|
| Pairs whose homelands **overlap at all** | **40** (12%) |
| Of those, pairs that **share a verb** — the coalition candidates | **22** |
| Pairs that overlap but **want different things** — rivals on the same ground | **13** |
| Pairs blocked from judgement by the Farmers Union having no verb | **5** |

**Two movements are hubs, and neither was designed to be.** The **Northern Christian Kingdom** shares
ground and a verb with **six** others; the **Native American Confederation** with **seven**. Both are
broad, thin homelands across the interior West, so they touch everything. **The two hubs of the entire
western separatist network are a Christian-nationalist movement and an indigenous-sovereignty
movement — and they overlap each other on six counties.**

### Finding C — Aaron's example is real, and there is a better one beside it

**Checked rather than accepted.** *State of Jefferson × Greater Idaho* — his example — **do overlap:
5 counties, 500,494 people, and both want to Separate.** It works.

**But Jefferson's most entangled relationship is with Cascadia, at three times the size:**

| Pair | Shared counties | People | Verbs |
|---|---|---|---|
| Jefferson × **Cascadia** | **16** | 1,187,341 | both *Separate* |
| Jefferson × California Republic | 10 | 607,941 | *Separate* vs *Reunify* — **rivals** |
| Jefferson × Greater Idaho | 5 | 500,494 | both *Separate* |
| Greater Idaho × Cascadia | 4 | 492,300 | both *Separate* |

**Jefferson and Cascadia are the textbook case of what Aaron described**, and better than the one he
named: *"100% aligned on separating"* — both Separate — while being about as far apart politically as
two movements get, Cascadia sitting at the collective-progressive end and Jefferson at the
neo-liberal-conservative one. **Round 1's finding F had already noticed this pair and read it as pure
rivalry.** Under a coalition rule they are allies first and enemies afterwards, which is the whole
idea.
