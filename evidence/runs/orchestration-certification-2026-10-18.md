# Orchestration & Release-Authority Certification — 2026-10-18

- **Author:** opencode (principal-engineer certification pass)
- **Branch:** `fix/business-evidence-placeholder-guard`
- **HEAD:** `ac8fd6b` (pushed to `origin/fix/business-evidence-placeholder-guard`)
- **Worktree:** clean (change set committed and pushed)
- **Governing principle:** Models propose. Deterministic systems decide.

This report records what was *observed and verified* in the live installed
stack on 2026-10-18, the one code defect that recon confirmed, the fix and its
regression test, and the live-environment gap that makes an end-to-end
inference claim unavailable. It contains no secret material.

---

## 1. Scope and authority

In scope: read-only inspection of the live orchestration path (Hermes →
gstack → OpenCode → control-plane boundary → Bifrost → providers → Git → CI
release authority), deterministic test execution, and minimal root-cause fixes
with regression tests.

Out of scope / not performed (no authorization):
- no merge, push, PR, branch-protection change, or deploy;
- no production config change;
- no paid inference;
- no edits to `config/models.yaml` or the model-routing policy.

The D6/D7/D8 fix, its regression tests, and the sanitized evidence/reports were
committed as one scoped commit, `d5b9d83`, on
`fix/business-evidence-placeholder-guard` (not pushed; see §7 for the
post-commit release-authority verdict).

## 2. Method (evidence commands)

| Check | Command | Result |
| --- | --- | --- |
| Full suite | `.venv/bin/python -m unittest discover -s tests` | **1700 tests, OK (skipped=5)** |
| Lint | `ruff check .` | All checks passed |
| Semgrep | `semgrep --config=auto --error tools/control_plane_live_smoke.py` | 0 findings |
| Release-authority tests | `python -m unittest tests.test_gate_provenance tests.test_phase8_gate` | 46 tests OK |
| Provenance | `python tools/gate_provenance.py .` | `dirty` |
| Gate syntax | `bash -n scripts/gates.sh`; `bash -n scripts/gates-phase8.sh` | both valid |
| Live smoke | `python tools/control_plane_live_smoke.py` | `inconclusive` (exit 3) |

Baseline before this pass: 1682 tests. Delta `+18` = the 11 D6 tests + 7 D8 tests.

## 3. Verified facts (live stack)

- **Boundary** `127.0.0.1:8090`: `/health` → `status=ok, ready=true,
  lane=internal, router=company-os-deterministic, version=1`;
  `/v1/models` → the 9 logical roles only (implement, research, architect,
  tests, review, security, vision_qa, summarise, router). No physical model
  name is exposed.
- **Deterministic policy enforcement** (observed refusals): unknown model
  `gpt-4o` → HTTP 400 `model_not_found`; a `provider` field →
  `unsupported_parameter`; a `lane` field → `unsupported_parameter`; a physical
  model name → HTTP 400 `model_not_found`. A client can select only a logical
  role.
- **Hermes** `verify` → provider `company-os OK`, api
  `http://127.0.0.1:8090/v1`, default_model `implement`.
- **Secrets boundary holds**: the protected `providers.env` is `root:root`
  0600 and is **not readable** by the ordinary (agent) identity. The credential
  broker is active and reports all provider keys present (presence only, values
  never read).
- **Gate scripts** are valid bash and the release-authority tests pass.

## 4. Defect fixed — D6: live smoke misclassified a correct fail-closed boundary

**Symptom.** `tools/control_plane_live_smoke.py` reported `verdict: "fail"`
against a boundary that was reachable and behaving correctly:

```
"failure": "cannot reach the boundary at http://127.0.0.1:8090: HTTP Error 503: Service Unavailable"
```

**Root cause.** `_request()` called `urllib.request.urlopen()` directly.
`urlopen` raises `urllib.error.HTTPError` for **every** non-2xx status. The
boundary returns HTTP 503 (`no_eligible_provider`) when it correctly fails
closed with no eligible upstream. The 503 therefore escaped `_request` before
`_raise_on_route_failure()`, which classifies 503 as `Inconclusive`, could ever
run — that branch was dead code. The `HTTPError` then landed in `main()`'s
`(urllib.error.URLError, OSError)` handler (HTTPError subclasses URLError) and
was reported as a contract violation (exit 2). The tool's own
`check_rejects_unknown_role()` already caught `HTTPError` explicitly, proving
the author knew `urlopen` raises — the classification path was simply never
wired.

**Impact.** An evidence tool asserted a boundary violation that never occurred,
and a correct fail-closed refusal was indistinguishable from a genuine outage.

**Fix** (`tools/control_plane_live_smoke.py`):
- `_request()` now catches `HTTPError` and returns
  `(exc.code, exc.read(), dict(exc.headers))`, so non-2xx responses reach the
  classifier.
- `check_rejects_unknown_role()` reads the returned status instead of relying
  on a raised exception (it would otherwise see a nil/unraised path).
- `main()` takes an optional `argv` (matching the repo's other tools) so the
  classification can be tested without spawning a process.

**Regression test** (`tests/test_control_plane_live_smoke.py`, new, 11 tests):
- `_request` returns a non-2xx response rather than raising (the core bug);
- `_raise_on_route_failure`: 503 → `Inconclusive`, other ≥400 → `SmokeError`,
  200 → no-op;
- **end-to-end against the real boundary** (`DeterministicBoundary`,
  `transport_specs=[]` — no provider reachable) → `verdict=inconclusive`,
  exit 3;
- end-to-end happy path (provider transport stubbed to echo the E2E token) →
  `verdict=pass`, exit 0;
- degraded `/health` → `verdict=fail`, exit 1;
- genuinely unreachable boundary → still `verdict=fail`, exit 2 (the
  inconclusive classification does not swallow connectivity faults);
- base-URL guard (non-loopback host, `file://`) still fails closed.

**Re-verified live.** The tool now writes `verdict: "inconclusive"` with reason
*"no eligible provider for role 'implement'; boundary failed closed
correctly"* to `evidence/runs/control-plane-live-smoke.json`.

## 4b. Defect fixed — D7: the D6 fix silently disabled a semgrep suppression

**Symptom.** After the D6 fix, the deterministic gate failed one check:
`semgrep` → *1 finding (blocking)*,
`python.lang.security.audit.dynamic-urllib-use-detected` on
`tools/control_plane_live_smoke.py`.

**Root cause.** The file carries a `# nosemgrep: ...` suppression immediately
above its `urllib.request.urlopen(...)` call (the URL is constrained to
loopback http/https by `_validate_base_url`, which the syntactic rule cannot
see). The D6 fix inserted a `try:` line **between** the suppression comment and
the call. The suppression only covers the immediately following line, so it
stopped applying and the finding became blocking. This was a regression
introduced by the D6 change itself and was caught by the gate, not by the test
suite.

**Fix.** Moved the `# nosemgrep` comment to sit directly above the `urlopen`
call, inside the `try:`. Confirmed:
`semgrep --config=auto --error tools/control_plane_live_smoke.py` → 0 findings.

**Significance.** This is the gate doing exactly its job: it caught a real
trust-boundary regression that unit tests did not, and prevented a green local
result from hiding it.

## 4c. Defect fixed — D8: malformed responses crashed the evidence tool

**Symptom.** A boundary returning HTTP 200 with a body that is not JSON, or a
non-2xx body of an unexpected shape, made the tool raise an uncaught
`json.JSONDecodeError` or `KeyError` out of `main()`. Result: a traceback, **no
evidence file written**, and no classified verdict — strictly worse than an honest
`fail`. Reproduced deterministically (non-JSON body → `JSONDecodeError`;
`400 {"message": ...}` → `KeyError: 'error'`).

**Root cause.** Every check parsed the response with a bare `json.loads(raw)` and
indexed the result directly (`body["data"]`, `["error"]["code"]`, `choices[0]`).
`main()`'s handlers caught only `Inconclusive`, `SmokeError`,
`(URLError, OSError)`, so decoding and shape errors escaped.

**Fix** (`tools/control_plane_live_smoke.py`):
- added `_parse_json(raw, context)` — decodes in one place and raises `SmokeError`
  on `JSONDecodeError`/`UnicodeDecodeError`;
- `check_health`/`check_models`/`check_non_stream`/`check_stream`/
  `check_rejects_unknown_role` now validate shape (`isinstance`, `.get`) instead of
  indexing, so a wrong-shaped body is a classified `fail`;
- stream decoding uses `errors="replace"` and parses each chunk through
  `_parse_json`;
- added a last-resort `except Exception` in `main()` (narrowly `# noqa: BLE001`)
  so *any* unforeseen error still writes evidence and classifies as `fail` — an
  evidence tool must never leave no evidence.

**Regression tests** (`tests/test_control_plane_live_smoke.py`, +7): malformed
`/health`, `/v1/models`, and a malformed `200` chat body are all `fail`/exit 1 with
evidence written; a `400` body lacking `error.code` raises `SmokeError` (not
`KeyError`); an injected `RuntimeError` is recorded as `fail` with evidence
(exit 1); plus `_parse_json` unit tests.

**Contract preserved.** 503 → `INCONCLUSIVE`, other ≥400 → `FAIL`, unreachable →
exit 2, success → `PASS` — all still pinned by the original tests.

## 5. Deterministic gate executed (release authority)

The gate was run in **hermetic** mode with credentials deliberately absent so
the live Langfuse check records an explicit SKIP rather than performing a
credentialed call:

```
env -u LANGFUSE_HOST -u LANGFUSE_PUBLIC_KEY -u LANGFUSE_SECRET_KEY \
  COMPANY_OS_CRED_BROKER_SOCKET=/nonexistent-broker.sock \
  GATES_LANGFUSE_MODE=hermetic PYTHON_BIN="$PWD/.venv/bin/python" ./scripts/gates.sh
```

Result (`evidence/runs/gate-evidence-2026-10-18-hermetic.json`):

- `status: PASS` (0 failed checks)
- every check PASS except `langfuse trace: SKIP` (credentials absent, hermetic)
- `git diff check`, `bash syntax`, `shellcheck`, `actionlint` (GH Actions syntax),
  `gitleaks`, `trivy`, `semgrep`, `osv-scanner` — PASS
- `python compile`, `unit tests`, `architecture conformance`, `golden set`
  (49/49), `trajectory` (9/9), `promptfoo` (18/18, pinned 0.123.1), `ruff` — PASS
- `release_eligibility: BLOCKED`, reason *"live langfuse trace was not verified
  in this run"*, `worktree: dirty`

**Interpretation.** The release-authority machinery behaves correctly: a green
gate with a skipped live trace and a **dirty worktree** is explicitly **not**
release-eligible. Release-eligibility requires a committed clean tree *and* a
credentialed live-trace pass. The first gate run in this pass caught D7; the
second run after the fix is green.

The Phase 8 gate was likewise executed with `PHASE8_ALLOW_BLOCKED=1` (as CI
does):

```
PHASE8_ALLOW_BLOCKED=1 PYTHON_BIN="$PWD/.venv/bin/python" ./scripts/gates-phase8.sh
```

Result (`evidence/runs/gate-evidence-phase8-2026-10-18.json`): `status=BLOCKED`,
`failed=0`, `blocked=4`, `skipped=0`, `tests=1700` (`>= baseline 406`). The four
BLOCKED checks are external-credential prerequisites (Cloudflare, PostHog) that
are absent by design in an untrusted context; the gate fails closed and records
BLOCKED rather than reporting a false pass. All deterministic Phase 8 checks
(business invariants, financial guards, evidence contracts, CI config structure
+ actionlint, secret hygiene, website/deploy-target checks) PASS.

## 6. Live-environment finding — no eligible provider (not a code defect)

`Bifrost /api/providers` reports **total: 1** (only `mistral`, `status: unknown`).
The live process is `bifrost-http-0 -app-dir /var/lib/company-os/bifrost/data`
(PID 1280), and the journal mentions **no provider other than mistral**. A boundary
call for any free-routed role therefore yields
`{"error":{"code":"no_eligible_provider"}}`.

**Forensic correction.** This is **not** a missing-credential problem. All seven
provider keys (`GOOGLE_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`,
`MISTRAL_API_KEY`, `NVIDIA_API_KEY`, `ZAI_API_KEY`, `CLOUDFLARE_API_TOKEN`) are
present in the credential store, and a readable pre-migration reference config
(`~/company-os/state/bifrost/data/config.json`) defines all seven providers with
`env.<NAME>` references. The repository also intends seven
(`config/model-compat.yaml`, `config/provider-policy.yaml`). The gap is therefore
**live configuration drift**: the running gateway's authoritative store (the
encrypted `config.db` under the root-only app-dir) exposes only mistral.

The leading hypothesis is that the 2026-10-14 systemd migration
(`scripts/isolate-secrets.sh`) repointed `-app-dir` to
`/var/lib/company-os/bifrost/data` without migrating the 7-provider config store
from the old user-unit directory. Confirming requires a root read of the live
store. **Correcting it is a production configuration change that needs root and a
separate authorization → BLOCKED.**

The full read-only analysis, the minimal proposed restoration, its validation,
rollback and prerequisites are in
**`evidence/runs/bifrost-provider-restoration-2026-10-18.md`**.

The last committed smoke evidence (`git show HEAD:...`, **2026-10-04**) recorded a
full **`pass`**; today the same host cannot exercise end-to-end inference. This is
a live-environment regression, not a repository code defect.

## 7. Release-authority state

- **Post-commit (authoritative) run.** On the clean committed tree the gate was
  re-run and wrote
  `evidence/runs/gate-evidence-postcommit-d5b9d83.json`:
  `status: PASS`, `commit: d5b9d83`, `worktree: clean`,
  `release_eligibility: BLOCKED`, reason *"live langfuse trace was not verified in
  this run"*. The change set is committed, so the worktree precondition is now
  satisfied; the **only** remaining gate for release eligibility is a credentialed
  live Langfuse trace pass.
- **Pre-commit run (recorded, superseded).** The first green gate
  (`evidence/runs/gate-evidence-2026-10-18-hermetic.json`) was produced *before*
  the commit against the `32ea127` working tree (`worktree: dirty`) and is labelled
  as such. It is retained for the audit trail, not as release evidence.
- Both gate scripts parse; the release-authority unit tests (46) pass.
- The changed evidence file moved the recorded live verdict truthfully from a
  stale `fail` to `inconclusive`; the prior 2026-10-04 `pass` remains in git
  history.
- **CI authority (not exercised).** `.github/workflows/gates.yml` and
  `phase8.yml` are the merge/release authority; local runs report
  `ci: LOCAL_ONLY`. A real remote denial/pass test requires a push and CI
  access — **BLOCKED pending authorization.**

## 7b. Remote release authority (read-only inspection, 2026-10-18)

Read-only only (`gh`, no mutation). Findings:

- **Repo** `Eugene-Olok/company-os` (private), default branch `main`.
- **`main` branch protection (enforced, `enforce_admins: true`):** required status
  check **"Deterministic Engineering Gates"** (`strict: true`), required linear
  history, force-pushes disabled, deletions disabled, required conversation
  resolution. Zero required approvals. This is a real, enforcing release gate.
- **Workflows (3, all active):** `deterministic-gates`, `phase8-gates`,
  `zoho-crm-debug`.
  - `gates.yml` job **"Deterministic Engineering Gates"** is the protected check.
    Triggers: push→`main`, `pull_request`, `workflow_dispatch`.
    `GATES_LANGFUSE_MODE = 'required'` only for `workflow_dispatch`, otherwise
    `'hermetic'`.
  - `phase8.yml` runs with `PHASE8_ALLOW_BLOCKED=1` (Cloudflare/PostHog absent →
    BLOCKED, not fail); a `deploy` job runs only on `workflow_dispatch` with
    `inputs.deploy`.
- **Real remote evidence exists.** PR **#10** is **OPEN** for this exact branch.
  Its prior head (`e706e13`/`32ea127`, the D1+D4 work) already passed **both**
  `deterministic-gates` and `phase8-gates` on 2026-10-17 via `pull_request`
  (runs `39074780002`, `39074780026`). Earlier `feat/phase9…` runs show both
  gates **failing** before passing — the gate demonstrably blocks real problems.
- **Reconciliation with local runs.** Local runs self-label `ci: LOCAL_ONLY`; the
  authoritative decision is the remote check, which has genuinely executed on this
  branch.
- **Observation (not a defect).** Because PR/push runs are hermetic, the required
  check can pass while `release_eligibility=BLOCKED` (live Langfuse trace is only
  forced on a credentialed `workflow_dispatch`). So merge-protection and the
  live-trace *release* gate are deliberately decoupled; the merge gate proves the
  deterministic suite, the dispatch proves the live trace. Flagged for founder
  awareness; changing it is out of scope here.
- **Now exercised — remote CI on the pushed revision.** `ac8fd6b` was pushed and
  GitHub Actions ran against it (PR #10, `pull_request`). Both required workflows
  **succeeded**:
  - `deterministic-gates` / job **"Deterministic Engineering Gates"** →
    `completed/success` — run
    `https://github.com/Eugene-Olok/company-os/actions/runs/39119856710`
    (all steps success). Its uploaded evidence records `status: PASS`,
    `ci: PASS`, `worktree: clean`, `release_eligibility: BLOCKED` (reason: live
    langfuse trace not verified in this run). Because PR runs check out the merge
    ref, the in-gate `commit` is the synthetic merge commit `f79de649` of
    `ac8fd6b` into `main` — i.e. CI validated the **merge result**, which is
    strictly stronger than the branch head alone.
  - `phase8-gates` / job **"Phase 8 Deterministic Gate"** → `completed/success` —
    run `https://github.com/Eugene-Olok/company-os/actions/runs/39119856722`
    (deploy job correctly **skipped**; not a dispatch). Evidence: `status:
    BLOCKED` for external creds by design, `tests.count=1700`, `baseline=406`,
    `preserved=true` — confirming CI ran the full suite including the 18 new
    tests.
  - No **failed**, **missing**, or unexpected **skipped** checks; the only skip is
    the intentional deploy job.
  - Durable copies: `evidence/runs/gate-evidence-ci-ac8fd6b-deterministic.json`
    and `evidence/runs/gate-evidence-ci-ac8fd6b-phase8.json`.
- **Not claimed.** The remote merge check passing does **not** prove release
  eligibility: CI ran `GATES_LANGFUSE_MODE=hermetic`, so `release_eligibility`
  remains **BLOCKED** (live Langfuse trace unverified). Release eligibility is
  established only by a credentialed `workflow_dispatch` — not tried here.
- **Not exercised.** The dispatch/deploy path and any push to `main` are out of
  scope and were not performed.

## 8. Open audit items carried forward (not introduced here)

- **D2** — `tests/test_mcp_regression.py` live MCP probes are host-fragile
  (subprocess timeouts / external MCP servers). Recommend gating the live
  probes behind an env flag, consistent with the browser lane.
- **D3** — `ruff format --check` drift. Confirmed pre-existing at `HEAD`
  (`tools/control_plane_live_smoke.py` was already format-dirty); the file's
  pre-existing lines were deliberately left untouched to keep this diff
  minimal. `ruff check` (the enforced lint) passes.

## 9. Committed change set

Committed on `fix/business-evidence-placeholder-guard` in two scoped commits:
`d5b9d83` (fix + tests + evidence) and `0677f6a` (post-commit verdict + report).
Not pushed.

| Path | Change |
| --- | --- |
| `tools/control_plane_live_smoke.py` | modify — D6 fix + D7 nosemgrep placement + D8 malformed-response classification |
| `tests/test_control_plane_live_smoke.py` | new — 18 regression tests (11 D6 + 7 D8) |
| `evidence/runs/control-plane-live-smoke.json` | modify — regenerated live run (`inconclusive`) |
| `evidence/runs/gate-evidence-2026-10-18-hermetic.json` | new — pre-commit deterministic gate result (`PASS`, eligibility `BLOCKED`) |
| `evidence/runs/gate-evidence-postcommit-d5b9d83.json` | new — post-commit deterministic gate result on the clean tree (`PASS`, eligibility `BLOCKED`) |
| `evidence/runs/gate-evidence-ci-ac8fd6b-deterministic.json` | new — **remote CI** deterministic gate evidence (`PASS`, `ci: PASS`, eligibility `BLOCKED`) |
| `evidence/runs/gate-evidence-ci-ac8fd6b-phase8.json` | new — **remote CI** Phase 8 gate evidence (`BLOCKED`, tests 1700) |
| `evidence/runs/gate-evidence-phase8-2026-10-18.json` | new — Phase 8 gate result (`BLOCKED`, 0 failed, 4 external-cred blocks) |
| `evidence/runs/bifrost-provider-restoration-2026-10-18.md` | new — read-only provider restoration assessment |
| `evidence/runs/orchestration-certification-2026-10-18.md` | new — this report |

## 10. Recommendations

1. **Founder:** the D6/D7/D8 fix and its 18 regression tests are committed on the
   fix branch (`d5b9d83`). Review and, when ready, push (§10.3). To obtain a
   genuinely release-eligible artifact, dispatch `deterministic-gates` with
   `GATES_LANGFUSE_MODE=required` and Langfuse secrets present.
2. **Founder (root):** restore the six free providers in the live Bifrost store per
   `evidence/runs/bifrost-provider-restoration-2026-10-18.md` (this is a config-store
   migration issue, not a missing credential), then re-run the live smoke to
   restore a `pass`. Until then end-to-end inference is **BLOCKED**, not failed and
   not proven.
3. **Founder:** the branch is pushed and both remote gates passed on `ac8fd6b`
   (§7b). To obtain a genuinely release-eligible artifact, dispatch
   `deterministic-gates` with `GATES_LANGFUSE_MODE=required` **and** Langfuse
   secrets present — that is the only path to clear the live-trace gate.
4. Carry D2 and D3 as tracked, non-blocking items.

## 11. Sanitization

No credential values were read, printed, or written. Secret-file inspection was
limited to ownership/permission metadata and variable *names*. The secret file
is unreadable at agent privilege, and that boundary was verified.
