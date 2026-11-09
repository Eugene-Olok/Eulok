# Penpot Disposable-Target Validation — Founder Authorization

**Date:** 2026-10-11
**Governing contract:** Decision 26.16 (Penpot Cloud + design synchronization
contract, APPROVED 2026-10-10) — repository authoritative, Penpot downstream-only.
**Target:**
`docs/design/PENPOT_TARGETS.yaml` (the fail-closed target policy consumed by
`tools/penpot_target_guard.py`).

## Authorization (verbatim, founder, 2026-10-11)

The founder explicitly authorized provisioning and validation for the Penpot
protocol write surface:

> Provision and independently verify a dedicated disposable target. Test the
> protocol with minimal reversible mutations, independent read-back, failure
> handling, and evidence journaling. Never mutate production or the existing
> scratch file during this validation.

This supersedes the earlier no-commit instruction only to the extent of the
commit authorization given alongside it (verified in-scope working-tree
corrections; do not push, merge, or deploy without separate approval).

## Binding constraints (from the authorization)

1. A **dedicated disposable target** is provisioned and independently verified
   — never the production file or the scratch "Test File".
2. Mutations are **minimal and reversible**; every write is followed by an
   independent read-back (reconciliation before any retry).
3. **Failure handling** is exercised and journaled (fail-closed refusals and
   provider errors are evidence, not silence).
4. Every dispatch is **journaled** with intent + outcome; the journal is
   committed with the run.
5. The production write allow-list is **unchanged**; the disposable file is
   recorded in the policy under a purpose-scoped bucket that never grants a
   production-executor write.
6. No push/merge/deploy without separate approval.

## Decision reference used by provisioning

The `--decision` reference attached to the provisioning write names this file:

```
26.16 restated contract (2026-10-10) + founder disposable-validation
authorization 2026-10-11 (evidence/runs/penpot-disposable-validation-2026-10-11/AUTHORIZATION.md)
```