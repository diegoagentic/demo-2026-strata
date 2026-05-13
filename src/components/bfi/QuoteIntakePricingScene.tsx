/**
 * COMPONENT: QuoteIntakePricingScene (a1.2)
 * PURPOSE: Agency Fee step 2 — SIF validation via OVNIQ + Discount Calc.
 */

import { Fragment, useState } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban, { BFI_PROCESS_FUNNEL } from './BFIProcessKanban'

interface QuoteIntakePricingSceneProps {
    onApply?: () => void
}

const ACTIVE_COL = 1  // Quote

export default function QuoteIntakePricingScene({ onApply }: QuoteIntakePricingSceneProps) {
    const { nextStep } = useDemo()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        onApply?.()
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* ── Funnel stepper ── */}
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

            {/* ── Process Kanban — Quote active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
                reviewLabel="Continue"
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · validating DOE-2847 vs OmniQuote…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="quote"
                onValidate={handleValidate}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ, SOURCES.CORE_PO] }]} />
        </div>
    )
}
