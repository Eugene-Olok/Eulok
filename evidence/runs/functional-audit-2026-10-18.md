# Company OS — Functional Audit (post-merge)

Date: 2026-10-18
Auditor: OpenCode (Company OS engineering agent)
Scope: top-to-bottom functional audit of the merged Company OS repository —
Stages 1–7 plus the required deliverables. Read-only until a defect required a
fix (Stage 7).

## 0. Baseline (Stage 1)

| Fact | Value |
|---|---|
| `origin/main` (audit target) | `bba862d68803b113b51e6331bb05c70351c5ba6a` (PR #9 squash merge, `mergedAt` 2026-10-17T19:04:51Z) |
| Meta-verified tree | `7811dd79b3279517821c621dde3e71583ffe18f2` — `git diff --stat 7811dd7 bba862d` is empty (byte-identical) |
| Post-merge CI on `bba862d` | `deterministic-gates` run 39060893698 · `phase8-gates` run 39060893729 — both success |
| Audit worktree | branch `fix/business-evidence-placeholder-guard` (rebased onto `bba862d`; carries the D1 + D4 fixes and this report) |
| Tracked files | 593 |

## 1. Executive result per layer

| Layer | Result | Evidence |
|---|---|---|
| Deterministic gates (main) | **PASS** | `artifacts/gate-evidence.json` — 30/30 checks PASS, `release_eligibility=PASS`, `worktree=clean`, `langfuse_trace=PASS` |
| Deterministic gates (Phase 8) | **PASS (non-deploy), BLOCKED ×4 external** | `artifacts/gate-evidence-phase8.json` — `failed=0 blocked=4`, tests 1682 ≥ baseline 406 |
| Business lifecycle | **PASS** | synthetic end-to-end + `test_business_*.py`, `test_state_machine.py` |
| Control plane / model gateway | **PASS** | `test_control_plane_*`, `test_bifrost_transport`, `test_model_runtime`, golden set, trajectory, promptfoo |
| External integrations (Zoho CRM/Books) | **PASS (unit/mocked)** | `test_zoho_crm.py`, `test_zoho_books.py` |
| Observability (Langfuse) | **PASS** | credentialed trace `verdict=pass`; `test_langfuse_trace.py` |
| Security / secrets | **PASS** | gitleaks 133 commits/10.94 MB no leaks; Phase 8 secret hygiene PASS; `test_security_phase8.py` |
| Live site deploy / analytics | **BLOCKED (not authorized)** | zero CI secrets by design; deploy not run this audit |

## 2. Exact commands and totals

```
.venv/bin/python -m unittest discover -s tests
  -> Ran 1673 tests, OK (skipped=5)  [baseline before fix: 1668]

ruff check .                                  -> All checks passed (0.17.0 and 0.16.10)
                                                
./scripts/gates.sh                            -> GATES_RC=0, status=PASS,
                                                 release_eligibility=PASS,
                                                 worktree=clean, failed=[],
                                                 langfuse_trace=PASS

PHASE8_ALLOW_BLOCKED=1 ./scripts/gates-phase8.sh
  -> status=BLOCKED failed=0 blocked=4 tests=1673 baseline=406 preserved

PYTHONPATH=. .venv/bin/python tools/validate_business_workflow.py clients/_template
  -> BLOCKED template_or_reserved_client_directory (exit 1)  [fail-closed]

.venv/bin/python -m products.reconciliation_agent.cli demo
  -> deterministic report; state=needs_human_input; exit 0
```

Skips (5, all by design or host state — never forced green):
- 3 × `test_browser_verify.LiveRenderedTests` — require `RUN_BROWSER_LANE=1` (not requested).
- 2 × gbrain MCP probes — skipped because a live `gbrain serve` (PID 19082) holds the datastore.

## 3. Functional coverage matrix

| Capability | Deterministic test(s) | Result |
|---|---|---|
| Business domain + state machine (`company_os/business/domain.py`) | `test_business_domain`, `test_state_machine` | PASS |
| Business workflow validators (`workflow.py`) | `test_business_workflow`, `test_state_machine` | PASS |
| Client loading + client isolation | `test_business_workflow`, `test_state_machine` | PASS |
| Control-plane policy engine | `test_control_plane_acceptance` | PASS |
| OpenAI-compatible boundary (loopback, lane fixed) | `test_control_plane_boundary` | PASS |
| Router / router contract / fallback | `test_control_plane_acceptance`, `test_model_runtime` | PASS |
| Bifrost transport | `test_bifrost_transport` | PASS |
| Architecture policy + conformance | `test_architecture_policy`, `test_architecture_conformance` | PASS |
| Zoho CRM projection | `test_zoho_crm` | PASS |
| Zoho Books (OAuth2, Decimal money) | `test_zoho_books` | PASS |
| Langfuse trace allowlist + fail-inactive | `test_langfuse_trace`, `test_verify_langfuse_trace` + live trace | PASS |
| Reconciliation agent (product 1) | `test_reconciliation_agent*` (5 modules) + demo | PASS |
| Credential broker / secrets isolation | `test_cred_broker`, `test_secrets_isolation*`, `test_isolate_secrets_script` | PASS |
| Gates / evidence / provenance | `test_phase8_gate`, `test_gate_provenance`, `test_export_privileged_evidence` | PASS |
| Dependency pins / lint policy | `test_dependency_pins`, `test_lint_policy` | PASS |
| Design-system validators + gates | `test_design_*` (gate-integrated) | PASS |
| Site content + deploy safety | `test_site_content`, `test_security_phase8`, `test_browser_verify` | PASS |
| Hermes / OpenCode integration | `test_hermes_company_os`, `test_opencode_company_os` | PASS |
| MCP regression | `test_mcp_regression` | PASS in isolation; **host-fragile** (see D2) |

## 4. End-to-end journey report (synthetic; no real client data)

Full authorized lifecycle driven through the real validators
(`INTAKE → SCOPE → PROPOSAL → ENGAGEMENT → DELIVERY → ACCEPTANCE → INVOICE → PAYMENT`):

- **PASS** when every stage is approved, evidence such as `- merged-pr-42` is real,
  and the payment matches an issued invoice.
- **BLOCKED** with `delivery_without_engagement` / `invoice_without_engagement` when
  work/delivery is recorded with no engagement (a proposal is not authorization).
- **BLOCKED** with `scope:change_order_requires_separate_approval` when scope is a CHANGE ORDER.
- **BLOCKED** with `intake:go_without_founder_approval` for `GO` without founder approval.
- **BLOCKED** with `delivery:completion_without_evidence` after the D1 fix (was **PASS** before).
- **BLOCKED** with `invoice:missing_line_items` when the invoice `## Line Items` list is placeholder-only (D4 fix; was **PASS** before).

Reconciliation product demo: deterministic, ignores nothing silently — surfaces
confirmed/partial/proposed matches, duplicates, refunds, reversals, and returns
`needs_human_input` when a proposal needs confirmation.

## 5. Security / external-integration report

- No secrets in tracked history (gitleaks clean); Phase 8 "secret hygiene" PASS;
  `test_project_config_contains_no_credentials` PASS.
- Boundary is loopback-only; clients select a logical role only; provider internals
  (reasoning/fingerprint) are stripped from client bodies (`test_control_plane_boundary`).
- Restricted lane is deny-by-default; `company-os-route` exits 2.
- Provider credentials reached only through the broker; never exported into the gate.
- Zoho integrations mirror error classes; money uses `Decimal`; financial facts never inferred.
- **Not exercised (by policy):** live Cloudflare deploy, live PostHog analytics — no
  credentials were provided or used; no production mutation occurred.

## 6. Defect register

| ID | Severity | Status | Summary |
|---|---|---|---|
| D1 | Medium | **FIXED** (this change set) | `validate_delivery` / `validate_acceptance` treated any non-empty evidence list as evidence, including the templates' placeholder `- NONE` and the tokens `UNKNOWN/TBD/NOT PROVIDED/NOT RECORDED`. A `COMPLETED` delivery with `- NONE` validated as complete with no evidence. Fixed via a shared placeholder guard (`_is_placeholder_entry` / `_has_substantive`); regression `EvidencePlaceholderFailClosedTests`. No test previously covered this. |
| D2 | Low–Med | OPEN | `test_mcp_regression.MCPConnectionTests` shells out to `opencode mcp list`, which under full-suite load reached the harness's 30 s timeout and failed the gate once (passes in isolation; ~30 s runtime). Host-fragile, not code-fragile. |
| D3 | Low (style) | OPEN | The repo is not `ruff format`-clean (119 files) and no gate enforces formatting; `ruff check` is clean under 0.16.10 and 0.17.0. Convention drift, not a gate failure. |
| D4 | Low | **FIXED** (same change set) | `validate_invoice` checked `line_items` for emptiness only, so a placeholder-only `## Line Items` list (`- NONE`, `UNKNOWN`, `-`, `—`) satisfied the presence rule — the same fail-open direction as D1. Fixed by applying the shared placeholder guard to `line_items`; regression `InvoiceLineItemPlaceholderTests` (incl. the `validate_client_workflow` entry point) plus `PlaceholderPolicyPropertyTests`. The invoice's **financial** invariants (amount/zero-guard, currency, FX, milestone, lifecycle) are unchanged and still enforced — the guard only governs presence. |

## 7. Unverified capabilities and prerequisites

| Capability | Status | Prerequisite to verify |
|---|---|---|
| Live site deploy to Cloudflare Pages | NOT RUN | explicit founder authorization + `CLOUDFLARE_API_TOKEN` via broker |
| Live PostHog analytics configuration | NOT RUN | `POSTHOG_KEY`/`POSTHOG_HOST` via broker |
| Live gbrain MCP memory verbs | SKIPPED | stop the live `gbrain serve` (exclusive datastore access) |
| Browser live lane (rendered-site checks) | NOT RUN | set `RUN_BROWSER_LANE=1` |
| Real client lifecycle (non-synthetic) | N/A | a real client under `clients/<client>/` (none exist; `_template` correctly BLOCKED) |

## 8. Release-readiness conclusion

- **Engineering gates:** PASS (main gate 30/30, `release_eligibility=PASS` on a clean
  tree; Phase 8 `failed=0`).
- **Live integration:** PARTIAL — the broker-mediated credentialed path exists and was
  previously exercised; this audit did not run any live deploy or analytics write.
- **Deployment eligibility:** **BLOCKED pending explicit authorization.** CI holds zero
  secrets by design; the supported release path is the host broker wrapper, which this
  audit deliberately did not invoke.

## 9. Next actions (by risk/value)

1. **Founder review of D1 + D4 (one change set)** — confirm the stricter placeholder
   semantics for delivery/acceptance evidence and invoice line items are the intended
   business policy, then merge `fix/business-evidence-placeholder-guard` → `main`.
   (Deliberately scoped to those three substantive fields; `exclusions` and other
   required lists need a separate policy decision — see D5 below.)
2. Decide on **D3** — adopt `ruff format` (and a gate) or record formatting as out of scope.
3. Harden **D2** — raise the MCP probe timeout or gate it behind an env flag so host load
   cannot fail a release gate for an unrelated reason.
4. When authorized, exercise one credentialed Phase 8 deploy via the broker to close the
   live-integration gap.
5. **D5 (observation, policy):** several other required-list fields (`scope.inclusions/
   exclusions`, `proposal.deliverables/success_criteria/acceptance_criteria/`, `engagement.
   authorized_work`) still use bare truthiness. Some are legitimately allowed to say "NONE"
   (e.g. `exclusions`), so this is a case-by-case policy decision, not a blind extension of
   the D1/D4 guard. Recorded, not changed.

## Reproduce

```
git checkout fix/business-evidence-placeholder-guard   # off main bba862d
ruff check .
.venv/bin/python -m unittest discover -s tests         # 1682 tests OK (5 env skips)
./scripts/gates.sh                                      # status=PASS, release_eligibility=PASS
PHASE8_ALLOW_BLOCKED=1 ./scripts/gates-phase8.sh        # failed=0 blocked=4
```

Before/after proof of the D1+D4 fail-open defect (public API only):

```
python /tmp/opencode/defect_demo.py <pre-fix-worktree>   # all three scenarios PASS (defect)
python /tmp/opencode/defect_demo.py .                    # all three BLOCKED (fixed)
```
