# Resumable Design Execution + Plugin Codegen — Report, Part G (2026-10-10)

Branch: `feat/design-gate2` · HEAD: `efbfb8aefc9457e3275301a613ad5da915768212`
(uncommitted working tree; nothing staged/committed).
Governance: decision **26.16** (repo authoritative, Penpot downstream).
Companion to `design-compiler-final-report-2026-10-10.md` (§9 addendum points here).

> Every value below is from a committed file, a deterministic test/CLI run
> executed this session, or the read-only Penpot API audit. No result is
> estimated, inherited, or model-asserted. Redaction and fail-closed behaviour
> are the points of this artifact; the live adapter remains unproven.

---

## 1. What was built (this work package)

| Module / artifact | Role |
|---|---|
| `tools/penpot_run_journal.py` | Durable, resumable run journal. Persistence is atomic (write-temp → `fsync` → `rename`), checksummed, schema-versioned, and fail-closed on corrupt / truncated / incompatible / tampered files. Secrets are stripped via `penpot_evidence.redact`; the intent is persisted **before** dispatch, so a crash between dispatch and ack is recoverable. |
| `tools/execute_design_plan.py` | Coordinator extended with `execute_run` / reconciliation over the journal. It is the single component allowed to move an op to `VERIFIED`, and only from an independently supplied read-back. |
| `tools/penpot_plugin_codegen.py` | Deterministic plugin code generator: immutable plan → self-contained ECMAScript module. Pure (no network, clock, or randomness); two runs over the identical plan produce byte-identical source. Idempotency by `company-os:` provenance markers + unique token names; identity round-trip via `company-os:identity` markers. |
| `tools/penpot_plugin_runtime.py` | Offline driver that executes generated code against the Node mock (`tests/penpot_mock/`), forming the read-back the comparator consumes. Node-gated; degrades gracefully when Node is absent. |
| `tests/test_penpot_plugin_runtime.py` | Determinism + mock-execution + cross-process persistence + the `UNKNOWN_OUTCOME` recovery path driven through the real generated runtime. |
| `tests/test_penpot_resume.py` | Resumable coordinator tests (now 24; was 23 — one realigned, one added; see §3). |
| `docs/design/PENPOT_ADAPTER_CONTRACT.md` | **NEW.** The adapter contract, grounded on the live Penpot 2.18.3 plugin-API surface (§5). |
| `docs/design/DESIGN_COMPILER.md` | Updated: journal/resume/runtime now documented as implemented; stale "no on-disk run journal yet" note removed. |

## 2. Run-journal state model and executor invariants

Journal states: `PLANNED → INTENT_RECORDED → DISPATCHING → APPLIED → VERIFIED`,
plus `FAILED`, `UNKNOWN_OUTCOME`, `RECONCILING`, `BLOCKED`, `CONFLICT`.
Terminal states are `VERIFIED · FAILED · BLOCKED · CONFLICT`; **`APPLIED` is not
terminal** (a dispatched-but-unacknowledged create stays recoverable).

Coordinator states: `PLANNED, READY, RUNNING, VERIFIED, FAILED, BLOCKED,
UNKNOWN_OUTCOME, NEEDS_RECONCILIATION`. Evidence mapping:
`VERIFIED→VERIFIED`, `FAILED→BLOCKED`, `BLOCKED→BLOCKED`, else `NOT_RUN`.

Five executor invariants (each covered by tests):

1. Intent is journaled before dispatch.
2. `VERIFIED` comes only from independent read-back — never from HTTP status.
3. `APPLIED` is not terminal; recovery proceeds by observing the provenance
   marker, never by blindly repeating a non-idempotent create.
4. A recovered/observed applied op is reconciled, not re-dispatched.
5. Dependencies compose: an op is deferred while a dependency is *uncertain*, and
   hard-blocked only by a dependency in terminal failure (see §3).

## 3. Semantic decision: deferral vs. terminal block (findings/fixes)

**Decision (confirmed).** An operation whose dependency is merely *uncertain* —
e.g. a `RECONCILING` dependency caused by transiently unavailable read-back —
stays **`PLANNED`** (deferred, resumable). It is **not** set to `BLOCKED`, which
is terminal and would strand recoverable work. Only a dependency in terminal
failure (`FAILED · BLOCKED · CONFLICT`) blocks a dependent. This satisfies
requirement B: a resumed run continues only with operations that are safe to
execute.

Fixes applied this session:

1. `tests/test_penpot_resume.py::HappyPathTests::test_no_verified_without_read_back`
   carried a stale assertion that treated the deferred dependent as blocked. It
   now asserts the deferred-`PLANNED` contract: dependent `comp:COMP-ACT-01`
   state `== PLANNED`, run status `== INCOMPLETE`, not `VERIFIED`, and
   `applied < total`.
2. Added `tests/test_penpot_resume.py::HappyPathTests::test_deferred_dependent_recovers_on_resume`:
   with read-back restored, resume reaches `COMPLETED`, all ops `VERIFIED`, and
   `comp:COMP-ACT-01` is dispatched **exactly once** (no duplicate create).
3. Lint (repo `ruff`): removed an unused `json` import and five unused
   `# noqa: E402` directives in `test_penpot_plugin_runtime.py`; wrapped two
   implicit string concatenations (`ISC004`) in `penpot_plugin_codegen.py`; marked
   `penpot_plugin_codegen.py` / `penpot_plugin_runtime.py` executable (`EXE001`).

No production behaviour was changed to satisfy lint; the two semantic test edits
are the only behavioural change and they align tests to the contract in §2.

## 4. Verification runs executed this session

| # | Run | Command | Result |
|---|---|---|---|
| 1 | Full unit suite | `.venv/bin/python -m unittest discover -s tests` | RC 0 — `Ran 925 tests in 209.615s`, `OK` |
| 2 | Design/Penpot subset | `python -m unittest tests.test_penpot_journal tests.test_penpot_resume tests.test_penpot_plugin_runtime tests.test_penpot_offline tests.test_design_compiler tests.test_design_validators tests.test_design_validators_failclosed` | RC 0 — `Ran 224 tests in 54.352s`, `OK` |
| 3 | Post-lint re-run | subset of #2 (journal, resume, plugin_runtime, offline) | RC 0 — `Ran 132 tests in 28.876s`, `OK` |
| 4 | Lint | `ruff check .` | `All checks passed!` |
| 5 | Byte-compile | `.venv/bin/python -m compileall -q company_os tools tests` | OK |
| 6 | Shell syntax | `bash -n scripts/gates.sh` | OK |
| 7 | Compiler gate | `python tools/compile_design.py --dir docs/design/component-specs` | exit 0 — 12 operations, 0 refusals, `plan_hash=bed78be5b8241bcec414c1829e8a5f4fe06ff9d98542e91b3611da7565d0b8e1` |
| 8 | Spec gate | `python tools/design_spec.py --dir docs/design/component-specs` | exit 0 |
| 9 | Penpot map gate | `python tools/validate_penpot_map.py` | exit 0 |

`tests.test_penpot_resume` reports 24 tests (one realigned, one added). The
committed example plan hash in run #7 is byte-identical to the pin in the
companion final report — the compiler output is unchanged by this package.

Gate wiring (`scripts/gates.sh`, working tree) already runs the offline design
checks after the penpot map check:

```
run_check "penpot map (offline)"      "$PYTHON" tools/validate_penpot_map.py
run_check "design component specs"    "$PYTHON" tools/design_spec.py --dir docs/design/component-specs
run_check "design compiler (offline)" "$PYTHON" tools/compile_design.py --dir docs/design/component-specs
```

The full `scripts/gates.sh` was **not** run end-to-end: it shells out to
toolchain checks (shellcheck, trivy, semgrep, gitleaks, promptfoo, langfuse)
that are not all present on this host. Only the deterministic Python/CLI checks
above were executed; no CI claim is made beyond them.

## 5. Adapter contract, grounded on the live Penpot 2.18.3 API

`docs/design/PENPOT_ADAPTER_CONTRACT.md` records the surface the generator and
mock must honour, taken from a read-only API audit (`penpot_penpot_api_info`) —
not from memory:

- Shapes: `penpot.createBoard/Rectangle/Ellipse/Path/Text`, `group(shapes)→Group|null`,
  `appendChild(child)` on `Board`/`Group`; `Shape` is a union type alias.
- Page: `penpot.createPage()`, `openPage`, `currentPage`; `Page` exposes
  `id, name, root, findShapes({name,nameLike,type}), getShapeById`.
- Library/components: `library.local.createComponent(shapes)`, `library.local.components`.
- Tokens: `TokenCatalog.addSet({name, active?})`, `TokenSet.addToken({type,name,value})`.
- Plugin-data markers on `ShapeBase`/`Page`/`File`/`Library`.
- Export: `ShapeBase.export({type:"png"|"jpeg"|"svg"|"webp"|"pdf", scale?, …})`
  (shape-level visual export exists); `File.export("penpot"|"zip")`; `File.revn`, `File.pages`.
- Permissions: `content:read` + `content:write`.

The contract states the honesty boundary explicitly: the adapter is
`IMPLEMENTED_NOT_INTEGRATION_TESTED` and every call is `verified:false`. The mock
mirrors this surface; where mock member shapes differ from live, the doc says so.

## 6. Authorization boundary — explicitly NOT done

- No remote Penpot mutation; no create/rename/delete/overwrite against any live file.
- No Cloudflare challenge bypass; no cookie/credential extraction.
- No secret value printed, serialized, or committed.
- No stage/commit/push/reset/clean/stash/revert. Working tree left dirty by design.
- No new source of truth, registry, or dependency introduced.

## 7. Blockers (unchanged)

- **Live Penpot integration** — `PENPOT_ACCESS_TOKEN` is present; direct RPC still
  returns Cloudflare `cf-mitigated: challenge`, the MCP plugin tab is suspended,
  and there is no human-verified Company OS target file. Requires the founder to
  reconnect the tab and identify/create the target. Not a credential problem.
- **PEN-001** (file creation) — founder Penpot-app action; emitted `BLOCKED`.
- **BLOCKER-3** — 22 tokens `VALID_PENDING_DECISION` (scoped exclusion).

## 8. Confirmation

- `Ran 925 tests in 209.615s — OK`; design/Penpot subset 224 OK; post-lint 132 OK.
- `ruff` clean; `compileall` clean; `bash -n scripts/gates.sh` clean.
- Compiler gate 12 ops / 0 refusals; spec and penpot-map gates exit 0; example
  plan hash unchanged.
- Resumable contract verified: uncertain dependency → deferred `PLANNED`;
  terminal-failure dependency → `BLOCKED`; recovery resumes without duplicate
  dispatch.
- Live adapter remains **IMPLEMENTED_NOT_INTEGRATION_TESTED**; no remote write was
  performed; the founder remains the accountable approver.

**Resumable design execution + plugin codegen: IMPLEMENTED_AND_TESTED (offline).**
**Live Penpot effect: BLOCKED (decision 26.16 / PEN-001 / no verified target).**
