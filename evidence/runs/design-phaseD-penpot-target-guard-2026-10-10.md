# Phase D — MCP binding investigation + fail-closed target guard (2026-10-10)

Follow-up to `design-phaseD-penpot-provision-2026-10-10.md`. Two things:

1. the MCP re-binding limitation was investigated to a decisive conclusion, and
2. a fail-closed production target guard was built and tested so that no executor
   can write to any document other than the authorized production file.

No URL and no token **value** is recorded. Credentials live only in
`/home/genie/company-os/secrets/providers.env` (untracked, outside the repo).

## 1. Why the MCP plugin cannot be programmatically rebound (proven)

Read from the official `@penpot/mcp@2.15.4` source
(`~/.npm/_npx/3c82a6444c262e31/node_modules/@penpot/mcp/`):

- The server runs locally (default host `localhost`; HTTP `4401`, WebSocket
  bridge `4402`, REPL `4403`). The **browser plugin** connects over WebSocket to
  `:4402` with `userToken` as the only routing key.
- `PluginBridge.getClientConnection()` (single-user) returns whatever plugin is
  connected; **no method takes a file parameter**.
- The plugin (`packages/plugin/src/plugin.ts`) registers its task handlers
  directly on the browser tab's `penpot` object — i.e. it operates on the tab's
  *focused* file. `execute_code` sends the code to that plugin.
- `PenpotMcpServer` exposes no open-file / switch-file / connect-file tool; the
  README §2 mandates a manual browser step (navigate → load plugin → Connect) and
  warns not to close the plugin UI.

**Conclusion (VERIFIED from source):** the MCP execution target is fixed to the
focused browser tab's file, and only a human can change it. The blocker is real,
not a configuration defect.

### Supported alternative (identified)

Penpot documents an access-token **Integrations API**
(`https://penpot.app/integrations-api`; access tokens are "an alternative login
authentication … to access Penpot's API") and the command API used by
`tools/penpot_provision.py` already talks to it. The `update-file` command
accepts a `changes` array as `application/transit+json` (`add-page`,
`set-tokens-lib`/`add-token-set`/`add-token`, `add-component`, `add-obj`, …),
which would let an executor apply the plan directly to the production file with
no browser.

## 2. Governance decision for the command-API write lane

Per founder direction 2026-10-10: the `update-file` **mutation** path uses
Penpot's internal, largely-undocumented `changes` schema and is therefore
labelled **internal / undocumented / UNVERIFIED**. It may be built and exercised
for read-back and verification, but a **separate explicit founder approval is
required before the first production write** through it. Both lanes (command-API
executor and MCP plugin) are gated by the same fail-closed target guard below.

## 3. New component: `tools/penpot_target_guard.py` (fail-closed)

A pure allow/deny gate that decides whether a concrete execution target is
permitted. A plan can never authorize its own target; that identity is external,
human-verified policy.

- Policy source: `docs/design/PENPOT_TARGETS.yaml` (version-controlled). Same
  identities are described in prose in `PENPOT_IMPLEMENTATION_MAP.yaml` and
  `DESIGN_MANIFEST.yaml` (PEN-001).
- Fail-closed rules: an empty or absent allow-list authorizes **nothing**; the
  scratch file (`Test File`, `…c383654a1095`) is **always** denied by id and by
  name; a malformed policy is an error, never a pass; `project_id` is required by
  default and must be allow-listed.
- Refusal vocabulary: `target_policy_missing`, `target_policy_empty`,
  `target_unidentified`, `target_denied`, `target_not_allowed`,
  `target_denied_scratch`, `target_project_missing`, `target_project_not_allowed`.

Wired into:

- `tools/execute_design_plan.py::preflight(..., policy=...)` and
  `execute_run(..., policy=...)` — the executor’s own gate. Without a policy the
  offline gate keeps its historical identity-presence behaviour, so offline
  callers are unaffected; every live executor passes a policy.
- `tools/execute_design_plan.py` CLI `--preflight --target-policy FILE`.
- `tools/penpot_live_runtime.py` — a non-probe run now **requires**
  `--target-policy` and refuses otherwise; the target carries `project_id` and
  the connected `file_name` so the guard also catches a scratch connection.

## 4. Latent bug fixed: `ManagedProvider._revalidate`

Adding `project_id`/`file_name` to the target exposed that
`_revalidate()` compared *every* expected-target key against the provider’s
`probe_target()` (which attests only `file_id`/`page_id`), manufacturing a false
`ProviderTargetMismatch` and blocking an otherwise-valid run. Fixed to compare
only provider-attested keys; an attested key whose value differs (including an
unexpected attested key) still mismatches. Regression test added
(`test_extra_caller_key_does_not_falsely_mismatch`).

## 5. Verification (deterministic)

```
tools/penpot_target_guard.py --selftest                         -> OK
tools/penpot_transit.py --selftest                              -> OK
python3 -m unittest tests.test_penpot_target_guard              -> 22 OK
python3 -m unittest tests.test_penpot_live_runtime              -> 13 OK
python3 -m unittest tests.test_penpot_provider                  -> 19 OK
python3 -m unittest tests.test_penpot_transit                   -> 26 OK
python3 -m unittest discover -s tests -p 'test_penpot_*.py'     -> 248 OK
python3 -m unittest tests.test_design_compiler                  -> 60 OK
python3 -m unittest discover -s tests                           -> 1017, 2 pre-existing errors
                                                                    (test_zoho_crm/test_zoho_books: No module named 'httpx')
python3 -m compileall -q company_os tools tests                 -> OK
ruff check .                                                     -> All checks passed!
```

Docs reconciled with the new reality: `docs/design/PENPOT_TARGETS.yaml` added;
`defaults.penpot_target` (`DESIGN_MANIFEST.yaml`) moved off "NOT YET CREATED" to
the created file; `PENPOT_EXECUTION_ARCHITECTURE.md` §8 corrected (the
production file exists; the plugin binds the focused tab, so MCP-against-prod
needs a manual Connect or the command-API lane).

Live policy check against the real `docs/design/PENPOT_TARGETS.yaml` (read-only,
no write):

| target | guard result |
|---|---|
| `Company OS` `…c50e307f3ef4` / `Company-Os` `…c380b5126f44` | `[]` (allowed) |
| `Test File` `…c383654a1095` | `['target_denied', 'target_denied_scratch', 'target_not_allowed']` |
| unknown file id | `['target_not_allowed']` |

## 6. Wire-format foundation for the command-API lane: `tools/penpot_transit.py`

The `update-file` command takes its `changes` array as `application/transit+json`.
`tools/penpot_transit.py` is a small dependency-free Transit-JSON codec for the
subset Penpot payloads use (maps `["^ ", …]`, keywords `~:`, symbols `~$`,
UUIDs `~u`, nil `~_`, big ints `~i`, integral floats `~f`, sets `~#set`, the
Transit string-escape rule). Keyword/Symbol/Uuid are `str` subclasses so decoded
values compare equal to plain strings. It is exercised offline against the
documented `update-file` request shape; the *schema Penpot accepts for
`changes`* remains internal/undocumented and is validated live only under the
production-write approval.

```
python3 tools/penpot_transit.py --selftest          -> OK
python3 -m unittest tests.test_penpot_transit       -> 26 OK
```

## 7. Status and next

- **VERIFIED:** the MCP limitation (source-proven), the target guard
  (deterministic tests + live policy check), and the Transit-JSON codec
  (offline tests).
- **NOT YET BUILT:** the op->change mapping and the live command-API executor
  that consume the codec. Their validation requires live `update-file` calls,
  whose schema is internal/undocumented.
- **BLOCKED (awaiting founder):** the first `update-file` mutation to the
  production file (internal/undocumented schema — separate approval required),
  and the alternative single manual MCP connect if that lane is used instead.

## Honesty

No production write occurred in this increment. The command-API write path is
labelled internal/UNVERIFIED and is not exercised live here.
