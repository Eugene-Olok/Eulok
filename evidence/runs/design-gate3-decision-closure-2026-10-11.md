# Design Gate 3 — Decision closure evidence (2026-10-11)

STATUS: PASS (decision closure / GATE-3), with GATE-6 & GATE-7 honestly BLOCKED

## Scope

Four open §26 decisions were closed by founder instruction on 2026-10-11 (the
§7 "founder instructs an agent to make that exact edit" path; recorded here as
provenance, not chosen by the agent):

| Decision | Resolution (option) | Summary |
|----------|--------------------:|---------|
| 26.1 | A | Brand mark is the exact text wordmark `COM-OS`; product name stays `Company OS`. |
| 26.5 | A | One lockup only; no stacked/horizontal/reversed variants; no symbol; no generated artwork. |
| 26.9 | E | Contact via a WhatsApp deep link `https://wa.me/256760779160`; no form/server/DB/email. |
| 26.11 | D | Legal/consent terms OUT_OF_SCOPE for initial release; owner-managed; analytics stays enabled. |

## What was executed (offline, deterministic)

Interpreter: `.venv/bin/python` (the interpreter `scripts/gates.sh` selects).

| Check | Command | Result |
|-------|---------|--------|
| Tokens / register | `tools/validate_design_tokens.py` | PASS — 18 registered (18 APPROVED, 0 BLOCKED/PENDING_ESCALATE/PENDING); 126 tokens, INVALID 0 |
| Decision↔manifest | `tools/validate_decision_manifest.py` | PASS — 18 approved, 12 authorized deferrals/exclusions |
| Design manifest | `tools/validate_design_manifest.py` | PASS — 290 items; CURRENT 30 / REQUIRED 178 / FUTURE 60 / OUT_OF_SCOPE 22 |
| Design graph | `tools/validate_design_graph.py` | PASS — layers, acyclic, build order, cross-refs |
| Contract specs | `tools/validate_design_specs.py` | PASS — 2/2 specs, 21 anchors |
| Penpot map (offline) | `tools/validate_penpot_map.py` | PASS — consistent; 0 mappings (no live workspace) |
| Component spec | `tools/design_spec.py --dir docs/design/component-specs` | PASS — 1 spec |
| Compiler (offline) | `tools/compile_design.py ...` | OK — 12 ops, 0 refusals, plan_hash `c030d0…7280c` |
| Token export (offline) | `tools/design_tokens_export.py --summary` | OK — 104 approved (+22 pending excluded) |
| Diagnostic (offline) | `tools/design_diagnostic.py` | OK — no blocker |
| Bundle budget | `tools/check_bundle_budget.py` | PASS — transfer 6932/102400; LCP/CLS BLOCKED |
| Gate sequence | `tools/design_gate_verifier.py --report` | GATE-1…5 PASS; GATE-6/7 BLOCKED; aggregate BLOCKED (rc 2) |
| Full unit suite | `.venv/bin/python -m unittest discover -s tests` | **OK — 1155 tests, rc 0** |

## Gate state

GATE-1, GATE-2, PENPOT-PROTOCOL-SUBGATE, GATE-3, GATE-4, GATE-5 = **PASS**.
GATE-6 = **BLOCKED** (per-page rendered parity evidence not producible without
an approved browser lane — see `design-parity-2026-10-11.md`). GATE-7 =
**BLOCKED** (prerequisite GATE-6 not PASS — see `design-phase8-gate-2026-10-11.md`).

`--enforce GATE-2/GATE-3/GATE-4/GATE-5` ⇒ `OK` (rc 0);
`--enforce GATE-6` ⇒ `REFUSE` (rc 2), as designed.

## Content re-measurement

`business/site/index.html` grew 3908 B → 4308 B when the authorized Contact
section + WhatsApp CTA were added (decision 26.9); first-load delivered
6532 B → 6932 B; JS unchanged (2624 B). All byte budgets PASS. Recorded in
`PERFORMANCE_BUDGET.yaml` (`measurement.remeasured_2026_10_11`) and pinned by
`tests/test_bundle_budget.py`. The 2026-10-09 figures remain the historical
inspection (append-only audit trail).

## Environment note (honest)

Running the unit suite with the *system* `python3` reports 2 import errors
(`test_zoho_books`, `test_zoho_crm`: `No module named 'httpx'`). `httpx==0.28.1`
is a declared dependency (`requirements.txt`) and is present in `.venv`; the
gate selects `.venv/bin/python`, under which the suite is green. This is an
interpreter-selection artifact, not a code defect, and is unchanged by this task.

## Not claimed

- No rendered/pixel/behavioural parity (GATE-6 BLOCKED).
- No ship/deploy (GATE-7 BLOCKED; phase 8 not run).
- No live Penpot mutation in this task.
- No agent approval of any decision — the 2026-10-11 founder instruction is the
  approval; this record is provenance only.
