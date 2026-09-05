/*
 * THE CHROME AROUND THE MAP (M10.0, split out of js/app.js).
 *
 * The header controls, the shared modal, the transient toast, the turn banner
 * and the turn flow, the end screen, the opening edition, the newspaper and the
 * timeline. Anything that frames the map rather than drawing it or filling the
 * panel beside it.
 */

/* ------------------------------------------------------------------ */
/* controls                                                            */
/* ------------------------------------------------------------------ */
function wireControls() {
  document.querySelectorAll('.toggle button[data-mode]').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });
  document.querySelectorAll('.color-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Which map modes a tester actually uses is how you find out whether the
      // other six were worth building (M13.2).
      if (typeof Telemetry !== 'undefined') Telemetry.note('mapmode', { d: btn.dataset.color });
      setColorMode(btn.dataset.color);
    });
  });
  // New game, save, load, timeline and the editor all live behind one button
  // now (js/menu.js). The header is for the MAP; the menu is for the GAME.
  document.getElementById('btn-menu').addEventListener('click', () => Menu.open());
  // Two sentences on every map mode, from the Objectives reference (M10.3).
  if (typeof Objectives !== 'undefined') Objectives.wireTooltips();
  // county-lines toggle (off by default: merged Areas render as one shape)
  const clines = document.getElementById('btn-clines');
  clines.addEventListener('click', () => {
    const show = !clines.classList.contains('active');
    clines.classList.toggle('active', show);
    store.svg.classed('hide-clines', !show);
  });
}

function setMode(mode) {
  if (mode === store.mode || Actions.isActive()) return;
  store.mode = mode;
  // [data-mode] scoping matters: the County-lines button lives inside a .toggle
  // and has no data-mode, so an unscoped selector strips its .active class and
  // the button then lies about whether the lines are showing.
  document.querySelectorAll('.toggle button[data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
  onHoverOut();
  if (store.selected) {
    if (mode === 'nations' && store.selected.level === 'county') select('nation', Game.getOwner(store.selected.id));
    else if (mode === 'counties' && store.selected.level === 'nation') deselect();
  }
}

/*
 * THE MODAL.
 *
 * One card, one slot, shared by everything that has to stop the game and ask a
 * question: save, load, the menu, starting over. It lives here rather than
 * inside saves.js because it stopped being a save/load detail the moment a
 * second module needed to ask something.
 */
function openModal(html, opts = {}) {
  const m = document.getElementById('modal');
  m.querySelector('.modal-body').innerHTML = html;
  // `wide` is for content that is a table rather than a question (M10.1). A
  // class on the backdrop rather than on the card, so the card stays one shape
  // that CSS decides about.
  m.classList.toggle('wide', !!opts.wide);
  m.classList.add('show');
}
function closeModal() {
  document.getElementById('modal').classList.remove('show');
}
function modalIsOpen() {
  return document.getElementById('modal').classList.contains('show');
}
/*
 * IS SOMETHING ALREADY ASKING THE PLAYER A QUESTION? (M10.1)
 *
 * `#endscreen` is the blocking card: the end of the game, the crisis that stops
 * to ask, the offer to go with a breakaway. It sits above `#modal` in the stack
 * on purpose — those are decisions the game is waiting on, and a save dialog
 * over the top of one would be a save of a world in an unanswered state.
 *
 * Found by adding an Objectives item that is deliberately NOT gated on an
 * in-flight action: it could be opened underneath a waiting crisis, where it
 * rendered perfectly and could not be reached or closed.
 */
function screenBlocked() {
  const el = document.getElementById('endscreen');
  return !!el && el.classList.contains('show');
}
/* Click the backdrop, click anything marked data-close, or press Escape. */
document.addEventListener('click', (e) => {
  if (e.target.id === 'modal' || e.target.hasAttribute('data-close')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalIsOpen()) closeModal();
});

/*
 * A REFUSAL IS A PLAYTEST FINDING (M13.2), and NEWS IS NOT.
 *
 * `warn` and `bad` are the two colours this game says no in — but they are also
 * the colours it announces a scenario, an alarm and a breakaway in, and the
 * first version of this logged all of them as refusals. Three of the first
 * eleven entries in a test session were the opening edition, the party spawns
 * and the playtest notice itself, which buries the signal the log is FOR: a
 * tester who hits the same refusal four times has found something the game
 * explains badly.
 *
 * The colour cannot tell them apart, so the caller does. `{news: true}` marks
 * an announcement, and there are five of those against roughly thirty refusals
 * — which is why the flag is on the rare case.
 */
/* toast for action results */
function flash(html, kind = '', opts = {}) {
  if ((kind === 'warn' || kind === 'bad') && !opts.news && typeof Telemetry !== 'undefined') {
    Telemetry.note('refused', {
      d: String(html).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120),
    });
  }
  let el = document.getElementById('toast');
  el.className = 'toast show ' + kind;
  el.innerHTML = html;
  clearTimeout(flash._t);
  flash._t = setTimeout(() => (el.className = 'toast'), 6000);
}

/* ------------------------------------------------------------------ */
/* turns                                                               */
/* ------------------------------------------------------------------ */
/*
 * The banner answers "whose turn is it", and from M6.2 that question has one
 * answer forever: yours. The old "17/51" counter measured how far the human had
 * got through operating the entire world — a number that only meant anything
 * while that was the game.
 */
function renderTurnBanner() {
  const bar = document.getElementById('turnbar');
  const id = you() || TurnSystem.currentId();
  const n = Game.getNation(id);
  if (!n) { bar.innerHTML = ''; return; }
  const p = TurnSystem.progress();
  bar.innerHTML = `
    <span class="tb-label">Round ${p.round} &middot; ${p.total} nations</span>
    <button class="tb-current" id="tb-jump"><span class="dot" style="background:${n.color}"></span>
      You are <strong>${escapeHtml(n.name)}</strong></button>
    <span class="tb-label" title="One turn is one ${Calendar.unit(TUNE)}. The game opened in ${Calendar.label(0, TUNE)}.">
      &middot; <strong id="world-date">${Calendar.label(World.getTurn(), TUNE)}</strong>
      <span class="tb-turn">turn <span id="world-turn">${World.getTurn()}</span></span></span>
    ${store.dev ? `<button class="tb-pass" id="tb-advance" style="margin-left:0" title="Dev: pass one full round through the real turn path -- the same thing End turn does">Round +1</button>
      <label class="tb-label" title="Dev: pass N rounds, stopping when something needs you">&times; <input id="tb-ff-n" type="number" min="1" max="200" value="10" style="width:3.5em"></label>
      <button class="tb-pass" id="tb-ff" style="margin-left:0" title="Dev: fast-forward N rounds">Fast-forward &#9193;</button>` : ''}
    <button class="tb-pass" id="tb-pass">End turn &#9197;</button>`;
  document.getElementById('tb-jump').onclick = () => { if (!Actions.isActive()) { setMode('nations'); select('nation', you()); } };
  // Dev-only from M1.5: the world now advances on the round boundary, in
  // completeTurn. This button is the manual step control the M5 simulator grows
  // out of. It was the ONLY caller of World.advanceTurn, which is why a player
  // who never pressed it saw a completely static simulation.
  /*
   * THE DESYNC, and its fix (A0). This button used to call World.advanceTurn
   * directly, which moved the world clock without ending any nation's turn --
   * so `World.getTurn()` (the date) ran ahead of `TurnSystem.progress().round`
   * and the two counters in this bar disagreed forever after. The world is
   * meant to tick exactly once per completed round, inside TurnSystem.advance,
   * and there is one path that does that honestly: the one End turn takes.
   */
  const adv = document.getElementById('tb-advance');
  if (adv) adv.onclick = () => {
    if (Actions.isActive()) return flash('Finish or cancel the current action first.', 'warn');
    completeTurn();
  };
  const ff = document.getElementById('tb-ff');
  if (ff) ff.onclick = () => {
    const n = Math.max(1, Math.min(200, Number(document.getElementById('tb-ff-n').value) || 1));
    const ran = fastForward(n);
    if (ran < n) flash(`Fast-forward stopped after ${ran} of ${n} rounds \u2014 something needs you.`, 'warn');
  };
  document.getElementById('tb-pass').onclick = passTurn;
}

/*
 * Advance to the next nation after the current one has acted (or passed).
 *
 * ONE CLOCK: a completed cycle of nation turns advances the WORLD. There used to
 * be two growth models here - Game.growAll(5%) on this boundary, and the world
 * engine's own 1% that ran only when a human clicked "Advance world". A player
 * who never noticed the button played a game in which drift, party growth, GDP,
 * treasuries and the market never ran at all.
 */
/*
 * @returns {boolean} true when the round STOPPED FOR THE PLAYER — a switch or
 *   election offer, the end of the game, a crisis waiting for an answer — and
 *   false when it completed and handed the next turn back. Fast-forward (A0)
 *   reads this to know when to stop looping; nothing else needs it.
 */
function completeTurn() {
  const mark = Ledger.mark();          // everything after this is news to the player
  const beforeTurn = World.getTurn();
  const name = Game.playerNation()?.name;
  TurnSystem.advance(TUNE, store.rng); // your seat is done; the world may tick here
  /*
   * ...and now the other fifty nations take their turns, headlessly, in one
   * batch. Before M6.2 this loop did not exist because it did not need to: the
   * human WAS all fifty-one nations, which is exactly why an annexation felt
   * like a transfer between two of their own accounts rather than a risk.
   */
  const swept = AI.sweep(TUNE, store.rng);
  const won = World.getWinner();
  // The live document tracks the world at every turn boundary, not only when
  // someone presses Save. Fire and forget: a failed autosave must not stall the
  // round, and the Save button reports the server honestly when asked.
  if (World.getTurn() > beforeTurn) SaveManager.autosave();
  newspaper(mark);
  // One telemetry row per completed turn (M13.1), taken here rather than inside
  // the world tick because what a playtest is about is the PLAYER's turns.
  if (typeof Telemetry !== 'undefined') {
    Telemetry.note('turn-end', { turn: World.getTurn() });
    Telemetry.sample();
  }
  renderTurnBanner();
  /*
   * A movement broke out of your own ground: you may go with it (M6.5c).
   *
   * Offered BEFORE the defeat check, and that ordering is the feature. The case
   * the review actually names is the one where the breakaway takes everything —
   * "become the breakaway instead of going down with the parent" — and checking
   * for defeat first is precisely how you never get asked.
   */
  if (offerSwitch(mark, name)) return true;
  // ...and if the player's own government was turned out and could refuse it,
  // that is their decision and nobody else's. After the switch offer, because
  // losing an election matters less than losing the country.
  if (offerElection()) return true;
  if (swept.playerGone) {
    /*
     * The nation you were playing no longer exists. M6.4 makes this a defeat
     * screen with a verdict; saying it plainly is what M6.2 owes it, because the
     * alternative — a turn banner naming a nation that is not in the game — is
     * the kind of quiet wrongness that takes an hour to find.
     */
    store.playerName = name || store.playerName;
    deselect();
    showEnd(null);
    return true;
  }
  if (won) { showEnd(won); return true; }
  // A crisis is waiting for an answer, and it is the only thing in this game
  // that stops to ask one (M7.4).
  if (typeof Events !== 'undefined' && Events.waiting() && showCrisis()) return true;
  /*
   * A DEAL HAS RUN OUT AND THE OTHER SIDE IS ASKING AGAIN (A1).
   *
   * Last in the chain deliberately: a breakaway, a lost election, a defeat, a
   * victory and a crisis all outrank an expired contract. Like the crisis, it
   * can never fire mid-sweep, because the queue is only read here — after
   * AI.sweep has returned — and like the crisis it is a `return true`, so
   * fast-forward stops on it rather than running past a decision.
   */
  if (typeof Deals !== 'undefined' && Deals.waiting(you()) && showRenegotiation()) return true;
  /*
   * ...and last of all, somebody asking to cross your ground (A2). Below the
   * expired deal on purpose: a contract that has run out is costing money every
   * quarter it goes unanswered, and a request costs nothing to leave waiting.
   */
  if (typeof Transit !== 'undefined' && Transit.waiting(you()) && showTransitCard()) return true;
  const next = you();
  if (next && Game.getNation(next)) { setMode('nations'); select('nation', next); }
  else deselect();
  return false;
}

/*
 * FAST-FORWARD (A0): play N rounds through the SAME path a pressed End turn
 * takes, stopping the moment a round halts for the player. Not N calls to
 * World.advanceTurn -- that is exactly the shortcut that desynchronised the two
 * counters, because it moved the world clock without ending anybody's turn.
 *
 * Returns how many rounds actually ran, so the caller can say "stopped after
 * 3 of 10: an election is waiting" rather than pretending it did ten.
 */
function fastForward(n) {
  if (Actions.isActive()) { flash('Finish or cancel the current action first.', 'warn'); return 0; }
  let ran = 0;
  for (let i = 0; i < n; i++) {
    const halted = completeTurn();
    ran++;
    if (halted) break;
  }
  return ran;
}

/* ------------------------------------------------------------------ */
/* the end of the game                                                 */
/* ------------------------------------------------------------------ */

/**
 * Somebody won, or you are gone. Either way the game says so.
 *
 * Until M6.4 it said nothing at all: eighty turns of a game about whether a
 * country holds together ended the way the fortieth turn ended, with a map. The
 * verdict shows the winning condition TERM BY TERM, because "Texas won" is a
 * result and "Texas won holding 39 of 51 seats with Influence at 0.71" is an
 * account of a game — and the same rows are what the player was watching climb
 * in their own panel all along.
 *
 * @param won  a Victory.check result, or null for elimination
 */
function showEnd(won) {
  const el = document.getElementById('endscreen');
  const card = el.querySelector('.end-card');
  const me = you();
  const mine = won && won.winner === me;
  const n = won && Game.getNation(won.winner);

  const kicker = won
    ? (mine ? 'Victory' : 'The game is over')
    : 'Defeat';
  const title = won
    ? `${n ? escapeHtml(n.name) : won.name} — ${escapeHtml(won.label)}`
    : `${escapeHtml(store.playerName || 'Your nation')} no longer exists`;
  const sub = won
    ? (mine
      ? `You held it together, and the continent came round. World turn ${won.turn}.`
      : `You were playing ${escapeHtml(Game.getNation(me)?.name || store.playerName || 'a nation that is gone')}. World turn ${won.turn}.`)
    : 'The map went on without you. Reload to begin again.';

  const terms = won ? won.terms.map((t) => `
    <div class="end-term ${t.met ? 'met' : 'short'}">
      <span class="lbl">${escapeHtml(t.label)}</span>
      <span class="val">${fmtTerm(t.value)} / ${fmtTerm(t.target)}</span>
    </div>`).join('') : '';

  const board = Victory.loaded() ? Victory.standings(TUNE, 6).map((r) => `
    <div class="row">
      <strong>${escapeHtml(r.name)}</strong>
      <span class="bar"><i style="width:${Math.round(r.best.progress * 100)}%"></i></span>
      <span>${Math.round(r.best.progress * 100)}% ${escapeHtml(r.best.label)}</span>
    </div>`).join('') : '';

  card.innerHTML = `
    <div class="end-kicker">${kicker}</div>
    <h2>${n ? `<span class="dot" style="background:${n.color}"></span>` : ''}${title}</h2>
    <p class="end-sub">${sub}</p>
    ${terms ? `<div class="end-terms">${terms}</div>` : ''}
    ${board ? `<div class="end-standings"><div class="end-kicker">Closest, at the end</div>${board}</div>` : ''}
    <div class="end-btns">
      <button class="btn" id="end-close">Look at the map</button>
      <button class="btn go" id="end-again">Play again</button>
    </div>`;
  el.classList.add('show');
  document.getElementById('end-close').onclick = () => el.classList.remove('show');
  document.getElementById('end-again').onclick = () => { location.search = '?fresh=1'; };
  renderTurnBanner();
}

/** 0.62 -> "62%", 1.6 -> "1.6x". Victory terms are shares except one ratio. */
const fmtTerm = (v) => (v > 1.0001 ? `${v.toFixed(2)}\u00d7` : `${Math.round(v * 100)}%`);

/*
 * THE NEWSPAPER. The growth toast used to be the only thing a round boundary
 * said, and it said the same thing every time — while immediately clobbering
 * whatever the player's own action had reported. Headlines from the ledger are
 * the difference between "a turn passed" and "here is what happened in the world
 * while you were looking at Nevada".
 *
 * It reads the interval since the player's own turn ended rather than one world
 * turn, because the AI sweep straddles the boundary: the nations after you in
 * the order act in the old turn and the ones before you act in the new one, and
 * reporting either half alone silently drops the other.
 */
/*
 * THE OPENING EDITION.
 *
 * A scenario's `scenario`-kind ledger entries are the only news there has ever
 * been on turn 0, and without this the player arrives at a board where Texas is
 * five countries and nothing has said so. Deliberately the newspaper's own
 * shape, because it IS the newspaper — one edition, printed once, before the
 * first turn is taken. Nothing to print on the baseline board, which is correct:
 * fifty-one intact states is not news.
 */
function openingEdition() {
  const opened = Ledger.ofKind('scenario').filter((e) => e.turn === 0);
  if (!opened.length) return;
  const title = (store.scenario && store.scenario.edition) || 'The opening position';
  const body = opened.slice(0, 8)
    .map((e) => `<div class="head-line">${escapeHtml(e.text)}</div>`).join('');
  // News, not a refusal: this is the opening front page (M13.2).
  setTimeout(() => flash(`\u{1F4F0} <strong>${escapeHtml(title)}</strong>${body}`, 'bad', { news: true }), 600);
}

/*
 * WHAT HAPPENED WHILE YOU WERE TAKING YOUR TURN.
 *
 * This used to `flash()` the whole newspaper, and that was the fifth confirmed
 * seam (M9.7): `flash` is ONE slot, and every action confirm in js/actions.js
 * flashes its result and then synchronously calls `completeTurn()`, which calls
 * this — in the same frame. The result the player had just earned, civil-war
 * dice and all, was painted for zero frames and replaced. Every single time.
 * DESIGN.md §7.7 describes that pathology as fixed; only the content had
 * changed.
 *
 * The division now:
 *   - the ALARM still interrupts. A nation MOVING toward a victory (M9.5) is
 *     rare by construction and is the one thing worth taking the screen for.
 *   - everything else is a turn header in the journal, next to the entries it
 *     summarises, where a player who looked away can still read it.
 *
 * `mark` stays in the signature because the journal's unread count is measured
 * from the same ledger ids, and because a caller that has taken a mark should
 * hand it over rather than have this function guess.
 */
function newspaper(mark) {
  /*
   * AND WHO IS CLOSING IN.
   *
   * Not a ledger entry, because it is a standing state of the world rather than
   * something that happened this turn — but it belongs in the same place, at the
   * top, because it is the most important thing on the page when it is true.
   *
   * Without it the end of the game arrives with no build-up: measured in play,
   * Delaware won Ideological Dominance on turn 30 and the first the player heard
   * of it was the end screen. A game you can lose without seeing it coming is
   * one you cannot play against.
   *
   * `Victory.alarms` and not `Victory.standings(...).filter(>= bar)` (M9.5).
   * The filter fired on turn 1 of every game — three nations "84% of the way"
   * before anybody had done anything — because the binding term of two of the
   * three conditions is a power stock that opens near its target and sits
   * there. The rule is now "has anybody MOVED toward winning, and have we said
   * so lately"; the reasoning is in js/victory.js. It is called exactly once
   * per turn, from here, because reading it advances the baseline.
   */
  let alarm = '';
  if (typeof Victory !== 'undefined' && Victory.loaded()) {
    alarm = Victory.alarms(TUNE).slice(0, 3).map((r) =>
      `<div class="head-line alarm">\u26A0 ${escapeHtml(r.name)} moved to `
      + `${Math.round(r.best.progress * 100)}% of ${escapeHtml(r.best.label)}`
      + ` (was ${Math.round(r.from * 100)}%)`
      + `${Game.isPlayer(r.nid) ? ' \u2014 that is you' : ''}.</div>`).join('');
  }
  if (alarm) flash(alarm, 'bad', { news: true });   // the victory alarm is news
  /*
   * Render and pulse — but do NOT open. A log that seizes a third of the screen
   * every turn is a log that gets closed once and left closed, which would put
   * us back where we started with a longer animation.
   */
  if (typeof Journal !== 'undefined') Journal.noteTurn(mark);
}

function passTurn() {
  if (Actions.isActive()) return;
  completeTurn();
}

/*
 * GO WITH THEM.
 *
 * When a movement declares independence out of your own ground, you may become
 * the breakaway instead of going down with the parent. The review asks for this
 * and M6.2's seat concept is what makes it a one-line model change: a faction is
 * a nation id, and switching is `Game.setPlayer`.
 *
 * Offered AFTER the declaration rather than as a standing intent, and that is
 * the design: you decide knowing how much ground actually left, which nation it
 * became and what you have left — a promise made three turns earlier would be a
 * bet, and this is a choice.
 *
 * It is not an escape hatch from every bad position: it is offered only when a
 * movement takes ground FROM YOU, which is the situation the review names, and
 * it costs you everything the parent still holds.
 */
/*
 * YOU LOST THE ELECTION.
 *
 * The model always concedes for the player: `World.setElectionDefer` keeps their
 * result out of the automatic hands so that this can ask. It is the one moment
 * in the game where the honest answer and the available answer differ, and the
 * price of the second is named on the card rather than discovered afterwards.
 *
 * Offered only when it is actually available — a country with its liberties
 * intact cannot simply ignore a vote, and a government that has ground them down
 * far enough can. The capacity and the score are the same fact, which is why
 * nothing new had to be invented to decide who may.
 */
function offerElection() {
  const me = you();
  if (!me || typeof Elections === 'undefined' || !Elections.pending(me)) return false;
  if (!Elections.canSteal(me, TUNE)) return false;
  const n = Game.getNation(me);
  const took = Ideology.byId(n.gov.rulingIdeology);
  const kept = Ideology.byId(n.gov.lostFrom);
  const hit = TUNE.get('election.stealLibertiesHit');
  const el = document.getElementById('endscreen');
  const card = el.querySelector('.end-card');
  card.innerHTML = `
    <div class="end-kicker">The count</div>
    <h2><span class="dot" style="background:${took.color}"></span>${escapeHtml(took.name)} won the election</h2>
    <p class="end-sub">${escapeHtml(n.name)} has voted your government out. The
      ${escapeHtml(kept.name)} administration can stand down &mdash; or it can set the result aside.
      Civil liberties here are already low enough that it would hold.</p>
    <div class="end-terms">
      <div class="end-term met"><span class="lbl">Concede</span>
        <span class="val">You govern as ${escapeHtml(took.name)}</span></div>
      <div class="end-term"><span class="lbl">Refuse the result</span>
        <span class="val">Civil liberties &minus;${Math.round(hit * 100)} points</span></div>
    </div>
    <div class="end-btns">
      <button class="btn" id="el-concede">Concede</button>
      <button class="btn go" id="el-steal">Refuse the result</button>
    </div>`;
  el.classList.add('show');
  const close = () => el.classList.remove('show');
  document.getElementById('el-concede').onclick = () => { close(); select('nation', me); };
  document.getElementById('el-steal').onclick = () => {
    close();
    const r = Elections.steal(me, TUNE, store.rng);
    if (!r.ok) return flash(escapeHtml(r.reason), 'warn');
    Game.touch({ values: true });
    flash(`\u{1F5F3} <strong>${escapeHtml(n.name)}</strong> set the result aside &mdash; the `
      + `${escapeHtml(kept.name)} government stays, and civil liberties fell.`, 'warn');
    select('nation', me);
  };
  return true;
}

function offerSwitch(mark, parentName) {
  const me = you();
  if (!me) return false;
  const born = Ledger.after(mark)
    .filter((e) => e.kind === 'declare' && e.parent === me && Game.getNation(e.nation));
  if (!born.length) return false;
  // The biggest breakaway, if a bad turn produced more than one.
  const pick = born.sort((a, b) => (b.delta || 0) - (a.delta || 0))[0];
  const child = Game.getNation(pick.nation);
  const parent = Game.getNation(me);           // null when it took everything
  const wasCalled = parent ? parent.name : (parentName || store.playerName || 'your nation');
  const el = document.getElementById('endscreen');
  const card = el.querySelector('.end-card');
  card.innerHTML = `
    <div class="end-kicker">Independence</div>
    <h2><span class="dot" style="background:${child.color}"></span>${escapeHtml(child.name)} has declared</h2>
    <p class="end-sub">${escapeHtml(pick.text)}
      ${parent
        ? `You are ${escapeHtml(wasCalled)}, and you have ${parent.counties.size} `
          + `${parent.counties.size === 1 ? 'Area' : 'Areas'} left. You may go with them instead.`
        : `It took everything ${escapeHtml(wasCalled)} had. There is nothing left to stay for `
          + '&mdash; but there is somewhere to go.'}</p>
    <div class="end-terms">
      <div class="end-term met"><span class="lbl">${escapeHtml(child.name)}</span>
        <span class="val">${child.counties.size} Areas &middot; ${fmtPop(Game.nationDemographics(child.id).pop)}</span></div>
      ${parent ? `<div class="end-term"><span class="lbl">${escapeHtml(wasCalled)}</span>
        <span class="val">${parent.counties.size} Areas &middot; ${fmtPop(Game.nationDemographics(me).pop)}</span></div>` : ''}
    </div>
    <div class="end-btns">
      ${parent ? `<button class="btn" id="sw-stay">Stay with ${escapeHtml(wasCalled)}</button>` : ''}
      <button class="btn go" id="sw-go">Go with ${escapeHtml(child.name)}</button>
    </div>`;
  el.classList.add('show');
  const close = () => el.classList.remove('show');
  const stay = document.getElementById('sw-stay');
  if (stay) stay.onclick = () => { close(); select('nation', me); };
  document.getElementById('sw-go').onclick = () => {
    close();
    Game.setPlayer(child.id);
    store.playerName = child.name;
    TurnSystem.seat(child.id);
    Ledger.append({
      phase: 'action', subject: child.id, kind: 'govern', delta: child.counties.size,
      text: `You left ${wasCalled} and took up the cause of ${child.name}.`,
    });
    renderTurnBanner();
    Leaderboard.refresh();
    setMode('nations');
    select('nation', child.id);
    flash(`\u{1F91D} You are now <strong>${escapeHtml(child.name)}</strong>.`, 'good');
  };
  return true;
}


/* ------------------------------------------------------------------ */
/* info panel                                                          */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* the timeline                                                        */
/* ------------------------------------------------------------------ */

/*
 * THE MAP, AT EVERY TURN IT HAS BEEN.
 *
 * The ledger already says "the State of Jefferson declared independence, taking
 * 14 Areas", and that is a sentence about a SHAPE. A player who has spent an
 * hour watching a border move should be able to see it move again — and it is
 * the only way to answer "when did that happen" for anything the newspaper
 * scrolled past.
 *
 * Painting is done straight onto the paths rather than through `MapModes`,
 * because the timeline is showing a world that is not the current one and
 * teaching every map mode about a second source of ownership would be a large
 * change for one view. `close()` puts the live colours back by asking the
 * renderer to do what it always does.
 */
let timelineTurn = null;

function paintHistory(turn) {
  const owners = History.ownersAt(turn);
  if (!owners) return;
  const g = Game.graph();
  if (!g) return;
  const byArea = new Map();
  for (let i = 0; i < g.n; i++) byArea.set(g.idAt(i), History.colorOf(owners[i]));
  store.countyPaths.attr('fill', (d) => byArea.get(Game.areaIdOf(d.id)) || '#c9ced6');
}

function renderTimeline() {
  const el = document.getElementById('timeline');
  if (timelineTurn == null) { el.classList.remove('show'); return; }
  const lo = History.first(), hi = History.lastTurn();
  const t = Math.max(lo, Math.min(hi, timelineTurn));
  const board = History.standingsAt(t).slice(0, 6);
  const news = Ledger.forTurn(t).filter((e) => e.text);
  el.innerHTML = `
    <div class="tl-bar">
      <button class="tl-btn" id="tl-back">&#9664;</button>
      <input type="range" id="tl-scrub" min="${lo}" max="${hi}" step="1" value="${t}">
      <button class="tl-btn" id="tl-fwd">&#9654;</button>
      <span class="tl-turn">World turn <strong>${t}</strong> of ${hi}</span>
      <button class="tl-btn tl-close" id="tl-close">Back to now</button>
    </div>
    <div class="tl-body">
      <div class="tl-board">
        ${board.map((r) => `<div class="tl-row">
          <span class="dot" style="background:${r.color || '#c9ced6'}"></span>
          <span class="nm">${escapeHtml(r.name || 'unknown')}</span>
          <span class="num">${r.areas}</span></div>`).join('')}
      </div>
      <div class="tl-news">
        ${news.length
          ? news.slice(0, 8).map((e) => `<div class="tl-item">${escapeHtml(e.text)}</div>`).join('')
          : '<div class="tl-item quiet">Nothing anybody wrote down.</div>'}
      </div>
    </div>`;
  el.classList.add('show');
  paintHistory(t);

  const go = (n) => { timelineTurn = Math.max(lo, Math.min(hi, n)); renderTimeline(); };
  document.getElementById('tl-back').onclick = () => go(t - 1);
  document.getElementById('tl-fwd').onclick = () => go(t + 1);
  document.getElementById('tl-scrub').oninput = (ev) => go(Number(ev.target.value));
  document.getElementById('tl-close').onclick = closeTimeline;
}

function openTimeline() {
  if (!History.count()) return flash('Nothing has happened yet.', 'warn');
  timelineTurn = History.lastTurn();
  renderTimeline();
}

function closeTimeline() {
  timelineTurn = null;
  document.getElementById('timeline').classList.remove('show');
  // Put the live colours back by asking the renderer for the world as it is.
  recolor();
}

/*
 * WHO IS IN CHARGE.
 *
 * A name, a title and two traits. Everything else in this panel is a number
 * about a place; this is the one line about a person, and it is what makes
 * "Nevada changed course" a thing that happened to somebody rather than a shift
 * in an ideology index.
 */
