/*
 * The state document: one description of the whole world, version 2.
 *
 * WHY THIS IS A MODULE OF ITS OWN. `SaveManager` already built this document and
 * applied it, but it did so mixed in with the things only a browser can do — set
 * the colour mode, repaint the toolbar, open a modal, reach into `store`. That
 * meant the test suite could not run the real load path, so it ran a
 * hand-written COPY of it (`headlessSnapshot` / `headlessApply` in
 * saves.test.js). A copy of the code under test passes while the code under test
 * is broken; that is the same trap as the drifted harness bridge in M2.4.
 *
 * So the split is by dependency, not by feature:
 *   - this module   : assemble / validate / applyModel. Pure model. No DOM, no
 *                     `store`, no globals it does not receive. The suite and the
 *                     M5 simulator both run it directly.
 *   - SaveManager   : transport (server, localStorage), the modal, the UI
 *                     restore, and the rollback around a failed load.
 *
 * WHAT A DOCUMENT CONTAINS. Every module holding mutable state exposes
 * serialize/loadState and `assemble()` enumerates them. That rule is what stops
 * the v1 bug where 2 of 8 stateful modules were persisted and the rest silently
 * carried over from the session — the failure mode there was not a crash but a
 * loaded game quietly running on the previous game's market prices.
 *
 * v1 documents are REFUSED, not migrated: they carry no world turn, no market
 * prices, no movement roster, no colour counter and no RNG state, so migrating
 * one means inventing five values and calling the result the player's game.
 *
 * `data/state.json` holds the live document. It is written at every world-turn
 * boundary and read at boot, which is what makes it the source of truth rather
 * than a copy of the last time someone pressed Save.
 */

export const VERSION = 2;

/**
 * A fingerprint of the MAP BUILD this document was made against.
 *
 * The Area table's shape is a function of `data/areas.json`. Rebuild that file
 * with a different merge threshold and every existing document refers to Areas
 * that no longer exist — silently, because the ids are still strings and most of
 * them still resolve. Stamped here and refused on mismatch.
 */
export function buildStamp(areasDef) {
  return {
    areas: Object.keys(Game.county).length,
    threshold: (areasDef && areasDef.threshold) || null,
    merged: areasDef && areasDef.areas ? Object.keys(areasDef.areas).length : null,
  };
}

/**
 * Read the live world into a document.
 *
 * @param {{seed, rng, areasDef, ui, name, ts}} session — the values that live in
 *        the page rather than in the model. Passing them keeps this function
 *        free of `store`, which is what lets the suite call it.
 */
export function assemble(session = {}) {
  return {
    v: VERSION,
    ts: session.ts == null ? Date.now() : session.ts,
    name: session.name,
    build: buildStamp(session.areasDef),
    meta: { seed: session.seed, turn: World.getTurn() },
    rng: session.rng ? session.rng.serialize() : null,
    game: Game.serialize(),
    turns: TurnSystem.serialize(),
    world: World.serialize(),
    market: Market.serialize(),
    colors: Colors.serialize(),
    parties: Movements.serialize(),
    // only deliberate overrides, so a schema change is not baked into a save
    tune: window.TUNE.diff(),
    ui: session.ui || {},
  };
}

/**
 * Structural check, run BEFORE anything is mutated. Returns null, or a message
 * written for a player rather than for a log.
 */
export function validate(doc, areasDef) {
  if (!doc || typeof doc !== 'object') return 'That file is not a Nation States save.';
  if (doc.deleted) return 'That save was deleted.';
  if (doc.v == null) return 'That save has no version stamp and cannot be read.';
  if (doc.v < VERSION) {
    return `That is a version ${doc.v} save from before the model rewrite. `
      + 'It carries no world turn, market prices, party roster or RNG state, so it cannot be '
      + 'loaded without inventing them. Start a new game.';
  }
  if (doc.v > VERSION) return `That save is version ${doc.v}; this build reads version ${VERSION}.`;
  if (!doc.game || !Array.isArray(doc.game.nations)) return 'That save has no nations in it.';
  if (!doc.turns || !Array.isArray(doc.turns.order)) return 'That save has no turn order in it.';
  const b = doc.build || {};
  const now = buildStamp(areasDef);
  if (b.areas != null && b.areas !== now.areas) {
    return `That save was made against a different map build (${b.areas} Areas; this build has `
      + `${now.areas}). data/areas.json has changed, so the save's Area ids no longer line up.`;
  }
  return null;
}

/**
 * Restore the MODEL from a document. No DOM, no rendering decisions.
 *
 * Order matters and is not arbitrary: Game.loadState emits, and an emit drives
 * a full re-render in the live page, so it goes last — everything the renderer
 * reads must already be right when it fires.
 *
 * @returns {{rng}} the restored RNG, which the caller owns.
 */
export function applyModel(doc) {
  if (doc.tune) window.TUNE.load(doc.tune);
  const rng = doc.rng ? RNG.restore(doc.rng) : null;
  if (rng) TurnSystem.setRng(rng);
  World.loadState(doc.world || { turn: (doc.meta && doc.meta.turn) || 0 });
  Colors.loadState(doc.colors);
  Movements.loadState(doc.parties);
  Market.loadState(doc.market);
  TurnSystem.loadState(doc.turns);
  Game.loadState(doc.game); // emits -> full re-render
  // A pre-M3 document carries no power stocks; seed the nations that have none
  // rather than leaving them null and letting every reader guard for it. A
  // document that HAS them keeps them, stocks included, because the whole point
  // of a stock is that it remembers.
  World.begin(window.TUNE, (n) => n.authority == null || n.influence == null);
  return { rng };
}

/** Every module a document must round-trip, for the "nothing was forgotten" test. */
export const STATEFUL_MODULES = ['Game', 'TurnSystem', 'World', 'Market', 'Colors', 'Movements'];

export default { VERSION, buildStamp, assemble, validate, applyModel, STATEFUL_MODULES };
