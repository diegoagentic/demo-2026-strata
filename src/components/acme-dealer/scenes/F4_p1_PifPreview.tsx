/**
 * F84 · F4 p4.1 · PIF arrives · OCR funnel · file-type highlighted.
 * Story · "The PIF workbook lands in the OCR queue · the AC notif tells
 * the coordinator a new PIF is ready to review."
 * UI · prod OCRTrackingWrapper (funnel · zero modal on mount). Presenter
 * clicks the AC notif CTA which advances to p4.2 for line-item review.
 *
 * F84.7 · Diego 2026-08-21 · split from previous DocumentReviewModal
 * auto-open · path 4 now starts with the OCR funnel alone so stakeholders
 * see the file arrive before the review begins.
 */

import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'

export default function F4_p1_PifPreview() {
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
        </div>
    )
}
