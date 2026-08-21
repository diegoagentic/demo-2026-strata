/**
 * F84 · F1 p1.1 · AI reads bills (OCR ingest AP mailbox).
 * Story · "Bills flow in overnight · Strata OCR reads them and files them
 * in the queue."
 * UI · prod OCRTrackingWrapper (kanban 6-col) · zero decoration.
 */

import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'

export default function F1_p1_OcrIngest() {
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
        </div>
    )
}
