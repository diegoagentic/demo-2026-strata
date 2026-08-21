/**
 * F84 · F4 p4.2 · 26 batch POs generated.
 * Story · "Strata generates 26 vendor POs in one click · Coordinator sees
 * the per-vendor grid."
 * UI · prod PODraftsListPage (UI-Dealer lift) · full-screen grid.
 */

import PODraftsListPage from '../../vendor/UI-Dealer/po-conversion/PODraftsListPage'

export default function F4_p2_BatchPoGrid() {
    return (
        <div className="min-h-screen bg-background">
            <PODraftsListPage />
        </div>
    )
}
