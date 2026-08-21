/**
 * F84 · F3 p3.2 · Review proforma.
 * Story · "Isabella reviews the Fairport 40% proforma draft · $58,240."
 * UI · prod DocumentReviewModal over Transactions backdrop.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import DocumentReviewModal from '../../../vendor/prod-imports/deps/ocr/DocumentReviewModal'
import type { OcrDocCardData } from '../../../vendor/prod-imports/deps/ocr/OcrDocCard'

const PROFORMA_DOC: OcrDocCardData = {
    id: 'PJX-PRO-3421',
    name: 'Fairport_40pct_Proforma.pdf',
    vendor: 'Fairport HQ · phase 2',
    type: 'Quote',
    status: 'in_progress',
    lineItems: 12,
    date: '2026-08-21',
}

export default function F3_p2_ProformaReview() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <ExpertHubTransactionsWrapper />
            <DocumentReviewModal
                isOpen={open}
                onClose={() => { setOpen(false); nextStep() }}
                doc={PROFORMA_DOC}
            />
        </div>
    )
}
