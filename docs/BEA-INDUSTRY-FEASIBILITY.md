# Can the industry split be re-baked from real data?

**Answers spec v2 open question 2, and gates Phase 0.5.**
**Measured 5 September 2026** against `build/raw/CAGDP2.zip` (BEA, released 5 February 2026),
3,127 counties, 2024 figures. Every number below was counted, not estimated.

## Answer: yes — re-bake with apportionment

**Recommendation: `REBAKE_WITH_APPORTIONMENT`.**

83.5% of the map's industry figures can come from real BEA data. The remaining 16.5% are suppressed
by BEA for disclosure reasons and get apportioned from the county's real total and flagged **est.** —
which is precisely the convention `DESIGN.md` already sets out and already applies to population and
GDP.

Today that figure is **0%**. Nothing in the industry split is measured.

## What is on disk already

`build/raw/CAGDP2.zip` — 14.6 MB, downloaded 2 July, containing county GDP by industry for
2001–2024 across 34 industry line codes. **The re-bake needs no new download.** The existing data
build already reads this file and discards 33 of its 34 industry lines with a single filter, keeping
only the all-industry total.

## What was measured

### Suppression

Across the six sectors, at county level, for 2024:

| | Cells | Share |
|---|---|---|
| Real published figures | 20,311 | 81.2% |
| Suppressed `(D)` | 4,609 | 18.4% |
| Not available `(NA)` | 96 | 0.4% |

Choosing BEA's aggregate lines where a component is suppressed recovers a further slice, taking
measured coverage from 77.0% to **83.5%**:

| Sector | Measured in | |
|---|---|---|
| Resource Extraction | 3,115 counties | 99.6% |
| Manufacturing | 2,962 | 94.7% |
| Agriculture | 2,726 | 87.2% |
| Information Technology | 2,571 | 82.2% |
| Trade & Transportation | 2,310 | 73.9% |
| Finance | 1,975 | 63.2% |

1,337 counties (42.8%) have all six measured outright. Finance is the weakest because it is
commercially concentrated and therefore most often disclosure-suppressed.

### The anchor apportionment needs

**3,115 of 3,127 counties (99.6%) publish a usable all-industry total.** That is what makes
apportionment honest rather than invented: a suppressed sector is filled by distributing a *real*
county total across the gap, so the county's sum stays true and only the split within it is estimated.
Twelve counties have neither — they keep a labelled estimate.

## The decision this surfaces, which is yours

**The game's six sectors cover only 52.5% of measured county GDP.**

Government, professional services, healthcare, education, construction, utilities, hospitality — a
little under half the real economy — have no sector to go into. The data cannot decide this; it is a
design question, and getting it wrong re-introduces exactly the invention the ruling exists to remove.

Three ways to resolve it:

1. **Widen the six definitions to absorb everything.** Finance already contains real estate;
   Information Technology absorbs professional/scientific/technical (which is where software actually
   lives in the official classification); Manufacturing takes construction and utilities; and so on.
   Every dollar lands somewhere real, the six shares still sum to the county's true GDP, and nothing
   is invented. **Recommended.**
2. **Drop the 47.5% and rescale the rest to 100%.** Arithmetically simple, but the sector values stop
   summing to the county's real GDP — which breaks the half of the design principle that says
   nation-level sums stay correct, and breaks the market's rescaling assumption.
3. **Spread it pro-rata across the six.** This is inventing again, with better arithmetic.

One naming consequence worth knowing under option 1: BEA has no "Information Technology". Its
"Information" line is publishing, telecoms and broadcasting; software and computer systems design sit
under professional and technical services. Folding those together is what makes the sector mean what
a player thinks it means — but it changes which places look like tech hubs, and that is a judgement,
not a measurement.

## What the re-bake would involve

- Stop discarding 33 of 34 industry lines in the existing data build.
- Aggregate county rows up to the game's 1,688 Areas, applying the existing combined-area handling
  for Virginia's independent cities.
- Apportion suppressed cells from the real county total; flag them **est.** using the badge mechanism
  that already exists and is already wired to population, GDP and vote.
- Connecticut needs care: BEA moved to planning regions for 2024, which is the same change the map
  already made, so the two should now agree — but the join must be tested rather than assumed.
- A save-format bump. The last change to this data forced the save version and refused older
  documents by name rather than migrating them; budget for the same.

## What is still unverified

- The Connecticut join has not been tested, only reasoned about.
- Whether the 3,127 BEA counties and the game's county set are identical has not been proven — the
  counts are close, the sets are not confirmed equal.
- Whether the existing GDP totals came from this table's all-industry line or a sibling table.

None of these change the recommendation; all of them are work inside Phase 0.5.
