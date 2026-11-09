# Branch Audit & Phase 9 Reconciliation — 2026-10-16

Audit date: 2026-10-16 (this session)
Auditor: OpenCode agent (principal-engineer session, autonomous)
Scope: every local and remote branch in `Eugene-Olok/company-os`
Baseline: `main` = `e59793373693df41bf0811de878445837fd6bbdb` (= `origin/main`, in sync)
Active branch: `reconcile/phase9-integration` = `5f33cd8`

> Every claim below is backed by a deterministic git command recorded in this
> document. No branch was deleted until its content or commits were
> independently verified as already present in mainline. No force-push, no
> remote deletion, no history rewrite, no object pruning was performed.

---

## 1. History model (established facts)

- `main` history = six squash/merge commits from reviewed PRs:
  `56971cc (#1 phase7)`, `f478cfd (#2 phase8)`, `0f00946 (#3 zoho-crm)`,
  `93e9071 (#4 zoho-books)`, `37a2df1 (#7 phase9)`, `e597933 (#8 phase8 closure)`.
- The feature branches are a parallel, unsquashed history line. Merge-base of
  `main` and `feat/company-os-phase9` = `93e90714205fdcc7c06c17c210effe8a5820ced1`.
- Therefore branch SHAs differ from mainline even where content is identical;
  "not an ancestor" alone says nothing about integration. Every deletion
  decision below uses content-level verification instead.

## 2. Content verification method (three independent proofs per branch)

1. **Added files** — `git diff --diff-filter=A --name-only main <branch>`:
   files the branch has that main lacks. Result for **every** branch: **0**.
2. **Net-positive files** — `git diff main <branch> --numstat | awk '$1-$2>0'`:
   files where the branch version is longer than main's. Result for **every**
   branch: **0** — main's version of every touched file is equal or longer
   (evolved superset; branch-only lines are superseded pre-hardening/pre-fix
   formulations, verified by symbol-level inspection for the phase9 set).
3. **Squash-diff equivalence** — for PR-merged branches, the branch delta from
   its merge-base must byte-match the squash commit's diff:

   | Branch | merge-base | branch delta | squash commit | squash diff | match |
   |---|---|---|---|---|---|
   | `feat/company-os-phase7-proof` | `3553109` | 147 files, +45095 −55 | `56971cc` (#1) | 147 files, +45095 −55 | exact |
   | `feat/company-os-phase8` | `56971cc` | 33 files, +6243 −166 | `f478cfd` (#2) | 33 files, +6243 −166 | exact |
   | `feat/zoho-crm-projection` | `f478cfd` | 32 files, +5266 −12 | `0f00946` (#3) | 32 files, +5266 −12 | exact |
   | `feat/zoho-books-turnover-configuration` | `0f00946` | 5 files, +1552 | `93e9071` (#4) | 5 files, +1552 | exact |
   | `feat/company-os-phase9` | `93e9071` | 328 files, +34360 −114 | `37a2df1` (#7) | 328 files, +34360 −114 | exact |

   Nothing was dropped during any squash merge.

### 2b. Symbol-level spot check (phase9 `credential_loader.py` — the largest delta)

Phase9's version is the **older, weaker** loader (simplified docstring,
`_BWRAP_MARKER` env-var bypass). Main's version adds `default_secrets_file()`,
`_is_api_url()`, `ENDPOINT_VALIDATORS`, `CredentialError`/`UnknownCredentialCategory`/
`CredentialConflictError`, `known_categories()`, `_resolve_variable()`,
`redact_secrets()`, `_build_bwrap_command()`, `privilege_drop_available()`,
`_sandbox_privilege_prefix()`. Main's docstring (line 19) explicitly documents
**removing** the `_BWRAP_MARKER` "I am already inside bwrap" bypass as a
security hardening. Resolving the merge conflict to mainline (`--ours`) kept
the hardened superset; the discarded content is a removed vulnerability, not
lost capability. Same direction verified for the other phase9-insertion files
(`cred_wrapper.sh`: main reads categories **dynamically** vs phase9's hardcoded
list; `gates.sh`: main has the `base_url=`/hermetic-mode Langfuse fix).

## 3. Classification of every branch

### 3.1 Local branches (pre-consolidation state)

| Branch | Tip | Date | unique vs main | unique vs reconcile | Classification | Basis |
|---|---|---|---|---|---|---|
| `main` | `e597933` | 2026-10-15 | 0 | — | **AUTHORITATIVE** | PR-merged mainline, in sync with `origin/main` |
| `reconcile/phase9-integration` | `5f33cd8` | 2026-10-16 | 46 | 0 | **ACTIVE_PHASE9** | Verified superset: contains `main` entirely (`git rev-list reconcile..main` = 0) plus full side-line history, phase9 merge `e22842f`, UTC hardening `04fa72a`, test fixes `5f33cd8`. Receives Phase 9 work next. |
| `feat/company-os-phase9` | `059001c` | 2026-10-13 | 30 | 0 | **PRESERVE** | Canonical Phase 9 branch, byte-identical to `origin/feat/company-os-phase9`; content fully subsumed by `reconcile` (merge `e22842f`, squash #7 exact). Historical record — not the target for new work. |
| `feat/phase8-engineering-closure` | `880c444` | 2026-10-15 | 12 | 0 | **SAFE_TO_DELETE** | Content byte-identical to `main` (`git diff` empty); commits reachable from `reconcile` (merge `4f05788`); recoverable from `origin` at same SHA |
| `feat/design-gate2` | `059001c` | 2026-10-13 | 30 | 0 | **SAFE_TO_DELETE** | Duplicate ref: same SHA as `feat/company-os-phase9`; recoverable from `origin` |
| `docs/design-system-audit` | `c4b5e81` | 2026-10-08 | 1 | 0 | **SAFE_TO_DELETE** | Commit reachable from `reconcile` history; recoverable from `origin` |
| `feat/company-os-phase7-proof` | `6a776f3` | 2026-10-06 | 10 | 10 | **SAFE_TO_DELETE** | Squash #1 exact-match (§2); 0 added / 0 net-positive; local == origin SHA |
| `feat/company-os-phase8` | `15ed32a` | 2026-10-07 | 22 | 22 | **SAFE_TO_DELETE** | Squash #2 exact-match; 0 added / 0 net-positive; local == origin SHA |
| `feat/zoho-crm-projection` | `d9c2e4c` | 2026-10-08 | 40 | 40 | **SAFE_TO_DELETE** | Squash #3 exact-match; 0 added / 0 net-positive; local == origin SHA |
| `feat/zoho-books-turnover-configuration` | `1fc5622` | 2026-10-08 | 1 | 1 | **SAFE_TO_DELETE** | Squash #4 exact-match; 0 added / 0 net-positive; local == origin SHA |
| `feat/gbrain-memory-foundation` | `69179d5` | 2026-10-04 | 3 | 3 | **PRESERVE** | Content subsumed (0 added / 0 net-positive) **but** 2 commits (`6f1af27`, `69179d5`) exist only locally — local tip ≠ origin tip (`268a3e0`). Kept for commit-level recoverability. |
| `backup/local-main-pre-pr8-sync` | `d9314ce` | 2026-10-15 | 10 | 0 | **PRESERVE** | Backup material by naming policy; commits reachable from `reconcile` |
| `backup/local-opencode-merge` | `01225db` | 2026-10-08 | 41 | 41 | **PRESERVE** | Backup material by naming policy; content subsumed (0 added / 0 net-positive) but retained as a safety snapshot regardless |

### 3.2 Remote branches (`origin/*`)

| Remote ref | Tip | Classification | Basis |
|---|---|---|---|
| `origin/main` | `e597933` | **AUTHORITATIVE** | matches local `main` |
| `origin/feat/company-os-phase9` | `059001c` | **PRESERVE** | canonical Phase 9 record |
| `origin/feat/phase8-engineering-closure` | `880c444` | **SAFE_TO_DELETE** (remote; not actioned) | subsumed; remote deletion = a push operation, not authorized this session |
| `origin/feat/design-gate2` | `059001c` | **SAFE_TO_DELETE** (remote; not actioned) | duplicate of phase9 |
| `origin/docs/design-system-audit` | `c4b5e81` | **SAFE_TO_DELETE** (remote; not actioned) | subsumed |
| `origin/feat/company-os-phase7-proof` | `6a776f3` | **SAFE_TO_DELETE** (remote; not actioned) | subsumed (squash #1) |
| `origin/feat/company-os-phase8` | `15ed32a` | **SAFE_TO_DELETE** (remote; not actioned) | subsumed (squash #2) |
| `origin/feat/zoho-crm-projection` | `d9c2e4c` | **SAFE_TO_DELETE** (remote; not actioned) | subsumed (squash #3) |
| `origin/feat/zoho-books-turnover-configuration` | `1fc5622` | **SAFE_TO_DELETE** (remote; not actioned) | subsumed (squash #4) |
| `origin/feat/gbrain-memory-foundation` | `268a3e0` | **PRESERVE** | divergent from local (see §3.1); investigate sync before any deletion |
| `origin/feat/design-system-source-of-truth` | `c9f75c0` | **PRESERVE_INVESTIGATE** | remote-only ref; 0 added files vs main (content subsumed) but no local counterpart — left untouched pending owner decision |

## 4. Consolidation executed (this session)

Local-only. No push, no remote deletion, no force operation.

Deleted (7), each content-verified in §2 and byte-identical to its `origin`
counterpart (100% recoverable):

```
feat/phase8-engineering-closure            880c444
feat/design-gate2                          059001c
docs/design-system-audit                   c4b5e81
feat/company-os-phase7-proof               6a776f3
feat/company-os-phase8                     15ed32a
feat/zoho-crm-projection                   d9c2e4c
feat/zoho-books-turnover-configuration     1fc5622
```

Recovery for any of the above:

```
git branch --track <name> origin/<name>
```

Post-consolidation local branches (6): `main`, `reconcile/phase9-integration`
(active), `feat/company-os-phase9`, `feat/gbrain-memory-foundation`,
`backup/local-main-pre-pr8-sync`, `backup/local-opencode-merge`.

## 5. Phase 9 reconciliation status

- `feat/company-os-phase9` content is **fully integrated** into the active
  line: zero added files, zero net-positive files, squash #7 exact-match, and
  merged into `reconcile/phase9-integration` as `e22842f` with all 11
  add/add conflicts resolved to mainline after the superset proof (§2b).
- Net content of `reconcile/phase9-integration` vs `main` =
  the 11-file `datetime.UTC` modernization + external-service test-skip
  hardening (`04fa72a`) plus the environment-bound MCP test fixes
  (`5f33cd8`). Nothing else.
- Phase 9's design-system package itself is **already merged to `main`** via
  PR #7 (`37a2df1`) and re-verified: design gates GATE-1..GATE-7 +
  PENPOT-PROTOCOL-SUBGATE all PASS, governance audit PASS
  (`evidence/runs/company-os-production-closure-phase9-audit-2026-10-13.md`).
- What keeps Phase 9 the **sole active focus** is release readiness:
  release eligibility is **BLOCKED** on external prerequisites (Cloudflare API
  token, PostHog key, live deployment/analytics verification) — the correct
  fail-closed state per project policy, not unfinished engineering. See
  `docs/PROJECT_STATUS.md`.
