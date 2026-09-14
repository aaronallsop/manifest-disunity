---
title: Grievance
topic: secession
tags:
  - secession/grievance
  - #people
  - round/1
kind: mechanic
built: built — the formula and its weights run, and grievance already blends an Area's own condition with its nation's. Not built: the target-versus-holder gradient, so every term still reads the holding nation only and nothing reads the nation a region would rather join.
status: written
---

# Grievance

> [!abstract] At a glance
> **System:** [[Secession]]
> **In the game today:** built — the formula and its weights run, and grievance already blends an Area's own condition with its nation's. Not built: the target-versus-holder gradient, so every term still reads the holding nation only and nothing reads the nation a region would rather join.
> **Decided in:** Secession
> **This page:** written

*The number that decides whether a region turns against the country holding it — the six pressures that feed it, what each is worth, and the ideological multiplier that decides where it can matter at all.*

## What it is

Grievance is the pressure that makes people in a region turn against the nation governing them. It combines how life under that government is going with whether a movement's politics fit the people who live there, so the same bad conditions do not produce the same movement everywhere.

## How it works in the game

The secession design treats whether a government is "doing well" as a combination of **Quality of Life, Influence and Authority** rather than as a single arbitrary satisfaction score ([[Rulings - Secession#Secession ruling 13]]). Those national conditions feed the pressure under which local movements grow.

Political fit acts as a gate on that pressure. A movement is most able to turn grievance into growth where the local political position is compatible with the movement's own position; elsewhere, the same national failure can produce little or no growth. This is why [[The political board]] and [[Movements]] are part of the grievance system rather than merely flavour labels.

A realised movement is a special case. Once that movement has created its own nation, support for the founding movement on the nation's own ground is **loyalty**, not hostility toward the government ([[Rulings - Secession#Secession ruling 16]]). The running game currently contradicts that rule: it still counts the largest movement share as pressure even when the movement is the one that founded the nation.

The design notes that several grievance terms can reinforce one another after a bad opening roll. That stacking is intentional enough to be recorded but remains a tuning risk rather than a separate rule.

## The story behind it

The most concrete authored grievance is in the Mormon Corridor: ground that voted to leave but was cut off from the realised state remembers being left behind. More broadly, the first secession round found that the mechanical defaults were already producing a story through what governments failed to provide, even before a dedicated narrative layer had been written.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Civil war]] - Anger raises movement share; past forty per cent the civil-war clock starts *(unverified)*  <!-- FEEDS, Round 3 ruling 8, docs/design/politics-ideation.md:608 -->
- [[Movements]] - A region's anger is the fuel a movement grows on  <!-- FEEDS, js/sentiment.js:12 — target = clamp01(base * (grievance + pull) - suppression) -->
- [[Occupation]] - Angry ground is dearer to hold, and the bill rises faster than the map *(unverified)*  <!-- FEEDS, DESIGN.md:491 — superlinear occupation surcharge; js/sentiment.js:139 suppression term -->
- [[People]] - Govern badly and the people who can leave, leave  <!-- COSTS, DESIGN.md:1435 — "suppression costs you the people who can leave" -->
- [[Release valves]] - The four valves exist to answer the anger this page measures  <!-- TRIGGERS, Round 3 ruling 11, docs/design/politics-ideation.md:929 -->
- [[Secession]] - Secession is the scoreboard, and this page is how the score is kept  <!-- EXPLAINS, docs/design/IDEATION-PLAN.md:35 — "Secession is not a leaf. It is the scoreboard." -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Exact grievance formula:** this page's sources identify Quality of Life, Influence, Authority and ideological fit, but the complete six-pressure weighting described in the page synopsis is not fully recoverable from the closed rulings alone. Preserve the existing implementation/specification numbers until the designer confirms the final table.
- **Implementation contradiction:** realised movements currently count against their own nation despite ruling 16. This should be corrected rather than documented as intended behaviour.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Secession#Secession ruling 13]] | "doing well" is quality of life, influence and authority. | ruled, not built |
| [[Rulings - Secession#Secession ruling 16]] | a realised movement's own ground is loyalty, not pressure. | ruled, not built |

*2 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
