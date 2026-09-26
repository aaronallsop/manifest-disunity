# Deferred

Known defects and gaps that do not block the current work. Numbered so they can be referred to.
Move an item to `DECISIONS.md` when it is fixed or deliberately closed.

| # | What | Why it is deferred | Noticed |
|---|------|--------------------|---------|
| 1 | ~~Economy mode left the recognition trade block active while hiding the screen that explained it.~~ **FIXED 2026-09-05.** A switched-off system no longer charges for itself: recognition returns the permissive answer when the politics layer is off. See D166 — the fix is not the one spec v2 asked for, because its premise was a misreading of DESIGN.md. | — | Closed |
| 2 | ~~The single-step control desynchronised the two turn counters.~~ **FIXED 2026-09-05 (A0).** The dev step now goes through the same path End turn takes, and fast-forward N stops the moment a round needs the player. Pinned by a test that also keeps the old shortcut pinned as the defect. Simulator re-entrancy is now refused with a clear error. **Still open, split out as #6:** running the simulator over a live world replaces it. | — | Closed |
| 6 | Running the headless simulator from a page that holds a live world replaces that world (the simulator resets the shared singletons). Only the dashboard can run it, and the dashboard's world IS the last run, so nothing a player cares about is lost today — but a snapshot/restore around a run would let a run be re-done without losing a world being inspected. The adversarial plan for it found a trap: per-Area attributes merge rather than replace on load, so autonomy grants would leak through a naive restore. | Addendum A puts this with the balance instruments, after alpha. Not needed to test trade. | 2026-09-05 |
| 3 | ~~Tuning edits are silently discarded whenever a game is in progress; the dashboard displays schema defaults rather than the values the game is running.~~ **FIXED, both halves, closed with evidence 2026-09-05.** The save half: A0's three layers mean a save records only what was deliberately changed away from the shipped game, so re-authoring a number reaches a game already in progress while a deliberate override still beats a later edit. Pinned by seven tests in `tests/tuning-layers.test.js`, whose header states the original defect in as many words. The dashboard half: `dev.html` loads `content/tunables.json` and layers it over the schema before building a single slider, with a comment naming the exact lie it used to tell — "any authored value was displayed as one number and simulated as another". Both verified green in the full 953-test run of 5 September. | — | Closed |
| 4 | ~~The dashboard fix was never loaded in a browser.~~ **VERIFIED 2026-09-05.** The dashboard opens and completed a 50-turn run in 22.0 seconds with no error. | — | Closed |
| 7 | ~~The trade map can say "the agreement ran out" about a broken link, and never will.~~ **FIXED 2026-09-05, and it was not cosmetic after all.** The missing cause was the wrong half: `live()` returns nothing for a grant that expired AND for one that was closed, so `blockedAt` reported both as `revoked` — and the player was told "they closed the border" about a corridor whose term had simply ended. That is an accusation, and it was sometimes false. A record that still exists, was never ended, and has no turns left now reports `expired`, which is the sentence the map has carried since it was written and could never reach. Pinned by a test that runs the term out without anybody serving notice. | — | Closed |
| 8 | A trade deal can be split on price in the model — `priceMult` exists, is validated against min/max tunables (0.8–1.2), and moves gain between seller and buyer without changing the total — but **no screen anywhere sets it.** Every caller passes 1 or copies an existing value. So the one lever that would let a strong seller squeeze a desperate buyer is built, tested and unreachable. **This is the clearest next stage of the economy alpha and it is NOT a defect fix — it is the unmet Phase 3 checkpoint, in as many words: "a buyer with no alternative pays visibly more than one with three."** Design sketched 5 Sep: the missing piece is not the slider, it is ALTERNATIVES. Today `dealVerdict` weighs only what a deal is worth as a share of a turn's income, so a partner with no other supplier behaves exactly like one with three; price already moves that figure, but nothing represents scarcity. It needs (a) a count, per sector, of how many other nations the target could plausibly buy the same thing from and reach, (b) a leverage term derived from it, (c) a counter that can move the price and not only the term, (d) the control itself. **The trap is (a):** a naive count is a surplus lookup across ~60 nations per plan, and the AI runs ~735 plans a round — it must be computed once a turn and cached against the same key the corridor graph uses, or it will dwarf everything else. Deliberately not started on the night of 5 Sep, with a performance question still open and no measurement that settles how hard a squeeze should feel. | Wants Aaron's eye on the feel, and the open turn-cost question closed first. | 2026-09-05, by the A3 mapping agent |
| 9 | ~~There is no inbox for corridor requests.~~ **FIXED 2026-09-05.** Corridor requests now appear on the "On the table" tab above the trade offers, under their own heading, with who is asking, by what, whether they have another way out, the cut, the term and the countdown — and Let-them-through / No buttons that go through the same model call the end-of-round card makes. The tab's count includes them, because both are things waiting on an answer. Verified in play: an offer arrives, renders, and granting it creates the corridor and empties the inbox. | — | Closed |
| 10 | `enteredBy` on the route-search state in `js/transit.js` is written in two places and read in none. Dead field. | Trivial. Remove when transit.js is next edited for a real reason. | 2026-09-05, by the A2b mapping agent |
| 5 | ~~100-turn headless timing is unmeasured, and the per-turn cost may grow with run length.~~ **MEASURED 2026-09-05, and the superlinear worry is REFUTED.** Cost per round *falls* as a game lengthens: 650ms over turns 1–25, peaking at 753ms over 26–50, then 685 → 622 → 593 → 568 → 515ms across the ten-turn windows to turn 100. It tracks the number of surviving nations, not the turn number — nations consolidate, so there is less to plan. A hundred turns totals **48.8 seconds on a quiet machine**, against the 60-second target — it PASSES. (A first pass measured 65s and said the target was missed; that was taken with four browser tabs competing for the processor. An interleaved A/B found single-pass figures swinging 30–40% with machine load, so any timing here must be taken with nothing else running. 484 → 540 → 494 → 434 ms per round across the four quarters.) The original "two runs unfinished in ten minutes" was a measurement artefact: `dev.html` auto-runs 50 turns on load and `Sim.run` is not re-entrant, so a second run throws instead of queueing, and a tool call that times out abandons its run while the page keeps going. **The regression question is settled: NO.** An interleaved head-to-head with identical worlds, 9 repetitions each, gave medians of 459ms for `stage/a4` (before 5 Sep), 441ms for M8 `3bda355` (where the 137.5ms figure was written), and **398ms for current master** — the new build has the lowest median of the three. The suspected culprit is exonerated by direct count: `Transit.offersFor` returns zero offers across all nations in a live round, so the changed branch is never entered, and all transit planning together is 1.1% of a round. The old 83ms/137.5ms figures are not comparable — 137.5ms was the INTACT 51-state board, its own shattered comparator in the same comment is 187.3ms, and checking out that exact commit and re-running its own measurement here gives 364–441ms. The recorded figure describes a different machine, not faster code. | — | Closed |
| 11 | Trade offers arrive from nations the player cannot reach, and look identical on screen to the ones he can. Found in play 6 September. The offer is legitimately created — an AI plans from ITS side, and reach is directional, because a corridor grant is keyed grantor-to-grantee. So the AI can reach the player while the player cannot reach the AI, and the offer can never be signed. On the deals screen the only difference is that the pay cell reads an em-dash and the Sign button is greyed, with the reason hidden in a tooltip. Aaron's own verdict is that the information is worth having — it tells him where a corridor would pay — but it must be told apart at a glance. | Not a bug in the model; a presentation problem with a real signal underneath. Group them under their own heading rather than hiding them. | 2026-09-06, found in play |
| 12 | Canada, Mexico and the world market still use the pre-A1 model. An external sale is a one-off click that pays once, banks the money immediately and uses the turn — no term, no fixed price, no expiry, no renegotiation, no row on the deals screen, no settlement phase, and a cooldown that bilateral trade retired. Aaron asked on 6 September for them to move onto the deal system. Investigated the same day; the blocking work is known: a deal whose counterparty is not a real nation is VOIDED on the first world tick, several places assume the deal's first party is the proposer, the route-block check assumes it can hold corridor grants, recognition refuses outright, and trade capacity silently collapses to the landlocked floor. The deeper gap is that the external side has no demand vector at all — nothing says what the world market WANTS. | Sizeable, and it wants the resource redesign settled first, since what an external market demands is exactly what that redesign is about. | 2026-09-06, Aaron in play |
| 13 | `DESIGN.md` says twice that treaties and aid do not exist — §4.1 ("neither mechanic exists: there is no treaty object and no transfer of money between nations") and §12 ("No treaties and no aid"). Both are built: M11.2 added a non-aggression pact as a move with a cooldown and a minimum standing, aid as a move that transfers a share of the donor's treasury and buys patronage, and three relation kinds for them (`treatied`, `aided`, `reneged`). The AI scores both. The design document is behind the code on a point it states as a deliberate absence, which is the one kind of staleness §12 exists to prevent. Found 6 September by the design session while reading the relations vocabulary; not fixed because the design session does not edit `DESIGN.md`. | Documentation only; nothing in play is wrong. Correct §4.1 and §12 in the next programming session, and check whether Influence's "treaties honoured and broken" and "aid given" terms were wired when the mechanics landed. | 2026-09-06, design session |
| 14 | **A nation is charged three times over for its own founding movement.** The three places that read a movement's strength all take the LARGEST movement share in an Area with no check on whose movement it is: `Sentiment.pressure` (js/sentiment.js:416), which `AI.strain` (js/ai.js:46) maxes across a nation's own ground, and `Game.hostility` (js/game.js:1589), which multiplies occupation upkeep. So Deseret — holding the corridor its own movement organised — reads its heartland as maximum strain and plays permanently defensive via `ai.strainPosture`; the pressure map paints that heartland as its worst problem, which is what Aaron saw in play; and if it takes the corridor Areas that did not cede, it pays a hostility surcharge for occupying people loyal to it. The same applies to every nation founded by a movement. **The fix is one predicate — a movement whose `nation` is the holder is loyalty, not pressure** — but it is three call sites and it changes AI posture, the map and the treasury, so it wants measuring rather than patching. Aaron's ruling 16 in `docs/design/secession-ideation.md`. | Found in play; the design round owns the rule and the programming session owns the change. Not urgent for the economy alpha, where movements are switched off. | 2026-09-07, Aaron in play + verified by the design session |
| 15 | `README.md` says the test suite is "written so the same files run under `node --test` unchanged if Node ever appears on this machine." Node 24.19.0 is on this machine and they do not: `node --test tests/` fails immediately with MODULE_NOT_FOUND before a single test runs, because the suites are plain browser scripts that expect globals (`window.TUNE`, `Game`, …) rather than ES module imports. The documented browser path works exactly as described — `python server.py`, then `tests/run.html` — and gave **956 green across 51 files in 335.9s on 8 September 2026**. Only the Node claim is false. | Documentation only; the browser path is the real one and it works. Found by the design session, which does not edit `README.md`. Correct the sentence in the next programming session, or make the claim true. | 2026-09-08, design session |

## 16 — Military base data has not been pulled

**Raised 9 September 2026 by ruling 31 of round 2 (conquest ideation).** The design now depends on
three kinds of military base existing on the map — Army (manpower), Air Force (attack), Naval (coastal
attack, and trade through ports). **No base data exists in `data/` and none has been sourced.**

**This is a programming-session task, not a design one**, which is why it was recorded rather than
done: a design session does not write to `data/` or `build/`.

**What it needs:** installation name, branch, county FIPS, and a size figure (personnel or acreage) so
the bonus can scale. All of it from public federal sources — the Department of Defense publishes
installation locations and branches itself. **Nothing about capability, stockpiles or readiness is
needed or wanted.**

**One decision to take before the bake:** the services outnumber the three types. Proposed default,
recorded in the round document as C123's neighbour — Marine Corps → Army, Coast Guard → Naval, Space
Force → Air Force, joint bases by dominant function.

**Blocks:** nothing yet. The rulings that depend on it are design, not build.

---

# The design wiki — 17 to 29

**All raised by the sign-off review of 14 September 2026**, which put 57 findings against this
session's own work and confirmed 45 of them. Nine were fixed before sign-off (D211 names them);
these are the rest. **None of them makes the wiki say something false to a reader** — that class was
fixed. These are staleness, duplication, and drawing defects.

## 17 — The writer's copy still carries 94 false "SUPERSEDED" stamps

`docs/wiki_new/` was generated before the supersession check was fixed, so its Sources tables retire
94 rulings that are live. The corrected generator reduces that to 11. **Repairing it is one command**
— `python build/build_wiki.py --out docs/wiki_new` — and it rewrites only the machine-owned blocks.
**Not done this session on purpose:** the "At a glance" block moved inside a generated block on the
same day, and on a page that predates that change the generator appends it at the foot rather than
putting it back where it belongs. Merge the writer's work first, or accept one ugly block per page.

## 18 — Three figures on a movement page are a second home for a fact

`build/wiki_movements.json` carries `cap_today`, `old_ideology` and `goal`, all of which are read
live from `data/parties.json` a few lines away in the same function. The charter says a fact has one
home. Read all three from the parties record instead and delete the columns.

## 19 — Area counts on movement pages are hand-typed

`homeland_areas` and `core_areas` came from the Movement Register by hand. They are exactly derivable
from `data/parties.json` plus `data/areas.json`. Derive them.

## 20 — Forty-eight "not built" notes claim a measurement they no longer make

Each says the code was checked "this run". They were authored on 12 September and frozen into
`build/wiki_rulings.json`. Stamp the file with the date they were taken and print that date instead.

## 21 — Reciprocal links overlap on the systems map ring

36 of 139 chords are drawn on top of their opposite number, so one direction of every reciprocal pair
is invisible. Bow the two directions apart by offsetting the control point perpendicular to the chord.

## 22 — Node sizing on the ring is saturated

Eight of eleven systems draw at the same radius, so size carries no information. Scale against the
largest degree rather than a fixed ceiling.

## 23 — Seven node captions overlap their own circle; two are unreadable

The caption sits at a fixed radius that the larger circles now reach. Place it clear of the circle's
own radius, allowing for the second caption line drawn back toward the centre.

## 24 — Ticking "include movements and positions" collapses the chords to hairlines

Widths divide by the single largest chord, and the detail view creates one much larger than the rest.
Use a scale that does not depend on the maximum alone.

## 25 — The provenance stamp on a page can never update

It sits outside a generated block on fifteen pages, so it freezes at the commit that created the page.
Either regenerate it like the frontmatter, or drop it from pages entirely and keep it only in the
build report, which is rewritten whole every run.

## 26 — The secession line is a literal in the generator

`build_wiki.py` prints "an Area leaves at 0.40" as a hard-coded number while naming the tunable it
comes from. Read it out of `js/tunables.js` so a change to the game cannot silently make the wiki lie.

## 27 — Ten ideology pages say no closed round decided them

They say "Decided in: no closed round yet" while their own content rests on politics rulings 1 and 2.
Assign those two rulings to the ten position pages in `build/wiki_rulings.json`.

## 28 — Two seeded link clauses are wrong

The Federation→Economy clause states a toll its own cited ruling halves, and one citation points at
`politics-ideation.md:2296` when the span it means is 2284–2294. Both are in `build/wiki_edges.json`
and both are one-line text edits.

## 29 — The ring and the grid cannot be driven from the keyboard

The systems map is mouse-only. The SVG needs a focusable role, the nodes need tab stops and Enter/Space
handling, and the grid cells the same.

## 30 — Two programmer rules are both numbered 11

`docs/PROGRAMMER-RULES.md` has a rule 11 about stale counts and a second rule 11 about summing across
overlapping sets. **Both references to "rule 11" in the 11 September handoff mean the second one**, so
renumbering that one would break them, and renumbering the first to `11a` would leave the file reading
`11a` before `11`.

Not fixed here because the choice is a convention call on a file this session did not otherwise touch,
and neither option is obviously right. **The cheapest fix is probably to leave the referenced rule as
11 and move the stale-count rule to the end of the list under a fresh number**, since the list is only
loosely chronological. One edit, no broken references.

Found 14 September 2026 while adding rule 14.

**⚠ AND THE EVIDENCE NOW POINTS BOTH WAYS — added 24 September.** *At the consolidated sign-off, the
session that wrote the FIRST rule 11 (stale counts) reported that it is cited by number in its 11 September
commit message, and proposed the opposite fix: keep the first as 11 and move the SECOND (overlapping sets)
to a fresh number.* **This entry says the 11 September handoff cites the second.** *Both can be true — a
handoff and a commit message are both permanent — so either renumbering breaks one citation.* **The
fix that breaks nothing is to leave both numbers alone and add a note under each saying which is which,
e.g. "11 (stale counts)" and "11 (overlapping sets)".** *Not done here: it is a convention call that
should be made once, deliberately.*

## 31 — The wiki's economy page now states something false

`docs/wiki/Economy.md` says, in a generated block, *"Nothing here yet. This system has not had its
design round."* **Round 4 closed on 14 September at 21:06**, so that is untrue as of that moment.

The generator reads only the rounds named in `build/wiki_rulings.json`, and economy is not one of
them. Fixing it is **adding the round to that file, mapping its nine rulings to pages, and re-running
the generator** — about an hour, and it is the first thing the next session should do. Recorded here
rather than left implicit **because a wiki stating something false is the exact class of defect that
cost this project its worst day.**

## 32 — `resource-map.html` renders as mojibake when opened from the local server

The Sector Wiring page carries no `<meta charset>` of its own, because an artifact file must not
declare its own `<head>` — the platform supplies one when it publishes. **So the published page is
correct and this affects only the local file** served by `server.py`, where em-dashes and ellipses
come out as `â€"`.

Not fixed because the fix is not available inside the file. If local viewing ever matters, the answer
is a charset header from `server.py`, not an edit to the page. Found 14 September while taking the
look at the rendered page that should have happened before the first publish.

## 33 — Three opening-board facts are specified by rulings and not built, and two rulings now depend on them

**Found and scheduled 14 September 2026 across rounds 5 and 7.** All three are changes to the
scenario's authored content, not to code, and **Aaron scheduled them for after the alpha test**
(round 5 ruling 8). Recorded here so a build session finds them without reading three design
documents.

⚠ **UPDATED 15 September 2026: item 1 is no longer deferred, and a fourth has joined the list.**
Diplomacy ruling 8 was **superseded by D222** — it scheduled Austin's rebel board for after the alpha
on the reasoning that changing Texas while people test the economy makes a bad result unattributable,
and **the alpha now carries mission trees with Texas as one of the three.** Items 2 and 3 stand.

1. ~~**Conquest ruling 19 — Austin is the legitimate Texas and the other four open unrecognised.**~~
   ✅ **BROUGHT FORWARD INTO THE ALPHA, D222, 15 September 2026.** Austin holds the signature each of
   the four rebels needs and the four-way auction becomes live. **It also closed diplomacy finding I
   for free** — Deseret gains four nations it can recognise, so the one pariah on the board stops
   having no diplomatic move at all. *Still a scenario content change and still unbuilt; what changed
   is when.*
2. **The federal remnant recognises nobody.** Same mechanism, same absence — D.C. is an opening nation
   and therefore recognises everybody. *This is round 5's in-tray item 4, which that round's
   adversarial review recovered after it had been dropped from the scoreboard.*
3. **The remnant is D.C. alone.** The story has it as Washington plus its martial-law ring, plus the
   rest of Virginia, plus the Baltimore region. **On the board it is one small nation of 702,250
   people.**

4. **⚠ NEW, 15 September 2026 — Deseret opens recognised by its neighbours and not by Utah.** Ruled in
   **D227** because transit requires mutual recognition and **Deseret has no port, no ocean coast and
   no border crossing in any of its 57 corridor Areas** — so a pariah that needs a corridor to do
   anything at all cannot be granted one. Verified before ruling: its neighbours are small enough that
   even all six signing leaves `legitimacy` **under 0.15**, the smuggler's-rate band, **so the pariah
   story survives and only the dead end goes.** Utah is excluded deliberately — the parent's signature
   moves the continent's per-turn chance from **0.070 to 0.181** and is the most measured piece of
   drama in the game. *Same file, same class of change as item 1.*

⚠ **Round 7's ruling 2 — that playing the remnant is a different game — depends on (2) and (3).** So
these are no longer only colour; a ruling rests on them.

**And the wider point, which is programmer rule 17:** the story's board has **twenty-nine** new
nations and the game's has **twelve** — Texas's five, California's six and Deseret. The Deep South,
Appalachia, the Gulf nation, the city-states and all stateless ground are a design and are not built.
Four closed rounds had been quoting them as though they were the game.

---

# Found by writing the design documents — 34 to 36

*All three are **live code defects**, not documentation drift. Each was verified at the source this
session, by grep, before it was written down.*

## 34 — ⚠ The civil war's "the aggressor bleeds" branch is dead, and the victims pay the attacker

**`js/moves.js:1198` tests for an outcome called `collapse`. `js/civilwar.js:164` only ever returns
`victory`, `partial` or `fall_apart`.** *The string `collapse` is produced nowhere in `js/`, `tests/`
or `dist/playtest/`.*

**So on a fall-apart the guard is false and execution falls through to `js/moves.js:1207`**, which
walks the victims and charges each of them, paying the aggressor. **And it charges the FULL score,
not the halved share**, because the halving is keyed to `partial`.

> **That is the exact bug the dead branch's own comment says was fixed:** *"charging the victims for it
> — which is what this did until M6.3, because the branch was written once for the winning cases and
> reused — **paid the loser's bill to the winner and handed the defender a population loss for
> successfully defending.**"*

**It also contradicts `DESIGN.md` in writing:** *"if none is large enough to stand alone the defender
holds and **you paid for nothing**."* **You are paid.**

**Present in `dist/playtest/js/moves.js:671` as well**, so the playtest build has it too.

**The fix is one string.** *Whether it is `fall_apart` alone or also the no-viable-fragment case is a
design question, so it is filed rather than fixed.*

## 35 — ⚠ A nation born in play has no government, and cannot win on ideology

**Only five lines write a ruling ideology** — the save-load pass-through, `refreshGovernments`,
`changeRulingIdeology` (elections and appeasement), the scenario, and **the tier-2 declaration.**
*Verified by grep this session.*

**The generic birth path passes a plain string, so the government comes out with a null ruling
ideology** — and **`refreshGovernments`, which exists for exactly this case, never runs during a
turn.** *Its call sites are setup, movement spawn, and save-load. Its own header says what is left of
it is "the founding case", and the founding case is the one the per-turn loop never reaches.*

**Consequence, traced:** a null ideology indexes to −1, the victory term guards on ≥ 0, **so
Ideological Dominance scores 0 forever** for every nation born by civil war, failed union or release —
**until the game is saved and reloaded**, at which point the load path backfills it. *So the victory
condition depends on whether you saved.*

**Second consequence:** the flag's accent is drawn from the ruling ideology and **falls back to grey**,
so these nations are silently a different visual class.

**The right answer is already computed and thrown away:** the dominant ideology of the founding ground
is worked out and used only to pick a name template. *Its own comment says what it was for — **"a new
nation governs as its people do."***

## 36 — ⚠ Only one of the five birth routes gives a nation a birth

**`applyIndependence` — the honeymoon Authority term and the transition GDP cut — is called from
exactly one place in the game.** *Verified by grep: one call site, one definition, one comment.*

**So a country born out of a civil war, a failed union or a release gets no honeymoon and pays no
transition cost.** *The honeymoon exists because **a nation founded this turn has no age, no tenure and
no reserves, so every other Authority term reads zero** — which is equally true on all five routes.*

> **This is the contradiction round 1 wrote one sentence to prevent:** *"a civil war that goes badly
> and a movement that declares must produce **the same kind of country, with the same birth**, because
> they already share the machinery and **must not grow apart**."*

**Four more rows of the same table disagree** — recognition at birth, whether a memory is written, the
viability test, and whether the nation is labelled what it is. *The full side-by-side is
`docs/design/nation-design.md` §3.*

**⚠ Not filed as a straight fix.** *One of the four — release being recognised by its parent on day one
— is **deliberate and well argued** (*"letting go is recognition"*). **So the question is which
differences are design and which are drift, and that is Aaron's.** `nation-design.md` open question 1.*

## 37 — ⚠ `aid.recognitionBoost` is a dead tunable, and its doc string promises the game's only escape hatch

**Defined in the tuning file at 0.25. Read by no code.** *Verified by grep across `js/` and `tests/`
this session: the only occurrence is its own definition.*

**Its own doc string says what it is for:**

> *"Added to the recipient's per-turn chance of recognising the donor, scaled by patron weight. **Aid is
> how an unrecognised state buys its way onto the map, which is the one route out of the recognition
> trap that does not involve winning a war.**"*

**The recognition chance has five terms — standing, kinship, endurance, weight, and whether the parent
has let go — and aid is not one of them.**

**It half-works by accident.** *A gift writes an `aided` memory at +0.30, which feeds Standing, which
**is** a term at weight 0.45.* **So the route exists sideways, through a path nobody documented, at a
fraction of the advertised strength.**

> **⚠ This is the most dangerous class of gap in the project, because a tunable with a doc string looks
> implemented.** *Aaron can move the slider and watch nothing happen.*

**Either wire it or delete it.** *The standing rule is that every number the model uses is a named
tunable; the converse — that every named tunable is a number the model uses — is the half nobody wrote
down, and this is the case that proves it is needed.*

## 38 — ⚠ One relations memory kind has no label, so the raw key reaches the player

**Fifteen kinds; fourteen labels.** *`revoked` — somebody closed a corridor your economy runs through —
is in the kinds table and missing from the labels table. `labelOf` falls through to the key itself.*

**So the sentence the player reads is:** *"Cold: **revoked**, 3 turns ago."*

**Every other kind reads as English** — *"took our ground", "swallowed a nation whole", "tore up a pact
they had signed with us".* **Verified by reading both tables this session.**

*One line. It is filed rather than fixed because a design session writes documents only.*

## 39 — ⚠ Four real ocean ports are flagged as inland, and four nations lose their foreign trade

*⚠ 24 September 2026 (D267): Aaron approved fixing the four on the Control Board on 15 September, with no
note — the recommendation as written. Not yet done; it lands in M5 on the road (D264), before any trade number is tuned.*

**`has_port` and `coastal` are baked as separate flags in `data/county_trade.json`, and where a port
county's polygon does not meet the coastline layer the port is demoted to "reaches no external sink."**

**Four of the 59 "river/inland" ports are real deep-water ocean ports** — *verified individually this
session:* **Philadelphia County PA** (the Port of Philadelphia), **Berkeley County SC** (Charleston's
port district), **Chesapeake city VA** (Hampton Roads) and **Providence County RI** (the Port of
Providence). *All four are `has_port: true, coastal: false`.*

**Consequence: Pennsylvania, South Carolina, Virginia and Rhode Island cannot sell abroad** through
ports that are among the busiest on the eastern seaboard.

**And it means the project has been quoting a data fault as geography.** *"59 of the 136 ports reach no
foreign market" is repeated as a fact about the map. **How many of the 59 are genuinely inland and how
many are misclassified has never been asked.***

**⚠ NOT a quiet repair.** *The port count feeds `tradeCapacity`, the volume limit on every standing
trade deal in the game, so fixing the flags moves a number every deal reads.* **It is a decision, not
a bug fix.** *Also in the 59 and worth a second look: Hudson County NJ, Oakland and Richmond CA, and
the Columbia River ports in Washington and Oregon.*

## 40 — ⚠ Ten nations hold a port they cannot export through, and nobody had counted them

**Measured this session** by reconstructing the 61-nation board and testing every county against
`data/county_trade.json`:

| | |
|---|---:|
| No port **and** no border crossing — *the figure every document quotes, and it is correct* | **14** |
| No port of any kind | **22** |
| **⚠ Cannot reach the world market from their own ground** — *never counted before* | **24** |

**The gap between 14 and 24 is ten nations that HOLD A PORT and cannot export through it:** *Arkansas,
Kentucky, Missouri, Northern California, Oklahoma, Pennsylvania, Rhode Island, South Carolina,
Tennessee and Virginia.* **Their port is on their panel, its capacity is multiplied into every deal
they sign, and it reaches no foreign market.**

> **This is the project's own named failure mode, word for word:** *a layer the player has not learned
> yet must be **INVISIBLE or SELF-EXPLAINING**, never **VISIBLE AND WRONG**.*

**Four of the ten are there because of defect 39 rather than because of geography.**

## 41 — ⚠ TWO transit toll systems are live in the build at once, and they price the modes in opposite directions

**Both are reachable from the same panel, and that part is deliberate** — *"the difference between
renting a lift this quarter and holding the road open for five years is exactly the thing the player is
being asked to weigh."* **What is not deliberate is that they disagree about which mode is dear.**

| | **The legacy one-off sale** | **The standing corridor grant** |
|---|---|---|
| Mode adjustment | rail −50%, highway −20% → **rail is CHEAPEST** | port ×1.0, river ×0.95, rail ×0.85, road ×0.75 → **road is cheapest, PORT is DEAREST** |
| Term | none — one click, uses the turn | a menu, a notice period, a renege memory |
| Slider bounds | **hardcoded in the markup** | reads the tunables |

**`trade.railDiscount` and `trade.highwayDiscount` are read ONLY by the legacy path**, so turning
either dial moves one system and not the other.

**⚠ Neither `DESIGN.md` §6.7 nor `docs/design/board-design.md` §8 describes the legacy path at all.**
*Both document only the grant.*

> **So the project's "three unreconciled internal-trade regimes" is FIVE:** *the corridor grant · the
> legacy one-off sale · the spec's compounding per-mode multipliers · the federation's flat toll · the
> bloc's free movement.* **`blocs-design.md` and `trade-design.md` both name the job and neither knew
> there were two systems inside the build.**

## 42 — ⚠ `mil.suppressLiberty` is a dead key, and a design document cited it as live

**Defined and documented in the tuning file as *"THE PRICE OF HOLDING PEOPLE DOWN, and the reason
suppression is a trade rather than a free answer to secession."* Read by no code.** *Verified by grep
across `js/` and `tests/` this session.*

**The liberty cost of a garrison is carried entirely by `liberty.wGarrison` at −0.35.** *One term, not
two.*

**`docs/design/governing-design.md` cited it twice as live** — once in a table describing a two-term
mechanism — **and has been corrected in the same commit that filed this.**

**Same class as defect 37**: a tunable with a doc string looks implemented, so Aaron can move the
slider and watch nothing happen.

## 43 — ⚠ The AI's five army-allocation weights are literals in code

**`0.15, 0.55, 0.15, 0.45, 0.1`**, deciding how every AI nation splits its force between garrison,
border and field.

**Against the project's standing rule:** *"Every number the model uses is a named tunable in the tuning
file, never a literal in code. **Aaron must be able to change a value, reload, and see the effect
without a rebuild and without you.**"*

**⚠ And the code's own comment claims otherwise** — it says *"none of them is a new tunable"*, which is
true of the **inputs** it reads and false of the **five weights** it multiplies them by.

**Consequence: AI posture is the one part of the model Aaron cannot tune.** *He can change what a
garrison is worth, what it costs and how fast it arrives — and not how readily sixty nations reach for
one.*

---

## 44 — ⚠ Deseret opens with the wrong politics, and Aaron said so himself

**Found by the tone interview, 15 September 2026** — not by reading code, which is why it had survived.

**`DESIGN.md` line 106 opens Deseret as `yellow` — Conservative Nationalist.** **Aaron:** *it "should
be modeled as a distributism christian state."*

**Those are not the same place on the board.** *Distributism is a redistributive, property-spreading,
anti-concentration position; conservative nationalism is not. **On the six-ideology model the fix is
`orange`** — arithmetic from the two-axis placement, not a judgement.*

**⚠ But the fix is not one character**, and this is why it is filed rather than done:

- **On the three-axis, ten-position board (D231), none of the ten named parties is obviously
  distributist.** *Somebody has to place it, and that placement is a design decision rather than a
  correction.*
- **Where a nation sits decides where it can GROW.** *Affinity drives coalitions, drift, splinters,
  defection, civil-war severity, trade alignment and AI diplomacy. Moving Deseret moves all of it.*
- **Deseret is not an ordinary nation on this board.** *It is half-born by design — the Wasatch Front
  always cedes, the corridor that stays is the live story, and its `growthRate` of 1.5 is the fastest
  on the map. It is the nation whose politics the opening position leans on hardest.*

**Consequence while it stands:** *the nation with the most authored opening story in the game, and one
of the three with a mission tree, is playing from the wrong square.* **And `TONE.md` rule 13's worked
example — "a Christian distributist state" — is the line the game is supposed to print about it.**

*Filed, not fixed: a design round writes documents only, and the placement on the new board is a
decision nobody has taken.* **`TONE.md` §5.14.**

---

## 45 — ⚠ `node --test` REPORTS EVERY SUITE GREEN WITHOUT RUNNING A SINGLE CHECK

**Found at sign-off, 16 September 2026, while trying to verify the suite the honest way.**

**`tests/harness.js` says in its own header comment:**

> *"The same test FILES run two ways with no changes: browser … and node: `node --test tests/*.test.js`
> once Node exists — **describe/it map onto node:test's own globals via the shim at the bottom of this
> file.**"*

**⚠ THERE IS NO SHIM.** *The bottom of the file is `export default { describe, it, beforeEach, run,
reset, assert, ...assert }` and nothing else. `node:test` is named in the comment and imported
nowhere.*

**What actually happens.** *`describe` and `it` only **collect** suites into a module-level array.
`run()` walks that array, and **the browser page is the only thing that calls `run()`.*** So under
`node --test` each file is imported, registers its suites, executes nothing, and exits cleanly —
**and node reports one passing test per file.**

> **⚠ PROVED, not inferred.** *A suite whose only check was `ok(false, 'THIS MUST FAIL')` was added to
> `tests/` and run. **`node --test` reported `✔ pass 1, fail 0`, exit code 0.** The canary was removed
> afterwards.*

**Consequence, and it is the dangerous kind:** *the failure mode is a **false green**, not a crash.*
**Any session that runs `node --test` gets 51 of 51 passing in under a second and will report the
suite as healthy.** *This session did exactly that before checking, and would have signed off on it.*

**Two things to fix and they are different sizes:**

1. **The README and the harness comment both promise the node route.** ✅ **README corrected in the
   same commit that filed this.** *The harness's own header comment is still wrong — it is code, and a
   design session does not edit code.*
2. **Either write the shim or delete the promise.** *A shim is small: `run()` already returns
   `{ passed, failed, skipped, suites }`, so wiring it into `node:test` and failing the process on
   `failed > 0` is the whole job.* **Not done here — a sign-off does not start new work.**

**The project's own rule, which this is a textbook case of:** *"Suspect the harness before the model.
**Most failures have been a check disagreeing with its own instruction**, not the model failing the
task."*


---

## 46 — ⛔ THE GAME CANNOT BE SIMULATED PAST ROUGHLY TURN 80–95, AND IT IS DESIGNED TO BE 200 TURNS

**Found 16 September 2026 by stage 3's step 1, while trying to take a measurement stage 2 handed
forward.** *Not found by reading code — by running the thing.*

**`Sim.run` hangs part-way through a long run and never returns.** *It stops inside `AI.round`, the
call that plays all sixty-one seats.*

| Run | Seed | Instrumented | Reached | Outcome |
|---|---|---|---:|---|
| 1 | `tdd-t0` | sampling at 5 turns | **80** | hung |
| 2 | `tdd-t0` | timing every turn | **80** | hung |
| 3 | `tdd-t0` | **none** | **80** | hung |
| 4 | `seed-B-19770` | turn counter only | **94** | hung |

**Ruled out by check rather than by argument:**

- **The instrumentation** — run 3 passed no `onTurn` at all and hung identically.
- **Browser throttling** — tab fronted; turns 1–80 ran at **261–431 ms** with no upward trend.
- **Slowness** — across a 20-second window and again a 40-second window, **neither the turn counter
  nor the nation count moved by one.** It is a hang, not a crawl.
- **A turn cap** — there is none; the loop is `for (let t = 1; t <= turns; t++)`, and the second seed
  passed 80 and reached 94.
- **The known non-re-entrancy (deferred 6)** — `Sim.isRunning()` was confirmed false before each run.

**Where it is:** `onTurn` never fires for the turn after the last recorded one, so the loop is stuck
inside `AI.round`. **The turn it stops on moves with the seed**, so it is a condition some world
reaches rather than a counter running out.

**Why it is worse than a simulator bug.** *`js/sim.js` says in its own header that it **drives the
real game** — `AI.round`, and `TurnSystem.advance` over the wrap, "the same clock the Pass button
drives." **So there is no reason to expect a player pressing End Turn to fare differently**, and that
half is unverified rather than disproved.*

**What it blocks, immediately:**

1. **The turn-cost measurement** `turn-design.md` §9 handed to stage 3 — *the one genuine cost of
   removing the action budget.*
2. **Recalibrating the victory targets for a 200-turn game** (D223) — *`docs/technical/MEASUREMENTS.md`
   §2. The targets are already stale at eighty.*
3. **Whether the economy's logistics spiral actually spirals** — *round 4 left it to a long run.*

**Not fixed here on purpose:** *stage 3 step 1 is a measuring session and this is a programming
session under a different permission.* **It is the strongest candidate for the first repair**, because
three separate pieces of stage 3 are waiting behind it.

---

## 47 — A "round trip" test writes into the real `content/cultural.json`, then reverts it

**Found 24 September 2026, checking the working tree before a sign-off — not by running anything
directly.** `git status` showed `content/cultural.json` modified: a real nation's Area list replaced
with one fake entry, `{"id": "n9999", "name": "Round Trip Test Region"}`. Re-checked moments later to
set it aside, and the change was already gone — file back to matching `HEAD`, nothing to stash.

**The likely cause, given the timing: a concurrent session's test run.** Another chat had this
project's dev server up on the same machine at the same time (see the 24 September 13:58 handoff),
and a "round trip" test — almost certainly a save/load test — appears to write its fixture straight
into the real tracked file rather than a scratch copy, then write the original back when it finishes.
This is the second time this exact family of test has left a mark on a tracked file: a stray
`content/test-roundtrip.json.tmp` reached an actual commit on 11 September.

**Why it matters more than a transient diff.** A run interrupted between the write and the revert —
a killed process, a crash, two things racing for the file at once — leaves corrupted content staged
for whatever commits next, and nothing would say so. This one was caught by chance, reading
`git status` for an unrelated reason.

**Not fixed here.** Which suite does it, and pointing it at a scratch copy instead of the real file,
is a small task for a programming session.

### ⚠ CONFIRMED THE SAME DAY BY RUNNING IT — and the other session is named

*This entry was filed at 14:10 from a `git status` observation. A **second sign-off session was
running in this same working tree at the same time** and ran the suite twice:*

| Session | Result | |
|---|---|---|
| The one that filed this entry | **956 passed · 0 failed** | 308.72s — *its handoff, line 23* |
| The concurrent one | **955 passed · 1 failed** | 306.50s |
| The concurrent one, immediately again | **954 passed · 2 failed** | 272.06s |

**Same tree, same half hour, nothing committed between them.** *So the fault is not hypothetical and
it is not rare: it fired on two runs out of three.*

**The failing assertion names the fixture directly** — `covers every cultural region the map actually
uses`: *"1 cultural regions fall through to the flat default split: **Round Trip Test Region**"* — and
run 2 added a bare `TypeError: Failed to fetch` in `geo-ct.test.js:89`, which is the same contention
seen from the other end.

### Two mechanisms that make it worse than "a transient diff"

**1. A different port does not isolate.** *`server.py:38` — `CONTENT_DIR = os.path.join(ROOT,
"content")`.* **The content API writes into the repository's own working tree**, so two sessions on
two different ports still share one `content/cultural.json`. *The contention is over the FILE.*

**2. One second of collision poisons a five-minute run.** *`tests/world-fixture.js:17` —
`let dataPromise = null`, commented "the raw JSON is fetched once and shared by every suite".* **Every
data file is fetched exactly once per page load**, at the first `bootWorld()`. *If the other session
holds the edited file at that single instant, the cached copy carries the test region for the whole
run and every suite reading the map afterwards fails for a reason unrelated to the code.*

### What this costs a reader

**It produces false FAILURES, not false passes** — the opposite of defect 45 and the safer direction.
**But a red suite is no longer by itself evidence of a regression**, which is exactly the ambiguity a
sign-off exists to remove. *Candidate repairs, none chosen: point the round-trip test at a throwaway
content name; have the suite refuse to start if another run is in flight; or take a lock on the file
rather than the port.*

*See `DECISIONS.md` D256 (first filed as a duplicate D255) and `docs/PROGRAMMER-RULES.md` 22.*

### ✅ AND RUN ALONE THE SAME EVENING: 956 · 0 — and four more sessions' evidence, gathered at 17:02

*Added by the consolidated sign-off (D257), which read every open session's transcript before writing.*
**At 17:03 the suite ran with no other server and no other session active — the first run on
24 September that rule 22 counts: 956 passed · 0 failed · 51 files · 263.47s.** *`content/cultural.json`
was unmodified afterwards and no `Round Trip Test Region` remained in it.*

**The afternoon's runs, now that every session's transcript has been read — nine runs in six sessions (four green, five red), not three:**

| Session | Result | |
|---|---|---|
| The one that filed this entry | 956 · 0 | 308.72s |
| The concurrent sign-off | 955 · 1, then 954 · 2 | 306.50s, 272.06s |
| A third session ("Round 2 conquest ideation") | 955 · 1, then 956 · 0 | 414s for the green one |
| A fourth ("Designer brief documentation") | 3 failing, then 956 · 0 | 269.17s for the green one |
| A fifth ("Designer brief outstanding items") | 955 · 1 | 315s |
| A sixth ("Outstanding git commits") | 956 · 0 | 4 min 39s — *it found the test region left in the file mid-run and restored the committed copy by hand* |
| **Alone, 17:03** | **956 · 0** | **263.47s** |

**The cause is narrower than the first paragraph of this entry guessed.** *It is not "almost certainly a
save/load test" and not an unknown third party.* **The writer is `tests/content.test.js`** (the
content-editor round trip, "opens, edits and re-saves cultural.json without a download"); **the victim is
`tests/ideology.test.js`**, whose check that every cultural region has a political split reads the file
while another run holds it edited. *Every concurrent session was one of Aaron's own chats.*

**Proved in isolation by the fifth session: `ideology.test.js` run on its own passes — 20 checks, 1.86
seconds.** *So the game is fine and the harness is the fault.* **And the third session's framing is the
one to keep: in a project whose first rule is that the same seed reproduces exactly, a suite whose
result depends on what else is touching the disk is a determinism fault, not a tidiness one.** *The
same file's other round-trip test already writes to a scratch document; pointing this one at a scratch
copy the same way is the smallest of the three repairs above.*

### Two more findings from the fourth session, reported at 17:30 and recorded unverified where marked

**1. A bare `TypeError: Failed to fetch` has TWO causes, and they need opposite responses.** *Rule 22 and
this entry give it as the tell for file contention.* **In the fourth session's case the other chat's
server had DIED**: three sequential requests to `/api/content` returned HTTP 000 in about 2.25s each, a
burst of five returned 000, and nothing was listening on port 8000 — minutes after the same request had
returned 200. *(Reported by that session; the server is long gone and this could not be re-checked.
What killed it is unknown.)* **Contention means "call the run unattributed and wait"; a dead server
means "restart it and re-run".** *The one-command check: request `http://localhost:8000/api/content` —
200 is contention, 000 is a dead server.* **This is a third mechanism beside the shared file and the
per-page cache.**

**2. A leftover round-trip document is INVISIBLE to `git status`.** *The same session found
`content/test-roundtrip.json` left in the working tree by an interrupted run and removed it before its
clean run.* **Verified here: `.gitignore` line 22 is `content/test-*.json`**, so the leftover never shows
up and can accumulate unseen — the opposite hazard to the `.tmp` file that reached a commit on 11
September. *No such file exists at 17:35.* **A fourth candidate repair: whatever else is done, make a
leftover `content/test-*.json` something a session can see.**

## 48 — The control sidebar shows everything at once and takes forever to scroll

**Raised by Aaron, 24 September 2026, in the director's-brief interview (Q13):** *"But the sidebar in
which you control everything takes forever to scroll through. And shows you all this information, which
is great, but when you don't need it, it's useless."*

**Why it matters more than a layout complaint.** It breaks the principle he set in the same interview
(Q12): every system should end in *"a very simple thing on the end"* a newcomer reads at a glance —
his camera's auto mode — with the detail there for anyone who opens it. **The sidebar is permanently in
manual mode.**

**Not fixed now:** *the alpha's look stays — in his words (Q13), "I think right now, for the alpha, how the
game is — the overall look is fine" — and the interface work is later.*
**It is the first concrete evidence for when the roster's deferred UX Designer role should be hired.**
`docs/design/presentation-design.md` has no entry for the sidebar's length — not checked beyond a search
for "sidebar" and "scroll", which found none.

*⚠ 24 September 2026 (D264): the adopted road to alpha hires the UX Designer (Dia) at M4, where its first
job is the throwaway pretend turn. The sidebar is its second job, at M6, built in two depths — simple on top,
the detail a click away. Both quotes above were corrected the same day to his exact words: the first had
dropped his opening "But", and the second was the studio's summary labelled as his.*

## 49 — ~~Two programmer rules are both numbered 11~~ WITHDRAWN: a duplicate of 30

**Filed at 17:10 on 24 September by the consolidated sign-off and withdrawn at 17:20 by the same session.**
*This is defect 30, filed on 14 September, and this entry's suggested fix (relabel the second rule `11b`)
contradicts 30's, and a later report shows even 30's is not clean — see the note added to 30.* **Found by reading rule 22, which names defect 30 in
its last line** — the duplicate check had searched for doubled NUMBERS, not for an existing entry about
the same thing. *The number is kept, struck, so nothing ever reuses it.*

## 50 — The design wiki stops at round 3, and Aaron's decision to keep the writer's articles was never carried out

**Found 24 September 2026 by the design-wiki session's read-only close-out, and verified here.**

**1. The wiki is a stage and a half behind.** *`build/wiki_rulings.json` holds **3 rounds and 136
rulings**; ideation closed at **seven rounds and 178 rulings** on 15 September, and none of stage 2's
twenty design documents is in it.* **Its own README still opens "For whoever closes round 4".** *Adding a
round is mechanical and documented in `docs/wiki/README.md`; nobody is assigned it.* **Left alone, the
wiki becomes a stale fourth place a fact lives — the failure its charter (F24) exists to prevent.**

**2. Aaron APPROVED keeping the writer's 76 articles, on 14 September at 21:06, and nothing happened.**
*The board card `writer-wiki-merge` recommended "Keep it" — correct the writer's articles rather than
start again, **five to seven days of work**. The board's database holds his answer: approved, no note.*
**The card was cleared from the board on 15 September among "six answered cards", and the answer was
written into no decision.** *So the writer's 86 files still sit unmerged in `docs/wiki_new/` beside the 86
generated pages in `docs/wiki/`, and the board's own wiki card said, until 24 September, that it was
waiting on his decision.* **Recorded as D259.**

**Not started here.** *It is five to seven days of work, it is not the current stage, and when to spend
it is Aaron's.* *`docs/deferred.md` 17–29 are defects in what the wiki says; this entry is about what it
does not cover at all.*

## 51 — The evidence file's line numbers into the interview are six lines out

**Noticed 24 September 2026 at the sign-off review, and checked here.** `docs/design/director-brief-evidence.json`
points into `docs/design/director-brief-interview.md` by line number, and every one is six too low: it cites
19–20 for *"It looks really complicated at first"*, which sits at line 25, while line 19 is a divider. The
six-line "Corrected the same day" note was added to the top of the interview after the evidence sweep was
written, and the file's "about" note does not say so. The brief names the file as a source (§10).
**Deferred:** the quotes are right and only their addresses are off. The fix is small — add six to each
interview line number, or one line in the "about" note saying to — for whoever next touches the file.

## 52 — The studio's six functions have two sets of names, and four role names break the naming rule

**Noticed 24 September 2026 at the sign-off review, and checked here.** The roster's Function column says
*Running it · Capturing his intent · Defining it · Finding out · Making it · Checking it*; `CLAUDE.md`'s
session-renaming rule (D265) calls the same six *Running · Intent · Design · Research · Build · Checking* —
against its own "one word per idea". The naming rule says a planet leads a function and its moons are the
roles under it, but Logos, Varda and Chaos sit under Neptune and are not its moons (they are bodies beyond
Neptune), and Eureka sits under Mars and is an asteroid that shares Mars's orbit, not a moon. And the roster
says Pluto "finds out what Aaron means" among the dwarf planets, while its table puts Pluto under *Capturing
his intent*, not *Finding out*. **Deferred:** the names are Aaron's scheme (D262) and the words belong on
Pluto's terminology list at M0 — one question to him there (which word for each function, and whether the
rule widens to "moons or bodies that travel with it" or those four names change), not settled by the studio.

## 53 — Old finished cards on the Control Board point at decision cards that no longer exist

**Noticed 24 September 2026 at the sign-off review, and checked here.** The board has held no decision
cards since 16 September, yet three finished-stage cards still say *"five of those are cards above waiting
for you"*, *"there is a card at the top asking"* and *"Four need one small change and are the card at the
top of this board"*. Two log entries also name internal rule numbers (*"now rule 21"*, *"written up as
rule 12"*), against the board's rule of no internal numbers. All of it is text from 14–16 September; nothing
added on 24 September has the fault. **Deferred:** it misleads only mildly, and Rhea's redesign of the board
at M0 is the place for it — the three sentences into the past tense, the two rule numbers into plain words.

## 54 — On the MacBook (Luna), nothing warns that the newest handoff is out of date

**Noticed 24 September 2026 at the sign-off review, and checked here.** Programmer rule 20 and D10 count
on the start-up check naming every commit made after the newest handoff. On Luna, the shared rules folder
(`000-default-prompts`, linked at `~/.claude/default-prompts`) holds an older check that prints only the
handoff's name and an unpushed count. That folder is on a side branch (`control-tower-prototype`) with **no
GitHub remote**, so the unpushed warning can never fire and the rules themselves exist only on this machine.
*Measured here: the newest handoff (1702) has 10 commits after it, its line 17 says the draft rules file is
"NOT adopted" (D263 has since adopted it), and nothing on this Mac says so.* **Deferred:** it is the shared
rules repository, not this project, and giving it a remote and bringing the Mac's copy up to the PC's is
Aaron's call. Until then, a session on Luna counts by hand: `git log <commit that last touched the newest
handoff>..HEAD`.

## 55 — Hog Wild's overnight chain breaks the one-live-session rule, and nothing says which wins

**Noticed 24 September 2026 at the sign-off review, and checked here by reading, not by running a chain.**
`docs/HOGWILD.md`'s "Running overnight" chains up to three runs a night — run, limit, wind down, schedule,
resume — with the app kept open and no sign-off or archive in between. `CLAUDE.md` now says one live session
per project, each ending in `/signoff` and an archive, and its start check says to stop on any sign of
another live session (an uncommitted change, port 8000 taken) "in Hog Wild Mode too". The wind-down never
says to commit its log or stop a preview server, so a resumed run could stop in the night with nobody there
to answer. **Deferred:** it bites only when an overnight chain runs, and the fix is a line in Aaron's
standing-permission document: an overnight chain counts as one session; each wind-down commits and pushes
everything and stops anything on port 8000; the chain signs off and is archived once, after its last run.

## 56 — Saving Aaron's words cannot be pushed by a session; Aaron has to run the push himself

**Hit on 25 September 2026, doing exactly that, and it stopped the work at the worst point.** The 33 files
of his own words were written and verified, and the commit-and-push was **refused by this machine's safety
check** with the reason *Sensitive-Source Provenance*: the content came out of session transcripts, and the
check will not let a session put transcript material onto GitHub. It cannot see that the repository is
Aaron's own private one and that the words are his own, from his own machine. **The refusal then widened —
even a read-only `git status` in that folder was refused** — so the session could not tell whether its own
commit had landed. *Cleared only by Aaron running the command himself; git worked normally again
afterwards, so the block attaches to the operation that carries the material, not to the folder.*

**What the next session must expect.** *Anything that saves his words — the tone-chat export, a fresh copy
of a session at sign-off, a second machine's logs — will be written and verified fine and then **fail to
back itself up**. Plan for it: do the extraction, check it, then hand Aaron **one complete command, chained
with `&&` only** (programmer rule 27), and treat the work as unfinished until he reports what it printed.
**Never tell him it is backed up on the strength of having written the files.***

**Deferred:** *the check is the machine's, not this project's, and turning it off is neither the studio's
call nor obviously wise — it is doing roughly the right thing for the wrong repository. The workaround
costs one message and works every time. If it becomes frequent, the question for Aaron is whether to add a
standing permission for this one folder, which is his to weigh, not the studio's.*

## 57 — A decision Aaron makes by PICKING AN OPTION leaves no trace in the word record

**Found on 25 September 2026 while re-copying this session at sign-off, and it is the sharper half of a
day spent saving his words.** The record in `docs/design/aaron-words/` holds every message he **typed or
dictated**. When he answers by choosing one of the options a session puts in front of him, **nothing of his
is written to the log at all** — the choice comes back as a tool result, which is the studio's text, not
his. *Measured here: this session's file holds **three** entries — one typed command and two pastes — yet he
settled **three questions** in it, and **D274 and D275 both rest entirely on choices that the word record
cannot show.*** The rule that studio wording is never quoted as his (D260) is what keeps this honest, and
both entries say in terms that the wording was the studio's and only the choice was his. **But a later
session reading only his words would not know he had answered at all.**

**Why it matters more from here, not less.** *The board redesign is deliberately moving him further this
way — cards at the top of the board and a `/go` command (D269) — so the share of his decisions that are
clicks rather than sentences is about to rise. **The word record was built to be the place his intent
survives; it is about to stop being that**, quietly, while still looking complete.*

**Deferred, and it is a question for him, not a defect to fix quietly.** *Three candidates, none chosen:
write the option he picked into the word record as a studio-attributed entry beside his messages; keep
clicks out of the word record and rely on `DECISIONS.md` alone, saying so plainly at the top of the index;
or put the question back in his hands by asking the ones that matter in prose so he answers in his own
words. **The third is the only one that produces more of his words rather than better bookkeeping about
their absence**, and it costs him time, which is his to spend.*

## 58 — The game design document and politics ruling 40 disagree about what sits at a corner of the political board

**Found 25 September 2026 while building the terminology list, and checked from both sides.** Politics
ruling 40 (11 September) sets three words apart: an **ideology** is a fixed place on the board, a **party**
is a political organisation that **can move across** that board, a **movement** is a want carried through a
position. The wiki page states it as settled — *"The vocabulary is strict."* Four days later `GDD.md` §15.1
(15 September, written up from D231) says the opposite: *"The eight corners of that cube are parties, each
named for a real one"*, and again at §15.1, *"The corners are occupied by **parties** and by **governments**,
not by **movements**."* **A party cannot be both a fixed corner and a thing that moves across the board.**

**This is not only a naming clash, which is why it is also `FIRST-ORDER.md` F14.** Whether the thing at a
corner is a fixed label or a movable per-nation organisation decides the shape of the object the contracts
pass must write down (M3) and the politics build must carry (M6). `identity-design.md` prices *change course*
by how far a party moves — which has no meaning if a party IS a fixed corner.

**Aaron's own latest word is "three axes and ten positions" (D231), which uses neither disputed word for the
corner.** He also asked this himself on 9 September and it never came back to him: *"we should also nail down
vocbulary [sic]. Should this be a political party or ideology? I feel like ideology is a term already in use
but it doesn't make sense that one political part [sic] is now reperesented [sic] in indivual [sic] nations."*

**Deferred to him, not settled by the studio:** it is question Q3 on the terminology list, and the walk
through that list is the next task. **Do not build on either reading until he has answered.**

## 59 — The studio's six functions have THREE sets of names, not two, and defect 52 undercounts

**Found 25 September 2026 while building the terminology list.** Defect 52 records two sets. There is a
third, inside `STUDIO-ROSTER.md` itself: its section headings read *Running it · Capturing intent · Design ·
Research · Building* — **five headings for six functions**, with Checking filed under Building — against its
own Function column (*Running it · Capturing his intent · Defining it · Finding out · Making it · Checking
it*) and against `CLAUDE.md`'s *Running · Intent · Design · Research · Build · Checking*. A seventh function,
Marketing, is named in the roster and appears in none of the three sets (terminology list gap G5).

**Deferred with 52, to the same place:** it is question Q7 on the terminology list. **52 is not wrong, it is
short — read the two together.**

*⚠ 25 September 2026, the same evening (D279): Aaron settled the set — **Running · Intent · Design · Research ·
Build · Checking**, the one he had already approved. What remains of 52 and 59: the roster's own table and
headings still carry the other two sets; the naming rule (moons, or "the bodies that travel with it") and the
four role names that break it; which team the Scribe belongs to; and Marketing, named in no set.*

## 60 — Two different rulings are both called "ruling 40"

**Found 25 September 2026 while building the terminology list.** `politics-ideation.md` cites *"Round 1's
ruling 40"* for a finding about movement verbs and adjectives (*"Every movement has a verb… and an
adjective"*), and elsewhere in the same file cites **ruling 40** for the ideology/party/movement vocabulary.
They are different rulings with the same number, told apart only by the words "Round 1's" when someone
remembers to write them. Rulings appear to be numbered per round, so this is a collision by design rather
than a typo, and the design rounds are closed — so the numbers cannot be re-issued.

**Deferred:** low harm today, real harm the first time a technical document cites "ruling 40" without saying
which. It belongs with the project's other numbering collisions (terminology list Q8, which records that
three step-numbering systems disagree and one is off by one). **The cheap fix is a citation rule — always
name the round — not a renumbering.**

## 61 — The tuning file's "per turn" labels now say the wrong thing

**Found 25 September 2026, measured the same evening.** Aaron reversed the words (D276): a **turn** is now one
nation's move and a **round** is all sixty-one. The engine's rates are still per quarter and nothing
miscalculates — **but the tuning file says "per turn" on 21 lines, 12 of them the labels he reads in the tuning
screen, and "per-turn" on 9 more; "per quarter" appears on none.** `content/tunables.json` has none. Under his
ruling each of those labels now reads as per-nation-move, which is wrong by a factor of sixty-one.

**Deferred, and blocked on him:** the quarter of game time has no name — *"we're going to figure out the quarter
of game time later"* — so relabelling now would mean guessing his word. It is a programming change once he
names it. **It must land before anyone tunes by reading those labels, and before the contracts pass writes a
rate into a contract** (M3 already waits for the word list). Until then `CLAUDE.md` tells every session to say
"quarter".

## 62 — The diplomacy design is built on the seven states Aaron replaced on 25 September

**Found 25 September 2026 while folding the word list walk into the word list.** `diplomacy-design.md` is built
on his 8 September list of seven conditions and an eight-state spine. D277 replaces the seven with **four
standings** (war, hostile, peace, allied) and **standing conditions** inside them (ceasefire, Armistice,
overlord, subject); "peace treaty" is retired in favour of **Armistice**. **A design defect against the
diplomacy design document, not only a naming one** — no design document was edited by the walk. Three things
ride with it:

1. **A rule of his with no owner yet:** ground lost to conquest leaves hostility behind after a war ends — *"if
   I was a country and they conquered things from me and then we signed a peace treaty, I'd still be hostile
   towards them."* It belongs in the diplomacy design; nothing carries it today.
2. **Hostile is now two things:** a standing (D277) and a band on the relations score, which the diplomacy
   document already records as teaching the player something false. Word list Q14 and Q19.
3. **An open question for Aaron, and a sharp one:** on 15 September he made signing a peace treaty mean
   recognition — *"signing a peace treaty means that that nation recognizes you as a soverign [sic] nation"*. On
   25 September he renamed that act Armistice, with the Korean armistice as his example — *"The main thing is
   like what you mentioned, like uh, the armistice between North and South Korea."* **Korea's armistice is the
   standard case of two sides that never recognised each other.** Whether an Armistice still means
   recognition is his; nobody should build either reading until he says. It belongs at the end of the
   diplomacy document's open questions, and the director's brief §9 line about peace and recognition names a
   word he has now retired.

**Deferred to the diplomacy technical document**, which inherits all of it. Nothing is built on the seven, so
nothing has to be redone — which is why this is not a first-order item.

## 63 — Aaron's word list walk is saved as documents, not yet in the word record

**Found 25 September 2026.** The walk ran in his Claude chat, not a Claude Code session, so none of its
messages reached the word record in `docs/design/aaron-words/`. Until this evening its two exports existed
**only in his Downloads folder on the MacBook**; they are now copied byte-identical into
`docs/design/aaron-words/walk/`, with a note on whose words are whose. **What remains, and it is Pluto's:**
extract his messages into the record's own one-file-per-session form, and add the walk to the index. **The
same pass should correct the index's total**, which still says 659 messages where the files on disk hold 661
(the 25 September Terra session grew at its sign-off re-copy).

