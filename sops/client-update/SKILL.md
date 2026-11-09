# /client-update

## Purpose

Produce a factual, founder-reviewable client update from the Git-backed client
record.

The skill converts recorded project state into a communication draft. It does
not decide what happened, create new scope, make commercial commitments, or
send communication.

The Git repository is the source of truth.

---

## Invocation

Use:

`/client-update <client>`

The client must correspond to:

`clients/<client>/`

Directories beginning with `_` are reserved/template directories and are not
valid clients.

---

## Authoritative inputs

Required:

- `clients/<client>/CLIENT.md`
- `clients/<client>/SCOPE.md`
- `clients/<client>/STATUS.md`
- `clients/<client>/DECISIONS.md`

Use additional project records only when they are explicitly referenced by
those files or are required to substantiate a statement.

Do not treat chat history, model memory, or uncommitted assumptions as
authoritative project state.

---

## Preconditions

BLOCK if any required client record is missing.

BLOCK if the client identity is inconsistent across records.

BLOCK if `SCOPE.md` does not contain an explicit scope classification.

BLOCK if the update requires facts that cannot be established from repository
records.

Do not manufacture missing information.

---

## What the update must answer

The draft must answer:

1. What was completed?
2. What is currently in progress?
3. What is blocked?
4. What does the client need to provide or decide?
5. Has anything changed relative to approved scope?
6. What happens next?
7. What evidence supports the update?

---

## Scope handling

Every newly mentioned item must be classified against `SCOPE.md`.

Use:

- `IN SCOPE`
- `CHANGE ORDER`
- `OUT OF SCOPE`
- `UNKNOWN — REQUIRES REVIEW`

Never silently describe new work as ordinary progress.

A `CHANGE ORDER` is not approved merely because it appears in the update.

The skill must never:

- approve a change order;
- expand scope;
- remove an exclusion;
- promise additional work;
- change commercial terms;
- commit a delivery date not already approved.

---

## Status handling

Only report a task as completed when repository evidence supports completion.

Use factual language:

- `COMPLETED`
- `IN PROGRESS`
- `BLOCKED`
- `WAITING FOR CLIENT`
- `NOT STARTED`
- `UNKNOWN`

Do not invent percentages.

Do not infer completion from the existence of code, a branch, a conversation,
or an agent response alone.

Where evidence is insufficient, use `UNKNOWN`.

---

## Required output

Produce a draft containing exactly these sections:

# Client Update

## Reporting Period

State the period covered by the update.

If the period cannot be established, write:

`UNKNOWN — REPORTING PERIOD REQUIRES FOUNDER REVIEW`

## Completed

List completed work supported by evidence.

## In Progress

List work currently underway and its recorded status.

## Blocked

List blockers and the recorded reason.

If no blocker is recorded:

`None recorded.`

Do not infer that the project is unblocked merely because no blocker was found.

## Client Input Required

List decisions, materials, approvals, credentials, content, or other inputs
actually required from the client.

If none are recorded:

`None recorded.`

## Scope Changes

List:

- approved changes;
- pending change orders;
- out-of-scope requests;
- unresolved scope questions.

If none exist:

`None recorded.`

## Next Steps

List only actions supported by the project records.

Separate:

- Company action
- Client action

## Evidence

List the repository records supporting the update.

---

## Approval state

The generated document must end with:

`Status: DRAFT`

`Founder approval: REQUIRED`

The skill must never send the update to a client.

External communication requires explicit founder approval.

---

## Provenance requirement

Every material statement must be traceable to a repository record.

Use this format:

```text
Evidence:
- STATUS.md — current delivery state
- SCOPE.md — approved scope and exclusions
- DECISIONS.md — recorded decisions
- <additional record> — supporting evidence
