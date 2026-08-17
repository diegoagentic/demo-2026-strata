/**
 * COMPONENT: F4_p46_SnapshotAuditScene (Projex · p4.6)
 * PURPOSE: Post-release audit · SnapshotComparisonView tri-way match
 *          (draft = sent = NetSuite record) · ActivityTimeline per PO ·
 *          Tracking chips.
 *
 * SHAPE · tri-way match + activity timeline (F4 closing shape)
 * REUSE · UI-Dealer/po-conversion/SnapshotComparisonView + RevisionHistory (lifted)
 * NOTIF · dispatchea `projex:batch-audit-done` on advance
 */

import { useEffect, useState } from 'react'
import {
    CheckCircle2, GitCompare, Clock, FileText, ArrowRight, RotateCcw,
    Truck, Sparkles, Database, Loader2,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { MWH_PO_BATCH } from '../../../config/profiles/projex-data/mwhPif'

const AUDIT_EVENTS = [
    { id: '1', actor: 'Coordinator',   action: 'Released Teknion POs (3) via SIF Online',        time: '10:22 AM' },
    { id: '2', actor: 'Coordinator',   action: 'Released HBF POs (2) via HBF portal',            time: '10:24 AM' },
    { id: '3', actor: 'Coordinator',   action: 'Released Boss Design POs (2) via email',          time: '10:27 AM' },
    { id: '4', actor: 'Coordinator',   action: 'Released Alamir + Nelson + West Elm (4)',        time: '10:31 AM' },
    { id: '5', actor: 'Strata AI',  action: 'Snapshot recorded · 12 POs · draft vs sent match', time: '10:32 AM' },
    { id: '6', actor: 'Strata AI',  action: 'Tri-way match confirmed · NetSuite ledger updated', time: '10:33 AM' },
    { id: '7', actor: 'Strata AI',  action: 'Tracking initialized · awaiting first ACK',      time: 'just now' },
]

export default function F4_p46_SnapshotAuditScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { goToStep, steps } = useDemo()

    const [step, setStep] = useState<'analyzing' | 'ready'>('analyzing')

    useEffect(() => {
        const cancel = pauseAwareTimeout(() => {
            setStep('ready')
            window.dispatchEvent(new CustomEvent('projex:batch-audit-done'))
        }, 1500)
        return cancel
    }, [pauseAwareTimeout])

    const restart = () => {
        const first = steps.findIndex(s => s.id === 'p4.1')
        if (first >= 0) goToStep(first)
    }

    const totalSent = MWH_PO_BATCH.reduce((s, p) => s + p.amount, 0)

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_PO] },
        { sources: [PROJEX_SOURCES.TEKNION_ONLINE, PROJEX_SOURCES.VENDOR_PORTAL_HBF] },
        { sources: [PROJEX_SOURCES.SHAREPOINT_ACCT_PRIVATE] },
    ]

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F4</span>
                    <span>Order &amp; PO dispatch · step 6</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-success/10 text-success font-semibold rounded-md px-1.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Batch complete
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Coordinator release complete · SnapshotComparisonView tri-way match
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Draft = sent = NetSuite record. ActivityTimeline per PO. Tracking chips per vendor delivery state.
                </p>
            </div>

            {/* KPI summary hero */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-success/40 bg-success/5 p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">26/26</div>
                        <div className="text-[11px] text-muted-foreground mt-1">POs sent</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                        <GitCompare className="h-5 w-5 text-foreground" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">100%</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Tri-way match</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground tabular-nums leading-none">${(totalSent / 1000).toFixed(0)}k</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Dispatched · MWH</div>
                    </div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-ai-light flex items-center justify-center shrink-0">
                        <Sparkles className="h-5 w-5 text-ai" aria-hidden="true" />
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-foreground leading-none">~15m</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Total time (vs 2.5h)</div>
                    </div>
                </div>
            </div>

            {/* Tri-way match snapshot */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <GitCompare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        SnapshotComparisonView · tri-way match audit
                    </span>
                    {step === 'analyzing' ? (
                        <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-ai">
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                            Analyzing…
                        </span>
                    ) : (
                        <span className="ml-auto text-[10px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                            <CheckCircle2 className="h-3 w-3 inline mr-0.5" aria-hidden="true" />
                            All match
                        </span>
                    )}
                </div>
                <div className="p-4 grid grid-cols-3 gap-4">
                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Draft (Strata)</div>
                        <div className="text-lg font-bold text-foreground tabular-nums">26 POs</div>
                        <div className="text-xs text-muted-foreground">Total ${(totalSent / 1000).toFixed(1)}k</div>
                        <div className="text-[10px] text-muted-foreground">Auto-generated 08:14 AM</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Sent (Coordinator)</div>
                        <div className="text-lg font-bold text-foreground tabular-nums">26 POs</div>
                        <div className="text-xs text-muted-foreground">Total ${(totalSent / 1000).toFixed(1)}k</div>
                        <div className="text-[10px] text-muted-foreground">Released 10:22-10:31 AM</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">NetSuite record</div>
                        <div className="text-lg font-bold text-foreground tabular-nums">26 POs</div>
                        <div className="text-xs text-muted-foreground">Total ${(totalSent / 1000).toFixed(1)}k</div>
                        <div className="text-[10px] text-muted-foreground">Written to ledger 10:33 AM</div>
                    </div>
                </div>
                {step === 'ready' && (
                    <div className="px-4 py-3 border-t border-border bg-success/5 flex items-center gap-2 animate-in fade-in duration-300">
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                        <span className="text-xs text-foreground">All three sources match · no drift · audit complete</span>
                    </div>
                )}
            </div>

            {/* Audit timeline + delivery tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Activity timeline</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                        {AUDIT_EVENTS.map(e => {
                            const isAI = e.actor === 'Strata AI'
                            return (
                                <div key={e.id} className="flex items-start gap-3 border-b border-border/40 pb-2 last:border-0">
                                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                                        isAI ? 'bg-ai-light text-ai' : 'bg-primary/15 text-foreground'
                                    }`}>
                                        {isAI ? <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs text-foreground">
                                            <span className="font-semibold">{e.actor}</span>
                                            <span className="text-muted-foreground"> · {e.action}</span>
                                        </div>
                                        <div className="text-[10px] text-muted-foreground mt-0.5 tabular-nums">{e.time}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Delivery tracking chips */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Delivery tracking · per vendor</span>
                    </div>
                    <div className="p-4 space-y-2">
                        {[
                            { vendor: 'Teknion',      status: 'Received by portal · awaiting ACK', tone: 'ai' as const },
                            { vendor: 'HBF',          status: 'Received by portal · awaiting ACK', tone: 'ai' as const },
                            { vendor: 'Boss Design',  status: 'Email delivered · awaiting reply',  tone: 'ai' as const },
                            { vendor: 'Alamir',       status: 'Email delivered · awaiting reply',  tone: 'ai' as const },
                            { vendor: 'Nelson',       status: 'Email delivered · awaiting reply',  tone: 'ai' as const },
                            { vendor: 'West Elm',     status: 'Email delivered · awaiting reply',  tone: 'ai' as const },
                        ].map(v => (
                            <div key={v.vendor} className="flex items-center justify-between text-xs border-b border-border/40 pb-2 last:border-0">
                                <span className="text-foreground font-semibold">{v.vendor}</span>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                                    v.tone === 'ai' ? 'bg-ai-light text-ai' : 'bg-success/10 text-success'
                                }`}>
                                    <Database className="h-2.5 w-2.5" aria-hidden="true" />
                                    {v.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Advance + restart */}
            <div className="rounded-2xl border border-success/40 bg-success/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-sm">
                    <span className="text-foreground font-semibold">F4 order &amp; PO dispatch complete</span>
                    <span className="text-muted-foreground"> · MWH residential · 26 POs sent en ~15m (vs 2.5h manual). ACK monitoring active en F5.</span>
                </div>
                <button
                    onClick={restart}
                    className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Replay F4
                </button>
                <span className="text-[10px] text-muted-foreground">or F5 via sidebar switcher →</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            </div>

            <DataSourcesBar groups={dataGroups} label="Snapshot audit · tri-way match + delivery tracking" />
        </div>
    )
}
