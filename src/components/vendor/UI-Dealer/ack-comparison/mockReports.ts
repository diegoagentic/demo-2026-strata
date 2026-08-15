/**
 * Shared mock reports for the PO vs ACK comparison.
 *
 * Consumed by AckReviewSlideOver (panel surface) and AckDetail (inline panel),
 * so both surfaces stay in sync. Replace with a real fetch once Ticket C
 * (back-nest-graphql-gateway GW-02) lands.
 */

import type { AckComparisonReport } from './ComparisonSummaryPanel'

export const MOCK_AIS_REPORT: AckComparisonReport = {
    ackId: 'ACK-3099',
    poId: '#ORD-2055',
    vendor: 'AIS — Affordable Interior Systems',
    comparisonStatus: 'PARTIAL_MATCH',
    comparedAt: 'Apr 10, 2026 08:42 AM',
    fields: [
        { field: 'Vendor Name', category: 'header', poValue: 'AIS', ackValue: 'AIS', status: 'match' },
        { field: 'PO Number', category: 'header', poValue: '#ORD-2055', ackValue: '#ORD-2055', status: 'match' },
        { field: 'Ship-To Address', category: 'logistics', poValue: '1200 Commerce Dr, Dallas TX', ackValue: '1200 Commerce Dr, Dallas TX', status: 'match' },
        { field: 'Line 1: Qty (Rec Table)', category: 'line-item', poValue: '4', ackValue: '4', status: 'match' },
        { field: 'Line 5: Finish (Lounge)', category: 'line-item', poValue: 'Ocean Blue', ackValue: 'Azure Blue', status: 'partial', autoFixSuggestion: 'Manufacturer substituted Ocean Blue with Azure — same fabric grade. No price impact.', confidence: 95, severity: 'low' },
        { field: 'Line 5: Qty (Lounge 2-Seat)', category: 'line-item', poValue: '2', ackValue: '0', status: 'mismatch', autoFixSuggestion: 'Item backordered. Vendor confirmed separate shipment ETA Nov 27, 2025.', confidence: 92, severity: 'high' },
        { field: 'Line 7: Qty (Triple Locker)', category: 'line-item', poValue: '8', ackValue: '6', status: 'mismatch', autoFixSuggestion: '2 units on allocation — ETA +3 weeks. Suggest partial acceptance.', confidence: 88, severity: 'high' },
        { field: 'Estimated Ship Date', category: 'logistics', poValue: 'Nov 15, 2025', ackValue: 'Nov 27, 2025', status: 'partial', autoFixSuggestion: 'Ship date pushed 12 days due to backorder. Within tolerance.', confidence: 90, severity: 'medium' },
        { field: 'Freight Terms', category: 'terms', poValue: 'Prepaid & Add', ackValue: 'Prepaid & Add', status: 'match' },
        { field: 'Payment Terms', category: 'terms', poValue: 'Net 30', ackValue: 'Net 30', status: 'match' },
        { field: 'Total Amount', category: 'pricing', poValue: '$27,494.11', ackValue: '$25,398.72', status: 'mismatch', autoFixSuggestion: 'Delta -$2,095.39 driven by backordered items. Will reconcile on second shipment.', confidence: 96, severity: 'high' },
    ]
}

/** Pretend-fetch by ackId. Returns the AIS report for the demo, null otherwise. */
export function getMockComparisonReport(ackId?: string): AckComparisonReport | null {
    if (!ackId) return MOCK_AIS_REPORT
    if (ackId === 'ACK-3099') return MOCK_AIS_REPORT
    return null
}
