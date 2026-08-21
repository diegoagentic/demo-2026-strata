/**
 * F84 · F2 p2.1 · Read W-9 (structured intake · Document Review).
 * Story · "Kelly uploads a W-9 · Strata reads 5 fields with confidence."
 * UI · prod DocumentReviewModal over OCR queue backdrop.
 */

import { useState } from 'react'
import { useDemo } from '../../../context/DemoContext'
import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'
import DocumentReviewModal from '../../../vendor/prod-imports/deps/ocr/DocumentReviewModal'
import type { OcrDocCardData } from '../../../vendor/prod-imports/deps/ocr/OcrDocCard'

const W9_DOC: OcrDocCardData = {
    id: 'WBD-W9-2026-08-14',
    name: 'WarehouseByDesign_W-9_signed.pdf',
    vendor: 'Warehouse by Design',
    type: 'Quote',
    status: 'capturing',
    lineItems: 5,
    date: '2026-08-14',
}

export default function F2_p1_W9Intake() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
            <DocumentReviewModal
                isOpen={open}
                onClose={() => { setOpen(false); nextStep() }}
                doc={W9_DOC}
            />
        </div>
    )
}
