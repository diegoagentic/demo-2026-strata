/**
 * F84 · F5 p5.2 · Compare PO ⇄ ACK (Acknowledgement comparison + data update).
 * Story · "Strata matches Teknion ACK to PO · 71 lines · 13 CRs surfaced ·
 * Coordinator resolves · PMO placeholders updated."
 * UI · prod ComparisonReviewModal over OCR queue backdrop.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'
import ComparisonReviewModal from '../../../vendor/prod-imports/deps/comparison/ComparisonReviewModal'
import { PROJEX_F5_ACK_PO_REPORT } from '../../../config/profiles/projex-data/comparisonReports'

export default function F5_p2_AckPoCompare() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    const dismiss = () => { setOpen(false); nextStep() }
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
            <ComparisonReviewModal
                isOpen={open}
                onClose={dismiss}
                report={PROJEX_F5_ACK_PO_REPORT}
                processing={false}
                onDecision={dismiss}
            />
        </div>
    )
}
