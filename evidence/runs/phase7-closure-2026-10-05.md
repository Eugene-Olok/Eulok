> **SUPERSEDED — HISTORICAL RECORD ONLY. DO NOT READ AS CURRENT STATE.**
>
> Superseded by `evidence/runs/PHASE7-CLOSURE-2026-10-05.md`.
>
> This file records the closure session at 17:19Z. Its figures are stale:
> it states **375 tests** (now **383**) and a **live trajectory 9/9** from that
> moment only. Two later live runs scored 8/9 due to upstream provider
> availability. It also predates the credential-exposure disclosure and defect 11.
> Retained as an audit trail; the authoritative closure state is in the file
> named above.

# Phase 7 closure evidence — 2026-10-05

Branch: `feat/company-os-phase7-proof`
Base commit at verification time: `bb1c0a7417779030cf2bb4624f9b3d3b3f7f2899`

Every number below is copied from a command that was run. Nothing here is a
projection of what should have happened.

## Baseline, before this phase's changes

```
Ran 220 tests in 178.140s
FAILED (failures=1)
FAIL: test_full_run_exits_zero (test_golden_set_eval.CliTests.test_full_run_exits_zero)
```

## Final state

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `python3 -m unittest discover -s tests` | `Ran 375 tests ... OK (skipped=1)` |
| Golden set | `python3 tools/company_os_golden_eval.py` | 49/49 passed |
| Trajectory (hermetic) | `python3 tools/company_os_trajectory_eval.py` | 9/9 passed, 6 steps |
| Trajectory (live) | `python3 tools/company_os_trajectory_eval.py --live-boundary --base-url http://127.0.0.1:PORT --audit-log PATH` | 9/9 passed, `provider_inference_during_run: true` |
| Promptfoo | `python3 tools/company_os_promptfoo_eval.py` | 18/18 passed |
| Langfuse | `python3 tools/verify_langfuse_trace.py --window-minutes 60` | `verdict: pass`, `verified: true` |
| Full gate | `bash scripts/gates.sh` | 18/18 checks PASS, `status=PASS` |

The suite was run twice, because the first version of these tests passed only in
a bare shell: 375 passed with `LANGFUSE_*` and `PROMPTFOO_BIN` exported (how the
gate runs them) and 375 passed with those variables absent.

## Langfuse: the trace was read back from the API

The tracer being enabled locally is not evidence that anything was ingested.
The verifier queries the API and exits non-zero unless a matching observation
comes back.

- Endpoint: `GET /api/public/v2/observations`
- Observed values:
  - `observation_id` `13a1603bf89be39e`
  - `trace_id` `5cf647b26a3fd272eae7cf009666c19f`
  - `company_os.logical_role` `research`
  - `company_os.route_duration_ms` `5004`
  - `company_os.http_status` `200`
  - `company_os.attempts` `2`
- No prompt or completion content appears in `company_os.*` metadata.

The verifier was also required to fail, so that a pass means something:

```
$ ... --expect-role summarise    # a role that never ran  -> exit 1
$ ... --trace-name company_os.never.emitted                -> exit 1
```

## Defects that only real verification found

Each of these passed the offline tests and failed against the real system.

1. **The verifier queried a dead endpoint.** `/api/public/traces` and
   `/api/public/observations` now return
   `410 LEGACY_API_UNAVAILABLE_FOR_NEW_ORGANIZATION`. The offline tests passed
   because the transport was faked. Now pinned to
   `/api/public/v2/observations`, with `type=SPAN`, server-side name filtering,
   and `fields=metadata` — without field selection the API answers
   `metadata: null`, which is indistinguishable from a tracer that recorded
   nothing.

2. **The tracer silently dropped duration.** `company_os.route_duration_ms` was
   set after `span.update()`, so it never reached the exported span.

3. **The tracer's deny-list suppressed legitimate metrics.** Matching bare
   `prompt` also matched `company_os.usage_prompt_tokens`. Narrowed to content
   fields.

4. **Request exceptions were masked.** The context manager's `catch` wrapped the
   `yield`, converting any routing error into
   `RuntimeError: generator didn't stop after throw()`.

5. **A confidentiality check cried wolf.** `physical_identity_not_relayed_to_client`
   substring-matched free text, so the provider id `nim` was reported as leaked
   from generated prose containing "minimum" and "Minimize". Now requires token
   boundaries, and names the response `model` field explicitly. Both directions
   are regression-tested: prose passes, a standalone `nim` still fails.

6. **Live trajectory had no audit trail to read.** `--live-boundary` passed
   `audit=[]`, so three declared checks judged nothing. It now requires
   `--audit-log` and reads only the records appended by that run, so history
   cannot satisfy a check.

7. **The trajectory's own timeout was shorter than the boundary's budget.** A
   live `implement` request completed in 41.3s and was recorded as a failure
   because the client hung up at 30s — and the abandoned request was logged as
   `client_disconnected`. Hermetic default stays 30s; live defaults to 300s and
   is overridable with `--http-timeout`.

8. **Tests depended on ambient environment.** Three tests assumed
   `LANGFUSE_*` / `PROMPTFOO_BIN` were unset and passed in a bare shell while
   failing inside the gate. They now control their own environment.

9. **The verifier would post a secret key to any URL.** `LANGFUSE_HOST` was
   used unvalidated, and `urllib` honours `file://`. Now requires `https`, or
   `http` on loopback for development.

## Upstream reality, recorded honestly

During the live trajectory run the `research` role returned
`no_eligible_provider` after 60.2s — every declared candidate was unavailable at
that moment. This is a provider availability fact, not a code result, and it was
not retried until green. A later live run served the role normally and passed
9/9.

## Reproduction

```bash
# Hermetic, deterministic — no network, no credentials
python3 -m unittest discover -s tests
python3 tools/company_os_golden_eval.py
python3 tools/company_os_trajectory_eval.py
PROMPTFOO_BIN=/path/to/promptfoo python3 tools/company_os_promptfoo_eval.py

# Live trace proof — needs a trace emitted in the last 60 minutes
export LANGFUSE_HOST=... LANGFUSE_PUBLIC_KEY=... LANGFUSE_SECRET_KEY=...
python3 tools/verify_langfuse_trace.py --window-minutes 60

# Everything, fail-closed
PROMPTFOO_BIN=/path/to/promptfoo bash scripts/gates.sh
```

Langfuse is an optional runtime dependency. Without it installed the boundary
still serves inference and tracing is disabled by default; the gate reports the
Langfuse check as FAIL rather than passing it unrun.

## Provisional, awaiting founder confirmation

`tests/trajectory/phase7-trajectory-checks.yaml` declares nine checks. The ids and
kinds are current, but the exact founder-approved wording and list have not been
confirmed, and the file says so. The trajectory pass is evidence that the
declared checks pass, not that these are the final nine.

## Files in this run

- `phase7-gate-20261005T171938Z.json` — 18/18 gate checks
- `phase7-golden-set-20261005T171938Z.json` — 49/49
- `phase7-trajectory-20261005T171938Z.json` — 9/9 hermetic
- `phase7-trajectory-live-20261005T171938Z.json` — 9/9 live boundary, real inference
- `phase7-promptfoo-20261005T171938Z.json` — 18/18
- `phase7-langfuse-20261005T171938Z.json` — observation read back from the API
