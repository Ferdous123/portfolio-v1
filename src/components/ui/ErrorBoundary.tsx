"use client";

import React, { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

/**
 * Generic React ErrorBoundary. Wraps any enhanced component.
 * On any thrown error, silently shows the static fallback.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Silent in production; optional debug hook
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default ErrorBoundary;
