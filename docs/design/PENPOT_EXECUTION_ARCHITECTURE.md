# Penpot Execution Architecture — Browser-Lifecycle Resilience

**Status:** implemented (offline-verified) · **Decision:** 26.16 · **Date:** 2026-10-10

This document describes how Company OS executes a compiled design plan against
Penpot without being broken by ordinary browser-tab lifecycle events (e.g.
Firefox *Auto Tab Discard*). It is the durable architecture behind the
`/browse`-based adapter; it does **not** claim any live-Penpot write has been
performed (the live target remains unidentified and live writes stay disabled).

## 1. Principle

> The repository is authoritative. Penpot is downstream. Models propose;
> deterministic systems decide.

A browser tab is not a reliable process. The tab, its MCP plugin connection, and
the network in front of Penpot can disappear at any moment — including *between*
sending a mutation and learning whether it landed. The architecture therefore
makes every execution **durable, resumable, observable, and safe under
disconnection**, rather than trying to keep the tab alive. Auto Tab Discard is
left enabled and untouched.

## 2. Components

| Component | File | Responsibility |
|---|---|---|
| Provider lifecycle | `tools/penpot_provider.py` | Wrap a raw provider with explicit connection state, session generations, bounded reconnect with jittered backoff, stale-response rejection, and post-reconnect target revalidation. |
| Run journal | `tools/penpot_run_journal.py` | Atomic, checksummed, schema-versioned record of every operation, its intent, attempts, and provider snapshot. Fail-closed on corruption. |
| Coordinator | `tools/execute_design_plan.py` | Drive ops through the journal; gate on provider availability; halt (never guess) when the connection drops mid-run; reconcile from an independent read-back. |
| DTCG export | `tools/design_tokens_export.py` | Deterministic export of approved tokens to Penpot-readable W3C DTCG JSON (approved-only; pending excluded; never silently overwritten). |
| Diagnostics | `tools/design_diagnostic.py` | Offline classification of the single most fundamental blocker from local inputs. |

## 3. Provider lifecycle

States: `CONNECTED · DISCONNECTED · RECONNECTING · UNAVAILABLE · AUTH_REQUIRED`.

- A **connection generation** is minted on every successful connect, and a
  **session generation** is recorded on each `DISPATCHING` transition. A response
  whose generation no longer matches is treated as *stale* and rejected.
- Reconnection is **bounded**: exponential backoff with deterministic equal
  jitter derived from a hash of the run key (so it is reproducible and
  auditable), capped by `ReconnectPolicy.max_attempts`. Exhaustion yields
  `UNAVAILABLE`.
- `AUTH_REQUIRED` is **terminal for the attempt** — no automatic retry loop, no
  credential guessing; it surfaces for a human to re-authenticate the plugin.
- Reconnect **re-establishes the channel only**: it revalidates the pinned
  target and never auto-replays a write. A reconnected session is a new
  generation, not a resumed mutation.

## 4. Execution flow

1. **Preflight** (integrity, reachability, authorization) — unchanged, upstream
   of any write. A non-`READY` preflight blocks every `PLANNED` op.
2. **Provider availability gate** — before the first dispatch, the coordinator
   ensures the provider is up. If it cannot be brought up (disconnect / auth /
   unavailable), every `PLANNED` op is marked `BLOCKED` with a `provider:<class>`
   detail and the run returns without writing anything.
3. **Per-op dispatch** — `INTENT_RECORDED` (persisted) → `DISPATCHING` (records
   `session_generation`) → dispatch. A `ProviderError` is `FAILED`; a
   `ProviderTimeout` is `FAILED` (before apply) or `UNKNOWN_OUTCOME` (after); a
   `ProviderUnavailable` (drop / auth / target change) is `UNKNOWN_OUTCOME` **and
   halts the run** so the request's fate is reconciled, never assumed.
4. **Immediate reconcile** — after each op, uncertain/late ops are settled from
   an independent read-back before any dependent op is dispatched.
5. **Final snapshot** — the provider block is recorded on the journal and the
   overall status is computed from op states.

## 5. Why a mid-run drop is safe

A dropped connection is the one case where the client genuinely cannot know
whether a mutation was applied. The coordinator therefore:

- never marks such an op `VERIFIED` (there is no evidence),
- never re-dispatches it blindly (`create_*` is not idempotent),
- persists `UNKNOWN_OUTCOME` and halts, leaving every untouched op `PLANNED`,
- and defers to a read-back reconciliation on resume.

If a later independent read-back confirms the effect, the op settles
`VERIFIED`; if it confirms absence and the op is idempotent it may be
re-dispatched; if it is non-idempotent and unconfirmed it escalates to
`CONFLICT` for human adjudication.

## 6. Token export (downstream sync)

`tools/design_tokens_export.py` builds a W3C DTCG document from **only** tokens
the validator classifies `VALID_APPROVED` (104 of 126; the 22
`VALID_PENDING_DECISION` are excluded and counted; any `INVALID` blocks the
export). Two sets are emitted: `core` (light values) and `dark` (only tokens
carrying `value_dark`), wired to Light/Dark themes. Serialization is
deterministic. An existing differing file is refused unless `--force` (which
first writes a `.bak`); a token-path `$type` mismatch is a `CONFLICT`, refused
even by `--force` unless `--allow-conflict`.

## 7. Diagnostics

`tools/design_diagnostic.py` reads local inputs only and returns one class:
`OK`, `REPO_SCHEMA`, `PLAN_INTEGRITY`, `JOURNAL`, `PROVIDER_AUTH_REQUIRED`,
`PROVIDER_DISCONNECTED`, `PROVIDER_UNAVAILABLE`, `TARGET_UNIDENTIFIED`,
`AUTHORIZATION_ABSENT`, `API_UNSUPPORTED`, `READBACK_MISMATCH`,
`UNKNOWN_OUTCOME_UNRESOLVED`. It never contacts Penpot and never writes.

## 8. What remains unproven

- Live read/write and read-back verification **were** performed on 2026-10-10 on
  a real MCP-connected workspace (12-op plan to VERIFIED, idempotent re-run,
  crash-recovery reconciliation — `evidence/runs/design-phaseD-penpot-live-verify-2026-10-10.md`).
  `integration_status` is `LIVE_VERIFIED_2026-10-10`. The production Company OS
  design file now EXISTS (created 2026-10-10 via the Penpot Cloud command API:
  id `52a5041f-08a1-80f1-8008-c50e307f3ef4`, project `Company-Os`, revn 0 — see
  `evidence/runs/design-phaseD-penpot-provision-2026-10-10.md`).
- The toolbar-free path assumes the official Penpot MCP plugin tab is open and
  authenticated, and the plugin binds the **focused** browser tab's file (proven
  from `@penpot/mcp` source; no open/retarget API exists). Running the plan over
  MCP against the production file therefore requires the founder to open that
  file and Connect — a founder action this architecture cannot substitute for.
  The command-API lane (`tools/penpot_transit.py` + the target guard) is the
  automatable alternative; its `update-file` write path is internal/undocumented
  and awaits a production-write approval.
