# AUDIT-PLAN — M9 through M14

The execution plan for *The Union Audit* (independent game-design consulting review, 30 August
2026: Technical **86/100**, Design **82/100**, market grade **B — conditional**).

The audit ends with a roadmap and a set of prompts written to be handed to a programmer as-is. This
document does three things with it that the audit could not do for itself: it **re-verifies every
finding against the tree as it stands today**, it **renumbers and re-sequences** the milestones
where the dependency graph disagrees with the audit's ordering, and it turns each milestone into
tasks with **acceptance criteria this project can actually check** — measured numbers pinned in
tests, in the house style.

Companion documents: `docs/REBUILD-PLAN.md` (M0–M7), `docs/SHATTER-PLAN.md` (M8), `DESIGN.md` (the
model), `docs/DECISIONS.md` (D1–D141).

---

## 0. What changed between the audit and this plan

The audit was written against a tree of ~18,141 lines of JS and 785 tests. The tree today is
~19,000 lines and **825 tests green in 152 s**. Two things follow, and both matter before any of
its prompts are handed over.

### 0.1 The five high-severity findings all still hold

Re-checked line by line. Every one reproduces at its cited location; the line numbers below are
current, not the audit's.

| # | Finding | Where it is now | Status |
|---|---------|-----------------|--------|
| 1 | AI governments can never steal an election | `js/world.js:969` passes `asOf: turn + 1`; `js/elections.js:253` stamps `lostAt = asOf`; `js/elections.js:296` and `:347` compare against `World.getTurn()`, which still reads N inside the batch | **Confirmed.** `steal()` always returns "There is no result to refuse", and `pending()` has the same skew |
| 2 | Reach weakens armies in the preview only | `js/moves.js:207-208` folds `Projection.warMultiplier` into the previewed `forceMult`; `js/moves.js:260` builds `scoreMult` as `(1 + shell) * Military.warMultiplier(...)` — no projection term | **Confirmed, and worse in both directions**: the preview omits the `(1 + shell)` the resolver applies, and the resolver omits the reach term the preview shows |
| 3 | The 4× untouchable-neighbour rule exists only in the UI | `annex.strongNeighbourFactor` appears in `js/actions.js:744` (enforcement), `js/app.js:2000` (`TUNE.peek`, display only) and `js/tunables.js:791` (the definition). `js/moves.js` never reads it | **Confirmed.** The AI and every non-click caller play by a different rule |
| 4 | Action panels hide real costs | Unite, release and annex all render a price the resolver does not charge | **Confirmed** |
| 5 | Every action result is clobbered by the newspaper | Six sites in `js/actions.js` (104, 184, 590, 647, 718, 927, 1046) `flash()` a result and then call `completeTurn()`, which calls `newspaper()` at `js/app.js:1094`, which flashes again into the same single toast slot | **Confirmed.** The civil-war dice roll is painted for zero frames |

### 0.2 One second-tier finding is already fixed; one is worse than reported

- **Already fixed.** "`Game.serialize` hand-enumerates fields; the FIELDS registry iteration exists
  only in a test" — M8.1 closed this. `js/game.js:1719` now reads *"THE COLUMNS COME FROM THE FIELD
  REGISTRY (M8.1), not from a hand-written list here"*. Drop it from the sweep.
- **Worse than reported.** The duplicate `econ.occupationHostility` (`js/tunables.js:523` and
  `:538`) is not merely untidy. The two definitions carry **different values and different
  documentation** — `v: 1.6` with the full anti-snowball rationale, then `v: 1.0` with a one-line
  doc. The second wins in an object literal, so the shipped brake is 1.0 and the *argued* value of
  1.6 is dead text. This is a one-character-of-thought fix with a real balance consequence, and it
  belongs at the front of M9, not in a sweep at the back.
- Also worth a number: the `typeof X !== 'undefined'` guard count the audit put at "~40" is **~66
  across 22 files**, `js/world.js` alone carrying 12.

### 0.3 The menu shipped (D141)

The audit's M9 asks for an Objectives screen "reachable from the header at all times." The header
now has exactly one game-level door — an accent **Menu** button opening new game / save / load /
timeline / map editor (`js/menu.js`) — and that is where the Objectives screen goes. `?seed=` also
landed, which is the whole substrate for the daily-seed and challenge-run features §4 of the audit
calls "community features that cost you almost nothing."

---

## 1. Renumbering: the audit's M8 is taken

The audit numbered its roadmap M8–M13 "to continue your milestone scheme." M8 is the shattered
board and it shipped (`docs/SHATTER-PLAN.md`, D131–D140, `docs/PROGRESS.md`: *"M0–M8 complete"*).
Everything shifts by one:

| Audit | Here | Milestone |
|-------|------|-----------|
| M8 | **M9** | The seams |
| M9 | **M10** | The player who just arrived |
| M10 | **M11** | A world that trades back — and minds you winning |
| M11 | **M12** | The ground itself |
| M12 | **M13** | The human playtest program |
| M13 | **M14** | Going to market |

---

## 2. Four changes to the audit's ordering, and why

The audit's sequence is right in the large. Four adjustments, each argued from a dependency the
audit could see but did not price.

### 2.1 The rename is step zero, not a bullet inside M14

The audit calls the name *"commercially unusable"* and *"the cheapest, highest-return decision
available to you,"* then files it as the first bullet of a milestone running parallel to M11–M13.
That is the wrong shelf. A rename is a day of work and it gates **everything that leaves this
machine**: the Steam page, the dev-logs excerpted from `DESIGN.md`, the wishlist runway, the
Kickstarter, the publisher pitch. Every week it waits is a week the wishlist runway cannot start,
and the runway is 6–12 months long — it is the longest pole in the entire plan.

Do it before M9. It costs a day and it starts a clock that nothing else can start.

### 2.2 The Area re-bake moves out of M12 and up next to M9

The audit puts the deterministic Area re-bake in its M11 (here M12), reasoning: *"This invalidates
saves — which is why it happens in M12 and not after launch."* Correct conclusion, wrong milestone.
The argument for "before launch" is the same argument for "before everything," only weaker:

- It invalidates saves, and **M13 hands builds to five to ten humans who will make saves**.
- It touches `economy.json`, both map modes, every authored homeland and the save build-stamp.
  Every milestone between here and M12 adds content to at least two of those.
- The audit's own words: *"a data migration that gets more expensive every week you wait."* M12 is
  three to four months of waiting.

Split M12. The **re-bake goes into M9** as its own task, behind the seam fixes and in front of the
journal. The **per-Area stocks stay in M12**, where they belong — they are design work, not data
debt.

### 2.3 The victory alarm is a bug, and belongs in M9

The audit files "recalibrate the victory alarm" under onboarding, because a stranger meets it first.
But *"the victory alarm cried wolf from turn 1 — three nations 84% of the way"* is not a teaching
problem, it is the same class of defect as the other five: a surface reporting something the model
does not mean. It is cheap, it is verifiable in one line (*a fresh game produces zero alarms on turn
1*), and leaving it in M10 means three more weeks of every internal playthrough opening on a false
alarm. Move it to M9.

### 2.4 Split app.js before M10, not after

`js/app.js` is **2,406 lines** and the audit names it: *"a monolith renderer on the far side of an
otherwise clean model boundary."* It is not urgent on its own. It becomes urgent because M9 and M10
are about to add a docked journal, an Objectives screen, a "how to read this game" reference and
progressive disclosure to a sixteen-block panel — call it another 600–800 lines, all of it
rendering, all of it going into that file.

Split it once, at the M9/M10 boundary, along the seams that already exist in the file's own comment
structure: **boot**, **map render**, **panel render**, **turn flow**, **modals/screens**. No
behaviour change, no new tests, one commit. Doing it after M10 means moving twice as much code.

---

## 3. The milestones

Estimates are the audit's, adjusted for the re-sequencing. Every task assumes the project's existing
conventions continue: tests pinned to **measured** numbers rather than hopes, `Why` records on
anything the player is shown, a `DECISIONS.md` entry for anything argued.

### Step zero — The rename · ~1 day · DEFERRED

> **Status, 31 Aug 2026: deferred to a brand specialist.** `Nation States` remains the working title
> for internal development; the final name comes back from outside. The §2.1 argument is unchanged
> and unrefuted — the runway cannot start until the name does — so this is a *scheduling* decision,
> not a decision that the rename is unnecessary. Everything below still has to happen before
> anything public exists, and the M14 sequence (name → page → runway → beat → launch) still begins
> here. Engineering proceeds in parallel because none of M9–M13 depends on the name.

**Why it was step zero:** §2.1. Nothing public can happen under the current name, and the wishlist
runway is the longest pole in the plan.

- [ ] Choose a distinctive name. The test the audit implies: search it and own the first page.
      Max Barry's *NationStates* (2002, ~337K active nations, licensed commercially in 2008) owns
      every variant of the current one and supports a common-law mark in this exact category.
- [ ] Rename in `index.html`, `README.md`, `DESIGN.md`, `docs/`, the save `meta` block and the page
      title. The save format carries a name — bump nothing, but check the build stamp.
- [ ] Register the domain and the storefront handles before announcing.

**Acceptance:** the name appears nowhere in the repo, and a search for the new one returns this game.

---

### M9 — The seams · ~2 weeks · DONE

> Repair every confirmed gap between what the game shows and what it does. Nothing new; everything
> honest. A game whose whole identity is "it explains itself honestly" cannot ship dishonest
> previews.

**M9.1 — The duplicate tunable, first** (§0.2)
- [ ] Delete one `econ.occupationHostility`. Decide deliberately whether the brake is **1.0** or the
      documented **1.6** — this is a live balance change either way, so measure it: occupation
      upkeep and conquest reach over a 60-turn sim at both values, recorded in `DECISIONS.md` next
      to the number it justifies.
- [ ] Add a startup assertion (or a `tunables.test.js` case) that no key is defined twice. 298
      tunables in one literal will do this again otherwise.

**M9.2 — The election clock**
- [ ] `steal()` (`js/elections.js:296`) and `pending()` (`:347`) must read the same clock the stamp
      is written on. Thread `asOf` through, or stamp `lostAt` with `World.getTurn()`; pick one and
      make both call sites agree.
- [ ] Regression test that invokes `tick` **exactly as `js/world.js:969` does**, with `asOf` set.
      The existing test at `tests/elections.test.js` passes only because it omits `asOf` — that is
      the bug that hid the bug.
- **Acceptance:** in a 100-turn sim, at least one low-liberties AI government refuses a result.

**M9.3 — Preview and resolution, one expression**
- [ ] `resolveAnnex` applies `Projection.warMultiplier` to `scoreMult` exactly as `planAnnex`
      previews it, and the preview includes the `(1 + shell)` coalition term the resolver applies.
      The right fix is one shared expression called twice, not two expressions kept in step.
- [ ] Move the `annex.strongNeighbourFactor` check out of `Actions.startAnnex` into
      `Moves.planAnnex` and `Moves.legal`, so the human, the AI and the simulator share one rule.
- **Acceptance:** a test asserting previewed `forceMult` and resolved `scoreMult` come from the same
      expression, and that `Moves.legal` never emits a 4×-blocked target.

**M9.4 — Panels that render the plan they resolve**
- [ ] Unite shows `plan.cost` (8% of target GDP, charged on the attempt) and disables confirm when
      `!plan.ok`.
- [ ] Release shows the 10% settlement beside the savings.
- [ ] Annex prices through `Moves.annexCost` including the projection multiplier, so the shown cost
      equals the charged cost at the edge of reach — the case M7.11 made central, currently
      understated by up to 1.6×.
- **Acceptance:** for each of the three, a test that the number rendered equals the number charged.

**M9.5 — The victory alarm** (§2.3)
- [ ] Warn on **progress delta** (a nation that *moved* toward victory), or when the binding term is
      one an action can change. Never repeat the same nation/condition pair within N turns.
- **Acceptance:** a fresh game produces **zero** alarms on turn 1.

**M9.6 — The Area re-bake** (§2.2)
- [ ] Run the deterministic migration across `economy.json`, both map modes, every authored homeland
      and the save build-stamp. Bump the save version with an honest refusal message.
- [ ] `build/validate.py` back to 0 errors; the two known data-vintage warnings should be the ones
      the re-bake was supposed to clear — check whether they are.
- **Acceptance:** byte-identical output under two `PYTHONHASHSEED` values (the property the audit
      reproduced and this must not lose), and a v-previous save refused with a message that names
      why.

**M9.7 — The journal**
The largest piece in M9, and the one the audit calls the highest-leverage feature in the whole
roadmap: *"This single feature converts your best engineering (the explanation layer) into
retention."*
- [ ] Dock a scrolling, turn-grouped ledger panel into the game UI. The pattern already exists at
      `dev.html:242`; the ledger already carries everything it needs.
- [ ] `flash()` demoted to transient status only. An action's result entry — **including the
      civil-war dice** — is never overwritten by the newspaper. The newspaper becomes the journal's
      turn header.
- [ ] Filterable by kind. The ledger's `kind` field already exists and is already the achievement
      list M14 will want.
- **Acceptance:** perform an annex that triggers a civil war; the dice roll is still readable after
      the turn completes and after three further turns.

**M9.8 — The sweep**
- [ ] War weariness gets its own rise/fall limits. It currently inherits the shared `power.maxRise`
      / `power.maxFall`, which inverts the intended asymmetry (`maxFall > maxRise` is right for a
      stock that can collapse; weariness is a stock that should climb fast and ebb slowly).
- [ ] Migration's clamp conserves exactly. The current one-sided invariant test cannot see the case
      where the clamp creates people at the margin — make it two-sided.
- [ ] Loading a save **replaces** `TUNE` overrides rather than merging them.
- [ ] Remove the ~66 `typeof X !== 'undefined'` guards on modules that are unconditional
      `<script>` tags. A missing script should be a `ReferenceError` naming the file, not a silent
      behaviour change. (`js/menu.js` was written with none, deliberately; it is the pattern.)

**Status: complete.** All eight tasks landed; D142–D149 in `docs/DECISIONS.md`, the account in
`docs/PROGRESS.md`. The re-bake also cost seven test failures, none of them regressions and only two
of them re-pins — the other five were tests making claims their measurements could not support, and
fixing those is the durable half of the milestone.

**Exit:** all 825+ tests green, an action's result survives the turn, and every number a panel shows
is a number the resolver charges.

---

### M10 — The player who just arrived · ~3–4 weeks · DONE

> Onboarding, in your house style: **teach by explaining, not by tutorializing**. Nothing here is a
> pop-up that walks you through a click.

**M10.0 — Split `app.js`** (§2.4) — boot / map render / panel render / turn flow / screens. No
behaviour change, one commit, before the three tasks below add 600–800 lines to it.

**M10.1 — The Objectives screen**
- [ ] All three victory conditions, with the player's live per-term progress. `Victory.progress`
      already returns everything needed.
- [ ] Each term's plain-language meaning, and which condition the AI leaders are closest to.
- [ ] A "How to read this game" reference generated from the `TUNE` schema docs and the stock
      summaries: the two axes, the five stocks, the eight map modes, each in two sentences.
      Generated, not written — a hand-written copy goes stale on the first tuning pass.
- [ ] Lives in the menu (D141), which is already reachable at all times.
- **Acceptance:** a stranger can answer "what are my ways to win" without leaving the game.

**M10.2 — Progressive disclosure on the nation panel**
- [ ] Collapse each of the sixteen stat blocks to its headline — label, value, one-line summary —
      with the `Why` rows behind a click. Persist open/closed state.
- [ ] A "changed this turn" marker on any block whose value moved more than a threshold.
- **Acceptance:** a new player sees **six lines, not sixteen blocks**.

**M10.3 — Tooltips**
- [ ] Every map mode and every stock gets a two-sentence explanation on hover, from the same
      generated source as M10.1.

**Exit:** someone who has never seen the game can name their win conditions, read the panel without
scrolling, and say what the Pressure map is showing.

---

### M11 — A world that trades back, and minds you winning · ~4–6 weeks · DONE

> The milestone that turns two passive victories into played ones and the AI into an opponent on all
> three boards. This is the largest *design* milestone left, and the audit is explicit that the A
> grade lives on the far side of it.

**M11.1 — Trade as a Move**
- [ ] `Moves.planTrade` / `Moves.resolveTrade` wrapping the existing, already-tested trade rules.
- [ ] Trade candidates in `Moves.legal`; a scoring term in `AI.deliberate`.
- **Why it matters more than it looks:** `traded` is currently the only relations channel ordinary
      play generates, and **only the player can farm it** — at zero risk, for union odds and
      coalition exemptions the AI can never earn back.
- **Acceptance:** in a 60-turn sim, **AI–AI trade events outnumber player trades**.

**M11.2 — The two missing Influence verbs**
- [ ] **Treaties**: a standing pact object (non-aggression or trade compact), honoured or broken,
      feeding the relations ledger and an Influence term.
- [ ] **Aid**: a treasury transfer buying relations, recognition chance and an Influence term — and
      giving Ideological Dominance its missing active lever, since aid recipients drift toward the
      donor's ideology at a tunable rate.
- [ ] Both as Moves the AI can plan. Wire the two reserved Influence terms that are waiting on them.
- **Acceptance:** Ideological Dominance can be *advanced by an action*, not only waited out.

**M11.3 — The denial layer**
- [ ] `Coalitions.threat` gains a victory-proximity term (read `Victory.standings`; a nation over the
      warn bar counts as threatening **regardless of influence**). Today threat reads
      `size × (1 − influence)`, and both non-conquest victories keep influence high by construction —
      so no coalition ever forms against a nation that is quietly winning.
- [ ] `AI.deliberate` gains a **Deny** term scoring moves that reduce the leader's binding
      requirement.
- [ ] The AI's election-steal and military reads become real decisions: weigh `Military` posture
      before attacking; steal only when the `Why` record favours it.
- **Acceptance:** in a 60-turn sim where one nation pursues Ideological Dominance, at least one
      coalition forms against it and at least one AI takes a Deny-scored move.

**Exit:** the AI is an opponent on three boards instead of one, and the player's relations monopoly
is gone.

---

### M12 — The ground itself · ~4–5 weeks · DONE

> The project's own named next step, and the structural gap `DESIGN.md` §12 already calls #1: the
> per-nation stocks flatten regional grievance, and regional grievance is the game's whole fantasy.
> (The re-bake that used to live here moved to M9.6 — see §2.2.)

**M12.1 — Per-Area quality of life and civil liberties**
- [ ] `Float32` columns in the FIELDS registry, computed from the Area's own economy, garrison,
      autonomy and the nation's stocks. Rate-limited like everything else.
- [ ] Point sentiment's grievance terms and migration's pulls at the per-Area values.
- **Acceptance:** a nation with a rich coast and a poor interior shows a grievance gradient the
      Pressure map can paint — with a **measured spread** pinned in the suite, not an assertion that
      it is non-zero.

**Exit:** "the Rust Belt is angry while the coast thrives" is a sentence the model can produce.

---

### M13 — The human playtest program · ~6–8 weeks, mostly calendar · M13.1 DONE

> The milestone only you can run, and per the audit the single worst commercial risk if skipped:
> **21 of 298 tunables are measured against play.** This audience punished *Realpolitiks* (60%) and
> *Supreme Ruler* (Mixed) for exactly this, and a Mixed first-200-reviews launch is commercially
> unrecoverable for an unknown developer.

**M13.1 — The instrument** (~1 week)
- [ ] Telemetry export: one button writing the full ledger, the per-turn `Sim` series and the
      player's action history to a JSON the author can collect. The instrument already exists — the
      ledger *is* a telemetry system; it needs an export.
- [ ] Difficulty settings as `TUNE` override presets — opening treasury, AI act threshold,
      `sent.maxRise`, election swing — so pacing can be A/B'd **without builds**.

**M13.2 — Five to ten humans, three sessions each** (calendar)
The four questions that matter, verbatim from the audit:
1. When did you first feel behind?
2. What did you do on turn 25?
3. Did you see the secession coming?
4. Did you understand why you lost?

**M13.3 — Retune from the answers**
- [ ] **First secession earlier**, to ~t15–20. It currently lands t22–29 (t39–44 with AI on).
- [ ] **AI victory later.** A code comment records Delaware winning Ideological Dominance at **t30**
      — right as the secession game begins. Those two collide, and that collision *is* the pacing
      bug.
- [ ] Fill turns 10–35. The audit's largest design risk: one action per turn, cooldown-gated
      (annex 4, release 8, unite priced and clocked, govern behind a mandate), and the AI data reads
      one meaningful act per nation per ~12 turns. The crisis escalation arcs the events table is
      already shaped for are the intended filler.

**Acceptance:** the measured-tunable count moves decisively off 21/298, and every number that moved
carries the measurement that justified it in `DECISIONS.md`.

---

### M14 — Going to market · parallel with M11–M13

> Everything here is sequencing, and the sequence is: **name → page → wishlist runway → beat →
> launch.** The name already happened at step zero, which is what unblocks the rest.

- [ ] **Wrap for Steam.** Tauri (preferred, smaller) or Electron. `server.py`'s role is replaced by
      the wrapper's filesystem access behind the existing statedoc/`SaveManager` transport seam —
      a seam, not a rewrite. Wire Steamworks cloud saves and achievements; the ledger's event kinds
      are the achievement list. **The browser build stays the public demo** — it is the strongest
      conversion asset a small strategy campaign can have, and almost no solo dev has one before
      marketing begins.
- [ ] **Contract a capsule/UI artist**, $8–25K tier. The d3 map is fine; the frame around it sells
      the game.
- [ ] **Steam page + dev-logs excerpted from `DESIGN.md`.** The voice is already right for the
      depth-evangelist channel that sells this genre. Then **6–12 months of wishlists before
      launch** — which is why step zero is step zero.
- [ ] **Pitch publishers** on the Hooded Horse / Slitherine pattern, with the demo and the design
      doc. A niche publisher would absorb most of the $15–40K cash budget for a revenue share.
- [ ] **Kickstarter as a marketing beat, not funding.** $10–50K, mid-runway, demo linked, new name
      established. The realistic peer is Beyond Astra (€42K / 572 backers), not Terra Invicta
      ($216K on mod fame).
- [ ] **Launch** $14.99 Early Access → $19.99 at 1.0. Frame as **sandbox alt-history**; never market
      it as a 2024-election game.

---

## 4. The sequence, on one line

```
[rename: deferred] → M9 seams+re-bake+journal → split app.js → M10 onboarding → M11 world → M12 ground → M13 playtest
                     └───────────────── M14 market, blocked at its first step until the name lands ─────────────────┘
```

With the rename out of the critical path, engineering runs uninterrupted from M9 — but **M14 is
blocked, not parallel**, until the name arrives. The runway clock has not started.

Calendar, at the audit's estimates plus the re-sequencing: **~5 months of work**, and M14's wishlist
runway runs 6–12 months from the rename. Those overlap, which is the point of putting the rename
first.

## 5. What the audit says not to do

Recorded here because a plan is also a list of what it refuses:

- **No unit counters.** The one-number military is a feature.
- **No second map.** The single scenario is fine for launch if seeds and difficulty carry variety —
  and `?seed=` now exists to carry it.
- **No multiplayer.**
- **No softening the political theming into mush.** It is the hook. Handle it with framing — sandbox
  alt-history, systems not personalities — not by retreating from it.

## 6. What would change this plan

- **A human playtest that says turns 10–35 are fine.** M13's finding would retire the audit's single
  largest design risk and would let M11 shrink to trade + denial, dropping the two Influence verbs.
- **A publisher signing early.** M14's art and audio budget stops being the constraint, and the
  wishlist runway gets run by someone whose job it is.
- **The re-bake turning out to be bigger than a task.** M9.6 is scoped as a migration. If it is a
  redesign, it goes back to being its own milestone — but it still goes *before* anyone else holds
  a save.
- **Any evidence that the five seam fixes are not a day each.** The audit's claim that they are is
  founded on the architecture routing everything through few doors. §0.1 confirms the doors; if a
  fix sprawls, that is news about the architecture and worth a `DECISIONS.md` entry of its own.
