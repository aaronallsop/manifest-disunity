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
  'econ.occupationHostility': {
    v: 1.0, min: 0, max: 3, step: 0.05, group: 'Economy',
    label: 'Occupation hostility multiplier',
    doc: 'How strongly an Area\'s hostility scales its upkeep.',
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
  'ai.wVictory': {
    v: 1.30, min: 0, max: 4, step: 0.05, group: 'AI',
    label: 'AI: weight of closing on a victory condition',
    doc: 'How much a nation wants the ONE requirement currently holding back the victory it is nearest. The heaviest single weight, deliberately: without it the AI does not know the conditions exist and the human wins by default the moment they read the table, which is not an opponent but a scoreboard with nobody else on it. It only scores requirements a territorial move can actually shift \u2014 nothing an annexation does moves Influence, which is exactly the shape of the capstone and the reason a conqueror stalls.',
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
    v: 0.55, min: 0, max: 1, step: 0.01, group: 'Victory',
    label: 'Ideological Dominance: share of Areas holding your ideology',
    doc: 'Measured over EVERY Area on the map, not only your own: this is a victory of argument, and it is won on other people\u2019s ground. Above the 0.45 that political drift produces unaided by turn 80 - a target the map reaches on its own is a victory won by accident.',
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
