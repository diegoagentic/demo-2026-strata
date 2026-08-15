import type { PurchaseOrderCoreV2, ConversionReview, POTimelineEvent, PORevision, POSubmissionAttempt, POArtifact } from './types'

export const MOCK_PO_DRAFTS: PurchaseOrderCoreV2[] = [
    {
        id: 'po-001', poNumber: 'PO-2026-0047', quoteId: 'QT-1025',
        vendor: { vendorId: 'v1', vendorName: 'Steelcase', vendorCode: 'STC', contactEmail: 'orders@steelcase.com' },
        orderStatus: 'DRAFT',
        lineItems: [
            { lineItemIndex: 1, productNumber: 'SC-LEAP-BLK', productDescription: 'Leap V2 Task Chair — Black', quantity: 20, productCost: 1295.00, totalProduct: 25900.00 },
            { lineItemIndex: 2, productNumber: 'SC-GEST-GRY', productDescription: 'Gesture Chair — Gray', quantity: 10, productCost: 1495.00, totalProduct: 14950.00 },
            { lineItemIndex: 3, productNumber: 'SC-MIG-DSK', productDescription: 'Migration SE Desk 60x30', quantity: 15, productCost: 845.00, totalProduct: 12675.00 },
        ],
        financial: { poTotalAmount: 53525.00, taxAmount: 4415.81, discountAmount: 5352.50, currency: 'USD' },
        createdAt: '2026-04-08T14:30:00Z', updatedAt: '2026-04-08T14:30:00Z',
    },
    {
        id: 'po-002', poNumber: 'PO-2026-0048', quoteId: 'QT-1025',
        vendor: { vendorId: 'v2', vendorName: 'Herman Miller', vendorCode: 'HMI', contactEmail: 'po@hermanmiller.com' },
        orderStatus: 'FINALIZED',
        lineItems: [
            { lineItemIndex: 1, productNumber: 'HM-AER-REM', productDescription: 'Aeron Remastered — Graphite', quantity: 12, productCost: 1895.00, totalProduct: 22740.00 },
            { lineItemIndex: 2, productNumber: 'HM-EMB-SYN', productDescription: 'Embody Chair — Sync Fabric', quantity: 6, productCost: 1895.00, totalProduct: 11370.00 },
        ],
        financial: { poTotalAmount: 34110.00, taxAmount: 2814.08, discountAmount: 3411.00, currency: 'USD' },
        createdAt: '2026-04-07T10:15:00Z', updatedAt: '2026-04-09T09:00:00Z',
    },
    {
        id: 'po-003', poNumber: 'PO-2026-0049', quoteId: 'QT-1023',
        vendor: { vendorId: 'v3', vendorName: 'Knoll', vendorCode: 'KNL', contactEmail: 'orders@knoll.com' },
        orderStatus: 'SUBMITTED',
        lineItems: [
            { lineItemIndex: 1, productNumber: 'KN-GN304-BLK', productDescription: 'Generation Task Chair', quantity: 30, productCost: 1150.00, totalProduct: 34500.00 },
        ],
        financial: { poTotalAmount: 34500.00, taxAmount: 2846.25, discountAmount: 0, currency: 'USD' },
        createdAt: '2026-04-05T08:00:00Z', updatedAt: '2026-04-10T11:30:00Z',
    },
    {
        id: 'po-004', poNumber: 'PO-2026-0050', quoteId: 'QT-1024',
        vendor: { vendorId: 'v4', vendorName: 'Haworth', vendorCode: 'HWR' },
        orderStatus: 'FAILED',
        lineItems: [
            { lineItemIndex: 1, productNumber: 'HW-FRN-ZDY', productDescription: 'Zody Task Chair', quantity: 8, productCost: 980.00, totalProduct: 7840.00 },
        ],
        financial: { poTotalAmount: 7840.00, taxAmount: 646.80, discountAmount: 0, currency: 'USD' },
        createdAt: '2026-04-06T16:00:00Z', updatedAt: '2026-04-09T14:00:00Z',
    },
]

export const MOCK_TIMELINE: POTimelineEvent[] = [
    { id: 't1', timestamp: '2026-04-08T14:30:00Z', action: 'PO Created', actor: 'System', details: 'Generated from Quote QT-1025 conversion' },
    { id: 't2', timestamp: '2026-04-08T15:00:00Z', action: 'Line Items Validated', actor: 'ProcurementAgent', details: '3 line items validated against catalog' },
    { id: 't3', timestamp: '2026-04-09T09:00:00Z', action: 'PO Finalized', actor: 'Sara Chen', details: 'Approved by dealer admin' },
    { id: 't4', timestamp: '2026-04-10T11:30:00Z', action: 'Submitted to Vendor', actor: 'System', details: 'Sent via EDI to Steelcase' },
    { id: 't5', timestamp: '2026-04-10T11:32:00Z', action: 'Vendor Acknowledged', actor: 'Steelcase', details: 'ACK received — order confirmed' },
]

export const MOCK_REVISIONS: PORevision[] = [
    {
        revisionNumber: 3, timestamp: '2026-04-09T09:00:00Z', actor: 'Sara Chen', changeSummary: 'Finalized — approved for submission',
        diffs: [{ field: 'orderStatus', oldValue: 'DRAFT', newValue: 'FINALIZED', type: 'changed' }]
    },
    {
        revisionNumber: 2, timestamp: '2026-04-08T16:00:00Z', actor: 'Sara Chen', changeSummary: 'Updated quantities for Leap Chair',
        diffs: [
            { field: 'lineItems[0].quantity', oldValue: '25', newValue: '20', type: 'changed' },
            { field: 'lineItems[0].totalProduct', oldValue: '$32,375.00', newValue: '$25,900.00', type: 'changed' },
            { field: 'financial.poTotalAmount', oldValue: '$60,000.00', newValue: '$53,525.00', type: 'changed' },
        ]
    },
    {
        revisionNumber: 1, timestamp: '2026-04-08T14:30:00Z', actor: 'System', changeSummary: 'Initial PO created from quote conversion',
        diffs: [
            { field: 'poNumber', oldValue: '', newValue: 'PO-2026-0047', type: 'added' },
            { field: 'vendor', oldValue: '', newValue: 'Steelcase', type: 'added' },
            { field: 'lineItems', oldValue: '', newValue: '3 items', type: 'added' },
        ]
    },
]

export const MOCK_SUBMISSIONS: POSubmissionAttempt[] = [
    { id: 's1', timestamp: '2026-04-10T11:30:00Z', status: 'DELIVERED', adapter: 'edi', responseCode: 200, message: 'EDI 850 accepted by Steelcase' },
    { id: 's2', timestamp: '2026-04-10T11:28:00Z', status: 'FAILED', adapter: 'email', responseCode: 550, message: 'Mailbox full', errorDetail: 'SMTP 550: User mailbox exceeded storage quota. Contact vendor for updated email.' },
]

export const MOCK_ARTIFACTS: POArtifact[] = [
    { id: 'a1', fileName: 'PO-2026-0047_Steelcase.pdf', format: 'pdf', fileSize: 245000, createdAt: '2026-04-10T11:30:00Z', downloadUrl: '#', type: 'submission_payload' },
    { id: 'a2', fileName: 'PO-2026-0047_EDI850.edi', format: 'edi', fileSize: 12400, createdAt: '2026-04-10T11:30:00Z', downloadUrl: '#', type: 'submission_payload' },
    { id: 'a3', fileName: 'ACK-Steelcase-Apr10.pdf', format: 'pdf', fileSize: 180000, createdAt: '2026-04-10T11:32:00Z', downloadUrl: '#', type: 'confirmation' },
]
