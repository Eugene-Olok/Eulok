# Company OS — Closure Verification Report

- **Created (UTC):** 2026-10-11T15:21Z
- **Author context:** principal-engineer verification pass over the actual local repository; no memory-only claims.
- **Report path:** `evidence/runs/company-os-closure-verification-2026-10-11T1521Z.md`
- **Supersedes:** none. Prior evidence files (`design-gate2-final-report-2026-10-11.md`, `agent-orchestration-hardening-final-2026-10-11.md`, `agent-orchestration-audit-2026-10-11.md`, `design-penpot-protocol-subgate-2026-10-11.md`) are preserved unchanged.
- **Disposition:** Local deterministic verification is green (`scripts/gates.sh` → `status=PASS`, `failed_checks=0`). **System closure is NOT claimed**: two boundary-enforcement gaps and a protected-config gap remain, and Gates 3–7 stay fenced behind owner decisions.

Evidence labels used throughout: **verified**, **historical**, **inferred**, **unverified**, **blocked**, **deferred**.

---

## 1. Executive summary and actual outcome

**verified** — The two original CI gate failures are fixed at the root and re-verified locally:

| Gate | Before | Root cause | Fix | After |
|---|---|---|---|---|
| gitleaks | `FAIL`, 6 leaks | entropy heuristic `generic-api-key` firing on a dict field literally named `key` whose value is a non-secret design-gate identifier | new anchored `.gitleaks.toml` allowlist (6 exact values), default rules retained | `gitleaks git .` → 0; `gitleaks dir .` → 0; planted real-looking secrets still fire |
| semgrep | `FAIL`, 3 findings | `python.lang.security.audit.dynamic-urllib-use-detected` on three raw `urllib.request.urlopen(variable_url)` sites | `ensure_http_url()` guard (http/https + hostname required) routed into all three transports; scoped `# nosemgrep` with justification | semgrep → 0 findings on the 3 files; full run 0/265 files |

**verified** — Full local gate: `GATES_LANGFUSE_MODE=hermetic bash scripts/gates.sh` → `status=PASS`, `failed_checks=0`, exit 0 (`/tmp/opencode/gates-run2.log`); unit suite `Ran 1124 tests … OK` (252.553 s).

**verified** — GATE-2 and the Penpot protocol subgate both independently enforce-PASS (`tools/design_gate_verifier.py --enforce`, rc 0). They are **distinct** results and neither authorizes Gates 3–7.

**unverified / blocked (must remain explicit)** — Reviewer-vendor independence is **not enforced at the HTTP boundary** (§10); `config/models.yaml` is protected with a confidential-lane denylist gap (§10, §19); the design-gate verifier returns PASS for a gate with zero checks (§13); `tools/validate_decision_manifest.py` still warns on the missing “Affected manifest IDs” field (§6); the Penpot Command API lane remains blocked by Cloudflare 403/1010 (§14).

**Honest verdict:** all *authorized, deterministic* defects are closed and evidenced. The system is **not** declared fully closed while the boundary-enforcement gaps above remain.

---

## 2. Repository, branch, HEAD, and working-tree baseline

**verified** (commands run in `/home/genie/company`, read-only):

- Branch: `feat/design-gate2`
- HEAD: `7f6ca2160381d79742731f0d357474f9b99c9388` (short `7f6ca21`)
- Upstream PR #5: draft; backup branch `backup/local-opencode-merge` @ `01225db`

`git status --short` (exact):

```text
 M company_os/control_plane/policy.py
 M config/hermes-provider.yaml
 M tests/test_bundle_budget.py
 M tests/test_control_plane_acceptance.py
 M tests/test_design_gates.py
 M tests/test_design_validators_failclosed.py
 M tests/test_hermes_company_os.py
 M tests/test_penpot_mcp_client.py
 M tools/check_bundle_budget.py
 M tools/design_gate_verifier.py
 M tools/hermes_company_os.py
 M tools/penpot_command_runtime.py
 M tools/penpot_mcp_client.py
 M tools/penpot_provision.py
 M tools/validate_decision_manifest.py
 M tools/validate_design_specs.py
 M tools/validate_design_tokens.py
?? .gitleaks.toml
?? evidence/runs/agent-orchestration-audit-2026-10-11.md
?? evidence/runs/agent-orchestration-hardening-final-2026-10-11.md
```

**verified** — `git diff --stat`: **17 files changed, 439 insertions(+), 36 deletions(-)**. All changes are intended; no unrelated files touched.

**verified — generated side effect, preserved:** `artifacts/golden-set-evidence.json` is a generated artifact under the ignored `artifacts/` directory (`.gitignore:1: artifacts/`; `git check-ignore` rc 0). It is **ignored by Git, not absent**; it is deliberately preserved and **not deleted**. Same for `artifacts/gate-evidence.json`. Neither appears in `git status` by design.

---

## 3. Local/remote discrepancies

**verified** — The working branch is local-only relative to its remote tracking branch: `origin/feat/design-system-source-of-truth` diverged **0 behind / 9 ahead**. The 9 ahead commits are local evidence/design commits; nothing has been pushed this session.

**verified** — The new untracked files (`.gitleaks.toml`, two evidence reports) plus this report are local-only and **not staged/committed** (Git writes are outside my authorization).

**inferred** — Because CI runs on the pushed branch, the green local result is **not yet represented in CI**; the gitleaks/semgrep fixes will only be CI-enforced after an authorized commit+push.

---

## 4. Request-to-release architecture and execution trace

**verified (from repo sources)** — Control-plane architecture: a client selects a **logical Company OS role** only; `company_os/control_plane/boundary.py` fixes the lane and forbids provider/model/header steering; `company_os/control_plane/router.py` resolves role→(provider, model) from `config/models.yaml`; `company_os/control_plane/policy.py` applies lane/cost/vendor/health gates. Workflow tooling: **gstack** (engineering workflow), **OpenCode** (implementation), **Hermes** (orchestration), **Bifrost** (model gateway). No provider credentials are hardcoded in workflows.

Design pipeline: `docs/design/DESIGN_MANIFEST.yaml` + `DESIGN_DECISIONS.md` + `DESIGN_GATES.yaml` are validated by `tools/validate_*` and sequenced by `tools/design_gate_verifier.py` (GATE-1 → GATE-2 → PENPOT-PROTOCOL-SUBGATE → GATE-3 … GATE-7).

**verified** — `scripts/gates.sh` is the integration gate; per-check commands at `scripts/gates.sh:103/109/117/121/129/137/149/151/153/154/155/159/161-165/236`.

---

## 5. Existing automation and synchronization inventory

**verified** — `scripts/gates.sh` runs: shellcheck, actionlint, `gitleaks git --no-banner --redact`, `trivy fs`, `semgrep`, `osv-scanner scan source -L requirements-pinned.txt`, unit tests (`python -m unittest discover -s tests -v`), design manifest/tokens/graph/contract-spec validators, GATE-2 enforcement, component specs, offline compiler/token-export/diagnostic, golden set, ruff, and a hermetic langfuse trace check. Config sync: `tools/sync_model_compat.py --check` keeps `config/model-compat.yaml` ↔ `.json` identical. Golden evaluation: `tools/company_os_golden_eval.py` (writes `artifacts/golden-set-evidence.json`). *(Note: `tools/run_golden_set.py` does not exist.)*

---

## 5b. Reconciled filesystem checks (requested in this pass)

**verified** — `.gitleaks.toml` allowlist is narrowly anchored: `[extend] useDefault = true` retains every default rule; the `[allowlist]` contains **exactly six** anchored regexes (`\bgate2_reconciliation_evidence\b`, `\bgate2_verification_evidence\b`, `\bphase8_gate_evidence\b`, `\bverify_200_zoom\b`, `\ba11y004_vintage_retired\b`, `\bsk-synthetic-secret-1234567890\b`). No `paths`, `files`, or rule/path-based suppression is present; anything not listed remains a finding. Negative test (planted real-looking secrets under `/tmp/opencode/gl-test2/`) still fires.

**verified** — `ensure_http_url(url)` (`tools/penpot_mcp_client.py:86-101`): `urlsplit` `ValueError` → raises `ValueError("invalid url")`; scheme not in `{http, https}` **or** empty hostname → raises `ValueError("unsupported url: …")` (with a sanitized echo via `sanitize_url`); otherwise returns the URL unchanged. Guarded call sites: `tools/penpot_mcp_client.py:123`, `tools/penpot_command_runtime.py:223`, `tools/penpot_provision.py:112` — each preceded by a comment stating the guard, and each carrying a `# nosemgrep:` scoped to the exact `dynamic-urllib-use-detected` rule (suppression scoped to the single finding, justified inline).

**verified** — `artifacts/golden-set-evidence.json`: Git-ignored generated side effect (see §2); preserved.

---

## 6. Every verified defect and its root cause

Legend: **closed** = fixed + re-verified; **open** = preserved unresolved. Each finding: affected file/component · defect/risk · change · evidence · limitation.

1. **gitleaks 6 findings — closed (false-positive class).** **Affected:** `docs/design/DESIGN_GATES.yaml:117/123/177`, `tools/validate_design_specs.py:84/111`, `tests/test_penpot_offline.py:658`. **Defect:** `generic-api-key` entropy heuristic matched identifiers in a field named `key` (`gate2_reconciliation_evidence`, `gate2_verification_evidence`, `phase8_gate_evidence`, `verify_200_zoom`, `a11y004_vintage_retired`) and the synthetic test literal `sk-synthetic-secret-1234567890`. **Change:** new `.gitleaks.toml`. **Evidence:** `gitleaks git .`→0, `gitleaks dir .`→0, planted-secret negative test fires. **Limitation:** none for the FP class.
2. **semgrep 3 blocking findings — closed.** **Affected:** `tools/penpot_mcp_client.py:123`, `tools/penpot_command_runtime.py:223`, `tools/penpot_provision.py:112`. **Defect:** `dynamic-urllib-use-detected` on variable-URL `urlopen` (the audit rule does not model the sanitizer). **Change:** `ensure_http_url()` + routing + scoped `# nosemgrep`. **Evidence:** semgrep 0/265. **Limitation:** suppression is justified because the rule cannot see the guard.
3. **Policy fail-open on unknown lane — closed.** **Affected:** `company_os/control_plane/policy.py`. **Defect:** lanes outside the known set were not explicitly rejected; the restricted lane could proceed when its config block was absent. **Change:** `VALID_LANES`; `unknown_lane` rejection; restricted deny-by-default (`deny_all_automation`). **Evidence:** `PolicyTests` (9 OK) incl. `test_unknown_lane_fails_closed`, `test_restricted_denies_when_config_block_missing`.
4. **Token contrast-threshold authority — closed.** **Affected:** `tools/validate_design_tokens.py`. **Defect:** `threshold_class`/`min_ratio` consistency not enforced. **Change:** enforce the pairing. **Evidence:** `tests/test_design_validators_failclosed.py`.
5. **Bundle-budget non-determinism + quote blind spot — closed.** **Affected:** `tools/check_bundle_budget.py`. **Defect:** references in single quotes missed; index build non-deterministic. **Change:** single/double-quote handling + `_index_document()`. **Evidence:** `BundleBudgetSingleQuoteTests` (3).
6. **Hermes doc drift / redundant import — closed.** **Affected:** `tools/hermes_company_os.py`, `config/hermes-provider.yaml` (comment-only). **Change:** doc/flag parity + import cleanup. **Evidence:** `test_hermes_company_os.py` (44 OK).
7. **Hermes `$HERMES_HOME` resolution bug — closed.** **Affected:** `tools/hermes_company_os.py`. **Evidence:** `HermesHomeResolutionTests`.
8. **`design_gate_verifier.py` dead `--registry` — closed.** **Change:** honor `--registry`. **Evidence:** `test_registry_flag_is_honored`.
9. **Ruff EXE001/F401 — closed.** **Affected:** `tools/validate_decision_manifest.py`, `tools/validate_design_specs.py` (mode `100644→100755`; unused `import sys` removed). `tools/validate_design_manifest.py` was already clean (unmodified). **Evidence:** `ruff check .` → All checks passed.
10. **Reviewer-vendor independence not enforced at the boundary — OPEN.** **Affected:** `company_os/control_plane/policy.py:74-84`, `company_os/control_plane/boundary.py`. **Defect:** `vendor_allowed` fires only when `ctx.implementer_vendor` is truthy; that field is populated solely by `company_os/control_plane/cli.py:45`, `tools/control_plane_smoke.py:37`, and tests — **never by the HTTP boundary**. An HTTP review request therefore carries `implementer_vendor=None` and the check is silently skipped. **Evidence:** policy unit tests (`test_review_cannot_use_implementer_vendor`, `test_review_allows_different_vendor`) prove the policy logic; no boundary-level test supplies an implementer vendor. **Change:** none (documented only). **Limitation:** end-to-end independence is **not** enforced.
11. **Verifier PASSes an empty gate — OPEN (documented, not disguised).** **Affected:** `tools/design_gate_verifier.py:184-199`. If a gate has zero checks, `worst` remains `STATUS_PASS` and the reason reads `all 0 check(s) pass`. **Evidence:** `tests/test_design_gates.py:285 test_gate_with_no_checks_passes_vacuously` (asserts the current behavior; does **not** fix it). **Limitation:** an accidentally-empty gate would be reported PASS.
12. **`validate_decision_manifest.py` WARN — OPEN.** The missing “Affected manifest IDs” field on decision 26.18 yields a WARN (not FAIL). **Change:** none (register left authoritative).
13. **`config/models.yaml` confidential denylist gap — OPEN / deferred.** The file is **protected**; the confidential lane’s `deny_providers` list is incomplete relative to the desired policy. **Change:** none without authorization.

---

## 7. Changes implemented and files affected

**verified** — 17 modified + 3 new files (this report is an additional new file):

| File | Change |
|---|---|
| `company_os/control_plane/policy.py` | fail-closed lanes |
| `config/hermes-provider.yaml` | comment-only parity |
| `tools/check_bundle_budget.py` | deterministic index + quote handling |
| `tools/design_gate_verifier.py` | honor `--registry` |
| `tools/hermes_company_os.py` | doc-drift + import |
| `tools/penpot_mcp_client.py` | `ensure_http_url()` + guarded urlopen |
| `tools/penpot_command_runtime.py` | route via guard + `# nosemgrep` |
| `tools/penpot_provision.py` | route via guard + `# nosemgrep` |
| `tools/validate_decision_manifest.py` | remove unused `import sys`; +x |
| `tools/validate_design_specs.py` | remove unused `import sys`; +x |
| `tools/validate_design_tokens.py` | threshold enforcement |
| `tests/test_bundle_budget.py` | +3 |
| `tests/test_control_plane_acceptance.py` | +4 (fail-closed) |
| `tests/test_design_gates.py` | +171 lines (adversarial verifier tests) |
| `tests/test_design_validators_failclosed.py` | +contrast tests |
| `tests/test_hermes_company_os.py` | +`HermesHomeResolutionTests` |
| `tests/test_penpot_mcp_client.py` | +`EnsureHttpUrlTests` (4) |
| `.gitleaks.toml` | **new** |
| `evidence/runs/agent-orchestration-audit-2026-10-11.md` | **new** |
| `evidence/runs/agent-orchestration-hardening-final-2026-10-11.md` | **new** |

---

## 8. Canonical contract and configuration synchronization results

**verified** — `tools/sync_model_compat.py --check` keeps `config/model-compat.yaml` ↔ `config/model-compat.json` identical (pair present; mtimes 2026-10-07). **verified** — Golden set: `49/49 passed, 0 failed`, determinism stable (3 passes), `verdict: pass`, `repo_commit: 7f6ca2160381d79742731f0d357474f9b99c9388`, `network: loopback_only`, `llm_in_judgement: False`, `golden_set_sha256: sha256:15c9ccc007adb1bd903746d5e7dd289cf11347fec99ee65bf7a6524230504535`.

---

## 9. Hermes/OpenCode integration results

**verified** — `tools/hermes_company_os.py` resolves `$HERMES_HOME` correctly (bug fix + `HermesHomeResolutionTests`); `tests/test_hermes_company_os.py` = 44 OK. `config/hermes-provider.yaml` change is comment-only (no behavioral drift). **verified** — OpenCode/Company-OS boundary tests (`tests/test_opencode_company_os.py`) pass within the focused suite (229 OK). **deferred** — no live Hermes/Bifrost integration exercise was performed this session (offline verification only).

---

## 10. Policy, routing, and reviewer-independence results

**verified** — `config/models.yaml` lanes: `public`, `internal`, `confidential`, `restricted`. `policy.py:lane_allowed` rejects unknown lanes, denies the `restricted` lane by default unless `deny_all_automation: false`, enforces `confidential.deny_providers`, and enforces `public`/`internal` allowlists. `cost_allowed` blocks paid candidates under zero-cost and blocks the paid mistral review fallback unless configured. `vendor_allowed` enforces reviewer-independence **only when** `ctx.implementer_vendor` is set and `policy.reviewer_vendor_must_differ_from_implementer` is true.

**verified — the gap (§6.10):** the field `implementer_vendor` is populated only by `company_os/control_plane/cli.py:45`, `tools/control_plane_smoke.py:37`, and tests — **not** by `boundary.py`. HTTP review traffic therefore never carries the implementing vendor and the independence rule is inert end-to-end. **Change:** none. **Limitation:** explicit and unresolved.

**deferred** — `config/models.yaml` confidential `deny_providers` is incomplete (protected file; no edit without authorization).

---

## 11. Design manifest and owner-decision reconciliation

**verified** — `docs/design/DESIGN_MANIFEST.yaml` = **290** entries: CURRENT 30, REQUIRED 178, FUTURE 60, OUT_OF_SCOPE 22. *(The earlier brief’s 175/63 is **historical** and superseded by this recomputation.)* Decision register `docs/design/DESIGN_DECISIONS.md` statuses: 26.1 PENDING, 26.5 PENDING, 26.9 BLOCKED, 26.11 PENDING_ESCALATE, 26.4 APPROVED, 26.16 APPROVED, 26.18 APPROVED (no “Affected manifest IDs” → decision validator WARN). **No §26.19 row was added; no canonical decision was modified.**

---

## 12. Dark-theme decision and evidence

**verified** — Decision 26.4 (dark theme) = **APPROVED**, recorded in `docs/design/DESIGN_DECISIONS.md` and reflected in `docs/design/DECISION_MANIFEST_EFFECTS.yaml`, which validates under `tools/validate_decision_manifest.py` (exit 0; one WARN for 26.18). No theme/brand assets were fabricated.

---

## 13. Gate 2 criteria-by-criteria status

**verified** — `tools/design_gate_verifier.py --enforce GATE-2` → `OK: GATE-2 is PASS` (rc 0). Criteria per `docs/design/DESIGN_GATES.yaml`:

| # | Check | Kind | Result |
|---|---|---|---|
| 1 | `manifest_validates` (`tools/validate_design_manifest.py`) | tool | PASS |
| 2 | `tokens_validates` (`tools/validate_design_tokens.py`) | tool | PASS |
| 3 | `graph_validates` (`tools/validate_design_graph.py`) | tool | PASS |
| 4 | `decision_effects_validates` (`tools/validate_decision_manifest.py`) | tool | PASS (WARN on 26.18) |
| 5 | `contract_specs_validate` (`tools/validate_design_specs.py`) | tool | PASS |
| 6 | `gate2_reconciliation_evidence` (`evidence/runs/design-gate2-manifest-reconciliation-2026-10-11.md`) | evidence | PASS |
| 7 | `gate2_verification_evidence` (`evidence/runs/design-gate2-verification-2026-10-08.md`) | evidence | PASS |

**open limitation (§6.11):** the verifier returns PASS for a gate with **zero** checks (`test_gate_with_no_checks_passes_vacuously`). GATE-2 is not empty, but nothing guards against it becoming empty.

---

## 14. Penpot subgate status and verification level

**verified** — `tools/design_gate_verifier.py --enforce PENPOT-PROTOCOL-SUBGATE` → `OK: PENPOT-PROTOCOL-SUBGATE is PASS` (rc 0); evidence `evidence/runs/design-penpot-protocol-subgate-2026-10-11.md` carries `STATUS: PASS`.

**blocked** — The Penpot **Command API** lane is unreachable (Cloudflare HTTP 403, `error code: 1010`; no bypass attempted). **unverified** — the live `update-file`/`changes` protocol schema remains INTERNAL / UNDOCUMENTED / UNVERIFIED. Writable lane = MCP plugin. No production Penpot object was mutated this session.

---

## 15. Gates 3–7 readiness and exact blockers

**verified / blocked** — `tools/design_gate_verifier.py --enforce GATE-3` → `REFUSE: GATE-3 is BLOCKED` (rc 2), reason:

> `token_register_closed: register closure (decisions required for token establishment are APPROVED [expected 26.1=APPROVED, actual=PENDING] [expected 26.5=APPROVED, actual=PENDING] [expected 26.9=APPROVED, actual=BLOCKED] [expected 26.11=APPROVED, actual=PENDING_ESCALATE])`

Prerequisites (from `DESIGN_GATES.yaml`): GATE-3 ← {GATE-2, PENPOT-PROTOCOL-SUBGATE}; GATE-4 ← GATE-3; GATE-5 ← GATE-3; GATE-6 ← {GATE-4, GATE-5}; GATE-7 ← GATE-6. **GATE-2 PASS and the Penpot subgate PASS do not unlock them.**

---

## 16. Tests, commands, exit codes, failures, skips, and evidence

**verified this session** (exact commands):

| Item | Command | Result | Evidence |
|---|---|---|---|
| Golden set | `.venv/bin/python tools/company_os_golden_eval.py` | `49/49 passed, 0 failed`; determinism stable (3 passes); rc 0 | `/tmp/opencode/golden.log`; `artifacts/golden-set-evidence.json` |
| Focused suites (8 modules) | `.venv/bin/python -m unittest tests.test_control_plane_acceptance tests.test_control_plane_boundary tests.test_design_validators tests.test_design_validators_failclosed tests.test_design_gates tests.test_bundle_budget tests.test_hermes_company_os tests.test_opencode_company_os` | `Ran 229 tests … OK` (73.733 s) | captured this session |
| Penpot suites (4 modules) | `.venv/bin/python -m unittest tests.test_penpot_mcp_client tests.test_penpot_provision tests.test_penpot_live_runtime tests.test_penpot_offline` | `Ran 123 tests … OK` (30.481 s) | captured this session |
| Policy unit tests | `.venv/bin/python -m unittest tests.test_control_plane_acceptance.PolicyTests -v` | `Ran 9 tests … OK` | captured this session |
| Full gate (PASS) | `GATES_LANGFUSE_MODE=hermetic bash scripts/gates.sh` | `status=PASS`, `failed_checks=0`, rc 0; unit `Ran 1124 tests in 252.553s … OK` | `/tmp/opencode/gates-run2.log` |
| Full gate (FAIL, pre-F/G) | same | `status=FAIL`, `failed_checks=2` (gitleaks `leaks found: 6`, semgrep `FAIL`); unit `Ran 1120 tests in 227.929s` | `/tmp/opencode/gates-run.log` |

**Test-count sequence (labelled):**
- **verified (historical):** 1,097 @ 2026-10-11 10:56Z — recorded in `evidence/runs/design-gate2-final-report-2026-10-11.md:130` as `Ran 1097 tests — OK` (was 1,080; +17 new).
- **historical:** 1,101, then 1,105 — from the same-day session transcript, command `python3 -m unittest discover -s tests`; **not** re-captured this session.
- **verified (this session):** 1,120 (FAIL run, before fixes F/G) → **1,124** (PASS run, after fixes F/G). The +4 delta equals the added `EnsureHttpUrlTests` (4).

**Skips are separate from passes:** the **langfuse** check is `SKIP langfuse trace — credentials absent; hermetic mode records an explicit SKIP, never a pass` (`gates-run2.log:1692`). No BLOCKED/FAIL checks remain in the PASS run. (`langfuse: verdict=fail …` lines earlier in the log belong to the `verify_langfuse_trace` **unit tests**, not the gate check.)

---

## 17. Security, safety, performance, and operational risks

- **verified (closed):** gitleaks detection power intact — default rules retained; the allowlist is six exact anchored values; a planted real-looking secret still fires.
- **verified (closed):** `ensure_http_url()` prevents `file://` and other non-HTTP(S) schemes and empty-host targets from reaching `urlopen` in all three transports.
- **open (must stay explicit):** reviewer-vendor independence is not enforced at the boundary (§6.10, §10).
- **deferred:** `config/models.yaml` confidential-lane denylist gap (protected file, §6.13).
- **open:** the design-gate verifier PASSes an empty gate (§6.11, §13).
- **operational:** hermetic gate requires no credentials; langfuse is SKIP (not a pass). Resources are tight (≈3.6 GiB RAM / 2 cores); the full gate completes in ~4–5 min. `requirements-pinned.txt` drives osv-scanner.
- **safety:** no destructive Git operations, no staging/commit/push, no production Penpot or infra mutation performed; no secrets printed or written (verified by scanning the evidence directory for secret patterns → none found).

---

## 18. Owner decisions still required, with precise scope

**blocked / deferred** — Gates 3–7 remain fenced pending:

- **26.1** brand mark — **PENDING** (asset-gated; `BRAND_ASSET_SPEC.md` forbids inventing artwork).
- **26.5** — **PENDING**.
- **26.9** contact path — **BLOCKED** (no safe default; 2026-10-09 recorded “no form in v1”).
- **26.11** legal/privacy — **PENDING_ESCALATE**.
- **26.4** dark theme — APPROVED (§12).

**Protected / not authorized:** editing `config/models.yaml` (confidential-lane denylist gap, §6.13/§19). The **decision register** (`docs/design/DESIGN_DECISIONS.md`) must remain authoritative — no §26.19 row and no retro-edit of canonical decisions to manufacture approval.

**Authorized action requested of the owner:** commit + push the 17-file hardening set (plus the anchored `.gitleaks.toml`) so CI enforces the fixes (§20). Git writes are outside my authorization.

---

## 19. Unverified claims and environmental limitations

**unverified** — Live Penpot Command API schema/protocol (`update-file`, `changes`): blocked by Cloudflare 403/1010; the subgate PASS rests on the evidence document, not a live protocol exercise.

**unverified / not evidenced this session** — pre-session test counts 1,101 and 1,105 (transcript-only; §16).

**inferred** — CI has not yet enforced the fixes (local-only commits; §3).

**open (preserved, not disguised):** reviewer-vendor independence not enforced at the boundary; `config/models.yaml` confidential-lane denylist gap (protected); `validate_decision_manifest.py` WARN for the missing “Affected manifest IDs” field; the design-gate verifier returns PASS for an empty gate; the Penpot Command API remains blocked; owner-gated decisions remain outstanding.

---

## 19b. Residual risks (exact)

1. **Boundary independence gap** — a review request routed over HTTP can use the same vendor as the implementer without triggering `reviewer_vendor_same_as_implementer`. Severity: **high** for review integrity; no boundary-level test currently detects it.
2. **Confidential-lane denylist incompleteness** in protected `config/models.yaml` — severity: **medium/high**; cannot be corrected without authorization.
3. **Empty-gate PASS** in `design_gate_verifier.py` — severity: **medium** (a gate could appear green while asserting nothing).
4. **Decision-manifest WARN** — severity: **low** (informational; register remains authoritative).
5. **Penpot Command API unavailable** — severity: **medium** for protocol-level assurance (blocked externally).

---

## 20. The single highest-value next action that is safe and executable

**verified conclusion:** all deterministic, authorized fixes are complete and the local integration gate is green.

**Highest-value next action (single):** owner-authorized **commit + push** of the 17-file hardening set plus the anchored `.gitleaks.toml`, so CI independently enforces the repaired gitleaks and semgrep gates. (I cannot perform Git writes.)

**Immediate parallel owner decision:** resolve **26.1** and **26.5**; that is the prerequisite to unfence Gate 3. **Do not start Gate 3 or any downstream gate, and do not declare complete system closure** while the boundary-enforcement gaps of §6.10–§6.13 remain.

---

### Appendix — exact commands used to establish this report

```text
git rev-parse --abbrev-ref HEAD; git rev-parse HEAD
git status --short; git diff --stat
git check-ignore -v artifacts/golden-set-evidence.json
cat .gitleaks.toml
.venv/bin/python tools/company_os_golden_eval.py
.venv/bin/python -m unittest tests.test_control_plane_acceptance \
  tests.test_control_plane_boundary tests.test_design_validators \
  tests.test_design_validators_failclosed tests.test_design_gates \
  tests.test_bundle_budget tests.test_hermes_company_os \
  tests.test_opencode_company_os
.venv/bin/python -m unittest tests.test_penpot_mcp_client \
  tests.test_penpot_provision tests.test_penpot_live_runtime \
  tests.test_penpot_offline
.venv/bin/python -m unittest tests.test_control_plane_acceptance.PolicyTests -v
.venv/bin/python tools/design_gate_verifier.py --enforce GATE-2
.venv/bin/python tools/design_gate_verifier.py --enforce PENPOT-PROTOCOL-SUBGATE
.venv/bin/python tools/design_gate_verifier.py --enforce GATE-3
grep -nE "Ran [0-9]+ tests|status=|failed_checks=|leaks found" \
  /tmp/opencode/gates-run.log /tmp/opencode/gates-run2.log
gitleaks git --no-banner --redact .   # 0 findings
gitleaks dir .                        # 0 findings, with .gitleaks.toml
ruff check .                          # All checks passed
```
