import { useState, useEffect, useMemo } from 'react'
import type {
    PurchaseOrderCoreV2, ConversionReview, POTimelineEvent,
    PORevision, POSubmissionAttempt, POArtifact
} from './types'
import {
    MOCK_PO_DRAFTS, MOCK_TIMELINE, MOCK_REVISIONS,
    MOCK_SUBMISSIONS, MOCK_ARTIFACTS
} from './mockData'
import { usePoConversionEnabled } from './usePoConversionEnabled'

/**
 * FE-11 — GraphQL Hook Stubs
 * Currently returns mock data. Replace internals with real Apollo
 * useQuery/useMutation when GW-01/02/03 are deployed to qa.
 */

interface QueryResult<T> {
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => void
}

function useMockQuery<T>(mockData: T, delay = 600): QueryResult<T> {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<T | null>(null)
    const enabled = usePoConversionEnabled()

    useEffect(() => {
        if (!enabled) { setLoading(false); return }
        const t = setTimeout(() => { setData(mockData); setLoading(false) }, delay)
        return () => clearTimeout(t)
    }, [enabled])

    return { data, loading, error: null, refetch: () => { setLoading(true); setTimeout(() => { setData(mockData); setLoading(false) }, delay) } }
}

// ── Queries ──

/** Fetch conversion review for a quote */
export function useConversionReview(_quoteId: string) {
    return useMockQuery<ConversionReview | null>(null, 800)
}

/** Fetch PO drafts for a quote */
export function usePurchaseOrdersByQuote(_quoteId: string) {
    return useMockQuery<PurchaseOrderCoreV2[]>(MOCK_PO_DRAFTS)
}

/** Fetch single PO by ID */
export function usePurchaseOrder(poId: string) {
    const po = useMemo(() => MOCK_PO_DRAFTS.find(p => p.id === poId) || MOCK_PO_DRAFTS[0], [poId])
    return useMockQuery<PurchaseOrderCoreV2>(po)
}

/** Fetch PO timeline events */
export function usePOTimeline(_poId: string) {
    return useMockQuery<POTimelineEvent[]>(MOCK_TIMELINE)
}

/** Fetch PO revisions */
export function usePORevisions(_poId: string) {
    return useMockQuery<PORevision[]>(MOCK_REVISIONS)
}

/** Fetch PO submission history */
export function usePOSubmissions(_poId: string) {
    return useMockQuery<POSubmissionAttempt[]>(MOCK_SUBMISSIONS)
}

/** Fetch PO artifacts */
export function usePOArtifacts(_poId: string) {
    return useMockQuery<POArtifact[]>(MOCK_ARTIFACTS)
}

/** Fetch conversion status for a quote */
export function useConversionStatus(_quoteId: string) {
    return useMockQuery<{ status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; poCount: number }>({ status: 'COMPLETED', poCount: 3 })
}

// ── Mutations ──

interface MutationResult {
    loading: boolean
    error: Error | null
    execute: () => Promise<void>
}

function useMockMutation(delay = 1000): MutationResult {
    const [loading, setLoading] = useState(false)
    return {
        loading,
        error: null,
        execute: async () => { setLoading(true); await new Promise(r => setTimeout(r, delay)); setLoading(false) }
    }
}

/** Initiate quote-to-PO conversion */
export function useInitiateConversion() { return useMockMutation(2000) }

/** Approve a conversion review */
export function useApproveConversion() { return useMockMutation(1000) }

/** Reject a conversion review */
export function useRejectConversion() { return useMockMutation(800) }

/** Finalize a PO (DRAFT → FINALIZED) */
export function useFinalizePO() { return useMockMutation(1200) }

/** Submit a PO to vendor (FINALIZED → SUBMITTED) */
export function useSubmitPO() { return useMockMutation(1500) }
