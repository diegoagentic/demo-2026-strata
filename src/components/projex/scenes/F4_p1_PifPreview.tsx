/**
 * F84 · F4 p4.1 · PIF preview + Generate batch POs trigger.
 * Story · "Lead Designer emails a 300-line PIF · Coordinator previews it
 * in the same OCR / Document Review UI and clicks Generate batch POs."
 * UI · prod OCRTrackingWrapper backdrop + DocumentReviewModal (PIF preview).
 * The modal's Save button is the semantic Generate-batch trigger · onClose
 * advances to p4.2 where the batch appears.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'
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

export default function F4_p1_PifPreview() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
            <DocumentReviewModal
                isOpen={open}
                onClose={() => { setOpen(false); nextStep() }}
                doc={MWH_PIF_DOC}
            />
        </div>
    )
}
