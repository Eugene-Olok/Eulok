# Zoho CRM Live Verification Chain Evidence — 2026-10-08

Branch: `feat/zoho-crm-projection`
Evidence captured: 2026-10-08 (UTC), this session
Chain result: **PASS — all 7 phases**

> No credential, token, secret, client id, client secret, or org id appears in
> this document or in any committed evidence file referenced here. Probe
> scripts live in the session workspace (`/tmp/opencode/audit/`) and are
> intentionally not committed; their captured, credential-free outputs are the
> evidence files listed below. Credential scan of all copied logs: clean.

---

```
Zoho CRM LIVE CHAIN (production client + projector classes)
phase0 marker absence          PASS (Leads/Accounts/Deals search: 0/0/0)
phase1 create path             PASS (3x SYNCED, actions create/create/create)
phase1.5 index settle          PASS (lag measured; counts 1/1/1)
phase2 repeat no-write         PASS (3x SYNCED, actions reconcile x3, 0 writes)
phase3 read-only reconcile     PASS (reconcile_client, Leads+Accounts verified)
phase4 controlled delete       PASS (3x success)
phase5 read-after-cleanup      PASS (0/0/0)
Tests: 694 OK (deterministic suite, this session); ruff clean
```

Evidence files:
`zoho-crm-live-chain-2026-10-08.log` (PASS run),
`zoho-crm-live-chain-cleanup-2026-10-08.log` (failed-run orphan cleanup),
`zoho-crm-datetime-probe-2026-10-08.log` (root-cause probe),
`zoho-crm-record-shape-2026-10-08.log` (GET record entry shape).

## 1. Chain phases (live, this session)

The chain uses the production `ZohoCRMClient`, `ZohoCRMProjector`, and
`reconcile_client` classes directly against the live org with a unique
synthetic marker per run (`client-coschain-<stamp>`). HTTP calls are recorded
by a wrapping transport and printed as `METHOD /path` only (query strings
withheld).

| Phase | What it proves | Result |
|-------|----------------|--------|
| 0 marker absence | Production search (`equals` operator, page 1, per_page 200) returns 0 matches for all three correlation values before any write; abort on presence | PASS (0/0/0) |
| 1 create path | Search(0) -> create -> staging read-back (payload round-trip) -> promote PUT (SYNCED) -> final read-back. Trace: per Lead/Account `search, POST, GET, PUT, GET`; per Deal `search, POST, GET` | PASS — statuses SYNCED x3, actions `create/create/create`, ids present |
| 1.5 index settle | Custom-field search results lag record creation; measured until each correlation is searchable | PASS — counts 1/1/1; observed lag: Leads **12.8 s**, Accounts 1.4 s, Deals 1.3 s |
| 2 repeat, no writes | Second `project_client` with identical record: search finds 1 match -> read -> no-op reconcile. Transport log contains GET only | PASS — actions `reconcile/reconcile/reconcile`, `writes=[]` (6 GETs) |
| 3 read-only reconcile | `reconcile_client(client, record)` re-verifies Leads + Accounts via search path without any write | PASS — both verified, GET-only |
| 4 controlled delete | `client.delete(module, id)` for the three records this chain created; success status required per delete | PASS — Deal/Lead/Account all `success` |
| 5 read-after-cleanup | All three correlation searches return 0 after cleanup (polled through delete-index lag) | PASS — (0, 0, 0), settled 0.0 s |

## 2. Live defect found and fixed by this chain (F-CRM-1)

The first chain run failed at the Lead promote step. Root cause, established
by direct probe against the live org:

- `Company_OS_Last_Verified` is `data_type: datetime` (field metadata probe,
  `crm-probe3-2026-10-08.log`).
- `_now()` emitted `2026-10-08T11:10:15.123456Z` (microseconds + `Z` suffix).
- Live PUT result: `400 INVALID_DATA: invalid data` (see
  `zoho-crm-datetime-probe-2026-10-08.log`, format probe lines).
- Format probe results: `...123456Z` REJECTED; `2026-10-08T11:10:15+00:00`
  ACCEPTED; the record then stored the value.

Fix: `_now()` now emits `isoformat(timespec="seconds")`
(`2026-10-08T11:10:15+00:00`) — explicit UTC offset, second precision.
Regression tests added:

- `test_timestamp_format_is_zoho_datetime_safe` (asserts the format).
- The ordered create test now asserts the promote PUT body carries a
  `Company_OS_Last_Verified` value matching that format.

Accounts were unaffected (no datetime custom field); Deals unaffected.

## 3. Failed-run history (kept honest, cleaned up)

The first chain run (stamp `20261008T111015Z`) failed (F-CRM-1) and left
records behind. Cleanup is durable evidence:

- `zoho-crm-live-chain-cleanup-2026-10-08.log` shows guarded deletion of
  **two Leads with the same correlation marker** (`7640641000000731003`,
  `7640641000000739001`) plus the extra Account (`7640641000000740001`),
  each guard-checked against the stamp's correlation before delete; final
  counts (0, 0, 0).

**Finding F-CRM-2 — provider uniqueness is not a guard we can rely on.**
The failed run's phase 2 searched immediately after creation (inside the
search-index lag window), saw 0 matches, and created a **second Lead with an
identical `Company_OS_Intake_ID` value — and the provider accepted it** (both
records existed; both were later found by the same search). The Lead custom
field metadata carries a unique case-insensitive flag, but live behavior did
not enforce it. Consequences, by design:

- We never claim provider-enforced uniqueness (directive R2), and this
  observation is the empirical basis for that stance.
- Within the observed lag window (≤ ~13 s in this run), a same-second retry
  can create a provider-side duplicate. The **next** run's search then
  classifies it as multi-match and hard-BLOCKs (`correlation_conflict`,
  no write, no merge, no delete) — unit-tested
  (`test_multi_match_blocks_without_write`) and safe, but the duplicate
  requires operator cleanup (as performed above).
- Company OS's logical idempotency (search-first classification + BLOCK on
  ambiguity) is the authoritative guard; normal retry cadence (minutes)
  exceeds the observed lag.

## 4. Verification results

- Deterministic suite: `Ran 694 tests … OK` (this session, includes the new
  timestamp regression tests); `ruff check .` clean.
- PR #3 diff contains no credentials (gitleaks gate + manual scrub).
- The chain writes were limited to the synthetic `client-coschain-<stamp>`
  marker records, all deleted in phase 4; read-after-cleanup is 0/0/0.

## 5. Reproduction (no secrets embedded)

```bash
cd ~/company
# credentials are sourced in a subshell only; never printed:
bash -c 'set -a; . ~/company-os/secrets/providers.env; set +a; \
  .venv/bin/python /tmp/opencode/audit/crm_chain.py'
.venv/bin/python -m unittest discover -s tests
```
