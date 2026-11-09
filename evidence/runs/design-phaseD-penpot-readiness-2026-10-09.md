# Design Phase D — Penpot Integration Readiness (Evidence)

**Date:** 2026-10-09 (UTC)
**Branch:** `feat/design-gate2` (HEAD `efbfb8a`; parent `798234c`)
**Scope:** Read-only readiness verification of the Penpot workstream for design Gate 3 Phase D.
Establish what is actually operational (MCP connectivity, Penpot operations, authentication,
document access) and separate checks that can proceed now from founder decisions that remain
blocked. **No integration was implemented.**
**Baselines (not repeated):** Gate 1 audit `evidence/runs/design-system-audit-2026-10-08.md`;
Gate 2 verification `evidence/runs/design-gate2-verification-2026-10-08.md`; Gate 3 closure
`evidence/runs/design-gate3-decision-closure-2026-10-08.md` (§19.7 Penpot MCP check).

This report records observed facts and their verification methods only. It claims no Penpot
readiness, creates no Penpot structure, and contains no secret values.

> **SUPERSEDED IN PART — 2026-10-10.** Runtime state has since changed. The following
> observations in this 2026-10-09 snapshot are **no longer current** and are corrected in
> `evidence/runs/design-phaseD-penpot-diagnostic-2026-10-10.md` and
> `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml`: **§1 facts 1 and 3** and the trailing clause of
> **fact 4** — the Penpot MCP server **is now configured**, the live bridge **is operational**
> (probe succeeded; Penpot 2.18.3), and `PENPOT_MCP_URL` **is now wired** — and the §1
> "Penpot is not operational" verdict. Additionally **§1 fact 7** is superseded: decision
> **26.16 was approved 2026-10-10** (founder restated the §8.5 contract verbatim; Penpot Cloud
> selected), so the register is now 14 APPROVED / 1 BLOCKED / 1 PENDING_ESCALATE / 2 PENDING and
> `PENPOT_IMPLEMENTATION_MAP.yaml` readiness is `PARTIAL` (BLOCKER-1/2 resolved; the 22 pending
> tokens stay excluded from modelling). The target Company OS file remains **unconfirmed**
> (created by the founder in the Penpot app). The original text below is preserved
> unedited as the 2026-10-09 audit record.

---

## 1. Verified configuration facts

| # | Fact | Verification method |
|---|------|---------------------|
| 1 | The only MCP server configured in the inspected configuration is **GBrain** (`~/.config/opencode/opencode.json` → `mcp.gbrain`, type `local`, enabled). | Config inspection. |
| 2 | The project config (`opencode.json`) is provider-only and contains **no `mcp` section**; `.opencode/opencode.json` and `.opencode/opencode.jsonc` are empty. | Config inspection. |
| 3 | **No Penpot MCP tools and no connected Penpot client** are available in the inspected session. The exposed tool surface is GBrain tools plus built-in tools; there is no `penpot.*` entry. | Tool-surface inspection. |
| 4 | `PENPOT_MCP_URL` is **present** in the external secrets file `/home/genie/company-os/secrets/providers.env` (directory mode `700`, file mode `600`, located **outside** this repository) and is **not wired into any MCP client**. | Secret key-name listing only; value never read. |
| 5 | No secrets are tracked by Git: `git ls-files` shows no `secrets/` path and no `providers.env`. | `git ls-files`. |
| 6 | `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml` remains `status: NOT_STARTED`; `readiness.state: BLOCKED` (BLOCKER-1…3); `penpot_contract: NOT_YET_RESTATED`; `components`/`pages`/`tokens` are empty `{}`. | File read. |
| 7 | Decision **26.16** remains `BLOCKED` (`depends_on: ["26.17"]`); register totals are 18 decisions — 13 APPROVED, 2 BLOCKED, 1 PENDING_ESCALATE, 2 PENDING. Decision **26.17** is unchanged. | Decision register read (`docs/design/DESIGN_DECISIONS.md`). |
| 8 | Token approval remains **104 of 126** VALID_APPROVED, **22** VALID_PENDING_DECISION, **0** INVALID (GOV-004 deferred/ownerless tokens). | `tools/validate_design_tokens.py`. |

**Verdict:** Penpot is **not operational**. There is no connected client, no authentication
path, no document access, and no Penpot operations to enumerate. This is a deterministic
configuration fact, not a failed test.

## 2. Checks not performed (and why)

1. **Live MCP connectivity handshake — NOT ATTEMPTED.** Making a call with the secret URL is
   the first integration step, and BLOCKER-1 names the founder as the actor who wires/approves
   the remote Penpot MCP connection. Connectivity is therefore **unverified-by-design**, not
   "passed" or "failed".
2. **Authentication — NOT ATTEMPTED.** Cannot be tested without a connected client.
3. **Document access — NOT ATTEMPTED.** No Penpot document/workspace is configured or reachable.
4. **Operation enumeration — NOT ATTEMPTED.** No Penpot MCP tool surface is exposed.

## 3. Founder decisions required (blocked, outside agent authority)

1. **26.16** — restate/approve the §8.5 Penpot contract text (unrecoverable, audit §27.A) and
   choose hosting (cloud vs self-host vs drop-for-v1).
2. **BLOCKER-1 unblock** — founder configures/approves the remote Penpot MCP connection
   (wire `PENPOT_MCP_URL` into a client; the URL stays secret and is never written to this repo).
3. **BLOCKER-3 unblock** — approve the 22 ownerless GOV-004 tokens when real consumer
   requirements justify values; only VALID_APPROVED tokens may be modelled.
4. Retained, out of Penpot scope: brand asset (26.1/26.5); jurisdiction/data-processing (26.11);
   LCP/CLS browser-lane decision (TEST-007 byte-budget only).

## 4. Work that can proceed independently

- Repo-authority design work (token/component/page contracts, validators, tests) is unaffected
  by the Penpot block and continues under `docs/design/` authority.
- No Penpot work may begin until BLOCKER-1…3 clear (per `PENPOT_IMPLEMENTATION_MAP.yaml`
  `rules_when_unblocked`): no Penpot file/variable/component is created before then.

## 5. Non-implementation confirmation

- No Penpot file, variable, component, or frame was created.
- No MCP configuration was changed and no MCP entry was added.
- No secret was read, copied, logged, or included in this evidence.
- No live connectivity, authentication, document-access, or operation-enumeration test was run.

## 6. Verification note (self-correction)

The first secret-key probe (`^PENPOT_MCP_URL=`) returned "absent" because the secrets file uses
`export KEY=value` assignments; the `export ` prefix caused the anchored pattern to miss. Re-run
with an `export`-aware key-name listing confirmed the `PENPOT_MCP_URL` key is present. No other
discrepancy was found; the recorded §19.7 check in the Gate 3 closure evidence matches the
current runtime state.

---

## 7. Files inspected (read-only)

- `~/.config/opencode/opencode.json`, `opencode.json`, `.opencode/opencode.json`,
  `.opencode/opencode.jsonc`
- `/home/genie/company-os/secrets/providers.env` (key names only; no values displayed)
- `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml`, `docs/design/DESIGN_DECISIONS.md`
- `tools/validate_design_tokens.py` (run)
- `git ls-files`

**No staging, commit, push, MCP configuration change, connectivity attempt, or Gate 3
completion is claimed or performed by this evidence.**
