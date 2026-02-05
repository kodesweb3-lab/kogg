'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--bg-layer)] border border-[var(--border-default)] rounded-lg p-6">
            <h2 className="text-xl font-heading font-bold text-[var(--accent)] mb-4">
              Something went wrong
            </h2>
            <p className="text-[var(--text-muted)] mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-[var(--bg-base)] font-heading font-bold rounded-lg transition-colors"
            >
              Retry
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-[var(--text-muted)]">
                  Error details
                </summary>
                <pre className="mt-2 text-xs bg-[var(--bg-elevated)] p-3 rounded overflow-auto max-h-48">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export both named and default for flexibility
export { ErrorBoundary };
export default ErrorBoundary;
