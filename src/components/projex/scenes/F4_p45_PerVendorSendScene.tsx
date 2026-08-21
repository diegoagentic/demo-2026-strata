/**
 * COMPONENT: F4_p45_PerVendorSendScene (Projex · p4.5)
 * PURPOSE: Coordinator opens SubmitPODialog per PO · sends Teknion first · HBF hold ·
 *          per-vendor control. Banner "Never auto-send" visible. Cada release
 *          intentional (SOT §12b · FC6 fix).
 *
 * SHAPE · per-vendor strip + SubmitPODialog per row (F4 primary shape)
 * REUSE · UI-Dealer/po-conversion/SubmitPODialog + FinalizePOButton (lifted)
 * NOTIF · dispatchea `projex:po-sent` per release
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Send, CheckCircle2, Loader2, AlertTriangle, ArrowRight,
    Clock, ShieldAlert, Sparkles, Play, User, Eye, X, Edit3,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { MWH_PO_BATCH } from '../../../config/profiles/projex-data/mwhPif'

// Sample PO line items · used when the preview modal opens for any PO
interface POLine {
    sku: string
    description: string
    qty: number
    unitPrice: number
}

const SAMPLE_PO_LINES: POLine[] = [
    { sku: 'TWU-6624-VN',    description: 'Upstage panel · 66"×24" · velum · tackable',    qty: 6,  unitPrice: 342.50 },
    { sku: 'TCS-30D-BLK',    description: 'Chief task chair · 3D arms · black frame',      qty: 8,  unitPrice: 618.75 },
    { sku: 'TWK-6642-WH',    description: 'Work surface · 66"×42" · white laminate',       qty: 4,  unitPrice: 384.20 },
    { sku: 'TSP-24-CH',      description: 'Storage pedestal · 24" · charcoal',             qty: 8,  unitPrice: 429.00 },
    { sku: 'TWU-4224-VN',    description: 'Upstage panel · 42"×24" · velum · tackable',    qty: 2,  unitPrice: 246.50 },
    { sku: 'TCK-KEYSTONE-M', description: 'Keystone monitor arm · dual · medium',          qty: 12, unitPrice: 189.00 },
]

const VENDOR_AVATAR: Record<string, { bg: string; text: string }> = {
    TEK: { bg: 'bg-primary/25',    text: 'text-foreground' },
    HBF: { bg: 'bg-info/15',       text: 'text-info' },
    BDG: { bg: 'bg-ai/15',         text: 'text-ai' },
    ALA: { bg: 'bg-success/15',    text: 'text-success' },
    NLC: { bg: 'bg-warning/15',    text: 'text-warning' },
    WEL: { bg: 'bg-muted',         text: 'text-muted-foreground' },
}

export default function F4_p45_PerVendorSendScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const isabella = PROJEX_PERSONAS.isabella

    const [sentIds, setSentIds] = useState<Set<string>>(new Set())
    const [heldIds, setHeldIds] = useState<Set<string>>(new Set())
    const [sendingId, setSendingId] = useState<string | null>(null)

    // Review preview modal · opens per PO row · allows edit qty/price + notes
    const [reviewPO, setReviewPO] = useState<typeof MWH_PO_BATCH[0] | null>(null)
    const [reviewLines, setReviewLines] = useState<POLine[]>(SAMPLE_PO_LINES)
    const [reviewNotes, setReviewNotes] = useState('')
    const [editedFlag, setEditedFlag] = useState(false)

    // F76 · No AC notif · UI is self-explanatory (per-vendor Send buttons visible)
    const highlight = false

    // Group by vendor for display
    const byVendor = MWH_PO_BATCH.reduce((acc, po) => {
        if (!acc[po.vendorCode]) acc[po.vendorCode] = []
        acc[po.vendorCode].push(po)
        return acc
    }, {} as Record<string, typeof MWH_PO_BATCH>)

    const handleSend = (poNumber: string) => {
        if (sendingId) return
        setSendingId(poNumber)
        pauseAwareTimeout(() => {
            setSentIds(prev => new Set([...prev, poNumber]))
            setSendingId(null)
            window.dispatchEvent(new CustomEvent('projex:po-sent'))
        }, 900)
    }

    const handleHold = (poNumber: string) => {
        setHeldIds(prev => {
            const next = new Set(prev)
            if (next.has(poNumber)) next.delete(poNumber)
            else next.add(poNumber)
            return next
        })
    }

    const handleOpenReview = (po: typeof MWH_PO_BATCH[0]) => {
        setReviewPO(po)
        setReviewLines(SAMPLE_PO_LINES)
        setReviewNotes('')
        setEditedFlag(false)
    }

    const handleCloseReview = () => setReviewPO(null)

    const handleLineChange = (idx: number, field: 'qty' | 'unitPrice', value: number) => {
        setReviewLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: Math.max(0, value) } : l))
        setEditedFlag(true)
    }

    const handleSendFromReview = () => {
        if (!reviewPO) return
        handleSend(reviewPO.poNumber)
        setReviewPO(null)
    }

    const handleHoldFromReview = () => {
        if (!reviewPO) return
        handleHold(reviewPO.poNumber)
        setReviewPO(null)
    }

    const reviewSubtotal = reviewLines.reduce((s, l) => s + l.qty * l.unitPrice, 0)

    const sentCount = sentIds.size
    const heldCount = heldIds.size
    const remainingCount = MWH_PO_BATCH.length - sentCount - heldCount
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
            <h1 className="text-2xl font-bold text-foreground">
                    Per-vendor Send · Coordinator releases Teknion first · never one-batch
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    SubmitPODialog per PO · Teknion (SIF fast) primero · HBF hold for tomorrow · Boss review before send. FC6 human control preserved.
                </p>
            </div>

            {/* Banner · never auto */}
            <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Banner · Never auto-send (FC6 fix)</div>
                    <div className="text-muted-foreground mt-0.5">
                        Coordinator never trusts auto-send (SOT §12b). Every PO release is intentional act · SubmitPODialog gate per vendor. Coordinator controls delivery timing per vendor SLA.
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-lg font-semibold text-foreground tabular-nums">{sentCount} / {MWH_PO_BATCH.length}</div>
                    <div className="text-[10px] text-muted-foreground">Sent</div>
                </div>
            </div>

            {/* Per-vendor strips */}
            <div className="space-y-3">
                {Object.entries(byVendor).map(([vendorCode, pos], vendorIdx) => {
                    const avatar = VENDOR_AVATAR[vendorCode]
                    const vendorName = pos[0].vendorName
                    const vendorTotal = pos.reduce((s, p) => s + p.amount, 0)
                    return (
                        <div key={vendorCode} className="rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full ${avatar.bg} flex items-center justify-center shrink-0`}>
                                    <span className={`text-[10px] font-black ${avatar.text}`}>{vendorCode}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-foreground">{vendorName}</div>
                                    <div className="text-[10px] text-muted-foreground">{pos.length} PO{pos.length === 1 ? '' : 's'} · {pos[0].method}</div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-sm font-semibold text-foreground tabular-nums">${vendorTotal.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="divide-y divide-border">
                                {pos.map((po, poIdx) => {
                                    const isSent = sentIds.has(po.poNumber)
                                    const isHeld = heldIds.has(po.poNumber)
                                    const isSending = sendingId === po.poNumber
                                    // First PO of first vendor (Teknion) is the AC highlight target
                                    const isFirstSendable = vendorIdx === 0 && poIdx === 0
                                    return (
                                        <div key={po.poNumber} className="px-4 py-2 flex items-center gap-3 text-xs">
                                            <span className="text-foreground font-mono truncate w-[140px]">{po.poNumber}</span>
                                            <span className="text-muted-foreground truncate flex-1">{po.lineCount} lines · ${po.amount.toLocaleString()}</span>
                                            {isSent && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-2 py-1">
                                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                    Sent
                                                </span>
                                            )}
                                            {isHeld && !isSent && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 rounded px-2 py-1">
                                                    <Clock className="h-3 w-3" aria-hidden="true" />
                                                    Held
                                                </span>
                                            )}
                                            {isSending && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ai animate-pulse">
                                                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                                    Sending…
                                                </span>
                                            )}
                                            {!isSent && !isSending && (
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleOpenReview(po)}
                                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-foreground bg-background border border-border rounded px-2 py-1 hover:bg-muted transition-colors"
                                                        aria-label={`Review ${po.poNumber} before send`}
                                                        title="Review + edit PO before send"
                                                    >
                                                        <Eye className="h-2.5 w-2.5" aria-hidden="true" />
                                                        Review
                                                    </button>
                                                    <button
                                                        onClick={() => handleHold(po.poNumber)}
                                                        className={`text-[10px] font-semibold border rounded px-2 py-1 transition-colors ${
                                                            isHeld
                                                                ? 'border-warning/40 text-warning bg-warning/10'
                                                                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/40'
                                                        }`}
                                                    >
                                                        {isHeld ? 'Unhold' : 'Hold'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSend(po.poNumber)}
                                                        disabled={isHeld}
                                                        {...(isFirstSendable ? { 'data-ac-highlight': true } : {})}
                                                        className={`inline-flex items-center gap-1 text-[10px] font-bold bg-primary text-primary-foreground rounded px-2 py-1 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity ${isFirstSendable && highlight ? 'ring-2 ring-primary/60 animate-pulse' : ''}`}
                                                    >
                                                        <Play className="h-2.5 w-2.5" aria-hidden="true" />
                                                        Send
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* F83.A · KPI summary hero removed · sent/held counts pueden
                 vivir en el header del per-vendor strip si necesario. */}

            {sentCount > 0 && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">{sentCount} POs released</span>
                        <span className="text-muted-foreground"> · Teknion via SIF Online · rest via email/portal per delivery. Snapshot tri-way match available in the next step.</span>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open snapshot audit
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}


            {/* Review + edit modal · opens per PO row · Send/Hold/Cancel */}
            <Transition show={reviewPO !== null} as={Fragment}>
                <Dialog onClose={handleCloseReview} className="relative z-[350]">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
                    </TransitionChild>
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/30 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center text-foreground">
                                            <Eye className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                                Review PO · {reviewPO?.poNumber}
                                                {editedFlag && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ai bg-ai-light rounded px-1.5 py-0.5">
                                                        <Edit3 className="h-2.5 w-2.5" aria-hidden="true" />
                                                        Edited
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                {reviewPO?.vendorName} · edit line qty or unit price before send · notes optional
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleCloseReview} aria-label="Close" className="h-8 w-8 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Body · scrollable */}
                                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
                                    {/* PO metadata */}
                                    <div className="grid grid-cols-4 gap-3 text-xs">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vendor</div>
                                            <div className="text-foreground font-semibold mt-0.5">{reviewPO?.vendorName}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Method</div>
                                            <div className="text-foreground mt-0.5">{reviewPO?.method}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                                            <div className="text-foreground mt-0.5">MWH residential</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Terms</div>
                                            <div className="text-foreground mt-0.5">Net 10 · 1.5%/mo late</div>
                                        </div>
                                    </div>

                                    {/* Line items · editable */}
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <div className="grid grid-cols-[36px_120px_1fr_80px_110px_110px] px-3 py-1.5 bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                                            <span>#</span>
                                            <span>SKU</span>
                                            <span>Description</span>
                                            <span className="text-right">Qty</span>
                                            <span className="text-right">Unit price</span>
                                            <span className="text-right">Amount</span>
                                        </div>
                                        {reviewLines.map((l, idx) => (
                                            <div key={idx} className="grid grid-cols-[36px_120px_1fr_80px_110px_110px] px-3 py-1.5 text-xs items-center border-t border-border">
                                                <span className="text-muted-foreground font-mono tabular-nums">{idx + 1}</span>
                                                <span className="font-mono text-[11px] text-foreground truncate">{l.sku}</span>
                                                <span className="text-foreground truncate">{l.description}</span>
                                                <input
                                                    type="number"
                                                    value={l.qty}
                                                    onChange={e => handleLineChange(idx, 'qty', Number(e.target.value))}
                                                    min={0}
                                                    className="w-full text-right tabular-nums bg-background border border-border rounded px-1 py-0.5 text-[11px] focus:outline-none focus:border-primary/60"
                                                />
                                                <input
                                                    type="number"
                                                    value={l.unitPrice}
                                                    onChange={e => handleLineChange(idx, 'unitPrice', Number(e.target.value))}
                                                    min={0}
                                                    step={0.01}
                                                    className="w-full text-right tabular-nums bg-background border border-border rounded px-1 py-0.5 text-[11px] focus:outline-none focus:border-primary/60"
                                                />
                                                <span className="text-right tabular-nums font-semibold text-foreground">
                                                    ${(l.qty * l.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="grid grid-cols-[36px_120px_1fr_80px_110px_110px] px-3 py-2 bg-muted/40 border-t border-foreground text-xs">
                                            <span></span>
                                            <span></span>
                                            <span className="text-foreground font-bold">Subtotal</span>
                                            <span></span>
                                            <span></span>
                                            <span className="text-right tabular-nums font-bold text-foreground">
                                                ${reviewSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notes · optional */}
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Notes for vendor (optional)</label>
                                        <textarea
                                            value={reviewNotes}
                                            onChange={e => { setReviewNotes(e.target.value); setEditedFlag(true) }}
                                            rows={3}
                                            placeholder="Add lift-gate delivery instructions · consolidated ship request · promotion code · etc."
                                            className="w-full mt-1 bg-background border border-border rounded-lg px-3 py-2 text-[12px] text-foreground focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-y"
                                        />
                                    </div>

                                    {/* Never auto-send reminder */}
                                    <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 flex items-start gap-2 text-[11px]">
                                        <ShieldAlert className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                                        <span className="text-foreground">
                                            <strong>Never auto-send.</strong> Send button dispatches the PO through the vendor&apos;s preferred channel · Hold keeps it in draft for later review.
                                        </span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={handleCloseReview}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2.5 py-2 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleHoldFromReview}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2.5 py-2 transition-colors"
                                    >
                                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                        Hold for later
                                    </button>
                                    <button
                                        onClick={handleSendFromReview}
                                        className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                    >
                                        <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                        Send PO
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}
