import { type ReactNode } from 'react'
import { usePoConversionEnabled } from './usePoConversionEnabled'

interface FeatureFlagGuardProps {
    children: ReactNode
    fallback?: ReactNode
}

/**
 * FE-13 — FeatureFlagGuard
 * Renders children when PO conversion is enabled.
 * Renders fallback (default: 404) when disabled.
 */
export default function FeatureFlagGuard({ children, fallback }: FeatureFlagGuardProps) {
    const enabled = usePoConversionEnabled()

    if (!enabled) {
        return fallback ?? (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <p className="text-4xl font-bold text-foreground mb-2">404</p>
                <p className="text-sm text-muted-foreground">This feature is not available.</p>
            </div>
        )
    }

    return <>{children}</>
}
