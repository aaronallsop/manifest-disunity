# Hog Wild log

**Read this first when you come back.** Newest at the top. One entry per decision made without you,
each with the tag it landed on and the one command that undoes it.

The rules this log is kept under are in `docs/HOGWILD.md`. The short version: every entry says what
the question was, why I could not answer it, what I did instead, and how to reverse it.

**To see everything since you left**, in one go:

```bash
git log --oneline stage/a2d..HEAD
```

**To undo one stage entirely**, revert every commit it contains:

```bash
git revert --no-commit stage/<previous>..stage/<the one you want gone> && git commit
```

**To look at the game exactly as it was before a stage**, without changing anything:

```bash
git checkout stage/<previous>   # then: git checkout master
```

---

## Stage tags so far

| Tag | What landed |
|---|---|
| `stage/a1` | Trade deals with terms, negotiation, the deals screen |
| `stage/a2` | Transit agreements, tolls, revocation, the three screens |
| `stage/a2b` | The markets abroad on corridors; water beats rail beats road |
| `stage/a2c` | The rivers and the fifteen chokepoints |
| `stage/a3` | The trade network map |
| `stage/a4` | The other sixty nations use the corridors |
| `stage/a2d` | Two seas rather than one ocean; Panama shut |
| `stage/a5` | What a right of way is worth, and the canal that was open after all |

---

## Runs

### Run 1 — 5 September 2026, 17:52 MDT

**Token counter at start:** 14,993,000 remaining of a 15,000,000 session budget.
**Started from:** `fe6b5a5`, working tree clean, `v0.6`, 948 tests green as of the last full run.
**Authorised by:** Aaron in chat — *"activate hog wild mode"* — **not** by the board, which said
otherwise. See the first entry below; this is the one thing to read before anything else.

**The plan, in order.** Two faults first, because they are things that are wrong rather than things
that are missing. Then the work that closes gaps, then the largest piece of new value.

| # | What | Why it is in this position |
|---|---|---|
| 1 | `DESIGN.md` for A2b, A2c, A2d, A3, A4 | A rule of this project that I broke. Nothing else should land before the record of what already landed. |
| 2 | A port grant should cost more than a road grant | Flagged by Aaron as immediate on 5 Sep and not built. Small. |
| 3 | The five success metrics on the board | They have read "not yet measured" since they were written; three are measurable now. |
| 4 | Close `deferred.md` #3 and #5 with evidence | Both are answerable; #3 has been fixed for a while and the entry never caught up. |
| 5 | Distances between ports | The biggest single piece. Three separate open questions all wait on this one measurement. |
| 6 | The industry re-bake | Approved (D169), measured at 84% real-data coverage against nought per cent today. |
| 7 | Tidy the stale roadmap | Three "after the economy alpha" phases were delivered by the alpha track and still read as not started. |
| 8 | `deferred.md` #6 — the simulator over a live world | The trap in it is already documented; this is closing it. |
| — | ~~The autarky economy~~ | **Parked by Aaron (D175).** Blocked on his written predictions. Not in this run. |
| — | ~~A politics-alpha strip-back~~ | A new phase, not a task. Does not start without him. |

---

---

# RUN 2 — the design stage, 15 September 2026

**Started 14:00 local.** Token counter at activation: **14,995,073 remaining.**
**Aaron ticked Hog Wild on the board at 19:59 UTC** and said *"Iniate wild hog mode"* in session.

**⚠ This run did NOT start from a fresh session.** He activated inside the conversation that cleared
the desk, so the protocol's step-3 restart was skipped. **That is his call and it costs nothing here**
— the desk was cleared first, which is the step that actually matters, and the handoff
`2026-09-15_1215` holds everything a fresh session would have read.

**Unlike run 1, this run writes DOCUMENTS, not code.** No game code, no data, no tests are touched.
That changes what "a stage" means: **a stage is one design document**, and its tag is
`stage/<name>-design`.

## The plan — fifteen documents, in this order

**The order is by what unblocks the most, not by size.** Dependencies in this folder are "reads from"
rather than "must follow", and they are circular in places (power aggregates the systems that cite
it), so a strict topological order does not exist. Where it is circular the later document cites the
master, which already carries the shared concepts.

| # | Document | Why here |
|---|---|---|
| 1 | `identity-design.md` | **Substrate.** D231 unblocked it this morning and four documents wait on it |
| 2 | `population-design.md` | Needs identity. The six counts, drift, migration, growth |
| 3 | `movements-design.md` | Round 1's 53 rulings — the largest single bank |
| 4 | `governing-design.md` | Round 3's 41 rulings. Needs movements |
| 5 | `economy-design.md` | ⚠ **Carries the logistics brake decision.** See the log entry when it lands |
| 6 | `trade-design.md` | The most finished thing in the project. Needs economy and board |
| 7 | `force-design.md` | One number, four slices. Small on purpose |
| 8 | `war-design.md` | Round 2's 41 rulings. Needs force |
| 9 | `diplomacy-design.md` | Round 5's 22 rulings. Holds the eight-state pair spine |
| 10 | `blocs-design.md` | ⚠ **Carries the three internal-trade regimes.** Needs diplomacy and trade |
| 11 | `events-design.md` | Round 6's 7 rulings. Deliberately thin |
| 12 | `nation-design.md` | The frame. One machine for nation-making — the seam D217 created |
| 13 | `opening-board-design.md` | Needs nation. Built vs designed down the middle of every page |
| 14 | `power-design.md` | **The aggregator, so it goes near the end** and can cite the systems it reads |
| 15 | `ai-design.md` | Needs the turn and every system's preview |

## ⛔ PARKED BY NAME for this run

| Parked | Why | Un-parked when |
|---|---|---|
| **`presentation-design.md`** | Depends on `docs/design/TONE.md`, which **does not exist**. Aaron is being interviewed for it in a separate Claude chat using `prompts/tone-interview.md`. **Writing it without that means inventing the game's position on its own subject matter** — the clearest stop-and-wait case in `HOGWILD.md`: *a matter of taste about how the game should feel, with no measurement that could settle it* | `TONE.md` lands in `docs/design/` |

## Two things this run must NOT invent, decided before it started

1. **`MAX_DISTANCE` on the three-axis political board.** It is the denominator of the one function
   that drives coalitions, drift, splinters, defection, civil-war severity, trade alignment, liberty
   satisfaction and AI diplomacy — **so every tuned threshold in the game is measured against it.**
   It is the architect's. *`GDD.md` gap 11.*
2. **The game's tone.** See parked, above.

## The standing shape of every document

Five parts, per `CLAUDE.md`: **Depends on** → the system (what it does, what it is measured in, what
the player sees, what happens at each level) → **Open questions** → **Gaps** → **traced scenarios.**

**And a number without a provenance does not go in.** Measured (from a named file, with its date),
authored (a tunable), or unset. **No figure is published that was not measured this session or is
not carried forward with its original date attached.**


## Entries

### I chose the brake on the runaway that can destroy a nation for trying to fix a shortage — *stage/economy-design, 15 September 2026*

**This is the largest thing I have decided in your place in this run.**

**The question.** Your economy round found a loop that feeds itself. A nation goes short of something,
so it buys it from a neighbour. Buying it raises the amount of stuff it is hauling. Hauling too much
makes its transport network fail — **routes break and a fifth of everything in transit is lost.** So
less of what it bought actually arrives. So it buys more. **The cure feeds the disease, and nothing
stops it.** Your round named three possible brakes and chose none of them. One had to be chosen
before the economy document could be written, because every other part of it reads the answer.

**Why I could not answer it by measuring.** **The spiral has never actually run.** It is a prediction
from reading the design, not something anybody has watched happen — so its severity is unknown and
only the *direction* is certain. There is no measurement that picks a brake.

**What I did.** **The transport ratio is not allowed to fall faster than a set rate per turn.** Not a
cap on the losses — a limit on how fast the situation is allowed to get worse.

**This is your own game's answer to the same problem, borrowed.** The five national stocks already
solve a runaway of exactly this shape, and the reason is written into the file: *clamping the value
leaves the pressure building underneath, so the moment the clamp lets go the nation falls off a
cliff — the clamp hides the problem.* **They limit how fast a thing can change instead.** I did the
same here.

**What I turned down, and why each one failed.**

- **"Let the transport network grow as demand grows."** It attacks the real cause, and I nearly took
  it. But your ruling 1.4(a) froze what industries a place has, and making one of the six able to
  grow is the precedent for all six. **It also creates a second spiral pointing downward that nobody
  has written** — capacity that rises with volume also falls with it.
- **"Cap the losses."** The cheapest — one number in one table. **But it only caps the symptom.** The
  demand keeps climbing and routes keep breaking; the spiral just runs through a different door.
- **"The world market's shipping cap already stops it."** ❌ **It does not touch the failure case at
  all.** The spiral runs on deals with the state next door, and the world-market cap only applies to
  goods going out through a port. **A landlocked nation buying food from its neighbour never goes near
  it.** This one is not a judgement call — it simply does not bind.

**What my answer costs, said plainly.** **It delays the pain rather than removing it.** A nation that
keeps buying into a shortage still gets there — it just gets several turns in which the goods are
still mostly arriving, which is enough time to notice the problem and stop. **That is the difference
between a trap and a spiral, and it is all I am claiming for it.**

**What I did NOT decide: the rate.** How fast is "too fast" is a feel number and it is the
architect's, exactly as the existing stock limits are. **I left it unset rather than inventing one.**

**⚠ And there is a second thing here that is genuinely yours.** On your wiring page you drew four
arrows saying **a shortage of transport should cut what a place PRODUCES**, not just tax the journey
— trucks for the ore, trucks for the goods, trucks for the food, fuel for the trucks. It was written
up as *the cheapest change on the page* and recommended for the alpha. **You answered every other
group on that page and never answered this one.** It puts a second arm on the same loop and makes the
spiral worse. **Choosing a brake and answering that are the same decision, and nothing in the project
connects them.** The brake I chose is the only one of the three that still works if you say yes to
it — which is part of why I chose it, and I want you to know that so you can discount it if you think
I bent the choice to fit.

**To undo it.** `git revert --no-commit stage/governing-design..stage/economy-design && git commit`


### D228 was put to you on a stale number, and I corrected half of it without asking — *stage/movements-design, 15 September 2026*

**The question.** Your deal menu lets a trade agreement run for a fixed term. This morning I put a
card to you saying the terms were six months, one year, two years and five years, and asked whether
a longer one should exist. You approved it. **The terms have actually been five, seven and a half,
ten, twelve and a half and twenty-five years since 6 September, because you raised them yourself
after playing.** So I asked you to add a sixth option to a menu that already had five, every one of
them longer than the longest one I told you about.

**Why I could not answer it.** I could, and I did — but it needed saying because **half of what you
approved is now meaningless and I decided which half on my own.** The part that says *"add a fifth
term"* is void. The part that says *"signing a very long agreement should cost something"* stands,
and I kept it.

**What I did, and what I turned down.** I kept the surviving half and wrote the error up as D233. I
rejected simply deleting D228 — your reasoning was sound and it is **more** urgent than when you gave
it, not less: the longest term on the menu is a hundred turns, **half the whole game**, and signing
it costs nothing at all. I also rejected re-asking you mid-run, because the substance of your answer
does not change and the run would stall on a correction rather than a decision.

**What I did NOT decide, and it is yours.** **Whether a hundred-turn deal should be on the menu at
all.** Your own reasoning — *nothing should be settled for a generation* — argues against a term the
menu already contains. I have left it open rather than trimming your menu on my own judgement.

**How it happened, because the shape matters more than the error.** Four documents agreed with each
other and none of them agreed with the game. The card quoted the project rules, which quoted the
design document, which was written before you changed the setting. **The real value was one search
away and nobody looked.** That is programmer rule 7 and I broke it.

**To undo it.** `git revert --no-commit stage/population-design..stage/movements-design && git commit`


### Run 1, entry 1 — I started with the board's Hog Wild switch turned OFF — *5 Sep, 17:52*

**The question.** Aaron said *"activate hog wild mode"* in conversation. The Control Board — which
is where this mode is documented as being switched on and off, and which is the only thing a
resumed overnight run can read — has Hog Wild **unticked**. Which one wins?

**Why I could not answer it from the rules.** Because the rules were written assuming the two agree.
`docs/HOGWILD.md` calls the mode "a standing permission, switched on and off on the Control Board"
and makes the board the leash for resumed runs. It never says what to do when the spoken instruction
and the switch disagree — and this is the first run, so nothing has settled it by precedent.

**What I did, and what I turned down.** I am running, on his instruction, and I have **not** touched
the permissions record. The instruction is unambiguous and was given seconds ago; refusing to work
over a checkbox would be pedantry, not caution. But I rejected the tempting fix — ticking the box
myself to match what he said. The board switch is the only thing that can stop a run while he is
asleep. A switch I can set is not a leash, it is decoration, and the value of the mechanism is worth
more than the convenience of it being consistent tonight.

**The cost of leaving it, stated so he can decide.** The overnight chain will not work. Every
resumed run re-reads the board before doing anything and winds down immediately when Hog Wild is
unticked. So this run continues until the usage limit and then **stops** rather than chaining. One
tick before the limit and the night runs; no tick and the work is simply waiting in the morning.
Either is a fine outcome; only one of them is the one he asked for last night.

**To undo it.** Nothing to undo — no code, no data, no record written. Untick nothing; the box is
already off.

---

### Run 1, entry 2 — "Touch anything live" is ticked, and I am treating it as though it is not — *5 Sep, 17:52*

**The question.** The board's saved permissions have `live: true` — *"Run against real data, real
services, or real people"*, the only high-risk permission besides Hog Wild itself. Every previous
session has run with it off, and Aaron's standing instruction is that it stays off until after the
economy alpha, with the playtest link sent to nobody.

**Why I could not answer it.** I cannot tell a deliberate tick from a mis-click, and the evidence
points at a mis-click without settling it. In the board's markup, **"Touch anything live" is the
checkbox directly above "🐗 Hog Wild Mode"**, and the page writes all five permissions together
whenever any one of them changes. The record was written at 17:19 MDT — roughly when he would have
been reaching for the Hog Wild box, and it is the one immediately above it. The state that came out
of that write is *live on, Hog Wild off*: precisely the inversion a slipped click produces, and the
exact opposite of what he then said out loud.

**What I did.** Nothing that depends on it, and I did not correct the record. Hog Wild explicitly
does not unlock publishing — *"Nothing goes to the playtesters. The `live` permission is separate
and stays separate"* — so tonight's work is unaffected either way, and no build reaches anybody.
I rejected setting it back to false myself for the same reason as entry 1: if I edit his permissions
to match my guess about his intent, the record stops being his.

**To undo it.** His to untick, on the board, if it was not meant. If it *was* meant, it changes
nothing about tonight and we should talk about what he wants live before anything ships.

---

### Run 1, entry 3 — The run stopped on its own first instruction — *5 Sep, 17:55*

**What happened.** I finished the activation, declared the mode operational, wrote *"Going quiet
now. Everything lands on disk as it happens"* — and ended the message. Nothing landed on disk,
because nothing more happened. Aaron asked whether the commit had hung. The commit was fine.

**Why, stated plainly enough to be useful.** I only act while writing a reply. When a reply ends, I
stop entirely until he speaks again — there is no background, no quiet continuation. So the protocol
step that says "Run" describes a state I cannot *enter* and then occupy; there is only continuing to
act, or stopping. I wrote a sign-off, and a sign-off is stopping. Three minutes of a mode designed to
run for hours.

**What I did.** Rewrote step 7 of `docs/HOGWILD.md` as an explicit rule rather than a single word:
after the operational line the next thing must be an action, work continues without a closing
paragraph, and the only message of mine allowed to end without one is the one beginning *"Starting
to wind down the hog."* Progress gets narrated *between* actions, never *instead of* them. The tell
for a repeat is written down with it.

**What I turned down.** Logging it as a one-off slip and carrying on. It is not a slip; it is the
protocol being wrong about what I am, and it would have recurred at every natural pause — which in a
run of eight stages is eight chances to silently end the night.

**To undo it.** `git revert` this commit. It changes one document and no game behaviour.

---

### Run 1, entry 4 — I invented the four numbers that price a right of way — *5 Sep, 18:10*

**The question.** You said a port grant should cost more than a road grant. How much more, and where
do rivers and railways sit between them?

**Why I could not answer it.** It is a taste question about how the game should feel, and there is
no measurement in the project that settles it. Nothing in the data says a harbour is worth a third
more than a motorway rather than twice as much.

**What I did, and what I turned down.** Port is now the baseline and the others are discounts off it:
river 0.95, rail 0.85, road 0.75 — so a port right costs a third more than a road right between the
same two nations. **The direction is the part I am confident about and the size is not.** Making the
cheap modes cheaper, rather than ports dearer, means the change can only ever LOWER what somebody
asks — so no offer that would have been signed before this existed is refused because of it, and if
the numbers are wrong they are wrong in the safe direction.

I rejected reusing the two figures already in the project for this (`trade.railDiscount` 0.5 and
`trade.highwayDiscount` 0.2, left over from the old one-off transit screen). They encode how cheap
each mode is to MOVE on, which is a different question from how much it costs to be LET IN, and
they put rail below road — reusing them would have imported an argument nobody made.

**What to check first if it feels wrong.** Whether landlocked nations can still afford to reach the
sea at all. Fourteen of the sixty-one have no port and no border crossing, and a port right is now
the dearest thing on the board and the only thing that gets them out. If they are strangled, the
port multiplier is too high; if nothing changed, it is too low.

**To undo it.** `git revert bb8157d`

---

### Run 1, entry 5 — The Panama ruling was open the whole time, through Mexico — *5 Sep, 18:20*

**Not a decision — a fault, in something I told you was finished.** A2d landed on 5 September as
"two seas, not one ocean; Panama shut". It was not shut. Canada was carefully given an Atlantic
coast only, with a long comment explaining why. Mexico was given both coasts three lines further
down, and Mexico is a place goods can pass through. **Washington sailed to Mexico, Mexico sailed to
Florida, and Seattle was trading with Boston by sea for a flat ten per cent** — cheaper than any
route across its own continent.

**Why no test caught it.** Four tests guard that ruling and all four read the map's connections
rather than running a journey. The two oceans were never joined *directly*, so all four passed, for
a fortnight, while the thing they exist to prevent happened through a third country.

**What I did.** Water in, water out, across two different oceans is now refused. Deliberately narrow:
reaching Mexico or Canada overland and shipping onward is still allowed, because that is what those
goods would really do. Mexico keeps both coasts, because it really has both and a Californian
shipment to Ensenada is not a trick — what it no longer has is a canal through the middle of it. The
new test runs the journey rather than reading the map, and counts the pairs it tried so it cannot
pass by not running.

**To undo it.** `git revert 37df85a`

---

### Run 1, entry 6 — I checked my own homework on the industry data, and it was wrong — *5 Sep, 18:35*

**The correction, first.** The board has said "84% of industry figures real after the re-bake" since
this morning. **It is 75%.** I measured it properly tonight and the earlier method counted a place as
measured when the government had published only a COMBINED figure covering two of our six sectors —
which tells you the sum and neither part — and counted trade while quietly not requiring transport.
The board now says 75%. The number was mine and so is the correction.

**Then the two things that stopped me building it.** You approved this re-bake and I did not do it,
which needs an explanation rather than an excuse:

1. **Farming in the game is ten times bigger than reality**, and how much food a person needs was
   deliberately calibrated against that inflated figure — it says so in the setting's own note.
   Replace the data without re-deriving hunger in the same change and the whole continent starves on
   turn one.
2. **The six sectors only reach about half of a real economy.** Government, construction, health,
   education and professional work have nowhere to land. A faithful re-bake does not make the map
   more real; it deletes half of everybody's income.

**And it reaches backwards.** The economy is baked into the game rather than saved into a game, so
every save you already have would come back different.

**What I did.** Stopped, and wrote it down. My own rules name this exact case — a data re-bake, a
thing expensive to reverse, a change that invalidates existing games — as one to bring to you rather
than decide. The approval you gave was for a job I described as clean, and it is not clean.

**To undo it.** Nothing to undo. No code changed; the board figure was corrected and this note
written.

---

### Run 1, entry 7 — Distance now has a price tag, and it is bigger than I thought — *5 Sep, 18:40*

**Measured tonight, from the project's own map**, because three separate questions were waiting on
it. Distances are between the real ports of the sixty-one nations:

- **Closest two ports on the same sea: 16 miles** (Delaware and New Jersey).
- **Farthest: 2,578 miles** (Hawaii and Washington). Today those two journeys cost **exactly the
  same**, because a sea crossing is one edge with no length.
- **Median sea crossing 707 miles; median land border 253 miles.** Fifty-nine per cent of same-sea
  pairs are further apart than the *longest* land border on the board.
- Your own example, priced: **Washington to Oregon is 275 miles, Washington to Alaska is 1,264** — a
  4.6× spread charged identically.
- And the corridors abroad are worse: a Canada route spans **411 to 2,442 miles at one flat price**,
  and it is the only edge in the game that pays no crossing cost at all.

**What I did NOT do.** Build it. This is the largest single improvement available and it is a design
change, not a repair — and the measurement turned up a trap worth stating plainly: **fix the sea
without fixing the corridors and every long haul in the game reroutes through Canada**, because it
would become the only remaining way to cross the continent for free. That is one change, not two,
and it wants your eye on it before it lands.

**To undo it.** Nothing to undo — measurement only, written up here and in the design document.

---

### Run 1, entry 8 — The game was accusing neighbours of closing borders that had simply expired — *5 Sep, 20:10*

**Not a decision, a small lie the game was telling.** An agreement that runs out and an agreement
somebody closes both look the same to the code that checks whether goods can still cross, so the
player was told "they closed the border" either way. The honest sentence already existed in the map
and nothing could ever reach it. Now a corridor that has simply run out of turns says so.

**To undo it.** `git revert` the commit "The game stops accusing a neighbour of closing a border".

---

### Run 1, entry 9 — I published a wrong number and then caught it myself — *5 Sep, 21:05*

**What I said.** That a hundred turns took about 65 seconds and missed your sixty-second target. I
put it on the board.

**Why it was wrong.** I measured it with four browser tabs running. Timings on this machine swing
30–40% with load — the same build measured 337ms and 642ms a round twenty minutes apart. Measured
properly with nothing else open: **48.8 seconds. It passes.**

**The related scare, also settled.** The per-round cost looked 4–8× worse than a figure recorded
earlier in the project, and I had changed code in that path, so I checked rather than assumed.
Interleaved comparison, identical worlds, nine repetitions each: 459ms for the build before tonight,
441ms for the commit where the old figure was written, **398ms for tonight's build — the fastest of
the three.** And the change I suspected never runs at all: there are zero corridor requests in a live
round, so that branch is not entered.

**What the old figure actually was.** Not a comparator. It was measured on the intact fifty-one-state
board, not the shattered sixty-one, and checking out that exact commit and re-running its own
measurement here gives 364–441ms. It described a different machine, not faster code.

**To undo it.** Nothing to undo — measurement only. Rules 8 and 9 written so it does not recur.

---

## WIND-DOWN REPORT — Run 1

### 1. Where it got to

**954 tests green, nothing failing.** Tagged `stage/a5` — *"what a right of way is worth, and the
canal that was open"*. 17 commits, all pushed. Every stage tag from `stage/a1` to `stage/a5` is on
the remote, so any of it can be rolled back by somebody who is not me.

**Two things I had called finished and were not**, both found by this run and both fixed:
the Panama ruling was open through Mexico, and the design document was four stages behind.

**Three of your five success measures now carry measured numbers, and all three pass:** a hundred
turns in 48.8 seconds against a sixty-second target; the same seed producing an identical game twice,
to the byte; a five-country resale chain keeping 18–43% against 90% for selling abroad. The other two
belong to the autarky phase, which you parked.

**Four deferred defects closed with evidence** (#3, #5, #7, #9), and one upgraded from a note to a
scoped stage (#8).

### 2. What is next, and what of it needs you

Everything left needs you. That is the intended ending rather than a shortage of ideas:

| | |
|---|---|
| **Distance** | The largest single improvement available. Measured tonight, deliberately not built. The trap: fix the sea without fixing the foreign corridors and every long haul reroutes through Canada. |
| **Price haggling** | The economy spec's unmet Phase 3 checkpoint. The lever exists in the model and reaches no screen; the missing piece is a representation of *alternatives*, and it has a performance trap. |
| **The industry re-bake** | Stopped, not forgotten. See entry 6. |
| **Your written predictions** | Parked at your instruction (D175). |
| **The stale playtest** | 132 commits behind, and yours to replace. |

### 3. WHERE I WENT MOST HOG WILD

Ranked by how much I made up. Worst first.

**1. The four numbers that price a right of way.** Port 1.0, river 0.95, rail 0.85, road 0.75. The
*direction* is yours — you said a harbour should cost more than a road — but the *sizes* are mine and
nothing measures them. I made them discounts rather than premiums so they can only lower an ask,
which is the safe direction, but a third could as easily have been a half.
*Check first:* whether the fourteen landlocked nations can still afford to reach the sea. A port
right is now the dearest thing on the board and the only thing that gets them out.

**2. Where exactly to close the canal.** I refused water-in/water-out across two oceans and
deliberately left overland-in/ship-out alone, on the grounds that a lorry to Mexico followed by a
ship is a real journey and A2d's own text permits it. That is a judgement about where a rule ends,
and a reasonable person could have drawn it tighter.
*Check first:* whether any Pacific nation is reaching an Atlantic one by a route that feels like
cheating. My test only covers pairs that could have gone by sea alone.

**3. Reading "skip autarky" as *for this run* rather than *forever*.** You said one sentence; I built
a parked-work mechanism around it. If you meant it permanently, the mechanism is wrong.

**4. Stopping a job you had approved.** The re-bake. I think the reasons are strong and I know
overriding a yes is not mine to do lightly.
*Check first:* whether you agree that farming being ten times too large, and hunger being tuned
against that, really is a blocker — or whether you would rather have it built and fixed after.

### How it ended

**Exit 2 — Aaron came back and said stop**, at 19:30, while the wind-down was already under way. No
work was started after that; what was already in flight was landed and nothing else was begun.

The Hog Wild switch on the board has been **unticked**, so a resumed run reads it and stops rather
than continuing. That is the one time I write to that switch: turning it off on his explicit
instruction takes power away rather than granting it, and leaving it ticked would have left the board
contradicting what he had just said. **"Touch anything live" was left exactly as he set it** — it was
flagged twice tonight and it is his to change.

### 4. The counts

- **Agents started: 7.** Four mapping the code for the design document, one on distances, one on the
  industry data, one on the performance A/B.
- **Tokens: about 1.17 million.** Roughly 270,000 from this session's own counter (14,993,000 at the
  start of the run to 14,706,000 at the report) and about 900,000 spent by the seven agents. I cannot
  break the agent figure down per agent, so read it as one total.
- **Wall clock: one hour and forty-three minutes**, 17:52 to 19:35.

---

*The rest of Run 1's entries follow below as they happen, newest at the bottom of the run.*

---

Each run opens with a header stamped at the moment it starts, so the counts at the end mean
something:

> ## Run 1 — *date, time started*
>
> **Token counter at start:** *n*
> **The plan:** the ordered list of what I intended to get through.

...and closes with the wind-down report: where it got to, what is next, **where I went most hog
wild** (ranked by how much I made up, worst first, each with what I would check to find out whether
it was wrong), and the counts — agents started, and tokens spent between the two counter readings.

## Entries

The first session it runs, every decision taken without you lands here in this shape:

> ### What I did — *stage, date*
>
> **The question.** Stated so you could answer it without reading any code.
>
> **Why I could not answer it.** A judgement that is yours, a fact I could not measure, or a
> trade-off with no obviously right side — and which of those it was.
>
> **What I did, and what I turned down.** The reasoning, including the option I rejected and why.
>
> **To undo it.** `git revert --no-commit stage/x..stage/y && git commit`
