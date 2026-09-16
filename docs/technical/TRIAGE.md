# The triage — what the twenty design documents left open

**Stage 3, step 1 (T0.3). Sorted 16 September 2026.**

> **Three hundred items, read off the end of all twenty documents rather than remembered.** *The
> project's own rule is that this list lives at the end of the document that owns it and is never
> reassembled from memory — so every row below was re-extracted from the source.*

---

## 1. The count, and the thing that falls out of counting

| Bucket | | |
|---|---:|---|
| **UNOWNED** | **207** | *Nobody's name is on it* |
| **AARON** | **52** | *His, and only his* |
| **STAGE 3** | **35** | *The architect's — this stage exists to answer them* |
| **THE ALPHA** | **4** | *Paper cannot settle them; somebody has to play* |
| **THE DATA STAGE** | **2** | *Wants real figures pulled* |
| | **300** | |

### ⚠ Why 207 are unowned, and it is structural rather than careless

**Every one of the 166 GAPS is unowned, by construction.** *The satellite template gave open questions
a three-column table — number, question, **owner** — and gaps a two-column one. **There is no owner
column on a gap**, so no gap in the project has ever had a name against it.* The other 41 are open
questions whose owner cell says *unassigned*, *not stated*, *undeclared* or is simply blank.

> **An unassigned question is a question nobody will ask.** *That is the whole cost of it, and it is
> the cheapest thing in this stage to fix: **each system's technical document assigns an owner to every
> gap it inherits, as its first act.*** *Recommended rather than done here — doing it centrally would
> be one session guessing at nineteen systems it has not yet written.*

---

## 2. Where the weight sits

**Per document, ordered by how much is still open in it.**

| Document | Aaron's | Stage 3's | Unowned | Total |
|---|---:|---:|---:|---:|
| `trade` | 3 | 3 | 15 | **21** |
| `war` | 1 | 1 | 19 | **21** |
| `blocs` | 1 | 2 | 17 | **20** |
| `diplomacy` | 2 | 4 | 14 | **20** |
| `nation` | 2 | 1 | 14 | **17** |
| `board` | 4 | 2 | 9 | **16** |
| `events` | 1 | 4 | 11 | **16** |
| `missions` | 5 | 2 | 8 | **16** |
| `movements` | 5 | 3 | 8 | **16** |
| `identity` | 4 | 1 | 9 | **14** |
| `opening-board` | 5 | 0 | 9 | **14** |
| `ai` | 2 | 3 | 7 | **13** |
| `economy` | 4 | 0 | 7 | **13** |
| `population` | 1 | 3 | 9 | **13** |
| `presentation` | 6 | 0 | 7 | **13** |
| `turn` | 2 | 3 | 7 | **13** |
| `governing` | 3 | 2 | 7 | **12** |
| `power` | 0 | 0 | 11 | **11** |
| `GDD` | 0 | 0 | 11 | **11** |
| `force` | 1 | 1 | 8 | **10** |

**Two things worth reading off that table.**

1. **`trade` and `war` are the heaviest, and they are opposite cases.** *Trade is the most complete
   system in the game, so its twenty-one items are **reconciliation** — three internal-trade regimes,
   two live toll systems. War's twenty-one are **absence**: the fight is built and ending one is not.*
2. **`power` and the master have ELEVEN items each and not one has an owner.** *Both are pure gap
   lists. Power is read by twelve of the nineteen systems, so eleven unowned items sit under most of
   the game.*

---

## 3. What actually blocks the work, and it is a short list

**Of three hundred, these are the ones that stop a technical document being written at all.** *Everything
else is answered as its document is written, or waits.*

| | Blocks | State |
|---|---|---|
| **`MAX_DISTANCE` has no value** | **T2 — identity, and every threshold downstream** | ✅ **ANSWERED TODAY.** `MEASUREMENTS.md` §1 — 2√3, with a second finding attached |
| **The 200-turn world cannot be produced** | **T0's own measurements, the victory recalibration, and the economy's spiral test** | ⛔ **`docs/deferred.md` 46, found today.** The strongest candidate for the first repair |
| **Which of the two toll systems the game means** | **T5 — economy and trade** | ⏸ **Parked by Aaron, in his words, until the economy is built out.** Not to be raised before then |
| **Where Deseret sits on the ten positions** | **T3 — identity; T6 — the opening board and the Deseret tree** | ⏸ **Parked to T3.** Approving the card accepted the reasoning, not a placement |
| **Is the allocation three slices or four?** | **T5 — force** | ⏳ *Open. `force-design.md` question 1, and its own traced scenario already narrates the fourth* |
| **Does the aggregator own the fifth stock?** | **T5 — power** | ⏳ *Raised by the ledger today. War weariness exists in ten files and none of them is `power.js`* |
| **How fast is too fast for the logistics brake** | **T5 — economy** | ⏳ *D234 chose the brake's SHAPE and deliberately left the number unset, as the architect's* |

> **⚠ Everything not in this table is explicitly NOT blocking**, and that is the useful half of a
> triage. *A document gets written with its open questions still open, listed at its end, exactly as
> stage 2's were.*

---

## 4. How Aaron's 52 reach him

**Not as fifty-two cards.** *Three or four at the head of the system document that needs them, with that
document open in front of him — the default taken in the plan and recorded in D246.* **The table in §2
is the delivery order**: `presentation` owes him six, `missions`, `movements` and `opening-board` five
each, `board`, `economy` and `identity` four.

---

## 5. Appendix — all three hundred, by document

*`Q` is an open question, `G` a gap. Text truncated to 150 characters; the document that owns it is the
authority.*

### `GDD` — 11 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 5a | **UNOWNED** | The nine tone questions TONE.md §5 leaves open. Not one of them blocks presentation-design.md — the heaviest is whether the player is told when their  |
| Q | 6a | **UNOWNED** | ONE THING TO CONFIRM, and it is mine rather than a designer's ruling. Ruling 1 recorded that the largest single job in the change was splitting Republ |
| G | 1 | **UNOWNED** | There is no art direction. No palette rationale, no typography, no reference, no statement of what the game should feel like to look at. What exists i |
| G | 3 | **UNOWNED** | DESIGN.md §4.1 and §12 both state that treaties and aid do not exist. Both are built — a non-aggression pact with a cooldown and a minimum standing, a |
| G | 4 | **UNOWNED** | DESIGN.md §6 opens "One action per nation per turn. Each ends the turn." That is a true description of what is built and a false description of the de |
| G | 7 | **UNOWNED** | Nothing says how a nation's opening memories are dated. Whether they are spread across the two years before turn 0 or all stamped two years ago change |
| G | 8 | **UNOWNED** | No multiplayer exists anywhere in the design — not built, not deferred, not ruled out, never mentioned. Recorded because its absence is currently an a |
| G | 10 | **UNOWNED** | docs/design/DESIGNER-BRIEF.md is itself stale and is the file a new design session is told to paste. It states the live stage is ideation, names round |
| G | 11 | **UNOWNED** | MAXDISTANCE HAS NO AUTHORED VALUE ON THE THREE-AXIS BOARD, and it is the first thing the Technical Designer must settle. It is the denominator of the  |
| G | 12 | **UNOWNED** | TWO TONE RULES ARE REQUIREMENTS ON GENERATORS, AND NO GENERATOR KNOWS. TONE.md rule 16 says a generated flag may carry no real hate-group iconography, |
| G | 13 | **UNOWNED** | Nothing says what a design document does when the ALPHA excludes something the GAME contains. §9's alpha content scope is the first case — two movemen |

### `ai` — 13 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | Does an AI nation with a mission tree pursue it? "Is the player racing an opponent that does not know the race is on?" |
| Q | 2 | **AARON** | Do the other fifty-four nations get trees? |
| Q | 3 | **STAGE3** | Can the AI act on a restricted view, and what does it cost? Ruled that it plays under the same restriction as the player — and "an AI that must act on |
| Q | 4 | **STAGE3** | Sixty nations each choosing SEVERAL things has never been measured |
| Q | 5 | **STAGE3** | Re-derive the victory targets for a 200-turn game. They were set at 2–5× an AI-only world on the reasoning that a player playing deliberately for EIGH |
| Q | 6 | **UNOWNED** | Vassalage and the turn: does the overlord spend the vassal's action, is vassalage AI-only, or does a vassal keep its action? |
| Q | 7 | **ALPHA** | Should the AI weigh bad odds harder, now the size shield is gone? |
| G | 1 | **UNOWNED** | The AI is built on one action per seat, and there is no action budget any more |
| G | 2 | **UNOWNED** | Revoking is a rule with no candidate and no stated reason. Recognition got a nine-line justification; this got nothing |
| G | 3 | **UNOWNED** | The full explanation of every nation's reasoning exists and only the test suite reads it |
| G | 4 | **UNOWNED** | All twenty-four weights are unmeasured defaults. None is overridden; none carries a measurement in its doc — chosen by argument rather than by measure |
| G | 5 | **UNOWNED** | A denominator drift: "fourteen of sixty" in one place and "fourteen of sixty-one" in two others — and trade-design.md §5 now says the predicate itself |
| G | 6 | **UNOWNED** | The Closing term is named in the document list and defined nowhere in docs/design/. Its definition lives in a decision record |

### `blocs` — 20 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **UNOWNED** | THE CENTRAL ONE. Does a club override the corridor system inside itself, or does the corridor system learn a second mode? "Either… or."  And two docum |
| Q | 2 | **UNOWNED** | What rate does "free movement of goods" mean? Zero toll and zero friction? Zero toll and normal friction? The bloc has no number at all |
| Q | 3 | **AARON** | Multi-hop inside a federation: each host takes 5%, or one share divided? Aaron: "Leaning: one share, divided… NOT ruled" |
| Q | 4 | **UNOWNED** | Does a federation waive friction? Never asked by any round, and it is the difference between 90% and 51% |
| Q | 5 | **STAGE3** | Routes that leave the federation and re-enter, where a club rate and a negotiated corridor price the same journey |
| Q | 6 | **UNOWNED** | What does leaving a BLOC cost? "Leaving a bloc is what the story is actually about… what it costs to walk out is open" |
| Q | 7 | **UNOWNED** | Is the federation's instant severance intended? The built system charges four turns' notice and a memory for exactly that act |
| Q | 8 | **UNOWNED** | Does the partner discount stack on top of a club rate? A member automatically satisfies its condition |
| Q | 9 | **STAGE3** | The vassal's tithe, and what the overlord's veto costs the overlord |
| Q | 10 | **UNOWNED** | Is vassalage-as-recognition too cheap? "Submitting should probably not deliver recognition automatically, or every breakaway ends the same way" |
| Q | 11 | **UNOWNED** | Can a bloc expel? Ruled no, by precedent — but an expulsion is the multilateral version of de-recognition and would give a bloc teeth it lacks |
| G | 1 | **UNOWNED** | "Free passage for the overlord's goods" is a FIFTH internal-trade rule and is on nobody's list |
| G | 2 | **UNOWNED** | Nothing specifies a club's interaction with CAPACITY. Every built route is bounded by a per-grant cap and a national ceiling; neither club rule mentio |
| G | 3 | **UNOWNED** | No tunable exists for any club object. Not one. Every figure lives in prose, against the project's standing rule |
| G | 4 | **UNOWNED** | The four gate-holders' leverage has never been priced against the 5% cap |
| G | 5 | **UNOWNED** | No rule exists about a federation BREAKING UP — "a federation destroyed from the inside by its own caution, with no rule about federations breaking up |
| G | 6 | **UNOWNED** | The federation's toll is 10%, 5% and 15% in three different rulings. Nothing reconciles them |
| G | 7 | **UNOWNED** | Sponsorship needs a relations memory heavier than the heaviest that exists, and none exists |
| G | 8 | **UNOWNED** | No bloc exists on the opening board and the scenario authors no agreements at all |
| G | 9 | **UNOWNED** | The three-hop route cap silently makes a club of more than four members unrepresentable for internal routing. Neither ruling mentions it |

### `board` — 16 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | Does anything on this board have a LENGTH? Nothing in the transit layer does. Measured from the game's own map on 5 September 2026: the closest two po |
| Q | 2 | **STAGE3** | Should a Lake Michigan port reach the Canada corridor without passing Mackinac? Carried from missions-design.md open question 6, which is where it was |
| Q | 3 | **STAGE3** | Can a smuggler's rate reach the world market for a nation with no port? The market is "a haircut rather than a lock" because "refusing external trade  |
| Q | 4 | **AARON** | Does lasting infrastructure damage exist at all? Today a wrecked rail hub lasts one turn, so it is a raid and not a demolition, and nobody decided tha |
| Q | 5 | **ALPHA** | Is a shock's blast radius walked in adjacency hops the right shape? Round 6 ruled it because the map has no coordinates, and recorded that it is argua |
| Q | 6 | **AARON** | Does D227's recognition exception cover RIVERSIDE? D227 opens Deseret recognised by its neighbours and not by Utah, so that a pariah needing a corrido |
| Q | 7 | **AARON** | Is it acceptable that about one game in five opens with Deseret touching no Californian ground at all? Its single Californian border Area is Mohave Co |
| G | 1 | **UNOWNED** | The adjacency graph's own measurements are stale. 1,676 nodes / 9,454 directed edges / 43.5 KB were measured before the M9.6 re-bake took Areas to 1,6 |
| G | 2 | **UNOWNED** | A number published on the Control Board is wrong by a factor of seven. Its permanent log records, of 5 September, "There are 986 [ports], from the rea |
| G | 3 | **UNOWNED** | Nothing states what happens to a chokepoint's Area when its owner ceases to exist. Gates are held by whoever owns the ground and the ground always has |
| G | 4 | **UNOWNED** | Nothing specifies whether a corridor survives its grantor being annexed. Diplomacy ruling 18 makes a claim inherit with the ground; transit grants are |
| G | 5 | **UNOWNED** | countyneighbors.json is a pre-2015 Census vintage with roughly 100 FIPS that no longer exist. DESIGN.md §12 says "it feeds the display-only Neighbors  |
| G | 6 | **UNOWNED** | The border is defined in two files and nothing keeps them in step. Routing reads transport.json's external lists (18 Canada + 14 Mexico); the panel ch |
| G | 7 | **UNOWNED** | Nothing says what a border crossing IS, mechanically. Thirty-two are named and the only thing holding one does is put Canada or Mexico within reach. N |
| G | 8 | **UNOWNED** | bankpairs — 213 facing-bank county pairs — is baked and read by nothing. Verified by search across js/ and tests/, 15 September 2026. Dead baked data, |
| G | 9 | **UNOWNED** | The scenario file contradicts itself about Imperial County, and it is the county this whole question turns on. SoCal's note says it receives "San Dieg |

### `diplomacy` — 20 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | What does the overture cost? Four options, none chosen: the whole turn with a chance of refusal; the whole turn always landing; a standing payment; on |
| Q | 2 | **STAGE3** | The petition gap's number, which must be set as a set of three beside politics ruling 15's threshold and the secession line |
| Q | 3 | **STAGE3** | Mediation — the only idea in the round where one action moves three nations. "Either the answer to the action budget or a reason to reject it outright |
| Q | 4 | **STAGE3** | The vassal's tithe, and what the overlord's veto costs the overlord |
| Q | 5 | **UNOWNED** | Finding K — is vassalage the pariah's escape hatch, and is it too cheap? Vassalage sits on aid; aid is not recognition-gated; so submitting to your ow |
| Q | 6 | **UNOWNED** | Does the federal remnant open recognising nobody? Deferred alongside ruling 8 — and ruling 8 has since been superseded, so the deferral's reasoning no |
| Q | 7 | **UNOWNED** | Are the contest hostility floors seeded at the same time as the Texas recognition change? D222's own scope note leaves it open |
| Q | 8 | **STAGE3** | What does sponsorship cost per turn — the action every turn, or a standing payment? |
| Q | 9 | **AARON** | Should a hundred-turn deal be on the menu at all? Half the game |
| G | 1 | **UNOWNED** | ❌ aid.recognitionBoost is a dead tunable whose doc string claims it is "the one route out of the recognition trap that does not involve winning a war. |
| G | 2 | **UNOWNED** | ❌ revoked has no label. Fifteen memory kinds, fourteen labels; the raw key leaks into the player's sentence |
| G | 3 | **UNOWNED** | The 33 hostile pairs have never been measured. "A data job, half an hour, and every argument about the thaw rests on it" |
| G | 4 | **UNOWNED** | A stale 89% / 91% figure whose replacement is unmeasured |
| G | 5 | **UNOWNED** | Finding H is uncountable until the petition gap has a number — how many movements sit permanently in the asking state, able to ask forever and never l |
| G | 6 | **UNOWNED** | No stance machine, so every ruling naming a state names something the game cannot represent |
| G | 7 | **UNOWNED** | Two names for one stage. Rounds 1–4 send numbers to "the mechanics stage"; Aaron's word is architecture. Ruling 9 flags it and declines to fix it: "re |
| G | 8 | **UNOWNED** | DESIGN.md states in two places that treaties and aid do not exist. Both are built. Open since 6 September |
| G | 9 | **UNOWNED** | No hostility gate on trade or transit, against three conquest rulings |
| G | 10 | **UNOWNED** | Is an offer visible to everyone, or to nobody? "The board's whole atmosphere depends on this and it has never been asked" |
| G | 11 | **UNOWNED** | Three stale counts about this round survive in the planning documents — the rulings, the findings and the in-tray totals each appear with two differen |

### `economy` — 13 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | Should a shortage upstream throttle PRODUCTION, or only tax the journey? Aaron's §B, recommended for the alpha and never answered. It is the same deci |
| Q | 2 | **AARON** | What coefficient gates farming on extraction? Ruling 7 does not work without the term at all, and the term is not in the authoritative spec, which may |
| Q | 3 | **ALPHA** | Is one upstream chokepoint the best thing in the model or the most brittle? Extraction now does three jobs — fuel, ore and fertiliser. Paper cannot te |
| Q | 4 | **AARON** | Does lasting infrastructure damage exist? A wrecked rail hub lasts one turn — a raid, not a demolition |
| Q | 5 | **AARON** | IT's intel error against relationship-gated sight. Two systems now decide what you can see of another nation and they were designed a week apart |
| Q | 6 | **DATA** | Where phosphate, potash and natural gas actually are.  Unverified, and ruling 7 rests on it. "It must be checked against real data and not from memory |
| G | 1 | **UNOWNED** | Three documents use three different names for the same six sectors — the data file, the spec, and the wiring page |
| G | 2 | **UNOWNED** | Not one formula in §§3–4 has a tunable key, against the project rule that every model constant is one. The spec claims otherwise in writing |
| G | 3 | **UNOWNED** | The band ladder leaves two numeric gaps at 0.89–0.90 and 1.10–1.11 |
| G | 4 | **UNOWNED** | Military upkeep is absent from the treasury line and is computed every turn |
| G | 5 | **UNOWNED** | Aaron's 35 arrows exist only outside this repository. The design input is not in the project |
| G | 6 | **UNOWNED** | Spec §1.6 and §5.5 are dead letters inside an authoritative document. D166 rules the recognition block stays; the spec still specifies replacing it, a |
| G | 7 | **UNOWNED** | The toll models disagree in SHAPE, not in value. The spec has per-mode multipliers compounding on delivered cost; the build has one rate with per-mode |

### `events` — 16 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **STAGE3** | Is three crises a game too few? "It is a number, numbers are the architect's" — and at 200 turns it is ten, not three |
| Q | 2 | **STAGE3** | Adjacency hops, or buy real coordinates? "Not free" |
| Q | 3 | **STAGE3** | How many hops is a radius? No number is proposed anywhere and no tunable exists |
| Q | 4 | **UNOWNED** | What is "the share of your ground" — Areas, population, or GDP? |
| Q | 5 | **UNOWNED** | How does ruling 2 scale sentiment, which is already per-Area? Two incompatible readings |
| Q | 6 | **UNOWNED** | What does a shock look like on screen? "A crisis is a card; a shock is a card and a shape" |
| Q | 7 | **AARON** | Does a crisis stay blocking, or become a defaulted briefing card? |
| Q | 8 | **UNOWNED** | How are the three briefing sections ranked against each other? |
| Q | 9 | **STAGE3** | The vocabulary against the designed economy — finding A: "the vocabulary gains a term or the shock lands elsewhere" |
| G | 1 | **UNOWNED** | neighbourDied is temporal, not spatial. It never asks adjacency; any death anywhere within four turns fires it. The ideation overstates it as "the onl |
| G | 2 | **UNOWNED** | The per-turn cap is spent in roster insertion order with a hard stop. Not documented as a decision anywhere |
| G | 3 | **UNOWNED** | The shock budget ruling 6 requires has no tunable key |
| G | 4 | **UNOWNED** | Nothing ranks a world dispatch against a movement's demand in the briefing |
| G | 5 | **UNOWNED** | The game has no notion of a capital as a place an event can target — so the story's protests-at-the-capital can only be told generically |
| G | 6 | **UNOWNED** | "Three crises in a sixty-turn game" is stale against a 200-turn game and has never been restated |
| G | 7 | **UNOWNED** | A dispatch lasts "until the standing number changes back" — the only object in the round that is wide in time, and nothing says what changes it back |

### `force` — 10 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | Is the allocation three slices or four? The fourth is an unconfirmed default, absent from the list Aaron confirmed, and a traced scenario already narr |
| Q | 2 | **UNOWNED** | The fight must be a stated percentage on EVERY attack. Ruled; nothing built |
| Q | 3 | **UNOWNED** | Upkeep is charged on a quantity nobody can choose. Should force size become a lever, or should the tunable stop claiming it is a question? |
| Q | 4 | **UNOWNED** | What does "good tech increases your chance" mean? Named by Aaron; no tech system exists anywhere in the game |
| Q | 5 | **STAGE3** | The magnitudes for the three kinds of base |
| G | 1 | **UNOWNED** | ❌ mil.suppressLiberty is defined, documented, was cited twice in a design document, and is read by nothing |
| G | 2 | **UNOWNED** | The AI's five allocation weights are literals in code, against the project's standing rule |
| G | 3 | **UNOWNED** | Upkeep's doc string claims it makes "how much force" a question. There is no lever on force size |
| G | 4 | **UNOWNED** | The three kinds of base have no data, no formula and no magnitude — and the naval one's trade bonus crosses into the economy |
| G | 5 | **UNOWNED** | The radicalising garrison has a home and no number |

### `governing` — 12 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **STAGE3** | What multiple does martial law apply, and what does it cost nationally? §6 names both and neither exists. The 50% coverage gate has no tunable either |
| Q | 2 | **AARON** | At what point may a government become the movement? Ruling 9's "over a certain number" — no threshold named and none invented |
| Q | 3 | **STAGE3** | The referendum has no numbers at all — no threshold to call one, no cooldown, no duration for "set back for years" |
| Q | 4 | **AARON** | Does martial law cost an action? Aaron deferred it: "we need to change the whole one action per turn."  That has since happened — D218 removed the act |
| Q | 5 | **AARON** | Should type ever be more than Republic? Two tunables are single-entry objects waiting for it |
| Q | 6 | **UNOWNED** | Re-run the election measurement. §3.3 — undated, and the two denominators differ by eighteen |
| G | 1 | **UNOWNED** | The government record has two fields the design never names — lostAt/lostFrom and lastChange |
| G | 2 | **UNOWNED** | leader.termTurns's doc is stale. It still calls itself a placeholder and says "0 means leaders serve for life"; the clock moved into the election |
| G | 3 | **UNOWNED** | The election measurement is undated and its denominators differ — 284 against 266, unexplained |
| G | 4 | **UNOWNED** | Martial law and the referendum have no tunables, no code and no data. Both are fully ruled |
| G | 5 | **UNOWNED** | "Become them" has no price, and it is the only one of the five moves that does not |
| G | 6 | **UNOWNED** | Nothing says what a government does with a movement whose verb is Rejoin — the only verb curable by governing better, and there are zero authored ones |

### `identity` — 14 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **STAGE3** | What is MAXDISTANCE on the three-axis board? §3.1. Every tuned threshold is measured against it. 2√3 ≈ 3.4641 is the arithmetic; nobody has authored i |
| Q | 2 | **AARON** | Does the 2024 seed land directly on the two centrists? §4.2. If it does, ruling 1's "largest single job in the change" does not exist. An observation  |
| Q | 3 | **AARON** | Do the nine movements marked ? stand as placed? §5. Aaron's own instruction was that the table is "for Aaron to correct" and it has not been corrected |
| Q | 4 | **AARON** | Should the three empty positions stay empty? §5.1 argues they are correct — movements organise against governments, and the authoritarian corners are  |
| Q | 5 | **AARON** | What does despotism buy and what does it cost? Deferred to F19 after the alpha, at Aaron's instruction. No placeholder was invented and none should be |
| G | 1 | **UNOWNED** | MAXDISTANCE has no authored value. Also open question 1 and GDD.md gap 11 — it is both a decision nobody has taken and a number nothing can run withou |
| G | 2 | **UNOWNED** | Why each of the six movements was struck is written down nowhere. §5.3. Which six is now verified; the reasoning is not. The round names two in passin |
| G | 3 | **UNOWNED** | Nothing specifies how a three-axis board is DRAWN. Two axes are a scatter plot. Three are not, and the nation panel currently shows a position on two |
| G | 4 | **UNOWNED** | Nothing says what happens to a party that would drift OFF the board. §2.4 names Despotism and Stateless as where you land, and F19 defers the mechanic |
| G | 5 | **UNOWNED** | The cultural-region minority split is specified for four ideologies and the design has eight corners plus two centrists. §8.1 names the cost; nothing  |
| G | 6 | **UNOWNED** | SIX MOVEMENTS THE DESIGN STRUCK ARE STILL SPAWNING. Secession ruling 45 removed them; data/parties.json carries all six at a 0.5 spawn chance. Verifie |
| G | 7 | **UNOWNED** | Ruling 41 raised three growth caps from 0.35 to 0.45 and the data still says 0.35. Sagebrush, Acadiana and El Paso United cannot cross the 0.40 secess |
| G | 8 | **UNOWNED** | The re-map's "Was" column disagrees with the baked data for SEVEN of twenty-six, including Deseret — which DESIGN.md states outright is counted as Con |
| G | 9 | **UNOWNED** | Nothing states whether two nations may hold parties at the same position and what that means to each other. Ruling 40 says Dallas and Vermont hold two |

### `missions` — 16 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **ALPHA** | How long should a tree take? A game is 200 turns and nobody has played one. The first tree played is the measurement |
| Q | 2 | **AARON** | Does a tree ever expire, or can it be picked up at turn 180? |
| Q | 3 | **AARON** | What happens to a tree when its nation is conquered? Diplomacy ruling 18 makes a claim inherit with the ground; nothing says whether a tree does |
| Q | 4 | **AARON** | Do the other fifty-four nations get trees later? |
| Q | 6 | **STAGE3** | Does a Lake Michigan port reach the Canada corridor without passing Mackinac? §5.1 |
| Q | 7 | **AARON** | Does an alliance require mutual recognition? Trade, treaty and transit all test it; an alliance is not built, so nobody has ever asked. §7.1a unblocke |
| Q | 8 | **STAGE3** | Can a smuggler's rate reach the world market for a nation with no port? The market is "a haircut rather than a lock" because "refusing external trade  |
| Q | 9 | **AARON** | Should a tree be balanced against a board that varies by seed? §10.5: Deseret's pivot is the largest permission any tree grants, and board-design.md § |
| G | 1 | **UNOWNED** | A mission's record has no specified shape beyond §1 — no field list, no home in STATEFULMODULES, and completed missions are persistent state |
| G | 2 | **UNOWNED** | Nothing specifies how a tree is shown. Belongs to presentation-design.md; named here because momentum is a presentation property before it is a mechan |
| G | 3 | **UNOWNED** | Nothing says what happens when two nations sharing a tree complete the same mission. Both live trees are shared |
| G | 4 | **UNOWNED** | Former Glory needs the Republic of Texas's claimed boundary painted as a region. The map editor does exactly this. Its extent was not verified and mus |
| G | 5 | **UNOWNED** | Chicago and Detroit are not on the board. The Great Lakes G5 is computable today and means much less than it will when the story's city-states exist.  |
| G | 6 | **UNOWNED** | The Gulf is not a distinguishable set. The basin model says "the Gulf counts as Atlantic", and the county data flags coastal without saying which wate |
| G | 7 | **UNOWNED** | Nothing says what a mission's reward does when the ground that earned it is lost. §1.1 rules the mission permanent; whether a modifier tied to holding |
| G | 8 | **UNOWNED** | Nothing says whether you can see a RIVAL's tree. §10.1 shows the shared-tree design's best effect depends on it: the four Texan rebels open looking at |

### `movements` — 16 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | When does a movement start DEMANDING? Finding A: the petition threshold must sit below the secession threshold, and nobody set one. Ruling 12 made it  |
| Q | 2 | **STAGE3** | How many broken promises flip a verb? Ruling 22 deferred it and no figure was substituted |
| Q | 3 | **AARON** | Ruling 15's X% — the share at which a Unify movement's demand fires.  Constrained: it must sit BELOW 0.30, or the Farmers Union and Great Lakes Free T |
| Q | 4 | **STAGE3** | Should coreShare stay at 1.0? §5.1 records that it was defeated by a single annexation. A movement should declare when it holds its heartland |
| Q | 5 | **AARON** | Do the nine capped-out movements stay capped? §8.1. Ruling 41 answered three of nine and was not applied |
| Q | 6 | **STAGE3** | Is the 35% emergent ceiling or the per-movement growthCap the real one? §3.2 |
| Q | 7 | **AARON** | What does a REALISED movement do when its goal is met — dissolve, become the new nation's founding loyalty, or take a new goal? Four movements have al |
| Q | 8 | **AARON** | Keep the ideology gate for growing movements and make it a modifier for realised ones? Parked by Aaron: "let's wait on that ideology until we get ther |
| G | 1 | **UNOWNED** | The authored record shape is not DESIGN.md's record shape. §2. No homeland, seed, sponsor, nation or state key exists in the file, yet three separate  |
| G | 2 | **UNOWNED** | The published sentiment formula omits sent.wLocal. §3. Grievance blends the Area's own stocks with the nation's at 0.55 and the formula shows neither  |
| G | 3 | **UNOWNED** | Two ceilings for one quantity. §3.2 — a 35% emergent ceiling against per-movement caps up to 0.60 |
| G | 4 | **UNOWNED** | No demand machinery exists at all. §4. The only demand in the code is the economic kind |
| G | 5 | **UNOWNED** | Nothing founds a movement in play, and the middle game depends on it. §7 |
| G | 6 | **UNOWNED** | The data's type vocabulary is superseded and four verbs changed without it. §8.2 |
| G | 7 | **UNOWNED** | A live defect: the three places that read a movement's strength take the largest movement share in an Area with NO CHECK ON WHOSE MOVEMENT IT IS — so  |
| G | 8 | **UNOWNED** | DESIGN.md's core examples do not match the baked data. It says Deseret's core is "the Wasatch Front (6 Areas)"; the baked core adds Mohave and Yavapai |

### `nation` — 17 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | ❌ Should every birth route give the same birth? Round 1 says yes in one sentence. The build says no in five places. Is the difference a design or a de |
| Q | 2 | **UNOWNED** | Is the remnant's victory the same conditions told two ways, or its own set?  Now THREE candidates, not two — the Texas tree's pivot supplies one nobod |
| Q | 3 | **UNOWNED** | One tunable or two for 250,000 and 500,000? |
| Q | 4 | **UNOWNED** | Is the second stranding condition still needed under the fork? The fork may have removed the reason for it |
| Q | 5 | **STAGE3** | Are the victory targets still right against a 200-turn horizon? |
| Q | 6 | **AARON** | Are the opening memories dated across the two years, or all stamped "two years ago"?  Two years is eight turns of decay. Measure before building |
| G | 1 | **UNOWNED** | ❌ The honeymoon and the transition cost fire from exactly one of five birth routes |
| G | 2 | **UNOWNED** | ❌ Ruling ideology is null for every nation born in play except a declaration, which makes one victory condition permanently unwinnable for them and dr |
| G | 3 | **UNOWNED** | Envelopment's 500,000 is not a tunable, against the ruling's own "both figures become named tunables" |
| G | 4 | **UNOWNED** | A dead outcome branch in the civil war. One file tests for an outcome string that another file never produces — so on a fall-apart the code falls thro |
| G | 5 | **UNOWNED** | The transition GDP cut is described as having a duration in three places and has none |
| G | 6 | **UNOWNED** | The release recipient test is stale in the design document — "a live trade relationship" was replaced by standing, with the reason written in the code |
| G | 7 | **UNOWNED** | "Name and flag, both derived" is half wrong. The flag is; the name is drawn once, stream-dependent, and stored |
| G | 8 | **UNOWNED** | Going with the breakaway is offered on the declaration route only — not after a failed union or a civil war |
| G | 9 | **UNOWNED** | kind is never set by any in-play birth, so the label "declared breakaway" can never appear on a nation that declared |
| G | 10 | **UNOWNED** | A "half the people, half the economy" reunification claim against thresholds of 0.3 — the tunable doc strings say "Half" and then quote figures consis |
| G | 11 | **UNOWNED** | "All 51 are playable" survives in the design document against the 61-nation board used everywhere else in the same file |

### `opening-board` — 14 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | What does the 1 March 2036 front page actually SAY? The prose does not exist |
| Q | 2 | **AARON** | Is the per-nation front page ever built? Rejected for now — "the per-nation version stays available later at the cost of prose alone" |
| Q | 3 | **UNOWNED** | Should the turn-0 power bands be re-measured on 61 nations? The published spread was taken on the pre-Shattering board and includes none of the extrem |
| Q | 4 | **AARON** | Is it acceptable that in roughly 18% of games Deseret touches no Californian ground? Its only link runs through a leaf that cedes at 0.82 |
| Q | 5 | **AARON** | Does the recognition exception cover Riverside [BUILT]? Deseret's lifeline runs through a three-Area landlocked successor nobody had considered |
| Q | 6 | **AARON** | Are the opening memories dated across the two years, or all stamped "two years ago"?  Two years is eight turns of decay. Measure before building |
| G | 1 | **UNOWNED** | Deseret's movement homeland and the scenario's cession set are DIFFERENT SETS — 61 Areas against 57 — and nothing reconciles them. A ceded Area outsid |
| G | 2 | **UNOWNED** | The scenario's own text contradicts its own data — it says California dissolved into five successors and ceded the north, while the data holds six inc |
| G | 3 | **UNOWNED** | The 0.070 → 0.181 recognition figure carries no date and is a ONE-SEED measurement, printed in one document beside a twenty-seed sweep in a way that r |
| G | 4 | **UNOWNED** | Austin's authored note quotes vote figures that do not reproduce from the data it cites |
| G | 5 | **UNOWNED** | The blurb is dead content — never read by any code, quoted in design documents as though it were in the game |
| G | 6 | **UNOWNED** | The front page is ticked ✅ in the master against a ruling rather than against content. Nothing is built |
| G | 7 | **UNOWNED** | Two tunable doc strings describe a board that no longer exists — both calibrate against "the largest opening nation, California at 12.7%". California  |
| G | 8 | **UNOWNED** | The turn-0 power bands are a measurement on the 51-nation board |

### `population` — 13 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **STAGE3** | Was world.popGrowth ever measured? It was recorded as provisional — "M5.3 measures it and M5 tunes it" — and no record of that measurement was found.  |
| Q | 2 | **STAGE3** | Should attractiveness be normalised rather than clamped? §5.3. Clamping compresses the top of the range, so two very attractive Areas can read the sam |
| Q | 3 | **AARON** | Does migration ever need to cross a border it has no reason to cross? Stated as a known limit: "a diaspora cannot form on the far side of the continen |
| Q | 4 | **STAGE3** | Do the migration weights survive the three-axis board? Alignment reads affinity, and every weight here was tuned against a denominator that D231 chang |
| G | 1 | **UNOWNED** | The drift formula's neighbourhood weight is not a named tunable. §3.1. Derived as 1 − owner − anchor; a reader will search for a key that does not exi |
| G | 2 | **UNOWNED** | world.popGrowth carries no measurement. Also open question 1 |
| G | 3 | **UNOWNED** | Clamping versus normalising the migration pull is undocumented as a choice. §5.3 |
| G | 4 | **UNOWNED** | DESIGN.md §7.6 says migration reads quality of life and liberties as "the nation's". It blends 60% per-AREA (migration.wLocal = 0.6). The document pre |
| G | 5 | **UNOWNED** | DESIGN.md §12 lists per-Area stocks as NOT BUILT and calls it the number-one structural gap. They ARE built — the columns exist and a ground phase com |
| G | 6 | **UNOWNED** | DESIGN.md's phase list omits the ground phase entirely. It runs after the writeback and before the power stocks, "so the national stocks it blends fro |
| G | 7 | **UNOWNED** | DESIGN.md §4 points migration at §7.7. Migration is §7.6; §7.7 is instrumentation |
| G | 8 | **UNOWNED** | world.partyFloor's doc says a cleaned-up movement's share is "redistributed". The code deletes the entry and leaves the population untouched — which i |
| G | 9 | **UNOWNED** | Nothing specifies what migration does when a position has no people in it. With ten positions rather than six, empty positions become common — §5.1 of |

### `power` — 11 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **UNOWNED** | Does military readiness ever become an Authority term? It was named in the plan alongside two that arrived, and never came |
| Q | 2 | **UNOWNED** | Two lookup tables hold ONE entry each and fall back for everything else — the tolerance of a form of government, and what a government costs to run. T |
| Q | 3 | **UNOWNED** | Should Authority, Influence and weariness follow quality of life and liberties into being PER AREA? Two of the five already are |
| Q | 4 | **UNOWNED** | Should the turn-0 bands be re-measured on the 61-nation board? The published spread was taken on the pre-Shattering 51 and includes none of the extrem |
| G | 1 | **UNOWNED** | Nothing specifies in one place what a stock is FOR downstream. Five stocks feed sentiment, elections, victory, coalitions, migration and the faction p |
| G | 2 | **UNOWNED** | The signed-value helper is exported, documented and dead, and five comments describe it as live |
| G | 3 | **UNOWNED** | DESIGN.md's weariness row names a term that does not exist and omits one that does, and its worked Why-record example is arithmetically impossible — t |
| G | 4 | **UNOWNED** | The liberties block has two bookkeeping faults — a "largest negative weight" claim that is false, and a term filed in the wrong tuning group so it ren |
| G | 5 | **UNOWNED** | Two stocks are missing from the module's default export. Harmless today only because every consumer imports the namespace; a consumer using the defaul |
| G | 6 | **UNOWNED** | The turn-0 bands are a measurement on a board that no longer exists |
| G | 7 | **UNOWNED** | DESIGN.md says twice that treaties and aid do not exist while both are live Influence terms. Open since 6 September |

### `presentation` — 13 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | What ranks the three briefing sections against one another? The main screen of the game, and nothing ranks a world dispatch against a movement's deman |
| Q | 2 | **AARON** | Does a card block? Two live designs — built blocking, designed non-blocking with a worst-case default. Neither document rules it |
| Q | 3 | **AARON** | Is the player TOLD when their paper becomes state press? TONE.md open question 1. Recommendation: tell them once, in the model's voice, and never agai |
| Q | 4 | **AARON** | Do the 23 permanently-hostile pairs play each other blind for the whole game? Round 7 finding E. It is the information environment of the Texas missio |
| Q | 5 | **AARON** | Does a grudge show how long it has left? §9.1. Three options; the recommended one shows direction and not date |
| Q | 6 | **AARON** | Does a vassal see its overlord's books, or the reverse? The ladder in §7.1 has no row for it, because diplomacy-design.md has no answer for vassalage  |
| G | 1 | **UNOWNED** | "The worst option available" is undefined for a symmetrical card. It is ruled for a movement's demand and reaches nothing else. Three readings in §2.2 |
| G | 2 | **UNOWNED** | A one-turn event is not on the timeline. The timeline carries ownership deltas only, so a shock that reshaped three economies for a quarter cannot be  |
| G | 3 | **UNOWNED** | The headline set is part of the three-axis conversion and is not priced. One variant per ideology, six today, ten designed. GDD.md §15.1a lists what c |
| G | 4 | **UNOWNED** | No crisis carries a visibility flag. §7.3 resolves half of round 7's finding F and this is the other half. Twelve built rows, none says whether the co |
| G | 5 | **UNOWNED** | Nothing specifies the developer dashboard's relationship to these screens. It exists, it is behind the dev flag, and §4.3 has just given it a second j |
| G | 6 | **UNOWNED** | The opening board holds no offers in flight. §10.1. Aaron's taught first turn needs one; the opening position has no such state. opening-board-design. |
| G | 7 | **UNOWNED** | A peace treaty as recognition is a mechanic with no home. §10.1. Aaron's, invented in passing, and it couples two things diplomacy-design.md currently |

### `trade` — 21 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **AARON** | Should a hundred-turn deal be on the menu at all? It is half the game |
| Q | 2 | **STAGE3** | What does signing a long agreement cost? D228's surviving half. Today: nothing |
| Q | 3 | **UNOWNED** | Which of the FIVE toll regimes governs, and does a club override the corridor system or does the corridor system learn a second mode? |
| Q | 4 | **UNOWNED** | Which of the two LIVE built systems is the one the game means? New |
| Q | 5 | **UNOWNED** | Are the 59 river/inland ports geography or a data fault? The answer changes how many nations can trade at all |
| Q | 6 | **AARON** | Does anything on this board have a LENGTH? The data build computes centroids and throws the coordinates away |
| Q | 7 | **STAGE3** | Can a smuggler's rate reach the world market for a nation with no port? The market is "a haircut rather than a lock" and is reached "only through an o |
| Q | 8 | **STAGE3** | Should a Lake Michigan port reach the Canada corridor without passing Mackinac? |
| Q | 9 | **AARON** | Does lasting infrastructure damage exist? A wrecked rail hub lasts one turn — a raid, not a demolition |
| G | 1 | **UNOWNED** | The spec's five price multipliers reach no screen and no code. A partner with no other supplier behaves exactly like one with three |
| G | 2 | **UNOWNED** | The spec's duration table is keyed to a menu that no longer exists, and the spec may not be corrected without permission |
| G | 3 | **UNOWNED** | The external market is still the pre-A1 model — a one-off click that banks the money and uses the turn. No term, no expiry, no row on the deals screen |
| G | 4 | **UNOWNED** | Two sections of the authoritative spec are dead letters and say so in their own text. Somebody will build them unless this is said out loud |
| G | 5 | **UNOWNED** | The spec contradicts itself on whether goods move. Two sections say they do; the build says settlement is a treasury credit and nothing else, pinned b |
| G | 6 | **UNOWNED** | Nothing says what a border crossing IS, mechanically. Thirty-two are named; holding one puts Canada or Mexico in reach and does nothing else — and a m |
| G | 7 | **UNOWNED** | Nothing says whether a corridor survives its grantor being annexed, though grants are keyed by grantor |
| G | 8 | **UNOWNED** | Nothing says what an ungoverned chokepoint is — open, shut, or free |
| G | 9 | **UNOWNED** | Breaking a trade deal early does not exist |
| G | 10 | **UNOWNED** | Collective embargo is gestured at and never defined |
| G | 11 | **UNOWNED** | Four stale code comments from the duration change, one of which describes a contract that was replaced — a figure it calls byte-for-byte identical is  |
| G | 12 | **UNOWNED** | The rate limit on the logistics ratio's fall is deliberately unset — the architect's |

### `turn` — 13 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 2 | **AARON** | Are the opening memories dated across the two years, or all stamped "two years ago"? W43 says date them — the list is already dated and decays per tur |
| Q | 3 | **DATA** | Do the painted movements actually cap out by turn sixty at the shipped tuning? The 60-turn spread figures may predate M5.3's reduction of sent.maxRise |
| Q | 4 | **STAGE3** | Are the victory targets still right against a 200-turn horizon? §7.2 |
| Q | 5 | **STAGE3** | Is sixty nations starting several projects each affordable? §9 |
| Q | 6 | **STAGE3** | Does anything other than the player's own choice end a nation's slot? With no budget there is no natural terminator. §12.4 sharpens it: a war card arr |
| Q | 7 | **AARON** | What does turn 1 offer a player who has never seen this game before? §12.1 traces it: the old rule told a newcomer what a turn was for and when they h |
| G | 1 | **UNOWNED** | A project's record has no specified shape. §3.1 lists what one must hold; nothing says where it lives, how it is saved, or how it is addressed |
| G | 2 | **UNOWNED** | Nothing specifies a card's vocabulary. Two full-screen cards exist — an expiring deal and a transit request — and neither is described as an instance  |
| G | 3 | **UNOWNED** | Nothing says how the three briefing sections are ranked against one another. The newspaper ranks headlines "by kind and magnitude" within itself; ther |
| G | 4 | **UNOWNED** | It is not written down whether turn order is re-shuffled each round or drawn once. The turnorder RNG stream exists; the policy is not stated in any do |
| G | 5 | **UNOWNED** | There is no rule for cancelling a project. §3.3 covers a project you cannot pay for. Nothing covers one you no longer want |
| G | 6 | **UNOWNED** | "Discovery" has no mechanism. §3.4 requires that a covert project can be found out and that haste makes it likelier. Nothing in the build has ever hid |
| G | 7 | **UNOWNED** | Nothing says what discovery REVEALS. A covert project is "visible only to its owner until discovery" — so when discovery fires, does the other side se |

### `war` — 21 items

| | # | Bucket | Item |
|---|---|---|---|
| Q | 1 | **UNOWNED** | Does the movement accelerant STACK across hostile pairs? If it does, every Texan nation carries a permanently quadrupled separatist movement and Texas |
| Q | 2 | **UNOWNED** | The repayment basis gives a pure defender zero |
| Q | 3 | **AARON** | What magnitude does Wary's acceptance multiplier take? The ruling refuses a number and refuses a placeholder |
| Q | 4 | **UNOWNED** | Does conquering Austin [BUILT] end its recognition veto, or make the four rebels pariahs for good? "The first makes conquest the answer; the second ma |
| Q | 5 | **UNOWNED** | Does Hostile's floor lift when the contest ends? The only exit other than the accidental one |
| Q | 6 | **UNOWNED** | Is occupied-movement's 50% related to the 0.40 secession threshold, or set independently? "One will quietly make the other pointless." An invented pla |
| Q | 7 | **UNOWNED** | Does the betrayal punishment need the ledger backstop? Today the nations with the most enemies have the least to lose from betrayal |
| Q | 8 | **UNOWNED** | Do corridors renew? A ruling was made believing corridors were standing tolls; they are term contracts, so "Austin's routes die by themselves when the |
| Q | 9 | **UNOWNED** | Can a Unite create a new claimant for an existing reunification contest? "If a contest can gain a claimant in play, the permanent floor can be laid do |
| Q | 10 | **STAGE3** | Is the price of an attack greater than one turn of the target's output? Raiding-to-deny is now available every turn, for ever. "If it does not, raidin |
| G | 1 | **UNOWNED** | ❌ The dead outcome branch. No test, no deferred entry until today, no decision record. Present in the playtest build |
| G | 2 | **UNOWNED** | Home ground is stamped at birth and a ruling requires it to grow |
| G | 3 | **UNOWNED** | Desperation does not bite — nothing bad happens to a nation that does not trade. This blocks the third cause of hostility entirely |
| G | 4 | **UNOWNED** | A price must be settable by the seller. A cause of hostility names "an absurd price" and no screen anywhere sets one |
| G | 5 | **UNOWNED** | The measured outcome spread carries no date and is stale — the score multiplier has gained two factors since, and the live test measures the bare dice |
| G | 6 | **UNOWNED** | "Wars fought" counts triggered civil wars, because there is no war to count |
| G | 7 | **UNOWNED** | A mutable movement verb — a ruling changes what a movement is, and it is the one place the round asks for something that does not exist rather than re |
| G | 8 | **UNOWNED** | A logged term points at a tunable key that does not exist — so a union's odds are the one number a player cannot trace to a lever |
| G | 9 | **UNOWNED** | The scenario's own text contradicts its own data: it says California dissolved into five successors and ceded the north, while the data holds six incl |
| G | 10 | **UNOWNED** | Four victory figures say "half" and "three quarters" where the code says 0.30 and 0.55 |
| G | 11 | **UNOWNED** | THE WAR BLEED DOES NOT SAY WHAT HAPPENS TO THE PEOPLE. It removes them, and nothing anywhere says whether they died, fled, or changed sides — three di |
