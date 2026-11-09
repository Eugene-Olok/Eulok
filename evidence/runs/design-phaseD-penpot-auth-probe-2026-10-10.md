# Phase D — Penpot auth/reachability probe (2026-10-10, later the same day)

Read-only. No Penpot object was created, modified, renamed, deleted, or exported.
No workspace URL and no token **value** is recorded here (key presence only).

## Why this file exists

`evidence/runs/design-compiler-final-report-2026-10-10.md` recorded the live
blocker as **"no `PENPOT_ACCESS_TOKEN`."** That claim is now **stale**: the token
is present in the external secrets file. This probe records the corrected fact
and the outcome of the first token-bearing read-only request, so the blocker is
described by what actually blocks it, not by an out-of-date cause.

## Method

1. **Key presence** — a name-only listing of
   `/home/genie/company-os/secrets/providers.env` (directory `700`, file `600`,
   **outside** this repository). Confirmed `PENPOT_ACCESS_TOKEN` is **present**
   and non-empty. The value was loaded into the probe process from the
   environment only (source of an `export`-style file); it was never printed,
   serialized, or written to any file.

2. **Read-only RPC probe** — a stdlib HTTP client (kept outside the repository)
   issued `GET https://design.penpot.app/api/rpc/command/get-profile` with
   `Authorization: Token <token>` (the header form documented by Penpot).

3. **MCP bridge probe** — read-only calls through the configured remote Penpot
   MCP server.

## Results

| Probe | Result |
|---|---|
| `PENPOT_ACCESS_TOKEN` key present | **YES** (non-empty) |
| RPC `get-profile` (valid `Authorization: Token`) | **HTTP 403** — `server: cloudflare`, `cf-mitigated: challenge`, `content-type: text/html` |
| `penpot_high_level_overview` | **OK** |
| `penpot_penpot_api_info(type="Penpot")`, `(type="File")` | **OK** |
| `penpot_execute_code` (read-only heartbeat probe) | **FAIL** — "The Penpot plugin tab appears to be suspended by the browser (no heartbeat for 962s).") |

The RPC 403 is a **Cloudflare browser challenge** returned to a non-browser
client. No challenge bypass, cookie extraction, or credential harvesting was
attempted, per the standing boundary.

## Corrected blocker statement

- **Token availability is NOT the blocker.** A token exists.
- **Direct RPC access is blocked** by a Cloudflare challenge on
  `design.penpot.app` for non-browser clients (no permitted bypass).
- **The sanctioned MCP path is currently blocked** because the connected Penpot
  plugin tab is suspended (no heartbeat); it needs a human to focus the tab so
  the bridge can re-establish.
- **Target selection remains the primary structural blocker**: the only reachable
  instance is the empty scratch file (`"Test File"`), not a human-verified
  Company OS workspace (see `design-phaseD-penpot-diagnostic-2026-10-10.md`).

## Blocker-ledger impact

- **BLOCKER-1** (server wiring): remains **resolved**.
- **BLOCKER-2** (decision 26.16): remains **resolved** (approved 2026-10-10).
- **BLOCKER-3** (22 `VALID_PENDING_DECISION` tokens): **unchanged**.
- Net: the live path is blocked by *reachability* (Cloudflare + suspended bridge)
  and *target selection*, not by a missing credential.

## Honesty

No Penpot mutation was performed. The token value is not recorded anywhere in
this repository. This file corrects a factual claim; it does not claim any Penpot
artefact exists or that integration has been tested.
