---
name: scope-guard
description: Classify a new client request against the approved scope as IN SCOPE, CHANGE ORDER, or OUT OF SCOPE.
version: 1.0.1
metadata:
  hermes:
    tags: [company-os, client, scope, change-order]
    category: company-operations
---

# /scope-guard

## Purpose

Prevent uncontrolled scope expansion by comparing every new client request against the authoritative approved client scope.

## Core Rule

The approved `clients/<client>/SCOPE.md` is the source of truth.

Never infer that work is included merely because it is:

- technically small
- related to existing work
- requested urgently
- convenient to implement

## Required Inputs

- Client name
- Incoming request
- `clients/<client>/SCOPE.md`

Optional supporting evidence:

- `clients/<client>/DECISIONS.md`
- `clients/<client>/STATUS.md`
- approved change orders

## Fail-Closed Rules

If `SCOPE.md` does not exist:

```text
SCOPE DECISION: OUT OF SCOPE
CONFIDENCE: HIGH
APPROVAL REQUIRED: YES
