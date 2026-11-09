# Design Compiler

**Status:** offline stages IMPLEMENTED_AND_TESTED · live integration
VERIFIED against the MCP bridge on 2026-10-10
(`evidence/runs/design-phaseD-penpot-live-verify-2026-10-10.md`: a 12-op plan
was dispatched and read back to VERIFIED on a live connected workspace, with
idempotent re-run and crash-recovery reconciliation proven). The durable run
journal, resumable coordinator and plugin runtime mock are implemented and
offline-tested (see *Run journal and resumable execution*).

The design compiler turns the governed design contract plus machine-readable
component specs into an **immutable operation plan** and then into downstream
programs and a coordinator report. Every stage is pure, deterministic, and
fail-closed. No stage touches the network or Penpot.

## Pipeline

```
DESIGN_MANIFEST.yaml ─┐
DESIGN_TOKENS.yaml ───┤
COMPONENT_DEPENDENCIES.yaml ─┤   context
PAGE_TEMPLATE_MAP.yaml ──────┘
                              │
component-specs/*.yaml ───────┤
                              ▼
                   tools/design_spec.py        validate specs against context
                              ▼
                   tools/compile_design.py     → immutable operation plan (plan_hash)
                              ▼
        ┌─────────────────────┴─────────────────────┐
        ▼                                           ▼
tools/design_adapter.py                    tools/execute_design_plan.py
  provisioning + plugin programs             lifecycle states + reconciliation
  (descriptive; never executes)              (VERIFIED only from read-back)
```

| Module | Role |
|--------|------|
| `tools/design_spec.py` | component-spec schema + validation (see `COMPONENT_SPEC.md`) |
| `tools/compile_design.py` | specs → ordered operations, stable `op_id`s, `plan_hash`, `refusals` |
| `tools/design_adapter.py` | plan → provisioning program + Penpot plugin program (no execution) |
| `tools/execute_design_plan.py` | fail-closed preflight gate + operation state machine + read-back reconciliation + resumable journal-backed executor |
| `tools/penpot_run_journal.py` | durable, checksummed, atomic run journal + transition table (the resumable-execution memory) |
| `tools/penpot_plugin_codegen.py` | plan → deterministic Penpot plugin module (idempotency markers; see `PENPOT_ADAPTER_CONTRACT.md`) |
| `tools/penpot_plugin_runtime.py` | drives a generated module against the offline Node mock; provider for the executor |
| `tools/penpot_provider.py` | provider lifecycle wrapper: states, session generations, bounded jittered reconnect, stale-response rejection, target revalidation (see `PENPOT_EXECUTION_ARCHITECTURE.md`) |
| `tools/design_tokens_export.py` | deterministic approved-only W3C DTCG token export (Penpot-readable); drift/conflict detection, never silently overwrites |
| `tools/design_diagnostic.py` | offline failure-class diagnostics (one most-fundamental blocker per run) |
| `tools/compare_penpot_readback.py` | pure plan ↔ observation comparator (pre-existing) |
| `tools/penpot_evidence.py` | redacted evidence schema + states (pre-existing) |

## Determinism and `plan_hash`

Two runs over identical inputs and identical compiler version produce
**byte-equivalent** normalized plans. `plan_hash` is SHA-256 over the canonical
JSON of the plan body (`schema_version`, `source`, `operations`, `refusals`) —
the same recipe used by `compare_penpot_readback.plan_hash`, so the comparator
can independently recompute and check it.

## Operation kinds and targets

| kind | `op_id` | `target` | `declared_effects` |
|------|---------|----------|--------------------|
| `create_variable` | `var:<token>` | `{name}` | `{type, value, value_dark}` (alias-resolved) |
| `ensure_page` | `page:<PAGE-id>` | `{name, page_id}` | `{}` |
| `create_component` | `comp:<COMP-id>` | `{name, manifest_id, layer}` | `{tokens, variants, states, dependencies}` |
| `create_node` | `node:<COMP-id>:<path>` | `{name, component_id, component, node}` | token-bound node fields |

Every `target` carries a **stable Penpot-identity key** (`name`, and
`page_id` for pages) so the comparator can match observations one-to-one; a
target with no identity key would be indistinguishable from another.

Variables: `declared_effects.value` / `value_dark` are the token's alias chain
resolved to its literal (`resolve_alias`). The variable's identity is its
canonical token name (carried in `name`); no `token` key is emitted because the
evidence schema treats a `token` key as secret-bearing.

## Adapters (descriptive, never executing)

- **Provisioning program** — file, library sections, pages. File creation is
  emitted **READY** and is automated by `tools/penpot_provision.py` over the
  Penpot Cloud command API (`create-file`): find-or-create (idempotent),
  fail-closed, scratch-rejecting, `--decision` gated, and verified by an
  independent `get-file` read. The *Plugin* API has no `createFile`; plugin
  operations still require the founder to connect the created file to the MCP
  plugin (manifest PEN-001). Page steps are `READY`.
- **Plugin program** — deterministic, ordered Penpot plugin calls derived from
  the plan's component/node operations, plus `render_plugin_source()` which
  emits reviewable (non-executed) source.

Every adapter call carries `verified: false` and the program carries
`integration_status: LIVE_VERIFIED_2026-10-10`: the Penpot plugin API surface
was exercised against a live workspace on that date (see the phase-D evidence),
so the mapping is confirmed; a static compiled program still never claims proof
on its own — only a journaled live read-back can do that.

## Preflight (fail-closed execution gate)

A plan cannot authorize its own execution. Before any live executor may run, the
coordinator's `preflight()` must return `READY`, and it can do so only from three
**externally-supplied** facts the plan never carries:

| Input | Required shape | Missing → `BLOCKED` reason |
|-------|----------------|----------------------------|
| `target` | `{file_id, page_id}` — a human-verified Penpot target | `target_unidentified` |
| `authorization` | `{write_authorized: true, decision: <ref>}` | `write_not_authorized` |
| `reachability` | `{state: "OK"}` — a successful live probe | `provider_unreachable` |

A refused plan adds `plan_refused`; a plan with no operations adds
`no_operations`. Absent inputs become explicit reasons, never silent defaults, so
a missing target or authorization can never be misread as `READY`. `preflight`
always carries `verified: false` — it clears a gate, it never proves an artefact
exists.

```sh
python3 tools/execute_design_plan.py --plan plan.json --preflight \
    [--target t.json --authorization a.json --reachability r.json]
```

Exit `0` only when `state == READY` (nothing is executed either way); `1` when
`BLOCKED`; `2` when inputs cannot be read. With no external facts supplied — the
current repository reality — the gate is `BLOCKED` on all three reasons.

## Coordinator states

`PLANNED · READY · RUNNING · VERIFIED · FAILED · BLOCKED · UNKNOWN_OUTCOME ·
NEEDS_RECONCILIATION`

- A **clean** plan leaves every operation `READY`; overall `NOT_RUN`.
- A **refused** plan marks every operation `BLOCKED`; overall `BLOCKED`.
- With `--performed` and an observation, states are derived from the comparator:
  exact match → `VERIFIED`; a field/identity mismatch → `FAILED`; a
  missing/ambiguous/duplicate/unexpected observation → `NEEDS_RECONCILIATION`.
- **`VERIFIED` is reachable only from an independently supplied read-back
  observation.** The coordinator never derives `VERIFIED` from the plan itself.

Operation state → evidence state (`penpot_evidence` vocabulary):
`VERIFIED→VERIFIED`, `FAILED→BLOCKED`, `BLOCKED→BLOCKED`, everything else →
`NOT_RUN` (except a still-`PLANNED` operation).

## Run journal and resumable execution

The executor (`execute_design_plan.execute_run`) drives a caller-supplied
provider and records every step in a **durable run journal**
(`tools/penpot_run_journal.py`). The journal is the on-disk memory of one
attempt; it is what makes an interrupted run resumable without silently repeating
non-idempotent operations.

Journal guarantees (enforced in `penpot_run_journal.py`, not the caller):

- **Atomic** — write-to-temp + `fsync` + `rename`; a crash never leaves a
  half-written file.
- **Checksummed** — every journal carries a SHA-256 over its own body, so
  truncation, partial writes and tampering fail closed (`JournalCorrupt`).
- **Versioned** — an unknown `journal_schema_version` is refused, never
  interpreted (`JournalIncompatible`).
- **Transition-checked** — the legal state graph is explicit; an illegal move
  raises `IllegalTransition` instead of being written.
- **Redacted** — secrets are stripped (via `penpot_evidence.redact`) before any
  byte is persisted.
- **Bound** — a resume is refused unless the journal's `plan_hash`, `run_id` and
  `target` match the supplied plan (`JournalConflict`); a per-run lock
  (`run_lock`) refuses concurrent resume (`RunLocked`).

Journal operation states: `PLANNED · INTENT_RECORDED · DISPATCHING · APPLIED ·
VERIFIED · FAILED · UNKNOWN_OUTCOME · RECONCILING · BLOCKED · CONFLICT`.
`APPLIED` is deliberately **not** terminal — a provider acknowledgement is not a
verified effect. Terminal states are `VERIFIED · FAILED · BLOCKED · CONFLICT`;
overall run status is `COMPLETED` only when every operation is `VERIFIED`.

Invariants the executor enforces:

1. **preflight must be `READY`** before any dispatch;
2. **intent is persisted before dispatch** (a crash mid-dispatch leaves intent on
   disk);
3. **success is never recorded from an ack alone** — an operation reaches
   `VERIFIED` only through an independent read-back reconciliation;
4. **an unknown outcome is never blindly retried** — a non-idempotent operation
   (`create_component`, `create_node`) that is still unresolved across a resume
   boundary is escalated to `CONFLICT`, not repeated;
5. **a dependent whose dependency is merely uncertain is *deferred*, not
   blocked** — it stays `PLANNED` so a later pass or a resume can run it once the
   dependency settles. Only a dependency in a terminal failure
   (`FAILED · BLOCKED · CONFLICT`) permanently `BLOCKED`s a dependent. This is
   the difference between recoverable transient loss and permanent failure.

## Refusals

A refused reference never silently disappears. If **any** spec is invalid the
plan carries **zero operations** and lists every finding in `refusals` (CLI exit
1). A refused plan must not be handed to a live executor; the adapter marks it
`refused` and the coordinator marks it `BLOCKED`. An **empty** plan is a valid
plan and is **not** evidence that work happened.

## Commands

```
python3 tools/design_spec.py    --dir docs/design/component-specs
python3 tools/compile_design.py --dir docs/design/component-specs --out plan.json --evidence evidence.json
python3 tools/design_adapter.py --plan plan.json --provision provision.json --plugin plugin.json
python3 tools/penpot_plugin_codegen.py --plan plan.json --out module.mjs [--capabilities]
python3 tools/execute_design_plan.py --plan plan.json [--observation obs.json --performed]
python3 tools/execute_design_plan.py --plan plan.json --preflight [--target t.json --authorization a.json --reachability r.json]
python3 tools/penpot_run_journal.py --journal run.json
```

Exit codes: `0` clean · `1` refusals / failures · `2` could not run.

Both `design_spec` and `compile_design` are wired into `scripts/gates.sh` so the
component-spec contract has deterministic regression enforcement.

## Not yet implemented (explicit)

- **Per-state token overrides.** `schema_version 1` carries state *names*; the
  declared anatomy is the default state. Variant/state-specific token bindings
  are a future schema extension.
- **Visual export comparison.** The offline read-back comparator proves
  structural effect parity (identity + declared effect fields via
  `company-os:` provenance markers). Pixel-level export comparison is possible in
  principle (the Plugin API exports shapes) but is not implemented; it stays
  out until a live adapter confirms the API against a real workspace.
- **Live Penpot adapter.** The plugin API mapping is verified live on
  2026-10-10 (12-op plan, VERIFIED read-back, idempotent re-run, crash-recovery
  reconciliation — see `evidence/runs/design-phaseD-penpot-live-verify-2026-10-10.md`);
  `integration_status` is `LIVE_VERIFIED_2026-10-10`. Pixel-level export
  comparison stays out of scope. The plan approvals in the phase-D run carry
  the founder-sanctioned decision reference recorded in the run journals.
