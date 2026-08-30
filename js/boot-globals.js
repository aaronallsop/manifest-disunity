/*
 * ESM -> global bridge, for the duration of M0/M1 only.
 *
 * The new engine modules (rng.js, tunables.js, ...) are written as native ES
 * modules so that tests/ can import them today and `node --test` can run the
 * same files unchanged tomorrow. The thirteen legacy files are still classic
 * IIFE globals until M2 converts them. This module is the seam between the two:
 * it imports the real modules and publishes them on `window` for the legacy
 * code to read.
 *
 * ORDERING: `<script type="module">` is deferred, so this runs after every
 * classic script has been evaluated but before DOMContentLoaded — and app.js's
 * init() is bound to DOMContentLoaded. So `window.RNG` and `window.TUNE` are in
 * place before any legacy code executes a function body. Nothing legacy may
 * read them at top level.
 *
 * M2 deletes this file.
 */
import * as RNG from './rng.js';
import { createTune, describe, groups, SCHEMA } from './tunables.js';
import * as GeoCT from './geo-ct.js';
import * as Counts from './counts.js';
import * as Ideology from './ideology.js';
import * as Graph from './graph.js';
import { AreaState, FIELDS } from './state.js';

window.RNG = RNG;
window.TUNE = createTune();
window.TuneMeta = { describe, groups, SCHEMA };
window.GeoCT = GeoCT;
window.Counts = Counts;
window.Ideology = Ideology;
window.Graph = Graph;
window.AreaState = AreaState;
window.StateFields = FIELDS;
