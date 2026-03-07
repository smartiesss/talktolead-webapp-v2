"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, info: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null
  onReset: () => void
}

export function DefaultErrorFallback({ error, onReset }: DefaultErrorFallbackProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-[200px] p-8 text-center"
      data-testid="error-fallback"
    >
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h2>
      {error?.message && (
        <p className="text-sm text-muted mb-4 max-w-md" data-testid="error-message">
          {error.message}
        </p>
      )}
      <Button onClick={onReset} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Try again
      </Button>
    </div>
  )
}

/**
 * Lightweight functional wrapper for simple use-cases.
 * For async errors, use ErrorBoundary class component directly.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  Wrapped.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`
  return Wrapped
}
