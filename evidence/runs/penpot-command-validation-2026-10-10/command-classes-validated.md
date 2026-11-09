# Penpot Command-API Validation — Command Class Matrix

Date: 2026-10-10
Run dir: `evidence/runs/penpot-command-validation-2026-10-10/`
Disposable file B: `52a5041f-08a1-80f1-8008-c52b2fa4c31b` (revn 0 at creation)
Policy: `targets.disposable.yaml` (production `52a5041f-08a1-80f1-8008-c50e307f3ef4` and
scratch `52a5041f-08a1-80f1-8008-c383654a1095` DENIED by id and name).
Transport: JSON `POST /api/main/methods/update-file` + `get-file`, `Authorization: Token`.

Every mutation class below was applied **live** to disposable B and read back via
`get-file`, with independent verification of the persisted state. No production or
scratch file was ever written. All writes used `revn` read from the current file
(the pre-write read; a write with a stale `revn` is silently dropped by the server
— the runtime always re-reads).

## Validated command classes (full matrix)

| Class | Command changes | Persists | Verified |
| --- | --- | --- | --- |
| create_page | `add-page` + 3× `set-plugin-data` (objectType `page`) | pagesIndex entry + page pluginData | revn 29-30, read-back page found |
| create_variable | `set-token-set` (ensure set, empty tokens) + `set-token` (one token) | tokensLib DTCG tree | revn 30-31 |
| create_node | `add-obj` (frame) + 3× `set-plugin-data` (objectType `shape`) | page objects + shape pluginData | revn 31-32/36 |
| create_component | `add-obj` (main instance) + `add-component` + `set-plugin-data` (objectType `component`) | components map + component pluginData | revn 32-33/37 |
| del_node | `del-obj` (with `page-id`) | object removed from page | revn 23-24 |
| del_page | `del-page` | page removed from pagesIndex | verified |
| del_component (soft) | `del-component` (no extra flag) | component marked `deleted=True`, recoverable | revn 23 |
| del_component (hard) | `purge-component` | component removed from components map | revn 27-28 |

## Critical scoping rules (all discovered live)

1. **Page-scoped plugin-data requires `objectId` = physical page id.** `pageId`-only
   set-plugin-data (variant B) is silently dropped; `objectId` (variant A) and
   `objectId`+`pageId` (variant C) persist.
2. **Shape-scoped plugin-data requires BOTH `pageId` and `objectId`** = physical page
   id + shape id. Omitting `page-id` fails schema validation (`[:page-id]` missing).
3. **Component-scoped plugin-data requires `objectId`** = component id.
4. **File-scoped plugin-data persists with no id.**
5. **`add-obj` requires `page-id`.** Without it the server accepts the change but
   silently no-ops (no error, nothing persists). This is the killer silent-failure
   trap: OpenAPI marks `page-id` optional, the processor routes on it.
6. **`add-obj` persists under the *change's* `id` field, not `obj.id`.**
   `process-change :add-obj` → `add-shape` assocs `:id` from the change's `id`
   (`app.common.types.shape-tree/add-shape`), overwriting `obj.id`. The runtime must
   emit `change.id == obj.id == objectId == main-instance-id` so all references agree.
7. **`add-page` accepts a client-generated `id`** and pins the physical page id so
   downstream stamps (`objectId`) and `add-obj` (`page-id`) can be emitted in the same
   transaction and resolve deterministically.
8. **Token set ids (`set-token-set`, `set-token`) must be dashed UUID strings.**
   A 32-hex (non-dashed) id is rejected (`:schema :app.common.schema/uuid`).

## Token write path (`create_variable`)

- `set-tokens-lib` (whole-lib replace) → **HTTP 500 server error** (partial state
  `{"Company OS": {}}` written). Avoid; do not use.
- `set-token-set` with a non-empty `tokens` map over JSON → **HTTP 400**: the JSON
  decoder keywordizes keys (`:command-lane-validation` key fails `:string` schema)
  and token values must be actual `Token` records (`make-token`), not raw maps.
- **Working path (validated):**
  1. `set-token-set` with `id` (dashed uuid) + `attrs {id, name, tokens: {}}` to
     ensure the set exists (idempotent under `add-set`/`update-set`).
  2. `set-token` with `set-id`, `token-id` (dashed uuid), and `attrs {id, name, type,
     value, description, modified-at}`. `value` is the raw DTCG value (e.g. `#151515`).
  The server folds the token into the nested DTCG tree and read-back returns
  `{"$value", "$type", "$description"}`.
- **Read-back trick:** store the full declared-effects JSON in `description`; it
  round-trips verbatim, giving lossless comparator fields even for type/value.
- Token name pattern (DTCG): `^[a-zA-Z0-9_-][a-zA-Z0-9$_-]*(\.[a-zA-Z0-9$_-]+)*$`.

## Component delete semantics

- `del-component` **without** `skip-undelete?` only **marks** the component deleted
  (`deleted=True`, loads main-instance objects into the component for recovery) —
  it stays in `components`. This is recoverable soft-delete.
- Hard delete must use **`purge-component`** (dissocs from `:components`; validated
  reliably). The schema also lists `del-component` with `skip-undelete?` but the
  `?`-suffixed key round-trips unreliably through the JSON key transform; `purge-component`
  is the deterministic choice.

## Side-effects of full surrogate validation

All probes ran on file B. Leftover disposable artifacts used as evidence:
- `colors-05` (logical page `05-semantic/colors`) with `btn-match`/`MI-match` frames and
  `Company OS` token set with `action.primary` token (`#151515`, effects JSON in description).
- A `del-component`-soft-deleted component (`deleted=True`) intentionally retained to
  prove soft-delete semantics, then purged.

## Constraints honored

- update-file schema remains INTERNAL/UNDOCUMENTED/UNVERIFIED per founder Option 1.
- No secrets logged; ids above are not secrets.
- No production/scratch write.

## Evidence files

- `probe-add-page.json` — first (superseded) page probe on disposable A.
- `targets.disposable.yaml` — current policy (server + allowed/denied id lists).
- `command-classes-validated.md` — this matrix.
- Validation driver scripts: `/tmp/valid_*.py` (not committed; logic is baked into the
  runtime rewrite + its offline tests).