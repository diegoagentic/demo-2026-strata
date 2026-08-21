/**
 * F84 · F4 p4.2 · Review PIF line items → preview the 26 generated POs.
 *
 * F84.32 · Diego 2026-08-21 · 2-phase scene: presenter reviews the PIF in
 * the Document Review modal, closes it, then sees the 26 batch PO drafts
 * (prod PODraftsListPage) with per-card preview + management actions
 * before advancing to p4.3 (Send PO batch by email).
 *
 * Story · "Coordinator confirms the preliminary order lines · Strata
 * generates 26 vendor POs · presenter reviews the batch with quick
 * actions before dispatching."
 */

import { useState } from 'react'
import { ArrowRight, FileText, Send } from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import ExpertHubTransactionsWrapper from '../../../vendor/prod-imports/wrappers/ExpertHubTransactionsWrapper'
import DocumentReviewModal from '../../../vendor/prod-imports/deps/ocr/DocumentReviewModal'
import type { OcrDocCardData } from '../../../vendor/prod-imports/deps/ocr/OcrDocCard'
import PODraftsListPage from '../../vendor/UI-Dealer/po-conversion/PODraftsListPage'

const MWH_PIF_DOC: OcrDocCardData = {
    id: 'MWH-PIF-2026-08-14',
    name: 'MWH_PIF_2026-08-14.xlsx',
    vendor: 'Aspire Design · Lead Designer',
    type: 'Purchase Order',
    status: 'capturing',
    lineItems: 300,
    date: '2026-08-14',
}

export default function F4_p2_BatchPoGrid() {
    const { nextStep } = useDemo()
    const [reviewOpen, setReviewOpen] = useState(true)
    return (
        <div className="relative min-h-screen">
            {reviewOpen && (
                <>
                    <ExpertHubTransactionsWrapper />
                    <DocumentReviewModal
                        isOpen={reviewOpen}
                        onClose={() => setReviewOpen(false)}
                        doc={MWH_PIF_DOC}
                    />
                </>
            )}

            {!reviewOpen && (
                <div className="min-h-screen bg-background">
                    {/* F84.32 · post-review · presenter sees the 26 generated POs
                        in the prod PODraftsListPage · per-card Preview + management
                        actions via the existing grid. Floating CTA advances to
                        p4.3 (Send PO batch by email). */}
                    <PODraftsListPage />

                    <div className="fixed bottom-6 right-6 z-40 w-[400px] bg-card border-2 border-ai/40 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-ai-light px-4 py-3 flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-full bg-ai/20 flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5 text-ai" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-ai">
                                    26 vendor POs generated · ready to send
                                </div>
                                <p className="text-xs text-foreground font-semibold mt-0.5">MWH residential · $487,320</p>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="text-xs text-foreground leading-relaxed">
                                Coordinator reviews per-vendor draft POs · click a card to preview or edit · then send the batch by email in the next step.
                            </div>
                            <button
                                onClick={nextStep}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                Continue · Send PO batch by email
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
