# Penpot Disposable-Validation — Run Summary (2026-10-11)

Status: **PASS** — all four protocol ops applied on a dedicated disposable
target with independent read-back; re-dispatch converges to no-op; guard
denials for production/scratch/unknown exercised. No production write; no
scratch write; no secret serialized.

## Reference

- Plan: `run-plan.md` (this directory)
- Authorization: `AUTHORIZATION.md` (this directory) + decision 26.16
- Journal: `journal.json` (this directory)
- Scoped jail policy: `targets.disposable.yaml` (this directory)
- Subgate record: `evidence/runs/design-penpot-protocol-subgate-2026-10-11.md`
- Policy: `docs/design/PENPOT_TARGETS.yaml` (disposable bucket updated)

## Lane — deviation from plan, recorded honestly

The run-plan staged the command API lane
(`/api/main/methods/update-file` + `get-file`). The command lane is
**reachability-blocked as of 2026-10-11**: with the corrected personal access
token (343 chars; helper quote bug fixed), `get-profile`, `get-all-projects`
and `get-file` all return **HTTP 403 `error code: 1010`** — a Cloudflare
browser-signature ban applied to non-browser clients. No challenge bypass is
attempted (standing boundary). The founder confirmed the Penpot MCP plugin is
active on the file, so the validation executed over the **plugin lane** (the
sanctioned writable surface) instead. This is a transport deviation only; the
protocol semantics, the guard, and the fail-closed policy are unchanged.

Because the plugin lane is bound to the currently-open file (and cannot be
bound to production/scratch), the failure-matrix rows for production/scratch
were exercised deterministically against the guard and policy
(`tools/penpot_target_guard.py check_target`), which returned the expected
refusals. Two policies were checked:

Under the **production** policy (`docs/design/PENPOT_TARGETS.yaml`):

| target | refusals |
|---|---|
| production file | (permitted — allow-list unchanged) |
| scratch `Test File` | `target_denied`, `target_denied_scratch`, `target_not_allowed` |
| disposable B (as executor target) | `target_not_allowed` (never writable here) |
| unknown id / unknown project | `target_not_allowed`, `target_project_not_allowed` |

Under the **scoped jail policy** (`targets.disposable.yaml`, this directory):

| target | refusals |
|---|---|
| disposable B | (permitted — sole allowed file) |
| production file | `target_denied`, `target_denied_scratch`, `target_not_allowed` |
| scratch `Test File` | `target_denied`, `target_denied_scratch`, `target_not_allowed` |
| unknown id | `target_not_allowed`, `target_project_missing` |

## Target

Disposable file **`52a5041f-08a1-80f1-8008-c52b2fa4c31b`** —
"Company OS cmd-lane validation B". Pre-existing disposable target from the
2026-10-10 command-lane validation run; verified it is NOT the production file
(`…c50e307f3ef4`) and NOT the scratch file (`…c383654a1095`). Recorded in
`PENPOT_TARGETS.yaml::disposable_file_ids`.

## Ops executed (plugin lane, `penpot_execute_code`)

| # | kind | dispatch | independent read-back |
|---|------|----------|----------------------|
| 1 | `ensure_page` | `noop-existing` (page `company-os-validation` already present; no duplicate created) | page found: `a5638d4c-45cd-80b5-8008-c5fd8d50d778` |
| 2 | `create_node` | `applied` — board `validation.probe.frame` `9e3b270f-68c8-80f8-8008-c6012508bb08` | board type, 1280×720 match |
| 3 | `create_component` | `applied` — component `validation.probe.component` `9e3b270f-68c8-80f8-8008-c601316a17ad` | main instance `…6013168bf9e` present |
| 4 | `create_variable` | `applied` — token `validation.color.probe` `#32A1CE` in set `validation-set` | token name/type/value match |

Plus independent verification sweep (pass=true: page, frame 1280×720 with 1
child, component + main instance, token value `#32A1CE`) and idempotency
re-dispatch (frameCount=1, componentCount=1, tokenSetCount=1, tokenCount=1,
rectCountInFrame=1, duplicate=false).

## Acceptance criteria

- Disposable target exists and is dedicated: **PASS** (file B; not production,
  not scratch).
- All four ops applied with matching read-back: **PASS**.
- Idempotent re-dispatch (no duplicates): **PASS**.
- Guard denials exercised: **PASS** (see matrix above).
- Production write allow-list unchanged: **PASS** (`allowed_file_ids`
  untouched; disposable recorded in a purpose-scoped, never-writable bucket).
- Secrets: none serialized anywhere. **PASS**.

## Residual unknowns (honest)

- `create_variable` read-back shows `resolved: null` — expected for a fresh
  token; no reference chain is asserted, so `resolvedValue` being unset is
  normal and is not treated as a failure.
- The command API lane remains Cloudflare-reachability-blocked (HTTP 403/1010);
  the plugin lane is the live sanctioned writes surface for now.
- The plugin lane requires the Penpot browser tab to be awake (heartbeat); a
  background-suspended tab will block writes until focus/reload.