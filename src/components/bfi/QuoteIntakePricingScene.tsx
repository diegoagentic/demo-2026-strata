/**
 * COMPONENT: QuoteIntakePricingScene (a1.2b — unified)
 * PURPOSE: Agency Fee a1.2b — Quote Tool validation + Credit Line push + Labor Quote Request.
 *
 * The modal opens at step="quote". When the credit line is posted and Lauren clicks
 * "Continue to Labor Quote", the modal transitions internally to step="labor-request"
 * (funnel jumps from Quote ✓ to PO & Labor highlighted; RightPanel swaps via key={step}).
 * Only when Michael's compiled labor response is received and Lauren clicks "Continue
 * to Proposal" the modal closes and the wizard advances to a1.2b3.
 */

import { useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal, { type BFIReviewStep } from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface QuoteIntakePricingSceneProps {
    onApply?: () => void
}

const ACTIVE_COL = 1  // Quote

export default function QuoteIntakePricingScene({ onApply }: QuoteIntakePricingSceneProps) {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalStep, setModalStep] = useState<BFIReviewStep>('quote')

    const handleOpen = () => {
        setModalStep('quote')  // always start at quote
        setIsModalOpen(true)
    }

    const handleValidate = () => {
        if (modalStep === 'quote') {
            // Internal transition: stay open, switch to labor-request
            setModalStep('labor-request')
        } else {
            // Labor request received — close modal + advance wizard
            setIsModalOpen(false)
            setModalStep('quote')  // reset for re-entry
            onApply?.()
            nextStep()
        }
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — Quote active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={handleOpen}
                reviewLabel="Continue"
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · validating DOE-2847 vs Quote Tool…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step={modalStep}
                onValidate={handleValidate}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ, SOURCES.CORE_PO] }]} />
        </div>
    )
}
