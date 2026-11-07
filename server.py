"""Loopback-only, stdlib local server. No external assets or arbitrary text input."""

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from engine import Analyzer
from fixtures import CASES, case_list


ROOT = Path(__file__).resolve().parent
MAX_BODY_BYTES = 2048
STATIC = {"/": ("index.html", "text/html; charset=utf-8"), "/app.js": ("app.js", "text/javascript; charset=utf-8"), "/style.css": ("style.css", "text/css; charset=utf-8")}


def make_handler(analyzer):
    class Handler(BaseHTTPRequestHandler):
        server_version = "HandoffGate"
        sys_version = ""
        protocol_version = "HTTP/1.0"

        def log_message(self, format, *args):
            # No request paths, bodies, upstream messages or credentials in logs.
            pass

        def _send(self, status, data, content_type="application/json; charset=utf-8"):
            body = json.dumps(data, ensure_ascii=False, allow_nan=False).encode("utf-8") if isinstance(data, dict) else data
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
            self.end_headers()
            self.wfile.write(body)

        def _error(self, status, message):
            self._send(status, {"error": message})

        def _local_request(self):
            port = self.server.server_address[1]
            hosts = ("127.0.0.1:" + str(port), "localhost:" + str(port))
            host = self.headers.get_all("Host", [])
            origin = self.headers.get_all("Origin", [])
            if len(host) != 1 or host[0].lower() not in hosts:
                self._error(403, "Only the local application origin is accepted.")
                return False
            if len(origin) > 1 or (origin and origin[0] != "http://" + host[0].lower()):
                self._error(403, "Only the local application origin is accepted.")
                return False
            return True

        def do_GET(self):
            if not self._local_request():
                return
            if self.path == "/api/health":
                self._send(200, {"liveAvailable": analyzer.live_available, "mode": "synthetic-only", "project": "Handoff Gate"})
            elif self.path == "/api/cases":
                self._send(200, {"cases": case_list()})
            elif self.path in STATIC:
                filename, content_type = STATIC[self.path]
                try:
                    self._send(200, (ROOT / "web" / filename).read_bytes(), content_type)
                except OSError:
                    self._error(404, "Local asset is unavailable.")
            else:
                self._error(404, "Route not found.")

        def do_POST(self):
            if not self._local_request():
                return
            if self.path != "/api/analyze":
                self._error(404, "Route not found.")
                return
            if self.headers.get_content_type() != "application/json":
                self._error(415, "Expected application/json.")
                return
            lengths = self.headers.get_all("Content-Length", [])
            if self.headers.get("Transfer-Encoding") or len(lengths) != 1 or not lengths[0].isdigit():
                self._error(400, "A single bounded Content-Length is required.")
                return
            if len(lengths[0]) > 10:
                self._error(413, "Request exceeds the local fixture limit.")
                return
            length = int(lengths[0])
            if length > MAX_BODY_BYTES:
                self._error(413, "Request exceeds the local fixture limit.")
                return
            if length <= 0:
                self._error(400, "Expected a case and mode.")
                return
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"), object_pairs_hook=_unique_object, parse_constant=_reject_constant)
                if not isinstance(payload, dict) or set(payload) != {"caseId", "mode"}:
                    raise ValueError()
                if not isinstance(payload["caseId"], str) or payload["caseId"] not in CASES or payload["mode"] not in ("replay", "live"):
                    raise ValueError()
            except (ValueError, UnicodeError, TypeError):
                self._error(400, "Only a bundled caseId and replay/live mode are accepted.")
                return
            try:
                self._send(200, analyzer.analyze(payload["caseId"], payload["mode"]))
            except Exception:
                self._error(500, "Local analysis could not complete safely.")

    return Handler


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("Duplicate JSON member")
        result[key] = value
    return result


def _reject_constant(value):
    raise ValueError("Non-finite JSON number")


def create_server(port=8787, analyzer=None):
    return ThreadingHTTPServer(("127.0.0.1", port), make_handler(analyzer if analyzer is not None else Analyzer()))


def main():
    parser = argparse.ArgumentParser(description="Private local Handoff Gate demo")
    parser.add_argument("--port", type=int, default=8787)
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error("Port must be between 0 and 65535")
    server = create_server(args.port)
    print("Handoff Gate local demo: http://127.0.0.1:" + str(server.server_address[1]) + "/", flush=True)
    print("Bundled synthetic cases only. Replay makes no API requests. Scripts are never executed.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
