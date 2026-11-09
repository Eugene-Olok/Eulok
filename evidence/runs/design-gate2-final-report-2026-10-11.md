# Design Programme — Gate 2 Final Report (§16)

**Date:** 2026-10-11
**Branch:** `feat/design-gate2`
**HEAD at report time:** `efbfb8aefc9457e3275301a613ad5da915768212`
**Report scope:** deterministic Gate 2 (Design-System Contract and Readiness)
closure, the gate-sequence enforcement added on top, and the honest readiness
of Gates 3–7.
**Commit note:** the status described here was subsequently committed on
`feat/design-gate2` (commits `8fb9104`…`1c4b076`, working tree clean, **not
pushed** — no push/merge/deploy without separate founder approval). The
"working tree" phrasing below reflects the state at the time of writing.

---

## 1. What Gate 2 is, and its verdict

Gate 2 establishes the **design source-of-truth package** and proves it is
internally consistent by deterministic checks. Its verdict, computed every run
by `tools/design_gate_verifier.py` from real evidence (never asserted by hand):

| Gate | Status | Basis |
|---|---|---|
| GATE-1 Design Audit & Baseline | **PASS** | baseline audit evidence present (`evidence/runs/design-system-audit-2026-10-08.md`) |
| GATE-2 Design-System Contract & Readiness | **PASS** | 7/7 checks pass (manifest, tokens, graph, decision-effects, contract specs, both reconciliation evidence files) |
| PENPOT-PROTOCOL-SUBGATE | **PASS** | disposable target verified + write surface verified (4/4 protocol ops applied with independent read-back, 2026-10-11) |
| GATE-3 Decision Closure & Token Establishment | **BLOCKED** | register not closed (26.1 PENDING, 26.5 PENDING, 26.9 BLOCKED, 26.11 PENDING_ESCALATE) |
| GATE-4 Component Contract | **BLOCKED** | fenced by GATE-3 |
| GATE-5 Page & Template Scope | **BLOCKED** | fenced by GATE-3 |
| GATE-6 Implementation & Parity | **BLOCKED** | fenced by GATE-4/GATE-5 |
| GATE-7 Ship & Evidence (Phase 8) | **BLOCKED** | fenced by GATE-6 |

**Gate 2 is closed PASS. The Penpot write-protocol subgate is PASS** — a
dedicated disposable target exists and is authorized, and the write surface is
verified live (4/4 protocol ops applied with independent read-back; idempotent
re-dispatch; fail-closed guard refusals exercised). **Gates 3–7 are honestly
BLOCKED, not faked green** — now blocked on real open register decisions
(26.1/26.5/26.9/26.11), not on the subgate fence.

## 2. What was built in this pass

### 2.1 Deep per-item manifest schema validation

`tools/validate_design_manifest.py` previously checked structure only (counts,
duplicate ids, family counts). It now also validates **every item's full
schema**, deterministically, with no YAML runtime dependency introduced
(quote-aware field parsing added instead):

- required fields present and non-empty: `id, title, status, priority, basis, evidence`
- `notes` optional (may be absent or empty — 11 real items omit it)
- `id` matches the canonical family shape `^[A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*-\d+$`
  (accepts `A11Y-*`, `COMP-ACT-*`, …)
- `priority ∈ {P0,P1,P2,P3}`, `status ∈ {CURRENT,REQUIRED,FUTURE,OUT_OF_SCOPE}`
- no unexpected fields
- **evidence policy:** an item whose evidence reads `deferred…` may not have
  status `CURRENT` or `REQUIRED`

Verified against the real registry: 290 items, all clean.

### 2.2 Contract-spec anchor validation

New `tools/validate_design_specs.py` asserts that the prose contracts still
carry every anchor the brief requires — so a spec cannot silently lose a
breakpoint value, the "not complete until validated" caveat, the
`DEFECT_CLOSED_PENDING_REVIEW` (not "closed") defect language, or the
both-themes requirement. 21 anchors across `RESPONSIVE_SPEC.md` (12) and
`ACCESSIBILITY_SPEC.md` (9). All present.

### 2.3 Gate sequence + enforcement

New `docs/design/DESIGN_GATES.yaml` (machine-readable gate DAG) and
`tools/design_gate_verifier.py`:

- check kinds: `tool` (exit code), `evidence` (file presence + substrings),
  `evidence_status` (explicit `STATUS:` marker), `register` (decision closure)
- resolution: unmet prerequisite ⇒ **BLOCKED** (fenced, not evaluated);
  else any FAIL ⇒ **FAIL**; else any BLOCKED ⇒ **BLOCKED**; else **PASS**
- the register parser is **imported from `validate_design_tokens.py`** — one
  source of truth, no drift
- `--enforce GATE-N` exits non-zero unless that gate is PASS, so CI cannot
  claim a downstream status out of sequence (`--enforce GATE-2` → 0;
  `--enforce GATE-3` → exit 2 REFUSE)

### 2.4 Subgate — from BLOCKED to PASS (2026-10-11)

`evidence/runs/design-penpot-protocol-subgate-2026-10-11.md` began as an
independent status record explaining the BLOCKED state (no disposable target;
write surface unverified) and was then flipped to **PASS** after the
founder-authorized disposable live validation succeeded. Two corrections were
made to the record, each with the evidence that replaced the earlier claim:

- The earlier "MCP `userToken` 401s on every command except `get-profile`" was a
  **quoting artifact** in a throwaway token helper (quote-wrapped token, 345
  chars vs the true 343). With the corrected token the command API returns
  **HTTP 403 `error code: 1010`** — a Cloudflare browser-signature ban for
  non-browser clients; no bypass was attempted (standing boundary).
- The earlier "no live plugin/MCP session attached" was superseded the same day:
  the plugin lane came up and the run executed over it on the disposable file.

New supporting artifacts: `tools/penpot_target_guard.py` gained a purpose-scoped,
never-writable `disposable_file_ids` bucket; the verified disposable id was
recorded in `docs/design/PENPOT_TARGETS.yaml`; the run plan, authorization,
journal, summary and scoped jail policy live under
`evidence/runs/penpot-disposable-validation-2026-10-11/`. The verified run: 4/4
protocol ops (`ensure_page`, `create_node`, `create_component`,
`create_variable`) applied with independent read-back, idempotent re-dispatch
(counts all 1), and production/scratch/unknown guard refusals exercised
fail-closed. **No production or scratch write occurred.**

### 2.5 Stale-claim corrections

`docs/design/DESIGN_SYSTEM.md` corrected where it contradicted the register:

- `RESPONSIVE_SPEC.md` role: "values pending decision 26.8" → "values approved
  2026-10-08, decision 26.8"
- `PENPOT_IMPLEMENTATION_MAP.yaml` role: "readiness BLOCKED" → "contract
  APPROVED 2026-10-10 (26.16, Penpot Cloud); mapping NOT_STARTED; write subgate
  BLOCKED"
- lifecycle paragraph: removed "next unit is founder decision closure, then
  token establishment" / "Penpot work begins only after…"; replaced with the
  actual register counts and subgate state
- Penpot blocker paragraph: the §8.5 restatement obligation was **discharged
  2026-10-10** (26.16, new restated contract, never represented as recovered
  history); historical text remains `UNKNOWN`

## 3. Evidence of verification

| Check | Command | Result |
|---|---|---|
| Full test suite | `python -m unittest discover -s tests` | **Ran 1097 tests — OK** (was 1080; +17 new) |
| Compile | `python -m compileall -q company_os tools tests` | OK |
| Shell syntax | `bash -n scripts/gates.sh` | OK |
| Diff hygiene | `git diff --check` | clean |
| Manifest (deep) | `tools/validate_design_manifest.py` | PASS (290 unique items; CURRENT=30 REQUIRED=178 FUTURE=60 OUT_OF_SCOPE=22) |
| Decision effects | `tools/validate_decision_manifest.py` | PASS |
| Tokens + register | `tools/validate_design_tokens.py` | PASS |
| Graph | `tools/validate_design_graph.py` | PASS |
| Contract specs | `tools/validate_design_specs.py` | PASS (21 anchors) |
| Gate 2 enforced | `tools/design_gate_verifier.py --enforce GATE-2` | OK (exit 0) |
| Gate 3 refused | `tools/design_gate_verifier.py --enforce GATE-3` | REFUSE (exit 2) |

New tests added (17): 9 for the gate verifier (`tests/test_design_gates.py`),
4 deep-manifest fail-closed cases, 3 contract-spec fail-closed cases, 1
positive specs check. Fail-closed fixtures copy the real files and apply one
targeted mutation, so they exercise true file shapes.

## 4. Register state (single source of truth)

`DESIGN_DECISIONS.md` §26: **18 decisions — 14 APPROVED, 1 BLOCKED, 1
PENDING_ESCALATE, 2 PENDING.**

Open decisions blocking token establishment / downstream gates:

| Decision | Status | Meaning |
|---|---|---|
| 26.1 Brand mark | PENDING (asset) | direction (B) selected; no mark supplied/commissioned yet |
| 26.5 Logo lockup | PENDING (asset) | asset-gated via 26.1 |
| 26.9 Contact/intake path | BLOCKED | no submission backend; no contact form in v1 |
| 26.11 Terms/consent | PENDING_ESCALATE | standing risk; re-raise each review |

These are founder decisions, not agent decisions. No agent may set `APPROVED`.

## 5. Remaining owner decisions (not blockers I can clear)

1. ~~**Disposable Penpot target**~~ — **RESOLVED 2026-10-11**: a dedicated
   disposable target was authorized and the write surface verified live (subgate
   PASS). No further owner action needed for this subgate.
2. **26.1 / 26.5** — supply or commission the brand mark.
3. **26.9** — decide the contact/submission path (or confirm permanent
   exclusion for v1).
4. **26.11** — supply the minimum legal/privacy inputs.

## 6. Files changed / added this pass

- Modified: `tools/validate_design_manifest.py`, `scripts/gates.sh`,
  `docs/design/DESIGN_SYSTEM.md`, `tests/test_design_validators.py`,
  `tests/test_design_validators_failclosed.py`, `docs/design/PENPOT_TARGETS.yaml`,
  `tools/penpot_target_guard.py`, `tests/test_penpot_target_guard.py`
- Added: `tools/validate_design_specs.py`, `docs/design/DESIGN_GATES.yaml`,
  `tools/design_gate_verifier.py`,
  `evidence/runs/design-penpot-protocol-subgate-2026-10-11.md`,
  `tests/test_design_gates.py`,
  `evidence/runs/penpot-disposable-validation-2026-10-11/` (run plan,
  authorization, journal, summary, scoped jail policy), this report

No production Penpot asset was mutated. No client data was touched. The only
live external mutations were the four guarded, idempotent protocol ops on the
dedicated disposable file.

## 7. Honest limitations

- GATE-3's `register` check lists decisions 26.1/26.5/26.8/26.9/26.11 as the
  closure target. With the subgate now PASS, GATE-3 is no longer fenced by it —
  GATE-3 is itself BLOCKED because the register check fails: 26.1 and 26.5 are
  PENDING (assets), 26.9 is BLOCKED (contact path), 26.11 is PENDING_ESCALATE.
  It will report PASS only when those close.
- `scripts/gates.sh` as a whole requires Langfuse/promptfoo credentials for its
  external checks and is BLOCKED without them; this report verifies the
  deterministic design subset plus the full unit suite, which is what Gate 2
  requires.
- The gate verifier's BLOCKED status is derived, not stored; it re-computes
  from evidence every run. That is deliberate — a stored "PASS" label is
  exactly the failure mode the Company OS principle forbids.