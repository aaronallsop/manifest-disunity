---
title: Rulings - Military
topic: index
tags:
  - round/2
kind: index
---

# Rulings - Military

> Round 2. Closed 9 September 2026. **41 rulings.**
> Each ruling is a heading here so a wiki page can link straight to it. The wording is
> the ruling's own, quoted. The ruling itself lives in [[conquest-ideation]] - this is a signpost, not a copy.

<!-- GENERATED:index START - rewritten on every run, do not edit -->
### Military ruling 1
This is not a war game, and the arrows point the other way.

**Where:** [[conquest-ideation#6. Rulings]] · line 711 · **Pages:** [[War]] · [[Hostility]] · [[Taking ground]] · **Not built:** A frame, not a mechanic — nothing to build. Recorded as D181; quoted in full at line 31.

### Military ruling 2
A war is a standing state, and it is one of seven.

**Where:** [[conquest-ideation#6. Rulings]] · line 716 · **Pages:** [[Diplomatic states]] · [[War]] · [[Hostility]] · **Amended later.** Amended by ruling 17 (line 1132), which adds Wary. Said in as many words at line 117: 'Ruling 2 said seven states and named five live ones. Ruling 17 makes it six live states and eight in total. Everything below written before 9 September says "five states"; read it as six.' · **Not built:** No state between two nations exists in js/. Searching js/ for cease-fire, peace-treaty, hostile and wary returns one hit — a sentiment label at js/relations.js:171. Verified this session.

### Military ruling 3
a cease-fire is temporary and carries a set number of turns.

**Where:** [[conquest-ideation#6. Rulings]] · line 728 · **Pages:** [[Cease-fire]] · [[Diplomatic states]] · **SUPERSEDED.** Not superseded. What happens at the expiry it defines is rewritten by rulings 33, 34, 35 and 36; the fixed term itself then becomes load-bearing for ruling 36, because a turn you did not choose must not cost you your action. · **Not built:** No cease-fire in js/.

### Military ruling 4
what puts two nations into Hostile.

**Where:** [[conquest-ideation#6. Rulings]] · line 735 · **Pages:** [[Hostility]] · [[Alliances]] · [[Reunification contests]] · **Amended later.** Cause 5 is bounded by ruling 37 (one hop, line 2398) and reshaped by ruling 38 (line 2491). C133 at line 2515 then derives that cause 5 must be an EVENT that fires once, structurally unlike causes 1–4, which are conditions that hold the clock back while they are live. · **Not built:** No hostile state in js/, so none of the five causes can fire. Cause 3 additionally depends on two things the economy does not do — desperation biting, and a settable price — both recorded as blocking on round 4 at lines 755–762.

### Military ruling 5
a state is shared, not one-sided.

**Where:** [[conquest-ideation#6. Rulings]] · line 767 · **Pages:** [[Diplomatic states]] · [[Hostility]] · **SUPERSEDED.** Not superseded. The one-sided version is filed as F18 (line 781). It is re-used as the deciding argument in ruling 37's trace at line 2469. · **Not built:** No shared state object in js/. The directed decaying relations list that ruling 5 deliberately leaves alone IS built, and DESIGN.md §6.5 is explicit that making it symmetric 'would delete the rivalry'.

### Military ruling 6
a war ends only by agreement, and refusing is allowed.

**Where:** [[conquest-ideation#6. Rulings]] · line 789 · **Pages:** [[War]] · [[Cease-fire]] · [[Peace treaty]] · **SUPERSEDED.** Not superseded. The risk it recorded — a player held in a war they cannot leave by an opponent willing to bleed — is closed by ruling 15 at line 1116 (the stubborn opponent's own electorate removes them), and ruling 33 at line 2300 makes refusal more expressive by forcing the refuser to table terms nobody would accept. · **Not built:** No war and no agreement to end one in js/.

### Military ruling 7
every state has an exit, and three of the four are clocks.

**Where:** [[conquest-ideation#6. Rulings]] · line 802 · **Pages:** [[Diplomatic states]] · [[Hostility]] · [[Peace treaty]] · **SUPERSEDED.** Amended by ruling 17 INSIDE ruling 7's own table — line 818 reads 'Hostile | time | ~~Peace~~ Wary (ruling 17)', with two new Wary rows added. The cease-fire row is then rewritten by ruling 8, whose first half ruling 33 supersedes at line 2253. Plain strikethrough is the only marker on the Hostile row, so it is easy to miss. · **Not built:** No state machine in js/.

### Military ruling 8
a cease-fire ends in a negotiation, and its default is Hostile rather than War.

**Where:** [[conquest-ideation#6. Rulings]] · line 832 · **Pages:** [[Cease-fire]] · [[Peace treaty]] · [[Diplomatic states]] · **SUPERSEDED.** PARTLY SUPERSEDED, and the wiki must not present it whole. Line 2253: 'This supersedes the first half of ruling 8' — ruling 33 replaces the card that ASKED each side to send a treaty with a compulsory submission on a fixed turn. Ruling 34 (line 2309) then removes the counter-offer that extended the cease-fire. What survives untouched is the default: nothing signed means Hostile, not War (restated at line 2321). · **Not built:** No cease-fire in js/. The negotiation card it reuses is built for trade and transit only (DESIGN.md §6.7 'Negotiating', line 1191).

### Military ruling 9
what Hostile costs.

**Where:** [[conquest-ideation#6. Rulings]] · line 873 · **Pages:** [[Hostility]] · [[War]] · [[Movement demands]] · **Amended later.** Cost 3 — a hostile neighbour's matching movements grow faster inside you — is switched OFF ENTIRELY, not reduced, the moment a pair steps down to Wary: ruling 40, line 2564, 'Ruling 9's third cost of Hostile is switched off entirely the moment a pair steps down to Wary.' Costs 1, 2 and 4 apply in Wary at a fraction. Ruling 39 (line 2526) also replaced the four-scaled-costs shape with one acceptance multiplier. · **Not built:** None of the four costs exists in js/, because the state that would charge them does not. The corridor tolls they would raise are built (js/transit.js; transit.noticeTurns = 4 at js/tunables.js:814).

### Military ruling 10
ground changes hands at the settlement, not turn by turn.

**Where:** [[conquest-ideation#THE SPINE, continued — how a war is actually fought]] · line 942 · **Pages:** [[War]] · [[Taking ground]] · [[Occupation]] · **Amended later.** Refined by ruling 13 at line 1027: 'This refines ruling 10 rather than contradicting it, and the refinement is the good part.' What changes at the settlement is not the BORDER but the TENURE — the map moves when you win the roll, and the treaty launders occupied-war into occupied. Ruling 10's recorded cost, that a war with no visible front is hard to read, is answered by C79 at line 1043: the front is the pale part of your own country. · **Not built:** No war, no front and no settlement in js/.

### Military ruling 11
war must be simple at the level the player touches it.

**Where:** [[conquest-ideation#THE SPINE, continued — how a war is actually fought]] · line 952 · **Pages:** [[War]] · [[Taking ground]] · **Not built:** Consistent with what is built rather than missing from it. js/military.js opens 'NO UNIT COUNTERS, no stacks, no map tokens' and js/military.js:42 fixes the allocation at three roles. This ruling is a constraint on every other ruling in the round, not a thing to build.

### Military ruling 12
how a fight resolves.

**Where:** [[conquest-ideation#THE SPINE, continued — how a war is actually fought]] · line 959 · **Pages:** [[Taking ground]] · [[War]] · **SUPERSEDED.** Not superseded. The question it left open — what losing costs — is answered by ruling 14 (line 1059) and extended by ruling 23 (line 1652). · **Not built:** Partial, and the gap is the round's centre. The Field-vs-Border comparison exists (js/military.js:234–237) but the annex move rolls CivilWar.resolve (js/moves.js:1180), not a fight — so the defender is consulted only as a multiplier on the attacker's own civil-war score. §1a at line 82 states this and calls it 'the thing that is actually missing'. The structural change the ruling needs is that it must fire on EVERY attack.

### Military ruling 13
ground you take is yours immediately, but it is held under a flag, and there are three flags.

**Where:** [[conquest-ideation#THE SPINE, continued — how held ground is held]] · line 1006 · **Pages:** [[Occupation]] · [[Peace treaty]] · [[Hostility]] · **Amended later.** Extended by ruling 26 (line 1818), which adds the fourth rung the three flags stopped short of — occupied ground eventually becomes ordinary ground. C81 at line 1053 records that ruling 13 alone left held ground 'still carrying some negative outcomes', permanently. · **Not built:** No occupied-war / occupied / occupied-movement flag exists anywhere in js/ — grepped this session, zero hits. The transit prohibition it invents would be a fourth reason in a broken-route explanation list that is already built (DESIGN.md §6.7). The 50% threshold it names is an invented placeholder and the document flags that it sits above the 0.40 secession threshold, so every occupied-movement Area is ground that was coming to you anyway (C80, line 1049).

### Military ruling 14
an attack has two outcomes, and failure costs what you already spent.

**Where:** [[conquest-ideation#THE SPINE, continued — how held ground is held]] · line 1059 · **Pages:** [[Taking ground]] · [[War]] · **SUPERSEDED.** Refined by ruling 23 (line 1652), stated at line 1670: 'It refines ruling 14 and the refinement is worth stating. Under ruling 23 a failed attack is no longer nothing.' A 30% attack is not 70% wasted — it is 30% conquest and 100% denial. C78's proposed readiness penalty is superseded (§8 q11, line 2860). · **Not built:** The premise IS built and verified: the price of an attack is debited before the roll, per Area and per head (annex.costPerArea = $250M at js/tunables.js:963, annex.costPopScale = $400 at :968). The two-outcome fight it prices is not.

### Military ruling 15
what goes in a peace treaty, and what refusing one costs.

**Where:** [[conquest-ideation#THE SPINE, continued — how held ground is held]] · line 1081 · **Pages:** [[Peace treaty]] · [[Cease-fire]] · [[Occupation]] · **Amended later.** The 1.25× basis, flagged ambiguous at line 1093 ('needs one word settling and it is a number, so it is flagged rather than guessed'), is settled by ruling 22 (line 1569) — neither the winner's costs nor the loser's, but the PROPOSER's. The four levers and the 'refusing is not free' half stand unchanged. · **Not built:** No peace treaty object in js/. The two mechanisms 'bad things happening' relies on ARE built: crises trigger over the stocks, and elections read war weariness directly (js/power.js:576, js/elections.js).

### Military ruling 16
a movement makes DEMANDS, they are shown on a screen of their own, and every demand gets one of three answers.

**Where:** [[conquest-ideation#I. Expand and Reconquer — the movements that want you to march]] · line 485 · **Pages:** [[Movement demands]] · [[War]] · **Amended later.** Completed by ruling 30 (line 2084), which says what declining and never-delivering actually do — the thing ruling 16 asserted ('never implementing makes them more angry than declining would have') without saying in what currency. · **Not built:** Nothing of it exists. js/movements.js has no demand, no answer and no screen; a movement's goals[] are authored flavour text (build/build_parties.py:451). This is the ruling that closes round 1's finding D and it is entirely unbuilt.

### Military ruling 17
a grudge fades on time, there is a sixth state between Hostile and Peace, and the reunification rivalries never fade at all.

**Where:** [[conquest-ideation#THE SPINE, continued — how a grudge ends]] · line 1132 · **Pages:** [[Diplomatic states]] · [[Hostility]] · [[Reunification contests]] · **SUPERSEDED.** Not superseded — it is the superseding ruling, and it amends rulings 2 and 7 in place. What Wary COSTS is then set by ruling 39 (line 2526, one acceptance multiplier rather than four scaled costs) and ruling 40 (line 2561, the neighbour's movements do not grow inside you at all). Part (d)'s permanent floor is given its claimant lists by ruling 32. · **Not built:** No clock, no Wary and no floor in js/. NAMING: Aaron wrote 'weary' and the document renames it Wary at line 1176, because war weariness already owns that word as one of the five power stocks (js/power.js:576). That rename is one word and has not been put back to him.

### Military ruling 18
Hostile honours what is signed and permits nothing new.

**Where:** [[conquest-ideation#⚠ FINDING — Austin's death is accepted, but the reason Aaron gave is not the reason it happens]] · line 1293 · **Pages:** [[Hostility]] · [[War]] · [[Diplomatic states]] · **SUPERSEDED.** Not superseded. Completed by ruling 39 (line 2526), which fills the missing middle rung — Hostile is a door that is shut, Wary a door that sticks, Peace a door that opens. The trace at line 2718 records that ruling 18's protection is empty AFTER a war, because a war has already broken every deal, so its real work is in quarrels that never become wars. · **Not built:** No hostile state to gate signing. The trade deal it protects is built with 2/4/8/20-turn terms (A1), which is what gives ruling 18 its free second meaning: a long deal is insurance against a relationship going bad (C94, line 1319).

### Military ruling 19
Austin is the legitimate Texas, and the other four are rebels.

**Where:** [[conquest-ideation#⚠ FINDING — the corridor machinery already builds Aaron's rule, and it is crueller than the rule]] · line 1375 · **Pages:** [[Reunification contests]] · [[Hostility]] · [[Diplomatic states]] · **SUPERSEDED.** Not superseded. Recorded at line 1418 as a DELIBERATE DEPARTURE from the scenario's stated principle that 'the relations board starts quiet and the player watches it sour' — flagged expressly so nobody later reads the departure as a bug. Whether conquering Austin ends the veto or makes the rebels pariahs for good is C100, open and handed to round 5. · **Not built:** content/scenario-shattered.json seeds no recognition at all and its relations note says the board starts quiet — verified this session. Recognition itself IS built and directed (js/recognition.js, DESIGN.md §6.5), including the measured fact this ruling turns on: the parent state's signature is worth more than every other route to recognition combined.

### Military ruling 20
a corridor behaves under hostility exactly as a trade deal does.

**Where:** [[conquest-ideation#⚠ FINDING — the corridor machinery already builds Aaron's rule, and it is crueller than the rule]] · line 1437 · **Pages:** [[Hostility]] · [[Reunification contests]] · **SUPERSEDED.** Not superseded, but MADE ON A PREMISE THE DOCUMENT THEN PROVES WRONG — line 1443: 'BUT THE RULING WAS MADE ON A PREMISE THAT IS WRONG, AND THE CONSEQUENCE FLIPS. Asked, not assumed.' Aaron believed corridors were standing tolls with no term; they have the same terms a trade deal has, so blocking renewal kills Austin's routes on a clock that nobody chooses and nobody pays a reputation cost for. The wiki must carry the correction alongside the ruling. · **Not built:** No hostile state to gate a grant. The corridor object IS built with a four-turn notice period and a doubled standing penalty for revoking (js/tunables.js:814 transit.noticeTurns = 4, :819 transit.renegeWeight). Verified this session.

### Military ruling 21
hostility is resolved by time and by diplomacy, never by a treaty.

**Where:** [[conquest-ideation#⚠ FINDING — two hostile nations now have no way to agree on anything at all]] · line 1504 · **Pages:** [[Hostility]] · [[Peace treaty]] · [[Reunification contests]] · **SUPERSEDED.** Not superseded. It REJECTS the proposal in the finding immediately above it (line 1476) that a peace treaty be reachable from Hostile. The consequence is recorded and accepted: two hostile nations have no instrument but war, and the diplomatic action that speeds a thaw is handed to round 5 and marked BLOCKING in §4 at line 680 — without it, the thirty-three opening pairs have no move available at all. · **Not built:** No hostile state and no thaw action in js/. The ledger a thaw would write to IS built and richer than the document assumed: js/relations.js holds sixteen memory kinds, five of them good — granted, traded, recognised, treatied, aided (C99, line 1524).

### Military ruling 22
the repayment cap is measured against the war costs of whoever sends the treaty.

**Where:** [[conquest-ideation#⚠ FINDING — Austin's asset is a veto, not a currency, and that is a better game than selling it]] · line 1569 · **Pages:** [[Peace treaty]] · [[Cease-fire]] · [[Taking ground]] · **Amended later.** The rule stands; the machinery around it changed. C101 — 'a counter-offer haggles within the basis; it does not re-base it' — is struck MOOT by ruling 34 at line 1603 (strikethrough plus 'MOOT FROM RULING 34'), because there is no counter-offer any more. What 'the cost of a war' MEANS is deferred to round 4 by ruling 23 and marked blocking, so this lever cannot be priced yet. · **Not built:** No treaty and no war-cost accounting in js/. The finding at line 1620 shows the rule breaking on Aaron's own example: the only war cost the game currently debits is the price of an attack, so a pure defender like Idaho has spent nothing and can claim nothing.

### Military ruling 23
the cost of a war belongs to the economy of war; and an Area under attack produces nothing that turn, whether or not it falls.

**Where:** [[conquest-ideation#⚠ FINDING — traced against Aaron's own example, a defender can claim nothing]] · line 1652 · **Pages:** [[Taking ground]] · [[Peace treaty]] · [[War]] · **SUPERSEDED.** Not superseded. It refines ruling 14 (line 1670) and it raises C102/C104, the raid risk: with no cooldown left after ruling 24, attacking to deny rather than to win is available every turn for ever, and whether the attack price exceeds a turn of the target's output has never been measured (line 1783). · **Not built:** Not built. The mask it needs sits on data that exists: output is held per Area as a six-element sector vector across 1,688 Areas (data/economy.json), so switching an Area off denies a NAMED KIND of production — food, or the thing that moves everything else — rather than generic income. That is the round's own verification at line 1690; I did not re-measure the 1,688 figure this session.

### Military ruling 24
one Area per attack, and the per-turn cap and the cooldown both go.

**Where:** [[conquest-ideation#⚠ FINDING — the machinery exists, it is sector-aware, and that makes the mechanic bigger than "lost income"]] · line 1723 · **Pages:** [[Taking ground]] · [[War]] · **SUPERSEDED.** Not superseded. The finding at line 1736 records that it makes sustained conquest FASTER, not slower — 0.6 Areas a turn today against 1.0 under the ruling — because one action a turn had already capped attacking at one strike and the cooldown was the real throttle. · **Not built:** THE CODE DISAGREES, TODAY. js/tunables.js still carries annex.budgetAreas = 3 (line 958) and annex.cooldownTurns = 4 (line 983), and js/moves.js reads both (lines 1043 and 133). Verified this session. Nothing has been changed — a design round writes documents only.

### Military ruling 25
the four-times-your-size shield is removed.

**Where:** [[conquest-ideation#⚠ FINDING — this makes conquest 67% FASTER, not slower, and the reason matters]] · line 1793 · **Pages:** [[Taking ground]] · [[War]] · **SUPERSEDED.** Not superseded. Its accepted cost is recorded at line 1814: AI nations will now sometimes throw themselves at giants and lose, and the stated fix if that reads as foolish in the alpha is to make the AI weigh the percentage harder, NOT to put the wall back. · **Not built:** THE CODE DISAGREES, TODAY. js/tunables.js:973 annex.strongNeighbourFactor = 4, read by js/moves.js at lines 1013 and 1060, and its own doc reads 'A neighbour this many times your size on BOTH population and GDP cannot be attacked.' Verified this session.

### Military ruling 26
occupied ground eventually becomes your country, and how fast depends on whether life got better.

**Where:** [[conquest-ideation#⚠ FINDING — this makes conquest 67% FASTER, not slower, and the reason matters]] · line 1818 · **Pages:** [[Occupation]] · [[Taking ground]] · [[Reunification contests]] · **SUPERSEDED.** Not superseded. It closes C26 and C81 and gives the flag ladder its fourth rung. C109's live-comparison default — conquered people compare themselves to their old country AS IT STANDS NOW, and the comparison drops out if that country is gone — was confirmed by Aaron in ruling 41. · **Not built:** Not built, and it is FINDING A. js/game.js:1249 isHomeGround is a Set stamped at birth and calls itself 'THE one definition of home ground, and the only thing anything should ask'. Ruling 26 requires occupied ground to BECOME home ground, which is a one-line change to the single source of truth and must be made deliberately rather than discovered. Quality of Life, the modifier it turns on, is built, and its turn-0 spread of 0.55–0.98 is the widest of the four stocks (DESIGN.md, cited at line 1837; not re-measured this session).

### Military ruling 27
Allied is taken now and kept thin; Subject is deferred; and the soldiers you lend are a lever you set.

**Where:** [[conquest-ideation#⚠ FINDING — this makes conquest 67% FASTER, not slower, and the reason matters]] · line 1892 · **Pages:** [[Alliances]] · [[Diplomatic states]] · [[Hostility]] · **Amended later.** Bounded afterwards by ruling 37 (line 2398), which limits inherited hostility to exactly one hop, and by ruling 38 (line 2491), which makes what you inherit the fastest-cooling hostility in the game. Ruling 28 (line 1965) then gives Allied a second job nobody designed — insulation from your own bad faith. · **Not built:** No alliance in js/, and the lever has nowhere to live: js/military.js:42 fixes the allocation at three roles — garrison, border, field — with no Ally slice. Verified this session. js/coalitions.js builds the opposite object, nations lining up against a target. Subject is deferred to round 5 and the reason is recorded at line 1929: every nation gets one action a turn, and a subject that keeps its action is not subject while one that loses it leaves a player with no game to play.

### Military ruling 28
breaking a peace treaty turns every neighbour but your allies hostile, at once.

**Where:** [[conquest-ideation#⚠ FINDING — this makes conquest 67% FASTER, not slower, and the reason matters]] · line 1947 · **Pages:** [[Peace treaty]] · [[Alliances]] · [[Hostility]] · **SUPERSEDED.** Not superseded. The finding at line 1986 records that the punishment SATURATES exactly where betrayal is most tempting — the five Texans are already permanently Hostile, so the state cannot get worse — and recommends that the `reneged` ledger entry, which has no floor, carries the cost instead. That is recommended and traced, NOT ruled. C113 (any of the four ways to break a treaty costs the same) was confirmed by Aaron in ruling 41. · **Not built:** No peace treaty to break. The `reneged` entry the proposed fix would use IS built and is deliberately the heavy one (js/relations.js KINDS). The 4.9-neighbours-on-average figure the ruling is sized against is measured from data/adjacency.json at STATE level and the document explicitly flags it as a proxy, because the board is 61 nations cut from 51 states — I did not re-measure it this session.

### Military ruling 29
a nation may declare war straight from Peace, and the reason is the whole ladder.

**Where:** [[conquest-ideation#⚠ FINDING — the punishment saturates precisely where betrayal is most tempting]] · line 2019 · **Pages:** [[War]] · [[Diplomatic states]] · [[Peace treaty]] · **Not built:** No declaration in js/. The thing it charges you IS built: standing lost to conquest scales with how much standing you had (js/tunables.js:250 — 'a superpower annexing a neighbour pays more in reputation than an unknown does'), which is what makes C115's claim true, that Hostile is worth manoeuvring into.

### Military ruling 30
declining makes a movement grow; stringing it along makes it want something else.

**Where:** [[conquest-ideation#Four defaults taken rather than asked, 9 September]] · line 2084 · **Pages:** [[Movement demands]] · [[Reunification contests]] · **SUPERSEDED.** Not superseded. Finding G at line 2793 records that it built, by accident, the only non-violent exit from a permanent reunification floor: a government that strings its own irredentists along until they give up watches them change verb toward Separate, and a nation whose people have stopped wanting the old country back has stopped contesting the inheritance. · **Not built:** THE ONE PIECE OF NEW MACHINERY THE ROUND ASKS FOR. C120 at line 2103: nothing in the built game ever changes a movement's verb. The faster-growth half is cheap — growthRate already exists as a per-movement multiplier in js/movements.js — the verb change is not. Handed to round 3.

### Military ruling 31
three kinds of base, on the map as geography; and no nuclear weapons.

**Where:** [[conquest-ideation#Four defaults taken rather than asked, 9 September]] · line 2113 · **Pages:** [[Military bases]] · [[Movement demands]] · [[Occupation]] · **SUPERSEDED.** Not superseded. NO NUCLEAR WEAPONS is decided, not deferred, and the reason is recorded at line 2121 expressly so it is never reopened as an oversight. · **Not built:** Nothing exists — not the bases and not the data. Searching data/, content/ and build/ for Pearl Harbor, NORAD, Cheyenne, Pensacola, Norfolk, Bremerton and Groton returns only city names in build/build_transport.py and content/capitals.json. Verified this session. The bake is specified at line 2155 and carries one open mapping question flagged for before the bake: Marine Corps → Army, Coast Guard → Naval, Space Force → Air Force.

### Military ruling 32
five nations claim California, and Cascadia is not one of them.

**Where:** [[conquest-ideation#The close's own findings, ruled after it]] · line 2179 · **Pages:** [[Reunification contests]] · [[Diplomatic states]] · **SUPERSEDED.** Not superseded, but it REPLACES a number — line 2192: 'This replaces a number that had been carried since Sunday as "a count and not a list".' The 33 permanent quarrels are now built from named claimants rather than asserted. It also records that the reason printed on the Control Board card was FALSE: Cascadia does not reach into Oregon or Washington, all nine of its Areas are ex-Californian, and three true reasons are given instead. · **Not built:** content/scenario-shattered.json holds no claimant field and no contest — only the dissolve and cession lists. Verified this session. C124 (line 2205) adds a case the machinery cannot express at all: a contest whose strongest claimant would be CREATED IN PLAY by Oregon and Washington uniting.

### Military ruling 33
both sides table a treaty before the cease-fire ends, and the defender chooses first.

**Where:** [[conquest-ideation#The close's own findings, ruled after it]] · line 2243 · **Pages:** [[Cease-fire]] · [[Peace treaty]] · [[War]] · **SUPERSEDED.** Not superseded — it is the superseding ruling: line 2253, 'This supersedes the first half of ruling 8.' It is then completed by ruling 34 (the defender's own treaty is the counter, no second submission), ruling 35 (both written blind) and ruling 36 (tabling is free). C128 — the attacker stays the attacker for the life of the war, through any number of cease-fires, even if it is losing — was confirmed by Aaron in ruling 41. · **Not built:** No cease-fire and no treaty in js/.

### Military ruling 34
the defender's own tabled treaty is the counter, and there is exactly one round of offers.

**Where:** [[conquest-ideation#The close's own findings, ruled after it]] · line 2309 · **Pages:** [[Cease-fire]] · [[Peace treaty]] · **SUPERSEDED.** Not superseded — it is the superseding ruling, and it RETIRES TWO RULES written the day before: C101 ('~~A counter-offer haggles within the basis~~ MOOT FROM RULING 34', line 1603) and C118 ('~~Each cease-fire extension is shorter than the last.~~ SUPERSEDED BY RULING 34', line 2067). Both are struck through in place; a reader skimming for the word 'superseded' would miss C101. Its accepted cost is recorded: the end of a war is now brisk, a sealed auction rather than a negotiation. · **Not built:** No cease-fire in js/. NOTE FOR THE WIKI: the closing trace of scenario 3 at line 2706 still narrates the OLD shape — 'a counter-offer extends it, each extension shorter than the last (C118)' — because it was written before ruling 34. That passage must not be quoted as live.

### Military ruling 35
the two treaties are written blind.

**Where:** [[conquest-ideation#The close's own findings, ruled after it]] · line 2341 · **Pages:** [[Cease-fire]] · [[Peace treaty]] · **SUPERSEDED.** Not superseded. Its accepted cost is recorded at line 2352: a war can continue on a misjudgement, and it is the first place in the round where a player is punished for misreading another nation rather than for miscounting. C130 (line 2357) is open and owned by the design stage — the design document must say WHICH standing facts a player can see at the moment they write, or a sealed bid is a coin toss. · **Not built:** No cease-fire in js/.

### Military ruling 36
tabling a treaty is free, and C116 is amended.

**Where:** [[conquest-ideation#The close's own findings, ruled after it]] · line 2370 · **Pages:** [[Cease-fire]] · [[War]] · [[Peace treaty]] · **SUPERSEDED.** Not superseded — it is the superseding ruling: it AMENDS C116, the default taken a day earlier that proposing a treaty costs your action. The amended table is printed at line 2380. Its accepted cost is recorded: ending a war is now slightly cheaper than starting one, and that is judged the right way round. · **Not built:** No cease-fire in js/. The principle it protects is built and load-bearing elsewhere: DESIGN.md records that answering a full-screen card does not use your turn.

### Military ruling 37
inherited hostility travels exactly one hop.

**Where:** [[conquest-ideation#The close's own findings, ruled after it]] · line 2398 · **Pages:** [[Alliances]] · [[Hostility]] · [[Diplomatic states]] · **SUPERSEDED.** Not superseded. SETTLED INTERNALLY at line 2447 — Aaron's own traced example was miscounted by one pair, reading (a) was recommended, and he agreed ('Agree with your recomendation'), so Nevada and Idaho ARE Hostile and his example needs one word. That correction is recorded as part of ruling 37 rather than as a ruling of its own, which makes it easy to miss. C131, the decay version, is banked and explicitly NOT taken (line 2417). · **Not built:** No alliances and no inheritance in js/.

### Military ruling 38
an inherited quarrel slows the clock but never stops it, and it is the fastest-cooling hostility in the game.

**Where:** [[conquest-ideation#Ruling 37 traced — Aaron's own example, and the pair it gets wrong]] · line 2491 · **Pages:** [[Alliances]] · [[Hostility]] · **SUPERSEDED.** Not superseded. C133 at line 2515 derives a consequence the ruling is impossible without, flagged as one line to correct: ruling 4's fifth cause must FIRE ONCE as an event rather than re-check itself each turn, or a thawed pair would snap back to Hostile the moment it reached Peace — the exact blink Wary was invented to prevent. That makes cause 5 structurally unlike causes 1–4 and a design document has to carry the distinction. · **Not built:** No alliances and no cooling clock in js/.

### Military ruling 39
what Wary costs is a percentage multiplier on acceptance, and the figure belongs to the design stage.

**Where:** [[conquest-ideation#Ruling 37 traced — Aaron's own example, and the pair it gets wrong]] · line 2526 · **Pages:** [[Hostility]] · [[Diplomatic states]] · **SUPERSEDED.** Not superseded — it is the superseding ruling: line 2527 says 'Partly supersedes C90', replacing four scaled costs with one acceptance multiplier. C90's remaining load-bearing row is then closed by ruling 40. C134 (line 2551) records the consequence: Wary is a SOFT cost, invisible to a nation that wants nothing, so it cannot be the thing that pressures a passive player — and nothing else in this round is either. · **Not built:** No Wary state in js/. The magnitude is deliberately NOT invented — it is recorded as 'still to be asked about' with no placeholder, per the project's rule that every quantity says where its number comes from.

### Military ruling 40
a Wary neighbour's movements do NOT grow faster inside you. Off, not reduced.

**Where:** [[conquest-ideation#Ruling 37 traced — Aaron's own example, and the pair it gets wrong]] · line 2561 · **Pages:** [[Hostility]] · [[Movement demands]] · [[Diplomatic states]] · **SUPERSEDED.** Not superseded — it is the superseding ruling: it switches ruling 9's third cost off entirely at Wary and closes C90 in full. Its accepted cost is recorded at line 2573: a cooled quarrel leaves nothing behind at home, which is a clean break for something that was recently a real enmity. · **Not built:** No Wary state in js/. The mechanism it switches off does not exist either — movement growth today is geometric toward a per-movement growthCap with a growthRate multiplier (js/movements.js) and has no diplomatic term at all.

### Military ruling 41
the seven outstanding defaults are confirmed as written.

**Where:** [[conquest-ideation#Ruling 37 traced — Aaron's own example, and the pair it gets wrong]] · line 2590 · **Pages:** [[Occupation]] · [[Taking ground]] · [[Peace treaty]] · [[Movement demands]] · **Not built:** A confirmation, not a mechanic — Aaron's 'all fine' to seven defaults a session had taken without asking. The wiki should carry each one on the page it belongs to: C82 the civil-war roll and the attack roll stay separate and stack (Taking ground) · C92 the permanent floor freezes the floor and not the relationship (Diplomatic states / Reunification contests) · C109 conquered people compare themselves to their old country as it stands now (Occupation) · C113 any of the four ways to break a treaty costs the same (Peace treaty) · C117 answering a movement is free and obeying costs what the act costs (Movement demands) · C119 occupied-movement applies from the day the ground is taken while the transit ban waits for the war to end (Occupation) · C128 the attacker stays the attacker for the life of the war (Cease-fire).
<!-- GENERATED:index END -->

*Generated by `build/build_wiki.py` from commit `7d167a6` (2026-09-11).*
