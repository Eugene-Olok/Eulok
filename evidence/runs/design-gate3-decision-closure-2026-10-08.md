# Design Gate 3 — Decision Closure Evidence

**Date:** 2026-10-08 (UTC)
**Branch:** `feat/design-gate2` (HEAD `c9f75c0`; audit baseline `c4b5e81`)
**Scope:** Founder decision closure of all 17 design-programme §26 decisions (GATE 3), with
deterministic propagation into the canonical design package (`docs/design/`), validation,
and an evidence-only report.
**Starting Git state:** branch `feat/design-gate2`, HEAD `c9f75c0`, audit baseline `c4b5e81`.
When this gate began (and as it closed), Gate 2 design-package changes were **still uncommitted**
per the design-programme workflow; the working tree contains only design-system documentation and
validators under `docs/design/` + `tools/` (the Gate 2 package) plus this gate's evidence — no
source code, gate script, deployment config, DNS, or unrelated file. All modifications in this
gate are continuations of that inherited, uncommitted design package: the ownerless-token mappings
and decision records below are appended to the same files, keeping the change set identifiable
(inherited vs newly added) ahead of the founder-review commit.
**Baselines (not repeated):** Gate 1 audit `evidence/runs/design-system-audit-2026-10-08.md`;
Gate 2 verification `evidence/runs/design-gate2-verification-2026-10-08.md`.

## 1. Method and protocol

Decisions were processed one question at a time in an interactive session with the founder
(the accountable human decision-maker). Per the programme's interaction protocol and AGENTS.md
`GOV-004`:

- the agent explained each decision, presented current evidence and options, and asked **one** question;
- the agent recorded the founder's instruction **verbatim**; the founder supplies the decision;
- the **agent chose no option** and never self-approves;
- silence ≠ approval; proposed defaults were not treated as approvals;
- this record is created by the agent under §7.3 and is provenance only.

## 2. Final state (register)

```
decisions: 17 registered (12 APPROVED, 2 BLOCKED, 1 PENDING_ESCALATE, 2 PENDING)
```

Grouped by founder-facing status (the 2 remaining `PENDING` register rows are the asset-gated pair,
encoded `PENDING` with `substate: PENDING_ASSET`):

| Decision | Title | Status |
|---|---|---|
| 26.2 | Typography strategy | APPROVED (A) |
| 26.3 | Palette: adopt neutrals | APPROVED (A) — hue carve-out stays pending |
| 26.4 | Dark mode / theme architecture | APPROVED (B, both themes) |
| 26.6 | Spacing scale | APPROVED (A) |
| 26.7 | Motion and reduced motion | APPROVED (A) |
| 26.8 | Breakpoints | APPROVED (A) |
| 26.10 | Multi-page IA | APPROVED (A, full §17.3) |
| 26.12 | Custom domain / deployment gate | APPROVED (A, pages.dev-only) |
| 26.13 | Blog / CMS scope | APPROVED (A, excluded) |
| 26.14 | Imagery strategy | APPROVED (B, abstract SVG only) |
| 26.15 | Performance budgets | APPROVED (A, strict v1) |
| 26.17 | Design-system location | APPROVED (A, in-repo canonical; GOV-007 resolved) |
| 26.1 | Brand mark | **PENDING_ASSET** (direction B selected; mark not supplied) |
| 26.5 | Wordmark lockup | **PENDING_ASSET** (blocked on 26.1 master) |
| 26.11 | Analytics consent / page taxonomies | **ESCALATE** |
| 26.9 | Contact form submission path | **BLOCKED** (Email §34) |
| 26.16 | Penpot contract (§8.5) | **BLOCKED** (text unrecoverable, §27.A) |

## 3. Approved decisions — summary of record and propagation

Each approved decision was recorded in `DESIGN_DECISIONS.md` §3 (verbatim founder instruction,
binding constraints, scope boundary, options/consequences, depends/blocks, owner) and in the §5
register with `approved_date` and `approval_evidence`. Verified deterministic propagation:

- **26.2 (A):** five null type tokens + two new primitives → `VALID_APPROVED` after verifying
  proposed values against the current CSS (`business/site/index.html:12`): h2 24px matches UA default,
  h3 18px is a deliberate 0.72px normalisation, weights 400/700 match, system stack retained.
- **26.3 (A):** seven current-site literals adopted as neutrals (ratio re-verified: 17.5 / 7.14 /
  18.26 / 18.09 pass); `#bbbbbb` badge border (1.92:1) replaced by `#767676` (4.54:1 light,
  5.38:1 dark); `#8f8f8f` replaces the 1.3:1 subtle border. **No interpolation of the hue family.**
- **26.4 (B):** top-level `themes` block; 7 dark primitives; `value_dark` on 7 neutral semantic
  colour roles; dark contrast pairs on all 6 neutral pairs + focus pair; per-theme validator
  extension (`validate_theme_coverage`, per-theme `validate_contrast`). 123 tokens.
- **26.6 (A):** the 11 `space.*` primitives + 6 `semantic.space.*` + 5 `component.*` spacing
  tokens → `VALID_APPROVED`; 10px/18px kept as documented optical exceptions.
- **26.7 (A):** times 150/250/400ms verified against the defined easing token; reduced-motion
  mandatory default recorded (no autoplay/looping/parallax; no layout instability).
- **26.8 (A):** breakpoints 480/768/1024/1440 CSS px sanctioned; em equivalents as supporting doc
  only; contract "not complete until validated".
- **26.10 (A):** full §17.3 IA approved with seven binding constraints (extend-not-weaken
  `test_site_content.py`; case-study empty state; no contact forms before 26.9; no OG complete
  before 26.1/26.5; dependencies stay BLOCKED; IA ≠ implementation/launch readiness; 26.13
  separate). `PAGE_TEMPLATE_MAP.yaml` gained `ia_approval`; PAGE-010 manifest note updated.
- **26.12 (A):** pages.dev-only gate retained; no gate/script/DNS change made by this decision;
  reopen requires founder-recorded domain + gate updated and verified first. EXCL-001 stays
  OUT_OF_SCOPE.
- **26.13 (A):** blog/CMS excluded; re-evaluation gated on all three evidenced conditions
  (recurring demand, named owner, defined cadence); VOX-005…008 retained. 26.10 dependency
  satisfied; decision kept separate.
- **26.14 (B):** abstract SVG only; eight binding constraints recorded (no photography/stock;
  text-led; mark separate; provenance+licence GOV-013; responsive + aspect-ratio; alt-text policy
  first; count against 26.15 budgets; founder approval before publish; media tokens evidenced
  only). Decorative-vs-informative alt-text policy added to `ACCESSIBILITY_SPEC.md`.
- **26.15 (A):** LCP ≤1.5s (sim 4G) / CLS ≤0.05 / JS ≤25KB / CSS ≤15KB / transfer ≤100KB;
  tooling separate → TEST-007 stays BLOCKED.
- **26.17 (A):** in-repo `docs/design/` is canonical (tokens, specs, manifest, Penpot mapping;
  validators under `tools/`; Git is source of truth; founder sole approver; agents cannot
  self-approve). GOV-007 storage format **resolved** without changing any approved token value or
  bypassing pending decisions. `DESIGN_TOKENS.md` §Authority updated to state the resolved
  location, not future work.

## 4. Asset-gated decisions (status `PENDING_ASSET`)

- **26.1** (register `PENDING`, `substate: PENDING_ASSET`): direction **B** selected — a distinct
  symbol mark alongside the canonical `Company OS` wordmark. **No mark exists.** The agent must not
  invent, draft, or publish any symbol/favicon/OG artwork. Spec only at
  `docs/design/BRAND_ASSET_SPEC.md`. Decision closes only when the founder supplies/commissions a
  master and approves it.
- **26.5** (register `PENDING`): wordmark/symbol lockup rules — blocked on the 26.1 master; lockup
  geometry needs the mark.

Consequences carried: **BRAND-009**, **BRAND-010** (favicon/icon set), and **PAGE-027** (`og:image`)
must not be produced or marked complete until the 26.1 master is approved.

## 5. Escalated decision

- **26.11** (Analytics consent page taxonomies): requires jurisdiction-specific legal facts the
  agent must not invent. Standing risk re-raised each review. Directly touches **PAGE-018**
  (cookie/analytics consent banner, currently OUT_OF_SCOPE) — analytics (PostHog) is already live,
  so this exclusion carries legal risk until decided.

## 6. Blocked decisions

- **26.9** (Contact form submission path): blocked on **Email capability §34**. Consequence
  carried: **PAGE-010** must not ship a contact form / submission until 26.9 establishes a
  verified path. `mailto:` is test-forbidden.
- **26.16** (Penpot ↔ repo contract): blocked on **§8.5** text, which is unrecoverable in the repo's
  git history (§27.A). GOV-008's *direction* is fixed (repo canonical, §21.4) but frequency and
  conflict rules remain provisional.

## 7. Token contract state (actual, from `tools/validate_design_tokens.py`)

```
tokens: 123 total — VALID_APPROVED: 84 · VALID_PENDING_DECISION: 39 · INVALID: 0
theme coverage (dark): 15 colour roles — 10 mapped · 5 carved-out (pending hue family)
contrast pairs: 14 — DEFECT_CLOSED_PENDING_REVIEW: 2 · NOT_RUN: 2 · PASS: 10
result: PASS — 0 INVALID; pending decisions honestly classified VALID_PENDING_DECISION; open defects reported, never counted as pass
```

- 84 tokens `VALID_APPROVED` (owned by the 12 approved decisions).
- **39 `VALID_PENDING_DECISION` = 33 ownerless + 6 carved-out** (see §8, §9).
- 0 INVALID. PASS does not imply all values are final — pending class is honest and separately listed.

## 8. Pending tokens — ownerless (33, all `decision_id: null`) — RESOLVED mapping

Not owned by any §26 decision. Per the gate brief §8 (resolve each via governance / derivation /
new decision / deferral — *not* by inventing decisions), each of the 33 is now classified with a
recorded rationale. **No new founder decisions were invented** (required count = 0): everything
among the 33 is either already evidence-backed, a pure alias derivation, or not required for the
v1 release. GOV-004 / FOUND-012 / FOUND-014 govern them (NOT 26.6).

**Group (a) — evidence-backed, governed by current-site baseline (5).** Values equal the live CSS
baseline; adoption needs only the governed border/radius rules, no brand invention:

| Token | Value | Basis |
|---|---|---|
| `primitive.border.width-1` | `1px` | border-weight rule (FOUND-012); current site borders |
| `primitive.radius.14` | `14px` | current card/badge radius (index.html:12) |
| `primitive.radius.pill` | `999px` | current badge radius (index.html:12) |
| `primitive.shadow.none` | `none` | decorative absence; fully supported today |
| `component.container.max` | `980px` | current `.container` max-width literal |

**Group (b) — deterministic alias derivations (14).** Pure indirection onto tokens above or
null-valued counterparts; value follows the reference; no independent decision, none invented:

`semantic.border.width` → `border.width-1` · `semantic.radius.md` → `radius.14` ·
`semantic.radius.pill` → `radius.pill` · `semantic.shadow.none` → `shadow.none` ·
`semantic.icon.{sm,md,lg}` → `primitive.icon.{sm,md,lg}` · `semantic.z.{base,dropdown,modal,overlay,sticky}`
→ `primitive.z.*` · `component.badge.radius` → `semantic.radius.pill` · `component.card.radius` → `semantic.radius.md`.

**Group (d) — deferred: null-valued, no evidence, not required for v1 (14).** Contract-surface
names only; no invented values. Reviewed under GOV-004 when a consumer component needs them:

| Token(s) | Defer condition |
|---|---|
| `primitive.icon.{sm,md,lg}` | icons arrive only with a 26.1-approved asset/icon system |
| `primitive.shadow.{low,medium,high}` | no shadowed component exists; needs overlay/component decision |
| `primitive.z.{base,dropdown,modal,overlay,sticky}` | stacking needed only when overlays/nav exist (CON-07 shell) |
| `semantic.radius.{sm,lg}` | no consumer sizes defined yet |
| `semantic.focus.width` | focus geometry follows FOUND-017 when a rendered focus style is specified |

**Group (c) — new founder decisions required: 0.**

Count: 5 + 14 + 14 = **33**. `decision_id` stays `null` and the validator keeps these honestly
classified `VALID_PENDING_DECISION` — resolving the mapping removes no validation warning, and that
is intentional: the goal is honest classification, not warning-count cosmetics. This mapping is also
recorded durably in `DESIGN_DECISIONS.md` §8 (institutional record).

## 9. Pending tokens — interactive hue-family carve-out (6)

Kept `value: null` with `pending_separate_approval: true` per the 26.3 founder clarification;
light and dark values must land together on separate founder approval:

`primitive.color.accent` · `semantic.color.fg.inverse` · `semantic.color.action.primary` ·
`semantic.color.action.primary-hover` · `semantic.color.focus.ring` · `component.status.text-color`.

## 10. Contrast findings (deterministic, per-theme)

14 pairs measured: **10 PASS**, **2 DEFECT_CLOSED_PENDING_REVIEW**, **2 NOT_RUN**. Examples of
measured PASS values: text-on-canvas 17.5:1 (light) / 17.12:1 (dark); muted-text-on-canvas
7.14:1 / 8.16:1; subtle-border-on-canvas 3.1:1 / 3.6:1; strong-border-on-canvas 18.09:1 / 15.22:1.
Badge border (A11Y-004): 4.54:1 light / 5.38:1 dark — **passes but is NOT fully closed** until a
rendered visual review (following the audit's closed-pending-review discipline). Focus ring:
**NOT_RUN** (light + dark) until the 26.3 hue family is approved. `NOT_RUN` is never reported as
a pass.

## 11. Validator and test evidence (actual results this session)

| # | Check | Command | Result |
|---|---|---|---|
| 1 | Manifest structure (290 items) | `python3 tools/validate_design_manifest.py` | **PASS** — `290 unique items; CURRENT=30 REQUIRED=175 FUTURE=63 OUT_OF_SCOPE=22` (exit 0) |
| 2 | Token contract + register + themes + contrast | `python3 tools/validate_design_tokens.py` | **PASS** — §7/§8/§9/§10; exit 0 |
| 3 | Component graph + page/template map | `python3 tools/validate_design_graph.py` | **PASS** — 11 families / 130 items / 9 edges / 3 patterns; layer contract, acyclicity, build order hold; 30 pages / 6 templates. **Note:** PAGE-027 mapping is `PROPOSED` (founder confirmation flagged) |
| 4 | Site-content + Phase-8 invariants | `.venv/bin/python -m unittest tests.test_site_content tests.test_phase8_gate` | **PASS** — `Ran 37 tests … OK` |
| 5 | Full repository suite | `.venv/bin/python -m unittest discover -s tests` | **PASS** — `Ran 694 tests in 144.955s … OK` |
| 6 | Whitespace/error markers | `git diff --check` | **PASS** — clean |
| 7 | Privacy / secret hygiene | `.venv/bin/python -m unittest tests.test_security_phase8` | **PASS** — `Ran 8 tests … OK` |

No check returned FAIL. The 48 validator warnings are advisories only (blocked/escalated decision
notices and carve-out/ownerless advisories), not failures.

## 12. Policy vs implementation / review / readiness (distinction, as required)

- **Policy decisions approved (yes):** the 12 decisions in §3; recorded in Git.
- **Deterministic evidence produced (yes):** §7–§11 above.
- **Implementation (not started):** no components, pages, or frontend styles change were built;
  `business/site/index.html` is untouched. `test_site_content.py` **preserved; nothing weakened.**
- **Visual review (not run):** no rendered UI exists to review; both-theme visual regression and the
  final badge/focus visual closure are outstanding by design.
- **Penpot readiness (BLOCKED):** no Penpot MCP configured (Gate 2 BLOCKER-1…3); 26.16 BLOCKED.
  No Penpot structure created.
- **Launch readiness (NOT claimed):** precluded explicitly by 26.10 (IA ≠ launch readiness), 26.12
  (pages.dev gate retained), 26.13 (no editorial pipeline), 26.14 (no assets published), 26.15
  (budgets are targets awaiting tooling), and the open items below.

## 13. Every remaining open item (complete list)

1. **39 pending tokens** (§8 + §9) — not final values.
2. **Interactive hue-family approval** (6 tokens, carve-out) — separate founder decision; includes
   dark values.
3. **Focus contrast `NOT_RUN`** (light + dark) — blocked on the hue family.
4. **Badge defects (2)** `DEFECT_CLOSED_PENDING_REVIEW` — pass ratio present but awaiting rendered
   visual review; not fully closed.
5. **Brand asset dependency:** 26.1 `PENDING_ASSET` — blocks 26.5, BRAND-009, BRAND-010,
   PAGE-027. No artwork exists; no completion claimed.
6. **Contact-path blocker:** 26.9 BLOCKED (Email §34) — PAGE-010 must not publish a form.
7. **Consent / legal escalation:** 26.11 ESCALATE — PAGE-018 legal risk (analytics live) until
   jurisdiction facts established.
8. **§8.5 / §27.A dependency:** 26.16 BLOCKED; GOV-008 full contract provisional.
9. **Penpot workstream:** BLOCKED (no MCP; no structure created).
10. **Visual regression both themes:** not run (no rendered surface).
11. **Overlay/scrims:** no hex-only token form and no overlay component on record.
12. **TEST-007** (budget tooling): BLOCKED — tooling undefined.
13. **Responsive contract:** breakpoints approved but the responsive behaviour contract is not
    complete until validated in a rendered build.
14. ~~Ownerless token assignment (33)~~ — **resolved this gate:** mapped in §8 and recorded in
    `DESIGN_DECISIONS.md` §8; deferred (d) tokens re-checked under GOV-004 when a consumer needs them.

## 14. What this record does NOT claim

- The design system is **not fully implemented** (policy is approved; build is not started).
- Nothing is **launch-ready**.
- No **legal facts, assets, approvals, evidence, or missing requirements** were invented.
- No gate, application code, deployment script, DNS, or unrelated file was changed by this closure.
- No **brand artwork** exists. No **photography or stock** was introduced. No **custom domain**.
- `PASS` results cover the deterministic checks above; they do not cover visual, Penpot, or launch
  readiness, which are explicitly out of this run's evidence domain.

## 15. Files changed for Gate 3 (docs-only; no code/scripts/gates touched)

Modified:
- `docs/design/DESIGN_DECISIONS.md` — §3 records + §5 register (all 17 decisions)
- `docs/design/DESIGN_TOKENS.yaml` — 26.4 theme block + 26.6 propagation (from earlier steps)
- `docs/design/DESIGN_TOKENS.md` — §Authority resolution (26.17)
- `docs/design/ACCESSIBILITY_SPEC.md` — per-theme matrix; imagery/alt-text policy (26.14)
- `docs/design/DESIGN_MANIFEST.yaml` — notes for 26.1/26.10/26.12/26.13/26.14/26.17 affected IDs
- `docs/design/PAGE_TEMPLATE_MAP.yaml` — `ia_approval` block (26.10)
- `docs/design/DESIGN_SYSTEM.md`, `docs/design/PENPOT_IMPLEMENTATION_MAP.yaml`,
  `docs/design/RESPONSIVE_SPEC.md` — Gate-2/3 doc updates (carried state)

New (Gate 2 package + Gate 3 spec):
- `docs/design/BRAND_ASSET_SPEC.md` (26.1 spec — no artwork)
- `docs/design/{COMPONENT_DEPENDENCIES.yaml,DESIGN_DECISIONS.md,DESIGN_TOKENS.yaml,
  PAGE_TEMPLATE_MAP.yaml,PERFORMANCE_BUDGET.yaml}` (untracked until committed)
- `tools/validate_design_tokens.py`, `tools/validate_design_graph.py`
- `evidence/runs/design-gate2-verification-2026-10-08.md`

Nothing was committed; no PR opened. This report is staged for founder review.

## 16. Performance budget state (brief §15 item 9)

| Aspect | State |
|---|---|
| Budgets (26.15, approved) | LCP ≤1.5s (sim 4G) · CLS ≤0.05 · JS ≤25KB · CSS ≤15KB · transfer ≤100KB — recorded in `docs/design/PERFORMANCE_BUDGET.yaml` |
| Current-site baseline evidence | figures not yet measured (no tooling); values are targets, not verified results |
| Tooling | TEST-007 **BLOCKED** — measurement tool undefined; the budget gate cannot produce verified PASS until it is |
| Report posture | budgets approved as policy; **no performance PASS claimed** (deterministic measurement pending tooling) |

## 17. Secret-hygiene outcome and audit integrity (brief §15 item 13)

- No secret material appears anywhere in this gate's diff: provider/gateway credentials
  (`providers.env`/`PENPOT_MCP_URL` and equivalents) are **not printed, logged, committed, or
  referenced by value**; secret-hygiene invariants re-run this gate and **PASS** (8 tests, §11 row 7);
  a content scan of the changed/new files for key patterns returned nothing.
- Audit baseline integrity: `evidence/runs/design-system-audit-2026-10-08.md` **unchanged**
  (byte-identical, tracked); `evidence/runs/design-gate2-verification-2026-10-08.md` not rewritten.
- No gate script, application code, deployment config, DNS, or unrelated file was changed
  (`git status` shows only the design package under `docs/design/` + `tools/` and this report).

## 18. Recommended next gate (brief §15 item 15)

**Proposed: GATE 4 — Foundation implementation (approved tokens → rendered site).**

Recommended sequencing before/at Gate 4, smallest-first:

1. **Founder pulse (~6–8 quick confirmations) before implementation work** — resolves the last
   *interactive* decision surface cheaply:
   - approve the 6-token hue-family carve-out (accent / fg.inverse / action.primary(+hover) /
     focus.ring / status.text-color, light+dark together) — **unblocks the NOT_RUN focus contrast**;
   - supply/commission the 26.1 brand master and wordmark evidence — closes 26.1, 26.5,
     BRAND-009/010, PAGE-027;
   - confirm the 5 evidence-backed ownerless values (group (a) in §8) for adoption at build time.
2. **Resolution workstreams (parallel, required before launch):** 26.9 (Email §34) for any contact
   path; 26.11 jurisdiction facts for consent; 26.16 §8.5 restatement; TEST-007 tooling definition
   for 26.15 verification.
3. **Gate 4 core:** implement the 84 approved tokens as CSS custom properties on a feature branch
   against `business/site/index.html`; run per-theme contrast against the rendered page; run
   visual regression for **both** themes (closing the 2 badge `DEFECT_CLOSED_PENDING_REVIEW` items
   and the `NOT_RUN` focus pair); validate the responsive and component contracts in the build;
   produce the first real performance-budget measurement.
4. **Gate 5 (later):** Penpot structure sync + component library, following 26.16 resolution.

Gate 4 may not start until: the founder record is committed (this closure), the branch/PR review is
done, and the Gate 4 prerequisites above are either approved or explicitly deferred in writing.

---

## 19. Founder-approved decision-closure pass — outcome

Method and scope: propose + apply conservative, evidence-backed, reversible, site-preserving
resolutions where justified; preserve genuine blockers; produce a closure table; separate
APPROVED / IMPLEMENTED / VERIFIED / BLOCKED; enumerate the exact founder decisions that cannot be
inferred; give a phase-exit assessment. Docs only — no code, gate script, CI, page, or deployment
change. Nothing committed; no PR.

### 19.1 Decided vs preserved this pass

- **Decided (with evidence):** the §8 ownerless mapping (a/b/c/d) is **confirmed** as the correct
  resolution; an alternative `decision_id` assignment plan is **withdrawn** (§19.2). No token-file
  change is required — `decision_id` stays `null`; groups and their honesty classification stand.
- **Preserved (no evidence permits resolution):** 26.9, 26.11, 26.16, 26.1/26.5, PAGE-027, Penpot
  workstream, focus `NOT_RUN` (2), badge pending visual review (2), TEST-007, visual regression, and
  the hue family (proposal delivered below; approval belongs to the founder).

### 19.2 Withdrawal of the alternative `decision_id` assignment plan

Earlier, assignment of the 33 ownerless tokens to existing §26 decisions was considered. Rerunning
the §3 records conclusively withdraws that plan:

- 26.3 is the **color-palette** decision; border-width/radius/shadow/container domains are not colors.
- 26.6 is **spacing/density**; its propagation lists exactly 22 owned tokens, none covering
  radius/shadow/container/border-width.
- 26.8 is **breakpoint values** only. 26.7 is motion.
- The §8 record states the evidence-backed tokens are governed "via GOV-004 / FOUND-012 / FOUND-014
  (**NOT by 26.6**)" (`DESIGN_DECISIONS.md` §8); token notes state "no §26 owner — founder assigns
  via GOV-004" (or equivalent).
- `DESIGN_DECISIONS.md` §8 tail (lines 495–496): *"When a deferred token becomes required, the
  founder approves its value under GOV-004 and the token's `decision_id` is set in
  `DESIGN_TOKENS.yaml`."*

Assigning e.g. `decision_id: "26.3"`/`"26.6"` to these domains would falsify the governance data and
contradict §8, the FOUND notes, and the token notes. No such edit was ever applied, so there is
nothing to revert; this paragraph documents the withdrawal so it is not re-proposed.

### 19.3 Closure table — every remaining open item

| Item | Proposed resolution | Evidence | Owner | Status this pass |
|---|---|---|---|---|
| 33 ownerless tokens | §8 mapping (a=5, b=14, d=14, c=0) stands; GOV-004 mechanism; `decision_id` stays null; warnings intentionally kept | §8 record + §3 records + token notes (§19.2) | Founder (ratify or defer) | RESOLVED (governance) — values not approved |
| 6 hue carve-outs | Option 1 monochrome or Option 2 blue (§19.6); per-theme light+dark together (26.4) | computed WCAG 2.2 AA both themes | Founder | PROPOSED (needs approval) |
| Focus contrast `NOT_RUN` (2) | Rendered check after hue adoption | — | Founder hue → Gate 4 | BLOCKED |
| Badge defects (2) | Ratios pass (4.54/5.38), rendered review pending | §10 | Gate 4 | DEFECT_CLOSED_PENDING_REVIEW |
| 26.1 / 26.5 | Founder supplies/commissions master + wordmark per `BRAND_ASSET_SPEC.md` | — | Founder | PENDING_ASSET (blocks BRAND-009/010, PAGE-027) |
| PAGE-027 | og:title/description exist; og:image absent; blocked on BRAND-009 mark; no evidence maps it — stays PROPOSED | `index.html:7-9`, `DESIGN_MANIFEST.yaml:252` | Founder | BLOCKED (asset) |
| 26.9 contact path | Email §34 BLOCKED; `test_no_mailto_links` forbids mailto; no channel decided | `tests/test_site_content.py:54`, phase8 closure §6 | Founder | BLOCKED |
| 26.11 consent/legal | ESCALATE — jurisdiction + disclosure-vs-consent-vs-inert + legal text | — | Founder | PENDING_ESCALATE |
| 26.16 §8.5/§27.A | Recovery re-attempted → negative (§19.7); founder restates contract + hosting | phase8 closure §5.1 | Founder | BLOCKED (pending text) |
| Penpot workstream | MCP not mounted; env var unwired; no readiness claim | §19.7 | Founder | BLOCKED |
| Visual regression (both themes) | Not run — no rendered surface exists | — | Gate 4 | NOT_RUN |
| TEST-007 | Budgets approved (26.15); tooling undefined; no measured PASS | `PERFORMANCE_BUDGET.yaml` | Founder | BLOCKED |
| Responsive contract | Breakpoints approved; behaviour unvalidated until rendered | `RESPONSIVE_SPEC.md` | Gate 4 | OPEN |
| Caption floor tension | `0.85rem` ≈ 13.6px < COMP-TXT-05 floor (14px); recorded in token note; surfaced, no invented fix | `DESIGN_MANIFEST.yaml:91`, `DESIGN_TOKENS.yaml:531` | Gate 4 | OPEN |

### 19.4 APPROVED / IMPLEMENTED / VERIFIED / BLOCKED separation

- **APPROVED (policy):** the 12 decisions in §3 — founder-approved and recorded (unchanged).
- **IMPLEMENTED:** none this pass — no code, CSS, or page change. Implementation begins at Gate 4.
- **VERIFIED (deterministic):** validators PASS (§11); token↔implementation cross-check consistent
  (§19.5); 14-pair contrast matrix 10 PASS + 2 closed-pending-review + 2 NOT_RUN (§10).
- **BLOCKED (preserved; not resolvable by any available evidence):** 26.9, 26.11, 26.16, 26.1/26.5,
  PAGE-027, Penpot, focus NOT_RUN, TEST-007, visual regression both themes. **No completion claimed
  for any of these.**

### 19.5 Token ↔ implementation verification (deterministic, vs `index.html:12`)

| Family | Decision | Implementation match | Result |
|---|---|---|---|
| Typography size/leading/weight | 26.2 | body 1rem/1.6; h1 `clamp(2.5rem,7vw,5rem)`/1.05; badge `.85rem` = size-1; footer `.9rem` = size-2; h2/h3 UA normalisation toward 1.5rem/1.125rem; weights 400/700 | MATCH · caption floor tension noted (§19.3 last row) |
| Density | 26.6 | page 48px/24px; card 20px; grid gap 16px; badge 4px/10px; step padding 8px / indent 18px / margin 12px; h2 margin-top 64px; footer margin-top 72px (incl. 10/18 optical exceptions) | MATCH |
| Radius/border/shadow (ownerless) | GOV-004 | card 14px, badge 999px, 1px borders, no shadow → evidence-backed values correct; source still emits `#ddd`/`#bbb` literals (repair lands when CSS is rendered at Gate 4; review pending) | MATCH · pending render |
| Motion | 26.7 | zero transitions/keyframes in site; tokens exist, nothing animates | CONSISTENT |
| Breakpoints | 26.8 | zero `@media` in site; approved tokens unused | CONSISTENT |
| Performance | 26.15 | ~4KB inline HTML + 2 small scripts structurally within budget; untooled → no PASS claimed | CONSISTENT |

Result: no contradictions; the gate record agrees with the live page.

### 19.6 Interactive hue-family proposal — values stay PENDING until founder approval

Deterministic WCAG 2.2 ratios from a runnable stdlib script (replicates the validator luminance
math; located in `/tmp/opencode/hue_proposal.py`). Targets: light canvas `#fafafa` / surface
`#ffffff`; dark canvas `#0f0f0f` / surface `#1a1a1a`; text 4.5:1, non-text 3:1.

**Option 1 — Monochrome (recommended: invents no hue; every value derives from already-approved
neutral primitives):**

| Token | Light | Dark | Min contrast |
|---|---|---|---|
| `primitive.color.accent` | `#151515` (shared raw) | — | 17.50:1 light · 17.12:1 dark surfaces |
| `semantic.color.action.primary` | `#151515` | `#f2f2f2` | 17.50/18.26 · 17.12/15.55 |
| `semantic.color.action.primary-hover` | `#2f2f2f` | `#ffffff` | `#fafafa` on `#2f2f2f` 12.83 · `#0f0f0f` on `#ffffff` 19.17 |
| `semantic.color.focus.ring` | `#151515` | `#f2f2f2` | ≥ 15.55 vs BOTH canvas and surface, each theme |
| `semantic.color.fg.inverse` | `#fafafa` | `#0f0f0f` | 17.50 on action bg · 17.12 on action bg |
| `component.status.text-color` | `#151515` | `#f2f2f2` | 18.26 · 15.55 (theme fg aliases; tint is enhancement only, A11Y-013) |

All ratios ≥ 12.8:1 — far above AA, in both themes, on both canvas and surface.

**Option 2 — Conservative blue (valid only as a per-theme mapping):**

| Token | Light | Dark | Min contrast |
|---|---|---|---|
| `primitive.color.accent` | `#3b82f6` (shared raw) | — | 3.52:1 light canvas / 5.21:1 dark canvas (non-text roles) |
| `semantic.color.action.primary` | `#1d4ed8` | `#93c5fd` | 6.70:1 light surface · 10.63:1 dark canvas |
| `semantic.color.action.primary-hover` | `#1e40af` | `#bfdbfe` | 8.72 · 13.49 |
| `semantic.color.focus.ring` | theme text `#151515` | theme text `#f2f2f2` | drawn as an **offset outline**; 17.5/18.26 and 17.12/15.55 vs both surfaces. A hue-matched ring (`#2563eb`/`#60a5fa`) passes 3:1 vs canvas but only 1.30–1.41:1 vs the action fill — hence the offset-on-text-color convention is required |
| `semantic.color.fg.inverse` | `#ffffff` | `#0f0f0f` | 6.70 on `#1d4ed8` · 10.63 on `#93c5fd` (white only on the light action fill) |
| `component.status.text-color` | `#151515` | `#f2f2f2` | as Option 1 (theme fg aliases) |

**Deterministic finding worth recording:** no single hex passes AA text contrast in both themes for
`action.primary` (`#1d4ed8` is 2.60:1 on dark surfaces; `#93c5fd` is 1.73:1 on light) — confirming
why the 26.4 value/value_dark theme architecture is mandatory, and why `accent` is a shared raw
primitive while semantic action colors are per-theme.

**Recommendation:** Option 1 — it invents nothing and carries the widest margins. Option 2 is a
viable AA alternative if a chroma presence is wanted. Tokens remain `VALID_PENDING_DECISION`; no
values are written to `DESIGN_TOKENS.yaml` without founder approval.

### 19.7 Blocked-item preservation evidence (re-verified this pass)

- **§8.5 / §27.A recovery:** re-attempted via fresh git-history search on `feat/company-os-phase8`
  (`git grep` for "8.5" across refs). The only reference is the phase8 closure doc itself, which
  documents the prior negative trail (§5.1: git grep across all 24 commits; `~/company-os`; gbrain
  semantic search; `/tmp/opencode` + session logs; the "Paul Olok" PDF is an unrelated consulting
  contract). Verdict unchanged: §8.5 text genuinely unrecoverable; rows stay BLOCKED-pending-text;
  the founder must restate the contract (26.16 / §27.A). **Nothing invented.**
- **26.9 Email §34:** `tests/test_site_content.py:54` `test_no_mailto_links` forbids mailto; phase8
  closure §6 (no sending domain, no mail-provider credentials, no public address; nothing sent; no
  SOP authored — §50 report-don't-invent preserved). Stays BLOCKED.
- **Penpot MCP check (no credentials exposed):** `~/.config/opencode/opencode.json` mounts **gbrain
  only**; the project `opencode.json` has no MCP section (provider-only config); `PENPOT_MCP_URL`
  exists in `secrets/providers.env` (`mode 600`) but is **not wired into any MCP configuration**.
  Readiness BLOCKED confirmed; no Penpot connection claimed; var values never printed or committed.
- **Secret hygiene:** unchanged PASS (§11 row 7); no secret text introduced by this pass.

### 19.8 Phase-exit assessment (Gate 3)

**Gate 3 is complete as a governance gate:** all 17 decisions recorded; 84 tokens approved; 33
ownerless tokens mapped (§8, confirmed §19.1–19.2); the 6-token hue family now carries a concrete,
AA-validated proposal (§19.6); every open item is classified with an owner and an evidence-backed
reason; determinism holds (validators PASS, tests PASS, diff-clean).

**Gate 3 is intentionally NOT complete as "all values decided":** 39 tokens remain
`VALID_PENDING_DECISION` by design — the hue family awaits founder approval, the ownerless group
awaits ratification of the §8 GOV-004 map (or an explicit founder assignment), and the
asset/legal/contact-policy blockers (26.1/26.5, 26.9, 26.11, 26.16) cannot be closed by an agent.

Verdict: **exit Gate 3 (governance), enter Gate 4 (foundation implementation)** pending the founder
decisions in §19.9 and Gate-2/3 review. **No launch readiness is claimed.**

### 19.9 Exact founder decisions that cannot be inferred (needed before/at Gate 4)

1. **Hue family:** choose Option 1 (monochrome) or Option 2 (blue) for the 6 carve-out tokens — or
   override with your own hues (light + dark together, 26.4).
2. **Ratify the §8 GOV-004 ownerless map** (a=5 adopt-at-build, b=14 aliases, d=14 deferred-null) —
   or explicitly extend a §26 decision to own a domain.
3. **26.1 / 26.5:** supply or commission the brand master + wordmark evidence (unblocks BRAND-009/010,
   PAGE-027, and the deferred icon primitives).
4. **26.9 contact path:** authorize a channel or keep none (Email §34 governs).
5. **26.11:** jurisdiction(s) + disclosure-vs-consent-vs-inert choice + legal text/counsel.
6. **26.16:** restate the §8.5 contract text and choose hosting for the Penpot/workstream direction.
7. **Penpot MCP:** confirm wiring the `PENPOT_MCP_URL`-derived endpoint into OpenCode, or keep BLOCKED.
8. **TEST-007:** define the performance tooling so 26.15 can be measured at Gate 4.

### 19.10 Files changed this pass

- `evidence/runs/design-gate3-decision-closure-2026-10-08.md` — §19 appended (this section).
- No token/YAML/manifest/spec/script/test/page changed. Nothing committed; no PR. Staged for founder
  review.

---

## 20. Founder decision application + re-verification (2026-10-09)

Purpose: record how the founder's 2026-10-09 decisions (the §19.9 request list) were applied, and
report the resulting verified state. Nothing committed; no PR — staged for founder review.

### 20.1 Decision disposition (the 8 §19.9 items)

| # | §19.9 request | Founder decision | Outcome |
|---|---|---|---|
| 1 | Hue family (6 carve-out tokens) | **Option 1 — neutral-derived monochrome** (light + dark together, 26.4) | 6 tokens `VALID_APPROVED` (was `VALID_PENDING_DECISION`); 3 new dark raw primitives; contrast now measured (22 PASS + 2 badge PENDING_REVIEW; **0 NOT_RUN**) |
| 2 | Ratify the §8 GOV-004 ownerless map | **Ratified Option A (GOV-004, not §26.6)** — 5 adopted / 14 aliases / 14 deferred | Recorded in §8; no owner invented; deferred stay pending; mechanism unchanged |
| 3 | 26.1 / 26.5 brand master + wordmark | Direction (B) re-confirmed as **direction only** | 26.1/26.5 **stay `PENDING_ASSET`** — asset-independent work proceeds; no agent-invented mark |
| 4 | 26.9 contact path | **No form/submission path in v1** | 26.9 stays `BLOCKED`; mailto prohibition + `test_site_content.py:54` preserved |
| 5 | 26.11 jurisdictions/consent choice + legal text | **Minimum required input specified** | 26.11 stays `PENDING_ESCALATE`; input recorded in §3 26.11; no consent mechanism/legal assertion until supplied |
| 6 | 26.16 restate §8.5 contract text + hosting | **Stays BLOCKED; restatement requested** | Agent must request governing text/founder restatement before any Penpot mapping claim |
| 7 | Penpot MCP wiring | **Not changed** | Stays BLOCKED (MCP unmounted/unwired; verdict unchanged from §19.7) |
| 8 | TEST-007 performance tooling | **Approved: stdlib deterministic approach** | Approach + inspection recorded in `PERFORMANCE_BUDGET.yaml`; **TEST-007 stays BLOCKED** until tool operational + reproducible |

### 20.2 Token-state changes

- Tokens: 123 → **126** (added `primitive.color.accent-hover-raw`, `dark-accent-raw`,
  `dark-accent-hover-raw`). Revised counts: **93 VALID_APPROVED / 33 VALID_PENDING_DECISION /
  0 INVALID** (was 84/39/0 — six hue tokens + three new primitives approved; the §8 ownerless group
  stays honestly pending per the GOV-004 ratification).
- Dark theme coverage: 15 colour roles → **15 mapped, 0 carved-out** (hue family no longer pending).
- Contrast matrix: 14 → **24 rows**; `focus-ring-on-canvas` moved from NOT_RUN to measured, and 5 new
  pairs added (inverse-text-on-action, action-on-canvas, status-text-on-surface, ± hover).
- Disabled state: recorded as an explicit open item (no token exists — intentionally not fabricated).

### 20.3 Verification results (run this pass)

- `tools/validate_design_tokens.py` → **PASS (exit 0)**: 126 tokens, 93/33/0; 24 contrast rows —
  22 PASS + 2 `DEFECT_CLOSED_PENDING_REVIEW` (badge-border A11Y-004, 4.54:1 / 5.38:1); 36 warnings
  (3 decision-status + 33 ownerless), none fatal.
- `tools/validate_design_manifest.py` → **PASS (exit 0)**: 290 items (CURRENT=30 REQUIRED=175
  FUTURE=63 OUT_OF_SCOPE=22).
- `tools/validate_design_graph.py` → **PASS (exit 0)**: 11 families / 130 items / 9 edges /
  3 patterns; 1 warning (PAGE-027 template PROPOSED — unchanged).
- `tests.test_site_content`, `tests.test_phase8_gate`, `tests.test_security_phase8` → **45/45 OK**.
- Full suite (`python -m unittest discover -s tests`) → **694 OK (exit 0)**.
- `git diff --check` → **clean**.

### 20.4 Not claimed

No visual approval (ratios ≠ visual review — focus ring, accent/action, badge pending). No
performance measurement (TEST-007 still BLOCKED). No Penpot readiness. No form/contact path. No
invented brand asset, legal text, or disabled-state colour. No commit/PR.

### 20.5 Files changed this pass

- `docs/design/DESIGN_TOKENS.yaml` — hue tokens approved, 3 primitives added, contrast matrix.
- `docs/design/DESIGN_DECISIONS.md` — §3 addenda (26.3/26.4/26.1/26.9/26.11/26.15/26.16), §5 register
  notes, §8 GOV-004 ratification.
- `docs/design/DESIGN_TOKENS.md`, `docs/design/ACCESSIBILITY_SPEC.md` — carve-out prose updated;
  focus rows PASS.
- `docs/design/PERFORMANCE_BUDGET.yaml` — measurement approach + tooling_inspection recorded.
- `evidence/runs/design-gate3-decision-closure-2026-10-08.md` — §20 (this section).
- No gate script, CI workflow, page, or test changed. Staged for founder review; nothing committed.