# Design Gate 2 — Manifest / Decision Reconciliation

**Date:** 2026-10-11 (UTC)
**Branch:** `feat/design-gate2`
**Base commit:** `efbfb8aefc9457e3275301a613ad5da915768212`
**Scope:** Reconcile the canonical `DESIGN_MANIFEST.yaml` classification with the
approved decision register (`DESIGN_DECISIONS.md`). No production Penpot mutation.
No commits made (working tree only, per instruction).

## 1a. Finding (contradiction) — dark theme (26.4)

| Source | Says |
|---|---|
| `DESIGN_DECISIONS.md` §3 26.4 | dark mode **APPROVED 2026-10-08**, selected option **(B) — now / both light and dark** |
| `DESIGN_DECISIONS.md` §5 register | `26.4 status: APPROVED` |
| `DESIGN_DECISIONS.md` §6 line 497 | treatment: **"Record BRAND-013 + FOUND-021"** |
| `DESIGN_TOKENS.yaml` | `themes` contract + `value_dark` + dark contrast pairs **delivered** |
| `DESIGN_MANIFEST.yaml` | `BRAND-013` / `FOUND-021` **`FUTURE`**, `evidence: "deferred"` |

The decision was approved and the *token* propagation was performed, but the *manifest
classification* propagation was never recorded. Per manifest rule 10, promotion of a
`FUTURE` item requires an explicit founder decision — the approved 26.4 (option B,
"from day one") is that decision, and §6 already names the exact two IDs.

**Classification chosen: `REQUIRED`, not `CURRENT`.** No frontend/Penpot theme exists yet
(`frontend_mapping: NOT YET IMPLEMENTED`), so the item is not `CURRENT`. This matches the
existing precedent `FOUND-001` (colour tokens), which is `REQUIRED` even though the token
contract already exists in the repository.

## 1b. Finding (contradiction) — motion language (26.7)

The same deterministic cross-reference (decision register → §3 "Affected manifest IDs"
→ manifest status) exposed one further stale item:

| Source | Says |
|---|---|
| `DESIGN_DECISIONS.md` §3 26.7 | minimal, reduced-motion-safe motion policy **APPROVED 2026-10-08** (150/250/400ms; `cubic-bezier(0.2,0,0,1)`); affected IDs `BRAND-015, FOUND-016, A11Y-007` |
| `DESIGN_MANIFEST.yaml` | `FOUND-016` (motion tokens) `REQUIRED`; `A11Y-007` `REQUIRED`; **`BRAND-015` `FUTURE`** |
| `DESIGN_TOKENS.yaml` | motion tokens delivered (approved aliases) |

The motion *policy* language (durations/easing/reduced-motion) is defined by an approved
decision and its token counterpart is already `REQUIRED`; the governing decision contains
no deferral language. Promoted under approved 26.7 (same rule-10 basis as dark theme).

All other `FUTURE`/`OUT_OF_SCOPE` items referenced by an approved decision were verified
to be **decision-authorized deferrals/exclusions** and are now explicitly declared as such
(26.6 density, 26.12/26.13 exclusions, 26.14 imagery, 26.16 self-host/parity).

## 2. Changes made

### Two promotions
| File | Change |
|---|---|
| `docs/design/DESIGN_MANIFEST.yaml` | `BRAND-013`/`FOUND-021` `FUTURE→REQUIRED` (P3→P1); **`BRAND-015` `FUTURE→REQUIRED` (P3→P1)**; evidence/notes updated to cite the approved decisions and delivered contracts; header records the post-audit delta with updated totals |
| `tools/validate_design_manifest.py` | `EXPECTED_COUNTS` `REQUIRED 175→178`, `FUTURE 63→60`; success message updated |
| `docs/design/DESIGN_DECISIONS.md` | §3 26.4/26.7 "propagation performed" record the promotions; §6 26.4/26.7 rows marked recorded; §6 closing note corrected to enumerate both propagations and name the guard |

### Regression guard (prevents recurrence)
| File | Change |
|---|---|
| `docs/design/DECISION_MANIFEST_EFFECTS.yaml` | (new) machine-readable per-decision **authorized deferrals/exclusions** mapping (26.6, 26.12, 26.13, 26.14, 26.16) |
| `tools/validate_decision_manifest.py` | (new) deterministic guard: every **APPROVED** decision's §3 affected IDs must be `CURRENT`/`REQUIRED` unless explicitly declared deferred/excluded; both drift directions enforced (stale `FUTURE` flagged; declared-but-wrong status flagged); fails closed on missing files, unknown decisions, unparseable §3 tokens |
| `scripts/gates.sh` | `run_check "decision effects" ...` wired into the Python gate block (after "design manifest") |
| `tests/test_decision_manifest.py` | (new) 8 tests: real-repo PASS, determinism, stale-item failure, declared-deferral mismatch, undeclared-deferral, unknown decision, id-not-among-affected, missing-files fail-closed |

Audit baseline (`evidence/runs/design-system-audit-2026-10-08.md`) was **not** modified — the
audit stays immutable as the 2026-10-08 baseline; the delta is recorded in the manifest header
and §6.

Current totals: `290 items — CURRENT 30 / REQUIRED 178 / FUTURE 60 / OUT_OF_SCOPE 22`.

## 3. Verification (reproducible)

```sh
.venv/bin/python tools/validate_design_manifest.py     # PASS (exit 0): 290 unique; REQUIRED=178 FUTURE=60
.venv/bin/python tools/validate_decision_manifest.py   # PASS (exit 0): 13 approved decisions with scope consistent; 9 deferrals/exclusions
.venv/bin/python tools/validate_design_tokens.py       # PASS (exit 0)
.venv/bin/python tools/validate_design_graph.py        # PASS (exit 0)
.venv/bin/python tools/validate_penpot_map.py          # PASS (exit 0)
.venv/bin/python -m unittest tests.test_decision_manifest -v   # 8 OK
.venv/bin/python -m unittest discover -s tests         # Ran 1080 tests — OK
git diff --check                                       # clean
bash -n scripts/gates.sh                               # syntax OK
```

## 4. Honest exclusions / not done

- **No commit** — changes left uncommitted per instruction.
- **No production Penpot mutation** — Penpot readiness remains `PARTIAL`/`NOT_STARTED`;
  no Penpot writes were attempted.
- **26.18** (GOV-004 scoped token-value approval) names no manifest IDs, so it is outside
  the manifest-effect contract (guard warns, does not fail).
- **Pending decisions** (26.1, 26.5, 26.9, 26.11) are intentionally not enforced by the
  guard — only **APPROVED** decisions have binding manifest scope.