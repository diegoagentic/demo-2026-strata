/**
 * F84 · PaymentApprovalModal · used by F1 p1.3.
 *
 * Compliance approves the Tuesday ACH batch. Prod shape references:
 * expert-hub ComparisonReviewModal header (icon + short title + status pill
 * · muted meta strip · body scroll · footer with 3 primary actions Accept /
 * Review / Reject · same pattern applied here).
 *
 * Zero decoration · zero KPI heros · zero warning banners. Modal overlay
 * positioning follows F83.S (z-[400] + md:pl-[336px]).
 */

import { Fragment, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Wallet, CheckCircle2, ShieldAlert, AlertTriangle, X, Loader2,
    MessageSquare, XCircle, Send, Check, RotateCcw,
} from 'lucide-react'

interface PaymentApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    onApproved?: () => void
}

interface PaymentRow {
    id: string
    vendor: string
    entity: 'Dealer A' | 'Dealer A Corp.' | 'Culture LLC'
    invoiceNumber: string
    amount: number
    duplicate?: boolean
}

const BATCH: PaymentRow[] = [
    { id: 'PJX-BILL-8483', vendor: 'Teknion',            entity: 'Dealer A',  invoiceNumber: 'TEK-2026-0847', amount: 24429.06 },
    { id: 'PJX-BILL-8472', vendor: 'HBF',                entity: 'Dealer A',  invoiceNumber: 'HBF-24911',     amount: 12420.00 },
    { id: 'PJX-BILL-8473', vendor: 'Boss Design',        entity: 'Dealer A',  invoiceNumber: 'BDG-00-1928',   amount:  3855.40 },
    { id: 'PJX-BILL-8474', vendor: 'Alamir',             entity: 'Dealer A Corp.', invoiceNumber: 'AL-2026-08-0033', amount:  892.00 },
    { id: 'PJX-BILL-8475', vendor: 'Nelson and Company', entity: 'Dealer A',  invoiceNumber: 'NLC-99120',     amount:  6720.00 },
    { id: 'PJX-BILL-8476', vendor: 'Teknion',            entity: 'Dealer A Corp.', invoiceNumber: 'TEK-2026-0851', amount: 18240.55 },
    { id: 'PJX-BILL-8477', vendor: 'HBF',                entity: 'Dealer A',  invoiceNumber: 'HBF-24915',     amount:  2140.00 },
    { id: 'PJX-BILL-8480', vendor: 'Alamir',             entity: 'Culture LLC',  invoiceNumber: 'AL-2026-08-0041', amount:  445.00 },
    { id: 'PJX-DUP-8499',  vendor: 'Nelson and Company', entity: 'Dealer A',  invoiceNumber: 'NLC-99120',     amount:  6720.00, duplicate: true },
]

type Stage =
    | 'idle'
    | 'approving' | 'approved'
    | 'commenting' | 'commented'
    | 'rejecting' | 'rejected'

// F84.36 · per-row decision · Compliance can approve/reject each bill
// individually before releasing the batch. Duplicates stay `held` and
// cannot flip. Default `pending` for the rest.
type RowDecision = 'pending' | 'approved' | 'rejected' | 'held'

export default function PaymentApprovalModal({ isOpen, onClose, onApproved }: PaymentApprovalModalProps) {
    const [stage, setStage] = useState<Stage>('idle')
    const [comment, setComment] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [rowDecisions, setRowDecisions] = useState<Record<string, RowDecision>>(() =>
        Object.fromEntries(BATCH.map(b => [b.id, b.duplicate ? 'held' as const : 'pending' as const])),
    )

    const releasable = BATCH.filter(b => !b.duplicate)
    const duplicateCount = BATCH.filter(b => b.duplicate).length
    const counts = useMemo(() => {
        let approved = 0, rejected = 0, pending = 0, approvedTotal = 0
        for (const row of releasable) {
            const d = rowDecisions[row.id]
            if (d === 'approved') { approved += 1; approvedTotal += row.amount }
            else if (d === 'rejected') { rejected += 1 }
            else { pending += 1 }
        }
        return { approved, rejected, pending, approvedTotal }
    }, [rowDecisions, releasable])
    const totalReleasable = releasable.reduce((s, b) => s + b.amount, 0)
    // If nothing was explicitly approved, treat all non-rejected pending as
    // approved on batch release · lets Compliance skim + release without
    // clicking every row individually.
    const impliedApprove = counts.approved === 0 && counts.pending > 0
    const releaseCount = counts.approved + (impliedApprove ? counts.pending : 0)
    const releaseTotal = counts.approvedTotal + (impliedApprove
        ? releasable.filter(r => rowDecisions[r.id] === 'pending').reduce((s, r) => s + r.amount, 0)
        : 0)
    const canRelease = releaseCount > 0

    const setDecision = (id: string, decision: RowDecision) => {
        if (stage !== 'idle') return
        setRowDecisions(prev => {
            if (prev[id] === 'held') return prev
            return { ...prev, [id]: prev[id] === decision ? 'pending' : decision }
        })
    }

    const handleApprove = () => {
        if (stage !== 'idle' || !canRelease) return
        setStage('approving')
        setTimeout(() => {
            setStage('approved')
            onApproved?.()
        }, 1200)
    }

    const handleSendComment = () => {
        if (!comment.trim()) return
        setStage('commented')
    }

    const handleConfirmReject = () => {
        if (!rejectReason.trim()) return
        setStage('rejected')
    }

    const statusPill = () => {
        if (stage === 'approved') return { cls: 'bg-success/15 text-success', icon: <CheckCircle2 className="h-3 w-3" aria-hidden="true" />, label: 'Released' }
        if (stage === 'commented') return { cls: 'bg-info/15 text-info', icon: <MessageSquare className="h-3 w-3" aria-hidden="true" />, label: 'Comment sent · awaiting reply' }
        if (stage === 'rejected') return { cls: 'bg-destructive/15 text-destructive', icon: <XCircle className="h-3 w-3" aria-hidden="true" />, label: 'Rejected · returned to Compliance' }
        return { cls: 'bg-primary/15 text-foreground', icon: <ShieldAlert className="h-3 w-3" aria-hidden="true" />, label: 'Pending CEO review' }
    }
    const pill = statusPill()

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[400]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-y-0 right-0 left-0 md:left-[320px] bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
                </TransitionChild>
                <div className="fixed inset-0 flex items-start justify-center p-4 sm:p-8 md:pl-[336px] overflow-y-auto">
                    <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                        <DialogPanel className="w-full max-w-4xl my-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
                            {/* Header · prod ComparisonReviewModal shape */}
                            <div className="p-5 border-b border-border">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Wallet className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                                        <h2 className="text-base font-bold text-foreground">Tue payment run · release ACH batch</h2>
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${pill.cls}`}>
                                            {pill.icon}
                                            {pill.label}
                                        </span>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        aria-label="Close payment run"
                                        className="rounded-lg p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0"
                                    >
                                        <X className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                                    <span>Bills tab · Tue 08:15 AM</span>
                                    <span>·</span>
                                    <span>{releasable.length} bills</span>
                                    <span>·</span>
                                    <span className="tabular-nums text-foreground font-semibold">${totalReleasable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span>·</span>
                                    <span className="tabular-nums text-warning inline-flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                        {duplicateCount} duplicate held
                                    </span>
                                    {(counts.approved > 0 || counts.rejected > 0) && (
                                        <>
                                            <span>·</span>
                                            {counts.approved > 0 && (
                                                <span className="tabular-nums text-success inline-flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                    {counts.approved} approved
                                                </span>
                                            )}
                                            {counts.rejected > 0 && (
                                                <span className="tabular-nums text-destructive inline-flex items-center gap-1 ml-1">
                                                    <XCircle className="h-3 w-3" aria-hidden="true" />
                                                    {counts.rejected} rejected
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Body · payment queue table with per-row Approve/Reject actions */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-[1fr_110px_130px_100px_110px_88px] px-5 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                                    <span>Vendor</span>
                                    <span>Entity</span>
                                    <span>Invoice #</span>
                                    <span className="text-right">Amount</span>
                                    <span className="text-right">Status</span>
                                    <span className="text-right">Actions</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {BATCH.map(row => {
                                        const decision = rowDecisions[row.id]
                                        const rowClass = row.duplicate
                                            ? 'bg-warning/5'
                                            : decision === 'approved'
                                                ? 'bg-success/5'
                                                : decision === 'rejected'
                                                    ? 'bg-destructive/5'
                                                    : ''
                                        const locked = stage !== 'idle' || row.duplicate
                                        return (
                                            <div key={row.id} className={`grid grid-cols-[1fr_110px_130px_100px_110px_88px] px-5 py-3 text-xs items-center transition-colors ${rowClass}`}>
                                                <div>
                                                    <div className="text-foreground font-semibold">{row.vendor}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">{row.id}</div>
                                                </div>
                                                <div className="text-muted-foreground">{row.entity}</div>
                                                <div className="text-muted-foreground font-mono">{row.invoiceNumber}</div>
                                                <div className={`text-right tabular-nums font-semibold ${decision === 'rejected' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                    ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                                <div className="text-right">
                                                    {row.duplicate ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                                                            Held · duplicate
                                                        </span>
                                                    ) : decision === 'approved' ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                            Approved
                                                        </span>
                                                    ) : decision === 'rejected' ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive bg-destructive/10 rounded px-1.5 py-0.5">
                                                            <XCircle className="h-3 w-3" aria-hidden="true" />
                                                            Rejected
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground">Pending CEO</span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {row.duplicate ? (
                                                        <span className="text-[10px] text-muted-foreground italic">—</span>
                                                    ) : (
                                                        <div className="inline-flex items-center gap-1 justify-end">
                                                            {(decision === 'approved' || decision === 'rejected') ? (
                                                                <button
                                                                    onClick={() => setDecision(row.id, 'pending')}
                                                                    disabled={locked}
                                                                    aria-label={`Reset decision for ${row.vendor} ${row.invoiceNumber}`}
                                                                    title="Reset to pending"
                                                                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground bg-background hover:text-foreground hover:bg-muted border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                                >
                                                                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => setDecision(row.id, 'approved')}
                                                                        disabled={locked}
                                                                        aria-label={`Approve ${row.vendor} ${row.invoiceNumber}`}
                                                                        title="Approve this bill"
                                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-success bg-background hover:bg-success/10 border border-success/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                                    >
                                                                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDecision(row.id, 'rejected')}
                                                                        disabled={locked}
                                                                        aria-label={`Reject ${row.vendor} ${row.invoiceNumber}`}
                                                                        title="Reject this bill"
                                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-md text-destructive bg-background hover:bg-destructive/10 border border-destructive/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
                                    <ShieldAlert className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                                    <span>Duplicate-payment control · Strata caught Nelson NLC-99120 matches last remittance (2026-07-08) · same invoice #, same amount, same vendor. Held for Compliance review before release.</span>
                                </div>
                            </div>

                            {/* F84.5 · Post-approval confirmation */}
                            {stage === 'approved' && (
                                <div className="px-5 py-4 border-t border-border bg-success/5 flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0 text-xs">
                                        <div className="text-foreground font-semibold">Payment released · handoff to Dealer flows</div>
                                        <div className="text-muted-foreground mt-1">
                                            {releaseCount} bills posted to NetSuite · ${releaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ACH batch sent to the bank
                                            {counts.rejected > 0 && <> · {counts.rejected} rejected returned to Compliance for follow-up</>}
                                            {duplicateCount > 0 && <> · {duplicateCount} duplicate still on hold</>}
                                            . Use the sidebar to switch to <span className="text-foreground font-semibold">Dealer</span> when ready to walk vendor onboarding and billing next.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* F84.6 · Comment composer · leave note for another stakeholder */}
                            {stage === 'commenting' && (
                                <div className="px-5 py-4 border-t border-border bg-info/5 space-y-3">
                                    <div className="flex items-center gap-2 text-xs">
                                        <MessageSquare className="h-4 w-4 text-info shrink-0" aria-hidden="true" />
                                        <span className="text-foreground font-semibold">Leave a note for another stakeholder</span>
                                        <span className="text-muted-foreground">· goes to Compliance thread on the batch record</span>
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                        placeholder="e.g. Please double-check Nelson NLC-99120 against the July remittance before we release."
                                        className="w-full text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-info/40 placeholder:text-muted-foreground"
                                    />
                                </div>
                            )}
                            {stage === 'commented' && (
                                <div className="px-5 py-4 border-t border-border bg-info/5 flex items-start gap-3">
                                    <MessageSquare className="h-5 w-5 text-info shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0 text-xs">
                                        <div className="text-foreground font-semibold">Comment sent to Compliance</div>
                                        <div className="text-muted-foreground mt-1 line-clamp-2 italic">&ldquo;{comment}&rdquo;</div>
                                        <div className="text-muted-foreground mt-1">Batch parked · will resume on their reply.</div>
                                    </div>
                                </div>
                            )}

                            {/* F84.6 · Reject reason capture · destructive path */}
                            {stage === 'rejecting' && (
                                <div className="px-5 py-4 border-t border-border bg-destructive/5 space-y-3">
                                    <div className="flex items-center gap-2 text-xs">
                                        <XCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true" />
                                        <span className="text-foreground font-semibold">Reject the ACH batch · reason required</span>
                                        <span className="text-muted-foreground">· returns to Compliance for adjustment</span>
                                    </div>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        rows={3}
                                        placeholder="e.g. Batch total is above the Tuesday cash-flow target · move Boss Design + one Alamir to Thursday."
                                        className="w-full text-xs bg-background border border-input rounded-lg px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 placeholder:text-muted-foreground"
                                    />
                                </div>
                            )}
                            {stage === 'rejected' && (
                                <div className="px-5 py-4 border-t border-border bg-destructive/5 flex items-start gap-3">
                                    <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
                                    <div className="flex-1 min-w-0 text-xs">
                                        <div className="text-foreground font-semibold">Batch rejected · returned to Compliance</div>
                                        <div className="text-muted-foreground mt-1 line-clamp-2 italic">&ldquo;{rejectReason}&rdquo;</div>
                                        <div className="text-muted-foreground mt-1">Nothing released · Compliance re-cuts the batch based on the note.</div>
                                    </div>
                                </div>
                            )}

                            {/* Footer · 3 primary actions (Reject · Comment · Approve) */}
                            <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center gap-2 flex-wrap">
                                <div className="text-xs text-muted-foreground flex-1 min-w-0">
                                    Human sign-off preserved · Strata prepares ACH entries · never auto-releases.
                                </div>

                                {stage === 'idle' && (
                                    <>
                                        <button
                                            onClick={() => setStage('rejecting')}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive bg-background hover:bg-destructive/5 border border-destructive/40 rounded-lg px-3 py-2 transition-colors"
                                        >
                                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => setStage('commenting')}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors"
                                        >
                                            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                                            Leave comment
                                        </button>
                                        <button
                                            onClick={handleApprove}
                                            disabled={!canRelease}
                                            title={canRelease ? undefined : 'Approve at least one bill · or leave rows pending to release all'}
                                            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            {counts.approved > 0
                                                ? `Release ${releaseCount} approved · $${releaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                : counts.rejected > 0
                                                    ? `Release ${releaseCount} remaining · $${releaseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                    : 'Approve ACH batch'}
                                        </button>
                                    </>
                                )}

                                {stage === 'approving' && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ai py-2 px-4">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                        Preparing ACH entries…
                                    </div>
                                )}

                                {stage === 'commenting' && (
                                    <>
                                        <button
                                            onClick={() => { setStage('idle'); setComment('') }}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSendComment}
                                            disabled={!comment.trim()}
                                            className="inline-flex items-center gap-1.5 bg-info text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Send className="h-3.5 w-3.5" aria-hidden="true" />
                                            Send comment
                                        </button>
                                    </>
                                )}

                                {stage === 'rejecting' && (
                                    <>
                                        <button
                                            onClick={() => { setStage('idle'); setRejectReason('') }}
                                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border rounded-lg px-3 py-2 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleConfirmReject}
                                            disabled={!rejectReason.trim()}
                                            className="inline-flex items-center gap-1.5 bg-destructive text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                                            Confirm reject
                                        </button>
                                    </>
                                )}

                                {(stage === 'approved' || stage === 'commented' || stage === 'rejected') && (
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                                    >
                                        Close
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
