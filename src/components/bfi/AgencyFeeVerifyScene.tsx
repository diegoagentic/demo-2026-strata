/**
 * COMPONENT: AgencyFeeVerifyScene (a1.4)
 * PURPOSE: Agency Fee step 4 — Expected fee vs MK Invoice verification.
 */

import { Fragment, useState } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban, { BFI_PROCESS_FUNNEL } from './BFIProcessKanban'

interface AgencyFeeVerifySceneProps {
    onComplete?: () => void
}

const ACTIVE_COL = 4  // Fee Verify

export default function AgencyFeeVerifyScene({ onComplete }: AgencyFeeVerifySceneProps) {
    const { nextStep } = useDemo()
    const [scenario, setScenario] = useState<'match' | 'gap'>('match')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        onComplete?.()
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* Demo scenario selector */}
            <div className="flex items-center gap-1.5 justify-end">
                <span className="text-[9px] text-muted-foreground">Demo:</span>
                {(['match', 'gap'] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setScenario(s)}
                        className={`text-[9px] px-2 py-0.5 rounded border transition-all capitalize ${
                            scenario === s
                                ? 'bg-foreground text-background border-foreground'
                                : 'border-border text-muted-foreground hover:border-foreground/40'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

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

            {/* Status banner */}
            <div className={`border rounded-xl px-3 py-2.5 flex items-center gap-2 ${
                scenario === 'match'
                    ? 'bg-success/5 border-success/20'
                    : 'bg-warning/5 border-warning/20'
            }`}>
                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${scenario === 'match' ? 'text-success' : 'text-warning'}`} />
                <p className={`text-[11px] font-medium ${scenario === 'match' ? 'text-success' : 'text-warning'}`}>
                    {scenario === 'match'
                        ? 'Agency fee verified · MK Invoice matches T-code calculation · Ready to confirm'
                        : 'Agency fee gap detected · MK Invoice $4,505 vs expected $4,820 · Gap: −$315'
                    }
                </p>
            </div>

            {/* ── Process Kanban — Fee Verify active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                doeSubtitle={scenario === 'match' ? 'Agency fee verified · Patricia Reyes' : 'Fee gap · −$315 · Flag pending'}
                onReviewDoe={() => setIsModalOpen(true)}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · verifying agency fee…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="fee"
                scenario={scenario}
                onValidate={handleValidate}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
