# Phase D — Live Penpot end-to-end verification (2026-10-10)

Authorized, journaled, reversible live runs against the MCP-connected scratch
file **"Test File"** (`52a5041f-08a1-80f1-8008-c383654a1095`, page
`52a5041f-08a1-80f1-8008-c383654a1096`). Every run used `--write-authorized`
plus a recorded `--decision` reference, journaled under
`/tmp/opencode/penpot-live/`, and was verified by independent read-back (never
by a dispatch ack alone).

No URL and no token **value** is recorded here. The token exists in
`/home/genie/company-os/secrets/providers.env` (see the auth-probe evidence);
the MCP bridge is the sanctioned path. The worked file is the scratch file, not
the (absent) Company OS production workspace — see Blockers below.

## Two live defects found and fixed

1. **Provider misclassification (halted the first live run).**
   `tools/penpot_provider.py::_AUTH_MARKERS` contained the over-broad marker
   `"token"`. A Penpot plugin *validation* error ("Value not valid: token names
   …") was therefore classified as `AUTH_REQUIRED` → terminal state → the
first run halted with status `INCOMPLETE` and a `{"state":"AUTH_REQUIRED"}`
provider block. **Fix**: removed `"token"` from the marker set; genuine
   credential failures still classify via `auth`/`401`/`unauthori`/`forbidden`,
   and the MCP layer raises `McpAuthError` → `ProviderAuthRequired` directly.
   Added a regression assertion to the provider selftest.

2. **Font-family value not representable in Penpot.**
   Penpot's style-dictionary validator rejects any family name beginning with
   `-` (e.g. the WebKit alias `-apple-system` in the approved stack
`system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif`). **Fix**: `compile_design._penpot_adapt_font_family` quotes
   vendor-prefixed names at the Penpot boundary (`'-apple-system'`) — a
   CSS-equivalent form the validator accepts. Repository tokens are **not**
   rewritten (decision 26.2); only the Penpot plan value is adapted. The two
   compiler golden hash pins were re-pinned after this deliberate change.

## Run 1 — original attempt (with both defects live)

`run1.journal.json` — status `INCOMPLETE`. 4 token ops `VERIFIED`
(`semantic.color.action.primary`, `semantic.color.fg.inverse`,
`semantic.radius.md`, `semantic.space.card-padding`), then halted on
`semantic.type.family.body` (defect 2 caught by defect 1's misclassification).

## Run 2 — clean live E2E after fixes

`run2.journal.json` — **COMPLETED, 12/12 VERIFIED** (plan hash
`c030d06ee6b10393d0fc62fb0c5d22bc8867d0ced83f135adaccb22222b7280c`):

| op | kind | state |
|---|---|---|
| `var:semantic.color.action.primary` | create_variable | VERIFIED |
| `var:semantic.color.fg.inverse` | create_variable | VERIFIED |
| `var:semantic.radius.md` | create_variable | VERIFIED |
| `var:semantic.space.card-padding` | create_variable | VERIFIED |
| `var:semantic.type.family.body` | create_variable | VERIFIED |
| `var:semantic.type.leading.body` | create_variable | VERIFIED |
| `var:semantic.type.size.body` | create_variable | VERIFIED |
| `var:semantic.type.weight.bold` | create_variable | VERIFIED |
| `page:PAGE-001` | ensure_page | VERIFIED |
| `comp:COMP-ACT-01` | create_component | VERIFIED |
| `node:COMP-ACT-01:root` | create_node | VERIFIED |
| `node:COMP-ACT-01:root/label` | create_node | VERIFIED |

## Run 3 — idempotency re-run

`run3.journal.json` — **COMPLETED, 12/12 VERIFIED again** against the same
artifacts. A live read-back after both runs showed **no duplicates**: exactly
8 tokens in the `Company OS` set, 1 component, 1 page, 2 node shapes.

## Independent read-back of the resulting state (not marker-sourced)

Dumped via `penpot_execute_code` (read-only) after the runs:

- **Token set `Company OS` (8 tokens), stored values as Penpot keeps them:**
  - `semantic.color.action.primary` `color` → `#151515`
  - `semantic.color.fg.inverse` `color` → `#fafafa`
  - `semantic.radius.md` `dimension` → `14px`
  - `semantic.space.card-padding` `dimension` → `20px`
  - `semantic.type.family.body` `fontFamilies` → `["system-ui", "'-apple-system'",
    "'Segoe UI'", "Roboto", "'Helvetica Neue'", "Arial", "sans-serif"]`
  - `semantic.type.leading.body` `number` → `1.6`
  - `semantic.type.size.body` `dimension` → `1rem`
  - `semantic.type.weight.bold` `fontWeights` → `700`
- **Page `Home page`** carries `company-os:page_id = "PAGE-001"`.
- **Component `Primary`** (library) carries `company-os:manifest_id =
  "COMP-ACT-01"`.
- **Node shapes** found via `page.findShapes()` (the same accessor the read-back
  `observe` uses — an honest existence check; absence returns null → BLOCKED):
  - `COMP-ACT-01:root` (board) → `company-os:node_id = "node:COMP-ACT-01:root"`
  - `COMP-ACT-01:root / label` (text) →
    `company-os:node_id = "node:COMP-ACT-01:root/label"`

## Crash-recovery reconciliation

`recovery.journal.json` was crafted from `run2` by rewinding the idempotent
`var:semantic.type.family.body` op into `DISPATCHING` with the final states
trimmed (simulating a crash mid-write; `journal_hash` recomputed). Resumed with
`--resume`: the mid-flight op was **reconciled to VERIFIED from an independent
read-back** (op already present) and the run finished **COMPLETED, 12/12**.
The journal's checksum guard rejected a naive tampered edit before its hash was
recomputed — tamper-detection works as designed.

## Cleanup / reversibility

- The temporary probe set `Company OS FF Probe` (8 font-family probe tokens) was
  removed with `TokenSet.remove()` after the investigation; only the intended
  `Company OS` set remains.
- Every mutation is attributable: each op carries a `company-os:` provenance
  marker, the journals record intent + decisions, and each artifact can be
  removed by its documented marker / set / page name.

## Offline regression coverage after the fixes

- `test_penpot_provider.py` — 18 tests OK (incl. the new validation-vs-auth
  classification assertion).
- `test_design_compiler.py` — 60 tests OK (golden hash pins re-pinned).
- Design/Penpot subset `unittest discover -s tests -p 'test_penpot_*.py'` —
  **179 tests OK**.

## Blockers (unchanged)

- The intended Company OS production file does not exist; founder action needed
  in Penpot (File → MCP Server → Connect). Not possible via MCP (no file
  creation API).
- Direct RPC API: Cloudflare challenge (no permitted bypass); MCP bridge is the
  sanctioned path.
- `BLOCKER-3`: 22 `VALID_PENDING_DECISION` tokens remain scope-excluded.

## Honesty

All states above were observed live and journaled. "VERIFIED" means the
operation's `declared_effects` matched a read-back observation; the token
existence and stored-value facts were additionally dumped from the live store
in the independent read-back above. Nothing in this file claims the absent
Company OS workspace was touched.