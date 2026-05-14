/**
 * COMPONENT: MichaelApprovalScene (a1.3b)
 * PURPOSE: Michael Chen (Lauren's manager, BFI) sees the Agency Fee CPR funnel,
 *          receives Lauren's CPR approval notification, reviews the same CPR detail
 *          as step 1.8 (pre-approved), and sends the final quote to Nancy Rodriguez
 *          (Herman Miller invoice processor) requesting the invoice.
 *
 * FLOW:
 *   Notification slides in after 900ms above the CPR kanban
 *   Click notification → BFIDocumentReviewModal (cpr, michaelMode=true)
 *   Lines pre-approved → "Send Final Quote to Nancy →" → NancyDialog → nextStep()
 */

import { useState, useEffect } from 'react'
import {
    CheckCircle2, Mail, Send,
} from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'
import BFIDocumentReviewModal from './BFIDocumentReviewModal'
import BFIProcessKanban from './BFIProcessKanban'

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIF = {
    title: 'CPR approved · Final quote ready · DOE-2847',
    desc: 'Lauren DeMarco completed CPR reconciliation — Carpenters −5h, OT −2h · Total −$2,340 · Pending: send final quote to Herman Miller',
    cta: 'Review & send final quote to Nancy →',
}

const QUOTE_TOTAL  = '$6,920'

const NANCY_MESSAGE =
`Hi Nancy,

Please find the final labor quote for DOE-2847 (NYC Department of Education — CoNY contract).

Following CPR reconciliation, the labor hours have been adjusted and approved:

  · Teamsters:       24h × $75/h  = $1,800
  · Carpenters:      45h × $90/h  = $4,050  (revised from 50h)
  · OT Carpenters:    6h × $135/h = $810    (revised from 8h)
  · Inside Delivery:  4h × $65/h  = $260

  Total labor:  $6,920  (adjusted from $9,260 · saving: −$2,340)

Please issue the final invoice for $6,920 and send it to ar@bfifurniture.com at your earliest convenience.

Thank you,
Michael Chen
BFI Furniture · Account Manager`

// ─── Nancy Send Dialog ────────────────────────────────────────────────────────

function NancyDialog({ isOpen, onSent }: { isOpen: boolean; onSent: () => void }) {
    const [fromEmail, setFromEmail] = useState('michael.chen@bfifurniture.com')
    const [message,   setMessage]   = useState(NANCY_MESSAGE)
    const [sending,   setSending]   = useState(false)
    const [sent,      setSent]      = useState(false)

    const handleSend = () => {
        setSending(true)
        setTimeout(() => {
            setSending(false)
            setSent(true)
            setTimeout(() => onSent(), 900)
        }, 800)
    }

    const META_ROWS = [
        { label: 'From', editable: true },
        { label: 'To',   value: 'nancy.rodriguez@hermanmiller.com · Invoice Processor' },
        { label: 'CC',   value: 'lauren.demarco@bfifurniture.com · walter@conyny.gov', muted: true },
        { label: 'Subj', value: 'Final Labor Quote · DOE-2847 · Invoice Request' },
    ]

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={() => {}} className="relative z-[400]">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95 translate-y-2" enterTo="opacity-100 scale-100 translate-y-0"
                        leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] border border-border overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                                <div className="h-8 w-8 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                                    <span className="text-[11px] font-black text-ai">ST</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-foreground">Invoice Request · Herman Miller</p>
                                    <p className="text-[10px] text-muted-foreground">Strata AI pre-drafted · final quote {QUOTE_TOTAL}</p>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Email metadata */}
                                <div className="rounded-xl border border-border overflow-hidden text-[11px]">
                                    {META_ROWS.map((row, i) => (
                                        <div key={row.label} className={`flex gap-3 px-3 py-2.5 ${i < META_ROWS.length - 1 ? 'border-b border-border/60' : ''}`}>
                                            <span className="text-muted-foreground font-semibold w-10 shrink-0">{row.label}</span>
                                            {row.editable ? (
                                                <input
                                                    value={fromEmail}
                                                    onChange={e => setFromEmail(e.target.value)}
                                                    className="flex-1 bg-transparent outline-none text-foreground border-b border-transparent hover:border-border/60 focus:border-primary/50 transition-colors"
                                                />
                                            ) : (
                                                <span className={row.muted ? 'text-muted-foreground italic' : 'text-foreground'}>
                                                    {row.value}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Editable message */}
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    rows={14}
                                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-[11px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                />

                                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-border shrink-0">
                                {sent ? (
                                    <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success/10 border border-success/20">
                                        <CheckCircle2 className="h-4 w-4 text-success" />
                                        <span className="text-[12px] font-bold text-success">Sent to Nancy · Invoice requested</span>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ai text-white text-[12px] font-bold hover:opacity-90 transition-all disabled:opacity-60"
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                        {sending ? 'Sending…' : 'Send Final Quote to Nancy →'}
                                    </button>
                                )}
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Main scene ───────────────────────────────────────────────────────────────

const ACTIVE_COL = 3

export default function MichaelApprovalScene() {
    const { nextStep } = useDemo()

    const [isModalOpen,  setIsModalOpen]  = useState(false)
    const [showNancy,    setShowNancy]    = useState(false)

    useEffect(() => {
        const handler = () => setIsModalOpen(true)
        window.addEventListener('bfi:michael-open', handler)
        return () => window.removeEventListener('bfi:michael-open', handler)
    }, [])

    const handleOpenModal = () => setIsModalOpen(true)

    const handleModalValidate = () => {
        setIsModalOpen(false)
        setShowNancy(true)
    }

    const handleNancySent = () => {
        setShowNancy(false)
        setTimeout(() => nextStep?.(), 600)
    }

    return (
        <div className="space-y-3">
            {/* CPR kanban — same as step 1.8 */}
            <BFIProcessKanban
                activeCol={ACTIVE_COL}
                showDoe={true}
                onReviewDoe={handleOpenModal}
            />

            <p className="text-[11px] text-muted-foreground text-center">
                4 active orders · reconciling CPR hours…
            </p>

            <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_PO] }]} />

            {/* CPR modal — michaelMode: lines pre-approved, button → Nancy */}
            <BFIDocumentReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                step="cpr"
                onValidate={handleModalValidate}
                michaelMode
            />

            {/* Nancy invoice request dialog */}
            <NancyDialog isOpen={showNancy} onSent={handleNancySent} />
        </div>
    )
}
