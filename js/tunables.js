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
    v: 3, min: 1, max: 50, step: 1, group: 'Nations',
    label: 'Minimum Areas for a new nation',
    doc: 'A contiguous breakaway chunk needs this many Areas to become its own nation. Re-derived at Area scale — 10 was written for counties (M4.3).',
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
    v: 1, min: 0, max: 20, step: 1, group: 'Annexation',
    label: 'Annex cooldown (turns)',
    doc: 'Turns a nation must wait between annexations.',
  },


  /* ---------------- release ---------------- */
  'release.budgetAreas': {
    v: 6, min: 1, max: 50, step: 1, group: 'Release',
    label: 'Release budget (Areas / turn)',
    doc: 'Areas a nation can hand over in one turn. Higher than the annex budget on purpose: giving territory away is easier than taking it, and this is the release valve an over-extended nation reaches for when occupation cost outruns income.',
  },
  'release.cooldownTurns': {
    v: 1, min: 0, max: 20, step: 1, group: 'Release',
    label: 'Release cooldown (turns)',
    doc: 'World turns between handovers, so a nation cannot dissolve itself one Area at a time inside a single round.',
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
