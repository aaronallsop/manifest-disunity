---
title: Movements
topic: secession
tags:
  - secession/movements
  - #politics
  - round/1
  - round/3
kind: entity
built: partial, and the gap is wide. Measured this run: data/parties.json holds exactly 32 movements, each with an ideology colour, growthCap, growthRate, goals and counties, driven by a latent→rising→armed→declared→realized state machine. No movement carries a verb field; the old eight-value `type` field still drives behaviour (measured values include ideological, separatist, autonomist, reunification, theocratic-separatist, economic, irredentist, indigenous); the six movements round 1 struck are still in the file; the three growth-cap changes round 3 specified are not made; and js/military.js computes manpower as population × mil.manpowerShare with no movement term at all, so the militia split is not built.
status: written
---

# Movements

> [!abstract] At a glance
> **System:** [[Secession]]
> **In the game today:** partial, and the gap is wide. Measured this run: data/parties.json holds exactly 32 movements, each with an ideology colour, growthCap, growthRate, goals and counties, driven by a latent→rising→armed→declared→realized state machine. No movement carries a verb field; the old eight-value `type` field still drives behaviour (measured values include ideological, separatist, autonomist, reunification, theocratic-separatist, economic, irredentist, indigenous); the six movements round 1 struck are still in the file; the three growth-cap changes round 3 specified are not made; and js/military.js computes manpower as population × mil.manpowerShare with no movement term at all, so the militia split is not built.
> **Decided in:** Politics, Secession
> **This page:** written

*What a movement is — a verb, an adjective and a position on the political board — how it is born, how it grows, how high it can grow, who its members fight for when the shooting starts, and the register of the thirty-two on the board.*

## What it is

A movement is an organised political want held by people in a particular part of the country. It represents something those people want to happen to their government, their territory or the wider map, and if it becomes strong enough it can force governments to respond or reshape the country around it.

## How it works in the game

### What makes a movement

Every movement has three separate parts: a **verb**, an **adjective** and an **ideology**. The verb says what the movement ultimately wants to happen; the adjective says what the movement is about and therefore what might make that want go away; the ideology is the political position through which that want is organised ([[Rulings - Secession#Secession ruling 43]]; [[Rulings - Politics#Politics ruling 40]]).

There are six movement verbs ([[Rulings - Secession#Secession ruling 39]]): **Unify** joins several states into a new nation; **Reunify** restores a broken state; **Separate** removes the movement's ground from its current state; **Rejoin** returns ground to a parent nation that still exists; **Expand** pressures an existing government to take new ground; and **Reconquer** pressures it to retake ground previously lost.

The later politics design says the adjective system has five categories ([[Rulings - Politics#Politics ruling 11a]]): **autonomist**, **cultural**, **ideological**, **resource** and **economic**. Several current movement records still use `religious` and `indigenous`, so the register and the five-category ruling do not yet agree.

### Where movements exist

A movement belongs to a geographic [[Homelands|homeland]] painted in counties rather than inherited from state borders. A movement's claim can cross an old state line whenever its actual homeland does ([[Rulings - Secession#Secession ruling 51]]).

Movements are not supposed to be limited to the ones present when the game begins. The design calls for growing movements at setup and for new movements to arise during play ([[Rulings - Secession#Secession ruling 14]]).

The original division put Unify, Reunify and Separate on the opening map while Rejoin, Expand and Reconquer arise when conditions create the want ([[Rulings - Secession#Secession ruling 42]]). That was later refined: Expand and Reconquer can also exist at setup when the condition already exists on turn one ([[Rulings - Secession#Secession ruling 44]]).

### Growth and government

How well a place is being governed matters to movement pressure. Whether a government is "doing well" is read through Quality of Life, Influence and Authority ([[Rulings - Secession#Secession ruling 13]]).

Ungoverned ground is a special case. A movement growing there is driven by attraction rather than grievance against a government, because there is no government present to blame ([[Rulings - Politics#Politics ruling 13]]).

Once a movement's own nation exists, support for that movement on the nation's own ground counts as loyalty rather than pressure against the government ([[Rulings - Secession#Secession ruling 16]]). Its [[Homelands|homeland]] also widens automatically to include the nation's founding ground ([[Rulings - Secession#Secession ruling 17]]).

### What happens when a movement succeeds

The movement's verb determines what success means ([[Rulings - Secession#Secession ruling 39]]). A Separate movement creates a breakaway state; Unify merges states into one new state; Rejoin returns ground to an existing parent; Expand and Reconquer pressure an existing government to act on somebody else's ground.

A Reunify movement must not create another breakaway country. When it succeeds, it resolves a [[Reunification contests|reunification contest]] by declaring a winner among the states claiming to be the continuation of the broken country ([[Rulings - Secession#Secession ruling 18]]).

Some movements can later change what they want after enough broken promises, and once that change occurs they do not change back ([[Rulings - Politics#Politics ruling 22]]). The number of broken promises required has not yet been decided.

### Movements and government responses

A government is not meant to browse the continent and arbitrarily choose a movement to support. A movement first approaches a nation, creating the opportunity to [[Backing a movement|back it]] ([[Rulings - Secession#Secession ruling 47]]). Refusing that approach has no immediate cost, but repeated refusal is intended to have a later consequence; the exact clock has not been set ([[Rulings - Secession#Secession ruling 49]]).

Some movements make demands of their own government. A Unify movement, for example, demands that its government approach another country and propose a union rather than merging the map itself ([[Rulings - Politics#Politics ruling 15]]).

When several movements share the government as their common enemy, their strength is measured together rather than only by whichever individual movement is largest ([[Rulings - Politics#Politics ruling 6]]). If political conflict becomes military, movement members are meant to join the movement militia rather than supplying manpower to the government's army ([[Rulings - Politics#Politics ruling 7]]).

### What the game currently does differently

The movement redesign is substantially ahead of the running game. The design separates verb, adjective and ideology, but current movement data still relies on the older `type` field and does not carry the new verb/adjective structure. Six struck movements also remain in the current data. New movements cannot yet be founded during play, reunification movements can still behave like separatists, and movement members are not removed from government military manpower.

Three movements — [[Sagebrush Rebellion]], [[Acadiana]] and [[El Paso United]] — are supposed to have a growth ceiling of 0.45 rather than 0.35, but that data change has been specified and not yet applied ([[Rulings - Politics#Politics ruling 41]]).

## The story behind it

Many movements are rooted in regional identities and political claims that existed before the Shattering rather than being invented only after the United States collapsed. The register draws on places and projects such as [[Greater Idaho]], [[State of Jefferson]], [[Sagebrush Rebellion]] and [[Franklin]], alongside new wants produced by the breakup itself. The source material has not yet written one continuous in-world history explaining how all twenty-six live movements developed.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Backing a movement]] - The movement approaches you; a nation cannot simply pick one to back  <!-- GATES, Round 1 ruling 47, docs/design/secession-ideation.md:1451 -->
- [[Civil war]] - Movements past forty per cent together start the countdown to civil war  <!-- TRIGGERS, Round 3 ruling 8, docs/design/politics-ideation.md:608 -->
- [[Homelands]] - Every movement is a painted patch of counties, never a state line  <!-- FEEDS, Round 1 rulings 17 and 51, docs/design/secession-ideation.md:794 and :1502 -->
- [[Military]] - People in a movement join its militia instead of your army  <!-- COSTS, Round 3 ruling 7, docs/design/politics-ideation.md:576 -->
- [[Movement demands]] - A movement that has grown enough starts making demands of its government  <!-- TRIGGERS, Round 2 ruling 16, docs/design/conquest-ideation.md:485 -->
- [[Movement register]] - all thirty-two movements on one screen, grouped by verb  <!-- EXPLAINS, the Movement Register -->
- [[Reunification contests]] - A reunification movement declares a winner among claimants, not a new country  <!-- FEEDS, Round 1 ruling 18, docs/design/secession-ideation.md:810 -->
- [[The federal remnant]] - Whether a country still waits for the old union is read off its movements  <!-- FEEDS, Round 3 ruling 23, docs/design/politics-ideation.md:1649 -->
- [[Unions]] - A movement that wants a union demands that you go and ask a neighbour  <!-- TRIGGERS, Round 3 ruling 15, docs/design/politics-ideation.md:1230 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Petition threshold:** must sit below the point where a movement can resolve itself, but no value has been set.
- **Broken-promise count:** no threshold has been set for a movement changing its verb.
- **Generated source conflict:** Politics ruling 11a is marked superseded in some generated tables even though the ruling index says it remains live.
- **Adjective conflict:** the five-category ruling omits `religious` and `indigenous`, which still appear in the live register.
- **Movement-register wording:** one source says "the five untouched" and then names six movements; likely a transcription/count error, but it should be corrected rather than inferred.
- **Politics placements marked `?`:** these are authored rather than ruled and remain for designer confirmation.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 1]] | Ruling 1 — three axes, and the roster named for real parties. Recorded at P2 and in DECISIONS.md D185. Superseded in its roster by ruling 2. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 3]] | Ruling 3 — What a stateless society is, and what it costs to trade with one | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 4]] | Ruling 4 — Stranded ground goes stateless, and a movement can rise from it | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 6]] | Ruling 6 — A coalition is a shared enemy, and it is measured as total movement share | ruled, not built |
| [[Rulings - Politics#Politics ruling 7]] | Ruling 7 — Movement members join the militia, not the army | ruled, not built |
| [[Rulings - Politics#Politics ruling 9]] | Ruling 9 — A government can give up and join the movement | ruled, not built |
| [[Rulings - Politics#Politics ruling 10]] | Ruling 10 — The two forties are two dials with two jobs, and the values go to the architect | ruled, not built |
| [[Rulings - Politics#Politics ruling 11a]] | Ruling 11a — The "remove the want" column belongs to the ADJECTIVE, and there are five of them | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 13]] | Ruling 13 — On ungoverned ground a movement grows by attraction, not grievance | ruled, not built |
| [[Rulings - Politics#Politics ruling 15]] | Ruling 15 — The Farmers Union wants a union, and a Unify movement's demand is that YOU go and ask | ruled, not built |
| [[Rulings - Politics#Politics ruling 16]] | Ruling 16 — A proposal has three answers, and the middle one is the interesting one | ruled, not built |
| [[Rulings - Politics#Politics ruling 20]] | Ruling 20 — A split region goes ungoverned, and its edge counties choose a neighbour over the winner | ruled, not built |
| [[Rulings - Politics#Politics ruling 21]] | Ruling 21 — Of round 1's four new valves, only one is new: the referendum | ruled, not built |
| [[Rulings - Politics#Politics ruling 22]] | Ruling 22 — The movement that changes its mind counts broken promises, and never changes back | ruled, not built |
| [[Rulings - Politics#Politics ruling 23]] | Ruling 23 — A nation's stance toward the old country is read, not stored — and it gives the remnant a clock it cannot stop | ruled, not built |
| [[Rulings - Politics#Politics ruling 31]] | Ruling 31 — The contest claimants carry a modifier: they can never join a union. Its BREADTH is open | amended later · ruled, not built |
| [[Rulings - Politics#Politics ruling 33]] | Ruling 33 — Nothing is suppressed: the federation IS the answer to a union nobody can give | ruled, not built |
| [[Rulings - Politics#Politics ruling 38]] | Ruling 38 — The fervour of a new country is a tolerance, and it ends worse than neutral | ruled, not built |
| [[Rulings - Politics#Politics ruling 39]] | Ruling 39 — A vassal keeps its own government, and its people blame that government | ruled, not built |
| [[Rulings - Politics#Politics ruling 40]] | Ruling 40 — Three words for three things: ideology, party, movement | ruled, not built |
| [[Rulings - Politics#Politics ruling 41]] | Ruling 41 — The three capped-out separatists get a ceiling above the line | ruled, not built |
| [[Rulings - Secession#Secession ruling 4]] | The Deep South is one nation as written, counterbalanced by separatist movements inside it | amended later · ruled, not built |
| [[Rulings - Secession#Secession ruling 12]] | every nation spawns in every game; what rolls is its size. | ruled, not built |
| [[Rulings - Secession#Secession ruling 13]] | "doing well" is quality of life, influence and authority. | ruled, not built |
| [[Rulings - Secession#Secession ruling 14]] | growing movements roll at the start on Deseret's shape, and new ones arise in play. | ruled, not built |
| [[Rulings - Secession#Secession ruling 16]] | a realised movement's own ground is loyalty, not pressure. | ruled, not built |
| [[Rulings - Secession#Secession ruling 17]] | a realised movement's homeland widens to its nation's founding ground, automatically. | ruled, not built |
| [[Rulings - Secession#Secession ruling 18]] | a reunification movement declares a winner, not a country. | ruled, not built |
| [[Rulings - Secession#Secession ruling 21]] | a nation can fund a movement, and it is a standing commitment rather than a move. | ruled, not built |
| [[Rulings - Secession#Secession ruling 27]] | the four Type A nations get no movement built into them. | ruled, not built |
| [[Rulings - Secession#Secession ruling 28]] | the Deep South is balanced by rising movements that cross state lines. | amended later · ruled, not built |
| [[Rulings - Secession#Secession ruling 30]] | Central Florida gets no movement, and the Floribama leftovers go to it. | amended later · ruled, not built |
| [[Rulings - Secession#Secession ruling 39]] | every movement has a VERB, and there are six. | ruled, not built |
| [[Rulings - Secession#Secession ruling 40]] | the old types become ADJECTIVES, not behaviours. | ruled, not built |
| [[Rulings - Secession#Secession ruling 41]] | Aaron's own extension, parked deliberately: a Deseret that shatters can grow a Deseret Reunify movement, if whoever holds the pieces governs them badly. | ruled, not built |
| [[Rulings - Secession#Secession ruling 42]] | three of the six verbs are born in play, not painted. | amended later · ruled, not built |
| [[Rulings - Secession#Secession ruling 43]] | a movement is what people want; politics is how they get it. | ruled, not built |
| [[Rulings - Secession#Secession ruling 44]] | four verbs changed. | ruled, not built |
| [[Rulings - Secession#Secession ruling 45]] | six struck, and they split two ways. | ruled, not built |
| [[Rulings - Secession#Secession ruling 46]] | Canadian Refuge goes to the ideas file as F16. | ruled, not built |
| [[Rulings - Secession#Secession ruling 47]] | a movement approaches a nation; the nation does not simply choose. | ruled, not built |
| [[Rulings - Secession#Secession ruling 49]] | refusing costs nothing immediately and everything eventually. | ruled, not built |
| [[Rulings - Secession#Secession ruling 51]] | a movement is bound to counties, never to state lines. | ruled, not built |
| [[Rulings - Secession#Secession ruling 52]] | the New Confederacy keeps its name for now, and it is marked for change. | ruled, not built |
| [[Rulings - Secession#Secession ruling 53]] | the Lakota Nation is Butte, Brown and Pennington: 3 Areas, about 271,000 people, and it holds Rapid City. | ruled, not built |

*45 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
