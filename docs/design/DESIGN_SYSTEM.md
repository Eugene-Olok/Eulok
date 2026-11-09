# Company OS Design System

**Status:** Programme specification — source-of-truth package established; implementation not yet claimed.

## Authority

The design programme is governed by repository evidence, approved founder decisions, the design manifest, and deterministic verification. Agents may propose and implement; they do not self-approve.

The greenfield audit at `evidence/runs/design-system-audit-2026-10-08.md` is the factual baseline. `docs/design/DESIGN_MANIFEST.yaml` is the executable registry derived from its §15 manifest.

### Source-of-truth hierarchy

1. Founder decisions and binding Company OS engineering policy.
2. Repository implementation and deterministic gates for claims about what exists.
3. `DESIGN_MANIFEST.yaml` for design scope, stable IDs, status and requirement registry.
4. `DESIGN_DECISIONS.md` (decision register) and `DESIGN_TOKENS.yaml` (canonical token contract) — tokens classify only after their decisions are approved.
5. Penpot and frontend are downstream representations of the approved contract.
6. Evidence under `evidence/runs/` proves completion; visual or agent judgement alone does not.

### Design package (Gate 2 contract set)

| File | Role |
|---|---|
| `DESIGN_DECISIONS.md` | 18 registered decisions (§26, incl. GOV-004 value-approval entry 26.18) + dependency graph + machine-readable register |
| `DESIGN_TOKENS.yaml` | canonical token contract (primitive/semantic/component + contrast matrix) |
| `DESIGN_TOKENS.md` | token architecture prose, naming, tri-state status model |
| `COMPONENT_DEPENDENCIES.yaml` | 11-family component graph, layers L0–L3, rules R1–R6, build order |
| `PAGE_TEMPLATE_MAP.yaml` | all 30 PAGE items → six §17.1 templates |
| `ACCESSIBILITY_SPEC.md` | WCAG 2.2 AA contract + component/page matrices + measured contrast |
| `RESPONSIVE_SPEC.md` | breakpoint contract (values approved 2026-10-08, decision 26.8; behaviour validation still required) |
| `PENPOT_IMPLEMENTATION_MAP.yaml` | Penpot mapping rules (contract APPROVED 2026-10-10, decision 26.16 / Penpot Cloud; mapping NOT_STARTED; write subgate BLOCKED — see file) |
| `PERFORMANCE_BUDGET.yaml` | performance budget (values approved 2026-10-08, decision 26.15; TEST-007 BLOCKED until tooling chosen) |
| `tools/validate_design_tokens.py` | deterministic tri-state + contrast validation |
| `tools/validate_design_graph.py` | deterministic graph/page-map validation |
| `tools/validate_design_manifest.py` | 290-item manifest validation: structure, status counts, families + deep per-item schema (id pattern, priority vocab, evidence policy) |
| `docs/design/DECISION_MANIFEST_EFFECTS.yaml` | machine-readable per-decision authorized deferrals/exclusions |
| `tools/validate_decision_manifest.py` | deterministic guard: APPROVED decisions' manifest scope must not silently stay FUTURE/OOS (wired into `scripts/gates.sh`) |
| `tools/validate_design_specs.py` | deterministic contract-anchor validation for `RESPONSIVE_SPEC.md` + `ACCESSIBILITY_SPEC.md` |
| `docs/design/DESIGN_GATES.yaml` + `tools/design_gate_verifier.py` | machine-readable gate sequence; derives PASS/BLOCKED/FAIL from real checks and enforces prerequisite fencing (`--enforce GATE-N`) |

## Lifecycle

```
AUDIT → RECONCILE → DECIDE → SPECIFY → DESIGN → IMPLEMENT → VERIFY → EVIDENCE → SHIP
```

The audit is complete and the source-of-truth package (Gate 2) is established and machine-checked: decision register, canonical tokens, component/page graphs, contract specs, validation tooling, and the gate sequence (`docs/design/DESIGN_GATES.yaml`). The founder-decision register is **14 APPROVED / 1 BLOCKED (26.9) / 1 PENDING_ESCALATE (26.11) / 2 PENDING (26.1, 26.5, asset-gated)**. The remaining open unit before token establishment is the residual founder-decision closure in §26. Live Penpot writes require the **PENPOT-PROTOCOL-SUBGATE** (a disposable target + verified write surface); it is currently BLOCKED, so Penpot mutation work has not started. Gate statuses are derived every run by `tools/design_gate_verifier.py` — never asserted by hand.

## Status semantics

| Status | Meaning | Release effect |
|---|---|---|
| CURRENT | Exists now and has repository evidence | Must remain truthful; regressions block |
| REQUIRED | Approved scope for the active programme | Must eventually satisfy its acceptance criteria |
| FUTURE | Legitimate later scope | Must not block current release |
| OUT_OF_SCOPE | Explicitly excluded | Must not be implemented as part of this programme |

## Production rules

- No invented capabilities, customers, outcomes, metrics, testimonials or case studies.
- No design item becomes CURRENT merely because it exists in Penpot.
- No component is complete until design, implementation, accessibility, responsive behavior, tests and evidence satisfy its contract.
- Token values are defined once and consumed by Penpot and frontend; downstream artefacts must not invent values.
- Accessibility is a release property: WCAG 2.2 AA target, automated checks plus required manual verification.
- Existing Phase 8 tests/gates remain contracts. They are extended deliberately, never weakened silently.
- FUTURE and OUT_OF_SCOPE work cannot enter the critical path without an explicit founder decision.
- Every change to the manifest is reviewable and must preserve ID uniqueness and status-count integrity.

## Decision blockers inherited from the audit

The following are not agent decisions: brand mark, font strategy, palette, dark mode timing, logo lockup, density, motion budget, breakpoints, contact submission path, multi-page IA, analytics disclosure/consent, custom domain, blog/CMS, imagery strategy, performance budgets, Penpot contract/hosting, and design-system location. See audit §26.

Two decisions with lasting operational weight:

- **Contact/intake:** no submission backend exists and `mailto:` is forbidden by current tests. Decision 26.9 is `BLOCKED` (no contact form/submission path in v1, founder 2026-10-09); it is an explicit blocker, not a guess.
- **Penpot contract:** the historical Phase 8 §8.5 text is genuinely unrecoverable and remains `UNKNOWN`. The founder discharged the restatement obligation on **2026-10-10** by approving a **new restated contract verbatim** (decision 26.16, Penpot Cloud hosting) — recorded in `DESIGN_DECISIONS.md` §3. This is a new contract, never represented as recovered §8.5 history. Live Penpot **writes** remain gated by the still-BLOCKED PENPOT-PROTOCOL-SUBGATE (no disposable target, write surface unverified).

Until the residual decisions (26.1, 26.5, 26.9, 26.11) close, they must remain explicit blockers rather than being silently guessed.

## Execution architecture

### Foundations

Tokens → typography → colour → spacing → geometry → focus → responsive primitives → accessibility.

**Themes (26.4, approved 2026-10-08):** the system ships **both light and dark** as a first-class theme architecture. Light is the canonical production theme; dark is a complete, contrast-validated semantic palette of the same roles. Colour theme resolution lives at the semantic layer (`value` / `value_dark`); components inherit and must never hard-code a light-only colour. Both themes must satisfy WCAG 2.2 AA, and visual regression + the 26.15 performance budget apply to both.

### Components

Primitives → actions → text → selection/forms → feedback → navigation/shell → data → overlays → composites.

### Pages

Shell → templates → required public pages → system/error states.

### Verification

Token conformance → accessibility → visual regression → responsive matrix → HTML/link integrity → performance → production deployment → evidence.

## Definition of done

A design programme item is complete only when its manifest status can be supported by evidence appropriate to the item and its dependency graph is satisfied. For P0/P1 items, automated and required manual checks must be green. The programme is not complete merely because the Penpot library or frontend appears visually complete.
