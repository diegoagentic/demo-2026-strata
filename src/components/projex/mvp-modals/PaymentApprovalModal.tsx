/**
 * F84 · PaymentApprovalModal · used by F1 p1.3.
 *
 * Compliance approves the Tuesday ACH batch. Prod shape references:
 * expert-hub ComparisonReviewModal header (icon + short title + status pill
 * · muted meta strip · body scroll · footer with 3 primary actions).
 *
 * Zero decoration · zero KPI heros · zero warning banners. Modal overlay
 * positioning follows F83.S (z-[400] + md:pl-[336px]).
 */

import { Fragment, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import {
    Wallet, CheckCircle2, ShieldAlert, AlertTriangle, X, Loader2,
} from 'lucide-react'

interface PaymentApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    onApproved?: () => void
}

interface PaymentRow {
    id: string
    vendor: string
    entity: 'Projex Inc.' | 'Projex Corp.' | 'Culture LLC'
    invoiceNumber: string
    amount: number
    duplicate?: boolean
}

const BATCH: PaymentRow[] = [
    { id: 'PJX-BILL-8483', vendor: 'Teknion',            entity: 'Projex Inc.',  invoiceNumber: 'TEK-2026-0847', amount: 24429.06 },
    { id: 'PJX-BILL-8472', vendor: 'HBF',                entity: 'Projex Inc.',  invoiceNumber: 'HBF-24911',     amount: 12420.00 },
    { id: 'PJX-BILL-8473', vendor: 'Boss Design',        entity: 'Projex Inc.',  invoiceNumber: 'BDG-00-1928',   amount:  3855.40 },
    { id: 'PJX-BILL-8474', vendor: 'Alamir',             entity: 'Projex Corp.', invoiceNumber: 'AL-2026-08-0033', amount:  892.00 },
    { id: 'PJX-BILL-8475', vendor: 'Nelson and Company', entity: 'Projex Inc.',  invoiceNumber: 'NLC-99120',     amount:  6720.00 },
    { id: 'PJX-BILL-8476', vendor: 'Teknion',            entity: 'Projex Corp.', invoiceNumber: 'TEK-2026-0851', amount: 18240.55 },
    { id: 'PJX-BILL-8477', vendor: 'HBF',                entity: 'Projex Inc.',  invoiceNumber: 'HBF-24915',     amount:  2140.00 },
    { id: 'PJX-BILL-8480', vendor: 'Alamir',             entity: 'Culture LLC',  invoiceNumber: 'AL-2026-08-0041', amount:  445.00 },
    { id: 'PJX-DUP-8499',  vendor: 'Nelson and Company', entity: 'Projex Inc.',  invoiceNumber: 'NLC-99120',     amount:  6720.00, duplicate: true },
]

export default function PaymentApprovalModal({ isOpen, onClose, onApproved }: PaymentApprovalModalProps) {
    const [stage, setStage] = useState<'idle' | 'approving' | 'approved'>('idle')
    const releasable = BATCH.filter(b => !b.duplicate)
    const total = releasable.reduce((s, b) => s + b.amount, 0)
    const duplicateCount = BATCH.filter(b => b.duplicate).length

    const handleApprove = () => {
        if (stage !== 'idle') return
        setStage('approving')
        setTimeout(() => {
            setStage('approved')
            onApproved?.()
        }, 1200)
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-[400]">
                <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm" aria-hidden="true" />
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
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${stage === 'approved' ? 'bg-success/15 text-success' : 'bg-primary/15 text-foreground'}`}>
                                            {stage === 'approved'
                                                ? <><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Released</>
                                                : <><ShieldAlert className="h-3 w-3" aria-hidden="true" /> Pending CEO review</>}
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
                                    <span>Payables tab · Tue 08:15 AM</span>
                                    <span>·</span>
                                    <span>{releasable.length} bills</span>
                                    <span>·</span>
                                    <span className="tabular-nums text-foreground font-semibold">${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    <span>·</span>
                                    <span className="tabular-nums text-warning inline-flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                                        {duplicateCount} duplicate held
                                    </span>
                                </div>
                            </div>

                            {/* Body · payment queue table */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-[1fr_120px_140px_100px_100px] px-5 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                                    <span>Vendor</span>
                                    <span>Entity</span>
                                    <span>Invoice #</span>
                                    <span className="text-right">Amount</span>
                                    <span className="text-right">Status</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {BATCH.map(row => (
                                        <div key={row.id} className={`grid grid-cols-[1fr_120px_140px_100px_100px] px-5 py-3 text-xs items-center ${row.duplicate ? 'bg-warning/5' : ''}`}>
                                            <div>
                                                <div className="text-foreground font-semibold">{row.vendor}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono">{row.id}</div>
                                            </div>
                                            <div className="text-muted-foreground">{row.entity}</div>
                                            <div className="text-muted-foreground font-mono">{row.invoiceNumber}</div>
                                            <div className="text-right text-foreground tabular-nums font-semibold">${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                            <div className="text-right">
                                                {row.duplicate ? (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                                                        Held · duplicate
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground">Pending CEO</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
                                    <ShieldAlert className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
                                    <span>Duplicate-payment control · Strata caught Nelson NLC-99120 matches last remittance (2026-07-08) · same invoice #, same amount, same vendor. Held for Compliance review before release.</span>
                                </div>
                            </div>

                            {/* Footer · single primary approve */}
                            <div className="px-5 py-4 border-t border-border bg-muted/10 flex items-center gap-3">
                                <div className="text-xs text-muted-foreground flex-1">
                                    Human sign-off preserved · Strata prepares ACH entries · never auto-releases.
                                </div>
                                {stage === 'idle' && (
                                    <button
                                        onClick={handleApprove}
                                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        Approve ACH batch
                                    </button>
                                )}
                                {stage === 'approving' && (
                                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ai py-2 px-4">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                        Preparing ACH entries…
                                    </div>
                                )}
                                {stage === 'approved' && (
                                    <button
                                        onClick={onClose}
                                        className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-bold px-4 py-2 rounded-lg hover:opacity-80 transition-opacity"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                        Continue
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
