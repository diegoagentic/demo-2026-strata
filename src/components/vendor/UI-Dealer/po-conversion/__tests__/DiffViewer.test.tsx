import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import DiffViewer from '../DiffViewer'
import type { PODiff } from '../types'

const MOCK_DIFFS: PODiff[] = [
    { field: 'Unit Price', oldValue: '$1,295.00', newValue: '$1,395.00', type: 'changed' },
    { field: 'Shipping', oldValue: '', newValue: '$250.00', type: 'added' },
    { field: 'Discount Line', oldValue: '-$500.00', newValue: '', type: 'removed' },
]

describe('DiffViewer', () => {
    it('renders empty state when no diffs', () => {
        render(<DiffViewer diffs={[]} />)
        expect(screen.getByText('No changes')).toBeInTheDocument()
    })

    it('renders all diff types with correct labels', () => {
        render(<DiffViewer diffs={MOCK_DIFFS} />)
        expect(screen.getByText(/Changed \(1\)/)).toBeInTheDocument()
        expect(screen.getByText(/Added \(1\)/)).toBeInTheDocument()
        expect(screen.getByText(/Removed \(1\)/)).toBeInTheDocument()
    })

    it('shows field names', () => {
        render(<DiffViewer diffs={MOCK_DIFFS} />)
        expect(screen.getByText('Unit Price')).toBeInTheDocument()
        expect(screen.getByText('Shipping')).toBeInTheDocument()
        expect(screen.getByText('Discount Line')).toBeInTheDocument()
    })

    it('shows old and new values for changed type', () => {
        render(<DiffViewer diffs={MOCK_DIFFS} />)
        expect(screen.getByText('$1,295.00')).toBeInTheDocument()
        expect(screen.getByText('$1,395.00')).toBeInTheDocument()
    })

    it('renders in compact mode', () => {
        const { container } = render(<DiffViewer diffs={MOCK_DIFFS} compact />)
        expect(container.querySelector('.text-\\[10px\\]')).toBeTruthy()
    })
})
