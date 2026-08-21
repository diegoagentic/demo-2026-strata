/**
 * F84 · F1 p1.2 · Match PO ⇄ Bill (Comparison modal · PO AP comparison).
 * Story · "Strata matches Teknion bill to PO to the penny · surfaces 3
 * exceptions for Accounting."
 * UI · prod ComparisonReviewModal over OCR queue backdrop.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'
import ComparisonReviewModal from '../../../vendor/prod-imports/deps/comparison/ComparisonReviewModal'
import { PROJEX_F1_PO_BILL_REPORT } from '../../../config/profiles/projex-data/comparisonReports'

export default function F1_p2_PoBillCompare() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    const dismiss = () => { setOpen(false); nextStep() }
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
            <ComparisonReviewModal
                isOpen={open}
                onClose={dismiss}
                report={PROJEX_F1_PO_BILL_REPORT}
                processing={false}
                onDecision={dismiss}
            />
        </div>
    )
}
