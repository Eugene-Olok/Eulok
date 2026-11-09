# Company OS — One-Run Completion Evidence (2026-10-19)

Status: **NOT RELEASE-CERTIFIED**

- Timestamp: 2026-10-19 (Africa/Kampala, UTC+3)
- HEAD: `fbed5fd91d5afa61d6693014fd7ca3d056b9885f`
- Branch: `fix/business-evidence-placeholder-guard` (tracks `origin/…`, 0 ahead / 0 behind)
- Remote: `https://github.com/Eugene-Olok/company-os.git`
- `origin/main`: `bba862d68803b113b51e6331bb05c70351c5ba6a`
- Worktree: **dirty** (158 entries: 128 modified tracked files, 30 untracked paths). Uncommitted changes are not release evidence.

Supersedes nothing; preserves `evidence/runs/inspection-2026-10-19.md` and
`evidence/runs/audit-verification-2026-10-19.md`.

## Gate and test results (exact tree)

| Check | Result | Evidence |
| --- | --- | --- |
| `./scripts/gates.sh` | **PASS** — 33/33, 0 failed | `artifacts/gate-evidence.json` |
| unit tests | **PASS** — 1838 tests, 0 failures, 7 skipped | gate log |
| mypy `--strict` | **PASS** — 40 source files | `mypy.ini` |
| coverage (branch) | **PASS** — 85% ≥ 85% | `artifacts/coverage.json` |
| ruff / `ruff format --check .` | **PASS** — 262 files already formatted | gate evidence |
| semgrep `--config=auto --error` | **PASS** — 0 findings | gate evidence |
| gitleaks / trivy fs / osv-scanner | **PASS** | gate evidence |
| shellcheck / bash syntax / actionlint | **PASS** | gate evidence |
| GitHub Actions syntax | **PASS** | gate evidence |
| `./scripts/gates-phase8.sh` | **BLOCKED** — 0 failed, 4 blocked, 1838 tests | `artifacts/gate-evidence-phase8.json` |

Release eligibility reported by the gate: `BLOCKED — worktree is dirty;
uncommitted changes are not release evidence`.

Remote PR #10 (`fix/business-evidence-placeholder-guard`) is **OPEN**,
`MERGEABLE`/`CLEAN` at `fbed5fd`, with green remote CI
(`deterministic-gates`, `phase8-gates` `Phase 8 Deterministic Gate`; the
`Deploy Site (Cloudflare Pages)` job is SKIPPED). No remote CI covers the
current dirty tree.

Local and CI use the identical entrypoints (`./scripts/gates.sh`,
`./scripts/gates-phase8.sh`), so the local 33/33 pass and CI run the same
deterministic checks.

## Material defects fixed

### This run
- **Fail-open exclusions presence check** — `company_os/business/workflow.py`.
  `validate_scope` / `validate_proposal` used `if not <field>:`, so a malformed
  non-iterable value (`exclusions=123`) passed as a declared list. Added
  `_has_declaration()` (via `_as_entries`, so scalars/mappings/non-iterables
  fail closed) and routed both checks through it. `("NONE",)` and a scalar
  `"NONE"` (one entry) remain valid — "no exclusions" is a documented policy
  decision. Regression tests added (`RequiredListSubstanceTests`).

### Carried on this branch (verified present in the tested tree)
- Business evidence hardening: NFKC normalisation, `Cf`/`Cc` stripping,
  edge-punctuation stripping, expanded placeholder set, scalar `UNKNOWN`
  blocking, required-list substance checks, ASCII-only `_MONEY_RE` money
  parsing (rejects non-ASCII digits, underscores, signs, exponents),
  non-finite/negative rejection, numeric invoice/payment comparison.
- Runtime enum-type guards (`_invalid_enum`) across every validator, closing a
  plain-string status bypass.
- mypy `--strict` gate introduced; 73 errors fixed across `company_os` +
  `products`, including a real annotation bug in
  `products/reconciliation_agent/conformance_probe.py`
  (`_probe_approval_binding` annotated `dict`, should be `bool | None`).
- Coverage gate introduced (85% branch).
- `requirements-dev.txt` / `requirements-pinned.txt` pin `mypy==2.4.0`,
  `coverage==7.16.2` (+ transitive). `httpx==0.28.1` is a declared runtime
  dependency; `httpx2==2.13.1` also pinned. No missing dependency.
- `scripts/gates.sh` extended with mypy + coverage threshold, honest
  `record_na` fallbacks, and `"typecheck": check_status("mypy")`.

## Regression tests added/changed this run

- `tests/test_business_workflow.py`: `test_malformed_exclusions_fail_closed`,
  `test_scalar_exclusions_string_is_one_declared_entry`,
  `test_proposal_malformed_exclusions_fail_closed`. File: 76 tests, all pass.

## Phase C — gate meaningfulness

- mypy scope: `company_os`, `products`, `tools/live_mcp_check.py`,
  `tools/gate_provenance.py`; strict. `ignore_missing_imports = True` is a
  documented concession to untyped third-party stubs only.
- Coverage scope: `--source=company_os,products` (the production packages).
  Threshold 85% is enforced, not lowered. Critical modules measured 75–99%
  (business/domain 99%, business/workflow 89%, architecture/conformance 97%,
  reconciliation workflow 95%, control_plane/boundary 78%, zoho_books 77%,
  zoho_crm 75%).
- Unknown/absent external integrations fail closed: langfuse is `SKIP`
  (recorded, never PASS) in hermetic mode, `FAIL` when required, `FAIL` on an
  unknown mode. Architecture conformance treats BLOCKED as non-zero.
- `ruff check .` and `ruff format --check .` both enforced (no path filter).
- semgrep runs at repo scope with `--error`; secret scan covers the working
  tree; osv scans `requirements-pinned.txt`.

## Bifrost repository ↔ installed reconciliation

- `sha256sum -c deploy/bifrost-ops/SHA256SUMS` (from repo root) → **all 7 entries
  OK** (`tools/bifrost_ops.py`, `tools/backup_bifrost_state.py`,
  `tools/rollback_bifrost_state.py`, two `evidence/runs/bifrost-seeds/*.json`,
  `deploy/sbin/company-os-bifrost-ops`, `deploy/sudoers.d/company-os-bifrost-ops`).
- Installed copies `/usr/local/lib/company-os/bifrost-ops/{bifrost_ops,
  backup_bifrost_state,rollback_bifrost_state}.py` differ from repo hashes.
  **Root cause: cosmetic only.** AST comparison
  (`ast.dump(ast.parse(...))`) is **identical** for all three files — the drift
  is comments / formatting / `# nosemgrep` marker placement, no behavioural
  difference.
- Installed dispatcher `/usr/local/sbin/company-os-bifrost-ops` is root-owned,
  `0755`, root-owned code dir; module/seed dirs root-owned. Dispatcher is a
  strict subcommand allowlist (`inspect|status|backup|seed step1|seed step2|
  rollback`) with arity checks and trusted-path verification.
- `deploy/sudoers.d/company-os-bifrost-ops`: `visudo -cf` → parsed OK. Narrow,
  token-for-token NOPASSWD grants only (no wildcard, no argument passthrough).
  Installed copy is only readable with an interactive password (BLOCKED, as
  before) — no privilege escalation was attempted.
- Bifrost tests: 112 tests OK. Installer not run; no sudo/backup/seed/rollback/
  restart performed.

## GBrain / MCP status

- PID 224544 **alive**: `bun /home/genie/.bun/bin/gbrain serve`, owner `genie`,
  parent 224499 = `opencode` (node `opencode-ai`). It is the MCP stdio server
  spawned by the running agent host — a legitimate active writer, not a stale
  or leaked lock, and not a Company OS process.
- Root cause of the standalone check returning BLOCKED: GBrain's PGLite store
  is single-writer; a second stdio server cannot open it. This is inherent, not
  a repository bug. `tools/live_mcp_check.py` correctly classifies it as
  `BLOCKED` (exit 2) rather than `FAIL` — single-writer safety is preserved.
- Default suite: `tests.test_mcp_regression` = 4 skips with explicit reasons
  (opt-in `COMPANY_OS_LIVE_MCP=1`). Standalone probe: rc=2 BLOCKED (holder
  224544; Penpot connected). No process was killed, no lock removed.
- Only safe resolution: the owner stops/restarts the opencode-spawned `gbrain
  serve` (which will disconnect the brain for this session) or runs the probe
  through that already-connected server. Left as an owner action.

## Zoho CRM / Books status

- Offline: `tests.test_zoho_crm` + `tests.test_zoho_books` = 57 tests OK.
- `test_deal_never_authorizes_execution` asserts a Deal stage is never
  `Closed Won` — CRM cannot independently authorize engagement. Lifecycle
  authority remains filesystem/Git.
- OAuth refresh, redaction, HTTPS, retry/backoff and decimal handling are
  covered offline. No Zoho credentials in ambient env or repo; no live write/
  read-back/reconciliation performed. **Live Zoho verification: BLOCKED**
  (credentials absent; synthetic live writes are separately authorized).

## Phase 8 blockers (exact)

From `scripts/gates-phase8.sh` (authoritative), all `BLOCKED`:

1. `cloudflare credentials` — `CLOUDFLARE_API_TOKEN` not set; site deploy cannot run.
2. `posthog credentials` — `POSTHOG_KEY` not set; site ships with inert analytics.
3. `live site verification` — canonical project domain unresolvable without Cloudflare.
4. `live analytics configuration` — canonical project domain unresolvable without Cloudflare.

No repo secrets/variables are configured (`gh secret list` / `gh variable list`
return none) and no credentials are present locally. All 16 non-external Phase 8
checks PASS.

## Roadmap / manifest

- No `BUILD 0/46` manifest exists in the repository (only reference is prose in
  prior reports). **Manifest unavailable.** The 46 entries were not
  reconstructed and no completion ticks were set or cleared — fabricating them
  is prohibited by `AGENTS.md` and the directive. Several BUILD items (domain
  bought, business email, EFRIS route, offers sent) are business/operational
  outcomes with no in-repo evidence and remain **UNVERIFIED**.

## Unverified / human actions required

| Item | Level | Action |
| --- | --- | --- |
| Phase 8 (4 checks) | BLOCKED | Provide `CLOUDFLARE_API_TOKEN` (+ `CLOUDFLARE_PAGES_PROJECT`/domain) and `POSTHOG_KEY`+`POSTHOG_HOST`, then re-run `./scripts/gates-phase8.sh`. |
| Release certification | BLOCKED | Commit the tested tree so CI covers the exact SHA, then merge PR #10. |
| Bifrost installed drift | informational | Cosmetic only (AST-identical). A reinstall would normalise bytes; requires authorization. |
| Bifrost sudoers verification | BLOCKED | `sudo -n cat /etc/sudoers.d/company-os-bifrost-ops` needs a password. |
| Live MCP | BLOCKED | Stop/restart opencode's `gbrain serve` (PID 224544) or run the probe via the connected server. |
| Live Zoho verification | BLOCKED | Provide Zoho OAuth credentials through the protected loader; live writes need separate authorization. |
| BUILD 0/46 | UNAVAILABLE | Supply the actual manifest file. |

## Release decision

**NOT RELEASE-CERTIFIED.** Reason: (1) the tested tree is dirty, so no CI
covers the exact evaluated SHA; (2) Phase 8 is `BLOCKED` on absent
Cloudflare/PostHog credentials and an unresolved canonical domain. Phase 8
`BLOCKED` is not `PASS`, and a local gate pass is not CI validation of a release
commit. All independent repository-level work was completed; no production
mutations, commits, pushes, merges, or deploys were performed.
