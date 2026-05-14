/**
 * COMPONENT: LaurenInvoiceScene (a1.3c)
 * PURPOSE: Lauren uploads the OmniQuote approved invoice to the CPR attachments.
 *          Strata AI detects it's the approved invoice → prominent detection banner.
 *          Lauren forwards it to Patricia (Finance/AR) to initiate fee verification.
 *
 * FLOW:
 *   CPR kanban (same view as 1.8/1.9) → modal auto-opens on Attachments tab
 *   → upload zone → simulate upload → Strata detection → Forward to Patricia dialog
 *   → nextStep() → a1.4 (Agency Fee Verify)
 */

import { useState, Fragment } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban, { BFI_PROCESS_FUNNEL } from './BFIProcessKanban'

const ACTIVE_COL = 3

export default function LaurenInvoiceScene() {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        nextStep()
    }

    return (
        <div className="space-y-3">
            {/* Funnel stepper */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {BFI_PROCESS_FUNNEL.map((step, i) => {
                    const active = i === ACTIVE_COL
                    const past   = i < ACTIVE_COL
                    return (
                        <Fragment key={step.id}>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all shrink-0 ${
                                active ? 'bg-primary text-primary-foreground shadow-sm'
                                : past  ? 'bg-muted/60 text-foreground/70'
                                :         'bg-muted/30 text-muted-foreground'
                            }`}>
                                <span className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                                    active ? 'bg-primary-foreground/20'
                                    : past  ? 'bg-success/20'
                                    :         'bg-muted/60 text-muted-foreground'
                                }`}>
                                    {past
                                        ? <CheckCircle2 className="h-2.5 w-2.5 text-success" />
                                        : <span className="text-[9px] font-bold">{i + 1}</span>
                                    }
                                </span>
                                {step.label}
                            </div>
                            {i < BFI_PROCESS_FUNNEL.length - 1 && (
                                <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                        </Fragment>
                    )
                })}
            </div>

            {/* CPR kanban */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
                highlightReview
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · reconciling CPR hours…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />

            {/* CPR modal — invoiceUpload mode: Attachments tab + upload zone + detection + Patricia */}
            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="cpr"
                onValidate={handleValidate}
                invoiceUpload
            />
        </div>
    )
}
