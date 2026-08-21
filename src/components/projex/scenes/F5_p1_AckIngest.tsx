/**
 * F84 · F5 p5.1 · Read ACK (vendor acknowledgements ingested by OCR).
 * Story · "Teknion sends the ACK · Strata OCR reads it and files it in
 * the queue with per-vendor confidence badges."
 * UI · prod OCRTrackingWrapper.
 */

import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'

export default function F5_p1_AckIngest() {
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
        </div>
    )
}
