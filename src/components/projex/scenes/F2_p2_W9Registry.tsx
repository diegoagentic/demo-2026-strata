/**
 * F84 · F2 p2.2 · Register in OCR (W-9 lands as first-class taxonomy transaction).
 * Story · "The W-9 shows up in the OCR queue · date-indexed · expiration
 * flag visible · ready to sync to NetSuite."
 *
 * F84.16 · Diego 2026-08-21 · single canonical channel = Action Center.
 * Removed the previous custom pinned card (F84.4) that duplicated the AC
 * notif. Presenter narrates over the prod OCR queue while the AC notif
 * announces "W-9 registered · ready to sync."
 */

import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'

export default function F2_p2_W9Registry() {
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />
        </div>
    )
}
