/**
 * COMPONENT: POLaborScene (a1.2c)
 * PURPOSE: Agency Fee step 2c — PO & Labor Quote review + proposal email to NYC DOE.
 *
 * FLOW:
 *   kanban → modal (step="labor") → validate → ProposalDialog (overlay) → send → nextStep()
 */

import { useState, Fragment } from 'react'
import { CheckCircle2, FileText, Send, Mail } from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

const ACTIVE_COL = 2  // PO & Labor

// ─── Proposal Email Dialog ────────────────────────────────────────────────────

function ProposalDialog({ isOpen, onSent }: { isOpen: boolean; onSent: () => void }) {
    const [sent,      setSent]      = useState(false)
    const [fromEmail, setFromEmail] = useState('lauren.demarco@bfifurniture.com')

    const handleSend = () => {
        setSent(true)
        setTimeout(() => onSent(), 900)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={() => {}}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/30 shrink-0">
                                <div className="h-8 w-8 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-black text-success">DOE</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-bold text-foreground truncate">NYC Dept. of Education</div>
                                    <div className="text-[10px] text-muted-foreground">Procurement Office</div>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto">

                                {/* Metadata */}
                                <div className="px-5 pt-4 pb-3 border-b border-border/60 space-y-1.5">
                                    <div className="text-[13px] font-bold text-foreground leading-snug">
                                        Purchase Order Request · DOE-2847
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 text-[10px]">
                                            <span className="text-muted-foreground w-7 shrink-0">From:</span>
                                            <input value={fromEmail} onChange={e => setFromEmail(e.target.value)} disabled={sent}
                                                className="flex-1 bg-transparent outline-none text-foreground font-medium border-b border-transparent hover:border-border/60 focus:border-primary/50 transition-colors disabled:opacity-60 min-w-0" />
                                        </div>
                                        {[
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

                                {/* Body */}
                                <div className="px-5 py-4 space-y-3">
                                    <div className="text-[12px] text-foreground leading-relaxed space-y-3">
                                        <p>Good morning,</p>
                                        <p>
                                            Please find attached our formal proposal for Purchase Order{' '}
                                            <span className="font-semibold">DOE-2847</span>. Pricing has been
                                            validated against the CoNY contract through OmniQuote (one correction
                                            applied: Filing Units $8,100 → $7,560 per T-code) and the Workplace
                                            labor schedule has been reviewed and confirmed.
                                        </p>

                                        {/* Order summary */}
                                        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5 text-[11px]">
                                            <p className="font-bold text-foreground text-[10px] uppercase tracking-wide">PO Request · OmniQuote Validated</p>
                                            {[
                                                { label: 'Contract',        value: 'CoNY · City of New York' },
                                                { label: 'Price corrected', value: 'Filing Units $8,100 → $7,560 per T-code' },
                                                { label: 'Adjusted total',  value: '$235,560' },
                                                { label: 'CoNY discount',   value: '−$88,335 (37.5%)' },
                                                { label: 'Labor (Workplace)', value: 'Teamsters 24h · Carpenters 45h · OT 6h' },
                                                { label: 'Delivery window', value: 'May 14–21, 2026 (30 days)' },
                                                { label: 'Install crew',    value: '3 technicians · Zones A · B · C' },
                                            ].map(r => (
                                                <div key={r.label} className="flex items-start gap-2">
                                                    <span className="text-muted-foreground w-28 shrink-0">{r.label}:</span>
                                                    <span className="font-medium text-foreground">{r.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <p>
                                            The updated SIF and OmniQuote validation are attached for your records.
                                            Kindly confirm the Purchase Order at your earliest convenience so we can
                                            finalize the delivery schedule and coordinate installation.
                                        </p>
                                        <p className="text-muted-foreground text-[11px]">
                                            — Lauren DeMarco<br />BFI Furniture · CoNY Account Manager
                                        </p>
                                    </div>

                                    {/* Attachment chips */}
                                    <div className="flex flex-col gap-1.5">
                                        {[
                                            { name: 'DOE-2847-SIF-updated.pdf',  label: 'Updated SIF' },
                                            { name: 'Q-2026-0089-OmniQuote.pdf', label: 'OmniQuote'  },
                                        ].map(a => (
                                            <div key={a.name} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground font-medium">
                                                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                {a.name}
                                                <span className="text-[9px] text-muted-foreground ml-1">· {a.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Sent confirmation */}
                                    {sent && (
                                        <div className="bg-success/5 border border-success/30 rounded-xl p-3 flex items-start gap-2 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-foreground">Proposal sent · NYC DOE · May 6 · 10:45 AM</div>
                                                <div className="text-muted-foreground mt-0.5">Delivery date request included · Awaiting confirmation</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 pb-4">
                                    <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
                                </div>
                            </div>

                            {/* Footer CTA */}
                            {!sent && (
                                <div className="px-5 py-3.5 border-t border-border bg-card shrink-0">
                                    <button
                                        onClick={handleSend}
                                        className="w-full flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        Send Proposal →
                                    </button>
                                </div>
                            )}
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Main Scene ───────────────────────────────────────────────────────────────

export default function POLaborScene() {
    const { nextStep } = useDemo()
    const [isModalOpen,    setIsModalOpen]    = useState(false)
    const [showProposal,   setShowProposal]   = useState(false)

    const handleValidate = () => {
        setIsModalOpen(false)
        setShowProposal(true)
    }

    const handleSent = () => {
        setShowProposal(false)
        nextStep()
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

            <ProposalDialog isOpen={showProposal} onSent={handleSent} />

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />
        </div>
    )
}
