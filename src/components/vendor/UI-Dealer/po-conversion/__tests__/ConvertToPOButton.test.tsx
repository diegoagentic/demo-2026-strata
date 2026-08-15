import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConvertToPOButton from '../ConvertToPOButton'

// Mock the hooks module
vi.mock('../hooks', () => ({
    useInitiateConversion: () => ({
        loading: false,
        error: null,
        execute: vi.fn().mockResolvedValue(undefined),
    }),
}))

describe('ConvertToPOButton', () => {
    it('renders when quote is APPROVED', () => {
        render(<ConvertToPOButton quoteId="QT-1" quoteStatus="APPROVED" />)
        expect(screen.getByText('Convert to Purchase Orders')).toBeInTheDocument()
    })

    it('is disabled when quote is not APPROVED', () => {
        render(<ConvertToPOButton quoteId="QT-1" quoteStatus="DRAFT" />)
        const btn = screen.getByRole('button')
        expect(btn).toBeDisabled()
    })

    it('is disabled when hasActiveConversion is true', () => {
        render(
            <ConvertToPOButton
                quoteId="QT-1"
                quoteStatus="APPROVED"
                hasActiveConversion
            />
        )
        const btn = screen.getByRole('button')
        expect(btn).toBeDisabled()
    })

    it('opens confirmation dialog on click', () => {
        render(<ConvertToPOButton quoteId="QT-1" quoteStatus="APPROVED" />)
        fireEvent.click(screen.getByText('Convert to Purchase Orders'))
        expect(screen.getByText('Convert to Purchase Orders?')).toBeInTheDocument()
    })

    it('shows 72h snapshot warning in dialog', () => {
        render(<ConvertToPOButton quoteId="QT-1" quoteStatus="APPROVED" />)
        fireEvent.click(screen.getByText('Convert to Purchase Orders'))
        expect(screen.getByText(/72 hours/)).toBeInTheDocument()
    })
})
