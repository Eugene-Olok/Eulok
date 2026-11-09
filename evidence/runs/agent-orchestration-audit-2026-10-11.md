# Agent-Orchestration & Design-Gate Audit — 2026-10-11

Scope: principal-engineer audit of the Hermes → OpenCode → control-plane →
design-gate chain. Read-only for history; fixes are confined to the files named
below and are **uncommitted** (no git write operations were authorized).

Baseline: branch `feat/design-gate2`, HEAD `7f6ca2160381d79742731f0d357474f9b99c9388`,
upstream `origin/feat/design-system-source-of-truth` @ `c9f75c0` (ahead 9). Working
tree started clean.

## 1. Deterministic verification (fresh run at this audit)

| Check | Command | Result |
| --- | --- | --- |
| Full suite | `.venv/bin/python -m unittest discover -s tests` | **Ran 1105 tests — OK** (exit 0, 230.7s) |
| Ruff (CI gate) | `ruff check .` | **All checks passed!** |
| Byte-compile | `python -m compileall -q company_os tools tests` | rc 0 |
| Model compat | `tools/sync_model_compat.py --check` | PASS |
| Design manifest | `tools/validate_design_manifest.py` | PASS (290 items; CURRENT 30 / REQUIRED 178 / FUTURE 60 / OUT_OF_SCOPE 22) |
| Decision effects | `tools/validate_decision_manifest.py` | PASS |
| Design tokens | `tools/validate_design_tokens.py` | PASS (126 tokens; 0 INVALID) |
| Design graph | `tools/validate_design_graph.py` | PASS |
| Contract specs | `tools/validate_design_specs.py` | PASS (2/2 specs, 21 anchors) |
| Penpot map | `tools/validate_penpot_map.py` | PASS (0 INVALID) |
| Component spec | `tools/design_spec.py --dir docs/design/component-specs` | PASS |
| Design compiler | `tools/compile_design.py --dir docs/design/component-specs` | OK (12 ops, 0 refusals; plan_hash c030d06e…) |
| Token export | `tools/design_tokens_export.py --summary` | rc 0 (104 approved, 22 pending excluded) |
| Design diagnostic | `tools/design_diagnostic.py` | rc 0 |
| Bundle budget | `tools/check_bundle_budget.py` | PASS |
| Golden set | `tools/company_os_golden_eval.py` | 49/49 passed, determinism stable |
| Trajectory | `tools/company_os_trajectory_eval.py` | pass |
| Gate sequence | `tools/design_gate_verifier.py --report` | GATE-1/2 + subgate PASS; GATE-3 BLOCKED; GATE-4…7 fenced |
| Enforce GATE-2 | `… --enforce GATE-2` | OK (rc 0) |
| Enforce GATE-3 | `… --enforce GATE-3` | REFUSE (rc 2) |

## 2. Findings

### 2.1 Hermes home resolution — REAL DEFECT, FIXED
Hermes Agent itself is correct: `hermes_constants.get_hermes_home()` resolves
context override → `$HERMES_HOME` → platform default (`~/.hermes`). The defect was
in **`tools/hermes_company_os.py`**, whose `hermes_home()` hardcoded
`Path.home() / ".hermes"` and ignored `$HERMES_HOME`. Fixed to honour the env var
(blank value falls back to the default). Covered by 4 new tests
(`HermesHomeResolutionTests`), including an `apply_source` round-trip that asserts
the write lands under `$HERMES_HOME/config.yaml`.

### 2.2 Ruff gate — 10 latent errors, FIXED
`scripts/gates.sh:236` runs `ruff check .` as a **hard-failing** gate. Ruff 0.16.10
default ruleset flagged 10 errors across four sibling tools (the task-named
`tools/validate_design_manifest.py` was already clean): unused `import re`/`import
sys`, `subprocess.run` without explicit `check`, and a `sorted(x)[0]` that should
be `min(x)`. All fixed; the four shebang'd tool CLIs were `chmod +x`'d to match
repo convention.

### 2.3 Gate verifier `--registry` — DEAD FLAG, FIXED
`tools/design_gate_verifier.py` accepted `--registry` but `_yaml_load()` always read
the hardcoded `DEFAULT_REGISTRY`, so the flag was silently ignored (a misleading
interface and an obstacle to hermetic testing). `_yaml_load` now takes the path and
`main()` passes `args.registry`.

### 2.4 Reviewer independence — documented limitation (not a defect)
`config/models.yaml` sets `reviewer_vendor_must_differ_from_implementer: true`, and
`policy.py` enforces it via `RequestContext.implementer_vendor`. The OpenAI boundary
deliberately constructs `RequestContext(role, lane)` **without** `implementer_vendor`
(asserted at `tests/test_control_plane_boundary.py:382`), so vendor independence is
enforced only at the orchestration layer (CLI / golden eval), never on the
single-role inference boundary. This is intentional and tested; recorded here so no
future caller assumes the boundary alone guarantees reviewer separation.

### 2.5 Test-count reconciliation — `1,097` vs current `1,105`
`evidence/runs/design-gate2-final-report-2026-10-11.md:130` records “Ran 1097 tests
— OK”. That figure was accurate when written but was frozen before later tests were
added. OpenCode transcript session `ses_ed5a5bd9cffeF5A0gt0aBDqRsC` shows the count
growing the same day: `1097` (10:56Z) → `1101` (13:04Z) → `1105` (13:39Z). The
authoritative current count at HEAD + this audit's fixes is **1105 OK**. No
falsified evidence — a stale-in-time figure, not an invented one.

### 2.6 Manifest inventory — no contradiction
The brief's “REQUIRED 175 / FUTURE 63” is the **audit baseline**; the manifest header
and register (§26.4 / §26.7) document the promotions to the current **178 / 60**
(BRAND-013 + FOUND-021 under 26.4; BRAND-015 under 26.7). Reconfirmed by direct
count and by the manifest validator.

### 2.7 BRAND-013 dark theme — approval recovered, stays REQUIRED
Register row `26.4` = `APPROVED`, `approved_date: 2026-10-08`, evidence = founder
instruction *"approve B — both light and dark"* with an explicit theme-architecture
mandate (§26.4 of `DESIGN_DECISIONS.md`). The conditional “keep as FUTURE if the
approval cannot be recovered” does **not** apply; BRAND-013 correctly remains
`REQUIRED`, with rendered visual review still an open downstream obligation.

## 3. Changes (uncommitted)

- `tools/hermes_company_os.py` — `$HERMES_HOME` resolution.
- `tools/design_gate_verifier.py` — honour `--registry`; remove unused import; explicit `check=False`.
- `tools/penpot_command_runtime.py` — remove unused `import sys`; `min()`.
- `tools/validate_decision_manifest.py`, `tools/validate_design_specs.py` — remove unused `import sys`.
- Four tool CLIs — `chmod +x`.
- `tests/test_hermes_company_os.py` — +4 Hermes-home tests.
- `tests/test_design_gates.py` — +8 adversarial gate tests (fence, FAIL≠BLOCKED exit codes, fail-closed evidence, unknown-kind FAIL, registry-flag honoured).

## 4. Residual risk / blocked (unchanged)

- Command-API Penpot lane: Cloudflare HTTP 403 `error code: 1010` (no bypass).
- Owner-gated register items 26.1 / 26.5 / 26.9 / 26.11 keep GATE-3 BLOCKED and
  GATE-4…7 fenced — no autonomous completion attempted.

Determinism is the arbiter: every status above is derived from a real exit code or
a parsed artifact, never from model judgement.
