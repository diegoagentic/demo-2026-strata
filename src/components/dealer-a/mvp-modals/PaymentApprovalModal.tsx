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
    MessageSquare, XCircle, Send, Check, RotateCcw, ChevronDown, ChevronRight,
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
    /** F86.6 · Diego 2026-08-21 · CEO ask · surface Order GP ($ + %) so the
        Approver reviewing this batch has margin context per bill, not just
        the payable amount. Values reflect the underlying order's gross
        profit dollars and percentage. */
    orderGpAmount: number
    orderGpPct: number
    duplicate?: boolean
}

// F86.11 · Diego 2026-08-21 · CEO ask · realistic vendor volume so the
// vendor-grouped view has meaning · one big vendor (Teknion · 8 bills)
// balances a couple of small ones · this is the shape the Approver
// actually reviews (batch of ~26 across 6 vendors).
const BATCH: PaymentRow[] = [
    // Teknion · biggest vendor · 8 bills
    { id: 'PJX-BILL-8483', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0847',   amount: 24429.06, orderGpAmount:  5133, orderGpPct: 21 },
    { id: 'PJX-BILL-8476', vendor: 'Teknion',            entity: 'Dealer A Corp.', invoiceNumber: 'TEK-2026-0851',   amount: 18240.55, orderGpAmount:  3648, orderGpPct: 20 },
    { id: 'PJX-BILL-8484', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0858',   amount:  8420.00, orderGpAmount:  1852, orderGpPct: 22 },
    { id: 'PJX-BILL-8485', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0862',   amount:  6180.20, orderGpAmount:  1298, orderGpPct: 21 },
    { id: 'PJX-BILL-8486', vendor: 'Teknion',            entity: 'Dealer A Corp.', invoiceNumber: 'TEK-2026-0871',   amount:  4720.00, orderGpAmount:   991, orderGpPct: 21 },
    { id: 'PJX-BILL-8487', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0874',   amount:  3255.00, orderGpAmount:   683, orderGpPct: 21 },
    { id: 'PJX-BILL-8488', vendor: 'Teknion',            entity: 'Dealer A',      invoiceNumber: 'TEK-2026-0879',   amount:  2115.80, orderGpAmount:   445, orderGpPct: 21 },
    { id: 'PJX-BILL-8489', vendor: 'Teknion',            entity: 'Culture LLC',   invoiceNumber: 'TEK-2026-0883',   amount:  1240.00, orderGpAmount:   260, orderGpPct: 21 },
    // HBF · 5 bills
    { id: 'PJX-BILL-8472', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24911',       amount: 12420.00, orderGpAmount:  3105, orderGpPct: 25 },
    { id: 'PJX-BILL-8477', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24915',       amount:  2140.00, orderGpAmount:   535, orderGpPct: 25 },
    { id: 'PJX-BILL-8490', vendor: 'HBF',                entity: 'Dealer A Corp.', invoiceNumber: 'HBF-24920',       amount:  5620.00, orderGpAmount:  1405, orderGpPct: 25 },
    { id: 'PJX-BILL-8491', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24924',       amount:  3180.00, orderGpAmount:   795, orderGpPct: 25 },
    { id: 'PJX-BILL-8492', vendor: 'HBF',                entity: 'Dealer A',      invoiceNumber: 'HBF-24927',       amount:  1240.00, orderGpAmount:   310, orderGpPct: 25 },
    // Nelson and Company · 4 bills
    { id: 'PJX-BILL-8475', vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99120',       amount:  6720.00, orderGpAmount:  1546, orderGpPct: 23 },
    { id: 'PJX-BILL-8493', vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99138',       amount:  4210.50, orderGpAmount:   968, orderGpPct: 23 },
    { id: 'PJX-BILL-8494', vendor: 'Nelson and Company', entity: 'Dealer A Corp.', invoiceNumber: 'NLC-99145',       amount:  2840.00, orderGpAmount:   653, orderGpPct: 23 },
    { id: 'PJX-BILL-8495', vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99152',       amount:  1620.00, orderGpAmount:   373, orderGpPct: 23 },
    // Boss Design · 3 bills
    { id: 'PJX-BILL-8473', vendor: 'Boss Design',        entity: 'Dealer A',      invoiceNumber: 'BDG-00-1928',     amount:  3855.40, orderGpAmount:   848, orderGpPct: 22 },
    { id: 'PJX-BILL-8496', vendor: 'Boss Design',        entity: 'Dealer A',      invoiceNumber: 'BDG-00-1935',     amount:  2140.00, orderGpAmount:   471, orderGpPct: 22 },
    { id: 'PJX-BILL-8497', vendor: 'Boss Design',        entity: 'Dealer A Corp.', invoiceNumber: 'BDG-00-1942',     amount:  1280.00, orderGpAmount:   282, orderGpPct: 22 },
    // Alamir · 4 bills
    { id: 'PJX-BILL-8474', vendor: 'Alamir',             entity: 'Dealer A Corp.', invoiceNumber: 'AL-2026-08-0033', amount:   892.00, orderGpAmount:   214, orderGpPct: 24 },
    { id: 'PJX-BILL-8480', vendor: 'Alamir',             entity: 'Culture LLC',   invoiceNumber: 'AL-2026-08-0041', amount:   445.00, orderGpAmount:   107, orderGpPct: 24 },
    { id: 'PJX-BILL-8498', vendor: 'Alamir',             entity: 'Dealer A',      invoiceNumber: 'AL-2026-08-0048', amount:  1620.00, orderGpAmount:   389, orderGpPct: 24 },
    { id: 'PJX-BILL-8500', vendor: 'Alamir',             entity: 'Dealer A',      invoiceNumber: 'AL-2026-08-0055', amount:   980.00, orderGpAmount:   235, orderGpPct: 24 },
    // West Elm Contract · 2 bills
    { id: 'PJX-BILL-8501', vendor: 'West Elm Contract',  entity: 'Dealer A',      invoiceNumber: 'WEC-2026-0311',   amount:  4820.00, orderGpAmount:  1013, orderGpPct: 21 },
    { id: 'PJX-BILL-8502', vendor: 'West Elm Contract',  entity: 'Dealer A',      invoiceNumber: 'WEC-2026-0318',   amount:  2140.00, orderGpAmount:   449, orderGpPct: 21 },
    // Duplicate held · Nelson NLC-99120 · triggers the Compliance advisory
    { id: 'PJX-DUP-8499',  vendor: 'Nelson and Company', entity: 'Dealer A',      invoiceNumber: 'NLC-99120',       amount:  6720.00, orderGpAmount:  1546, orderGpPct: 23, duplicate: true },
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
    // F86.11 · Diego 2026-08-21 · CEO ask · group bills by vendor with
    // expand-to-detail so 100+ bills per vendor stay reviewable. Default
    // is collapsed · click a vendor row to expand its bills inline.
    const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set())
    const toggleVendor = (vendor: string) => {
        setExpandedVendors(prev => {
            const next = new Set(prev)
            if (next.has(vendor)) next.delete(vendor)
            else next.add(vendor)
            return next
        })
    }

    const releasable = BATCH.filter(b => !b.duplicate)
    const duplicateCount = BATCH.filter(b => b.duplicate).length

    // F86.11 · Vendor-level aggregation · sorted by total amount desc so
    // the biggest payments read first (that's where the risk lives).
    type VendorGroup = {
        vendor: string
        bills: PaymentRow[]
        billsCount: number
        amountTotal: number
        gpTotal: number
        gpPct: number
        heldCount: number
        approvedCount: number
        rejectedCount: number
        pendingCount: number
    }
    const vendorGroups: VendorGroup[] = useMemo(() => {
        const map = new Map<string, PaymentRow[]>()
        for (const row of BATCH) {
            const list = map.get(row.vendor) ?? []
            list.push(row)
            map.set(row.vendor, list)
        }
        const groups: VendorGroup[] = []
        for (const [vendor, bills] of map) {
            let amountTotal = 0, gpTotal = 0, heldCount = 0, approvedCount = 0, rejectedCount = 0, pendingCount = 0
            for (const b of bills) {
                amountTotal += b.amount
                gpTotal += b.orderGpAmount
                if (b.duplicate) heldCount += 1
                else {
                    const d = rowDecisions[b.id]
                    if (d === 'approved') approvedCount += 1
                    else if (d === 'rejected') rejectedCount += 1
                    else pendingCount += 1
                }
            }
            groups.push({
                vendor,
                bills,
                billsCount: bills.length,
                amountTotal,
                gpTotal,
                gpPct: amountTotal > 0 ? Math.round((gpTotal / amountTotal) * 100) : 0,
                heldCount, approvedCount, rejectedCount, pendingCount,
            })
        }
        groups.sort((a, b) => b.amountTotal - a.amountTotal)
        return groups
    }, [rowDecisions])
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

    // F86.11 · Diego 2026-08-21 · vendor-level bulk actions · flip every
    // non-held bill for a vendor to the same decision in one click.
    const setVendorDecision = (vendor: string, decision: RowDecision) => {
        if (stage !== 'idle') return
        setRowDecisions(prev => {
            const next = { ...prev }
            for (const b of BATCH) {
                if (b.vendor === vendor && !b.duplicate) next[b.id] = decision
            }
            return next
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
        return { cls: 'bg-primary/15 text-foreground', icon: <ShieldAlert className="h-3 w-3" aria-hidden="true" />, label: 'Pending Approver review' }
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
                        <DialogPanel className="w-full max-w-6xl my-auto bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
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

                            {/* F86.11 · Body · vendor-grouped queue · one row per vendor
                                with expand-to-detail · CEO ask · flat 300-bill list didn't
                                scale · vendors are the natural chunk. Minimalist aesthetic ·
                                ultra-thin dividers · muted status pastels · monospace meta ·
                                generous whitespace · Strata DS tokens throughout. */}
                            <div className="flex-1 overflow-y-auto">
                                {/* Column header · 8 columns · same grid as vendor + bill rows */}
                                <div className="grid grid-cols-[28px_1fr_140px_140px_140px_150px_140px] px-6 py-3 bg-muted/40 border-b border-border text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sticky top-0 z-10">
                                    <span></span>
                                    <span>Vendor / Bill</span>
                                    <span className="text-right">Bills</span>
                                    <span className="text-right">Amount</span>
                                    <span className="text-right">Order GP</span>
                                    <span className="text-right">Status</span>
                                    <span className="text-right">Actions</span>
                                </div>

                                <div className="divide-y divide-border">
                                    {vendorGroups.map(g => {
                                        const isExpanded = expandedVendors.has(g.vendor)
                                        const vendorLocked = stage !== 'idle'
                                        const releasableBills = g.billsCount - g.heldCount
                                        // Rollup status pill · consolidated view of the vendor
                                        const rolledStatus = (() => {
                                            if (g.approvedCount === releasableBills && releasableBills > 0)
                                                return { cls: 'bg-success/10 text-success', label: 'All approved' }
                                            if (g.rejectedCount === releasableBills && releasableBills > 0)
                                                return { cls: 'bg-destructive/10 text-destructive', label: 'All rejected' }
                                            if (g.approvedCount > 0 || g.rejectedCount > 0)
                                                return { cls: 'bg-info/10 text-info', label: `${g.approvedCount} ok · ${g.rejectedCount} no` }
                                            return { cls: 'bg-muted text-muted-foreground', label: 'Pending' }
                                        })()
                                        return (
                                            <div key={g.vendor}>
                                                {/* Vendor summary row · click to expand */}
                                                <button
                                                    type="button"
                                                    onClick={() => toggleVendor(g.vendor)}
                                                    className={`w-full grid grid-cols-[28px_1fr_140px_140px_140px_150px_140px] px-6 py-4 text-sm items-center text-left transition-colors ${isExpanded ? 'bg-muted/30' : 'hover:bg-muted/20'}`}
                                                    aria-expanded={isExpanded}
                                                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${g.vendor} bills`}
                                                >
                                                    <span className="text-muted-foreground">
                                                        {isExpanded ? <ChevronDown className="h-4 w-4" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <div className="text-foreground font-semibold truncate">{g.vendor}</div>
                                                        <div className="text-[11px] text-muted-foreground mt-0.5">
                                                            {g.billsCount} bill{g.billsCount === 1 ? '' : 's'}
                                                            {g.heldCount > 0 && <span className="text-warning"> · {g.heldCount} held</span>}
                                                        </div>
                                                    </div>
                                                    <span className="text-right text-muted-foreground tabular-nums">{g.billsCount}</span>
                                                    <span className="text-right text-foreground tabular-nums font-semibold">
                                                        ${g.amountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-right tabular-nums">
                                                        <span className="text-foreground font-semibold">${g.gpTotal.toLocaleString()}</span>
                                                        <span className="text-[11px] text-muted-foreground ml-1">{g.gpPct}%</span>
                                                    </span>
                                                    <span className="text-right">
                                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${rolledStatus.cls}`}>
                                                            {rolledStatus.label}
                                                        </span>
                                                    </span>
                                                    <div
                                                        className="flex items-center gap-1 justify-end"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => setVendorDecision(g.vendor, 'approved')}
                                                            disabled={vendorLocked || releasableBills === 0}
                                                            title="Approve all bills for this vendor"
                                                            aria-label={`Approve all bills for ${g.vendor}`}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-success bg-background hover:bg-success/10 border border-success/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setVendorDecision(g.vendor, 'rejected')}
                                                            disabled={vendorLocked || releasableBills === 0}
                                                            title="Reject all bills for this vendor"
                                                            aria-label={`Reject all bills for ${g.vendor}`}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-destructive bg-background hover:bg-destructive/10 border border-destructive/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setVendorDecision(g.vendor, 'pending')}
                                                            disabled={vendorLocked || (g.approvedCount + g.rejectedCount) === 0}
                                                            title="Reset all bills for this vendor to pending"
                                                            aria-label={`Reset ${g.vendor} to pending`}
                                                            className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground bg-background hover:text-foreground hover:bg-muted border border-border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                        >
                                                            <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </button>

                                                {/* Detail rows · indented per-bill · only when expanded */}
                                                {isExpanded && g.bills.map(row => {
                                                    const decision = rowDecisions[row.id]
                                                    const rowTint = row.duplicate
                                                        ? 'bg-warning/[0.04]'
                                                        : decision === 'approved'
                                                            ? 'bg-success/[0.04]'
                                                            : decision === 'rejected'
                                                                ? 'bg-destructive/[0.04]'
                                                                : 'bg-background'
                                                    const rowLocked = stage !== 'idle' || row.duplicate
                                                    return (
                                                        <div key={row.id} className={`grid grid-cols-[28px_1fr_140px_140px_140px_150px_140px] px-6 py-2.5 text-xs items-center border-t border-border/60 ${rowTint}`}>
                                                            <span></span>
                                                            <div className="min-w-0 pl-6">
                                                                <div className={`font-mono text-foreground ${decision === 'rejected' ? 'line-through text-muted-foreground' : ''}`}>
                                                                    {row.invoiceNumber}
                                                                </div>
                                                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                                                    {row.entity} · <span className="font-mono">{row.id}</span>
                                                                </div>
                                                            </div>
                                                            <span></span>
                                                            <div className={`text-right tabular-nums ${decision === 'rejected' ? 'text-muted-foreground line-through' : 'text-foreground'} font-semibold`}>
                                                                ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </div>
                                                            <div className={`text-right tabular-nums ${decision === 'rejected' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                                <span className="font-semibold">${row.orderGpAmount.toLocaleString()}</span>
                                                                <span className="text-[10px] text-muted-foreground ml-1">{row.orderGpPct}%</span>
                                                            </div>
                                                            <div className="text-right">
                                                                {row.duplicate ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-warning bg-warning/10 rounded-full px-2 py-0.5">Held</span>
                                                                ) : decision === 'approved' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-success bg-success/10 rounded-full px-2 py-0.5">
                                                                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                                                        Approved
                                                                    </span>
                                                                ) : decision === 'rejected' ? (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-destructive bg-destructive/10 rounded-full px-2 py-0.5">
                                                                        <XCircle className="h-3 w-3" aria-hidden="true" />
                                                                        Rejected
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Pending</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 justify-end">
                                                                {row.duplicate ? (
                                                                    <span className="text-[10px] text-muted-foreground italic">held</span>
                                                                ) : (decision === 'approved' || decision === 'rejected') ? (
                                                                    <button
                                                                        onClick={() => setDecision(row.id, 'pending')}
                                                                        disabled={rowLocked}
                                                                        aria-label={`Reset ${row.invoiceNumber}`}
                                                                        title="Reset to pending"
                                                                        className="inline-flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground bg-background hover:text-foreground hover:bg-muted border border-border transition-colors disabled:opacity-40"
                                                                    >
                                                                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        <button
                                                                            onClick={() => setDecision(row.id, 'approved')}
                                                                            disabled={rowLocked}
                                                                            aria-label={`Approve ${row.invoiceNumber}`}
                                                                            title="Approve this bill"
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-success bg-background hover:bg-success/10 border border-success/40 transition-colors disabled:opacity-40"
                                                                        >
                                                                            <Check className="h-3 w-3" aria-hidden="true" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setDecision(row.id, 'rejected')}
                                                                            disabled={rowLocked}
                                                                            aria-label={`Reject ${row.invoiceNumber}`}
                                                                            title="Reject this bill"
                                                                            className="inline-flex items-center justify-center h-6 w-6 rounded-md text-destructive bg-background hover:bg-destructive/10 border border-destructive/40 transition-colors disabled:opacity-40"
                                                                        >
                                                                            <X className="h-3 w-3" aria-hidden="true" />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Compliance advisory · sticky footer of the body area */}
                                <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
                                    <ShieldAlert className="h-4 w-4 text-warning mt-0.5 shrink-0" aria-hidden="true" />
                                    <span>
                                        <span className="text-foreground font-semibold">Duplicate-payment control · </span>
                                        Strata caught Nelson NLC-99120 matches last remittance (2026-07-08) · same invoice #, same amount, same vendor. Held for Compliance review before release.
                                    </span>
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
