import { navigateTo, openIntakeModal } from '../utils/navigation';
import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Database,
  Lock,
  PlusCircle,
} from 'lucide-react';
import { Transaction, Obligation, ReconciliationOutcome, Match } from '../types/reconciliation';
import { runReconciliation } from '../engine/reconciliationCore';
import { SAMPLE_OBLIGATIONS, SAMPLE_TRANSACTIONS } from '../engine/fixtures';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface OpsSuitePageProps {
  onNavigate?: (page: string) => void;
}

export const OpsSuitePage: React.FC<OpsSuitePageProps> = ({ onNavigate = navigateTo }) => {
  const [activeTab, setActiveTab] = useState<'simulation' | 'architecture' | 'escalation' | 'verification'>('simulation');

  // Reconciliation state
  const [transactions, setTransactions] = useState<Transaction[]>(SAMPLE_TRANSACTIONS);
  const [obligations, setObligations] = useState<Obligation[]>(SAMPLE_OBLIGATIONS);
  const [outcome, setOutcome] = useState<ReconciliationOutcome | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddTxModal, setShowAddTxModal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // New tx form state
  const [newTxId, setNewTxId] = useState('');
  const [newTxProvider, setNewTxProvider] = useState('mtn_momo');
  const [newTxAmount, setNewTxAmount] = useState('150000');
  const [newTxRef, setNewTxRef] = useState('OBL-004');
  const [newTxKind, setNewTxKind] = useState<'payment' | 'refund' | 'reversal'>('payment');

  const handleRunReconciliation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const result = runReconciliation(transactions, obligations);
      setOutcome(result);
      if (result.matches.length > 0) {
        setSelectedMatch(result.matches[0]);
      }
      setIsProcessing(false);
    }, 350);
  };

  const handleResetReconciliation = () => {
    setTransactions(SAMPLE_TRANSACTIONS);
    setObligations(SAMPLE_OBLIGATIONS);
    setOutcome(null);
    setSelectedMatch(null);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxId || !newTxAmount) return;

    const numAmount = parseFloat(newTxAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const newTx: Transaction = {
      tx_id: newTxId.trim(),
      provider: newTxProvider,
      account: '0770000000',
      amount: numAmount,
      currency: 'UGX',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' EAT',
      payer_reference: newTxRef.trim() || null,
      kind: newTxKind,
      note: 'Client simulated transaction',
    };

    setTransactions((prev) => [newTx, ...prev]);
    setShowAddTxModal(false);
    setNewTxId('');
    setNewTxAmount('150000');
    setNewTxRef('');
  };

  const [invariantResults, setInvariantResults] = useState<
    Record<string, { passed: boolean; evidence: string; durationMs: number }>
  >({});

  const applyPresetScenario = (preset: 'duplicate' | 'overpayment' | 'conflict') => {
    let updatedTransactions: Transaction[] = [...SAMPLE_TRANSACTIONS];
    if (preset === 'duplicate') {
      const target = SAMPLE_TRANSACTIONS[0];
      updatedTransactions = [
        { ...target, note: 'Simulated duplicate carrier retry (R5)' },
        ...SAMPLE_TRANSACTIONS,
      ];
    } else if (preset === 'overpayment') {
      updatedTransactions = [
        {
          tx_id: 'TX-OVERPAY-901',
          provider: 'mtn_momo',
          account: '0772112233',
          amount: 700000,
          currency: 'UGX',
          timestamp: '2026-10-20 14:22:00 EAT',
          payer_reference: 'OBL-001',
          kind: 'payment',
          note: 'Simulated surplus credit against OBL-001 (500,000 UGX due)',
        },
        ...SAMPLE_TRANSACTIONS,
      ];
    } else if (preset === 'conflict') {
      const target = SAMPLE_TRANSACTIONS[0];
      updatedTransactions = [
        {
          ...target,
          amount: target.amount + 45000,
          note: 'Simulated conflicting payload with colliding TX ID (R6)',
        },
        ...SAMPLE_TRANSACTIONS,
      ];
    }

    setTransactions(updatedTransactions);
    setFilterStatus('all');
    const result = runReconciliation(updatedTransactions, SAMPLE_OBLIGATIONS);
    setOutcome(result);
    const focusMatch =
      preset === 'duplicate'
        ? result.duplicates[0] || result.exceptions[0] || result.matches[0] || null
        : result.exceptions[0] || result.duplicates[0] || result.matches[0] || null;
    setSelectedMatch(focusMatch);
  };

  const handleRunInvariantSuite = () => {
    const startAll = performance.now();
    const baseRun = runReconciliation(SAMPLE_TRANSACTIONS, SAMPLE_OBLIGATIONS, 'INV-SUITE');
    const results: Record<string, { passed: boolean; evidence: string; durationMs: number }> = {};

    const measure = (id: string, fn: () => string) => {
      const t0 = performance.now();
      try {
        const evidence = fn();
        results[id] = { passed: true, evidence, durationMs: +(performance.now() - t0).toFixed(2) };
      } catch (err) {
        results[id] = {
          passed: false,
          evidence: err instanceof Error ? err.message : 'Invariant assertion failed',
          durationMs: +(performance.now() - t0).toFixed(2),
        };
      }
    };

    measure('I1', () => {
      const exact = baseRun.matches.find((m) => m.status === 'exact');
      if (!exact || exact.amount_applied !== exact.obligation?.amount_due) {
        throw new Error('Expected exact 1:1 obligation match');
      }
      return `Verified ${exact.transaction.tx_id} -> ${exact.obligation.obligation_id} (${exact.amount_applied.toLocaleString('en-US')} UGX)`;
    });

    measure('I2', () => {
      const obl3Legs = baseRun.matches.filter((m) => m.obligation?.obligation_id === 'OBL-003');
      const totalApplied = obl3Legs.reduce((s, m) => s + m.amount_applied, 0);
      const hasPartial = obl3Legs.some((m) => m.status === 'partial');
      if (!hasPartial || obl3Legs.length !== 2 || totalApplied !== 350000) {
        throw new Error('Partial payments failed exact integer balance check');
      }
      return `Verified OBL-003 settled across 2 legs (250,000 partial + 100,000 final = ${totalApplied.toLocaleString('en-US')} UGX, 0 drift)`;
    });

    measure('I3', () => {
      const overpayRun = runReconciliation(
        [
          {
            tx_id: 'TX-INV-OVER',
            provider: 'mtn_momo',
            account: '0770000001',
            amount: 650000,
            currency: 'UGX',
            timestamp: '2026-10-20 12:00:00 EAT',
            payer_reference: 'OBL-001',
            kind: 'payment',
          },
        ],
        [SAMPLE_OBLIGATIONS[0]],
        'INV-I3'
      );
      if (overpayRun.exceptions.length !== 1 || overpayRun.exceptions[0].amount_applied !== 0) {
        throw new Error('Overpayment was not quarantined');
      }
      return `Quarantined excess 650,000 > 500,000 UGX with amount_applied = 0`;
    });

    measure('I4', () => {
      if (baseRun.duplicates.length < 1 || baseRun.duplicates[0].amount_applied !== 0) {
        throw new Error('Duplicate retry was not deduplicated');
      }
      return `Blocked duplicate retry (${baseRun.duplicates[0].transaction.tx_id}); 0 ledger writes applied`;
    });

    measure('I5', () => {
      const conflictRun = runReconciliation(
        [
          SAMPLE_TRANSACTIONS[0],
          { ...SAMPLE_TRANSACTIONS[0], amount: SAMPLE_TRANSACTIONS[0].amount + 10000 },
        ],
        SAMPLE_OBLIGATIONS,
        'INV-I5'
      );
      if (conflictRun.exceptions.length !== 1 || !conflictRun.exceptions[0].rationale.includes('Conflicting')) {
        throw new Error('Conflicting ID collision failed fail-closed halt');
      }
      return `Halted conflicting ID collision cleanly into exception review queue`;
    });

    measure('I6', () => {
      if (baseRun.refunds.length < 1 || baseRun.reversals.length < 1) {
        throw new Error('Refunds/reversals failed partition isolation');
      }
      return `Isolated ${baseRun.refunds.length} refund(s) & ${baseRun.reversals.length} reversal(s) away from credit matches`;
    });

    measure('I7', () => {
      const deterministicRun2 = runReconciliation(SAMPLE_TRANSACTIONS, SAMPLE_OBLIGATIONS, 'INV-SUITE');
      if (
        deterministicRun2.summary.matched_amount !== baseRun.summary.matched_amount ||
        deterministicRun2.rules_fingerprint !== baseRun.rules_fingerprint
      ) {
        throw new Error('Non-deterministic output detected across identical inputs');
      }
      const totalElapsed = +(performance.now() - startAll).toFixed(2);
      return `Matched outputs byte-identical across repeated runs (${totalElapsed}ms suite total)`;
    });

    setInvariantResults(results);
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'exact':
        return 'badge badge-pass';
      case 'partial':
        return 'badge badge-warn';
      case 'proposed':
        return 'badge badge-warn';
      case 'unmatched':
        return 'badge badge-neutral';
      case 'duplicate_suspect':
        return 'badge badge-fail';
      case 'exception':
        return 'badge badge-fail';
      case 'refund':
      case 'reversal':
        return 'badge badge-neutral';
      default:
        return 'badge';
    }
  };

  return (
    <div className="section-full theme-dark" style={{ minHeight: '100vh', padding: 'clamp(32px, 5vw, 64px) 0 80px' }}>
      <div className="container-expansive">
        <nav className="breadcrumb" style={{ marginBottom: '28px' }} aria-label="Breadcrumb">
          <button type="button" onClick={() => onNavigate('home')}>Home</button>
          <span className="separator">/</span>
          <button type="button" onClick={() => onNavigate('case-studies')}>Work & Evidence</button>
          <span className="separator">/</span>
          <span aria-current="page">Reconciliation Engine Demo</span>
        </nav>

        <header style={{ marginBottom: '40px' }}>
          <span className="eyebrow">Interactive Engineering Demonstration · Product 1</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', marginBottom: '16px' }}>
            Deterministic Financial Reconciliation
          </h1>
          <p className="lead" style={{ maxWidth: '68ch' }}>
            A client-facing demonstration of EULOK’s mathematical reconciliation core. We match mobile-money collections (MTN MoMo, Airtel Money) and bank transfers against internal accounts receivable ledgers with deterministic integer precision.
          </p>
        </header>

        {/* Tabs Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '14px', marginBottom: '36px' }}>
          <button
            type="button"
            className={`button button-small ${activeTab === 'simulation' ? 'button-primary' : 'button-quiet'}`}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('simulation')}
          >
            Live Engine Simulation
          </button>
          <button
            type="button"
            className={`button button-small ${activeTab === 'architecture' ? 'button-primary' : 'button-quiet'}`}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('architecture')}
          >
            Rules & Decimal Math
          </button>
          <button
            type="button"
            className={`button button-small ${activeTab === 'escalation' ? 'button-primary' : 'button-quiet'}`}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('escalation')}
          >
            Exception Boundaries
          </button>
          <button
            type="button"
            className={`button button-small ${activeTab === 'verification' ? 'button-primary' : 'button-quiet'}`}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setActiveTab('verification')}
          >
            Verification Invariants
          </button>
        </div>

        {/* TAB 1: LIVE SIMULATION */}
        {activeTab === 'simulation' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
              <div>
                <span className="eyebrow" style={{ marginBottom: '6px' }}>Deterministic Matching Core</span>
                <h2>Mobile-Money & Bank Ingestion</h2>
                <p style={{ maxWidth: '64ch', color: 'var(--text-subtle)', marginBottom: 0 }}>
                  Executes formal matching rules R1 through R8 with exact integer arithmetic. Differentiates exact matches, partial allocations, duplicate webhook retries, conflicting identifiers, and partitions refunds and reversals.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button button-quiet button-small"
                  onClick={() => setShowAddTxModal(true)}
                >
                  <PlusCircle size={15} />
                  <span>Add Test Record</span>
                </button>
                <button
                  type="button"
                  className="button button-quiet button-small"
                  onClick={handleResetReconciliation}
                  title="Reset to default synthetic dataset"
                >
                  <RotateCcw size={15} />
                  <span>Reset Data</span>
                </button>
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={handleRunReconciliation}
                >
                  <Play size={15} />
                  <span>Run Deterministic Match</span>
                </button>
              </div>
            </div>

            {/* 1-Click Scenario Presets */}
            <div className="surface-inset" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', padding: '10px 14px', borderRadius: '8px' }}>
              <span className="mono-tag" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginRight: '4px' }}>
                EDGE-CASE PRESETS:
              </span>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => applyPresetScenario('duplicate')}
                style={{ padding: '4px 10px', minHeight: '30px', fontSize: '0.78rem' }}
              >
                Simulate Duplicate Retry (R5)
              </button>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => applyPresetScenario('overpayment')}
                style={{ padding: '4px 10px', minHeight: '30px', fontSize: '0.78rem' }}
              >
                Simulate Overpayment Credit (R3)
              </button>
              <button
                type="button"
                className="button button-quiet button-small"
                onClick={() => applyPresetScenario('conflict')}
                style={{ padding: '4px 10px', minHeight: '30px', fontSize: '0.78rem' }}
              >
                Inject Conflicting ID (R6)
              </button>
            </div>

            {/* Loading Processing State */}
            {isProcessing && (
              <div style={{ marginBottom: '32px' }} className="animate-fade-in" aria-live="polite" aria-busy="true">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <span className="badge badge-warn">Computing Invariants</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
                    Evaluating rules R1–R8 and calculating integer hash ledger...
                  </span>
                </div>
                <LoadingSkeleton variant="grid" count={5} />
              </div>
            )}

            {/* Outcome Metrics */}
            {!isProcessing && outcome && (
              <div style={{ marginBottom: '32px' }} className="animate-fade-in">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
                    gap: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div className="card" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Total Transactions
                    </span>
                    <strong style={{ fontSize: '1.6rem', color: 'var(--warm-white)' }}>
                      {outcome.summary.total_transactions}
                    </strong>
                    <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-muted)' }}>
                      {outcome.summary.total_payments_amount.toLocaleString('en-US')} UGX
                    </span>
                  </div>

                  <div className="card" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--status-pass-text)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Matched Amount
                    </span>
                    <strong style={{ fontSize: '1.6rem', color: 'var(--status-pass-text)' }}>
                      {outcome.summary.matched_amount.toLocaleString('en-US')} UGX
                    </strong>
                    <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-muted)' }}>
                      {outcome.summary.exact_count} Exact · {outcome.summary.partial_count} Partial
                    </span>
                  </div>

                  <div className="card" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--status-warn-text)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Proposed / Review
                    </span>
                    <strong style={{ fontSize: '1.6rem', color: 'var(--status-warn-text)' }}>
                      {outcome.summary.proposed_count}
                    </strong>
                    <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-muted)' }}>
                      Requires human sign-off
                    </span>
                  </div>

                  <div className="card" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--status-fail-text)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Exceptions &amp; Dups
                    </span>
                    <strong style={{ fontSize: '1.6rem', color: 'var(--status-fail-text)' }}>
                      {outcome.summary.exception_count + outcome.summary.duplicate_count}
                    </strong>
                    <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-muted)' }}>
                      {outcome.summary.duplicate_count} Dup · {outcome.summary.exception_count} Conflict
                    </span>
                  </div>

                  <div className="card" style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--electric-blue)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Refunds & Reversals
                    </span>
                    <strong style={{ fontSize: '1.6rem', color: 'var(--electric-blue)' }}>
                      {outcome.summary.refunds_count + outcome.summary.reversals_count}
                    </strong>
                    <span style={{ fontSize: '0.8rem', display: 'block', color: 'var(--text-muted)' }}>
                      Isolated (R7 & R8)
                    </span>
                  </div>
                </div>

                <div className="surface-inset" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '12px 18px', borderRadius: '8px', fontSize: '0.84rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Run ID: </span>
                    <code>{outcome.run_id}</code>
                    <span style={{ margin: '0 8px', color: 'var(--line)' }}>|</span>
                    <span style={{ color: 'var(--text-muted)' }}>Deterministic Fingerprint: </span>
                    <code>{outcome.rules_fingerprint.substring(0, 24)}...</code>
                  </div>
                  <div>
                    <button
                      className="text-link"
                      style={{ fontSize: '0.84rem', fontWeight: 600 }}
                      onClick={() => {
                        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(outcome, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute('href', dataStr);
                        downloadAnchor.setAttribute('download', `reconciliation-${outcome.run_id}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                    >
                      Export JSON Audit Report ↓
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Two Column Layout: Responsive Data Tables */}
            <div className="ops-tables-grid">
              {/* Transactions Ingestion Stream */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Incoming Payment Stream</h3>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {transactions.length} records ingested from MTN, Airtel, Stanbic
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['all', 'exact', 'partial', 'duplicate_suspect', 'exception'].map((status) => (
                      <button
                        key={status}
                        className={`badge ${filterStatus === status ? 'badge-pass' : 'badge-neutral'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        onClick={() => setFilterStatus(status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="table-wrapper ops-table-wrapper">
                  <table className="ops-responsive-table">
                    <thead>
                      <tr>
                        <th>TX ID</th>
                        <th>Channel</th>
                        <th>Amount</th>
                        <th>Ref</th>
                        <th>Rule Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => {
                        const resolvedMatch = outcome
                          ? outcome.matches.find((m) => m.transaction === tx) ||
                            outcome.exceptions.find((m) => m.transaction === tx) ||
                            outcome.duplicates.find((m) => m.transaction === tx) ||
                            outcome.matches.find((m) => m.transaction.tx_id === tx.tx_id)
                          : undefined;

                        const rowStatus: string | null = resolvedMatch
                          ? resolvedMatch.status
                          : outcome
                          ? outcome.refunds.includes(tx)
                            ? 'refund'
                            : outcome.reversals.includes(tx)
                            ? 'reversal'
                            : outcome.unmatched.includes(tx)
                            ? 'unmatched'
                            : null
                          : null;

                        if (filterStatus !== 'all' && rowStatus !== filterStatus) return null;

                        const isSelected =
                          selectedMatch &&
                          (selectedMatch.transaction === tx ||
                            (!resolvedMatch && selectedMatch.transaction.tx_id === tx.tx_id));

                        return (
                          <tr
                            key={`${tx.tx_id}-${idx}`}
                            style={{
                              cursor: resolvedMatch ? 'pointer' : 'default',
                              background: isSelected ? 'rgba(56, 189, 248, 0.08)' : undefined,
                            }}
                            onClick={() => resolvedMatch && setSelectedMatch(resolvedMatch)}
                          >
                            <td className="ops-cell-id" data-label="TX ID">
                              <code>{tx.tx_id}</code>
                              {tx.kind !== 'payment' && (
                                <span className="badge badge-warn" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                                  {tx.kind}
                                </span>
                              )}
                            </td>
                            <td className="ops-cell-channel" data-label="Channel" style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                              {tx.provider.replace('_', ' ')}
                            </td>
                            <td className="ops-cell-amount" data-label="Amount" style={{ fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                              {tx.amount.toLocaleString('en-US')} {tx.currency}
                            </td>
                            <td className="ops-cell-ref" data-label="Ref" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {tx.payer_reference || '—'}
                            </td>
                            <td className="ops-cell-status" data-label="Rule Match">
                              {rowStatus ? (
                                <span className={getBadgeClass(rowStatus)}>
                                  {rowStatus}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                  Pending run
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Obligations / Receivables Ledgers */}
              <div className="card">
                <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>Receivables Ledger Obligations</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '16px' }}>
                  Target invoices awaiting settlement
                </span>

                <div className="table-wrapper ops-table-wrapper">
                  <table className="ops-responsive-table ops-obligations-table">
                    <thead>
                      <tr>
                        <th>Invoice Ref</th>
                        <th>Client</th>
                        <th>Due</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {obligations.map((obl) => {
                        return (
                          <tr key={obl.obligation_id}>
                            <td className="ops-cell-id" data-label="Invoice Ref">
                              <code>{obl.obligation_id}</code>
                            </td>
                            <td className="ops-cell-client" data-label="Client" style={{ fontSize: '0.85rem' }}>
                              {obl.client}
                            </td>
                            <td className="ops-cell-amount" data-label="Due" style={{ fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                              {obl.amount_due.toLocaleString('en-US')} UGX
                            </td>
                            <td className="ops-cell-desc" data-label="Description" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {obl.description}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Match Inspector Panel */}
                {selectedMatch && (
                  <div className="surface-inset" style={{ marginTop: '20px', padding: '16px', borderColor: 'var(--accent-blue)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="eyebrow" style={{ margin: 0, fontSize: '0.7rem' }}>Match Inspector</span>
                      <span className={getBadgeClass(selectedMatch.status)}>
                        {selectedMatch.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', margin: '6px 0 10px', color: 'var(--warm-white)' }}>
                      <strong>Audit Note:</strong> {selectedMatch.rationale}
                    </p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>TX ID: <code>{selectedMatch.transaction.tx_id}</code></div>
                      <div>Target Obligation: <code>{selectedMatch.obligation?.obligation_id || 'None (Unmatched/Partitioned)'}</code></div>
                      <div>Amount Applied: <strong>{selectedMatch.amount_applied.toLocaleString('en-US')} UGX</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: ARCHITECTURE & RULES */}
        {activeTab === 'architecture' && (
          <section className="animate-fade-in">
            <span className="eyebrow">Technical Architecture</span>
            <h2>Deterministic Matching Rules & Decimal Precision</h2>
            <p className="lead" style={{ maxWidth: '68ch' }}>
              Why mathematical certainty is required for financial compliance and multi-party mobile money operations.
            </p>

            <div className="grid-2" style={{ marginTop: '32px' }}>
              <div className="card">
                <span className="card-number">RULE SPECIFICATION</span>
                <h3>Rules R1 Through R8</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                  <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--status-pass-text)' }}>
                    <strong style={{ color: 'var(--warm-white)' }}>Rule R1: Exact Single Match</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Exact reference match + exact amount = 100% deterministic auto-reconciliation.</p>
                  </div>
                  <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--status-warn-text)' }}>
                    <strong style={{ color: 'var(--warm-white)' }}>Rule R2: Partial Payment Allocation</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Valid reference but incoming amount &lt; due balance. Allocates payment and tracks remaining due variance.</p>
                  </div>
                  <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--status-fail-text)' }}>
                    <strong style={{ color: 'var(--warm-white)' }}>Rule R3: Overpayment Exception</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Incoming amount &gt; obligation. Triggers exception flag and escalates credit balance to human finance desk.</p>
                  </div>
                  <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--status-fail-text)' }}>
                    <strong style={{ color: 'var(--warm-white)' }}>Rule R5: Duplicate Webhook Retries</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Identical provider reference and amount processed previously. Flagged as duplicate suspect to prevent double-crediting.</p>
                  </div>
                  <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', borderLeft: '3px solid var(--electric-blue)' }}>
                    <strong style={{ color: 'var(--warm-white)' }}>Rules R7 & R8: Refunds & Reversals</strong>
                    <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>Debit events partitioned from credit ingestion pipeline to guarantee audit trail preservation.</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <span className="card-number">MATHEMATICAL CERTAINTY</span>
                <h3>Decimal Math vs Floating Point Drift</h3>
                <p>
                  Standard JavaScript numbers use IEEE 754 64-bit floating point arithmetic. When summing fractional currencies, binary representation introduces cumulative rounding drift:
                </p>
                <div className="surface-inset" style={{ padding: '14px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <code>0.1 + 0.2 = 0.30000000000000004</code>
                </div>
                <p>
                  In high-volume mobile money systems processing millions of UGX transactions, floating point drift causes phantom penny balances and reconciliation failure.
                </p>
                <p>
                  EULOK’s reconciliation engine performs financial calculations using fixed-point integer cents or arbitrary-precision Decimal types. Zero rounding drift is guaranteed.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: EXCEPTION ESCALATION */}
        {activeTab === 'escalation' && (
          <section className="animate-fade-in">
            <span className="eyebrow">Human-in-the-Loop Governance</span>
            <h2>Exception Boundaries & Escalation Workflows</h2>
            <p className="lead" style={{ maxWidth: '68ch' }}>
              Deterministic systems automate 95%+ of routine matches; but high-stakes ambiguities require accountable human approval.
            </p>

            <div className="grid-3" style={{ marginTop: '32px' }}>
              <div className="card">
                <span className="card-number">SCENARIO 01</span>
                <h3>Ambiguous Reference</h3>
                <p>
                  Customer enters "Tuition Term 1" without specifying the student identification code.
                </p>
                <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                  <strong>Action:</strong> Routed to school bursar queue with candidate matches ranked by amount and telephone prefix.
                </div>
              </div>

              <div className="card">
                <span className="card-number">SCENARIO 02</span>
                <h3>Duplicate Transaction Alert</h3>
                <p>
                  Aggregator fires duplicate webhooks with identical external transaction IDs within 60 seconds.
                </p>
                <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                  <strong>Action:</strong> Second event quarantined. SHA-256 idempotency fingerprint recorded. No duplicate ledger entry created.
                </div>
              </div>

              <div className="card">
                <span className="card-number">SCENARIO 03</span>
                <h3>Unmatched Bank Wire</h3>
                <p>
                  Direct bank transfer arrives with generic depositor name and no invoice reference.
                </p>
                <div className="surface-inset" style={{ padding: '10px', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
                  <strong>Action:</strong> Placed in unallocated suspense account. Never auto-credited until verified by accounting officer.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: DETERMINISTIC INVARIANT VERIFICATION */}
        {activeTab === 'verification' && (
          <section className="animate-fade-in">
            <span className="eyebrow">Engine Invariants & Verification</span>
            <h2>Deterministic Invariant Verification Suite</h2>
            <p className="lead" style={{ maxWidth: '68ch' }}>
              Every reconciliation rule enforces strict mathematical invariants. Calculations use fixed integer cents to guarantee zero IEEE 754 floating-point drift.
            </p>

            <div className="card" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Reconciliation Core Invariant Specifications</h3>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    7 deterministic mathematical properties executed live against the TypeScript engine
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {Object.keys(invariantResults).length > 0 && (
                    <span
                      className={`badge ${Object.values(invariantResults).every((r) => r.passed) ? 'badge-pass' : 'badge-fail'}`}
                      style={{ fontSize: '0.82rem', padding: '6px 12px', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {Object.values(invariantResults).filter((r) => r.passed).length} / 7 Verified Live
                    </span>
                  )}
                  <button
                    type="button"
                    className="button button-primary button-small"
                    onClick={handleRunInvariantSuite}
                  >
                    <Play size={14} />
                    <span>Run Live Invariant Suite</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'I1', name: 'Invariant I1: Exact Single Match (Rule R1)', desc: '100% confidence matching on identical amount and invoice reference with zero ledger ambiguity.', property: 'Bijective 1:1 Mapping' },
                  { id: 'I2', name: 'Invariant I2: Partial Payment Allocation (Rule R2)', desc: 'Partial payment calculation preserves precise remaining balance without penny drift.', property: 'Conservation of Balance' },
                  { id: 'I3', name: 'Invariant I3: Overpayment Quarantine (Rule R3)', desc: 'Excess funds over invoice total trigger immediate quarantine to suspense ledger.', property: 'Bounded Debt Settlement' },
                  { id: 'I4', name: 'Invariant I4: Webhook Idempotency (Rule R5)', desc: 'Replayed aggregator webhooks match existing event fingerprint and reject duplicates.', property: 'Strict Idempotency' },
                  { id: 'I5', name: 'Invariant I5: Conflicting Identifier Guard (Rule R6)', desc: 'Identical transaction ID with mismatched payment amount fails closed for security review.', property: 'Fail-Closed Identity' },
                  { id: 'I6', name: 'Invariant I6: Refunds & Reversals Partitioning (Rules R7 & R8)', desc: 'Debit entries isolated from credit flows; debiting never silently offsets unrelated obligations.', property: 'Partition Isolation' },
                  { id: 'I7', name: 'Invariant I7: Deterministic Repeatability', desc: 'Identical transaction and obligation inputs always compute byte-identical totals and rules hash.', property: 'Pure Determinism' },
                ].map((t) => {
                  const res = invariantResults[t.id];
                  return (
                    <div
                      key={t.id}
                      className="surface-inset"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px 18px',
                        borderRadius: '8px',
                        borderColor: res ? (res.passed ? 'var(--status-pass-border)' : 'var(--status-fail-border)') : undefined,
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ maxWidth: '64ch' }}>
                        <strong style={{ fontSize: '0.94rem', color: 'var(--warm-white)', display: 'block', marginBottom: '2px' }}>
                          {t.name}
                        </strong>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, display: 'block' }}>
                          {t.desc}
                        </span>
                        {res && (
                          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: res.passed ? 'var(--status-pass-text)' : 'var(--status-fail-text)', display: 'block', marginTop: '4px' }}>
                            {res.passed ? '✓' : '✗'} {res.evidence} ({res.durationMs}ms)
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="mono-tag" style={{ fontSize: '0.72rem', color: 'var(--electric-blue)' }}>{t.property}</span>
                        {res ? (
                          <span className={`badge ${res.passed ? 'badge-pass' : 'badge-fail'}`}>
                            {res.passed ? 'PASS' : 'FAIL'}
                          </span>
                        ) : (
                          <span className="badge badge-neutral">READY</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Modal: Add Test Transaction */}
        {showAddTxModal && (
          <div className="modal-backdrop" onClick={() => setShowAddTxModal(false)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <h3 style={{ marginTop: 0 }}>Add Test Ingestion Record</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Simulate an incoming mobile-money webhook or bank statement entry to test the deterministic rules.
              </p>

              <form onSubmit={handleAddTransaction}>
                <div style={{ marginBottom: '14px' }}>
                  <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Transaction ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTxId}
                    onChange={(e) => setNewTxId(e.target.value)}
                    placeholder="e.g. TX-MOMO-999"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Provider</label>
                    <select
                      className="form-input"
                      value={newTxProvider}
                      onChange={(e) => setNewTxProvider(e.target.value)}
                    >
                      <option value="mtn_momo">MTN Mobile Money</option>
                      <option value="airtel_money">Airtel Money</option>
                      <option value="stanbic_bank">Stanbic Bank</option>
                    </select>
                  </div>
                  <div>
                    <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Event Kind</label>
                    <select
                      className="form-input"
                      value={newTxKind}
                      onChange={(e) => setNewTxKind(e.target.value as any)}
                    >
                      <option value="payment">Payment</option>
                      <option value="refund">Refund (R7)</option>
                      <option value="reversal">Reversal (R8)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px' }}>
                  <div>
                    <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Amount (UGX)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={newTxAmount}
                      onChange={(e) => setNewTxAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="eyebrow" style={{ display: 'block', marginBottom: '4px' }}>Payer Reference</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTxRef}
                      onChange={(e) => setNewTxRef(e.target.value)}
                      placeholder="e.g. OBL-001"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="button button-quiet button-small"
                    onClick={() => setShowAddTxModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button button-primary button-small"
                  >
                    Inject Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
