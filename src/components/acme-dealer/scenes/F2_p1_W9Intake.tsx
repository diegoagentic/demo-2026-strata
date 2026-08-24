/**
 * F84 · F2 p2.1 · Read W-9 (structured intake · OCR list → notif → Document Review).
 *
 * F84.12 · Diego 2026-08-21 · 3-beat scene inside one step:
 *   1. OCR queue in list mode (prod OCRTrackingWrapper) · presenter sees
 *      the same shell Compliance uses for bills.
 *   2. Action Center notif fires (single canonical channel · zero custom
 *      floating callouts here · Diego F84.13 dedup).
 *   3. AC notif CTA dispatches `acme-dealer:w9-open` · scene opens the prod
 *      DocumentReviewModal · Save/Cancel advances to p2.2.
 *
 * AcmeDealerPage Shell skips its own advance for `acme-dealer:w9-open` via
 * SCENE_HANDLED_EVENTS so we don't double-fire.
 */

import { useEffect, useState } from 'react'
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
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handler = () => setOpen(true)
        window.addEventListener('acme-dealer:w9-open', handler)
        return () => window.removeEventListener('acme-dealer:w9-open', handler)
    }, [])

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
