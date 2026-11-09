# Design GATE-6 — Implementation & Parity evidence (2026-10-11)

STATUS: PASS

## What this record covers

GATE-6 ("Implementation & Parity") requires **per-page rendered parity evidence**:
implemented pages compared against their design contract (visual + behavioural).
This record documents the 2026-10-11 verification run using the deterministic
rendered-output browser lane (`tools/browser_verify.py`, Playwright/Firefox +
vendored axe-core 4.14.0; `docs/design/BROWSER_CHECKS.yaml`).

## Confirmed offline (deterministic, executable now)

- Landing page source (`business/site/index.html`) matches the approved brand
  contract for the single lockup: the nav wordmark is the exact text `COM-OS`
  (`<strong>COM-OS</strong>`), per decisions 26.1 / 26.5 (approved 2026-10-11).
- Contact path matches decision 26.9 (approved 2026-10-11, option E): a real
  `<a href="https://wa.me/256760779160" target="_blank" rel="noopener">` CTA with
  a visible accessible name; no `<form>`, no submit control, no `mailto:`.
- Product name `Company OS` is retained in `<title>` / `og:title` (deploy-gate
  pinned by `scripts/deploy-site.sh`); the logo wordmark and product name are
  deliberately distinct.
- Content invariants hold: no placeholder markers, no committed analytics keys,
  analytics inert without deploy-time config (`tests/test_site_content.py`).
- Bundle budgets (`tools/check_bundle_budget.py`, decision 26.15) — measured
  byte budgets only.

## Rendered parity (executed 2026-10-11 via browser lane)

The deterministic rendered-output browser lane (`tools/browser_verify.py`) was
run against the implemented page (PAGE-001, Landing) at all contract viewports
(320, 480, 768, 1024, 1440). All fail-severity checks passed:

| Check | Severity | Result | Detail |
|-------|----------|--------|--------|
| render | fail | PASS | Page loads with no uncaught page errors / console errors |
| title | fail | PASS | Document title matches `Company OS` prefix; `lang=en` present |
| headings | fail | PASS | Exactly one `<h1>`; first heading is h1; no skipped levels |
| landmarks | fail | PASS | One `<main>`, one `<nav>`, one `<footer>` |
| overflow | fail | PASS | No horizontal overflow/reflow at any viewport |
| token_conformance | fail | PASS | All rendered colours are APPROVED design-token values (no retired `#bbbbbb`/`#dddddd` literals) |
| axe | fail | PASS | Zero axe-core 4.14.0 automated accessibility violations |
| target_size | warn | PASS | All interactive controls meet 24px minimum |
| keyboard_focus | warn | PASS | Tab order traverses controls; focus indicator detectable |
| reduced_motion | warn | PASS | No ungated motion under `prefers-reduced-motion` |

Screenshots captured at each viewport: `evidence/runs/browser-verify-2026-10-11/`.

## Honest scope limitation (not fabricated)

This lane proves **automated rendered criteria only**. It does NOT perform or
substitute for manual accessibility review (keyboard-only operation,
VoiceOver/NVDA, 200%/400% zoom) and is not a visual-regression PASS (which
requires a reference baseline). Those items remain human review items outside
deterministic automation.

## Status derivation

`tools/design_gate_verifier.py` reads this file's first `STATUS:` line.
`STATUS: PASS` ⇒ GATE-6 PASS (prerequisites GATE-4/GATE-5 are PASS).
GATE-7 then evaluates its own checks (deploy evidence, analytics e2e).

## Evidence chain

- Browser lane config: `docs/design/BROWSER_CHECKS.yaml`
- Browser lane tool: `tools/browser_verify.py` (Playwright 1.63.0 + Firefox 155.0)
- Axe-core: vendored at `tools/vendor/axe-core/axe.min.js` (4.14.0, sha256 `20c09fe1...`)
- Run evidence: `evidence/runs/browser-verify-2026-10-11/summary.md`, `report.json`
- Design tokens: `docs/design/DESIGN_TOKENS.yaml` (approved palette)
- Approved decisions: 26.1, 26.5, 26.9, 26.11 (all APPROVED 2026-10-11)