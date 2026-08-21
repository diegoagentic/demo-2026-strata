/**
 * F84 · F2 p2.2 · Register in OCR (W-9 lands `Ready to Sync`).
 * Story · "The W-9 shows up in the OCR queue as a first-class taxonomy
 * transaction · date-indexed · expiration flag visible."
 * UI · prod OCRTrackingWrapper · scene body pass-through.
 */

import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'

export default function F2_p2_W9Registry() {
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
        </div>
    )
}
