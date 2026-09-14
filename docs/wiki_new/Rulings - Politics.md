---
title: Rulings - Politics
topic: index
tags:
  - round/3
kind: index
---

# Rulings - Politics

> Round 3. Closed 11 September 2026. **42 rulings.**
> Each ruling is a heading here so a wiki page can link straight to it. The wording is
> the ruling's own, quoted. The ruling itself lives in [[politics-ideation]] - this is a signpost, not a copy.

<!-- GENERATED:index START - rewritten on every run, do not edit -->
### Politics ruling 1
Ruling 1 — three axes, and the roster named for real parties. Recorded at P2 and in DECISIONS.md D185. Superseded in its roster by ruling 2.

**Where:** [[politics-ideation#4. Rulings]] · line 344 · **Pages:** [[The political board]] · [[Movements]] · **SUPERSEDED.** Ruling 2, in its ROSTER only — stated three times: 'Superseded in its roster by ruling 2' (line 345), 'This supersedes ruling 1's roster of eight' (line 850), and 'Ruling 2, 9 September, superseding ruling 1's roster' (line 855). The three axes and the real-party naming principle survive intact. · **Not built:** content/ideologies.json still holds six ideologies on two axes (economic, social), measured this run — not three axes and not eight corners.

### Politics ruling 2
Ruling 2 — ten positions, authoritarians at both outer ends, the drift partition, and the two conditions. Recorded at P5 and P6, and in D186.

**Where:** [[politics-ideation#4. Rulings]] · line 347 · **Pages:** [[The political board]] · [[Release valves]] · **Not built:** Not built. The falling into Despotism or Stateless is deferred by Aaron to docs/FUTURE-IDEAS.md F19 (D187) and no placeholder was invented; the board itself is authoring that has not been done.

### Politics ruling 3
Ruling 3 — What a stateless society is, and what it costs to trade with one

**Where:** [[politics-ideation#Ruling 3 — What a stateless society is, and what it costs to trade with one]] · line 351 · **Pages:** [[Stateless society]] · [[Movements]] · **SUPERSEDED.** Not superseded, but one claim inside it is corrected: it marked round 1's finding B closed, which Finding D calls 'true and insufficient' (line 1081), and ruling 13 closes the other half properly. · **Not built:** The ground itself does not exist — every Area belongs to a nation. Both figures match built tunables measured this run: transit.foreignCorridorToll = 0.10 and transit.rateMin = 0.05 in js/tunables.js.

### Politics ruling 4
Ruling 4 — Stranded ground goes stateless, and a movement can rise from it

**Where:** [[politics-ideation#Ruling 4 — Stranded ground goes stateless, and a movement can rise from it]] · line 410 · **Pages:** [[Stateless society]] · [[Movements]] · **SUPERSEDED.** SUPERSEDED IN FULL by ruling 5 — 'superseding ruling 4's threshold AND its outcome' (line 472), and struck through as '~~Ruling 4: severed sections totalling more than 2,000,000 become a stateless society.~~ SUPERSEDED.' (lines 480-481). Its surviving half — that a movement can rise out of stateless ground — is carried forward by ruling 13. DO NOT PRESENT THE 2,000,000 THRESHOLD AS LIVE. · **Not built:** Nothing built, and the rule it states is dead.

### Politics ruling 5
Ruling 5 — Enveloped territory: over 500,000 it is a nation, under it a stateless society

**Where:** [[politics-ideation#Ruling 5 — Enveloped territory: over 500,000 it is a nation, under it a stateless society]] · line 470 · **Pages:** [[Stateless society]] · [[The political board]] · **Not built:** Nothing built. Two population bars would now exist and only one does: nation.minPop = 250000 is in js/tunables.js this run; the 500,000 envelopment bar is not.

### Politics ruling 6
Ruling 6 — A coalition is a shared enemy, and it is measured as total movement share

**Where:** [[politics-ideation#Ruling 6 — A coalition is a shared enemy, and it is measured as total movement share]] · line 524 · **Pages:** [[Civil war]] · [[Movements]] · [[Stateless society]] · **Not built:** THE CODE DISAGREES, and the ruling says so: js/game.js line 1596 reads 'for (const m in c.mov) { const s = c.mov[m] / pop; if (s > worst) worst = s; }' — it takes the strongest single movement's share, not the sum. Verified in the file this run. Note also js/coalitions.js is a different thing entirely: nations ganging up on a threatening nation, not movements.

### Politics ruling 7
Ruling 7 — Movement members join the militia, not the army

**Where:** [[politics-ideation#Ruling 7 — Movement members join the militia, not the army]] · line 576 · **Pages:** [[Movements]] · [[Civil war]] · **Not built:** Not built: js/military.js line 84 computes manpower = d.pop * t.get('mil.manpowerShare') with no movement term of any kind, and mil.manpowerShare = 0.004 in js/tunables.js. Verified this run.

### Politics ruling 8
Ruling 8 — Past 40% the countdown to civil war begins

**Where:** [[politics-ideation#Ruling 8 — Past 40% the countdown to civil war begins]] · line 608 · **Pages:** [[Civil war]] · [[Movement demands]] · **Not built:** Not built: js/civilwar.js's own header names its three triggers and all three are annexation-based — the annexation flips the plurality, the annexed GDP exceeds the nation's, the annexed population exceeds the nation's. There is no internal path to civil war. Verified this run.

### Politics ruling 9
Ruling 9 — A government can give up and join the movement

**Where:** [[politics-ideation#Ruling 9 — A government can give up and join the movement]] · line 648 · **Pages:** [[Release valves]] · [[Movements]] · **Not built:** Not built, and it is not the same as the built 'going with the breakaway' (Game.setPlayer, which moves the player's seat). No threshold was named by Aaron and none was invented.

### Politics ruling 10
Ruling 10 — The two forties are two dials with two jobs, and the values go to the architect

**Where:** [[politics-ideation#Ruling 10 — The two forties are two dials with two jobs, and the values go to the architect]] · line 675 · **Pages:** [[Civil war]] · [[Movements]] · **Not built:** Half built: the per-county dial exists as secession.countyThreshold = 0.40 in js/tunables.js (verified this run). The per-nation dial the ruling asks for as a separate tunable does not exist.

### Politics ruling 11
Ruling 11 — The one table: five moves, six verbs, and the built valves were the answer all along

**Where:** [[politics-ideation#Ruling 11 — The one table: five moves, six verbs, and the built valves were the answer all along]] · line 929 · **Pages:** [[Release valves]] · [[Movement demands]] · [[Unions]] · **Not built:** Partly built: the four valves exist (DESIGN.md §7.4, js/moves.js). The six verbs do not — data/parties.json carries no verb field on any of its 32 movements, measured this run, so the table has no rows to key on.

### Politics ruling 11a
Ruling 11a — The "remove the want" column belongs to the ADJECTIVE, and there are five of them

**Where:** [[politics-ideation#Ruling 11a — The "remove the want" column belongs to the ADJECTIVE, and there are five of them]] · line 986 · **Pages:** [[Release valves]] · [[Movements]] · **SUPERSEDED.** Not superseded. Its own tail question is struck through and answered: '~~Still open: whether answering a movement costs the turn's action…~~ ANSWERED by ruling 12' (lines 1036-1038). · **Not built:** Not built: data/parties.json carries eight 'type' values (autonomist, economic, ideological, indigenous, irredentist, reunification, separatist, theocratic-separatist), measured this run — the ruling collapses these to five, and that merge has not been made in the data.

### Politics ruling 12
Ruling 12 — Demands are free, mandatory, and answered before the turn can move

**Where:** [[politics-ideation#Ruling 12 — Demands are free, mandatory, and answered before the turn can move]] · line 1040 · **Pages:** [[Movement demands]] · [[The turn]] · **Not built:** Not built, and the ruling measures it itself: there is no petition or demand machinery in the game. Confirmed this run — 'petition' appears nowhere in js/, and the grant/refuse card in js/panels.js is the transit request from another nation.

### Politics ruling 13
Ruling 13 — On ungoverned ground a movement grows by attraction, not grievance

**Where:** [[politics-ideation#Ruling 13 — On ungoverned ground a movement grows by attraction, not grievance]] · line 1105 · **Pages:** [[Stateless society]] · [[Movements]] · [[Authority]] · **Not built:** Not built, because there is no ungoverned ground to grow on. The growth model it subtracts a term from IS built (js/sentiment.js).

### Politics ruling 14
Ruling 14 — Martial law: fewer rules, not more soldiers

**Where:** [[politics-ideation#Ruling 14 — Martial law: fewer rules, not more soldiers]] · line 1137 · **Pages:** [[Release valves]] · [[Authority]] · [[The turn]] · **SUPERSEDED.** Not superseded, but one part is deferred by Aaron: whether it costs the turn's action moves to the mechanics stage because 'we need to change the whole one action per turn' — filed to round 7. · **Not built:** Not built: the word 'martial' appears nowhere in js/ or DESIGN.md, measured this run. The two things it stands between DO exist — a garrison that suppresses and costs liberties, and election.stealBelow = 0.32 in js/tunables.js.

### Politics ruling 15
Ruling 15 — The Farmers Union wants a union, and a Unify movement's demand is that YOU go and ask

**Where:** [[politics-ideation#Ruling 15 — The Farmers Union wants a union, and a Unify movement's demand is that YOU go and ask]] · line 1230 · **Pages:** [[Unions]] · [[Movement demands]] · [[Movements]] · **Not built:** Not built. The X% at which the demand fires was deliberately left unset by Aaron and no number was substituted; finding I then constrains it to sit below 0.30, because data/parties.json gives The Farmers Union and Great Lakes Free Trade a growthCap of 0.30 — verified this run.

### Politics ruling 16
Ruling 16 — A proposal has three answers, and the middle one is the interesting one

**Where:** [[politics-ideation#Ruling 16 — A proposal has three answers, and the middle one is the interesting one]] · line 1311 · **Pages:** [[Unions]] · [[Movements]] · **Not built:** Not built. The occupation penalties a yes waives are all real and built (Authority, Influence, liberty.wOccupation, war weariness, the superlinear treasury surcharge), but nothing can offer or accept a union by agreement — the built 'Unite' is a forced merger decided by a peace roll (DESIGN.md §6).

### Politics ruling 17
Ruling 17 — What decides the answer: their appetite, your weight, and the relationship as a gate

**Where:** [[politics-ideation#Ruling 17 — What decides the answer: their appetite, your weight, and the relationship as a gate]] · line 1371 · **Pages:** [[Unions]] · [[Authority]] · **Not built:** Not built as a decision, though every term it reads exists — affinity, Authority, Influence and the relationship are all live in the model. Its visibility question (can a player see a neighbour's Authority and Influence?) was deferred by Aaron on 11 September, filed with C130.

### Politics ruling 18
Ruling 18 — Asking discharges the demand, and the movement comes back pointing somewhere else

**Where:** [[politics-ideation#Ruling 18 — Asking discharges the demand, and the movement comes back pointing somewhere else]] · line 1425 · **Pages:** [[Movement demands]] · [[Unions]] · **Not built:** Not built. The quiet period before the movement asks again was deferred, not invented.

### Politics ruling 19
Ruling 19 — Proposing costs the turn's action, by precedent rather than by a new decision

**Where:** [[politics-ideation#Ruling 19 — Proposing costs the turn's action, by precedent rather than by a new decision]] · line 1458 · **Pages:** [[The turn]] · [[Unions]] · [[Movement demands]] · **SUPERSEDED.** Flagged as conditionally dependent rather than superseded: 'When the one-action rule changes, this ruling changes with it — it is a consequence of that rule, not an independent decision' (line 1469 area). Aaron has already said the one-action rule needs changing, filed to round 7. · **Not built:** A default taken, not asked — one line to reverse. Nothing built, because proposing a union does not exist.

### Politics ruling 20
Ruling 20 — A split region goes ungoverned, and its edge counties choose a neighbour over the winner

**Where:** [[politics-ideation#Ruling 20 — A split region goes ungoverned, and its edge counties choose a neighbour over the winner]] · line 1472 · **Pages:** [[Stateless society]] · [[Civil war]] · [[Movements]] · **Not built:** Not built. Note the arithmetic it rests on, which the round measured and I did not re-measure this run: 1,181 of 1,688 Areas are a single county, so for most Areas 'the edge counties' is the whole Area. The margin at which a county moves was deferred, not invented.

### Politics ruling 21
Ruling 21 — Of round 1's four new valves, only one is new: the referendum

**Where:** [[politics-ideation#Ruling 21 — Of round 1's four new valves, only one is new: the referendum]] · line 1547 · **Pages:** [[Release valves]] · [[Movements]] · **Not built:** Not built: 'referendum' appears nowhere in js/ or DESIGN.md, measured this run. The election machinery it re-points does exist, including election.stealBelow = 0.32 in js/tunables.js. Funding propaganda before a vote is filed to docs/FUTURE-IDEAS.md F21 and is not part of this ruling.

### Politics ruling 22
Ruling 22 — The movement that changes its mind counts broken promises, and never changes back

**Where:** [[politics-ideation#Ruling 22 — The movement that changes its mind counts broken promises, and never changes back]] · line 1594 · **Pages:** [[Movement demands]] · [[Movements]] · [[The federal remnant]] · **Not built:** Not built, and the round names it as the only piece of machinery in the whole design that does not re-point something that exists. The count of broken promises was deferred, not invented.

### Politics ruling 23
Ruling 23 — A nation's stance toward the old country is read, not stored — and it gives the remnant a clock it cannot stop

**Where:** [[politics-ideation#Ruling 23 — A nation's stance toward the old country is read, not stored — and it gives the remnant a clock it cannot stop]] · line 1649 · **Pages:** [[The federal remnant]] · [[Movements]] · [[Movement demands]] · **Not built:** Not built, and it has nothing to read from: there is no United States nation in the build (no such nation string in data/ or content/ this run), and no movement in data/parties.json carries a verb, so the Rejoin / Reunify test the posture reads has no field to read.

### Politics ruling 24
Ruling 24 — The remnant opens weak because its losses are written into the world, not because a number says so

**Where:** [[politics-ideation#Ruling 24 — The remnant opens weak because its losses are written into the world, not because a number says so]] · line 1685 · **Pages:** [[The federal remnant]] · [[Authority]] · **Not built:** Not built: content/scenario-shattered.json partitions Texas, California and the Mormon Corridor and nothing else, measured this run — there is no remnant nation and no seeded record of losses. The Authority terms it would feed (recent losses, Age, Tenure) are built.

### Politics ruling 25
Ruling 25 — A federation is a real form, not a name: many states, a flat internal toll, an elected leader and a turn of its own

**Where:** [[politics-ideation#Ruling 25 — A federation is a real form, not a name: many states, a flat internal toll, an elected leader and a turn of its own]] · line 1718 · **Pages:** [[Federation]] · [[Unions]] · [[The turn]] · **SUPERSEDED.** Not superseded. All seven of the questions it opens are answered inside this round — by rulings 26, 27, 29, 30/31, 34, 36 and 36's default, plus 35 for the separate-peace question ruling 28 opened. · **Not built:** Not built: 'federation' appears in js/ only in js/identity.js, as a comment about a nation named 'Fairfax Federation' on the leaderboard. Verified this run. Aaron's figures — 10%, the 5/5 split and the 20% worked example — are his and become tunables at the mechanics stage; the election interval was deferred.

### Politics ruling 26
Ruling 26 — The federation's flat toll replaces what members had with each other, and that is the price of joining

**Where:** [[politics-ideation#Ruling 26 — The federation's flat toll replaces what members had with each other, and that is the price of joining]] · line 1796 · **Pages:** [[Federation]] · [[Authority]] · **Not built:** Not built. The corridor machinery it would override IS built and works the opposite way — negotiated, per-mode, per-direction, with a notice period.

### Politics ruling 27
Ruling 27 — The 5% goes to the ground that is crossed, and direct neighbours pay half

**Where:** [[politics-ideation#Ruling 27 — The 5% goes to the ground that is crossed, and direct neighbours pay half]] · line 1831 · **Pages:** [[Federation]] · [[Stateless society]] · **Not built:** Not built. Aaron's own caveat is recorded rather than solved: multi-hop inside the federation is not ruled, and the build compounds tolls on what arrives, so 'flat' and 'compounding' are not the same arithmetic.

### Politics ruling 28
Ruling 28 — An attack on one member is a war with all of them

**Where:** [[politics-ideation#Ruling 28 — An attack on one member is a war with all of them]] · line 1870 · **Pages:** [[Federation]] · [[Civil war]] · **Not built:** Not built. Traced at the close (line 2657 onward) and found not to be a cascade — round 2's one-hop hostility is widened, not deepened — but finding J flags the opposite risk as the federation's largest balance question and an alpha watch item.

### Politics ruling 29
Ruling 29 — A refused petition is not a wall: declare anyway, and you are out

**Where:** [[politics-ideation#Ruling 29 — A refused petition is not a wall: declare anyway, and you are out]] · line 1905 · **Pages:** [[Federation]] · [[The turn]] · **Not built:** Not built. What becomes of a leaver's standing agreements goes to the mechanics stage.

### Politics ruling 30
Ruling 30 — Inside a federation you are at peace with every member. Full stop

**Where:** [[politics-ideation#Ruling 30 — Inside a federation you are at peace with every member. Full stop]] · line 1940 · **Pages:** [[Federation]] · [[Unions]] · **SUPERSEDED.** Not superseded. The collision it found with round 2's permanent rivalries is resolved by ruling 31, and the wary-but-not-hostile texture it removed is parked as docs/FUTURE-IDEAS.md F23. · **Not built:** Not built.

### Politics ruling 31
Ruling 31 — The contest claimants carry a modifier: they can never join a union. Its BREADTH is open

**Where:** [[politics-ideation#Ruling 31 — The contest claimants carry a modifier: they can never join a union. Its BREADTH is open]] · line 1976 · **Pages:** [[Federation]] · [[Unions]] · [[Movements]] · **Amended later.** PARTLY OVERTURNED by ruling 33, which is explicit: 'overturning the suppression Aaron first asked for' (line 2078). The modifier blocking contest claimants from joining a union STANDS. Its second half — that no union- or federation-seeking movement grows inside contested boundaries — is DEAD, and presenting it as live would delete 88.6 million people from the largest Unify movement in the game (finding G). · **Not built:** Not built. Aaron applied it to 'those five' while Texas was under discussion and it is recorded as covering all four contests — one line to narrow if he meant Texas alone.

### Politics ruling 32
Ruling 32 — A union is ONE state; a federation is a union OF states. They are different wants

**Where:** [[politics-ideation#Ruling 32 — A union is ONE state; a federation is a union OF states. They are different wants]] · line 2038 · **Pages:** [[Unions]] · [[Federation]] · [[Release valves]] · **Not built:** Not built — neither object exists as ruled. This is the distinction the whole federation design rests on, and Aaron made it himself.

### Politics ruling 33
Ruling 33 — Nothing is suppressed: the federation IS the answer to a union nobody can give

**Where:** [[politics-ideation#Ruling 33 — Nothing is suppressed: the federation IS the answer to a union nobody can give]] · line 2075 · **Pages:** [[Federation]] · [[Movements]] · [[Release valves]] · **Not built:** Nothing to build — this ruling declines to build the suppression ruling 31 asked for. It is the fifth thing this round refused to build.

### Politics ruling 34
Ruling 34 — The members vote you in, anyone may walk out, and three is the floor

**Where:** [[politics-ideation#Ruling 34 — The members vote you in, anyone may walk out, and three is the floor]] · line 2099 · **Pages:** [[Federation]] · **Not built:** Not built. The floor of three is taken from Aaron's own words — 'Alliance is two' — rather than invented.

### Politics ruling 35
Ruling 35 — The federation makes peace as one; a member that wants out leaves first

**Where:** [[politics-ideation#Ruling 35 — The federation makes peace as one; a member that wants out leaves first]] · line 2128 · **Pages:** [[Federation]] · **Not built:** Not built. The round-2 peace machinery it preserves — both sides table terms blind and the defender chooses — is itself a design, not code.

### Politics ruling 36
Ruling 36 — The outside 15% splits evenly, and that is what buys the small nations

**Where:** [[politics-ideation#Ruling 36 — The outside 15% splits evenly, and that is what buys the small nations]] · line 2153 · **Pages:** [[Federation]] · **Not built:** Not built. It also carries a default taken rather than asked — if the leader is conquered or leaves, the members hold an election immediately — which answers ruling 25's sixth question and is one line to reverse.

### Politics ruling 37
Ruling 37 — A federation trades authority for influence, and the model already computes both

**Where:** [[politics-ideation#Ruling 37 — A federation trades authority for influence, and the model already computes both]] · line 2183 · **Pages:** [[Federation]] · [[Authority]] · [[Unions]] · **Not built:** Not built as an act, though both stocks it moves are built (DESIGN.md §4.1, js/power.js) and Influence already counts Reach. Its irony — that joining makes your own future unions harder — was traced at the close and resolved into a funnel rather than a trap.

### Politics ruling 38
Ruling 38 — The fervour of a new country is a tolerance, and it ends worse than neutral

**Where:** [[politics-ideation#Ruling 38 — The fervour of a new country is a tolerance, and it ends worse than neutral]] · line 2219 · **Pages:** [[Authority]] · [[Movements]] · **Not built:** Half built: the honeymoon exists as four turns of borrowed Authority against a GDP cut (js/game.js, js/power.js, js/world.js, js/scenario.js, js/tunables.js, verified this run). The tolerance applied to grievance and the fade below baseline are NOT built, and how far below and for how long were deferred, not invented.

### Politics ruling 39
Ruling 39 — A vassal keeps its own government, and its people blame that government

**Where:** [[politics-ideation#Ruling 39 — A vassal keeps its own government, and its people blame that government]] · line 2248 · **Pages:** [[Authority]] · [[Movements]] · **Not built:** Not built: measured this run, 'vassal' appears in js/ only in js/tunables.js and js/victory.js, and in both places only to say a vassal contract was deliberately never invented because the save format has nowhere to put one. What submission IS stays round 5's.

### Politics ruling 40
Ruling 40 — Three words for three things: ideology, party, movement

**Where:** [[politics-ideation#Ruling 40 — Three words for three things: ideology, party, movement]] · line 2265 · **Pages:** [[The political board]] · [[Movements]] · [[Release valves]] · **Not built:** Not built. Today one word does both jobs — content/ideologies.json names six 'ideologies' that are simultaneously the positions and the parties a nation governs as, verified this run. The change-course pricing this ruling hands to geometry is currently a treasury cost scaled by axis distance plus an Authority hit (DESIGN.md §7.4).

### Politics ruling 41
Ruling 41 — The three capped-out separatists get a ceiling above the line

**Where:** [[politics-ideation#Ruling 41 — The three capped-out separatists get a ceiling above the line]] · line 2386 · **Pages:** [[Movements]] · [[Stateless society]] · [[Unions]] · **Not built:** EXPLICITLY SPECIFIED AND NOT MADE — the ruling says so itself: 'The change, specified exactly, and NOT made here'. Measured against data/parties.json this run, all three still read growthCap 0.35: Sagebrush Rebellion, Acadiana and El Paso United. The ruling asks for 0.45. This is live work for whoever builds next.
<!-- GENERATED:index END -->

*Generated by `build/build_wiki.py` from commit `7d167a6` (2026-09-11).*
