/**
 * COMPONENT: F3_p36_NetSuiteSyncScene (Projex · p3.6)
 * PURPOSE: Two-phase scene · lands en el Dealer portal AR overview con la
 *          invoice recién posteada highlighted. Action Center dispatchea
 *          notif signalando que el post terminó · click drills into el GL
 *          sync detail (validating/creating/notifying + journal + audit).
 *
 *          Fix del user 2026-08-17: p3.6 antes arrancaba directo en el sync
 *          detail sin contexto. Ahora landing = Dealer portal view (donde
 *          Accounting revisa) · notif → drill-in a NetSuite GL entry.
 *
 * SHAPE · dealer portal AR overview (landing) → sync detail (drill-in)
 * REUSE · workspaces/GLCoreSyncScene pattern (3-step post con comment threads)
 * NOTIF · listens `projex:invoice-posted-open` → phase='detail'
 */

import { useEffect, useState } from 'react'
import {
    CheckCircle2, Loader2, Database, Sparkles, ArrowRight,
    RotateCcw, Clock, FileText, DollarSign, Eye, Building2, TrendingUp,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'

// Dealer portal AR overview · other recent invoices for context
interface PortalInvoice {
    id: string
    customer: string
    project: string
    amount: number
    status: 'Just posted' | 'Sent · awaiting payment' | 'Paid' | 'Overdue'
    posted: string
    highlight?: boolean
}

const PORTAL_INVOICES: PortalInvoice[] = [
    { id: 'PJX-INV-3421', customer: 'Fairport HQ',       project: 'phase 2 · 40% draw',       amount: 24500, status: 'Just posted',           posted: 'Just now',   highlight: true },
    { id: 'PJX-INV-3417', customer: 'MWH residential',   project: 'batch 1 · 40% draw',       amount: 47238, status: 'Sent · awaiting payment', posted: '2 days ago' },
    { id: 'PJX-INV-3410', customer: 'Denver Financial',  project: 'exec suite · 30% draw',    amount: 12420, status: 'Paid',                  posted: '5 days ago' },
    { id: 'PJX-INV-3399', customer: 'Kenwood Health',    project: 'Nurse Station · 40% draw', amount:  8420, status: 'Overdue',               posted: '42 days ago' },
]

const STATUS_STYLES: Record<PortalInvoice['status'], string> = {
    'Just posted':               'bg-ai-light text-ai border-ai/30',
    'Sent · awaiting payment':   'bg-info/10 text-info border-info/20',
    'Paid':                      'bg-success/10 text-success border-success/20',
    'Overdue':                   'bg-destructive/10 text-destructive border-destructive/30',
}

const SYNC_STEPS = [
    { id: 'validating', label: 'Validating proforma line items · Fairport HQ',        detail: '6 lines · $30,240 subtotal' },
    { id: 'creating',   label: 'Creating Customer Invoice in NetSuite · GL entry',    detail: 'Journal PJX-JE-2026-0842' },
    { id: 'notifying',  label: 'Notifying customer + logging to Communications tab',   detail: 'PDF filename · 2026-08-14_Fairport_INV-3421_24500' },
]

const AUDIT_TIMELINE = [
    { id: '1', actor: 'Strata AI',       action: 'Threshold trigger fired · Fairport 52% ordered',       time: '08:14 AM' },
    { id: '2', actor: 'Strata AI',       action: 'Drafted proforma PJX-INV-3421 · $24,500 · 40% draw',   time: '08:14 AM' },
    { id: '3', actor: 'Isabella Bressler', action: 'Reviewed line items · approved release',              time: '08:32 AM' },
    { id: '4', actor: 'Strata AI',       action: 'Validated GL account mapping · draft ready',           time: 'just now' },
    { id: '5', actor: 'Strata AI',       action: 'Posted Customer Invoice · GL journal entry',           time: 'just now' },
]

export default function F3_p36_NetSuiteSyncScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { goToStep, steps } = useDemo()

    // Two-phase: portal landing → drill-in to GL sync detail
    const [phase, setPhase] = useState<'portal' | 'detail'>('portal')
    const [stepIdx, setStepIdx] = useState(0)
    const [done, setDone] = useState(false)

    // Action Center CTA `Open GL sync detail →` transitions to detail phase
    useEffect(() => {
        const openDetail = () => setPhase('detail')
        window.addEventListener('projex:invoice-posted-open', openDetail)
        return () => window.removeEventListener('projex:invoice-posted-open', openDetail)
    }, [])

    // Sync choreography runs only in detail phase
    useEffect(() => {
        if (phase !== 'detail') return
        if (stepIdx < SYNC_STEPS.length) {
            const cancel = pauseAwareTimeout(() => setStepIdx(n => n + 1), 900)
            return cancel
        }
        if (!done) {
            const cancel = pauseAwareTimeout(() => {
                setDone(true)
                window.dispatchEvent(new CustomEvent('projex:invoice-posted'))
            }, 500)
            return cancel
        }
    }, [phase, stepIdx, done, pauseAwareTimeout])

    const restart = () => {
        const first = steps.findIndex(s => s.id === 'p3.1')
        if (first >= 0) goToStep(first)
    }

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_BILL] },
        { sources: [PROJEX_SOURCES.NETSUITE_GL] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_ACCT_PRIVATE] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F3</span>
                    <span>Progress billing · step 6</span>
                    <span className="text-muted-foreground/60">·</span>
                    {phase === 'portal' ? (
                        <span className="inline-flex items-center gap-1 bg-info/10 text-info font-semibold rounded-md px-1.5 py-0.5">
                            <Building2 className="h-3 w-3" aria-hidden="true" /> Dealer portal · Transactions
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 bg-success/10 text-success font-semibold rounded-md px-1.5 py-0.5">
                            <Database className="h-3 w-3" aria-hidden="true" /> NetSuite GL sync detail
                        </span>
                    )}
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    {phase === 'portal'
                        ? 'Dealer portal · Customer Invoices · just posted lands at the top'
                        : 'Customer Invoice posted · NetSuite GL journal entry created'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {phase === 'portal'
                        ? 'Invoice PJX-INV-3421 (Fairport 40% draw · $24,500) landed in the Dealer portal Transactions tab. Accounting reviews the sync detail from the Action Center notification · GL journal + audit trail visible on click.'
                        : 'Proforma → Customer Invoice transition · GL journal PJX-JE-2026-0842 · logged to Communications tab.'}
                </p>
            </div>

            {/* Portal landing view · Dealer Experience · Transactions */}
            {phase === 'portal' && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Transactions · Customer Invoices · {PORTAL_INVOICES.length} recent
                        </span>
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                            <Sparkles className="h-3 w-3 text-ai" aria-hidden="true" />
                            Just synced from NetSuite
                        </span>
                    </div>

                    {/* Column header */}
                    <div className="grid grid-cols-[110px_1fr_120px_140px_120px] px-4 py-2 bg-muted/20 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                        <span>Invoice #</span>
                        <span>Customer · Project</span>
                        <span className="text-right">Amount</span>
                        <span className="text-right">Status</span>
                        <span className="text-right">Posted</span>
                    </div>

                    {/* Rows */}
                    <ul className="divide-y divide-border">
                        {PORTAL_INVOICES.map(inv => (
                            <li
                                key={inv.id}
                                className={`
                                    relative grid grid-cols-[110px_1fr_120px_140px_120px] px-4 py-3 text-xs items-center transition-colors
                                    ${inv.highlight ? 'bg-ai-light/40 ring-1 ring-inset ring-ai/40 animate-in fade-in slide-in-from-top-1 duration-500' : 'hover:bg-muted/30'}
                                `}
                            >
                                {inv.highlight && (
                                    <div className="absolute inset-y-0 left-0 w-1 bg-ai animate-pulse" aria-hidden="true" />
                                )}
                                <span className="font-mono text-foreground font-semibold">{inv.id}</span>
                                <div className="min-w-0">
                                    <div className="text-foreground font-semibold truncate">{inv.customer}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{inv.project}</div>
                                </div>
                                <span className="text-right text-foreground tabular-nums font-semibold">
                                    ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-right">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded px-1.5 py-0.5 border ${STATUS_STYLES[inv.status]}`}>
                                        {inv.status === 'Just posted' && <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />}
                                        {inv.status}
                                    </span>
                                </span>
                                <span className="text-right text-[10px] font-mono text-muted-foreground">
                                    {inv.posted}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Portal footer · counters + drill-in CTA on highlighted row */}
                    <div className="px-4 py-3 border-t border-border bg-muted/20 flex items-center gap-3">
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-success" aria-hidden="true" />
                                <span className="text-foreground font-semibold">{PORTAL_INVOICES.filter(i => i.status === 'Just posted' || i.status === 'Sent · awaiting payment').length}</span> outstanding
                            </span>
                            <span className="text-muted-foreground/50">·</span>
                            <span><span className="text-foreground font-semibold">${PORTAL_INVOICES.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0).toLocaleString()}</span> AR balance</span>
                        </div>
                        <button
                            onClick={() => setPhase('detail')}
                            className="ml-auto inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                        >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            Open GL sync detail
                        </button>
                    </div>
                </div>
            )}

            {phase === 'detail' && (<>
            {/* Sync steps card */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    {done ? (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    ) : (
                        <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />
                    )}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        NetSuite sync · PJX-INV-3421
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground">Live</span>
                </div>
                <div className="p-4 space-y-2">
                    {SYNC_STEPS.map((s, i) => {
                        const isDone = i < stepIdx
                        const isRunning = i === stepIdx && !done
                        return (
                            <div
                                key={s.id}
                                className={`
                                    flex items-start gap-2 border-l-2 pl-3 py-1
                                    ${isDone ? 'border-l-success' : isRunning ? 'border-l-ai' : 'border-l-border'}
                                    ${!isDone && !isRunning ? 'opacity-40' : ''}
                                `}
                            >
                                <div className="shrink-0 mt-0.5">
                                    {isDone && <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />}
                                    {isRunning && <Loader2 className="h-4 w-4 text-ai animate-spin" aria-hidden="true" />}
                                    {!isDone && !isRunning && <span className="h-4 w-4 rounded-full border border-border block" aria-hidden="true" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm ${isRunning ? 'text-foreground font-semibold' : isDone ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {s.label}
                                    </div>
                                    {(isDone || isRunning) && (
                                        <div className="text-[11px] text-muted-foreground mt-0.5">{s.detail}</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Layout · GL journal preview (izq) + activity timeline (der) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 items-start">

                {/* GL journal preview */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            NetSuite GL · journal entry PJX-JE-2026-0842
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Invoice #</div>
                                <div className="text-foreground font-mono font-semibold mt-0.5">PJX-INV-3421</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Customer</div>
                                <div className="text-foreground mt-0.5">Fairport HQ · phase 2</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Terms</div>
                                <div className="text-foreground mt-0.5">Net 10 · 1.5%/mo late</div>
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Due date</div>
                                <div className="text-foreground mt-0.5 tabular-nums">2026-08-24</div>
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">GL entries</div>
                            <div className="space-y-1.5 text-xs">
                                <div className="grid grid-cols-[1fr_100px_100px] gap-2 pb-1 border-b border-border/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                                    <span>Account</span>
                                    <span className="text-right">Debit</span>
                                    <span className="text-right">Credit</span>
                                </div>
                                <div className="grid grid-cols-[1fr_100px_100px] gap-2 py-1">
                                    <span className="text-foreground">1200 · Accounts Receivable</span>
                                    <span className="text-right text-foreground tabular-nums font-semibold">$24,500</span>
                                    <span className="text-right text-muted-foreground">—</span>
                                </div>
                                <div className="grid grid-cols-[1fr_100px_100px] gap-2 py-1">
                                    <span className="text-foreground">4100 · Furniture Sales Revenue</span>
                                    <span className="text-right text-muted-foreground">—</span>
                                    <span className="text-right text-foreground tabular-nums font-semibold">$24,500</span>
                                </div>
                                <div className="grid grid-cols-[1fr_100px_100px] gap-2 pt-2 border-t border-border">
                                    <span className="text-foreground font-bold">Total</span>
                                    <span className="text-right text-foreground font-bold tabular-nums">$24,500</span>
                                    <span className="text-right text-foreground font-bold tabular-nums">$24,500</span>
                                </div>
                            </div>
                        </div>

                        {done && (
                            <div className="animate-in fade-in duration-500 flex items-center gap-2 text-[11px] bg-success/5 border border-success/30 rounded-lg px-3 py-2">
                                <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                                <span className="text-foreground">Journal balanced · posted to NetSuite GL · Communications tab has PDF attached</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity timeline */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Audit trail · state transitions
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        {AUDIT_TIMELINE.map((entry, i) => {
                            const isVisible = done || i < stepIdx + 2
                            const isAiEntry = entry.actor === 'Strata AI'
                            return (
                                <div key={entry.id} className={`flex items-start gap-3 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-30'}`}>
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                                        isAiEntry ? 'bg-ai-light text-ai' : 'bg-primary/15 text-foreground'
                                    }`}>
                                        {isAiEntry ? (
                                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-foreground">
                                            <span className="font-semibold">{entry.actor}</span>
                                            <span className="text-muted-foreground"> · {entry.action}</span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{entry.time}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Advance/restart CTA when done */}
            {done && (
                <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <FileText className="h-5 w-5 text-success" aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-sm">
                        <span className="text-foreground font-semibold">F3 progress billing complete</span>
                        <span className="text-muted-foreground"> · Fairport 40% draw posted · collections queue moved 2 accounts · shared board updated for Alec.</span>
                    </div>
                    <button
                        onClick={restart}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" />
                        Replay F3
                    </button>
                    <span className="text-[10px] text-muted-foreground">or advance via sidebar flow-switcher →</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
                </div>
            )}

            {/* Deposit context strip */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Cash flow forward</div>
                    <div className="text-muted-foreground mt-0.5">$24,500 due Aug 24 · adds to collections tracker · next threshold (80% ordered · 10% retention) fires in ~4 weeks per current forecast.</div>
                </div>
            </div>
            </>)}

            <DataSourcesBar groups={dataGroups} label="GL sync · NetSuite Bill → NetSuite GL → SharePoint mirror" />
        </div>
    )
}
