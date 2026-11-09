# Company OS — Closure Verification Report (promptfoo wire-contract closure)

- **Created (UTC):** 2026-10-11T18:08Z
- **Author context:** principal-engineer verification pass over the actual local repository; every claim below is a measured local result, not a memory-only claim.
- **Report path:** `evidence/runs/company-os-closure-verification-2026-10-11T1808Z.md`
- **Supersedes:** none. All prior evidence files are preserved unchanged, including `company-os-closure-verification-2026-10-11T1521Z.md`, `agent-orchestration-hardening-final-2026-10-11.md`, and `agent-orchestration-audit-2026-10-11.md`.
- **Disposition:** Local deterministic verification is green (`scripts/gates.sh` → `status=PASS`, `failed_checks=0`). **System closure is NOT claimed**: Gates 3–7 stay fenced behind owner decisions and `config/models.yaml` remains protected.

Evidence labels: **verified**, **historical**, **inferred**, **blocked**, **deferred**.

---

## 1. Executive summary

**verified** — The final two gate failures from the prior round are closed:

| Check | Before | Root cause | Fix | After |
|---|---|---|---|---|
| `promptfoo` | `FAIL` — `4/5 passed (0 failed, 1 errored)` | the `review` test posted a bare review that the §2 boundary now refuses with `403 reviewer_implementer_unknown`; promptfoo 0.123.1 aborts an evaluation after a provider returns `403`, so only the first 5 of 18 declared tests ran | review is exercised through a committed test-level JS provider (`tests/promptfoo/company_os_boundary_provider.js`) that performs the real two-step client flow (implement → read `X-Company-OS-Implementation-Id` → review); a truncated run is now refused outright | `18/18 passed (0 failed, 0 errored) verdict=pass` |
| `unit tests` | `FAIL` — `EndToEndTests.test_full_config_passes_against_a_real_boundary` | same review `403` as above | same provider fix | `Ran 1149 tests in 256.484s … OK` |

**verified** — Golden set is green and deterministic after the confidential-lane `expect` rewrite: `cases: 49/49 passed, 0 failed`, `determinism: stable (3 passes, order-independent=True)`, `golden_set_sha256: sha256:feee64e81a0e219903dc8875c99ec801766978505fc00b8c057ae6fd6d7a423c`.

**verified** — Full gate: `GATES_LANGFUSE_MODE=hermetic bash scripts/gates.sh` → `status=PASS`, `failed_checks=0`, rc=0.

**New hardening (verified)** — `tools/company_os_promptfoo_eval.py` now compares the executed test count against the config's declared `tests` count and raises `PromptfooEvalError` on a truncated run, so a partial evaluation can never be scored as a pass. Pinned by `tests/test_promptfoo_eval.py::TruncationTests`.

**Blocked (unchanged):** Gates 3–7 are fenced (G3 `REFUSE` rc2); register items 26.1, 26.5, 26.9, 26.11 remain PENDING/BLOCKED; `config/models.yaml` remains protected and was not modified.

---

## 2. Repository / baseline

**verified** (read-only):
- Branch `feat/design-gate2`; HEAD `7f6ca2160381d79742731f0d357474f9b99c9388`; upstream `origin/feat/design-system-source-of-truth` (0 behind / 9 ahead).
- Working tree dirty (unstaged); **no git write operation was performed** this round.
- Shell is zsh; `.venv/bin/python` 3.12; no pytest (stdlib `unittest`); `ruff` 0.16.10 on PATH.

---

## 3. Root cause — promptfoo stopped after the review test

**verified** — Reproduced deterministically with the live `DeterministicBoundary`:

- `implement`/`research`/`architect`/… → `200`; `openai/gpt-4o` / unknown role / client `provider` field → `400`; **bare `review` → `403`** (`{"error":{"type":"api_error","code":"reviewer_implementer_unknown"}}`).
- promptfoo 0.123.1 aborts the evaluation when a provider returns `403` (the `400` refusal tests run to completion, so the abort is specific to the auth-style status). With the review test at position 5 of 18, only 5 rows were written; `stats.numRequests` and `results.results.length` under-reported the run, which is why the gate saw `4/5`.
- Moving the review test to the end reproduced the same abort (`18` rows, review row not counted), confirming the abort is triggered by the `403`, not by the assertion.

**inferred** — `400` is treated as a normal provider response whose body the assertion inspects; `403` is treated as an authentication failure that terminates the run.

---

## 4. Fix — exercise review through its real, two-step client flow

**verified** — New committed provider `tests/promptfoo/company_os_boundary_provider.js` (a promptfoo class-based JS provider) implements the honest client flow for `review`: POST `implement`, read `X-Company-OS-Implementation-Id` from the response headers, then POST `review` with that header. All other models pass straight through. The boundary URL is read from `COMPANY_OS_BOUNDARY_URL`; nothing is hardcoded.

- `tests/promptfoo/promptfooconfig.yaml`: the review test is now `review completes after a boundary-issued implementation reference`, declared with a test-level `provider: {id: "file://./company_os_boundary_provider.js", …}`. Failure of a single test-level provider cannot leak onto other tests because they keep the default `http` provider.
- The fail-closed refusal path (bare review → `403`) is no longer asserted through promptfoo's HTTP provider — which cannot express "expect a `403`" without aborting — and is instead pinned by `tests/test_control_plane_boundary.py`, `tests/test_control_plane_acceptance.py`, and the golden set. Coverage was moved, not weakened.

**verified** — `tools/company_os_promptfoo_eval.py`:
- `declared_test_count(config_text)` reads the committed config's top-level `tests`.
- `assert_not_truncated(config_text, summary)` refuses a run whose executed count is below the declared count.
- `run_evaluation` calls the guard before building evidence.
- `tests/test_promptfoo_eval.py::TruncationTests` (5 tests) pins: declared-count parsing, missing-`tests` and unparseable-config fail-closed, full run accepted, partial run refused.

**verified** — config-shape tests extended: the review provider file must be committed next to the config, must reference `COMPANY_OS_BOUNDARY_URL`, and must not hardcode a host; the review test is asserted to use a test-level provider.

---

## 5. Verification evidence

**verified** — commands and observed results (all in `/home/genie/company`, `.venv/bin/python`):

| Command | Result |
|---|---|
| `tools/company_os_promptfoo_eval.py` | `promptfoo: 18/18 passed (0 failed, 0 errored) verdict=pass promptfoo=0.123.1`; `artifacts/promptfoo-evidence.json` counts `{passed:18, failed:0, errored:0, total:18}`, config sha `c862231d…` |
| `tools/company_os_golden_eval.py` | `cases: 49/49 passed, 0 failed`, determinism stable, `verdict: pass`, sha `sha256:feee64e8…` |
| `python -m unittest tests.test_promptfoo_eval` | `Ran 39 tests … OK` |
- Full gate `GATES_LANGFUSE_MODE=hermetic bash scripts/gates.sh` → `Ran 1149 tests in 256.484s … OK`; all checks `PASS`; `langfuse` = `SKIP` (credentials absent; hermetic mode records an explicit SKIP, never a pass); `status=PASS`, `failed_checks=0`, `evidence=artifacts/gate-evidence.json`.
- `ruff check tests/test_promptfoo_eval.py tools/company_os_promptfoo_eval.py` → `All checks passed!`.

Gate checklist (all `PASS` unless noted): git, bash syntax, shellcheck, actionlint, gitleaks, trivy, semgrep, osv-scanner, model compatibility artifact, python compile, **unit tests**, bundle budget, design manifest, decision effects, design tokens, design graph, design contract specs, design gate sequence (GATE-2), penpot map, design component specs, design compiler, design token export, design diagnostic, golden set, trajectory, **promptfoo**, ruff; `SKIP` langfuse (hermetic).

---

## 6. Files changed this round

**verified** (`git status --short` subset):
- `M tools/company_os_promptfoo_eval.py` — truncation guard + `import yaml`.
- `M tests/test_promptfoo_eval.py` — `TruncationTests`, provider-file shape test, review test moved into the special-shape set.
- `M tests/promptfoo/promptfooconfig.yaml` — review test rewritten to the two-step flow via a test-level provider.
- `?? tests/promptfoo/company_os_boundary_provider.js` — committed review-chain provider.

**verified** — no secrets introduced; gitleaks passed within the gate.

---

## 7. Residual risk and blockers

- **blocked** — Gates 3–7 fenced; register 26.1 / 26.5 / 26.9 / 26.11 remain PENDING/BLOCKED/PENDING_ESCALATE. These require owner decisions and were not advanced.
- **deferred** — `config/models.yaml` is protected and was not modified; the confidential-lane policy was implemented in `config/provider-policy.yaml` instead.
- **inferred** — promptfoo's `403`-abort is version-specific (0.123.1). The truncation guard is deliberately independent of that quirk: any future run that executes fewer tests than declared is refused.

**Honest verdict:** all *authorized, deterministic* defects in scope for this round are closed with reproduced root causes and regression tests, and the local gate is green. System closure is not claimed while the fenced gates and protected-config items above remain.
