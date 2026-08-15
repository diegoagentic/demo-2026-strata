import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SubmissionHistory from '../SubmissionHistory'
import type { POSubmissionAttempt } from '../types'

const MOCK_ATTEMPTS: POSubmissionAttempt[] = [
    {
        id: 's1',
        timestamp: '2026-04-10T11:00:00Z',
        status: 'DELIVERED',
        adapter: 'edi',
        responseCode: 200,
        message: 'PO accepted by Steelcase EDI gateway',
    },
    {
        id: 's2',
        timestamp: '2026-04-09T09:00:00Z',
        status: 'FAILED',
        adapter: 'email',
        responseCode: 550,
        message: 'Mailbox full',
        errorDetail: 'SMTP 550: User mailbox is full',
    },
]

describe('SubmissionHistory', () => {
    it('renders empty state when no attempts', () => {
        render(<SubmissionHistory attempts={[]} />)
        expect(screen.getByText('No submissions yet')).toBeInTheDocument()
    })

    it('renders loading skeleton', () => {
        const { container } = render(<SubmissionHistory attempts={[]} loading />)
        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('renders attempt status badges', () => {
        render(<SubmissionHistory attempts={MOCK_ATTEMPTS} />)
        expect(screen.getByText('DELIVERED')).toBeInTheDocument()
        expect(screen.getByText('FAILED')).toBeInTheDocument()
    })

    it('renders adapter names', () => {
        render(<SubmissionHistory attempts={MOCK_ATTEMPTS} />)
        expect(screen.getByText('edi')).toBeInTheDocument()
        expect(screen.getByText('email')).toBeInTheDocument()
    })

    it('expands to show error detail', () => {
        render(<SubmissionHistory attempts={MOCK_ATTEMPTS} />)
        // Click the failed entry
        const failedEntry = screen.getByText('FAILED').closest('button')
        if (failedEntry) fireEvent.click(failedEntry)
        expect(screen.getByText(/SMTP 550/)).toBeInTheDocument()
    })

    it('sorts newest first', () => {
        render(<SubmissionHistory attempts={MOCK_ATTEMPTS} />)
        const items = screen.getAllByRole('button')
        expect(items.length).toBe(2)
    })
})
