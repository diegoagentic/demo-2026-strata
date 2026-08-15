import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import RevisionHistory from '../RevisionHistory'
import type { PORevision } from '../types'

const MOCK_REVISIONS: PORevision[] = [
    {
        revisionNumber: 1,
        timestamp: '2026-04-08T14:30:00Z',
        actor: 'David Park',
        changeSummary: 'Updated Leap V2 quantity from 20 to 25',
        diffs: [
            { field: 'quantity', oldValue: '20', newValue: '25', type: 'changed' },
        ],
    },
    {
        revisionNumber: 2,
        timestamp: '2026-04-09T09:00:00Z',
        actor: 'Sara Chen',
        changeSummary: 'Added shipping line',
        diffs: [
            { field: 'shipping', oldValue: '', newValue: '$350.00', type: 'added' },
        ],
    },
]

describe('RevisionHistory', () => {
    it('renders empty state when no revisions', () => {
        render(<RevisionHistory revisions={[]} />)
        expect(screen.getByText('No revisions yet')).toBeInTheDocument()
    })

    it('renders loading skeleton', () => {
        const { container } = render(<RevisionHistory revisions={[]} loading />)
        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('renders revision numbers', () => {
        render(<RevisionHistory revisions={MOCK_REVISIONS} />)
        expect(screen.getByText('R1')).toBeInTheDocument()
        expect(screen.getByText('R2')).toBeInTheDocument()
    })

    it('renders actor names', () => {
        render(<RevisionHistory revisions={MOCK_REVISIONS} />)
        expect(screen.getByText(/David Park/)).toBeInTheDocument()
        expect(screen.getByText(/Sara Chen/)).toBeInTheDocument()
    })

    it('shows change count badges', () => {
        render(<RevisionHistory revisions={MOCK_REVISIONS} />)
        expect(screen.getAllByText('1 change').length).toBe(2)
    })

    it('expands to show DiffViewer on click', () => {
        render(<RevisionHistory revisions={MOCK_REVISIONS} />)
        const btn = screen.getByText('Updated Leap V2 quantity from 20 to 25').closest('button')
        if (btn) fireEvent.click(btn)
        expect(screen.getByText('quantity')).toBeInTheDocument()
    })

    it('shows compare revisions button when 2+ revisions', () => {
        render(<RevisionHistory revisions={MOCK_REVISIONS} />)
        expect(screen.getByText('Compare revisions')).toBeInTheDocument()
    })

    it('enters compare mode on toggle', () => {
        render(<RevisionHistory revisions={MOCK_REVISIONS} />)
        fireEvent.click(screen.getByText('Compare revisions'))
        expect(screen.getByText('Select the first revision')).toBeInTheDocument()
    })
})
