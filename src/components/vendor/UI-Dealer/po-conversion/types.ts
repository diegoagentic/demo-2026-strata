/**
 * FE-11 — PO Conversion TypeScript Types
 * Aligned with V2 entities from the GraphQL gateway.
 */

// ── Enums ──
export type POStatus = 'DRAFT' | 'FINALIZED' | 'SUBMITTED' | 'FAILED'
export type ConversionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type DiscrepancySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type SubmissionAdapter = 'email' | 'edi' | 'portal'
export type SubmissionStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'

// ── Core Entities (V2) ──
export interface PoVendorV2 {
    vendorId: string
    vendorName: string
    vendorCode: string
    contactEmail?: string
}

export interface PoLineItemV2 {
    lineItemIndex: number
    productNumber: string
    productDescription: string
    quantity: number
    productCost: number
    totalProduct: number
    unitOfMeasure?: string
}

export interface PoFinancialV2 {
    poTotalAmount: number
    taxAmount: number
    discountAmount: number
    shippingAmount?: number
    currency: string
}

export interface PurchaseOrderCoreV2 {
    id: string
    poNumber: string
    quoteId: string
    vendor: PoVendorV2
    orderStatus: POStatus
    lineItems: PoLineItemV2[]
    financial: PoFinancialV2
    createdAt: string
    updatedAt: string
}

// ── Conversion Review ──
export interface ConversionReview {
    id: string
    quoteId: string
    status: ConversionStatus
    frozenSnapshot: QuoteSnapshot
    vendorSplit: VendorSplitPreview[]
    discrepancies: SnapshotDiscrepancy[]
    expiresAt: string // 72h countdown
    createdAt: string
}

export interface QuoteSnapshot {
    quoteNumber: string
    customer: string
    project: string
    totalAmount: number
    lineItems: SnapshotLineItem[]
    metadata: Record<string, string>
}

export interface SnapshotLineItem {
    index: number
    productNumber: string
    description: string
    quantity: number
    unitPrice: number
    total: number
    vendor: string
}

export interface VendorSplitPreview {
    vendorName: string
    vendorCode: string
    lineItemCount: number
    subtotal: number
    lineItems: SnapshotLineItem[]
}

export interface SnapshotDiscrepancy {
    fieldName: string
    snapshotValue: string
    currentValue: string
    severity: DiscrepancySeverity
    type: 'price_change' | 'quantity_change' | 'item_added' | 'item_removed'
}

// ── Timeline ──
export interface POTimelineEvent {
    id: string
    timestamp: string
    action: string
    actor: string
    details?: string
}

// ── Revisions ──
export interface PORevision {
    revisionNumber: number
    timestamp: string
    actor: string
    changeSummary: string
    diffs: PODiff[]
}

export interface PODiff {
    field: string
    oldValue: string
    newValue: string
    type: 'added' | 'removed' | 'changed'
}

// ── Submission ──
export interface POSubmissionAttempt {
    id: string
    timestamp: string
    status: SubmissionStatus
    adapter: SubmissionAdapter
    responseCode?: number
    message?: string
    errorDetail?: string
}

// ── Artifacts ──
export interface POArtifact {
    id: string
    fileName: string
    format: 'pdf' | 'csv' | 'edi' | 'xml'
    fileSize: number
    createdAt: string
    downloadUrl: string
    type: 'submission_payload' | 'confirmation' | 'revision_snapshot'
}
