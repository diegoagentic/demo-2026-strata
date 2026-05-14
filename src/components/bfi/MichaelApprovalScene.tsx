/**
 * COMPONENT: MichaelApprovalScene (a1.3b)
 * PURPOSE: Michael Chen (Lauren's manager, BFI) receives Lauren's CPR notification,
 *          reviews the final quote with adjusted labor, and sends the final cotización
 *          to Nancy Rodriguez (Herman Miller invoice processor) asking her to issue the invoice.
 *          Does NOT update CORE — pure outbound email action.
 *
 * FLOW:
 *   dashboard → notification "CPR approved · Final quote ready for Herman Miller"
 *   → detail: CPR summary card + final quote breakdown
 *   → Send to Nancy → Dialog (editable From, To Nancy, pre-filled message) → send → nextStep()
 */

import { useState, useEffect, useRef, useCallback, Fragment } from 'react'
import {
    CheckCircle2, FileText, Mail, Send, Building2, Sparkles,
    Bell, AlertTriangle, Clock, DollarSign, ChevronRight,
} from 'lucide-react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { useDemo } from '../../context/DemoContext'
import DataSourcesBar, { SOURCES } from '../mbi/DataSourcesBar'

// ─── Constants ────────────────────────────────────────────────────────────────

const NOTIF = {
    title: 'CPR approved · Final quote ready · DOE-2847',
    desc: 'Lauren DeMarco completed CPR reconciliation — Carpenters −5h, OT −2h · Total −$2,340 · Pending: send final quote to Herman Miller',
    cta: 'Review & send final quote to Nancy →',
}

const STAT_CARDS = [
    { icon: FileText,      label: 'Active Agency Fees',  value: '7',       color: 'text-foreground' },
    { icon: AlertTriangle, label: 'CPR Pending',          value: '2',       color: 'text-warning' },
    { icon: Clock,         label: 'Invoices Awaited',     value: '4',       color: 'text-muted-foreground' },
    { icon: DollarSign,    label: 'Agency Fee (MTD)',      value: '$48,200', color: 'text-success' },
]

const QUEUE_ORDERS = [
    { id: 'DOE-2847', client: 'NYC Dept. of Education', status: 'CPR Approved',      badge: 'success',     detail: 'Invoice request pending → Nancy Rodriguez' },
    { id: 'MTA-1203', client: 'MTA Headquarters',       status: 'Fee Verification',   badge: 'warning',     detail: 'Patricia reviewing T-code discrepancy' },
    { id: 'NYCHA-88', client: 'NYCHA Brooklyn',         status: 'CPR Pending',        badge: 'warning',     detail: 'Carpenters 8h discrepancy · OT mismatch' },
    { id: 'DSNY-441', client: 'Dept. of Sanitation',   status: 'Invoice Received',   badge: 'muted',       detail: 'Herman Miller invoice under review' },
    { id: 'HPD-2201', client: 'HPD Housing',            status: 'Quote Validated',    badge: 'muted',       detail: 'SIF confirmed · Awaiting PO' },
]

const BADGE: Record<string, string> = {
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    muted:   'bg-muted text-muted-foreground border border-border',
}

// ─── Agency Fee Funnel Dashboard ───────────────────────────────────────────────

function AgencyFeeFunnel({ onNotifClick }: { onNotifClick: () => void }) {
    const { isPaused } = useDemo()
    const isPausedRef  = useRef(isPaused)
    useEffect(() => { isPausedRef.current = isPaused }, [isPaused])

    const [showNotif, setShowNotif] = useState(false)

    const pauseAware = useCallback((fn: () => void, delay: number) => {
        let elapsed = 0
        const interval = setInterval(() => {
            if (!isPausedRef.current) elapsed += 100
            if (elapsed >= delay) { clearInterval(interval); fn() }
        }, 100)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => pauseAware(() => setShowNotif(true), 900), [pauseAware])

    return (
        <div className="space-y-4">
            {/* Notification */}
            {showNotif && (
                <button
                    onClick={onNotifClick}
                    className="w-full text-left flex items-start gap-3 p-4 bg-ai/5 border border-ai/30 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 hover:bg-ai/10 transition-colors group"
                >
                    <Bell className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-black text-ai uppercase tracking-wider">{NOTIF.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{NOTIF.desc}</p>
                        <p className="text-[11px] font-bold text-ai mt-2 group-hover:underline">{NOTIF.cta}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ai shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-4 gap-3">
                {STAT_CARDS.map(card => (
                    <div key={card.label} className="bg-card border border-border rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                            <card.icon className="h-3.5 w-3.5" />
                            <span className="text-[10px] font-medium">{card.label}</span>
                        </div>
                        <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Order queue */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agency Fee Queue · CoNY Orders</p>
                </div>
                <div className="divide-y divide-border/60">
                    {QUEUE_ORDERS.map(order => (
                        <div key={order.id} className={`flex items-center gap-4 px-5 py-3 ${order.id === 'DOE-2847' ? 'bg-success/5' : ''}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] font-bold text-foreground">{order.id}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${BADGE[order.badge]}`}>{order.status}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5">{order.client}</p>
                                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{order.detail}</p>
                            </div>
                            {order.id === 'DOE-2847' && (
                                <ChevronRight className="h-4 w-4 text-success shrink-0" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const QUOTE_LINES = [
    { category: 'Teamsters',       hours: '24h', rate: '$75/h',  subtotal: '$1,800'  },
    { category: 'Carpenters',      hours: '45h', rate: '$90/h',  subtotal: '$4,050'  },
    { category: 'OT Carpenters',   hours: '6h',  rate: '$135/h', subtotal: '$810'    },
    { category: 'Inside Delivery', hours: '4h',  rate: '$65/h',  subtotal: '$260'    },
]
const QUOTE_TOTAL  = '$6,920'
const QUOTE_PREV   = '$9,260'
const QUOTE_IMPACT = '−$2,340'

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
                                    <p className="text-[10px] text-muted-foreground">Strata AI pre-drafted · final quote attached</p>
                                </div>
                                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                                {/* Quote summary chip */}
                                <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                        <span className="text-[11px] font-bold text-foreground">Final Quote · DOE-2847</span>
                                        <span className="ml-auto text-[10px] font-mono font-black text-foreground">{QUOTE_TOTAL}</span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-5 text-[10px] text-muted-foreground">
                                        <span>Previous total: <span className="line-through">{QUOTE_PREV}</span></span>
                                        <span className="font-bold text-warning">{QUOTE_IMPACT}</span>
                                    </div>
                                </div>

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

export default function MichaelApprovalScene() {
    const { nextStep } = useDemo()
    const [phase, setPhase] = useState<'dashboard' | 'detail'>('dashboard')
    const [showDialog, setShowDialog] = useState(false)
    const [sent, setSent] = useState(false)

    if (phase === 'dashboard') {
        return <AgencyFeeFunnel onNotifClick={() => setPhase('detail')} />
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Context banner */}
            <div className="flex items-start gap-3 p-4 bg-ai/5 border border-ai/20 rounded-2xl">
                <Sparkles className="h-4 w-4 text-ai shrink-0 mt-0.5" />
                <div>
                    <p className="text-[12px] font-bold text-foreground">CPR reconciliation complete · Action required</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        Lauren submitted the approved CPR. Final quote is ready — send to Nancy Rodriguez (HM) to request the invoice.
                    </p>
                </div>
            </div>

            {/* CPR Summary */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-background">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-[12px] font-bold text-foreground">CPR Reconciliation · DOE-2847</h3>
                        <span className="ml-auto text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20">Approved</span>
                    </div>
                </div>
                <div className="divide-y divide-border/60">
                    <div className="grid grid-cols-4 px-5 py-2 bg-muted/30">
                        {['Category', 'Hours', 'Rate', 'Subtotal'].map(h => (
                            <span key={h} className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">{h}</span>
                        ))}
                    </div>
                    {QUOTE_LINES.map(line => (
                        <div key={line.category} className="grid grid-cols-4 px-5 py-2.5">
                            <span className="text-[11px] font-medium text-foreground">{line.category}</span>
                            <span className="text-[11px] font-mono text-muted-foreground">{line.hours}</span>
                            <span className="text-[11px] font-mono text-muted-foreground">{line.rate}</span>
                            <span className="text-[11px] font-mono font-semibold text-foreground">{line.subtotal}</span>
                        </div>
                    ))}
                    <div className="grid grid-cols-4 px-5 py-3 bg-muted/20">
                        <span className="text-[11px] font-black text-foreground col-span-3 uppercase tracking-wide">Total</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[12px] font-black text-foreground font-mono">{QUOTE_TOTAL}</span>
                            <span className="text-[9px] font-bold text-warning font-mono">{QUOTE_IMPACT}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recipient card */}
            <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground">Nancy Rodriguez</p>
                    <p className="text-[11px] text-muted-foreground">Invoice Processor · Herman Miller</p>
                    <p className="text-[10px] text-muted-foreground/70 font-mono">nancy.rodriguez@hermanmiller.com</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">Invoice amount</p>
                    <p className="text-[14px] font-black text-foreground font-mono">{QUOTE_TOTAL}</p>
                </div>
            </div>

            {/* Action row */}
            <div className="flex items-center gap-3">
                <DataSourcesBar groups={[{ sources: [SOURCES.STRATA_AI, SOURCES.CORE_RPA] }]} />
                <button
                    onClick={() => setShowDialog(true)}
                    disabled={sent}
                    className={`ml-auto shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                        sent
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-ai text-white hover:opacity-90'
                    }`}
                >
                    {sent ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Sent to Nancy</>
                    ) : (
                        <><Send className="h-3.5 w-3.5" /> Send Final Quote →</>
                    )}
                </button>
            </div>

            <NancyDialog
                isOpen={showDialog}
                onSent={() => {
                    setSent(true)
                    setShowDialog(false)
                    setTimeout(() => nextStep?.(), 600)
                }}
            />
        </div>
    )
}
