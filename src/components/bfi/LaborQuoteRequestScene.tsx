/**
 * COMPONENT: LaborQuoteRequestScene (a1.2b2)
 * PURPOSE: Lauren sends a labor quote request to WIG (Workplace Installation Group).
 *          Michael Boyle (BFI Director of Strategic Accounts) reviews WIG's response
 *          and compiles the labor figures before forwarding to Lauren for proposal
 *          compilation.
 *
 * Pattern: same wrapper as QuoteIntakePricingScene — BFIProcessKanban + opens
 * BFIDocumentReviewModal (step="labor-request") on review action. Keeps visual
 * consistency with the rest of the BFI Agency Fee flow (funnel + 2-panel modal).
 */

import { useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

const ACTIVE_COL = 2  // PO & Labor

export default function LaborQuoteRequestScene() {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        nextStep?.()
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — PO & Labor active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                doeSubtitle="Labor quote pending · WIG"
                onReviewDoe={() => setIsModalOpen(true)}
                reviewLabel="Draft request"
                highlightReview={!isModalOpen}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · drafting labor quote request to WIG for DOE-2847…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="labor-request"
                onValidate={handleValidate}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
