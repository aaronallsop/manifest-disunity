---
title: Unions
topic: diplomacy
tags:
  - diplomacy/unions
  - #politics
  - round/3
kind: mechanic
built: partial — a merger of two nations exists as the built Unite action, but it is a FORCED merger decided by a roll that can fracture you on failure, and its failure mode is the civil war resolver. The consensual version ruled here — a movement-driven proposal answered yes, let's think about it, or no, with none of the occupation penalties — is not built, and no proposal machinery exists in js/.
status: written
---

# Unions

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** partial — a merger of two nations exists as the built Unite action, but it is a FORCED merger decided by a roll that can fracture you on failure, and its failure mode is the civil war resolver. The consensual version ruled here — a movement-driven proposal answered yes, let's think about it, or no, with none of the occupation penalties — is not built, and no proposal machinery exists in js/.
> **Decided in:** Politics
> **This page:** written

*Two nations agreeing to become one state — who sends you to ask, the three answers you can get back, what decides which one you get, and why joining is the only way to grow that does not poison the ground you gained.*

## What it is

A union is an agreement in which two nations stop being separate states and become one country. It is different from a federation, where the members keep their governments and remain states inside a larger structure.

## How it works in the game

A **Unify** movement can demand that its government pursue a union, but the movement does not merge countries itself. The government must approach another nation and ask ([[Rulings - Politics#Politics ruling 15]]).

The other nation has **three possible answers** rather than a simple yes/no. Acceptance is the clean merger; refusal leaves the countries separate; the middle response is intended to create a negotiated political possibility rather than flattening every proposal into a binary decision ([[Rulings - Politics#Politics ruling 16]]).

The answer depends on the other nation's appetite, the proposer's Authority and Influence, political affinity and the diplomatic relationship between them ([[Rulings - Politics#Politics ruling 17]]). The exact visibility of those inputs to the player remains unresolved.

Simply making the requested proposal discharges the movement's immediate demand even if the target says no. After a quiet period, the movement can return pointing at another possible partner ([[Rulings - Politics#Politics ruling 18]]). That quiet period has not been assigned a number.

Under the current turn structure, proposing the union uses the government's ordinary action ([[Rulings - Politics#Politics ruling 19]]). This rule is conditional on the one-action turn and must be revisited when that structure changes.

A union is **one state**. A [[Federation]] is a union **of states** whose members retain their separate governments; they are different political wants and should not be treated as two names for the same object ([[Rulings - Politics#Politics ruling 32]]).

Countries in a federation are at Peace with one another, but membership does not silently satisfy every union movement. When a full merger cannot be granted, the federation can instead become the political answer without suppressing the movement ([[Rulings - Politics#Politics ruling 30]]; [[Rulings - Politics#Politics ruling 33]]).

Claimants in an active [[Reunification contests|reunification contest]] carry a modifier that prevents them from joining a union while they are still competing to inherit the same broken country ([[Rulings - Politics#Politics ruling 31]]).

Joining larger structures also changes the stocks that influence future proposals. Federation membership trades Authority for Influence, which can alter how attractive or credible a future union proposal looks ([[Rulings - Politics#Politics ruling 37]]).

The running game's existing "Unite" result is not this mechanic; it is a forced merger arising from the older peace system. Voluntary political union as ruled here is unbuilt.

## The story behind it

The Farmers Union movement is the clearest narrative example: seven governors signing a regional union is a political act, not the result of one state conquering the other six. The open story question is what such a union means for places that have already walked away — for example, what Illinois brings into a union after Chicago has become its own state.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Authority]] - Size, authority and influence together are what make you frightening to join  <!-- GATES, Round 3 ruling 17, docs/design/politics-ideation.md:1371 -->
- [[Diplomacy]] - Whether a government may propose with nobody demanding it is still open *(unverified)*  <!-- FEEDS, Round 3 ruling 18, docs/design/politics-ideation.md:1425 (filed for round 5) -->
- [[Federation]] - A union is one state; a federation is a union of states. Different wants  <!-- CONTRADICTS, Round 3 ruling 32, docs/design/politics-ideation.md:2038 -->
- [[Movement demands]] - The only demand your government cannot satisfy alone — somebody else must say yes  <!-- TRIGGERS, Round 3 ruling 15, docs/design/politics-ideation.md:1230 -->
- [[Movements]] - "Let us think about it" grows the same movement inside their country  <!-- FEEDS, Round 3 rulings 16 and 18, docs/design/politics-ideation.md:1311 and :1425 -->
- [[Nations of the Shattering]] - A yes makes two countries one, and everybody in it a full member  <!-- TRIGGERS, Round 3 ruling 16, docs/design/politics-ideation.md:1311 -->
- [[Reunification contests]] - The claimants to a broken country may never join one  <!-- BLOCKS, Round 3 ruling 31, docs/design/politics-ideation.md:1976 -->
- [[The turn]] - Making the proposal spends your one action for the quarter  <!-- COSTS, Round 3 ruling 19, docs/design/politics-ideation.md:1458 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Demand trigger:** Unify movements need to demand action below the 0.30 cap carried by Farmers Union/Great Lakes Free Trade, but no exact percentage is set.
- **Three-answer middle option:** ruling 16 establishes that a meaningful middle answer exists, but its complete terms should be copied from the mechanics specification once final rather than inferred here.
- **Quiet period after a proposal:** deliberately unset.
- **Player information:** whether the target nation's Authority and Influence are visible before proposing was deferred.
- **Reunification breadth:** ruling 31 was phrased broadly after a Texas discussion; confirm it applies identically to all four contest families.
- **One-action cost:** conditional on the future turn redesign.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Politics#Politics ruling 11]] | Ruling 11 — The one table: five moves, six verbs, and the built valves were the answer all along | ruled, not built |
| [[Rulings - Politics#Politics ruling 15]] | Ruling 15 — The Farmers Union wants a union, and a Unify movement's demand is that YOU go and ask | ruled, not built |
| [[Rulings - Politics#Politics ruling 16]] | Ruling 16 — A proposal has three answers, and the middle one is the interesting one | ruled, not built |
| [[Rulings - Politics#Politics ruling 17]] | Ruling 17 — What decides the answer: their appetite, your weight, and the relationship as a gate | ruled, not built |
| [[Rulings - Politics#Politics ruling 18]] | Ruling 18 — Asking discharges the demand, and the movement comes back pointing somewhere else | ruled, not built |
| [[Rulings - Politics#Politics ruling 19]] | Ruling 19 — Proposing costs the turn's action, by precedent rather than by a new decision | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 25]] | Ruling 25 — A federation is a real form, not a name: many states, a flat internal toll, an elected leader and a turn of its own | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 30]] | Ruling 30 — Inside a federation you are at peace with every member. Full stop | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Politics#Politics ruling 31]] | Ruling 31 — The contest claimants carry a modifier: they can never join a union. Its BREADTH is open | amended later · ruled, not built |
| [[Rulings - Politics#Politics ruling 32]] | Ruling 32 — A union is ONE state; a federation is a union OF states. They are different wants | ruled, not built |
| [[Rulings - Politics#Politics ruling 37]] | Ruling 37 — A federation trades authority for influence, and the model already computes both | ruled, not built |
| [[Rulings - Politics#Politics ruling 41]] | Ruling 41 — The three capped-out separatists get a ceiling above the line | ruled, not built |

*12 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
