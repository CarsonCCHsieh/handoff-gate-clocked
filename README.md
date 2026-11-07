# Handoff Gate · 交接閘門

**Redact the ticket. Check its instructions. Review its script. Decide what can be shared.**

Support handoffs mix useful incident facts with personal information, untrusted instructions and proposed recovery commands. Handoff Gate turns those different signals into an explicit **ready**, **review** or **blocked** decision. It supports a human reviewer and never executes the proposed script.

Created for the Clocked Build Challenge, starting 7 November 2026. The interface is available in English and Traditional Chinese. All examples are fictional.

## Three APIs that change the workflow

| Stage | Clocked endpoint | What changes in the application |
| --- | --- | --- |
| Protect | `/clocked/pii` | Sensitive spans and the transformation are validated; only transformed text can reach Guard. |
| Guard | `/clocked/injection` | A fixed support scope is applied to the untrusted handoff. Risk, verdict and source evidence affect export. |
| Inspect | `/clocked/script` | The proposed script is classified as text. Its separate risk signals can block or hold a handoff. |

The final gate is local application policy, not a model instruction. A ready result requires a valid transformation and acceptable results from both risk checks. Harmful signals block export. Uncertainty, missing fields, malformed data and service failures require review. A ready result is not a security guarantee or permission to run a command.

## Run the workbench

Python 3.13 and its standard library are sufficient. No package installation is required.

```text
python server.py --port 0
```

Open the `http://127.0.0.1:<port>/` URL printed by the process. The server binds only to loopback and serves local assets. Choose one of five bundled synthetic cases. Arbitrary text and file uploads are intentionally outside this challenge preview.

### Authored replay

The complete preview works without a key. Its responses are manually authored illustrations and are labelled **AUTHORED SYNTHETIC — NOT LIVE**. They are not recorded API results or a model-accuracy benchmark.

| Case | Authored policy demonstration |
| --- | --- |
| Routine service incident | Ready, with a sanitized report |
| Untrusted instructions | Blocked |
| Unsafe recovery script | Blocked |
| Uncertain intent | Human review |
| Provider unavailable | Human review; no successful fallback |

### Live mode

Provide your own Clocked key through the backend environment variable `CLOCKED_API_KEY`, then start the server. Do not paste a key into frontend code, browser storage, URLs, command arguments or Git. Live mode sends only the same bundled fictional cases. The interface labels live responses separately and never substitutes an authored success for a failed API call.

Requests are made to the fixed Clocked HTTPS endpoints. Guard receives the locally validated transformed text. Responses are checked for type, finite scores and exact source positions. An unknown outcome retains its logical request identity and stops automatic duplication. Use only the allowance you have authorized; a failed request is not a reason to enable paid usage.

## What can be shared

Only a ready handoff offers a download. Its report contains transformed incident facts and the gate summary. It does not include original entity values, the raw API response, proposed script source or an API key. Detection can miss information; this prototype is a review aid with a narrow synthetic input boundary.

## Observed live integration

Three synthetic cases completed nine real Clocked API calls. The routine case reached ready and produced a checked sanitized report; an instruction-injection case was blocked by Guard, and an unsafe recovery-script case was blocked by Inspect. Each case used Protect, Guard and Inspect. The video shows the actual resulting application screenshots.

The displayed percentages are model risk signals, not accuracy. Three examples are a narrow integration check and do not establish general security performance or production reliability. Uncertainty and provider failure are demonstrated separately with authored replay/offline cases; no real provider outage is claimed.

## Local checks

```text
python -m unittest discover -s tests -v
```

The tests use local fixtures and stub transports. They exercise redaction and span validation, policy boundaries, provider failures, unresolved requests and loopback HTTP restrictions. These checks do not establish model accuracy or production suitability.

## Credits

Built by CC with AI-assisted coding, interface design and writing. The application core and interface were newly created for this challenge. Python standard library, local HTML/CSS/JavaScript and system fonts are used; no prior hackathon application was repurposed.

[Clocked challenge](https://clocked.rezolve.ai/challenge) · [Protect](https://clocked.rezolve.ai/docs/pii) · [Guard](https://clocked.rezolve.ai/docs/injection) · [Inspect](https://clocked.rezolve.ai/docs/script)
