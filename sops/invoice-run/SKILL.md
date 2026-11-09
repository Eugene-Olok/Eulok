
---

# 2. `sops/invoice-run/SKILL.md`

This one needs a stronger financial boundary than the previous version. In particular, **invoice preparation and invoice issuance must be separate states**.

```markdown
# /invoice-run

## Purpose

Prepare an auditable invoice draft from approved commercial records.

This skill determines whether an amount is supported by the company's recorded
commercial facts. It does not invent charges, approve invoices, mark invoices
paid, or change commercial agreements.

The Git repository is the source of truth for company-side commercial records.

---

## Invocation

Use:

`/invoice-run <client>`

The client must correspond to:

`clients/<client>/`

Directories beginning with `_` are reserved/template directories and are not
valid clients.

---

## Authoritative inputs

Required:

- `clients/<client>/CLIENT.md`
- `clients/<client>/SCOPE.md`
- `clients/<client>/DECISIONS.md`
- approved proposal/commercial record

Where applicable, also require:

- delivery evidence;
- milestone acceptance;
- approved change order;
- prior invoice record;
- payment record.

The skill must identify the exact source record for every invoiceable item.

---

## Preconditions

BLOCK if:

- the client directory does not exist;
- `SCOPE.md` is missing;
- commercial terms cannot be established;
- the relevant work is not approved;
- a required milestone has not been accepted;
- an amount cannot be derived from an authoritative record;
- currency is unknown;
- payment terms are unknown where required;
- a supposed change order has not been approved.

`UNKNOWN` is never equivalent to zero.

---

## Invoiceable work

An item may be included only when it is supported by an approved commercial
basis.

Valid bases include:

- approved fixed-price deliverable;
- approved milestone;
- approved change order;
- explicitly approved reimbursable expense.

Anything else is:

`BLOCKED — COMMERCIAL BASIS NOT ESTABLISHED`

---

## Change-order rule

A request or discussion does not constitute an approved change order.

The skill must distinguish:

```text
REQUESTED
PENDING APPROVAL
APPROVED
REJECTED
