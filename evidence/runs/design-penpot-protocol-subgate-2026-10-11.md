# Design Gate: PENPOT-PROTOCOL-SUBGATE — Status Record

STATUS: PASS

**Date:** 2026-10-11
**Run by:** design-gate-verifier (deterministic)
**Doc refs:**
- Gate registry: `docs/design/DESIGN_GATES.yaml`
- Target policy: `docs/design/PENPOT_TARGETS.yaml`
- Guard: `tools/penpot_target_guard.py`
- Component contract: `docs/design/COMPONENT_SPEC.md`
- Decision 26.16 (contract restated, approved 2026-10-10): `docs/design/DESIGN_DECISIONS.md` §3
- Prior readiness: `evidence/runs/design-phaseD-penpot-readiness-2026-10-09.md` (superseded in part 2026-10-10)

## Status

Machine-readable status: **PASS** (see the `STATUS:` line above, read by
`tools/design_gate_verifier.py`). Flipped PASS on 2026-10-11. Requirements
satisfied with deterministic live evidence — see
`evidence/runs/penpot-disposable-validation-2026-10-11/` (`journal.json`,
`summary.md`, `AUTHORIZATION.md`).

### Requirements now satisfied

1. **A disposable target exists and is authorized — PASS.**
   `disposable_file_ids` in `docs/design/PENPOT_TARGETS.yaml` now lists the
   live-verified disposable file
   `52a5041f-08a1-80f1-8008-c52b2fa4c31b` ("Company OS cmd-lane validation B" —
   pre-existing disposable from the 2026-10-10 run; verified NOT the production
   file `…c50e307f3ef4` and NOT scratch `…c383654a1095`). The bucket never
   grants an executor write; only the production allow-list is writable and it
   is unchanged.

2. **The write surface is verified — PASS.** All four protocol ops were applied
   over the live MCP plugin lane on the disposable file, each with independent
   read-back matching intent:

   | op | dispatch | read-back |
   |----|----------|-----------|
   | `ensure_page` | noop-existing (page `company-os-validation` already present — idempotent, no duplicate) | page found `a5638d4c-45cd-80b5-8008-c5fd8d50d778` |
   | `create_node` | applied — board `validation.probe.frame` (1280×720) | type/width/height match |
   | `create_component` | applied — `validation.probe.component` | main instance present |
   | `create_variable` | applied — token `validation.color.probe` `#32A1CE` | name/type/value match |

   Independent verification sweep (pass=true) and idempotency re-dispatch
   (counts all 1, duplicate=false) are journaled.

3. **Failure matrix — PASS (method noted).** The plugin lane is bound to the
   currently open file and cannot be pointed at production/scratch, so those
   rows were exercised deterministically via the guard
   (`penpot_target_guard` refusal reasons: production=permitted, scratch=
   `target_denied`+`target_denied_scratch`+`target_not_allowed`, unknown=
   `target_not_allowed`+`target_project_not_allowed`). The production/scratch
   identity check is also enforced in every live dispatch (the executor refuses
   if the current file is production or scratch).

## Consequence

Subgate PASS unblocks GATE-3 (Decision Closure & Token Establishment) and its
downstream dependents. GATE-3..7 are independently gated by their own checks
and open decisions (26.1, 26.5, 26.9, 26.11) — this subgate no longer fences
them. See the gate verifier's per-gate reconciliation.

## What this subgate gates

The subgate authorizes **live writes** (structure changes, style changes,
shape creation) by an automated executor into a Penpot document. Writing into
Penpot is the single most consequential external action in the design system's
execution layer: the repository is authoritative and Penpot is downstream-only
(26.16), so an erroneously authorized write mutates a downstream artifact that
has no recovery path a deterministic gate can undo.

> The sections below that predate the flip ("Requirements for PASS (not yet
> met)", the second "Consequence" block) described the pre-2026-10-11 blocked
> state and are superseded by "STATUS: PASS" above. They are retained as an
> audit trail of the gate's history, not as current requirements.

## Check evidence (2026-10-11)

| Check | Result |
|---|---|
| `penpot_target_policy_parses` — `tools/penpot_target_guard.py` loads target policy without error | PASS (rc 0) |
| `penpot_subgate_status` — this record | PASS |

## Refusal vocabulary exercised by the guard

`target_policy_empty` would fire if the allow-list were emptied; `target_denied` /
`target_denied_scratch` for any attempt at the scratch file; `target_not_allowed`
for any unlisted id. None of these are a permission to write — they are the
fail-closed gate proving the write is refused.

## Update (2026-10-11)

- **Founder authorization recorded:** `evidence/runs/penpot-disposable-validation-2026-10-11/AUTHORIZATION.md`
  (provision + independently verify a dedicated disposable target; minimal
  reversible mutations; independent read-back; failure handling; evidence
  journaling; never mutate production or the scratch file).
- **Policy language added:** `disposable_file_ids` bucket in
  `docs/design/PENPOT_TARGETS.yaml` (+ guard `tools/penpot_target_guard.py` and
  `tests/test_penpot_target_guard.py`). The bucket never grants a write.
- **Live blocker (deterministic evidence):** no writable Penpot credential.
  `PENPOT_ACCESS_TOKEN` unset; the `PENPOT_MCP_URL` `userToken` 401s on every
  command except `get-profile`; no plugin/MCP instance attached. The validation
  run plan is staged at
  `evidence/runs/penpot-disposable-validation-2026-10-11/run-plan.md` and will be
  executed the moment a writable credential (personal access token) or a live
  plugin session on a disposable file is supplied.
- **Status unchanged: BLOCKED.** Provisioning and write-surface verification
  are prerequisite work the automation cannot mint for itself; they are not
  claimed to have happened.

## Update (2026-10-11, second pass — corrected diagnostic)

Deterministic re-diagnosis of the "no writable credential" claim above. Two
prior statements are now known to be **incorrect artifacts** and are corrected
with the evidence that replaced them:

1. **"`userToken` 401s on every command except `get-profile`; account all-zeros."**
   That result came from a **quoting bug in the throwaway token-extraction helper**
   (`/tmp/opencode/pntok.py`): it captured the value including its surrounding
   `"..."` quotes (345 chars) instead of the bare token (343 chars; sha8
   `6d1c4337`). A quote-wrapped token is not a valid credential, so Penpot
   answered `get-profile` with an anonymous placeholder profile (all-zeros id,
   `mcpEnabled: false`) and 401 on everything else. **Fixed:** the helper now
   strips quotes. Re-run with the corrected token, the command API
   `POST /api/main/methods/{get-profile,get-all-projects,get-file}` returns
   **HTTP 403 `error code: 1010`** (Cloudflare browser-signature ban applied to
   non-browser clients). That is a **reachability** block, not a token rejection;
   no Cloudflare-challenge bypass is attempted (standing boundary). The command
   lane is therefore reachability-blocked today regardless of token validity.

2. **"No live plugin/MCP session is attached (`penpot_execute_code`: 'No Penpot
   instance connected for user token')."**
   Superseded the same day. On 2026-10-11 the plugin lane DID come up — the MCP
   bridge heartbeat returned, and `penpot_execute_code` successfully enumerated
   pages and reported the connected file:
   `52a5041f-08a1-80f1-8008-c52b2fa4c31b` ("Company OS cmd-lane validation B") —
   a **previously provisioned disposable validation target** (built during the
   2026-10-10 command-lane validation), *not* the production file
   (`...c50e307f3ef4`) and *not* the scratch file (`...c383654a1095`). The owner
   confirmed the MCP is active and running. **However**, the browser then
   background-suspended the Penpot plugin tab: heartbeats dropped
   (161s → 525s) and focus attempts did not revive them, so the first staged
   write (op 1, `ensure_page`, guarded to refuse production/scratch) could not
   be dispatched. The plugin connection appears dropped (not merely throttled)
   and needs a **re-launch**, not focus: re-open the plugin panel / re-run the
   MCP plugin so its heartbeat re-establishes, then keep the tab in the
   foreground during the validation.

Corrected current live-blocker statement:

- **Write surface still UNVERIFIED (requirement 2 unmet).** Reachable
  candidates the moment reachability returns: command lane (Cloudflare 403 —
  blocked for non-browser clients) and plugin lane (was live on disposable
  file B; blocked by browser suspension / dropped connection).
- **A disposable target now exists** — `52a5041f-08a1-80f1-8008-c52b2fa4c31b`
  (disposable "cmd-lane validation B"), surviving from the 2026-10-10 run. It
  satisfies the "dedicated disposable target" candidate for requirement 1, but
  is **not yet recorded** in `PENPOT_TARGETS.yaml::disposable_file_ids`. Per the
  staged run plan, authorization is recorded **after** the write surface is
  verified and the ops succeed with independent read-back — not before.
- **Pending founder action (only remaining prune to PASS):** re-launch the
  Penpot MCP plugin on the open disposable file so the heartbeat re-establishes,
  and keep the Penpot tab foregrounded throughout the run; then the staged
  validation (`ensure_page` → `create_node` → `create_component` →
  `create_variable`, each guarded + idempotent + read back) is executed,
  journaled, and this gate is moved to PASS with evidence.
- **Status unchanged: BLOCKED** — the block is now precisely scoped to
  *reachability of a writable surface*; nothing else.
  *(Superseded by the third pass below — the writable surface came up and the
  run executed; status is now PASS.)*

## Update (2026-10-11, third pass — RESOLVED: PASS)

The pending founder action above was performed: the Penpot MCP plugin was
re-launched and its heartbeat re-established (a read returned the connected
file). The staged validation was then executed over the plugin lane on the
disposable file `52a5041f-08a1-80f1-8008-c52b2fa4c31b`:

- `ensure_page` → `noop-existing` (page `company-os-validation` already present;
  no duplicate);
- `create_node` → board `validation.probe.frame` (1280×720) created;
- `create_component` → `validation.probe.component` created (main instance
  present);
- `create_variable` → token `validation.color.probe` `#32A1CE` in set
  `validation-set` created;

each followed by an independent read-back matching intent, an independent
verification sweep (pass=true), and an idempotency re-dispatch (all counts 1,
duplicate=false). The production/scratch identity guard was active on every
dispatch. The verified disposable id was recorded in
`docs/design/PENPOT_TARGETS.yaml::disposable_file_ids`, and the guard's
fail-closed refusals were exercised deterministically for production/scratch/
unknown. Full record: `evidence/runs/penpot-disposable-validation-2026-10-11/`.

**STATUS: PASS.**