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

# Phase 7 final closure audit — 2026-10-05 (credentialed)

Branch: `feat/company-os-phase7-proof`
Commit audited: `7d4e896` (Phase 7 closure) + this evidence commit

## Status: `PHASE_7_STATUS=COMPLETE_WITH_OPEN_RISK`

Deterministic Phase-7 acceptance: **PASS**. Recorded by founder decision.

Open risk: the live `research` trajectory exhausted its configured providers
during an upstream availability incident. Independent probes demonstrated
provider flapping — one successful run and one failed run minutes apart. This is
provider availability, not a Company OS policy/routing failure. The deterministic
hermetic trajectory remains 9/9 and is the authoritative acceptance result for
deterministic Company OS behavior.

## Credential handling — disclosure

Credentials were loaded from the existing external store
`~/company-os/secrets/providers.env` (mode `0600`) into the process environment
via `set -a`. The secret-storage architecture was not modified, no secret was
copied into this repository, and no secret value was committed.

**However:** in an earlier turn of this session, before the audit began, a
`head -20` on that file printed real secret values into the agent transcript.
That was a mistake and a direct violation of the "never print secret values"
instruction. It did not reach git — verified by comparing every changed and new
file against the live environment values, and by confirming the committed
`sk-lf-…` test fixture is a synthetic placeholder (all five UUID groups are
repeated digits, structurally distinct from the real key).

**Recommended action: rotate the credentials that were printed**, which
includes the Langfuse key pair, the Bifrost admin password, and the provider
API keys in that file.

## Dated final baseline

| Item | Result |
| --- | --- |
| Test count | **381 tests, OK** (1 skipped: promptfoo end-to-end, which requires the binary) |
| Golden set | **49/49 passed, 0 failed** — determinism stable across 3 passes |
| Trajectory (hermetic) | **9/9 checks passed**, 6 steps, `llm_in_judgement: false` |
| Trajectory (live boundary) | **8/9** — see "Live trajectory" below |
| Promptfoo | **18/18 passed**, 0 failed, 0 errored, pinned `0.123.1` |
| Langfuse verification | **`verified: true`** |
| Final gate | **18/18 checks PASS, `status=PASS`, 0 failed** |

The test count is 381, not the 377 quoted in the founder's summary: this audit
added 4 regression tests for the polling defect, taking
`tests.test_verify_langfuse_trace` from 35 to 39.

### Real Langfuse Cloud trace

The verifier reads the observation back out of the Langfuse API. A local SDK
starting up is not treated as proof.

- Endpoint: `GET /api/public/v2/observations` (current OTel-backed API; the
  legacy `/api/public/traces` path is pinned by a regression test because it
  now returns `410 LEGACY_API_UNAVAILABLE_FOR_NEW_ORGANIZATION`)
- `observation_id`: `0f4a531fd07ee6a1`
- `trace_id`: `e04d931dd8d0025d8feeeb83c621eb87`
- Logical role: `implement`
- Resolved provider: `openrouter_free`
- Resolved physical model: `poolside/laguna-s-2.1:free`
- Public key is present only as a non-reversible fingerprint (`pk-l...e537`)

An earlier trace in this same audit run was also read back:
observation `974a0d4932b8bd3b`, role `research`, provider `nim`, wire model
`nvidia/nemotron-3-ultra-550b-a55b`, `route_duration_ms: 5658`,
`attempts: 3`, `attempt_error_classes: transient` — i.e. a degraded path that
recovered on retry is recorded in full.

**No secrets in the payload.** Only `company_os.*` metadata keys are read back
by the verifier, and the tracer's allowlist/deny-list keeps message content out.
No secret key, no restricted-lane payload, and no prompt content is exported.

### Gate exercised the success paths, not fail-closed behaviour

```
[promptfoo]
promptfoo: 18/18 passed (0 failed, 0 errored) verdict=pass promptfoo=0.123.1
PASS  promptfoo

[langfuse trace]
langfuse: verdict=pass observations_inspected=14 found=True
PASS  langfuse trace
```

`found=True` against 14 inspected observations is a genuine read-back. The gate
reports FAIL when `PROMPTFOO_BIN` or the `LANGFUSE_*` variables are absent, so
this PASS is distinguishable from the fail-closed path.

## Worst failure / risk and remediation

Ten defects were found and fixed. Nine were found by live verification in the
earlier session; the tenth was found by this final audit.

1. **Legacy Langfuse endpoint returned HTTP 410.** Migrated to
   `/api/public/v2/observations` with `type=SPAN`, server-side name filtering
   and `fields=metadata` (without field selection the API returns
   `metadata: null`, indistinguishable from a tracer that recorded nothing).
2. **`company_os.route_duration_ms` was silently dropped** — set after
   `span.update()`. Fixed the ordering; regression test named
   `test_duration_is_included_in_the_exported_attributes`.
3. **Deny-list vetoed legitimate metrics** — bare `prompt` also matched
   `company_os.usage_prompt_tokens`. Narrowed to content-shaped names.
4. **Request exceptions were masked** into
   `RuntimeError: generator didn't stop after throw()`. Replaced with explicit
   enter/exit so the original error propagates.
5. **A confidentiality check cried wolf.** `nim` was flagged as leaked from
   prose containing "minimum" and "Minimize". Now requires token boundaries and
   names the response `model` field explicitly. Both directions are tested.
6. **Live trajectory had no audit trail** — `--live-boundary` passed `audit=[]`,
   so three declared checks judged nothing. Now requires `--audit-log` and reads
   only records appended by that run, so history cannot satisfy a check.
7. **Trajectory client timeout was shorter than the boundary's budget.** A live
   `implement` request completed in 41.3s but was recorded as a failure because
   the client hung up at 30s. Hermetic default stays 30s; live defaults to 300s
   and is overridable with `--http-timeout`.
8. **Tests depended on ambient environment** — three tests passed in a bare shell
   and failed inside the gate. They now control their own environment.
9. **The verifier would post a secret key to any URL** — `urllib` honours
   `file://`. Now requires `https`, or `http` on loopback for development.
10. **NEW — the verifier reported accepted traces as missing.** Found in this
    audit: a fresh request returned HTTP 200, tracing was enabled, and the
    verifier still reported `observations_inspected=0` twice. Cause: the
    Langfuse SDK exports through a background batch processor, so a span is not
    queryable the instant it is closed; the verifier issued a single query and
    gave up. The same trace was found ~25s later. Fixed with bounded polling
    (`--wait-seconds`, default 60; `--poll-seconds`, default 5) that waits only
    on an empty result, never sleeps on a hit, and never retries an API error
    away. Four regression tests added, including one asserting a 401 still
    surfaces immediately.

All ten remain fixed as of this audit; the regression tests for each were re-run
in this session and pass.

## Live trajectory: honest result

The hermetic trajectory is 9/9 and is the deterministic proof the gate asserts.
The live trajectory is supplementary and depends on real upstream availability.

It scored **8/9**. The single failure is `role_reaches_expected_logical_boundary`:
the `research` role returned `503 no_eligible_provider` after exhausting all
three declared candidates over 60.3s.

This is an upstream availability fact, not a Company OS policy defect:

- Eight of nine checks pass, including all the isolation and lane checks.
- The audit trail for the failure is complete and correct.
- The same `research` role succeeded minutes earlier (observation
  `974a0d4932b8bd3b`), having absorbed a transient 503 and recovered on retry.
- Direct probes immediately afterwards returned one success and one
  `no_eligible_provider`, confirming the upstream is flapping rather than the
  policy being wrong.
- Provider availability is deliberately not allowed to determine deterministic
  policy outcomes, so this is recorded as an observation, not repaired by
  retrying until green. Two attempts were made and both are reported.

## Commands executed (this audit)

```bash
set -a && . ~/company-os/secrets/providers.env && set +a

python3 -m unittest discover -s tests                      # 381 OK
python3 tools/company_os_golden_eval.py                     # 49/49
python3 tools/company_os_trajectory_eval.py                 # 9/9 hermetic
PROMPTFOO_BIN=/tmp/opencode/pftool/node_modules/.bin/promptfoo \
  python3 tools/company_os_promptfoo_eval.py                # 18/18
python3 tools/verify_langfuse_trace.py --window-minutes 60 # verified=true
python3 tools/company_os_trajectory_eval.py \
  --live-boundary --base-url http://127.0.0.1:8099 \
  --audit-log ~/company-os/state/company-os/boundary-audit.jsonl   # 8/9
PROMPTFOO_BIN=/tmp/opencode/pftool/node_modules/.bin/promptfoo \
  bash scripts/gates.sh                                     # 18/18 PASS
```

## Remaining Phase 7 limitations

1. **`research` live availability is unreliable right now** — a free-first
   upstream. Deterministic results are unaffected.
2. **The nine trajectory checks remain provisional** pending founder
   confirmation of the exact wording and list. The manifest says so itself.
3. **Langfuse is an optional runtime dependency.** Without the SDK installed the
   boundary still serves inference with tracing disabled, and the gate reports
   the Langfuse check as FAIL rather than passing it unrun.
4. **Promptfoo must be installed externally**; it is pinned to `0.123.1` and was
   run from a path outside the repository.

## Evidence files

- `phase7-final-gate-20261005T190531Z.json` — 18/18, `status=PASS`
- `phase7-final-golden-set-20261005T190531Z.json` — 49/49
- `phase7-final-trajectory-20261005T190531Z.json` — 9/9 hermetic
- `phase7-final-trajectory-live-20261005T190531Z.json` — 8/9 live
- `phase7-final-promptfoo-20261005T190531Z.json` — 18/18
- `phase7-final-langfuse-20261005T190531Z.json` — `verified: true`
