import { navigateTo, openIntakeModal } from '../utils/navigation';
import React, { useState } from 'react';
import {
  ArrowRight,
  Filter,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Cpu,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface ServicesPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

interface ServiceItem {
  id: string;
  number: string;
  stage: string;
  title: string;
  audience: string;
  shortDesc: string;
  deliverables: string[];
  engineering: string[];
  detailRoute: string;
  category: 'build' | 'fix' | 'automate' | 'integrate';
  system: 'website' | 'webapp' | 'financial' | 'api';
  industry: 'finance' | 'education' | 'retail' | 'other';
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [filterSystem, setFilterSystem] = useState<string>('all');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const handleFilterGoalChange = (val: string) => {
    setIsFiltering(true);
    setFilterGoal(val);
    setTimeout(() => setIsFiltering(false), 120);
  };

  const handleFilterSystemChange = (val: string) => {
    setIsFiltering(true);
    setFilterSystem(val);
    setTimeout(() => setIsFiltering(false), 120);
  };

  const handleFilterIndustryChange = (val: string) => {
    setIsFiltering(true);
    setFilterIndustry(val);
    setTimeout(() => setIsFiltering(false), 120);
  };

  const handleResetFilters = () => {
    setIsFiltering(true);
    setFilterGoal('all');
    setFilterSystem('all');
    setFilterIndustry('all');
    setTimeout(() => setIsFiltering(false), 120);
  };

  const services: ServiceItem[] = [
    {
      id: 'websites',
      number: '01 / BUILD',
      stage: 'Build',
      title: 'Business websites',
      audience: 'Businesses replacing outdated websites or launching a credible digital presence.',
      shortDesc: 'Build a credible digital presence that communicates your business clearly and converts visitors into enquiries.',
      deliverables: [
        'Responsive mobile-first website architecture',
        'Conversion-focused page design and guided intake',
        'Accessible navigation (WCAG 2.2 AA target)',
        'SEO foundations, clean metadata, and canonical rules',
        'Performance optimization and image compression',
        'Deployment runbooks and content handover notes',
      ],
      engineering: [
        'Semantic HTML5 structure without hydration waterfalls',
        'Optimized responsive AVIF/WebP image delivery',
        'Sub-second first contentful paint on mobile connections',
        'Clean privacy-respecting analytics integration',
      ],
      detailRoute: 'services/performance-builds',
      category: 'build',
      system: 'website',
      industry: 'other',
    },
    {
      id: 'custom-software',
      number: '02 / BUILD',
      stage: 'Build',
      title: 'Custom business software',
      audience: 'Organizations replacing spreadsheets and fragmented manual processes with validated software.',
      shortDesc: 'Purpose-built portals, dashboards and workflow systems designed around real operational constraints.',
      deliverables: [
        'Internal administrative portals and dashboards',
        'Validated forms with role-based access control',
        'Inventory, member records, and booking modules',
        'Reconciled data migration from legacy spreadsheets',
        'Auditable database schema and backup procedures',
      ],
      engineering: [
        'Normalized relational schemas with strict foreign keys',
        'Zero-trust permission checks on all backend endpoints',
        'Audit-logged state transitions preserving historical records',
        'Contract-tested API interfaces',
      ],
      detailRoute: 'services/performance-builds',
      category: 'build',
      system: 'webapp',
      industry: 'education',
    },
    {
      id: 'software-rescue',
      number: '03 / RECOVER',
      stage: 'Recover',
      title: 'Software rescue & stabilization',
      audience: 'Businesses with stalled, unreliable, abandoned or difficult-to-maintain software systems.',
      shortDesc: 'Audit, stabilize and modernize software with prioritized risks and defined boundaries before rebuilding.',
      deliverables: [
        'Comprehensive architecture and dependency audit',
        'Reproduction of critical bugs and regression test suite',
        'Idempotent retry queues for dropped transactions',
        'Sanitized credential boundaries and secret isolation',
        'Staging verification and documented rollback procedures',
      ],
      engineering: [
        'Root-cause failure mode analysis under simulated load',
        'Decoupling monolithic tangles into verified modules',
        'Fail-closed boundary enforcement on external API calls',
        'Automated CI release gates',
      ],
      detailRoute: 'rescue',
      category: 'fix',
      system: 'webapp',
      industry: 'other',
    },
    {
      id: 'automation',
      number: '04 / AUTOMATE',
      stage: 'Automate',
      title: 'AI & workflow automation',
      audience: 'Operations teams eliminating repetitive administrative data entry while preserving human accountability.',
      shortDesc: 'Automate routine hand-offs and document generation while keeping consequential approvals with humans.',
      deliverables: [
        'Automated document extraction and parsing pipelines',
        'CRM, invoice, and spreadsheet synchronization bots',
        'Notification routing with duplicate prevention',
        'Human-in-the-loop exception review queue',
        'Operational metrics and execution audit logs',
      ],
      engineering: [
        'Strict separation: probabilistic model proposals vs deterministic actions',
        'Idempotent processing with duplicate key hashes',
        'Bounded retry logic with exponential backoff and jitter',
        'Explicit manual review thresholds for high-risk data',
      ],
      detailRoute: 'services/finance-integrations',
      category: 'automate',
      system: 'api',
      industry: 'retail',
    },
    {
      id: 'integrations',
      number: '05 / CONNECT',
      stage: 'Connect',
      title: 'Integrations and APIs',
      audience: 'Businesses connecting disconnected systems across payments, billing, CRMs and compliance.',
      shortDesc: 'Connect payment, invoicing, accounting and operational systems with traceable states and explicit recovery paths.',
      deliverables: [
        'Mobile money payment gateway adapters (MTN, Airtel)',
        'URA EFRIS fiscal device & invoice integration assessment',
        'Webhook verification and signature authentication',
        'Dead-letter queues and automated failure notifications',
        'Complete integration test suite with mock sandboxes',
      ],
      engineering: [
        'Cryptographic webhook signature verification',
        'Distributed idempotency locks preventing double charges',
        'Deterministic state transition mapping',
        'Graceful offline queueing for network dropouts',
      ],
      detailRoute: 'services/finance-integrations',
      category: 'integrate',
      system: 'api',
      industry: 'finance',
    },
    {
      id: 'reconciliation',
      number: '06 / OPERATE',
      stage: 'Operate',
      title: 'Financial reconciliation systems',
      audience: 'Finance teams matching mobile-money collections, bank files, invoices and internal records.',
      shortDesc: 'Match transaction records across sources, surface discrepancies and route exceptions to human review.',
      deliverables: [
        'Multi-source ingestion pipeline (CSV, Excel, API feeds)',
        'Deterministic matching engine executing rules R1–R8',
        'Visual exception triage queue for ambiguous payments',
        'Refund and reversal isolation system',
        'Cryptographically fingerprinted audit reports for compliance',
      ],
      engineering: [
        'Pure zero-LLM matching logic running in sub-millisecond time',
        'Fixed-point Decimal math avoiding IEEE 754 floating-point errors',
        'Immutable outcome ledger preserving original source records',
        'Automated golden-set verification tests',
      ],
      detailRoute: 'services/reconciliation',
      category: 'operate' as any,
      system: 'financial',
      industry: 'finance',
    },
  ];

  // Filter logic (never completely hides if empty, informs user)
  const filteredServices = services.filter((s) => {
    const matchGoal = filterGoal === 'all' || s.category === filterGoal || (filterGoal === 'operate' && s.id === 'reconciliation');
    const matchSystem = filterSystem === 'all' || s.system === filterSystem;
    const matchIndustry = filterIndustry === 'all' || s.industry === filterIndustry || s.industry === 'other';
    return matchGoal && matchSystem && matchIndustry;
  });

  return (
    <>
      {/* Services Hero */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(56px, 8vw, 96px) 0 50px' }}>
        <div className="container-expansive">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '24px' }}>
            <button onClick={() => onNavigate('home')}>Home</button>
            <span className="separator">/</span>
            <span aria-current="page">Services</span>
          </nav>

          <div style={{ maxWidth: '860px' }}>
            <span className="eyebrow">SERVICES · FROM ARCHITECTURE TO RELIABLE OPERATIONS</span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)', marginBottom: '20px' }}>
              Engineering for the problems that matter.
            </h1>
            <p className="lead" style={{ maxWidth: '64ch' }}>
              From a new business website to a critical financial workflow, EULOK builds and improves software around real operational requirements. We assess existing constraints and recommend the smallest solution that meets the need safely.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '30px' }}>
              <button
                className="button button-primary"
                onClick={onOpenIntakeModal}
              >
                <span>Discuss a project</span>
                <ArrowRight size={16} />
              </button>
              <button
                className="button button-quiet"
                onClick={() => onNavigate('rescue')}
              >
                Rescue a stalled project
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Guided Service Discovery (Smart Search) */}
      <section className="section-full theme-navy" style={{ padding: '40px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container-expansive">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Filter size={18} color="var(--electric-blue)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Smart Service Discovery</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              (Optional filter — all services remain accessible below)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                What are you trying to do?
              </label>
              <select
                className="form-input"
                style={{ marginTop: 0 }}
                value={filterGoal}
                onChange={(e) => handleFilterGoalChange(e.target.value)}
              >
                <option value="all">All Goals</option>
                <option value="build">Build something new</option>
                <option value="fix">Fix or rescue existing software</option>
                <option value="automate">Automate repetitive processes</option>
                <option value="integrate">Integrate APIs or payment systems</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                System type
              </label>
              <select
                className="form-input"
                style={{ marginTop: 0 }}
                value={filterSystem}
                onChange={(e) => handleFilterSystemChange(e.target.value)}
              >
                <option value="all">All System Types</option>
                <option value="website">Business Website</option>
                <option value="webapp">Custom Web App / Portal</option>
                <option value="financial">Financial Reconciliation</option>
                <option value="api">API / Integration Adapter</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Operating context
              </label>
              <select
                className="form-input"
                style={{ marginTop: 0 }}
                value={filterIndustry}
                onChange={(e) => handleFilterIndustryChange(e.target.value)}
              >
                <option value="all">All Contexts</option>
                <option value="finance">Finance & Payments</option>
                <option value="education">Schools & Education</option>
                <option value="retail">Retail & Commerce</option>
                <option value="other">Other Operations</option>
              </select>
            </div>
          </div>

          {(filterGoal !== 'all' || filterSystem !== 'all' || filterIndustry !== 'all') && (
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.84rem', color: 'var(--electric-blue)' }}>
                Showing {filteredServices.length} of {services.length} services
              </span>
              <button
                className="text-link"
                style={{ fontSize: '0.82rem' }}
                onClick={handleResetFilters}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Six Detailed Service Sections */}
      <section className="section-full theme-dark" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
        <div className="container-expansive">
          {isFiltering ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
              <LoadingSkeleton variant="card" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="card"
                  style={{ padding: 'clamp(28px, 4vw, 44px)', background: 'var(--bg-secondary)', border: '1px solid var(--line-strong)' }}
                >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <span className="mono-tag" style={{ color: 'var(--electric-blue)', fontWeight: 700 }}>
                    {service.number}
                  </span>
                  <span className="badge badge-neutral">Stage: {service.stage}</span>
                </div>

                <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: '12px' }}>
                  {service.title}
                </h2>
                <p className="lead" style={{ marginBottom: '20px' }}>
                  {service.shortDesc}
                </p>

                <div style={{ padding: '12px 16px', background: 'var(--bg-primary)', borderLeft: '3px solid var(--accent-blue)', borderRadius: '4px', marginBottom: '24px' }}>
                  <strong style={{ fontSize: '0.86rem', color: 'var(--warm-white)', display: 'block', marginBottom: '4px' }}>
                    Who this is for:
                  </strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-subtle)' }}>
                    {service.audience}
                  </span>
                </div>

                <div className="grid-2" style={{ marginBottom: '28px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      What We Deliver:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-subtle)', fontSize: '0.92rem' }}>
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Engineering Considerations:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-subtle)', fontSize: '0.92rem' }}>
                      {service.engineering.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                  <button
                    className="button button-primary button-small"
                    onClick={onOpenIntakeModal}
                  >
                    <span>Discuss this service</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    className="button button-quiet button-small"
                    onClick={() => onNavigate(service.detailRoute)}
                  >
                    Detailed technical view →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>

      {/* Service Comparison Matrix */}
      <section className="section-full theme-warm-light" style={{ padding: 'clamp(64px, 8vw, 96px) 0' }}>
        <div className="container-expansive">
          <div style={{ maxWidth: '780px', marginBottom: '32px' }}>
            <span className="eyebrow">Scoping Framework</span>
            <h2>Service Scoping & Requirements Comparison</h2>
            <p className="lead">
              A transparent breakdown of when each service applies, prerequisites, and what information is needed to estimate scope.
            </p>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">When Appropriate</th>
                  <th scope="col">Problem Addressed</th>
                  <th scope="col">Requires Existing System?</th>
                  <th scope="col">Information Needed to Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Business Websites</th>
                  <td>Outdated presence, launching new venture</td>
                  <td>Poor mobile performance, low enquiries</td>
                  <td>No (clean build)</td>
                  <td>Brand offer, target audience, page structure</td>
                </tr>
                <tr>
                  <th scope="row">Custom Software</th>
                  <td>Spreadsheets bursting, manual ops bottlenecks</td>
                  <td>Data errors, duplicate records, access gaps</td>
                  <td>Optional (can migrate spreadsheets)</td>
                  <td>Workflow map, user roles, current spreadsheets</td>
                </tr>
                <tr>
                  <th scope="row">Software Rescue</th>
                  <td>Stalled project, production instability</td>
                  <td>Crashes, contractor abandonment, brittle code</td>
                  <td>Yes (existing codebase)</td>
                  <td>Repository access, known bugs, deployment setup</td>
                </tr>
                <tr>
                  <th scope="row">Workflow Automation</th>
                  <td>Repetitive administrative copy-pasting</td>
                  <td>Delayed hand-offs, clerical friction</td>
                  <td>Yes (tools to connect)</td>
                  <td>Source triggers, approval boundaries, volume</td>
                </tr>
                <tr>
                  <th scope="row">Integrations & APIs</th>
                  <td>Systems that do not talk to each other</td>
                  <td>Status drift, manual transaction checks</td>
                  <td>Yes (APIs to integrate)</td>
                  <td>Provider API docs, webhook access, test keys</td>
                </tr>
                <tr>
                  <th scope="row">Reconciliation</th>
                  <td>Payment exports & ledger do not agree</td>
                  <td>Unmatched funds, duplicate charges, leakage</td>
                  <td>Yes (statements & ledger)</td>
                  <td>Sample transaction exports, matching rules</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
};
