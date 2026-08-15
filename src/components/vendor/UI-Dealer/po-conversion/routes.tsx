// ─────────────────────────────────────────────────────────────────────────────
// FE-12 · PO Conversion — URL-based route configuration
//
// Registers three paths under /po-conversion:
//   /po-conversion               → PODraftsListPage
//   /po-conversion/review/:quoteId → ConversionReviewPage (snapshot review)
//   /po-conversion/:poId         → PODraftsListPage (detail lives in Transactions)
//
// All routes are lazy-loaded, guarded by FeatureFlagGuard (flag off → 404),
// and wrapped in ConversionErrorBoundary.
//
// Route wrapper components bridge React Router's useNavigate into the
// callback-prop API the page components expect — pages stay router-agnostic.
// ─────────────────────────────────────────────────────────────────────────────

import { lazy, Suspense } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import FeatureFlagGuard from './FeatureFlagGuard'
import ConversionErrorBoundary from './ConversionErrorBoundary'
import { PODraftsListSkeleton, ConversionReviewSkeleton } from './skeletons'

// Lazy-loaded pages — each chunk is split at the route boundary
const PODraftsListPage = lazy(() => import('./PODraftsListPage'))
const ConversionReviewPage = lazy(() => import('./ConversionReviewPage'))

// ── Route descriptors ────────────────────────────────────────────────────────
// Useful for breadcrumbs, active-tab detection, and link generation without
// importing the full router.
export const PO_ROUTES = [
    { path: '/po-conversion',                 label: 'Purchase Orders' },
    { path: '/po-conversion/review/:quoteId', label: 'Conversion Review' },
] as const

// ── Route wrapper components ─────────────────────────────────────────────────

function DraftsRoute() {
    const navigate = useNavigate()
    return (
        <Suspense fallback={<PODraftsListSkeleton />}>
            <PODraftsListPage
                onNavigateToDetail={(poId) => navigate(`/po-conversion/${poId}`)}
            />
        </Suspense>
    )
}

function ReviewRoute() {
    const navigate = useNavigate()
    return (
        <Suspense fallback={<ConversionReviewSkeleton />}>
            <ConversionReviewPage
                onBack={() => navigate('/po-conversion')}
                onApprove={() => navigate('/po-conversion')}
            />
        </Suspense>
    )
}

// ── POConversionRoutes ───────────────────────────────────────────────────────
// Mount inside <Route path="/po-conversion/*"> in App.tsx.
// Renders the correct sub-page, guarded and error-bounded.

export function POConversionRoutes() {
    return (
        <ConversionErrorBoundary>
            <FeatureFlagGuard>
                <Routes>
                    {/* /po-conversion */}
                    <Route index element={<DraftsRoute />} />
                    {/* /po-conversion/review/:quoteId */}
                    <Route path="review/:quoteId" element={<ReviewRoute />} />
                    {/* /po-conversion/:poId — detail lives inside Transactions;
                        fall back to drafts list until deep-link support lands */}
                    <Route path=":poId" element={<DraftsRoute />} />
                    {/* Unknown sub-routes → drafts list */}
                    <Route path="*" element={<DraftsRoute />} />
                </Routes>
            </FeatureFlagGuard>
        </ConversionErrorBoundary>
    )
}
