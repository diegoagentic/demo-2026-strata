import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
    children: ReactNode
    fallbackAction?: () => void
}

interface State {
    hasError: boolean
    error?: Error
}

/**
 * FE-14 — ConversionErrorBoundary
 * Wraps PO conversion features. Shows friendly error with retry action.
 */
export default class ConversionErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined })
        this.props.fallbackAction?.()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                    <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h3>
                    <p className="text-sm text-muted-foreground mb-1 max-w-md">
                        An error occurred while loading the PO conversion view.
                    </p>
                    <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted px-3 py-1 rounded">
                        {this.state.error?.message || 'Unknown error'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-900 bg-brand-300 dark:bg-brand-500 hover:bg-brand-400 rounded-lg transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}
