# Design Gate 2 — Verification Evidence

**Date:** 2026-10-08 (UTC)
**Branch:** `feat/design-gate2` (based on `c9f75c0` → `c4b5e81` audit baseline)
**Scope:** Production design-foundation package — decision closure, canonical token
contract, deterministic validation tooling, component/page dependency graph,
Penpot MCP readiness, evidence/report.
**Audit baseline:** `evidence/runs/design-system-audit-2026-10-08.md` (Gate 1, `c4b5e81`) — not repeated.

## Final gate verdict

```
FINAL GATE: PASS
```

Gate rule applied: **PASS** = every runnable verification passed with zero FAIL,
and every item that could not run is classified BLOCKED/NOT RUN with a named,
externally-caused blocker declared below. **FAIL** would require any INVALID
finding, test failure, or secret leak — none occurred. The Penpot activation
workstream is BLOCKED (declared, gate-rule compliant); see §5.

## 1. Verification matrix

| # | Check | Method | Result |
|---|---|---|---|
| 1 | Design manifest structure (290 items, counts, families) | `python3 tools/validate_design_manifest.py` | **PASS** — `290 unique items; CURRENT=30 REQUIRED=175 FUTURE=63 OUT_OF_SCOPE=22` |
| 2 | Token contract tri-state (114 tokens) | `python3 tools/validate_design_tokens.py` | **PASS** — `VALID_APPROVED: 0 · VALID_PENDING_DECISION: 114 · INVALID: 0` (exit 0) |
| 3 | WCAG contrast matrix (7 pairs) | same run | **PASS (honest)** — 4 PENDING_PASS, 1 KNOWN_OPEN_DEFECT (A11Y-004, 1.92:1), 1 ADVISORY_FAIL (subtle border 1.3:1), 1 NOT_RUN (focus ring). Open defects reported, never counted as passes |
| 4 | Decision register integrity (17 records) | `validate_design_tokens.py` register block | **PASS** — 17/17 present (26.1–26.17), 0 APPROVED, 2 BLOCKED (26.9, 26.16), 1 PENDING_ESCALATE (26.11), depends_on acyclic |
| 5 | Component graph: families/counts/ranges vs manifest | `python3 tools/validate_design_graph.py` | **PASS** — 11 COMP families, 130 items, counts+ranges match §14.4 exactly |
| 6 | Layer contract (≤ same-or-lower), build-order monotonicity, acyclicity | same run + 3 negative tests (§3) | **PASS** — 9 evidenced edges, 0 violations; negatives correctly rejected |
| 7 | Page/template map (30 PAGE ids) | same run | **PASS** — 30/30 ids + statuses + titles match manifest; 6 §17.1 templates; Excluded ⇔ OUT_OF_SCOPE (13) |
| 8 | Template→family references resolve | same run | **PASS** — all required_families exist in component graph |
| 9 | Negative control: validators can fail | 6 tamper tests (§3) | **PASS** — all 6 detected (exit 1) |
| 10 | Site-content invariants (TEST-001/019 assertions) | `.venv/bin/python -m unittest tests.test_site_content` | **PASS** — included in 45-test targeted run |
| 11 | Secret-hygiene invariants | `.venv/bin/python -m unittest tests.test_security_phase8` | **PASS** — included in targeted run |
| 12 | Full repository test suite | `.venv/bin/python -m unittest discover -s tests` | **PASS** — `Ran 694 tests … OK` |
| 13 | Whitespace/error markers in diff | `git diff --check` | **PASS** — clean |
| 14 | Secret leak scan of changed files | pattern grep (keys/passwords/MCP endpoints) + exact-value repo grep of `PENPOT_MCP_URL` | **PASS** — 0 occurrences of the URL value in the repository; only rule text mentions the name |
| 15 | Penpot MCP connection usability | config inspection (OpenCode config contains no `penpot` MCP entry; no Penpot tools exposed) | **BLOCKED** — declared (§5, BLOCKER-1) |
| 16 | Penpot contract text (§8.5) recovery | Gate-2 git-history search (`git log --all` for §8.5/penpot/design-system tokens) | **NOT RUN/UNRECOVERABLE** — no approved text exists anywhere; decision 26.16 BLOCKED on audit §27.A |
| 17 | Founder decision closure (§26 approvals) | none — approval is a human act | **NOT RUN (by design)** — 0/17 approved; agents never set APPROVED |
| 18 | Penpot structure creation (brief §20) | not attempted | **BLOCKED** — unsafe/unusable: BLOCKER-1..3 (§5); no structure created |
| 19 | Performance budget values | repo-wide recovery search (Gate 2) | **NOT RUN** — no values exist; schema established with `PENDING_DECISION` under 26.15 |
| 20 | Visual/browser verification of design | none available (no design implementation yet) | **NOT RUN** — no frontend/Penpot surface exists to verify |

No check returned FAIL.

## 2. Deliverables verified (this run)

| File | Kind | Status |
|---|---|---|
| `docs/design/DESIGN_DECISIONS.md` | 17-decision register + dependency graph + machine-readable register block | written, parses, validated |
| `docs/design/DESIGN_TOKENS.yaml` | canonical token contract (114 tokens, 7 contrast pairs) | written, validated |
| `docs/design/COMPONENT_DEPENDENCIES.yaml` | 11 families / L0–L3 / R1–R6 / build order / 9 edges / 3 patterns | written, validated |
| `docs/design/PAGE_TEMPLATE_MAP.yaml` | 30 pages → 6 templates (1 PROPOSED mapping: PAGE-027) | written, validated |
| `docs/design/PERFORMANCE_BUDGET.yaml` | budget schema, all thresholds `PENDING_DECISION` (26.15) | written |
| `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml` | mapping rules + `readiness: BLOCKED` (3 named blockers) | written |
| `docs/design/DESIGN_TOKENS.md` | updated: canonical authority, naming, tri-state, validator usage | updated |
| `docs/design/DESIGN_SYSTEM.md` | updated: hierarchy + Gate 2 package file table | updated |
| `docs/design/ACCESSIBILITY_SPEC.md` | updated: component/page matrices + measured contrast table | updated |
| `docs/design/RESPONSIVE_SPEC.md` | updated: canonical breakpoint token pointers | updated |
| `tools/validate_design_tokens.py` | tri-state + contrast + register validation | written, green |
| `tools/validate_design_graph.py` | graph + page-map + manifest cross-validation | written, green |

## 3. Negative-control evidence (validators can fail)

| Tamper | Expected | Observed |
|---|---|---|
| Register: 26.1 `APPROVED` without approval fields | exit 1 | exit 1 — `status APPROVED but approval='not_approved'` + missing approved_date/evidence |
| Register: 26.3 fully approved while component token value is null | exit 1 | exit 1 — `decision 26.3 APPROVED but effective value is null` (5 tokens) + 15 declared/computed mismatches |
| Token: alias to non-existent primitive | exit 1 | exit 1 — `alias target 'primitive.color.does-not-exist' does not exist` |
| Token: self-alias cycle | exit 1 | exit 1 — `alias cycle: semantic.color.fg.muted -> semantic.color.fg.muted` |
| Graph: L1 family depends on L2 family | exit 1 | exit 1 — layer-contract violation + build_step 6 > 2 |
| Graph: 3-node cycle CON→NAV→ACT→CON | exit 1 | exit 1 — `cycle: COMP-CON -> COMP-NAV -> COMP-ACT -> COMP-CON` |
| Pages: PAGE-016 status flipped to REQUIRED | exit 1 | exit 1 — `status 'REQUIRED' != manifest status 'OUT_OF_SCOPE'` |

## 4. Declared open items (honest state, not failures)

- **A11Y-004 (KNOWN_OPEN_DEFECT):** badge border `#bbbbbb` on `#ffffff` = **1.92:1** vs 3.0:1
  (1.4.11). Audit's only measured WCAG failure; closes when decision 26.3 replacement lands.
- **subtle-border-on-canvas (ADVISORY_FAIL):** `#dddddd` on `#fafafa` = 1.3:1 — advisory,
  decorative-risk review required (audit §19.4).
- **focus-ring-on-canvas (NOT_RUN):** focus tokens pending decision — never reported as pass.
- **PAGE-027 mapping (PROPOSED):** OG image asset not enumerated by the §17.1 tree; grouped
  under Utility pending founder confirmation (validator warning, surfaced every run).
- **33 tokens with `decision_id: null`:** no §26 owner exists (radius/border/shadow/z/icon/
  container-max/grid-gap); flagged as "propose under GOV-004" warnings.
- **Audit cross-reference divergences** (§26 inline IDs vs §15 registry): documented in
  `DESIGN_DECISIONS.md` §6; the §15/§14.4 registry governs. Audit file not modified.
- **17/17 founder decisions PENDING/BLOCKED** — expected Gate 2 state; closure is a human act.

## 5. Penpot MCP workstream — BLOCKED (declared blockers)

1. **BLOCKER-1:** No Penpot MCP server configured in this environment (config inspection:
   no `penpot` entry; no Penpot tools exposed). Connection URL exists only as a secret
   (`PENPOT_MCP_URL` in `~/company-os/secrets/providers.env`, mode 600, outside the repo)
   and was never printed or written anywhere — exact-value repo grep: **0 occurrences**.
2. **BLOCKER-2:** Decision 26.16 BLOCKED — Phase 8 §8.5 Penpot contract text unrecoverable
   (audit §27.A; Gate-2 history search reconfirmed no approved text exists).
3. **BLOCKER-3:** Canonical tokens are `VALID_PENDING_DECISION` — no approved values to model.

No Penpot structure was created (brief: only if safely usable). Readiness state is recorded
in `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml` (`readiness.state: BLOCKED`).

## 6. Secret & policy hygiene

- Secrets file: `/home/genie/company-os/secrets/providers.env` — mode 600, outside repo,
  untracked. Name `PENPOT_MCP_URL` referenced only as policy text; value never displayed,
  never committed, never logged (`set -x` never used).
- No credentials, keys, tokens, or MCP endpoints in any changed file (pattern scan clean;
  matches were rule text only).
- `git diff --check` clean; no unrelated files touched; dedicated branch used
  (`feat/design-gate2`); no existing configuration overwritten; audit file untouched.
- No commits made — changes left in the working tree per instruction (commit only on
  explicit request).

## 7. Commands executed (reproducible)

```sh
python3 tools/validate_design_manifest.py   # PASS (exit 0)
python3 tools/validate_design_tokens.py     # PASS (exit 0), --verbose available
python3 tools/validate_design_graph.py      # PASS (exit 0)
.venv/bin/python -m unittest tests.test_site_content tests.test_security_phase8 tests.test_phase8_gate   # 45 OK
.venv/bin/python -m unittest discover -s tests                                                            # 694 OK
git diff --check                           # clean
```

Negative controls used temp copies under `/tmp/opencode/gate2/` — repository files were
never tampered with.
