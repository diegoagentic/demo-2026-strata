/**
 * COMPONENT: POLaborScene (a1.2c)
 * PURPOSE: Agency Fee step 2c — PO & Labor Quote review + proposal email to NYC DOE.
 *
 * FLOW:
 *   kanban → modal (step="labor") → validate → ProposalEmailView → send → nextStep()
 */

import { useState } from 'react'
import { CheckCircle2, FileText, Send, ArrowLeft, Mail } from 'lucide-react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

interface POLaborSceneProps {
    onConfirm?: () => void
}

const ACTIVE_COL = 2  // PO & Labor

// ─── Proposal Email View ──────────────────────────────────────────────────────

function ProposalEmailView({ onSent }: { onSent: () => void }) {
    const [sent, setSent] = useState(false)

    const handleSend = () => {
        setSent(true)
        setTimeout(() => onSent(), 900)
    }

    return (
        <div className="flex flex-col h-full bg-background">

            {/* Email client header */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card shrink-0">
                <ArrowLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-black text-success">DOE</span>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[11px] font-bold text-foreground leading-none truncate">NYC Dept. of Education</div>
                        <div className="text-[9px] text-muted-foreground leading-none mt-0.5">Procurement Office</div>
                    </div>
                </div>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </div>

            <div className="flex-1 overflow-y-auto">

                {/* Email metadata */}
                <div className="px-4 pt-4 pb-3 border-b border-border/60 space-y-1.5">
                    <div className="text-[13px] font-bold text-foreground leading-snug">
                        Proposal · DOE-2847 · Q-2026-0089 · Delivery Date Request
                    </div>
                    <div className="space-y-0.5">
                        {[
                            { label: 'From', value: 'lauren.demarco@bfifurniture.com' },
                            { label: 'To',   value: 'nycdoe-procurement@schools.nyc.gov' },
                            { label: 'Date', value: 'May 6, 2026 · 10:45 AM' },
                        ].map(r => (
                            <div key={r.label} className="flex items-center gap-2 text-[10px]">
                                <span className="text-muted-foreground w-7 shrink-0">{r.label}:</span>
                                <span className="text-foreground font-medium truncate">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Email body */}
                <div className="px-4 py-4 space-y-3">
                    <div className="text-[12px] text-foreground leading-relaxed space-y-3">
                        <p>Good morning,</p>
                        <p>
                            Please find attached the formal proposal for order{' '}
                            <span className="font-semibold">DOE-2847</span> — Quote{' '}
                            <span className="font-semibold">Q-2026-0089</span>.
                        </p>

                        {/* Proposal summary box */}
                        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2 text-[11px]">
                            <p className="font-bold text-foreground text-[10px] uppercase tracking-wide">Order Summary</p>
                            {[
                                { label: 'Contract',       value: 'CoNY · City of New York' },
                                { label: 'SIF validated',  value: 'Filing Units $8,100 → $7,560 (OmniQuote)' },
                                { label: 'Quote total',    value: '$48,200' },
                                { label: 'Labor',          value: 'Carpenters 45h · OT Carpenters 6h' },
                                { label: 'Delivery window', value: 'May 14–21, 2026 (30 days)' },
                                { label: 'Install crew',   value: '3 technicians · Zone A·B·C' },
                            ].map(r => (
                                <div key={r.label} className="flex items-start gap-2">
                                    <span className="text-muted-foreground w-28 shrink-0">{r.label}:</span>
                                    <span className="font-medium text-foreground">{r.value}</span>
                                </div>
                            ))}
                        </div>

                        <p>
                            Kindly review the attached proposal and{' '}
                            <span className="font-semibold">confirm the delivery date</span>{' '}
                            at your earliest convenience so we can initiate the purchase order and coordinate installation with the Workplace labor team.
                        </p>
                        <p className="text-muted-foreground">
                            — Lauren DeMarco<br />BFI Furniture · CoNY Account Manager
                        </p>
                    </div>

                    {/* PDF attachment chip */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            DOE-2847-Proposal.pdf
                            <span className="text-[9px] text-muted-foreground ml-1">· 3 pages</span>
                        </div>
                    </div>
                </div>

                {/* Sent confirmation */}
                {sent && (
                    <div className="mx-4 mb-3 bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold text-foreground">Proposal sent · NYC DOE · May 6 · 10:45 AM</div>
                            <div className="text-muted-foreground mt-0.5">Delivery date request included · Awaiting confirmation</div>
                        </div>
                    </div>
                )}

                <div className="px-4 pb-4">
                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                </div>
            </div>

            {/* CTA */}
            {!sent && (
                <div className="px-4 py-3 border-t border-border bg-card shrink-0">
                    <button
                        onClick={handleSend}
                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Send Proposal →
                    </button>
                </div>
            )}
        </div>
    )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function POLaborScene({ onConfirm }: POLaborSceneProps) {
    const { nextStep } = useDemo()
    const [isModalOpen,    setIsModalOpen]    = useState(false)
    const [showProposal,   setShowProposal]   = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        onConfirm?.()
        setShowProposal(true)
    }

    const handleSent = () => {
        setShowProposal(false)
        nextStep()
    }

    if (showProposal) {
        return <ProposalEmailView onSent={handleSent} />
    }

    return (
        <div className="space-y-3">

            {/* ── Process Kanban — PO & Labor active ── */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={() => setIsModalOpen(true)}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · reviewing PO & labor quote…
            </p>

            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="labor"
                onValidate={handleValidate}
            />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
