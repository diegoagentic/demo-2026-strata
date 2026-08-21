/**
 * COMPONENT: APLineItemMatchScene (Projex · p1.3)
 * PURPOSE: Line-by-line reconciliation for Teknion NCBA bill · Compliance\'s rule
 *          "match to the penny". 15 sample lines (12 exact · 2 qty · 1 penny).
 *          Accounting picks Accept or Override per exception · reason capture via
 *          ReasonDialog. Multi-Line Edit tool applies overrides to NetSuite
 *          before advancing a install-vendor exception (p1.4).
 *
 * SHAPE LOCK · canonical `NonEDIReconcilerScene` shape (F1 primary interaction):
 *   - Total comparison card (PO vs Bill vs Delta chip)
 *   - 8-col grid line-by-line (Line · Item + spec + mismatch badge · PO qty · Bill qty · Unit $ PO · Unit $ Bill · Delta · Action)
 *   - Left-border accent per row status (success/info/warning/transparent)
 *   - Natural-language mismatch labels
 *   - Accept / Override binary with ReasonDialog · toast on action
 *   - "+ Add freight line" affordance
 *
 * DS TOKENS: bg-card · bg-success/10 · bg-info/10 · bg-amber-500/10 (mismatch)
 *            · border-l-{success,info,amber-500} · border-border · tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12a · Compliance's mismatch cause taxonomy + Multi-Line Edit tool
 * REUSE FROM: mbi/NonEDIReconcilerScene shape verbatim (rebrand · Projex data) ·
 *             shared/ReasonDialog + StatusBadge · usePauseAware
 *
 * NOTIF: dispatchea `projex:ap-line-match-done` on Multi-Line Edit apply → advance p1.4
 */

import { useEffect, useMemo, useState } from 'react'
import {
    GitCompare, CheckCircle2, AlertTriangle, ArrowRight, Loader2,
    Sparkles, Plus, Truck, Wrench, X, Flag, Heart, Undo2,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import { ReasonDialog } from '../../shared'
import { PROJEX_BILLS_OVERNIGHT, type BillLineItem } from '../../../config/profiles/projex-data/bills'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'

const MISMATCH_BILL_ID = 'PJX-BILL-8483'
type RowStatus = 'pending' | 'accepted' | 'overridden'

// Compliance\'s mismatch cause taxonomy (SOT §12a · verbatim)
const OVERRIDE_CATEGORIES = [
    { id: 'partial-ship',    label: 'Partial shipment · vendor short-shipped' },
    { id: 'penny-rounding',  label: 'Penny rounding · Compliance\'s common cause' },
    { id: 'tax-rate-change', label: 'Tax rate changed since PO issued' },
    { id: 'out-of-stock',    label: 'Out of stock · reduce quantity' },
    { id: 'substitution',    label: 'Substitution · vendor swapped material/color' },
    { id: 'other',           label: 'Other · describe below' },
]

// Natural-language label per row
function getMismatchLabel(line: BillLineItem): string {
    if (line.match === 'qty-mismatch') return `Qty mismatch · PO ${line.orderedQty} · bill ${line.billedQty}`
    if (line.match === 'price-mismatch') return `Price variance · $${line.orderedPrice.toFixed(2)} → $${line.billedPrice.toFixed(2)}`
    if (line.match === 'substitution') return `Substitution · vendor swap`
    return ''
}

export default function APLineItemMatchScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const daniel = PROJEX_PERSONAS.daniel
    const jacob = PROJEX_PERSONAS.jacob

    const bill = PROJEX_BILLS_OVERNIGHT.find(b => b.id === MISMATCH_BILL_ID)
    const lines = bill?.lineItems ?? []
    // Exceptions first · then exact matches (canonical AP review shape)
    const flaggedRows = useMemo(() => lines.filter(l => l.match !== 'exact'), [lines])
    const exactRows = useMemo(() => lines.filter(l => l.match === 'exact'), [lines])
    const [showExactRows, setShowExactRows] = useState(false)

    // Per-row status + override notes
    const [statuses, setStatuses] = useState<Record<number, RowStatus>>({})
    const [notes, setNotes] = useState<Record<number, { reason: string; text: string }>>({})
    const [modalRow, setModalRow] = useState<BillLineItem | null>(null)
    const [freightAdded, setFreightAdded] = useState(false)
    const [toast, setToast] = useState<{ id: string; message: string; tone: 'success' | 'info' } | null>(null)

    // Multi-Line Edit tool apply state · fires when Accounting confirms all resolved
    type ApplyState = 'idle' | 'applying' | 'applied'
    const [applyState, setApplyState] = useState<ApplyState>('idle')
    const [applyStep, setApplyStep] = useState(0)

    const pushToast = (id: string, tone: 'success' | 'info', message: string) => {
        setToast({ id, tone, message })
        pauseAwareTimeout(() => setToast(prev => (prev?.id === id ? null : prev)), 3200)
    }

    const setRowStatus = (line: BillLineItem, s: RowStatus) => {
        setStatuses(prev => ({ ...prev, [line.lineNumber]: s }))
    }

    const handleAccept = (line: BillLineItem) => {
        setRowStatus(line, 'accepted')
        const label = line.match === 'qty-mismatch'
            ? 'Short-shipped accepted'
            : line.match === 'price-mismatch'
                ? 'Penny variance accepted'
                : 'Substitution accepted'
        pushToast(String(line.lineNumber), 'success', `Line ${line.lineNumber} · ${label}`)
    }

    const handleOverrideSubmit = (line: BillLineItem, payload: { reasonCategory: string; notes: string }) => {
        setRowStatus(line, 'overridden')
        setNotes(prev => ({ ...prev, [line.lineNumber]: { reason: payload.reasonCategory, text: payload.notes } }))
        setModalRow(null)
        const category = OVERRIDE_CATEGORIES.find(c => c.id === payload.reasonCategory)
        pushToast(String(line.lineNumber), 'info', `Line ${line.lineNumber} · override logged · ${category?.label ?? 'other'}`)
    }

    const handleAddFreight = () => {
        setFreightAdded(true)
        pushToast('freight', 'success', 'Freight line added · $210 · pending approval')
    }

    const handleUndoRow = (line: BillLineItem) => {
        const prevStatus = statuses[line.lineNumber]
        setStatuses(prev => {
            const next = { ...prev }
            delete next[line.lineNumber]
            return next
        })
        setNotes(prev => {
            const next = { ...prev }
            delete next[line.lineNumber]
            return next
        })
        pushToast(String(line.lineNumber), 'info', `Line ${line.lineNumber} · ${prevStatus === 'accepted' ? 'accept' : 'override'} undone · row back to pending`)
    }

    const handleUndoFreight = () => {
        setFreightAdded(false)
        pushToast('freight', 'info', 'Freight line removed')
    }

    const handleApplyOverrides = () => {
        if (applyState !== 'idle') return
        setApplyState('applying')
        setApplyStep(0)
        flaggedRows.forEach((_, i) => {
            pauseAwareTimeout(() => setApplyStep(i + 1), 650 * (i + 1))
        })
        pauseAwareTimeout(() => {
            setApplyState('applied')
            window.dispatchEvent(new CustomEvent('projex:ap-line-match-done'))
        }, 650 * flaggedRows.length + 500)
    }

    // Totals · PO vs Bill vs Delta
    const totalPO = lines.reduce((s, r) => s + r.orderedQty * r.orderedPrice, 0)
    const totalBill = lines.reduce((s, r) => s + r.billedQty * r.billedPrice, 0)
    const diff = totalBill - totalPO

    const allDecided = flaggedRows.every(r => (statuses[r.lineNumber] ?? 'pending') !== 'pending')
    const acceptedCount = flaggedRows.filter(r => statuses[r.lineNumber] === 'accepted').length
    const overriddenCount = flaggedRows.filter(r => statuses[r.lineNumber] === 'overridden').length

    // Effect · scroll to first unresolved on mount (visual affordance)
    useEffect(() => {
        // no-op initial · rows animate-in por default
    }, [])
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {/* F83.I · Diego 2026-08-21 · header slim to prod pattern
                (expert-hub/quote-converter ComparisonReviewModal) · row 1 =
                icon + title + status pill · row 2 = doc refs + vendor + match
                score meta strip. Legacy h1 + long subtitle + NCBA card +
                Multi-Line Edit strip removed · info folded into the meta
                strip. */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <GitCompare className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    <h2 className="text-base font-bold text-foreground">Compare PO vs Bill</h2>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${flaggedRows.length - acceptedCount - overriddenCount > 0 ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'}`}>
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        {flaggedRows.length - acceptedCount - overriddenCount} need review
                    </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <span>Purchase Order: <span className="font-mono text-foreground font-semibold">{bill?.poNumber}</span></span>
                    <span aria-hidden="true">⇄</span>
                    <span>Bill: <span className="font-mono text-foreground font-semibold">{bill?.id}</span></span>
                    <span>·</span>
                    <span>{bill?.projectName}</span>
                    <span>·</span>
                    <span className="tabular-nums">{exactRows.length}/{lines.length} match</span>
                    <span>·</span>
                    <span className="tabular-nums">Bill <span className={`font-semibold ${diff < 0 ? 'text-success' : 'text-warning'}`}>${totalBill.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></span>
                    <span className={`font-semibold tabular-nums ${diff < 0 ? 'text-success' : 'text-warning'}`}>
                        ({diff < 0 ? '−' : '+'}${Math.abs(diff).toFixed(2)})
                    </span>
                </div>
            </div>

            {/* Line-by-line diff table · 8-col grid canonical NonEDIReconciler shape */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Column headers */}
                <div className="px-5 py-3 border-b border-border bg-muted/20 grid grid-cols-[3rem_1fr_3.5rem_3.5rem_5.5rem_5.5rem_5.5rem_11rem] gap-4 items-end">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Line</div>
                    <div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Item · code · spec</div>
                        <div className="text-[9px] text-muted-foreground/60 mt-0.5">Line # · code · unit price only</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                        <div>PO</div>
                        <div className="text-[9px] font-normal">qty</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                        <div>Bill</div>
                        <div className="text-[9px] font-normal">qty</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                        <div>Unit $</div>
                        <div className="text-[9px] font-normal">PO</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                        <div>Unit $</div>
                        <div className="text-[9px] font-normal">Bill</div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Delta</div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Action</div>
                </div>

                {/* ═══ SECTION 1 · NEEDS YOUR EYES ═══════════════════════════ */}
                <div className="px-5 py-3 border-b border-border bg-warning/10 flex items-center gap-3 sticky top-0 z-10">
                    <AlertTriangle className="h-4 w-4 text-warning shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-warning">
                        Needs your eyes · {flaggedRows.length} exceptions
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">Accept variance o log override reason</span>
                    <span className="ml-auto text-[10px] font-bold text-warning tabular-nums">
                        {flaggedRows.length - acceptedCount - overriddenCount} pending
                    </span>
                </div>

                <div className="divide-y divide-border">
                    {flaggedRows.map(line => {
                        const status = statuses[line.lineNumber] ?? 'pending'
                        const note = notes[line.lineNumber]
                        const poLine = line.orderedQty * line.orderedPrice
                        const billLine = line.billedQty * line.billedPrice
                        const lineDiff = billLine - poLine
                        const mismatchLabel = getMismatchLabel(line)

                        return (
                            <div
                                key={line.lineNumber}
                                className={`
                                    grid grid-cols-[3rem_1fr_3.5rem_3.5rem_5.5rem_5.5rem_5.5rem_11rem] gap-4 px-5 items-center text-xs transition-all border-l-4 min-h-[84px] py-3.5
                                    ${status === 'accepted' ? 'border-l-success bg-success/5' : ''}
                                    ${status === 'overridden' ? 'border-l-info bg-info/5' : ''}
                                    ${status === 'pending' ? 'border-l-warning bg-warning/10 ring-1 ring-inset ring-warning/30' : ''}
                                `}
                            >
                                {/* Line # */}
                                <div className="font-mono text-[10px] text-muted-foreground tabular-nums">{line.lineNumber}</div>

                                {/* Item · code · mismatch badge · notes */}
                                <div className="min-w-0 space-y-1.5">
                                    <div>
                                        <div className="text-foreground font-semibold text-[11px] truncate leading-tight">{line.description}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono truncate mt-0.5">{line.itemCode}</div>
                                    </div>
                                    {status === 'pending' && (
                                        <span className="inline-flex items-center gap-1.5 text-[9px] font-bold px-2 py-1 rounded bg-warning text-warning-foreground uppercase tracking-wider shadow-sm">
                                            <AlertTriangle className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                                            {mismatchLabel}
                                        </span>
                                    )}
                                    {note?.text && (
                                        <div className="text-[10px] text-muted-foreground italic line-clamp-1">&quot;{note.text}&quot;</div>
                                    )}
                                </div>

                                {/* PO qty */}
                                <div className={`text-center tabular-nums text-sm ${line.orderedQty !== line.billedQty ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    {line.orderedQty}
                                </div>

                                {/* Bill qty */}
                                <div className={`text-center tabular-nums text-sm ${line.orderedQty !== line.billedQty ? 'font-bold text-warning' : 'text-muted-foreground'}`}>
                                    {line.billedQty}
                                </div>

                                {/* Unit $ PO */}
                                <div className={`text-right tabular-nums text-[11px] ${line.orderedPrice !== line.billedPrice ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                    ${line.orderedPrice.toFixed(2)}
                                </div>

                                {/* Unit $ Bill */}
                                <div className={`text-right tabular-nums text-[11px] ${line.orderedPrice !== line.billedPrice ? 'font-bold text-warning' : 'text-muted-foreground'}`}>
                                    ${line.billedPrice.toFixed(2)}
                                </div>

                                {/* Delta $ */}
                                <div className={`text-right tabular-nums text-[11px] font-bold ${
                                    lineDiff === 0 ? 'text-muted-foreground' :
                                    lineDiff < 0 ? 'text-success' :
                                    'text-warning'
                                }`}>
                                    {lineDiff === 0 ? '—' : `${lineDiff < 0 ? '−' : '+'}$${Math.abs(lineDiff).toFixed(2)}`}
                                </div>

                                {/* Action · Accept primary lime CTA (LAW 3) · Override outline secondary */}
                                <div className="flex items-center justify-end gap-2">
                                    {status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleAccept(line)}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-foreground bg-primary hover:opacity-90 rounded-md px-2.5 py-1.5 transition-all shadow-sm"
                                                title="Accept variance"
                                            >
                                                <Heart className="h-3 w-3" aria-hidden="true" />
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => setModalRow(line)}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background hover:bg-muted border border-border rounded-md px-2.5 py-1.5 transition-all"
                                                title="Override with reason"
                                            >
                                                <Flag className="h-3 w-3" aria-hidden="true" />
                                                Override
                                            </button>
                                        </>
                                    )}
                                    {status === 'accepted' && (
                                        <>
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-success bg-success/15 border border-success/40 rounded-md px-2.5 py-1.5 shadow-sm">
                                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                Accepted
                                            </span>
                                            <button
                                                onClick={() => handleUndoRow(line)}
                                                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                title="Undo · back to pending"
                                                aria-label={`Undo accept for line ${line.lineNumber}`}
                                            >
                                                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            </button>
                                        </>
                                    )}
                                    {status === 'overridden' && (
                                        <>
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-info bg-info/15 border border-info/40 rounded-md px-2.5 py-1.5 shadow-sm">
                                                <Wrench className="h-3 w-3" aria-hidden="true" />
                                                Overridden
                                            </span>
                                            <button
                                                onClick={() => handleUndoRow(line)}
                                                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                                title="Undo · back to pending · reason cleared"
                                                aria-label={`Undo override for line ${line.lineNumber}`}
                                            >
                                                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    {/* + Add freight line affordance · dentro section 1 · brand color CTA */}
                    {!freightAdded && (
                        <div className="px-5 py-4 flex items-center gap-3 bg-muted/20">
                            <button
                                onClick={handleAddFreight}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-foreground bg-primary hover:opacity-90 rounded-lg px-3 py-2 transition-opacity shadow-sm"
                            >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Add freight line
                            </button>
                            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1.5">
                                <Truck className="h-3 w-3" aria-hidden="true" />
                                For lines Strata couldn&apos;t match from the PO
                            </span>
                        </div>
                    )}
                    {freightAdded && (
                        <div className="grid grid-cols-[3rem_1fr_3.5rem_3.5rem_5.5rem_5.5rem_5.5rem_11rem] gap-4 px-5 items-center text-xs border-l-4 border-l-success bg-success/5 min-h-[68px] py-3 animate-in fade-in duration-300">
                            <div className="font-mono text-[10px] text-muted-foreground">FR</div>
                            <div className="min-w-0 space-y-0.5">
                                <div className="text-foreground font-semibold text-[11px] truncate">Freight · Teknion consolidated shipment</div>
                                <div className="text-[10px] text-muted-foreground font-mono">FRT-TEK-CONS</div>
                            </div>
                            <div className="text-center text-sm text-muted-foreground">—</div>
                            <div className="text-center text-sm tabular-nums text-foreground">1</div>
                            <div className="text-right text-[11px] text-muted-foreground">—</div>
                            <div className="text-right text-[11px] tabular-nums text-foreground">$210.00</div>
                            <div className="text-right text-[11px] tabular-nums font-bold text-warning">+$210.00</div>
                            <div className="flex items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-success bg-success/15 border border-success/40 rounded-md px-2.5 py-1.5 shadow-sm">
                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                    Added
                                </span>
                                <button
                                    onClick={handleUndoFreight}
                                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    title="Remove freight line"
                                    aria-label="Remove freight line"
                                >
                                    <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ SECTION 2 · AUTO-MATCHED (collapsed by default) ═══════ */}
                <button
                    onClick={() => setShowExactRows(v => !v)}
                    className="w-full px-5 py-3 border-y border-border bg-success/5 flex items-center gap-3 hover:bg-success/10 transition-colors text-left"
                >
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-success">
                        Auto-matched · {exactRows.length} lines to the penny
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">Strata reconciled overnight · no action needed</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                        {showExactRows ? 'Hide' : 'Show'} lines
                    </span>
                    <ArrowRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showExactRows ? 'rotate-90' : ''}`} aria-hidden="true" />
                </button>

                {showExactRows && (
                    <div className="divide-y divide-border animate-in fade-in duration-200">
                        {exactRows.map(line => {
                            const poLine = line.orderedQty * line.orderedPrice
                            const billLine = line.billedQty * line.billedPrice
                            const lineDiff = billLine - poLine
                            return (
                                <div
                                    key={line.lineNumber}
                                    className="grid grid-cols-[3rem_1fr_3.5rem_3.5rem_5.5rem_5.5rem_5.5rem_11rem] gap-4 px-5 items-center text-xs border-l-4 border-l-transparent min-h-[56px] py-2.5 opacity-75"
                                >
                                    <div className="font-mono text-[10px] text-muted-foreground tabular-nums">{line.lineNumber}</div>
                                    <div className="min-w-0 space-y-0.5">
                                        <div className="text-foreground text-[11px] truncate leading-tight">{line.description}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono truncate">{line.itemCode}</div>
                                    </div>
                                    <div className="text-center tabular-nums text-[11px] text-muted-foreground">{line.orderedQty}</div>
                                    <div className="text-center tabular-nums text-[11px] text-muted-foreground">{line.billedQty}</div>
                                    <div className="text-right tabular-nums text-[11px] text-muted-foreground">${line.orderedPrice.toFixed(2)}</div>
                                    <div className="text-right tabular-nums text-[11px] text-muted-foreground">${line.billedPrice.toFixed(2)}</div>
                                    <div className="text-right tabular-nums text-[11px] text-muted-foreground">
                                        {lineDiff === 0 ? '—' : `${lineDiff < 0 ? '−' : '+'}$${Math.abs(lineDiff).toFixed(2)}`}
                                    </div>
                                    <div className="flex items-center justify-end">
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                            Match
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Table footer summary · Accounting action state */}
                <div className="px-5 py-4 border-t border-border bg-muted/20 flex items-center gap-4">
                    <span className="text-[11px] text-muted-foreground">
                        {lines.length - flaggedRows.length} auto-match · <span className="text-success font-semibold">{acceptedCount} accepted</span> · <span className="text-info font-semibold">{overriddenCount} overridden</span> · <span className="text-warning font-semibold">{flaggedRows.length - acceptedCount - overriddenCount} pending</span>
                    </span>
                    {allDecided && applyState === 'idle' && (
                        <button
                            onClick={handleApplyOverrides}
                            className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground py-2 px-3.5 hover:opacity-90 transition-opacity shadow-sm animate-in fade-in duration-300"
                        >
                            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
                            Apply via Multi-Line Edit tool
                        </button>
                    )}
                </div>
            </div>

            {/* Multi-Line Edit tool applying · staged reveal · SOT §12a workaround */}
            {applyState !== 'idle' && (
                <div className="rounded-2xl border border-ai/30 bg-ai/5 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="px-4 py-2.5 border-b border-ai/20 bg-ai-light/40 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-ai" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ai">
                            Multi-Line Edit tool · applying overrides to NetSuite PO-2026-4421
                        </span>
                        {applyState === 'applying' && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-ai">
                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                                Live · {applyStep}/{flaggedRows.length}
                            </span>
                        )}
                        {applyState === 'applied' && (
                            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                Done
                            </span>
                        )}
                    </div>
                    <div className="h-1 bg-muted">
                        <div
                            className="h-full bg-ai transition-all duration-500"
                            style={{ width: `${Math.min(100, (applyStep / Math.max(1, flaggedRows.length)) * 100)}%` }}
                        />
                    </div>
                    <div className="p-4 space-y-1.5">
                        {flaggedRows.map((row, i) => {
                            const isDone = applyStep > i
                            const isActive = applyStep === i && applyState === 'applying'
                            const rowStatus = statuses[row.lineNumber]
                            const noteObj = notes[row.lineNumber]
                            return (
                                <div
                                    key={row.lineNumber}
                                    className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${
                                        applyStep < i && applyState === 'applying' ? 'opacity-40' : 'opacity-100'
                                    }`}
                                >
                                    {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" aria-hidden="true" />}
                                    {isActive && <Loader2 className="h-3.5 w-3.5 text-ai animate-spin shrink-0" aria-hidden="true" />}
                                    {!isDone && !isActive && <span className="h-3.5 w-3.5 rounded-full border border-border shrink-0" aria-hidden="true" />}
                                    <span className={isActive ? 'text-foreground font-semibold' : isDone ? 'text-foreground' : 'text-muted-foreground'}>
                                        Line {row.lineNumber} · {row.itemCode} · {rowStatus === 'accepted' ? 'accepted' : `override: ${noteObj?.reason ?? 'other'}`}
                                    </span>
                                    <span className="ml-auto tabular-nums text-[10px] text-muted-foreground">
                                        {row.orderedQty} → {row.billedQty} @ ${row.billedPrice.toFixed(2)}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    {applyState === 'applied' && (
                        <div className="px-5 py-4 border-t border-ai/20 bg-success/5 flex items-center gap-3 animate-in fade-in duration-400">
                            <CheckCircle2 className="h-4 w-4 text-success shrink-0" aria-hidden="true" />
                            <span className="text-xs text-foreground flex-1">
                                NetSuite PO-2026-4421 updated · bill recomputed to <span className="tabular-nums font-semibold">${totalBill.toFixed(2)}</span>. Install-vendor bill (WBD) still needs {jacob.fullName.split(' ')[0]} sign-off.
                            </span>
                            <button
                                onClick={nextStep}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold rounded-lg bg-primary text-primary-foreground py-2 px-3.5 hover:opacity-90 transition-opacity shadow-sm"
                            >
                                Handle install-vendor exception
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            )}


            {/* Override reason modal · tone=neutral usa brand lime (LAW 3) · consistent con main CTAs */}
            <ReasonDialog
                isOpen={modalRow !== null}
                onClose={() => setModalRow(null)}
                onSubmit={(payload) => modalRow && handleOverrideSubmit(modalRow, payload)}
                tone="neutral"
                title={`Override line ${modalRow?.lineNumber ?? ''} · ${modalRow?.itemCode ?? ''}`}
                subtitle={modalRow ? getMismatchLabel(modalRow) : ''}
                contextBanner={{
                    icon: <Wrench className="h-4 w-4" aria-hidden="true" />,
                    title: 'Multi-Line Edit tool workaround',
                    body: 'Your override + reason gets logged to the NetSuite audit trail · Compliance reviews override taxonomy weekly.',
                }}
                categories={OVERRIDE_CATEGORIES}
                defaultCategoryId="partial-ship"
                categoryPrompt="Cause of mismatch"
                notesPlaceholder="e.g. Teknion CS confirmed partial ship · rest arrives 2026-08-21..."
                notesRequiredForCategoryId="other"
                confirmLabel="Log override + apply"
            />

            {/* Toast overlay · action feedback (bottom-right) */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`rounded-lg border shadow-lg px-4 py-3 flex items-center gap-2 ${
                        toast.tone === 'success' ? 'bg-success/10 border-success/40' : 'bg-info/10 border-info/40'
                    }`}>
                        {toast.tone === 'success' ? (
                            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        ) : (
                            <Wrench className="h-4 w-4 text-info" aria-hidden="true" />
                        )}
                        <span className="text-xs font-semibold text-foreground">{toast.message}</span>
                        <button
                            onClick={() => setToast(null)}
                            className="ml-2 text-muted-foreground hover:text-foreground"
                            aria-label="Dismiss"
                        >
                            <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {/* Sticky Accounting context banner · shown when pending action */}
            {!allDecided && flaggedRows.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 rounded-full bg-card border border-primary/40 shadow-lg px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="h-6 w-6 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[10px] font-bold">
                        {daniel.initials}
                    </div>
                    <span className="text-xs text-foreground">
                        <span className="font-semibold">{daniel.fullName.split(' ')[0]}</span> · Accept variance o log override reason
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                        {flaggedRows.length - acceptedCount - overriddenCount} of {flaggedRows.length} pending
                    </span>
                </div>
            )}
        </div>
    )
}
