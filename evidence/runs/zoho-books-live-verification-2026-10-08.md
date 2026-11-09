# Zoho Books Live Verification Evidence — 2026-10-08

Branch: `feat/zoho-crm-projection`
HEAD at session start: `05952fa` (fix: make deterministic gates green without weakening them)
Audit marker: `COS-AUDIT-1791419246` (date 2026-10-08)
Evidence captured: 2026-10-08 (UTC), all runs executed this session
Revision: end-of-closure update — directive supersession, live re-verification
of R1/R3/R5, and the fail-closed negative chain.

> Every value below is taken from a committed evidence file in this directory
> or a deterministic run captured this session. No credential, token, secret,
> client id, or client secret appears in this document or in any committed
> evidence file (gitleaks gate + manual scrub both pass).

---

```
Zoho Books LIVE VERIFICATION REPORT (revised)
Status: FAIL-CLOSED NEGATIVE CHAIN PASS — full write chain not achievable
        on this org (documented, with remediation options; see section 9)
Live read verification:     PASS (discovery, refresh, list enumeration)
Live fail-closed chain:     PASS (A marker absence, B field absent,
                             C create rejected with provider detail,
                             D no record created)
Live write chain:           NOT ACHIEVABLE on this org — custom fields are
                             plan-blocked (400/118544 on field creation,
                             400/120129 on use); granted scope still lacks
                             UPDATE/DELETE (re-verified this closure)
Directive remediation check (re-verified live):
  R1 re-consent: performed (refresh works) BUT scope still CREATE/READ only
  R2 uniqueness: NOT REQUIRED (directive) — and not provider-enforced anyway
  R3 currency:   CONFIGURED (ZOHO_BOOKS_CURRENCY_IDS_JSON -> ["UGX"])
  R4 env:        clean-shell providers.env convention in use (all probes)
  R5 orphan:     DELETED — contact list now 0 (read-only confirmation)
Company OS tested as sole authority: PASS (all live attempts fail closed;
  no external state accepted as authority; Zoho projectable-only)
Tests: 694 OK (deterministic suite, this session); ruff clean
```

---

## 1. Credential and granted-scope baseline

| # | Probe | Command | Result | Evidence file |
|---|-------|---------|--------|---------------|
| 1 | Ambient credentials (shell env as-is) | `.venv/bin/python <auth_probe>` | access token → HTTP 401 code 57; refresh (body and header style) → `invalid_client` | `zoho-books-auth-ambient-2026-10-08.log` |
| 2 | `providers.env` credentials (sourced, values never printed) | `set -a; . ~/company-os/secrets/providers.env; set +a; .venv/bin/python <auth_probe>` | refresh → HTTP 200, token issued, `expires_in` 3600; header-style refresh → `invalid_client` (body style works) | `zoho-books-auth-providersenv-2026-10-08.log` |
| 3 | **Scope re-verification (this closure)** | body-style refresh; scope string only printed | see verbatim quote below — **unchanged: no UPDATE/DELETE for any module** | `zoho-books-granted-scope-2026-10-08.log` |

Granted scope exactly as returned by the OAuth refresh endpoint (field `scope`,
this closure):

```
ZohoBooks.contacts.CREATE ZohoBooks.contacts.READ ZohoBooks.settings.CREATE
ZohoBooks.settings.READ ZohoBooks.invoices.CREATE ZohoBooks.invoices.READ
ZohoBooks.customerpayments.CREATE ZohoBooks.customerpayments.READ
ZohoBooks.creditnotes.CREATE ZohoBooks.creditnotes.READ
```

**Directive R1 ("re-consent done") was verified live: the refresh flow works,
but the granted scope is unchanged — still no `UPDATE`/`DELETE` scope for any
module.** Re-consent therefore did not widen the consented scope list; per
official Zoho OAuth documentation, scopes are granted per module × operation
and are fixed by the connected app's configured scope list, which is changed
in the Zoho API Console (founder action) before re-consent can grant more.

## 2. Live phase results (production harness `books_live.py`)

Combined capture: `zoho-books-live-phases-2026-10-08.log`

| Phase | Command | Result | Notes |
|-------|---------|--------|-------|
| status | `books_live.py status` | recorded state | marker set; `records: {}` (empty); `uq_outcome: first_create_failed`; currency mapping obtained from organizations endpoint |
| discovery | `books_live.py discovery` | PASS | 1 organization; configured org name matched; `currency_id` present in org object; token refreshed through production client |
| reads | `books_live.py reads` | PASS | contacts OK, items/invoices/customerpayments/creditnotes OK (0 records) |
| fields | `books_live.py fields` | FAIL (expected — F2) | `Company_OS_Client_ID/Item_ID/Invoice_ID/Credit_Note_ID` all `expected_label_present: false`, `unique_flag: absent`; contact entity returns 0 fields; payment custom-field entity name still unresolved (`endpoint_ok: false` for all tried entity names) |
| uniqueness | `books_live.py uniqueness` | recorded outcome replay | `outcome: first_create_failed` — original probe failed on first create (custom field absent, F2); provider-level uniqueness could not be exercised |
| write | `books_live.py write` | FAIL-CLOSED, no records | `write_contact` → validation failure, `record_stored: false`; `write_item` → same; `synced: false`, `verified: false`; **no record stored, no external state mutated** |

## 3. Fail-closed negative chain (this closure — production classes)

Evidence file: `zoho-books-negative-chain-2026-10-08.log`
Script: `/tmp/opencode/audit/books_chain.py` (session workspace, not committed).
Uses production `ZohoBooksClient` + `ZohoBooksProjector` directly; HTTP calls
printed as `METHOD /path` only.

| Phase | What it proves | Result |
|-------|----------------|--------|
| A marker absence | `find_by_correlation("contact", "Company_OS_Client_ID", marker)` performs a complete list enumeration on the live org and returns `[]` before any write | PASS |
| B custom field absent | `GET /settings/customfields` returns `contact_field_count=0, labels=[]` — the correlation label does not exist (plan-blocked) | PASS |
| C create rejected fail-closed | `project_client(record)` → status `ERROR`, class `validation`, `zoho_id: None`, provider detail verbatim: `400: code 120129: A custom field with the label Company_OS_Client_ID doesnot exist. Please check.` — error surfaces the provider message, no silent success, no partial write | PASS |
| D no record created | `find_by_correlation` re-enumeration still returns `[]` | PASS |

The trace also shows a transparent `POST /oauth/v2/token` refresh mid-chain —
the auth path works end-to-end with the clean-shell `providers.env` convention
(directive R4).

## 4. Diagnostic probes

| # | Probe | Result | Evidence file |
|---|-------|--------|---------------|
| 1 | Scope behavior control (same token: GET / PUT / DELETE on the orphan contact, list, invoices read) | GET → 200 code 0; GET by id → 200; **PUT → 401 code 57 "You are not authorized to perform this operation"**; **DELETE → 401 code 57** same message; list-after → no mutation; invoices read → 200 | `zoho-books-scope-probe-2026-10-08.log` |
| 2 | Raw upsert replication (post-fix payloads, production `build_*_payload` + `X-Unique-Identifier` headers) | `PUT /contacts` → 401 code 57; `PUT /items` → 401 code 57; control reads → 200. Fail-closed: nothing created. **Historical only: these headers were removed from production code this session** (search-first classification replaced upsert; see section 7) | `zoho-books-upsert-probe-2026-10-08.log` |
| 3 | **F4 A/B probe** (same token, same `/items` PUT, only `product_type` differs) | Variant A (legacy `"services"`): **400 code 2 "Invalid value passed for product_type"**. Variant B (fixed `"service"`): **401 code 57** — payload validation now passes, request reaches the missing-scope rejection. Control read → 200 | `zoho-books-item-product-type-ab-2026-10-08.log` |
| 4 | **F2 custom-field cause** (POST `/contacts` with the configured label; creating variant intentionally excluded — see note) | `with_custom_field` → **400 code 120129 "A custom field with the label Company_OS_Client_ID doesnot exist. Please check."**; `custom_field_cf_api_name` (`cf_company_os_client_id`) → 400 code 120129, same message with that label. `created_count: 0` | `zoho-books-customfield-probe-2026-10-08.log` |

Note on probe 4: the variant `without_custom_field` was executed exactly once,
in the first run of this probe (session transcript), and it **created** the
contact (`HTTP 201`, then cleanup `DELETE` → 401 code 57 because of F3). It is
intentionally excluded from the committed re-run because re-executing it would
create a second undeletable contact. First-run transcript outcome, quoted:

```
variant without_custom_field → http_status 201, created: true
cleanup: status 401, code 57
created_count: 1
probe_contacts_remaining: 1
```

## 5. State re-verification (this closure)

Evidence file: `zoho-books-state-check-2026-10-08.log`

| Directive item | Live re-verification | Result |
|----------------|----------------------|--------|
| R1 re-consent | body-style refresh succeeds; scope field quoted verbatim in section 1 | **Refresh works; scope still lacks UPDATE/DELETE** — remediation unchanged (API Console scope config + re-consent) |
| R3 currency | `ZOHO_BOOKS_CURRENCY_IDS_JSON` parsed by `ZohoBooksConfig.from_env()` → keys `["UGX"]` | **CONFIGURED** |
| R4 env | every probe this session ran under the clean-shell convention `set -a; . providers.env; set +a; …`; no ambient credentials used | **In use** |
| R5 orphan | live contact list enumeration → `listed: 0` (org has no contacts) | **RESOLVED** — orphan `COS-AUDIT-1791419246 PROBE-B` deleted manually; confirmed read-only |

## 6. Findings

| ID | Finding | Status | Evidence |
|----|---------|--------|----------|
| F1 | Production ambient `ZOHO_BOOKS_*` credentials are stale: access token rejected (401/57), refresh fails (`invalid_client`). | CLOSED BY CONVENTION — all flows now source `providers.env` in a clean shell (directive R4); ambient env is never used | `zoho-books-auth-ambient-…`, `zoho-books-auth-providersenv-…` |
| F2 | All five `Company_OS_*` correlation custom fields are absent in the live Books org and **cannot be created** (`POST /settings/fields` → 400/118544 — plan limitation); provider rejects any payload carrying them (400/120129). | OPEN — org limitation; fail-closed chain proves safe behavior (section 3). Remediation options in section 9 | `zoho-books-customfield-probe-…`, `zoho-books-negative-chain-…` |
| F3 | Granted scope lacks UPDATE and DELETE for every module. Behavioral probes agree: PUT/DELETE → 401 code 57. **Re-verified this closure: scope unchanged.** | OPEN — requires API Console connected-app scope config + re-consent (founder) | `zoho-books-granted-scope-…`, `zoho-books-scope-probe-…` |
| F4 | `build_item_payload` emitted `product_type: "services"`, outside the official Zoho enum (`goods` \| `service` \| `digital_service`). | **FIXED earlier this session** — production code emits `"service"`; regression test added; live A/B probe proves the fix | `zoho-books-item-product-type-ab-…` |
| F5 | `ZOHO_BOOKS_CURRENCY_IDS_JSON` unset in production config. | **RESOLVED** — configured; live check parses keys `["UGX"]` | `zoho-books-state-check-…` |
| F6 | One orphan probe contact remained, undeletable over the API (no DELETE scope). | **RESOLVED** — deleted manually (directive R5); read-only confirmation: contact list `listed: 0` | `zoho-books-state-check-…` |
| F7 | Books correlation custom fields are matched by **label** in payloads; whether Books **list** responses include `custom_fields` is unverifiable on this org (0 records, field absent). | OPEN ASSUMPTION — `find_by_correlation` client-side matching relies on documented list response fields; on a capable org this must be re-verified with a real record before relying on crash-window recovery via list search | code `zoho_books.py` (`find_by_correlation`), section 3 |

## 7. What was fixed this session (Books)

- `company_os/integrations/zoho_books.py`
  - `build_item_payload` maps to the official `"service"` enum (F4).
  - `_request_json` now raises `ZohoBooksAuthenticationError` for 401/403
    **with the provider error detail preserved** (`401: code 57: …`), and
    validation errors carry `code: message` detail (proven live: phase C of
    the negative chain surfaces `code 120129` verbatim).
  - **`upsert_unique` removed** — the `X-Upsert` / `X-Unique-Identifier-*`
    header technique is gone from production code; idempotency now comes from
    search-first classification (section 8).
  - New primitives: `create`, `update`, `_record_id`, `find_by_correlation`
    (bounded enumeration, `None` = fail closed), `_list_record_matches`.
  - `_project` is search-first: 0 matches → create + read-back; 1 match →
    reconcile or drift-corrected update; many matches → hard BLOCKED;
    scan bound → BLOCKED. Never first/newest/merge/delete.
- `tests/test_zoho_books.py` — rewritten client/projector tests covering
  create/reconcile/update/BLOCK/scan-bound/auth-detail/validation-detail and
  asserting no uniqueness headers are sent.
- Deterministic suite: `Ran 694 tests … OK`; ruff clean.

## 8. Official-documentation verification (recorded, not assumed)

- OAuth scopes are granted per **module × operation**
  (`ZohoBooks.<module>.CREATE|READ|UPDATE|DELETE|ALL`); `items` mutations are
  governed by the **`settings`** scope family (Create Item → `settings.CREATE`,
  Update/Delete Item → `settings.UPDATE` / `settings.DELETE`).
- The former upsert technique (`PUT /contacts` + `X-Unique-Identifier-Key` +
  `X-Unique-Identifier-Value` + `X-Upsert`) is the documented **"Update …
  using a custom field's unique value"** flow; it required the target custom
  field to exist and reject duplicates. It has been **removed** in favor of
  search-first classification (which needs no special headers and fails closed
  on ambiguity).
- Item `product_type` allowed values: `goods`, `service`, `digital_service`.

## 9. Books remediation options (for the final contract)

Books full-chain verification (create → read-back → repeat → reconcile →
delete) is **not achievable on this org today**: correlation custom fields are
plan-blocked (F2) and granted scope lacks UPDATE/DELETE (F3). Options, none of
which were silently taken:

| Option | What it requires | What it unlocks |
|--------|------------------|-----------------|
| A (current, default) | Nothing — status quo | Books writes stay fail-closed (verified); CRM carries the full projection chain (verified this session). Recommended until Books is actually needed |
| B | Founder: Books plan upgrade enabling custom fields + provision the five `Company_OS_*` fields (label-matched) | Enables Books create path; still needs option C for update/delete |
| C | Founder: add `UPDATE`/`DELETE` scope families for contacts/invoices/customerpayments/creditnotes/settings in the Zoho API Console connected app, then re-consent | Enables drift-correction updates and controlled cleanup |
| D (B+C together) | Both above | Full Books chain becomes testable; re-run the same chain harness (phase script pattern is committed as evidence) and re-verify the F7 list-`custom_fields` assumption with a real record |

Provider-enforced uniqueness is **not** part of any option: it is not
required (directive R2) and, where observable (CRM this session), the provider
did not enforce it anyway. Company OS search-first classification + BLOCK on
ambiguity is the authoritative idempotency mechanism.

## 10. Reproduction (no secrets embedded)

```bash
cd ~/company
# credentials are sourced in a subshell only; never printed:
bash -c 'set -a; . ~/company-os/secrets/providers.env; set +a; \
  .venv/bin/python /tmp/opencode/audit/books_chain.py'
.venv/bin/python -m unittest discover -s tests
```

Probe scripts live in the session workspace (`/tmp/opencode/audit/`) — they
contain hardcoded session paths and are intentionally not committed; their
captured, credential-free outputs are the evidence files listed above.
