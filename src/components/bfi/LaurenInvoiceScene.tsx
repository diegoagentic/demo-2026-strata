/**
 * COMPONENT: LaurenInvoiceScene (a1.3c)
 * PURPOSE: Lauren uploads the OmniQuote approved invoice to the CPR attachments.
 *          Strata AI detects it's the approved invoice → prominent detection banner.
 *          Lauren forwards it to Patricia (Finance/AR) to initiate fee verification.
 *
 * FLOW:
 *   CPR kanban (same view as 1.8/1.9) → modal auto-opens on Attachments tab
 *   → upload zone → simulate upload → Strata detection → Forward to Patricia dialog
 *   → nextStep() → a1.4 (Agency Fee Verify)
 */

import { useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

const ACTIVE_COL = 3

export default function LaurenInvoiceScene() {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* CPR kanban */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
                highlightReview
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · reconciling CPR hours…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />

            {/* CPR modal — invoiceUpload mode: Attachments tab + upload zone + detection + Patricia */}
            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="cpr"
                onValidate={handleValidate}
                invoiceUpload
            />
        </div>
    )
}
