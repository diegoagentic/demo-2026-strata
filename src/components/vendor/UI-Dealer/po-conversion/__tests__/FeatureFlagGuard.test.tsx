import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FeatureFlagGuard from '../FeatureFlagGuard'

// Control the feature flag mock per test
let mockEnabled = true
vi.mock('../usePoConversionEnabled', () => ({
    usePoConversionEnabled: () => mockEnabled,
}))

describe('FeatureFlagGuard', () => {
    it('renders children when flag is enabled', () => {
        mockEnabled = true
        render(
            <FeatureFlagGuard>
                <div>Protected content</div>
            </FeatureFlagGuard>
        )
        expect(screen.getByText('Protected content')).toBeInTheDocument()
    })

    it('renders 404 when flag is disabled', () => {
        mockEnabled = false
        render(
            <FeatureFlagGuard>
                <div>Protected content</div>
            </FeatureFlagGuard>
        )
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('renders custom fallback when provided and flag is off', () => {
        mockEnabled = false
        render(
            <FeatureFlagGuard fallback={<div>Custom 404</div>}>
                <div>Protected content</div>
            </FeatureFlagGuard>
        )
        expect(screen.getByText('Custom 404')).toBeInTheDocument()
    })
})
