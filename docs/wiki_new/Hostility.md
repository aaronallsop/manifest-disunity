---
title: Hostility
topic: diplomacy
tags:
  - diplomacy/hostility
  - #economy
  - round/2
kind: mechanic
built: designed only, but everything it acts on is built. Verified this run: trade deals with 2/4/8/20-turn terms exist, and transit corridors carry a four-turn notice period as a tunable. There is simply no hostile state to gate them with.
status: written
---

# Hostility

> [!abstract] At a glance
> **System:** [[Diplomacy]]
> **In the game today:** designed only, but everything it acts on is built. Verified this run: trade deals with 2/4/8/20-turn terms exist, and transit corridors carry a four-turn notice period as a tunable. There is simply no hostile state to gate them with.
> **Decided in:** Military
> **This page:** written

*The quarrel short of war — what puts two nations into it, what it costs them every turn, what it stops them signing, how it cools through Wary back to Peace, and the thirty-three pairs for which it never does.*

## What it is

Hostility is the diplomatic state between ordinary peace and open war. Two nations can become hostile because their interests, movements, alliances or behaviour have put them into a serious quarrel even though neither side has begun fighting.

## How it works in the game

### Hostility belongs to the pair

Hostility is a shared [[Diplomatic states|diplomatic state]]. If two nations are Hostile, that is one fact about their relationship rather than one nation being hostile while the other remains at peace ([[Rulings - Military#Military ruling 5]]).

That shared state is separate from the game's directed memory of what one nation has done to another. The two nations can therefore remember the relationship differently even though the diplomatic state between them is the same ([[Rulings - Military#Military ruling 5]]).

### What causes hostility

The original design gives five ways for two nations to become Hostile ([[Rulings - Military#Military ruling 4]]):

1. A large growing movement inside one nation is associated with the other.
2. The nations are competing to reunify the same former country.
3. One nation badly needs a resource and the other refuses to trade it or demands an extreme price.
4. One nation is [[Backing a movement|funding a movement]] inside the other.
5. A nation inherits one of its ally's quarrels.

Alliance inheritance is limited to **one hop**. Your ally's enemy can become Hostile with you, but the enemies of your ally's ally do not continue propagating through the alliance network ([[Rulings - Military#Military ruling 37]]).

An inherited quarrel is also the fastest-cooling form of Hostility. It continues cooling even while the alliance that caused it remains in place ([[Rulings - Military#Military ruling 38]]).

There is another direct route into Hostility: breaking a [[Peace treaty|peace treaty]] makes every nation bordering the treaty-breaker Hostile immediately, except nations allied with it ([[Rulings - Military#Military ruling 28]]).

### What Hostile costs

A Hostile relationship imposes four direct costs ([[Rulings - Military#Military ruling 9]]): the cost of moving goods through the other nation's ground rises; the other nation demands more before agreeing to let goods cross; movements associated with the hostile neighbour grow faster inside your country; and guarding the border between the two countries costs more money.

An existing trade agreement is honoured until its term ends, but the two nations cannot sign a new one while they remain Hostile ([[Rulings - Military#Military ruling 18]]). A transit corridor follows the same rule: an existing corridor continues, but a new corridor cannot be granted between Hostile nations ([[Rulings - Military#Military ruling 20]]).

### How hostility cools

Ordinary Hostility fades with time rather than remaining until its original cause disappears ([[Rulings - Military#Military ruling 17]]). The path downward is **Hostile → Wary → Peace**. A live source of tension slows that clock, while a trade relationship and other positive standing can make it move faster ([[Rulings - Military#Military ruling 17]]).

A nation can also move upward from Hostile into [[War]] by declaring war.

There is no [[Peace treaty|peace treaty]] directly out of Hostility. Hostility is resolved through the cooling clock and through future diplomacy rather than by signing a war-ending treaty ([[Rulings - Military#Military ruling 21]]).

### Wary

[[Diplomatic states|Wary]] is the intermediate state that stops a serious quarrel from disappearing directly into ordinary Peace. Nations in Wary may deal with one another again, but proposals receive a percentage penalty to acceptance ([[Rulings - Military#Military ruling 39]]). The size of that percentage has deliberately not yet been decided.

One Hostile effect definitely ends immediately at Wary: movements associated with the neighbour no longer receive accelerated growth inside the country. The effect is switched **off**, not merely reduced ([[Rulings - Military#Military ruling 40]]).

The sources disagree about the remaining material costs of Hostility in Wary. Ruling 39 says the single acceptance multiplier replaces the earlier proposal to scale four separate Hostile costs, while another summary says material costs continue at a fraction. This wiki does not resolve that contradiction.

### Permanent hostility

The ordinary cooling clock does not apply normally to nations competing in the same [[Reunification contests|reunification contest]]. For those rivals, Hostile is a **floor**: they may become more antagonistic, including going to War, but they do not simply cool below Hostile while the rivalry governs their relationship ([[Rulings - Military#Military ruling 17]]).

The final claimant lists produce **33 permanent opening quarrels**: ten among the five Texan claimants, ten among the five Californian claimants, ten among the five Confederate claimants and three among the three cities contesting succession to the United States ([[Rulings - Military#Military ruling 32]]).

### What the game currently does differently

The Hostile and Wary diplomatic states are designed but not currently implemented. The running game therefore does not yet apply the Hostile triggers, cooling clock, border cost, movement-growth effect or restrictions on signing agreements.

## The story behind it

The design's recurring example is Oregon and Greater Idaho. Oregon does not need to be at war with Greater Idaho for the relationship to deteriorate: the [[Greater Idaho]] movement growing inside Oregon is itself enough to turn the relationship Hostile ([[Rulings - Military#Military ruling 4]]).

Texas shows the more extreme version. Austin, Dallas, Houston, San Antonio and El Paso all claim the same Texas inheritance and therefore begin trapped at a Hostile minimum with one another ([[Rulings - Military#Military ruling 17]]). Austin is recognised as the legitimate continuation of Texas, while the other four are breakaway governments ([[Rulings - Military#Military ruling 19]]).

That is the role Hostility is intended to occupy in the setting: nations can damage one another, feed political trouble and make economic life harder for years without every dispute becoming a war.

## Interacts with

<!-- SEEDED:edges START - written once, yours to edit, never overwritten -->
<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->
- [[Economy]] - Deals already signed run their term; no new deal may be signed  <!-- BLOCKS, Round 2 ruling 18, docs/design/conquest-ideation.md:1293 -->
- [[Economy]] - What they charge to carry your goods goes up, and so does what they will accept  <!-- COSTS, Round 2 ruling 9, items 1 and 2, docs/design/conquest-ideation.md:873 -->
- [[Military]] - Guarding a hostile border costs money every quarter, forever  <!-- COSTS, Round 2 ruling 9 item 4, docs/design/conquest-ideation.md:873 -->
- [[Movements]] - Their movement grows faster inside you — and stops dead when the quarrel cools  <!-- FEEDS, Round 2 ruling 9 item 3 (:873), switched off at Wary by ruling 40 (:2561) -->
- [[Peace treaty]] - There is no treaty out of hostility — only time, or a war  <!-- BLOCKS, Round 2 ruling 21, docs/design/conquest-ideation.md:1504 -->
- [[Reunification contests]] - Thirty-three pairs of claimants are hostile on turn one and never cool  <!-- FEEDS, Round 2 ruling 17(d) (:1132), claimants named by ruling 32 (:2179) — 33 permanent pairs -->
- [[Unions]] - Checked before anything else: a hostile nation cannot agree to join you  <!-- BLOCKS, Round 3 ruling 17, docs/design/politics-ideation.md:1371 -->
- [[War]] - Hostility is where most of the board lives, and where wars are declared from  <!-- TRIGGERS, Round 2 ruling 7, docs/design/conquest-ideation.md:802-830 -->
<!-- SEEDED:edges END -->


## Questions for the designer

- **Generated source-status errors:** rulings 5, 17, 18, 19, 20, 21, 28, 37, 38, 39 and 40 are marked `SUPERSEDED` in this page's generated Sources table even though the ruling index says they remain live.
- **Wary has two incompatible descriptions:** ruling 39 says the acceptance multiplier replaces the proposed four scaled Hostile costs, while another source summary says material costs remain at a fraction. Decide which is authoritative.
- **Existing corridor rate:** Hostility raises transit costs, but the rules do not clearly say whether a fixed-rate corridor already under contract changes price mid-term or only on renewal.
- **Inherited-hostility event:** the source derives that alliance-inherited Hostility must fire once rather than re-trigger each turn. Confirm that derived requirement in the implementation spec.
- **Hostile and Wary durations:** both are tunables with no final number.
- **Wary acceptance penalty:** magnitude deliberately unset.

---

<!-- GENERATED:sources START - rewritten on every run, do not edit -->
## Sources

Every ruling that decides something on this page. The wording is each ruling's own.

| Ruling | What it says | Status |
|---|---|---|
| [[Rulings - Military#Military ruling 1]] | This is not a war game, and the arrows point the other way. | ruled, not built |
| [[Rulings - Military#Military ruling 2]] | A war is a standing state, and it is one of seven. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 4]] | what puts two nations into Hostile. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 5]] | a state is shared, not one-sided. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 7]] | every state has an exit, and three of the four are clocks. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 9]] | what Hostile costs. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 13]] | ground you take is yours immediately, but it is held under a flag, and there are three flags. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 17]] | a grudge fades on time, there is a sixth state between Hostile and Peace, and the reunification rivalries never fade at all. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 18]] | Hostile honours what is signed and permits nothing new. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 19]] | Austin is the legitimate Texas, and the other four are rebels. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 20]] | a corridor behaves under hostility exactly as a trade deal does. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 21]] | hostility is resolved by time and by diplomacy, never by a treaty. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 27]] | Allied is taken now and kept thin; Subject is deferred; and the soldiers you lend are a lever you set. | amended later · ruled, not built |
| [[Rulings - Military#Military ruling 28]] | breaking a peace treaty turns every neighbour but your allies hostile, at once. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 37]] | inherited hostility travels exactly one hop. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 38]] | an inherited quarrel slows the clock but never stops it, and it is the fastest-cooling hostility in the game. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 39]] | what Wary costs is a percentage multiplier on acceptance, and the figure belongs to the design stage. | **SUPERSEDED - do not state this as a rule** · ruled, not built |
| [[Rulings - Military#Military ruling 40]] | a Wary neighbour's movements do NOT grow faster inside you. Off, not reduced. | **SUPERSEDED - do not state this as a rule** · ruled, not built |

*18 rulings feed this page.*

*Generated by `build/build_wiki.py` from commit `65dd3ef` (2026-09-11).*
<!-- GENERATED:sources END -->
