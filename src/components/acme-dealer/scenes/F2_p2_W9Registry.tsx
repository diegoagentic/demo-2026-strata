/**
 * F84 · F2 p2.2 · Register in OCR (W-9 lands as first-class taxonomy transaction).
 * Story · "The W-9 shows up in the OCR queue · date-indexed · expiration
 * flag visible · linked to the compliance folder · ready to sync to NetSuite."
 *
 * F84.21 · Diego 2026-08-21 · p2.2 must show visible change from p2.1:
 *   - Open the DocumentReviewModal on the "Linked Documents" tab so the
 *     presenter sees the W-9 registered as attached (initialTab='linked').
 *   - AC notif fires the `acme-dealer:w9-registered` event · Shell advances to
 *     p2.3 when the user clicks Sync to NetSuite via the AC.
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
    // F84.21 · processed status signals the W-9 is filed / registered,
    // not still capturing · matches the "Ready to Sync" AC notif state.
    status: 'processed',
    lineItems: 5,
    date: '2026-08-14',
}

export default function F2_p2_W9Registry() {
    const { nextStep } = useDemo()
    const [open, setOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
            <DocumentReviewModal
                isOpen={open}
                onClose={() => { setOpen(false); nextStep() }}
                doc={W9_DOC}
                initialTab="linked"
            />
        </div>
    )
}
