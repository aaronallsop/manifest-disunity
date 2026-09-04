#!/usr/bin/env python3
"""
Build a ship-ready folder for a playtest, and a zip beside it.

    python build/package_playtest.py                 -> dist/playtest/ + dist/playtest.zip
    python build/package_playtest.py --out somewhere
    python build/package_playtest.py --no-zip

WHY THIS EXISTS RATHER THAN A README LINE. The upload is "everything except six
things", and one of those six is `data/state.json` — the author's own game in
progress. Hand-picking that correctly every time is a coin flip, and getting it
wrong ships a save that every tester then resumes into, which looks exactly like
the game being broken.

WHAT GOES: index.html, css/, js/, lib/, data/ and content/. That is what the
page fetches and nothing else.

WHAT STAYS: build/ (the bakes; the JSON they produce is what ships), tests/,
docs/, dev.html (the tuning dashboard), server.py (a static host does not run
it), and data/state.json.

The manifest is checked against what index.html actually asks for, so a script
tag added without a thought here fails the package rather than 404ing on a
tester's machine.
"""

import argparse
import os
import re
import shutil
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Files and directories the page needs, relative to the repo root.
INCLUDE_FILES = ["index.html"]
INCLUDE_DIRS = ["css", "js", "lib", "data", "content"]

# ...minus these, which live in an included directory but must not ship.
#
# FORWARD SLASHES EVERYWHERE. Paths are compared against what index.html asks
# for, and HTML always uses "/" — so every path in this file is normalised to
# it rather than to the host OS's separator. The first version used os.path.join
# and every single manifest check failed on Windows.
EXCLUDE = {
    "data/state.json",                           # the author's own game
}
EXCLUDE_PREFIXES = (
    "content/save-",                             # the author's named saves
    "content/telemetry-",                        # and anybody's sessions
)


def rel_posix(full, start):
    return os.path.relpath(full, start).replace(os.sep, "/")


def wanted(rel):
    if rel in EXCLUDE:
        return False
    return not rel.startswith(EXCLUDE_PREFIXES)


def referenced_scripts():
    """Every local src/href index.html asks for, so the manifest can be checked."""
    with open(os.path.join(ROOT, "index.html"), encoding="utf-8") as f:
        html = f.read()
    refs = re.findall(r'(?:src|href)="([^"]+)"', html)
    return [r for r in refs if not r.startswith(("http:", "https:", "//", "data:"))]


def collect():
    out = []
    for rel in INCLUDE_FILES:
        if os.path.exists(os.path.join(ROOT, rel)):
            out.append(rel)
    for d in INCLUDE_DIRS:
        base = os.path.join(ROOT, d)
        if not os.path.isdir(base):
            continue
        for dirpath, _dirnames, filenames in os.walk(base):
            for name in sorted(filenames):
                full = os.path.join(dirpath, name)
                rel = rel_posix(full, ROOT)
                if wanted(rel):
                    out.append(rel)
    return sorted(set(out))


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", default=os.path.join(ROOT, "dist", "playtest"),
                    help="where to write the folder (default: dist/playtest)")
    ap.add_argument("--no-zip", action="store_true", help="skip the zip")
    args = ap.parse_args()

    files = collect()

    # EVERY SCRIPT index.html ASKS FOR HAS TO BE IN THE PACKAGE. A tag added
    # without updating this file is a 404 on somebody else's machine, which is
    # the one failure mode a playtester cannot report usefully.
    missing = [r for r in referenced_scripts()
               if r not in files and os.path.exists(os.path.join(ROOT, *r.split("/")))]
    if missing:
        print("index.html asks for files the package does not include:")
        for m in missing:
            print("   ", m)
        return 2

    dead = [r for r in referenced_scripts()
            if not os.path.exists(os.path.join(ROOT, *r.split("/")))]
    if dead:
        print("index.html asks for files that do not exist:")
        for d in dead:
            print("   ", d)
        return 2

    if os.path.isdir(args.out):
        shutil.rmtree(args.out)
    total = 0
    for rel in files:
        src = os.path.join(ROOT, *rel.split("/"))
        dst = os.path.join(args.out, *rel.split("/"))
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        total += os.path.getsize(src)

    print(f"{len(files)} files, {total / 1e6:.1f} MB -> {args.out}")

    # A tester who resumes into somebody else's save reports the game as broken.
    for gone in sorted(EXCLUDE):
        shipped = os.path.exists(os.path.join(args.out, *gone.split("/")))
        print(f"  !! {gone} SHIPPED" if shipped else f"  excluded: {gone}")

    if not args.no_zip:
        zpath = args.out.rstrip("/\\") + ".zip"
        with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
            for rel in files:
                z.write(os.path.join(args.out, *rel.split("/")), rel)
        print(f"{os.path.getsize(zpath) / 1e6:.1f} MB -> {zpath}")

    print("\nUpload the folder (or the zip's contents) to any static host, then send:")
    print("    https://your-host/index.html?playtest=1")
    print("See docs/PLAYTEST.md.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
