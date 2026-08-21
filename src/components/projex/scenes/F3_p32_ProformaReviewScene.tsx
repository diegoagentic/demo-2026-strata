/**
 * COMPONENT: F3_p32_ProformaReviewScene (Projex · p3.2)
 * PURPOSE: Coordinator opens drafted proforma · print-style replica con line items ·
 *          design fee · surcharge · deposit deducted. Editable line adjustments
 *          before release. Human touch preserved.
 *
 * SHAPE LOCK · print-style proforma modal (F3 primary shape)
 * REUSE · lifted vendor/strata-experiences-demo/manufacturer/ProformaInvoiceModal + editable rows
 * NOTIF · dispatchea `projex:proforma-approved` on release
 */

import { useState } from 'react'
import {
    Printer, DollarSign, CheckCircle2, Loader2, ArrowRight,
    Edit3, User, Calendar, Building2, FileText, Ban, MessageSquare, RotateCcw,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import ReasonDialog, { type ReasonPayload } from '../../shared/ReasonDialog'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

interface LineItem {
    id: string
    description: string
    qty: number
    unitPrice: number
}

const PROFORMA_LINES: LineItem[] = [
    { id: 'L1', description: 'Furniture · phase 2 · Teknion Expansion desks (12)',       qty: 12, unitPrice: 420 },
    { id: 'L2', description: 'HBF task chairs · ergonomic mesh',                          qty: 20, unitPrice: 610 },
    { id: 'L3', description: 'Boss Design collaboration seating · 4-pack',                qty: 3,  unitPrice: 1240 },
    { id: 'L4', description: 'Alamir accessories · monitor arms + keyboard trays',        qty: 20, unitPrice: 145 },
    { id: 'L5', description: 'Design fee · phase 2 (8% of subtotal)',                     qty: 1,  unitPrice: 2100 },
    { id: 'L6', description: 'Freight + handling · consolidated shipment',                qty: 1,  unitPrice: 850 },
]

export default function F3_p32_ProformaReviewScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const isabella = PROJEX_PERSONAS.isabella

    const [lines, setLines] = useState<LineItem[]>(PROFORMA_LINES)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [releaseState, setReleaseState] = useState<'idle' | 'releasing' | 'released' | 'rejected'>('idle')
    const [dialogMode, setDialogMode] = useState<null | 'reject' | 'clarify'>(null)
    const [rejectPayload, setRejectPayload] = useState<ReasonPayload | null>(null)
    const [clarifyPayload, setClarifyPayload] = useState<ReasonPayload | null>(null)

    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
    const depositReceived = 24500 // 40% · matches AR-3421 amount from arAging mock
    const drawAmount = subtotal - depositReceived

    // No AC notif · UI shows Approve/Reject/Request info directly
    const highlight = false

    const handleQtyChange = (id: string, newQty: number) => {
        setLines(prev => prev.map(l => l.id === id ? { ...l, qty: Math.max(0, newQty) } : l))
    }

    const handleRelease = () => {
        if (releaseState !== 'idle') return
        setReleaseState('releasing')
        pauseAwareTimeout(() => {
            setReleaseState('released')
            window.dispatchEvent(new CustomEvent('projex:proforma-approved'))
        }, 1000)
    }

    const handleRejectSubmit = (payload: ReasonPayload) => {
        setRejectPayload(payload)
        setDialogMode(null)
        setReleaseState('rejected')
    }

    const handleClarifySubmit = (payload: ReasonPayload) => {
        setClarifyPayload(payload)
        setDialogMode(null)
    }

    const handleUndoReject = () => {
        setRejectPayload(null)
        setReleaseState('idle')
    }

    const REJECT_REASONS = [
        { id: 'line-item-wrong', label: 'Line item incorrect · quantity or unit price off' },
        { id: 'deposit-mismatch', label: 'Deposit amount doesn\'t match records' },
        { id: 'wrong-milestone', label: 'Wrong milestone · should be a different draw %' },
        { id: 'project-scope',   label: 'Project scope changed · re-draft needed' },
        { id: 'other',           label: 'Other · describe below' },
    ]

    const CLARIFY_REASONS = [
        { id: 'confirm-scope',    label: 'Confirm project scope for this milestone' },
        { id: 'confirm-deposit',  label: 'Confirm deposit was received (bank statement?)' },
        { id: 'confirm-freight',  label: 'Confirm freight/design fee calculation' },
        { id: 'confirm-timing',   label: 'Confirm timing · is client ready for this invoice?' },
        { id: 'other',            label: 'Other · describe below' },
    ]

    const rejectReasonLabel = rejectPayload
        ? REJECT_REASONS.find(r => r.id === rejectPayload.categoryId)?.label ?? 'Other'
        : null
    const clarifyReasonLabel = clarifyPayload
        ? CLARIFY_REASONS.find(r => r.id === clarifyPayload.categoryId)?.label ?? 'Other'
        : null
    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
            <h1 className="text-2xl font-bold text-foreground">
                    Coordinator proforma review · {isabella.fullName.split(' ')[0]} adjusts before release
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Print-style proforma replica · editable line items · deposit deducted · human touch preserved.
                </p>
            </div>

            {/* Layout · proforma document (izq · 65%) + summary panel (der · 35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 items-start">

                {/* Print-style proforma */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Printer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Proforma invoice · PJX-INV-3421 · draft
                        </span>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Header · doc metadata */}
                        <div className="border-b border-border pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-lg font-bold text-foreground">Proforma Invoice</div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Draft · not yet posted</div>
                                </div>
                                <div className="text-right text-xs">
                                    <div className="text-foreground font-mono font-semibold">PJX-INV-3421</div>
                                    <div className="text-muted-foreground">Issued 2026-08-14</div>
                                    <div className="text-muted-foreground">Net 10 · 1.5%/mo late</div>
                                </div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Bill to</div>
                                    <div className="text-foreground font-semibold mt-0.5">Fairport HQ · phase 2</div>
                                    <div className="text-muted-foreground">Attn: AP · 555 Fairport Ave</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Milestone</div>
                                    <div className="text-foreground font-semibold mt-0.5">Furniture 50/40/10 · 40% draw</div>
                                    <div className="text-muted-foreground">Ordered 52% · fires at 50</div>
                                </div>
                            </div>
                        </div>

                        {/* Line items · editable */}
                        <div className="space-y-1">
                            <div className="grid grid-cols-[1fr_60px_100px_100px_28px] gap-2 pb-2 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                                <span>Description</span>
                                <span className="text-right">Qty</span>
                                <span className="text-right">Unit price</span>
                                <span className="text-right">Total</span>
                                <span></span>
                            </div>
                            {lines.map(l => {
                                const isEditing = editingId === l.id
                                return (
                                    <div key={l.id} className="grid grid-cols-[1fr_60px_100px_100px_28px] gap-2 py-2 border-b border-border/40 items-center text-xs">
                                        <span className="text-foreground truncate">{l.description}</span>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={l.qty}
                                                onChange={e => handleQtyChange(l.id, parseInt(e.target.value) || 0)}
                                                onBlur={() => setEditingId(null)}
                                                autoFocus
                                                className="text-right tabular-nums bg-primary/10 border border-primary rounded px-1 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                            />
                                        ) : (
                                            <span className="text-right text-foreground tabular-nums">{l.qty}</span>
                                        )}
                                        <span className="text-right text-muted-foreground tabular-nums">${l.unitPrice.toLocaleString()}</span>
                                        <span className="text-right text-foreground font-semibold tabular-nums">${(l.qty * l.unitPrice).toLocaleString()}</span>
                                        <button
                                            onClick={() => setEditingId(isEditing ? null : l.id)}
                                            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                            aria-label="Edit qty"
                                        >
                                            <Edit3 className="h-3 w-3" aria-hidden="true" />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Totals · deposit deducted */}
                        <div className="border-t border-border pt-3 space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Subtotal (contract value)</span>
                                <span className="text-foreground tabular-nums">${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Less · deposit received (50%)</span>
                                <span className="text-warning tabular-nums">−${depositReceived.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                                <span className="text-foreground font-bold">40% draw · due Net 10</span>
                                <span className="text-foreground font-bold tabular-nums">${drawAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary + release panel */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Release summary</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Project</div>
                            <div className="text-sm text-foreground font-semibold mt-0.5">Fairport HQ · phase 2</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Draft amount</div>
                            <div className="text-2xl text-foreground font-bold tabular-nums mt-0.5">${drawAmount.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground">40% draw · Net 10 · 1.5%/mo late</div>
                        </div>
                        <div className="pt-3 border-t border-border">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Approval</div>
                            <div className="flex items-center gap-2 text-xs">
                                <div className="h-7 w-7 rounded-full bg-ai/15 text-ai flex items-center justify-center text-[10px] font-bold">
                                    {isabella.initials}
                                </div>
                                <span className="text-foreground">{isabella.fullName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border space-y-2">
                        {releaseState === 'idle' && (
                            <>
                                <button
                                    onClick={handleRelease}
                                    data-ac-highlight
                                    className={`w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-90 transition-opacity ${highlight ? 'ring-2 ring-primary/60 animate-pulse' : ''}`}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    Approve + release
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setDialogMode('clarify')}
                                        className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-2.5 py-2 transition-colors"
                                    >
                                        <MessageSquare className="h-3 w-3 text-info" aria-hidden="true" />
                                        Request info
                                    </button>
                                    <button
                                        onClick={() => setDialogMode('reject')}
                                        className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-destructive bg-background hover:bg-destructive/5 border border-destructive/30 rounded-lg px-2.5 py-2 transition-colors"
                                    >
                                        <Ban className="h-3 w-3" aria-hidden="true" />
                                        Reject
                                    </button>
                                </div>
                                {clarifyReasonLabel && (
                                    <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-info bg-info/10 rounded px-2 py-1 mt-1">
                                        <MessageSquare className="h-3 w-3" aria-hidden="true" />
                                        Clarification sent · {clarifyReasonLabel}
                                    </div>
                                )}
                            </>
                        )}
                        {releaseState === 'releasing' && (
                            <div className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-ai animate-pulse py-2.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                Releasing…
                            </div>
                        )}
                        {releaseState === 'rejected' && (
                            <div className="space-y-2">
                                <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs">
                                    <div className="inline-flex items-center gap-1.5 font-bold text-destructive">
                                        <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                                        Rejected · returned for re-draft
                                    </div>
                                    <div className="text-muted-foreground mt-1">
                                        <strong className="text-foreground font-semibold">Reason:</strong> {rejectReasonLabel}
                                        {rejectPayload?.notes && <><br />{rejectPayload.notes}</>}
                                    </div>
                                </div>
                                <button
                                    onClick={handleUndoReject}
                                    className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-2.5 py-2 transition-colors"
                                >
                                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                    Undo rejection
                                </button>
                            </div>
                        )}
                        {releaseState === 'released' && (
                            <button
                                onClick={nextStep}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-foreground text-background text-xs font-bold px-3 py-2.5 rounded-lg hover:opacity-80 transition-opacity"
                            >
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                Continue · Walls PM gate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Never auto-release</div>
                    <div className="text-muted-foreground mt-0.5">Coordinator keeps final say · coordinator judgment preserved (FC11 addressed but not eliminated).</div>
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-[10px] text-muted-foreground tabular-nums">Due 2026-08-24</span>
            </div>


            {/* Request info dialog · info tone */}
            <ReasonDialog
                isOpen={dialogMode === 'clarify'}
                onClose={() => setDialogMode(null)}
                onSubmit={handleClarifySubmit}
                tone="info"
                title="Request info before releasing"
                subtitle="Approval stays open · question logged + notification sent · re-review when the answer lands."
                icon={<MessageSquare className="h-5 w-5" aria-hidden="true" />}
                categories={CLARIFY_REASONS}
                defaultCategoryId="confirm-scope"
                categoryPrompt="What to clarify"
                notesLabel="Question"
                notesPlaceholder="e.g. Is the client aware of the milestone tranche timing?"
                notesRequiredForCategoryId="other"
                notifyToggle={{
                    defaultOn: true,
                    title: 'Ping originator on Teams',
                    description: 'Sends the question immediately · logs the thread to the proforma record.',
                }}
                confirmLabel="Send question"
                confirmLabelWhenNotifying="Send + ping on Teams"
            />

            {/* Reject dialog · danger tone */}
            <ReasonDialog
                isOpen={dialogMode === 'reject'}
                onClose={() => setDialogMode(null)}
                onSubmit={handleRejectSubmit}
                tone="danger"
                title="Reject proforma draft"
                subtitle="Return the proforma for re-draft · Strata will queue the correction request + notify the originator."
                icon={<Ban className="h-5 w-5" aria-hidden="true" />}
                categories={REJECT_REASONS}
                defaultCategoryId="line-item-wrong"
                categoryPrompt="Reason for rejection"
                notesLabel="Notes (optional)"
                notesPlaceholder="Add specific corrections needed…"
                notesRequiredForCategoryId="other"
                notifyToggle={{
                    defaultOn: true,
                    title: 'Notify originator',
                    description: 'Sends the reason via Action Center + email · logs decision to the audit trail.',
                }}
                confirmLabel="Reject draft"
                confirmLabelWhenNotifying="Reject + notify"
            />
        </div>
    )
}
