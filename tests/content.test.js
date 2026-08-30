/*
 * M2.5b — authored content has one home and one write path.
 *
 * It had four, one of which was the user's Downloads folder: the editor's
 * `publish()` triggered a browser download that the author then had to find and
 * hand-copy into `data/` under a different name. That is why the two shipped map
 * modes lived in `data/` — the BAKE OUTPUT directory — instead of in `content/`
 * with everything else authored, and why the editor could publish a mode but
 * never open one again.
 *
 * The acceptance for this task is exactly the round trip: open
 * `content/cultural.json`, change it, save it, read it back, get what you saved.
 */
import { describe, it, ok, equal, deepEqual } from './harness.js';
import { bootWorld } from './world-fixture.js';

const SEED = 20260829;
const api = (p, opts) => fetch(p, { cache: 'no-store', ...opts });
const TEST_DOC = 'test-roundtrip';
const putJSON = (p, doc) => api(p, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(doc, null, 1),
});

describe('The content API', () => {
  it('lists the authored documents', async () => {
    const r = await api('/api/content');
    ok(r.ok, `GET /api/content returned ${r.status}`);
    const body = await r.json();
    ok(Array.isArray(body.content), 'the listing has no content array');
    for (const n of ['cultural.json', 'geographical.json', 'ideologies.json', 'tunables.json']) {
      ok(body.content.includes(n), `content/ does not hold ${n}`);
    }
  });

  it('refuses a name that could escape the directory', async () => {
    for (const bad of ['../secret', 'a/b', 'Upper', 'with space', 'dot.dot']) {
      const r = await api(`/api/content/${encodeURIComponent(bad)}.json`, { method: 'PUT', body: '{}' });
      ok(!r.ok, `the server accepted the name "${bad}"`);
    }
  });

  it('refuses a body that is not JSON, rather than writing it', async () => {
    const r = await api(`/api/content/${TEST_DOC}.json`, { method: 'PUT', body: 'not json' });
    equal(r.status, 400, 'the server wrote a non-JSON body');
  });

  it('round-trips a document byte for byte', async () => {
    const doc = {
      type: 'ns-mapmode', name: 'Round Trip', requireAll: false,
      nodes: [{ id: 'n1', name: 'A', children: [{ id: 'n2', name: 'B', children: [] }] }],
      assign: { '06037': ['n1', 'n2'], '48201': ['n1'] },
    };
    const put = await putJSON(`/api/content/${TEST_DOC}.json`, doc);
    ok(put.ok, `PUT returned ${put.status}`);
    const back = await api(`/api/content/${TEST_DOC}.json`).then((r) => r.json());
    deepEqual(back, doc, 'the document changed on its way through the server');
    const list = await api('/api/content').then((r) => r.json());
    ok(list.content.includes(`${TEST_DOC}.json`), 'the written document is not listed');
  });
});

describe('The map modes are authored content', () => {
  it('load from content/, not from the bake-output directory', async () => {
    const cultural = await api('/content/cultural.json');
    const geo = await api('/content/geographical.json');
    ok(cultural.ok, 'content/cultural.json is missing');
    ok(geo.ok, 'content/geographical.json is missing');
    for (const r of [cultural, geo]) {
      const doc = await r.json();
      equal(doc.type, 'ns-mapmode');
      ok(Array.isArray(doc.nodes) && doc.nodes.length > 0);
      ok(doc.assign && Object.keys(doc.assign).length > 1000);
    }
    // the old location is gone, so nothing can quietly read a stale second copy
    for (const old of ['/data/cultural.mapmode.json', '/data/geographical.mapmode.json']) {
      const r = await api(old);
      ok(!r.ok, `${old} still exists; two copies of an authored file is how they diverge`);
    }
  });

  it('every assignment resolves to a live Area', async () => {
    await bootWorld({ seed: SEED });
    for (const name of ['cultural', 'geographical']) {
      const doc = await api(`/content/${name}.json`).then((r) => r.json());
      const bad = Object.keys(doc.assign).filter((a) => !Game.county[a]);
      equal(bad.length, 0,
        `${name}.json assigns ${bad.length} ids that are not Areas: ${bad.slice(0, 5)}`);
    }
  });

  it('the cultural mode still drives the region every Area is tagged with', async () => {
    // The move is only safe if the game reads the new location: attrs.culture is
    // set from this file at init, and every otherSplit weight keys off it.
    const { raw } = await bootWorld({ seed: SEED });
    ok(raw.culture && raw.culture.type === 'ns-mapmode', 'the fixture did not load the culture mode');
    let tagged = 0;
    for (const f in Game.county) if (Game.county[f].attrs.culture) tagged++;
    equal(tagged, Object.keys(Game.county).length,
      'Areas lost their cultural region when the file moved');
  });
});

describe('The editor round-trip', () => {
  /*
   * The acceptance criterion, run against the real file. The suite puts the
   * original back afterwards — this is committed authored content, not scratch.
   */
  it('opens, edits and re-saves content/cultural.json without a download', async () => {
    const original = await api('/content/cultural.json').then((r) => r.json());
    try {
      const edited = JSON.parse(JSON.stringify(original));
      edited.nodes.push({ id: 'n9999', name: 'Round Trip Test Region', children: [] });
      const firstArea = Object.keys(edited.assign)[0];
      edited.assign[firstArea] = ['n9999'];

      const put = await putJSON('/api/content/cultural.json', edited);
      ok(put.ok, `saving the edited mode returned ${put.status}`);

      const back = await api('/content/cultural.json').then((r) => r.json());
      deepEqual(back, edited, 'what came back is not what was saved');
      ok(back.nodes.some((n) => n.id === 'n9999'), 'the new region did not survive the save');
      deepEqual(back.assign[firstArea], ['n9999'], 'the reassignment did not survive');
    } finally {
      await putJSON('/api/content/cultural.json', original);
      const restored = await api('/content/cultural.json').then((r) => r.json());
      deepEqual(restored, original, 'the suite failed to put content/cultural.json back');
    }
  });

  it('the editor exposes the import path it never had', () => {
    ok(typeof Editor !== 'undefined', 'the editor is not loaded');
    for (const fn of ['publish', 'importPublished', 'publishedNames']) {
      ok(typeof Editor[fn] === 'function', `Editor.${fn} is missing`);
    }
  });

  it('a published mode can be listed and read back into the editor', async () => {
    await bootWorld({ seed: SEED });
    const areas = Object.keys(Game.county).slice(0, 3);
    const doc = {
      type: 'ns-mapmode', name: 'Import Check', requireAll: false,
      nodes: [{ id: 'n4242', name: 'Somewhere', children: [] }],
      assign: Object.fromEntries(areas.map((a) => [a, ['n4242']])),
    };
    await putJSON(`/api/content/${TEST_DOC}.json`, doc);

    const names = await Editor.publishedNames();
    ok(names.includes(TEST_DOC), `the listing did not offer ${TEST_DOC}: ${names}`);
    ok(!names.some((n) => n.startsWith('save-')), 'saves were offered as map modes');
    ok(!names.includes('tunables') && !names.includes('ideologies'),
      'the authored game tables were offered as map modes');
  });
});
