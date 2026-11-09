# Browser-Resilient Design Execution — Evidence Report (2026-10-10)

Branch: `feat/design-gate2` · HEAD: `efbfb8aefc9457e3275301a613ad5da915768212`
(uncommitted working tree; **nothing staged or committed**).
Governance: decision **26.16** (repo authoritative, Penpot downstream; live
writes disabled until target identification + explicit authorization).

> Every number below is from a deterministic command run this session. No result
> is estimated or model-asserted. Auto Tab Discard is left **enabled and
> untouched** — the point of this work is that its effect is now survivable, not
> that it was disabled. No live Penpot write was performed.

---

## 1. What shipped (this work package)

| Module / artifact | Role | Tests |
|---|---|---|
| `tools/penpot_provider.py` | Provider lifecycle: explicit states, session generations, bounded jittered reconnect, stale-response rejection, post-reconnect target revalidation, failure classification. | `tests/test_penpot_provider.py` — **18** |
| `tools/design_tokens_export.py` | Deterministic W3C DTCG export of **approved-only** tokens (pending excluded), with drift/conflict detection and never-silently-overwrite + backup. | `tests/test_design_tokens_export.py` — **15** |
| `tools/design_diagnostic.py` | Offline failure-class diagnostics (one most-fundamental class per run). | `tests/test_design_diagnostic.py` — **16** |
| `tools/execute_design_plan.py` | Coordinator extended: provider-availability gate before any write; mid-run drop → `UNKNOWN_OUTCOME` + halt; provider block + `session_generation` recorded. | `tests/test_penpot_resume.py` — **28** (+4) |
| `tools/penpot_run_journal.py` | Additive `provider` block (`new_journal`, `set_provider`) and per-attempt `session_generation`. | (covered by resume/journal tests) |
| `docs/design/PENPOT_EXECUTION_ARCHITECTURE.md` | **NEW** architecture of record. | — |
| `scripts/gates.sh` | Two new offline gates. | — |

## 2. Deterministic verification (this session)

| Check | Command | Result |
|---|---|---|
| Full suite | `.venv/bin/python -m unittest discover -s tests` | `Ran 978 tests in 215.262s — OK` (rc 0; was 925, +53) |
| Design/Penpot subset | 10 discover-targeted modules | `Ran 277 tests — OK` |
| Lint (repo) | `ruff check .` | `All checks passed!` |
| Byte-compile | `python -m compileall -q company_os tools tests` | OK |
| Gate syntax | `bash -n scripts/gates.sh` | OK |
| Export build (gate) | `tools/design_tokens_export.py --summary` | rc 0 — `104 approved (+22 pending excluded) · core 104 · dark 11` |
| Diagnostic (gate) | `design_diagnostic.py` | rc 0 — class `OK` (repo+schema) |

Reconnect schedule (deterministic equal-jitter; key `file-1/page-1`):

```
attempt 1: 0.842859s   attempt 2: 1.835847s   attempt 3: 3.128636s
attempt 4: 7.986966s   attempt 5: 13.329713s
```

## 3. Adversarial coverage added

Provider lifecycle: bounded reconnect → `UNAVAILABLE`; terminal non-retried
`AUTH_REQUIRED`; deterministic + bounded backoff; no auto-write on reconnect;
idempotent ensure; stale dispatch/read-back rejection; target-change refusal.

Coordinator integration: auth-required and connection-refused **block every op
before any dispatch**; a mid-run connection drop halts the run and **never marks
the dropped op `VERIFIED`**; the provider block and `session_generation` are
recorded on success.

Export: pending tokens are provably excluded (asserted against a fresh
classification), `INVALID` sources block the export, malformed files block,
output is byte-deterministic, type conflicts are refused even with `--force`.

Diagnostic: correct class for missing journal, unidentified target, absent
authorization, unsettled outcome, read-back conflict, provider
auth/disconnect/unavailable, API-unsupported, and plan cycles; provider state
takes precedence over target/authorization.

## 4. Diff hygiene

- `git diff --cached --name-only` → **empty** (nothing staged).
- `git status` → tracked-modified: `DESIGN_DECISIONS.md`, `DESIGN_MANIFEST.yaml`,
  `DESIGN_TOKENS.md`, `DESIGN_TOKENS.yaml`, `PENPOT_IMPLEMENTATION_MAP.yaml`,
  `scripts/gates.sh`. All new tools/tests/docs are untracked.
- No new tools import a network library; no credential value appears in any new
  file (the journal's secret redaction and `penpot_evidence` checks are
  unchanged and exercised).

## 5. Honest limitations

- **No live Penpot interaction** occurred. The Cloudflare challenge and the
  unidentified target still block it (26.16). The live adapter stays
  `IMPLEMENTED_NOT_INTEGRATION_TESTED`.
- `scripts/gates.sh` is not runnable end-to-end here (shellcheck/trivy/semgrep/
  gitleaks/promptfoo/langfuse not all installed); no CI claim is made beyond the
  deterministic Python/CLI checks above.
- Persisted journals redact the authorization block, so the offline diagnostic
  reports `authorization_unverified` rather than a false `AUTHORIZATION_ABSENT`;
  the live dispatch gate still enforces authorization.
- `PEN-001` (file creation) remains a founder Penpot-app action; `BLOCKER-3`
  (22 pending tokens) is a scoped exclusion, not a failure.
