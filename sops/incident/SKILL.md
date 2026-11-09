
---

# 4. `sops/incident/SKILL.md`

This one needs to be much more operational because incidents are not ordinary
business records.

```markdown
# /incident

## Purpose

Create and maintain a durable incident record for failures affecting company
systems, client work, security, delivery, or business operations.

The skill provides structured incident handling and evidence preservation.

It does not autonomously modify production systems, destroy evidence, assign
blame, or declare an incident resolved without evidence.

---

## Invocation

Use:

`/incident`

or:

`/incident <incident-id>`

If no incident ID exists, create one using a deterministic timestamp/sequence
defined by the repository's incident-record convention.

Do not reuse an existing incident ID.

---

## Incident lifecycle

An incident follows:

```text
OPEN
  ↓
CONTAINED
  ↓
MITIGATED
  ↓
RESOLVED
  ↓
CLOSED
