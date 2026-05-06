// components/ui/ErrorBoundary.js (upgraded)
'use client';

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, retry: this.reset });
      }
      return (
        <div className="p-6 text-center bg-red-50/10 rounded-2xl">
          <p className="text-red-500">Something went wrong.</p>
          <button onClick={this.reset} className="mt-2 text-sm underline">Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}