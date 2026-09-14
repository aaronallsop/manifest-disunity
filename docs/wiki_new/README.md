# The design wiki — how to re-run it

**For whoever closes round 4.** This folder is generated. Do not hand-maintain it.

## Re-running it

```
python build/build_wiki.py
```

No arguments, no dependencies, run from the repository root. Two flags:

| | |
|---|---|
| `--check` | report only, write nothing. Run this first. |
| `--package` | also write `dist/manifest-disunity-wiki.zip`, a standalone vault of documents only — no code, no data — for a writer working outside this folder. |

Then **read `docs/wiki/_build-report.md`**. Its first six sections are the ones that mean something
is wrong or something new has arrived.

## What it will and will not overwrite

This is the whole reason it is safe to re-run after a writer has worked in here.

| In a page | On a re-run |
|---|---|
| `<!-- GENERATED:… -->` blocks | **Rewritten every time.** Never edit these by hand. |
| `<!-- SEEDED:… -->` blocks | Written once, at page creation. **Never touched again.** |
| Everything else — the prose | Written once, at page creation. **Never touched again.** |

A page that already exists keeps every word outside its GENERATED blocks. If a writer deleted a
GENERATED block, it is put back at the foot of the page and the report says so.

## What to do when round 4 closes

1. Run `python build/build_wiki.py --check`. It will report every new ruling in
   `economy-ideation.md` under **“Rulings in a round document that no page claims.”**
2. Add round 4 to `build/wiki_rulings.json` — a `rounds` entry for it, then one entry per ruling
   with its number, its own wording, and the page it belongs to. **The wording matters**: the
   generator finds a ruling in its source by its words, not by a line number, so that a later edit
   to the document cannot silently point a link at the wrong place.
3. Add any new pages to `build/wiki_spine.json`. Economy currently has **no pages at all** — it is
   an empty master topic waiting for its round.
4. Add candidate links to `build/wiki_edges.json`.
5. Run it again. New pages appear; existing pages keep their prose.

## The four authored files, and what they are allowed to hold

They hold **judgement** — which page a ruling belongs to, which pages connect — and never facts.
Facts are read out of the round documents and `data/parties.json` on every run.

| File | What it is |
|---|---|
| `build/wiki_spine.json` | The page tree: eleven master topics and the pages under them. |
| `build/wiki_rulings.json` | Every ruling, its own wording, and which page it belongs to. |
| `build/wiki_edges.json` | Candidate links, seeded into pages once for a writer to correct. |
| `build/wiki_movements.json` | The Movement Register — verbs, adjectives, the ten-position placement, and Aaron's own notes. |
| `build/wiki_aliases.json` | Prose name to data id, plus the known gaps. |

**`wiki_movements.json` is the one that is not just judgement, and it needs watching.** Every
movement's **verb** and **adjective** lived only on a published web page outside this repository
until 12 September 2026. That file is where they live now. Its *position* column is politics ruling
41's re-map; if the file and `politics-ideation.md` ever disagree, **the ruling wins and the file is
the bug.**

## Opening it in Obsidian

Open the **repository root** as the vault, not this folder — `DESIGN.md` and `DECISIONS.md` live at
the root and the graph should reach them. `.obsidian/app.json` already excludes the code, the data
and the 455KB August code review.

Start at **Start here**.

## What this wiki must never become

Its charter is `docs/FUTURE-IDEAS.md` **F24**, and the rule there is one line: **generated, not
hand-written**, because a hand-written wiki becomes another place a fact lives and the first one to
go stale. The prose in these pages is written by hand — that is the point of it — but **no fact is
restated here that lives somewhere else.** Every claim cites the ruling that made it true and links
to where that ruling actually is.

If you find yourself typing a figure into a page, stop: it belongs in a GENERATED block, read from
the source on every run.
