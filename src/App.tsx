import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { IntakeWizard } from './components/IntakeWizard';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Breadcrumb } from './components/Breadcrumb';
import { HomePage } from './views/HomePage';
import { ServicesPage } from './views/ServicesPage';
import { PerformanceBuildsPage } from './views/PerformanceBuildsPage';
import { FinanceIntegrationsPage } from './views/FinanceIntegrationsPage';
import { ReconciliationServicePage } from './views/ReconciliationServicePage';
import { RescuePage } from './views/RescuePage';
import { HowWeWorkPage } from './views/HowWeWorkPage';
import { CaseStudiesPage } from './views/CaseStudiesPage';
import { InsightsPage } from './views/InsightsPage';
import { VerificationPage } from './views/VerificationPage';
import { AboutPage } from './views/AboutPage';
import { ContactPage } from './views/ContactPage';
import { StandardsPage } from './views/StandardsPage';
import { SecurityPage } from './views/SecurityPage';
import { PrivacyPage } from './views/PrivacyPage';
import { AccessibilityPage } from './views/AccessibilityPage';
import { OpsSuitePage } from './views/OpsSuitePage';
import { ScopeCalculatorPage } from './views/ScopeCalculatorPage';
import { StatusPage } from './views/StatusPage';

import { SEOHead } from './seo/SEOHead.tsx';
import { applyTheme, getInitialTheme } from './utils/themeManager';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'services':
        return (
          <ServicesPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'services/performance-builds':
        return (
          <PerformanceBuildsPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'services/finance-integrations':
        return (
          <FinanceIntegrationsPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'services/reconciliation':
        return (
          <ReconciliationServicePage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'rescue':
        return (
          <RescuePage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'work':
        return (
          <HowWeWorkPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'case-studies':
        return (
          <CaseStudiesPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'insights':
        return (
          <InsightsPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'verification':
        return (
          <VerificationPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'scope-calculator':
        return (
          <ScopeCalculatorPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'status':
        return <StatusPage onNavigate={handleNavigate} />;
      case 'about':
        return (
          <AboutPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'contact':
        return (
          <ContactPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'standards':
        return (
          <StandardsPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'security':
        return (
          <SecurityPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'privacy':
        return (
          <PrivacyPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'accessibility':
        return (
          <AccessibilityPage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
      case 'ops-suite':
        return <OpsSuitePage onNavigate={handleNavigate} />;
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
          />
        );
    }
  };

  return (
    <>
      <SEOHead pageId={currentPage} />

      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
      />

      {/* Contextual Breadcrumb Navigation */}
      <Breadcrumb currentPage={currentPage} onNavigate={handleNavigate} />

      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          id="main"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{
            duration: shouldReduceMotion ? 0.15 : 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full"
        >
          {/* Reusable Error Boundary wrapping renderPage */}
          <ErrorBoundary onReset={() => setCurrentPage('home')}>
            {renderPage()}
          </ErrorBoundary>
        </motion.main>
      </AnimatePresence>

      <Footer
        onNavigate={handleNavigate}
        onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
      />

      {/* Floating WhatsApp CTA */}
      <FloatingWhatsApp onOpenIntake={() => setIsIntakeModalOpen(true)} />

      {/* Shared Intake Wizard Modal */}
      {isIntakeModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intake-modal-title"
          onClick={() => setIsIntakeModalOpen(false)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px', width: '92%' }}
          >
            <IntakeWizard
              isModal={true}
              onCloseModal={() => setIsIntakeModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};
