/**
 * COMPONENT: AgencyFeeVerifyScene (a1.4)
 * PURPOSE: Agency Fee step 4 — Patricia reviews fee vs MK Invoice.
 *
 * FLOW:
 *   Email notification slides in after 900ms (from Lauren — invoice forwarded)
 *   → click notification → modal opens (step="fee") → Patricia reviews
 *   → optionally "Return to Lauren" back-channel
 *   → "Confirm Fee" → modal closes → success banner → card moves to Fee Verify (col 4)
 */

import { useState, useEffect } from 'react'
import { CheckCircle2, Mail, Sparkles, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface AgencyFeeVerifySceneProps {
    onComplete?: () => void
}

const NOTIF = {
    from:    'lauren.demarco@bfifurniture.com',
    role:    'Account Manager · BFI',
    subject: 'OmniQuote invoice forwarded · DOE-2847 · Fee verification requested',
    preview: 'Hi Patricia, the OmniQuote approved invoice ($6,920) for Purchase Order DOE-2847 is attached. CPR reconciliation is complete — please review and confirm the agency fee.',
    cta:     'Review fee →',
}

export default function AgencyFeeVerifyScene({ onComplete }: AgencyFeeVerifySceneProps) {
    const { nextStep } = useDemo()
    const scenario = 'match' as const
    const [showNotif,    setShowNotif]    = useState(false)
    const [isModalOpen,  setIsModalOpen]  = useState(false)
    const [kanbanCol,    setKanbanCol]    = useState<3 | 4>(3)
    const [verified,     setVerified]     = useState(false)

    useEffect(() => {
        const t = setTimeout(() => setShowNotif(true), 900)
        return () => clearTimeout(t)
    }, [])

    const handleOpenModal = () => {
        setShowNotif(false)
        setIsModalOpen(true)
    }

    const handleValidate = () => {
        setIsModalOpen(false)
        setVerified(true)
        setKanbanCol(4)
        setTimeout(() => { onComplete?.(); nextStep() }, 1400)
    }

    return (
        <div className="space-y-3">

            {/* Email notification */}
            {showNotif && !verified && (
                <button
                    onClick={handleOpenModal}
                    className="w-full text-left animate-in fade-in slide-in-from-top-3 duration-400 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden group"
                >
                    {/* Header strip */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                        <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-foreground truncate">Strata AI · New message from Lauren D.</p>
                            <p className="text-[10px] text-muted-foreground truncate">{NOTIF.from} · {NOTIF.role}</p>
                        </div>
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>

                    {/* Body */}
                    <div className="px-4 py-3 space-y-1">
                        <p className="text-[12px] font-bold text-foreground">{NOTIF.subject}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{NOTIF.preview}</p>
                    </div>

                    {/* CTA */}
                    <div className="px-4 py-2.5 border-t border-border/60 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-primary">{NOTIF.cta}</span>
                        <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </button>
            )}

            {/* Success banner — appears after verification */}
            {verified && (
                <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-400">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    <p className="text-[12px] font-bold text-success">
                        DOE-2847 complete · Agency fee verified · $6,920 confirmed
                    </p>
                </div>
            )}

            {/* Process Kanban */}
            <BFIProcessKanban
                activeCol={kanbanCol}
                showDoe={true}
                doeSubtitle={kanbanCol === 3
                    ? 'OmniQuote invoice attached · fee verification pending'
                    : (scenario === 'match' ? 'Agency fee verified · Patricia Hayes' : 'Fee gap · −$315 · Flag pending')
                }
                onReviewDoe={!verified && !showNotif ? handleOpenModal : undefined}
                highlightReview={!verified && !showNotif}
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
