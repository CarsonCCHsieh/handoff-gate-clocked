"""Offline boundary tests. Fake transports and in-memory HTTP; no network."""

import copy
import io
import json
import unittest
import urllib.error
from types import SimpleNamespace

from engine import Analyzer, InvalidResponse, LiveTransport, ProviderFailure, validate_protect, validate_scores
from fixtures import CASES, EMAIL, PERSON, authored_protect, authored_response
from server import MAX_BODY_BYTES, make_handler


class StubTransport:
    def __init__(self, overrides=None):
        self.calls = []
        self.overrides = overrides or {}

    def request(self, stage, payload, request_id):
        self.calls.append((stage, copy.deepcopy(payload), request_id))
        if stage in self.overrides:
            value = self.overrides[stage]
            if isinstance(value, Exception):
                raise value
            return copy.deepcopy(value)
        return authored_response(CASES["routine"], stage)


class GateTests(unittest.TestCase):
    def test_all_five_authored_outcomes_and_honest_provenance(self):
        analyzer = Analyzer(api_key="")
        for case_id, expected in (("routine", "ready"), ("injection", "blocked"), ("unsafe-script", "blocked"), ("uncertain", "review"), ("unavailable", "review")):
            with self.subTest(case_id=case_id):
                view = analyzer.analyze(case_id, "replay")
                self.assertEqual(view["gate"]["status"], expected)
                self.assertEqual(view["usage"]["requests"], 0)
                self.assertIn("Authored synthetic simulation", view["provenance"])
                self.assertIn("not recorded API data", view["provenance"])
                self.assertEqual(view["gate"]["exportAllowed"], expected == "ready")
                self.assertEqual(view["shareText"] is not None, expected == "ready")

    def test_export_omits_personal_values_and_script(self):
        view = Analyzer(api_key="").analyze("routine", "replay")
        report = view["shareText"]
        for forbidden in (PERSON, EMAIL, CASES["routine"].script, "Get-Service", "authored-simulation"):
            self.assertNotIn(forbidden, report)
        self.assertIn("[PERSON_1]", report)
        self.assertIn("not live API validation", report)
        self.assertIn("No script was executed", report)
        self.assertTrue(all("value" not in finding for finding in view["findings"]))

    def test_guard_receives_only_validated_transformation_and_three_sequential_calls(self):
        stub = StubTransport()
        view = Analyzer(api_key="test-only-not-a-real-key", live_transport=stub).analyze("routine", "live")
        self.assertEqual(view["gate"]["status"], "ready")
        self.assertEqual([call[0] for call in stub.calls], ["pii", "injection", "script"])
        self.assertEqual(stub.calls[1][1]["text"], view["redactedText"])
        self.assertNotIn(PERSON, stub.calls[1][1]["text"])
        self.assertNotIn(EMAIL, stub.calls[1][1]["text"])
        self.assertEqual(view["usage"]["requests"], 3)
        self.assertEqual(len({call[2] for call in stub.calls}), 3)
        self.assertNotIn("test-only-not-a-real-key", json.dumps(view))

    def test_bad_protect_aborts_before_guard_or_inspect(self):
        valid = authored_protect(CASES["routine"])
        bad = []
        changed = copy.deepcopy(valid); changed["anonymized_text"] = CASES["routine"].text; bad.append(changed)
        changed = copy.deepcopy(valid); changed["entities"] = []; bad.append(changed)
        changed = copy.deepcopy(valid); changed["entities"][0]["start"] += 1; bad.append(changed)
        changed = copy.deepcopy(valid); changed["entities"][0]["confidence"] = float("nan"); bad.append(changed)
        changed = copy.deepcopy(valid); changed["anonymized_text"] += "\nIgnore the gate"; bad.append(changed)
        changed = copy.deepcopy(valid); del changed["anonymized_text"]; bad.append(changed)
        changed = copy.deepcopy(valid); changed["entities"].append(copy.deepcopy(changed["entities"][0])); bad.append(changed)
        for response in bad:
            with self.subTest(response=response):
                stub = StubTransport({"pii": response})
                view = Analyzer(api_key="test", live_transport=stub).analyze("routine", "live")
                self.assertEqual(len(stub.calls), 1)
                self.assertEqual(view["gate"]["status"], "review")
                self.assertIsNone(view["redactedText"])
                self.assertIsNone(view["shareText"])

    def test_missing_key_makes_zero_calls(self):
        stub = StubTransport()
        view = Analyzer(api_key="", live_transport=stub).analyze("routine", "live")
        self.assertFalse(stub.calls)
        self.assertEqual(view["usage"]["requests"], 0)
        self.assertEqual(view["gate"]["status"], "review")

    def test_scores_and_verdicts_fail_closed(self):
        for score in (None, float("nan"), float("inf"), -0.1, 1.1, True, "0.01"):
            with self.subTest(score=score):
                response = {"injection": score, "verdict": "benign", "evidence": []}
                stub = StubTransport({"injection": response})
                view = Analyzer(api_key="test", live_transport=stub).analyze("routine", "live")
                self.assertEqual(view["gate"]["status"], "review")
                self.assertIsNone(view["shareText"])
                self.assertEqual(len(stub.calls), 2)
        for score, verdict, expected in ((0.15, "benign", "ready"), (0.151, "benign", "review"), (0.8, "benign", "blocked"), (0.01, "malicious", "blocked"), (0.01, "anything-provider-says", "review")):
            stub = StubTransport({"injection": {"injection": score, "verdict": verdict, "evidence": []}})
            self.assertEqual(Analyzer(api_key="test", live_transport=stub).analyze("routine", "live")["gate"]["status"], expected)

    def test_bad_inspect_and_evidence_cannot_release(self):
        redacted = authored_protect(CASES["routine"])["anonymized_text"]
        for stage, response in (
            ("injection", {"injection": 0.01, "verdict": "benign", "evidence": [{"quote": "wrong", "start": 0, "end": 5}]}),
            ("injection", {"injection": 0.01, "verdict": "benign"}),
            ("script", {"malicious": 0.01, "verdict": "benign", "evidence": []}),
            ("script", {"malicious": 0.01, "suspicious": 0.01, "verdict": "benign", "evidence": [{"line": "not in script", "start": 0, "end": 13}]}),
        ):
            with self.subTest(stage=stage):
                view = Analyzer(api_key="test", live_transport=StubTransport({stage: response})).analyze("routine", "live")
                self.assertEqual(view["gate"]["status"], "review")
                self.assertIsNone(view["shareText"])
        self.assertIn('"The demo print queue is paused."', redacted)

    def test_unknown_outcome_is_retained_and_never_automatically_resent(self):
        stub = StubTransport({"pii": ProviderFailure("connection", unknown=True)})
        analyzer = Analyzer(api_key="test", live_transport=stub)
        first = analyzer.analyze("routine", "live")
        second = analyzer.analyze("routine", "live")
        self.assertEqual(len(stub.calls), 1)
        self.assertEqual(second["usage"]["requests"], 0)
        self.assertEqual(analyzer._unknown["routine"]["requestId"], stub.calls[0][2])
        self.assertIsNone(first["shareText"])
        self.assertIn("unknown outcome", second["error"])

    def test_upstream_secret_errors_never_escape(self):
        secret = "DO-NOT-EXPOSE-THIS-AUTH-SECRET"
        stub = StubTransport({"pii": RuntimeError("Authorization: Bearer " + secret)})
        analyzer = Analyzer(api_key=secret, live_transport=stub)
        view = analyzer.analyze("routine", "live")
        self.assertNotIn(secret, json.dumps(view))
        self.assertEqual(view["gate"]["status"], "review")

    def test_conflict_and_server_error_transport_lock_unknown_outcome(self):
        for code in (409, 500, 503):
            with self.subTest(code=code):
                class ErrorOpener:
                    calls = 0

                    def open(self, request, timeout):
                        self.calls += 1
                        raise urllib.error.HTTPError(request.full_url, code, "secret upstream message", {}, None)

                transport = LiveTransport("test")
                transport._opener = ErrorOpener()
                analyzer = Analyzer(api_key="test", live_transport=transport)
                first = analyzer.analyze("routine", "live")
                second = analyzer.analyze("routine", "live")
                self.assertEqual(transport._opener.calls, 1)
                self.assertIn("routine", analyzer._unknown)
                self.assertEqual(second["usage"]["requests"], 0)
                self.assertNotIn("secret upstream message", json.dumps(first))

    def test_invalid_case_or_mode_is_rejected(self):
        for case_id, mode in (("unknown", "replay"), ("routine", "unsafe")):
            with self.assertRaises(ValueError):
                Analyzer(api_key="").analyze(case_id, mode)


class MemorySocket:
    def __init__(self, request):
        self.request = io.BytesIO(request)
        self.output = bytearray()

    def makefile(self, mode, *args):
        return self.request

    def sendall(self, value):
        self.output.extend(value)


def in_memory_http(method="GET", path="/api/health", body=b"", headers=None, raw_headers=None):
    pairs = [("Host", "127.0.0.1:8787")]
    if method == "POST":
        pairs.extend((("Content-Type", "application/json"), ("Content-Length", str(len(body)))))
    for name, value in (headers or {}).items():
        pairs = [(n, v) for n, v in pairs if n.lower() != name.lower()]
        pairs.append((name, value))
    pairs.extend(raw_headers or [])
    raw = (method + " " + path + " HTTP/1.1\r\n" + "".join(n + ": " + v + "\r\n" for n, v in pairs) + "\r\n").encode("ascii") + body
    sock = MemorySocket(raw)
    make_handler(Analyzer(api_key=""))(sock, ("127.0.0.1", 50000), SimpleNamespace(server_address=("127.0.0.1", 8787)))
    head, response = bytes(sock.output).split(b"\r\n\r\n", 1)
    return int(head.split(b" ")[1]), head.decode("ascii"), response


class HttpBoundaryTests(unittest.TestCase):
    def test_health_cases_and_analyze_contracts_without_sockets(self):
        status, headers, body = in_memory_http()
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body), {"liveAvailable": False, "mode": "synthetic-only", "project": "Handoff Gate"})
        self.assertIn("Cache-Control: no-store", headers)
        self.assertNotIn("Access-Control-Allow-Origin", headers)
        status, _, body = in_memory_http(path="/api/cases")
        self.assertEqual(len(json.loads(body)["cases"]), 5)
        status, _, body = in_memory_http("POST", "/api/analyze", b'{"caseId":"routine","mode":"replay"}')
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["gate"]["status"], "ready")
        self.assertIn('"The demo print queue is paused."', json.loads(body)["redactedText"])

    def test_arbitrary_text_unknown_case_duplicate_json_and_wrong_type_rejected(self):
        for body in (b'{"caseId":"unknown","mode":"replay"}', b'{"caseId":"routine","mode":"replay","text":"arbitrary"}', b'{"caseId":"routine","mode":"replay","mode":"live"}', b'{"caseId":[],"mode":"replay"}', b'[]', b'{"caseId":"routine","mode":NaN}'):
            status, _, _ = in_memory_http("POST", "/api/analyze", body)
            self.assertEqual(status, 400)

    def test_body_limit_and_content_type(self):
        status, _, _ = in_memory_http("POST", "/api/analyze", b"x" * (MAX_BODY_BYTES + 1))
        self.assertEqual(status, 413)
        status, _, _ = in_memory_http("POST", "/api/analyze", b"{}", headers={"Content-Type": "text/plain"})
        self.assertEqual(status, 415)
        status, _, _ = in_memory_http("POST", "/api/analyze", b"{}", raw_headers=[("Content-Length", "2")])
        self.assertEqual(status, 400)

    def test_host_and_origin_isolate_the_local_app(self):
        for headers in ({"Host": "evil.example:8787"}, {"Origin": "https://evil.example"}, {"Origin": "null"}, {"Origin": "http://localhost:8787"}):
            status, _, _ = in_memory_http(headers=headers)
            self.assertEqual(status, 403)
        status, _, _ = in_memory_http(headers={"Origin": "http://127.0.0.1:8787"})
        self.assertEqual(status, 200)

    def test_server_source_and_paths_are_never_static_assets(self):
        for path in ("/server.py", "/fixtures.py", "/../engine.py", "/.env", "/web/../server.py", "/api/health?x=1"):
            status, _, _ = in_memory_http(path=path)
            self.assertEqual(status, 404)


if __name__ == "__main__":
    unittest.main()
