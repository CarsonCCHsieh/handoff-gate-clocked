# Handoff Gate · 交接閘門

A new, synthetic-data-only support handoff reviewer for the Clocked Build Challenge, started 7 November 2026. It separates useful incident facts from personal information, attempts to redirect an assistant, and unsafe proposed recovery scripts.

## What the prototype does

1. Protect identifies sensitive spans and produces a transformed copy.
2. Guard screens that transformed copy, using the fixed approved support scope rather than trusting ticket instructions.
3. Inspect assesses the proposed script as text. No script is ever executed.
4. A local policy turns these results into ready, review, or blocked. Missing, uncertain, malformed, or failed results require review. Only a ready result can produce a sanitized handoff report.

The three signals change both the gate and what can be shared. Detection is fallible; a ready report is not a security guarantee or approval to execute a command.

## Run locally

Python 3.13, standard library only. From this directory:

```text
python server.py --port 0
```

Open the http://127.0.0.1:<port>/ address printed by the process. Port 0 asks the operating system for an available local port; the server binds to loopback. The interface supports English and Traditional Chinese. Select one of five bundled fictional cases; arbitrary text and file uploads are intentionally unavailable in this challenge preview.

## Honest replay and live modes

Replay uses manually authored illustrative responses. It is not an actual Clocked response, accuracy measurement, or live integration proof. The UI labels it throughout.

Live mode is implemented against the published Clocked contracts and requires a separately authorized server-only CLOCKED_API_KEY. Only the same bundled synthetic cases can be sent. No key belongs in frontend files, browser storage, screenshots, command arguments, Git, or a shared report. Live validation has not yet occurred. A missing key never silently falls back to a successful replay. Do not enable paid plans or overage.

## Evaluation

The cases cover an ordinary incident, prompt injection, unsafe script, uncertainty, and provider failure. Tests exercise policy boundaries and transport behavior with local stubs; they do not establish model accuracy. After running them, preserve the actual test receipt outside the public source package.

```text
python -m unittest discover -s tests -v
```

## Data and scope

All names, addresses, and incident details are fictional. The service may retain response data; synthetic-only operation is a deliberate data boundary. Original Protect values are not part of the shareable report. No external script, case link, or proposed command is followed or run. All UI assets are local.

## Challenge materials

The official challenge requires a new application, a public repository with development history, and a working demo or short application-use video. This directory is private preparation, not a formal entry. There is no registration or submission receipt yet.

- [Official challenge](https://clocked.rezolve.ai/challenge)
- [Official rules](https://clocked.rezolve.ai/build-challenge/rules)
- [Protect](https://clocked.rezolve.ai/docs/pii), [Guard](https://clocked.rezolve.ai/docs/injection), [Inspect](https://clocked.rezolve.ai/docs/script)

Built by CC with AI-assisted implementation. Original application code and interface were created for this challenge; Python standard library and system fonts are the only dependencies.
