import { navigateTo, openIntakeModal } from '../utils/navigation';
import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Terminal, Scale, Lock, RefreshCw, Eye } from 'lucide-react';

interface AboutPageProps {
  onNavigate?: (page: string) => void;
  onOpenIntakeModal?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate = navigateTo,
  onOpenIntakeModal = openIntakeModal,
}) => {
  const principles = [
    {
      num: '01',
      title: 'Models propose. Deterministic systems decide.',
      icon: Terminal,
      desc: 'AI can draft code, analyze data patterns, and formulate hypotheses. But consequential business operations, ledger updates, and release decisions must be validated by deterministic tests and human approvals.',
    },
    {
      num: '02',
      title: 'The smallest working change.',
      icon: Scale,
      desc: 'We reject unnecessary full-system rewrites that burn capital without fixing core failures. We isolate boundaries, stabilize failing subsystems, and apply surgical, high-leverage engineering increments.',
    },
    {
      num: '03',
      title: 'Evidence over assertion.',
      icon: CheckCircle2,
      desc: 'We distinguish what has been tested from what is merely assumed. A working prototype in a sandbox is not proof of production readiness; test artifacts, reproduction traces, and logs are.',
    },
    {
      num: '04',
      title: 'Explicit failure over silent decay.',
      icon: RefreshCw,
      desc: 'Integrations and background processes must fail loudly into monitored exception queues rather than silently discarding records, corrupting state, or reporting false 200 OK statuses.',
    },
    {
      num: '05',
      title: 'Isolated boundaries.',
      icon: Lock,
      desc: 'Client systems, financial databases, credentials, and codebases remain strictly partitioned. Production keys never touch source control, and restricted customer records never touch unauthorized third-party services.',
    },
    {
      num: '06',
      title: 'Accountable stewardship.',
      icon: Eye,
      desc: 'Every project is scoped with honest deliverables, exclusions, and limitations. When software is delivered, client teams receive the architectural documentation and operational guides needed to own it.',
    },
  ];

  return (
    <div className="page-wrapper">
      {/* Breadcrumb */}
      <nav className="container-expansive breadcrumb-nav" aria-label="Breadcrumb">
        <button onClick={() => onNavigate('home')} className="breadcrumb-link">Home</button>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">About EULOK</span>
      </nav>

      {/* Hero Header */}
      <header className="page-hero-header">
        <div className="container-expansive">
          <span className="eyebrow">About EULOK</span>
          <h1 className="hero-heading" style={{ maxWidth: '24ch' }}>
            Engineering for the systems businesses depend on.
          </h1>
          <p className="hero-subheading" style={{ maxWidth: '64ch' }}>
            EULOK is an independent software engineering practice founded by Eugene Olok in Kampala, Uganda, operating remotely worldwide. We build, stabilize, and modernize critical operational systems.
          </p>
        </div>
      </header>

      {/* Point of View */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ maxWidth: '68ch' }}>
            <span className="eyebrow">Point of View</span>
            <h2>Software should make important work clearer and more dependable.</h2>
            <p className="text-large" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Software must not add another layer of fragility and uncertainty to a business. We start with the actual business workflow, trace where errors originate, and engineer the most reliable solution that fulfills the need.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Often this means building a tailored operational portal or automated reconciliation engine. Just as often, it means diagnosing an abandoned codebase, stabilizing fragile webhook integrations, or proving that a multimillion-dollar rewrite is unnecessary.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '28px' }}>
              <button className="button button-primary" onClick={onOpenIntakeModal}>
                <span>Discuss a project</span>
                <ArrowRight size={14} />
              </button>
              <button className="button button-quiet" onClick={() => onNavigate('work')}>
                <span>Our 6-stage delivery model</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering Principles */}
      <section className="section-padded section-alt">
        <div className="container-expansive">
          <span className="eyebrow">Operational Standards</span>
          <h2 style={{ marginBottom: '32px' }}>Our Six Engineering Principles</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {principles.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.num} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span className="mono-tag" style={{ color: 'var(--electric-blue)' }}>{p.num}</span>
                    <Icon size={20} color="var(--accent-blue)" />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '10px' }}>{p.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, flexGrow: 1 }}>
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership & Location */}
      <section className="section-padded">
        <div className="container-expansive">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'center' }}>
            <div>
              <span className="eyebrow">Founder & Principal</span>
              <h2>Eugene Olok</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
                Principal engineer and founder of EULOK. With a background spanning full-stack web architectures, distributed systems, and financial reconciliation workflows, Eugene leads technical discovery, architecture design, and high-stakes implementation.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
                Based in Kampala, Uganda, EULOK partners with companies in East Africa, the UK, Europe, and North America. Every project receives direct senior engineering oversight—no junior delegating, no offshore black boxes.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="button button-quiet" onClick={() => onNavigate('contact')}>
                  <span>Get in touch</span>
                  <ArrowRight size={14} />
                </button>
                <button className="button button-quiet" onClick={() => onNavigate('insights')}>
                  <span>Read technical notes</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="card" style={{ background: 'var(--deep-navy)', borderColor: 'var(--line)' }}>
              <span className="mono-tag" style={{ color: 'var(--accent-blue)', marginBottom: '14px', display: 'inline-block' }}>
                EULOK Practice Overview
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Focus</div>
                  <div style={{ fontWeight: 600, color: 'var(--warm-white)' }}>Software rescue, payment reconciliation, operational platforms</div>
                </li>
                <li style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontWeight: 600, color: 'var(--warm-white)' }}>Kampala, Uganda (UTC+3) · Remote Worldwide</div>
                </li>
                <li style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Contract Structure</div>
                  <div style={{ fontWeight: 600, color: 'var(--warm-white)' }}>Fixed-scope milestones with deterministic acceptance criteria</div>
                </li>
                <li>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Verification Standard</div>
                  <div style={{ fontWeight: 600, color: 'var(--warm-white)' }}>51-Point Acceptance Gate checklist before release</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Empty State Section for Testimonials */}
      <section className="section-padded section-alt">
        <div className="container-expansive">
          <div style={{ maxWidth: '640px' }}>
            <span className="eyebrow">Publication Standard</span>
            <h2>Evidence over marketing claims.</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              We do not fabricate client logos, invent unverified testimonials, or inflate metric percentages. Client case studies are published only with explicit written authorization and reproducible performance benchmarks.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
              In the meantime, you can explore our synthetic demonstrations and live technical benchmarks in the case studies archive.
            </p>
            <div style={{ marginTop: '24px' }}>
              <button className="button button-quiet" onClick={() => onNavigate('case-studies')}>
                <span>View demonstrations & benchmarks</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
