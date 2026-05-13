/**
 * BFIProcessKanban
 * 5-column kanban representing the BFI Agency Fee business process.
 * DOE-2847 moves through columns as the demo advances.
 * Other orders appear as dimmed context cards.
 *
 * Also exports BFI_PROCESS_FUNNEL — shared funnel steps for all a1.x scenes.
 */

import { useState, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { Plus, FileText, Upload, CheckCircle2, X, Loader2 } from 'lucide-react'

// ─── Shared funnel steps (5-stage process) ───────────────────────────────────

export const BFI_PROCESS_FUNNEL = [
    { id: 'intake',    label: 'Intake'     },
    { id: 'quote',     label: 'Quote'      },
    { id: 'po-labor',  label: 'PO & Labor' },
    { id: 'cpr',       label: 'CPR'        },
    { id: 'fee-verify',label: 'Fee Verify' },
]

// ─── Kanban columns ───────────────────────────────────────────────────────────

const PROCESS_COLUMNS = [
    { id: 'intake',    label: 'Intake',     color: 'text-ai',      bg: 'bg-ai/10',      border: 'border-ai/20'      },
    { id: 'quote',     label: 'Quote',      color: 'text-info',    bg: 'bg-info/10',    border: 'border-info/20'    },
    { id: 'po-labor',  label: 'PO & Labor', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
    { id: 'cpr',       label: 'CPR Review', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
    { id: 'fee-verify',label: 'Fee Verify', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
]

// ─── Context cards (other orders — static background) ─────────────────────────

const BASE_CONTEXT_CARDS: ContextCard[] = [
    { orderId: 'NYPD-0394', initials: 'NYPD', agency: 'NYPD Precinct 40',    value: '$31,750',  colIdx: 1, avatarBg: 'bg-info/20',    avatarColor: 'text-info'    },
    { orderId: 'DCAS-1182', initials: 'DCAS', agency: 'NYC DCAS',            value: '$127,400', colIdx: 2, avatarBg: 'bg-warning/20', avatarColor: 'text-warning' },
    { orderId: 'DOH-0671',  initials: 'DOH',  agency: 'NYC Dept. of Health', value: '$22,100',  colIdx: 4, avatarBg: 'bg-ai/20',      avatarColor: 'text-ai'      },
]

interface ContextCard {
    orderId: string
    initials: string
    agency: string
    value: string
    colIdx: number
    avatarBg: string
    avatarColor: string
    desc?: string
    isNew?: boolean
}

function getNewCardColors(name: string): { avatarBg: string; avatarColor: string } {
    const palette = [
        { avatarBg: 'bg-blue-100 dark:bg-blue-900/30',   avatarColor: 'text-blue-700 dark:text-blue-400'   },
        { avatarBg: 'bg-purple-100 dark:bg-purple-900/30', avatarColor: 'text-purple-700 dark:text-purple-400' },
        { avatarBg: 'bg-teal-100 dark:bg-teal-900/30',   avatarColor: 'text-teal-700 dark:text-teal-400'   },
        { avatarBg: 'bg-orange-100 dark:bg-orange-900/30', avatarColor: 'text-orange-700 dark:text-orange-400' },
    ]
    return palette[name.charCodeAt(0) % palette.length]
}

// ─── DOE-2847 contextual content per column ───────────────────────────────────

const DOE_BADGE: Record<number, { label: string; className: string }> = {
    0: { label: '! CPR',       className: 'bg-warning/20 text-warning border border-warning/30' },
    1: { label: 'OmniQuote',   className: 'bg-info/20 text-info border border-info/30'          },
    2: { label: 'PO received', className: 'bg-warning/20 text-warning border border-warning/30' },
    3: { label: '2 pending',   className: 'bg-warning/20 text-warning border border-warning/30' },
    4: { label: 'Verified',    className: 'bg-success/20 text-success border border-success/30' },
}

const DOE_SUBTITLE: Record<number, string> = {
    0: 'SIF received · CPR discrepancy flagged',
    1: 'OmniQuote validation · 1 price corrected',
    2: 'PO received · WIG labor quote compiled',
    3: 'CPR reconciliation · 2 lines to approve',
    4: 'Agency fee verification · Patricia Reyes',
}

// ─── New Order Modal ──────────────────────────────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'done'

interface FileZone {
    label: string
    accept: string
    placeholder: string
    filename: string
}

const FILE_ZONES: FileZone[] = [
    { label: 'SIF File',    accept: '.sif',  placeholder: 'Drag & drop or browse .sif',  filename: 'order.sif'         },
    { label: 'PDF Specs',   accept: '.pdf',  placeholder: 'Drag & drop or browse .pdf',  filename: 'specs.pdf'         },
    { label: 'Floor Plan',  accept: '.pdf',  placeholder: 'Drag & drop or browse .pdf',  filename: 'floorplan.pdf'     },
]

function NewOrderModal({
    isOpen,
    onClose,
    onCreate,
}: {
    isOpen: boolean
    onClose: () => void
    onCreate: (card: ContextCard) => void
}) {
    const [agencyName, setAgencyName] = useState('')
    const [orderId,    setOrderId]    = useState('')
    const [uploads,    setUploads]    = useState<UploadState[]>(['idle', 'idle', 'idle'])
    const [creating,   setCreating]   = useState(false)
    const [created,    setCreated]    = useState(false)

    const handleBrowse = (idx: number) => {
        setUploads(prev => { const n = [...prev]; n[idx] = 'uploading'; return n })
        setTimeout(() => {
            setUploads(prev => { const n = [...prev]; n[idx] = 'done'; return n })
        }, 1100)
    }

    const handleReplace = (idx: number) => {
        setUploads(prev => { const n = [...prev]; n[idx] = 'idle'; return n })
    }

    const allUploaded = uploads.every(u => u === 'done')
    const canCreate   = allUploaded && agencyName.trim().length > 0

    const handleCreate = () => {
        if (!canCreate) return
        setCreating(true)
        setTimeout(() => {
            setCreated(true)
            const initials = agencyName.trim().slice(0, 4).toUpperCase()
            const id = orderId.trim() || `${initials}-${Math.floor(1000 + Math.random() * 9000)}`
            const colors = getNewCardColors(agencyName.trim())
            setTimeout(() => {
                onCreate({
                    orderId: id,
                    initials: initials.slice(0, 4),
                    agency: agencyName.trim(),
                    value: '$—',
                    colIdx: 0,
                    avatarBg: colors.avatarBg,
                    avatarColor: colors.avatarColor,
                    desc: 'SIF received · Intake processing',
                    isNew: true,
                })
                onClose()
                // reset
                setAgencyName(''); setOrderId(''); setUploads(['idle','idle','idle']); setCreating(false); setCreated(false)
            }, 800)
        }, 1200)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[400]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150"  leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed top-16 left-80 right-0 bottom-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed top-16 left-80 right-0 bottom-0 flex items-center justify-center p-6">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"  leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel className="w-full max-w-lg transform rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                                <div className="flex items-center gap-2.5">
                                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Plus className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-foreground">New Agency Fee Order</p>
                                        <p className="text-[11px] text-muted-foreground">Strata will extract and validate documents automatically</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

                                {/* Order details */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Agency Name *</label>
                                        <input
                                            type="text"
                                            value={agencyName}
                                            onChange={e => setAgencyName(e.target.value)}
                                            placeholder="e.g. NYC Parks Dept."
                                            className="w-full rounded-lg border border-border px-3 py-2 text-[12px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Order ID <span className="text-muted-foreground/50 normal-case font-normal">(auto if blank)</span></label>
                                        <input
                                            type="text"
                                            value={orderId}
                                            onChange={e => setOrderId(e.target.value)}
                                            placeholder="e.g. PARK-1043"
                                            className="w-full rounded-lg border border-border px-3 py-2 text-[12px] text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50"
                                        />
                                    </div>
                                </div>

                                {/* File upload zones */}
                                <div className="space-y-2.5">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Documents</p>
                                    {FILE_ZONES.map((zone, idx) => {
                                        const state = uploads[idx]
                                        return (
                                            <div key={zone.label} className={`rounded-xl border transition-colors ${
                                                state === 'done' ? 'border-success/30 bg-success/5'
                                                : state === 'uploading' ? 'border-primary/30 bg-primary/5'
                                                : 'border-border bg-muted/20'
                                            }`}>
                                                <div className="flex items-center gap-3 px-3.5 py-3">
                                                    {/* Icon */}
                                                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                                                        state === 'done' ? 'bg-success/10' : 'bg-muted/40'
                                                    }`}>
                                                        {state === 'uploading'
                                                            ? <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                                            : state === 'done'
                                                            ? <CheckCircle2 className="h-4 w-4 text-success" />
                                                            : <FileText className="h-4 w-4 text-muted-foreground" />
                                                        }
                                                    </div>

                                                    {/* Label + status */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-foreground">{zone.label}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate">
                                                            {state === 'idle'      ? zone.placeholder
                                                            : state === 'uploading' ? 'Uploading…'
                                                            : zone.filename}
                                                        </p>
                                                    </div>

                                                    {/* Action */}
                                                    {state === 'idle' && (
                                                        <button
                                                            onClick={() => handleBrowse(idx)}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-foreground text-background hover:opacity-80 transition-all shrink-0"
                                                        >
                                                            <Upload className="h-3 w-3" /> Browse
                                                        </button>
                                                    )}
                                                    {state === 'done' && (
                                                        <button
                                                            onClick={() => handleReplace(idx)}
                                                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0 underline underline-offset-2"
                                                        >
                                                            Replace
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Creation success state */}
                                {created && (
                                    <div className="flex items-center gap-2 p-3 bg-success/5 border border-success/20 rounded-xl animate-in fade-in duration-300">
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                        <p className="text-[12px] font-bold text-success">Order created · appearing in Intake queue…</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-5 py-4 border-t border-border flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="text-[12px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={!canCreate || creating}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-black rounded-xl transition-all uppercase tracking-widest ${
                                        canCreate && !creating
                                            ? 'bg-primary text-primary-foreground hover:opacity-90'
                                            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                    }`}
                                >
                                    {creating
                                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…</>
                                        : 'Create Order →'
                                    }
                                </button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    )
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface BFIProcessKanbanProps {
    activeCol: 0 | 1 | 2 | 3 | 4
    showDoe?: boolean
    doeSubtitle?: string
    onReviewDoe?: () => void
    onSendDoe?: () => void
    animateDoe?: boolean
    /** Label for the Review/Continue button inside the DOE card. Default: "Review" */
    reviewLabel?: string
    /** Show the "+ New Fee" button. Default: true */
    showNewFee?: boolean
    /** When set, only context cards in these column indices are visible. DOE card is unaffected. */
    filterColIdxs?: number[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BFIProcessKanban({
    activeCol,
    showDoe = true,
    doeSubtitle,
    onReviewDoe,
    onSendDoe,
    animateDoe = false,
    reviewLabel = 'Review',
    showNewFee  = true,
    filterColIdxs,
}: BFIProcessKanbanProps) {
    const badge    = DOE_BADGE[activeCol]
    const subtitle = doeSubtitle ?? DOE_SUBTITLE[activeCol]
    const col      = PROCESS_COLUMNS[activeCol]

    const [contextCards, setContextCards] = useState<ContextCard[]>(BASE_CONTEXT_CARDS)
    const [isNewFeeOpen, setIsNewFeeOpen] = useState(false)

    const handleCreate = (card: ContextCard) => {
        setContextCards(prev => [...prev, card])
    }

    return (
        <>
            {/* New Fee button row */}
            {showNewFee && (
                <div className="flex justify-end mb-1">
                    <button
                        onClick={() => setIsNewFeeOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black bg-primary text-primary-foreground hover:opacity-90 transition-all uppercase tracking-widest shadow-sm"
                    >
                        <Plus className="h-3 w-3" />
                        New Fee
                    </button>
                </div>
            )}

            <div className="grid grid-cols-5 gap-2">
                {PROCESS_COLUMNS.map((c, colIdx) => {
                    const isDoeCol     = colIdx === activeCol
                    const colCards     = contextCards.filter(card =>
                        card.colIdx === colIdx &&
                        (filterColIdxs === undefined || filterColIdxs.includes(colIdx))
                    )
                    const doeVisible   = showDoe && isDoeCol
                    const count        = (doeVisible ? 1 : 0) + colCards.length

                    return (
                        <div key={c.id} className="space-y-2">
                            {/* Column header */}
                            <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl ${c.bg} border ${c.border}`}>
                                <span className={`text-[9px] font-black ${c.color} uppercase tracking-wide`}>{c.label}</span>
                                <span className="text-[9px] font-bold text-muted-foreground bg-card rounded-md px-1.5 py-0.5">
                                    {count}
                                </span>
                            </div>

                            {/* DOE-2847 card — highlighted */}
                            {doeVisible && (
                                <div className={`rounded-2xl border-2 ${col.border} bg-card p-3 space-y-2 shadow-sm ${
                                    animateDoe ? 'animate-in fade-in slide-in-from-top-2 duration-500' : ''
                                }`}>
                                    <div className="flex items-start gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-success/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="text-[9px] font-black text-success">DOE</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="text-[11px] font-bold text-foreground">DOE-2847</span>
                                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${badge.className}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-muted-foreground block">NYC Dept. of Education</span>
                                        </div>
                                    </div>

                                    <p className="text-[9px] text-muted-foreground leading-relaxed">{subtitle}</p>

                                    <div className="flex items-center justify-between pt-0.5">
                                        <span className="text-[10px] font-semibold text-foreground">$48,200</span>
                                        <span className="text-[9px] text-muted-foreground">May 6</span>
                                    </div>

                                    {(onSendDoe || onReviewDoe) && (
                                        <div className="flex gap-1.5 mt-1.5">
                                            {onSendDoe && (
                                                <button
                                                    onClick={onSendDoe}
                                                    className="flex-1 py-1.5 text-[9px] font-black rounded-lg bg-foreground text-background hover:opacity-80 transition-all uppercase tracking-widest"
                                                >
                                                    Send →
                                                </button>
                                            )}
                                            {onReviewDoe && (
                                                <button
                                                    onClick={onReviewDoe}
                                                    className={`py-1.5 text-[9px] font-bold rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all uppercase tracking-widest ${
                                                        onSendDoe ? 'px-3' : 'flex-1 font-black border-transparent bg-foreground text-background hover:opacity-80'
                                                    }`}
                                                >
                                                    {reviewLabel}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Context cards — dimmed (static) or interactive (newly created) */}
                            {colCards.map(card => (
                                <div
                                    key={card.orderId}
                                    className={`rounded-2xl border bg-card p-3 space-y-2 ${
                                        card.isNew
                                            ? 'border-primary/30 animate-in fade-in slide-in-from-top-2 duration-500'
                                            : 'border-border opacity-40 pointer-events-none'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`h-8 w-8 rounded-lg ${card.avatarBg} flex items-center justify-center shrink-0`}>
                                            <span className={`text-[8px] font-black ${card.avatarColor}`}>{card.initials}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[11px] font-bold text-foreground">{card.orderId}</div>
                                            <div className="text-[9px] text-muted-foreground truncate">{card.agency}</div>
                                        </div>
                                    </div>
                                    {card.desc && (
                                        <p className="text-[9px] text-muted-foreground leading-relaxed">{card.desc}</p>
                                    )}
                                    <div className="flex items-center justify-between pt-0.5">
                                        <span className="text-[10px] font-semibold text-foreground">{card.value}</span>
                                    </div>
                                    {card.isNew && colIdx === 0 && onReviewDoe && (
                                        <button
                                            onClick={onReviewDoe}
                                            className="w-full py-1.5 text-[9px] font-black rounded-lg bg-foreground text-background hover:opacity-80 transition-all uppercase tracking-widest"
                                        >
                                            REVIEW
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>

            <NewOrderModal
                isOpen={isNewFeeOpen}
                onClose={() => setIsNewFeeOpen(false)}
                onCreate={handleCreate}
            />
        </>
    )
}
