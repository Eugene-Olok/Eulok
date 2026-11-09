import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, Copy, CheckCircle2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Fail-closed diagnostic recording
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary caught an unhandled runtime error:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleCopyDiagnostic = () => {
    if (this.state.error && typeof navigator !== 'undefined') {
      const diagnostic = `EULOK Diagnostic Intercept:\nTimestamp: ${new Date().toISOString()}\nMessage: ${this.state.error.message}\nStack: ${this.state.error.stack || 'N/A'}`;
      navigator.clipboard.writeText(diagnostic);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 3000);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          className="container-expansive"
          style={{
            padding: 'clamp(48px, 10vh, 96px) 16px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              background: 'var(--bg-secondary)',
              border: '1px solid rgba(248, 113, 113, 0.4)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
              padding: 'clamp(28px, 5vw, 44px)',
              borderRadius: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <AlertTriangle size={22} color="#f87171" />
              </div>
              <div>
                <span className="mono-tag" style={{ color: '#f87171', display: 'block', marginBottom: '2px' }}>
                  FAIL-CLOSED RUNTIME INTERCEPT
                </span>
                <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--warm-white)' }}>
                  Component Render Fault Contained
                </h2>
              </div>
            </div>

            <p style={{ color: 'var(--text-subtle)', lineHeight: 1.6, fontSize: '0.92rem', marginBottom: '20px' }}>
              An unexpected runtime error occurred while rendering this view. Our architecture isolates the fault to prevent an unhandled crash or state corruption.
            </p>

            {this.state.error && (
              <div
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--line)',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  marginBottom: '24px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  overflowX: 'auto',
                }}
              >
                <code>{this.state.error.message}</code>
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                className="button button-primary"
                onClick={this.handleReset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={15} />
                <span>Try Again</span>
              </button>

              <a
                href="/"
                className="button button-quiet"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Home size={15} />
                <span>Return to Home</span>
              </a>

              <button
                type="button"
                className="button button-quiet"
                onClick={this.handleCopyDiagnostic}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {this.state.copied ? <CheckCircle2 size={15} color="#4ade80" /> : <Copy size={15} />}
                <span>{this.state.copied ? 'Copied' : 'Copy Diagnostics'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
