# Phase D — Penpot live connectivity diagnostic (2026-10-10)

Read-only. No Penpot object was created, modified, renamed, deleted, or exported.
No workspace URL or token is recorded here.

> **Corrected 2026-10-10 (later the same day).** This file first recorded a failed
> probe (`No Penpot instance connected for user token`). The Penpot instance was
> subsequently connected; the probe was re-run and **succeeded**. Results below are
> the corrected, verified outcome. The original failure line is retained under
> Method for the audit trail.

## Method

MCP diagnostic calls from the OpenCode session against the configured remote
Penpot MCP server.

| Call | Result |
|---|---|
| `penpot_high_level_overview` | **OK** |
| `penpot_penpot_api_info(type="Penpot")` | **OK** |
| `penpot_penpot_api_info(type="File")` | **OK** |
| `penpot_execute_code` (read-only probe) | **OK** — `{ serverVersion: "2.18.3", fileId: "52a5041f-08a1-80f1-8008-c383654a1095", fileName: "Test File", revn: 0, pageCount: 1, pages: ["Page 1"], rootChildren: 0, tokenSets: {} }` |
| `penpot_execute_code` reading `penpot.currentUser` | **FAIL** — `Permission user:read is not granted` (scope not granted to the remote session; not required for design operations) |

Historical (superseded) result: an earlier `penpot_execute_code` probe returned
`No Penpot instance connected for user token` before the plugin instance was
connected.

## Verified facts

- The Penpot MCP **server is configured and the live bridge works**: read-only
  `execute_code` returns real document metadata (Penpot 2.18.3).
- The connected instance has an **empty scratch file** focused: `"Test File"`
  (`52a5041f-08a1-80f1-8008-c383654a1095`), one page "Page 1", empty root, no token
  sets.
- **The target Company OS file is UNCONFIRMED and does not exist**; no Company OS
  Penpot file is referenced anywhere in the repository. MCP binds to the focused
  page, so the focused file is what any operation would act on.
- `user:read` is not granted, so the current user identity cannot be read via the
  plugin API (it does not block design operations).

## Blocker-ledger impact

- **BLOCKER-1** — the server-wiring claim is resolved (server configured, bridge
  works). The residual blocker is now **target selection**: the connected instance
  is an empty scratch file, not the Company OS workspace, and **PEN-001 remains
  BLOCKED** on decision 26.16. Corrected in
  `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml`.
- **BLOCKER-2** (decision 26.16; §8.5 contract unrecoverable — audit §27.A) and
  **BLOCKER-3** (22 tokens `VALID_PENDING_DECISION`) are **unchanged**.

> **Update 2026-10-10 (later the same day):** decision **26.16 was subsequently approved** —
> the founder restated the §8.5 contract **verbatim** and selected **Penpot Cloud**
> (`docs/design/DESIGN_DECISIONS.md` §3/§5 26.16). **BLOCKER-2 is therefore resolved** and
> `PENPOT_IMPLEMENTATION_MAP.yaml` readiness moved off `BLOCKED` to `PARTIAL`; PEN-001's
> governance gate is cleared. The bullets above record state at this diagnostic's run time
> and are preserved.

## Not verified / out of scope here

- No token values were approved or changed.
- No Penpot file/page/component/variable was inspected beyond the focused scratch
  file; nothing was created or modified.
- Frontend "render path" items (unloaded `Inter`, absent `og:image`/PAGE-027,
  absent favicon/icon BRAND-010) are separate, owner- or asset-gated items and are
  not Penpot-connectivity blockers.

## Next proposed Penpot operation (requires explicit authorization)

**No Penpot write is proposed.** File creation is a Penpot application action, not
an MCP/plugin operation (the plugin API exposes `createPage`, not `createFile`) —
**decision 26.16 is now approved (2026-10-10)**, so the founder can create the
Company OS file in the Penpot application and connect it via
*File → MCP Server → Connect*. Only then can read-only verification of the target
file proceed; writes remain gated on the readiness map (BLOCKER-3 exclusion: the
22 pending tokens are not modelled).
