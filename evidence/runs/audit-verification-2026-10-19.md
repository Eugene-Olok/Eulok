# Company OS — Independent Audit Verification (2026-10-19)

Status: **NOT RELEASE-CERTIFIED**

Tested tree: `fbed5fd91d5afa61d6693014fd7ca3d056b9885f`, branch
`fix/business-evidence-placeholder-guard`, **worktree dirty** (uncommitted
changes are not release evidence). `origin/main` = `bba862d68803b113b51e6331bb05c70351c5ba6a`.
PR #10 is OPEN/mergeable at `fbed5fd`; remote CI at that SHA is green for both
`deterministic-gates` and Phase 8. No remote CI covers the current dirty tree.

This report supersedes `evidence/runs/inspection-2026-10-19.md` (preserved, not
deleted).

## Method

Deterministic gates only: `./scripts/gates.sh` (33 checks, hermetic) and
`./scripts/gates-phase8.sh` (deployment/analytics). No commits, pushes, merges,
deploys, production mutations, credential creation, or Bifrost installer runs
were performed. Production access was read-only.

## Final gate results (on the tested tree)

| Gate | Result | Evidence |
| --- | --- | --- |
| `scripts/gates.sh` | **PASS**, 33/33, 0 failed | `artifacts/gate-evidence.json` |
| — unit tests | PASS — 1838 tests, 0 failures | gate log |
| — mypy (strict) | PASS — 40 source files | `mypy.ini` scope |
| — coverage (branch) | PASS — 85% ≥ 85% threshold | `artifacts/coverage.json` |
| — ruff / ruff format | PASS — 262 files already formatted | gate evidence |
| `scripts/gates-phase8.sh` | **BLOCKED** — 0 failed, 4 blocked, 1838 tests | `artifacts/gate-evidence-phase8.json` |

Release eligibility reported by the gate itself: `BLOCKED — worktree is dirty;
uncommitted changes are not release evidence`.

## Defects fixed

### This round
- **Fail-open `exclusions` presence check** (`company_os/business/workflow.py`):
  `validate_scope` and `validate_proposal` used `if not <field>:`, so a
  malformed non-iterable scalar (e.g. `exclusions=123`) passed as a valid
  declaration. Added `_has_declaration()` (built on `_as_entries`, so mappings
  and non-iterables fail closed) and routed both checks through it. A
  `("NONE",)` list — and a scalar `"NONE"` string as one entry — still passes
  because "no exclusions" is a legitimate policy decision, matching documented
  intent. Regression tests added to `tests/test_business_workflow.py`
  (`RequiredListSubstanceTests`), suite now 76 tests.

### Prior rounds (carried into the tested tree)
- Business evidence hardening: Unicode NFKC + `Cf`/`Cc` stripping, expanded
  placeholder tokens, edge-punctuation stripping, scalar `UNKNOWN` blocking,
  required-list substance checks, ASCII-only `_MONEY_RE` money parsing
  (rejects Arabic-Indic digits, underscores, signs, exponents), numeric
  invoice/payment comparison.
- Runtime enum-type guards (`_invalid_enum`) on every validator, closing a
  plain-string status bypass.
- Mypy strict gate introduced; all 73 errors across `company_os` + `products`
  fixed, including a real bug in
  `products/reconciliation_agent/conformance_probe.py` whose
  `_probe_approval_binding` was annotated `dict` instead of `bool | None`.
- Coverage gate introduced: 85% branch threshold (measured 85%).
- `requirements-dev.txt` / `requirements-pinned.txt` pin `mypy==2.4.0`,
  `coverage==7.16.2` (+ transitive additions); `tests.test_dependency_pins`
  passes.
- `scripts/gates.sh` extended with `mypy` and `coverage threshold (85% branch)`
  checks, honest `record_na` in the no-Python branch, and
  `"typecheck": check_status("mypy")`.

## Bifrost reconciliation

- `sha256sum -c deploy/bifrost-ops/SHA256SUMS` (from repo root) — all 7 entries
  OK. Manifest paths are repo-root-relative.
- Installed copies under `/usr/local/lib/company-os/bifrost-ops/` drift from
  the repo hashes. Running the pinned `ruff format` on the installed copies
  makes `backup_bifrost_state.py` and `rollback_bifrost_state.py`
  byte-identical to the repo; `bifrost_ops.py` differs only in `# nosemgrep`
  marker positioning around `urllib.request.urlopen` — formatting/annotation
  only, semantically equivalent.
- `deploy/bifrost-ops/install.sh` verified: refuses to install when the source
  differs from the manifest, re-hashes installed files, installs sudoers last.
  Drift closes only via a separately authorized reinstall.
- `visudo -cf deploy/sudoers.d/company-os-bifrost-ops` → parsed OK;
  `bash -n` on installer/dispatcher → OK.
- Bifrost unit tests: 112 tests OK
  (`tests.test_bifrost_ops*`, backup/rollback, restore-config, admin
  provisioning, transport).

## Live MCP

- `tests.test_mcp_regression` default run: 4 skipped with precise reasons
  (opt-in via `COMPANY_OS_LIVE_MCP=1`; no live calls in the hermetic suite).
- `tools/live_mcp_check.py` → rc=2 **BLOCKED**: gbrain cannot accept a second
  stdio connection while another `gbrain serve` (PID 224544) holds the
  single-writer PGLite datastore. Penpot is connected. A live holder makes the
  probe inconclusive, not a Company OS failure.

## Phase 8 blockers (owner action required)

| Blocker | Owner action |
| --- | --- |
| Cloudflare credentials absent (`CLOUDFLARE_API_TOKEN`) | provide token to enable site deploy |
| PostHog credentials absent (`POSTHOG_KEY`) | provide key; site otherwise ships inert analytics |
| Canonical project domain unresolved | supply domain (or Cloudflare API access) for live site verification |
| Live analytics configuration | supply domain + PostHog key to verify live analytics |

## Other outstanding items

- Worktree is dirty and spans area beyond this audit (pre-existing user/Bifrost
  work). Commit the tested tree so CI covers the evaluated SHA and uncommitted
  changes stop blocking release eligibility.
- No authoritative `BUILD 0/46` manifest file exists in the repository; the
  roadmap was supplied as prose only. Roadmap entries/ticks were not
  reconstructed or altered.
- Sudoers content hash is unreadable unprivileged; only `sudo -n` scope is
  observable.
- Installed Bifrost copies cannot be reconciled without an authorized reinstall.

## Decision

**NOT RELEASE-CERTIFIED.** All hermetic checks pass on the tested tree, but
release certification is blocked by (1) a dirty worktree — the tested SHA does
not contain the changes and no CI covers them — and (2) Phase 8 `BLOCKED` on
absent Cloudflare/PostHog credentials and an unresolved canonical domain.
Phase 8 `BLOCKED` is not `PASS`; unit-test success does not convert it.
