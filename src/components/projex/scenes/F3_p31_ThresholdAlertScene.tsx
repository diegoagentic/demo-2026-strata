/**
 * COMPONENT: F3_p31_ThresholdAlertScene (Projex · p3.1)
 * PURPOSE: Auto. Live billing forecast chart · Fairport HQ phase 2 crosses 50%
 *          ordered en W32 · Strata fires threshold trigger · animates chart ·
 *          drafts proforma PJX-INV-3421 ($24,500 · 40% draw). Isabella receives
 *          alert en Action Center. Threshold-forward-looking · NO KPI-hero opener.
 *
 *          Shape LOCK · threshold-chart bar+line (F3 primary shape start).
 *
 * DS TOKENS: bg-card · bg-primary + text-primary-foreground · bg-ai-light + text-ai ·
 *            bg-success/10 · bg-warning/10 · border-border · tabular-nums
 *
 * SOURCE OF TRUTH: SOT §12c · FC11 progress judgment · Net 10 + 1.5%/mo late fee
 * REUSE FROM: mbi/LiveBillingForecast pattern (composed chart bar+line) ·
 *             mbi/LiveBudgetProgressBar (segmented bar + thresholds)
 *
 * NOTIF: dispatchea `projex:threshold-crossed` on trigger → advance p3.2
 */

import { useEffect, useState } from 'react'
import {
    Sparkles, TrendingUp, CheckCircle2, Loader2, AlertTriangle,
    ArrowRight, DollarSign, Percent, Building2, Target,
} from 'lucide-react'
import { useDemo } from '../../../context/DemoContext'
import { usePauseAware } from '../../../context/usePauseAware'
import DataSourcesBar, { type DataSourceGroup } from '../../mbi/DataSourcesBar'
import { PROJEX_PERSONAS } from '../../../config/profiles/projex-data/personas'
import { PROJEX_SOURCES } from '../../../config/profiles/projex-data/netsuiteSources'
import { FAIRPORT_FORECAST, PROJEX_MILESTONES } from '../../../config/profiles/projex-data/arAging'

export default function F3_p31_ThresholdAlertScene() {
    const { pauseAwareTimeout } = usePauseAware()
    const { nextStep } = useDemo()
    // Persona reference for context strip
    const isabellaName = PROJEX_PERSONAS.isabella.fullName.split(' ')[0]

    // Chart phase · animate bars up + threshold trigger cuando pass 50
    const [phase, setPhase] = useState<'building' | 'crossing' | 'drafted'>('building')

    useEffect(() => {
        const c1 = pauseAwareTimeout(() => setPhase('crossing'), 1800)
        const c2 = pauseAwareTimeout(() => {
            setPhase('drafted')
            window.dispatchEvent(new CustomEvent('projex:threshold-crossed'))
        }, 3000)
        return () => { c1(); c2() }
    }, [pauseAwareTimeout])

    const fairport = PROJEX_MILESTONES.find(m => m.project.includes('Fairport'))!
    const currentOrderedPct = phase === 'building' ? 49 : 52 // crossing 50 animates in

    const dataGroups: DataSourceGroup[] = [
        { sources: [PROJEX_SOURCES.NETSUITE_PO, PROJEX_SOURCES.NETSUITE_BILL] },
        { sources: [PROJEX_SOURCES.STRATA_AI_PJX] },
        { sources: [PROJEX_SOURCES.FINANCIAL_DASHBOARD] },
    ]

    // Chart geometry
    const CHART_HEIGHT = 200
    const maxValue = 100 // % scale
    const bars = FAIRPORT_FORECAST

    return (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-mono text-muted-foreground mb-1">
                    <span className="rounded bg-primary/15 text-foreground font-semibold px-1.5 py-0.5">F3</span>
                    <span>Progress billing · step 1</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="inline-flex items-center gap-1 bg-ai-light text-ai rounded-md px-1.5 py-0.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" /> Auto · live forecast
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                    Threshold alert · Fairport phase 2 crosses 50% ordered
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Furniture 50/40/10 · Strata watches PO/SO ratio · fires 40% draw the moment threshold crosses. Was invisible until Isabella spotted it in memory.
                </p>
            </div>

            {/* Threshold banner · dominant */}
            <div className={`
                rounded-2xl border p-4 flex items-start gap-3 transition-all
                ${phase === 'building' ? 'border-border bg-card' : ''}
                ${phase === 'crossing' ? 'border-warning/40 bg-warning/5 animate-pulse' : ''}
                ${phase === 'drafted' ? 'border-primary/40 bg-primary/5' : ''}
            `}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    phase === 'drafted' ? 'bg-success/15 text-success' : 'bg-primary/15 text-foreground'
                }`}>
                    <Target className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Billing threshold · Furniture 50/40/10</div>
                    <div className="text-sm text-foreground font-semibold mt-0.5">
                        Fairport HQ · phase 2 · <span className="tabular-nums">{currentOrderedPct}%</span> ordered
                        {phase !== 'building' && <span className="ml-2 text-warning">· crossed 50% threshold</span>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                        {fairport.nextMilestoneName}
                    </div>
                </div>
                {phase === 'building' && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        Watching…
                    </span>
                )}
                {phase === 'crossing' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ai">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                        Drafting proforma…
                    </span>
                )}
                {phase === 'drafted' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success bg-success/10 rounded px-1.5 py-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        PJX-INV-3421 · $24,500 draft ready
                    </span>
                )}
            </div>

            {/* Chart · bar+line forecast */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Live billing forecast · Fairport HQ phase 2 · last 12 weeks
                    </span>
                    <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
                        Total value ${fairport.totalValue.toLocaleString()}
                    </span>
                </div>
                <div className="p-4">
                    {/* Chart legend */}
                    <div className="flex items-center gap-4 mb-4 text-xs">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-primary" aria-hidden="true" />
                            <span className="text-muted-foreground">Ordered %</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-ai" aria-hidden="true" />
                            <span className="text-muted-foreground">Shipped %</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-success" aria-hidden="true" />
                            <span className="text-muted-foreground">Invoiced %</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 ml-auto">
                            <span className="w-4 h-0.5 bg-warning" aria-hidden="true" />
                            <span className="text-muted-foreground">50% threshold</span>
                        </span>
                    </div>

                    {/* Chart area */}
                    <div className="relative" style={{ height: CHART_HEIGHT }}>
                        {/* Threshold line · 50% */}
                        <div
                            className="absolute left-0 right-0 border-t-2 border-dashed border-warning z-10"
                            style={{ top: `${((maxValue - 50) / maxValue) * 100}%` }}
                        >
                            <span className="absolute -top-2 right-0 text-[9px] font-bold text-warning bg-background px-1">50%</span>
                        </div>

                        {/* Bars grid */}
                        <div className="absolute inset-0 flex items-end gap-1">
                            {bars.map((b, i) => {
                                const isLast = i === bars.length - 1
                                const isCrossing = i >= bars.length - 2 && phase !== 'building'
                                return (
                                    <div key={b.week} className="flex-1 flex flex-col items-center gap-0.5">
                                        {/* Stacked bars */}
                                        <div className="w-full flex items-end justify-center gap-0.5" style={{ height: '85%' }}>
                                            {/* Ordered */}
                                            <div
                                                className={`w-2 rounded-t transition-all duration-500 ${
                                                    isLast && phase === 'drafted' ? 'bg-primary shadow-glow' : 'bg-primary'
                                                } ${isCrossing ? 'animate-pulse' : ''}`}
                                                style={{ height: `${(b.ordered / maxValue) * 100}%` }}
                                                title={`Ordered ${b.ordered}%`}
                                            />
                                            {/* Shipped */}
                                            <div
                                                className="w-2 rounded-t bg-ai transition-all duration-500"
                                                style={{ height: `${(b.shipped / maxValue) * 100}%` }}
                                                title={`Shipped ${b.shipped}%`}
                                            />
                                            {/* Invoiced */}
                                            <div
                                                className="w-2 rounded-t bg-success transition-all duration-500"
                                                style={{ height: `${(b.invoiced / maxValue) * 100}%` }}
                                                title={`Invoiced ${b.invoiced}%`}
                                            />
                                        </div>
                                        <span className={`text-[9px] font-mono tabular-nums ${
                                            isLast ? 'text-foreground font-bold' : 'text-muted-foreground'
                                        }`}>
                                            {b.week}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-xs">
                        <div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Now (W33)</div>
                            <div className="text-foreground tabular-nums font-semibold">Ordered {currentOrderedPct}% · Shipped 18% · Invoiced 40%</div>
                        </div>
                        <div className="ml-auto">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next threshold</div>
                            <div className="text-foreground tabular-nums font-semibold">80% ordered · fires final 10% retention</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proforma draft summary + advance CTA */}
            {phase === 'drafted' && (
                <div className="rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="h-10 w-10 rounded-xl bg-primary/15 text-foreground flex items-center justify-center shrink-0">
                        <DollarSign className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Draft proforma ready</div>
                        <div className="text-sm text-foreground font-semibold mt-0.5">
                            PJX-INV-3421 · Fairport HQ · 40% draw · <span className="tabular-nums">$24,500</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                            Isabella to review + adjust line items + release · never auto-post.
                        </div>
                    </div>
                    <button
                        onClick={nextStep}
                        className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold rounded-lg bg-foreground text-background py-2 px-3 hover:opacity-80 transition-opacity"
                    >
                        Open proforma
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Other active thresholds mini · MWH + NCBA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PROJEX_MILESTONES.map(m => (
                    <div key={m.project} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                            <span className="text-xs font-semibold text-foreground truncate">{m.project}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{m.department} {m.structure}</div>
                        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    m.project.includes('Fairport') && phase === 'drafted' ? 'bg-warning' : 'bg-primary'
                                }`}
                                style={{ width: `${m.orderedPct}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-[11px] mt-2 text-muted-foreground">
                            <span className="tabular-nums">{m.orderedPct}% ordered</span>
                            <span className="tabular-nums">${(m.totalValue / 1000).toFixed(0)}k</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Context strip */}
            <div className="rounded-2xl border border-border bg-muted/20 px-4 py-3 flex items-start gap-3">
                <Percent className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0 text-xs">
                    <div className="text-foreground font-semibold">Why threshold alert matters (FC11)</div>
                    <div className="text-muted-foreground mt-0.5">
                        Today {isabellaName} runs 50/40/10 milestones from memory · misses fire opportunities. Strata watches PO cost vs sales-order cost · surfaces the moment ratio crosses. Progress-billing heuristic ~50% ordered (large) / ~90% (small) is now automated.
                    </div>
                </div>
            </div>

            <DataSourcesBar groups={dataGroups} label="Threshold forecast · NetSuite ratio → Strata trigger → proforma draft" />
        </div>
    )
}
