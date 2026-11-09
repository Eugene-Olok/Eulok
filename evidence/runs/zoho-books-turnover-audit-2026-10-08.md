# Zoho Books Turnover-Reporting Capability Audit — 2026-10-08

Branch: `feat/zoho-books-turnover-configuration`
Base commit: `0f00946` (feat: deterministic Zoho CRM projection boundary (#3))
Audit date: 2026-10-08 (UTC)
Method: live, **read-only** HTTP GET against Zoho Books API v3 with the
existing provider credentials. No POST/PUT/DELETE. No financial records
created, changed, or deleted. Credentials are never echoed; the organization
id is redacted to its last four digits.

Raw transcript: `evidence/runs/zoho-books-turnover-audit-2026-10-08.log`
(no credential, token, client id, client secret, or refresh token appears in
that file or in this document).

Related prior evidence: `evidence/runs/zoho-books-live-verification-2026-10-08.md`

---

## 1. Purpose

Determine what native turnover/reporting capability can be **configured on the
current FREE plan** with the **current OAuth grant**, so the founder knows
exactly what is possible via API, what is UI-only, and what is unavailable —
without inventing capability or re-consenting scopes.

## 2. Organization (verified live)

| Field | Value |
|---|---|
| organization_id | `…0982` (redacted; matches configured id) |
| name | Company Os |
| currency | UGX (`currency_id` …95089) |
| country | Uganda |
| plan_name | **FREE** (`plan_type` 100, `version` global) |
| mode / org_type | live / live |
| is_org_active | true |
| is_trial_expired | false |
| is_solo_org | false |

## 3. Granted OAuth scopes (verified live)

```
ZohoBooks.contacts.CREATE        ZohoBooks.contacts.READ
ZohoBooks.settings.CREATE        ZohoBooks.settings.READ
ZohoBooks.invoices.CREATE        ZohoBooks.invoices.READ
ZohoBooks.customerpayments.CREATE ZohoBooks.customerpayments.READ
ZohoBooks.creditnotes.CREATE     ZohoBooks.creditnotes.READ
```

No scope for sales orders, estimates, expenses, journals, banking, projects,
bills, purchase orders, vendors, or reports.

## 4. Resource state (all read-only list calls, page 1)

| Resource | Result | Records |
|---|---|---|
| contacts | 200 | 0 |
| items | 200 | 0 |
| invoices | 200 | 0 |
| customerpayments | 200 | 0 |
| creditnotes | 200 | 0 |
| recurringinvoices | 200 | 0 |
| timeentries | 200 | 0 |
| salesorders | **401 code 57** | scope not granted |
| estimates | **401 code 57** | scope not granted |
| expenses | **401 code 57** | scope not granted |
| journals | **401 code 57** | scope not granted |
| bankaccounts | **401 code 57** | scope not granted |
| banktransactions | **401 code 57** | scope not granted |
| projects | **401 code 57** | scope not granted |

The organization currently holds **no financial records**. Reporting output
would therefore be empty until transactions are entered.

## 5. Report-endpoint probes (GET, read-only)

`401 code 57` = the path is recognized but the current grant is not authorized.
`404 code 5` = no such resource path.

| Path | Result |
|---|---|
| /reports/salessummary | 401 code 57 |
| /reports/salesbycustomer | 401 code 57 |
| /reports/salesbyitem | 401 code 57 |
| /reports/salesbysalesperson | 401 code 57 |
| /reports/invoicedetails | 401 code 57 |
| /reports/creditnotedetails | 401 code 57 |
| /reports/customerbalancesummary | 401 code 57 |
| /reports/profitandloss | 401 code 57 |
| /reports/cashflow | 401 code 57 |
| /reports/balancesheet | 401 code 57 |
| /reports/expensesbycategory | 401 code 57 |
| /reports/projectsummary | 401 code 57 |
| /reports/inventorysummary | 401 code 57 |
| /reports/paymentsreceived | 404 code 5 |
| /reports/agedreceivables | 404 code 5 |
| /reports/aging | 404 code 5 |
| /reports/incomeandexpense | 404 code 5 |
| /reports/profitbyitem | 404 code 5 |
| /reports/salesordersbycustomer | 404 code 5 |
| /reports/quotas | 404 code 5 |

**Interpretation (bounded):** `/reports/*` is **not a published API resource**
in the Zoho Books v3 API documentation (the only documented "reporting"
resource is *Reporting Tags*), and **no `ZohoBooks.reports.*` OAuth scope
exists** in the public scope list. Report endpoints are therefore not part of
the supported integration surface and are not accessible with any scope the
current client can obtain. This is a documentation-and-scope fact, not a claim
about plan marketing.

## 6. Scheduled-report endpoint probes (GET, read-only)

| Path | Result |
|---|---|
| /scheduledreports | 404 code 5 (Invalid URL Passed) |
| /reports/scheduledreports | 404 code 5 |
| /settings/scheduledreports | 404 code 5 (Invalid URL Passed) |
| /scheduledreports/settings | 404 code 5 (Invalid URL Passed) |
| /reportsettings | 404 code 5 (Invalid URL Passed) |
| /reports/schedules | 404 code 5 |
| /schedules | 404 code 5 (Invalid URL Passed) |

**No scheduled-report API endpoint exists.** Report scheduling is a web-UI
feature (see the runbook doc).

## 7. Other configurable settings (verified live)

| Path | Result | State |
|---|---|---|
| /settings/customfields | 200 | write plan-blocked (`118544`/`120129`, per prior evidence) |
| /settings/preferences | 200 | readable; settings scope grants write |
| /settings/taxes | 200 | 0 taxes configured |
| /settings/currencies | 200 | UGX base |
| /reportingtags | 200 | **0 reporting tags configured** |
| /settings/reportingtags | 404 code 5 | (correct path is `/reportingtags`) |

## 8. Capability matrix (FREE plan, current grant)

| Capability | API available? | Current access | Action taken |
|---|---|---|---|
| View standard reports (P&L, Sales by Customer/Item, Aging, etc.) | No published API (`/reports/*` 401) | — | Documented as UI-only |
| Schedule reports (weekly/monthly/quarterly/yearly → email) | No API (all 404) | — | Documented as UI-only |
| View / deactivate scheduled reports | No API | — | Documented as UI-only |
| Weekly Summary Report email | No API | — | Documented as UI-only |
| Custom reports | No API | — (paid-plan feature) | Documented; not available on FREE |
| Reporting Tags (`/reportingtags`) | Yes (settings scope) | READ+CREATE | **Deferred** — requires founder-defined dimensions |
| Taxes / Currencies / Preferences | Yes (settings scope) | READ (+CREATE) | Not changed (no turnover-reporting need) |
| Contacts/Items/Invoices/Payments/Credit Notes | Yes | READ+CREATE | Unchanged |
| Sales orders/Estimates/Expenses/Journals/Banking/Projects | Yes | 401 — not granted | Not changed (no scope expansion) |
| Custom fields | Yes | write plan-blocked | Unchanged |

## 9. Free-plan facts used above (sources)

- Reports module is available on the FREE plan (Zoho Books help, *Reports*).
- Scheduled reports: **5 reports on the FREE plan** (50 Standard, 200 Professional
  and above). Source: Zoho Books pricing FAQ "Is there a limit to the number of
  reports I can schedule?" and the *Manage Reports* plan table.
- **Custom reports are not offered on the FREE plan** (source: help, *Custom
  Reports*; plan list starts at Standard).
- Free-plan account limits: 1 user + 1 accountant, up to 1,000 invoices/year,
  available while annual revenue stays under the Free threshold (Zoho Books
  pricing page).
- The *Schedule Report* button is offered only on certain reports.
- Discrepancy noted honestly: the pricing page lists "API Access" under paid
  plans, yet read-only v3 GET calls succeed on this FREE organization. The
  integration relies only on what is verifiably granted (section 3).

## 10. Actions explicitly NOT taken (per founder directive)

- No Reporting Tags created (business dimensions not defined).
- No OAuth re-consent; no scope expansion requested.
- No turnover/accounting logic in Company OS created or modified.
- No financial records created, modified, or deleted.
- No organization settings changed.

## 11. Assumptions vs. facts

- **Fact:** plan, scopes, resource counts, and probe statuses above are live
  readings captured this session.
- **Fact:** `/reports/*` and every scheduled-report path probed are not
  usable with the current client/scope.
- **Recommendation (not fact):** the missing report/scheduled-report
  capability is a UI concern; the runbook doc describes the manual path.