import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FinalizePOButton from '../FinalizePOButton'

vi.mock('../hooks', () => ({
    useFinalizePO: () => ({
        loading: false,
        error: null,
        execute: vi.fn().mockResolvedValue(undefined),
    }),
}))

describe('FinalizePOButton', () => {
    it('renders "Finalize PO" when DRAFT', () => {
        render(<FinalizePOButton poNumber="PO-001" status="DRAFT" />)
        expect(screen.getByText('Finalize PO')).toBeInTheDocument()
    })

    it('renders "Finalized" when FINALIZED', () => {
        render(<FinalizePOButton poNumber="PO-001" status="FINALIZED" />)
        expect(screen.getByText('Finalized')).toBeInTheDocument()
    })

    it('is hidden when SUBMITTED', () => {
        const { container } = render(<FinalizePOButton poNumber="PO-001" status="SUBMITTED" />)
        expect(container.firstChild).toBeNull()
    })

    it('is hidden when user lacks dealer_admin role', () => {
        const { container } = render(
            <FinalizePOButton poNumber="PO-001" status="DRAFT" hasDealerAdminRole={false} />
        )
        expect(container.firstChild).toBeNull()
    })

    it('opens confirmation dialog on click', () => {
        render(<FinalizePOButton poNumber="PO-001" status="DRAFT" />)
        fireEvent.click(screen.getByText('Finalize PO'))
        expect(screen.getByText(/Finalize PO-001/)).toBeInTheDocument()
    })

    it('shows warning about locked line items', () => {
        render(<FinalizePOButton poNumber="PO-001" status="DRAFT" />)
        fireEvent.click(screen.getByText('Finalize PO'))
        expect(screen.getByText(/locks the line items/)).toBeInTheDocument()
    })
})
