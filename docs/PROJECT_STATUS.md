# Company OS — Project Status

Authoritative phase state and branch policy. Updated only with verified
evidence; every status claim links to a committed evidence record or a
deterministic gate run.

Last updated: 2026-10-17 (Phase 9 — release-eligibility PASS re-verified on the release-candidate tree `89d391d`)

---

## Phase state

| Phase | State | Evidence |
|---|---|---|
| Phase 7 | **CLOSED** | PR #1 (`56971cc`); `evidence/runs/PHASE7-CLOSURE-2026-10-05.md` |
| Phase 8 | **CLOSED** (re-verified 2026-10-16) | PR #2 (`f478cfd`), PR #8 (`e597933`); `evidence/runs/PHASE8-CLOSURE-2026-10-06.md`; re-verification `evidence/runs/PHASE8-CLOSURE-2026-10-16.md` (both gates: 0 failed checks at `5f33cd8`) |
| Phase 9 | **ACTIVE — sole focus** | Design-system package merged via PR #7 (`37a2df1`); governance audit `evidence/runs/company-os-production-closure-phase9-audit-2026-10-13.md` (design gates GATE-1..7 + PENPOT-PROTOCOL-SUBGATE PASS); branch reconciliation `evidence/runs/branch-audit-2026-10-16.md`; **Product 1 (Mobile-Money Reconciliation Agent) implemented** — `evidence/runs/phase9-product1-reconciliation-2026-10-16.md` (71 product tests, full suite 1489 passed, main gates PASS, Phase 8 gates `failed=0 blocked=4`); **Capabilities 5 & 6 (architecture policy + conformance gate) implemented and gate-integrated** — `evidence/runs/phase9-architecture-policy-conformance-2026-10-16.md` (Product 1 conformance PASS 17/17; full suite 1583 OK; main gates PASS `failed_checks=0`; Phase 8 `failed=0 blocked=4`); **release-eligibility PASS reached on host via broker-mediated credentials** — `evidence/runs/release-eligibility-2026-10-17.md`; re-verified green on the clean release-candidate tree `89d391d` (main gate `status=PASS`, `release_eligibility=PASS`, `worktree=clean`, 0 failed checks, Langfuse trace PASS; Phase 8 via broker `status=PASS`, `deployment=PASS`, tests 1659) — `evidence/runs/gate-evidence-20261017T135949Z.json`, `evidence/runs/gate-evidence-phase8-20261017T140609Z.json` |

### Phase 9 — what "active" means

Engineering content of Phase 9 (design-system package, manifests, tokens,
specs, validators, gates) is **merged and passing**. Product 1 (Mobile-Money
Reconciliation Agent) is **implemented and gate-verified** on
`feat/phase9-reconciliation-product` — see
`evidence/runs/phase9-product1-reconciliation-2026-10-16.md`. Release
readiness on the operator host is **fully reachable through the
broker-mediated credential path** and was exercised end-to-end on 2026-10-17
(`evidence/runs/release-eligibility-2026-10-17.md`). The three credentialed
prerequisites are:

- Cloudflare API token (site deploy + live site verification)
- PostHog key (live analytics configuration/verification)
- Credentialed Langfuse trace run (hermetic mode records explicit SKIP)

Credentials live in the host secret store and are reached **only through the
trusted broker** — never exported into the gate's own environment, never in
CI. The gate learns of availability presence-only via the broker-aware probe
delivered in commit `5892d35` (`tools/secrets/cred_broker.py check` plus a
`scripts/gates.sh` fallback). With the broker reachable, the same
deterministic gates flip `release_eligibility` from BLOCKED to **PASS on the
host with no run-time code change**. The earlier wording here ("without code
changes") was inaccurate: enabling that flip did require a one-time probe in
the gate, shipped in `5892d35`.

**Release eligibility also requires a clean worktree.** The gate records
whether the tree it ran against matched its commit (`worktree:
clean|dirty|unknown`, via `tools/gate_provenance.py`), and refuses to grant
release eligibility to anything but a clean tree. This closes a provenance
gap confirmed 2026-10-17: a credentialed gate run on an **uncommitted** tree
was recorded against its parent commit `dbc5398`, while the change that made
it pass landed later in `5892d35` (see the discrepancy note in
`evidence/runs/release-eligibility-2026-10-17.md`). `HEAD` alone cannot
distinguish "commit exactly" from "commit plus edits"; the recorded worktree
state now can.

### CI deployment blocker (documented, not hidden)

The broker-mediated path above is the **only supported deploy path**. GitHub
Actions is deliberately *not* wired to deploy: the repository holds **zero
Actions secrets** (verified 2026-10-17 via `gh secret list`), so no production
credentials ever enter GitHub. Consequently `.github/workflows/phase8.yml`'s
deploy step cannot receive `CLOUDFLARE_API_TOKEN`/`POSTHOG_KEY`; the workflow
runs the gate with `PHASE8_ALLOW_BLOCKED=1`, recording BLOCKED rather than a
false green. CI keeps running the hermetic main gate (`gates.yml`) unchanged.
This limitation is a security property, not a defect; the supported release
path is `tools/secrets/cred_wrapper.sh` on the host.

## Current branches (post-reconciliation, 2026-10-16)

| Branch | Role |
|---|---|
| `main` | Authoritative mainline (`e597933`, in sync with origin) |
| `feat/phase9-reconciliation-product` | **Active work branch — Phase 9 Product 1 (Mobile-Money Reconciliation Agent); off `d7fc123` (superset of `reconcile/phase9-integration`)** |
| `reconcile/phase9-integration` | Phase 9 integration (verified superset of main); tip `9c0c5e7` |
| `feat/gbrain-memory-foundation` | Preserved (2 local-only commits; content subsumed) |
| `backup/local-main-pre-pr8-sync`, `backup/local-opencode-merge` | Preserved safety snapshots |

Seven fully-verified redundant branches were deleted locally this session
(all byte-identical to their origin refs; recovery: `git branch --track <name>
origin/<name>`). Full audit: `evidence/runs/branch-audit-2026-10-16.md`.

## Branch policy

1. **One active branch per phase.** Work happens on the active branch listed
   above; `main` only changes through reviewed, gate-green PRs.
2. **Naming.** `feat/<phase-or-scope>` for phase work; `docs/<scope>` for
   documentation work; `reconcile/<scope>` for cross-branch integration
   work; `backup/<slug>` for safety snapshots. A `reconcile/*` branch becomes
   the phase's active branch when it holds the verified integration.
3. **Deletion requires proof, not age.** A branch may be deleted locally only
   after independent content verification that mainline holds everything it
   contains: zero added files (`git diff --diff-filter=A main <branch>`), zero
   net-positive files (`git diff main <branch> --numstat | awk '$1-$2>0'`),
   and — for squash-merged branches — exact equivalence between the branch
   delta from its merge-base and the squash commit's diff. Record the proof
   in `evidence/runs/` before deleting.
4. **Backups are never deleted** by consolidation, regardless of content
   subsumption.
5. **Branches holding local-only commits are preserved** until those commits
   are pushed or explicitly discarded by the founder.
6. **Local-only consolidation by default.** Remote branch deletion is a push
   operation and requires explicit founder authorization.
