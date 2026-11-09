# Company OS Component Contract

**Status:** Production contract — implementation pending.

Every component in the design manifest must satisfy this contract before it can be marked complete.

## Required record

Each component implementation must identify:

- manifest ID
- purpose and non-goals
- layer in the component dependency graph
- anatomy/structure
- public API or content contract
- token dependencies
- variants
- interaction states
- responsive behavior
- keyboard behavior
- focus behavior
- ARIA semantics and accessible name requirements
- disabled/read-only/loading/error behavior where applicable
- Penpot component/frame reference
- frontend implementation reference
- visual regression identifier
- accessibility test identifier
- evidence location

## State model

At minimum, interactive controls must explicitly consider:

```
default → hover → focus-visible → active → disabled
                         ↓
                     validation
                  ┌──────┴──────┐
                 error        success
                         ↓
                     loading
```

Only states applicable to the component should ship; unused states must not be invented solely to satisfy a checklist.

## Accessibility contract

- Native HTML semantics are preferred over custom ARIA.
- Every interactive control has an accessible name.
- Keyboard operation is complete and deterministic.
- Focus is visible and ordered logically.
- Error and status information is available non-visually.
- Colour is never the sole carrier of meaning.
- Motion respects `prefers-reduced-motion`.
- Target sizes satisfy the responsive/accessibility contract.

## Responsive contract

Components are mobile-first and must remain usable at the programme's minimum viewport and 400% zoom/reflow requirements. Components must not rely on a fixed viewport width unless explicitly justified by the manifest.

## Design/implementation parity

A component is complete only when:

```
Manifest
   ↕
Penpot
   ↕
Frontend
   ↕
Automated tests
   ↕
Visual regression
   ↕
Manual accessibility verification (P0/P1)
   ↕
Evidence
```

A Penpot frame without implementation is a design artefact, not a completed component.
