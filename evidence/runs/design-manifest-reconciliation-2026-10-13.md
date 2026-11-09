# Design — Decision / Manifest Reconciliation (current HEAD)

**Date:** 2026-10-13 (UTC)
**Branch:** `feat/design-gate2`
**HEAD:** `c3423cde65395edefc34418be8b5a221724cf0c1`
**Supersedes (does not modify):** `evidence/runs/design-gate2-manifest-reconciliation-2026-10-11.md`
**Immutable baseline:** `evidence/runs/design-system-audit-2026-10-08.md`

## Purpose

Re-derive, deterministically and at the current HEAD, that the approved decision
register and the canonical design manifest are in agreement: for every decision
with manifest scope, the affected IDs are `CURRENT`/`REQUIRED` unless the effect
is an explicitly declared deferral/exclusion. This is a re-run of the Gate-2
reconciliation after the 2026-10-11 Gate 3–7 approvals, not a new reconciliation
method.

## Method (all deterministic, all re-runnable)

```sh
.venv/bin/python3 tools/validate_design_manifest.py      # structure + counts
.venv/bin/python3 tools/validate_decision_manifest.py    # decision→manifest scope guard
.venv/bin/python3 tools/validate_design_tokens.py        # token classification
.venv/bin/python3 tools/validate_design_graph.py         # layer/acyclicity/build order
.venv/bin/python3 tools/validate_penpot_map.py           # map ↔ manifest/tokens/graph
.venv/bin/python3 -m unittest tests.test_decision_manifest
.venv/bin/python3 tools/design_gate_verifier.py --report
```

## Result at HEAD `c3423cd`

| Check | Result |
|---|---|
| `validate_design_manifest.py` | **PASS** — 290 unique items; CURRENT=30 REQUIRED=178 FUTURE=60 OUT_OF_SCOPE=22 |
| `validate_decision_manifest.py` | **PASS** — 18 approved decisions with manifest scope are consistent; 12 authorized deferrals/exclusions recorded |
| `validate_design_tokens.py` | **PASS** — 0 INVALID; pending decisions honestly classified `VALID_PENDING_DECISION` |
| `validate_design_graph.py` | **PASS** — layer contract, acyclicity, build order, manifest cross-refs hold |
| `validate_penpot_map.py` | **PASS** — structurally consistent with manifest, token classification, component graph, page/template map; 0 INVALID |
| `tests/test_decision_manifest.py` | **OK** |
| `design_gate_verifier.py --report` | **aggregate: PASS** (GATE-1…GATE-7 + PENPOT-PROTOCOL-SUBGATE all PASS) |

**Finding:** no undeclared drift. The decision count rose from 13→18 with scope
and 9→12 recorded deferrals/exclusions since 2026-10-11; the new approved
decisions all resolve to `CURRENT`/`REQUIRED` or to a declared effect, so the
guard stays green without edits.

## Honest exclusions / not done

- **No commit** — this note and the working-tree changes are left uncommitted.
- **No production Penpot mutation** — Penpot readiness remains `PARTIAL`; the
  live MCP endpoint is reachable (see the Penpot probe) but no write was issued.
- Decisions with no manifest IDs (e.g. scoped token-value approval) are outside
  the effect contract; the guard warns, it does not fail.
- Pending (non-approved) decisions are intentionally not enforced.
