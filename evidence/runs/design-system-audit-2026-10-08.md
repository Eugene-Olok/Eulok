# Company OS — Greenfield Design-System Audit and Specification

**Date:** 2026-10-08
**Mode:** read-only audit — no repository, Penpot, configuration, or application changes were made
**Repository:** `/home/genie/company` · `main` @ `93e9071` (8 commits on `main`, 72 commits across all refs)
**Classification of this document:** INTERNAL
**Purpose:** establish the factual baseline for Company OS design and specify the authoritative design-system requirement set for a later Penpot/frontend programme.

---

## Table of contents

1. Executive summary
2. Scope, method, and evidence base
3. Definitions and status model
4. Repository and programme state
5. Current visual baseline
6. Binding constraints inventory
7. Design coverage inventory (7.A–7.E)
8. Brand and identity status
9. Foundations status
10. Components status
11. Pages and templates status
12. Governance, tooling, and Penpot status
13. Dependency graph
14. Manifest schema
15. Complete proposed manifest
16. Component architecture
17. Page architecture
18. Responsive architecture
19. Accessibility architecture
20. Design governance
21. Design-to-code contract
22. Testing and verification requirements
23. Penpot implementation plan
24. Phase 8 design scope
25. Explicit exclusions
26. Owner decisions required
27. Risks and ambiguities
28. Recommended execution sequence

---

## 1. Executive summary

Company OS has **one UI artifact**: a single static HTML page at `business/site/index.html` (50 lines, inline `<style>`, zero interactive elements). It has **no design system** in the ordinary sense — no tokens file, no CSS file, no fonts, no logo, no favicon, no imagery, no icon set, no components beyond five ad-hoc inline patterns, no responsive breakpoints, no hover or focus styling, and no Penpot artifacts anywhere in the repository or its history.

What the site *does* have is a set of **binding, deterministically enforced constraints**: content invariants in `tests/test_site_content.py`, website checks in `scripts/gates-phase8.sh`, a four-state deploy model in `scripts/deploy-site.sh`, and a founder-triggered deploy workflow. Any design-system or redesign programme must preserve these, or change them through an explicit, reviewed decision — never silently.

This audit classifies every design-relevant fact it found and every requirement it proposes:

| Classification | Count | Meaning |
|---|---:|---|
| CURRENT | 30 | exists today in shipped or committed form (evidence cited) |
| REQUIRED | 175 | must exist for the target design system to be complete |
| FUTURE | 63 | real, in-scope-later; not part of the initial build |
| OUT_OF_SCOPE | 22 | explicitly excluded, with reason (§25) |
| **Total manifest items** | **290** | §15 |

Headline findings:

1. **The baseline is a text document, not a product UI.** No links, buttons, inputs, forms, menus, or media queries exist (`index.html` contains zero `<a>`, `<button>`, `<input>`, `<form>`, `:hover`, `:focus`, `@media` occurrences — verified by grep).
2. **Typography is declared but never loaded.** `font-family: Inter,system-ui,sans-serif` names Inter; no font files exist anywhere in the repository and no stylesheet loads one, so every render uses the platform `system-ui` fallback (`business/site/index.html:12`).
3. **One accessibility defect is provable today:** the badge border `#bbb` on `#fff` is ≈1.9:1 — below the WCAG 2.2 AA non-text contrast minimum of 3:1 (1.4.11) for UI components that identify state (`index.html:12`).
4. **Penpot is unresolved, not merely absent.** Phase 8 closed with Identity (§8.2) and Penpot (§8.5) rows *reserved* because the governing requirement text is "genuinely not retrievable" (`evidence/runs/PHASE8-CLOSURE-2026-10-06.md:155-174`). The tool decision cannot be treated as settled contract text.
5. **The copy is gate-pinned.** The hero line "Software that survives production", the title, the honesty line "None published yet", and the absence of `mailto:` are asserted by both the gate's live check and `tests/test_site_content.py`. Copy redesign is therefore a *contract change*, not an editing task (§27.C).
6. **Email is BLOCKED (§34), so the contact path is unestablished.** A contact/intake page is REQUIRED, but no submission backend exists and `mailto:` is test-forbidden; the intake SOP's six questions define the form's content contract (`sops/intake/SKILL.md:29-38`).

The report recommends a seven-step execution sequence (§28) that starts with recovering the missing §8.2/§8.5 contract text and obtaining the 17 owner decisions listed in §26, before any token or component work begins.

---

## 2. Scope, method, and evidence base

### 2.1 In scope

- Everything that constitutes or affects visual/UI design of Company OS's own surfaces: brand, foundations, components, pages, responsive behaviour, accessibility, governance, design-to-code tooling (Penpot), and the verification that binds them.
- The public website (`business/site/`), and the design requirements implied by company SOPs, business-domain states, and Phase 8 contract artefacts.

### 2.2 Out of scope

- Client UI work under `clients/<client>/` (governed by each client's own `SCOPE.md`).
- Implementation: this document specifies; it does not build (§28 is the build sequence).
- Backend, finance, integrations, and model-routing configuration (`config/models.yaml` is untouched by definition).

### 2.3 Method

1. **Repository survey** — full file inventory; targeted searches for design artefacts (CSS, tokens, fonts, images, SVG/ICO, design docs) — all negative (§5.1).
2. **Single-artefact reading** — line-level read of `business/site/index.html`, `config.js`, `analytics.js`.
3. **Constraint extraction** — line-level read of `tests/test_site_content.py` (199 lines), the `[website]` and deploy sections of `scripts/gates-phase8.sh`, `scripts/deploy-site.sh`, `.github/workflows/phase8.yml` and `gates.yml`.
4. **Programme-state extraction** — `evidence/runs/PHASE8-CLOSURE-2026-10-06.md` (tests, blocks, unresolved rows), `git log` across all refs, branch containment checks.
5. **Requirement sourcing** — `ETHOS.md`, `AGENTS.md`, `CLAUDE.md`, all eight `sops/*/SKILL.md`, `company_os/business/domain.py` state enums.
6. **Classification** — every finding and every proposed requirement is written as one manifest item (§15) with exactly one status, a priority, a basis code (§14), and an evidence pointer or `NOT ESTABLISHED`.

### 2.4 Evidence base (files read for this audit)

| Evidence | Path |
|---|---|
| Site markup + inline styles | `business/site/index.html` |
| Deploy-time analytics config | `business/site/config.js`, `business/site/analytics.js` |
| Content/structure invariants | `tests/test_site_content.py` |
| Website gate checks | `scripts/gates-phase8.sh` (`[website]` section) |
| Deploy model | `scripts/deploy-site.sh` |
| Deploy workflow | `.github/workflows/phase8.yml` |
| CI gate workflow | `.github/workflows/gates.yml` |
| Phase 8 closure | `evidence/runs/PHASE8-CLOSURE-2026-10-06.md` |
| Operating ethos | `ETHOS.md` |
| Operating policy | `AGENTS.md` |
| Skill routing | `CLAUDE.md` |
| Intake contract | `sops/intake/SKILL.md` |
| Case-study contract | `sops/case-study/SKILL.md` |
| Other SOPs | `sops/{proposal,scope-guard,client-update,incident,invoice-run,weekly-close}/SKILL.md` |
| Business state machine | `company_os/business/domain.py` |
| History | `git log --all`, `git branch -a --contains fac0e3a` |

### 2.5 What was not done

- The test suite was **not re-run** (read-only audit; the latest verified count is 621 tests at Phase 8 closure, `PHASE8-CLOSURE-2026-10-06.md:49`). Later Zoho-branch commits may have added tests; no claim is made about the current count.
- No live-site fetch was performed; live-state claims are quoted from gate code and closure evidence only.
- No Penpot workspace exists to inspect (§12).
- No external/benchmark research was consulted; this is an internal-baseline audit.

---

## 3. Definitions and status model

### 3.1 Statuses (exactly four; a fifth is not permitted)

| Status | Definition | Evidence bar |
|---|---|---|
| **CURRENT** | the item exists today in shipped or committed form | file + line citation required |
| **REQUIRED** | must exist for the target design system to be considered complete | basis code + source citation required |
| **FUTURE** | legitimate and in-scope, but deliberately deferred past the initial build | basis code + deferral note required |
| **OUT_OF_SCOPE** | excluded by decision, with a stated reason | reason + (where relevant) conflict note required |

Absent evidence is recorded as **`NOT FOUND`** (a fact about the audit) or **`NOT ESTABLISHED`** (a value the organisation has not decided) — never as an invented value. Historical or deferred facts that must not be lost live in the item's `notes` field, not in a fifth status.

### 3.2 Priority

| Priority | Meaning |
|---|---|
| **P0** | blocks other work or is a hard conformance requirement (accessibility, gate preservation) |
| **P1** | needed for the first complete release of the system |
| **P2** | needed for completeness; can follow first release |
| **P3** | FUTURE backlog depth |

P3 is reserved for FUTURE/OUT_OF_SCOPE items and stretch REQUIRED items; REQUIRED items that block release are P0/P1.

### 3.3 Basis codes (why an item exists)

| Code | Basis |
|---|---|
| **[S]** | founder scope / this audit's charter reach, or an explicit company-policy statement |
| **[D]** | a business-domain state machine or contract already exists (`company_os/business/domain.py`) |
| **[P]** | an SOP exists with no UI (`sops/*/SKILL.md`) |
| **[E]** | Email §34 is BLOCKED/deferred; the requirement is shaped by that constraint |
| **[K]** | the case-study publication pipeline (`sops/case-study/SKILL.md`) implies the surface |

Items whose basis is the audit's own conformance logic (e.g. WCAG success criteria, test preservation) carry **[S]** with the criterion named in `notes`.

### 3.4 Evidence citation style

`path:line` where a line is meaningful; `path` alone for whole-file facts; `repo survey` for repository-wide negative findings (search commands are recorded in §5.1 so the negative is reproducible).

---

## 4. Repository and programme state

### 4.1 Git state

- `main` @ `93e9071` — "docs(evidence): Zoho Books turnover-reporting capability audit + UI-only runbook (#4)".
- 8 commits on `main`; 72 commits across all refs. Other branches: `feat/company-os-phase7-proof`, `feat/company-os-phase8`, `feat/gbrain-memory-foundation`, `feat/zoho-books-turnover-configuration`, `feat/zoho-crm-projection`, `backup/local-opencode-merge`.
- The site was introduced by the Phase 8 work (`f478cfd` "Phase 8: Production implementation and deterministic closure").

### 4.2 Phase status (from `evidence/runs/PHASE8-CLOSURE-2026-10-06.md`)

| Item | Status | Source |
|---|---|---|
| Phase 8 | **COMPLETE** — 621 tests, strict gate `status=PASS failed=0 blocked=0 skipped=0` | `:23`, `:50`, `:215-217` |
| Email (§34) | **BLOCKED / deferred** — no sending domain, no mail provider | `:28`, `:180-183` |
| Identity (§8.2) | **unresolved** — requirement text not retrievable; rows reserved, nothing invented | `:35`, `:155-174`, `:205-206` |
| Penpot (§8.5) | **unresolved** — same | `:35`, `:170-174` |
| Phase 9 | **NOT STARTED** | `:40`, `:224` |
| Push/PR/merge of Phase 8 | none at closure | `:224` |

### 4.3 Programme-state anomalies

- **"Phase 13" commit exists off-main.** `fac0e3a` — "chore: record Phase 13 deterministic gate evidence (PASS, 0 failed checks)" — is contained in `feat/zoho-crm-projection` and `backup/local-opencode-merge`, **not** `main`. Phase 8's closure says Phase 9 has not started, so a "Phase 13" label is unexplained by any on-main sequence. Classified as an ambiguity to resolve, not a fact about programme order (§27.B).
- **Product surface is empty.** `products/` contains no product directories; `clients/` contains only `_template/`; `docs/` is empty. There is no second UI surface to design for today.
- **`decisions/` holds one record** (`trust-tiers.md`) — no design or brand decision records exist (basis for GOV-001, GOV-012).

### 4.4 Design-relevant routing already configured

`CLAUDE.md:9` routes "Design system/plan review → `/design-consultation` or `/plan-design-review`" and "Visual polish → `/design-review`". The toolchain for the later programme is already named in the repository; this audit is the baseline those skills should be pointed at.

---

## 5. Current visual baseline

### 5.1 What exists (and how the absences were verified)

Present:

| Artefact | Location |
|---|---|
| One page, inline stylesheet | `business/site/index.html:11-13` |
| Deploy-time analytics config + inert loader | `business/site/config.js`, `business/site/analytics.js` |
| Live-verified deploy | `scripts/deploy-site.sh` states `build / attempted / verified / unavailable` |

Absent — each verified by repository-wide search (excluding `.venv`, `node_modules`, `.git`):

| Absent | Search |
|---|---|
| Any `*.css` file | `find … -name "*.css"` → none |
| Any font file (`*.woff*`, `*.ttf`) | → none |
| Any image/icon (`*.svg`, `*.png`, `*.ico`) | → none |
| `@font-face`, `@media`, `:hover`, `:focus`, `mailto` in site files | `grep -rn` → none |
| Favicon/`<link rel=icon>`, `og:image` | not present in `index.html` |
| Design-system docs (`docs/` empty; no `DESIGN.md`, no tokens) | directory listing |

### 5.2 Declared and implied design values (complete inventory)

All values below come from the single rule block at `business/site/index.html:12`.

**Colour (6 values, no roles, no names):**

| Value | Used for | Measured contrast note |
|---|---|---|
| `#151515` | text (`:root`) | ≥15:1 on `#fafafa` — passes |
| `#fafafa` | background (`:root`) | — |
| `#ffffff` | card surface | — |
| `#dddddd` | card border, footer top border | ≈1.3:1 vs `#fafafa` — decorative-boundary risk (§19.4) |
| `#bbbbbb` | badge border | **≈1.9:1 vs `#ffffff` — fails WCAG 1.4.11 (3:1)** |
| `#111111` | step marker border/number | ≥15:1 — passes |
| `#555555` | footer text | ≈7.1:1 on `#fafafa` — passes AA for normal text |

(Seven literals total: the "6 values" above plus `#111` counted once; no variable, no role system, no semantic naming.)

**Typography:**

| Rule | Value |
|---|---|
| Family | `Inter, system-ui, sans-serif` — **Inter never loaded**; effective family is `system-ui` |
| h1 | `clamp(2.5rem, 7vw, 5rem)`, `line-height: 1.05`, `max-width: 800px` |
| h2 | browser default size, `margin-top: 64px` |
| h3 | browser default (card titles) |
| Body | browser default `1rem`, `line-height: 1.6` |
| Badge | `font-size: .85rem` |
| Footer | `font-size: .9rem` |

**Spacing / layout / shape:**

| Token-equivalent | Value |
|---|---|
| Page container | `max-width: 980px`, centred, `padding: 48px 24px` |
| Grid | `repeat(auto-fit, minmax(220px, 1fr))`, `gap: 16px` |
| Card | `border: 1px`, `border-radius: 14px`, `padding: 20px` |
| Badge | `border-radius: 999px`, `padding: 4px 10px`, `border: 1px` |
| Step list | `border-left: 2px`, `padding: 8px 0 8px 18px`, `margin: 12px 0` |
| Section heading | `h2 { margin-top: 64px }` |
| Nav | `display: flex; justify-content: space-between; gap: 20px` |
| Footer | `margin-top: 72px; padding-top: 24px` |

**Interaction / motion / elevation:** none. No hover, focus, active, or disabled states; no transitions or keyframes; no shadows or elevation; no z-index; no breakpoints.

### 5.3 Structural and content facts

- Semantic skeleton: `nav` → `main` → `footer`; exactly one `h1`; headings never skip (`tests/test_site_content.py:120-139`); `<html lang="en">`; one `viewport`, one `description`, `<title>` contains "Company OS".
- **Zero interactive elements**: no `<a>`, `<button>`, `<input>`, `<form>`, no inline handlers, no `javascript:` URLs (grep-verified; tests enforce the last two at `test_site_content.py:180-191`).
- Scripts: two local scripts, `config.js` must precede `analytics.js` (`test_site_content.py:67-73`); no third-party script tags (`:166-178`).
- Gate-pinned copy: hero "Software that survives production" (`index.html:18`; asserted live by `gates-phase8.sh`), title `Company OS` (`:6`; asserted live), "None published yet" honesty line (`:42`; asserted in both test and gate), no `mailto:` anywhere (`test_site_content.py:54-56`).

### 5.4 Baseline verdict

The current surface is a **credible one-page text document** — honest, fast, accessible in structure, and deterministically guarded — but it is **not a design system**: no tokens, no reusable components, no interaction states, no responsive rules, no brand assets, no tooling. Every design decision a system would own is currently either an untested inline literal or an implicit browser default.

---

## 6. Binding constraints inventory

These are not aspirations; each is enforced today by code. The design programme must satisfy all of them, or change the enforcing code through an explicit, reviewed decision (§20.4).

### 6.1 `tests/test_site_content.py` (199 lines — 19 assertions in 3 classes)

| # | Constraint | Line(s) |
|---|---|---|
| 1 | `index.html`, `analytics.js`, `config.js` must exist | `:26-29` |
| 2 | Forbidden markers absent from every site file: `Case study 0`, `hello@example.com`, `example.com`, `Replace this placeholder`, `Replace this`, `Lorem ipsum`, `TODO`, `FIXME` | `:13-22`, `:31-40` |
| 3 | No committed PostHog key (`phc_…`) | `:42-52` |
| 4 | No `mailto:` in `index.html` | `:54-56` |
| 5 | `Case studies` + `None published yet` both present in `index.html` | `:58-63` |
| 6 | `config.js` script tag precedes `analytics.js` | `:67-73` |
| 7 | `config.js` default is `window.__POSTHOG_CONFIG__ = {}` | `:74-76` |
| 8 | Config guard precedes `posthog.init(` | `:78-82` |
| 9 | Guard short-circuits: `if (!config \|\| !config.api_host \|\| !config.key) return;` | `:84-88` |
| 10 | `<html lang="en">` | `:116-118` |
| 11 | Exactly one `h1` | `:120-122` |
| 12 | Heading levels never skip | `:124-139` |
| 13 | Landmarks `nav`, `main`, `footer` present | `:140-144` |
| 14 | Exactly one `viewport` + one non-empty `description` | `:145-159` |
| 15 | `<title>` present and contains "Company OS" | `:161-164` |
| 16 | All `script src` local and resolving to real files | `:166-178` |
| 17 | No inline event handlers, no `javascript:` URLs | `:180-191` |
| 18 | `target="_blank"` implies `rel` containing `noopener` | `:193-199` |
| 19 | (Combines with #5's class placement under `WebsiteFileTests`) | — |

**Implication for a redesign:** a multi-page site must keep these true — several assertions read `index.html` directly (`:54`, `:58`, `:120`, `:161`), so a page split requires *extending* the test file (new tests for the new pages) while keeping every existing assertion meaningful. Weakening them to make a design pass is prohibited by `AGENTS.md` ("Never silently change company policy"; "deterministic verification takes precedence over model judgement").

### 6.2 `scripts/gates-phase8.sh` — `[website]` section

| Check | Behaviour |
|---|---|
| website files present | FAIL if any of the three site files is missing |
| website placeholders | FAIL on placeholder regex (incl. `phc_` keys) anywhere under `business/site` |
| analytics inert without config | node-evaluated: `document` is a Proxy that throws if touched before the config guard |
| deploy targets pages.dev only | PASS requires `pages.dev` in `deploy-site.sh` **and no** `custom_domain`/`--domain`/`routes =` marker — **custom domains are gate-forbidden** |
| site deploy builds | `deploy-site.sh --build-only` must reach `state=build` |
| live site verification | fetches canonical Pages domain; requires title, hero line, `analytics.js` served, `None published yet`; FAILs on forbidden markers (incl. `mailto:`) |
| live analytics configuration | shape-only check of `config.js`; key values never printed |
| cloudflare / posthog credentials | BLOCKED (not FAILED) when absent |
| unit tests, evidence contracts, secret hygiene, git repository, bash syntax | shared gate sections that also cover site files |

### 6.3 `scripts/deploy-site.sh`

- Four verification states recorded to `artifacts/deploy-site-evidence.json` on every exit path: `build`, `attempted`, `verified`, `unavailable` (`:13-23`).
- Stages the site into a temp directory and injects PostHog config **there**, so working tree and git history never carry a key (`:6-8`).
- Fail-closed exit codes: 3 BLOCKED / 1 FAIL / 0 success.

### 6.4 Workflows

- `.github/workflows/phase8.yml`: deploy runs only on `workflow_dispatch` **with** `inputs.deploy` (`:8`, `:83`) — no automatic production pushes from CI.
- `.github/workflows/gates.yml`: langfuse mode is `required` only for `workflow_dispatch`, `hermetic` otherwise (`:31`) — an existing pattern for "manual runs carry stricter evidence" that design-audit runs can reuse.

### 6.5 Content-policy constraints (non-code)

- `AGENTS.md`: evidence bar for words like *done/shipped/secure/tested*; no fabricated financials or metrics; data classification PUBLIC/INTERNAL/CONFIDENTIAL/RESTRICTED; free inference providers must not receive CONFIDENTIAL client material (constrains any future AI-assisted asset pipeline).
- `ETHOS.md §6`: trust guarantees a client UI must make visible (scope change, evidence, no invented progress).
- `sops/case-study/SKILL.md`: case study is a *derived artefact*, never the source of truth; BLOCK if evidence is insufficient; publication requires client approval. This is the content contract for PAGE-008/009.

**Constraint summary:** the programme is free inside a hard shell — content honesty, local-script-only analytics, structure/landmarks, deploy shape, and gate-pinned copy are immovable without a recorded decision; *everything visual inside that shell* is currently undesigned and therefore fully open (§26).

---

## 7. Design coverage inventory

Every design-relevant subject found or required is listed below by domain, with its manifest group, item count, and status split. Item-level detail (IDs, priorities, evidence, notes) is in §15. The five subsections sum to the manifest total: **290 items — CURRENT 30 · REQUIRED 175 · FUTURE 63 · OUT_OF_SCOPE 22**.

### 7.A Brand, identity, and voice — 23 items (`BRAND-001…015`, `VOX-001…008`)

| Domain | IDs | Count | C | R | F | O | Baseline fact / gap |
|---|---|---:|---:|---:|---:|---:|---|
| Logo & wordmark | BRAND-001/002/009 | 3 | 2 | 1 | 0 | 0 | No logo files exist; wordmark is `<strong>Company OS</strong>` (`index.html:16`) |
| Favicon & touch icons | BRAND-003/010 | 2 | 1 | 1 | 0 | 0 | No `<link rel=icon>`, no icon files |
| Imagery & illustration | BRAND-004/012 | 2 | 1 | 1 | 0 | 0 | Site is text-only; no photography/illustration policy |
| Iconography | BRAND-005/011 | 2 | 1 | 1 | 0 | 0 | No icon set, sprite, or library |
| Palette & colour roles | BRAND-006 | 1 | 0 | 1 | 0 | 0 | Seven unroled hex literals (§5.2) |
| Type scale & font loading | BRAND-007/008 | 2 | 0 | 2 | 0 | 0 | Inter named, never loaded (§27.D) |
| Theme/density/motion extensions | BRAND-013/014/015 | 3 | 0 | 0 | 3 | 0 | Deferred pending owner decisions (§26) |
| Voice: existing gate-pinned copy blocks | VOX-001…004 | 4 | 4 | 0 | 0 | 0 | Hero, delivery standard, honesty line, service cards all exist and some are gate-asserted |
| Voice: written standards | VOX-005…008 | 4 | 0 | 4 | 0 | 0 | No tone/terminology/claim rules documented anywhere |
| **7.A total** | | **23** | **9** | **11** | **3** | **0** | |

### 7.B Foundations and responsive behaviour — 35 items (`FOUND-001…024`, `RESP-001…011`)

| Domain | IDs | Count | C | R | F | O | Baseline fact / gap |
|---|---|---:|---:|---:|---:|---:|---|
| Colour tokens, hierarchy, contrast | FOUND-001/002/003 | 3 | 0 | 3 | 0 | 0 | Values exist unroled; badge border fails 3:1 (§19.4) |
| Font families, scale, headings, prose | FOUND-004…007, 024 | 5 | 0 | 5 | 0 | 0 | h1 fluid; h2/h3/body are browser defaults |
| Fluid type | FOUND-008 | 1 | 1 | 0 | 0 | 0 | `clamp(2.5rem,7vw,5rem)` on h1 only |
| Spacing, container, grid, radius, borders | FOUND-009…013 | 5 | 4 | 1 | 0 | 0 | 980px container, auto-fit grid, 14px radius, 1px borders exist as literals |
| Elevation, breakpoints, motion, focus, z-index, icon sizes | FOUND-014…019 | 6 | 0 | 6 | 0 | 0 | None exist; no `@media`, no `:focus`, no shadows |
| Extended foundations (density, dark, selection, data-viz) | FOUND-020…023 | 4 | 0 | 0 | 4 | 0 | Deferred with brand extensions |
| Breakpoint system | RESP-001 | 1 | 0 | 1 | 0 | 0 | Zero media queries today |
| Fluid grid / fluid type behaviour | RESP-002/003 | 2 | 2 | 0 | 0 | 0 | auto-fit grid and h1 clamp already respond |
| Nav collapse, container widths, touch targets, overflow, media, wide-screen, reflow | RESP-004…008, 010, 011 | 7 | 0 | 7 | 0 | 0 | No interactive UI yet — rules must exist *before* nav/links ship |
| Print | RESP-009 | 1 | 0 | 0 | 1 | 0 | Deferred |
| **7.B total** | | **35** | **7** | **23** | **5** | **0** | |

### 7.C Components — 130 items (`COMP-*`)

| Family | IDs | Count | C | R | F | O | Notable gap |
|---|---|---:|---:|---:|---:|---:|---|
| Actions (buttons, links) | ACT-01…11 | 11 | 0 | 9 | 2 | 0 | Zero interactive elements exist today |
| Typography & text | TXT-01…09 | 9 | 0 | 6 | 3 | 0 | Only h1/h2/h3 styling exists, inline |
| Selection controls | SEL-01…14 | 14 | 0 | 9 | 5 | 0 | No inputs exist; form fields needed for intake page |
| Forms | FRM-01…14 | 14 | 0 | 11 | 3 | 0 | Contract-shaped (labels, errors, states) per intake SOP |
| Data display | DAT-01…15 | 15 | 1 | 8 | 6 | 0 | Badge pill exists (`.badge`, `index.html:16`) |
| Feedback | FBK-01…13 | 13 | 0 | 9 | 4 | 0 | No loading/empty/error patterns anywhere |
| Overlays | OVL-01…09 | 9 | 0 | 5 | 4 | 0 | Includes focus-trap/Esc behaviour contract (OVL-08) |
| Navigation | NAV-01…12 | 12 | 1 | 6 | 5 | 0 | Top nav exists but has **no links**; skip link missing |
| Containers & layout | CON-01…12 | 12 | 4 | 4 | 4 | 0 | Card, hero, footer, step list all exist inline |
| System & production semantics | SYS-01…12 | 12 | 0 | 8 | 4 | 0 | Driven by domain states [D], SOPs [P], classification policy [S] |
| Spacing primitives | SPC-01…09 | 9 | 0 | 6 | 3 | 0 | Spacing exists only as scattered literals |
| **7.C total** | | **130** | **6** | **81** | **43** | **0** | No component exists as a reusable, styled, state-complete unit |

### 7.D Website platform and pages — 35 items (`BASE-001…005`, `PAGE-001…030`)

| Domain | IDs | Count | C | R | F | O | Baseline fact / gap |
|---|---|---:|---:|---:|---:|---:|---|
| Platform: single page, inline CSS, inert analytics, pages.dev deploy, no assets | BASE-001…005 | 5 | 5 | 0 | 0 | 0 | The entire current platform (§5.1) |
| Home page | PAGE-001 | 1 | 1 | 0 | 0 | 0 | Gate-pinned content (§6.1) |
| Service pages (index + 3 details) | PAGE-002…005 | 4 | 0 | 4 | 0 | 0 | Services are three cards on home today |
| About, process, case studies (index + detail) | PAGE-006…009 | 4 | 0 | 4 | 0 | 0 | Process = the six-step `ol.steps` block; case studies empty by policy |
| Contact/intake + form | PAGE-010 | 1 | 0 | 1 | 0 | 0 | Six intake questions defined; submission path NOT ESTABLISHED [E] |
| Trust/legal content (privacy, security, engineering standards, accessibility statement) | PAGE-011…014 | 4 | 0 | 4 | 0 | 0 | No such content exists; PostHog is live so a disclosure is required |
| 404, sitemap/robots, OG share image | PAGE-015, 026, 027 | 3 | 0 | 3 | 0 | 0 | None exist; `og:title/description` already set, `og:image` missing |
| Blog, terms, cookies, maintenance, careers, press, newsletter, imprint, pricing, testimonials | PAGE-016…025 | 10 | 0 | 0 | 0 | 10 | Excluded with reasons (§25) |
| i18n selector, client portal, status page | PAGE-028…030 | 3 | 0 | 0 | 0 | 3 | Excluded (§25) |
| **7.D total** | | **35** | **6** | **16** | **0** | **13** | |

### 7.E Accessibility, governance, verification, tooling, ops, exclusions — 67 items

| Domain | IDs | Count | C | R | F | O | Baseline fact / gap |
|---|---|---:|---:|---:|---:|---:|---|
| Accessibility (WCAG 2.2 AA) | A11Y-001…016 | 16 | 2 | 13 | 1 | 0 | Structure/landmarks/lang are CURRENT and test-enforced; contrast defect exists; no focus/keyboard/ARIA policy |
| Design governance | GOV-001…014 | 14 | 0 | 12 | 2 | 0 | `docs/` empty; `decisions/` has no design record; founder is sole approver |
| Testing & verification | TEST-001…014 | 14 | 0 | 13 | 1 | 0 | Content tests exist; no visual, a11y-automation, or token-conformance tests |
| Penpot tooling | PEN-001…008 | 8 | 0 | 6 | 2 | 0 | §8.5 requirement text unretrievable — workspace does not exist (§12) |
| Product/ops UI surfaces | OPS-001…007 | 7 | 0 | 0 | 6 | 1 | SOPs and domain states exist with zero UI [P]/[D]; turnover reporting UI excluded |
| Explicit exclusions | EXCL-001…008 | 8 | 0 | 0 | 0 | 8 | Named capability exclusions (§25) |
| **7.E total** | | **67** | **2** | **44** | **12** | **9** | |

### 7.F Coverage verdict

- **Nothing in 7.C is reusable today.** Six components exist only as inline literals inside the one page; 124 of 130 component requirements are unimplemented.
- **Accessibility is the sharpest gap**: structure is genuinely good and machine-enforced (2 CURRENT items), but every interactive requirement (focus, keyboard, labels, target size) is REQUIRED and unimplemented — and one measurable defect already exists.
- **Governance and verification coverage is thin but well-founded**: constraints exist for *content*, none for *design*. GOV+TEST (28 items) are the layer that prevents the system drifting after it is built.
- **No coverage hole was found in the audit itself**: every subject encountered in the evidence base (§2.4) maps to at least one manifest item.

---

## 8. Brand and identity status

| Question | Answer | Evidence |
|---|---|---|
| Is there a logo? | **No** | repo survey: no `*.svg/*.png/*.ico` anywhere |
| What represents the brand today? | The literal text "Company OS" in `<strong>`, plus the `<title>` and meta description | `index.html:6-9`, `:16` |
| Favicon / app icons / og:image? | **None** | `index.html:2-10` (no icon/image links) |
| Brand colours? | Seven unroled hex literals, monochrome | `index.html:12` |
| Brand typeface? | Inter *named* but not loaded → renders `system-ui` | `index.html:12`; no font files (§5.1) |
| Brand voice documented? | **No** voice/tone file exists; but four voice *artefacts* are live and partly gate-pinned | `ETHOS.md`, `AGENTS.md` are policy, not brand voice |
| Name variants / naming rules? | **NOT ESTABLISHED** | no naming document found |

**Verdict:** identity is *accidental but honest* — the brand currently reads as plain engineering prose with no visual signature. BRAND-006…012 (REQUIRED) are the gap between that state and a designed identity; BRAND-013…015 (FUTURE) are the extensions deliberately deferred to §26 decisions.

## 9. Foundations status

| Foundation | Exists? | Where |
|---|---|---|
| Colour values | yes (7 literals) | `index.html:12` |
| Colour *roles/tokens* | no | — |
| Type scale | partial (h1 clamp only) | `index.html:12` |
| Spacing scale | no (literals: 48/24/20/16/18/12/10/8/72/64) | `index.html:12` |
| Container | yes (980px) | `index.html:12` |
| Grid | yes (auto-fit minmax(220px,1fr), gap 16) | `index.html:12` |
| Radius | yes (14px, 999px) | `index.html:12` |
| Borders | yes (1px `#ddd`/`#bbb`/`#111`) | `index.html:12` |
| Elevation/shadow | no | — |
| Breakpoints | no (`@media` count: 0) | grep-verified |
| Motion | no | — |
| Focus styles | none defined (browser default not overridden — a better-than-nothing baseline, but unstandardised) | grep `:focus` → 0 |
| z-index / layering | no | — |
| Density / dark / data-viz | no | — |

**Verdict:** the *geometry* of a system is half-visible (container, grid, radius, spacing values are coherent enough to extract into tokens); the *semantics* (colour roles, type roles, focus, motion, breakpoints) do not exist at all. FOUND-001…019 converts the former into tokens and introduces the latter; FOUND-020…023 stays FUTURE.

## 10. Components status

Complete component census of the shipped site:

| Pattern | Class/markup | States present | Reusable? |
|---|---|---|---|
| Top nav | `nav` flex, wordmark + badge | none (no links, no menu, no mobile form) | no (inline, single use) |
| Badge/pill | `.badge` | default only | no |
| Card | `.card` (h3 + p) | default only | no |
| Grid of cards | `.grid` | n/a | no |
| Step list | `.steps` (counter-reset) | n/a | no |
| Section heading | `h2` + margin rule | n/a | no |
| Footer | `footer` + border-top | n/a | no |

Everything else a product UI needs — buttons, links, inputs, forms, tables, overlays, feedback, loading, empty states — has **zero** presence (§5.3). Component architecture (§16) therefore specifies the target structure; §15 records which of those components are REQUIRED for first release (81) versus FUTURE depth (43).

## 11. Pages and templates status

- **Today:** one page with five sections (nav, hero, Services, How we work, Delivery standard, Case studies, footer — `index.html:16-46`).
- **Target:** 17 REQUIRED page/template rows (home, 4 service pages, about, process, 2 case-study pages, contact/intake, privacy, security, engineering standards, accessibility statement, 404, sitemap/robots, OG image template), 13 OUT_OF_SCOPE page rows (§25), 0 FUTURE page rows — page scope is fully decided either way.
- **Case-study honesty is a load-bearing invariant:** the site may state that no case studies exist; it may never show placeholder ones (`test_site_content.py:58-63`, gate live check, `sops/case-study/SKILL.md` BLOCK conditions).
- **Content contract for the contact page is known:** the intake SOP's six questions (`sops/intake/SKILL.md:29-38`) define required fields; the submission channel is NOT ESTABLISHED because Email §34 is BLOCKED (§27.H).

## 12. Governance, tooling, and Penpot status

| Question | Status | Evidence |
|---|---|---|
| Design system document exists? | **NOT FOUND** | `docs/` empty; no `DESIGN.md`/`tokens.*` in repo |
| Design decision records exist? | **NOT FOUND** | `decisions/` contains only `trust-tiers.md` |
| Token/format standard chosen? | **NOT ESTABLISHED** | — |
| Penpot workspace exists? | **No** | repo + branch survey; no export/import artefacts |
| Penpot contract text (§8.5) retrievable? | **No** — "genuinely not retrievable"; rows reserved, nothing invented | `PHASE8-CLOSURE-2026-10-06.md:155-174` |
| Identity contract text (§8.2) retrievable? | **No** — same treatment | same |
| Design tooling routes configured? | yes, skill routing only | `CLAUDE.md:9-10` |
| Owner of design decisions | founder (by `AGENTS.md` accountability) — no design-specific delegation recorded | `AGENTS.md` |

**Verdict:** governance does not exist as artefacts, but its *authority structure* does — founder approval, repository-as-source-of-truth, evidence bar. GOV-001…014 converts that structure into design-specific records. Penpot is treated by this audit as **REQUIRED-but-blocked-on-text** (PEN-001…006), never as contract-settled (§23, §27.A).

## 13. Dependency graph

Ordered left-to-right; an item may start only when its incoming dependencies are satisfied.

```
[S0] Recover §8.2/§8.5 contract text (27.A) ──┐
[S1] Owner decisions (§26: brand, type, colour, breakpoints,
     contact channel, multi-page, dark, motion, domain…) ──┤
                                                          ▼
[G] Governance foundation: GOV-001/002/007/012/013 (source of
    truth file, naming, format, ownership, dependency policy)
                                                          │
                    ┌─────────────────────────────────────┤
                    ▼                                     ▼
[F] Foundations tokens: FOUND-001…019 ────────► [V] Verification:
    (colour, type, space, radius, focus,          TEST-006 contrast,
     breakpoints — needs §26 breakpoint call)      TEST-012 token lint
                    │                                     │
                    ▼                                     │
[C] Core components: ACT, TXT, SEL, FRM, DAT, FBK,        │
    OVL, NAV, CON, SPC (needs F for tokens; needs        │
    PAGE-010 form contract for FRM/SEL)                   │
                    │                                     │
                    ▼                                     ▼
[P] Pages: BASE→multi-page split, PAGE-002…015,026,027 ──► [A] A11y
    (needs C; must keep §6.1 invariants green)             verification:
                    │                                       A11Y-014/015,
                    ▼                                       TEST-004/005/013
[B] Brand assets: BRAND-006…012 (logo, favicon, icons)
    (needs S1; feeds OG image PAGE-027 and nav)
                    │
                    ▼
[N] Penpot: PEN-001…006 (needs F+C as the content to model;
    §8.5 text from S0 gates the programme's tool commitment)
                    │
                    ▼
[U] Future product UI: OPS-001…006 (FUTURE — after website
    programme closes; depends on C, F, and §8.2 identity text)
```

Critical path: **S0/S1 → G → F → C → P → A**. Brand assets (B) and Penpot (N) are parallel once foundations exist. Nothing in FUTURE/OUT_OF_SCOPE sits on the critical path.


---

## 14. Manifest schema

§15 is the authoritative machine-readable requirement set. Everything else in this report summarises it.

### 14.1 Format

- YAML, one top-level key `items`, one mapping per item.
- Field order is fixed: `id`, `title`, `status`, `priority`, `basis`, `evidence`, `notes`.
- Fields beyond `id`/`title`/`status`/`priority` are omitted only where the §14.3 default applies unchanged.

### 14.2 Fields

| Field | Required | Values / rules |
|---|---|---|
| `id` | yes | `<FAMILY>-<NN>` (pages use `NNN`). Unique; never reused after deletion. |
| `title` | yes | noun phrase naming the artefact, decision, or requirement |
| `status` | yes | exactly one of `CURRENT`, `REQUIRED`, `FUTURE`, `OUT_OF_SCOPE` (§3.1) |
| `priority` | yes | `P0`–`P3` (§3.2) |
| `basis` | yes for non-CURRENT | `[S]`, `[D]`, `[P]`, `[E]`, `[K]`, or a WCAG criterion number where the requirement is a success criterion (§3.3) |
| `evidence` | yes for CURRENT | `path:line`, `path`, or `repo survey` |
| `notes` | when non-obvious | deferral reason, conflict flag (`§27.x`), owner-decision pointer (`§26.x`), or `NOT FOUND` / `NOT ESTABLISHED` |

### 14.3 Defaults block (applies to every item unless overridden inline)

```yaml
defaults:
  owner: founder
  penpot_target: "NOT YET CREATED"
  frontend_mapping: "NOT YET IMPLEMENTED"
  visual_baseline: "NOT YET CREATED"
```

- `owner` — the accountable approver for the item (`AGENTS.md`: founder remains accountable).
- `penpot_target` — the Penpot frame/component this item maps to; stays `NOT YET CREATED` until §23 runs.
- `frontend_mapping` — the shipped selector/component implementing it; `NOT YET IMPLEMENTED` until a frontend exists beyond the current inline page.
- `visual_baseline` — the snapshot/screenshot reference used for regression; `NOT YET CREATED` until TEST-003 runs.

### 14.4 ID families

| Family | Range | Count | Domain |
|---|---|---:|---|
| `BASE` | 001–005 | 5 | current site platform |
| `BRAND` | 001–015 | 15 | identity, palette/type direction, assets |
| `FOUND` | 001–024 | 24 | design foundations |
| `COMP-ACT` | 01–11 | 11 | actions |
| `COMP-TXT` | 01–09 | 9 | typography & text |
| `COMP-SEL` | 01–14 | 14 | selection controls |
| `COMP-FRM` | 01–14 | 14 | forms |
| `COMP-DAT` | 01–15 | 15 | data display |
| `COMP-FBK` | 01–13 | 13 | feedback |
| `COMP-OVL` | 01–09 | 9 | overlays |
| `COMP-NAV` | 01–12 | 12 | navigation |
| `COMP-CON` | 01–12 | 12 | containers & layout |
| `COMP-SYS` | 01–12 | 12 | system/production semantics |
| `COMP-SPC` | 01–09 | 9 | spacing primitives |
| `PAGE` | 001–030 | 30 | pages & templates |
| `RESP` | 001–011 | 11 | responsive behaviour |
| `A11Y` | 001–016 | 16 | accessibility |
| `GOV` | 001–014 | 14 | design governance |
| `TEST` | 001–014 | 14 | verification |
| `PEN` | 001–008 | 8 | Penpot tooling |
| `VOX` | 001–008 | 8 | voice & content patterns |
| `OPS` | 001–007 | 7 | product/ops UI surfaces |
| `EXCL` | 001–008 | 8 | explicit capability exclusions |
| **Total** | | **290** | |

### 14.5 Counting rule

The counts in §1 and §7 are derived mechanically from §15 (a grep of `status:`). If any manifest item is added, removed, or re-statused, §1 and §7 must be recomputed in the same edit. Divergence between §15 and the summary tables is a defect, not a style issue.

---

## 15. Complete proposed manifest

```yaml
defaults:
  owner: founder
  penpot_target: "NOT YET CREATED"
  frontend_mapping: "NOT YET IMPLEMENTED"
  visual_baseline: "NOT YET CREATED"

items:
  # ── BASE: current site platform (5) ──────────────────────────────
  - {id: BASE-001, title: "Single-page static site as the only surface", status: CURRENT, priority: P2, basis: "[S]", evidence: "business/site/index.html (50 lines)", notes: "No routing, no build step, no second page."}
  - {id: BASE-002, title: "Inline single-block stylesheet", status: CURRENT, priority: P2, basis: "[S]", evidence: "business/site/index.html:11-13", notes: "All styling lives in one <style> block; no external CSS file exists."}
  - {id: BASE-003, title: "Deploy-time inert analytics pattern (PostHog)", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/config.js; business/site/analytics.js", notes: "Guard-before-init is test- and gate-enforced (test_site_content.py:67-88)."}
  - {id: BASE-004, title: "Cloudflare Pages deploy, pages.dev endpoint only", status: CURRENT, priority: P1, basis: "[S]", evidence: "scripts/deploy-site.sh:13-23; gates-phase8.sh [website]", notes: "Four states build/attempted/verified/unavailable; custom-domain config is gate-forbidden (conflict §27.E)."}
  - {id: BASE-005, title: "Zero brand/media/font assets in repository", status: CURRENT, priority: P2, basis: "[S]", evidence: "repo survey (find for *.css/*.svg/*.png/*.ico/*.woff*/*.ttf → none)", notes: "Negative finding is reproducible; see §5.1."}

  # ── BRAND: identity (15) ─────────────────────────────────────────
  - {id: BRAND-001, title: "Logo (none exists)", status: CURRENT, priority: P1, basis: "[S]", evidence: "repo survey", notes: "Gap: REQUIRED counterpart is BRAND-009."}
  - {id: BRAND-002, title: "Wordmark as plain nav text", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:16", notes: "<strong>Company OS</strong> is the entire brand mark today."}
  - {id: BRAND-003, title: "Favicon / touch icons (absent)", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:2-10", notes: "No <link rel=icon>; no icon files."}
  - {id: BRAND-004, title: "Imagery and illustration (absent)", status: CURRENT, priority: P2, basis: "[S]", evidence: "repo survey; index.html is text-only", notes: "Defensible for an evidence-first brand; policy still required (BRAND-012)."}
  - {id: BRAND-005, title: "Icon set (absent)", status: CURRENT, priority: P2, basis: "[S]", evidence: "repo survey", notes: "No icon library, sprite, or inline SVGs."}
  - {id: BRAND-006, title: "Colour palette with named roles", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12 (7 unroled literals)", notes: "NOT ESTABLISHED: palette direction — owner decision §26.3."}
  - {id: BRAND-007, title: "Typography scale specification", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12 (h1 clamp only)", notes: "h2/h3/body are browser defaults today."}
  - {id: BRAND-008, title: "Font loading strategy (Inter named, never loaded)", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12; no font files in repo", notes: "Effective family is system-ui today. Owner decision §26.2 (self-host vs system stack)."}
  - {id: BRAND-009, title: "Logo and wordmark design", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap vs BRAND-001/002", notes: "Feeds nav, favicon (BRAND-010), OG image (PAGE-027)."}
  - {id: BRAND-010, title: "Favicon, apple-touch, and site icon set", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap vs BRAND-003", notes: "Must be checked against tests (no *.ico committed today is fine; adding files is additive)."}
  - {id: BRAND-011, title: "Iconography system (set, sizes, stroke, usage)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap vs BRAND-005", notes: "Vector icon set only; no raster icons."}
  - {id: BRAND-012, title: "Imagery / photography policy", status: REQUIRED, priority: P2, basis: "[K]", evidence: "sops/case-study/SKILL.md (future visuals)", notes: "Must state: no stock-photo fabrication, no client material without approval (AGENTS.md client isolation)."}
  - {id: BRAND-013, title: "Dark theme", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Deferred until palette roles (BRAND-006) exist; decision §26.4."}
  - {id: BRAND-014, title: "Density modes (comfortable / compact)", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Only matters once product UI (OPS) exists."}
  - {id: BRAND-015, title: "Motion language (durations, easing, reduced-motion rules)", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Nothing animates today; A11Y-007 constrains it when introduced."}

  # ── FOUND: foundations (24) ──────────────────────────────────────
  - {id: FOUND-001, title: "Colour tokens (primitive + semantic roles)", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12", notes: "Replaces 7 bare literals; naming per GOV-002."}
  - {id: FOUND-002, title: "Surface / border / text hierarchy tokens", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12", notes: "bg #fafafa, surface #fff, text #151515, borders #ddd/#bbb/#111 exist unroled."}
  - {id: FOUND-003, title: "Contrast targets (WCAG 2.2 AA: 4.5:1 text, 3:1 non-text)", status: REQUIRED, priority: P0, basis: "1.4.3 / 1.4.11", evidence: "gap; defect recorded A11Y-004", notes: "Must be enforced by TEST-006, not by review alone."}
  - {id: FOUND-004, title: "Font family tokens (body, mono)", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12", notes: "Paired with BRAND-008 loading strategy; mono needed by COMP-DAT-011."}
  - {id: FOUND-005, title: "Type scale (size/line-height/weight steps)", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap (h1 clamp only)", notes: "Fluid behaviour defined per-step, not only for h1."}
  - {id: FOUND-006, title: "Heading scale h1–h6", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap; h1 index.html:18, h2 index.html:12", notes: "Heading-skip invariant must keep passing (test_site_content.py:124-139)."}
  - {id: FOUND-007, title: "Body and prose styles (measure, rhythm, lists)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:12 (line-height 1.6 only)", notes: "Prose measure ≈65–75ch; max-width 800px exists only on h1."}
  - {id: FOUND-008, title: "Fluid type (clamp) behaviour", status: CURRENT, priority: P2, basis: "[S]", evidence: "index.html:12 (h1 clamp)", notes: "Extending clamp to the whole scale turns this into FOUND-005."}
  - {id: FOUND-009, title: "Spacing scale", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12 (literals 4/8/10/12/16/18/20/24/48/64/72)", notes: "Extract into a named scale; multiples of 4 with two optical exceptions."}
  - {id: FOUND-010, title: "Layout container (max 980px, gutter 24px)", status: CURRENT, priority: P1, basis: "[S]", evidence: "index.html:12", notes: "Gutters must become responsive (RESP-005)."}
  - {id: FOUND-011, title: "Grid system (auto-fit minmax(220px,1fr), gap 16px)", status: CURRENT, priority: P1, basis: "[S]", evidence: "index.html:12", notes: "Inherently responsive; no breakpoints needed for this rule."}
  - {id: FOUND-012, title: "Radius scale (14px card, 999px pill)", status: CURRENT, priority: P1, basis: "[S]", evidence: "index.html:12", notes: "Needs a full scale (sm/md/lg/pill), not two values."}
  - {id: FOUND-013, title: "Border tokens (1px #ddd / #bbb / #111)", status: CURRENT, priority: P1, basis: "[S]", evidence: "index.html:12", notes: "#bbb badge border fails 3:1 — replacement is REQUIRED (FOUND-003)."}
  - {id: FOUND-014, title: "Elevation / shadow tokens", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap (no shadows exist)", notes: "Needed for overlays (COMP-OVL) before they ship."}
  - {id: FOUND-015, title: "Breakpoint tokens", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap (@media count: 0)", notes: "NOT ESTABLISHED: values — owner decision §26.8; proposal in §18.2."}
  - {id: FOUND-016, title: "Motion duration / easing tokens", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "No animation exists; tokens land with first interactive states."}
  - {id: FOUND-017, title: "Focus-visible tokens and ring spec", status: REQUIRED, priority: P0, basis: "2.4.7 / 2.4.11", evidence: "gap (:focus count: 0)", notes: "UA default outline is currently not overridden — standardise it before adding interactive elements."}
  - {id: FOUND-018, title: "z-index / layering scale", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Required before overlays (COMP-OVL) exist."}
  - {id: FOUND-019, title: "Icon size tokens", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Paired with BRAND-011."}
  - {id: FOUND-020, title: "Density tokens", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Pairs with BRAND-014."}
  - {id: FOUND-021, title: "Dark palette", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Pairs with BRAND-013."}
  - {id: FOUND-022, title: "Selection and scrollbar styling", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Cosmetic; low leverage on a text-led site."}
  - {id: FOUND-023, title: "Data-visualisation colour sequence", status: FUTURE, priority: P3, basis: "[D]", evidence: "deferred", notes: "Only needed when OPS-007-style reporting UI is reconsidered."}
  - {id: FOUND-024, title: "Code / mono type tokens", status: REQUIRED, priority: P2, basis: "[K]", evidence: "PAGE-013 engineering standards content", notes: "Needed for inline code and evidence excerpts."}

  # ── COMP-ACT: actions (11) ───────────────────────────────────────
  - {id: COMP-ACT-01, title: "Button — primary", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap (no <button> exists)", notes: "First interactive element the site gains."}
  - {id: COMP-ACT-02, title: "Button — secondary", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: ""}
  - {id: COMP-ACT-03, title: "Button — ghost / tertiary", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Used for low-emphasis actions in nav and forms."}
  - {id: COMP-ACT-04, title: "Button — danger / destructive", status: REQUIRED, priority: P2, basis: "[D]", evidence: "gap; destructive domain transitions exist (domain.py _TRANSITIONS)", notes: "Product UI (OPS) needs it; website uses it rarely."}
  - {id: COMP-ACT-05, title: "Button size scale (sm / md / lg)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Sizes must satisfy A11Y-011 target sizes at the smallest step."}
  - {id: COMP-ACT-06, title: "Icon button (icon-only, labelled)", status: REQUIRED, priority: P2, basis: "4.1.2", evidence: "gap", notes: "Requires accessible name — never icon-only without aria-label."}
  - {id: COMP-ACT-07, title: "Button loading / pending state", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Paired with FRM-012 submitting state."}
  - {id: COMP-ACT-08, title: "Button group", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: ""}
  - {id: COMP-ACT-09, title: "Split / menu button", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Only if product navigation needs it."}
  - {id: COMP-ACT-10, title: "Inline link", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap (zero <a> tags today)", notes: "Must define visited/hover/focus states; first focusable content on the site."}
  - {id: COMP-ACT-11, title: "Standalone / arrow link (CTA)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "CTA target for PAGE-002…010; submission path per §26.9."}

  # ── COMP-TXT: typography & text (9) ──────────────────────────────
  - {id: COMP-TXT-01, title: "Paragraph / prose block", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:19 (inline <p> only)", notes: "Prose rules from FOUND-007."}
  - {id: COMP-TXT-02, title: "Heading components (h1–h6 styling contract)", status: REQUIRED, priority: P0, basis: "[S]", evidence: "index.html:12,18,21,28,38,41", notes: "Heading-skip and single-h1 invariants must keep passing."}
  - {id: COMP-TXT-03, title: "Eyebrow / overline label", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Section labels replace bare h2 usage on inner pages."}
  - {id: COMP-TXT-04, title: "Lead / intro paragraph", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:19 (hero lede)", notes: "Hero lede is gate-adjacent copy (§27.C) — treat as governed."}
  - {id: COMP-TXT-05, title: "Caption / small text", status: REQUIRED, priority: P2, basis: "[S]", evidence: "index.html:12 (footer .9rem, badge .85rem)", notes: "Minimum size floor: 14px (legibility)."}
  - {id: COMP-TXT-06, title: "Blockquote / pull quote", status: FUTURE, priority: P3, basis: "[K]", evidence: "deferred", notes: "Possible future case-study element."}
  - {id: COMP-TXT-07, title: "Definition list pattern", status: FUTURE, priority: P3, basis: "[D]", evidence: "deferred", notes: "Useful for state/enum documentation pages."}
  - {id: COMP-TXT-08, title: "Mark / highlight", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: ""}
  - {id: COMP-TXT-09, title: "Text utilities (truncate, measure, align)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap (max-width: 800px exists as a one-off on h1)", notes: "Replace the h1-specific rule with a reusable measure utility."}

  # ── COMP-SEL: selection controls (14) ────────────────────────────
  - {id: COMP-SEL-01, title: "Text input", status: REQUIRED, priority: P0, basis: "[P]", evidence: "gap; intake questions 1–6 need free text (sops/intake/SKILL.md:29-38)", notes: "States: default, hover, focus, filled, error, disabled."}
  - {id: COMP-SEL-02, title: "Textarea", status: REQUIRED, priority: P0, basis: "[P]", evidence: "gap; 'What breaks today?' / 'What have you already tried?' need room", notes: "Auto-grow optional; resize handle allowed."}
  - {id: COMP-SEL-03, title: "Select / dropdown", status: REQUIRED, priority: P0, basis: "[P]", evidence: "gap; budget range and deadline choices", notes: "Prefer native <select> until combobox need is proven."}
  - {id: COMP-SEL-04, title: "Checkbox", status: REQUIRED, priority: P0, basis: "[P]", evidence: "gap; consent/approval confirmations", notes: "Used for 'who else must approve' multi-select."}
  - {id: COMP-SEL-05, title: "Radio", status: REQUIRED, priority: P1, basis: "[P]", evidence: "gap; single-choice dispositions", notes: "Maps to IntakeDisposition GO / NO-GO / NEEDS INFORMATION (domain.py:14-17)."}
  - {id: COMP-SEL-06, title: "Radio group / segmented control", status: REQUIRED, priority: P1, basis: "[D]", evidence: "gap; ScopeDecision IN SCOPE / CHANGE ORDER / OUT OF SCOPE (domain.py:20-23)", notes: "Product UI first; website reuse likely on intake form."}
  - {id: COMP-SEL-07, title: "Toggle / switch", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Consent-style settings only; no settings UI exists yet."}
  - {id: COMP-SEL-08, title: "Range slider", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Budget range could eventually use it; not first release."}
  - {id: COMP-SEL-09, title: "Date picker", status: FUTURE, priority: P3, basis: "[P]", evidence: "intake question 5 asks for a deadline date", notes: "Native <input type=date> first; custom picker only if proven insufficient."}
  - {id: COMP-SEL-10, title: "File upload", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Needs a storage/classification story (AGENTS.md RESTRICTED rules) before any use."}
  - {id: COMP-SEL-11, title: "Search input", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "No content volume to search yet."}
  - {id: COMP-SEL-12, title: "Combobox / autocomplete", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Complex ARIA; defer until native select fails."}
  - {id: COMP-SEL-13, title: "Input with prefix / suffix adornment", status: REQUIRED, priority: P2, basis: "[P]", evidence: "gap; budget currency and date affordances", notes: "Adornment must not reduce the accessible name."}
  - {id: COMP-SEL-14, title: "Field hint / help text", status: REQUIRED, priority: P0, basis: "3.3.2", evidence: "gap", notes: "Every intake field needs an example or clarification (SOP: preserve meaning, separate facts from assumptions)."}

  # ── COMP-FRM: forms (14) ─────────────────────────────────────────
  - {id: COMP-FRM-01, title: "Form layout / vertical stack", status: REQUIRED, priority: P0, basis: "[P]", evidence: "gap", notes: "One column on mobile; labels above fields."}
  - {id: COMP-FRM-02, title: "Label + required / optional marker", status: REQUIRED, priority: P0, basis: "3.3.2", evidence: "gap", notes: "Required state must be programmatically set (aria-required), not symbol-only."}
  - {id: COMP-FRM-03, title: "Validation message (error / success / hint)", status: REQUIRED, priority: P0, basis: "3.3.1", evidence: "gap", notes: "Text + icon + role=status; colour never the only cue (A11Y-013)."}
  - {id: COMP-FRM-04, title: "Fieldset / legend grouping", status: REQUIRED, priority: P1, basis: "1.3.1", evidence: "gap", notes: "Groups the six intake questions into logical sections."}
  - {id: COMP-FRM-05, title: "Form actions row (submit / cancel)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Submit label states the outcome ('Send request'), never 'Submit' alone."}
  - {id: COMP-FRM-06, title: "Multi-step form", status: FUTURE, priority: P3, basis: "[P]", evidence: "deferred", notes: "Six questions fit one page; split only if completion data justifies it."}
  - {id: COMP-FRM-07, title: "Inline validation behaviour (when to validate)", status: REQUIRED, priority: P1, basis: "3.3.1", evidence: "gap", notes: "Validate on blur/submit, never on first keystroke."}
  - {id: COMP-FRM-08, title: "Error summary banner (focusable)", status: REQUIRED, priority: P1, basis: "3.3.1", evidence: "gap", notes: "Appears on failed submit; receives focus; links to fields."}
  - {id: COMP-FRM-09, title: "Character counter", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Only if a field gains a length limit."}
  - {id: COMP-FRM-10, title: "Dependent field reveal", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "e.g. 'other approver' name field."}
  - {id: COMP-FRM-11, title: "Disabled / read-only form state", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Distinct visuals for disabled vs read-only; contrast exemptions documented."}
  - {id: COMP-FRM-12, title: "Submitting / pending state", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Disables double submit; announces progress."}
  - {id: COMP-FRM-13, title: "Success confirmation panel", status: REQUIRED, priority: P1, basis: "[E]", evidence: "gap; email §34 BLOCKED so confirmation cannot promise a reply channel that does not exist", notes: "Copy must state what actually happens next — NOT ESTABLISHED until §26.9."}
  - {id: COMP-FRM-14, title: "Honeypot / anti-spam field", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "No CAPTCHA dependency; hidden field only, must not break keyboard flow."}

  # ── COMP-DAT: data display (15) ──────────────────────────────────
  - {id: COMP-DAT-01, title: "Stat / metric card", status: REQUIRED, priority: P2, basis: "[K]", evidence: "gap", notes: "For verified case-study outcomes only — never for invented numbers (AGENTS.md)."}
  - {id: COMP-DAT-02, title: "Definition table", status: REQUIRED, priority: P2, basis: "[D]", evidence: "gap", notes: "Documents domain enums and states."}
  - {id: COMP-DAT-03, title: "Sortable data table", status: FUTURE, priority: P3, basis: "[D]", evidence: "deferred", notes: "Product dashboards first (OPS)."}
  - {id: COMP-DAT-04, title: "Pagination", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "No list exceeds one page today."}
  - {id: COMP-DAT-05, title: "Tag / chip", status: REQUIRED, priority: P1, basis: "[D]", evidence: "gap", notes: "Labels scope decisions, client states."}
  - {id: COMP-DAT-06, title: "Status badge / pill", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:16 (.badge)", notes: "Exists but border #bbb fails 3:1 — rebuild under FOUND-003."}
  - {id: COMP-DAT-07, title: "Avatar", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "No identity UI until §8.2 text is recovered (§27.A)."}
  - {id: COMP-DAT-08, title: "Progress bar", status: FUTURE, priority: P3, basis: "[D]", evidence: "deferred", notes: "Delivery progress display for product UI."}
  - {id: COMP-DAT-09, title: "Timeline", status: FUTURE, priority: P2, basis: "[D]", evidence: "domain.py lifecycle states PROSPECT…CLOSED", notes: "Client lifecycle visualisation in product UI."}
  - {id: COMP-DAT-10, title: "Checklist", status: REQUIRED, priority: P2, basis: "[P]", evidence: "sops (weekly-close, incident) are checklist-shaped", notes: "Also used by design QA checklist (GOV-014)."}
  - {id: COMP-DAT-11, title: "Code block and inline code", status: REQUIRED, priority: P2, basis: "[K]", evidence: "PAGE-013 engineering standards; gate output excerpts", notes: "Needs FOUND-024 mono tokens."}
  - {id: COMP-DAT-12, title: "Divider", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap (footer border-top is the only rule today)", notes: "Uses border tokens; must not be the sole section separator on mobile."}
  - {id: COMP-DAT-13, title: "Key-value row", status: REQUIRED, priority: P1, basis: "[P]", evidence: "gap", notes: "Evidence records, invoice metadata, timestamps."}
  - {id: COMP-DAT-14, title: "Empty state", status: REQUIRED, priority: P1, basis: "[S]", evidence: "pattern already exists in prose: 'None published yet'", notes: "The honesty pattern becomes a reusable component."}
  - {id: COMP-DAT-15, title: "File / attachment row", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Blocked by classification rules for uploads (COMP-SEL-10)."}

  # ── COMP-FBK: feedback (13) ──────────────────────────────────────
  - {id: COMP-FBK-01, title: "Alert — info", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: ""}
  - {id: COMP-FBK-02, title: "Alert — success", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Pairs with FRM-13."}
  - {id: COMP-FBK-03, title: "Alert — warning", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: ""}
  - {id: COMP-FBK-04, title: "Alert — error", status: REQUIRED, priority: P1, basis: "3.3.1", evidence: "gap", notes: "Icon + text + role=alert; colour not the only cue."}
  - {id: COMP-FBK-05, title: "Toast / transient notification", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Accessibility cost is high; prefer persistent alerts first."}
  - {id: COMP-FBK-06, title: "Page-level banner", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Reserved for service notices; never auto-dismiss."}
  - {id: COMP-FBK-07, title: "Skeleton loader", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Static site has nothing to load yet."}
  - {id: COMP-FBK-08, title: "Spinner / busy indicator", status: REQUIRED, priority: P1, basis: "4.1.3", evidence: "gap", notes: "Paired with FRM-012; reduced-motion safe (A11Y-007)."}
  - {id: COMP-FBK-09, title: "No-results / empty query state", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Needed when search (COMP-SEL-11) or filters arrive."}
  - {id: COMP-FBK-10, title: "Form progress stepper", status: FUTURE, priority: P3, basis: "[P]", evidence: "deferred", notes: "Only if COMP-FRM-06 ships."}
  - {id: COMP-FBK-11, title: "Inline status dot", status: REQUIRED, priority: P2, basis: "[D]", evidence: "gap", notes: "Always accompanied by a text label."}
  - {id: COMP-FBK-12, title: "Dismissible message", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Dismissal must be keyboard-reachable when introduced."}
  - {id: COMP-FBK-13, title: "Evidence status chips (PASS / BLOCKED / FAIL / SKIP)", status: REQUIRED, priority: P2, basis: "[P]", evidence: "gates-phase8.sh statuses; PHASE8-CLOSURE status vocabulary", notes: "Internal reporting UI vocabulary; public site must not expose internal gate states."}

  # ── COMP-OVL: overlays (9) ───────────────────────────────────────
  - {id: COMP-OVL-01, title: "Modal / dialog", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Focus trap, Esc, restore focus, aria-modal (see OVL-08)."}
  - {id: COMP-OVL-02, title: "Confirmation dialog (destructive actions)", status: REQUIRED, priority: P1, basis: "[D]", evidence: "domain transitions are irreversible-ish (e.g. VOID, TERMINATED)", notes: "Destructive confirmations must name the object and the consequence."}
  - {id: COMP-OVL-03, title: "Drawer / side panel", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: ""}
  - {id: COMP-OVL-04, title: "Popover", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Defers until a real info-density need appears."}
  - {id: COMP-OVL-05, title: "Dropdown menu", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Needed for multi-page nav overflow / footer link groups."}
  - {id: COMP-OVL-06, title: "Tooltip", status: REQUIRED, priority: P2, basis: "1.4.13", evidence: "gap", notes: "Must be hover- AND focus-triggered, dismissible, persistent."}
  - {id: COMP-OVL-07, title: "Full-screen sheet (mobile)", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Mobile nav (NAV-05) may need a simple version first."}
  - {id: COMP-OVL-08, title: "Overlay behaviour contract (focus trap, Esc, scroll lock, focus restore)", status: REQUIRED, priority: P0, basis: "2.4.3 / 2.1.2", evidence: "gap", notes: "Written contract applies to every overlay; verified by TEST-005."}
  - {id: COMP-OVL-09, title: "Bottom sheet", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: ""}

  # ── COMP-NAV: navigation (12) ────────────────────────────────────
  - {id: COMP-NAV-01, title: "Top navigation bar", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:16", notes: "Exists as wordmark + badge with NO links; redesign adds real navigation."}
  - {id: COMP-NAV-02, title: "Breadcrumb", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Site depth is 2 levels; revisit if it grows."}
  - {id: COMP-NAV-03, title: "Tabs", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "For service-page content switching; ARIA tabs pattern required."}
  - {id: COMP-NAV-04, title: "In-page anchor navigation (section links)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Replaces 'jump to section' affordances as pages lengthen."}
  - {id: COMP-NAV-05, title: "Mobile navigation (collapse / menu)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; nav is flex with no breakpoint behaviour", notes: "Simple disclosure first; no drawer until OVL-07 exists."}
  - {id: COMP-NAV-06, title: "Skip-to-content link", status: REQUIRED, priority: P0, basis: "2.4.1", evidence: "gap (no links exist so none needed yet — becomes P0 the moment nav gains links)", notes: "Must be first focusable element; visible on focus."}
  - {id: COMP-NAV-07, title: "Pagination navigation (page-level)", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Component D04 pagination is separate."}
  - {id: COMP-NAV-08, title: "Sidebar navigation", status: FUTURE, priority: P3, basis: "[D]", evidence: "deferred", notes: "Candidate for internal workspace UIs (OPS)."}
  - {id: COMP-NAV-09, title: "Footer link groups", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:44-46 footer has no links today", notes: "Footer must link to privacy/security/accessibility/contact once those pages exist."}
  - {id: COMP-NAV-10, title: "Section jump list (on-page)", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Overlaps NAV-04; keep one, not both, if only one is needed."}
  - {id: COMP-NAV-11, title: "Back / wayfinder link", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: ""}
  - {id: COMP-NAV-12, title: "Active navigation state indicator", status: REQUIRED, priority: P1, basis: "1.4.1", evidence: "gap", notes: "Active state must be conveyed by more than colour (underline or weight too)."}

  # ── COMP-CON: containers & layout (12) ───────────────────────────
  - {id: COMP-CON-01, title: "Card", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:12 (.card)", notes: "Border 1px #ddd, radius 14px, padding 20px, surface #fff — extract to tokens."}
  - {id: COMP-CON-02, title: "Section wrapper with heading group", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:21,28,38,41 (bare h2 sections)", notes: "Standardises h2 + lede + spacing (currently h2 margin-top: 64px)."}
  - {id: COMP-CON-03, title: "Page hero / header block", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:18-19", notes: "Hero copy is gate-pinned (§27.C); layout is free, copy is not."}
  - {id: COMP-CON-04, title: "Footer container", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:44-46", notes: "margin-top 72px, border-top, .9rem — will gain link groups (NAV-09)."}
  - {id: COMP-CON-05, title: "Process step list (numbered)", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html:29-36 (.steps)", notes: "Six-step intake→invoice process; counter-reset pattern with 2px rule."}
  - {id: COMP-CON-06, title: "Panel / inset surface", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "For callouts inside prose (e.g. honesty notes)."}
  - {id: COMP-CON-07, title: "Page shell (nav / main / footer landmarks)", status: REQUIRED, priority: P0, basis: "1.3.1", evidence: "index.html:15-49; enforced by test_site_content.py:140-144", notes: "Shell is the invariant that every page template must instantiate."}
  - {id: COMP-CON-08, title: "Two-column content layout", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Single-column reading order is the current and default model."}
  - {id: COMP-CON-09, title: "Sidebar layout", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Pairs with NAV-08."}
  - {id: COMP-CON-10, title: "Full-bleed band", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Would break the 980px container; use sparingly if at all."}
  - {id: COMP-CON-11, title: "Figure / caption", status: FUTURE, priority: P3, basis: "[K]", evidence: "deferred", notes: "Arrives with imagery (BRAND-012)."}
  - {id: COMP-CON-12, title: "Well / nested container spacing", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Prevents double-margin bugs when containers nest."}

  # ── COMP-SYS: system & production semantics (12) ─────────────────
  - {id: COMP-SYS-01, title: "Data classification label (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "AGENTS.md Data Classification", notes: "Renders only in internal UIs; public site never shows client classifications."}
  - {id: COMP-SYS-02, title: "State label (generic, vocabulary supplied by caller)", status: REQUIRED, priority: P1, basis: "[D]", evidence: "domain.py enums (ClientStatus, DeliveryStatus, …)", notes: "One component, many vocabularies; never hardcode state names in markup."}
  - {id: COMP-SYS-03, title: "Evidence badge (verified / unverified / proposed)", status: REQUIRED, priority: P1, basis: "[P]", evidence: "EvidenceStatus PROPOSED/RECORDED/VERIFIED/DISPUTED (domain.py:90-95)", notes: "Directly encodes the AGENTS.md evidence bar."}
  - {id: COMP-SYS-04, title: "Scope status chip (IN SCOPE / CHANGE ORDER / OUT OF SCOPE)", status: REQUIRED, priority: P1, basis: "[D]", evidence: "ScopeDecision (domain.py:20-23)", notes: "Core visual for scope-conversation UIs."}
  - {id: COMP-SYS-05, title: "Approval state indicator (REQUIRED / APPROVED / DECLINED)", status: REQUIRED, priority: P1, basis: "[D]", evidence: "ApprovalState (domain.py:26-35)", notes: "Must never visually imply PROPOSED == approved (domain docstring warning)."}
  - {id: COMP-SYS-06, title: "Pass / fail / blocked / skipped indicator", status: REQUIRED, priority: P2, basis: "[P]", evidence: "gates-phase8.sh do_pass/do_fail/do_blocked vocabulary", notes: "Colour + icon + text; BLOCKED must be visually distinct from FAIL."}
  - {id: COMP-SYS-07, title: "Version / release stamp", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Footer could carry a build stamp later."}
  - {id: COMP-SYS-08, title: "Audit trail / activity feed", status: FUTURE, priority: P3, basis: "[D]", evidence: "domain transitions are auditable by design", notes: "Product UI (OPS) scope."}
  - {id: COMP-SYS-09, title: "Timestamp with timezone", status: REQUIRED, priority: P1, basis: "[P]", evidence: "evidence files use UTC stamps throughout evidence/runs/", notes: "Always render timezone; never ambiguous local-only times."}
  - {id: COMP-SYS-10, title: "Money / amount display", status: FUTURE, priority: P3, basis: "[D]", evidence: "InvoiceStatus/PaymentStatus, FinancialAmountState (domain.py:72-104)", notes: "Empty is not zero — UNKNOWN/NOT_RECORDED must render distinctly."}
  - {id: COMP-SYS-11, title: "Redaction / secret placeholder", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gates: 'key values never printed'; AGENTS.md no-secrets rule", notes: "Any UI surfaceing config must render •••• by construction."}
  - {id: COMP-SYS-12, title: "Print styles", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Overlaps RESP-009 — implement once, reference from both."}

  # ── COMP-SPC: spacing primitives (9) ─────────────────────────────
  - {id: COMP-SPC-01, title: "Spacing scale utilities", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap (literals scattered in index.html:12)", notes: "Single source = FOUND-009; utilities reference tokens only."}
  - {id: COMP-SPC-02, title: "Stack (vertical rhythm with gap)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap (margin-based today)", notes: "Replaces margin-collapsing hacks."}
  - {id: COMP-SPC-03, title: "Cluster (horizontal wrap group)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:12 nav uses raw flex", notes: "Nav, badges, and action rows all become clusters."}
  - {id: COMP-SPC-04, title: "Inline gap", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "For icon+label pairs."}
  - {id: COMP-SPC-05, title: "Aspect-ratio box", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Image layouts only."}
  - {id: COMP-SPC-06, title: "Container queries", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Adopt when components are embedded in varying-width parents."}
  - {id: COMP-SPC-07, title: "Wrap utilities", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "For badge/cluster rows."}
  - {id: COMP-SPC-08, title: "Centering utilities", status: REQUIRED, priority: P2, basis: "[S]", evidence: "index.html:12 (margin: 0 auto on body)", notes: "Tokenise the existing centring pattern."}
  - {id: COMP-SPC-09, title: "Overflow scroll container", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Paired with RESP-007 table overflow."}

  # ── PAGE: pages & templates (30) ─────────────────────────────────
  - {id: PAGE-001, title: "Home page", status: CURRENT, priority: P1, basis: "[S]", evidence: "business/site/index.html", notes: "Content is gate-pinned (title, hero, honesty line) — redesign must preserve or change the gate first (§27.C)."}
  - {id: PAGE-002, title: "Services index", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap (services are three cards on home, index.html:21-26)", notes: "Entry point to the three service details."}
  - {id: PAGE-003, title: "Service detail — Finance integrations", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:23 card copy", notes: "Scope, deliverables, boundaries, outcomes — content owner-supplied; no invented capabilities."}
  - {id: PAGE-004, title: "Service detail — Reconciliation", status: REQUIRED, priority: P2, basis: "[S]", evidence: "index.html:24 card copy", notes: "Content contract as PAGE-003."}
  - {id: PAGE-005, title: "Service detail — Performance builds", status: REQUIRED, priority: P2, basis: "[S]", evidence: "index.html:25 card copy", notes: "Content contract as PAGE-003."}
  - {id: PAGE-006, title: "About page", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; ETHOS.md supplies truthful source material", notes: "Ethos-derived, not marketing-invented."}
  - {id: PAGE-007, title: "Process / How we work page", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:29-36 six-step block", notes: "Extracting the step list to its own page keeps home leaner; component CON-05 carries the visuals."}
  - {id: PAGE-008, title: "Case studies index", status: REQUIRED, priority: P1, basis: "[K]", evidence: "index.html:41-42; sops/case-study/SKILL.md", notes: "Must render the honest empty state (COMP-DAT-14) until a study is approved."}
  - {id: PAGE-009, title: "Case study detail template", status: REQUIRED, priority: P1, basis: "[K]", evidence: "sops/case-study/SKILL.md (authoritative inputs, BLOCK conditions)", notes: "Publishable only with recorded evidence + client approval; metrics verified, never invented."}
  - {id: PAGE-010, title: "Contact / intake page with form", status: REQUIRED, priority: P1, basis: "[P]", evidence: "sops/intake/SKILL.md:29-38 (six required questions)", notes: "Submission path NOT ESTABLISHED — Email §34 BLOCKED; mailto: test-forbidden. Owner decision §26.9."}
  - {id: PAGE-011, title: "Privacy & analytics disclosure page", status: REQUIRED, priority: P1, basis: "[S]", evidence: "PostHog deployed (BASE-003); gates verify live config", notes: "Must state what is collected, that session recording is config-controlled, and how to opt out."}
  - {id: PAGE-012, title: "Security & data-handling page", status: REQUIRED, priority: P2, basis: "[S]", evidence: "ETHOS.md §6; AGENTS.md classification rules", notes: "States handling commitments without exposing client specifics (client isolation rule)."}
  - {id: PAGE-013, title: "Engineering standards page", status: REQUIRED, priority: P2, basis: "[S]", evidence: "index.html:38-39 delivery standard; AGENTS.md evidence rules", notes: "Turns the four-sentence standard into a durable, linkable statement."}
  - {id: PAGE-014, title: "Accessibility statement", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; conformance target A11Y-001", notes: "States target, known gaps, and contact route — honest, not aspirational."}
  - {id: PAGE-015, title: "404 / not-found page", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap (no routing exists today)", notes: "Required the moment a second page exists; must include nav back to home."}
  - {id: PAGE-016, title: "Blog", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no editorial pipeline, no CMS, no authoring workflow exists", notes: "Excluded §25.1; reconsider only with a publishing cadence and owner commitment."}
  - {id: PAGE-017, title: "Terms & conditions", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no legal text or counsel review established", notes: "Excluded §25.2; legal copy must not be agent-invented."}
  - {id: PAGE-018, title: "Cookie / analytics consent banner", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no consent decision or jurisdiction analysis on record", notes: "Excluded §25.3 pending owner decision §26.11 — flag: analytics is already live, so this exclusion carries legal risk until decided."}
  - {id: PAGE-019, title: "Maintenance / downtime page", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "static Pages deployment has no maintenance mode", notes: "Excluded §25.4."}
  - {id: PAGE-020, title: "Careers page", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no hiring activity or roles on record", notes: "Excluded §25.5."}
  - {id: PAGE-021, title: "Press / newsroom", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no press activity on record", notes: "Excluded §25.6."}
  - {id: PAGE-022, title: "Newsletter signup", status: OUT_OF_SCOPE, priority: P3, basis: "[E]", evidence: "no email sending capability (§34 BLOCKED)", notes: "Excluded §25.7 — cannot function without email."}
  - {id: PAGE-023, title: "Legal imprint", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no registered-entity details established for publication", notes: "Excluded §25.8."}
  - {id: PAGE-024, title: "Pricing page", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "commercial terms are per-engagement (proposal SOP); no published price sheet exists", notes: "Excluded §25.9 — publishing prices would contradict the proposal-based model."}
  - {id: PAGE-025, title: "Testimonials page", status: OUT_OF_SCOPE, priority: P3, basis: "[K]", evidence: "no approved testimonials exist; fabrication forbidden (AGENTS.md)", notes: "Excluded §25.10."}
  - {id: PAGE-026, title: "Sitemap and robots.txt", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap; multi-page launch makes crawl surface non-trivial", notes: "Generated or hand-maintained; must list every published page."}
  - {id: PAGE-027, title: "OG / social share image template", status: REQUIRED, priority: P1, basis: "[S]", evidence: "og:title/description exist (index.html:8-10); og:image absent", notes: "Uses logo (BRAND-009); template, not a one-off export."}
  - {id: PAGE-028, title: "Multi-language selector / localized pages", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "site is English-only; no translation workflow", notes: "Excluded §25.11."}
  - {id: PAGE-029, title: "Client portal / login page", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no product UI in scope; Identity §8.2 text unretrievable (§27.A)", notes: "Excluded §25.12 — must stay excluded until §8.2 is recovered."}
  - {id: PAGE-030, title: "Public status page", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no hosted public service to report availability for", notes: "Excluded §25.13."}

  # ── RESP: responsive behaviour (11) ──────────────────────────────
  - {id: RESP-001, title: "Breakpoint system (mobile-first)", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap (@media count: 0)", notes: "Values NOT ESTABLISHED — owner decision §26.8; proposal §18.2."}
  - {id: RESP-002, title: "Fluid grid behaviour", status: CURRENT, priority: P2, basis: "[S]", evidence: "index.html:12 (auto-fit minmax)", notes: "Already reflows without breakpoints."}
  - {id: RESP-003, title: "Fluid type behaviour (clamp)", status: CURRENT, priority: P2, basis: "[S]", evidence: "index.html:12 (h1 clamp)", notes: "Pattern exists for h1; extend via FOUND-005."}
  - {id: RESP-004, title: "Navigation collapse behaviour", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; nav has no breakpoint logic", notes: "Depends on NAV-05; disclosure pattern, not a drawer, first."}
  - {id: RESP-005, title: "Container width and gutter behaviour per breakpoint", status: REQUIRED, priority: P1, basis: "[S]", evidence: "index.html:12 (fixed 24px gutter)", notes: "Gutters step up at larger widths; never below 16px."}
  - {id: RESP-006, title: "Touch target sizing (≥44×44 CSS px recommended; ≥24px WCAG 2.5.8 floor)", status: REQUIRED, priority: P1, basis: "2.5.8", evidence: "gap (no interactive elements exist yet)", notes: "Must hold at the smallest breakpoint."}
  - {id: RESP-007, title: "Table / wide-content overflow handling", status: REQUIRED, priority: P2, basis: "1.4.10", evidence: "gap", notes: "Horizontal scroll containers must be keyboard-scrollable and labelled."}
  - {id: RESP-008, title: "Media sizing rules (max-width 100%, aspect preservation)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap (no media exists)", notes: "Rule lands before imagery does (BRAND-012)."}
  - {id: RESP-009, title: "Print layout", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Implement once, referenced by SYS-12."}
  - {id: RESP-010, title: "Wide-screen behaviour (>1440px)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "index.html:12 (980px cap already constrains growth)", notes: "Cap holds; only vertical rhythm and type scale change."}
  - {id: RESP-011, title: "Reflow at 320px / 400% zoom without two-dimensional scrolling", status: REQUIRED, priority: P0, basis: "1.4.10", evidence: "currently satisfied by accident (no fixed widths except 800px max on h1)", notes: "Must remain true after redesign; covered by TEST-009."}

  # ── A11Y: accessibility (16) ─────────────────────────────────────
  - {id: A11Y-001, title: "WCAG 2.2 Level AA conformance target", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap (no accessibility document exists)", notes: "Declared in PAGE-014; measured by TEST-004/006/013."}
  - {id: A11Y-002, title: "Keyboard operability for all interactive components", status: REQUIRED, priority: P0, basis: "2.1.1", evidence: "gap (zero interactive elements today)", notes: "Verified by TEST-005 before any interactive component ships."}
  - {id: A11Y-003, title: "Focus visibility and focus order policy", status: REQUIRED, priority: P0, basis: "2.4.7 / 2.4.3", evidence: "gap (:focus count: 0)", notes: "Backed by FOUND-017 tokens."}
  - {id: A11Y-004, title: "Contrast remediation of existing badge border (#bbb ≈1.9:1)", status: REQUIRED, priority: P0, basis: "1.4.11", evidence: "index.html:12 (measured, §5.2)", notes: "Known live defect; fixed by FOUND-003/FOUND-013 replacement."}
  - {id: A11Y-005, title: "Landmark and heading structure", status: CURRENT, priority: P0, basis: "1.3.1 / 2.4.6", evidence: "test_site_content.py:120-144", notes: "Already enforced — must not regress during redesign."}
  - {id: A11Y-006, title: "Form label and error association (programmatic)", status: REQUIRED, priority: P0, basis: "3.3.2 / 3.3.1", evidence: "gap (no forms exist)", notes: "Blocks PAGE-010; verified in TEST-004."}
  - {id: A11Y-007, title: "Reduced-motion support (prefers-reduced-motion)", status: REQUIRED, priority: P1, basis: "2.3.3", evidence: "gap (nothing animates)", notes: "Must exist before the first transition ships (BRAND-015)."}
  - {id: A11Y-008, title: "Alternative text policy for imagery", status: REQUIRED, priority: P1, basis: "1.1.1", evidence: "gap (no imagery)", notes: "Policy first: decorative vs informative; no alt-text invention for unseen images."}
  - {id: A11Y-009, title: "Document language declaration", status: CURRENT, priority: P1, basis: "3.1.1", evidence: "index.html:15; test_site_content.py:116-118", notes: "Enforced by test."}
  - {id: A11Y-010, title: "Zoom to 200% without loss of content or function", status: REQUIRED, priority: P1, basis: "1.4.4", evidence: "satisfied today by rem-like layout; untested", notes: "Added to TEST-009 matrix."}
  - {id: A11Y-011, title: "Consistent navigation and help placement", status: REQUIRED, priority: P1, basis: "3.2.3 / 3.2.6", evidence: "single page today, so trivially consistent — multi-page raises the bar", notes: "Shell (CON-07) guarantees consistency across templates."}
  - {id: A11Y-012, title: "Error prevention for reversible/legal-financial actions", status: REQUIRED, priority: P1, basis: "3.3.4", evidence: "[D] invoice/approval domain actions", notes: "Confirmation dialog (OVL-02) before any irreversible action."}
  - {id: A11Y-013, title: "Colour is never the only information carrier", status: REQUIRED, priority: P0, basis: "1.4.1", evidence: "gap (no colour-coded states yet)", notes: "Applies to FBK, SYS, NAV-12 active states; enforced by TEST-006 review."}
  - {id: A11Y-014, title: "Automated accessibility scanning (axe-core) in CI", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap (no a11y tooling in tests/)", notes: "See TEST-004 for the verification item."}
  - {id: A11Y-015, title: "Manual screen-reader test protocol (VoiceOver + NVDA)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Scripted pass over every page template; recorded under evidence/."}
  - {id: A11Y-016, title: "Plain-language / cognitive accessibility review", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "VOX-005/006 already push plain language; formal review is depth."}

  # ── GOV: design governance (14) ──────────────────────────────────
  - {id: GOV-001, title: "Design-system source-of-truth document in the repository", status: REQUIRED, priority: P0, basis: "[S]", evidence: "docs/ empty; no DESIGN.md anywhere", notes: "This report seeds it; location decision §26.17."}
  - {id: GOV-002, title: "Token naming convention", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap", notes: "One scheme for CSS, tokens file, and Penpot variable names (§21)."}
  - {id: GOV-003, title: "Component contribution workflow (propose → review → approve → implement → verify)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "AGENTS.md Engineering Workflow exists for code; none for design", notes: "Mirrors the existing 8-step workflow with a design review stage."}
  - {id: GOV-004, title: "Founder approval gate for design changes", status: REQUIRED, priority: P0, basis: "[S]", evidence: "AGENTS.md (founder remains accountable; agents propose)", notes: "No design decision is self-approved by an agent."}
  - {id: GOV-005, title: "Visual regression policy (when snapshots are required)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Every component and page template; see TEST-003."}
  - {id: GOV-006, title: "Component deprecation policy", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "No deprecation risk until a second consumer exists."}
  - {id: GOV-007, title: "Token storage format (W3C Design Tokens–compatible JSON)", status: REQUIRED, priority: P0, basis: "[S]", evidence: "gap", notes: "Format decision §26.17; must be diffable in git."}
  - {id: GOV-008, title: "Penpot ↔ repository sync contract (direction, frequency, conflict rule)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "§8.5 text unretrievable — contract cannot cite it (§27.A)", notes: "Provisional until §8.5 text is recovered; repo is source of truth meanwhile (§21.4)."}
  - {id: GOV-009, title: "Accessibility review gate for design changes", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Design review includes contrast, focus, target size, reading order."}
  - {id: GOV-010, title: "Copy / claim review gate (evidence-based wording)", status: REQUIRED, priority: P1, basis: "[K]", evidence: "AGENTS.md evidence bar; case-study BLOCK conditions", notes: "No metric, client name, or outcome ships without recorded evidence."}
  - {id: GOV-011, title: "Design-system versioning and change log", status: FUTURE, priority: P3, basis: "[S]", evidence: "deferred", notes: "Start when external consumers exist."}
  - {id: GOV-012, title: "Design ownership / RACI record", status: REQUIRED, priority: P1, basis: "[S]", evidence: "decisions/ has no design record", notes: "Founder = accountable; agents = propose/implement; recorded as a decision file."}
  - {id: GOV-013, title: "Vetted third-party asset policy (fonts, icons, images — licence + provenance)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; requirements.lock shows dependency discipline exists for code", notes: "No asset enters the repo without licence + provenance recorded."}
  - {id: GOV-014, title: "Per-page design QA checklist", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Runs before any page is declared done (AGENTS.md evidence bar)."}

  # ── TEST: verification requirements (14) ─────────────────────────
  - {id: TEST-001, title: "Preserve tests/test_site_content.py invariants through the redesign", status: REQUIRED, priority: P0, basis: "[S]", evidence: "tests/test_site_content.py (19 assertions)", notes: "Extend for new pages; never weaken. Multi-page changes must update assertions meaningfully (§27.G)."}
  - {id: TEST-002, title: "Preserve gates-phase8.sh website checks", status: REQUIRED, priority: P0, basis: "[S]", evidence: "scripts/gates-phase8.sh [website]", notes: "Gate stays green after every design change."}
  - {id: TEST-003, title: "Visual regression snapshots (page × breakpoint)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "visual_baseline default (§14.3) becomes populated per template."}
  - {id: TEST-004, title: "Automated accessibility scan (axe-core) in CI", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap (tests/ has no a11y runner)", notes: "Zero serious/critical violations as the pass bar; BLOCKED if tooling unavailable — never skipped silently."}
  - {id: TEST-005, title: "Keyboard navigation test protocol", status: REQUIRED, priority: P1, basis: "2.1.1", evidence: "gap", notes: "Scripted tab/enter/escape paths per template; includes OVL-08 contract."}
  - {id: TEST-006, title: "Colour-contrast automated check", status: REQUIRED, priority: P0, basis: "1.4.3 / 1.4.11", evidence: "gap; live defect already exists (A11Y-004)", notes: "Must fail the build on any text <4.5:1 (normal) / non-text <3:1 (essential)."}
  - {id: TEST-007, title: "Performance budgets (LCP, CLS, total JS, total CSS, transfer size)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; ETHOS §9 (simple systems) implies restraint", notes: "Values NOT ESTABLISHED — owner decision §26.15; current site is ~4 KB inline so budgets start strict."}
  - {id: TEST-008, title: "Cross-browser verification matrix (Chromium, Firefox, WebKit)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Mobile Safari included via WebKit; recorded in evidence/."}
  - {id: TEST-009, title: "Responsive screenshot matrix (320 / 768 / 1024 / 1440)", status: REQUIRED, priority: P1, basis: "1.4.10", evidence: "gap", notes: "Includes reflow assertions from RESP-011 and zoom checks (A11Y-010)."}
  - {id: TEST-010, title: "Internal link integrity check", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap (no links exist today, so nothing to check — required at multi-page launch)", notes: "Fails on broken internal hrefs; external links checked for status."}
  - {id: TEST-011, title: "HTML validation (parser-clean, no duplicate IDs)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Complements the HTMLParser-based structure tests already present."}
  - {id: TEST-012, title: "Token-conformance lint (no raw hex/magic numbers in components)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; today the whole stylesheet is raw literals", notes: "Enforces §21.3; exceptions must be declared in the tokens file."}
  - {id: TEST-013, title: "Manual screen-reader pass recorded as evidence", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Implements A11Y-015; results stored under evidence/runs/ like other gates."}
  - {id: TEST-014, title: "Design-to-code parity review (Penpot ↔ implementation)", status: FUTURE, priority: P2, basis: "[S]", evidence: "deferred until Penpot exists", notes: "Blocked by PEN programme; revisit after §23."}

  # ── PEN: Penpot tooling (8) ──────────────────────────────────────
  - {id: PEN-001, title: "Penpot workspace creation", status: REQUIRED, priority: P1, basis: "[S]", evidence: "no Penpot artefacts in repo or history; §8.5 text unretrievable (§27.A)", notes: "Programme tool per founder scope; contract citation blocked until §8.5 recovered."}
  - {id: PEN-002, title: "Library file structure (foundations / components / pages)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "One library, three sections, mirroring §16 layers."}
  - {id: PEN-003, title: "Shared styles & variables imported from the token file", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "One-way import code → Penpot for values; manual re-entry forbidden (drift risk §27)."}
  - {id: PEN-004, title: "Core component library in Penpot (P0/P1 components)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap", notes: "Mirrors the 81 REQUIRED components; FUTURE components excluded from v1."}
  - {id: PEN-005, title: "Page templates / mockups in Penpot", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "All 17 REQUIRED pages; used as the visual baseline source."}
  - {id: PEN-006, title: "Design QA flow (inspect, export, handoff notes)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap", notes: "Feeds GOV-003 contribution workflow."}
  - {id: PEN-007, title: "Automated Penpot ↔ repo sync mechanism", status: FUTURE, priority: P2, basis: "[S]", evidence: "deferred", notes: "Manual parity reviews (TEST-014) first; automate only if drift recurs."}
  - {id: PEN-008, title: "Self-hosted Penpot deployment decision & setup", status: FUTURE, priority: P3, basis: "[S]", evidence: "NOT ESTABLISHED — cloud vs self-host undecided", notes: "Owner decision §26.16; self-hosting adds infrastructure to maintain (ETHOS §9)."}

  # ── VOX: voice & content patterns (8) ────────────────────────────
  - {id: VOX-001, title: "Hero / value proposition block (gate-pinned copy)", status: CURRENT, priority: P0, basis: "[S]", evidence: "index.html:18-19; gates live check greps 'Software that survives production'", notes: "Copy changes require a gate change first (§27.C)."}
  - {id: VOX-002, title: "Delivery-standard statement", status: CURRENT, priority: P1, basis: "[S]", evidence: "index.html:38-39", notes: "'Scope before code. Tests before release…' — four-sentence standard."}
  - {id: VOX-003, title: "Honesty pattern (empty-state disclosure)", status: CURRENT, priority: P0, basis: "[K]", evidence: "index.html:42; test_site_content.py:58-63", notes: "'None published yet…' is required by test AND gate; becomes COMP-DAT-14."}
  - {id: VOX-004, title: "Service card copy (three services)", status: CURRENT, priority: P1, basis: "[S]", evidence: "index.html:23-25", notes: "Finance integrations / Reconciliation / Performance builds."}
  - {id: VOX-005, title: "Plain-language writing standard (short sentences, no jargon)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; current copy already conforms informally", notes: "Codifies what the site already does."}
  - {id: VOX-006, title: "Claim/evidence phrasing rules (no invented metrics, no fake urgency)", status: REQUIRED, priority: P0, basis: "[K]", evidence: "AGENTS.md evidence bar; case-study BLOCK conditions", notes: "Applies to every page; gate keeps the placeholder class out."}
  - {id: VOX-007, title: "Terminology / glossary (Company OS vocabulary)", status: REQUIRED, priority: P2, basis: "[S]", evidence: "gap (terms like engagement, acceptance, change order are domain-defined in domain.py)", notes: "Aligns site language with domain enum vocabulary."}
  - {id: VOX-008, title: "Tone-of-voice guide (register, first-person plural, no hype)", status: REQUIRED, priority: P1, basis: "[S]", evidence: "gap; ETHOS + current copy imply a register but nothing is written", notes: "Short document; must be approved by founder (GOV-004)."}

  # ── OPS: product/ops UI surfaces (7) ─────────────────────────────
  - {id: OPS-001, title: "Client workspace dashboard (STATUS.md as UI)", status: FUTURE, priority: P3, basis: "[D]", evidence: "ClientStatus enum (domain.py:133-151); no UI exists", notes: "Deferred until the website programme closes; §8.2 identity text needed first."}
  - {id: OPS-002, title: "Intake workspace UI", status: FUTURE, priority: P3, basis: "[P]", evidence: "sops/intake/SKILL.md runs without UI", notes: "SOP is agent-driven today; UI is a later efficiency, not a need."}
  - {id: OPS-003, title: "Scope & proposal review UI", status: FUTURE, priority: P3, basis: "[P]", evidence: "sops/proposal, sops/scope-guard", notes: ""}

  - {id: OPS-004, title: "Delivery & evidence tracker UI", status: FUTURE, priority: P3, basis: "[P]", evidence: "EvidenceStatus + delivery states (domain.py)", notes: ""}

  - {id: OPS-005, title: "Invoice & payment status UI", status: FUTURE, priority: P3, basis: "[D]", evidence: "InvoiceStatus/PaymentStatus (domain.py:72-89)", notes: "Financial UI carries financial-correctness priority (AGENTS.md priority order)."}

  - {id: OPS-006, title: "Incident timeline UI", status: FUTURE, priority: P3, basis: "[P]", evidence: "sops/incident", notes: ""}

  - {id: OPS-007, title: "Turnover / reporting UI (Zoho Books)", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "evidence/runs/zoho-books-turnover-audit-2026-10-08.md; UI-only runbook exists", notes: "Excluded §25.14 — reporting is a UI-only runbook outside the design-system programme."}

  # ── EXCL: explicit capability exclusions (8) ─────────────────────
  - {id: EXCL-001, title: "Custom domain configuration", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "gates-phase8.sh requires NO custom_domain marker; deploy-site.sh header 'pages.dev endpoint only'", notes: "Excluded §25.15 — CONFLICT: founder scope mentions Cloudflare/domain; gate forbids it (§27.E)."}
  - {id: EXCL-002, title: "Native mobile application", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no mobile toolchain, no product to wrap", notes: "Excluded §25.16 — responsive web only."}
  - {id: EXCL-003, title: "Email sending UI / newsletter machinery", status: OUT_OF_SCOPE, priority: P3, basis: "[E]", evidence: "PHASE8-CLOSURE §34 BLOCKED — no sending domain, no provider", notes: "Excluded §25.17 — revisit only when §34 unblocks."}
  - {id: EXCL-004, title: "Authentication / accounts portal", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "Identity §8.2 text unretrievable", notes: "Excluded §25.18 — no login UI until §8.2 is recovered and decided (§27.A)."}
  - {id: EXCL-005, title: "E-commerce / checkout", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "engagement + proposal model; no self-serve purchase exists", notes: "Excluded §25.19."}
  - {id: EXCL-006, title: "Advertising and retargeting pixels", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "only analytics is PostHog, inert-by-default (BASE-003)", notes: "Excluded §25.20 — no ad tracking; would also break the placeholder/key gates if mishandled."}
  - {id: EXCL-007, title: "CMS / editorial pipeline", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "no authoring workflow exists", notes: "Excluded §25.21 — prerequisite for PAGE-016 blog; both stay excluded together."}
  - {id: EXCL-008, title: "Third-party chat widget", status: OUT_OF_SCOPE, priority: P3, basis: "[S]", evidence: "third-party scripts are test-forbidden (test_site_content.py:166-178)", notes: "Excluded §25.22 — a chat widget would violate the local-script-only invariant."}
```

### 15.1 Manifest totals (derived by grep over this section)

```text
CURRENT       30
REQUIRED     175
FUTURE        63
OUT_OF_SCOPE  22
TOTAL        290
```

Per-family totals are listed in §14.4; per-coverage-domain splits are in §7. Any divergence is a defect (§14.5).

---

## 16. Component architecture

The 130 components in §15 (COMP family) are organised into four layers. The layering is the contract: a component may only depend on tokens and on components from the same or lower layer.

```text
L3  Patterns      composed flows (intake form, confirmation dialog, empty-state block)
L2  Components    interactive + content units (buttons, cards, tables, dialogs)
L1  Primitives    text, icon, divider, spinner, badge — no layout decisions
L0  Tokens        color, type, space, radius, shadow, motion, focus
```

### 16.1 Layer rules

| Rule | Statement |
|---|---|
| R1 | A component consumes tokens only — no raw hex, no magic numbers (enforced by TEST-012). |
| R2 | L1 primitives never carry interaction semantics; semantics live in L2+. |
| R3 | L3 patterns may compose L2 components but never reach into their internals. |
| R4 | Every L2 component declares its states explicitly: default, hover, focus-visible, active, disabled, loading, error (where applicable). |
| R5 | Every L2 component has a Penpot counterpart (PEN-004) before implementation is declared done. |
| R6 | Accessibility behaviour (ARIA, keyboard) is part of the component spec, not a later patch (A11Y-002/003). |

### 16.2 P0/P1 build order (the critical set)

The 90 CURRENT+REQUIRED components ship in this order, each gated on the previous:

1. **Tokens first** — FOUND-001…004, FOUND-017 (focus ring), FOUND-005 (type scale). Without these, nothing below can conform.
2. **Primitives** — COMP-SPC-* (spacers/rule/dividers), COMP-TXT-* (headings, body, caption, link, overline).
3. **Actions** — COMP-ACT-01…09 (button variants, link-button, icon-button).
4. **Feedback** — COMP-FBK-01…09 (inline alert, banner, toast, spinner, progress, skeleton, badge, status-dot, empty-state).
5. **Forms** — COMP-FRM-01…11 (label, input, textarea, select, checkbox, radio, fieldset, help-text, error-text, form-row, submit) + COMP-SEL-01…09.
6. **Navigation** — COMP-NAV-01…06 (site-header, nav-links, mobile-disclosure, breadcrumb, pagination, footer) + COMP-CON-07 (page shell).
7. **Data** — COMP-DAT-01…08 (definition list, stat, key-value table, data table, sorting/filtering, pagination-for-tables, metric row, timestamp).
8. **Overlays** — COMP-OVL-01…05 (modal, drawer, tooltip, popover, dropdown) + COMP-CON-01…04 (service card, process steps, honesty callout, logo lockup).
9. **Remaining REQUIRED** — COMP-CON-08…12, COMP-SEL-10…14, COMP-FRM-12…14, COMP-DAT-09, COMP-FBK-10…13, COMP-ACT-10…11, COMP-TXT-07…09, COMP-NAV-07…12, COMP-SYS-01…08, COMP-SPC-07…09.

FUTURE components (43) are explicitly excluded from v1 and must not block any page launch.

### 16.3 Component contract (minimum fields per component)

Every component, when implemented, carries: purpose, layer, tokens used, states, keyboard map, ARIA pattern, Penpot reference (PEN id), visual-snapshot test id (TEST-003), and the manifest id it satisfies (§15).

---

## 17. Page architecture

### 17.1 Templates

The 30 PAGE items resolve into six templates. Pages are instances of templates; templates are instances of the shell (COMP-CON-07).

```text
Shell (nav + main + footer, landmark-exact per test_site_content.py)
├── Landing          — home
├── Marketing        — services index, service detail ×3, about, process
├── Content          — case studies index, case study detail, engineering standards,
│                      security, privacy, accessibility statement
├── Form             — contact / intake
├── Utility          — 404, sitemap
└── (Excluded)       — blog, pricing, careers, portal, … (OUT_OF_SCOPE, §25)
```

### 17.2 Page-level rules

- One `h1` per page; no heading-level skips (already test-enforced — TEST-001).
- Landmarks `nav` / `main` / `footer` exact and unique (test-enforced).
- No inline event handlers, no `javascript:` URLs (test-enforced).
- Every page passes the per-page QA checklist (GOV-014) before "done".
- Gate-pinned strings on home must match `gates-phase8.sh` exactly until the gate is changed by decision (§27.C).

### 17.3 Information architecture

Primary nav (proposed, owner decision §26.4 feeds the visual, not the IA): Services · Work · About · Contact. Footer mirrors nav plus Privacy and Accessibility statement links (A11Y-011 / 3.2.6). Breadcrumb appears only below Marketing/Content templates.

---

## 18. Responsive architecture

### 18.1 Principles

Mobile-first (RESP-001): base styles target 320px; breakpoints add capability. Reflow at 320px and 400% zoom is a hard requirement (RESP-011, basis 1.4.10), verified in TEST-009.

### 18.2 Proposed breakpoint set (NOT ESTABLISHED — owner decision §26.8)

| Token | Min-width | Intent |
|---|---|---|
| `--bp-sm` | 480px | Large phones: gutter steps 16→20px |
| `--bp-md` | 768px | Tablets: nav collapses to disclosure here, 2-col grids |
| `--bp-lg` | 1024px | Desktop: full nav, 3-col grids, side-by-side content |
| `--bp-xl` | 1440px | Wide: container cap holds (980px today), type scale tops out |

Values are a proposal only; nothing in the repository establishes them.

### 18.3 Rules

- Gutters never below 16px (RESP-005).
- Touch targets ≥44×44 CSS px, absolute floor 24px (RESP-006, basis 2.5.8).
- Wide content (tables) scrolls inside a labelled, keyboard-scrollable container — never the page (RESP-007, basis 1.4.10).
- All media `max-width: 100%`, aspect preserved (RESP-008).
- `prefers-reduced-motion` honoured globally (A11Y-007).

---

## 19. Accessibility architecture

### 19.1 Target

WCAG 2.2 Level AA (A11Y-001), declared on PAGE-014, verified by TEST-004/005/006/009/013.

### 19.2 Split of responsibility

| Layer | Owner items | Mechanism |
|---|---|---|
| Design (pre-code) | A11Y-003, 007, 008, 013; GOV-009 | Contrast, focus, motion, target size reviewed in Penpot/design review before build |
| Implementation | A11Y-002, 004, 006, 009, 011, 012 | Component contracts (§16.1 R6); focus-visible tokens |
| Automated | A11Y-014 → TEST-004, TEST-006, TEST-011 | axe-core in CI; contrast check fails build; HTML validation |
| Manual | A11Y-015 → TEST-013, TEST-005 | Screen-reader scripts (VoiceOver + NVDA); keyboard protocol |

### 19.3 Known live defect (must fix first)

**A11Y-004**: badge border `#bbb` on `#fff` ≈1.9:1 against the 3:1 non-text minimum (basis 1.4.11) — measured in §5.2. It is the only concretely measured WCAG failure in the current site and it disappears when FOUND-003/FOUND-013 tokens replace the raw palette.

### 19.4 Verification policy

No component or page is declared done on model judgement alone: automated scan green (TEST-004), contrast green (TEST-006), keyboard script green (TEST-005), and — for P0/P1 templates — a recorded manual pass (TEST-013). Evidence stored under `evidence/runs/` per AGENTS.md.

---

## 20. Design governance

### 20.1 Roles (GOV-012, provisional until recorded as a decision)

| Role | Holder | Authority |
|---|---|---|
| Accountable | Founder | Approves tokens, components, pages, copy claims, exclusions (GOV-004) |
| Proposing | Agents | Analyse, draft, implement, recommend — never self-approve |
| Verifying | Deterministic systems | Gates, tests, contrast checks, snapshots |

### 20.2 Workflow (GOV-003)

```text
propose → design review (contrast/focus/size/claims) → founder approval
        → implement → automated verification → visual snapshot → manual pass (P0/P1)
        → evidence recorded → ship
```

This mirrors the existing AGENTS.md 8-step engineering workflow with an explicit design-review stage inserted before implementation and an accessibility pass inserted before ship.

### 20.3 Records

- Design-system document: GOV-001 (location §26.17).
- Token file: GOV-007, W3C-Design-Tokens-compatible JSON, diffable in git.
- Ownership record: GOV-012 under `decisions/`.
- Asset licences: GOV-013 alongside the token file.
- Change log / deprecation / versioning (GOV-006/011): FUTURE, triggered by a second consumer.

### 20.4 Penpot relationship (GOV-008, PEN-001…008)

Penpot is the programme's design tool. Until §8.5's text is recovered (§27.A), **the repository is the source of truth** and Penpot is a downstream rendering of the token file; sync direction is provisional. Automated sync (PEN-007) and self-hosting (PEN-008) are FUTURE.

---

## 21. Design-to-code contract

### 21.1 Token file is the single value authority

CSS custom properties are generated from (or checked against) the JSON token file. Components import tokens; TEST-012 fails the build on raw hex or magic numbers outside the declared exception list.

### 21.2 Naming scheme (GOV-002, proposal)

```text
color.bg.surface / color.fg.default / color.border.subtle
type.size.body / type.weight.medium / type.leading.tight
space.stack.md / space.inline.sm
radius.md / shadow.low / motion.fast
focus.ring
```

The same names appear in CSS (`--color-bg-surface`), the JSON file, and Penpot variables (PEN-003) — one scheme across all three surfaces (§16 R1).

### 21.3 Parity rule

Penpot mockup → implementation → snapshot form one loop. Where they diverge, the token file wins; Penpot is updated to match; the divergence is recorded (TEST-014, FUTURE until Penpot exists).

### 21.4 Direction statement (provisional)

```text
decision (founder) → token file (git) → CSS + Penpot → components → pages
```

No downstream artefact invents a value that is not in the token file.

---

## 22. Testing & verification requirements

Consolidated from the TEST family (§15). The full list is the manifest; the wiring is:

| Gate | When | Blocks "done"? |
|---|---|---|
| `test_site_content.py` (TEST-001) | every commit | Yes — invariants are contract |
| `gates-phase8.sh [website]` (TEST-002) | every dispatch/deploy | Yes |
| Token-conformance lint (TEST-012) | every commit once tokens exist | Yes |
| axe-core + contrast (TEST-004/006) | CI | Yes (zero serious/critical) |
| HTML validation + link integrity (TEST-010/011) | CI, post-launch pages | Yes |
| Visual snapshots (TEST-003) | per template × breakpoint, CI | Yes for template changes |
| Responsive matrix (TEST-009) | per template | Yes for P0/P1 templates |
| Keyboard + screen reader (TEST-005/013) | per P0/P1 template, manual | Yes for P0/P1 |
| Performance budgets (TEST-007) | CI once budgets set (§26.15) | Yes once values established |
| Cross-browser (TEST-008) | pre-release | Recorded; blocks release on regression |

Failure handling follows AGENTS.md: report honestly, never skip silently, BLOCKED states are explicit.

---

## 23. Penpot implementation plan

Penpot work is a programme tool track that runs **in parallel with, and is blocked from claiming completion by, the missing §8.5 text** (§27.A).

### 23.1 Sequence

1. **S0 — Recover §8.5.** Attempt history recovery (`git log -S` over both merge branches, `git show` of phase8-era commits). If unrecoverable, founder re-states the contract (decision §26.16).
2. **S1 — Token file first (GOV-007).** Penpot imports values; it never originates them (§21.4).
3. **S2 — Workspace + library structure (PEN-001/002).**
4. **S3 — Shared styles/variables import (PEN-003).**
5. **S4 — Core component library (PEN-004)** — the 81 REQUIRED components, in the §16.2 order.
6. **S5 — Page templates (PEN-005)** — the 17 REQUIRED pages.
7. **S6 — Design QA flow (PEN-006)** → feeds the GOV-003 review gate.
8. **S7 (FUTURE) — parity reviews (TEST-014), automated sync (PEN-007), hosting decision (PEN-008).**

### 23.2 Exit criteria for the Penpot track

- Every P0/P1 component has a Penpot counterpart with matching token values (bit-for-bit on color/type/space).
- Every REQUIRED page has a Penpot mockup.
- GOV-009 accessibility review is recorded against each mockup.
- Founder approval (GOV-004) recorded for the library as a whole.

---

## 24. Phase 8 design scope

Phase 8 shipped the single-page site and its gates. Design-wise, Phase 8 **established the constraints, not the system**:

| In Phase 8 (keep) | Not in Phase 8 (this programme) |
|---|---|
| `index.html` + `config.js` + `analytics.js` (BASE-001…005) | Token system (FOUND) |
| 19 content invariants + website gates (TEST-001/002) | Component library (COMP) |
| Gate-pinned copy & placeholder/key prohibitions (§6) | Multi-page IA (PAGE-002…015) |
| Zero-JS, local-scripts-only posture | Responsive system (RESP-001) |
| Deploy 4-state machine + `pages.dev` endpoint | Conformance program (A11Y) |
| | Governance docs (GOV) |
| | Penpot (PEN) |

Any redesign must keep the Phase 8 gate suite green throughout; where a gate blocks a design change (custom domain §27.E, hero copy §27.C), the gate change is an explicit founder decision, never a silent edit.

---

## 25. Explicit exclusions (22 OUT_OF_SCOPE items)

Excluded by evidence, not by preference — each row names why it cannot currently be done:

| § | Exclusions | Why excluded |
|---|---|---|
| 25.1–25.13 | PAGE-016…025, 028…030 (blog, terms, consent banner, maintenance, careers, press, newsletter, imprint, pricing, testimonials, multi-language, portal, status) | No pipeline, no legal text, no capability, or no activity exists (see each entry's `notes`) |
| 25.14 | OPS-007 turnover/reporting UI | UI-only runbook, outside the design-system programme |
| 25.15 | EXCL-001 custom domain | **Forbidden by gate** — conflicts with founder scope (§27.E) |
| 25.16–25.22 | EXCL-002…008 (native app, email UI, auth portal, checkout, ad pixels, CMS, chat widget) | Missing capability, §34 BLOCKED, §8.2 unretrievable, or test-forbidden third-party scripts |

**Standing rule:** an OUT_OF_SCOPE item may only change status via an explicit founder decision that also establishes the missing prerequisite (capability, legal text, or gate change). Agents may propose; they may not reclassify.

---

## 26. Owner decisions required (17)

Each decision blocks specific manifest items. Nothing below is agent-decidable.

| # | Decision | Blocks | Default if undecided |
|---|---|---|---|
| 26.1 | Brand mark: keep wordmark-only or introduce a symbol (BRAND-009) | BRAND-009, PAGE-027 | Keep wordmark-only |
| 26.2 | Font loading strategy (system stack vs self-hosted webfont) (BRAND-001…004) | FOUND type scale rollout | System stack (fastest, zero-licence risk) |
| 26.3 | Palette: adopt proposed neutrals+accent or re-derive (BRAND-005…008) | A11Y-004 fix, all color tokens | Adopt §5.2-derived palette after contrast re-check |
| 26.4 | Dark mode: now / later / never (BRAND-010) | FOUND-016, token doubling | Later |
| 26.5 | Logo lockup rules (BRAND-011) | COMP-CON-08 | Single lockup, no variants |
| 26.6 | Density: comfortable vs compact default (BRAND-013) | space tokens | Comfortable |
| 26.7 | Motion budget: none / minimal / expressive (BRAND-014/015) | FOUND-018, A11Y-007 scope | Minimal, reduced-motion honoured |
| 26.8 | Breakpoint values (§18.2) | RESP-001, whole RESP family | Adopt §18.2 proposal |
| 26.9 | Contact submission path — given Email §34 BLOCKED and `mailto:` test-forbidden, how does PAGE-010 submit? | PAGE-010, FRM/SEL form items | **BLOCKED** — no viable default |
| 26.10 | Multi-page IA approval (§17.3) vs staying one-page | PAGE-002…015, TEST-001 rework | Approve IA before build |
| 26.11 | Terms page + cookie/analytics consent (PAGE-017/018) — analytics is already live | PAGE-017/018 | **Escalate**: live analytics without disclosure is a standing risk |
| 26.12 | Custom domain: reaffirm gate or follow founder scope (§27.E) | EXCL-001 | Keep gate (pages.dev) until decided |
| 26.13 | Blog/CMS: stay excluded or fund a pipeline | PAGE-016, EXCL-007 | Stay excluded |
| 26.14 | Imagery strategy: none / abstract SVG / photography (BRAND-012, RESP-008) | media tokens, A11Y-008 | None for v1 (ETHOS simplicity) |
| 26.15 | Performance budget values (TEST-007) | TEST-007 | Set strict values at first snapshot (site is ~4 KB) |
| 26.16 | Penpot hosting (cloud vs self-host) + restate §8.5 contract if unrecoverable | PEN-001/008, GOV-008 | **BLOCKED** on §27.A |
| 26.17 | Design-system location: `docs/DESIGN.md` + `design/tokens.json`, or dedicated repo | GOV-001/007 | In-repo (`docs/` + `design/`) — single git history |

---

## 27. Risks & ambiguities

| # | Risk | Evidence | Impact | Mitigation |
|---|---|---|---|---|
| 27.A | **§8.2 (Identity contract) and §8.5 (Penpot contract) text unretrievable** | PHASE8-CLOSURE states both | Penpot track cannot cite its own contract; portal work impossible | S0 recovery attempt (§23.1); founder restatement (§26.16); portal stays OUT_OF_SCOPE (PAGE-029, EXCL-004) |
| 27.B | **Phase 13 gate-evidence commit exists off-main** (`fac0e3a` on `feat/zoho-crm-projection` + `backup/local-opencode-merge`) while closure says Phase 9 NOT STARTED | `git branch --contains fac0e3a`; closure doc | Programme-state ambiguity: which phase numbering is authoritative? | Treat as documentation defect; founder reconciles before any phase-gated design claim |
| 27.C | **Hero copy is gate-pinned** but copy ownership sits with GOV-010 | gates live-greps "Software that survives production" | Any copy redesign silently fails deploy | Copy change = gate change = explicit decision, sequenced first |
| 27.D | **Inter (or any webfont) is declared nowhere** — current site loads no font files | zero font files in repo | §9 font discussion was about a font that never shipped | §26.2 decision starts from system stack |
| 27.E | **Custom-domain conflict**: founder scope mentions Cloudflare/domain; gate requires *no* custom_domain marker and deploy is pages.dev-only | `gates-phase8.sh`; `deploy-site.sh` header | Either the scope or the gate is stale — work could ship that CI then rejects | §26.12 founder reconciliation; until then gate wins (safety > convenience) |
| 27.F | **Case-study SKILL contains drafting scaffolding** (template language) while AGENTS.md forbids unvalidated text as institutional truth | `sops/case-study/SKILL.md` | Risk of scaffolding reaching a live page | GOV-010 claim gate + PAGE-009 publish conditions; scaffolding never auto-ships |
| 27.G | **Multi-page launch collides with single-page test invariants** | `test_site_content.py` asserts index.html structure | Adding pages may "break" tests that are actually correct contracts | TEST-001 rule: extend meaningfully, never weaken; §26.10 approves IA first |
| 27.H | **Contact form has no backend** (Email §34 BLOCKED, `mailto:` forbidden) | closure §34; test_site_content.py | PAGE-010 cannot function — a form that silently drops submissions is worse than none | §26.9 BLOCKED until a submission path exists; ship the form without a submit path only if explicitly labelled |

**Standing risks:** live analytics with no disclosure/consent decision (26.11); measured contrast defect already in production (A11Y-004); all verification claims in this report derive from repository reads — the test suite was **not re-run** for this audit (Phase 8 closure count of 621 is the latest cited figure).

---

## 28. Recommended execution sequence

Critical path from §13: **S0 → tokens → gate decisions → components → pages → accessibility close-out.**

| Step | Content | Depends on | Exit evidence |
|---|---|---|---|
| **1. Unblock & decide** | Founder resolves §26.9 (contact path), §26.11 (disclosure), §26.12 (domain), §26.16 (§8.5/Penpot); attempt §8.5 recovery; reconcile §27.B | — | Decision records under `decisions/`; recovered or restated contracts |
| **2. Tokens (S1)** | GOV-001/002/007 + FOUND-001…005, FOUND-013, FOUND-017; fixes A11Y-004 | §26.2/26.3/26.6 | Token file in git; contrast check green; TEST-012 lint live |
| **3. Governance in place** | GOV-003/004/009/010/012/013/014 as short documents | Step 2 | Approved workflow + ownership record |
| **4. Component core (§16.2 order 2–6)** | Primitives → actions → feedback → forms → nav/shell | Steps 2–3 | axe green, keyboard green, snapshots per component (TEST-003–006) |
| **5. Penpot parallel (S2–S6)** | Workspace, variables, P0/P1 components, page mockups | Step 2 (+ §26.16) | PEN-001…006 evidence; GOV-009 reviews recorded |
| **6. Page build (PAGE-002…015)** | IA-approved pages on the shell; extend (never weaken) tests | Steps 1, 4; §26.10 | All 19 invariants + gates green on multi-page site (TEST-001/002/010/011) |
| **7. Close-out** | A11Y-015 manual pass, TEST-007 budgets, TEST-008/009 matrix, PAGE-014 statement, §26.15 values | Step 6 | Evidence under `evidence/runs/`; §15 status recomputed (§14.5) |

**Definition of done for the programme:** every CURRENT and REQUIRED item in §15 carries evidence appropriate to its claim; every OUT_OF_SCOPE item carries a recorded decision; no FUTURE item blocks release; §1/§7 counts still match §15 (§14.5).

---

*End of report. Generated 2026-10-08 from repository state at `main` @ 93e9071. Manifest: 290 items — CURRENT 30 · REQUIRED 175 · FUTURE 63 · OUT_OF_SCOPE 22.*
