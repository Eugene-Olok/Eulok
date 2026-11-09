# Release eligibility — flip to PASS via broker-aware gate credential probe

- Date: 2026-10-17
- Branch: `feat/phase9-reconciliation-product`
- Change set committed: `5892d35` (`feat(secrets): broker-aware gate cred probe +
  sandbox-safe trace evidence`)
- HEAD at gate run: `dbc5398f74b764104908e7b9121800d2ba5bc3de`
- Broker: `company-os-credentials.service`, `MainPID=264720`, started
  `2026-10-17 12:36:58 EAT` (running Fix #3)

## Objective

Close the open release-eligibility item from
`evidence/runs/phase8-release-2026-10-17.md` §7: make `scripts/gates.sh` able to
resolve `creds_present` from a credentialed host run without exporting any secret
into the gate environment, so `release_eligibility` flips to `PASS` and the gate's
live-Langfuse sub-check runs (rather than SKIP).

## What changed (commit `5892d35`)

1. **Broker-aware gate credential probe** — `scripts/gates.sh` now falls back to
   the trusted broker's presence-only `check` op when its own
   `credential_loader.py check` reports MISSING (the unprivileged gate identity
   cannot read the protected file). Only `SET`/`MISSING` crosses the socket; no
   value is returned. With no broker socket (CI) the fallback is skipped and the
   hermetic SKIP path is unchanged.
2. **`cred_broker.py check`** — new CLI subcommand mirroring
   `credential_loader.py check` output (`key=value` lines), so the gate greps both
   identically. The broker server already handled `op: check`; no restart needed
   for this client-side addition.
3. **Latent gate defect fix (sandbox-safe evidence output)** —
   `tools/verify_langfuse_trace.py` wrote evidence to `--output /dev/stdout`, but
   the gate's bubblewrap `/dev` is a fresh minimal devtmpfs, so re-*opening*
   `/dev/stdout` is refused (`EACCES`). The credentialed gate path had never been
   exercised (the gate always ran hermetic). `_write_output` now honors the
   stdout sentinels (`-`, `/dev/stdout`, `/dev/fd/1`) via the inherited
   `sys.stdout`, preserving the host-side redirect the gate relies on.
4. Tests: `tests/test_cred_broker.py` (+2) and `tests/test_verify_langfuse_trace.py`
   (+3 `OutputTargetTests`). Docs: `docs/runbooks/secrets-isolation.md`.

## Definitive verification

    GATES_LANGFUSE_MODE=required ./scripts/gates.sh

- `status = PASS`, `release_eligibility = PASS`, `failed_checks = 0` (`GATES_RC=0`)
- `capabilities.langfuse = { mode: "required", credentials_present: true }`
- `[langfuse trace] PASS` — `verdict=pass`, `observations_inspected=4`, `found=True`
- unit tests `1605` OK (`skipped=5`); 30/30 checks PASS
- Evidence: `evidence/runs/gate-evidence-20261017T111422Z.json` (started
  `2026-10-17T11:14:22Z`, finished `11:25:11Z`)

Credentialed Langfuse evidence for this run:
`evidence/runs/langfuse-evidence-20261017T112511Z.json` — `verdict=pass`,
`verified=true`, `observations_inspected=4`, boundary request
`company_os.boundary.request` emitted by the run itself, trace_id
`d5c4af9b9e63f9f08701999168848bad`. Host `[REDACTED]`; key fingerprint
`pk-l...c34d` only.

## Provenance note (honesty)

The gate records `commit = dbc5398` because that was HEAD when it started. The
probe change and the `/dev/stdout` fix under test were uncommitted in the working
tree at that moment and were committed immediately afterwards as `5892d35`. The
evidence therefore reflects the `5892d35` change set labelled with its parent
`dbc5398`. Prior evidence in `evidence/runs/phase8-release-2026-10-17.md` and
`evidence/runs/langfuse-evidence-20261017T103719Z.json` (trace_id
`aa116124d4bd82aef6a9db896c5bd186`) remains valid for the deploy at `cca2950`.

## Post-hardening rerun on the committed tree

The `dbc5398`/`5892d35` mismatch above was possible because `gates.sh` recorded
`commit = git rev-parse HEAD` with no dirty-tree detection, so a gate run over a
dirty tree was labelled with its parent commit. Commit `8c4a94c`
(`feat(gates): record git worktree provenance; release eligibility requires a
clean tree`) closed that gap: `tools/gate_provenance.py` records a `worktree`
field (`clean`/`dirty`/`unknown`, fail-safe to `unknown`) and
`release_eligibility` now returns `PASS` only when `status == PASS` **and** the
live-Langfuse sub-check is `PASS` **and** the worktree is `clean`. A dirty or
indeterminate tree is no longer eligible for release, and the reason string says
why.

Rerun against the committed tree (`8c4a94c`), not a dirty working tree:

    GATES_LANGFUSE_MODE=required ./scripts/gates.sh

- `status = PASS`, `release_eligibility = PASS`, `worktree = clean`,
  `commit = 8c4a94c16e86de5ed5f13156d92bbaaada9b0ae2` (`GATES_RC=0`)
- `release_eligibility_reason = credentialed green gate on a clean worktree`
- `capabilities.langfuse = { mode: "required", credentials_present: true }`
- `[langfuse trace] PASS` — `verdict=pass`, `observations_inspected=1`
- unit tests `1632` OK (`skipped=7`); started `2026-10-17T12:12:42Z`, finished
  `12:26:02Z`; evidence `evidence/runs/gate-evidence-20261017T122602Z.json`,
  Langfuse `evidence/runs/langfuse-evidence-20261017T122602Z.json` (trace_id
  `be66b9795b55a8840a4bc01243fa1a00`)

Phase 8 rerun through the active broker against the same committed tree:

    COMPANY_OS_CRED_RUN_TIMEOUT=900 tools/secrets/cred_wrapper.sh cloudflare posthog -- ./scripts/gates-phase8.sh

- `status = PASS`, `failed=0 blocked=0 skipped=0`, `deployment = PASS`,
  `worktree = clean`, `commit = 8c4a94c`, `tests = 1632` (baseline 406), live site
  and live analytics checks PASS; evidence
  `evidence/runs/gate-evidence-phase8-20261017T123352Z.json`

Both committed-tree runs are now reproducible and their evidence is durable in
`evidence/runs/`. The mismatch can no longer recur silently.

## Final run on the release-candidate tree (`89d391d`)

After exporting the committed-tree evidence, the durable evidence exporter
(`tools/export_privileged_evidence.py`, `a14c1f9`) and its test fixture tripped
the secret scanners. The export tooling itself is not part of the release
artifact, but the gate cannot pass while a scanner is red, so the conflict was
resolved on the tree (no history rewrite):

- The exporter test carried an AWS-shaped synthetic fixture. `gitleaks`
  (`aws-access-token`, scans all 128 commits) flagged the historical commits
  that contain it, and `semgrep` — which scans config files but not `tests/` —
  flagged the literal once it was repeated in `.gitleaks.toml` comments/regex.
- Resolution (commits `7a7f0ef`, `89d391d`): the fixture is assembled at runtime
  so no literal AWS-key shape remains in the tree, and `.gitleaksignore` retires
  exactly two historical fingerprints
  (`<commit>:<file>:aws-access-token:<line>`). This is literal-free and removes
  no detection from the tree or the future — it is a fingerprint ignore-list,
  **not** a path or value allowlist, so a real secret anywhere still fires.
  `.gitleaks.toml` was restored to its original exact-value allowlist.

Verified independently before the gate: `gitleaks git` → `0` findings (128
commits), `semgrep --config=auto --error` → `0` findings (367 files).

Rerun against the committed release-candidate tree (`89d391d`):

    GATES_LANGFUSE_MODE=required ./scripts/gates.sh

- `status = PASS`, `release_eligibility = PASS`, `worktree = clean`,
  `commit = 89d391d23c39c2ee50e56f3196689339900ac744` (`GATES_RC=0`), zero failed
  checks
- `release_eligibility_reason = credentialed green gate on a clean worktree`
- `[langfuse trace] PASS`; `tests = PASS`; started `2026-10-17T13:47:01Z`,
  finished `13:59:49Z`; evidence
  `evidence/runs/gate-evidence-20261017T135949Z.json`, Langfuse
  `evidence/runs/langfuse-evidence-20261017T135949Z.json`

Phase 8 rerun through the active broker against `89d391d`:

    COMPANY_OS_CRED_RUN_TIMEOUT=900 tools/secrets/cred_wrapper.sh cloudflare posthog -- ./scripts/gates-phase8.sh

- `status = PASS`, `failed=0 blocked=0 skipped=0`, `deployment = PASS`,
  `worktree = clean`, `commit = 89d391d`, `tests = 1659` (baseline 406); live
  site + live analytics + cloudflare/posthog credentials checks PASS; evidence
  `evidence/runs/gate-evidence-phase8-20261017T140609Z.json` (deploy staging
  evidence `evidence/runs/deploy-site-evidence-20261017T140454Z.json`)

All release-gate evidence above was copied into `evidence/runs/` only via the
approved exporter (secret-shape scan, atomic write, `0644`).

## Status

Release-eligibility item **closed**, and the provenance gap that made the
original labelling possible is **structurally closed** (`8c4a94c`) and
re-verified on the committed tree. No secret value was printed, copied,
committed, or transmitted; the isolation boundary (auth, lanes, allowlists,
security checks) was not weakened.
