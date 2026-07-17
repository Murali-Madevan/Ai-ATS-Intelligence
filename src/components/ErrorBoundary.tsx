import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-8">
          <div className="max-w-md rounded-2xl border border-danger/30 bg-card p-8 text-center shadow-xl">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-danger" />
            <h2 className="mb-2 text-xl font-bold text-text">Something went wrong</h2>
            <p className="mb-4 text-sm text-text-secondary">
              {this.state.error.message || 'An unexpected error occurred.'}
            </p>
            <pre className="mb-6 max-h-40 overflow-auto rounded-lg bg-surface p-3 text-left text-xs text-text-secondary">
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
            >
              <RotateCcw className="h-4 w-4" />
              Start Over
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
