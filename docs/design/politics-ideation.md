# Politics — ideation (round 3)

**Status: OPEN. Opened 9 September 2026.** Round 1 (secession) closed 7 September with 53 rulings;
round 2 (conquest) closed 9 September with 41. This round is third per `IDEATION-PLAN.md`.

Nothing below §4 is decided. Rulings are written into §4 **as they happen**, not summarised at the
end.

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

### Q1 — Is there a seventh political alignment, and is it Libertarian?

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

### Q2 — The one table: what can a government do about each of the six verbs?

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

### Q3 — Do the four proposed new valves join the table?

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

### Q4 — What is a tier-3 stateless society?

*Inbox 1. The largest new mechanic in the story, and six regions open in it.*

Does it have a government, a treasury, an army, elections? One entity per region or many? Can it grow
into a state, and can a state fall into one?

**Recommendation: it is ground with people and output and no government.** No treasury, no elections,
no foreign policy, no army beyond the local resistance that already exists — and **many small ones
per region, not one**, because the story says Kentucky, Ohio and Michigan "fracture into 3rd tier
governments", plural. It can be annexed cheaply, which round 1 already priced. It can **grow into a
state** if a movement realises on it. **A state cannot fall into one** in this version — that is a
collapse mechanic and it belongs to a later pass.

### Q5 — The mutable movement verb: what are the legal changes, and what triggers them?

*Inbox 13, ruling 30, C120. The one piece of machinery that does not exist.*

**Recommendation: one direction only, and only toward *Separate*.** A movement that is promised and
not delivered walks toward wanting out, and never back. It fires on a clock — a count of promises
made and unkept — rather than re-checking every turn, which is also what **C133** requires. And per
**finding G**, when a reunification movement's verb flips, the permanent hostility floor its contest
created lifts with it.

### Q6 — Martial law: what is it, and for how long?

*Inbox 2.* Garrison, liberties hit, suspended elections, all three?

**Recommendation: it is the garrison you already have, declared nationally, plus the one thing the
game cannot do yet — it suspends the election.** That gives martial law real teeth without inventing
a second suppression system, and it puts the price exactly where the game already puts it: the
liberties that let you do it are the liberties you spend doing it.

### Q7 — Does the federal remnant open below its authority, and does anything fill a vacuum?

*Inbox 5.* "The people's trust in the US government dropped dramatically and local powers started
stepping up and filling in."

**Recommendation: yes to the first, no to the second.** Authority opening below its target — and
climbing back — is one seeded number and it tells the story. "Local powers filling in" is what
movements and tier-3 ground already are; giving it a second mechanism would grow two answers to one
question, which is the thing this plan exists to avoid.

### Q8 — Is a federation a form of government, or a name?

*Inbox 3, and Aaron raised it again on Acadiana: "the gulf compact could be a unified states? We can
talk about that later in governments and diplomacy."*

**Recommendation: a name, for now — and say why out loud.** Autonomy per Area already exists and
already costs the centre revenue and authority, so a literal federation is *a weak government by
construction* and the game can already build one. What is missing is a label and a reason to want it.
Aaron has flagged it twice, so if he wants it as a real form this is where it lands, and it wants
round 5 beside it.

### Q9 — Coalitions between movements, and the chaos afterwards

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

### Q11 — Is joining a bloc a domestic political act with a domestic price?

*Inbox 7.* Seven governors signed the Farmers Union — and what did it cost Illinois when Chicago
walked out?

**Recommendation: yes.** Joining a bloc costs Authority with the share of your own people whose
ideology is furthest from the bloc's — which needs no new machinery, because `affinity` already
answers it. **The bloc itself is round 5's**; only its domestic bill is this round's.

### Q12 — Is a nation's stance toward the old country a political fact it carries?

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

*Written as they happen. None yet.*

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

### P3 — Three words for three things

*Proposed in session, unruled.* **Ideology** is the cell — universal, permanent, eight of them,
and it cannot move because it *is* a location. **Party** is an organisation inside **one nation**
that occupies a cell and contests that nation's elections; Dallas and Vermont can both hold a
Libertarian party and they are two different parties. **Movement** is unchanged and already works.
The payoff: **a party can move through the cube and an ideology cannot** — which is the *change
course* valve, priced by the geometry rather than by a tunable.

---

## 6. Findings

*What this round discovered that nobody asked it. None yet.*
