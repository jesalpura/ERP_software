import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * ErrorBoundary — catches uncaught React render errors from child components.
 * Prevents the entire app from going blank when a lazy-loaded dashboard or
 * heavy view (e.g. CalendarView, CertificateView) throws during render.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you could send this to a monitoring service (Sentry, etc.)
    console.error('[TCIT ERP] Component error caught by ErrorBoundary:', error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-8 bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900/50 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-7 h-7 text-rose-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-1 leading-relaxed">
            {this.props.label || 'This section'} encountered an unexpected error and could not be displayed.
          </p>
          {this.state.error && (
            <p className="text-[11px] text-rose-400 font-mono bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/50 mb-5 max-w-sm truncate">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
