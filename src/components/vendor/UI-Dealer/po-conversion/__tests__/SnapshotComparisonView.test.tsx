import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SnapshotComparisonView from '../SnapshotComparisonView'
import type { SnapshotDiscrepancy } from '../types'

const MOCK_DISCREPANCIES: SnapshotDiscrepancy[] = [
    {
        fieldName: 'Leap V2 Unit Price',
        snapshotValue: '$1,295.00',
        currentValue: '$1,395.00',
        severity: 'HIGH',
        type: 'price_change',
    },
    {
        fieldName: 'Shipping line',
        snapshotValue: '',
        currentValue: '$250.00',
        severity: 'LOW',
        type: 'item_added',
    },
    {
        fieldName: 'Gesture Chair Qty',
        snapshotValue: '10',
        currentValue: '8',
        severity: 'MEDIUM',
        type: 'quantity_change',
    },
]

describe('SnapshotComparisonView', () => {
    it('renders match state when no discrepancies', () => {
        render(<SnapshotComparisonView discrepancies={[]} />)
        expect(screen.getByText('Snapshot matches current quote')).toBeInTheDocument()
    })

    it('renders discrepancy count in header', () => {
        render(<SnapshotComparisonView discrepancies={MOCK_DISCREPANCIES} />)
        expect(screen.getByText('3 discrepancies detected')).toBeInTheDocument()
    })

    it('renders summary banner with type counts', () => {
        render(<SnapshotComparisonView discrepancies={MOCK_DISCREPANCIES} />)
        expect(screen.getByText('1 price change')).toBeInTheDocument()
        expect(screen.getByText('1 qty change')).toBeInTheDocument()
        expect(screen.getByText('1 added')).toBeInTheDocument()
    })

    it('renders severity badges', () => {
        render(<SnapshotComparisonView discrepancies={MOCK_DISCREPANCIES} />)
        expect(screen.getByText('High')).toBeInTheDocument()
        expect(screen.getByText('Low')).toBeInTheDocument()
        expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    it('renders matching fields count', () => {
        render(
            <SnapshotComparisonView
                discrepancies={MOCK_DISCREPANCIES}
                matchingFieldCount={18}
            />
        )
        expect(screen.getByText('18 fields match')).toBeInTheDocument()
    })

    it('expands row to show resolution buttons on click', () => {
        render(<SnapshotComparisonView discrepancies={MOCK_DISCREPANCIES} />)
        const row = screen.getByText('Leap V2 Unit Price').closest('button')
        if (row) fireEvent.click(row)
        expect(screen.getByText(/Use snapshot/)).toBeInTheDocument()
        expect(screen.getByText(/Use current/)).toBeInTheDocument()
    })

    it('tracks resolved count', () => {
        render(<SnapshotComparisonView discrepancies={MOCK_DISCREPANCIES} />)
        expect(screen.getByText('0/3 resolved')).toBeInTheDocument()
    })
})
