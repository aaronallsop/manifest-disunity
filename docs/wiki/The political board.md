---
title: The political board
topic: ideology
tags:
  - ideology/the-political-board
  - #politics
  - round/3
kind: concept
built: designed only for the new board, built for the old one — and the two disagree. Measured this run: content/ideologies.json holds SIX ideologies on TWO axes with a single affinity function that drives coalitions, drift, liberty, trade alignment and AI diplomacy, and data/parties.json still labels its 32 movements with five of those six colours. The three-axis ten-position board, the eight corner parties named for real parties, and the re-map of all 26 live movements are authoring that has not been done. The largest unstarted job is splitting the 2024 county seed's Republicans and Democrats across the eight corners by cultural region, because neither major party maps onto a corner.
status: needs writing
---

# The political board

> [!abstract] At a glance
> **System:** [[Ideology]]
> **In the game today:** designed only for the new board, built for the old one — and the two disagree. Measured this run: content/ideologies.json holds SIX ideologies on TWO axes with a single affinity function that drives coalitions, drift, liberty, trade alignment and AI diplomacy, and data/parties.json still labels its 32 movements with five of those six colours. The three-axis ten-position board, the eight corner parties named for real parties, and the re-map of all 26 live movements are authoring that has not been done. The largest unstarted job is splitting the 2024 county seed's Republicans and Democrats across the eight corners by cultural region, because neither major party maps onto a corner.
> **Decided in:** Politics
> **This page:** not yet written

*The ten positions on three axes — economy, morals and government power — that every party, government and movement occupies; the three words that keep ideology, party and movement apart; how a party drifts across the board and an ideology cannot; the affinity between any two positions and what it gates; and the two conditions off the outer edges that you fall into rather than vote for.*

## What it is

<!-- WRITER: one short paragraph, plain language. What is this, to somebody playing? -->

## How it works in the game

<!-- WRITER: the mechanism. Link other pages inline as you write - "you cannot trade with a
     nation you are at [[War|war]] with" - because those inline links are what draws the graph.
     Cite the ruling behind each claim from the Sources table at the foot of this page. -->

## The story behind it

<!-- WRITER: the in-world explanation. Raw material found: yes — A Free Texas placed on Fascism because it was taken over by a fascist bloc; Deseret's law of consecration lite; Boston's Catholic pull on New England United, which the three-axis board answers without moving the movement. Carries two things a writer must present as open questions rather than rules: three of the ten positions carry no movement at all and the empty half of the board is the authoritarian one; and what falling into Despotism or Statelessness buys and costs is deliberately unanswered, with no placeholder invented. -->

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

*Generated by `build/build_wiki.py` from commit `7d167a6` (2026-09-11).*
<!-- GENERATED:sources END -->
