/**
 * COMPONENT: AgencyFeeVerifyScene (a1.4)
 * PURPOSE: Agency Fee step 4 — Patricia reviews fee vs MK Invoice.
 *
 * FLOW:
 *   Phase 1 — DOE card in CPR Review (col 3), REVIEW button highlighted
 *   → click REVIEW → modal opens (step="fee") → Patricia reviews
 *   → optionally "Ask Lauren →" back-channel
 *   → "Confirm Fee" → modal closes → success banner → card moves to Fee Verify (col 4)
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

export default function AgencyFeeVerifyScene({ onComplete }: AgencyFeeVerifySceneProps) {
    const { nextStep } = useDemo()
    const [scenario,     setScenario]     = useState<'match' | 'gap'>('match')
    const [isModalOpen,  setIsModalOpen]  = useState(false)
    const [kanbanCol,    setKanbanCol]    = useState<3 | 4>(3)
    const [verified,     setVerified]     = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        setVerified(true)
        setKanbanCol(4)
        setTimeout(() => { onComplete?.(); nextStep() }, 1400)
    }

    const funnelActive = kanbanCol  // 3 → CPR active · 4 → Fee Verify active

    return (
        <div className="space-y-3">

            {/* Demo scenario selector — hidden after verification */}
            {!verified && (
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
            )}

            {/* ── Funnel stepper ── */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {BFI_PROCESS_FUNNEL.map((step, i) => {
                    const active = i === funnelActive
                    const past   = i < funnelActive
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

            {/* Success banner — appears after verification */}
            {verified && (
                <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <p className="text-[12px] font-bold text-success">
                        DOE-2847 complete · Agency fee verified · $6,920 confirmed
                    </p>
                </div>
            )}

            {/* ── Process Kanban — starts at CPR Review (col 3), moves to Fee Verify (col 4) ── */}
            <BFIProcessKanban
                activeCol={kanbanCol}
                showDoe={true}
                doeSubtitle={kanbanCol === 3
                    ? 'OmniQuote invoice attached · fee verification pending'
                    : (scenario === 'match' ? 'Agency fee verified · Patricia Hayes' : 'Fee gap · −$315 · Flag pending')
                }
                onReviewDoe={!verified ? () => setIsModalOpen(true) : undefined}
                highlightReview={!verified}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · verifying agency fee…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="fee"
                scenario={scenario}
                onValidate={handleValidate}
            />
        </div>
    )
}
