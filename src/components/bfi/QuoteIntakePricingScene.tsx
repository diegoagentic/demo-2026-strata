/**
 * COMPONENT: QuoteIntakePricingScene (a1.2)
 * PURPOSE: Agency Fee step 2 — SIF validation via OVNIQ + Discount Calc.
 */

import { useState } from 'react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface QuoteIntakePricingSceneProps {
    onApply?: () => void
}

const ACTIVE_COL = 1  // Quote

export default function QuoteIntakePricingScene({ onApply }: QuoteIntakePricingSceneProps) {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        onApply?.()
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — Quote active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
                reviewLabel="Continue"
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · validating DOE-2847 vs Quote Tool…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="quote"
                onValidate={handleValidate}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ, SOURCES.CORE_PO] }]} />
        </div>
    )
}
