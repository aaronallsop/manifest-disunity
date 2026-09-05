/*
 * TUNE — one mutable object holding every constant the model uses.
 *
 * Two rules make this worth the indirection:
 *
 *   1. No magic numbers in model code. Every constant is a named key here, with
 *      a label, a range and a one-line doc, so the M5 dashboard can render a
 *      slider for it without a second table.
 *   2. Every read goes through TUNE.get(key), which RECORDS the key it served.
 *      That recording is the "show your work" panel — a formula's ruleset keys
 *      fall out of tracing its reads instead of being hand-listed a second time.
 *
 * Values load from content/tunables.json when the server has one, overriding the
 * defaults below key by key. Defaults stay the schema: they define what exists,
 * what type it is and what range a slider spans.
 */

/**
 * key -> { v, label, group, doc, min?, max?, step?, kind? }
 *
 * `kind` is 'number' (default), 'array', 'object' or 'bool'. Array and object
 * values are not slider-able; the dashboard renders them as editable JSON.
 */
export const SCHEMA = {
  /* ---------------- the calendar ---------------- */
  'calendar.startYear': {
    v: 2036, min: 1776, max: 2200, step: 1, group: 'Calendar',
    label: 'Opening year',
    doc: 'The year turn 0 begins in. The game opens on 1 March 2036, the eve of two hundred years since Texas declared itself a nation, so the bicentenary falls inside the first turn.',
  },
  'calendar.startMonth': {
    v: 3, min: 1, max: 12, step: 1, group: 'Calendar',
    label: 'Opening month',
    doc: 'Month turn 0 begins in, 1-12. March. Turns run as quarters FROM this month rather than from the calendar\'s own, so every turn lands on a real month (March, June, September, December) and the opening date is kept exactly.',
  },
  'calendar.startDay': {
    v: 1, min: 1, max: 28, step: 1, group: 'Calendar',
    label: 'Opening day',
    doc: 'Day of the month the game opens on. Shown only in exports, where a sortable full date is more useful than a pretty one.',
  },
  'calendar.monthsPerTurn': {
    v: 3, min: 1, max: 12, step: 1, group: 'Calendar',
    label: 'Months per turn',
    doc: 'How much time one world turn represents. Three: a quarter. The month was ruled and reversed (D163) because every rate in the engine is calibrated per turn, so the unit changes only what the calendar prints — set this to 1 and the whole game would need re-deriving, not just this number.',
  },

  /* ---------------- world phases ---------------- */
  'world.driftStep': {
    v: 0.02, min: 0, max: 0.2, step: 0.005, group: 'World',
    label: 'Political drift step',
    doc: 'Fraction of the gap to the drift target a county closes each turn.',
  },
  'world.driftOwnerWeight': {
    v: 0.35, min: 0, max: 1, step: 0.05, group: 'World',
    label: 'Drift target: owner weight',
    doc: 'Share of the drift target taken from the owner nation. 1.0 reproduces the pre-M1.6 single global attractor, which collapsed the county grid into a nation-level scalar with a 23-turn half-life.',
  },
  'world.driftAnchorWeight': {
    v: 0.40, min: 0, max: 1, step: 0.05, group: 'World',
    label: 'Drift target: structural anchor weight',
    doc: 'Share of the drift target held by the county own founding character, the part a nation can only partly override. The remainder after owner + anchor is the neighbourhood weight, which makes the surviving spread spatially smooth.',
  },
  'world.growthMixNationWeight': {
    v: 0.35, min: 0, max: 1, step: 0.05, group: 'World',
    label: 'New residents: national mix weight',
    doc: 'How much of a county new residents arrive in the OWNER NATION party mix rather than the county own. At 1.0 population growth is a second unopposed attractor pulling at exactly the same fixed point as political drift, which is half of why the county grid collapsed. M7 replaces this with real migration along the QoL gradient.',
  },
  'world.driftNoise': {
    v: 0.004, min: 0, max: 0.05, step: 0.001, group: 'World',
    label: 'Political drift noise',
    doc: 'Bounded per-county per-turn jitter in share space, so deviation has non-zero stationary variance.',
  },
  'world.popGrowth': {
    v: 0.01, min: 0, max: 0.1, step: 0.001, group: 'World',
    label: 'Population growth / turn',
    doc: 'Base per-turn population growth rate, applied to every party including emergent movements.',
  },
  'world.gdpGrowth': {
    v: 0.008, min: -0.05, max: 0.1, step: 0.001, group: 'World',
    label: 'GDP growth / turn',
    doc: 'Base per-turn real GDP growth before per-nation modifiers.',
  },
  'world.gdpGrowthPopCoupling': {
    v: 0.6, min: 0, max: 2, step: 0.05, group: 'World',
    label: 'GDP growth: population coupling',
    doc: 'How much of a county\'s population growth feeds through into its GDP growth.',
  },
  'world.sectorGrowth': {
    v: [0.45, 0.65, 0.90, 1.05, 1.25, 1.70], kind: 'array', group: 'World',
    label: 'GDP growth multiplier by sector',
    doc: 'Ag, Extraction, Manufacturing, Trade, Finance, IT. Multiplies world.gdpGrowth according to an Area sector mix, so an IT-heavy Area compounds faster than an agricultural one. This is what makes RELATIVE market prices move: with a single uniform growth rate the global sector mix is frozen forever, so every price is a constant and the market reports nothing. Structural change in the economy is the only thing a price index can be about.',
  },
  'world.partyCeiling': {
    v: 0.35, min: 0, max: 1, step: 0.01, group: 'World',
    label: 'Emergent party ceiling',
    doc: 'Maximum population share an emergent movement grows toward in a county.',
  },
  'world.partyStep': {
    v: 0.03, min: 0, max: 0.5, step: 0.005, group: 'World',
    label: 'Emergent party step',
    doc: 'Fraction of the gap to the ceiling an emergent movement closes each turn.',
  },
  'world.partyFloor': {
    v: 0.01, min: 0, max: 0.2, step: 0.002, group: 'World',
    label: 'Emergent party floor',
    doc: 'Movements below this share of a county are cleaned up and their share redistributed.',
  },

  /* ---------------- treasury & upkeep ---------------- */
  'econ.taxRate': {
    v: 0.02, min: 0, max: 0.2, step: 0.001, group: 'Economy',
    label: 'Tax rate',
    doc: 'Treasury income per turn as a share of GDP.',
  },
  'econ.govMaintenance': {
    v: { Republic: 0.015 }, kind: 'object', group: 'Economy',
    label: 'Government maintenance rate',
    doc: 'Maintenance cost per turn as a share of GDP, by government type. One entry until M6 gives the player a government to choose; the lookup falls back to Republic for anything unlisted, so adding a type here is the whole change.',
  },
  /* ---- Power: the shared stock discipline --------------------------------
   * These three are the anti-death-spiral guarantee and they apply to every
   * stock in js/power.js. Rate-limiting the CHANGE rather than the value means a
   * catastrophic turn costs a nation `maxFall`, not everything - so a collapse
   * takes a decade of bad turns, which is long enough to be a story and long
   * enough to be recoverable.
   */
  'power.floor': {
    v: 0.08, min: 0, max: 0.5, step: 0.01, group: 'Power',
    label: 'Stock floor',
    doc: 'No power stock falls below this, however bad things get. A floor on the STOCK, not on the target: a nation can be under sustained downward pressure and still hold the floor, which is what stops "already losing" from meaning "cannot recover".',
  },
  'power.maxRise': {
    v: 0.05, min: 0.005, max: 0.5, step: 0.005, group: 'Power',
    label: 'Maximum rise per turn',
    doc: 'The most a power stock can gain in one turn. Standing is built slowly; one good war does not make a state legitimate.',
  },
  'power.maxFall': {
    v: 0.08, min: 0.005, max: 0.5, step: 0.005, group: 'Power',
    label: 'Maximum fall per turn',
    doc: 'The most a power stock can lose in one turn. Deliberately larger than the rise - authority is easier to lose than to build - but bounded, which is the whole anti-spiral guarantee.',
  },

  /* ---- Authority --------------------------------------------------------- */
  'power.authority.base': {
    v: 0.30, min: 0, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: base',
    doc: 'Where a nation sits with every input at zero - brand new, no history, no reserves, no cohesion. Everything else adds to or subtracts from this.',
  },
  'power.authority.ageFull': {
    v: 40, min: 1, max: 200, step: 1, group: 'Power',
    label: 'Authority: turns to full age credit',
    doc: 'Age stops paying after this many turns. 40 turns is ten years at 1 turn = 1 quarter - about how long it takes for "this state has always been here" to be true of anyone alive.',
  },
  'power.authority.tenureFull': {
    v: 24, min: 1, max: 200, step: 1, group: 'Power',
    label: 'Authority: turns to full tenure credit',
    doc: 'How long one ideology must hold power for the government to read as settled rather than new. Shorter than ageFull: a long-established state with a brand-new government is a different thing from a brand-new state.',
  },
  'power.authority.warsK': {
    v: 12, min: 1, max: 200, step: 1, group: 'Power',
    label: 'Authority: wars-won half-point',
    doc: 'Areas taken by force, recently, at which the "wars won" term is half its maximum. Diminishing: the tenth conquest proves less than the first.',
  },
  'power.authority.solvencyFull': {
    v: 8, min: 1, max: 100, step: 1, group: 'Power',
    label: 'Authority: turns of reserves for full solvency credit',
    doc: 'Treasury measured in turns of upkeep it covers. Past this the state is comfortably funded and more money proves nothing further.',
  },
  'power.authority.lossesK': {
    v: 6, min: 1, max: 200, step: 1, group: 'Power',
    label: 'Authority: territorial-loss half-point',
    doc: 'Areas lost, recently, at which the losses term is half its maximum. Lower than warsK on purpose: losing ground says more about a state than taking it does.',
  },
  'power.authority.paceFree': {
    v: 0.35, min: 0, max: 5, step: 0.05, group: 'Power',
    label: 'Authority: digestible expansion rate',
    doc: 'Areas per turn a state can absorb without strain; overreach only counts what is taken ABOVE this. Without the allowance, a single six-Area war scored +0.047 on wars won and -0.060 on overreach, so winning a war LOWERED Authority - which is not a design position anyone would defend. 0.35/turn is about seven Areas across the memory window.',
  },
  'power.authority.overreachK': {
    v: 0.5, min: 0.05, max: 10, step: 0.05, group: 'Power',
    label: 'Authority: overreach half-point',
    doc: 'Areas per turn ABOVE the digestible rate at which overreach is half its maximum. This is what stops conquest being a pure Authority engine: taking ground pays through "wars won", but digesting six conquests at once does not leave a state more secure than two.',
  },
  'power.authority.wAge': {
    v: 0.18, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of age', doc: 'How much a long-established state is trusted.',
  },
  'power.authority.wTenure': {
    v: 0.12, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of tenure', doc: 'How much a settled government is trusted.',
  },
  'power.authority.wWars': {
    v: 0.14, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of wars won', doc: 'How much conquest demonstrates the state can act.',
  },
  'power.authority.wSolvency': {
    v: 0.16, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of solvency', doc: 'How much a funded treasury underwrites the state.',
  },
  'power.authority.wCohesion': {
    v: 0.20, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of cohesion',
    doc: 'How much an ideologically united population strengthens the state. The largest positive weight, because a state governing people who agree with each other is the easiest state to govern.',
  },
  'power.authority.wHoneymoon': {
    v: 0.22, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of the independence honeymoon',
    doc: 'How much goodwill a government that has just won independence enjoys. Large enough to carry a newborn nation - which has no age, no tenure and no reserves - past the moment when every other term reads zero.',
  },
  'power.authority.wLosses': {
    v: -0.30, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of territory lost',
    doc: 'How much losing ground costs. The largest single weight in either direction: a state that cannot hold its territory has failed at the one thing a state is for.',
  },
  'power.authority.wOccupation': {
    v: -0.18, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of occupation',
    doc: 'How much holding foreign soil costs. Occupation is a standing commitment of force that is not available for anything else.',
  },
  'power.authority.wOverreach': {
    v: -0.16, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Authority: weight of overreach',
    doc: 'How much a fast rate of acquisition costs. See overreachK.',
  },

  /* ---- Influence ---------------------------------------------------------
   * Promoted from the ad-hoc, stateless version `evalTransit` has been computing
   * inline per trade dialog since M1 - relative economic size and political
   * alignment - generalised from "against this one partner" to "against the
   * world" and given somewhere to persist.
   */
  'power.influence.base': {
    v: 0.25, min: 0, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: base',
    doc: 'Where a nation sits with every input at zero: no economy, no trade relations, nobody aligned with it. Lower than Authority\'s base, because a state has authority over its own people by existing and influence over anyone else only by earning it.',
  },
  'power.influence.gdpShareK': {
    v: 0.06, min: 0.005, max: 0.5, step: 0.005, group: 'Power',
    label: 'Influence: economic-weight half-point',
    doc: 'Share of world GDP at which the economic-weight term is half its maximum. 0.06 is about twice what the largest opening nation holds, so the term has room to grow into as the map consolidates rather than opening saturated.',
  },
  'power.influence.partnersK': {
    v: 5, min: 1, max: 50, step: 1, group: 'Power',
    label: 'Influence: trade-reach half-point',
    doc: 'Live trade relations at which the reach term is half its maximum. Read from tradeCooldown, which already records who you do business with - a second relations table could disagree with the one the trade screens read.',
  },
  'power.influence.conquestK': {
    v: 14, min: 1, max: 200, step: 1, group: 'Power',
    label: 'Influence: conquest half-point',
    doc: 'Areas taken recently, SCALED BY (1 + your current influence), at which the conquest term is half its maximum. The scaling is the design\'s context-dependent cost: a superpower annexing a neighbour pays more in reputation than an unknown does, because it had more to spend.',
  },
  'power.influence.paceFree': {
    v: 0.2, min: 0, max: 5, step: 0.05, group: 'Power',
    label: 'Influence: tolerated expansion rate',
    doc: 'Areas per turn the world shrugs at. Lower than Authority\'s paceFree: your own institutions can digest expansion faster than your neighbours will forgive it.',
  },
  'power.influence.paceK': {
    v: 0.6, min: 0.05, max: 10, step: 0.05, group: 'Power',
    label: 'Influence: blitz half-point',
    doc: 'Areas per turn above the tolerated rate at which the blitz term is half its maximum.',
  },
  'power.influence.wEconomy': {
    v: 0.30, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of economic weight',
    doc: 'How much a large economy buys you a hearing. The largest positive weight: soft power follows the money.',
  },
  'power.influence.wReach': {
    v: 0.18, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of trade reach',
    doc: 'How much having live trade relations with many nations raises your standing.',
  },
  'power.influence.wAlignment': {
    v: 0.22, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of alignment',
    doc: 'How much it helps that the rest of the world thinks like you, weighted by their size. Being ideologically close to California is worth more than being close to Wyoming, which is what soft power means.',
  },
  'power.influence.wConquest': {
    v: -0.34, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of conquest',
    doc: 'What taking ground costs you abroad. The largest weight in either direction, and the one that scales with what you already had.',
  },
  'power.influence.wBlitz': {
    v: -0.20, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of blitz pace',
    doc: 'What taking ground FAST costs, on top of taking it at all.',
  },
  'power.influence.wOccupation': {
    v: -0.14, min: -1, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of occupation',
    doc: 'What holding foreign soil costs abroad. Smaller than the Authority penalty: occupation is a heavier drain on your own institutions than on your reputation, where the annexation itself did the damage.',
  },

  /* ---- Quality of Life ---------------------------------------------------
   * Food and healthcare as NEEDS rather than sectors. A share of output is a
   * fact about an economy; what matters is production per person against a
   * per-person requirement, so the same agricultural output feeds a small nation
   * and starves a large one.
   */
  'qol.base': {
    v: 0.20, min: 0, max: 1, step: 0.01, group: 'Quality of life',
    label: 'QoL: base',
    doc: 'Where a nation sits with no food, no income and no reserves. Low on purpose: unlike Authority, nothing about quality of life is free.',
  },
  'qol.foodPerCapita': {
    v: 8000, min: 500, max: 60000, step: 500, group: 'Quality of life',
    label: 'Food required per person per year',
    doc: 'CALIBRATED IN THE UNITS THE MODEL USES, NOT IN REAL DOLLARS. The economy bake treats Agriculture as a template-apportioned share of GDP rather than as real farm revenue, so it runs an order of magnitude above farm-gate value: measured across the 51 opening nations it is $3,392 to $26,212 per head, median $6,995. Against the original $1,100 every nation was trivially fed and the term carried no information. 8,000 leaves a peacetime board mostly fed - which is the honest thing to say about the 2024 United States - and makes food the term that COLLAPSES when a war or an occupation takes an economy apart. A term that reads 0.95 at peace and 0.3 after a war is doing its job; one that reads 0.7 at peace is miscalibrated.',
  },
  'qol.foodImportShare': {
    v: 0.02, min: 0, max: 0.5, step: 0.005, group: 'Quality of life',
    label: 'Share of GDP redirectable to food imports',
    doc: 'FOOD CAN BE BOUGHT. Without this term the model says the District of Columbia starves, which is not a claim about the world - it is a claim about a model that confused growing food with having food. The mechanic it creates is the right one: agriculture or money, and a nation with neither is in trouble. At 0.02 a median nation buys about a fifth of its requirement and a rich one with no fields buys roughly half.',
  },
  'qol.healthPerCapita': {
    v: 110000, min: 1000, max: 500000, step: 1000, group: 'Quality of life',
    label: 'Income per person for full healthcare',
    doc: 'GDP per head at which a nation can fund care for everyone. Healthcare has no sector in the six-sector economy and is not faked as one; it is bought out of income, which is the proxy real health outcomes track most closely. Measured spread across the opening nations is $53,751 (Mississippi) to $262,439 (DC), median $77,684, so 110,000 puts the median at 0.71 rather than saturating every state at 1.',
  },
  'qol.prosperityFull': {
    v: 250000, min: 5000, max: 1000000, step: 5000, group: 'Quality of life',
    label: 'Income per person for full prosperity credit',
    doc: 'GDP per head past which more money stops improving daily life. Well above the healthcare bar, because being fed and treated comes before being rich, and because prosperity should be the term that is hard to max: only the richest nation on the board approaches it.',
  },
  'qol.strainK': {
    v: 0.25, min: 0.01, max: 3, step: 0.01, group: 'Quality of life',
    label: 'QoL: fiscal-strain half-point',
    doc: 'Deficit as a share of income at which the strain term is half its maximum. Measured against income, because a $1bn shortfall means something different to Wyoming and to California.',
  },
  'qol.wFood': {
    v: 0.34, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'QoL: weight of food security',
    doc: 'The largest weight, and the only one whose shortfall gets its own sentence in the summary. Nothing else about a nation matters much to someone who is not eating.',
  },
  'qol.wHealth': {
    v: 0.24, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'QoL: weight of healthcare',
  doc: 'How much being able to fund care raises daily life.',
  },
  'qol.wProsperity': {
    v: 0.20, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'QoL: weight of prosperity', doc: 'How much general income raises daily life beyond food and care.',
  },
  'qol.wStrain': {
    v: -0.22, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'QoL: weight of fiscal strain',
    doc: 'How much a government running a deficit costs the people it governs - services are what get cut.',
  },

  /* ---- Civil Liberties ---------------------------------------------------
   * Could not be written before gov.rulingIdeology existed: the whole measure is
   * how far the governed sit from the governing, which needs both halves.
   */
  'liberty.base': {
    v: 0.22, min: 0, max: 1, step: 0.01, group: 'Quality of life',
    label: 'Liberties: base',
    doc: 'Where liberties sit before the government, the population or the economy is taken into account.',
  },
  'qol.govTolerance': {
    v: { Republic: 0.85 }, kind: 'object', group: 'Quality of life',
    label: 'Dissent a government tolerates, by type',
    doc: 'How much disagreement each form of government permits, 0..1. One entry until M6 gives the player a government to choose; the lookup falls back to Republic, so adding a type is the whole change - the same shape as econ.govMaintenance.',
  },
  'liberty.wAlignment': {
    v: 0.34, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'Liberties: weight of alignment at home',
    doc: 'THE HINGE. A state governing people who broadly agree with it has no reason to restrict them; a state governing a population sitting at the far end of both axes is under constant pressure to. Measured as the population-weighted affinity between each Area mix and the ruling ideology.',
  },
  'liberty.wGovernment': {
    v: 0.26, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'Liberties: weight of government type',
    doc: 'How much the form of government itself decides how free people are.',
  },
  'liberty.wProsperity': {
    v: 0.12, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'Liberties: weight of prosperity',
    doc: 'How much a comfortable population is governed more lightly.',
  },
  'liberty.wDivided': {
    v: -0.20, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'Liberties: weight of a divided people',
    doc: 'NOT a duplicate of alignment. A nation can be uniformly mildly-opposed (low alignment, high cohesion) or evenly split into two camps that agree with the government equally little (same alignment, low cohesion). The second is far harder to govern liberally, and only cohesion tells them apart.',
  },
  'liberty.wOccupation': {
    v: -0.24, min: -1, max: 1, step: 0.01, group: 'Quality of life',
    label: 'Liberties: weight of occupation',
    doc: 'Occupied ground is governed under different rules, and those rules leak home. The largest negative weight.',
  },

  /* ---- Sentiment (M4.2) ---------------------------------------------------
   * target = clamp01( base * (grievance + pull) - suppression ), where base is
   * the affinity between the Area's leading ideology and the movement's.
   *
   * BASE IS MULTIPLICATIVE: an Area that does not share the ideology cannot be
   * radicalised into that movement however badly it is governed. Misgovern a
   * Democratic Socialist city and you do not get Deseret, you get somebody else.
   * The four grievance weights are therefore a budget: they sum to what a
   * perfectly-aligned, perfectly-misgoverned Area could reach before pull.
   */
  'sent.wQol': {
    v: 0.22, min: -1, max: 1, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of poor quality of life',
    doc: 'How much a badly-served population organises against its government. The largest grievance weight: hunger and untreated illness move people who politics alone would not.',
  },
  'sent.wLiberty': {
    v: 0.20, min: -1, max: 1, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of lost liberties',
    doc: 'How much a repressive state drives people into organised opposition.',
  },
  'sent.wPower': {
    v: 0.14, min: -1, max: 1, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of a weak nation',
    doc: 'How much the weakness of the nation holding an Area invites secession. A superpower is not left; a rump state is.',
  },
  'sent.wAuthority': {
    v: 0.18, min: -1, max: 1, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of weak authority',
    doc: 'How much a state that cannot hold its own ground encourages the attempt. Distinct from raw power: a small nation can be firmly governed and a large one falling apart.',
  },
  'sent.wPull': {
    v: 0.42, min: -1, max: 2, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of neighbouring strength',
    doc: 'THE DIFFUSION TERM, which did not exist before M4.2 - a movement could only ever be where it was planted. Weighted above any single grievance because a movement spreads along a frontier: what makes a region go is that the next valley has already gone.',
  },
  'sent.pullScale': {
    v: 0.9, min: 0.05, max: 10, step: 0.05, group: 'Sentiment',
    label: 'Sentiment: neighbour pull scale',
    doc: 'The k in tanh(k * sum of neighbouring shares). tanh so one committed neighbour matters a great deal and the tenth matters little: a movement spreads along a frontier, it does not multiply by how many friends it already has.',
  },
  'sent.wSuppression': {
    v: -0.30, min: -1, max: 1, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of suppression',
    doc: 'What an occupying garrison takes off the target. Subtracted AFTER the ideological multiplier, because a garrison holds ground down whatever the population thinks of it. Until M6 gives the player a military, occupation is the only garrison the model has.',
  },
  'sent.maxRise': {
    v: 0.035, min: 0.001, max: 0.5, step: 0.001, group: 'Sentiment',
    label: 'Sentiment: maximum rise per turn',
    doc: 'The most a movement can gain in one Area in one turn. THE CHANGE IS RATE-LIMITED, NOT THE VALUE - the same discipline as the power stocks, and the specific fix for a runaway spiral. A region takes years to turn.',
  },
  'sent.maxFall': {
    v: 0.05, min: 0.001, max: 0.5, step: 0.001, group: 'Sentiment',
    label: 'Sentiment: maximum fall per turn',
    doc: 'The most a movement can lose in one Area in one turn. Larger than the rise: organising is slower than collapsing.',
  },
  'sent.wBoost': {
    v: 0.35, min: -1, max: 1, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of an authored local grievance',
    doc: 'What an Area’s own `attrs.sentBoost` is worth inside grievance. The only term in the block that is a property of the PLACE rather than of the nation holding it, and the only way the model can say "this ground has a reason of its own, older than whoever governs it". The Shattering uses it for the Mormon Corridor Areas that did not cede — hardest on the ones that voted to go and were cut off — and it had to be a term rather than a bigger opening share, because a seeded share erodes back toward the formula’s target at sent.maxFall every turn: seeding alone makes a region angriest on turn 1 and calmest by turn 10, which is the story backwards. It rides inside grievance, so it is still multiplied by base: an authored grievance cannot radicalise a place into a movement whose ideology it does not share.',
  },
  'sent.floor': {
    v: 0.004, min: 0, max: 0.2, step: 0.001, group: 'Sentiment',
    label: 'Sentiment: extinction floor',
    doc: 'Below this share a movement is gone from an Area rather than lingering at a millionth of a percent. Distinct from world.partyFloor, which cleans up after the growth phase.',
  },

  /* ---- Secession (M4.3) --------------------------------------------------- */
  'secession.countyThreshold': {
    v: 0.40, min: 0.05, max: 1, step: 0.01, group: 'Secession',
    label: 'Area secession threshold',
    doc: 'The share of an Area a movement must organise before that Area will leave. Also what "armed" means for a movement state, and what every Area in a core must clear before the movement can declare.',
  },
  'secession.risingThreshold': {
    v: 0.20, min: 0.01, max: 1, step: 0.01, group: 'Secession',
    label: 'Movement "rising" mark',
    doc: 'Peak Area share at which a movement stops being latent and starts being visible. Purely descriptive - it changes what the UI says, not what the model does - but it is the point at which a player should be able to see a problem coming.',
  },

  'secession.maxPerTurn': {
    v: 3, min: 0, max: 50, step: 1, group: 'Secession',
    label: 'Areas that may defect per turn',
    doc: 'How many Areas can change hands to a movement in one world turn, taken strongest-first. At a 0.40 threshold and caps up to 0.60, dozens of Areas sit over the line at once; letting each leave separately turns the map to confetti. Declaring is how a movement becomes a country, defecting is how that country grows.',
  },
  'secession.honeymoonTurns': {
    v: 4, min: 0, max: 40, step: 1, group: 'Secession',
    label: 'Honeymoon length, in turns',
    doc: 'How long a newly independent nation enjoys the benefit of the doubt. Without it a newborn state has no age, no tenure and no reserves, so it reads as the weakest government on the board on the day of its founding and immediately starts shedding the Areas that just fought to join it.',
  },
  'secession.honeymoonAuthority': {
    v: 0.9, min: 0, max: 1, step: 0.01, group: 'Secession',
    label: 'Honeymoon strength',
    doc: 'The normalised value of the honeymoon term in Authority while it lasts, decaying to zero as it runs out. A population that just got what it wanted grants its new government real standing, briefly.',
  },
  'secession.transitionGdpLoss': {
    v: 0.12, min: 0, max: 0.8, step: 0.01, group: 'Secession',
    label: 'Cost of independence, as a share of GDP',
    doc: 'Institutions, contracts and trade routes all break at once. Deliberately opposite in sign and shorter in duration than the honeymoon: without the cost, declaring independence is free.',
  },

  /* ---- Government change: appeasement (M4.4) ------------------------------
   * The cheapest release valve in the game, and it needs almost no machinery
   * because Civil Liberties is already a function of how far the governed sit
   * from the governing. Change the ruling ideology and the model does the rest.
   */
  'release.acceptAffinity': {
    v: 0.62, min: 0, max: 1, step: 0.01, group: 'Nations',
    label: 'Political affinity needed to accept a handover',
    doc: 'How close a neighbour must be politically before it will take Areas you are giving away. THE GUARDRAIL: without it, releasing counties is a way to dump them on a rival - hand a hostile neighbour three Areas full of a movement it cannot govern and you have exported your secession problem for free.',
  },
  'release.desperateAreas': {
    v: 3, min: 0, max: 50, step: 1, group: 'Nations',
    label: 'A nation this small takes anything',
    doc: 'A rump state accepts territory whatever its politics, because the alternative is ceasing to exist.',
  },
  'gov.changeMinShare': {
    v: 0.12, min: 0, max: 1, step: 0.01, group: 'Nations',
    label: 'Support needed to adopt an ideology',
    doc: 'A government cannot claim a mandate it has no voters for. Low enough that appeasing a rising movement is usually possible and high enough that you cannot adopt something nobody believes purely to dodge a consequence.',
  },
  'gov.changeCost': {
    v: 0.02, min: 0, max: 0.5, step: 0.005, group: 'Nations',
    label: 'Cost of changing course, as a share of GDP',
    doc: 'Scaled by how far you move on the two axes, so a small correction is cheap and a reversal is not.',
  },
  'gov.changeAuthorityHit': {
    v: 0.12, min: 0, max: 1, step: 0.01, group: 'Nations',
    label: 'Authority lost by changing course',
    doc: 'A state that changes what it believes by decree has admitted the last thing was not a conviction. Applied to the STOCK rather than the target - the target recomputes from the world next turn and would simply undo it - so the stock discipline turns the shock into a recovery over several turns.',
  },
  'gov.changeCooldown': {
    v: 8, min: 0, max: 60, step: 1, group: 'Nations',
    label: 'Turns between changes of course',
    doc: 'Measured from the last DELIBERATE change, not from gov.since. Those look like the same clock and are not: `since` is set at founding, so every nation would begin the game under a lockout for a decision nobody made, and refreshGovernments moves it whenever the population shifts a plurality, which would hand a player a free reset for something they did not do. Without a cooldown at all, a player could change hats every turn and dodge every consequence in the game.',
  },

  'ledger.cap': {
    v: 4000, min: 100, max: 100000, step: 100, group: 'Nations',
    label: 'Events the ledger keeps',
    doc: 'The ledger is append-only and IS state - a save that forgets what happened cannot show a timeline, and "why is my Authority falling" is not answerable from a snapshot of the present. The cap exists so an unattended simulator run cannot grow it without bound; a full 80-turn game sits well inside it.',
  },

  'nation.historyWindow': {
    v: 20, min: 4, max: 80, step: 1, group: 'Nations',
    label: 'Territorial memory, in turns',
    doc: 'How many turns of annexations and losses a nation remembers. Authority weights recent events over old ones, so it reads a window rather than a lifetime total - and a counter cannot be windowed after the fact, which is why the record is a list. Older entries are trimmed, because a save is a document and an 80-turn game must not carry an unbounded one.',
  },
  'econ.areaUpkeep': {
    v: 40e6, min: 0, max: 2e8, step: 1e6, group: 'Economy',
    label: 'Area upkeep ($/turn)',
    doc: 'Flat per-Area administrative upkeep per turn.',
  },
  'econ.occupationAlpha': {
    v: 1.15, min: 1, max: 2, step: 0.01, group: 'Economy',
    label: 'Occupation cost exponent',
    doc: 'Superlinear exponent on the number of occupied Areas, so conquest stops paying for itself. Anti-snowball brake #2.',
  },
  'econ.occupationHostility': {
    v: 1.6, min: 0, max: 10, step: 0.1, group: 'Economy',
    label: 'How much local hostility multiplies occupation upkeep',
    doc: 'upkeep(a) = base * (1 + this * hostility(a)) * (1 + n^alpha), where hostility is the strongest organised movement share in that Area. The COUNT term is what stops conquest paying for itself at scale; this term is what makes WHICH ground you took matter as much as how much. Sitting on a place 50% organised against you is not the same expense as sitting on one that shrugged. Before M4.2 there was no sentiment to read and the hook could not have been written.',
  },
  'econ.occupationRef': {
    v: 25, min: 1, max: 500, step: 1, group: 'Economy',
    label: 'Occupation reference size (Areas)',
    doc: 'Occupied-Area count at which the occupation surcharge equals one extra Area upkeep per occupied Area. Below it conquest is cheap; above it the cost climbs superlinearly.',
  },
  'econ.startingTreasuryTurns': {
    v: 4, min: 0, max: 40, step: 1, group: 'Economy',
    label: 'Starting treasury (turns of income)',
    doc: 'Every nation opens with this many turns of gross tax income banked. Without it the treasury is zero at turn 0 and no priced action is affordable until several world turns have passed.',
  },

  /* ---------------- market ---------------- */
  'market.base': {
    v: 100, min: 10, max: 500, step: 5, group: 'Market',
    label: 'Price index base',
    doc: 'Index value at which demand exactly equals supply.',
  },
  'market.elasticity': {
    v: 1.3, min: 0.2, max: 4, step: 0.05, group: 'Market',
    label: 'Price elasticity',
    doc: 'Exponent on demand/supply. Higher means prices swing harder.',
  },
  'market.minPrice': {
    v: 20, min: 1, max: 200, step: 1, group: 'Market',
    label: 'Price floor',
    doc: 'Lower clamp on any sector price.',
  },
  'market.maxPrice': {
    v: 400, min: 100, max: 2000, step: 10, group: 'Market',
    label: 'Price ceiling',
    doc: 'Upper clamp on any sector price.',
  },
  'market.demandShare': {
    v: [0.10, 0.125, 0.275, 0.1875, 0.1875, 0.125], kind: 'array', group: 'Market',
    label: 'Demand share by sector',
    doc: 'Ag, Extraction, Manufacturing, Trade, Finance, IT. MUST sum to 1.0: the index is demand share over supply share, so a sum of 0.80 (which is what it was) made every price a factor of 0.80^elasticity too low and the UI "100 = balanced" label wrong by construction - balanced was 75. Normalised from the authored 0.80 mix, so the relative structure is unchanged. Lives here, not in the renderer, which is where it used to be (app.js:630) and read by market.js purely on script order.',
  },

  /* ---------------- trade ---------------- */
  'trade.gain': {
    v: 0.10, min: 0, max: 0.5, step: 0.005, group: 'Trade',
    label: 'Trade gain',
    doc: 'Each side\'s benefit as a share of traded value.',
  },
  'trade.worldMarketPenalty': {
    v: 0.45, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'World market penalty',
    doc: 'Fraction of the bilateral rate an untargeted world-market sale earns, so bilateral deals stay competitive (M1.9).',
  },
  'trade.cooldownTurns': {
    v: 3, min: 0, max: 20, step: 1, group: 'Trade',
    label: 'Partner cooldown (turns)',
    doc: 'Turns before the same partner can be traded with again.',
  },
  'trade.capacityPerPort': {
    v: 9000, min: 0, max: 100000, step: 500, group: 'Trade',
    label: 'Capacity per port ($M)',
    doc: 'Tradeable volume unlocked by each port Area.',
  },
  'trade.capacityPerRailHub': {
    v: 4500, min: 0, max: 100000, step: 500, group: 'Trade',
    label: 'Capacity per rail hub ($M)',
    doc: 'Tradeable volume unlocked by each rail-hub Area.',
  },
  'trade.capacityPerGateway': {
    v: 6000, min: 0, max: 100000, step: 500, group: 'Trade',
    label: 'Capacity per land gateway ($M)',
    doc: 'Tradeable volume unlocked by each Canada/Mexico border gateway.',
  },
  'trade.capacityBase': {
    v: 1200, min: 0, max: 50000, step: 100, group: 'Trade',
    label: 'Base overland capacity ($M)',
    doc: 'Volume a nation can move with no port, hub or gateway at all.',
  },
  'trade.transitToll': {
    v: 0.35, min: 0, max: 0.9, step: 0.01, group: 'Trade',
    label: 'Transit toll',
    doc: 'A transit nation\'s baseline cut of the trade benefit.',
  },
  'trade.railDiscount': {
    v: 0.5, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Rail corridor discount',
    doc: 'Fraction the toll is reduced by when a rail corridor links the pair.',
  },
  'trade.highwayDiscount': {
    v: 0.2, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Highway corridor discount',
    doc: 'Fraction the toll is reduced by when an interstate links the pair.',
  },
  'trade.needScale': {
    v: 40, min: 0, max: 500, step: 5, group: 'Trade',
    label: 'Transit need scale',
    doc: 'Scales toll income against the transit nation\'s GDP into a 0..1 "need".',
  },
  'trade.counterFloor': {
    v: 0.55, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Counter-offer floor',
    doc: 'Offers below this fraction of the transit nation\'s ask are declined outright.',
  },
  'trade.alignmentScale': {
    v: 60, min: 5, max: 400, step: 5, group: 'Trade',
    label: 'Political alignment scale',
    doc: 'Total absolute difference across every party share (0..200) at which two nations read as completely unaligned. The old term compared ONLY the Democratic share, so gop, Other and every emergent movement were invisible and a 30%-separatist nation read as warm toward any mainstream nation that happened to sit at 30% Democratic.',
  },
  'trade.openingOfferFactor': {
    v: 0.6, min: 0.1, max: 1.5, step: 0.05, group: 'Trade',
    label: 'Transit: opening offer',
    doc: 'The toll slider opens at this fraction of the corridor rate. It opened AT the corridor rate, which the transit nation accepted outright in 190 of 214 adjacent pairs - the player pressed Propose, got a yes, and the negotiation contributed nothing. A lowball default makes the slider a decision.',
  },

  /* ---------------- deals (A1) ---------------- */
  'deal.rate': {
    v: 0.25, min: 0, max: 2, step: 0.05, group: 'Trade',
    label: 'Deal rate (share of a click, per turn)',
    doc: 'What one turn of a standing deal pays, as a share of what the old one-click trade paid outright. At 0.25 with a 4-turn deal, a year of a deal pays exactly what a year of clicking paid - which is the ruling (D171): a deal is about commitment, not sudden wealth, so nothing already tuned against the old rhythm (army upkeep, the price of annexing, recovery rates) has to be re-derived. At 1.0 a deal pays every turn what a click paid once every four, so trade income per partner is roughly four times what it was. This is the slider that turns trade up, deliberately, after the alpha has shown what it does.',
  },
  'deal.durations': {
    v: [2, 4, 8, 20], kind: 'array', group: 'Trade',
    label: 'Deal durations (turns)',
    doc: 'The menu of terms a deal may be signed for, in world turns. A turn is a quarter (D163), so these read as six months, one year, two years and five years. A duration outside this list is refused by the planner rather than rounded, because the four buttons are the negotiation.',
  },
  'deal.defaultDuration': {
    v: 4, min: 1, max: 40, step: 1, group: 'Trade',
    label: 'Default deal duration (turns)',
    doc: 'The term a trade carries when no terms were named - what the AI signs in A1, and where the duration row opens. Must be a member of deal.durations; the panel snaps to the nearest member if it is not. At 4 with deal.rate 0.25, an AI signing a default deal earns exactly what its old click earned, spread over exactly the four turns it used to spend on cooldown.',
  },
  'deal.defaultAutoRenew': {
    v: 0, min: 0, max: 1, step: 1, group: 'Trade',
    label: 'Auto-renew starts ticked',
    doc: '1 if a new deal opens with auto-renew on, 0 if off. Off by default because a deal that renews itself silently is a deal the player stops noticing, and the expiry prompt is the moment the whole stage exists to create.',
  },
  'deal.countdownAt': {
    v: [4, 2, 1], kind: 'array', group: 'Trade',
    label: 'Expiry warnings at (turns left)',
    doc: 'Turns-left values at which the player is told a deal is running out. Only deals the player is party to generate these: fifty nations\' countdowns are a newspaper nobody reads, and every other deal shows its own countdown on the deal ledger. A deal shorter than the largest value here simply skips the warnings it never reaches.',
  },
  'deal.offerTurns': {
    v: 2, min: 1, max: 20, step: 1, group: 'Trade',
    label: 'An open offer stands for (turns)',
    doc: 'How long an offer waits for an answer before it lapses. Applies to the renegotiation prompt raised when a deal expires, and to the offers AI nations start sending in A4.',
  },
  'deal.maxOpenOffers': {
    v: 3, min: 1, max: 10, step: 1, group: 'Trade',
    label: 'Incoming offers at once',
    doc: 'The most unanswered offers one nation may be holding. Enforced from A1 so the cap is load-bearing before A4 turns fifty nations loose on it - an inbox is a decision, and an inbox of twenty is admin.',
  },
  'deal.priceMultMin': {
    v: 0.8, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Price split: lowest',
    doc: 'The least favourable split a seller may be pushed to in a counter-offer. The multiplier moves the joint gain between the two parties - seller takes value x mult, buyer value x (2 - mult) - so the SUM never changes and 1.0 is exactly the old even split. A true buyer-pays-seller price waits for goods to physically move; until then this is the only honest meaning a haggle over price can have.',
  },
  'deal.priceMultMax': {
    v: 1.2, min: 1, max: 2, step: 0.05, group: 'Trade',
    label: 'Price split: highest',
    doc: 'The most favourable split a seller may win in a counter-offer. See deal.priceMultMin: the two are symmetric about 1.0, which is the even split the one-click trade always paid.',
  },

  'deal.termAppetiteShare': {
    v: 0.06, min: 0.005, max: 0.5, step: 0.005, group: 'Trade',
    label: 'Term appetite: what counts as valuable',
    doc: 'The share of one turn of national income at which a deal reads as worth locking in for the longest term available. Below it the counterparty wants a shorter commitment, and counters. This is the term the player can actually influence, by trading with somebody who needs what they have rather than with whoever is nearest.',
  },
  'deal.termTrustWeight': {
    v: 0.35, min: 0, max: 1, step: 0.05, group: 'Trade',
    label: 'Term appetite: weight on standing',
    doc: 'How much of the appetite for a long term comes from how the counterparty feels about you rather than from what the deal is worth. Read only when politics is switched on: in Economy mode the term is absent rather than zero, because a system that has been switched off must not quietly charge the player for itself (D166).',
  },
  'deal.termTolerance': {
    v: 1, min: 0, max: 3, step: 1, group: 'Trade',
    label: 'Term tolerance (steps)',
    doc: 'How far from its preferred term the counterparty will sign without countering, counted in steps along deal.durations. At 1 a nation that wants a year will still sign six months or two years; at 0 every proposal that is not exactly right is countered, which is a negotiation nobody enjoys.',
  },

  /* ---------------- transit (A2) ---------------- */
  'transit.foreignCorridorToll': {
    v: 0.10, min: 0, max: 0.5, step: 0.01, group: 'Trade',
    label: 'Canada / Mexico corridor cost',
    doc: 'What a trade loses for being routed through Canada or Mexico. The owner\'s ruling, and it is a COST rather than a transfer: nobody receives it, the trade is simply worth this much less for having gone that way. Canada and Mexico are not actors in this game - they cannot be conquered, they have no opinion, and there is no agreement to negotiate or revoke - so this number is the entire relationship.',
  },
  'transit.hopFriction': {
    v: 0.12, min: 0, max: 0.5, step: 0.01, group: 'Trade',
    label: 'Cost of each crossing',
    doc: 'What a shipment loses at every border it crosses, on top of whatever the country there charges. Nobody collects it - it is handling, transhipment and delay. It exists because compounding tolls ALONE do not price out a long chain: five crossings at the lowest rate anyone would sign still deliver 77% of the money, so without a cost that distance carries by itself, a five-hop resale chain stays profitable and the roadmap\'s own success metric fails.',
  },
  'transit.maxHops': {
    v: 3, min: 1, max: 6, step: 1, group: 'Trade',
    label: 'Most countries in between',
    doc: 'The longest route the search will consider, counted in countries the goods pass through. Three is already exotic; the cap exists so the search cost stays bounded on a board where every border can move every turn. Note that the arithmetic makes long routes unprofitable on its own - the cap is a performance bound, not the thing that stops resale chains.',
  },
  'transit.maxCorridors': {
    v: 1, min: 0, max: 3, step: 1, group: 'Trade',
    label: 'Most foreign corridors in one route',
    doc: 'How many times one route may duck through Canada or Mexico. At 1 a route may leave and re-enter once, which is the Idaho-to-Minnesota case the owner described; higher values let a route weave along the northern border collecting a flat charge each time, which is arithmetic rather than geography.',
  },
  'transit.rateMin': {
    v: 0.05, min: 0, max: 0.5, step: 0.01, group: 'Trade',
    label: 'Lowest toll anyone will sign',
    doc: 'The floor on what a country will charge to carry somebody else\'s goods. Lifted out of the old one-off transit negotiation, where it was a literal in the middle of an expression, so it can be tuned and so the five-hop arithmetic can be checked against it.',
  },
  'transit.rateMax': {
    v: 0.60, min: 0.1, max: 1, step: 0.05, group: 'Trade',
    label: 'Highest toll anyone will sign',
    doc: 'The ceiling on a transit toll. Above this a corridor is worth more closed than open and the negotiation stops meaning anything. Lifted out of the old one-off transit negotiation with the floor.',
  },
  'transit.noticeTurns': {
    v: 4, min: 0, max: 20, step: 1, group: 'Trade',
    label: 'Notice before a route closes (turns)',
    doc: 'How long a corridor keeps carrying after its holder gives notice. Four turns is a year, and it deliberately matches the largest expiry warning a trade deal gives, so a player learns one rhythm for "something you rely on is ending" rather than two.',
  },
  'transit.renegeWeight': {
    v: 2, min: 0, max: 10, step: 0.5, group: 'Trade',
    label: 'What closing a route costs your standing',
    doc: 'How heavily a closed corridor counts against the corridors you hold when the world judges your reliability. Above 1 because signing is cheap: if a revocation cost no more than an agreement earned, a country could out-sign its own reputation by granting corridors it intended to close.',
  },

  /* ---------------- civil war ---------------- */
  'war.triggerSizeRatio': {
    v: 0.15, min: 0.01, max: 3, step: 0.01, group: 'Civil war',
    label: 'War trigger: size ratio',
    doc: 'An annexation this large relative to the annexer triggers a civil war. The old rule needed the bite to exceed the whole nation, which an absolute per-turn budget makes unreachable for anyone large.',
  },
  'war.splinterAffinity': {
    v: 0.72, min: 0, max: 1, step: 0.01, group: 'Civil war',
    label: 'Political affinity threshold',
    doc: 'How close two positions on the two axes must be to count as politically compatible: an Area below this affinity with its own nation secedes in a failed union, and an ideology above it with the leader is shown as part of the leading coalition. THIS ONE NUMBER replaces `x.lean === y.lean` - the binary enum that four separate game decisions across eight files answered with ===.',
  },
  'war.sizeRatioPopWeight': {
    v: 0.6, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'War points: population weight',
    doc: 'Weight on the annexed/annexer POPULATION ratio; the remainder weights the GDP ratio. Points are a ratio, not an absolute, because that is the quantity the trigger already cares about - and because absolute rounded points made the median Area worth 0.',
  },
  'war.pointsCurve': {
    v: 0.5, min: 0.1, max: 1, step: 0.05, group: 'Civil war',
    label: 'War points: size curve',
    doc: 'Exponent on the size ratio. 1.0 is linear, which makes every large annexation a certain fall-apart; 0.5 (square root) keeps doubling your size a bad gamble rather than a mathematical certainty.',
  },
  'war.pointsScale': {
    v: 12, min: 0.1, max: 100, step: 0.5, group: 'Civil war',
    label: 'War points: scale',
    doc: 'Multiplier turning sqrt(size ratio) x dice sum into the score band. Tuned so a 5%-of-your-size annexation is a safe victory, 20% is mostly partial, 50% spans all three outcomes and 100% is mostly fall-apart.',
  },
  'war.partialMinKeep': {
    v: 0.15, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'Partial victory: minimum kept',
    doc: 'Smallest fraction of the contested Areas a partial victory holds, at the top of the partial band. The old rule kept only same-lean Areas, which for a FLIP-triggered war is empty by construction.',
  },
  'war.maxDice': {
    v: 6, min: 1, max: 20, step: 1, group: 'Civil war',
    label: 'Dice cap',
    doc: 'Hard cap on the dice count. Uncapped + multiplied is what made every flip war a guaranteed fall-apart.',
  },
  'war.diceSides': {
    v: 6, min: 2, max: 20, step: 1, group: 'Civil war',
    label: 'Die sides',
    doc: 'Sides on each war die.',
  },
  'war.dicePerFlipPoint': {
    v: 0.5, min: 0, max: 3, step: 0.05, group: 'Civil war',
    label: 'Dice per point of plurality flip',
    doc: 'Dice granted per point of flip magnitude: the lead gap between the new and the old leading ideology, scaled by how far apart those two sit on the axes.',
  },
  'war.diceFlipFloor': {
    v: 2, min: 1, max: 6, step: 1, group: 'Civil war',
    label: 'Minimum dice on a flip',
    doc: 'Any change of governing plurality costs at least this many dice. Losing the plurality is a constitutional crisis whatever replaces it, and without a floor a flip between two ADJACENT ideologies (Democrat to Republican, the commonest of all) became a guaranteed walkover once magnitude was scaled by distance: measured 400 victories out of 400.',
  },
  'war.victoryBand': {
    v: 33, min: 0, max: 200, step: 1, group: 'Civil war',
    label: 'Victory band ceiling',
    doc: 'Scores at or below this are a complete victory.',
  },
  'war.partialBand': {
    v: 66, min: 0, max: 400, step: 1, group: 'Civil war',
    label: 'Partial band ceiling',
    doc: 'Scores at or below this are a partial victory; above it the union falls apart.',
  },
  'war.popLossBase': {
    v: 0.02, min: 0, max: 0.5, step: 0.005, group: 'Civil war',
    label: 'Population loss floor',
    doc: 'Minimum share of the ruling bloc lost by the loser.',
  },
  'war.popLossPerScore': {
    v: 1 / 2500, min: 0, max: 0.01, step: 0.00002, group: 'Civil war',
    label: 'Population loss per score point',
    doc: 'Additional ruling-bloc loss per point of war score.',
  },
  'war.popLossMax': {
    v: 0.4, min: 0, max: 1, step: 0.01, group: 'Civil war',
    label: 'Population loss cap',
    doc: 'Upper clamp on the loser\'s ruling-bloc population loss.',
  },
  'war.gdpLossBase': {
    v: 0.02, min: 0, max: 0.5, step: 0.005, group: 'Civil war',
    label: 'GDP transfer floor',
    doc: 'Minimum share of the loser\'s GDP transferred to the winner.',
  },
  'war.gdpLossPerScore': {
    v: 1 / 5000, min: 0, max: 0.01, step: 0.00002, group: 'Civil war',
    label: 'GDP transfer per score point',
    doc: 'Additional GDP transfer per point of war score.',
  },
  'war.gdpLossMax': {
    v: 0.2, min: 0, max: 1, step: 0.01, group: 'Civil war',
    label: 'GDP transfer cap',
    doc: 'Upper clamp on the GDP share transferred.',
  },
  'war.unitePopWeight': {
    v: 0.6, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'Union size score: population weight',
    doc: 'Weight on the proposer\'s population share; the remainder weights its GDP share.',
  },
  'war.uniteSizeFloor': {
    v: 0.6, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'Union: size score floor',
    doc: 'Share of the peace chance that comes from size alone, before political similarity is applied.',
  },
  'war.uniteShellPenalty': {
    v: 0.5, min: 0, max: 1, step: 0.05, group: 'Civil war',
    label: 'Union: leader penalty',
    doc: 'How much a full blue-shell severity cuts the peace chance.',
  },
  'war.uniteSeverityScale': {
    v: 200, min: 10, max: 1000, step: 10, group: 'Civil war',
    label: 'Failed-union severity scale',
    doc: 'Turns (1 - peace chance) into a war score for the fallout calculation.',
  },
  'war.unitePeaceMin': {
    v: 0.03, min: 0, max: 0.5, step: 0.01, group: 'Civil war',
    label: 'Union peace floor',
    doc: 'Lowest possible chance a proposed union is peaceful.',
  },
  'war.unitePeaceMax': {
    v: 0.97, min: 0.5, max: 1, step: 0.01, group: 'Civil war',
    label: 'Union peace ceiling',
    doc: 'Highest possible chance a proposed union is peaceful.',
  },

  /* ---------------- nations & annexation ---------------- */
  'nation.minAreas': {
    v: 5, min: 1, max: 50, step: 1, group: 'Nations',
    label: 'Minimum Areas for a new nation',
    doc: 'A contiguous breakaway chunk needs this many Areas to become its own nation. Re-derived at Area scale — 10 was written for counties (M4.3) — and raised from 3 in M6.3, where it turned out to be the number quietly deciding whether the map is a world or confetti: at 3, below release.budgetAreas, EVERY release manufactured a country, and 75 of the 88 nations a fifty-turn game produced were released fragments rather than anything anyone had fought for. Bounded above by the authored movements: cores run from 2 to 5 Areas, so a floor of 7 leaves El Paso United, Alaskan Independence and the Rio Grande Union unable ever to reach the goal they were written to want.',
  },
  'nation.minPop': {
    v: 250000, min: 0, max: 5e6, step: 10000, group: 'Nations',
    label: 'Minimum population for a new nation',
    doc: 'A breakaway chunk stands alone on Areas OR on population, whichever it clears first. Area count is a poor proxy for viability once Areas range from one county to eight: two Areas holding four million people between them is a country, and five holding thirty thousand is not.',
  },
  'annex.budgetAreas': {
    v: 3, min: 1, max: 50, step: 1, group: 'Annexation',
    label: 'Annex budget (Areas / turn)',
    doc: 'ABSOLUTE per-turn cap. The old cap was a multiple of your own size, which is what let Wyoming take 1,167 Areas in 9 turns (M1.4).',
  },
  'annex.costPerArea': {
    v: 250e6, min: 0, max: 1e10, step: 50e6, group: 'Annexation',
    label: 'Annex cost per Area ($)',
    doc: 'Treasury debited per Area taken. Game.spend finally has a call site.',
  },
  'annex.costPopScale': {
    v: 400, min: 0, max: 20000, step: 50, group: 'Annexation',
    label: 'Annex cost per head ($)',
    doc: 'Additional treasury cost scaled by the population being taken, so a metro Area costs more to swallow than an empty one.',
  },
  'annex.strongNeighbourFactor': {
    v: 4, min: 1, max: 20, step: 0.5, group: 'Annexation',
    label: 'Untouchable-neighbour factor',
    doc: 'A neighbour this many times your size on BOTH population and GDP cannot be attacked. Replaces the old rule, which blocked only SAME-LEAN larger nations and therefore left every ideological opposite wide open however large it was.',
  },
  'annex.shellCostMult': {
    v: 1.0, min: 0, max: 3, step: 0.05, group: 'Annexation',
    label: 'Leader surcharge',
    doc: 'Extra annex cost multiplier applied in proportion to blue-shell severity.',
  },
  'annex.cooldownTurns': {
    v: 4, min: 0, max: 20, step: 1, group: 'Annexation',
    label: 'Annex cooldown (turns)',
    doc: 'Turns a nation must wait between annexations.',
  },


  /* ---------------- release ---------------- */
  'release.budgetAreas': {
    v: 6, min: 1, max: 50, step: 1, group: 'Release',
    label: 'Release budget (Areas / turn)',
    doc: 'Areas a nation can hand over in one turn. Higher than the annex budget on purpose: giving territory away is easier than taking it, and this is the release valve an over-extended nation reaches for when occupation cost outruns income.',
  },
  'release.costGdpShare': {
    v: 0.10, min: 0, max: 1, step: 0.01, group: 'Release',
    label: 'Cost of a handover, as a share of the released ground\u2019s GDP',
    doc: 'The settlement: assets written off, guarantees, pensions, a border to draw. Release cost NOTHING until M6.3, which made it a machine for converting territory into stability \u2014 and the M6.3 AI found it immediately. Measured over sixty turns at two seeds: with the AI never releasing, 51 nations become 54; at a weight of 0.3, 76; at 0.9, 135. A move that buys safety for free is dominant at any weight, so the answer is a price rather than a smaller appetite.',
  },
  'release.cooldownTurns': {
    v: 8, min: 0, max: 20, step: 1, group: 'Release',
    label: 'Release cooldown (turns)',
    doc: 'World turns between handovers, so a nation cannot dissolve itself one Area at a time inside a single round.',
  },
  /* ---------------- the AI's opinion ---------------- */
  /*
   * These are WEIGHTS ON A PREVIEW, not a second model of the world. The AI
   * scores exactly the object the player's panel renders, so a move that looks
   * good to it looks good for reasons the player can read on their own screen.
   * Everything is a share of the acting nation, which is what lets one set of
   * weights serve a two-Area rump and a sixty-Area giant.
   */
  'ai.wGrowth': {
    v: 1.00, min: -2, max: 3, step: 0.05, group: 'AI',
    label: 'AI: weight of population gained',
    doc: 'How much a nation wants people, as a share of the population it would end up with. The main engine of expansion; set it to 0 and the map stops moving by anyone\u2019s choice.',
  },
  'ai.wWealth': {
    v: 0.70, min: -2, max: 3, step: 0.05, group: 'AI',
    label: 'AI: weight of GDP gained',
    doc: 'How much a nation wants money, as a share of the GDP it would end up with. Lower than population because people vote, pay tax and hold ground, and money only does the second.',
  },
  'ai.wPrice': {
    v: 0.80, min: 0, max: 3, step: 0.05, group: 'AI',
    label: 'AI: aversion to the price',
    doc: 'How much of the treasury a move costs, as a fraction. Distinct from solvency: this is the reluctance to spend, that is the refusal to go broke.',
  },
  'ai.wSolvency': {
    v: 1.20, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: refusal to run out of money',
    doc: 'Penalty for a move that leaves fewer than ai.runwayTurns of upkeep in the treasury. Heavy, because a bankrupt nation cannot act at all and the game gives it no way back.',
  },
  'ai.runwayTurns': {
    v: 6, min: 0, max: 40, step: 1, group: 'AI',
    label: 'AI: turns of upkeep to keep in hand',
    doc: 'How many world turns of maintenance a nation wants left after paying for a move.',
  },
  'ai.wWar': {
    v: 1.10, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: aversion to civil war',
    doc: 'Penalty for an annexation that would trigger one, graded by how far the annexation moves the nation politically \u2014 a flip between neighbouring ideologies is a smaller shock than one across the board.',
  },
  'ai.wFit': {
    v: 0.45, min: -2, max: 2, step: 0.05, group: 'AI',
    label: 'AI: weight of political fit',
    doc: 'How much a nation cares whether the people it is taking resemble the people it has. Signed: taking a hostile population is a cost, not merely a smaller benefit.',
  },
  'ai.wOccupy': {
    v: 0.60, min: 0, max: 3, step: 0.05, group: 'AI',
    label: 'AI: aversion to holding foreign ground',
    doc: 'Penalty for the share of the resulting nation that would sit outside its home soil. Occupied ground costs Authority and breeds the sentiment that takes it away again.',
  },
  'ai.wFallout': {
    v: 1.30, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: aversion to a failed union',
    doc: 'Penalty for the share of your own Areas that would defect or secede if the union fails. Higher than the aversion to civil war: a failed union costs you ground you already held.',
  },
  'ai.wRelief': {
    v: 0.60, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: weight of shedding a seditious Area',
    doc: 'How much releasing the ground most likely to leave anyway is worth. The valve: without it a fraying nation has no move but to keep expanding, which is exactly the wrong one.',
  },
  'ai.wMandate': {
    v: 0.80, min: 0, max: 3, step: 0.05, group: 'AI',
    label: 'AI: weight of governing with the majority',
    doc: 'How much a government values ruling in the name of the largest bloc it has, measured as the support it would gain over the support it holds.',
  },
  'ai.wUpheaval': {
    v: 0.70, min: 0, max: 3, step: 0.05, group: 'AI',
    label: 'AI: aversion to changing course',
    doc: 'Penalty for the ideological distance a change of government covers. Keeps a nation from lurching across the board for a point of support.',
  },
  'ai.strainPosture': {
    v: 0.65, min: 0, max: 2, step: 0.05, group: 'AI',
    label: 'AI: how far strain changes posture',
    doc: 'A nation close to losing an Area to secession discounts every gain and inflates every risk by this much. One number, two multipliers, and the whole difference between a secure nation that expands and a fraying one that consolidates \u2014 no stored personality, so the posture follows the situation and can change back.',
  },
  'ai.actThreshold': {
    v: 0.10, min: -1, max: 2, step: 0.01, group: 'AI',
    label: 'AI: score below which a nation passes',
    doc: 'The bar a move must clear to be worth doing at all. Above zero on purpose: a nation that acts every single turn because something scored 0.001 is both unrealistic and exhausting to play against.',
  },
  /*
   * TRADE (M11.1). Two weights, because a deal buys two different things and a
   * nation that valued only the money would trade with whoever happened to have
   * the biggest mismatched surplus and never with the neighbour it needs to
   * stop being afraid of.
   */
  'ai.wTrade': {
    v: 0.9, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: weight of what a trade deal pays',
    doc: 'The treasury income from a bilateral deal, as a share of a turn of gross income. Deliberately below wGrowth: a deal is small, safe and repeatable, and a nation that rated it against an annexation on money alone would never take ground again.',
  },
  'ai.wAmity': {
    v: 1.1, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: weight of what a trade deal buys in standing',
    doc: 'What trading is FOR, beyond the money. It is the one relations channel ordinary play generates that does not involve taking something from somebody, and it is worth most to a nation the partner currently mistrusts \u2014 so the term scales with how far the relationship has to travel, not with how good it already is. Above wTrade on purpose: the diplomacy is the point.',
  },
  'ai.wPact': {
    v: 0.8, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: weight of signing a pact',
    doc: 'What a treaty is worth to the nation signing it. Scaled by how exposed the signer is to the other side \u2014 a pact with the neighbour that could take your capital is worth a great deal and one with a rump across the continent is worth nothing.',
  },
  'ai.wPatronage': {
    v: 0.7, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: weight of buying a client',
    doc: 'What aid is worth beyond the money it costs, scaled by how much of the recipient\u2019s politics the payment actually buys. A nation pursuing Ideological Dominance rates this far above a nation pursuing anything else, because it is the only lever on the sway term that is not "wait".',
  },
  'ai.wDeny': {
    v: 1.3, min: 0, max: 5, step: 0.05, group: 'AI',
    label: 'AI: weight of denying the leader',
    doc: 'How much a nation cares that somebody else is about to win. Scored on the move\u2019s effect on the LEADER\u2019s binding requirement rather than on its own progress \u2014 taking ground off the nation closing on Reunification is worth doing even when it advances nothing of yours. Without it the AI plays solitaire beside a human reading the victory table.',
  },
  'ai.denyBar': {
    v: 0.6, min: 0, max: 1, step: 0.05, group: 'AI',
    label: 'Progress at which a nation is worth denying',
    doc: 'A rival past this much of any victory condition becomes a target. Set below win.warnAt so the AI starts pushing back before the newspaper starts shouting \u2014 an opponent that only reacts once the alarm fires reacts too late to matter.',
  },
  'coalition.wVictory': {
    v: 0.55, min: 0, max: 2, step: 0.05, group: 'Coalitions',
    label: 'Threat from being close to winning',
    doc: 'Coalition threat was size x (1 - influence), and BOTH non-conquest victories keep influence high by construction \u2014 so no coalition ever formed against a nation quietly winning Ideological Dominance or Economic Supremacy, and the anti-snowball machinery only ever pointed at conquerors. This term reads victory proximity directly: a nation over ai.denyBar is threatening whatever the world thinks of it.',
  },
  'ai.wVictory': {
    v: 1.30, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: weight of closing on a victory condition',
    doc: 'How much a nation wants the ONE requirement currently holding back the victory it is nearest. The heaviest single weight, deliberately: without it the AI does not know the conditions exist and the human wins by default the moment they read the table, which is not an opponent but a scoreboard with nobody else on it. It only scores requirements a territorial move can actually shift \u2014 nothing an annexation does moves Influence, which is exactly the shape of the capstone and the reason a conqueror stalls.',
  },
  'ai.wStanding': {
    v: 0.40, min: -2, max: 2, step: 0.05, group: 'AI',
    label: 'AI: weight of how the target already sees it',
    doc: 'SIGNED, and the sign is the interesting part: a nation that already resents you is cheaper to move against, because you have nothing left to lose with them. Turning it negative gives you an AI that prefers to attack its friends, which is a coherent and horrible opponent.',
  },
  'ai.temperature': {
    v: 0.22, min: 0, max: 2, step: 0.01, group: 'AI',
    label: 'AI: decision temperature',
    doc: 'Softmax spread over the moves that clear the bar. 0 always takes the best-scoring move, which makes fifty similar nations behave identically and makes the AI solvable. Higher is more surprising and worse at the game.',
  },
  'secession.coreShare': {
    v: 1.0, min: 0.1, max: 1, step: 0.05, group: 'Secession',
    label: 'Share of its core a movement must hold to declare',
    doc: 'A movement declares when it holds its HEARTLAND, not when it holds every last piece of it. This was 1.0 by construction \u2014 an AND across the whole core \u2014 which nothing in the game could disturb while the world engine was the only thing moving, and which the M6.3 AI defeated completely: one annexed core Area held every movement below the line, and forty turns produced zero declarations where the same seed without an AI produced two.',
  },
  'unite.costGdpShare': {
    v: 0.08, min: 0, max: 0.5, step: 0.005, group: 'Unite',
    label: 'Cost of a union, as a share of the target\u2019s GDP',
    doc: 'What it takes to buy out a government: pensions, guarantees, a settlement its ministers will sign. Unite was the only action in the game that cost NOTHING, which made it strictly better than annexing \u2014 free, no treasury constraint, and it takes a whole nation rather than three Areas. The M6.3 AI played it exactly that way: 81 unions in 25 turns, and 51 nations became 18.',
  },
  'unite.cooldownTurns': {
    v: 8, min: 0, max: 40, step: 1, group: 'Unite',
    label: 'Union cooldown (turns)',
    doc: 'World turns after an attempted union before a nation may propose another. Unite was the ONE action in the game with no clock on it \u2014 annex, release and changing course all have one \u2014 so a nation could re-roll the same union every turn until it landed, which makes any probability under 100% equal to 100% given enough turns. Found by the M6.3 AI on its first run: 35 of 53 nations opened by proposing a union.',
  },
  /* ---------------- leaders ---------------- */
  'leader.affinityWeight': {
    v: 3, min: 1, max: 20, step: 0.5, group: 'Leaders',
    label: 'How much a trait that fits the government is favoured',
    doc: 'A Distributist state is likelier to be led by a Steward than by a Financier. At 3 a fitting trait is three times as likely as any other, so a nation usually gets a leader who suits it and occasionally does not \u2014 a more interesting distribution than either always-on-brand or a coin flip. Set it to 1 for pure chance.',
  },
  'leader.termTurns': {
    v: 24, min: 0, max: 200, step: 1, group: 'Leaders',
    label: 'Turns a leader holds office before being replaced',
    doc: 'A placeholder for elections (M7.8), and deliberately a plain one: the interesting version is a nation LOSING a government it wanted to keep, and that needs a vote rather than a timer. 0 means leaders serve for life.',
  },
  'power.authority.wLeader': {
    v: 0.06, min: -0.5, max: 0.5, step: 0.01, group: 'Leaders',
    label: 'Authority: weight of who is in charge',
    doc: 'Small on purpose. A leader should be a thumb on the scale, not the scale \u2014 the point of the trait system is personality and legibility, and a leader who swings a stock by a third makes every other term in it noise.',
  },
  'power.influence.wLeader': {
    v: 0.06, min: -0.5, max: 0.5, step: 0.01, group: 'Leaders',
    label: 'Influence: weight of who is in charge',
    doc: 'The stock a Conciliator or an Orator is for.',
  },
  'qol.wLeader': {
    v: 0.05, min: -0.5, max: 0.5, step: 0.01, group: 'Leaders',
    label: 'QoL: weight of who is in charge',
    doc: 'The stock a Technocrat or a Steward is for.',
  },
  'liberty.wLeader': {
    v: 0.06, min: -0.5, max: 0.5, step: 0.01, group: 'Leaders',
    label: 'Civil liberties: weight of who is in charge',
    doc: 'The stock a Hardliner or a Reformer is for, and the one where a leader is most visible from inside the country.',
  },
  'power.weariness.wLeader': {
    v: 0.05, min: -0.5, max: 0.5, step: 0.01, group: 'Leaders',
    label: 'War weariness: weight of who is in charge',
    doc: 'A Hawk spends the country; a Veteran spares it.',
  },
  'leader.warSwing': {
    v: 0.12, min: 0, max: 1, step: 0.01, group: 'Leaders',
    label: 'How far a leader moves a war',
    doc: 'Applied to the civil-war score multiplier, where low is a win for the attacker. Smaller than the force ratio and the coalition, because who is in charge should matter less than whether the army is ready and whether the neighbours have lined up.',
  },
  /* ---------------- crises ---------------- */
  'events.maxPerTurn': {
    v: 3, min: 0, max: 20, step: 1, group: 'Events',
    label: 'Crises the world may produce in one turn',
    doc: 'Across the whole roster. Three is enough that the newspaper has something in it most turns and few enough that a crisis is still an event rather than the weather.',
  },
  'events.cooldownTurns': {
    v: 8, min: 0, max: 60, step: 1, group: 'Events',
    label: 'Turns before the same nation faces another crisis',
    doc: 'A country that has a crisis every turn is not having crises.',
  },
  'events.repeatTurns': {
    v: 30, min: 0, max: 200, step: 1, group: 'Events',
    label: 'Turns before the SAME crisis can recur',
    doc: 'Longer than the general cooldown, so a nation cycles through its problems rather than reliving one.',
  },
  'events.memoryTurns': {
    v: 4, min: 0, max: 40, step: 1, group: 'Events',
    label: 'How recently something must have happened to trigger a crisis about it',
    doc: 'For triggers that read the ledger rather than a stock \u2014 a neighbour ceasing to exist is news for a few turns and history after that.',
  },
  'events.comfortableRunway': {
    v: 12, min: 1, max: 100, step: 1, group: 'Events',
    label: 'Turns of upkeep at which a nation stops wanting money',
    doc: 'Used only when an AI weighs a crisis option: a nation with a year of reserves values cash at nothing, one with two turns of it values cash above everything.',
  },
  /* ---------------- war weariness ---------------- */
  /*
   * ITS OWN RATE LIMITS, AND THE ASYMMETRY IS THE OTHER WAY UP (M9.8).
   *
   * The other four stocks are things a nation HAS, so `power.maxFall` (0.08) is
   * deliberately larger than `power.maxRise` (0.05): standing is easier to lose
   * than to build. Weariness is a thing a nation SUFFERS, and inheriting those
   * limits silently inverted it — a country could exhaust itself only slowly and
   * then shrug the exhaustion off half again as fast, which is the opposite of
   * what the stock is for. The bill is supposed to arrive while you are still
   * fighting and to still be there afterwards.
   */
  'power.weariness.maxRise': {
    v: 0.08, min: 0.005, max: 0.5, step: 0.005, group: 'Power',
    label: 'War weariness: maximum rise per turn',
    doc: 'The most weariness can gain in one turn. Larger than its fall, and that is the inversion of the other four stocks: a war tires a country faster than peace rests it.',
  },
  'power.weariness.maxFall': {
    v: 0.05, min: 0.005, max: 0.5, step: 0.005, group: 'Power',
    label: 'War weariness: maximum fall per turn',
    doc: 'The most weariness can shed in one turn. Smaller than its rise, so the cost of a war outlives the war. Until M9.8 weariness inherited power.maxRise/power.maxFall and therefore climbed at 0.05 and fell at 0.08 \u2014 exactly backwards.',
  },
  'power.weariness.base': {
    v: 0, min: 0, max: 1, step: 0.01, group: 'Power',
    label: 'War weariness: base',
    doc: 'A nation at peace is not tired. Every point of weariness is something it did.',
  },
  'power.weariness.wWars': {
    v: 0.40, min: 0, max: 1.5, step: 0.05, group: 'Power',
    label: 'War weariness: weight of wars fought',
    doc: 'SEPARATE wars, not Areas \u2014 the heaviest term, because starting a fourth war is a different thing from widening the first. Nothing persisted between wars before M7.3: a nation could fight every turn for forty turns and the only trace was a treasury line.',
  },
  'power.weariness.warsK': {
    v: 3, min: 0.5, max: 30, step: 0.5, group: 'Power',
    label: 'War weariness: wars at which the term is half',
    doc: 'Three wars inside the history window is a country that has been fighting for years.',
  },
  'power.weariness.wAreas': {
    v: 0.20, min: 0, max: 1.5, step: 0.05, group: 'Power',
    label: 'War weariness: weight of ground taken by force',
    doc: 'Widening a war costs less than starting another one, but it is not free.',
  },
  'power.weariness.areasK': {
    v: 14, min: 1, max: 200, step: 1, group: 'Power',
    label: 'War weariness: Areas at which the term is half',
    doc: 'Fourteen Areas taken by force inside the history window is a campaign rather than a border adjustment. Paired with wAreas, which is deliberately half the weight of wWars: widening a war costs less than starting another one.',
  },
  'power.weariness.wOccupation': {
    v: 0.30, min: 0, max: 1.5, step: 0.05, group: 'Power',
    label: 'War weariness: weight of occupied ground',
    doc: 'The war that does not end. Occupation is already expensive in money and Authority; this is what it costs the people holding it down.',
  },
  'power.weariness.wDeployed': {
    v: 0.30, min: 0, max: 1.5, step: 0.05, group: 'Power',
    label: 'War weariness: weight of an army in the field',
    doc: 'AN ARMY IN THE FIELD, not an army. Force size is not a choice here — mil.manpowerShare is fixed, so force/pop reads as a constant for every nation forever: a term carrying no information and a permanent drag with no lever. The POSTURE is chosen every turn, and an expeditionary army is a burden in a way a border garrison is not. This is the one place the M6.5 allocation costs something at home, and it makes "everything to Field" a decision with a price rather than a free preparation.',
  },
  'qol.wWeariness': {
    v: -0.30, min: -1, max: 0, step: 0.01, group: 'Power',
    label: 'QoL: weight of war weariness',
    doc: 'The first place a tired country feels it: the young are elsewhere, the budget is elsewhere, and the years are going somewhere other than into anybody\u2019s life.',
  },
  'sent.wWeariness': {
    v: 0.22, min: -1, max: 1, step: 0.01, group: 'Sentiment',
    label: 'Sentiment: weight of the state\u2019s own war weariness',
    doc: 'Positive like every other grievance weight in this block, and unlike them it is fed the value DIRECTLY rather than 1 - value, because weariness already measures how badly things are going. A rested state gives a movement nothing; an exhausted one hands it an argument it did not have. The second place a long campaign is felt at home, and the one that turns it into a secession problem.',
  },
  /* ---------------- what nations remember ---------------- */
  'rel.base': {
    v: 0, min: -1, max: 1, step: 0.05, group: 'Relations',
    label: 'Relations: where two nations start',
    doc: 'Indifference. Nations that have never done anything to each other have no opinion, and every opinion in the game is therefore something that HAPPENED \u2014 which is what makes the record answerable rather than assumed.',
  },
  'rel.decay': {
    v: 0.94, min: 0.5, max: 1, step: 0.005, group: 'Relations',
    label: 'Relations: what remains of a memory each turn',
    doc: 'At 0.94 an event is two thirds of itself after ten turns and a fifth after thirty. This is what makes "recently" mean something without anybody storing a window \u2014 and setting it to 1 gives nations perfect infinite memory, which is a different and much less forgiving game.',
  },
  'rel.forget': {
    v: 0.002, min: 0, max: 0.1, step: 0.001, group: 'Relations',
    label: 'Relations: weight below which a memory is dropped',
    doc: 'Housekeeping with a real reason: the list is append-only and saved, so without a floor a long game accumulates one entry per action per nation forever, for entries contributing less than a thousandth of a relation.',
  },
  'rel.maxScale': {
    v: 3, min: 1, max: 20, step: 0.5, group: 'Relations',
    label: 'Relations: most a single event can be multiplied by',
    doc: 'Five Areas taken is worse than one, but the point of a magnitude is that a big event is bigger \u2014 not that a big enough event is unforgivable forever.',
  },
  'rel.magAnnexed': {
    v: -0.22, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: they took our ground',
    doc: 'Per Area taken, before the scale. The core grievance the whole structure exists to carry.',
  },
  'rel.magWarred': {
    v: -0.30, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: and it came to a civil war',
    doc: 'On top of the annexation itself. Taking ground is resented; fighting over it is remembered.',
  },
  'rel.magWitnessed': {
    v: -0.05, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: we watched them take somebody else\u2019s',
    doc: 'Small, and it is the seed of every coalition (M7.2): a nation nobody has attacked still ends up surrounded by neighbours who have been watching. Without a witness term a conqueror is resented only by its victims, who are by then the nations least able to do anything about it.',
  },
  'rel.magAbsorbed': {
    v: -0.14, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: they swallowed a nation whole',
    doc: 'Witnessed by everyone. A union is peaceful and it still removes a country from the map, which the remaining countries notice.',
  },
  'rel.magBroke': {
    v: -0.35, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: their bid to unite us fell apart',
    doc: 'The worst single thing one nation can do to another short of conquest: you proposed to absorb them, it failed, and their country came apart in the attempt.',
  },
  'rel.magGranted': {
    v: 0.30, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: they handed us ground',
    doc: 'Gratitude, and the reason release is not only a way to shed a problem: the neighbour who takes the Areas remembers who gave them.',
  },
  'rel.magTraded': {
    v: 0.12, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: we did business',
    doc: 'Both directions. Small per deal and the only term that accumulates through ordinary play rather than through violence, which is what lets a patient nation build standing without taking anything.',
  },
  'rel.magSeceded': {
    v: -0.40, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: we broke away from them',
    doc: 'Directed, and only one way: the breakaway resents the state it left. The parent\u2019s own feeling about the secession is carried by the Areas it lost, which Authority already reads.',
  },
  'rel.magLost': {
    v: -0.30, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: they walked out on us',
    doc: 'THE OTHER HALF OF A SECESSION, added in M7.8. The breakaway\u2019s resentment was recorded from the start; the parent\u2019s was not, on the grounds that Authority already reads the Areas it lost \u2014 which was true until recognition made the parent\u2019s own opinion the thing the rest of the continent waits on. A parent with no recorded feeling recognised its own breakaway as readily as a stranger would, and the pivot the system is built around never happened.',
  },
  'rel.magRecognised': {
    v: 0.20, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: they recognised us',
    doc: 'What a new state feels toward whoever went first. Bigger than a trade deal and smaller than being handed ground, because acknowledging a country costs the acknowledger something and gives the acknowledged everything.',
  },
  'rel.magRevoked': {
    v: -0.30, min: -1, max: 0, step: 0.01, group: 'Relations',
    label: 'Memory: they closed a corridor on us',
    doc: 'How badly a nation takes having a transit corridor closed on it after notice. Set between an annexation (-0.22) and a broken non-aggression pact (-1.4), and much closer to the annexation, because this is a LAWFUL exit taken with a year\'s warning rather than a betrayal - but it is still somebody deciding your economy is worth less to them than their own convenience, and the injured party has a year to watch it coming.',
  },
  'rel.magTreatied': {
    v: 0.18, min: 0, max: 2, step: 0.01, group: 'Relations',
    label: 'Memory: signed a pact together',
    doc: 'What a signature is worth in standing on the day it is signed. Small, because the pact itself is the standing \u2014 it sits on the board and feeds the Influence term for as long as it holds, where this decays like every other memory.',
  },
  'rel.magAided': {
    v: 0.30, min: 0, max: 2, step: 0.01, group: 'Relations',
    label: 'Memory: they paid for something of ours',
    doc: 'Gratitude, and it is ONE-DIRECTIONAL \u2014 the recipient thinks better of the donor and the donor has no new opinion beyond being out of pocket. Larger than a trade deal because a gift is not a bargain.',
  },
  'rel.magReneged': {
    v: -1.4, min: -3, max: 0, step: 0.05, group: 'Relations',
    label: 'Memory: they tore up a pact with us',
    doc: 'A betrayal, and worse than being annexed by somebody who never promised otherwise \u2014 which is the entire reason a treaty is worth signing. A nation that breaks pacts finds nobody will sign the next one, and the Influence term charges it separately.',
  },
  'rel.magBetrayed': {
    v: -0.16, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: they recognised our breakaway',
    doc: 'THE PRICE OF RECOGNISING SOMEBODY ELSE\u2019S REBELS, and the reason recognition is a decision rather than a courtesy. Only charged while the parent still refuses \u2014 once it has given in there is nothing left to resent, and everybody who follows does so free.',
  },
  'rel.acceptFriend': {
    v: 0.18, min: -1, max: 1, step: 0.01, group: 'Relations',
    label: 'Relations: standing at which a neighbour will take ground you release',
    doc: 'Replaces "there is a trade deal on the books", which was a proxy for exactly this and could not tell a long partnership from a single transaction ten turns ago.',
  },
  'rel.uniteSwing': {
    v: 0.35, min: 0, max: 1.5, step: 0.05, group: 'Relations',
    label: 'Relations: how far standing moves a union\u2019s chance',
    doc: 'A nation that likes you is likelier to accept union and one that does not is likelier to fall apart in the attempt. Multiplies the peace chance, so it scales a probability rather than adding to one \u2014 which keeps the result inside [0,1] without a clamp doing the work.',
  },
  /* ---------------- recognition ---------------- */
  'recognition.disposition': {
    v: 0.22, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'How ready the world is to accept a new state at all',
    doc: 'The base every other term moves. At 0.22 a newcomer nobody has an opinion about is recognised by a given nation roughly once every thirteen turns, so a breakaway spends its first years as a pariah unless somebody speaks for it \u2014 which is the problem the system exists to create. Raise it and secession becomes a formality; drop it to zero and only the parent\u2019s decision matters.',
  },
  'recognition.rate': {
    v: 0.28, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'Most likely a single nation is to recognise another in one turn',
    doc: 'The scale on the whole decision, so the terms below are a disposition in 0..1 and this is what turns it into a per-turn chance. A cap rather than a speed: even an ideal case takes a few turns to sweep the continent, because fifty capitals do not move on the same day.',
  },
  'recognition.wStanding': {
    v: 0.45, min: -1, max: 1, step: 0.01, group: 'Recognition',
    label: 'Recognition: weight of what they already think of you',
    doc: 'Signed, and the largest of the four ordinary terms. Recognition is the cheapest favour a nation can do, so it goes first to states it likes \u2014 and a nation that has taken ground from you will leave you in the cold for a decade.',
  },
  'recognition.wKinship': {
    v: 0.20, min: -1, max: 1, step: 0.01, group: 'Recognition',
    label: 'Recognition: weight of political kinship',
    doc: 'Signed, centred on indifference: a government recognises its own kind first and an ideological opposite last. Deliberately smaller than standing, because what a state has DONE to you should outrank what it believes.',
  },
  'recognition.wEndurance': {
    v: 0.25, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'Recognition: weight of having lasted',
    doc: 'A state that is still there next year is a fact, whatever anybody thinks of it. This is the term that guarantees the problem is temporary \u2014 without it a hated breakaway with a hostile parent would stay a ghost forever, which is a dead end rather than a difficulty.',
  },
  'recognition.ageTurns': {
    v: 12, min: 1, max: 80, step: 1, group: 'Recognition',
    label: 'Turns after which a new state is fully established',
    doc: 'Three years of quarters. Long enough that the early scramble is real and short enough that a survivor is not still explaining itself in the endgame.',
  },
  'recognition.wWeight': {
    v: 0.20, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'Recognition: weight of being too big to ignore',
    doc: 'Nobody refuses to deal with a fifth of the continent on principle. Read as a share of the whole board rather than of the roster, so twenty rump states do not add up to a superpower.',
  },
  'recognition.weightFull': {
    v: 0.08, min: 0.005, max: 1, step: 0.005, group: 'Recognition',
    label: 'Share of the continent that counts as impossible to ignore',
    doc: 'The opening board\u2019s largest nation is California at 12.7%, so 8% is a genuinely large breakaway \u2014 the Deseret-scale ones \u2014 rather than every fragment that gets a flag.',
  },
  'recognition.wParent': {
    v: 0.40, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'Recognition: weight of the parent having let go',
    doc: 'THE PIVOT, and the largest single term. While the state it broke from calls it a rebellion the rest of the continent has a reason to wait; the turn the parent gives in, the queue moves. This is what makes a player\u2019s recognition worth asking for, and what makes refusing one a weapon.',
  },
  'recognition.tradeFloor': {
    v: 0.35, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'Legitimacy at which the world market pays full price',
    doc: 'Below this the goods still move, at a smuggler\u2019s discount that shrinks as the world comes round. A hard lock would make an unrecognised landlocked state unplayable and would also be untrue \u2014 what an unrecognised country loses is the margin, not the trade.',
  },
  'recognition.smugglingRate': {
    v: 0.45, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'Share of the going rate a wholly unrecognised state is paid',
    doc: 'Less than half, which is a real wound to an economy and not a rounding error \u2014 the number a new state feels every turn until somebody signs.',
  },
  'recognition.coalitionFloor': {
    v: 0.30, min: 0, max: 1, step: 0.01, group: 'Recognition',
    label: 'Legitimacy needed to take a seat in a coalition',
    doc: 'A coalition is coordination between governments, and nobody coordinates with a state they do not admit exists. Lower than the trade floor because standing shoulder to shoulder against a common threat is easier than signing a paper.',
  },
  'power.influence.wRecognition': {
    v: 0.35, min: 0, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: cost of not being recognised',
    doc: 'SIGNED, AND MEASURED AS A DEFICIT: a fully recognised nation contributes exactly nothing and a wholly unrecognised one loses the full weight. Written the other way round \u2014 a positive term worth 1.0 to everybody who is recognised \u2014 it would have raised every established nation\u2019s Influence by a constant and quietly re-tuned the coalition trigger, which is the mistake the leadership term already made once.',
  },
  /* ---------------- projection ---------------- */
  'proj.decay': {
    v: 0.86, min: 0.5, max: 0.999, step: 0.005, group: 'Projection',
    label: 'How fast reach falls off with distance',
    doc: 'Reach is decay to the power of the accumulated cost, so it falls smoothly and there is no ring on the map. At 0.86 an army is at half strength about five overland Areas from a capital and about eleven along a rail corridor — which is what makes the corridors worth holding.',
  },
  'proj.minReach': {
    v: 0.18, min: 0.001, max: 0.9, step: 0.005, group: 'Projection',
    label: 'Reach below which ground cannot be taken at all',
    doc: 'THE BRAKE, and the thing the other two anti-snowball devices are not: the coalition and the cost of occupation make expansion expensive, and this makes it impossible. Measured across empire sizes, projecting from one capital: the worst of the 944 opening targets sits at 0.31 reach, a 270-Area empire’s worst frontier at 0.23, a 517-Area empire’s at 0.13 and a 660-Area one’s at 0.10. So 0.18 leaves ordinary play untouched, starts refusing the far corners somewhere past a quarter of the continent, and stalls a single-capital empire around a third of it — which is the size at which a conqueror has to answer for the shape of what it holds rather than only for its size. It is also the bound on the search: an Area nobody can act on does not need a number.',
  },

  'proj.homeFloor': {
    v: 0.45, min: 0, max: 1, step: 0.01, group: 'Projection',
    label: 'Reach a nation always has over ground it already holds',
    doc: 'A state administers its own soil whatever the distance. Without it, nineteen of the fifty-one opening nations could not reach part of their own state and Nevada reached nine of its seventeen Areas — which reads as a broken map rather than as a limit. Applied AFTER the search so it never feeds the frontier: a far border still projects nothing beyond itself, because holding and taking are different questions.',
  },
  'proj.overlandCost': {
    v: 1.0, min: 0.1, max: 5, step: 0.05, group: 'Projection',
    label: 'Cost of moving into an Area with no transport at all',
    doc: 'The unit everything else is measured in. Empty ground with no interstate and no railway is the hardest kind to move an army through, and most of the interior west is exactly that.',
  },
  'proj.highwayCost': {
    v: 0.72, min: 0.05, max: 5, step: 0.02, group: 'Projection',
    label: 'Cost of moving along an interstate',
    doc: '1,421 of 2,430 counties carry one, so this is the ordinary case rather than the privileged one.',
  },
  'proj.railCost': {
    v: 0.58, min: 0.05, max: 5, step: 0.02, group: 'Projection',
    label: 'Cost of moving along a railway',
    doc: 'Rail moves an army and its supplies where a road moves an army. 2,245 counties carry track — the difference between them and the rest is most of the shape of the reach map.',
  },
  'proj.hubCost': {
    v: 0.34, min: 0.05, max: 5, step: 0.02, group: 'Projection',
    label: 'Cost of moving through a rail hub',
    doc: 'Seventy-six counties in the whole country, and holding one is worth a war. This is where the baked transport data stops being scenery.',
  },
  'proj.foreignCost': {
    v: 2.2, min: 1, max: 10, step: 0.1, group: 'Projection',
    label: 'How much dearer it is to project through ground you do not hold',
    doc: 'Most of what makes a distant war hard. It is why a nation cannot fight on the far side of a neighbour it has not conquered, and why taking the ground in between is the move that unlocks the ground beyond it.',
  },
  'proj.costAtLimit': {
    v: 1.6, min: 0, max: 6, step: 0.1, group: 'Projection',
    label: 'Surcharge on an annexation at the very edge of reach',
    doc: 'Between full reach and none, the price of taking an Area rises by this much. Distance is expensive before it is impossible — the refusal at `proj.minReach` should be the end of a ramp the player has been watching, not a wall they walk into.',
  },
  'proj.warAtLimit': {
    v: 0.8, min: 0, max: 4, step: 0.05, group: 'Projection',
    label: 'How much worse a war goes at the edge of reach',
    doc: 'The same number that priced the attempt, applied to the fight: an army at the end of its supply line fights badly. Multiplies the existing force multiplier, so a nation with a strong field army can still overreach — it just cannot do it cheaply.',
  },
  /* ---------------- elections ---------------- */
  'election.termTurns': {
    v: 16, min: 2, max: 80, step: 1, group: 'Elections',
    label: 'Turns between elections',
    doc: 'Four years of quarters. The schedule is STAGGERED by a hash of the nation id and stored nowhere \u2014 fifty-one elections landing on the same turn is a newspaper nobody reads, and a derived schedule needs no field in the save, no migration and no reset.',
  },
  'election.wRecord': {
    v: 0.45, min: 0, max: 3, step: 0.05, group: 'Elections',
    label: 'Election: weight of the government\u2019s record',
    doc: 'Quality of Life, centred, as a multiplier on the incumbent\u2019s own share. The largest of the five, because it is the one the player spends every other lever on: a government that delivered survives an electorate that disagrees with it, and one that did not, does not.',
  },
  'election.wOrder': {
    v: 0.25, min: 0, max: 3, step: 0.05, group: 'Elections',
    label: 'Election: weight of Authority',
    doc: 'A government that can govern is worth keeping. Deliberately smaller than the record: order without living standards holds an election, it does not win one.',
  },
  'election.wLiberties': {
    v: 0.25, min: 0, max: 3, step: 0.05, group: 'Elections',
    label: 'Election: weight of Civil Liberties',
    doc: 'And a government that leans on people is not. The other half of the suppression bargain: a garrison buys quiet this decade and votes against you the next.',
  },
  'election.wWeariness': {
    v: 0.45, min: 0, max: 3, step: 0.05, group: 'Elections',
    label: 'Election: weight of war weariness',
    doc: 'The bill for a decade of fighting, arriving at the one moment a population can present it. This is what makes weariness a political stock rather than a mood.',
  },
  'election.wLeader': {
    v: 0.20, min: 0, max: 3, step: 0.05, group: 'Elections',
    label: 'Election: weight of who is in charge',
    doc: 'Borrowed from the leader\u2019s Influence modifier, because the traits that campaign well are the ones that carry standing abroad \u2014 the Orator, the Populist, the Idealist. One number describing one person beats a second that could disagree with it.',
  },
  'election.spread': {
    v: 0.15, min: 0.01, max: 1, step: 0.01, group: 'Elections',
    label: 'How far above the world average counts as a full-marks record',
    doc: 'Every term in the vote is measured AGAINST THE WORLD MEAN rather than against the middle of its range, because the stocks do not sit around 0.5 — a settled board runs Quality of Life in the eighties, and centring on 0.5 hands every incumbent alive the same large bonus. This is the distance from the mean that saturates a term: 15 points of Quality of Life clear of the average is a government nobody turns out.',
  },
  'election.stealBelow': {
    v: 0.32, min: 0, max: 1, step: 0.01, group: 'Elections',
    label: 'Civil Liberties below which a result can be refused',
    doc: 'A government whose liberties have already fallen this far IS a state that can ignore a vote \u2014 the capacity and the score are the same fact, so nothing new has to be invented to say who may. On the opening board every nation is far above it; a state gets here by holding its own people down for years.',
  },
  'election.stealLibertiesHit': {
    v: 0.12, min: 0, max: 1, step: 0.01, group: 'Elections',
    label: 'Civil Liberties lost by refusing a result',
    doc: 'Applied to the STOCK rather than to its target, so it is a shock that decays over several turns rather than a number the next recompute undoes. The loop the whole game runs on, in its tightest form: suppression buys you this term and buys the grievance that takes the next one.',
  },
  /* ---------------- migration ---------------- */
  'migration.rate': {
    v: 0.030, min: 0, max: 0.5, step: 0.005, group: 'Migration',
    label: 'Most of an Area\u2019s people who may leave in one turn',
    doc: 'A CAP, not a speed: nobody empties an Area in a quarter however bad it is, and the number that actually moves is this scaled by how much better it is next door. At 3% a strong gradient shifts about an eighth of a population a decade, which is fast enough to see on the map and slow enough that a bad decade is recoverable.',
  },
  'migration.threshold': {
    v: 0.015, min: 0, max: 0.5, step: 0.005, group: 'Migration',
    label: 'How much better next door has to be before anybody goes',
    doc: 'Nobody uproots for a rounding error. Without a floor every Area exchanges a trickle with every neighbour every turn, which is a great deal of arithmetic that says nothing and a population map that shimmers.',
  },
  'migration.gradientFull': {
    v: 0.30, min: 0.02, max: 2, step: 0.01, group: 'Migration',
    label: 'The gradient that counts as an outright exodus',
    doc: 'The summed advantage of the better neighbours at which the per-turn cap applies in full. Measured against the opening board, where the spread between the best and worst Area a mover can reach is around 0.2 \u2014 so 0.30 means an ordinary gradient moves a fraction of the cap and it takes a genuinely bad nation next to a genuinely good one to move the maximum.',
  },
  'migration.wQol': {
    v: 0.40, min: 0, max: 1, step: 0.01, group: 'Migration',
    label: 'Migration: weight of the nation\u2019s quality of life',
    doc: 'THE TERM THAT MAKES QoL PHYSICAL. Before this it was a number on a card: a nation could grind its people down and the only consequence was a worse number. The largest weight, because it is the one the rest of the game already spends money on.',
  },
  'migration.wLiberties': {
    v: 0.20, min: 0, max: 1, step: 0.01, group: 'Migration',
    label: 'Migration: weight of civil liberties',
    doc: 'So suppression has a demographic price as well as a political one: a garrison buys quiet, and the people who can leave do.',
  },
  'migration.wProsperity': {
    v: 0.25, min: 0, max: 1, step: 0.01, group: 'Migration',
    label: 'Migration: weight of output per head',
    doc: 'Measured HERE rather than nationally, and it is the brake on the whole system: GDP does not move with people, so every arrival lowers the number that attracted them. Without it the continent piles into one Area and stays there.',
  },
  'migration.prosperityK': {
    v: 60000, min: 1000, max: 500000, step: 1000, group: 'Migration',
    label: 'Output per head that reads as half-attractive',
    doc: 'The opening board averages about $73,000 a head, so 60,000 puts a typical Area a little above the midpoint and leaves room above and below for the spread to matter.',
  },
  'migration.wAlignment': {
    v: 0.35, min: 0, max: 1, step: 0.01, group: 'Migration',
    label: 'Migration: weight of living among your own kind',
    doc: 'THE TERM THAT CHANGES THE GAME. People move toward people who think as they do, so a divided nation sorts itself into homogeneous halves over a few decades \u2014 and the halves are exactly the ground a movement organises on. It is also what makes settlement an answer to secession: pour your own people into a separatist region and the movement\u2019s SHARE falls even though its membership has not.',
  },
  'migration.wCrowding': {
    v: 0.15, min: 0, max: 1, step: 0.01, group: 'Migration',
    label: 'Migration: how much a full Area puts people off',
    doc: 'A second brake beside prosperity, and a smaller one. Cities are attractive; the point of the term is not to say otherwise but to stop nine million people arriving in the one Area with the best numbers.',
  },
  'migration.crowdK': {
    v: 600000, min: 10000, max: 20000000, step: 10000, group: 'Migration',
    label: 'Population at which an Area reads as half-full',
    doc: 'The board averages 203,000 people an Area, so 600,000 leaves ordinary Areas barely crowded and bites on the handful that hold a city.',
  },
  'migration.borderFriction': {
    v: 0.40, min: 0, max: 1, step: 0.05, group: 'Migration',
    label: 'How much of a gradient survives crossing a national border',
    doc: 'THE WHOLE OF \u201cNETWORK DISTANCE\u201d BEYOND ADJACENCY. A border is friction and not a wall: internal sorting is the fast, common, invisible kind of movement and emigration is a nation losing people to a rival, which ought to be rare enough to be worth a line in the panel.',
  },
  'migration.minPop': {
    v: 200, min: 0, max: 100000, step: 50, group: 'Migration',
    label: 'Smallest group that bothers to move',
    doc: 'Below this the arithmetic costs more than the answer is worth, and a fractional person moving between two empty Areas is not a migration.',
  },
  /* ---------------- autonomy ---------------- */
  'autonomy.maxShare': {
    v: 0.3, min: 0, max: 1, step: 0.01, group: 'Autonomy',
    label: 'Most of your ground that may be autonomous',
    doc: 'A state that governs none of itself is not a state. The cap is what stops autonomy being a way to keep every Area quiet at once \u2014 it is a valve for the places that are actually going, not a policy for the whole country.',
  },
  'autonomy.budgetAreas': {
    v: 3, min: 1, max: 20, step: 1, group: 'Autonomy',
    label: 'Areas that may be granted autonomy at once',
    doc: 'One decision at a time, like every other territorial action.',
  },
  'autonomy.cooldownTurns': {
    v: 6, min: 0, max: 40, step: 1, group: 'Autonomy',
    label: 'Turns between grants',
    doc: 'A settlement is negotiated, not announced. Also stops a nation autonomising its way out of a crisis in one round.',
  },
  'autonomy.taxShare': {
    v: 0.55, min: 0, max: 1, step: 0.05, group: 'Autonomy',
    label: 'Share of an autonomous Area\u2019s tax you still collect',
    doc: 'THE PRICE, and it is money rather than force: an Area governing itself keeps most of what it raises. Garrison and autonomy are the same trade run in opposite directions \u2014 one buys quiet with troops and pays in liberties, the other buys it with self-rule and pays in revenue and reach.',
  },
  'autonomy.sentimentRelief': {
    v: 0.45, min: 0, max: 1, step: 0.05, group: 'Autonomy',
    label: 'How much self-rule takes out of the grievance',
    doc: 'Applied to the whole grievance rather than to one term, because the answer autonomy gives is not "your quality of life improved" but "this is your government now".',
  },
  'power.authority.wAutonomy': {
    v: -0.18, min: -1, max: 0, step: 0.01, group: 'Power',
    label: 'Authority: weight of ground that governs itself',
    doc: 'What autonomy costs the state, beyond the revenue: a government that has handed a third of its territory to local rule commands less than one that has not. Smaller than the occupation weight, because this was a decision rather than a defeat.',
  },
  /* ---------------- force ---------------- */
  'liberty.wGarrison': {
    v: -0.35, min: -1, max: 0, step: 0.01, group: 'Power',
    label: 'Civil liberties: weight of a garrison at home',
    doc: 'What suppression costs. A garrison buys quiet in the sentiment phase and pays for it here, in the stock that feeds the grievance driving the next movement — without which suppression is a free answer to secession and the whole valve is a button you would always press.',
  },
  'mil.manpowerShare': {
    v: 0.004, min: 0, max: 0.05, step: 0.0005, group: 'Military',
    label: 'Share of the population under arms',
    doc: 'Four in a thousand. Roughly a peacetime standing force: enough that a large nation fields a large army and a small one cannot bluff, without turning the game into a mobilisation race.',
  },
  'mil.equipmentHalf': {
    v: 60000, min: 1000, max: 400000, step: 1000, group: 'Military',
    label: 'GDP per head at which equipment is half',
    doc: 'Equipment SATURATES rather than scaling: the difference between a poor nation and a middling one is most of the story, and the difference between a rich one and a very rich one is very little of it. A linear term would make California\u2019s army twelve times Wyoming\u2019s before a single soldier was counted.',
  },
  'mil.doctrineFloor': {
    v: 0.35, min: 0, max: 1, step: 0.01, group: 'Military',
    label: 'Doctrine floor',
    doc: 'A state with no authority and a population that agrees with nothing still fields something. Without a floor, a nation in crisis loses its army at the exact moment the model wants it to have a hard choice about using it.',
  },
  'mil.wAuthority': {
    v: 0.6, min: 0, max: 1.5, step: 0.05, group: 'Military',
    label: 'Doctrine: weight of Authority',
    doc: 'The machinery \u2014 whether the state can actually get people into uniform and keep them there.',
  },
  'mil.wCohesion': {
    v: 0.4, min: 0, max: 1.5, step: 0.05, group: 'Military',
    label: 'Doctrine: weight of a people that agrees with itself',
    doc: 'The willingness. A divided population fields a divided army.',
  },
  'mil.upkeepPerHead': {
    v: 35000, min: 0, max: 1000000, step: 5000, group: 'Military',
    label: 'Upkeep per soldier-equivalent, per turn ($)',
    doc: 'Charged on FORCE rather than on the allocation, because the allocation is where an army points and not how big it is \u2014 you do not save money by pointing it somewhere else. This is what makes "how much force" a question rather than "as much as possible". Calibrated: at 120,000 the army ate the whole of Ohio’s opening surplus and every nation on the map ran a deficit from turn one. At 35,000 it is about a third of what a state has spare, which is a real bill rather than a death sentence.',
  },
  'mil.readyRise': {
    v: 0.06, min: 0, max: 1, step: 0.01, group: 'Military',
    label: 'Readiness gained per turn',
    doc: 'THE COST OF CHANGING YOUR MIND. Without a rate limit the allocation is three sliders you set at the moment of use \u2014 everything to Field on the turn you invade, everything to Garrison on the turn a movement crosses the line \u2014 and a decision you can always take later is not a decision.',
  },
  'mil.readyFall': {
    v: 0.12, min: 0, max: 1, step: 0.01, group: 'Military',
    label: 'Readiness lost per turn',
    doc: 'Faster than it is gained: an army stood down is stood down immediately, and an army worked up takes seasons.',
  },
  'mil.garrisonFree': {
    v: 0.111, min: 0, max: 1, step: 0.005, group: 'Military',
    label: 'Share of force that garrisons without suppressing',
    doc: 'A peacetime army holds nobody down. Set to exactly the share the default even split leaves at home (a third of the force at a third readiness), so a nation that has made no military decision suppresses nothing \u2014 without it, every nation on the map quietly held its own population down from turn zero and the secession timeline moved for a world in which nobody had chosen anything.',
  },
  'mil.garrisonHalf': {
    v: 200, min: 10, max: 50000, step: 25, group: 'Military',
    label: 'Garrison per Area at which suppression is half',
    doc: 'PER AREA, which is what stops a large empire suppressing everything at once: a garrison spread over sixty Areas is not the garrison of a nation with four, and that is exactly the difference between an occupier who can hold a province and one stretched across a continent. Calibrated against the force the model actually produces: Ohio fields 18,700 across 63 Areas, so a full garrison is roughly 300 per Area. At the first guess of 1,200 the term read 0.027 and suppression did nothing at all.',
  },
  'mil.warSwing': {
    v: 0.45, min: 0, max: 1.5, step: 0.05, group: 'Military',
    label: 'How far force moves a war',
    doc: 'The swing between total superiority and total inferiority, applied to the civil-war score (where low is a win for the attacker). At 0.45 a prepared army roughly halves the score it would otherwise face and an unprepared one adds half again \u2014 large enough to be worth planning for, small enough that the dice still decide.',
  },
  'coalition.warShare': {
    v: 0.45, min: 0, max: 1, step: 0.05, group: 'Coalitions',
    label: 'How much of a coalition member\u2019s border army counts against you',
    doc: 'A coalition is not a treaty that has to be invoked; it is the fact that three of your neighbours have their armies pointed at you, and they are pointed at you whether or not today\u2019s victim is one of them. Discounted, because they are not the ones being attacked and their border force is spread across a frontier rather than concentrated on this fight.',
  },
  'mil.suppressLiberty': {
    v: 0.35, min: 0, max: 2, step: 0.05, group: 'Military',
    label: 'Civil liberties lost to a full garrison',
    doc: 'THE PRICE OF HOLDING PEOPLE DOWN, and the reason suppression is a trade rather than a free answer to secession: a garrison buys quiet now and buys the grievance that feeds the next movement.',
  },
  /* ---------------- who you play ---------------- */
  'start.wSize': {
    v: 1.0, min: 0, max: 3, step: 0.05, group: 'Start',
    label: 'Difficulty: weight of size',
    doc: 'How much the number of Areas a nation opens with counts toward how easy it is to play.',
  },
  'start.wEconomy': {
    v: 0.9, min: 0, max: 3, step: 0.05, group: 'Start',
    label: 'Difficulty: weight of the economy',
    doc: 'Money is time \u2014 an annexation you can afford early, a handover you can pay for.',
  },
  'start.wCohesion': {
    v: 0.7, min: 0, max: 3, step: 0.05, group: 'Start',
    label: 'Difficulty: weight of political agreement',
    doc: 'How much a population that agrees with itself makes a nation easier to govern. Uses the same cohesion figure Civil Liberties reads.',
  },
  'start.wCalm': {
    v: 1.2, min: 0, max: 3, step: 0.05, group: 'Start',
    label: 'Difficulty: weight of having no movement in your ground',
    doc: 'The heaviest term, and the one that separates two nations of the same size: Utah and Missouri open with similar numbers, and one of them has Deseret in it.',
  },
  'start.wRoom': {
    v: 0.6, min: 0, max: 3, step: 0.05, group: 'Start',
    label: 'Difficulty: weight of having somewhere to go',
    doc: 'The share of your neighbours smaller than you. A nation ringed by larger ones has no first move.',
  },
  'start.bonusAtZero': {
    v: 90e9, min: 0, max: 500e9, step: 5e9, group: 'Start',
    label: 'Opening grant at difficulty zero ($)',
    doc: 'Paid once, at the start, scaled by how hard the start is: a Brutal opening gets most of this, a Comfortable one gets almost none. MONEY, deliberately, and not territory or a rule change \u2014 every faction has to play the same continent or the difficulty rating is describing a world nobody else is in. Money buys time, which is exactly what a hard opening is short of.',
  },
  /* ---------------- how a game ends ---------------- */
  'win.warnAt': {
    v: 0.8, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Progress at which a nation\u2019s approach is reported',
    doc: 'The newspaper names anybody this close to a victory condition. Without it the end of the game arrives with no build-up \u2014 measured in play: Delaware won Ideological Dominance on turn 30 and the first the player heard of it was the end screen. A game you can lose without seeing it coming is one you cannot play against.',
  },
  'win.warnDelta': {
    v: 0.03, min: 0, max: 0.5, step: 0.005, group: 'Victory',
    label: 'How far a nation must MOVE before its approach is reported',
    doc: 'The alarm fires on movement toward a victory, not on standing near one. Without it the newspaper cried wolf from turn 1 \u2014 three nations "84% of the way" on the opening board \u2014 because the binding terms of two of the three conditions are power stocks that open close to their targets and simply sit there. A nation that has been 84% of the way for thirty turns is not news; a nation that was 84% last turn and is 87% now is. MEASURED at seed 20260829 over 40 turns, across every nation already past win.warnAt: 314 turn-to-turn moves, median +0.0127, so a threshold of 0.01 fires on less than routine settling and is not a threshold at all. At 0.03 the same run reports 3 times after the grace period; at 0.01 it reports 98 times, which is wallpaper.',
  },
  'win.warnRepeatTurns': {
    v: 6, min: 1, max: 40, step: 1, group: 'Victory',
    label: 'Turns before the same warning repeats',
    doc: 'The same nation and the same condition are not reported again inside this window, however much they move. An alarm that fires every turn is wallpaper, and wallpaper is what the player stops reading three turns before the one that mattered.',
  },
  'win.graceTurns': {
    v: 12, min: 0, max: 80, step: 1, group: 'Victory',
    label: 'Turns before anyone can win',
    doc: 'No condition is evaluated before this. The opening position is not a victory, and a game that can be won on turn 2 by whoever started largest is not a game.',
  },
  'win.seatInfluence': {
    v: 0.55, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Influence needed for another nation\u2019s seat to count',
    doc: 'A seat of government you do not own counts toward Reunification if the nation holding it governs as you do AND your Influence clears this. A beloved hegemon reunifies through nations it never invaded; a feared one takes every capital by hand. The late-game kingmaker role, without inventing a vassal contract the save format has nowhere to put.',
  },
  'win.seatInfluenceGap': {
    v: 0.18, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Influence you must hold OVER a nation for its seat to count',
    doc: 'How far your Influence must exceed the holder\u2019s. Sharing an ideology is not the same as following somebody: without this, Ohio counted twenty-eight seats on turn zero, because at the opening position most of the country governs as most of the rest of it does. At turn 0 nobody is anybody\u2019s junior, so the mechanic arrives late \u2014 which is where a kingmaker belongs.',
  },
  'win.reuniteSeats': {
    v: 0.55, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Reunification: share of the 51 seats',
    doc: 'Twenty-eight of the fifty-one seats of government, owned or aligned. Calibrated against a measured world rather than guessed: over eighty turns with nobody playing, the best AI nation held five seats (9.8%), so this is five and a half times what the map produces on its own.',
  },
  'win.reunitePop': {
    v: 0.3, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Reunification: share of the people',
    doc: 'Half the continent\u2019s population. Three times the 9.2% the largest nation reaches in an eighty-turn game nobody plays.',
  },
  'win.reuniteGdp': {
    v: 0.3, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Reunification: share of the economy',
    doc: 'Half the continent\u2019s GDP. Three times the 10.2% the largest economy reaches on its own.',
  },
  'win.reuniteAuthority': {
    v: 0.65, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Reunification: Authority floor',
    doc: 'A state that cannot govern what it holds has not reunified anything. A floor, not a wall: Authority runs to 0.91 in a measured game, so this excludes a state that cannot govern without being the binding constraint on anybody. A floor, not a wall: Authority runs to 0.91 in a measured game, so this excludes a state that cannot govern without ever being the binding constraint.',
  },
  'win.reuniteInfluence': {
    v: 0.5, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Reunification: Influence floor',
    doc: 'THE DESIGN OF THE CAPSTONE. Without it the shortest path to winning is conquering the continent \u2014 the strategy the rest of the game spends its time punishing. With it, a conqueror can hold every acre and still be unable to close, and has to spend the late game being tolerable. Set just under the 0.53 ceiling Influence actually reaches, because it IS meant to be the binding constraint: this is the term a conqueror fails.',
  },
  'win.ideoSway': {
    v: 0.52, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Ideological Dominance: share of the continent holding your ideology',
    doc: 'Measured over every PERSON on the continent, not every Area \u2014 land does not vote. Counting Areas made this a fact about American geography rather than an achievement: 80.7% of counties hold a red plurality on turn ZERO, so the requirement was met by every red-governing nation before anybody did anything, and it eroded from there, which is exactly backwards for a victory. By head the continent opens at red 0.484 / blue 0.467 \u2014 the real national split \u2014 and drifts DOWN to 0.445 over sixty turns as the six-ideology model spreads it out. So 0.52 is above anything the map produces on its own and within reach of a nation that governs and grows toward it.',
  },
  'win.ideoAuthority': {
    v: 0.7, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Ideological Dominance: Authority floor',
    doc: 'Nobody copies a government that cannot govern.',
  },
  'win.ideoInfluence': {
    v: 0.5, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Ideological Dominance: Influence floor',
    doc: 'The highest floor of any condition, because being heard is the whole of this victory. Influence tops out near 0.53 in a measured game, so this admits roughly the single most-heard nation on the map and nobody else. Influence tops out near 0.53 in a measured game, so this admits roughly the single most-heard nation on the map and nobody else.',
  },
  'win.econGdpShare': {
    v: 0.22, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Economic Supremacy: share of the economy',
    doc: 'Lower than Reunification\u2019s, because this condition also asks to be rich per head, which conquest does not deliver. Twice the 10.2% the largest economy reaches without anyone playing for it.',
  },
  'win.econPerCapita': {
    v: 1.6, min: 1, max: 6, step: 0.05, group: 'Victory',
    label: 'Economic Supremacy: GDP per head, against the median nation',
    doc: 'Measured against the MEDIAN nation rather than a dollar figure, so it means the same thing in a fifty-nation world and a ten-nation one, and cannot be reached by inflation.',
  },
  'win.econQol': {
    v: 0.75, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Economic Supremacy: quality of life floor',
    doc: 'Wealth that never reaches anybody is not supremacy, it is a statistic.',
  },
  /* ---------------- the ground itself (M12) ---------------- */
  /*
   * Per-Area quality of life and civil liberties. Both were national stocks, so
   * every Area of a country was exactly as pleasant and exactly as free as
   * every other one, and grievance had no gradient to build on inside a border.
   *
   * The shape is deliberately "the nation's stock, adjusted by what is true
   * HERE" rather than a second full formula: the national stock already reads
   * everything national (solvency, government, war weariness, the leader), and
   * a per-Area version that re-derived those would be a second implementation
   * of the same thing that could disagree with the panel.
   */
  'area.qolWealthWeight': {
    v: 0.30, min: 0, max: 1, step: 0.01, group: 'The ground',
    label: 'How much local wealth moves an Area\u2019s quality of life',
    doc: 'The Area\u2019s GDP per head against the nation\u2019s own median, compressed. This is the term that makes a rich coast and a poor interior two different places to live inside one country \u2014 and it is measured against the NATION\u2019s median rather than the continent\u2019s, because what makes somewhere feel left behind is the rest of its own country.',
  },
  'area.qolOccupied': {
    v: -0.18, min: -1, max: 0, step: 0.01, group: 'The ground',
    label: 'Quality of life on occupied ground',
    doc: 'Living under a government that took the place by force. Applied to the Area rather than to the nation, which is the whole point: a conqueror\u2019s own cities are not made worse by the conquest, and the ground it took is.',
  },
  'area.qolAutonomy': {
    v: 0.10, min: 0, max: 1, step: 0.01, group: 'The ground',
    label: 'Quality of life where the Area governs itself',
    doc: 'Autonomy buys quiet with self-rule and pays in revenue and reach. This is the quiet, made local \u2014 the thing the Area actually gets in exchange.',
  },
  'area.libGarrison': {
    v: -0.35, min: -1, max: 0, step: 0.01, group: 'The ground',
    label: 'Civil liberties under a garrison',
    doc: 'Troops on the street, per Area rather than averaged over the country. A nation garrisoning one restive province is not a police state everywhere, which is what the national stock had to say before M12.',
  },
  'area.libAutonomy': {
    v: 0.18, min: 0, max: 1, step: 0.01, group: 'The ground',
    label: 'Civil liberties where the Area governs itself',
    doc: 'The other side of the autonomy trade: a place running its own affairs is freer in them.',
  },
  'area.libOccupied': {
    v: -0.22, min: -1, max: 0, step: 0.01, group: 'The ground',
    label: 'Civil liberties on occupied ground',
    doc: 'Occupation is administered, and administration under arms is not free. Larger than the quality-of-life penalty because an occupier can pave the roads and still not let anybody vote.',
  },
  'area.maxRise': {
    v: 0.06, min: 0.005, max: 0.5, step: 0.005, group: 'The ground',
    label: 'Most an Area stock may rise in one turn',
    doc: 'Rate-limited like every other stock in this game, and for the same reason: a place does not become somewhere else in a quarter, and the lag is what makes a decade of bad government a story rather than a step change.',
  },
  'area.maxFall': {
    v: 0.09, min: 0.005, max: 0.5, step: 0.005, group: 'The ground',
    label: 'Most an Area stock may fall in one turn',
    doc: 'Larger than the rise, like the national stocks: somewhere is easier to ruin than to build.',
  },
  'sent.wLocal': {
    v: 0.55, min: 0, max: 1, step: 0.05, group: 'Sentiment',
    label: 'How much of grievance reads the AREA rather than the nation',
    doc: 'Grievance blends the Area\u2019s own quality of life and liberties with its nation\u2019s. At 1.0 the national stocks would stop mattering to sentiment at all, which is wrong \u2014 a country in crisis is a country in crisis everywhere; at 0 nothing local matters, which is where the model was before M12. It is a blend because both are true.',
  },
  'migration.wLocal': {
    v: 0.6, min: 0, max: 1, step: 0.05, group: 'Migration',
    label: 'How much of the migration pull reads the AREA rather than the nation',
    doc: 'The same blend for the same reason, and higher: people move to a PLACE. Somebody leaving a poor interior for a rich coast has not changed country, and before M12 that move was invisible to the model because both ends read the same two national numbers.',
  },

  /* ---------------- treaties and aid (M11.2) ---------------- */
  'treaty.cooldownTurns': {
    v: 6, min: 0, max: 40, step: 1, group: 'Diplomacy',
    label: 'Turns between treaties',
    doc: 'A nation may sign one pact this often. Without a clock a nation signs with every neighbour on consecutive turns and a treaty network is a formality rather than a choice about who matters.',
  },
  'treaty.minStanding': {
    v: -0.2, min: -1, max: 1, step: 0.05, group: 'Diplomacy',
    label: 'Standing needed before anybody will sign',
    doc: 'How the other side has to feel about you before a signature is possible, on the -1..1 relations scale. Set below zero on purpose: two nations that merely tolerate each other are exactly the pair a non-aggression pact is FOR, and requiring warmth first would make treaties a reward for a relationship rather than a way of building one.',
  },
  'power.influence.wTreaty': {
    v: 0.16, min: 0, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of the treaty record',
    doc: 'Pacts held, minus breaches at breachWeight. The standing a nation earns by being somebody whose signature means something \u2014 and the first Influence term that rewards a promise rather than a possession.',
  },
  'power.influence.treatyK': {
    v: 4, min: 1, max: 30, step: 1, group: 'Power',
    label: 'Treaty record at which the term is half',
    doc: 'Saturation constant. Four live pacts is a nation with a diplomatic policy; forty would be a nation that has signed with everybody, and the term should not keep paying for that.',
  },
  'power.influence.breachWeight': {
    v: 2.5, min: 0, max: 10, step: 0.1, group: 'Power',
    label: 'How many pacts a broken one costs',
    doc: 'A breach is worth more than a signature, and the asymmetry is the whole mechanic: signing is cheap, so without it a serial betrayer simply out-signs their own reputation. At 2.5 a nation that breaks one pact has to keep three to get back to level.',
  },
  'power.influence.wAid': {
    v: 0.12, min: 0, max: 1, step: 0.01, group: 'Power',
    label: 'Influence: weight of the nations you are funding',
    doc: 'How many client states you keep, and how strongly. Standing bought rather than earned \u2014 which is why it is the smallest of the positive terms and why it evaporates the moment the payments stop.',
  },
  'power.influence.clientsK': {
    v: 3, min: 1, max: 30, step: 1, group: 'Power',
    label: 'Client weight at which the aid term is half',
    doc: 'Saturation constant on the summed patron weight, not the head count: one country deeply in your pocket is worth about as much as three that took a cheque once.',
  },
  'aid.shareOfTreasury': {
    v: 0.12, min: 0.01, max: 1, step: 0.01, group: 'Diplomacy',
    label: 'Share of the treasury one payment moves',
    doc: 'Aid is a fixed share of what the donor holds rather than a number the player types, for the same reason every other price here is derived: a figure the player chooses is a figure the AI cannot compare against, and the interesting decision is WHO to fund, not how much.',
  },
  'aid.cooldownTurns': {
    v: 4, min: 0, max: 40, step: 1, group: 'Diplomacy',
    label: 'Turns between payments to the same nation',
    doc: 'A patron cannot simply pay every turn until the client is theirs. The clock is what makes buying a country\u2019s politics take years rather than a rich afternoon.',
  },
  'aid.patronGain': {
    v: 1.2, min: 0, max: 6, step: 0.05, group: 'Diplomacy',
    label: 'Patron weight bought per share of income given',
    doc: 'How much of a client one payment makes, per unit of "the payment as a share of the recipient\u2019s annual income". Scaling by the RECIPIENT\u2019s income rather than the donor\u2019s is what makes small countries cheap to buy and large ones effectively unbuyable, which is the correct shape.',
  },
  'aid.patronMax': {
    v: 0.35, min: 0, max: 1, step: 0.01, group: 'Diplomacy',
    label: 'Most of a nation\u2019s politics a patron can own',
    doc: 'The cap on the blend in phasePoliticalDrift: at 0.35 a fully-bought client governs about a third like its patron and two thirds like itself. A cap under 1 is the statement that money cannot buy a country outright, which is what stops Ideological Dominance from being a purchase.',
  },
  'aid.patronDecay': {
    v: 0.08, min: 0, max: 1, step: 0.01, group: 'Diplomacy',
    label: 'Share of patron weight lost each turn',
    doc: 'A patron who stops paying stops being one. At 0.08 a relationship left alone is half gone in about nine turns, so the lever has to be held down rather than pulled once.',
  },
  'aid.recognitionBoost': {
    v: 0.25, min: 0, max: 2, step: 0.05, group: 'Diplomacy',
    label: 'How much aid moves the chance of being recognised',
    doc: 'Added to the recipient\u2019s per-turn chance of recognising the donor, scaled by patron weight. Aid is how an unrecognised state buys its way onto the map, which is the one route out of the recognition trap that does not involve winning a war.',
  },

  /* ---------------- coalitions ---------------- */
  'coalition.trigger': {
    v: 0.085, min: 0, max: 0.5, step: 0.005, group: 'Coalitions',
    label: 'Threat at which the continent starts lining up',
    doc: 'threat = share of the continent x (1 - Influence). BEING BIG IS NOT THE CRIME: a nation can hold half the map untouched if the other half is glad it is there, and a middling one can be surrounded because of how it got there. Measured against the opening position, where the largest nation is California at 12.7% of the continent and middling standing, for a threat of 0.063 \u2014 so 0.085 leaves the board quiet on turn one and needs a nation to have grown by a third, or spent its standing, before anybody lines up. At turn 40 of a played game California reached 0.093 and three nations formed against it.',
  },
  'coalition.joinRelation': {
    v: -0.10, min: -1, max: 1, step: 0.01, group: 'Coalitions',
    label: 'Standing at which a nation joins the coalition',
    doc: 'Read off the M7.1 relations list. A nation joins because it RESENTS the target or because it borders it \u2014 the second is what stops a conqueror being safe simply because it has not got round to its neighbours yet.',
  },
  'coalition.minMemberShare': {
    v: 0.004, min: 0, max: 0.2, step: 0.001, group: 'Coalitions',
    label: 'Smallest nation that counts as a member',
    doc: 'A two-Area rump on the far coast is not a check on anybody. Without a floor, twenty of them line up and the coalition reads as enormous.',
  },
  'coalition.fullShare': {
    v: 0.45, min: 0.05, max: 1, step: 0.01, group: 'Coalitions',
    label: 'Coalition share of the continent that counts as full pressure',
    doc: 'Pressure is the coalition\u2019s share of the continent by weight, not its head count, scaled so that this much is 1.0. Twenty rump states lining up against a superpower is a sentence, not a constraint.',
  },
  'coalition.costMult': {
    v: 0.9, min: 0, max: 4, step: 0.05, group: 'Coalitions',
    label: 'Administration surcharge at full coalition pressure',
    doc: 'THE PENALTY THE LEADER FEELS EVERY TURN, which is what finding 36 asks for: the old shell was a multiplier on a roll that rarely happened, and with it fully applied California still took 1,602 of 1,676 Areas in three turns. Being surrounded is expensive whether or not anybody attacks.',
  },
  'power.influence.wCoalition': {
    v: -0.30, min: -1, max: 0, step: 0.01, group: 'Power',
    label: 'Influence: weight of a coalition against you',
    doc: 'And the standing it costs every turn. Deliberately a FEEDBACK LOOP: low Influence is what forms the coalition, and the coalition lowers Influence further. It is escapable \u2014 stop taking ground and the relations decay, the threat falls and the coalition dissolves \u2014 but it does not let go on its own, which is what makes an overreach a decision you can lose.',
  },
  /* ---------------- anti-snowball ---------------- */
  'shell.topShare': {
    v: 0.1, min: 0, max: 1, step: 0.02, group: 'Anti-snowball',
    label: 'Leader tier share',
    doc: 'Fraction of nations, by size, that count as the leading tier.',
  },
};

/* ------------------------------------------------------------------ */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/*
 * Stored array/object values are cloned on the way IN and frozen, then handed
 * out by reference. Freezing rather than cloning on every read matters: get()
 * is called inside per-Area loops, and a 6-element array copy per Area per turn
 * is 10k allocations a turn for nothing. Freezing turns "caller mutates a
 * tunable" from a silent action-at-a-distance bug into a no-op (sloppy mode) or
 * a TypeError (module/strict code, which is all the new engine code).
 */
const cloneValue = (v) =>
  Array.isArray(v) ? Object.freeze(v.slice())
    : isPlainObject(v) ? Object.freeze({ ...v })
      : v;

export class Tune {
  constructor(overrides) {
    this.values = {};
    /*
     * The authored baseline — content/tunables.json. Empty until setAuthored is
     * called at boot, so a Tune built for a test or for the simulator behaves
     * exactly as it did before three layers existed.
     */
    this.authored = {};
    for (const [k, def] of Object.entries(SCHEMA)) this.values[k] = cloneValue(def.v);
    if (overrides) this.load(overrides);
    /** key -> {count, last} for every key served since the last resetReads() */
    this.readLog = new Map();
    this._trace = null;
  }

  /** Read a tunable. Records the key — that recording IS the explanation layer. */
  get(key) {
    const v = this.values[key];
    if (v === undefined) throw new Error(`TUNE: unknown key "${key}"`);
    let rec = this.readLog.get(key);
    if (!rec) this.readLog.set(key, (rec = { count: 0, last: v }));
    rec.count++;
    rec.last = v;
    if (this._trace) this._trace.add(key);
    return v;
  }

  /** Read without recording — for UI that displays a tunable rather than using it. */
  peek(key) {
    return this.values[key];
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.values, key);
  }

  set(key, value) {
    if (!this.has(key)) throw new Error(`TUNE: unknown key "${key}"`);
    this.values[key] = cloneValue(value);
    return this;
  }

  /** Apply a flat {key: value} override map, ignoring keys not in the schema. */
  load(overrides) {
    const unknown = [];
    for (const [k, v] of Object.entries(overrides || {})) {
      if (this.has(k)) this.values[k] = cloneValue(v);
      else unknown.push(k);
    }
    return unknown;
  }

  /**
   * Become exactly this override map: schema defaults everywhere else (M9.8).
   *
   * `load` MERGES, which is right for the authored `content/tunables.json`
   * applied over the defaults at boot, and wrong for a save. A document carries
   * `TUNE.diff()` — the overrides the game was PLAYED with — and merging it
   * into a session that has its own overrides produces a third tuning that
   * neither the save nor the session ever ran on. The dev dashboard sets
   * overrides on a live TUNE, so that is not hypothetical: move a slider, load
   * a save, and the loaded game silently keeps your slider.
   *
   * A save that restores state has to restore ALL of it. Anything else is the
   * same class of bug as the v1 format persisting two of eight stateful modules
   * and letting the rest carry over from the session.
   */
  /**
   * THREE LAYERS, NOT TWO (spec v2 §2.3).
   *
   * schema defaults  <  content/tunables.json  <  deliberate overrides
   *
   * The authored file is a BASELINE — the shipped tuning of the game — and not
   * an override anybody chose. Recording it here is what lets a save restore
   * what it was *deliberately* played with while still picking up an edit to
   * the authored file made since.
   *
   * Without this, `replace` reset to schema defaults and the save's diff put the
   * authored values back as though they were choices, so a designer who edited
   * a number and reloaded a game in progress silently got his old number back.
   * That is the Phase 0 acceptance test — change a value, reload, see the
   * effect — failing on the commonest path, and failing without saying so.
   */
  setAuthored(map) {
    this.authored = {};
    for (const [k, v] of Object.entries(map || {})) {
      if (this.has(k)) this.authored[k] = cloneValue(v);
    }
    return this;
  }

  /** Schema defaults with the authored file laid over them: the shipped game. */
  baseline() {
    const out = {};
    for (const [k, def] of Object.entries(SCHEMA)) out[k] = cloneValue(def.v);
    for (const [k, v] of Object.entries(this.authored || {})) out[k] = cloneValue(v);
    return out;
  }

  replace(overrides) {
    const base = this.baseline();
    for (const k of Object.keys(SCHEMA)) this.values[k] = base[k];
    return this.load(overrides);
  }

  /**
   * What a SAVE should carry: only what was deliberately changed away from the
   * shipped game. Anything equal to the authored baseline is left out, so
   * re-authoring that number later reaches games already in progress.
   */
  diffFromAuthored() {
    const base = this.baseline();
    const out = {};
    for (const k of Object.keys(SCHEMA)) {
      if (JSON.stringify(this.values[k]) !== JSON.stringify(base[k])) out[k] = cloneValue(this.values[k]);
    }
    return out;
  }

  /** Only the keys that differ from the schema default — what content/tunables.json holds. */
  diff() {
    const out = {};
    for (const [k, def] of Object.entries(SCHEMA)) {
      const cur = this.values[k];
      if (JSON.stringify(cur) !== JSON.stringify(def.v)) out[k] = cloneValue(cur);
    }
    return out;
  }

  /** Every key and its current value — what the dashboard and the save both want. */
  serialize() {
    const out = {};
    for (const k of Object.keys(SCHEMA)) out[k] = cloneValue(this.values[k]);
    return out;
  }

  /** Collect the keys read during fn(). Nests safely. */
  trace(fn) {
    const outer = this._trace;
    const seen = new Set();
    this._trace = seen;
    try {
      const result = fn();
      return { result, keys: [...seen] };
    } finally {
      this._trace = outer;
      if (outer) for (const k of seen) outer.add(k);
    }
  }

  resetReads() {
    this.readLog.clear();
  }

  /** Keys never read since the last reset — finds constants that fell out of use. */
  unreadKeys() {
    return Object.keys(SCHEMA).filter((k) => !this.readLog.has(k));
  }
}

export function createTune(overrides) {
  return new Tune(overrides);
}

/** Metadata for one key, for the dashboard and the "show your work" table. */
export function describe(key) {
  const d = SCHEMA[key];
  if (!d) return null;
  return {
    key,
    label: d.label,
    group: d.group,
    doc: d.doc,
    kind: d.kind || 'number',
    min: d.min,
    max: d.max,
    step: d.step,
    default: cloneValue(d.v),
  };
}

/** Schema grouped for rendering: [{group, keys:[describe(key), ...]}, ...] */
export function groups() {
  const byGroup = new Map();
  for (const key of Object.keys(SCHEMA)) {
    const d = describe(key);
    if (!byGroup.has(d.group)) byGroup.set(d.group, []);
    byGroup.get(d.group).push(d);
  }
  return [...byGroup].map(([group, keys]) => ({ group, keys }));
}

export default { SCHEMA, Tune, createTune, describe, groups };
