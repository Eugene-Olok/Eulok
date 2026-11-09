# Company OS Website Redesign

**Status:** Implementation on `feat/website-commercial-redesign`; production remains unchanged until review, CI and an authorized deployment are verified.

## Objective and positioning

Position Company OS as a software engineering and business-systems partner for Uganda and international clients. Websites are an entry service, not the whole offer. Buyers should identify their operational problem, understand the delivery approach and start a direct conversation without fabricated proof.

## Design direction

- Editorial engineering: strong type hierarchy, deliberate whitespace, asymmetric hero composition and structured service grids.
- Neutral monochrome palette from `docs/design/DESIGN_TOKENS.yaml`; light is canonical and dark follows system preference.
- Exact typeset `COM-OS` wordmark remains the only mark. No symbol, icon, logo variant, remote font, image CDN or unapproved artwork is introduced.
- Static HTML/CSS, system fonts and existing local analytics scripts. No framework, autoplay media or required client-side runtime.
- Responsive layout supports 320px and the existing 480/768/1024/1440px contract.
- Skip link, semantic landmarks, visible focus, reduced-motion support, descriptive links and clear heading hierarchy are included.

## Commercial architecture

The approved page set and three service-detail routes remain. The services index presents six service families: business websites; custom business software; payments and business integrations; payment reconciliation; workflow automation; software rescue and ongoing care. Existing detail pages now carry expanded sections and anchors. Contact remains the currently published WhatsApp path; no unverified email address or pricing figures are invented. The homepage elevates software rescue as a direct entry point, and the work page includes a clearly labelled synthetic reconciliation demonstration rather than fabricated client proof.

## Trust and claim policy

- No invented logos, testimonials, case studies, outcome percentages, match rates, delivery times, uptime or CI pass rates.
- EFRIS/URA and mobile-money claims remain conditional on current requirements, client authorisation, provider access and onboarding. No accreditation claim is made.
- Sandbox results are not represented as production readiness.
- Performance results are not claimed without an agreed method and supporting evidence.
- Scope, acceptance, dependencies, client permissions, support windows and handover must be agreed explicitly.

## Runtime and analytics

Keep Cloudflare Pages and canonical `tools/build_site.py`. Committed `config.js` remains inert; only the canonical builder injects production PostHog configuration. Preview/stage remains inert and all preview/stage HTML receives a build-generated `noindex,nofollow` marker; production builds remove only that generated marker while preserving intentional noindex routes. Preserve `https://wa.me/256760779160`. Sitemap only lists existing published routes.

## Verification contract

- Existing Phase 8 gates remain authoritative and must not be weakened.
- Bundle-budget checker must measure the actual homepage (`index.html`) and its local first-load CSS/JS; hard limits remain JS ≤25 KiB, CSS ≤15 KiB, transfer ≤100 KiB.
- Browser verification covers the approved 15 pages and five viewports. It does not replace manual keyboard/screen-reader/zoom review or create a visual-regression baseline by itself.
- CI outcomes must be observed from the PR head. Unavailable external/browser checks are BLOCKED, not PASS.
- Deployment is a separate authorized action after merge; verify live commit and content.


## Client-facing content boundary

- About, delivery commitments, security, privacy, accessibility and contact pages are written for prospective clients rather than as copies of internal operating documentation.
- Public pages must not expose internal agent/tool inventories, local secret paths, internal evidence schemas, provider-routing configuration, or machine-specific gate identifiers.
- Security and AI language describes intended client-facing boundaries without claiming independent certification, universal security, a response-time SLA, or guarantees that have not been contractually agreed.
- Privacy copy distinguishes the committed empty analytics configuration from a live deployment configuration and explicitly notes possible third-country processing when third-party services are enabled. Regulatory registration status is not invented.
- A synthetic reconciliation table is a demonstration only; it is not presented as client work, a live provider connection, or measured production results.
- The primary navigation is consistent across published pages. Internal engineering standards remain linked from the footer rather than promoted as a primary buyer journey.
- No domain purchase, email account, paid service, or production deployment is performed without owner action/authorization.
