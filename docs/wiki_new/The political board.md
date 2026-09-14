---
title: The political board
topic: ideology
tags:
  - ideology/the-political-board
  - #politics
  - round/3
kind: concept
built: designed only for the new board, built for the old one — and the two disagree. Measured this run: content/ideologies.json holds SIX ideologies on TWO axes with a single affinity function that drives coalitions, drift, liberty, trade alignment and AI diplomacy, and data/parties.json still labels its 32 movements with five of those six colours. The three-axis ten-position board, the eight corner parties named for real parties, and the re-map of all 26 live movements are authoring that has not been done. The largest unstarted job is splitting the 2024 county seed's Republicans and Democrats across the eight corners by cultural region, because neither major party maps onto a corner.
status: written
---

# The political board

> [!abstract] At a glance
> **System:** [[Ideology]]
> **In the game today:** designed only for the new board, built for the old one — and the two disagree. Measured this run: content/ideologies.json holds SIX ideologies on TWO axes with a single affinity function that drives coalitions, drift, liberty, trade alignment and AI diplomacy, and data/parties.json still labels its 32 movements with five of those six colours. The three-axis ten-position board, the eight corner parties named for real parties, and the re-map of all 26 live movements are authoring that has not been done. The largest unstarted job is splitting the 2024 county seed's Republicans and Democrats across the eight corners by cultural region, because neither major party maps onto a corner.
> **Decided in:** Politics
> **This page:** written

*The ten positions on three axes — economy, morals and government power — that every party, government and movement occupies; the three words that keep ideology, party and movement apart; how a party drifts across the board and an ideology cannot; the affinity between any two positions and what it gates; and the two conditions off the outer edges that you fall into rather than vote for.*

## What it is

The political board is the map of political positions used by governments, parties and movements. The intended design has ten positions arranged across three axes — economy, morals and government power — so political similarity can be measured without treating every disagreement as the same kind of disagreement.

## How it works in the game

The surviving part of Politics ruling 1 establishes **three axes** and the principle of naming the political positions in recognisable political language; its original roster is replaced by ruling 2 ([[Rulings - Politics#Politics ruling 1]]; [[Rulings - Politics#Politics ruling 2]]).

Ruling 2 sets the intended board at **ten positions**. Eight occupy the ideological corners created by the three axes, while the familiar Republican and Democratic positions sit nearer the middle. The same ruling places authoritarian possibilities at the outer ends and defines two conditions beyond the normal board rather than ordinary positions a party simply chooses ([[Rulings - Politics#Politics ruling 2]]).

The vocabulary is strict. An **ideology** is a fixed place on the board; a **party** is a political organisation that can move across that board; a **movement** is a political want carried through one of those positions ([[Rulings - Politics#Politics ruling 40]]). The running game currently uses one older word for several of those jobs, so the new vocabulary has not yet been implemented.

Political distance is meant to feed systems such as [[Grievance]], [[Resistance]], government course-changing and diplomatic acceptance. A party can drift or deliberately change course; the ideology positions themselves do not move ([[Rulings - Politics#Politics ruling 40]]).

The running game still contains six ideologies on two axes. The ten-position, three-axis board and the re-map of population and movements remain designed-only authoring work.

## The story behind it

Several movement placements show why the third axis exists. [[A Free Texas]] is placed at [[Fascism]] because a fascist bloc has taken it over; [[Deseret]] can combine conservative social politics with a different economic tradition; and the politics around Boston need not move an entire New England movement simply because one cultural centre pulls in another direction. The board is intended to make those distinctions visible without creating a new bespoke ideology for every region.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Anarcho-Capitalism]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Christian Nationalism (position)]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Civil war]] - Swallow enough of somebody else and their politics take your parliament  <!-- TRIGGERS, js/civilwar.js:4 — "the annexation flips the nation's PLURALITY party" -->
- [[Communism]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Democratic Socialism]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Democrats]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Digital Technocracy]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Distributism]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Fascism]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Federation]] - Joining people unlike you is expensive at home, however profitable abroad  <!-- GATES, Round 3 ruling 37, docs/design/politics-ideation.md:2183 -->
- [[Grievance]] - Anger only becomes a movement where the politics already fit  <!-- GATES, js/sentiment.js:4 — base = affinity(area's leading ideology, movement's ideology) -->
- [[Ideology]] - An ideology is a place on the board and cannot move; a party can  <!-- EXPLAINS, Round 3 ruling 40, docs/design/politics-ideation.md:2265 -->
- [[Liberal Anarchy]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Movements]] - A movement travels through a politics, and the wrong politics stops it dead  <!-- GATES, Round 1 ruling 43, docs/design/secession-ideation.md:1334; js/sentiment.js:4 -->
- [[People]] - People move toward people who think as they do, and the map sorts itself  <!-- FEEDS, DESIGN.md:1443-1446 -->
- [[Release valves]] - The distance a party has to travel is what changing course costs  <!-- FEEDS, Round 3 ruling 40, docs/design/politics-ideation.md:2265 -->
- [[Republicans]] - a position on the board  <!-- EXPLAINS, politics rulings 1 and 2 -->
- [[Resistance]] - Willingness to resist is the distance between the governed and the governors  <!-- FEEDS, Round 1 ruling 34, docs/design/secession-ideation.md:1126 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Three empty positions:** the design notes that three of the ten positions currently have no movement assigned, and that the empty side is disproportionately authoritarian. Confirm whether this is intended or incomplete movement authoring.
- **Beyond-the-edge conditions:** ruling 2 names Despotism/Statelessness-type conditions beyond the board, but what entering them buys or costs was deliberately deferred. Do not invent effects.
- **Population re-map:** the largest remaining authoring job is splitting the current Republican/Democratic county seed across the new corners by cultural region. No final mapping exists yet.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 1]] | Ruling 1 — three axes, and the roster named for real parties. Recorded at P2 and in DECISIONS.md D185. Superseded in its roster by ruling 2. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 2]] | Ruling 2 — ten positions, authoritarians at both outer ends, the drift partition, and the two conditions. Recorded at P5 and P6, and in D186. | ruled, not built |
| [[Rulings - Politics#Politics ruling 5]] | Ruling 5 — Enveloped territory: over 500,000 it is a nation, under it a stateless society | ruled, not built |
| [[Rulings - Politics#Politics ruling 40]] | Ruling 40 — Three words for three things: ideology, party, movement | ruled, not built |

*4 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
