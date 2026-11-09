# Product Architecture Policy & Conformance Gate

Two Company OS capabilities that make the choice of product architecture a
**deterministic, auditable, verifiable** decision rather than an agents'
preference:

- **Capability 5 — Product Architecture Selection Policy.** A deterministic
  engine that reads a product's declared requirements and constraints and
  selects the *simplest* architecture that satisfies them: a plain deterministic
  program (`simple`), a durable LangGraph workflow (`langgraph`), or an
  explicitly justified bespoke runtime (`other`).
- **Capability 6 — Architecture Conformance Gate.** A gate that verifies a
  product's **actual implementation** matches its selected architecture —
  structurally *and behaviourally* — and fails closed when it cannot be proven.

> Models propose. Deterministic systems decide. A model may recommend an
> architecture, but the recommendation is validated against the deterministic
> policy before it can become a decision, and the conformance gate re-derives
> the verdict from source and live behaviour rather than trusting the claim.

Source: `company_os/architecture/`, tool: `tools/architecture_conformance.py`,
schema version `1.0.0`, policy version `1.0.0`.

---

## 1. The product contract

Each product declares its architecture question in a versioned YAML contract
under `config/products/<product_id>.yaml`. The contract is the **authoritative
input** to both the policy and the gate.

```yaml
schema_version: "1.0.0"
product_id: example_agent
product_package: products.example_agent
declared_architecture: langgraph      # simple | langgraph | other

requirements:                          # every field is required and boolean
  durable_execution: true
  resumable_after_restart: true
  multi_step_orchestration: true
  human_approval_gate: true
  external_side_effects: true
  model_invocation: false
  handles_financial_value: true

mandatory_constraints:                 # a subset of the declared vocabulary
  - DETERMINISTIC_CORE
  - HUMAN_APPROVAL_FOR_CONSEQUENTIAL_ACTIONS
  - DURABLE_AUDIT_TRAIL
  - FAIL_CLOSED_ON_ERROR

implementation:
  entrypoint_module: products.example_agent.workflow
  workflow_builder: build_workflow       # required for langgraph
  checkpoint_class: SqliteSaver          # required for langgraph
  checkpoint_module: langgraph.checkpoint.sqlite   # optional
  durable_checkpoint_required: true
  behavioral_probe: products.example_agent.conformance_probe:probe
  other_capabilities: []                 # required for other

architecture_justification: ""           # required for other
```

### Field reference

| Field | Required | Meaning |
| --- | --- | --- |
| `schema_version` | yes | Must be in `SUPPORTED_SCHEMA_VERSIONS` (`1.0.0`). |
| `product_id` | yes | `^[a-z][a-z0-9_]{0,63}$`. Names the decision artifact. |
| `product_package` | yes | Dotted import path, e.g. `products.example_agent`. |
| `declared_architecture` | yes | `simple` \| `langgraph` \| `other`. The architecture the author *intends*. **Not trusted** by the gate; it is cross-checked against the policy decision and the source. |
| `requirements` | yes | All 7 keys must be present and boolean. A missing key is an error, never a default. |
| `mandatory_constraints` | yes | Set (may be empty) from the constraint vocabulary. Constraints are hard, not preferences. |
| `implementation.entrypoint_module` | for langgraph/other | Module the gate reads source from. |
| `implementation.workflow_builder` | for langgraph | Symbol that builds/compiles the graph. |
| `implementation.checkpoint_class` | for langgraph | The durable checkpointer class the graph must be wired to. |
| `implementation.durable_checkpoint_required` | langgraph | If `true`, a durable (file-backed) checkpointer is mandatory and an in-memory one is a hard failure. |
| `implementation.behavioral_probe` | langgraph | `module:callable` returning observed behavioural evidence. |
| `implementation.other_capabilities` | for other | Capabilities the bespoke runtime provides. |
| `architecture_justification` | for other | Human justification for not using a standard architecture. |

### Vocabularies (closed)

- **Architecture:** `simple`, `langgraph`, `other`.
- **Requirements:** `durable_execution`, `resumable_after_restart`,
  `multi_step_orchestration`, `human_approval_gate`, `external_side_effects`,
  `model_invocation`, `handles_financial_value`.
- **Mandatory constraints:** `NO_MODEL_IN_MONEY_PATH`,
  `HUMAN_APPROVAL_FOR_CONSEQUENTIAL_ACTIONS`, `DETERMINISTIC_CORE`,
  `DURABLE_AUDIT_TRAIL`, `BOUNDED_RETRIES`, `FAIL_CLOSED_ON_ERROR`.

`parse_contract()` rejects an unknown architecture name, an unknown or
duplicated constraint, a missing/unknown requirement field, a non-boolean
requirement, an unsupported schema version, a non-mapping document, and unsafe
identifiers (path traversal, absolute paths, malformed probe/dotted names).
"Fail closed" starts at parsing.

The contract is fingerprinted (`contract_fingerprint()` — SHA-256 of a
canonical, key-sorted form). Any change to requirements, constraints,
declaration, or implementation fields changes the fingerprint and therefore
invalidates a previously recorded decision.

---

## 2. Architecture selection policy

`select_architecture(contract)` returns an `ArchitectureDecision` with status
`decided`, `needs_human_input`, `conflict`, or `blocked`.

### Capability model

| Capability | `simple` | `langgraph` |
| --- | :---: | :---: |
| `deterministic_execution` | ✓ | ✓ |
| `bounded_retries` | ✓ | ✓ |
| `fail_closed` | ✓ | ✓ |
| `durable_checkpoint` | — | ✓ |
| `resumable_execution` | — | ✓ |
| `multi_step_orchestration` | — | ✓ |

### Rules

1. **Derive required capabilities.** `durable_execution` and the
   `DURABLE_AUDIT_TRAIL` constraint require `durable_checkpoint`;
   `resumable_after_restart` additionally requires `resumable_execution`;
   `multi_step_orchestration` requires `multi_step_orchestration`.
2. **Completeness.** If any of the 7 requirement fields is missing, the result
   is `needs_human_input` and names the missing fields. The policy never guesses.
3. **Consistency.** Field-level contradictions produce `conflict` with the
   named fields (see below). A conflict is resolved by a human, not by a model.
4. **Simplicity.** Among architectures whose capability set is a superset of the
   required set, choose the **first in `SIMPLICITY_ORDER = (simple, langgraph)`**.
   A product gets LangGraph only when a requirement genuinely cannot be met by a
   plain program.
5. **Declared vs derived.** If the author's `declared_architecture` is *simpler*
   than the derivation but insufficient, that is a `conflict` (you cannot declare
   a durable product `simple`). If the declaration is *stronger* than needed, the
   policy still selects the simplest sufficient option and records the
   divergence. The declared architecture is never trusted over the policy.
6. **No safe architecture.** If nothing satisfies the requirement set, fail
   closed with `blocked`.
7. **`other`.** A bespoke architecture is honored only when explicitly declared
   **and** justified; the policy then verifies its `other_capabilities` cover the
   required set, else `conflict`.

### Conflict codes

| Code | Trigger |
| --- | --- |
| `resumable_requires_durable` | `resumable_after_restart=true` but `durable_execution=false`. |
| `consequential_action_without_approval` | `external_side_effects=true` but no `HUMAN_APPROVAL_FOR_CONSEQUENTIAL_ACTIONS` constraint. |
| `money_constraint_without_money` | `NO_MODEL_IN_MONEY_PATH` declared but `handles_financial_value=false`. |

### Rationale

- **Simplicity is the default.** LangGraph is chosen only under a demonstrated
  requirement; it is never mandated for every product.
- **Constraints are hard.** They are not "nice to have" and cannot be traded
  away for convenience.
- **The model cannot self-authorize.** An agent recommendation is an input at
  most; the decision is produced by this deterministic function and is
  reproducible: identical normalized inputs + policy version ⇒ identical
  decision.
- **No network, no model cost.** Selection is pure computation.

### Policy fingerprint

`policy_fingerprint()` hashes the policy version, simplicity order, capability
matrix, and required fields. Bumping `POLICY_VERSION` or changing the matrix
changes the fingerprint and invalidates every prior decision — a recorded
decision that does not match the current policy fingerprint is **stale**.

### Decision artifact

A decision is recorded as JSON under `evidence/decisions/<product_id>.json`:

```json
{
  "status": "decided",
  "architecture": "langgraph",
  "rationale": "…",
  "policy_version": "1.0.0",
  "policy_fingerprint": "2bb4d88149fd…",
  "contract_fingerprint": "d86bcc61173e…",
  "required_capabilities": ["durable_checkpoint", "multi_step_orchestration", "resumable_execution"],
  "mandatory_constraints": ["…"],
  "alternatives_considered": ["simple", "langgraph"],
  "unresolved_assumptions": []
}
```

---

## 3. Producing and recording a decision

```bash
# Show the policy's decision without writing anything:
.venv/bin/python tools/architecture_conformance.py --product example_agent --decide

# Record the decision (writes evidence/decisions/example_agent.json):
.venv/bin/python tools/architecture_conformance.py --product example_agent --write-decision
```

An agent consumes a decision by **reading the recorded artifact and the policy
result**, never by inventing one:

```python
from company_os.architecture import (
    load_contract,
    select_architecture,
    check_decision_current,
)

contract = load_contract("config/products/example_agent.yaml")
decision = select_architecture(contract)
if decision.status.value != "decided":
    ...  # needs_human_input / conflict / blocked → stop and surface to a human
fresh = check_decision_current(contract, stored_decision)
```

If `check_decision_current()` reports the decision is not fresh (contract or
policy changed), the workflow must stop and re-decide rather than proceed on a
stale decision.

---

## 4. What the conformance gate verifies

`evaluate(contract, decision, source, behavioral, decision_recorded)`
produces findings with verdicts `pass`, `fail`, `blocked`, `skip`. Structural
checks read source; behavioural checks consume evidence from a probe.

### Universal checks

- `ARCH-CONTRACT-SCHEMA` — the contract parsed under a supported schema.
- `ARCH-DECISION-DECIDED` — the policy decided (not `needs_human_input`/`conflict`/`blocked`).
- `ARCH-DECISION-FRESH` — the decision's `contract_fingerprint` matches the contract.
- `ARCH-POLICY-CURRENT` — the decision's policy version/fingerprint match the running policy.
- `ARCH-DECLARED-MATCHES-DECISION` — declared architecture equals the policy's chosen architecture.
- `ARCH-DECISION-RECORDED` — a decision artifact physically exists (else `blocked`).
- `ARCH-PACKAGE-PRESENT` — the product package has Python files.
- `ARCH-ENTRYPOINT-PRESENT` — the declared entrypoint module exists.

### LangGraph checks

Structural:

- `ARCH-LG-IMPORT` — the package imports LangGraph.
- `ARCH-LG-STATEGRAPH` — it constructs a `StateGraph`.
- `ARCH-LG-STATE-SCHEMA` — an explicit state schema (e.g. `TypedDict`) is defined.
- `ARCH-LG-WORKFLOW-BUILDER` — the declared builder symbol exists.
- `ARCH-LG-DURABLE-CHECKPOINTER` — the compiled graph is wired to a checkpointer.
- `ARCH-LG-NO-MEMORY-CHECKPOINTER` — **fails** if an in-memory checkpointer (e.g. `MemorySaver`) is used when durable checkpointing is required.

Behavioural (require a probe; without one they are `blocked`, never `pass`):

- `ARCH-LG-RESUME-PROBED` — an interrupted run actually resumes after a fresh process/connection.
- `ARCH-LG-DURABLE-FILE` — a durable checkpoint file was used.
- `ARCH-LG-APPROVAL-BINDING` — approvals are bound to the exact action/target/input fingerprint and stale/altered/replayed approvals fail closed.

### Simple checks

- `ARCH-SIMPLE-NO-LANGGRAPH` — no LangGraph import.
- `ARCH-SIMPLE-NO-WORKFLOW-DEPS` — no hidden workflow dependency (e.g. a stray `StateGraph`).
- `ARCH-SIMPLE-SIDE-EFFECT-GUARD` — if the product has external side effects, validation/guarding is present.
- All LangGraph checks report `skip` (never `pass`) for a simple product.

### Other checks

- `ARCH-OTHER-JUSTIFIED` — the bespoke architecture carries a justification.
- `ARCH-OTHER-VERIFIABLE` — always `blocked`: no generic rule-set can verify a
  bespoke runtime, so it is preserved and reported **unverified**, never passed.

### Aggregation

`FAIL` beats `BLOCKED` beats `PASS`; `SKIP` never contributes a pass. A report
with zero failures and zero blocked findings is `PASS`. Blocked or skipped
findings can never make the report `PASS`.

---

## 5. Running the gate

```bash
# Verify every product contract:
.venv/bin/python tools/architecture_conformance.py --all

# Verify one product:
.venv/bin/python tools/architecture_conformance.py --product reconciliation_agent

# Write the full report JSON:
.venv/bin/python tools/architecture_conformance.py --all --json artifacts/architecture-conformance.json

# Skip the behavioural probe (behavioural checks become BLOCKED):
.venv/bin/python tools/architecture_conformance.py --all --no-probe
```

### Exit codes

| Code | Name | Meaning |
| --- | --- | --- |
| 0 | PASS | every checked product conforms. |
| 1 | FAIL | at least one product violates a rule. |
| 2 | COULD NOT RUN | bad invocation / unknown product / no contract. |
| 3 | BLOCKED | at least one product cannot be verified (unrecorded or stale decision, missing probe, bespoke architecture). |

### Gate integration

`scripts/gates.sh` runs `tools/architecture_conformance.py --all` as the
`architecture conformance` check and records `architecture_conformance` in
`artifacts/gate-evidence.json`. Any non-zero exit (including `3`/`BLOCKED`) is a
gate failure: an unverifiable architecture claim must never read as green.

### Evidence format

The `--json` report:

```json
{
  "gate": "architecture-conformance",
  "reports": [
    {
      "product_id": "reconciliation_agent",
      "declared_architecture": "langgraph",
      "verdict": "pass",
      "findings": [{"rule_id": "ARCH-LG-IMPORT", "status": "pass", "message": "…", "expected": null, "observed": null}]
    }
  ]
}
```

---

## 6. Interpreting verdicts

- **PASS** — the architecture claim is verified for this product.
- **FAIL** — an observed violation. Each finding names the product id, rule id,
  expected vs observed, and a safe evidence reference. Fix the implementation or
  the contract; do not silence the rule.
- **BLOCKED** — the claim *cannot be proven*: a decision was never recorded,
  the decision is stale, the behavioural probe did not run, or the architecture
  is bespoke. BLOCKED is honest ignorance, not failure — and never a pass.
- **SKIP** — a rule that does not apply (e.g. LangGraph rules for a simple
  product). SKIP is never counted as a pass.
- **Unverified** — anything BLOCKED or SKIP. Treat as *unknown*, and unknown is
  never "done".

---

## 7. Adding a product

1. Create `config/products/<product_id>.yaml` with all required fields.
2. Get the policy's decision: `--product <product_id> --decide`.
   - `needs_human_input` / `conflict` / `blocked` → resolve with a human before
     deciding anything else.
3. Record the decision: `--product <product_id> --write-decision`.
4. Implement to the selected architecture.
5. For `langgraph`, add a `behavioral_probe` (`module:callable`) that returns
   `{probed, resume_after_restart, durable_checkpoint_file_used, approval_binding_verified}`
   using **synthetic fixtures only**.
6. Run the gate: `--product <product_id>`. Iterate until `PASS`. The gate reads
   real source and runs the real probe — it cannot be satisfied by editing the
   report.

---

## 8. Adding an architecture or policy rule safely

- Requirements/constraints are a **closed vocabulary**. Adding one means: extend
  the enum, map it to capabilities in `ARCHITECTURE_CAPABILITIES` if it implies
  any, add conflict/assumption logic if needed, bump `POLICY_VERSION`, and add
  tests.
- Because `policy_fingerprint()` covers the matrix and version, bumping the
  version invalidates prior decisions — every product must be re-decided and the
  decision artifacts re-recorded. This is intentional: a policy change must not
  leave silent stale decisions.
- Never weaken a check to make a product pass. If a product legitimately needs to
  skip a check, the check's *contract* must justify it, and a reviewer must agree.

---

## 9. Version evolution

- The contract `schema_version` gates supported shapes. A new schema is added to
  `SUPPORTED_SCHEMA_VERSIONS` only with a `parse_contract` migration path; old
  documents keep parsing during the transition.
- The policy `POLICY_VERSION` gates decision validity via the fingerprint.
  Contract change → new contract fingerprint; policy change → new policy
  fingerprint; either makes an existing decision stale and re-decidable.

---

## 10. Security boundaries and human approval

- Contracts, decisions, and evidence are **non-secret**. No secret values are
  logged, and probe errors are carried as bounded text, never as raw payloads.
- The gate reads source read-only; the probe uses synthetic fixtures and a
  temporary SQLite file — no network, no live providers, no customer data.
- `declared_architecture` is a **claim**, not an authority. The gate's job is to
  distrust it and re-derive truth from source + behaviour.
- Architecture decisions with `needs_human_input`, `conflict`, or `blocked`, and
  any bespoke (`other`) architecture, require a human. An agent never records a
  decision on a conflicted contract.

---

## 11. Worked example — Product 1 (Mobile-Money Reconciliation Agent)

`config/products/reconciliation_agent.yaml` declares `langgraph` because the
product must survive process restarts, resume interrupted runs, orchestrate a
multi-step review, and keep a durable audit trail. That yields required
capabilities `durable_checkpoint`, `resumable_execution`,
`multi_step_orchestration` — which `simple` cannot provide, so the policy
selects `langgraph`.

The conformance gate then verifies the **shipped** implementation:

- Structural: `products/reconciliation_agent/workflow.py` builds a
  `StateGraph(GraphState)` compiled with `SqliteSaver` (durable), with an
  explicit `TypedDict` state schema.
- Behavioural (`conformance_probe.py`): a workflow interrupted before `report`
  is resumed from a **fresh connection** to the checkpoint file; an issued
  approval verifies, a missing approval raises `MissingApprovalError`, and an
  altered amount raises `StaleApprovalError`.

Observed: `pass=17`, no failures, no blocked findings → `PASS`. The recorded
decision lives at `evidence/decisions/reconciliation_agent.json`.

---

## 12. End-to-end examples

### 12a. A simple product (no LangGraph)

```yaml
# config/products/simple_report.yaml
schema_version: "1.0.0"
product_id: simple_report
product_package: products.simple_report
declared_architecture: simple
requirements:
  durable_execution: false
  resumable_after_restart: false
  multi_step_orchestration: false
  human_approval_gate: false
  external_side_effects: false
  model_invocation: false
  handles_financial_value: false
mandatory_constraints:
  - DETERMINISTIC_CORE
implementation:
  entrypoint_module: products.simple_report.run
```

```bash
.venv/bin/python tools/architecture_conformance.py --product simple_report --write-decision
.venv/bin/python tools/architecture_conformance.py --product simple_report   # PASS
```

Putting `import langgraph` in `products/simple_report/` turns it into
`ARCH-SIMPLE-NO-LANGGRAPH` FAIL — the gate does not accept an over-engineered
simple product.

### 12b. A durable LangGraph product

```yaml
# config/products/durable_agent.yaml
schema_version: "1.0.0"
product_id: durable_agent
product_package: products.durable_agent
declared_architecture: langgraph
requirements:
  durable_execution: true
  resumable_after_restart: true
  multi_step_orchestration: true
  human_approval_gate: true
  external_side_effects: true
  model_invocation: false
  handles_financial_value: true
mandatory_constraints:
  - DETERMINISTIC_CORE
  - HUMAN_APPROVAL_FOR_CONSEQUENTIAL_ACTIONS
  - DURABLE_AUDIT_TRAIL
  - FAIL_CLOSED_ON_ERROR
implementation:
  entrypoint_module: products.durable_agent.workflow
  workflow_builder: build_workflow
  checkpoint_class: SqliteSaver
  durable_checkpoint_required: true
  behavioral_probe: products.durable_agent.conformance_probe:probe
```

Decision: `langgraph` (durable + resumable + multi-step required). The gate
requires a real `StateGraph` + durable checkpointer, a probe that proves
restart-resume and approval binding, and fails on `MemorySaver`. See
`products/reconciliation_agent/conformance_probe.py` for a reference probe.

---

## 13. Limitations

- The gate is a **structural + behavioural** check, not a full formal proof.
  A determined implementation can satisfy the patterns without being correct;
  the probe narrows this by exercising real persistence and approval behaviour.
- Behavioural evidence is only as good as the probe. A missing probe is
  `BLOCKED`, never `PASS`, so an absent probe cannot masquerade as conformity.
- `other` architectures are preserved but always `BLOCKED` — no generic
  rule-set can verify a bespoke runtime; they require human review.
- The policy models a fixed capability vocabulary. A genuinely novel
  requirement is a `needs_human_input`, not an automatic extension.
- Checks are name-/pattern-based for structure; rename-safe symbol resolution
  is out of scope for schema `1.0.0`.

---

## 14. File map

| Path | Role |
| --- | --- |
| `company_os/architecture/contract.py` | Contract schema, parsing, validation, fingerprint, discovery. |
| `company_os/architecture/policy.py` | Capability 5 — selection engine, decision artifact, freshness. |
| `company_os/architecture/conformance.py` | Capability 6 — structural + behavioural rules, verdicts. |
| `company_os/architecture/__init__.py` | Public API re-exports. |
| `tools/architecture_conformance.py` | CLI / gate tool (exit codes 0/1/2/3). |
| `config/products/<product_id>.yaml` | Authoritative per-product contract. |
| `evidence/decisions/<product_id>.json` | Recorded decision artifact. |
| `tests/test_architecture_policy.py` | Capability 5 tests (incl. Hypothesis). |
| `tests/test_architecture_conformance.py` | Capability 6 adversarial/property tests. |
| `products/reconciliation_agent/conformance_probe.py` | Reference behavioural probe. |
| `scripts/gates.sh` | Runs the gate as `architecture conformance`. |
