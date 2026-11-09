# Company OS — Principal Engineer Full-System Audit, Synchronization, and Closure

**Date:** 2026-10-11 · **Branch:** `feat/design-gate2` · **HEAD:** `7f6ca21` · **Working tree:** dirty (unstaged) · **Gate result:** `status=PASS`, `failed_checks=0`

*This report follows the 20-section structure in the mission brief's §14. Facts are measured; inferences, historical figures, and unverified claims are labelled as such. No prior evidence file was overwritten. No git write operation was performed.*

---

## 1. Executive summary and actual outcome

The request-to-release path (Hermes → OpenCode → control-plane policy → Bifrost → repository changes → independent verification → gates → CI → release decision) was audited against the actual code and configuration, not documentation. Seven verified defects were corrected (**A–G**), each with root-cause analysis and regression/adversarial tests. The two hard CI gate failures found by the full run — **gitleaks (6 findings)** and **semgrep (3 findings)** — were diagnosed as a detector false-positive class and a real low-severity dynamic-`urllib` pattern respectively, and both were remediated with genuine fixes (a scoped allowlist preserving detection, and an HTTP-scheme guard), not blanket suppression. The complete local gate suite now exits **`status=PASS`, `failed_checks=0`**.

The programme is **not** complete end-to-end: Gates 3–7 remain blocked on owner decisions (brand mark 26.1, contact path 26.9, legal/privacy 26.11, and 26.5), and the 17-file hardening set is deliberately uncommitted. Those are the only outstanding items.

## 2. Repository, branch, HEAD, and working-tree baseline

- **Root:** `/home/genie/company` (git repo). **Branch:** `feat/design-gate2`. **HEAD:** `7f6ca21` (`evidence(design): note Gate 2 report status was committed, not pushed`).
- **Working tree:** dirty — 17 tracked modifications + 2 untracked files (`.gitleaks.toml`, `evidence/runs/agent-orchestration-audit-2026-10-11.md`). Full list in §7/§19.
- **Runtimes:** system `python3` lacks `httpx`; project `.venv/bin/python` (3.12, has `httpx`) used for all runs; node v24.20.0; npm 11.19.0; `ruff` 0.16.10 (PATH; not importable in `.venv`); `hermes`, `opencode`, `gh`, and scanners (`gitleaks` 8.30.1, `trivy`, `semgrep`, `osv-scanner`, `shellcheck`, `actionlint`, `promptfoo`) on PATH.
- **Resources (constrained):** ~3.6 GiB RAM, 2 cores, disk ~83% used; long suites exceed the 120 s default command timeout.
- **Pre-change baseline:** `gates.sh` = `status=FAIL`, `failed_checks=2` (gitleaks, semgrep); full suite recorded `1105` OK pre-change (see §16).

## 3. Local/remote discrepancies

- **Upstream:** `origin/feat/design-system-source-of-truth`. Divergence from existing local remote-tracking refs (**no fetch**): `left-right 0 9` → local is **9 ahead, 0 behind**. The last 6 commits are local-only evidence/design commits.
- `7f6ca21` records that the Gate 2 report was **committed, not pushed** — consistent with the 9-ahead status.
- **FACT:** no remote snapshot was substituted for the local working tree. Freshness of `origin/*` refs was not verified this session (§19).

## 4. Request-to-release architecture and execution trace

Authority map from the real code/config:

1. **Hermes** loads `$HERMES_HOME/config.yaml`; `hermes_home()` resolution fixed earlier this programme (+`HermesHomeResolutionTests`).
2. Hermes invokes **OpenCode**, which reads project `opencode.json` natively (provider `company-os`, `@ai-sdk/openai-compatible`, `baseURL http://127.0.0.1:8090/v1`, 9 logical models).
3. **Control-plane boundary** (`company_os/control_plane/boundary.py`): transport-only, `127.0.0.1:8090`, `DEFAULT_LANE="internal"`, `FORBIDDEN_LANES={"restricted"}`, rejects unknown fields, forwards logical roles only to `CompanyOSRouter`.
4. **Router/policy** (`policy.py`): lane→provider eligibility, cost authorization, vendor rules → **Bifrost** (`http://127.0.0.1:8080`).
5. `config/models.yaml` is the routing source of truth; `config/model-compat.{yaml,json}` kept in parity by `tools/sync_model_compat.py --check` (hard gate).
6. `scripts/gates.sh` runs the full check set; CI (`.github/workflows/gates.yml:82`) executes `./scripts/gates.sh`.
7. Design programme gates G1→G7 with an independent Penpot subgate.

**Traceability:** roles/models → `config/models.yaml` + `tools/hermes_company_os.py BOUNDARY_ROLES`; provider policy → `policy.py`; parity → `sync_model_compat.py --check`; design contracts → `docs/design/*` + validators + `tools/design_gate_verifier.py`; release decision → `gates.sh` exit status. No duplicate registry, framework, or parallel orchestration was introduced.

## 5. Existing automation and synchronization inventory

- **Runner:** `scripts/gates.sh` — git repo/diff, bash syntax, shellcheck, actionlint, gitleaks `:120`, trivy, semgrep, osv-scanner, model-compat sync, python compile, **unit tests `:149`**, ruff `:236`, design manifest/effects/tokens/graph/specs/gate-sequence/penpot map/component specs/compiler/token export/diagnostic, golden set, trajectory, promptfoo, langfuse.
- **CI:** `.github/workflows/gates.yml:82` → `./scripts/gates.sh`.
- **Sync/validators:** `tools/sync_model_compat.py`, `tools/design_spec.py`, `tools/compile_design.py`, `tools/design_tokens_export.py`, `tools/design_diagnostic.py`, `tools/validate_penpot_map.py`, `tools/penpot_target_guard.py`, `tools/validate_design_manifest.py`, `tools/validate_design_tokens.py`, `tools/validate_design_specs.py`, `tools/design_gate_verifier.py` (dead `--registry` fixed earlier).
- **Correction to the brief:** `tools/run_golden_set.py` **does not exist**; the correct tool is `tools/company_os_golden_eval.py`.

## 6. Every verified defect and its root cause

| ID | Defect | Root cause | Status |
|---|---|---|---|
| **A** | `lane_allowed` fail-open on unknown lane; `restricted` denied only when a `restricted` block with `deny_all_automation` existed | no lane-membership validation; missing block not fail-closed | **Fixed** |
| **B** | `contrast_matrix.policy.thresholds` was decorative; a pair could declare any `min_ratio` | no `threshold_class`↔`min_ratio` cross-check | **Fixed** |
| **C** | single-quoted `src`/`href` missed; `sorted(...)[0]` nondeterministic (FURB192) | regex assumed double quotes; glob-index nondeterminism | **Fixed** |
| **D** | false "uses `hermes config set`" claim in docstring + config comment; redundant local `import json` | doc drift after behavior changed to text-level merge | **Fixed** |
| **E** | `validate_design_manifest.py` EXE001/F401 | — | **Already fixed** (verified: shebang present, executable, no `import sys`) |
| **F** | **CI FAIL — gitleaks 6 findings** | `generic-api-key` entropy heuristic fired on a dict field named `key` whose *value* is a non-secret identifier | **Fixed (scoped allowlist, detection intact)** |
| **G** | **CI FAIL — semgrep 3 blocking findings** | dynamic URL passed to `urllib.request.urlopen` (also honors `file://`) | **Fixed (HTTP-scheme guard + documented suppression)** |

**Fix F detail.** Findings were `docs/design/DESIGN_GATES.yaml:117/123/177` and `tools/validate_design_specs.py:84/111` (identifier values), plus `tests/test_penpot_offline.py:658` (synthetic test literal). None are credentials. New `.gitleaks.toml`: `[extend] useDefault=true` + `[allowlist]` regexes anchored to exactly those 6 values, with rationale. **Not weakened:** `gitleaks git .` and `gitleaks dir .` both → 0 findings, while planted real-looking secrets in a temp dir still fire.

**Fix G detail.** New `ensure_http_url()` in `tools/penpot_mcp_client.py` returns the URL only for `http`/`https` with a hostname; all three `UrllibTransport.post` sites (`penpot_mcp_client.py`, `penpot_command_runtime.py`, `penpot_provision.py`) now route through it, so `file://` can never reach `urlopen`. semgrep's audit heuristic does not model the sanitizer, so each `urlopen` carries a scoped `# nosemgrep: python.lang.security.audit.dynamic-urllib-use-detected.dynamic-urllib-use-detected` with an inline justification.

## 7. Changes implemented and files affected

All edits are local, unstaged, and preserve unrelated working-tree changes. Rule: do not touch unrelated work.

- `company_os/control_plane/policy.py` — **A**: `VALID_LANES = frozenset({"public","internal","confidential","restricted"})`; `lane_allowed` returns `(False,"unknown_lane")` for undeclared lanes; restricted deny-by-default (`deny_all_automation` default `True`; missing block fails closed); reasons `"restricted_lane_denies_automation"` / `"restricted_explicitly_enabled"`.
- `tools/validate_design_tokens.py` — **B**: `threshold_class` must be known and `min_ratio` must equal `thresholds[class]`, else error.
- `tools/check_bundle_budget.py` — **C**: new `_index_document()` (deterministic `min()` of `*.html`, shared by `site_payload` and `check_delivered`); refs regex accepts single- or double-quoted `src`/`href`.
- `tools/hermes_company_os.py`, `config/hermes-provider.yaml` — **D**: corrected `hermes config set` claim; removed redundant local `import json`.
- `.gitleaks.toml` — **NEW** (**F**): anchored allowlist + rationale.
- `tools/penpot_mcp_client.py`, `tools/penpot_command_runtime.py`, `tools/penpot_provision.py` — **G**: `ensure_http_url()` guard + scoped `# nosemgrep`.
- Tests: `tests/test_control_plane_acceptance.py` (`test_unknown_lane_fails_closed`, `test_restricted_denies_when_config_block_missing`), `tests/test_design_validators_failclosed.py` (2 threshold tests), `tests/test_bundle_budget.py` (`BundleBudgetSingleQuoteTests` ×3), `tests/test_penpot_mcp_client.py` (`EnsureHttpUrlTests` ×4).
- Earlier this programme (still local): `tests/test_design_gates.py`, `tests/test_hermes_company_os.py`, `tools/design_gate_verifier.py`, `tools/validate_decision_manifest.py`, `tools/validate_design_specs.py`, `tools/penpot_command_runtime.py`, `evidence/runs/agent-orchestration-audit-2026-10-11.md`.

## 8. Canonical contract and configuration synchronization results

- `tools/sync_model_compat.py --check` → **PASS** (`PASS model-compat YAML/JSON synchronized`; `PASS model compatibility artifact`) in the PASS run.
- `config/models.yaml` **not modified** (protected by `AGENTS.md`). `config/hermes-provider.yaml` comment-only.
- Each shared contract retains a single documented authority with mechanical, read-only parity enforcement that exits non-zero on drift. No new source of truth was invented.

## 9. Hermes/OpenCode integration results

- `$HERMES_HOME` path resolution reconciled earlier (+`HermesHomeResolutionTests`): selected config path is the intended one.
- `tools/hermes_company_os.py` docstring corrected — it performs a **text-level merge preserving comments**, not `hermes config set`.
- Boundary↔OpenCode parity asserted by `tests/test_opencode_company_os.py` (no physical-model markers; founder's `~/.config/opencode/opencode.json` not displaced).
- **Evidence:** `tests/test_hermes_company_os.py` = 44 OK; `tests/test_opencode_company_os.py` PASS.

## 10. Policy, routing, and reviewer-independence results

- Denied lanes/providers, cost authorization, and vendor rules covered by `PolicyTests` (6 OK incl. the two new fail-closed tests) and `test_control_plane_boundary`.
- **REPORTED (not fixed):** reviewer-vendor-independence is not enforced at the agent-facing boundary (`tests/test_control_plane_boundary.py:382` pins current behavior).
- **REPORTED (not fixed):** `config/models.yaml` confidential-lane denylist omits free `groq`/`zai`/`cloudflare` (finding H3). Config is protected → no edit.

## 11. Design manifest and owner-decision reconciliation

- **FACT (recomputed this pass):** `docs/design/DESIGN_MANIFEST.yaml` = **290 items** — `CURRENT 30`, `REQUIRED 178`, `FUTURE 60`, `OUT_OF_SCOPE 22`. The historical brief figures (REQUIRED 175 / FUTURE 63) are superseded by the reconciled 178/60.
- Register: 26.1 PENDING, 26.5 PENDING, 26.9 BLOCKED, 26.11 PENDING_ESCALATE, 26.4 APPROVED, 26.16 APPROVED, 26.18 APPROVED (no "Affected manifest IDs" line).
- **REPORTED:** `tools/validate_decision_manifest.py` emits WARN (not FAIL) for 26.18; converting to FAIL would require editing a canonical decision doc (forbidden) → left as a documented finding.

## 12. Dark-theme decision and evidence

- **BRAND-013 = APPROVED (dark theme)**, register **26.4**, dated **2026-10-08**, recovered from the canonical decision register (not inferred from code). BRAND-013 remains REQUIRED; the manifest was reconciled to 178/60 accordingly.

## 13. Gate 2 criteria-by-criteria status

- **GATE-2 = PASS.** Evidence (`gates-run2.log`): `PASS design gate sequence (GATE-2)` and `OK: GATE-2 is PASS`, plus `PASS design manifest`, `PASS design tokens`, `PASS design graph`, `PASS design contract specs`, `PASS penpot map (offline)`, `PASS design component specs`, `PASS design compiler (offline)`, `PASS design token export (offline)`, `PASS design diagnostic (offline)`.
- Verdict derives from required subchecks and prerequisite states; no manual pass label was used.

## 14. Penpot subgate status and verification level

- **Offline protocol subgate = PASS** — `evidence/runs/design-penpot-protocol-subgate-2026-10-11.md`.
- **Live command path = BLOCKED** — Penpot Command API lane returns Cloudflare HTTP 403 (`error code: 1010`); not bypassed. Writable path is the MCP plugin lane (browser tab awake; file-identity guard every dispatch).
- **No protected Penpot file was mutated:** production `52a5041f-08a1-80f1-8008-c50e307f3ef4`; scratch `52a5041f-08a1-80f1-8008-c383654a1095`.
- The `update-file` / internal `changes` schema remains **INTERNAL / UNDOCUMENTED / UNVERIFIED** (no authoritative API documentation observed).

## 15. Gates 3–7 readiness and exact blockers

- **GATE-3 = BLOCKED** on: **26.1** brand mark (asset-gated; `BRAND_ASSET_SPEC.md` forbids inventing artwork), **26.5** PENDING, **26.9** contact path (no safe default; 2026-10-09 = no form in v1), **26.11** legal/privacy (needs founder inputs).
- **GATES 4–7 = fenced** behind Gate 3. No premature execution. All independent authorized work that does not depend on these decisions was completed.

## 16. Tests, commands, exit codes, failures, skips, and evidence

| Command | Scope | Result | Evidence |
|---|---|---|---|
| `GATES_LANGFUSE_MODE=hermetic bash scripts/gates.sh` | full local CI equivalent (HEAD `7f6ca21`, dirty) | **PASS**, `failed_checks=0`, rc0 | `/tmp/opencode/gates-run2.log`; `artifacts/gate-evidence.json` |
| `.venv/bin/python -m unittest discover -s tests -v` | entire Python suite | **Ran 1124 · OK** | `gates-run2.log:1389-1391` |
| `gitleaks git .` / `gitleaks dir .` | secret scan | 0 findings (detection proven intact via planted secrets) | inline |
| `semgrep --config=auto --error` | SAST | 0 findings (496 rules / 265 files) | `gates-run2.log:88,95` |
| `tools/company_os_golden_eval.py` | routing evaluation | 49/49 pass, rc0 | `artifacts/golden-set-evidence.json` |
| focused suites | control-plane/design/bundle/hermes/opencode | 229 OK | inline |
| penpot suites | mcp_client/provision/live_runtime/offline | 123 OK | inline |
| `ruff check .` | lint | All checks passed | `gates-run2.log` |

- **PASS-run checks:** git repo/diff, bash syntax, shellcheck, actionlint, gitleaks, trivy, semgrep, osv-scanner, model-compat, python compile, unit tests, bundle budget, design manifest/effects/tokens/graph/specs/gate-sequence(GATE-2)/penpot map/component specs/compiler/token export/diagnostic, golden set, trajectory, promptfoo, ruff. **SKIP:** langfuse (hermetic — correctly not counted as pass).
- **Pre-fix run:** same command → `status=FAIL`, `failed_checks=2` (gitleaks, semgrep). Log `/tmp/opencode/gates-run.log`.
- **Test-count by timestamp (FACT):** 1097 @10:56Z (prior report) → 1101 → 1105 → **1124** (PASS run). Growth = added tests.

## 17. Security, safety, performance, and operational risks

- **Resolved:** gitleaks false-positive class (scoped, anchored allowlist; detection verified intact); dynamic-`urllib` pattern (`http`/`https`-only guard; `file://` blocked; documented `# nosemgrep`).
- **No secret was printed.** Credential references handled as hashes/lengths only; `~/company-os/secrets/providers.env` untouched.
- **Open risks:** reviewer-vendor-independence gap (§10); `models.yaml` confidential denylist omission (H3, config protected); `tools/design_gate_verifier.py` vacuous PASS on an empty gate (pinned by existing tests); live Penpot protocol unverified.
- **Operational:** constrained host (2 cores / 3.6 GiB) makes the full suite ~250 s; long commands need explicit timeouts.

## 18. Owner decisions still required, with precise scope

| Decision | Register | Affected artifact | Why it blocks |
|---|---|---|---|
| Brand mark | **26.1** | `BRAND_ASSET_SPEC.md`, GATE-3 | artwork must not be invented |
| Design item | **26.5** | design manifest | PENDING |
| Contact path | **26.9** | site/templates (GATE-5) | no safe default; 2026-10-09 = no form in v1 |
| Legal/privacy | **26.11** | site legal pages | needs founder inputs |
| Commit/PR authorization | — | the 17-file hardening set | git writes forbidden by mission |
| Optional policy change | H3 | `config/models.yaml` (protected) | confidential denylist for free providers |

## 19. Unverified claims and environmental limitations

- **UNVERIFIED:** freshness of `origin/*` refs (no fetch performed by instruction).
- **UNVERIFIED:** live Penpot protocol behavior (Cloudflare 1010; MCP lane not exercised live this pass).
- **HISTORICAL:** "1097 OK" and prior report figures are accurate only as of their timestamps; superseded by 1124.
- **ENVIRONMENTAL:** langfuse gate exercised in hermetic mode only (SKIP); live langfuse not run.
- **NOT RUN:** Gates 3–7 (blocked); any production mutation (forbidden).
- New/untracked files: `.gitleaks.toml`, `evidence/runs/agent-orchestration-audit-2026-10-11.md`.

## 20. The single highest-value next action that is safe and executable

**Founder: review this report and the 17-file hardening diff, then authorize commit + PR** so the green `gates.sh` result is enforced on a pushed revision (I am barred from git writes). The only *non-owner* blocker is the Gate-3 owner-decision set — once **26.1** and **26.5** are decided, Gate 3 can proceed.

---

*Legend — Facts: measured this pass (gate logs, test counts, manifest counts, git status). Inferences: root-cause attributions for F/G, consistent with scanner output and reproduction. Historical: prior-report figures and the 1097→1101→1105 progression. Unverified: items in §19. No git add/commit/push/merge/rebase/reset/clean/stash or destructive checkout/restore was executed; all changes are local and unstaged.*
