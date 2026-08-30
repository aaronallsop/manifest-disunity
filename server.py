#!/usr/bin/env python3
"""
Nation States local development server.

Serves the repo as static files exactly the way `python -m http.server` did, and adds the
write endpoints the game needs. Browsers cannot write files; the target design's "one JSON
that the editor, the game and tooling all read and write in place" therefore needs a local
process to own the state file. This is that process.

    GET  /api/state              -> data/state.json      (404 if it does not exist yet)
    PUT  /api/state              -> atomically write data/state.json
    DELETE /api/state            -> remove data/state.json (start a fresh game)
    GET  /api/content            -> list the authored documents in content/
    GET  /api/content/<name>.json-> content/<name>.json   (404 if absent)
    PUT  /api/content/<name>.json-> atomically write content/<name>.json
    DELETE /api/content/<name>.json -> remove content/<name>.json

`<name>` is validated against ^[a-z0-9-]+$, so path traversal is impossible: the name can
contain no slash, no dot and no backslash, and it is joined to a fixed directory.

Writes are atomic: the payload goes to `<target>.tmp` in the same directory, is flushed and
fsync'd, then `os.replace`d over the target. A crash mid-write leaves the previous file intact.

Standard library only. No pip installs. Binds 127.0.0.1 only.

    python server.py [--port 8000]
"""

import argparse
import json
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
CONTENT_DIR = os.path.join(ROOT, "content")
STATE_PATH = os.path.join(DATA_DIR, "state.json")

NAME_RE = re.compile(r"^[a-z0-9-]+$")
MAX_BODY = 64 * 1024 * 1024  # 64 MB — a full columnar state document is ~1 MB


def atomic_write(path, payload: bytes):
    """Write `payload` to `path` via a same-directory temp file + os.replace."""
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    tmp = path + ".tmp"
    with open(tmp, "wb") as f:
        f.write(payload)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


class Handler(SimpleHTTPRequestHandler):
    # Serve from the repo root regardless of the shell's cwd.
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    # ---- helpers -------------------------------------------------------

    def _send_json(self, obj, status=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path):
        if not os.path.exists(path):
            return self._send_json({"error": "not found", "path": os.path.relpath(path, ROOT)}, 404)
        with open(path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_body(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return None, "bad Content-Length"
        if length <= 0:
            return None, "empty body"
        if length > MAX_BODY:
            return None, "body too large"
        return self.rfile.read(length), None

    def _content_path(self, name):
        """Resolve `<name>.json` under content/, or None if the name is not allowed."""
        if not name.endswith(".json"):
            return None
        stem = name[: -len(".json")]
        if not NAME_RE.match(stem):
            return None
        return os.path.join(CONTENT_DIR, stem + ".json")

    # ---- routing -------------------------------------------------------

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/state":
            return self._send_file(STATE_PATH)
        if path == "/api/content":
            names = []
            if os.path.isdir(CONTENT_DIR):
                names = sorted(
                    n for n in os.listdir(CONTENT_DIR)
                    if n.endswith(".json") and NAME_RE.match(n[:-5])
                )
            return self._send_json({"content": names})
        if path.startswith("/api/content/"):
            target = self._content_path(path[len("/api/content/"):])
            if target is None:
                return self._send_json({"error": "bad content name"}, 400)
            return self._send_file(target)
        if path.startswith("/api/"):
            return self._send_json({"error": "unknown endpoint", "path": path}, 404)
        return super().do_GET()

    def do_PUT(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/state":
            target = STATE_PATH
        elif path.startswith("/api/content/"):
            target = self._content_path(path[len("/api/content/"):])
            if target is None:
                return self._send_json({"error": "bad content name"}, 400)
        else:
            return self._send_json({"error": "unknown endpoint", "path": path}, 404)

        body, err = self._read_body()
        if err:
            return self._send_json({"error": err}, 400)
        try:
            json.loads(body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            return self._send_json({"error": "body is not valid JSON", "detail": str(e)}, 400)

        try:
            atomic_write(target, body)
        except OSError as e:
            return self._send_json({"error": "write failed", "detail": str(e)}, 500)
        return self._send_json({"ok": True, "path": os.path.relpath(target, ROOT).replace("\\", "/"),
                                "bytes": len(body)})

    def do_DELETE(self):
        path = self.path.split("?", 1)[0]
        if path == "/api/state":
            target = STATE_PATH
        elif path.startswith("/api/content/"):
            # Content is authored and committed, so deleting one is a real
            # operation, not a convenience. Two callers wanted it and both were
            # working around its absence: the save browser wrote a "deleted"
            # tombstone that the listing then had to filter out, and the test
            # suite left its scratch documents on disk, one of which was
            # committed as authored content.
            target = self._content_path(path[len("/api/content/"):])
            if target is None:
                return self._send_json({"error": "bad content name"}, 400)
        else:
            return self._send_json({"error": "unknown endpoint", "path": path}, 404)

        existed = os.path.exists(target)
        if existed:
            try:
                os.remove(target)
            except OSError as e:
                return self._send_json({"error": "delete failed", "detail": str(e)}, 500)
        return self._send_json({"ok": True, "existed": existed})

    # Dev server: never let the browser cache a module mid-rewrite. This is what
    # retires the hand-bumped ?v= query strings in index.html.
    def end_headers(self):
        if not self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Quieter than the default: static GETs are noise, API calls are not.
        if self.path.startswith("/api/") or not fmt.startswith('"%s"'):
            sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main():
    ap = argparse.ArgumentParser(description="Nation States dev server (stdlib only).")
    ap.add_argument("--port", type=int, default=8000)
    args = ap.parse_args()

    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(CONTENT_DIR, exist_ok=True)

    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"Nation States on http://127.0.0.1:{args.port}/  (serving {ROOT})")
    print("  GET/PUT/DELETE /api/state          -> data/state.json")
    print("  GET/PUT/DELETE /api/content/<name>.json -> content/<name>.json")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nstopped")
        server.server_close()


if __name__ == "__main__":
    main()
