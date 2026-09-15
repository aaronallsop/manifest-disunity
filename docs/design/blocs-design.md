# Blocs and federations — the two multilateral objects, and the five toll regimes nobody has reconciled

**Stage 2 of five: DESIGN.** A specification for the Technical Designer, not an idea bank.

**Depends on:** `GDD.md` · `diplomacy-design.md` (recognition, which joining confers; and the relations
list) · `trade-design.md` (the corridor system a club would override) · `governing-design.md` (a
federation has a government) · `war-design.md` (collective defence) · `power-design.md`.

**Read by:** `trade-design.md` · `ai-design.md` · `opening-board-design.md` · `missions-design.md`.

> **⚠ NOTHING IN THIS DOCUMENT IS BUILT.** *Verified by grep: there is no federation, no bloc, no
> alliance, no vassal and no overlord anywhere in the code.* **Every match is a false positive — a
> "ruling bloc" is a political party's share, a "block" is an interface panel.**
>
> **The tuning file contains the project's own admission, inside an unrelated doc string:** *"the
> late-game kingmaker role, **without inventing a vassal contract the save format has nowhere to put**."*

> **The one-sentence version: two objects were ruled, one light and one heavy — and between them they
> create two new internal-trade rules for a build that already has two of its own and a spec with a
> third.**

---

## 1. The two objects, as ruled

**Aaron, in three words: *"Two objects — a bloc is light."***

| | **A BLOC** | **A FEDERATION** |
|---|---|---|
| **What it is** | *"a standing multilateral deal and nothing more"* | round 3's heavy object |
| Leader | **none** | **elected** |
| Budget and a turn of its own | **none** | **yes** |
| Mutual defence | **none** | **an attack on one is a war with all** |
| **Internal trade** | **"free movement of goods"** | **a flat toll replacing members' own arrangements** |
| Peace between members | **members may still quarrel** | **at peace with every member, full stop** |
| Joining | **unanimous**, and **it confers recognition** | — |
| Leaving | **free — anyone may walk out** | **free and immediate** |

**The floor is three members for both.**

### 1.1 The eleven defaults hiding inside the rulings

**Confirmed by the same click that closed the round, and never enumerated as defaults anywhere.** *Four
of them are load-bearing:*

1. **A bloc CANNOT EXPEL.** *An expulsion would be the multilateral version of de-recognition and would
   give a bloc teeth it currently lacks.*
2. **⚠ A bloc does NOT make its members peaceful with each other.** *Two members of the same bloc may be
   Hostile.* **This is the one that breaks the trade rule — §3.3.**
3. **Admission must be UNANIMOUS** — *"a majority vote would mean **a nation being outvoted into
   recognising a country it refuses to recognise.**"*
4. **Vassalage can be DEMANDED, and refusing is a casus belli**; it can be offered upward; **and a
   vassal repudiating is a hostile act rather than a free exit.**

### 1.2 ⚠ Joining a bloc IS recognition, and that is why the recognition block survives

> Aaron: *"**Yes, and joining brings recognition.**"*

**Every member's signature at once.** *This is what let the round honour the standing recognition block
rather than drive through it — **admission is unanimous, so nobody is outvoted into recognising
anybody.***

**⚠ And it does not rescue the alpha.** *There are no blocs on the opening board at all.* **The ruling
gives the one pariah on the board a road that does not yet exist.**

---

## 2. ⚠ THE CENTRAL TASK — and it is FIVE regimes, not three

**The project has tracked this as *"the three unreconciled internal-trade regimes."* Two more were
found on 15 September, and both of them are running in the build today.**

| | Regime | Rate inside | Who collects | Status |
|---|---|---|---|---|
| **1** | **The built corridor grant** | **negotiated, 5%–60%**, per pair, per direction, per mode | **the host nation** | ✅ **BUILT** |
| **2** | **⚠ The built LEGACY one-off sale** | the same baseline, **rail −50%, highway −20%** | the host nation | ✅ **BUILT** |
| **3** | **The spec's compounding multipliers** | **highway ×1.0, rail ×1.6, port ×2.5** on delivered cost | — | specified |
| **4** | **The federation's flat toll** | **10% routed / 5% direct — and 15% in a third ruling** | **5% host + 5% the federation** | designed |
| **5** | **The bloc's free movement** | **unspecified — no number exists** | **nobody named** | designed |

**⚠ Regimes 1 and 2 price the modes in OPPOSITE DIRECTIONS and are on the same panel.** *Full treatment
in `trade-design.md` §4.1 and `docs/deferred.md` 41.* **Neither design document describes regime 2, so
a designer reconciling "the three" would reconcile the wrong three.**

### 2.1 The federation's rule, in Aaron's own words

> *"A federation should be a relation between multiple states. Alliance is two states. A federation is
> like the EU — so free trade agreement with every nation with a **flat 10% toll that is automatically
> applied. 5% goes to the nation, and 5% goes to the federation**, and that is the sole source of the
> federation's income."*

**And it REPLACES members' own arrangements with one another.** *Inside a federation there are no
negotiated corridors between members: **they trade at a rate nobody can refuse or revoke.*** *Agreements
signed before joining run out their term first.*

**Who takes the nation's half:** *"**the nation whose ground the goods actually cross.** That is what a
toll already is here: charged by the country you pass through, **on what ARRIVES rather than what set
out**."*

**And between two members who are direct neighbours: only the federation's 5% is levied** — *there is
no host, so there is no host's half.* **Direct trade inside a federation costs 5%; routed trade costs
10%.**

### 2.2 ⚠ Aaron named two of the three collisions himself, before anybody found them

> 1. **"Multi-hop inside the federation.** Goods crossing **two** member states — does each host take
>    5%, or is there one host share divided between them? **Leaning: one share, divided** — otherwise
>    'flat 10%' stops being flat and the federation starts punishing distance… **NOT ruled.**"
> 2. **"Tolls compound on what arrives.** Two hosts at 5% each leave **90.25%**, not 90%. **'Flat' and
>    'compounding' are not the same arithmetic**, and the build does the second one today."
> 3. **"Routes that leave the federation and come back"**, crossing a non-member in between, where the
>    federation's rate and a negotiated corridor apply to the same journey.

**That is unusually good design instinct and it should be said: he priced his own ruling's collisions
in the same breath as making it.**

---

## 3. Where the regimes disagree — precisely

### 3.1 In VALUE — and the federation's headline number is unreachable

| | Federation | Bloc | Built corridor |
|---|---|---|---|
| Rate crossing a member | **10% routed / 5% direct** | **"free"** | **5%–60% negotiated** |
| Who receives it | **5% host + 5% treasury** | **nobody named** | **the host** |
| **Friction on top** | **never mentioned** | **never mentioned** | **11.25%–25% per hop, LOST TO EVERYONE** |

> **❌ THE FEDERATION'S "FLAT 10%" IS UNREACHABLE UNDER THE BUILT ARITHMETIC, and compounding is not why.**
>
> *Aaron spotted the compounding — two 5% hops leave 90.25% rather than 90%. **The real gap is friction,
> which nobody has mentioned once.*** **A two-hop road route at 5% each delivers about 51%, not 90%.**
> *The ruling and the engine differ by roughly a factor of two on the same journey, and **no ruling has
> ever said whether a federation waives friction.*** **Open question 4.**

**⚠ And the federation's internal rate is EXACTLY the floor of what anyone will voluntarily sign.** *The
negotiated minimum is 5%.* **So on price the federation confers nothing a friendly neighbour would not
already grant** — *which is not what round 3 meant when it ruled that joining **caps** a gate-holder's
advantage rather than zeroing it.*

**⚠ And the 10% collides with itself.** *The foreign-corridor toll is also 10% — but it is **a COST
rather than a transfer: nobody receives it**. The federation's 10% is a transfer, split 5/5.* **Same
number, opposite semantics, both called "the ten per cent" — and the ruling predicted the confusion in
writing.**

### 3.2 In SHAPE — and the exit asymmetry is the sharpest

| | Federation | Built corridor |
|---|---|---|
| Granularity | **one rate for everything** | **per (grantor, grantee, MODE)** — four modes |
| Direction | symmetric | **directed** |
| Refusable | *"not negotiated, not refusable"* | **yes — no grant, no route at all** |
| Revocable | **no.** That is the sacrifice | **yes, with four turns' notice** |
| Term | **permanent while a member** | **a menu, then it lapses** |
| Capacity | **silent** | **a cap per grant, and a national ceiling** |
| **Leaving** | **free and immediate** | **four turns' notice and a −0.30 memory against you** |

> **⚠ THE EXIT ASYMMETRY IS THE SHAPE CONFLICT NOBODY HAS NAMED.** *Round 3 made exit immediate because
> "there is nothing to unwind — ruling 26 removed negotiated agreements between members, so walking out
> only stops the flat rate."*
>
> **But in the built system, withdrawing passage is never free.** *It costs four turns of notice and a
> memory weighted double in the reliability score.* **A federation member walking out on Tuesday severs
> every internal route on Tuesday, with no notice and no memory written.** *Nobody has ruled whether
> that is intended.* **Open question 7.**

### 3.3 In WHICH OBJECT OWNS THE RULE — and this is the deepest

| Regime | The rule lives on | So |
|---|---|---|
| **Federation** | **the MEMBERSHIP** — a property of the club | **joining rewrites the terms of every route you have with every member.** There is no object per pair |
| **Bloc** | **unstated** — the club again, by implication | **⚠ but two members may be HOSTILE, so a bloc's trade rule must survive a hostile pair, which no other regime has to do** |
| **Built corridor** | **the GRANT** — a row in a register keyed by grantor, grantee and mode, with its own term, rate, cap and status | **every route is priced by walking the hops and asking each ground-holder separately** |

> **⚠ THE FEDERATION DISSOLVES THE OBJECT THE BUILD TREATS AS THE UNIT OF ACCOUNT.** *The transit
> system has no concept of "a rate that applies because of who you belong to" — it returns nothing
> unless a specific grant exists on that exact triple.*
>
> **So implementing the ruling means one of two things, and nobody has chosen:**
> 1. **Synthesise phantom grants** for every member pair × every mode on admission, and destroy them on
>    exit; or
> 2. **Add a second branch above the register lookup** — *exactly where the Canada/Mexico corridor branch
>    already sits.* **⚠ And that is the branch whose money is BURNED rather than transferred. The
>    federation needs the same position in the code and the opposite answer.**

### 3.4 ⚠ And a FOURTH club rule already exists in the build, unruled

**Any toll between two nations holding a live trade deal is HALVED.** *It is described as "the blunt
version" of the idea that a corridor should be a bargaining chip inside a trade negotiation.*

> **A federation member and a bloc member both automatically satisfy its condition.** *So on today's
> engine, joining either would halve the toll **a second time**, on top of whatever the club's own rule
> says.* **Open question 8.**

---

## 4. ⚠ A FIFTH internal-trade rule, on nobody's list: the vassal's free passage

**Ruling 5 gives the overlord *"free passage for the overlord's goods."***

**That is a per-pair, ONE-DIRECTIONAL, zero-rate passage right that overrides the grant register.**
*Same shape as the bloc's free movement, different owner — the vassalage rather than a club — and
different symmetry.* **It is not in anyone's list of regimes and nothing has reconciled it with
anything.**

---

## 5. Vassalage — and the client system already underneath it

**⚠ Vassalage is not a blank page. An informal client-state system is BUILT, and no round knew until
round 5 found it.**

**How it works:** *aid transfers a share of the donor's treasury; the patron weight gained is scaled by
how large the gift is **relative to the RECIPIENT's income**, capped at 0.35.*

> **ONE PATRON AT A TIME, and the newcomer has to outbid the incumbent.** *"A recipient with two
> benefactors pulled in two directions would average to nothing… **a client state is somebody's
> client.**"*

**The patron's ideology blends into the client's government lean** — *"a fully-bought client governs
about a third like its patron and two thirds like itself"* — **decaying at 0.08 a turn, half gone in
about nine turns, "so the lever has to be held down rather than pulled once."** *And the system already
answers "who is in my sphere".*

**The cap under 1 is the statement that money cannot buy a country outright**, *which is what stops one
of the victory conditions from being a purchase.*

### 5.1 What ruling 5 adds on top

> Aaron: *"**Foreign policy only.**"*

**A vassal keeps its action and runs itself at home.** *What it loses is the foreign column: **it cannot
sign a deal, grant a corridor, join a bloc, ally, or declare a war without its overlord's consent.***
**Beyond that: a tithe of income, and free passage for the overlord's goods.**

**And the domestic half is inherited: a vassal keeps its own government, and its people blame that
government, not the overlord.**

### 5.2 ⚠ It is the pariah's escape hatch, and nobody intended it

**Vassalage sits on aid. Aid is not recognition-gated.**

> **So submitting to your own parent currently buys your existence.**
>
> *The round's own verdict: **"Excellent drama; possibly too cheap."*** **And the objection is precise:
> if submitting delivers recognition automatically, every breakaway ends the same way.**

---

## 6. Coalitions — the one multilateral thing that IS built

**Full treatment in `war-design.md` §8.** *What belongs here is that a coalition is explicitly **not** a
bloc:*

> *"Coalitions form only against a threat and dissolve when it passes. They are a per-turn survey over
> the relations list, **not an agreement anybody signs**. **Every deal in the game is bilateral. There is
> no standing multilateral object of any kind** — which is exactly the hole the federation and every
> bloc idea has to fill."*

**And it is ruled to BE intervention:** *"Coalitions form on threat and dissolve when it passes, with no
agreement signed by anybody… **Uninvited defence is what a coalition already is.**"*

**⚠ Membership requires recognition** — *"nobody coordinates with a state they do not admit exists"* —
**so a pariah cannot be in one either way.**

**⚠ And sponsorship is supposed to draw a coalition and cannot.** *The round ruled that **paying
somebody's rebels is worse than recognising them**, so sponsorship needs a memory heavier than the
heaviest one that exists — and **no sponsorship memory kind exists at all.***

---

## 7. ⚠ What the gate-holders lose, and it has never been priced

**The ruling names the four nations whose leverage federation membership dissolves** — *all **[BUILT]***:

| | Their chokepoints |
|---|---|
| **Michigan** | four Great Lakes chokepoints |
| **New York** | Niagara, the St. Lawrence |
| **Illinois** | the Chicago canal, Cairo |
| **Louisiana** | New Orleans, the Mouth of the Mississippi |

> **"A federation must pay them, elect them, or do without them — and the map decides which."**

**None of the fifteen chokepoints has ever been priced against the 5% cap.** *Gap 4.*

---

## 8. What this hands the Technical Designer

| | |
|---|---|
| **❌ FIVE toll regimes, and two are live in the build right now** | §2 |
| **❌ Does a federation waive friction?** *At the floor rate friction is five times the toll, so the answer decides whether "flat 10%" means 90% delivered or about 51%* | §3.1 |
| **❌ Phantom grants, or a second branch above the register?** *The second sits exactly where the burned-money branch sits and needs the opposite answer* | §3.3 |
| **⚠ A bloc's trade rule must survive a HOSTILE pair.** *No other regime has to* | §3.3 |
| **⚠ A fourth and fifth club rule already exist** — the partner discount, and the vassal's free passage | §3.4, §4 |
| **"Free movement" is not expressible while friction exists** | `trade-design.md` §4.3 |
| **Nothing anywhere mentions capacity** | Gap 2 |
| **There are no tunables. Not one** | Gap 3 |

---

## 9. Open questions

| | | Owner |
|---|---|---|
| **1** | **⚠ THE CENTRAL ONE. Does a club override the corridor system inside itself, or does the corridor system learn a second mode?** *"Either… or."* **⚠ And two documents are both named as owning this job** | **The design stage** — *`GDD.md` names `trade-design.md`; the run plan names this one. **Two owners, one job*** |
| **2** | **What rate does "free movement of goods" mean?** *Zero toll and zero friction? Zero toll and normal friction? **The bloc has no number at all*** | **Unassigned** |
| **3** | **Multi-hop inside a federation: each host takes 5%, or one share divided?** *Aaron: "Leaning: one share, divided… **NOT ruled**"* | **Aaron — he named it himself** |
| **4** | **⚠ Does a federation waive friction?** *Never asked by any round, and it is the difference between 90% and 51%* | **Unassigned — found here** |
| **5** | **Routes that leave the federation and re-enter**, where a club rate and a negotiated corridor price the same journey | **Architecture** |
| **6** | **What does leaving a BLOC cost?** *"Leaving a bloc is what the story is actually about… what it costs to walk out is open"* | **Unassigned** |
| **7** | **⚠ Is the federation's instant severance intended?** *The built system charges four turns' notice and a memory for exactly that act* | **Unassigned — found here** |
| **8** | **⚠ Does the partner discount stack on top of a club rate?** *A member automatically satisfies its condition* | **Unassigned — found here** |
| **9** | **The vassal's tithe, and what the overlord's veto costs the overlord** | **Stage 3** |
| **10** | **Is vassalage-as-recognition too cheap?** *"Submitting should probably not deliver recognition automatically, or every breakaway ends the same way"* | **Round 5, then the mechanics stage** |
| **11** | **Can a bloc expel?** *Ruled no, by precedent — but an expulsion is the multilateral version of de-recognition and would give a bloc teeth it lacks* | **A reversible default, confirmed** |

---

## 10. Gaps

| | |
|---|---|
| **1** | **⚠ "Free passage for the overlord's goods" is a FIFTH internal-trade rule and is on nobody's list** |
| **2** | **Nothing specifies a club's interaction with CAPACITY.** *Every built route is bounded by a per-grant cap and a national ceiling; neither club rule mentions capacity* |
| **3** | **⚠ No tunable exists for any club object. Not one.** *Every figure lives in prose, against the project's standing rule* |
| **4** | **The four gate-holders' leverage has never been priced against the 5% cap** |
| **5** | **No rule exists about a federation BREAKING UP** — *"a federation destroyed from the inside by its own caution, with no rule about federations breaking up"* |
| **6** | **⚠ The federation's toll is 10%, 5% and 15% in three different rulings.** *Nothing reconciles them* |
| **7** | **Sponsorship needs a relations memory heavier than the heaviest that exists, and none exists** |
| **8** | **No bloc exists on the opening board and the scenario authors no agreements at all** |
| **9** | **⚠ The three-hop route cap silently makes a club of more than four members unrepresentable for internal routing.** *Neither ruling mentions it* |

---

## 11. The scenarios this document must be able to narrate

### 11.1 ❌ Four states form a federation and their goods get more expensive

**Step 1.** Four **[BUILT]** neighbours federate. *The flat toll replaces every negotiated corridor
between them.*

**Step 2 — two direct neighbours now trade at 5%**, all of which goes to the federation's treasury.

**Step 3 — ⚠ and 5% is exactly the floor of what anyone will voluntarily sign.** *A friendly neighbour
with a live trade deal was already granting passage at the minimum **and having it halved by the partner
discount.*** **So for that pair the federation made trade DEARER.**

**Step 4 — a route crossing one member to reach another costs 10%**, split 5/5.

**Step 5 — ❌ and friction is untouched.** *Nobody has ever said whether a federation waives it.* **A
two-hop road route at 5% each delivers about 51%, not the 90% the ruling's own words promise.**

**Step 6 — and if it crosses TWO members, nobody has ruled whether each takes 5% or they share one.**
*Aaron leaned one way and did not rule.*

> **❌ JAMS ON ARITHMETIC NOBODY HAS DONE.** *The ruling says "flat", the engine compounds, and the
> larger error is a term the ruling never mentions.* **The federation as written can make internal trade
> more expensive than not federating at all.**

### 11.2 ⚠ Two members of one bloc are at each other's throats

**Step 1.** A bloc has three members. **Two of them are Hostile** — *ruled explicitly: a bloc does not
make its members peaceful.*

**Step 2 — the bloc promises "free movement of goods between members."**

**Step 3 — ⚠ and hostility is designed to block every instrument.** *No new deal, no new corridor, no
treaty with a hostile nation.*

**Step 4.** *So the club's rule and the pair's state give opposite answers, and nothing says which
wins.*

**Step 5 — ⚠ and the bloc has no number anyway.** *"Free movement" has never been given a rate, a
friction treatment, or a collector.*

> **⚠ NARRATES INTO A CONTRADICTION THAT IS THE BLOC'S ALONE.** *The federation is safe here because it
> puts its members at peace with one another; the bloc explicitly does not.* **It is the only regime
> whose trade rule has to survive a hostile pair, and nobody noticed it needs to.**

### 11.3 ⚠ A pariah submits and buys its way onto the map

**Step 1.** A new nation cannot trade, cannot join a coalition, and cannot be recognised while its
parent refuses.

**Step 2 — it offers vassalage upward.** *Ruled: vassalage can be offered upward.*

**Step 3 — aid flows, and aid is not recognition-gated.** *The client system was already built and
nobody knew.*

**Step 4 — it loses its foreign column entirely.** *No deal, no corridor, no bloc, no alliance, no war
without consent.*

**Step 5 — and the overlord's goods pass through it free**, one-directionally, overriding the grant
register — **a rule that is on nobody's list of trade regimes.**

**Step 6 — but it exists, and being somebody's vassal is recognition in all but the signature.**

> **⚠ NARRATES, AND IT IS THE BEST DRAMA IN THE ROUND — which nobody designed.** *"Excellent drama;
> possibly too cheap."* **The objection is precise and still open: if submitting delivers recognition
> automatically, every breakaway ends the same way.**

### 11.4 ✅ A federation dissolves a chokepoint holder's leverage, and the map decides what it costs

**Step 1.** Michigan **[BUILT]** holds four Great Lakes chokepoints. *Everything moving between the
lakes pays it.*

**Step 2 — it is invited into a federation.**

**Step 3 — joining caps its take at 5%**, because the flat rate replaces every negotiated corridor
between members.

**Step 4 — so the question is whether the federation can afford to buy it in.** *"A federation must pay
them, elect them, or do without them."*

**Step 5 — and the elected leadership is the currency**, because a federation has a leader and a
treasury and a gate-holder has a reason to want both.

> **✅ NARRATES, AND IT IS THE BEST THING IN THE DESIGN — the map decides the politics.** *⚠ The one
> thing missing is that **none of the fifteen chokepoints has ever been priced against the 5% cap**, so
> nobody knows whether "pay them" is affordable or absurd.*

---

*Sources, verified 15 September 2026: `docs/design/diplomacy-ideation.md` rulings 4, 5, 10, 16, 20, 21
and their eleven embedded defaults, findings B, I, J, K, and ideas T38, T39, T41, T42, T48, T59, T84;
`docs/design/politics-ideation.md` rulings 25–39, with Aaron's verbatim federation ruling and his own
three caveats; `js/transit.js` (the grant register, `priceRoute`, friction, the partner discount, the
corridor branch whose money is burned); `js/pacts.js` (the built patron system); `js/coalitions.js`;
`js/tunables.js` (`transit.*`, `aid.*`, `coalition.*` — **and the verified absence of any federation,
bloc, alliance or vassalage key**); `docs/deferred.md` 28, 41. **The absence of every club object from
the code was verified by grep in this session. The 51%-delivered figure for a two-hop federation route
is computed here from the shipped friction and toll values and is marked as derived, not measured in
play.***
