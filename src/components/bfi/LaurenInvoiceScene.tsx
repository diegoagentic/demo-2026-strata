/**
 * COMPONENT: LaurenInvoiceScene (a1.3c)
 * PURPOSE: Lauren uploads the OmniQuote approved invoice to the CPR attachments.
 *          Strata AI detects it's the approved invoice → prominent detection banner.
 *          Lauren forwards it to Patricia (Finance/AR) to initiate fee verification.
 *
 * FLOW:
 *   Email notification slides in after 900ms (from Michael — final quote ready)
 *   → click notification → modal opens (invoiceUpload mode, Attachments tab)
 *   → AI activation animation → upload zone → simulate upload → detection → Forward
 *   → nextStep() → a1.4 (Agency Fee Verify)
 */

import { useState, useEffect } from 'react'
import { Mail, Sparkles, ChevronRight } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

const ACTIVE_COL = 3

const NOTIF = {
    from:    'michael.chen@bfifurniture.com',
    role:    'Account Manager · BFI',
    subject: 'Final Labor Quote ready · DOE-2847 · Invoice upload requested',
    preview: 'Hi Lauren, the CPR-adjusted quote ($6,920) has been approved and sent. Please upload the OmniQuote approved invoice to complete the fee verification process.',
    cta:     'Upload invoice →',
}

export default function LaurenInvoiceScene() {
    const { nextStep } = useDemo()
    const [showNotif,   setShowNotif]   = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

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
        nextStep()
    }

    return (
        <div className="space-y-3">

            {/* Email notification */}
            {showNotif && (
                <button
                    onClick={handleOpenModal}
                    className="w-full text-left animate-in fade-in slide-in-from-top-3 duration-400 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all overflow-hidden group"
                >
                    {/* Header strip */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                        <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 text-ai" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-foreground truncate">Strata AI · New message from Michael C.</p>
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

            {/* CPR kanban */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={handleOpenModal}
                highlightReview={!showNotif}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · invoice upload pending…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.OVNIQ] }]} />

            {/* CPR modal — invoiceUpload mode */}
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
