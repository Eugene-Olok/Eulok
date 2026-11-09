# Penpot Disposable-Validation — Run Plan (staged)

**Date:** 2026-10-11
**Status of this file:** EXECUTED — see `journal.json` and `summary.md` in this
directory. **Lane deviation (recorded honestly):** the plan staged the command
API lane (`/api/main/methods/update-file` + `get-file`); the command lane is
Cloudflare reachability-blocked (HTTP 403 error 1010) as of 2026-10-11, so the
run executed over the Penpot MCP **plugin lane** on the pre-existing disposable
target (`52a5041f-08a1-80f1-8008-c52b2fa4c31b`, "Company OS cmd-lane validation
B"). Protocol semantics, guard, and fail-closed policy unchanged; guard-obtained
failure-matrix refusals exercised deterministically (see summary.md).
**Authorization:** `AUTHORIZATION.md` (same directory) + decision 26.16.
**Lane:** Penpot MCP plugin lane (live session); the command API lane
(`/api/main/methods/update-file` + `get-file`) proven live for `ensure_page` on
2026-10-10 remains reachability-blocked on 2026-10-11.

## Blocker status (resolved 2026-10-11, second pass)

- Original stated blocker: `PENPOT_ACCESS_TOKEN` must be present, or a live
  plugin/MCP session must be attached to a disposable file.
- Correction: the earlier "MCP `userToken` returns HTTP 401 on every command
  except `get-profile`" claim was a **quoting artifact** in the throwaway
  token-helper (quote-wrapped token, 345 chars vs the true 343). With the
  corrected token, the command API returns HTTP 403 `error code: 1010`
  (Cloudflare browser-signature ban; no bypass attempted). Resolution: the
  founder confirmed the MCP plugin is active, and the run executed over the
  **plugin lane** on disposable file B (see `journal.json`/`summary.md`).

## Step 1 — Provision a dedicated disposable target (command API)

Using `tools/penpot_provision.py`:

```bash
PENPOT_ACCESS_TOKEN=<token> python3 tools/penpot_provision.py \
  --find-or-create --name "Company OS disposable validation (2026-10-11)" \
  --project "Company-Os" --apply \
  --decision "26.16 + evidence/runs/penpot-disposable-validation-2026-10-11/AUTHORIZATION.md"
```

Acceptance (fail-closed): the reported `id` is read back by an independent
`get-file` and the `name`/`revn` match. The created id is verified NOT equal to
the production file `52a5041f-08a1-80f1-8008-c50e307f3ef4` and NOT equal to the
scratch file `52a5041f-08a1-80f1-8008-c383654a1095`.

- Record the verified id in `PENPOT_TARGETS.yaml::disposable_file_ids`.
- Write the scoped jail policy `targets.disposable.yaml` (this directory):
  `allowed_file_ids = [<new id>]`, `allowed_project_ids = [Company-Os]`,
  `denied_file_ids = [production, scratch]`,
  `denied_names = [Test File, Company OS]`, `require_project: true`.

## Step 2 — Minimal reversible mutations (command lane)

Using `tools/penpot_command_runtime.py::PenpotCommandProvider` against the
new disposable file, with the jail policy from Step 1 as the guard. One op per
dispatch; every dispatch followed by an independent read-back that must match
the declared intent (`op_id` + `target` + `fields`). Deterministic dashed ids
guarantee re-dispatch converges (no duplicates).

| # | kind | target / declared effects |
|---|------|---------------------------|
| 1 | `ensure_page` | `page_id: "Company OS validation"`, `name: "Company OS validation"` |
| 2 | `create_node` | `name: "V board (frame)"`, effects `{type: frame, width: 1280, height: 720}` — validates the frame add-obj body (the only body proven live as of 2026-10-10) |
| 3 | `create_component` | `manifest_id: "validate:component"`, `name: "Validation component"`, `path: "Company OS / Validation"` |
| 4 | `create_variable` | `name: "validation.color.probe"`, effects `{type: color, value: "#112233"}` |

Per-op acceptance:
- dispatch returns `status: applied` with a `revn`;
- re-dispatch of the same op returns `status: noop` (idempotent, no duplicate);
- `read_back` returns an observation whose `op_id`, `target` and `fields` match
  the declared intent; reconciliation passes before any retry (no blind retries).

## Step 3 — Failure-handling matrix (journaled)

1. **Guard denial (production):** target `file_id = 52a5041f-…f3ef4` under the
   jail policy → refused (`target_denied`/`target_not_allowed`); no write.
2. **Guard denial (scratch):** target `file_id = …a1095` / name `Test File` →
   refused; no write.
3. **Unknown file:** dispatch/read-back targeting a nonexistent id → provider
   error classified as `ProviderError`/`ProviderTimeout(applied=None)`; no write
   is claimed.
4. **Convergence:** re-dispatch after an acknowledged write returns `noop`.

## Step 4 — Evidence journal

Committed to this directory:
- `journal.jsonl` (or `.json`): one record per step — intent hash/op_id, kind,
  dispatch outcome (`applied`/`noop`/error), read-back observation, elapsed
  wall-time, decision ref. **Never** contains the token or any secret.
- `summary.md`: commands actually run, ids actually returned, per-op results,
  pass/fail per acceptance criterion, the verifier verdict, and any residual
  unknowns (failures reported honestly, never described as passes).

## Step 5 — Subgate flip (only on full pass)

Append the run results to
`evidence/runs/design-penpot-protocol-subgate-2026-10-11.md`, set `STATUS: PASS`
only when: (1) `PENPOT_TARGETS.yaml::disposable_file_ids` lists the verified id,
and (2) the journal shows all four ops applied with matching read-backs and all
failure-matrix rows behaved as expected. Re-run
`python3 tools/design_gate_verifier.py --report` afterward.