/*
 * THE PANEL (M10.0, split out of js/app.js).
 *
 * Every render* function that fills the right-hand aside: the nation panel and
 * its sixteen blocks, the county panel, and the explain rows underneath both.
 *
 * This is the file M10.2's progressive disclosure works on, and the reason the
 * split happened before it rather than after.
 */

function renderNationPanel(nid) {
  const n = Game.getNation(nid);
  if (!n) return renderPlaceholder();
  const demo = Game.nationDemographics(nid);
  /*
   * WHAT KIND OF COUNTRY THIS IS. `origin` alone stopped being enough at M8: a
   * scenario's successor states are recognised by construction exactly as the
   * fifty-one were, so they carry `origin: true` and calling them former U.S.
   * states would be wrong on the one screen that says what they are.
   */
  const KIND = { successor: 'successor state', breakaway: 'declared breakaway' };
  const sub = 'Sovereign nation &middot; '
    + (KIND[n.kind] || (n.origin ? 'former U.S. state' : 'formed during play'));
  /*
   * THE GATE. It used to be "is it this nation's turn", which the human satisfied
   * fifty-one times a round; it is now "is this nation me". That one line is the
   * root of the not-fun problem the review names: while you can act as the
   * victim as well as the aggressor, an annexation is a transfer between two of
   * your own accounts and every anti-snowball device in the game is a speed bump
   * you route around by taking the other nation's turn.
   */
  const isTurn = Game.isPlayer(nid);
  const currentName = Game.playerNation()?.name || '';
  const cd = Actions.annexCooldownLeft(nid);
  const annexAttrs = cd > 0
    ? ` disabled title="Regrouping — ${cd} more world ${cd === 1 ? 'turn' : 'turns'}"`
    : '';
  const gcd = n.gov.lastChange == null ? 0
    : Math.max(0, TUNE.peek('gov.changeCooldown') - (World.getTurn() - n.gov.lastChange));
  const govAttrs = gcd > 0
    ? ` disabled title="The government changed course too recently — ${gcd} more world ${gcd === 1 ? 'turn' : 'turns'}"`
    : '';
  const rcd = Actions.releaseCooldownLeft(nid);
  const releaseAttrs = rcd > 0
    ? ` disabled title="Handover still being arranged — ${rcd} more world ${rcd === 1 ? 'turn' : 'turns'}"`
    : n.counties.size <= 1 ? ' disabled title="You cannot release your last Area"' : '';
  const actionsHtml = isTurn
    ? `<div class="actions">
        <div class="label">Actions &middot; your move</div>
        <button class="act" data-act="unite">🤝 Unite with nation</button>
        <button class="act" data-act="annex"${annexAttrs}>⚔️ Annex counties${cd > 0 ? ` <span class="act-note">regrouping ${cd}</span>` : ''}</button>
        <button class="act" data-act="trade">🚛 Trade with nation</button>
        ${Complexity.enabled('movements') ? `<button class="act" data-act="release"${releaseAttrs}>🕊️ Release counties${rcd > 0 ? ` <span class="act-note">arranging ${rcd}</span>` : ''}</button>` : ''}
        ${Complexity.enabled('politics') ? `<button class="act" data-act="govern"${govAttrs}>🗳️ Change course${gcd > 0 ? ` <span class="act-note">${gcd} turns</span>` : ''}</button>` : ''}
        <button class="act pass" data-act="pass">⏭ End turn</button>
      </div>`
    : `<div class="actions">
        <div class="label">Actions</div>
        <div class="locked-note">A rival power. You are playing <strong>${escapeHtml(currentName)}</strong>.
          <button class="linklike" id="goto-current">Go to them &rarr;</button></div>
      </div>`;
  const panel = document.getElementById('panel');
  panel.innerHTML = `
    <div class="card-head">
      ${Identity.flag(nid, 34, 23)}
      <h2>${escapeHtml(n.name)}</h2>
    </div>
    <div class="kind">${sub} &middot; ${n.counties.size} counties</div>
    ${renderLeader(nid)}

    <div class="stat"><div class="label">Population</div><div class="value">${fmtPop(demo.pop)}</div></div>
    <div class="stat"><div class="label">GDP</div><div class="value">${fmtGdp(demo.gdp)}</div></div>
    ${renderTreasury(nid)}
    ${renderAuthority(nid)}
    ${Complexity.enabled('politics') ? `<div class="stat">
      <div class="label">Political leaning</div>
      ${renderPolitics(demo)}
    </div>` : ''}
    ${renderNationEconomy(nid)}
    ${renderCoalition(nid)}
    ${renderElection(nid)}
    ${renderMigration(nid)}
    ${renderRecognition(nid)}
    ${renderDiplomacy(nid)}
    ${renderStanding(nid)}
    ${renderMilitary(nid)}
    ${renderVictory(nid)}
    ${renderExportAccess(nid)}

    ${actionsHtml}
    ${renderSources('nation')}
  `;
  /*
   * The three military sliders always sum to 1: moving one takes the difference
   * out of the other two in proportion, which is what `Military.allocate` does
   * anyway. Re-rendering the whole panel on every drag would fight the slider,
   * so only the numbers beside them are updated until the drag ends.
   */
  panel.querySelectorAll('.mil-set').forEach((el) => {
    const commit = () => {
      const alloc = {};
      panel.querySelectorAll('.mil-set').forEach((x) => { alloc[x.dataset.role] = Number(x.value); });
      Military.allocate(nid, alloc);
      Game.touch({ values: true });
    };
    el.addEventListener('change', commit);
  });
  panel.querySelectorAll('.act').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.hasAttribute('disabled')) return;
      if (b.dataset.act === 'pass') passTurn();
      else Actions.start(b.dataset.act, nid);
    })
  );
  const goto = panel.querySelector('#goto-current');
  if (goto) goto.onclick = () => { setMode('nations'); select('nation', you()); };
  const rec = panel.querySelector('#a-recognise');
  if (rec) rec.onclick = () => Actions.recognise(nid);
  const tre = panel.querySelector('#a-treaty');
  if (tre) tre.onclick = () => Actions.treaty(nid);
  const aid = panel.querySelector('#a-aid');
  if (aid) aid.onclick = () => Actions.aid(nid);
  /*
   * ...and fold it (M10.2). LAST, after every listener is bound, because the
   * transform moves nodes into a detail wrapper and a handler attached to a
   * node is unaffected by where the node ends up — but one attached by a
   * selector run afterwards would not find it.
   */
  if (typeof Disclosure !== 'undefined') Disclosure.apply(panel, nid);
}
function renderLeader(nid) {
  if (typeof Leaders === 'undefined' || !Leaders.loaded() || !Complexity.enabled('politics')) return '';
  const l = Leaders.of(nid, store.rng, TUNE);
  if (!l) return '';
  const traits = Leaders.traits(nid);
  const years = World.getTurn() - l.since;
  return `
    <div class="leader">
      <div class="leader-name">${escapeHtml(l.title)} <strong>${escapeHtml(l.name)}</strong>
        <span class="leader-since">${years <= 0 ? 'newly in office'
          : `${years} ${years === 1 ? 'quarter' : 'quarters'} in office`}</span></div>
      <div class="leader-traits">${traits.map((tr) =>
        `<span class="trait" title="${escapeHtml(tr.blurb || '')}">${escapeHtml(tr.name)}</span>`).join('')}</div>
      ${traits.length ? `<div class="leader-blurb">${escapeHtml(traits[0].blurb || '')}</div>` : ''}
    </div>`;
}

/*
 * A CRISIS, and the first thing in this game that asks the player a question.
 *
 * Two or three options, each with a real cost, and no option that is simply
 * correct — buy the grain and pay for it, ration it and pay in liberties, or do
 * nothing and pay in sentiment. An option that is strictly best is a button, and
 * a button is not a decision.
 *
 * The effects are shown BEFORE the choice, in the same plain terms the panel
 * uses everywhere else, because a decision made without knowing the price is a
 * guess. What is not shown is which one the game thinks you should take.
 */
function showCrisis() {
  const q = Events.waiting();
  if (!q) return false;
  const n = Game.getNation(q.nid);
  if (!n) return false;
  const el = document.getElementById('endscreen');
  const card = el.querySelector('.end-card');
  const label = {
    treasuryShare: 'Treasury', authority: 'Authority', influence: 'Influence',
    qol: 'Quality of life', liberties: 'Civil liberties', weariness: 'War weariness',
    sentiment: 'Separatist feeling', standing: 'How the neighbours see you',
  };
  // Two of these are bad when they rise, so the colour follows the MEANING and
  // not the sign — a green "+4% war weariness" would be a lie in a tooltip.
  const worseWhenUp = { weariness: true, sentiment: true };
  const fx = (effects) => Object.entries(effects || {}).map(([k, v]) => {
    const good = worseWhenUp[k] ? v < 0 : v > 0;
    const shown = k === 'treasuryShare'
      ? `${v > 0 ? '+' : '\u2212'}${Math.abs(Math.round(v * 100))}% of a year's income`
      : `${v > 0 ? '+' : '\u2212'}${Math.abs(v * 100).toFixed(1)}`;
    return `<span class="fx ${good ? 'good' : 'bad'}">${escapeHtml(label[k] || k)} ${shown}</span>`;
  }).join(' ');

  card.innerHTML = `
    <div class="end-kicker">World turn ${World.getTurn()}</div>
    <h2><span class="dot" style="background:${n.color}"></span>${escapeHtml(q.event.title)}</h2>
    <p class="end-sub">${escapeHtml(String(q.event.text || '').replace(/\{NATION\}/g, n.name))}</p>
    <div class="crisis-opts">
      ${q.event.options.map((o, i) => `
        <button class="crisis-opt" data-i="${i}">
          <span class="co-label">${escapeHtml(o.label)}</span>
          ${o.note ? `<span class="co-note">${escapeHtml(o.note)}</span>` : ''}
          <span class="co-fx">${fx(o.effects)}</span>
        </button>`).join('')}
    </div>`;
  el.classList.add('show');
  card.querySelectorAll('.crisis-opt').forEach((b) => {
    b.onclick = () => {
      const opt = q.event.options[Number(b.dataset.i)];
      el.classList.remove('show');
      const res = Events.answer(opt.label, TUNE);
      if (res) flash(`\u{1F4DC} <strong>${escapeHtml(q.event.title)}</strong> \u2014 ${escapeHtml(opt.label)}.`, '');
      Leaderboard.refresh();
      renderTurnBanner();
      setMode('nations');
      select('nation', q.nid);
    };
  });
  return true;
}

/*
 * WHO IS LINED UP AGAINST THIS NATION.
 *
 * Named, because that is the difference between a coalition and a tier: "Idaho,
 * Nevada and Oregon, and here is what you did to them" is a situation a player
 * can act on, where "you are in the top 10%" is a fact about a leaderboard.
 * Shown on any nation's card, so you can see a rival being surrounded too — that
 * is a real piece of information about who is about to have a bad decade.
 */
function renderCoalition(nid) {
  if (typeof Coalitions === 'undefined' || !Complexity.enabled('politics')) return '';
  const rec = Coalitions.against(nid, TUNE);
  if (!rec || !rec.formed) return '';
  const flow = Game.treasuryFlow(nid);
  const rows = rec.members.slice(0, 5).map((m) => `
    <div class="rel-row"><span class="lbl">${escapeHtml(m.name)}</span>
      <span class="when">${escapeHtml(m.why)} ${Game.isPlayer(nid) ? 'you' : 'them'}</span>
      <span class="num bad">${Math.round(m.weight * 100)}%</span>
    </div>`).join('');
  return `
    <div class="stat rel coal">
      <div class="label">Aligned against ${Game.isPlayer(nid) ? 'you' : 'them'}
        &middot; ${Math.round(rec.pressure * 100)}% pressure</div>
      <div class="rel-band bad">${escapeHtml(rec.summary)}</div>
      ${rows}
      <div class="vic-note">Threat ${Math.round(rec.threat * 1000) / 10}
        &mdash; ${Math.round(rec.share * 100)}% of the continent at
        ${Math.round(rec.influence * 100)}% Influence. Encirclement is costing
        <strong>${fmtGdp(flow.encirclement || 0)}</strong> a turn, and their border armies
        stand in the way of anything ${Game.isPlayer(nid) ? 'you' : 'they'} try to take.</div>
    </div>`;
}

/*
 * THE NEXT ELECTION, AND WHAT THE POLLS SAY.
 *
 * The share the government would take if the vote were held today, and the
 * swing that made it that number rather than the raw popular share — which is
 * the difference between "your people disagree with you" and "your people
 * disagree with you and will vote you out over it".
 */
function renderElection(nid) {
  if (typeof Elections === 'undefined' || !Complexity.enabled('politics')) return '';
  const res = Elections.poll(nid, TUNE);
  if (!res) return '';
  const turns = Elections.nextFor(nid, TUNE);
  const rows = res.terms.filter((t) => Math.abs(t.contribution) > 0.005).slice(0, 3).map((t) => `
    <div class="rel-row"><span class="lbl">${escapeHtml(t.label)}</span>
      <span class="when">${escapeHtml(t.note || '')}</span>
      <span class="num ${t.contribution < 0 ? 'bad' : 'good'}">${t.contribution >= 0 ? '+' : ''}${t.contribution.toFixed(2)}</span>
    </div>`).join('');
  const standing = res.ranked.slice(0, 3).map((r) => `
    <div class="rel-row"><span class="lbl">${escapeHtml(r.name)}${r.incumbent ? ' &middot; in office' : ''}</span>
      <span class="num ${r.incumbent ? (res.change ? 'bad' : 'good') : ''}">${Math.round(r.share * 100)}%</span>
    </div>`).join('');
  return `
    <div class="stat rel">
      <div class="label">Election &middot; ${turns === 0 ? 'today' : `in ${turns} ${turns === 1 ? 'turn' : 'turns'}`}</div>
      <div class="rel-band ${res.change ? 'bad' : 'good'}">${escapeHtml(res.summary)}</div>
      ${standing}
      ${rows}
      ${res.change && Elections.canSteal(nid, TUNE)
        ? `<div class="vic-note">Civil liberties here are low enough that the result could be set
           aside, at the cost of ${Math.round(TUNE.get('election.stealLibertiesHit') * 100)} more points of them.</div>`
        : ''}
    </div>`;
}

/*
 * WHO ARRIVED AND WHO LEFT.
 *
 * The net figure leads, because that is the one that answers "is this a place
 * people want to live", and the two lists under it are why it is that number.
 * Cross-border flows are named and internal movement is one line: within a
 * nation people shuffling one county over is the common case and not news,
 * while ten thousand people leaving for Nevada is something you did.
 */
function renderMigration(nid) {
  if (typeof Migration === 'undefined' || !Complexity.enabled('movements')) return '';
  const r = Migration.report(nid);
  if (!r || (!r.net && !r.left && !r.came)) return '';
  const sign = (v) => (v >= 0 ? '+' : '\u2212') + fmtPop(Math.abs(v));
  const row = (x, dir) => `
    <div class="rel-row"><span class="lbl">${escapeHtml(x.name)}</span>
      <span class="when">${dir}</span>
      <span class="num ${dir === 'arrived from' ? 'good' : 'bad'}">${fmtPop(x.people)}</span>
    </div>`;
  const rows = r.into.slice(0, 2).map((x) => row(x, 'arrived from'))
    .concat(r.out.slice(0, 2).map((x) => row(x, 'left for'))).join('');
  return `
    <div class="stat rel">
      <div class="label">Migration &middot; last turn</div>
      <div class="rel-band ${r.net > 0 ? 'good' : r.net < 0 ? 'bad' : ''}">${sign(r.net)} people</div>
      ${rows}
      ${r.internal > 1 ? `<div class="vic-note">Another <strong>${fmtPop(r.internal)}</strong> moved between
        Areas inside ${Game.isPlayer(nid) ? 'your own' : 'their own'} borders — churn that cancels in the
        figure above and sorts the map underneath it.</div>` : ''}
    </div>`;
}

/*
 * WHETHER ANYBODY ADMITS THEY EXIST.
 *
 * Only ever drawn for a nation founded during play: the fifty-one the game opens
 * with are recognised by construction, and a row reading "100%" on every card
 * from turn 0 teaches the player that the number does not mean anything.
 *
 * On a rival's card it carries the button, because that is where the question
 * actually comes up — you are looking at a two-turn-old republic wondering
 * whether to deal with it. On your own it is the scoreboard of who still will
 * not, worst first, which is the list you work through.
 */
function renderRecognition(nid) {
  if (typeof Recognition === 'undefined' || !Complexity.enabled('politics')) return '';
  const rec = Recognition.legitimacy(nid, TUNE);
  if (!rec || rec.origin) return '';
  const me = you();
  const mine = me && me !== nid ? Recognition.recognises(me, nid) : null;
  const band = rec.value >= 0.6 ? 'good' : rec.value >= 0.3 ? '' : 'bad';
  const rows = rec.refused.slice(0, 4).map((r) => `
    <div class="rel-row"><span class="lbl">${escapeHtml(r.name)}</span>
      <span class="when">${r.nid === rec.parent ? 'calls it a rebellion' : 'will not deal'}</span>
      <span class="num bad">${Math.round(r.share * 100)}%</span>
    </div>`).join('');
  const rate = Recognition.marketRate(nid, TUNE);
  const cost = rate < 0.999
    ? `<div class="vic-note">Export income is cut to <strong>${Math.round(rate * 100)}%</strong> of the going
       rate, no neighbour will sign a bilateral deal, and no coalition will take them in.</div>`
    : '';
  const btn = mine === false
    ? `<div class="btn-row"><button class="btn go" id="a-recognise">\u{1F91D} Recognise ${escapeHtml(Game.getNation(nid).name)}</button></div>`
    : mine === true ? '<div class="vic-note">You recognise them.</div>' : '';
  return `
    <div class="stat rel">
      <div class="label">Recognition &middot; ${Math.round(rec.value * 100)}% of the continent</div>
      <div class="rel-band ${band}">${escapeHtml(rec.summary)}</div>
      ${rows}
      ${cost}
      ${btn}
    </div>`;
}

/*
 * WHAT THEY REMEMBER.
 *
 * On a rival's card, how THEY see YOU and why — which is the question a player
 * actually has in front of a neighbour they are thinking about. On your own
 * card, who resents you most, which is the same list read the other way and is
 * the one that tells you where the trouble is coming from.
 *
 * The reason is always a specific event with a date on it, because "Cold" on its
 * own is a mood and "took our ground, 4 turns ago" is something you did.
 */
/*
 * WHAT YOU HAVE PROMISED THEM, AND WHAT YOU HAVE PAID THEM (M11.2).
 *
 * On the RIVAL's card rather than behind a target-picking flow, for the same
 * reason recognition is: both of these are things you do to one named country,
 * and the country is already on the screen. Unite and trade need a picker
 * because the question is who; these two are asked about somebody in
 * particular.
 */
function renderDiplomacy(nid) {
  const me = Game.getPlayer();
  if (!me || me === nid || typeof Pacts === 'undefined' || !Complexity.enabled('politics')) return '';
  const them = Game.getNation(nid);
  if (!them) return '';

  const pact = Pacts.live(me, nid);
  const patron = Pacts.patronOf(nid);
  const mine = patron && patron.nid === me;
  const treaty = Moves.plan({ type: 'treaty', nid: me, target: nid, kind: 'nonaggression' });
  const aid = Moves.plan({ type: 'aid', nid: me, target: nid });

  const pactLine = pact
    ? `<div class="geo-row"><span>Standing ${escapeHtml(Pacts.LABEL[pact.kind])}</span>
        <strong class="surplus">since turn ${pact.since}</strong></div>`
    : `<div class="geo-row"><span>No pact</span><strong>&mdash;</strong></div>`;

  /*
   * Who is buying their politics, named. A rival's patron is a fact the player
   * should be able to read off the board — it is the difference between a
   * neighbour drifting toward you and a neighbour being paid to drift away.
   */
  const patronLine = patron
    ? `<div class="geo-row"><span>${mine ? 'You are funding them' : 'Funded by '
        + escapeHtml(Game.getNation(patron.nid) ? Game.getNation(patron.nid).name : patron.nid)}</span>
        <strong class="${mine ? 'surplus' : 'deficit'}">${Math.round(patron.weight * 100)}% of their politics</strong></div>`
    : '';

  const breaches = Pacts.breachesBy(nid, TUNE).length;
  const breachLine = breaches
    ? `<div class="warn-box">\u26a0 They have torn up <strong>${breaches}</strong>
        ${breaches === 1 ? 'pact' : 'pacts'} recently. A signature from them is worth what you think it is.</div>`
    : '';

  const btn = (id, label, plan) => `<button class="btn ghost dip" id="${id}"
      ${plan.ok ? '' : 'disabled'} title="${escapeHtml(plan.ok ? '' : (plan.reason || ''))}">${label}</button>`;

  return `
    <div class="stat">
      <div class="label">Diplomacy</div>
      ${pactLine}
      ${patronLine}
      ${breachLine}
      <div class="btn-row dip-row">
        ${pact ? '' : btn('a-treaty', '\u{1F4DC} Non-aggression pact', treaty)}
        ${btn('a-aid', `\u{1F4B0} Send ${fmtGdp(aid.cost || 0)}`, aid)}
      </div>
      ${treaty.ok || pact ? '' : `<div class="locked-note">${escapeHtml(treaty.reason || '')}</div>`}
      ${aid.ok ? `<div class="locked-note">${Math.round((aid.share || 0) * 100)}% of a year of their income.
        ${mine || !patron ? 'Their politics drift toward yours while you keep paying.' : 'Enough of it, and they become yours instead.'}</div>`
    : `<div class="locked-note">${escapeHtml(aid.reason || '')}</div>`}
    </div>`;
}

function renderStanding(nid) {
  if (typeof Relations === 'undefined' || !Complexity.enabled('politics')) return '';
  const me = you();
  if (!me || !Game.getNation(me)) return '';
  if (nid !== me) {
    const r = Relations.between(nid, me, TUNE);
    const rows = r.inputs.slice(0, 3).map((i) => `
      <div class="rel-row"><span class="lbl">${escapeHtml(i.label)}</span>
        <span class="when">${i.age === 0 ? 'this turn' : `${i.age} ${i.age === 1 ? 'turn' : 'turns'} ago`}</span>
        <span class="num ${i.contribution < 0 ? 'bad' : 'good'}">${i.contribution >= 0 ? '+' : ''}${i.contribution.toFixed(2)}</span>
      </div>`).join('');
    return `
      <div class="stat rel">
        <div class="label">How they see you</div>
        <div class="rel-band ${r.value < -0.15 ? 'bad' : r.value > 0.15 ? 'good' : ''}">${escapeHtml(r.summary)}</div>
        ${rows}
      </div>`;
  }
  const worst = Relations.toward(nid, TUNE).filter((x) => Math.abs(x.value) > 0.02).slice(0, 4);
  if (!worst.length) return '';
  return `
    <div class="stat rel">
      <div class="label">How the continent sees you</div>
      ${worst.map((x) => `
        <div class="rel-row"><span class="lbl">${escapeHtml(x.name)}</span>
          <span class="num ${x.value < -0.15 ? 'bad' : x.value > 0.15 ? 'good' : ''}">${x.value >= 0 ? '+' : ''}${x.value.toFixed(2)}</span>
        </div>`).join('')}
    </div>`;
}

/*
 * WHERE YOUR ARMY POINTS.
 *
 * Three sliders and no unit counters. The readiness bar beside each is the
 * point: it lags the allocation, so the panel shows you what you HAVE as well as
 * what you have asked for, and the gap between them is the cost of having
 * changed your mind. Without showing readiness the sliders would look free.
 */
function renderMilitary(nid) {
  const p = Military.posture(nid, TUNE);
  if (!p) return '';
  const mine = Game.isPlayer(nid);
  const rows = Military.ROLES.map((r) => {
    const label = r[0].toUpperCase() + r.slice(1);
    const ready = Math.round(p.ready[r] * 100);
    const want = Math.round(p.alloc[r] * 100);
    return `
      <div class="mil-row">
        <span class="lbl">${label}</span>
        ${mine ? `<input type="range" class="mil-set" data-role="${r}" min="0" max="100" step="5" value="${want}">`
          : `<span class="bar"><i style="width:${want}%"></i></span>`}
        <span class="num">${ready}%<span class="ask">${ready === want ? '' : ` &rarr; ${want}%`}</span></span>
      </div>`;
  }).join('');
  const note = {
    garrison: 'holds your own ground down, and costs civil liberties',
    border: 'makes you expensive to attack',
    field: 'makes your own attacks land',
  };
  return `
    <div class="stat mil">
      <div class="label">Armed forces &middot; ${Math.round(p.force.manpower / 1000)}k</div>
      <div class="mil-note">${escapeHtml(p.force.summary)}. Upkeep <strong>${fmtGdp(p.upkeep)}</strong> / turn.</div>
      ${rows}
      ${mine ? `<div class="mil-note">Garrison ${escapeHtml(note.garrison)}. Border ${escapeHtml(note.border)}.
        Field ${escapeHtml(note.field)}. Readiness follows slowly &mdash; a posture is worth more than a reaction.</div>` : ''}
    </div>`;
}

/*
 * HOW CLOSE ARE YOU TO WINNING, and what is stopping you.
 *
 * Shown only on your own nation, and only for the condition you are closest to,
 * because three conditions x five terms is a wall the player would learn to skip
 * past. The one you are nearest is the one you are playing, whether or not you
 * chose it — and the shortfall line names the two requirements holding you back,
 * which is the thing that turns a score into a plan.
 */
function renderVictory(nid) {
  if (!Victory.loaded() || !Game.isPlayer(nid) || !Complexity.enabled('politics')) return '';
  const rows = Victory.progress(nid, TUNE);
  if (!rows.length) return '';
  const best = rows.reduce((a, r) => (r.progress > a.progress ? r : a), rows[0]);
  const seat = Victory.seats(nid, TUNE);
  const bars = best.terms.map((t) => `
    <div class="vic-row ${t.met ? 'met' : ''}">
      <span class="lbl">${escapeHtml(t.label)}</span>
      <span class="bar"><i style="width:${Math.round(t.progress * 100)}%"></i></span>
      <span>${fmtTerm(t.value)}</span>
    </div>`).join('');
  return `
    <div class="stat vic">
      <div class="label">Path to victory &middot; ${escapeHtml(best.label)}</div>
      ${bars}
      <div class="vic-note">${escapeHtml(best.summary)}
        ${best.id === 'reunification'
          ? ` Seats: ${seat.own} held, ${seat.aligned} aligned, of ${seat.total}.`
          : ''}</div>
    </div>`;
}

/*
 * Counties mode is a place you ACT from, not a read-only inspector.
 *
 * It used to emit no buttons at all: half of the primary Select toggle led
 * nowhere, and the one county-level verb in the game (Release) was a disabled
 * stub. An Area you hold is now something you can hand over; an Area a neighbour
 * holds tells you plainly why you can or cannot take it.
 */
/*
 * PRESSURE, per Area: every movement organising here, how fast, and how long
 * until it takes the place.
 *
 * A pressure CLOCK is a different kind of statement from a share — "breakaway in
 * ~3 turns at current trend" is something a player can act on, where "38%
 * organised" is something they have to model in their head. It is the whole
 * point of the explanation layer being predictive rather than retrospective.
 *
 * The factors come from `Sentiment.explain`, which recomputes them with the same
 * function the phase runs, so the reason shown here is the reason the model
 * used — not a second account of it.
 */
function renderPressure(fips) {
  if (!Complexity.enabled('movements')) return '';
  const c = Game.county[Game.areaIdOf(fips)];
  if (!c) return '';
  let pop = 0;
  for (let i = 0; i < c.pop.length; i++) pop += c.pop[i];
  if (pop <= 0) return '';
  const rows = Object.entries(c.mov)
    .map(([name, n]) => ({ name, share: n / pop }))
    .filter((r) => r.share >= 0.01)
    .sort((a, b) => b.share - a.share)
    .slice(0, 3);
  if (!rows.length) return '';

  const body = rows.map((r) => {
    const why = Sentiment.explain(Game.areaIdOf(fips), r.name, TUNE);
    const cl = Sentiment.clock(Game.areaIdOf(fips), r.name, TUNE);
    const badge = !cl ? ''
      : cl.turns === 0 ? '<span class="clock soon">over the line</span>'
        : cl.turns == null ? '<span class="clock never">stalling</span>'
          : `<span class="clock ${cl.turns <= 6 ? 'soon' : 'later'}">~${cl.turns} turns</span>`;
    const drivers = why && why.inputs
      ? why.inputs.filter((i) => i.contribution > 0.005)
        .sort((a, b) => b.contribution - a.contribution).slice(0, 2)
        .map((i) => escapeHtml(i.label.toLowerCase())).join(', ')
      : '';
    return `<div class="geo-row" title="${why ? escapeHtml(why.summary) : ''}">
        <span><i class="econ-dot" style="background:${Movements.colorOf(r.name)}"></i>${escapeHtml(r.name)}
          ${drivers ? `<span style="opacity:.6">&middot; ${drivers}</span>` : ''}</span>
        <strong>${(r.share * 100).toFixed(1)}%${badge}</strong></div>`;
  }).join('');

  return `<div class="stat"><div class="label">Pressure</div>${body}</div>`;
}

/*
 * WHETHER YOU COULD ACTUALLY TAKE THIS (M7.11).
 *
 * Drawn on ground the player does not hold, because that is the only place the
 * question comes up. Reach is one number and it does three things — it prices
 * the annexation, it weakens the army that fights for it, and past
 * `proj.minReach` it refuses the move outright — so all three are named here
 * rather than discovered one at a time.
 */
function renderReach(fips, ownerId) {
  if (typeof Projection === 'undefined') return '';
  const me = you();
  if (!me || !Game.getNation(me) || ownerId === me) return '';
  const why = Projection.explain(me, fips, TUNE);
  if (!why || !why.sources.length) return '';
  const band = why.inRange ? (why.value > 0.45 ? 'good' : '') : 'bad';
  return `
    <div class="stat rel">
      <div class="label">Your reach here &middot; ${Math.round(why.value * 100)}%</div>
      <div class="rel-band ${band}">${escapeHtml(why.summary)}</div>
      <div class="rel-row"><span class="lbl">Price of taking it</span>
        <span class="when">distance from ${escapeHtml(why.seats[0] || 'your capital')}</span>
        <span class="num ${why.costMultiplier > 1.5 ? 'bad' : ''}">&times;${why.costMultiplier.toFixed(2)}</span></div>
      <div class="rel-row"><span class="lbl">How the fight goes</span>
        <span class="when">an army at the end of its supply line</span>
        <span class="num ${why.warMultiplier > 1.3 ? 'bad' : ''}">&times;${why.warMultiplier.toFixed(2)}</span></div>
    </div>`;
}

/*
 * WHY ANYBODY WOULD LIVE HERE (M7.9).
 *
 * Migration happens between Areas, so this is the level it has to be explained
 * at — a nation-level number would say a place people leave is a place people
 * leave without ever saying which places or why. Read for the Area's OWN
 * majority, because "would somebody like the people already here want to stay"
 * is the question that decides whether this Area empties.
 */
function renderLivability(fips) {
  if (typeof Migration === 'undefined' || !Complexity.enabled('movements')) return '';
  const pol = Game.areaPolitics(fips);
  if (!pol || !pol.dominantId) return '';
  const why = Migration.explain(fips, pol.dominantId, TUNE);
  if (!why) return '';
  const rows = why.inputs.slice(0, 3).map((i) => `
    <div class="rel-row"><span class="lbl">${escapeHtml(i.label)}</span>
      <span class="when">${escapeHtml(i.note || '')}</span>
      <span class="num ${i.contribution < 0 ? 'bad' : 'good'}">${i.contribution >= 0 ? '+' : ''}${i.contribution.toFixed(2)}</span>
    </div>`).join('');
  return `
    <div class="stat rel">
      <div class="label">Somewhere to live &middot; ${Math.round(why.value * 100)}%</div>
      <div class="rel-band ${why.value >= 0.5 ? 'good' : why.value < 0.3 ? 'bad' : ''}">${escapeHtml(why.summary)}</div>
      ${rows}
    </div>`;
}

function renderCountyPanel(fips) {
  const rec = store.data.counties[fips];
  const ownerId = Game.getOwner(fips);
  const ownerName = Game.getNation(ownerId)?.name || 'an unknown nation';
  const members = Game.areaCounties(fips);
  const name = Game.area(fips)?.name || (rec ? rec.name : store.countyById.get(fips)?.properties.name || fips);
  const color = Game.colorForCounty(fips);
  const pol = Game.areaPolitics(fips);
  const panel = document.getElementById('panel');
  panel.innerHTML = `
    <div class="card-head">
      <span class="swatch" style="background:${color}"></span>
      <h2>${escapeHtml(name)}</h2>
    </div>
    <div class="kind">${members.length > 1 ? `Area &middot; ${members.length} counties` : 'County'} &middot; part of <span class="nation-of">${escapeHtml(ownerName)}</span></div>

    <div class="stat"><div class="label">Population</div><div class="value">${fmtPop(Game.countyPop(fips))}${estTag(rec, 'p')}</div></div>
    <div class="stat"><div class="label">GDP</div><div class="value">${fmtGdp(Game.countyGdp(fips))}${estTag(rec, 'g')}</div></div>
    ${Complexity.enabled('politics') ? `<div class="stat">
      <div class="label">Political leaning</div>
      ${renderPolitics(pol, rec)}
    </div>` : ''}
    ${renderLivability(fips)}
    ${renderReach(fips, ownerId)}
    ${renderPressure(fips)}
    ${renderAreaActions(fips, ownerId)}
    ${renderEconomy(fips)}
    ${renderCulture(fips)}
    ${renderGeography(fips)}
    ${renderTrade(fips)}
    ${renderNeighbors(fips)}
    ${renderEstNote(rec)}
    ${renderSources('county')}
  `;
  const auto = panel.querySelector('#area-autonomy');
  if (auto) auto.onclick = () => {
    if (auto.hasAttribute('disabled')) return;
    const nid = you();
    const grant = !Game.isAutonomous(fips);
    const r = Moves.resolve({ type: 'autonomy', nid, areas: [fips], grant }, store.rng, TUNE);
    if (!r.ok) return flash(escapeHtml(r.reason), 'warn');
    flash(`${grant ? '\u{1F932}' : '\u{1F3DB}\u{FE0F}'} <strong>${escapeHtml(Game.nameForCounty(fips))}</strong> `
      + `${grant ? 'now governs itself' : 'is back under direct rule'}. `
      + `${grant ? 'Revenue' : 'Recovered'} <strong>${fmtGdp(r.forgone)}</strong> / turn.`, '');
    select('county', fips);
  };
  const rel = panel.querySelector('#area-release');
  if (rel) rel.onclick = () => { setMode('nations'); Actions.startReleaseWith(ownerId, fips); };
  const goAnnex = panel.querySelector('#area-annex');
  if (goAnnex) goAnnex.onclick = () => { setMode('nations'); Actions.start('annex', you()); };
  if (typeof Disclosure !== 'undefined') Disclosure.apply(document.getElementById('panel'), fips);
}

/* What YOU can do with this Area right now, and why not if not. */
function renderAreaActions(fips, ownerId) {
  const actor = you();
  const me = Game.getNation(actor);
  const owner = ownerId && Game.getNation(ownerId);
  // An Area with no live owner is a data problem, not an action surface.
  if (!me || !owner) return '';
  const upkeep = TUNE.peek('econ.areaUpkeep');
  const occupied = !!Game.area(fips) && !Game.isHomeGround(actor, fips);

  if (ownerId === actor) {
    const rcd = Actions.releaseCooldownLeft(actor);
    const last = me.counties.size <= 1;
    const why = last ? 'This is your last Area.'
      : rcd > 0 ? `The last handover is still being arranged &mdash; ${rcd} more world ${rcd === 1 ? 'turn' : 'turns'}.`
        : '';
    /*
     * THE THREE ANSWERS TO A RESTLESS AREA, side by side, because the choice
     * between them is the decision: garrison it (elsewhere, on the nation
     * panel), let it govern itself, or let it go. Autonomy is the reversible
     * one, which is why it is a toggle here rather than a one-way button.
     */
    const auto = Game.isAutonomous(fips);
    const plan = Moves.plan({ type: 'autonomy', nid: actor, areas: [fips], grant: !auto }, TUNE);
    const valveHtml = Complexity.enabled('movements') ? `
      <button class="act" id="area-autonomy" ${plan.ok ? '' : 'disabled'}>
        ${auto ? '🏛️ Take back direct rule' : '🤲 Grant self-rule'}</button>
      ${plan.ok ? '' : `<div class="locked-note">${escapeHtml(plan.reason)}</div>`}
      <button class="act" id="area-release" ${why ? 'disabled' : ''}>🕊️ Release this Area</button>
      ${why ? `<div class="locked-note">${why}</div>` : ''}
    ` : '';
    return `<div class="actions">
      <div class="label">Yours &middot; ${escapeHtml(me.name)}${auto ? ' &middot; governs itself' : ''}</div>
      <div class="geo-row"><span>Upkeep${occupied ? ' &middot; occupied ground' : ''}</span>
        <strong class="deficit">${fmtGdp(-upkeep)} / turn</strong></div>
      ${valveHtml}
    </div>`;
  }

  // Someone else's. Say plainly whether it is takeable.
  const neighbours = Game.countyNeighbors(fips);
  const adjacent = neighbours.some((nb) => Game.getOwner(nb) === actor);
  const factor = TUNE.peek('annex.strongNeighbourFactor');
  // The rule itself comes from Moves (M9.3), so the tooltip cannot disagree
  // with the refusal the player gets when they click.
  const tooStrong = Moves.tooStrongToAnnex(actor, ownerId);
  const acd = Actions.annexCooldownLeft(actor);
  const reason = !adjacent ? 'It does not border you.'
    : tooStrong ? `${escapeHtml(Game.getNation(ownerId).name)} is more than ${factor}&times; your size on both population and GDP.`
      : acd > 0 ? `Your armies are regrouping &mdash; ${acd} more world ${acd === 1 ? 'turn' : 'turns'}.`
        : '';
  return `<div class="actions">
    <div class="label">Not yours &middot; ${escapeHtml(owner.name)}</div>
    <button class="act" id="area-annex" ${reason ? 'disabled' : ''}>⚔️ Annex from here</button>
    ${reason ? `<div class="locked-note">${reason}</div>` : ''}
  </div>`;
}

/* treasury: spendable balance, ticked each world turn (income − maintenance) */
function renderTreasury(nid) {
  const n = Game.getNation(nid);
  const flow = Game.treasuryFlow(nid);
  if (!n || !flow) return '';
  const sign = (v) => `<strong class="${v >= 0 ? 'surplus' : 'deficit'}">${v >= 0 ? '+' : ''}${fmtGdp(v)}</strong>`;
  const bal = fmtGdp(n.treasury);
  // Occupation is broken out because it is the anti-snowball brake the player
  // most needs to see: it climbs superlinearly with foreign ground held.
  const occ = flow.occupied
    ? `<div class="geo-row"><span>Occupation &middot; ${flow.occupied} foreign ${flow.occupied === 1 ? 'Area' : 'Areas'}</span>
        <strong class="deficit">&minus;${fmtGdp(flow.occupation)}</strong></div>`
    : '';
  return `<div class="stat"><div class="label">Treasury &middot; ${escapeHtml(n.gov.type)}</div>
    <div class="value">${bal}</div>
    <div class="geo-row"><span>Per turn (income &minus; maintenance)</span>${sign(flow.delta)}</div>
    <div class="geo-row"><span>Income ${fmtGdp(flow.income)} &middot; administration ${fmtGdp(flow.administration)}</span></div>
    ${occ}
  </div>`;
}

/*
 * Authority, rendered straight from its Why record.
 *
 * NOTHING IS RECOMPUTED HERE. Every number on screen — the value, each term's
 * raw input, its weight, its contribution — is read out of the record the power
 * phase already produced. That is the whole return on the Why-record convention:
 * the explanation is a by-product of the calculation rather than a second,
 * drifting implementation of it. When M5 builds the dashboard it renders the
 * same array, and the `key` on each row is the slider that moves it.
 *
 * Terms are shown largest-effect-first and near-zero ones are dropped, because a
 * list of eight rows where six read 0.000 hides the two that matter.
 */
function renderAuthority(nid) {
  const n = Game.getNation(nid);
  if (!n || !n.why) return '';
  // Authority, Influence and Civil liberties are political-standing stocks —
  // hidden in Economy mode along with the rest of that layer. Quality of life
  // and war weariness stay: they're economic/war-cost signals, not politics.
  return (Complexity.enabled('politics')
    ? renderWhy('Authority', n.why.authority) + renderWhy('Influence', n.why.influence)
    : '')
    + renderWhy('Quality of life', n.why.qol)
    + (Complexity.enabled('politics') ? renderWhy('Civil liberties', n.why.liberties) : '')
    /*
     * The fifth stock, and shown only when there is something to show: a nation
     * at peace has no war weariness, and a row that reads 0% every turn for the
     * forty turns before anybody fights teaches a player to stop looking at it.
     */
    + ((n.why.weariness && n.why.weariness.value > 0.02)
      ? renderWhy('War weariness', n.why.weariness) : '');
}

/** One renderer for every power stock, so no two can drift apart on screen. */
function renderWhy(label, why) {
  if (!why) return '';
  const pct = (why.value * 100).toFixed(0);
  const drift = why.target - why.value;
  // Where the stock is heading, when it is not there yet. Rate-limiting means a
  // nation can be visibly on its way up or down for a dozen turns, and that
  // trajectory is more useful to a player than the instantaneous number.
  const arrow = Math.abs(drift) < 0.005 ? ''
    : ` <span class="auth-drift ${drift > 0 ? 'up' : 'down'}">${drift > 0 ? '\u2191' : '\u2193'} heading for ${(why.target * 100).toFixed(0)}%</span>`;

  const rows = why.inputs
    .filter((i) => Math.abs(i.contribution) >= 0.002)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .map((i) => {
      const c = (i.contribution >= 0 ? '+' : '\u2212') + Math.abs(i.contribution * 100).toFixed(1);
      return `<div class="geo-row" title="${escapeHtml(i.note || '')} \u00b7 ${escapeHtml(i.key)}">
        <span>${escapeHtml(i.label)}</span>
        <strong class="${i.contribution >= 0 ? 'surplus' : 'deficit'}">${c}</strong></div>`;
    })
    .join('');

  // The label explains itself on hover, from the same text the Objectives
  // reference prints (M10.3) — one source, two surfaces.
  const doc = typeof Objectives !== 'undefined' ? Objectives.stockDoc(label) : '';
  return `<div class="stat">
    <div class="label"${doc ? ` title="${escapeHtml(doc)}"` : ''}>${escapeHtml(label)}</div>
    <div class="value">${pct}%${arrow}</div>
    <div class="auth-bar ${label.split(' ')[0].toLowerCase()}"><span style="width:${pct}%"></span></div>
    <div class="auth-summary">${escapeHtml(why.summary)}</div>
    ${rows}
  </div>`;
}

/* nation economy: sum of Area production minus internal consumption. Each Area
   demands resources in a fixed mix (share of its gross output); a nation's
   per-resource surplus/deficit is production minus that demand. Display-only.
   The mix itself is TUNE 'market.demandShare' — it used to be a const declared
   HERE, in the renderer, and read by market.js, which worked only because of
   script order. */
function renderNationEconomy(nid) {
  const e = MapModes.getEconomy();
  if (!e) return '';
  // Straight from the market's own model, so the panel and the trade screens
  // cannot disagree about what a nation produces.
  const ns = Market.nationSurplus(nid, TUNE);
  if (!ns) return '';
  const { gross, surplus } = ns;
  if (!gross) return '';
  // Demand shares sum to 1.0, so a nation's surpluses and deficits net to zero
  // by construction. The meaningful headline is what it has SPARE to sell,
  // valued at market prices - which is exactly what the trade screens move.
  const prices = Market.getPrices();
  const exportable = surplus.reduce(
    (t, d, i) => t + (d > 0 ? d * (prices ? prices[i] / 100 : 1) : 0), 0);
  const rows = e.sectors
    .map((s, i) => ({ s, i, d: surplus[i] }))
    .sort((x, y) => y.d - x.d)
    .map(({ s, i, d }) => `<div class="geo-row"><span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[i]}"></i>${s}</span>
      <strong class="${d >= 0 ? 'surplus' : 'deficit'}">${d >= 0 ? '+' : '&minus;'}${fmtGdp(Math.abs(d) * 1e6)}</strong></div>`)
    .join('');
  return `<div class="stat"><div class="label">Economy &middot; exportable surplus at market prices${estEconomy()}</div>
    <div class="value">${fmtGdp(exportable * 1e6)}</div>
    <div class="label" style="margin-top:8px">Resource surplus / deficit</div>${rows}</div>`;
}

/* six-sector production values from the baked economy.json */
function renderEconomy(fips) {
  const e = MapModes.getEconomy();
  const a = e && e.areas[Game.areaIdOf(fips)];
  if (!a) return '';
  const rows = e.sectors
    .map((s, i) => ({ s, i, v: a.v[i] }))
    .sort((x, y) => y.v - x.v)
    .map(({ s, i, v }) => `<div class="geo-row ${i === a.d ? 'econ-dom' : ''}">
      <span><i class="econ-dot" style="background:${MapModes.ECON_COLORS[i]}"></i>${s}</span>
      <strong>${fmtGdp(v * 1e6)}</strong></div>`)
    .join('');
  return `<div class="stat"><div class="label">Economy &middot; dominant: ${escapeHtml(e.sectors[a.d])}${estEconomy()}</div>${rows}</div>`;
}

/* geography tiers from the published editor map mode */
/* cultural tiers for a county: sub-region / region / super-region, each with the
   aggregated pop, GDP and lean of every area that shares that cultural node */
function renderCulture(fips) {
  const c = MapModes.getCulture();
  if (!c) return '';
  const path = c.def.assign[Game.areaIdOf(fips)];
  if (!path || !path.length) return '';
  const tiers = [
    { label: 'Sub-region', id: path[2] },
    { label: 'Region', id: path[1] },
    { label: 'Super region', id: path[0] },
  ].filter((t) => t.id);
  const rows = tiers.map((t) => {
    const d = Game.demographics(cultureMembers(t.id));
    let first = 0, second = 0;
    for (const s of d.shares) { if (s > first) { second = first; first = s; } else if (s > second) second = s; }
    const lead = d.dominant >= 0 ? `${Ideology.byIndex(d.dominant).short}+${(first - second).toFixed(0)}` : '—';
    return `<div class="cult-row"><span class="cult-sw" style="background:${c.colorByNode[t.id]}"></span>
      <span class="cult-name"><em>${t.label}</em> ${escapeHtml(c.names[t.id])}</span>
      <span class="cult-fig">${fmtPop(d.pop)} &middot; ${fmtGdp(d.gdp)} &middot; <b style="color:${d.dominant >= 0 ? Ideology.colorAt(d.dominant) : 'inherit'}">${lead}</b></span></div>`;
  }).join('');
  return `<div class="stat"><div class="label">Cultural region</div>${rows}</div>`;
}

function renderGeography(fips) {
  const r = MapModes.getRegion();
  if (!r) return '';
  const p = r.def.assign[Game.areaIdOf(fips)] || [];
  const row = (label, id) => `<div class="geo-row"><span>${label}</span><strong>${id ? escapeHtml(r.names[id]) : '&mdash;'}</strong></div>`;
  return `<div class="stat"><div class="label">Geography</div>
    ${row('Super region', p[0])}${row('Region', p[1])}${row('Area', p[2])}</div>`;
}

function renderExportAccess(nid) {
  if (!store.transport && !store.trade) return '';
  const acc = nationExportAccess(nid);
  const bits = [];
  if (acc.ports) bits.push(`${acc.ports} ${acc.ports === 1 ? 'port' : 'ports'}`);
  if (acc.canada) bits.push(`Canada &times;${acc.canada}`);
  if (acc.mexico) bits.push(`Mexico &times;${acc.mexico}`);
  const line = acc.any
    ? `&#127758; International market access: ${bits.join(' &middot; ')}`
    : '&#9940; Landlocked &mdash; no export points (no port or border gateway)';
  const cap = nationTradeCapacity(nid);
  return `<div class="stat"><div class="label">Export access</div>
    <div class="trade-chips"><span class="chip">${line}</span></div>
    <div class="geo-row"><span>Trade capacity &middot; ${cap.ports} ports, ${cap.railHubs} rail hubs, ${cap.gateways} gateways</span>
      <strong>${fmtGdp(cap.total * 1e6)} / turn</strong></div></div>`;
}

/* Export points and trade capacity are MODEL quantities — they decide what an
   action can do — so they live in Game, which owns the baked trade/transport
   data. These are the renderer's shorthand. */
const areaExport = (fips) => Game.areaExport(fips);
const nationExportAccess = (nid) => Game.exportAccess(nid);
const nationTradeCapacity = (nid) => Game.tradeCapacity(nid);

// best transport corridor across the border between two nations: rail > highway
function transitLink(fromNid, throughNid) {
  const x = store.transport;
  if (!x) return null;
  const rail = (aid) => Game.areaCounties(aid).some((m) => x.counties[m] && x.counties[m].rail);
  const hwy = (aid) => Game.areaCounties(aid).some((m) => x.counties[m] && (x.counties[m].interstates || []).length);
  let highway = false;
  for (const aid of Game.getNation(fromNid).counties) {
    const r = rail(aid), h = hwy(aid);
    if (!r && !h) continue;
    for (const nb of Game.countyNeighbors(aid)) {
      if (Game.getOwner(nb) !== throughNid) continue;
      if (r && rail(nb)) return 'rail'; // best possible link
      if (h && hwy(nb)) highway = true;
    }
  }
  return highway ? 'highway' : null;
}

/* trade attributes from the offline-baked county_trade.json */
function renderTrade(fips) {
  const t = store.trade;
  if (!t || !t.counties) return '';
  // union the trade attributes across the Area's member counties
  const allMembers = Game.areaCounties(fips);
  const members = allMembers.filter((m) => t.counties[m]);
  const any = (k) => members.some((m) => t.counties[m][k]);
  const chips = [];
  if (any('has_port')) chips.push('&#9875; Port');
  if (any('coastal')) chips.push('&#127754; Coastal');
  if (any('great_lakes')) chips.push('&#127756; Great Lakes');
  const bc = members.filter((m) => t.counties[m].border_crossing);
  if (bc.length) chips.push(`&#128678; Border crossing &mdash; ${bc.map((m) => escapeHtml(t.border_crossing_labels[m] || '')).join('; ')}`);
  const cp = members.filter((m) => t.counties[m].choke_point);
  if (cp.length) chips.push(`&#9888;&#65039; Choke point &mdash; ${cp.map((m) => escapeHtml(t.choke_point_labels[m] || '')).join('; ')}`);
  const corridors = Object.keys(t.corridors).filter((k) => members.some((m) => t.corridors[k].includes(m)));
  if (corridors.length) chips.push(`&#128739; Corridor: ${corridors.map(escapeHtml).join(', ')}`);
  const x = store.transport;
  if (x) {
    const recs = allMembers.map((m) => x.counties[m]).filter(Boolean);
    if (recs.some((r) => r.rail_hub)) chips.push('&#128649; Rail hub');
    else if (recs.some((r) => r.rail)) chips.push('&#128642; Rail line');
    const hwys = [...new Set(recs.flatMap((r) => r.interstates || []))].sort();
    if (hwys.length) chips.push(`&#128664; ${hwys.map(escapeHtml).join(' &middot; ')}`);
  }
  const ex = areaExport(fips);
  if (ex.port || ex.canada || ex.mexico) {
    const via = [ex.port && 'port', ex.canada && 'Canada', ex.mexico && 'Mexico'].filter(Boolean).join(', ');
    chips.push(`&#128230; Export point &mdash; via ${via}`);
  }
  const rivers = [...new Set(members.flatMap((m) => t.counties[m].rivers))].sort();
  const riversHtml = rivers.length ? `<div class="trade-rivers">Waterways: ${rivers.map(escapeHtml).join(', ')}</div>` : '';
  if (!chips.length && !rivers.length) return '';
  return `<div class="stat"><div class="label">Trade</div>
    <div class="trade-chips">${chips.map((c) => `<span class="chip">${c}</span>`).join('')}</div>${riversHtml}</div>`;
}

/* neighbors from the Census County Adjacency File */
function renderNeighbors(fips) {
  const members = new Set(Game.areaCounties(fips));
  const list = [...new Set([...members].flatMap((m) => (store.neighbors && store.neighbors[m]) || []))]
    .filter((f) => !members.has(f));
  const label = `<div class="label">Neighbors &middot; Census adjacency &middot; ${list.length}</div>`;
  if (!list.length) return `<div class="stat">${label}<div class="neighbors-list muted">— none on file for this unit</div></div>`;
  const names = list.map((f) => escapeHtml(store.data.counties[f]?.name || f));
  return `<div class="stat">${label}<div class="neighbors-list">${names.join(', ')}</div></div>`;
}

/* small "est." badge shown next to an estimated field */
/*
 * THE INDUSTRY SPLIT IS AN ESTIMATE, EVERYWHERE IT APPEARS (Addendum A s4; D165).
 *
 * A county's total output is real. The six-way split of it into sectors is
 * not: it comes from six hand-authored templates assigned by a rule of thumb,
 * and a little over half the map shares one of them. DESIGN.md's first
 * principle is that a grounded estimate is flagged in the UI, and until the
 * split is re-baked from real county-industry data this badge is what keeps
 * the screen honest about it. Unconditional, because it is true of every Area.
 */
function estEconomy() {
  return ' <span class="est-tag" title="The split of output across the six sectors is an authored estimate, not a measured figure. The total is real.">est.</span>';
}

function estTag(rec, ch) {
  if (!rec || !rec.est || !rec.est.includes(ch)) return '';
  return ' <span class="est-tag" title="Best estimate — see note below">est.</span>';
}

function renderEstNote(rec) {
  if (!rec || !rec.est) return '';
  const notes = [];
  if (rec.est.includes('v'))
    notes.push('Political leaning uses the 2024 <em>statewide</em> result &mdash; Alaska reports the presidential vote by house district, not by borough.');
  if (rec.est.includes('g'))
    notes.push('GDP is apportioned by population from the official combined-area / state total (not reported separately by the BEA).');
  if (rec.est.includes('p')) notes.push('Population is estimated.');
  return `<div class="est-note"><strong>est.</strong> = best estimate. ${notes.join(' ')}</div>`;
}

/*
 * The political composition of a scope, as a stacked bar over the six
 * ideologies plus the organised movements inside them.
 *
 * `obj` is anything with `shares` and `dominant` — a demographics object from
 * Game.demographics, or an Area's own from Game.areaPolitics.
 *
 * WHAT THIS REPLACED. A D/R/Other bar with a tail of named parties, and a
 * "leading colour BLOC" computed from a hard-coded dict that covered 6 of 16
 * baked parties and pooled the other 10 into one "Yellow Coalition". A coalition
 * is now just proximity on the two axes, so it needs no table: the parenthetical
 * beside the leader names whoever is close enough to work with them.
 */
function renderPolitics(obj, estRec) {
  if (!obj || !obj.shares || obj.dominant < 0) {
    return `<div class="value small">No political data</div>`;
  }
  const shares = obj.shares;
  const rows = Ideology.all()
    .map((x, i) => ({ x, i, pct: shares[i] || 0 }))
    .filter((r) => r.pct >= 0.05)
    .sort((a, b) => b.pct - a.pct);

  const lead = rows[0];
  const second = rows[1];
  const margin = (lead.pct - (second ? second.pct : 0)).toFixed(1);

  /*
   * Who would work with the leader: everyone within `war.splinterAffinity` of it
   * on the two axes. This is the "coalition" the old colour-family dict was
   * hand-authoring, derived instead from the two numbers each ideology already
   * carries.
   */
  const threshold = TUNE.peek('war.splinterAffinity');
  const allies = rows.filter((r) => r.i !== lead.i && Ideology.affinity(r.i, lead.i) >= threshold);
  const blocPct = lead.pct + allies.reduce((t, r) => t + r.pct, 0);
  const winner = `<span class="pill" style="background:${lead.x.color}">${escapeHtml(lead.x.name)} +${margin}</span>`;
  const coalition = allies.length
    ? ` &middot; with <strong>${escapeHtml(allies.map((r) => r.x.short).join(', '))}</strong> that is ${blocPct.toFixed(1)}%`
    : '';

  const bars = rows
    .map((r) => `<span style="width:${r.pct}%;background:${r.x.color}" title="${escapeHtml(r.x.name)} ${r.pct.toFixed(1)}%"></span>`)
    .join('');
  const legend = rows
    .map((r) => `<span class="k custom" style="--kc:${r.x.color}">${escapeHtml(r.x.name)} ${r.pct.toFixed(1)}%</span>`)
    .join('');

  /*
   * Organised movements, named, inside the ideology they belong to — and their
   * STATE, which is the one thing a player needs in order to see a secession
   * coming rather than being told about it after the fact. A movement at 12%
   * that has taken its whole core is a different situation from one at 30% that
   * has not, and the percentage alone cannot say which.
   */
  const movs = Object.entries(obj.movementPct || obj.movements || {})
    .filter(([, v]) => v >= 0.05)
    .sort((a, b) => b[1] - a[1]);
  const movHtml = movs.length
    ? `<div class="mov-line"><span class="label-inline">Organised movements</span>${movs
        .map(([name, v]) => {
          const rec = Movements.get(name);
          const st = rec && rec.state && rec.state !== 'latent'
            ? `<i class="mov-state s-${rec.state}">${rec.state}</i>` : '';
          return `<span class="k custom" style="--kc:${Movements.colorOf(name)}">`
            + `${escapeHtml(name)} ${v.toFixed(1)}%${st}</span>`;
        })
        .join('')}</div>`
    : '';

  const c = obj.centroid || { economic: 0, social: 0 };
  const axes = `<div class="axis-line">
      <span>economic <strong>${c.economic >= 0 ? 'market' : 'collective'} ${Math.abs(c.economic).toFixed(2)}</strong></span>
      <span>social <strong>${c.social >= 0 ? 'traditional' : 'liberal'} ${Math.abs(c.social).toFixed(2)}</strong></span>
    </div>`;

  return `
    <div class="vote-bar">${bars}</div>
    <div class="vote-legend">${legend}</div>
    ${movHtml}
    <div class="margin-line">Leads ${winner}${coalition}${estTag(estRec, 'v')}</div>
    ${axes}
  `;
}

function renderSources() {
  const m = store.data.meta;
  return `<div class="sources">Sources &mdash; Population: ${escapeHtml(m.population_source)}. GDP: ${escapeHtml(m.gdp_source)}. Vote: ${escapeHtml(m.election_source)}.</div>`;
}

function renderPlaceholder() {
  document.getElementById('panel').innerHTML = `
    <div class="placeholder">
      <span class="big">&#128506;</span>
      Select a <strong>nation</strong> or <strong>county</strong> on the map to see its
      population, GDP, and political leaning &mdash; then act on it.
      <br /><br />
      Toggle <strong>Nations</strong> / <strong>Counties</strong> above to choose what a click selects.
    </div>`;
}
