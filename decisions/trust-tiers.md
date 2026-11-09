# Trust Tiers for gbrain Repository Ingest

Decision date: 2026-09-23

## Policy

Every repository is classified into one of four trust tiers controlling
whether gbrain (and gstack ingestion) may read and write from it:

| Tier | Effect | Applies to |
|---|---|---|
| `read-write` | search + write new pages | company/ repo and own product repos |
| `read-only` | search allowed, never write | client repos |
| `deny` | no gbrain interaction at all | repos containing live financial data |

## Enforcement

The operational mapping lives in the machine trust store:

```
~/.gstack/gbrain-repo-policy.json   (mode 0600, normalized per-remote keys)
```

This file is the single authority used by ingestion gates. This document is
the durable record of the mapping.

## Current mapping (as of 2026-09-23)

### read-write — company + own products

| Remote | Notes |
|---|---|
| `github.com/eugene-olok/company-os` | company/ repo |
| `github.com/eugene-olok/gstack-artifacts-genie` | company artifacts |
| `github.com/eugene-olok/colibri` | own product |
| `github.com/eugene-olok/dagala` | own product |
| `github.com/eugene-olok/devapp` | own product |
| `github.com/eugene-olok/my-site` | own |
| `github.com/eugene-olok/atlas` | own |
| `github.com/eugene-olok/med-tracker` | own product |
| `github.com/eugene-olok/symptom-navigator` | own product |
| `github.com/eugene-olok/micro_insure` | own product (teaching tool, not live financial data) |
| `github.com/eugene-olok/freecodecamp` | own/fork |
| `github.com/eugene-olok/whatsappclone` | own |
| `github.com/eugene-olok/curated-programming-resources` | own |
| `github.com/eugene-olok/ml-study-guide` | own |
| `github.com/eugene-olok/alx-low_level_programming` | learning |
| `github.com/eugene-olok/alx-pre_course` | learning |
| `github.com/eugene-olok/alx-system_engineering-devops` | learning |
| `github.com/eugene-olok/alx-zero_day` | learning |

### deny — live financial data

| Remote | Notes |
|---|---|
| `github.com/eugene-olok/vsla-platform` | VSLA ledger platform |
| `github.com/eugene-olok/vsla` | VSLA digital ledger of contributions/loans |

### read-only — client repos

None identified on this account as of 2026-09-23.

## Change discipline

- A repo with no mapping resolves to `unset`/`none` at ingestion time — treat
  it as not approved.
- Adding a client repo requires a founder decision and a new `read-only`
  entry in the trust store, plus a decision record here.
- Classifying a repo under `deny` is a one-way security decision; record the
  reason in the Notes column.