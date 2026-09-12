"""Generate the design wiki under docs/wiki/ from the closed ideation rounds.

The wiki is an Obsidian vault layer. It does NOT hold the design; it indexes it.
Every page links back into the real documents, so a fact has exactly one home.

Three kinds of content live in a generated page, and the difference between them
is the whole point of this script:

  * GENERATED blocks are rewritten on every run. Never edit them by hand.
  * SEEDED blocks are written once, when a page is first created, and are never
    touched again. Candidate links start there; the writer owns them afterwards.
  * Everything else - the prose a writer types - is written once and never
    touched again either.

So this can be re-run after round 4 closes without destroying a word anybody
wrote. What it does instead is report: rulings with no page, pages whose sources
changed, rulings superseded since a page cited them, and titles it can no longer
find in the source.

Its inputs are four authored JSON files beside it. They hold JUDGEMENT - which
page a ruling belongs to, which pages connect - never facts. Facts are read out
of the round documents at run time.

    python build/build_wiki.py              regenerate docs/wiki/
    python build/build_wiki.py --check      report only, write nothing
    python build/build_wiki.py --package    also write a standalone vault zip
"""

import argparse
import json
import os
import re
import subprocess
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
DOCS = os.path.join(ROOT, "docs")
WIKI = os.path.join(DOCS, "wiki")
DIST = os.path.join(ROOT, "dist")

SPINE = os.path.join(HERE, "wiki_spine.json")
RULINGS = os.path.join(HERE, "wiki_rulings.json")
EDGES = os.path.join(HERE, "wiki_edges.json")
ALIASES = os.path.join(HERE, "wiki_aliases.json")
MOVEMENTS = os.path.join(HERE, "wiki_movements.json")
PARTIES = os.path.join(ROOT, "data", "parties.json")

BLOCK_RE = re.compile(
    r"<!-- (GENERATED|SEEDED):([a-z-]+) START[^>]*-->\n(.*?)\n<!-- \1:\2 END -->",
    re.DOTALL,
)


# --------------------------------------------------------------- reading in

def read_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def read_lines(path):
    with open(path, encoding="utf-8") as f:
        return f.read().split("\n")


def git_say(args, fallback):
    try:
        out = subprocess.run(["git", "-C", ROOT] + args,
                             capture_output=True, text=True, timeout=10)
        return out.stdout.strip() or fallback
    except Exception:
        return fallback


# ------------------------------------------------------ locating the rulings

def headings_of(lines):
    """Every markdown heading with its line number. Obsidian anchors on the text."""
    out = []
    fence = False
    for i, line in enumerate(lines):
        if line.startswith("```"):
            fence = not fence
            continue
        if fence:
            continue
        m = re.match(r"^(#{1,6})\s+(.*\S)\s*$", line)
        if m:
            out.append((i + 1, len(m.group(1)), m.group(2)))
    return out


def enclosing_heading(headings, line_no):
    found = ""
    for ln, _level, text in headings:
        if ln <= line_no:
            found = text
        else:
            break
    return found


def normalise(s):
    """Compare titles ignoring wrapping, markdown, and the punctuation that drifts."""
    s = re.sub(r"[*_`~]", "", s)
    s = s.replace("—", "-").replace("–", "-").replace("’", "'")
    s = re.sub(r"\s+", " ", s)
    return s.strip().strip(".:").lower()


def locate(lines, headings, title, number):
    """Find a ruling in its source by its own words, not by a line number.

    Line numbers drift the moment anybody edits above them. Titles do not - and a
    title that HAS changed is something the run report should say out loud rather
    than quietly emit a link to the wrong place.
    """
    want = normalise(title)
    probe = want[:60]

    # DECLARATIONS FIRST. These documents cite their own rulings constantly - 732
    # bare "ruling N" mentions across the three rounds - and a ruling's title is
    # often quoted in prose ABOVE the place it is actually declared. Searching for
    # the title text first lands on the citation, which anchors the link to the
    # wrong section and reads the wrong body. So: find the declarations, then use
    # the title only to choose between them.
    decl = []
    pats = [re.compile(r"^\*\*Ruling %s\b" % re.escape(number)),
            re.compile(r"^#{1,6}\s+Ruling %s\b" % re.escape(number)),
            # Round 1's first eleven rulings are rows of a table, not paragraphs.
            # Nothing can anchor a table cell, so the link lands on the table's
            # heading - but the row is still where the ruling is declared, and
            # reading its body from there is what matters.
            re.compile(r"^\|\s*%s\s*\|" % re.escape(number))]
    for i, line in enumerate(lines):
        if any(p.search(line) for p in pats):
            decl.append(i + 1)

    if decl:
        best, how = decl[0], "number-only"
        if probe:
            for ln in decl:
                if probe in normalise(" ".join(lines[ln - 1:ln + 3])):
                    best, how = ln, "exact"
                    break
        return best, enclosing_heading(headings, best), how

    # No declaration at all. Fall back to the title text, and say the wording is
    # all we could find - the build report treats that as something to look at.
    if probe:
        for i in range(len(lines)):
            if probe in normalise(" ".join(lines[i:i + 4])):
                return i + 1, enclosing_heading(headings, i + 1), "title-only"
    return None, "", "missing"


def body_at(lines, line_no, limit=60):
    """The text of a ruling, from its declaration to the next one.

    A ruling's title often does not name what it is about - politics ruling 41 is
    titled "the three capped-out separatists" and names the Sagebrush Rebellion only
    in its table. Searching the body is what puts that ruling on Sagebrush's page.
    """
    if not line_no:
        return ""
    start = line_no - 1
    out = []
    for line in lines[start:start + limit]:
        if out and (re.match(r"^\*\*Ruling \d", line) or re.match(r"^#{1,4}\s", line)):
            break
        out.append(line)
    return " ".join(out).lower()


def scan_declared(lines):
    """Every ruling number the document declares, to catch ones with no page.

    Deliberately generous. It would rather report a number twice than miss one,
    because a missed ruling is a decided fact with nowhere to live.
    """
    seen = set()
    for line in lines:
        m = re.match(r"^\*\*Ruling (\d+[a-z]?)\b", line)
        if m:
            seen.add(m.group(1))
        m = re.match(r"^#{1,6}\s+Ruling (\d+[a-z]?)\b", line)
        if m:
            seen.add(m.group(1))
    return seen


# ------------------------------------------------------------ page mechanics

def slug(name):
    """A filename Obsidian and Windows both accept, keeping the name readable."""
    return re.sub(r'[\\/:*?"<>|#^\[\]]', "-", name).strip()


def page_path(name):
    return os.path.join(WIKI, slug(name) + ".md")


def block(kind, name, content):
    if kind == "GENERATED":
        start = "<!-- GENERATED:%s START - rewritten on every run, do not edit -->" % name
        end = "<!-- GENERATED:%s END -->" % name
    else:
        start = "<!-- SEEDED:%s START - written once, yours to edit, never overwritten -->" % name
        end = "<!-- SEEDED:%s END -->" % name
    return "%s\n%s\n%s" % (start, content, end)


def write_page(path, body, report, label, dry):
    """Write a page, preserving every word that is not inside a GENERATED block."""
    if not os.path.exists(path):
        if not dry:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8", newline="\n") as f:
                f.write(body)
        report["created"].append(label)
        return

    with open(path, encoding="utf-8") as f:
        old = f.read()

    fresh = {}
    for m in BLOCK_RE.finditer(body):
        if m.group(1) == "GENERATED":
            fresh[m.group(2)] = m.group(0)

    def swap(m):
        if m.group(1) == "GENERATED" and m.group(2) in fresh:
            return fresh.pop(m.group(2))
        return m.group(0)

    merged = BLOCK_RE.sub(swap, old)
    if fresh:
        # A block the writer deleted, or a new kind of block this run invented.
        # Append rather than lose it, and say so in the report.
        merged = merged.rstrip() + "\n\n" + "\n\n".join(fresh.values()) + "\n"
        report["reattached"].append(label)

    if merged == old:
        report["unchanged"].append(label)
        return
    if not dry:
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write(merged)
    report["updated"].append(label)


def frontmatter(fields):
    out = ["---"]
    for key, value in fields:
        if isinstance(value, list):
            out.append("%s:" % key)
            for v in value:
                out.append("  - %s" % v)
        else:
            out.append("%s: %s" % (key, value))
    out.append("---")
    return "\n".join(out)


# ----------------------------------------------------------------- the build

BUILT_WORDS = {
    "built": "built and running",
    "partial": "partly built",
    "designed only": "designed, not built",
    "unknown": "not established",
}


def ruling_label(rounds, key, number):
    return "%s ruling %s" % (rounds[key]["label"], number)


def index_link(rounds, key, number):
    return "[[Rulings - %s#%s]]" % (rounds[key]["label"],
                                    ruling_label(rounds, key, number))


def build(spine, rulings, edges, movements, parties, dry):
    rounds = rulings["rounds"]
    _ROUND_LABELS.update({k: v["label"] for k, v in rounds.items()})
    report = {"created": [], "updated": [], "unchanged": [], "reattached": [],
              "orphan_rulings": [], "moved_titles": [], "missing_rulings": [],
              "unknown_pages": [], "superseded_cited": [], "touched_later": [],
              "isolated": []}

    commit = git_say(["rev-parse", "--short", "HEAD"], "unknown")
    date = git_say(["log", "-1", "--format=%cs"], "unknown")
    stamp = "*Generated by `build/build_wiki.py` from commit `%s` (%s).*" % (commit, date)

    # Resolve every ruling against its source document.
    docs = {}
    for key, meta in rounds.items():
        path = os.path.join(ROOT, meta["document"])
        lines = read_lines(path)
        docs[key] = {"lines": lines, "headings": headings_of(lines),
                     "declared": scan_declared(lines), "meta": meta}

    by_page = {}
    resolved = []
    for r in rulings["rulings"]:
        key = r["round"]
        d = docs[key]
        line, heading, how = locate(d["lines"], d["headings"], r["title"], r["n"])
        if how == "missing":
            report["missing_rulings"].append("%s - %s" % (ruling_label(rounds, key, r["n"]), r["title"][:60]))
        elif how in ("number-only", "title-only"):
            report["moved_titles"].append(
                "%s - %s" % (ruling_label(rounds, key, r["n"]),
                             "found by number; its recorded wording no longer matches"
                             if how == "number-only" else
                             "found only by its wording; no declaration line for it"))
        item = dict(r, line=line, heading=heading, how=how,
                    body=body_at(d["lines"], line))
        resolved.append(item)
        for page in [r["page"]] + list(r.get("also", [])):
            by_page.setdefault(page, []).append(item)

    known = {p["page"] for p in spine["pages"]} | {m["page"] for m in spine["master_topics"]}
    for page in by_page:
        if page not in known:
            report["unknown_pages"].append(page)

    assigned = {(r["round"], r["n"]) for r in rulings["rulings"]}
    for key, d in docs.items():
        for n in sorted(d["declared"]):
            if (key, n) not in assigned:
                report["orphan_rulings"].append(ruling_label(rounds, key, n))

    out_edges = {}
    for e in edges["edges"]:
        out_edges.setdefault(e["from"], []).append(e)
    inbound = set()
    for e in edges["edges"]:
        inbound.add(e["to"])

    if not dry:
        os.makedirs(WIKI, exist_ok=True)

    write_ruling_indexes(rounds, docs, resolved, stamp, report, dry)
    write_topic_pages(spine, by_page, rounds, out_edges, inbound, stamp, report, dry)
    write_movement_pages(movements["movements"], parties, by_page, resolved, stamp, report, dry)
    write_register(movements, parties, stamp, report, dry)
    write_master_pages(spine, by_page, stamp, report, dry)
    write_home(spine, by_page, movements, stamp, report, dry)

    for p in spine["pages"]:
        if p["page"] not in out_edges and p["page"] not in inbound:
            report["isolated"].append(p["page"])

    for item in resolved:
        kind, text = later_ruling(item.get("superseded_by"))
        if kind == "SUPERSEDED":
            report["superseded_cited"].append(
                "%s, cited on [[%s]] - %s"
                % (ruling_label(rounds, item["round"], item["n"]), item["page"], text[:160]))
        elif kind:
            report["touched_later"].append(
                "%s (%s), cited on [[%s]]"
                % (ruling_label(rounds, item["round"], item["n"]), kind, item["page"]))

    write_report(report, stamp, dry)
    return report


def write_ruling_indexes(rounds, docs, resolved, stamp, report, dry):
    """One note per round where every ruling is a heading, so it can be linked to.

    This exists because most rulings are written as bold paragraphs rather than
    headings, and Obsidian cannot anchor to a paragraph without editing the file
    the paragraph lives in - which a design session may not do.
    """
    for key, meta in rounds.items():
        items = [r for r in resolved if r["round"] == key]
        items.sort(key=lambda r: (int(re.sub(r"[^0-9]", "", r["n"]) or 0), r["n"]))
        doc = os.path.basename(meta["document"])[:-3]
        body = [
            frontmatter([("title", "Rulings - %s" % meta["label"]),
                         ("topic", "index"),
                         ("tags", ["round/%s" % meta["round"]]),
                         ("kind", "index")]),
            "",
            "# Rulings - %s" % meta["label"],
            "",
            "> Round %s. %s. **%d rulings.**" % (meta["round"], meta.get("closed", "closed"), len(items)),
            "> Each ruling is a heading here so a wiki page can link straight to it. The wording is",
            "> the ruling's own, quoted. The ruling itself lives in [[%s]] - this is a signpost, not a copy." % doc,
            "",
            block("GENERATED", "index", "\n\n".join(ruling_entry(r, doc) for r in items)),
            "",
            stamp,
            "",
        ]
        write_page(os.path.join(WIKI, "Rulings - %s.md" % meta["label"]),
                   "\n".join(body), report, "Rulings - %s" % meta["label"], dry)


def ruling_entry(r, doc):
    label = "%s ruling %s" % (r["_label"], r["n"]) if "_label" in r else None
    lines = ["### %s ruling %s" % (r["round_label"], r["n"]),
             r["title"].strip()]
    where = "[[%s#%s]]" % (doc, r["heading"]) if r["heading"] else "[[%s]]" % doc
    bits = ["**Where:** %s" % where]
    if r["line"]:
        bits.append("line %d" % r["line"])
    pages = [r["page"]] + list(r.get("also", []))
    bits.append("**Pages:** " + " · ".join("[[%s]]" % p for p in pages))
    kind, text = later_ruling(r.get("superseded_by"))
    if kind == "SUPERSEDED":
        bits.append("**SUPERSEDED.** %s" % text)
    elif kind:
        bits.append("**%s.** %s" % (kind.capitalize(), text))
    if r.get("not_built"):
        bits.append("**Not built:** %s" % r["not_built"])
    lines.append("")
    lines.append(" · ".join(bits))
    return "\n".join(lines)


def write_topic_pages(spine, by_page, rounds, out_edges, inbound, stamp, report, dry):
    for p in spine["pages"]:
        name = p["page"]
        items = by_page.get(name, [])
        write_page(page_path(name), topic_body(p, items, rounds, out_edges.get(name, []), stamp),
                   report, name, dry)


def topic_body(p, items, rounds, edges, stamp):
    tags = [p["tag"]]
    if p.get("second_tag"):
        tags.append(p["second_tag"])
    for r in items:
        t = "round/%s" % rounds[r["round"]]["round"]
        if t not in tags:
            tags.append(t)

    built = BUILT_WORDS.get(p.get("built", "unknown"), p.get("built", "not established"))
    rounds_named = sorted({rounds[r["round"]]["label"] for r in items})
    story = p.get("story", "none found")

    glance = ["> [!abstract] At a glance",
              "> **System:** [[%s]]" % p["master_page"]]
    if p.get("axes"):
        a = p["axes"]
        glance.append("> **Where it sits:** %s economy · %s morals · %s power — %s of the ten"
                      % (a["economy"], a["morals"], a["power"], a["kind"]))
        n = p.get("movements_here", 0)
        glance.append("> **Movements holding it:** %s"
                      % ("none — this corner of the board is empty" if not n
                         else ("1" if n == 1 else str(n))))
    glance += ["> **In the game today:** %s" % built,
               "> **Decided in:** %s" % (", ".join(rounds_named) if rounds_named else "no closed round yet"),
               "> **This page:** not yet written"]

    head = [
        frontmatter([("title", name_of(p)), ("topic", p["topic"]), ("tags", tags),
                     ("kind", p.get("kind", "mechanic")),
                     ("built", p.get("built", "unknown")),
                     ("status", "needs writing")]),
        "",
        "# %s" % name_of(p),
        "",
    ] + glance + [
        "",
        "*%s*" % p["one_line"],
        "",
        "## What it is",
        "",
        "<!-- WRITER: one short paragraph, plain language. What is this, to somebody playing? -->",
        "",
        "## How it works in the game",
        "",
        "<!-- WRITER: the mechanism. Link other pages inline as you write - \"you cannot trade with a",
        "     nation you are at [[War|war]] with\" - because those inline links are what draws the graph.",
        "     Cite the ruling behind each claim from the Sources table at the foot of this page. -->",
        "",
        "## The story behind it",
        "",
    ]
    if story and story != "none found":
        head += ["<!-- WRITER: the in-world explanation. Raw material found: %s -->" % story, ""]
    else:
        head += ["<!-- WRITER: the in-world explanation. Nothing has been written for this yet;",
                 "     leave the line below until it has. -->",
                 "",
                 "*Not yet written.*",
                 ""]

    head += ["## Interacts with", ""]
    if edges:
        seeded = ["<!-- Candidates, not answers. Keep, rewrite or delete each one. Every line must say WHY. -->"]
        for e in sorted(edges, key=lambda x: x["to"]):
            mark = "" if e.get("confidence") == "certain" else " *(unverified)*"
            seeded.append("- [[%s]] - %s%s  <!-- %s, %s -->"
                          % (e["to"], e.get("clause", "").strip().rstrip("."), mark,
                             e.get("relation", "?"), e.get("evidence", "no evidence recorded")))
    else:
        seeded = ["<!-- Nothing in the closed rounds connects this page to another. That is a finding,",
                  "     not an oversight - it is one of the things this wiki was built to show. -->",
                  "",
                  "*Nothing yet connects to this.*"]
    head += [block("SEEDED", "edges", "\n".join(seeded)), ""]

    head += ["---", ""]
    rows = ["## Sources", "",
            "Every ruling that decides something on this page. The wording is each ruling's own.", ""]
    if items:
        rows += ["| Ruling | What it says | Status |", "|---|---|---|"]
        for r in sorted(items, key=lambda x: (x["round"], int(re.sub(r"[^0-9]", "", x["n"]) or 0))):
            kind, _ = later_ruling(r.get("superseded_by"))
            note = ""
            if kind == "SUPERSEDED":
                note = "**SUPERSEDED - do not state this as a rule**"
            elif kind:
                note = kind
            if r.get("not_built"):
                note = (note + " · " if note else "") + "ruled, not built"
            rows.append("| %s | %s | %s |"
                        % (index_link(rounds, r["round"], r["n"]),
                           r["title"].replace("|", "/").strip(), note))
        rows.append("")
        rows.append("*%d rulings feed this page.*" % len(items))
    else:
        rows.append("*No closed ruling decides anything on this page yet.*")
    rows += ["", stamp]
    head += [block("GENERATED", "sources", "\n".join(rows)), ""]
    return "\n".join(head)


def name_of(p):
    return p["page"]


VERB_GLOSS = {
    "Separate": "this ground leaves the state it is in",
    "Reunify": "a broken state is put back together",
    "Unify": "several states become one nation that never existed",
    "Rejoin": "ground returns to a parent that still exists",
    "Expand": "our own people push us to take ground",
    "Reconquer": "our own people demand we take back what we lost",
}
ADJ_GLOSS = {
    "autonomist": "bought off with self-rule",
    "economic": "bought off with a policy or money",
    "cultural": "bought off with recognition",
    "resource": "bought off with a share of the ground",
    "indigenous": "bought off with sovereignty or land",
    "religious": "cannot be bought off",
    "ideological": "bought off only by becoming them",
}
OLD_IDEOLOGY = {"red": "Republican", "blue": "Democrat", "green": "Democratic Socialist",
                "yellow": "Conservative Nationalist", "orange": "Distributist",
                "purple": "Socialist"}


def later_ruling(text):
    """Classify what a LATER ruling did to this one. The distinction is load-bearing.

    The round documents record every kind of follow-on in the same breath - replaced,
    refined, renamed, confirmed-and-unchanged. Presenting all of them as "superseded"
    would retire rules that are still live, which is the single most damaging thing
    this wiki could publish. When the wording does not clearly say replaced, the
    honest label is the weaker one.
    """
    if not text:
        return "", ""
    low = text.lower()
    if any(w in low for w in ("superseded", "supersedes", "replaces", "replaced by",
                              "premise is dropped", "no longer stands", "struck by")):
        return "SUPERSEDED", text
    if any(w in low for w in ("confirmed rather than changed", "stands and nothing",
                              "stands unchanged", "left unchanged", "confirmed")):
        return "confirmed later", text
    return "amended later", text


def secession_line(cap_today, cap_ruled):
    """Whether this movement can ever organise enough of an Area to take it.

    The growth cap is a ceiling, not a line that gets crossed - a movement's share is
    clamped at it. Its only job is deciding whether the 0.40 secession line is
    reachable at all, which is exactly the defect ruling 41 was written to fix.
    """
    today_ok = cap_today is not None and cap_today >= 0.40
    if cap_ruled is None:
        return ("Reachable." if today_ok
                else "**This movement can never reach it alone** - its ceiling is below the line.")
    ruled_ok = cap_ruled >= 0.40
    if ruled_ok and not today_ok:
        return ("**Reachable under the ruling, not in the running game.** The raised ceiling is "
                "what makes the line reachable, and it has not been applied.")
    return "Reachable." if ruled_ok else "**Never reachable alone.**"


def write_movement_pages(movements, parties, by_page, all_rulings, stamp, report, dry):
    """One page per live movement. Its figures come from data/parties.json every run.

    This is the page Aaron went looking for when he asked "where is Sagebrush" and
    found the answer in four places at once.
    """
    for m in movements:
        if not m["live"]:
            continue
        rec = parties.get(m["name"], {})
        name = m["name"]
        # A ruling that NAMES this movement belongs on its page, whatever topic page it
        # was filed under. Without this, the Sagebrush page says no ruling names it -
        # while ruling 41 is entirely about it.
        items = list(by_page.get(name, []))
        seen = {(r["round"], r["n"]) for r in items}
        needles = [name.lower()] + [a.lower() for a in m.get("aliases", [])]
        for r in all_rulings:
            if (r["round"], r["n"]) in seen:
                continue
            hay = r["title"].lower() + " " + r.get("body", "")
            if any(nd in hay for nd in needles):
                items.append(r)
                seen.add((r["round"], r["n"]))

        pos = m.get("position") or "not placed"
        pos_link = "[[%s]]" % pos if m.get("position") else "*not placed*"
        settled = "" if m.get("position_settled") else "  ← **not settled**"
        old = OLD_IDEOLOGY.get(m.get("old_ideology", ""), m.get("old_ideology", "?"))

        cap_today = m.get("cap_today")
        cap_ruled = m.get("cap_ruled")
        if cap_ruled is not None:
            cap_line = ("**%.2f ruled, %.2f running.** Politics ruling 41 raised it and says in as "
                        "many words that the change was not applied, because a design session does "
                        "not touch the data." % (cap_ruled, cap_today))
        else:
            cap_line = "%.2f" % cap_today if cap_today is not None else "not set"

        counties = len(rec.get("counties", []) or [])
        core = len(rec.get("core", []) or [])

        facts = [
            "| | |", "|---|---|",
            "| **Verb** | **%s** — %s |" % (m["verb"] or "none",
                                            VERB_GLOSS.get(m["verb"], "not a movement under this model")),
            "| **Adjective** | **%s** — %s |" % (m["adjective"] or "none",
                                                 ADJ_GLOSS.get(m["adjective"], "—")),
            "| **Politics, ruled** | %s%s |" % (pos_link, settled),
            "| **Politics, running** | %s — the game still carries the old six ideologies |" % old,
            "| **Growth cap** | %s |" % cap_line,
            "| **Secession line** | An Area leaves at 0.40. %s |" % secession_line(cap_today, cap_ruled),
            "| **Where it is** | %s |" % m["where"],
            "| **What it wants** | *%s* |" % m["goal"],
            "| **Ground** | %d counties (%d core), which merge into %d Areas (%d core) |"
            % (counties, core, m["homeland_areas"], m["core_areas"]),
            "| **Spawns** | %s |" % ("in every game" if m["always"] else "on a roll"),
            "| **At turn 0** | %s |" % m["status"],
            "| **Id in the data** | `%s` |" % m["id"],
        ]
        if m.get("position_note"):
            facts += ["", "**On the placement.** %s" % m["position_note"]]
        if m.get("aaron_note"):
            facts += ["", "> [!quote] Aaron, on the Movement Register, 7 September 2026",
                      "> %s" % m["aaron_note"]]

        tags = ["secession/movements"]
        if m.get("position"):
            tags.append("ideology/positions")

        body = [
            frontmatter([("title", name), ("topic", "secession"), ("tags", tags),
                         ("kind", "movement"), ("verb", m["verb"] or "none"),
                         ("status", "needs writing")]),
            "",
            "# %s" % name,
            "",
            "> [!abstract] At a glance",
            "> **A %s movement** — %s" % (m["verb"].lower() if m["verb"] else "verbless",
                                          VERB_GLOSS.get(m["verb"], "no verb")),
            "> **Politics:** %s · **Ground:** %s" % (pos, m["where"]),
            "> **This page:** not yet written",
            "",
            "## What it is",
            "",
            "<!-- WRITER: one paragraph. Who are these people and what do they want? Aaron's own note",
            "     in the table below is the best starting point where there is one. -->",
            "",
            "## How it works in the game",
            "",
            "<!-- WRITER: what this movement DOES - how it grows, what its verb makes it demand, what",
            "     a government can offer it. Its adjective says what would make it stop. -->",
            "",
            block("GENERATED", "facts", "\n".join(facts)),
            "",
            "## The story behind it",
            "",
            "<!-- WRITER: the in-world explanation. Leave the line below until something is written. -->",
            "",
            "*Not yet written.*",
            "",
            "## Interacts with",
            "",
        ]
        seeded = ["- [[Movements]] — what a movement is, and the register all thirty-two sit in",
                  "- [[%s]] — the position it holds on the political board" % pos
                  if m.get("position") else "",
                  "- [[Homelands]] — the ground it is allowed to organise on",
                  "<!-- WRITER: add the ones that matter. Which nations does it threaten? Which other",
                  "     movement is it competing with? Aaron's notes name several. -->"]
        body += [block("SEEDED", "edges", "\n".join(x for x in seeded if x)), "", "---", ""]

        rows = ["## Sources", ""]
        if items:
            rows += ["| Ruling | What it says |", "|---|---|"]
            for r in items:
                rows.append("| %s | %s |" % (index_link_global(r), r["title"].replace("|", "/").strip()))
        else:
            rows.append("*No closed ruling names this movement directly. Its figures come from the "
                        "game data and the Movement Register.*")
        rows += ["",
                 "Figures read from `data/parties.json`. Verb, adjective and Aaron's note come from the "
                 "Movement Register, brought into the project as `build/wiki_movements.json`. The "
                 "political position is politics ruling 41's re-map.",
                 "", stamp]
        body += [block("GENERATED", "sources", "\n".join(rows)), ""]

        write_page(page_path(name), "\n".join(body), report, name, dry)


def write_home(spine, by_page, movements, stamp, report, dry):
    """The vault's front page - where Aaron lands and where a writer starts."""
    rows = []
    for m in spine["master_topics"]:
        kids = m.get("children", [])
        fed = sum(1 for c in kids if by_page.get(c))
        if not kids:
            state = "**nothing yet** - its design round has not run"
        elif fed < len(kids):
            state = "%d pages, %d of them with closed rulings behind them" % (len(kids), fed)
        else:
            state = "%d pages" % len(kids)
        rows.append("### [[%s]]" % m["page"])
        rows.append(m["one_line"])
        rows.append("")
        rows.append("*%s*" % state)
        if kids:
            rows.append("")
            rows.append(" · ".join("[[%s]]" % c for c in kids))
        rows.append("")

    live = sorted([x for x in movements["movements"] if x["live"]], key=lambda y: y["name"])
    rows += ["### The movements", "",
             "**%d live movements**, each with a page of its own. "
             "[[Movement register]] is all of them on one screen, grouped by what they want."
             % len(live), "",
             " · ".join("[[%s]]" % x["name"] for x in live), ""]

    body = [
        frontmatter([("title", "Start here"), ("topic", "index"),
                     ("kind", "index"), ("status", "generated")]),
        "",
        "# Manifest Disunity - the design wiki",
        "",
        "> [!abstract] What this is",
        "> A browser strategy game about the United States coming apart and being put back",
        "> together. It opens on **1 March 2036** with sixty-one nations where fifty states",
        "> used to be. One turn is one quarter of a year.",
        "> ",
        "> This wiki indexes what has been **decided** about it, organised by subject rather",
        "> than by the date it was decided. It does not hold the design - every page links",
        "> back to the document where the decision actually lives.",
        "",
        "**Writing for this wiki?** Read [[WRITERS-GUIDE]] first.",
        "**Looking for something?** Use the tag pane, or open the graph view and see what",
        "connects to what - that is what this wiki was built for.",
        "",
        "---",
        "",
        block("GENERATED", "home", "\n".join(rows)),
        "",
        "---",
        "",
        "## What is not in here yet",
        "",
        "Three of the seven design rounds are closed - secession, military conquest and",
        "politics. **The economy round is open now; events and the questions above the whole",
        "game have not run.** Where a page looks thin, that is usually why, and the page says",
        "so on its face.",
        "",
        "[[_build-report]] lists everything the generator knows is wrong or unfinished,",
        "including the rulings that a later ruling superseded.",
        "",
        stamp,
        "",
    ]
    write_page(page_path("Start here"), "\n".join(body), report, "Start here", dry)


def write_register(movements, parties, stamp, report, dry):
    """The whole roster on one screen - the thing Aaron looks things up in."""
    live = [m for m in movements["movements"] if m["live"]]
    struck = [m for m in movements["movements"] if not m["live"]]
    by_verb = {}
    for m in live:
        by_verb.setdefault(m["verb"] or "No verb", []).append(m)

    rows = []
    for verb in ("Separate", "Reunify", "Unify", "Expand", "Rejoin", "Reconquer", "No verb"):
        mine = by_verb.get(verb)
        if not mine:
            continue
        rows += ["### %s — %s" % (verb, VERB_GLOSS.get(verb, "")), "",
                 "| Movement | Adjective | Politics | Cap | Ground |", "|---|---|---|---|---|"]
        for m in sorted(mine, key=lambda x: -x["homeland_areas"]):
            cap = m.get("cap_today")
            if m.get("cap_ruled") is not None:
                capcell = "**%.2f** ruled / %.2f running" % (m["cap_ruled"], cap)
            else:
                capcell = "%.2f" % cap if cap is not None else "—"
                if cap is not None and cap < 0.40:
                    capcell += " *(below the line)*"
            rows.append("| [[%s]] | %s | %s%s | %s | %d Areas |"
                        % (m["name"], m["adjective"] or "—",
                           m["position"] or "—",
                           "" if m.get("position_settled") else " ?",
                           capcell, m["homeland_areas"]))
        rows.append("")

    rows += ["### Struck", "",
             "Struck by secession ruling 45 and **still present in the game data**. They are not part "
             "of the design and have no page.", ""]
    for m in struck:
        rows.append("- %s — `%s`" % (m["name"], m["id"]))
    rows += ["",
             "A **?** on a position means the placement was authored rather than ruled, and is Aaron's "
             "to confirm. A cap below 0.40 means the movement can never on its own organise enough of "
             "an Area to take it.", "", stamp]

    body = [
        frontmatter([("title", "Movement register"), ("topic", "secession"),
                     ("tags", ["secession/movements"]), ("kind", "index"),
                     ("status", "generated")]),
        "",
        "# Movement register",
        "",
        "> [!abstract] At a glance",
        "> **%d live movements**, %d struck. Every one has a verb — what it acts on — and an "
        "adjective — what would make it stop." % (len(live), len(struck)),
        "> Grouped by verb. Click a name for its own page.",
        "",
        block("GENERATED", "register", "\n".join(rows)),
        "",
    ]
    write_page(page_path("Movement register"), "\n".join(body), report, "Movement register", dry)


_ROUND_LABELS = {}


def index_link_global(r):
    label = _ROUND_LABELS.get(r["round"], r["round"])
    return "[[Rulings - %s#%s ruling %s]]" % (label, label, r["n"])


def write_master_pages(spine, by_page, stamp, report, dry):
    for m in spine["master_topics"]:
        children = m.get("children", [])
        lines = [
            frontmatter([("title", m["page"]), ("topic", m["topic"]),
                         ("tags", [m["tag"]]), ("kind", "index"),
                         ("status", "needs writing")]),
            "",
            "# %s" % m["page"],
            "",
            "*%s*" % m["one_line"],
            "",
            "## What this covers",
            "",
            "<!-- WRITER: a paragraph introducing this whole system, the way a wiki front page does. -->",
            "",
            "## Pages",
            "",
        ]
        kids = []
        for c in children:
            n = len(by_page.get(c, []))
            kids.append("- [[%s]]%s" % (c, "" if n else "  - *nothing decided yet*"))
        if not kids:
            kids = ["*Nothing here yet. This system has not had its design round.*"]
        lines += [block("GENERATED", "children", "\n".join(kids)), "", stamp, ""]
        write_page(page_path(m["page"]), "\n".join(lines), report, m["page"], dry)


def write_report(report, stamp, dry):
    order = [
        ("missing_rulings", "Rulings the generator could not find in their source document"),
        ("moved_titles", "Rulings whose recorded wording no longer matches the document"),
        ("orphan_rulings", "Rulings in a round document that no page claims"),
        ("unknown_pages", "Rulings assigned to a page that does not exist in the spine"),
        ("superseded_cited", "SUPERSEDED rulings that pages still cite - these are not rules"),
        ("touched_later", "Rulings a later ruling amended or confirmed - still live, read both"),
        ("isolated", "Pages nothing links to and which link to nothing"),
        ("reattached", "Pages where a generated block had been deleted and was put back"),
        ("created", "Pages created this run"),
        ("updated", "Pages whose generated blocks changed"),
        ("unchanged", "Pages that did not change"),
    ]
    out = ["# Wiki build report", "",
           "Written by `build/build_wiki.py`. Read the first six sections; they are the ones",
           "that mean something is wrong or something new has arrived.", ""]
    for key, title in order:
        items = report[key]
        out.append("## %s - %d" % (title, len(items)))
        out.append("")
        if items:
            out += ["- %s" % i for i in sorted(items)]
        else:
            out.append("*None.*")
        out.append("")
    out.append(stamp)
    if not dry:
        os.makedirs(WIKI, exist_ok=True)
        with open(os.path.join(WIKI, "_build-report.md"), "w", encoding="utf-8", newline="\n") as f:
            f.write("\n".join(out) + "\n")


def package(spine):
    """A standalone vault for a writer working outside this folder.

    Documents only - no code, no data, no game. It opens in Obsidian on its own.
    """
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, "manifest-disunity-wiki.zip")
    skip_dirs = {"control-board", "data"}
    skip_files = {"CODE-REVIEW-FINDINGS.md"}
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for name in ("DESIGN.md", "DECISIONS.md", "CLAUDE.md", "README.md"):
            p = os.path.join(ROOT, name)
            if os.path.exists(p):
                z.write(p, name)
        for base, dirs, files in os.walk(DOCS):
            dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith(".")]
            for fn in files:
                if fn in skip_files or not fn.endswith((".md", ".html")):
                    continue
                full = os.path.join(base, fn)
                z.write(full, os.path.relpath(full, ROOT).replace("\\", "/"))
        ob = os.path.join(ROOT, ".obsidian")
        for base, _dirs, files in os.walk(ob):
            for fn in files:
                full = os.path.join(base, fn)
                z.write(full, os.path.relpath(full, ROOT).replace("\\", "/"))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true",
                    help="report only; write nothing")
    ap.add_argument("--package", action="store_true",
                    help="also write dist/manifest-disunity-wiki.zip, a standalone vault")
    args = ap.parse_args()

    spine = read_json(SPINE)
    rulings = read_json(RULINGS)
    edges = read_json(EDGES)
    movements = read_json(MOVEMENTS)
    parties = read_json(PARTIES)
    aliases = read_json(ALIASES)["movements"]
    for m in movements["movements"]:
        m["aliases"] = aliases.get(m["name"], {}).get("aliases", [])

    # The spine names a master page per topic; fold it onto each page so the
    # page writer does not have to look it up.
    master_by_topic = {m["topic"]: m for m in spine["master_topics"]}
    for p in spine["pages"]:
        p["master_page"] = master_by_topic[p["topic"]]["page"]
        p["tag"] = p.get("tag") or "%s/%s" % (p["topic"], slug(p["page"]).lower().replace(" ", "-"))
        if p.get("second_topic"):
            p["second_tag"] = master_by_topic[p["second_topic"]]["tag"]
    # Movements and the ten positions are instances of one sub-topic each, not a
    # sub-topic apiece - twenty-six leaf tags holding one page each is noise.
    for p in spine["pages"]:
        if p["topic"] == "ideology" and p.get("kind") == "ideology":
            p["tag"] = "ideology/positions"
    for m in spine["master_topics"]:
        kids = [p["page"] for p in spine["pages"] if p["topic"] == m["topic"]]
        if m["topic"] == "secession":
            kids.append("Movement register")
        m.setdefault("children", kids)

    # Give each ruling its round's display label, for the index headings.
    for r in rulings["rulings"]:
        r["round_label"] = rulings["rounds"][r["round"]]["label"]

    report = build(spine, rulings, edges, movements, parties, args.check)

    print("wiki: %d pages created, %d updated, %d unchanged"
          % (len(report["created"]), len(report["updated"]), len(report["unchanged"])))
    for key, label in (("missing_rulings", "rulings not found in source"),
                       ("moved_titles", "ruling titles that have moved on"),
                       ("orphan_rulings", "rulings no page claims"),
                       ("unknown_pages", "assignments to pages that do not exist"),
                       ("isolated", "pages connected to nothing")):
        if report[key]:
            print("  %-40s %d" % (label, len(report[key])))
            for item in sorted(report[key])[:10]:
                print("      %s" % item)
            if len(report[key]) > 10:
                print("      ... and %d more, see docs/wiki/_build-report.md" % (len(report[key]) - 10))
    if args.check:
        print("  --check: nothing written")
    if args.package and not args.check:
        print("packaged: %s" % package(spine))


if __name__ == "__main__":
    main()
