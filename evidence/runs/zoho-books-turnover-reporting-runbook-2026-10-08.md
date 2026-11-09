# Runbook — Zoho Books turnover reporting (manual, FREE plan)

Scope: how a founder/admin sets up native turnover reporting inside the Zoho
Books web UI. There is **no API** for Zoho Books reports or report scheduling
(verified 2026-10-08; see `zoho-books-turnover-audit-2026-10-08.md`). This
runbook changes nothing in Company OS and involves no OAuth changes.

## Limits on the FREE plan

| Item | FREE plan limit |
|---|---|
| Standard reports | Available (P&L, Balance Sheet, Sales by Customer/Item/Salesperson, Invoice Details, Aging, Payments Received, Credit Note Details, Cash Flow, and more) |
| Scheduled reports | **5** |
| Custom reports | Not available (paid plans only) |
| Users | 1 user + 1 accountant |
| Invoices | up to 1,000/year |
| Availability | while annual revenue stays under the Free threshold |
| Export size | PDF up to 5,000 records; CSV/XLS/XLSX up to 20,000 records instantaneously |

## Prerequisite

You must be an **admin** of the organization (schedulers and report layouts are
admin-only). Organization: *Company Os* (UGX).

## A. View a standard report

1. Sign in to Zoho Books → select the *Company Os* organization.
2. Go to **Reports**.
3. Choose a turnover-relevant report, e.g. **Sales by Customer** or
   **Sales by Item** (Summary/Detail toggle where offered).
4. Set the date range (e.g. this month) and, if needed, group/filter by
   customer, item, or salesperson.
5. Export if desired: **Print** → PDF, or **Export** → CSV/XLS/XLSX.

Note: draft transactions do not appear in reports.

## B. Schedule a report (max 5)

1. Go to **Reports** → open the report you want (e.g. *Sales by Customer*).
2. Click **Schedule Report** (top-right, next to the Print icon). It is offered
   only on some reports.
3. Set:
   - **Schedule**: Weekly / Monthly / Quarterly / Yearly
   - **Start Date & Time**
   - **Email Recipients** (you and/or others)
   - **Format**: PDF / CSV / XLS
4. Click **Save**. The report is emailed automatically on the chosen cadence.

Suggested turnover baseline (if you want a starting set):
- Monthly **Sales by Customer** (who is producing revenue)
- Monthly **Sales by Item** (what is producing revenue)
- Monthly **Profit and Loss** (turnover vs. cost)
- Weekly **Payments Received** (collections)
- Monthly **Aging/Receivable Summary** (outstanding)

That is 5 schedules — the FREE-plan maximum. Choose accordingly.

## C. View / deactivate scheduled reports

1. **Reports** → click **Scheduled Reports** (top-right).
2. Review frequency, owner, recipients, status, next due date, and format.
3. To stop one, select it and use the deactivate/disable action.

## D. Weekly Summary Report

If enabled, Zoho Books emails the admin a weekly summary (income, expenditure,
cash flow, transaction overview, active projects, alerts). Enable it from the
report/reporting settings area of the UI.

## Turnover target

UGX 10M/month is a **management target only** — it is not a tax, EFRIS, or legal
threshold, and no custom Company OS infrastructure is needed to display it. Use
the standard reports above to compare actual turnover against the target.

## Verification after setup

- [ ] Each of the intended reports renders non-empty once transactions exist.
- [ ] Each scheduled report appears under **Scheduled Reports** with the right
   cadence, recipients, and next due date.
- [ ] The scheduled-report count is ≤ 5 (FREE-plan cap).
- [ ] A test email is received at the scheduled time (or confirmed on the next
   cycle).