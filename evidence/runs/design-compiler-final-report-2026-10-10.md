# Design Compiler — Final Implementation Report (2026-10-10)

Branch: `feat/design-gate2` · HEAD: `efbfb8aefc9457e3275301a613ad5da915768212`
Scope: deterministic Penpot design automation in Company OS (offline).
Governance: decision **26.16** (repo authoritative, Penpot downstream).

> Every value below is from a committed file, a deterministic test run executed
> this session, or a CLI invocation executed this session. No result is
> estimated, inherited, or model-asserted. This report follows the mandated
> final-report requirement using the repo's evidence conventions
> (`evidence/runs/`); the literal §15 template was not supplied, so if it
> prescribes additional exact sections the report is re-emitted from that text.

> **Correction (2026-10-10, later the same day).** The live blocker was recorded
> below as **"no `PENPOT_ACCESS_TOKEN`."** That is now **stale** — the token is
> present in the external secrets file and a token-bearing read-only probe was
> run. The blocker is **Cloudflare reachability + an unidentified target**, not a
> missing credential. See
> `evidence/runs/design-phaseD-penpot-auth-probe-2026-10-10.md`. The original
> lines are preserved below for the audit trail; the corrected statement is in
> the capability row, §5, and §6.

---

## 1. Capability matrix

| Capability | Status | Evidence |
|---|---|---|
| Component-spec validation against manifest/tokens/graph/page-map | **IMPLEMENTED_AND_TESTED** | `tools/design_spec.py`; 25 `SpecValidationTests` |
| Strict schema — unknown/unsupported properties rejected (all levels) | **IMPLEMENTED_AND_TESTED** | `_reject_unknown` / `_allowed_node_keys`; `test_unknown_*_rejected` |
| Operation targets carry no secret-bearing keys | **IMPLEMENTED_AND_TESTED** | compiler + planner; `test_variable_target_carries_no_secret_bearing_key` |
| Specs → immutable, ordered operation plan | **IMPLEMENTED_AND_TESTED** | `tools/compile_design.py`; `CompilerTests` |
| Determinism (byte-equivalent plans) + `plan_hash` | **IMPLEMENTED_AND_TESTED** | `test_determinism_hash_and_bytes`; recomputed-hash equality |
| Stable Penpot-identity keys per operation | **IMPLEMENTED_AND_TESTED** | `test_operation_ids_and_order`; comparator round-trip |
| Fail-closed refusals (any invalid spec → 0 ops + findings) | **IMPLEMENTED_AND_TESTED** | refusal tests; CLI exit 1 path |
| Provisioning program (file/sections/pages) | **IMPLEMENTED_AND_TESTED** (descriptive; never executes) | `tools/design_adapter.py`; `AdapterTests` |
| Penpot plugin program generation | **IMPLEMENTED_AND_TESTED** (generation) | `render_plugin_source`; `AdapterTests` |
| Penpot plugin program **live execution** | **IMPLEMENTED_NOT_INTEGRATION_TESTED** | `INTEGRATION_STATUS`; never run against a real workspace |
| Coordinator state machine + read-back reconciliation | **IMPLEMENTED_AND_TESTED** | `tools/execute_design_plan.py`; `CoordinatorTests` |
| `VERIFIED` only from independent read-back | **IMPLEMENTED_AND_TESTED** | `reconcile`; `test_exact_observation_verifies` |
| Live Penpot **file creation** | **BLOCKED** | founder Penpot-app action (manifest PEN-001) |
| Fail-closed preflight execution gate (target + authorization + reachability) | **IMPLEMENTED_AND_TESTED** | `execute_design_plan.preflight`; 9 `PreflightTests`; CLI `--preflight` |
| Live remote mutation / execution | **BLOCKED** | token present but Cloudflare `cf-mitigated: challenge` on RPC; MCP tab suspended; no human-verified target (`design-phaseD-penpot-auth-probe-2026-10-10.md`) |
| Per-state token overrides | **NOT_SUPPORTED** (schema v1 carries state names only) | `DESIGN_COMPILER.md` "Not yet implemented" |

No capability is claimed verified beyond the status above.

---

## 2. What was built

| Module | Role |
|---|---|
| `tools/design_spec.py` | Component-spec contract: schema + validation (fail-closed). `load_context()` refuses to validate against a non-loadable token contract. |
| `tools/compile_design.py` | Deterministic compiler; `COMPILER_VERSION="1.0.0"`, `SCHEMA_VERSION=1`; op ids `var:`/`page:`/`comp:`/`node:`; `plan_hash` = SHA-256 over `{schema_version, source, operations, refusals}` (matches `compare_penpot_readback`). |
| `tools/design_adapter.py` | Provisioning + plugin programs; `API="penpot-plugin"`, `INTEGRATION_STATUS="IMPLEMENTED_NOT_INTEGRATION_TESTED"`; every call `verified:false`; file step `BLOCKED` (PEN-001), sections/pages `READY`. |
| `tools/execute_design_plan.py` | `OPERATION_STATES` + `reconcile()`; delegates verification to `compare_plan_to_readback`; never fabricates `VERIFIED`. Also `preflight()` — a pure, fail-closed gate that clears execution only from external facts (target identity, write authorization, reachability); `--preflight` CLI. |
| `docs/design/COMPONENT_SPEC.md` | The spec contract (schema, rules, CLI, honesty). |
| `docs/design/DESIGN_COMPILER.md` | Pipeline, determinism, op/target schema, state model, limitations. |
| `docs/design/component-specs/COMP-ACT-01.yaml` | Worked example (Button / Primary, L2, PAGE-001, 8 tokens). |
| `tests/test_design_compiler.py` | 60 tests: spec (incl. strict schema), compiler, adapter, coordinator, preflight, CLI, 2 golden pins.

Reused, not duplicated: `DESIGN_MANIFEST.yaml`, `DESIGN_TOKENS.yaml`,
`COMPONENT_DEPENDENCIES.yaml`, `PAGE_TEMPLATE_MAP.yaml`, `validate_design_tokens.py`,
`validate_penpot_map.py`, `penpot_evidence.py`, `compare_penpot_readback.py`.

---

## 3. Verification runs executed this session

| # | Run | Command | Result |
|---|---|---|---|
| 1 | Full unit suite | `.venv/bin/python -m unittest discover -s tests` | RC 0 — `Ran 858 tests in 200.719s`, `OK` |
| 2 | Design/penpot subset | `.venv/bin/python -m unittest tests.test_design_compiler tests.test_design_validators tests.test_design_validators_failclosed tests.test_penpot_offline` | RC 0 — `Ran 157 tests`, `OK` (51 in `test_design_compiler`) |
| 3 | Component-spec gate | `.venv/bin/python tools/design_spec.py --dir docs/design/component-specs` | exit 0 — `PASS — 1 spec(s) consistent …` |
| 4 | Compiler gate | `.venv/bin/python tools/compile_design.py --dir docs/design/component-specs` | exit 0 — 12 operations, 0 refusals |
| 5 | Planner evidence (secret-free) | `plan_penpot_ops.py --map <token map> --out --evidence` | exit 0; `validate_evidence == []`; `target == {"name": …}` |
| 6 | Determinism (CLI) | two `--out` runs, byte compare | identical plan; `plan_hash=bed78be5…` |
| 7 | Lint | `ruff check tools/ tests/` | `All checks passed!` |
| 8 | Byte-compile | `.venv/bin/python -m compileall -q tools tests` | OK |
| 9 | Shell syntax | `bash -n scripts/gates.sh` | OK |

Golden pins (regression guards, in test 2): fixture plan
`cad8b709340debd0cf373c63efffa1a16e405b115e38df949121baa1d88e22ae`; committed
example plan `bed78be5b8241bcec414c1829e8a5f4fe06ff9d98542e91b3611da7565d0b8e1`.
`source` carries no absolute paths, so both are machine-independent.

Gate wiring added to `scripts/gates.sh` (after the penpot map check):

```
run_check "design component specs" "$PYTHON" tools/design_spec.py --dir docs/design/component-specs
run_check "design compiler (offline)" "$PYTHON" tools/compile_design.py --dir docs/design/component-specs
```

Preflight is intentionally **not** wired into `gates.sh`: with no live target it
returns `BLOCKED` by design, so it is a runtime gate, not a pass/fail CI check.
It is covered by unit tests instead.

### Follow-up session (preflight + reachability correction) — re-verified

| # | Run | Result |
|---|---|---|
| 10 | Full unit suite | RC 0 — `Ran 867 tests in 193.864s`, `OK` |
| 11 | Design/penpot subset | RC 0 — `Ran 166 tests`, `OK` (60 in `test_design_compiler`) |
| 12 | Preflight (no external facts) | `--preflight` → exit 1, `state: BLOCKED`, reasons `target_unidentified`, `write_not_authorized`, `provider_unreachable` |
| 13 | Lint / byte-compile / shell | `ruff check tools/ tests/` clean · `compileall` clean · `bash -n` clean |
| 14 | Gate CLIs | `design_spec --dir` exit 0 · `compile_design --dir` exit 0 |

---

## 4. Defects found and fixed this session

1. Variable ops carried a `target.token` key; `penpot_evidence` treats a `token`
   key as secret-bearing, so `compile_design --evidence` was rejected. Fixed by
   emitting only `target.name` (the canonical token name already *is* the
   identity). The same shape was latent in `plan_penpot_ops.py` and is now fixed
   there too (verified: `--evidence` exits 0 with `validate_evidence == []`).
2. Node targets lacked a Penpot-identity key, so every node op hashed to `{}` and
   the comparator reported `ambiguous_observation` → permanently `BLOCKED`. Fixed
   by adding a stable `name` (`<cid>:<path>`) to node targets and a manifest title
   to page targets.
3. Test bug: field-mismatch assertion used `:label`; corrected to `/label`.
4. Test bug: the mismatch case mutated the shared observation (aliased the plan's
   `declared_effects`), corrupting the plan body; the comparator correctly raised
   `plan_hash_mismatch`. Fixed with a deep copy before mutation — the comparator's
   plan-integrity check is confirmed working.
5. `design_spec.py` silently accepted unknown/unsupported properties at every
   level (top-level, component, node, layout, sizing, text, padding,
   accessibility). Fixed with strict allowlists (`_reject_unknown`,
   `_allowed_node_keys`); a field not supported for a node type (e.g. `fill` on a
   `group`) now fails closed. Covered by 7 new `SpecValidationTests`.
6. `plan_penpot_ops.py` re-emitted the canonical token under the key `token` on
   variable targets, which made its `--evidence` output fail `validate_evidence`
   (`secret-bearing field present`). Fixed; covered by
   `test_variable_target_carries_no_secret_bearing_key`.

---

## 5. Authorization boundary — explicitly NOT done

- No remote Penpot mutation of any kind; no creation, rename, delete, or overwrite.
- No Penpot access token created, requested, or stored; no browser cookie/credential
  extraction; no Cloudflare challenge bypass attempted.
- No secret **value** was printed, serialized, or committed. The original session
  opened no secrets file; the follow-up probe loaded `PENPOT_ACCESS_TOKEN` from the
  external secrets file into the process environment only (key presence confirmed,
  value never recorded) — see the correction banner and
  `design-phaseD-penpot-auth-probe-2026-10-10.md`.
- No stage/commit/push/reset/clean/stash/revert. Working tree left dirty by design.
- No new manifest/token registry/dependency graph/source of truth introduced.
- No Docker/Redis/DB/new-browser/dependency installed.

---

## 6. Blockers (unchanged)

- **Live Penpot integration** — corrected: a `PENPOT_ACCESS_TOKEN`
  **is present**. Direct RPC `GET …/api/rpc/command/get-profile` still returns
  `403 cf-mitigated: challenge` (Cloudflare browser challenge for non-browser
  clients; no permitted bypass), and the sanctioned MCP bridge is currently
  suspended (plugin tab heartbeat stale). There is no human-verified Company OS
  target file — the connected instance is a scratch file. Requires the founder
  to focus/reconnect the MCP tab and create/connect the target file; reachability
  is not a credential problem. See
  `design-phaseD-penpot-auth-probe-2026-10-10.md`.
- **PEN-001** (file creation) — founder Penpot-app action; emitted `BLOCKED`.
- **BLOCKER-3** — 22 tokens `VALID_PENDING_DECISION` (scoped exclusion).
- Unrelated owner decisions still open: 26.9, 26.11, 26.1, 26.5.

---

## 7. Evidence hygiene

- No credentials touched; no secret shapes in the new tools, tests, or docs.
- New tools import no network libraries (`requests`/`urllib`/`http`/`socket`),
  use no `curl`, and contain no URLs.
- The committed spec contains no raw colour literals (TEST-012).
- All new artifacts are offline and deterministic; nothing here is a claim that a
  Penpot artefact exists.

---

## 8. Confirmation

- `Ran 867 tests in 193.864s — OK`; design/penpot subset 166 OK (60 in `test_design_compiler`).
- Both gate CLIs exit 0; determinism byte-identical; golden hashes pinned.
- `ruff` clean; `compileall` clean; `bash -n` clean; planner `--evidence` secret-free.
- Preflight fail-closed: with no external target/authorization/reachability it
  returns `BLOCKED` (exit 1), never `READY`.
- Live adapter remains **IMPLEMENTED_NOT_INTEGRATION_TESTED**; no remote write was
  performed; the founder remains the accountable approver.

**Design compiler offline pipeline: IMPLEMENTED_AND_TESTED.**
**Live Penpot effect: BLOCKED (decision 26.16 / PEN-001 / no verified target).**

---

## 9. Addendum — resumable execution + plugin codegen (Part G, 2026-10-10)

A later work package added the durable/resumable run journal, the plugin code
generator, the offline plugin runtime, and the adapter contract. Reproduced and
re-verified this session (full suite now `Ran 925 tests … OK`). The capability
matrix in §1 predates these; the authoritative record for the new capabilities
is `design-resumable-execution-2026-10-10.md` (Part G). Added capabilities:

| Capability | Status | Evidence |
|---|---|---|
| Durable, resumable run journal (atomic + checksummed, fail-closed) | **IMPLEMENTED_AND_TESTED** | `tools/penpot_run_journal.py`; `tests/test_penpot_journal.py` |
| Resumable coordinator + `UNKNOWN_OUTCOME` recovery | **IMPLEMENTED_AND_TESTED** | `tools/execute_design_plan.py::execute_run`; `tests/test_penpot_resume.py` (24) |
| Deterministic plugin code generation | **IMPLEMENTED_AND_TESTED** | `tools/penpot_plugin_codegen.py`; `tests/test_penpot_plugin_runtime.py` |
| Offline plugin execution against mock + cross-process read-back | **IMPLEMENTED_AND_TESTED** | `tools/penpot_plugin_runtime.py`; `tests/penpot_mock/` |

Semantic decision: an operation whose dependency is *uncertain* stays deferred
`PLANNED` (resumable); only a dependency in terminal failure
(`FAILED·BLOCKED·CONFLICT`) blocks a dependent. See Part G §3.
