# Orchestration Certification — Stages C–O (local, deterministic) — 2026-10-18

- **Author:** opencode (principal-engineer certification pass)
- **Commit certified:** `ac8fd6b` (working tree `8faf6c1`; both clean)
- **Mode:** read-only / local. No root, no remote writes, no paid or provider calls.
- **Governing principle:** Models propose. Deterministic systems decide.
- **Classification:** INTERNAL. No secret values appear here.

This addendum certifies the orchestration stages that require neither root nor a
remote write, by exercising **real installed components** and using **deterministic
fault injection** only at the outermost provider transport. It separates, explicitly:

- **REAL** — the real component executed (not a mock).
- **FIXTURE** — the real component ran, but one outer boundary was substituted
  (provider transport) to make a failure deterministic.
- **SIMULATED** — nothing in this addendum uses a simulated verdict for a pass.
- **BLOCKED** — cannot be established without root, a provider, or a remote write.

---

## 1. Provenance and preconditions

```
branch  fix/business-evidence-placeholder-guard
HEAD    8faf6c1  (ac8fd6b certified remotely; see §5)
worktree clean
```

`tools/gate_provenance.py .` → `clean`.

## 2. Real installed-component probes (REAL)

| Probe | Command | Observed |
| --- | --- | --- |
| Hermes CLI | `hermes --version` | `Hermes Agent v0.21.3 (2026.9.14) · upstream 8f7b3b48` |
| Hermes skills discovery | `hermes skills list` | skills enumerated (community + local), all `enabled` |
| Hermes → control plane | `.venv/bin/python tools/hermes_company_os.py verify` | `provider company-os: OK`; `nous default preserved` |
| Live boundary health | `curl /health` | `status=ok ready=true lane=internal router=company-os-deterministic version=1`, 9 roles, uptime ≈ 8831s |
| Live boundary role surface | `curl /v1/models` | 9 logical roles exposed |
| Bifrost provider inventory | `curl :8080/api/providers` | `total: 1` (mistral only) — **BLOCKED** (§4) |

Stage **C** (real Hermes CLI path) and **D** (gstack skill discovery/execution:
skills are present and enabled under `/home/genie/.hermes/skills/`) are exercised
above at the discovery/health level. Full skill *execution* is not attempted here
because those skills drive external/paid agents by design; invoking them would
cross the no-paid-call boundary.

## 3. Theme certification matrix (REAL / FIXTURE)

Every theme below is certified by the project's own deterministic suite, run at
`ac8fd6b`. Where a suite patches `urllib.request.urlopen` or supplies scripted
transport outcomes, the label is **FIXTURE**: the real `BifrostClient`,
`PolicyEngine`, `CompanyOSRouter`, boundary server, translation and audit all
execute; only the provider transport is replaced.

| Required theme | Certifying tests (all OK) | Label | Count |
| --- | --- | --- | --- |
| Provider failure & fallback | `test_control_plane_acceptance` (`ProviderFailureClassificationTests`, `RouterFallbackInjectionTests`, `RouterQuotaDownrankTests`, `RouterCandidatePinningTests`), `test_bifrost_transport`, golden probes `router-retries-then-fails-over`, `router-transient-retries-then-fails-over`, `router-exhausts-candidates-then-fails`, `router-health-downranks-primary`, `router-pinned-candidate-*` | FIXTURE (real router/policy, scripted transport) | 169 |
| Malformed provider responses | `test_control_plane_acceptance.BifrostResponseContractTests` (200 invalid-JSON / non-object / non-text → `provider_error`), `test_control_plane_live_smoke` (D8: malformed `/health`, `/v1/models`, `200` body → classified fail + evidence), golden `router-role-contract-invalid-fails-over` | FIXTURE + REAL (live smoke over HTTP) | — |
| Policy denials | golden `lane-matrix-confidential-denies-free-inference`, `lane-exposure-restricted-unreachable-from-agents`, `lane-matrix-restricted-denies-every-provider`, `exposure-rejects-provider-field`, `exposure-rejects-lane-field`, `exposure-physical-model-not-a-role`; `test_control_plane_acceptance.PolicyTests`; `test_control_plane_boundary.FailClosedTests` | FIXTURE (real policy/boundary) | (incl. in 169) |
| Reviewer/implementer separation | golden `vendor-reviewer-same-vendor-denied`, `vendor-reviewer-different-vendor-allowed`, `vendor-reviewer-mapped-vendor-same-denied`, `vendor-non-review-role-exempt`, `router-reviewer-same-vendor-skipped`; `test_control_plane_boundary.BoundaryReviewerIndependenceTests` | FIXTURE | (incl. in 169) |
| Idempotency | `test_export_privileged_evidence` (`test_idempotent_reexport`), `test_isolate_secrets_script` (repeated migration idempotent), `products/reconciliation_agent` idempotent core, golden repeated-run identity | REAL | 69 |
| Failure detection | `test_control_plane_live_smoke` (503→inconclusive, ≥400→fail, unreachable→exit 2), `test_gate_provenance` | REAL | — |
| Recovery / fix loops | In-system recovery = router retry → bounded fallback → health down-rank: **certified as FIXTURE** (above). The *engineering* fix loop (find → fix → verify → ship) is **human-gated** via gstack/PR; there is no automated self-healing loop in-repo. Stated, not faked. | FIXTURE + process | — |
| Stale / missing evidence | `test_architecture_conformance` (`test_stale_decision_fails`, `test_stale_policy_decision_fails`), `test_architecture_policy` (staleness on requirement/policy-version change), `test_gate_provenance` (unknown/absent) | REAL | 89 |
| Dirty-worktree protection | `test_gate_provenance` (`test_dirty_on_tracked/staged/untracked`, `test_credentialed_pass_on_dirty_tree_is_blocked`, `test_reason_explains_a_dirty_tree`) | REAL | 46 |
| Secret redaction | `test_secrets_isolation` (`redact_secrets`, encodings, subprocess output), `test_cred_broker` (`test_run_redacts_credential_from_output`), `test_secrets_isolation_boundary` | REAL | 80 |
| Adapters (Hermes / OpenCode) | `test_hermes_company_os`, `test_opencode_company_os` | REAL | 59 |
| Reconciliation security/states | `test_reconciliation_agent_security` (stale/altered approvals rejected), `test_reconciliation_agent_states` | REAL | 31 |
| Golden-set / trajectory / promptfoo (deterministic evaluation) | `test_golden_set_eval`, `test_trajectory_eval`, `test_promptfoo_eval` | REAL | 80 / 43 / 39 |

Themed-group module runs (some modules appear in more than one theme):
`169 + 46 + 80 + 69 + 89 + 59 + 31 = 543` tests OK. Evaluation harnesses:
`80 + 43 + 39 = 162` OK. Full suite (context, §5): **1700 OK, skipped 5**.

### 3.1 Why "FIXTURE" is not "mock"

`company_os/control_plane/boundary_fixture.py::DeterministicBoundary` runs the
**real** `build_server` — real request validation, real `PolicyEngine`, real
`CompanyOSRouter` (retry/fallback/health ordering), real completion translation,
real audit log. Only `router.bifrost.chat` is replaced. No provider is contacted,
and the verdict therefore describes the control plane's policy, not provider luck.
This is the same harness the golden set uses; it is explicitly documented as *not*
a mock.

## 4. BLOCKED items (honest, unresolved)

| Item | Why blocked | Evidence of the block |
| --- | --- | --- |
| End-to-end inference through a real provider | Live Bifrost exposes only `mistral` and cannot reach it (network failures); six free providers are absent from the live store | `curl /api/providers` → `total: 1`; `bifrost-provider-restoration-2026-10-18.md` |
| Live Langfuse release evidence | No Langfuse credentials in this run; hermetic SKIP by design | gate evidence `release_eligibility=BLOCKED` |
| Root Bifrost config-store migration | Requires root + separate authorization | proposal ready; **not applied** |
| Remote `workflow_dispatch` release-eligibility run | Requires a credentialed dispatch | not performed |

**No end-to-end inference is claimed.** The free-routed inference path is
**BLOCKED**, not failed and not proven.

## 5. Remote authority cross-reference

Both required workflows succeeded on the pushed revision `ac8fd6b` (PR #10,
`pull_request`): `deterministic-gates` (job *Deterministic Engineering Gates*) and
`phase8-gates` (job *Phase 8 Deterministic Gate*). The deterministic gate recorded
`status: PASS`, `ci: PASS`, `worktree: clean`, `release_eligibility: BLOCKED`
(live Langfuse trace unverified); the Phase 8 gate recorded `tests.count=1700`,
`baseline=406`, `preserved=true`. Run URLs and artifacts are recorded in
`orchestration-certification-2026-10-18.md` §7b and
`gate-evidence-ci-ac8fd6b-*.json`.

## 6. Reproduction

```bash
# theme groups
.venv/bin/python -m unittest tests.test_control_plane_boundary \
  tests.test_control_plane_acceptance tests.test_bifrost_transport \
  tests.test_model_runtime tests.test_control_plane_live_smoke
.venv/bin/python -m unittest tests.test_gate_provenance tests.test_phase8_gate
.venv/bin/python -m unittest tests.test_secrets_isolation tests.test_cred_broker \
  tests.test_secrets_isolation_boundary
.venv/bin/python -m unittest tests.test_export_privileged_evidence \
  tests.test_isolate_secrets_script
.venv/bin/python -m unittest tests.test_architecture_conformance tests.test_architecture_policy
.venv/bin/python -m unittest tests.test_hermes_company_os tests.test_opencode_company_os
# evaluation harnesses
.venv/bin/python -m unittest tests.test_golden_set_eval tests.test_trajectory_eval tests.test_promptfoo_eval
# real probes
hermes --version && hermes skills list
.venv/bin/python tools/hermes_company_os.py verify
curl -s http://127.0.0.1:8090/health && curl -s http://127.0.0.1:8090/v1/models
```

## 7. Verdict for stages C–O

- **CERTIFIED (REAL/FIXTURE):** provider failure & fallback, malformed responses,
  policy denials, reviewer/implementer separation, idempotency, failure detection,
  stale/missing-evidence failure, dirty-worktree protection, secret redaction,
  adapters, deterministic golden/trajectory/promptfoo evaluation.
- **HONEST NON-CLAIM:** no automated self-healing fix loop exists; recovery is
  in-system (router) + human-gated (process). End-to-end inference and live
  Langfuse release evidence are **BLOCKED**.
