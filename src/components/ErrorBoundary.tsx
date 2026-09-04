/**
 * React Error Boundary Component
 * Phase 12 - Performance, Polish & Production Hardening
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          background: 'radial-gradient(ellipse at center, rgba(20, 24, 38, 0.95) 0%, rgba(8, 10, 16, 0.98) 100%)',
          color: '#e2e8f0',
          padding: '2rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          boxSizing: 'border-box',
          zIndex: 1000,
        }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
          }}>
            🌌
          </div>
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 600,
            margin: '0 0 0.5rem 0',
            color: '#38bdf8',
          }}>
            {this.props.fallbackTitle || 'A cosmic disturbance occurred'}
          </h2>
          <p style={{
            fontSize: '0.9rem',
            maxWidth: '450px',
            color: '#94a3b8',
            lineHeight: 1.5,
            marginBottom: '1.5rem',
          }}>
            The visualization subsystem encountered an unexpected state. The application remains running safely.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
          >
            Recover & Reset View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
