---
name: weekly-close
description: Produce an auditable weekly operating close covering delivery, blockers, clients, cash movement, receivables, payables, decisions, risks, and next-week priority.
version: 1.0.0
metadata:
  hermes:
    tags: [company-os, operations, finance, weekly-close]
    category: company-operations
---

# /weekly-close

## Purpose

Create the company's weekly operating record.

This is an evidence report, not a motivational summary.

## Core Rule

Never fabricate financial activity.

Distinguish between:

- confirmed zero
- confirmed amount
- unknown
- not recorded

UNKNOWN is never equivalent to 0.

## Inputs

Review, where available:

- clients/*/STATUS.md
- clients/*/SCOPE.md
- clients/*/DECISIONS.md
- products/*
- finance/*
- recent Git history
- repository status
- previous weekly-close records

## Procedure

1. Determine the reporting period.
2. Review shipped work.
3. Review blocked work.
4. Review important decisions.
5. Review client status.
6. Review product status.
7. Review confirmed cash in.
8. Review confirmed cash out.
9. Review receivables.
10. Review payables.
11. Identify operational risks.
12. Identify unresolved items.
13. Select one evidence-backed primary priority for next week.
14. Explicitly record unknown financial information.
15. Create a new weekly-close record.

## Required Structure

# Weekly Close — YYYY-Www

## 1. Executive State

## 2. Shipped

## 3. Blocked

## 4. Client Status

## 5. Product Status

## 6. Cash In

## 7. Cash Out

## 8. Receivables

## 9. Payables

## 10. Decisions

## 11. Risks

## 12. Open Items

## 13. Next Week

## 14. Evidence

## Financial Rules

Every financial figure must include:

- amount
- currency
- date
- source
- status

Never infer a balance from incomplete information.

Never alter an historical weekly close silently.

If a close already exists for the same reporting period, stop and require explicit correction handling.

## Next-Week Priority

Choose one primary priority based on documented evidence such as:

- committed client work
- blocked revenue
- critical dependency
- overdue receivable
- material operational risk

Do not manufacture urgency.

## Verification

Before completion confirm:

- reporting period is explicit
- shipped work has evidence
- blockers are concrete
- financial figures have sources
- unknown values are explicitly marked
- client status comes from current records
- historical closes were not overwritten
- one primary next-week priority is recorded

## Uganda Reporting Currency

The Company OS primary reporting currency is **UGX (Ugandan shillings)**.

All company-level financial totals, cash-flow summaries, revenue, expenses, receivables, payables, and weekly-close amounts MUST be reported in UGX.

If a source transaction is denominated in a foreign currency:

1. Preserve the original amount and original currency.
2. Convert the amount to UGX.
3. Record the FX rate used.
4. Record the FX-rate date.
5. Record the authoritative FX source.
6. Use the UGX amount for the company-level total.

Never invent an exchange rate and never silently convert currencies.

## Financial State

Use these states precisely:

- **CONFIRMED ZERO** — an authoritative financial record explicitly establishes zero.
- **CONFIRMED AMOUNT** — an authoritative financial record establishes a non-zero amount.
- **UNKNOWN** — the amount cannot currently be determined.
- **NOT RECORDED** — the company has no authoritative record from which the amount can be established.

Never infer CONFIRMED ZERO merely because a directory, ledger, or transaction list is empty.

Absence of records is not evidence that the financial amount is zero.

When an amount is not established, report it as:

Amount: UNKNOWN
Currency: UGX
Status: NOT RECORDED

