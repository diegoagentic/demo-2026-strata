import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SubmitPODialog from '../SubmitPODialog'
import * as hooks from '../hooks'

// Mock the hook
vi.mock('../hooks', () => ({
    useSubmitPO: vi.fn(),
}))

describe('SubmitPODialog (SDB-1315)', () => {
    const mockExecute = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(hooks.useSubmitPO).mockReturnValue({
            execute: mockExecute,
            isSubmitting: false,
            error: null,
        } as any)
    })

    it('renders the compose phase correctly', () => {
        render(
            <SubmitPODialog
                isOpen={true}
                poNumber="PO-1234"
                vendorName="Steelcase"
                totalAmount={53525}
                onClose={() => {}}
            />
        )
        expect(screen.getByText('Submit PO-1234')).toBeInTheDocument()
        expect(screen.getByText(/Steelcase/i)).toBeInTheDocument()
        expect(screen.getByText(/Delivery method/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Submit to vendor/i })).toBeInTheDocument()
    })

    it('calls onSubmitted after successful submission', async () => {
        mockExecute.mockResolvedValueOnce(undefined)
        const onSubmittedMock = vi.fn()

        render(
            <SubmitPODialog
                isOpen={true}
                poNumber="PO-1234"
                vendorName="Steelcase"
                totalAmount={53525}
                onClose={() => {}}
                onSubmitted={onSubmittedMock}
            />
        )

        const submitBtn = screen.getByRole('button', { name: /Submit to vendor/i })
        fireEvent.click(submitBtn)

        expect(mockExecute).toHaveBeenCalled()
        
        await waitFor(() => {
            expect(screen.getByText('PO submitted successfully')).toBeInTheDocument()
        })
        expect(onSubmittedMock).toHaveBeenCalled()
    })

    it('shows failure state on error', async () => {
        mockExecute.mockRejectedValueOnce(new Error('Network failure'))

        render(
            <SubmitPODialog
                isOpen={true}
                poNumber="PO-1234"
                vendorName="Steelcase"
                totalAmount={53525}
                onClose={() => {}}
            />
        )

        const submitBtn = screen.getByRole('button', { name: /Submit to vendor/i })
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText('Submission failed')).toBeInTheDocument()
            expect(screen.getByText('Network failure')).toBeInTheDocument()
        })
        expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
    })
})
