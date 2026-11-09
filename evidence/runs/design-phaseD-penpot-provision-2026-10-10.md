# Phase D — Production target provisioning + tooling repair (2026-10-10)

Follow-up to `design-phaseD-penpot-live-verify-2026-10-10.md`. That run verified
the live plugin path against the scratch file but left the production target
uncreated ("founder Penpot-app action"). This run removes that manual step:
the Company OS production file is now created by `tools/penpot_provision.py`
over the Penpot Cloud command API, and the tooling defects that blocked it are
fixed.

No URL and no token **value** is recorded. Credentials live only in
`/home/genie/company-os/secrets/providers.env` (`0700` dir, `0600` file,
`genie:genie`, no ACL, untracked, outside the repo).

## Two tooling defects found and fixed

1. **Bare-array envelope rejected (blocked all live discovery).**
   `penpot_provision.PenpotApiClient.command` required the JSON payload to be a
   `dict`, but the live command API returns **bare arrays** for
   `get-all-projects` and `get-project-files` (verified live 2026-10-10). Every
   read therefore raised `ProvisionProtocolError`. **Fix**: `command` accepts
   object *or* array; `get_projects`/`get_files` read `data["projects"]`/
   `data["files"]` when enveloped and the bare list otherwise; `get_file`/
   `create_file` unwrap a `{"file": {...}}` envelope defensively.

2. **Broken offline selftest.**
   `_selftest` fabricated a "create" case by string-replacing bytes in the
   *request* body, which never removed the pre-seeded file, so the find path
   short-circuited and `assert out["state"] == "created"` failed. **Fix**:
   rewritten around a scripted transport that serves the real command shapes
   (bare arrays for list commands, bare objects for get/create) and a genuinely
   empty project for the create case.

A separate pre-existing test bug (`test_apply_requires_decision` never exercised
the guard because the target name was pre-seeded) was also fixed.

## New safety behavior: create-timeout reconciliation

A `create-file` that times out *after* the server may have committed is now
reconciled by discovery before any retry (`provision()` catches
`ProvisionUnreachable`, re-lists the project, and adopts a single same-named
file — aborting via `ProvisionAmbiguous` if the name now appears twice). A
blind retry is never issued, so a committed-but-unacknowledged write cannot be
duplicated. Covered by `test_create_timeout_reconciled_by_discovery` and
`test_create_timeout_still_absent_raises`.

## Live discovery (read-only), command API `https://design.penpot.app`

| command | result |
|---|---|
| `get-profile` | 200; account `3e981c57-46d6-803d-8008-bf969cceaa52`, `mcpEnabled: true` |
| `get-all-projects` | 200; `Company-Os` `52a5041f-08a1-80f1-8008-c380b5126f44`; `Drafts` `3e981c57-46d6-803d-8008-bf969d617eba` |
| `get-project-files` (Company-Os) | 200; only `Test File` `52a5041f-08a1-80f1-8008-c383654a1095` (revn 17) — **scratch, not a target** |

Dry run (`--find-or-create --name "Company OS" --project Company-Os`) →
`would_create` (no write).

## Live provisioning (authorized write)

Authorization: decision 26.16 (APPROVED 2026-10-10, contract restated verbatim,
Penpot Cloud; repo authoritative, Penpot downstream-only) plus the founder's
2026-10-10 written instruction to automate target creation rather than requiring
manual artifact creation. Passed as `--decision 26.16`.

```
target: Company OS
state: created (verified by get-file read-back)
  id=52a5041f-08a1-80f1-8008-c50e307f3ef4  revn=0  decision=26.16
```

- **Independent read-back** (`get-project-files` again) confirms the file now
  exists: `Company OS` `52a5041f-08a1-80f1-8008-c50e307f3ef4` (revn 0) alongside
  the untouched scratch `Test File`.
- **Idempotency**: an immediate re-run returned `state: found (no write)` — no
  duplicate was created.
- The scratch `Test File` was never targeted, read-back, or mutated.

## Adapter + documentation wiring

- `tools/design_adapter.py::provision_program` — the `file` step moved from
  `BLOCKED` to `READY`, naming `tools/penpot_provision.py` and its gates
  (`--decision`, non-scratch), while stating the *Plugin* API has no `createFile`.
  `tests/test_design_compiler.py::test_provision_file_is_automated` updated
  accordingly.
- `tools/penpot_plugin_codegen.py`, `docs/design/DESIGN_COMPILER.md`,
  `docs/design/PENPOT_ADAPTER_CONTRACT.md` — corrected the "file creation is a
  founder Penpot-app action" clause to distinguish the *Plugin* API (no
  `createFile`) from the *command* API (`create-file`, automated).
- `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml`,
  `docs/design/DESIGN_MANIFEST.yaml` (PEN-001),
  `docs/design/DESIGN_TOKENS.yaml` — target-file status updated to CREATED with
  the file id; the remaining founder action (MCP *connect*) is stated.

## Regression coverage

- `tests/test_penpot_provision.py` — 18 tests OK (was failing pre-change).
- `tests/test_design_compiler.py` — 60 tests OK.
- `python3 -m compileall -q company_os tools tests` — OK.
- `ruff check` on all changed Python files — OK.
- Full `unittest discover -s tests` — 966 tests, 2 errors
  (`test_zoho_crm`, `test_zoho_books`: `ModuleNotFoundError: No module named
  'httpx'`) — **pre-existing, unrelated environment gap**.

## Remaining blocker (founder action, not automatable here)

The MCP plugin binds to the **focused** file. After provisioning it still binds
the scratch `Test File` (`...c383654a1095`, revn 16) — verified by a read-only
`execute_code` probe returning `fileName: "Test File"`. To run plugin operations
against the created production file, the founder must **open the `Company OS`
file and File → MCP Server → Connect** (there is no MCP/plugin open-file or
connect method). Provisioning step is done; connection is the only manual step
left.

## Honesty

Everything above was observed live and is reproducible via the commands shown.
"created (verified by get-file read-back)" means an independent `get-file` read
matched the created id and name. The MCP plugin was **not** redirected to the
new file by this work, and nothing claims plugin operations ran against it.
