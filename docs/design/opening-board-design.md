# The opening board — 1 March 2036

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `nation-design.md` (the honeymoon, and what a successor is) ·
`board-design.md` (the Areas) · `identity-design.md` (who governs) · `diplomacy-design.md`
(recognition, and the memories the board opens with) · `movements-design.md` (the seeded shares).

**Read by:** `presentation-design.md` · `missions-design.md` · `ai-design.md` · `events-design.md`.

> **⚠ THIS DOCUMENT HAS A LINE DOWN THE MIDDLE OF EVERY PAGE.** *Everything here is either **AUTHORED**
> — a human wrote it into a content file — or **DERIVED**, computed from real data at load.* **The
> boundary is the design, and confusing the two is how the board's own table came to describe a
> partition the game would refuse to build.**

---

## 1. The board, measured

**Every figure below was measured from the data files in this session, not carried forward.**

| | | |
|---|---:|---|
| **Counties** | **3,143** | across 51 states |
| **Areas** | **1,688** | *3,143 − 1,962 grouped + 507 groups* |
| **Nations** | **61** | 49 surviving states + D.C. + 11 successors + Deseret |
| **Population** | **340,110,988** | US Census Bureau, 2024 estimates |
| **GDP** | **$29.14 trillion** | BEA, 2024, all-industry, current dollars |

**Nation sizes, the sixty deterministic ones:**

| | |
|---|---|
| **Areas** | **1** (Los Angeles, D.C.) to **68** (Georgia); median 28 |
| **Population** | **587,618** (Wyoming) to **23.4M** (Florida); median 4.76M |
| **The new nations cluster near the top** | *the eleven successors hold **20.8% of the continent's people on 9.7% of its Areas*** |
| **Both extremes are new or newly exposed** | *Los Angeles is **one Area and 2.87% of the continent**; Cascadia is nine Areas and **0.17%*** |

---

## 2. What is AUTHORED, and it is deliberately little

**One content file. Its own note is the contract:**

> *"**AUTHORED CONTENT.** The scenario code applies this; **it knows nothing about Texas.** Area lists
> are resolved against the cultural map's assign table, **so a leaf repainted in the map editor moves
> the border here too.** Every successor's claim is validated as an exact partition of the state it
> dissolves — **a leftover Area or a double claim throws and names the county.**"*

**It holds: an edition line, a blurb, two dissolutions with their successors, one cession, and a
relations block.** *Each successor carries a name, a claim, a seat, a colour, sometimes a government,
sometimes a movement, and a note.*

**Everything numeric is DERIVED** — *population, output, cohesion, the colour-to-government mapping,
treasuries, and all five power stocks.*

### 2.1 The two-phase split, and it is load-bearing

**Phase A runs before the world begins. Phase B runs strictly after.**

> *Phase B exists because beginning the world **wipes both the recognition matrix and the origins map**.
> Anything phase A wrote there would simply vanish.*

**And phase A must run BEFORE the world begins for a different reason entirely:**

> *"A stock with no previous value opens **AT** its target rather than climbing from the floor… **Run the
> split later and the timeline opens on an intact Texas and eleven nations spend fifteen turns
> climbing.**"*

**Three validations throw and name the county: an Area not on this map build, an Area the parent does
not hold, and an Area claimed twice or by nobody.** *Plus a seat check.* **And every nation that lost
ground is re-banked** — *"Utah's opening balance was computed against a Utah that included Salt
Lake."*

---

## 3. The twelve new nations — all [BUILT]

**Measured this session by resolving every claim through the cultural table exactly as the scenario code
does. Both partitions verified exact: Texas 106 of 106, California 58 of 58, no leftover and no double
claim.**

| Nation | Areas | Population | GDP | Governs as |
|---|---:|---:|---:|---|
| Houston | **32** | 10,072,698 | $903.7B | red |
| Dallas | **23** | 9,213,924 | $861.4B | red |
| San Antonio | **21** | 5,395,762 | $346.9B | red |
| El Paso | **17** | 2,893,240 | $313.3B | red |
| **Austin** | **13** | 3,715,207 | $344.5B | **blue — AUTHORED** |
| Northern California | **30** | 7,557,492 | $512.6B | blue |
| Bay Area | **9** | 7,648,014 | $1,331.5B | blue |
| **Cascadia** | **9** | 589,107 | $33.2B | **green — AUTHORED** |
| SoCal | **6** | 8,953,533 | $882.2B | blue |
| Riverside | **3** | 4,925,938 | $285.6B | red · **landlocked** |
| Los Angeles | **1** | 9,757,179 | $1,003.0B | blue |
| **Deseret** | *stochastic — §4* | | | **yellow — AUTHORED** |

> **⚠ `DESIGN.md`'s version of this table was WRONG and has been corrected today.** *It gave Dallas 22
> and El Paso 16, **so Texas summed to 104 of its 106 Areas — a partition the code would have thrown
> on.*** **The old table could not have described a board the game can build.** *Three population
> figures were off as well.*

### 3.1 The two authored dramas, and they are the best content in the project

**Cascadia is governed by the movement that made it, NOT by the plurality of the people in it:**

> *"**This ground is the State of Jefferson's heartland and leans the other way**, so Cascadia opens with
> an organised opposition on most of its own soil. **That is the intended drama, not an oversight.**"*

*Its Civil Liberties open at **0.47** against 0.63–0.71 for the other Californian successors, and **it
is the only opening the faction picker rates brutal.***

**Austin's government is authored for a stated reason:**

> *"**A flagship of the scenario should not be a coin toss against its own data.**"*

*Measured across eight seeds, the turn-0 plurality landed red five times and blue three.* **So the
ruling is that the story wins over the arithmetic, and it says so out loud.**

**⚠ The note's own supporting figures do not reproduce.** *It states 47.9R–50.6D by population with blue
ahead by 98,404; measured over the same thirteen Areas it is **48.1R–50.4D, blue ahead by 84,398.***
**The Area count agrees and the direction of the ruling is unaffected.** *Gap 4.*

---

## 4. Deseret — the half-born case, and the most measured drama in the game

### 4.1 It is the only nation that is not an origin nation

**The eleven successors are FOUNDING states**: *the dissolution settled before turn 0, so they are
recognised by everybody, have no honeymoon, and have no parent to earn a signature from.*

> **"Deseret is the one that is not, and it passes origin false — it is a pariah with a story to play
> out."**

### 4.2 The honeymoon WITHOUT the transition cost, and why they were split

> *"Independence bundles two opposite things: a few turns of extra Authority **because a population that
> just got what it wanted gives its government the benefit of the doubt**, and an immediate GDP cut
> because institutions, contracts and trade routes all break at once. **The first is exactly right here.
> The second is not: the shattering happened BEFORE turn 0, and an economy that opens twelve per cent
> under its own data reads as a data bug rather than as a story.**"*

**That is why the two exist as separate calls — and it is also why they now fire on only one birth route
out of five.** *`nation-design.md` §3.1.*

### 4.3 The cession — a roll per AREA, and the reason is variance

| Sub-region | Chance | Areas | Population |
|---|---:|---:|---:|
| Wasatch Front | **1.00** | 10 | 2,865,965 |
| Zion | 0.82 | 6 | 766,186 |
| Bonneville | 0.70 | 10 | 239,072 |
| Tetonia | 0.60 | 15 | 483,864 |
| Uintas | 0.55 | 16 | 558,140 |
| **Total** | | **57** | **4,913,227** |

**A roll per sub-region has the same mean and a ruinous variance:** *measured before the change, **10
Areas at one seed and 42 at another.*** **So it is one draw per Area, sorted so that draw order cannot
depend on how the data happens to be walked.** *Then only the connected piece containing Salt Lake is
kept; the rest is `leftBehind`.*

**The odds are TUNED AGAINST THE MEASUREMENT, not set on paper:** *at the paper odds the cession ran
14–39 Areas with a mean of 21.3 over twenty seeds.* **The shipped odds give a mean of 31.1 Areas and
3.75M people, spanning 19–45, with the Wasatch Front always in and the result always one connected
piece.**

**The corridor spans SIX states and Utah is only its plurality.**

### 4.4 The two seeds left behind, and both are set below a line on purpose

| | |
|---|---|
| **Stayed** | seeded **below the secession threshold**, *because "a share over the line on turn 0 mass-defects on turn 1, **which is the turn-zero disaster the declaration guard exists to prevent**"* |
| **Left behind** | seeded higher — *"**They voted to go and did not get to; they are the angriest ground on the map.**"* |

**Applied deterministically at the midpoint of each band**, and only inside the baked homeland.

### 4.5 ⚠ The recognition measurement — and both things about it need saying

> **The rest of the continent's per-turn chance of recognising Deseret is 0.0695 while Utah refuses and
> 0.1808 the moment it signs. Utah's signature is the key that unlocks the continent — 2.6×, off one
> signature.**

**Why it is that size:** *the parent's refusal is a binary term at weight 0.40, scaled by the rate, which
is a flat step of **+0.112**. The measured jump is +0.1113.* **The arithmetic and the measurement
agree.**

> **⚠ TWO THINGS ABOUT THIS FIGURE, AND SIX DOCUMENTS REPEAT IT WITHOUT EITHER.**
>
> 1. **No calendar date is attached anywhere.** *The only bound is that it was committed on or before 3
>    September; two documents citing it as evidence on 15 September do not claim to have re-run it.*
> 2. **⚠ IT IS A ONE-SEED MEASUREMENT.** *A single deterministic boot, no simulated turns.* **And one
>    document prints it in the same bullet as a twenty-seed sweep, which makes it read as a twenty-seed
>    result.** *Gap 3.*

**Relations open quiet:** *every state that lost ground carries a back-dated memory, and **Utah does NOT
open refusing recognition — the board starts quiet and the player watches it sour.***

**⚠ And Deseret's opening recognition changed after the round closed.** *It now opens recognised by its
six neighbours and **not** by Utah, because transit requires **mutual** recognition and a nation with no
port and no crossing needs a corridor to do anything at all.* **Verified before ruling: even all six
signing leaves it under the smuggler's-rate band, so the pariah story survives and only the dead end
goes.**

---

## 5. The opening edition — three sentences, and what replaces them

**What the player is shown today:**

- **The edition line:** *"The year the Union dissolved"*
- **One sentence per dissolution, and one for the cession.**

**⚠ And the blurb is DEAD CONTENT.** *It is quoted in design documents as though it were in the game.
**No code reads it.*** *Only the edition line and the three sentences reach the screen.* **Gap 5.**

**The round's own audit is the case for replacing it:**

> *"That is the whole of it. **There is no why, no when, no who did what to whom.** The game opens on 1
> March 2036, the eve of the Texas bicentenary — **and nothing says whether the Union dissolved the week
> before or twenty years earlier.**"*

**Ruling 4 replaces it with a FRONT PAGE, dated 1 March 2036.** *The bicentenary, the war of succession,
the oil, the collapse of trust, martial law, and the states that went their own way.* **It is content,
not machinery: nothing in the engine changes; the writing is the work.**

> **⚠ NOTHING IN THE REPOSITORY CARRIES THAT PROSE.** *The date is an engine constant; the content is
> specified only.* **And `GDD.md` ticks the front page ✅ — against the RULING, not against built
> content.** *Gap 6.*

---

## 6. ⚠ What the board does NOT open with

| | |
|---|---|
| **No blocs, no federations, no alliances, no vassals** | *and a ruling says the board should open with four signed agreements on it* |
| **No hostility floors** | *33 permanent quarrels are specified; **on this board the maximum possible is twenty and the actual is zero*** |
| **No mission trees seeded** | |
| **No front page** | §5 |
| **One recognition row** | *Deseret's. The other sixty are origin nations and nothing is written down for them* |
| **⚠ NOTHING IN FLIGHT** | **Added 16 September 2026.** *No offer sent and unanswered, no proposal awaiting a reply — **no turn −1 of any kind.** The board carries what is signed and what is remembered, and the space between those two is empty.* **Aaron's taught first turn needs it:** *his own worked opening has Miami coming back on turn 1 about a deal Houston sent before the game began, which is the beat that teaches **you send things and things come back** — the whole turn loop.* **Found by tracing `presentation-design.md` §14.2, and it was not on this list because nobody had asked the question** |

**So the opening board is the twelve nations, the seeded shares, the back-dated memories and nothing
else.** *Everything the rounds ruled about how the board should START is content that has not been
written.*

---

## 7. What this hands the Technical Designer

| | |
|---|---|
| **The authored/derived line is the whole design.** *A leaf repainted in the editor moves the border in the scenario* | §2 |
| **The two-phase split is load-bearing in both directions** | §2.1 |
| **⚠ The recognition pivot is a ONE-SEED, UNDATED measurement** that six documents repeat | §4.5 |
| **⚠ The board opens with none of the agreements a ruling requires** | §6 |
| **⚠ And with nothing IN FLIGHT either** — *a taught first turn depends on it* | §6 |
| **The front page is specified, ticked, and unwritten** | §5 |
| **⚠ Deseret's homeland and its cession set are different sets** | Gap 1 |

---

## 8. Open questions

| | | Owner |
|---|---|---|
| **1** | **What does the 1 March 2036 front page actually SAY?** *The prose does not exist* | **Aaron / the writing.** *The build order is "Aaron's and the build order's"* |
| **2** | **Is the per-nation front page ever built?** *Rejected for now — "the per-nation version stays available later **at the cost of prose alone**"* | **Aaron** |
| **3** | **Should the turn-0 power bands be re-measured on 61 nations?** *The published spread was taken on the pre-Shattering board and includes none of the extremes the new one added* | **Not stated** |
| **4** | **Is it acceptable that in roughly 18% of games Deseret touches no Californian ground?** *Its only link runs through a leaf that cedes at 0.82* | **Aaron** |
| **5** | **Does the recognition exception cover Riverside [BUILT]?** *Deseret's lifeline runs through a three-Area landlocked successor nobody had considered* | **Aaron** |
| **6** | **Are the opening memories dated across the two years, or all stamped "two years ago"?** ⚠ *Two years is **eight turns of decay***. **Measure before building** | **A measurement, then Aaron** |

---

## 9. Gaps

| | |
|---|---|
| **1** | **⚠ Deseret's movement homeland and the scenario's cession set are DIFFERENT SETS** — *61 Areas against 57 — and nothing reconciles them.* **A ceded Area outside the homeland gets no seeded share at all**, silently |
| **2** | **⚠ The scenario's own text contradicts its own data** — *it says California dissolved into **five** successors and ceded the north, while the data holds **six** including Cascadia.* **Anyone reading the file cold will count six**, and this is a closed finding whose text was never touched |
| **3** | **⚠ The 0.070 → 0.181 recognition figure carries no date and is a ONE-SEED measurement**, printed in one document beside a twenty-seed sweep in a way that reads as twenty seeds |
| **4** | **Austin's authored note quotes vote figures that do not reproduce** from the data it cites |
| **5** | **The blurb is dead content** — *never read by any code, quoted in design documents as though it were in the game* |
| **6** | **⚠ The front page is ticked ✅ in the master against a ruling rather than against content.** *Nothing is built* |
| **7** | **Two tunable doc strings describe a board that no longer exists** — *both calibrate against "the largest opening nation, California at 12.7%".* **California is not on the opening board.** *The largest GDP share is now New York at 7.97%, so one of those two constants is now **below** the largest nation rather than twice it* |
| **8** | **The turn-0 power bands are a measurement on the 51-nation board** |

---

## 10. The scenarios this document must be able to narrate

### 10.1 ✅ The board is built and the timeline does not lie about it

**Step 1.** The scenario is applied **before** the world begins.

**Step 2 — every claim is resolved against the cultural map's own assign table**, so the border the
player can see in the Culture view is the border the scenario cuts.

**Step 3 — the partition is validated.** *A leftover Area or a double claim **throws and names the
county.*** *Texas 106 of 106; California 58 of 58.*

**Step 4 — the stocks open AT their targets**, because they have no previous value.

**Step 5 — so the timeline opens on eleven real nations.** *Run the split later and **it would open on an
intact Texas and eleven nations would spend fifteen turns climbing.***

**Step 6 — and every nation that lost ground is re-banked**, because Utah's opening balance was computed
against a Utah that still had Salt Lake.

> **✅ NARRATES COMPLETELY, and the ordering constraints are the design rather than an implementation
> detail.**

### 10.2 ✅ Utah signs, and the continent moves

**Step 1.** Deseret **[BUILT]** opens as the one nation on the board that is not an origin nation.

**Step 2 — it gets the honeymoon and NOT the transition cost**, because the shattering happened before
turn 0 and *"an economy that opens twelve per cent under its own data reads as a data bug rather than as
a story."*

**Step 3 — the relations board opens QUIET.** *Utah does not begin by refusing. **The player watches it
sour.***

**Step 4 — while the parent refuses, the continent's per-turn chance of recognising Deseret sits at
0.070.**

**Step 5 — Utah signs. It becomes 0.181.** *One binary term at weight 0.40, a flat step of +0.112, and
the measurement agrees with the arithmetic to three decimal places.*

> **✅ NARRATES, AND IT IS THE MOST MEASURED PIECE OF DRAMA IN THE GAME.** *⚠ On one seed, on an undated
> run, repeated in six documents without either caveat.*

### 10.3 ⚠ Cascadia opens governed by a movement its own people did not vote for

**Step 1.** Cascadia **[BUILT]** is nine Areas and 589,107 people — **the smallest new nation and 0.17%
of the continent.**

**Step 2 — its government is AUTHORED as the movement that made it**, not the plurality of the people in
it.

**Step 3 — and that ground is another movement's heartland and leans the other way.**

**Step 4 — so it opens with an organised opposition on most of its own soil.** *Its Civil Liberties open
at 0.47 against 0.63–0.71 for its neighbours.*

**Step 5 — the faction picker rates it the only BRUTAL opening on the board.**

**Step 6 — ⚠ and it holds three coastal counties, none of which carries a port.** *So the nation with the
hardest opening also cannot sell abroad.* **`trade-design.md` §5.**

> **⚠ NARRATES, AND STEPS 1–5 ARE THE BEST AUTHORED CONTENT IN THE PROJECT — "that is the intended
> drama, not an oversight."** *Step 6 is not authored drama. It is the port data, and nobody chose it.*

### 10.4 ❌ A player reads the opening and asks why the map looks like that

**Step 1.** The game opens. **The player is shown an edition line and three sentences.**

**Step 2 — one sentence per dissolution and one for the cession.**

**Step 3 — ❌ there is no why, no when, and no who did what to whom.**

**Step 4 — and the date is 1 March 2036, the eve of two hundred years since Texas declared itself a
nation, with five governments each claiming to be that Texas.** *The game says nothing about it.*

**Step 5 — a blurb exists that would help, and no code reads it.**

**Step 6 — a front page is ruled, specified, and ticked as done in the master document.** *It has never
been written.*

> **❌ JAMS, AND IT IS THE FIRST THING EVERY PLAYER MEETS.** *It is also **the cheapest thing in either
> of the last two rounds** — prose with no engine work behind it.* **That is an observation for the
> build-order stage, not a recommendation: the cutting is Aaron's.**

---

*Sources, verified 15 September 2026: `content/scenario-shattered.json` (the edition, blurb, two
dissolutions, the cession with its five sub-regions and their odds, the two seed bands, the relations
block, and every authored note quoted here); `js/scenario.js` (the two phases and why they are split,
claim resolution, the three validations, re-banking, the honeymoon-without-the-cost, the per-Area
cession roll); `js/shell.js` (what actually reaches the screen); `js/factions.js`;
`tests/scenario.test.js` (the recognition measurement, its single seed, its assertions);
`data/areas.json`, `data/game-data.json`, `data/county_trade.json`, `content/cultural.json`;
`js/tunables.js`; `DESIGN.md` §2.1; `DECISIONS.md` D227; `docs/design/events-ideation.md` ruling 4;
`docs/design/secession-ideation.md` §8 and its audit of the current text. **The Area counts, both
partitions, all twelve nations' populations and GDP, the board totals and the cession's five sub-regions
were re-derived from the data files in this session by resolving every claim exactly as the scenario
code does — which is how `DESIGN.md`'s 104-Area Texas was caught. The cession odds sweep, the Cascadia
liberties figure and the recognition measurement are carried forward with their original attribution,
each flagged with what it does and does not establish.***
