# Company OS

**The operating system for a one-person software company — Rewritten as a React Application.**

Company OS brings business operations and software delivery into one auditable web platform: discover opportunities, research and scope work, build and verify software, deliver to clients, manage commercial records, and execute deterministic payment reconciliation.

> **Models propose. Deterministic systems decide.**

## Core Features & Architecture

This application has been rewritten as a modern **React (TypeScript + Vite)** web application that preserves the complete feature set, design language, and business logic of Company OS:

1. **Company Web Presence & Services Hub (`COM-OS`)**:
   - **Home**: Executive overview, Kampala & remote worldwide context, "The standard behind the work" 4-step delivery lifecycle, problems grid, operating contexts, engineering principles, and WhatsApp project contact.
   - **Services Hub**: Comprehensive overview of the 6 core offerings:
     - 01 Business Websites
     - 02 Custom Business Software
     - 03 Payments and Integrations
     - 04 Payment Reconciliation
     - 05 Workflow Automation
     - 06 Software Rescue and Ongoing Care
   - **Detailed Service Pages**: Deep dives into *Performance Builds & Software Rescue*, *Finance Integrations*, and *Reconciliation*.
   - **How We Work**: Step-by-step engagement lifecycle (`Understand → Scope → Propose → Build → Verify → Hand over`) and clear commercial terms.
   - **Work & Case Studies**: Publication standard and technical demonstration data table highlighting matched, unmatched, duplicate, and conflicting transactions.
   - **About & Standards**: Mission statement, Ugandan context, delivery commitments, WCAG 2.2 AA accessibility statement, security handling, and RFC 9116 security disclosure.
   - **Contact & WhatsApp Inquiry**: Direct contact with structured project brief generation.

2. **Interactive Reconciliation & Operations Suite (`/ops-suite`)**:
   - **Product 1 — Mobile-Money Reconciliation Agent**:
     - Deterministic, zero-LLM engine executing rules R1 through R8.
     - Synthetic data fixtures featuring MTN Mobile Money, Airtel Money, school tuition obligations, SACCO contributions, and logistics billing.
     - Real-time classification of Exact matches, Partial allocations, Unreferenced proposed matches, Unmatched records, Duplicate suspects, and Overpayment/conflicting exceptions.
     - Strict isolation of Refunds (R7) and Reversals (R8).
     - Exportable JSON reconciliation audit reports with cryptographic rules fingerprint.
   - **Phase 8 Client Lifecycle State Machine**:
     - Interactive simulation of the 11 authoritative states:
       `PROSPECT → INTAKE → APPROVAL → SCOPE → PROPOSAL → ENGAGEMENT → DELIVERY → ACCEPTANCE → INVOICE → ISSUED → PAYMENT → CLOSED`
     - Fail-closed transition verification and live audit logging.
   - **Governance & Model Routing Inspector**:
     - Visualizes the 4 data classification tiers (`PUBLIC`, `INTERNAL`, `CONFIDENTIAL`, `RESTRICTED`).
     - Details model routing assignments from `config/models.yaml`.
   - **Weekly Close & Financial Invariants**:
     - Financial discipline records and audit invariants: *Empty is not zero. Absence of a record is not evidence of zero.*

## Development & Build

This project uses **React 19**, **TypeScript**, and **Vite**:

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build production bundle
npm run build
```

## Styling & Design Tokens

The UI strictly preserves the Company OS design tokens (`docs/design/DESIGN_TOKENS.yaml`):
- Monochromatic, high-contrast, distraction-free typographic hierarchy.
- Dark mode and light mode automatic adaptation via `color-scheme`.
- Accessible keyboard navigation with visible focus indicators and skip link.
