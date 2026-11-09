---
name: intake
description: Convert a client conversation into an evidence-backed scope document and proposed go/no-go disposition.
version: 1.0.0
metadata:
  hermes:
    tags: [company-os, client, intake, scope, sales]
    category: company-operations
---

# /intake

## Purpose

Turn a client conversation or request into a structured, auditable intake.

The skill protects the company from vague requirements, premature commitments, hidden stakeholders, unrealistic deadlines, and unpriced scope.

## Operating rule

Do not invent missing facts.

Unknown information must be recorded as `UNKNOWN` or `NOT PROVIDED`.

The agent produces a **proposed disposition**. The founder remains the final commercial decision-maker.

## Required questions

Collect these six questions:

1. What breaks today?
2. What have you already tried?
3. Who else must approve the work?
4. What does success look like in measurable terms?
5. What is the deadline, and why is that date important?
6. What is the budget range?

## Procedure

1. Identify the client.
2. Capture the request exactly enough to preserve meaning.
3. Separate observed facts from assumptions.
4. Ask only missing questions needed to evaluate scope and feasibility.
5. Identify stakeholders and approval dependencies.
6. Identify measurable success criteria.
7. Identify deadline constraints and their source.
8. Record stated budget information without inventing pricing.
9. Identify risks, dependencies, exclusions, and unknowns.
10. Produce a proposed disposition:
   - `GO`
   - `NO-GO`
   - `NEEDS INFORMATION`
11. Explain the evidence supporting the proposed disposition.
12. State that founder approval is still required before a commercial commitment.

## Required output

Produce:

### Intake

- client
- date
- request
- current problem
- attempted solutions
- stakeholders
- measurable success criteria
- deadline
- deadline rationale
- budget range
- assumptions
- dependencies
- risks
- unknowns

### Proposed disposition

```text
PROPOSED DECISION: GO | NO-GO | NEEDS INFORMATION
FOUNDER APPROVAL: REQUIRED


