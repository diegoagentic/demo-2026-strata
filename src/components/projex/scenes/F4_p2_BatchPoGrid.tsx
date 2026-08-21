/**
 * F84 · F4 p4.2 · Review PIF line items.
 * Story · "The Coordinator opens the PIF in the Document Review UI to
 * inspect the 300 preliminary order lines · then triggers batch PO
 * generation by saving the doc."
 * UI · prod DocumentReviewModal (Header Fields + Line Items tabs) over
 * ExpertHubTransactionsWrapper (Expert Hub UI stays visible when the
 * modal closes · F84.7 Diego request).
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import DocumentReviewModal from '../../../vendor/prod-imports/deps/ocr/DocumentReviewModal'
import type { OcrDocCardData } from '../../../vendor/prod-imports/deps/ocr/OcrDocCard'

const MWH_PIF_DOC: OcrDocCardData = {
    id: 'MWH-PIF-2026-08-14',
    name: 'MWH_PIF_2026-08-14.xlsx',
    vendor: 'Aspire Design · Lead Designer',
    type: 'Purchase Order',
    status: 'capturing',
    lineItems: 300,
    date: '2026-08-14',
}

export default function F4_p2_BatchPoGrid() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    const dismiss = () => { setOpen(false); nextStep() }
    return (
        <div className="relative min-h-screen">
            <ExpertHubTransactionsWrapper />
            <DocumentReviewModal
                isOpen={open}
                onClose={dismiss}
                doc={MWH_PIF_DOC}
            />
        </div>
    )
}
