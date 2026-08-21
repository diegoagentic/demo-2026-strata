/**
 * F84 · F2 p2.2 · Register in OCR (W-9 lands `Ready to Sync`).
 * Story · "The W-9 shows up in the OCR queue as a first-class taxonomy
 * transaction · date-indexed · expiration flag visible."
 * UI · prod OCRTrackingWrapper backdrop + compact status card top-right
 * showing the just-approved W-9 as an active first-class transaction ·
 * confirms continuity from p2.1 → this queue.
 *
 * F84.4 · Diego 2026-08-21 · "lo que acabamos de aprobar en el modal
 * anterior debería verse como otra tab · dejémoslo activo allí." Prod
 * OCRTracking uses fixed mock data · we can't inject a W-9 row without
 * touching the prod file. Instead we overlay a compact chip that
 * confirms the just-approved W-9 is now a first-class transaction in
 * the Ready to Sync tab · presenter can point to it without losing the
 * prod queue context below.
 */

import { CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import OCRTrackingWrapper from '../../../vendor/prod-imports/wrappers/OCRTrackingWrapper'

export default function F2_p2_W9Registry() {
    const { nextStep } = useDemo()
    return (
        <div className="relative min-h-screen">
            <OCRTrackingWrapper />

            {/* F84.4 · Just-approved W-9 pinned top-right · header shape
                mirrors prod cards (icon + short title + status pill · muted
                meta strip · single primary CTA). z-40 sits below modal
                layer (z-[400]) but above the prod wrapper content. */}
            <div className="fixed top-32 right-6 z-40 w-[360px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                        <h3 className="text-sm font-bold text-foreground">Warehouse by Design · W-9</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success">
                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                            Ready to Sync
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center justify-between">
                            <span>Filename</span>
                            <span className="text-foreground font-mono">WBD_W-9_signed.pdf</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>OCR confidence</span>
                            <span className="text-foreground tabular-nums font-semibold">92%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Fields extracted</span>
                            <span className="text-foreground tabular-nums">5 / 5</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Signed date</span>
                            <span className="text-foreground">2026-03-12</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Expires</span>
                            <span className="text-warning">2027-03-12 · alert 30d before</span>
                        </div>
                    </div>
                    <div className="pt-2 border-t border-border text-[11px] text-muted-foreground leading-relaxed">
                        First-class taxonomy transaction · appears in the Ready to Sync tab of the OCR queue · same shell Compliance uses for bills.
                    </div>
                </div>
                <button
                    onClick={nextStep}
                    className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 hover:opacity-90 transition-opacity"
                >
                    Sync to NetSuite
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
            </div>
        </div>
    )
}
