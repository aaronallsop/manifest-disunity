# Identity — the political board

**Stage 2 of five: DESIGN.** What the thing does, what it is measured in, what the player sees, and
what happens at each level. A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` — §15.1 carries the board as a cross-cutting concept because eight documents
read it. **This document is the depth under that summary**, and where they differ the master is the
pointer and this is the authority.

**Read by:** `population-design.md`, `movements-design.md`, `governing-design.md`,
`diplomacy-design.md`, `power-design.md`, `nation-design.md` and `ai-design.md`. **It is substrate —
nothing it needs sits above it.**

**Status: the DESIGN is ruled and the BUILD is superseded.** D231, 15 September 2026: three axes and
ten positions; the built six-ideologies-on-two-axes model is what changes. **§8 records what exists
today**, because every formula in the game still reads it and somebody has to convert it.

> **The one-sentence version: a political position is a LOCATION, and one distance function between
> locations drives nine other systems.**

---

## 1. The three words, and they are three different things

**Ruling 40, 11 September 2026, agreed without change.** *Before it, one word did all three jobs, so
"the nation's ideology" and "the movement's ideology" meant different kinds of thing and nobody had
noticed.*

| Word | What it means |
|---|---|
| **Ideology** | **A position on the board.** Universal, permanent, and it **cannot move, because it *is* a location** |
| **Party** | **An organisation inside one nation** that occupies a position and contests that nation's elections. **Dallas and Vermont can both hold a Libertarian party and they are two different parties** |
| **Movement** | An organisation of people who want something **done to the map** — to leave, to join, to reunify, to take somebody's ground. Unchanged by the ruling, and already works |

> **⚠ THE PAYOFF, and it is why this is a ruling rather than a glossary. A PARTY CAN MOVE ACROSS THE
> BOARD AND AN IDEOLOGY CANNOT.** So *change course* — round 1's third release valve — is **priced by
> how far the party moves**, not by a number somebody picked. **The geometry does the work a tunable
> was doing.**

**Everything below is about ideology, the location.** Parties belong to `governing-design.md`;
movements to `movements-design.md`. **This document owns the board they both stand on.**

---

## 2. The board — three axes

**Each axis runs −1 to +1.**

| Axis | −1 | +1 |
|---|---|---|
| **Economy** | collective | neo-liberal |
| **Morals** | conservative | progressive |
| **Power** | authoritarian | libertarian |

**The third axis is the new one** and it is what the old board could not express. *Aaron raised it
three separate times in one sitting before it was ruled.*

### 2.1 Eight corners, each named for a real political party

**Ruling 1, 9 September 2026.** **Named for real parties — seven of the eight American — because what
a player meets on a ballot is a party and not an ideological family.** *Aaron's reason, and the
correct one.*

| Economy | Morals | Power | Position |
|---|---|---|---|
| collective | conservative | authoritarian | **Fascism** |
| collective | conservative | libertarian | **Distributism** |
| collective | progressive | libertarian | **Democratic Socialism** |
| collective | progressive | authoritarian | **Communism** |
| neo-liberal | conservative | authoritarian | **Christian Nationalism** |
| neo-liberal | conservative | libertarian | **Anarcho-Capitalism** |
| neo-liberal | progressive | libertarian | **Liberal Anarchy** |
| neo-liberal | progressive | authoritarian | **Digital Technocracy** |

**Ruling 1's own roster used a different set of eight names** — the Union Party, the People's Party,
the Communist Party, the Industrial Workers of the World, the America First Party, the Constitution
Party, Technocracy Incorporated and the Libertarian Party. **Ruling 2 superseded that roster with the
one above**, taken from Aaron's own list of six opposed pairs. *The three axes and the naming
principle survived; the eight names did not.*

### 2.2 Laid out as ruling 2 arranged them, which makes the horseshoe visible

**Morals run across. Within each moral half, power runs from authoritarian on the OUTSIDE to
libertarian on the inside.**

| | cons / **auth** | cons / lib | prog / lib | prog / **auth** |
|---|---|---|---|---|
| **Collective** | Fascism | Distributism | Democratic Socialism | Communism |
| **Middle** | ← *Republicans, across both conservative columns* → | | ← *Democrats, across both progressive columns* → | |
| **Neo-liberal** | Christian Nationalism | Anarcho-Capitalism | Liberal Anarchy | Digital Technocracy |

> **Fascism sits at one far edge and Communism at the other, and they are NEIGHBOURS rather than
> opposites** — they differ on morals alone and agree on both a collective economy and an
> authoritarian state. **The cube said so by arithmetic before the layout said it. Nobody authored the
> horseshoe.**

### 2.3 Two centrists, which is what makes it ten

**Republicans and Democrats hold the middle on economy and on power and sit at one end of morals.**

**Measured, and it is why ten beats eight:** a centrist sits **√2** from each of the four corners on
its own moral side, while **any two corners are 2 apart.** So Republicans are closer to fascists,
distributists, Christian nationalists and anarcho-capitalists than any two of *those four* are to each
other — **the mainstream party is the great coalition-builder of its own half, without being bland.**

**And Republicans and Democrats are exactly 2 apart — the same distance as fascism and communism**,
which is a true and useful thing to be able to say about American politics.

*Recorded against the ruling and not to be re-raised: nine positions were recommended — the eight plus
a dead centre — and **Aaron chose against it twice, knowing the cost.** If coalitions later feel flat,
the centre is three numbers.*

### 2.4 And two things you FALL INTO

**Ruling 2. Not positions. Nobody stands for election as either.**

| | How you get there | What it is |
|---|---|---|
| **Despotism** | Off **either** authoritarian end | One party or none, full command of the state, and every other nation treating you as what you have become |
| **Stateless** | Out through the **libertarian middle** | The government dissolves into ground with people on it and nobody in charge |

**Aaron's mechanic: going too far buys power and costs standing. The exchange rate is deliberately not
set.**

> **⚠ THE FALLING ITSELF IS DEFERRED — `FUTURE-IDEAS.md` F19, after the alpha, at Aaron's
> instruction.** What despotism buys, what it costs in standing, and how far *too far* is are **not
> answered and no placeholder was invented for any of them.** **The two conditions stay named on the
> board because the shape needs them:** *a corner with nothing beyond it is not a corner.*

**Only the two centrists stand over solid ground. Every one of the eight corners has a trapdoor under
it.**

---

## 3. Affinity — the one function, and what it drives

```
affinity(a, b) = 1 - distance(a, b) / MAX_DISTANCE      // 0..1
```

**Nine things read it**, which is why a change here is never local: **coalitions, drift attraction,
splinter direction, defection targets, civil-war severity, trade alignment, liberty satisfaction, AI
diplomacy, and the price of changing your own politics.**

**That is what makes a position cost three numbers rather than a hand-authored compatibility table
against every other position.** A shared **economy** axis is trade alignment; a shared **morals** axis
is moral alignment; **the axes must remain readable separately.**

### 3.1 ⚠ `MAX_DISTANCE` is not authored for this board, and this document will not invent it

**It is the denominator, so every tuned threshold in the game is measured against it.**

**On two axes the rule was deliberate and is recorded: use the ACTUAL widest authored pair — 1.7804 —
and explicitly NOT the box diagonal of 2.8284**, because normalising on the diagonal *"would squash
every real affinity into the top third of the range and make every tuned threshold mean less than its
label says."*

> **⚠ THAT RULE DOES NOT DECIDE THE NEW BOARD, and the reason is exact: its whole point was that the
> diagonal was UNOCCUPIED.** On three axes **opposite corners exist**, so the widest authored pair
> **is** the diagonal — **2√3 ≈ 3.4641.** *That figure is arithmetic from the √2 and 2 distances
> ruling 2 states. Nobody has authored it.*

**It is the architect's and it is gap 1.** *Recorded in `GDD.md` as gap 11 as well, because it blocks
more than this document.*

---

## 4. The drift partition — how a party leaves the centre

**P6, verified and tighter than it was stated.** *Aaron, 9 September: "at the start of the game we
have republicans and democrats and they could drift into four different categories each."*

**A centrist holds the middle on economy and on power. The corners reachable without changing MORALS
are exactly those varying the other two axes: 2 × 2 = four each, and 4 + 4 = 8 covers every corner
exactly once. No corner is unreachable and none is reachable from both.**

| From | Economy | Power | Corner |
|---|---|---|---|
| **Republicans** | collective | authoritarian | **Fascism** |
| | collective | libertarian | **Distributism** |
| | neo-liberal | authoritarian | **Christian Nationalism** |
| | neo-liberal | libertarian | **Anarcho-Capitalism** |
| **Democrats** | collective | authoritarian | **Communism** |
| | collective | libertarian | **Democratic Socialism** |
| | neo-liberal | authoritarian | **Digital Technocracy** |
| | neo-liberal | libertarian | **Liberal Anarchy** |

**Leaving the centre is two questions with two answers each** — which way on the economy, which way on
state power — **and morals is the thing you do not change.** *That is politically true: parties
rearrange their economics and their tolerance for coercion far more readily than they change the moral
coalition that elected them.*

### 4.1 ⚠ The consequence nobody asked for, and it is load-bearing

> **Crossing the moral line is the expensive move. A Republican party cannot become Communist.**

**It would have to become Democrat first — measured, √6 direct against 2 through the centre — which
makes moral realignment the rarest and slowest change on the board, exactly as it has been in American
history.**

**This is what prices *change course*** (round 1's third release valve, ruling 40's payoff): the
geometry already says which conversions are cheap and which are generational, **and no tunable has to
assert it.**

### 4.2 And it is why the board can open on real election data

**The 2024 county seed gives Republican, Democrat and Other. Republicans and Democrats ARE two of the
ten positions**, so the seed lands directly on the centrists and drift carries people outward to the
corners over the course of a game.

**⚠ AND THAT APPEARS TO DISSOLVE THE LARGEST JOB RULING 1 LEFT OWING — an observation, not a ruling.**
Ruling 1's roster was eight corners with **no centrists**, so it recorded that *"neither major party
maps onto a corner, so both must be split across the eight by cultural region — authoring, not
engineering, and the largest single job in the change."* **Ruling 2 then added the two centrists and
superseded that roster.** *Open question 2; nothing is built on it.*

---

## 5. Where the movements actually sit

**Authored 11 September 2026. Aaron's instruction at the time: "this is authoring, not a decision —
the table is for Aaron to correct."** *It has not been corrected since, so it stands as authored.*

**Nine rows are marked ? because the third axis is a genuine judgement rather than a translation.**

**The straight translations, where the old name and the new position are the same thing:** old
*Republican* → Republicans, old *Democrat* → Democrats, old *Democratic Socialist* → Democratic
Socialism, old *Distributist* → Distributism. **Old *Conservative Nationalist* has no single heir: on
three axes it splits between Christian Nationalism (authoritarian) and Anarcho-Capitalism
(libertarian).**

| Movement | Was | Placed at | |
|---|---|---|---|
| **A Free Texas** | Republican | **FASCISM** | **RULED by Aaron:** *"I like a free texas being fascist because that could be apart of the story that it was taken over by a fascist bloc."* **A placement that is now a piece of story, not a translation** |
| Acadiana | Distributist | Distributism | |
| Alaskan Independence | Republican | Republicans | **?** *independence plus resource royalties is libertarian* |
| Blue-Collar Populist | Distributist | Distributism | industrial policy and tariffs |
| California Republic | Democrat | Democrats | |
| Cascadian Separatists | Dem. Socialist | Democratic Socialism | |
| Central States Union | Republican | Republicans | **?** *Aaron: "republican but support unions"* |
| Christian Nationalism | Cons. Nationalist | Christian Nationalism | **the movement and the position share a name, which ruling 40 makes legal** |
| Deseret | Distributist | Distributism | Aaron's own: *"law of consecration lite… closest analogue is Distributist"* |
| El Paso United | Republican | Republicans | his markup |
| Franklin | Cons. Nationalist | Republicans | **?** *mountain home rule is libertarian-conservative* |
| Front Range Republic | Democrat | Democrats | |
| Great Lakes Free Trade | Democrat | Democrats | **?** *a free-trade bloc is market-progressive, and that corner is Digital Technocracy — which fits a trade compact badly* |
| Greater Idaho | Republican | Republicans | |
| Hawaiian Sovereignty | Distributist | Distributism | sovereignty and land restoration |
| Native American Confederation | Distributist | Distributism | same pair of demands |
| New Absaroka | Republican | Republicans | |
| New Confederacy | Cons. Nationalist | Christian Nationalism | **?** *Fascism is the live alternative, and Aaron has already said this movement's name bothers him* |
| New England Revivalist | Democrat | Democrats | **?** *"town-meeting sovereignty" is the most libertarian phrase in the roster* |
| **New England United** | Democrat | **Democratic Socialism** | **?** Its stated goal is *social democracy*, which names the position. **Aaron's Boston question is answerable without changing the movement:** the three-axis board carries Distributism as its own position, so Boston's Catholic pull belongs in **the minority mix of those counties**, not in the placement |
| Northern Christian Kingdom | Cons. Nationalist | Christian Nationalism | religious government |
| Rio Grande Union | Distributist | Distributism | his markup |
| **Sagebrush Rebellion** | Republican | **Anarcho-Capitalism** | **THE ONE THE NEW BOARD WAS BUILT FOR.** *"Return the federal land, county supremacy"* lands exactly on that corner |
| Sonoran Republic | Republican | Republicans | water rights |
| State of Jefferson | Republican | Republicans | **?** *the classic rural-libertarian movement; it pairs with Sagebrush* |
| The Farmers Union | Distributist | Distributism | price supports and rural credit — already orange in the data |

### 5.1 ⚠ Finding H — the roster occupies half the board, and the empty half is the authoritarian one

| Position | Movements |
|---|---:|
| **Republicans** | 8 |
| **Distributism** | 7 |
| **Democrats** | 4 |
| **Christian Nationalism** | 3 |
| **Democratic Socialism** | 2 |
| **Anarcho-Capitalism** | 1 — Sagebrush, confirmed by Aaron |
| **Fascism** | 1 — A Free Texas, ruled by Aaron |
| **Communism · Digital Technocracy · Liberal Anarchy** | **0 each** |

**Three of the ten positions carry no movement at all.**

> **⚠ AND THIS IS PROBABLY CORRECT RATHER THAN A GAP.** **A separatist movement is people organising
> *against* a government; the authoritarian corners are what governments BECOME, not what a regional
> movement asks for.** **Ruling 40 is what makes that sayable:** those corners are occupied by
> **parties** and by **governments**, not by **movements** — and §2.4's two trapdoors are how a nation
> reaches them.

### 5.2 The most consequential placement on the board

**A Free Texas wants to *Reunify* — to put Texas back together at any cost — and it is now FASCIST.**
Three things follow without being written anywhere:

1. **The Texas contest has a villain.** Five claimants contest one inheritance and the movement driving
   the fight sits on the hardest corner of the board.
2. **Ruling 22's exit becomes a choice with a moral price.** A Texas government can escape the
   permanent rivalry only by **disappointing its own fascists until they give up** — and ruling 22 then
   turns them into separatists inside its own ground.
3. **Ruling 31 bites hardest here.** No Texas claimant may join a union, **so there is no peaceful road
   to one Texas at all: it is conquest, or it is nothing.**

### 5.3 The six struck — verified today, and the count is now closed

**`data/parties.json` holds 32 movements; the re-map places 26. Aaron struck six.** *Which six had
never been written down anywhere. Determined by diff on 15 September 2026:*

> **Anarcho-Capitalist · Delmarva Republic · Eastern Progressives · Fifty-First State · Libertarians ·
> Techno-Autocrat**

**All 26 re-map names exist in `parties.json`; the six above are the remainder.** *This closes
`GDD.md` gap 5, which recorded the 26 as unverified.*

**⚠ What is NOT recorded anywhere is WHY each was struck.** The round names two of them in passing —
*"Techno-Autocrat has no home on [the old axes] at all"* and the *"struck Anarcho-Capitalist
movement"* — and **the strike itself predates round 3, so its reasoning is not in that document.**
*Gap 2.*

**One pattern is visible and worth recording, because it may be the whole reason.** **Four of the six —
Anarcho-Capitalist, Libertarians, Techno-Autocrat, Eastern Progressives — are ideological LABELS rather
than regional movements.** *Ruling 40 is precisely the distinction that makes them strikeable: an
ideology is a location on the board, not an organisation that wants something done to the map.* **Two
are not — Delmarva Republic and Fifty-First State are regional. So the pattern is not the whole
answer.**

### 5.4 A movement is a SLICE, not an eleventh position

`area.mov[name]` is a slice of the people already counted under a position. **Deseret's members are
counted in their political position *and* recorded as organised under Deseret.**

**The whole population is always exactly the sum of the positions**, so every phase that moves people
ignores movements entirely, and a cleanup phase clamps each movement back inside its bloc once a turn.

> **Deseret is therefore not an opinion but an ORGANISATION OF an opinion** — which is what lets the
> model tell *"Deseret grows"* and *"Distributism grows"* apart.

---

## 6. What the player sees

*The screens belong to `presentation-design.md`. This is what the board must be able to show.*

- **A map mode that colours each Area by its leading position**, with the panel showing the full
  stacked bar, a derived coalition line, and **the nation's own location on the axes.** *Built for two
  axes; a third axis is a presentation problem this document hands on.*
- **A position is a place, so it can be pointed at.** Every affinity-driven refusal — a coalition that
  will not form, a union that will not be joined, a change of course that costs too much — **can be
  explained by naming the distance rather than by quoting a threshold.**
- **⚠ Nothing specifies how a three-axis board is drawn.** Two axes are a scatter plot. Three are not.
  *Gap 3.*

---

## 7. What this hands the Technical Designer

| | |
|---|---|
| **A position is a LOCATION** | Three numbers. It never moves. **A party moves; an ideology cannot** |
| **One distance function, nine readers** | So a change here is never local. §3 lists all nine |
| **`MAX_DISTANCE` is unset and is yours** | §3.1. **Every tuned threshold in the game is measured against it** |
| **The axes stay readable separately** | Economy alone is trade alignment; morals alone is moral alignment |
| **The drift partition is exact** | 4 + 4 = 8, covering every corner once. **Do not implement it as a general search** — it is a partition and the arithmetic says so |
| **Crossing morals is expensive by geometry** | √6 direct against 2 through the centre. **No rule asserts it; do not add one** |
| **Units are rigid** | Populations are people (exact). Shares are percentages 0–100. Affinity and cohesion are fractions 0–1. *Mixing them is the easiest bug to write here* |

---

## 8. What is BUILT today — six ideologies on two axes

**This is not the design. It is what every formula in the game currently reads**, and converting it is
the single largest piece of work D231 creates.

**Two axes — economic (collective ↔ market) and social (liberal ↔ traditional) — authored in
`content/ideologies.json`:**

| id | Ideology | economic | social |
| --- | --- | ---: | ---: |
| `red` | Republican | +0.6 | +0.2 |
| `blue` | Democrat | +0.3 | −0.4 |
| `green` | Democratic Socialist | −0.6 | −0.7 |
| `yellow` | Conservative Nationalist | +0.5 | +0.7 |
| `orange` | Distributist | −0.4 | +0.6 |
| `purple` | Socialist | −0.8 | −0.2 |

**`MAX_DISTANCE` is 1.7804** — Democratic Socialist to Conservative Nationalist, the actual widest
authored pair.

**What it replaced, and why it is worth knowing.** `lean: dem >= gop ? 'D' : 'R'` was a **binary enum
used as a control-flow key**, answered with `===` by four separate game decisions across eight files,
**and it ignored emergent movements entirely** — so a nation that was 40% Deseret, 31% R and 29% D
reported its lean as a *minority* party. **Each of those four comparisons is now a distance question
against a named threshold.** *The lesson survives the conversion: the value of a board is that it
replaces enums with distances.*

**Where the sixth ideology's people come from.** The 2024 result gives three numbers. Republican
becomes `red`, Democrat becomes `blue`, and **Other is split across the remaining four by cultural
region** — *a third-party voter in Vermont is not the same person as one in Alabama.* Weights are
carried for **all 20 regions** with a flat default, and **the split runs on the merged Area rather than
per member county**, so an Area takes one region's texture rather than an average of something that no
longer exists. **Other is 1–4% of most counties, so this sets the texture and movements provide the
shape.**

### 8.1 What converting costs, named rather than discovered

**The size is the architect's to give.** What is nameable:

| | |
|---|---|
| **Six buckets become ten** | Every Area holds exact per-position counts, and **the sum-to-population invariant the whole model rests on** must hold across the new roster |
| **Every threshold is re-tuned** | Because `MAX_DISTANCE` changes, and affinity feeds nine systems |
| **`axisDistance` gains a third axis** | And the two-axis readings that mean *trade alignment* and *moral alignment* need restating for three |
| **The minority split gains a column** | The 20 cultural-region rows are weighted over **four** ideologies today. *Measured before the third axis was ruled: a seventh ideology was priced at "two numbers and a colour" in the authored table, with the real bill being those twenty rows* |
| **The seed may get SIMPLER** | §4.2 — Republicans and Democrats become positions rather than two of six ideologies |
| **The roster is already re-placed** | ⚠ **Done, and sitting unused since 11 September.** §5 |

---

## 9. Open questions

| | | Owner |
|---|---|---|
| **1** | **What is `MAX_DISTANCE` on the three-axis board?** §3.1. **Every tuned threshold is measured against it.** *2√3 ≈ 3.4641 is the arithmetic; nobody has authored it, and the two-axis rule does not decide it because its whole point was that the diagonal was unoccupied* | **The architect** |
| **2** | **Does the 2024 seed land directly on the two centrists?** §4.2. If it does, ruling 1's *"largest single job in the change"* does not exist. **An observation of mine, not a ruling, and nothing is built on it** | **Aaron**, then the architect |
| **3** | **Do the nine movements marked ? stand as placed?** §5. Aaron's own instruction was that the table is *"for Aaron to correct"* and it has not been corrected. **Three of the nine would change the character of a whole region** — State of Jefferson and Franklin to Anarcho-Capitalism, New Confederacy to Fascism | **Aaron** |
| **4** | **Should the three empty positions stay empty?** §5.1 argues they are correct — movements organise *against* governments, and the authoritarian corners are what governments become. **But Communism, Digital Technocracy and Liberal Anarchy can then only ever be reached by drift**, and nothing has measured whether drift ever reaches them | **Aaron**, then a measurement |
| **5** | **What does despotism buy and what does it cost?** Deferred to F19 after the alpha, at Aaron's instruction. **No placeholder was invented and none should be** | **Aaron**, after the alpha |

---

## 10. Gaps

| | |
|---|---|
| **1** | **`MAX_DISTANCE` has no authored value.** Also open question 1 and `GDD.md` gap 11 — it is both a decision nobody has taken and a number nothing can run without |
| **2** | **⚠ Why each of the six movements was struck is written down nowhere.** §5.3. **Which six is now verified**; the reasoning is not. The round names two in passing and the strike predates it. *Four of the six are ideological labels rather than regional movements, which ruling 40 makes strikeable — but two are regional, so that is not the whole answer* |
| **3** | **Nothing specifies how a three-axis board is DRAWN.** Two axes are a scatter plot. Three are not, and the nation panel currently shows a position on two |
| **4** | **Nothing says what happens to a party that would drift OFF the board.** §2.4 names Despotism and Stateless as where you land, and F19 defers the mechanics — **but the boundary itself is unspecified: at what distance past a corner are you through the trapdoor?** |
| **5** | **The cultural-region minority split is specified for four ideologies and the design has eight corners plus two centrists.** §8.1 names the cost; **nothing says what the twenty rows become** |
| **6** | **Nothing states whether two nations may hold parties at the same position and what that means to each other.** Ruling 40 says Dallas and Vermont hold **two different** Libertarian parties. *Whether that shared location does anything — for affinity, for coalitions, for drift across a border — is unstated* |

---

## 11. The scenarios this document must be able to tell

**Three traced. One narrates, one narrates into a finding, and one jams on the number this document
refuses to invent.**

### 11.1 A Republican government decides to become Communist

**Step 1.** The party occupies the Republican centrist position — middle on economy, middle on power,
conservative on morals.

**Step 2.** Communism is collective, **progressive**, authoritarian. **It is across the moral line.**

**Step 3 — the price is the distance, and ruling 40 is what makes that sayable.** A party moves and an
ideology does not, so *change course* is priced by **how far this party moves** rather than by a
tunable.

**Step 4 — measured: √6 direct against 2 through the centre.** So the cheap route is **become Democrat
first, then drift to Communism** — two moves, total distance 2 + √2, against one move of √6 ≈ 2.449.

**Step 5 — and the drift partition says the second leg is legal:** Democrats reach Communism by varying
economy and power while keeping morals. **Republicans cannot reach it at all without the moral step.**

> **✅ Narrates, and it produces a piece of political realism nobody wrote: moral realignment is the
> rarest and slowest change on the board, and the way to do it is to pass through the mainstream party
> of the other half.** *That is how it has actually worked in American history, and it fell out of the
> geometry rather than being asserted.*

### 11.2 ⚠ Deseret's people are Distributist and Deseret is a movement

**Step 1.** Deseret is placed at **Distributism** — Aaron's own reasoning, *"law of consecration
lite."*

**Step 2.** Its members are counted **in Distributism** and **also** recorded as organised under
Deseret. §5.4.

**Step 3 — so what does the map show?** The Area's leading *position* may be Distributism while the
thing that actually matters about that ground is that **Deseret is organised on it**. **These are
different facts and the model keeps them apart deliberately.**

**Step 4 — and the cleanup phase clamps Deseret back inside Distributism once a turn**, because drift,
growth, migration and war all move people without knowing movements exist.

**Step 5 — now the finding.** **The Farmers Union, Acadiana, Hawaiian Sovereignty, Native American
Confederation, Blue-Collar Populist, Rio Grande Union and Deseret are ALL placed at Distributism —
seven of twenty-six.** §5.1.

> **⚠ Narrates, and exposes something finding H counted but did not say: seven very different
> movements share one location, so on the political map they are one colour.** **A player looking at
> the Political view cannot tell a Mormon corridor from a Cajun parish from a farm belt** — the map
> says *Distributist* for all three. *The movement layer is what distinguishes them, and whether the
> two layers are legible together is a presentation question this document can only raise.* **Gap 3's
> sharper form, and it is filed to `presentation-design.md`.**

### 11.3 ❌ A coalition forms, and nothing can say whether it should

**Step 1.** Two parties in one nation consider working together. **Coalitions read affinity.**

**Step 2.** Affinity is `1 - distance / MAX_DISTANCE`.

**Step 3.** On the new board, two adjacent corners are **2** apart and a centrist is **√2** from its
four corners.

**Step 4 — divide by what?**

> **❌ JAMS, and it is the correct outcome. `MAX_DISTANCE` is unset.** With the old denominator
> (1.7804) a distance of 2 gives a **negative** affinity, which the function cannot produce. With the
> box diagonal (2√3) it gives 0.42. **Every coalition threshold in the game currently reads a number
> that no longer has a meaning.**

**This is not a defect in this document — it is the thing this document refuses to invent**, and the
trace is here to show that **it is not a detail to be settled late: nothing that reads affinity can be
tuned until it is answered.** *Open question 1, and it is the first thing the Technical Designer must
do.*

---

*Sources, verified against the files on 15 September 2026: `docs/design/politics-ideation.md` rulings
1, 2, 22, 31, 40, sections P4, P5, P6, the re-map table, and finding H; `DESIGN.md` §3, §3.1;
`content/ideologies.json`; `data/parties.json` (32 movements, diffed against the re-map's 26 to
identify the six struck); `DECISIONS.md` D185, D231; `docs/FUTURE-IDEAS.md` F19. **The √2, 2 and √6
distances are quoted from ruling 2 and P6 as measured there; 2√3 is arithmetic from them and is marked
as such. No figure here was re-measured except the movement diff, which was run this session.***
