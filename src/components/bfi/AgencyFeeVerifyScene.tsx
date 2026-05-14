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

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface AgencyFeeVerifySceneProps {
    onComplete?: () => void
}

export default function AgencyFeeVerifyScene({ onComplete }: AgencyFeeVerifySceneProps) {
    const { nextStep } = useDemo()
    const scenario = 'match' as const
    const [isModalOpen,  setIsModalOpen]  = useState(false)
    const [kanbanCol,    setKanbanCol]    = useState<3 | 4>(3)
    const [verified,     setVerified]     = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        setVerified(true)
        setKanbanCol(4)
        setTimeout(() => { onComplete?.(); nextStep() }, 1400)
    }

    return (
        <div className="space-y-3">

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
