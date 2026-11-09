# Mobile-Money Reconciliation Agent

**Phase 9 Product 1** — a deterministic, auditable reconciliation engine for mobile-money collections (MTN MoMo, Airtel Money, Africell).

---

## 1. Purpose

Organisations collecting fees, contributions, or payments via mobile money receive transaction exports from providers. Matching those exports against an obligations ledger (invoices, fee schedules, contribution registers) is currently manual, error-prone, and hard to audit.

This product:

- Ingests provider transaction exports and an obligations ledger.
- Matches every transaction to an obligation using documented, versioned rules (R1–R8).
- Surfaces unmatched, duplicate, conflicting, refund, and reversal records as first-class outcomes — never silently discarded.
- Produces a deterministic report that distinguishes **confirmed** matches from **proposed** matches requiring human confirmation.
- Gates every consequential ledger action behind explicit human approval bound to the exact proposed action.

The reconciliation core is pure and deterministic: **zero model calls in the money path**. Financial invariants are enforced with exact `Decimal` arithmetic — binary floating-point is never authoritative.

---

## 2. Architecture

```
products/reconciliation_agent/
├── domain.py      # Immutable domain models: Transaction, Obligation, Match, Outcome
├── rules.py       # Documented, versioned matching rules R1–R8 + rules_fingerprint()
├── core.py        # Pure deterministic reconcile() — no I/O, no LLM
├── workflow.py    # LangGraph StateGraph + SqliteSaver durable checkpoints
├── approval.py    # Human approval protocol: action-bound, fingerprint-verified
├── security.py    # Capability policy, budgets, audit log, data classification
├── report.py      # Deterministic report: confirmed vs proposed distinction
├── fixtures.py    # Synthetic development/test fixtures (no real customer data)
├── cli.py         # Operator CLI: demo / run / resume
├── __init__.py    # Public API exports
└── __main__.py    # python -m products.reconciliation_agent entry point
```

### Layered design

| Layer | Module(s) | Responsibility |
|-------|-----------|----------------|
| Domain | `domain.py` | Immutable records, classification, parsing |
| Rules | `rules.py` | Versioned matching rules, fingerprinting |
| Core | `core.py` | Pure deterministic reconciliation |
| Workflow | `workflow.py` | LangGraph state machine, durable checkpoints |
| Approval | `approval.py` | Human gating for consequential actions |
| Security | `security.py` | Capabilities, budgets, audit, classification |
| Report | `report.py` | Deterministic output, confirmed/proposed split |
| Interface | `cli.py`, `__main__.py` | Operator workflow, path-traversal guard |

### Architecture decision & conformance

The choice of a durable LangGraph workflow is a **deterministic policy
decision**, not an implementation preference, and the shipped implementation is
verified against it by the architecture conformance gate. See
[`docs/architecture/product-architecture-policy.md`](../architecture/product-architecture-policy.md)
for the full policy, contract schema, and gate semantics.

- **Contract:** `config/products/reconciliation_agent.yaml` (`langgraph`).
- **Decision:** `evidence/decisions/reconciliation_agent.json` — status
  `decided`, architecture `langgraph`. Required capabilities
  `durable_checkpoint`, `resumable_execution`, `multi_step_orchestration`
  cannot be met by a plain program, so `simple` is rejected.
- **Conformance:** `tools/architecture_conformance.py --all` → **PASS** (17
  findings, 0 failures, 0 blocked). Structural checks read `workflow.py`
  (`StateGraph(GraphState)` + `SqliteSaver`, explicit `TypedDict` state);
  behavioural checks run `conformance_probe.py`, which resumes an interrupted
  run from a fresh connection to the checkpoint file and proves approval
  binding (missing approval → `MissingApprovalError`; altered amount →
  `StaleApprovalError`).
- Run it: `.venv/bin/python tools/architecture_conformance.py --product reconciliation_agent`.

---

## 3. Data contracts

### Transaction

| Field | Type | Notes |
|-------|------|-------|
| `tx_id` | `str` | Required, non-empty. Provider transaction ID. |
| `provider` | `str` | e.g. `mtn_momo`, `airtel_money`, `africell`. |
| `account` | `str \| None` | Mobile-money account / MSISDN. |
| `amount` | `Decimal` | Required. Payment must be > 0. |
| `currency` | `str` | Must be `UGX` (enforced). |
| `timestamp` | `datetime \| None` | Provider timestamp. Parsed to a timezone-aware `datetime` (see *Timestamps and timezones*). |
| `payer_reference` | `str \| None` | Free-text payer reference (may name an obligation). |
| `kind` | `TransactionKind` | `payment` \| `refund` \| `reversal`. |
| `note` | `str \| None` | Free-text note. |
| `raw` | `Mapping` | Original provider payload (not used in matching). |

Classification: **CONFIDENTIAL**.

### Obligation

| Field | Type | Notes |
|-------|------|-------|
| `obligation_id` | `str` | Required, non-empty. Unique ledger key. |
| `client` | `str` | Payer / client name. |
| `amount_due` | `Decimal` | Required, > 0. |
| `currency` | `str` | Must be `UGX` (enforced). |
| `due_date` | `date \| None` | Due date. |
| `description` | `str \| None` | Human-readable description. |

Classification: **CONFIDENTIAL**.

### Match

A deterministic match decision with full provenance:

- `match_id` — unique identifier.
- `status` — `EXACT` | `PARTIAL` | `PROPOSED` | `UNMATCHED` | `DUPLICATE_SUSPECT` | `EXCEPTION`.
- `transaction` — the matched transaction.
- `obligation` — the matched obligation (or `None`).
- `amount_applied` — exact `Decimal` applied.
- `rationale` — human-readable rule citation.
- `allocation` — `Allocation(transaction_id, obligation_id, amount_applied)` or `None`.
- `evidence` — structured rule evidence (rule ID, reference, confirmation flag).

### ReconciliationOutcome

Immutable run result: `matches`, `unmatched`, `unpaid_obligations`, `duplicates`, `exceptions`, `refunds`, `reversals`, totals (`total_matched`, `total_unmatched`, `total_refunded`, `total_reversed`, `obligations_total`, `obligations_outstanding`), plus `input_fingerprint`, `rules_fingerprint`, `schema_version`, `reconciled`, `blocked_reason`.

### Timestamps and timezones

Provider exports (MTN MoMo / Airtel Money) carry local wall-clock timestamps
with **no UTC offset**. `parse_timestamp()` therefore returns a
**timezone-aware** `datetime`:

- naive input is attached to `PROVIDER_TIMEZONE` (a fixed `UTC+03:00` / `EAT`
  offset — Uganda has no daylight saving, so a fixed offset is exact and needs
  no `tzdata`);
- input that already carries an explicit offset (e.g. `...+00:00`) keeps that
  offset unchanged.

A provider timestamp is never silently reinterpreted as UTC, and two
timestamps covering the same instant compare equal regardless of the offset
they were written with. `parse_date()` is separate: it returns a bare
`date` (no time, no zone) for calendar values such as `due_date`.

Fingerprints and reports serialize aware timestamps via `isoformat()`, so a
timestamp string carries its offset (e.g. `2026-01-05T10:00:00+03:00`).
Determinism is preserved: the same input always produces the same output.

---

## 4. Matching rules (v1)

Matching is **never** based on similar amounts or similar dates alone. A match requires either an explicit obligation reference, or — when no reference exists — a single unambiguous amount match, in which case the outcome is `PROPOSED` (never `EXACT`) and routed to human review.

| Rule | Status | Condition |
|------|--------|-----------|
| **R1** | `EXACT` | `payer_reference` contains `obligation_id` AND remaining balance equals transaction amount. |
| **R2** | `PARTIAL` | `payer_reference` contains `obligation_id` AND remaining balance > transaction amount. Obligation stays open. |
| **R3** | `PROPOSED` | No reference, but exactly ONE obligation has remaining balance equal to the amount. Requires human confirmation. |
| **R4** | `UNMATCHED` | No obligation satisfies R1–R3. |
| **R5** | `DUPLICATE_SUSPECT` | Two or more transactions share an identical `tx_id`. Only the first may match; the rest are flagged and retained. |
| **R6** | `EXCEPTION` | Conflicting identifiers (same `tx_id`, different amounts), overpayment, or malformed records. |
| **R7** | — | `kind == refund`; never auto-applied to an obligation. |
| **R8** | — | `kind == reversal`; never auto-applied to an obligation. |

### Rules fingerprint

`rules_fingerprint()` returns SHA-256 of the canonical rule text in `rules.py`. A change to matching logic changes this fingerprint, invalidating derived results. Reports and approvals carry this fingerprint so stale approvals are rejected.

---

## 5. Financial invariants

1. **Every input transaction is accounted for exactly once.** The sum of `matches + unmatched + duplicates + exceptions + refunds + reversals` equals `len(transactions)`. Enforced by assertion in `core.reconcile()`.
2. **Allocations never exceed the transaction amount.** `allocation.amount_applied <= transaction.amount`. Enforced by assertion.
3. **Outstanding balance is non-negative.** `obligations_outstanding >= 0`.
4. **Outstanding equals total minus confirmed.** `obligations_outstanding == obligations_total - total_matched` (where `total_matched` counts only `EXACT` and `PARTIAL`).
5. **Exact decimal arithmetic.** All money uses `decimal.Decimal`. `parse_amount` converts floats via `str` to avoid binary error. No float is ever authoritative.

---

## 6. Threat model

| Threat | Mitigation |
|--------|------------|
| Floating-point rounding in money | All amounts are `Decimal`. Floats converted via `str`. |
| Silent data loss | Every transaction accounted for exactly once (assertion). Duplicates, refunds, reversals are first-class outcomes. |
| Stale / altered human approvals | Approvals bound to action hash + input fingerprint + rules fingerprint + target. Any mismatch → `StaleApprovalError`. |
| Model granting itself capabilities | `TOOL_POLICY` is a module-level constant; unknown tools fail closed (`UnauthorizedToolError`). Model call budget is zero. |
| Automated production writes | `post_adjustment` and `apply_match` are `HUMAN_APPROVAL` capability; automated invocation raises `UnauthorizedToolError`. |
| Path traversal in CLI output | `_safe_output_path()` rejects paths outside CWD. |
| Budget exhaustion | `Budget` enforces max records, wall-clock, retries, model calls. Exceeding raises `BudgetExceededError`. |
| Untrusted input injection | Input rehydration catches `KeyError`, `ValueError`, `TypeError`, `ArithmeticError` → `BLOCKED` state. |
| Secret leakage in logs | Audit log entries are structured; raw payloads and secrets never logged. |

---

## 7. Capability policy

| Tool | Capability | Notes |
|------|-----------|-------|
| `read_transactions` | `READ_ONLY` | |
| `read_obligations` | `READ_ONLY` | |
| `run_reconciliation` | `READ_ONLY` | |
| `generate_report` | `READ_ONLY` | |
| `propose_adjustment` | `READ_ONLY` | Proposal only; no write. |
| `post_adjustment` | `HUMAN_APPROVAL` | Cannot be invoked by automated capability. |
| `apply_match` | `HUMAN_APPROVAL` | Cannot be invoked by automated capability. |

`assert_capability(tool_name, granted)` fails closed for unknown tools, `HUMAN_APPROVAL` tools under any automated grant, and `READ_WRITE` tools under `READ_ONLY`.

---

## 8. Approval protocol

Every proposed adjustment requires an explicit human approval bound to:

- **action hash** — SHA-256 of the canonical action descriptor (type, target, amount, match_id, fingerprints).
- **input fingerprint** — SHA-256 of the input set the action was derived from.
- **rules fingerprint** — SHA-256 of the matching rules text.
- **target** — the ledger/account the action would mutate.
- **approved_by** — human operator identity (non-empty).

`verify_approval()` raises `StaleApprovalError` on any mismatch. `require_approval()` raises `MissingApprovalError` when no approval is supplied (fail closed).

---

## 9. Checkpointing and recovery

The workflow is a LangGraph `StateGraph` compiled with a `SqliteSaver` checkpointer (SQLite file or `:memory:`). Each stage transition is checkpointed.

### Stages

1. `validate` — validate every input record; malformed → `BLOCKED`.
2. `reconcile` — run the deterministic core.
3. `review` — route exceptions to `SECURITY_HOLD`; route unmatched / proposed / refunds / reversals to `NEEDS_HUMAN_INPUT`; else → `REPORT`.
4. `report` — produce the final deterministic report → `COMPLETED`.

### States

`BLOCKED`, `NEEDS_HUMAN_INPUT`, `QUOTA_EXHAUSTED`, `SECURITY_HOLD`, `COMPLETED`, `FAILED`.

### Resume

```bash
python -m products.reconciliation_agent resume --thread-id <id> --checkpoint <path>
```

The checkpointer stores the last durable state per `thread_id`. Re-invoking with the same `thread_id` resumes from the checkpoint rather than restarting blindly.

---

## 10. Budgets

| Budget | Default | Enforcement |
|--------|---------|-------------|
| `max_transactions` | 10 000 | Exceeding → `BLOCKED` |
| `max_obligations` | 10 000 | Exceeding → `BLOCKED` |
| `max_retries` | 3 | `Budget.consume_retry()` |
| `max_wall_seconds` | 300 | `Budget.check_wall()` |
| `max_model_calls` | 0 | Deterministic core; no model calls allowed |

---

## 11. Setup and usage

### Install dependencies

Direct dependencies are split by purpose:

- `requirements.txt` — **runtime** dependencies of the product itself.
- `requirements-dev.txt` — runtime **plus** test-only dependencies
  (e.g. `hypothesis`). This is what the deterministic gates install.

`requirements-pinned.txt` is the **single**, fully-resolved, hash-pinned lock
(the former `requirements.lock` duplicate was removed) and is what CI installs:

```bash
# application runtime only:
pip install -r requirements.txt

# development / tests (runtime + test dependencies):
pip install -r requirements-dev.txt

# exact, hash-pinned, fully-resolved environment the gates use:
pip install -r requirements-pinned.txt
```

Regenerate the lock after editing a source manifest (requires `pip-tools`):

```bash
pip-compile --generate-hashes --output-file=requirements-pinned.txt requirements-dev.txt
```

`tests/test_dependency_pins.py` is a deterministic guard: it asserts the lock is
fully resolved (no `-r` includes), that every direct pin in both source manifests
appears in the lock at the same version, that runtime and test dependencies stay
separated, that no duplicate lock exists, and that the vulnerability gate scans
the pinned lock.

### Run the built-in demo

```bash
python -m products.reconciliation_agent demo
```

### Run from JSON files

```bash
python -m products.reconciliation_agent run \
  --transactions transactions.json \
  --obligations obligations.json \
  --out evidence/runs/report.json
```

Input format (JSON arrays):

```json
// transactions.json
[
  {
    "tx_id": "TX-0001",
    "provider": "mtn_momo",
    "account": "0772000001",
    "amount": "500000",
    "currency": "UGX",
    "timestamp": "2026-01-05 10:00:00",
    "payer_reference": "OBL-001",
    "kind": "payment"
  }
]

// obligations.json
[
  {
    "obligation_id": "OBL-001",
    "client": "Green Hill School",
    "amount_due": "500000",
    "currency": "UGX",
    "due_date": "2026-01-31",
    "description": "Term 1 fees"
  }
]
```

### Resume an interrupted workflow

```bash
python -m products.reconciliation_agent resume --thread-id <id> --checkpoint reconciliation.db
```

---

## 12. Running tests

```bash
# Product tests only
python -m unittest discover -s tests -p 'test_reconciliation_agent*.py'

# Full suite
python -m unittest discover -s tests
```

Test files:

| File | Coverage |
|------|----------|
| `test_reconciliation_agent.py` | Rules R1–R8, determinism, accounting invariant, parsing, domain validation, timezone-awareness |
| `test_reconciliation_agent_financial.py` | Property-based (hypothesis) financial invariants, exact decimal, adversarial inputs |
| `test_reconciliation_agent_states.py` | Workflow states, durable checkpoint resume, budget blocks, refund/reversal routing |
| `test_reconciliation_agent_security.py` | Capability policy, approval binding (stale/altered), budgets, audit log, classification, path traversal |

### Lint policy

The gate runs `ruff check .` with the hash-pinned CI ruff
(`scripts/install-gate-tools-ci.sh`). Ruff's *default* rule set is
version-defined and changed between 0.16 and 0.17 (0.16 enables the
`flake8-datetimez`/`DTZ` rules by default; 0.17 removes them). The committed
`ruff.toml` re-enables `DTZ` (`extend-select = ["DTZ"]`) so naive-datetime
defects are caught on every supported ruff version, regardless of which binary
is on `PATH`.

---

## 13. Operational notes

- **Data classification:** Transaction and obligation records are CONFIDENTIAL. They never reach a free inference provider.
- **Audit:** `AuditLog` is append-only, structured, correlation-ID scoped. Entries never contain secrets or raw record payloads.
- **Determinism:** Same inputs + same rules → same outcome (run_id is caller-supplied and does not affect matching). Input fingerprint is order-independent.
- **Idempotency:** Re-running the core with identical inputs yields identical results.

---

## 14. Limitations

- Currency is restricted to UGX (enforced at domain level). Multi-currency support would require schema extension.
- R3 (amount-only match) is always `PROPOSED`, never auto-confirmed. This is intentional: amount similarity alone is insufficient evidence.
- The product does not write to any external ledger. It produces a proposed outcome; human approval is required before any adjustment is applied.
- Provider-specific export formats are normalised by the caller before ingestion. The product consumes the domain model, not raw provider files.

---

## 15. Evidence

| What | Where |
|------|-------|
| Full test suite | `python -m unittest discover -s tests` → `Ran 1666 tests … OK (skipped=5)` |
| Product tests | `74` (core, financial/property-based, workflow, security) |
| Gates | `GATES_LANGFUSE_MODE=hermetic ./scripts/gates.sh` → `status=PASS, failed_checks=0` |
| Ruff | `All checks passed!` under both the pinned CI ruff (0.16.10) and ruff 0.17.0, via `ruff.toml` |
| Branch | `feat/phase9-reconciliation-product` (based on `reconcile/phase9-integration`) |
