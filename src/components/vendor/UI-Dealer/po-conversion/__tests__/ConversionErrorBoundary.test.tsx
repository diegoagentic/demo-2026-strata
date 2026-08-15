import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import ConversionErrorBoundary from '../ConversionErrorBoundary'

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
    if (shouldThrow) throw new Error('kaboom')
    return <div>safe content</div>
}

// Suppress React's expected error logging for the throw cases — keeps test
// output readable without changing behavior.
let consoleError: ReturnType<typeof vi.spyOn>
beforeEach(() => { consoleError = vi.spyOn(console, 'error').mockImplementation(() => {}) })
afterEach(() => { consoleError.mockRestore() })

describe('ConversionErrorBoundary', () => {
    it('renders children when no error is thrown', () => {
        render(
            <ConversionErrorBoundary>
                <Boom shouldThrow={false} />
            </ConversionErrorBoundary>
        )
        expect(screen.getByText('safe content')).toBeInTheDocument()
    })

    it('renders the friendly fallback when a child throws', () => {
        render(
            <ConversionErrorBoundary>
                <Boom shouldThrow={true} />
            </ConversionErrorBoundary>
        )
        expect(screen.getByText('Something went wrong')).toBeInTheDocument()
        expect(screen.getByText('kaboom')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    })

    it('invokes fallbackAction when Try Again is clicked', () => {
        const fallback = vi.fn()
        render(
            <ConversionErrorBoundary fallbackAction={fallback}>
                <Boom shouldThrow={true} />
            </ConversionErrorBoundary>
        )
        fireEvent.click(screen.getByRole('button', { name: /try again/i }))
        expect(fallback).toHaveBeenCalledOnce()
    })
})
