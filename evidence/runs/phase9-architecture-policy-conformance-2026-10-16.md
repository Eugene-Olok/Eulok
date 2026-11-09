# Phase 9 — Architecture Policy & Conformance Gate (Capabilities 5 & 6)

**Date:** 2026-10-16
**Branch:** `feat/phase9-reconciliation-product`
**Starting commit:** `22d1ac8` (`feat/phase9-reconciliation-product` tip before this work)
**Scope:** implement Capability 5 (deterministic product architecture selection
policy) and Capability 6 (architecture conformance gate), integrate them into
the Company OS gate framework, and retrofit them onto Phase 9 Product 1
(Mobile-Money Reconciliation Agent).

> Models propose. Deterministic systems decide. Nothing in this work trusts an
> agent's architecture claim: the policy derives the decision, and the gate
> re-derives conformance from source and live behaviour.

---

## 1. What was built

| Artefact | Purpose |
| --- | --- |
| `company_os/architecture/contract.py` (420 L) | Contract schema `1.0.0`: enums, `ProductArchitectureContract`, hardened parsing/validation, canonical fingerprint, discovery. |
| `company_os/architecture/policy.py` (522 L) | **Capability 5** — deterministic selection: `select_architecture`, `required_capabilities`, `policy_fingerprint`, `ArchitectureDecision`, `check_decision_current`. |
| `company_os/architecture/conformance.py` (685 L) | **Capability 6** — structural + behavioural conformance rules, verdicts, aggregation. |
| `company_os/architecture/__init__.py` (83 L) | Public API re-exports. |
| `tools/architecture_conformance.py` (330 L) | CLI/gate tool; exit codes 0/1/2/3; JSON report; probe loader with allowlist. |
| `config/products/reconciliation_agent.yaml` (39 L) | Product 1 contract (authoritative input). |
| `evidence/decisions/reconciliation_agent.json` | Recorded decision artifact. |
| `products/reconciliation_agent/conformance_probe.py` (186 L) | Reference behavioural probe (restart-resume + approval binding). |
| `tests/test_architecture_policy.py` (494 L) | Capability 5 tests, incl. Hypothesis. |
| `tests/test_architecture_conformance.py` (551 L) | Capability 6 adversarial + property tests, and a real-Product-1 integration test. |
| `docs/architecture/product-architecture-policy.md` (527 L) | Canonical documentation. |
| `scripts/gates.sh` (modified) | Runs the gate as the `architecture conformance` check; records it in gate evidence. |
| `docs/products/reconciliation_agent.md` (modified) | Product 1 decision + conformance section. |

---

## 2. Selection policy — concrete rules

Statuses: `decided`, `needs_human_input`, `conflict`, `blocked`.

Capability matrix (simplicity order `simple → langgraph`):

| Capability | simple | langgraph |
| --- | :---: | :---: |
| deterministic_execution / bounded_retries / fail_closed | ✓ | ✓ |
| durable_checkpoint / resumable_execution / multi_step_orchestration | — | ✓ |

Rules: derive required capabilities from requirements + constraints; missing
requirement fields → `needs_human_input` (names them); field contradictions →
`conflict` (named fields); otherwise choose the first sufficient architecture in
simplicity order; a declaration stronger than needed is recorded but the policy
still selects the simplest sufficient option; a declaration weaker than needed
is a conflict; no sufficient architecture → `blocked`. `other` is honored only
when declared and justified **and** its `other_capabilities` cover the required
set.

Conflict codes: `resumable_requires_durable`,
`consequential_action_without_approval`, `money_constraint_without_money`.

The model cannot self-authorize: a model recommendation is at most an input;
the decision is produced by the deterministic function. No network, no model
cost. Identical normalized input + policy version ⇒ identical decision.

---

## 3. Contract & decision evidence

- Contract: `config/products/reconciliation_agent.yaml`
  — fingerprint `d86bcc61173e74e9d4f97a52c649e803eeb504c914cdadbc6096659739d3b32b`.
- Policy: version `1.0.0`
  — fingerprint `2bb4d88149fdf369f3269dec8101a3ce523f050057e9d5f877c7baf3554ebf19`.
- Decision: `evidence/decisions/reconciliation_agent.json` — status `decided`,
  architecture `langgraph`, required capabilities
  `durable_checkpoint`, `resumable_execution`, `multi_step_orchestration`,
  `unresolved_assumptions: []`.

---

## 4. Conformance checks

Structural (source): package present, entrypoint present, LangGraph import,
`StateGraph` construction, explicit state schema, workflow builder,
checkpointer wired, **no in-memory checkpointer when durable is required**;
simple-product checks (no LangGraph, no hidden workflow deps, side-effect
guard); other-architecture justification.

Behavioural (probe evidence; absent probe ⇒ `BLOCKED`, observed violation ⇒
`FAIL`, only observed true ⇒ `PASS`):

- `ARCH-LG-RESUME-PROBED` — interrupted run resumes after a **fresh connection**.
- `ARCH-LG-DURABLE-FILE` — a durable checkpoint file was used.
- `ARCH-LG-APPROVAL-BINDING` — approval bound to the exact action/input
  fingerprint; missing/altered approvals fail closed.

Decision checks: decided, fresh (contract fingerprint), policy-current
(policy fingerprint), declared-matches-decision, decision-recorded.

Aggregation: `FAIL > BLOCKED > PASS`; `SKIP` never contributes a pass; a report
with any blocked finding is not `PASS`. `other` architectures are always
`BLOCKED` (`ARCH-OTHER-VERIFIABLE`) — preserved but unverified.

---

## 5. Product 1 integration

Declared `langgraph` because it must survive process restarts, resume
interrupted runs, orchestrate a multi-step review, and keep a durable audit
trail — capabilities `simple` cannot provide. The gate then verified the
**shipped** implementation:

- Structural: `workflow.py` builds `StateGraph(GraphState)` compiled with
  `SqliteSaver`, with a `TypedDict` state schema.
- Behavioural: `conformance_probe.py` resumes a run interrupted before `report`
  from a fresh checkpoint-file connection, and proves approval binding
  (missing → `MissingApprovalError`; altered amount → `StaleApprovalError`).

Observed: **PASS, 17 findings, 0 fail, 0 blocked.**

> Fail-closed demonstration: on the first run the gate returned **BLOCKED**
> (exit 3) because no decision had been recorded; it flipped to PASS only after
> the decision artifact was written. `--no-probe` returns exit 3 (behavioural
> requirements become BLOCKED); an unknown product returns exit 2. This is the
> intended behaviour: an unprovable claim never reads as green.

---

## 6. Tests

- New: `tests/test_architecture_policy.py` — **52 tests** (contract parsing,
  identifier/​path hardening, fingerprint stability, selection across every
  requirement/constraint combination, conflicts, `other`, decision
  round-trip, freshness, property-based determinism).
- New: `tests/test_architecture_conformance.py` — **37 tests** (per-rule
  fail/block behaviour, in-memory checkpointer rejection, unprobed ⇒ blocked,
  observed-false ⇒ fail, stale/undecided/absent decisions, simple/other
  families, verdict aggregation, determinism property, probe-error safety,
  JSON serialisability, **real Product 1 PASS integration**, CLI exit codes
  0/1/2/3).
- Adversarial coverage added for: dep-present-but-unused, `MemorySaver` under a
  durable requirement, forged/stale decisions (contract + policy), declared ≠
  decision, empty package, hidden workflow deps in a simple product.

---

## 7. Commands run and actual results

| Command | Result |
| --- | --- |
| `ruff check .` | **All checks passed** |
| `.venv/bin/python -m unittest discover -s tests` | **Ran 1583 tests, OK (skipped=5)** in 365 s |
| `semgrep --config=auto --error <new files>` | **0 findings** (one scoped `# nosemgrep` on the allowlisted probe import) |
| `python tools/architecture_conformance.py --all` | **PASS (1 product), exit 0** |
| `GATES_LANGFUSE_MODE=hermetic ./scripts/gates.sh` | **status=PASS, failed_checks=0** (golden 49/49, trajectory 9/9, promptfoo 18/18, ruff PASS, architecture conformance PASS, semgrep PASS; langfuse hermetic SKIP) |
| `PHASE8_ALLOW_BLOCKED=1 ./scripts/gates-phase8.sh` | **status=BLOCKED, failed=0, blocked=4, tests=1583, baseline=406** |

Full-suite growth: 1489 → **1583** tests (baseline 406 unchanged in the Phase 8
gate).

---

## 8. Security

- Contract, decision, and evidence are non-secret. Probe errors are carried as
  bounded text (`[:300]`), never raw payloads.
- The gate reads source read-only. The probe uses synthetic fixtures and a
  temporary SQLite file only.
- The probe import is allowlisted to the product's own package
  (`product_package` is `_PACKAGE_RE`-validated at parse time); the single
  semgrep heuristic finding is suppressed with a scoped `# nosemgrep` and an
  inline justification, matching repo precedent. No gate was weakened.
- `declared_architecture` is treated as a claim, never authority.

---

## 9. Blocked / skipped / unverified

- Phase 8 gate remains **BLOCKED** on 4 **external** prerequisites — unchanged
  and outside this work's scope: `CLOUDFLARE_API_TOKEN` not set,
  `POSTHOG_KEY` not set, live site verification, live analytics configuration.
  No code failure; correct fail-closed state.
- Main gate `release_eligibility=BLOCKED` solely because the live Langfuse
  trace check is a hermetic SKIP (credentials absent). Recorded as SKIP, never
  PASS.

---

## 10. Docs & evidence updated

- `docs/architecture/product-architecture-policy.md` (new canonical doc).
- `docs/products/reconciliation_agent.md` (decision + conformance section).
- `docs/PROJECT_STATUS.md` (this session's status).
- `scripts/gates.sh` (new gate check + evidence field).
- This evidence record.

---

## 11. Remaining release blockers & next action

No engineering blockers from this work. Release eligibility is blocked only by
the external prerequisites in §9. The highest-value next action is to supply the
operator credentials (Cloudflare token, PostHog key) to the environment so the
deterministic gates flip `release_eligibility` from BLOCKED to eligible without
code changes.

> **Correction (2026-10-17).** The "without code changes" claim above is
> inaccurate; it is preserved as the record of what was believed on
> 2026-10-16 (see the correction policy in `AGENTS.md`). Supplying credentials
> alone did not flip `release_eligibility`: the credential probe could not
> resolve credentials as the unprivileged gate identity, and the credentialed
> trace path had never executed because `verify_langfuse_trace.py` wrote to
> `/dev/stdout`, which the sandbox refuses. Both were fixed in `5892d35`. The
> flip was reached only after that code change; provenance hardening `8c4a94c`
> then additionally required a clean worktree. See
> `evidence/runs/release-eligibility-2026-10-17.md` and
> `docs/PROJECT_STATUS.md`.
