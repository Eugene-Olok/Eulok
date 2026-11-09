
---

# 3. `sops/case-study/SKILL.md`

This should be explicitly about **turning completed company records into marketing evidence**, rather than a generic writing exercise.

```markdown
# /case-study

## Purpose

Convert a completed client engagement into a factual, evidence-backed case
study suitable for founder review and, after approval, publication.

The case study is a derived artifact. It must never become the source of truth
for project facts.

The underlying client/project records remain authoritative.

---

## Invocation

Use:

`/case-study <client>`

The client must correspond to:

`clients/<client>/`

Directories beginning with `_` are reserved/template directories and are not
valid clients.

---

## Preconditions

The engagement must have enough recorded evidence to establish:

- the client/context;
- the original problem;
- the approved scope;
- what was actually delivered;
- what outcome can be supported;
- whether publication is permitted.

BLOCK if the required evidence does not exist.

Do not manufacture a case study merely because a project directory exists.

---

## Authoritative inputs

Required:

- `CLIENT.md`
- `SCOPE.md`
- `DECISIONS.md`
- relevant `STATUS.md`
- delivery evidence
- acceptance evidence where applicable

Use additional records only where they substantiate a specific claim.

---

## Publication permission

Determine publication status explicitly:

```text
NOT REVIEWED
INTERNAL ONLY
FOUNDER APPROVED
CLIENT APPROVAL REQUIRED
CLIENT APPROVED
APPROVED FOR PUBLICATION
