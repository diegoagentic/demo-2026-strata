/**
 * F84 · F3 p3.2 · Review proforma.
 * Story · "Coordinator reviews the Fairport 40% proforma draft · $58,240 ·
 * ready to send to the customer."
 * UI · prod DocumentReviewModal over ExpertHubTransactionsWrapper backdrop.
 *
 * F84.22 · Diego 2026-08-21 · mirror F84.21 pattern applied to F2 p2.2 ·
 * open the modal on the Linked Documents tab so the proforma PDF shows as
 * attached · and mark doc.status='processed' so the file signals "loaded
 * / ready to send" instead of "still capturing." Removes the "nothing
 * changed" perception between p3.1 (deadline alert) and this step.
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
    // F84.22 · processed status signals the proforma is loaded and ready
    // to send · matches the "billing preamble" narrative added in F84.19.
    status: 'processed',
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
                initialTab="linked"
            />
        </div>
    )
}
