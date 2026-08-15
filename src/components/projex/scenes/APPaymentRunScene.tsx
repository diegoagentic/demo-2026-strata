/**
 * COMPONENT: APPaymentRunScene (Projex · p1.5)
 * PURPOSE: Tuesday payment run · 47 bills queued (Tue = big batch · Thu = one-offs).
 *          Jacob's twice-weekly financial dashboard (payables tab + AR aging tab)
 *          surfaces the batch to Matt Magrann (CEO) for approval. Matt clicks
 *          Approve · Strata prepares ACH entries but does NOT release · the
 *          ACH workaround stays visible (NetSuite → bank ACH batch never delivered
 *          · Jacob still enters remittance detail manually in the bank portal ·
 *          Strata compares last remittance to prevent duplicate payment).
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-warning/10 +
 *            text-warning · bg-success/10 + text-success · border-border ·
 *            ring-2 ring-primary (approve spotlight) · tabular-nums
 *
 * SOURCE OF TRUTH: _SOT_projex.md §12a · CEO verbatim "75% AI + human touch" ·
 *                  ACH workaround preserved · duplicate-payment control
 * REUSE FROM: mbi/NonEDIReconcilerScene.tsx (row status transition) ·
 *             bfi/BFIProcessKanban.tsx (highlight pulse) · Banner cue pattern
 */

import { useState } from 'react'
import {
    Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight,
    Wallet, Building2, User, Info, Clock,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

interface PaymentRow {
    id: string
    vendor: string
    entity: 'Projex Inc.' | 'Projex Corp.' | 'Culture LLC'
    invoiceNumber: string
    amount: number
    method: 'ACH' | 'Check'
    lastPaid: string
    // For dedup check
    lastRemittanceMatches?: boolean
}

const PAYMENT_QUEUE: PaymentRow[] = [
    { id: 'PJX-BILL-8471', vendor: 'Teknion',             entity: 'Projex Inc.',  invoiceNumber: 'TEK-2026-0847', amount: 47238.11, method: 'ACH', lastPaid: '2026-07-29' },
    { id: 'PJX-BILL-8472', vendor: 'HBF',                 entity: 'Projex Inc.',  invoiceNumber: 'HBF-24911',     amount: 12420.00, method: 'ACH', lastPaid: '2026-07-15' },
    { id: 'PJX-BILL-8473', vendor: 'Boss Design',         entity: 'Projex Inc.',  invoiceNumber: 'BDG-00-1928',   amount:  3855.40, method: 'ACH', lastPaid: '2026-07-01' },
    { id: 'PJX-BILL-8474', vendor: 'Alamir',              entity: 'Projex Corp.', invoiceNumber: 'AL-2026-08-0033', amount:  892.00, method: 'ACH', lastPaid: '2026-06-24' },
    { id: 'PJX-BILL-8475', vendor: 'Nelson and Company',  entity: 'Projex Inc.',  invoiceNumber: 'NLC-99120',     amount:  6720.00, method: 'ACH', lastPaid: '2026-07-08' },
    { id: 'PJX-BILL-8476', vendor: 'Teknion',             entity: 'Projex Corp.', invoiceNumber: 'TEK-2026-0851', amount: 18240.55, method: 'ACH', lastPaid: '2026-07-29' },
    { id: 'PJX-BILL-8477', vendor: 'HBF',                 entity: 'Projex Inc.',  invoiceNumber: 'HBF-24915',     amount:  2140.00, method: 'ACH', lastPaid: '2026-07-15' },
    { id: 'PJX-BILL-8480', vendor: 'Alamir',              entity: 'Culture LLC',  invoiceNumber: 'AL-2026-08-0041', amount:  445.00, method: 'ACH', lastPaid: '2026-06-24' },
    { id: 'PJX-DUP-8499',  vendor: 'Nelson and Company',  entity: 'Projex Inc.',  invoiceNumber: 'NLC-99120',     amount:  6720.00, method: 'ACH', lastPaid: '2026-07-08', lastRemittanceMatches: true },
]

export default function APPaymentRunScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    const matt = PROJEX_PERSONAS.matt
    const jacob = PROJEX_PERSONAS.jacob

    // Approval choreography · idle → approving → approved
    const [stage, setStage] = useState<'idle' | 'approving' | 'approved'>('idle')

    const handleApprove = () => {
        if (stage !== 'idle') return
        setStage('approving')
        pauseAwareTimeout(() => setStage('approved'), 1400)
    }

    const totalAmount = PAYMENT_QUEUE
        .filter(r => !r.lastRemittanceMatches)
        .reduce((s, r) => s + r.amount, 0)

    const dupCount = PAYMENT_QUEUE.filter(r => r.lastRemittanceMatches).length
    const cleanCount = PAYMENT_QUEUE.length - dupCount

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_BILL, PROJEX_SOURCES.NETSUITE_VENDOR] },
        { sources: [PROJEX_SOURCES.FINANCIAL_DASHBOARD] },
        { sources: [PROJEX_SOURCES.BANK_PORTAL] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F1</span>
                    <span>AP intake &amp; matching · step 5</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-primary/15 text-foreground font-semibold rounded-md px-1.5 py-0.5">
                        <User className="h-3 w-3" aria-hidden="true" /> CEO gate
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Tue payment run · dashboard review · Matt approves the ACH batch
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Tuesday = big batch · Thursday = one-offs. {jacob.fullName.split(' ')[0]}'s twice-weekly financial dashboard surfaces the queue to {matt.fullName.split(' ')[0]} · human sign-off is preserved on purpose.
                </p>
            </div>

            {/* CEO framing banner */}
            <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/25 text-foreground flex items-center justify-center shrink-0 font-bold text-xs">
                    {matt.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CEO · Matt Magrann · verbatim</div>
                    <div className="text-sm text-foreground italic mt-0.5">"75% AI with the human touch on it."</div>
                </div>
            </div>

            {/* Dashboard hero · payables tab */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Financial dashboard · Payables tab</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">Tue 08:15 AM · CEO review</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border-b border-border">
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Bills queued</div>
                        <div className="text-xl font-semibold text-foreground tabular-nums mt-1">{PAYMENT_QUEUE.length}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total to release</div>
                        <div className="text-xl font-semibold text-foreground tabular-nums mt-1">
                            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Clean · ready</div>
                        <div className="text-xl font-semibold text-success tabular-nums mt-1">{cleanCount}</div>
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Duplicate flags</div>
                        <div className="text-xl font-semibold text-warning tabular-nums mt-1">{dupCount}</div>
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border">
                    <div className="grid grid-cols-[24px_1fr_120px_140px_100px_80px_120px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground">
                        <span></span>
                        <span>Vendor</span>
                        <span>Entity</span>
                        <span>Invoice #</span>
                        <span className="text-right">Amount</span>
                        <span>Method</span>
                        <span className="text-right">Status</span>
                    </div>
                    {PAYMENT_QUEUE.map(row => {
                        const isDup = row.lastRemittanceMatches
                        return (
                            <div
                                key={row.id}
                                className={`
                                    grid grid-cols-[24px_1fr_120px_140px_100px_80px_120px] px-4 py-2 text-xs items-center
                                    transition-colors
                                    ${isDup ? 'bg-warning/5' : ''}
                                    ${stage === 'approved' && !isDup ? 'bg-success/5' : ''}
                                `}
                            >
                                <span>
                                    {isDup
                                        ? <AlertTriangle className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                                        : stage === 'approved'
                                          ? <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                                          : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 inline-block ml-1" aria-hidden="true" />
                                    }
                                </span>
                                <span className="text-foreground font-medium truncate">{row.vendor}</span>
                                <span className="text-muted-foreground truncate">{row.entity}</span>
                                <span className="text-foreground font-mono text-[11px] truncate">{row.invoiceNumber}</span>
                                <span className="text-right text-foreground tabular-nums font-semibold">
                                    ${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-muted-foreground">{row.method}</span>
                                <span className="text-right">
                                    {isDup && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                                            Held · duplicate
                                        </span>
                                    )}
                                    {!isDup && stage === 'approved' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                                            Approved
                                        </span>
                                    )}
                                    {!isDup && stage !== 'approved' && (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                                            Pending Matt
                                        </span>
                                    )}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Duplicate control callout */}
                {dupCount > 0 && (
                    <div className="px-4 py-3 border-t border-warning/30 bg-warning/5 flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                        <div className="flex-1 min-w-0 text-[11px]">
                            <div className="text-foreground font-semibold">Duplicate-payment control · caught by Strata</div>
                            <div className="text-muted-foreground mt-0.5">
                                Nelson NLC-99120 matches the last remittance sent 2026-07-08 · same invoice #, same amount, same vendor. Held for Jacob review before release.
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CEO approval card · spotlight ring when idle */}
            <div className={`
                rounded-xl border p-4 flex items-center gap-3 transition-all
                ${stage === 'idle' ? 'border-primary ring-2 ring-primary/40 bg-primary/5 animate-pulse' : ''}
                ${stage === 'approving' ? 'border-ai bg-ai-light/20' : ''}
                ${stage === 'approved' ? 'border-success/40 bg-success/5' : ''}
            `}>
                <div className={`
                    h-12 w-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
                    ${stage === 'approved' ? 'bg-success/15 text-success' : 'bg-primary/15 text-foreground'}
                `}>
                    {matt.initials}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Human sign-off · CEO approval gate</div>
                    <div className="text-sm text-foreground font-semibold mt-0.5">
                        {matt.fullName} · release {cleanCount} bills · ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        Approval is a decision · Strata prepares ACH entries but never releases without human click.
                    </div>
                </div>
                {stage === 'idle' && (
                    <button
                        onClick={handleApprove}
                        className="shrink-0 inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-bold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Approve payment run
                    </button>
                )}
                {stage === 'approving' && (
                    <div className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-ai animate-pulse">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                        Preparing ACH entries…
                    </div>
                )}
                {stage === 'approved' && (
                    <div className="shrink-0 flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-success">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            Approved · queued for bank portal
                        </div>
                        <button
                            onClick={nextStep}
                            className="inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                        >
                            Save bill in NetSuite
                            <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                    </div>
                )}
            </div>

            {/* ACH workaround banner · preserved by design */}
            <div className="rounded-xl border border-warning/40 bg-warning/5 px-4 py-3 flex items-start gap-3">
                <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">ACH workaround preserved (Phase 1)</div>
                    <div className="text-muted-foreground mt-0.5 leading-relaxed">
                        NetSuite → bank ACH batch upload was never delivered · Jacob still enters remittance detail manually in the bank portal. Strata compares the last remittance to prevent duplicate payment (see Nelson row above). Phase 2 · consider a bank portal RPA once Jacob signs off write permissions.
                    </div>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning/10 rounded px-1.5 py-0.5">
                    <Building2 className="h-3 w-3" aria-hidden="true" />
                    Manual step
                </span>
            </div>

            {/* Cadence footer */}
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <span className="text-foreground font-semibold">Payment cadence · Tue big batch · Thu one-offs</span>
                    <span className="text-muted-foreground"> · ~50 ACH per Tuesday · dashboard review with CEO twice weekly.</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>

            <DataSourcesBar groups={dataGroups} label="Payment run · dashboard → ACH portal" />
        </div>
    )
}
